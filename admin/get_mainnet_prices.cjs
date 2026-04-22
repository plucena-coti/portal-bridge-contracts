/**
 * Queries token/USD prices on COTI Mainnet.
 *
 * Usage (via deployed CotiPriceConsumer):
 *   PRICE_CONSUMER=0xYourAddress npx hardhat run admin/get_mainnet_prices.cjs --network cotiMainnet
 *
 * Usage (direct Band proxy query — no contract needed):
 *   npx hardhat run admin/get_mainnet_prices.cjs --network cotiMainnet
 */
const hre = require("hardhat");

// Band Protocol StdReferenceProxy on COTI Mainnet
const BAND_REF_PROXY = "0x9503d502435f8e228b874Ba0F792301d4401b523";

// All tokens the contract has dedicated getters for
const TOKENS = ["COTI", "ETH", "WBTC", "WADA", "USDC", "USDT"];

const CONSUMER_ABI = [
    "function getCotiPriceData() external view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
    "function getEthPriceData()  external view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
    "function getWbtcPriceData() external view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
    "function getWadaPriceData() external view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
    "function getUsdcPriceData() external view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
    "function getUsdtPriceData() external view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
    "function maxStaleness() external view returns (uint256)",
    "function ref() external view returns (address)",
];

const REF_ABI = [
    "function getReferenceData(string _base, string _quote) external view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
];

function formatDate(epochSec) {
    if (epochSec === 0n) return "never";
    return new Date(Number(epochSec) * 1000).toISOString();
}

function printPrice(symbol, data) {
    const priceUsd = Number(data.rate) / 1e18;
    const pad = symbol.length < 5 ? " ".repeat(5 - symbol.length) : "";
    console.log(
        `  ${symbol}/USD${pad}  $${priceUsd.toFixed(6).padStart(14)}   updated: ${formatDate(data.lastUpdatedBase)}`
    );
}

async function viaCotiPriceConsumer(address) {
    console.log(`\nQuerying CotiPriceConsumer at ${address} ...\n`);

    const consumer = new hre.ethers.Contract(address, CONSUMER_ABI, hre.ethers.provider);

    const [staleness, refAddr] = await Promise.all([
        consumer.maxStaleness(),
        consumer.ref(),
    ]);

    console.log("  Band Ref Proxy:", refAddr);
    console.log("  Max Staleness: ", staleness.toString(), "seconds\n");

    const results = await Promise.allSettled([
        consumer.getCotiPriceData(),
        consumer.getEthPriceData(),
        consumer.getWbtcPriceData(),
        consumer.getWadaPriceData(),
        consumer.getUsdcPriceData(),
        consumer.getUsdtPriceData(),
    ]);

    for (let i = 0; i < TOKENS.length; i++) {
        const r = results[i];
        if (r.status === "fulfilled") {
            printPrice(TOKENS[i], r.value);
        } else {
            const reason = r.reason?.reason || r.reason?.message || String(r.reason);
            console.log(`  ${TOKENS[i]}/USD  ❌ ${reason}`);
        }
    }
}

async function viaDirectProxy() {
    console.log(`\nNo PRICE_CONSUMER env var — querying Band StdReferenceProxy directly at ${BAND_REF_PROXY} ...\n`);

    const ref = new hre.ethers.Contract(BAND_REF_PROXY, REF_ABI, hre.ethers.provider);

    const results = await Promise.allSettled(
        TOKENS.map((t) => ref.getReferenceData(t, "USD"))
    );

    for (let i = 0; i < TOKENS.length; i++) {
        const r = results[i];
        if (r.status === "fulfilled") {
            printPrice(TOKENS[i], r.value);
        } else {
            const reason = r.reason?.reason || r.reason?.message || String(r.reason);
            console.log(`  ${TOKENS[i]}/USD  ❌ ${reason}`);
        }
    }
}

async function main() {
    console.log("Network:", hre.network.name);

    const consumerAddress = process.env.PRICE_CONSUMER;

    if (consumerAddress) {
        await viaCotiPriceConsumer(consumerAddress);
    } else {
        await viaDirectProxy();
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
