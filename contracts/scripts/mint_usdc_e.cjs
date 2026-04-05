const hre = require("hardhat");
const { ethers } = hre;

const RECIPIENT = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
// 10000 tokens with 6 decimals
const AMOUNT = ethers.parseUnits("10000", 6);
const CONTRACT_ADDRESS = "0xDDaF77C77C58804E82CC878868bCb88D1689142f";

async function main() {
    console.log(`\n🚀 Minting USDC.e to ${RECIPIENT}...`);

    const USDCe = await ethers.getContractAt("USDCe", CONTRACT_ADDRESS);

    console.log(`\n💎 Minting 10000 USDC.e...`);
    const tx = await USDCe.mint(RECIPIENT, AMOUNT, { gasLimit: 5000000 });
    console.log(`   Waiting for transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Successfully minted 10000 USDC.e to ${RECIPIENT}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
