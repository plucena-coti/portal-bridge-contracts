const hre = require("hardhat");
async function main() {
  const oracle = "0xD5EeD24e909AdE249b688671e32dcc013B236B74";
  const bridges = [
    "0x53D22f7352d2a5728Fe3BE87012B517DD73837Ab",
    "0x200a10077fbA0eB6619910198642C629e96ea500",
    "0xDbC6138Bc2E735dE9778B52768Bbdcb25Fd2D6ee",
    "0x00387B7d4027a3b242f138527CA92c8410413A2b",
    "0xa0Ce01ce48512769F45c7C52c65BC063A8e83dE4",
    "0xD07218e5DcD2b057eb98aE7A87031fE763503ea6",
    "0x4229d44fc057a70CC46d709008A6938A6fd63a67",
  ];
  for (const addr of bridges) {
    process.stdout.write("  " + addr + ": setPriceOracle... ");
    const c = await hre.ethers.getContractAt("PrivacyBridge", addr);
    const tx = await c.setPriceOracle(oracle, { gasLimit: 5000000 });
    await tx.wait();
    console.log("done");
  }
  console.log("All bridges updated to oracle:", oracle);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
