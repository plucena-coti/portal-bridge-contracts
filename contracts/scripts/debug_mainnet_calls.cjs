const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    // PrivateCOTI Mainnet Address (from logs/tokens.json)
    const PRIVATE_COTI = "0x953d2c8a84B9a85743Ba53dCa7789De68653be01";

    console.log("===========================================");
    console.log("   🕵️‍♀️ DEBUG: Mainnet PrivateCOTI getMyBalance");
    console.log("===========================================");
    console.log(`Contract: ${PRIVATE_COTI}`);
    console.log("Network: cotiMainnet (Simulated via RPC)");

    // 1. Create a random wallet (Un-onboarded)
    const randomWallet = ethers.Wallet.createRandom().connect(ethers.provider);
    console.log(`\n1. Random Wallet: ${randomWallet.address}`);

    // We need to use valid Mainnet RPC. configured in hardhat.config.js as cotiMainnet?
    // Running with --network cotiMainnet should set provider to Mainnet.

    const privateCoti = await ethers.getContractAt("PrivateCoti", PRIVATE_COTI, randomWallet);
    // Note: Verify artifact name "PrivateCoti" or "PrivateERC20"

    try {
        console.log("   Calling getMyBalance() with gasLimit: 6000000...");
        const balance = await privateCoti.getMyBalance({ gasLimit: 6000000 });
        console.log(`   ✅ Success! Balance: ${balance}`);
    } catch (error) {
        console.log(`   ❌ Failed! Error: ${error.message}`);
        if (error.data) console.log(`   Data: ${error.data}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
