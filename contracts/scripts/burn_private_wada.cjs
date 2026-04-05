const { Wallet, getDefaultProvider } = require("ethers");
const { ethers } = require("hardhat");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_WADA_ADDRESS = "0xE580abc2954e8f4F94bbcbb5bbaE30747DDEC757"; // From tokens.json
const AMOUNT_TO_BURN = 9999990000000n; // 9,999,990,000,000 units

async function main() {
    console.log("🔥 Starting Burn Script for p.WADA...");

    const provider = new ethers.JsonRpcProvider("https://testnet.coti.io/rpc");
    const wallet = new Wallet(PRIVATE_KEY, provider);

    console.log(`   Wallet Address: ${wallet.address}`);

    // Check if wallet matches expected user
    const EXPECTED_USER = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
    if (wallet.address.toLowerCase() !== EXPECTED_USER.toLowerCase()) {
        console.warn(`⚠️ WARNING: Wallet address ${wallet.address} does not match requested ${EXPECTED_USER}`);
        // Proceeding anyway as I only have this key, but logging warning.
    }

    const privateWada = await ethers.getContractAt("PrivateWrappedADA", PRIVATE_WADA_ADDRESS, wallet);

    console.log(`   Contract: ${PRIVATE_WADA_ADDRESS}`);
    console.log(`   Amount to Burn: ${AMOUNT_TO_BURN.toString()} (Raw Units)`);

    try {
        // burn(uint64) is the user burn function
        const tx = await privateWada["burn(uint64)"](AMOUNT_TO_BURN);
        console.log(`   Transaction Sent: ${tx.hash}`);
        await tx.wait();
        console.log("   ✅ Burn Successful.");
    } catch (e) {
        console.error("   ❌ Burn Failed:", e.message);
        if (e.data) console.error("      Data:", e.data);
    }
}

main();
