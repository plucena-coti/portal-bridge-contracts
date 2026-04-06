const { ethers } = require("hardhat");

async function main() {
    const BRIDGE_ADDRESS = "0x0c2Af91D8ddf3D02c4A5e31daf4926E4c2265ed2";
    const PRIVATE_COTI_ADDRESS = "0x074A10a5Cb95436CF8FC966d7Bb9809458bf72a4";

    console.log("\n=== Withdraw Remaining Funds from Old Bridge ===");

    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Get bridge contract
    const Bridge = await ethers.getContractFactory("PrivacyBridgeCoti");
    const bridge = Bridge.attach(BRIDGE_ADDRESS);

    // Get PrivateCoti contract
    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = PrivateCoti.attach(PRIVATE_COTI_ADDRESS);

    console.log("\n1. Checking bridge owner...");
    const owner = await bridge.owner();
    console.log("   Bridge owner:", owner);
    console.log("   Is signer owner?", owner.toLowerCase() === signer.address.toLowerCase());

    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        console.log("\n❌ ERROR: Signer is not the bridge owner!");
        console.log("   Cannot withdraw funds.");
        return;
    }

    console.log("\n2. Checking balances...");
    const bridgeBalance = await ethers.provider.getBalance(BRIDGE_ADDRESS);
    const balanceInCoti = ethers.formatEther(bridgeBalance);
    console.log("   Bridge COTI balance:", balanceInCoti, "COTI");

    if (bridgeBalance === 0n) {
        console.log("\n✅ Bridge is empty, nothing to withdraw");
        return;
    }

    console.log("\n3. Withdrawing", balanceInCoti, "COTI to owner...");

    // The withdraw amount needs to be in uint64 format
    const withdrawAmount = bridgeBalance;

    console.log("   Withdraw amount (wei):", withdrawAmount.toString());
    console.log("   Withdraw amount (uint64):", Number(withdrawAmount));

    // Call withdraw function
    const tx = await bridge.withdraw(withdrawAmount, { gasLimit: 12000000 });
    console.log("   Transaction hash:", tx.hash);
    console.log("   Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("   ✅ Transaction confirmed!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());

    console.log("\n4. Verifying...");
    const newBridgeBalance = await ethers.provider.getBalance(BRIDGE_ADDRESS);
    const newSignerBalance = await ethers.provider.getBalance(signer.address);

    console.log("   New bridge balance:", ethers.formatEther(newBridgeBalance), "COTI");
    console.log("   New signer balance:", ethers.formatEther(newSignerBalance), "COTI");

    console.log("\n✅ Withdrawal complete!");
    console.log("\nTransaction link:");
    console.log("https://mainnet.cotiscan.io/tx/" + tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
