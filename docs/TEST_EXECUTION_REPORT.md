# Test Execution Report

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 50 |
| Passed | 47 |
| Failed | 3 |
| Pending | 0 |
| Duration | 1448.0s |
| Run Date | 2026-04-23 18:28:16 UTC |

> ⚠️ **3 test(s) failed.** See details below.

## Deployed Contract Addresses

| Contract | Address |
|----------|---------|
| PrivacyBridgeCotiNative | `0xb29Ea1A7007a1A3884b85F173b00818F13348859` |
| PrivateERC20Mock | `0xaa98dfeAeDCb0c6bb328c7b2dB10686b70dE0A03` |
| MockCotiPriceConsumer | `0x084adf19d1458FbDCBc252F8fe0Fc1f12d35EA9B` |
| PrivacyBridgeWETH | `0x8d51A08d1a3136E5c4eF4755A7D3ebc3B9F55199` |
| ERC20Mock | `0x8bca4e6bbE402DB4aD189A316137aD08206154FB` |
| PrivateToken | `0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c` |
| PrivateCOTI | `0x03eeA59b1F0Dfeaece75531b27684DD882f79759` |
| PrivateWrappedEther | `0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c` |
| PrivacyBridgeCotiNative | `0xFF3F3458305b066850cEC7B0DBB8C3B7231a5F3F` |
| PrivateCOTI | `0x03eeA59b1F0Dfeaece75531b27684DD882f79759` |
| MockCotiPriceConsumer | `0xb518Ef7c389fCfF7332E11Fe8282d328e1130ed0` |
| PrivateCOTI | `0x03eeA59b1F0Dfeaece75531b27684DD882f79759` |
| PrivateWrappedEther | `0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c` |

## Test Results

### Unified Privacy Bridges Suite Native Bridge (PrivacyBridgeCotiNative)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 1: native: Should set correct initial state | ✅ passed | 1630ms |
| 2 | Test 2: native: Should allow deposit of native COTI | ❌ failed | 8651ms |
| 3 | Test 3: native: Should allow withdrawal of native COTI | ❌ failed | 19315ms |
| 4 | Test 4: native: Should deduct dynamic fee and let owner withdraw fees | ✅ passed | 31096ms |
| 5 | Test 5: native: Should rescue native COTI | ✅ passed | 14496ms |

### Unified Privacy Bridges Suite ERC20 Bridge (WETH)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 6: WETH: Should set correct initial state | ✅ passed | 1878ms |
| 2 | Test 7: WETH: Should allow deposit | ✅ passed | 33333ms |
| 3 | Test 8: WETH: Should allow withdrawal | ✅ passed | 29923ms |
| 4 | Test 9: WETH: Should track dynamic fees in accumulatedCotiFees | ✅ passed | 30087ms |
| 5 | Test 10: WETH: Should rescue redundant ERC20 tokens | ✅ passed | 35459ms |

### Unified Privacy Bridges Suite PrivateERC20 Public-Amount Functions (PrivateCOTI)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 22: PrivateCOTI: mint(address,uint256) should mint tokens and emit Transfer | ✅ passed | 16604ms |
| 2 | Test 23: PrivateCOTI: mint(address,uint256) should revert for non-MINTER_ROLE | ✅ passed | 15288ms |
| 3 | Test 24: PrivateCOTI: burn(uint256) should burn tokens and emit Transfer | ✅ passed | 19029ms |
| 4 | Test 25: PrivateCOTI: transfer(address,uint256) should transfer tokens and emit Transfer | ✅ passed | 14528ms |
| 5 | Test 26: PrivateCOTI: approve(address,uint256) should set allowance and emit Approval | ✅ passed | 15592ms |
| 6 | Test 27: PrivateCOTI: transferFrom(address,address,uint256) should spend allowance and emit Transfer | ✅ passed | 14278ms |
| 7 | Test 28: PrivateCOTI (extend): setAccountEncryptionAddress & accountEncryptionAddress | ✅ passed | 15152ms |
| 8 | Test 29: PrivateCOTI (extend): transferAndCall (ERC677) triggers onTokenReceived | ✅ passed | 24119ms |
| 9 | Test 30: PrivateCOTI (extend): transfer(itUint256,address) with encrypted payload | ✅ passed | 15132ms |
| 10 | Test 31: PrivateCOTI (extend): approve(address,itUint256) and allowance checks | ✅ passed | 30060ms |
| 11 | Test 32: PrivateCOTI (extend): transferFrom(address,address,itUint256) | ✅ passed | 30360ms |

### Unified Privacy Bridges Suite PrivateERC20 Public-Amount Functions (PrivateWrappedEther)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 33: PrivateWrappedEther: mint(address,uint256) should mint tokens and emit Transfer | ✅ passed | 16008ms |
| 2 | Test 34: PrivateWrappedEther: mint(address,uint256) should revert for non-MINTER_ROLE | ✅ passed | 16516ms |
| 3 | Test 35: PrivateWrappedEther: burn(uint256) should burn tokens and emit Transfer | ✅ passed | 18836ms |
| 4 | Test 36: PrivateWrappedEther: transfer(address,uint256) should transfer tokens and emit Transfer | ✅ passed | 14350ms |
| 5 | Test 37: PrivateWrappedEther: approve(address,uint256) should set allowance and emit Approval | ✅ passed | 134757ms |
| 6 | Test 38: PrivateWrappedEther: transferFrom(address,address,uint256) should spend allowance and emit Transfer | ✅ passed | 15566ms |
| 7 | Test 39: PrivateWrappedEther (extend): setAccountEncryptionAddress & accountEncryptionAddress | ✅ passed | 14976ms |
| 8 | Test 40: PrivateWrappedEther (extend): transferAndCall (ERC677) triggers onTokenReceived | ✅ passed | 24141ms |
| 9 | Test 41: PrivateWrappedEther (extend): transfer(itUint256,address) with encrypted payload | ✅ passed | 14863ms |
| 10 | Test 42: PrivateWrappedEther (extend): approve(address,itUint256) and allowance checks | ✅ passed | 29681ms |
| 11 | Test 43: PrivateWrappedEther (extend): transferFrom(address,address,itUint256) | ✅ passed | 30229ms |

### Unified Privacy Bridges Suite Coverage Improvements - PrivacyBridgeCotiNative

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 45: coverage: getBridgeBalance explicit check | ✅ passed | 1617ms |
| 2 | Test 46: coverage: receive() fallback with direct transfer | ❌ failed | 3848ms |
| 3 | Test 47: coverage: onTokenReceived direct call should revert InvalidAddress | ✅ passed | 793ms |

### Unified Privacy Bridges Suite Coverage Improvements - PrivateERC20

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 48: coverage: name() returns token name | ✅ passed | 848ms |
| 2 | Test 49: coverage: symbol() returns token symbol | ✅ passed | 725ms |
| 3 | Test 50: coverage: decimals() returns 18 | ✅ passed | 850ms |
| 4 | Test 51: coverage: totalSupply() returns 0 (not implemented) | ✅ passed | 718ms |
| 5 | Test 52: coverage: balanceOf(address) returns ciphertext after mint | ✅ passed | 17682ms |
| 6 | Test 53: coverage: balanceOf() returns garbled balance | ✅ passed | 1945ms |
| 7 | Test 54: coverage: allowance(address,address) returns Allowance struct | ✅ passed | 18560ms |
| 8 | Test 55: coverage: allowance(address,bool) returns garbled allowance | ✅ passed | 2082ms |
| 9 | Test 56: coverage: mint(address,itUint256) encrypted mint | ✅ passed | 16531ms |
| 10 | Test 57: coverage: burn(itUint256) encrypted burn | ✅ passed | 15881ms |
| 11 | Test 58: coverage: supportsInterface(bytes4) checks ERC165 | ✅ passed | 847ms |
| 12 | Test 59: coverage: transferAndCall(address,itUint256,bytes) encrypted ERC677 | ✅ passed | 27980ms |

### Unified Privacy Bridges Suite Coverage Improvements - PrivateWrappedEther

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | Test 60: coverage: PrivateWrappedEther mint(address,itUint256) encrypted mint | ✅ passed | 15133ms |
| 2 | Test 61: coverage: PrivateWrappedEther burn(itUint256) encrypted burn | ✅ passed | 29808ms |
| 3 | Test 62: coverage: PrivateWrappedEther transferAndCall(address,itUint256,bytes) encrypted ERC677 | ✅ passed | 40366ms |

## Failure Details

### ❌ Unified Privacy Bridges Suite Native Bridge (PrivacyBridgeCotiNative) Test 2: native: Should allow deposit of native COTI

```
transaction execution reverted (action="sendTransaction", data=null, reason=null, invocation=null, revert=null, transaction={ "data": "", "from": "0x226D3Eb51e24D98150e682d0337c214779cD52A2", "to": "0xb29Ea1A7007a1A3884b85F173b00818F13348859" }, receipt={ "_type": "TransactionReceipt", "blobGasPrice": null, "blobGasUsed": null, "blockHash": "0x17216178734fdb404f4375ec0314ee69afcef353a12290543278e1390f266e5c", "blockNumber": 7078396, "contractAddress": null, "cumulativeGasUsed": "51480", "from": "0x226D3Eb51e24D98150e682d0337c214779cD52A2", "gasPrice": "10000000000", "gasUsed": "51480", "hash": "0x91a9a39032e87be37176052e5faac912d2a4ed8fde81fcdbc12af6b8445ed0ae", "index": 0, "logs": [  ], "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "root": null, "status": 0, "to": "0xb29Ea1A7007a1A3884b85F173b00818F13348859" }, code=CALL_EXCEPTION, version=6.16.0)
```

### ❌ Unified Privacy Bridges Suite Native Bridge (PrivacyBridgeCotiNative) Test 3: native: Should allow withdrawal of native COTI

```
transaction execution reverted (action="sendTransaction", data=null, reason=null, invocation=null, revert=null, transaction={ "data": "", "from": "0x226D3Eb51e24D98150e682d0337c214779cD52A2", "to": "0xb29Ea1A7007a1A3884b85F173b00818F13348859" }, receipt={ "_type": "TransactionReceipt", "blobGasPrice": null, "blobGasUsed": null, "blockHash": "0x02cdad30ae9e7f278a1ba143d7a5764fd8a2319ee75180afa75004ebd735f8f0", "blockNumber": 7078401, "contractAddress": null, "cumulativeGasUsed": "49610", "from": "0x226D3Eb51e24D98150e682d0337c214779cD52A2", "gasPrice": "10000000000", "gasUsed": "49610", "hash": "0xe716c1285bfa21acaaa57ee7fdea921fa0e346a0a9abf332c0c724aa9757efa4", "index": 0, "logs": [  ], "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "root": null, "status": 0, "to": "0xb29Ea1A7007a1A3884b85F173b00818F13348859" }, code=CALL_EXCEPTION, version=6.16.0)
```

### ❌ Unified Privacy Bridges Suite Coverage Improvements - PrivacyBridgeCotiNative Test 46: coverage: receive() fallback with direct transfer

```
transaction execution reverted (action="sendTransaction", data=null, reason=null, invocation=null, revert=null, transaction={ "data": "", "from": "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012", "to": "0xFF3F3458305b066850cEC7B0DBB8C3B7231a5F3F" }, receipt={ "_type": "TransactionReceipt", "blobGasPrice": null, "blobGasUsed": null, "blockHash": "0x5fbb1f3116deb45dc84d2a27b892f29bd7af3c167b1320b5a48cf4a0dbb95dea", "blockNumber": 7078606, "contractAddress": null, "cumulativeGasUsed": "51227", "from": "0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012", "gasPrice": "10000000000", "gasUsed": "51227", "hash": "0x7453a9ed034b76889da9b41440a57b4bebc5f02227fa40e63c0f74c8a6cf7b50", "index": 0, "logs": [  ], "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "root": null, "status": 0, "to": "0xFF3F3458305b066850cEC7B0DBB8C3B7231a5F3F" }, code=CALL_EXCEPTION, version=6.16.0)
```

## Transaction Call Log

#### Test 2: native: Should allow deposit of native COTI

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivacyBridgeCotiNative.deposit() -> PrivateERC20Mock.mint | `0.02` | `0x91a9a390…` |

#### Test 3: native: Should allow withdrawal of native COTI

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateERC20Mock.approve | `0xb29Ea1A7007a1A3884b85F173b00818F13348859`, `0.01` | `0x879376ee…` |
| PrivacyBridgeCotiNative.withdraw() -> PrivateERC20Mock.burn | `0.01` | `0xe716c128…` |

#### Test 4: native: Should deduct dynamic fee and let owner withdraw fees

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivacyBridgeCotiNative.deposit() | `100.0` | `0x5f447390…` |
| PrivacyBridgeCotiNative.withdrawFees | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `10.0` | `0xdab2f81e…` |

#### Test 5: native: Should rescue native COTI

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivacyBridgeCotiNative.rescueNative | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `45.0` | `0x99ad0c22…` |
| PrivacyBridgeWETH.setPriceOracle | `0x71F2F3B9BB35ebCbbC880b93BC3a41C452425Fe5` | `0x3b1291c1…` |
| PrivateWrappedEther.grantRole | `MINTER_ROLE`, `0x8d51A08d1a3136E5c4eF4755A7D3ebc3B9F55199` | `0xf870dc7b…` |

#### Test 7: WETH: Should allow deposit

| Method | Args | Tx Hash |
|--------|------|---------|
| MockWETH.approve | `0x8d51A08d1a3136E5c4eF4755A7D3ebc3B9F55199`, `10` | `0xd6cec42b…` |
| PrivacyBridgeERC20.deposit() | `10` | `0xe5cdeb9c…` |

#### Test 8: WETH: Should allow withdrawal

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateERC20Mock.approve | `0x8d51A08d1a3136E5c4eF4755A7D3ebc3B9F55199`, `5` | `0xfa4f2df5…` |
| PrivacyBridgeERC20.withdraw() | `5` | `0xf6af8baa…` |

#### Test 9: WETH: Should track dynamic fees in accumulatedCotiFees

| Method | Args | Tx Hash |
|--------|------|---------|
| MockWETH.approve | `0x8d51A08d1a3136E5c4eF4755A7D3ebc3B9F55199`, `100` | `0x866ae37b…` |
| PrivacyBridgeERC20.deposit() | `100` | `0x5748e87a…` |

#### Test 10: WETH: Should rescue redundant ERC20 tokens

| Method | Args | Tx Hash |
|--------|------|---------|
| ERC20Mock.mint | `0x8d51A08d1a3136E5c4eF4755A7D3ebc3B9F55199`, `1` | `0x64319fbd…` |
| PrivacyBridgeERC20.rescueERC20 | `0x831E10B2830bC0925D73C4bf097bC782a975dd3d`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `1` | `0x77ab799a…` |
| PrivateCOTI.grantRole | `MINTER_ROLE`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012` | `0x3906ee81…` |

#### Test 22: PrivateCOTI: mint(address,uint256) should mint tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `10` | `0x49785fb8…` |

#### Test 24: PrivateCOTI: burn(uint256) should burn tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.burn(uint256) | `1` | `0xc592c88a…` |

#### Test 25: PrivateCOTI: transfer(address,uint256) should transfer tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transfer(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0x556e6c61…` |

#### Test 26: PrivateCOTI: approve(address,uint256) should set allowance and emit Approval

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.approve(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0x19453d8d…` |

#### Test 27: PrivateCOTI: transferFrom(address,address,uint256) should spend allowance and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transferFrom(address,address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0xe41e2f06…` |

#### Test 28: PrivateCOTI (extend): setAccountEncryptionAddress & accountEncryptionAddress

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.setAccountEncryptionAddress | `<mock_address>` | `0x1cb5278e…` |

#### Test 29: PrivateCOTI (extend): transferAndCall (ERC677) triggers onTokenReceived

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transferAndCall | `0x588Cbc4E247cC869de27e37926aB8728e87F94F3`, `0.1`, `0x68656c...` | `0x0cbf190f…` |

#### Test 30: PrivateCOTI (extend): transfer(itUint256,address) with encrypted payload

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transfer(to, itAmount) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x066b8167…` |

#### Test 31: PrivateCOTI (extend): approve(address,itUint256) and allowance checks

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.approve(spender, itAmount) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x18d55fdb…` |
| PrivateCOTI.reencryptAllowance | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `true` | `0x97a20bd3…` |

#### Test 32: PrivateCOTI (extend): transferFrom(address,address,itUint256)

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.approve(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `1` | `0x700ccbf8…` |
| PrivateCOTI.transferFrom(from, to, itAmount) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x3d77f6e9…` |
| PrivateWrappedEther.grantRole | `MINTER_ROLE`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012` | `0xeda1aa8f…` |

#### Test 33: PrivateWrappedEther: mint(address,uint256) should mint tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `10` | `0xae5feba0…` |

#### Test 35: PrivateWrappedEther: burn(uint256) should burn tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.burn(uint256) | `1` | `0xde2d41e8…` |

#### Test 36: PrivateWrappedEther: transfer(address,uint256) should transfer tokens and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.transfer(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0x489a7040…` |

#### Test 37: PrivateWrappedEther: approve(address,uint256) should set allowance and emit Approval

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.approve(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0xa85a5e67…` |

#### Test 38: PrivateWrappedEther: transferFrom(address,address,uint256) should spend allowance and emit Transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.transferFrom(address,address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `2` | `0xece15f3e…` |

#### Test 39: PrivateWrappedEther (extend): setAccountEncryptionAddress & accountEncryptionAddress

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.setAccountEncryptionAddress | `<mock_address>` | `0x740c25e9…` |

#### Test 40: PrivateWrappedEther (extend): transferAndCall (ERC677) triggers onTokenReceived

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.transferAndCall | `0x9AC1F7852c79c3E8AB80dB8979021e4Bb14E8be4`, `0.1`, `0x68656c...` | `0x14f09859…` |

#### Test 41: PrivateWrappedEther (extend): transfer(itUint256,address) with encrypted payload

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.transfer(to, itAmount) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x912043e2…` |

#### Test 42: PrivateWrappedEther (extend): approve(address,itUint256) and allowance checks

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.approve(spender, itAmount) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0xc1c3b7a8…` |
| PrivateWrappedEther.reencryptAllowance | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `true` | `0x9e2e819d…` |

#### Test 43: PrivateWrappedEther (extend): transferFrom(address,address,itUint256)

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.approve(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `1` | `0x45e9c899…` |
| PrivateWrappedEther.transferFrom(from, to, itAmount) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `<encrypted>` | `0x63144b0f…` |
| PrivacyBridgeCotiNative.setPriceOracle | `0xb518Ef7c389fCfF7332E11Fe8282d328e1130ed0` | `0x4ff3845c…` |
| PrivateCOTI.grantRole | `MINTER_ROLE`, `0xFF3F3458305b066850cEC7B0DBB8C3B7231a5F3F` | `0x685a9f85…` |

#### Test 46: coverage: receive() fallback with direct transfer

| Method | Args | Tx Hash |
|--------|------|---------|
| receive() | `0.01` | `0x7453a9ed…` |

#### Test 47: coverage: onTokenReceived direct call should revert InvalidAddress

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.grantRole | `MINTER_ROLE`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012` | `0x1eb9f6de…` |

#### Test 52: coverage: balanceOf(address) returns ciphertext after mint

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `5` | `0x288461d4…` |

#### Test 54: coverage: allowance(address,address) returns Allowance struct

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.approve(address,uint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `1` | `0x9dc4caf7…` |

#### Test 56: coverage: mint(address,itUint256) encrypted mint

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.mint(address,itUint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `3` | `0x9679b2c7…` |

#### Test 57: coverage: burn(itUint256) encrypted burn

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.burn(itUint256) | `1` | `0x051a4fdd…` |

#### Test 59: coverage: transferAndCall(address,itUint256,bytes) encrypted ERC677

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateCOTI.transferAndCall(address,itUint256,bytes) | `0xc02EACc5093D8afD0Fe896E55c833eCa68EA72be`, `0.5` | `0x6286e20c…` |
| PrivateWrappedEther.grantRole | `MINTER_ROLE`, `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012` | `0x264299cd…` |

#### Test 60: coverage: PrivateWrappedEther mint(address,itUint256) encrypted mint

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.mint(address,itUint256) | `0x226D3Eb51e24D98150e682d0337c214779cD52A2`, `3` | `0xa6682fd6…` |

#### Test 61: coverage: PrivateWrappedEther burn(itUint256) encrypted burn

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `2` | `0x6b2259ec…` |
| PrivateWrappedEther.burn(itUint256) | `1` | `0x0cd9735d…` |

#### Test 62: coverage: PrivateWrappedEther transferAndCall(address,itUint256,bytes) encrypted ERC677

| Method | Args | Tx Hash |
|--------|------|---------|
| PrivateWrappedEther.mint(address,uint256) | `0xAb81c57CCc578a5636BFF47B896BEC6Af1c30012`, `2` | `0x1b60dffd…` |
| PrivateWrappedEther.transferAndCall(address,itUint256,bytes) | `0x55f99510ecE8310DEa0e84441B5DB2Dfa58E95ED`, `0.5` | `0xd2511306…` |
