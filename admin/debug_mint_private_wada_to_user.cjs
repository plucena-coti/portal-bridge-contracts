const { Wallet } = require("@coti-io/coti-ethers");
const { ethers } = require("ethers");

const PRIVATE_KEY = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://testnet.coti.io/rpc";
const PRIVATE_WADA_ADDRESS = "0xE580abc2954e8f4F94bbcbb5bbaE30747DDEC757";
const RECIPIENT = "0x0d1d978684edd5092cd7c15f370238b2b94766c8";

async function main() {
    console.log(`🚀 Minting 2000 p.WADA to ${RECIPIENT}...`);

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const deployer = new Wallet(PRIVATE_KEY, provider);

    // Set explicit key for deployer (needed for encryption)
    const AES_KEY = "8d41ade6e238d837bdbd44bac75dfac4";
    deployer.setAesKey(AES_KEY);

    const privateWada = new ethers.Contract(PRIVATE_WADA_ADDRESS, [
        "function MINTER_ROLE() view returns (bytes32)",
        "function grantRole(bytes32, address) public",
        "function mintEncrypted(address, tuple(uint256,bytes)) public",
        "function hasRole(bytes32, address) view returns (bool)"
    ], deployer);

    // 1. Ensure Deployer has MINTER_ROLE to mint
    const MINTER_ROLE = await privateWada.MINTER_ROLE();
    const hasRole = await privateWada.hasRole(MINTER_ROLE, deployer.address);

    if (!hasRole) {
        console.log("👑 Granting MINTER_ROLE to Deployer...");
        try {
            let tx = await privateWada.grantRole(MINTER_ROLE, deployer.address, { gasPrice: 10000000000n });
            await tx.wait();
            console.log("   ✅ Role Granted.");
        } catch (e) {
            console.error("   ❌ Role grant failed:", e.message);
            // Try to proceed anyway, maybe race condition or already has it
        }
    } else {
        console.log("   ✅ Deployer already has MINTER_ROLE");
    }

    // 2. Mint Encrypted (Scale down to 6 decimals)
    const amount = ethers.parseUnits("2000", 6); // 2000 p.WADA (6 decimals)
    console.log(`💎 Minting Encrypted (${amount.toString()})...`);

    try {
        const encAmount = await deployer.encryptValue(
            amount,
            PRIVATE_WADA_ADDRESS,
            privateWada.interface.getFunction("mintEncrypted").selector
        );

        let tx = await privateWada.mintEncrypted(RECIPIENT, [encAmount.ciphertext, encAmount.signature], { gasPrice: 10000000000n });
        console.log(`   Transaction Hash: ${tx.hash}`);
        await tx.wait();
        console.log("   ✅ Minted Encrypted to User.");
    } catch (e) {
        console.error("   ❌ Minting Failed:", e.message);
    }
}

main();
