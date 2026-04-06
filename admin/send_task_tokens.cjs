const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("Starting task token transfer script...");

    // Recipient
    const recipient = "0xfD74B4d964299E0695Fcb11be76DF3853a6C84cd";

    // Contract Addresses (Testnet)
    const pWBTCAddress = "0xFd16726f8CdD27f466a8D924dd8904F5E3Cc9ac3";
    const pWADAAddress = "0x67316009e27f6Ec3bACfe51aA3D343ad619fd7cb";
    const pgcotiAddress = "0x7AC988eb3E45fe6ADB05DFaf609c8DBb4A902cdC";

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`Sender: ${signer.address}`);

    // ABI for the overloaded transfer(address,uint256) and basic ERC20 functions
    const abi = [
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
    ];

    const pWBTC = new ethers.Contract(pWBTCAddress, abi, signer);
    const pWADA = new ethers.Contract(pWADAAddress, abi, signer);
    const pgcoti = new ethers.Contract(pgcotiAddress, abi, signer);

    const tokens = [
        { contract: pWBTC, name: "pWBTC", amount: "100" },
        { contract: pWADA, name: "pWADA", amount: "100" },
        { contract: pgcoti, name: "pgcoti", amount: "400" }
    ];

    for (const token of tokens) {
        try {
            const symbol = await token.contract.symbol();
            const decimals = await token.contract.decimals();
            console.log(`\nProcessing ${token.name} (${symbol})...`);

            const amountWei = ethers.parseUnits(token.amount, decimals);

            console.log(`Sending ${token.amount} ${symbol} to ${recipient}...`);
            const tx = await token.contract.transfer(recipient, amountWei, { gasLimit: 3000000 });
            console.log(`Tx sent: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ ${token.name} transfer confirmed.`);
        } catch (error) {
            console.error(`❌ Failed to send ${token.name}:`, error);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
