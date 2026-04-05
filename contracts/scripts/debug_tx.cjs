const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const TX_HASH = "0xf87bcbbef9ce08df2d0b19904c25ae45ec4671d4a13aff90042463072fe98f14";
    // Address from config.ts
    const CONFIG_ADDRESS = "0xC5BE4139a46899e4962646fB213B4646B19446E1".toLowerCase();

    console.log(`Analyzing Tx: ${TX_HASH}`);

    const provider = ethers.provider;
    const tx = await provider.getTransaction(TX_HASH);

    if (!tx) {
        console.log("Transaction not found!");
        return;
    }

    console.log(`Tx To: ${tx.to.toLowerCase()}`);
    console.log(`Config Address: ${CONFIG_ADDRESS}`);
    console.log(`Match? ${tx.to.toLowerCase() === CONFIG_ADDRESS}`);

    const code = await provider.getCode(tx.to);
    console.log(`Code at Tx To: ${code.length > 2 ? "Yes (" + code.length + " bytes)" : "No (EOA)"}`);

    const codeConfig = await provider.getCode(CONFIG_ADDRESS);
    console.log(`Code at Config Address: ${codeConfig.length > 2 ? "Yes (" + codeConfig.length + " bytes)" : "No (EOA)"}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
