const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const WETH_ADDRESS = "0x8bca4e6bbE402DB4aD189A316137aD08206154FB";
    const TARGET_ADDRESS = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    const AMOUNT = "50000";

    console.log(`Attaching to WETH at ${WETH_ADDRESS}...`);
    const WETH = await ethers.getContractFactory("WETH9");
    const weth = WETH.attach(WETH_ADDRESS);

    console.log(`Minting ${AMOUNT} WETH to ${TARGET_ADDRESS}...`);
    const amountToMint = ethers.parseUnits(AMOUNT, 18); // WETH has 18 decimals

    // Execute minting transaction
    const tx = await weth.mint(TARGET_ADDRESS, amountToMint, { gasLimit: 2000000 });
    console.log(`Transaction submitted: ${tx.hash}`);

    console.log("Waiting for confirmation...");
    await tx.wait();

    console.log("✅ Minting successful!");

    // Check new balance
    const newBalance = await weth.balanceOf(TARGET_ADDRESS);
    console.log(`New balance of ${TARGET_ADDRESS}: ${ethers.formatUnits(newBalance, 18)} WETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
