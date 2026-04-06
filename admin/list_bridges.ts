#!/usr/bin/env ts-node

/**
 * Generates docs/bridges.md — a human-readable list of all bridge contracts
 * with their on-chain addresses, input/output token addresses, and current fees.
 *
 * Reads src/contracts/config.ts as source text (no bundler required).
 * Fetches live fee values via JSON-RPC eth_call.
 *
 * Usage:
 *   npx ts-node --skipProject scripts/list_bridges.ts
 * Or add to package.json scripts:
 *   "list-bridges": "ts-node --skipProject scripts/list_bridges.ts"
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// ---------------------------------------------------------------------------
// RPC helpers (no ethers dependency — plain eth_call)
// ---------------------------------------------------------------------------

const RPC_URLS: Record<string, string> = {
  '7082400': 'https://testnet.coti.io/rpc',
  '2632500': 'https://mainnet.coti.io/rpc',
};

// ABI-encoded selector for a no-arg view function returning uint256
function selector(sig: string): string {
  // Simple keccak256 of the signature — precomputed for the three fee getters:
  const TABLE: Record<string, string> = {
    'depositFeeBasisPoints()': '0x5708f3e0',
    'withdrawFeeBasisPoints()': '0x208ec551',
    'nativeCotiFee()': '0xc87deaa4',
  };
  return TABLE[sig] ?? (() => { throw new Error(`Unknown selector: ${sig}`); })();
}

function rpcPost(url: string, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };
    const req = https.request(url, opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { reject(new Error(`Bad JSON: ${raw}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function callUint256(rpcUrl: string, to: string, sig: string): Promise<bigint | null> {
  try {
    const res = await rpcPost(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_call',
      params: [{ to, data: selector(sig) }, 'latest'],
    });
    if (res.error || !res.result || res.result === '0x') return null;
    return BigInt(res.result);
  } catch {
    return null;
  }
}

function bpsToPercent(bps: bigint): string {
  // FEE_DIVISOR = 1_000_000 → 1 unit = 0.0001%
  const pct = Number(bps) / 10000;
  return pct === 0 ? '0%' : `${pct.toFixed(4).replace(/\.?0+$/, '')}%`;
}

function formatNativeFee(wei: bigint): string {
  if (wei === 0n) return '0 COTI';
  const coti = Number(wei) / 1e18;
  return `${coti} COTI`;
}

interface BridgeFees {
  depositBps: bigint | null;
  withdrawBps: bigint | null;
  nativeFee: bigint | null;
}

async function fetchFees(rpcUrl: string, bridgeAddr: string): Promise<BridgeFees> {
  const [depositBps, withdrawBps, nativeFee] = await Promise.all([
    callUint256(rpcUrl, bridgeAddr, 'depositFeeBasisPoints()'),
    callUint256(rpcUrl, bridgeAddr, 'withdrawFeeBasisPoints()'),
    callUint256(rpcUrl, bridgeAddr, 'nativeCotiFee()'),
  ]);
  return { depositBps, withdrawBps, nativeFee };
}

// ---------------------------------------------------------------------------
// Parse CONTRACT_ADDRESSES from config.ts source text
// ---------------------------------------------------------------------------

function parseContractAddresses(src: string): Record<string, Record<string, string>> {
  const startIdx = src.indexOf('export const CONTRACT_ADDRESSES');
  if (startIdx === -1) throw new Error('CONTRACT_ADDRESSES not found in config.ts');

  const openBrace = src.indexOf('{', startIdx);
  let depth = 0, end = openBrace;
  for (let i = openBrace; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  const block = src.slice(openBrace, end + 1);

  const result: Record<string, Record<string, string>> = {};
  const chainBlockRe = /(\d+)\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let chainMatch: RegExpExecArray | null;
  while ((chainMatch = chainBlockRe.exec(block)) !== null) {
    const chainId = chainMatch[1];
    const inner = chainMatch[2];
    const addrs: Record<string, string> = {};
    const kvRe = /"?([^":\s]+)"?\s*:\s*"(0x[0-9a-fA-F]+)"/g;
    let kv: RegExpExecArray | null;
    while ((kv = kvRe.exec(inner)) !== null) addrs[kv[1]] = kv[2];
    result[chainId] = addrs;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Bridge → token key mapping
// ---------------------------------------------------------------------------

function parseBridgeTokens(src: string): { bridgeKey: string; label: string; inputKey: string | null; outputKey: string }[] {
  const startIdx = src.indexOf('export const SUPPORTED_TOKENS');
  if (startIdx === -1) throw new Error('SUPPORTED_TOKENS not found');
  const endIdx = src.indexOf('];', startIdx);
  const block = src.slice(startIdx, endIdx);

  const tokens: any[] = [];
  const objRe = /\{([^}]+)\}/g;
  let match;
  while ((match = objRe.exec(block)) !== null) {
    const inner = match[1];
    const t: any = {};
    const symMatch = inner.match(/symbol:\s*"([^"]+)"/);
    if (symMatch) t.symbol = symMatch[1];
    t.isPrivate = inner.includes('isPrivate: true');
    const addrKeyMatch = inner.match(/addressKey:\s*"([^"]+)"/);
    if (addrKeyMatch) t.addressKey = addrKeyMatch[1];
    const bridgeMatch = inner.match(/bridgeAddressKey:\s*"([^"]+)"/);
    if (bridgeMatch) t.bridgeAddressKey = bridgeMatch[1];
    tokens.push(t);
  }

  const bridgesMap: Record<string, any> = {};
  for (const t of tokens) {
    if (!t.bridgeAddressKey) continue;
    if (!bridgesMap[t.bridgeAddressKey]) {
      bridgesMap[t.bridgeAddressKey] = {
        bridgeKey: t.bridgeAddressKey,
        label: '',
        inputKey: null,
        outputKey: ''
      };
    }
    const b = bridgesMap[t.bridgeAddressKey];
    if (t.isPrivate) {
      b.outputKey = t.addressKey || '';
    } else {
      b.inputKey = t.addressKey || null;
      b.label = `${t.symbol} Bridge`;
    }
  }

  if (bridgesMap['PrivacyBridgeCotiNative']) {
    if (!bridgesMap['PrivacyBridgeCotiNative'].label) {
      bridgesMap['PrivacyBridgeCotiNative'].label = 'COTI Native Bridge';
    }
  }

  const bridgesList = Object.values(bridgesMap);
  const nativeIdx = bridgesList.findIndex((b: any) => b.bridgeKey === 'PrivacyBridgeCotiNative');
  if (nativeIdx > 0) {
    const native = bridgesList.splice(nativeIdx, 1)[0];
    bridgesList.unshift(native);
  }

  return bridgesList;
}

const NETWORK_LABELS: Record<string, string> = {
  '7082400': 'Testnet (chainId 7082400)',
  '2632500': 'Mainnet (chainId 2632500)',
};

const EXPLORER: Record<string, string> = {
  '7082400': 'https://testnet.cotiscan.io/address',
  '2632500': 'https://cotiscan.io/address',
};

function addrLink(address: string, base: string): string {
  return `[\`${address}\`](${base}/${address})`;
}

function feeCell(val: bigint | null, fmt: (v: bigint) => string): string {
  return val === null ? '*n/a*' : fmt(val);
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

async function generateReport(
  contractAddresses: Record<string, Record<string, string>>,
  bridgeTokens: { bridgeKey: string; label: string; inputKey: string | null; outputKey: string }[]
): Promise<string> {
  const date = new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  let md = `# Bridge Contracts\n\n`;
  md += `**Generated:** ${date}  \n`;
  md += `**Source:** \`src/contracts/config.ts\`\n\n`;
  md += `---\n\n`;

  for (const [chainId, addrMap] of Object.entries(contractAddresses)) {
    if (chainId !== '7082400') continue;
    const networkLabel = NETWORK_LABELS[chainId] ?? `Chain ${chainId}`;
    const explorer = EXPLORER[chainId] ?? 'https://cotiscan.io/address';
    const rpcUrl = RPC_URLS[chainId];

    md += `## ${networkLabel}\n\n`;

    let hasBridge = false;

    for (const { bridgeKey, label, inputKey, outputKey } of bridgeTokens) {
      const bridgeAddr = addrMap[bridgeKey];
      if (!bridgeAddr) continue;

      hasBridge = true;
      const inputTokenName = inputKey ?? 'Native COTI';
      const inputAddr = inputKey ? addrMap[inputKey] : null;
      const outputAddr = addrMap[outputKey];

      process.stdout.write(`  Fetching fees for ${label} (${chainId})...`);
      const fees = rpcUrl ? await fetchFees(rpcUrl, bridgeAddr) : { depositBps: null, withdrawBps: null, nativeFee: null };
      console.log(' done');

      md += `### ${label}\n\n`;
      md += `| | Address |\n`;
      md += `| --- | --- |\n`;
      md += `| **Bridge** (\`${bridgeKey}\`) | ${addrLink(bridgeAddr, explorer)} |\n`;
      md += `| **Input** (\`${inputTokenName}\`) | ${inputAddr ? addrLink(inputAddr, explorer) : '*native coin*'} |\n`;
      md += `| **Output** (\`${outputKey}\`) | ${outputAddr ? addrLink(outputAddr, explorer) : '—'} |\n`;
      md += `\n`;
      md += `**Fees:**\n\n`;
      md += `| Fee | Value |\n`;
      md += `| --- | --- |\n`;
      md += `| Deposit fee | ${feeCell(fees.depositBps, bpsToPercent)} |\n`;
      md += `| Withdraw fee | ${feeCell(fees.withdrawBps, bpsToPercent)} |\n`;
      md += `| Native COTI fee | ${feeCell(fees.nativeFee, formatNativeFee)} |\n`;
      md += `\n`;
    }

    if (!hasBridge) {
      md += `*No bridge contracts deployed on this network yet.*\n\n`;
    }

    md += `---\n\n`;
  }

  md += `*To regenerate: \`npx ts-node --skipProject scripts/list_bridges.ts\`*\n`;

  return md;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const configPath = path.resolve('src/contracts/config.ts');
  if (!fs.existsSync(configPath)) {
    console.error(`❌  ${configPath} not found`);
    process.exit(1);
  }

  const configSrc = fs.readFileSync(configPath, 'utf-8');
  const contractAddresses = parseContractAddresses(configSrc);
  const bridgeTokens = parseBridgeTokens(configSrc);

  const DOCS_DIR = path.resolve('docs');
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

  const report = await generateReport(contractAddresses, bridgeTokens);

  const OUTPUT_PATH = path.join(DOCS_DIR, 'bridges.md');
  fs.writeFileSync(OUTPUT_PATH, report, 'utf-8');
  console.log(`\n✅  docs/bridges.md written`);
}

main().catch(e => { console.error(e); process.exit(1); });
