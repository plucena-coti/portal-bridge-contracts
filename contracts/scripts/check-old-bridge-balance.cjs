const { ethers } = require("hardhat");

async function main() {
    const BRIDGE_ADDRESS = "0x0c2Af91D8ddf3D02c4A5e31daf4926E4c2265ed2";

    console.log("\n=== Checking Bridge Balance ===");
    console.log("Bridge Address:", BRIDGE_ADDRESS);

    const balance = await ethers.provider.getBalance(BRIDGE_ADDRESS);
    const balanceInCoti = ethers.formatEther(balance);

    console.log("Current Balance:", balanceInCoti, "COTI");
    console.log("Balance (wei):", balance.toString());

    if (balance > 0) {
        console.log("\n⚠️  Bridge has remaining funds!");
        console.log("Would you like to withdraw them?");
        console.log("\nTo withdraw, the owner needs to call a withdrawal function.");
        console.log("Note: The current bridge contract may need an emergency withdraw function.");
    } else {
        console.log("\n✅ Bridge is empty, safe to deploy new contract");
    }

    console.log("\nExplorer Link:");
    console.log("https://mainnet.cotiscan.io/address/" + BRIDGE_ADDRESS);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
