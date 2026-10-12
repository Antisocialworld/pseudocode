# A1: runJob

Source: job-queue/worker/worker.ts (line 141). Draft written from the real code. Traces are predicted by hand. The "real result" column is for the student to fill by running the code against a LOCAL database with email sending disabled.

```
FUNCTION runJob
INPUTS:
  job: a claimed job record: id, type, payload, attempts (already increased by the claim), maxAttempts, lease version
OUTPUT:
  nothing is returned. The outcome is what gets written to the job row.
SIDE EFFECTS:
  WRITE: lastHeartbeat on the job, immediately and then at every heartbeat interval while the work runs. Each beat only applies if the row is still "processing" and still at this worker's lease version.
  a real email may be sent (cannot be undone)
  WRITE, through completeAsLeaseHolder, exactly one of:
    success: status succeeded and finished time
    dead: status dead, lastError and finished time
    retry: status pending, lastError, runAt = the next retry time, startedAt cleared, lastHeartbeat cleared
  nothing is written if the send is "deferred"
  log lines
FAILS WHEN:
  the job's type is not "email": counted as a failed attempt, not a crash
  the send throws: counted as a failed attempt
  the lease was lost: the completion write is discarded and the job is flagged possibleDuplicateSend (inside completeAsLeaseHolder)
  the completion write itself throws: see the note below
STEPS:
1. START a heartbeat: write lastHeartbeat now, then repeat on a timer until the work ends. A failed beat is logged and ignored.
2. IF the job's type is not "email", treat it as a failure with the message "unknown job type: <type>" and go to step 8
3. CALL send the email job (may fail, may be slow). The result has a state: "deferred", "alreadySent" or sent.
4. STOP the heartbeat timer, whether step 3 succeeded or failed
5. IF the state is "deferred": log a warning and RETURN with no write and no retry
6. log whether it was already sent previously or was sent now
7. CALL completeAsLeaseHolder with status succeeded and a finished time, labelled "succeeded-completion". WRITE.
   IF it returns true, log "succeeded". Then RETURN.
8. ON ANY FAILURE in steps 1 to 7: take the error's message text (or the error as text), and log that this attempt failed
9. IF attempts is at least maxAttempts:
   CALL completeAsLeaseHolder with status dead, lastError = the message, finished time, labelled "dead-completion". WRITE.
   log that the job is DEAD
10. OTHERWISE:
   CALL completeAsLeaseHolder with status pending, lastError = the message, runAt = the next retry time, startedAt cleared, lastHeartbeat cleared, labelled "retry-completion". WRITE.
   IF it returns true, log that the job is scheduled for retry
   (the next retry time = now + BASE * 2 to the power of attempts + a random extra of up to 30 percent of that)
```

## Hand traces (predicted)
BASE is the base delay from config. Assume the lease is still held in every trace except where stated.

| # | kind | input | steps that run | predicted result | real result | match |
|---|------|-------|----------------|------------------|-------------|-------|
| 1 | normal | type email, attempts 1, maxAttempts 5, the send succeeds | 1, 2, 3, 4, 6, 7 | status succeeded with a finished time | status succeeded; finishedAt set; lastError null (second run, filtered output) | YES |
| 2 | edge | type email, attempts 3, maxAttempts 5, the send throws "SMTP down" | 1, 2, 3 (throws), 8, 10 | status pending, lastError "SMTP down", runAt about now + BASE x 8 (up to 30 percent more), startedAt and lastHeartbeat cleared | status pending; lastError "GMAIL_USER / GMAIL_APP_PASSWORD not set..." (not "SMTP down", because the Gmail login was blanked so no real email could be sent); runAt 43.3 s ahead on run one and 46.4 s on run two (range 40 to 52 s, so the random jitter shows); startedAt and lastHeartbeat cleared | YES (path and backoff match; error text differs by test setup) |
| 3 | edge | type email, attempts 5, maxAttempts 5, the send throws | 1, 2, 3 (throws), 8, 9 | status dead, lastError set, finished time set | status dead; lastError set (same Gmail text); finishedAt set | YES |
| 4 | invalid | type "sms", attempts 1, maxAttempts 5 | 1, 2, 8, 10 | status pending, lastError "unknown job type: sms". It will be retried until attempts run out. | status pending; lastError "unknown job type: sms" | YES |
| 5 | edge | type email, the send returns state "deferred" | 1, 2, 3, 4, 5 | no status change, a warning is logged | NOT RUN. Needs a second worker to win the EmailLog insert race | NOT RUN |

## Things to verify (predicted from the code, not tested)
- Trace 4: a job type that can never work is treated as retryable, so it uses up all its attempts before it is marked dead.
- If the success write in step 7 throws (for example a database error), the failure branch in step 8 runs after a real email was already sent. The next attempt should then find the send already recorded ("alreadySent"), which is what that state is for.
- The retry log line prints the current time, not the scheduled runAt, so its wording ("scheduled for retry at") does not match the time it prints.
