const hre = require("hardhat");

async function main() {
    const tokenAddr = "0x3f8E33AEAeCe60706eA958E3aa558d85605623ec"; // PrivateWrappedBTC
    const bridgeAddr = "0x88B8ab53d886A59673DCaB4A082264f5a98eD5E8"; // PrivacyBridgeWBTC
    const token = await hre.ethers.getContractAt("PrivateERC20", tokenAddr);
    
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const hasRole = await token.hasRole(MINTER_ROLE, bridgeAddr);
    console.log(`Bridge ${bridgeAddr} has MINTER_ROLE on token ${tokenAddr}: ${hasRole}`);
}

main().catch(console.error);
