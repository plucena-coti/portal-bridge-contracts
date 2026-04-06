const hre = require("hardhat");
const { ethers } = hre;

const RECIPIENT = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
// 100 billion tokens with 6 decimals
const AMOUNT = ethers.parseUnits("100000000000", 6);
const CONTRACT_ADDRESS = "0xA53Cbe7Ac743C694f74539a73C531a60dA0fF5B8";

async function main() {
    console.log(`\n🚀 Minting 100 Billion USDT to ${RECIPIENT}...`);

    const USDT = await ethers.getContractAt("USDT", CONTRACT_ADDRESS);

    console.log(`\n💎 Minting 100,000,000,000 USDT...`);
    const tx = await USDT.mint(RECIPIENT, AMOUNT, { gasLimit: 5000000 });
    console.log(`   Waiting for transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Successfully minted 100 billion USDT to ${RECIPIENT}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });