const fs = require("fs");
const path = require("path");

const OUT_DIR = path.resolve(__dirname, "../flattened");

function main() {
    const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('_flat.sol'));

    for (const file of files) {
        const name = file.replace('_flat.sol', '');
        const content = fs.readFileSync(path.join(OUT_DIR, file), "utf8");

        const minimalJson = {
            language: "Solidity",
            sources: {
                [`${name}.sol`]: {
                    content: content
                }
            },
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                outputSelection: {
                    "*": {
                        "*": [
                            "evm.bytecode",
                            "evm.deployedBytecode",
                            "devdoc",
                            "userdoc",
                            "metadata",
                            "abi"
                        ]
                    }
                }
            }
        };

        const outPath = path.join(OUT_DIR, `${name}_minimal_input.json`);
        fs.writeFileSync(outPath, JSON.stringify(minimalJson, null, 2), "utf8");
        console.log(`Generated ${name}_minimal_input.json (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
    }
}

main();
