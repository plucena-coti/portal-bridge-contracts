# COMPREHENSIVE SECURITY AUDIT REPORT
## Privacy Bridge Contracts - COTI Network

---

## CORE INVARIANTS & TRUST ASSUMPTIONS

### Core Invariants (Expected to Hold):
1. **1:1 Peg**: For ERC20 bridges, 1 public token deposited = 1 private token minted (minus fees)
2. **Conservation of Funds**: Bridge balance ≥ sum of all user deposits - withdrawals
3. **Fee Accounting**: `accumulatedFees` + `accumulatedCotiFees` ≤ actual contract balance
4. **Role Separation**: Only MINTER_ROLE can mint private tokens; only BURNER_ROLE can burn
5. **Oracle Consistency**: Oracle timestamp validation prevents fee manipulation between estimate and execution
6. **Decimal Parity**: Public and private tokens must have matching decimals (enforced in constructor)

### Trust Assumptions:
1. **MPC Precompile Trust**: All encrypted operations (balances, transfers, allowances) rely on the chain's MPC precompile being correct and non-malicious. No on-chain verification of MPC soundness exists.
2. **Oracle Trust**: Band Protocol oracle is assumed honest and manipulation-resistant. Staleness checks exist but can be disabled (maxStaleness=0).
3. **Centralized Admin**: Owner has unilateral control over pause, limits, fees, oracle address, and fee withdrawal. No timelock or multisig enforced at contract level.
4. **Private Token Trust**: Private token contracts are trusted to enforce MINTER_ROLE/BURNER_ROLE correctly and not have backdoors.
5. **Standard ERC20 Assumption**: Public tokens must be standard (no fee-on-transfer, no rebasing, no blacklists that could trap bridge funds).

---

## SECURITY FINDINGS

### **CRITICAL SEVERITY**

#### **C-1: Oracle Manipulation via Flash Loan Attack on Dynamic Fees**
**Severity**: Critical (High Likelihood × High Impact)  
**Location**: `PrivacyBridgeERC20.sol` lines 53-67, `PrivacyBridgeCotiNative.sol` lines 39-50  
**Description**: The dynamic fee calculation queries the oracle **twice** in separate transactions:
1. User calls `estimateDepositFee()` to get fee and `lastUpdated` timestamp
2. User calls `deposit(amount, oracleTimestamp)` which validates timestamp and re-queries oracle

**Attack Scenario**:
1. Attacker observes oracle price for COTI or bridged token (e.g., ETH)
2. Attacker uses flash loan to manipulate Band Protocol oracle price feed (if possible) or waits for natural price volatility
3. Between `estimateDepositFee()` and `deposit()`, oracle updates with drastically different price
4. `_validateOracleTimestamp()` **reverts** if timestamp changed, but attacker can:
   - Front-run legitimate users by calling `estimateDepositFee()` with new timestamp
   - Exploit race condition where oracle updates between estimate and deposit
5. **Worse**: If oracle is stale (maxStaleness disabled or large window), attacker can use outdated prices to pay minimal fees

**Impact**: 
- Users pay incorrect fees (too high or too low)
- Protocol loses revenue if fees are undercharged
- DoS if oracle updates frequently (all deposits/withdrawals revert)

**Proof of Concept**:
```solidity
// Attacker flow:
1. Call estimateDepositFee(1000 WETH) → returns fee=10 COTI, lastUpdated=T1
2. Oracle updates (natural or manipulated) → lastUpdated=T2
3. Call deposit(1000 WETH, T1) → REVERTS with OracleTimestampMismatch
4. Legitimate user's transaction fails; attacker can grief or exploit price discrepancy
```

**Recommended Fix**:
1. **Remove timestamp validation** and accept oracle price at execution time (simpler, but exposes to MEV)
2. **OR** Use Chainlink-style price feeds with heartbeat/deviation checks instead of timestamp matching
3. **OR** Implement a tolerance window (e.g., ±5% fee variance allowed) instead of exact timestamp match
4. **Add slippage protection**: Let users specify `maxFeeAccepted` parameter to prevent surprise fee spikes

---

#### **C-2: Reentrancy in Native Bridge Withdraw via Malicious Receiver**
**Severity**: Critical (Medium Likelihood × Critical Impact)  
**Location**: `PrivacyBridgeCotiNative.sol` lines 151-152, 196-197  
**Description**: Both `onTokenReceived()` and `withdraw()` send native COTI to `from`/`to` **after** burning tokens but **before** completing state updates. While `nonReentrant` modifier is present, the call to `from.call{value: publicAmount}("")` can trigger fallback/receive functions in malicious contracts.

**Attack Scenario**:
1. Attacker deploys malicious contract with `receive()` that calls back into bridge
2. Attacker calls `withdraw()` or uses `transferAndCall()`
3. Bridge burns private tokens and sends native COTI
4. Malicious `receive()` re-enters bridge (blocked by `nonReentrant` in current implementation)
5. **However**: If `nonReentrant` is removed or bypassed (e.g., via cross-function reentrancy), attacker could drain bridge

**Current Mitigation**: `nonReentrant` modifier protects against this. **BUT**:
- `onTokenReceived()` is marked `nonReentrant` ✅
- `withdraw()` is marked `nonReentrant` ✅
- **Risk remains if**: Future upgrades remove modifier, or cross-contract reentrancy via other functions

**Impact**: Complete drainage of bridge native COTI balance if reentrancy guard fails

**Proof of Concept**:
```solidity
contract MaliciousReceiver {
    PrivacyBridgeCotiNative bridge;
    function receive() external payable {
        // If nonReentrant is bypassed:
        bridge.withdraw(remainingBalance, oracleTimestamp);
    }
}
```

**Recommended Fix**:
1. **Follow Checks-Effects-Interactions (CEI)**: Move `privateCoti.burn()` **after** all state updates
2. **Use pull-over-push pattern**: Store withdrawal amounts in mapping, let users claim separately
3. **Keep `nonReentrant` on ALL external functions** that transfer value
4. **Add explicit reentrancy test** in test suite

---

#### **C-3: ERC20 Bridge Liquidity Drain via Rescue Function**
**Severity**: Critical (Low Likelihood × Critical Impact)  
**Location**: `PrivacyBridgeERC20.sol` lines 224-238  
**Description**: The `rescueERC20()` function only prevents rescuing `privateToken`, but **does NOT prevent rescuing the public `token`** (e.g., WETH, WBTC, USDT). Owner can drain all bridge liquidity, making withdrawals impossible.

**Attack Scenario**:
1. Malicious or compromised owner calls `rescueERC20(address(token), owner, bridgeBalance)`
2. All public tokens (WETH, USDT, etc.) are transferred to owner
3. Users cannot withdraw their private tokens (all `withdraw()` calls revert with `InsufficientBridgeLiquidity`)
4. Users' funds are effectively stolen

**Impact**: Complete loss of user funds; bridge becomes insolvent

**Proof of Concept**:
```solidity
// Line 232-233 only checks privateToken, NOT token!
if (_token == address(privateToken))
    revert CannotRescueBridgeToken();
// Missing: if (_token == address(token)) revert CannotRescueBridgeToken();
```

**Recommended Fix**:
```solidity
function rescueERC20(address _token, address to, uint256 amount) external onlyOwner nonReentrant {
    if (to == address(0)) revert InvalidAddress();
    if (amount == 0) revert AmountZero();
    
    // CRITICAL FIX: Prevent rescuing BOTH private and public bridge tokens
    if (_token == address(privateToken) || _token == address(token))
        revert CannotRescueBridgeToken();

    IERC20(_token).safeTransfer(to, amount);
    emit ERC20Rescued(_token, to, amount);
}
```

---

### **HIGH SEVERITY**

#### **H-1: Oracle Staleness Can Be Disabled, Allowing Stale Price Exploitation**
**Severity**: High (Medium Likelihood × High Impact)  
**Location**: `CotiPriceConsumer.sol` lines 66-71, `PrivacyBridge.sol` line 305-308  
**Description**: The oracle staleness check can be disabled by setting `maxStaleness = 0`. If disabled, attackers can exploit stale oracle prices to pay minimal fees or extract value during price volatility.

**Attack Scenario**:
1. Owner sets `maxStaleness = 0` (disables staleness check)
2. Oracle price becomes stale (e.g., Band Protocol stops updating for hours)
3. Real COTI price: $0.10 → $0.50 (5x increase)
4. Attacker deposits large amount using stale $0.10 price, pays 5x less fees
5. Attacker immediately withdraws at correct price, profiting from fee arbitrage

**Impact**: Protocol loses fee revenue; economic attack vector

**Recommended Fix**:
1. **Enforce minimum staleness**: `require(maxStaleness >= 1 hours, "Staleness too low")`
2. **Add circuit breaker**: Pause bridge if oracle is stale beyond threshold
3. **Use Chainlink price feeds** with built-in heartbeat/deviation checks

---

#### **H-2: Decimal Mismatch Check Only in Constructor, Not Enforced On-Chain**
**Severity**: High (Low Likelihood × High Impact)  
**Location**: `PrivacyBridgeERC20.sol` lines 125-126  
**Description**: Decimal parity is checked in constructor, but if public token is upgradeable and changes decimals post-deployment, the bridge will silently corrupt exchange rates.

**Attack Scenario**:
1. Bridge deployed with USDC (6 decimals) and p.USDC (6 decimals)
2. USDC upgrades to 18 decimals (hypothetical but possible with upgradeable tokens)
3. User deposits 1 USDC (now 1e18 units) → receives 1e18 p.USDC
4. User withdraws 1e18 p.USDC → receives 1e18 USDC (1 trillion dollars if USDC is now 18 decimals)

**Impact**: Catastrophic exchange rate corruption; bridge insolvency

**Recommended Fix**:
1. **Check decimals on every deposit/withdraw**: `require(IHasDecimals(address(token)).decimals() == IHasDecimals(address(privateToken)).decimals())`
2. **Use immutable tokens**: Only bridge non-upgradeable tokens
3. **Add emergency pause** if decimal mismatch detected

---

#### **H-3: Native Bridge Rescue Function Can Drain Withdrawal Liquidity**
**Severity**: High (Medium Likelihood × High Impact)  
**Location**: `PrivacyBridgeCotiNative.sol` lines 249-260  
**Description**: `rescueNative()` allows owner to rescue native COTI above `accumulatedFees`, but **does NOT account for user deposits** that need to be available for withdrawals. Owner can drain liquidity, breaking withdrawals.

**Attack Scenario**:
1. Users deposit 1000 COTI → bridge holds 1000 COTI, `accumulatedFees = 50 COTI`
2. Owner calls `rescueNative(owner, 950 COTI)` (allowed since 950 < 1000 - 50)
3. Bridge now holds 50 COTI (only fees)
4. Users try to withdraw 950 COTI → **REVERTS** with `InsufficientEthBalance`

**Impact**: Users cannot withdraw funds; bridge becomes insolvent

**Recommended Fix**:
```solidity
// Track total user deposits separately
uint256 public totalUserDeposits;

function _deposit(...) internal {
    // ...
    totalUserDeposits += netAmount;
}

function _withdraw(...) internal {
    // ...
    totalUserDeposits -= amount;
}

function rescueNative(address to, uint256 amount) external onlyOwner nonReentrant {
    // ...
    uint256 rescueable = address(this).balance - accumulatedFees - totalUserDeposits;
    if (amount > rescueable) revert ExceedsRescueableAmount();
    // ...
}
```

---

#### **H-4: Fee Refund Failure Silently Adds to Accumulated Fees**
**Severity**: High (Medium Likelihood × Medium Impact)  
**Location**: `PrivacyBridgeERC20.sol` lines 105-111  
**Description**: When refunding excess native COTI fees, if the refund fails (e.g., user is a contract without `receive()`), the excess is added to `accumulatedCotiFees` instead of reverting. This means users lose their excess payment without consent.

**Attack Scenario**:
1. User sends 100 COTI for a 10 COTI fee (90 COTI excess)
2. User is a contract without `receive()` function
3. Refund fails → 90 COTI added to `accumulatedCotiFees`
4. User loses 90 COTI; owner can withdraw it later

**Impact**: Users lose excess fees; protocol gains unearned revenue

**Recommended Fix**:
```solidity
function _collectDynamicNativeFee(uint256 fee) internal {
    if (msg.value < fee) revert InsufficientCotiFee();
    accumulatedCotiFees += fee;
    if (msg.value > fee) {
        uint256 excess = msg.value - fee;
        (bool ok, ) = msg.sender.call{value: excess}("");
        // CRITICAL FIX: Revert if refund fails instead of keeping excess
        if (!ok) revert EthTransferFailed();
    }
}
```

---

### **MEDIUM SEVERITY**

#### **M-1: Owner Can Front-Run Users by Changing Fees**
**Severity**: Medium (High Likelihood × Low Impact)  
**Location**: `PrivacyBridge.sol` lines 355-388  
**Description**: Owner/operator can change dynamic fee parameters (`setDepositDynamicFee`, `setWithdrawDynamicFee`) without timelock. Malicious owner can front-run user transactions to maximize fees.

**Attack Scenario**:
1. User calls `estimateDepositFee(1000 ETH)` → fee = 10 COTI
2. User submits `deposit(1000 ETH, oracleTimestamp)` transaction
3. Owner front-runs with `setDepositDynamicFee(1000 ether, 10000, 10000 ether)` (10x higher)
4. User's transaction executes with 100 COTI fee instead of 10 COTI
5. Oracle timestamp still matches, so transaction succeeds with inflated fee

**Impact**: Users pay unexpected fees; loss of trust

**Recommended Fix**:
1. **Add timelock**: Fee changes take effect after 24-48 hours
2. **Add max fee change limit**: Fees can only change by ±20% per update
3. **Emit events before changes**: Give users time to cancel pending transactions

---

#### **M-2: No Slippage Protection on Deposits/Withdrawals**
**Severity**: Medium (High Likelihood × Medium Impact)  
**Location**: `PrivacyBridgeERC20.sol` lines 140-168, 176-207  
**Description**: Users cannot specify maximum acceptable fee. If oracle price changes between estimate and execution (even if timestamp matches), users may pay more than expected.

**Recommended Fix**:
```solidity
function deposit(uint256 amount, uint256 oracleTimestamp, uint256 maxFeeAccepted) external payable {
    // ...
    uint256 fee = _computeErc20Fee(...);
    if (fee > maxFeeAccepted) revert FeeExceedsSlippage();
    // ...
}
```

---

#### **M-3: Centralized Control Without Multisig or Timelock**
**Severity**: Medium (Low Likelihood × High Impact)  
**Location**: All contracts - `Ownable` pattern  
**Description**: Single owner EOA controls pause, limits, fees, oracle, and fund rescue. Compromised owner key = total protocol compromise.

**Recommended Fix**:
1. **Use Gnosis Safe multisig** for owner role (3-of-5 or 5-of-9)
2. **Add timelock** for sensitive operations (fee changes, oracle updates)
3. **Implement emergency pause guardian** separate from owner

---

#### **M-4: Oracle Price Can Be Manipulated via Band Protocol Vulnerabilities**
**Severity**: Medium (Low Likelihood × High Impact)  
**Location**: `CotiPriceConsumer.sol` lines 63-72  
**Description**: Bridge relies entirely on Band Protocol oracle. If Band is manipulated (e.g., via validator collusion, data source manipulation), bridge fees can be exploited.

**Recommended Fix**:
1. **Use multiple oracles**: Chainlink + Band, take median
2. **Add circuit breaker**: Pause if price deviates >20% from TWAP
3. **Implement price bounds**: Reject prices outside reasonable range

---

### **LOW SEVERITY**

#### **L-1: Missing Zero-Address Checks in Some Functions**
**Severity**: Low  
**Location**: Various  
**Description**: Some functions lack zero-address validation (e.g., `setPriceOracle` checks, but others may not).

**Recommended Fix**: Add `if (addr == address(0)) revert InvalidAddress()` to all address-setting functions.

---

#### **L-2: Events Missing Indexed Parameters**
**Severity**: Low  
**Location**: Various events  
**Description**: Some events lack `indexed` parameters, making off-chain filtering harder.

**Recommended Fix**: Add `indexed` to key parameters (amounts, addresses) in events.

---

#### **L-3: No Emergency Withdrawal Mechanism for Users**
**Severity**: Low  
**Location**: All bridges  
**Description**: If bridge is paused indefinitely, users cannot withdraw funds. No escape hatch exists.

**Recommended Fix**: Add time-limited pause (e.g., auto-unpause after 7 days) or emergency withdrawal function.

---

#### **L-4: Solidity Version Not Pinned**
**Severity**: Low  
**Location**: All contracts use `^0.8.19`  
**Description**: Floating pragma can lead to different compiler versions in production vs testing.

**Recommended Fix**: Pin to exact version: `pragma solidity 0.8.19;`

---

## OVERALL RISK SUMMARY

**Risk Level**: **HIGH**

**Justification**:
- **3 Critical vulnerabilities** (oracle manipulation, reentrancy risk, rescue function flaw)
- **4 High vulnerabilities** (staleness, decimal mismatch, liquidity drain, fee refund)
- **4 Medium vulnerabilities** (front-running, slippage, centralization, oracle trust)
- **4 Low/Informational issues**

**Key Concerns**:
1. **Oracle dependency** is single point of failure with multiple attack vectors
2. **Centralized admin** can rug-pull or manipulate fees without timelock
3. **Rescue functions** can drain user funds (both ERC20 and native bridges)
4. **MPC precompile trust** is unavoidable but undocumented in user-facing materials

---

## KEY ASSUMPTIONS MADE

1. Solidity 0.8.19+ with built-in overflow checks
2. OpenZeppelin contracts (ReentrancyGuard, SafeERC20, Pausable, AccessControl) are secure
3. Band Protocol oracle is generally honest but may have staleness/manipulation risks
4. MPC precompile at expected address is correct (cannot be verified on-chain)
5. Public ERC20 tokens are standard (no fee-on-transfer, no rebasing, no blacklists)
6. Private token implementations correctly enforce MINTER_ROLE and BURNER_ROLE

---

## RECOMMENDATIONS FOR FURTHER REVIEW

### Immediate Actions (Before Mainnet):
1. **Fix C-3**: Add `token` to rescue blacklist in `PrivacyBridgeERC20.rescueERC20()`
2. **Fix H-3**: Track `totalUserDeposits` in native bridge rescue logic
3. **Fix H-4**: Revert on refund failure instead of keeping excess fees
4. **Add slippage protection**: `maxFeeAccepted` parameter on deposit/withdraw

### High Priority (Before Mainnet):
1. **Implement multisig**: Replace single owner with 3-of-5 Gnosis Safe
2. **Add timelock**: 24-48 hour delay on fee/oracle changes
3. **Oracle redundancy**: Use Chainlink + Band, take median price
4. **Comprehensive testing**: Fuzzing with Echidna/Foundry for reentrancy, overflow, oracle manipulation

### Medium Priority (Post-Launch):
1. **Formal verification**: Verify core invariants (conservation of funds, fee accounting)
2. **On-chain monitoring**: Alert on large withdrawals, fee changes, oracle staleness
3. **Bug bounty program**: Incentivize white-hat discovery of vulnerabilities
4. **Incident response plan**: Document emergency pause procedures, fund recovery

### Testing Recommendations:
1. **Reentrancy tests**: Malicious receiver contracts for native bridge
2. **Oracle manipulation tests**: Simulate stale prices, flash loan attacks
3. **Decimal mismatch tests**: Upgradeable token scenarios
4. **Rescue function tests**: Verify cannot drain user funds
5. **Fee edge cases**: Zero fees, max fees, overflow scenarios

---

## POSITIVE OBSERVATIONS

1. ✅ **ReentrancyGuard** properly applied to all value-transfer functions
2. ✅ **SafeERC20** used for all ERC20 transfers (prevents return value issues)
3. ✅ **Pausable** mechanism allows emergency response
4. ✅ **Decimal parity check** in constructor prevents silent exchange rate corruption
5. ✅ **Oracle timestamp validation** prevents some fee manipulation (though has DoS risk)
6. ✅ **Role-based access control** separates owner and operator privileges
7. ✅ **Comprehensive events** for all state changes (good for monitoring)
8. ✅ **No unchecked blocks** or assembly (reduces low-level bug risk)

---

**END OF AUDIT REPORT**

**Auditor Note**: This audit was performed on the provided codebase snapshot. Any changes to contracts, dependencies, or deployment configuration require re-audit. The MPC precompile trust assumption is fundamental and cannot be eliminated through contract-level security measures.
