const hre = require("hardhat");
async function main() {
  const code = await hre.ethers.provider.getCode("0x4385441B2da842cC4D198a6a764D8b3B25CdAd4f");
  console.log("Code length:", code.length);
  const sig = hre.ethers.id("estimateDepositFee(uint256)").slice(0,10);
  console.log("estimateDepositFee selector:", sig);
  console.log("Selector in bytecode:", code.includes(sig.slice(2)));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
