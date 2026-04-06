async function main() {
    const pwethAddress = "0x5E5b9A51c1FC2cfA41dB715CcB6Ef429A3c5586B";
    const pweth = await ethers.getContractAt("PrivateCOTI", pwethAddress);
    const MINTER_ROLE = await pweth.MINTER_ROLE();
    const DEFAULT_ADMIN_ROLE = await pweth.DEFAULT_ADMIN_ROLE();

    const accounts = [
        "0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2",
        "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012",
        "0x226D3Eb51e24D98150e682d0337c214779cD52A2"
    ];

    for (const acc of accounts) {
        const isMinter = await pweth.hasRole(MINTER_ROLE, acc);
        const isAdmin = await pweth.hasRole(DEFAULT_ADMIN_ROLE, acc);
        console.log(`Account: ${acc}`);
        console.log(`  Is Minter: ${isMinter}`);
        console.log(`  Is Admin:  ${isAdmin}`);
    }
}

main().catch(console.error);
