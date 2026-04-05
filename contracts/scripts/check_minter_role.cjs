const { ethers } = require("hardhat");

async function main() {
    const P_COTI_ADDRESS = "0x143705349957A236d74e0aDb5673F880fEDB101f";
    const NEW_BRIDGE_ADDRESS = "0xEeD8ae3E53fe8204b966d861Cf7E9b8165917d18";

    // Standard IAccessControl ABI
    const abi = [
        "function hasRole(bytes32 role, address account) view returns (bool)",
        "function MINTER_ROLE() view returns (bytes32)"
    ];

    const provider = new ethers.JsonRpcProvider("https://mainnet.coti.io");
    const pCoti = new ethers.Contract(P_COTI_ADDRESS, abi, provider);

    try {
        const MINTER_ROLE = await pCoti.MINTER_ROLE();
        console.log("MINTER_ROLE Hash:", MINTER_ROLE);

        const hasRole = await pCoti.hasRole(MINTER_ROLE, NEW_BRIDGE_ADDRESS);
        console.log(`Has Role (Bridge ${NEW_BRIDGE_ADDRESS}):`, hasRole);
    } catch (e) {
        console.error("Error checking role:", e.message);
        // Fallback: manually hash MINTER_ROLE if contract function fails
        const manualRole = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
        const hasRole = await pCoti.hasRole(manualRole, NEW_BRIDGE_ADDRESS);
        console.log(`Has Role (Manual Hash):`, hasRole);
    }
}

main();
