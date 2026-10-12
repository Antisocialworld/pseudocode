# Pseudocode Project

## What this is
This is the Pseudocoding task. Part A, Part B and Part C are done. The C4 recording is still to do.

## Authorship
This work was completed collaboratively by the author and AI. Individual documents keep their own record of which parts were drafted with AI and which parts were predicted, reviewed or run by hand, so the split of work stays visible.

## The pseudocode standard I used
Every function has a header with FUNCTION, INPUTS (type and meaning), OUTPUT, SIDE EFFECTS and FAILS WHEN. Then numbered steps with one check per step follow. External calls are marked as able to fail and be slow. State changes are marked WRITE. Every early exit returns a named error message. Inputs are only what the caller passes in. Rules and numbers such as 50,000, 20 percent and the limit of 2 live in the steps.

## Repository layout
- `part-a/` - Part A: nine files of pseudocode and hand traces covering eight functions (A1 two job-queue functions plus the order POST handler, A2 four nodemailer functions, A3 the planted-bug `lateFee` function and its intended behaviour).
- `part-b/` - Part B: the discount-code pseudocode, the JavaScript implementation and the trace-versus-test comparison.
- `part-c/` - Part C: the reverse-engineered pseudocode, the difference table, the ten-input comparison and the scripts that run it.
- `study/` and `_removed-not-for-submission/` - local working notes. Both are listed in `.gitignore` and are not part of the submission.

## Part B
The feature is a discount code (applyDiscountCode). Rules: code must exist; order total must be at least 50,000, measured before the discount; 20 percent off; a customer can use the code twice; no date expiry. The code uses an object and an array as stand ins for the database, so steps 2, 5 and 9 are simulated in memory. There are six hand traces, all matching the test output.

## Part C, what the AI implementation did differently
From the difference table: it added an optional fourth input for replacement helper functions, with extra name aliases and global fallbacks; it treated a missing helper as a failure; it returned objects for results and errors; it was async; it treated any falsy record as "not found"; it used "2 or more" where my step 6 says "is 2"; it rounded money to 0.01; it recognised a refusal on save in four different ways.
The return format, what counts as found, rounding, and how a refusal is signalled were ambiguities in my pseudocode. The fourth input with name aliases and global fallbacks, and treating a missing helper as a failure, were additions. No step or message was omitted.

## What I learned about the gap between spec and output
I learned from the two real results. First, the rounding gap where input 10 differed, traced to the pseudocode never saying to round, fixed in the pseudocode. Second, the guard at step 9 where input 7 was blocked there even though step 6 checks only for exactly 2.

## Honest disclosures
The C1 run was not clean: the agent listed the user's folder and searched the web using exact phrases from the pseudocode, and what it found is unknown. The reverse pseudocode (C2) and difference table were drafted, and the reverse pseudocode was not written blind, because the person drafting it had already seen the original.

## Requirements
- Node.js. The commands below were verified on Node v24.16.0.
- No install step: there is no `package.json` and no dependency to download.
- No environment variables, no database, no external service and no credentials are needed to run anything in this repository.

## How to run it
Run these from the repo root:

```
node part-b/discount.js
node part-c/compare.js
node -e "console.log(require('./part-a/a3/lateFee.js').lateFee(10000, 4))"
```

No install step is needed beyond Node.

## Expected results
- `part-b/discount.js` prints six lines, one per hand trace, each ending in `MATCH`.
- `part-c/compare.js` prints ten numbered cases (`1 normal` to `10 odd kobo`), each marked `SAME`, with a `mine:` and an `ai:` line under it.
- The A3 one-liner prints `200` (10,000 naira, 4 days late). With `40` in place of `4` it prints `1000`.

Both scripts work from the repo root. `part-c/compare.js` loads its input files relative to its own location, so it also works when called from inside `part-c/`, and `part-b/discount.js` also runs from inside `part-b/`.

## What needs something outside this repository
The Part A documents are pseudocode written against code that lives in other projects (`APE-P-I`, `job-queue` and `nodemailer`). They are read-only documents. The "how to run the real result" notes inside them refer to a local setup of those other projects and are not required to read, build or test anything in this repository.

## Common setup problems
- `node is not recognised` - Node.js is not installed, or the shell needs restarting after installing it.
- A file-not-found error from `part-c/compare.js` means `part-b/discount.js` or `part-c/ai-discount.js` is missing; both are required and both ship with this repository.
- Nothing here reads a `.env` file, so a missing environment file is never the cause of a failure.

## Still to do
Still to do are the C4 recording, the non coder test, and the post.
