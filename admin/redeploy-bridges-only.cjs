const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Redeploying Bridges ONLY with account:", deployer.address);
    console.log("Network:", hre.network.name);

    // From config.ts
    const PUBLIC_TOKENS = {
        WETH: "0x8bca4e6bbE402DB4aD189A316137aD08206154FB",
        WBTC: "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492",
        USDT: "0x9e961430053cd5AbB3b060544cEcCec848693Cf0",
        USDC_E: "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C",
        WADA: "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D",
        gCOTI: "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C",
    };

    const PRIVATE_TOKENS = {
        PrivateCoti: "0x03eeA59b1F0Dfeaece75531b27684DD882f79759",
        "p.WETH": "0xc79fC578D7Fe1677c72F88cAdD63D9199D56ebe0",
        "p.WBTC": "0x362F5a50423163c0f8E1bC4C8867FdC22bd74Da1",
        "p.USDT": "0xF08633c9BbcfEf6F309e84FdE6D4c49b0118C4D3",
        "p.USDC_E": "0xcA04109fE8CC1390666b78A82AeCa07de1C893C7",
        "p.WADA": "0x66c85092DaF2531E920B1f36560535E3D19985a0",
        "p.gCOTI": "0x285483dB100B068dfEf34584CA3be4B5418e9f0a",
    };

    const newAddresses = {};

    // ── Redeploy Bridges ────────────────────────────────────────────────
    console.log("\n--- Redeploying Bridges ---");
    const bridges = [
        { name: "PrivacyBridgeCotiNative", publicAddr: null, privateAddr: PRIVATE_TOKENS.PrivateCoti, bridgeKey: "PrivacyBridgeCotiNative" },
        { name: "PrivacyBridgeWETH", publicAddr: PUBLIC_TOKENS.WETH, privateAddr: PRIVATE_TOKENS["p.WETH"], bridgeKey: "PrivacyBridgeWETH" },
        { name: "PrivacyBridgeWBTC", publicAddr: PUBLIC_TOKENS.WBTC, privateAddr: PRIVATE_TOKENS["p.WBTC"], bridgeKey: "PrivacyBridgeWBTC" },
        { name: "PrivacyBridgeUSDT", publicAddr: PUBLIC_TOKENS.USDT, privateAddr: PRIVATE_TOKENS["p.USDT"], bridgeKey: "PrivacyBridgeUSDT" },
        { name: "PrivacyBridgeUSDCe", publicAddr: PUBLIC_TOKENS.USDC_E, privateAddr: PRIVATE_TOKENS["p.USDC_E"], bridgeKey: "PrivacyBridgeUSDCe" },
        { name: "PrivacyBridgeWADA", publicAddr: PUBLIC_TOKENS.WADA, privateAddr: PRIVATE_TOKENS["p.WADA"], bridgeKey: "PrivacyBridgeWADA" },
        { name: "PrivacyBridgegCoti", publicAddr: PUBLIC_TOKENS.gCOTI, privateAddr: PRIVATE_TOKENS["p.gCOTI"], bridgeKey: "PrivacyBridgegCOTI" },
    ];

    for (const bridge of bridges) {
        process.stdout.write(`  Deploying ${bridge.name}... `);
        const Factory = await hre.ethers.getContractFactory(bridge.name);
        
        let contract;
        if (bridge.publicAddr) {
            contract = await Factory.deploy(bridge.publicAddr, bridge.privateAddr, { gasLimit: 12000000 });
        } else {
            contract = await Factory.deploy(bridge.privateAddr, { gasLimit: 12000000 });
        }
        
        await contract.waitForDeployment();
        newAddresses[bridge.bridgeKey] = await contract.getAddress();
        console.log(`✅ ${newAddresses[bridge.bridgeKey]}`);
    }

    // ── Grant Roles ─────────────────────────────────────────────────────
    console.log("\n--- Granting Roles ---");
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const BURNER_ROLE  = hre.ethers.id("BURNER_ROLE");

    for (const bridge of bridges) {
        const ptAddress = bridge.privateAddr;
        const bridgeAddress = newAddresses[bridge.bridgeKey];
        
        const ptContract = await hre.ethers.getContractAt("PrivateERC20", ptAddress);

        process.stdout.write(`  ${bridge.name}: granting MINTER_ROLE... `);
        try {
            const tx1 = await ptContract.grantRole(MINTER_ROLE, bridgeAddress, { gasLimit: 5000000 });
            await tx1.wait();
            process.stdout.write("✅  BURNER_ROLE... ");
            
            const tx2 = await ptContract.grantRole(BURNER_ROLE, bridgeAddress, { gasLimit: 5000000 });
            await tx2.wait();
            console.log("✅");
        } catch (error) {
            console.log(`❌ Error granting roles for ${bridge.name}: ${error.message}`);
        }
    }

    // ── Auto-update src/contracts/config.ts ────────────────────────────
    console.log("\n--- Updating src/contracts/config.ts ---");
    const configPath = path.resolve(__dirname, "../src/contracts/config.ts");
    let configContent = fs.readFileSync(configPath, "utf8");

    const newTestnetBlock = `  7082400: {
    // Native
    PrivateCoti: "${PRIVATE_TOKENS.PrivateCoti}",
    PrivacyBridgeCotiNative: "${newAddresses.PrivacyBridgeCotiNative}",

    // Public Tokens
    WETH: "${PUBLIC_TOKENS.WETH}",
    WBTC: "${PUBLIC_TOKENS.WBTC}",
    USDT: "${PUBLIC_TOKENS.USDT}",
    USDC_E: "${PUBLIC_TOKENS.USDC_E}",
    WADA: "${PUBLIC_TOKENS.WADA}",
    gCOTI: "${PUBLIC_TOKENS.gCOTI}",

    // Private Tokens
    "p.WETH": "${PRIVATE_TOKENS["p.WETH"]}",
    "p.WBTC": "${PRIVATE_TOKENS["p.WBTC"]}",
    "p.USDT": "${PRIVATE_TOKENS["p.USDT"]}",
    "p.USDC_E": "${PRIVATE_TOKENS["p.USDC_E"]}",
    "p.WADA": "${PRIVATE_TOKENS["p.WADA"]}",
    "p.gCOTI": "${PRIVATE_TOKENS["p.gCOTI"]}",

    // Bridges
    PrivacyBridgeWETH: "${newAddresses.PrivacyBridgeWETH}",
    PrivacyBridgeWBTC: "${newAddresses.PrivacyBridgeWBTC}",
    PrivacyBridgeUSDT: "${newAddresses.PrivacyBridgeUSDT}",
    PrivacyBridgeUSDCe: "${newAddresses.PrivacyBridgeUSDCe}",
    PrivacyBridgeWADA: "${newAddresses.PrivacyBridgeWADA}",
    PrivacyBridgegCOTI: "${newAddresses.PrivacyBridgegCOTI}"
  },`;

    const testnetRegex = /7082400:\s*{[\s\S]*?(?=\s*2632500:|    \/\/\s*COTI Mainnet)/;
    
    if (testnetRegex.test(configContent)) {
        configContent = configContent.replace(testnetRegex, newTestnetBlock + "\n  ");
        fs.writeFileSync(configPath, configContent, "utf8");
        console.log("✅ config.ts updated successfully");
    } else {
        console.error("❌ Could not locate the COTI Testnet block in config.ts. Please update manually.");
    }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
