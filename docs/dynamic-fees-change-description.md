# Dynamic Fee Implementation — Change Description

## Overview

Replace the current percentage-based bridged-asset fee model with a **dynamic fee formula** charged exclusively in **native COTI**. The fee is computed based on the **USD value** of the transaction, converted to COTI using the `CotiPriceConsumer` oracle.

```
Fee (in COTI) = min( max( FIXED, percentageOfUsdValue_in_COTI ), MAX_FEE )
```

This applies to both **deposit** and **withdraw** operations across `PrivacyBridgeERC20` and `PrivacyBridgeCotiNative`.

## Fee Parameters

| Parameter | Deposit | Withdraw |
|-----------|---------|----------|
| Fixed (COTI) | 10.0 | 3.0 |
| Percentage (of tx USD value) | 0.05% | 0.025% |
| Max Fee (COTI) | 3,000.0 | 1,500.0 |

All Fixed/Max values are in native COTI (18 decimals). The percentage is applied to the **USD value** of the transaction amount, and the resulting USD fee is converted to COTI via the oracle.

## Fee Calculation Flow

1. Get the USD value of the transaction amount using `CotiPriceConsumer`:
   - For native COTI bridge: `txValueUsd = amount * cotiUsdRate / 1e18` (COTI has 18 decimals)
   - For ERC20 bridge: `txValueUsd = amount * tokenUsdRate / 10^tokenDecimals` (adjusted for token precision — see Decimal Handling below)
2. Compute the percentage fee in USD: `percentageFeeUsd = txValueUsd * percentage`
3. Convert the percentage fee from USD to COTI: `percentageFeeCoti = percentageFeeUsd * 1e18 / cotiUsdRate`
4. Apply the formula: `fee = min( max(fixedFeeCoti, percentageFeeCoti), maxFeeCoti )`
5. Collect `fee` in native COTI (18 decimals).

### Decimal Handling

Different tokens have different decimal precision. The oracle always returns rates scaled by 1e18, but the token `amount` is scaled by `10^tokenDecimals`. This must be accounted for when computing the USD value.

| Token | Decimals | 1 unit raw value | Example |
|-------|----------|-----------------|---------|
| COTI (native) | 18 | `1e18` | 1 COTI = `1000000000000000000` |
| WETH | 18 | `1e18` | 1 WETH = `1000000000000000000` |
| WBTC | 8 | `1e8` | 1 WBTC = `100000000` |
| USDC | 6 | `1e6` | 1 USDC = `1000000` |
| USDT | 6 | `1e6` | 1 USDT = `1000000` |
| WADA | 6 | `1e6` | 1 WADA = `1000000` |

**Conversion formula (ERC20):**
```
txValueUsd = tokenAmount * tokenUsdRate / 10^tokenDecimals
```

Where `tokenUsdRate` is 1e18-scaled (from Band oracle) and `tokenAmount` is `10^tokenDecimals`-scaled.
The result `txValueUsd` is in USD with 1e18 precision.

**Example — depositing 1 WBTC (8 decimals, price $76,000):**
```
tokenAmount   = 100000000          (1 WBTC in 8-decimal raw units)
tokenUsdRate  = 76000e18           (76000 * 1e18, from oracle)
tokenDecimals = 8

txValueUsd = 100000000 * 76000e18 / 1e8 = 76000e18   ($76,000 in 1e18 precision) ✓
```

**Example — depositing 1000 USDC (6 decimals, price $1.00):**
```
tokenAmount   = 1000000000         (1000 USDC in 6-decimal raw units)
tokenUsdRate  = 1e18               (1.0 * 1e18, from oracle)
tokenDecimals = 6

txValueUsd = 1000000000 * 1e18 / 1e6 = 1000e18   ($1,000 in 1e18 precision) ✓
```

**Conversion from USD fee back to COTI (always 18 decimals):**
```
percentageFeeCoti = percentageFeeUsd * 1e18 / cotiUsdRate
```
The result is in COTI wei (18 decimals), which is the native precision for fee collection.

### Worked Example — Depositing 20,000 wADA via PrivacyBridgeERC20

**Assumptions:**
- wADA price: $0.255 (oracle returns `255000000000000000` = 0.255e18)
- COTI price: $0.0125 (oracle returns `12500000000000000` = 0.0125e18)
- wADA decimals: 6
- Deposit fee params: Fixed = 10 COTI, Percentage = 0.05%, MaxFee = 3,000 COTI

**User calls:** `deposit(20000000000)` with `msg.value >= fee`
- `tokenAmount = 20000000000` (20,000 wADA in 6-decimal raw units: 20000 × 1e6)

**Step 1 — Get oracle rates:**
```
tokenUsdRate = 255000000000000000    (wADA/USD = $0.255, 1e18 scaled)
cotiUsdRate  = 12500000000000000     (COTI/USD = $0.0125, 1e18 scaled)
tokenDecimals = 6
```

**Step 2 — Compute USD value of the transaction:**
```
txValueUsd = tokenAmount * tokenUsdRate / 10^tokenDecimals
           = 20000000000 * 255000000000000000 / 1000000
           = 5100000000000000000000   (= 5100e18)
           → $5,100.00
```
Sanity check: 20,000 wADA × $0.255 = $5,100 ✓

**Step 3 — Compute percentage fee in USD:**
```
percentageFeeUsd = txValueUsd * depositPercentageBps / FEE_DIVISOR
                 = 5100000000000000000000 * 500 / 1000000
                 = 2550000000000000000    (= 2.55e18)
                 → $2.55
```
Sanity check: $5,100 × 0.05% = $2.55 ✓

**Step 4 — Convert percentage fee from USD to COTI:**
```
percentageFeeCoti = percentageFeeUsd * 1e18 / cotiUsdRate
                  = 2550000000000000000 * 1000000000000000000 / 12500000000000000
                  = 204000000000000000000   (= 204e18)
                  → 204.0 COTI
```
Sanity check: $2.55 / $0.0125 = 204 COTI ✓

**Step 5 — Apply min/max formula:**
```
fixedFee = 10e18   (10.0 COTI)
maxFee   = 3000e18 (3,000.0 COTI)

fee = max(10e18, 204e18) = 204e18    (percentage > fixed, so percentage wins)
fee = min(204e18, 3000e18) = 204e18  (below cap)

→ Final fee: 204.0 COTI (≈ $2.55)
```

**Result:**
- Fee collected from `msg.value`: 204 COTI
- Full 20,000 wADA transferred from user (no token deduction)
- Full 20,000 p.wADA minted to user

---

## Current State

### `PrivacyBridge.sol` (base contract)

- Stores `depositFeeBasisPoints` and `withdrawFeeBasisPoints` (single percentage each).
- `_calculateFeeAmount(amount, feeBasisPoints)` computes `amount * feeBasisPoints / FEE_DIVISOR`.
- `_collectTokenFee(grossAmount, feeBasisPoints)` calls `_calculateFeeAmount`, subtracts the fee from the bridged asset amount, accumulates it, returns the net amount.
- `FEE_DIVISOR = 1_000_000` and `MAX_FEE_UNITS = 100_000` (caps percentage at 10%).
- `accumulatedFees` tracks fees in the bridged asset.
- `accumulatedCotiFees` tracks native COTI fees (used by ERC20 bridges for the flat `nativeCotiFee`).

### `PrivacyBridgeERC20.sol`

- `_deposit()` and `_withdraw()` call `_collectTokenFee` to deduct fees from the bridged token amount.
- Also collects a flat `nativeCotiFee` via `_collectNativeFee()` from `msg.value`.
- Fees are split: bridged-asset fee in token + flat native COTI fee.

### `PrivacyBridgeCotiNative.sol`

- `_deposit()` and `_withdraw()` call `_collectTokenFee` to deduct fees from the native COTI amount.
- No separate `nativeCotiFee` (reverts if attempted).

---

## Required Changes

### 1. `PrivacyBridge.sol` — New State Variables

Add the following storage variables:

```solidity
uint256 public depositFixedFee;       // Fixed floor for deposit fee (in COTI wei, 18 decimals)
uint256 public depositMaxFee;          // Hard cap for deposit fee (in COTI wei)
uint256 public depositPercentageBps;   // Percentage of USD value (FEE_DIVISOR scale: 500 = 0.05%)

uint256 public withdrawFixedFee;       // Fixed floor for withdraw fee (in COTI wei)
uint256 public withdrawMaxFee;         // Hard cap for withdraw fee (in COTI wei)
uint256 public withdrawPercentageBps;  // Percentage of USD value (FEE_DIVISOR scale: 250 = 0.025%)

// Oracle for USD price lookups
address public priceOracle;           // Address of deployed CotiPriceConsumer
```

Default values:

| Variable | Default Value (wei) | Human-Readable |
|----------|-------------------|----------------|
| `depositFixedFee` | `10 ether` | 10.0 COTI |
| `depositMaxFee` | `3000 ether` | 3,000.0 COTI |
| `depositPercentageBps` | `500` | 0.05% (500 / 1,000,000) |
| `withdrawFixedFee` | `3 ether` | 3.0 COTI |
| `withdrawMaxFee` | `1500 ether` | 1,500.0 COTI |
| `withdrawPercentageBps` | `250` | 0.025% (250 / 1,000,000) |

### 2. `PrivacyBridge.sol` — New Fee Calculation Function

Add a new internal pure function:

```solidity
function _calculateDynamicFee(
    uint256 percentageFeeCoti,
    uint256 fixedFee,
    uint256 maxFee
) internal pure returns (uint256)
```

Logic:
1. `fee = max(fixedFee, percentageFeeCoti)`
2. `fee = min(fee, maxFee)`
3. Return `fee`

The percentage fee in COTI is computed by the caller (since the conversion from USD to COTI differs between native and ERC20 bridges).

### 3. `PrivacyBridge.sol` — New Setter Functions

Add operator-only setters:

```solidity
function setDepositDynamicFee(uint256 _fixedFee, uint256 _percentageBps, uint256 _maxFee) external onlyOperator
function setWithdrawDynamicFee(uint256 _fixedFee, uint256 _percentageBps, uint256 _maxFee) external onlyOperator
function setPriceOracle(address _oracle) external onlyOwner
```

Validation for fee setters:
- `_fixedFee <= _maxFee` (fixed floor must not exceed cap)
- `_percentageBps <= MAX_FEE_UNITS` (percentage must not exceed 10%)
- `_maxFee > 0`

Validation for oracle setter:
- `_oracle != address(0)`

Events:
- `DynamicFeeUpdated(string feeType, uint256 fixedFee, uint256 percentageBps, uint256 maxFee)`
- `PriceOracleUpdated(address indexed oldOracle, address indexed newOracle)`

### 4. `PrivacyBridge.sol` — Deprecations

The following become unused and can be deprecated:
- `depositFeeBasisPoints` / `withdrawFeeBasisPoints`
- `setDepositFee()` / `setWithdrawFee()`
- `_calculateFeeAmount()`
- `_collectTokenFee()` — replaced by dynamic fee logic
- `accumulatedFees` — no longer tracking bridged-asset fees; all fees go to `accumulatedCotiFees`

---

### 5. `PrivacyBridgeCotiNative.sol` — Update Fee Collection

Amounts are already in native COTI. The oracle is used to get the COTI/USD rate to compute the USD value of the transaction.

**New internal helper:**
```solidity
function _computeCotiFee(
    uint256 cotiAmount,
    uint256 fixedFee,
    uint256 percentageBps,
    uint256 maxFee
) internal view returns (uint256) {
    // Step 1: Get COTI/USD rate from oracle (1e18 scaled)
    uint256 cotiUsdRate = CotiPriceConsumer(priceOracle).getCotiPrice();

    // Step 2: Compute USD value of the transaction
    // txValueUsd = cotiAmount * cotiUsdRate / 1e18  (result is in USD with 18 decimals)
    uint256 txValueUsd = (cotiAmount * cotiUsdRate) / 1e18;

    // Step 3: Compute percentage fee in USD
    // percentageFeeUsd = txValueUsd * percentageBps / FEE_DIVISOR
    uint256 percentageFeeUsd = (txValueUsd * percentageBps) / FEE_DIVISOR;

    // Step 4: Convert percentage fee from USD back to COTI
    // percentageFeeCoti = percentageFeeUsd * 1e18 / cotiUsdRate
    uint256 percentageFeeCoti = (percentageFeeUsd * 1e18) / cotiUsdRate;

    // Step 5: Apply min/max formula
    return _calculateDynamicFee(percentageFeeCoti, fixedFee, maxFee);
}
```

**`_deposit(address sender)`:**
- Remove: `uint256 amountAfterFee = _collectTokenFee(msg.value, depositFeeBasisPoints);`
- Replace with:
  ```solidity
  uint256 fee = _computeCotiFee(msg.value, depositFixedFee, depositPercentageBps, depositMaxFee);
  uint256 amountAfterFee = msg.value - fee;
  if (amountAfterFee == 0) revert AmountZero();
  accumulatedCotiFees += fee;
  ```

**`_withdraw(address to, uint256 amount)`:**
- Remove: `uint256 publicAmount = _collectTokenFee(amount, withdrawFeeBasisPoints);`
- Replace with:
  ```solidity
  uint256 fee = _computeCotiFee(amount, withdrawFixedFee, withdrawPercentageBps, withdrawMaxFee);
  uint256 publicAmount = amount - fee;
  if (publicAmount == 0) revert AmountZero();
  accumulatedCotiFees += fee;
  ```

**`onTokenReceived()`:**
- Same change as `_withdraw` — replace `_collectTokenFee` with `_computeCotiFee` using withdraw parameters, accumulate to `accumulatedCotiFees`.

**`withdrawFees()`:**
- Update to withdraw from `accumulatedCotiFees` instead of `accumulatedFees`, since all fees are now native COTI.

---

### 6. `PrivacyBridgeERC20.sol` — Update Fee Collection

ERC20 bridges handle tokens that are NOT native COTI (e.g., USDC, WETH). The oracle is used to get both the token's USD rate and the COTI/USD rate to compute the fee.

**New state:**
```solidity
string public tokenSymbol;  // Band oracle symbol for this bridge's token (e.g. "ETH", "USDC", "WBTC")
```
Set in constructor alongside `_token` and `_privateToken`.

**New internal helper:**
```solidity
function _computeErc20Fee(
    uint256 tokenAmount,
    uint256 fixedFee,
    uint256 percentageBps,
    uint256 maxFee
) internal view returns (uint256) {
    CotiPriceConsumer oracle = CotiPriceConsumer(priceOracle);

    // Step 1: Get TOKEN/USD and COTI/USD rates (both 1e18 scaled)
    uint256 tokenUsdRate = oracle.getPrice(tokenSymbol);
    uint256 cotiUsdRate  = oracle.getCotiPrice();

    // Step 2: Compute USD value of the transaction (decimal-aware)
    // tokenAmount is in 10^tokenDecimals units, tokenUsdRate is 1e18 scaled
    // Result txValueUsd is in USD with 1e18 precision
    //
    // Examples:
    //   1 WBTC  (8 dec):  100000000 * 76000e18 / 1e8  = 76000e18  ($76,000)
    //   1000 USDC (6 dec): 1000000000 * 1e18 / 1e6     = 1000e18   ($1,000)
    //   1 WETH (18 dec):   1e18 * 2300e18 / 1e18       = 2300e18   ($2,300)
    uint8 tokenDecimals = IHasDecimals(address(token)).decimals();
    uint256 txValueUsd = (tokenAmount * tokenUsdRate) / (10 ** tokenDecimals);

    // Step 3: Compute percentage fee in USD (1e18 precision)
    uint256 percentageFeeUsd = (txValueUsd * percentageBps) / FEE_DIVISOR;

    // Step 4: Convert percentage fee from USD to COTI (18 decimals)
    // percentageFeeCoti = percentageFeeUsd * 1e18 / cotiUsdRate
    uint256 percentageFeeCoti = (percentageFeeUsd * 1e18) / cotiUsdRate;

    // Step 5: Apply min/max formula — all values in COTI wei (18 decimals)
    return _calculateDynamicFee(percentageFeeCoti, fixedFee, maxFee);
}
```

**Important:** The `tokenDecimals` value is read from the public ERC20 token contract via `IHasDecimals`. The constructor already verifies that public and private token decimals match (see `DecimalsMismatch` check in `PrivacyBridgeERC20`). This ensures the fee calculation uses the correct precision regardless of whether the token has 6, 8, or 18 decimals.

**`_deposit(uint256 amount)`:**
1. Compute fee: `uint256 fee = _computeErc20Fee(amount, depositFixedFee, depositPercentageBps, depositMaxFee);`
2. Collect fee from `msg.value`: require `msg.value >= fee`, refund excess.
3. `accumulatedCotiFees += fee;`
4. Transfer the **full** `amount` of ERC20 tokens from user (no token deduction).
5. Mint the **full** `amount` of private tokens to the user.

Replaces both `_collectNativeFee()` (flat fee) and `_collectTokenFee()` (token-denominated fee).

**`_withdraw(uint256 amount)`:**
1. Compute fee: `uint256 fee = _computeErc20Fee(amount, withdrawFixedFee, withdrawPercentageBps, withdrawMaxFee);`
2. Collect fee from `msg.value`: require `msg.value >= fee`, refund excess.
3. `accumulatedCotiFees += fee;`
4. Burn the **full** `amount` of private tokens.
5. Release the **full** `amount` of ERC20 tokens to the user.

**Remove:**
- `_collectNativeFee()` — replaced by dynamic fee collection from `msg.value`.
- `_collectTokenFee()` calls — no token-denominated fees.
- `nativeCotiFee` usage — no longer a flat fee; the dynamic formula replaces it.
- `accumulatedFees` usage — all fees go to `accumulatedCotiFees`.

**`withdrawFees()`:**
- No longer needed for bridged-asset fees. All fee withdrawal goes through `withdrawCotiFees()` (already in base contract).
- Can be removed or made to revert.

---

## Fee Calculation Examples

### Deposit — `Fixed=10 COTI, Percentage=0.05% of USD value, MaxFee=3000 COTI`

| Tx USD Value | Fixed (COTI) | Pct Fee (COTI) | max(Fixed, Pct) | min(prev, Max) | **Fee (COTI)** | **Fee (USD)** |
|-------------|-------------|---------------|-----------------|----------------|---------------|--------------|
| $50 | 10 | 2 | 10.0 | 10.0 | **10.0** | $0.1 |
| $500 | 10 | 20 | 20.0 | 20.0 | **20.0** | $0.3 |
| $5,000 | 10 | 200 | 200.0 | 200.0 | **200.0** | $2.5 |
| $50,000 | 10 | 2,000 | 2,000.0 | 2,000.0 | **2,000.0** | $25.0 |
| $500,000 | 10 | 20,000 | 20,000.0 | 3,000.0 | **3,000.0** | $37.5 |

### Withdraw — `Fixed=3 COTI, Percentage=0.025% of USD value, MaxFee=1500 COTI`

| Tx USD Value | Fixed (COTI) | Pct Fee (COTI) | max(Fixed, Pct) | min(prev, Max) | **Fee (COTI)** | **Fee (USD)** |
|-------------|-------------|---------------|-----------------|----------------|---------------|--------------|
| $50 | 3 | 1 | 3.0 | 3.0 | **3.0** | $0.0 |
| $500 | 3 | 10 | 10.0 | 10.0 | **10.0** | $0.1 |
| $5,000 | 3 | 100 | 100.0 | 100.0 | **100.0** | $1.3 |
| $50,000 | 3 | 1,000 | 1,000.0 | 1,000.0 | **1,000.0** | $12.5 |
| $500,000 | 3 | 10,000 | 10,000.0 | 1,500.0 | **1,500.0** | $18.8 |

*Note: USD fee values assume COTI price ≈ $0.0125*

---

## Oracle Integration

Both bridge types use the deployed `CotiPriceConsumer` contract to fetch prices.

**Deployed addresses:**
- COTI Testnet: `0xAC89a381E84fbd5B3B536a3b895eB2aDdaDC36A1`

**Supported symbols (Testnet):** COTI, ETH, WBTC, ADA, USDC, USDT

**Note:** The Band oracle uses `"ADA"` (not `"WADA"`) and `"ETH"` (not `"WETH"`). The `tokenSymbol` in each ERC20 bridge constructor must match the Band oracle symbol, not the wrapped token name.

| Bridge | Token | Oracle Symbol |
|--------|-------|---------------|
| PrivacyBridgeCotiNative | COTI | `"COTI"` |
| PrivacyBridgeWETH | WETH | `"ETH"` |
| PrivacyBridgeWBTC | WBTC | `"WBTC"` |
| PrivacyBridgeWADA | WADA | `"ADA"` |
| PrivacyBridgeUSDCe | USDC.e | `"USDC"` |
| PrivacyBridgeUSDT | USDT | `"USDT"` |

**API used by bridges:**
- **`CotiPriceConsumer.getCotiPrice()`** — returns COTI/USD rate (1e18 scaled)
- **`CotiPriceConsumer.getPrice(tokenSymbol)`** — returns TOKEN/USD rate for any supported symbol (1e18 scaled)

The oracle address is stored in `priceOracle` (set via `setPriceOracle()`). The oracle enforces a configurable staleness check — if price data is too old, the call reverts, which will also revert the bridge operation (fail-safe behavior).

---

## Files Affected

| File | Changes |
|------|---------|
| `PrivacyBridge.sol` | Add dynamic fee state variables (`depositFixedFee`, `depositMaxFee`, `depositPercentageBps`, `withdrawFixedFee`, `withdrawMaxFee`, `withdrawPercentageBps`, `priceOracle`). Add `_calculateDynamicFee()`. Add setters (`setDepositDynamicFee`, `setWithdrawDynamicFee`, `setPriceOracle`). Add events. Deprecate `_collectTokenFee`, `_calculateFeeAmount`, `depositFeeBasisPoints`, `withdrawFeeBasisPoints`, `accumulatedFees`. |
| `PrivacyBridgeCotiNative.sol` | Add `_computeCotiFee()` helper. Replace `_collectTokenFee` calls with `_computeCotiFee` in `_deposit`, `_withdraw`, `onTokenReceived`. Accumulate to `accumulatedCotiFees`. Update `withdrawFees` accordingly. |
| `PrivacyBridgeERC20.sol` | Add `tokenSymbol` state variable (set in constructor). Add `_computeErc20Fee()` helper with decimal-aware USD conversion. Replace `_collectNativeFee` + `_collectTokenFee` with dynamic COTI fee from `msg.value`. Full token amount passes through without deduction. Remove `withdrawFees` for bridged assets (use `withdrawCotiFees` only). |
| `CotiPriceConsumer.sol` | No changes needed (already deployed; used as oracle by both bridge types). |
