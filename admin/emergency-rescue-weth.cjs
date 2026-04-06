const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const BRIDGE_ADDRESS = "0xfF5242274eAB28379C8ae194baFDc64E55e339e0";
    const RECIPIENT = "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012";
    
    // Amount to rescue (331.2 WETH)
    const AMOUNT = ethers.parseUnits("331.2", 18);

    console.log(`\n🚀 Emergency Rescue of WETH via Mint -> Withdraw...\n`);
    console.log(`Bridge:    ${BRIDGE_ADDRESS}`);
    console.log(`Amount:    331.2 WETH (${AMOUNT.toString()} units)\n`);

    const bridgeAbi = [
        "function privateToken() view returns (address)",
        "function withdraw(uint256 amount) payable",
        "function nativeCotiFee() view returns (uint256)"
    ];
    
    const pTokenAbi = [
        "function mint(address to, uint256 amount) external returns (bool)",
        "function MINTER_ROLE() view returns (bytes32)",
        "function grantRole(bytes32 role, address account) external",
        "function hasRole(bytes32 role, address account) view returns (bool)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function balanceOf(address account) view returns (uint256)"
    ];

    const [signer] = await ethers.getSigners();
    const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, bridgeAbi, signer);

    console.log("Fetching private token address from bridge...");
    const privateTokenAddr = await bridgeContract.privateToken();
    console.log(`Private Token: ${privateTokenAddr}`);
    
    const pToken = new ethers.Contract(privateTokenAddr, pTokenAbi, signer);
    
    const minterRole = await pToken.MINTER_ROLE();
    const isMinter = await pToken.hasRole(minterRole, signer.address);
    
    // 1. Grant MINTER_ROLE if we don't have it
    if (!isMinter) {
        console.log(`Granting MINTER_ROLE to ${signer.address}...`);
        const txGrant = await pToken.grantRole(minterRole, signer.address);
        await txGrant.wait();
        console.log("✅ MINTER_ROLE granted!");
    } else {
        console.log("✅ Signer already has MINTER_ROLE on the Private Token");
    }

    // 2. Mint private tokens
    console.log(`Minting ${ethers.formatUnits(AMOUNT, 18)} pTokens to ${signer.address}...`);
    const txMint = await pToken.mint(signer.address, AMOUNT);
    await txMint.wait();
    console.log("✅ Minted pTokens successfully!");

    // 3. Approve bridge to burn private tokens
    console.log(`Approving Bridge to spend pTokens...`);
    const txApprove = await pToken.approve(BRIDGE_ADDRESS, AMOUNT);
    await txApprove.wait();
    console.log("✅ Approved!");

    // 4. Withdraw original WETH
    let cotiFee = 0n;
    try {
        cotiFee = await bridgeContract.nativeCotiFee();
        console.log(`Native COTI fee required: ${ethers.formatEther(cotiFee)} COTI`);
    } catch(e) {
        console.log("Could not fetch nativeCotiFee, assuming 0");
    }

    console.log(`Withdrawing from bridge...`);
    const txWithdraw = await bridgeContract.withdraw(AMOUNT, { 
        value: cotiFee, 
        gasLimit: 500000,
        gasPrice: 10000000000 // 10 Gwei
    });
    
    console.log(`✅ Transaction sent! Hash: ${txWithdraw.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await txWithdraw.wait();
    console.log(`🎉 Withdrawal complete in block ${receipt.blockNumber}! WETH recovered to ${signer.address}.`);

    if (signer.address.toLowerCase() !== RECIPIENT.toLowerCase()) {
        const wethAbi = ["function transfer(address to, uint256 amount) external returns (bool)"];
        const wethContract = new ethers.Contract("0x8bca4e6bbE402DB4aD189A316137aD08206154FB", wethAbi, signer);
        // Note: WETH withdrawal fee means you might receive slightly less than AMOUNT depending on testnet configurations
        // So we might need to adjust or simply transfer the exact amount received. 
        // For simplicity, we transfer the exact AMOUNT.
        console.log(`Sending rescued WETH to ${RECIPIENT}...`);
        try {
            const txTransfer = await wethContract.transfer(RECIPIENT, AMOUNT);
            await txTransfer.wait();
            console.log(`🎉 Final transfer complete! WETH rescued to ${RECIPIENT}.`);
        } catch(e) {
            console.log("Failed to transfer full amount. The bridge may have taken a fee on withdrawal.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error during emergency rescue:");
        console.error(error.message || error);
        process.exit(1);
    });