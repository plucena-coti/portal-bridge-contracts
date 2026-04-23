const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../");
const OUT_DIR = path.resolve(__dirname, "../flattened");

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CONTRACTS = [
    { sol: "contracts/privacyBridge/PrivacyBridgeCotiNative.sol", name: "PrivacyBridgeCotiNative" },
    { sol: "contracts/privacyBridge/PrivacyBridgeWETH.sol", name: "PrivacyBridgeWETH" },
    { sol: "contracts/privacyBridge/PrivacyBridgeWBTC.sol", name: "PrivacyBridgeWBTC" },
    { sol: "contracts/privacyBridge/PrivacyBridgeUSDT.sol", name: "PrivacyBridgeUSDT" },
    { sol: "contracts/privacyBridge/PrivacyBridgeUSDCe.sol", name: "PrivacyBridgeUSDCe" },
    { sol: "contracts/privacyBridge/PrivacyBridgeWADA.sol", name: "PrivacyBridgeWADA" },
    { sol: "contracts/privacyBridge/PrivacyBridgegCoti.sol", name: "PrivacyBridgegCoti" },
    // Private Tokens
    { sol: "contracts/token/PrivateERC20/tokens/PrivateBridgedUSDC.sol", name: "PrivateBridgedUSDC" },
    { sol: "contracts/token/PrivateERC20/tokens/PrivateCOTI.sol", name: "PrivateCOTI" },
    { sol: "contracts/token/PrivateERC20/tokens/PrivateCOTITreasuryGovernanceToken.sol", name: "PrivateCOTITreasuryGovernanceToken" },
    { sol: "contracts/token/PrivateERC20/tokens/PrivateTetherUSD.sol", name: "PrivateTetherUSD" },
    { sol: "contracts/token/PrivateERC20/tokens/PrivateWrappedADA.sol", name: "PrivateWrappedADA" },
    { sol: "contracts/token/PrivateERC20/tokens/PrivateWrappedBTC.sol", name: "PrivateWrappedBTC" },
    { sol: "contracts/token/PrivateERC20/tokens/PrivateWrappedEther.sol", name: "PrivateWrappedEther" },
];

function flattenAndClean(solPath) {
    const raw = execSync(
        `node ./node_modules/.bin/hardhat flatten ${solPath}`,
        {
            cwd: path.resolve(__dirname, "../coti-contracts"),
            encoding: "utf8",
            maxBuffer: 50 * 1024 * 1024,
            stdio: ["inherit", "pipe", "inherit"],
        }
    );

    const lines = raw.split("\n").filter(line => !line.startsWith("[dotenv"));

    let spdxSeen = false;
    const deduped = lines.filter(line => {
        if (line.trim().startsWith("// SPDX-License-Identifier:")) {
            if (spdxSeen) return false;
            spdxSeen = true;
        }
        return true;
    });

    let pragmaSeen = false;
    const final = deduped.filter(line => {
        if (line.trim().startsWith("pragma solidity")) {
            if (pragmaSeen) return false;
            pragmaSeen = true;
        }
        return true;
    });

    return final.join("\n");
}

async function generateJson(contractName) {
    const artifact = await hre.artifacts.readArtifact(contractName);
    const sourceName = artifact.sourceName;
    const fullyQualifiedName = `${sourceName}:${contractName}`;

    const buildInfo = await hre.artifacts.getBuildInfo(fullyQualifiedName);

    if (!buildInfo) {
        throw new Error(`Build info not found for ${contractName}. Run npx hardhat compile first.`);
    }

    const patchedInput = JSON.parse(JSON.stringify(buildInfo.input));
    patchedInput.settings = patchedInput.settings || {};
    patchedInput.settings.compilationTarget = {
        [sourceName]: contractName
    };

    return patchedInput;
}

async function main() {
    console.log("Compiling contracts first to ensure build-info is up-to-date...");
    execSync("npx hardhat compile", { cwd: ROOT, stdio: "inherit" });

    let allOk = true;

    for (const { sol, name } of CONTRACTS) {
        console.log(`\nProcessing ${name}...`);
        
        try {
            // 1. Flatten
            process.stdout.write(`  Flattening... `);
            const flat = flattenAndClean(sol);
            const flatOutPath = path.join(OUT_DIR, `${name}_flat.sol`);
            fs.writeFileSync(flatOutPath, flat, "utf8");
            console.log(`✅ ${(fs.statSync(flatOutPath).size / 1024).toFixed(1)} KB`);

            // 2. Generate Standard JSON
            process.stdout.write(`  Generating JSON... `);
            const patchedInput = await generateJson(name);
            const jsonOutPath = path.join(OUT_DIR, `${name}_standard_input.json`);
            fs.writeFileSync(jsonOutPath, JSON.stringify(patchedInput, null, 2), "utf8");
            console.log(`✅ ${(fs.statSync(jsonOutPath).size / 1024).toFixed(1)} KB`);

        } catch (e) {
            console.error(`❌ FAILED: ${e.message}`);
            allOk = false;
        }
    }

    if (allOk) {
        console.log("\n✅ All bridge contracts flattened and JSONs generated successfully.");
        console.log(`Output directory: ${OUT_DIR}`);
    } else {
        console.error("\n⚠️  Some contracts failed to process.");
        process.exitCode = 1;
    }
}

main().catch(e => {
    console.error(e);
    process.exitCode = 1;
});