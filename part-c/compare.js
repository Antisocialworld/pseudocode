const fs = require("fs");
const path = require("path");

function load(file, returnExpr) {
    const src = fs.readFileSync(path.join(__dirname, file), "utf8");
    return new Function(src + "\n;return " + returnExpr + ";")();
}

// silence each file's own test output while loading
const realLog = console.log;
console.log = () => { };
const mine = load("../part-b/discount.js", "{ applyDiscountCode, uses, reset() { failCountLookup = false; } }");
const aiFn = load("ai-discount.js", "applyDiscountCode");
console.log = realLog;

const cases = [
    { n: 1, name: "normal", code: "500", user: "U1", total: 100000, prior: 0 },
    { n: 2, name: "used twice", code: "500", user: "U1", total: 60000, prior: 2 },
    { n: 3, name: "below minimum", code: "500", user: "U2", total: 49000, prior: 0 },
    { n: 4, name: "negative", code: "500", user: "U2", total: -2000, prior: 0 },
    { n: 5, name: "wrong code", code: "999", user: "U2", total: 70000, prior: 0 },
    { n: 6, name: "exactly 50,000", code: "500", user: "U3", total: 50000, prior: 0 },
    { n: 7, name: "third use", code: "500", user: "U1", total: 60000, prior: 3 },
    { n: 8, name: "kobo 50000.55", code: "500", user: "U3", total: 50000.55, prior: 0 },
    { n: 9, name: "zero total", code: "500", user: "U3", total: 0, prior: 0 },
    { n: 10, name: "odd kobo", code: "500", user: "U4", total: 75000.33, prior: 0 },
];

async function run(c) {
    // your implementation
    mine.reset();
    mine.uses.length = 0;
    for (let i = 0; i < c.prior; i++) mine.uses.push({ code: c.code, userId: c.user });
    const r = mine.applyDiscountCode(c.code, c.user, c.total);
    const m = typeof r === "string" ? { error: r } : { discountAmount: r.discount, newTotal: r.newTotal };

    // AI implementation, with stand-in helpers
    const aiUses = [];
    for (let i = 0; i < c.prior; i++) aiUses.push({ code: c.code, userId: c.user });
    const deps = {
        lookupCodeRecord: async (code) => (code === "500" ? "valid" : undefined),
        getUserCodeUsageCount: async (userId, code) =>
            aiUses.filter((u) => u.code === code && u.userId === userId).length,
        saveUseRecord: async (code, userId) => { aiUses.push({ code, userId }); return {}; },
    };
    const a = await aiFn(c.code, c.user, c.total, deps);

    const same = JSON.stringify(m) === JSON.stringify(a);
    console.log(c.n, c.name, same ? "SAME" : "DIFFER");
    console.log("   mine:", JSON.stringify(m));
    console.log("   ai:  ", JSON.stringify(a));
}

(async () => { for (const c of cases) await run(c); })();