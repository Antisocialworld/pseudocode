# B2: trace vs test

| # | Case | Input | Trace result (B1) | Test result (node) | Match |
|---|------|-------|-------------------|--------------------|-------|
| 1 | normal | "500", U1, 100,000 | 20,000.00 and 80,000.00 | {"discount":20000,"newTotal":80000} | yes (same numbers, different display) |
| 2 | used twice | "500", U1 (2 earlier uses), 60,000 | Code can only be used twice | Code can only be used twice | yes |
| 3 | below minimum | "500", U2, 49,000 | Order must be at least 50,000 | Order must be at least 50,000 | yes |
| 4 | negative | "500", U2, -2,000 | Order total must be more than zero | Order total must be more than zero | yes |
| 5 | wrong code | "999", U2, 70,000 | No code found | No code found | yes |
| 6 | look-up fails | "500", U2, 70,000, step 5 fails | Something went wrong, please retry | Something went wrong, please retry | yes |

Notes:
- Database replaced by an object (codes) and an array (uses). Step 9's guard is an in-memory re-check.
- Trace 6 uses a test switch (failCountLookup) to make step 5 fail.