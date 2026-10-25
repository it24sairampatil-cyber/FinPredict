import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const { chromium } = require('c:/Users/spwon/.agents/skills/playwright/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 850, height: 1150 } });
  
  // We can load the exact template by extracting it from scripts/generate_pdfs.mjs
  const scriptContent = fs.readFileSync('scripts/generate_pdfs.mjs', 'utf-8');
  const md = fs.readFileSync('documentation/FinPredict_Complex_Engineering_Problem_Report.md', 'utf-8');
  
  // Create HTML using the academic styles
  const jsonContent = JSON.stringify(md);
  
  // Run generate_pdfs module directly by creating a runner
  // Or just load the html string
  const startIdx = scriptContent.indexOf('function buildAcademicTemplate');
  const endIdx = scriptContent.indexOf('function buildEnterpriseTemplate');
  const templateFnStr = scriptContent.substring(startIdx, endIdx);
  
  const fn = new Function('markdownContent', 'title', templateFnStr + '\nreturn buildAcademicTemplate(markdownContent, title);');
  const html = fn(md, 'FinPredict - Complex Engineering Problems');
  
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'documentation/page1_preview.png' });
  
  // Check any remaining blue elements
  const blueElements = await page.evaluate(() => {
    const results = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const style = window.getComputedStyle(el);
      const parseRgb = (str) => {
        const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null;
      };
      const c = parseRgb(style.color);
      const b = parseRgb(style.backgroundColor);
      if (c && c[2] > 140 && c[2] > c[0] + 40) {
        results.push({ tag: el.tagName, text: el.textContent.slice(0, 30), color: style.color });
      }
      if (b && b[2] > 140 && b[2] > b[0] + 40) {
        results.push({ tag: el.tagName, text: el.textContent.slice(0, 30), bg: style.backgroundColor });
      }
    }
    return results;
  });
  
  console.log('Blue elements count:', blueElements.length);
  if (blueElements.length > 0) {
    console.log('Found:', blueElements);
  }
  
  await browser.close();
})();
