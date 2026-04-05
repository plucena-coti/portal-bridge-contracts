const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    // Older testnet address from mint_test_tokens.cjs
    const TOKEN = { name: "USDCe_old", address: "0xe3AC97094b43Def6Ee3cF0E51AB8d1cEE1D632a2" };
    const usdc = await ethers.getContractAt("USDCe", TOKEN.address);
    const owner = await usdc.owner();
    console.log("Old USDC.e Owner is:", owner);

    const signers = await ethers.getSigners();
    console.log("Current deployer:", signers[0].address);

    if (owner.toLowerCase() === signers[0].address.toLowerCase()) {
        console.log("✅ DEPLOYER IS THE OWNER! We can mint this one.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
