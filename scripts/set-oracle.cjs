const hre = require("hardhat");
async function main() {
  const oracle = "0xD5EeD24e909AdE249b688671e32dcc013B236B74";
  const bridges = [
    "0xe2BcD3E55f201B73ac4f31a6e9914D93cEEdD5C7",
    "0x962b0320afFe57bC0871477077bA4A1A40347CF8",
    "0x9D40461fBd9512a4e616D4cCacB4Da8fB8082aDB",
    "0x9f93D863B47CE04c45aB61960Fac6021304E9C57",
    "0x11Bb6982c6dB8f9977357fC311afbA5f418CDD4A",
    "0xB6B9aAE52609f49F905423f848b0b9441F0002d0",
    "0xd2A29d7789691ED8Bd36B7206316260Fa472a3A5",
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
