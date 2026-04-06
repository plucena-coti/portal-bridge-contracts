const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer, recipient] = await ethers.getSigners();
    console.log(`\n📊 Starting Gas Comparison (Deployer: ${deployer.address})`);

    // 1. Deploy Regular ERC20 (USDCe Mock)
    console.log("\nDeploying regular ERC20 (USDCe)...");
    const USDCe = await ethers.getContractFactory("USDCe");
    const usdc = await USDCe.deploy({ gasLimit: 5000000 });
    await usdc.waitForDeployment();
    const usdcAddr = await usdc.getAddress();
    console.log(`✅ Regular ERC20 deployed at: ${usdcAddr}`);

    // 2. Deploy Private ERC20 (PrivateBridgedUSDC)
    console.log("\nDeploying Private ERC20 (PrivateBridgedUSDC)...");
    const PrivateUSDCe = await ethers.getContractFactory("PrivateBridgedUSDC");
    const pUsdc = await PrivateUSDCe.deploy({ gasLimit: 10000000 });
    await pUsdc.waitForDeployment();
    const pUsdcAddr = await pUsdc.getAddress();
    console.log(`✅ Private ERC20 deployed at: ${pUsdcAddr}`);

    // 3. Setup Roles
    const MINTER_ROLE = await pUsdc.MINTER_ROLE();
    console.log("\nGranting MINTER_ROLE to deployer...");
    const grantTx = await pUsdc.grantRole(MINTER_ROLE, deployer.address, { gasLimit: 1000000 });
    await grantTx.wait();

    const amount = ethers.parseUnits("1000", 6);
    const results = [];

    // --- Regular ERC20 Measurements ---
    console.log("\n--- Regular ERC20 Measurements ---");

    // Mint
    const usdcMintTx = await usdc.mint(recipient.address, amount, { gasLimit: 1000000 });
    const usdcMintReceipt = await usdcMintTx.wait();
    console.log(`🔹 Mint Gas Used: ${usdcMintReceipt.gasUsed.toString()}`);
    results.push({ operation: "Regular ERC20 Mint", gasUsed: usdcMintReceipt.gasUsed });

    // Transfer (Need balance first, deployer mints to itself)
    await usdc.mint(deployer.address, amount, { gasLimit: 1000000 });
    const usdcTransferTx = await usdc.transfer(recipient.address, amount, { gasLimit: 1000000 });
    const usdcTransferReceipt = await usdcTransferTx.wait();
    console.log(`🔹 Transfer Gas Used: ${usdcTransferReceipt.gasUsed.toString()}`);
    results.push({ operation: "Regular ERC20 Transfer", gasUsed: usdcTransferReceipt.gasUsed });

    // --- Private ERC20 Measurements ---
    console.log("\n--- Private ERC20 Measurements ---");

    // Mint (Public value version)
    // Note: mint(address, uint256) is available if publicAmountsEnabled is true
    const pUsdcMintTx = await pUsdc["mint(address,uint256)"](recipient.address, amount, { gasLimit: 5000000 });
    const pUsdcMintReceipt = await pUsdcMintTx.wait();
    console.log(`🔹 Mint Gas Used: ${pUsdcMintReceipt.gasUsed.toString()}`);
    results.push({ operation: "Private ERC20 Mint", gasUsed: pUsdcMintReceipt.gasUsed });

    // Transfer (Public value version)
    // Need balance for deployer
    await pUsdc["mint(address,uint256)"](deployer.address, amount, { gasLimit: 5000000 });
    const pUsdcTransferTx = await pUsdc["transfer(address,uint256)"](recipient.address, amount, { gasLimit: 5000000 });
    const pUsdcTransferReceipt = await pUsdcTransferTx.wait();
    console.log(`🔹 Transfer Gas Used: ${pUsdcTransferReceipt.gasUsed.toString()}`);
    results.push({ operation: "Private ERC20 Transfer", gasUsed: pUsdcTransferReceipt.gasUsed });

    // --- Summary ---
    console.log("\n📋 Gas Usage Summary:");
    console.table(results);

    // Calculate Ratios
    const mintRatio = (Number(pUsdcMintReceipt.gasUsed) / Number(usdcMintReceipt.gasUsed)).toFixed(2);
    const transferRatio = (Number(pUsdcTransferReceipt.gasUsed) / Number(usdcTransferReceipt.gasUsed)).toFixed(2);

    console.log(`\n📈 Comparison:`);
    console.log(`- Private Mint is ${mintRatio}x more expensive than Regular Mint`);
    console.log(`- Private Transfer is ${transferRatio}x more expensive than Regular Transfer`);

    // --- Save Report ---
    const reportPath = path.join(__dirname, "../../docs/gas_comparison.md");
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportContent = `# Gas Comparison Report: Private ERC20 vs Regular ERC20

## Summary
This report compares the gas consumption of \`mint\` and \`transfer\` operations between a regular ERC20 token (\`USDCe\`) and a Private ERC20 token (\`PrivateBridgedUSDC\`) on the COTI Testnet.

## Results
| Operation | Regular ERC20 | Private ERC20 | Multiplier |
| :--- | :--- | :--- | :--- |
| **Mint** | ${usdcMintReceipt.gasUsed.toString()} | ${pUsdcMintReceipt.gasUsed.toString()} | **${mintRatio}x** |
| **Transfer** | ${usdcTransferReceipt.gasUsed.toString()} | ${pUsdcTransferReceipt.gasUsed.toString()} | **${transferRatio}x** |

## Instructions to Run This Report
To regenerate this report, follow these steps:

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set Up Environment Variables**:
   Ensure your \`.env\` file in the root or \`contracts/.env\` contains the necessary \`PRIVATE_KEY\` for the COTI Testnet.

3. **Run the Comparison Script**:
   Execute the following command:
   \`\`\`bash
   npx hardhat run contracts/scripts/compare_gas_usage.cjs --network cotiTestnet
   \`\`\`

The results will be printed to the console and updated in this file (\`docs/gas_comparison.md\`).

---
*Report generated on: ${new Date().toISOString()}*
`;

    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n✅ Report saved to: ${reportPath}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
