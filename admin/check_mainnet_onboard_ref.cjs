const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://mainnet.coti.io/rpc");
    const P_COTI = "0x953d2c8a84B9a85743Ba53dCa7789De68653be01";

    // Attempt to read 'accountOnboard' or similar property if standard PrivateERC20
    // Standard PrivateERC20 usually stores it or uses a global registry?
    // Actually, looking at PrivateERC20.sol codebase (viewed way back or standard coti-contracts repo),
    // it usually imports MpcCore variables or has an initializer.
    // Let's try to guess common getter names or just check slots if needed.
    // simpler: try calling 'accountOnboard()'

    const contract = new ethers.Contract(P_COTI, ["function accountOnboard() view returns (address)"], provider);

    try {
        const addr = await contract.accountOnboard();
        console.log(`p.COTI uses AccountOnboard: ${addr}`);
        const EXPECTED = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095"; // from tokens.json
        if (addr.toLowerCase() === EXPECTED.toLowerCase()) {
            console.log("✅ Mainnet Contracts use correct Onboard Address.");
        } else {
            console.log("❌ MISMATCH! PrivateERC20 uses different Onboard Contract.");
        }
    } catch (e) {
        console.log("❌ Could not read accountOnboard():", e.message);
    }
}

main().catch(console.error);
