// A3 function. Bug planted by the A3 partner (an AI).
// Task: write pseudocode for what this code ACTUALLY does,
// then pseudocode for what a3/intended-behaviour.md says it SHOULD do.
// The difference between the two is the bug.

function lateFee(balance, daysLate) {
  if (daysLate <= 3) {
    return 0;
  }
  const weeks = Math.ceil(daysLate / 7);
  const rate = Math.min(weeks * 0.02, 0.10);
  return Math.round(balance * rate * 100) / 100;
}

module.exports = { lateFee };
