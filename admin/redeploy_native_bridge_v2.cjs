const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 300;

// The specific PrivateCoti address requested by the user
const PRIVATE_COTI_ADDRESS = "0x03eeA59b1F0Dfeaece75531b27684DD882f79759";

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
    console.log("   🚀 REDEPLOYING NATIVE BRIDGE (v2)");
    console.log(`   Linking to PrivateCoti: ${PRIVATE_COTI_ADDRESS}`);
    console.log("==================================================");

    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // 1. Deploy PrivacyBridgeCotiNative
    console.log("\n1. Deploying PrivacyBridgeCotiNative...");
    const PrivacyBridgeCotiNative = await ethers.getContractFactory("PrivacyBridgeCotiNative");

    // Deployment uses the requested PrivateCoti address
    const bridge = await PrivacyBridgeCotiNative.deploy(PRIVATE_COTI_ADDRESS, { gasLimit: 12000000 });
    await waitWithTimeout(bridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeCotiNative Deployment");
    const bridgeAddr = await bridge.getAddress();
    console.log(`   -> PrivacyBridgeCotiNative deployed to: ${bridgeAddr}`);

    // 2. Grant MINTER_ROLE on existing PrivateCoti to the new bridge
    console.log("\n2. Granting MINTER_ROLE on PrivateCoti to the new bridge...");
    // We assume the deployer has DEFAULT_ADMIN_ROLE or is the owner of PrivateCoti
    const PrivateCoti = await ethers.getContractAt("PrivateCOTI", PRIVATE_COTI_ADDRESS); // Using PrivateCOTI based on file path
    const MINTER_ROLE = ethers.id("MINTER_ROLE");

    console.log(`   Requesting MINTER_ROLE for ${bridgeAddr}...`);
    try {
        const roleTx = await PrivateCoti.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 5000000 });
        await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
        console.log(`   -> Role granted!`);
    } catch (e) {
        console.error(`\n⚠️  Failed to grant MINTER_ROLE: ${e.message}`);
        console.log("   You may need to grant this role manually if the deployer is not the admin of PrivateCoti.");
    }

    console.log("\n==================================================");
    console.log("   ✅ REDEPLOYMENT COMPLETE");
    console.log("==================================================");
    console.log(`New Bridge Address: ${bridgeAddr}`);
    console.log("\nNext Steps:");
    console.log(`1. Update src/contracts/config.ts with: ${bridgeAddr}`);
    console.log(`2. Verify the contract using verify_api.cjs`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
