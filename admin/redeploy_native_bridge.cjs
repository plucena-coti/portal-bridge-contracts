const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 300;

// Existing PrivateCoti address on cotiTestnet (from config.ts)
const PRIVATE_COTI_ADDRESS = "0x0dAF540a7627cD298a7dbaEC179598B5bbDaf532";

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
    console.log("==================================================");
    console.log("   🚀 REDEPLOYING NATIVE BRIDGE ONLY");
    console.log(`   Tokens: ${PRIVATE_COTI_ADDRESS}`);
    console.log("==================================================");

    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // 1. Deploy PrivacyBridgeCotiNative
    console.log("\n1. Deploying PrivacyBridgeCotiNative...");
    const PrivacyBridgeCotiNative = await ethers.getContractFactory("PrivacyBridgeCotiNative");
    const bridge = await PrivacyBridgeCotiNative.deploy(PRIVATE_COTI_ADDRESS, { gasLimit: 12000000 });
    await waitWithTimeout(bridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeCotiNative Deployment");
    const bridgeAddr = await bridge.getAddress();
    console.log(`   -> PrivacyBridgeCotiNative deployed to: ${bridgeAddr}`);

    // 2. Grant MINTER_ROLE on existing PrivateCoti to the new bridge
    console.log("\n2. Granting MINTER_ROLE on PrivateCoti to the new bridge...");
    const PrivateCoti = await ethers.getContractAt("PrivateCoti", PRIVATE_COTI_ADDRESS);
    const MINTER_ROLE = ethers.id("MINTER_ROLE");

    console.log(`   Requesting MINTER_ROLE for ${bridgeAddr}...`);
    const roleTx = await PrivateCoti.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`   -> Role granted!`);

    console.log("\n==================================================");
    console.log("   ✅ REDEPLOYMENT COMPLETE");
    console.log("==================================================");
    console.log(`New Bridge Address: ${bridgeAddr}`);
    console.log("\nNext Steps:");
    console.log(`1. Update src/contracts/config.ts with the new address.`);
    console.log(`2. Update ABIs if necessary.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
