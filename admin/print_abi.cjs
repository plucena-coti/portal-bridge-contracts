
const fs = require('fs');

const bridgePath = 'artifacts/contracts/privateERC20/privacyBridge/PrivacyBridgeCotiNative.sol/PrivacyBridgeCotiNative.json';
const tokenPath = 'artifacts/contracts/privateERC20/tokens/PrivateCoti.sol/PrivateCoti.json';

const bridgeArtifact = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
const tokenArtifact = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

console.log("BRIDGE_ABI=" + JSON.stringify(bridgeArtifact.abi));
console.log("TOKEN_ABI=" + JSON.stringify(tokenArtifact.abi));
