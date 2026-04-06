const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const USER = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";

    const TOKENS = [
        { name: "p.COTI", address: "0x5f6369c5c0F1c0f2505F2113b4fD6Da2C28E0339" },
        { name: "p.WETH", address: "0xF3F5723Ae1609AfCCc7CCA0D1169d091789CDd28" },
        { name: "p.WBTC", address: "0x0D3B8fAC715beA4cC4824528a65a1e959Fd05239" },
        { name: "p.USDT", address: "0x39E5e80C96BDAF0f7029e89F25b51b2758e8806E" },
        { name: "p.USDC.e", address: "0x3D943d1FD3900f3646763ccc1Fc505fa42f9b4c2" },
        { name: "p.WADA", address: "0x5bEfa82C9119f2095B5Ff85D1411B8bf92D38B90" }, // Note logs said 0 ciphertext for this one
        { name: "p.gCOTI", address: "0xe70D1eA70D64661BDf79ABC0DC01550CF93868a1" }
    ];

    console.log(`Checking account status for ${USER} on Coti Testnet`);

    for (const t of TOKENS) {
        console.log(`\n--- ${t.name} (${t.address}) ---`);
        try {
            const contract = await ethers.getContractAt("contracts/privateERC20/PrivateERC20.sol:PrivateERC20", t.address);

            // Check Balance (Ciphertext)
            // Use ABI-safe call
            const bal = await contract['balanceOf(address)'](USER);

            if (bal && bal.ciphertextHigh !== undefined) {
                const high = bal.ciphertextHigh;
                const low = bal.ciphertextLow;
                console.log(`Ciphertext: High=${high}, Low=${low}`);
                if (high > 0n || low > 0n) {
                    console.log("✅ CIPHERTEXT: PRESENT (Non-zero)");
                } else {
                    console.log("ℹ️ CIPHERTEXT: ZERO (Empty)");
                }
            } else {
                console.log("Unknown format:", bal);
            }

            // Check Onboarding if possible. 
            // MpcCore usually has 'getUserKey(address)' or similar?
            // If not exposed, we can't check explicitly.
            // But we can check if it has a 'userKey' function?
            try {
                // Warning: userKey is usually internal/private in MpcCore.
                // But let's try just in case standard interface exposes it or debug function exists.
                // Or check 'accountOnboarded(address)'?
                // Checking contract ABI for any 'key' related view functions.
            } catch (ignore) { }

        } catch (e) {
            console.error(`Error checking ${t.name}:`, e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
