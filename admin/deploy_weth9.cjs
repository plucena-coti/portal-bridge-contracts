const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying WETH9 with account:", deployer.address);

    const WETH9 = await ethers.getContractFactory("WETH9");
    const weth = await WETH9.deploy({ gasLimit: 5000000 });
    await weth.waitForDeployment();
    const addr = await weth.getAddress();

    console.log("\n✅ WETH9 deployed to:", addr);
    console.log(`\nVerify at: https://testnet.cotiscan.io/address/${addr}/contract-verification`);
    console.log("Use: WETH_StandardInput.json with compiler v0.8.20+commit.a1b79de6");
}

main().catch((e) => { console.error(e); process.exit(1); });
