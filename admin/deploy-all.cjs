const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const newAddresses = {};

    // 1. Deploy Public Mocks
    console.log("\n--- Deploying Public Mocks ---");
    const mocks = [
        { name: "WETH9", key: "WETH" },
        { name: "WBTC", key: "WBTC" },
        { name: "USDT", key: "USDT" },
        { name: "USDCe", key: "USDC_E" }, // Fixed from USDCE to USDCe
        { name: "WADA", key: "WADA" },
        { name: "gCOTI", key: "gCOTI" } // Fixed from GCOTI to gCOTI
    ];

    for (const mock of mocks) {
        console.log(`Deploying ${mock.name}...`);
        const Factory = await hre.ethers.getContractFactory(mock.name);
        const contract = await Factory.deploy({ gasLimit: 12000000 });
        await contract.waitForDeployment();
        newAddresses[mock.key] = await contract.getAddress();
        console.log(`   Deployed at: ${newAddresses[mock.key]}`);
    }

    // 2. Deploy Private Tokens
    console.log("\n--- Deploying Private Tokens ---");
    const privateTokens = [
        { name: "PrivateCOTI", key: "PrivateCOTI", symbol: "p.COTI" },
        { name: "PrivateWrappedEther", key: "PrivateWrappedEther", symbol: "p.WETH" },
        { name: "PrivateWrappedBTC", key: "PrivateWrappedBTC", symbol: "p.WBTC" },
        { name: "PrivateTetherUSD", key: "PrivateTetherUSD", symbol: "p.USDT" },
        { name: "PrivateBridgedUSDC", key: "PrivateBridgedUSDC", symbol: "p.USDC_E" },
        { name: "PrivateWrappedADA", key: "PrivateWrappedADA", symbol: "p.WADA" },
        { name: "PrivateCOTITreasuryGovernanceToken", key: "PrivateCOTITreasuryGovernanceToken", symbol: "p.gCOTI" }
    ];

    for (const pt of privateTokens) {
        console.log(`Deploying ${pt.name}...`);
        const Factory = await hre.ethers.getContractFactory(pt.name);
        const contract = await Factory.deploy({ gasLimit: 12000000 });
        await contract.waitForDeployment();
        newAddresses[pt.key] = await contract.getAddress();
        console.log(`   Deployed at: ${newAddresses[pt.key]}`);
    }

    // 3. Deploy Bridges
    console.log("\n--- Deploying Bridges ---");
    const bridges = [
        { name: "PrivacyBridgeCotiNative", publicTokenKey: null, privateTokenKey: "PrivateCOTI", bridgeKey: "PrivacyBridgeCotiNative" },
        { name: "PrivacyBridgeWETH", publicTokenKey: "WETH", privateTokenKey: "PrivateWrappedEther", bridgeKey: "PrivacyBridgeWETH" },
        { name: "PrivacyBridgeWBTC", publicTokenKey: "WBTC", privateTokenKey: "PrivateWrappedBTC", bridgeKey: "PrivacyBridgeWBTC" },
        { name: "PrivacyBridgeUSDT", publicTokenKey: "USDT", privateTokenKey: "PrivateTetherUSD", bridgeKey: "PrivacyBridgeUSDT" },
        { name: "PrivacyBridgeUSDCe", publicTokenKey: "USDC_E", privateTokenKey: "PrivateBridgedUSDC", bridgeKey: "PrivacyBridgeUSDCe" },
        { name: "PrivacyBridgeWADA", publicTokenKey: "WADA", privateTokenKey: "PrivateWrappedADA", bridgeKey: "PrivacyBridgeWADA" },
        { name: "PrivacyBridgegCoti", publicTokenKey: "gCOTI", privateTokenKey: "PrivateCOTITreasuryGovernanceToken", bridgeKey: "PrivacyBridgegCoti" }
    ];

    for (const bridge of bridges) {
        console.log(`Deploying ${bridge.name}...`);
        const Factory = await hre.ethers.getContractFactory(bridge.name);
        let contract;
        if (bridge.publicTokenKey) {
            contract = await Factory.deploy(newAddresses[bridge.publicTokenKey], newAddresses[bridge.privateTokenKey], { gasLimit: 12000000 });
        } else {
            contract = await Factory.deploy(newAddresses[bridge.privateTokenKey], { gasLimit: 12000000 });
        }
        await contract.waitForDeployment();
        newAddresses[bridge.bridgeKey] = await contract.getAddress();
        console.log(`   Deployed at: ${newAddresses[bridge.bridgeKey]}`);
    }

    // 4. Grant Roles
    console.log("\n--- Granting Roles ---");
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const BURNER_ROLE = hre.ethers.id("BURNER_ROLE");

    for (const bridge of bridges) {
        const ptAddress = newAddresses[bridge.privateTokenKey];
        const bridgeAddress = newAddresses[bridge.bridgeKey];
        const ptContract = await hre.ethers.getContractAt("PrivateERC20", ptAddress);

        console.log(`Granting roles for ${bridge.name} on ${ptAddress}...`);

        const tx1 = await ptContract.grantRole(MINTER_ROLE, bridgeAddress, { gasLimit: 5000000 });
        await tx1.wait();
        console.log("   MINTER_ROLE granted.");

        const tx2 = await ptContract.grantRole(BURNER_ROLE, bridgeAddress, { gasLimit: 5000000 });
        await tx2.wait();
        console.log("   BURNER_ROLE granted.");
    }

    console.log("\n--- SUMMARY FOR CONFIG.TS ---");
    console.log(`
    7082400: {
      // Native
      PrivateCoti: "${newAddresses.PrivateCOTI}",
      PrivacyBridgeCotiNative: "${newAddresses.PrivacyBridgeCotiNative}",

      // Public Tokens
      WETH: "${newAddresses.WETH}",
      WBTC: "${newAddresses.WBTC}",
      USDT: "${newAddresses.USDT}",
      USDC_E: "${newAddresses.USDC_E}",
      WADA: "${newAddresses.WADA}",
      gCOTI: "${newAddresses.gCOTI}",

      // Private Tokens
      "p.WETH": "${newAddresses.PrivateWrappedEther}",
      "p.WBTC": "${newAddresses.PrivateWrappedBTC}",
      "p.USDT": "${newAddresses.PrivateTetherUSD}",
      "p.USDC_E": "${newAddresses.PrivateBridgedUSDC}",
      "p.WADA": "${newAddresses.PrivateWrappedADA}",
      "p.gCOTI": "${newAddresses.PrivateCOTITreasuryGovernanceToken}",

      // Bridges
      PrivacyBridgeWETH: "${newAddresses.PrivacyBridgeWETH}",
      PrivacyBridgeWBTC: "${newAddresses.PrivacyBridgeWBTC}",
      PrivacyBridgeUSDT: "${newAddresses.PrivacyBridgeUSDT}",
      PrivacyBridgeUSDCe: "${newAddresses.PrivacyBridgeUSDCe}",
      PrivacyBridgeWADA: "${newAddresses.PrivacyBridgeWADA}",
      PrivacyBridgegCOTI: "${newAddresses.PrivacyBridgegCoti}"
    }
    `);
}

main().catch(console.error);
