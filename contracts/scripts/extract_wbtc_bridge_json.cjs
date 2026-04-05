const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
    const contractName = "PrivacyBridgeWBTC";

    // 1. Get the fully qualified name and build info
    const artifact = await hre.artifacts.readArtifact(contractName);
    const sourceName = artifact.sourceName;
    const fullyQualifiedName = `${sourceName}:${contractName}`;

    console.log(`Searching build info for: ${fullyQualifiedName}`);

    const buildInfo = await hre.artifacts.getBuildInfo(fullyQualifiedName);

    if (!buildInfo) {
        console.error("❌ Could not find build info. Run `npx hardhat clean && npx hardhat compile` first.");
        process.exit(1);
    }

    // 2. We need the original standard JSON input
    const stdInput = buildInfo.input;

    // 3. Blockscout sometimes requires the exact contract to be specified
    //    in the settings.compilationTarget. We will clone the input and add it.
    const patchedInput = JSON.parse(JSON.stringify(stdInput));
    patchedInput.settings = patchedInput.settings || {};
    patchedInput.settings.compilationTarget = {
        [sourceName]: contractName
    };

    // 4. Save to a file in the root
    const outPath = path.join(__dirname, "..", "..", `PrivacyBridgeWBTC_ExactInput.json`);
    fs.writeFileSync(outPath, JSON.stringify(patchedInput, null, 2));

    console.log(`\n✅ EXACT Standard JSON Input saved to: ${outPath}`);
    console.log("\nTo verify manually on CotiScan:");
    console.log(`1. Compiler Type: Solidity (Standard-Json-Input)`);
    console.log(`2. Compiler Version: v${buildInfo.solcLongVersion}`);
    console.log(`3. Upload the PrivacyBridgeWBTC_ExactInput.json file`);
}

main().catch(console.error);
