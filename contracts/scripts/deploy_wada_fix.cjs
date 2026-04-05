const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 300;

async function waitWithTimeout(promise, timeoutSeconds, stepName) {
    console.log(`[${stepName}] Waiting up to ${timeoutSeconds} seconds...`);
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
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
        throw error;
    }
}

async function main() {
    // Current Public WADA (Testnet)
    const WADA_ADDRESS = "0x2C7A110DA35944C4DDA4EDA440C57e73B5DEcaa5"; // From tokens.json

    console.log("===========================================");
    console.log("   🚀 DEPLOYING Fixed PrivateWADA & Bridge");
    console.log("===========================================");
    console.log(`Using Public WADA: ${WADA_ADDRESS}`);

    // 1. Deploy PrivateWADA
    console.log("\n1. Deploying PrivateWADA...");
    const PrivateWADA = await ethers.getContractFactory("PrivateWrappedADA");
    const privateWada = await PrivateWADA.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateWada.waitForDeployment(), TIMEOUT_SECONDS, "PrivateWADA Deployment");
    const privateWadaAddr = await privateWada.getAddress();
    console.log(`   -> PrivateWADA deployed to: ${privateWadaAddr}`);

    // 2. Deploy PrivacyBridgeWADA
    console.log("\n2. Deploying PrivacyBridgeWADA...");
    const PrivacyBridgeWADA = await ethers.getContractFactory("PrivacyBridgeWADA");
    const wadaBridge = await PrivacyBridgeWADA.deploy(WADA_ADDRESS, privateWadaAddr, { gasLimit: 12000000 });
    await waitWithTimeout(wadaBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWADA Deployment");
    const wadaBridgeAddr = await wadaBridge.getAddress();
    console.log(`   -> PrivacyBridgeWADA deployed to: ${wadaBridgeAddr}`);

    // 3. Grant MINTER_ROLE on PrivateWADA to the new Bridge
    console.log("\n3. Granting MINTER_ROLE on PrivateWADA to new bridge...");
    const MINTER_ROLE = ethers.id("MINTER_ROLE"); // keccak256("MINTER_ROLE")
    // Note: privateWada contract instance already connected to deployer
    const roleTx = await privateWada.grantRole(MINTER_ROLE, wadaBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(roleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");
    console.log(`   -> Role granted to ${wadaBridgeAddr}`);

    console.log("\n===========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("===========================================");
    console.log(`PrivateWADA:       ${privateWadaAddr}`);
    console.log(`PrivacyBridgeWADA: ${wadaBridgeAddr}`);
    console.log("\n>>> UPDATE `src/config/tokens.json` (Testnet) with these new addresses! <<<");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
