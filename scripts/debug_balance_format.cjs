const { formatBalanceWithNotation } = require('../src/lib/utils.ts');

// Test the formatting function with 100 billion
const testValue = "100000000000";
console.log(`Input: ${testValue}`);
console.log(`Formatted: ${formatBalanceWithNotation(testValue)}`);

// Test with other values
console.log(`\nOther test values:`);
console.log(`1B: ${formatBalanceWithNotation("1000000000")}`);
console.log(`10B: ${formatBalanceWithNotation("10000000000")}`);
console.log(`100B: ${formatBalanceWithNotation("100000000000")}`);
console.log(`1T: ${formatBalanceWithNotation("1000000000000")}`);