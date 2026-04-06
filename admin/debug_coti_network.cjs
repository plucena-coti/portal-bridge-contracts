const { ethers } = require("ethers");

async function main() {
    // COTI Testnet Config
    const rpcUrl = "https://testnet.coti.io/rpc"; // Verifying generic RPC first, or use the one from config if known
    // Found in previous logs likely: https://testnet.coti.io/rpc or similar.
    // Let's assume standard testnet RPC. 

    // However, the tokens.json says chainId 7082400.
    const provider = new ethers.JsonRpcProvider("https://testnet.coti.io/rpc");

    const userAddress = "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2";
    const onboardAddress = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095"; // From tokens.json
    const pWethAddress = "0xd11c31A9d9a615e529A2dBF1410140D188Ba2592"; // From logs

    console.log(`🔍 Checking Network State...`);
    const network = await provider.getNetwork();
    console.log(`✅ Connected to Chain ID: ${network.chainId}`);

    // 1. Check OnboardContract Code
    console.log(`\n🔍 Checking OnboardContract at ${onboardAddress}...`);
    const code = await provider.getCode(onboardAddress);
    if (code === "0x") {
        console.error(`❌ ERROR: No code found at OnboardContract address! It does not exist.`);
    } else {
        console.log(`✅ Code found (${code.length} bytes). Contract exists.`);

        // 2. Check User Onboarding Status
        try {
            const onboardContract = new ethers.Contract(onboardAddress, [
                "function userOnboarded(address) view returns (bool)"
            ], provider);

            const isOnboarded = await onboardContract.userOnboarded(userAddress);
            console.log(`👤 User Onboarded Status: ${isOnboarded}`);
        } catch (e) {
            console.error(`❌ Failed to check userOnboarded:`, e.message);
            // Try with gas limit just in case
            try {
                const onboardContract = new ethers.Contract(onboardAddress, [
                    "function userOnboarded(address) view returns (bool)"
                ], provider);
                const isOnboarded = await onboardContract.userOnboarded(userAddress, { gasLimit: 6000000 });
                console.log(`👤 User Onboarded Status (with Gas): ${isOnboarded}`);
            } catch (e2) {
                console.error(`❌ Failed with gas override too:`, e2.message);
            }
        }
    }

    // 3. Check pWETH Code
    console.log(`\n🔍 Checking pWETH Contract at ${pWethAddress}...`);
    const codeWeth = await provider.getCode(pWethAddress);
    if (codeWeth === "0x") {
        console.error(`❌ ERROR: No code found at pWethAddress!`);
    } else {
        console.log(`✅ Code found (${codeWeth.length} bytes). Contract exists.`);
    }

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
