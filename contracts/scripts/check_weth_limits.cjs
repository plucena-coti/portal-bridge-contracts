const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const BRIDGE_WETH_ADDR = "0x4B24959C2b23CE6a90e4b536f4C736F7b0ebC38f";
    const bridge = await ethers.getContractAt("PrivacyBridgeWETH", BRIDGE_WETH_ADDR);

    const minD = await bridge.minDepositAmount();
    const maxD = await bridge.maxDepositAmount();

    console.log(`Min Deposit: ${minD}`);
    console.log(`Max Deposit: ${maxD}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
