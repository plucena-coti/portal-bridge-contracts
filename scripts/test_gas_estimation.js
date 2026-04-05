const { ethers } = require("hardhat");

async function main() {
    const rpcUrl = "https://testnet.coti.io/rpc";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // PrivateBridgeWADA
    const bridgeAddress = "0x00Eaa3A3fB3fB1B48E06A26fDbfEc0EcfD52F473"; // From list_bridges.ts output
    const userAddress = "0x..."; // Need a holding address, I'll use the signer's address later or a known one

    // Let's just use an address we know has WADA and one without
    const wadaToken = "0xFEE63C14eA46edE863E266d6d4825d1979b0bf31"; // Assuming WADA testnet address

    console.log("Checking gas estimation for WADA bridge");
}
main().catch(console.error);
