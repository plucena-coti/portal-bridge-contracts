const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log(`Deploying DebugWADA to ${network.name} (${network.chainId})...`);

    // Deploy DebugWADA with explicit gas to avoid estimateGas issues
    const DebugWADA = await ethers.getContractFactory("DebugWADA");
    const debugWada = await DebugWADA.deploy({
        gasLimit: 12000000,
        gasPrice: 10000000000 // 10 gwei hardcoded
    });
    await debugWada.waitForDeployment();

    const addr = await debugWada.getAddress();
    console.log(`✅ DebugWADA deployed to: ${addr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
