const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
    const contractName = "PrivacyBridgeCotiNative";
    // The newly redeployed address
    const deployedAddress = "0xF86a7A42b46e3FbB28890A10cE290c08310b6203";
    // The PrivateCoti it was linked to
    const privateCotiAddress = "0x03eeA59b1F0Dfeaece75531b27684DD882f79759";

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

    const filePath = path.join(outputDir, `PrivacyBridgeCotiNative_0xF86a_Standard.json`);
    fs.writeFileSync(filePath, JSON.stringify(standardJson, null, 2));

    console.log(`\n✅ Standard JSON for PrivacyBridgeCotiNative (0xF86a...) generated.`);
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
