---
title: 'JSON Functions and Operators'
sidebar_label: 'JSON'
description: 'Reference for JSON functions and operators in Spice SQL'
sidebar_position: 7
---

JSON support in Spice is based on [datafusion-functions-json](https://github.com/datafusion-contrib/datafusion-functions-json), which provides functions and operators to extract, query, and manipulate JSON data stored as strings. Advanced features for JSON creation, modification, or complex path expressions are not supported.

:::warning[Limitations]

- JSON functions and operators are supported only **during DataFusion (Arrow)** execution.
- **Federated or accelerated sources** (non-Arrow) may **not support all JSON functions**.
  See [Federation and pushdown](#federation-and-pushdown).

:::

- [JSON Functions](#json-functions)
  - [`json_contains`](#json_contains)
    - [Arguments](#arguments)
    - [Example](#example)
  - [`json_get`](#json_get)
    - [Arguments](#arguments-1)
    - [Example](#example-1)
  - [`json_get_str`](#json_get_str)
    - [Arguments](#arguments-2)
    - [Example](#example-2)
  - [`json_get_int`](#json_get_int)
    - [Arguments](#arguments-3)
    - [Example](#example-3)
  - [`json_get_float`](#json_get_float)
    - [Arguments](#arguments-4)
    - [Example](#example-4)
  - [`json_get_bool`](#json_get_bool)
    - [Arguments](#arguments-5)
    - [Example](#example-5)
  - [`json_get_json`](#json_get_json)
    - [Arguments](#arguments-6)
    - [Example](#example-6)
  - [`json_get_array`](#json_get_array)
    - [Arguments](#arguments-7)
    - [Example](#example-7)
  - [`json_as_text`](#json_as_text)
    - [Arguments](#arguments-8)
    - [Example](#example-8)
  - [`json_length`](#json_length)
    - [Arguments](#arguments-9)
    - [Example](#example-9)
  - [`json_object_keys`](#json_object_keys)
    - [Arguments](#arguments-13)
    - [Example](#example-13)
- [JSON Operators](#json-operators)
  - [`->`](#op_json_get)
    - [Arguments](#arguments-10)
    - [Example](#example-10)
  - [`->>`](#op_json_as_text)
    - [Arguments](#arguments-11)
    - [Example](#example-11)
  - [`?`](#op_json_contains)
    - [Arguments](#arguments-12)
    - [Example](#example-12)
- [Usage Examples](#usage-examples)
  - [Nested Object Access](#nested-object-access)
  - [Array Access](#array-access)
  - [Conditional JSON Queries](#conditional-json-queries)
  - [Using JSON Functions in Views](#using-json-functions-in-views)
- [Federation and Pushdown](#federation-and-pushdown)
- [Further Reading](#further-reading)

---

## JSON Functions

Enables extracting and manipulating data from JSON strings. Each function takes a JSON string as the first argument, followed by one or more keys or indices to specify the path.

### `json_contains`

Returns `true` if a JSON string contains a specific key at the specified path.

```sql
json_contains(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the key to check. Can be string keys for objects or integer indices for arrays.

#### Example

```sql
> SELECT json_contains('{"a": 1, "b": 2}', 'a');
+-------------------------------------------------+
| json_contains(Utf8("{\"a\": 1, \"b\": 2}"),Utf8("a")) |
+-------------------------------------------------+
| true                                            |
+-------------------------------------------------+
```

### `json_get`

Retrieves a value from a JSON string based on its path.

```sql
json_get(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the value. Can be string keys for objects or integer indices for arrays.

#### Example

```sql
> SELECT json_get('{"a": 1, "b": 2}', 'a');
+----------------------------------------------+
| json_get(Utf8("{"a": 1, "b": 2}"),Utf8("a")) |
+----------------------------------------------+
| {int=1}                                      |
+----------------------------------------------+
```

### `json_get_str`

Retrieves a string value from a JSON string based on its path.

```sql
json_get_str(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the string value.

#### Example

```sql
> SELECT json_get_str('{"name": "John", "age": 30}', 'name');
+----------------------------------------------------------------+
| json_get_str(Utf8("{"name": "John", "age": 30}"),Utf8("name")) |
+----------------------------------------------------------------+
| John                                                           |
+----------------------------------------------------------------+
```

### `json_get_int`

Retrieves an integer value from a JSON string based on its path.

```sql
json_get_int(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the integer value.

#### Example

```sql
> SELECT json_get_int('{"name": "John", "age": 30}', 'age');
+---------------------------------------------------------------+
| json_get_int(Utf8("{"name": "John", "age": 30}"),Utf8("age")) |
+---------------------------------------------------------------+
| 30                                                            |
+---------------------------------------------------------------+
```

### `json_get_float`

Retrieves a float value from a JSON string based on its path.

```sql
json_get_float(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the float value.

#### Example

```sql
> SELECT json_get_float('{"price": 19.99, "quantity": 2}', 'price');
+-----------------------------------------------------------------------+
| json_get_float(Utf8("{"price": 19.99, "quantity": 2}"),Utf8("price")) |
+-----------------------------------------------------------------------+
| 19.99                                                                 |
+-----------------------------------------------------------------------+
```

### `json_get_bool`

Retrieves a boolean value from a JSON string based on its path.

```sql
json_get_bool(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the boolean value.

#### Example

```sql
> SELECT json_get_bool('{"active": true, "visible": false}', 'active');
+--------------------------------------------------------------------------+
| json_get_bool(Utf8("{"active": true, "visible": false}"),Utf8("active")) |
+--------------------------------------------------------------------------+
| true                                                                     |
+--------------------------------------------------------------------------+
```

### `json_get_json`

Retrieves a nested JSON object or array as a raw JSON string from a JSON string based on its path.

```sql
json_get_json(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the nested JSON value.

#### Example

```sql
> SELECT json_get_json('{"user": {"name": "John", "age": 30}}', 'user');
+---------------------------------------------------------------------------+
| json_get_json(Utf8("{"user": {"name": "John", "age": 30}}"),Utf8("user")) |
+---------------------------------------------------------------------------+
| {"name": "John", "age": 30}                                               |
+---------------------------------------------------------------------------+
```

### `json_get_array`

Retrieves an arrow array from a JSON string based on its path.

```sql
json_get_array(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the array value.

#### Example

```sql
> SELECT json_get_array('{"numbers": [1, 2, 3, 4]}', 'numbers');
+-------------------------------------------------------------------+
| json_get_array(Utf8("{"numbers": [1, 2, 3, 4]}"),Utf8("numbers")) |
+-------------------------------------------------------------------+
| [1, 2, 3, 4]                                                      |
+-------------------------------------------------------------------+
```

### `json_as_text`

Retrieves any value from a JSON string based on its path and represents it as a string. This is useful for converting JSON values to text format.

```sql
json_as_text(json_string, key1[, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Path to the value to convert to text.

#### Example

```sql
> SELECT json_as_text('{"age": 30, "active": true}', 'age');
+---------------------------------------------------------------+
| json_as_text(Utf8("{"age": 30, "active": true}"),Utf8("age")) |
+---------------------------------------------------------------+
| 30                                                            |
+---------------------------------------------------------------+
```

### `json_length`

Returns the length of a JSON string, array, or object. For objects, returns the number of key-value pairs. For arrays, returns the number of elements. For strings, returns the character count.

```sql
json_length(json_string[, key1, key2, ...])
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Optional path to a nested value. If omitted, returns the length of the root JSON value.

#### Example

```sql
> SELECT json_length('{"a": 1, "b": 2, "c": 3}');
+-----------------------------------------------+
| json_length(Utf8("{"a": 1, "b": 2, "c": 3}")) |
+-----------------------------------------------+
| 3                                             |
+-----------------------------------------------+

> SELECT json_length('[1, 2, 3, 4, 5]');
+--------------------------------------+
| json_length(Utf8("[1, 2, 3, 4, 5]")) |
+--------------------------------------+
| 5                                    |
+--------------------------------------+
```

### `json_object_keys`

Returns the top-level keys of a JSON object as an array of strings. If a path is provided, returns the keys of the object at that path. Returns `NULL` if the value at the path is not an object.

```sql
json_object_keys(json_string[, key1, key2, ...])
```

Alias: `json_keys`.

#### Arguments

- **json_string**: String containing valid JSON data.
- **key1, key2, ...**: Optional path to a nested object. If omitted, returns the keys of the root object.

#### Example

```sql
> SELECT json_object_keys('{"a": 1, "b": 2, "c": 3}');
+-----------------------------------------------------+
| json_object_keys(Utf8("{"a": 1, "b": 2, "c": 3}"))  |
+-----------------------------------------------------+
| [a, b, c]                                           |
+-----------------------------------------------------+

> SELECT json_object_keys('{"user": {"name": "John", "age": 30}}', 'user');
+-----------------------------------------------------------------------------+
| json_object_keys(Utf8("{"user": {"name": "John", "age": 30}}"),Utf8("user")) |
+-----------------------------------------------------------------------------+
| [name, age]                                                                 |
+-----------------------------------------------------------------------------+
```

---

## JSON Operators

### `->` {#op_json_get}

JSON access operator. Retrieves a value from a JSON string based on its path. This operator is an alias for [`json_get`](#json_get).

```sql
json_string -> key
json_string -> key1 -> key2
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key**: Object key (string) or array index (integer).

#### Example

```sql
> SELECT '{"user": {"name": "John", "age": 30}}' -> 'user' -> 'name';
+-------------------------------------------------------------+
| '{"user": {"name": "John", "age": 30}}' -> 'user' -> 'name' |
+-------------------------------------------------------------+
| {str=John}                                                  |
+-------------------------------------------------------------+
```

### `->>` {#op_json_as_text}

JSON access operator for text extraction. Retrieves any value from a JSON string and converts it to text. This operator is an alias for [`json_as_text`](#json_as_text).

```sql
json_string ->> key
json_string -> key1 ->> key2
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key**: Object key (string) or array index (integer).

#### Example

```sql
> SELECT '{"user": {"name": "John", "age": 30}}' -> 'user' ->> 'age';
+-------------------------------------------------------------+
| '{"user": {"name": "John", "age": 30}}' -> 'user' ->> 'age' |
+-------------------------------------------------------------+
| 30                                                          |
+-------------------------------------------------------------+
```

### `?` {#op_json_contains}

JSON containment operator. Returns `true` if a JSON string contains the specified key. This operator is an alias for [`json_contains`](#json_contains).

```sql
json_string ? 'key'
```

#### Arguments

- **json_string**: String containing valid JSON data.
- **key**: Key to check for existence.

#### Example

```sql
> SELECT '{"user": {"name": "John", "age": 30}}' ? 'user';
+--------------------------------------------------+
| '{"user": {"name": "John", "age": 30}}' ? 'user' |
+--------------------------------------------------+
| true                                             |
+--------------------------------------------------+
```

---

## Usage Examples

### Nested Object Access

```sql
> SELECT '{"inventory": {"stock": {"S": 12, "M": 20}}}' -> 'inventory' -> 'stock' ->> 'S' as size_s_stock;
+---------------+
| size_s_stock  |
+---------------+
| 12            |
+---------------+
```

### Array Access

```sql
> SELECT '{"sizes": ["S", "M", "L", "XL"]}' -> 'sizes' ->> 0 as first_size;
+------------+
| first_size |
+------------+
| S          |
+------------+
```

### Conditional JSON Queries

```sql
> SELECT name, properties ->> 'color' as color
  FROM products
  WHERE properties ? 'color' AND properties ->> 'color' IN ('black', 'white');
```

### Using JSON Functions in Views

JSON functions can be used in views to simplify access to nested JSON data:

```sql
CREATE VIEW products_with_color AS
SELECT
  id,
  name,
  properties ->> 'color' as color,
  json_get_int(properties, 'stock') as stock_count
FROM products;
```

## JSON Table Functions (UDTFs)

Spice includes table-valued functions for decomposing JSON structures into relational rows. Each function is available as both a UDTF (in the `FROM` clause with literal input) and a scalar UDF returning a list of structs (for per-row use with `UNNEST`).

### `flatten_json`

Walks an arbitrary JSON value and emits one row per reachable leaf.

```sql
flatten_json(input Utf8 [, options...]) -> TABLE(
    path         Utf8,
    parent_path  Utf8,
    key          Utf8,
    value        Utf8,
    type         Utf8     -- "object"|"array"|"string"|"number"|"integer"|"boolean"|"null"
)
```

**Options (named arguments):**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `max_depth` | UInt | `64` | Maximum recursion depth. |
| `max_rows` | UInt | `1000000` | Per-document row cap. |
| `max_bytes` | UInt | `8388608` | Input size limit (bytes). |
| `path_style` | Utf8 | `"dot"` | `"dot"` or `"json-pointer"`. |
| `include_internal` | Bool | `false` | Also emit interior object/array rows. |
| `array_wildcard` | Bool | `false` | Collapse array indices to `[*]` instead of `[0]`, `[1]`, etc. |

**UDTF example:**

```sql
SELECT path, value, type
FROM flatten_json('{"user": {"name": "Alice", "scores": [95, 87]}}');
```

| path | value | type |
| --- | --- | --- |
| `user.name` | `Alice` | `string` |
| `user.scores[0]` | `95` | `integer` |
| `user.scores[1]` | `87` | `integer` |

**Scalar UDF example (per-row with `UNNEST`):**

```sql
SELECT rows.path, rows.value, rows.type
FROM (SELECT UNNEST(flatten_json(body)) AS rows FROM documents);
```

### `flatten_json_properties`

Decomposes a JSON Schema document into one row per field, extracting metadata such as types, descriptions, required status, enums, and format.

```sql
flatten_json_properties(input Utf8 [, options...]) -> TABLE(
    path         Utf8,
    parent_path  Utf8,
    name         Utf8,
    description  Utf8,
    type         Utf8,
    required     Boolean,
    format       Utf8,
    enum_values  List<Utf8>,
    metadata     Utf8
)
```

Handles `properties` recursion, `items.properties` (arrays of objects), `additionalProperties` maps, `allOf`/`oneOf`/`anyOf` merging, and local `$ref` pointers with cycle detection.

**Options (named arguments):**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `max_depth` | UInt | `32` | Maximum recursion depth. |
| `max_rows` | UInt | `100000` | Per-document row cap. |
| `max_bytes` | UInt | `8388608` | Input size limit (bytes). |
| `path_style` | Utf8 | `"dot"` | `"dot"` or `"json-pointer"`. |
| `dialect` | Utf8 | `"json-schema"` | `"json-schema"` or `"openapi"` (metrics tagging). |
| `include_internal` | Bool | `false` | Also emit container rows (objects, arrays). |
| `expand_maps` | Bool | `false` | Walk into `additionalProperties` and emit child paths with a wildcard segment (e.g., `parent.[*].child`). |
| `map_wildcard` | Utf8 | `"[*]"` | Wildcard segment for map values when `expand_maps` is `true`. |

**Example:**

```sql
SELECT path, type, required, description
FROM flatten_json_properties('{
  "type": "object",
  "properties": {
    "name": {"type": "string", "description": "User name"},
    "age": {"type": "integer"}
  },
  "required": ["name"]
}');
```

| path | type | required | description |
| --- | --- | --- | --- |
| `name` | `string` | `true` | `User name` |
| `age` | `integer` | `false` | |

**Expanding maps:**

When a JSON Schema uses `additionalProperties` to describe map values, enable `expand_maps` to produce JSONPath-style paths:

```sql
SELECT path, type
FROM flatten_json_properties(
  '{"type": "object", "additionalProperties": {"type": "object", "properties": {"id": {"type": "string"}, "primary": {"type": "boolean"}}}}',
  expand_maps => true
);
```

| path | type |
| --- | --- |
| `[*].id` | `string` |
| `[*].primary` | `boolean` |

### `json_tree`

Recursive depth-first walk of an arbitrary JSON document. Schema-agnostic sibling of `flatten_json_properties` that mirrors the `json_tree` table function in DuckDB and SQLite: one row per node (interior and leaf) in depth-first order, with JSON-Path addresses and a parent pointer for reconstructing the tree.

```sql
json_tree(input Utf8 [, options...]) -> TABLE(
    key       Utf8,    -- key under the parent (object field name) or array index; NULL for the root
    value     Utf8,    -- JSON-encoded value of the node
    type      Utf8,    -- "object"|"array"|"string"|"number"|"integer"|"boolean"|"null"
    atom      Utf8,    -- scalar value for primitive nodes; NULL for objects and arrays
    id        Int64,   -- depth-first row id (root = 0)
    parent    Int64,   -- id of the parent node; NULL at the root
    fullkey   Utf8,    -- absolute JSON-Path of this node, e.g. $.user.scores[0]
    path      Utf8     -- JSON-Path of the parent node; NULL at the root
)
```

**Options (named arguments, UDTF form only):**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `max_depth` | UInt | `64` | Maximum recursion depth. |
| `max_rows` | UInt | `1000000` | Per-document row cap. |
| `max_bytes` | UInt | `8388608` | Input size limit (bytes). |

**UDTF example:**

```sql
SELECT id, parent, fullkey, type, atom
FROM json_tree('{"user": {"name": "Alice", "scores": [95, 87]}}');
```

| id | parent | fullkey | type | atom |
| --- | --- | --- | --- | --- |
| `0` |  | `$` | `object` |  |
| `1` | `0` | `$.user` | `object` |  |
| `2` | `1` | `$.user.name` | `string` | `Alice` |
| `3` | `1` | `$.user.scores` | `array` |  |
| `4` | `3` | `$.user.scores[0]` | `integer` | `95` |
| `5` | `3` | `$.user.scores[1]` | `integer` | `87` |

**Scalar UDF example (per-row with `UNNEST`):**

```sql
SELECT rows.fullkey, rows.atom
FROM (SELECT UNNEST(json_tree(body)) AS rows FROM documents);
```

The scalar form takes only the JSON argument and always runs with default caps; the named options above are only accepted in the UDTF (`FROM` clause) form.

## Federation and Pushdown

These functions come from a Spice library, not from the source database, so a remote engine has no
equivalent to call. A connector that installs the Spice function deny-list will not federate a plan
containing one: a predicate such as `WHERE json_get_int(doc, 'id') = 1` disqualifies the node, the
column is streamed to Spice, and the filter runs there. That is correct, but it costs a full remote
scan. Whether — and which — JSON functions push down is therefore connector-specific.

**BigQuery** is the exception. A dataset read through the [ADBC data
connector](../../components/data-connectors/adbc) with `adbc_driver: bigquery` uses a BigQuery
dialect that rewrites these functions into native BigQuery SQL, so they push down to the source:

| Function                                    | Pushed down to BigQuery |
| ------------------------------------------- | ----------------------- |
| [`json_get_str`](#json_get_str)             | Yes                     |
| [`json_get_int`](#json_get_int)             | Yes                     |
| [`json_get_float`](#json_get_float)         | Yes                     |
| [`json_get_bool`](#json_get_bool)           | Yes                     |
| [`json_length`](#json_length)               | Yes (alias `json_len`)  |
| [`json_object_keys`](#json_object_keys)     | Yes (alias `json_keys`) |
| [`json_get`](#json_get)                     | No                      |
| [`json_get_json`](#json_get_json)           | No                      |
| [`json_get_array`](#json_get_array)         | No                      |
| [`json_as_text`](#json_as_text)             | No                      |
| [`json_contains`](#json_contains)           | No                      |

The five that stay local do so because BigQuery cannot reproduce their results, not because the
translation is unwritten:

- `json_get_json` and `json_as_text` return the matched node's own bytes, spacing and number
  spelling intact, where BigQuery's `JSON_QUERY` re-renders it — a document holding `{"b": -1}`
  comes back as `{"b":-1}`.
- `json_contains` counts a JSON `null` as present, and BigQuery returns SQL NULL for such a node
  exactly as it does for a missing key, so the two cannot be told apart.
- `json_get` and `json_get_array` return the library's JSON union type, which has no SQL type to
  unparse into.

The [operators](#json-operators) `->`, `->>` and `?` are spellings of `json_get`, `json_as_text`
and `json_contains`, so they are not pushed down either.

Pushdown also requires every path argument to be a **literal**, because BigQuery's JSON path must
be a constant. `json_get_int(doc, 'id')` pushes down; `json_get_int(doc, key_column)` is legal SQL
in Spice but is evaluated locally.

## Further Reading

- [datafusion-functions-json](https://github.com/datafusion-contrib/datafusion-functions-json) - The underlying JSON manipulation library
- [Spice JSON Cookbook](https://github.com/spiceai/cookbook/tree/trunk/json_strings) - Spice Cookbook demonstrating how to work with JSON strings in Spice
