const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Granting BURNER_ROLE from deployer:", deployer.address);

    const privateTokenAddresses = {
        "PrivateCOTI": "0xA7563A3813a34300b38acC0DEE417FcAc53a2EBC",
        "PrivateWrappedEther": "0x9311aD50743428471a5AdBeA600192B436588A32",
        "PrivateWrappedBTC": "0x3f8E33AEAeCe60706eA958E3aa558d85605623ec",
        "PrivateTetherUSD": "0xD22b33a8D13BeDB15aF4EbDeF72dF40C07049375",
        "PrivateBridgedUSDC": "0x957e668aEdBfF4e9319D35d952feB691300fFaB3",
        "PrivateWrappedADA": "0x04282AE3559F5984Ea6a282a39a062167637c2C7",
        "PrivateCOTITreasuryGovernanceToken": "0x6fF20bCfa8FD07af1bD345C6c12397642EF966E6"
    };

    const bridgeAddresses = {
        "PrivacyBridgeCotiNative": "0xB5A41eCC87295A41956c2844F29d25424a572f7c",
        "PrivacyBridgeWETH": "0x46d7dd74A0D72ec21d8ab12175B817832bbDBB3b",
        "PrivacyBridgeWBTC": "0x88B8ab53d886A59673DCaB4A082264f5a98eD5E8",
        "PrivacyBridgeUSDT": "0x0f49Cb53cE5B6a48F0a5f2dAb4c5fB0d49381247",
        "PrivacyBridgeUSDCe": "0x38d8C838d2289e79Dc0d67931B66B32b8eD46977",
        "PrivacyBridgeWADA": "0x9AA04C9Dd43F200Ae9bCC21dc3586078dF3b9E82",
        "PrivacyBridgegCoti": "0xaa0B57974106cA7A83b626497A3BEd207387e072"
    };

    const pairs = [
        { tokenAddress: privateTokenAddresses.PrivateCOTI, bridgeAddress: bridgeAddresses.PrivacyBridgeCotiNative },
        { tokenAddress: privateTokenAddresses.PrivateWrappedEther, bridgeAddress: bridgeAddresses.PrivacyBridgeWETH },
        { tokenAddress: privateTokenAddresses.PrivateWrappedBTC, bridgeAddress: bridgeAddresses.PrivacyBridgeWBTC },
        { tokenAddress: privateTokenAddresses.PrivateTetherUSD, bridgeAddress: bridgeAddresses.PrivacyBridgeUSDT },
        { tokenAddress: privateTokenAddresses.PrivateBridgedUSDC, bridgeAddress: bridgeAddresses.PrivacyBridgeUSDCe },
        { tokenAddress: privateTokenAddresses.PrivateWrappedADA, bridgeAddress: bridgeAddresses.PrivacyBridgeWADA },
        { tokenAddress: privateTokenAddresses.PrivateCOTITreasuryGovernanceToken, bridgeAddress: bridgeAddresses.PrivacyBridgegCoti }
    ];

    const BURNER_ROLE = hre.ethers.id("BURNER_ROLE");

    for (const pair of pairs) {
        console.log(`Granting BURNER_ROLE for token ${pair.tokenAddress} to bridge ${pair.bridgeAddress}`);
        const token = await hre.ethers.getContractAt("PrivateERC20", pair.tokenAddress, deployer);
        
        try {
            const hasRole = await token.hasRole(BURNER_ROLE, pair.bridgeAddress);
            if (hasRole) {
                console.log(`Already has BURNER_ROLE, skipping...`);
                continue;
            }
            const tx = await token.grantRole(BURNER_ROLE, pair.bridgeAddress, { gasLimit: 12000000 });
            await tx.wait(1);
            console.log(`Granted BURNER_ROLE to ${pair.bridgeAddress}`);
        } catch (e) {
            console.log("Error granting role:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
