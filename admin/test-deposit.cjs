const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const BRIDGE_ADDRESS = "0x0c2Af91D8ddf3D02c4A5e31daf4926E4c2265ed2";

    const network = await ethers.provider.getNetwork();
    const isMainnet = network.chainId === 2632500n;
    const explorerUrl = isMainnet ? "https://mainnet.cotiscan.io" : "https://testnet.cotiscan.io";

    console.log(`\n💰 Testing Deposit on Chain ID ${network.chainId}\n`);

    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();
    console.log(`Using account: ${signerAddress}`);

    // Get bridge contract
    const PrivacyBridgeCotiNative = await ethers.getContractFactory("PrivacyBridgeCotiNative");
    const bridge = PrivacyBridgeCotiNative.attach(BRIDGE_ADDRESS);

    // Amount to deposit (0.01 COTI for testing)
    const amount = ethers.parseEther("0.01");
    console.log(`Depositing: ${ethers.formatEther(amount)} COTI\n`);

    try {
        // Call deposit with value
        const tx = await bridge.deposit({
            value: amount,
            gasLimit: 12000000
        });

        console.log(`✅ Transaction sent: ${tx.hash}`);
        console.log(`Explorer: ${explorerUrl}/tx/${tx.hash}`);
        console.log(`Waiting for confirmation...`);

        const receipt = await tx.wait();
        console.log(`\n✅ Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);

        // Check for events
        console.log(`\nEvents emitted:`);
        if (receipt.logs && receipt.logs.length > 0) {
            console.log(`  ${receipt.logs.length} log(s) found`);

            // Try to parse Deposit event
            for (const log of receipt.logs) {
                try {
                    const parsed = bridge.interface.parseLog({ topics: log.topics, data: log.data });
                    if (parsed) {
                        console.log(`  - ${parsed.name}: ${JSON.stringify(parsed.args, null, 2)}`);
                    }
                } catch (e) {
                    // Event from another contract (like PrivateCoti)
                }
            }
        } else {
            console.log(`  ⚠️ No events emitted`);
        }

        console.log(`\n🎉 Deposit successful! Check if you received COTI.p tokens.`);

    } catch (error) {
        console.error(`\n❌ Deposit failed:`, error.message);
        if (error.data) {
            console.error(`Error data:`, error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
