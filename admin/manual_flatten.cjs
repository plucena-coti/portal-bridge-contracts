const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Starting programmatic flatten...");
    try {
        // Try using hardhat's builtin flatten task
        const flattened = await hre.run("flatten:get-flattened-sources", {
            files: ["contracts/token/PrivateERC20/tokens/PrivateCOTI.sol"]
        });
        fs.writeFileSync("PrivateCOTI_flat.sol", flattened);
        console.log("Successfully flattened to PrivateCOTI_flat.sol!");
    } catch (e) {
        console.error("Failed to flatten via Hardhat API:", e.message);
    }
}

main().catch(console.error);
