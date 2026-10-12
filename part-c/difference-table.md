# C2: difference table (B1 pseudocode vs reverse-engineered AI code)

| # | Step | B1 says | AI code does | Label |
|---|------|---------|--------------|-------|
| 1 | inputs | 3 inputs | takes a 4th, optional input deps (replacement helper functions) | added (unasked) |
| 2 | before step 2 | nothing | picks helpers from deps, alternative names (getUsageCount, writeUseRecord), then global functions | added (unasked) |
| 3 | all returns | "error message (text)"; "discount amount and new total" | returns objects: { error } or { discountAmount, newTotal } | interpreted differently (B1 never states the return format) |
| 4 | function | steps marked "may be slow" | function is async and returns a promise | interpreted differently (B1 does not say how to wait) |
| 5 | steps 2, 5, 9 | look-up or save fails: retry message | same, and also a missing helper counts as a failure | added (a case B1 never had) |
| 6 | step 3 | IF no record found | IF the record is falsy (null, undefined, 0, "", false) | interpreted differently (B1 does not define "found") |
| 7 | step 6 | IF that count is 2 | IF count >= 2 | interpreted differently (B1 relies on the count never passing 2) |
| 8 | steps 7, 8 | 20 percent, "kobo kept" | rounds both numbers to the nearest 0.01 | interpreted differently (B1 does not say to round) |
| 9 | step 9 | IF refused RETURN "Code can only be used twice" | recognises a refusal four ways: result.refused, result.error text, err.refused, err.code === "LIMIT_REACHED" (and err.message text) | interpreted differently (B1 does not say how a refusal shows up) + added (LIMIT_REACHED is invented) |
| 10 | step 9 | save fails otherwise: retry message | same | matches |
| 11 | steps 1 to 5, 10 | the error texts and the order of checks | same | matches |

Omitted: none found. Every B1 step and every B1 message is present.

## Ambiguities in my own B1, with the fix
1. Return format: add to OUTPUT "success: an object with discount amount and new total; failure: an object with an error message".
2. Rounding: add to steps 7 and 8 "round to the nearest 0.01 naira" (or "do not round").
3. "Found": step 3 becomes "IF no record is returned (nothing, not even an empty one)".
4. Step 6: B1 says "is 2" and trusts the count. Decide: keep it, and state the assumption, or change to "2 or more".
5. Refusal signal: step 9 should say how the save reports a refusal, for example "the save returns refused: true".