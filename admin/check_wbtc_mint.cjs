const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIV_WBTC_ADDR = "0x0D3B8fAC715beA4cC4824528a65a1e959Fd05239"; // From logs
    const USER = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";

    const contract = await ethers.getContractAt("PrivateWrappedBTC", PRIV_WBTC_ADDR);

    console.log(`Checking mint events for ${USER} on ${PRIV_WBTC_ADDR}`);

    // Check Transfer events to USER
    const filter = contract.filters.Transfer(null, USER);
    const events = await contract.queryFilter(filter);

    console.log(`Found ${events.length} Transfer events to user.`);

    if (events.length > 0) {
        const lastEvent = events[events.length - 1];
        console.log("Last Transfer:", lastEvent.args);
        console.log("Tx Hash:", lastEvent.transactionHash);
    } else {
        console.log("No Transfer events found. Minting might have failed.");
    }

    // Also check current ciphertext again to be sure
    try {
        const bal = await contract['balanceOf(address)'](USER);
        console.log("Current On-Chain Ciphertext:", bal);
    } catch (e) {
        console.log("Error fetching balance:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
