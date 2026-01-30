---
title: 'Scalar Functions'
sidebar_label: 'Scalar Functions'
pagination_prev: 'reference/sql/ai'
sidebar_position: 6
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects. Note, when using a data accelerator like DuckDB, function support is specific to each acceleration engine, and not all functions are supported by all acceleration engines.
:::

Scalar functions help transform, compute, and manipulate data at the row level. These functions are evaluated for each row in a query result and return a single value per invocation. Spice.ai supports a broad set of scalar functions, including math, string, conditional, date/time, array, struct, map, regular expression, and hashing functions. The function set closely follows the PostgreSQL dialect.

## Function Categories

- [Math Functions](#math-functions)
- [Conditional Functions](#conditional-functions)
- [String Functions](#string-functions)
- [Binary String Functions](#binary-string-functions)
- [Regular Expression Functions](#regular-expression-functions)
- [Time and Date Functions](#time-and-date-functions)
- [Array Functions](#array-functions)
- [Struct Functions](#struct-functions)
- [Map Functions](#map-functions)
- [Hashing Functions](#hashing-functions)
- [Union Functions](#union-functions)
- [Other Functions](#other-functions)

---

## Math Functions

Math functions in Spice.ai SQL help perform numeric calculations, transformations, and analysis. These functions operate on numeric expressions, which can be constants, columns, or results of other functions and operators. The following math functions are supported:

### `abs`

Returns the absolute value of a numeric expression. If the input is negative, the result is its positive equivalent; if the input is positive or zero, the result is unchanged.

```sql
abs(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value to evaluate. Accepts constants, columns, or expressions.

#### Example

```sql
> select abs(-5);
+-------------+
| abs(Int64(-5)) |
+-------------+
| 5           |
+-------------+
```

### `acos`

Returns the arc cosine (inverse cosine) of a numeric expression. The input must be in the range [-1, 1]. The result is in radians.

```sql
acos(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value between -1 and 1.

### `acosh`

Returns the inverse hyperbolic cosine of a numeric expression. The input must be greater than or equal to 1.

```sql
acosh(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value greater than or equal to 1.

### `asin`

Returns the arc sine (inverse sine) of a numeric expression. The input must be in the range [-1, 1]. The result is in radians.

```sql
asin(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value between -1 and 1.

### `asinh`

Returns the inverse hyperbolic sine of a numeric expression.

```sql
asinh(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `atan`

Returns the arc tangent (inverse tangent) of a numeric expression. The result is in radians.

```sql
atan(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `atan2`

Returns the arc tangent of the quotient of its arguments, that is, atan(expression_y / expression_x). The result is in radians and takes into account the signs of both arguments to determine the correct quadrant.

```sql
atan2(expression_y, expression_x)
```

#### Arguments

- **expression_y**: Numerator value.
- **expression_x**: Denominator value.

### `atanh`

Returns the inverse hyperbolic tangent of a numeric expression. The input must be in the range (-1, 1).

```sql
atanh(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value between -1 and 1 (exclusive).

### `cbrt`

Returns the cube root of a numeric expression.

```sql
cbrt(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `ceil`

Returns the smallest integer greater than or equal to the input value.

```sql
ceil(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `cos`

Returns the cosine of a numeric expression, where the input is in radians.

```sql
cos(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value in radians.

### `cosh`

Returns the hyperbolic cosine of a numeric expression.

```sql
cosh(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `cot`

Returns the cotangent of a numeric expression, where the input is in radians.

```sql
cot(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value in radians.

### `degrees`

Converts radians to degrees.

```sql
degrees(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value in radians.

### `exp`

Returns the value of e (Euler's number) raised to the power of the input value.

```sql
exp(numeric_expression)
```

#### Arguments

- **numeric_expression**: Exponent value.

### `factorial`

Returns the factorial of a non-negative integer. For values less than 2, returns 1.

```sql
factorial(numeric_expression)
```

#### Arguments

- **numeric_expression**: Non-negative integer value.

### `floor`

Returns the largest integer less than or equal to the input value.

```sql
floor(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `gcd`

Returns the greatest common divisor of two integer expressions. If both inputs are zero, returns 0.

```sql
gcd(expression_x, expression_y)
```

#### Arguments

- **expression_x**: First integer value.
- **expression_y**: Second integer value.

### `isnan`

Returns true if the input is NaN (not a number), otherwise returns false.

```sql
isnan(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `iszero`

Returns true if the input is +0.0 or -0.0, otherwise returns false.

```sql
iszero(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `lcm`

Returns the least common multiple of two integer expressions. If either input is zero, returns 0.

```sql
lcm(expression_x, expression_y)
```

#### Arguments

- **expression_x**: First integer value.
- **expression_y**: Second integer value.

### `mod`

Returns the remainder after dividing the first argument by the second, matching the Spark SQL `%`/`mod` semantics for signed values.

```sql
mod(dividend, divisor)
```

#### Arguments

- **dividend**: Numeric expression to divide.
- **divisor**: Numeric expression that cannot be zero.

#### Example

```sql
> select mod(-10, 3);
+----------------------------+
| mod(Int64(-10),Int64(3))   |
+----------------------------+
| -1                         |
+----------------------------+
```

Reference: [Spark SQL `mod`](https://spark.apache.org/docs/latest/api/sql/index.html#mod).

### `pmod`

Returns a positive remainder for integer or floating-point division. When the standard remainder is negative, the divisor is added to produce a non-negative result, mirroring Spark SQL behavior.

```sql
pmod(dividend, divisor)
```

#### Arguments

- **dividend**: Numeric expression to divide.
- **divisor**: Numeric expression that cannot be zero.

#### Example

```sql
> select pmod(-10, 3);
+-----------------------------+
| pmod(Int64(-10),Int64(3))   |
+-----------------------------+
| 2                           |
+-----------------------------+
```

Reference: [Spark SQL `pmod`](https://spark.apache.org/docs/latest/api/sql/index.html#pmod).

### `ln`

Returns the natural logarithm (base e) of a numeric expression.

```sql
ln(numeric_expression)
```

#### Arguments

- **numeric_expression**: Positive numeric value.

### `log`

Returns the logarithm of a numeric expression. If a base is provided, returns the logarithm to that base; otherwise, returns the base-10 logarithm.

```sql
log(base, numeric_expression)
log(numeric_expression)
```

#### Arguments

- **base**: Base of the logarithm (optional).
- **numeric_expression**: Positive numeric value.

### `log10`

Returns the base-10 logarithm of a numeric expression.

```sql
log10(numeric_expression)
```

#### Arguments

- **numeric_expression**: Positive numeric value.

### `log2`

Returns the base-2 logarithm of a numeric expression.

```sql
log2(numeric_expression)
```

#### Arguments

- **numeric_expression**: Positive numeric value.

### `nanvl`

Returns the first argument if it is not NaN; otherwise, returns the second argument.

```sql
nanvl(expression_x, expression_y)
```

#### Arguments

- **expression_x**: Value to return if not NaN.
- **expression_y**: Value to return if the first argument is NaN.

### `pi`

Returns an approximate value of π (pi).

```sql
pi()
```

### `pow` and `power`

Returns the value of the first argument raised to the power of the second argument. `pow` is an alias for `power`.

```sql
power(base, exponent)
pow(base, exponent)
```

#### Arguments

- **base**: Numeric value to raise.
- **exponent**: Power to raise the base to.

### `radians`

Converts degrees to radians.

```sql
radians(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value in degrees.

### `random`

Returns a random floating-point value in the range [0, 1). The random seed is unique for each row.

```sql
random()
```

### `round`

Rounds a numeric expression to the nearest integer or to a specified number of decimal places.

```sql
round(numeric_expression[, decimal_places])
```

#### Arguments

- **numeric_expression**: Value to round.
- **decimal_places**: Optional. Number of decimal places to round to. Defaults to 0.

### `rint`

Rounds a double-precision value to the nearest integer using IEEE-754 "round to nearest, ties to even" rules and returns the rounded value as a floating-point number, matching Spark SQL semantics.

```sql
rint(numeric_expression)
```

#### Arguments

- **numeric_expression**: Floating-point expression to round. Integers are implicitly cast to double.

#### Example

```sql
> select rint(12.5);
+-------------------------+
| rint(Float64(12.5))     |
+-------------------------+
| 12.0                    |
+-------------------------+
```

Reference: [Spark SQL `rint`](https://spark.apache.org/docs/latest/api/sql/index.html#rint).

### `signum`

Returns the sign of a numeric expression. Returns -1 for negative numbers, 1 for zero and positive numbers.

```sql
signum(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `sin`

Returns the sine of a numeric expression, where the input is in radians.

```sql
sin(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value in radians.

### `sinh`

Returns the hyperbolic sine of a numeric expression.

```sql
sinh(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `sqrt`

Returns the square root of a numeric expression.

```sql
sqrt(numeric_expression)
```

#### Arguments

- **numeric_expression**: Non-negative numeric value.

### `tan`

Returns the tangent of a numeric expression, where the input is in radians.

```sql
tan(numeric_expression)
```

#### Arguments

- **numeric_expression**: Value in radians.

### `tanh`

Returns the hyperbolic tangent of a numeric expression.

```sql
tanh(numeric_expression)
```

#### Arguments

- **numeric_expression**: Numeric value.

### `trunc`

Truncates a numeric expression to a whole number or to a specified number of decimal places. If `decimal_places` is positive, truncates digits to the right of the decimal point; if negative, truncates digits to the left.

```sql
trunc(numeric_expression[, decimal_places])
```

#### Arguments

- **numeric_expression**: Value to truncate.
- **decimal_places**: Optional. Number of decimal places to truncate to. Defaults to 0.

### `width_bucket`

Assigns a value to an equiwidth histogram bucket. Returns 0 when the value is below `min_value`, `num_bucket + 1` when it is above `max_value`, and otherwise the 1-based bucket index, mirroring Spark SQL behavior.

```sql
width_bucket(value, min_value, max_value, num_bucket)
```

#### Arguments

- **value**: Numeric or interval expression to bin.
- **min_value**: Lower bound of the histogram range.
- **max_value**: Upper bound of the histogram range.
- **num_bucket**: Positive integer specifying the number of buckets.

#### Example

```sql
> select width_bucket(5.3, 0.2, 10.6, 5);
+--------------------------------------------------+
| width_bucket(Float64(5.3),Float64(0.2),Float64(10.6),Int64(5)) |
+--------------------------------------------------+
| 3                                                |
+--------------------------------------------------+
```

Reference: [Spark SQL `width_bucket`](https://spark.apache.org/docs/latest/api/sql/index.html#width_bucket).

---

## Conditional Functions

Conditional functions help handle null values, select among alternatives, and compare multiple expressions. Functions such as `coalesce`, `greatest`, `least`, and `nullif` are supported. These are useful for data cleaning and conditional logic in queries.

### `if`

Evaluates a boolean condition and returns one of two expressions, matching the Spark SQL `if` function semantics.

```sql
if(condition, true_value, false_value)
```

#### Arguments

- **condition**: Boolean expression determining which branch to take.
- **true_value**: Expression to return when the condition evaluates to true.
- **false_value**: Expression to return when the condition evaluates to false or NULL.

#### Example

```sql
> select if(temperature > 70, 'warm', 'cool') as label from (values (65), (72)) as t(temperature);
+------------+
| label      |
+------------+
| cool       |
| warm       |
+------------+
```

Reference: [Spark SQL `if`](https://spark.apache.org/docs/latest/api/sql/index.html#if).

## String Functions

String functions in Spice.ai SQL help manipulate, analyze, and transform text data. These functions operate on string expressions, which can be constants, columns, or results of other functions. The implementation closely follows the PostgreSQL dialect. The following string functions are supported:

### `ascii`

Returns the Unicode code point of the first character in a string. If the string is empty, returns 0.

```sql
ascii(str)
```

#### Arguments

- **str**: String expression. Accepts constants, columns, or expressions.

#### Example

```sql
> select ascii('abc');
+--------------------+
| ascii(Utf8("abc")) |
+--------------------+
| 97                 |
+--------------------+
> select ascii('🚀');
+-------------------+
| ascii(Utf8("🚀")) |
+-------------------+
| 128640            |
+-------------------+
```

Related function: [`chr`](#chr)

### `bit_length`

Returns the number of bits in the string. Each character is counted according to its byte representation (8 bits per byte).

```sql
bit_length(str)
```

#### Arguments

- **str**: String expression.

#### Example

```sql
> select bit_length('datafusion');
+--------------------------------+
| bit_length(Utf8("datafusion")) |
+--------------------------------+
| 80                             |
+--------------------------------+
```

Related functions: [`length`](#length), [`octet_length`](#octet_length)

### `btrim`

Removes the longest string containing only characters in `trim_str` from the start and end of `str`. If `trim_str` is omitted, whitespace is removed.

```sql
btrim(str[, trim_str])
```

#### Arguments

- **str**: String expression.
- **trim_str**: Optional string of characters to trim. Defaults to whitespace.

#### Example

```sql
> select btrim('__datafusion____', '_');
+-------------------------------------------+
| btrim(Utf8("__datafusion____"),Utf8("_")) |
+-------------------------------------------+
| datafusion                                |
+-------------------------------------------+
```

Alternative syntax: `trim(BOTH trim_str FROM str)` or `trim(trim_str FROM str)`

Aliases: `trim`

Related functions: [`ltrim`](#ltrim), [`rtrim`](#rtrim)

### `char_length`

Alias of [`character_length`](#character_length).

### `character_length`

Returns the number of characters in a string, not bytes. Handles Unicode correctly.

```sql
character_length(str)
```

#### Arguments

- **str**: String expression.

#### Example

```sql
> select character_length('Ångström');
+------------------------------------+
| character_length(Utf8("Ångström")) |
+------------------------------------+
| 8                                  |
+------------------------------------+
```

Aliases: `length`, `char_length`

Related functions: [`bit_length`](#bit_length), [`octet_length`](#octet_length)

### `chr`

Returns the character with the specified Unicode code point.

```sql
chr(expression)
```

#### Arguments

- **expression**: Integer code point.

#### Example

```sql
> select chr(128640);
+--------------------+
| chr(Int64(128640)) |
+--------------------+
| 🚀                 |
+--------------------+
```

Related function: [`ascii`](#ascii)

### `concat`

Concatenates two or more strings into a single string.

```sql
concat(str[, ..., str_n])
```

#### Arguments

- **str**: String expression.
- **str_n**: Additional string expressions.

#### Example

```sql
> select concat('data', 'f', 'us', 'ion');
+-------------------------------------------------------+
| concat(Utf8("data"),Utf8("f"),Utf8("us"),Utf8("ion")) |
+-------------------------------------------------------+
| datafusion                                            |
+-------------------------------------------------------+
```

Related function: [`concat_ws`](#concat_ws)

### `concat_ws`

Concatenates strings using a separator between each value.

```sql
concat_ws(separator, str[, ..., str_n])
```

#### Arguments

- **separator**: String separator.
- **str**: String expression.
- **str_n**: Additional string expressions.

#### Example

```sql
> select concat_ws('_', 'data', 'fusion');
+--------------------------------------------------+
| concat_ws(Utf8("_"),Utf8("data"),Utf8("fusion")) |
+--------------------------------------------------+
| data_fusion                                      |
+--------------------------------------------------+
```

Related function: [`concat`](#concat)

### `contains`

Returns true if `search_str` is found within `str`. The search is case-sensitive.

```sql
contains(str, search_str)
```

#### Arguments

- **str**: String expression.
- **search_str**: Substring to search for.

#### Example

```sql
> select contains('the quick brown fox', 'row');
+---------------------------------------------------+
| contains(Utf8("the quick brown fox"),Utf8("row")) |
+---------------------------------------------------+
| true                                              |
+---------------------------------------------------+
```

### `like`

Performs SQL pattern matching using `%` to match zero or more characters and `_` to match a single character. The optional SQL `ESCAPE` clause can be used to treat a wildcard literally, matching Spark SQL behavior.

```sql
like(str, pattern)
```

#### Arguments

- **str**: String expression to compare.
- **pattern**: Pattern containing literal text plus `%` and `_` wildcards.

#### Example

```sql
> select like('spice.ai', 'spice%');
+----------------------------------+
| like(Utf8("spice.ai"),Utf8("spice%")) |
+----------------------------------+
| true                             |
+----------------------------------+
```

Reference: [Spark SQL `like`](https://spark.apache.org/docs/latest/api/sql/index.html#like).

### `ilike`

Case-insensitive variant of [`like`](#like) that treats ASCII characters in `str` and `pattern` without regard to case. The optional SQL `ESCAPE` clause may be used to treat `%` or `_` literally.

```sql
ilike(str, pattern)
```

#### Arguments

- **str**: String expression to compare.
- **pattern**: Case-insensitive pattern containing literal text plus `%` and `_` wildcards.

#### Example

```sql
> select ilike('Spice.AI', 'spice%');
+-----------------------------------+
| ilike(Utf8("Spice.AI"),Utf8("spice%")) |
+-----------------------------------+
| true                              |
+-----------------------------------+
```

Reference: [Spark SQL `ilike`](https://spark.apache.org/docs/latest/api/sql/index.html#ilike).

### `ends_with`

Returns true if `str` ends with the substring `substr`.

```sql
ends_with(str, substr)
```

#### Arguments

- **str**: String expression.
- **substr**: Substring to test for.

#### Example

```sql
> select ends_with('datafusion', 'soin');
+--------------------------------------------+
| ends_with(Utf8("datafusion"),Utf8("soin")) |
+--------------------------------------------+
| false                                      |
+--------------------------------------------+
> select ends_with('datafusion', 'sion');
+--------------------------------------------+
| ends_with(Utf8("datafusion"),Utf8("sion")) |
+--------------------------------------------+
| true                                       |
+--------------------------------------------+
```

### `find_in_set`

Returns the position (1-based) of `str` in the comma-separated list `strlist`. Returns 0 if not found.

```sql
find_in_set(str, strlist)
```

#### Arguments

- **str**: String to find.
- **strlist**: Comma-separated list of substrings.

#### Example

```sql
> select find_in_set('b', 'a,b,c,d');
+----------------------------------------+
| find_in_set(Utf8("b"),Utf8("a,b,c,d")) |
+----------------------------------------+
| 2                                      |
+----------------------------------------+
```

### `initcap`

Capitalizes the first character of each word in the string. Words are delimited by non-alphanumeric characters.

```sql
initcap(str)
```

#### Arguments

- **str**: String expression.

#### Example

```sql
> select initcap('apache datafusion');
+------------------------------------+
| initcap(Utf8("apache datafusion")) |
+------------------------------------+
| Apache Datafusion                  |
+------------------------------------+
```

Related functions: [`lower`](#lower), [`upper`](#upper)

### `instr`

Alias of [`strpos`](#strpos).

### `left`

Returns the first `n` characters from the left side of the string.

```sql
left(str, n)
```

#### Arguments

- **str**: String expression.
- **n**: Number of characters to return.

#### Example

```sql
> select left('datafusion', 4);
+-----------------------------------+
| left(Utf8("datafusion"),Int64(4)) |
+-----------------------------------+
| data                              |
+-----------------------------------+
```

Related function: [`right`](#right)

### `length`

Alias of [`character_length`](#character_length).

### `levenshtein`

Returns the [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance) between two strings.

```sql
levenshtein(str1, str2)
```

#### Arguments

- **str1**: First string.
- **str2**: Second string.

#### Example

```sql
> select levenshtein('kitten', 'sitting');
+---------------------------------------------+
| levenshtein(Utf8("kitten"),Utf8("sitting")) |
+---------------------------------------------+
| 3                                           |
+---------------------------------------------+
```

### `lower`

Converts all characters in the string to lower case.

```sql
lower(str)
```

#### Arguments

- **str**: String expression.

#### Example

```sql
> select lower('Ångström');
+-------------------------+
| lower(Utf8("Ångström")) |
+-------------------------+
| ångström                |
+-------------------------+
```

Related functions: [`initcap`](#initcap), [`upper`](#upper)

### `luhn_check`

Validates that a string of digits satisfies the [Luhn checksum](https://en.wikipedia.org/wiki/Luhn_algorithm), returning true for valid numbers and false otherwise. This matches the Spark SQL implementation and is useful for validating identifiers such as credit card numbers.

```sql
luhn_check(str)
```

#### Arguments

- **str**: String expression containing digits.

#### Example

```sql
> select luhn_check('79927398713');
+--------------------------------------+
| luhn_check(Utf8("79927398713"))      |
+--------------------------------------+
| true                                 |
+--------------------------------------+
```

Reference: [Spark SQL `luhn_check`](https://spark.apache.org/docs/latest/api/sql/index.html#luhn_check).

### `lpad`

Pads the left side of the string with another string until the result reaches the specified length. If the padding string is omitted, a space is used.

```sql
lpad(str, n[, padding_str])
```

#### Arguments

- **str**: String expression.
- **n**: Target length.
- **padding_str**: Optional string to pad with.

#### Example

```sql
> select lpad('Dolly', 10, 'hello');
+---------------------------------------------+
| lpad(Utf8("Dolly"),Int64(10),Utf8("hello")) |
+---------------------------------------------+
| helloDolly                                  |
+---------------------------------------------+
```

Related function: [`rpad`](#rpad)

### `ltrim`

Removes the longest string containing only characters in `trim_str` from the start of `str`. If `trim_str` is omitted, whitespace is removed.

```sql
ltrim(str[, trim_str])
```

#### Arguments

- **str**: String expression.
- **trim_str**: Optional string of characters to trim. Defaults to whitespace.

#### Example

```sql
> select ltrim('  datafusion  ');
+-------------------------------+
| ltrim(Utf8("  datafusion  ")) |
+-------------------------------+
| datafusion                    |
+-------------------------------+
> select ltrim('___datafusion___', '_');
+-------------------------------------------+
| ltrim(Utf8("___datafusion___"),Utf8("_")) |
+-------------------------------------------+
| datafusion___                             |
+-------------------------------------------+
```

Alternative syntax: `trim(LEADING trim_str FROM str)`

Related functions: [`btrim`](#btrim), [`rtrim`](#rtrim)

### `octet_length`

Returns the number of bytes in the string.

```sql
octet_length(str)
```

#### Arguments

- **str**: String expression.

#### Example

```sql
> select octet_length('Ångström');
+--------------------------------+
| octet_length(Utf8("Ångström")) |
+--------------------------------+
| 10                             |
+--------------------------------+
```

Related functions: [`bit_length`](#bit_length), [`length`](#length)

### `overlay`

Replaces a substring of `str` with `substr`, starting at position `pos` for `count` characters. If `count` is omitted, uses the length of `substr`.

```sql
overlay(str PLACING substr FROM pos [FOR count])
```

#### Arguments

- **str**: String expression.
- **substr**: Replacement string.
- **pos**: Start position (1-based).
- **count**: Optional number of characters to replace.

#### Example

```sql
> select overlay('Txxxxas' placing 'hom' from 2 for 4);
+--------------------------------------------------------+
| overlay(Utf8("Txxxxas"),Utf8("hom"),Int64(2),Int64(4)) |
+--------------------------------------------------------+
| Thomas                                                 |
+--------------------------------------------------------+
```

### `parse_url`

Extracts a component from a URL, or retrieves an individual query parameter when provided a key, following Spark SQL semantics. Supported parts include `HOST`, `PATH`, `QUERY`, `REF`, `PROTOCOL`, `FILE`, and `AUTHORITY`.

```sql
parse_url(url, part_to_extract[, key])
```

#### Arguments

- **url**: URL string expression.
- **part_to_extract**: Case-insensitive token identifying which component to extract.
- **key**: Optional query parameter key to extract from the `QUERY` part.

#### Example

```sql
> select parse_url('https://spice.ai/blog?id=42', 'HOST');
+-------------------------------------------------------+
| parse_url(Utf8("https://spice.ai/blog?id=42"),Utf8("HOST")) |
+-------------------------------------------------------+
| spice.ai                                              |
+-------------------------------------------------------+
> select parse_url('https://spice.ai/blog?id=42', 'QUERY', 'id');
+------------------------------------------------------------------+
| parse_url(Utf8("https://spice.ai/blog?id=42"),Utf8("QUERY"),Utf8("id")) |
+------------------------------------------------------------------+
| 42                                                               |
+------------------------------------------------------------------+
```

Reference: [Spark SQL `parse_url`](https://spark.apache.org/docs/latest/api/sql/index.html#parse_url).

### `position`

Alias of [`strpos`](#strpos).

### `repeat`

Returns a string consisting of the input string repeated `n` times.

```sql
repeat(str, n)
```

#### Arguments

- **str**: String expression.
- **n**: Number of repetitions.

#### Example

```sql
> select repeat('data', 3);
+-------------------------------+
| repeat(Utf8("data"),Int64(3)) |
+-------------------------------+
| datadatadata                  |
+-------------------------------+
```

### `replace`

Replaces all occurrences of `substr` in `str` with `replacement`.

```sql
replace(str, substr, replacement)
```

#### Arguments

- **str**: String expression.
- **substr**: Substring to replace.
- **replacement**: Replacement string.

#### Example

```sql
> select replace('ABabbaBA', 'ab', 'cd');
+-------------------------------------------------+
| replace(Utf8("ABabbaBA"),Utf8("ab"),Utf8("cd")) |
+-------------------------------------------------+
| ABcdbaBA                                        |
+-------------------------------------------------+
```

### `reverse`

Returns the string with the character order reversed.

```sql
reverse(str)
```

#### Arguments

- **str**: String expression.

#### Example

```sql
> select reverse('datafusion');
+-----------------------------+
| reverse(Utf8("datafusion")) |
+-----------------------------+
| noisufatad                  |
+-----------------------------+
```

### `right`

Returns the last `n` characters from the right side of the string.

```sql
right(str, n)
```

#### Arguments

- **str**: String expression.
- **n**: Number of characters to return.

#### Example

```sql
> select right('datafusion', 6);
+------------------------------------+
| right(Utf8("datafusion"),Int64(6)) |
+------------------------------------+
| fusion                             |
+------------------------------------+
```

Related function: [`left`](#left)

### `rpad`

Pads the right side of the string with another string until the result reaches the specified length. If the padding string is omitted, a space is used.

```sql
rpad(str, n[, padding_str])
```

#### Arguments

- **str**: String expression.
- **n**: Target length.
- **padding_str**: Optional string to pad with.

#### Example

```sql
> select rpad('datafusion', 20, '_-');
+-----------------------------------------------+
| rpad(Utf8("datafusion"),Int64(20),Utf8("_-")) |
+-----------------------------------------------+
| datafusion_-_-_-_-_-                          |
+-----------------------------------------------+
```

Related function: [`lpad`](#lpad)

### `rtrim`

Removes the longest string containing only characters in `trim_str` from the end of `str`. If `trim_str` is omitted, whitespace is removed.

```sql
rtrim(str[, trim_str])
```

#### Arguments

- **str**: String expression.
- **trim_str**: Optional string of characters to trim. Defaults to whitespace.

#### Example

```sql
> select rtrim('  datafusion  ');
+-------------------------------+
| rtrim(Utf8("  datafusion  ")) |
+-------------------------------+
|   datafusion                  |
+-------------------------------+
> select rtrim('___datafusion___', '_');
+-------------------------------------------+
| rtrim(Utf8("___datafusion___"),Utf8("_")) |
+-------------------------------------------+
| ___datafusion                             |
+-------------------------------------------+
```

Alternative syntax: `trim(TRAILING trim_str FROM str)`

Related functions: [`btrim`](#btrim), [`ltrim`](#ltrim)

### `split_part`

Splits the string on the specified delimiter and returns the substring at the given position (1-based).

```sql
split_part(str, delimiter, pos)
```

#### Arguments

- **str**: String expression.
- **delimiter**: Delimiter string.
- **pos**: Position of the part to return (1-based).

#### Example

```sql
> select split_part('1.2.3.4.5', '.', 3);
+--------------------------------------------------+
| split_part(Utf8("1.2.3.4.5"),Utf8("."),Int64(3)) |
+--------------------------------------------------+
| 3                                                |
+--------------------------------------------------+
```

### `starts_with`

Returns true if `str` starts with the substring `substr`.

```sql
starts_with(str, substr)
```

#### Arguments

- **str**: String expression.
- **substr**: Substring to test for.

#### Example

```sql
> select starts_with('datafusion','data');
+----------------------------------------------+
| starts_with(Utf8("datafusion"),Utf8("data")) |
+----------------------------------------------+
| true                                         |
+----------------------------------------------+
```

### `strpos`

Returns the position (1-based) of the first occurrence of `substr` in `str`. Returns 0 if not found.

```sql
strpos(str, substr)
```

#### Arguments

- **str**: String expression.
- **substr**: Substring to search for.

#### Example

```sql
> select strpos('datafusion', 'fus');
+----------------------------------------+
| strpos(Utf8("datafusion"),Utf8("fus")) |
+----------------------------------------+
| 5                                      |
+----------------------------------------+
```

Alternative syntax: `position(substr in origstr)`

Aliases: `instr`, `position`

### `substr`

Extracts a substring from `str`, starting at `start_pos` for `length` characters. If `length` is omitted, returns the rest of the string.

```sql
substr(str, start_pos[, length])
```

#### Arguments

- **str**: String expression.
- **start_pos**: Start position (1-based).
- **length**: Optional number of characters to extract.

#### Example

```sql
> select substr('datafusion', 5, 3);
+----------------------------------------------+
| substr(Utf8("datafusion"),Int64(5),Int64(3)) |
+----------------------------------------------+
| fus                                          |
+----------------------------------------------+
```

Alternative syntax: `substring(str from start_pos for length)`

Aliases: `substring`

### `substr_index`

Returns the substring from `str` before or after a specified number of occurrences of the delimiter `delim`. If `count` is positive, returns everything to the left of the final delimiter (counting from the left). If `count` is negative, returns everything to the right of the final delimiter (counting from the right).

```sql
substr_index(str, delim, count)
```

#### Arguments

- **str**: String expression.
- **delim**: Delimiter string.
- **count**: Number of occurrences (positive or negative).

#### Example

```sql
> select substr_index('www.apache.org', '.', 1);
+---------------------------------------------------------+
| substr_index(Utf8("www.apache.org"),Utf8("."),Int64(1)) |
+---------------------------------------------------------+
| www                                                     |
+---------------------------------------------------------+
> select substr_index('www.apache.org', '.', -1);
+----------------------------------------------------------+
| substr_index(Utf8("www.apache.org"),Utf8("."),Int64(-1)) |
+----------------------------------------------------------+
| org                                                      |
+----------------------------------------------------------+
```

Aliases: `substring_index`

### `substring`

Alias of [`substr`](#substr).

### `substring_index`

Alias of [`substr_index`](#substr_index).

### `to_hex`

Converts an integer to its hexadecimal string representation.

```sql
to_hex(int)
```

#### Arguments

- **int**: Integer expression.

#### Example

```sql
> select to_hex(12345689);
+-------------------------+
| to_hex(Int64(12345689)) |
+-------------------------+
| bc6159                  |
+-------------------------+
```

### `translate`

Replaces each character in `str` that matches a character in `chars` with the corresponding character in `translation`. If `translation` is shorter than `chars`, extra characters are removed.

```sql
translate(str, chars, translation)
```

#### Arguments

- **str**: String expression.
- **chars**: Characters to translate.
- **translation**: Replacement characters.

#### Example

```sql
> select translate('twice', 'wic', 'her');
+--------------------------------------------------+
| translate(Utf8("twice"),Utf8("wic"),Utf8("her")) |
+--------------------------------------------------+
| there                                            |
+--------------------------------------------------+
```

### `trim`

Alias of [`btrim`](#btrim).

### `upper`

Converts all characters in the string to upper case.

```sql
upper(str)
```

#### Arguments

- **str**: String expression.

#### Example

```sql
> select upper('dataFusion');
+---------------------------+
| upper(Utf8("dataFusion")) |
+---------------------------+
| DATAFUSION                |
+---------------------------+
```

Related functions: [`initcap`](#initcap), [`lower`](#lower)

### `uuid`

Returns a [UUID v4](<https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)>) string value that is unique per row.

```sql
uuid()
```

#### Example

```sql
> select uuid();
+--------------------------------------+
| uuid()                               |
+--------------------------------------+
| 6ec17ef8-1934-41cc-8d59-d0c8f9eea1f0 |
+--------------------------------------+
```

---

## Binary String Functions

Binary string functions help encode and decode binary data, such as base64 and hexadecimal conversions. These are useful for working with encoded data or binary blobs.

### `bit_get`

Returns the bit (0 or 1) at the specified zero-based position when counting from the least-significant bit of an integral or binary expression, matching Spark SQL semantics.

```sql
bit_get(value, position)
```

#### Arguments

- **value**: Integer or binary expression whose bits are inspected.
- **position**: Zero-based index of the bit to return. Must be non-negative.

#### Example

```sql
> select bit_get(11, 2) as bit;
+-----+
| bit |
+-----+
| 0   |
+-----+
```

Reference: [Spark SQL `bit_get`](https://spark.apache.org/docs/latest/api/sql/index.html#bit_get).

### `bit_count`

Counts the number of set bits in an integral or binary expression. Useful for quick popcount operations on bitmaps or packed flags, aligned with Spark SQL behavior.

```sql
bit_count(value)
```

#### Arguments

- **value**: Integer or binary expression.

#### Example

```sql
> select bit_count(255) as popcnt;
+--------+
| popcnt |
+--------+
| 8      |
+--------+
```

Reference: [Spark SQL `bit_count`](https://spark.apache.org/docs/latest/api/sql/index.html#bit_count).

### `bitmap_count`

Returns the number of set bits in a binary bitmap produced by functions such as `bitmap_construct_agg`, mirroring the Spark SQL implementation.

```sql
bitmap_count(bitmap)
```

#### Arguments

- **bitmap**: Binary expression representing a bitmap.

#### Example

```sql
> select bitmap_count(x'0F') as popcnt;
+--------+
| popcnt |
+--------+
| 4      |
+--------+
```

Reference: [Spark SQL `bitmap_count`](https://spark.apache.org/docs/latest/api/sql/index.html#bitmap_count).

## Regular Expression Functions

Regular expression functions help match, extract, and replace patterns in strings. Spice.ai uses a PCRE-like regular expression syntax. Spice supports the following regular expressions:

- [`regexp_like`](#regexp_like)
- [`regexp_match`](#regexp_match)
- [`regexp_replace`](#regexp_replace)
- [`regexp_count`](#regexp_count)
- [`regexp_instr`](#regexp_instr)

### `regexp_like`

Returns true if a regular expression has at least one match in a string, false otherwise.

```sql
regexp_like(str, regexp[, flags])
```

#### Arguments

- **str**: String expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **regexp**: Regular expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **flags**: Optional regular expression flags that control the behavior of the regular expression. The following flags are supported:
  - **i**: case-insensitive: letters match both upper and lower case
  - **m**: multi-line mode: ^ and $ match begin/end of line
  - **s**: allow . to match \n
  - **R**: enables CRLF mode: when multi-line mode is enabled, \r\n is used
  - **U**: swap the meaning of x* and x*?

#### Example

```sql
> select regexp_like('Köln', '[a-zA-Z]ö[a-zA-Z]{2}');
+--------------------------------------------------------+
| regexp_like(Utf8("Köln"),Utf8("[a-zA-Z]ö[a-zA-Z]{2}")) |
+--------------------------------------------------------+
| true                                                   |
+--------------------------------------------------------+
> SELECT regexp_like('aBc', '(b|d)', 'i');
+--------------------------------------------------+
| regexp_like(Utf8("aBc"),Utf8("(b|d)"),Utf8("i")) |
+--------------------------------------------------+
| true                                             |
+--------------------------------------------------+
```

### `regexp_match`

Returns the first regular expression matches in a string.

```sql
regexp_match(str, regexp[, flags])
```

#### Arguments

- **str**: String expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **regexp**: Regular expression to match against. Can be a constant, column, or function.
- **flags**: Optional regular expression flags that control the behavior of the regular expression. The following flags are supported:
  - **i**: case-insensitive: letters match both upper and lower case
  - **m**: multi-line mode: ^ and $ match begin/end of line
  - **s**: allow . to match \n
  - **R**: enables CRLF mode: when multi-line mode is enabled, \r\n is used
  - **U**: swap the meaning of x* and x*?

#### Example

```sql
> select regexp_match('Köln', '[a-zA-Z]ö[a-zA-Z]{2}');
+---------------------------------------------------------+
| regexp_match(Utf8("Köln"),Utf8("[a-zA-Z]ö[a-zA-Z]{2}")) |
+---------------------------------------------------------+
| [Köln]                                                  |
+---------------------------------------------------------+
SELECT regexp_match('aBc', '(b|d)', 'i');
+---------------------------------------------------+
| regexp_match(Utf8("aBc"),Utf8("(b|d)"),Utf8("i")) |
+---------------------------------------------------+
| [B]                                               |
+---------------------------------------------------+
```

### `regexp_replace`

Replaces substrings in a string that match a regular expression.

```sql
regexp_replace(str, regexp, replacement[, flags])
```

#### Arguments

- **str**: String expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **regexp**: Regular expression to match against. Can be a constant, column, or function.
- **replacement**: Replacement string expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **flags**: Optional regular expression flags that control the behavior of the regular expression. The following flags are supported:
  - **g**: (global) Search globally and don’t return after the first match
  - **i**: case-insensitive: letters match both upper and lower case
  - **m**: multi-line mode: ^ and $ match begin/end of line
  - **s**: allow . to match \n
  - **R**: enables CRLF mode: when multi-line mode is enabled, \r\n is used
  - **U**: swap the meaning of x* and x*?

#### Example

```sql
> select regexp_replace('foobarbaz', 'b(..)', 'X\\1Y', 'g');
+------------------------------------------------------------------------+
| regexp_replace(Utf8("foobarbaz"),Utf8("b(..)"),Utf8("X\1Y"),Utf8("g")) |
+------------------------------------------------------------------------+
| fooXarYXazY                                                            |
+------------------------------------------------------------------------+
SELECT regexp_replace('aBc', '(b|d)', 'Ab\\1a', 'i');
+-------------------------------------------------------------------+
| regexp_replace(Utf8("aBc"),Utf8("(b|d)"),Utf8("Ab\1a"),Utf8("i")) |
+-------------------------------------------------------------------+
| aAbBac                                                            |
+-------------------------------------------------------------------+
```

### `regexp_count`

Returns the number of matches that a regular expression has in a string.

```sql
regexp_count(str, regexp[, start, flags])
```

#### Arguments

- **str**: String expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **regexp**: Regular expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **start**: **- start**: Optional start position (the first position is 1) to search for the regular expression. Can be a constant, column, or function.
- **flags**: Optional regular expression flags that control the behavior of the regular expression. The following flags are supported:
  - **i**: case-insensitive: letters match both upper and lower case
  - **m**: multi-line mode: ^ and $ match begin/end of line
  - **s**: allow . to match \n
  - **R**: enables CRLF mode: when multi-line mode is enabled, \r\n is used
  - **U**: swap the meaning of x* and x*?

#### Example

```sql
> select regexp_count('abcAbAbc', 'abc', 2, 'i');
+---------------------------------------------------------------+
| regexp_count(Utf8("abcAbAbc"),Utf8("abc"),Int64(2),Utf8("i")) |
+---------------------------------------------------------------+
| 1                                                             |
+---------------------------------------------------------------+
```

### `regexp_instr`

Returns the position in a string where the specified occurrence of a POSIX regular expression is located.

```sql
regexp_instr(str, regexp[, start[, N[, flags[, subexpr]]]])
```

#### Arguments

- **str**: String expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **regexp**: Regular expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **start**: **- start**: Optional start position (the first position is 1) to search for the regular expression. Can be a constant, column, or function. Defaults to 1
- **N**: **- N**: Optional The N-th occurrence of pattern to find. Defaults to 1 (first match). Can be a constant, column, or function.
- **flags**: Optional regular expression flags that control the behavior of the regular expression. The following flags are supported:
  - **i**: case-insensitive: letters match both upper and lower case
  - **m**: multi-line mode: ^ and $ match begin/end of line
  - **s**: allow . to match \n
  - **R**: enables CRLF mode: when multi-line mode is enabled, \r\n is used
  - **U**: swap the meaning of x* and x*?
- **subexpr**: Optional Specifies which capture group (subexpression) to return the position for. Defaults to 0, which returns the position of the entire match.

#### Example

```sql
> SELECT regexp_instr('ABCDEF', 'C(.)(..)');
+---------------------------------------------------------------+
| regexp_instr(Utf8("ABCDEF"),Utf8("C(.)(..)"))                 |
+---------------------------------------------------------------+
| 3                                                             |
+---------------------------------------------------------------+
```

## Time and Date Functions

Time and date functions help extract, format, and manipulate temporal data. Functions include `current_date`, `now`, `date_part`, `date_trunc`, and various conversion functions. These are essential for time series analysis and working with timestamps.

- [current_date](#current_date)
- [current_time](#current_time)
- [current_timestamp](#current_timestamp)
- [date_bin](#date_bin)
- [date_format](#date_format)
- [date_part](#date_part)
- [date_trunc](#date_trunc)
- [datepart](#datepart)
- [datetrunc](#datetrunc)
- [from_unixtime](#from_unixtime)
- [make_date](#make_date)
- [now](#now)
- [to_char](#to_char)
- [to_date](#to_date)
- [to_local_time](#to_local_time)
- [to_timestamp](#to_timestamp)
- [to_timestamp_micros](#to_timestamp_micros)
- [to_timestamp_millis](#to_timestamp_millis)
- [to_timestamp_nanos](#to_timestamp_nanos)
- [to_timestamp_seconds](#to_timestamp_seconds)
- [to_unixtime](#to_unixtime)
- [today](#today)

### `current_date`

Returns the current UTC date.

The `current_date()` return value is determined at query time and will return the same date, no matter when in the query plan the function executes.

```sql
current_date()
```

#### Aliases

- today

### `current_time`

Returns the current UTC time.

The `current_time()` return value is determined at query time and will return the same time, no matter when in the query plan the function executes.

```sql
current_time()
```

### `current_timestamp`

_Alias of [now](#now)._

### `date_bin`

Calculates time intervals and returns the start of the interval nearest to the specified timestamp. Use `date_bin` to downsample time series data by grouping rows into time-based "bins" or "windows" and applying an aggregate or selector function to each window.

For example, if you "bin" or "window" data into 15 minute intervals, an input timestamp of `2023-01-01T18:18:18Z` will be updated to the start time of the 15 minute bin it is in: `2023-01-01T18:15:00Z`.

```sql
date_bin(interval, expression, origin-timestamp)
```

#### Arguments

- **interval**: Bin interval.
- **expression**: Time expression to operate on. Can be a constant, column, or function.
- **origin-timestamp**: Optional. Starting point used to determine bin boundaries. If not specified defaults 1970-01-01T00:00:00Z (the UNIX epoch in UTC). The following intervals are supported:
  - nanoseconds
  - microseconds
  - milliseconds
  - seconds
  - minutes
  - hours
  - days
  - weeks
  - months
  - years
  - century

#### Example

```sql
-- Bin the timestamp into 1 day intervals
> SELECT date_bin(interval '1 day', time) as bin
FROM VALUES ('2023-01-01T18:18:18Z'), ('2023-01-03T19:00:03Z')  t(time);
+---------------------+
| bin                 |
+---------------------+
| 2023-01-01T00:00:00 |
| 2023-01-03T00:00:00 |
+---------------------+
2 row(s) fetched.

-- Bin the timestamp into 1 day intervals starting at 3AM on  2023-01-01
> SELECT date_bin(interval '1 day', time,  '2023-01-01T03:00:00') as bin
FROM VALUES ('2023-01-01T18:18:18Z'), ('2023-01-03T19:00:03Z')  t(time);
+---------------------+
| bin                 |
+---------------------+
| 2023-01-01T03:00:00 |
| 2023-01-03T03:00:00 |
+---------------------+
2 row(s) fetched.
```

### `date_add`

Adds a number of days to a DATE or TIMESTAMP expression, matching Spark SQL semantics. Negative offsets move backwards in time.

```sql
date_add(start_date, num_days)
```

#### Arguments

- **start_date**: DATE or TIMESTAMP expression.
- **num_days**: Integer number of days to add.

#### Example

```sql
> select date_add(date '2024-02-27', 3);
+---------------------------------+
| date_add(Date32("2024-02-27"),Int64(3)) |
+---------------------------------+
| 2024-03-01                     |
+---------------------------------+
```

Reference: [Spark SQL `date_add`](https://spark.apache.org/docs/latest/api/sql/index.html#date_add).

### `date_sub`

Subtracts a number of days from a DATE or TIMESTAMP expression using Spark-compatible behavior.

```sql
date_sub(start_date, num_days)
```

#### Arguments

- **start_date**: DATE or TIMESTAMP expression.
- **num_days**: Integer number of days to subtract.

#### Example

```sql
> select date_sub(date '2024-03-05', 7);
+---------------------------------+
| date_sub(Date32("2024-03-05"),Int64(7)) |
+---------------------------------+
| 2024-02-27                     |
+---------------------------------+
```

Reference: [Spark SQL `date_sub`](https://spark.apache.org/docs/latest/api/sql/index.html#date_sub).

### `last_day`

Returns the last day of the month that contains the input date or timestamp, matching Spark SQL semantics.

```sql
last_day(expression)
```

#### Arguments

- **expression**: DATE or TIMESTAMP expression.

#### Example

```sql
> select last_day(date '2024-02-14');
+----------------------------------+
| last_day(Date32("2024-02-14"))   |
+----------------------------------+
| 2024-02-29                      |
+----------------------------------+
```

Reference: [Spark SQL `last_day`](https://spark.apache.org/docs/latest/api/sql/index.html#last_day).

### `next_day`

Returns the first date after `start_date` that matches the requested day of week. Valid day names include full names (e.g., `Monday`) or abbreviations such as `Mon`, matching Spark SQL behavior.

```sql
next_day(start_date, day_of_week)
```

#### Arguments

- **start_date**: DATE or TIMESTAMP expression.
- **day_of_week**: String literal naming the target weekday.

#### Example

```sql
> select next_day(date '2024-02-14', 'FRI');
+--------------------------------------------------+
| next_day(Date32("2024-02-14"),Utf8("FRI"))        |
+--------------------------------------------------+
| 2024-02-16                                       |
+--------------------------------------------------+
```

Reference: [Spark SQL `next_day`](https://spark.apache.org/docs/latest/api/sql/index.html#next_day).

### `date_format`

_Alias of [to_char](#to_char)._

### `date_part`

Returns the specified part of the date as an integer.

```sql
date_part(part, expression)
```

#### Arguments

- **part**: Part of the date to return. The following date parts are supported:
  - year
  - quarter (emits value in inclusive range [1, 4] based on which quartile of the year the date is in)
  - month
  - week (week of the year)
  - day (day of the month)
  - hour
  - minute
  - second
  - millisecond
  - microsecond
  - nanosecond
  - dow (day of the week where Sunday is 0)
  - doy (day of the year)
  - epoch (seconds since Unix epoch)
  - isodow (day of the week where Monday is 0)

- **expression**: Time expression to operate on. Can be a constant, column, or function.

#### Alternative Syntax

```sql
extract(field FROM source)
```

#### Aliases

- datepart

### `date_trunc`

Truncates a timestamp value to a specified precision.

```sql
date_trunc(precision, expression)
```

#### Arguments

- **precision**: Time precision to truncate to. The following precisions are supported:
  - year / YEAR
  - quarter / QUARTER
  - month / MONTH
  - week / WEEK
  - day / DAY
  - hour / HOUR
  - minute / MINUTE
  - second / SECOND
  - millisecond / MILLISECOND
  - microsecond / MICROSECOND

- **expression**: Time expression to operate on. Can be a constant, column, or function.

#### Aliases

- datetrunc

### `datepart`

_Alias of [date_part](#date_part)._

### `datetrunc`

_Alias of [date_trunc](#date_trunc)._

### `from_unixtime`

Converts an integer to RFC3339 timestamp format (`YYYY-MM-DDT00:00:00.000000000Z`). Integers and unsigned integers are interpreted as seconds since the unix epoch (`1970-01-01T00:00:00Z`) return the corresponding timestamp.

```sql
from_unixtime(expression[, timezone])
```

#### Arguments

- **expression**: The expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **timezone**: Optional timezone to use when converting the integer to a timestamp. If not provided, the default timezone is UTC.

#### Example

```sql
> select from_unixtime(1599572549, 'America/New_York');
+-----------------------------------------------------------+
| from_unixtime(Int64(1599572549),Utf8("America/New_York")) |
+-----------------------------------------------------------+
| 2020-09-08T09:42:29-04:00                                 |
+-----------------------------------------------------------+
```

### `make_date`

Make a date from year/month/day component parts.

```sql
make_date(year, month, day)
```

#### Arguments

- **year**: Year to use when making the date. Can be a constant, column or function, and any combination of arithmetic operators.
- **month**: Month to use when making the date. Can be a constant, column or function, and any combination of arithmetic operators.
- **day**: Day to use when making the date. Can be a constant, column or function, and any combination of arithmetic operators.

#### Example

```sql
> select make_date(2023, 1, 31);
+-------------------------------------------+
| make_date(Int64(2023),Int64(1),Int64(31)) |
+-------------------------------------------+
| 2023-01-31                                |
+-------------------------------------------+
> select make_date('2023', '01', '31');
+-----------------------------------------------+
| make_date(Utf8("2023"),Utf8("01"),Utf8("31")) |
+-----------------------------------------------+
| 2023-01-31                                    |
+-----------------------------------------------+
```

### `now`

Returns the current UTC timestamp.

The `now()` return value is determined at query time and will return the same timestamp, no matter when in the query plan the function executes.

```sql
now()
```

#### Aliases

- current_timestamp

### `to_char`

Returns a string representation of a date, time, timestamp or duration based on a [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html). Unlike the PostgreSQL equivalent of this function numerical formatting is not supported.

```sql
to_char(expression, format)
```

#### Arguments

- **expression**: Expression to operate on. Can be a constant, column, or function that results in a date, time, timestamp or duration.
- **format**: A [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) string to use to convert the expression.
- **day**: Day to use when making the date. Can be a constant, column or function, and any combination of arithmetic operators.

#### Example

```sql
> select to_char('2023-03-01'::date, '%d-%m-%Y');
+----------------------------------------------+
| to_char(Utf8("2023-03-01"),Utf8("%d-%m-%Y")) |
+----------------------------------------------+
| 01-03-2023                                   |
+----------------------------------------------+
```

#### Aliases

- date_format

### `to_date`

Converts a value to a date (`YYYY-MM-DD`).
Supports strings, integer and double types as input.
Strings are parsed as YYYY-MM-DD (e.g. '2023-07-20') if no [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html)s are provided.
Integers and doubles are interpreted as days since the unix epoch (`1970-01-01T00:00:00Z`).
Returns the corresponding date.

Note: `to_date` returns Date32, which represents its values as the number of days since unix epoch(`1970-01-01`) stored as signed 32 bit value. The largest supported date value is `9999-12-31`.

```sql
to_date('2017-05-31', '%Y-%m-%d')
```

#### Arguments

- **expression**: String expression to operate on. Can be a constant, column, or function, and any combination of operators.
- **format_n**: Optional [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) strings to use to parse the expression. Formats will be tried in the order
  they appear with the first successful one being returned. If none of the formats successfully parse the expression
  an error will be returned.

#### Example

```sql
> select to_date('2023-01-31');
+-------------------------------+
| to_date(Utf8("2023-01-31")) |
+-------------------------------+
| 2023-01-31                    |
+-------------------------------+
> select to_date('2023/01/31', '%Y-%m-%d', '%Y/%m/%d');
+---------------------------------------------------------------------+
| to_date(Utf8("2023/01/31"),Utf8("%Y-%m-%d"),Utf8("%Y/%m/%d")) |
+---------------------------------------------------------------------+
| 2023-01-31                                                          |
+---------------------------------------------------------------------+
```

### `to_local_time`

Converts a timestamp with a timezone to a timestamp without a timezone (with no offset or timezone information). This function handles daylight saving time changes.

```sql
to_local_time(expression)
```

#### Arguments

- **expression**: Time expression to operate on. Can be a constant, column, or function.

#### Example

```sql
> SELECT to_local_time('2024-04-01T00:00:20Z'::timestamp);
+---------------------------------------------+
| to_local_time(Utf8("2024-04-01T00:00:20Z")) |
+---------------------------------------------+
| 2024-04-01T00:00:20                         |
+---------------------------------------------+

> SELECT to_local_time('2024-04-01T00:00:20Z'::timestamp AT TIME ZONE 'Europe/Brussels');
+---------------------------------------------+
| to_local_time(Utf8("2024-04-01T00:00:20Z")) |
+---------------------------------------------+
| 2024-04-01T00:00:20                         |
+---------------------------------------------+

> SELECT
  time,
  arrow_typeof(time) as type,
  to_local_time(time) as to_local_time,
  arrow_typeof(to_local_time(time)) as to_local_time_type
FROM (
  SELECT '2024-04-01T00:00:20Z'::timestamp AT TIME ZONE 'Europe/Brussels' AS time
);
+---------------------------+------------------------------------------------+---------------------+-----------------------------+
| time                      | type                                           | to_local_time       | to_local_time_type          |
+---------------------------+------------------------------------------------+---------------------+-----------------------------+
| 2024-04-01T00:00:20+02:00 | Timestamp(Nanosecond, Some("Europe/Brussels")) | 2024-04-01T00:00:20 | Timestamp(Nanosecond, None) |
+---------------------------+------------------------------------------------+---------------------+-----------------------------+

# combine `to_local_time()` with `date_bin()` to bin on boundaries in the timezone rather
# than UTC boundaries

> SELECT date_bin(interval '1 day', to_local_time('2024-04-01T00:00:20Z'::timestamp AT TIME ZONE 'Europe/Brussels')) AS date_bin;
+---------------------+
| date_bin            |
+---------------------+
| 2024-04-01T00:00:00 |
+---------------------+

> SELECT date_bin(interval '1 day', to_local_time('2024-04-01T00:00:20Z'::timestamp AT TIME ZONE 'Europe/Brussels')) AT TIME ZONE 'Europe/Brussels' AS date_bin_with_timezone;
+---------------------------+
| date_bin_with_timezone    |
+---------------------------+
| 2024-04-01T00:00:00+02:00 |
+---------------------------+
```

### `to_timestamp`

Converts a value to a timestamp (`YYYY-MM-DDT00:00:00Z`). Supports strings, integer, unsigned integer, and double types as input. Strings are parsed as RFC3339 (e.g. '2023-07-20T05:44:00') if no [Chrono formats] are provided. Integers, unsigned integers, and doubles are interpreted as seconds since the unix epoch (`1970-01-01T00:00:00Z`). Returns the corresponding timestamp.

Note: `to_timestamp` returns `Timestamp(Nanosecond)`. The supported range for integer input is between `-9223372037` and `9223372036`. Supported range for string input is between `1677-09-21T00:12:44.0` and `2262-04-11T23:47:16.0`. Please use `to_timestamp_seconds` for the input outside of supported bounds.

```sql
to_timestamp(expression[, ..., format_n])
```

#### Arguments

- **expression**: Expression to operate on. Can be a constant, column, or function, and any combination of arithmetic operators.
- **format_n**: Optional [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) strings to use to parse the expression. Formats will be tried in the order they appear with the first successful one being returned. If none of the formats successfully parse the expression an error will be returned.

#### Example

```sql
> select to_timestamp('2023-01-31T09:26:56.123456789-05:00');
+-----------------------------------------------------------+
| to_timestamp(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+-----------------------------------------------------------+
| 2023-01-31T14:26:56.123456789                             |
+-----------------------------------------------------------+
> select to_timestamp('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+--------------------------------------------------------------------------------------------------------+
| to_timestamp(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+--------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00.123456789                                                                          |
+--------------------------------------------------------------------------------------------------------+
```

### `to_timestamp_micros`

Converts a value to a timestamp (`YYYY-MM-DDT00:00:00.000000Z`). Supports strings, integer, and unsigned integer types as input. Strings are parsed as RFC3339 (e.g. '2023-07-20T05:44:00') if no [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html)s are provided. Integers and unsigned integers are interpreted as microseconds since the unix epoch (`1970-01-01T00:00:00Z`) Returns the corresponding timestamp.

```sql
to_timestamp_micros(expression[, ..., format_n])
```

#### Arguments

- **expression**: Expression to operate on. Can be a constant, column, or function, and any combination of arithmetic operators.
- **format_n**: Optional [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) strings to use to parse the expression. Formats will be tried in the order they appear with the first successful one being returned. If none of the formats successfully parse the expression an error will be returned.

#### Example

```sql
> select to_timestamp_micros('2023-01-31T09:26:56.123456789-05:00');
+------------------------------------------------------------------+
| to_timestamp_micros(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+------------------------------------------------------------------+
| 2023-01-31T14:26:56.123456                                       |
+------------------------------------------------------------------+
> select to_timestamp_micros('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+---------------------------------------------------------------------------------------------------------------+
| to_timestamp_micros(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+---------------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00.123456                                                                                    |
+---------------------------------------------------------------------------------------------------------------+
```

### `to_timestamp_millis`

Converts a value to a timestamp (`YYYY-MM-DDT00:00:00.000Z`). Supports strings, integer, and unsigned integer types as input. Strings are parsed as RFC3339 (e.g. '2023-07-20T05:44:00') if no [Chrono formats](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) are provided. Integers and unsigned integers are interpreted as milliseconds since the unix epoch (`1970-01-01T00:00:00Z`). Returns the corresponding timestamp.

```sql
to_timestamp_millis(expression[, ..., format_n])
```

#### Arguments

- **expression**: Expression to operate on. Can be a constant, column, or function, and any combination of arithmetic operators.
- **format_n**: Optional [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) strings to use to parse the expression. Formats will be tried in the order they appear with the first successful one being returned. If none of the formats successfully parse the expression an error will be returned.

#### Example

```sql
> select to_timestamp_millis('2023-01-31T09:26:56.123456789-05:00');
+------------------------------------------------------------------+
| to_timestamp_millis(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+------------------------------------------------------------------+
| 2023-01-31T14:26:56.123                                          |
+------------------------------------------------------------------+
> select to_timestamp_millis('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+---------------------------------------------------------------------------------------------------------------+
| to_timestamp_millis(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+---------------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00.123                                                                                       |
+---------------------------------------------------------------------------------------------------------------+
```

### `to_timestamp_nanos`

Converts a value to a timestamp (`YYYY-MM-DDT00:00:00.000000000Z`). Supports strings, integer, and unsigned integer types as input. Strings are parsed as RFC3339 (e.g. '2023-07-20T05:44:00') if no [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html)s are provided. Integers and unsigned integers are interpreted as nanoseconds since the unix epoch (`1970-01-01T00:00:00Z`). Returns the corresponding timestamp.

```sql
to_timestamp_nanos(expression[, ..., format_n])
```

#### Arguments

- **expression**: Expression to operate on. Can be a constant, column, or function, and any combination of arithmetic operators.
- **format_n**: Optional [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) strings to use to parse the expression. Formats will be tried in the order they appear with the first successful one being returned. If none of the formats successfully parse the expression an error will be returned.

#### Example

```sql
> select to_timestamp_nanos('2023-01-31T09:26:56.123456789-05:00');
+-----------------------------------------------------------------+
| to_timestamp_nanos(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+-----------------------------------------------------------------+
| 2023-01-31T14:26:56.123456789                                   |
+-----------------------------------------------------------------+
> select to_timestamp_nanos('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+--------------------------------------------------------------------------------------------------------------+
| to_timestamp_nanos(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+--------------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00.123456789                                                                                |
+---------------------------------------------------------------------------------------------------------------+
```

### `to_timestamp_seconds`

Converts a value to a timestamp (`YYYY-MM-DDT00:00:00.000Z`). Supports strings, integer, and unsigned integer types as input. Strings are parsed as RFC3339 (e.g. '2023-07-20T05:44:00') if no [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html)s are provided. Integers and unsigned integers are interpreted as seconds since the unix epoch (`1970-01-01T00:00:00Z`). Returns the corresponding timestamp.

```sql
to_timestamp_seconds(expression[, ..., format_n])
```

#### Arguments

- **expression**: Expression to operate on. Can be a constant, column, or function, and any combination of arithmetic operators.
- **format_n**: Optional [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) strings to use to parse the expression. Formats will be tried in the order they appear with the first successful one being returned. If none of the formats successfully parse the expression an error will be returned.

#### Example

```sql
> select to_timestamp_seconds('2023-01-31T09:26:56.123456789-05:00');
+-------------------------------------------------------------------+
| to_timestamp_seconds(Utf8("2023-01-31T09:26:56.123456789-05:00")) |
+-------------------------------------------------------------------+
| 2023-01-31T14:26:56                                               |
+-------------------------------------------------------------------+
> select to_timestamp_seconds('03:59:00.123456789 05-17-2023', '%c', '%+', '%H:%M:%S%.f %m-%d-%Y');
+----------------------------------------------------------------------------------------------------------------+
| to_timestamp_seconds(Utf8("03:59:00.123456789 05-17-2023"),Utf8("%c"),Utf8("%+"),Utf8("%H:%M:%S%.f %m-%d-%Y")) |
+----------------------------------------------------------------------------------------------------------------+
| 2023-05-17T03:59:00                                                                                            |
+----------------------------------------------------------------------------------------------------------------+
```

### `to_unixtime`

Converts a value to seconds since the unix epoch (`1970-01-01T00:00:00Z`). Supports strings, dates, timestamps and double types as input. Strings are parsed as RFC3339 (e.g. '2023-07-20T05:44:00') if no [Chrono formats](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) are provided.

```sql
to_unixtime(expression[, ..., format_n])
```

#### Arguments

- **expression**: Expression to operate on. Can be a constant, column, or function, and any combination of arithmetic operators.
- **format_n**: Optional [Chrono format](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) strings to use to parse the expression. Formats will be tried in the order they appear with the first successful one being returned. If none of the formats successfully parse the expression an error will be returned.

#### Example

```sql
> select to_unixtime('2020-09-08T12:00:00+00:00');
+------------------------------------------------+
| to_unixtime(Utf8("2020-09-08T12:00:00+00:00")) |
+------------------------------------------------+
| 1599566400                                     |
+------------------------------------------------+
> select to_unixtime('01-14-2023 01:01:30+05:30', '%q', '%d-%m-%Y %H/%M/%S', '%+', '%m-%d-%Y %H:%M:%S%#z');
+-----------------------------------------------------------------------------------------------------------------------------+
| to_unixtime(Utf8("01-14-2023 01:01:30+05:30"),Utf8("%q"),Utf8("%d-%m-%Y %H/%M/%S"),Utf8("%+"),Utf8("%m-%d-%Y %H:%M:%S%#z")) |
+-----------------------------------------------------------------------------------------------------------------------------+
| 1673638290                                                                                                                  |
+-----------------------------------------------------------------------------------------------------------------------------+
```

### `today`

_Alias of [current_date](#current_date)._

## Array Functions

Array functions in Spice.ai SQL help construct, transform, and query array data types. These functions operate on array expressions, which can be constants, columns, or results of other functions. The implementation closely follows the PostgreSQL dialect. The following array functions are supported:

### `array`

Constructs an array from the provided expressions using Spark-compatible semantics. Inputs are evaluated left to right, cast to a common element type, and collected into a single Arrow list value without removing duplicates or nulls.

```sql
array(expression[, ..., expression_n])
```

#### Arguments

- **expression**: Value to include in the array. Expressions must be implicitly castable to a shared element type.
- **expression_n**: Additional expressions to append to the array.

#### Example

```sql
> select array(1, 2, 3);
+-----------------------------------+
| array(Int64(1),Int64(2),Int64(3)) |
+-----------------------------------+
| [1, 2, 3]                         |
+-----------------------------------+
```

Reference: [Spark SQL `array`](https://spark.apache.org/docs/latest/api/sql/index.html#array).

### `array_any_value`

Returns the first non-null element in the array. If all elements are null, returns null.

```sql
array_any_value(array)
```

#### Arguments

- **array**: Array expression. Can be a constant, column, or function, and any combination of array operators.

#### Example

```sql
> select array_any_value([NULL, 1, 2, 3]);
+-------------------------------+
| array_any_value(List([NULL,1,2,3])) |
+-------------------------------------+
| 1                                   |
+-------------------------------------+
```

#### Aliases

- list_any_value

### `array_append`

Appends an element to the end of an array and returns the new array.

```sql
array_append(array, element)
```

#### Arguments

- **array**: Array expression. Can be a constant, column, or function, and any combination of array operators.
- **element**: Element to append to the array.

#### Example

```sql
> select array_append([1, 2, 3], 4);
+--------------------------------------+
| array_append(List([1,2,3]),Int64(4)) |
+--------------------------------------+
| [1, 2, 3, 4]                         |
+--------------------------------------+
```

#### Aliases

- list_append
- array_push_back
- list_push_back

### `array_cat`

Alias of [`array_concat`](#array_concat).

### `array_concat`

Concatenates two or more arrays into a single array.

```sql
array_concat(array[, ..., array_n])
```

#### Arguments

- **array**: Array expression. Can be a constant, column, or function, and any combination of array operators.
- **array_n**: Additional array expressions to concatenate.

#### Example

```sql
> select array_concat([1, 2], [3, 4], [5, 6]);
+---------------------------------------------------+
| array_concat(List([1,2]),List([3,4]),List([5,6])) |
+---------------------------------------------------+
| [1, 2, 3, 4, 5, 6]                                |
+---------------------------------------------------+
```

#### Aliases

- array_cat
- list_concat
- list_cat

### `array_contains`

Returns true if the array contains the specified element.

```sql
array_contains(array, element)
```

#### Arguments

- **array**: Array expression. Can be a constant, column, or function, and any combination of array operators.
- **element**: Element to search for in the array.

#### Example

```sql
> select array_contains([1, 2, 3], 2);
+----------------------------------------+
| array_contains(List([1,2,3]),Int64(2)) |
+----------------------------------------+
| true                                   |
+----------------------------------------+
```

**Note**: For array-to-array containment operations, use the [`@>` operator](./operators#op_arr_contains).

### `array_dims`

Returns an array of the array's dimensions. For a 2D array, returns the number of rows and columns.

```sql
array_dims(array)
```

#### Arguments

- **array**: Array expression. Can be a constant, column, or function, and any combination of array operators.

#### Example

```sql
> select array_dims([[1, 2, 3], [4, 5, 6]]);
+---------------------------------+
| array_dims(List([1,2,3,4,5,6])) |
+---------------------------------+
| [2, 3]                          |
+---------------------------------+
```

#### Aliases

- list_dims

### `array_distance`

Returns the Euclidean distance between two input arrays of equal length.

```sql
array_distance(array1, array2)
```

#### Arguments

- **array1**: Array expression. Can be a constant, column, or function, and any combination of array operators.
- **array2**: Array expression. Can be a constant, column, or function, and any combination of array operators.

#### Example

```sql
> select array_distance([1, 2], [1, 4]);
+------------------------------------+
| array_distance(List([1,2], [1,4])) |
+------------------------------------+
| 2.0                                |
+------------------------------------+
```

#### Aliases

- list_distance

### `array_distinct`

Returns a new array with duplicate elements removed, preserving the order of first occurrence.

```sql
array_distinct(array)
```

#### Arguments

- **array**: Array expression. Can be a constant, column, or function, and any combination of array operators.

#### Example

```sql
> select array_distinct([1, 3, 2, 3, 1, 2, 4]);
+---------------------------------+
| array_distinct(List([1,2,3,4])) |
+---------------------------------+
| [1, 3, 2, 4]                    |
+---------------------------------+
```

#### Aliases

- list_distinct

### `array_element`

Extracts the element at the specified index from the array. Indexing is 1-based.

```sql
array_element(array, index)
```

#### Arguments

- **array**: Array expression. Can be a constant, column, or function, and any combination of array operators.
- **index**: Index to extract the element from the array (1-based).

#### Example

```sql
> select array_element([1, 2, 3, 4], 3);
+-----------------------------------------+
| array_element(List([1,2,3,4]),Int64(3)) |
+-----------------------------------------+
| 3                                       |
+-----------------------------------------+
```

#### Aliases

- array_extract
- list_element
- list_extract

---

## Struct Functions

Struct functions help construct and access structured data types (Arrow structs). Functions such as `struct`, `named_struct`, and `get_field` are supported. These are useful for working with nested or composite data.

## Map Functions

Map functions help construct and query key-value data structures. Functions include `map`, `map_extract`, `map_keys`, and `map_values`. These are useful for semi-structured or JSON-like data.

## Hashing Functions

Hashing functions help compute cryptographic hashes and checksums, such as `md5`, `sha256`, and `digest`. These are useful for data integrity, fingerprinting, and security applications.

## Union Functions

Union functions help work with union (variant) data types, such as extracting the value or tag from a union. Functions include `union_extract` and `union_tag`.

## Other Functions

Additional scalar functions include type casting, type inspection, and version reporting. Functions such as `arrow_cast`, `arrow_typeof`, and `version` are available.

### `ai`

Invokes large language models (LLMs) directly within SQL queries for text generation tasks. This asynchronous function processes prompts through configured model providers and returns generated text responses.

```sql
ai(message)
ai(message, model_name)
```

#### Arguments

- **message**: String prompt to send to the language model.
- **model_name** (optional): Name of the model to use as configured in your Spicepod. If omitted, the default model is used (only valid when exactly one model is configured).

#### Return Type

Returns a string containing the generated text response. Returns NULL if an error occurs during processing (errors are logged).

#### Behavior

Queries execute asynchronously, processing LLM calls in parallel across rows for improved performance. Each invocation queues an asynchronous call to the specified model provider.

The function honors DataFusion concurrency configuration for parallel requests. When multiple models with different providers are configured (e.g., OpenAI and Anthropic), each provider processes requests in parallel according to concurrency settings.

**Limits**: Maximum batch size of 100 rows per query; maximum input message size of 1 MB per message.

#### Example

```sql
-- Using default model (when only one model is configured)
SELECT
  zone,
  ai(concat_ws(' ', 'Categorize the zone', zone, 'in a single word. Only return the word.')) AS category
FROM taxi_zones
LIMIT 10;

-- Specifying a model explicitly
SELECT
  zone,
  ai(concat_ws(' ', 'Categorize the zone', zone, 'in a single word. Only return the word.'), 'gpt-4o') AS category
FROM taxi_zones
LIMIT 10;

-- Example output
+-----------------------+-------------+
| zone                  | category    |
+-----------------------+-------------+
| Newark Airport        | Transport   |
| Jamaica Bay           | Nature      |
| Allerton/Pelham...    | Residential |
+-----------------------+-------------+
```

#### Configuration

Models must be configured in `spicepod.yaml` under the `models` section. See [Large Language Models](../../features/large-language-models/index.md) for configuration details.

```yaml
models:
  - name: gpt-4o
    from: openai:gpt-4o
    params:
      openai_api_key: ${secrets:openai_key}
```

### `embed`

Generates vector embeddings for text using specified embedding models. Supports both single text strings and arrays of text for batch processing.

```sql
embed(text, model_name)
```

#### Arguments

- **text**: String or array of strings to generate embeddings for.
- **model_name**: Name of the embedding model to use (e.g., 'potion_2m', 'xl_embed') as configured in your Spicepod.

#### Return Type

Returns a list of floating-point values representing the embedding vector. For array inputs, returns embeddings for each element, preserving the input array length including NULL values.

#### Example

```sql
-- Single text embedding (returns a single array)
> select embed('hello world', 'potion_2m');

-- Multiple text embeddings (returns an array with 3 embedding arrays)
> select embed(['hey', 'there', 'sunshine'], 'potion_2m');
```

### `bucket`

Assigns a deterministic bucket identifier for a value by hashing the input and projecting it into a fixed number of buckets. Helpful for `partition_by` expressions and for co-locating related rows during acceleration refreshes.

```sql
bucket(num_buckets, value)
```

#### Arguments

- **num_buckets**: Positive integer indicating how many buckets to distribute values across. Values less than 1 produce an error.
- **value**: Expression to hash. Accepts strings, numbers, and other scalar types supported by the query engine.

#### Return Type

Returns an `Int64` in the range `[0, num_buckets - 1]`. The same input value always maps to the same bucket for a given `num_buckets`.

#### Example

```sql
-- Partition account IDs into 100 stable buckets
SELECT account_id, bucket(100, account_id) AS account_bucket
FROM accounts;
```

In `spicepod.yaml`, use the function directly inside `partition_by` to build file-based accelerations:

```yaml
datasets:
  - name: my_table
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      partition_by: 
        - bucket(100, account_id)
```

### `truncate`

Rounds numeric values down to the nearest multiple of the specified width. Useful when partitioning timestamps or numeric identifiers into wider ranges.

```sql
truncate(width, value)
```

#### Arguments

- **width**: Positive numeric value that defines the bucket size (for example, `10`, `900`, or `3600`).
- **value**: Numeric expression to truncate. Works with integers, decimals, and timestamps cast to integers (for example, epoch seconds).

#### Return Type

Returns a numeric value of the same type as `value`, rounded down so that the result is evenly divisible by `width`.

#### Example

```sql
SELECT truncate(10, 101) AS truncated_id;  -- returns 100

-- Truncate event timestamps to the start of each hour (3600 seconds)
SELECT truncate(3600, extract(epoch FROM event_time)) AS hour_start
FROM events;
```

---

Spice.ai aims for compatibility with PostgreSQL, but some functions or behaviors may differ depending on the underlying engine version.
