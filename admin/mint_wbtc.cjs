const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const WBTC_ADDRESS = "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492";
    const RECIPIENT = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    // WBTC has 8 decimals - 1 million WBTC
    const AMOUNT = ethers.parseUnits("1000000", 8);

    console.log("===========================================");
    console.log("   💰 MINTING 1 MILLION WBTC");
    console.log("===========================================");
    console.log(`WBTC Contract: ${WBTC_ADDRESS}`);
    console.log(`Recipient: ${RECIPIENT}`);
    console.log(`Amount: 1,000,000 WBTC (${AMOUNT.toString()} with 8 decimals)`);

    const [signer] = await ethers.getSigners();
    console.log(`\nUsing signer: ${signer.address}`);

    // WBTC ABI for mint function
    const WBTC_ABI = [
        "function mint(address to, uint256 amount) external returns (bool)",
        "function balanceOf(address account) external view returns (uint256)"
    ];

    const wbtc = new ethers.Contract(WBTC_ADDRESS, WBTC_ABI, signer);

    console.log("\nMinting 1,000,000 WBTC...");
    const tx = await wbtc.mint(RECIPIENT, AMOUNT, { gasLimit: 5000000 });
    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("✅ Minting complete!");

    // Check balance
    const balance = await wbtc.balanceOf(RECIPIENT);
    console.log(`\nNew WBTC balance: ${ethers.formatUnits(balance, 8)} WBTC`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
