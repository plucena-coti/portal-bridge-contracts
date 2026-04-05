const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("--- Diagnostic for WBTC Role Issue ---");
    console.log("Deployer Address:", deployer.address);

    const tokenAddr = "0x3f8E33AEAeCe60706eA958E3aa558d85605623ec";
    const bridgeAddr = "0x88B8ab53d886A59673DCaB4A082264f5a98eD5E8";

    const token = await hre.ethers.getContractAt("PrivateERC20", tokenAddr);
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const hasRole = await token.hasRole(MINTER_ROLE, bridgeAddr);
    const isAdmin = await token.hasRole(ADMIN_ROLE, deployer.address);

    console.log(`Bridge ${bridgeAddr} has MINTER_ROLE?`, hasRole);
    console.log(`Deployer ${deployer.address} has DEFAULT_ADMIN_ROLE?`, isAdmin);

    if (!hasRole && isAdmin) {
        console.log("Role missing but deployer is admin. Granting now...");
        const tx = await token.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 5000000 });
        console.log("Transaction Hash:", tx.hash);
        await tx.wait();
        const hasRoleNow = await token.hasRole(MINTER_ROLE, bridgeAddr);
        console.log("Success! Role now granted?", hasRoleNow);
    } else if (!isAdmin) {
        console.error("CRITICAL: Deployer is NOT the admin of this token.");
    } else {
        console.log("Role is already granted according to contract states.");
    }
}

main().catch(console.error);
