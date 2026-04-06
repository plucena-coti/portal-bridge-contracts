/**
 * rescue-wada.cjs
 *
 * Rescues funds from PrivacyBridgeWADA at 0x123c42C55A99352d35d6e0EC13b3E850BAD1D7f3
 *
 * Available rescue operations (set DRY_RUN = false and configure below):
 *
 *   1. rescueERC20(token, to, amount)
 *      → Recovers any ERC-20 token (including WADA liquidity) held by the bridge.
 *        Use this to pull out the main WADA token balance or any mistakenly sent tokens.
 *
 *   2. withdrawFees(to, amount)
 *      → Transfers accumulated deposit/withdraw fee tokens (WADA) to a recipient.
 *        Only up to accumulatedFees.
 *
 *   3. withdrawCotiFees(to, amount)
 *      → Transfers accumulated native COTI (from nativeCotiFee charges) to a recipient.
 *        Only up to accumulatedCotiFees.
 *
 * Usage:
 *   npx hardhat run scripts/rescue-wada.cjs --network cotiTestnet
 *
 * All functions are onlyOwner. The signer must be the contract owner.
 */

"use strict";

const hre = require("hardhat");

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — review and set before running
// ─────────────────────────────────────────────────────────────────────────────

const BRIDGE_ADDRESS = "0x123c42C55A99352d35d6e0EC13b3E850BAD1D7f3";

// WADA token address (public ERC-20 — the token locked in the bridge)
const WADA_TOKEN_ADDRESS = "0x124dcF7a3eB6f061345a193dcBE9DD524e06ba53";

// Recipient for all rescued funds — change to your target wallet
const RECIPIENT = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012"; // ← SET THIS before running

// Set to true to simulate without sending any transactions
const DRY_RUN = false;

// ── Operations to run — set each to true/false as needed ────────────────────

// 1. Rescue the full WADA token balance held by the bridge via rescueERC20()
//    This transfers the entire WADA liquidity pool out of the contract.
//    Set RESCUE_AMOUNT_WADA to hre.ethers.MaxUint256 to rescue all, or a specific bigint.
const RUN_RESCUE_ERC20 = true;
const RESCUE_AMOUNT_WADA = null; // null = read on-chain balance and rescue all

// 2. Withdraw accumulated WADA deposit/withdraw fees via withdrawFees()
//    Uses accumulatedFees on-chain — pass null to use the full accumulatedFees value.
const RUN_WITHDRAW_FEES = true;
const WITHDRAW_FEES_AMOUNT = null; // null = use accumulatedFees

// 3. Withdraw accumulated native COTI fees via withdrawCotiFees()
//    Uses accumulatedCotiFees on-chain — pass null to use the full value.
const RUN_WITHDRAW_COTI_FEES = true;
const WITHDRAW_COTI_FEES_AMOUNT = null; // null = use accumulatedCotiFees

// ─────────────────────────────────────────────────────────────────────────────

const BRIDGE_ABI = [
    "function owner() view returns (address)",
    "function accumulatedFees() view returns (uint256)",
    "function accumulatedCotiFees() view returns (uint256)",
    "function rescueERC20(address token, address to, uint256 amount) external",
    "function withdrawFees(address to, uint256 amount) external",
    "function withdrawCotiFees(address to, uint256 amount) external",
];

const ERC20_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
];

async function main() {
    if (!RECIPIENT || RECIPIENT.trim() === "") {
        throw new Error("RECIPIENT is not set — edit RECIPIENT in the script before running.");
    }

    const [signer] = await hre.ethers.getSigners();
    console.log("Signer:   ", signer.address);
    console.log("Bridge:   ", BRIDGE_ADDRESS);
    console.log("Recipient:", RECIPIENT);
    if (DRY_RUN) console.log("\n⚠️  DRY RUN — no transactions will be sent\n");

    const bridge = new hre.ethers.Contract(BRIDGE_ADDRESS, BRIDGE_ABI, signer);
    const wadaToken = new hre.ethers.Contract(WADA_TOKEN_ADDRESS, ERC20_ABI, signer);

    // ── Read on-chain state ──────────────────────────────────────────────────
    const [owner, accFees, accCotiFees, bridgeWadaBalance, wadaDecimals, wadaSymbol] = await Promise.all([
        bridge.owner(),
        bridge.accumulatedFees(),
        bridge.accumulatedCotiFees(),
        wadaToken.balanceOf(BRIDGE_ADDRESS),
        wadaToken.decimals(),
        wadaToken.symbol(),
    ]);

    console.log("\n── Bridge State ────────────────────────────────────");
    console.log(`  owner:              ${owner}`);
    console.log(`  WADA balance:       ${hre.ethers.formatUnits(bridgeWadaBalance, wadaDecimals)} ${wadaSymbol}`);
    console.log(`  accumulatedFees:    ${hre.ethers.formatUnits(accFees, wadaDecimals)} ${wadaSymbol}`);
    console.log(`  accumulatedCotiFees:${hre.ethers.formatEther(accCotiFees)} COTI`);
    console.log("────────────────────────────────────────────────────\n");

    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        throw new Error(`Signer (${signer.address}) is not the contract owner (${owner}). Aborting.`);
    }

    // ── 1. rescueERC20 ───────────────────────────────────────────────────────
    if (RUN_RESCUE_ERC20) {
        // accumulatedFees are managed separately; rescueERC20 can pull any balance including liquidity.
        // Rescue = full WADA balance minus the accumulatedFees (which are withdrawn separately below)
        const rescueAmount = RESCUE_AMOUNT_WADA !== null
            ? RESCUE_AMOUNT_WADA
            : bridgeWadaBalance - accFees; // remaining liquidity, excluding tracked fees

        if (rescueAmount <= 0n) {
            console.log("rescueERC20: nothing to rescue (balance <= accumulatedFees)");
        } else {
            console.log(`rescueERC20: rescuing ${hre.ethers.formatUnits(rescueAmount, wadaDecimals)} ${wadaSymbol} → ${RECIPIENT}`);
            if (!DRY_RUN) {
                const tx = await bridge.rescueERC20(WADA_TOKEN_ADDRESS, RECIPIENT, rescueAmount, { gasLimit: 200000 });
                console.log("  tx:", tx.hash);
                const receipt = await tx.wait();
                if (receipt.status !== 1) throw new Error("rescueERC20 failed on-chain");
                console.log("  ✅ rescueERC20 confirmed");
            } else {
                console.log("  [DRY RUN] skipped");
            }
        }
    }

    // ── 2. withdrawFees ──────────────────────────────────────────────────────
    if (RUN_WITHDRAW_FEES) {
        const feesAmount = WITHDRAW_FEES_AMOUNT !== null ? WITHDRAW_FEES_AMOUNT : accFees;

        if (feesAmount <= 0n) {
            console.log("withdrawFees: accumulatedFees is 0, skipping");
        } else {
            console.log(`withdrawFees: ${hre.ethers.formatUnits(feesAmount, wadaDecimals)} ${wadaSymbol} → ${RECIPIENT}`);
            if (!DRY_RUN) {
                const tx = await bridge.withdrawFees(RECIPIENT, feesAmount, { gasLimit: 200000 });
                console.log("  tx:", tx.hash);
                const receipt = await tx.wait();
                if (receipt.status !== 1) throw new Error("withdrawFees failed on-chain");
                console.log("  ✅ withdrawFees confirmed");
            } else {
                console.log("  [DRY RUN] skipped");
            }
        }
    }

    // ── 3. withdrawCotiFees ──────────────────────────────────────────────────
    if (RUN_WITHDRAW_COTI_FEES) {
        const cotiFeeAmount = WITHDRAW_COTI_FEES_AMOUNT !== null ? WITHDRAW_COTI_FEES_AMOUNT : accCotiFees;

        if (cotiFeeAmount <= 0n) {
            console.log("withdrawCotiFees: accumulatedCotiFees is 0, skipping");
        } else {
            console.log(`withdrawCotiFees: ${hre.ethers.formatEther(cotiFeeAmount)} COTI → ${RECIPIENT}`);
            if (!DRY_RUN) {
                const tx = await bridge.withdrawCotiFees(RECIPIENT, cotiFeeAmount, { gasLimit: 200000 });
                console.log("  tx:", tx.hash);
                const receipt = await tx.wait();
                if (receipt.status !== 1) throw new Error("withdrawCotiFees failed on-chain");
                console.log("  ✅ withdrawCotiFees confirmed");
            } else {
                console.log("  [DRY RUN] skipped");
            }
        }
    }

    console.log("\nDone.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
