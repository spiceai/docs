#!/usr/bin/env python3
"""Pull-request package scripts must not run with a credential that can push.

Replays the run steps of a workflow in a temporary git repository. The
temporary website/package.json is the pull-request copy: its lifecycle
scripts and npm run scripts read the checkout credential file and install
git hooks. A push credential is the job token when the workflow does not
restrict contents to read, stored the way actions/checkout@v7.0.1 stores it,
or any other secret the workflow passes into a step.

This file is expected to fail until .github/workflows/updated_openapi.yml no
longer gives pull-request package scripts a push credential.
"""

from __future__ import annotations

import base64
import os
import shutil
import subprocess
import tempfile
import textwrap
import unittest
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
OPENAPI_WORKFLOW = REPO_ROOT / ".github/workflows/updated_openapi.yml"
BUILD_WORKFLOW = REPO_ROOT / ".github/workflows/build.yml"
HEAD_REF = "attacker-docs"
PLACEHOLDER_TOKEN = "placeholder-job-token"
INJECTED_SCRIPT_REF = "refs/heads/injected-by-script"
INJECTED_HOOK_REF = "refs/heads/injected-by-hook"


class GitHubLoader(yaml.SafeLoader):
    """Load GitHub workflow YAML without treating `on` as a boolean."""


GitHubLoader.yaml_implicit_resolvers = {
    key: [item for item in value if item[0] != "tag:yaml.org,2002:bool"]
    for key, value in yaml.SafeLoader.yaml_implicit_resolvers.items()
}


def load_workflow(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        data = yaml.load(handle, Loader=GitHubLoader)
    if not isinstance(data, dict):
        raise AssertionError(f"{path} did not parse as a workflow mapping")
    return data


def token_can_push(workflow: dict, job: dict) -> bool:
    """Return whether the job token can push commits.

    A missing permissions key keeps the repository default. The generate-api-docs
    job logged Contents: write on run 40782515380. Setting any permissions map
    drops unspecified scopes to none.
    """

    permissions = job.get("permissions", workflow.get("permissions", None))
    if permissions is None:
        return True
    if permissions == "write-all":
        return True
    if permissions in ("read-all", {}):
        return False
    if isinstance(permissions, dict):
        return permissions.get("contents") == "write"
    return True


def persist_credentials(step: dict) -> bool:
    """actions/checkout@v7.0.1 defaults persist-credentials to true."""

    inputs = step.get("with") or {}
    if "persist-credentials" not in inputs:
        return True
    return str(inputs["persist-credentials"]).lower() == "true"


def step_runs(step: dict, env: dict, head_ref: str) -> bool:
    condition = step.get("if")
    if condition is None:
        return True
    return _condition(str(condition).strip(), env, head_ref)


def _condition(condition: str, env: dict, head_ref: str) -> bool:
    if "&&" in condition:
        return all(
            _condition(part.strip(), env, head_ref) for part in condition.split("&&")
        )
    equality = _fullmatch_env(condition, env)
    if equality is not None:
        return equality
    prefix = "startsWith(github.head_ref, '"
    if condition.startswith("!" + prefix) and condition.endswith("')"):
        needle = condition[len("!" + prefix) : -2]
        return not head_ref.startswith(needle)
    if condition.startswith(prefix) and condition.endswith("')"):
        needle = condition[len(prefix) : -2]
        return head_ref.startswith(needle)
    # An unrecognized condition still runs. Skipping it could hide a push.
    return True


def _fullmatch_env(condition: str, env: dict) -> bool | None:
    marker = "env."
    if not condition.startswith(marker) or " == " not in condition:
        return None
    name, _, raw_value = condition[len(marker) :].partition(" == ")
    if not (raw_value.startswith("'") and raw_value.endswith("'")):
        return None
    return env.get(name, "") == raw_value[1:-1]


def _bash(script: str, cwd: Path, env: dict) -> None:
    subprocess.run(
        ["bash", "--noprofile", "--norc", "-eo", "pipefail", "-c", script],
        cwd=cwd,
        env=env,
        check=False,
        text=True,
    )


def _git(repo: Path, *args: str, env: dict | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(repo), *args],
        check=True,
        text=True,
        capture_output=True,
        env=env,
    )


def _write_checkout_credential(repo: Path, home: Path) -> None:
    """Store a placeholder token the way checkout v7.0.1 configureToken does."""

    runner_temp = home / "runner-temp"
    runner_temp.mkdir(parents=True, exist_ok=True)
    credentials = runner_temp / "git-credentials-placeholder.config"
    encoded = base64.b64encode(
        f"x-access-token:{PLACEHOLDER_TOKEN}".encode("utf-8")
    ).decode("ascii")
    header = f"AUTHORIZATION: basic {encoded}"
    env = _base_env(home, repo)
    _git(
        repo,
        "config",
        "--file",
        str(credentials),
        "http.https://github.com/.extraheader",
        "AUTHORIZATION: basic ***",
        env=env,
    )
    text = credentials.read_text(encoding="utf-8")
    if text.count("AUTHORIZATION: basic ***") != 1:
        raise AssertionError("checkout credential placeholder was not written once")
    credentials.write_text(text.replace("AUTHORIZATION: basic ***", header), encoding="utf-8")
    git_dir = str(repo / ".git").replace("\\", "/")
    _git(
        repo,
        "config",
        "--local",
        f"includeIf.gitdir:{git_dir}.path",
        str(credentials),
        env=env,
    )


def _base_env(home: Path, repo: Path) -> dict[str, str]:
    env = {
        "PATH": os.environ.get("PATH", ""),
        "HOME": str(home),
        "TMPDIR": str(home / "tmp"),
        "npm_config_cache": str(home / "npm-cache"),
        "npm_config_audit": "false",
        "npm_config_fund": "false",
        "npm_config_update_notifier": "false",
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_AUTHOR_NAME": "Spice Schema Bot",
        "GIT_AUTHOR_EMAIL": "schema-bot@spice.ai",
        "GIT_COMMITTER_NAME": "Spice Schema Bot",
        "GIT_COMMITTER_EMAIL": "schema-bot@spice.ai",
    }
    (home / "tmp").mkdir(parents=True, exist_ok=True)
    (home / "npm-cache").mkdir(parents=True, exist_ok=True)
    env["EVIDENCE"] = str(repo.parent / "evidence")
    env["GITHUB_ENV"] = str(repo.parent / "github-env")
    env["GITHUB_WORKSPACE"] = str(repo)
    return env


def _payload() -> str:
    return textwrap.dedent(
        f"""\
        const fs = require('fs');
        const path = require('path');
        const {{execSync}} = require('child_process');
        const evidence = process.env.EVIDENCE;
        function mark(name) {{
          fs.appendFileSync(evidence, name + '\\n');
        }}
        function git(args) {{
          return execSync('git ' + args, {{encoding: 'utf8'}}).trim();
        }}
        mark('script-ran');
        const tracked = 'docs/api/HTTP/existing.mdx';
        fs.mkdirSync(path.dirname(tracked), {{recursive: true}});
        fs.appendFileSync(tracked, 'generated\\n');
        let config = '';
        try {{
          config = git('config --local --list --show-origin');
        }} catch (err) {{
          config = '';
        }}
        const files = new Set();
        for (const line of config.split(/\\n/)) {{
          const match = line.match(/includeif\\.gitdir:.*\\.path=(.*)$/i);
          if (match) files.add(match[1].trim());
        }}
        let sawCredential = false;
        for (const file of files) {{
          let body = '';
          try {{
            body = fs.readFileSync(file, 'utf8');
          }} catch (err) {{
            continue;
          }}
          if (body.includes('extraheader') && body.includes('AUTHORIZATION: basic ')) {{
            sawCredential = true;
          }}
        }}
        if (sawCredential) {{
          mark('credential-seen');
          try {{
            git('push origin HEAD:{INJECTED_SCRIPT_REF}');
          }} catch (err) {{
            mark('script-push-failed');
          }}
        }}
        const hooks = git('rev-parse --git-path hooks');
        fs.mkdirSync(hooks, {{recursive: true}});
        const hook = [
          '#!/bin/sh',
          'set +e',
          'if [ -n "$GITHUB_TOKEN" ] || [ -n "$GH_TOKEN" ]; then',
          '  if [ ! -f "$EVIDENCE.hook-pushed" ]; then',
          '    echo hook-saw-token >> "$EVIDENCE"',
          '    : > "$EVIDENCE.hook-pushed"',
          '    git push origin "HEAD:{INJECTED_HOOK_REF}"',
          '  fi',
          'fi',
          'exit 0',
          '',
        ].join('\\n');
        for (const name of ['pre-commit', 'commit-msg', 'post-commit', 'pre-push', 'pre-rebase', 'post-merge', 'post-checkout', 'post-rewrite']) {{
          const target = path.join(hooks, name);
          fs.writeFileSync(target, hook, {{mode: 0o755}});
          fs.chmodSync(target, 0o755);
        }}
        """
    )


def _package_json() -> str:
    scripts = {
        name: "node payload.js"
        for name in (
            "preinstall",
            "install",
            "postinstall",
            "prepublish",
            "preprepare",
            "prepare",
            "postprepare",
            "docusaurus",
            "build",
        )
    }
    import json

    return json.dumps({"name": "website", "version": "0.0.0", "scripts": scripts})


def _package_lock() -> str:
    return textwrap.dedent(
        """\
        {
          "name": "website",
          "version": "0.0.0",
          "lockfileVersion": 3,
          "requires": true,
          "packages": {
            "": {
              "name": "website",
              "version": "0.0.0"
            }
          }
        }
        """
    )


class Replay:
    def __init__(self, root: Path):
        self.root = root
        self.marks: set[str] = set()
        self.commands: list[str] = []
        self.injected: set[str] = set()


def replay(workflow: dict) -> Replay:
    jobs = workflow.get("jobs") or {}
    if not jobs:
        raise AssertionError("workflow has no jobs")
    parent = Path(tempfile.mkdtemp(prefix="openapi-workflow-"))
    try:
        repo = parent / "repo"
        origin = parent / "origin.git"
        home = parent / "home"
        repo.mkdir()
        home.mkdir()
        (repo.parent / "evidence").touch()
        (repo.parent / "github-env").touch()
        website = repo / "website"
        (website / "docs" / "api" / "HTTP").mkdir(parents=True)
        (website / "package.json").write_text(_package_json(), encoding="utf-8")
        (website / "package-lock.json").write_text(_package_lock(), encoding="utf-8")
        (website / "payload.js").write_text(_payload(), encoding="utf-8")
        (website / "public").mkdir()
        (website / "public" / "openapi.json").write_text("{}\n", encoding="utf-8")
        (website / "docs" / "api" / "HTTP" / "existing.mdx").write_text(
            "seed\n", encoding="utf-8"
        )
        env = _base_env(home, repo)
        _git(repo, "init", "-b", HEAD_REF, env=env)
        _git(repo, "config", "user.name", "Spice Schema Bot", env=env)
        _git(repo, "config", "user.email", "schema-bot@spice.ai", env=env)
        _git(repo, "add", "website", env=env)
        _git(repo, "commit", "-m", "initial", env=env)
        subprocess.run(
            ["git", "init", "--bare", "-b", HEAD_REF, str(origin)],
            check=True,
            capture_output=True,
            text=True,
        )
        _git(repo, "remote", "add", "origin", str(origin), env=env)
        _git(repo, "push", "origin", f"HEAD:refs/heads/{HEAD_REF}", env=env)

        result = Replay(parent)
        for job in jobs.values():
            push_capable = token_can_push(workflow, job)
            for step in job.get("steps") or []:
                if not step_runs(step, env, HEAD_REF):
                    continue
                uses = str(step.get("uses") or "")
                if uses.startswith("actions/checkout@"):
                    if persist_credentials(step) and push_capable:
                        _write_checkout_credential(repo, home)
                    continue
                if uses.startswith("actions/setup-node@"):
                    continue
                script = step.get("run")
                if script is None:
                    continue
                script = str(script).replace("${{ github.head_ref }}", HEAD_REF)
                step_env = dict(env)
                for name, value in (step.get("env") or {}).items():
                    if _value_is_push_credential(name, value, push_capable):
                        step_env[str(name)] = PLACEHOLDER_TOKEN
                work = repo
                relative = step.get("working-directory")
                if relative:
                    work = repo / str(relative)
                result.commands.append(script.strip().splitlines()[0])
                _bash(script, work, step_env)
                _load_github_env(Path(env["GITHUB_ENV"]), env)
        evidence = (repo.parent / "evidence").read_text(encoding="utf-8")
        result.marks = {line for line in evidence.splitlines() if line}
        for ref in (INJECTED_SCRIPT_REF, INJECTED_HOOK_REF):
            listed = subprocess.run(
                ["git", "--git-dir", str(origin), "rev-parse", "--verify", "--quiet", ref],
                check=False,
                capture_output=True,
                text=True,
            )
            if listed.returncode == 0:
                result.injected.add(ref)
        return result
    finally:
        shutil.rmtree(parent, ignore_errors=True)


def _value_is_push_credential(name: str, value: object, job_token_can_push: bool) -> bool:
    text = str(value)
    if "secrets." not in text and "github.token" not in text:
        return False
    if str(name) in {"GITHUB_TOKEN", "GH_TOKEN"} and not job_token_can_push:
        return False
    return True


def _load_github_env(path: Path, env: dict) -> None:
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key] = value


def _assert_no_push_exposure(result: Replay) -> None:
    problems = []
    if "credential-seen" in result.marks:
        problems.append(
            "a pull-request package script read the checkout credential file"
        )
    if "hook-saw-token" in result.marks:
        problems.append("a git hook ran while a push token was in the environment")
    if result.injected:
        problems.append(
            "a package script or git hook pushed " + ", ".join(sorted(result.injected))
        )
    if problems:
        raise AssertionError(
            "pull-request package scripts can push with the job credential: "
            + "; ".join(problems)
        )


class WorkflowScriptCredentialTest(unittest.TestCase):
    def test_generate_api_docs_does_not_expose_a_push_credential(self) -> None:
        workflow = load_workflow(OPENAPI_WORKFLOW)
        result = replay(workflow)
        self.assertTrue(result.commands, "the workflow did not run any steps")
        _assert_no_push_exposure(result)

    def test_build_workflow_does_not_expose_a_push_credential(self) -> None:
        workflow = load_workflow(BUILD_WORKFLOW)
        result = replay(workflow)
        self.assertTrue(any("npm install" in command for command in result.commands))
        _assert_no_push_exposure(result)

    def test_contents_read_and_ignored_scripts_do_not_expose_a_push_credential(self) -> None:
        workflow = load_workflow_text(
            textwrap.dedent(
                """\
                name: safe
                on:
                  pull_request:
                permissions:
                  contents: read
                jobs:
                  generate-api-docs:
                    runs-on: ubuntu-latest
                    steps:
                      - uses: actions/checkout@v7.0.1
                        with:
                          persist-credentials: false
                      - working-directory: website
                        run: npm ci --ignore-scripts
                      - working-directory: website
                        run: node -e "process.exit(0)"
                """
            )
        )
        result = replay(workflow)
        _assert_no_push_exposure(result)
        self.assertNotIn("script-ran", result.marks)


def load_workflow_text(text: str) -> dict:
    data = yaml.load(text, Loader=GitHubLoader)
    if not isinstance(data, dict):
        raise AssertionError("workflow text did not parse")
    return data


if __name__ == "__main__":
    unittest.main()
