const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;
const RECIPIENT = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
// 5000 tokens with 18 decimals
const MINT_AMOUNT = ethers.parseUnits("5000", 18);

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

    // 1. Deploy gCOTI
    console.log("\n1. Deploying gCOTI...");
    const gCOTI = await ethers.getContractFactory("gCOTI");
    const token = await gCOTI.deploy({ gasLimit: 5000000 });
    await waitWithTimeout(token.waitForDeployment(), TIMEOUT_SECONDS, "gCOTI Deployment");
    const tokenAddr = await token.getAddress();
    console.log(`   -> gCOTI deployed to: ${tokenAddr}`);

    // 2. Mint Tokens
    console.log(`\n2. Minting 5000 gCOTI to ${RECIPIENT}...`);
    const tx = await token.mint(RECIPIENT, MINT_AMOUNT, { gasLimit: 5000000 });
    console.log(`   Waiting for transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Successfully minted 5000 gCOTI to ${RECIPIENT}`);

    console.log("\n=========================================");
    console.log("   ✅ gCOTI DEPLOYMENT & MINTING COMPLETE");
    console.log("=========================================");
    console.log(`gCOTI Address: ${tokenAddr}`);
    console.log(`Minted to:     ${RECIPIENT}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
