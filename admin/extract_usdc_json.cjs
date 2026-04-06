const fs = require('fs');

const artifactsPath = './artifacts/build-info/';
const files = fs.readdirSync(artifactsPath);

if (files.length === 0) {
    console.log("No build info files found");
    process.exit(1);
}

// Get standard JSON from the most recent build info
const buildInfoContent = fs.readFileSync(artifactsPath + files[files.length - 1], 'utf8');
const buildInfo = JSON.parse(buildInfoContent);

fs.writeFileSync('PrivacyBridgeUSDCe_standard_json.json', JSON.stringify(buildInfo.input, null, 2));
console.log('Successfully wrote PrivacyBridgeUSDCe_standard_json.json');