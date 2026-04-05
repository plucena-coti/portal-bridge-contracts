const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const path = require('path');

async function main() {
    // Read root .env for private key
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

    console.log(`Signer: ${signer.address}`);

    const TARGET = "0xdF9F8FcA4591227C092FCBAb45A846C19fb6d1ae";
    const AMOUNT = "1000000";

    const tokens = [
        { name: "WBTC",   contractName: "WBTC",   address: "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492", decimals: 8 },
        { name: "USDT",   contractName: "USDT",   address: "0x9e961430053cd5AbB3b060544cEcCec848693Cf0", decimals: 6 },
        { name: "USDC.e", contractName: "USDCe",  address: "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C", decimals: 6 },
        { name: "WADA",   contractName: "WADA",   address: "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D", decimals: 6 },
        { name: "gCOTI",  contractName: "gCOTI",  address: "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C", decimals: 18 },
    ];

    for (const token of tokens) {
        console.log(`\nMinting ${AMOUNT} ${token.name} to ${TARGET}...`);
        const amount = ethers.parseUnits(AMOUNT, token.decimals);
        const contract = await ethers.getContractAt(token.contractName, token.address, signer);
        const tx = await contract.mint(TARGET, amount, { gasLimit: 5000000 });
        console.log(`  tx hash: ${tx.hash}`);
        await tx.wait();
        console.log(`  ✅ Done`);
    }

    console.log(`\n🎉 All tokens minted successfully to ${TARGET}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
