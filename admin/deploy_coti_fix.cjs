const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 300;

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
    console.log("   🚀 DEPLOYING Fixed PrivateCoti & Bridge");
    console.log("===========================================");

    // 1. Deploy PrivateCoti (New Version with getMyBalance/mintEncrypted fixes)
    console.log("\n1. Deploying PrivateCoti...");
    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = await PrivateCoti.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateCoti.waitForDeployment(), TIMEOUT_SECONDS, "PrivateCoti Deployment");
    const privateCotiAddr = await privateCoti.getAddress();
    console.log(`   -> PrivateCoti deployed to: ${privateCotiAddr}`);

    // 2. Deploy PrivacyBridgeCotiNative (New Version with Scaling/depositEncrypted)
    console.log("\n2. Deploying PrivacyBridgeCotiNative...");
    const PrivacyBridgeCotiNative = await ethers.getContractFactory("PrivacyBridgeCotiNative");
    const cotiBridge = await PrivacyBridgeCotiNative.deploy(privateCotiAddr, { gasLimit: 12000000 });
    await waitWithTimeout(cotiBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeCotiNative Deployment");
    const cotiBridgeAddr = await cotiBridge.getAddress();
    console.log(`   -> PrivacyBridgeCotiNative deployed to: ${cotiBridgeAddr}`);

    // 3. Grant MINTER_ROLE on PrivateCoti to the new Bridge
    console.log("\n3. Granting MINTER_ROLE on PrivateCoti to new bridge...");
    const MINTER_ROLE = ethers.id("MINTER_ROLE"); // keccak256("MINTER_ROLE")
    // Note: privateCoti contract instance already connected to deployer
    const roleTx = await privateCoti.grantRole(MINTER_ROLE, cotiBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`   -> Role granted to ${cotiBridgeAddr}`);

    console.log("\n===========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("===========================================");
    console.log(`PrivateCoti:       ${privateCotiAddr}`);
    console.log(`PrivacyBridgeCotiNative: ${cotiBridgeAddr}`);
    console.log("\n>>> UPDATE `src/config/tokens.json` with these new addresses! <<<");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
