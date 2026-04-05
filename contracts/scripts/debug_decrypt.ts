
import { encrypt, decryptUint256, encodeKey, encodeUint } from '../../coti-sdk-typescript/src/index';

// Mock function to simulate what MPC does (encrypt 256-bit value)
// or use prepareIT256 to generate input, but we need the output format locally to test decrypt.
// Actually, let's just use the functions available.

function createCiphertext256(plaintextBigInt: bigint, userAesKey: Uint8Array): { ciphertextHigh: bigint, ciphertextLow: bigint } {
    const CT_SIZE = 32;
    const BLOCK_SIZE = 16;

    // This logic must match how the contract/MPC stores it.
    // The "balanceOf" return is the RESULT of encryption.
    // In crypto_utils.ts, `decryptUint256` expects `ctUint256`.
    // We need to simulate the ENCRYPTION side that produces this.
    // The SDK `encrypt` function does: AES(random + plaintext).

    // Let's assume we can use the SDK's encrypt.

    /* 
       From crypto_utils.ts:
       decryptUint256 takes ctHigh, ctLow.
       It converts them to bytes.
       Then splits into cipher + r.
       Then decrypts: AES_DECRYPT(cipher) XOR AES_ENCRYPT(r) = plaintext.
       
       So to ENCRYPT:
       1. Generate random r (16 bytes).
       2. Encrypt r: encR = AES(r).
       3. XOR encR with plaintext = ciphertext.
       4. Return combined bytes of ciphertext + r.
    */

    // We can't easily reproduce the exact MPC encryption without the raw encrypt function exposed or rewritten here.
    // But we can check if `decryptUint256` is capable of decrypting a value we manually construct.

    return { ciphertextHigh: 0n, ciphertextLow: 0n }; // Placeholder
}

async function main() {
    console.log("🚀 Testing decryptUint256 locally...");

    const userKeyHex = "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20"; // 32 bytes
    const amount = 123456789n; // Some amount

    console.log(`Key: ${userKeyHex}`);
    console.log(`Amount: ${amount}`);

    // Since we don't have a direct "encryptUint256" function in the SDK (only prepareIT / encrypt),
    // we might struggle to construct a valid ciphertext easily without copying internal logic.
    // However, we can use `encrypt` from the SDK if it's exported.

    const keyBytes = encodeKey(userKeyHex);
    const plaintextBytes = encodeUint(amount); // 16 bytes for low part

    // Encrypt Low Part (128 bits)
    const resultLow = encrypt(keyBytes, plaintextBytes);
    // resulting .ciphertext is 16 bytes. .r is 16 bytes.
    // ctUint256 expects them packed? 
    // crypto_utils: ctLowArray = [ciphertextLow]. subarray(0, 16)=cipher, subarray(16)=r.
    // So the BigInt should be "cipher + r" concatenated.

    const lowBytes = new Uint8Array([...resultLow.ciphertext, ...resultLow.r]);
    // Decode to BigInt
    // We need a decodeUint similar to SDK
    const decodeUint = (bytes: Uint8Array) => {
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
