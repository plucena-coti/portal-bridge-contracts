const hre = require("hardhat");
const { ethers } = hre;
const { decryptUint } = require("@coti-io/coti-sdk-typescript");

async function main() {
    const PRIVATE_COTI_ADDRESS = "0x074A10a5Cb95436CF8FC966d7Bb9809458bf72a4";
    const USER_ADDRESS = "0xe45fc1a7d84e73c8c71edf2814e7467f7c86a8a2";
    const AES_KEY = "56fb7c8ae08afea61ea73381a2f082bf";

    const network = await ethers.provider.getNetwork();
    console.log(`\n🔓 Decrypting COTI.p Balance on Chain ID ${network.chainId}\n`);

    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = PrivateCoti.attach(PRIVATE_COTI_ADDRESS);

    console.log(`Token Contract: ${PRIVATE_COTI_ADDRESS}`);
    console.log(`User Address:   ${USER_ADDRESS}\n`);

    try {
        // Get encrypted balance
        const encryptedBalance = await privateCoti["balanceOf(address)"](USER_ADDRESS);

        console.log(`🔐 Encrypted Balance:`);
        console.log(`   ${encryptedBalance.toString()}\n`);

        // Decrypt the balance
        console.log(`🔓 Decrypting with AES key...\n`);
        const decryptedBalance = decryptUint(encryptedBalance, AES_KEY);

        // Get decimals for proper formatting
        const decimals = await privateCoti.decimals();
        const symbol = await privateCoti.symbol();

        // Format the balance
        const formattedBalance = ethers.formatUnits(decryptedBalance, decimals);

        console.log(`✅ DECRYPTED BALANCE:\n`);
        console.log(`   ${formattedBalance} ${symbol}`);
        console.log(`   (${decryptedBalance.toString()} base units)\n`);
        console.log(`📊 Details:`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Raw amount: ${decryptedBalance.toString()}`);
        console.log(`   Formatted: ${formattedBalance} ${symbol}\n`);

    } catch (error) {
        console.error(`❌ Error:`, error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
