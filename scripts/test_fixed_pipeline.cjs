// Test the fixed digit mask issue
function applyDigitMask(formattedValue) {
  // Count only digits (excluding commas, dots, and signs)
  const digitCount = formattedValue.replace(/[^0-9]/g, '').length;
  
  console.log(`Input: ${formattedValue}, Digit count: ${digitCount}`);
  
  // If 10 digits or fewer, return as is
  if (digitCount <= 10) {
    return formattedValue;
  }
  
  // For large whole numbers that will be formatted with B/T notation, don't mask them
  // This allows formatBalanceWithNotation to work properly
  const numValue = parseFloat(formattedValue.replace(/,/g, ''));
  if (!isNaN(numValue) && numValue >= 1_000_000 && !formattedValue.includes('.')) {
    return formattedValue; // Let formatBalanceWithNotation handle it
  }
  
  // Extract sign if present
  const sign = formattedValue.startsWith('-') ? '-' : '';
  const valueWithoutSign = formattedValue.replace(/^-/, '');
  
  // Find the first 10 digits and their positions
  let digitsSeen = 0;
  let truncateIndex = 0;
  
  for (let i = 0; i < valueWithoutSign.length; i++) {
    if (/[0-9]/.test(valueWithoutSign[i])) {
      digitsSeen++;
      if (digitsSeen === 10) {
        truncateIndex = i + 1;
        break;
      }
    }
  }
  
  // Truncate and add ellipsis
  const truncated = valueWithoutSign.substring(0, truncateIndex);
  return `${sign}${truncated}...`;
}

function formatBalanceWithNotation(value) {
  const numValue = parseFloat(String(value).replace(/,/g, ''));
  
  // If the number is 0 or very small, return as is
  if (numValue === 0 || Math.abs(numValue) < 1) {
    return value;
  }
  
  // Check if the number has decimal places (cents)
  const hasDecimals = String(value).includes('.') && parseFloat(String(value).replace(/,/g, '')) % 1 !== 0;
  
  // If it has decimals, use regular formatting
  if (hasDecimals) {
    return applyDigitMask(value);
  }
  
  // For round numbers, use M, B, T notation only
  const absValue = Math.abs(numValue);
  const sign = numValue < 0 ? '-' : '';
  
  if (absValue >= 1_000_000_000_000) {
    // Trillions - show up to 2 decimal places, but don't truncate unnecessarily
    const exactValue = absValue / 1_000_000_000_000;
    const rounded = Math.round(exactValue * 100) / 100;
    const formatted = rounded.toString().replace(/\\.?0+$/, '');
    return `${sign}${formatted}T`;
  } else if (absValue >= 1_000_000_000) {
    // Billions - show up to 2 decimal places, but don't truncate unnecessarily
    const exactValue = absValue / 1_000_000_000;
    const rounded = Math.round(exactValue * 100) / 100;
    const formatted = rounded.toString().replace(/\\.?0+$/, '');
    return `${sign}${formatted}B`;
  } else if (absValue >= 1_000_000) {
    // Millions - show up to 2 decimal places, but don't truncate unnecessarily
    const exactValue = absValue / 1_000_000;
    const rounded = Math.round(exactValue * 100) / 100;
    const formatted = rounded.toString().replace(/\\.?0+$/, '');
    return `${sign}${formatted}M`;
  }
  
  // For numbers less than 1 million, return as is with separators and digit mask
  return applyDigitMask(value);
}

function addThousandsSeparators(value) {
  let [integerPart, decimalPart] = String(value).split('.');
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
}

// Test with our balance
const balance = "100000049458";
console.log('\\n=== Testing the full pipeline ===');
console.log('1. Original balance:', balance);

const withSeparators = addThousandsSeparators(balance);
console.log('2. With separators:', withSeparators);

const masked = applyDigitMask(withSeparators);
console.log('3. After digit mask:', masked);

const final = formatBalanceWithNotation(masked);
console.log('4. Final display:', final);

console.log('\\n=== Direct test ===');
const direct = formatBalanceWithNotation(balance);
console.log('Direct formatBalanceWithNotation:', direct);