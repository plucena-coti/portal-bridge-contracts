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
    // Current Public WBTC (Testnet)
    const WBTC_ADDRESS = "0xC1f3d4b1507a7925E598857CBE3418ab6B521c50"; // From tokens.json

    console.log("===========================================");
    console.log("   🚀 DEPLOYING Fixed PrivateBTC & Bridge");
    console.log("===========================================");
    console.log(`Using Public WBTC: ${WBTC_ADDRESS}`);

    // 1. Deploy PrivateBTC
    console.log("\n1. Deploying PrivateBTC...");
    const PrivateBTC = await ethers.getContractFactory("PrivateWrappedBTC");
    const privateBtc = await PrivateBTC.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateBtc.waitForDeployment(), TIMEOUT_SECONDS, "PrivateBTC Deployment");
    const privateBtcAddr = await privateBtc.getAddress();
    console.log(`   -> PrivateBTC deployed to: ${privateBtcAddr}`);

    // 2. Deploy PrivacyBridgeWBTC
    console.log("\n2. Deploying PrivacyBridgeWBTC...");
    const PrivacyBridgeWBTC = await ethers.getContractFactory("PrivacyBridgeWBTC");
    const wbtcBridge = await PrivacyBridgeWBTC.deploy(WBTC_ADDRESS, privateBtcAddr, { gasLimit: 12000000 });
    await waitWithTimeout(wbtcBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWBTC Deployment");
    const wbtcBridgeAddr = await wbtcBridge.getAddress();
    console.log(`   -> PrivacyBridgeWBTC deployed to: ${wbtcBridgeAddr}`);

    // 3. Grant MINTER_ROLE on PrivateBTC to the new Bridge
    console.log("\n3. Granting MINTER_ROLE on PrivateBTC to new bridge...");
    const MINTER_ROLE = ethers.id("MINTER_ROLE"); // keccak256("MINTER_ROLE")
    // Note: privateBtc contract instance already connected to deployer
    const roleTx = await privateBtc.grantRole(MINTER_ROLE, wbtcBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`   -> Role granted to ${wbtcBridgeAddr}`);

    console.log("\n===========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("===========================================");
    console.log(`PrivateBTC:        ${privateBtcAddr}`);
    console.log(`PrivacyBridgeWBTC: ${wbtcBridgeAddr}`);
    console.log("\n>>> UPDATE `src/config/tokens.json` (Testnet) with these new addresses! <<<");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
