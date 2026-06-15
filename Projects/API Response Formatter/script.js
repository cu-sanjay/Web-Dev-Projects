(function () {
  'use strict';

  /* ─── DOM REFS ─── */
  const inputArea = document.getElementById('inputArea');
  const viewport = document.getElementById('viewportContent');
  const formatBtns = document.querySelectorAll('.format-btn');
  const btnBeautify = document.getElementById('btnBeautify');
  const btnMinify = document.getElementById('btnMinify');
  const btnExpand = document.getElementById('btnExpand');
  const btnCollapse = document.getElementById('btnCollapse');
  const btnCopy = document.getElementById('btnCopy');
  const btnExecute = document.getElementById('btnExecute');
  const btnInject = document.getElementById('btnInject');
  const btnFlush = document.getElementById('btnFlush');
  const tType = document.getElementById('tType');
  const tBytes = document.getElementById('tBytes');
  const tKeys = document.getElementById('tKeys');
  const tDepth = document.getElementById('tDepth');
  const tBadge = document.getElementById('tBadge');

  /* ─── STATE ─── */
  let activeFormat = 'json';
  let parsedData = null;
  let rawInput = '';

  /* ─── FORMAT TOGGLE ─── */
  formatBtns.forEach(b => {
    b.addEventListener('click', function () {
      formatBtns.forEach(x => x.classList.remove('active'));
      this.classList.add('active');
      activeFormat = this.dataset.format;
    });
  });

  /* ─── PARSERS ─── */
  function parseJSON(str) {
    try {
      const data = JSON.parse(str);
      return { success: true, data, error: null };
    } catch (e) {
      return { success: false, data: null, error: e.message };
    }
  }

  function parseXML(str) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, 'text/xml');
      const parseErr = doc.querySelector('parsererror');
      if (parseErr) {
        return { success: false, data: null, error: parseErr.textContent };
      }
      return { success: true, data: doc, error: null };
    } catch (e) {
      return { success: false, data: null, error: e.message };
    }
  }

  function executeParse() {
    rawInput = inputArea.value;
    const fmt = activeFormat;
    let result;
    if (fmt === 'json') {
      result = parseJSON(rawInput);
    } else {
      result = parseXML(rawInput);
    }

    if (!rawInput.trim()) {
      viewport.innerHTML = '<div class="viewport-placeholder">INPUT BUFFER EMPTY — SUPPLY A PAYLOAD</div>';
      setBadge('standby', 'STANDBY');
      updateTelemetry({ bytes: 0, keyCount: 0, maxDepth: 0, type: fmt.toUpperCase() });
      return;
    }

    if (!result.success) {
      viewport.innerHTML = '<div class="tree-error">⛔ PARSING FAILED\n' + escapeHtml(result.error) + '</div>';
      setBadge('error', '[ PARSER ERROR: LEXICAL_COMPILATION_FAILED ]');
      updateTelemetry({ bytes: rawInput.length, keyCount: 0, maxDepth: 0, type: fmt.toUpperCase() });
      return;
    }

    parsedData = result.data;
    setBadge('valid', '[ PARSER STABILIZED: LEXICAL TREE SYNTAX VALID ]');

    const treeRoot = document.createElement('div');
    treeRoot.className = 'tree-node';

    if (fmt === 'json') {
      buildJSONTree(parsedData, treeRoot, 0, 'root');
    } else {
      buildXMLTree(parsedData.documentElement, treeRoot, 0);
    }

    viewport.innerHTML = '';
    viewport.appendChild(treeRoot);

    const stats = computeStats();
    updateTelemetry(stats);
  }

  /* ─── JSON TREE BUILDER ─── */
  function buildJSONTree(obj, parentEl, depth, key) {
    const stats = { keyCount: 0, maxDepth: depth };

    if (obj === null || obj === undefined) {
      const row = makeLeafRow(key, 'null', 'tree-null');
      parentEl.appendChild(row);
      stats.keyCount = 1;
      return stats;
    }

    const type = Array.isArray(obj) ? 'array' : typeof obj;

    if (type === 'string' || type === 'number' || type === 'boolean') {
      const cls = type === 'string' ? 'tree-str' : type === 'number' ? 'tree-num' : 'tree-bool';
      const display = type === 'string' ? '"' + escapeHtml(String(obj)) + '"' : String(obj);
      const row = makeLeafRow(key, display, cls);
      parentEl.appendChild(row);
      stats.keyCount = 1;
      return stats;
    }

    if (type === 'object') {
      const entries = Object.entries(obj);
      const container = document.createElement('div');
      container.className = 'tree-node';

      const headerRow = document.createElement('div');
      headerRow.className = 'tree-row';
      const toggle = document.createElement('span');
      toggle.className = 'tree-toggle open';
      if (entries.length === 0) toggle.classList.add('leaf');
      toggle.textContent = '▶';
      headerRow.appendChild(toggle);

      const keySpan = document.createElement('span');
      keySpan.className = 'tree-key';
      keySpan.textContent = key === 'root' ? '' : '"' + key + '"';
      if (key !== 'root') headerRow.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'tree-colon';
      colon.textContent = key === 'root' || key === undefined ? '' : ':';
      if (key !== 'root' && key !== undefined) headerRow.appendChild(colon);

      const typeTag = document.createElement('span');
      typeTag.className = 'tree-type-tag';
      typeTag.textContent = type === 'array' ? 'Array[' + entries.length + ']' : 'Object {' + entries.length + '}';
      headerRow.appendChild(typeTag);

      container.appendChild(headerRow);

      const children = document.createElement('div');
      children.className = 'tree-children';
      let totalKeys = 0;
      let maxChildDepth = depth;

      if (type === 'array') {
        entries.forEach(([idx, val]) => {
          const childStats = buildJSONTree(val, children, depth + 1, idx);
          totalKeys += childStats.keyCount;
          maxChildDepth = Math.max(maxChildDepth, childStats.maxDepth);
        });
      } else {
        entries.forEach(([k, val]) => {
          const childStats = buildJSONTree(val, children, depth + 1, k);
          totalKeys += childStats.keyCount;
          maxChildDepth = Math.max(maxChildDepth, childStats.maxDepth);
        });
      }

      if (entries.length > 0) {
        container.appendChild(children);
        toggle.addEventListener('click', function () {
          children.classList.toggle('hidden');
          toggle.classList.toggle('open');
        });
      }

      parentEl.appendChild(container);
      stats.keyCount = totalKeys + 1;
      stats.maxDepth = maxChildDepth;
      return stats;
    }

    return stats;
  }

  /* ─── XML TREE BUILDER ─── */
  function buildXMLTree(node, parentEl, depth) {
    const stats = { keyCount: 0, maxDepth: depth };
    const tagName = node.nodeName;
    const children = [];

    /* collect child element nodes + text nodes */
    for (let i = 0; i < node.childNodes.length; i++) {
      const cn = node.childNodes[i];
      if (cn.nodeType === 1) children.push(cn);
    }

    let textContent = '';
    if (node.childNodes.length === 1 && node.firstChild.nodeType === 3) {
      textContent = node.firstChild.textContent.trim();
    } else {
      /* check if only text among children */
      const allText = Array.from(node.childNodes).every(c => c.nodeType === 3 || c.nodeType === 4);
      if (allText) {
        textContent = node.textContent.trim();
      }
    }

    const container = document.createElement('div');
    container.className = 'tree-node';

    const headerRow = document.createElement('div');
    headerRow.className = 'tree-row';

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle' + (children.length === 0 && !textContent ? ' leaf' : ' open');
    if (children.length > 0 || textContent) toggle.textContent = '▶';
    headerRow.appendChild(toggle);

    const openTag = document.createElement('span');
    openTag.className = 'tree-xml-bracket';
    openTag.textContent = '<';
    headerRow.appendChild(openTag);

    const tagSpan = document.createElement('span');
    tagSpan.className = 'tree-xml-tag';
    tagSpan.textContent = tagName;
    headerRow.appendChild(tagSpan);

    /* attributes */
    if (node.attributes && node.attributes.length > 0) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        const attrSpace = document.createTextNode(' ');
        headerRow.appendChild(attrSpace);
        const attrName = document.createElement('span');
        attrName.className = 'tree-xml-attr';
        attrName.textContent = attr.name;
        headerRow.appendChild(attrName);
        const eq = document.createElement('span');
        eq.className = 'tree-xml-eq';
        eq.textContent = '=';
        headerRow.appendChild(eq);
        const q = document.createElement('span');
        q.className = 'tree-xml-bracket';
        q.textContent = '"';
        headerRow.appendChild(q);
        const av = document.createElement('span');
        av.className = 'tree-xml-text';
        av.textContent = attr.value;
        headerRow.appendChild(av);
        const q2 = document.createElement('span');
        q2.className = 'tree-xml-bracket';
        q2.textContent = '"';
        headerRow.appendChild(q2);
      }
    }

    const closeOpen = document.createElement('span');
    closeOpen.className = 'tree-xml-bracket';
    closeOpen.textContent = '>';
    headerRow.appendChild(closeOpen);

    if (!textContent && children.length === 0) {
      /* self-closing */
      closeOpen.textContent = ' />';
      const typeTag = document.createElement('span');
      typeTag.className = 'tree-type-tag';
      typeTag.textContent = 'empty';
      headerRow.appendChild(typeTag);
    } else {
      const typeTag = document.createElement('span');
      typeTag.className = 'tree-type-tag';
      typeTag.textContent = children.length ? 'Element' : 'Text';
      headerRow.appendChild(typeTag);
    }

    container.appendChild(headerRow);

    if (children.length > 0 || textContent) {
      const childContainer = document.createElement('div');
      childContainer.className = 'tree-children';

      if (textContent && children.length === 0) {
        const textRow = document.createElement('div');
        textRow.className = 'tree-row';
        const leaf = document.createElement('span');
        leaf.className = 'tree-toggle leaf';
        textRow.appendChild(leaf);
        const txt = document.createElement('span');
        txt.className = 'tree-xml-text';
        txt.textContent = '"' + escapeHtml(textContent) + '"';
        textRow.appendChild(txt);
        childContainer.appendChild(textRow);
      }

      let totalKeys = 0;
      let maxChildDepth = depth;
      children.forEach(child => {
        const childStats = buildXMLTree(child, childContainer, depth + 1);
        totalKeys += childStats.keyCount;
        maxChildDepth = Math.max(maxChildDepth, childStats.maxDepth);
      });

      if (children.length > 0 || textContent) {
        container.appendChild(childContainer);
        toggle.addEventListener('click', function () {
          childContainer.classList.toggle('hidden');
          toggle.classList.toggle('open');
        });
      }

      /* closing tag row */
      const closeRow = document.createElement('div');
      closeRow.className = 'tree-row';
      const ct = document.createElement('span');
      ct.className = 'tree-toggle leaf';
      closeRow.appendChild(ct);
      const closeB = document.createElement('span');
      closeB.className = 'tree-xml-bracket';
      closeB.textContent = '</';
      closeRow.appendChild(closeB);
      const ct2 = document.createElement('span');
      ct2.className = 'tree-xml-tag';
      ct2.textContent = tagName;
      closeRow.appendChild(ct2);
      const closeB2 = document.createElement('span');
      closeB2.className = 'tree-xml-bracket';
      closeB2.textContent = '>';
      closeRow.appendChild(closeB2);
      childContainer.appendChild(closeRow);

      stats.keyCount = totalKeys + 1;
      stats.maxDepth = maxChildDepth;
    } else {
      stats.keyCount = 1;
      stats.maxDepth = depth;
    }

    parentEl.appendChild(container);
    return stats;
  }

  /* ─── HELPERS ─── */
  function makeLeafRow(key, display, cls) {
    const row = document.createElement('div');
    row.className = 'tree-row';
    const leaf = document.createElement('span');
    leaf.className = 'tree-toggle leaf';
    row.appendChild(leaf);
    if (key !== undefined && key !== null && key !== 'root') {
      const k = document.createElement('span');
      k.className = 'tree-key';
      k.textContent = /^\d+$/.test(String(key)) ? '[' + key + ']' : '"' + key + '"';
      row.appendChild(k);
      if (!/^\d+$/.test(String(key))) {
        const c = document.createElement('span');
        c.className = 'tree-colon';
        c.textContent = ':';
        row.appendChild(c);
      }
    }
    const v = document.createElement('span');
    v.className = cls || '';
    v.textContent = display;
    row.appendChild(v);
    const comma = document.createElement('span');
    comma.className = 'tree-comma';
    comma.textContent = ',';
    row.appendChild(comma);
    return row;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── TELEMETRY ─── */
  function computeStats() {
    const fmt = activeFormat;
    const str = rawInput;
    const bytes = new TextEncoder().encode(str).length;
    const type = fmt.toUpperCase();
    let keyCount = 0;
    let maxDepth = 0;

    if (fmt === 'json' && parsedData) {
      function countKeys(obj, depth) {
        maxDepth = Math.max(maxDepth, depth);
        if (obj === null || obj === undefined) return 1;
        if (typeof obj !== 'object') return 1;
        const entries = Object.entries(obj);
        let count = 1;
        entries.forEach(([k, v]) => {
          count += countKeys(v, depth + 1);
        });
        return count;
      }
      keyCount = countKeys(parsedData, 0);
    }

    if (fmt === 'xml' && parsedData) {
      function countXMLNodes(node, depth) {
        maxDepth = Math.max(maxDepth, depth);
        let count = 1;
        for (let i = 0; i < node.childNodes.length; i++) {
          const cn = node.childNodes[i];
          if (cn.nodeType === 1) count += countXMLNodes(cn, depth + 1);
        }
        return count;
      }
      keyCount = countXMLNodes(parsedData.documentElement, 0);
    }

    return { bytes, keyCount, maxDepth, type };
  }

  function updateTelemetry(stats) {
    tType.textContent = stats.type;
    tBytes.innerHTML = stats.bytes + ' <span class="tele-unit">bytes</span>';
    tKeys.textContent = stats.keyCount;
    tDepth.textContent = stats.maxDepth;
  }

  function setBadge(cls, text) {
    tBadge.className = 'tele-badge ' + cls;
    tBadge.textContent = text;
  }

  /* ─── EXPAND / COLLAPSE ALL ─── */
  function expandAll() {
    viewport.querySelectorAll('.tree-children').forEach(el => el.classList.remove('hidden'));
    viewport.querySelectorAll('.tree-toggle').forEach(el => el.classList.add('open'));
  }

  function collapseAll() {
    viewport.querySelectorAll('.tree-children').forEach(el => el.classList.add('hidden'));
    viewport.querySelectorAll('.tree-toggle').forEach(el => el.classList.remove('open'));
  }

  /* ─── BEAUTIFY ─── */
  function beautify() {
    const str = inputArea.value;
    if (activeFormat === 'json') {
      try {
        const data = JSON.parse(str);
        inputArea.value = JSON.stringify(data, null, 2);
      } catch (e) { /* ignore */ }
    } else {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(str, 'text/xml');
        const err = doc.querySelector('parsererror');
        if (err) return;
        inputArea.value = formatXML(doc.documentElement, 0);
      } catch (e) { /* ignore */ }
    }
  }

  function formatXML(node, indent) {
    const pad = '  '.repeat(indent);
    const tag = node.nodeName;
    let attrs = '';
    if (node.attributes && node.attributes.length > 0) {
      for (let i = 0; i < node.attributes.length; i++) {
        const a = node.attributes[i];
        attrs += ' ' + a.name + '="' + a.value + '"';
      }
    }
    const children = [];
    for (let i = 0; i < node.childNodes.length; i++) {
      const cn = node.childNodes[i];
      if (cn.nodeType === 1) children.push(cn);
    }
    if (children.length === 0) {
      let txt = '';
      if (node.childNodes.length === 1 && node.firstChild.nodeType === 3) {
        txt = node.firstChild.textContent.trim();
      }
      if (txt) {
        return pad + '<' + tag + attrs + '>' + escapeXml(txt) + '</' + tag + '>';
      }
      return pad + '<' + tag + attrs + ' />';
    }
    let out = pad + '<' + tag + attrs + '>\n';
    children.forEach(c => {
      out += formatXML(c, indent + 1) + '\n';
    });
    out += pad + '</' + tag + '>';
    return out;
  }

  function escapeXml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ─── MINIFY ─── */
  function minify() {
    const str = inputArea.value;
    if (activeFormat === 'json') {
      try {
        const data = JSON.parse(str);
        inputArea.value = JSON.stringify(data);
      } catch (e) { /* ignore */ }
    } else {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(str, 'text/xml');
        const err = doc.querySelector('parsererror');
        if (err) return;
        inputArea.value = new XMLSerializer().serializeToString(doc.documentElement);
      } catch (e) { /* ignore */ }
    }
  }

  /* ─── COPY ─── */
  function copyToClipboard() {
    const text = inputArea.value;
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setBadge('active', '[ CLIPBOARD: RAW_DATA_BUFFER_COPIED ]');
        setTimeout(function () {
          if (parsedData) setBadge('valid', '[ PARSER STABILIZED: LEXICAL TREE SYNTAX VALID ]');
          else setBadge('standby', 'STANDBY');
        }, 1500);
      }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    setBadge('active', '[ CLIPBOARD: RAW_DATA_BUFFER_COPIED ]');
    setTimeout(function () {
      if (parsedData) setBadge('valid', '[ PARSER STABILIZED: LEXICAL TREE SYNTAX VALID ]');
      else setBadge('standby', 'STANDBY');
    }, 1500);
  }

  /* ─── INJECT TEMPLATE ─── */
  function injectTemplate() {
    const template = `{
  "status": "ok",
  "code": 200,
  "metadata": {
    "requestId": "req_a7f3b2c9e1d4",
    "timestamp": "2026-06-15T14:32:18.742Z",
    "version": "2.4.1",
    "service": "api-gateway",
    "region": "us-east-1",
    "latency": {
      "dns": 12,
      "tcp": 34,
      "tls": 87,
      "response": 142,
      "total": 275
    }
  },
  "data": {
    "users": [
      {
        "id": 1001,
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "administrator",
        "active": true,
        "profile": {
          "avatar": "https://cdn.example.com/avatars/1001.png",
          "bio": "Full-stack engineer & open-source contributor",
          "location": {
            "city": "San Francisco",
            "state": "California",
            "country": "US",
            "coordinates": {
              "lat": 37.7749,
              "lng": -122.4194
            }
          },
          "social": {
            "github": "janedoe",
            "twitter": "@janedoe_dev",
            "linkedin": "janedoe"
          }
        },
        "permissions": ["read:users", "write:users", "delete:users", "admin:system"],
        "preferences": {
          "theme": "dark",
          "notifications": true,
          "language": "en-US",
          "timezone": "America/Los_Angeles",
          "emailFrequency": "daily"
        }
      },
      {
        "id": 1002,
        "name": "John Smith",
        "email": "john.smith@example.com",
        "role": "editor",
        "active": true,
        "profile": {
          "avatar": null,
          "bio": "Content manager and technical writer",
          "location": {
            "city": "New York",
            "state": "New York",
            "country": "US",
            "coordinates": {
              "lat": 40.7128,
              "lng": -74.006
            }
          },
          "social": {
            "github": "johnsmith",
            "twitter": null,
            "linkedin": "johnsmith"
          }
        },
        "permissions": ["read:users", "write:content"],
        "preferences": {
          "theme": "light",
          "notifications": false,
          "language": "en-US",
          "timezone": "America/New_York",
          "emailFrequency": "weekly"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "totalItems": 2847,
      "totalPages": 57
    },
    "config": {
      "features": {
        "darkMode": true,
        "experimentalEditor": false,
        "betaApi": true,
        "webhooks": {
          "enabled": true,
          "endpoint": "https://hooks.example.com/events",
          "retryPolicy": {
            "maxRetries": 3,
            "backoffMs": 1000,
            "timeoutMs": 5000
          }
        }
      },
      "rateLimiting": {
        "maxRequests": 1000,
        "windowMs": 60000,
        "strategy": "sliding-window"
      }
    }
  }
}`;
    inputArea.value = template;
    setBadge('active', '[ TEMPLATE: COMPLEX_NESTED_MOCK_INJECTED ]');
    setTimeout(function () { setBadge('standby', '[ READY: EXECUTE_LEXICAL_COMPILATION ]'); }, 1200);
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    parsedData = null;
    rawInput = '';
    inputArea.value = '';
    viewport.innerHTML = '<div class="viewport-placeholder">AWAITING PARSED DATA STRUCTURE — EXECUTE LEXICAL COMPILATION</div>';
    setBadge('standby', 'STANDBY');
    updateTelemetry({ bytes: 0, keyCount: 0, maxDepth: 0, type: '--' });
  }

  /* ─── EVENT BINDING ─── */
  btnExecute.addEventListener('click', executeParse);
  btnBeautify.addEventListener('click', function () { beautify(); executeParse(); });
  btnMinify.addEventListener('click', function () { minify(); executeParse(); });
  btnExpand.addEventListener('click', expandAll);
  btnCollapse.addEventListener('click', collapseAll);
  btnCopy.addEventListener('click', copyToClipboard);
  btnInject.addEventListener('click', injectTemplate);
  btnFlush.addEventListener('click', flushAll);

  /* ─── KEYBOARD SHORTCUT ─── */
  inputArea.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeParse();
    }
  });

  /* ─── INIT ─── */
  function init() {
    flushAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
