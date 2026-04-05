const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
    console.log("Starting deployment...");

    // In CJS with Hardhat v2, hre.network.provider is reliably the Hardhat provider
    // We wrap it with BrowserProvider (ethers v6)
    const provider = new ethers.BrowserProvider(hre.network.provider);
    const signer = await provider.getSigner();

    console.log("Deploying with account:", await signer.getAddress());

    // usage of artifacts to get contract data
    const artifact = await hre.artifacts.readArtifact("PrivateCoti");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    const token = await factory.deploy();
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log("PrivateCoti deployed to:", tokenAddress);

    const bob = "0x48f9d5da4e224d965497f722555b0eebcbdf4ab6";
    const amount = 100_000n * 1_000_000n;

    console.log(`Minting ${amount} units to Bob...`);

    const tx = await token.mint(bob, amount);
    await tx.wait();

    console.log("Minting successful!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
