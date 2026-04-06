const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;
const GCOTI_ADDRESS = "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C"; // Correct Testnet gCOTI

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

    // 1. Deploy PrivategCoti
    console.log("\n1. Deploying PrivategCoti...");
    const PrivategCoti = await ethers.getContractFactory("PrivateCOTITreasuryGovernanceToken");
    const privategCoti = await PrivategCoti.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privategCoti.waitForDeployment(), TIMEOUT_SECONDS, "PrivategCoti Deployment");
    const privategCotiAddr = await privategCoti.getAddress();
    console.log(`   -> PrivategCoti deployed to: ${privategCotiAddr}`);

    // 2. Deploy PrivacyBridgegCoti
    console.log("\n2. Deploying PrivacyBridgegCoti...");
    const PrivacyBridgegCoti = await ethers.getContractFactory("PrivacyBridgegCoti");
    const bridge = await PrivacyBridgegCoti.deploy(GCOTI_ADDRESS, privategCotiAddr, { gasLimit: 12000000 });
    await waitWithTimeout(bridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgegCoti Deployment");
    const bridgeAddr = await bridge.getAddress();
    console.log(`   -> PrivacyBridgegCoti deployed to: ${bridgeAddr}`);

    // 3. Grant MINTER_ROLE to PrivacyBridgegCoti on PrivategCoti
    console.log("\n3. Granting MINTER_ROLE on PrivategCoti...");
    const MINTER_ROLE = await privategCoti.MINTER_ROLE();

    // Check if role is already granted
    const hasRole = await privategCoti.hasRole(MINTER_ROLE, bridgeAddr);
    if (!hasRole) {
        const roleTx = await privategCoti.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 5000000 });
        await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
        console.log(`   -> MINTER_ROLE granted to ${bridgeAddr}`);
    } else {
        console.log(`   -> ${bridgeAddr} already has MINTER_ROLE`);
    }

    console.log("\n=========================================");
    console.log("   ✅ gCOTI BRIDGE DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log(`gCOTI (Public):      ${GCOTI_ADDRESS}`);
    console.log(`PrivategCoti:        ${privategCotiAddr}`);
    console.log(`gCotiPrivacyBridge:  ${bridgeAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
