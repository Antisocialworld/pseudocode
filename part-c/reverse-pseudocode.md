FUNCTION applyDiscountCode
INPUTS:
  code: text - the discount code
  userId: text - the customer
  orderTotal: number - the order amount
  deps: object, optional (default: empty) - holds replacement helper functions for the look-ups and the save
OUTPUT:
  returns a promise (the function is async)
  on success: object { discountAmount: number, newTotal: number }
  on failure: object { error: text }
SIDE EFFECTS:
  step 9 calls the save-use-record helper with (code, userId). Nothing else is written.
FAILS WHEN:
  orderTotal <= 0
  the code look-up helper is missing, or throws
  the record found is falsy (null, undefined, 0, empty text, false)
  orderTotal < 50000
  the usage-count helper is missing, or throws
  usage count >= 2
  the save helper is missing, or throws something that is not a "limit" signal
  the save reports a refusal
STEPS:
1. IF orderTotal <= 0 RETURN { error: "Order total must be more than zero" }
   (non-numbers such as NaN are not rejected here)
BETWEEN 1 AND 2: choose the three helper functions:
   look-up-code: deps.lookupCodeRecord, otherwise a global function of that name, otherwise none
   usage-count: deps.getUserCodeUsageCount, otherwise deps.getUsageCount, otherwise a global function of that name, otherwise none
   save-use: deps.saveUseRecord, otherwise deps.writeUseRecord, otherwise a global function of that name, otherwise none
2. CALL look-up-code with (code), waiting for it (may fail, may be slow)
   IF the helper is missing, or it throws RETURN { error: "Something went wrong, please retry" }
3. IF the record is falsy RETURN { error: "No code found" }
4. IF orderTotal < 50000 RETURN { error: "Order must be at least 50,000" }
5. CALL usage-count with (userId, code), waiting for it (may fail, may be slow)
   IF the helper is missing, or it throws RETURN { error: "Something went wrong, please retry" }
6. IF usage count >= 2 RETURN { error: "Code can only be used twice" }
7. discountAmount = orderTotal x 0.20, rounded to the nearest 0.01
8. newTotal = (orderTotal - discountAmount), rounded to the nearest 0.01
9. WRITE: CALL save-use with (code, userId), waiting for it
   IF the helper is missing RETURN { error: "Something went wrong, please retry" }
   IF it returns a result that has refused set, or error equal to "Code can only be used twice" RETURN { error: "Code can only be used twice" }
   IF it throws, and the error has refused set, or the message "Code can only be used twice", or code "LIMIT_REACHED" RETURN { error: "Code can only be used twice" }
   IF it throws anything else RETURN { error: "Something went wrong, please retry" }
   (a returned value that does not signal refusal in those exact ways, such as false, counts as success)
10. RETURN { discountAmount, newTotal }