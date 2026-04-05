/**
 * Generate flattened Standard JSON Input files for contract verification.
 *
 * Reads deployed addresses from src/contracts/config.ts (testnet block)
 * and produces one JSON + constructor-args file per contract in verify/.
 *
 * Run with:
 *   npx hardhat run scripts/generate-verify-json.cjs --network cotiTestnet
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// ── Deployed addresses (from latest config.ts testnet block) ────────────────
const ADDRESSES = {
    // Private Tokens (no constructor args)
    PrivateCOTI:                        "0x4332b209E85Af33f58E52Bff2fa8089678e5E62C",
    PrivateWrappedEther:                "0xDD3b8F777c8c23733E5dF8fBEAd7B7Aaf8123d73",
    PrivateWrappedBTC:                  "0xeB93C4c75FB995dBf3E1F9eEEc3C51380d5Bf6f5",
    PrivateTetherUSD:                   "0x65fC0ad80ec16054B0ba76fa3B9687838aa01D65",
    PrivateBridgedUSDC:                 "0xe8696D72976Ce49dAD580D01F0DCA036fEA24A2c",
    PrivateWrappedADA:                  "0x907b8b6090e4bA994A02EEF51f6d7CCD64c657FD",
    PrivateCOTITreasuryGovernanceToken: "0x8fF1088BBCDd5b9a34f44534627C0dAc8D3ea3CE",

    // Bridges
    PrivacyBridgeCotiNative: "0x5fcbd9045e31275085Ef4F758cE5b07e4c0B6498",
    PrivacyBridgeWETH:       "0x842AAF5A0d74EeA3a76690C2A654de86c7C4E178",
    PrivacyBridgeWBTC:       "0xD7BaE202d6AAB8B239B3d9100db40E43D84f6b03",
    PrivacyBridgeUSDT:       "0x6998cf81Cc0B84D65c5e5e51dEF9Da61F3f8C8d7",
    PrivacyBridgeUSDCe:      "0x1570E6ECEB7652Da65a2E4C3a934404257A1eb7D",
    PrivacyBridgeWADA:       "0x7dE3C78BC9Fe32f55F0a7D1930bB98CcD8da84F0",
    PrivacyBridgegCoti:      "0xa87E78b753a8Ad8acfdF0eb16Ca8036c962BF904",
};

// Public token addresses (for bridge constructor args)
const PUBLIC_TOKENS = {
    WETH:   "0x8bca4e6bbE402DB4aD189A316137aD08206154FB",
    WBTC:   "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492",
    USDT:   "0x9e961430053cd5AbB3b060544cEcCec848693Cf0",
    USDC_E: "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C",
    WADA:   "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D",
    gCOTI:  "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C",
};

// ── Contract definitions with constructor arg types ─────────────────────────
const CONTRACTS = [
    // Private tokens — no constructor args
    { name: "PrivateCOTI",                        args: [] },
    { name: "PrivateWrappedEther",                args: [] },
    { name: "PrivateWrappedBTC",                  args: [] },
    { name: "PrivateTetherUSD",                   args: [] },
    { name: "PrivateBridgedUSDC",                 args: [] },
    { name: "PrivateWrappedADA",                  args: [] },
    { name: "PrivateCOTITreasuryGovernanceToken", args: [] },

    // Native bridge — constructor(address _privateCoti)
    {
        name: "PrivacyBridgeCotiNative",
        args: [{ type: "address", value: ADDRESSES.PrivateCOTI }],
    },

    // ERC20 bridges — constructor(address _token, address _privateToken)
    {
        name: "PrivacyBridgeWETH",
        args: [
            { type: "address", value: PUBLIC_TOKENS.WETH },
            { type: "address", value: ADDRESSES.PrivateWrappedEther },
        ],
    },
    {
        name: "PrivacyBridgeWBTC",
        args: [
            { type: "address", value: PUBLIC_TOKENS.WBTC },
            { type: "address", value: ADDRESSES.PrivateWrappedBTC },
        ],
    },
    {
        name: "PrivacyBridgeUSDT",
        args: [
            { type: "address", value: PUBLIC_TOKENS.USDT },
            { type: "address", value: ADDRESSES.PrivateTetherUSD },
        ],
    },
    {
        name: "PrivacyBridgeUSDCe",
        args: [
            { type: "address", value: PUBLIC_TOKENS.USDC_E },
            { type: "address", value: ADDRESSES.PrivateBridgedUSDC },
        ],
    },
    {
        name: "PrivacyBridgeWADA",
        args: [
            { type: "address", value: PUBLIC_TOKENS.WADA },
            { type: "address", value: ADDRESSES.PrivateWrappedADA },
        ],
    },
    {
        name: "PrivacyBridgegCoti",
        args: [
            { type: "address", value: PUBLIC_TOKENS.gCOTI },
            { type: "address", value: ADDRESSES.PrivateCOTITreasuryGovernanceToken },
        ],
    },
];

async function main() {
    const outputDir = path.resolve(__dirname, "../verify");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const abiCoder = new hre.ethers.AbiCoder();
    let generated = 0;

    for (const contract of CONTRACTS) {
        const address = ADDRESSES[contract.name];
        const shortAddr = address.slice(0, 6);

        process.stdout.write(`  ${contract.name} (${shortAddr}...)... `);

        try {
            const artifact = await hre.artifacts.readArtifact(contract.name);
            const buildInfo = await hre.artifacts.getBuildInfo(
                `${artifact.sourceName}:${contract.name}`
            );

            if (!buildInfo) {
                console.log("❌ build info not found");
                continue;
            }

            // Prepare Standard JSON Input
            const standardJson = JSON.parse(JSON.stringify(buildInfo.input));

            // Ensure Blockscout/Cotiscan compatibility
            if (!standardJson.settings.outputSelection["*"])
                standardJson.settings.outputSelection["*"] = {};
            if (!standardJson.settings.outputSelection["*"]["*"])
                standardJson.settings.outputSelection["*"]["*"] = ["*"];

            // Write Standard JSON
            const jsonFile = path.join(outputDir, `${contract.name}_${shortAddr}_StandardInput.json`);
            fs.writeFileSync(jsonFile, JSON.stringify(standardJson, null, 2));

            // Write constructor args if any
            if (contract.args.length > 0) {
                const types = contract.args.map((a) => a.type);
                const values = contract.args.map((a) => a.value);
                const encoded = abiCoder.encode(types, values).slice(2); // strip 0x

                const argsFile = path.join(outputDir, `${contract.name}_${shortAddr}_ConstructorArgs.txt`);
                fs.writeFileSync(argsFile, encoded);
            }

            console.log("✅");
            generated++;
        } catch (err) {
            console.log(`❌ ${err.message}`);
        }
    }

    console.log(`\n========================================================`);
    console.log(`  Generated ${generated}/${CONTRACTS.length} verification files`);
    console.log(`  Output: ${outputDir}/`);
    console.log(`========================================================`);
    console.log(`\nTo verify on Cotiscan:`);
    console.log(`  1. Go to https://testnet.cotiscan.io/address/<ADDRESS>?tab=contract`);
    console.log(`  2. Select "Solidity (Standard-Json-Input)"`);
    console.log(`  3. Upload the *_StandardInput.json file`);
    console.log(`  4. Paste contents of *_ConstructorArgs.txt (if any) into "Constructor Arguments"`);
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
