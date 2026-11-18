//! A copy of a Cloud Connect configuration directory must not be enough to
//! recover secrets the runtime cached there.
//!
//! Spice.ai v2.4.3 (`runtime-cloud-connect` at tag `v2.4.3`) enrolls by minting
//! `Identity::cache_key_b64` and writing it through `IdentityStore::store`.
//! Delivery then reloads that identity and calls `secret_cache::write` with
//! `Identity::cache_key`. These tests follow that sequence, then act as a
//! reader of a directory copy: the only key material they may use is bytes
//! stored in the copy. They fail while that copy still opens the cache.

use std::collections::BTreeMap;
use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use base64::Engine as _;
use runtime_cloud_connect::identity::Identity;
use runtime_cloud_connect::secret_cache::{self, SECRET_CACHE_FILE};
use runtime_cloud_connect::IdentityStore;
use zeroize::Zeroizing;

const SECRET_NAME: &str = "database_password";
const PLACEHOLDER_SECRET: &[u8] = b"placeholder-secret-value";
const INCOMING_CACHE: &str = ".secrets-cache.incoming.json";
const PREVIOUS_CACHE: &str = ".secrets-cache.previous.json";

#[test]
fn a_config_directory_copy_does_not_reveal_a_directly_cached_secret() {
    let dir = enrolled_config_dir();
    let key = reload_cache_key(dir.path());
    write_cache(&dir.path().join(SECRET_CACHE_FILE), &key);
    let copy = copy_tree(dir.path());

    assert_eq!(
        exposure(copy.path()),
        Exposure::None,
        "a copy of the instance configuration directory revealed the delivered secret"
    );
}

#[test]
fn a_config_directory_copy_does_not_reveal_a_promoted_or_previous_cache() {
    let dir = enrolled_config_dir();
    let key = reload_cache_key(dir.path());
    let canonical = dir.path().join(SECRET_CACHE_FILE);
    write_cache(&canonical, &key);
    runtime_cloud_connect::identity::snapshot_regular_file_create_new(
        &canonical,
        &dir.path().join(PREVIOUS_CACHE),
    )
    .expect("snapshot the cache the way deployment promotion does");
    let incoming = dir.path().join(INCOMING_CACHE);
    write_cache(&incoming, &key);
    fs::rename(&incoming, &canonical).expect("promote the staged cache");
    let copy = copy_tree(dir.path());

    assert_eq!(
        exposure(copy.path()),
        Exposure::None,
        "a copy of the instance configuration directory revealed a promoted or previous cache"
    );
}

#[test]
fn a_renewed_identity_file_does_not_make_a_directory_copy_reveal_the_cache() {
    let dir = enrolled_config_dir();
    let key = reload_cache_key(dir.path());
    write_cache(&dir.path().join(SECRET_CACHE_FILE), &key);
    let identity = IdentityStore::load_optional(&dir.path().join(IDENTITY_FILE))
        .expect("reload identity")
        .expect("identity file exists");
    IdentityStore::store_credential_update(
        dir.path(),
        &dir.path().join(IDENTITY_FILE),
        &identity.identifier,
        &identity.public_key_pem,
        &identity,
    )
    .expect("renewal persists the identity, including its cache key field");
    let copy = copy_tree(dir.path());

    assert_eq!(
        exposure(copy.path()),
        Exposure::None,
        "a copy of the configuration directory revealed the cache after identity renewal"
    );
}

#[test]
fn cache_files_stay_unreadable_to_other_accounts() {
    let dir = enrolled_config_dir();
    let key = reload_cache_key(dir.path());
    write_cache(&dir.path().join(SECRET_CACHE_FILE), &key);
    fs::set_permissions(dir.path(), fs::Permissions::from_mode(0o755))
        .expect("model a traversable instance directory");

    for name in [IDENTITY_FILE, SECRET_CACHE_FILE] {
        let path = dir.path().join(name);
        let mode = fs::metadata(&path)
            .unwrap_or_else(|err| panic!("stat {name}: {err}"))
            .permissions()
            .mode()
            & 0o777;
        assert_eq!(mode, 0o600, "{name} mode is {mode:o}, expected owner read and write only");

        let output = Command::new("sudo")
            .args(["-n", "-u", "nobody", "cat"])
            .arg(&path)
            .output()
            .expect("run the file read as nobody");
        assert!(
            !output.status.success(),
            "another local account read {name}"
        );
    }
}

const IDENTITY_FILE: &str = "identity.json";

fn enrolled_config_dir() -> tempfile::TempDir {
    let dir = tempfile::tempdir().expect("config dir");
    let previous = unsafe { libc::umask(0) };
    let stored = IdentityStore::store(&dir.path().join(IDENTITY_FILE), &minted_identity());
    unsafe {
        libc::umask(previous);
    }
    stored.expect("persist the enrolled identity");
    dir
}

fn minted_identity() -> Identity {
    let mut identity = Identity {
        identifier: "inst_placeholder".to_string(),
        identity_cert_pem: "placeholder-certificate".to_string(),
        private_key_pem: "placeholder-identity-key".to_string(),
        public_key_pem: "placeholder-public-key".to_string(),
        ca_bundle_pem: String::new(),
        gateway_addr: "gateway.example:443".to_string(),
        control_plane_endpoint: None,
        not_after_unix: None,
        enc_private_key_pem: "placeholder-encryption-key".to_string(),
        enc_public_key_pem: "placeholder-encryption-public-key".to_string(),
        enc_previous_private_key_pem: String::new(),
        cache_key_b64: String::new(),
        app_id: None,
        org_name: None,
        app_name: None,
        monitor_url: None,
        new_project_url: None,
    };
    assert!(
        identity.ensure_cache_key(),
        "enrollment mints the delivered-secret cache key"
    );
    identity
}

fn reload_cache_key(dir: &Path) -> Zeroizing<Vec<u8>> {
    IdentityStore::load_optional(&dir.join(IDENTITY_FILE))
        .expect("reload identity")
        .expect("identity file exists")
        .cache_key()
        .expect("delivery reloads the cache key from the identity file")
}

fn write_cache(path: &Path, key: &[u8]) {
    let mut secrets = BTreeMap::new();
    secrets.insert(SECRET_NAME.to_string(), Zeroizing::new(PLACEHOLDER_SECRET.to_vec()));
    secret_cache::write(path, key, "", &secrets).expect("cache delivered secrets");
}

fn copy_tree(source: &Path) -> tempfile::TempDir {
    let copy = tempfile::tempdir().expect("directory copy");
    copy_dir(source, copy.path());
    copy
}

fn copy_dir(source: &Path, destination: &Path) {
    for entry in fs::read_dir(source).expect("read config dir") {
        let entry = entry.expect("dir entry");
        let target = destination.join(entry.file_name());
        let file_type = entry.file_type().expect("file type");
        if file_type.is_dir() {
            fs::create_dir(&target).expect("copy subdirectory");
            copy_dir(&entry.path(), &target);
        } else if file_type.is_file() {
            fs::copy(entry.path(), &target).expect("copy file bytes");
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
enum Exposure {
    None,
    PlaintextInFile,
    Decrypted,
}

fn exposure(dir: &Path) -> Exposure {
    let mut keys = Vec::new();
    let mut files = Vec::new();
    collect(dir, &mut files);
    for path in &files {
        let bytes = fs::read(path).expect("read copied file");
        if bytes
            .windows(PLACEHOLDER_SECRET.len())
            .any(|window| window == PLACEHOLDER_SECRET)
        {
            return Exposure::PlaintextInFile;
        }
        keys.extend(candidate_aead_keys(&bytes));
    }
    for path in &files {
        for key in &keys {
            let Ok(Some(cached)) = secret_cache::read(path, key) else {
                continue;
            };
            if cached
                .get(SECRET_NAME)
                .is_some_and(|value| value.as_slice() == PLACEHOLDER_SECRET)
            {
                return Exposure::Decrypted;
            }
        }
    }
    Exposure::None
}

fn collect(dir: &Path, files: &mut Vec<PathBuf>) {
    for entry in fs::read_dir(dir).expect("read copy") {
        let entry = entry.expect("dir entry");
        let file_type = entry.file_type().expect("file type");
        if file_type.is_dir() {
            collect(&entry.path(), files);
        } else if file_type.is_file() {
            files.push(entry.path());
        }
    }
}

/// Every standard-base64 token in `bytes` that decodes to a 32-byte AEAD key.
fn candidate_aead_keys(bytes: &[u8]) -> Vec<Vec<u8>> {
    let mut keys = Vec::new();
    let mut token = String::new();
    for byte in bytes {
        let ch = *byte as char;
        if ch.is_ascii_alphanumeric() || matches!(ch, '+' | '/' | '=') {
            token.push(ch);
            continue;
        }
        consider_token(&token, &mut keys);
        token.clear();
    }
    consider_token(&token, &mut keys);
    keys
}

fn consider_token(token: &str, keys: &mut Vec<Vec<u8>>) {
    if !(40..=88).contains(&token.len()) {
        return;
    }
    let Ok(decoded) = base64::engine::general_purpose::STANDARD.decode(token) else {
        return;
    };
    if decoded.len() == secret_cache_key_len() {
        keys.push(decoded);
    }
}

fn secret_cache_key_len() -> usize {
    runtime_cloud_connect::identity::CACHE_KEY_LEN
}
