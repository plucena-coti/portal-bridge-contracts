async function main() {
    const [deployer] = await ethers.getSigners();
    const pwethAddress = "0x5E5b9A51c1FC2cfA41dB715CcB6Ef429A3c5586B";

    const pweth = await ethers.getContractAt("PrivateCOTI", pwethAddress);
    const MINTER_ROLE = await pweth.MINTER_ROLE();
    const DEFAULT_ADMIN_ROLE = await pweth.DEFAULT_ADMIN_ROLE();

    const isMinter = await pweth.hasRole(MINTER_ROLE, deployer.address);
    const isAdmin = await pweth.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

    console.log(`Account: ${deployer.address}`);
    console.log(`Is Minter: ${isMinter}`);
    console.log(`Is Admin: ${isAdmin}`);

    if (isAdmin && !isMinter) {
        console.log("Account is Admin but not Minter. Granting Minter role...");
        const tx = await pweth.grantRole(MINTER_ROLE, deployer.address);
        await tx.wait();
        console.log("Minter role granted!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
