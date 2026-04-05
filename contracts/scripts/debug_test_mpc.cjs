const { Wallet } = require("@coti-io/coti-ethers");
const { ethers } = require("hardhat"); // Use Hardhat's ethers

const PRIVATE_KEY = process.env.PRIVATE_KEY || "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://testnet.coti.io/rpc";
const TEST_MPC_ADDRESS = "0xf7382977A18eD2a8479FCB974313248c2e2F1C5D";

async function main() {
    console.log("🚀 Starting TestMpc Roundtrip (With storeEncrypted)...");

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new Wallet(PRIVATE_KEY, provider);

    const AES_KEY = process.env.PRIVATE_USER_AES_KEY || "56fb7c8ae08afea61ea73381a2f082bf";
    wallet.setAesKey(AES_KEY);
    console.log("🔑 AES Key set.");

    // Instantiate Contract
    // We need complete ABI or at least the parts we use
    const abi = [
        "function storeValue(uint64) public",
        "function storeEncrypted(tuple(uint256 ciphertext, bytes signature)) public",
        "function readValue() public returns (uint64)",
        "function reencryptValue() public returns (uint256)",
        "function storedCt() public view returns (uint256)"
    ];

    const testMpc = new ethers.Contract(TEST_MPC_ADDRESS, abi, wallet);

    // 1. Store Encrypted (Mimic DateGame)
    console.log("🔒 Storing Value 12345 via validateCiphertext...");

    // Encrypt 12345
    // Note: TestMpc expects itUint64, which is tuple(uint256, bytes)
    // wallet.encryptValue returns { ciphertext: 123n, signature: "0x..." }
    const input = await wallet.encryptValue(12345n, TEST_MPC_ADDRESS, testMpc.interface.getFunction("storeEncrypted").selector);

    try {
        let tx = await testMpc.storeEncrypted(input, { gasLimit: 5000000, gasPrice: 10000000000n });
        await tx.wait();
        console.log("   ✅ Stored Encrypted.");
    } catch (e) {
        console.error("   ❌ Store Encrypted Failed:", e.message);
        // Abort
        return;
    }

    // Check storedCt
    try {
        const ct = await testMpc.storedCt();
        console.log(`   📦 Stored Ciphertext: ${ct}`);
    } catch (e) {
        console.log("   Could not read storedCt:", e.message);
    }

    // 2. Test Re-encryption (offBoardToUser) - Should work if DateGame worked
    console.log("🔄 Testing reencryptValue (offBoardToUser)...");
    try {
        const ctUser = await testMpc.reencryptValue.staticCall({ gasLimit: 5000000 });
        console.log(`   🎉 SUCCESS! Re-encrypted Ciphertext: ${ctUser}`);

        // Decrypt
        const val = await wallet.decryptValue(ctUser);
        console.log(`   🔓 Decrypted: ${val}`);

        if (BigInt(val) === 12345n) {
            console.log("   ✅ FULL SUCCESS!");
        } else {
            console.log("   ❌ Decryption Mismatch (Expected 12345)");
        }

    } catch (e) {
        console.error("   ❌ Re-encrypt Failed:", e.message);
        if (e.data) console.error("      Data:", e.data);
    }

    // 3. Test readValue (MpcCore.decrypt) - Just to see
    console.log("📖 Testing readValue (MpcCore.decrypt)...");
    try {
        const val = await testMpc.readValue.staticCall({ gasLimit: 5000000 });
        console.log(`   🎉 SUCCESS! Read Value: ${val}`);
    } catch (e) {
        console.error("   ❌ Read Failed:", e.message);
    }
}

main();
