const { ethers } = require("hardhat");
// Correct import based on index.d.ts / crypto_utils.d.ts
const { buildInputText, decryptUint } = require("@coti-io/coti-sdk-typescript");

async function main() {
    console.log("🚀 Starting COTI <-> pCOTI Bridge Live Test with Encryption...");

    // Setup Signer/Wallet
    // We need a Wallet instance for the SDK to sign inputs locally
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) throw new Error("❌ PRIVATE_KEY missing in .env");

    // Connect to network provider
    const provider = ethers.provider;
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`👤 Using account: ${wallet.address}`);

    const AES_KEY = process.env.PRIVATE_AES_KEY_TESTNET;
    if (!AES_KEY) {
        throw new Error("❌ PRIVATE_AES_KEY_TESTNET is missing from .env");
    }
    console.log("🔑 AES Key loaded from environment.");

    // Addresses from src/contracts/config.ts (Testnet 7082400)
    const addresses = {
        PrivacyBridgeCotiNative: "0x1B64d8CbD261538f3fc614FF1A67B24A4a31E195",
        PrivateCoti: "0x6107a3CA7eb1b231aF1a9CD07F452F56A65a30f2"
    };

    // ABIs
    const bridgeAbi = [
        "function deposit() payable",
        "function withdraw(uint64 amount)",
        "function getBridgeBalance() view returns (uint256)"
    ];

    const pCotiAbi = [
        // Overloaded approve for Private Token
        "function approve(address spender, tuple(uint256 ciphertext, bytes signature) value) returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function getMyBalance() view returns (uint256)"
    ];

    const bridge = new ethers.Contract(addresses.PrivacyBridgeCotiNative, bridgeAbi, wallet);
    const pCoti = new ethers.Contract(addresses.PrivateCoti, pCotiAbi, wallet);

    console.log(`🌉 Bridge Address: ${addresses.PrivacyBridgeCotiNative}`);
    console.log(`🔐 pCOTI Address: ${addresses.PrivateCoti}`);

    // Amount: 0.1 COTI
    const amountBigInt = ethers.parseEther("0.1"); // 10^17 wei

    // 1. Initial Balance Check (Bridge)
    const initialBridgeBalance = await provider.getBalance(addresses.PrivacyBridgeCotiNative);
    console.log(`📊 Initial Bridge Balance (Native): ${ethers.formatEther(initialBridgeBalance)} COTI`);

    // 2. Deposit Native COTI -> pCOTI (Portal In)
    console.log("\n⬇️  ACTION 1: Deposit (Portal In) 0.1 COTI...");
    try {
        const txDeposit = await bridge.deposit({ value: amountBigInt });
        console.log(`   Tx Hash: ${txDeposit.hash}`);
        await txDeposit.wait();
        console.log("   ✅ Deposit Confirmed!");
    } catch (e) {
        console.error("   ❌ Deposit Failed:", e);
    }

    // 3. Withdraw pCOTI -> Native COTI (Portal Out)
    console.log("\n⬆️  ACTION 2: Withdraw (Portal Out) 0.1 pCOTI...");
    try {
        console.log("   🔐 Encrypting input amount for Approval...");

        // Calculate Function Selector for: approve(address,(uint256,bytes))
        // Canonical signature: approve(address,(uint256,bytes))
        // ethers.id gives Keccak256
        const selector = ethers.id("approve(address,(uint256,bytes))").slice(0, 10);
        console.log(`   ℹ️  Selector: ${selector}`);

        // Prepare Sender Object for SDK
        const sender = { wallet: wallet, userKey: AES_KEY };

        // Encrypt Amount
        // Note: buildInputText(plaintext: bigint, sender, contract, selector)
        const inputTuple = buildInputText(amountBigInt, sender, addresses.PrivateCoti, selector);

        console.log("   🔓 Approving Bridge to spend pCOTI (Encrypted)...");
        // call contract
        const txApprove = await pCoti.approve(addresses.PrivacyBridgeCotiNative, inputTuple, { gasLimit: 5000000 });
        console.log(`   Tx Hash (Approve): ${txApprove.hash}`);
        await txApprove.wait();
        console.log("   ✅ Approval Confirmed!");

        // Withdraw
        // The Bridge Contract 'withdraw' is Public/Native-switch?
        // bridge.withdraw(uint64 amount)
        // If the bridge logic simply transfers pCOTI from user to itself using transferFrom, 
        // AND transferFrom inside the bridge handles the privacy, then the user just calls 'withdraw' with plaintext amount?
        // Usually, if the bridge calls transferFrom on a private token, the bridge must be approved.
        // And the transferFrom itself might require encrypted inputs?
        // But 'withdraw' in the bridge ABI takes 'uint64'. If it takes a plaintext uint64, 
        // it means the Bridge contract acts as a spender.
        // Let's assume the Bridge withdraw is plaintext (since the ABI is uint64), 
        // but the APPROVAL required encryption (which we just did).

        console.log("   📤 Calling withdraw...");
        // Casting to BigInt is fine, Ethers handles serialization. 
        // Warning: if amountBigInt > uint64, it will fail. 0.1 ETH = 10^17. 
        // uint64 max approx 1.8 * 10^19. It fits.
        const txWithdraw = await bridge.withdraw(amountBigInt);
        console.log(`   Tx Hash (Withdraw): ${txWithdraw.hash}`);
        await txWithdraw.wait();
        console.log("   ✅ Withdraw Confirmed!");

    } catch (e) {
        console.error("   ❌ Withdraw/Approve Failed:", e);
    }

    // 4. Decrypt Private Balance
    try {
        console.log("\n🔍  Checking Private Balance...");
        const encryptedBal = await pCoti.getMyBalance({ gasLimit: 5000000 });
        if (encryptedBal.toString() === "0") {
            console.log("   ℹ️  Balance is 0 (Uninitialized)");
        } else {
            // decryptUint(ciphertext, userKey)
            const decrypted = decryptUint(encryptedBal, AES_KEY);
            console.log(`   🔓 Decrypted pCOTI Balance: ${ethers.formatEther(decrypted)}`);
        }
    } catch (e) {
        console.error("   ❌ Failed to fetch/decrypt balance:", e);
    }

    console.log("\n🎉 Test Script Finished.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
