# C3, ten input comparison (my code against the AI code)

Inputs 1 to 5 are the traced inputs. Inputs 6 to 10 are new: exactly 50,000; a third use; 50,000.55; zero total; 75,000.33.

Results: All ten inputs gave the same result.

Findings: Input 7 (3 earlier uses): both implementations blocked it. Mine blocked it at step 9, because the save refuses at 2 or more uses, not at step 6, which only checks for exactly 2. Input 10 (75,000.33) first DIFFERED: before the fix mine gave 15000.066 and 60000.264, and the AI gave 15000.07 and 60000.26. The pseudocode said "kobo kept" and never said to round, so it was ambiguous. A payment cannot contain a fraction of a kobo, so the AI's rounding was the only valid result. The pseudocode was fixed to say round to the nearest 0.01 naira, and the code was updated. After the fix all ten inputs gave the same result.