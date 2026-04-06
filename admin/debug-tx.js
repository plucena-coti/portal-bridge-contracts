const { ethers } = require("hardhat");

async function main() {
  const txHash = process.argv[2];
  if (!txHash) {
    console.log("Usage: node debug-tx.js <txHash>");
    process.exit(1);
  }

  const provider = ethers.provider;
  const tx = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);

  console.log("\n=== Transaction Details ===");
  console.log("Hash:", tx.hash);
  console.log("From:", tx.from);
  console.log("To:", tx.to);
  console.log("Value:", ethers.formatEther(tx.value), "COTI");
  console.log("Data:", tx.data.slice(0, 66) + "...");
  console.log("\n=== Receipt ===");
  console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
  console.log("Gas Used:", receipt.gasUsed.toString());
  console.log("Logs:", receipt.logs.length);

  if (receipt.status === 0) {
    console.log("\n=== Attempting to get revert reason ===");
    try {
      await provider.call(tx, tx.blockNumber);
    } catch (error) {
      console.log("Revert reason:", error.message);
      if (error.data) {
        console.log("Error data:", error.data);
      }
    }
  }
}

main().catch(console.error);
