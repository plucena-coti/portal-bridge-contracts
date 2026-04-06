/**
 * update-fees.cjs
 *
 * Updates deposit fee, withdrawal fee, and native COTI fee for deployed
 * PrivacyBridge contracts.
 *
 * Usage:
 *   npx hardhat run scripts/update-fees.cjs --network <network>
 *
 * To target a specific bridge only, set the BRIDGE env var:
 *   BRIDGE=PrivacyBridgeCotiNative npx hardhat run scripts/update-fees.cjs --network <network>
 *
 * Fee units:
 *   depositFeeBasisPoints / withdrawFeeBasisPoints use FEE_DIVISOR = 1,000,000
 *   Examples:
 *     1000  => 0.1%
 *     5000  => 0.5%
 *     10000 => 1%
 *     100000 => 10%  (MAX_FEE_UNITS)
 *
 *   nativeCotiFee is the fixed native COTI cost per ERC-20 bridge operation (in wei).
 *   Set to 0 for the Native bridge (not used).
 */

"use strict";

const hre = require("hardhat");

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — edit these values before running the script
// ─────────────────────────────────────────────────────────────────────────────
const FEE_CONFIG = {
    // Deposit fee in basis points (FEE_DIVISOR = 1_000_000; max 100_000 = 10%)
    depositFeeBasisPoints: process.env.DEPOSIT_FEE_BPS !== undefined ? parseInt(process.env.DEPOSIT_FEE_BPS) : null,

    // Withdrawal fee in basis points
    withdrawFeeBasisPoints: process.env.WITHDRAW_FEE_BPS !== undefined ? parseInt(process.env.WITHDRAW_FEE_BPS) : null,

    // Fixed native COTI fee per operation for ERC-20 bridges (in wei)
    // 1 COTI = 1 * 10^18 wei. Using ethers.parseEther("1") equates to 1 COTI.
    // Set to null to skip updating this value if NATIVE_FEE is not provided.
    nativeCotiFee: process.env.NATIVE_FEE !== undefined 
        ? hre.ethers.parseEther(process.env.NATIVE_FEE) 
        : null,
};

// Set to true to only print current state without making changes
const DRY_RUN = false;

// Set to true to skip the native COTI bridge (only update ERC-20 bridges)
const ERC20_ONLY = true;
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

// Helper function to dynamically load bridge addresses from config.ts based on chainId
function getBridgeAddresses(chainId) {
    const configPath = path.join(__dirname, '../src/contracts/config.ts');
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Find the block corresponding to the given chainId
    const blockRegex = new RegExp(`^\\s*${chainId}:\\s*\\{[\\s\\S]*?(?:^\\s*\\},?|^\\s*\\};)`, 'm');
    const match = content.match(blockRegex);
    if (!match) {
        throw new Error(`Chain ID ${chainId} not found in src/contracts/config.ts`);
    }
    
    const block = match[0];
    const bridges = {};
    const bridgeRegex = /(PrivacyBridge[a-zA-Z0-9_]+):\s*"([^"]+)"/g;
    let bMatch;
    while ((bMatch = bridgeRegex.exec(block)) !== null) {
        bridges[bMatch[1]] = bMatch[2];
    }
    
    if (Object.keys(bridges).length === 0) {
        throw new Error(`No bridge addresses found for chain ID ${chainId} in config.ts`);
    }
    
    return bridges;
}

// The Native bridge does not use nativeCotiFee (no ERC-20 transfer overhead)
const NATIVE_BRIDGE_NAME = "PrivacyBridgeCotiNative";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const network = await hre.ethers.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    console.log(`Connected to network: ${hre.network.name} (chainId: ${chainId})`);
    console.log("Signer:", deployer.address);
    if (DRY_RUN) console.log("⚠️  DRY RUN — no transactions will be sent\n");

    const BRIDGE_ADDRESSES = getBridgeAddresses(chainId);
    console.log("Loaded bridge addresses from config:", BRIDGE_ADDRESSES);

    // Allow targeting a single bridge via env variable
    const targetBridge = process.env.BRIDGE || null;
    let bridgeNames = targetBridge
        ? [targetBridge]
        : Object.keys(BRIDGE_ADDRESSES);

    if (ERC20_ONLY && !targetBridge) {
        bridgeNames = bridgeNames.filter(n => n !== NATIVE_BRIDGE_NAME);
        console.log("ERC20_ONLY mode — skipping", NATIVE_BRIDGE_NAME);
    }

    if (targetBridge && !BRIDGE_ADDRESSES[targetBridge]) {
        console.error(`❌ Unknown bridge: "${targetBridge}"`);
        console.error("   Valid names:", Object.keys(BRIDGE_ADDRESSES).join(", "));
        process.exitCode = 1;
        return;
    }

    const { depositFeeBasisPoints, withdrawFeeBasisPoints, nativeCotiFee } = FEE_CONFIG;

    // Minimal ABI — only the setters and readers we need
    const bridgeAbi = [
        "function depositFeeBasisPoints() view returns (uint256)",
        "function withdrawFeeBasisPoints() view returns (uint256)",
        "function nativeCotiFee() view returns (uint256)",
        "function setDepositFee(uint256 _feeBasisPoints)",
        "function setWithdrawFee(uint256 _feeBasisPoints)",
        "function setNativeCotiFee(uint256 _fee)",
    ];

    for (const name of bridgeNames) {
        const address = BRIDGE_ADDRESSES[name];
        console.log(`\n─── ${name} (${address}) ───`);

        const bridge = new hre.ethers.Contract(address, bridgeAbi, deployer);

        // Read current values
        const [curDeposit, curWithdraw, curCotiFee] = await Promise.all([
            bridge.depositFeeBasisPoints(),
            bridge.withdrawFeeBasisPoints(),
            bridge.nativeCotiFee(),
        ]);

        console.log(`   Current depositFeeBasisPoints : ${curDeposit.toString()}`);
        console.log(`   Current withdrawFeeBasisPoints: ${curWithdraw.toString()}`);
        console.log(`   Current nativeCotiFee         : ${hre.ethers.formatEther(curCotiFee)} COTI`);

        if (DRY_RUN) {
            console.log(`   [dry-run] Would set depositFee  → ${depositFeeBasisPoints}`);
            console.log(`   [dry-run] Would set withdrawFee → ${withdrawFeeBasisPoints}`);
            if (nativeCotiFee !== null) {
                console.log(`   [dry-run] Would set nativeCotiFee → ${hre.ethers.formatEther(nativeCotiFee)} COTI`);
            }
            continue;
        }

        // ── Deposit fee ──────────────────────────────────────────────────────
        if (depositFeeBasisPoints !== null) {
            if (BigInt(curDeposit) !== BigInt(depositFeeBasisPoints)) {
                process.stdout.write(`   Setting depositFee to ${depositFeeBasisPoints}... `);
                const tx = await bridge.setDepositFee(depositFeeBasisPoints, { gasLimit: 200000 });
                await tx.wait();
                console.log(`✅ (tx: ${tx.hash})`);
            } else {
                console.log(`   depositFee already ${depositFeeBasisPoints} — skipped`);
            }
        }

        // ── Withdrawal fee ───────────────────────────────────────────────────
        if (withdrawFeeBasisPoints !== null) {
            if (BigInt(curWithdraw) !== BigInt(withdrawFeeBasisPoints)) {
                process.stdout.write(`   Setting withdrawFee to ${withdrawFeeBasisPoints}... `);
                const tx = await bridge.setWithdrawFee(withdrawFeeBasisPoints, { gasLimit: 200000 });
                await tx.wait();
                console.log(`✅ (tx: ${tx.hash})`);
            } else {
                console.log(`   withdrawFee already ${withdrawFeeBasisPoints} — skipped`);
            }
        }

        // ── Native COTI fee (ERC-20 bridges only) ────────────────────────────
        if (nativeCotiFee !== null) {
            if (BigInt(curCotiFee) !== BigInt(nativeCotiFee)) {
                process.stdout.write(`   Setting nativeCotiFee to ${hre.ethers.formatEther(nativeCotiFee)} COTI... `);
                const tx = await bridge.setNativeCotiFee(nativeCotiFee, { gasLimit: 200000 });
                await tx.wait();
                console.log(`✅ (tx: ${tx.hash})`);
            } else {
                console.log(`   nativeCotiFee already ${hre.ethers.formatEther(nativeCotiFee)} COTI — skipped`);
            }
        }
    }

    console.log("\n✅ Done.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
