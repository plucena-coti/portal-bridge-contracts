const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIV_WETH_ADDR = "0xF3F5723Ae1609AfCCc7CCA0D1169d091789CDd28";
    const BRIDGE_WETH_ADDR = "0x4B24959C2b23CE6a90e4b536f4C736F7b0ebC38f";

    // MINTER_ROLE = keccak256("MINTER_ROLE")
    // = 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

    const pWeth = await ethers.getContractAt("PrivateWrappedEther", PRIV_WETH_ADDR);

    console.log(`Checking role for Bridge: ${BRIDGE_WETH_ADDR}`);
    const hasRole = await pWeth.hasRole(MINTER_ROLE, BRIDGE_WETH_ADDR);

    console.log(`Has MINTER_ROLE: ${hasRole}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
