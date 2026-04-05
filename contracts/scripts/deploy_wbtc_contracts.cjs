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
    const networkName = network.name === 'unknown' ? 'cotiTestnet' : network.name;

    console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);
    console.log(`Step Timeout: ${TIMEOUT_SECONDS} seconds`);

    // Existing Public WBTC Address from tokens.json (Testnet)
    const wbtcAddr = "0xC1f3d4b1507a7925E598857CBE3418ab6B521c50";
    console.log(`Using existing Public WBTC: ${wbtcAddr}`);

    // --- WBTC Deployment Flow ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING WBTC BRIDGE REDEPLOYMENT");
    console.log("=========================================");

    // 1. Deploy PrivateBTC
    console.log("\n1. Deploying PrivateBTC...");
    const PrivateBTC = await ethers.getContractFactory("PrivateWrappedBTC");
    const privateBtc = await PrivateBTC.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateBtc.waitForDeployment(), TIMEOUT_SECONDS, "PrivateBTC Deployment");
    const pBtcAddr = await privateBtc.getAddress();
    console.log(`   -> PrivateBTC deployed to: ${pBtcAddr}`);

    // 2. Deploy PrivacyBridgeWBTC
    console.log("\n2. Deploying PrivacyBridgeWBTC...");
    const PrivacyBridgeWBTC = await ethers.getContractFactory("PrivacyBridgeWBTC");
    const wbtcBridge = await PrivacyBridgeWBTC.deploy(wbtcAddr, pBtcAddr, { gasLimit: 12000000 });
    await waitWithTimeout(wbtcBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWBTC Deployment");
    const wbtcBridgeAddr = await wbtcBridge.getAddress();
    console.log(`   -> PrivacyBridgeWBTC deployed to: ${wbtcBridgeAddr}`);

    // 3. Grant MINTER_ROLE for WBTC
    console.log("\n3. Granting MINTER_ROLE on PrivateBTC...");
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const wbtcRoleTx = await privateBtc.grantRole(MINTER_ROLE, wbtcBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(wbtcRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE (WBTC)");
    console.log(`   -> Role granted to ${wbtcBridgeAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ WBTC REDEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log("Summary of New Addresses:");
    console.log(`Public WBTC:          ${wbtcAddr} (Unchanged)`);
    console.log(`Private BTC:          ${pBtcAddr}`);
    console.log(`WBTC Privacy Bridge:  ${wbtcBridgeAddr}`);
}

main()
    .then(() => {
        console.log("Script finished successfully. Calling process.exit(0)...");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment Failed or Timed Out:");
        console.error(error);
        process.exit(1);
    });
