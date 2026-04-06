# Test Execution Report — Unified Privacy Bridges Suite

**Network:** cotiTestnet (chainId 7082400)  
**Run date:** 6 April 2026 at 10:33 GMT-3  
**Total duration:** 1329.9s  

---

## Summary

| Status | Count |
|--------|-------|
| ✅ PASSED  | 50 |
| ❌ FAILED  | 0 |
| ⏭ SKIPPED | 0 |
| **Total** | **50** |

---

### Native Bridge (PrivacyBridgeCotiNative)

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 1 | Test 1: native: Should set correct initial state | ✅ PASSED | 1.5s |
| Test 2 | Test 2: native: Should allow deposit of native COTI | ✅ PASSED | 20.2s |
| Test 3 | Test 3: native: Should allow withdrawal of native COTI | ✅ PASSED | 33.8s |
| Test 4 | Test 4: native: Should deduct fee and let owner withdraw fees | ✅ PASSED | 59.1s |
| Test 5 | Test 5: native: Should rescue native COTI | ✅ PASSED | 15.5s |

### ERC20 Bridge

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 6 | Test 6: WETH: Should set correct initial state | ✅ PASSED | 2.1s |
| Test 7 | Test 7: WETH: Should allow deposit | ✅ PASSED | 33.6s |
| Test 8 | Test 8: WETH: Should allow withdrawal | ✅ PASSED | 30.4s |
| Test 9 | Test 9: WETH: Should track fees and let owner withdraw | ✅ PASSED | 44.7s |
| Test 10 | Test 10: WETH: Should rescue redundant ERC20 tokens | ✅ PASSED | 35.0s |

### PrivateERC20 Public-Amount Functions

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 11 | Test 22: PrivateCOTI: mint(address,uint256) should mint tokens and emit Transfer | ✅ PASSED | 15.8s |
| Test 12 | Test 23: PrivateCOTI: mint(address,uint256) should revert for non-MINTER_ROLE | ✅ PASSED | 10.7s |
| Test 13 | Test 24: PrivateCOTI: burn(uint256) should burn tokens and emit Transfer | ✅ PASSED | 14.5s |
| Test 14 | Test 25: PrivateCOTI: transfer(address,uint256) should transfer tokens and emit Transfer | ✅ PASSED | 15.1s |
| Test 15 | Test 26: PrivateCOTI: approve(address,uint256) should set allowance and emit Approval | ✅ PASSED | 15.0s |
| Test 16 | Test 27: PrivateCOTI: transferFrom(address,address,uint256) should spend allowance and emit Transfer | ✅ PASSED | 14.4s |
| Test 17 | Test 28: PrivateCOTI (extend): setAccountEncryptionAddress & accountEncryptionAddress | ✅ PASSED | 15.2s |
| Test 18 | Test 29: PrivateCOTI (extend): transferAndCall (ERC677) triggers onTokenReceived | ✅ PASSED | 24.4s |
| Test 19 | Test 30: PrivateCOTI (extend): transfer(itUint256,address) with encrypted payload | ✅ PASSED | 15.1s |
| Test 20 | Test 31: PrivateCOTI (extend): approve(address,itUint256) and allowance checks | ✅ PASSED | 30.1s |
| Test 21 | Test 32: PrivateCOTI (extend): transferFrom(address,address,itUint256) | ✅ PASSED | 30.3s |
| Test 22 | Test 33: PrivateWrappedEther: mint(address,uint256) should mint tokens and emit Transfer | ✅ PASSED | 16.4s |
| Test 23 | Test 34: PrivateWrappedEther: mint(address,uint256) should revert for non-MINTER_ROLE | ✅ PASSED | 10.5s |
| Test 24 | Test 35: PrivateWrappedEther: burn(uint256) should burn tokens and emit Transfer | ✅ PASSED | 14.1s |
| Test 25 | Test 36: PrivateWrappedEther: transfer(address,uint256) should transfer tokens and emit Transfer | ✅ PASSED | 14.9s |
| Test 26 | Test 37: PrivateWrappedEther: approve(address,uint256) should set allowance and emit Approval | ✅ PASSED | 15.5s |
| Test 27 | Test 38: PrivateWrappedEther: transferFrom(address,address,uint256) should spend allowance and emit Transfer | ✅ PASSED | 14.9s |
| Test 28 | Test 39: PrivateWrappedEther (extend): setAccountEncryptionAddress & accountEncryptionAddress | ✅ PASSED | 14.6s |
| Test 29 | Test 40: PrivateWrappedEther (extend): transferAndCall (ERC677) triggers onTokenReceived | ✅ PASSED | 24.4s |
| Test 30 | Test 41: PrivateWrappedEther (extend): transfer(itUint256,address) with encrypted payload | ✅ PASSED | 14.7s |
| Test 31 | Test 42: PrivateWrappedEther (extend): approve(address,itUint256) and allowance checks | ✅ PASSED | 30.2s |
| Test 32 | Test 43: PrivateWrappedEther (extend): transferFrom(address,address,itUint256) | ✅ PASSED | 30.2s |

### Coverage Improvements — PrivacyBridgeCotiNative

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 33 | Test 45: coverage: getBridgeBalance explicit check | ✅ PASSED | 1.5s |
| Test 34 | Test 46: coverage: receive() fallback with direct transfer | ✅ PASSED | 19.7s |
| Test 35 | Test 47: coverage: onTokenReceived direct call should revert InvalidAddress | ✅ PASSED | 756ms |

### Coverage Improvements — PrivateERC20

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 36 | Test 48: coverage: name() returns token name | ✅ PASSED | 919ms |
| Test 37 | Test 49: coverage: symbol() returns token symbol | ✅ PASSED | 736ms |
| Test 38 | Test 50: coverage: decimals() returns 18 | ✅ PASSED | 901ms |
| Test 39 | Test 51: coverage: totalSupply() returns 0 (not implemented) | ✅ PASSED | 696ms |
| Test 40 | Test 52: coverage: balanceOf(address) returns ciphertext after mint | ✅ PASSED | 18.2s |
| Test 41 | Test 53: coverage: balanceOf() returns garbled balance | ✅ PASSED | 1.9s |
| Test 42 | Test 54: coverage: allowance(address,address) returns Allowance struct | ✅ PASSED | 18.3s |
| Test 43 | Test 55: coverage: allowance(address,bool) returns garbled allowance | ✅ PASSED | 2.3s |
| Test 44 | Test 56: coverage: mint(address,itUint256) encrypted mint | ✅ PASSED | 16.3s |
| Test 45 | Test 57: coverage: burn(itUint256) encrypted burn | ✅ PASSED | 14.6s |
| Test 46 | Test 58: coverage: supportsInterface(bytes4) checks ERC165 | ✅ PASSED | 920ms |
| Test 47 | Test 59: coverage: transferAndCall(address,itUint256,bytes) encrypted ERC677 | ✅ PASSED | 24.1s |

### Coverage

| Seq | Test Name | Status | Duration |
|-----|-----------|--------|----------|
| Test 48 | Test 60: coverage: PrivateWrappedEther mint(address,itUint256) encrypted mint | ✅ PASSED | 15.3s |
| Test 49 | Test 61: coverage: PrivateWrappedEther burn(itUint256) encrypted burn | ✅ PASSED | 30.2s |
| Test 50 | Test 62: coverage: PrivateWrappedEther transferAndCall(address,itUint256,bytes) encrypted ERC677 | ✅ PASSED | 39.7s |

---

*Generated by `scripts/generate-test-report.cjs` on 6 April 2026 at 10:33 GMT-3.*
