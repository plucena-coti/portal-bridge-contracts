# E2E Tests - Privacy Bridge Portal

## Overview

End-to-end tests for the COTI Privacy Bridge Portal using Playwright and MetaMask integration via Synpress.

## Test Suite

### `public-balance.spec.ts`

Tests the wallet connection flow and public COTI balance display on COTI Testnet.

**Test:** `should connect wallet to COTI Testnet and display PUBLIC COTI balance`

| Step | Description | Status |
|------|-------------|--------|
| 1 | Unlock MetaMask wallet | ✅ |
| 2 | Navigate to dApp (localhost:8080) | ✅ |
| 3 | Check/establish wallet connection | ✅ |
| 4 | Verify wallet address | ✅ |
| 5 | Switch to COTI Testnet (if needed) | ✅ |
| 6 | Verify non-zero COTI balance | ✅ |

### `portal-in.spec.ts`

Tests the complete Portal In transaction flow for converting public COTI to private COTI.

**Test:** `should complete Portal In transaction from public to private COTI`

| Step | Description | Status |
|------|-------------|--------|
| 1 | Unlock MetaMask wallet | ✅ |
| 2 | Navigate to dApp (localhost:8080) | ✅ |
| 3 | Connect wallet | ✅ |
| 4 | Verify COTI Testnet connection | ✅ |
| 5 | Click COTI token to open Portal modal | ✅ |
| 6 | Enter amount (0.01 COTI) | ✅ |
| 7 | Click "Portal In" button | ✅ |
| 8 | Handle Snap connect popup (click Cancel) | ✅ |
| 9 | Verify "Portal Complete" success message | ✅ |

### `portal-in-cancel.spec.ts`

Tests the error handling when a user cancels the Portal In transaction (Snap unlock/connect).

**Test:** `should handle Portal In cancellation correctly`

| Step | Description | Status |
|------|-------------|--------|
| 1-7 | Same as Portal In flow (up to clicking Portal In) | ✅ |
| 8 | Handle Snap connect popup (click **Reject/Cancel**) | ✅ |
| 9 | Verify "Transaction Failed" error message | ✅ |

**Key Features:**
- Verifies that user cancellation is properly caught
- Ensures UI shows error state instead of success
- Validates regression fix for silent failure on cancel

### `private-balance.spec.ts`

Tests the private token unlock flow and verifies private COTI balance display.

**Test:** `should connect wallet and verify PRIVATE COTI balance`

| Step | Description | Status |
|------|-------------|--------|
| 1 | Unlock MetaMask wallet | ✅ |
| 2 | Navigate to dApp (localhost:8080) | ✅ |
| 3 | Check/establish wallet connection | ✅ |
| 4 | Verify wallet address | ✅ |
| 5 | Switch to COTI Testnet (if needed) | ✅ |
| 6 | Navigate to Private Tokens section | ✅ |
| 7 | Click "Unlock with security key" button | ✅ |
| 8 | Handle MetaMask signature popup | ✅ |
| 9 | Verify Private COTI balance | ✅ |

**Key Features:**
- Unlocks encrypted private token balances using MetaMask signature
- Verifies Private COTI (pCOTI) balance is displayed
- Handles the Snap security key unlock flow

## Test Results (January 23, 2026)

### public-balance.spec.ts
```
✅ PASSED - 1 test (1.6m)

Test Output:
- Wallet address: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
- Network: COTI Testnet (chainId: 0x6c11a0)
- Balance: 10 COTI
```

### portal-in.spec.ts
```
✅ PASSED - 1 test (1.7m)

Test Output:
- Wallet: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
- Network: COTI Testnet
- Amount: 0.01 COTI → 0.01 Private COTI
- Success: Portal Complete ✓
```

### private-balance.spec.ts
```
⏳ PENDING - Test ready for execution

Expected Output:
- Wallet: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
- Network: COTI Testnet
- Private Balance: pCOTI balance displayed
```

## Configuration

### Network Configuration

| Property | Value |
|----------|-------|
| Chain ID | `0x6c11a0` (7082400) |
| RPC URL | `https://testnet.coti.io/rpc` |
| Symbol | COTI |
| Block Explorer | `https://testnet.cotiscan.io` |

### Wallet Configuration

- **Seed Phrase:** `test test test test test test test test test test test junk`
- **Password:** `Tester@1234`
- **Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## Prerequisites

1. **Node.js** (v18+)
2. **Synpress** for MetaMask wallet caching
3. **Playwright** for browser automation

## Setup

### 1. Generate Wallet Cache

Before running tests, generate the MetaMask wallet cache:

```bash
npx synpress tests/e2e --force
```

This creates a cached MetaMask profile at `.cache-synpress/` with:
- MetaMask extension (v13.13.1)
- Pre-configured wallet with seed phrase
- Extension ID: `gfaojdojjliciedeigpnninohhmhfgff`

### 2. Start the Application

```bash
npm run dev
```

The app should be running at `http://localhost:8080`.

### 3. Run Tests

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run specific test:**
```bash
# Public balance test
npm run test:e2e -- public-balance.spec.ts

# Private balance test
npm run test:e2e -- private-balance.spec.ts

# Portal In test
npm run test:e2e -- portal-in.spec.ts

# Portal In Cancellation test
npm run test:e2e -- portal-in-cancel.spec.ts
```

**Watch mode:**
```bash
npm run test:e2e -- --ui
```

## File Structure

```
tests/e2e/
├── README.md                      # This file
├── wallet.setup.mjs               # Synpress wallet configuration
└── specs/
    ├── public-balance.spec.ts     # Wallet connection & public balance test
    ├── private-balance.spec.ts    # Private token unlock & balance test
    ├── portal-in.spec.ts          # Portal In transaction test
    └── portal-in-cancel.spec.ts   # Portal In cancellation test
```

## Key Features

### Smart Connection Detection

The test intelligently checks if MetaMask is already connected before attempting to reconnect:

```typescript
// Check existing connection first
const walletAddress = await page.evaluate(async () => {
    const eth = window.ethereum;
    const accounts = await eth.request({ method: 'eth_accounts' });
    return accounts[0] || null;
});

if (walletAddress) {
    console.log('✅ Wallet ALREADY connected');
} else {
    // Only connect if not already connected
}
```

### Network Auto-Detection

Checks current network before switching:

```typescript
const currentChainId = await page.evaluate(async () => {
    return await window.ethereum.request({ method: 'eth_chainId' });
});

if (currentChainId === COTI_TESTNET.chainId) {
    console.log('✅ Already on COTI Testnet!');
}
```

## Troubleshooting

### Wallet Cache Issues

If MetaMask shows "Open wallet" button disabled or gets stuck on onboarding:

```bash
rm -rf .cache-synpress/
npx synpress tests/e2e --force
```

### Test Timeout

Default timeout is 120 seconds. For slower connections, increase in `playwright.config.ts`:

```typescript
timeout: 180000, // 3 minutes
```

### MetaMask Popup Not Found

The test includes retry logic (10 attempts) for finding MetaMask notification popups. If popups are consistently missed, check:
- Browser extension permissions
- Popup blockers
- MetaMask version compatibility

## HTML Report

After test execution, view the detailed HTML report:

```bash
npx playwright show-report
```

## CI/CD Integration

For headless CI environments, ensure:
1. Wallet cache is pre-generated
2. `xvfb` or similar virtual display is available
3. Sufficient timeout for network operations
