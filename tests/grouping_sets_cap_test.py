#!/usr/bin/env python3
"""Grouping-set cap on the Spice HTTP query API.

These tests are the spec for the planning limit added in Spice v2.4.2. They
fail on a runtime through v2.4.1, which plans a single GROUP BY CUBE or
GROUPING SETS with no cap, and pass on v2.4.2 or later, which rejects the
statement with HTTP 400 before that expansion.

The runtime under test is the ``SPICED_BIN`` executable. It is started with
query authentication unset and ``runtime.query.memory_limit`` set to 16MiB.
No API key is sent.

Flight SQL statements, Flight SQL prepared statements, and ``/v1/nsql`` call
the same query builder and are not started by this file.
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

# A single CUBE of this many expressions is 2^n sets. 12 is the largest CUBE
# the cap allows (4096). 13 is the smallest CUBE the cap rejects (8192).
CUBE_AT_CAP = 12
CUBE_OVER_CAP = 13
# Large enough that expanding every set into a physical plan is visible as
# time and memory, and small enough that a fixed runtime still parses it.
CUBE_EXPANDS = 22
GROUPING_SETS_OVER_CAP = 4097
REJECT_WITHIN_SECONDS = 3.0
REJECTION = "GROUP BY expands to more than 4096 grouping sets"


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def columns(count: int) -> str:
    return ", ".join(f"c{i}" for i in range(count))


def csv_header(count: int) -> str:
    return ",".join(f"c{i}" for i in range(count))


def cube(count: int) -> str:
    return f"SELECT COUNT(*) AS n FROM t GROUP BY CUBE ({columns(count)})"


def post_sql(base: str, sql: str, timeout: float, content_type: str | None = None) -> tuple[int, str, float]:
    data = sql.encode()
    headers = {}
    if content_type == "application/json":
        data = json.dumps({"sql": sql, "parameters": []}).encode()
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(
        f"{base}/v1/sql",
        data=data,
        headers=headers,
        method="POST",
    )
    started = time.monotonic()
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read().decode()
            status = response.status
    except urllib.error.HTTPError as error:
        body = error.read().decode()
        status = error.code
    return status, body, time.monotonic() - started


class Runtime:
    def __init__(self, binary: str) -> None:
        self.binary = binary
        self.http_port = free_port()
        self.flight_port = free_port()
        self.workdir = tempfile.TemporaryDirectory(prefix="grouping-sets-")
        self.process: subprocess.Popen[str] | None = None

    @property
    def base(self) -> str:
        return f"http://127.0.0.1:{self.http_port}"

    def start(self) -> None:
        root = Path(self.workdir.name)
        csv_path = root / "data.csv"
        csv_path.write_text(csv_header(CUBE_EXPANDS) + "\n" + ",".join(["1"] * CUBE_EXPANDS) + "\n")
        (root / "spicepod.yaml").write_text(
            "\n".join(
                [
                    "version: v1",
                    "kind: Spicepod",
                    "name: grouping-sets-cap",
                    "datasets:",
                    f"  - from: file://{csv_path}",
                    "    name: t",
                    "runtime:",
                    "  query:",
                    "    memory_limit: 16MiB",
                    "",
                ]
            )
        )
        log = open(root / "spiced.log", "w")
        self.process = subprocess.Popen(
            [
                self.binary,
                "--http",
                f"127.0.0.1:{self.http_port}",
                "--flight",
                f"127.0.0.1:{self.flight_port}",
                str(root / "spicepod.yaml"),
            ],
            cwd=root,
            stdout=log,
            stderr=subprocess.STDOUT,
            text=True,
        )
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if self.process.poll() is not None:
                raise SystemExit(f"spiced exited {self.process.returncode}; see {root / 'spiced.log'}")
            try:
                with urllib.request.urlopen(f"{self.base}/v1/ready", timeout=1) as response:
                    if response.status == 200:
                        return
            except (urllib.error.URLError, TimeoutError):
                time.sleep(0.2)
        raise SystemExit(f"spiced did not become ready; see {root / 'spiced.log'}")

    def stop(self) -> None:
        if self.process is not None and self.process.poll() is None:
            self.process.kill()
            self.process.wait(timeout=10)
        self.workdir.cleanup()


def fail(message: str) -> None:
    raise AssertionError(message)


def expect_rejected(base: str, sql: str, timeout: float, content_type: str | None = None) -> None:
    status, body, elapsed = post_sql(base, sql, timeout, content_type)
    if status != 400 or REJECTION not in body or elapsed > REJECT_WITHIN_SECONDS:
        fail(
            f"expected HTTP 400 containing {REJECTION!r} within {REJECT_WITHIN_SECONDS}s, "
            f"got {status} in {elapsed:.3f}s: {body[:400]}"
        )


def main() -> None:
    binary = os.environ.get("SPICED_BIN")
    if not binary:
        raise SystemExit("SPICED_BIN must name the spiced executable under test")

    runtime = Runtime(binary)
    failures: list[str] = []

    def check(name: str, fn) -> None:
        try:
            fn()
            print(f"PASS {name}")
        except Exception as error:  # noqa: BLE001 - collect every failed spec
            failures.append(f"{name}: {error}")
            print(f"FAIL {name}: {error}")

    try:
        runtime.start()
        base = runtime.base

        def unauthenticated_query_is_served() -> None:
            status, body, _elapsed = post_sql(base, "SELECT COUNT(*) AS n FROM t", 10)
            if status != 200 or '"n":1' not in body.replace(" ", ""):
                fail(f"unauthenticated query was not served: {status} {body[:200]}")

        def cube_at_cap_is_served() -> None:
            status, body, _elapsed = post_sql(base, cube(CUBE_AT_CAP), 30)
            if status != 200:
                fail(f"CUBE of {CUBE_AT_CAP} was rejected: {status} {body[:300]}")
            rows = json.loads(body)
            if len(rows) != 4096:
                fail(f"CUBE of {CUBE_AT_CAP} returned {len(rows)} rows, expected 4096")

        def cube_over_cap_is_rejected() -> None:
            expect_rejected(base, cube(CUBE_OVER_CAP), REJECT_WITHIN_SECONDS)

        def grouping_sets_over_cap_are_rejected() -> None:
            sets = ", ".join(["(c0)"] * GROUPING_SETS_OVER_CAP)
            expect_rejected(
                base,
                f"SELECT COUNT(*) AS n FROM t GROUP BY GROUPING SETS ({sets})",
                REJECT_WITHIN_SECONDS,
            )

        def json_sql_body_is_rejected() -> None:
            expect_rejected(base, cube(CUBE_OVER_CAP), REJECT_WITHIN_SECONDS, "application/json")

        def explain_of_a_large_cube_is_rejected_before_expansion() -> None:
            expect_rejected(base, f"EXPLAIN {cube(CUBE_EXPANDS)}", REJECT_WITHIN_SECONDS)

        def transaction_over_cap_is_rejected() -> None:
            expect_rejected(
                base,
                f"BEGIN; {cube(CUBE_OVER_CAP)}; COMMIT;",
                REJECT_WITHIN_SECONDS,
            )

        def later_query_is_served() -> None:
            status, body, _elapsed = post_sql(base, "SELECT 1 AS n", 10)
            if status != 200 or '"n":1' not in body.replace(" ", ""):
                fail(f"query after a rejection was not served: {status} {body[:200]}")

        check("unauthenticated query is served", unauthenticated_query_is_served)
        check("cube of 12 expressions is served", cube_at_cap_is_served)
        check("cube of 13 expressions is rejected", cube_over_cap_is_rejected)
        check("grouping sets of 4097 are rejected", grouping_sets_over_cap_are_rejected)
        check("json sql body over the cap is rejected", json_sql_body_is_rejected)
        check("explain of cube 22 is rejected before expansion", explain_of_a_large_cube_is_rejected_before_expansion)
        check("transaction over the cap is rejected", transaction_over_cap_is_rejected)
        check("later query is served", later_query_is_served)
    finally:
        runtime.stop()

    if failures:
        raise SystemExit(f"{len(failures)} test(s) failed")


if __name__ == "__main__":
    main()
