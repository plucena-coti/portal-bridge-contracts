"use strict";

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

/**
 * SimulateFee Tests
 * Tests the simulateFee() view function on PrivacyBridge contracts.
 * Runs against COTI testnet using deployed bridges with live oracle prices.
 */

describe("SimulateFee Tests", function () {
    this.timeout(600000); // 10 minutes

    before(function () {
        const networkName = hre.network.name;
        if (networkName !== "cotiTestnet" && networkName !== "hardhat") {
            throw new Error(
                `These tests must run on cotiTestnet or hardhat network (current: ${networkName}).`
            );
        }
    });

    let owner;
    let nativeBridge, wethBridge, mockOracle;

    const addr = async (contract) =>
        contract.getAddress ? contract.getAddress() : Promise.resolve(contract.address);

    before(async function () {
        const signers = await ethers.getSigners();
        owner = signers[0];
        console.log("\n===========================================================");
        console.log("STARTING SIMULATE FEE TESTS");
        console.log("Deployer:", owner.address);
        console.log("===========================================================\n");

        // Deploy mock oracle
        const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
        mockOracle = await OracleFactory.deploy({ gasLimit: 12000000 });
        await (mockOracle.waitForDeployment ? mockOracle.waitForDeployment() : mockOracle.deployed());
        // COTI at $0.05, ETH at $2300
        await mockOracle.setCotiPrice(ethers.parseEther("0.05"), { gasLimit: 2000000 });
        await mockOracle.setPrice("ETH", ethers.parseEther("2300"), { gasLimit: 2000000 });
        const currentBlock = await ethers.provider.getBlock("latest");
        await mockOracle.setLastUpdated(currentBlock.timestamp, { gasLimit: 2000000 });

        // Deploy native bridge
        const chainId = (await ethers.provider.getNetwork()).chainId;
        let privateCoti;
        if (chainId === 7082400n) {
            privateCoti = await ethers.getContractAt("PrivateCOTI", "0x03eeA59b1F0Dfeaece75531b27684DD882f79759");
        } else {
            const F = await ethers.getContractFactory("PrivateERC20Mock");
            privateCoti = await F.deploy({ gasLimit: 12000000 });
            await (privateCoti.waitForDeployment ? privateCoti.waitForDeployment() : privateCoti.deployed());
        }

        const NativeBridgeFactory = await ethers.getContractFactory("PrivacyBridgeCotiNative");
        nativeBridge = await NativeBridgeFactory.deploy(await addr(privateCoti), owner.address, owner.address, { gasLimit: 30000000 });
        await (nativeBridge.waitForDeployment ? nativeBridge.waitForDeployment() : nativeBridge.deployed());
        await nativeBridge.setPriceOracle(await addr(mockOracle), { gasLimit: 2000000 });

        // Deploy ERC20 bridge (WETH)
        let publicToken, privateToken;
        if (chainId === 7082400n) {
            publicToken = await ethers.getContractAt("ERC20Mock", "0x8bca4e6bbE402DB4aD189A316137aD08206154FB");
            privateToken = await ethers.getContractAt("PrivateWrappedEther", "0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c");
        } else {
            publicToken = await (await ethers.getContractFactory("ERC20Mock")).deploy("WETH", "WETH", 18, { gasLimit: 12000000 });
            await (publicToken.waitForDeployment ? publicToken.waitForDeployment() : publicToken.deployed());
            privateToken = await (await ethers.getContractFactory("PrivateERC20Mock")).deploy({ gasLimit: 12000000 });
            await (privateToken.waitForDeployment ? privateToken.waitForDeployment() : privateToken.deployed());
        }

        const WethBridgeFactory = await ethers.getContractFactory("PrivacyBridgeWETH");
        wethBridge = await WethBridgeFactory.deploy(await addr(publicToken), await addr(privateToken), owner.address, owner.address, { gasLimit: 12000000 });
        await (wethBridge.waitForDeployment ? wethBridge.waitForDeployment() : wethBridge.deployed());
        await wethBridge.setPriceOracle(await addr(mockOracle), { gasLimit: 2000000 });

        await new Promise(r => setTimeout(r, 5000));
    });

    // ─────────────────────────────────────────────────────────────────────────
    // NATIVE BRIDGE — simulateFee with "COTI" symbol
    // ─────────────────────────────────────────────────────────────────────────

    it("simulateFee: native COTI — floor dominates for small amount", async function () {
        // 100 COTI at $0.05 → pctFee = 0.05 COTI → fee = max(10, 0.05) = 10 COTI
        const fee = await nativeBridge.simulateFee(
            ethers.parseEther("100"),   // amount
            ethers.parseEther("10"),    // fixedFee
            500n,                       // percentageBps (0.05%)
            ethers.parseEther("3000"),  // maxFee
            "COTI",                     // tokenSymbol
            18                          // tokenDecimals
        );
        console.log(`    [Info] simulateFee(100 COTI, default params): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("10"));
    });

    it("simulateFee: native COTI — percentage dominates for large amount", async function () {
        // 1,000,000 COTI at $0.05 → pctFee = 500 COTI → fee = max(10, 500) = 500 COTI
        const fee = await nativeBridge.simulateFee(
            ethers.parseEther("1000000"),
            ethers.parseEther("10"),
            500n,
            ethers.parseEther("3000"),
            "COTI",
            18
        );
        console.log(`    [Info] simulateFee(1M COTI, default params): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("500"));
    });

    it("simulateFee: native COTI — max fee cap applies", async function () {
        // 100,000,000 COTI at $0.05 → pctFee = 50,000 COTI → fee = min(50000, 3000) = 3000 COTI
        const fee = await nativeBridge.simulateFee(
            ethers.parseEther("100000000"),
            ethers.parseEther("10"),
            500n,
            ethers.parseEther("3000"),
            "COTI",
            18
        );
        console.log(`    [Info] simulateFee(100M COTI, default params): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("3000"));
    });

    it("simulateFee: native COTI — custom high fixed fee", async function () {
        // fixedFee = 50 COTI, amount = 100 COTI → pctFee = 0.05 COTI → fee = max(50, 0.05) = 50
        const fee = await nativeBridge.simulateFee(
            ethers.parseEther("100"),
            ethers.parseEther("50"),    // high fixed fee
            500n,
            ethers.parseEther("3000"),
            "COTI",
            18
        );
        console.log(`    [Info] simulateFee(100 COTI, fixedFee=50): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("50"));
    });

    it("simulateFee: native COTI — custom low max fee", async function () {
        // maxFee = 100 COTI, amount = 1M COTI → pctFee = 500 COTI → fee = min(500, 100) = 100
        const fee = await nativeBridge.simulateFee(
            ethers.parseEther("1000000"),
            ethers.parseEther("10"),
            500n,
            ethers.parseEther("100"),   // low max fee
            "COTI",
            18
        );
        console.log(`    [Info] simulateFee(1M COTI, maxFee=100): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("100"));
    });

    it("simulateFee: native COTI — custom high percentage", async function () {
        // percentageBps = 10000 (1%), amount = 1000 COTI → pctFee = 10 COTI → fee = max(3, 10) = 10
        const fee = await nativeBridge.simulateFee(
            ethers.parseEther("1000"),
            ethers.parseEther("3"),
            10000n,                     // 1%
            ethers.parseEther("1500"),
            "COTI",
            18
        );
        console.log(`    [Info] simulateFee(1000 COTI, pct=1%): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("10"));
    });

    it("simulateFee: native COTI — zero percentage means floor always wins", async function () {
        // percentageBps = 0, amount = 1M COTI → pctFee = 0 → fee = max(10, 0) = 10
        const fee = await nativeBridge.simulateFee(
            ethers.parseEther("1000000"),
            ethers.parseEther("10"),
            0n,                         // 0%
            ethers.parseEther("3000"),
            "COTI",
            18
        );
        console.log(`    [Info] simulateFee(1M COTI, pct=0%): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("10"));
    });

    // ─────────────────────────────────────────────────────────────────────────
    // ERC20 BRIDGE — simulateFee with "ETH" symbol (18 decimals)
    // ─────────────────────────────────────────────────────────────────────────

    it("simulateFee: WETH — percentage dominates (10 WETH)", async function () {
        // 10 WETH at $2300 = $23,000 → pctFee = $11.50 → 230 COTI → fee = max(10, 230) = 230
        const fee = await wethBridge.simulateFee(
            ethers.parseEther("10"),
            ethers.parseEther("10"),
            500n,
            ethers.parseEther("3000"),
            "ETH",
            18
        );
        console.log(`    [Info] simulateFee(10 WETH, default params): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("230"));
    });

    it("simulateFee: WETH — max fee cap (1000 WETH)", async function () {
        // 1000 WETH at $2300 = $2.3M → pctFee = $1150 → 23,000 COTI → fee = min(23000, 3000) = 3000
        const fee = await wethBridge.simulateFee(
            ethers.parseEther("1000"),
            ethers.parseEther("10"),
            500n,
            ethers.parseEther("3000"),
            "ETH",
            18
        );
        console.log(`    [Info] simulateFee(1000 WETH, default params): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("3000"));
    });

    it("simulateFee: WETH — floor dominates for tiny amount (0.001 WETH)", async function () {
        // 0.001 WETH at $2300 = $2.30 → pctFee = $0.00115 → 0.023 COTI → fee = max(10, 0.023) = 10
        const fee = await wethBridge.simulateFee(
            ethers.parseEther("0.001"),
            ethers.parseEther("10"),
            500n,
            ethers.parseEther("3000"),
            "ETH",
            18
        );
        console.log(`    [Info] simulateFee(0.001 WETH, default params): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("10"));
    });

    it("simulateFee: WETH — withdraw params (lower pct, lower cap)", async function () {
        // 10 WETH at $2300 = $23,000 → pctFee(0.025%) = $5.75 → 115 COTI → fee = max(3, 115) = 115
        const fee = await wethBridge.simulateFee(
            ethers.parseEther("10"),
            ethers.parseEther("3"),     // withdraw fixed
            250n,                       // withdraw pct (0.025%)
            ethers.parseEther("1500"),  // withdraw max
            "ETH",
            18
        );
        console.log(`    [Info] simulateFee(10 WETH, withdraw params): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("115"));
    });

    it("simulateFee: matches estimateDepositFee on native bridge", async function () {
        const amount = ethers.parseEther("5000");
        const [estimatedFee] = await nativeBridge.estimateDepositFee(amount);
        const simulatedFee = await nativeBridge.simulateFee(
            amount,
            ethers.parseEther("10"),
            500n,
            ethers.parseEther("3000"),
            "COTI",
            18
        );
        console.log(`    [Info] estimateDepositFee: ${ethers.formatEther(estimatedFee)}, simulateFee: ${ethers.formatEther(simulatedFee)}`);
        expect(simulatedFee).to.equal(estimatedFee);
    });

    it("simulateFee: matches estimateDepositFee on ERC20 bridge", async function () {
        const amount = ethers.parseEther("10");
        const [estimatedFee] = await wethBridge.estimateDepositFee(amount);
        const simulatedFee = await wethBridge.simulateFee(
            amount,
            ethers.parseEther("10"),
            500n,
            ethers.parseEther("3000"),
            "ETH",
            18
        );
        console.log(`    [Info] estimateDepositFee: ${ethers.formatEther(estimatedFee)}, simulateFee: ${ethers.formatEther(simulatedFee)}`);
        expect(simulatedFee).to.equal(estimatedFee);
    });

    it("simulateFee: matches estimateWithdrawFee on native bridge", async function () {
        const amount = ethers.parseEther("5000");
        const [estimatedFee] = await nativeBridge.estimateWithdrawFee(amount);
        const simulatedFee = await nativeBridge.simulateFee(
            amount,
            ethers.parseEther("3"),
            250n,
            ethers.parseEther("1500"),
            "COTI",
            18
        );
        console.log(`    [Info] estimateWithdrawFee: ${ethers.formatEther(estimatedFee)}, simulateFee: ${ethers.formatEther(simulatedFee)}`);
        expect(simulatedFee).to.equal(estimatedFee);
    });

    it("simulateFee: fixedFee equals maxFee means flat fee always", async function () {
        // fixedFee = maxFee = 25 COTI → fee is always 25 regardless of amount
        const fee = await nativeBridge.simulateFee(
            ethers.parseEther("999999"),
            ethers.parseEther("25"),
            500n,
            ethers.parseEther("25"),    // maxFee = fixedFee
            "COTI",
            18
        );
        console.log(`    [Info] simulateFee(flat fee=25): ${ethers.formatEther(fee)} COTI`);
        expect(fee).to.equal(ethers.parseEther("25"));
    });
});
