/**
 * Test script: calls estimateDepositFee on all deployed bridges.
 * Run: npx hardhat run admin/check_estimate_fees.cjs --network cotiTestnet
 */
const hre = require("hardhat");

const bridges = [
  { name: "COTI Native", address: "0xe2BcD3E55f201B73ac4f31a6e9914D93cEEdD5C7", decimals: 18, amount: "10" },
  { name: "WETH",        address: "0x962b0320afFe57bC0871477077bA4A1A40347CF8", decimals: 18, amount: "10" },
  { name: "WBTC",        address: "0x9D40461fBd9512a4e616D4cCacB4Da8fB8082aDB", decimals: 8,  amount: "10" },
  { name: "USDT",        address: "0x9f93D863B47CE04c45aB61960Fac6021304E9C57", decimals: 6,  amount: "10" },
  { name: "USDC.e",      address: "0x11Bb6982c6dB8f9977357fC311afbA5f418CDD4A", decimals: 6,  amount: "10" },
  { name: "WADA",        address: "0xB6B9aAE52609f49F905423f848b0b9441F0002d0", decimals: 6,  amount: "10" },
  { name: "gCOTI",       address: "0xd2A29d7789691ED8Bd36B7206316260Fa472a3A5", decimals: 18, amount: "10" },
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
