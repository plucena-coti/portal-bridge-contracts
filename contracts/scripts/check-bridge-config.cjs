const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const BRIDGE_ADDRESS = "0x0c2Af91D8ddf3D02c4A5e31daf4926E4c2265ed2";
    const EXPECTED_TOKEN_ADDRESS = "0x074A10a5Cb95436CF8FC966d7Bb9809458bf72a4";

    console.log(`\n🔍 Checking Bridge Configuration\n`);

    const PrivacyBridgeCotiNative = await ethers.getContractFactory("PrivacyBridgeCotiNative");
    const bridge = PrivacyBridgeCotiNative.attach(BRIDGE_ADDRESS);

    // Check what PrivateCoti address the bridge has
    const privateCotiAddress = await bridge.privateCoti();
    console.log(`Bridge's privateCoti address: ${privateCotiAddress}`);
    console.log(`Expected address:             ${EXPECTED_TOKEN_ADDRESS}`);
    console.log(`Addresses match: ${privateCotiAddress.toLowerCase() === EXPECTED_TOKEN_ADDRESS.toLowerCase()}`);

    // Check bridge balance
    const bridgeBalance = await ethers.provider.getBalance(BRIDGE_ADDRESS);
    console.log(`\nBridge COTI balance: ${ethers.formatEther(bridgeBalance)} COTI`);

    // Check if the privateCoti contract at that address has granted MINTER_ROLE to the bridge
    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = PrivateCoti.attach(privateCotiAddress);

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const hasRole = await privateCoti.hasRole(MINTER_ROLE, BRIDGE_ADDRESS);
    console.log(`\nBridge has MINTER_ROLE on privateCoti: ${hasRole}`);

    // Try to simulate a deposit to see what happens
    console.log(`\n📝 Simulating deposit call...`);
    try {
        const [signer] = await ethers.getSigners();
        const amount = ethers.parseEther("0.01");

        // Use callStatic to simulate without actually sending
        await bridge.deposit.staticCall({ value: amount });
        console.log(`✅ Deposit simulation succeeded!`);
    } catch (error) {
        console.log(`❌ Deposit simulation failed: ${error.message}`);
        if (error.data) {
            console.log(`Error data: ${error.data}`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
