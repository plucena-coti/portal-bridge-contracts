// Test the balance formatting pipeline
const { formatTokenBalanceDisplay, formatBalanceWithNotation } = require('./src/lib/utils.ts');

// Simulate the actual balance we got from the contract
const rawBalance = "100000049458.0"; // This is what ethers.formatUnits(balance, 6) returns

console.log('Raw balance from contract:', rawBalance);

// This is what formatTokenBalanceDisplay does
const displayBalance = formatTokenBalanceDisplay('USDT', rawBalance);
console.log('After formatTokenBalanceDisplay:', displayBalance);

// This is what formatBalanceWithNotation does
const finalDisplay = formatBalanceWithNotation(displayBalance);
console.log('After formatBalanceWithNotation:', finalDisplay);

// Let's also test the direct path
const directDisplay = formatBalanceWithNotation(rawBalance);
console.log('Direct formatBalanceWithNotation:', directDisplay);