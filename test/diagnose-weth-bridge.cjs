"use strict";

const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
    console.log("\n=== WETH Bridge Diagnostic ===\n");
    
    const signers = await ethers.getSigners();
    const owner = signers[0];
    
    console.log("Network:", hre.network.name);
    console.log("Owner address:", owner.address);
    
    // Contract addresses on testnet
    const WETH_ADDRESS = "0x160Bc17BBba05CF3B85115F1022F33DEFA74bd62";
    const PRIVATE_WETH_ADDRESS = "0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c";
    const BRIDGE_ADDRESS = "0x8DA53232f5d76316a2B5091415314C9Cb8E8F04c";
    
    // Get contract instances
    const weth = await ethers.getContractAt("WETH9", WETH_ADDRESS);
    const privateWeth = await ethers.getContractAt("PrivateWrappedEther", PRIVATE_WETH_ADDRESS);
    const bridge = await ethers.getContractAt("PrivacyBridgeWETH", BRIDGE_ADDRESS);
    
    // Check WETH balance
    const wethBalance = await weth.balanceOf(owner.address);
    console.log("\nWETH Balance:", ethers.formatEther(wethBalance), "WETH");
    
    // Check allowance
    const allowance = await weth.allowance(owner.address, BRIDGE_ADDRESS);
    console.log("WETH Allowance to bridge:", ethers.formatEther(allowance), "WETH");
    
    // Check bridge configuration
    try {
        const depositFeeBasisPoints = await bridge.depositFeeBasisPoints();
        console.log("\nBridge deposit fee:", depositFeeBasisPoints.toString(), "(basis points)");
    } catch (e) {
        console.log("\nBridge deposit fee: Unable to read");
    }
    
    const nativeFee = await bridge.nativeCotiFee();
    console.log("Bridge native COTI fee:", ethers.formatEther(nativeFee), "COTI");
    
    const accumulatedFees = await bridge.accumulatedFees();
    console.log("Bridge accumulated fees:", ethers.formatEther(accumulatedFees), "WETH");
    
    // Check if bridge has MINTER_ROLE on private token
    const toBytes = ethers.toUtf8Bytes || (ethers.utils && ethers.utils.toUtf8Bytes);
    const keccak = ethers.keccak256 || (ethers.utils && ethers.utils.keccak256);
    const MINTER_ROLE = keccak(toBytes("MINTER_ROLE"));
    
    const hasMinterRole = await privateWeth.hasRole(MINTER_ROLE, BRIDGE_ADDRESS);
    console.log("\nBridge has MINTER_ROLE on PrivateWETH:", hasMinterRole);
    
    // Check bridge token addresses
    const bridgeTokenAddr = await bridge.token();
    const bridgePrivateTokenAddr = await bridge.privateToken();
    console.log("\nBridge token address:", bridgeTokenAddr);
    console.log("Expected WETH address:", WETH_ADDRESS);
    console.log("Match:", bridgeTokenAddr.toLowerCase() === WETH_ADDRESS.toLowerCase());
    
    console.log("\nBridge privateToken address:", bridgePrivateTokenAddr);
    console.log("Expected PrivateWETH address:", PRIVATE_WETH_ADDRESS);
    console.log("Match:", bridgePrivateTokenAddr.toLowerCase() === PRIVATE_WETH_ADDRESS.toLowerCase());
    
    // Try to mint some WETH if balance is low
    if (wethBalance < ethers.parseEther("100")) {
        console.log("\n=== Minting WETH ===");
        try {
            const mintTx = await weth.mint(owner.address, ethers.parseEther("1000"), { gasLimit: 2000000 });
            console.log("Mint tx:", mintTx.hash);
            await mintTx.wait();
            console.log("Minted 1000 WETH successfully");
            
            const newBalance = await weth.balanceOf(owner.address);
            console.log("New WETH balance:", ethers.formatEther(newBalance), "WETH");
        } catch (error) {
            console.log("Failed to mint WETH:", error.message);
        }
    }
    
    console.log("\n=== Diagnostic Complete ===\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
