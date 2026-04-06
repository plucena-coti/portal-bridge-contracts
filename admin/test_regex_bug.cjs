// Test the regex issue
const rounded = 100;
console.log('rounded:', rounded);
console.log('rounded.toString():', rounded.toString());

// Test the problematic regex
const formatted = rounded.toString().replace(/\.?0+$/, '');
console.log('after regex:', formatted);

// Test what the regex is actually matching
const str = rounded.toString();
const match = str.match(/\.?0+$/);
console.log('regex match:', match);

// Test with different approaches
console.log('Test 1 - 100:', (100).toString().replace(/\.?0+$/, ''));
console.log('Test 2 - 100.0:', (100.0).toString().replace(/\.?0+$/, ''));
console.log('Test 3 - 100.00:', '100.00'.replace(/\.?0+$/, ''));
console.log('Test 4 - 1000:', (1000).toString().replace(/\.?0+$/, ''));

// The correct regex should only remove trailing zeros after a decimal point
const correctRegex = /\.0+$|(?<=\.\d*?)0+$/;
console.log('Correct approach - 100:', (100).toString().replace(/\.0+$/, ''));
console.log('Correct approach - 100.0:', '100.0'.replace(/\.0+$/, ''));
console.log('Correct approach - 100.50:', '100.50'.replace(/\.?0+$/, ''));