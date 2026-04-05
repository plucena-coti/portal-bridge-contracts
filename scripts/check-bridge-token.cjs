const hre = require("hardhat");

async function main() {
    const bridgeAddr = "0x88B8ab53d886A59673DCaB4A082264f5a98eD5E8";
    const expectedToken = "0x3f8E33AEAeCe60706eA958E3aa558d85605623ec";
    
    // PrivacyBridge has a public "privateToken" variable
    const bridge = await hre.ethers.getContractAt("PrivacyBridgeERC20", bridgeAddr);
    
    const actualToken = await bridge.privateToken();
    console.log(`Bridge is configured to mint on Private Token: ${actualToken}`);
    console.log(`Expected Token:  ${expectedToken}`);
    
    if (actualToken.toLowerCase() !== expectedToken.toLowerCase()) {
        console.log("MISMATCH! The bridge is trying to mint a DIFFERENT token than what we granted MINTER_ROLE on.");
        
        // Let's check if the bridge has MINTER_ROLE on the actual token
        const actualTokenContract = await hre.ethers.getContractAt("PrivateERC20", actualToken);
        const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
        const hasMinter = await actualTokenContract.hasRole(MINTER_ROLE, bridgeAddr);
        console.log(`Does bridge have MINTER_ROLE on ACTUAL token? ${hasMinter}`);
    } else {
        console.log("Match! The bridge is configured correctly.");
    }
}

main().catch(console.error);
