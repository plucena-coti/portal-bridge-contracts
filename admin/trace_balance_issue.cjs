const hre = require("hardhat");
const { ethers } = hre;

const RECIPIENT = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
const CONTRACT_ADDRESS = "0x9e961430053cd5AbB3b060544cEcCec848693Cf0";

async function main() {
    console.log(`\n🔍 COMPREHENSIVE BALANCE TRACE for ${RECIPIENT}...`);
    console.log(`📍 Using USDT contract: ${CONTRACT_ADDRESS}`);

    const USDT = await ethers.getContractAt("USDT", CONTRACT_ADDRESS);

    // Get raw balance from contract
    const rawBalance = await USDT.balanceOf(RECIPIENT);
    console.log(`\n1. Raw balance from contract (BigInt): ${rawBalance.toString()}`);
    
    // Convert using ethers.formatUnits (this is what the frontend does)
    const formattedBalance = ethers.formatUnits(rawBalance, 6);
    console.log(`2. After ethers.formatUnits(balance, 6): "${formattedBalance}"`);
    console.log(`   Type: ${typeof formattedBalance}`);
    
    // Test parseFloat on the formatted balance
    const parsedFloat = parseFloat(formattedBalance);
    console.log(`3. parseFloat(formattedBalance): ${parsedFloat}`);
    console.log(`   Type: ${typeof parsedFloat}`);
    
    // Test if there are any precision issues
    console.log(`4. Is parsedFloat >= 1 billion? ${parsedFloat >= 1_000_000_000}`);
    console.log(`5. parsedFloat / 1_000_000_000 = ${parsedFloat / 1_000_000_000}`);
    
    // Test the exact division that formatBalanceWithNotation would do
    const exactValue = parsedFloat / 1_000_000_000;
    const rounded = Math.round(exactValue * 100) / 100;
    console.log(`6. Math.round(exactValue * 100) / 100 = ${rounded}`);
    
    // Test string conversion
    console.log(`7. String(formattedBalance): "${String(formattedBalance)}"`);
    console.log(`8. formattedBalance.toString(): "${formattedBalance.toString()}"`);
    
    // Check if there are any scientific notation issues
    console.log(`9. Is scientific notation? ${formattedBalance.includes('e')}`);
    
    // Test the actual formatting functions (simulate them here)
    function formatBalanceWithNotation(value) {
        console.log(`\n--- formatBalanceWithNotation input: "${value}" (${typeof value}) ---`);
        const numValue = parseFloat(String(value));
        console.log(`   parseFloat result: ${numValue}`);
        
        if (numValue === 0 || Math.abs(numValue) < 1) {
            console.log(`   Returning early (too small): ${value}`);
            return String(value);
        }
        
        const hasDecimals = String(value).includes('.') && parseFloat(String(value)) % 1 !== 0;
        console.log(`   hasDecimals: ${hasDecimals}`);
        
        if (hasDecimals) {
            console.log(`   Has decimals, would apply digit mask`);
            return String(value); // Simplified for test
        }
        
        const absValue = Math.abs(numValue);
        console.log(`   absValue: ${absValue}`);
        console.log(`   absValue >= 1_000_000_000? ${absValue >= 1_000_000_000}`);
        
        if (absValue >= 1_000_000_000) {
            const exactValue = absValue / 1_000_000_000;
            console.log(`   exactValue (billions): ${exactValue}`);
            const rounded = Math.round(exactValue * 100) / 100;
            console.log(`   rounded: ${rounded}`);
            const formatted = rounded.toString().replace(/\\.?0+$/, '');
            console.log(`   formatted: "${formatted}"`);
            return `${formatted}B`;
        }
        
        return String(value);
    }
    
    console.log(`\n=== TESTING FORMATTING ===`);
    const result = formatBalanceWithNotation(formattedBalance);
    console.log(`Final result: "${result}"`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });