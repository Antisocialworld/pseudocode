```
FUNCTION applyDiscountCode
INPUTS:
  code: text, the discount code the customer types
  user id: text, the customer using the code
  order total: number, the order amount in naira, before any discount
OUTPUT:
  on success: discount amount (number, naira) and new total (number, naira)
  on failure: error message (text)
SIDE EFFECTS:
  on success only: saves a use record containing the code and the user id (step 9). Nothing is saved on any failure.
FAILS WHEN:
  order total is zero or negative
  code matches no record
  order total is below 50,000
  user id has already used this code 2 times (limit: 2 uses per customer, constant)
  a look up (step 2 or 5) or the save (step 9) fails
STEPS:
1. IF order total is zero or less RETURN error: "Order total must be more than zero"
2. CALL look up the code's record (may fail, may be slow; if it fails RETURN error: "Something went wrong, please retry")
3. IF no record found RETURN error: "No code found"
4. IF order total is below 50,000 RETURN error: "Order must be at least 50,000"
5. CALL look up how many times this user id has used this code (may fail, may be slow; if it fails RETURN error: "Something went wrong, please retry")
6. IF that count is 2 RETURN error: "Code can only be used twice"
7. work out the discount amount: 20 percent of order total, rounded to the nearest 0.01 naira
8. work out the new total: order total minus discount amount, rounded to the nearest 0.01 naira
9. WRITE a use record: this code, this user id (the save is refused if this user id already has 2 records for this code; if refused RETURN error: "Code can only be used twice"; if the save fails for any other reason RETURN error: "Something went wrong, please retry", and return no discount)
10. RETURN discount amount and new total
```

HAND TRACES:
1. normal: code "500", user id "U1", order total 100,000. Steps 1 to 10. Result: 20,000.00 and 80,000.00
2. used twice: code "500", user id "U1" (2 earlier uses), order total 60,000. Steps 1 to 6. Result: "Code can only be used twice"
3. below minimum: code "500", user id "U2", order total 49,000. Steps 1 to 4. Result: "Order must be at least 50,000"
4. negative: code "500", user id "U2", order total minus 2,000. Step 1. Result: "Order total must be more than zero"
5. wrong code: code "999", user id "U2", order total 70,000. Steps 1 to 3. Result: "No code found"
6. look up fails (optional extra): code "500", user id "U2", order total 70,000, step 5 fails. Steps 1 to 5. Result: "Something went wrong, please retry"
