async function main() {
    const txHash = "0x96d518764c63e48454ee857a2fbebdeb99eb676284b6fb4ed82b63e373b38827";
    const receipt = await ethers.provider.getTransactionReceipt(txHash);

    if (!receipt) {
        console.log("Transaction receipt not found.");
        return;
    }

    console.log(`Transaction Status: ${receipt.status === 1 ? "Success" : "Failure"}`);
    console.log(`Number of logs: ${receipt.logs.length}`);

    const pwethAddress = "0x5E5b9A51c1FC2cfA41dB715CcB6Ef429A3c5586B";
    const pweth = await ethers.getContractAt("PrivateCOTI", pwethAddress);

    const transferEventTopic = pweth.interface.getEventModel("Transfer").topicHash;

    const transferLogs = receipt.logs.filter(log => log.address.toLowerCase() === pwethAddress.toLowerCase() && log.topics[0] === transferEventTopic);

    console.log(`Found ${transferLogs.length} Transfer events for p.WETH.`);

    if (transferLogs.length > 0) {
        transferLogs.forEach((log, index) => {
            try {
                const parsed = pweth.interface.parseLog(log);
                console.log(`Event ${index}: from ${parsed.args.from}, to ${parsed.args.to}`);
                // Since it's private, we might not see the amount directly in standard logs if it's the 256-bit version
                // but let's see what parseLog gives.
                console.log("Parsed Args:", parsed.args);
            } catch (e) {
                console.log(`Could not parse log ${index}:`, e.message);
            }
        });
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
