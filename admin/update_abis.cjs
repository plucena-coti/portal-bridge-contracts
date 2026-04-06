const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../../artifacts/contracts');
const OUTPUT_FILE = path.join(__dirname, '../../src/contracts/abis.json');

// Map required ABIs to their artifact files
const TOKEN_SOURCE = 'contracts/privateERC20/tokens/PrivateCoti.sol/PrivateCoti.json';
const BRIDGE_SOURCE = 'contracts/privateERC20/privacyBridge/PrivacyBridgeCotiNative.sol/PrivacyBridgeCotiNative.json';

function getAbi(sourcePath) {
    const fullPath = path.join(ARTIFACTS_DIR, '../../', 'artifacts', sourcePath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Artifact not found at ${fullPath}`);
    }
    const artifact = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return artifact.abi;
}

try {
    console.log("Reading artifacts...");
    const tokenAbi = getAbi(TOKEN_SOURCE);
    const bridgeAbi = getAbi(BRIDGE_SOURCE);

    const outputContent = `BRIDGE_ABI=${JSON.stringify(bridgeAbi)}
TOKEN_ABI=${JSON.stringify(tokenAbi)}`;

    fs.writeFileSync(OUTPUT_FILE, outputContent);
    console.log(`✅ Updated ${OUTPUT_FILE}`);
} catch (error) {
    console.error("Error updating ABIs:", error);
    process.exit(1);
}
