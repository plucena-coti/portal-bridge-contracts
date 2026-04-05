async function main() {
    const [deployer] = await ethers.getSigners();
    const pwethAddress = "0x5E5b9A51c1FC2cfA41dB715CcB6Ef429A3c5586B";
    const recipient = "0x0D1d978684edd5092cd7C15F370238b2B94766C8";
    const amount = ethers.parseUnits("500", 18);

    // Using PrivateCOTI as a proxy for the ABI
    const pweth = await ethers.getContractAt("PrivateCOTI", pwethAddress);

    console.log(`Transferring 500 p.WETH from ${deployer.address} to ${recipient}...`);
    console.log(`Using p.WETH address: ${pwethAddress}`);

    try {
        // Explicitly using the transfer(address,uint256) signature with a manual gas limit
        const tx = await pweth["transfer(address,uint256)"](recipient, amount, { gasLimit: 5000000 });
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log("Transfer successful!");
    } catch (error) {
        console.error("Transfer failed:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
