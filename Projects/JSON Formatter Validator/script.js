/**
 * JSONAlign - JSON Formatter & Validator script.js
 * Comprehensive client-side state management, parsing, validation, path query filters, and interactive tree renders.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const jsonInput = document.getElementById('json-input-textarea');
  const selectPreset = document.getElementById('select-preset-json');
  
  // Actions
  const btnPaste = document.getElementById('btn-paste-clipboard');
  const btnMinify = document.getElementById('btn-minify-json');
  const btnFormat2 = document.getElementById('btn-format-2');
  const btnFormat4 = document.getElementById('btn-format-4');
  const btnClearEditor = document.getElementById('btn-clear-editor');
  
  // Alert Card
  const alertContainer = document.getElementById('validator-alert-box');
  const alertDescription = document.getElementById('alert-description');
  const alertCoordinates = document.getElementById('alert-coordinates');

  // Query & Tabs
  const pathQueryInput = document.getElementById('json-path-query-input');
  const btnClearQuery = document.getElementById('btn-clear-query');
  const tabPretty = document.querySelector('[data-tab="pretty"]');
  const tabTree = document.querySelector('[data-tab="tree"]');
  const panePretty = document.getElementById('results-pane-pretty');
  const paneTree = document.getElementById('results-pane-tree');
  const blankState = document.getElementById('results-blank-state');
  
  // Viewports
  const prettyCodeBody = document.getElementById('results-pretty-code-body');
  const treeBody = document.getElementById('results-tree-body');
  const footerActions = document.getElementById('results-footer-actions');
  const btnCopyOutput = document.getElementById('btn-copy-output');
  const btnDownloadFile = document.getElementById('btn-download-file');

  // History & Telemetry
  const historyContainer = document.getElementById('history-container');
  const btnClearHistory = document.getElementById('btn-clear-history');
  
  const metaSize = document.getElementById('meta-size');
  const metaLines = document.getElementById('meta-lines');
  const metaKeys = document.getElementById('meta-keys');
  const metaArrays = document.getElementById('meta-arrays');
  const metaDepth = document.getElementById('meta-depth');
  const metaValidity = document.getElementById('meta-validity');

  // --- App State ---
  let state = {
    parsedJson: null,       // Root parsed JSON object/value
    filteredJson: null,     // JSON object/value after path-query filters
    rawString: '',          // Current text in editor
    queryPath: '',          // Active path filter string
    activeTab: 'pretty',    // 'pretty' or 'tree'
    history: []             // History log objects {id, time, label, snippet, content}
  };

  // --- Preset Mock Seed Data ---
  const presets = {
    'user-profile': {
      "id": 1024,
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane.doe@example.com",
      "isActive": true,
      "profile": {
        "title": "Senior Staff Architect",
        "department": "Engineering",
        "skills": ["JavaScript", "TypeScript", "HTML5", "CSS3", "JSONPath"],
        "experienceYears": 8.5,
        "verified": true
      },
      "contacts": [
        {
          "type": "work",
          "email": "jane.doe@company.com",
          "phone": "+1-555-0199"
        },
        {
          "type": "personal",
          "email": "jane.doe.personal@gmail.com",
          "phone": null
        }
      ],
      "preferences": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "push": false
        }
      }
    },
    'ecommerce-catalog': [
      {
        "productId": "PROD-8890",
        "title": "Ultra-Wide Glassmorphic Monitor",
        "price": 599.99,
        "inStock": true,
        "categories": ["electronics", "office", "displays"],
        "ratings": {
          "average": 4.8,
          "count": 124
        },
        "dimensions": {
          "width": 34.2,
          "height": 18.5,
          "depth": 7.4
        }
      },
      {
        "productId": "PROD-2134",
        "title": "Ergonomic Mechanical Keyboard",
        "price": 149.50,
        "inStock": false,
        "categories": ["computer-peripherals", "input-devices"],
        "ratings": {
          "average": 4.6,
          "count": 89
        },
        "dimensions": null
      },
      {
        "productId": "PROD-4432",
        "title": "Minimalist Desk Pad (Large)",
        "price": 29.00,
        "inStock": true,
        "categories": ["office", "accessories"],
        "ratings": {
          "average": 4.9,
          "count": 356
        },
        "dimensions": {
          "width": 36.0,
          "height": 16.0,
          "depth": 0.15
        }
      }
    ],
    'syntax-error-demo': `{
  "status": "error demo",
  "description": "This JSON has a missing comma and an unclosed brace",
  "metadata": {
    "app": "JSONAlign",
    "version": "1.0.0"
  }
  "brokenArray": [
    "first element",
    "second element"
  ]
}`
  };

  // --- Initializer ---
  function init() {
    loadHistory();
    // Default load nested user profile
    loadPresetString('user-profile');
  }

  // --- LocalStorage History ---
  function loadHistory() {
    try {
      const stored = localStorage.getItem('json_align_history');
      if (stored) {
        state.history = JSON.parse(stored);
        renderHistoryList();
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem('json_align_history', JSON.stringify(state.history));
      renderHistoryList();
    } catch (e) {
      console.error('Error saving history:', e);
    }
  }

  function addToHistory(content) {
    // Avoid duplicating identical recent content
    if (state.history.length > 0 && state.history[0].content === content) {
      return;
    }

    try {
      const parsed = JSON.parse(content);
      const isArray = Array.isArray(parsed);
      const typeLabel = isArray ? 'Array' : 'Object';
      const count = isArray ? parsed.length : Object.keys(parsed).length;
      const detail = isArray ? `${count} items` : `${count} keys`;
      
      const snippet = content.length > 55 ? content.substring(0, 52) + '...' : content;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const item = {
        id: Date.now(),
        time: timeStr,
        label: `${typeLabel} (${detail})`,
        snippet: snippet,
        content: content
      };

      state.history.unshift(item);
      // Cap at 15 items
      if (state.history.length > 15) {
        state.history.pop();
      }
      saveHistory();
    } catch (e) {
      // Don't add invalid parsing inputs to history
    }
  }

  function renderHistoryList() {
    historyContainer.innerHTML = '';
    if (state.history.length === 0) {
      historyContainer.innerHTML = `
        <div class="workspace-empty-state" style="padding: 12px; max-width: 100%;">
          <p style="font-size: 0.75rem;">No history items cached yet.</p>
        </div>
      `;
      return;
    }

    state.history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <h4>${item.label}</h4>
        <p>${item.snippet}</p>
        <div style="font-size: 0.6rem; color: var(--text-muted); margin-top: 4px; text-align: right;">${item.time}</div>
      `;
      div.addEventListener('click', () => {
        jsonInput.value = item.content;
        processJson(item.content);
      });
      historyContainer.appendChild(div);
    });
  }

  // --- Telemetry & Analytics Evaluator ---
  function updateTelemetry(rawText, parsedObj, isValid) {
    if (!isValid) {
      metaSize.textContent = getByteSizeString(rawText);
      metaLines.textContent = rawText.split('\n').length;
      metaKeys.textContent = '0';
      metaArrays.textContent = '0';
      metaDepth.textContent = '0';
      metaValidity.textContent = 'Invalid';
      metaValidity.className = 'telemetry-value color-danger';
      return;
    }

    // Process valid metrics
    metaSize.textContent = getByteSizeString(rawText);
    metaLines.textContent = rawText.split('\n').length;
    metaValidity.textContent = 'Clean';
    metaValidity.className = 'telemetry-value text-accent';

    const metrics = scanJsonStructure(parsedObj);
    metaKeys.textContent = metrics.keysCount;
    metaArrays.textContent = metrics.arrayItemsCount;
    metaDepth.textContent = metrics.maxDepth;
  }

  function getByteSizeString(str) {
    const bytes = new Blob([str]).size;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  function scanJsonStructure(val) {
    let keysCount = 0;
    let arrayItemsCount = 0;
    let maxDepth = 0;

    function traverse(node, currentDepth) {
      if (node === null || typeof node !== 'object') {
        maxDepth = Math.max(maxDepth, currentDepth);
        return;
      }
      
      if (Array.isArray(node)) {
        maxDepth = Math.max(maxDepth, currentDepth + 1);
        arrayItemsCount += node.length;
        node.forEach(item => traverse(item, currentDepth + 1));
      } else {
        // Object
        const keys = Object.keys(node);
        maxDepth = Math.max(maxDepth, currentDepth + 1);
        keysCount += keys.length;
        keys.forEach(key => traverse(node[key], currentDepth + 1));
      }
    }

    traverse(val, 0);
    return { keysCount, arrayItemsCount, maxDepth };
  }

  // --- Parsing and Validation Error Locator ---
  function getErrorCoordinates(jsonStr, errorMsg) {
    let position = -1;
    // Attempt standard V8 parser match "at position 123"
    const posMatch = errorMsg.match(/position\s+(\d+)/i);
    if (posMatch) {
      position = parseInt(posMatch[1], 10);
    } else {
      // Check for direct line column print in message (like Firefox logs)
      const lineColMatch = errorMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
      if (lineColMatch) {
        return { line: parseInt(lineColMatch[1], 10), column: parseInt(lineColMatch[2], 10) };
      }
    }

    if (position === -1 || position > jsonStr.length) {
      // Fallback coordinate search
      return { line: 1, column: 1 };
    }

    const lines = jsonStr.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column };
  }

  // --- Core JSON Engine ---
  function processJson(rawText, formatIndent = null) {
    state.rawString = rawText;
    const trimmed = rawText.trim();

    if (!trimmed) {
      clearOutputs();
      return;
    }

    try {
      // Attempt Parse
      const parsed = JSON.parse(trimmed);
      state.parsedJson = parsed;

      // Formatting check
      if (formatIndent !== null) {
        const formatted = JSON.stringify(parsed, null, formatIndent);
        jsonInput.value = formatted;
        state.rawString = formatted;
      }

      // Hide alerts
      alertContainer.classList.add('hidden');

      // Update metrics
      updateTelemetry(state.rawString, state.parsedJson, true);

      // Add successful format to history logs
      addToHistory(state.rawString);

      // Evaluate filters and render
      evaluateQuery();

    } catch (error) {
      // Invalid JSON syntax flow
      state.parsedJson = null;
      state.filteredJson = null;

      // Extract error coordinates
      const coords = getErrorCoordinates(rawText, error.message);
      
      // Update Alert Box
      alertDescription.textContent = error.message;
      alertCoordinates.textContent = `Line ${coords.line}, Column ${coords.column}`;
      alertContainer.classList.remove('hidden');

      // Update metrics
      updateTelemetry(rawText, null, false);

      // Show blank output
      renderBlankOutputState("Invalid JSON Input", "Please resolve syntax issues indicated below the editor area to proceed.");
    }
  }

  // --- Clear Outputs ---
  function clearOutputs() {
    state.parsedJson = null;
    state.filteredJson = null;
    state.rawString = '';
    
    alertContainer.classList.add('hidden');
    prettyCodeBody.innerHTML = '';
    treeBody.innerHTML = '';
    
    // Telemetry zeroes
    metaSize.textContent = '0.00 KB';
    metaLines.textContent = '0';
    metaKeys.textContent = '0';
    metaArrays.textContent = '0';
    metaDepth.textContent = '0';
    metaValidity.textContent = 'Clean';
    metaValidity.className = 'telemetry-value text-accent';

    renderBlankOutputState("No Input Processed", "Type or paste JSON text in the editor area and click format to inspect details.");
  }

  function renderBlankOutputState(title, subtitle) {
    blankState.querySelector('h3').textContent = title;
    blankState.querySelector('p').textContent = subtitle;
    blankState.classList.remove('hidden');
    panePretty.classList.add('hidden');
    paneTree.classList.add('hidden');
    footerActions.classList.add('hidden');
  }

  // --- Path Query Filter Evaluator ---
  function evaluateQuery() {
    const query = pathQueryInput.value.trim();
    state.queryPath = query;

    if (query === '') {
      btnClearQuery.classList.add('hidden');
      state.filteredJson = state.parsedJson;
    } else {
      btnClearQuery.classList.remove('hidden');
      state.filteredJson = getValueByPath(state.parsedJson, query);
    }

    renderResultsPanes();
  }

  function getValueByPath(obj, path) {
    if (obj === null || obj === undefined) return undefined;
    
    // Replace index brackets e.g. store.books[0] -> store.books.0
    // and keys inside brackets e.g. store.books["title"] -> store.books.title
    const cleanPath = path
      .replace(/\[\s*['"]?([^'"]+?)['"]?\s*\]/g, '.$1')
      .replace(/^\.+|\.+$/g, ''); // strip leading/trailing dots

    if (!cleanPath) return obj;

    const parts = cleanPath.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      // Navigate arrays and objects
      if (typeof current === 'object') {
        if (part in current) {
          current = current[part];
        } else {
          return undefined; // Not found
        }
      } else {
        return undefined; // Can't drill into primitives
      }
    }

    return current;
  }

  // --- Results Rendering Engine ---
  function renderResultsPanes() {
    if (state.parsedJson === null) {
      return;
    }

    blankState.classList.add('hidden');
    footerActions.classList.remove('hidden');

    if (state.filteredJson === undefined) {
      // Path query evaluated, but returned no matching entries
      prettyCodeBody.innerHTML = `<span class="json-value-null">/* Query path returned undefined. No matching records found. */</span>`;
      treeBody.innerHTML = `<div style="color: var(--text-muted); font-style: italic;">/* Query path returned undefined. No matching records found. */</div>`;
      
      // Show correct pane
      if (state.activeTab === 'pretty') {
        panePretty.classList.remove('hidden');
        paneTree.classList.add('hidden');
      } else {
        panePretty.classList.add('hidden');
        paneTree.classList.remove('hidden');
      }
      return;
    }

    // Render Pretty Highlighter
    const prettyString = JSON.stringify(state.filteredJson, null, 2);
    prettyCodeBody.innerHTML = syntaxHighlight(prettyString);

    // Render Collapsible Tree Node
    treeBody.innerHTML = '';
    const rootNode = createTreeNode(null, state.filteredJson, true);
    treeBody.appendChild(rootNode);

    // Show correct pane
    if (state.activeTab === 'pretty') {
      panePretty.classList.remove('hidden');
      paneTree.classList.add('hidden');
    } else {
      panePretty.classList.add('hidden');
      paneTree.classList.remove('hidden');
    }
  }

  // --- Syntax Highlighter Parser ---
  function syntaxHighlight(jsonStr) {
    // Escape standard tags
    jsonStr = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Core matcher regex
    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
    
    return jsonStr.replace(regex, (match) => {
      let cls = 'json-value-num';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-value-bool';
      } else if (/null/.test(match)) {
        cls = 'json-value-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  // --- Interactive Tree View Constructor ---
  function createTreeNode(key, value, isLast = true) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    
    const header = document.createElement('div');
    header.className = 'tree-node-header';
    
    // Create Key node block if applicable
    const keySpan = document.createElement('span');
    if (key !== null) {
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}": `;
    }
    
    if (value === null) {
      // Null Value
      const valSpan = document.createElement('span');
      valSpan.className = 'json-value-null';
      valSpan.textContent = 'null';
      header.appendChild(keySpan);
      header.appendChild(valSpan);
      if (!isLast) {
        header.appendChild(document.createTextNode(','));
      }
      node.appendChild(header);
    } else if (typeof value === 'object') {
      // Objects & Arrays
      const isArray = Array.isArray(value);
      const openChar = isArray ? '[' : '{';
      const closeChar = isArray ? ']' : '}';
      const size = isArray ? value.length : Object.keys(value).length;
      const summaryText = isArray ? `${size} item${size !== 1 ? 's' : ''}` : `${size} key${size !== 1 ? 's' : ''}`;
      
      // Arrow indicator icon
      const arrow = document.createElement('i');
      arrow.className = 'fa-solid fa-chevron-right tree-arrow expanded';
      header.appendChild(arrow);
      
      header.appendChild(keySpan);
      
      // Bracket open element
      const bracketOpen = document.createElement('span');
      bracketOpen.className = 'tree-bracket';
      bracketOpen.textContent = openChar;
      header.appendChild(bracketOpen);
      
      // Summary elements (visible on collapsed mode)
      const summary = document.createElement('span');
      summary.className = 'tree-summary hidden';
      summary.textContent = ` /* ${summaryText} */ `;
      header.appendChild(summary);
      
      // Children nodes list wrapper
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-node-children';
      
      const keysList = isArray ? value.map((_, i) => i) : Object.keys(value);
      
      keysList.forEach((k, idx) => {
        const childVal = value[k];
        const childIsLast = idx === keysList.length - 1;
        const childNode = createTreeNode(isArray ? null : k, childVal, childIsLast);
        childrenContainer.appendChild(childNode);
      });
      
      // Bracket close footer
      const footer = document.createElement('div');
      footer.className = 'tree-node-footer';
      const bracketClose = document.createElement('span');
      bracketClose.className = 'tree-bracket';
      bracketClose.textContent = closeChar + (isLast ? '' : ',');
      footer.appendChild(bracketClose);
      
      node.appendChild(header);
      node.appendChild(childrenContainer);
      node.appendChild(footer);
      
      // Interactive folder click toggles
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = arrow.classList.contains('expanded');
        if (isExpanded) {
          arrow.classList.remove('expanded');
          childrenContainer.classList.add('hidden');
          footer.classList.add('hidden');
          summary.classList.remove('hidden');
        } else {
          arrow.classList.add('expanded');
          childrenContainer.classList.remove('hidden');
          footer.classList.remove('hidden');
          summary.classList.add('hidden');
        }
      });
    } else {
      // Primitive types (string, number, boolean)
      const valSpan = document.createElement('span');
      const type = typeof value;
      
      if (type === 'string') {
        valSpan.className = 'json-string';
        valSpan.textContent = `"${value}"`;
      } else if (type === 'number') {
        valSpan.className = 'json-value-num';
        valSpan.textContent = value;
      } else if (type === 'boolean') {
        valSpan.className = 'json-value-bool';
        valSpan.textContent = value;
      }
      
      header.appendChild(keySpan);
      header.appendChild(valSpan);
      if (!isLast) {
        header.appendChild(document.createTextNode(','));
      }
      node.appendChild(header);
    }
    
    return node;
  }

  // --- Load Preset Items ---
  function loadPresetString(presetKey) {
    const preset = presets[presetKey];
    if (!preset) return;

    if (typeof preset === 'string') {
      jsonInput.value = preset;
      processJson(preset);
    } else {
      const formatted = JSON.stringify(preset, null, 2);
      jsonInput.value = formatted;
      processJson(formatted);
    }
    
    // Reset path search filter on presets swap
    pathQueryInput.value = '';
    btnClearQuery.classList.add('hidden');
    state.queryPath = '';
  }

  // --- Event Listeners ---

  // Presets load changes
  selectPreset.addEventListener('change', (e) => {
    loadPresetString(e.target.value);
  });

  // Hot-change handler in textarea
  jsonInput.addEventListener('input', (e) => {
    processJson(e.target.value);
  });

  // Action Buttons Click Events
  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      jsonInput.value = text;
      processJson(text);
    } catch (err) {
      // Fallback alert prompt if clipboard permission denied
      alert("Unable to read clipboard. Please paste manually into the editor area.");
    }
  });

  btnMinify.addEventListener('click', () => {
    if (state.parsedJson !== null) {
      processJson(state.rawString, 0); // 0 indent = minified single-line
    }
  });

  btnFormat2.addEventListener('click', () => {
    if (state.parsedJson !== null) {
      processJson(state.rawString, 2);
    }
  });

  btnFormat4.addEventListener('click', () => {
    if (state.parsedJson !== null) {
      processJson(state.rawString, 4);
    }
  });

  btnClearEditor.addEventListener('click', () => {
    jsonInput.value = '';
    selectPreset.selectedIndex = 0;
    clearOutputs();
  });

  // Tab controls switcher
  document.querySelectorAll('.mode-tab').forEach(button => {
    button.addEventListener('click', () => {
      // Toggle active visual indicator states
      document.querySelectorAll('.mode-tab').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      state.activeTab = button.getAttribute('data-tab');
      renderResultsPanes();
    });
  });

  // Filter Input elements
  pathQueryInput.addEventListener('input', () => {
    evaluateQuery();
  });

  btnClearQuery.addEventListener('click', () => {
    pathQueryInput.value = '';
    btnClearQuery.classList.add('hidden');
    evaluateQuery();
  });

  // Clear History
  btnClearHistory.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all formatting history logs?")) {
      state.history = [];
      saveHistory();
    }
  });

  // Export Toolbar buttons
  btnCopyOutput.addEventListener('click', () => {
    const targetText = state.filteredJson === undefined 
      ? "" 
      : JSON.stringify(state.filteredJson, null, 2);

    if (!targetText) return;

    navigator.clipboard.writeText(targetText).then(() => {
      const originalText = btnCopyOutput.innerHTML;
      btnCopyOutput.innerHTML = `<i class="fa-solid fa-check text-accent"></i> Copied!`;
      setTimeout(() => {
        btnCopyOutput.innerHTML = originalText;
      }, 1500);
    }).catch(err => {
      alert("Failed to copy text: " + err);
    });
  });

  btnDownloadFile.addEventListener('click', () => {
    const targetText = state.filteredJson === undefined 
      ? "" 
      : JSON.stringify(state.filteredJson, null, 2);

    if (!targetText) return;

    try {
      const blob = new Blob([targetText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `json-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed: " + e.message);
    }
  });

  // Launch initial settings
  init();
});
