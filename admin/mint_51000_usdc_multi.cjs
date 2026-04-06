const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const path = require('path');

async function main() {
    // Manually read root .env to overcome precedence issues
    const envPath = path.resolve(__dirname, "../../.env");
    const envContent = fs.readFileSync(envPath, 'utf8');
    const privateKeyMatch = envContent.match(/^PRIVATE_KEY=(.*)$/m);

    if (!privateKeyMatch || !privateKeyMatch[1]) {
        throw new Error("Could not find PRIVATE_KEY in root .env");
    }

    let pk = privateKeyMatch[1].trim();
    if (!pk.startsWith('0x')) pk = '0x' + pk;

    const provider = ethers.provider;
    const signer = new ethers.Wallet(pk, provider);

    const targetAddresses = [
        "0x0dDD6662B6fF82ea69774f9F45D4538BEabF27b5",
        "0x226D3Eb51e24D98150e682d0337c214779cD52A2"
    ];

    const TOKEN = { name: "USDCe", address: "0xdc853f1A4Fd06B118726B3c097CEaD27E47e9Ba3", decimals: 6 };
    const usdc = await ethers.getContractAt("USDCe", TOKEN.address, signer);

    const AMOUNT = "51000";
    const amount = ethers.parseUnits(AMOUNT, TOKEN.decimals);

    for (const targetAddress of targetAddresses) {
        console.log(`Minting ${AMOUNT} USDC.e to ${targetAddress}...`);
        const tx = await usdc.mint(targetAddress, amount, { gasLimit: 5000000 });
        console.log(`Sending tx: ${tx.hash}`);
        await tx.wait();
        console.log(`✅ Successfully minted ${AMOUNT} USDC.e to ${targetAddress}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
