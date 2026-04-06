const hre = require("hardhat");
const { ethers } = hre;

const TIMEOUT_SECONDS = 300;

// Existing token addresses from config.ts (testnet)
const BRIDGES = [
  {
    name: "PrivacyBridgeWETH",
    factory: "PrivacyBridgeWETH",
    privateFactory: "PrivateWrappedEther",
    publicToken:  "0x8bca4e6bbE402DB4aD189A316137aD08206154FB",
    privateToken: "0xc79fC578D7Fe1677c72F88cAdD63D9199D56ebe0",
  },
  {
    name: "PrivacyBridgeWBTC",
    factory: "PrivacyBridgeWBTC",
    privateFactory: "PrivateWrappedBTC",
    publicToken:  "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492",
    privateToken: "0x362F5a50423163c0f8E1bC4C8867FdC22bd74Da1",
  },
  {
    name: "PrivacyBridgeUSDT",
    factory: "PrivacyBridgeUSDT",
    privateFactory: "PrivateTetherUSD",
    publicToken:  "0x9e961430053cd5AbB3b060544cEcCec848693Cf0",
    privateToken: "0xF08633c9BbcfEf6F309e84FdE6D4c49b0118C4D3",
  },
  {
    name: "PrivacyBridgeUSDCe",
    factory: "PrivacyBridgeUSDCe",
    privateFactory: "PrivateBridgedUSDC",
    publicToken:  "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C",
    privateToken: "0xcA04109fE8CC1390666b78A82AeCa07de1C893C7",
  },
  {
    name: "PrivacyBridgeWADA",
    factory: "PrivacyBridgeWADA",
    privateFactory: "PrivateWrappedADA",
    publicToken:  "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D",
    privateToken: "0x66c85092DaF2531E920B1f36560535E3D19985a0",
  },
  {
    name: "PrivacyBridgegCOTI",
    factory: "PrivacyBridgegCoti",
    privateFactory: "PrivateCOTITreasuryGovernanceToken",
    publicToken:  "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C",
    privateToken: "0x285483dB100B068dfEf34584CA3be4B5418e9f0a",
  },
];

async function waitWithTimeout(promise, timeoutSeconds, stepName) {
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`[${stepName}] Timed out after ${timeoutSeconds}s`));
        }, timeoutSeconds * 1000);
    });
    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutHandle);
        console.log(`  [${stepName}] ✅`);
        return result;
    } catch (error) {
        clearTimeout(timeoutHandle);
        throw error;
    }
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("================================================");
    console.log("  🚀 REDEPLOYING ALL 6 ERC20 PRIVACY BRIDGES");
    console.log(`  Deployer: ${deployer.address}`);
    console.log("================================================\n");

    const MINTER_ROLE = ethers.id("MINTER_ROLE");
    const results = {};

    for (const bridge of BRIDGES) {
        console.log(`\n--- ${bridge.name} ---`);

        // Deploy bridge
        console.log(`  Deploying ${bridge.factory}...`);
        const BridgeFactory = await ethers.getContractFactory(bridge.factory);
        const deployed = await BridgeFactory.deploy(bridge.publicToken, bridge.privateToken, { gasLimit: 12000000 });
        await waitWithTimeout(deployed.waitForDeployment(), TIMEOUT_SECONDS, "deploy");
        const addr = await deployed.getAddress();
        console.log(`  -> ${addr}`);

        // Grant MINTER_ROLE
        console.log(`  Granting MINTER_ROLE on ${bridge.privateFactory}...`);
        const PrivateToken = await ethers.getContractAt(bridge.privateFactory, bridge.privateToken);
        const tx = await PrivateToken.grantRole(MINTER_ROLE, addr, { gasLimit: 5000000 });
        await waitWithTimeout(tx.wait(), TIMEOUT_SECONDS, "grantRole");

        results[bridge.name] = addr;
    }

    console.log("\n================================================");
    console.log("  ✅ ALL BRIDGES DEPLOYED");
    console.log("================================================");
    for (const [name, addr] of Object.entries(results)) {
        console.log(`  ${name}: ${addr}`);
    }
    console.log("\nUpdate config.ts with the addresses above.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
