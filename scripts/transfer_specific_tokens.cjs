const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("Starting specific token transfer script...");

    // Recipient
    const recipient = "0x0D1d978684edd5092cd7C15F370238b2B94766C8";

    // Contract Addresses (Testnet) - Public tokens
    const usdcAddress = "0xdc853f1A4Fd06B118726B3c097CEaD27E47e9Ba3"; // USDC_E
    const usdtAddress = "0xE0EaDda074c3B5D0808CC97EbD765B5631355226"; // USDT
    const wbtcAddress = "0xa36e2AD641D3e69e482aA774363A92A1F9e937f0"; // WBTC

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`Sender: ${signer.address}`);

    // ABI for the overloaded transfer(address,uint256) and basic ERC20 functions
    const abi = [
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function balanceOf(address account) view returns (uint256)"
    ];

    const usdc = new ethers.Contract(usdcAddress, abi, signer);
    const usdt = new ethers.Contract(usdtAddress, abi, signer);
    const wbtc = new ethers.Contract(wbtcAddress, abi, signer);

    const tokens = [
        { contract: usdc, name: "USDC_E", amount: "50" },
        { contract: usdt, name: "USDT", amount: "100" },
        { contract: wbtc, name: "WBTC", amount: "100" }
    ];

    for (const token of tokens) {
        try {
            const symbol = await token.contract.symbol();
            const decimals = await token.contract.decimals();
            console.log(`\nProcessing ${token.name} (${symbol})...`);

            const bal = await token.contract.balanceOf(signer.address);
            console.log(`Current balance: ${ethers.formatUnits(bal, decimals)}`);

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
