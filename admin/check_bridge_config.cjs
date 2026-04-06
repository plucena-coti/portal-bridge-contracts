const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const WETH_BRIDGE = "0x4236593983Db9b668306CA8C12dcf151e5643D97";
    const EXPECTED_WETH = "0xA2872247F88250ea504A4d6Bb5d2547BABd790b5";

    const PrivacyBridgeWETH = await ethers.getContractFactory("PrivacyBridgeWETH");
    const bridge = PrivacyBridgeWETH.attach(WETH_BRIDGE);

    const actualWeth = await bridge.weth();
    console.log(`\nConfigured WETH: ${EXPECTED_WETH}`);
    console.log(`Bridge WETH:     ${actualWeth}`);

    if (actualWeth.toLowerCase() !== EXPECTED_WETH.toLowerCase()) {
        console.error("❌ WETH ADDRESS MISMATCH! The bridge is using a different WETH.");
    } else {
        console.log("✅ WETH Address matches.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
