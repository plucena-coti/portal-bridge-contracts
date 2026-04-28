# Deployment Guide

This guide explains how to fully redeploy Private Tokens (`p.tokens`), and Privacy Bridges, and how to update the frontend UI configuration to use the new contract addresses.

---

## 1. Prerequisites

### 1.1 Environment Variables

Copy `.env.example` to `.env` and set the following variables before running any deployment or contract tests:


| Variable                      | Required   | Description                                                                                                                                                                                                                     |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PRIVATE_KEY`                 | ✅ Yes     | Private key of the deployer wallet (no`0x` prefix). This account pays all deployment gas and becomes the contract owner/admin.                                                                                                  |
| `PRIVATE_KEY2`                | Optional   | Secondary wallet used for multi-account testing only. Not needed for deployment.                                                                                                                                                |
| `PRIVATE_AES_KEY_TESTNET`     | Tests only | AES key for the deployer wallet on Testnet (32 hex chars, no`0x` prefix). Required to run encrypted deposit tests. Generated during COTI Snap onboarding at [dev.metamask.coti.io/wallet](https://dev.metamask.coti.io/wallet). |
                                                                               |

Example `.env` for testnet deployment and testing:

```env
PRIVATE_KEY=your_deployer_private_key_without_0x_prefix
PRIVATE_AES_KEY_TESTNET=your_32_char_aes_key_without_0x_prefix

```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 1.2 Funded Wallet

The deployer wallet (`PRIVATE_KEY`) must have enough native COTI on the target network to cover gas. Deploying the full suite (7 private tokens + 7 bridges + role grants)



---

## 2. Deploy CotiPriceConsumer (Oracle)

The privacy bridges require a `CotiPriceConsumer` oracle contract to compute dynamic fees. This must be deployed **before** deploying or redeploying bridges.

The oracle queries Band Protocol for token/USD prices and enforces a minimum staleness of 1 hour.

```bash
# Testnet
npx hardhat run deploy/oracle/deploy-coti-price-consumer.cjs --network cotiTestnet

# Mainnet (uses RICK_PK from .env)
npx hardhat run deploy/oracle/deploy-coti-price-consumer-mainnet.cjs --network cotiMainnet
```

The script will output the deployed oracle address and a sanity COTI/USD price read. Save this address — you'll need it in the next step.

After deploying, update the oracle address in `deploy/privacy_bridge/redeploy-bridges-only.cjs` under the `PRICE_ORACLE` object for the target network. The bridge deploy script will automatically call `setPriceOracle` on each bridge.

| Network | Band Protocol Proxy | maxStaleness |
|---------|-------------------|--------------|
| Testnet | `0xb6256DCb23CEE06eDa2408E73945963606fdddd7` | 3600s (1 hour) |
| Mainnet | `0x9503d502435f8e228b874Ba0F792301d4401b523` | 3600s (1 hour) |

To update the oracle on already-deployed bridges without redeploying them:

```bash
# Edit the oracle address in scripts/set-oracle.cjs, then:
npx hardhat run scripts/set-oracle.cjs --network cotiTestnet
```

---

## 3.  How to Run the Deployment Script


> ⚠️ **Before running the script make sure public token addresses are correct on /deploy/privacy_bridge/config.ts**

From the project root folder run:

```bash
# 1.Clone contracts repo
git clone -b development https://github.com/coti-io/coti-contracts.git 

# 2. Compile contracts
npx hardhat compile

# 3. Run the Deployment Script  
npx hardhat run deploy/privacy_bridge/redeploy-private-and-bridges.cjs --network cotiTestnet   OR

npx hardhat run deploy/privacy_bridge/redeploy-private-and-bridges.cjs --network  cotiMainnet
```

This script reuses the existing public token addresses and  redeploys `p.tokens` and bridges, then updates `/deploy/privacy_bridge/config.ts` configuration file.
This configuration file should be copied and commited to UI project as instructions bellow



## 4.  How to Update UI for new contract addresses

 ---
1. Verify the config file was updated
```bash
git diff /deploy/privacy_bridge/config.ts
``` 
2. clone appropriate branch https://github.com/cotitech-io/coti-privacy-portal/

3. copy /deploy/privacy_bridge/config.ts to UI repo: coti-privacy-portal/src/contracts/config.ts

4. commit your changes to coti-privacy-portal repo appropriate branch


## 5. Verify contracts


```bash
# Regenerate flattened files and verification JSONs for contract verification
npx hardhat run admin/generate_all_flattened_and_json.cjs
```
> ⚠️ Use flatened jsons to verify contracts on cotiscan.  API JSON upload, seems to be disabled so you need to verify and upload JSONs individually.  You can see full contract list  online at /backoffice URL


## 6. Test Contracts

Tests run against the live COTI Testnet and require `PRIVATE_KEY` (and `PRIVATE_AES_KEY_TESTNET` for encrypted deposit tests) to be set in `.env`.

### Run the full test suite

```bash
npm run test:contracts
```

The report is generated from `test-results.json` (produced by the custom Mocha reporter). You can now generate test report:

```bash
node admin/generate-test-report.cjs
```
