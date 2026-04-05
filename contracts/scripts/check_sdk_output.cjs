const { prepareIT256 } = require("@coti-io/coti-sdk-typescript-experimental");
const { ethers } = require("ethers");

async function check() {
    // Mock data for prepareIT256
    const plaintext = 100n;
    const wallet = ethers.Wallet.createRandom();
    const userKey = "00".repeat(32);
    const contractAddress = "0x".padEnd(42, '0');
    const selector = "0x12345678";

    try {
        const it = await prepareIT256(plaintext, { wallet, userKey }, contractAddress, selector);
        console.log("SDK Output Type:", typeof it);
        console.log("SDK Output Keys:", Object.keys(it));
        console.log("SDK Ciphertext Keys:", Object.keys(it.ciphertext));

        // Convert to Nested Array for Ethers
        const nestedArray = [
            [it.ciphertext.ciphertextHigh, it.ciphertext.ciphertextLow],
            it.signature
        ];
        console.log("Nested Array:", JSON.stringify(nestedArray, (k, v) => typeof v === 'bigint' ? v.toString() : v));

        const abi = ["function test(uint256 amount, ((uint256,uint256),bytes) it)"];
        const iface = new ethers.Interface(abi);
        const encoded = iface.encodeFunctionData("test", [100n, nestedArray]);
        console.log("Encoded successfully with NESTED ARRAY from SDK output");
    } catch (e) {
        console.log("Error:", e.message);
    }
}

check();
