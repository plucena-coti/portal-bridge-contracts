const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const RECIPIENT = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    const AMOUNT = "1000";

    // Testnet Addresses updated from deployment (Step 2837)
    const TOKENS = [
        { symbol: "WETH", address: "0xC5BE4139a46899e4962646fB213B4646B19446E1".toLowerCase(), decimals: 18, abiName: "WETH9" },
        { symbol: "WBTC", address: "0x4Bf62DC0effC03f0eD60E020C20b689399F21A3F".toLowerCase(), decimals: 8, abiName: "WBTC" },
        { symbol: "USDT", address: "0x8a9BFDBC65A27F72847DCeb3B05075c60872F251".toLowerCase(), decimals: 6, abiName: "USDT" },
        { symbol: "USDCe", address: "0xe3AC97094b43Def6Ee3cF0E51AB8d1cEE1D632a2".toLowerCase(), decimals: 6, abiName: "USDCe" },
        { symbol: "WADA", address: "0x4E4Cc8953a842B8BB9158fabfF822e322FFa0A43".toLowerCase(), decimals: 6, abiName: "WADA" },
        { symbol: "gCOTI", address: "0xF5d2d106D2DC511196b79b8AEABABF13339CcF1E".toLowerCase(), decimals: 18, abiName: "gCOTI" }
    ];

    const [signer] = await ethers.getSigners();
    console.log(`Minting tokens to: ${RECIPIENT}`);
    console.log(`Using signer: ${signer.address}`);
    console.log("------------------------------------------------");

    for (const token of TOKENS) {
        try {
            const amountWei = ethers.parseUnits(AMOUNT, token.decimals);
            console.log(`Minting ${AMOUNT} ${token.symbol}...`);

            const ContractFactory = await ethers.getContractFactory(token.abiName);
            const contract = ContractFactory.attach(token.address);

            // WETH usually requires deposit, but our mock has 'mint' (onlyOwner)
            // We'll try 'mint' for all since they are mocks owned by deployer
            // Explicit gas limit to avoid estimation errors
            const tx = await contract.mint(RECIPIENT, amountWei, { gasLimit: 1000000 });
            console.log(`  -> Tx sent: ${tx.hash}`);
            await tx.wait();
            console.log(`  ✅ Successfully minted ${AMOUNT} ${token.symbol}`);

            // Wait 5 seconds to let the node catch up
            await new Promise(r => setTimeout(r, 5000));
        } catch (error) {
            console.error(`  ❌ Failed to mint ${token.symbol}: ${error.message}`);
        }
    }

    console.log("------------------------------------------------");
    console.log("Minting complete.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
