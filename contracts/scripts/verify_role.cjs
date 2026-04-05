const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log(`Checking roles on network: ${network.name} (${network.chainId})`);

    // Addresses from config.ts (Testnet)
    const PRIVATE_WETH = "0xd11c31A9d9a615e529A2dBF1410140D188Ba2592";
    const WETH_BRIDGE = "0x4236593983Db9b668306CA8C12dcf151e5643D97";

    console.log(`PrivateWETH: ${PRIVATE_WETH}`);
    console.log(`PrivacyBridgeWETH: ${WETH_BRIDGE}`);

    const PrivateWETH = await ethers.getContractFactory("PrivateWrappedEther");
    const privateWeth = PrivateWETH.attach(PRIVATE_WETH);

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    console.log(`MINTER_ROLE Hash: ${MINTER_ROLE}`);

    // Check Role
    const hasRole = await privateWeth.hasRole(MINTER_ROLE, WETH_BRIDGE);
    console.log(`\nDoes Bridge has MINTER_ROLE? -> ${hasRole}`);

    if (!hasRole) {
        console.warn("⚠️ MINTER_ROLE MISSING! Attempting to grant it...");
        try {
            const tx = await privateWeth.grantRole(MINTER_ROLE, WETH_BRIDGE);
            console.log(`Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log("✅ Role Granted Successfully!");

            // Re-check
            const hasRoleAfter = await privateWeth.hasRole(MINTER_ROLE, WETH_BRIDGE);
            console.log(`Re-check: Does Bridge has MINTER_ROLE? -> ${hasRoleAfter}`);
        } catch (e) {
            console.error("❌ Failed to grant role. Check if you are the admin/deployer.", e.message);
        }
    } else {
        console.log("✅ Configuration is correct.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
