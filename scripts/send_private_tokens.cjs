const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("Starting private token transfer script...");

    // Recipient
    const recipient = "0x0D1d978684edd5092cd7C15F370238b2B94766C8";

    // Contract Address (p.USDT on Testnet)
    const pUSDTAddress = "0x4fF8F9d237DB919CF6F72621541BEFbE74Ced3d5";

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`Sender: ${signer.address}`);

    // Amount: 90 USDT (6 decimals)
    const amount = ethers.parseUnits("90", 6);

    // ABI for the overloaded transfer(address,uint256)
    const abi = [
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
    ];

    const pUSDT = new ethers.Contract(pUSDTAddress, abi, signer);

    // Verify connection
    try {
        const symbol = await pUSDT.symbol();
        const decimals = await pUSDT.decimals();
        console.log(`Connected to ${symbol} (${decimals} decimals) at ${pUSDTAddress}`);
    } catch (e) {
        console.error("Error connecting to token:", e.message);
        return;
    }

    // Transfer
    console.log(`\nSending 90 p.USDT to ${recipient}...`);
    try {
        const tx = await pUSDT.transfer(recipient, amount, { gasLimit: 3000000 });
        console.log(`Tx sent: ${tx.hash}`);
        await tx.wait();
        console.log("✅ p.USDT transfer confirmed.");
    } catch (error) {
        console.error("❌ Failed to send p.USDT:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
