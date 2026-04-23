# Test Execution Report

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 50 |
| Passed | 50 |
| Failed | 0 |
| Pending | 0 |
| Duration | 1329.9s |
| Run Date | 2026-04-06 13:33:15 UTC |

## Deployed Contract Addresses

| Contract | Address |
|----------|---------|
| undefined | `0x8860eF23E72110A3df47eC90F6B5F07d82Ba1486` |
| undefined | `0xFda8137AE339DeD6C9B9d8dF3C14DD016f081a99` |
| undefined | `0x450304F22B41f383363F76e877B82CCA800bb9ae` |
| undefined | `0x8bca4e6bbE402DB4aD189A316137aD08206154FB` |
| undefined | `0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c` |
| undefined | `0x03eeA59b1F0Dfeaece75531b27684DD882f79759` |
| undefined | `0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c` |
| undefined | `0x7a13ABf1CdF25439d7728caF711C14ed847F8EE2` |
| undefined | `0x03eeA59b1F0Dfeaece75531b27684DD882f79759` |
| undefined | `0x03eeA59b1F0Dfeaece75531b27684DD882f79759` |
| undefined | `0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c` |

## Test Results

### Unified Privacy Bridges Suite Native Bridge (PrivacyBridgeCotiNative)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 1: native: Should set correct initial state | ✅ passed | 1502ms |
| 2 | Test 2: native: Should allow deposit of native COTI | ✅ passed | 20189ms |
| 3 | Test 3: native: Should allow withdrawal of native COTI | ✅ passed | 33840ms |
| 4 | Test 4: native: Should deduct fee and let owner withdraw fees | ✅ passed | 59066ms |
| 5 | Test 5: native: Should rescue native COTI | ✅ passed | 15487ms |

### Unified Privacy Bridges Suite ERC20 Bridge (WETH)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 6: WETH: Should set correct initial state | ✅ passed | 2053ms |
| 2 | Test 7: WETH: Should allow deposit | ✅ passed | 33610ms |
| 3 | Test 8: WETH: Should allow withdrawal | ✅ passed | 30365ms |
| 4 | Test 9: WETH: Should track fees and let owner withdraw | ✅ passed | 44715ms |
| 5 | Test 10: WETH: Should rescue redundant ERC20 tokens | ✅ passed | 35042ms |

### Unified Privacy Bridges Suite PrivateERC20 Public-Amount Functions (PrivateCOTI)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 22: PrivateCOTI: mint(address,uint256) should mint tokens and emit Transfer | ✅ passed | 15762ms |
| 2 | Test 23: PrivateCOTI: mint(address,uint256) should revert for non-MINTER_ROLE | ✅ passed | 10707ms |
| 3 | Test 24: PrivateCOTI: burn(uint256) should burn tokens and emit Transfer | ✅ passed | 14492ms |
| 4 | Test 25: PrivateCOTI: transfer(address,uint256) should transfer tokens and emit Transfer | ✅ passed | 15113ms |
| 5 | Test 26: PrivateCOTI: approve(address,uint256) should set allowance and emit Approval | ✅ passed | 15034ms |
| 6 | Test 27: PrivateCOTI: transferFrom(address,address,uint256) should spend allowance and emit Transfer | ✅ passed | 14381ms |
| 7 | Test 28: PrivateCOTI (extend): setAccountEncryptionAddress & accountEncryptionAddress | ✅ passed | 15202ms |
| 8 | Test 29: PrivateCOTI (extend): transferAndCall (ERC677) triggers onTokenReceived | ✅ passed | 24440ms |
| 9 | Test 30: PrivateCOTI (extend): transfer(itUint256,address) with encrypted payload | ✅ passed | 15056ms |
| 10 | Test 31: PrivateCOTI (extend): approve(address,itUint256) and allowance checks | ✅ passed | 30103ms |
| 11 | Test 32: PrivateCOTI (extend): transferFrom(address,address,itUint256) | ✅ passed | 30263ms |

### Unified Privacy Bridges Suite PrivateERC20 Public-Amount Functions (PrivateWrappedEther)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 33: PrivateWrappedEther: mint(address,uint256) should mint tokens and emit Transfer | ✅ passed | 16363ms |
| 2 | Test 34: PrivateWrappedEther: mint(address,uint256) should revert for non-MINTER_ROLE | ✅ passed | 10486ms |
| 3 | Test 35: PrivateWrappedEther: burn(uint256) should burn tokens and emit Transfer | ✅ passed | 14090ms |
| 4 | Test 36: PrivateWrappedEther: transfer(address,uint256) should transfer tokens and emit Transfer | ✅ passed | 14936ms |
| 5 | Test 37: PrivateWrappedEther: approve(address,uint256) should set allowance and emit Approval | ✅ passed | 15496ms |
| 6 | Test 38: PrivateWrappedEther: transferFrom(address,address,uint256) should spend allowance and emit Transfer | ✅ passed | 14940ms |
| 7 | Test 39: PrivateWrappedEther (extend): setAccountEncryptionAddress & accountEncryptionAddress | ✅ passed | 14578ms |
| 8 | Test 40: PrivateWrappedEther (extend): transferAndCall (ERC677) triggers onTokenReceived | ✅ passed | 24434ms |
| 9 | Test 41: PrivateWrappedEther (extend): transfer(itUint256,address) with encrypted payload | ✅ passed | 14746ms |
| 10 | Test 42: PrivateWrappedEther (extend): approve(address,itUint256) and allowance checks | ✅ passed | 30212ms |
| 11 | Test 43: PrivateWrappedEther (extend): transferFrom(address,address,itUint256) | ✅ passed | 30163ms |

### Unified Privacy Bridges Suite Coverage Improvements - PrivacyBridgeCotiNative

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 45: coverage: getBridgeBalance explicit check | ✅ passed | 1487ms |
| 2 | Test 46: coverage: receive() fallback with direct transfer | ✅ passed | 19671ms |
| 3 | Test 47: coverage: onTokenReceived direct call should revert InvalidAddress | ✅ passed | 756ms |

### Unified Privacy Bridges Suite Coverage Improvements - PrivateERC20

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 48: coverage: name() returns token name | ✅ passed | 919ms |
| 2 | Test 49: coverage: symbol() returns token symbol | ✅ passed | 736ms |
| 3 | Test 50: coverage: decimals() returns 18 | ✅ passed | 901ms |
| 4 | Test 51: coverage: totalSupply() returns 0 (not implemented) | ✅ passed | 696ms |
| 5 | Test 52: coverage: balanceOf(address) returns ciphertext after mint | ✅ passed | 18167ms |
| 6 | Test 53: coverage: balanceOf() returns garbled balance | ✅ passed | 1890ms |
| 7 | Test 54: coverage: allowance(address,address) returns Allowance struct | ✅ passed | 18259ms |
| 8 | Test 55: coverage: allowance(address,bool) returns garbled allowance | ✅ passed | 2267ms |
| 9 | Test 56: coverage: mint(address,itUint256) encrypted mint | ✅ passed | 16331ms |
| 10 | Test 57: coverage: burn(itUint256) encrypted burn | ✅ passed | 14550ms |
| 11 | Test 58: coverage: supportsInterface(bytes4) checks ERC165 | ✅ passed | 920ms |
| 12 | Test 59: coverage: transferAndCall(address,itUint256,bytes) encrypted ERC677 | ✅ passed | 24139ms |

### Unified Privacy Bridges Suite Coverage Improvements - PrivateWrappedEther

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 60: coverage: PrivateWrappedEther mint(address,itUint256) encrypted mint | ✅ passed | 15346ms |
| 2 | Test 61: coverage: PrivateWrappedEther burn(itUint256) encrypted burn | ✅ passed | 30151ms |
| 3 | Test 62: coverage: PrivateWrappedEther transferAndCall(address,itUint256,bytes) encrypted ERC677 | ✅ passed | 39669ms |

## Transaction Call Log

#### Test 2: native: Should allow deposit of native COTI

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivacyBridgeCotiNative.deposit() -> PrivateERC20Mock.mint | `0.02` | `0xa304d57e…` |

#### Test 3: native: Should allow withdrawal of native COTI

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateERC20Mock.approve | `0x8860eF23E72110A3df47eC90F6B5F07d82Ba1486`, `0.01` | `0xb004d8d0…` |
| PrivacyBridgeCotiNative.withdraw() -> PrivateERC20Mock.burn | `0.01` | `0x058600eb…` |

#### Test 4: native: Should deduct fee and let owner withdraw fees

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivacyBridgeCotiNative.setDepositFee | `10000` | `0xb7ad6d49…` |
| PrivacyBridgeCotiNative.deposit() -> PrivateERC20Mock.mint | `0.1` | `0xa3b6e39c…` |
| PrivacyBridgeCotiNative.withdrawFees | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0.001` | `0x8308f536…` |
| PrivacyBridgeCotiNative.setDepositFee | `0` | `0x9910190b…` |

#### Test 5: native: Should rescue native COTI

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivacyBridgeCotiNative.rescueNative | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0.0545` | `0x83342dab…` |
| PrivateWrappedEther.grantRole | `MINTER_ROLE`, `0x450304F22B41f383363F76e877B82CCA800bb9ae` | `0xe777591e…` |

#### Test 7: WETH: Should allow deposit

| Method | Args | Tx Hash |
|--------|------|---------|
| MockWETH.approve | `0x450304F22B41f383363F76e877B82CCA800bb9ae`, `10` | `0x5e2e0089…` |
| PrivacyBridgeERC20.deposit() -> PrivateERC20Mock.mint | `10` | `0xc36acf38…` |

#### Test 8: WETH: Should allow withdrawal

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateERC20Mock.approve | `0x450304F22B41f383363F76e877B82CCA800bb9ae`, `5` | `0xc8b1a69b…` |
| PrivacyBridgeERC20.withdraw() -> PrivateERC20Mock.burn | `5` | `0x64f3bf9a…` |

#### Test 9: WETH: Should track fees and let owner withdraw

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivacyBridgeERC20.setDepositFee | `10000` | `0xfb2d1594…` |
| MockWETH.approve | `0x450304F22B41f383363F76e877B82CCA800bb9ae`, `100` | `0x7c60fe0d…` |
| PrivacyBridgeERC20.deposit() -> PrivateERC20Mock.mint | `100` | `0xbe9f23c9…` |

#### Test 10: WETH: Should rescue redundant ERC20 tokens

| Method | Args | Tx Hash |
|--------|------|---------|
| ERC20Mock.mint | `0x450304F22B41f383363F76e877B82CCA800bb9ae`, `1` | `0x289eb10b…` |
| PrivacyBridgeERC20.rescueERC20 | `0x186541Ad6fFa1522b44faa76cD965b12A0Ef668f`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `1` | `0x53cad759…` |
| PrivateCOTI.grantRole | `MINTER_ROLE`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012` | `0x5a9a190a…` |

#### Test 22: PrivateCOTI: mint(address,uint256) should mint tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `10` | `0x9d4c3386…` |

#### Test 24: PrivateCOTI: burn(uint256) should burn tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.burn(uint256) | `1` | `0xd27ae3aa…` |

#### Test 25: PrivateCOTI: transfer(address,uint256) should transfer tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transfer(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0x45bf2685…` |

#### Test 26: PrivateCOTI: approve(address,uint256) should set allowance and emit Approval

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.approve(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0xe040db49…` |

#### Test 27: PrivateCOTI: transferFrom(address,address,uint256) should spend allowance and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transferFrom(address,address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0x03156edf…` |

#### Test 28: PrivateCOTI (extend): setAccountEncryptionAddress & accountEncryptionAddress

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.setAccountEncryptionAddress | `<mock_address>` | `0xdf52f447…` |

#### Test 29: PrivateCOTI (extend): transferAndCall (ERC677) triggers onTokenReceived

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transferAndCall | `0x3Df740763A445E01ff13fE2E5F7b17EEE17C7979`, `0.1`, `0x68656c...` | `0x15552d4b…` |

#### Test 30: PrivateCOTI (extend): transfer(itUint256,address) with encrypted payload

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transfer(to, itAmount) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x87c68da5…` |

#### Test 31: PrivateCOTI (extend): approve(address,itUint256) and allowance checks

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.approve(spender, itAmount) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x3e2c37bf…` |
| PrivateCOTI.reencryptAllowance | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `true` | `0xcacb5f25…` |

#### Test 32: PrivateCOTI (extend): transferFrom(address,address,itUint256)

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.approve(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `1` | `0xbc22169d…` |
| PrivateCOTI.transferFrom(from, to, itAmount) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0xb2c1b70a…` |
| PrivateWrappedEther.grantRole | `MINTER_ROLE`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012` | `0xdf9caab6…` |

#### Test 33: PrivateWrappedEther: mint(address,uint256) should mint tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `10` | `0xa6c5e37f…` |

#### Test 35: PrivateWrappedEther: burn(uint256) should burn tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.burn(uint256) | `1` | `0xe9df45ae…` |

#### Test 36: PrivateWrappedEther: transfer(address,uint256) should transfer tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.transfer(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0x64609d0e…` |

#### Test 37: PrivateWrappedEther: approve(address,uint256) should set allowance and emit Approval

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.approve(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0x2e554e8f…` |

#### Test 38: PrivateWrappedEther: transferFrom(address,address,uint256) should spend allowance and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.transferFrom(address,address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0xf012f5e8…` |

#### Test 39: PrivateWrappedEther (extend): setAccountEncryptionAddress & accountEncryptionAddress

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.setAccountEncryptionAddress | `<mock_address>` | `0x9a9f9f00…` |

#### Test 40: PrivateWrappedEther (extend): transferAndCall (ERC677) triggers onTokenReceived

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.transferAndCall | `0x94a40fA5FB0aa50e72409E21d95ceAFBC872F1cA`, `0.1`, `0x68656c...` | `0xde4c103c…` |

#### Test 41: PrivateWrappedEther (extend): transfer(itUint256,address) with encrypted payload

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.transfer(to, itAmount) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x6e3b08c4…` |

#### Test 42: PrivateWrappedEther (extend): approve(address,itUint256) and allowance checks

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.approve(spender, itAmount) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x52003ed1…` |
| PrivateWrappedEther.reencryptAllowance | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `true` | `0xf0209881…` |

#### Test 43: PrivateWrappedEther (extend): transferFrom(address,address,itUint256)

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.approve(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `1` | `0xab34ed51…` |
| PrivateWrappedEther.transferFrom(from, to, itAmount) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0xe0b08584…` |
| PrivateCOTI.grantRole | `MINTER_ROLE`, `0x7a13ABf1CdF25439d7728caF711C14ed847F8EE2` | `0x6a6bcabf…` |

#### Test 46: coverage: receive() fallback with direct transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| receive() | `0.01` | `0x9bb800af…` |

#### Test 47: coverage: onTokenReceived direct call should revert InvalidAddress

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.grantRole | `MINTER_ROLE`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012` | `0x4702222a…` |

#### Test 52: coverage: balanceOf(address) returns ciphertext after mint

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `5` | `0xacf2cdb4…` |

#### Test 54: coverage: allowance(address,address) returns Allowance struct

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.approve(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `1` | `0xd122e4a0…` |

#### Test 56: coverage: mint(address,itUint256) encrypted mint

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.mint(address,itUint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `3` | `0xc27a3254…` |

#### Test 57: coverage: burn(itUint256) encrypted burn

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.burn(itUint256) | `1` | `0x243c10e1…` |

#### Test 59: coverage: transferAndCall(address,itUint256,bytes) encrypted ERC677

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transferAndCall(address,itUint256,bytes) | `0x2B9800036Bd0bfA355D93D76DBb94dB413FbfEe2`, `0.5` | `0x30480919…` |
| PrivateWrappedEther.grantRole | `MINTER_ROLE`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012` | `0x51f28218…` |

#### Test 60: coverage: PrivateWrappedEther mint(address,itUint256) encrypted mint

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.mint(address,itUint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `3` | `0x2b62c247…` |

#### Test 61: coverage: PrivateWrappedEther burn(itUint256) encrypted burn

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `2` | `0xb093b3a8…` |
| PrivateWrappedEther.burn(itUint256) | `1` | `0x366c5965…` |

#### Test 62: coverage: PrivateWrappedEther transferAndCall(address,itUint256,bytes) encrypted ERC677

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `2` | `0x8064b1c5…` |
| PrivateWrappedEther.transferAndCall(address,itUint256,bytes) | `0xD0616dB808944c5efB3Df3B57ed106c64988f830`, `0.5` | `0x4e3bbe66…` |
