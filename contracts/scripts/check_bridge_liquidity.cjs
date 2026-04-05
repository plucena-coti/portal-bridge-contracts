const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Checking Bridge Liquidity with signer:", signer.address);

    // Addresses from config.ts
    const WBTC_ADDRESS = "0xa36e2AD641D3e69e482aA774363A92A1F9e937f0";
    const PRIVACY_BRIDGE_WBTC_ADDRESS = "0x97d9Fd7627d728E8dd302d9942bbd12BaAE15C02";

    // WBTC Contract (Use IERC20 for generic interface)
    const wbtc = await ethers.getContractAt("IERC20", WBTC_ADDRESS, signer);

    // Privacy Bridge Contract
    const bridge = await ethers.getContractAt("PrivacyBridgeERC20", PRIVACY_BRIDGE_WBTC_ADDRESS, signer);

    // Check Bridge Balance
    const bridgeBalance = await wbtc.balanceOf(PRIVACY_BRIDGE_WBTC_ADDRESS);
    const bridgeBalanceFormatted = ethers.formatUnits(bridgeBalance, 8); // WBTC is 8 decimals

    console.log(`\n--- Bridge Liquidity ---`);
    console.log(`Bridge Address: ${PRIVACY_BRIDGE_WBTC_ADDRESS}`);
    console.log(`Public WBTC Balance: ${bridgeBalanceFormatted} WBTC (${bridgeBalance.toString()} units)`);

    // Check Limits
    try {
        const maxWithdraw = await bridge.maxWithdrawAmount();
        console.log(`Max Withdraw Amount: ${maxWithdraw.toString()}`);
    } catch (e) {
        console.log("Could not fetch maxWithdrawAmount:", e.message);
    }

    // Check deployer balance incase we need to fund
    const deployerBalance = await wbtc.balanceOf(signer.address);
    console.log(`Deployer WBTC Balance: ${ethers.formatUnits(deployerBalance, 8)} WBTC`);

    // Recommendation
    if (bridgeBalance == 0) {
        console.log("\n⚠️ BRIDGE HAS NO LIQUIDITY. Withdrawals will fail.");
        console.log("To fix: Send Public WBTC to the bridge address.");
    } else {
        console.log("\n✅ Bridge has liquidity.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
