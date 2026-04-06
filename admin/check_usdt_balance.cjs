const hre = require("hardhat");
const { ethers } = hre;

const RECIPIENT = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
const CONTRACT_ADDRESS = "0x9e961430053cd5AbB3b060544cEcCec848693Cf0";

async function main() {
    console.log(`\n🔍 Checking USDT balance for ${RECIPIENT}...`);
    console.log(`📍 Using USDT contract: ${CONTRACT_ADDRESS}`);

    const USDT = await ethers.getContractAt("USDT", CONTRACT_ADDRESS);

    // Get balance
    const balance = await USDT.balanceOf(RECIPIENT);
    console.log(`\n💰 Raw balance: ${balance.toString()}`);
    
    // Convert to human readable (6 decimals)
    const humanReadable = ethers.formatUnits(balance, 6);
    console.log(`💰 Human readable: ${humanReadable} USDT`);
    
    // Check decimals
    const decimals = await USDT.decimals();
    console.log(`🔢 Token decimals: ${decimals}`);
    
    // Check total supply
    const totalSupply = await USDT.totalSupply();
    console.log(`📊 Total supply: ${ethers.formatUnits(totalSupply, 6)} USDT`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });