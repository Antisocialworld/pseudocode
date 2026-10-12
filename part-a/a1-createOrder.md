# A1: create order (POST)

Source: APE-P-I/src/app/api/v1/orders/route.ts, function POST. Draft written from the real code. Traces are predicted by hand. The "real result" column is for the student to fill by running the code against the LOCAL dev server only.

```
FUNCTION createOrder (the POST handler)
INPUTS:
  request: an HTTP request that carries:
    client address: the first entry of the x-forwarded-for header, otherwise the x-real-ip header, otherwise 127.0.0.1
    body: JSON text that should contain:
      restaurantId: text, the restaurant being ordered from
      customerId: text, the customer placing the order
      items: list of { menuItemId: text, quantity: number }
      status: text, optional (default "PENDING")
OUTPUT:
  on success: HTTP 201 with { data: the new order, including its items }
  on failure: HTTP error status with { error: { code, message } }
SIDE EFFECTS:
  WRITE: the request is counted against the rate limit for the client address, on EVERY request, including ones that fail later
  WRITE: on success only, one order row and one row per item are created
FAILS WHEN:
  the rate limit is exceeded (429, also sends a Retry-After header)
  the body is not valid JSON (400)
  restaurantId, customerId or items is missing or falsy (422)
  items is not a list, or is an empty list (422)
  no restaurant has that id (404)
  no customer has that id (404)
  an item has a missing or falsy menuItemId or quantity (422)
  a menu item id does not exist (404)
  a menu item belongs to a different restaurant (400)
  any database call throws: not caught here, so the framework's generic server error applies (inference, not tested)
STEPS:
1. CALL check the rate limit for the client address (may fail, may be slow). WRITE: counts this request.
   IF not allowed RETURN 429 RATE_LIMITED "Too many requests", with a Retry-After header
2. CALL read the body as JSON (may fail)
   IF it fails RETURN 400 BAD_REQUEST "Invalid JSON body"
3. work out which of restaurantId, customerId, items are missing or falsy
   IF there are any RETURN 422 UNPROCESSABLE_ENTITY "Missing required field: " followed by the names joined with ", "
4. IF items is not a list, or is a list with no entries
   RETURN 422 UNPROCESSABLE_ENTITY "Field 'items' must be a non-empty array"
5. CALL look up the restaurant by restaurantId (may fail, may be slow)
   IF none found RETURN 404 NOT_FOUND "Restaurant not found"
6. CALL look up the customer by customerId (may fail, may be slow)
   IF none found RETURN 404 NOT_FOUND "Customer not found"
7. FOR EACH item in order, with no database calls:
   IF the item's menuItemId is falsy OR its quantity is falsy
   RETURN 422 UNPROCESSABLE_ENTITY "Each item must have 'menuItemId' and 'quantity'"
   (the first bad item stops the loop)
8. set total to 0, and set priced items to an empty list
9. FOR EACH item in order:
   a. CALL look up the menu item by menuItemId (may fail, may be slow)
      IF none found RETURN 404 NOT_FOUND "MenuItem '<menuItemId>' not found"
   b. IF the menu item's restaurant is not restaurantId
      RETURN 400 BAD_REQUEST "MenuItem '<menuItemId>' does not belong to this restaurant"
   c. work out item total = the menu item's price times the item's quantity, and add it to total
   d. add { menuItemId, quantity, price = the menu item's current price } to priced items
10. CALL create the order (may fail, may be slow). WRITE: restaurantId, customerId, status (the body's status if it is truthy, otherwise "PENDING"), total, and one item row for each priced item, in one create.
11. RETURN 201 with { data: the order with its items }
```

## Hand traces (predicted)
Assume: restaurant R1 and customer C1 exist; menu item M1 (price 1500) and M2 (price 2000) belong to R1; menu item M9 (price 900) belongs to R2. The client is under the rate limit.

| # | kind | input body | steps that run | predicted result | real result | match |
|---|------|-----------|----------------|------------------|-------------|-------|
| 1 | normal | R1, C1, items [{M1, 2}, {M2, 1}] | 1 to 11 | 201; total 5000; status PENDING; 2 item rows | 201; total 5000; status PENDING; 2 item rows; 1 order created | YES |
| 2 | edge | R1, C1, items [{M1, -3}] | 1 to 11 (a negative number is truthy, so step 7 passes) | 201; total -4500; an order with a negative total is created | 201; total -4500; 1 item row; 1 order created (a negative-total order was saved) | YES |
| 3 | invalid | R1, C1, items [{M9, 1}] | 1 to 9a, stops at 9b | 400 "MenuItem 'M9' does not belong to this restaurant"; nothing created | 400 "MenuItem '<id of M9>' does not belong to this restaurant"; 0 orders created | YES |
| 4 | invalid | R1, C1, items [{M1, 0}] | 1 to 7 | 422 "Each item must have 'menuItemId' and 'quantity'" (zero is falsy) | 422 "Each item must have 'menuItemId' and 'quantity'"; 0 orders created | YES |
| 5 | invalid | body text is not JSON | 1, 2 | 400 "Invalid JSON body" | 400 "Invalid JSON body"; 0 orders created | YES |

## Extra trace T6 (not in the original five)
Body: R1, C1, items [{M1, quantity "abc"}] (text quantity, which is truthy so step 7 passes).
Predicted: total becomes NaN. Real: the handler threw an error instead of returning a response (the last line of the error was "Argument `restaurant` is missing."), and 0 orders were created. My test only kept the last line of the error, so the exact reason Prisma rejected it is not recorded. What is confirmed: a text quantity passes the check in step 7 and then crashes the handler, because nothing catches it. The NaN part of the prediction is consistent with this but was not directly observed.

## Real-run notes
Run on 12 Oct 2026 against the local database (localhost:5433) with tests/a1-order-real-run.test.ts, which calls the real POST handler directly. The test file and its rows were created collaboratively by the author and AI. Nothing was sent to the live site.

## Things the traces should settle (predicted from the code, to verify)
- Trace 2: quantity is only checked for being truthy, so negative, fractional or text quantities pass step 7. A text quantity such as "abc" would make the total NaN. Test it.
- The status in the body is stored as given, with no check against a list of valid statuses.
- Step 1 counts the request even when it fails later.

## How to run the real result (local only, never production)
Start the local dev server (port 3001) and use ids from your local seed:
```
curl -i -X POST http://localhost:3001/api/v1/orders -H "Content-Type: application/json" -d "{\"restaurantId\":\"R1\",\"customerId\":\"C1\",\"items\":[{\"menuItemId\":\"M1\",\"quantity\":2}]}"
```
Replace R1, C1 and M1 with real ids. Do not run these against the live ape-p-i.vercel.app site: they write real orders.
