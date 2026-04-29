/**
 * Test script: calls estimateDepositFee on all deployed bridges.
 * Run: npx hardhat run admin/check_estimate_fees.cjs --network cotiTestnet
 */
const hre = require("hardhat");

const bridges = [
  { name: "COTI Native", address: "0x53D22f7352d2a5728Fe3BE87012B517DD73837Ab", decimals: 18, amount: "10" },
  { name: "WETH",        address: "0x200a10077fbA0eB6619910198642C629e96ea500", decimals: 18, amount: "10" },
  { name: "WBTC",        address: "0xDbC6138Bc2E735dE9778B52768Bbdcb25Fd2D6ee", decimals: 8,  amount: "10" },
  { name: "USDT",        address: "0x00387B7d4027a3b242f138527CA92c8410413A2b", decimals: 6,  amount: "10" },
  { name: "USDC.e",      address: "0xa0Ce01ce48512769F45c7C52c65BC063A8e83dE4", decimals: 6,  amount: "10" },
  { name: "WADA",        address: "0xD07218e5DcD2b057eb98aE7A87031fE763503ea6", decimals: 6,  amount: "10" },
  { name: "gCOTI",       address: "0x4229d44fc057a70CC46d709008A6938A6fd63a67", decimals: 18, amount: "10" },
];

const ESTIMATE_ABI = [
  "function estimateDepositFee(uint256) view returns (uint256 fee, uint256 lastUpdated, uint256 blockTimestamp)",
  "function estimateWithdrawFee(uint256) view returns (uint256 fee, uint256 lastUpdated, uint256 blockTimestamp)",
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

      const [fee, lastUpdated, blockTs] = await contract.estimateDepositFee(tokenAmount);
      console.log(`  Deposit fee for ${b.amount} ${b.name}: ${hre.ethers.formatEther(fee)} COTI`);
      console.log(`  Oracle lastUpdated: ${lastUpdated} | blockTimestamp: ${blockTs}`);

      const [wFee, wLast, wBlock] = await contract.estimateWithdrawFee(tokenAmount);
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
