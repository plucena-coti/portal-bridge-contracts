/**
 * Test script: calls estimateDepositFee on all deployed bridges.
 * Run: npx hardhat run admin/check_estimate_fees.cjs --network cotiTestnet
 */
const hre = require("hardhat");

const bridges = [
  { name: "COTI Native", address: "0x863F02f14E242f8826a15cE31b753EC0e5158B94", decimals: 18, amount: "10" },
  { name: "WETH",        address: "0x43676df2CE100EAD17B3824449D4e87a7F1f8E9c", decimals: 18, amount: "10" },
  { name: "WBTC",        address: "0x570F6aD426332a76588E71df373185E04b85849E", decimals: 8,  amount: "10" },
  { name: "USDT",        address: "0x06A5ad4693a3A9f371EE8374357b7Ee56f8DE583", decimals: 6,  amount: "10" },
  { name: "USDC.e",      address: "0x3B1b7227e16c7EEe0B88FB1C746A5D05546d95C7", decimals: 6,  amount: "10" },
  { name: "WADA",        address: "0x3DeA79Fd137dc14C6723501585422E56f67b2A40", decimals: 6,  amount: "10" },
  { name: "gCOTI",       address: "0x24aEB1c4c3e1EDA97E45E4A78378C12bab609046", decimals: 18, amount: "10" },
];

const ESTIMATE_ABI = [
  "function estimateDepositFee(uint256) view returns (uint256 fee, uint256 lastUpdated, uint256 threshold, uint256 blockTimestamp)",
  "function estimateWithdrawFee(uint256) view returns (uint256 fee, uint256 lastUpdated, uint256 threshold, uint256 blockTimestamp)",
  "function depositFixedFee() view returns (uint256)",
  "function depositPercentageBps() view returns (uint256)",
  "function depositMaxFee() view returns (uint256)",
  "function priceOracle() view returns (address)",
];

async function main() {
  console.log("=== Fee Estimation Test (10 tokens each) ===\n");

  for (const b of bridges) {
    const tokenAmount = hre.ethers.parseUnits(b.amount, b.decimals);
    const contract = new hre.ethers.Contract(b.address, ESTIMATE_ABI, hre.ethers.provider);

    try {
      const oracle = await contract.priceOracle();
      const fixedFee = await contract.depositFixedFee();
      const pctBps = await contract.depositPercentageBps();
      const maxFee = await contract.depositMaxFee();

      console.log(`--- ${b.name} (${b.address}) ---`);
      console.log(`  Oracle: ${oracle}`);
      console.log(`  Params: fixed=${hre.ethers.formatEther(fixedFee)} COTI, pct=${pctBps}/1000000, max=${hre.ethers.formatEther(maxFee)} COTI`);

      const [fee, lastUpdated, threshold, blockTs] = await contract.estimateDepositFee(tokenAmount);
      console.log(`  Deposit fee for ${b.amount} ${b.name}: ${hre.ethers.formatEther(fee)} COTI`);
      console.log(`  Oracle lastUpdated: ${lastUpdated} | threshold: ${threshold} | blockTimestamp: ${blockTs}`);

      const [wFee, wLast, wThresh, wBlock] = await contract.estimateWithdrawFee(tokenAmount);
      console.log(`  Withdraw fee for ${b.amount} ${b.name}: ${hre.ethers.formatEther(wFee)} COTI`);
      console.log("");
    } catch (err) {
      console.log(`--- ${b.name} (${b.address}) ---`);
      console.log(`  ERROR: ${err.message.split("\n")[0]}`);
      console.log("");
    }
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
