/**
 * Redeploy ONLY bridge contracts (not private tokens).
 *
 * Reuses existing public tokens and private tokens from config.ts,
 * deploys new bridge contracts, grants MINTER_ROLE + BURNER_ROLE
 * on the existing private tokens, sets the price oracle, and
 * updates both deploy/privacy_bridge/config.ts and docs/config.ts.
 *
 * Run with:
 *   npx hardhat compile
 *   npx hardhat run deploy/privacy_bridge/redeploy-bridges-only.cjs --network cotiTestnet
 *   npx hardhat run deploy/privacy_bridge/redeploy-bridges-only.cjs --network cotiMainnet
 */
const hre  = require("hardhat");
const fs   = require("fs");
const path = require("path");

const CHAIN_IDS = {
    cotiTestnet: 7082400,
    cotiMainnet: 2632500,
};

// CotiPriceConsumer deployed addresses per network
const PRICE_ORACLE = {
    7082400: "0xD5EeD24e909AdE249b688671e32dcc013B236B74", // testnet
    2632500: "0xb2Ef3da8a6CFA06e367379F566CFb3db7619DE54",                                              // mainnet — set when deployed
};

const CONFIG_PATH = path.resolve(__dirname, "config.ts");
const DOCS_CONFIG_PATH = path.resolve(__dirname, "../../docs/config.ts");

function readAddressesForChain(chainId) {
    const src = fs.readFileSync(CONFIG_PATH, "utf8");
    const startMarker = `${chainId}: {`;
    const startIdx = src.indexOf(startMarker);
    if (startIdx === -1) throw new Error(`Could not find ${chainId} block in config.ts`);

    let depth = 0, blockStart = src.indexOf("{", startIdx), i = blockStart;
    while (i < src.length) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") { depth--; if (depth === 0) break; }
        i++;
    }
    const block = src.slice(blockStart + 1, i);
    const addresses = {};
    const lineRe = /^\s*["']?([\w.]+)["']?\s*:\s*["']([^"']*)["']/gm;
    let m;
    while ((m = lineRe.exec(block)) !== null) addresses[m[1]] = m[2];
    return addresses;
}

function updateConfigBlock(filePath, chainId, newBlock) {
    if (!fs.existsSync(filePath)) return false;
    let content = fs.readFileSync(filePath, "utf8");
    const startMarker = `${chainId}: {`;
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) return false;

    let blockStart = startIdx;
    let lineStart = content.lastIndexOf("\n", startIdx - 1);
    for (let look = 0; look < 2 && lineStart > 0; look++) {
        const prevLineStart = content.lastIndexOf("\n", lineStart - 1);
        const prevLine = content.slice(prevLineStart + 1, lineStart).trim();
        if (prevLine.startsWith("//")) { blockStart = prevLineStart + 1; break; }
        if (prevLine === "") { lineStart = prevLineStart; continue; }
        break;
    }

    let depth = 0, i = content.indexOf("{", startIdx);
    while (i < content.length) {
        if (content[i] === "{") depth++;
        else if (content[i] === "}") { depth--; if (depth === 0) break; }
        i++;
    }

    content = content.slice(0, blockStart) + newBlock + content.slice(i + 1);
    fs.writeFileSync(filePath, content, "utf8");
    return true;
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const networkName = hre.network.name;
    const chainId = CHAIN_IDS[networkName];

    if (!chainId) {
        throw new Error(`Unsupported network: "${networkName}". Use --network cotiTestnet or --network cotiMainnet`);
    }

    console.log("Redeploying BRIDGES ONLY with account:", deployer.address);
    console.log("Network:", networkName, `(chainId: ${chainId})`);

    // ── Read existing addresses ────────────────────────────────────────────
    console.log("\n--- Reading existing addresses from config.ts ---");
    const current = readAddressesForChain(chainId);

    // These stay the same — we reuse them
    const existing = {
        WETH:   current["WETH"],
        WBTC:   current["WBTC"],
        USDT:   current["USDT"],
        USDC_E: current["USDC_E"],
        WADA:   current["WADA"],
        gCOTI:  current["gCOTI"],
        PrivateCoti:    current["PrivateCoti"],
        "p.WETH":       current["p.WETH"],
        "p.WBTC":       current["p.WBTC"],
        "p.USDT":       current["p.USDT"],
        "p.USDC_E":     current["p.USDC_E"],
        "p.WADA":       current["p.WADA"],
        "p.gCOTI":      current["p.gCOTI"],
    };

    console.log("  Reusing public tokens:");
    for (const k of ["WETH","WBTC","USDT","USDC_E","WADA","gCOTI"]) {
        if (!existing[k]) throw new Error(`Missing ${k} in config.ts`);
        console.log(`    ${k}: ${existing[k]}`);
    }
    console.log("  Reusing private tokens:");
    for (const k of ["PrivateCoti","p.WETH","p.WBTC","p.USDT","p.USDC_E","p.WADA","p.gCOTI"]) {
        if (!existing[k]) throw new Error(`Missing ${k} in config.ts`);
        console.log(`    ${k}: ${existing[k]}`);
    }

    // ── 1. Deploy new bridges ──────────────────────────────────────────────
    console.log("\n--- Deploying new Bridge contracts ---");
    const bridges = [
        { name: "PrivacyBridgeCotiNative", publicKey: null,       privateKey: "PrivateCoti",  bridgeKey: "PrivacyBridgeCotiNative" },
        { name: "PrivacyBridgeWETH",       publicKey: "WETH",     privateKey: "p.WETH",       bridgeKey: "PrivacyBridgeWETH" },
        { name: "PrivacyBridgeWBTC",       publicKey: "WBTC",     privateKey: "p.WBTC",       bridgeKey: "PrivacyBridgeWBTC" },
        { name: "PrivacyBridgeUSDT",       publicKey: "USDT",     privateKey: "p.USDT",       bridgeKey: "PrivacyBridgeUSDT" },
        { name: "PrivacyBridgeUSDCe",      publicKey: "USDC_E",   privateKey: "p.USDC_E",     bridgeKey: "PrivacyBridgeUSDCe" },
        { name: "PrivacyBridgeWADA",       publicKey: "WADA",     privateKey: "p.WADA",       bridgeKey: "PrivacyBridgeWADA" },
        { name: "PrivacyBridgegCoti",      publicKey: "gCOTI",    privateKey: "p.gCOTI",      bridgeKey: "PrivacyBridgegCoti" },
    ];

    const newBridgeAddresses = {};

    for (const bridge of bridges) {
        process.stdout.write(`  Deploying ${bridge.name}... `);
        const Factory = await hre.ethers.getContractFactory(bridge.name);
        let contract;
        if (bridge.publicKey) {
            contract = await Factory.deploy(
                existing[bridge.publicKey],
                existing[bridge.privateKey],
                { gasLimit: 12000000 }
            );
        } else {
            contract = await Factory.deploy(existing[bridge.privateKey], { gasLimit: 12000000 });
        }
        await contract.waitForDeployment();
        newBridgeAddresses[bridge.bridgeKey] = await contract.getAddress();
        console.log(`✅ ${newBridgeAddresses[bridge.bridgeKey]}`);
    }

    // ── 2. Grant roles on existing private tokens ────────────────────────
    console.log("\n--- Granting Roles on existing private tokens ---");
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const BURNER_ROLE = hre.ethers.id("BURNER_ROLE");

    for (const bridge of bridges) {
        const ptAddress     = existing[bridge.privateKey];
        const bridgeAddress = newBridgeAddresses[bridge.bridgeKey];
        const ptContract    = await hre.ethers.getContractAt("PrivateERC20", ptAddress);

        process.stdout.write(`  ${bridge.name}: granting MINTER_ROLE... `);
        const tx1 = await ptContract.grantRole(MINTER_ROLE, bridgeAddress, { gasLimit: 5000000 });
        await tx1.wait();
        process.stdout.write("✅  BURNER_ROLE... ");
        const tx2 = await ptContract.grantRole(BURNER_ROLE, bridgeAddress, { gasLimit: 5000000 });
        await tx2.wait();
        console.log("✅");
    }

    // ── 3. Set Price Oracle ────────────────────────────────────────────────
    console.log("\n--- Setting Price Oracle ---");
    const oracleAddr = PRICE_ORACLE[chainId];
    if (oracleAddr) {
        for (const bridge of bridges) {
            const bridgeAddress = newBridgeAddresses[bridge.bridgeKey];
            const bridgeContract = await hre.ethers.getContractAt("PrivacyBridge", bridgeAddress);
            process.stdout.write(`  ${bridge.name}: setPriceOracle... `);
            const tx = await bridgeContract.setPriceOracle(oracleAddr, { gasLimit: 5000000 });
            await tx.wait();
            console.log("✅");
        }
    } else {
        console.log("  ⚠️  No price oracle address configured for this network. Set manually.");
    }

    // ── 4. Update config files ─────────────────────────────────────────────
    console.log("\n--- Updating config files ---");

    const newBlock = `    // ${chainId === 2632500 ? "COTI Mainnet" : "COTI Testnet"}
    ${chainId}: {
    // Native
    PrivateCoti: "${existing.PrivateCoti}",
    PrivacyBridgeCotiNative: "${newBridgeAddresses.PrivacyBridgeCotiNative}",

    // Public Tokens
    WETH: "${existing.WETH}",
    WBTC: "${existing.WBTC}",
    USDT: "${existing.USDT}",
    USDC_E: "${existing.USDC_E}",
    WADA: "${existing.WADA}",
    gCOTI: "${existing.gCOTI}",

    // Private Tokens
    "p.WETH": "${existing["p.WETH"]}",
    "p.WBTC": "${existing["p.WBTC"]}",
    "p.USDT": "${existing["p.USDT"]}",
    "p.USDC_E": "${existing["p.USDC_E"]}",
    "p.WADA": "${existing["p.WADA"]}",
    "p.gCOTI": "${existing["p.gCOTI"]}",

    // Bridges
    PrivacyBridgeWETH: "${newBridgeAddresses.PrivacyBridgeWETH}",
    PrivacyBridgeWBTC: "${newBridgeAddresses.PrivacyBridgeWBTC}",
    PrivacyBridgeUSDT: "${newBridgeAddresses.PrivacyBridgeUSDT}",
    PrivacyBridgeUSDCe: "${newBridgeAddresses.PrivacyBridgeUSDCe}",
    PrivacyBridgeWADA: "${newBridgeAddresses.PrivacyBridgeWADA}",
    PrivacyBridgegCOTI: "${newBridgeAddresses.PrivacyBridgegCoti}"
  }`;

    if (updateConfigBlock(CONFIG_PATH, chainId, newBlock)) {
        console.log(`  ✅ deploy/privacy_bridge/config.ts updated`);
    } else {
        console.log(`  ❌ Could not update deploy/privacy_bridge/config.ts`);
    }

    if (updateConfigBlock(DOCS_CONFIG_PATH, chainId, newBlock)) {
        console.log(`  ✅ docs/config.ts updated`);
    } else {
        console.log(`  ⚠️  docs/config.ts not found or could not update — update manually`);
    }

    // ── 5. Summary ─────────────────────────────────────────────────────────
    console.log("\n========================================================");
    console.log("  BRIDGES-ONLY DEPLOYMENT COMPLETE");
    console.log("========================================================");
    console.log("  Reused (unchanged):");
    console.log(`    PrivateCoti:  ${existing.PrivateCoti}`);
    console.log(`    p.WETH:       ${existing["p.WETH"]}`);
    console.log(`    p.WBTC:       ${existing["p.WBTC"]}`);
    console.log(`    p.USDT:       ${existing["p.USDT"]}`);
    console.log(`    p.USDC_E:     ${existing["p.USDC_E"]}`);
    console.log(`    p.WADA:       ${existing["p.WADA"]}`);
    console.log(`    p.gCOTI:      ${existing["p.gCOTI"]}`);
    console.log("  New bridges:");
    for (const [key, addr] of Object.entries(newBridgeAddresses)) {
        console.log(`    ${key}: ${addr}`);
    }
    if (oracleAddr) console.log(`  Price Oracle:   ${oracleAddr}`);
    console.log("========================================================\n");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
