#!/usr/bin/env python3
"""Release installers must not install a substituted archive.

install.sh, install-spiced.sh, and Install.ps1 download a GitHub release asset and,
before the v2.4.3 scripts, extract it without comparing it to the sha256 recorded
for that asset. These tests serve a digest for one archive and a different archive
on the download the installer actually extracts. They fail while that download is
installed. They pass when the installer refuses a mismatch before it copies or runs
the file, including when a later download of the same URL returns the matching bytes.

The default scripts are the bytes install.spiceai.org was serving for v2.4.2
(spiceai/spiceai 435913ef54d2fc8473ace5ccf3eb8dbea2e2ab1a):

  install.sh         8a74b1dd315aa3eff0cd8454f5758492eaf9607aa8e53169aa47fc465bea7662
  install-spiced.sh  e87abe65fc32705c15c7b7c5586fde57da064c58d3807fbdf0ec9bf6aca33ffd
  Install.ps1        c5dd8c76f1bc00a1679f8ed0f573eaa3475ec12702a47ac29a94ab7efe1ba6d0

Set SPICE_INSTALL_SCRIPTS_DIR to run the same checks against another copy, such as
the v2.4.3 scripts. Run:

  python3 website/tests/install_checksum/test_release_archive_substitution.py
"""

from __future__ import annotations

import hashlib
import http.server
import io
import os
import shutil
import ssl
import subprocess
import sys
import tarfile
import tempfile
import threading
import textwrap
import unittest
import urllib.request
from pathlib import Path

SCRIPT_COMMIT = "435913ef54d2fc8473ace5ccf3eb8dbea2e2ab1a"
SCRIPT_SHA256 = {
    "install.sh": "8a74b1dd315aa3eff0cd8454f5758492eaf9607aa8e53169aa47fc465bea7662",
    "install-spiced.sh": "e87abe65fc32705c15c7b7c5586fde57da064c58d3807fbdf0ec9bf6aca33ffd",
    "Install.ps1": "c5dd8c76f1bc00a1679f8ed0f573eaa3475ec12702a47ac29a94ab7efe1ba6d0",
}
RAW_BASE = f"https://raw.githubusercontent.com/spiceai/spiceai/{SCRIPT_COMMIT}/install"
RELEASE_TAG = "v9.9.9-test"
ASSET_HOST = "release-assets.githubusercontent.com"
GITHUB_HOSTS = ("github.com", "api.github.com", ASSET_HOST)
SUBSTITUTED = b"SUBSTITUTED-ARCHIVE-BYTES"
LEGITIMATE = b"LEGITIMATE-ARCHIVE-BYTES"
DOCS = {
    "website/versioned_docs/version-2.1.x/installation.md": (
        "curl https://install.spiceai.org | /bin/bash",
        'DownloadString("https://install.spiceai.org/Install.ps1")',
    ),
    "website/versioned_docs/version-1.11.x/installation.md": (
        "curl https://install.spiceai.org | /bin/bash",
        'DownloadString("https://install.spiceai.org/Install.ps1")',
    ),
    "website/versioned_docs/version-1.8.x/installation.md": (
        "curl https://install.spiceai.org | /bin/bash",
        'DownloadString("https://install.spiceai.org/Install.ps1")',
    ),
    "website/versioned_docs/version-1.6.x/installation.md": (
        "curl https://install.spiceai.org | /bin/bash",
        'DownloadString("https://install.spiceai.org/Install.ps1")',
    ),
}

REPO_ROOT = Path(__file__).resolve().parents[3]
WORK = Path(tempfile.mkdtemp(prefix="spice-install-checksum-"))
SERVER: "ReleaseServer | None" = None
SCRIPTS: dict[str, Path] = {}


def _machine() -> tuple[str, str]:
    """Return the os and arch names the shell installers would use on this host."""
    raw = os.uname().machine
    arch = {"arm64": "aarch64", "amd64": "x86_64", "armv7l": "arm"}.get(raw, raw)
    system = os.uname().sysname.lower()
    if system.startswith(("mingw", "msys", "cygwin")):
        system = "windows"
    return system, arch


def _script_body(token: bytes, marker: Path | None) -> bytes:
    lines = ["#!/bin/sh", f"# {token.decode()}"]
    if marker is not None:
        lines.append(f"printf '%s\\n' {token.decode()} >> {marker}")
    lines.append("exit 0")
    lines.append("")
    return "\n".join(lines).encode()


def _tar_gz(member: str, payload: bytes) -> bytes:
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as archive:
        info = tarfile.TarInfo(name=member)
        info.size = len(payload)
        info.mode = 0o755
        info.type = tarfile.REGTYPE
        archive.addfile(info, io.BytesIO(payload))
    return buffer.getvalue()


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


class ReleaseState:
    """Bytes the stand-in returns for each release asset."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.mode = "mismatch"
        self.bodies: dict[str, tuple[bytes, bytes]] = {}
        self.hits: dict[str, int] = {}
        self.log: list[str] = []

    def reset(self, mode: str, bodies: dict[str, tuple[bytes, bytes]]) -> None:
        with self.lock:
            self.mode = mode
            self.bodies = bodies
            self.hits = {}
            self.log = []

    def asset(self, name: str) -> bytes | None:
        with self.lock:
            pair = self.bodies.get(name)
            if pair is None:
                self.log.append(f"unknown-asset {name}")
                return None
            count = self.hits.get(name, 0) + 1
            self.hits[name] = count
            bad, good = pair
            # The first body is the archive a substituted response delivers. A later
            # GET of the same URL returns the archive the recorded digest names, so a
            # check that downloads the asset again is not looking at the bytes it extracts.
            chosen = good if self.mode == "match" or count > 1 else bad
            self.log.append(f"asset {name} hit {count} {len(chosen)} {_sha256(chosen)[:12]}")
            return chosen

    def note(self, message: str) -> None:
        with self.lock:
            self.log.append(message)

    def snapshot(self) -> tuple[dict[str, int], list[str]]:
        with self.lock:
            return dict(self.hits), list(self.log)


class ReleaseHandler(http.server.BaseHTTPRequestHandler):
    server: "ReleaseServer"

    def log_message(self, fmt: str, *args) -> None:
        return

    def _send(self, status: int, body: bytes = b"", content_type: str = "application/octet-stream", headers: dict[str, str] | None = None) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Connection", "close")
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        host = self.headers.get("Host", "").split(":")[0]
        self.server.state.note(f"{host} {path}")
        prefix = f"/spiceai/spiceai/releases/download/{RELEASE_TAG}/"
        if path in (
            "/repos/spiceai/spiceai/releases/latest",
            f"/repos/spiceai/spiceai/releases/tags/{RELEASE_TAG}",
        ):
            self._send(200, self.server.release_json(), "application/json")
            return
        if path.startswith(prefix):
            name = path[len(prefix):]
            if name == "SHA256SUMS":
                # This release records digests on the asset objects and publishes no SHA256SUMS file.
                self._send(404, b"not found", "text/plain")
                return
            if host != ASSET_HOST:
                target = f"https://{ASSET_HOST}{path}"
                self._send(302, b"", headers={"Location": target})
                return
            body = self.server.state.asset(name)
            if body is None:
                self._send(404, b"not found", "text/plain")
                return
            self._send(200, body)
            return
        self._send(404, b"not found", "text/plain")


class ReleaseServer(http.server.ThreadingHTTPServer):
    def __init__(self, state: ReleaseState, cert: Path, key: Path) -> None:
        super().__init__(("127.0.0.1", 443), ReleaseHandler)
        self.state = state
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert, key)
        self.socket = context.wrap_socket(self.socket, server_side=True)

    def release_json(self) -> bytes:
        assets = []
        for name, (_bad, good) in self.state.bodies.items():
            digest = _sha256(good)
            assets.append(
                '{"name": "%s", "digest": "sha256:%s"}' % (name, digest)
            )
        asset_json = ",\n".join(assets)
        # install.sh takes the second whitespace field of the tag_name line and
        # requires a comma after the quoted tag. install-spiced.sh and Install.ps1
        # accept the same line. verifyDownload splits on commas and then reads the
        # digest on the line after the asset name.
        text = (
            "{\n"
            f'  "tag_name": "{RELEASE_TAG}",\n'
            '  "assets": [\n'
            f"{asset_json}\n"
            "  ]\n"
            "}\n"
        )
        return text.encode()


def _write_cert(directory: Path) -> tuple[Path, Path, Path]:
    ca_key = directory / "ca.key"
    ca_cert = directory / "ca.pem"
    server_key = directory / "server.key"
    server_csr = directory / "server.csr"
    server_cert = directory / "server.pem"
    san = directory / "san.cnf"
    san.write_text(
        "subjectAltName=" + ",".join(f"DNS:{host}" for host in GITHUB_HOSTS) + "\n",
        encoding="utf-8",
    )
    subprocess.run(
        ["openssl", "req", "-x509", "-newkey", "rsa:2048", "-keyout", str(ca_key), "-out", str(ca_cert), "-days", "2", "-nodes", "-subj", "/CN=install-checksum-test-ca"],
        check=True,
        capture_output=True,
    )
    subprocess.run(
        ["openssl", "req", "-newkey", "rsa:2048", "-keyout", str(server_key), "-out", str(server_csr), "-nodes", "-subj", "/CN=github.com"],
        check=True,
        capture_output=True,
    )
    subprocess.run(
        [
            "openssl", "x509", "-req", "-in", str(server_csr), "-CA", str(ca_cert), "-CAkey", str(ca_key),
            "-CAcreateserial", "-out", str(server_cert), "-days", "2", "-extfile", str(san),
        ],
        check=True,
        capture_output=True,
    )
    for path in (ca_cert, server_cert, server_key):
        path.chmod(0o644)
    return ca_cert, server_cert, server_key


def _hosts_file() -> Path:
    original = Path("/etc/hosts").read_text(encoding="utf-8", errors="replace")
    extra = "".join(f"127.0.0.1 {host}\n" for host in GITHUB_HOSTS)
    path = WORK / "hosts"
    path.write_text(extra + original, encoding="utf-8")
    return path


def _fetch_scripts() -> dict[str, Path]:
    override = os.environ.get("SPICE_INSTALL_SCRIPTS_DIR")
    destination = WORK / "scripts"
    destination.mkdir(exist_ok=True)
    found: dict[str, Path] = {}
    for name, expected in SCRIPT_SHA256.items():
        target = destination / name
        if override:
            source = Path(override) / name
            target.write_bytes(source.read_bytes())
        else:
            with urllib.request.urlopen(f"{RAW_BASE}/{name}", timeout=60) as response:
                target.write_bytes(response.read())
            actual = _sha256(target.read_bytes())
            if actual != expected:
                raise RuntimeError(f"{name} from {SCRIPT_COMMIT} hashed to {actual}, expected {expected}")
        target.chmod(0o755)
        found[name] = target
    return found


def _installer_env(home: Path, extra_env: dict[str, str]) -> dict[str, str]:
    env = {
        "HOME": str(home),
        "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
        "SHELL": "/bin/bash",
        "SSL_CERT_FILE": str(WORK / "ca.pem"),
        "SSL_CERT_DIR": str(WORK),
        "LANG": "C",
    }
    env.update(extra_env)
    return env


def _run_as_ubuntu(argv: list[str], env: dict[str, str], timeout: int) -> subprocess.CompletedProcess[str]:
    # argv runs as ubuntu with only the environment passed here, so an ambient
    # GITHUB_TOKEN or SPICE_INSTALL_ALLOW_UNVERIFIED cannot change the result.
    command = [
        "unshare", "--mount", "bash", "-c",
        'mount --bind "$1" /etc/hosts && shift && exec sudo -n -u ubuntu env "$@"',
        "bash",
        str(_hosts_file()),
        *[f"{key}={value}" for key, value in env.items()],
        *argv,
    ]
    return subprocess.run(command, text=True, capture_output=True, timeout=timeout, check=False)


def _run_shell(script: Path, home: Path, extra_env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    return _run_as_ubuntu(["bash", str(script)], _installer_env(home, extra_env), timeout=90)


def _assert_refused_substitution(test: unittest.TestCase, result: subprocess.CompletedProcess[str], install_path: Path, marker: Path, asset: str) -> None:
    hits, log = SERVER.state.snapshot()
    owner = install_path.stat().st_uid if install_path.is_file() else None
    detail = (
        f"exit={result.returncode} owner={owner}\n--- stdout ---\n{result.stdout}\n--- stderr ---\n{result.stderr}\n--- server ---\n"
        + "\n".join(log)
    )
    test.assertGreaterEqual(hits.get(asset, 0), 1, "the installer never downloaded the asset from the test server\n" + detail)
    installed = install_path.read_bytes() if install_path.is_file() else b""
    executed = marker.read_bytes() if marker.exists() else b""
    test.assertNotIn(SUBSTITUTED, installed, "the substituted archive was installed\n" + detail)
    test.assertNotIn(SUBSTITUTED, executed, "the substituted archive was executed\n" + detail)
    if result.returncode == 0:
        test.assertIn(LEGITIMATE, installed, "a zero exit installed bytes other than the archive named by the recorded digest\n" + detail)


def _assert_matching_install(test: unittest.TestCase, result: subprocess.CompletedProcess[str], install_path: Path, asset: str) -> None:
    hits, log = SERVER.state.snapshot()
    detail = f"exit={result.returncode}\n--- stdout ---\n{result.stdout}\n--- stderr ---\n{result.stderr}\n--- server ---\n" + "\n".join(log)
    test.assertGreaterEqual(hits.get(asset, 0), 1, "the installer never downloaded the asset from the test server\n" + detail)
    test.assertEqual(result.returncode, 0, detail)
    test.assertTrue(install_path.is_file(), detail)
    test.assertIn(LEGITIMATE, install_path.read_bytes(), detail)
    test.assertNotIn(SUBSTITUTED, install_path.read_bytes(), detail)


class ReleaseArchiveSubstitutionTest(unittest.TestCase):
    system, arch = _machine()

    @classmethod
    def setUpClass(cls) -> None:
        if (cls.system, cls.arch) not in {("linux", "x86_64"), ("linux", "aarch64"), ("darwin", "aarch64")}:
            raise unittest.SkipTest(f"{cls.system}-{cls.arch} is not a platform the shell installers support")

    def setUp(self) -> None:
        self.home = WORK / f"home-{self.id().split('.')[-1]}"
        if self.home.exists():
            shutil.rmtree(self.home)
        self.home.mkdir()
        subprocess.run(["chown", "ubuntu:ubuntu", str(self.home)], check=True)
        self.marker = self.home / "executed"
        self.good_payload = _script_body(LEGITIMATE, None)
        self.bad_payload = _script_body(SUBSTITUTED, self.marker)
        self.spice_asset = f"spice_{self.system}_{self.arch}.tar.gz"
        self.spiced_asset = f"spiced_{self.system}_{self.arch}.tar.gz"
        self.windows_asset = "spice.exe_windows_x86_64.tar.gz"
        bodies = {
            self.spice_asset: (
                _tar_gz("spice", self.bad_payload),
                _tar_gz("spice", self.good_payload),
            ),
            self.spiced_asset: (
                _tar_gz("spiced", self.bad_payload),
                _tar_gz("spiced", self.good_payload),
            ),
            self.windows_asset: (
                _tar_gz("spice.exe", self.bad_payload),
                _tar_gz("spice.exe", self.good_payload),
            ),
        }
        # Checked here so a fixture that install-spiced.sh would reject is not
        # confused with the installer refusing a checksum.
        for name, (bad, good) in bodies.items():
            member = "spice.exe" if name.startswith("spice.exe") else name.split("_", 1)[0]
            for blob in (bad, good):
                self._assert_tar_member(blob, member)
        SERVER.state.reset("mismatch", bodies)

    def _assert_tar_member(self, blob: bytes, member: str) -> None:
        path = WORK / "fixture.tar.gz"
        path.write_bytes(blob)
        listing = subprocess.run(["tar", "-tzf", str(path)], check=True, capture_output=True, text=True).stdout.splitlines()
        self.assertIn(member, listing)
        details = subprocess.run(["tar", "-tvzf", str(path), member], check=True, capture_output=True, text=True).stdout
        self.assertTrue(details.startswith("-"), details)
        self.assertNotIn("\n", details.strip())

    def test_versioned_install_pages_run_these_installers(self) -> None:
        for relative, snippets in DOCS.items():
            text = (REPO_ROOT / relative).read_text(encoding="utf-8")
            for snippet in snippets:
                self.assertIn(snippet, text, relative)

    def test_install_sh_refuses_substituted_archive(self) -> None:
        result = _run_shell(SCRIPTS["install.sh"], self.home, {})
        _assert_refused_substitution(
            self, result, self.home / ".spice" / "bin" / "spice", self.marker, self.spice_asset
        )

    def test_install_sh_refuses_substituted_archive_when_unverified_is_set(self) -> None:
        result = _run_shell(
            SCRIPTS["install.sh"],
            self.home,
            {"SPICE_INSTALL_ALLOW_UNVERIFIED": "1"},
        )
        _assert_refused_substitution(
            self, result, self.home / ".spice" / "bin" / "spice", self.marker, self.spice_asset
        )

    def test_install_sh_installs_archive_that_matches_recorded_digest(self) -> None:
        SERVER.state.reset("match", SERVER.state.bodies)
        result = _run_shell(SCRIPTS["install.sh"], self.home, {})
        _assert_matching_install(self, result, self.home / ".spice" / "bin" / "spice", self.spice_asset)

    def test_install_sh_sudo_copy_refuses_substituted_archive(self) -> None:
        install_dir = self.home / "system-bin"
        install_dir.mkdir()
        os.chmod(install_dir, 0o755)
        subprocess.run(["chown", "root:root", str(install_dir)], check=True)
        try:
            result = _run_shell(
                SCRIPTS["install.sh"],
                self.home,
                {"SPICE_CLI_INSTALL_DIR": str(install_dir)},
            )
            installed = install_dir / "spice"
            _assert_refused_substitution(self, result, installed, self.marker, self.spice_asset)
        finally:
            subprocess.run(["rm", "-rf", str(install_dir)], check=False)

    def test_install_spiced_sh_refuses_substituted_archive(self) -> None:
        install_dir = self.home / "spiced-bin"
        result = _run_shell(
            SCRIPTS["install-spiced.sh"],
            self.home,
            {"SPICED_INSTALL_DIR": str(install_dir)},
        )
        _assert_refused_substitution(self, result, install_dir / "spiced", self.marker, self.spiced_asset)

    def test_install_spiced_sh_installs_archive_that_matches_recorded_digest(self) -> None:
        SERVER.state.reset("match", SERVER.state.bodies)
        install_dir = self.home / "spiced-bin"
        result = _run_shell(
            SCRIPTS["install-spiced.sh"],
            self.home,
            {"SPICED_INSTALL_DIR": str(install_dir)},
        )
        _assert_matching_install(self, result, install_dir / "spiced", self.spiced_asset)

    def test_install_spiced_sh_sudo_system_dir_refuses_substituted_archive(self) -> None:
        installed = Path("/usr/local/bin/spiced")
        if installed.exists():
            self.fail(f"{installed} already exists; refusing to overwrite it")
        try:
            result = _run_shell(SCRIPTS["install-spiced.sh"], self.home, {})
            _assert_refused_substitution(self, result, installed, self.marker, self.spiced_asset)
        finally:
            subprocess.run(["rm", "-f", str(installed)], check=False)

    def test_install_ps1_refuses_substituted_archive(self) -> None:
        pwsh = shutil.which("pwsh")
        if pwsh is None:
            self.fail("pwsh is not installed, so Install.ps1 was not executed")
        self._run_install_ps1(pwsh, "mismatch")

    def test_install_ps1_installs_archive_that_matches_recorded_digest(self) -> None:
        pwsh = shutil.which("pwsh")
        if pwsh is None:
            self.fail("pwsh is not installed, so Install.ps1 was not executed")
        self._run_install_ps1(pwsh, "match")

    def _run_install_ps1(self, pwsh: str, mode: str) -> None:
        # Install.ps1 stops unless Win32_OperatingSystem reports Windows. Those two
        # CIM queries are the only lines replaced here. Download-And-Install-Spice,
        # tar, and Move-Item are the script's own lines.
        SERVER.state.reset(mode, SERVER.state.bodies)
        install_dir = self.home / ".spice" / "bin"
        wrapper = WORK / f"{self.id().split('.')[-1]}.ps1"
        wrapper.write_text(
            textwrap.dedent(
                f"""
                function Get-CimInstance {{
                    param($ClassName)
                    if ($ClassName -eq 'Win32_OperatingSystem') {{
                        return [pscustomobject]@{{ Caption = 'Microsoft Windows 11' }}
                    }}
                    if ($ClassName -eq 'CIM_ComputerSystem') {{
                        return [pscustomobject]@{{ SystemType = 'x64-based PC' }}
                    }}
                    throw "unexpected CIM class $ClassName"
                }}
                $env:HOME = '{self.home}'
                . '{SCRIPTS['Install.ps1']}'
                """
            ).lstrip(),
            encoding="utf-8",
        )
        result = _run_as_ubuntu(
            [pwsh, "-NoProfile", "-File", str(wrapper)],
            _installer_env(self.home, {}),
            timeout=120,
        )
        installed = install_dir / "spice.exe"
        if mode == "match":
            _assert_matching_install(self, result, installed, self.windows_asset)
        else:
            _assert_refused_substitution(self, result, installed, self.marker, self.windows_asset)


def main() -> None:
    global SERVER, SCRIPTS
    if os.geteuid() != 0:
        os.execvp("sudo", ["sudo", "-n", "-E", sys_executable(), *sys.argv])
    WORK.chmod(0o755)
    ca_cert, server_cert, server_key = _write_cert(WORK)
    os.environ["SSL_CERT_FILE"] = str(ca_cert)
    SCRIPTS = _fetch_scripts()
    state = ReleaseState()
    # Bind before the suite so a failure to listen is not an installer result.
    server = ReleaseServer(state, server_cert, server_key)
    thread = threading.Thread(target=server.serve_forever, name="release-stand-in", daemon=True)
    thread.start()
    globals()["SERVER"] = server
    try:
        suite = unittest.defaultTestLoader.loadTestsFromTestCase(ReleaseArchiveSubstitutionTest)
        result = unittest.TextTestRunner(verbosity=2).run(suite)
    finally:
        server.shutdown()
        server.server_close()
    raise SystemExit(0 if result.wasSuccessful() else 1)


def sys_executable() -> str:
    return os.environ.get("SPICE_TEST_PYTHON", sys.executable)


if __name__ == "__main__":
    main()
