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
    // Current Public WETH (reuse existing)
    const WETH_ADDRESS = "0xA2872247F88250ea504A4d6Bb5d2547BABd790b5";

    console.log("===========================================");
    console.log("   🚀 DEPLOYING Fixed PrivateWETH & Bridge");
    console.log("===========================================");
    console.log(`Using Public WETH: ${WETH_ADDRESS}`);

    // 1. Deploy PrivateWETH (New Version with getMyBalance/mintEncrypted fixes)
    console.log("\n1. Deploying PrivateWETH...");
    const PrivateWETH = await ethers.getContractFactory("PrivateWrappedEther");
    const privateWeth = await PrivateWETH.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateWeth.waitForDeployment(), TIMEOUT_SECONDS, "PrivateWETH Deployment");
    const privateWethAddr = await privateWeth.getAddress();
    console.log(`   -> PrivateWETH deployed to: ${privateWethAddr}`);

    // 2. Deploy PrivacyBridgeWETH (New Version with Scaling/depositEncrypted)
    console.log("\n2. Deploying PrivacyBridgeWETH...");
    const PrivacyBridgeWETH = await ethers.getContractFactory("PrivacyBridgeWETH");
    const wethBridge = await PrivacyBridgeWETH.deploy(WETH_ADDRESS, privateWethAddr, { gasLimit: 12000000 });
    await waitWithTimeout(wethBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWETH Deployment");
    const wethBridgeAddr = await wethBridge.getAddress();
    console.log(`   -> PrivacyBridgeWETH deployed to: ${wethBridgeAddr}`);

    // 3. Grant MINTER_ROLE on PrivateWETH to the new Bridge
    console.log("\n3. Granting MINTER_ROLE on PrivateWETH to new bridge...");
    const MINTER_ROLE = ethers.id("MINTER_ROLE"); // keccak256("MINTER_ROLE")
    // Note: privateWeth contract instance already connected to deployer
    const roleTx = await privateWeth.grantRole(MINTER_ROLE, wethBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`   -> Role granted to ${wethBridgeAddr}`);

    console.log("\n===========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("===========================================");
    console.log(`PrivateWETH:       ${privateWethAddr}`);
    console.log(`PrivacyBridgeWETH: ${wethBridgeAddr}`);
    console.log("\n>>> UPDATE `src/config/tokens.json` with these new addresses! <<<");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
