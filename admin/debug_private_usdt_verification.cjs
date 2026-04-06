const { Wallet, getDefaultProvider } = require("@coti-io/coti-ethers");
const { ethers } = require("ethers");

const PRIVATE_KEY = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://testnet.coti.io/rpc";
const PRIVATE_USDT_ADDRESS = "0xdD6A49531E7a910d47f2F271AB39e95948d93adD";

async function main() {
    console.log("🚀 Starting PrivateUSDT Minting to User...");

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const deployer = new Wallet(PRIVATE_KEY, provider);

    const AES_KEY = "8d41ade6e238d837bdbd44bac75dfac4";
    deployer.setAesKey(AES_KEY);

    const privateUsdt = new ethers.Contract(PRIVATE_USDT_ADDRESS, [
        "function MINTER_ROLE() view returns (bytes32)",
        "function grantRole(bytes32, address) public",
        "function mintEncrypted(address, tuple(uint256,bytes)) public"
    ], deployer);

    // Grant Role Logic (Just in case deployer needs it to mint, though usually it has it or admin)
    // Actually our script makes sure Bridge has it. Deployer is admin.
    // We already granted role to bridge. Deployer needs it to mintEncrypted? 
    // The contract says: valid for MINTER_ROLE.
    // So we must grant MINTER_ROLE to deployer first to run this script.

    console.log("👑 Granting MINTER_ROLE to Deployer (for test minting)...");
    try {
        const MINTER_ROLE = await privateUsdt.MINTER_ROLE();
        let tx = await privateUsdt.grantRole(MINTER_ROLE, deployer.address, { gasPrice: 10000000000n });
        await tx.wait();
        console.log("   ✅ Role Granted.");
    } catch (e) {
        console.log("   warn: Role grant failed (maybe already has it):", e.message);
    }

    // 3. Mint to User
    const USER_ADDRESS = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
    console.log(`💎 Minting Encrypted (2000000) to User ${USER_ADDRESS}...`);
    try {
        const amount = 2000000n; // 2 USDT (6 decimals)
        const encAmount = await deployer.encryptValue(
            amount,
            PRIVATE_USDT_ADDRESS,
            privateUsdt.interface.getFunction("mintEncrypted").selector
        );

        let tx = await privateUsdt.mintEncrypted(USER_ADDRESS, [encAmount.ciphertext, encAmount.signature], { gasPrice: 10000000000n });
        console.log(`   Transaction Hash: ${tx.hash}`);
        await tx.wait();
        console.log("   ✅ Minted Encrypted to User.");
    } catch (e) {
        console.error("   ❌ Minting Failed:", e.message);
    }
}
main();
