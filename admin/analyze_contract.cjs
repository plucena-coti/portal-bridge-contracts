const hre = require("hardhat");
const { ethers } = hre;

const TARGET_ADDRESS = "0x639aCc80569c5FC83c6FBf2319A6Cc38bBfe26d1";

// Function Selectors for WETH9
const DEPOSIT_SELECTOR = "0xd0e30db0"; // deposit()
const WITHDRAW_SELECTOR = "0x2e1a7d4d"; // withdraw(uint256)

async function main() {
    console.log(`Analyzing contract at: ${TARGET_ADDRESS}`);
    const code = await ethers.provider.getCode(TARGET_ADDRESS);

    if (code === "0x") {
        console.error("❌ No code found at this address. It is an EOA or undeployed contract.");
        process.exit(0);
    }
    console.log(`✅ Code found (${code.length} bytes).`);

    // Basic heuristic: Check if selectors exist in bytecode
    const hasDeposit = code.includes(DEPOSIT_SELECTOR.replace("0x", ""));
    const hasWithdraw = code.includes(WITHDRAW_SELECTOR.replace("0x", ""));

    console.log(`\nHeuristic Analysis:`);
    console.log(`   - Has 'deposit()' selector?        ${hasDeposit ? "YES ✅" : "NO ❌"}`);
    console.log(`   - Has 'withdraw(uint256)' selector? ${hasWithdraw ? "YES ✅" : "NO ❌"}`);

    if (hasDeposit && hasWithdraw) {
        console.log("\n✅ CONCLUSION: This contract appears to be a functional WETH-like contract.");
    } else {
        console.warn("\n⚠️ CONCLUSION: This implementation is missing standard WETH function signatures.");
    }

    try {
        const contract = new ethers.Contract(TARGET_ADDRESS, [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
        ], ethers.provider);

        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();

        console.log(`\nMetadata:`);
        console.log(`   - Name:     ${name}`);
        console.log(`   - Symbol:   ${symbol}`);
        console.log(`   - Decimals: ${decimals}`);
    } catch (e) {
        console.warn("\nCould not read full metadata (might not be an ERC20 or view failed).");
    }
}

main().catch(console.error);
