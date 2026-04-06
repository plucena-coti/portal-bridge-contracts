/**
 * Redeployment script for Private Tokens and Bridges only.
 *
 * This script SKIPS deploying public mocks, reusing their addresses by reading
 * them from config.ts. It deploys fresh p.tokens and bridges, grants roles,
 * and updates config.ts with the new addresses.
 *
 * Usage:
 *   npx hardhat run scripts/redeploy-all.cjs --network cotiTestnet
 */
const hre = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Redeploying with account:", deployer.address);
    console.log("Network:", hre.network.name);

    if (hre.network.name !== "cotiTestnet") {
        console.warn("⚠️ Warning: You are not deploying to 'cotiTestnet'. Auto-update of config.ts may not work as expected.");
    }

    const configPath = path.resolve(__dirname, "../src/contracts/config.ts");
    if (!fs.existsSync(configPath)) {
        throw new Error("config.ts not found. Cannot load existing public tokens.");
    }

    let configContent = fs.readFileSync(configPath, "utf8");

    // Extract current public token addresses for Testnet (7082400)
    const extractAddress = (key) => {
        const regex = new RegExp(`${key}:\\s*"([^"]+)"`);
        const match = configContent.match(regex);
        return match ? match[1] : null;
    };

    const newAddresses = {
        WETH: extractAddress("WETH"),
        WBTC: extractAddress("WBTC"),
        USDT: extractAddress("USDT"),
        USDC_E: extractAddress("USDC_E"),
        WADA: extractAddress("WADA"),
        gCOTI: extractAddress("gCOTI")
    };

    console.log("\n--- Keeping Existing Public Mocks ---");
    for (const [key, addr] of Object.entries(newAddresses)) {
        if (!addr) {
            throw new Error(`Public token ${key} not found in config.ts`);
        }
        console.log(`  ${key}: ${addr}`);
    }

    // ── 1. Deploy Private Tokens ───────────────────────────────────────────
    console.log("\n--- Deploying Private Tokens ---");
    const privateTokens = [
        { name: "PrivateCOTI", key: "PrivateCOTI" },
        { name: "PrivateWrappedEther", key: "PrivateWrappedEther" },
        { name: "PrivateWrappedBTC", key: "PrivateWrappedBTC" },
        { name: "PrivateTetherUSD", key: "PrivateTetherUSD" },
        { name: "PrivateBridgedUSDC", key: "PrivateBridgedUSDC" },
        { name: "PrivateWrappedADA", key: "PrivateWrappedADA" },
        { name: "PrivateCOTITreasuryGovernanceToken", key: "PrivateCOTITreasuryGovernanceToken" },
    ];

    for (const pt of privateTokens) {
        process.stdout.write(`  Deploying ${pt.name}... `);
        const Factory = await hre.ethers.getContractFactory(pt.name);
        const contract = await Factory.deploy({ gasLimit: 12000000 });
        await contract.waitForDeployment();
        newAddresses[pt.key] = await contract.getAddress();
        console.log(`✅ ${newAddresses[pt.key]}`);
    }

    // ── 2. Deploy Bridges ──────────────────────────────────────────────────
    console.log("\n--- Deploying Bridges ---");
    const bridges = [
        { name: "PrivacyBridgeCotiNative", publicKey: null,     privateKey: "PrivateCOTI",                          bridgeKey: "PrivacyBridgeCotiNative" },
        { name: "PrivacyBridgeWETH",        publicKey: "WETH",   privateKey: "PrivateWrappedEther",                  bridgeKey: "PrivacyBridgeWETH" },
        { name: "PrivacyBridgeWBTC",        publicKey: "WBTC",   privateKey: "PrivateWrappedBTC",                    bridgeKey: "PrivacyBridgeWBTC" },
        { name: "PrivacyBridgeUSDT",        publicKey: "USDT",   privateKey: "PrivateTetherUSD",                     bridgeKey: "PrivacyBridgeUSDT" },
        { name: "PrivacyBridgeUSDCe",       publicKey: "USDC_E", privateKey: "PrivateBridgedUSDC",                   bridgeKey: "PrivacyBridgeUSDCe" },
        { name: "PrivacyBridgeWADA",        publicKey: "WADA",   privateKey: "PrivateWrappedADA",                    bridgeKey: "PrivacyBridgeWADA" },
        { name: "PrivacyBridgegCoti",       publicKey: "gCOTI",  privateKey: "PrivateCOTITreasuryGovernanceToken",   bridgeKey: "PrivacyBridgegCoti" },
    ];

    for (const bridge of bridges) {
        process.stdout.write(`  Deploying ${bridge.name}... `);
        const Factory = await hre.ethers.getContractFactory(bridge.name);
        let contract;
        if (bridge.publicKey) {
            contract = await Factory.deploy(
                newAddresses[bridge.publicKey],
                newAddresses[bridge.privateKey],
                { gasLimit: 12000000 }
            );
        } else {
            // Native COTI bridge only takes private token address
            contract = await Factory.deploy(newAddresses[bridge.privateKey], { gasLimit: 12000000 });
        }
        await contract.waitForDeployment();
        newAddresses[bridge.bridgeKey] = await contract.getAddress();
        console.log(`✅ ${newAddresses[bridge.bridgeKey]}`);
    }

    // ── 3. Grant Roles ─────────────────────────────────────────────────────
    console.log("\n--- Granting Roles ---");
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const BURNER_ROLE  = hre.ethers.id("BURNER_ROLE");

    for (const bridge of bridges) {
        const ptAddress    = newAddresses[bridge.privateKey];
        const bridgeAddress = newAddresses[bridge.bridgeKey];
        const ptContract   = await hre.ethers.getContractAt("PrivateERC20", ptAddress);

        process.stdout.write(`  ${bridge.name}: granting MINTER_ROLE... `);
        const tx1 = await ptContract.grantRole(MINTER_ROLE, bridgeAddress, { gasLimit: 5000000 });
        await tx1.wait();
        process.stdout.write("✅  BURNER_ROLE... ");
        const tx2 = await ptContract.grantRole(BURNER_ROLE,  bridgeAddress, { gasLimit: 5000000 });
        await tx2.wait();
        console.log("✅");
    }

    // ── 4. Auto-update src/contracts/config.ts ─────────────────────────────
    console.log("\n--- Updating src/contracts/config.ts ---");

    const newTestnetBlock = `7082400: {
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
  }`;

    const testnetRegex = /7082400:\s*\{[\s\S]*?(?=,\n\s*2632500:)/;
    if (!testnetRegex.test(configContent)) {
        console.error("❌ Could not locate the COTI Testnet block in config.ts. Please update manually.");
    } else {
        configContent = configContent.replace(testnetRegex, newTestnetBlock);
        fs.writeFileSync(configPath, configContent, "utf8");
        console.log("✅ config.ts updated successfully");
    }

    // ── 5. Summary ─────────────────────────────────────────────────────────
    console.log("\n========================================================");
    console.log("  DEPLOYMENT COMPLETE");
    console.log("========================================================");
    console.log("  Public Mocks (REUSED):");
    console.log(`    WETH:                    ${newAddresses.WETH}`);
    console.log(`    WBTC:                    ${newAddresses.WBTC}`);
    console.log(`    USDT:                    ${newAddresses.USDT}`);
    console.log(`    USDC_E:                  ${newAddresses.USDC_E}`);
    console.log(`    WADA:                    ${newAddresses.WADA}`);
    console.log(`    gCOTI:                   ${newAddresses.gCOTI}`);
    console.log("  Private Tokens:");
    console.log(`    PrivateCoti:             ${newAddresses.PrivateCOTI}`);
    console.log(`    p.WETH:                  ${newAddresses.PrivateWrappedEther}`);
    console.log(`    p.WBTC:                  ${newAddresses.PrivateWrappedBTC}`);
    console.log(`    p.USDT:                  ${newAddresses.PrivateTetherUSD}`);
    console.log(`    p.USDC_E:                ${newAddresses.PrivateBridgedUSDC}`);
    console.log(`    p.WADA:                  ${newAddresses.PrivateWrappedADA}`);
    console.log(`    p.gCOTI:                 ${newAddresses.PrivateCOTITreasuryGovernanceToken}`);
    console.log("  Bridges:");
    console.log(`    PrivacyBridgeCotiNative: ${newAddresses.PrivacyBridgeCotiNative}`);
    console.log(`    PrivacyBridgeWETH:       ${newAddresses.PrivacyBridgeWETH}`);
    console.log(`    PrivacyBridgeWBTC:       ${newAddresses.PrivacyBridgeWBTC}`);
    console.log(`    PrivacyBridgeUSDT:       ${newAddresses.PrivacyBridgeUSDT}`);
    console.log(`    PrivacyBridgeUSDCe:      ${newAddresses.PrivacyBridgeUSDCe}`);
    console.log(`    PrivacyBridgeWADA:       ${newAddresses.PrivacyBridgeWADA}`);
    console.log(`    PrivacyBridgegCOTI:      ${newAddresses.PrivacyBridgegCoti}`);
    console.log("========================================================\n");
}
main().catch((e) => { console.error(e); process.exitCode = 1; });