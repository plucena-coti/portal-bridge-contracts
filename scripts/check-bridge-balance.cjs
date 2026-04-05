/**
 * check-bridge-balance.cjs
 *
 * Queries the public ERC20 balance held by a PrivacyBridge contract.
 *
 * Usage:
 *   npx hardhat run scripts/check-bridge-balance.cjs --network <network>
 *
 * Options (via env vars):
 *   BRIDGE: Name or address of the bridge contract (default: PrivacyBridgeWETH)
 *   TOKEN: Name or address of the public ERC20 token (default: WETH)
 */

const hre = require("hardhat");

const ADDRESSES = {
    // COTI Testnet
    7082400: {
        WETH: "0x8bca4e6bbE402DB4aD189A316137aD08206154FB",
        PrivacyBridgeWETH: "0xfF5242274eAB28379C8ae194baFDc64E55e339e0",
    },
    // COTI Mainnet
    2632500: {
        WETH: "0x639aCc80569c5FC83c6FBf2319A6Cc38bBfe26d1",
        // PrivacyBridgeWETH: "..." // Not in config.ts yet
    }
};

async function main() {
    const network = await hre.ethers.provider.getNetwork();
    const chainId = Number(network.chainId);
    const networkConfig = ADDRESSES[chainId] || {};

    const bridgeTarget = process.env.BRIDGE || "PrivacyBridgeWETH";
    const tokenTarget = process.env.TOKEN || "WETH";

    const bridgeAddress = networkConfig[bridgeTarget] || (bridgeTarget.startsWith("0x") ? bridgeTarget : null);
    const tokenAddress = networkConfig[tokenTarget] || (tokenTarget.startsWith("0x") ? tokenTarget : null);

    if (!bridgeAddress) {
        throw new Error(`Bridge address not found for "${bridgeTarget}" on network ${chainId}. Provide an absolute address via BRIDGE=0x...`);
    }
    if (!tokenAddress) {
        throw new Error(`Token address not found for "${tokenTarget}" on network ${chainId}. Provide an absolute address via TOKEN=0x...`);
    }

    console.log(`\nNetwork: ${hre.network.name} (Chain ID: ${chainId})`);
    console.log(`Bridge:  ${bridgeTarget} (${bridgeAddress})`);
    console.log(`Token:   ${tokenTarget} (${tokenAddress})`);

    const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
    ];

    const [signer] = await hre.ethers.getSigners();
    const tokenContract = new hre.ethers.Contract(tokenAddress, erc20Abi, signer);

    const [balance, decimals, symbol] = await Promise.all([
        tokenContract.balanceOf(bridgeAddress),
        tokenContract.decimals(),
        tokenContract.symbol()
    ]);

    const formattedBalance = hre.ethers.formatUnits(balance, decimals);

    console.log(`\n💰 Balance: ${formattedBalance} ${symbol}`);
    console.log("=========================================\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
