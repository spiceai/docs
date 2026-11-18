//! Spec for the JSON flattening memory bound.
//!
//! These tests call the walkers copied from spiceai v2.3.4
//! `crates/runtime-datafusion-udfs` (the same blobs as v2.2.3). They fail
//! while that code is in place. `flatten_json_properties` expands a small
//! schema of repeated `allOf`, `oneOf`, or `anyOf` `$ref` entries before the
//! row cap. `json_tree`, and `flatten_json` with `include_internal`, emit more
//! than 32 times `max_bytes` of output for one nested document. They pass
//! once that expansion and that output are stopped at 32 times `max_bytes`.
//!
//! `max_depth` above 128 is not covered here. That check lives in the
//! DataFusion option parsers, which these walkers do not include.

use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;
use json_schema_expansion::flatten_v23::{self, FlattenOptions as JsonFlattenOptions};
use json_schema_expansion::properties_v23::{self, FlattenOptions};
use json_schema_expansion::tree_v23::{self, JsonTreeOptions};

struct TrackAlloc;

static CURRENT: AtomicUsize = AtomicUsize::new(0);
static PEAK: AtomicUsize = AtomicUsize::new(0);
static LOCK: Mutex<()> = Mutex::new(());

unsafe impl GlobalAlloc for TrackAlloc {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let ptr = unsafe { System.alloc(layout) };
        if !ptr.is_null() {
            note_grow(layout.size());
        }
        ptr
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        note_shrink(layout.size());
        unsafe { System.dealloc(ptr, layout) };
    }

    unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
        let new_ptr = unsafe { System.realloc(ptr, layout, new_size) };
        if !new_ptr.is_null() {
            if new_size > layout.size() {
                note_grow(new_size - layout.size());
            } else {
                note_shrink(layout.size() - new_size);
            }
        }
        new_ptr
    }
}

fn note_grow(n: usize) {
    let now = CURRENT.fetch_add(n, Ordering::Relaxed) + n;
    let mut peak = PEAK.load(Ordering::Relaxed);
    while now > peak {
        match PEAK.compare_exchange_weak(peak, now, Ordering::Relaxed, Ordering::Relaxed) {
            Ok(_) => break,
            Err(seen) => peak = seen,
        }
    }
}

fn note_shrink(n: usize) {
    CURRENT.fetch_sub(n, Ordering::Relaxed);
}

#[global_allocator]
static ALLOC: TrackAlloc = TrackAlloc;

fn peak_during(body: impl FnOnce()) -> usize {
    let _guard = LOCK.lock().expect("allocator lock");
    let base = CURRENT.load(Ordering::Relaxed);
    PEAK.store(base, Ordering::Relaxed);
    body();
    PEAK.load(Ordering::Relaxed).saturating_sub(base)
}

/// Small JSON Schema whose `$defs` form a binary tree of shared `$ref`s.
/// Input size is linear in `depth`. Resolving the combinator is exponential
/// unless shared targets are expanded once.
fn shared_schema(depth: usize, combinator: &str) -> String {
    let mut defs = String::from(
        "\"d0\":{\"type\":\"object\",\"properties\":{\"leaf\":{\"type\":\"string\",\"description\":\"field\"}}}",
    );
    for level in 1..=depth {
        let prev = level - 1;
        defs.push_str(&format!(
            ",\"d{level}\":{{\"{combinator}\":[{{\"$ref\":\"#/$defs/d{prev}\"}},{{\"$ref\":\"#/$defs/d{prev}\"}}]}}"
        ));
    }
    format!(
        "{{\"$defs\":{{{defs}}},\"type\":\"object\",\"properties\":{{\"root\":{{\"$ref\":\"#/$defs/d{depth}\"}}}}}}"
    )
}

fn options_for(input: &str) -> FlattenOptions {
    let mut opts = FlattenOptions::default();
    // The documented row cap and the documented input cap both have to let
    // this document through. `max_bytes` counts input bytes (`>`), so the
    // document is accepted. `max_rows = 1` asks the walk to stop after one row.
    opts.max_rows = 1;
    opts.max_bytes = input.len();
    opts.max_depth = 32;
    opts
}

fn parse_peak(input: &str) -> usize {
    peak_during(|| {
        let _ = serde_json::from_str::<serde_json::Value>(input).expect("schema parses");
    })
}

fn assert_schema_expansion_bounded(combinator: &str) {
    let input = shared_schema(16, combinator);
    assert!(
        input.len() < 8 * 1024,
        "{combinator} schema is not small: {} bytes",
        input.len()
    );
    let opts = options_for(&input);
    let limit = opts.max_bytes.saturating_mul(32);
    let parsed = parse_peak(&input);
    let mut rows = Vec::new();
    let grew = peak_during(|| {
        rows = properties_v23::flatten_with_options(&input, &opts);
    });
    let expanded = grew.saturating_sub(parsed);
    assert!(
        expanded <= limit,
        "{combinator}: resolving the schema allocated {expanded} bytes beyond parsing ({grew} total, {parsed} to parse) from a {} byte document with max_rows={} and max_bytes={}; 32 * max_bytes is {limit}. rows emitted: {}",
        input.len(),
        opts.max_rows,
        opts.max_bytes,
        rows.len()
    );
}

#[test]
fn allof_ref_expansion_stays_within_32_times_max_bytes() {
    assert_schema_expansion_bounded("allOf");
}

#[test]
fn oneof_ref_expansion_stays_within_32_times_max_bytes() {
    assert_schema_expansion_bounded("oneOf");
}

#[test]
fn anyof_ref_expansion_stays_within_32_times_max_bytes() {
    assert_schema_expansion_bounded("anyOf");
}

/// Growth across depths must not be exponential. A fix that expands each
/// shared `$ref` once keeps a four-level increase well under 8x.
#[test]
fn repeated_allof_refs_do_not_grow_exponentially() {
    let mut previous: Option<usize> = None;
    for depth in [8_usize, 12, 16] {
        let input = shared_schema(depth, "allOf");
        let opts = options_for(&input);
        let parsed = parse_peak(&input);
        let grew = peak_during(|| {
            let _ = properties_v23::flatten_with_options(&input, &opts);
        });
        let expanded = grew.saturating_sub(parsed);
        if let Some(prev) = previous {
            assert!(
                expanded <= prev.saturating_mul(4),
                "depth {depth} expanded {expanded} bytes after depth {} expanded {prev}",
                depth - 4
            );
        }
        previous = Some(expanded);
    }
}

fn nested_document(depth: usize, payload: usize) -> String {
    let mut json = format!(r#"{{"v":"{}"}}"#, "x".repeat(payload));
    for _ in 0..depth {
        json = format!(r#"{{"n":{json}}}"#);
    }
    json
}

fn tree_output_bytes(rows: &[tree_v23::TreeRow]) -> usize {
    rows.iter()
        .map(|row| {
            [&row.key, &row.value, &row.atom, &row.path]
                .into_iter()
                .flatten()
                .map(String::len)
                .sum::<usize>()
                + row.type_name.len()
                + row.fullkey.len()
                + std::mem::size_of::<tree_v23::TreeRow>()
        })
        .sum()
}

fn json_output_bytes(rows: &[flatten_v23::JsonRow]) -> usize {
    rows.iter()
        .map(|row| {
            row.path.len()
                + row.parent_path.len()
                + row.key.len()
                + row.value.as_ref().map_or(0, String::len)
                + row.type_name.len()
                + std::mem::size_of::<flatten_v23::JsonRow>()
        })
        .sum()
}

#[test]
fn json_tree_output_stays_within_32_times_max_bytes() {
    let input = nested_document(64, 8 * 1024);
    let mut opts = JsonTreeOptions::default();
    opts.max_bytes = input.len();
    let rows = tree_v23::json_tree_with_options(&input, &opts);
    let produced = tree_output_bytes(&rows);
    let limit = opts.max_bytes.saturating_mul(32);
    assert!(
        produced <= limit,
        "json_tree emitted {produced} bytes from {} input bytes (limit {limit}, rows {})",
        input.len(),
        rows.len()
    );
}

#[test]
fn flatten_json_include_internal_output_stays_within_32_times_max_bytes() {
    let input = nested_document(64, 8 * 1024);
    let mut opts = JsonFlattenOptions::default();
    opts.max_bytes = input.len();
    opts.include_internal = true;
    let rows = flatten_v23::flatten_with_options(&input, &opts);
    let produced = json_output_bytes(&rows);
    let limit = opts.max_bytes.saturating_mul(32);
    assert!(
        produced <= limit,
        "flatten_json emitted {produced} bytes from {} input bytes (limit {limit}, rows {})",
        input.len(),
        rows.len()
    );
}

#[test]
fn schema_refs_do_not_expand_in_flatten_json_or_json_tree() {
    let input = shared_schema(16, "allOf");
    let mut json_opts = JsonFlattenOptions::default();
    json_opts.max_bytes = input.len();
    json_opts.max_rows = 1_000_000;
    let json_rows = flatten_v23::flatten_with_options(&input, &json_opts);
    let mut tree_opts = JsonTreeOptions::default();
    tree_opts.max_bytes = input.len();
    let tree_rows = tree_v23::json_tree_with_options(&input, &tree_opts);
    let limit = input.len().saturating_mul(32);
    assert!(json_output_bytes(&json_rows) <= limit);
    assert!(tree_output_bytes(&tree_rows) <= limit);
}
