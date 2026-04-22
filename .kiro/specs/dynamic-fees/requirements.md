# Requirements Document

## Introduction

Replace the current percentage-based bridged-asset fee model with a dynamic fee formula charged exclusively in native COTI. The fee is computed based on the USD value of the transaction, converted to COTI using the CotiPriceConsumer oracle. The formula is:

```
Fee (in COTI) = min( max( FIXED, percentageOfUsdValue_in_COTI ), MAX_FEE )
```

This applies to both deposit and withdraw operations across `PrivacyBridgeERC20` and `PrivacyBridgeCotiNative`. All fees are collected in native COTI (18 decimals), eliminating the previous split between bridged-asset fees and flat native COTI fees.

## Glossary

- **Privacy_Bridge**: The base contract (`PrivacyBridge.sol`) providing shared fee logic, access control, limits, and pause functionality for all bridge variants.
- **ERC20_Bridge**: The abstract contract (`PrivacyBridgeERC20.sol`) handling bridging of ERC20 tokens (USDC, WETH, WBTC, WADA, USDT) to their private counterparts.
- **Native_Bridge**: The contract (`PrivacyBridgeCotiNative.sol`) handling bridging of native COTI to privacy-preserving COTI.p tokens.
- **Price_Oracle**: The deployed `CotiPriceConsumer` contract that retrieves TOKEN/USD prices from the Band Protocol oracle, with all rates scaled by 1e18.
- **Dynamic_Fee**: The fee computed as `min( max( fixedFee, percentageFeeCoti ), maxFee )`, where the percentage component is derived from the USD value of the transaction converted to COTI via the Price_Oracle.
- **FEE_DIVISOR**: The constant `1,000,000` used as the denominator for percentage calculations (500 / 1,000,000 = 0.05%).
- **MAX_FEE_UNITS**: The constant `100,000` representing the maximum allowed percentage (10%).
- **Token_Decimals**: The number of decimal places for a given ERC20 token (e.g., 18 for WETH, 8 for WBTC, 6 for USDC).
- **Operator**: An address with the `OPERATOR_ROLE` that can configure fee parameters.
- **Owner**: The contract owner who can set the Price_Oracle address and manage admin roles.
- **Band_Oracle_Symbol**: The symbol string used by the Band Protocol oracle (e.g., "ETH" not "WETH", "ADA" not "WADA").

## Requirements

### Requirement 1: Dynamic Fee State Variables

**User Story:** As a bridge operator, I want configurable dynamic fee parameters stored on-chain, so that the fee formula can be tuned without redeploying contracts.

#### Acceptance Criteria

1. THE Privacy_Bridge SHALL store the following deposit fee parameters: `depositFixedFee` (default 10 ether), `depositPercentageBps` (default 500), and `depositMaxFee` (default 3000 ether), all as `uint256` public state variables.
2. THE Privacy_Bridge SHALL store the following withdraw fee parameters: `withdrawFixedFee` (default 3 ether), `withdrawPercentageBps` (default 250), and `withdrawMaxFee` (default 1500 ether), all as `uint256` public state variables.
3. THE Privacy_Bridge SHALL store a `priceOracle` address as a public state variable pointing to the deployed CotiPriceConsumer contract.

### Requirement 2: Dynamic Fee Calculation

**User Story:** As a bridge user, I want fees calculated based on the USD value of my transaction with a floor and cap in COTI, so that fees are fair and predictable regardless of the token being bridged.

#### Acceptance Criteria

1. THE Privacy_Bridge SHALL provide an internal pure function `_calculateDynamicFee(percentageFeeCoti, fixedFee, maxFee)` that returns `min( max(fixedFee, percentageFeeCoti), maxFee )`.
2. WHEN a deposit or withdraw operation is executed on the Native_Bridge, THE Native_Bridge SHALL compute the percentage fee in COTI by: (a) querying the Price_Oracle for the COTI/USD rate, (b) computing `txValueUsd = cotiAmount * cotiUsdRate / 1e18`, (c) computing `percentageFeeUsd = txValueUsd * percentageBps / FEE_DIVISOR`, (d) converting `percentageFeeCoti = percentageFeeUsd * 1e18 / cotiUsdRate`, and (e) passing `percentageFeeCoti` to `_calculateDynamicFee`.
3. WHEN a deposit or withdraw operation is executed on the ERC20_Bridge, THE ERC20_Bridge SHALL compute the percentage fee in COTI by: (a) querying the Price_Oracle for both the TOKEN/USD rate and the COTI/USD rate, (b) computing `txValueUsd = tokenAmount * tokenUsdRate / 10^tokenDecimals` to account for varying token decimal precision, (c) computing `percentageFeeUsd = txValueUsd * percentageBps / FEE_DIVISOR`, (d) converting `percentageFeeCoti = percentageFeeUsd * 1e18 / cotiUsdRate`, and (e) passing `percentageFeeCoti` to `_calculateDynamicFee`.
4. THE ERC20_Bridge SHALL read the token's decimal precision via `IHasDecimals(address(token)).decimals()` to correctly normalize the USD value computation for tokens with different decimal counts (6, 8, or 18).

### Requirement 3: Native Bridge Fee Collection

**User Story:** As a user of the native COTI bridge, I want the dynamic fee deducted from my COTI amount during deposit and withdraw, so that I pay a fair fee based on the USD value of my transaction.

#### Acceptance Criteria

1. WHEN a user deposits native COTI via the Native_Bridge, THE Native_Bridge SHALL compute the Dynamic_Fee using deposit parameters (`depositFixedFee`, `depositPercentageBps`, `depositMaxFee`), deduct the fee from `msg.value`, mint `msg.value - fee` private tokens to the user, and add the fee to `accumulatedCotiFees`.
2. WHEN a user withdraws via the Native_Bridge `_withdraw` function, THE Native_Bridge SHALL compute the Dynamic_Fee using withdraw parameters (`withdrawFixedFee`, `withdrawPercentageBps`, `withdrawMaxFee`), deduct the fee from the requested amount, burn the full private token amount, send `amount - fee` native COTI to the user, and add the fee to `accumulatedCotiFees`.
3. WHEN a user withdraws via the Native_Bridge `onTokenReceived` callback, THE Native_Bridge SHALL compute the Dynamic_Fee using withdraw parameters, deduct the fee from the received amount, burn the full private token amount, send `amount - fee` native COTI to the user, and add the fee to `accumulatedCotiFees`.
4. IF the computed net amount after fee deduction equals zero, THEN THE Native_Bridge SHALL revert with `AmountZero`.

### Requirement 4: ERC20 Bridge Fee Collection

**User Story:** As a user of an ERC20 privacy bridge, I want to pay the dynamic fee in native COTI via `msg.value` while my full token amount passes through without deduction, so that my bridged token balance is not reduced by fees.

#### Acceptance Criteria

1. WHEN a user deposits ERC20 tokens via the ERC20_Bridge, THE ERC20_Bridge SHALL compute the Dynamic_Fee using deposit parameters, require `msg.value >= fee`, add the fee to `accumulatedCotiFees`, transfer the full token `amount` from the user, and mint the full `amount` of private tokens to the user.
2. WHEN a user withdraws ERC20 tokens via the ERC20_Bridge, THE ERC20_Bridge SHALL compute the Dynamic_Fee using withdraw parameters, require `msg.value >= fee`, add the fee to `accumulatedCotiFees`, burn the full `amount` of private tokens, and release the full `amount` of public ERC20 tokens to the user.
3. WHEN `msg.value` exceeds the computed Dynamic_Fee during an ERC20_Bridge operation, THE ERC20_Bridge SHALL refund the excess native COTI to the sender.
4. IF `msg.value` is less than the computed Dynamic_Fee during an ERC20_Bridge operation, THEN THE ERC20_Bridge SHALL revert.

### Requirement 5: ERC20 Bridge Token Symbol

**User Story:** As a bridge deployer, I want each ERC20 bridge instance to store the Band oracle symbol for its token, so that the bridge can query the correct TOKEN/USD price from the Price_Oracle.

#### Acceptance Criteria

1. THE ERC20_Bridge SHALL store a `tokenSymbol` public state variable of type `string`, set during construction.
2. THE ERC20_Bridge SHALL use the `tokenSymbol` value when calling `Price_Oracle.getPrice(tokenSymbol)` to retrieve the TOKEN/USD rate.
3. THE `tokenSymbol` SHALL match the Band_Oracle_Symbol (e.g., "ETH" for WETH, "ADA" for WADA, "WBTC" for WBTC, "USDC" for USDC.e, "USDT" for USDT).

### Requirement 6: Fee Parameter Setters

**User Story:** As a bridge operator, I want to update the dynamic fee parameters after deployment, so that fees can be adjusted in response to market conditions.

#### Acceptance Criteria

1. THE Privacy_Bridge SHALL provide a `setDepositDynamicFee(uint256 _fixedFee, uint256 _percentageBps, uint256 _maxFee)` function callable only by an Operator.
2. THE Privacy_Bridge SHALL provide a `setWithdrawDynamicFee(uint256 _fixedFee, uint256 _percentageBps, uint256 _maxFee)` function callable only by an Operator.
3. WHEN `setDepositDynamicFee` or `setWithdrawDynamicFee` is called, THE Privacy_Bridge SHALL validate that `_fixedFee <= _maxFee`, `_percentageBps <= MAX_FEE_UNITS`, and `_maxFee > 0`.
4. IF any validation in the fee setter fails, THEN THE Privacy_Bridge SHALL revert with an appropriate error.
5. WHEN a dynamic fee setter is called successfully, THE Privacy_Bridge SHALL emit a `DynamicFeeUpdated(string feeType, uint256 fixedFee, uint256 percentageBps, uint256 maxFee)` event.

### Requirement 7: Price Oracle Setter

**User Story:** As the bridge owner, I want to update the Price_Oracle address, so that the bridge can switch to a new oracle deployment if needed.

#### Acceptance Criteria

1. THE Privacy_Bridge SHALL provide a `setPriceOracle(address _oracle)` function callable only by the Owner.
2. IF `_oracle` is the zero address, THEN THE Privacy_Bridge SHALL revert with `InvalidAddress`.
3. WHEN `setPriceOracle` is called successfully, THE Privacy_Bridge SHALL emit a `PriceOracleUpdated(address indexed oldOracle, address indexed newOracle)` event.

### Requirement 8: Oracle Fail-Safe Behavior

**User Story:** As a bridge user, I want bridge operations to fail safely if the oracle returns stale or unavailable price data, so that fees are never computed with incorrect prices.

#### Acceptance Criteria

1. IF the Price_Oracle reverts due to stale data or unavailability during a deposit or withdraw, THEN THE Privacy_Bridge SHALL propagate the revert, preventing the operation from completing.
2. IF the COTI/USD rate returned by the Price_Oracle is zero, THEN THE Privacy_Bridge SHALL revert due to division by zero in the fee conversion step (`percentageFeeCoti = percentageFeeUsd * 1e18 / cotiUsdRate`).

### Requirement 9: Deprecation of Legacy Fee Mechanism

**User Story:** As a bridge maintainer, I want the old percentage-based bridged-asset fee mechanism deprecated, so that the codebase clearly reflects the new dynamic fee model.

#### Acceptance Criteria

1. THE Native_Bridge SHALL replace all calls to `_collectTokenFee` in `_deposit`, `_withdraw`, and `onTokenReceived` with the new Dynamic_Fee computation using `_computeCotiFee`.
2. THE ERC20_Bridge SHALL replace all calls to `_collectTokenFee` and `_collectNativeFee` in `_deposit` and `_withdraw` with the new Dynamic_Fee computation using `_computeErc20Fee`.
3. THE ERC20_Bridge SHALL no longer deduct fees from the bridged token amount; the full token amount SHALL pass through to the user.
4. THE Privacy_Bridge legacy state variables (`depositFeeBasisPoints`, `withdrawFeeBasisPoints`) and functions (`_calculateFeeAmount`, `_collectTokenFee`, `setDepositFee`, `setWithdrawFee`) SHALL be considered deprecated and no longer used by deposit/withdraw flows.
5. THE ERC20_Bridge `withdrawFees` function for bridged-asset fees SHALL be removed or made to revert, since all fees are now collected in native COTI via `accumulatedCotiFees` and withdrawn via `withdrawCotiFees`.

### Requirement 10: Native Bridge Fee Withdrawal Update

**User Story:** As a bridge operator, I want the native bridge fee withdrawal to use `accumulatedCotiFees`, so that it correctly reflects the new fee accumulation path.

#### Acceptance Criteria

1. THE Native_Bridge `withdrawFees` function SHALL withdraw from `accumulatedCotiFees` instead of `accumulatedFees`, since all dynamic fees are accumulated in `accumulatedCotiFees`.

### Requirement 11: Decimal-Aware USD Value Computation

**User Story:** As a bridge user depositing or withdrawing ERC20 tokens with varying decimal precision, I want the fee calculation to correctly normalize token amounts to USD, so that fees are accurate regardless of whether the token uses 6, 8, or 18 decimals.

#### Acceptance Criteria

1. WHEN computing the USD value of an ERC20 transaction, THE ERC20_Bridge SHALL use the formula `txValueUsd = tokenAmount * tokenUsdRate / 10^tokenDecimals`, where `tokenUsdRate` is 1e18-scaled from the Price_Oracle and `tokenAmount` is in the token's native decimal precision.
2. WHEN depositing 1 WBTC (8 decimals, price $76,000), THE ERC20_Bridge SHALL compute `txValueUsd = 100000000 * 76000e18 / 1e8 = 76000e18` ($76,000 in 1e18 precision).
3. WHEN depositing 1000 USDC (6 decimals, price $1.00), THE ERC20_Bridge SHALL compute `txValueUsd = 1000000000 * 1e18 / 1e6 = 1000e18` ($1,000 in 1e18 precision).
4. WHEN depositing 1 WETH (18 decimals, price $2,300), THE ERC20_Bridge SHALL compute `txValueUsd = 1e18 * 2300e18 / 1e18 = 2300e18` ($2,300 in 1e18 precision).

### Requirement 12: Dynamic Fee Formula Boundary Behavior

**User Story:** As a bridge user, I want the dynamic fee to respect the configured floor and cap, so that I pay at least the fixed minimum and never more than the maximum.

#### Acceptance Criteria

1. WHEN the percentage-based fee in COTI is less than the `fixedFee`, THE Privacy_Bridge SHALL use the `fixedFee` as the fee (floor behavior).
2. WHEN the percentage-based fee in COTI is greater than the `fixedFee` and less than the `maxFee`, THE Privacy_Bridge SHALL use the percentage-based fee as the fee.
3. WHEN the percentage-based fee in COTI exceeds the `maxFee`, THE Privacy_Bridge SHALL cap the fee at `maxFee` (cap behavior).

## Appendix: Fee Calculation Examples

### Deposit — Fixed=10 COTI, Percentage=0.05%, MaxFee=3000 COTI

| Tx USD Value | Fixed (COTI) | Pct Fee (COTI) | max(Fixed, Pct) | min(prev, Max) | Fee (COTI) |
|-------------|-------------|---------------|-----------------|----------------|------------|
| $50 | 10 | 2 | 10.0 | 10.0 | 10.0 |
| $500 | 10 | 20 | 20.0 | 20.0 | 20.0 |
| $5,000 | 10 | 200 | 200.0 | 200.0 | 200.0 |
| $50,000 | 10 | 2,000 | 2,000.0 | 2,000.0 | 2,000.0 |
| $500,000 | 10 | 20,000 | 20,000.0 | 3,000.0 | 3,000.0 |

### Withdraw — Fixed=3 COTI, Percentage=0.025%, MaxFee=1500 COTI

| Tx USD Value | Fixed (COTI) | Pct Fee (COTI) | max(Fixed, Pct) | min(prev, Max) | Fee (COTI) |
|-------------|-------------|---------------|-----------------|----------------|------------|
| $50 | 3 | 1 | 3.0 | 3.0 | 3.0 |
| $500 | 3 | 10 | 10.0 | 10.0 | 10.0 |
| $5,000 | 3 | 100 | 100.0 | 100.0 | 100.0 |
| $50,000 | 3 | 1,000 | 1,000.0 | 1,000.0 | 1,000.0 |
| $500,000 | 3 | 10,000 | 10,000.0 | 1,500.0 | 1,500.0 |

### Worked Example — Depositing 20,000 wADA via ERC20_Bridge

Assumptions: wADA price $0.255, COTI price $0.0125, wADA decimals 6, deposit params Fixed=10 COTI, Pct=0.05%, Max=3000 COTI.

1. `txValueUsd = 20000000000 * 255000000000000000 / 1000000 = 5100e18` → $5,100
2. `percentageFeeUsd = 5100e18 * 500 / 1000000 = 2.55e18` → $2.55
3. `percentageFeeCoti = 2.55e18 * 1e18 / 0.0125e18 = 204e18` → 204 COTI
4. `fee = min( max(10e18, 204e18), 3000e18 ) = 204e18` → 204 COTI
5. Fee collected from `msg.value`: 204 COTI. Full 20,000 wADA transferred, full 20,000 p.wADA minted.

## Appendix: Oracle Integration

| Bridge | Token | Band_Oracle_Symbol |
|--------|-------|--------------------|
| Native_Bridge | COTI | "COTI" |
| ERC20_Bridge (WETH) | WETH | "ETH" |
| ERC20_Bridge (WBTC) | WBTC | "WBTC" |
| ERC20_Bridge (WADA) | WADA | "ADA" |
| ERC20_Bridge (USDC.e) | USDC.e | "USDC" |
| ERC20_Bridge (USDT) | USDT | "USDT" |

Price_Oracle API:
- `getCotiPrice()` — returns COTI/USD rate (1e18 scaled)
- `getPrice(tokenSymbol)` — returns TOKEN/USD rate for any supported symbol (1e18 scaled)

Deployed testnet address: `0xAC89a381E84fbd5B3B536a3b895eB2aDdaDC36A1`
