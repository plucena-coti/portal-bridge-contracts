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
        console.error("\n💀 GLOBAL SCRIPT TIMEOUT (600s) REACHED. FORCE EXITING.");
        process.exit(1);
    }, 600 * 1000);

    const network = await ethers.provider.getNetwork();
    const networkName = network.name === 'unknown' ? 'cotiTestnet' : network.name;
    const explorerUrl = network.chainId === 2632500n ? "https://mainnet.cotiscan.io" : "https://testnet.cotiscan.io";

    console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);

    // Configuration for all tokens to deploy
    const tokensCtx = [
        {
            contractName: "PrivateWrappedEther",
            key: "p.WETH",
            bridgeKey: "PrivacyBridgeWETH",
            publicToken: "0x1Ef7E9e33549d394418b03152984e64388A4EE56"
        },
        {
            contractName: "PrivateWrappedBTC",
            key: "p.WBTC",
            bridgeKey: "PrivacyBridgeWBTC",
            publicToken: "0xa36e2AD641D3e69e482aA774363A92A1F9e937f0"
        },
        {
            contractName: "PrivateTetherUSD",
            key: "p.USDT",
            bridgeKey: "PrivacyBridgeUSDT",
            publicToken: "0xE0EaDda074c3B5D0808CC97EbD765B5631355226"
        },
        {
            contractName: "PrivateBridgedUSDC",
            key: "p.USDC_E",
            bridgeKey: "PrivacyBridgeUSDCe",
            publicToken: "0xdc853f1A4Fd06B118726B3c097CEaD27E47e9Ba3"
        },
        {
            contractName: "PrivateWrappedADA",
            key: "p.WADA",
            bridgeKey: "PrivacyBridgeWADA",
            publicToken: "0xAad069A539001920712489C8FF796f1444E7394e"
        },
        {
            contractName: "PrivateCOTITreasuryGovernanceToken",
            key: "p.gCOTI",
            bridgeKey: "PrivacyBridgegCOTI",
            publicToken: "0x7AC988eb3E45fe6ADB05DFaf609c8DBb4A902cdC"
        }
    ];

    const results = {};

    for (const token of tokensCtx) {
        console.log(`\n==================================================`);
        console.log(`🚀 Processing: ${token.contractName} (${token.key})`);
        console.log(`==================================================`);

        try {
            // 1. Deploy Private Token
            console.log(`   Deploying Private Token...`);
            const TokenFactory = await ethers.getContractFactory(token.contractName);
            const privateToken = await TokenFactory.deploy({ gasLimit: 12000000 });
            await waitWithTimeout(privateToken.waitForDeployment(), TIMEOUT_SECONDS, `${token.key} Private Token Deployment`);
            const privateTokenAddr = await privateToken.getAddress();
            console.log(`   ✅ Private Token Deployed: ${privateTokenAddr}`);

            // 2. Deploy Bridge
            console.log(`   Deploying Bridge (Public: ${token.publicToken})...`);
            const BridgeFactory = await ethers.getContractFactory("PrivacyBridgeERC20");
            const bridge = await BridgeFactory.deploy(token.publicToken, privateTokenAddr, { gasLimit: 12000000 });
            await waitWithTimeout(bridge.waitForDeployment(), TIMEOUT_SECONDS, `${token.key} Bridge Deployment`);
            const bridgeAddr = await bridge.getAddress();
            console.log(`   ✅ Bridge Deployed: ${bridgeAddr}`);

            // 3. Grant Permissions
            console.log(`   Granting MINTER_ROLE...`);
            const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
            const tx = await privateToken.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 12000000 });
            await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, `${token.key} Grant Role`);
            console.log(`   ✅ Permissions Granted`);

            results[token.key] = privateTokenAddr;
            results[token.bridgeKey] = bridgeAddr;

        } catch (error) {
            console.error(`❌ Failed to deploy ${token.key}:`, error);
            // Continue with others? Maybe stop?
            // Stopping to avoid partial state confusion
            process.exit(1);
        }
    }

    console.log("\n\n🎉 ALL DEPLOYMENTS COMPLETE!");
    console.log("-----------------------------------------");
    console.log(JSON.stringify(results, null, 2));
    console.log("-----------------------------------------");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
