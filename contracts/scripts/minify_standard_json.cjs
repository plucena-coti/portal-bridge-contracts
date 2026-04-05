
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../StandardInput.json');
const outputFile = path.join(__dirname, '../StandardInput_Minimal.json');

try {
    const rawData = fs.readFileSync(inputFile);
    const buildInfo = JSON.parse(rawData);

    // The Standard JSON Input verification requires the 'input' object
    // which contains language, sources, and settings.
    // The build-info file contains 'id', '_format', 'solcVersion', 'input', and 'output'.
    // 'output' is huge and not needed for "Standard JSON Input" uploading usually,
    // as the explorer compiles the 'input' to verify it matches.

    if (!buildInfo.input) {
        console.error("Error: Could not find 'input' property in the source JSON.");
        process.exit(1);
    }

    const standardInput = buildInfo.input;

    fs.writeFileSync(outputFile, JSON.stringify(standardInput, null, 2));

    const originalSize = fs.statSync(inputFile).size / (1024 * 1024);
    const newSize = fs.statSync(outputFile).size / (1024 * 1024);

    console.log(`Original Size: ${originalSize.toFixed(2)} MB`);
    console.log(`New Size: ${newSize.toFixed(2)} MB`);
    console.log(`Minified file saved to: ${outputFile}`);

} catch (err) {
    console.error("Error processing JSON:", err);
}
