const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Acting as Admin:", signer.address);

    const P_COTI_ADDRESS = "0x143705349957A236d74e0aDb5673F880fEDB101f";
    const NEW_BRIDGE_ADDRESS = "0xEeD8ae3E53fe8204b966d861Cf7E9b8165917d18";

    const pCoti = await ethers.getContractAt("contracts/privateERC20/PrivateERC20.sol:PrivateERC20", P_COTI_ADDRESS, signer);

    // Verify contract
    try {
        const name = await pCoti.name();
        const symbol = await pCoti.symbol();
        console.log(`Contract verified: ${name} (${symbol})`);
    } catch (e) {
        console.error("❌ Failed to read token name/symbol. Is the address correct?");
    }

    let MINTER_ROLE;
    try {
        MINTER_ROLE = await pCoti.MINTER_ROLE();
        console.log("MINTER_ROLE Found:", MINTER_ROLE);
    } catch (e) {
        console.warn("⚠️ MINTER_ROLE() getter failed. Using manual calculation.");
        MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
        console.log("MINTER_ROLE Calculated:", MINTER_ROLE);
    }

    // Check if we are admin? (Optional, just try grant)
    console.log(`Granting MINTER_ROLE to Bridge at ${NEW_BRIDGE_ADDRESS}...`);

    const tx = await pCoti.grantRole(MINTER_ROLE, NEW_BRIDGE_ADDRESS, {
        gasLimit: 100000,
        gasPrice: ethers.parseUnits("30", "gwei")
    });

    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ Role Granted Successfully");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
