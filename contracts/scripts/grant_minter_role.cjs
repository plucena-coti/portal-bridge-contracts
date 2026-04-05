const hre = require("hardhat");
const { ethers } = hre;

const PRIVATE_COTI_ADDRESS = "0x0dAF540a7627cD298a7dbaEC179598B5bbDaf532";
const NEW_BRIDGE_ADDRESS = "0x4fF170Bb391CeCA6534d87657E6111f870D51265";
const TIMEOUT_SECONDS = 300;

async function waitWithTimeout(promise, timeoutSeconds, stepName) {
    console.log(`[${stepName}] Waiting up to ${timeoutSeconds} seconds...`);
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`[${stepName}] Timed out after ${timeoutSeconds} seconds`));
        }, timeoutSeconds * 1000);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutHandle);
        console.log(`[${stepName}] ✅ Completed!`);
        return result;
    } catch (error) {
        clearTimeout(timeoutHandle);
        throw error;
    }
}

async function main() {
    console.log(`Granting MINTER_ROLE on PrivateCOTI (${PRIVATE_COTI_ADDRESS}) to Bridge (${NEW_BRIDGE_ADDRESS})...`);

    // Note: Corrected to "PrivateCOTI" (all caps COTI)
    const PrivateCOTI = await ethers.getContractAt("PrivateCOTI", PRIVATE_COTI_ADDRESS);
    const MINTER_ROLE = ethers.id("MINTER_ROLE");

    const roleTx = await PrivateCOTI.grantRole(MINTER_ROLE, NEW_BRIDGE_ADDRESS, { gasLimit: 5000000 });
    await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`✅ Role successfully granted to ${NEW_BRIDGE_ADDRESS}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
