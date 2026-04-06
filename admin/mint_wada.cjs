const hre = require("hardhat");
const { ethers } = hre;

const RECIPIENT = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
// 5000 tokens with 18 decimals
const AMOUNT = ethers.parseUnits("2000", 18);
// Address will be passed as argument or filled in after deployment
// For now, I will use a placeholder or better yet, make it accept an argument if possible.
// But to keep it simple and consistent with previous scripts, I will assume we run this AFTER deployment and I will need to edit this file or pass the address.
// However, I can't easily edit it mid-flow. 
// I'll make it read from an env var or just expect to edit it. 
// Actually, I can just hardcode it AFTER the deployment step returns the address. 
// So I will create it with a placeholder for now, and update it after deployment.
const CONTRACT_ADDRESS = "0x2C7A110DA35944C4DDA4EDA440C57e73B5DEcaa5";

async function main() {
    if (CONTRACT_ADDRESS === "PLACEHOLDER_ADDRESS") {
        console.error("❌ CONTRACT_ADDRESS not set in script. Please update it.");
        process.exit(1);
    }

    console.log(`\n🚀 Minting WADA to ${RECIPIENT}...`);

    const WADA = await ethers.getContractAt("WADA", CONTRACT_ADDRESS);

    console.log(`\n💎 Minting 2000 WADA...`);
    const tx = await WADA.mint(RECIPIENT, AMOUNT, { gasLimit: 5000000 });
    console.log(`   Waiting for transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Successfully minted 2000 WADA to ${RECIPIENT}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
