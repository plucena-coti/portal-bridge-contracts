const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    // Addresses
    const wbtc = "0xa36e2AD641D3e69e482aA774363A92A1F9e937f0"; // Public WBTC
    const bridgeAddr = "0x88B8ab53d886A59673DCaB4A082264f5a98eD5E8"; // PrivacyBridgeWBTC
    
    const wbtcContract = await hre.ethers.getContractAt("IERC20", wbtc, deployer);
    const bridgeContract = await hre.ethers.getContractAt("PrivacyBridgeERC20", bridgeAddr, deployer);
    
    const amount = hre.ethers.parseUnits("0.0001", 8); // Tiny amount
    
    console.log("Approving bridge...");
    const approveTx = await wbtcContract.approve(bridgeAddr, amount, { gasLimit: 5000000 });
    console.log("Approve Tx Hash:", approveTx.hash);
    await approveTx.wait();
    console.log("Approved.");
    
    console.log("Depositing WBTC to bridge...");
    
    // Check fee
    let fee = 0n;
    try {
        fee = await bridgeContract.nativeCotiFee();
    } catch(e) {}
    
    try {
        const depositTx = await bridgeContract["deposit(uint256)"](amount, { value: fee, gasLimit: 12000000 });
        console.log("Deposit tx Hash:", depositTx.hash);
        await depositTx.wait();
        console.log("Success!");
    } catch (e) {
        console.log("Deposit failed:", e.message);
    }
}

main().catch(console.error);
