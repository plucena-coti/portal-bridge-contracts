const hre = require("hardhat");

async function main() {
    const targetAddress = "0xdF9F8FcA4591227C092FCBAb45A846C19fb6d1ae";
    const amountToMint = "100000";

    const mocks = [
        { symbol: "WETH", address: "0x8bca4e6bbE402DB4aD189A316137aD08206154FB", decimals: 18, contractName: "WETH9" },
        { symbol: "WBTC", address: "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492", decimals: 8, contractName: "WBTC" },
        { symbol: "USDT", address: "0x9e961430053cd5AbB3b060544cEcCec848693Cf0", decimals: 6, contractName: "USDT" },
        { symbol: "USDC.e", address: "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C", decimals: 6, contractName: "USDCe" },
        { symbol: "WADA", address: "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D", decimals: 6, contractName: "WADA" },
        { symbol: "gCOTI", address: "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C", decimals: 18, contractName: "gCOTI" }
    ];

    console.log(`Minting ${amountToMint} of each mock to ${targetAddress}...`);

    for (const mock of mocks) {
        console.log(`Minting ${mock.symbol}...`);
        
        // try finding the correct ABI if not one of these specific ones
        let abi = [
            "function mint(address to, uint256 amount) public returns (bool)",
            "function deposit() public payable",
            "function transfer(address to, uint256 amount) public returns (bool)"
        ];
        
        let token;
        try {
             token = await hre.ethers.getContractAt(mock.contractName, mock.address);
        } catch {
             token = await hre.ethers.getContractAt(abi, mock.address);
        }
        
        let amountWei;
        try {
            amountWei = hre.ethers.parseUnits(amountToMint, mock.decimals);
        } catch(e) {
            console.error("error parsing unit", e);
            continue;
        }

        try {
            if (mock.symbol === "WETH") {
                 const tx = await token.deposit({ value: amountWei });
                 console.log(`   Deposit Tx hash: ${tx.hash}`);
                 await tx.wait();
                 const tx2 = await token.transfer(targetAddress, amountWei);
                 await tx2.wait();
                 console.log(`   Success WETH deposit & transfer!`);
                 continue;
            }
            const tx = await token.mint(targetAddress, amountWei, { gasLimit: 5000000 });
            console.log(`   Tx hash: ${tx.hash}`);
            await tx.wait();
            console.log(`   Success!`);
        } catch (error) {
            console.error(`   Failed to mint ${mock.symbol}:`, error.message);
        }
    }
}

main().catch(console.error);
