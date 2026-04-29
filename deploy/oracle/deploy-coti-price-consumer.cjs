/**
 * Deploy CotiPriceConsumer — Band Protocol oracle price consumer for COTI/USD.
 *
 * Run with:
 *   npx hardhat compile
 *   npx hardhat run deploy/oracle/deploy-coti-price-consumer.cjs --network cotiTestnet
 */
const hre = require("hardhat");

// Band Protocol StdReferenceProxy on COTI Testnet
const BAND_REF_PROXY = "0xb6256DCb23CEE06eDa2408E73945963606fdddd7";

// Maximum staleness in seconds (1 hour). Set to 0 to disable the check.
const MAX_STALENESS = 3600;

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying CotiPriceConsumer with account:", deployer.address);
    console.log("Network:", hre.network.name);

    const Factory = await hre.ethers.getContractFactory("CotiPriceConsumer");
    const contract = await Factory.deploy(BAND_REF_PROXY, MAX_STALENESS, { gasLimit: 5000000 });
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ CotiPriceConsumer deployed to:", address);

    // Quick sanity read
    try {
        const price = await contract.getPrice("COTI");
        console.log("   COTI/USD price (raw 1e18):", price.toString());

        const readable = Number(price) / 1e18;
        console.log("   COTI/USD price (USD):     ", `$${readable}`);
    } catch (err) {
        console.log("   ⚠️  Could not read price (oracle may not be active yet):", err.message);
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
