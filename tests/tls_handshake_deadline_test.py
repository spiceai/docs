#!/usr/bin/env python3
"""Handshake deadline for the Spice HTTP and metrics TLS listeners.

A client that can open a TCP connection to a TLS-enabled HTTP or metrics port
and send nothing must not keep that connection, or a graceful shutdown, open
past the deadline the Flight listener already enforces.

These checks fail while that deadline is missing. They pass once an incomplete
handshake on either listener is closed within 10 seconds, and once an
incomplete HTTP handshake no longer holds shutdown for the whole
``shutdown_timeout``. Run them against the runtime under test:

    SPICED_BIN=/path/to/spiced python3 tests/tls_handshake_deadline_test.py

The runtime binary is not part of this repository. ``SPICED_BIN`` must point
at the ``spiced`` to test. The certificate and key are generated in a
temporary directory when the test starts and are not stored in the repository.
"""

from __future__ import annotations

import os
import socket
import ssl
import subprocess
import tempfile
import time
import unittest
from pathlib import Path

# Flight already closes a silent handshake in 10 seconds. The same bound is
# what HTTP and metrics must meet. Wait a little past it so scheduling slack
# does not fail a runtime that did close the socket.
HANDSHAKE_DEADLINE_SECONDS = 10
OBSERVE_AFTER_SECONDS = 12

# Shorter than the 30 second default so the run stays small, and longer than
# the handshake deadline. A shutdown that waits for this whole value has not
# released the incomplete handshake. A shutdown that finishes before the
# observation bound has.
SHUTDOWN_TIMEOUT = "15s"
SHUTDOWN_LIMIT_SECONDS = 12.5

HTTP_PORT = 18090
FLIGHT_PORT = 15051
METRICS_PORT = 19090
# The shutdown case starts its own process so it can stop that process
# without taking down the listener the other cases are still using.
SHUTDOWN_HTTP_PORT = 18091
SHUTDOWN_FLIGHT_PORT = 15052
SHUTDOWN_METRICS_PORT = 19091


def spiced_binary() -> str:
    binary = os.environ.get("SPICED_BIN")
    if not binary:
        raise unittest.SkipTest("SPICED_BIN is not set")
    if not os.path.isfile(binary) or not os.access(binary, os.X_OK):
        raise unittest.SkipTest(f"SPICED_BIN is not an executable file: {binary}")
    return binary


def write_spicepod(root: Path) -> None:
    cert = root / "cert.pem"
    key = root / "key.pem"
    subprocess.run(
        [
            "openssl",
            "req",
            "-x509",
            "-newkey",
            "rsa:2048",
            "-keyout",
            str(key),
            "-out",
            str(cert),
            "-days",
            "1",
            "-nodes",
            "-subj",
            "/CN=localhost",
        ],
        check=True,
        capture_output=True,
    )
    os.chmod(key, 0o600)
    (root / "spicepod.yaml").write_text(
        "\n".join(
            [
                "version: v1",
                "kind: Spicepod",
                "name: handshake-deadline",
                "runtime:",
                f"  shutdown_timeout: {SHUTDOWN_TIMEOUT}",
                "  tls:",
                "    enabled: true",
                f"    certificate_file: {cert}",
                f"    key_file: {key}",
                "",
            ]
        ),
        encoding="utf-8",
    )


def start_spiced(root: Path, http_port: int, flight_port: int, metrics_port: int) -> tuple[subprocess.Popen[str], Path]:
    log_path = root / "spiced.log"
    log = log_path.open("w", encoding="utf-8")
    try:
        proc = subprocess.Popen(
            [
                spiced_binary(),
                "--http",
                f"127.0.0.1:{http_port}",
                "--flight",
                f"127.0.0.1:{flight_port}",
                "--metrics",
                f"127.0.0.1:{metrics_port}",
            ],
            cwd=root,
            stdout=log,
            stderr=subprocess.STDOUT,
            text=True,
        )
    finally:
        # The child keeps its own copy of this descriptor.
        log.close()
    deadline = time.time() + 30
    while time.time() < deadline:
        if proc.poll() is not None:
            log.flush()
            raise RuntimeError(
                "spiced exited during startup\n" + log_path.read_text(encoding="utf-8")[-4000:]
            )
        text = log_path.read_text(encoding="utf-8")
        if (
            "Spice runtime is ready" in text
            and "Metrics listening" in text
            and "Endpoints secured with TLS" in text
        ):
            return proc, log_path
        time.sleep(0.2)
    stop_spiced(proc)
    raise RuntimeError("spiced did not become ready\n" + log_path.read_text(encoding="utf-8")[-4000:])


def stop_spiced(proc: subprocess.Popen[str]) -> None:
    if proc.poll() is None:
        proc.terminate()
    try:
        proc.wait(timeout=40)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait(timeout=10)


class HandshakeDeadline(unittest.TestCase):
    spiced: subprocess.Popen[str]
    work: tempfile.TemporaryDirectory[str]
    log_path: Path

    @classmethod
    def setUpClass(cls) -> None:
        spiced_binary()
        cls.work = tempfile.TemporaryDirectory(prefix="spice-handshake-")
        root = Path(cls.work.name)
        write_spicepod(root)
        cls.spiced, cls.log_path = start_spiced(root, HTTP_PORT, FLIGHT_PORT, METRICS_PORT)

    @classmethod
    def tearDownClass(cls) -> None:
        proc = getattr(cls, "spiced", None)
        if proc is not None and proc.poll() is None:
            stop_spiced(proc)
        work = getattr(cls, "work", None)
        if work is not None:
            work.cleanup()

    def test_silent_http_handshake_is_closed(self) -> None:
        self.assertEqual(
            connection_state(("127.0.0.1", HTTP_PORT), OBSERVE_AFTER_SECONDS),
            "closed",
            "an HTTP client that sends nothing must be disconnected within the handshake deadline",
        )

    def test_silent_metrics_handshake_is_closed(self) -> None:
        self.assertEqual(
            connection_state(("127.0.0.1", METRICS_PORT), OBSERVE_AFTER_SECONDS),
            "closed",
            "a metrics client that sends nothing must be disconnected within the handshake deadline",
        )

    def test_several_silent_http_handshakes_are_closed(self) -> None:
        sockets = [socket.create_connection(("127.0.0.1", HTTP_PORT), timeout=5) for _ in range(3)]
        try:
            time.sleep(OBSERVE_AFTER_SECONDS)
            states = [recv_state(sock) for sock in sockets]
        finally:
            for sock in sockets:
                sock.close()
        self.assertEqual(
            states,
            ["closed", "closed", "closed"],
            "every incomplete HTTP handshake must be closed, not only the first",
        )

    def test_completed_http_handshake_stays_open_past_the_deadline(self) -> None:
        # The deadline covers the handshake only. A client that finished it
        # and has not sent a request is still inside the 30 second header
        # read bound, so the connection has to be open at 12 seconds.
        sock = socket.create_connection(("127.0.0.1", HTTP_PORT), timeout=5)
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        tls = context.wrap_socket(sock, server_hostname="localhost")
        try:
            time.sleep(OBSERVE_AFTER_SECONDS)
            state = recv_state(tls)
        finally:
            tls.close()
        self.assertEqual(state, "open")

    def test_flight_silent_handshake_is_closed(self) -> None:
        # Same binary, listener that already has the deadline. If this stays
        # open, the process under test is not enforcing the deadline anywhere
        # and the HTTP and metrics results are not comparable to it.
        self.assertEqual(
            connection_state(("127.0.0.1", FLIGHT_PORT), OBSERVE_AFTER_SECONDS),
            "closed",
        )

    def test_silent_http_handshake_does_not_hold_shutdown_for_the_full_timeout(self) -> None:
        work = tempfile.TemporaryDirectory(prefix="spice-handshake-shutdown-")
        self.addCleanup(work.cleanup)
        root = Path(work.name)
        write_spicepod(root)
        proc, _log_path = start_spiced(
            root, SHUTDOWN_HTTP_PORT, SHUTDOWN_FLIGHT_PORT, SHUTDOWN_METRICS_PORT
        )
        held = socket.create_connection(("127.0.0.1", SHUTDOWN_HTTP_PORT), timeout=5)
        try:
            time.sleep(0.3)
            started = time.perf_counter()
            proc.send_signal(15)
            try:
                proc.wait(timeout=40)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait(timeout=10)
                self.fail("spiced did not exit after the shutdown signal")
            elapsed = time.perf_counter() - started
        finally:
            held.close()
            if proc.poll() is None:
                stop_spiced(proc)
        self.assertLess(
            elapsed,
            SHUTDOWN_LIMIT_SECONDS,
            f"graceful shutdown took {elapsed:.2f}s, the full {SHUTDOWN_TIMEOUT} configured "
            "for a connection that never finished its handshake",
        )


def connection_state(address: tuple[str, int], wait: float) -> str:
    sock = socket.create_connection(address, timeout=5)
    try:
        time.sleep(wait)
        return recv_state(sock)
    finally:
        sock.close()


def recv_state(sock: socket.socket) -> str:
    sock.settimeout(0.5)
    try:
        data = sock.recv(16)
    except (socket.timeout, TimeoutError):
        return "open"
    except (ConnectionResetError, ssl.SSLError, OSError):
        return "closed"
    if data == b"":
        return "closed"
    return "open"


if __name__ == "__main__":
    unittest.main(verbosity=2)
