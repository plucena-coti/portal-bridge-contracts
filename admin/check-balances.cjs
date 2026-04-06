const hre = require("hardhat");
async function main() {
    const weth = "0x8bca4e6bbE402DB4aD189A316137aD08206154FB";
    const bridge = "0xfF5242274eAB28379C8ae194baFDc64E55e339e0";
    const abi = ["function balanceOf(address) view returns (uint256)"];
    const token = new hre.ethers.Contract(weth, abi, hre.ethers.provider);
    const bal = await token.balanceOf(bridge);
    console.log("WETH balance of bridge:", hre.ethers.formatUnits(bal, 18));
}
main().catch(console.error);
