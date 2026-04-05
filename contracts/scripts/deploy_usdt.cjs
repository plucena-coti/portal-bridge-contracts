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

    // 1. Deploy Public USDT
    console.log("\n1. Deploying USDT...");
    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(usdt.waitForDeployment(), TIMEOUT_SECONDS, "USDT Deployment");
    const usdtAddr = await usdt.getAddress();
    console.log(`   -> USDT deployed to: ${usdtAddr}`);

    // 2. Deploy PrivateUSDT
    console.log("\n2. Deploying PrivateUSDT...");
    const PrivateUSDT = await ethers.getContractFactory("PrivateTetherUSD");
    const privateUsdt = await PrivateUSDT.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateUsdt.waitForDeployment(), TIMEOUT_SECONDS, "PrivateUSDT Deployment");
    const pUsdtAddr = await privateUsdt.getAddress();
    console.log(`   -> PrivateUSDT deployed to: ${pUsdtAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ USDT DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log(`USDT:          ${usdtAddr}`);
    console.log(`PrivateUSDT:   ${pUsdtAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
