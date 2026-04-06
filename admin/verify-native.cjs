const hre = require("hardhat");

async function main() {
    const addr = "0x0dAF540a7627cD298a7dbaEC179598B5bbDaf532";
    const code = await hre.ethers.provider.getCode(addr);
    console.log("Code length:", code.length);

    if (code.length > 2) {
        try {
            const bridge = await hre.ethers.getContractAt("PrivacyBridgeCotiNative", addr);
            const owner = await bridge.owner();
            console.log("Owner:", owner);
            const depositFee = await bridge.depositFeeBasisPoints();
            console.log("Deposit Fee BP:", depositFee.toString());
        } catch (e) {
            console.log("Error calling contract:", e.message);
        }
    } else {
        console.log("No contract at address");
    }
}

main().catch(console.error);
