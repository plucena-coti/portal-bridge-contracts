const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Redeploying WADA System on Testnet with account:", deployer.address);

    // Testnet Public WADA Address (from config.ts)
    const PUBLIC_WADA_ADDRESS = "0xAad069A539001920712489C8FF796f1444E7394e";

    // 1. Deploy new PrivateWrappedADA
    console.log("\n1️⃣  Deploying PrivateWrappedADA (New Instance)...");
    const PrivateWrappedADA = await ethers.getContractFactory("contracts/privateERC20/tokens/PrivateWrappedADA.sol:PrivateWrappedADA");
    const privateWada = await PrivateWrappedADA.deploy({
        gasLimit: 6000000,
        gasPrice: ethers.parseUnits("35", "gwei")
    });
    await privateWada.waitForDeployment();
    const pWadaAddress = await privateWada.getAddress();
    console.log("✅ PrivateWrappedADA deployed to:", pWadaAddress);

    // 2. Deploy new PrivacyBridgeWADA
    console.log("\n2️⃣  Deploying PrivacyBridgeWADA...");
    const PrivacyBridgeWADA = await ethers.getContractFactory("contracts/privateERC20/privacyBridge/PrivacyBridgeWADA.sol:PrivacyBridgeWADA");
    const bridge = await PrivacyBridgeWADA.deploy(PUBLIC_WADA_ADDRESS, pWadaAddress, {
        gasLimit: 6000000,
        gasPrice: ethers.parseUnits("35", "gwei")
    });
    await bridge.waitForDeployment();
    const bridgeAddress = await bridge.getAddress();
    console.log("✅ PrivacyBridgeWADA deployed to:", bridgeAddress);

    // 3. Grant MINTER_ROLE
    console.log("\n3️⃣  Granting MINTER_ROLE to Bridge...");
    let MINTER_ROLE;
    try {
        MINTER_ROLE = await privateWada.MINTER_ROLE();
    } catch {
        MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    }

    const tx = await privateWada.grantRole(MINTER_ROLE, bridgeAddress, {
        gasLimit: 300000,
        gasPrice: ethers.parseUnits("35", "gwei")
    });
    console.log("Grant Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ MINTER_ROLE granted successfully");

    console.log("\n🎉 Deployment Complete!");
    console.log("----------------------------------------------------");
    console.log(`PrivateWrappedADA: "${pWadaAddress}"`);
    console.log(`PrivacyBridgeWADA: "${bridgeAddress}"`);
    console.log("----------------------------------------------------");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
