const hre = require("hardhat");
const { ethers } = hre;

const RECIPIENT = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
const AMOUNT = ethers.parseUnits("1000", 18);

async function main() {
    console.log(`\n🚀 Redeploying WETH and minting to ${RECIPIENT}...`);

    const WETH9 = await ethers.getContractFactory("WETH9");
    const weth = await WETH9.deploy({ gasLimit: 5000000 });
    await weth.waitForDeployment();
    const wethAddr = await weth.getAddress();
    console.log(`   ✅ WETH redeployed to: ${wethAddr}`);

    console.log(`\n💎 Minting 1000 WETH...`);
    const tx = await weth.mint(RECIPIENT, AMOUNT, { gasLimit: 5000000 });
    await tx.wait();
    console.log(`   ✅ Successfully minted 1000 WETH to ${RECIPIENT}`);

    console.log(`\n📝 Please update your .env WETH_TESTNET to: ${wethAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
