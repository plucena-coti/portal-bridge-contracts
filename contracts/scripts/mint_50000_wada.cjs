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
    // New WADA address from config
    const WADA_ADDRESS = "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D";
    const TARGET = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    // WADA has 6 decimals. We want to mint 50,000
    const AMOUNT = ethers.parseUnits("50000", 6);

    console.log("===========================================");
    console.log("   🪙 MINTING WADA");
    console.log("===========================================");
    console.log(`Target: ${TARGET}`);
    console.log(`Amount: 50,000 WADA (${AMOUNT.toString()} basic units)`);

    const WADA = await ethers.getContractFactory("WADA");
    const wada = WADA.attach(WADA_ADDRESS);

    console.log("\nExecuting mint transaction...");
    const tx = await wada.mint(TARGET, AMOUNT, { gasLimit: 2000000 });

    await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, "Mint Transaction Confirmation");

    console.log("\n===========================================");
    console.log("   ✅ MINT COMPLETE");
    console.log("===========================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
