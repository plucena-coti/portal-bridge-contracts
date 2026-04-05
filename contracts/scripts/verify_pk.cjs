const { ethers } = require("ethers");

try {
    const pk = "0xae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
    const wallet = new ethers.Wallet(pk);
    console.log("Address with 0x:", wallet.address);

    const pk2 = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306";
    const wallet2 = new ethers.Wallet(pk2);
    console.log("Address without 0x:", wallet2.address);
} catch (e) {
    console.error(e);
}
