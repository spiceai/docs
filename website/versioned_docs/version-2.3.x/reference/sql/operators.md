---
title: 'Operators'
sidebar_label: 'Operators'
sidebar_position: 3
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.
:::

## Numerical Operators

- [+ (plus)](#op_plus)
- [- (minus)](#op_minus)
- [\* (multiply)](#op_multiply)
- [/ (divide)](#op_divide)
- [% (modulo)](#op_modulo)

### `+` {#op_plus}

Addition

```sql
> SELECT 1 + 2;
+---------------------+
| Int64(1) + Int64(2) |
+---------------------+
| 3                   |
+---------------------+
```

### `-` {#op_minus}

Subtraction

```sql
> SELECT 4 - 3;
+---------------------+
| Int64(4) - Int64(3) |
+---------------------+
| 1                   |
+---------------------+
```

### `*` {#op_multiply}

Multiplication

```sql
> SELECT 2 * 3;
+---------------------+
| Int64(2) * Int64(3) |
+---------------------+
| 6                   |
+---------------------+
```

### `/` {#op_divide}

Division (integer division truncates toward zero)

```sql
> SELECT 8 / 4;
+---------------------+
| Int64(8) / Int64(4) |
+---------------------+
| 2                   |
+---------------------+
```

### `%` {#op_modulo}

Modulo (remainder)

```sql
> SELECT 7 % 3;
+---------------------+
| Int64(7) % Int64(3) |
+---------------------+
| 1                   |
+---------------------+
```

## Comparison Operators

- [= (equal)](#op_eq)
- [!= (not equal)](#op_neq)
- [< (less than)](#op_lt)
- [&lt;= (less than or equal to)](#op_le)
- [> (greater than)](#op_gt)
- [&gt;= (greater than or equal to)](#op_ge)
- [&lt;=&gt; (three-way comparison, alias for IS NOT DISTINCT FROM)](#op_spaceship)
- [IS DISTINCT FROM](#is-distinct-from)
- [IS NOT DISTINCT FROM](#is-not-distinct-from)
- [~ (regex match)](#op_re_match)
- [~\* (regex case-insensitive match)](#op_re_match_i)
- [!~ (not regex match)](#op_re_not_match)
- [!~\* (not regex case-insensitive match)](#op_re_not_match_i)

### `=` {#op_eq}

Equal

```sql
> SELECT 1 = 1;
+---------------------+
| Int64(1) = Int64(1) |
+---------------------+
| true                |
+---------------------+
```

### `!=` {#op_neq}

Not Equal

```sql
> SELECT 1 != 2;
+----------------------+
| Int64(1) != Int64(2) |
+----------------------+
| true                 |
+----------------------+
```

### `<` {#op_lt}

Less Than

```sql
> SELECT 3 < 4;
+---------------------+
| Int64(3) < Int64(4) |
+---------------------+
| true                |
+---------------------+
```

### `<=` {#op_le}

Less Than or Equal To

```sql
> SELECT 3 <= 3;
+----------------------+
| Int64(3) <= Int64(3) |
+----------------------+
| true                 |
+----------------------+
```

### `>` {#op_gt}

Greater Than

```sql
> SELECT 6 > 5;
+---------------------+
| Int64(6) > Int64(5) |
+---------------------+
| true                |
+---------------------+
```

### `>=` {#op_ge}

Greater Than or Equal To

```sql
> SELECT 5 >= 5;
+----------------------+
| Int64(5) >= Int64(5) |
+----------------------+
| true                 |
+----------------------+
```

### `<=>` {#op_spaceship}

Three-way comparison operator. A NULL-safe operator that returns true if both operands are equal or both are NULL, false otherwise.

```sql
> SELECT NULL <=> NULL;
+--------------------------------+
| NULL IS NOT DISTINCT FROM NULL |
+--------------------------------+
| true                           |
+--------------------------------+
```

```sql
> SELECT 1 <=> NULL;
+------------------------------------+
| Int64(1) IS NOT DISTINCT FROM NULL |
+------------------------------------+
| false                              |
+------------------------------------+
```

```sql
> SELECT 1 <=> 2;
+----------------------------------------+
| Int64(1) IS NOT DISTINCT FROM Int64(2) |
+----------------------------------------+
| false                                  |
+----------------------------------------+
```

```sql
> SELECT 1 <=> 1;
+----------------------------------------+
| Int64(1) IS NOT DISTINCT FROM Int64(1) |
+----------------------------------------+
| true                                   |
+----------------------------------------+
```

### `IS DISTINCT FROM`

Guarantees the result of a comparison is `true` or `false` and not an empty set

```sql
> SELECT 0 IS DISTINCT FROM NULL;
+--------------------------------+
| Int64(0) IS DISTINCT FROM NULL |
+--------------------------------+
| true                           |
+--------------------------------+
```

### `IS NOT DISTINCT FROM`

The negation of `IS DISTINCT FROM`

```sql
> SELECT NULL IS NOT DISTINCT FROM NULL;
+--------------------------------+
| NULL IS NOT DISTINCT FROM NULL |
+--------------------------------+
| true                           |
+--------------------------------+
```

### `~` {#op_re_match}

Regex Match

```sql
> SELECT 'foo' ~ '^foo(-cli)*';
+-----------------------------------+
| Utf8("foo") ~ Utf8("^foo(-cli)*") |
+-----------------------------------+
| true                              |
+-----------------------------------+
```

### `~*` {#op_re_match_i}

Regex Case-Insensitive Match

```sql
> SELECT 'foo' ~* '^foo(-cli)*';
+------------------------------------+
| Utf8("foo") ~* Utf8("^foo(-cli)*") |
+------------------------------------+
| true                               |
+------------------------------------+
```

### `!~` {#op_re_not_match}

Not Regex Match

```sql
> SELECT 'foo' !~ '^foo(-cli)*';
+------------------------------------+
| Utf8("foo") !~ Utf8("^foo(-cli)*") |
+------------------------------------+
| false                              |
+------------------------------------+
```

### `!~*` {#op_re_not_match_i}

Not Regex Case-Insensitive Match

```sql
> SELECT 'foo' !~* '^FOO(-cli)+';
+-------------------------------------+
| Utf8("foo") !~* Utf8("^FOO(-cli)+") |
+-------------------------------------+
| true                                |
+-------------------------------------+
```

### `~~`

Like Match

```sql
SELECT 'foobar' ~~ 'f_o%r';
+---------------------------------+
| Utf8("foobar") ~~ Utf8("f_o%r") |
+---------------------------------+
| true                            |
+---------------------------------+
```

### `~~*`

Case-Insensitive Like Match

```sql
SELECT 'foobar' ~~* 'F_o%r';
+----------------------------------+
| Utf8("foobar") ~~* Utf8("F_o%r") |
+----------------------------------+
| true                             |
+----------------------------------+
```

### `!~~`

Not Like Match

```sql
SELECT 'foobar' !~~ 'F_o%r';
+----------------------------------+
| Utf8("foobar") !~~ Utf8("F_o%r") |
+----------------------------------+
| true                             |
+----------------------------------+
```

### `!~~*`

Not Case-Insensitive Like Match

```sql
SELECT 'foobar' !~~* 'F_o%Br';
+------------------------------------+
| Utf8("foobar") !~~* Utf8("F_o%Br") |
+------------------------------------+
| true                               |
+------------------------------------+
```

## Logical Operators

- [AND](#and)
- [OR](#or)

### `AND`

Logical And

```sql
> SELECT true AND true;
+---------------------------------+
| Boolean(true) AND Boolean(true) |
+---------------------------------+
| true                            |
+---------------------------------+
```

### `OR`

Logical Or

```sql
> SELECT false OR true;
+---------------------------------+
| Boolean(false) OR Boolean(true) |
+---------------------------------+
| true                            |
+---------------------------------+
```

## Bitwise Operators

- [& (bitwise and)](#op_bit_and)
- [| (bitwise or)](#op_bit_or)
- [# (bitwise xor)](#op_bit_xor)
- [&gt;&gt; (bitwise shift right)](#op_shift_r)
- [&lt;&lt; (bitwise shift left)](#op_shift_l)

### `&` {#op_bit_and}

Bitwise And

```sql
> SELECT 5 & 3;
+---------------------+
| Int64(5) & Int64(3) |
+---------------------+
| 1                   |
+---------------------+
```

### `|` {#op_bit_or}

Bitwise Or

```sql
> SELECT 5 | 3;
+---------------------+
| Int64(5) | Int64(3) |
+---------------------+
| 7                   |
+---------------------+
```

### `#` {#op_bit_xor}

Bitwise Xor (interchangeable with `^`)

```sql
> SELECT 5 # 3;
+---------------------+
| Int64(5) # Int64(3) |
+---------------------+
| 6                   |
+---------------------+
```

### `>>` {#op_shift_r}

Bitwise Shift Right

```sql
> SELECT 5 >> 3;
+----------------------+
| Int64(5) >> Int64(3) |
+----------------------+
| 0                    |
+----------------------+
```

### `<<` {#op_shift_l}

Bitwise Shift Left

```sql
> SELECT 5 << 3;
+----------------------+
| Int64(5) << Int64(3) |
+----------------------+
| 40                   |
+----------------------+
```

## Type Casting Operators

- [`CAST(expr AS type)`](#op_cast) – Explicit type conversion
- [`::` (PostgreSQL-style cast)](#op_double_colon) – Shorthand type conversion

### `CAST(expr AS type)` {#op_cast}

Converts an expression to the specified data type.

```sql
> SELECT CAST('123' AS INT);
+------------------------+
| CAST(Utf8("123") AS Int32) |
+------------------------+
| 123                    |
+------------------------+

> SELECT CAST(3.14159 AS INT);
+--------------------------+
| CAST(Float64(3.14159) AS Int32) |
+--------------------------+
| 3                        |
+--------------------------+

> SELECT CAST('2024-01-15' AS DATE);
+----------------------------+
| CAST(Utf8("2024-01-15") AS Date32) |
+----------------------------+
| 2024-01-15                 |
+----------------------------+
```

### `::` (PostgreSQL-style cast) {#op_double_colon}

Shorthand syntax for type conversion, equivalent to `CAST`.

```sql
> SELECT '123'::INT;
+-----------------------+
| Utf8("123") AS Int32  |
+-----------------------+
| 123                   |
+-----------------------+

> SELECT '2024-01-15'::DATE;
+---------------------------+
| Utf8("2024-01-15") AS Date32 |
+---------------------------+
| 2024-01-15                |
+---------------------------+

> SELECT 100::TEXT;
+-------------------+
| Int64(100) AS Utf8 |
+-------------------+
| 100               |
+-------------------+
```

**Supported Types:**

| Type                          | Description            |
| ----------------------------- | ---------------------- |
| `INT` / `INTEGER` / `INT4`    | 32-bit signed integer  |
| `BIGINT` / `INT8`             | 64-bit signed integer  |
| `SMALLINT` / `INT2`           | 16-bit signed integer  |
| `FLOAT` / `REAL` / `FLOAT4`   | 32-bit floating point  |
| `DOUBLE` / `FLOAT8`           | 64-bit floating point  |
| `TEXT` / `VARCHAR` / `STRING` | Variable-length string |
| `BOOLEAN` / `BOOL`            | True/false value       |
| `DATE`                        | Calendar date          |
| `TIMESTAMP`                   | Date and time          |
| `INTERVAL`                    | Time duration          |

## Other Operators

- [|| (string concatenation)](#op_str_cat)
- [\`@>\` (array contains)](#op_arr_contains)
- [`<@` (array is contained by)](#op_arr_contained_by)

### `||` {#op_str_cat}

String or array concatenation. When both operands are strings, concatenates them. When both are arrays (lists), invokes [`array_concat`](./scalar_functions#array_concat); when one side is a list and the other is a scalar of the element type, invokes [`array_append`](./scalar_functions#array_append) or [`array_prepend`](./scalar_functions#array_prepend).

```sql
> SELECT 'Hello, ' || 'Spice!';
+-----------------------------------+
| Utf8("Hello, ") || Utf8("Spice!") |
+-----------------------------------+
| Hello, Spice!                     |
+-----------------------------------+

> SELECT [1, 2] || [3, 4];
+-------------------------+
| List([1,2]) || List([3,4]) |
+-------------------------+
| [1, 2, 3, 4]            |
+-------------------------+

> SELECT [1, 2] || 3;
+----------------------+
| List([1,2]) || Int64(3) |
+----------------------+
| [1, 2, 3]            |
+----------------------+
```

### `@>` {#op_arr_contains}

Array contains. Returns `true` if every element of the right array is present in the left. Equivalent to [`array_has_all`](./scalar_functions#array_has_all). Only supported with list/array arguments.

```sql
> SELECT make_array(1,2,3) @> make_array(1,3);
+-------------------------------------------------------------------------+
| make_array(Int64(1),Int64(2),Int64(3)) @> make_array(Int64(1),Int64(3)) |
+-------------------------------------------------------------------------+
| true                                                                    |
+-------------------------------------------------------------------------+
```

### `<@` {#op_arr_contained_by}

Array is contained by. Returns `true` if every element of the left array is present in the right. Equivalent to `array_has_all(right, left)`. Only supported with list/array arguments.

```sql
> SELECT make_array(1,3) <@ make_array(1,2,3);
+-------------------------------------------------------------------------+
| make_array(Int64(1),Int64(3)) <@ make_array(Int64(1),Int64(2),Int64(3)) |
+-------------------------------------------------------------------------+
| true                                                                    |
+-------------------------------------------------------------------------+
```

## Literals

Use single quotes for literal string values.

```sql
SELECT 'foo';
```

### Escaping

SQL literals do not support C-style escape sequences such as `\n` for newline by default. All characters in a `'` string are treated literally.

To escape `'` in SQL literals, use `''`:

```sql
> SELECT 'it''s escaped';
+----------------------+
| Utf8("it's escaped") |
+----------------------+
| it's escaped         |
+----------------------+
```

Strings such as `'foo\nbar'` contain a literal backslash followed by `n`, not a newline:

```sql
> SELECT 'foo\nbar';
+------------------+
| Utf8("foo\nbar") |
+------------------+
| foo\nbar         |
+------------------+
```

### E-String Escape Sequences

To include escaped characters such as newline or tab, use `E`-prefixed strings:

```sql
> SELECT E'foo\nbar';
+-----------------+
| Utf8("foo
bar") |
+-----------------+
| foo
bar         |
+-----------------+
```

Supported escape sequences:

| Escape | Character       |
| ------ | --------------- |
| `\n`   | Newline         |
| `\t`   | Tab             |
| `\r`   | Carriage return |
| `\\`   | Backslash       |
| `\'`   | Single quote    |
