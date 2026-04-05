async function main() {
    const k1 = "ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306"; // contracts/.env
    const k2 = "7878f5da0ffdfc7e87602d41aefe84661e9328d22f8ddc8f5a175c48b6f6f179"; // root/.env
    const k3 = "4f8dce67a7ba2206d47945b758cc83ae8eba28f870955b7600459da223ad1af4"; // root/.env PRIVATE_KEY2

    const w1 = new ethers.Wallet(k1);
    const w2 = new ethers.Wallet(k2);
    const w3 = new ethers.Wallet(k3);

    console.log(`Key 1 (contracts/.env): ${w1.address}`);
    console.log(`Key 2 (root/.env):      ${w2.address}`);
    console.log(`Key 3 (root/.env PK2):  ${w3.address}`);
}

main().catch(console.error);
