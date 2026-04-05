const { ethers } = require("hardhat");

async function main() {
    const [runner] = await ethers.getSigners();
    console.log("Checking permissions with:", runner.address);

    const P_WADA_ADDRESS = "0x697E70F4915f851BB9C2D7B6604861989054903F"; // From config.ts (Testnet)
    const BRIDGE_ADDRESS = "0x35a0D2046770dE406350871a2Eb2ed5880601Cd5"; // From config.ts

    const pWada = await ethers.getContractAt("contracts/privateERC20/PrivateERC20.sol:PrivateERC20", P_WADA_ADDRESS, runner);

    // Check MINTER_ROLE
    let MINTER_ROLE;
    try {
        MINTER_ROLE = await pWada.MINTER_ROLE();
    } catch {
        MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    }

    const hasRole = await pWada.hasRole(MINTER_ROLE, BRIDGE_ADDRESS);
    console.log(`Bridge (${BRIDGE_ADDRESS}) has MINTER_ROLE on p.WADA? ${hasRole}`);

    if (!hasRole) {
        console.log("⚠️ Role missing! Attempting to grant...");
        try {
            const tx = await pWada.grantRole(MINTER_ROLE, BRIDGE_ADDRESS, {
                gasLimit: 300000,
                gasPrice: ethers.parseUnits("35", "gwei")
            });
            console.log("Grant TX:", tx.hash);
            await tx.wait();
            console.log("✅ Role Granted!");
        } catch (e) {
            console.error("❌ Failed to grant role (Are you admin?)", e.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
