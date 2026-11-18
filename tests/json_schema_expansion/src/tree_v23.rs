//! json_tree walker from spiceai v2.3.4.
#![allow(dead_code, unused_imports, clippy::all)]

use std::borrow::Cow;
use std::collections::{HashMap, HashSet};
use serde_json::Value;

struct KeyValue;
impl KeyValue {
    fn new(_key: &str, _value: &str) -> Self { Self }
}
struct Counter;
impl Counter {
    fn add(&self, _value: u64, _labels: &[KeyValue]) {}
}
static INVOCATIONS: Counter = Counter;
static ROWS_EMITTED: Counter = Counter;
fn record_error(_kind: &'static str) {}

const DEFAULT_MAX_DEPTH: usize = 64;
const DEFAULT_MAX_ROWS: usize = 1_000_000;
const DEFAULT_MAX_BYTES: usize = 8 * 1024 * 1024;

/// Scalar UDF ceiling across a single evaluated batch. Per-document caps
/// already bound individual rows, but a wide input batch could still
/// accumulate `number_rows * max_rows` entries in memory. Error out loudly
/// past this watermark so operators see the condition rather than OOM.
const SCALAR_BATCH_MAX_ROWS: usize = 10_000_000;

// -------- Metrics --------

// -------- Options + Output schema --------

#[derive(Debug, Clone)]
pub struct JsonTreeOptions {
    pub max_depth: usize,
    pub max_rows: usize,
    pub max_bytes: usize,
}

impl Default for JsonTreeOptions {
    fn default() -> Self {
        Self {
            max_depth: DEFAULT_MAX_DEPTH,
            max_rows: DEFAULT_MAX_ROWS,
            max_bytes: DEFAULT_MAX_BYTES,
        }
    }
}

/// Return type of the scalar UDF form. Uses `LargeList` (i64 offsets)
/// instead of `List` so a large batch can't overflow the offset range and
/// silently drop rows. `UNNEST` works on both variants, so the change is
/// transparent to downstream SQL.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TreeRow {
    pub key: Option<String>,
    pub value: Option<String>,
    pub type_name: &'static str,
    pub atom: Option<String>,
    pub id: i64,
    pub parent: Option<i64>,
    pub fullkey: String,
    pub path: Option<String>,
}

// -------- Public entry points --------

#[must_use]
pub fn json_tree(input: &str) -> Vec<TreeRow> {
    json_tree_with_options(input, &JsonTreeOptions::default())
}

#[must_use]
pub fn json_tree_with_options(input: &str, opts: &JsonTreeOptions) -> Vec<TreeRow> {
    INVOCATIONS.add(1, &[]);

    if input.len() > opts.max_bytes {
        record_error("input_too_large");
        return Vec::new();
    }

    let Ok(root) = serde_json::from_str::<Value>(input) else {
        record_error("parse");
        return Vec::new();
    };
    let mut ctx = WalkCtx {
        rows: Vec::new(),
        next_id: 0,
        depth_cap_hit: false,
        row_cap_hit: false,
    };
    visit(&root, None, None, "$", None, 0, opts, &mut ctx);
    ROWS_EMITTED.add(ctx.rows.len() as u64, &[]);
    ctx.rows
}

struct WalkCtx {
    rows: Vec<TreeRow>,
    next_id: i64,
    depth_cap_hit: bool,
    row_cap_hit: bool,
}

#[expect(
    clippy::too_many_arguments,
    reason = "walker threads per-node state; collapsing into a struct adds indirection without clarity"
)]
fn visit(
    node: &Value,
    key: Option<String>,
    parent: Option<i64>,
    fullkey: &str,
    path: Option<&str>,
    depth: usize,
    opts: &JsonTreeOptions,
    ctx: &mut WalkCtx,
) {
    if ctx.row_cap_hit {
        return;
    }
    if depth > opts.max_depth {
        if !ctx.depth_cap_hit {
            ctx.depth_cap_hit = true;
            record_error("depth_exceeded");
        }
        return;
    }
    if ctx.rows.len() >= opts.max_rows {
        if !ctx.row_cap_hit {
            ctx.row_cap_hit = true;
            record_error("row_cap_hit");
        }
        return;
    }
    let id = ctx.next_id;
    ctx.next_id += 1;

    ctx.rows.push(TreeRow {
        key,
        value: Some(node.to_string()),
        type_name: type_of(node),
        atom: atom_of(node),
        id,
        parent,
        fullkey: fullkey.to_owned(),
        path: path.map(ToOwned::to_owned),
    });

    match node {
        Value::Object(map) => {
            for (child_key, child) in map {
                if ctx.row_cap_hit {
                    return;
                }
                let child_fullkey = format!("{fullkey}.{}", escape_object_key(child_key));
                visit(
                    child,
                    Some(child_key.clone()),
                    Some(id),
                    &child_fullkey,
                    Some(fullkey),
                    depth + 1,
                    opts,
                    ctx,
                );
            }
        }
        Value::Array(items) => {
            for (idx, child) in items.iter().enumerate() {
                if ctx.row_cap_hit {
                    return;
                }
                let child_fullkey = format!("{fullkey}[{idx}]");
                // DuckDB / SQLite `json_tree` sets `key` to the array index as
                // a string so consumers can distinguish array siblings.
                visit(
                    child,
                    Some(idx.to_string()),
                    Some(id),
                    &child_fullkey,
                    Some(fullkey),
                    depth + 1,
                    opts,
                    ctx,
                );
            }
        }
        _ => {}
    }
}

fn type_of(v: &Value) -> &'static str {
    match v {
        Value::Null => "null",
        Value::Bool(_) => "boolean",
        Value::Number(n) if n.is_i64() || n.is_u64() => "integer",
        Value::Number(_) => "real",
        Value::String(_) => "string",
        Value::Array(_) => "array",
        Value::Object(_) => "object",
    }
}

fn atom_of(v: &Value) -> Option<String> {
    match v {
        Value::Null => Some("null".to_owned()),
        Value::Bool(b) => Some(b.to_string()),
        Value::Number(n) => Some(n.to_string()),
        Value::String(s) => Some(s.clone()),
        Value::Array(_) | Value::Object(_) => None,
    }
}

fn escape_object_key(key: &str) -> Cow<'_, str> {
    // SQLite / DuckDB JSON-path shorthand (`$.a.b`) accepts identifier-style
    // keys only — anything else, including hyphens, must be bracket-quoted so
    // consumers can re-parse the `fullkey`.
    let first = key.chars().next();
    let simple = first.is_some_and(|c| !c.is_ascii_digit())
        && key.chars().all(|c| c.is_ascii_alphanumeric() || c == '_');
    if simple {
        Cow::Borrowed(key)
    } else {
        // Serialize the key as a JSON string literal (no intermediate
        // `Value::String` allocation), then wrap in brackets.
        match serde_json::to_string(key) {
            Ok(encoded) => Cow::Owned(format!("[{encoded}]")),
            // `to_string` on `&str` is effectively infallible; keep a
            // defensive fallback that still produces a bracket-quoted key.
            Err(_) => Cow::Owned(format!("[\"{key}\"]")),
        }
    }
}

