const { ethers } = require("hardhat");
async function main() {
  const contract = await ethers.getContractAt("PrivacyBridgeERC20", "0x8266a824e84D6c63c86ab79eC80064C3893Bc713");
  const maxFee = await contract.MAX_FEE_UNITS();
  const div = await contract.FEE_DIVISOR();
  const fee = await contract.depositFeeBasisPoints();
  console.log({ maxFee: maxFee.toString(), div: div.toString(), fee: fee.toString() });
}
main().catch(console.error);
