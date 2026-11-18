#!/usr/bin/env python3
"""Unresolved dataset secret references must not load the dataset.

Spice v2.4.2 replaces a ${store:key} reference that no store can resolve
with an empty string, then loads the dataset. When the upstream accepts that
empty credential, the dataset becomes ready and /v1/sql returns its rows with
no API key. These tests assert the fail-closed behavior: no upstream request
carrying the substituted value, the dataset not ready, and no rows from an
unauthenticated query.

A secret whose stored value is empty is resolved. That dataset may load.

The same substitution still runs for an acceleration parameter and a model
parameter in v2.4.3. Those components must fail closed the same way, before
the empty string is parsed or handed to the provider.
"""

import base64
import json
import os
import signal
import socket
import subprocess
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

USER = "reader"
SECRET = "DATASET_PASSWORD"
EMBEDDED_PREFIX = "mysql://reader:"
EMBEDDED_SUFFIX = "@127.0.0.1:9/db"
EMBEDDED_SUBSTITUTED = EMBEDDED_PREFIX + EMBEDDED_SUFFIX

DATASETS = (
    ("exact_password", "/exact.csv", "empty", "exact-marker-alpha"),
    ("embedded_password", "/embedded.csv", "embedded-substituted", "embedded-marker-bravo"),
    ("undefined_store", "/undefined-store.csv", "empty", "undefined-marker-charlie"),
)


def classify_authorization(header):
    if not header or not header.startswith("Basic "):
        return "missing"
    try:
        decoded = base64.b64decode(header[6:], validate=True).decode("utf-8")
    except (ValueError, UnicodeError):
        return "undecodable"
    user, sep, password = decoded.partition(":")
    if sep != ":" or user != USER:
        return "other"
    if password == "":
        return "empty"
    if password == EMBEDDED_SUBSTITUTED:
        return "embedded-substituted"
    return "other"


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


class Upstream:
    def __init__(self):
        self.events = []
        self.lock = threading.Lock()
        self.port = free_port()
        bodies = {path: f"id\n{marker}\n" for _, path, _, marker in DATASETS}
        bodies["/resolved.csv"] = "id\nresolved-marker-delta\n"
        accepted = {path: kind for _, path, kind, _ in DATASETS}
        accepted["/resolved.csv"] = "empty"

        outer = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, fmt, *args):
                return

            def _respond(self, send_body):
                kind = classify_authorization(self.headers.get("Authorization"))
                with outer.lock:
                    outer.events.append((self.command, self.path, kind))
                body = bodies.get(self.path)
                if body is None or kind != accepted.get(self.path):
                    self.send_response(401)
                    self.end_headers()
                    return
                payload = body.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/csv")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                if send_body:
                    self.wfile.write(payload)

            def do_GET(self):
                self._respond(True)

            def do_HEAD(self):
                self._respond(False)

        self.server = ThreadingHTTPServer(("127.0.0.1", self.port), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def snapshot(self):
        with self.lock:
            return list(self.events)

    def close(self):
        self.server.shutdown()


def wait_http(url, timeout):
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        try:
            with urlopen(url, timeout=2) as response:
                return response.status, response.read()
        except HTTPError as exc:
            return exc.code, exc.read()
        except (URLError, TimeoutError, ConnectionError) as exc:
            last = exc
            time.sleep(0.2)
    raise RuntimeError(f"timed out waiting for {url}: {last}")


def post_sql(base, sql):
    request = Request(
        base + "/v1/sql",
        data=sql.encode("utf-8"),
        headers={"Accept": "text/csv", "Content-Type": "text/plain"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            return response.status, response.read().decode("utf-8", "replace")
    except HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "replace")


def spicepod_text(upstream_port, resolved_empty):
    lines = [
        "version: v1",
        "kind: Spicepod",
        "name: unresolved-secret-spec",
        "datasets:",
    ]
    if resolved_empty:
        entries = (
            (
                "resolved_empty",
                "/resolved.csv",
                f"${{secrets:{SECRET}}}",
            ),
        )
    else:
        entries = []
        for name, path, _kind, _marker in DATASETS:
            if name == "embedded_password":
                password = f"{EMBEDDED_PREFIX}${{secrets:{SECRET}}}{EMBEDDED_SUFFIX}"
            elif name == "undefined_store":
                password = f"${{missing_store:{SECRET}}}"
            else:
                password = f"${{secrets:{SECRET}}}"
            entries.append((name, path, password))
    for name, path, password in entries:
        lines.append(f"  - from: http://{USER}@127.0.0.1:{upstream_port}{path}")
        lines.append(f"    name: {name}")
        lines.append("    params:")
        lines.append("      file_format: csv")
        lines.append(f"      http_password: {password}")
    return "\n".join(lines) + "\n"


def run_runtime(binary, upstream, resolved_empty):
    http_port = free_port()
    flight_port = free_port()
    work = tempfile.TemporaryDirectory(prefix="spice-secret-spec-")
    root = Path(work.name)
    (root / "spicepod.yaml").write_text(
        spicepod_text(upstream.port, resolved_empty), encoding="utf-8"
    )
    log_path = root / "spiced.log"
    log = open(log_path, "w", encoding="utf-8")
    env = os.environ.copy()
    env.pop(SECRET, None)
    env.pop("SPICE_" + SECRET, None)
    if resolved_empty:
        env[SECRET] = ""
    proc = subprocess.Popen(
        [
            binary,
            "--http",
            f"127.0.0.1:{http_port}",
            "--flight",
            f"127.0.0.1:{flight_port}",
            str(root),
        ],
        stdout=log,
        stderr=subprocess.STDOUT,
        env=env,
        start_new_session=True,
    )
    base = f"http://127.0.0.1:{http_port}"
    if resolved_empty:
        names = ["resolved_empty"]
    else:
        names = [name for name, *_rest in DATASETS]
    observed = {name: None for name in names}
    queries = {}
    try:
        wait_http(base + "/health", 90)
        deadline = time.time() + 15
        while time.time() < deadline:
            with urlopen(base + "/v1/datasets?status=true", timeout=10) as response:
                payload = json.loads(response.read().decode("utf-8"))
            by_name = {item.get("name"): item for item in payload}
            for name in names:
                item = by_name.get(name) or {}
                status = item.get("status")
                if status is not None:
                    observed[name] = status
            if all(observed[name] in ("Ready", "Error") for name in names):
                # Keep polling briefly so a retry can move Error to Ready.
                if all(observed[name] == "Ready" for name in names):
                    break
            time.sleep(0.4)
        markers = {name: marker for name, _path, _kind, marker in DATASETS}
        markers["resolved_empty"] = "resolved-marker-delta"
        for name in names:
            code, body = post_sql(base, f"SELECT id FROM {name}")
            queries[name] = (code, markers[name] in body)
    finally:
        try:
            os.killpg(proc.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            proc.wait(timeout=15)
        except subprocess.TimeoutExpired:
            os.killpg(proc.pid, signal.SIGKILL)
            proc.wait(timeout=10)
        log.close()
        work.cleanup()
    return observed, queries


UNRESOLVED = "Unable to resolve secret reference"
EMPTY_SUBSTITUTION = "The parameter will be empty"


def launch(binary, root, env):
    http_port = free_port()
    flight_port = free_port()
    log_path = root / "spiced.log"
    log = open(log_path, "w", encoding="utf-8")
    proc = subprocess.Popen(
        [
            binary,
            "--http",
            f"127.0.0.1:{http_port}",
            "--flight",
            f"127.0.0.1:{flight_port}",
            str(root),
        ],
        stdout=log,
        stderr=subprocess.STDOUT,
        env=env,
        start_new_session=True,
    )
    return proc, f"http://127.0.0.1:{http_port}", log, log_path


def stop(proc, log):
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        proc.wait(timeout=15)
    except subprocess.TimeoutExpired:
        os.killpg(proc.pid, signal.SIGKILL)
        proc.wait(timeout=10)
    log.close()


def clean_env():
    env = os.environ.copy()
    env.pop(SECRET, None)
    env.pop("SPICE_" + SECRET, None)
    return env


def acceleration_failures(binary):
    """An unresolved acceleration parameter must not be parsed as an empty value."""
    work = tempfile.TemporaryDirectory(prefix="spice-secret-accel-")
    root = Path(work.name)
    csv = root / "rows.csv"
    csv.write_text("id\naccel-marker-echo\n", encoding="utf-8")
    (root / "spicepod.yaml").write_text(
        f"""version: v1
kind: Spicepod
name: accel
datasets:
  - from: file:{csv}
    name: accel_rows
    params:
      file_format: csv
    acceleration:
      enabled: true
      engine: sqlite
      mode: memory
      params:
        busy_timeout: ${{secrets:{SECRET}}}
""",
        encoding="utf-8",
    )
    proc, base, log, log_path = launch(binary, root, clean_env())
    failures = []
    try:
        wait_http(base + "/health", 90)
        status = None
        message = ""
        deadline = time.time() + 12
        while time.time() < deadline:
            with urlopen(base + "/v1/datasets?status=true", timeout=10) as response:
                payload = json.loads(response.read().decode("utf-8"))
            item = next(entry for entry in payload if entry.get("name") == "accel_rows")
            status = item.get("status")
            message = item.get("error_message") or ""
            if status in ("Ready", "Error"):
                break
            time.sleep(0.3)
        code, body = post_sql(base, "SELECT id FROM accel_rows")
        log.flush()
        log_text = log_path.read_text(encoding="utf-8", errors="replace")
        print("acceleration_status", status)
        print("acceleration_names_unresolved", UNRESOLVED in message)
        print("acceleration_parsed_empty", "busy_timeout" in message)
        print("acceleration_logged_empty_substitution", EMPTY_SUBSTITUTION in log_text)
        print("acceleration_query_returned_row", code == 200 and "accel-marker-echo" in body)
        if status == "Ready" or (code == 200 and "accel-marker-echo" in body):
            failures.append("acceleration loaded with an unresolved secret reference")
        if "busy_timeout" in message or EMPTY_SUBSTITUTION in log_text:
            failures.append(
                "acceleration parsed the unresolved secret reference as an empty value"
            )
        if UNRESOLVED not in message:
            failures.append(
                "acceleration error did not report the unresolved secret reference"
            )
    finally:
        stop(proc, log)
        work.cleanup()
    return failures


def model_failures(binary):
    """An unresolved model parameter must not be passed to the provider."""
    work = tempfile.TemporaryDirectory(prefix="spice-secret-model-")
    root = Path(work.name)
    (root / "spicepod.yaml").write_text(
        f"""version: v1
kind: Spicepod
name: model
models:
  - from: anthropic:not-a-model
    name: writer
    params:
      anthropic_api_key: ${{secrets:{SECRET}}}
""",
        encoding="utf-8",
    )
    proc, base, log, log_path = launch(binary, root, clean_env())
    failures = []
    try:
        wait_http(base + "/health", 90)
        deadline = time.time() + 8
        log_text = ""
        while time.time() < deadline:
            log.flush()
            log_text = log_path.read_text(encoding="utf-8", errors="replace")
            if "writer" in log_text and (
                UNRESOLVED in log_text or "Unknown anthropic model" in log_text
            ):
                break
            time.sleep(0.3)
        print("model_names_unresolved", UNRESOLVED in log_text)
        print("model_reached_provider", "Unknown anthropic model" in log_text)
        print("model_logged_empty_substitution", EMPTY_SUBSTITUTION in log_text)
        if "Unknown anthropic model" in log_text or EMPTY_SUBSTITUTION in log_text:
            failures.append(
                "model parameter substituted an empty value and continued loading"
            )
        if UNRESOLVED not in log_text:
            failures.append("model load did not report the unresolved secret reference")
    finally:
        stop(proc, log)
        work.cleanup()
    return failures


def main():
    binary = os.environ.get("SPICED_BIN")
    if not binary:
        print("SPICED_BIN is required", file=sys.stderr)
        return 2

    failures = []
    upstream = Upstream()
    try:
        before = len(upstream.snapshot())
        observed, queries = run_runtime(binary, upstream, resolved_empty=False)
        events = upstream.snapshot()[before:]
        print("unresolved_statuses", observed)
        print("unresolved_queries", {name: queries[name] for name in queries})
        print("unresolved_request_count", len(events))
        print(
            "unresolved_request_kinds",
            sorted({kind for _method, _path, kind in events}),
        )
        for name, _path, _kind, _marker in DATASETS:
            status = observed.get(name)
            code, leaked = queries[name]
            if status == "Ready":
                failures.append(f"{name} became ready")
            if leaked:
                failures.append(f"{name} returned its rows on /v1/sql with no API key (HTTP {code})")
        if events:
            failures.append(
                f"upstream saw {len(events)} request(s) for unresolved secret references"
            )

        before = len(upstream.snapshot())
        observed, queries = run_runtime(binary, upstream, resolved_empty=True)
        events = upstream.snapshot()[before:]
        print("resolved_empty_status", observed.get("resolved_empty"))
        print("resolved_empty_query", queries.get("resolved_empty"))
        kinds = sorted({kind for _method, path, kind in events if path == "/resolved.csv"})
        print("resolved_empty_kinds", kinds)
        status = observed.get("resolved_empty")
        query = queries.get("resolved_empty")
        if status != "Ready" or query is None or not query[1]:
            failures.append(
                "a secret stored as an empty value did not load the dataset"
            )
        if "empty" not in kinds:
            failures.append(
                "a secret stored as an empty value did not reach the upstream as that value"
            )

        failures.extend(acceleration_failures(binary))
        failures.extend(model_failures(binary))
    finally:
        upstream.close()

    if failures:
        print("FAIL")
        for item in failures:
            print("-", item)
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
