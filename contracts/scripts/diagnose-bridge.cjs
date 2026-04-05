const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIVATE_COTI_ADDRESS = "0x074A10a5Cb95436CF8FC966d7Bb9809458bf72a4";
    const BRIDGE_ADDRESS = "0x0c2Af91D8ddf3D02c4A5e31daf4926E4c2265ed2";

    const network = await ethers.provider.getNetwork();
    const isMainnet = network.chainId === 2632500n;

    console.log(`\n🔍 Diagnosing Bridge Issues on Chain ID ${network.chainId}\n`);

    // Get contracts
    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = PrivateCoti.attach(PRIVATE_COTI_ADDRESS);

    const PrivacyBridgeCotiNative = await ethers.getContractFactory("PrivacyBridgeCotiNative");
    const bridge = PrivacyBridgeCotiNative.attach(BRIDGE_ADDRESS);

    // Check bridge balance
    const bridgeBalance = await ethers.provider.getBalance(BRIDGE_ADDRESS);
    console.log(`Bridge COTI Balance: ${ethers.formatEther(bridgeBalance)} COTI`);

    // Check MINTER_ROLE
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const hasRole = await privateCoti.hasRole(MINTER_ROLE, BRIDGE_ADDRESS);
    console.log(`Bridge has MINTER_ROLE: ${hasRole}`);

    // Check who owns PrivateCoti
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();
    const signerIsAdmin = await privateCoti.hasRole(DEFAULT_ADMIN_ROLE, signerAddress);
    console.log(`Current signer (${signerAddress}) is admin: ${signerIsAdmin}`);

    // Check bridge limits
    const minDeposit = await bridge.minDepositAmount();
    const maxDeposit = await bridge.maxDepositAmount();
    const maxWithdraw = await bridge.maxWithdrawAmount();
    console.log(`\nBridge Limits:`);
    console.log(`  Min Deposit: ${minDeposit} wei (${ethers.formatEther(minDeposit)} COTI)`);
    console.log(`  Max Deposit: ${maxDeposit} wei (${ethers.formatEther(maxDeposit)} COTI)`);
    console.log(`  Max Withdraw: ${maxWithdraw} wei (${ethers.formatEther(maxWithdraw)} COTI)`);

    // Check if bridge is paused
    const isPaused = await bridge.paused();
    console.log(`\nBridge is paused: ${isPaused}`);

    // Try to check a user's balance (encrypted, will just show if call works)
    try {
        console.log(`\nTrying to check privateCoti balance for signer...`);
        const balance = await privateCoti.balanceOf(signerAddress);
        console.log(`PrivateCoti balance (encrypted): ${balance}`);
    } catch (error) {
        console.log(`❌ Error checking balance: ${error.message}`);
    }

    console.log(`\n✅ Diagnostic complete!`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
