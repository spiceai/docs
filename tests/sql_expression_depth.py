#!/usr/bin/env python3
"""SQL expression depth must be rejected before the runtime plans it.

Spice 2.2 and 2.3 accept a client SQL statement on unauthenticated
``POST /v1/sql`` and format the planned expression with a recursive
``SchemaDisplay``. A long ``OR``, ``AND``, ``+``, or ``||`` chain overflows
the worker stack and aborts the process. These tests fail on those runtimes:
a chain past 512 levels must come back as HTTP 400, and a later query must
still succeed.

They pass on Spice 2.4.2, which rejects the chain while planning.

Run against a local ``spiced`` binary (no API keys in the spicepod):

    SPICED_BIN=/path/to/spiced python3 tests/sql_expression_depth.py

Not covered here, and not claimed by these assertions:

* Arrow Flight SQL, prepared statements, and ``BEGIN``/``COMMIT`` transactions.
  They plan through the same ``QueryBuilder`` path, but this file only speaks
  HTTP.
* ``POST /v1/nsql``. The statement that is planned is produced by a model, not
  taken from the request body.
* ``POST /v1/search`` ``where``. With no searchable dataset the runtime reports
  a missing data source before that condition is planned.
* Parenthesized subqueries. The SQL parser returns
  ``RecursionLimitExceeded`` (limit 50) and the process stays up.
* A chain of common table expressions that read one another. Chains of 1000
  and 2500 returned HTTP 200; a chain of 5000 was still running after 60
  seconds and the process had not aborted.
"""

from __future__ import annotations

import os
import socket
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request


def _free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def _chain(operator: str, terms: int) -> str:
    if operator == "+":
        atom = "1"
    elif operator == "||":
        atom = "'a'"
    else:
        atom = "true"
    return f" {operator} ".join([atom] * terms)


class SqlExpressionDepthTests(unittest.TestCase):
    """Deep expression chains are a client error, not a process abort.

    Each test starts its own runtime. One statement aborting the process must
    not decide the result of the next statement.
    """

    def setUp(self) -> None:
        binary = os.environ.get("SPICED_BIN")
        if not binary:
            self.skipTest("SPICED_BIN is not set")
        self.http_port = _free_port()
        self.flight_port = _free_port()
        self.node_port = _free_port()
        self.workdir = tempfile.TemporaryDirectory()
        spicepod = os.path.join(self.workdir.name, "spicepod.yaml")
        with open(spicepod, "w", encoding="utf-8") as handle:
            handle.write("version: v1\nkind: Spicepod\nname: expression-depth\n")
        self.log_path = os.path.join(self.workdir.name, "spiced.log")
        self.log_file = open(self.log_path, "w", encoding="utf-8")
        self.proc = subprocess.Popen(
            [
                binary,
                "--http",
                f"127.0.0.1:{self.http_port}",
                "--flight",
                f"127.0.0.1:{self.flight_port}",
                "--node-bind-address",
                f"127.0.0.1:{self.node_port}",
                self.workdir.name,
            ],
            stdout=self.log_file,
            stderr=subprocess.STDOUT,
            cwd=self.workdir.name,
        )
        deadline = time.time() + 30
        while time.time() < deadline:
            if self.proc.poll() is not None:
                break
            try:
                urllib.request.urlopen(
                    f"http://127.0.0.1:{self.http_port}/v1/ready", timeout=1
                ).read()
                return
            except (urllib.error.URLError, TimeoutError):
                time.sleep(0.2)
        log = self._log_tail()
        self.tearDown()
        raise RuntimeError("spiced did not become ready:\n" + log)

    def tearDown(self) -> None:
        proc = getattr(self, "proc", None)
        if proc is not None and proc.poll() is None:
            proc.kill()
            proc.wait(timeout=10)
        log_file = getattr(self, "log_file", None)
        if log_file is not None and not log_file.closed:
            log_file.close()
        workdir = getattr(self, "workdir", None)
        if workdir is not None:
            workdir.cleanup()

    def _log_tail(self) -> str:
        try:
            with open(self.log_path, encoding="utf-8", errors="replace") as handle:
                return handle.read()[-1500:]
        except OSError as exc:
            return f"(no log: {exc})"

    def _post(self, sql: str, timeout: float = 30) -> tuple[int, bytes]:
        self.assertIsNone(
            self.proc.poll(),
            "runtime exited before the request:\n" + self._log_tail(),
        )
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.http_port}/v1/sql",
            data=sql.encode(),
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as exc:
            return exc.code, exc.read()

    def _assert_alive(self) -> None:
        self.assertIsNone(
            self.proc.poll(),
            "runtime aborted while planning SQL:\n" + self._log_tail(),
        )

    def _assert_rejected(self, sql: str, fragment: str) -> None:
        try:
            status, body = self._post(sql)
        except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
            self.fail(
                f"request failed ({exc}); runtime poll={self.proc.poll()}\n"
                + self._log_tail()
            )
        self._assert_alive()
        text = body.decode("utf-8", errors="replace")
        self.assertEqual(status, 400, text)
        self.assertIn(fragment, text)
        follow_status, _follow_body = self._post("SELECT 1")
        self._assert_alive()
        self.assertEqual(follow_status, 200)

    def test_shallow_query_succeeds(self) -> None:
        status, body = self._post("SELECT 1")
        self._assert_alive()
        self.assertEqual(status, 200)
        self.assertIn(b"1", body)

    def test_select_or_chain_at_limit_succeeds(self) -> None:
        status, _body = self._post("SELECT " + _chain("OR", 512))
        self._assert_alive()
        self.assertEqual(status, 200)

    def test_select_or_chain_past_limit_is_rejected(self) -> None:
        self._assert_rejected(
            "SELECT " + _chain("OR", 513),
            "a selected, grouped, ordered, or VALUES expression is nested more than 512 levels deep",
        )

    def test_select_or_chain_that_overflows_unbounded_planning_is_rejected(self) -> None:
        self._assert_rejected(
            "SELECT " + _chain("OR", 1200),
            "a selected, grouped, ordered, or VALUES expression is nested more than 512 levels deep",
        )

    def test_select_and_chain_is_rejected(self) -> None:
        self._assert_rejected(
            "SELECT " + _chain("AND", 1200),
            "a selected, grouped, ordered, or VALUES expression is nested more than 512 levels deep",
        )

    def test_select_addition_chain_is_rejected(self) -> None:
        self._assert_rejected(
            "SELECT " + _chain("+", 1200),
            "a selected, grouped, ordered, or VALUES expression is nested more than 512 levels deep",
        )

    def test_select_concatenation_chain_is_rejected(self) -> None:
        self._assert_rejected(
            "SELECT " + _chain("||", 1200),
            "a selected, grouped, ordered, or VALUES expression is nested more than 512 levels deep",
        )

    def test_where_or_chain_past_limit_is_rejected(self) -> None:
        self._assert_rejected(
            "SELECT 1 WHERE " + _chain("OR", 513),
            "an expression is nested more than 512 levels deep",
        )

    def test_where_or_chain_that_overflows_unbounded_planning_is_rejected(self) -> None:
        self._assert_rejected(
            "SELECT 1 WHERE " + _chain("OR", 2000),
            "an expression is nested more than 512 levels deep",
        )


if __name__ == "__main__":
    unittest.main()
