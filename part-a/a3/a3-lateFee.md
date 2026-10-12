# A3: lateFee (planted bug)

Source: part-a/a3/lateFee.js. Intended behaviour: part-a/a3/intended-behaviour.md.

## How this file was written
- AI USE: the partner who planted the bug and wrote the description was an AI (12 Oct 2026). The pseudocode and traces below were created collaboratively by the author and AI.
- The real-run results come from running the real lateFee.js on 12 Oct 2026 (run during this session).
- Bug finding: I reviewed the code and the description and identified the bug (Math.ceil should round down) myself, before the partner confirmed where it was. The partner then checked my answer against its own answer key and against real runs of the function, and we agreed on the bug. We read one sentence of the description differently (see section 3).

## 1. Pseudocode: what the code ACTUALLY does

FUNCTION lateFee

INPUTS
- balance: a number, the amount owed in naira.
- daysLate: a number, how many days the payment is overdue.

OUTPUT
- A number: the late fee, rounded to the nearest 0.01 naira.

SIDE EFFECTS
- None.

FAILS WHEN
- Nothing is checked, so bad inputs give wrong answers instead of errors (real runs on balance 10,000 unless stated):
  - balance undefined or NaN: returns NaN.
  - balance null: returns 0 (null counts as 0 in arithmetic).
  - balance negative (-10,000 at 14 days): returns -400, a negative fee.
  - daysLate negative: returns 0 (it is not more than 3).
  - daysLate undefined or NaN: returns NaN.
  - daysLate null: returns 0.
  - daysLate Infinity: returns 1000 (the 10 percent cap).
  - daysLate or balance given as numeric text (for example "14"): still works, because JavaScript converts it.

STEPS
1. IF daysLate is 3 or less, RETURN 0.
2. Divide daysLate by 7 and ROUND UP to a whole number. Call it weeks.
3. Multiply weeks by 0.02 to get the rate, and limit the rate to at most 0.10.
4. Multiply balance by the rate, then round to the nearest 0.01.
5. RETURN that fee.

## 2. Pseudocode: what the description says it SHOULD do

FUNCTION lateFee (intended)

INPUTS and OUTPUT: the same as above.

SIDE EFFECTS
- None.

FAILS WHEN
- The description says nothing about negative, missing or non-number inputs.

STEPS (reading used for the expected figures in this file: the grace days are subtracted first)
1. IF daysLate is 3 or less, RETURN 0.
2. Subtract the 3 grace days: remaining = daysLate - 3.
3. Count only FULL weeks: ROUND DOWN remaining / 7. Call it weeks.
4. Rate = weeks x 0.02, limited to at most 0.10.
5. Fee = balance x rate, rounded to the nearest 0.01.
6. RETURN the fee.

## 3. Ambiguity in the description (important)
The description said: "After the grace period, the fee is 2 percent of the balance for each FULL week the payment is late." That can be read two ways:
- Reading A (used for the expected figures in this file): subtract the 3 grace days, then count full weeks: floor((daysLate - 3) / 7).
- Reading B (what the partner meant): count full weeks of lateness: floor(daysLate / 7).
Both readings agree that the code is wrong at 4 days late. They differ from 7 days onward. The planted bug is the same under both readings: Math.ceil should be Math.floor.

## 4. Side by side
| Step | Actual code | Intended |
|---|---|---|
| Grace period | RETURN 0 when daysLate is 3 or less | Same |
| Weeks | ROUND UP daysLate / 7 | ROUND DOWN (full weeks only); Reading A also subtracts 3 first |
| Rate | 2 percent per week, cap 10 percent | Same |
| Fee | balance x rate, rounded to 0.01 | Same |

First difference: the week count (step 2 of the code). It rounds UP where it should round DOWN.

## 5. Traces (balance 10,000)
| Days late | Expected (Reading A) | Expected (Reading B) | Real run of the code | Code is wrong? |
|---:|---:|---:|---:|---|
| 3 | 0 | 0 | 0 | No |
| 4 | 0 | 0 | 200 | Yes, under both readings |
| 7 | 0 | 200 | 200 | Yes under A, no under B |
| 8 | 0 | 200 | 400 | Yes, under both readings |
| 10 | 200 | 200 | 400 | Yes, under both readings |
| 14 | 200 | 400 | 400 | Yes under A, no under B |
| 40 | 1000 | 1000 | 1000 | No (both capped at 10 percent) |

Worked example, 4 days late:
- Code: 4 is more than 3. weeks = ceil(4 / 7) = 1. rate = 0.02. fee = 10,000 x 0.02 = 200.
- Intended: weeks = floor(1 / 7) = 0 (Reading A) or floor(4 / 7) = 0 (Reading B). fee = 0.
- The difference is 200, caused by rounding up a part week.

## 6. The bug
In lateFee.js the line
  const weeks = Math.ceil(daysLate / 7);
rounds a part week UP, so a payment 4 days late is charged a whole week. It should round DOWN so only full weeks count.

Fix under Reading B (the partner's intent):
  const weeks = Math.floor(daysLate / 7);
Fix under Reading A (grace days subtracted first):
  const weeks = Math.floor((daysLate - 3) / 7);
