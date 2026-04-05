const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
    const contractName = "PrivacyBridgeCotiNative";
    // Address from deployment.log
    const deployedAddress = "0xD00428ef13910598cC6c426EAB18167c02133305";
    // PrivateCoti from deployment.log
    const privateCotiAddress = "0x201A6079161Ba865C4D34Ea72A4F054a64F7424c";

    const artifact = await hre.artifacts.readArtifact(contractName);
    const buildInfo = await hre.artifacts.getBuildInfo(`${artifact.sourceName}:${contractName}`);

    if (!buildInfo) {
        throw new Error(`Build info not found for ${contractName}`);
    }

    const outputDir = path.join(__dirname, '../verify');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Prepare standard JSON
    const standardJson = JSON.parse(JSON.stringify(buildInfo.input));

    // Ensure Blockscout compatibility
    if (!standardJson.settings.outputSelection['*']) {
        standardJson.settings.outputSelection['*'] = {};
    }
    if (!standardJson.settings.outputSelection['*']['*']) {
        standardJson.settings.outputSelection['*']['*'] = ['*'];
    }

    const filePath = path.join(outputDir, `PrivacyBridgeCotiNative_0xD004_Standard.json`);
    fs.writeFileSync(filePath, JSON.stringify(standardJson, null, 2));

    console.log(`\n✅ Standard JSON for PrivacyBridgeCotiNative (0xD004...) generated.`);
    console.log(`   Path: ${filePath}`);
    console.log(`\n🚀 CONSTRUCTOR ARGUMENTS (ABI-encoded):`);

    // Encode constructor arguments
    const abiCoder = new hre.ethers.AbiCoder();
    const encodedArgs = abiCoder.encode(["address"], [privateCotiAddress]);
    console.log(`   ${encodedArgs.slice(2)}`); // Remove 0x for Blockscout UI

    console.log(`\n1. Go to https://testnet.cotiscan.io/address/${deployedAddress}?tab=contract`);
    console.log(`2. Select "Solidity (Standard-Json-Input)"`);
    console.log(`3. Upload the JSON file.`);
    console.log(`4. Paste the ABI-encoded constructor arguments above into the "Constructor Arguments" field.`);
}

main().catch(console.error);
