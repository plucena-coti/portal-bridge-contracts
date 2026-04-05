const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
    const contractName = "PrivacyBridgeCotiNative";

    const artifact = await hre.artifacts.readArtifact(contractName);
    const buildInfo = await hre.artifacts.getBuildInfo(`${artifact.sourceName}:${contractName}`);

    if (!buildInfo) {
        throw new Error(`Build info not found for ${contractName}`);
    }

    const outputDir = path.join(__dirname, '../verify');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${contractName}_standard_json.json`);

    // Blockscout expectations
    if (!buildInfo.input.settings.outputSelection['*']) {
        buildInfo.input.settings.outputSelection['*'] = {};
    }
    if (!buildInfo.input.settings.outputSelection['*']['*']) {
        buildInfo.input.settings.outputSelection['*']['*'] = ['*'];
    }

    fs.writeFileSync(filePath, JSON.stringify(buildInfo.input, null, 2));

    console.log(`\n✅ Standard JSON Input for ${contractName} generated at:`);
    console.log(`   ${filePath}`);
    console.log(`\nYou can now upload this file to CotiScan for manual verification.`);
}

main().catch(console.error);
