import { ethers } from "ethers";

async function main() {
    const rpcUrl = "https://testnet.coti.io/rpc";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // CORRECT WADA Bridge Address from config.ts
    const bridgeAddress = ethers.getAddress("0x86BF0beA40Ba49f25a87015a5639b5b0F05aB450".toLowerCase());
    const userAddress = ethers.getAddress("0x4466b038EfbAE211603ba5570D0E767E2FBCdFB5".toLowerCase());
    
    const amountWei = ethers.parseUnits("100", 6);
    const nativeFee = 0n; // WADA bridge has 0 native fee

    const iface1 = new ethers.Interface(["function deposit(uint256 amount) payable"]);
    const calldata1 = iface1.encodeFunctionData("deposit", [amountWei]);

    const iface2 = new ethers.Interface([
        "function deposit(uint256 amount, tuple(tuple(uint256 ciphertextHigh, uint256 ciphertextLow) ciphertext, bytes signature) encryptedAmount) payable"
    ]);
    const dummyItUint256 = {
        ciphertext: { ciphertextHigh: 0n, ciphertextLow: 0n },
        signature: "0x" + "00".repeat(65)
    };
    const calldata2 = iface2.encodeFunctionData("deposit", [amountWei, dummyItUint256]);

    console.log("Estimating for:", userAddress);

    try {
        const gas1 = await provider.estimateGas({
            from: userAddress,
            to: bridgeAddress,
            data: calldata1,
            value: nativeFee
        });
        console.log("Plain deposit gas:", gas1.toString());
    } catch (e: any) {
        console.log("Plain deposit failed:", e.message);
    }

    try {
        const gas2 = await provider.estimateGas({
            from: userAddress,
            to: bridgeAddress,
            data: calldata2,
            value: nativeFee
        });
        console.log("Encrypted deposit gas:", gas2.toString());
    } catch (e: any) {
        console.log("Encrypted deposit failed:", e.message);
    }
}

main().catch(console.error);
