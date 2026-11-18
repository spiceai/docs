#!/usr/bin/env python3
"""Spec for query-timeout cancellation during source planning.

These tests fail on Spice v2.4.3 on purpose. A query whose physical planning
waits on object-store metadata keeps its admission permit after
``runtime.query.timeout`` fires, so another query waits out its own timeout
and never runs. They pass once planning I/O is bounded by the remaining query
deadline and the permit is released when that deadline fires.

The dynamic HTTP JSON API is a control. Its fetch runs on the result stream,
which already observes the timeout, so that case passes on v2.4.3.

Run against the v2.4.3 ``spiced`` binary:

    SPICED_BIN=/path/to/spiced python3 tests/query_timeout_planning_test.py
"""

import os
import secrets
import socket
import subprocess
import threading
import time
import unittest
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SPICED = os.environ.get("SPICED_BIN", "spiced")
QUERY_TIMEOUT_S = 2
CLIENT_TIMEOUT = "12s"
# Longer than the query timeout and shorter than a full connector retry budget.
OBSERVE_S = 8
CSV = b"id,name\n1,ada\n"


class Stall:
    def __init__(self):
        self.on = threading.Event()


class Origin(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    stall = None
    mode = "s3"

    def log_message(self, fmt, *args):
        return

    def _body(self):
        if self.mode == "s3" and "list-type=2" in self.path:
            size = len(CSV)
            return (
                f"""<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult>
  <IsTruncated>false</IsTruncated>
  <Contents>
    <Key>data.csv</Key>
    <LastModified>2020-01-01T00:00:00.000Z</LastModified>
    <ETag>&quot;abc&quot;</ETag>
    <Size>{size}</Size>
  </Contents>
  <KeyCount>1</KeyCount>
</ListBucketResult>
"""
            ).encode()
        if self.path.split("?", 1)[0].endswith("/api/rows"):
            return b'[{"id":1}]'
        return CSV

    def _handle(self, method):
        if self.stall.on.is_set():
            time.sleep(OBSERVE_S + 15)
        body = self._body()
        content_type = "application/xml" if b"ListBucketResult" in body else "text/csv"
        if body.startswith(b"["):
            content_type = "application/json"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("ETag", '"abc"')
        self.end_headers()
        if method != "HEAD":
            try:
                self.wfile.write(body)
            except BrokenPipeError:
                return

    def do_GET(self):
        self._handle("GET")

    def do_HEAD(self):
        self._handle("HEAD")


def serve(port, stall, mode):
    handler = type(
        "BoundOrigin",
        (Origin,),
        {"stall": stall, "mode": mode},
    )
    httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def free_port():
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


def sql(port, statement, timeout, api_key=None):
    headers = {"Content-Type": "text/plain"}
    if api_key is not None:
        headers["X-API-Key"] = api_key
    req = urllib.request.Request(
        f"http://127.0.0.1:{port}/v1/sql",
        data=statement.encode(),
        method="POST",
        headers=headers,
    )
    started = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return time.time() - started, resp.status, resp.read().decode()
    except urllib.error.HTTPError as exc:
        return time.time() - started, exc.code, exc.read().decode(errors="replace")
    except Exception as exc:
        return time.time() - started, None, f"{type(exc).__name__}: {exc}"


def wait_ready(port, log_path):
    deadline = time.time() + 30
    last = ""
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/v1/ready", timeout=2) as resp:
                if resp.status == 200:
                    return
        except Exception as exc:
            last = str(exc)
        time.sleep(0.2)
    log_tail = ""
    try:
        with open(log_path, errors="replace") as fh:
            log_tail = fh.read()[-2000:]
    except OSError:
        pass
    raise AssertionError(f"runtime did not become ready ({last})\n{log_tail}")


class QueryTimeoutPlanningTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        version = subprocess.run(
            [SPICED, "--version"],
            check=True,
            capture_output=True,
            text=True,
        )
        if "2.4.3" not in version.stdout and os.environ.get("SPICED_ALLOW_OTHER_VERSION") != "1":
            raise AssertionError(
                f"{SPICED} --version must be the v2.4.3 runtime these tests describe, "
                f"got {version.stdout!r}. Set SPICED_ALLOW_OTHER_VERSION=1 to run a fixed binary."
            )

    def test_s3_listing_planning_releases_the_admission_permit(self):
        self._assert_planning_wait_releases_permit(auth=False)

    def test_read_only_api_key_can_run_the_same_listing_query(self):
        self._assert_planning_wait_releases_permit(auth=True)

    def test_http_file_listing_planning_releases_the_admission_permit(self):
        self._assert_http_file_listing()

    def test_dynamic_http_fetch_already_releases_the_admission_permit(self):
        port = free_port()
        http_port = free_port()
        stall = Stall()
        serve(port, stall, "http")
        directory = self._pod(
            f"""
datasets:
  - from: http://127.0.0.1:{port}/api/rows
    name: api_rows
    params:
      client_timeout: 12
"""
        )
        stalled, other = self._run(directory, http_port, stall, "SELECT COUNT(*) FROM api_rows")
        self.assertEqual(stalled[1], 504, stalled)
        self.assertLess(stalled[0], QUERY_TIMEOUT_S + 2, stalled)
        self.assertIn("exceeded the configured timeout", stalled[2])
        self.assertEqual(other[1], 200, other)
        self.assertLess(other[0], QUERY_TIMEOUT_S, other)

    def _assert_planning_wait_releases_permit(self, auth):
        port = free_port()
        http_port = free_port()
        stall = Stall()
        serve(port, stall, "s3")
        api_key = secrets.token_hex(16) if auth else None
        auth_yaml = ""
        if auth:
            # Generated for this process only. No suffix: Spice treats the key as read-only.
            auth_yaml = f"""
  auth:
    api-key:
      enabled: true
      keys:
        - {api_key}
"""
        directory = self._write(
            self._runtime(auth_yaml)
            + f"""
datasets:
  - from: s3://test-bucket/data.csv
    name: listings
    params:
      file_format: csv
      s3_endpoint: http://127.0.0.1:{port}
      s3_region: us-east-1
      s3_auth: public
      s3_url_style: path
      allow_http: true
      client_timeout: {CLIENT_TIMEOUT}
      s3_versioning: disabled
"""
        )
        stalled, other = self._run(
            directory,
            http_port,
            stall,
            "SELECT COUNT(*) FROM listings",
            api_key=api_key,
        )
        self._assert_released(stalled, other)

    def _assert_http_file_listing(self):
        port = free_port()
        http_port = free_port()
        stall = Stall()
        serve(port, stall, "http")
        directory = self._write(
            self._runtime("")
            + f"""
datasets:
  - from: http://127.0.0.1:{port}/data.csv
    name: http_rows
    params:
      file_format: csv
      client_timeout: {CLIENT_TIMEOUT}
"""
        )
        stalled, other = self._run(
            directory, http_port, stall, "SELECT COUNT(*) FROM http_rows"
        )
        self._assert_released(stalled, other)

    def _assert_released(self, stalled, other):
        self.assertEqual(
            stalled[1],
            504,
            f"planning wait must end with the query timeout, got {stalled}",
        )
        self.assertLess(
            stalled[0],
            QUERY_TIMEOUT_S + 2,
            f"planning wait ran past the query timeout: {stalled}",
        )
        self.assertIn("exceeded the configured timeout", stalled[2])
        self.assertEqual(
            other[1],
            200,
            f"a second query must run while the first is still within its connector timeout, got {other}",
        )
        self.assertLess(other[0], 1.0, other)
        self.assertIn('"n":7', other[2])

    def _runtime(self, auth_yaml):
        return f"""version: v1
kind: Spicepod
name: query-timeout-planning
runtime:
{auth_yaml}
  query:
    timeout: {QUERY_TIMEOUT_S}s
    max_concurrent_queries: 1
"""

    def _pod(self, body):
        return self._write(
            f"""version: v1
kind: Spicepod
name: query-timeout-planning
runtime:
  query:
    timeout: {QUERY_TIMEOUT_S}s
    max_concurrent_queries: 1
{body}
"""
        )

    def _write(self, text):
        import tempfile

        directory = tempfile.mkdtemp(prefix="spice-timeout-")
        with open(os.path.join(directory, "spicepod.yaml"), "w") as fh:
            fh.write(text)
        self.addCleanup(lambda: subprocess.run(["rm", "-rf", directory], check=False))
        return directory

    def _run(self, directory, http_port, stall, statement, api_key=None):
        flight = free_port()
        node = free_port()
        log_path = os.path.join(directory, "spiced.log")
        log = open(log_path, "w")
        self.addCleanup(log.close)
        proc = subprocess.Popen(
            [
                SPICED,
                directory,
                "--http",
                f"127.0.0.1:{http_port}",
                "--flight",
                f"127.0.0.1:{flight}",
                "--node-bind-address",
                f"127.0.0.1:{node}",
            ],
            stdout=log,
            stderr=subprocess.STDOUT,
            cwd=directory,
        )
        self.addCleanup(proc.kill)
        try:
            wait_ready(http_port, log_path)
            warmup = sql(http_port, "SELECT 1 AS n", 10, api_key=api_key)
            self.assertEqual(warmup[1], 200, warmup)
            stall.on.set()
            results = {}

            def run(label, text):
                results[label] = sql(http_port, text, OBSERVE_S, api_key=api_key)

            stalled = threading.Thread(target=run, args=("stalled", statement))
            stalled.start()
            time.sleep(0.5)
            other = threading.Thread(target=run, args=("other", "SELECT 7 AS n"))
            other.start()
            stalled.join()
            other.join()
            return results["stalled"], results["other"]
        finally:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()


if __name__ == "__main__":
    unittest.main()
