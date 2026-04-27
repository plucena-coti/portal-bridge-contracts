const hre = require("hardhat");
async function main() {
  const oracle = "0xD5EeD24e909AdE249b688671e32dcc013B236B74";
  const bridges = [
    "0x863F02f14E242f8826a15cE31b753EC0e5158B94",
    "0x43676df2CE100EAD17B3824449D4e87a7F1f8E9c",
    "0x570F6aD426332a76588E71df373185E04b85849E",
    "0x06A5ad4693a3A9f371EE8374357b7Ee56f8DE583",
    "0x3B1b7227e16c7EEe0B88FB1C746A5D05546d95C7",
    "0x3DeA79Fd137dc14C6723501585422E56f67b2A40",
    "0x24aEB1c4c3e1EDA97E45E4A78378C12bab609046",
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
