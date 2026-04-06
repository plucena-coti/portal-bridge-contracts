const hre = require("hardhat");
const { ethers } = hre;

const RECIPIENT = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
// 7000 tokens with 6 decimals
const AMOUNT = ethers.parseUnits("7000", 6);
const CONTRACT_ADDRESS = "0xA53Cbe7Ac743C694f74539a73C531a60dA0fF5B8";

async function main() {
    console.log(`\n🚀 Minting USDT to ${RECIPIENT}...`);

    const USDT = await ethers.getContractAt("USDT", CONTRACT_ADDRESS);

    console.log(`\n💎 Minting 5000 USDT...`);
    const tx = await USDT.mint(RECIPIENT, AMOUNT, { gasLimit: 5000000 });
    console.log(`   Waiting for transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Successfully minted 5000 USDT to ${RECIPIENT}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
