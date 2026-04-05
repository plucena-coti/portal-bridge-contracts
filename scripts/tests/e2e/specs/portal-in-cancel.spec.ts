import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// COTI Testnet Configuration
const COTI_TESTNET = {
    chainId: '0x6c11a0', // 7082400 in hex
    chainName: 'COTI Testnet',
    rpcUrls: ['https://testnet.coti.io/rpc'],
    nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
    blockExplorerUrls: ['https://testnet.cotiscan.io']
};

const WALLET_PASSWORD = 'Tester@1234';
const PORTAL_AMOUNT = '0.01';

console.log('🚀 Portal In test file loading...');

test.describe('Privacy Bridge - Portal In Transaction', () => {
    let context: BrowserContext;
    let page: Page;
    let extensionId: string;

    test.beforeAll(async () => {
        console.log('========================================');
        console.log('🔧 SETUP: Launching browser with MetaMask');
        console.log('========================================');

        const extensionPath = path.resolve('.cache-synpress/metamask-chrome-13.13.1');
        const userDataDir = path.resolve('.cache-synpress/ae3577adcb84cbd68a08');

        console.log('📁 Extension path:', extensionPath);
        console.log('📁 User data dir:', userDataDir);

        if (!fs.existsSync(path.join(extensionPath, 'manifest.json'))) {
            throw new Error('MetaMask extension not found at ' + extensionPath);
        }
        if (!fs.existsSync(userDataDir)) {
            throw new Error('Wallet cache not found at ' + userDataDir);
        }

        console.log('✅ Paths verified');
        console.log('🚀 Launching browser...');

        context = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            args: [
                '--disable-blink-features=AutomationControlled',
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
            ],
            viewport: { width: 1280, height: 720 },
        });

        console.log('✅ Browser launched');

        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('📄 Pages count:', context.pages().length);

        // Find MetaMask extension ID
        for (const p of context.pages()) {
            const url = p.url();
            console.log('  - Page URL:', url);
            if (url.includes('chrome-extension://')) {
                const match = url.match(/chrome-extension:\/\/([^/]+)/);
                if (match) {
                    extensionId = match[1];
                    console.log('🔑 Found extension ID:', extensionId);
                }
            }
        }

        if (!extensionId) {
            console.log('🔍 Extension ID not found in pages, trying to detect...');
            const detectPage = await context.newPage();
            await detectPage.goto('about:blank');
            await detectPage.waitForTimeout(2000);

            for (const p of context.pages()) {
                const url = p.url();
                if (url.includes('chrome-extension://')) {
                    const match = url.match(/chrome-extension:\/\/([^/]+)/);
                    if (match) {
                        extensionId = match[1];
                        console.log('🔑 Found extension ID:', extensionId);
                        break;
                    }
                }
            }

            if (!extensionId) {
                extensionId = 'nkbihfbeogaeaoehlefnkodbefgpgknn';
                console.log('⚠️ Using fallback extension ID:', extensionId);
            }

            await detectPage.close();
        }

        page = await context.newPage();
        console.log('✅ New page created');
        console.log('🔑 Final extension ID:', extensionId);
    });

    test.afterAll(async () => {
        console.log('🧹 Cleaning up...');
        if (context) {
            await context.close();
        }
        console.log('✅ Browser closed');
    });

    test('should handle Portal In cancellation correctly', async () => {
        console.log('');
        console.log('========================================');
        console.log('🎬 PORTAL IN TEST STARTED');
        console.log('========================================');

        // Helper function to unlock MetaMask
        const unlockMetaMask = async () => {
            console.log('🔓 Setting up MetaMask...');

            // Find existing MetaMask extension page instead of creating a new one
            let mmPage: Page | null = null;
            for (const p of context.pages()) {
                const url = p.url();
                if (url.includes('chrome-extension://') && url.includes('/home.html')) {
                    mmPage = p;
                    extensionId = url.split('/')[2];
                    console.log(`  → Found MetaMask page: ${url}`);
                    break;
                }
            }

            // If not found, create one (first run)
            if (!mmPage) {
                console.log('  → Creating new MetaMask page...');
                mmPage = await context.newPage();
                await mmPage.waitForTimeout(1000);

                // Try to find extension ID from any extension page
                for (const p of context.pages()) {
                    const url = p.url();
                    if (url.includes('chrome-extension://')) {
                        extensionId = url.split('/')[2];
                        break;
                    }
                }

                if (!extensionId) {
                    throw new Error('Could not find MetaMask extension ID');
                }

                await mmPage.goto(`chrome-extension://${extensionId}/home.html`);
            }

            await mmPage.bringToFront();
            await mmPage.waitForLoadState('domcontentloaded');
            await mmPage.waitForTimeout(2000);

            let currentUrl = mmPage.url();
            console.log(`  → Current state: ${currentUrl}`);

            // Check if already unlocked - look for the account menu button
            const isAlreadyUnlocked = await mmPage.locator('[data-testid="account-options-menu-button"]')
                .isVisible({ timeout: 3000 })
                .catch(() => false);

            if (isAlreadyUnlocked) {
                console.log('  ✅ MetaMask already unlocked');
                return mmPage;
            }

            // Check for unlock screen
            const unlockInput = mmPage.getByTestId('unlock-password');
            const isLocked = await unlockInput.isVisible({ timeout: 2000 }).catch(() => false);

            if (isLocked) {
                console.log('  🔑 Unlocking...');

                // Fill password
                await unlockInput.fill(WALLET_PASSWORD);
                console.log('  → Password filled');

                // Wait a moment for the form to update
                await mmPage.waitForTimeout(500);

                const unlockBtn = mmPage.getByTestId('unlock-submit');

                // Wait for button to be clickable/enabled
                console.log('  → Waiting for unlock button to be enabled...');
                await expect(unlockBtn).toBeEnabled({ timeout: 5000 });
                console.log('  → Unlock button is enabled');

                // Click the button (no force, let Playwright wait for it)
                await unlockBtn.click();
                console.log('  → Clicked unlock button');

                // Wait longer for unlock to complete
                await mmPage.waitForTimeout(5000);

                // Verify we're no longer on unlock screen by checking for account menu
                const unlocked = await mmPage.locator('[data-testid="account-options-menu-button"]')
                    .isVisible({ timeout: 5000 })
                    .catch(() => false);

                if (!unlocked) {
                    // Double check if still locked
                    const stillLocked = await unlockInput.isVisible({ timeout: 2000 }).catch(() => false);
                    if (stillLocked) {
                        console.log('  ❌ Still showing unlock screen');
                        throw new Error('Failed to unlock MetaMask - still on unlock screen');
                    }
                }

                console.log('  ✅ Unlocked successfully');
            }

            console.log('  ✅ MetaMask setup complete');
            return mmPage;
        };

        // Helper to handle MetaMask popups
        const handleNotificationPopup = async (action: string, maxAttempts = 15) => {
            console.log(`🔍 Looking for notification popup (${action})...`);

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                await page.waitForTimeout(1500);

                const pages = context.pages();
                console.log(`  → Attempt ${attempt + 1}: Found ${pages.length} pages`);

                for (const p of pages) {
                    const url = p.url();

                    if (url.includes('localhost:8080') || url === 'about:blank') continue;

                    if (url.includes('home.html') && !url.includes('notification')) continue;

                    if (url.includes('notification.html') || url.includes('chrome-extension://')) {
                        console.log(`  📦 Found popup: ${url}`);
                        try {
                            await p.bringToFront();
                            await p.waitForLoadState('domcontentloaded');
                            await p.waitForTimeout(1000);

                            // Check for unlock screen
                            const hasUnlock = await p.getByTestId('unlock-password').isVisible({ timeout: 500 }).catch(() => false);
                            if (hasUnlock) {
                                console.log('  🔑 Unlocking in popup...');
                                await p.getByTestId('unlock-password').fill(WALLET_PASSWORD);
                                await p.getByTestId('unlock-submit').click();
                                await p.waitForTimeout(2000);
                                continue;
                            }

                            // Try different button types
                            const confirmBtn = p.getByTestId('page-container-footer-next');
                            const submitBtn = p.getByTestId('confirmation-submit-button');

                            if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                                console.log(`  ✅ ${action}: Clicking confirm button`);
                                await confirmBtn.click();
                                await p.waitForTimeout(1500);

                                // Check for second button
                                if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                                    console.log(`  ✅ ${action}: Clicking second confirm`);
                                    await confirmBtn.click();
                                    await p.waitForTimeout(1000);
                                }
                                return true;
                            }

                            if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                                const btnText = await submitBtn.innerText().catch(() => 'Submit');
                                console.log(`  ✅ ${action}: Clicking "${btnText}"`);
                                await submitBtn.click();
                                await p.waitForTimeout(1000);
                                return true;
                            }

                        } catch (e: any) {
                            console.log(`  ⚠️ Popup handling: ${e.message?.split('\n')[0]}`);
                        }
                    }
                }
            }
            console.log(`  ❌ No popup found for ${action}`);
            return false;
        };

        try {
            // Step 1: Unlock MetaMask
            console.log('');
            console.log('📍 STEP 1: Unlock MetaMask');
            const mmPage = await unlockMetaMask();

            // Step 2: Navigate to dApp
            console.log('');
            console.log('📍 STEP 2: Navigate to dApp');
            await page.bringToFront();
            await page.goto('http://localhost:8080');
            await page.waitForLoadState('networkidle');
            console.log('✅ dApp loaded');

            await page.waitForTimeout(2000);

            // Step 3: Connect wallet if needed
            console.log('');
            console.log('📍 STEP 3: Connect Wallet');

            let walletAddress = await page.evaluate(async () => {
                const eth = (window as any).ethereum;
                if (!eth) return null;
                try {
                    const accounts = await eth.request({ method: 'eth_accounts' });
                    return accounts[0] || null;
                } catch { return null; }
            });

            if (!walletAddress) {
                const connectButton = page.getByRole('button', { name: /connect wallet/i });
                if (await connectButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await connectButton.click();
                    console.log('  → Clicked connect button');
                    await handleNotificationPopup('connect');
                    await page.bringToFront();
                    await page.waitForTimeout(2000);
                }
            } else {
                console.log('  ✅ Already connected:', walletAddress);
            }

            // Step 4: Switch to COTI Testnet if needed
            console.log('');
            console.log('📍 STEP 4: Ensure COTI Testnet');

            const currentChainId = await page.evaluate(async () => {
                const eth = (window as any).ethereum;
                if (!eth) return null;
                try {
                    return await eth.request({ method: 'eth_chainId' });
                } catch { return null; }
            });

            if (currentChainId !== COTI_TESTNET.chainId) {
                console.log('  → Switching to COTI Testnet...');
                await page.evaluate(async (network) => {
                    const eth = (window as any).ethereum;
                    if (!eth) return;
                    try {
                        await eth.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: network.chainId }],
                        });
                    } catch (err: any) {
                        if (err.code === 4902) {
                            await eth.request({
                                method: 'wallet_addEthereumChain',
                                params: [network],
                            });
                        }
                    }
                }, COTI_TESTNET);

                await handleNotificationPopup('network');
            } else {
                console.log('  ✅ Already on COTI Testnet');
            }

            await page.bringToFront();
            await page.waitForTimeout(2000);

            // Step 5: Click on COTI token to open Portal modal
            console.log('');
            console.log('📍 STEP 5: Open Portal Modal');

            const publicTokensSection = page.locator('section[aria-labelledby="public-tokens-heading"]');
            await expect(publicTokensSection).toBeVisible({ timeout: 15000 });

            const cotiButton = publicTokensSection.getByLabel(/^Select COTI token with balance/);
            await expect(cotiButton).toBeVisible({ timeout: 15000 });
            console.log('  → Found COTI token button');

            await cotiButton.click();
            console.log('  → Clicked COTI token');
            await page.waitForTimeout(1000);

            // Verify modal opened by checking for "Portal in" heading
            const modalHeading = page.locator('h2:has-text("Portal in")');
            await expect(modalHeading).toBeVisible({ timeout: 10000 });
            console.log('  ✅ Portal modal opened');

            // Step 6: Enter amount
            console.log('');
            console.log('📍 STEP 6: Enter Amount');

            const amountInput = page.locator('input[placeholder="0.00"]');
            await expect(amountInput).toBeVisible({ timeout: 5000 });
            console.log('  → Input field is visible');

            // Wait for modal animation to complete
            await page.waitForTimeout(1000);

            // Triple click to select all, then type
            await amountInput.click({ clickCount: 3 });
            await page.waitForTimeout(300);
            await page.keyboard.type(PORTAL_AMOUNT);
            console.log(`  ✅ Entered amount: ${PORTAL_AMOUNT}`);

            // Verify the value was entered
            const inputValue = await amountInput.inputValue();
            console.log(`  → Input value: ${inputValue}`);

            await page.waitForTimeout(500);

            // Step 7: Click Portal In button
            console.log('');
            console.log('📍 STEP 7: Click Portal In');

            // Wait a bit for button state to update based on amount
            await page.waitForTimeout(1000);

            const portalInButton = page.getByRole('button', { name: /portal in/i });
            await expect(portalInButton).toBeVisible({ timeout: 5000 });
            console.log('  → Portal In button is visible');

            // Wait for button to be enabled
            await expect(portalInButton).toBeEnabled({ timeout: 10000 });
            console.log('  → Portal In button is enabled');

            // Get button text to confirm we're clicking the right button
            const buttonText = await portalInButton.innerText();
            console.log(`  → Button text: "${buttonText}"`);

            await portalInButton.click();
            console.log('  ✅ Clicked Portal In button');

            // Step 8: Handle "Unlock Security Key" popup and click Reject
            console.log('');
            console.log('📍 STEP 8: Handle Security Key Popup');

            // Wait for MetaMask popup to appear
            await page.waitForTimeout(2000);

            let securityKeyHandled = false;
            for (let attempt = 0; attempt < 20 && !securityKeyHandled; attempt++) {
                await page.waitForTimeout(1500);

                const pages = context.pages();
                console.log(`  → Attempt ${attempt + 1}: Found ${pages.length} pages`);

                for (const p of pages) {
                    const url = p.url();

                    // Skip main page and non-notification pages
                    if (url.includes('localhost:8080') || url === 'about:blank') continue;
                    if (url.includes('home.html') && !url.includes('notification')) continue;

                    if (url.includes('notification.html') || url.includes('chrome-extension://')) {
                        console.log(`  📦 Found popup: ${url}`);
                        try {
                            await p.bringToFront();
                            await p.waitForLoadState('domcontentloaded');
                            await p.waitForTimeout(1000);

                            // Check if popup is asking to unlock first
                            const unlockInput = p.getByTestId('unlock-password');
                            if (await unlockInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                                console.log('  🔑 Popup needs unlock, entering password...');
                                await unlockInput.fill(WALLET_PASSWORD);
                                await p.waitForTimeout(500);

                                const unlockBtn = p.getByTestId('unlock-submit');
                                await expect(unlockBtn).toBeEnabled({ timeout: 3000 });
                                await unlockBtn.click();
                                console.log('  → Unlocked popup');
                                await p.waitForTimeout(2000);
                                // Continue with this iteration to handle the next screen
                            }

                            // Look for Reject button (or Cancel button)
                            const rejectBtn = p.getByRole('button', { name: /reject/i });
                            const cancelBtn = p.getByRole('button', { name: /cancel/i });

                            if (await rejectBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                                console.log('  ✅ Clicking Reject button');
                                await rejectBtn.click();
                                await p.waitForTimeout(1000);
                                securityKeyHandled = true;
                                break;
                            } else if (await cancelBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                                console.log('  ✅ Clicking Cancel button');
                                await cancelBtn.click();
                                await p.waitForTimeout(1000);
                                securityKeyHandled = true;
                                break;
                            }

                            // Also try data-testid for footer cancel/reject
                            const footerCancel = p.getByTestId('page-container-footer-cancel');
                            if (await footerCancel.isVisible({ timeout: 1000 }).catch(() => false)) {
                                console.log('  ✅ Clicking footer cancel button');
                                await footerCancel.click();
                                await p.waitForTimeout(1000);
                                securityKeyHandled = true;
                                break;
                            }

                        } catch (e: any) {
                            console.log(`  ⚠️ Popup error: ${e.message?.split('\n')[0]}`);
                        }
                    }
                }
            }

            if (!securityKeyHandled) {
                console.log('  ⚠️ Security key popup not found, continuing anyway...');
            } else {
                console.log('  ✅ Security key popup handled (Rejected)');
            }

            await page.bringToFront();
            await page.waitForTimeout(2000);

            // Step 9: Verify Error Message
            console.log('');
            console.log('📍 STEP 9: Verify Error Message');
            console.log('  → Waiting for Transaction Failed message...');

            // Look for "Transaction Failed" heading in the transaction modal
            const failedHeading = page.locator('h3:has-text("Transaction Failed")');
            await expect(failedHeading).toBeVisible({ timeout: 60000 });

            const headingText = await failedHeading.innerText();
            console.log('  📊 Error heading:', headingText);

            // Verify specific or generic error message
            const errorMessage = page.locator('text=/Something went wrong/i').first();
            await expect(errorMessage).toBeVisible({ timeout: 5000 });
            const errorText = await errorMessage.innerText();
            console.log('  📊 Error details:', errorText);

            console.log('');
            console.log('========================================');
            console.log('✅ SUCCESS: Cancellation properly handled!');
            console.log('========================================');

            // Cleanup
            if (!mmPage.isClosed()) {
                await mmPage.close();
            }

        } catch (error) {
            console.error('');
            console.error('========================================');
            console.error('❌ PORTAL IN TEST FAILED');
            console.error('========================================');
            console.error(error);
            throw error;
        }
    });
});
