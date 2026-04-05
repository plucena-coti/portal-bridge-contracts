const hre = require("hardhat");
const { ethers } = hre;

const CONTRACT_ADDRESSES = {
    // COTI Testnet
    7082400: {
        PrivacyBridgeCotiNative: "0xBBBd1550dC18F2094626049135D53E61665EdCBe",
        PrivacyBridgeWETH: "0x8DA53232f5d76316a2B5091415314C9Cb8E8F04c",
        PrivacyBridgeWBTC: "0x57Ba0Bb79A9FfDB6B0a414C05505916207794321",
        PrivacyBridgeUSDT: "0xD9f56D60341e736899b44e1F05D28a36E5Ad482a",
        PrivacyBridgeUSDCe: "0xE5aA795F0BEbA2F5113c7650682100a2Fc01851C",
        PrivacyBridgeWADA: "0x3432ae57e7D94f6D6E463E54e9a83886b0EC3a6A",
        PrivacyBridgegCOTI: "0xf21DB9aEC10B00C828a30768d04938466d98C64c"
    },
    // COTI Mainnet
    2632500: {
        // Other bridges might not be configured in the frontend config, 
        // but CotiNative is definitely there.
        PrivacyBridgeCotiNative: "0x6056bFE6776df4bEa7235A19f6D672089b4cdBeB"
    }
};

async function main() {
    console.log("=========================================");
    console.log("   🔄 ZEROING ALL BRIDGE FEES");
    console.log("=========================================");

    const network = await ethers.provider.getNetwork();
    const chainId = Number(network.chainId);
    console.log(`\nConnected to network ID: ${chainId}`);

    const bridges = CONTRACT_ADDRESSES[chainId];
    if (!bridges) {
        console.error(`❌ No bridge configuration found for chain ID ${chainId}`);
        process.exit(1);
    }

    const [signer] = await ethers.getSigners();
    console.log(`Using signer: ${signer.address}`);

    const bridgeAbi = [
        "function setDepositFee(uint256) external",
        "function setWithdrawFee(uint256) external",
        "function setNativeCotiFee(uint256) external",
        "function depositFeeBasisPoints() external view returns (uint256)",
        "function withdrawFeeBasisPoints() external view returns (uint256)",
        "function owner() external view returns (address)"
    ];

    for (const [name, address] of Object.entries(bridges)) {
        if (!name.startsWith("PrivacyBridge")) continue;
        console.log(`\n[${name}] Zeroing fees at ${address}...`);

        try {
            const bridge = new ethers.Contract(address, bridgeAbi, signer);

            const owner = await bridge.owner();
            if (owner.toLowerCase() !== signer.address.toLowerCase()) {
                console.log(`  ⚠️ Signer is not the owner (Owner: ${owner}). Skipping.`);
                continue;
            }

            console.log("  -> Setting deposit fee to 0");
            const tx1 = await bridge.setDepositFee(0, { gasLimit: 500000 });
            await tx1.wait();

            console.log("  -> Setting withdraw fee to 0");
            const tx2 = await bridge.setWithdrawFee(0, { gasLimit: 500000 });
            await tx2.wait();

            try {
                // Native bridge does not use nativeCotiFee so we surround with try/catch
                const tx3 = await bridge.setNativeCotiFee(0, { gasLimit: 500000 });
                await tx3.wait();
                console.log("  -> Setting native COTI fee to 0 (Success)");
            } catch (e) {
                // Expected for native bridge as it fails or might not use the method easily
                console.log(`  -> Native COTI fee check skipped (not supported/failed)`);
            }

            console.log(`  ✅ Successfully updated fees for ${name}.`);
        } catch (error) {
            console.error(`  ❌ Failed to zero out fees for ${name}:`);
            console.error("     " + error.message);
        }
    }

    console.log("\n=========================================");
    console.log("   ✅ FINISHED PROCESSING BRIDGES");
    console.log("=========================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
