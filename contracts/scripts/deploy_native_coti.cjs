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
    // Global Safety Timeout
    setTimeout(() => {
        console.error("\n💀 GLOBAL SCRIPT TIMEOUT (5 min) REACHED. FORCE EXITING.");
        process.exit(1);
    }, 300 * 1000);

    const network = await ethers.provider.getNetwork();
    const networkName = network.name === 'unknown' ? 'cotiTestnet' : network.name;

    console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);
    console.log(`Step Timeout: ${TIMEOUT_SECONDS} seconds`);

    // --- Native COTI Deployment Flow ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING NATIVE COTI DEPLOYMENT");
    console.log("=========================================");

    // 1. Deploy PrivateCoti
    console.log("\n1. Deploying PrivateCoti...");
    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = await PrivateCoti.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateCoti.waitForDeployment(), TIMEOUT_SECONDS, "PrivateCoti Deployment");
    const pCotiAddr = await privateCoti.getAddress();
    console.log(`   -> PrivateCoti deployed to: ${pCotiAddr}`);

    // 2. Deploy PrivacyBridgeCotiNative
    console.log("\n2. Deploying PrivacyBridgeCotiNative...");
    const PrivacyBridgeCotiNative = await ethers.getContractFactory("contracts/privateERC20/privacyBridge/PrivacyBridgeCotiNative.sol:PrivacyBridgeCotiNative");
    const bridge = await PrivacyBridgeCotiNative.deploy(pCotiAddr, { gasLimit: 12000000 });
    await waitWithTimeout(bridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeCotiNative Deployment");
    const bridgeAddr = await bridge.getAddress();
    console.log(`   -> PrivacyBridgeCotiNative deployed to: ${bridgeAddr}`);

    // 3. Grant MINTER_ROLE
    console.log("\n3. Granting MINTER_ROLE on PrivateCoti...");
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const roleTx = await privateCoti.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`   -> Role granted to ${bridgeAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ NATIVE COTI DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log("Summary of Addresses:");
    console.log(`Private Coti:           ${pCotiAddr}`);
    console.log(`Native COTI Bridge:     ${bridgeAddr}`);
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
