// Test the fixed regex
console.log('=== Testing Fixed Regex ===');
console.log('100 with /\\.0+$/:', (100).toString().replace(/\.0+$/, ''));
console.log('100.0 with /\\.0+$/:', '100.0'.replace(/\.0+$/, ''));
console.log('100.00 with /\\.0+$/:', '100.00'.replace(/\.0+$/, ''));
console.log('100.50 with /\\.0+$/:', '100.50'.replace(/\.0+$/, ''));
console.log('1000 with /\\.0+$/:', (1000).toString().replace(/\.0+$/, ''));

// Test the full billion formatting
function testBillionFormatting(value) {
    const numValue = parseFloat(String(value));
    const absValue = Math.abs(numValue);
    const exactValue = absValue / 1_000_000_000;
    const rounded = Math.round(exactValue * 100) / 100;
    const formatted = rounded.toString().replace(/\.0+$/, '');
    return `${formatted}B`;
}

console.log('\n=== Testing Full Billion Formatting ===');
console.log('100000000000:', testBillionFormatting('100000000000'));
console.log('100000049458:', testBillionFormatting('100000049458'));
console.log('1000000000:', testBillionFormatting('1000000000'));
console.log('1500000000:', testBillionFormatting('1500000000'));