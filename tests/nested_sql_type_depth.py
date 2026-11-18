#!/usr/bin/env python3
"""SQL and Arrow type nesting must be rejected before it is planned.

Spice through v2.4.1 parses a caller-supplied type with no depth cap. A client
who can reach `/v1/sql` on a runtime with no API key can abort that process
with one statement. These tests expect the v2.4.2 behavior: HTTP 400, and a
following `SELECT 1` still succeeds.

They fail on purpose until that limit is in the runtime under test.

Run:

    SPICED_BIN=/path/to/spiced python3 tests/nested_sql_type_depth.py

`SPICED_BIN` is the `spiced` binary. The script starts it on 127.0.0.1 with a
spicepod that does not set `runtime.auth`, and it does not send an API key.
"""

from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

ARROW_REJECTION = "nested more than 64"
BRACKET_REJECTION = "maximum of 64"
KEYWORD_REJECTION = "more than 32"


def list_type(levels: int, name: str = "List") -> str:
    return (name + "(") * levels + "Int64" + ")" * levels


def struct_type(levels: int) -> str:
    text = "Int64"
    for _ in range(levels):
        text = 'Struct("a": ' + text + ")"
    return text


def bracket_type(levels: int) -> str:
    return "INT" + "[]" * levels


def keyword_array(levels: int) -> str:
    # Spaces keep each `>` a separate token. `>>` is one shift token.
    return "ARRAY< " * levels + "INT" + " >" * levels


class Runtime:
    def __init__(self, binary: str) -> None:
        self.binary = binary
        self.proc: subprocess.Popen[bytes] | None = None
        self.http_port = 0
        self.workdir: tempfile.TemporaryDirectory[str] | None = None

    def start(self) -> None:
        self.workdir = tempfile.TemporaryDirectory(prefix="spice-type-depth-")
        root = Path(self.workdir.name)
        pod = root / "pod"
        state = root / "state"
        pod.mkdir()
        state.mkdir()
        (pod / "spicepod.yaml").write_text(
            "version: v1\nkind: Spicepod\nname: type-depth\n",
            encoding="utf-8",
        )
        self.http_port = free_port()
        flight_port = free_port()
        env = os.environ.copy()
        env["SPICE_CONFIG_DIR"] = str(state)
        self.proc = subprocess.Popen(
            [
                self.binary,
                "--http",
                f"127.0.0.1:{self.http_port}",
                "--flight",
                f"127.0.0.1:{flight_port}",
                str(pod),
            ],
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if self.proc.poll() is not None:
                raise RuntimeError(f"spiced exited during startup: {self.proc.returncode}")
            try:
                with urllib.request.urlopen(
                    f"http://127.0.0.1:{self.http_port}/v1/ready", timeout=1
                ) as response:
                    if response.status == 200:
                        return
            except Exception:
                time.sleep(0.1)
        raise RuntimeError("spiced did not become ready")

    def stop(self) -> None:
        if self.proc is not None and self.proc.poll() is None:
            os.killpg(self.proc.pid, signal.SIGKILL)
            self.proc.wait(timeout=5)
        if self.workdir is not None:
            self.workdir.cleanup()
            self.workdir = None

    def alive(self) -> bool:
        return self.proc is not None and self.proc.poll() is None

    def sql(self, statement: str, timeout: float = 20) -> tuple[int | None, str]:
        if not self.alive():
            return None, "runtime process is not running"
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.http_port}/v1/sql",
            data=statement.encode(),
            headers={"Content-Type": "text/plain"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.status, response.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as error:
            return error.code, error.read().decode("utf-8", "replace")
        except Exception as error:
            return None, f"{type(error).__name__}: {error}"


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def expect_rejected(runtime: Runtime, statement: str, needle: str) -> None:
    status, body = runtime.sql(statement)
    if not runtime.alive():
        raise AssertionError(
            "runtime exited while planning a nested type; "
            f"status={status} body={body[:300]!r}"
        )
    if status != 400 or needle not in body:
        raise AssertionError(
            f"expected HTTP 400 containing {needle!r}, got {status} {body[:300]!r}"
        )
    follow_status, follow_body = runtime.sql("SELECT 1")
    if follow_status != 200 or not runtime.alive():
        raise AssertionError(
            "runtime stopped serving after rejecting a nested type: "
            f"{follow_status} {follow_body[:200]!r}"
        )


def main() -> int:
    binary = os.environ.get("SPICED_BIN")
    if not binary:
        print("SPICED_BIN is required", file=sys.stderr)
        return 2

    cases = [
        (
            "arrow_cast_list_past_64",
            "SELECT arrow_cast(NULL, '" + list_type(65) + "')",
            ARROW_REJECTION,
        ),
        (
            "arrow_try_cast_list_past_crash_depth",
            "SELECT arrow_try_cast(NULL, '" + list_type(1500) + "')",
            ARROW_REJECTION,
        ),
        (
            "arrow_cast_struct_past_crash_depth",
            "SELECT arrow_cast(NULL, '" + struct_type(800) + "')",
            ARROW_REJECTION,
        ),
        (
            "cast_brackets_past_64",
            "SELECT CAST(NULL AS " + bracket_type(65) + ")",
            BRACKET_REJECTION,
        ),
        (
            "double_colon_brackets_past_crash_depth",
            "SELECT NULL::" + bracket_type(2000),
            BRACKET_REJECTION,
        ),
        (
            "cast_array_keyword_past_32",
            "SELECT CAST(NULL AS " + keyword_array(33) + ")",
            KEYWORD_REJECTION,
        ),
        (
            "cast_array_keyword_past_crash_depth",
            "SELECT CAST(NULL AS " + keyword_array(1500) + ")",
            KEYWORD_REJECTION,
        ),
        (
            "create_table_array_keyword_past_parser_crash_depth",
            "CREATE TABLE t (c " + keyword_array(6000) + ")",
            KEYWORD_REJECTION,
        ),
    ]

    runtime = Runtime(binary)
    failed: list[str] = []
    try:
        runtime.start()
        status, body = runtime.sql("SELECT 1")
        if status != 200:
            print(f"FAIL unauthenticated_select: {status} {body[:200]!r}")
            return 1
        print("PASS unauthenticated_select")
        for name, statement, needle in cases:
            try:
                expect_rejected(runtime, statement, needle)
            except AssertionError as error:
                print(f"FAIL {name}: {error}")
                failed.append(name)
                if not runtime.alive():
                    break
            else:
                print(f"PASS {name}")
    except Exception as error:
        print(f"FAIL setup: {error}")
        return 1
    finally:
        runtime.stop()

    if failed:
        print(f"{len(failed)} test(s) failed")
        return 1
    print(f"{len(cases) + 1} tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
