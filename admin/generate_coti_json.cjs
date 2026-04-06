const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Extracts the pragma version from a Solidity source string, e.g. "^0.8.19" -> "0.8.19"
 */
function extractPragmaVersion(source) {
    const match = source.match(/pragma\s+solidity\s+[\^>=<~]*\s*(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
}

/**
 * Extracts all top-level contract/interface/library names from Solidity source.
 */
function extractContractNames(source) {
    const names = [];
    const re = /^\s*(?:abstract\s+)?(?:contract|interface|library)\s+(\w+)/gm;
    let m;
    while ((m = re.exec(source)) !== null) {
        names.push(m[1]);
    }
    return names;
}

/**
 * Finds compiler settings matching the given pragma version (e.g. "0.8.19") from hardhat config.
 * If pragma uses ^ or >= range, find the lowest configured version that satisfies it.
 */
function getCompilerSettings(pragmaVersion) {
    const compilers = hre.config.solidity.compilers;
    if (!pragmaVersion) {
        // fallback to last compiler
        const c = compilers[compilers.length - 1];
        return { version: c.version, settings: c.settings };
    }

    // Hardcoded fix for Hardhat behavior: this project compiles ^0.8.19 with 0.8.20
    if (pragmaVersion.includes("0.8.19")) {
        const c = compilers.find(x => x.version.startsWith("0.8.20"));
        if (c) return { version: c.version, settings: c.settings };
    }

    // Find exact version match if specified
    const exactMatch = pragmaVersion.match(/0\.8\.\d+/);
    if (exactMatch) {
        const v = exactMatch[0];
        const c = compilers.find(x => x.version.startsWith(v));
        if (c) return { version: c.version, settings: c.settings };
    }

    // If no exact match found, use first compiler as final fallback
    const c = compilers[0];
    return { version: c.version, settings: c.settings };
}

async function generateJsonForContract(contractPath) {
    console.log(`\n--- Generating JSON for: ${contractPath} ---`);
    try {
        // Get the dependency graph to find all required files
        const dependencyGraph = await hre.run("compile:solidity:get-dependency-graph", {
            sourceNames: [contractPath]
        });

        const sources = {};
        const resolvedFiles = dependencyGraph.getResolvedFiles();

        // Read all source files
        for (const file of resolvedFiles) {
            sources[file.sourceName] = {
                content: fs.readFileSync(file.absolutePath, "utf8")
            };
        }

        // Detect the pragma version of the main contract
        const mainSource = sources[contractPath]?.content || "";
        const pragmaVersion = extractPragmaVersion(mainSource);
        const { version: compilerVersion, settings } = getCompilerSettings(pragmaVersion);

        // Detect the actual contract name from the source (use last one, which is typically the main contract)
        const contractNames = extractContractNames(mainSource);
        const contractName = contractNames.length > 0 ? contractNames[contractNames.length - 1] : path.basename(contractPath, ".sol");

        // Build the Standard JSON input exactly as Blockscout expects:
        // - No outputSelection (Blockscout ignores it and it bloats the file)
        // - compilationTarget: { "<sourceName>": "<ContractName>" }
        // - settings exactly matching deployment settings
        const standardJson = {
            language: "Solidity",
            sources: sources,
            settings: {
                optimizer: settings.optimizer,
                viaIR: settings.viaIR || false,
                compilationTarget: {
                    [contractPath]: contractName
                },
                outputSelection: {
                    "*": {
                        "*": ["*"]
                    }
                }
            }
        };

        const outputName = path.basename(contractPath, ".sol");
        const outputPath = path.join(process.cwd(), `${outputName}_StandardInput.json`);
        fs.writeFileSync(outputPath, JSON.stringify(standardJson, null, 2));

        console.log(`✅ Standard JSON generated for ${contractName} (using solc ${compilerVersion})!`);
        console.log("   File:", outputPath);
        console.log("   Sources:", Object.keys(sources).length, "| compilationTarget:", contractName);
    } catch (err) {
        console.error(`Error generating input for ${contractPath}:`, err);
    }
}

async function main() {
    const contracts = [
        "contracts/token/PrivateERC20/tokens/PrivateCOTI.sol",
        "contracts/privacyBridge/PrivacyBridgeCotiNative.sol",
        "contracts/privacyBridge/PrivacyBridgeWETH.sol",
        "contracts/privacyBridge/PrivacyBridgeWBTC.sol",
        "contracts/privacyBridge/PrivacyBridgeUSDCe.sol",
        "contracts/privacyBridge/PrivacyBridgeUSDT.sol",
        "contracts/privacyBridge/PrivacyBridgeWADA.sol",
        "contracts/privacyBridge/PrivacyBridgegCoti.sol",
        "contracts/erc20-mocks/WETH.sol"
    ];

    for (const contract of contracts) {
        await generateJsonForContract(contract);
    }
}

main().catch(console.error);
