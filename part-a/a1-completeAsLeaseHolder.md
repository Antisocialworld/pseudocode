# A1: completeAsLeaseHolder

Source: job-queue/worker/worker.ts (line 56). Draft written from the real code. Traces are predicted by hand from the code. The "real result" column is for the student to fill by running the code.

```
FUNCTION completeAsLeaseHolder
INPUTS:
  job: a claimed job record: its id and the lease version this worker was given when it claimed the job
  data: the fields to write onto the job (for example status and finished time)
  what: text, a label used in the log ("succeeded-completion", "dead-completion" or "retry-completion")
OUTPUT:
  true if the write took effect
  false if the lease was lost and nothing was written
SIDE EFFECTS:
  WRITE: data is written onto the job row, only if the row still has this worker's lease version
  if the lease was lost: the job is flagged possibleDuplicateSend = true (inside reportLeaseRejection) and warnings are logged
FAILS WHEN:
  the update call itself throws: this function does not catch it, so the error goes to the caller
  the lease was lost: not an error. The function returns false.
STEPS:
1. CALL update every job row where the id equals the job's id AND the lease version equals the job's lease version, setting data (may fail, may be slow). WRITE. Note how many rows changed.
2. IF the number of rows changed is 0:
   a. CALL reportLeaseRejection with the job, this worker's instance id, what, and the reason "expected leaseVersion <N>, row no longer at that version" (it never throws: it catches and logs its own errors)
   b. RETURN false
3. RETURN true

INSIDE reportLeaseRejection (called in step 2a):
  i.   CALL read the job's current leaseVersion, status, attempts and workerInstanceId (may fail)
  ii.  CALL flagPossibleDuplicateSend: log a loud warning, then WRITE possibleDuplicateSend = true on the job row. lastError is left alone.
  iii. log that the completion was DISCARDED
  iv.  IF anything in i to iii throws, log the error and carry on (nothing escapes)
```

## Hand traces (predicted)

| # | kind | input | steps that run | predicted result | real result | match |
|---|------|-------|----------------|------------------|-------------|-------|
| 1 | normal | job id J1 with lease version 3; the row is still at lease version 3; data = status succeeded | 1, 3 | returns true; the row now has status succeeded | returned true; status succeeded; possibleDuplicateSend false | YES |
| 2 | edge | job id J1 with lease version 3; the row is now at lease version 4 (another worker reclaimed it); data = status succeeded | 1, 2, then reportLeaseRejection i to iii | returns false; status NOT changed; possibleDuplicateSend becomes true | returned false; status stayed processing; possibleDuplicateSend became true; loud warning and "DISCARDED" logged | YES |
| 3 | invalid | job id J9 that does not exist | 1, 2, reportLeaseRejection: i finds nothing, ii tries to update a missing row and throws, iv catches it | returns false; nothing written; an error is logged | returned false; warning logged, then prisma.job.update threw "No record was found for an update", caught inside reportLeaseRejection ("failed to record lease rejection"); nothing escaped | YES |

## Notes from reading the code (to verify)
- Prediction 3 depended on Prisma's update throwing when the row does not exist. Tested on 12 Oct 2026 against the local test database: it does throw, and reportLeaseRejection catches it.
- Real results came from tests/a1-real-run.test.ts (local database only, Gmail login blanked, worker.ts unchanged).
- In runJob, a throw from this function inside the success path is caught by runJob's own catch, which then runs the retry or dead branch. See a1-runJob.md.
