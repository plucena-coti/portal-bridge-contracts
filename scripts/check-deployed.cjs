const hre = require("hardhat");

async function main() {
    const tokenAddr = "0x3f8E33AEAeCe60706eA958E3aa558d85605623ec"; // PrivateWrappedBTC
    const token = await hre.ethers.getContractAt("PrivateERC20", tokenAddr);
    
    console.log("Checking token code...");
    const code = await hre.ethers.provider.getCode(tokenAddr);
    console.log("Code length:", code.length);
    
    if (code.length > 2) {
        try {
            const name = await token.name();
            const symbol = await token.symbol();
            console.log(`Token Name: ${name}, Symbol: ${symbol}`);
        } catch(e) {
            console.log("Failed to fetch name/symbol:", e.message);
        }
    } else {
        console.log("No contract deployed at this address!");
    }
}

main().catch(console.error);
