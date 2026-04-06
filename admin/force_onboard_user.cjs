const { Wallet, getDefaultProvider } = require("@coti-io/coti-ethers");
const { ethers } = require("ethers");
const { decryptUint } = require("@coti-io/coti-sdk-typescript");
// Import internal utils requires some hacking or direct path resolution
// because types/exports might not be exposed in main package
const { onboard } = require("@coti-io/coti-ethers/dist/utils/onboard");

// Configuration
const PRIVATE_KEY = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://testnet.coti.io/rpc";
const ONBOARD_CONTRACT_ADDRESS = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095";
const P_WADA_ADDRESS = "0x5bd3374D98Cf8D3Bf63C4FE1E7b4493b0eF12203"; // Token to test

async function main() {
    console.log("🚀 Starting FORCE Onboard Script...");

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new Wallet(PRIVATE_KEY, provider);

    console.log(`👤 Wallet: ${wallet.address}`);

    // 1. Force Onboard using Utils
    console.log("🔨 Calling internal utils.onboard()...");
    let aesKey;
    try {
        const result = await onboard(ONBOARD_CONTRACT_ADDRESS, wallet);
        console.log("   ✅ Onboard Success!");
        console.log(`   🔑 New AES Key: ${result.aesKey}`);
        console.log(`   📜 Tx Hash: ${result.txHash}`);
        aesKey = result.aesKey;
    } catch (e) {
        console.error("   ❌ Onboard Failed:", e.message);
        return;
    }

    // 2. Wait for propagation
    console.log("⏳ Waiting 10s for propagation...");
    await new Promise(r => setTimeout(r, 10000));

    // 3. Try Decryption
    console.log("🕵️ Checking p.WADA Balance Decryption...");
    try {
        const contract = new ethers.Contract(P_WADA_ADDRESS, [
            "function getMyBalance() view returns (uint256)",
            "function decimals() view returns (uint8)"
        ], wallet);

        console.log("   Calling getMyBalance...");
        const encrypted = await contract.getMyBalance({ gasLimit: 15000000 });
        console.log(`   🔐 Encrypted: ${encrypted}`);

        const decrypted = decryptUint(encrypted, aesKey);
        console.log(`   🎉 DIVINE SUCCESS! Decrypted: ${decrypted.toString()}`);
        console.log(`   Formatted: ${ethers.formatUnits(decrypted, 18)} p.WADA`);

    } catch (e) {
        console.error("   ❌ Decryption Check Failed:", e.message);
        if (e.data) console.error("      Data:", e.data);
    }
}

main();
