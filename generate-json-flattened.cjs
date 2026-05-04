const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const contracts = [
  'coti-contracts/contracts/privacyBridge/PrivacyBridge.sol',
  'coti-contracts/contracts/privacyBridge/PrivacyBridgeUSDCe.sol',
  'coti-contracts/contracts/privacyBridge/PrivacyBridgeUSDT.sol',
  'coti-contracts/contracts/privacyBridge/PrivacyBridgeERC20.sol',
  'coti-contracts/contracts/privacyBridge/PrivacyBridgegCoti.sol',
  'coti-contracts/contracts/privacyBridge/PrivacyBridgeWBTC.sol',
  'coti-contracts/contracts/privacyBridge/PrivacyBridgeWADA.sol',
  'coti-contracts/contracts/privacyBridge/PrivacyBridgeCotiNative.sol',
  'coti-contracts/contracts/privacyBridge/PrivacyBridgeWETH.sol'
];

if (!fs.existsSync('flattened')) {
  fs.mkdirSync('flattened');
}

const allResult = {};

for (const contract of contracts) {
  const name = path.basename(contract, '.sol');
  console.log(`Flattening ${name}...`);
  try {
    let flattened = execSync(`npx hardhat flatten ${contract}`, { 
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, DOTENV_KEY: '' } // Try to disable dotenv output, or filter it out
    }).toString();
    
    // Remove the leading "◇ injecting env..." if present
    flattened = flattened.replace(/^◇ injecting env[^\n]*\n+/g, '');
    
    // Standard json format often expected by explorers:
    const outputFormat = {
      language: "Solidity",
      sources: {
        [contract]: {
          content: flattened
        }
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    };
    
    allResult[contract] = flattened;
    // Save as standard solc input JSON
    fs.writeFileSync(`flattened/${name}.json`, JSON.stringify(outputFormat, null, 2));
  } catch (e) {
    console.error(`Failed to flatten ${contract}`);
  }
}

fs.writeFileSync('flattened/all-bridge-contracts.json', JSON.stringify({ contracts: allResult }, null, 2));
console.log('Saved properly formatted standard JSON files to the `flattened/` directory.');
