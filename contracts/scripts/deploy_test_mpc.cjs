const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log(`Deploying TestMpc to ${network.name} (${network.chainId})...`);

    const TestMpc = await ethers.getContractFactory("TestMpc");
    const testMpc = await TestMpc.deploy({
        gasLimit: 3000000,
        gasPrice: 10000000000
    });
    await testMpc.waitForDeployment();

    const addr = await testMpc.getAddress();
    console.log(`✅ TestMpc deployed to: ${addr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
