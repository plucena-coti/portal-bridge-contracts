const hre = require("hardhat");

async function main() {
    const bridgeAddr = "0x8727e14a39ECa65cB1B1571c2E2EBA2E0B9A2e92";
    const tokenAddr = "0x2d8d68ad17CEAFC3b22156026b25e4734FA9bc5e";

    console.log("Checking Bridge roles on fresh deployments...");
    const token = await hre.ethers.getContractAt("PrivateERC20", tokenAddr);

    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const hasMinter = await token.hasRole(MINTER_ROLE, bridgeAddr);

    console.log(`Bridge: ${bridgeAddr}`);
    console.log(`Token:  ${tokenAddr}`);
    console.log(`Has MINTER_ROLE? ${hasMinter}`);

    if (hasMinter) {
        console.log("SUCCESS: AccessControl roles are correctly configured.");
    } else {
        console.log("FAILURE: Role missing on new deployment.");
    }
}

main().catch(console.error);
