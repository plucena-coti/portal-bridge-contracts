const hre = require("hardhat");

async function main() {
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const BURNER_ROLE = hre.ethers.id("BURNER_ROLE");

    const addresses = {
        // Testnet 7082400
        PrivateCoti: "0x45E7D6730a660d19e9d7e02007AfC1D83c8B3634",
        PrivacyBridgeCotiNative: "0xEF26529b75cf49e8a26D86B6d2E73eca15162F29",
        "p.WETH": "0x0e0BABAd7f4000619043977aFbB6c40134470279",
        PrivacyBridgeWETH: "0x08BeA7881FB66D57B667a9d9320c213daE4Af1a3",
        "p.WBTC": "0x1521ffcBa1D00B5986e5A1A3Dec875e7C25dD10f",
        PrivacyBridgeWBTC: "0x1F80eedfd852f2b4D8293C7A3F7A8b84846f4287",
        "p.USDT": "0x0c8158D8790090d6029E2d46a99A803765AA5Fb1",
        PrivacyBridgeUSDT: "0x8EF5b13698A1abDE67E7a592dEB0F998D7331530",
        "p.USDC_E": "0xe6b954f16fa37c84a0A5897b984CF4D15B2be42f",
        PrivacyBridgeUSDCe: "0x8A8C354eEB3D871Ad60efb1c9a47992c730cC69e",
        "p.WADA": "0xE14D9B470CA46AFD47AB188c062564453EC47067",
        PrivacyBridgeWADA: "0x2ad7aca40da0F48f7ca852591f7368e2a539B587",
        "p.gCOTI": "0x92f261C2f32e4B75F2B6eA25e260a44B955a7286",
        PrivacyBridgegCOTI: "0x07dC581ec4Ed1715054BF5741F13eE486F8c34a2"
    };

    const pairs = [
        [addresses.PrivateCoti, addresses.PrivacyBridgeCotiNative, "COTI"],
        [addresses["p.WETH"], addresses.PrivacyBridgeWETH, "WETH"],
        [addresses["p.WBTC"], addresses.PrivacyBridgeWBTC, "WBTC"],
        [addresses["p.USDT"], addresses.PrivacyBridgeUSDT, "USDT"],
        [addresses["p.USDC_E"], addresses.PrivacyBridgeUSDCe, "USDCe"],
        [addresses["p.WADA"], addresses.PrivacyBridgeWADA, "WADA"],
        [addresses["p.gCOTI"], addresses.PrivacyBridgegCOTI, "gCOTI"]
    ];

    console.log("--- FINAL ROLE VERIFICATION ---");
    for (const [ptAddr, bridgeAddr, name] of pairs) {
        const pt = await hre.ethers.getContractAt("PrivateERC20", ptAddr);
        const hasMinter = await pt.hasRole(MINTER_ROLE, bridgeAddr);
        const hasBurner = await pt.hasRole(BURNER_ROLE, bridgeAddr);
        console.log(`${name}: Bridge ${bridgeAddr} has roles on ${ptAddr}: MINTER=${hasMinter}, BURNER=${hasBurner}`);
        if (!hasMinter || !hasBurner) {
            console.error(`!!! FAILED: ${name} roles missing!`);
        }
    }
}

main().catch(console.error);
