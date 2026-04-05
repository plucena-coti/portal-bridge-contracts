/**
 * verify_cotiscan.cjs
 *
 * Programmatically verifies contracts on CotiScan (Blockscout) using the
 * "flattened-code" method via their REST API.
 *
 * Usage:
 *   npx hardhat flatten contracts/erc20-mocks/WETH.sol > /tmp/WETH_flat.sol
 *   node contracts/scripts/verify_cotiscan.cjs <contractAddress> <contractName> <flattenedFile> [constructorArgsHex]
 *
 * Example:
 *   node contracts/scripts/verify_cotiscan.cjs \
 *     0x160Bc17BBba05CF3B85115F1022F33DEFA74bd62 \
 *     WETH9 \
 *     /tmp/WETH_flat.sol
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = "https://testnet.cotiscan.io";
const COMPILER_VERSION = "v0.8.20+commit.a1b79de6";
const OPTIMIZATION_RUNS = 200;
const EVM_VERSION = "paris"; // default used by COTI chain
// ──────────────────────────────────────────────────────────────────────────────

function post(url, body) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const isHttps = parsed.protocol === "https:";
        const lib = isHttps ? https : http;

        const data = JSON.stringify(body);
        const options = {
            hostname: parsed.hostname,
            port: parsed.port || (isHttps ? 443 : 80),
            path: parsed.pathname + parsed.search,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        };

        const req = lib.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

function get(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith("https") ? https : http;
        lib.get(url, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        }).on("error", reject);
    });
}

async function verifyContract(contractAddress, contractName, flattenedSourcePath, constructorArgs) {
    // Read the flattened source
    if (!fs.existsSync(flattenedSourcePath)) {
        console.error(`❌ File not found: ${flattenedSourcePath}`);
        process.exit(1);
    }
    const sourceCode = fs.readFileSync(flattenedSourcePath, "utf8");

    console.log(`\n🔍 Verifying ${contractName} at ${contractAddress}`);
    console.log(`   API: ${BASE_URL}`);
    console.log(`   Compiler: ${COMPILER_VERSION}`);
    console.log(`   Source file: ${path.basename(flattenedSourcePath)} (${(sourceCode.length / 1024).toFixed(1)}KB)`);

    const payload = {
        compiler_version: COMPILER_VERSION,
        source_code: sourceCode,
        contract_name: contractName,
        is_optimization_enabled: true,
        optimization_runs: OPTIMIZATION_RUNS,
        evm_version: EVM_VERSION,
        is_yul_contract: false,
        autodetect_constructor_args: constructorArgs ? false : true,
        constructor_args: constructorArgs || ""
    };

    const url = `${BASE_URL}/api/v2/smart-contracts/${contractAddress}/verification/via/flattened-code`;
    console.log(`\n📡 Sending verification request...`);

    const result = await post(url, payload);
    console.log(`   HTTP ${result.status}:`, JSON.stringify(result.data, null, 2));

    if (result.status === 200 || result.status === 201) {
        console.log(`\n✅ Verification submitted! Check: ${BASE_URL}/address/${contractAddress}`);
        // Poll for result
        await pollVerificationStatus(contractAddress);
    } else if (result.status === 404) {
        console.error("\n❌ Contract address not found on this network. Make sure the address is on COTI testnet.");
    } else {
        console.error(`\n❌ Verification failed with status ${result.status}`);
        if (result.data?.errors) {
            console.error("Errors:", result.data.errors);
        }
    }
}

async function pollVerificationStatus(contractAddress, maxRetries = 10) {
    const url = `${BASE_URL}/api/v2/smart-contracts/${contractAddress}`;
    console.log("\n⏳ Polling verification status...");

    for (let i = 0; i < maxRetries; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const result = await get(url);
        if (result.status === 200 && result.data?.is_verified) {
            console.log(`✅ Contract is now VERIFIED!`);
            console.log(`   View on CotiScan: ${BASE_URL}/address/${contractAddress}`);
            return;
        }
        console.log(`   Attempt ${i + 1}/${maxRetries}: not yet verified...`);
    }
    console.log("⚠️  Timed out waiting for verification status. Check manually.");
}

// ─── CLI Entry Point ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length < 3) {
    console.log(`
Usage:
  node contracts/scripts/verify_cotiscan.cjs <contractAddress> <contractName> <flattenedFile> [constructorArgsHex]

Examples:
  # WETH9 (no constructor args)
  node contracts/scripts/verify_cotiscan.cjs \\
    0x160Bc17BBba05CF3B85115F1022F33DEFA74bd62 WETH9 /tmp/WETH_flat.sol

  # Contract with constructor args (hex encoded, without 0x prefix)
  node contracts/scripts/verify_cotiscan.cjs \\
    0xABC... MyContract /tmp/MyContract_flat.sol 000000000000000000000000...

First flatten the contract:
  npx hardhat flatten contracts/erc20-mocks/WETH.sol > /tmp/WETH_flat.sol
`);
    process.exit(1);
}

const [contractAddress, contractName, flattenedFile, constructorArgs] = args;
verifyContract(contractAddress, contractName, flattenedFile, constructorArgs).catch(console.error);
