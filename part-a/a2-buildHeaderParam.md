# A2: buildHeaderParam

Source: nodemailer 10.0.10, dist/cjs/mime-funcs/index.js, line 264 (hard function, about 140 lines).

## How this file was written
- AI USE: the pseudocode and traces below were created collaboratively by the author and AI (12 Oct 2026). This is NOT a no-AI first pass.
- The real function was run on every trace on 12 Oct 2026. All results below are from real runs.
- P11 to P13 were predicted by me by hand before running the function. The pseudocode, the other traces and P1 to P10 results were created collaboratively by the author and AI.

## Pseudocode

FUNCTION buildHeaderParam

INPUTS
- key: a string, the name of the header parameter (for example "filename").
- data: a string (or something that can become text), the parameter value. null becomes an empty string.
- maxLength: a number, the longest a piece may be. If missing or 0, it is 50.

OUTPUT
- A list of { key, value } pairs. A short plain value gives one pair with the plain key. A long or non-plain value gives numbered pairs: key*0, key*1 and so on. A pair whose value is percent-encoded has a star on the end of its key (key*0*).

SIDE EFFECTS
- None.

FAILS WHEN
- It does not throw for the inputs tried (null, empty, no maxLength). null does not give an empty result: it gives one encoded pair with the value utf-8'' (see trace P7).

STEPS
1. Set maxLength to 50 if it is missing or 0.
2. Check whether data is "plain": a real string with no control characters, no double quote and no character above 127 (a space is allowed).
3. PLAIN case:
   a. If the text is no longer than maxLength, return one pair { key, value: text }.
   b. Otherwise cut the text into chunks of exactly maxLength characters (the last chunk may be shorter) and number them key*0, key*1, ... with no star.
4. NOT PLAIN case (it has non-ASCII characters, quotes or control characters, or data was not a string):
   a. If the text contains emoji-style surrogate pairs, treat each pair as one unit so it is never cut in half.
   b. Start the first line with the prefix utf-8'' and mark it encoded. Every character on an encoded line is percent-encoded (é becomes %C3%A9, a space becomes %20).
   c. Go through the characters one by one, adding each to the current line.
   d. If adding the character would make the line reach maxLength, close the line and start a new one with that character.
   e. A new line that starts with a character that needs no encoding is "unencoded" for now: it keeps plain characters and keeps a space as a space. If a character that needs encoding then arrives and the line still has room, go back to the start of that line and redo it fully encoded. If there is no room, close the line and start a new encoded one.
   f. When the characters run out, close the last line if it has anything in it.
5. Number the pairs key*0, key*1, ... and add a star after the number for every encoded line.

HAND TRACES (real results)
P1 plain short: ("filename","report.pdf",50) gives [{filename: report.pdf}].
P2 plain long: ("filename","abcdefghijk",5) gives filename*0 abcde, filename*1 fghij, filename*2 k.
P3 non-ASCII: ("filename","café.pdf",50) gives filename*0* utf-8''caf%C3%A9.pdf.
P4 non-ASCII long: ("filename","naïve résumé final.pdf",12) gives
  filename*0* utf-8''na
  filename*1* %C3%AFve%20
  filename*2* r%C3%A9sum
  filename*3* %C3%A9%20fi
  filename*4  nal.pdf   (no star: this last line needed no encoding)
  Walk-through: line 1 holds the prefix plus "na". Adding ï (%C3%AF) would reach 15 characters, so line 1 closes. Line 2 is encoded: "%C3%AFve%20" is 11 characters, and adding "r" would reach 12, so it closes. Line 3 starts with "r", unencoded. The next character é needs encoding and there is room, so line 3 is redone encoded as "r%C3%A9sum". Line 4 is "%C3%A9%20fi", and "n" starts line 5. Everything after "n" is plain, so line 5 stays unencoded.
P5 emoji: ("filename","a😀b",50) gives filename*0* utf-8''a%F0%9F%98%80b.
P6 empty string: ("filename","",50) gives [{filename: ""}].
P7 null data: ("filename",null,50) gives one pair filename*0* with value utf-8''. (null is not a string, so it counts as not plain.)
P8 maxLength missing: ("filename","abc") gives [{filename: abc}].
P9 exactly maxLength: ("filename","abcde",5) gives [{filename: abcde}] (equal to the limit is not "longer").
P10 plain with a space: ("filename","a b.pdf",50) gives [{filename: "a b.pdf"}].

## Comparison: prediction against the real run
The code was read, the function was run on these inputs and the results were recorded, all done collaboratively by the author and AI. No prediction was made before the run. The "I predicted" column is for the student to fill in by hand. Until it is filled in, no row here counts as a prediction.

Output format: a list of { key, value } pairs.

| Trace | key, data, maxLength | I predicted | Real result | Who was right |
|---|---|---|---|---|
| P1 | "filename", "report.pdf", 50 | not predicted before the run | filename = report.pdf | n/a, no prediction was made |
| P2 | "filename", "abcdefghijk", 5 | not predicted before the run | filename*0 = abcde, filename*1 = fghij, filename*2 = k | n/a, no prediction was made |
| P3 | "filename", "café.pdf", 50 | not predicted before the run | filename*0* = utf-8''caf%C3%A9.pdf | n/a, no prediction was made |
| P4 | "filename", "naïve résumé final.pdf", 12 | filename*0* = utf-8''na, filename*1* = %C3%AFve%20, filename*2* = r%C3%A9sum, filename*3* = %C3%A9%20fi, filename*4 = nal.pdf | filename*0* = utf-8''na, filename*1* = %C3%AFve%20, filename*2* = r%C3%A9sum, filename*3* = %C3%A9%20fi, filename*4 = nal.pdf | predicted after seeing the results |
| P5 | "filename", "a😀b", 50 | not predicted before the run | filename*0* = utf-8''a%F0%9F%98%80b | n/a, no prediction was made |
| P6 | "filename", "" (empty), 50 | not predicted before the run | filename = "" (empty) | n/a, no prediction was made |
| P7 | "filename", null, 50 | filename*0* = utf-8'' | filename*0* = utf-8'' | predicted after seeing the results |
| P8 | "filename", "abc", (not given) | not predicted before the run | filename = abc | n/a, no prediction was made |
| P9 | "filename", "abcde", 5 | filename = abcde | filename = abcde | predicted after seeing the results |
| P10 | "filename", "a b.pdf", 50 | not predicted before the run | filename = a b.pdf | n/a, no prediction was made |
| P11 | "name", "aaaaaaaaaa", 4 | name*0 = aaaa, name*1 = aaaa, name*2 = aa | name*0 = aaaa, name*1 = aaaa, name*2 = aa | me |
| P12 | "filename", a"b, 50 | filename*0* = utf-8''a%22b | filename*0* = utf-8''a%22b | me |
| P13 | "filename", "日本.txt", 50 | filename*0* = utf-8''%E6%97%A5%E6%9C%AC.txt | filename*0* = utf-8''%E6%97%A5%E6%9C%AC.txt | me |

P11 to P13 were predicted by hand before the real run. The AI gave the inputs and ran the function after the predictions were written.
