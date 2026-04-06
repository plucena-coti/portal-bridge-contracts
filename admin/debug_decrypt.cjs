
const { encrypt, decryptUint256, encodeKey, encodeUint } = require('../../coti-sdk-typescript/dist/index.js');

async function main() {
    console.log("🚀 Testing decryptUint256 locally (CJS)...");

    // 32-byte hex key
    const userKeyHex = "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20";
    const amount = 123456789n; // Some random amount

    console.log(`Key: ${userKeyHex}`);
    console.log(`Amount: ${amount}`);

    const keyBytes = encodeKey(userKeyHex);
    const plaintextBytes = encodeUint(amount);

    // Encrypt Low Part (128 bits)
    const resultLow = encrypt(keyBytes, plaintextBytes);
    const lowBytes = new Uint8Array([...resultLow.ciphertext, ...resultLow.r]);

    // Helper to decode bytes to BigInt
    const decodeUint = (bytes) => {
        let hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        return BigInt("0x" + hex);
    };

    const ctLowInt = decodeUint(lowBytes);

    // Encrypt High Part (0)
    const zeroBytes = new Uint8Array(16);
    const resultHigh = encrypt(keyBytes, zeroBytes);
    const highBytes = new Uint8Array([...resultHigh.ciphertext, ...resultHigh.r]);
    const ctHighInt = decodeUint(highBytes);

    console.log(`Ciphertext Low: ${ctLowInt}`);
    console.log(`Ciphertext High: ${ctHighInt}`);

    // Now try to decrypt
    const ctValue = {
        ciphertextHigh: ctHighInt,
        ciphertextLow: ctLowInt
    };

    try {
        const decrypted = decryptUint256(ctValue, userKeyHex);
        console.log(`🔓 Decrypted: ${decrypted}`);

        if (decrypted === amount) {
            console.log("✅ SUCCESS: Decrypted value matches original.");
        } else {
            console.log("❌ FAILURE: Value mismatch.");
        }
    } catch (e) {
        console.error("❌ FAILURE: Decryption threw error:", e);
    }
}

main();
