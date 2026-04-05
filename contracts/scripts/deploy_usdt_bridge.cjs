const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;
const USDT_ADDRESS = "0x9e961430053cd5AbB3b060544cEcCec848693Cf0";
const PRIVATE_USDT_ADDRESS = "0xF08633c9BbcfEf6F309e84FdE6D4c49b0118C4D3";

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

    // 1. Deploy USDTPrivacyBridge
    console.log("\n1. Deploying PrivacyBridgeUSDT...");
    const PrivacyBridgeUSDT = await ethers.getContractFactory("PrivacyBridgeUSDT");
    const usdtBridge = await PrivacyBridgeUSDT.deploy(USDT_ADDRESS, PRIVATE_USDT_ADDRESS, { gasLimit: 12000000 });
    await waitWithTimeout(usdtBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeUSDT Deployment");
    const bridgeAddr = await usdtBridge.getAddress();
    console.log(`   -> PrivacyBridgeUSDT deployed to: ${bridgeAddr}`);

    // 2. Grant MINTER_ROLE to USDTPrivacyBridge on PrivateUSDT
    console.log("\n2. Granting MINTER_ROLE on PrivateUSDT...");
    const PrivateUSDT = await ethers.getContractAt("PrivateTetherUSD", PRIVATE_USDT_ADDRESS);
    const MINTER_ROLE = await PrivateUSDT.MINTER_ROLE();

    // Check if role is already granted
    const hasRole = await PrivateUSDT.hasRole(MINTER_ROLE, bridgeAddr);
    if (!hasRole) {
        const roleTx = await PrivateUSDT.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 5000000 });
        await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
        console.log(`   -> MINTER_ROLE granted to ${bridgeAddr}`);
    } else {
        console.log(`   -> ${bridgeAddr} already has MINTER_ROLE`);
    }

    console.log("\n=========================================");
    console.log("   ✅ USDT BRIDGE DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log(`USDTPrivacyBridge: ${bridgeAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
