const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 120;

// Configuration
const CAPYBARA_CONTRACT_ADDRESS = "0xBaf2a7B1CA0f9f35EB04e324cD8171E161b923a0"; // Mainnet
const RECIPIENT_ADDRESS = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
const MINT_AMOUNT = "100000"; // 100,000 CAPY tokens

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
    // Global Safety Timeout
    setTimeout(() => {
        console.error("\n💀 GLOBAL SCRIPT TIMEOUT (180s) REACHED. FORCE EXITING.");
        process.exit(1);
    }, 180 * 1000);

    // Validate contract address is set
    if (!CAPYBARA_CONTRACT_ADDRESS) {
        console.error("❌ Error: CAPYBARA_CONTRACT_ADDRESS is not set!");
        console.error("   Please update the script with the deployed Capybara contract address.");
        process.exit(1);
    }

    const network = await ethers.provider.getNetwork();
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

    // The owner private key (must match the owner of the Capybara contract)
    const ownerPrivateKey = "0xae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, ethers.provider);
    const ownerAddress = ownerWallet.address;
    console.log("Owner Address:", ownerAddress);
    console.log("Recipient Address:", RECIPIENT_ADDRESS);

    // Get Capybara contract instance
    console.log("\n1. Connecting to Capybara contract...");
    const Capybara = await ethers.getContractFactory("Capybara");
    const capybara = Capybara.attach(CAPYBARA_CONTRACT_ADDRESS).connect(ownerWallet);
    console.log(`   -> Connected to Capybara at: ${CAPYBARA_CONTRACT_ADDRESS}`);

    // Check current balances
    console.log("\n2. Checking balances before mint...");
    const recipientBalanceBefore = await capybara.balanceOf(RECIPIENT_ADDRESS);
    console.log(`   -> Recipient balance before: ${ethers.formatEther(recipientBalanceBefore)} CAPY`);

    // Mint tokens
    const mintAmount = ethers.parseEther(MINT_AMOUNT);
    console.log(`\n3. Minting ${MINT_AMOUNT} CAPY to ${RECIPIENT_ADDRESS}...`);
    const tx = await capybara.mint(RECIPIENT_ADDRESS, mintAmount, { gasLimit: 500000 });
    console.log(`   -> Mint tx sent: ${tx.hash}`);

    await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, "Mint Transaction");

    // Verify new balance
    console.log("\n4. Verifying balances after mint...");
    const recipientBalanceAfter = await capybara.balanceOf(RECIPIENT_ADDRESS);
    console.log(`   -> Recipient balance after: ${ethers.formatEther(recipientBalanceAfter)} CAPY`);

    const minted = recipientBalanceAfter - recipientBalanceBefore;
    console.log(`   -> Tokens minted: ${ethers.formatEther(minted)} CAPY`);

    console.log("\n✅ Minting Complete!");
    console.log(`   Successfully minted ${MINT_AMOUNT} CAPY to ${RECIPIENT_ADDRESS}`);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Minting Failed:");
        console.error(error);
        process.exit(1);
    });
