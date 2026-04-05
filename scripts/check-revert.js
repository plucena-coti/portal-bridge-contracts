const ethers = require('ethers');

async function checkTx() {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const txHash = '0xeaac176c04a167e57b53b86853e58f334a7bdd3d2c1325a05e2c1b8eeb5e4493';
    
    try {
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);
        
        console.log('Transaction:', tx);
        console.log('\nReceipt:', receipt);
        
        // Try to get revert reason
        try {
            await provider.call(tx, tx.blockNumber);
        } catch (error) {
            console.log('\nRevert reason:', error.message);
            if (error.data) {
                console.log('Error data:', error.data);
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTx();
