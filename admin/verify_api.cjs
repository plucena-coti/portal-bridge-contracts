const fs = require('fs');
const https = require('https');
const path = require('path');
const readline = require('readline');
const hre = require('hardhat');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

async function findBuildInfoForContract(contractName) {
    const buildInfoDir = path.join(__dirname, '../../artifacts/build-info');
    if (!fs.existsSync(buildInfoDir)) {
        throw new Error(`Build info directory not found at ${buildInfoDir}`);
    }

    const files = fs.readdirSync(buildInfoDir).filter(f => f.endsWith('.json'));
    let matchedFile = null;

    for (const file of files) {
        const filePath = path.join(buildInfoDir, file);
        const data = fs.readFileSync(filePath, 'utf8');

        // Quick check to avoid parsing huge JSONs if the contract name isn't there
        if (data.includes(`"${contractName}"`)) {
            const parsed = JSON.parse(data);

            // Find exactly which sol file contains this contract
            const sourceKeys = Object.keys(parsed.output.contracts || {});

            for (const sourceKey of sourceKeys) {
                if (parsed.output.contracts[sourceKey][contractName]) {
                    return {
                        buildInfo: parsed,
                        sourcePath: sourceKey,
                        filePath
                    };
                }
            }
        }
    }

    return null;
}

async function verifyContract(address, contractName, compilerVersion, optimizationRuns = 200) {
    console.log(`\n🔍 Searching artifacts for contract: ${contractName}...`);

    const result = await findBuildInfoForContract(contractName);

    if (!result) {
        console.error(`❌ Could not find build info for contract ${contractName}`);
        console.log("Make sure you run `npx hardhat clean` and `npx hardhat compile` first.");
        return;
    }

    console.log(`✅ Found build info with exact bytecode matches.`);

    // Extract exact input mapping from hardhat cache
    const inputJson = result.buildInfo.input;

    // IMPORTANT: Blockscout verifier strictly expects standard outputSelection for standard-json
    if (!inputJson.settings.outputSelection['*']) {
        inputJson.settings.outputSelection['*'] = {};
    }
    if (!inputJson.settings.outputSelection['*']['*']) {
        inputJson.settings.outputSelection['*']['*'] = ['*'];
    }

    const fullyQualifiedName = `${result.sourcePath}:${contractName}`;

    console.log(`\n📡 Submitting exact JSON Standard Input to CotiScan Blockscout API...`);
    console.log(`   Address:         ${address}`);
    console.log(`   Fully Qualified: ${fullyQualifiedName}`);
    console.log(`   Compiler:        ${compilerVersion}`);
    console.log(`   Optimization:    ${inputJson.settings.optimizer.enabled ? 'Yes' : 'No'} (${inputJson.settings.optimizer.runs} runs)`);
    console.log(`   viaIR:           ${inputJson.settings.viaIR ? 'Yes' : 'No'}`);

    if (inputJson.settings.viaIR) {
        console.warn(`\n⚠️  WARNING: This contract was compiled with viaIR: true.`);
        console.warn(`   CotiScan's blockscout instance historically fails to verify viaIR contracts.`);
        console.warn(`   If verification fails, you must remove viaIR from hardhat.config, recompile, and redeploy.\n`);
    }

    const postData = new URLSearchParams({
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: address,
        sourceCode: JSON.stringify(inputJson),
        codeformat: 'solidity-standard-json-input',
        contractname: fullyQualifiedName,
        compilerversion: compilerVersion,
        optimizationUsed: inputJson.settings.optimizer.enabled ? '1' : '0',
        runs: inputJson.settings.optimizer.runs.toString()
    }).toString();

    const options = {
        hostname: 'testnet.cotiscan.io',
        path: '/api',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.status === "1" || parsed.message.includes("already verified") || parsed.message.includes("started")) {
                        console.log(`\n🎉 Success! API Response: ${parsed.message}`);
                        console.log(`   Check out: https://testnet.cotiscan.io/address/${address}`);
                        resolve(parsed);
                    } else {
                        console.error(`\n❌ Failed. API Response:`, parsed);
                        resolve(parsed);
                    }
                } catch (e) {
                    console.log(`\nRaw Response:`, data);
                    resolve(data);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`\n❌ Request Error: ${e.message}`);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

async function main() {
    console.log("=========================================");
    console.log("  🚀 CotiScan Universal API Verifier");
    console.log("=========================================\n");
    console.log("This script extracts exactly what Hardhat used to compile the contract");
    console.log("and pushes it directly to the Blockscout backend API, bypassing UI issues.\n");

    const address = process.argv[2] || await askQuestion("Enter contract Address (0x...): ");
    let contractName = process.argv[3];

    if (!contractName) {
        contractName = await askQuestion("Enter exact Contract Name (e.g. WETH9): ");
    }

    let compilerVersion = process.argv[4];
    if (!compilerVersion) {
        compilerVersion = await askQuestion("Enter compiler version (e.g. v0.8.20+commit.a1b79de6 or v0.8.19+commit.7dd6d404): ");
    }

    if (!address || !contractName || !compilerVersion) {
        console.error("Missing required fields. Exiting.");
        process.exit(1);
    }

    await verifyContract(address.trim(), contractName.trim(), compilerVersion.trim());
    rl.close();
}

main().catch(console.error);
