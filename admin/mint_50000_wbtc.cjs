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
    // 0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492 is the WBTC address from config.ts
    const WBTC_ADDRESS = "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492";
    const TARGET = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    // WBTC has 8 decimals. We want to mint 50,000
    const AMOUNT = ethers.parseUnits("50000", 8);

    console.log("===========================================");
    console.log("   🪙 MINTING WBTC");
    console.log("===========================================");
    console.log(`Target: ${TARGET}`);
    console.log(`Amount: 50,000 WBTC (${AMOUNT.toString()} basic units)`);

    const WBTC = await ethers.getContractFactory("WBTC");
    const wbtc = WBTC.attach(WBTC_ADDRESS);

    console.log("\nExecuting mint transaction...");
    const tx = await wbtc.mint(TARGET, AMOUNT, { gasLimit: 2000000 });

    await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, "Mint Transaction Confirmation");

    console.log("\n===========================================");
    console.log("   ✅ MINT COMPLETE");
    console.log("===========================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
