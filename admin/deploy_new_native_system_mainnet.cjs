const { ethers, network } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Redeploying Native System on Mainnet with account:", deployer.address);
    console.log("Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // 1. Deploy new PrivateCoti
    console.log("\n1️⃣  Deploying PrivateCoti (New Instance)...");
    const PrivateCoti = await ethers.getContractFactory("contracts/privateERC20/tokens/PrivateCoti.sol:PrivateCoti");
    const privateCoti = await PrivateCoti.deploy({
        gasLimit: 6000000,
        gasPrice: ethers.parseUnits("35", "gwei")
    });
    await privateCoti.waitForDeployment();
    const pCotiAddress = await privateCoti.getAddress();
    console.log("✅ PrivateCoti deployed to:", pCotiAddress);

    // 2. Deploy new PrivacyBridgeCotiNative
    console.log("\n2️⃣  Deploying PrivacyBridgeCotiNative...");
    const PrivacyBridge = await ethers.getContractFactory("contracts/privateERC20/privacyBridge/PrivacyBridgeCotiNative.sol:PrivacyBridgeCotiNative");
    const bridge = await PrivacyBridge.deploy(pCotiAddress, {
        gasLimit: 6000000,
        gasPrice: ethers.parseUnits("35", "gwei")
    });
    await bridge.waitForDeployment();
    const bridgeAddress = await bridge.getAddress();
    console.log("✅ PrivacyBridgeCotiNative deployed to:", bridgeAddress);

    // 3. Grant MINTER_ROLE
    console.log("\n3️⃣  Granting MINTER_ROLE to Bridge...");
    // Get MINTER_ROLE hash (Public constant or keccak)
    let MINTER_ROLE;
    try {
        MINTER_ROLE = await privateCoti.MINTER_ROLE();
    } catch {
        MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    }

    const tx = await privateCoti.grantRole(MINTER_ROLE, bridgeAddress, {
        gasLimit: 200000,
        gasPrice: ethers.parseUnits("35", "gwei")
    });
    console.log("Grant Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ MINTER_ROLE granted successfully");

    console.log("\n🎉 Deployment Complete!");
    console.log("----------------------------------------------------");
    console.log(`PrivateCoti:             "${pCotiAddress}"`);
    console.log(`PrivacyBridgeCotiNative: "${bridgeAddress}"`);
    console.log("----------------------------------------------------");
    console.log("👉 Please update config.ts with these new addresses.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
