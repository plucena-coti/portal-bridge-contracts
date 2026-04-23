#!/usr/bin/env node
"use strict";

/**
 * Converts test-results.json (produced by test-json-reporter.cjs) into
 * docs/TEST_EXECUTION_REPORT.md.
 *
 * Usage:
 *   node scripts/generate-test-report.cjs [path/to/test-results.json]
 *
 * Defaults to ./test-results.json if no argument is given.
 */

const fs   = require("fs");
const path = require("path");

const inputPath  = path.resolve(process.argv[2] || "test-results.json");
const outputPath = path.resolve("docs/TEST_EXECUTION_REPORT.md");

if (!fs.existsSync(inputPath)) {
    console.error(`❌ ${inputPath} not found. Run tests first with TEST_REPORT=1`);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const { stats, tests, contractAddresses } = data;

const duration = stats.duration
    ? `${(stats.duration / 1000).toFixed(1)}s`
    : "N/A";
const startDate = stats.start
    ? new Date(stats.start).toISOString().replace("T", " ").slice(0, 19) + " UTC"
    : "N/A";

// ── Group tests by suite ────────────────────────────────────────────────────
const suites = {};
for (const t of tests) {
    const parts = t.fullTitle.split(" ");
    // The title is the last N words; the suite is everything before it
    const suiteTitle = t.fullTitle.slice(0, t.fullTitle.length - t.title.length).trim() || "Root";
    if (!suites[suiteTitle]) suites[suiteTitle] = [];
    suites[suiteTitle].push(t);
}

// ── Build markdown ─────────────────────────────────────────────────────────
const lines = [];

lines.push("# Test Execution Report");
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push(`| Metric | Value |`);
lines.push(`|--------|-------|`);
lines.push(`| Total Tests | ${stats.tests} |`);
lines.push(`| Passed | ${stats.passes} |`);
lines.push(`| Failed | ${stats.failures} |`);
lines.push(`| Pending | ${stats.pending} |`);
lines.push(`| Duration | ${duration} |`);
lines.push(`| Run Date | ${startDate} |`);
lines.push("");

if (stats.failures > 0) {
    lines.push(`> ⚠️ **${stats.failures} test(s) failed.** See details below.`);
    lines.push("");
}

// ── Contract addresses (if captured) ───────────────────────────────────────
if (contractAddresses && contractAddresses.length > 0) {
    lines.push("## Deployed Contract Addresses");
    lines.push("");
    lines.push("| Contract | Address |");
    lines.push("|----------|---------|");
    for (const ca of contractAddresses) {
        lines.push(`| ${ca.contractName || ca.name || ca.contract || "Unknown"} | \`${ca.address}\` |`);
    }
    lines.push("");
}

// ── Test results by suite ──────────────────────────────────────────────────
lines.push("## Test Results");
lines.push("");

for (const [suiteName, suiteTests] of Object.entries(suites)) {
    lines.push(`### ${suiteName}`);
    lines.push("");
    lines.push("| # | Test | Status | Duration |");
    lines.push("|---|------|--------|----------|");

    for (let i = 0; i < suiteTests.length; i++) {
        const t = suiteTests[i];
        const icon = t.status === "passed" ? "✅" : t.status === "failed" ? "❌" : "⏭️";
        const dur = t.duration ? `${t.duration}ms` : "-";
        const title = t.title.replace(/\|/g, "\\|");
        lines.push(`| ${i + 1} | ${title} | ${icon} ${t.status} | ${dur} |`);
    }
    lines.push("");
}

// ── Failures detail ────────────────────────────────────────────────────────
const failures = tests.filter(t => t.status === "failed");
if (failures.length > 0) {
    lines.push("## Failure Details");
    lines.push("");
    for (const f of failures) {
        lines.push(`### ❌ ${f.fullTitle}`);
        lines.push("");
        if (f.err) {
            lines.push("```");
            lines.push(f.err.message || "No error message");
            lines.push("```");
            lines.push("");
        }
    }
}

// ── Call log (if any tests have it) ────────────────────────────────────────
const testsWithCalls = tests.filter(t => t.callLog && t.callLog.length > 0);
if (testsWithCalls.length > 0) {
    lines.push("## Transaction Call Log");
    lines.push("");
    for (const t of testsWithCalls) {
        lines.push(`#### ${t.title}`);
        lines.push("");
        lines.push("| Method | Args | Tx Hash |");
        lines.push("|--------|------|---------|");
        for (const c of t.callLog) {
            const args = (c.args || []).map(a => `\`${a}\``).join(", ");
            const hash = c.txHash ? `\`${c.txHash.slice(0, 10)}…\`` : "-";
            const method = (c.method || c.description || "").replace(/\|/g, "\\|");
            lines.push(`| ${method} | ${args} | ${hash} |`);
        }
        lines.push("");
    }
}

// ── Write output ───────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
console.log(`✅ Report written to ${outputPath}`);
console.log(`   ${stats.passes}/${stats.tests} passed, ${stats.failures} failed, ${stats.pending} pending (${duration})`);
