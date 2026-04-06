// Test the digit mask issue
function applyDigitMask(formattedValue) {
  // Count only digits (excluding commas, dots, and signs)
  const digitCount = formattedValue.replace(/[^0-9]/g, '').length;
  
  console.log(`Input: ${formattedValue}, Digit count: ${digitCount}`);
  
  // If 10 digits or fewer, return as is
  if (digitCount <= 10) {
    return formattedValue;
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

function addThousandsSeparators(value) {
  let [integerPart, decimalPart] = String(value).split('.');
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
}

// Test with our balance
const balance = "100000049458";
console.log('Original balance:', balance);

const withSeparators = addThousandsSeparators(balance);
console.log('With separators:', withSeparators);

const masked = applyDigitMask(withSeparators);
console.log('After digit mask:', masked);

// Test parseFloat on the masked value
console.log('parseFloat of masked:', parseFloat(masked));