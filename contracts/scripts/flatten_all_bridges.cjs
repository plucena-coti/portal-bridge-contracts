/**
 * flatten_all_bridges.cjs
 * Flatten all 7 bridge contracts, stripping dotenv noise from stdout.
 * Run with: ~/.nvm/versions/node/v22.13.0/bin/node contracts/scripts/flatten_all_bridges.cjs
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../");
const OUT_DIR = path.resolve(__dirname, "../flattened");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const CONTRACTS = [
  { sol: "contracts/privacyBridge/PrivacyBridgeCotiNative.sol", name: "PrivacyBridgeCotiNative" },
  { sol: "contracts/privacyBridge/PrivacyBridgeWETH.sol",       name: "PrivacyBridgeWETH" },
  { sol: "contracts/privacyBridge/PrivacyBridgeWBTC.sol",       name: "PrivacyBridgeWBTC" },
  { sol: "contracts/privacyBridge/PrivacyBridgeUSDT.sol",       name: "PrivacyBridgeUSDT" },
  { sol: "contracts/privacyBridge/PrivacyBridgeUSDCe.sol",      name: "PrivacyBridgeUSDCe" },
  { sol: "contracts/privacyBridge/PrivacyBridgeWADA.sol",       name: "PrivacyBridgeWADA" },
  { sol: "contracts/privacyBridge/PrivacyBridgegCoti.sol",      name: "PrivacyBridgegCoti" },
];

function flattenAndClean(solPath) {
  // Run flatten; stderr goes to actual stderr (warnings), stdout is the flat source
  const raw = execSync(
    `node ./node_modules/.bin/hardhat flatten ${solPath}`,
    {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
      // Pipe stderr to process.stderr so we still see warnings
      stdio: ["inherit", "pipe", "inherit"],
    }
  );

  // Strip any lines that look like dotenv output (start with [dotenv)
  const lines = raw.split("\n").filter(line => !line.startsWith("[dotenv"));

  // Deduplicate SPDX-License-Identifier (keep first only)
  let spdxSeen = false;
  const deduped = lines.filter(line => {
    if (line.trim().startsWith("// SPDX-License-Identifier:")) {
      if (spdxSeen) return false;
      spdxSeen = true;
    }
    return true;
  });

  // Deduplicate pragma solidity (keep first only)
  let pragmaSeen = false;
  const final = deduped.filter(line => {
    if (line.trim().startsWith("pragma solidity")) {
      if (pragmaSeen) return false;
      pragmaSeen = true;
    }
    return true;
  });

  return final.join("\n");
}

let allOk = true;
for (const { sol, name } of CONTRACTS) {
  process.stdout.write(`Flattening ${name}... `);
  try {
    const flat = flattenAndClean(sol);
    const outPath = path.join(OUT_DIR, `${name}_flat.sol`);
    fs.writeFileSync(outPath, flat, "utf8");
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`✅  ${outPath} (${kb} KB)`);
  } catch (e) {
    console.error(`❌  FAILED: ${e.message}`);
    allOk = false;
  }
}

if (allOk) {
  console.log("\n✅ All 7 bridge contracts flattened successfully.");
  console.log(`Output directory: ${OUT_DIR}`);
} else {
  console.error("\n⚠️  Some contracts failed to flatten.");
  process.exit(1);
}
