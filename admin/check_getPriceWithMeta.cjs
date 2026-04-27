const hre = require("hardhat");
async function main() {
  const oracle = new hre.ethers.Contract("0xD5EeD24e909AdE249b688671e32dcc013B236B74", [
    "function getPriceWithMeta(string) view returns (uint256, uint256, uint256, uint256)",
  ], hre.ethers.provider);
  try {
    const result = await oracle.getPriceWithMeta("COTI");
    console.log("getPriceWithMeta COTI:", result.map(v => v.toString()));
  } catch (e) {
    console.log("getPriceWithMeta COTI ERROR:", e.message.split("\n")[0]);
  }
  // Also try calling estimateDepositFee directly with staticCall
  const bridge = new hre.ethers.Contract("0x4385441B2da842cC4D198a6a764D8b3B25CdAd4f", [
    "function estimateDepositFee(uint256) view returns (uint256, uint256, uint256, uint256)",
  ], hre.ethers.provider);
  try {
    const result = await bridge.estimateDepositFee(hre.ethers.parseEther("10"));
    console.log("estimateDepositFee(10 COTI):", result.map(v => v.toString()));
  } catch (e) {
    console.log("estimateDepositFee ERROR:", e.message);
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
