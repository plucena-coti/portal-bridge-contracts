async function main() {
    const pwethAddress = "0x5E5b9A51c1FC2cfA41dB715CcB6Ef429A3c5586B";
    const pweth = await ethers.getContractAt("PrivacyBridgeWETH", pwethAddress); // Using PrivacyBridgeWETH as proxy for owner() if it exists, or just use AccessControl

    // AccessControl doesn't have an owner() by default, but our contract might inherit Ownable or explicit owner.
    // Let's check for DEFAULT_ADMIN_ROLE members if owner() fails.
    try {
        const owner = await pweth.owner();
        console.log(`Owner: ${owner}`);
    } catch (e) {
        console.log("No owner() function found. Checking DEFAULT_ADMIN_ROLE...");
        // DEFAULT_ADMIN_ROLE is 0x00
        const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";
        // We can't easily list role members in standard AccessControl without Enumerable.
        // But we can check some known addresses.
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
