"""IAM examples on the Glue and Iceberg pages must not grant snapshot writes
beyond the table and prefix the example is for.

The access policy (any JSON policy whose heading or lead-in does not say
"write") must not allow glue:UpdateTable or s3:PutObject. A write policy may
allow those actions only when glue:UpdateTable matches at most one table in a
given account, and s3:PutObject does not match two different top-level key
prefixes in the same bucket.

Evaluation uses moto 5.2.5 IAMPolicy.is_action_permitted, which matches an
action and a resource, lets an explicit Deny win, and treats a missing
Resource element as applying to every resource. Action names are compared
case-insensitively. These checks fail until the published examples are split
and scoped.
"""

from __future__ import annotations

import copy
import json
import re
import unittest
from pathlib import Path

from moto.iam.access_control import IAMPolicy, PermissionResult

REPO_ROOT = Path(__file__).resolve().parents[1]
WEBSITE = REPO_ROOT / "website"

FENCE = re.compile(r"```json[^\n]*\n(.*?)```", re.IGNORECASE | re.DOTALL)
HEADING = re.compile(r"(?m)^(#{1,6})\s+(.+?)\s*$")
WRITE_WORD = re.compile(r"\bwrite\b", re.IGNORECASE)
READ_ONLY_WORD = re.compile(r"\bread[- ]only\b", re.IGNORECASE)

TABLE_PREFIXES = ("aaaa-prefix", "bbbb-prefix")
PROBE_DATABASES = ("aaaa_db", "bbbb_db")
PROBE_TABLES = ("aaaa_table", "bbbb_table")
DEFAULT_REGION = "us-east-1"
DEFAULT_ACCOUNT = "123456789012"
EXAMPLE_BUCKET = "company-bucketname-datasets"


def iam_pages() -> list[Path]:
    pages = []
    for path in WEBSITE.rglob("*.md"):
        if path.name not in {"glue.md", "iceberg.md"}:
            continue
        if path.parent.name not in {"catalogs", "data-connectors"}:
            continue
        pages.append(path)
    return sorted(pages)


def normalize(policy: dict) -> dict:
    """Compare action names and effects the way IAM does, then hand the
    document to moto's matcher."""
    document = copy.deepcopy(policy)
    statements = document.get("Statement", [])
    if isinstance(statements, dict):
        statements = [statements]
    normalized = []
    for statement in statements:
        if not isinstance(statement, dict):
            normalized.append(statement)
            continue
        statement = copy.deepcopy(statement)
        effect = statement.get("Effect")
        if isinstance(effect, str) and effect.lower() == "allow":
            statement["Effect"] = "Allow"
        elif isinstance(effect, str) and effect.lower() == "deny":
            statement["Effect"] = "Deny"
        for key in ("Action", "NotAction"):
            value = statement.get(key)
            if isinstance(value, str):
                statement[key] = value.lower()
            elif isinstance(value, list):
                statement[key] = [
                    item.lower() if isinstance(item, str) else item for item in value
                ]
        normalized.append(statement)
    document["Statement"] = normalized
    return document


def permits(policy: dict, action: str, resource: str) -> bool:
    decision = IAMPolicy(json.dumps(normalize(policy))).is_action_permitted(
        action.lower(), resource
    )
    return decision == PermissionResult.PERMITTED


def resource_strings(policy: dict) -> list[str]:
    statements = policy.get("Statement", [])
    if isinstance(statements, dict):
        statements = [statements]
    found: list[str] = []
    for statement in statements:
        if not isinstance(statement, dict):
            continue
        for key in ("Resource", "NotResource"):
            value = statement.get(key)
            if isinstance(value, str):
                found.append(value)
            elif isinstance(value, list):
                found.extend(item for item in value if isinstance(item, str))
    return found


def regions_and_accounts(policy: dict) -> tuple[set[str], set[str]]:
    text = json.dumps(policy)
    regions = {
        region
        for region in re.findall(r"arn:aws:glue:([a-z0-9-]+):", text)
        if region != "*"
    }
    accounts = set(re.findall(r"arn:aws:glue:[^:]+:(\d{12}):", text))
    if not regions:
        regions.add(DEFAULT_REGION)
    if not accounts:
        accounts.add(DEFAULT_ACCOUNT)
    return regions, accounts


def databases_and_tables(policy: dict) -> tuple[set[str], set[str]]:
    text = json.dumps(policy)
    databases = set(re.findall(r":table/([^*/\"\\]+)/", text))
    databases.update(re.findall(r":database/([^*/\"\\]+)", text))
    databases.update(PROBE_DATABASES)
    tables = set(re.findall(r":table/[^*/\"\\]+/([^*/\"\\]+)", text))
    tables.update(PROBE_TABLES)
    return databases, tables


def buckets(policy: dict) -> set[str]:
    names = set(re.findall(r"arn:aws:s3:::([A-Za-z0-9._-]+)", json.dumps(policy)))
    names.add(EXAMPLE_BUCKET)
    return names


def update_table_matches_two_tables(policy: dict) -> bool:
    """True when one account can glue:UpdateTable on two different tables."""
    regions, accounts = regions_and_accounts(policy)
    databases, tables = databases_and_tables(policy)
    for region in regions:
        for account in accounts:
            for database in databases:
                matched = [
                    table
                    for table in tables
                    if permits(
                        policy,
                        "glue:UpdateTable",
                        f"arn:aws:glue:{region}:{account}:table/{database}/{table}",
                    )
                ]
                if len(matched) >= 2:
                    return True
            for table in tables:
                matched = [
                    database
                    for database in databases
                    if permits(
                        policy,
                        "glue:UpdateTable",
                        f"arn:aws:glue:{region}:{account}:table/{database}/{table}",
                    )
                ]
                if len(matched) >= 2:
                    return True
    return False


def put_object_matches_two_prefixes(policy: dict) -> bool:
    """True when one bucket can s3:PutObject under two different prefixes."""
    for bucket in buckets(policy):
        matched = [
            prefix
            for prefix in TABLE_PREFIXES
            if permits(
                policy,
                "s3:PutObject",
                f"arn:aws:s3:::{bucket}/{prefix}/object",
            )
        ]
        if len(matched) >= 2:
            return True
    return False


def action_permitted_on_listed_resource(policy: dict, action: str) -> bool:
    """True when any allow for this action matches a resource the policy names,
    or a concrete table or object used as a stand-in for one it names.
    """
    candidates = ["*", *resource_strings(policy)]
    regions, accounts = regions_and_accounts(policy)
    databases, tables = databases_and_tables(policy)
    for region in regions:
        for account in accounts:
            for database in databases:
                for table in tables:
                    candidates.append(
                        f"arn:aws:glue:{region}:{account}:table/{database}/{table}"
                    )
                    candidates.append(
                        f"arn:aws:glue:{region}:{account}:database/{database}"
                    )
                    candidates.append(f"arn:aws:glue:{region}:{account}:catalog")
    for bucket in buckets(policy):
        for prefix in TABLE_PREFIXES:
            candidates.append(f"arn:aws:s3:::{bucket}/{prefix}/object")
        candidates.append(f"arn:aws:s3:::{bucket}/my_database/my_table/object")
    return any(permits(policy, action, resource) for resource in candidates)


def policy_violations(policy: dict, *, access_policy: bool) -> list[str]:
    violations = []
    if update_table_matches_two_tables(policy):
        violations.append(
            "glue:UpdateTable is allowed for two different tables in the same account"
        )
    if put_object_matches_two_prefixes(policy):
        violations.append(
            "s3:PutObject is allowed for two different prefixes in the same bucket"
        )
    if access_policy and action_permitted_on_listed_resource(policy, "glue:UpdateTable"):
        violations.append(
            "the access policy allows glue:UpdateTable; keep snapshot commits in a write policy scoped to one table"
        )
    if access_policy and action_permitted_on_listed_resource(policy, "s3:PutObject"):
        violations.append(
            "the access policy allows s3:PutObject; keep object writes in a write policy scoped to one prefix"
        )
    return violations


def extract_policies(markdown: str) -> tuple[list[tuple[dict, bool]], list[str]]:
    """Return (policy, is_write) pairs and parse errors for fences that grant writes."""
    policies: list[tuple[dict, bool]] = []
    errors: list[str] = []
    previous_end = 0
    for fence in FENCE.finditer(markdown):
        body = fence.group(1)
        heading = ""
        heading_end = 0
        for found in HEADING.finditer(markdown):
            if found.start() >= fence.start():
                break
            heading = found.group(2)
            heading_end = found.end()
        intro = markdown[max(heading_end, previous_end) : fence.start()]
        previous_end = fence.end()
        lead = f"{heading}\n{intro}"
        is_write = WRITE_WORD.search(lead) is not None and READ_ONLY_WORD.search(lead) is None
        try:
            document = json.loads(body)
        except json.JSONDecodeError:
            if "glue:UpdateTable" in body or "s3:PutObject" in body:
                errors.append("IAM example that grants glue:UpdateTable or s3:PutObject is not valid JSON")
            continue
        if not isinstance(document, dict) or "Statement" not in document:
            continue
        policies.append((document, is_write))
    return policies, errors


def evaluate_markdown(markdown: str) -> list[str]:
    policies, errors = extract_policies(markdown)
    violations = list(errors)
    for policy, is_write in policies:
        for violation in policy_violations(policy, access_policy=not is_write):
            kind = "write policy" if is_write else "access policy"
            violations.append(f"{kind}: {violation}")
    return violations


READ_POLICY = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:ListBucket"],
            "Resource": "arn:aws:s3:::company-bucketname-datasets",
        },
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject"],
            "Resource": "arn:aws:s3:::company-bucketname-datasets/my_database/my_table/*",
        },
        {
            "Effect": "Allow",
            "Action": [
                "glue:GetCatalog",
                "glue:GetDatabases",
                "glue:GetDatabase",
                "glue:GetTable",
                "glue:GetTables",
            ],
            "Resource": "*",
        },
    ],
}

WRITE_POLICY = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:PutObject"],
            "Resource": "arn:aws:s3:::company-bucketname-datasets/my_database/my_table/*",
        },
        {
            "Effect": "Allow",
            "Action": ["glue:UpdateTable"],
            "Resource": [
                "arn:aws:glue:us-east-1:123456789012:catalog",
                "arn:aws:glue:us-east-1:123456789012:database/my_database",
                "arn:aws:glue:us-east-1:123456789012:table/my_database/my_table",
            ],
        },
    ],
}

SCOPED_PAGE = """
### Required IAM Permissions

The IAM role needs the following permissions to access Iceberg tables in S3/Glue.

```json
%s
```

### Write IAM permissions

Writes that commit a snapshot use a separate policy.

```json
%s
```
""" % (
    json.dumps(READ_POLICY),
    json.dumps(WRITE_POLICY),
)

PUBLISHED_SHAPE = """
### Required IAM Permissions

The IAM role or user needs the following permissions to access Iceberg tables in S3/Glue.

```json
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:GetObject", "s3:PutObject"],
        "Resource": "arn:aws:s3:::company-bucketname-datasets/*"
      },
      {
        "Effect": "Allow",
        "Action": ["glue:GetTable", "glue:UpdateTable"],
        "Resource": "*"
      }
    ]
}
```
"""


class GlueIcebergIamExampleTests(unittest.TestCase):
    def test_published_examples_do_not_grant_account_wide_snapshot_writes(self):
        pages = iam_pages()
        self.assertGreaterEqual(len(pages), 24)
        for page in pages:
            violations = evaluate_markdown(page.read_text())
            with self.subTest(page=str(page.relative_to(REPO_ROOT))):
                self.assertEqual(violations, [])

    def test_split_scoped_policies_pass_the_same_checks(self):
        self.assertEqual(evaluate_markdown(SCOPED_PAGE), [])
        self.assertEqual(policy_violations(READ_POLICY, access_policy=True), [])
        self.assertEqual(policy_violations(WRITE_POLICY, access_policy=False), [])

    def test_account_wildcard_and_bucket_wildcard_fail_the_same_checks(self):
        violations = evaluate_markdown(PUBLISHED_SHAPE)
        self.assertTrue(
            any("glue:UpdateTable is allowed for two different tables" in item for item in violations)
        )
        self.assertTrue(
            any("s3:PutObject is allowed for two different prefixes" in item for item in violations)
        )
        self.assertTrue(any("access policy allows glue:UpdateTable" in item for item in violations))
        self.assertTrue(any("access policy allows s3:PutObject" in item for item in violations))

    def test_write_policy_still_fails_when_it_matches_every_table_or_prefix(self):
        broad_write = """
### Write IAM permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "glue:UpdateTable",
      "Resource": "arn:aws:glue:us-east-1:123456789012:table/*/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::company-bucketname-datasets/*"
    }
  ]
}
```
"""
        violations = evaluate_markdown(broad_write)
        self.assertTrue(any("two different tables" in item for item in violations))
        self.assertTrue(any("two different prefixes" in item for item in violations))

    def test_explicit_deny_cannot_hide_a_second_allow_for_another_table(self):
        # Deny one probe table, allow every table. The other probe table stays allowed.
        hidden = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Deny",
                    "Action": "glue:UpdateTable",
                    "Resource": "arn:aws:glue:us-east-1:123456789012:table/aaaa_db/aaaa_table",
                },
                {
                    "Effect": "Allow",
                    "Action": "glue:UpdateTable",
                    "Resource": "*",
                },
            ],
        }
        self.assertTrue(update_table_matches_two_tables(hidden))

    def test_database_wildcard_still_matches_a_second_table(self):
        database_wide = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "glue:UpdateTable",
                    "Resource": [
                        "arn:aws:glue:us-east-1:123456789012:catalog",
                        "arn:aws:glue:us-east-1:123456789012:database/my_database",
                        "arn:aws:glue:us-east-1:123456789012:table/my_database/*",
                    ],
                }
            ],
        }
        self.assertTrue(update_table_matches_two_tables(database_wide))
        one_table = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "glue:UpdateTable",
                    "Resource": [
                        "arn:aws:glue:us-east-1:123456789012:catalog",
                        "arn:aws:glue:us-east-1:123456789012:database/my_database",
                        "arn:aws:glue:us-east-1:123456789012:table/my_database/my_table",
                    ],
                }
            ],
        }
        self.assertFalse(update_table_matches_two_tables(one_table))

    def test_condition_does_not_stand_in_for_a_resource_scope(self):
        # moto evaluates a condition only when request values are supplied, and
        # an empty value list passes. A wildcard resource with a condition still
        # matches every table.
        conditioned = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "glue:UpdateTable",
                    "Resource": "*",
                    "Condition": {"StringEquals": {"aws:RequestedRegion": DEFAULT_REGION}},
                }
            ],
        }
        self.assertTrue(update_table_matches_two_tables(conditioned))

    def test_service_action_wildcard_still_grants_update_table(self):
        wildcard_action = {
            "Version": "2012-10-17",
            "Statement": [
                {"Effect": "Allow", "Action": "glue:*", "Resource": "*"},
            ],
        }
        self.assertTrue(update_table_matches_two_tables(wildcard_action))


if __name__ == "__main__":
    unittest.main()
