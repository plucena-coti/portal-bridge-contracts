const { ethers } = require("ethers");

async function check() {
    // Ethers v6 expects nested arrays or objects matching the struct
    const itAsObject = {
        ciphertext: {
            ciphertextHigh: 1n,
            ciphertextLow: 2n
        },
        signature: "0x1234"
    };

    const itAsNestedArray = [[1n, 2n], "0x1234"];

    const abi = ["function test(uint256 amount, ((uint256,uint256),bytes) it)"];
    const iface = new ethers.Interface(abi);

    try {
        const enc1 = iface.encodeFunctionData("test", [100n, itAsObject]);
        console.log("Encoded successfully as OBJECT");
    } catch (e) {
        console.log("Failed as OBJECT:", e.message);
    }

    try {
        const enc2 = iface.encodeFunctionData("test", [100n, itAsNestedArray]);
        console.log("Encoded successfully as NESTED ARRAY");
    } catch (e) {
        console.log("Failed as NESTED ARRAY:", e.message);
    }
}

check();
