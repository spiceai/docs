---
title: 'Scalar Functions'
sidebar_label: 'Scalar Functions'
pagination_prev: 'reference/sql/information_schema'
pagination_next: null
sidebar_position: 6
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.  
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

---

## Conditional Functions

Conditional functions help handle null values, select among alternatives, and compare multiple expressions. Functions such as `coalesce`, `greatest`, `least`, and `nullif` are supported. These are useful for data cleaning and conditional logic in queries.

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

## Regular Expression Functions

Regular expression functions help match, extract, and replace patterns in strings. Spice.ai uses a PCRE-like regular expression syntax. Functions such as `regexp_like`, `regexp_match`, and `regexp_replace` are available.

## Time and Date Functions

Time and date functions help extract, format, and manipulate temporal data. Functions include `current_date`, `now`, `date_part`, `date_trunc`, and various conversion functions. These are essential for time series analysis and working with timestamps.

## Array Functions

Array functions in Spice.ai SQL help construct, transform, and query array data types. These functions operate on array expressions, which can be constants, columns, or results of other functions. The implementation closely follows the PostgreSQL dialect. The following array functions are supported:

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

Alias of [`array_has`](#array_has).

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

---

Spice.ai aims for compatibility with PostgreSQL, but some functions or behaviors may differ depending on the underlying engine version.
