#!/usr/bin/env python3
"""A Spicepod reload must withdraw catalog write access.

Spice v2.4.3 keeps a DuckLake catalog writable after the catalog is removed
from the Spicepod and the pods watcher reloads it. These checks drive that
runtime: they fail while INSERT still adds a row, and they pass once a reload
withdraws write access.

The query API is reached with no API key, which is the runtime default when
`runtime.auth` is unset. The process is started with `--pods-watcher-enabled`,
the flag `spice run` adds when it launches `spiced`.

Checked on a local DuckLake catalog, through POST /v1/sql:

- `read_write` to `read`: INSERT must not add a row.
- `read_write_create` to `read_write`: INSERT still adds a row, and CREATE,
  DROP, UPDATE, and DELETE must not change the table.
- `read_write_create` to `read`: INSERT must not add a row.
- Removing the catalog from `read_write`, and from `read_write_create`: SELECT
  still returns the existing rows, and INSERT must not add a row.

UPDATE, DELETE, CREATE, and DROP do not modify DuckLake through /v1/sql on
v2.4.3 even while access allows them (`DELETE`/`UPDATE` are not supported by
the table, and CREATE/DROP are unimplemented logical plans). They are asserted
not to change data, and they are not a second working write path on this
catalog. INSERT is the write DuckLake carries out.

Run (the checks fail on purpose against Spice v2.4.3):

    SPICED=/path/to/spiced DUCKDB=/path/to/duckdb-1.4.4 \\
        python3 tests/catalog_reload_withdraws_write_access.py
"""

from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

SPICED = os.environ.get("SPICED", "spiced")
DUCKDB = os.environ.get("DUCKDB", "duckdb")


class Failure(Exception):
    pass


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def sql(port: int, statement: str) -> tuple[int, str]:
    request = urllib.request.Request(
        f"http://127.0.0.1:{port}/v1/sql",
        data=statement.encode(),
        headers={"Content-Type": "text/plain"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.status, response.read().decode()
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode()


def wait_ready(port: int, proc: subprocess.Popen[bytes], timeout: float = 60) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if proc.poll() is not None:
            raise Failure(f"spiced exited before ready, status {proc.returncode}")
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/v1/ready", timeout=2) as response:
                if response.status == 200:
                    return
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.2)
    raise Failure("spiced did not become ready")


def log_text(log_path: Path) -> str:
    return log_path.read_bytes().replace(b"\x00", b"\n").decode("utf-8", "replace")


def wait_log(log_path: Path, previous: str, needle: str, timeout: float = 30) -> str:
    deadline = time.time() + timeout
    while time.time() < deadline:
        current = log_text(log_path)
        added = current[len(previous) :] if current.startswith(previous) else current
        if needle in added:
            return current
        time.sleep(0.2)
    raise Failure(f"reload did not log {needle!r}")


def count_orders(port: int) -> int:
    status, body = sql(port, "SELECT COUNT(*) AS cnt FROM lake.main.orders")
    if status != 200 or '"cnt":' not in body:
        raise Failure(f"count query failed: {status} {body}")
    # The HTTP SQL API returns one JSON object per row: [{"cnt":N}]
    try:
        return int(body.split('"cnt":', 1)[1].split("}", 1)[0].strip())
    except (IndexError, ValueError) as error:
        raise Failure(f"could not read count from {body}") from error


def orders(port: int) -> str:
    status, body = sql(port, "SELECT id, total FROM lake.main.orders ORDER BY id")
    if status != 200:
        raise Failure(f"select failed: {status} {body}")
    return body


def bootstrap_lake(lake_dir: Path) -> None:
    lake_dir.mkdir(parents=True)
    data = lake_dir / "data"
    data.mkdir()
    meta = lake_dir / "metadata.ducklake"
    script = f"""
INSTALL ducklake;
LOAD ducklake;
ATTACH 'ducklake:{meta}' AS lake (DATA_PATH '{data}');
CREATE TABLE lake.main.orders (id INTEGER, customer_id INTEGER, total DOUBLE);
INSERT INTO lake.main.orders VALUES (1, 10, 1.5);
"""
    completed = subprocess.run(
        [DUCKDB],
        input=script.encode(),
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise Failure(
            "duckdb could not create the DuckLake table:\n"
            + completed.stderr.decode("utf-8", "replace")
        )


def write_pod(directory: Path, access: str | None) -> None:
    lake = directory / "lake" / "metadata.ducklake"
    if access is None:
        body = "version: v1\nkind: Spicepod\nname: catalog_reload\n"
    else:
        body = f"""version: v1
kind: Spicepod
name: catalog_reload
catalogs:
  - from: ducklake:{lake}
    name: lake
    access: {access}
"""
    (directory / "spicepod.yaml").write_text(body)


class Runtime:
    def __init__(self, access: str) -> None:
        self.directory = Path(tempfile.mkdtemp(prefix="catalog-reload-"))
        self.log_path = self.directory / "spiced.log"
        self.http = free_port()
        self.flight = free_port()
        bootstrap_lake(self.directory / "lake")
        write_pod(self.directory, access)
        log = self.log_path.open("wb")
        self._log = log
        self.proc = subprocess.Popen(
            [
                SPICED,
                "--pods-watcher-enabled",
                "--http",
                f"127.0.0.1:{self.http}",
                "--flight",
                f"127.0.0.1:{self.flight}",
            ],
            cwd=self.directory,
            stdout=log,
            stderr=subprocess.STDOUT,
        )

    def ready(self) -> None:
        wait_ready(self.http, self.proc)
        # The ready endpoint answers before the catalog's tables are queryable.
        deadline = time.time() + 30
        last = ""
        while time.time() < deadline:
            status, last = sql(self.http, "SELECT id FROM lake.main.orders")
            if status == 200:
                return
            time.sleep(0.2)
        raise Failure(f"catalog table was not queryable: {last}")

    def reload(self, access: str | None, needle: str) -> None:
        previous = log_text(self.log_path)
        write_pod(self.directory, access)
        wait_log(self.log_path, previous, needle)
        # Let the registration that produced the log finish its table refresh.
        time.sleep(0.5)

    def stop(self) -> None:
        if self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait(timeout=10)
        self._log.close()
        shutil.rmtree(self.directory, ignore_errors=True)


def assert_unchanged(port: int, statement: str, before: int) -> None:
    status, body = sql(port, statement)
    after = count_orders(port)
    if after != before:
        raise Failure(
            f"{statement!r} changed lake.main.orders from {before} rows to {after} "
            f"(HTTP {status}: {body})"
        )


def assert_insert_adds(port: int, row_id: int) -> None:
    before = count_orders(port)
    status, body = sql(
        port,
        f"INSERT INTO lake.main.orders (id, customer_id, total) VALUES ({row_id}, {row_id}, {row_id}.0)",
    )
    after = count_orders(port)
    if status != 200 or after != before + 1:
        raise Failure(
            f"INSERT of id {row_id} should add a row while access allows it: "
            f"HTTP {status} {body}; count {before} -> {after}"
        )


def scenario_downgrade_to_read(initial: str) -> None:
    runtime = Runtime(initial)
    try:
        runtime.ready()
        assert_insert_adds(runtime.http, 2)
        before = count_orders(runtime.http)
        runtime.reload("read", "Registered catalog 'lake'")
        assert_unchanged(
            runtime.http,
            "INSERT INTO lake.main.orders (id, customer_id, total) VALUES (40, 40, 40.0)",
            before,
        )
        assert_unchanged(
            runtime.http,
            "INSERT INTO lake.main.orders (id, customer_id, total) VALUES (41, 41, 41.0)",
            before,
        )
        visible = orders(runtime.http)
        if '"id":1' not in visible or '"id":2' not in visible:
            raise Failure(f"downgrade to read hid existing rows: {visible}")
        print(f"PASS {initial} -> read refuses INSERT and keeps existing rows")
    finally:
        runtime.stop()


def scenario_downgrade_create_to_write() -> None:
    runtime = Runtime("read_write_create")
    try:
        runtime.ready()
        assert_insert_adds(runtime.http, 2)
        # These statements do not modify DuckLake even at read_write_create.
        # Record that, then require the same after the downgrade.
        before = count_orders(runtime.http)
        for statement in (
            "UPDATE lake.main.orders SET total = 0 WHERE id = 1",
            "DELETE FROM lake.main.orders WHERE id = 1",
            "CREATE TABLE lake.main.extra (id INTEGER)",
            "DROP TABLE lake.main.orders",
        ):
            assert_unchanged(runtime.http, statement, before)
        runtime.reload("read_write", "Registered catalog 'lake'")
        assert_insert_adds(runtime.http, 3)
        before = count_orders(runtime.http)
        for statement in (
            "UPDATE lake.main.orders SET total = 0 WHERE id = 1",
            "DELETE FROM lake.main.orders WHERE id = 1",
            "CREATE TABLE lake.main.extra (id INTEGER)",
            "DROP TABLE lake.main.orders",
            "CREATE SCHEMA lake.analytics",
        ):
            assert_unchanged(runtime.http, statement, before)
        print("PASS read_write_create -> read_write keeps INSERT and refuses DDL changes")
    finally:
        runtime.stop()


def scenario_remove(initial: str) -> None:
    runtime = Runtime(initial)
    try:
        runtime.ready()
        assert_insert_adds(runtime.http, 2)
        before = count_orders(runtime.http)
        snapshot = orders(runtime.http)
        runtime.reload(None, "removed from the Spicepod")
        visible = orders(runtime.http)
        if visible != snapshot:
            raise Failure(
                f"removing the catalog changed readable rows:\n before {snapshot}\n after {visible}"
            )
        assert_unchanged(
            runtime.http,
            "INSERT INTO lake.main.orders (id, customer_id, total) VALUES (50, 50, 50.0)",
            before,
        )
        assert_unchanged(
            runtime.http,
            "INSERT INTO lake.main.orders (id, customer_id, total) VALUES (51, 51, 51.0)",
            before,
        )
        print(f"PASS remove catalog from {initial} refuses INSERT and keeps existing rows")
    finally:
        runtime.stop()


def main() -> int:
    if shutil.which(SPICED) is None and not Path(SPICED).is_file():
        print(f"spiced not found: {SPICED}", file=sys.stderr)
        return 2
    if shutil.which(DUCKDB) is None and not Path(DUCKDB).is_file():
        print(f"duckdb not found: {DUCKDB}", file=sys.stderr)
        return 2
    version = subprocess.run([SPICED, "--version"], capture_output=True, text=True, check=False)
    print((version.stdout or version.stderr).strip())
    failures: list[str] = []
    for name, fn in (
        ("read_write -> read", lambda: scenario_downgrade_to_read("read_write")),
        ("read_write_create -> read", lambda: scenario_downgrade_to_read("read_write_create")),
        ("read_write_create -> read_write", scenario_downgrade_create_to_write),
        ("remove from read_write", lambda: scenario_remove("read_write")),
        ("remove from read_write_create", lambda: scenario_remove("read_write_create")),
    ):
        try:
            fn()
        except Exception as error:  # noqa: BLE001 - report every scenario
            failures.append(f"FAIL {name}: {error}")
            print(failures[-1], file=sys.stderr)
    if failures:
        print(f"{len(failures)} scenario(s) failed", file=sys.stderr)
        return 1
    print("all catalog reload scenarios passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
