"use strict";

const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Dynamic Fees — Unit Tests
 *
 * Uses local Hardhat network with simple mocks (no MPC precompiles).
 */

const FEE_DIVISOR = 1000000n;
const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

describe("Dynamic Fees — Unit Tests", function () {
  this.timeout(120000);

  // ─────────────────────────────────────────────────────────────────────────
  // 7.1 Default fee parameter values after deployment
  // ─────────────────────────────────────────────────────────────────────────
  describe("7.1 Default fee parameter values", function () {
    let harness;

    before(async function () {
      const Factory = await ethers.getContractFactory("PrivacyBridgeTestHarness");
      harness = await Factory.deploy();
      await harness.waitForDeployment();
    });

    it("depositFixedFee defaults to 10 ether", async function () {
      expect(await harness.depositFixedFee()).to.equal(ethers.parseEther("10"));
    });

    it("depositPercentageBps defaults to 500", async function () {
      expect(await harness.depositPercentageBps()).to.equal(500n);
    });

    it("depositMaxFee defaults to 3000 ether", async function () {
      expect(await harness.depositMaxFee()).to.equal(ethers.parseEther("3000"));
    });

    it("withdrawFixedFee defaults to 3 ether", async function () {
      expect(await harness.withdrawFixedFee()).to.equal(ethers.parseEther("3"));
    });

    it("withdrawPercentageBps defaults to 250", async function () {
      expect(await harness.withdrawPercentageBps()).to.equal(250n);
    });

    it("withdrawMaxFee defaults to 1500 ether", async function () {
      expect(await harness.withdrawMaxFee()).to.equal(ethers.parseEther("1500"));
    });

    it("priceOracle defaults to address(0)", async function () {
      expect(await harness.priceOracle()).to.equal(ethers.ZeroAddress);
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // 7.2 Worked examples from requirements appendix
  // ─────────────────────────────────────────────────────────────────────────
  describe("7.2 Worked examples from requirements appendix", function () {
    let oracle, owner;

    // Helper to deploy an ERC20 bridge with specific decimals and symbol
    async function deployErc20Bridge(decimals, symbol) {
      const TokenFactory = await ethers.getContractFactory("ERC20Mock");
      const publicToken = await TokenFactory.deploy("Token", symbol, decimals);
      await publicToken.waitForDeployment();

      const PrivateFactory = await ethers.getContractFactory("SimplePrivateTokenMock");
      const privateToken = await PrivateFactory.deploy(decimals);
      await privateToken.waitForDeployment();

      const BridgeFactory = await ethers.getContractFactory("PrivacyBridgeERC20TestMock");
      const bridge = await BridgeFactory.deploy(
        await publicToken.getAddress(),
        await privateToken.getAddress(),
        symbol
      );
      await bridge.waitForDeployment();

      await privateToken.grantRole(MINTER_ROLE, await bridge.getAddress());
      await bridge.setPriceOracle(await oracle.getAddress());

      return { bridge, publicToken, privateToken };
    }

    before(async function () {
      [owner] = await ethers.getSigners();

      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      oracle = await OracleFactory.deploy();
      await oracle.waitForDeployment();
    });

    it("20,000 wADA deposit: fee = 204 COTI", async function () {
      // wADA: price $0.255, COTI price $0.0125, decimals 6
      const wadaPrice = ethers.parseEther("0.255");   // 255000000000000000
      const cotiPrice = ethers.parseEther("0.0125");  // 12500000000000000
      await oracle.setPrice("ADA", wadaPrice);
      await oracle.setCotiPrice(cotiPrice);

      const { bridge, publicToken } = await deployErc20Bridge(6, "ADA");

      // 20,000 wADA with 6 decimals = 20000 * 1e6 = 20000000000
      const tokenAmount = 20000n * (10n ** 6n); // 20000000000

      const bridgeAddr = await bridge.getAddress();
      await publicToken.mint(owner.address, tokenAmount);
      await publicToken.approve(bridgeAddr, tokenAmount);

      // Expected fee: 204 COTI
      const expectedFee = ethers.parseEther("204");

      const feesBefore = await bridge.accumulatedCotiFees();
      const tx = await bridge["deposit(uint256)"](tokenAmount, { value: expectedFee + ethers.parseEther("1") });
      await tx.wait();
      const feesAfter = await bridge.accumulatedCotiFees();

      expect(feesAfter - feesBefore).to.equal(expectedFee);
    });

    it("1 WBTC deposit: fee = 3000 COTI (capped at maxFee)", async function () {
      // WBTC: price $76,000, COTI price $0.0125, decimals 8
      const wbtcPrice = ethers.parseEther("76000");
      const cotiPrice = ethers.parseEther("0.0125");
      await oracle.setPrice("WBTC", wbtcPrice);
      await oracle.setCotiPrice(cotiPrice);

      const { bridge, publicToken } = await deployErc20Bridge(8, "WBTC");

      // 1 WBTC with 8 decimals = 100000000
      const tokenAmount = 1n * (10n ** 8n);

      const bridgeAddr = await bridge.getAddress();
      await publicToken.mint(owner.address, tokenAmount);
      await publicToken.approve(bridgeAddr, tokenAmount);

      // Expected fee: 3000 COTI (capped)
      const expectedFee = ethers.parseEther("3000");

      const feesBefore = await bridge.accumulatedCotiFees();
      const tx = await bridge["deposit(uint256)"](tokenAmount, { value: expectedFee + ethers.parseEther("1") });
      await tx.wait();
      const feesAfter = await bridge.accumulatedCotiFees();

      expect(feesAfter - feesBefore).to.equal(expectedFee);
    });

    it("1000 USDC deposit: fee = 40 COTI", async function () {
      // USDC: price $1.00, COTI price $0.0125, decimals 6
      const usdcPrice = ethers.parseEther("1");
      const cotiPrice = ethers.parseEther("0.0125");
      await oracle.setPrice("USDC", usdcPrice);
      await oracle.setCotiPrice(cotiPrice);

      const { bridge, publicToken } = await deployErc20Bridge(6, "USDC");

      // 1000 USDC with 6 decimals = 1000000000
      const tokenAmount = 1000n * (10n ** 6n);

      const bridgeAddr = await bridge.getAddress();
      await publicToken.mint(owner.address, tokenAmount);
      await publicToken.approve(bridgeAddr, tokenAmount);

      // Expected fee: 40 COTI
      const expectedFee = ethers.parseEther("40");

      const feesBefore = await bridge.accumulatedCotiFees();
      const tx = await bridge["deposit(uint256)"](tokenAmount, { value: expectedFee + ethers.parseEther("1") });
      await tx.wait();
      const feesAfter = await bridge.accumulatedCotiFees();

      expect(feesAfter - feesBefore).to.equal(expectedFee);
    });

    it("1 WETH deposit: fee = 92 COTI", async function () {
      // WETH: price $2,300, COTI price $0.0125, decimals 18
      const wethPrice = ethers.parseEther("2300");
      const cotiPrice = ethers.parseEther("0.0125");
      await oracle.setPrice("ETH", wethPrice);
      await oracle.setCotiPrice(cotiPrice);

      const { bridge, publicToken } = await deployErc20Bridge(18, "ETH");

      // 1 WETH with 18 decimals = 1e18
      const tokenAmount = ethers.parseEther("1");

      const bridgeAddr = await bridge.getAddress();
      await publicToken.mint(owner.address, tokenAmount);
      await publicToken.approve(bridgeAddr, tokenAmount);

      // Expected fee: 92 COTI
      const expectedFee = ethers.parseEther("92");

      const feesBefore = await bridge.accumulatedCotiFees();
      const tx = await bridge["deposit(uint256)"](tokenAmount, { value: expectedFee + ethers.parseEther("1") });
      await tx.wait();
      const feesAfter = await bridge.accumulatedCotiFees();

      expect(feesAfter - feesBefore).to.equal(expectedFee);
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // 7.3 Access control
  // ─────────────────────────────────────────────────────────────────────────
  describe("7.3 Access control", function () {
    let harness, owner, operator, nonAuthorized;
    const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));

    before(async function () {
      [owner, operator, nonAuthorized] = await ethers.getSigners();

      const Factory = await ethers.getContractFactory("PrivacyBridgeTestHarness");
      harness = await Factory.deploy();
      await harness.waitForDeployment();

      // Grant operator role to the operator signer
      await harness.addOperator(operator.address);
    });

    it("operator can call setDepositDynamicFee", async function () {
      await expect(
        harness.connect(operator).setDepositDynamicFee(
          ethers.parseEther("5"), 300n, ethers.parseEther("2000")
        )
      ).to.not.be.reverted;
    });

    it("operator can call setWithdrawDynamicFee", async function () {
      await expect(
        harness.connect(operator).setWithdrawDynamicFee(
          ethers.parseEther("2"), 100n, ethers.parseEther("1000")
        )
      ).to.not.be.reverted;
    });

    it("non-authorized caller cannot call setDepositDynamicFee", async function () {
      await expect(
        harness.connect(nonAuthorized).setDepositDynamicFee(
          ethers.parseEther("5"), 300n, ethers.parseEther("2000")
        )
      ).to.be.reverted;
    });

    it("non-authorized caller cannot call setWithdrawDynamicFee", async function () {
      await expect(
        harness.connect(nonAuthorized).setWithdrawDynamicFee(
          ethers.parseEther("2"), 100n, ethers.parseEther("1000")
        )
      ).to.be.reverted;
    });

    it("owner can call setPriceOracle", async function () {
      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      const oracle = await OracleFactory.deploy();
      await oracle.waitForDeployment();

      await expect(
        harness.connect(owner).setPriceOracle(await oracle.getAddress())
      ).to.not.be.reverted;
    });

    it("non-owner cannot call setPriceOracle", async function () {
      await expect(
        harness.connect(nonAuthorized).setPriceOracle(nonAuthorized.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("operator (non-owner) cannot call setPriceOracle", async function () {
      await expect(
        harness.connect(operator).setPriceOracle(operator.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // 7.4 Event emission
  // ─────────────────────────────────────────────────────────────────────────
  describe("7.4 Event emission", function () {
    let harness, owner;

    before(async function () {
      [owner] = await ethers.getSigners();

      const Factory = await ethers.getContractFactory("PrivacyBridgeTestHarness");
      harness = await Factory.deploy();
      await harness.waitForDeployment();
    });

    it("setDepositDynamicFee emits DynamicFeeUpdated with correct parameters", async function () {
      const fixedFee = ethers.parseEther("15");
      const bps = 600n;
      const maxFee = ethers.parseEther("5000");

      await expect(harness.setDepositDynamicFee(fixedFee, bps, maxFee))
        .to.emit(harness, "DynamicFeeUpdated")
        .withArgs("deposit", fixedFee, bps, maxFee);
    });

    it("setWithdrawDynamicFee emits DynamicFeeUpdated with correct parameters", async function () {
      const fixedFee = ethers.parseEther("5");
      const bps = 300n;
      const maxFee = ethers.parseEther("2000");

      await expect(harness.setWithdrawDynamicFee(fixedFee, bps, maxFee))
        .to.emit(harness, "DynamicFeeUpdated")
        .withArgs("withdraw", fixedFee, bps, maxFee);
    });

    it("setPriceOracle emits PriceOracleUpdated with old and new addresses", async function () {
      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      const oracle1 = await OracleFactory.deploy();
      await oracle1.waitForDeployment();
      const oracle2 = await OracleFactory.deploy();
      await oracle2.waitForDeployment();

      // First set: old is address(0)
      await expect(harness.setPriceOracle(await oracle1.getAddress()))
        .to.emit(harness, "PriceOracleUpdated")
        .withArgs(ethers.ZeroAddress, await oracle1.getAddress());

      // Second set: old is oracle1
      await expect(harness.setPriceOracle(await oracle2.getAddress()))
        .to.emit(harness, "PriceOracleUpdated")
        .withArgs(await oracle1.getAddress(), await oracle2.getAddress());
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // 7.5 Oracle fail-safe
  // ─────────────────────────────────────────────────────────────────────────
  describe("7.5 Oracle fail-safe", function () {
    let bridge, privateCoti, oracle, owner;

    before(async function () {
      [owner] = await ethers.getSigners();

      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      oracle = await OracleFactory.deploy();
      await oracle.waitForDeployment();

      const PrivateFactory = await ethers.getContractFactory("SimplePrivateTokenMock");
      privateCoti = await PrivateFactory.deploy(18);
      await privateCoti.waitForDeployment();

      const BridgeFactory = await ethers.getContractFactory("PrivacyBridgeCotiNative");
      bridge = await BridgeFactory.deploy(await privateCoti.getAddress());
      await bridge.waitForDeployment();

      await privateCoti.grantRole(MINTER_ROLE, await bridge.getAddress());
      await bridge.setPriceOracle(await oracle.getAddress());
    });

    it("stale oracle revert propagates to deposit", async function () {
      await oracle.setShouldRevert(true);

      await expect(
        bridge["deposit()"]({ value: ethers.parseEther("100") })
      ).to.be.revertedWith("MockOracle: forced revert");

      await oracle.setShouldRevert(false);
    });

    it("stale oracle revert propagates to withdraw", async function () {
      // First deposit with valid oracle
      await oracle.setCotiPrice(ethers.parseEther("0.05"));
      await bridge["deposit()"]({ value: ethers.parseEther("200") });

      // Now make oracle revert
      await oracle.setShouldRevert(true);

      await privateCoti.approve(await bridge.getAddress(), ethers.parseEther("50"));
      await expect(
        bridge["withdraw(uint256)"](ethers.parseEther("50"))
      ).to.be.revertedWith("MockOracle: forced revert");

      await oracle.setShouldRevert(false);
    });

    it("zero COTI/USD rate causes revert (division by zero)", async function () {
      await oracle.setCotiPrice(0n);

      await expect(
        bridge["deposit()"]({ value: ethers.parseEther("100") })
      ).to.be.reverted;

      // Restore
      await oracle.setCotiPrice(ethers.parseEther("0.05"));
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // 7.6 tokenSymbol storage in each concrete bridge
  // ─────────────────────────────────────────────────────────────────────────
  describe("7.6 tokenSymbol storage", function () {
    // Deploy each concrete bridge with matching-decimal mocks and verify tokenSymbol

    async function deployConcreteErc20Bridge(contractName, symbol, decimals) {
      const TokenFactory = await ethers.getContractFactory("ERC20Mock");
      const publicToken = await TokenFactory.deploy("Token", symbol, decimals);
      await publicToken.waitForDeployment();

      const PrivateFactory = await ethers.getContractFactory("SimplePrivateTokenMock");
      const privateToken = await PrivateFactory.deploy(decimals);
      await privateToken.waitForDeployment();

      const BridgeFactory = await ethers.getContractFactory(contractName);
      const bridge = await BridgeFactory.deploy(
        await publicToken.getAddress(),
        await privateToken.getAddress()
      );
      await bridge.waitForDeployment();
      return bridge;
    }

    it('PrivacyBridgeWETH stores tokenSymbol "ETH"', async function () {
      const bridge = await deployConcreteErc20Bridge("PrivacyBridgeWETH", "WETH", 18);
      expect(await bridge.tokenSymbol()).to.equal("ETH");
    });

    it('PrivacyBridgeWBTC stores tokenSymbol "WBTC"', async function () {
      const bridge = await deployConcreteErc20Bridge("PrivacyBridgeWBTC", "WBTC", 8);
      expect(await bridge.tokenSymbol()).to.equal("WBTC");
    });

    it('PrivacyBridgeWADA stores tokenSymbol "ADA"', async function () {
      const bridge = await deployConcreteErc20Bridge("PrivacyBridgeWADA", "WADA", 6);
      expect(await bridge.tokenSymbol()).to.equal("ADA");
    });

    it('PrivacyBridgeUSDCe stores tokenSymbol "USDC"', async function () {
      const bridge = await deployConcreteErc20Bridge("PrivacyBridgeUSDCe", "USDC", 6);
      expect(await bridge.tokenSymbol()).to.equal("USDC");
    });

    it('PrivacyBridgeUSDT stores tokenSymbol "USDT"', async function () {
      const bridge = await deployConcreteErc20Bridge("PrivacyBridgeUSDT", "USDT", 6);
      expect(await bridge.tokenSymbol()).to.equal("USDT");
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // 7.7 Native bridge withdrawFees using accumulatedCotiFees
  // ─────────────────────────────────────────────────────────────────────────
  describe("7.7 Native bridge withdrawFees", function () {
    let bridge, privateCoti, oracle, owner, recipient;

    before(async function () {
      [owner, recipient] = await ethers.getSigners();

      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      oracle = await OracleFactory.deploy();
      await oracle.waitForDeployment();

      const PrivateFactory = await ethers.getContractFactory("SimplePrivateTokenMock");
      privateCoti = await PrivateFactory.deploy(18);
      await privateCoti.waitForDeployment();

      const BridgeFactory = await ethers.getContractFactory("PrivacyBridgeCotiNative");
      bridge = await BridgeFactory.deploy(await privateCoti.getAddress());
      await bridge.waitForDeployment();

      await privateCoti.grantRole(MINTER_ROLE, await bridge.getAddress());
      await bridge.setPriceOracle(await oracle.getAddress());

      // Set oracle price and deposit to accumulate fees
      await oracle.setCotiPrice(ethers.parseEther("0.05"));
      await bridge["deposit()"]({ value: ethers.parseEther("1000") });
    });

    it("withdrawFees withdraws from accumulatedCotiFees", async function () {
      const accFees = await bridge.accumulatedCotiFees();
      expect(accFees).to.be.gt(0n);

      const recipientBalBefore = await ethers.provider.getBalance(recipient.address);

      await bridge.withdrawFees(recipient.address, accFees);

      const recipientBalAfter = await ethers.provider.getBalance(recipient.address);
      expect(recipientBalAfter - recipientBalBefore).to.equal(accFees);

      expect(await bridge.accumulatedCotiFees()).to.equal(0n);
    });

    it("withdrawFees reverts if amount exceeds accumulatedCotiFees", async function () {
      await expect(
        bridge.withdrawFees(recipient.address, ethers.parseEther("999999"))
      ).to.be.revertedWithCustomError(bridge, "InsufficientAccumulatedFees");
    });

    it("withdrawFees emits FeesWithdrawn event", async function () {
      // Deposit again to accumulate fees
      await bridge["deposit()"]({ value: ethers.parseEther("500") });
      const accFees = await bridge.accumulatedCotiFees();

      await expect(bridge.withdrawFees(recipient.address, accFees))
        .to.emit(bridge, "FeesWithdrawn")
        .withArgs(recipient.address, accFees);
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // 7.8 ERC20 bridge withdrawFees removal/revert
  // ─────────────────────────────────────────────────────────────────────────
  describe("7.8 ERC20 bridge withdrawFees revert", function () {
    let bridge, owner;

    before(async function () {
      [owner] = await ethers.getSigners();

      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      const oracle = await OracleFactory.deploy();
      await oracle.waitForDeployment();

      const TokenFactory = await ethers.getContractFactory("ERC20Mock");
      const publicToken = await TokenFactory.deploy("Token", "TT", 18);
      await publicToken.waitForDeployment();

      const PrivateFactory = await ethers.getContractFactory("SimplePrivateTokenMock");
      const privateToken = await PrivateFactory.deploy(18);
      await privateToken.waitForDeployment();

      const BridgeFactory = await ethers.getContractFactory("PrivacyBridgeERC20TestMock");
      bridge = await BridgeFactory.deploy(
        await publicToken.getAddress(),
        await privateToken.getAddress(),
        "TEST"
      );
      await bridge.waitForDeployment();

      await bridge.setPriceOracle(await oracle.getAddress());
    });

    it("withdrawFees reverts with WithdrawFeesMustBeOverridden", async function () {
      await expect(
        bridge.withdrawFees(owner.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(bridge, "WithdrawFeesMustBeOverridden");
    });
  });

}); // end describe
