try {
  const hre = require("hardhat");
  console.log("Hardhat required successfully.");
  hre.run("run", { script: "fix_fee_real.js", noCompile: true }).catch(console.error);
} catch (e) {
  console.error("Hardhat error:", e);
}
