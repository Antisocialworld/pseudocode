# A2: splitMimeEncodedString

Source: nodemailer 10.0.10, dist/cjs/mime-funcs/index.js, line 605 (medium function).

## How this file was written
- AI USE: the pseudocode and traces below were created collaboratively by the author and AI (12 Oct 2026). This is NOT a no-AI first pass.
- The real function was run on the traces and extra inputs on 12 Oct 2026. The results are in the comparison table.
- The first attempt (next section) is the student's own work, by the student's statement. The AI did not see it before the student wrote it.
- Everything after the first attempt (the revised pseudocode, the traces and the comparison) was created collaboratively by the author and AI.

## First attempt (before the collaborative revision)

FUNCTION splitMimeEncodedString(str, maxlen)

    CREATE an empty list called lines

    SET maxlen to the greater of maxlen or 12
    // Ensure at least 12 characters to accommodate possible 4-byte UTF-8 sequences

    WHILE str is not empty DO

        SET curLine to the first maxlen characters of str

        // Avoid splitting an incomplete encoded character
        IF curLine ends with "=" or "=" followed by one hexadecimal digit THEN
            REMOVE the incomplete encoded character from the end of curLine
        END IF

        IF curLine is not empty THEN
            SET fallbackLine to curLine
        ELSE
            SET fallbackLine to the first maxlen characters of str
        END IF

        SET done to FALSE

        WHILE done is FALSE AND curLine is not empty DO

            SET done to TRUE

            // Check whether the next encoded character begins a Unicode sequence
            IF the remaining string begins with "=" followed by two hexadecimal digits THEN

                CONVERT the two hexadecimal digits to an integer called chr

                // Check for an invalid UTF-8 starting byte
                IF chr is greater than 127 AND chr is less than 194 THEN

                    REMOVE the last 3 characters from curLine

                    SET done to FALSE

                END IF

            END IF

        END WHILE

        // If curLine becomes empty, use the fallback line
        IF curLine is empty THEN
            SET curLine to fallbackLine
        END IF

        ADD curLine to lines

        REMOVE the characters in curLine from the beginning of str

    END WHILE

    RETURN lines

END FUNCTION

Review notes on the first attempt (from the AI, 12 Oct 2026): the logic matched the real code. It had no header, numbered steps or traces, FAILS WHEN was empty, and the comment "invalid UTF-8 starting byte" was slightly wrong for values 128 to 191, which are continuation bytes.

## Revised pseudocode (created collaboratively by the author and AI)

FUNCTION splitMimeEncodedString

INPUTS
- str: a string of MIME-encoded text (it may contain escapes like =C3 that stand for one byte each).
- maxlen: a number, the preferred maximum length of each piece. Anything below 12 is raised to 12.

OUTPUT
- A list of strings (the pieces) in their original order. Joined together they give back str.

SIDE EFFECTS
- None. The caller's string is not changed.

FAILS WHEN
- str is null or undefined: it throws (reading 'length').
- str is an array: it throws (str.substr is not a function).
- str is a number: it does NOT throw. It silently returns an empty list.
- It cannot loop forever for a string: maxlen is at least 12, and every pass removes at least one character from the front of str.

STEPS
1. Create an empty list of pieces.
2. Raise maxlen to 12 if it is lower, so that a 4-byte UTF-8 character (up to 12 characters as =XX=XX=XX=XX) can fit.
3. WHILE str is not empty:
   a. Take the first maxlen characters of str as the candidate piece.
   b. If the candidate ends with "=" or with "=" and one hex digit, cut that incomplete escape off the end, so an =XX escape is never split.
   c. Remember the candidate as the fallback. If the candidate is now empty, the fallback is the first maxlen characters of str instead.
   d. Look at what would start the NEXT piece. If it begins with =XX where XX is between 80 and C1 (a continuation byte, or an invalid lead byte), the cut would land in the middle of a character. Remove the last 3 characters (one whole escape) from the candidate and check again. Repeat until the next piece no longer starts that way, or the candidate is empty.
   e. If the candidate became empty, use the fallback so the loop still makes progress.
   f. Add the candidate to the pieces and remove it from the front of str.
4. Return the pieces.

HAND TRACES (maxlen 12 in all)
1. str "abcdefghijklmnop": candidate "abcdefghijkl", no escape at the end, next starts with "m". Piece 1 "abcdefghijkl". Remaining "mnop" becomes piece 2. Result ["abcdefghijkl","mnop"].
2. str "aaaaaaaaaaa=C3=A9": candidate "aaaaaaaaaaa=" ends with "=", so cut it to "aaaaaaaaaaa". Next starts with =C3 (195, a valid lead byte), so no back-off. Result ["aaaaaaaaaaa","=C3=A9"].
3. str "aaaaaaaaa=C3=A9": candidate "aaaaaaaaa=C3". Next starts with =A9 (169, a continuation byte), so remove "=C3". Result ["aaaaaaaaa","=C3=A9"].
4. str "aaaaaa=E2=82=AC=E2=82=AC" (two euro signs): candidate "aaaaaa=E2=82". Next starts with =AC, so remove "=82". Next now starts with =82, so remove "=E2". Candidate "aaaaaa". Result ["aaaaaa","=E2=82=AC","=E2=82=AC"].
5. str "=" : candidate "=" is cut to empty, the fallback "=" is used. Result ["="].

## Comparison: prediction against the real run
Traces 1 to 3 were the inputs given to the student. The revised pseudocode predicted their outputs and the real run agreed. Traces 4 and 5 and the number case were added after the real run, so they are not predictions.

| Trace | Predicted | Real result | Who was right |
|---|---|---|---|
| 1 | ["abcdefghijkl","mnop"] | same | both agree |
| 2 | ["aaaaaaaaaaa","=C3=A9"] | same | both agree |
| 3 | ["aaaaaaaaa","=C3=A9"] | same | both agree |
| 4 | not predicted (added after the run) | ["aaaaaa","=E2=82=AC","=E2=82=AC"] | n/a |
| 5 | not predicted (added after the run) | ["="] | n/a |
| number 12345 as str | the earlier pseudocode said non-strings fail | [] with no error | the real run |
