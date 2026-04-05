const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying PrivacyBridgeCotiNative with account:", deployer.address);

    const PrivateCotiAddress = "0x77c77c541703e498c4d32049e7019672689c898b"; // Mainnet Private COTI

    // Deploy PrivacyBridgeCotiNative
    const PrivacyBridgeCotiNative = await ethers.getContractFactory("PrivacyBridgeCotiNative");
    const bridge = await PrivacyBridgeCotiNative.deploy(PrivateCotiAddress, {
        gasLimit: 5000000,
        gasPrice: ethers.parseUnits("30", "gwei")
    });

    await bridge.waitForDeployment();

    const bridgeAddress = await bridge.getAddress();
    console.log("PrivacyBridgeCotiNative deployed to:", bridgeAddress);

    // Grant MINTER_ROLE to Bridge on PrivateCOTI? 
    // Usually deployer needs to do this if they are admin of PrivateCOTI.
    // Assuming deployer is admin of PrivateCOTI:
    /*
    const privateCoti = await ethers.getContractAt("PrivateCOTITreasuryGovernanceToken", PrivateCotiAddress);
    const MINTER_ROLE = await privateCoti.MINTER_ROLE();
    const tx = await privateCoti.grantRole(MINTER_ROLE, bridgeAddress);
    await tx.wait();
    console.log("Granted MINTER_ROLE to bridge");
    */
    // For now, just deployment as requested.
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
