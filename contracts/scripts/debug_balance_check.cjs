const { Wallet, getDefaultProvider } = require("@coti-io/coti-ethers");
const { ethers } = require("ethers");
const { decryptUint } = require("@coti-io/coti-sdk-typescript");

// Configuration
const PRIVATE_KEY = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://testnet.coti.io/rpc";
const ONBOARD_CONTRACT_ADDRESS = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095";

async function main() {
    console.log("🚀 Starting System Health Check (Fresh Wallet Test)...");

    // 1. Setup Provider and Main Wallet
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const mainWallet = new Wallet(PRIVATE_KEY, provider);

    console.log(`👤 Main Wallet: ${mainWallet.address}`);

    // 2. Create Fresh Random Wallet
    const randomEthersWallet = ethers.Wallet.createRandom();
    const randomWallet = new Wallet(randomEthersWallet.privateKey, provider);

    console.log(`🆕 Random Wallet: ${randomWallet.address}`);

    // 3. Fund Random Wallet
    console.log("💸 Funding Random Wallet...");
    try {
        const tx = await mainWallet.sendTransaction({
            to: randomWallet.address,
            value: ethers.parseEther("0.1") // Send 0.1 COTI
        });
        console.log(`   Tx Sent: ${tx.hash}`);
        await tx.wait();
        console.log("   ✅ Funded.");
    } catch (e) {
        console.error("❌ Funding failed:", e.message);
        return;
    }

    // 4. Attempt Onboard
    console.log("🔐 Attempting to Onboard Random Wallet...");

    try {
        console.log("   Calling generateOrRecoverAes on Random Wallet...");
        // This should trigger a tx because the wallet is fresh
        const tx = await randomWallet.generateOrRecoverAes(ONBOARD_CONTRACT_ADDRESS);

        console.log(`   ✅ Onboard returned. Info:`);

        const info = randomWallet.getUserOnboardInfo();
        if (info && info.aesKey) {
            console.log(`   🎉 SUCCESS! AES Key generated: ${info.aesKey}`);
        } else {
            console.log("   ⚠️ Onboard finished but no key found?");
        }

    } catch (error) {
        console.error("❌ Onboarding FAILED:", error);
        if (error.transaction) {
            console.error("   Tx Hash:", error.transaction.hash);
        }
    }
}

main();
