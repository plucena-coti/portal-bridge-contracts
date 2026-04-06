#!/usr/bin/env node
"use strict";

/**
 * Custom Mocha reporter for Hardhat tests.
 *
 * Behaviour:
 *   - Delegates display output to the built-in "spec" reporter so the terminal
 *     output looks exactly the same as a normal run.
 *   - After the run ends, writes a structured JSON file to TEST_RESULTS_PATH
 *     (default: test-results.json) that `scripts/generate-test-report.cjs` can
 *     parse to produce TEST_EXECUTION_REPORT.md.
 *
 * Activated via hardhat.config.cjs when TEST_REPORT=1:
 *   mocha: { reporter: './scripts/test-json-reporter.cjs' }
 */

const Mocha = require("mocha");
const fs    = require("fs");
const path  = require("path");

const {
    EVENT_TEST_PASS,
    EVENT_TEST_FAIL,
    EVENT_TEST_PENDING,
    EVENT_RUN_END,
} = Mocha.Runner.constants;

class JsonFileReporter extends Mocha.reporters.Spec {
    constructor(runner, options) {
        // Let Spec handle all console output
        super(runner, options);

        const results = {
            stats:    {},
            passes:   [],
            failures: [],
            pending:  [],
            tests:    [],
        };

        const getCallLog = (test) =>
            (process.__testCallLog && process.__testCallLog[test.fullTitle()]) || [];

        runner.on(EVENT_TEST_PASS, (test) => {
            const entry = {
                fullTitle: test.fullTitle(),
                title:     test.title,
                duration:  test.duration,
                status:    "passed",
                callLog:   getCallLog(test),
            };
            results.passes.push(entry);
            results.tests.push(entry);
        });

        runner.on(EVENT_TEST_FAIL, (test, err) => {
            const entry = {
                fullTitle: test.fullTitle(),
                title:     test.title,
                duration:  test.duration,
                status:    "failed",
                callLog:   getCallLog(test),
                err: {
                    message: err.message,
                    stack:   err.stack,
                },
            };
            results.failures.push(entry);
            results.tests.push(entry);
        });

        runner.on(EVENT_TEST_PENDING, (test) => {
            const entry = {
                fullTitle: test.fullTitle(),
                title:     test.title,
                duration:  0,
                status:    "pending",
                callLog:   [],
            };
            results.pending.push(entry);
            results.tests.push(entry);
        });

        runner.once(EVENT_RUN_END, () => {
            results.stats = {
                suites:   runner.stats.suites,
                tests:    runner.stats.tests,
                passes:   runner.stats.passes,
                failures: runner.stats.failures,
                pending:  runner.stats.pending,
                duration: runner.stats.duration,
                start:    runner.stats.start,
                end:      runner.stats.end,
            };
            results.contractAddresses = process.__contractAddresses || [];

            const outPath = path.resolve(
                process.env.TEST_RESULTS_PATH || "test-results.json"
            );
            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
            console.log(`\n  [report] Test results written to ${outPath}`);
        });
    }
}

module.exports = JsonFileReporter;
