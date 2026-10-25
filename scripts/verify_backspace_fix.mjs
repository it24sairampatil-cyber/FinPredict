import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('c:/Users/spwon/.agents/skills/playwright/node_modules/playwright');

(async () => {
  console.log('Testing backspace input behavior on Simplex & User Home inputs...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  // If on login page, click "Continue as Standard User"
  const quickUserBtn = page.locator('button:has-text("Continue as Standard User")');
  if (await quickUserBtn.count() > 0) {
    await quickUserBtn.click();
    await page.waitForTimeout(1000);
  }

  // 1. Test Simplex Planner Input
  console.log('1. Navigating to Simplex Planner...');
  await page.click('button:has-text("Simplex Planner")');
  await page.waitForTimeout(1000);

  // Find the Estimated Monthly Net Inflow input
  const inflowInput = page.locator('label:has-text("Estimated Monthly Net Inflow") + div input');
  await inflowInput.waitFor();

  console.log('Initial inflow value:', await inflowInput.inputValue());

  // Focus and press Backspace repeatedly to clear it completely
  await inflowInput.focus();
  await inflowInput.selectText();
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);

  const valueAfterBackspace = await inflowInput.inputValue();
  console.log('Value after Backspace:', JSON.stringify(valueAfterBackspace));

  if (valueAfterBackspace === '') {
    console.log('✅ SUCCESS: Inflow input is completely erased (no stubborn zero)!');
  } else {
    console.error('❌ FAILURE: Inflow input still has:', valueAfterBackspace);
  }

  // Type new value
  await inflowInput.type('50000');
  await page.waitForTimeout(300);
  console.log('Value after typing 50000:', await inflowInput.inputValue());

  // Backspace each char one by one
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Backspace');
  }
  const clearedValue = await inflowInput.inputValue();
  console.log('Value after backspacing all 5 digits:', JSON.stringify(clearedValue));

  if (clearedValue === '') {
    console.log('✅ SUCCESS: Backspacing each digit completely clears the input!');
  } else {
    console.error('❌ FAILURE: Cleared value is:', clearedValue);
  }

  // 2. Test User Home Page Salary Input
  console.log('2. Navigating to Home Page...');
  await page.click('button:has-text("Home")');
  await page.waitForTimeout(1000);

  const salaryInput = page.locator('input[placeholder="0"]').first();
  await salaryInput.focus();
  await salaryInput.selectText();
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);

  const salaryAfterBackspace = await salaryInput.inputValue();
  console.log('Salary value after Backspace:', JSON.stringify(salaryAfterBackspace));

  if (salaryAfterBackspace === '') {
    console.log('✅ SUCCESS: Salary input is completely erased (no stubborn zero)!');
  } else {
    console.error('❌ FAILURE: Salary input still has:', salaryAfterBackspace);
  }

  await browser.close();
  console.log('Verification finished successfully!');
})();
