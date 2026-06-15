(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── DOM REFS ─── */
  const mdInput = $('#mdInput');
  const previewContent = $('#previewContent');
  const tChars = $('#tChars');
  const tWords = $('#tWords');
  const tParas = $('#tParas');
  const tReadTime = $('#tReadTime');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const btnHeading = $('#btnHeading');
  const btnBold = $('#btnBold');
  const btnCode = $('#btnCode');
  const exportSelect = $('#exportSelect');
  const btnExecute = $('#btnExecute');
  const btnInject = $('#btnInject');
  const btnFlush = $('#btnFlush');

  /* ─── REGEX MARKDOWN PARSER ─── */
  function parseMarkdown(text) {
    let html = escapeHTML(text);

    /* codeblocks (fenced) — before inline code to avoid conflicts */
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    /* headings */
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    /* horizontal rules */
    html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr>');

    /* blockquotes */
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

    /* inline code */
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    /* bold + italic */
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    /* images */
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');

    /* links */
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    /* unordered lists */
    html = html.replace(/^( *)[-*] (.*)$/gm, '$1<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)\n(<li>)/g, '$1\n$2');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    /* ordered lists */
    html = html.replace(/^( *)\d+\. (.*)$/gm, '$1<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)\n(<li>)/g, '$1\n$2');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ol>$1</ol>');

    /* paragraphs — wrap remaining lines */
    const lines = html.split('\n');
    let result = '';
    let inBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        if (!inBlock) result += '\n';
        continue;
      }

      /* skip if already wrapped in block elements */
      if (/^<(\/)?(h[1-5]|ul|ol|li|pre|blockquote|hr)/.test(trimmed)) {
        result += line + '\n';
        inBlock = false;
        continue;
      }

      /* wrap standalone text as <p> */
      if (/^<(?!\/?[h1-5ulolp])/.test(trimmed)) {
        result += line + '\n';
      } else {
        result += '<p>' + trimmed + '</p>\n';
      }
      inBlock = false;
    }

    return result.trim();
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── COMPILE + RENDER ─── */
  function compile() {
    const text = mdInput.value;
    try {
      const html = parseMarkdown(text);
      previewContent.innerHTML = html;
      updateTelemetry(text);
      tBadge.className = 'tele-badge active';
      tBadge.textContent = '[ PARSER STABILIZED: HTML GRAPH GENERATED ]';
      errorDetail.className = 'error-detail';
      errorDetail.textContent = '';
    } catch (e) {
      tBadge.className = 'tele-badge warn';
      tBadge.textContent = '[ PARSER ERROR: COMPILATION FAULT ]';
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = e.message;
    }
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry(text) {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const paras = text.split(/\n\s*\n/).filter(b => b.trim()).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    tChars.textContent = chars;
    tWords.textContent = words;
    tParas.textContent = paras;
    tReadTime.textContent = readTime + 's';
  }

  /* ─── INJECT TOKENS ─── */
  function injectAtCursor(text) {
    const start = mdInput.selectionStart;
    const end = mdInput.selectionEnd;
    const before = mdInput.value.substring(0, start);
    const after = mdInput.value.substring(end);
    mdInput.value = before + text + after;
    const cursorPos = start + text.length;
    mdInput.selectionStart = cursorPos;
    mdInput.selectionEnd = cursorPos;
    mdInput.focus();
    compile();
  }

  btnHeading.addEventListener('click', () => injectAtCursor('\n## Heading\n'));
  btnBold.addEventListener('click', () => injectAtCursor('**bold text**'));
  btnCode.addEventListener('click', () => injectAtCursor('\n```\n// code block\n```\n'));

  /* ─── EXPORT ─── */
  exportSelect.addEventListener('change', () => {
    const format = exportSelect.value;
    if (!format) return;

    const md = mdInput.value;
    let content, filename, mime;

    if (format === 'md') {
      content = md;
      filename = 'document.md';
      mime = 'text/markdown';
    } else {
      const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Exported</title><style>body{font-family:sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:2em;background:#fff;color:#222}code{background:#f0f0f0;padding:0.2em 0.4em}pre code{background:none;padding:0}blockquote{border-left:2px solid #ccc;padding-left:1em;color:#666}</style></head><body>' + parseMarkdown(md) + '</body></html>';
      content = html;
      filename = 'document.html';
      mime = 'text/html';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    exportSelect.value = '';
  });

  /* ─── INJECT BLUEPRINT ─── */
  const BLUEPRINT = '# Project Blueprint: Quantum Dash\n\n' +
    '## Overview\n\n' +
    'A **next-generation** analytics platform built with *scalable architecture*.\n\n' +
    '## System Architecture\n\n' +
    '### Frontend Stack\n' +
    '- **Framework:** React 18 with TypeScript\n' +
    '- **State:** Redux Toolkit + RTK Query\n' +
    '- **Styling:** Tailwind CSS v4\n\n' +
    '### Backend Stack\n' +
    '1. **API Gateway:** Express.js / Fastify\n' +
    '2. **Database:** PostgreSQL 16 + Redis 7\n' +
    '3. **Queue:** RabbitMQ / Bull MQ\n\n' +
    '## Key Features\n\n' +
    '> "Building for scale from day one."\n\n' +
    '### Real-time Analytics\n\n' +
    'The system processes **10k+ events/second** using a stream pipeline:\n\n' +
    '```javascript\n' +
    'const pipeline = new StreamPipeline({\n' +
    '  source: "kafka://events.prod",\n' +
    '  transforms: [filter, aggregate, enrich],\n' +
    '  sink: "clickhouse://analytics"\n' +
    '});\n' +
    '```\n\n' +
    '### Deployment\n\n' +
    'Deploy using `kubectl apply -f k8s/` — the cluster auto-scales based on `CPU` and `memory` metrics.\n\n' +
    '---\n\n' +
    '*Document generated on 2026-06-15*';

  function injectBlueprint() {
    mdInput.value = BLUEPRINT;
    compile();
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    mdInput.value = '';
    previewContent.innerHTML = '';
    tChars.textContent = '--';
    tWords.textContent = '--';
    tParas.textContent = '--';
    tReadTime.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
  }

  /* ─── EVENTS ─── */
  mdInput.addEventListener('input', compile);
  btnExecute.addEventListener('click', compile);
  btnInject.addEventListener('click', injectBlueprint);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    compile();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
