const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;

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
    const networkName = network.name === 'unknown' ? 'cotiTestnet' : network.name;

    console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);
    console.log(`Step Timeout: ${TIMEOUT_SECONDS} seconds`);

    // 0. Deploy Public WADA (Mock - Decimals 6)
    console.log("\n0. Deploying WADA (Public Mock)...");
    const WADA = await ethers.getContractFactory("WADA");
    const wada = await WADA.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(wada.waitForDeployment(), TIMEOUT_SECONDS, "WADA Deployment");
    const wadaAddr = await wada.getAddress();
    console.log(`   -> WADA (Mock) deployed to: ${wadaAddr}`);

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    // --- WADA Deployment ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING WADA REDEPLOYMENT");
    console.log("=========================================");

    // 1. Deploy PrivateWADA
    console.log("\n1. Deploying PrivateWADA (6 Decimals)...");
    const PrivateWADA = await ethers.getContractFactory("PrivateWrappedADA");
    const privateWada = await PrivateWADA.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privateWada.waitForDeployment(), TIMEOUT_SECONDS, "PrivateWADA Deployment");
    const pWadaAddr = await privateWada.getAddress();
    console.log(`   -> PrivateWADA deployed to: ${pWadaAddr}`);

    // 2. Deploy PrivacyBridgeWADA
    console.log("\n2. Deploying PrivacyBridgeWADA...");
    const PrivacyBridgeWADA = await ethers.getContractFactory("PrivacyBridgeWADA");
    // Scaling Factor is 1e12 (18 -> 6 decimals) as defined in the contract
    const wadaBridge = await PrivacyBridgeWADA.deploy(wadaAddr, pWadaAddr, { gasLimit: 12000000 });
    await waitWithTimeout(wadaBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeWADA Deployment");
    const wadaBridgeAddr = await wadaBridge.getAddress();
    console.log(`   -> PrivacyBridgeWADA deployed to: ${wadaBridgeAddr}`);

    // 3. Grant MINTER_ROLE for WADA
    console.log("\n3. Granting MINTER_ROLE on PrivateWADA...");
    const wadaRoleTx = await privateWada.grantRole(MINTER_ROLE, wadaBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(wadaRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE (WADA)");
    console.log(`   -> Role granted to ${wadaBridgeAddr}`);


    console.log("\n=========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log("New Addresses:");
    console.log(`Private WADA:          ${pWadaAddr}`);
    console.log(`WADA Bridge:           ${wadaBridgeAddr}`);
}

main()
    .then(() => {
        console.log("Script finished successfully. Calling process.exit(0)...");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment Failed or Timed Out:");
        console.error(error);
        process.exit(1);
    });
