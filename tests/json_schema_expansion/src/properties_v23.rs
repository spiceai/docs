//! flatten_json_properties walker from spiceai v2.3.4 (6c30f17bd32b6c727dd729b924a66ad452fe3f12), crates/runtime-datafusion-udfs/src/json_properties.rs. Same bytes as v2.2.3.
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

/// Default caps. Configurable per-call via named args.
const DEFAULT_MAX_DEPTH: usize = 32;
const DEFAULT_MAX_ROWS: usize = 100_000;
const DEFAULT_MAX_BYTES: usize = 8 * 1024 * 1024;

/// Scalar UDF ceiling across a single evaluated batch. Per-document caps
/// already bound individual rows, but a wide input batch could still
/// accumulate `number_rows * max_rows` entries in memory. Error out loudly
/// past this watermark so operators see the condition rather than OOM.
const SCALAR_BATCH_MAX_ROWS: usize = 10_000_000;

// -------- Metrics --------

// -------- Output schema --------

/// Return type of the scalar UDF form. Uses `LargeList` (i64 offsets)
/// instead of `List` so a large batch can't overflow the offset range and
/// silently drop rows. `UNNEST` works on both variants, so the change is
/// transparent to downstream SQL.
// -------- Row + Options --------

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PropertyRow {
    pub path: String,
    pub parent_path: String,
    pub name: String,
    pub description: Option<String>,
    pub type_name: Cow<'static, str>,
    pub required: bool,
    pub format: Option<String>,
    pub enum_values: Option<Vec<String>>,
    pub metadata: Option<String>,
}

/// Dialect tag carried through options. Currently only affects the metric
/// label on `flatten_json_properties_invocations_total`; walker behavior does
/// not yet diverge. Retained so callers (and metrics) can distinguish traffic
/// when dialect-specific behavior lands later.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Dialect {
    JsonSchema,
    OpenApi,
}

impl Dialect {
    fn label(self) -> &'static str {
        match self {
            Self::JsonSchema => "json-schema",
            Self::OpenApi => "openapi",
        }
    }
    fn parse(s: &str) -> Option<Self> {
        match s {
            "json-schema" | "jsonschema" => Some(Self::JsonSchema),
            "openapi" => Some(Self::OpenApi),
            _ => None,
        }
    }
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
    pub dialect: Dialect,
    pub include_internal: bool,
    pub path_style: PathStyle,
    /// When `true`, walk into `additionalProperties` and emit the map's
    /// dynamic key as a synthetic wildcard segment (see `map_wildcard`).
    /// Defaults to `false` to preserve the original `parent.child`
    /// collapsing behavior for maps.
    pub expand_maps: bool,
    /// The wildcard segment inserted between a map and its value when
    /// `expand_maps` is `true`. `JSONPath` storage conventions use
    /// `"[*]"`. Must be non-empty; callers that bypass the UDTF arg
    /// parser are responsible for keeping it non-empty.
    pub map_wildcard: String,
}

impl Default for FlattenOptions {
    fn default() -> Self {
        Self {
            max_depth: DEFAULT_MAX_DEPTH,
            max_rows: DEFAULT_MAX_ROWS,
            max_bytes: DEFAULT_MAX_BYTES,
            dialect: Dialect::JsonSchema,
            include_internal: false,
            path_style: PathStyle::Dot,
            expand_maps: false,
            map_wildcard: "[*]".to_owned(),
        }
    }
}

// -------- Public entry points --------

/// Walk with default options. See [`flatten_with_options`] for configurable caps.
#[must_use]
pub fn flatten(input: &str) -> Vec<PropertyRow> {
    flatten_with_options(input, &FlattenOptions::default())
}

/// Walk a JSON-Schema-shaped document and return one [`PropertyRow`] per
/// reachable field. Never errors: returns an empty / truncated `Vec` for
/// malformed input or caps being hit, emitting the corresponding metric.
#[must_use]
pub fn flatten_with_options(input: &str, opts: &FlattenOptions) -> Vec<PropertyRow> {
    INVOCATIONS.add(1, &[KeyValue::new("dialect", opts.dialect.label())]);

    if input.len() > opts.max_bytes {
        record_error("input_too_large");
        return Vec::new();
    }

    let Ok(root) = serde_json::from_str::<Value>(input) else {
        record_error("parse");
        return Vec::new();
    };

    let mut walker = Walker::new(&root, opts);
    // Capture the root lifetime as a free variable so `walk_schema` sees it as
    // `&'a Value` — letting ref resolution return `&'a Value` without cloning.
    let root_ref: &Value = &root;
    walker.walk_schema(root_ref, "", 0);
    ROWS_EMITTED.add(walker.rows.len() as u64, &[]);
    walker.rows
}

// -------- Walker --------

struct Walker<'a> {
    root: &'a Value,
    opts: &'a FlattenOptions,
    rows: Vec<PropertyRow>,
    /// Active `$ref` pointers on the walk stack, for cycle detection.
    visited_refs: HashSet<String>,
    depth_cap_hit: bool,
    row_cap_hit: bool,
}

impl<'a> Walker<'a> {
    fn new(root: &'a Value, opts: &'a FlattenOptions) -> Self {
        Self {
            root,
            opts,
            rows: Vec::new(),
            visited_refs: HashSet::new(),
            depth_cap_hit: false,
            row_cap_hit: false,
        }
    }

    fn walk_schema(&mut self, schema: &'a Value, parent_path: &str, depth: usize) {
        if self.check_caps(depth) {
            return;
        }
        let effective = self.effective_schemas(schema);

        // `collect_effective` handles cycles during a single resolution
        // pass, but once control returns here we recurse into the resolved
        // schema's own children — any `$ref` back to this node would look
        // "fresh" to the next `collect_effective` call. Re-insert the ref
        // (if there was one) so the whole walk-chain sees it.
        // Capture the local `$ref` once: insert into the cycle set and keep
        // the owned string for later removal (avoids a second `to_owned`).
        let chain_ref: Option<String> = schema
            .get("$ref")
            .and_then(Value::as_str)
            .filter(|r| is_local_ref(r))
            .and_then(|r| {
                if self.visited_refs.contains(r) {
                    None
                } else {
                    let owned = r.to_owned();
                    self.visited_refs.insert(owned.clone());
                    Some(owned)
                }
            });

        let required: HashSet<&str> = effective
            .iter()
            .flat_map(|s| {
                s.get("required")
                    .and_then(Value::as_array)
                    .into_iter()
                    .flatten()
            })
            .filter_map(Value::as_str)
            .collect();

        let mut seen_names: HashSet<&str> = HashSet::new();
        for eff in &effective {
            if let Some(properties) = eff.get("properties").and_then(Value::as_object) {
                for (name, spec) in properties {
                    if !seen_names.insert(name.as_str()) {
                        continue;
                    }
                    self.handle_field(
                        name,
                        spec,
                        parent_path,
                        required.contains(name.as_str()),
                        depth,
                    );
                    if self.row_cap_hit {
                        if let Some(r) = chain_ref {
                            self.visited_refs.remove(&r);
                        }
                        return;
                    }
                }
            }
        }

        if let Some(r) = chain_ref {
            self.visited_refs.remove(&r);
        }
    }

    fn handle_field(
        &mut self,
        name: &str,
        spec: &'a Value,
        parent_path: &str,
        required: bool,
        depth: usize,
    ) {
        let path = make_path(parent_path, name, self.opts.path_style);
        let effective_specs = self.effective_schemas(spec);

        let type_name = effective_specs
            .iter()
            .map(|s| compute_type(s))
            .find(|t| t.as_ref() != "unknown")
            .unwrap_or(Cow::Borrowed("unknown"));

        let is_container = matches!(type_name.as_ref(), "object" | "array" | "map");
        let emit_container_now = !is_container || self.opts.include_internal;
        if emit_container_now {
            self.emit_row(
                spec,
                &effective_specs,
                &path,
                parent_path,
                name,
                Cow::clone(&type_name),
                required,
            );
            if self.row_cap_hit {
                return;
            }
        }

        // Recurse once on the original `spec`; `walk_schema` re-expands
        // effective branches internally with a single `seen_names` set, so
        // overlapping `properties` across allOf/oneOf/anyOf / $ref branches
        // are de-duplicated rather than emitted once per branch.
        let rows_before = self.rows.len();
        match type_name.as_ref() {
            "object" => {
                self.walk_schema(spec, &path, depth + 1);
            }
            "array" => {
                // Items may itself be typed / composite; reuse walk_schema at
                // the same path so leaves appear as `array.child` rather than
                // `array[].child`. Look across effective branches so `items`
                // declared under a combinator is still found, but use the
                // first matching `items` as the single recursion point.
                if let Some(items) = effective_specs
                    .iter()
                    .find_map(|s| s.get("items"))
                    .filter(|v| v.is_object())
                {
                    self.walk_schema(items, &path, depth + 1);
                }
            }
            "map" => {
                if let Some(ap) = effective_specs
                    .iter()
                    .find_map(|s| s.get("additionalProperties"))
                    .filter(|v| v.is_object())
                {
                    if self.opts.expand_maps {
                        // Treat the map's value schema as a synthetic
                        // field named `map_wildcard` so array/object/
                        // primitive handling reuses `handle_field`'s
                        // recursion. Child paths then emit as
                        // `parent.<map_wildcard>[...children]`, matching
                        // JSONPath storage conventions (e.g.
                        // `identityMap.[*].id` when the map's values
                        // are arrays of objects).
                        self.handle_field(
                            self.opts.map_wildcard.as_str(),
                            ap,
                            &path,
                            false,
                            depth + 1,
                        );
                    } else {
                        // Legacy: collapse children onto the map's own path.
                        // For Map<String, Object>, ap has `properties` and
                        // walk_schema finds them directly (e.g. `labels.value`).
                        // For Map<String, Array<Object>>, ap is an array schema
                        // with no top-level `properties` — unwrap its `items`
                        // first so leaves appear at `map.field` rather than
                        // being silently dropped.
                        let ap_effective = self.effective_schemas(ap);
                        let ap_type = ap_effective
                            .iter()
                            .map(|s| compute_type(s))
                            .find(|t| t.as_ref() != "unknown")
                            .unwrap_or(Cow::Borrowed("unknown"));
                        if ap_type.as_ref() == "array" {
                            if let Some(items) = ap_effective
                                .iter()
                                .find_map(|s| s.get("items"))
                                .filter(|v| v.is_object())
                            {
                                self.walk_schema(items, &path, depth + 1);
                            }
                        } else {
                            self.walk_schema(ap, &path, depth + 1);
                        }
                    }
                }
            }
            _ => {}
        }

        // Leaf-only mode would otherwise drop container fields whose children
        // are primitives (array of strings, map of ints, empty object). If
        // the recursion produced nothing and we haven't already emitted the
        // container, surface it now so the field still appears in the output.
        if is_container && !emit_container_now && self.rows.len() == rows_before {
            self.emit_row(
                spec,
                &effective_specs,
                &path,
                parent_path,
                name,
                type_name,
                required,
            );
        }
    }

    #[expect(
        clippy::too_many_arguments,
        reason = "internal helper threads per-row metadata; splitting into a struct adds noise without clarity"
    )]
    fn emit_row(
        &mut self,
        raw_spec: &'a Value,
        effective: &[&'a Value],
        path: &str,
        parent_path: &str,
        name: &str,
        type_name: Cow<'static, str>,
        required: bool,
    ) {
        // `effective` contains the raw_spec when no $ref was followed, and only
        // the resolved target(s) when one was. The `or_else` arm preserves
        // description / format / enum annotations declared alongside a $ref
        // (JSON Schema 2020-12 lets them coexist; earlier drafts ignored them).
        let description = first_str(effective, "description")
            .or_else(|| raw_spec.get("description").and_then(Value::as_str))
            .map(ToOwned::to_owned);

        let format = first_str(effective, "format")
            .or_else(|| raw_spec.get("format").and_then(Value::as_str))
            .map(ToOwned::to_owned);

        let enum_values = effective
            .iter()
            .find_map(|s| s.get("enum").and_then(Value::as_array))
            .or_else(|| raw_spec.get("enum").and_then(Value::as_array))
            .map(|arr| {
                arr.iter()
                    .map(|v| match v {
                        Value::String(s) => s.clone(),
                        _ => v.to_string(),
                    })
                    .collect::<Vec<_>>()
            });

        self.rows.push(PropertyRow {
            path: path.to_owned(),
            parent_path: parent_path.to_owned(),
            name: name.to_owned(),
            description,
            type_name,
            required,
            format,
            enum_values,
            metadata: Some(raw_spec.to_string()),
        });

        if self.rows.len() >= self.opts.max_rows {
            self.row_cap_hit = true;
            record_error("row_cap_hit");
        }
    }

    /// Resolve `$ref`, `allOf`, `oneOf`, `anyOf` into the list of contributing
    /// schemas. External and unresolvable refs pass through as-is so callers
    /// can still read shape metadata from them.
    fn effective_schemas(&mut self, schema: &'a Value) -> Vec<&'a Value> {
        let mut out = Vec::new();
        self.collect_effective(schema, &mut out, 0);
        if out.is_empty() {
            out.push(schema);
        }
        out
    }

    /// `ref_depth` tracks how deep we've recursed through `$ref` and
    /// `allOf`/`oneOf`/`anyOf` expansion at a single schema node. Capped at
    /// `opts.max_depth` so pathological combinator / ref chains can't blow the
    /// stack or iterate unboundedly (`DoS`).
    fn collect_effective(&mut self, schema: &'a Value, out: &mut Vec<&'a Value>, ref_depth: usize) {
        if ref_depth > self.opts.max_depth {
            if !self.depth_cap_hit {
                self.depth_cap_hit = true;
                record_error("depth_exceeded");
            }
            out.push(schema);
            return;
        }
        if let Some(ref_str) = schema.get("$ref").and_then(Value::as_str) {
            if is_local_ref(ref_str) {
                if self.visited_refs.contains(ref_str) {
                    record_error("cycle");
                    return;
                }
                // Copy out `self.root: &'a Value` (references are Copy) so the
                // returned `Option<&'a Value>` survives past `self`'s borrow.
                let root: &'a Value = self.root;
                if let Some(target) = root.pointer(ref_str.trim_start_matches('#')) {
                    self.visited_refs.insert(ref_str.to_owned());
                    self.collect_effective(target, out, ref_depth + 1);
                    self.visited_refs.remove(ref_str);
                    return;
                }
                // Local ref that doesn't resolve — fall through and treat the
                // schema itself as the contribution.
            }
            // External ref — `compute_type` will classify as `ref`; the URI
            // remains in `metadata`. Never dereferenced.
            out.push(schema);
            return;
        }

        out.push(schema);
        for comb in ["allOf", "oneOf", "anyOf"] {
            if let Some(arr) = schema.get(comb).and_then(Value::as_array) {
                for entry in arr {
                    self.collect_effective(entry, out, ref_depth + 1);
                }
            }
        }
    }

    fn check_caps(&mut self, depth: usize) -> bool {
        if depth > self.opts.max_depth {
            if !self.depth_cap_hit {
                self.depth_cap_hit = true;
                record_error("depth_exceeded");
            }
            return true;
        }
        if self.rows.len() >= self.opts.max_rows {
            if !self.row_cap_hit {
                self.row_cap_hit = true;
                record_error("row_cap_hit");
            }
            return true;
        }
        false
    }
}

// -------- Helpers --------

fn first_str<'a>(schemas: &[&'a Value], key: &str) -> Option<&'a str> {
    schemas
        .iter()
        .find_map(|s| s.get(key).and_then(Value::as_str))
}

fn is_local_ref(ref_str: &str) -> bool {
    ref_str.starts_with('#')
}

/// Map a schema type string onto a `'static` label when it matches a known
/// JSON Schema primitive / container keyword.
fn static_type_label(s: &str) -> Option<&'static str> {
    match s {
        "null" => Some("null"),
        "boolean" => Some("boolean"),
        "object" => Some("object"),
        "array" => Some("array"),
        "number" => Some("number"),
        "integer" => Some("integer"),
        "string" => Some("string"),
        _ => None,
    }
}

/// Classify a schema node into one of the emitted type labels.
fn compute_type(spec: &Value) -> Cow<'static, str> {
    // External $ref → "ref"
    if let Some(ref_str) = spec.get("$ref").and_then(Value::as_str)
        && !is_local_ref(ref_str)
    {
        return Cow::Borrowed("ref");
    }
    // Explicit additionalProperties without own properties → map.
    let has_ap = spec
        .get("additionalProperties")
        .is_some_and(Value::is_object);
    // Require `properties` / `items` to be well-formed before treating the node
    // as an object/array. A non-object `properties` or a non-object/array
    // `items` shouldn't silently flip the type.
    let has_props = spec.get("properties").is_some_and(Value::is_object);
    if has_ap && !has_props {
        return Cow::Borrowed("map");
    }
    match spec.get("type") {
        Some(Value::String(s)) => {
            static_type_label(s).map_or_else(|| Cow::Owned(s.clone()), Cow::Borrowed)
        }
        Some(Value::Array(arr)) => {
            // Type unions with `"null"` express optional/nullable in JSON
            // Schema; the "real" type is the first non-null entry. Only fall
            // back to `"null"` (or `"unknown"`) when no other type is present.
            let chosen = arr
                .iter()
                .filter_map(Value::as_str)
                .find(|&t| t != "null")
                .or_else(|| arr.iter().find_map(Value::as_str))
                .unwrap_or("unknown");
            static_type_label(chosen).map_or_else(|| Cow::Owned(chosen.to_owned()), Cow::Borrowed)
        }
        _ => {
            if has_props {
                Cow::Borrowed("object")
            } else if spec
                .get("items")
                .is_some_and(|v| v.is_object() || v.is_array())
            {
                Cow::Borrowed("array")
            } else if let Some(first_enum) = spec
                .get("enum")
                .and_then(Value::as_array)
                .and_then(|a| a.first())
            {
                Cow::Borrowed(match first_enum {
                    Value::String(_) => "string",
                    Value::Bool(_) => "boolean",
                    Value::Number(n) if n.is_i64() || n.is_u64() => "integer",
                    Value::Number(_) => "number",
                    Value::Null => "null",
                    _ => "unknown",
                })
            } else {
                Cow::Borrowed("unknown")
            }
        }
    }
}

fn make_path(parent: &str, name: &str, style: PathStyle) -> String {
    match style {
        PathStyle::Dot => {
            if parent.is_empty() {
                name.to_owned()
            } else {
                format!("{parent}.{name}")
            }
        }
        PathStyle::JsonPointer => {
            // Escape `/` and `~` per RFC 6901.
            let escaped = name.replace('~', "~0").replace('/', "~1");
            if parent.is_empty() {
                format!("/{escaped}")
            } else {
                format!("{parent}/{escaped}")
            }
        }
    }
}
