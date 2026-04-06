const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const USDC_E_ADDRESS = "0xdc853f1A4Fd06B118726B3c097CEaD27E47e9Ba3";
    const TARGET_ADDRESSES = [
        "0x0dDD6662B6fF82ea69774f9F45D4538BEabF27b5",
        "0x226D3Eb51e24D98150e682d0337c214779cD52A2"
    ];

    const network = await ethers.provider.getNetwork();
    console.log(`\n💰 Checking USDC.e balances on Chain ID ${network.chainId}\n`);

    const abi = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
    ];

    const contract = new ethers.Contract(USDC_E_ADDRESS, abi, ethers.provider);

    for (const address of TARGET_ADDRESSES) {
        try {
            const balance = await contract.balanceOf(address);
            const decimals = await contract.decimals();
            const symbol = await contract.symbol();
            console.log(`✅ ${address}: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
        } catch (error) {
            console.error(`❌ Error checking balance for ${address}:`, error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
