const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;
const WADA_ADDRESS = "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D";
const PRIVATE_WADA_ADDRESS = "0x66c85092DaF2531E920B1f36560535E3D19985a0";

async function waitWithTimeout(promise, timeoutSeconds, stepName) {
    console.log(`[${stepName}] Waiting up to ${timeoutSeconds} seconds...`);
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            console.error(`[${stepName}] ❌ TIMEOUT! Forcefully rejecting.`);
            reject(new Error(`[${stepName}] Timed out after ${timeoutSeconds} seconds`));
        }, timeoutSeconds * 1000);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutHandle);
        console.log(`[${stepName}] ✅ Completed!`);
        return result;
    } catch (error) {
        clearTimeout(timeoutHandle);
        console.error(`[${stepName}] 💥 Error or Timeout:`, error.message);
        throw error;
    }
}

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log(`Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);

    // 1. Deploy PrivacyBridgeWADA
    console.log("\n1. Deploying PrivacyBridgeWADA...");
    const PrivacyBridgeWADA = await ethers.getContractFactory("PrivacyBridgeWADA");

    // Explicitly add gas limit to avoid estimation errors on testnet
    const wadaBridge = await PrivacyBridgeWADA.deploy(WADA_ADDRESS, PRIVATE_WADA_ADDRESS, { gasLimit: 12000000 });

    await waitWithTimeout(wadaBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWADA Deployment");

    const bridgeAddr = await wadaBridge.getAddress();
    console.log(`   -> PrivacyBridgeWADA deployed to: ${bridgeAddr}`);

    // 2. Grant MINTER_ROLE to PrivacyBridgeWADA on PrivateWADA
    console.log("\n2. Granting MINTER_ROLE on PrivateWADA...");
    const PrivateWADA = await ethers.getContractFactory("PrivateWrappedADA");
    const privateWada = PrivateWADA.attach(PRIVATE_WADA_ADDRESS);

    // Using keccak256 for role hash
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    // Send grantRole tx
    const grantTx = await privateWada.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 5000000 });
    console.log(`   -> Grant TX sent: ${grantTx.hash}`);

    await waitWithTimeout(grantTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log("   -> Permission granted successfully!");

    console.log("\n===========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("===========================================");
    console.log(`PrivacyBridgeWADA: ${bridgeAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
