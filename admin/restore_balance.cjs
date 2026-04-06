const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const WETH_ADDRESS = "0x7D240ABB32be52B2AC629156269e2aC30D1B61ca";
    const USER_ADDRESS = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    const AMOUNT_TO_WRAP = ethers.parseEther("5.0"); // 5 ETH

    console.log(`Wrapping ETH for user: ${USER_ADDRESS}`);
    console.log(`Target WETH: ${WETH_ADDRESS}`);

    const [signer] = await ethers.getSigners();
    // In Hardhat, signer 0 is usually the deployer. We can send from signer to WETH contract on behalf of user?
    // WETH deposit sends WETH to msg.sender.
    // So if I run this script with signer, the SIGNER gets WETH.
    // I need to send WETH to the USER.

    // 1. Wrap ETH (Signer -> WETH)
    console.log("Wrapping 10 ETH...");
    const WETH_ABI = ["function deposit() public payable", "function transfer(address to, uint amount) returns (bool)"];
    const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI, signer);

    // const txDeposit = await weth.deposit({ value: AMOUNT_TO_WRAP, gasLimit: 5000000 });
    // await txDeposit.wait();
    // console.log("Wrapped.");

    // 2. Transfer WETH (Signer -> User)
    console.log(`Transferring 5 WETH to ${USER_ADDRESS}...`);
    const txTransfer = await weth.transfer(USER_ADDRESS, AMOUNT_TO_WRAP, { gasLimit: 5000000 });
    await txTransfer.wait();

    console.log(`✅ Sent 5 WETH to ${USER_ADDRESS}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
