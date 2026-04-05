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
        console.error("\n💀 GLOBAL SCRIPT TIMEOUT (10 min) REACHED. FORCE EXITING.");
        process.exit(1);
    }, 600 * 1000);

    const network = await ethers.provider.getNetwork();
    const networkName = network.name === 'unknown' ? 'cotiTestnet' : network.name;

    console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);
    console.log(`Step Timeout: ${TIMEOUT_SECONDS} seconds`);

    // Get WETH Address
    let wethAddr = process.env.wETH_MAINNET;
    if (!wethAddr || wethAddr === "") {
        console.warn("⚠️ wETH_MAINNET not set in .env. Checking for fallback or deploying mock...");
        // Fallback logic could go here, but for mainnet we expect it.
        // If we are on mainnet and no WETH is provided, we should probably stop or ask.
        // For now, consistent with plan, if not provided we deploy WETH9 (useful for testing on other nets)
        console.log("   -> Deploying WETH9 (Fallback/Test)...");
        const WETH9 = await ethers.getContractFactory("WETH9");
        const weth = await WETH9.deploy({ gasLimit: 5000000 });
        await waitWithTimeout(weth.waitForDeployment(), TIMEOUT_SECONDS, "WETH9 Deployment");
        wethAddr = await weth.getAddress();
    }
    console.log(`Using WETH Address: ${wethAddr}`);

    // --- Deployment Flow ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING MAINNET DEPLOYMENT");
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
    await waitWithTimeout(wethRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`   -> Role granted to ${wethBridgeAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ MAINNET DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log("Summary of Addresses:");
    console.log(`WETH (Mainnet):       ${wethAddr}`);
    console.log(`Private WETH:         ${pWethAddr}`);
    console.log(`Weth Privacy Bridge:  ${wethBridgeAddr}`);
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
