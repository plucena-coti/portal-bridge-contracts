#!/usr/bin/env node

/**
 * Coverage Report Generator (Testnet Execution Based)
 *
 * Reads test-results.json produced by scripts/test-json-reporter.cjs and
 * generates COVERAGE_REPORT.md showing which public functions of each contract
 * were tested, their pass/fail/not-tested status, and which tests cover them.
 *
 * Usage:
 *   1. Run: npm run coverage:testnet   (produces test-results.json)
 *   2. Run: node scripts/generate-coverage-report.cjs
 *      or:  npm run coverage-report
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const TEST_RESULTS_PATH = path.resolve(process.env.TEST_RESULTS_PATH || 'test-results.json');
const REPORTS_DIR = path.resolve('docs');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
const OUTPUT_REPORT_PATH = path.join(REPORTS_DIR, 'COVERAGE_REPORT.md');

// ============================================================================
// Read contract addresses directly from src/contracts/config.ts
// ============================================================================

function loadContractAddressesFromConfig() {
  const configPath = path.resolve('src/contracts/config.ts');
  if (!fs.existsSync(configPath)) {
    console.warn('⚠️  src/contracts/config.ts not found, skipping address injection.');
    return {};
  }
  const src = fs.readFileSync(configPath, 'utf-8');

  // Extract the CONTRACT_ADDRESSES object as a raw string and eval-parse it safely
  // by pulling out key → address pairs per chain block
  const result = {};

  // Match each chainId block: 7082400: { ... } or 2632500: { ... }
  const chainBlockRe = /(\d{6,7})\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  let chainMatch;
  while ((chainMatch = chainBlockRe.exec(src)) !== null) {
    const chainId = parseInt(chainMatch[1], 10);
    const block = chainMatch[2];
    result[chainId] = {};
    // Match key: "address" pairs
    const pairRe = /(\w+)\s*:\s*"(0x[0-9a-fA-F]{40})"/g;
    let pairMatch;
    while ((pairMatch = pairRe.exec(block)) !== null) {
      result[chainId][pairMatch[1]] = pairMatch[2];
    }
  }
  return result;
}

// Map CONTRACT_FUNCTIONS keys → config address keys
const CONTRACT_TO_ADDRESS_KEY = {
  PrivacyBridgeCotiNative: 'PrivacyBridgeCotiNative',
  PrivateCOTI: 'PrivateCoti',
  // ERC20 bridges and private tokens don't have a single address key
};

function getAddressesForContract(contractName, configAddresses) {
  const key = CONTRACT_TO_ADDRESS_KEY[contractName];
  if (!key) return [];
  return Object.entries(configAddresses)
    .map(([chainId, addrs]) => addrs[key])
    .filter(Boolean);
}

// ============================================================================
// Function → Test title mapping
//
// Each function lists substrings matched against actual test titles from
// test-results.json. A test is "matched" if its title includes ANY of these
// strings. Status is resolved dynamically at runtime:
//   passed      → at least one matching test passed
//   failed      → all matching tests failed (none passed)
//   pending     → all matching tests are pending/skipped
//   not_tested  → no matching tests found in results
// ============================================================================

const CONTRACT_FUNCTIONS = {
  PrivacyBridgeCotiNative: {
    description: 'Native COTI ↔ PrivateCOTI bridge',
    functions: [
      { name: 'deposit()', testTitles: ['native: Should allow deposit of native COTI'] },
      { name: 'deposit(itUint256)', testTitles: ['encrypted deposit zero fee baseline', 'encrypted deposit with fee>0'] },
      { name: 'withdraw(uint256)', testTitles: ['native: Should allow withdrawal of native COTI'] },
      { name: 'withdraw(uint256,itUint256)', testTitles: ['coverage: encrypted withdrawal with zero fee'] },
      { name: 'onTokenReceived(address,uint256,bytes)', testTitles: ['coverage: onTokenReceived direct call should revert InvalidAddress'] },
      { name: 'withdrawFees(address,uint256)', testTitles: ['native: Should deduct fee and let owner withdraw fees'] },
      { name: 'setDepositFee(uint256)', testTitles: ['native: Should deduct fee and let owner withdraw fees'] },
      { name: 'rescueNative(address,uint256)', testTitles: ['native: Should rescue native COTI'] },
      { name: 'getBridgeBalance()', testTitles: ['coverage: getBridgeBalance explicit check'] },
      { name: 'receive()', testTitles: ['coverage: receive() fallback with direct transfer'] },
    ],
  },

  PrivacyBridgeERC20: {
    description: 'ERC20 ↔ PrivateERC20 bridge (tested via WETH instance)',
    functions: [
      { name: 'deposit(uint256)', testTitles: ['WETH: Should allow deposit'] },
      { name: 'deposit(uint256,itUint256)', testTitles: ['ERC20 Encrypted Deposit (Zero Fee)', 'ERC20 Encrypted Deposit (With Fee)', 'ERC20 Encrypted Deposit with Excess Native Fee'] },
      { name: 'withdraw(uint256)', testTitles: ['WETH: Should allow withdrawal'] },
      { name: 'withdraw(uint256,itUint256)', testTitles: ['ERC20 Encrypted Withdrawal (Zero Fee)', 'ERC20 Encrypted Withdrawal (With Fee)'] },
      { name: 'withdrawFees(address,uint256)', testTitles: ['WETH: Should track fees and let owner withdraw'] },
      { name: 'setDepositFee(uint256)', testTitles: ['WETH: Should track fees and let owner withdraw'] },
      { name: 'setWithdrawFee(uint256)', testTitles: ['WETH: Should track fees and let owner withdraw'] },
      { name: 'rescueERC20(address,address,uint256)', testTitles: ['WETH: Should rescue redundant ERC20 tokens'] },
      { name: 'nativeCotiFee()', testTitles: ['ERC20 Encrypted Deposit with Excess Native Fee'] },
    ],
  },

  PrivateCOTI: {
    description: 'Privacy-preserving COTI token (extends PrivateERC20)',
    functions: [
      { name: 'mint(address,uint256)', testTitles: ['PrivateCOTI: mint(address,uint256) should mint tokens'] },
      { name: 'mint(address,itUint256)', testTitles: ['coverage: mint(address,itUint256) encrypted mint'] },
      { name: 'burn(uint256)', testTitles: ['PrivateCOTI: burn(uint256) should burn tokens'] },
      { name: 'burn(itUint256)', testTitles: ['coverage: burn(itUint256) encrypted burn'] },
      { name: 'transfer(address,uint256)', testTitles: ['PrivateCOTI: transfer(address,uint256) should transfer'] },
      { name: 'transfer(address,itUint256)', testTitles: ['PrivateCOTI (extend): transfer(itUint256,address) with encrypted payload'] },
      { name: 'approve(address,uint256)', testTitles: ['PrivateCOTI: approve(address,uint256) should set allowance'] },
      { name: 'approve(address,itUint256)', testTitles: ['PrivateCOTI (extend): approve(address,itUint256) and allowance checks'] },
      { name: 'transferFrom(address,address,uint256)', testTitles: ['PrivateCOTI: transferFrom(address,address,uint256) should spend allowance'] },
      { name: 'transferFrom(address,address,itUint256)', testTitles: ['PrivateCOTI (extend): transferFrom(address,address,itUint256)'] },
      { name: 'transferAndCall(address,uint256,bytes)', testTitles: ['PrivateCOTI (extend): transferAndCall (ERC677) triggers onTokenReceived'] },
      { name: 'transferAndCall(address,itUint256,bytes)', testTitles: ['coverage: transferAndCall(address,itUint256,bytes) encrypted ERC677'] },
      { name: 'balanceOf(address)', testTitles: ['coverage: balanceOf(address) returns ciphertext after mint'] },
      { name: 'balanceOf()', testTitles: ['coverage: balanceOf() returns garbled balance'] },
      { name: 'allowance(address,address)', testTitles: ['coverage: allowance(address,address) returns Allowance struct'] },
      { name: 'allowance(address,bool)', testTitles: ['coverage: allowance(address,bool) returns garbled allowance'] },
      { name: 'reencryptAllowance(address,bool)', testTitles: ['PrivateCOTI (extend): approve(address,itUint256) and allowance checks'] },
      { name: 'setAccountEncryptionAddress(address)', testTitles: ['PrivateCOTI (extend): setAccountEncryptionAddress & accountEncryptionAddress'] },
      { name: 'supportsInterface(bytes4)', testTitles: ['coverage: supportsInterface(bytes4) checks ERC165'] },
      { name: 'name()', testTitles: ["coverage: name() returns token name"] },
      { name: 'symbol()', testTitles: ["coverage: symbol() returns token symbol"] },
      { name: 'decimals()', testTitles: ["coverage: decimals() returns 18"] },
      { name: 'totalSupply()', testTitles: ["coverage: totalSupply() returns 0"] },
    ],
  },

  PrivateWrappedEther: {
    description: 'Privacy-preserving WETH token (extends PrivateERC20)',
    functions: [
      { name: 'mint(address,uint256)', testTitles: ['PrivateWrappedEther: mint(address,uint256) should mint tokens'] },
      { name: 'mint(address,itUint256)', testTitles: ['PrivateWrappedEther mint(address,itUint256) encrypted mint'] },
      { name: 'burn(uint256)', testTitles: ['PrivateWrappedEther: burn(uint256) should burn tokens'] },
      { name: 'burn(itUint256)', testTitles: ['PrivateWrappedEther burn(itUint256) encrypted burn'] },
      { name: 'transfer(address,uint256)', testTitles: ['PrivateWrappedEther: transfer(address,uint256) should transfer'] },
      { name: 'transfer(address,itUint256)', testTitles: ['PrivateWrappedEther (extend): transfer(itUint256,address) with encrypted payload'] },
      { name: 'approve(address,uint256)', testTitles: ['PrivateWrappedEther: approve(address,uint256) should set allowance'] },
      { name: 'approve(address,itUint256)', testTitles: ['PrivateWrappedEther (extend): approve(address,itUint256) and allowance checks'] },
      { name: 'transferFrom(address,address,uint256)', testTitles: ['PrivateWrappedEther: transferFrom(address,address,uint256) should spend allowance'] },
      { name: 'transferFrom(address,address,itUint256)', testTitles: ['PrivateWrappedEther (extend): transferFrom(address,address,itUint256)'] },
      { name: 'transferAndCall(address,uint256,bytes)', testTitles: ['PrivateWrappedEther (extend): transferAndCall (ERC677) triggers onTokenReceived'] },
      { name: 'transferAndCall(address,itUint256,bytes)', testTitles: ['PrivateWrappedEther transferAndCall(address,itUint256,bytes) encrypted ERC677'] },
      { name: 'setAccountEncryptionAddress(address)', testTitles: ['PrivateWrappedEther (extend): setAccountEncryptionAddress & accountEncryptionAddress'] },
      { name: 'reencryptAllowance(address,bool)', testTitles: ['PrivateWrappedEther (extend): approve(address,itUint256) and allowance checks'] },
    ],
  },
};

// ============================================================================
// Core logic
// ============================================================================

/**
 * Load test-results.json and build a map of title substring → status.
 * Each test entry is stored so we can look up by substring.
 */
function loadTestResults() {
  if (!fs.existsSync(TEST_RESULTS_PATH)) {
    console.error(`❌ ${TEST_RESULTS_PATH} not found.`);
    console.error(`   Run: npm run coverage:testnet`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(TEST_RESULTS_PATH, 'utf-8'));
  return raw;
}

/**
 * Resolve a function's status against actual test results.
 * Returns { status, matchedTests }
 *   status: 'passed' | 'failed' | 'pending' | 'not_tested'
 *   matchedTests: array of { title, status, duration }
 */
function resolveStatus(testTitles, testList) {
  if (!testTitles || testTitles.length === 0) {
    return { status: 'not_tested', matchedTests: [] };
  }

  const matched = testList.filter(t =>
    testTitles.some(sub => t.title.includes(sub))
  );

  if (matched.length === 0) {
    return { status: 'not_tested', matchedTests: [] };
  }

  const hasPassed = matched.some(t => t.status === 'passed');
  const hasFailed = matched.some(t => t.status === 'failed');
  const allPending = matched.every(t => t.status === 'pending');

  let status;
  if (hasPassed) status = 'passed';
  else if (hasFailed) status = 'failed';
  else if (allPending) status = 'pending';
  else status = 'not_tested';

  return { status, matchedTests: matched };
}

// ============================================================================
// Report generation
// ============================================================================

/**
 * Extract test numbers from a list of matched test entries.
 * Returns a formatted string like "#11, #12, #14" or "—" if none.
 */
function extractTestNumbers(matchedTests) {
  const nums = matchedTests
    .map(t => {
      const m = t.title.match(/^Test (\d+):/i);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter(n => n !== null);
  // Deduplicate and sort
  const unique = [...new Set(nums)].sort((a, b) => a - b);
  return unique.length > 0 ? unique.map(n => `#${n}`).join(', ') : '—';
}

function statusIcon(status) {
  switch (status) {
    case 'passed': return '✅';
    case 'failed': return '❌';
    case 'pending': return '⏭';
    case 'not_tested': return '⚠️';
    default: return '❓';
  }
}

function generateReport(testResults) {
  const testList = testResults.tests || [];
  const stats = testResults.stats || {};
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Load addresses from config.ts (source of truth)
  const configAddresses = loadContractAddressesFromConfig();

  let md = `# Contract Coverage Report\n\n`;
  md += `**Generated:** ${date}  \n`;
  md += `**Source:** \`test-results.json\` (testnet execution)  \n`;
  md += `**Test run:** ${stats.tests || testList.length} tests · `;
  md += `${stats.passes || 0} passed · ${stats.failures || 0} failed · ${stats.pending || 0} pending\n\n`;
  md += `---\n\n`;

  // ---- Legend ----
  md += `## Legend\n\n`;
  md += `| Symbol | Meaning |\n`;
  md += `| --- | --- |\n`;
  md += `| ✅ | Function tested and **passed** |\n`;
  md += `| ❌ | Function tested but **failed** (reverted on-chain) |\n`;
  md += `| ⏭ | Test exists but was **skipped / pending** |\n`;
  md += `| ⚠️ | Function **not covered** by any test |\n\n`;
  md += `---\n\n`;

  // ---- Summary table ----
  let totalFns = 0, passedFns = 0, failedFns = 0, pendingFns = 0, notTestedFns = 0;

  // Pre-resolve all statuses for summary
  const resolved = {};
  for (const [contract, data] of Object.entries(CONTRACT_FUNCTIONS)) {
    resolved[contract] = data.functions.map(fn => ({
      ...fn,
      ...resolveStatus(fn.testTitles, testList),
    }));
    for (const fn of resolved[contract]) {
      totalFns++;
      if (fn.status === 'passed') passedFns++;
      else if (fn.status === 'failed') failedFns++;
      else if (fn.status === 'pending') pendingFns++;
      else notTestedFns++;
    }
  }

  md += `## Summary\n\n`;
  md += `| Contract | ✅ Passed | ❌ Failed | ⏭ Pending | ⚠️ Not Tested | Total |\n`;
  md += `| --- | --- | --- | --- | --- | --- |\n`;

  for (const [contract, fns] of Object.entries(resolved)) {
    const p = fns.filter(f => f.status === 'passed').length;
    const f = fns.filter(f => f.status === 'failed').length;
    const sk = fns.filter(f => f.status === 'pending').length;
    const nt = fns.filter(f => f.status === 'not_tested').length;
    md += `| **${contract}** | ${p} | ${f} | ${sk} | ${nt} | ${fns.length} |\n`;
  }
  md += `| **TOTAL** | **${passedFns}** | **${failedFns}** | **${pendingFns}** | **${notTestedFns}** | **${totalFns}** |\n\n`;
  md += `---\n\n`;

  // Build address map from src/contracts/config.ts (always up-to-date)
  const contractAddrMap = new Map();
  for (const contractName of Object.keys(CONTRACT_FUNCTIONS)) {
    const addrs = getAddressesForContract(contractName, configAddresses);
    if (addrs.length > 0) contractAddrMap.set(contractName, new Set(addrs));
  }

  // ---- Per-contract sections ----
  md += `## Functions by Contract\n\n`;

  for (const [contract, fns] of Object.entries(resolved)) {
    const desc = CONTRACT_FUNCTIONS[contract].description;
    const pct = Math.round((fns.filter(f => f.status === 'passed').length / fns.length) * 100);
    const addrs = contractAddrMap.has(contract) ? [...contractAddrMap.get(contract)] : [];
    const addrSuffix = addrs.length > 0
      ? ' — ' + addrs.map(a => {
          // Determine explorer URL based on which chain the address belongs to
          let explorerBase = 'https://testnet.cotiscan.io';
          for (const [chainId, chainAddrs] of Object.entries(configAddresses)) {
            if (Object.values(chainAddrs).includes(a)) {
              explorerBase = parseInt(chainId) === 2632500
                ? 'https://mainnet.cotiscan.io'
                : 'https://testnet.cotiscan.io';
              break;
            }
          }
          return `[\`${a}\`](${explorerBase}/address/${a})`;
        }).join(', ')
      : '';
    md += `### ${contract}${addrSuffix}\n\n`;
    md += `*${desc}*  \n`;
    md += `**Test coverage: ${pct}% (${fns.filter(f => f.status === 'passed').length}/${fns.length} functions passing)**\n\n`;
    md += `| Tests | Function | Status | Covering Tests |\n`;
    md += `| --- | --- | --- | --- |\n`;

    for (const fn of fns) {
      const icon = statusIcon(fn.status);
      const label = fn.status.replace('_', ' ');
      const testNums = fn.matchedTests.length > 0
        ? [...new Set(
          fn.matchedTests
            .map(t => { const m = t.title.match(/^Test (\d+):/i); return m ? parseInt(m[1], 10) : null; })
            .filter(n => n !== null)
        )].sort((a, b) => a - b).map(n => `#${n}`).join(', ')
        : '—';
      const tests = fn.matchedTests.length > 0
        ? fn.matchedTests.map(t => `\`${t.title}\``).join(', ')
        : '—';
      md += `| ${testNums} | \`${fn.name}\` | ${icon} ${label} | ${tests} |\n`;
    }
    md += `\n`;
  }

  // ---- Contract call parameters ----
  // Build a map: contractFunction → [{ testTitle, testNum, callLog entries }]
  const callParamRows = [];
  for (const [contract, fns] of Object.entries(resolved)) {
    for (const fn of fns) {
      const testsWithCalls = fn.matchedTests
        .map(t => {
          const baseName = fn.name.split('(')[0].toLowerCase();
          const calls = (t.callLog || []).filter(c => {
            if (!c.method) return false;
            // method format: "ContractName.functionName" or "functionName"
            const methodBase = c.method.split('.').pop().split('(')[0].toLowerCase();
            return methodBase === baseName;
          });
          const m = t.title.match(/^Test (\d+):/i);
          return { testNum: m ? parseInt(m[1], 10) : null, title: t.title, calls };
        })
        .filter(x => x.calls.length > 0);
      if (testsWithCalls.length > 0) {
        callParamRows.push({ contract, fnName: fn.name, testsWithCalls });
      }
    }
  }

  if (callParamRows.length > 0) {
    md += `---\n\n`;
    md += `## 📋 Contract Call Parameters\n\n`;
    md += `Input parameters recorded during on-chain test execution.\n\n`;
    md += `| Function Name | Test | Args | Tx Hash |\n`;
    md += `| --- | --- | --- | --- |\n`;

    for (const { contract, fnName, testsWithCalls } of callParamRows) {
      for (const { testNum, title, calls } of testsWithCalls) {
        for (const call of calls) {
          const testLabel = testNum ? `#${testNum}` : title;
          const argsStr = call.args && call.args.length > 0
            ? call.args.map(a => `\`${a}\``).join(', ')
            : '—';
          const txLink = call.txHash
            ? `[\`${call.txHash.slice(0, 10)}…\`](https://testnet.cotiscan.io/tx/${call.txHash})`
            : '—';
          md += `| \`${contract}.${fnName}\` | ${testLabel} | ${argsStr} | ${txLink} |\n`;
        }
      }
    }
    md += `\n`;
  }

  // ---- Failed tests detail ----
  const failedTests = testList.filter(t => t.status === 'failed');
  if (failedTests.length > 0) {
    md += `---\n\n`;
    md += `## ❌ Failed Tests Detail\n\n`;
    failedTests.forEach((t, i) => {
      const secs = t.duration ? (t.duration / 1000).toFixed(1) + 's' : '—';
      md += `**${i + 1}. ${t.title}** (${secs})\n`;
      if (t.err) {
        const msg = typeof t.err === 'string' ? t.err : (t.err.message || JSON.stringify(t.err));
        md += `> ${msg.split('\n')[0]}\n`;
      }
      md += `\n`;
    });
  }

  // ---- Not-covered functions ----
  const notCovered = [];
  for (const [contract, fns] of Object.entries(resolved)) {
    fns.filter(f => f.status === 'not_tested').forEach(f => {
      notCovered.push({ contract, name: f.name });
    });
  }

  if (notCovered.length > 0) {
    md += `---\n\n`;
    md += `## ⚠️ Functions Without Tests\n\n`;
    md += `The following public functions have no test coverage:\n\n`;
    for (const { contract, name } of notCovered) {
      md += `- \`${contract}.${name}\`\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## Methodology\n\n`;
  md += `Coverage is determined by matching each function's known test titles against `;
  md += `the titles in \`test-results.json\`. Since tests run on a live testnet with real `;
  md += `MPC operations, "passed" means the on-chain call succeeded; "failed" means the `;
  md += `transaction reverted. Report is being improved to include line/branch coverage within functions.\n\n`;
  md += `*To regenerate this report after a test run: \`node scripts/generate-coverage-report.cjs\`*\n`;

  return md;
}

// ============================================================================
// Main
// ============================================================================

function main() {
  console.log('Coverage Report Generator (Testnet Execution)');
  console.log('=============================================\n');

  const testResults = loadTestResults();
  console.log(`📂 Loaded ${testResults.tests.length} tests from ${TEST_RESULTS_PATH}\n`);

  const report = generateReport(testResults);

  fs.writeFileSync(OUTPUT_REPORT_PATH, report, 'utf-8');
  console.log(`✅ ${OUTPUT_REPORT_PATH} written\n`);

  // Print quick summary
  const testList = testResults.tests || [];
  for (const [contract, data] of Object.entries(CONTRACT_FUNCTIONS)) {
    const fns = data.functions.map(fn => ({ ...fn, ...resolveStatus(fn.testTitles, testList) }));
    const p = fns.filter(f => f.status === 'passed').length;
    const total = fns.length;
    const pct = Math.round((p / total) * 100);
    console.log(`  ${contract}: ${p}/${total} functions passing (${pct}%)`);
  }
  console.log('');
}

if (require.main === module) {
  main();
}

module.exports = { main, CONTRACT_FUNCTIONS };
