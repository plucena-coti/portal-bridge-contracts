const hre = require("hardhat");
const { ethers } = hre;

const TARGET_ADDRESS = "0x39328F51024Cdb68BBb4f060AB784FD4B83c2009";

async function main() {
    console.log(`Checking if address accepts Native COTI: ${TARGET_ADDRESS}`);
    const [sender] = await ethers.getSigners();

    try {
        // Prepare a raw transaction call
        const tx = {
            to: TARGET_ADDRESS,
            value: ethers.parseEther("1.0") // Try to send 1 COTI
        };

        // Simulate using eth_call (checking for revert)
        // Note: eth_call doesn't normally simulate value transfers perfectly for EOA checks,
        // but for contracts it checks if 'receive' or 'fallback' handles it.
        // Better: usage of 'estimateGas' which definitely reverts if impossible.

        console.log("Simulating transfer via estimateGas...");
        const gasEstimate = await sender.estimateGas(tx);
        console.log(`✅ SUCCESS! Estimated Gas: ${gasEstimate}`);
        console.log("This contract DOES accept native COTI.");

    } catch (error) {
        console.error("❌ FAILURE: Transaction would revert.");
        // Check error message for typical "no implementation" codes
        if (error.message.includes("reverted") || error.code === "CALL_EXCEPTION") {
            console.log("Reason: Contract likely has no receive() or fallback() function.");
        } else {
            console.log("Reason:", error.message);
        }
    }
}

main().catch(console.error);
