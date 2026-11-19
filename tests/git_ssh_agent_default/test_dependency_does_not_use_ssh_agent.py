#!/usr/bin/env python3
"""Spice v2.4 Git datasets must not use the process ssh-agent unless asked.

A dependency Spicepod can name an SSH Git remote, set fetch_content, and omit
git_ssh_key and git_ssh_use_agent. These tests fail while the runtime then
authenticates with the process ssh-agent, clones the repository, and serves
the file bytes on the unauthenticated SQL API. They pass once the agent is
used only when that dataset sets git_ssh_use_agent to true.

The explicit-true case is the control: it must still succeed after the fix.
The omitted-flag and explicit-false cases are the spec.

Run:
    python3 tests/git_ssh_agent_default/test_dependency_does_not_use_ssh_agent.py

SPICE_BIN and SPICED_BIN override the CLI and runtime. Unset, the test uses
the Spice v2.4.3 release binaries, which are the version these docs describe.
"""

from __future__ import annotations

import io
import os
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import textwrap
import time
import unittest
import urllib.error
import urllib.request
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SPICE_VERSION = "2.4.3"
RELEASE_REPO = "spiceai/spiceai"
BIN_CACHE = Path(os.environ.get("SPICE_BIN_CACHE", "/tmp/spice-v2.4.3-bins"))
QUERY_TIMEOUT_S = 90
POLL_S = 1.0


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def _run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    kwargs.setdefault("check", True)
    kwargs.setdefault("text", True)
    kwargs.setdefault("capture_output", True)
    return subprocess.run(cmd, **kwargs)


def _download_release_binaries() -> tuple[Path, Path]:
    spice = Path(os.environ["SPICE_BIN"]) if os.environ.get("SPICE_BIN") else BIN_CACHE / "spice"
    spiced = (
        Path(os.environ["SPICED_BIN"]) if os.environ.get("SPICED_BIN") else BIN_CACHE / "spiced"
    )
    if spice.is_file() and spiced.is_file() and os.access(spice, os.X_OK) and os.access(spiced, os.X_OK):
        return spice, spiced
    if os.environ.get("SPICE_BIN") or os.environ.get("SPICED_BIN"):
        missing = [str(path) for path in (spice, spiced) if not path.is_file()]
        raise SystemExit(f"SPICE_BIN/SPICED_BIN is not an executable file: {missing}")

    BIN_CACHE.mkdir(parents=True, exist_ok=True)
    archives = {
        "spice_linux_x86_64.tar.gz": spice,
        "spiced_linux_x86_64.tar.gz": spiced,
    }
    for name in archives:
        archive = BIN_CACHE / name
        if not archive.is_file():
            _run(
                [
                    "gh",
                    "release",
                    "download",
                    f"v{SPICE_VERSION}",
                    "--repo",
                    RELEASE_REPO,
                    "--pattern",
                    name,
                    "--dir",
                    str(BIN_CACHE),
                ]
            )
        _run(["tar", "-xzf", str(archive), "-C", str(BIN_CACHE)])
    return spice, spiced


class _ZipRegistry(BaseHTTPRequestHandler):
    zip_bytes = b""
    expected_path = ""

    def do_GET(self) -> None:  # noqa: N802
        if self.path.split("?", 1)[0] != self.expected_path:
            body = f"unexpected registry path {self.path}".encode()
            self.send_response(404)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/zip")
        self.send_header("Content-Length", str(len(self.zip_bytes)))
        self.end_headers()
        self.wfile.write(self.zip_bytes)

    def log_message(self, fmt: str, *args) -> None:
        return


def _spicepod_zip(manifest: str) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("spicepod.yaml", manifest)
    return buffer.getvalue()


class SshGit(unittest.TestCase):
    """One local sshd, one ssh-agent, and the v2.4.3 Spice binaries."""

    @classmethod
    def setUpClass(cls) -> None:
        if not Path("/usr/sbin/sshd").is_file():
            raise RuntimeError("OpenSSH server is not installed")
        if shutil.which("git") is None or shutil.which("ssh-agent") is None:
            raise RuntimeError("git or ssh-agent is not installed")
        lfs = subprocess.run(["git", "lfs", "version"], capture_output=True, text=True)
        if lfs.returncode != 0:
            raise RuntimeError(f"git-lfs is not installed: {lfs.stderr}")
        cls.spice, cls.spiced = _download_release_binaries()
        cls.user = _run(["id", "-un"]).stdout.strip()
        cls.work = Path(tempfile.mkdtemp(prefix="spice-git-ssh-agent-"))
        cls.home = cls.work / "home"
        (cls.home / ".ssh").mkdir(parents=True)
        cls._start_sshd()
        cls._start_agent()
        cls.repo = cls._make_repo()

    @classmethod
    def tearDownClass(cls) -> None:
        cls._stop(getattr(cls, "agent_pid", None))
        sshd = getattr(cls, "sshd_proc", None)
        if sshd is not None and sshd.poll() is None:
            try:
                os.killpg(sshd.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                sshd.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(sshd.pid, signal.SIGKILL)
        work = getattr(cls, "work", None)
        if work is not None:
            shutil.rmtree(work, ignore_errors=True)

    @classmethod
    def _stop(cls, pid: int | None) -> None:
        if not pid:
            return
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            return

    @classmethod
    def _start_sshd(cls) -> None:
        host_key = cls.work / "host_key"
        _run(["ssh-keygen", "-t", "ed25519", "-f", str(host_key), "-N", "", "-q"])
        user_key = cls.work / "user_key"
        _run(["ssh-keygen", "-t", "ed25519", "-f", str(user_key), "-N", "", "-q"])
        os.chmod(user_key, 0o600)
        cls.user_key = user_key
        authorized = cls.work / "authorized_keys"
        authorized.write_text(user_key.with_suffix(".pub").read_text(encoding="utf-8"), encoding="utf-8")
        cls.sshd_port = _free_port()
        cls.sshd_log = cls.work / "sshd.log"
        config = cls.work / "sshd_config"
        config.write_text(
            textwrap.dedent(
                f"""\
                Port {cls.sshd_port}
                ListenAddress 127.0.0.1
                HostKey {host_key}
                PidFile {cls.work / "sshd.pid"}
                AuthorizedKeysFile {authorized}
                StrictModes no
                PasswordAuthentication no
                KbdInteractiveAuthentication no
                ChallengeResponseAuthentication no
                UsePAM no
                PubkeyAuthentication yes
                LogLevel VERBOSE
                AllowUsers {cls.user}
                """
            ),
            encoding="utf-8",
        )
        proc = subprocess.Popen(
            ["/usr/sbin/sshd", "-f", str(config), "-E", str(cls.sshd_log), "-D"],
            start_new_session=True,
        )
        cls.sshd_proc = proc
        cls.sshd_pid = proc.pid
        deadline = time.time() + 5
        while time.time() < deadline:
            try:
                log_text = cls.sshd_log.read_text(encoding="utf-8", errors="replace")
            except FileNotFoundError:
                log_text = ""
            if "Server listening" in log_text:
                break
            if proc.poll() is not None:
                raise RuntimeError(log_text or f"sshd exited {proc.returncode}")
            time.sleep(0.05)
        else:
            raise RuntimeError(f"sshd did not listen: {log_text}")
        scanned = _run(
            [
                "ssh-keyscan",
                "-p",
                str(cls.sshd_port),
                "-t",
                "ed25519",
                "127.0.0.1",
            ]
        ).stdout
        known = cls.home / ".ssh" / "known_hosts"
        known.write_text(scanned, encoding="utf-8")
        # libgit2 matches the host from the ssh:// URL with and without brackets.
        for line in scanned.splitlines():
            if line.startswith("#") or not line.strip():
                continue
            parts = line.split()
            if len(parts) >= 3:
                known.write_text(
                    known.read_text(encoding="utf-8")
                    + f"127.0.0.1 {' '.join(parts[1:])}\n",
                    encoding="utf-8",
                )

    @classmethod
    def _start_agent(cls) -> None:
        out = _run(["ssh-agent", "-s"]).stdout
        sock = None
        pid = None
        for line in out.splitlines():
            if line.startswith("SSH_AUTH_SOCK="):
                sock = line.split("=", 1)[1].split(";", 1)[0]
            if line.startswith("SSH_AGENT_PID="):
                pid = int(line.split("=", 1)[1].split(";", 1)[0])
        if not sock or not pid:
            raise RuntimeError(f"ssh-agent did not report a socket: {out}")
        cls.agent_sock = sock
        cls.agent_pid = pid
        _run(["ssh-add", str(cls.user_key)], env={**os.environ, "SSH_AUTH_SOCK": sock})

    @classmethod
    def _git_env(cls) -> dict[str, str]:
        env = os.environ.copy()
        env.update(
            {
                "HOME": str(cls.home),
                "GIT_AUTHOR_NAME": "Spice Test",
                "GIT_AUTHOR_EMAIL": "spice-test@example.com",
                "GIT_COMMITTER_NAME": "Spice Test",
                "GIT_COMMITTER_EMAIL": "spice-test@example.com",
                "GIT_CONFIG_NOSYSTEM": "1",
                "GIT_CONFIG_GLOBAL": "/dev/null",
            }
        )
        env.pop("GIT_SSH_COMMAND", None)
        return env

    @classmethod
    def _make_repo(cls) -> Path:
        work = cls.work / "src"
        bare = cls.work / "private.git"
        work.mkdir()
        env = cls._git_env()
        _run(["git", "init", "-b", "main", str(work)], env=env)
        _run(["git", "-C", str(work), "lfs", "install", "--local"], env=env)
        (work / ".gitattributes").write_text("secret.bin filter=lfs diff=lfs merge=lfs -text\n", encoding="utf-8")
        (work / "secret.txt").write_text("plain-text-body\n", encoding="utf-8")
        (work / "secret.bin").write_bytes(b"lfs-object-body\n")
        _run(["git", "-C", str(work), "add", ".gitattributes", "secret.txt", "secret.bin"], env=env)
        _run(["git", "-C", str(work), "commit", "-m", "add files"], env=env)
        _run(["git", "clone", "--bare", str(work), str(bare)], env=env)
        lfs_src = work / ".git" / "lfs" / "objects"
        lfs_dst = bare / "lfs" / "objects"
        if lfs_src.is_dir():
            shutil.copytree(lfs_src, lfs_dst, dirs_exist_ok=True)
        return bare

    def setUp(self) -> None:
        self.runtime: subprocess.Popen | None = None
        self.registry: ThreadingHTTPServer | None = None
        self.log_mark = self.sshd_log.stat().st_size

    def tearDown(self) -> None:
        if self.runtime is not None and self.runtime.poll() is None:
            try:
                os.killpg(self.runtime.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                self.runtime.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(self.runtime.pid, signal.SIGKILL)
        if self.registry is not None:
            self.registry.shutdown()
            self.registry.server_close()

    def _accepted_since_setup(self) -> str:
        text = self.sshd_log.read_text(encoding="utf-8", errors="replace")[self.log_mark :]
        return "\n".join(line for line in text.splitlines() if "Accepted publickey" in line)

    def _child_env(self) -> dict[str, str]:
        env = self._git_env()
        env["SSH_AUTH_SOCK"] = self.agent_sock
        env.pop("SSH_AGENT_PID", None)
        return env

    def _serve(self, manifest: str) -> str:
        port = _free_port()
        path = "/v1/spicepods/attacker/private-files"
        handler = type(
            "Handler",
            (_ZipRegistry,),
            {"zip_bytes": _spicepod_zip(manifest), "expected_path": path},
        )
        server = ThreadingHTTPServer(("127.0.0.1", port), handler)
        self.registry = server
        import threading

        threading.Thread(target=server.serve_forever, daemon=True).start()
        return f"http://127.0.0.1:{port}/v1"

    def _manifest(
        self,
        *,
        agent: str | None,
        fetch_content: bool,
        enable_lfs: bool,
        cache: Path,
        include: str,
        scheme: str = "ssh",
    ) -> str:
        params = [
            f"      fetch_content: {'true' if fetch_content else 'false'}",
            f"      cache_path: {cache}",
            f"      include: '{include}'",
        ]
        if enable_lfs:
            params.append("      enable_lfs: true")
        if agent is not None:
            params.append(f"      git_ssh_use_agent: {agent}")
        url = f"git:{scheme}://{self.user}@127.0.0.1:{self.sshd_port}{self.repo}"
        body = "\n".join(params)
        return (
            "version: v1\n"
            "kind: Spicepod\n"
            "name: private-files\n"
            "datasets:\n"
            f"  - from: {url}\n"
            "    name: private_files\n"
            "    params:\n"
            f"{body}\n"
        )

    def _add_and_start(self, manifest: str) -> tuple[Path, Path, int]:
        app = Path(tempfile.mkdtemp(prefix="spice-app-", dir=self.work))
        base = self._serve(manifest)
        env = self._child_env()
        env["SPICERACK_BASE_URL"] = base
        added = subprocess.run(
            [str(self.spice), "add", "attacker/private-files"],
            cwd=app,
            env=env,
            text=True,
            capture_output=True,
        )
        installed = app / "spicepods" / "attacker" / "private-files" / "spicepod.yaml"
        self.assertEqual(
            added.returncode,
            0,
            f"spice add failed\nstdout:\n{added.stdout}\nstderr:\n{added.stderr}",
        )
        self.assertTrue(installed.is_file(), "spice add did not install the dependency manifest")
        root = (app / "spicepod.yaml").read_text(encoding="utf-8")
        self.assertIn("attacker/private-files", root)
        self.assertNotIn("auth:", root)
        http_port = _free_port()
        flight_port = _free_port()
        log = app / "spiced.log"
        log_handle = log.open("w", encoding="utf-8")
        self.addCleanup(log_handle.close)
        self.runtime = subprocess.Popen(
            [
                str(self.spiced),
                "--http",
                f"127.0.0.1:{http_port}",
                "--flight",
                f"127.0.0.1:{flight_port}",
            ],
            cwd=app,
            env=self._child_env(),
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        self.runtime_log = log
        return app, log, http_port

    def _query(self, http_port: int, sql: str) -> tuple[int, str]:
        request = urllib.request.Request(
            f"http://127.0.0.1:{http_port}/v1/sql",
            data=sql.encode(),
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                return response.status, response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as error:
            return error.code, error.read().decode("utf-8", errors="replace")
        except (urllib.error.URLError, TimeoutError, ConnectionError) as error:
            return 0, str(error)

    def _wait(self, http_port: int, marker: str) -> tuple[int, str]:
        deadline = time.time() + QUERY_TIMEOUT_S
        settled_at: float | None = None
        accepted_at: float | None = None
        last = (0, "")
        while time.time() < deadline:
            if self.runtime is not None and self.runtime.poll() is not None:
                break
            status, body = self._query(http_port, "SELECT path, content FROM private_files")
            last = (status, body)
            if marker in body:
                return status, body
            # Give the SQL response a moment to catch up with an agent login,
            # then stop. A refusal has no login and no file bytes.
            if self._accepted_since_setup():
                accepted_at = accepted_at or time.time()
                if time.time() - accepted_at > 2:
                    return status, body
            log = self._runtime_log()
            if (
                "Spice runtime is ready" in log
                or "Authentication failed" in log
                or "Failed to initialize dataset private_files" in log
            ):
                settled_at = settled_at or time.time()
                if time.time() - settled_at > 3 and not self._accepted_since_setup():
                    return status, body
            time.sleep(POLL_S)
        return last

    def _runtime_log(self) -> str:
        log = getattr(self, "runtime_log", None)
        if log is None or not log.is_file():
            return ""
        return log.read_text(encoding="utf-8", errors="replace")

    def _assert_no_agent_use(self, cache: Path, marker: str, status: int, body: str) -> None:
        authenticated = "Accepted publickey" in self._accepted_since_setup()
        cloned = (cache / "HEAD").exists() or (cache / ".git").exists() or (cache / "objects").exists()
        self.assertFalse(
            authenticated,
            "the runtime authenticated to the private repository with the process ssh-agent "
            f"(sql {status})",
        )
        self.assertNotIn(marker, body, f"SQL returned the private file (sql {status})")
        self.assertFalse(
            cloned,
            f"the runtime cloned the private repository into {cache} before refusing",
        )

    def _case(
        self,
        *,
        agent: str | None,
        fetch_content: bool,
        enable_lfs: bool,
        include: str,
        marker: str,
        scheme: str = "ssh",
    ) -> tuple[int, str, Path]:
        cache = self.work / f"cache-{scheme}-{agent}-{enable_lfs}-{fetch_content}-{include}"
        manifest = self._manifest(
            agent=agent,
            fetch_content=fetch_content,
            enable_lfs=enable_lfs,
            cache=cache,
            include=include,
            scheme=scheme,
        )
        _app, _log, http_port = self._add_and_start(manifest)
        status, body = self._wait(http_port, marker)
        return status, body, cache

    def test_explicit_agent_reads_private_file_without_an_api_key(self) -> None:
        marker = (self.work / "src" / "secret.txt").read_text(encoding="utf-8").strip()
        status, body, _cache = self._case(
            agent="true",
            fetch_content=True,
            enable_lfs=False,
            include="secret.txt",
            marker=marker,
        )
        self.assertEqual(
            status,
            200,
            "a dataset that sets git_ssh_use_agent: true must be readable without an API key "
            f"(runtime.auth is unset)\nruntime log:\n{self._runtime_log()}\nbody:\n{body}",
        )
        self.assertIn(marker, body, "explicit agent opt-in did not return the file")
        self.assertTrue("Accepted publickey" in self._accepted_since_setup())

    def test_omitted_agent_flag_does_not_clone_or_serve_the_file(self) -> None:
        marker = (self.work / "src" / "secret.txt").read_text(encoding="utf-8").strip()
        status, body, cache = self._case(
            agent=None,
            fetch_content=True,
            enable_lfs=False,
            include="secret.txt",
            marker=marker,
        )
        self._assert_no_agent_use(cache, marker, status, body)

    def test_explicit_false_does_not_clone_or_serve_the_file(self) -> None:
        marker = (self.work / "src" / "secret.txt").read_text(encoding="utf-8").strip()
        status, body, cache = self._case(
            agent="false",
            fetch_content=True,
            enable_lfs=False,
            include="secret.txt",
            marker=marker,
        )
        self._assert_no_agent_use(cache, marker, status, body)

    def test_omitted_agent_flag_with_lfs_does_not_clone_or_serve_the_file(self) -> None:
        marker = (self.work / "src" / "secret.bin").read_bytes().decode().strip()
        status, body, cache = self._case(
            agent=None,
            fetch_content=True,
            enable_lfs=True,
            include="secret.bin",
            marker=marker,
        )
        self._assert_no_agent_use(cache, marker, status, body)

    def test_omitted_agent_flag_git_plus_ssh_scheme_does_not_clone(self) -> None:
        marker = (self.work / "src" / "secret.txt").read_text(encoding="utf-8").strip()
        status, body, cache = self._case(
            agent=None,
            fetch_content=True,
            enable_lfs=False,
            include="secret.txt",
            marker=marker,
            scheme="git+ssh",
        )
        self._assert_no_agent_use(cache, marker, status, body)


if __name__ == "__main__":
    unittest.main(verbosity=2)
