const hre = require("hardhat");

async function main() {
    const targetAddress = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    const amountToMint = "100000";

    const mocks = [
        { symbol: "WETH", address: "0xdC16c3c42c7cB5317462489688EAbcE37Ac48e6d", decimals: 18, contractName: "WETH9" },
        { symbol: "WBTC", address: "0x25B8342315DbE1E47e281832bdeC3321C14dc0B5", decimals: 8, contractName: "WBTC" },
        { symbol: "USDT", address: "0x313a5ee3346B68E9023F8207Aa5c3BfABd74EFaf", decimals: 6, contractName: "USDT" },
        { symbol: "USDC.e", address: "0x49fD25020acD040452dB925761155B6a6F4e6adf", decimals: 6, contractName: "USDCe" },
        { symbol: "WADA", address: "0x124dcF7a3eB6f061345a193dcBE9DD524e06ba53", decimals: 6, contractName: "WADA" },
        { symbol: "gCOTI", address: "0xe25473887d643DEdE45CE018Ce879Be5Ea41a9E1", decimals: 18, contractName: "gCOTI" }
    ];

    console.log(`Minting ${amountToMint} of each mock to ${targetAddress}...`);

    for (const mock of mocks) {
        console.log(`Minting ${mock.symbol}...`);
        const token = await hre.ethers.getContractAt(mock.contractName, mock.address);
        const amountWei = hre.ethers.parseUnits(amountToMint, mock.decimals);

        try {
            const tx = await token.mint(targetAddress, amountWei, { gasLimit: 5000000 });
            console.log(`   Tx hash: ${tx.hash}`);
            await tx.wait();
            console.log(`   Success!`);
        } catch (error) {
            console.error(`   Failed to mint ${mock.symbol}:`, error.message);
        }
    }
}

main().catch(console.error);
