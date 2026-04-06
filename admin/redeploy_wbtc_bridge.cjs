const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;

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
    // Exact requested token addresses
    const WBTC_ADDRESS = "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492"; // The one we just modernized
    const PRIVATE_WBTC_ADDRESS = "0x362F5a50423163c0f8E1bC4C8867FdC22bd74Da1"; // p.WBTC from user instruction

    console.log("===========================================");
    console.log("   🚀 REDEPLOYING PrivacyBridgeWBTC ONLY");
    console.log("===========================================");
    console.log(`Using WBTC: ${WBTC_ADDRESS}`);
    console.log(`Using PrivateWBTC: ${PRIVATE_WBTC_ADDRESS}`);

    // 1. Deploy new PrivacyBridgeWBTC
    console.log("\n1. Deploying PrivacyBridgeWBTC...");
    const PrivacyBridgeWBTC = await ethers.getContractFactory("PrivacyBridgeWBTC");
    const wbtcBridge = await PrivacyBridgeWBTC.deploy(WBTC_ADDRESS, PRIVATE_WBTC_ADDRESS, { gasLimit: 12000000 });
    await waitWithTimeout(wbtcBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWBTC Deployment");
    const wbtcBridgeAddr = await wbtcBridge.getAddress();
    console.log(`   -> PrivacyBridgeWBTC deployed to: ${wbtcBridgeAddr}`);

    // 2. Grant MINTER_ROLE on PrivateWBTC to the new bridge
    console.log("\n2. Granting MINTER_ROLE on PrivateWBTC to new bridge...");

    // Using PrivateWrappedBTC contract which inherits AccessControl
    const PrivateWBTC = await ethers.getContractFactory("PrivateWrappedBTC");
    const privateWbtc = PrivateWBTC.attach(PRIVATE_WBTC_ADDRESS);

    // Get the keccak256 hash of "MINTER_ROLE"
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    try {
        const roleTx = await privateWbtc.grantRole(MINTER_ROLE, wbtcBridgeAddr, { gasLimit: 5000000 });
        await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
        console.log(`   -> Role granted to ${wbtcBridgeAddr}`);
    } catch (e) {
        console.log(`⚠️ Note: Failed to grant MINTER_ROLE automatically. It might need to be granted by the multisig or original deployer: ${e.message}`);
    }

    console.log("\n===========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("===========================================");
    console.log(`NEW PrivacyBridgeWBTC: ${wbtcBridgeAddr}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
