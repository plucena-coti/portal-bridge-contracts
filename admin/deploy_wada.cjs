const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;

async function waitWithTimeout(promise, timeoutSeconds, stepName) {
    console.log(`[${stepName}] Waiting up to ${timeoutSeconds} seconds...`);
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            console.error(`[${stepName}] ❌ TIMEOUT! Forcefully rejecting.`);
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
        console.error(`[${stepName}] 💥 Error or Timeout:`, error.message);
        throw error;
    }
}

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log(`Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);

    // 1. Deploy WADA
    console.log("\n1. Deploying WADA...");
    const WADA = await ethers.getContractFactory("WADA");
    const wada = await WADA.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(wada.waitForDeployment(), TIMEOUT_SECONDS, "WADA Deployment");
    const wadaAddr = await wada.getAddress();
    console.log(`   -> WADA deployed to: ${wadaAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ WADA DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log(`WADA: ${wadaAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
