/**
 * Regex Builder Studio - script.js
 * Visual block-based compilers, scroll-sync highlight overlays, replace tools, and language generators.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const selectPreset = document.getElementById('select-preset');
  
  // Flags
  const flagG = document.getElementById('flag-g');
  const flagI = document.getElementById('flag-i');
  const flagM = document.getElementById('flag-m');
  const flagS = document.getElementById('flag-s');
  const flagsDisplay = document.getElementById('regex-flags-display');
  
  // Sidebar Tabs
  const sidebarTabs = document.querySelectorAll('.sidebar-tab');
  const paneCheatsheet = document.getElementById('pane-cheatsheet');
  const paneCodegen = document.getElementById('pane-codegen');
  
  // Sidebar - CodeGen
  const langTabs = document.querySelectorAll('.lang-tab');
  const codeSnippetBody = document.getElementById('code-snippet-body');
  const btnCopyCode = document.getElementById('btn-copy-code');
  
  // Center - Constructor
  const blocksContainer = document.getElementById('blocks-container');
  const btnClearBlocks = document.getElementById('btn-clear-blocks');
  const btnBlockAdds = document.querySelectorAll('.btn-block-add');
  const explainerContainer = document.getElementById('explainer-container');
  
  // Right - Testing Playground
  const regexPatternInput = document.getElementById('regex-pattern-input');
  const btnCopyPattern = document.getElementById('btn-copy-pattern');
  const playgroundTextarea = document.getElementById('playground-textarea');
  const playgroundBackdrop = document.getElementById('playground-backdrop');
  
  // Right - Replace
  const replaceStringInput = document.getElementById('replace-string-input');
  const replaceResultBox = document.getElementById('replace-result-box');
  
  // Right - Inspector
  const matchCountBadge = document.getElementById('match-count-badge');
  const matchInspectorList = document.getElementById('match-inspector-list');

  // --- App State ---
  let state = {
    blocks: [],              // Visual Regex builder blocks list
    patternString: '',       // Compiled regex pattern raw string
    flags: 'g',              // Active flags string
    testString: '',          // Current text inside the testing area
    replaceString: '',       // Replacement text
    activeSidebarTab: 'cheatsheet',
    activeLang: 'js',
    isUpdatingPattern: false // Mutex flag preventing feedback loops
  };

  // --- Presets Configurations ---
  const presets = {
    'email-validator': {
      flags: { g: true, i: true, m: false, s: false },
      testString: `jane.doe@example.com\nhello-world@domain.co.uk\nfake_email.com\ninvalid@domain.\ntest+filter@sub.domain.org`,
      blocks: [
        { id: 1, type: 'range', value: 'a-zA-Z0-9._%+-', quantifier: '+', min: 1, max: 1, isCaptureGroup: false },
        { id: 2, type: 'literal', value: '@', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 3, type: 'range', value: 'a-zA-Z0-9.-', quantifier: '+', min: 1, max: 1, isCaptureGroup: false },
        { id: 4, type: 'literal', value: '.', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 5, type: 'range', value: 'a-zA-Z', quantifier: '{min,max}', min: 2, max: 8, isCaptureGroup: false }
      ]
    },
    'phone-us': {
      flags: { g: true, i: false, m: false, s: false },
      testString: `Contact us at (555) 0199 or personal line (800) 555-0143.\nIncorrect layouts: 555-0199, (55) 123-4567, (123)456-7890.`,
      blocks: [
        { id: 1, type: 'literal', value: '(', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 2, type: 'digit', value: '', quantifier: '{n}', min: 3, max: 3, isCaptureGroup: false },
        { id: 3, type: 'literal', value: ') ', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 4, type: 'digit', value: '', quantifier: '{n}', min: 3, max: 3, isCaptureGroup: false },
        { id: 5, type: 'literal', value: '-', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 6, type: 'digit', value: '', quantifier: '{n}', min: 4, max: 4, isCaptureGroup: false }
      ]
    },
    'ip-address': {
      flags: { g: true, i: false, m: false, s: false },
      testString: `Localhost: 127.0.0.1\nExternal IP: 192.168.1.102\nInvalid IPs: 999.999.9.9, 12.3456.78.9`,
      blocks: [
        { id: 1, type: 'digit', value: '', quantifier: '{min,max}', min: 1, max: 3, isCaptureGroup: true },
        { id: 2, type: 'literal', value: '.', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 3, type: 'digit', value: '', quantifier: '{min,max}', min: 1, max: 3, isCaptureGroup: true },
        { id: 4, type: 'literal', value: '.', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 5, type: 'digit', value: '', quantifier: '{min,max}', min: 1, max: 3, isCaptureGroup: true },
        { id: 6, type: 'literal', value: '.', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 7, type: 'digit', value: '', quantifier: '{min,max}', min: 1, max: 3, isCaptureGroup: true }
      ]
    },
    'date-iso': {
      flags: { g: true, i: false, m: false, s: false },
      testString: `Starts 2026-06-15, deadline is YYYY-MM-DD (2026-09-01).\nInvalid formats: 15-06-2026, 2026/06/15, 26-06-15.`,
      blocks: [
        { id: 1, type: 'digit', value: '', quantifier: '{n}', min: 4, max: 4, isCaptureGroup: false },
        { id: 2, type: 'literal', value: '-', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 3, type: 'digit', value: '', quantifier: '{n}', min: 2, max: 2, isCaptureGroup: false },
        { id: 4, type: 'literal', value: '-', quantifier: '1', min: 1, max: 1, isCaptureGroup: false },
        { id: 5, type: 'digit', value: '', quantifier: '{n}', min: 2, max: 2, isCaptureGroup: false }
      ]
    }
  };

  // --- Initializer ---
  function init() {
    loadPreset('email-validator');

    // Setup cheatsheet insertion click events
    document.querySelectorAll('.cheatsheet-item').forEach(item => {
      item.addEventListener('click', () => {
        const token = item.getAttribute('data-token');
        insertCheatsheetToken(token);
      });
    });
  }

  // Load a preset
  function loadPreset(key) {
    const preset = presets[key];
    if (!preset) return;

    // Set flags checkboxes
    flagG.checked = preset.flags.g;
    flagI.checked = preset.flags.i;
    flagM.checked = preset.flags.m;
    flagS.checked = preset.flags.s;

    // Load playground strings
    playgroundTextarea.value = preset.testString;
    state.testString = preset.testString;

    // Deep copy blocks state
    state.blocks = JSON.parse(JSON.stringify(preset.blocks));

    // Render Form cards and compile patterns
    renderBlocksList();
    compileRegexFromBlocks();
  }

  // --- Scroll Synchronized Highlighter ---
  function syncHighlighter() {
    const pattern = regexPatternInput.value;
    const testText = playgroundTextarea.value;
    state.testString = testText;

    // Update highlights
    if (!pattern || !testText) {
      playgroundBackdrop.innerHTML = escapeHtml(testText);
      matchCountBadge.textContent = '0 Matches';
      matchCountBadge.className = 'badge-success-count';
      renderInspectorLogs([]);
      replaceResultBox.textContent = testText;
      return;
    }

    // Capture flags
    let flags = '';
    if (flagG.checked) flags += 'g';
    if (flagI.checked) flags += 'i';
    if (flagM.checked) flags += 'm';
    if (flagS.checked) flags += 's';
    state.flags = flags;
    flagsDisplay.textContent = flags;

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      let match;
      
      // Prevent infinite loops on empty regex matches (e.g. ^ or $)
      let lastIndex = -1;

      if (flags.includes('g')) {
        while ((match = regex.exec(testText)) !== null) {
          if (regex.lastIndex === lastIndex) {
            regex.lastIndex++; // force advance
          }
          lastIndex = regex.lastIndex;
          matches.push(match);
        }
      } else {
        match = regex.exec(testText);
        if (match) matches.push(match);
      }

      // 1. Highlight overlays rendering
      renderHighlightBackdrop(testText, matches);

      // 2. Replacements update
      const repPattern = replaceStringInput.value;
      replaceResultBox.textContent = testText.replace(regex, repPattern);

      // 3. Match inspector reports
      matchCountBadge.textContent = `${matches.length} Match${matches.length !== 1 ? 'es' : ''}`;
      if (matches.length > 0) {
        matchCountBadge.className = 'badge-success-count text-success';
      } else {
        matchCountBadge.className = 'badge-success-count';
      }
      renderInspectorLogs(matches);

    } catch (e) {
      // Regular expression compilation error (incomplete manual edit)
      playgroundBackdrop.innerHTML = escapeHtml(testText);
      matchCountBadge.textContent = 'Regex Error';
      matchCountBadge.className = 'badge-success-count text-danger';
      renderInspectorLogs([]);
      replaceResultBox.textContent = testText;
    }
  }

  function renderHighlightBackdrop(text, matches) {
    if (matches.length === 0) {
      playgroundBackdrop.innerHTML = escapeHtml(text);
      return;
    }

    let resultHtml = '';
    let curIndex = 0;

    matches.forEach((match, idx) => {
      const start = match.index;
      const length = match[0].length;
      const end = start + length;

      // Skip invalid indices
      if (start < curIndex) return;

      // Append pre-match plain text
      resultHtml += escapeHtml(text.substring(curIndex, start));

      // Append marked match span (alternate classes for visual clarity of adjacent matches)
      const markClass = idx % 2 === 0 ? 'match-token' : 'match-token-alt';
      resultHtml += `<mark class="${markClass}">${escapeHtml(text.substring(start, end))}</mark>`;

      curIndex = end;
    });

    // Append post-match text
    if (curIndex < text.length) {
      resultHtml += escapeHtml(text.substring(curIndex));
    }

    // Add trailing break line placeholder for smooth scroll overlays alignment
    if (text.endsWith('\n')) {
      resultHtml += '\n ';
    }

    playgroundBackdrop.innerHTML = resultHtml;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // --- Inspector Logs ---
  function renderInspectorLogs(matches) {
    matchInspectorList.innerHTML = '';
    if (matches.length === 0) {
      matchInspectorList.innerHTML = `<div class="inspector-empty">No matches found in the test playground.</div>`;
      return;
    }

    matches.forEach((match, idx) => {
      const item = document.createElement('div');
      item.className = 'inspector-item';

      const top = document.createElement('div');
      top.className = 'inspector-item-top';

      const text = document.createElement('span');
      text.className = 'inspector-match-text';
      text.textContent = `Match ${idx + 1}: "${match[0]}"`;
      top.appendChild(text);

      const index = document.createElement('span');
      index.className = 'inspector-match-index';
      index.textContent = `index ${match.index} - ${match.index + match[0].length}`;
      top.appendChild(index);

      item.appendChild(top);

      // Extract capture groups
      if (match.length > 1) {
        const groupsDiv = document.createElement('div');
        groupsDiv.className = 'inspector-groups';

        for (let g = 1; g < match.length; g++) {
          const badge = document.createElement('span');
          badge.className = 'group-badge';
          badge.textContent = `Group ${g}: ${match[g] !== undefined ? `"${match[g]}"` : 'undefined'}`;
          groupsDiv.appendChild(badge);
        }

        item.appendChild(groupsDiv);
      }

      matchInspectorList.appendChild(item);
    });
  }

  // --- Visual Regex Compiler ---
  function compileRegexFromBlocks() {
    if (state.isUpdatingPattern) return;
    state.isUpdatingPattern = true;

    let regexStr = '';
    state.blocks.forEach(block => {
      let segment = '';

      switch (block.type) {
        case 'literal':
          // Escape regex specific metacharacters inside literal blocks
          segment = escapeRegExp(block.value);
          break;
        case 'digit':
          segment = '\\d';
          break;
        case 'word':
          segment = '\\w';
          break;
        case 'space':
          segment = '\\s';
          break;
        case 'any':
          segment = '.';
          break;
        case 'range':
          segment = `[${block.value}]`;
          break;
      }

      // Quantifier multiplier rules
      let quant = '';
      if (block.quantifier === '?') quant = '?';
      else if (block.quantifier === '+') quant = '+';
      else if (block.quantifier === '*') quant = '*';
      else if (block.quantifier === '{n}') quant = `{${block.min}}`;
      else if (block.quantifier === '{min,max}') {
        quant = `{${block.min},${block.max || ''}}`;
      }

      segment += quant;

      // Group captures check
      if (block.isCaptureGroup) {
        segment = `(${segment})`;
      }

      regexStr += segment;
    });

    state.patternString = regexStr;
    regexPatternInput.value = regexStr;
    state.isUpdatingPattern = false;

    // Refresh Match highlighter, Explainer details, and Code generation templates
    syncHighlighter();
    updateExplainer();
    updateCodeGenerator();
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Visual Block Card Builders ---
  function renderBlocksList() {
    blocksContainer.innerHTML = '';
    state.blocks.forEach((block, idx) => {
      const card = createBlockCard(block, idx);
      blocksContainer.appendChild(card);
    });
    updateExplainer();
  }

  function createBlockCard(block, index) {
    const card = document.createElement('div');
    card.className = 'builder-block-card';

    // Header row
    const header = document.createElement('div');
    header.className = 'block-card-header';
    
    const title = document.createElement('div');
    title.className = 'block-card-title';
    
    let typeIcon = 'fa-quote-left';
    let typeName = 'Text Literal';
    let monoHint = block.value;

    if (block.type === 'digit') { typeIcon = 'fa-arrow-down-1-9'; typeName = 'Digit'; monoHint = '\\d'; }
    else if (block.type === 'word') { typeIcon = 'fa-font'; typeName = 'Word Char'; monoHint = '\\w'; }
    else if (block.type === 'space') { typeIcon = 'fa-arrows-left-right'; typeName = 'Whitespace'; monoHint = '\\s'; }
    else if (block.type === 'any') { typeIcon = 'fa-circle'; typeName = 'Any Char'; monoHint = '.'; }
    else if (block.type === 'range') { typeIcon = 'fa-brackets-square'; typeName = 'Custom Range'; monoHint = `[${block.value || ' '}]`; }

    title.innerHTML = `<i class="fa-solid ${typeIcon}"></i> ${typeName} <span class="mono-hint">${monoHint}</span>`;
    header.appendChild(title);

    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'btn-delete-block';
    btnDelete.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    btnDelete.addEventListener('click', () => {
      state.blocks.splice(index, 1);
      renderBlocksList();
      compileRegexFromBlocks();
    });
    header.appendChild(btnDelete);
    card.appendChild(header);

    // Body Inputs controls row
    const body = document.createElement('div');
    body.className = 'block-card-body';

    // 1. Value inputs for text/range
    if (block.type === 'literal' || block.type === 'range') {
      const field = document.createElement('div');
      field.className = 'block-field';
      
      const lbl = document.createElement('label');
      lbl.textContent = block.type === 'literal' ? 'Match text:' : 'Range match:';
      field.appendChild(lbl);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'block-input';
      input.value = block.value;
      input.placeholder = block.type === 'literal' ? 'e.g. abc' : 'e.g. a-z0-9';
      
      input.addEventListener('input', (e) => {
        block.value = e.target.value;
        card.querySelector('.mono-hint').textContent = block.type === 'literal' ? e.target.value : `[${e.target.value}]`;
        compileRegexFromBlocks();
      });

      field.appendChild(input);
      body.appendChild(field);
    }

    // 2. Multiplier Quantifier selector dropdown
    const quantField = document.createElement('div');
    quantField.className = 'block-field';
    quantField.innerHTML = `<label>Repeat:</label>`;

    const select = document.createElement('select');
    select.className = 'block-select';
    
    const options = [
      { val: '1', text: 'Exactly once' },
      { val: '?', text: 'Zero or once (Optional ?)' },
      { val: '+', text: 'One or more times (+)' },
      { val: '*', text: 'Zero or more times (*)' },
      { val: '{n}', text: 'Custom count {n}' },
      { val: '{min,max}', text: 'Count Range {min,max}' }
    ];

    options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.val;
      opt.textContent = o.text;
      if (block.quantifier === o.val) opt.selected = true;
      select.appendChild(opt);
    });

    // Custom limit parameter boxes
    const numMin = document.createElement('input');
    numMin.type = 'number';
    numMin.className = 'block-input hidden';
    numMin.style.width = '50px';
    numMin.min = 0;
    numMin.value = block.min;

    const numMax = document.createElement('input');
    numMax.type = 'number';
    numMax.className = 'block-input hidden';
    numMax.style.width = '50px';
    numMax.min = 0;
    numMax.value = block.max;

    const toggleLimitInputs = (val) => {
      if (val === '{n}') {
        numMin.classList.remove('hidden');
        numMax.classList.add('hidden');
      } else if (val === '{min,max}') {
        numMin.classList.remove('hidden');
        numMax.classList.remove('hidden');
      } else {
        numMin.classList.add('hidden');
        numMax.classList.add('hidden');
      }
    };

    toggleLimitInputs(block.quantifier);

    select.addEventListener('change', (e) => {
      block.quantifier = e.target.value;
      toggleLimitInputs(e.target.value);
      compileRegexFromBlocks();
    });

    numMin.addEventListener('input', (e) => {
      block.min = parseInt(e.target.value, 10) || 0;
      compileRegexFromBlocks();
    });

    numMax.addEventListener('input', (e) => {
      block.max = e.target.value === '' ? '' : (parseInt(e.target.value, 10) || 0);
      compileRegexFromBlocks();
    });

    quantField.appendChild(select);
    quantField.appendChild(numMin);
    quantField.appendChild(numMax);
    body.appendChild(quantField);

    // 3. Group Capture checkbox
    const groupField = document.createElement('label');
    groupField.className = 'block-checkbox-label';
    groupField.innerHTML = `<input type="checkbox"> Capture Group`;
    
    const chk = groupField.querySelector('input');
    chk.checked = block.isCaptureGroup;
    chk.addEventListener('change', (e) => {
      block.isCaptureGroup = e.target.checked;
      compileRegexFromBlocks();
    });

    body.appendChild(groupField);
    card.appendChild(body);

    return card;
  }

  // Quick Add Block triggers
  btnBlockAdds.forEach(button => {
    button.addEventListener('click', () => {
      const type = button.getAttribute('data-block-type');
      
      const newBlock = {
        id: Date.now() + Math.random(),
        type: type,
        value: type === 'literal' ? 'text' : (type === 'range' ? 'a-z' : ''),
        quantifier: '1',
        min: 1,
        max: 1,
        isCaptureGroup: false
      };

      state.blocks.push(newBlock);
      renderBlocksList();
      compileRegexFromBlocks();
    });
  });

  // --- Regex Explainer Nodes ---
  function updateExplainer() {
    explainerContainer.innerHTML = '';
    if (state.blocks.length === 0) {
      explainerContainer.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No blocks to explain. Add blocks or choose presets to translate logic.</div>`;
      return;
    }

    state.blocks.forEach(block => {
      const item = document.createElement('div');
      item.className = 'explainer-item';

      const token = document.createElement('span');
      token.className = 'explainer-token';

      let explanation = '';
      let repeatText = 'exactly once';

      if (block.quantifier === '?') repeatText = 'zero or one time (optional)';
      else if (block.quantifier === '+') repeatText = 'one or more times';
      else if (block.quantifier === '*') repeatText = 'zero or more times';
      else if (block.quantifier === '{n}') repeatText = `exactly ${block.min} times`;
      else if (block.quantifier === '{min,max}') {
        repeatText = `between ${block.min} and ${block.max || 'infinity'} times`;
      }

      switch (block.type) {
        case 'literal':
          token.textContent = block.value || '" "';
          explanation = `Matches the exact literal text string "${block.value}" (${repeatText}).`;
          break;
        case 'digit':
          token.textContent = '\\d';
          explanation = `Matches any numeric decimal digit character [0-9] (${repeatText}).`;
          break;
        case 'word':
          token.textContent = '\\w';
          explanation = `Matches any standard alphanumeric word character (a-z, A-Z, 0-9, and underscore) (${repeatText}).`;
          break;
        case 'space':
          token.textContent = '\\s';
          explanation = `Matches any standard whitespace formatting characters (space, tabs, carriage returns) (${repeatText}).`;
          break;
        case 'any':
          token.textContent = '.';
          explanation = `Matches any single character except standard newline breaks (${repeatText}).`;
          break;
        case 'range':
          token.textContent = `[${block.value}]`;
          explanation = `Matches any character inside the character ranges list [${block.value}] (${repeatText}).`;
          break;
      }

      if (block.isCaptureGroup) {
        explanation += ` Wraps matching offsets inside a Capture Group to extract sub-matches.`;
      }

      item.appendChild(token);
      
      const txt = document.createElement('span');
      txt.className = 'explainer-text';
      txt.textContent = explanation;
      item.appendChild(txt);

      explainerContainer.appendChild(item);
    });
  }

  // --- Language Code Generators ---
  function updateCodeGenerator() {
    const rawPattern = regexPatternInput.value;
    const flags = state.flags;
    const lang = state.activeLang;
    
    // Safety check
    if (!rawPattern) {
      codeSnippetBody.textContent = '// Compile a regex to generate target code segments.';
      return;
    }

    let snippet = '';

    if (lang === 'js') {
      snippet = `// JavaScript Regex Matcher
const regex = /${rawPattern}/${flags};
const text = "Your target test text...";

${flags.includes('g') ? `let match;
while ((match = regex.exec(text)) !== null) {
  console.log(\`Match "\${match[0]}" at index \${match.index}\`);
}` : `const match = regex.exec(text);
if (match) {
  console.log(\`Match "\${match[0]}" at index \${match.index}\`);
}`}
`;
    } else if (lang === 'python') {
      const pyFlags = [];
      if (flags.includes('i')) pyFlags.push('re.IGNORECASE');
      if (flags.includes('m')) pyFlags.push('re.MULTILINE');
      if (flags.includes('s')) pyFlags.push('re.DOTALL');
      const flagParam = pyFlags.length > 0 ? `, ${pyFlags.join(' | ')}` : '';

      snippet = `# Python Regex Matcher
import re

pattern = r"${rawPattern}"
text = "Your target test text..."

matches = re.finditer(pattern, text${flagParam})
for match in matches:
    print(f"Match: {match.group(0)} at index {match.start()}")
`;
    } else if (lang === 'go') {
      snippet = `// Go Regex Matcher
package main

import (
\t"fmt"
\t"regexp"
)

func main() {
\t// Note: Go regexp uses RE2 syntax. Flags aren't passed like JS.
\tre := regexp.MustCompile(\`${rawPattern}\`)
\ttext := "Your target test text..."
\t
\tmatches := re.FindAllStringIndex(text, -1)
\tfor _, m := range matches {
\t\tfmt.Printf("Match: %s at %d\\n", text[m[0]:m[1]], m[0])
\t}
}
`;
    } else if (lang === 'php') {
      snippet = `<?php
// PHP preg_match Matcher
$pattern = '/${rawPattern}/${flags}';
$text = 'Your target test text...';

if (preg_match_all($pattern, $text, $matches, PREG_OFFSET_CAPTURE)) {
    foreach ($matches[0] as $match) {
        echo "Match: " . $match[0] . " at index " . $match[1] . "\\n";
    }
}
?>
`;
    }

    codeSnippetBody.textContent = snippet;
  }

  // Cheatsheet click injector
  function insertCheatsheetToken(token) {
    // Determine block representation
    let type = 'literal';
    let val = token;
    let isGroup = false;

    if (token === '\\d') { type = 'digit'; val = ''; }
    else if (token === '\\w') { type = 'word'; val = ''; }
    else if (token === '\\s') { type = 'space'; val = ''; }
    else if (token === '.') { type = 'any'; val = ''; }
    else if (token.startsWith('[') && token.endsWith(']')) {
      type = 'range';
      val = token.slice(1, -1);
    } else if (token === '(...)') {
      type = 'word';
      val = '';
      isGroup = true;
    }

    const newBlock = {
      id: Date.now() + Math.random(),
      type: type,
      value: val,
      quantifier: '1',
      min: 1,
      max: 1,
      isCaptureGroup: isGroup
    };

    state.blocks.push(newBlock);
    renderBlocksList();
    compileRegexFromBlocks();
  }

  // --- Event Listeners ---

  // Textarea input triggers sync
  playgroundTextarea.addEventListener('input', () => {
    syncHighlighter();
  });

  // Textarea scroll offset syncing
  playgroundTextarea.addEventListener('scroll', () => {
    playgroundBackdrop.scrollTop = playgroundTextarea.scrollTop;
    playgroundBackdrop.scrollLeft = playgroundTextarea.scrollLeft;
  });

  // Manual regex patterns input change overrides blocks
  regexPatternInput.addEventListener('input', (e) => {
    if (state.isUpdatingPattern) return;
    state.isUpdatingPattern = true;

    // Reset blocks and explainer to avoid syncing anomalies
    state.blocks = [];
    renderBlocksList();
    
    // Add raw pattern
    state.patternString = e.target.value;
    
    state.isUpdatingPattern = false;

    // Rebuild lists
    syncHighlighter();
    updateCodeGenerator();
  });

  // Checkboxes flags hooks
  [flagG, flagI, flagM, flagS].forEach(chk => {
    chk.addEventListener('change', () => {
      syncHighlighter();
      updateCodeGenerator();
    });
  });

  // Replace textboxes events hooks
  replaceStringInput.addEventListener('input', () => {
    syncHighlighter();
  });

  // Presets load changes
  selectPreset.addEventListener('change', (e) => {
    if (e.target.value !== 'custom') {
      loadPreset(e.target.value);
    }
  });

  // Sidebar Tab Switching
  sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sidebarTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const val = tab.getAttribute('data-side-tab');
      state.activeSidebarTab = val;

      if (val === 'cheatsheet') {
        paneCheatsheet.classList.add('active');
        paneCodegen.classList.remove('active');
      } else {
        paneCheatsheet.classList.remove('active');
        paneCodegen.classList.add('active');
        updateCodeGenerator();
      }
    });
  });

  // CodeGen Language tabs triggers
  langTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      langTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      state.activeLang = tab.getAttribute('data-lang');
      updateCodeGenerator();
    });
  });

  // Clipboard copies
  btnCopyPattern.addEventListener('click', () => {
    const pattern = regexPatternInput.value;
    if (!pattern) return;
    navigator.clipboard.writeText(`/${pattern}/${state.flags}`).then(() => {
      const icon = btnCopyPattern.querySelector('i');
      icon.className = 'fa-solid fa-check text-success';
      setTimeout(() => {
        icon.className = 'fa-solid fa-copy';
      }, 1500);
    });
  });

  btnCopyCode.addEventListener('click', () => {
    const rawCode = codeSnippetBody.textContent;
    if (!rawCode) return;
    navigator.clipboard.writeText(rawCode).then(() => {
      const originalText = btnCopyCode.innerHTML;
      btnCopyCode.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
      setTimeout(() => {
        btnCopyCode.innerHTML = originalText;
      }, 1500);
    });
  });

  btnClearBlocks.addEventListener('click', () => {
    state.blocks = [];
    regexPatternInput.value = '';
    renderBlocksList();
    compileRegexFromBlocks();
  });

  // Start app
  init();
});
