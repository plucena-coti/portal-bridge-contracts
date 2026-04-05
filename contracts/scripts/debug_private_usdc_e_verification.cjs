const { Wallet, getDefaultProvider } = require("@coti-io/coti-ethers");
const { ethers } = require("ethers");
const { onboard } = require("@coti-io/coti-ethers/dist/utils/onboard");

const PRIVATE_KEY = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://testnet.coti.io/rpc";
const ONBOARD_CONTRACT_ADDRESS = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095";
const PRIVATE_USDC_E_ADDRESS = "0x0Df92729B8b7f4265FD934B720daBF42a8Fb5859";

async function main() {
    console.log("🚀 Starting PrivateUSDC.e Minting to User...");

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const deployer = new Wallet(PRIVATE_KEY, provider);

    const AES_KEY = "8d41ade6e238d837bdbd44bac75dfac4";
    deployer.setAesKey(AES_KEY);

    // Grant Role Logic
    const privateUsdc = new ethers.Contract(PRIVATE_USDC_E_ADDRESS, [
        "function MINTER_ROLE() view returns (bytes32)",
        "function grantRole(bytes32, address) public",
        "function mintEncrypted(address, tuple(uint256,bytes)) public"
    ], deployer);

    // 3. Mint to User
    const USER_ADDRESS = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
    console.log(`💎 Minting Encrypted (2000000) to User ${USER_ADDRESS}...`);
    try {
        const amount = 2000000n; // 2 USDC (6 decimals)
        const encAmount = await deployer.encryptValue(
            amount,
            PRIVATE_USDC_E_ADDRESS,
            privateUsdc.interface.getFunction("mintEncrypted").selector
        );

        let tx = await privateUsdc.mintEncrypted(USER_ADDRESS, [encAmount.ciphertext, encAmount.signature], { gasPrice: 10000000000n });
        console.log(`   Transaction Hash: ${tx.hash}`);
        await tx.wait();
        console.log("   ✅ Minted Encrypted to User.");
    } catch (e) {
        console.error("   ❌ Minting Failed:", e.message);
    }
}
main();
