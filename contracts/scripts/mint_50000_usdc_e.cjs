const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 60;

async function waitWithTimeout(promise, timeoutSeconds, stepName) {
    console.log(`[${stepName}] Waiting up to ${timeoutSeconds} seconds...`);
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`[${stepName}] Timed out after ${timeoutSeconds} seconds`));
        }, timeoutSeconds * 1000);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutHandle);
        console.log(`[${stepName}] ✅ Completed!`);
        return result;
    } catch (error) {
        clearTimeout(timeoutHandle);
        throw error;
    }
}

async function main() {
    // New USDC.e address from config
    const USDC_E_ADDRESS = "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C";
    const TARGET = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    // USDC.e has 6 decimals. We want to mint 50,000
    const AMOUNT = ethers.parseUnits("50000", 6);

    console.log("===========================================");
    console.log("   🪙 MINTING USDC.e");
    console.log("===========================================");
    console.log(`Target: ${TARGET}`);
    console.log(`Amount: 50,000 USDC.e (${AMOUNT.toString()} basic units)`);

    const USDCe = await ethers.getContractFactory("USDCe");
    const usdc = USDCe.attach(USDC_E_ADDRESS);

    console.log("\nExecuting mint transaction...");
    const tx = await usdc.mint(TARGET, AMOUNT, { gasLimit: 2000000 });

    await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, "Mint Transaction Confirmation");

    console.log("\n===========================================");
    console.log("   ✅ MINT COMPLETE");
    console.log("===========================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
