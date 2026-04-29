/**
 * Test script: calls estimateDepositFee on all deployed bridges.
 * Run: npx hardhat run admin/check_estimate_fees.cjs --network cotiTestnet
 */
const hre = require("hardhat");

const bridges = [
  { name: "COTI Native", address: "0x030c80358A63c4487ca415D2B6BD970dd5a55a74", decimals: 18, amount: "10" },
  { name: "WETH",        address: "0xC702E9802A969245890041BBceBD2cb94c6fB129", decimals: 18, amount: "10" },
  { name: "WBTC",        address: "0x687FcB2d61Aa7174Ac103d4E8f5AaCDb931FDFdD", decimals: 8,  amount: "10" },
  { name: "USDT",        address: "0xedBd979bf769D63f1BE5D1b1782d126c5272Fdd1", decimals: 6,  amount: "10" },
  { name: "USDC.e",      address: "0xEf79b6a63199bDbEd269101Bcd8b531D2E7156bd", decimals: 6,  amount: "10" },
  { name: "WADA",        address: "0x33A2C1Ef2B1bD4680842691C228D6E0B58b4Cb1B", decimals: 6,  amount: "10" },
  { name: "gCOTI",       address: "0x72A8064dc61154Cfb4251895C39d346411953474", decimals: 18, amount: "10" },
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
