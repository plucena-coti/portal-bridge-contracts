import { defineWalletSetup } from '@synthetixio/synpress';
import { MetaMask, getExtensionId } from '@synthetixio/synpress/playwright';

const WALLET_PASSWORD = "Tester@1234";

// Standard test seed phrase 
// Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
const SEED_PHRASE = "test test test test test test test test test test test junk";

export default defineWalletSetup(WALLET_PASSWORD, async (context, walletPage) => {
    const extensionId = await getExtensionId(context, 'MetaMask');
    const metamask = new MetaMask(context, walletPage, WALLET_PASSWORD, extensionId);

    // Import wallet with seed phrase
    await metamask.importWallet(SEED_PHRASE);

    // Note: COTI Testnet network will be added when connecting to the dApp
    // Network config:
    // - Name: COTI Testnet
    // - RPC URL: https://testnet.coti.io/rpc
    // - Chain ID: 7082400
    // - Symbol: COTI
    // - Block Explorer: https://testnet.cotiscan.io
});
