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

    // 0. Deploy Public Mocks
    console.log("\n0. Deploying Public Mocks...");

    // Deploy USDT Mock
    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(usdt.waitForDeployment(), TIMEOUT_SECONDS, "USDT Mock Deployment");
    const usdtAddr = await usdt.getAddress();
    console.log(`   -> USDT (Mock) deployed to: ${usdtAddr}`);

    // Deploy USDCe Mock
    const USDCe = await ethers.getContractFactory("USDCe");
    const usdc = await USDCe.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(usdc.waitForDeployment(), TIMEOUT_SECONDS, "USDCe Mock Deployment");
    const usdcAddr = await usdc.getAddress();
    console.log(`   -> USDC.e (Mock) deployed to: ${usdcAddr}`);

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    // --- USDT Deployment ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING USDT REDEPLOYMENT");
    console.log("=========================================");

    // 1. Deploy PrivateUSDT
    console.log("\n1. Deploying PrivateUSDT (6 Decimals)...");
    const PrivateUSDT = await ethers.getContractFactory("PrivateTetherUSD");
    const privateUsdt = await PrivateUSDT.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateUsdt.waitForDeployment(), TIMEOUT_SECONDS, "PrivateUSDT Deployment");
    const pUsdtAddr = await privateUsdt.getAddress();
    console.log(`   -> PrivateUSDT deployed to: ${pUsdtAddr}`);

    // 2. Deploy PrivacyBridgeUSDT
    console.log("\n2. Deploying PrivacyBridgeUSDT...");
    const PrivacyBridgeUSDT = await ethers.getContractFactory("PrivacyBridgeUSDT");
    // Scaling Factor is 1 because both are 6 decimals
    const usdtBridge = await PrivacyBridgeUSDT.deploy(usdtAddr, pUsdtAddr, { gasLimit: 12000000 });
    await waitWithTimeout(usdtBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeUSDT Deployment");
    const usdtBridgeAddr = await usdtBridge.getAddress();
    console.log(`   -> PrivacyBridgeUSDT deployed to: ${usdtBridgeAddr}`);

    // 3. Grant MINTER_ROLE for USDT
    console.log("\n3. Granting MINTER_ROLE on PrivateUSDT...");
    const usdtRoleTx = await privateUsdt.grantRole(MINTER_ROLE, usdtBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(usdtRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE (USDT)");
    console.log(`   -> Role granted to ${usdtBridgeAddr}`);


    // --- USDC.e Deployment ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING USDC.e REDEPLOYMENT");
    console.log("=========================================");

    // 1. Deploy PrivateUSDCe
    console.log("\n1. Deploying PrivateUSDCe (6 Decimals)...");
    const PrivateUSDCe = await ethers.getContractFactory("PrivateBridgedUSDC");
    const privateUsdc = await PrivateUSDCe.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateUsdc.waitForDeployment(), TIMEOUT_SECONDS, "PrivateUSDCe Deployment");
    const pUsdcAddr = await privateUsdc.getAddress();
    console.log(`   -> PrivateUSDCe deployed to: ${pUsdcAddr}`);

    // 2. Deploy PrivacyBridgeUSDCe
    console.log("\n2. Deploying PrivacyBridgeUSDCe...");
    const PrivacyBridgeUSDCe = await ethers.getContractFactory("PrivacyBridgeUSDCe");
    // Scaling Factor is 1 because both are 6 decimals
    const usdcBridge = await PrivacyBridgeUSDCe.deploy(usdcAddr, pUsdcAddr, { gasLimit: 12000000 });
    await waitWithTimeout(usdcBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeUSDCe Deployment");
    const usdcBridgeAddr = await usdcBridge.getAddress();
    console.log(`   -> PrivacyBridgeUSDCe deployed to: ${usdcBridgeAddr}`);

    // 3. Grant MINTER_ROLE for USDC.e
    console.log("\n3. Granting MINTER_ROLE on PrivateUSDCe...");
    const usdcRoleTx = await privateUsdc.grantRole(MINTER_ROLE, usdcBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(usdcRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE (USDC.e)");
    console.log(`   -> Role granted to ${usdcBridgeAddr}`);


    console.log("\n=========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log("New Addresses:");
    console.log(`Private USDT:          ${pUsdtAddr}`);
    console.log(`USDT Bridge:           ${usdtBridgeAddr}`);
    console.log(`Private USDC.e:        ${pUsdcAddr}`);
    console.log(`USDC.e Bridge:         ${usdcBridgeAddr}`);
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
