
const { decryptUint } = require('../../coti-sdk-typescript/dist/index.js');
const { ethers } = require('ethers');

async function main() {
    console.log("🚀 Decrypting 4-part ctUint256...");

    const userKey = "86f6ca0fb3c6bba2c3eadae8d6b70cdd";

    // Sample from Event 1 (p.WBTC Transfer to user)
    // Result(2) [ Result(2) [Part1, Part2], Result(2) [Part3, Part4] ]
    // Values from previous log:
    // Receiver Value (Ciphertext): Result(2) [
    //   Result(2) [
    //     77308981458937166111027057061884858244240932247858072388487215468879546338640n,
    //     58799968337270172480637578351533734529145999658161433885454050750820291111089n
    //   ],
    //   Result(2) [
    //     91639178478742878316921044395667165650219596332653739301597118767795248037131n,
    //     98451751401103732467532702328770876338557116069895624894592272007043079261n
    //   ]
    // ]

    const parts = [
        77308981458937166111027057061884858244240932247858072388487215468879546338640n, // High.High (Bits 192-255)
        58799968337270172480637578351533734529145999658161433885454050750820291111089n, // High.Low  (Bits 128-191)
        91639178478742878316921044395667165650219596332653739301597118767795248037131n, // Low.High  (Bits 64-127)
        98451751401103732467532702328770876338557116069895624894592272007043079261n     // Low.Low   (Bits 0-63)
    ];

    let total = 0n;

    try {
        // Part 1
        console.log("Decrypting Part 1 (High.High)...");
        const dec1 = decryptUint(parts[0], userKey);
        console.log(`Part 1: ${dec1}`);
        total += (dec1 << 192n);

        // Part 2
        console.log("Decrypting Part 2 (High.Low)...");
        const dec2 = decryptUint(parts[1], userKey);
        console.log(`Part 2: ${dec2}`);
        total += (dec2 << 128n);

        // Part 3
        console.log("Decrypting Part 3 (Low.High)...");
        const dec3 = decryptUint(parts[2], userKey);
        console.log(`Part 3: ${dec3}`);
        total += (dec3 << 64n);

        // Part 4
        console.log("Decrypting Part 4 (Low.Low)...");
        const dec4 = decryptUint(parts[3], userKey);
        console.log(`Part 4: ${dec4}`);
        total += dec4;

        console.log(`\n🎉 Total Decrypted: ${total}`);
        console.log(`Formatted (8 decimals): ${ethers.formatUnits(total, 8)}`);

    } catch (e) {
        console.error("Decryption failed:", e);
    }
}

main();
