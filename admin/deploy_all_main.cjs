const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;
const GAS_LIMIT_DEPLOY = 12000000;
const GAS_LIMIT_TX = 5000000;

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
    // Safety Timeout
    setTimeout(() => {
        console.error("\n💀 GLOBAL SCRIPT TIMEOUT REACHED. FORCE EXITING.");
        process.exit(1);
    }, 1200 * 1000); // 20 minutes

    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    const networkName = network.name === 'unknown' ? 'cotiTestnet' : network.name;

    console.log("===========================================");
    console.log(`🚀 MASTER DEPLOYMENT STARTED`);
    console.log(`Network: ${networkName} (Chain ID: ${network.chainId})`);
    console.log(`Deployer: ${deployer.address}`);
    console.log("===========================================\n");

    const addresses = {};

    // Helper to deploy public mock
    async function deployPublic(name, contractName, args = []) {
        console.log(`\n--- Deploying Public ${name} ---`);
        const Factory = await ethers.getContractFactory(contractName);
        const contract = await Factory.deploy(...args, { gasLimit: GAS_LIMIT_TX });
        await waitWithTimeout(contract.waitForDeployment(), TIMEOUT_SECONDS, `${name} Deployment`);
        const addr = await contract.getAddress();
        console.log(`   -> ${name} deployed to: ${addr}`);
        addresses[name] = addr;
        return contract;
    }

    // Helper to deploy private token
    async function deployPrivate(name, contractName) {
        console.log(`\n--- Deploying Private ${name} ---`);
        const Factory = await ethers.getContractFactory(contractName);
        const contract = await Factory.deploy({ gasLimit: GAS_LIMIT_DEPLOY });
        await waitWithTimeout(contract.waitForDeployment(), TIMEOUT_SECONDS, `${name} Deployment`);
        const addr = await contract.getAddress();
        console.log(`   -> ${name} deployed to: ${addr}`);
        addresses[name] = addr;
        return contract;
    }

    // Helper to deploy bridge
    async function deployBridge(name, contractName, args) {
        console.log(`\n--- Deploying ${name} ---`);
        const Factory = await ethers.getContractFactory(contractName);
        const contract = await Factory.deploy(...args, { gasLimit: GAS_LIMIT_DEPLOY });
        await waitWithTimeout(contract.waitForDeployment(), TIMEOUT_SECONDS, `${name} Deployment`);
        const addr = await contract.getAddress();
        console.log(`   -> ${name} deployed to: ${addr}`);
        addresses[name] = addr;
        return contract;
    }

    // 1. Native COTI
    const pCoti = await deployPrivate("PrivateCoti", "PrivateCoti");
    const bridgeCoti = await deployBridge("PrivacyBridgeCotiNative", "PrivacyBridgeCotiNative", [await pCoti.getAddress()]);

    // 2. WETH
    const weth = await deployPublic("WETH", "WETH9");
    const pWeth = await deployPrivate("PrivateWETH", "PrivateWrappedEther");
    const bridgeWeth = await deployBridge("PrivacyBridgeWETH", "PrivacyBridgeWETH", [await weth.getAddress(), await pWeth.getAddress()]);

    // 3. WBTC
    const wbtc = await deployPublic("WBTC", "WBTC");
    const pBtc = await deployPrivate("PrivateBTC", "PrivateWrappedBTC");
    const bridgeBtc = await deployBridge("PrivacyBridgeWBTC", "PrivacyBridgeWBTC", [await wbtc.getAddress(), await pBtc.getAddress()]);

    // 4. USDT
    const usdt = await deployPublic("USDT", "USDT");
    const pUsdt = await deployPrivate("PrivateUSDT", "PrivateTetherUSD");
    const bridgeUsdt = await deployBridge("PrivacyBridgeUSDT", "PrivacyBridgeUSDT", [await usdt.getAddress(), await pUsdt.getAddress()]);

    // 5. USDC.e
    const usdc = await deployPublic("USDCe", "USDCe");
    const pUsdc = await deployPrivate("PrivateUSDCe", "PrivateBridgedUSDC");
    const bridgeUsdc = await deployBridge("PrivacyBridgeUSDCe", "PrivacyBridgeUSDCe", [await usdc.getAddress(), await pUsdc.getAddress()]);

    // 6. WADA
    const wada = await deployPublic("WADA", "WADA");
    const pWada = await deployPrivate("PrivateWADA", "PrivateWrappedADA");
    const bridgeWada = await deployBridge("PrivacyBridgeWADA", "PrivacyBridgeWADA", [await wada.getAddress(), await pWada.getAddress()]);

    // 7. gCOTI
    const gCoti = await deployPublic("gCOTI", "gCOTI");
    const pGCoti = await deployPrivate("PrivategCoti", "PrivateCOTITreasuryGovernanceToken");
    const bridgeGCoti = await deployBridge("PrivacyBridgegCoti", "PrivacyBridgegCoti", [await gCoti.getAddress(), await pGCoti.getAddress()]);

    // --- GRANT ROLES ---
    console.log("\n===========================================");
    console.log("   🔑 GRANTING MINTER_ROLES");
    console.log("===========================================");

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    async function grant(tokenContract, bridgeAddr, tokenName) {
        console.log(`Granting role for ${tokenName}...`);
        const tx = await tokenContract.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: GAS_LIMIT_TX });
        await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, `Grant Role ${tokenName}`);
    }

    await grant(pCoti, addresses["PrivacyBridgeCotiNative"], "PrivateCoti");
    await grant(pWeth, addresses["PrivacyBridgeWETH"], "PrivateWETH");
    await grant(pBtc, addresses["PrivacyBridgeWBTC"], "PrivateBTC");
    await grant(pUsdt, addresses["PrivacyBridgeUSDT"], "PrivateUSDT");
    await grant(pUsdc, addresses["PrivacyBridgeUSDCe"], "PrivateUSDCe");
    await grant(pWada, addresses["PrivacyBridgeWADA"], "PrivateWADA");
    await grant(pGCoti, addresses["PrivacyBridgegCoti"], "PrivategCoti");

    // --- MINT TEST TOKENS ---
    console.log("\n===========================================");
    console.log("   💰 MINTING PUBLIC TEST TOKENS");
    console.log("===========================================");

    const RECIPIENT = deployer.address;
    const MINT_AMOUNT_18 = ethers.parseUnits("5000", 18);
    const MINT_AMOUNT_6 = ethers.parseUnits("5000", 6);
    const MINT_AMOUNT_8 = ethers.parseUnits("5000", 8);

    async function mint(tokenContract, amount, tokenName) {
        console.log(`Minting 5000 ${tokenName}...`);
        try {
            let tx;
            if (tokenName === "WETH") {
                tx = await tokenContract.deposit({ value: amount, gasLimit: GAS_LIMIT_TX });
            } else {
                tx = await tokenContract.mint(RECIPIENT, amount, { gasLimit: GAS_LIMIT_TX });
            }
            await tx.wait();
            console.log(`   -> Minted`);
        } catch (e) {
            console.error(`   ❌ Failed to mint ${tokenName}:`, e.message);
        }
    }

    await mint(weth, MINT_AMOUNT_18, "WETH");
    await mint(wbtc, MINT_AMOUNT_8, "WBTC");
    await mint(usdt, MINT_AMOUNT_6, "USDT");
    await mint(usdc, MINT_AMOUNT_6, "USDCe");
    await mint(wada, MINT_AMOUNT_6, "WADA");
    await mint(gCoti, MINT_AMOUNT_18, "gCOTI");

    console.log("\n===========================================");
    console.log("   ✅ MASTER DEPLOYMENT COMPLETE");
    console.log("===========================================");

    console.table(addresses);

    console.log("\nJSON Output for Config:");
    console.log(JSON.stringify(addresses, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
