
const { decryptUint256 } = require('../../coti-sdk-typescript/dist/index.js');
const { ethers } = require('ethers');

async function main() {
    console.log("🚀 Manual Decryption Request");

    // User provided key
    const userKey = "86f6ca0fb3c6bba2c3eadae8d6b70cdd";
    console.log(`Key: ${userKey} (Length: ${userKey.length})`);

    // Data from previous logs
    const TOKENS = [
        {
            name: "p.WETH",
            decimals: 18,
            ct: {
                ciphertextHigh: 21568861806700197621133753031963052624031574334187190694706619784418084291769n,
                ciphertextLow: 108988554224738209935429202802648920570319031954687984956175383424143988463905n
            }
        },
        {
            name: "p.WBTC",
            decimals: 8,
            ct: {
                ciphertextHigh: 51575442077119658893928050413784184127065014487698056096274007242940976054920n,
                ciphertextLow: 22565847405573044153507476404983131300140785872512348246578912566488758216540n
            }
        },
        {
            name: "p.USDT",
            decimals: 6,
            ct: {
                ciphertextHigh: 102473052657065352297541133801805992273878914873042854204466240697724732208411n,
                ciphertextLow: 73390675884471334670646755531910375537472325776207262661934977256660900798076n
            }
        },
        {
            name: "p.USDC.e",
            decimals: 6,
            ct: {
                ciphertextHigh: 101111504016171422445308231012535516862565147365519274810450789599926410123615n,
                ciphertextLow: 101419830796430529386005355947358016638002946695335206311327926303769040248944n
            }
        }
    ];

    for (const token of TOKENS) {
        console.log(`\nDecrypting ${token.name}...`);
        try {
            const raw = decryptUint256(token.ct, userKey);
            console.log(`Raw BigInt: ${raw}`);

            // Format decimals manually or use ethers
            const formatted = ethers.formatUnits(raw, token.decimals);
            console.log(`✅ Decrypted Balance: ${formatted} ${token.name.replace('p.', '')}`);

        } catch (e) {
            console.log(`❌ Decryption Failed: ${e.message}`);
        }
    }
}

main();
