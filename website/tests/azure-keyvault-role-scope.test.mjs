/**
 * Spec for the Azure Key Vault secret-store guides.
 *
 * These tests fail while a guide tells operators to assign Key Vault Secrets
 * User on the whole vault. They pass once every such guide limits getSecret to
 * the secret names that guide's Spicepod example causes the runtime to request,
 * and still says a list denial is acceptable.
 *
 * The stand-in below follows the runtime and the libraries it ships, not a
 * live vault or a live Postgres server:
 *
 * - spiceai v2.4.3 (40af136fc6989bf19a685cb58d6a08e5509e903b). The Azure store
 *   source is the same blob at v2.2.3, v2.3.4, and v2.4.3.
 *   `spice run` always passes `--pods-watcher-enabled`
 *   (bin/spice/src/context.rs, get_run_cmd). On a runtime that is not Cloud
 *   Connect managed, spiced installs the watcher
 *   (bin/spiced/src/lib.rs). A changed dataset is rebuilt
 *   (crates/runtime/src/init/dataset.rs, apply_dataset_diff →
 *   update_dataset_with_bootstrap → ConnectorParamsBuilder), and dataset
 *   params are resolved with try_get_params_with_secrets.
 * - `${ store:key }` is split by the secret lexer
 *   (crates/runtime-secrets/src/lexer.rs). The key is passed to the named
 *   store with no allowlist (crates/runtime-secrets/src/lib.rs,
 *   resolve_reference).
 * - AzureKeyVault::fetch_one requests `spice-<hyphenated>` and then
 *   `<hyphenated>`. A non-404, including 403, stops the walk. Only 404 falls
 *   through (crates/runtime-secrets/src/stores/azure_keyvault.rs).
 * - azure_security_keyvault_secrets 1.0.1 SecretClient::get_secret sends
 *   GET /secrets/{secret-name}/ for that name.
 * - datafusion-table-providers rev bc28b142 puts `host` in the connection
 *   string and the password into tokio-postgres Config::password, then
 *   connect() (postgrespool.rs). tokio-postgres 0.7.17 connects to that host
 *   and, on AuthenticationCleartextPassword, writes the password with
 *   postgres-protocol 0.6.11 password_message.
 * - Built-in role Key Vault Secrets User, id
 *   4633458b-17de-408a-b874-0445c86b69e6, dataActions getSecret and
 *   readMetadata, assignable at any scope. Published in MicrosoftDocs
 *   azure-docs articles/role-based-access-control/built-in-roles/security.md
 *   under "Key Vault Secrets User". A vault-scope assignment covers secrets
 *   under that vault; a scope that continues `/secrets/<name>` covers that
 *   name. Microsoft Learn, "Azure RBAC for Key Vault", documents both scopes
 *   (key-vault scope vs secret scope). scope-overview.md: lower levels inherit
 *   permissions from higher levels.
 */

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Role definition copied from the published built-in role, not from memory. */
const KEY_VAULT_SECRETS_USER = {
  roleName: 'Key Vault Secrets User',
  name: '4633458b-17de-408a-b874-0445c86b69e6',
  permissions: [
    {
      actions: [],
      notActions: [],
      dataActions: [
        'Microsoft.KeyVault/vaults/secrets/getSecret/action',
        'Microsoft.KeyVault/vaults/secrets/readMetadata/action',
      ],
      notDataActions: [],
    },
  ],
};

const GET_SECRET_ACTION = 'Microsoft.KeyVault/vaults/secrets/getSecret/action';

/** Placeholder vault contents. Not credentials. */
const EXAMPLE_VAULT = new Map([
  ['postgres-user', 'placeholder-postgres-user'],
  ['postgres-password', 'placeholder-postgres-password'],
]);

const ATTACKER_LOGICAL_KEY = 'other_app_api_key';
const ATTACKER_SECRET_NAME = 'other-app-api-key';
const ATTACKER_PLACEHOLDER = 'placeholder-other-app';
const ATTACKER_HOST = 'attacker.example';

async function walk(dir, predicate, found = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      await walk(full, predicate, found);
    } else if (predicate(full)) {
      found.push(full);
    }
  }
  return found;
}

function toVaultName(key) {
  return key.replaceAll('_', '-');
}

function candidates(logicalKey) {
  const primary = toVaultName(logicalKey);
  return [`spice-${primary}`, primary];
}

function bashBlocks(markdown) {
  return [...markdown.matchAll(/```(?:bash|shell|sh)?\n([\s\S]*?)```/g)].map((match) => match[1]);
}

function flag(text, name) {
  const match = text.match(new RegExp(`--${name}(?:=|\\s+)("[^"]+"|'[^']+'|\\S+)`));
  if (!match) return null;
  return match[1].replace(/^['"]|['"]$/g, '');
}

function assignmentsFrom(markdown) {
  const assignments = [];
  for (const block of bashBlocks(markdown)) {
    const flat = block.replace(/\\\n/g, ' ');
    if (!flat.includes('az role assignment create')) continue;
    assignments.push({
      role: flag(flat, 'role'),
      scope: flag(flat, 'scope'),
      condition: flag(flat, 'condition'),
    });
  }
  return assignments;
}

function rolesFrom(markdown) {
  const roles = new Map([[KEY_VAULT_SECRETS_USER.roleName, KEY_VAULT_SECRETS_USER]]);
  roles.set(KEY_VAULT_SECRETS_USER.name, KEY_VAULT_SECRETS_USER);
  for (const match of markdown.matchAll(/```json\n([\s\S]*?)```/g)) {
    let json;
    try {
      json = JSON.parse(match[1]);
    } catch {
      continue;
    }
    const documents = Array.isArray(json) ? json : [json];
    for (const document of documents) {
      if (!document || !document.roleName || !document.permissions) continue;
      roles.set(document.roleName, document);
      if (document.name) roles.set(document.name, document);
    }
  }
  return roles;
}

function actionGrantsGet(action) {
  return (
    action === GET_SECRET_ACTION ||
    action === 'Microsoft.KeyVault/vaults/secrets/*' ||
    action === 'Microsoft.KeyVault/vaults/*' ||
    action === 'Microsoft.KeyVault/*'
  );
}

function roleGrantsGet(role) {
  if (!role) return false;
  for (const permission of role.permissions ?? []) {
    const granted = (permission.dataActions ?? []).some(actionGrantsGet);
    const denied = (permission.notDataActions ?? []).some(actionGrantsGet);
    if (granted && !denied) return true;
  }
  return false;
}

/**
 * Vault scope (`.../vaults/<vault>`) covers every secret in that vault.
 * Secret scope (`.../vaults/<vault>/secrets/<name>`) covers that name.
 * A scope that never reaches a vault resource covers every secret under it.
 */
function scopeCovers(scope, secretName) {
  if (!scope) return false;
  const normalized = scope.replace(/\/+$/, '');
  const marker = '/providers/Microsoft.KeyVault/vaults/';
  const at = normalized.indexOf(marker);
  if (at === -1) {
    return normalized === '/' || normalized.includes('/subscriptions/');
  }
  const rest = normalized.slice(at + marker.length).split('/');
  if (rest.length === 1) return true;
  return rest[1] === 'secrets' && rest[2] === secretName && rest.length === 3;
}

function conditionAllows(condition, secretName) {
  if (!condition) return true;
  const quoted = [...condition.matchAll(/'([^']+)'|"([^"]+)"/g)].map(
    (match) => match[1] ?? match[2],
  );
  return quoted.includes(secretName);
}

function authorized(assignments, roles, secretName) {
  return assignments.some((assignment) => {
    const role = roles.get(assignment.role);
    return (
      roleGrantsGet(role) &&
      scopeCovers(assignment.scope, secretName) &&
      conditionAllows(assignment.condition, secretName)
    );
  });
}

/**
 * AzureKeyVault::fetch_one. A 403 on the prefixed name does not fall through.
 * A 404 does. `vault` maps a secret name to a placeholder value.
 */
function fetchOne(logicalKey, assignments, roles, vault) {
  for (const name of candidates(logicalKey)) {
    if (!authorized(assignments, roles, name)) {
      return { ok: false, status: 403, name };
    }
    if (vault.has(name)) {
      return { ok: true, name, value: vault.get(name) };
    }
  }
  return { ok: false, status: 404 };
}

/**
 * postgres-protocol 0.6.11 password_message: tag `p`, big-endian length
 * including the length word, then the password and a trailing NUL.
 */
function passwordMessage(password) {
  const body = Buffer.from(password);
  const length = 4 + body.length + 1;
  const message = Buffer.alloc(1 + length);
  message[0] = 0x70;
  message.writeInt32BE(length, 1);
  body.copy(message, 5);
  message[5 + body.length] = 0;
  return message;
}

function exampleLogicalKeys(markdown) {
  const keys = new Set();
  for (const match of markdown.matchAll(/```ya?ml\n([\s\S]*?)```/g)) {
    const block = match[1];
    if (!/datasets:|models:|params:/.test(block)) continue;
    for (const ref of block.matchAll(/\$\{\s*azure:([A-Za-z][A-Za-z0-9_-]*)\s*\}/g)) {
      keys.add(ref[1]);
    }
  }
  return [...keys];
}

function roleSection(markdown) {
  const heading = '## Required Role Assignments';
  const start = markdown.indexOf(heading);
  if (start < 0) return '';
  const next = markdown.indexOf('\n## ', start + heading.length);
  return next < 0 ? markdown.slice(start) : markdown.slice(start, next);
}

function instructsVaultWideAccessPolicyGet(section) {
  return /grant the `?Get`?/i.test(section);
}

/**
 * A sentence that tells the reader to use Key Vault Secrets User without
 * limiting getSecret to named secrets. A sentence that says not to use the
 * role is not a recommendation.
 */
function recommendsUnscopedSecretsUser(markdown) {
  const sentences = markdown.split(/(?<=[.\n])/);
  return sentences.some((sentence) => {
    if (!sentence.includes('Key Vault Secrets User')) return false;
    if (/\b(do not|don't|never|avoid)\b/i.test(sentence)) return false;
    const limits =
      sentence.includes('getSecret') &&
      /(secret name|individual secret|per-secret|\/secrets\/)/i.test(sentence);
    return !limits;
  });
}

const website = path.join(repoRoot, 'website');
const keyVaultPages = (
  await walk(website, (full) => full.endsWith(`${path.sep}azure-keyvault${path.sep}index.md`))
).sort();
const deploymentPages = (
  await walk(
    website,
    (full) => full.includes(`${path.sep}deployment${path.sep}azure${path.sep}`) && full.endsWith('.md'),
  )
).sort();

test('key vault guides exist to check', () => {
  assert.ok(keyVaultPages.length >= 6, `found ${keyVaultPages.length} guides`);
});

for (const page of keyVaultPages) {
  const relative = path.relative(repoRoot, page);

  test(`${relative} does not let a reloaded Spicepod read another vault secret`, async () => {
    const markdown = await readFile(page, 'utf8');
    const section = roleSection(markdown);
    const assignments = assignmentsFrom(section);
    const roles = rolesFrom(section);
    const exampleKeys = exampleLogicalKeys(markdown);

    assert.ok(
      section.includes('403') && /list/i.test(section),
      'the role section must keep the note that a 403 on list is tolerated',
    );
    assert.ok(exampleKeys.length > 0, 'the guide needs a Spicepod example that references the store');

    for (const logicalKey of exampleKeys) {
      const resolved = fetchOne(logicalKey, assignments, roles, EXAMPLE_VAULT);
      assert.equal(
        resolved.ok,
        true,
        `${logicalKey} must still resolve (prefixed miss is a 404 only when that name is allowed; a 403 does not fall through). Got ${JSON.stringify(resolved)}`,
      );
    }

    const attackerVault = new Map([[ATTACKER_SECRET_NAME, ATTACKER_PLACEHOLDER]]);
    const stolen = fetchOne(ATTACKER_LOGICAL_KEY, assignments, roles, attackerVault);
    if (stolen.ok) {
      // The reloaded dataset's pg_host is the attacker's server. tokio-postgres
      // writes this cleartext password message on that connection.
      const message = passwordMessage(stolen.value);
      assert.ok(message[0] === 0x70 && message.includes(Buffer.from(stolen.value)));
      assert.fail(
        `${relative} authorizes ${stolen.name}. A Spicepod reload would send that value to ${ATTACKER_HOST} as the database password (${message.toString('hex')}).`,
      );
    }
  });

  test(`${relative} does not tell operators to grant access-policy Get on every secret`, async () => {
    const markdown = await readFile(page, 'utf8');
    assert.equal(
      instructsVaultWideAccessPolicyGet(roleSection(markdown)),
      false,
      'access-policy guidance must not tell operators to grant Get on Secrets for the vault',
    );
  });
}

for (const page of deploymentPages) {
  const relative = path.relative(repoRoot, page);

  test(`${relative} does not recommend Key Vault Secrets User on a vault`, async () => {
    const markdown = await readFile(page, 'utf8');
    if (!markdown.includes('Key Vault Secrets User')) return;
    assert.equal(
      recommendsUnscopedSecretsUser(markdown),
      false,
      `${relative} still recommends Key Vault Secrets User without limiting getSecret to named secrets`,
    );
  });
}
