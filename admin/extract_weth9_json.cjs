const fs = require('fs');
const path = require('path');
const buildInfoDir = 'artifacts/build-info';
const files = fs.readdirSync(buildInfoDir).filter(f => f.endsWith('.json'));

let targetInput = null;
let foundFile = '';

for (const file of files) {
    const data = fs.readFileSync(path.join(buildInfoDir, file), 'utf8');
    if (data.includes('"WETH9"')) {
        const parsed = JSON.parse(data);
        for (const sourceKey in (parsed.output.contracts || {})) {
            if (parsed.output.contracts[sourceKey]['WETH9']) {
                targetInput = parsed.input;
                foundFile = file;

                // Format for Blockscout
                if (!targetInput.settings.outputSelection['*']) targetInput.settings.outputSelection['*'] = {};
                if (!targetInput.settings.outputSelection['*']['*']) targetInput.settings.outputSelection['*']['*'] = ['*'];

                // To ensure the verifier only picks up WETH9
                targetInput.settings.compilationTarget = {
                    [sourceKey]: 'WETH9'
                };
                break;
            }
        }
    }
    if (targetInput) break;
}

if (targetInput) {
    fs.writeFileSync('WETH9_ExactInput.json', JSON.stringify(targetInput, null, 2));
    console.log('Saved exact JSON to WETH9_ExactInput.json');
    console.log('Optimization:', targetInput.settings.optimizer.enabled, targetInput.settings.optimizer.runs);
    console.log('viaIR:', targetInput.settings.viaIR);
} else {
    console.log('Contract not found in build info.');
}
