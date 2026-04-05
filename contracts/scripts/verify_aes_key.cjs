const { Wallet, BrowserProvider } = require("@coti-io/coti-ethers");
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    console.log("===========================================");
    console.log("   🔑 DEBUG: Verify AES Key & Decryption");
    console.log("===========================================");

    // Use PRIVATE_KEY from env
    const pk = process.env.PRIVATE_KEY;
    if (!pk) {
        throw new Error("PRIVATE_KEY not found in .env");
    }

    // Connect to Coti Mainnet
    const provider = new ethers.JsonRpcProvider("https://mainnet.coti.io/rpc");
    const wallet = new Wallet(pk, provider);

    console.log(`User Address: ${wallet.address}`);

    // TESTNET DETAILS
    const PRIVATE_WADA = "0x525d413F4D23Be42791d03dC62cdbd3f63aBfd67";
    const ONBOARD_ADDR = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095";

    // 1. Recover AES Key
    console.log("\n1. Recovering AES Key from Network...");

    try {
        // Clear any local state if possible (Wallet in SDK caches?)
        // wallet.clearUserOnboardInfo(); // if available

        console.log(`   Calling generateOrRecoverAes(${ONBOARD_ADDR})...`);
        await wallet.generateOrRecoverAes(ONBOARD_ADDR);

        const onboardInfo = wallet.getUserOnboardInfo();
        const networkKey = onboardInfo?.aesKey;

        console.log(`   ✅ Recovered Key: ${networkKey}`);

        const EXPECTED_KEY_TESTNET = "56fb7c8ae08afea61ea73381a2f082bf";
        if (networkKey === EXPECTED_KEY_TESTNET) {
            console.log("   ✅ MATCHES User's Claimed Testnet Key!");
        } else {
            console.log("   ❌ DOES NOT MATCH User's Claimed Testnet Key!");
            console.log(`      User Claims: ${EXPECTED_KEY_TESTNET}`);
            console.log(`      Network Has: ${networkKey}`);
        }

        /*
        // 2. Fetch Balance and Decrypt
        console.log("\n2. Fetching Balance from PrivateWADA...");
        
        // We use standard ethers contract but connected to Coti Wallet which handles encryption?
        // Actually, for 'view' functions returning ciphertext, we just read it.
        // For decryption, we use the key.
        
        const abi = ["function getMyBalance() view returns (uint64)"]; 
        // Note: getMyBalance returns ctUint64, which is uint64 in ABI but encrypted content.
        
        const contract = new ethers.Contract(PRIVATE_WADA, abi, wallet);
        
        // In Coti SDK, read calls might be intercepted if using Coti Contract wrapper?
        // But here we want the raw ciphertext to inspect it, OR let the wallet decrypt it.
        // The wallet (Coti-Ethers) usually attempts to decrypt if it can?
        // Let's assume standard behavior: returns the big integer (ciphertext).
        
        const balance = await contract.getMyBalance();
        console.log(`   Raw Result (Decrypted?): ${balance}`);

        // If 'balance' is small (0), then Coti-Ethers auto-decrypted it!
        // If 'balance' is huge, it is ciphertext.

        if (balance.toString() === '0') {
            console.log("   ✅ Balance is 0. Decryption Successful (or value simple).");
        } else {
            console.log("   ⚠️ Balance is huge/non-zero. Check if it is garbage or actual balance.");
            // If it matches the "suspiciously high" value from logs, then decryption failed (or wasn't attempted).
        }
        */

    } catch (e) {
        console.error("   ❌ Error:", e);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
