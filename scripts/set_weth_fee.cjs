const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const WETH_BRIDGE_ADDRESS = "0xfF5242274eAB28379C8ae194baFDc64E55e339e0";
    console.log("Setting WETH Bridge native COTI fee for:", WETH_BRIDGE_ADDRESS);

    const [signer] = await ethers.getSigners();
    console.log("Using signer:", signer.address);

    const bridgeAbi = [
        "function setNativeCotiFee(uint256) external"
    ];

    const bridge = new ethers.Contract(WETH_BRIDGE_ADDRESS, bridgeAbi, signer);

    const feeWei = ethers.parseEther("0.1");

    console.log("Setting fee to:", feeWei.toString());
    const tx = await bridge.setNativeCotiFee(feeWei, { gasLimit: 500000 });
    await tx.wait();

    console.log("Successfully set WETH Bridge native COTI fee to 0.1 COTI.");
}

main().catch(console.error);