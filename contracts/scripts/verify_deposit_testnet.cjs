const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Testing Native Deposit on Testnet with:", signer.address);

    const BRIDGE_ADDRESS = "0x88a3A69B8069874b0B3ae9C45F1983CCcFc4a699"; // Testnet Native Bridge
    const P_COTI_ADDRESS = "0x5f6369c5c0F1c0f2505F2113b4fD6Da2C28E0339"; // Testnet p.COTI (PrivateCoti)
    const AMOUNT = ethers.parseEther("0.1");

    // 1. Check initial p.COTI balance (using Public Balance view if available, or just check mint event)
    // Note: Checking encrypted balance in script is hard without key. 
    // We will rely on the transaction checking for success/mint event.

    console.log(`Sending 0.1 Native COTI to ${BRIDGE_ADDRESS}...`);

    // Send native COTI directly to bridge to trigger receive() -> deposit()
    const tx = await signer.sendTransaction({
        to: BRIDGE_ADDRESS,
        value: AMOUNT,
        gasLimit: 5000000,
        gasPrice: ethers.parseUnits("30", "gwei")
    });

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();

    console.log("✅ Transaction verified on-chain");

    // Check logs for Deposit event
    // We need the interface to parse logs
    const bridge = await ethers.getContractAt("PrivacyBridgeCotiNative", BRIDGE_ADDRESS);
    const depositLog = receipt.logs.find(log => {
        try {
            const parsed = bridge.interface.parseLog(log);
            return parsed && parsed.name === 'Deposit';
        } catch (e) { return false; }
    });

    if (depositLog) {
        console.log("✅ Deposit Event found!");
    } else {
        console.log("⚠️ No Deposit event found in receipt logs (might be internal call or different emitter)");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
