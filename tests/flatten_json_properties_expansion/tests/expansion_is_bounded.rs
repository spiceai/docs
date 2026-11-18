//! Spec for the schema walk behind `flatten_json_properties`.
//!
//! The walker here is the v2.4.1 control flow from
//! `crates/runtime-datafusion-udfs/src/json_properties.rs` in spiceai/spiceai
//! tag v2.4.1 (`9013f3ef4c46f33490d48677cb55a84e29b053a6`): `collect_effective`
//! follows local `$ref`s and `allOf` / `oneOf` / `anyOf`, drops a `$ref` from
//! the cycle set when that call returns, and builds the full list of schema
//! nodes before it emits a row. v2.4.2 stops that list at 4,194,304 schema-node
//! visits per document.
//!
//! These tests fail while that v2.4.1 walk is what runs. They pass once the
//! walk stops at the visit cap.
//!
//! `flatten_json` and `json_tree` are not covered. In v2.4.1 their walkers
//! visit each JSON value once and do not resolve `$ref` or combinators, so
//! this schema does not multiply their work.

use json_expand::{
    expand, repeated_schema, FlattenOptions, DEFAULT_MAX_BYTES, MAX_EFFECTIVE_ENTRIES,
};

fn assert_within_cap(combinator: &str) {
    let doc = repeated_schema(combinator, 4, 10);
    assert!(
        doc.len() <= DEFAULT_MAX_BYTES,
        "{combinator} input is {} bytes",
        doc.len()
    );
    let stats = expand(&doc, &FlattenOptions::default());
    assert_eq!(
        stats.rows, 1,
        "{combinator} emits one row, so max_rows does not stop the walk"
    );
    assert!(
        stats.visits <= MAX_EFFECTIVE_ENTRIES && stats.peak_out <= MAX_EFFECTIVE_ENTRIES,
        "{combinator} input {} bytes expanded to {} schema-node visits and a list of {} schema nodes ({} bytes of pointers)",
        stats.input_len,
        stats.visits,
        stats.peak_out,
        stats.peak_out.saturating_mul(std::mem::size_of::<usize>())
    );
}

#[test]
fn allof_ref_repetition_stays_within_schema_visit_cap() {
    assert_within_cap("allOf");
}

#[test]
fn oneof_ref_repetition_stays_within_schema_visit_cap() {
    assert_within_cap("oneOf");
}

#[test]
fn anyof_ref_repetition_stays_within_schema_visit_cap() {
    assert_within_cap("anyOf");
}

#[test]
fn a_reference_cycle_does_not_expand() {
    let stats = expand(json_expand::cycle_schema(), &FlattenOptions::default());
    assert!(stats.visits <= 4, "visits {}", stats.visits);
    assert!(stats.peak_out <= 4, "peak_out {}", stats.peak_out);
}
