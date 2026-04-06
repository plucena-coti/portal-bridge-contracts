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

    // Existing Public WETH Address from tokens.json (Testnet)
    const wethAddr = "0x8bca4e6bbE402DB4aD189A316137aD08206154FB";
    console.log(`Using newly verified Public WETH: ${wethAddr}`);

    // --- WETH Deployment Flow ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING WETH BRIDGE REDEPLOYMENT");
    console.log("=========================================");

    // 1. Deploy PrivateWETH
    console.log("\n1. Deploying PrivateWETH...");
    const PrivateWETH = await ethers.getContractFactory("PrivateWrappedEther");
    const privateWeth = await PrivateWETH.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateWeth.waitForDeployment(), TIMEOUT_SECONDS, "PrivateWETH Deployment");
    const pWethAddr = await privateWeth.getAddress();
    console.log(`   -> PrivateWETH deployed to: ${pWethAddr}`);

    // 2. Deploy PrivacyBridgeWETH
    console.log("\n2. Deploying PrivacyBridgeWETH...");
    const PrivacyBridgeWETH = await ethers.getContractFactory("PrivacyBridgeWETH");
    const wethBridge = await PrivacyBridgeWETH.deploy(wethAddr, pWethAddr, { gasLimit: 12000000 });
    await waitWithTimeout(wethBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWETH Deployment");
    const wethBridgeAddr = await wethBridge.getAddress();
    console.log(`   -> PrivacyBridgeWETH deployed to: ${wethBridgeAddr}`);

    // 3. Grant MINTER_ROLE for WETH
    console.log("\n3. Granting MINTER_ROLE on PrivateWETH...");
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const wethRoleTx = await privateWeth.grantRole(MINTER_ROLE, wethBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(wethRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE (WETH)");
    console.log(`   -> Role granted to ${wethBridgeAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ WETH REDEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log("Summary of New Addresses:");
    console.log(`Public WETH:          ${wethAddr} (Unchanged)`);
    console.log(`Private WETH:         ${pWethAddr}`);
    console.log(`WETH Privacy Bridge:  ${wethBridgeAddr}`);
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
