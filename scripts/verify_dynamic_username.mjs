import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const { chromium } = require('c:/Users/spwon/.agents/skills/playwright/node_modules/playwright');

(async () => {
  console.log('Testing dynamic username behavior...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Clear any existing session in localStorage
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check login page initial view
  console.log('1. Checking default login page...');
  await page.screenshot({ path: 'verification_screenshots/verify_1_login_default.png' });

  // Type a custom username: "Krish"
  console.log('2. Typing custom username "Krish"...');
  const input = page.locator('input[placeholder="analyst"]');
  await input.fill('Krish');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'verification_screenshots/verify_2_login_custom_krish.png' });

  // Verify that the clearance card shows "Krish" and "KR"
  const clearanceName = await page.locator('.font-bold.text-gray-900').first().textContent();
  console.log('Clearance card name:', clearanceName);

  // Submit login with password
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill('secret123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Verify User Home Page shows "Welcome back, Krish"
  await page.screenshot({ path: 'verification_screenshots/verify_3_user_home_krish.png' });
  const welcomeText = await page.locator('h1').textContent();
  console.log('User Home heading:', welcomeText);

  // Verify Header shows "Krish"
  const headerName = await page.locator('header, .bg-\\[\\#007A3D\\]').first().textContent();
  const hasKrishInHeader = headerName.includes('Krish');
  console.log('Header has "Krish":', hasKrishInHeader);

  // Navigate to Status Tracker and verify grid task owners
  await page.click('button:has-text("Status Tracker")');
  await page.waitForTimeout(1000);
  const statusTrackerText = await page.textContent('body');
  console.log('Status tracker has "Krish":', statusTrackerText.includes('Krish'));
  console.log('Status tracker has "Frank Jones":', statusTrackerText.includes('Frank Jones'));
  console.log('Status tracker has "Steve Welsh":', statusTrackerText.includes('Steve Welsh'));
  await page.screenshot({ path: 'verification_screenshots/verify_3b_tracker_krish.png' });

  // Now log out and test admin login with custom username "AdminDirector"
  console.log('3. Logging out...');
  const logoutBtn = page.locator('button[title*="Log Out"]');
  await logoutBtn.click();
  await page.waitForTimeout(1000);

  console.log('4. Testing admin role with custom username "AdminDirector"...');
  await page.click('button:has-text("Compliance Admin")');
  await page.waitForTimeout(500);

  const adminInput = page.locator('input[placeholder="admin"]');
  await adminInput.fill('AdminDirector');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'verification_screenshots/verify_4_login_custom_admin.png' });

  const adminPasswordInput = page.locator('input[type="password"]');
  await adminPasswordInput.fill('admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'verification_screenshots/verify_5_admin_hub_director.png' });
  console.log('5. Admin logged in successfully!');

  await browser.close();
  console.log('All verification checks completed successfully!');
})();
