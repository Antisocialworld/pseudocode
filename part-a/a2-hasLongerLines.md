# A2: hasLongerLines

Source: nodemailer 10.0.10, dist/cjs/mime-funcs/index.js, line 94 (short function).

## How this file was written
- First pass: created collaboratively by the author and AI.
- Revised pseudocode (second section): created collaboratively by the author and AI (12 Oct 2026). The AI also ran the real function and reported results, which the student then ran again.
- Traces 5 and 6 were added after a real run result was already known, so they are not blind predictions.

## First pass (before the collaborative revision)

FUNCTION hasLongerLines(str, lineLength)

    IF length of str > 128 * 1024 THEN
        // Do not test strings longer than 128 KB
        RETURN TRUE
    END IF

    IF any line in str has more than lineLength characters THEN
        RETURN TRUE
    ELSE
        RETURN FALSE
    END IF

END FUNCTION

## Revised pseudocode

FUNCTION: hasLongerLines
AI USE: pseudocode revised collaboratively by the author and AI.

INPUTS
- str: a string, or another value that JavaScript can convert to text for regular-expression testing.
- lineLength: a number, the maximum permitted number of characters per line.

OUTPUT
- Boolean. TRUE if the string exceeds 131,072 UTF-16 code units or contains a line longer than lineLength; otherwise FALSE.

SIDE EFFECTS
- None.

FAILS WHEN
- str is null or undefined, because accessing its length property throws an error.
- lineLength is a string or another unsuitable type, because the expression used to calculate the minimum matching length may produce an unintended result.
- lineLength is undefined: the constructed regular expression is read as plain text, so it matches no line and the function silently returns FALSE (no error is thrown).

ALGORITHM
1. Check whether str exceeds 131,072 UTF-16 code units. If it does, return TRUE immediately.
2. Search for a line containing at least lineLength + 1 characters, treating LF, CR, CRLF, LINE SEPARATOR and PARAGRAPH SEPARATOR as line boundaries. Return TRUE if such a line exists.
3. Return FALSE if no line satisfies the length condition.

HAND TRACES

Trace 1: A line within the limit
Input: str = "abcdefgh", lineLength = 8
1. The string contains 8 characters, which is below the size limit.
2. Search for a line containing at least 9 characters. No such line exists.
3. Return FALSE.
Output: FALSE

Trace 2: A line exceeding the limit
Input: str = "abcdefghij", lineLength = 8
1. The string contains 10 characters, which is below the size limit.
2. Search for a line containing at least 9 characters. The line contains 10 characters.
3. Return TRUE.
Output: TRUE

Trace 3: A string exceeding the size limit
Input: str contains 131,073 UTF-16 code units, lineLength = 100
1. The string exceeds 131,072 UTF-16 code units.
2. Return TRUE immediately without checking individual lines.
Output: TRUE

Trace 4: A line break separates two lines
Input: str = "ab\r\ncdefgh", lineLength = 5
1. The string is below the size limit.
2. Search for a line containing at least 6 characters. The first line contains 2 characters, while the second contains 6.
3. Return TRUE.
Output: TRUE

Trace 5: lineLength is a string
Input: str = "abcdefgh", lineLength = "5"
1. The string is below the size limit.
2. Adding 1 to the string "5" produces "51". The regular expression therefore searches for a line containing at least 51 characters.
3. No such line exists.
4. Return FALSE.
Output: FALSE
Observation: The result differs from the expected result if the intention was to enforce a maximum of 5 characters per line.

Trace 6: lineLength is undefined
Input: str = "abcdefgh", lineLength = undefined
1. The string is below the size limit.
2. Adding 1 to undefined produces NaN.
3. The regular expression becomes ^.{NaN,}. JavaScript does not read {NaN,} as a repeat count, so it is treated as plain text. The pattern matches nothing in the string.
4. Return FALSE.
Output: FALSE
Observation: No error is thrown. {NaN,} is read as plain text, so the pattern matches nothing and the check silently passes.

IMPORTANT NOTES
- JavaScript string length counts UTF-16 code units, not bytes.
- The regular expression's multiline flag allows matching at the beginning of each line.
- The dot in the regular expression does not match JavaScript line terminators.
- Non-string values do not necessarily cause errors, because regular-expression testing can convert them to strings.
- The original function does not validate lineLength before constructing the regular expression.

## Comparison: prediction against the real run
Real results were produced by running the real function from nodemailer 10.0.10 on 12 Oct 2026 (once by the AI, once by the student in PowerShell for trace 6).

| Trace | I predicted | Real result | Who was right |
|---|---|---|---|
| 1 (abcdefgh, 8) | FALSE | FALSE | me |
| 2 (abcdefghij, 8) | TRUE | TRUE | me |
| 3 (131,073 characters, 100) | TRUE | TRUE | me |
| 4 ("ab\r\ncdefgh", 5) | TRUE | TRUE | me |
| 5 (lineLength "5") | FALSE | FALSE | n/a, answer already known |
| 6 (lineLength undefined) | a SyntaxError is thrown | FALSE, no error | the real run |

Also found by the real run, not in my first pass: lineLength undefined or a string does not fail loudly, and a number or an array passed as str does not throw because it is converted to text.
