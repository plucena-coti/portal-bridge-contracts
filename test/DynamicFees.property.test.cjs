"use strict";

const { expect } = require("chai");
const { ethers } = require("hardhat");
const fc = require("fast-check");

/**
 * Dynamic Fees — Property-Based Tests (fast-check)
 *
 * Uses local Hardhat network with simple mocks (no MPC precompiles).
 * Each property test runs a minimum of 100 iterations.
 */

const FEE_DIVISOR = 1000000n;
const MAX_FEE_UNITS = 100000n;

// Default fee params
const DEFAULT_DEPOSIT_FIXED = ethers.parseEther("10");
const DEFAULT_DEPOSIT_BPS = 500n;
const DEFAULT_DEPOSIT_MAX = ethers.parseEther("3000");
const DEFAULT_WITHDRAW_FIXED = ethers.parseEther("3");
const DEFAULT_WITHDRAW_BPS = 250n;
const DEFAULT_WITHDRAW_MAX = ethers.parseEther("1500");

// Helper: compute expected dynamic fee in JS (BigInt)
function expectedDynamicFee(percentageFeeCoti, fixedFee, maxFee) {
  const fee = percentageFeeCoti > fixedFee ? percentageFeeCoti : fixedFee;
  return fee > maxFee ? maxFee : fee;
}

// Helper: compute native COTI fee in JS
function computeNativeCotiFee(cotiAmount, cotiUsdRate, percentageBps, fixedFee, maxFee) {
  const txValueUsd = (cotiAmount * cotiUsdRate) / (10n ** 18n);
  const percentageFeeUsd = (txValueUsd * percentageBps) / FEE_DIVISOR;
  const percentageFeeCoti = (percentageFeeUsd * (10n ** 18n)) / cotiUsdRate;
  return expectedDynamicFee(percentageFeeCoti, fixedFee, maxFee);
}

// Helper: compute ERC20 fee in JS
function computeErc20Fee(tokenAmount, tokenUsdRate, cotiUsdRate, tokenDecimals, percentageBps, fixedFee, maxFee) {
  const txValueUsd = (tokenAmount * tokenUsdRate) / (10n ** BigInt(tokenDecimals));
  const percentageFeeUsd = (txValueUsd * percentageBps) / FEE_DIVISOR;
  const percentageFeeCoti = (percentageFeeUsd * (10n ** 18n)) / cotiUsdRate;
  return expectedDynamicFee(percentageFeeCoti, fixedFee, maxFee);
}

const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

describe("Feature: dynamic-fees — Property-Based Tests", function () {
  this.timeout(600000);

  // ─────────────────────────────────────────────────────────────────────────
  // Property 1: Dynamic fee formula correctness
  // ─────────────────────────────────────────────────────────────────────────
  describe("Property 1: dynamic fee formula correctness", function () {
    /** Validates: Requirements 2.1, 12.1, 12.2, 12.3 */
    let harness;

    before(async function () {
      const Factory = await ethers.getContractFactory("PrivacyBridgeTestHarness");
      harness = await Factory.deploy();
      await harness.waitForDeployment();
    });

    it("Feature: dynamic-fees, Property 1: _calculateDynamicFee matches min(max(fixedFee, percentageFeeCoti), maxFee) and result bounded by [fixedFee, maxFee]", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: 0n, max: ethers.parseEther("10000") }),
          fc.bigInt({ min: 0n, max: ethers.parseEther("100000") }),
          fc.bigInt({ min: 0n, max: ethers.parseEther("200000") }),
          async (fixedFeeRaw, maxFeeOffset, percentageFeeCoti) => {
            const fixedFee = fixedFeeRaw;
            const maxFee = fixedFee + maxFeeOffset + 1n;

            const result = await harness.calculateDynamicFee(percentageFeeCoti, fixedFee, maxFee);
            const expected = expectedDynamicFee(percentageFeeCoti, fixedFee, maxFee);

            expect(result).to.equal(expected);
            expect(result).to.be.at.least(fixedFee);
            expect(result).to.be.at.most(maxFee);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // Property 2: Native bridge deposit fee
  // ─────────────────────────────────────────────────────────────────────────
  describe("Property 2: native bridge deposit fee", function () {
    /** Validates: Requirements 2.2, 3.1 */
    let bridge, privateCoti, oracle, owner, snapshotId;

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

    it("Feature: dynamic-fees, Property 2: deposit mints (msg.value - fee) and accumulatedCotiFees increases by fee", async function () {
      // Use snapshots to reset state between iterations to avoid balance depletion
      const baseSnapshot = await ethers.provider.send("evm_snapshot", []);

      try {
        await fc.assert(
          fc.asyncProperty(
            // cotiAmount: 100 to 500 COTI (small enough to not deplete account)
            fc.bigInt({ min: ethers.parseEther("100"), max: ethers.parseEther("500") }),
            // cotiUsdRate: $0.01 to $10 (1e18 scaled)
            fc.bigInt({ min: ethers.parseEther("0.01"), max: ethers.parseEther("10") }),
            async (cotiAmount, cotiUsdRate) => {
              // Snapshot before each iteration
              const snap = await ethers.provider.send("evm_snapshot", []);

              try {
                await oracle.setCotiPrice(cotiUsdRate);

                const expectedFee = computeNativeCotiFee(
                  cotiAmount, cotiUsdRate,
                  DEFAULT_DEPOSIT_BPS, DEFAULT_DEPOSIT_FIXED, DEFAULT_DEPOSIT_MAX
                );
                const expectedNet = cotiAmount - expectedFee;
                if (expectedNet === 0n) return;

                const feesBefore = await bridge.accumulatedCotiFees();

                const tx = await bridge["deposit()"]({ value: cotiAmount });
                await tx.wait();

                const feesAfter = await bridge.accumulatedCotiFees();
                expect(feesAfter - feesBefore).to.equal(expectedFee);

                await expect(tx).to.emit(bridge, "Deposit").withArgs(owner.address, cotiAmount, expectedNet);
              } finally {
                await ethers.provider.send("evm_revert", [snap]);
              }
            }
          ),
          { numRuns: 100 }
        );
      } finally {
        await ethers.provider.send("evm_revert", [baseSnapshot]);
      }
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // Property 3: Native bridge withdrawal fee
  // ─────────────────────────────────────────────────────────────────────────
  describe("Property 3: native bridge withdrawal fee", function () {
    /** Validates: Requirements 2.2, 3.2, 3.3 */
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

      // Pre-fund bridge with native COTI for withdrawals
      await oracle.setCotiPrice(ethers.parseEther("0.05"));
      await bridge["deposit()"]({ value: ethers.parseEther("5000") });
    });

    it("Feature: dynamic-fees, Property 3a: withdraw sends (amount - fee) and accumulatedCotiFees increases by fee", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: ethers.parseEther("50"), max: ethers.parseEther("200") }),
          fc.bigInt({ min: ethers.parseEther("0.01"), max: ethers.parseEther("10") }),
          async (amount, cotiUsdRate) => {
            const snap = await ethers.provider.send("evm_snapshot", []);
            try {
              await oracle.setCotiPrice(cotiUsdRate);

              const expectedFee = computeNativeCotiFee(
                amount, cotiUsdRate,
                DEFAULT_WITHDRAW_BPS, DEFAULT_WITHDRAW_FIXED, DEFAULT_WITHDRAW_MAX
              );
              const expectedNet = amount - expectedFee;
              if (expectedNet === 0n) return;

              // Mint private tokens and approve
              await privateCoti.mint(owner.address, amount);
              await privateCoti.approve(await bridge.getAddress(), amount);

              const feesBefore = await bridge.accumulatedCotiFees();

              const tx = await bridge["withdraw(uint256)"](amount);
              await tx.wait();

              const feesAfter = await bridge.accumulatedCotiFees();
              expect(feesAfter - feesBefore).to.equal(expectedFee);
              await expect(tx).to.emit(bridge, "Withdraw").withArgs(owner.address, amount, expectedNet);
            } finally {
              await ethers.provider.send("evm_revert", [snap]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("Feature: dynamic-fees, Property 3b: onTokenReceived sends (amount - fee) and accumulatedCotiFees increases by fee", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: ethers.parseEther("50"), max: ethers.parseEther("200") }),
          fc.bigInt({ min: ethers.parseEther("0.01"), max: ethers.parseEther("10") }),
          async (amount, cotiUsdRate) => {
            const snap = await ethers.provider.send("evm_snapshot", []);
            try {
              await oracle.setCotiPrice(cotiUsdRate);

              const expectedFee = computeNativeCotiFee(
                amount, cotiUsdRate,
                DEFAULT_WITHDRAW_BPS, DEFAULT_WITHDRAW_FIXED, DEFAULT_WITHDRAW_MAX
              );
              const expectedNet = amount - expectedFee;
              if (expectedNet === 0n) return;

              await privateCoti.mint(owner.address, amount);

              const feesBefore = await bridge.accumulatedCotiFees();

              const bridgeAddr = await bridge.getAddress();
              const tx = await privateCoti["transferAndCall(address,uint256,bytes)"](bridgeAddr, amount, "0x");
              await tx.wait();

              const feesAfter = await bridge.accumulatedCotiFees();
              expect(feesAfter - feesBefore).to.equal(expectedFee);
              await expect(tx).to.emit(bridge, "Withdraw").withArgs(owner.address, amount, expectedNet);
            } finally {
              await ethers.provider.send("evm_revert", [snap]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // Property 4: ERC20 fee computation with decimal normalization
  // ─────────────────────────────────────────────────────────────────────────
  describe("Property 4: ERC20 fee computation with decimal normalization", function () {
    /** Validates: Requirements 2.3, 2.4, 11.1 */
    const DECIMAL_CONFIGS = [6, 8, 18];
    const bridges = {};
    let oracle, owner;

    before(async function () {
      [owner] = await ethers.getSigners();

      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      oracle = await OracleFactory.deploy();
      await oracle.waitForDeployment();
      const oracleAddr = await oracle.getAddress();

      for (const dec of DECIMAL_CONFIGS) {
        const TokenFactory = await ethers.getContractFactory("ERC20Mock");
        const publicToken = await TokenFactory.deploy("TestToken", "TT", dec);
        await publicToken.waitForDeployment();

        const PrivateFactory = await ethers.getContractFactory("SimplePrivateTokenMock");
        const privateToken = await PrivateFactory.deploy(dec);
        await privateToken.waitForDeployment();

        const BridgeFactory = await ethers.getContractFactory("PrivacyBridgeERC20TestMock");
        const bridge = await BridgeFactory.deploy(
          await publicToken.getAddress(),
          await privateToken.getAddress(),
          "TEST"
        );
        await bridge.waitForDeployment();

        await privateToken.grantRole(MINTER_ROLE, await bridge.getAddress());
        await bridge.setPriceOracle(oracleAddr);

        bridges[dec] = { bridge, publicToken, privateToken };
      }
    });

    it("Feature: dynamic-fees, Property 4: ERC20 fee matches formula for decimals in {6, 8, 18}", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: 1n, max: 10000n }),
          fc.bigInt({ min: ethers.parseEther("0.01"), max: ethers.parseEther("100000") }),
          fc.bigInt({ min: ethers.parseEther("0.001"), max: ethers.parseEther("10") }),
          fc.constantFrom(6, 8, 18),
          async (tokenAmountUnits, tokenUsdRate, cotiUsdRate, dec) => {
            const snap = await ethers.provider.send("evm_snapshot", []);
            try {
              const tokenAmount = tokenAmountUnits * (10n ** BigInt(dec));

              await oracle.setCotiPrice(cotiUsdRate);
              await oracle.setPrice("TEST", tokenUsdRate);

              const { bridge, publicToken } = bridges[dec];

              const expectedFee = computeErc20Fee(
                tokenAmount, tokenUsdRate, cotiUsdRate, dec,
                DEFAULT_DEPOSIT_BPS, DEFAULT_DEPOSIT_FIXED, DEFAULT_DEPOSIT_MAX
              );

              const bridgeAddr = await bridge.getAddress();
              await publicToken.mint(owner.address, tokenAmount);
              await publicToken.approve(bridgeAddr, tokenAmount);

              const feesBefore = await bridge.accumulatedCotiFees();

              // Send fee + small buffer
              const msgValue = expectedFee + ethers.parseEther("1");
              const tx = await bridge["deposit(uint256)"](tokenAmount, { value: msgValue });
              await tx.wait();

              const feesAfter = await bridge.accumulatedCotiFees();
              expect(feesAfter - feesBefore).to.equal(expectedFee);
            } finally {
              await ethers.provider.send("evm_revert", [snap]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // Property 5: ERC20 full token passthrough
  // ─────────────────────────────────────────────────────────────────────────
  describe("Property 5: ERC20 full token passthrough", function () {
    /** Validates: Requirements 4.1, 4.2, 9.3 */
    let bridge, publicToken, privateToken, oracle, owner;

    before(async function () {
      [owner] = await ethers.getSigners();

      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      oracle = await OracleFactory.deploy();
      await oracle.waitForDeployment();

      const TokenFactory = await ethers.getContractFactory("ERC20Mock");
      publicToken = await TokenFactory.deploy("TestToken", "TT", 18);
      await publicToken.waitForDeployment();

      const PrivateFactory = await ethers.getContractFactory("SimplePrivateTokenMock");
      privateToken = await PrivateFactory.deploy(18);
      await privateToken.waitForDeployment();

      const BridgeFactory = await ethers.getContractFactory("PrivacyBridgeERC20TestMock");
      bridge = await BridgeFactory.deploy(
        await publicToken.getAddress(),
        await privateToken.getAddress(),
        "TEST"
      );
      await bridge.waitForDeployment();

      await privateToken.grantRole(MINTER_ROLE, await bridge.getAddress());
      await bridge.setPriceOracle(await oracle.getAddress());

      // Set moderate oracle prices so fees stay small
      await oracle.setCotiPrice(ethers.parseEther("0.05"));
      await oracle.setPrice("TEST", ethers.parseEther("1"));
    });

    it("Feature: dynamic-fees, Property 5: full token amount passes through on deposit and withdrawal", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: ethers.parseEther("1"), max: ethers.parseEther("1000") }),
          async (tokenAmount) => {
            const snap = await ethers.provider.send("evm_snapshot", []);
            try {
              const bridgeAddr = await bridge.getAddress();

              // --- DEPOSIT ---
              await publicToken.mint(owner.address, tokenAmount);
              await publicToken.approve(bridgeAddr, tokenAmount);

              const bridgeTokenBefore = await publicToken.balanceOf(bridgeAddr);
              const userPrivateBefore = await privateToken.balanceOf(owner.address);

              // Send generous msg.value for fee
              const tx = await bridge["deposit(uint256)"](tokenAmount, { value: ethers.parseEther("3100") });
              await tx.wait();

              const bridgeTokenAfter = await publicToken.balanceOf(bridgeAddr);
              expect(bridgeTokenAfter - bridgeTokenBefore).to.equal(tokenAmount);

              const userPrivateAfter = await privateToken.balanceOf(owner.address);
              expect(userPrivateAfter - userPrivateBefore).to.equal(tokenAmount);

              await expect(tx).to.emit(bridge, "Deposit").withArgs(owner.address, tokenAmount, tokenAmount);

              // --- WITHDRAW ---
              await privateToken.approve(bridgeAddr, tokenAmount);

              const userTokenBefore = await publicToken.balanceOf(owner.address);

              const tx2 = await bridge["withdraw(uint256)"](tokenAmount, { value: ethers.parseEther("1600") });
              await tx2.wait();

              const userTokenAfter = await publicToken.balanceOf(owner.address);
              expect(userTokenAfter - userTokenBefore).to.equal(tokenAmount);

              await expect(tx2).to.emit(bridge, "Withdraw").withArgs(owner.address, tokenAmount, tokenAmount);
            } finally {
              await ethers.provider.send("evm_revert", [snap]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // Property 6: ERC20 excess msg.value refund
  // ─────────────────────────────────────────────────────────────────────────
  describe("Property 6: ERC20 excess msg.value refund", function () {
    /** Validates: Requirements 4.3 */
    let bridge, publicToken, privateToken, oracle, owner;

    before(async function () {
      [owner] = await ethers.getSigners();

      const OracleFactory = await ethers.getContractFactory("MockCotiPriceConsumer");
      oracle = await OracleFactory.deploy();
      await oracle.waitForDeployment();

      const TokenFactory = await ethers.getContractFactory("ERC20Mock");
      publicToken = await TokenFactory.deploy("TestToken", "TT", 18);
      await publicToken.waitForDeployment();

      const PrivateFactory = await ethers.getContractFactory("SimplePrivateTokenMock");
      privateToken = await PrivateFactory.deploy(18);
      await privateToken.waitForDeployment();

      const BridgeFactory = await ethers.getContractFactory("PrivacyBridgeERC20TestMock");
      bridge = await BridgeFactory.deploy(
        await publicToken.getAddress(),
        await privateToken.getAddress(),
        "TEST"
      );
      await bridge.waitForDeployment();

      await privateToken.grantRole(MINTER_ROLE, await bridge.getAddress());
      await bridge.setPriceOracle(await oracle.getAddress());

      await oracle.setCotiPrice(ethers.parseEther("0.05"));
      await oracle.setPrice("TEST", ethers.parseEther("1"));
    });

    it("Feature: dynamic-fees, Property 6: excess msg.value is refunded to sender", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(ethers.parseEther("100")),
          fc.bigInt({ min: ethers.parseEther("0.01"), max: ethers.parseEther("50") }),
          async (tokenAmount, excess) => {
            const snap = await ethers.provider.send("evm_snapshot", []);
            try {
              const bridgeAddr = await bridge.getAddress();

              const cotiUsdRate = ethers.parseEther("0.05");
              const tokenUsdRate = ethers.parseEther("1");
              const expectedFee = computeErc20Fee(
                tokenAmount, tokenUsdRate, cotiUsdRate, 18,
                DEFAULT_DEPOSIT_BPS, DEFAULT_DEPOSIT_FIXED, DEFAULT_DEPOSIT_MAX
              );

              const msgValue = expectedFee + excess;

              await publicToken.mint(owner.address, tokenAmount);
              await publicToken.approve(bridgeAddr, tokenAmount);

              const balanceBefore = await ethers.provider.getBalance(owner.address);

              const tx = await bridge["deposit(uint256)"](tokenAmount, { value: msgValue });
              const receipt = await tx.wait();
              const gasUsed = receipt.gasUsed * receipt.gasPrice;

              const balanceAfter = await ethers.provider.getBalance(owner.address);

              // User should have paid exactly: fee + gas (excess was refunded)
              const actualCost = balanceBefore - balanceAfter;
              expect(actualCost).to.equal(expectedFee + gasUsed);
            } finally {
              await ethers.provider.send("evm_revert", [snap]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  // ─────────────────────────────────────────────────────────────────────────
  // Property 7: Fee setter validation
  // ─────────────────────────────────────────────────────────────────────────
  describe("Property 7: fee setter validation", function () {
    /** Validates: Requirements 6.3, 6.4 */
    let harness;

    before(async function () {
      const Factory = await ethers.getContractFactory("PrivacyBridgeTestHarness");
      harness = await Factory.deploy();
      await harness.waitForDeployment();
    });

    it("Feature: dynamic-fees, Property 7: valid fee params succeed, invalid revert", async function () {
      await fc.assert(
        fc.asyncProperty(
          fc.bigInt({ min: 0n, max: ethers.parseEther("10000") }),
          fc.bigInt({ min: 0n, max: 200000n }),
          fc.bigInt({ min: 0n, max: ethers.parseEther("10000") }),
          async (fixedFee, percentageBps, maxFee) => {
            const isValid = fixedFee <= maxFee && percentageBps <= MAX_FEE_UNITS && maxFee > 0n;

            if (isValid) {
              await expect(
                harness.setDepositDynamicFee(fixedFee, percentageBps, maxFee)
              ).to.not.be.reverted;

              await expect(
                harness.setWithdrawDynamicFee(fixedFee, percentageBps, maxFee)
              ).to.not.be.reverted;

              expect(await harness.depositFixedFee()).to.equal(fixedFee);
              expect(await harness.depositPercentageBps()).to.equal(percentageBps);
              expect(await harness.depositMaxFee()).to.equal(maxFee);
              expect(await harness.withdrawFixedFee()).to.equal(fixedFee);
              expect(await harness.withdrawPercentageBps()).to.equal(percentageBps);
              expect(await harness.withdrawMaxFee()).to.equal(maxFee);
            } else {
              await expect(
                harness.setDepositDynamicFee(fixedFee, percentageBps, maxFee)
              ).to.be.reverted;

              await expect(
                harness.setWithdrawDynamicFee(fixedFee, percentageBps, maxFee)
              ).to.be.reverted;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

}); // end describe
