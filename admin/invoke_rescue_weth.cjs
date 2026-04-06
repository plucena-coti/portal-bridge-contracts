const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const BRIDGE_ADDRESS = "0xfF5242274eAB28379C8ae194baFDc64E55e339e0";
    const WETH_ADDRESS = "0x8bca4e6bbE402DB4aD189A316137aD08206154FB";
    const RECIPIENT_ADDRESS = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    
    // Amount to rescue (331.2 WETH)
    const AMOUNT = ethers.parseUnits("331.2", 18);

    console.log(`\n🚀 Invoking rescueERC20 on PrivacyBridgeWETH...\n`);
    console.log(`Bridge:    ${BRIDGE_ADDRESS}`);
    console.log(`Token:     ${WETH_ADDRESS} (WETH)`);
    console.log(`Recipient: ${RECIPIENT_ADDRESS}`);
    console.log(`Amount:    331.2 WETH (${AMOUNT.toString()} units)\n`);

    const abi = [
        "function rescueERC20(address token, address to, uint256 amount) external",
        "function owner() view returns (address)"
    ];

    const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, abi, (await ethers.getSigners())[0]);

    try {
        const owner = await bridgeContract.owner();
        console.log(`Contract Owner: ${owner}`);
        
        const [signer] = await ethers.getSigners();
        console.log(`Current Signer: ${signer.address}`);

        if (owner.toLowerCase() !== signer.address.toLowerCase()) {
            console.error("❌ Error: Signer is not the owner of the bridge!");
            process.exit(1);
        }

        console.log("🛠 Sending rescueERC20 transaction with manual gas settings...");
        const tx = await bridgeContract.rescueERC20(WETH_ADDRESS, RECIPIENT_ADDRESS, AMOUNT, {
            gasLimit: 300000,
            gasPrice: 10000000000 // 10 Gwei
        });
        console.log(`✅ Transaction sent! Hash: ${tx.hash}`);
        
        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        console.log(`🎉 Transaction confirmed in block ${receipt.blockNumber}`);

    } catch (error) {
        console.error("❌ Error executing rescueERC20:", error.message);
        if (error.data) {
            console.error("   Error Data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
