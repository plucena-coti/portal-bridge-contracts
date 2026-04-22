/**
 * Probes the Band Protocol oracle (via the StdReferenceProxy) to discover
 * which token symbols are currently supported on COTI Testnet.
 *
 * Queries getReferenceData(symbol, "USD") for each candidate symbol.
 * Symbols that revert have no data relayed.
 *
 * Usage:
 *   npx hardhat run admin/probe_band_symbols.cjs --network cotiTestnet
 */
const hre = require("hardhat");

// StdReferenceProxy on COTI Testnet — this is the canonical entry point
const PROXY = "0xb6256DCb23CEE06eDa2408E73945963606fdddd7";
const ABI = [
    "function getReferenceData(string _base, string _quote) external view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
];

const SYMBOLS = [
    "COTI", "ETH", "BTC", "WBTC", "ADA", "USDT", "USDC", "GCOTI", "gCOTI",
    "BNB", "SOL", "DOGE", "XRP", "AVAX", "DOT", "MATIC", "LINK", "UNI",
    "ATOM", "FTM", "NEAR", "ALGO", "ICP", "FIL", "AAVE", "MKR", "COMP",
    "SUSHI", "CRV", "SNX", "YFI", "BAL", "BAND", "TRX", "LTC", "SHIB",
    "ARB", "OP", "APT", "SUI", "SEI", "TIA", "JUP", "PEPE", "WIF",
    "BONK", "RENDER", "INJ", "RUNE", "OSMO", "WETH", "DAI", "BUSD",
    "TUSD", "FRAX", "LUSD", "USDD", "cUSD", "WADA", "pCOTI",
];

function formatDate(epochSec) {
    if (epochSec === 0n) return "never";
    return new Date(Number(epochSec) * 1000).toISOString();
}

async function main() {
    const ref = new hre.ethers.Contract(PROXY, ABI, hre.ethers.provider);
    console.log(`Probing Band StdReferenceProxy at ${PROXY} ...\n`);

    const results = await Promise.allSettled(
        SYMBOLS.map((s) => ref.getReferenceData(s, "USD"))
    );

    const supported = [];
    for (let i = 0; i < SYMBOLS.length; i++) {
        const r = results[i];
        if (r.status === "fulfilled") {
            const priceUsd = Number(r.value.rate) / 1e18;
            const updated = formatDate(r.value.lastUpdatedBase);
            supported.push(SYMBOLS[i]);
            console.log(
                `  ✅ ${SYMBOLS[i].padEnd(8)}  $${priceUsd.toFixed(6).padStart(14)}   updated: ${updated}`
            );
        } else {
            // uncomment to see failures:
            // console.log(`  ❌ ${SYMBOLS[i].padEnd(8)}  no data`);
        }
    }

    console.log(`\nSupported tokens (${supported.length}): ${supported.join(", ")}`);
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
