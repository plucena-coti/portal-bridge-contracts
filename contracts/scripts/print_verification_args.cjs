
const { ethers } = require("ethers");

async function main() {
    const pCotiAddress = "0x01253891f22fdf845CF86166bd031865E5109c07";
    const bridgeAddress = "0x16Df6447d978dfa3c384c734B2670B00A293B4A8";

    console.log("PrivateCoti Address:", pCotiAddress);
    console.log("Constructor Args: (None)");
    console.log("\n-----------------------------------\n");
    console.log("PrivacyBridgeCotiNative Address:", bridgeAddress);
    console.log("Constructor Arg (PrivateCoti):", pCotiAddress);

    const abiCoder = new ethers.AbiCoder();
    const encodedArgs = abiCoder.encode(["address"], [pCotiAddress]);
    console.log("Encoded Constructor Args:", encodedArgs.slice(2)); // Remove 0x
}

main();
