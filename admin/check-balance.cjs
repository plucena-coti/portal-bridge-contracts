const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const CONTRACT_ADDRESS = "0xAcdd6ACC7Ab83A3ff1E6ea293AF7115C5869b097"; // WADA
    const USER_ADDRESS = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";

    const network = await ethers.provider.getNetwork();
    console.log(`\n💰 Checking Public WADA Balance on Chain ID ${network.chainId}\n`);

    const abi = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)"
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, ethers.provider);

    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    console.log(`User:     ${USER_ADDRESS}\n`);

    try {
        const decimals = await contract.decimals();
        const symbol = await contract.symbol();
        const balance = await contract.balanceOf(USER_ADDRESS);
        const totalSupply = await contract.totalSupply();

        console.log(`✅ Balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
        console.log(`   (Raw: ${balance.toString()})`);

        console.log(`\n📋 Contract Info:`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);

    } catch (error) {
        console.error(`❌ Error checking balance:`, error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
