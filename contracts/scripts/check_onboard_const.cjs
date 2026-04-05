const { ONBOARD_CONTRACT_ADDRESS } = require('@coti-io/coti-ethers');

console.log("Coti Ethers Default Onboard Contract:", ONBOARD_CONTRACT_ADDRESS);
console.log("My Hardcoded Address:              ", "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095");

if (ONBOARD_CONTRACT_ADDRESS.toLowerCase() === "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095".toLowerCase()) {
    console.log("✅ MATCH");
} else {
    console.log("❌ MISMATCH");
}
