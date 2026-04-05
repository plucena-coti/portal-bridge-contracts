const { Wallet } = require("@coti-io/coti-ethers");
const { ethers } = require("hardhat");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
const PROVIDER_URL = "https://testnet.coti.io/rpc";

async function main() {
    console.log("🚀 Starting DateGame Verification...");

    // 1. Setup Wallet with AES Key from env or fallback
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new Wallet(PRIVATE_KEY, provider);

    // Explicitly set the AES key (from .env or hardcoded fallback)
    // The user's successful test used an existing key.
    const AES_KEY = process.env.PRIVATE_USER_AES_KEY || "8d41ade6e238d837bdbd44bac75dfac4";
    wallet.setAesKey(AES_KEY);
    console.log("🔑 AES Key set explicitly.");

    // 2. Deploy
    console.log("📄 Deploying DateGame...");
    const Factory = await ethers.getContractFactory("DateGame", wallet);
    const dateGame = await Factory.deploy({ gasLimit: 5000000, gasPrice: 10000000000n });
    await dateGame.waitForDeployment();
    const address = await dateGame.getAddress();
    console.log(`✅ DateGame deployed to: ${address}`);

    // 3. Set Age (25)
    console.log("🎂 Setting Age to 25...");
    const ageInput = await wallet.encryptValue(25n, address, dateGame.interface.getFunction("setAge").selector);

    // Send Tx
    const tx1 = await dateGame.setAge(ageInput, { gasLimit: 5000000, gasPrice: 10000000000n });
    await tx1.wait();
    console.log("   ✅ Age Set.");

    // 4. Verify Age Set
    const isSet = await dateGame.isAgeSet();
    console.log(`   isAgeSet: ${isSet}`);

    // 5. Get Age back (Decrypt)
    console.log("🕵️‍♂️  Retrieving Age (Decrypt test)...");
    const ageCt = await dateGame.getAge();
    const decryptedAge = await wallet.decryptValue(ageCt);
    console.log(`   🎉 Decrypted Age: ${decryptedAge}`);

    if (BigInt(decryptedAge) !== 25n) {
        console.error("   ❌ MISMATCH! Expected 25.");
    }

    // 6. Test Comparison (Greater Than 20)
    console.log("⚖️  Testing GreaterThan(20)...");
    const compareInput = await wallet.encryptValue(20n, address, dateGame.interface.getFunction("greaterThan").selector);
    const tx2 = await dateGame.greaterThan(compareInput, { gasLimit: 5000000, gasPrice: 10000000000n });
    await tx2.wait();
    console.log("   ✅ Comparison executed.");

    // 7. Check Result
    console.log("📝 Checking Result...");
    const resCt = await dateGame.comparisonResult();
    const decryptedRes = await wallet.decryptValue(resCt);
    console.log(`   🎉 Decrypted Result (1=True, 0=False): ${decryptedRes}`);
    if (BigInt(decryptedRes) !== 1n) {
        console.error("   ❌ MISMATCH! Expected 1 (True).");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
