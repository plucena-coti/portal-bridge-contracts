const { ethers, Wallet } = require("ethers");
require("dotenv").config();

async function main() {
    const pk = process.env.PRIVATE_KEY || process.env.USER_PRIVATE_KEY;
    if (!pk) throw new Error("Key missing");

    const provider = new ethers.JsonRpcProvider("https://mainnet.coti.io/rpc");
    const wallet = new Wallet(pk, provider);

    // p.WETH Mainnet Address
    const P_WETH = "0x3bAa998a77B4ED5D3e3d6BcD388D6A6859ed8E0C";

    console.log(`Checking p.WETH at ${P_WETH}`);
    console.log(`User: ${wallet.address}`);

    const contract = new ethers.Contract(P_WETH, [
        "function name() view returns (string)",
        "function accountOnboard() view returns (address)",
        "function getMyBalance() view returns (uint64)"
    ], wallet);

    // 1. Basic Read
    try {
        const name = await contract.name();
        console.log(`✅ Name: ${name}`);
    } catch (e) {
        console.log(`❌ Name failed: ${e.code}`);
    }

    // 2. Dependency Check
    try {
        const onboard = await contract.accountOnboard();
        console.log(`✅ AccountOnboard: ${onboard}`);
        if (onboard.toLowerCase() === "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095".toLowerCase()) {
            console.log("   (Matches known Onboard Contract)");
        } else {
            console.log("   ⚠️ MISMATCH! Known is 0x536...");
        }
    } catch (e) {
        console.log(`❌ AccountOnboard check failed: ${e.code}`);
    }

    // 3. MPC View
    // Note: this might fail if script wallet is not onboarded? 
    // But we know verify_aes_key worked for this user (Wait, verify_aes_key used correct key recovery).
    // If we just call getMyBalance, we see if it reverts.

    try {
        console.log("Attempting getMyBalance...");
        // We set a high gas limit for view to emulate MPC gas needs
        // ethers v6 call options
        const result = await contract.getMyBalance({ gasLimit: 10000000 });
        console.log(`✅ getMyBalance Result: ${result}`);
    } catch (e) {
        console.log(`❌ getMyBalance failed: ${e.info?.error?.message || e.message}`);
        // console.log(e);
    }
}

main().catch(console.error);
