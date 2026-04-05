const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    // Contract addresses from your config
    const PRIVATE_COTI_ADDRESS = "0x074A10a5Cb95436CF8FC966d7Bb9809458bf72a4";
    const BRIDGE_ADDRESS = "0x0c2Af91D8ddf3D02c4A5e31daf4926E4c2265ed2";

    const network = await ethers.provider.getNetwork();
    const isMainnet = network.chainId === 2632500n;
    const explorerUrl = isMainnet ? "https://mainnet.cotiscan.io" : "https://testnet.cotiscan.io";

    console.log(`\nGranting MINTER_ROLE on network: Chain ID ${network.chainId}`);
    console.log(`PrivateCoti: ${PRIVATE_COTI_ADDRESS}`);
    console.log(`Bridge: ${BRIDGE_ADDRESS}\n`);

    // Get the PrivateCoti contract
    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = PrivateCoti.attach(PRIVATE_COTI_ADDRESS);

    // Calculate MINTER_ROLE
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    console.log(`MINTER_ROLE hash: ${MINTER_ROLE}`);

    // Check if role is already granted
    const hasRole = await privateCoti.hasRole(MINTER_ROLE, BRIDGE_ADDRESS);
    console.log(`Bridge currently has MINTER_ROLE: ${hasRole}\n`);

    if (hasRole) {
        console.log("✅ Bridge already has MINTER_ROLE. No action needed.");
        return;
    }

    console.log("❌ Bridge does NOT have MINTER_ROLE. Granting now...");

    // Grant the role
    const tx = await privateCoti.grantRole(MINTER_ROLE, BRIDGE_ADDRESS, {
        gasLimit: 12000000
    });

    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Explorer: ${explorerUrl}/tx/${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`\n✅ MINTER_ROLE granted successfully!`);
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`\nThe bridge can now mint COTI.p tokens. Try your deposit again!`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
