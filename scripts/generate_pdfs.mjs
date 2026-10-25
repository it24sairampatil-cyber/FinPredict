// FinPredict.js - Markdown to Publication-Grade PDF Generator
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const { chromium } = require('c:/Users/spwon/.agents/skills/playwright/node_modules/playwright');

const filesToConvert = [
  {
    input: path.resolve('documentation/Experiment_10_FinPredict.md'),
    output: path.resolve('documentation/Experiment_10_FinPredict.pdf'),
    title: 'Experiment No. 10 - FinPredict Mini Project',
    isAcademicReport: true
  },
  {
    input: path.resolve('documentation/FinPredict_Complex_Engineering_Problem_Report.md'),
    output: path.resolve('documentation/FinPredict_Complex_Engineering_Problem_Report.pdf'),
    title: 'FinPredict - Complex Engineering Problems Project Report',
    isAcademicReport: true
  },
  {
    input: path.resolve('FINPREDICT_MASTER_DOCUMENTATION.md'),
    output: path.resolve('FINPREDICT_MASTER_DOCUMENTATION.pdf'),
    title: 'FinPredict Master Technical Architecture & Guide',
    isAcademicReport: false
  },
  {
    input: path.resolve('DEPLOYMENT_MONGODB.md'),
    output: path.resolve('DEPLOYMENT_MONGODB.pdf'),
    title: 'FinPredict MongoDB Cloud Deployment Guide',
    isAcademicReport: false
  }
];

function buildAcademicTemplate(markdownContent, title) {
  const jsonContent = JSON.stringify(markdownContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <!-- GitHub Markdown CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown.min.css">
  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <!-- Marked, Mermaid, KaTeX -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>

  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      box-sizing: border-box;
      max-width: 900px;
      margin: 0 auto;
      padding: 5px 15px;
      font-family: "Times New Roman", Times, Georgia, serif !important;
      font-size: 11pt;
      line-height: 1.5;
      color: #000000 !important;
      background-color: #ffffff;
    }
    .markdown-body {
      font-family: "Times New Roman", Times, Georgia, serif !important;
      font-size: 11pt;
      color: #000000 !important;
    }
    /* TOTAL REMOVAL OF ALL BLUE HIGHLIGHTS AND HYPERLINKS */
    a, a:link, a:visited, a:hover, a:active, .markdown-body a {
      color: #000000 !important;
      text-decoration: none !important;
      font-weight: normal !important;
    }
    /* Neutral monochrome code blocks - no syntax highlight coloring */
    pre, code, .markdown-body pre, .markdown-body code {
      color: #000000 !important;
      font-family: Consolas, "Courier New", monospace !important;
      text-decoration: none !important;
    }
    pre {
      background-color: #f9fafb !important;
      border: 1px solid #d1d5db !important;
      border-radius: 4px !important;
      padding: 10px !important;
      font-size: 9.5pt !important;
      line-height: 1.4 !important;
    }
    code {
      background-color: #f3f4f6 !important;
      padding: 1px 4px !important;
      border-radius: 2px !important;
      font-size: 10pt !important;
    }
    hr {
      display: none !important;
    }
    /* Academic Headings without colored underline borders */
    h1, h2, h3, h4, h5, h6, .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
      border: none !important;
      border-bottom: none !important;
      color: #000000 !important;
      font-family: "Times New Roman", Times, serif !important;
      margin-top: 18px !important;
      margin-bottom: 6px !important;
      padding: 0 !important;
    }
    h1 {
      font-size: 14pt !important;
      font-weight: bold !important;
    }
    h2 {
      font-size: 13pt !important;
      font-weight: bold !important;
    }
    h3 {
      font-size: 11.5pt !important;
      font-weight: bold !important;
    }
    /* Complex Engineering title styling: exactly 16pt */
    .complex-engineering-title {
      font-size: 16pt !important;
      font-weight: bold !important;
      text-align: center !important;
      font-family: "Times New Roman", Times, serif !important;
      color: #000000 !important;
      margin-top: 25px !important;
      margin-bottom: 12px !important;
      text-transform: none !important;
    }
    .project-sub-title {
      font-size: 13.5pt !important;
      font-weight: bold !important;
      text-align: center !important;
      font-family: "Times New Roman", Times, serif !important;
      color: #000000 !important;
      margin-bottom: 25px !important;
      line-height: 1.35 !important;
    }
    /* Academic tables matching the reference */
    .markdown-body table {
      display: table !important;
      width: 100% !important;
      margin-top: 10px !important;
      margin-bottom: 14px !important;
      border-collapse: collapse !important;
      font-size: 10.5pt !important;
      font-family: "Times New Roman", Times, serif !important;
    }
    .markdown-body table th,
    .markdown-body table td {
      padding: 5px 8px !important;
      border: 1px solid #000000 !important;
      color: #000000 !important;
    }
    .markdown-body table th {
      background-color: #f3f4f6 !important;
      font-weight: bold !important;
      text-align: left !important;
    }
    .markdown-body table tr:nth-child(2n) {
      background-color: #ffffff !important;
    }
    /* Header info table override */
    table.header-info-table, table.header-info-table tr, table.header-info-table td {
      border: none !important;
      padding: 2px 0 !important;
      background: transparent !important;
      font-size: 11pt !important;
    }
    /* Mermaid diagram styling */
    .mermaid {
      background-color: #ffffff !important;
      border: 1px solid #d1d5db !important;
      border-radius: 4px !important;
      padding: 12px !important;
      margin: 14px 0 !important;
      display: flex !important;
      justify-content: center !important;
    }
  </style>
</head>
<body class="markdown-body">
  <div id="content"></div>

  <script>
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
    const rawMarkdown = ${jsonContent};

    const renderer = new marked.Renderer();
    const originalCode = renderer.code.bind(renderer);
    renderer.code = function(code, lang) {
      if (lang === 'mermaid') {
        return '<div class="mermaid">' + code + '</div>';
      }
      return originalCode(code, lang);
    };

    // Override link renderer to output plain black text without blue
    renderer.link = function(href, title, text) {
      return '<span style="color: #000000; text-decoration: none;">' + text + '</span>';
    };

    marked.setOptions({
      renderer: renderer
    });

    document.getElementById('content').innerHTML = marked.parse(rawMarkdown);

    // Render KaTeX math
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\\\(', right: '\\\\)', display: false },
          { left: '\\\\[', right: '\\\\]', display: true }
        ],
        throwOnError: false
      });
    }

    async function renderMermaid() {
      try {
        await mermaid.run();
      } catch (e) {
        console.warn('Mermaid rendering warning:', e);
      }
    }
    renderMermaid();
  </script>
</body>
</html>`;
}

function buildEnterpriseTemplate(markdownContent, title) {
  const jsonContent = JSON.stringify(markdownContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <!-- GitHub Markdown CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown.min.css">
  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <!-- Highlight.js CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css">
  <!-- Marked, Mermaid, KaTeX, Highlight.js -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>

  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #1f2328;
      background-color: #ffffff;
    }
    .markdown-body {
      font-size: 13px;
    }
    .markdown-body table {
      display: table;
      width: 100%;
      margin-bottom: 16px;
      border-collapse: collapse;
      font-size: 12px;
    }
    .markdown-body table th,
    .markdown-body table td {
      padding: 6px 12px;
      border: 1px solid #d0d7de;
    }
    .markdown-body table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
    .markdown-body pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 12px;
      font-size: 11px;
      line-height: 1.45;
    }
    .markdown-body code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    }
    .mermaid {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      display: flex;
      justify-content: center;
    }
    h1 {
      border-bottom: 2px solid #007a3d;
      padding-bottom: 8px;
      color: #0f172a;
    }
    h2 {
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      color: #1e293b;
      margin-top: 24px;
    }
    .pdf-header {
      border-bottom: 1px solid #d0d7de;
      padding-bottom: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .pdf-badge {
      background: #007a3d;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 10px;
    }
  </style>
</head>
<body class="markdown-body">
  <div class="pdf-header">
    <div><strong>FinPredict Institutional FP&amp;A</strong> &bull; Master Document</div>
    <div class="pdf-badge">Certified PDF Export</div>
  </div>
  <div id="content"></div>

  <script>
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
    const rawMarkdown = ${jsonContent};

    const renderer = new marked.Renderer();
    const originalCode = renderer.code.bind(renderer);
    renderer.code = function(code, lang) {
      if (lang === 'mermaid') {
        return '<div class="mermaid">' + code + '</div>';
      }
      return originalCode(code, lang);
    };

    marked.setOptions({
      renderer: renderer,
      highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    });

    document.getElementById('content').innerHTML = marked.parse(rawMarkdown);

    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\\\(', right: '\\\\)', display: false },
          { left: '\\\\[', right: '\\\\]', display: true }
        ],
        throwOnError: false
      });
    }

    async function renderMermaid() {
      try {
        await mermaid.run();
      } catch (e) {
        console.warn('Mermaid rendering warning:', e);
      }
    }
    renderMermaid();
  </script>
</body>
</html>`;
}

(async () => {
  console.log('📄 Launching Headless Chromium to generate publication-grade PDFs...');
  const browser = await chromium.launch({ headless: true });

  for (const item of filesToConvert) {
    if (!fs.existsSync(item.input)) {
      console.warn(`File not found: ${item.input}`);
      continue;
    }

    console.log(`⏳ Converting ${path.basename(item.input)} -> ${path.basename(item.output)}...`);
    const page = await browser.newPage();
    const markdownContent = fs.readFileSync(item.input, 'utf-8');
    const html = item.isAcademicReport
      ? buildAcademicTemplate(markdownContent, item.title)
      : buildEnterpriseTemplate(markdownContent, item.title);

    await page.setContent(html, { waitUntil: 'networkidle' });
    // Wait for Mermaid and KaTeX rendering to complete
    await page.waitForTimeout(3000);

    const pdfOptions = item.isAcademicReport
      ? {
          path: item.output,
          format: 'A4',
          margin: {
            top: '20mm',
            bottom: '20mm',
            left: '20mm',
            right: '20mm'
          },
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: '<div></div>',
          footerTemplate: `
            <div style="width: 100%; font-size: 11pt; text-align: center; font-family: 'Times New Roman', Times, serif; color: #000000;">
              <span class="pageNumber"></span>
            </div>
          `
        }
      : {
          path: item.output,
          format: 'A4',
          margin: {
            top: '15mm',
            bottom: '15mm',
            left: '12mm',
            right: '12mm'
          },
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: '<div></div>',
          footerTemplate: `
            <div style="width: 100%; font-size: 9px; padding: 0 15mm; color: #64748b; display: flex; justify-content: space-between; font-family: sans-serif;">
              <span>FinPredict &bull; Institutional FP&amp;A Platform</span>
              <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            </div>
          `
        };

    try {
      await page.pdf(pdfOptions);
      const stats = fs.statSync(item.output);
      console.log(`✅ Successfully generated: ${item.output} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        console.warn(`⚠️ Warning: ${path.basename(item.output)} is currently open in another program. Please close it to overwrite.`);
      } else {
        console.error(`❌ Error generating ${path.basename(item.output)}:`, err);
      }
    }
    await page.close();
  }

  await browser.close();
  console.log('🎉 All documents converted to PDF successfully!');
})();
