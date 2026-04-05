async function main() {
    const adminKey = "7878f5da0ffdfc7e87602d41aefe84661e9328d22f8ddc8f5a175c48b6f6f179"; // from root/.env
    const provider = ethers.provider;
    const adminWallet = new ethers.Wallet(adminKey, provider);

    const pwethAddress = "0x5E5b9A51c1FC2cfA41dB715CcB6Ef429A3c5586B";
    const recipient = "0x0D1d978684edd5092cd7C15F370238b2B94766C8";
    const amount = ethers.parseUnits("500", 18);

    const pweth = await ethers.getContractAt("PrivateCOTI", pwethAddress, adminWallet);
    const MINTER_ROLE = await pweth.MINTER_ROLE();

    console.log(`Using Admin: ${adminWallet.address}`);

    // 1. Grant Minter role to itself
    console.log("Checking MINTER_ROLE...");
    const isMinter = await pweth.hasRole(MINTER_ROLE, adminWallet.address);
    if (!isMinter) {
        console.log("Granting MINTER_ROLE to Admin...");
        const tx = await pweth.grantRole(MINTER_ROLE, adminWallet.address, { gasLimit: 5000000 });
        await tx.wait();
        console.log("MINTER_ROLE granted.");
    }

    // 2. Mint 500 p.WETH to itself
    console.log("Minting 500 p.WETH...");
    // Disambiguate overloaded mint function
    const mintTx = await pweth["mint(address,uint256)"](adminWallet.address, amount, { gasLimit: 5000000 });
    await mintTx.wait();
    console.log("Minted 500 p.WETH.");

    // 3. Transfer to recipient
    console.log(`Transferring 500 p.WETH to ${recipient}...`);
    // Disambiguate overloaded transfer function
    const transferTx = await pweth["transfer(address,uint256)"](recipient, amount, { gasLimit: 5000000 });
    await transferTx.wait();
    console.log("Transfer successful!");
    console.log(`TX Hash: ${transferTx.hash}`);
}

main().catch(console.error);
