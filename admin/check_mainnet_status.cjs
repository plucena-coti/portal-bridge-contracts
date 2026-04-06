const { ethers, Wallet } = require("ethers");
require("dotenv").config();

async function main() {
    const pk = process.env.PRIVATE_KEY || process.env.USER_PRIVATE_KEY;
    if (!pk) throw new Error("Key missing");

    const provider = new ethers.JsonRpcProvider("https://mainnet.coti.io/rpc");
    const wallet = new Wallet(pk, provider);
    const ONBOARD_ADDR = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095"; // Known onboard

    console.log(`Checking Onboard Status for ${wallet.address} on Mainnet...`);

    // The interface usually has 'userKeys(address)' or similar?
    // Let's assume standard Coti Onboard.
    // Try to read 'userKeys(address)' => returns struct or hash?

    // Actually, AccountOnboard usually has a mapping `users(address) => User`.
    // Or a function `isUserOnboarded(address)`.

    const contract = new ethers.Contract(ONBOARD_ADDR, [
        "function users(address) view returns (bytes32, bytes32)", // Guessing public mapping
        "function userKey(address) view returns (bytes)"
    ], wallet);

    try {
        // Try accessing mapping 'users'
        // Often 'users' mapping stores the encrypted key or public key
        const userData = await contract.users(wallet.address);
        console.log(`User Data: ${userData}`);
        // If userData is all zeros, user is NOT onboarded.
        if (userData[0] === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            console.log("❌ User mapping empty. NOT ONBOARDED.");
        } else {
            console.log("✅ User has data. IS ONBOARDED.");
        }
    } catch (e) {
        console.log("Could not read 'users' mapping:", e.code);

        // Try 'userKey'
        try {
            const k = await contract.userKey(wallet.address);
            console.log(`User Key: ${k}`);
        } catch (e2) {
            console.log("Could not read 'userKey':", e2.code);
        }
    }
}

main().catch(console.error);
