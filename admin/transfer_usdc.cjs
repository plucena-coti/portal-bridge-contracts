const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();

    // Check all USDCe addresses seen so far for a balance >= 3000
    const addrs = [
        "0xdc853f1A4Fd06B118726B3c097CEaD27E47e9Ba3", // config.ts testnet
        "0xe3AC97094b43Def6Ee3cF0E51AB8d1cEE1D632a2", // from mint_test_tokens.cjs
        "0xDDaF77C77C58804E82CC878868bCb88D1689142f"  // from deploy_usdc_e.cjs
    ];

    for (const addr of addrs) {
        try {
            const usdc = await ethers.getContractAt("USDCe", addr);
            const bal = await usdc.balanceOf(deployer.address);
            console.log(`Address: ${addr} | Balance: ${ethers.formatUnits(bal, 6)}`);
            if (bal >= ethers.parseUnits("3000", 6)) {
                console.log(`Found an address with enough balance! We can use this one.`);
            }
        } catch (e) { }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
