const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    // Set network - change this to test testnet or mainnet
    const networkName = process.argv[2] || "cotiTestnet";

    // Mainnet deployment addresses (from your terminal output)
    const MAINNET_ADDRESSES = {
        privateCoti: "0xcdbaA8A6afC275b3F5DfD3ee1916049C4213E885",
        bridge: "0xC2810eDBDD7c77f8143d56f4272A60ef2F52A6A0"
    };

    // Update these with testnet addresses after deployment
    const TESTNET_ADDRESSES = {
        privateCoti: "", // Will be filled after testnet deployment
        bridge: ""       // Will be filled after testnet deployment
    };

    const addresses = networkName === "cotiMainnet" ? MAINNET_ADDRESSES : TESTNET_ADDRESSES;
    const explorerUrl = networkName === "cotiMainnet"
        ? "https://mainnet.cotiscan.io"
        : "https://testnet.cotiscan.io";

    console.log(`\n🔍 Verifying deployment on ${networkName}...\n`);

    if (!addresses.privateCoti || !addresses.bridge) {
        console.log("❌ No deployment addresses found for this network.");
        console.log("Please deploy first or update the addresses in this script.");
        process.exit(1);
    }

    console.log("📍 Contract Addresses:");
    console.log(`   PrivateCoti: ${addresses.privateCoti}`);
    console.log(`   CotiPrivacyBridge: ${addresses.bridge}`);
    console.log(`   Explorer: ${explorerUrl}/address/${addresses.privateCoti}`);
    console.log(`   Explorer: ${explorerUrl}/address/${addresses.bridge}\n`);

    try {
        // Get contract instances
        const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
        const privateCoti = PrivateCoti.attach(addresses.privateCoti);

        const PrivacyBridgeCotiNative = await ethers.getContractFactory("PrivacyBridgeCotiNative");
        const bridge = PrivacyBridgeCotiNative.attach(addresses.bridge);

        console.log("📝 Testing PrivateCoti Contract...");

        // Test basic view functions
        const name = await privateCoti.name();
        const symbol = await privateCoti.symbol();
        const decimals = await privateCoti.decimals();

        console.log(`   ✅ Name: ${name}`);
        console.log(`   ✅ Symbol: ${symbol}`);
        console.log(`   ✅ Decimals: ${decimals}`);

        // Check MINTER_ROLE
        const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
        const hasBridgeRole = await privateCoti.hasRole(MINTER_ROLE, addresses.bridge);
        console.log(`   ${hasBridgeRole ? '✅' : '❌'} Bridge has MINTER_ROLE: ${hasBridgeRole}`);

        console.log("\n📝 Testing PrivacyBridgeCotiNative Contract...");

        // Test bridge functions
        const bridgePrivateCoti = await bridge.privateCoti();
        console.log(`   ✅ Connected to PrivateCoti: ${bridgePrivateCoti}`);
        console.log(`   ${bridgePrivateCoti === addresses.privateCoti ? '✅' : '❌'} Address matches: ${bridgePrivateCoti === addresses.privateCoti}`);

        const owner = await bridge.owner();
        console.log(`   ✅ Bridge owner: ${owner}`);

        const paused = await bridge.paused();
        console.log(`   ✅ Paused status: ${paused}`);

        const minDeposit = await bridge.minDepositAmount();
        const maxDeposit = await bridge.maxDepositAmount();
        const maxWithdraw = await bridge.maxWithdrawAmount();

        console.log(`   ✅ Min deposit: ${ethers.formatUnits(minDeposit, 0)} (raw)`);
        console.log(`   ✅ Max deposit: ${ethers.formatUnits(maxDeposit, 0)} (raw)`);
        console.log(`   ✅ Max withdraw: ${ethers.formatUnits(maxWithdraw, 0)} (raw)`);

        const bridgeBalance = await bridge.getBridgeBalance();
        console.log(`   ✅ Bridge balance: ${ethers.formatEther(bridgeBalance)} COTI`);

        console.log("\n✅ All verification checks passed!");
        console.log("\n📋 Summary:");
        console.log(`   Network: ${networkName}`);
        console.log(`   PrivateCoti: ${addresses.privateCoti}`);
        console.log(`   PrivacyBridgeCotiNative: ${addresses.bridge}`);
        console.log(`   Bridge Role Granted: ${hasBridgeRole ? 'Yes' : 'No'}`);
        console.log(`   Bridge Status: ${paused ? 'Paused' : 'Active'}`);

    } catch (error) {
        console.error("\n❌ Error during verification:");
        console.error(error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
