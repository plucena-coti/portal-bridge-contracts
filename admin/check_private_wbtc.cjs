const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIVATE_WBTC = "0xf2A4Fc0695012754f762181dd563e34A70103F89";
    const USER_ADDRESS = "0xab81c57ccc578a5636bff47b896bec6af1c30012";

    console.log("Checking PrivateWBTC contract...");
    console.log(`Address: ${PRIVATE_WBTC}`);

    const ABI = [
        "function decimals() view returns (uint8)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint256)"
    ];

    const provider = ethers.provider;
    const contract = new ethers.Contract(PRIVATE_WBTC, ABI, provider);

    try {
        const name = await contract.name();
        console.log(`Name: ${name}`);
    } catch (e) {
        console.log("No name function");
    }

    try {
        const symbol = await contract.symbol();
        console.log(`Symbol: ${symbol}`);
    } catch (e) {
        console.log("No symbol function");
    }

    try {
        const decimals = await contract.decimals();
        console.log(`Decimals: ${decimals}`);
    } catch (e) {
        console.log("No decimals function or error:", e.message);
    }

    try {
        const balance = await contract.balanceOf(USER_ADDRESS);
        console.log(`Raw balance (encrypted): ${balance.toString()}`);
    } catch (e) {
        console.log("Error getting balance:", e.message);
    }
}

main().catch(console.error);
