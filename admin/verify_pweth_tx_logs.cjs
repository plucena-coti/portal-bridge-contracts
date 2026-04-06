async function main() {
    const txHash = "0x0a7056f0e4d140da1b1342c24d437e9347a9e743ecad5f2747f4d4688f07757b";
    const receipt = await ethers.provider.getTransactionReceipt(txHash);

    if (!receipt) {
        console.log("Transaction receipt not found.");
        return;
    }

    console.log(`Transaction Status: ${receipt.status === 1 ? "Success" : "Failure"}`);

    const pwethAddress = "0x5E5b9A51c1FC2cfA41dB715CcB6Ef429A3c5586B";
    const pweth = await ethers.getContractAt("PrivateCOTI", pwethAddress);

    console.log(`Total Logs in TX: ${receipt.logs.length}`);

    for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        if (log.address.toLowerCase() === pwethAddress.toLowerCase()) {
            try {
                const parsed = pweth.interface.parseLog(log);
                if (parsed.name === "Transfer") {
                    console.log(`Log ${i} [Transfer]:`);
                    console.log(`  From: ${parsed.args.from}`);
                    console.log(`  To:   ${parsed.args.to}`);
                    // Note: senderValue and receiverValue are structs in PrivateERC20
                    console.log(`  Has senderValue: ${!!parsed.args.senderValue}`);
                    console.log(`  Has receiverValue: ${!!parsed.args.receiverValue}`);
                } else if (parsed.name === "RoleGranted") {
                    console.log(`Log ${i} [RoleGranted]: role=${parsed.args.role}, account=${parsed.args.account}`);
                } else {
                    console.log(`Log ${i} [${parsed.name}]`);
                }
            } catch (e) {
                console.log(`Log ${i} (at ${log.address}): Could not parse. Topic: ${log.topics[0]}`);
            }
        } else {
            console.log(`Log ${i} (at ${log.address}): Not p.WETH`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
