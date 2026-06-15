(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const jsonInput = $('#jsonInput');
  const outputContainer = $('#outputContainer');
  const tState = $('#tState');
  const tBytes = $('#tBytes');
  const tKeys = $('#tKeys');
  const tDepth = $('#tDepth');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const btnBeautify2 = $('#btnBeautify2');
  const btnBeautify4 = $('#btnBeautify4');
  const btnMinify = $('#btnMinify');
  const btnCopy = $('#btnCopy');
  const btnValidate = $('#btnValidate');
  const btnInject = $('#btnInject');
  const btnFlush = $('#btnFlush');

  /* ─── BROKEN DATA TEMPLATE ─── */
  const BROKEN = '{\n  "name": "Mission Control",\n  "version": "2.0",\n  "modules": [\n    { "id": "propellant", "status": "nominal" },\n    { "id": "thermal", "status": "nominal" }\n  ],\n  "metadata": {\n    "author": "Girish",\n    "year": 2026,\n    "tags": ["space", "telemetry", "json"]\n  },\n  "broken": true,\n  // missing comma\n  "extra": "oops"\n}';

  /* ─── PARSE ─── */
  function parseJSON(text) {
    try {
      const parsed = JSON.parse(text);
      return { valid: true, data: parsed, error: null };
    } catch (e) {
      let msg = e.message;
      /* extract position info */
      const posMatch = msg.match(/position\s+(\d+)/);
      const lineMatch = msg.match(/line\s+(\d+)/);
      const colMatch = msg.match(/column\s+(\d+)/);

      let position = posMatch ? parseInt(posMatch[1]) : -1;
      let line = lineMatch ? parseInt(lineMatch[1]) : -1;
      let column = colMatch ? parseInt(colMatch[1]) : -1;

      /* try to get context */
      let context = '';
      if (position >= 0 && position < text.length) {
        const snippet = text.slice(Math.max(0, position - 5), position + 10);
        context = ' near "' + snippet.replace(/\n/g, '\\n') + '"';
      }

      return { valid: false, data: null, error: { msg, position, line, column, context } };
    }
  }

  /* ─── TELEMETRY COMPUTATION ─── */
  function countKeys(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    let count = 0;
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        count++;
        count += countKeys(obj[k]);
      }
    }
    return count;
  }

  function maxDepth(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    let depth = 0;
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        depth = Math.max(depth, maxDepth(obj[k]));
      }
    }
    return depth + 1;
  }

  /* ─── SYNTAX HIGHLIGHT ─── */
  function highlightJSON(obj, indent, level) {
    level = level || 0;
    indent = indent || '  ';
    const pad = indent.repeat(level);

    if (obj === null) return '<span class="null">null</span>';
    if (typeof obj === 'string') return '<span class="str">"' + escapeHTML(obj) + '"</span>';
    if (typeof obj === 'number') return '<span class="num">' + obj + '</span>';
    if (typeof obj === 'boolean') return '<span class="bool">' + obj + '</span>';

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '<span class="bracket">[]</span>';
      let html = '<span class="bracket">[</span>\n';
      obj.forEach((item, i) => {
        html += pad + indent + highlightJSON(item, indent, level + 1);
        if (i < obj.length - 1) html += '<span class="bracket">,</span>';
        html += '\n';
      });
      html += pad + '<span class="bracket">]</span>';
      return html;
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return '<span class="bracket">{}</span>';
    let html = '<span class="bracket">{</span>\n';
    keys.forEach((k, i) => {
      html += pad + indent + '<span class="key">"' + escapeHTML(k) + '"</span><span class="bracket">:</span> ';
      html += highlightJSON(obj[k], indent, level + 1);
      if (i < keys.length - 1) html += '<span class="bracket">,</span>';
      html += '\n';
    });
    html += pad + '<span class="bracket">}</span>';
    return html;
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── FORMAT ─── */
  function formatJSON(text, indentSize) {
    const result = parseJSON(text);
    if (!result.valid) return { error: result.error };

    const indent = ' '.repeat(indentSize);
    const html = highlightJSON(result.data, indent);
    return { html, keys: countKeys(result.data), depth: maxDepth(result.data), bytes: new TextEncoder().encode(text).length };
  }

  /* ─── VALIDATE ─── */
  function validate() {
    const text = jsonInput.value;
    const result = parseJSON(text);
    const bytes = new TextEncoder().encode(text).length;
    tBytes.textContent = bytes + ' B';

    if (result.valid) {
      tState.textContent = 'VALID';
      tState.style.color = '#00e676';
      tBadge.className = 'tele-badge valid';
      tBadge.textContent = '[ SYNTAX VALID: ABSTRACT TREE STABILIZED ]';
      errorDetail.className = 'error-detail';
      errorDetail.textContent = '';
      tKeys.textContent = countKeys(result.data);
      tDepth.textContent = maxDepth(result.data);
    } else {
      tState.textContent = 'ERROR';
      tState.style.color = '#ff1744';
      tBadge.className = 'tele-badge invalid';
      tBadge.textContent = 'SYNTAX ERROR — COMPILATION FAILED';
      tKeys.textContent = '--';
      tDepth.textContent = '--';

      const e = result.error;
      let detail = e.msg;
      if (e.line > 0) detail += ' | Line: ' + e.line;
      if (e.column > 0) detail += ' Col: ' + e.column;
      if (e.context) detail += e.context;
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = detail;
    }
  }

  /* ─── RENDER OUTPUT ─── */
  function renderOutput(res) {
    if (res.error) {
      outputContainer.innerHTML = '<div class="output-line err">' + escapeHTML(res.error.msg) + '</div>';
      validate();
      return;
    }
    outputContainer.innerHTML = '<div class="output-line">' + res.html + '</div>';
    validate();
  }

  /* ─── BEAUTIFY ─── */
  function beautify(spaces) {
    const text = jsonInput.value;
    const res = formatJSON(text, spaces);
    if (res.error) { renderOutput(res); return; }
    /* reformat input */
    jsonInput.value = JSON.stringify(JSON.parse(text), null, spaces);
    renderOutput(formatJSON(jsonInput.value, spaces));
  }

  /* ─── MINIFY ─── */
  function minify() {
    const text = jsonInput.value;
    const result = parseJSON(text);
    if (!result.valid) { renderOutput(result); return; }
    const min = JSON.stringify(result.data);
    jsonInput.value = min;
    const formatted = formatJSON(min, 2);
    renderOutput(formatted);
  }

  /* ─── COPY ─── */
  function copy() {
    const text = jsonInput.value;
    navigator.clipboard.writeText(text).then(() => {
      /* visual feedback */
    }).catch(() => {});
  }

  /* ─── INJECT BROKEN ─── */
  function injectBroken() {
    jsonInput.value = BROKEN;
    const result = parseJSON(BROKEN);
    renderOutput(result);
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    jsonInput.value = '{\n  "status": "standby"\n}';
    outputContainer.innerHTML = '<div class="output-empty">PROCESS INPUT TO GENERATE OUTPUT</div>';
    tState.textContent = '--'; tState.style.color = '';
    tBytes.textContent = '--';
    tKeys.textContent = '--';
    tDepth.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
  }

  /* ─── UI EVENTS ─── */
  btnBeautify2.addEventListener('click', () => beautify(2));
  btnBeautify4.addEventListener('click', () => beautify(4));
  btnMinify.addEventListener('click', minify);
  btnCopy.addEventListener('click', copy);
  btnValidate.addEventListener('click', () => {
    const text = jsonInput.value;
    const result = parseJSON(text);
    renderOutput(formatJSON(text, 2));
  });
  btnInject.addEventListener('click', injectBroken);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    /* auto-validate initial content */
    const text = jsonInput.value;
    const res = formatJSON(text, 2);
    if (!res.error) renderOutput(res);
    else validate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
