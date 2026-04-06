const hre = require("hardhat");
const { ethers } = hre;

const RECEIVER = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
const GAS_LIMIT_TX = 5000000;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Minting 1000 of each token to ${RECEIVER}`);

    const TOKENS = [
        { name: "WBTC", address: "0xa36e2AD641D3e69e482aA774363A92A1F9e937f0", decimals: 8 },
        { name: "USDT", address: "0xE0EaDda074c3B5D0808CC97EbD765B5631355226", decimals: 6 },
        { name: "USDCe", address: "0xdc853f1A4Fd06B118726B3c097CEaD27E47e9Ba3", decimals: 6 },
        { name: "WADA", address: "0xAad069A539001920712489C8FF796f1444E7394e", decimals: 6 },
        { name: "gCOTI", address: "0x7206c443aFC6985Df50Dd529e012e3534E35A756", decimals: 18 }
    ];

    // Mocks usually have mint(to, amount)
    for (const t of TOKENS) {
        console.log(`Processing ${t.name}...`);
        const contract = await ethers.getContractAt("WBTC", t.address); // Using WBTC artifact which has mint
        // Verify symbol to be sure
        try {
            const sym = await contract.symbol();
            console.log(`  Symbol: ${sym}`);

            // Mint 1000
            const amount = ethers.parseUnits("1000", t.decimals);

            // Try standard mint
            // Check if mint exists? Hardhat generic contract might need ABI
            // Using a generic ABI that includes mint
            const factory = await ethers.getContractFactory("USDT"); // All seem to be mocks from previous listing, let's pick one that has 'mint'
            const mintable = await ethers.getContractAt("USDT", t.address); // Reuse USDT artifact which has mint

            const tx = await mintable.mint(RECEIVER, amount, { gasLimit: GAS_LIMIT_TX });
            await tx.wait();
            console.log(`  ✅ Minted 1000 ${t.name}`);
        } catch (e) {
            console.error(`  ❌ Failed to mint ${t.name}:`, e.message);
        }
    }

    // WETH special case
    console.log("Skipping WETH 1000 mint (Requires 1000 ETH wrap).");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
