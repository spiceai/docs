//! Faithful extract of `flatten_json_properties` schema resolution from
//! spiceai/spiceai v2.4.1 `crates/runtime-datafusion-udfs/src/json_properties.rs`
//! (`Walker::effective_schemas` / `collect_effective` / `walk_schema`).
//! Metrics and row materialization are omitted; they do not change which
//! schema nodes the walk visits. `visits` and `peak_out` only observe.

use serde_json::Value;
use std::collections::HashSet;

pub const DEFAULT_MAX_DEPTH: usize = 32;
pub const DEFAULT_MAX_ROWS: usize = 100_000;
pub const DEFAULT_MAX_BYTES: usize = 8 * 1024 * 1024;
/// Bound added in spiceai/spiceai v2.4.2.
pub const MAX_EFFECTIVE_ENTRIES: usize = 4 * 1024 * 1024;
pub const OUTPUT_BYTES_PER_INPUT_BYTE: usize = 32;

pub struct FlattenOptions {
    pub max_depth: usize,
    pub max_rows: usize,
    pub max_bytes: usize,
}

impl Default for FlattenOptions {
    fn default() -> Self {
        Self {
            max_depth: DEFAULT_MAX_DEPTH,
            max_rows: DEFAULT_MAX_ROWS,
            max_bytes: DEFAULT_MAX_BYTES,
        }
    }
}

pub struct Stats {
    pub visits: usize,
    pub peak_out: usize,
    pub rows: usize,
    pub input_len: usize,
}

struct Walker<'a> {
    root: &'a Value,
    opts: &'a FlattenOptions,
    rows: usize,
    visited_refs: HashSet<String>,
    depth_cap_hit: bool,
    row_cap_hit: bool,
    visits: usize,
    peak_out: usize,
}

impl<'a> Walker<'a> {
    fn new(root: &'a Value, opts: &'a FlattenOptions) -> Self {
        Self {
            root,
            opts,
            rows: 0,
            visited_refs: HashSet::new(),
            depth_cap_hit: false,
            row_cap_hit: false,
            visits: 0,
            peak_out: 0,
        }
    }

    fn walk_schema(&mut self, schema: &'a Value, depth: usize) {
        if self.check_caps(depth) {
            return;
        }
        let effective = self.effective_schemas(schema);

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

        let mut seen_names: HashSet<&str> = HashSet::new();
        for eff in &effective {
            if let Some(properties) = eff.get("properties").and_then(Value::as_object) {
                for (name, spec) in properties {
                    if !seen_names.insert(name.as_str()) {
                        continue;
                    }
                    self.handle_field(spec, depth);
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

    fn handle_field(&mut self, spec: &'a Value, depth: usize) {
        // One emitted row per unique property name. The row cap is checked
        // only after a row is emitted, which is after `effective_schemas`.
        self.rows += 1;
        if self.rows >= self.opts.max_rows {
            self.row_cap_hit = true;
            return;
        }
        let type_name = spec
            .get("type")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        if type_name == "object" || spec.get("properties").is_some() || spec.get("allOf").is_some()
            || spec.get("oneOf").is_some()
            || spec.get("anyOf").is_some()
            || spec.get("$ref").is_some()
        {
            self.walk_schema(spec, depth + 1);
        }
    }

    fn effective_schemas(&mut self, schema: &'a Value) -> Vec<&'a Value> {
        let mut out = Vec::new();
        self.collect_effective(schema, &mut out, 0);
        self.peak_out = self.peak_out.max(out.len());
        if out.is_empty() {
            out.push(schema);
        }
        out
    }

    fn collect_effective(&mut self, schema: &'a Value, out: &mut Vec<&'a Value>, ref_depth: usize) {
        self.visits += 1;
        if ref_depth > self.opts.max_depth {
            if !self.depth_cap_hit {
                self.depth_cap_hit = true;
            }
            out.push(schema);
            return;
        }
        if let Some(ref_str) = schema.get("$ref").and_then(Value::as_str) {
            if is_local_ref(ref_str) {
                if self.visited_refs.contains(ref_str) {
                    return;
                }
                let root: &'a Value = self.root;
                if let Some(target) = root.pointer(ref_str.trim_start_matches('#')) {
                    self.visited_refs.insert(ref_str.to_owned());
                    self.collect_effective(target, out, ref_depth + 1);
                    self.visited_refs.remove(ref_str);
                    return;
                }
            }
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
            self.depth_cap_hit = true;
            return true;
        }
        if self.rows >= self.opts.max_rows {
            self.row_cap_hit = true;
            return true;
        }
        false
    }
}

fn is_local_ref(ref_str: &str) -> bool {
    ref_str.starts_with('#')
}

pub fn expand(input: &str, opts: &FlattenOptions) -> Stats {
    let input_len = input.len();
    if input_len > opts.max_bytes {
        return Stats {
            visits: 0,
            peak_out: 0,
            rows: 0,
            input_len,
        };
    }
    let root: Value = serde_json::from_str(input).expect("schema json");
    let mut walker = Walker::new(&root, opts);
    walker.walk_schema(&root, 0);
    Stats {
        visits: walker.visits,
        peak_out: walker.peak_out,
        rows: walker.rows,
        input_len,
    }
}

/// Same shape as the v2.4.2 regression schema: each definition's combinator
/// lists `branch` local `$ref`s to the next definition. The last definition
/// is one object property. This is not a reference cycle.
pub fn repeated_schema(combinator: &str, branch: usize, levels: usize) -> String {
    let mut defs: Vec<String> = (0..levels)
        .map(|i| {
            let r = format!(r##"{{"$ref":"#/$defs/d{}"}}"##, i + 1);
            let refs = vec![r; branch].join(",");
            format!(r#""d{i}":{{"{combinator}":[{refs}]}}"#)
        })
        .collect();
    defs.push(r#""d_leaf":{"type":"object","properties":{"x":{"type":"string"}}}"#.replace(
        "d_leaf",
        &format!("d{levels}"),
    ));
    let r = r##"{"$ref":"#/$defs/d0"}"##;
    let refs = vec![r.to_string(); branch].join(",");
    format!(
        r#"{{"{combinator}":[{refs}],"$defs":{{{}}}}}"#,
        defs.join(",")
    )
}

pub fn cycle_schema() -> &'static str {
    r##"{"$ref":"#/$defs/a","$defs":{"a":{"$ref":"#/$defs/a","properties":{"x":{"type":"string"}}}}}"##
}
