/**
 * Flatten 5 bridge contracts and deduplicate SPDX headers.
 * Writes output to contracts/flattened/<Name>_flat.sol
 *
 * Usage: npx hardhat run contracts/scripts/flatten_bridges.cjs
 * (does NOT need --network, uses default hardhat network)
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const CONTRACTS = [
  "privacyBridge/PrivacyBridgeCotiNative",
  "privacyBridge/PrivacyBridgeWETH",
  "privacyBridge/PrivacyBridgeWBTC",
  "privacyBridge/PrivacyBridgeUSDT",
  "privacyBridge/PrivacyBridgeUSDCe",
  "privacyBridge/PrivacyBridgeWADA",
  "privacyBridge/PrivacyBridgegCoti",
];

const OUT_DIR = path.resolve(__dirname, "../flattened");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const contract of CONTRACTS) {
  const name = path.basename(contract);
  const solPath = `contracts/${contract}.sol`;
  const outPath = path.join(OUT_DIR, `${name}_flat.sol`);

  console.log(`Flattening ${name}...`);
  try {
    const flat = execSync(
      `npx hardhat flatten ${solPath}`,
      { cwd: path.resolve(__dirname, "../../"), encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
    );

    // Deduplicate: keep only the first SPDX line, remove duplicates
    const lines = flat.split("\n");
    let spdxSeen = false;
    const deduped = lines.filter((line) => {
      if (line.trim().startsWith("// SPDX-License-Identifier:")) {
        if (spdxSeen) return false;
        spdxSeen = true;
      }
      return true;
    });

    fs.writeFileSync(outPath, deduped.join("\n"), "utf8");
    const size = fs.statSync(outPath).size;
    console.log(`  ✅ ${outPath} (${(size / 1024).toFixed(1)} KB)`);
  } catch (e) {
    console.error(`  ❌ Error flattening ${name}: ${e.message}`);
  }
}

console.log("\n✅ All contracts flattened.");
