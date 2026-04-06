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

    // 0. Deploy Public Mock
    console.log("\n0. Deploying gCOTI Mock...");
    const gCOTI = await ethers.getContractFactory("gCOTI");
    const gcoti = await gCOTI.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(gcoti.waitForDeployment(), TIMEOUT_SECONDS, "gCOTI Mock Deployment");
    const gcotiAddr = await gcoti.getAddress();
    console.log(`   -> gCOTI (Mock) deployed to: ${gcotiAddr}`);

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    // --- gCOTI Deployment ---
    console.log("\n=========================================");
    console.log("   🚀 STARTING gCOTI REDEPLOYMENT");
    console.log("=========================================");

    // 1. Deploy PrivategCoti
    console.log("\n1. Deploying PrivategCoti (6 Decimals)...");
    const PrivategCoti = await ethers.getContractFactory("PrivateCOTITreasuryGovernanceToken");
    const privategCoti = await PrivategCoti.deploy({ gasLimit: 12000000 });
    await waitWithTimeout(privategCoti.waitForDeployment(), TIMEOUT_SECONDS, "PrivategCoti Deployment");
    const pGCotiAddr = await privategCoti.getAddress();
    console.log(`   -> PrivategCoti deployed to: ${pGCotiAddr}`);

    // 2. Deploy PrivacyBridgegCoti
    console.log("\n2. Deploying PrivacyBridgegCoti...");
    const PrivacyBridgegCoti = await ethers.getContractFactory("PrivacyBridgegCoti");
    // Scaling Factor is 1e12 (18 -> 6 decimals) as defined in the contract
    const gcotiBridge = await PrivacyBridgegCoti.deploy(gcotiAddr, pGCotiAddr, { gasLimit: 12000000 });
    await waitWithTimeout(gcotiBridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgegCoti Deployment");
    const gcotiBridgeAddr = await gcotiBridge.getAddress();
    console.log(`   -> PrivacyBridgegCoti deployed to: ${gcotiBridgeAddr}`);

    // 3. Grant MINTER_ROLE for gCOTI
    console.log("\n3. Granting MINTER_ROLE on PrivategCoti...");
    const gcotiRoleTx = await privategCoti.grantRole(MINTER_ROLE, gcotiBridgeAddr, { gasLimit: 5000000 });
    await waitWithTimeout(gcotiRoleTx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE (gCOTI)");
    console.log(`   -> Role granted to ${gcotiBridgeAddr}`);


    console.log("\n=========================================");
    console.log("   ✅ DEPLOYMENT COMPLETE");
    console.log("=========================================");
    console.log("New Addresses:");
    console.log(`Private gCOTI:         ${pGCotiAddr}`);
    console.log(`gCOTI Bridge:          ${gcotiBridgeAddr}`);
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
