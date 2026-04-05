const fs = require('fs');
const path = require('path');

// Read Hardhat build info to get the Standard JSON input
const buildInfoDir = path.join(__dirname, '../artifacts/build-info');
const buildInfoFiles = fs.readdirSync(buildInfoDir);

if (buildInfoFiles.length === 0) {
    console.error('No build info found. Please compile contracts first with: npx hardhat compile');
    process.exit(1);
}

// Get the most recent build info file
const latestBuildInfo = buildInfoFiles.sort().reverse()[0];
const buildInfoPath = path.join(buildInfoDir, latestBuildInfo);
const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));

// Extract the compiler input
const standardJson = buildInfo.input;

// Add metadata about settings
const output = {
    language: standardJson.language,
    sources: standardJson.sources,
    settings: standardJson.settings
};

// Write to StandardInput_Minimal.json
const outputPath = path.join(__dirname, '../StandardInput_Minimal.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ Standard JSON input generated successfully!');
console.log(`   File: ${outputPath}`);
console.log(`   Compiler: ${buildInfo.solcVersion}`);
console.log(`   Sources: ${Object.keys(standardJson.sources).length} files`);
