const hre = require("hardhat");
const ORACLE_ABI = [
  "function getPriceWithMeta(string) view returns (uint256 rate, uint256 lastUpdated, uint256 blockTimestamp)",
  "function getPrice(string) view returns (uint256)",
  "function maxStaleness() view returns (uint256)",
];
async function main() {
  const oracle = new hre.ethers.Contract("0xD5EeD24e909AdE249b688671e32dcc013B236B74", ORACLE_ABI, hre.ethers.provider);
  console.log("maxStaleness:", (await oracle.maxStaleness()).toString(), "seconds");
  for (const sym of ["COTI", "ETH", "WBTC", "ADA", "USDC", "USDT"]) {
    try {
      const price = await oracle.getPrice(sym);
      console.log(sym + " price: " + hre.ethers.formatEther(price) + " USD");
    } catch (e) {
      console.log(sym + " getPrice ERROR: " + e.message.split("\n")[0]);
      // Try without staleness
      try {
        const [rate, lastUpdated, threshold, blockTs] = await oracle.getPriceWithMeta(sym);
        console.log("  getPriceWithMeta also failed");
      } catch (e2) {
        console.log("  getPriceWithMeta ERROR: " + e2.message.split("\n")[0]);
      }
    }
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
