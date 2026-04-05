const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Minting with signer:", signer.address);

    const P_COTI_ADDRESS = "0x143705349957A236d74e0aDb5673F880fEDB101f";
    const RECIPIENT = "0x0B21Bc1A3d99c02B5bD5925C8A783681c6c73D76";
    const AMOUNT = ethers.parseUnits("100000", 18); // 100,000 * 10^18

    const pCoti = await ethers.getContractAt("contracts/privateERC20/PrivateERC20.sol:PrivateERC20", P_COTI_ADDRESS, signer);

    console.log(`Minting ${ethers.formatUnits(AMOUNT, 18)} p.COTI to ${RECIPIENT}...`);

    // Override gas to be safe on Mainnet
    const tx = await pCoti.mint(RECIPIENT, AMOUNT, {
        gasLimit: 2000000,
        gasPrice: ethers.parseUnits("30", "gwei")
    });

    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ Mint Successful");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
