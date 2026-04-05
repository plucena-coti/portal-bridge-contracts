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

    // 1. Deploy PrivateWADA
    console.log("\n1. Deploying PrivateWADA...");
    const PrivateWADA = await ethers.getContractFactory("PrivateWrappedADA");
    const privateWada = await PrivateWADA.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateWada.waitForDeployment(), TIMEOUT_SECONDS, "PrivateWADA Deployment");
    const pWadaAddr = await privateWada.getAddress();
    console.log(`   -> PrivateWADA deployed to: ${pWadaAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ PrivateWADA DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log(`PrivateWADA: ${pWadaAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
