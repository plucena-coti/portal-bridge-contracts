async function main() {
    const [deployer] = await ethers.getSigners();
    const wethAddr = "0xdC16c3c42c7cB5317462489688EAbcE37Ac48e6d";
    const weth = await ethers.getContractAt("WETH9", wethAddr);

    const bal = await weth.balanceOf(deployer.address);
    console.log(`Public WETH Balance: ${ethers.formatEther(bal)}`);

    if (bal < ethers.parseEther("500")) {
        console.log("Insufficient public WETH. Attempting to mint 1000 WETH...");
        // WETH9 in this project usually has a mint function for testing
        try {
            const tx = await weth.mint(deployer.address, ethers.parseEther("1000"));
            await tx.wait();
            console.log("Minted 1000 WETH!");
        } catch (e) {
            console.log("Mint failed. WETH might not be mintable by this account.");
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
