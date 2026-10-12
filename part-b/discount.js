// ---- stand-ins for the database (steps 2, 5, 9) ----
const codes = { "500": "valid" };
const uses = [];
let failCountLookup = false; // test switch for trace 6 only

function lookUpCode(code) {
    return codes[code];
}

function countUses(code, userId) {
    if (failCountLookup) {
        throw new Error("look-up failed");
    }
    let count = 0;
    for (const use of uses) {
        if (use.code === code && use.userId === userId) {
            count++;
        }
    }
    return count;
}

// stand-in for the database guard: refuses a 3rd use
function saveUse(code, userId) {
    if (countUses(code, userId) >= 2) {
        return false;
    }
    uses.push({ code: code, userId: userId });
    return true;
}

// ---- the function ----
function applyDiscountCode(code, userId, orderTotal) {
    // step 1
    if (orderTotal <= 0) {
        return "Order total must be more than zero";
    }

    // step 2
    let record;
    try {
        record = lookUpCode(code);
    } catch (e) {
        return "Something went wrong, please retry";
    }

    // step 3
    if (record === undefined) {
        return "No code found";
    }

    // step 4
    if (orderTotal < 50000) {
        return "Order must be at least 50,000";
    }

    // step 5
    let count;
    try {
        count = countUses(code, userId);
    } catch (e) {
        return "Something went wrong, please retry";
    }

    // step 6
    if (count === 2) {
        return "Code can only be used twice";
    }

    // step 7
    const discount = Math.round(orderTotal * 0.2 * 100) / 100;

    // step 8
    const newTotal = Math.round((orderTotal - discount) * 100) / 100;

    // step 9
    try {
        const saved = saveUse(code, userId);
        if (!saved) {
            return "Code can only be used twice";
        }
    } catch (e) {
        return "Something went wrong, please retry";
    }

    // step 10
    return { discount: discount, newTotal: newTotal };
}

// ---- the 6 traces ----
function test(name, setup, code, userId, total, expected) {
    uses.length = 0;
    failCountLookup = false;
    setup();
    const result = applyDiscountCode(code, userId, total);
    const got = typeof result === "string" ? result : JSON.stringify(result);
    console.log(name, got === expected ? "MATCH" : "MISMATCH", "|", got);
}

test("1 normal      ", () => { }, "500", "U1", 100000, '{"discount":20000,"newTotal":80000}');
test("2 used twice  ", () => { uses.push({ code: "500", userId: "U1" }, { code: "500", userId: "U1" }); }, "500", "U1", 60000, "Code can only be used twice");
test("3 below min   ", () => { }, "500", "U2", 49000, "Order must be at least 50,000");
test("4 negative    ", () => { }, "500", "U2", -2000, "Order total must be more than zero");
test("5 wrong code  ", () => { }, "999", "U2", 70000, "No code found");
test("6 look-up fail", () => { failCountLookup = true; }, "500", "U2", 70000, "Something went wrong, please retry");
