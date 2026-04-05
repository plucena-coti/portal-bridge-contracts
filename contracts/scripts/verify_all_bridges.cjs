/**
 * Verify all 5 redeployed ERC20 bridge contracts on CotiScan testnet.
 * Uses verify_cotiscan.cjs (flattened-code method via Blockscout API).
 *
 * Usage: node contracts/scripts/verify_all_bridges.cjs
 */

const { execSync } = require("child_process");
const { ethers } = require("ethers");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../");

const BRIDGES = [
  {
    name: "PrivacyBridgeWBTC",
    address: "0x623517502761Dac598Bdf24788337b1e006BB881",
    contractName: "PrivacyBridgeWBTC",
    publicToken:  "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492",
    privateToken: "0x362F5a50423163c0f8E1bC4C8867FdC22bd74Da1",
    flatFile: path.join(ROOT, "flattened/PrivacyBridgeWBTC_flat.sol"),
  },
  {
    name: "PrivacyBridgeUSDT",
    address: "0xB2eD9486d20368d7F6Eb49019c13159aF3d61BC6",
    contractName: "PrivacyBridgeUSDT",
    publicToken:  "0x9e961430053cd5AbB3b060544cEcCec848693Cf0",
    privateToken: "0xF08633c9BbcfEf6F309e84FdE6D4c49b0118C4D3",
    flatFile: path.join(ROOT, "flattened/PrivacyBridgeUSDT_flat.sol"),
  },
  {
    name: "PrivacyBridgeUSDCe",
    address: "0x90c117e743C683897795dd6577B0f1846aD03aed",
    contractName: "PrivacyBridgeUSDCe",
    publicToken:  "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C",
    privateToken: "0xcA04109fE8CC1390666b78A82AeCa07de1C893C7",
    flatFile: path.join(ROOT, "flattened/PrivacyBridgeUSDCe_flat.sol"),
  },
  {
    name: "PrivacyBridgeWADA",
    address: "0x71c11C77a68546A2927E7a7B8aB931ac9d6526cb",
    contractName: "PrivacyBridgeWADA",
    publicToken:  "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D",
    privateToken: "0x66c85092DaF2531E920B1f36560535E3D19985a0",
    flatFile: path.join(ROOT, "flattened/PrivacyBridgeWADA_flat.sol"),
  },
  {
    name: "PrivacyBridgegCoti",
    address: "0x3d3908ee7D0aec4baa0336f987bd636CCc041A0D",
    contractName: "PrivacyBridgegCoti",
    publicToken:  "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C",
    privateToken: "0x285483dB100B068dfEf34584CA3be4B5418e9f0a",
    flatFile: path.join(ROOT, "flattened/PrivacyBridgegCoti_flat.sol"),
  },
];

const abiCoder = new ethers.AbiCoder();
const verifyScript = path.resolve(__dirname, "verify_cotiscan.cjs");

for (const bridge of BRIDGES) {
  const encodedArgs = abiCoder.encode(
    ["address", "address"],
    [bridge.publicToken, bridge.privateToken]
  ).slice(2); // remove 0x prefix

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Verifying ${bridge.name} at ${bridge.address}`);
  console.log(`  Flat file: ${bridge.flatFile}`);
  console.log(`${"=".repeat(60)}`);

  try {
    execSync(
      `node "${verifyScript}" ${bridge.address} ${bridge.contractName} "${bridge.flatFile}" ${encodedArgs}`,
      { stdio: "inherit", cwd: ROOT }
    );
  } catch (e) {
    console.error(`❌ verify_cotiscan failed for ${bridge.name}: ${e.message}`);
  }
}

console.log("\n✅ Done verifying all 5 bridges.");
