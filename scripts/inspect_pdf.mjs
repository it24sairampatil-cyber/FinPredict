import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const { chromium } = require('c:/Users/spwon/.agents/skills/playwright/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  
  // Read generate_pdfs.mjs and extract buildHtmlTemplate
  const content = fs.readFileSync('documentation/FinPredict_Complex_Engineering_Problem_Report.md', 'utf-8');
  
  // Import generate_pdfs logic or recreate HTML
  const jsonContent = JSON.stringify(content);
  const html = `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
  <style>
    body { padding: 40px; font-family: sans-serif; background: white; color: #1f2328; }
  </style>
</head>
<body class="markdown-body">
  <div id="content"></div>
  <script>
    document.getElementById('content').innerHTML = marked.parse(${jsonContent});
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  </script>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'documentation/preview_full.png', fullPage: true });

  // Find all elements with blue color or background
  const blueElements = await page.evaluate(() => {
    const results = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bg = style.backgroundColor;
      // check if bluish (high blue component, lower red/green)
      const parseRgb = (str) => {
        const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null;
      };
      const c = parseRgb(color);
      const b = parseRgb(bg);
      if (c && c[2] > 140 && c[2] > c[0] + 40) {
        results.push({ tag: el.tagName, text: el.textContent.slice(0, 50), color: color, role: 'color' });
      }
      if (b && b[2] > 140 && b[2] > b[0] + 40) {
        results.push({ tag: el.tagName, text: el.textContent.slice(0, 50), bg: bg, role: 'bg' });
      }
    }
    return results;
  });

  console.log('Blue elements found:', JSON.stringify(blueElements.slice(0, 20), null, 2));

  await browser.close();
})();
