async function main() {
    const [deployer] = await ethers.getSigners();
    const pwethAddress = "0x5E5b9A51c1FC2cfA41dB715CcB6Ef429A3c5586B";
    const pweth = await ethers.getContractAt("PrivateCOTI", pwethAddress);

    console.log(`Checking p.WETH balance for ${deployer.address}...`);

    try {
        // balanceOf() for PrivateERC20 returns gtUint256 (for the caller)
        const gtBal = await pweth["balanceOf()"]();
        const bal = await network.provider.send("mpc_decrypt", [
            pwethAddress,
            deployer.address,
            "0x" + gtBal.toString(16).padStart(64, '0')
        ]);

        console.log(`p.WETH Balance: ${ethers.formatUnits(bal, 18)}`);
    } catch (error) {
        console.error("Failed to check balance:", error);
        // Fallback: just check if it reverts or returns something that looks like zero
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
