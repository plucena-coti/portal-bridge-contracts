# Tasks

## Task 1: Add dynamic fee state variables and setters to PrivacyBridge.sol

- [x] 1.1 Add new state variables: `depositFixedFee` (default 10 ether), `depositPercentageBps` (default 500), `depositMaxFee` (default 3000 ether), `withdrawFixedFee` (default 3 ether), `withdrawPercentageBps` (default 250), `withdrawMaxFee` (default 1500 ether), `priceOracle` (address)
- [x] 1.2 Add `_calculateDynamicFee(uint256 percentageFeeCoti, uint256 fixedFee, uint256 maxFee)` internal pure function returning `min(max(fixedFee, percentageFeeCoti), maxFee)`
- [x] 1.3 Add `setDepositDynamicFee(uint256 _fixedFee, uint256 _percentageBps, uint256 _maxFee)` with onlyOperator modifier and validation (`_fixedFee <= _maxFee`, `_percentageBps <= MAX_FEE_UNITS`, `_maxFee > 0`)
- [x] 1.4 Add `setWithdrawDynamicFee(uint256 _fixedFee, uint256 _percentageBps, uint256 _maxFee)` with same validation
- [x] 1.5 Add `setPriceOracle(address _oracle)` with onlyOwner modifier and zero-address check
- [x] 1.6 Add `DynamicFeeUpdated(string feeType, uint256 fixedFee, uint256 percentageBps, uint256 maxFee)` and `PriceOracleUpdated(address indexed oldOracle, address indexed newOracle)` events
- [x] 1.7 Add `InvalidFeeConfiguration` error and import `CotiPriceConsumer` reference

## Task 2: Update PrivacyBridgeCotiNative.sol with dynamic fee logic

- [x] 2.1 Add `_computeCotiFee(uint256 cotiAmount, uint256 fixedFee, uint256 percentageBps, uint256 maxFee)` internal view function that queries `CotiPriceConsumer(priceOracle).getCotiPrice()` and computes the dynamic fee
- [x] 2.2 Update `_deposit(address sender)` to replace `_collectTokenFee` with `_computeCotiFee` using deposit params, deduct fee from `msg.value`, accumulate to `accumulatedCotiFees`, revert with `AmountZero` if net is zero
- [x] 2.3 Update `_withdraw(address to, uint256 amount)` to replace `_collectTokenFee` with `_computeCotiFee` using withdraw params, deduct fee from amount, accumulate to `accumulatedCotiFees`, revert with `AmountZero` if net is zero
- [x] 2.4 Update `onTokenReceived` to replace `_collectTokenFee` with `_computeCotiFee` using withdraw params, same accumulation logic
- [x] 2.5 Update `withdrawFees` to withdraw from `accumulatedCotiFees` instead of `accumulatedFees`

## Task 3: Update PrivacyBridgeERC20.sol with dynamic fee logic

- [x] 3.1 Add `tokenSymbol` public string state variable and update constructor to accept `string memory _tokenSymbol` parameter
- [x] 3.2 Add `_computeErc20Fee(uint256 tokenAmount, uint256 fixedFee, uint256 percentageBps, uint256 maxFee)` internal view function that queries both `getPrice(tokenSymbol)` and `getCotiPrice()`, normalizes by token decimals, and computes the dynamic fee
- [x] 3.3 Add `_collectDynamicNativeFee(uint256 fee)` internal function that requires `msg.value >= fee`, accumulates fee to `accumulatedCotiFees`, and refunds excess to sender (with fallback to accumulate if refund fails)
- [x] 3.4 Update `_deposit(uint256 amount)` to compute fee via `_computeErc20Fee`, collect via `_collectDynamicNativeFee`, transfer full token amount, mint full private token amount (remove `_collectNativeFee` and `_collectTokenFee` calls)
- [x] 3.5 Update `_withdraw(uint256 amount)` to compute fee via `_computeErc20Fee`, collect via `_collectDynamicNativeFee`, burn full private token amount, release full public token amount (remove `_collectNativeFee` and `_collectTokenFee` calls)
- [x] 3.6 Remove or make `withdrawFees` revert (all fees now via `withdrawCotiFees`)
- [x] 3.7 Remove `_collectNativeFee()` function (replaced by `_collectDynamicNativeFee`)

## Task 4: Update concrete ERC20 bridge constructors

- [x] 4.1 Update `PrivacyBridgeWETH` constructor to pass `"ETH"` as `_tokenSymbol`
- [x] 4.2 Update `PrivacyBridgeWBTC` constructor to pass `"WBTC"` as `_tokenSymbol`
- [x] 4.3 Update `PrivacyBridgeWADA` constructor to pass `"ADA"` as `_tokenSymbol`
- [x] 4.4 Update `PrivacyBridgeUSDCe` constructor to pass `"USDC"` as `_tokenSymbol`
- [x] 4.5 Update `PrivacyBridgeUSDT` constructor to pass `"USDT"` as `_tokenSymbol`

## Task 5: Create test mocks

- [x] 5.1 Create `MockCotiPriceConsumer` contract with configurable `getCotiPrice()` and `getPrice(string)` return values, and ability to toggle reverts for fail-safe testing
- [x] 5.2 Create `PrivacyBridgeTestHarness` contract that exposes `_calculateDynamicFee` as a public function for isolated property testing
- [x] 5.3 Create or update `MockERC20` to support configurable decimals (6, 8, 18) if not already supported

## Task 6: Write property-based tests (fast-check)

- [x] 6.1 [PBT: Property 1] Write property test: dynamic fee formula correctness — generate random `(percentageFeeCoti, fixedFee, maxFee)` with `fixedFee <= maxFee`, verify `_calculateDynamicFee` output matches `min(max(fixedFee, percentageFeeCoti), maxFee)` and result is bounded by `[fixedFee, maxFee]`
- [x] 6.2 [PBT: Property 2] Write property test: native bridge deposit fee — generate random `(cotiAmount, cotiUsdRate)`, verify minted amount equals `msg.value - fee` and `accumulatedCotiFees` increases by `fee`
- [x] 6.3 [PBT: Property 3] Write property test: native bridge withdrawal fee — generate random withdrawal amounts, verify net COTI sent equals `amount - fee` and `accumulatedCotiFees` increases by `fee` (test both `withdraw` and `onTokenReceived` paths)
- [x] 6.4 [PBT: Property 4] Write property test: ERC20 fee computation with decimal normalization — generate random `(tokenAmount, tokenUsdRate, cotiUsdRate, decimals ∈ {6,8,18})`, verify fee matches formula
- [x] 6.5 [PBT: Property 5] Write property test: ERC20 full token passthrough — generate random deposits/withdrawals, verify full token amount passes through without deduction
- [x] 6.6 [PBT: Property 6] Write property test: ERC20 excess msg.value refund — generate random `msg.value > fee`, verify refund of `(msg.value - fee)`
- [x] 6.7 [PBT: Property 7] Write property test: fee setter validation — generate random `(fixedFee, percentageBps, maxFee)` triples, verify valid inputs succeed and invalid inputs revert

## Task 7: Write unit tests

- [x] 7.1 Write unit tests for default fee parameter values after deployment (all 6 params + priceOracle)
- [x] 7.2 Write unit tests for worked examples from requirements appendix (20,000 wADA, 1 WBTC, 1000 USDC, 1 WETH deposits)
- [x] 7.3 Write unit tests for access control: operator-only fee setters, owner-only `setPriceOracle`, non-authorized callers revert
- [x] 7.4 Write unit tests for event emission: `DynamicFeeUpdated` and `PriceOracleUpdated` with correct parameters
- [x] 7.5 Write unit tests for oracle fail-safe: stale oracle revert propagation, zero COTI/USD rate revert
- [x] 7.6 Write unit tests for `tokenSymbol` storage in each concrete bridge
- [x] 7.7 Write unit tests for native bridge `withdrawFees` using `accumulatedCotiFees`
- [x] 7.8 Write unit tests for ERC20 bridge `withdrawFees` removal/revert

## Task 8: Compile and verify

- [x] 8.1 Run `npx hardhat compile` and fix any compilation errors
- [x] 8.2 Run the full test suite and verify all tests pass
