const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIV_WETH_ADDR = "0xF3F5723Ae1609AfCCc7CCA0D1169d091789CDd28";
    const USER = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";

    const contract = await ethers.getContractAt("PrivateWrappedEther", PRIV_WETH_ADDR);

    console.log(`Checking p.WETH balance ciphertext for ${USER}`);

    // Use raw call or interface that supports the tuple return
    // Hardhat/Ethers should handle the struct return if ABI is correct.
    // However, PrivateERC20 abi might need to be explicit.
    // Let's try calling it. The artifact should have the correct ABI if it was compiled from the modified source.

    try {
        const bal = await contract['balanceOf(address)'](USER);
        console.log("Result:", bal);

        // Check if it looks like ctUint256 (struct/array)
        if (bal && bal.ciphertextHigh !== undefined) {
            console.log(`CiphertextHigh: ${bal.ciphertextHigh}`);
            console.log(`CiphertextLow: ${bal.ciphertextLow}`);
            if (bal.ciphertextHigh > 0n || bal.ciphertextLow > 0n) {
                console.log("✅ CIPHERTEXT FOUND (Non-zero). User has a private balance.");
            } else {
                console.log("❌ CIPHERTEXT IS ZERO. Balance is 0.");
            }
        } else {
            console.log("Unknown format:", bal);
        }
    } catch (e) {
        console.error("Error fetching balance:", e);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
