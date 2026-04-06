
const { decryptUint256 } = require('../../coti-sdk-typescript/dist/index.js');
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIV_WBTC_ADDR = "0x0D3B8fAC715beA4cC4824528a65a1e959Fd05239";
    const USER = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    const USER_KEY = "86f6ca0fb3c6bba2c3eadae8d6b70cdd";

    console.log(`Checking Transfer decryption for ${USER} on ${PRIV_WBTC_ADDR}`);
    console.log(`Using Key: ${USER_KEY}`);

    // Use qualified name to avoid ambiguity
    const contract = await ethers.getContractAt("contracts/privateERC20/PrivateERC20.sol:PrivateERC20", PRIV_WBTC_ADDR);

    // Get Transfer events
    // Event: Transfer(address indexed from, address indexed to, ctUint256 senderValue, ctUint256 receiverValue)
    // Note: Ethers might decode tuples as Result(2) [bigint, bigint]

    const filter = contract.filters.Transfer(null, USER);
    const events = await contract.queryFilter(filter);

    console.log(`Found ${events.length} Transfer events.`);

    for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        console.log(`\nEvent ${i + 1}: Tx ${ev.transactionHash}`);

        // args: [from, to, senderValue, receiverValue]
        // receiverValue is index 3
        const receiverValue = ev.args[3];

        // Check if receiverValue is what we expect
        // It should be [ciphertextHigh, ciphertextLow]
        console.log("Receiver Value (Ciphertext):", receiverValue);

        if (!receiverValue) {
            console.log("⚠️ No receiver value found in args.");
            continue;
        }

        const ctValue = {
            ciphertextHigh: receiverValue[0], // or .high? Ethers Result access by index usually works
            ciphertextLow: receiverValue[1],  // or .low? 
            // Signature? Transfer event usually doesn't emit signature in ctUint256 struct?
            // Wait, IPrivateERC20 defines `ctUint256`. 
            // struct ctUint256 { ctUint128 high; ctUint128 low; } -> { {u64,u64}, {u64,u64} } ??
            // OR checks MpcCore.sol struct definition.
            // struct ctUint256 { ctUint128 high; ctUint128 low; }
            // struct ctUint128 { ctUint64 high; ctUint64 low; }
            // So it's NESTED.
            // [[h, l], [h, l]] ?
        };

        // Let's print the structure first to be sure how to flatten it for decryptUint256.
        // decryptUint256 in SDK expects { ciphertextHigh: bigint, ciphertextLow: bigint } (128 bits each)
        // OR { ciphertext: ... } ?

        // Actually, contract uses `ctUint256` which is split into 4x64 bits in Solidity `MpcCore`.
        // SDK `decryptUint256` expects two bigints (High 128, Low 128).
        // If the contract emits `ctUint256`, Ethers might return:
        // [ [h_hi, h_lo], [l_hi, l_lo] ] (4 parts)
        // We need to re-assemble them.

        // Let's inspect the values and flatten them.
        try {
            // Assume 4-part structure if it's nested arrays
            // receiverValue[0] = high 128 (as [64,64])
            // receiverValue[1] = low 128 (as [64,64])

            // Helper to combine 64-bit parts into 128-bit
            const combine128 = (tuple) => {
                // tuple is [high64, low64]
                return (BigInt(tuple[0]) << 64n) + BigInt(tuple[1]);
            };

            let ctHigh, ctLow;

            // Heuristic check of structure
            if (receiverValue.length === 2 && receiverValue[0].length === 2) {
                // Nested structure confirmed
                ctHigh = combine128(receiverValue[0]);
                ctLow = combine128(receiverValue[1]);
            } else {
                // Maybe simplified ABI? But logs showed Result(2) [Result(2)...]
                ctHigh = combine128(receiverValue[0]);
                ctLow = combine128(receiverValue[1]);
            }

            console.log(`Re-assembled: High=${ctHigh}, Low=${ctLow}`);

            const ctObj = {
                ciphertextHigh: ctHigh,
                ciphertextLow: ctLow
            };

            const decrypted = decryptUint256(ctObj, USER_KEY);

            // Assume WBTC (8 decimals)
            const formatted = ethers.formatUnits(decrypted, 8);
            console.log(`🔓 Decrypted Amount: ${formatted} WBTC (Raw: ${decrypted})`);

        } catch (e) {
            console.log("Decryption/Parsing Error:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
