const hre = require("hardhat");

async function main() {
    console.log("Checking and granting roles...");
    const [deployer] = await hre.ethers.getSigners();
    console.log("Using deployer:", deployer.address);

    const privateTokenAddresses = {
        "PrivateCOTI": "0xA7563A3813a34300b38acC0DEE417FcAc53a2EBC",
        "PrivateWrappedEther": "0x9311aD50743428471a5AdBeA600192B436588A32",
        "PrivateWrappedBTC": "0x3f8E33AEAeCe60706eA958E3aa558d85605623ec",
        "PrivateTetherUSD": "0xD22b33a8D13BeDB15aF4EbDeF72dF40C07049375",
        "PrivateBridgedUSDC": "0x957e668aEdBfF4e9319D35d952feB691300fFaB3",
        "PrivateWrappedADA": "0x04282AE3559F5984Ea6a282a39a062167637c2C7",
        "PrivateCOTITreasuryGovernanceToken": "0x6fF20bCfa8FD07af1bD345C6c12397642EF966E6",
        // Test-suite deployments (bug-regression suite uses these)
        "PrivateCOTI_Test": "0x03eeA59b1F0Dfeaece75531b27684DD882f79759"
    };

    const bridgeAddresses = {
        "PrivacyBridgeCotiNative": "0xB5A41eCC87295A41956c2844F29d25424a572f7c",
        "PrivacyBridgeWETH": "0x46d7dd74A0D72ec21d8ab12175B817832bbDBB3b",
        "PrivacyBridgeWBTC": "0x88B8ab53d886A59673DCaB4A082264f5a98eD5E8",
        "PrivacyBridgeUSDT": "0x0f49Cb53cE5B6a48F0a5f2dAb4c5fB0d49381247",
        "PrivacyBridgeUSDCe": "0x38d8C838d2289e79Dc0d67931B66B32b8eD46977",
        "PrivacyBridgeWADA": "0x9AA04C9Dd43F200Ae9bCC21dc3586078dF3b9E82",
        "PrivacyBridgegCoti": "0xaa0B57974106cA7A83b626497A3BEd207387e072",
        // Test-suite deployments (bug-regression suite uses this native bridge)
        "PrivacyBridgeCotiNative_Test": "0xBBBd1550dC18F2094626049135D53E61665EdCBe"
    };

    const pairs = [
        { name: "COTI", token: privateTokenAddresses.PrivateCOTI, bridge: bridgeAddresses.PrivacyBridgeCotiNative },
        { name: "WETH", token: privateTokenAddresses.PrivateWrappedEther, bridge: bridgeAddresses.PrivacyBridgeWETH },
        { name: "WBTC", token: privateTokenAddresses.PrivateWrappedBTC, bridge: bridgeAddresses.PrivacyBridgeWBTC },
        { name: "USDT", token: privateTokenAddresses.PrivateTetherUSD, bridge: bridgeAddresses.PrivacyBridgeUSDT },
        { name: "USDC_E", token: privateTokenAddresses.PrivateBridgedUSDC, bridge: bridgeAddresses.PrivacyBridgeUSDCe },
        { name: "WADA", token: privateTokenAddresses.PrivateWrappedADA, bridge: bridgeAddresses.PrivacyBridgeWADA },
        { name: "gCOTI", token: privateTokenAddresses.PrivateCOTITreasuryGovernanceToken, bridge: bridgeAddresses.PrivacyBridgegCoti },
        // Test-suite pair: grant MINTER_ROLE on test PrivateCOTI to test native bridge
        { name: "COTI_Test", token: privateTokenAddresses.PrivateCOTI_Test, bridge: bridgeAddresses.PrivacyBridgeCotiNative_Test }
    ];

    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const BURNER_ROLE = hre.ethers.id("BURNER_ROLE");

    for (const pair of pairs) {
        console.log(`\n--- Processing ${pair.name} ---`);
        const tokenContract = await hre.ethers.getContractAt("PrivateERC20", pair.token, deployer);

        const hasMinter = await tokenContract.hasRole(MINTER_ROLE, pair.bridge);
        if (!hasMinter) {
            console.log(`Granting MINTER_ROLE to ${pair.bridge}...`);
            const tx1 = await tokenContract.grantRole(MINTER_ROLE, pair.bridge, { gasLimit: 5000000 });
            await tx1.wait();
            console.log(`✅ MINTER_ROLE granted.`);
        } else {
            console.log(`   MINTER_ROLE already granted.`);
        }

        const hasBurner = await tokenContract.hasRole(BURNER_ROLE, pair.bridge);
        if (!hasBurner) {
            console.log(`Granting BURNER_ROLE to ${pair.bridge}...`);
            const tx2 = await tokenContract.grantRole(BURNER_ROLE, pair.bridge, { gasLimit: 5000000 });
            await tx2.wait();
            console.log(`✅ BURNER_ROLE granted.`);
        } else {
            console.log(`   BURNER_ROLE already granted.`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
