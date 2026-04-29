const hre = require("hardhat");
async function main() {
  const oracle = "0xD5EeD24e909AdE249b688671e32dcc013B236B74";
  const bridges = [
    "0x030c80358A63c4487ca415D2B6BD970dd5a55a74",
    "0xC702E9802A969245890041BBceBD2cb94c6fB129",
    "0x687FcB2d61Aa7174Ac103d4E8f5AaCDb931FDFdD",
    "0xedBd979bf769D63f1BE5D1b1782d126c5272Fdd1",
    "0xEf79b6a63199bDbEd269101Bcd8b531D2E7156bd",
    "0x33A2C1Ef2B1bD4680842691C228D6E0B58b4Cb1B",
    "0x72A8064dc61154Cfb4251895C39d346411953474",
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
