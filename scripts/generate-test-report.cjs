#!/usr/bin/env node
"use strict";

/**
 * Test Execution Report Generator
 *
 * Reads test-results.json (produced by scripts/test-json-reporter.cjs) and
 * writes a human-readable markdown file to TEST_EXECUTION_REPORT.md.
 *
 * Usage (via npm script):
 *   npm run generate:test-report          — full suite run then generate
 *   npm run generate:test-report:erc20    — PrivateERC20-only run then generate
 *
 * Or run standalone after a test run:
 *   node scripts/generate-test-report.cjs
 */

const fs   = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const RESULTS_PATH = path.resolve(
    process.env.TEST_RESULTS_PATH || "test-results.json"
);
const OUTPUT_PATH = path.resolve("docs/TEST_EXECUTION_REPORT.md");

// Maps a describe-block title fragment → section heading in the report.
// Order matters: first match wins.
const SUITE_LABELS = [
    { match: "Native Bridge (PrivacyBridgeCotiNative)",          label: "Native Bridge (PrivacyBridgeCotiNative)" },
    { match: "ERC20 Bridge — Encrypted Deposit Tests",           label: "ERC20 Bridge — Encrypted Deposit Tests (WETH)" },
    { match: "ERC20 Bridge — Encrypted Withdrawal Tests",        label: "ERC20 Bridge — Encrypted Withdrawal Tests (WETH)" },
    { match: "ERC20 Bridge (",                                   label: "ERC20 Bridge" },
    { match: "Native Bridge — Encrypted Deposit Fee Mismatch",   label: "Native Bridge — Encrypted Deposit Fee Mismatch Bug" },
    { match: "Coverage Improvements - PrivacyBridgeCotiNative",  label: "Coverage Improvements — PrivacyBridgeCotiNative" },
    { match: "Coverage Improvements - PrivateERC20",             label: "Coverage Improvements — PrivateERC20" },
    { match: "PrivateERC20 Public-Amount Functions",             label: "PrivateERC20 Public-Amount Functions" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readResults() {
    if (!fs.existsSync(RESULTS_PATH)) {
        console.error(`❌  ${RESULTS_PATH} not found.`);
        console.error("    Run a test report command first, e.g.: npm run generate:test-report");
        process.exit(1);
    }
    console.log(`📖  Reading test results from: ${RESULTS_PATH}`);
    return JSON.parse(fs.readFileSync(RESULTS_PATH, "utf-8"));
}

/** Extract the suite name from the fullTitle (strip outer wrapper describe). */
function parseSuite(fullTitle) {
    // fullTitle: "Unified Privacy Bridges Suite <Suite Name> <test title>"
    const outer = "Unified Privacy Bridges Suite ";
    const inner = fullTitle.startsWith(outer) ? fullTitle.slice(outer.length) : fullTitle;

    for (const { match, label } of SUITE_LABELS) {
        if (inner.includes(match)) return label;
    }

    // Fallback: use first path segment
    const firstSpace = inner.indexOf(" ");
    return firstSpace === -1 ? inner : inner.slice(0, firstSpace);
}

function statusIcon(status) {
    if (status === "passed")  return "✅ PASSED";
    if (status === "failed")  return "❌ FAILED";
    if (status === "pending") return "⏭ SKIPPED";
    return "❓ UNKNOWN";
}

function formatDuration(ms) {
    if (!ms) return "";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(dateStr) {
    if (!dateStr) return "unknown";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", timeZoneName: "short"
    });
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function generateReport(results) {
    const { stats, tests = [], failures = [] } = results;

    // Group tests by suite
    const suiteMap = new Map();
    let counter = 0;
    for (const t of tests) {
        counter++;
        const suite = parseSuite(t.fullTitle);
        if (!suiteMap.has(suite)) suiteMap.set(suite, []);
        suiteMap.get(suite).push({ ...t, seq: counter });
    }

    const runDate  = formatDate(stats.start);
    const duration = stats.duration ? formatDuration(stats.duration) : "—";

    const lines = [];

    // -----------------------------------------------------------------------
    // Header
    // -----------------------------------------------------------------------
    lines.push("# Test Execution Report — Unified Privacy Bridges Suite");
    lines.push("");
    lines.push(`**Network:** cotiTestnet (chainId 7082400)  `);
    lines.push(`**Run date:** ${runDate}  `);
    lines.push(`**Total duration:** ${duration}  `);
    lines.push("");
    lines.push("---");
    lines.push("");

    // -----------------------------------------------------------------------
    // Summary table
    // -----------------------------------------------------------------------
    lines.push("## Summary");
    lines.push("");
    lines.push("| Status | Count |");
    lines.push("|--------|-------|");
    lines.push(`| ✅ PASSED  | ${stats.passes  ?? 0} |`);
    lines.push(`| ❌ FAILED  | ${stats.failures ?? 0} |`);
    lines.push(`| ⏭ SKIPPED | ${stats.pending  ?? 0} |`);
    lines.push(`| **Total** | **${stats.tests ?? 0}** |`);
    lines.push("");
    lines.push("---");
    lines.push("");

    // -----------------------------------------------------------------------
    // Per-suite sections
    // -----------------------------------------------------------------------
    for (const [suite, suiteTests] of suiteMap.entries()) {
        lines.push(`### ${suite}`);
        lines.push("");
        lines.push("| Seq | Test Name | Status | Duration |");
        lines.push("|-----|-----------|--------|----------|");
        for (const t of suiteTests) {
            const name = t.title.replace(/\|/g, "\\|");
            const dur  = formatDuration(t.duration);
            lines.push(`| Test ${t.seq} | ${name} | ${statusIcon(t.status)} | ${dur} |`);
        }
        lines.push("");
    }

    lines.push("---");
    lines.push("");

    // -----------------------------------------------------------------------
    // Failure details
    // -----------------------------------------------------------------------
    if (failures.length > 0) {
        lines.push("## Failure Details");
        lines.push("");
        let idx = 1;
        for (const f of failures) {
            lines.push(`### ${idx++}) ${f.title}`);
            lines.push("");
            lines.push(`**Suite:** ${parseSuite(f.fullTitle)}  `);
            if (f.err?.message) {
                lines.push("**Error:**");
                lines.push("```");
                lines.push(f.err.message.slice(0, 800));
                lines.push("```");
            }
            lines.push("");
        }
        lines.push("---");
        lines.push("");
    }

    // -----------------------------------------------------------------------
    // Footer
    // -----------------------------------------------------------------------
    lines.push(`*Generated by \`scripts/generate-test-report.cjs\` on ${runDate}.*`);
    lines.push("");

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const results = readResults();
const markdown = generateReport(results);
fs.writeFileSync(OUTPUT_PATH, markdown, "utf-8");
console.log(`✅  Test report written to: ${OUTPUT_PATH}`);
console.log(`    (${results.stats.tests ?? 0} tests: ${results.stats.passes ?? 0} passed, ${results.stats.failures ?? 0} failed, ${results.stats.pending ?? 0} skipped)`);
