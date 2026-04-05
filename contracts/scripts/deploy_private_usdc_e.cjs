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

    // 1. Deploy PrivateUSDC.e
    console.log("\n1. Deploying PrivateUSDCe...");
    const PrivateUSDCe = await ethers.getContractFactory("PrivateBridgedUSDC");
    const privateUsdcE = await PrivateUSDCe.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateUsdcE.waitForDeployment(), TIMEOUT_SECONDS, "PrivateUSDCe Deployment");
    const pUsdcEAddr = await privateUsdcE.getAddress();
    console.log(`   -> PrivateUSDCe deployed to: ${pUsdcEAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ PrivateUSDC.e DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log(`PrivateUSDC.e: ${pUsdcEAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
