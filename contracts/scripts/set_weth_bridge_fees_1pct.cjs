const hre = require("hardhat");
const { ethers } = hre;

// PrivacyBridgeWETH on testnet (from config.ts)
const WETH_BRIDGE_ADDRESS = "0x0D50cCb9D6a166BaB32906fc43Fc44cc32Ff4a7D";

// FEE_DIVISOR = 1_000_000 → 1% = 10_000 basis points
const FEE_BPS = 10000n;

const BRIDGE_ABI = [
  "function setDepositFee(uint256 _feeBasisPoints) external",
  "function setWithdrawFee(uint256 _feeBasisPoints) external",
  "function depositFeeBasisPoints() external view returns (uint256)",
  "function withdrawFeeBasisPoints() external view returns (uint256)",
  "function FEE_DIVISOR() external view returns (uint256)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`Signer: ${signer.address}`);
  console.log(`Bridge: ${WETH_BRIDGE_ADDRESS}`);

  const bridge = new ethers.Contract(WETH_BRIDGE_ADDRESS, BRIDGE_ABI, signer);

  // Read current values first
  const divisor = await bridge.FEE_DIVISOR();
  const currentDeposit = await bridge.depositFeeBasisPoints();
  const currentWithdraw = await bridge.withdrawFeeBasisPoints();
  console.log(`\nFEE_DIVISOR: ${divisor}`);
  console.log(`Current deposit fee: ${currentDeposit} bps (${Number(currentDeposit) / Number(divisor) * 100}%)`);
  console.log(`Current withdraw fee: ${currentWithdraw} bps (${Number(currentWithdraw) / Number(divisor) * 100}%)`);

  // Set 1% deposit fee
  console.log(`\nSetting deposit fee to ${FEE_BPS} bps (1%)...`);
  const tx1 = await bridge.setDepositFee(FEE_BPS, { gasLimit: 5000000 });
  console.log(`  tx: ${tx1.hash}`);
  await tx1.wait();
  console.log(`  ✅ Done`);

  // Set 1% withdraw fee
  console.log(`Setting withdraw fee to ${FEE_BPS} bps (1%)...`);
  const tx2 = await bridge.setWithdrawFee(FEE_BPS, { gasLimit: 5000000 });
  console.log(`  tx: ${tx2.hash}`);
  await tx2.wait();
  console.log(`  ✅ Done`);

  // Confirm new values
  const newDeposit = await bridge.depositFeeBasisPoints();
  const newWithdraw = await bridge.withdrawFeeBasisPoints();
  console.log(`\n✅ New deposit fee:  ${newDeposit} bps (${Number(newDeposit) / Number(divisor) * 100}%)`);
  console.log(`✅ New withdraw fee: ${newWithdraw} bps (${Number(newWithdraw) / Number(divisor) * 100}%)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
