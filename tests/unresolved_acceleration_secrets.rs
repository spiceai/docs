// Spec tests for unresolved acceleration secrets.
//
// These belong in the `tests` module of
// `crates/accelerators/accelerator-postgres/src/lib.rs` in Spice v2.4.3
// (40af136fc6989bf19a685cb58d6a08e5509e903b). They fail while
// `acceleration_parameters` substitutes an empty string for an unresolved
// `${ store:key }` and still returns the accelerator parameters. They pass
// when that load fails with `UnresolvedSecretsError` before a connection is
// opened.
//
// A secret defined as empty, and a secret that resolves to a placeholder,
// must still resolve. Those two tests pass on the current runtime.
//
// Run from a Spice v2.4.3 checkout after moving this module into the file
// above:
//
// cargo test -p accelerator-postgres --lib pg_pass -- --test-threads=1
//
// The same empty substitution is what `get_params_with_secrets` does for a
// model API key. That was run as
// `lenient_param_resolution_substitutes_empty_for_missing_and_store_errors`
// in `runtime-secrets` at the commit above. Model load, embeddings, tools,
// rerank, and the other `get_params_with_secrets` callers are not covered
// by the tests in this file.

use std::sync::Arc;

use async_trait::async_trait;
use data_accelerator_api::acceleration_parameters;
use runtime_acceleration::Engine;
use runtime_acceleration::acceleration::Acceleration;
use runtime_parameters::Diagnostics;
use runtime_secrets::{AnyErrorResult, SecretStore, Secrets, UnresolvedSecretKind};
use secrecy::{ExposeSecret, SecretString};
use std::collections::HashMap;

use super::PostgresAccelerator;

struct MissingStore;

#[async_trait]
impl SecretStore for MissingStore {
    async fn get_secret(&self, _key: &str) -> AnyErrorResult<Option<SecretString>> {
        Ok(None)
    }
}

struct FailingStore;

#[async_trait]
impl SecretStore for FailingStore {
    async fn get_secret(&self, _key: &str) -> AnyErrorResult<Option<SecretString>> {
        Err("store unavailable".into())
    }
}

struct MapStore {
    key: &'static str,
    value: &'static str,
}

#[async_trait]
impl SecretStore for MapStore {
    async fn get_secret(&self, key: &str) -> AnyErrorResult<Option<SecretString>> {
        Ok((key == self.key).then(|| SecretString::from(self.value)))
    }
}

fn secrets_with(name: &str, store: Arc<dyn SecretStore>) -> Arc<tokio::sync::RwLock<Secrets>> {
    let mut secrets = Secrets::new();
    secrets.register_store(name, store);
    Arc::new(tokio::sync::RwLock::new(secrets))
}

fn pg_acceleration(pass: &str) -> Acceleration {
    Acceleration {
        engine: Engine::PostgreSQL,
        params: HashMap::from([
            ("pg_host".to_string(), "127.0.0.1".to_string()),
            ("pg_port".to_string(), "5432".to_string()),
            ("pg_db".to_string(), "spice".to_string()),
            ("pg_user".to_string(), "spice".to_string()),
            ("pg_pass".to_string(), pass.to_string()),
        ]),
        ..Acceleration::default()
    }
}

async fn resolve_pg_pass(
    secrets: Arc<tokio::sync::RwLock<Secrets>>,
    pass: &str,
) -> Result<runtime_parameters::Parameters, Box<dyn std::error::Error + Send + Sync>> {
    acceleration_parameters(
        &PostgresAccelerator::new(),
        &pg_acceleration(pass),
        secrets,
        Diagnostics::Suppress,
    )
    .await
}

fn assert_secret_failure(
    err: &(dyn std::error::Error + Send + Sync),
    kind: UnresolvedSecretKind,
    retriable: bool,
) {
    let unresolved = err
        .downcast_ref::<runtime_secrets::UnresolvedSecretsError>()
        .unwrap_or_else(|| {
            panic!("password resolution must fail before a connection is attempted, got: {err}")
        });
    assert!(
        unresolved
            .unresolved
            .iter()
            .any(|(param, failure)| param == "pg_pass" && failure.kind == kind),
        "expected pg_pass to fail as {kind:?}, got {unresolved:?}"
    );
    assert_eq!(unresolved.is_retriable(), retriable);
    let message = err.to_string();
    assert!(
        message.contains("was not loaded"),
        "the load must stop instead of continuing with an empty password: {message}"
    );
    assert!(message.contains("pg_pass"), "the error must name the parameter: {message}");
}

fn reject_loaded_password(params: &runtime_parameters::Parameters) -> ! {
    let blank = params
        .get("pass")
        .ok()
        .is_some_and(|secret| secret.expose_secret().is_empty());
    let present = params.get("pass").ok().is_some();
    panic!(
        "acceleration parameters loaded with a password parameter present={present} blank={blank}"
    );
}

#[tokio::test]
async fn unresolved_pg_pass_does_not_load_the_accelerator() {
    match resolve_pg_pass(
        secrets_with("env", Arc::new(MissingStore)),
        "${ secrets:PG_PASS }",
    )
    .await
    {
        Ok(params) => reject_loaded_password(&params),
        Err(err) => assert_secret_failure(err.as_ref(), UnresolvedSecretKind::NotFound, false),
    }
}

#[tokio::test]
async fn pg_pass_store_error_does_not_load_the_accelerator() {
    match resolve_pg_pass(
        secrets_with("vault", Arc::new(FailingStore)),
        "${ secrets:PG_PASS }",
    )
    .await
    {
        Ok(params) => reject_loaded_password(&params),
        Err(err) => assert_secret_failure(err.as_ref(), UnresolvedSecretKind::StoreError, true),
    }
}

#[tokio::test]
async fn pg_pass_undefined_store_does_not_load_the_accelerator() {
    match resolve_pg_pass(
        secrets_with("env", Arc::new(MissingStore)),
        "${ nostore:PG_PASS }",
    )
    .await
    {
        Ok(params) => reject_loaded_password(&params),
        Err(err) => {
            assert_secret_failure(err.as_ref(), UnresolvedSecretKind::UndefinedStore, false)
        }
    }
}

#[tokio::test]
async fn pg_pass_defined_as_empty_still_resolves() {
    let params = resolve_pg_pass(
        secrets_with(
            "env",
            Arc::new(MapStore {
                key: "PG_PASS",
                value: "",
            }),
        ),
        "${ secrets:PG_PASS }",
    )
    .await
    .expect("a secret defined as empty is resolved");
    let pass = params
        .get("pass")
        .ok()
        .expect("pass is present when the secret is defined");
    assert!(pass.expose_secret().is_empty());
}

#[tokio::test]
async fn pg_pass_placeholder_resolves_to_that_placeholder() {
    let params = resolve_pg_pass(
        secrets_with(
            "env",
            Arc::new(MapStore {
                key: "PG_PASS",
                value: "placeholder",
            }),
        ),
        "${ secrets:PG_PASS }",
    )
    .await
    .expect("a defined secret resolves");
    let pass = params
        .get("pass")
        .ok()
        .expect("pass is present when the secret resolves");
    assert_eq!(pass.expose_secret(), "placeholder");
}
