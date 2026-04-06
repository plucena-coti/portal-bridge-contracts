const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://mainnet.coti.io/rpc");

    const addresses = [
        { name: "p.COTI (Mainnet)", addr: "0x953d2c8a84B9a85743Ba53dCa7789De68653be01" },
        { name: "p.WETH (Mainnet)", addr: "0x3bAa998a77B4ED5D3e3d6BcD388D6A6859ed8E0C" }
    ];

    console.log("Checking Mainnet Contracts...");
    for (const item of addresses) {
        try {
            const code = await provider.getCode(item.addr);
            if (code === "0x") {
                console.log(`❌ ${item.name} at ${item.addr}: NO CODE (Does not exist)`);
            } else {
                console.log(`✅ ${item.name} at ${item.addr}: EXISTS (Code length: ${code.length})`);
            }
        } catch (e) {
            console.error(`❌ Error checking ${item.name}:`, e.message);
        }
    }
}

main().catch(console.error);
