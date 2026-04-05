
const { ethers } = require('ethers');

const RPC_URL = "https://testnet.coti.io/rpc";

const USER_ADDRESS = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
const BRIDGE_ADDRESS = "0xAaeC61a03a5937a440aAFaF2B52F6B6630f4f7E2"; // PrivacyBridgegCOTI (New)
const TOKEN_ADDRESS = "0x7AC988eb3E45fe6ADB05DFaf609c8DBb4A902cdC"; // gCOTI

const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address, address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

const BRIDGE_ABI = [
    "function deposit(uint256 amount) external",
    "function owner() view returns (address)",
    "function token() view returns (address)"
];

async function main() {
    console.log("Connecting to RPC:", RPC_URL);
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // 1. Check Code at Bridge
    const code = await provider.getCode(BRIDGE_ADDRESS);
    console.log(`Bridge Contract Code Length: ${code.length}`);
    if (code === "0x") {
        console.error("❌ Bridge contract has NO CODE!");
        return;
    }

    try {
        const bridge = new ethers.Contract(BRIDGE_ADDRESS, BRIDGE_ABI, provider);
        const tokenInBridge = await bridge.token();
        console.log(`Bridge Token Address: ${tokenInBridge}`);
        if (tokenInBridge.toLowerCase() !== TOKEN_ADDRESS.toLowerCase()) {
            console.error(`❌ MISMATCH: Bridge uses token ${tokenInBridge}, expected ${TOKEN_ADDRESS}`);
        } else {
            console.log("✅ Bridge uses correct token address");
        }
    } catch (e) {
        console.error("❌ Could not read bridge.token()", e.message);
    }

    // 2. Check Token details
    const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    console.log(`Token: ${symbol} (${decimals} decimals)`);

    // 3. Check Balance and Allowance
    const balance = await token.balanceOf(USER_ADDRESS);
    const allowance = await token.allowance(USER_ADDRESS, BRIDGE_ADDRESS);

    console.log(`User Balance (Wei): ${balance.toString()}`);
    console.log(`User Allowance (Wei): ${allowance.toString()}`);

    const amountToBridge = ethers.parseUnits("10", decimals);
    console.log(`Amount to Bridge (Wei): ${amountToBridge.toString()}`);

    if (balance < amountToBridge) console.warn("⚠️ Balance too low");
    if (allowance < amountToBridge) console.warn("⚠️ Allowance too low");

    // 4. Simulate Deposit (using call)
    const iface = new ethers.Interface(BRIDGE_ABI);
    const data = iface.encodeFunctionData("deposit", [amountToBridge]);
    const dataSmall = iface.encodeFunctionData("deposit", [ethers.parseUnits("9", decimals)]);

    console.log("--- Expect 10 (Fail) ---");
    try {
        const ret = await provider.call({
            to: BRIDGE_ADDRESS,
            from: USER_ADDRESS,
            data: data
        });
        console.log("✅ Simulation (10) successful:", ret);
    } catch (e) {
        console.error("❌ Simulation (10) FAILED");
        if (e.data) {
            try {
                const decoded = iface.parseError(e.data);
                console.log("Decoded Error:", decoded);
            } catch (decodeErr) { }
        }
    }
}

main().catch(console.error);
