const { Wallet, getDefaultProvider } = require("@coti-io/coti-ethers");
const { ethers } = require("ethers");
const { decryptUint } = require("@coti-io/coti-sdk-typescript");
const { onboard } = require("@coti-io/coti-ethers/dist/utils/onboard");

const PRIVATE_KEY = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://testnet.coti.io/rpc";
const ONBOARD_CONTRACT_ADDRESS = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095";
const DEBUG_WADA_ADDRESS = "0xffEE481f5D58A3b9c6494698E0A0Eb634D6982fA";

async function main() {
    console.log("🚀 Starting DebugWADA Test (With mintEncrypted)...");

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const deployer = new Wallet(PRIVATE_KEY, provider);

    // Set explicit key for deployer too, just in case
    const AES_KEY = "8d41ade6e238d837bdbd44bac75dfac4";
    deployer.setAesKey(AES_KEY);

    // Helper for gas overrides
    async function getOverrides() {
        return {
            gasPrice: 10000000000n, // 10 gwei
        };
    }

    // 1. Create Fresh Wallet
    const randomEthersWallet = ethers.Wallet.createRandom();
    const freshWallet = new Wallet(randomEthersWallet.privateKey, provider);
    console.log(`🆕 Fresh Wallet: ${freshWallet.address}`);

    // Generate/Set matching AES key for fresh wallet to ensure it can decrypt
    // If we onboard it, we get a key.
    // If we want to use the same key as deployer for simplicity? No, onboard generates new one.

    console.log("💸 Funding Fresh Wallet...");
    try {
        let overrides = await getOverrides();
        let tx = await deployer.sendTransaction({
            to: freshWallet.address,
            value: ethers.parseEther("0.1"),
            ...overrides
        });
        await tx.wait();
        console.log("   ✅ Funded.");
    } catch (e) {
        console.error("   ❌ Funding failed:", e.message);
        return;
    }

    // 3. Grant Deployer MINTER_ROLE
    const debugWada = new ethers.Contract(DEBUG_WADA_ADDRESS, [
        "function MINTER_ROLE() view returns (bytes32)",
        "function grantRole(bytes32, address) public",
        "function mint(address, uint64) public",
        "function mintEncrypted(address, tuple(uint256,bytes)) public",
        "function balanceOf(address) view returns (uint256)",
        "function getMyBalance() view returns (uint256)",
        "function decimals() view returns (uint8)"
    ], deployer);

    console.log("👑 Granting MINTER_ROLE...");
    try {
        const MINTER_ROLE = await debugWada.MINTER_ROLE();
        let overrides = await getOverrides();
        let tx = await debugWada.grantRole(MINTER_ROLE, deployer.address, overrides);
        await tx.wait();
        console.log("   ✅ Role Granted.");
    } catch (e) {
        console.log("   warn: Role grant failed:", e.message);
    }

    // 4. Onboard first (so we have key for decrypt later)
    console.log("🔐 Onboarding Fresh Wallet...");
    let aesKey;
    try {
        const result = await onboard(ONBOARD_CONTRACT_ADDRESS, freshWallet);
        console.log(`   ✅ Onboarded.`);
        aesKey = result.aesKey;
    } catch (e) {
        console.error("   ❌ Onboard Failed:", e.message);
        return; // critical
    }

    // 5. Mint (using mintEncrypted to avoid setPublic failure)
    // We mock the Bridge encrypting the amount. 
    // The Bridge would normally use its own key, but ValidateCiphertext validates against SENDER (Deployer).
    // So Deployer encrypts 1000000.
    console.log("💎 Minting Encrypted (1000000)...");
    try {
        const amount = 1000000n;
        // Deployer encrypts
        const encAmount = await deployer.encryptValue(
            amount,
            DEBUG_WADA_ADDRESS,
            debugWada.interface.getFunction("mintEncrypted").selector
        );

        let overrides = await getOverrides();
        let tx = await debugWada.mintEncrypted(freshWallet.address, [encAmount.ciphertext, encAmount.signature], overrides);
        await tx.wait();
        console.log("   ✅ Minted Encrypted.");
    } catch (e) {
        console.error("   ❌ Minting Failed:", e.message);
        // Continue to test getMyBalance even if mint failed (balance will be 0)
    }

    console.log("⏳ Waiting 5s...");
    await new Promise(r => setTimeout(r, 5000));

    // 6. Check Decryption
    console.log("🕵️ Checking Decryption...");
    try {
        const freshContract = debugWada.connect(freshWallet);

        // CHECK 1: Read raw ciphertext (balanceOf(address)) - Should match what getMyBalance returns now
        console.log("   Reading raw ciphertext (balanceOf(address))...");
        const rawBalance = await freshContract["balanceOf(address)"](freshWallet.address);
        console.log(`   📦 Raw Ciphertext: ${rawBalance}`);


        console.log("   Calling getMyBalance (New Implementation)...");
        // It is now view, but we can call it to get CT
        const encrypted = await freshContract.getMyBalance();
        console.log(`   🔐 Encrypted: ${encrypted}`);

        const decrypted = decryptUint(encrypted, aesKey);
        console.log(`   🎉 SUCCESS! Decrypted: ${decrypted.toString()}`);

        if (BigInt(decrypted.toString()) === 1000000n) {
            console.log("   ✅ FULL SUCCESS! Balance matches.");
        } else {
            console.log("   ❌ Mismatch. Expected 1000000.");
        }

    } catch (e) {
        console.error("   ❌ Decryption Failed:", e.message);
        if (e.data) console.error("      Data:", e.data);
    }
}
main();
