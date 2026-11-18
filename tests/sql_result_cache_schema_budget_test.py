#!/usr/bin/env python3
"""SQL result-cache schemas and input-table sets must stay inside max_size.

A caller who can POST /v1/sql can mint a distinct Arrow schema per statement.
Those schemas, and the input-table sets recorded with them, are retained by the
results cache but are not charged to caching.sql_results.max_size. These tests
assert the budget the runtime claims to enforce: while the entries are still
live, charged entry bytes plus the schema and table-set pools (values and
bookkeeping) stay at or under that maximum.

They fail on the runtime that leaves those pools outside the budget. Point
SPICED at the spiced binary under test.

Flight SQL reaches the same results-cache store through the same query
execution path as POST /v1/sql; this file drives the HTTP entry. The search
results cache omits interned schemas from its entry weight as well, but a
full-text query whose column name is already larger than the search budget is
rejected before an entry is retained, so that route is not what these tests
drive. The embeddings cache does not intern Arrow schemas.
"""

from __future__ import annotations

import os
import signal
import socket
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

SPICED = os.environ.get("SPICED", "spiced")

# Gauges that the cache guide counts as resident cache memory.
CHARGED = "results_cache_size_bytes"
MAX = "results_cache_max_size_bytes"


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def parse_metrics(body: str) -> dict[str, float]:
    values: dict[str, float] = {}
    for line in body.splitlines():
        if not line or line.startswith("#"):
            continue
        name, _, rest = line.partition(" ")
        name = name.split("{", 1)[0]
        try:
            values[name] = float(rest.split()[0])
        except (IndexError, ValueError):
            continue
    return values


class Runtime:
    def __init__(self, root: Path, spicepod: str) -> None:
        self.root = root
        (root / "spicepod.yaml").write_text(spicepod)
        self.http = free_port()
        self.flight = free_port()
        self.metrics_port = free_port()
        log_path = root / "spiced.log"
        self._log = log_path.open("w")
        self.proc = subprocess.Popen(
            [
                SPICED,
                "--http",
                f"127.0.0.1:{self.http}",
                "--flight",
                f"127.0.0.1:{self.flight}",
                "--metrics",
                f"127.0.0.1:{self.metrics_port}",
                str(root),
            ],
            stdout=self._log,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )

    def close(self) -> None:
        if self.proc.poll() is None:
            os.killpg(self.proc.pid, signal.SIGTERM)
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(self.proc.pid, signal.SIGKILL)
                self.proc.wait(timeout=5)
        self._log.close()

    def log_text(self) -> str:
        return (self.root / "spiced.log").read_text(errors="replace")

    def wait_ready(self, timeout: float = 60) -> None:
        deadline = time.monotonic() + timeout
        url = f"http://127.0.0.1:{self.http}/v1/ready"
        while time.monotonic() < deadline:
            if self.proc.poll() is not None:
                raise RuntimeError(f"spiced exited\n{self.log_text()[-4000:]}")
            try:
                with urllib.request.urlopen(url, timeout=1) as resp:
                    if resp.status == 200:
                        return
            except (urllib.error.URLError, TimeoutError):
                time.sleep(0.1)
        raise RuntimeError(f"runtime did not become ready\n{self.log_text()[-4000:]}")

    def sql(self, statement: str) -> tuple[int, dict[str, str], bytes]:
        req = urllib.request.Request(
            f"http://127.0.0.1:{self.http}/v1/sql",
            data=statement.encode(),
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return resp.status, {k.lower(): v for k, v in resp.headers.items()}, resp.read()
        except urllib.error.HTTPError as exc:
            body = exc.read()
            raise AssertionError(
                f"POST /v1/sql failed: {exc.code} {body[:500]!r}"
            ) from exc

    def metrics(self) -> dict[str, float]:
        with urllib.request.urlopen(
            f"http://127.0.0.1:{self.metrics_port}/metrics", timeout=10
        ) as resp:
            return parse_metrics(resp.read().decode())


def assert_within_budget(runtime: Runtime, label: str) -> None:
    """Pool values and the charged entry total must each fit in max_size.

    Adding the two together would keep failing after a fix that bills a schema
    on its entry and still reports it from the pool. Unique shapes are billed
    in full once that happens, so the pool's own byte count has to fit as well.
    """
    sample = runtime.metrics()
    charged = sample.get(CHARGED, 0.0)
    ceiling = sample[MAX]
    pools = sample.get("schema_interner_value_bytes", 0.0) + sample.get(
        "table_set_interner_value_bytes", 0.0
    )
    if charged > ceiling or pools > ceiling:
        raise AssertionError(
            f"{label}: charged entries {charged:.0f} bytes, "
            f"interned schema and table-set values {pools:.0f} bytes, "
            f"max_size {ceiling:.0f}, "
            f"schema rows {sample.get('schema_interner_rows', 0):.0f}, "
            f"table-set rows {sample.get('table_set_interner_rows', 0):.0f}"
        )


class SqlResultCacheSchemaBudgetTest(unittest.TestCase):
    def test_default_cache_keeps_distinct_sql_schemas_within_max_size(self) -> None:
        """Default cache, no API key: distinct result schemas stay within 128 MiB."""
        with tempfile.TemporaryDirectory(prefix="spice-cache-default-") as tmp:
            runtime = Runtime(
                Path(tmp),
                "version: v1\nkind: Spicepod\nname: defaults\n",
            )
            try:
                runtime.wait_ready()
                log = runtime.log_text()
                self.assertIn("max size: 128.00 MiB", log)
                self.assertIn("item ttl: 1s", log)
                self.assertNotIn("Enabled API key authentication", log)

                # One request stays under the HTTP body limit (a 2 MiB body is
                # rejected). Four clients at once still admit more than 128 MiB
                # of distinct empty-result schemas before expiry runs.
                width = 1024 * 1024
                per_client = 40
                clients = 4
                last = ""

                def one_client(worker: int) -> str:
                    statement = ""
                    for i in range(per_client):
                        alias = f"w{worker}n{i:03d}" + ("x" * (width - 8))
                        statement = f'SELECT 1 AS "{alias}" WHERE false'
                        status, headers, _body = runtime.sql(statement)
                        if status != 200:
                            raise AssertionError(f"status {status}")
                        if headers.get("results-cache-status") == "BYPASS":
                            raise AssertionError("results cache was bypassed")
                    return statement

                with ThreadPoolExecutor(max_workers=clients) as pool:
                    lasts = list(pool.map(one_client, range(clients)))
                last = lasts[-1]
                status, headers, _body = runtime.sql(last)
                self.assertEqual(status, 200)
                self.assertEqual(
                    headers.get("results-cache-status"),
                    "HIT",
                    "the newest distinct shape must still be a live cache entry",
                )
                assert_within_budget(runtime, "default sql schemas")
            finally:
                runtime.close()

    def test_distinct_table_sets_stay_within_max_size(self) -> None:
        """Queries over distinct tables must not leave input-table sets outside the budget."""
        with tempfile.TemporaryDirectory(prefix="spice-cache-tables-") as tmp:
            root = Path(tmp)
            data = root / "data"
            data.mkdir()
            datasets = []
            for i in range(8):
                column = f"c{i}_" + ("k" * 2000)
                table = f"t{i}_" + ("n" * 2000)
                csv_path = data / f"{i}.csv"
                csv_path.write_text(f"{column}\n1\n")
                datasets.append(
                    "  - from: file://{path}\n"
                    "    name: {name}\n"
                    "    acceleration:\n"
                    "      enabled: true\n"
                    "      engine: arrow\n"
                    "      mode: memory\n"
                    "      refresh_mode: full\n".format(path=csv_path, name=table)
                )
            spicepod = (
                "version: v1\nkind: Spicepod\nname: tables\n"
                "runtime:\n  caching:\n    sql_results:\n"
                "      enabled: true\n      max_size: 4KiB\n      item_ttl: 2m\n"
                "datasets:\n" + "".join(datasets)
            )
            runtime = Runtime(root, spicepod)
            try:
                runtime.wait_ready()
                statements = []
                for i in range(8):
                    table = f"t{i}_" + ("n" * 2000)
                    statements.append(f'SELECT * FROM "{table}" WHERE false')
                for statement in statements:
                    status, headers, _body = runtime.sql(statement)
                    self.assertEqual(status, 200)
                    self.assertEqual(headers.get("results-cache-status"), "MISS")
                status, headers, _body = runtime.sql(statements[-1])
                self.assertEqual(headers.get("results-cache-status"), "HIT")
                assert_within_budget(runtime, "distinct table sets")
            finally:
                runtime.close()


if __name__ == "__main__":
    unittest.main()
