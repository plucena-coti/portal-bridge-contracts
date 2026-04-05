/**
 * Grant MINTER_ROLE (and optionally BURNER_ROLE) on a PrivateERC20 token
 * to a specified address, using the deployer's private key (PRIVATE_KEY in .env).
 *
 * Usage:
 *   npx hardhat run scripts/grant-minter-role.cjs --network cotiTestnet
 */

const hre = require("hardhat");

// ── Config ────────────────────────────────────────────────────────────────────
const PRIVATE_TOKEN_ADDRESS = "0x362F5a50423163c0f8E1bC4C8867FdC22bd74Da1"; // p.WBTC
const GRANTEE_ADDRESS       = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012"; // address to receive MINTER_ROLE
const GRANT_BURNER_ROLE     = false; // set true if BURNER_ROLE is also needed
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Using account:", deployer.address);

    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const BURNER_ROLE  = hre.ethers.id("BURNER_ROLE");

    const token = await hre.ethers.getContractAt("PrivateERC20", PRIVATE_TOKEN_ADDRESS);

    // Verify deployer holds DEFAULT_ADMIN_ROLE
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const isAdmin = await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    if (!isAdmin) {
        throw new Error(`Deployer ${deployer.address} does not hold DEFAULT_ADMIN_ROLE on ${PRIVATE_TOKEN_ADDRESS}`);
    }
    console.log("✅ Deployer holds DEFAULT_ADMIN_ROLE");

    // Check if already granted
    const alreadyMinter = await token.hasRole(MINTER_ROLE, GRANTEE_ADDRESS);
    if (alreadyMinter) {
        console.log(`ℹ️  ${GRANTEE_ADDRESS} already has MINTER_ROLE — skipping`);
    } else {
        console.log(`Granting MINTER_ROLE to ${GRANTEE_ADDRESS}...`);
        const tx = await token.grantRole(MINTER_ROLE, GRANTEE_ADDRESS, { gasLimit: 500000 });
        await tx.wait();
        console.log("✅ MINTER_ROLE granted. TX:", tx.hash);
    }

    if (GRANT_BURNER_ROLE) {
        const alreadyBurner = await token.hasRole(BURNER_ROLE, GRANTEE_ADDRESS);
        if (alreadyBurner) {
            console.log(`ℹ️  ${GRANTEE_ADDRESS} already has BURNER_ROLE — skipping`);
        } else {
            console.log(`Granting BURNER_ROLE to ${GRANTEE_ADDRESS}...`);
            const tx = await token.grantRole(BURNER_ROLE, GRANTEE_ADDRESS, { gasLimit: 500000 });
            await tx.wait();
            console.log("✅ BURNER_ROLE granted. TX:", tx.hash);
        }
    }

    // Confirm final state
    const hasMinter = await token.hasRole(MINTER_ROLE, GRANTEE_ADDRESS);
    console.log(`\nFinal state — ${GRANTEE_ADDRESS} has MINTER_ROLE: ${hasMinter}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
