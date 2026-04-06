const fs = require('fs');
const path = require('path');
const buildInfoDir = 'artifacts/build-info';
const files = fs.readdirSync(buildInfoDir).filter(f => f.endsWith('.json'));

let targetInput = null;
let foundFile = '';

for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(buildInfoDir, file), 'utf8'));

    // Look for our specific contract
    const contracts = data.output?.contracts;
    if (contracts && contracts['contracts/erc20-mocks/USDT.sol'] && contracts['contracts/erc20-mocks/USDT.sol']['USDT']) {
        // We found a payload that compiled USDT.
        // Let's ensure it has viaIR explicitly set to false if needed, or just grab the input
        if (data.input && data.input.settings) {
            targetInput = data.input;
            foundFile = file;
            break;
        }
    }
}

if (targetInput) {
    // Write just the Standard JSON Input to a file
    fs.writeFileSync('USDT_ExactInput.json', JSON.stringify(targetInput, null, 2));
    console.log(`✅ Extracted Standard JSON Input from: ${foundFile}`);
    console.log(`Saved as: USDT_ExactInput.json`);
    console.log(`Settings:`, JSON.stringify(targetInput.settings, null, 2));
    console.log(`Compiler version used: ${JSON.parse(fs.readFileSync(path.join(buildInfoDir, foundFile), 'utf8')).solcVersion}`);
} else {
    console.log('❌ Could not find WBTC in any build-info JSON.');
}
