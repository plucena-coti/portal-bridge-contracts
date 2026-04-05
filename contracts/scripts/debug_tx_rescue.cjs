const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const TX_HASH = "0x50a4f2b94c7dda72b885421324caeb6f971a5e6eff9dfe29a28e095e3ca8abe2";
    console.log(`\n🔍 Checking transaction details: ${TX_HASH}\n`);

    const receipt = await ethers.provider.getTransactionReceipt(TX_HASH);
    if (!receipt) {
        console.log("❌ Transaction receipt not found!");
        return;
    }

    console.log(`Status: ${receipt.status === 1 ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    
    console.log(`\nLogs: ${receipt.logs.length}`);
    for (const log of receipt.logs) {
        console.log(`- Address: ${log.address}`);
        console.log(`  Data: ${log.data}`);
        console.log(`  Topics: ${log.topics.join(', ')}`);
    }
}

main().catch(console.error);
