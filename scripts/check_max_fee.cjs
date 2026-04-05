const { ethers } = require("ethers");

async function main() {
    const rpcUrl = "https://testnet.coti.io/rpc";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const bridgeAddress = "0x6567529235bEf9680028c95f514E7a881e8f15b5"; // USDT Bridge
    const abi = ["function MAX_FEE_UNITS() view returns (uint256)"];
    
    const bridge = new ethers.Contract(bridgeAddress, abi, provider);

    const maxFee = await bridge.MAX_FEE_UNITS();
    console.log("MAX_FEE_UNITS:", maxFee.toString());
}

main().catch(console.error);
