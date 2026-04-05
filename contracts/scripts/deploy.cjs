const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 120;

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
    // Global Safety Timeout: Ensure script DIES if it hangs for more than 3 minutes
    setTimeout(() => {
        console.error("\n💀 GLOBAL SCRIPT TIMEOUT (180s) REACHED. FORCE EXITING.");
        process.exit(1);
    }, 180 * 1000);

    const network = await ethers.provider.getNetwork();
    const networkName = network.name === 'unknown' ? 'cotiTestnet' : network.name;
    const isMainnet = network.chainId === 2632500n;
    const explorerUrl = isMainnet ? "https://mainnet.cotiscan.io" : "https://testnet.cotiscan.io";

    console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);
    console.log(`Step Timeout: ${TIMEOUT_SECONDS} seconds`);
    console.log(`Global Timeout: 180 seconds`);

    // 1. Deploy PrivateCoti
    console.log("\n1. Deploying PrivateCoti...");
    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    // Adding gas limit and gas price to be explicit
    const privateCoti = await PrivateCoti.deploy({ gasLimit: 12000000 });
    console.log("   -> Deploy tx sent. Waiting for confirmation...");

    await waitWithTimeout(privateCoti.waitForDeployment(), TIMEOUT_SECONDS, "PrivateCoti Deployment");

    const pCotiAddr = await privateCoti.getAddress();
    console.log(`   -> PrivateCoti deployed to: ${pCotiAddr}`);
    console.log(`   -> Explorer: ${explorerUrl}/address/${pCotiAddr}`);

    // 2. Deploy PrivacyBridgeCotiNative
    console.log("\n2. Deploying PrivacyBridgeCotiNative...");
    const PrivacyBridgeCoti = await ethers.getContractFactory("PrivacyBridgeCotiNative");
    const bridge = await PrivacyBridgeCoti.deploy(pCotiAddr, { gasLimit: 12000000 });
    console.log("   -> Deploy tx sent. Waiting for confirmation...");

    await waitWithTimeout(bridge.waitForDeployment(), TIMEOUT_SECONDS, "PrivacyBridgeCotiNative Deployment");

    const bridgeAddr = await bridge.getAddress();
    console.log(`   -> PrivacyBridgeCotiNative deployed to: ${bridgeAddr}`);
    console.log(`   -> Explorer: ${explorerUrl}/address/${bridgeAddr}`);

    // 3. Setup Permissions
    console.log("\n3. Granting permissions...");
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    console.log("   -> Sending grantRole transaction...");
    // Race the transaction creation itself just in case
    const tx = await Promise.race([
        privateCoti.grantRole(MINTER_ROLE, bridgeAddr, { gasLimit: 12000000 }),
        new Promise((_, r) => setTimeout(() => r(new Error("Timeout sending tx")), 30000))
    ]);

    console.log(`   -> Transaction sent: ${tx.hash} (Waiting for confirmation...)`);

    await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, "Granting MINTER_ROLE");

    console.log(`   -> MINTER_ROLE granted to ${bridgeAddr}`);
    console.log(`   -> Tx: ${explorerUrl}/tx/${tx.hash}`);

    console.log("\nDeployment Complete! ✅");
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
