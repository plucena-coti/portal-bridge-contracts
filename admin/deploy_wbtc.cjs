const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;

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
    console.log("===========================================");
    console.log("   🚀 DEPLOYING WBTC (0.8.19 Version)");
    console.log("===========================================");

    const WBTC = await ethers.getContractFactory("WBTC");
    const wbtc = await WBTC.deploy({ gasLimit: 12000000 });

    await waitWithTimeout(wbtc.waitForDeployment(), TIMEOUT_SECONDS, "WBTC Deployment");

    const wbtcAddr = await wbtc.getAddress();
    console.log(`   -> WBTC deployed to: ${wbtcAddr}`);

    console.log("\n===========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("===========================================");
    console.log(`NEW WBTC ADDRESS: ${wbtcAddr}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
