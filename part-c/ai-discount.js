async function applyDiscountCode(code, userId, orderTotal, deps = {}) {
    // Step 1: Validate order total is positive
    if (orderTotal <= 0) {
        return { error: "Order total must be more than zero" };
    }

    // Resolve dependencies (supports injection via deps or globals in environment)
    const lookupCodeRecord =
        deps.lookupCodeRecord ||
        (typeof globalThis.lookupCodeRecord === "function" ? globalThis.lookupCodeRecord : null);
    const getUserCodeUsageCount =
        deps.getUserCodeUsageCount ||
        deps.getUsageCount ||
        (typeof globalThis.getUserCodeUsageCount === "function" ? globalThis.getUserCodeUsageCount : null);
    const saveUseRecord =
        deps.saveUseRecord ||
        deps.writeUseRecord ||
        (typeof globalThis.saveUseRecord === "function" ? globalThis.saveUseRecord : null);

    // Step 2: Look up the code's record
    let codeRecord;
    try {
        if (!lookupCodeRecord) {
            throw new Error("Lookup code record service unavailable");
        }
        codeRecord = await lookupCodeRecord(code);
    } catch (err) {
        return { error: "Something went wrong, please retry" };
    }

    // Step 3: Check if record exists
    if (!codeRecord) {
        return { error: "No code found" };
    }

    // Step 4: Check minimum order total requirement
    if (orderTotal < 50000) {
        return { error: "Order must be at least 50,000" };
    }

    // Step 5: Look up customer's usage count for this code
    let usageCount;
    try {
        if (!getUserCodeUsageCount) {
            throw new Error("User usage count service unavailable");
        }
        usageCount = await getUserCodeUsageCount(userId, code);
    } catch (err) {
        return { error: "Something went wrong, please retry" };
    }

    // Step 6: Verify usage count limit (limit: 2 uses per customer)
    if (usageCount >= 2) {
        return { error: "Code can only be used twice" };
    }

    // Step 7: Work out discount amount (20%, kobo kept)
    const discountAmount = Math.round(orderTotal * 0.20 * 100) / 100;

    // Step 8: Work out new total
    const newTotal = Math.round((orderTotal - discountAmount) * 100) / 100;

    // Step 9: Save use record
    try {
        if (!saveUseRecord) {
            throw new Error("Save use record service unavailable");
        }
        const saveResult = await saveUseRecord(code, userId);
        if (saveResult && (saveResult.refused || saveResult.error === "Code can only be used twice")) {
            return { error: "Code can only be used twice" };
        }
    } catch (err) {
        if (
            err &&
            (err.refused ||
                err.message === "Code can only be used twice" ||
                err.code === "LIMIT_REACHED")
        ) {
            return { error: "Code can only be used twice" };
        }
        return { error: "Something went wrong, please retry" };
    }

    // Step 10: Return discount amount and new total
    return {
        discountAmount,
        newTotal
    };
}
