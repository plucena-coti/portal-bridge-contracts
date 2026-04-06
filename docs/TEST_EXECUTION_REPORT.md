# Test Execution Report — Unified Privacy Bridges Suite

**Network:** cotiTestnet (chainId 7082400)  
**Run date:** 6 April 2026 at 09:35 GMT-3  
**Total duration:** 861.8s  

---

## Summary

| Status | Count |
|--------|-------|
| ✅ PASSED  | 36 |
| ❌ FAILED  | 6 |
| ⏭ SKIPPED | 0 |
| **Total** | **40** |

---

### Native Bridge (PrivacyBridgeCotiNative)

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 1 | "before all" hook for "Test 1: native: Should set correct initial state" | ❌ FAILED | 22ms |

### ERC20 Bridge

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 2 | "before all" hook for "Test 6: WETH: Should set correct initial state" | ❌ FAILED | 235ms |

### PrivateERC20 Public-Amount Functions

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 3 | Test 22: PrivateCOTI: mint(address,uint256) should mint tokens and emit Transfer | ✅ PASSED | 15.8s |
| Test 4 | Test 23: PrivateCOTI: mint(address,uint256) should revert for non-MINTER_ROLE | ✅ PASSED | 10.7s |
| Test 5 | Test 24: PrivateCOTI: burn(uint256) should burn tokens and emit Transfer | ✅ PASSED | 20.5s |
| Test 6 | Test 25: PrivateCOTI: transfer(address,uint256) should transfer tokens and emit Transfer | ✅ PASSED | 19.7s |
| Test 7 | Test 26: PrivateCOTI: approve(address,uint256) should set allowance and emit Approval | ✅ PASSED | 19.7s |
| Test 8 | Test 27: PrivateCOTI: transferFrom(address,address,uint256) should spend allowance and emit Transfer | ✅ PASSED | 14.7s |
| Test 9 | Test 28: PrivateCOTI (extend): setAccountEncryptionAddress & accountEncryptionAddress | ✅ PASSED | 14.5s |
| Test 10 | Test 29: PrivateCOTI (extend): transferAndCall (ERC677) triggers onTokenReceived | ❌ FAILED | 8ms |
| Test 11 | Test 30: PrivateCOTI (extend): transfer(itUint256,address) with encrypted payload | ✅ PASSED | 14.4s |
| Test 12 | Test 31: PrivateCOTI (extend): approve(address,itUint256) and allowance checks | ✅ PASSED | 29.9s |
| Test 13 | Test 32: PrivateCOTI (extend): transferFrom(address,address,itUint256) | ✅ PASSED | 30.4s |
| Test 14 | Test 33: PrivateWrappedEther: mint(address,uint256) should mint tokens and emit Transfer | ✅ PASSED | 15.5s |
| Test 15 | Test 34: PrivateWrappedEther: mint(address,uint256) should revert for non-MINTER_ROLE | ✅ PASSED | 10.9s |
| Test 16 | Test 35: PrivateWrappedEther: burn(uint256) should burn tokens and emit Transfer | ✅ PASSED | 20.0s |
| Test 17 | Test 36: PrivateWrappedEther: transfer(address,uint256) should transfer tokens and emit Transfer | ✅ PASSED | 19.7s |
| Test 18 | Test 37: PrivateWrappedEther: approve(address,uint256) should set allowance and emit Approval | ✅ PASSED | 20.0s |
| Test 19 | Test 38: PrivateWrappedEther: transferFrom(address,address,uint256) should spend allowance and emit Transfer | ✅ PASSED | 14.5s |
| Test 20 | Test 39: PrivateWrappedEther (extend): setAccountEncryptionAddress & accountEncryptionAddress | ✅ PASSED | 14.9s |
| Test 21 | Test 40: PrivateWrappedEther (extend): transferAndCall (ERC677) triggers onTokenReceived | ❌ FAILED | 6ms |
| Test 22 | Test 41: PrivateWrappedEther (extend): transfer(itUint256,address) with encrypted payload | ✅ PASSED | 14.1s |
| Test 23 | Test 42: PrivateWrappedEther (extend): approve(address,itUint256) and allowance checks | ✅ PASSED | 30.3s |
| Test 24 | Test 43: PrivateWrappedEther (extend): transferFrom(address,address,itUint256) | ✅ PASSED | 29.8s |

### Coverage Improvements — PrivacyBridgeCotiNative

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 25 | Test 45: coverage: getBridgeBalance explicit check | ✅ PASSED | 1.6s |
| Test 26 | Test 46: coverage: receive() fallback with direct transfer | ✅ PASSED | 19.3s |
| Test 27 | Test 47: coverage: onTokenReceived direct call should revert InvalidAddress | ✅ PASSED | 916ms |

### Coverage Improvements — PrivateERC20

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 28 | Test 48: coverage: name() returns token name | ✅ PASSED | 919ms |
| Test 29 | Test 49: coverage: symbol() returns token symbol | ✅ PASSED | 832ms |
| Test 30 | Test 50: coverage: decimals() returns 18 | ✅ PASSED | 751ms |
| Test 31 | Test 51: coverage: totalSupply() returns 0 (not implemented) | ✅ PASSED | 662ms |
| Test 32 | Test 52: coverage: balanceOf(address) returns ciphertext after mint | ✅ PASSED | 18.2s |
| Test 33 | Test 53: coverage: balanceOf() returns garbled balance | ✅ PASSED | 1.9s |
| Test 34 | Test 54: coverage: allowance(address,address) returns Allowance struct | ✅ PASSED | 17.9s |
| Test 35 | Test 55: coverage: allowance(address,bool) returns garbled allowance | ✅ PASSED | 1.9s |
| Test 36 | Test 56: coverage: mint(address,itUint256) encrypted mint | ✅ PASSED | 17.0s |
| Test 37 | Test 57: coverage: burn(itUint256) encrypted burn | ✅ PASSED | 15.4s |
| Test 38 | Test 58: coverage: supportsInterface(bytes4) checks ERC165 | ✅ PASSED | 930ms |
| Test 39 | Test 59: coverage: transferAndCall(address,itUint256,bytes) encrypted ERC677 | ❌ FAILED | 7ms |

### Coverage

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 40 | Test 60: coverage: PrivateWrappedEther mint(address,itUint256) encrypted mint | ✅ PASSED | 15.0s |
| Test 41 | Test 61: coverage: PrivateWrappedEther burn(itUint256) encrypted burn | ✅ PASSED | 34.6s |
| Test 42 | Test 62: coverage: PrivateWrappedEther transferAndCall(address,itUint256,bytes) encrypted ERC677 | ❌ FAILED | 11ms |

---

## Failure Details

### 1) "before all" hook for "Test 1: native: Should set correct initial state"

**Suite:** Native Bridge (PrivacyBridgeCotiNative)  
**Error:**
```
HH700: Artifact for contract "MockPrivateERC20" not found. 
```

### 2) "before all" hook for "Test 6: WETH: Should set correct initial state"

**Suite:** ERC20 Bridge  
**Error:**
```
HH700: Artifact for contract "WETH9" not found. 
```

### 3) Test 29: PrivateCOTI (extend): transferAndCall (ERC677) triggers onTokenReceived

**Suite:** PrivateERC20 Public-Amount Functions  
**Error:**
```
HH700: Artifact for contract "MockTokenReceiver" not found. 
```

### 4) Test 40: PrivateWrappedEther (extend): transferAndCall (ERC677) triggers onTokenReceived

**Suite:** PrivateERC20 Public-Amount Functions  
**Error:**
```
HH700: Artifact for contract "MockTokenReceiver" not found. 
```

### 5) Test 59: coverage: transferAndCall(address,itUint256,bytes) encrypted ERC677

**Suite:** Coverage Improvements — PrivateERC20  
**Error:**
```
HH700: Artifact for contract "MockTokenReceiver" not found. 
```

### 6) Test 62: coverage: PrivateWrappedEther transferAndCall(address,itUint256,bytes) encrypted ERC677

**Suite:** Coverage  
**Error:**
```
HH700: Artifact for contract "MockTokenReceiver" not found. 
```

---

*Generated by `scripts/generate-test-report.cjs` on 6 April 2026 at 09:35 GMT-3.*
