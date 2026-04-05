const hre = require("hardhat");
const { ethers } = hre;

const TARGET_ADDRESS = "0x639aCc80569c5FC83c6FBf2319A6Cc38bBfe26d1"; // WETH on Mainnet (Chain ID 2632500)

// Standard Proxy Storage Slots
const EIP1967_IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const EIP1967_ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
const ZEPPELIN_IMPLEMENTATION_SLOT = "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3";

async function main() {
    console.log(`Checking storage slots for: ${TARGET_ADDRESS}`);

    // Helper to read and format slot
    const checkSlot = async (name, slot) => {
        const value = await ethers.provider.getStorage(TARGET_ADDRESS, slot);
        if (value && value !== ethers.ZeroHash) {
            // value is 32 bytes, address is last 20 bytes
            const address = "0x" + value.slice(26);
            console.log(`✅ FOUND ${name}: ${address}`);
            return address;
        } else {
            console.log(`❌ ${name} is empty.`);
            return null;
        }
    };

    const impl1 = await checkSlot("EIP-1967 Implementation", EIP1967_IMPLEMENTATION_SLOT);
    await checkSlot("EIP-1967 Admin", EIP1967_ADMIN_SLOT);
    const impl2 = await checkSlot("OpenZeppelin Implementation", ZEPPELIN_IMPLEMENTATION_SLOT);

    const impl = impl1 || impl2;

    if (impl) {
        console.log(`\nAnalyzing Implementation at: ${impl}`);
        const code = await ethers.provider.getCode(impl);
        console.log(`Code size: ${code.length} bytes`);

        const DEPOSIT_SELECTOR = "d0e30db0";
        const WITHDRAW_SELECTOR = "2e1a7d4d";

        const hasDeposit = code.includes(DEPOSIT_SELECTOR);
        const hasWithdraw = code.includes(WITHDRAW_SELECTOR);

        console.log(`   - Has 'deposit()'?        ${hasDeposit ? "YES ✅" : "NO ❌"}`);
        console.log(`   - Has 'withdraw(uint256)'? ${hasWithdraw ? "YES ✅" : "NO ❌"}`);
    } else {
        console.log("\n⚠️ No standard proxy storage found. Either likely NOT a proxy, or uses custom storage.");
    }
}

main().catch(console.error);
