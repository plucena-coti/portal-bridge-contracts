/**
 * Redeploy ONLY private tokens.
 *
 * Deploys new private token contracts and updates deploy/privacy_bridge/config.ts
 * and docs/config.ts with the new addresses. Does NOT touch bridges.
 *
 * After running this, you will need to redeploy bridges separately
 * (redeploy-bridges-only.cjs) so they point to the new private tokens.
 *
 * Run with:
 *   npx hardhat compile
 *   npx hardhat run deploy/privacy_bridge/redeploy-private-tokens-only.cjs --network cotiTestnet
 *   npx hardhat run deploy/privacy_bridge/redeploy-private-tokens-only.cjs --network cotiMainnet
 */
const hre  = require("hardhat");
const fs   = require("fs");
const path = require("path");

const CHAIN_IDS = {
    cotiTestnet: 7082400,
    cotiMainnet: 2632500,
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

    console.log("Redeploying PRIVATE TOKENS ONLY with account:", deployer.address);
    console.log("Network:", networkName, `(chainId: ${chainId})`);

    // ── Read existing addresses (public tokens + bridges stay the same) ───
    console.log("\n--- Reading existing addresses from config.ts ---");
    const current = readAddressesForChain(chainId);

    const kept = {
        WETH:   current["WETH"],
        WBTC:   current["WBTC"],
        USDT:   current["USDT"],
        USDC_E: current["USDC_E"],
        WADA:   current["WADA"],
        gCOTI:  current["gCOTI"],
        PrivacyBridgeCotiNative: current["PrivacyBridgeCotiNative"] || "",
        PrivacyBridgeWETH:      current["PrivacyBridgeWETH"] || "",
        PrivacyBridgeWBTC:      current["PrivacyBridgeWBTC"] || "",
        PrivacyBridgeUSDT:      current["PrivacyBridgeUSDT"] || "",
        PrivacyBridgeUSDCe:     current["PrivacyBridgeUSDCe"] || "",
        PrivacyBridgeWADA:      current["PrivacyBridgeWADA"] || "",
        PrivacyBridgegCOTI:     current["PrivacyBridgegCOTI"] || "",
    };

    for (const k of ["WETH","WBTC","USDT","USDC_E","WADA","gCOTI"]) {
        if (!kept[k]) throw new Error(`Missing ${k} in config.ts`);
        console.log(`  ${k}: ${kept[k]}`);
    }

    // ── 1. Deploy new private tokens ───────────────────────────────────────
    console.log("\n--- Deploying new Private Token contracts ---");
    const privateTokens = [
        { name: "PrivateCOTI",                        configKey: "PrivateCoti" },
        { name: "PrivateWrappedEther",                 configKey: "p.WETH" },
        { name: "PrivateWrappedBTC",                   configKey: "p.WBTC" },
        { name: "PrivateTetherUSD",                    configKey: "p.USDT" },
        { name: "PrivateBridgedUSDC",                  configKey: "p.USDC_E" },
        { name: "PrivateWrappedADA",                   configKey: "p.WADA" },
        { name: "PrivateCOTITreasuryGovernanceToken",  configKey: "p.gCOTI" },
    ];

    const newPt = {};

    for (const pt of privateTokens) {
        process.stdout.write(`  Deploying ${pt.name}... `);
        const Factory = await hre.ethers.getContractFactory(pt.name);
        const contract = await Factory.deploy({ gasLimit: 12000000 });
        await contract.waitForDeployment();
        newPt[pt.configKey] = await contract.getAddress();
        console.log(`✅ ${newPt[pt.configKey]}`);
    }

    // ── 2. Update config files ─────────────────────────────────────────────
    console.log("\n--- Updating config files ---");

    const newBlock = `    // ${chainId === 2632500 ? "COTI Mainnet" : "COTI Testnet"}
    ${chainId}: {
    // Native
    PrivateCoti: "${newPt["PrivateCoti"]}",
    PrivacyBridgeCotiNative: "${kept.PrivacyBridgeCotiNative}",

    // Public Tokens
    WETH: "${kept.WETH}",
    WBTC: "${kept.WBTC}",
    USDT: "${kept.USDT}",
    USDC_E: "${kept.USDC_E}",
    WADA: "${kept.WADA}",
    gCOTI: "${kept.gCOTI}",

    // Private Tokens
    "p.WETH": "${newPt["p.WETH"]}",
    "p.WBTC": "${newPt["p.WBTC"]}",
    "p.USDT": "${newPt["p.USDT"]}",
    "p.USDC_E": "${newPt["p.USDC_E"]}",
    "p.WADA": "${newPt["p.WADA"]}",
    "p.gCOTI": "${newPt["p.gCOTI"]}",

    // Bridges
    PrivacyBridgeWETH: "${kept.PrivacyBridgeWETH}",
    PrivacyBridgeWBTC: "${kept.PrivacyBridgeWBTC}",
    PrivacyBridgeUSDT: "${kept.PrivacyBridgeUSDT}",
    PrivacyBridgeUSDCe: "${kept.PrivacyBridgeUSDCe}",
    PrivacyBridgeWADA: "${kept.PrivacyBridgeWADA}",
    PrivacyBridgegCOTI: "${kept.PrivacyBridgegCOTI}"
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

    // ── 3. Summary ─────────────────────────────────────────────────────────
    console.log("\n========================================================");
    console.log("  PRIVATE TOKENS DEPLOYMENT COMPLETE");
    console.log("========================================================");
    console.log("  New private tokens:");
    for (const [key, addr] of Object.entries(newPt)) {
        console.log(`    ${key}: ${addr}`);
    }
    console.log("\n  ⚠️  Bridges were NOT redeployed.");
    console.log("  If private tokens changed, you must redeploy bridges next:");
    console.log("    npx hardhat run deploy/privacy_bridge/redeploy-bridges-only.cjs --network " + networkName);
    console.log("========================================================\n");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
