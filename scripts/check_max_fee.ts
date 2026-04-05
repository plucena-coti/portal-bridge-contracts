import { ethers } from "ethers";
import { BRIDGE_ABI } from "./src/contracts/config";

async function main() {
    const rpcUrl = "https://testnet.coti.io/rpc";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const bridgeAddress = "0x6567529235bEf9680028c95f514E7a881e8f15b5"; // USDT Bridge
    
    const bridge = new ethers.Contract(bridgeAddress, BRIDGE_ABI, provider);

    const maxFee = await bridge.MAX_FEE_UNITS();
    console.log("MAX_FEE_UNITS:", maxFee.toString());
}

main().catch(console.error);
