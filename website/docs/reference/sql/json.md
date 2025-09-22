---
title: 'JSON Functions and Operators'
sidebar_label: 'JSON'
description: 'Reference for JSON functions and operators in Spice SQL'
sidebar_position: 7
---

JSON support in Spice is based on [datafusion-functions-json](https://github.com/datafusion-contrib/datafusion-functions-json), which provides functions and operators to extract, query, and manipulate JSON data stored as strings. Advanced features for JSON creation, modification, or complex path expressions are not supported.

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
- [JSON Operators](#json-operators)
  - [`->`](#--op_json_get)
    - [Arguments](#arguments-10)
    - [Example](#example-10)
  - [`->>`](#--op_json_as_text)
    - [Arguments](#arguments-11)
    - [Example](#example-11)
  - [`?`](#-op_json_contains)
    - [Arguments](#arguments-12)
    - [Example](#example-12)
- [Usage Examples](#usage-examples)
  - [Nested Object Access](#nested-object-access)
  - [Array Access](#array-access)
  - [Conditional JSON Queries](#conditional-json-queries)
  - [Using JSON Functions in Views](#using-json-functions-in-views)
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

## Further Reading

- [datafusion-functions-json](https://github.com/datafusion-contrib/datafusion-functions-json) - The underlying JSON manipulation library
- [Spice JSON Cookbook](https://github.com/spiceai/cookbook/tree/trunk/json_strings) - Spice Cookbook demonstrating how to work with JSON strings in Spice
