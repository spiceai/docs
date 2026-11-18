#!/usr/bin/env python3
"""DuckDB connector queries must stay inside the runtime query memory budget.

The DuckDB data connector opens a file read-only, or an in-memory database for
a table function, and does not set DuckDB's memory_limit. DuckDB then sizes
its own ceiling from system memory (80 percent of the cgroup limit when that
limit is visible). runtime.query.memory_limit applies to the DataFusion query
pool only, so a caller of POST /v1/sql can make the connector's DuckDB
instance allocate far past that pool.

This test fails while that behavior is present. It passes once every DuckDB
instance the connector opens keeps its memory_limit within
runtime.query.memory_limit, and a federated aggregate cannot grow the runtime
process by more than that budget plus a fixed allowance.

Untested entry points that call the same connector pools: Flight SQL and the
spice SQL client. The DuckDB accelerator is a different component and already
applies its own memory_limit.

Run (the runtime under test is Spice v2.3.4, which the 2.2 and 2.3 connector
guides describe):

    SPICED=/path/to/spiced DUCKDB=/path/to/duckdb-1.4.4 \\
        python3 tests/duckdb_connector_memory_ceiling.py
"""

from __future__ import annotations

import json
import os
import signal
import subprocess
import tempfile
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

# DuckDB 1.4.4 accepts this as an explicit memory_limit. It is also small
# enough that a DataFusion grouped aggregate over the wide file is refused,
# which shows the query pool is actually this budget and not the default.
QUERY_BUDGET = 1 * 1024 * 1024
# Headroom for the runtime, Arrow conversion, and DuckDB's own allocator
# overhead above a correctly applied ceiling. The uncapped aggregate measured
# against Spice v2.3.4 grows by about 825 MiB and still exceeds this.
RSS_ALLOWANCE = QUERY_BUDGET + 256 * 1024 * 1024
HEAVY_ROWS = 20_000_000


def main() -> None:
    spiced = os.environ.get("SPICED", "spiced")
    duckdb = os.environ.get("DUCKDB", "duckdb")
    with tempfile.TemporaryDirectory(prefix="duckdb-memory-ceiling-") as tmp:
        root = Path(tmp)
        db_path = root / "sample.duckdb"
        subprocess.run(
            [
                duckdb,
                str(db_path),
                "CREATE TABLE t AS SELECT range AS i FROM range(1000);",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        _write_spicepod(root, db_path)
        port = _free_port()
        flight_port = _free_port()
        log_path = root / "spiced.log"
        with log_path.open("w") as log:
            proc = subprocess.Popen(
                [
                    spiced,
                    "--http",
                    f"127.0.0.1:{port}",
                    "--flight",
                    f"127.0.0.1:{flight_port}",
                    str(root / "spicepod.yaml"),
                ],
                stdout=log,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
        try:
            _wait_ready(port, proc, log_path)
            failures: list[str] = []
            try:
                _assert_query_pool_is_the_budget(port, root)
            except SystemExit as error:
                failures.append(str(error))
            for dataset, label in (
                ("file_settings", "read-only file"),
                ("memory_settings", "in-memory table function"),
            ):
                reported = _duckdb_memory_limit_bytes(port, dataset)
                if reported > QUERY_BUDGET:
                    failures.append(
                        f"{label} connector reports DuckDB memory_limit of "
                        f"{reported} bytes, above the {QUERY_BUDGET}-byte "
                        "query budget"
                    )
            for dataset, label in (
                ("file_nums", "read-only file"),
                ("memory_nums", "in-memory table function"),
            ):
                _assert_federated_to_duckdb(port, dataset)
                grown = _rss_growth(
                    proc.pid,
                    port,
                    f"SELECT count(DISTINCT CAST(range AS VARCHAR)) AS n FROM {dataset}",
                )
                if grown > RSS_ALLOWANCE:
                    failures.append(
                        f"{label} connector aggregate grew the runtime by "
                        f"{grown} bytes, past the {RSS_ALLOWANCE}-byte allowance "
                        f"around the {QUERY_BUDGET}-byte query budget"
                    )
            if failures:
                raise SystemExit("\n".join(failures))
        finally:
            _stop(proc)
    print("duckdb connector memory stays within the query budget")


def _write_spicepod(root: Path, db_path: Path) -> None:
    # No runtime.auth block: API key authentication stays off, which is what
    # lets a caller post SQL with no credentials.
    # Same shape that Spice v2.3.4 refuses with "Resources exhausted" when
    # runtime.query.memory_limit is 1MiB, and that it accepts when the pool is
    # the default.
    wide = root / "wide.csv"
    with wide.open("w") as handle:
        handle.write("n\n")
        for i in range(2_000_000):
            handle.write(f"{i:048d}\n")
    manifest = f"""version: v1
kind: Spicepod
name: duckdb-memory-ceiling

datasets:
  - from: file:{wide}
    name: wide
  - from: duckdb:duckdb_settings()
    name: file_settings
    params:
      duckdb_open: {db_path}
  - from: duckdb:range({HEAVY_ROWS})
    name: file_nums
    params:
      duckdb_open: {db_path}
  - from: duckdb:duckdb_settings()
    name: memory_settings
  - from: duckdb:range({HEAVY_ROWS})
    name: memory_nums

runtime:
  query:
    memory_limit: 1MiB
    temp_directory: {root / "df-temp"}
"""
    (root / "spicepod.yaml").write_text(manifest)
    (root / "df-temp").mkdir()


def _assert_query_pool_is_the_budget(port: int, root: Path) -> None:
    """A DataFusion aggregate past the budget must be refused.

    This guards the rest of the test: if the Spicepod limit were ignored, the
    query pool would be most of the cgroup and the DuckDB comparison would not
    show a gap.
    """
    body, status = _post_sql(port, "SELECT count(DISTINCT n) AS n FROM wide")
    if status == 200 and "Resources exhausted" not in body:
        raise SystemExit(
            "query memory_limit is not in force; the DataFusion aggregate "
            f"succeeded: {body[:300]}"
        )
    if not list((root / "df-temp").rglob("*")) and "Resources exhausted" not in body:
        raise SystemExit(
            "query memory_limit did not spill or refuse the DataFusion aggregate: "
            f"{body[:300]}"
        )


def _duckdb_memory_limit_bytes(port: int, dataset: str) -> int:
    body, status = _post_sql(
        port,
        "SELECT value FROM "
        f"{dataset} WHERE name = 'memory_limit'",
    )
    if status != 200:
        raise SystemExit(f"{dataset} memory_limit query failed: {status} {body[:400]}")
    rows = json.loads(body)
    if len(rows) != 1 or "value" not in rows[0]:
        raise SystemExit(f"unexpected memory_limit payload from {dataset}: {body[:400]}")
    return _parse_duckdb_bytes(rows[0]["value"])


def _assert_federated_to_duckdb(port: int, dataset: str) -> None:
    body, status = _post_sql(
        port,
        "EXPLAIN SELECT count(DISTINCT CAST(range AS VARCHAR)) FROM "
        f"{dataset} WHERE range < 10",
    )
    if status != 200 or "name=duckdb" not in body or "VirtualExecutionPlan" not in body:
        raise SystemExit(
            f"aggregate on {dataset} was not executed by the DuckDB connector: "
            f"{status} {body[:500]}"
        )


def _rss_growth(pid: int, port: int, sql: str) -> int:
    baseline = _rss_bytes(pid)
    peak = baseline
    stop = threading.Event()

    def sample() -> None:
        nonlocal peak
        while not stop.is_set():
            peak = max(peak, _rss_bytes(pid))
            time.sleep(0.05)

    thread = threading.Thread(target=sample)
    thread.start()
    try:
        body, status = _post_sql(port, sql, timeout=120)
    finally:
        stop.set()
        thread.join()
    peak = max(peak, _rss_bytes(pid))
    # A refusal is only a pass when the process did not already allocate past
    # the budget. Success with a large resident set is the bug.
    if status != 200 and "Resources exhausted" not in body and "memory" not in body.lower():
        raise SystemExit(f"DuckDB aggregate failed for an unexpected reason: {status} {body[:400]}")
    return peak - baseline


def _rss_bytes(pid: int) -> int:
    for line in Path(f"/proc/{pid}/status").read_text().splitlines():
        if line.startswith("VmRSS:"):
            return int(line.split()[1]) * 1024
    raise SystemExit(f"VmRSS missing for pid {pid}")


def _parse_duckdb_bytes(text: str) -> int:
    number, unit = text.split()
    scale = {
        "byte": 1,
        "bytes": 1,
        "kib": 1024,
        "mib": 1024**2,
        "gib": 1024**3,
        "tib": 1024**4,
        "kb": 1000,
        "mb": 1000**2,
        "gb": 1000**3,
        "tb": 1000**4,
    }[unit.lower()]
    return int(float(number) * scale)


def _post_sql(port: int, sql: str, timeout: float = 60) -> tuple[str, int]:
    request = urllib.request.Request(
        f"http://127.0.0.1:{port}/v1/sql",
        data=sql.encode(),
        method="POST",
        headers={"Content-Type": "text/plain"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.read().decode(), response.status
    except urllib.error.HTTPError as error:
        return error.read().decode(), error.code


def _wait_ready(port: int, proc: subprocess.Popen[bytes], log_path: Path) -> None:
    deadline = time.time() + 40
    while time.time() < deadline:
        if proc.poll() is not None:
            raise SystemExit(f"spiced exited {proc.returncode}: {log_path.read_text()[-2000:]}")
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/v1/ready", timeout=1) as response:
                if response.status == 200:
                    return
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.2)
    raise SystemExit(f"spiced did not become ready: {log_path.read_text()[-2000:]}")


def _free_port() -> int:
    import socket

    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def _stop(proc: subprocess.Popen[bytes]) -> None:
    if proc.poll() is not None:
        return
    os.killpg(proc.pid, signal.SIGTERM)
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        os.killpg(proc.pid, signal.SIGKILL)
        proc.wait(timeout=5)


if __name__ == "__main__":
    main()
