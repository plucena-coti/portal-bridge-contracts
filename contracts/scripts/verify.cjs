
const hre = require("hardhat");

async function main() {
    const pCotiAddress = "0x01253891f22fdf845CF86166bd031865E5109c07";
    const bridgeAddress = "0x16Df6447d978dfa3c384c734B2670B00A293B4A8";

    console.log("Verifying PrivateCoti...");
    try {
        await hre.run("verify:verify", {
            address: pCotiAddress,
            constructorArguments: [],
            network: "cotiTestnet"
        });
        console.log("✅ PrivateCoti verified!");
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("✅ PrivateCoti already verified!");
        } else {
            console.error("❌ PrivateCoti verification failed:", error.message);
        }
    }

    console.log("\nVerifying PrivacyBridgeCotiNative...");
    try {
        await hre.run("verify:verify", {
            address: bridgeAddress,
            constructorArguments: [], // PrivacyBridgeCotiNative has no constructor arguments
            network: "cotiTestnet"
        });
        console.log("✅ PrivacyBridgeCotiNative verified!");
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("✅ PrivacyBridgeCotiNative already verified!");
        } else {
            console.error("❌ PrivacyBridgeCotiNative verification failed:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
