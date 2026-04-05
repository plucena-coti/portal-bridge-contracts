const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const newAddresses = {};

    // 1. Existing Mock Addresses (from config.ts)
    const mocks = {
        WETH: "0xdC16c3c42c7cB5317462489688EAbcE37Ac48e6d",
        WBTC: "0x25B8342315DbE1E47e281832bdeC3321C14dc0B5",
        USDT: "0x313a5ee3346B68E9023F8207Aa5c3BfABd74EFaf",
        USDC_E: "0x49fD25020acD040452dB925761155B6a6F4e6adf",
        WADA: "0x124dcF7a3eB6f061345a193dcBE9DD524e06ba53",
        gCOTI: "0xe25473887d643DEdE45CE018Ce879Be5Ea41a9E1"
    };

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
        { name: "PrivacyBridgeCotiNative", publicTokenAddr: null, privateTokenKey: "PrivateCOTI", bridgeKey: "PrivacyBridgeCotiNative" },
        { name: "PrivacyBridgeWETH", publicTokenAddr: mocks.WETH, privateTokenKey: "PrivateWrappedEther", bridgeKey: "PrivacyBridgeWETH" },
        { name: "PrivacyBridgeWBTC", publicTokenAddr: mocks.WBTC, privateTokenKey: "PrivateWrappedBTC", bridgeKey: "PrivacyBridgeWBTC" },
        { name: "PrivacyBridgeUSDT", publicTokenAddr: mocks.USDT, privateTokenKey: "PrivateTetherUSD", bridgeKey: "PrivacyBridgeUSDT" },
        { name: "PrivacyBridgeUSDCe", publicTokenAddr: mocks.USDC_E, privateTokenKey: "PrivateBridgedUSDC", bridgeKey: "PrivacyBridgeUSDCe" },
        { name: "PrivacyBridgeWADA", publicTokenAddr: mocks.WADA, privateTokenKey: "PrivateWrappedADA", bridgeKey: "PrivacyBridgeWADA" },
        { name: "PrivacyBridgegCoti", publicTokenAddr: mocks.gCOTI, privateTokenKey: "PrivateCOTITreasuryGovernanceToken", bridgeKey: "PrivacyBridgegCoti" }
    ];

    for (const bridge of bridges) {
        console.log(`Deploying ${bridge.name}...`);
        const Factory = await hre.ethers.getContractFactory(bridge.name);
        let contract;
        if (bridge.publicTokenAddr) {
            contract = await Factory.deploy(bridge.publicTokenAddr, newAddresses[bridge.privateTokenKey], { gasLimit: 12000000 });
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

      // Public Tokens (Existing)
      WETH: "${mocks.WETH}",
      WBTC: "${mocks.WBTC}",
      USDT: "${mocks.USDT}",
      USDC_E: "${mocks.USDC_E}",
      WADA: "${mocks.WADA}",
      gCOTI: "${mocks.gCOTI}",

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
