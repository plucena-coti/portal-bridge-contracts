const hre = require("hardhat");
const { ethers } = hre;

const RECIPIENT = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
const NEW_CONTRACT = "0x9e961430053cd5AbB3b060544cEcCec848693Cf0";
const OLD_CONTRACT = "0xA53Cbe7Ac743C694f74539a73C531a60dA0fF5B8";

async function main() {
    console.log(`\n🔍 Checking BOTH USDT contracts for ${RECIPIENT}...`);

    // Check NEW contract
    console.log(`\n📍 NEW USDT contract: ${NEW_CONTRACT}`);
    try {
        const USDT_NEW = await ethers.getContractAt("USDT", NEW_CONTRACT);
        const balanceNew = await USDT_NEW.balanceOf(RECIPIENT);
        const formattedNew = ethers.formatUnits(balanceNew, 6);
        console.log(`   Balance: ${formattedNew} USDT`);
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }

    // Check OLD contract
    console.log(`\n📍 OLD USDT contract: ${OLD_CONTRACT}`);
    try {
        const USDT_OLD = await ethers.getContractAt("USDT", OLD_CONTRACT);
        const balanceOld = await USDT_OLD.balanceOf(RECIPIENT);
        const formattedOld = ethers.formatUnits(balanceOld, 6);
        console.log(`   Balance: ${formattedOld} USDT`);
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }

    // Check if the frontend config is using the right address
    console.log(`\n📋 Frontend should be using: ${NEW_CONTRACT}`);
    console.log(`📋 Check if browser cache needs clearing!`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });