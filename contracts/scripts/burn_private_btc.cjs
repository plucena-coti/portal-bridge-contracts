const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIVATE_BTC_ADDRESS = "0x1F0e4D645eFc278e8E04b781Ad8F4c9dC41BD27B"; // Testnet
    const BURN_AMOUNT_RAW = "285277964703"; // derived from 2.852...e+3 * 10^8

    console.log("===========================================");
    console.log("   🔥 BURNING PrivateBTC");
    console.log("===========================================");
    console.log(`Contract: ${PRIVATE_BTC_ADDRESS}`);
    console.log(`Amount:   ${BURN_AMOUNT_RAW} (units)`);

    const [signer] = await ethers.getSigners();
    console.log(`Signer:   ${signer.address}`);

    const PrivateBTC = await ethers.getContractFactory("PrivateWrappedBTC");
    const privateBtc = PrivateBTC.attach(PRIVATE_BTC_ADDRESS).connect(signer);

    console.log("\nBurning...");
    // Calling burn(uint64 amount)
    // Note: privateBtc.burn(uint64) is overloaded. We need to be careful with ethers v6?
    // ethers v6 automatically detects overload or use 'burn(uint64)' syntax.
    // PrivateBTC has burn(address, uint64) [ROLE] and burn(uint64) [PUBLIC].
    // We want the PUBLIC one: burn(uint64).

    try {
        const tx = await privateBtc['burn(uint64)'](BURN_AMOUNT_RAW, { gasLimit: 5000000 });
        console.log(`Tx sent: ${tx.hash}`);
        await tx.wait();
        console.log("✅ Burn successful!");
    } catch (error) {
        console.error("❌ Burn failed:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
