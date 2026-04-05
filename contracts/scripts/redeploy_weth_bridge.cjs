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
    // Existing token addresses - DO NOT CHANGE
    const WETH_ADDRESS = "0x8bca4e6bbE402DB4aD189A316137aD08206154FB";
    const PRIVATE_WETH_ADDRESS = "0xc79fC578D7Fe1677c72F88cAdD63D9199D56ebe0";

    console.log("===========================================");
    console.log("   🚀 REDEPLOYING PrivacyBridgeWETH ONLY");
    console.log("===========================================");
    console.log(`Using WETH: ${WETH_ADDRESS}`);
    console.log(`Using PrivateWETH: ${PRIVATE_WETH_ADDRESS}`);

    // 1. Deploy new PrivacyBridgeWETH
    console.log("\n1. Deploying PrivacyBridgeWETH...");
    const PrivacyBridgeWETH = await ethers.getContractFactory("PrivacyBridgeWETH");
    const wethBridge = await PrivacyBridgeWETH.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(wethBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWETH Deployment");
    const wethBridgeAddr = await wethBridge.getAddress();
    console.log(`   -> PrivacyBridgeWETH deployed to: ${wethBridgeAddr}`);

    // 2. Grant MINTER_ROLE on PrivateWETH to the new bridge
    console.log("\n2. Granting MINTER_ROLE on PrivateWETH to new bridge...");
    const PrivateWETH = await ethers.getContractFactory("PrivateWrappedEther");
    const privateWeth = PrivateWETH.attach(PRIVATE_WETH_ADDRESS);

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const roleTx = await privateWeth.grantRole(MINTER_ROLE, wethBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`   -> Role granted to ${wethBridgeAddr}`);

    console.log("\n===========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("===========================================");
    console.log(`NEW PrivacyBridgeWETH: ${wethBridgeAddr}`);
    console.log("\n>>> UPDATE config.ts with this new bridge address! <<<");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
