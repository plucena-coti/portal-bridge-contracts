# portal-bridge-contracts

Solidity contracts for the COTI Privacy Bridge — private tokens (`p.tokens`) and bridges for Testnet and Mainnet.

## Setup

```bash
npm install
cp .env.example .env
# fill in PRIVATE_KEY and other required vars

#clone contracts project
git clone -b development https://github.com/coti-io/coti-contracts.git 

npx hardhat compile

```

## Running Tests

Tests run against the live COTI Testnet. Make sure `PRIVATE_KEY` and `PRIVATE_AES_KEY_TESTNET` are set in `.env`.

```bash
# Full test suite
npm test

# Only PrivateERC20 tests
npm run test:private-erc20
```

## Generating Reports

```bash
# Run tests and generate a Markdown report (TEST_EXECUTION_REPORT.md)
npm run generate:test-report

# Regenerate report from existing test-results.json (no re-run)
node scripts/generate-test-report.cjs

# Run tests with coverage
npm run coverage:testnet

# Generate coverage report from existing data
npm run coverage-report
```

## Deployment

See [docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md) for the full deployment walkthrough.

```bash
# Compile
npx hardhat compile

# Deploy to Testnet
npx hardhat run deploy/privacy_bridge/redeploy-private-and-bridges.cjs --network cotiTestnet

# Deploy to Mainnet
npx hardhat run deploy/privacy_bridge/redeploy-private-and-bridges.cjs --network cotiMainnet
```

## Environment Variables


| Variable                      | Required   | Description                                              |
| ----------------------------- | ---------- | -------------------------------------------------------- |
| `PRIVATE_KEY`                 | Yes        | Deployer wallet private key (no`0x` prefix)              |
| `PRIVATE_KEY2`                | Optional   | Secondary wallet for multi-account tests                 |
| `PRIVATE_AES_KEY_TESTNET`     | Tests only | AES key for encrypted deposit tests                      |
| `VITE_DEFAULT_NETWORK_ID`     | Yes        | Chain ID in hex (`0x6c11a0` testnet, `0x282934` mainnet) |
| `VITE_USE_ENCRYPTED_DEPOSITS` | Optional   | Set`true` to enable encrypted ERC20 deposits             |

> Never commit your `.env` file — it's in `.gitignore`.
