/**
 * Diagnostic script to identify why WBTC -> p.WBTC deposit is reverting.
 * Run with: npx hardhat run scripts/diagnose-wbtc-deposit.cjs --network cotiTestnet
 */
const hre = require("hardhat");
const { ethers } = hre;

const ADDRESSES = {
    WBTC_PUBLIC:        "0x25B8342315DbE1E47e281832bdeC3321C14dc0B5",
    WBTC_PRIVATE:       "0x2d8d68ad17CEAFC3b22156026b25e4734FA9bc5e",
    BRIDGE_WBTC:        "0x8727e14a39ECa65cB1B1571c2E2EBA2E0B9A2e92",
    TEST_ACCOUNT:       "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012",
};

const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function paused() view returns (bool)",
    "function owner() view returns (address)",
];

const BRIDGE_ABI = [
    "function token() view returns (address)",
    "function privateToken() view returns (address)",
    "function isDepositEnabled() view returns (bool)",
    "function nativeCotiFee() view returns (uint256)",
    "function maxDepositAmount() view returns (uint256)",
    "function minDepositAmount() view returns (uint256)",
    "function paused() view returns (bool)",
    "function owner() view returns (address)",
];

const PRIVATE_TOKEN_ABI = [
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function MINTER_ROLE() view returns (bytes32)",
    "function BURNER_ROLE() view returns (bytes32)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
];

async function main() {
    const provider = ethers.provider;

    console.log("\n=== WBTC Bridge Diagnostic ===\n");

    // 1. Check code at each address
    console.log("--- Contract Code Check ---");
    const bridgeCode = await provider.getCode(ADDRESSES.BRIDGE_WBTC);
    const wbtcCode   = await provider.getCode(ADDRESSES.WBTC_PUBLIC);
    const pWbtcCode  = await provider.getCode(ADDRESSES.WBTC_PRIVATE);

    console.log(`Bridge (${ADDRESSES.BRIDGE_WBTC}):   code length = ${bridgeCode.length}`);
    console.log(`Public WBTC (${ADDRESSES.WBTC_PUBLIC}): code length = ${wbtcCode.length}`);
    console.log(`Private WBTC (${ADDRESSES.WBTC_PRIVATE}): code length = ${pWbtcCode.length}`);
    if (bridgeCode === "0x") console.error("❌ BRIDGE has NO code! Wrong address?");
    if (wbtcCode   === "0x") console.error("❌ Public WBTC has NO code! Wrong address?");
    if (pWbtcCode  === "0x") console.error("❌ Private WBTC has NO code! Wrong address?");

    // 2. Bridge state
    console.log("\n--- Bridge State ---");
    try {
        const bridge = new ethers.Contract(ADDRESSES.BRIDGE_WBTC, BRIDGE_ABI, provider);
        const [configuredToken, configuredPrivate, depositEnabled, nativeFee, minAmt, maxAmt, bridgePaused, bridgeOwner] = await Promise.all([
            bridge.token(),
            bridge.privateToken(),
            bridge.isDepositEnabled(),
            bridge.nativeCotiFee(),
            bridge.minDepositAmount(),
            bridge.maxDepositAmount(),
            bridge.paused(),
            bridge.owner(),
        ]);
        console.log(`  token()          = ${configuredToken}`);
        console.log(`  Expected WBTC    = ${ADDRESSES.WBTC_PUBLIC}`);
        const tokenMatch = configuredToken.toLowerCase() === ADDRESSES.WBTC_PUBLIC.toLowerCase();
        console.log(`  Token match:       ${tokenMatch ? "✅ YES" : "❌ NO – MISMATCH!"}`);
        console.log(`  privateToken()   = ${configuredPrivate}`);
        console.log(`  Expected p.WBTC  = ${ADDRESSES.WBTC_PRIVATE}`);
        const privateMatch = configuredPrivate.toLowerCase() === ADDRESSES.WBTC_PRIVATE.toLowerCase();
        console.log(`  Private match:     ${privateMatch ? "✅ YES" : "❌ NO – MISMATCH!"}`);
        console.log(`  isDepositEnabled = ${depositEnabled ? "✅ true" : "❌ false (DISABLED!)"}`);
        console.log(`  nativeCotiFee    = ${nativeFee.toString()} wei`);
        console.log(`  minDepositAmount = ${minAmt.toString()}`);
        console.log(`  maxDepositAmount = ${maxAmt.toString()}`);
        console.log(`  paused           = ${bridgePaused ? "❌ PAUSED" : "✅ not paused"}`);
        console.log(`  owner            = ${bridgeOwner}`);
    } catch (e) {
        console.error("❌ Failed to read bridge state:", e.message);
    }

    // 3. Public WBTC token checks
    console.log("\n--- Public WBTC Token State ---");
    try {
        const wbtc = new ethers.Contract(ADDRESSES.WBTC_PUBLIC, ERC20_ABI, provider);
        const [balance, allowance, decimals] = await Promise.all([
            wbtc.balanceOf(ADDRESSES.TEST_ACCOUNT),
            wbtc.allowance(ADDRESSES.TEST_ACCOUNT, ADDRESSES.BRIDGE_WBTC),
            wbtc.decimals(),
        ]);
        console.log(`  Decimals:  ${decimals}`);
        console.log(`  Balance (${ADDRESSES.TEST_ACCOUNT}): ${ethers.formatUnits(balance, decimals)} WBTC (raw: ${balance.toString()})`);
        console.log(`  Allowance for bridge: ${ethers.formatUnits(allowance, decimals)} WBTC (raw: ${allowance.toString()})`);
        if (allowance === 0n) console.warn("⚠️  Allowance is ZERO – user must approve the bridge first");

        // Check if WBTC is paused (it's PausableToken)
        try {
            const isPaused = await wbtc.paused();
            console.log(`  WBTC token paused: ${isPaused ? "❌ YES – transfers blocked!" : "✅ No"}`);
        } catch {
            console.log("  (WBTC paused() not available or reverted – old Solidity ABI)");
        }
    } catch (e) {
        console.error("❌ Failed to read public WBTC state:", e.message);
    }

    // 4. Private WBTC (p.WBTC) role checks
    console.log("\n--- Private WBTC (p.WBTC) Role Check ---");
    try {
        const pWbtc = new ethers.Contract(ADDRESSES.WBTC_PRIVATE, PRIVATE_TOKEN_ABI, provider);
        const MINTER_ROLE = ethers.id("MINTER_ROLE");
        const BURNER_ROLE  = ethers.id("BURNER_ROLE");
        const [hasMinter, hasBurner, decimals] = await Promise.all([
            pWbtc.hasRole(MINTER_ROLE, ADDRESSES.BRIDGE_WBTC),
            pWbtc.hasRole(BURNER_ROLE, ADDRESSES.BRIDGE_WBTC),
            pWbtc.decimals(),
        ]);
        console.log(`  Decimals:         ${decimals}`);
        console.log(`  Bridge has MINTER_ROLE: ${hasMinter ? "✅ YES" : "❌ NO – deposit will fail at mint step!"}`);
        console.log(`  Bridge has BURNER_ROLE: ${hasBurner ? "✅ YES" : "❌ NO – withdraw will fail!"}`);
    } catch (e) {
        console.error("❌ Failed to read private WBTC roles:", e.message);
    }

    // 5. Simulate the deposit call
    console.log("\n--- Simulating deposit(200000000) ---");
    const DEPOSIT_ABI = ["function deposit(uint256 amount) payable"];
    try {
        const bridge = new ethers.Contract(ADDRESSES.BRIDGE_WBTC, DEPOSIT_ABI, provider);
        const AMOUNT = 200000000n; // 2 WBTC
        const gas = await bridge["deposit"].estimateGas(AMOUNT, {
            from: ADDRESSES.TEST_ACCOUNT,
            value: 0n,
        });
        console.log(`  ✅ Simulation OK – estimated gas: ${gas.toString()}`);
    } catch (e) {
        console.error(`  ❌ Simulation FAILED: ${e.message}`);
        if (e.data) console.error(`     Revert data: ${e.data}`);
        if (e.reason) console.error(`     Reason: ${e.reason}`);
        if (e.errorName) console.error(`     Custom error: ${e.errorName}`);
        if (e.revert) console.error(`     Revert: ${JSON.stringify(e.revert)}`);
    }

    console.log("\n=== Diagnostic Complete ===\n");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
