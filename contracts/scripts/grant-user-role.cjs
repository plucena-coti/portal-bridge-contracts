const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIVATE_COTI_ADDRESS = "0x074A10a5Cb95436CF8FC966d7Bb9809458bf72a4";
    const USER_ADDRESS = "0xe45fc1a7d84e73c8c71edf2814e7467f7c86a8a2";

    const network = await ethers.provider.getNetwork();
    const explorerUrl = network.chainId === 2632500n ? "https://mainnet.cotiscan.io" : "https://testnet.cotiscan.io";

    console.log(`\n🔑 Granting MINTER_ROLE to user account`);
    console.log(`User: ${USER_ADDRESS}\n`);

    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = PrivateCoti.attach(PRIVATE_COTI_ADDRESS);

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    // Check if already has role
    const hasRole = await privateCoti.hasRole(MINTER_ROLE, USER_ADDRESS);
    console.log(`User currently has MINTER_ROLE: ${hasRole}\n`);

    if (hasRole) {
        console.log("✅ User already has MINTER_ROLE");
        return;
    }

    console.log("Granting MINTER_ROLE...");
    const tx = await privateCoti.grantRole(MINTER_ROLE, USER_ADDRESS, {
        gasLimit: 12000000
    });

    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Explorer: ${explorerUrl}/tx/${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`\n✅ MINTER_ROLE granted successfully!`);
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`\nYou can now run the recovery-mint script to mint your tokens.`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
