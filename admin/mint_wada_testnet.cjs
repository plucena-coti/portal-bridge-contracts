const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Minting WADA with account:", signer.address);

    const WADA_ADDRESS = "0xAad069A539001920712489C8FF796f1444E7394e";
    const TARGET_ADDRESS = "0x0B21Bc1A3d99c02B5bD5925C8A783681c6c73D76";
    const AMOUNT = ethers.parseUnits("1000", 6); // WADA has 6 decimals

    const WADA = await ethers.getContractAt("WADA", WADA_ADDRESS, signer);

    console.log(`Minting 1000 WADA to ${TARGET_ADDRESS}...`);
    const tx = await WADA.mint(TARGET_ADDRESS, AMOUNT, {
        gasLimit: 200000,
        gasPrice: ethers.parseUnits("35", "gwei")
    });
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("✅ Minted successfully!");

    const balance = await WADA.balanceOf(TARGET_ADDRESS);
    console.log("New Balance:", ethers.formatUnits(balance, 6));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
