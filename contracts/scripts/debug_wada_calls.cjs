const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    // PrivateWADA Testnet Address (from tokens.json)
    const PRIVATE_WADA = "0x525d413F4D23Be42791d03dC62cdbd3f63aBfd67";

    console.log("===========================================");
    console.log("   🕵️‍♀️ DEBUG: PrivateWADA getMyBalance");
    console.log("===========================================");
    console.log(`Contract: ${PRIVATE_WADA}`);

    // 1. Create a random wallet (Un-onboarded)
    const randomWallet = ethers.Wallet.createRandom().connect(ethers.provider);
    console.log(`\n1. Random Wallet: ${randomWallet.address}`);

    // Check balance (native Coti) - need some for gas if not view?
    // getMyBalance is view. Should not need gas.

    const privateWada = await ethers.getContractAt("PrivateWrappedADA", PRIVATE_WADA, randomWallet);

    try {
        console.log("   Calling getMyBalance()...");
        const balance = await privateWada.getMyBalance();
        console.log(`   ✅ Success! Balance: ${balance}`);
    } catch (error) {
        console.log(`   ❌ Failed! Error: ${error.message}`);
        if (error.data) console.log(`   Data: ${error.data}`);
    }

    // 2. Use the Deployer/User Wallet (Likely Onboarded)
    // We assume the configured account in hardhat.config.js is the user's account?
    // Or we can use the one from env if available.
    const [signer] = await ethers.getSigners();
    console.log(`\n2. Signer Wallet: ${signer.address}`);

    const privateWadaSigner = await ethers.getContractAt("PrivateWrappedADA", PRIVATE_WADA, signer);

    try {
        console.log("   Calling getMyBalance()...");
        const balance = await privateWadaSigner.getMyBalance();
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
