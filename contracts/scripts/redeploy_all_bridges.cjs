/**
 * Redeployment script for ALL Bridge contracts only.
 *
 * Keeps the existing Public and Private Token addresses from src/contracts/config.ts.
 * After deployment it AUTOMATICALLY updates the bridge addresses in src/contracts/config.ts.
 *
 * Run with:
 *   npx hardhat compile
 *   npx hardhat run contracts/scripts/redeploy_all_bridges.cjs --network cotiTestnet
 */
const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

const TIMEOUT_SECONDS = 300;

// ── Existing token addresses (from config.ts – do NOT redeploy these) ──────────
const TOKENS = {
  // Native
  PrivateCoti: "0x03eeA59b1F0Dfeaece75531b27684DD882f79759",

  // Public Tokens
  WETH:   "0x8bca4e6bbE402DB4aD189A316137aD08206154FB",
  WBTC:   "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492",
  USDT:   "0x9e961430053cd5AbB3b060544cEcCec848693Cf0",
  USDC_E: "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C",
  WADA:   "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D",
  gCOTI:  "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C",

  // Private Tokens
  pWETH:   "0xc79fC578D7Fe1677c72F88cAdD63D9199D56ebe0",
  pWBTC:   "0x362F5a50423163c0f8E1bC4C8867FdC22bd74Da1",
  pUSDT:   "0xF08633c9BbcfEf6F309e84FdE6D4c49b0118C4D3",
  pUSDC_E: "0xcA04109fE8CC1390666b78A82AeCa07de1C893C7",
  pWADA:   "0x66c85092DaF2531E920B1f36560535E3D19985a0",
  pgCOTI:  "0x285483dB100B068dfEf34584CA3be4B5418e9f0a",
};

// ── Bridge deployment config ────────────────────────────────────────────────
const BRIDGES = [
  {
    name:           "PrivacyBridgeCotiNative",
    factory:        "PrivacyBridgeCotiNative",
    privateFactory: "PrivateCOTI",
    args:           () => [TOKENS.PrivateCoti],
    privateToken:   () => TOKENS.PrivateCoti,
  },
  {
    name:           "PrivacyBridgeWETH",
    factory:        "PrivacyBridgeWETH",
    privateFactory: "PrivateWrappedEther",
    args:           () => [TOKENS.WETH, TOKENS.pWETH],
    privateToken:   () => TOKENS.pWETH,
  },
  {
    name:           "PrivacyBridgeWBTC",
    factory:        "PrivacyBridgeWBTC",
    privateFactory: "PrivateWrappedBTC",
    args:           () => [TOKENS.WBTC, TOKENS.pWBTC],
    privateToken:   () => TOKENS.pWBTC,
  },
  {
    name:           "PrivacyBridgeUSDT",
    factory:        "PrivacyBridgeUSDT",
    privateFactory: "PrivateTetherUSD",
    args:           () => [TOKENS.USDT, TOKENS.pUSDT],
    privateToken:   () => TOKENS.pUSDT,
  },
  {
    name:           "PrivacyBridgeUSDCe",
    factory:        "PrivacyBridgeUSDCe",
    privateFactory: "PrivateBridgedUSDC",
    args:           () => [TOKENS.USDC_E, TOKENS.pUSDC_E],
    privateToken:   () => TOKENS.pUSDC_E,
  },
  {
    name:           "PrivacyBridgeWADA",
    factory:        "PrivacyBridgeWADA",
    privateFactory: "PrivateWrappedADA",
    args:           () => [TOKENS.WADA, TOKENS.pWADA],
    privateToken:   () => TOKENS.pWADA,
  },
  {
    name:           "PrivacyBridgegCOTI",
    factory:        "PrivacyBridgegCoti",
    privateFactory: "PrivateCOTITreasuryGovernanceToken",
    args:           () => [TOKENS.gCOTI, TOKENS.pgCOTI],
    privateToken:   () => TOKENS.pgCOTI,
  },
];

async function waitWithTimeout(promise, timeoutSeconds, stepName) {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error(`[${stepName}] Timed out after ${timeoutSeconds}s`)),
      timeoutSeconds * 1000
    );
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    console.log(`  [${stepName}] ✅`);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle);
    throw error;
  }
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("=======================================================");
  console.log("  🚀 REDEPLOYING ALL 7 PRIVACY BRIDGE CONTRACTS");
  console.log(`  Deployer: ${deployer.address}`);
  console.log("  (Public & Private Tokens are kept as-is)");
  console.log("=======================================================\n");

  const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
  const results = {};

  // ── 1. Deploy Bridges ────────────────────────────────────────────────────
  for (const bridge of BRIDGES) {
    console.log(`\n--- ${bridge.name} ---`);

    const Factory = await hre.ethers.getContractFactory(bridge.factory);
    console.log(`  Deploying...`);
    const deployed = await Factory.deploy(...bridge.args(), { gasLimit: 12000000 });
    await waitWithTimeout(deployed.waitForDeployment(), TIMEOUT_SECONDS, "deploy");
    const addr = await deployed.getAddress();
    console.log(`  -> ${addr}`);
    results[bridge.name] = addr;

    // Grant MINTER_ROLE on the private token to the new bridge
    console.log(`  Granting MINTER_ROLE on ${bridge.privateFactory}...`);
    const PrivateToken = await hre.ethers.getContractAt(bridge.privateFactory, bridge.privateToken());
    const tx = await PrivateToken.grantRole(MINTER_ROLE, addr, { gasLimit: 5000000 });
    await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, "grantRole");
  }

  // ── 2. Auto-update src/contracts/config.ts ───────────────────────────────
  console.log("\n--- Updating src/contracts/config.ts ---");
  const configPath = path.resolve(__dirname, "../../src/contracts/config.ts");
  let configContent = fs.readFileSync(configPath, "utf8");

  const newTestnetBlock = `  // COTI Testnet
  7082400: {
    // Native
    PrivateCoti: "${TOKENS.PrivateCoti}",
    PrivacyBridgeCotiNative: "${results.PrivacyBridgeCotiNative}",

    // Public Tokens
    WETH: "${TOKENS.WETH}",
    WBTC: "${TOKENS.WBTC}",
    USDT: "${TOKENS.USDT}",
    USDC_E: "${TOKENS.USDC_E}",
    WADA: "${TOKENS.WADA}",
    gCOTI: "${TOKENS.gCOTI}",

    // Private Tokens
    "p.WETH": "${TOKENS.pWETH}",
    "p.WBTC": "${TOKENS.pWBTC}",
    "p.USDT": "${TOKENS.pUSDT}",
    "p.USDC_E": "${TOKENS.pUSDC_E}",
    "p.WADA": "${TOKENS.pWADA}",
    "p.gCOTI": "${TOKENS.pgCOTI}",

    // Bridges
    PrivacyBridgeWETH: "${results.PrivacyBridgeWETH}",
    PrivacyBridgeWBTC: "${results.PrivacyBridgeWBTC}",
    PrivacyBridgeUSDT: "${results.PrivacyBridgeUSDT}",
    PrivacyBridgeUSDCe: "${results.PrivacyBridgeUSDCe}",
    PrivacyBridgeWADA: "${results.PrivacyBridgeWADA}",
    PrivacyBridgegCOTI: "${results.PrivacyBridgegCOTI}"
  },`;

  const testnetRegex = /\/\/ COTI Testnet[\s\S]*?(?=\/\/ COTI Mainnet)/;
  if (!testnetRegex.test(configContent)) {
    console.error("❌ Could not locate the COTI Testnet block in config.ts. Update manually.");
    process.exit(1);
  }

  configContent = configContent.replace(testnetRegex, newTestnetBlock + "\n  ");
  fs.writeFileSync(configPath, configContent, "utf8");
  console.log("✅ config.ts updated successfully");

  // ── 3. Summary ───────────────────────────────────────────────────────────
  console.log("\n=======================================================");
  console.log("  ✅ ALL 7 BRIDGES REDEPLOYED SUCCESSFULLY");
  console.log("=======================================================");
  for (const [name, addr] of Object.entries(results)) {
    console.log(`  ${name}: "${addr}"`);
  }
  console.log("\nNext Steps:");
  console.log("  1. Verify the contracts on CotiScan");
  console.log("  2. Commit & push the updated config.ts");
  console.log("=======================================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
