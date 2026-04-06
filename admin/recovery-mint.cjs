const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const PRIVATE_COTI_ADDRESS = "0x074A10a5Cb95436CF8FC966d7Bb9809458bf72a4";
    const BRIDGE_ADDRESS = "0x0c2Af91D8ddf3D02c4A5e31daf4926E4c2265ed2";

    // User who should receive the tokens
    const USER_ADDRESS = "0xe45fc1a7d84e73c8c71edf2814e7467f7c86a8a2";

    // Amount stuck in bridge (0.2 COTI)
    const AMOUNT_COTI = "0.2";

    const network = await ethers.provider.getNetwork();
    const isMainnet = network.chainId === 2632500n;
    const explorerUrl = isMainnet ? "https://mainnet.cotiscan.io" : "https://testnet.cotiscan.io";

    console.log(`\n🔧 Recovery Script - Minting Missing COTI.p Tokens`);
    console.log(`Chain ID: ${network.chainId}`);
    console.log(`User: ${USER_ADDRESS}`);
    console.log(`Amount: ${AMOUNT_COTI} COTI\n`);

    // Get PrivateCoti contract
    const PrivateCoti = await ethers.getContractFactory("PrivateCoti");
    const privateCoti = PrivateCoti.attach(PRIVATE_COTI_ADDRESS);

    // Check if caller has MINTER_ROLE
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();
    const hasBridgeRole = await privateCoti.hasRole(MINTER_ROLE, signerAddress);

    console.log(`Signer: ${signerAddress}`);
    console.log(`Signer has MINTER_ROLE: ${hasBridgeRole}\n`);

    if (!hasBridgeRole) {
        console.log(`⚠️  Warning: Signer doesn't have MINTER_ROLE. This might fail.`);
        console.log(`You may need to grant MINTER_ROLE to ${signerAddress} first.\n`);
    }

    // Convert amount to uint64 (wei)
    const amountWei = ethers.parseEther(AMOUNT_COTI);

    // Check if amount fits in uint64
    const MAX_UINT64 = BigInt("18446744073709551615");
    if (amountWei > MAX_UINT64) {
        console.error(`❌ Amount exceeds uint64 max. Cannot mint.`);
        process.exit(1);
    }

    // Convert BigInt to uint64 safely
    const amountUint64 = amountWei.toString();

    console.log(`Minting ${AMOUNT_COTI} COTI.p (${amountWei} wei) to ${USER_ADDRESS}...\n`);

    try {
        // Call mint function
        const tx = await privateCoti.mint(USER_ADDRESS, amountUint64, {
            gasLimit: 12000000
        });

        console.log(`✅ Transaction sent: ${tx.hash}`);
        console.log(`Explorer: ${explorerUrl}/tx/${tx.hash}`);
        console.log(`Waiting for confirmation...`);

        const receipt = await tx.wait();
        console.log(`\n✅ Tokens minted successfully!`);
        console.log(`Block: ${receipt.blockNumber}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);

        // Check for Transfer event
        console.log(`\nEvents emitted:`);
        if (receipt.logs && receipt.logs.length > 0) {
            for (const log of receipt.logs) {
                try {
                    const parsed = privateCoti.interface.parseLog({ topics: log.topics, data: log.data });
                    if (parsed && parsed.name === 'Transfer') {
                        console.log(`  ✅ Transfer event found`);
                        console.log(`     From: ${parsed.args[0]}`);
                        console.log(`     To: ${parsed.args[1]}`);
                    }
                } catch (e) {
                    // Skip unparseable events
                }
            }
        }

        console.log(`\n🎉 Recovery complete! User should now have 0.2 COTI.p tokens.`);
        console.log(`\nNote: The tokens are encrypted. User will need the COTI Snap to decrypt and see the balance.`);

    } catch (error) {
        console.error(`\n❌ Minting failed:`, error.message);
        if (error.data) {
            console.error(`Error data:`, error.data);
        }

        // Check if it's a permission error
        if (error.message.includes("AccessControlUnauthorizedAccount")) {
            console.error(`\n💡 This is a permission error. The signer needs MINTER_ROLE.`);
            console.error(`Run: npx hardhat run contracts/scripts/grant-bridge-role.cjs --network cotiMainnet`);
            console.error(`But grant the role to ${signerAddress} instead of the bridge.`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
