# A2 (short): isPlainText
Library: nodemailer 10.0.10, mime-funcs/index.js, line 69.
INPUTS and OUTPUT were written by the student. This file forms part of the work completed collaboratively by the author and AI.

FUNCTION isPlainText
INPUTS:
  value: string - the text to check
  isParam (optional): boolean - true means the text will be used as a header parameter value, so a stricter list of forbidden characters applies. If left out, it counts as false.
OUTPUT:
  boolean - true means the value is text and has no forbidden characters; false means it isn't text, or it has a forbidden character
SIDE EFFECTS:
  NONE
FAILS WHEN:
  it never throws an error. A value that is not text, or that has a forbidden character, gives false.
STEPS:
1. IF isParam is true, pick the strict list of forbidden characters: control characters, delete, the quote mark, and everything above code 127. OTHERWISE pick the normal list: most control characters (but not tab, line feed or carriage return), and everything above code 127.
2. IF value is not a string RETURN false
3. IF value contains any character from the chosen list RETURN false
4. RETURN true

HAND TRACES:
| # | kind | input | steps that run | predicted | real | match |
| 1 | normal  | "hello"            | 1 to 4 | true  | true  | yes |
| 2 | edge    | "café"             | 1 to 3 | false | false | yes |
| 3 | edge    | 'say "hi"'         | 1 to 4 | true  | true  | yes |
| 4 | edge    | 'say "hi"', true   | 1 to 3 | false | false | yes |
| 5 | invalid | 42                 | 1, 2   | false | false | yes |