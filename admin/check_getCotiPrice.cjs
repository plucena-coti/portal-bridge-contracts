const hre = require("hardhat");
async function main() {
  const oracle = new hre.ethers.Contract("0x4646C37BFAAd385C0c1EfFC4DB8B075DB14CD64c", [
    "function getCotiPrice() view returns (uint256)",
    "function getPrice(string) view returns (uint256)",
    "function maxStaleness() view returns (uint256)",
  ], hre.ethers.provider);
  try {
    const p = await oracle.getCotiPrice();
    console.log("getCotiPrice():", hre.ethers.formatEther(p));
  } catch (e) {
    console.log("getCotiPrice() ERROR:", e.message.split("\n")[0]);
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
