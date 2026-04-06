const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 180;
const GAS_LIMIT_TX = 5000000;

async function waitWithTimeout(promise, timeoutSeconds, stepName) {
    console.log(`[${stepName}] Waiting up to ${timeoutSeconds} seconds...`);
    // ... use simplified timeout logic for script ...
    return await promise;
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Verifying WETH Uint256 Flow`);
    console.log(`User: ${deployer.address}`);

    // Configuration from latest deployment
    const WETH_ADDR = "0x1Ef7E9e33549d394418b03152984e64388A4EE56";
    const PRIV_WETH_ADDR = "0xF3F5723Ae1609AfCCc7CCA0D1169d091789CDd28";
    const BRIDGE_WETH_ADDR = "0x4B24959C2b23CE6a90e4b536f4C736F7b0ebC38f";

    const weth = await ethers.getContractAt("WETH9", WETH_ADDR);
    const bridge = await ethers.getContractAt("PrivacyBridgeWETH", BRIDGE_WETH_ADDR);

    // 0. Ensure WETH Balance
    const bal = await weth.balanceOf(deployer.address);
    if (bal < ethers.parseUnits("0.01", 18)) {
        console.log("Wrapping 0.01 ETH to WETH...");
        const wrapTx = await weth.deposit({ value: ethers.parseUnits("0.01", 18), gasLimit: 500000 });
        await wrapTx.wait();
        console.log("Wrapped.");
    }

    // 1. Approve Bridge
    console.log("Approving bridge...");
    const approveTx = await weth.approve(BRIDGE_WETH_ADDR, ethers.MaxUint256, { gasLimit: GAS_LIMIT_TX });
    await approveTx.wait();
    console.log("Approved.");

    // 2. Deposit 0.001 WETH
    const amount = ethers.parseUnits("0.001", 18);
    console.log(`Depositing ${ethers.formatEther(amount)} WETH...`);
    const depTx = await bridge.deposit(amount, { gasLimit: GAS_LIMIT_TX });
    await depTx.wait();
    console.log("Deposit successful (Uint256 check passed).");

    // 3. Check Bridge Balance
    const bridgeBal = await weth.balanceOf(BRIDGE_WETH_ADDR);
    console.log(`Bridge Public Balance: ${ethers.formatEther(bridgeBal)} WETH`);

    console.log("\n✅ WETH Uint256 Flow Verified");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
