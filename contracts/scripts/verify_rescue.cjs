const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const BRIDGE_ADDRESS = "0xfF5242274eAB28379C8ae194baFDc64E55e339e0";
    const RECIPIENT_ADDRESS = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    const WETH_ADDRESS = "0x8bca4e6bbE402DB4aD189A316137aD08206154FB";

    console.log(`\n🔍 Verifying final balances after rescue...\n`);

    const erc20Abi = ["function balanceOf(address) view returns (uint256)", "function symbol() view returns (string)"];
    const wethContract = new ethers.Contract(WETH_ADDRESS, erc20Abi, ethers.provider);

    const bridgeBalance = await wethContract.balanceOf(BRIDGE_ADDRESS);
    const recipientBalance = await wethContract.balanceOf(RECIPIENT_ADDRESS);
    const symbol = await wethContract.symbol();

    console.log(`${symbol} Balance - Bridge:    ${ethers.formatUnits(bridgeBalance, 18)} ${symbol}`);
    console.log(`${symbol} Balance - Recipient: ${ethers.formatUnits(recipientBalance, 18)} ${symbol}`);
}

main().catch(console.error);
