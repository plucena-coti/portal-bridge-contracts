const { Wallet, getDefaultProvider } = require("@coti-io/coti-ethers");
const { ethers } = require("ethers");
const { decryptUint } = require("@coti-io/coti-sdk-typescript");
const { onboard } = require("@coti-io/coti-ethers/dist/utils/onboard");

const PRIVATE_KEY = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://mainnet.coti.io/rpc";
const ONBOARD_CONTRACT_ADDRESS = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095";
const P_WADA_ADDRESS = "0x812d3c9ee110F720b57Bea3c6dc94e32c21EB490"; // Mainnet Deployment

async function main() {
    console.log("🚀 Starting Full Fresh Wallet Test (MAINNET)...");

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const deployer = new Wallet(PRIVATE_KEY, provider);

    // Check deployer balance first
    const bal = await provider.getBalance(deployer.address);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(bal)} COTI`);

    if (bal < ethers.parseEther("0.2")) {
        console.error("❌ Not enough funds in Mainnet wallet (Need > 0.2)");
        return;
    }

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

    // 2. Fund Fresh Wallet (COTI)
    console.log("💸 Funding Fresh Wallet (0.1 COTI)...");
    try {
        let overrides = await getOverrides();
        let tx = await deployer.sendTransaction({
            to: freshWallet.address,
            value: ethers.parseEther("0.1"),
            ...overrides
        });
        console.log(`   Tx: ${tx.hash}`);
        await tx.wait();
        console.log("   ✅ Funded.");
    } catch (e) {
        console.error("   ❌ Funding failed:", e.message);
        return;
    }

    // 3. Grant Deployer MINTER_ROLE (Mainnet)
    // Note: If I just deployed it, I might already have it or not needed if I have DEFAULT_ADMIN
    // But PrivateERC20 usually grants minting to deployer? Let's check.
    // Usually deployer has admin and can grant.

    const pWada = new ethers.Contract(P_WADA_ADDRESS, [
        "function MINTER_ROLE() view returns (bytes32)",
        "function MINTER_ROLE() view returns (bytes32)",
        "function grantRole(bytes32, address) public",
        "function mint(address, uint64) public",
        "function balanceOf(address) view returns (uint256)",
        "function getMyBalance() view returns (uint256)",
        "function decimals() view returns (uint8)"
    ], deployer);

    console.log("👑 Granting MINTER_ROLE...");
    try {
        const MINTER_ROLE = await pWada.MINTER_ROLE();
        let overrides = await getOverrides();
        let tx = await pWada.grantRole(MINTER_ROLE, deployer.address, overrides);
        await tx.wait();
        console.log("   ✅ Role Granted.");
    } catch (e) {
        console.log("   warn: Role grant failed (maybe already has it?):", e.message);
    }

    // 4. Mint p.WADA to Fresh Wallet
    console.log("💎 Minting p.WADA...");
    try {
        const amount = 1000000; // 1 unit
        let overrides = await getOverrides();
        let tx = await pWada.mint(freshWallet.address, amount, overrides);
        console.log(`   Tx: ${tx.hash}`);
        await tx.wait();
        console.log("   ✅ Minted.");
    } catch (e) {
        console.error("   ❌ Minting Failed:", e.message);
        return;
    }

    // 5. Onboard Fresh Wallet
    console.log("🔐 Onboarding Fresh Wallet...");
    let aesKey;
    try {
        // Verify contract exists first
        const code = await provider.getCode(ONBOARD_CONTRACT_ADDRESS);
        if (code === "0x") {
            console.error(`❌ Onboard Contract NOT FOUND at ${ONBOARD_CONTRACT_ADDRESS} on Mainnet!`);
            return;
        }

        const result = await onboard(ONBOARD_CONTRACT_ADDRESS, freshWallet);
        console.log(`   ✅ Onboarded. Key: ${result.aesKey}`);
        aesKey = result.aesKey;
    } catch (e) {
        console.error("   ❌ Onboard Failed:", e.message);
        return;
    }

    console.log("⏳ Waiting 10s for Mainnet propagation...");
    await new Promise(r => setTimeout(r, 10000));

    // 6. Check Balance (Decryption)
    console.log("🕵️ Checking Balance Decryption...");
    try {
        const freshContract = pWada.connect(freshWallet);

        console.log("   Calling getMyBalance...");
        const encrypted = await freshContract.getMyBalance({ gasLimit: 15000000 });
        console.log(`   🔐 Encrypted: ${encrypted}`);

        const decrypted = decryptUint(encrypted, aesKey);
        console.log(`   🎉 MAINNET SUCCESS! Decrypted: ${decrypted.toString()}`);

    } catch (e) {
        console.error("   ❌ Decryption Failed:", e.message);
        if (e.data) console.error("      Data:", e.data);
    }
}

main();
