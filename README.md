# Deployment Guide

This guide explains how to fully redeploy Private Tokens (`p.tokens`), and Privacy Bridges for the COTI Testnet, and automatically update the frontend configuration to point at the new addresses.

---

## Prerequisites

### 1. Environment Variables

Copy `.env.example` to `.env` and set the following variables before running any deployment or contract tests:


| Variable                      | Required   | Description                                                                                                                                                                                                                     |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PRIVATE_KEY`                 | ✅ Yes     | Private key of the deployer wallet (no`0x` prefix). This account pays all deployment gas and becomes the contract owner/admin.                                                                                                  |
| `PRIVATE_KEY2`                | Optional   | Secondary wallet used for multi-account testing only. Not needed for deployment.                                                                                                                                                |
| `PRIVATE_AES_KEY_TESTNET`     | Tests only | AES key for the deployer wallet on Testnet (32 hex chars, no`0x` prefix). Required to run encrypted deposit tests. Generated during COTI Snap onboarding at [dev.metamask.coti.io/wallet](https://dev.metamask.coti.io/wallet). |
| `VITE_DEFAULT_NETWORK_ID`     | ✅ Yes     | Chain ID in hex for the NetworkGuard. Use`0x6c11a0` for Testnet, `0x282934` for Mainnet.                                                                                                                                        |
| `VITE_USE_ENCRYPTED_DEPOSITS` | Optional   | Set to`true` to enable encrypted ERC20 deposits. Defaults to `false`.                                                                                                                                                           |
| `VITE_COTI_SNAP_ID`           | Optional   | Override the MetaMask Snap ID. Defaults to`npm:@coti-io/coti-snap`.                                                                                                                                                             |

Example `.env` for testnet deployment and testing:

```env
PRIVATE_KEY=your_deployer_private_key_without_0x_prefix
PRIVATE_AES_KEY_TESTNET=your_32_char_aes_key_without_0x_prefix

```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 2. Funded Wallet

The deployer wallet (`PRIVATE_KEY`) must have enough native COTI on the target network to cover gas. Deploying the full suite (7 public mocks + 7 private tokens + 7 bridges + role grants)

## The Script

**Before running the script make sure public token addresses are correct on /deploy/privacy_bridge/config.ts**

---

## How to Run

From the project root:

```bash
# 1.Clone contracts repo
git clone -b development https://github.com/coti-io/coti-contracts.git 

# 2. Compile contracts
npx hardhat compile

# 3. Deploy  
npx hardhat run deploy/privacy_bridge/redeploy-private-and-bridges.cjs --network cotiTestnet

npx hardhat run deploy/privacy_bridge/redeploy-private-and-bridges.cjs --network cotiTestnet cotiMainnet
```

This script reuses the existing public token addresses and only redeploys `p.tokens` and bridges, then updates `/deploy/privacy_bridge/config.ts`.

---


---

## After Deployment

### Verify the config was updated

```bash
git diff /deploy/privacy_bridge/config.ts
```

### Update

1. clone branch from 

copy /deploy/privacy_bridge/config.ts to privacy portal branch (main/staging/testnet) and commit there the file /src/contracts/config.ts



### Regenerate flattened files and verification JSONs for contract verification

```bash
npx hardhat run admin/generate_all_flattened_and_json.cjs
npx hardhat run admin/generate-verify-json.cjs --network cotiTestnet
```


## Contract Tests

Tests run against the live COTI Testnet and require `PRIVATE_KEY` (and `PRIVATE_AES_KEY_TESTNET` for encrypted deposit tests) to be set in `.env`.

### Run the full test suite

```bash
npm run test:contracts
```

### Run tests and generate a Markdown report

Runs the full suite and writes `TEST_EXECUTION_REPORT.md`:

```bash
npm run generate:test-report
```

The report is generated from `test-results.json` (produced by the custom Mocha reporter). You can also regenerate it from an existing results file without re-running tests:

```bash
node scripts/generate-test-report.cjs
```
