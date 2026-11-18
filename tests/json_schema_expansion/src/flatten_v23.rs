//! flatten_json walker from spiceai v2.3.4.
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

// -------- Output schema --------

// -------- Row + Options --------

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct JsonRow {
    pub path: String,
    pub parent_path: String,
    pub key: String,
    pub value: Option<String>,
    pub type_name: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PathStyle {
    Dot,
    JsonPointer,
}

impl PathStyle {
    fn parse(s: &str) -> Option<Self> {
        match s {
            "dot" => Some(Self::Dot),
            "json-pointer" | "jsonpointer" => Some(Self::JsonPointer),
            _ => None,
        }
    }
}

#[derive(Debug, Clone)]
pub struct FlattenOptions {
    pub max_depth: usize,
    pub max_rows: usize,
    pub max_bytes: usize,
    pub path_style: PathStyle,
    pub include_internal: bool,
    /// When `true`, arrays collapse to a single wildcard segment instead of
    /// per-index paths. Matches `JSONPath` storage conventions.
    pub array_wildcard: bool,
}

impl Default for FlattenOptions {
    fn default() -> Self {
        Self {
            max_depth: DEFAULT_MAX_DEPTH,
            max_rows: DEFAULT_MAX_ROWS,
            max_bytes: DEFAULT_MAX_BYTES,
            path_style: PathStyle::Dot,
            include_internal: false,
            array_wildcard: false,
        }
    }
}

// -------- Public entry points --------

/// Walk with default options.
#[must_use]
pub fn flatten(input: &str) -> Vec<JsonRow> {
    flatten_with_options(input, &FlattenOptions::default())
}

/// Walk an arbitrary JSON value and return one [`JsonRow`] per reachable leaf
/// (and interior node when `include_internal` is set). Never errors: returns
/// an empty / truncated `Vec` for malformed input or caps being hit, emitting
/// the corresponding metric.
#[must_use]
pub fn flatten_with_options(input: &str, opts: &FlattenOptions) -> Vec<JsonRow> {
    INVOCATIONS.add(1, &[]);

    if input.len() > opts.max_bytes {
        record_error("input_too_large");
        return Vec::new();
    }

    let Ok(root) = serde_json::from_str::<Value>(input) else {
        record_error("parse");
        return Vec::new();
    };

    let mut walker = Walker {
        opts,
        rows: Vec::new(),
        row_cap_hit: false,
        depth_cap_hit: false,
    };
    walker.walk(&root, "", "", 0);
    ROWS_EMITTED.add(walker.rows.len() as u64, &[]);
    walker.rows
}

// -------- Walker --------

struct Walker<'a> {
    opts: &'a FlattenOptions,
    rows: Vec<JsonRow>,
    row_cap_hit: bool,
    depth_cap_hit: bool,
}

impl Walker<'_> {
    fn walk(&mut self, value: &Value, path: &str, key: &str, depth: usize) {
        if self.row_cap_hit {
            return;
        }
        if depth > self.opts.max_depth {
            // Only record once per invocation so deeply-nested inputs
            // don't inflate the `depth_exceeded` counter by O(nodes).
            if !self.depth_cap_hit {
                record_error("depth_exceeded");
                self.depth_cap_hit = true;
            }
            return;
        }

        let type_name = value_type(value);
        let is_container = matches!(value, Value::Object(_) | Value::Array(_));

        // Emit interior rows only when `include_internal` is set.
        // Emit leaves always. The root gets no row unless it is a leaf
        // (depth 0 container with no children suppressed) or
        // `include_internal` is set.
        let emit_now = if is_container {
            self.opts.include_internal
        } else {
            true
        };
        let rows_before = self.rows.len();
        if emit_now {
            // `parent_of` returns an owned String; move it into the row.
            self.push_row(
                path,
                parent_of(path, self.opts.path_style),
                key,
                value,
                type_name,
            );
            if self.row_cap_hit {
                return;
            }
        }

        match value {
            Value::Object(map) => {
                for (child_key, child) in map {
                    let child_path = make_path_segment(path, child_key, self.opts.path_style);
                    self.walk(child, &child_path, child_key, depth + 1);
                    if self.row_cap_hit {
                        return;
                    }
                }
            }
            Value::Array(arr) => {
                if self.opts.array_wildcard {
                    // Collapse all elements onto a single `[*]` path. Each
                    // element still gets walked, so an array of objects
                    // produces one row per element's leaf (with duplicate
                    // path strings for leaves at the same depth across
                    // siblings, matching JSONPath semantics).
                    let child_path = make_array_wildcard(path, self.opts.path_style);
                    for child in arr {
                        self.walk(child, &child_path, "[*]", depth + 1);
                        if self.row_cap_hit {
                            return;
                        }
                    }
                } else {
                    for (idx, child) in arr.iter().enumerate() {
                        let child_path = make_array_index(path, idx, self.opts.path_style);
                        // Match the last path segment: bracketed for dot
                        // paths (`[0]`), bare index for json-pointer
                        // (`0`). Keeps `key` consistent with the trailing
                        // segment of `path` so callers can reconstruct
                        // `path` from `parent_path` + `key`.
                        let idx_key = match self.opts.path_style {
                            PathStyle::JsonPointer => idx.to_string(),
                            PathStyle::Dot => format!("[{idx}]"),
                        };
                        self.walk(child, &child_path, &idx_key, depth + 1);
                        if self.row_cap_hit {
                            return;
                        }
                    }
                }
            }
            _ => {}
        }

        // Empty containers (object/array with zero elements) would otherwise
        // produce no row at all in leaves-only mode. Surface them as a single
        // container row so the field still appears.
        if is_container && !emit_now && self.rows.len() == rows_before {
            self.push_row(
                path,
                parent_of(path, self.opts.path_style),
                key,
                value,
                type_name,
            );
        }
    }

    fn push_row(
        &mut self,
        path: &str,
        parent_path: String,
        key: &str,
        value: &Value,
        type_name: &'static str,
    ) {
        if self.rows.len() >= self.opts.max_rows {
            if !self.row_cap_hit {
                record_error("row_cap_hit");
                self.row_cap_hit = true;
            }
            return;
        }
        self.rows.push(JsonRow {
            path: path.to_owned(),
            parent_path,
            key: key.to_owned(),
            value: leaf_value_string(value),
            type_name,
        });
    }
}

fn value_type(v: &Value) -> &'static str {
    match v {
        Value::Null => "null",
        Value::Bool(_) => "boolean",
        Value::Number(n) => {
            if n.is_i64() || n.is_u64() {
                "integer"
            } else {
                "number"
            }
        }
        Value::String(_) => "string",
        Value::Array(_) => "array",
        Value::Object(_) => "object",
    }
}

/// Render leaf values as a compact string. Strings are unquoted, numbers and
/// booleans are stringified, JSON `null` yields SQL `NULL`, containers yield
/// their JSON-compact serialization when they are emitted as a row.
fn leaf_value_string(v: &Value) -> Option<String> {
    match v {
        Value::Null => None,
        Value::Bool(b) => Some(b.to_string()),
        Value::Number(n) => Some(n.to_string()),
        Value::String(s) => Some(s.clone()),
        // For interior rows (only emitted with `include_internal`), surface
        // the container's compact JSON form so downstream consumers can
        // re-parse it if needed.
        Value::Array(_) | Value::Object(_) => serde_json::to_string(v).ok(),
    }
}

/// Extract the parent of the given path without re-computing it during the
/// walk. Empty input returns empty — the root has no parent.
fn parent_of(path: &str, style: PathStyle) -> String {
    if path.is_empty() {
        return String::new();
    }
    match style {
        PathStyle::Dot => {
            // The last segment is either `.name` or `[idx]` / `[*]`.
            // Find the last separator that starts a new segment.
            let last_dot = path.rfind('.');
            let last_bracket = path.rfind('[');
            match (last_dot, last_bracket) {
                (Some(d), Some(b)) if d > b => path[..d].to_owned(),
                (Some(d), None) => path[..d].to_owned(),
                (_, Some(b)) => path[..b].to_owned(),
                (None, None) => String::new(),
            }
        }
        PathStyle::JsonPointer => path
            .rfind('/')
            .map_or(String::new(), |i| path[..i].to_owned()),
    }
}

fn make_path_segment(parent: &str, name: &str, style: PathStyle) -> String {
    match style {
        PathStyle::Dot => {
            if parent.is_empty() {
                name.to_owned()
            } else {
                format!("{parent}.{name}")
            }
        }
        PathStyle::JsonPointer => {
            // RFC 6901 escaping: `~` → `~0`, `/` → `~1`.
            let escaped = name.replace('~', "~0").replace('/', "~1");
            if parent.is_empty() {
                format!("/{escaped}")
            } else {
                format!("{parent}/{escaped}")
            }
        }
    }
}

fn make_array_index(parent: &str, idx: usize, style: PathStyle) -> String {
    match style {
        PathStyle::Dot => format!("{parent}[{idx}]"),
        PathStyle::JsonPointer => {
            if parent.is_empty() {
                format!("/{idx}")
            } else {
                format!("{parent}/{idx}")
            }
        }
    }
}

fn make_array_wildcard(parent: &str, style: PathStyle) -> String {
    match style {
        PathStyle::Dot => format!("{parent}[*]"),
        PathStyle::JsonPointer => {
            if parent.is_empty() {
                "/[*]".to_owned()
            } else {
                format!("{parent}/[*]")
            }
        }
    }
}

