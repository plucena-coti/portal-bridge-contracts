

require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();


const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2 || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.8.19",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.4.24",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    networks: {
        cotiTestnet: {
            url: "https://testnet.coti.io/rpc",
            chainId: 7082400,
            accounts: [PRIVATE_KEY, PRIVATE_KEY2].filter(key => key !== ""),
            timeout: 300000,
            gasPrice: 10000000000 // 10 gwei
        },
        cotiMainnet: {
            url: "https://mainnet.coti.io/rpc",
            chainId: 2632500,
            accounts: [PRIVATE_KEY].filter(key => key !== ""),
            timeout: 60000,
            gasPrice: 10000000000 // 10 gwei
        },
    },
    etherscan: {
        apiKey: {
            cotiTestnet: "abc",
            cotiMainnet: "abc"
        },
        customChains: [
            {
                network: "cotiTestnet",
                chainId: 7082400,
                urls: {
                    apiURL: "https://testnet.cotiscan.io/api",
                    browserURL: "https://testnet.cotiscan.io"
                }
            },
            {
                network: "cotiMainnet",
                chainId: 2632500,
                urls: {
                    apiURL: "https://mainnet.cotiscan.io/api",
                    browserURL: "https://mainnet.cotiscan.io"
                }
            }
        ]
    },
    sourcify: {
        enabled: false
    },
    paths: {
        sources: "./contracts",
        tests: "./contracts/test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    // When TEST_REPORT=1 use the custom reporter that writes test-results.json
    // while still forwarding display output to the built-in spec reporter.
    mocha: {
        reporter: process.env.TEST_REPORT ? "./scripts/test-json-reporter.cjs" : "spec",
    },
};
