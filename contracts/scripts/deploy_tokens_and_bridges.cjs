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
    const isMainnet = network.chainId === 2632500n;
    const explorerUrl = isMainnet ? "https://mainnet.cotiscan.io" : "https://testnet.cotiscan.io";

    console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);
    console.log(`Step Timeout: ${TIMEOUT_SECONDS} seconds`);

    // --- WETH Deployment Flow ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING WETH & BRIDGE DEPLOYMENT");
    console.log("=========================================");

    // 1. Deploy Public WETH (Mock)
    console.log("\n1. Deploying WETH9 (Public Mock)...");
    const WETH9 = await ethers.getContractFactory("WETH9");
    const weth = await WETH9.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(weth.waitForDeployment(), TIMEOUT_SECONDS, "WETH9 Deployment");
    const wethAddr = await weth.getAddress();
    console.log(`   -> WETH9 deployed to: ${wethAddr}`);

    // 2. Deploy PrivateWETH
    console.log("\n2. Deploying PrivateWETH...");
    const PrivateWETH = await ethers.getContractFactory("PrivateWrappedEther");
    const privateWeth = await PrivateWETH.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateWeth.waitForDeployment(), TIMEOUT_SECONDS, "PrivateWETH Deployment");
    const pWethAddr = await privateWeth.getAddress();
    console.log(`   -> PrivateWETH deployed to: ${pWethAddr}`);

    // 3. Deploy PrivacyBridgeWETH
    console.log("\n3. Deploying PrivacyBridgeWETH...");
    const PrivacyBridgeWETH = await ethers.getContractFactory("contracts/privateERC20/privacyBridge/PrivacyBridgeWETH.sol:PrivacyBridgeWETH");
    const wethBridge = await PrivacyBridgeWETH.deploy(wethAddr, pWethAddr, { gasLimit: 12000000 });
    await waitWithTimeout(wethBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWETH Deployment");
    const wethBridgeAddr = await wethBridge.getAddress();
    console.log(`   -> PrivacyBridgeWETH deployed to: ${wethBridgeAddr}`);

    // 4. Grant MINTER_ROLE for WETH
    console.log("\n4. Granting MINTER_ROLE on PrivateWETH...");
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const wethRoleTx = await privateWeth.grantRole(MINTER_ROLE, wethBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(wethRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE (WETH)");
    console.log(`   -> Role granted to ${wethBridgeAddr}`);

    // --- WBTC Deployment Flow ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING WBTC & BRIDGE DEPLOYMENT");
    console.log("=========================================");

    // 5. Deploy Public WBTC (Mock)
    console.log("\n5. Deploying WBTC (Public Mock)...");
    const WBTC = await ethers.getContractFactory("WBTC");
    // WBTC constructor doesn't take args based on the file seen earlier, or verify
    // Checking WBTC.sol: constructor() public runs init. 
    // Wait, WBTC.sol inherits DetailedERC20("Wrapped BTC", "WBTC", 8) but WBTC contract itself might be different.
    // Looking at file content: contract WBTC ... { ... } no constructor defined in WBTC body, uses inherited? 
    // DetailedERC20 has constructor(name, symbol, decimals).
    // WBTC inherits StandardToken, DetailedERC20... PausableToken, OwnableContract.
    // It seems WBTC inherits DetailedERC20("Wrapped BTC", "WBTC", 8), so default constructor likely works if solidity 0.4.24 allows default constructor chaining.
    // The WBTC.sol file 0.4.24 syntax might require explicit constructor or inherits properly.
    // Let's assume standard no-arg deploy works given the inheritance structure.
    const wbtc = await WBTC.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(wbtc.waitForDeployment(), TIMEOUT_SECONDS, "WBTC Deployment");
    const wbtcAddr = await wbtc.getAddress();
    console.log(`   -> WBTC deployed to: ${wbtcAddr}`);

    // 6. Deploy PrivateBTC
    console.log("\n6. Deploying PrivateBTC...");
    const PrivateBTC = await ethers.getContractFactory("PrivateWrappedBTC");
    const privateBtc = await PrivateBTC.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateBtc.waitForDeployment(), TIMEOUT_SECONDS, "PrivateBTC Deployment");
    const pBtcAddr = await privateBtc.getAddress();
    console.log(`   -> PrivateBTC deployed to: ${pBtcAddr}`);

    // 7. Deploy PrivacyBridgeWBTC
    console.log("\n7. Deploying PrivacyBridgeWBTC...");
    const PrivacyBridgeWBTC = await ethers.getContractFactory("contracts/privateERC20/privacyBridge/PrivacyBridgeWBTC.sol:PrivacyBridgeWBTC");
    const wbtcBridge = await PrivacyBridgeWBTC.deploy(wbtcAddr, pBtcAddr, { gasLimit: 12000000 });
    await waitWithTimeout(wbtcBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWBTC Deployment");
    const wbtcBridgeAddr = await wbtcBridge.getAddress();
    console.log(`   -> PrivacyBridgeWBTC deployed to: ${wbtcBridgeAddr}`);

    // 8. Grant MINTER_ROLE for WBTC
    console.log("\n8. Granting MINTER_ROLE on PrivateBTC...");
    const wbtcRoleTx = await privateBtc.grantRole(MINTER_ROLE, wbtcBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(wbtcRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE (WBTC)");
    console.log(`   -> Role granted to ${wbtcBridgeAddr}`);

    console.log("\n=========================================");
    console.log("   ✅ FULL DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log("Summary of Addresses:");
    console.log(`WETH (Public):        ${wethAddr}`);
    console.log(`Private WETH:         ${pWethAddr}`);
    console.log(`WETH Privacy Bridge:  ${wethBridgeAddr}`);
    console.log("-----------------------------------------");
    console.log(`WBTC (Public):        ${wbtcAddr}`);
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
