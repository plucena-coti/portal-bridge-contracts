const hre = require("hardhat");
async function main() {
    const bridge = "0xfF5242274eAB28379C8ae194baFDc64E55e339e0";
    const abi = ["function token() view returns (address)"];
    const c = new hre.ethers.Contract(bridge, abi, hre.ethers.provider);
    console.log(await c.token());
}
main().catch(console.error);
