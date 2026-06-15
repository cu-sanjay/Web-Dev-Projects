/**
 * GitCommit - Conventional Commits Generator & Validator
 * Vanilla JS logic managing state, compile formats, live validations, and simulated history tree.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let commitState = {
    type: 'feat',
    scope: '',
    subject: '',
    breaking: false,
    breakingDesc: '',
    body: '',
    footer: ''
  };

  let activeTab = 'raw'; // 'raw' | 'shell'
  let commitHistory = [];

  // --- PRESETS DATABASE ---
  const presets = {
    'feat-ui': {
      type: 'feat',
      scope: 'ui',
      subject: 'add dark mode toggle option',
      breaking: false,
      breakingDesc: '',
      body: 'Implemented custom theme context hooks to synchronize dark/light styles from local settings. Preloaded Outfit and Inter typography elements.',
      footer: 'Closes #14'
    },
    'fix-auth': {
      type: 'fix',
      scope: 'auth',
      subject: 'resolve token refresh leak',
      breaking: true,
      breakingDesc: 'oauth request headers now match strict https parameters, altering default credentials validation array.',
      body: 'Fixed local sessionStorage timer leaks where old token refreshes were executing in parallel loops.',
      footer: 'Resolves #98'
    },
    'docs-readme': {
      type: 'docs',
      scope: 'readme',
      subject: 'update installation steps and screenshots',
      breaking: false,
      breakingDesc: '',
      body: 'Added visual diagram nodes mapping virtual directories and instructions on manual build processes.',
      footer: ''
    },
    'perf-query': {
      type: 'perf',
      scope: 'query',
      subject: 'optimize student course search join query',
      breaking: false,
      breakingDesc: '',
      body: 'Replaced recursive array searches with direct hash map indexes, reducing lookup complexity from O(N) to O(1).',
      footer: 'Closes #42'
    }
  };

  // --- SEED HISTORY ---
  const seedCommits = [
    {
      sha: 'b5e2f7a',
      type: 'fix',
      scope: 'auth',
      subject: 'resolve session storage validation leak',
      breaking: false,
      breakingDesc: '',
      body: 'Cleaned up inactive window listeners and bound token refresh queries to active user movements.',
      footer: 'Closes #87',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
      sha: 'a8f9c1d',
      type: 'docs',
      scope: 'readme',
      subject: 'add installation guide',
      breaking: false,
      breakingDesc: '',
      body: 'Documented local setup rules and catalog registration scripts.',
      footer: '',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
    },
    {
      sha: 'd3a4b6e',
      type: 'feat',
      scope: 'core',
      subject: 'initial setup and workspace files',
      breaking: false,
      breakingDesc: '',
      body: 'Created base index layout, styling system design tokens, and git log simulator structures.',
      footer: '',
      timestamp: new Date(Date.now() - 3600000 * 72).toISOString() // 3 days ago
    }
  ];

  // --- DOM ELEMENTS ---
  const form = document.getElementById('commit-form');
  const typeSelect = document.getElementById('commit-type');
  const scopeInput = document.getElementById('commit-scope');
  const subjectInput = document.getElementById('commit-subject');
  const subjectCounter = document.getElementById('subject-counter');
  const breakingCheckbox = document.getElementById('commit-breaking');
  const breakingGroup = document.getElementById('breaking-group');
  const breakingDescText = document.getElementById('breaking-desc');
  const bodyText = document.getElementById('commit-body');
  const footerInput = document.getElementById('commit-footer');
  
  const resetBtn = document.getElementById('reset-btn');
  const themeToggle = document.getElementById('theme-toggle');
  
  const tabRaw = document.getElementById('tab-raw');
  const tabShell = document.getElementById('tab-shell');
  const outputPreview = document.getElementById('output-preview');
  const codePanelTitle = document.getElementById('code-panel-title');
  const copyBtn = document.getElementById('copy-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  // Rules Checklist items
  const ruleType = document.getElementById('rule-type');
  const ruleSubjectLen = document.getElementById('rule-subject-len');
  const ruleSubjectMax = document.getElementById('rule-subject-max');
  const ruleLowercase = document.getElementById('rule-lowercase');
  const rulePeriod = document.getElementById('rule-period');
  const ruleBodySpacing = document.getElementById('rule-body-spacing');
  const overallHealth = document.getElementById('overall-health');

  // History timeline
  const gitTimeline = document.getElementById('git-timeline');
  const commitCountBadge = document.getElementById('commit-count');

  // --- THEME INITIALIZATION ---
  const initTheme = () => {
    const savedTheme = localStorage.getItem('gitcommit_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  };

  const updateThemeIcon = (theme) => {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  };

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('gitcommit_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // --- HISTORY MANAGEMENT ---
  const loadHistory = () => {
    const localData = localStorage.getItem('gitcommit_history');
    if (localData) {
      commitHistory = JSON.parse(localData);
    } else {
      commitHistory = [...seedCommits];
      saveHistory();
    }
    renderHistory();
  };

  const saveHistory = () => {
    localStorage.setItem('gitcommit_history', JSON.stringify(commitHistory));
  };

  const generateSha = () => {
    const chars = '0123456789abcdef';
    let sha = '';
    for (let i = 0; i < 7; i++) {
      sha += chars[Math.floor(Math.random() * 16)];
    }
    return sha;
  };

  const renderHistory = () => {
    gitTimeline.innerHTML = '';
    commitCountBadge.textContent = `${commitHistory.length} commit${commitHistory.length !== 1 ? 's' : ''}`;

    if (commitHistory.length === 0) {
      gitTimeline.innerHTML = `
        <div class="git-empty-state">
          <i class="fa-solid fa-code-branch"></i>
          <p>No commits in history. Fill the form and click "Commit to History".</p>
        </div>
      `;
      return;
    }

    commitHistory.forEach((item, index) => {
      const node = document.createElement('div');
      node.className = `git-node type-${item.type}`;
      node.style.setProperty('--type-color', `var(--type-${item.type}-color)`);
      node.title = 'Click to load this commit into the editor';

      // Time formatting (simple ago)
      const timeStr = formatTimeAgo(new Date(item.timestamp));

      // Subject display
      const scopePart = item.scope ? `(${item.scope})` : '';
      const breakingIndicator = item.breaking ? '!' : '';
      const headerStr = `${item.type}${scopePart}${breakingIndicator}: ${item.subject}`;

      node.innerHTML = `
        <div class="node-meta">
          <div class="node-left">
            <span class="node-sha">${item.sha}</span>
            <span class="node-type type-${item.type}">${item.type}</span>
          </div>
          <span class="node-time">${timeStr}</span>
        </div>
        <div class="node-message">${item.subject}</div>
        ${item.body ? `<div class="node-body">${item.body}</div>` : ''}
      `;

      node.addEventListener('click', () => {
        loadCommitIntoForm(item);
      });

      gitTimeline.appendChild(node);
    });
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) return `${interval}y ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    return 'Just now';
  };

  const loadCommitIntoForm = (item) => {
    typeSelect.value = item.type;
    scopeInput.value = item.scope;
    subjectInput.value = item.subject;
    breakingCheckbox.checked = item.breaking;
    breakingDescText.value = item.breakingDesc;
    bodyText.value = item.body;
    footerInput.value = item.footer;

    // Trigger update
    if (item.breaking) {
      breakingGroup.classList.add('active');
      breakingDescText.required = true;
    } else {
      breakingGroup.classList.remove('active');
      breakingDescText.required = false;
    }

    // Unselect preset triggers styling
    document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));

    updateStateFromInputs();
  };

  // --- STATE AND COMPILER ---
  const updateStateFromInputs = () => {
    commitState = {
      type: typeSelect.value,
      scope: scopeInput.value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, ''),
      subject: subjectInput.value.trim(),
      breaking: breakingCheckbox.checked,
      breakingDesc: breakingDescText.value.trim(),
      body: bodyText.value.trim(),
      footer: footerInput.value.trim()
    };

    // Reflect sanitized scope back to input if edited
    if (scopeInput.value !== commitState.scope && scopeInput.value.slice(-1) !== ' ') {
      // Allow user typing but keep it sanitized
      scopeInput.value = commitState.scope;
    }

    updateSubjectCharCounter();
    validateCommit();
    compileOutput();
  };

  const updateSubjectCharCounter = () => {
    const len = subjectInput.value.length;
    subjectCounter.textContent = `${len} / 50`;
    
    if (len > 72) {
      subjectCounter.className = 'char-counter error';
    } else if (len > 50) {
      subjectCounter.className = 'char-counter warning';
    } else {
      subjectCounter.className = 'char-counter';
    }
  };

  const getCompiledRawMessage = () => {
    const scopePart = commitState.scope ? `(${commitState.scope})` : '';
    const breakingMarker = commitState.breaking ? '!' : '';
    let header = `${commitState.type}${scopePart}${breakingMarker}: ${commitState.subject}`;
    
    let parts = [header];

    if (commitState.body) {
      parts.push(commitState.body);
    }

    let footerParts = [];
    if (commitState.breaking && commitState.breakingDesc) {
      footerParts.push(`BREAKING CHANGE: ${commitState.breakingDesc}`);
    }
    if (commitState.footer) {
      footerParts.push(commitState.footer);
    }

    if (footerParts.length > 0) {
      parts.push(footerParts.join('\n\n'));
    }

    return parts.join('\n\n');
  };

  const getCompiledShellCommand = () => {
    const scopePart = commitState.scope ? `(${commitState.scope})` : '';
    const breakingMarker = commitState.breaking ? '!' : '';
    
    // Header
    const header = `${commitState.type}${scopePart}${breakingMarker}: ${commitState.subject}`;
    
    // Safely escape double quotes
    const escapeShellText = (text) => {
      return text.replace(/"/g, '\\"');
    };

    let cmd = `git commit -m "${escapeShellText(header)}"`;

    if (commitState.body) {
      cmd += ` -m "${escapeShellText(commitState.body)}"`;
    }

    // Footers
    if (commitState.breaking && commitState.breakingDesc) {
      cmd += ` -m "BREAKING CHANGE: ${escapeShellText(commitState.breakingDesc)}"`;
    }
    if (commitState.footer) {
      cmd += ` -m "${escapeShellText(commitState.footer)}"`;
    }

    return cmd;
  };

  const compileOutput = () => {
    if (activeTab === 'raw') {
      outputPreview.textContent = getCompiledRawMessage();
      codePanelTitle.textContent = 'commit.txt';
    } else {
      outputPreview.textContent = getCompiledShellCommand();
      codePanelTitle.textContent = 'terminal.sh';
    }
  };

  // --- REAL-TIME RULES VALIDATOR ---
  const validateCommit = () => {
    let errorsCount = 0;
    let warningsCount = 0;

    const setRuleState = (ruleEl, state) => {
      // state: 'done' | 'warning' | 'error' | 'pending'
      ruleEl.className = `checklist-item ${state}`;
      const icon = ruleEl.querySelector('.check-icon i');
      
      if (state === 'done') {
        icon.className = 'fa-solid fa-circle-check';
      } else if (state === 'warning') {
        icon.className = 'fa-solid fa-triangle-exclamation';
        warningsCount++;
      } else if (state === 'error') {
        icon.className = 'fa-solid fa-circle-xmark';
        errorsCount++;
      } else {
        icon.className = 'fa-regular fa-circle';
      }
    };

    // Rule 1: Commit Type Selected
    if (commitState.type) {
      setRuleState(ruleType, 'done');
    } else {
      setRuleState(ruleType, 'pending');
    }

    // Rule 2 & 3: Subject Length (50 recommended, 72 max)
    const len = commitState.subject.length;
    if (len === 0) {
      setRuleState(ruleSubjectLen, 'pending');
      setRuleState(ruleSubjectMax, 'pending');
    } else {
      if (len <= 50) {
        setRuleState(ruleSubjectLen, 'done');
        setRuleState(ruleSubjectMax, 'done');
      } else if (len <= 72) {
        setRuleState(ruleSubjectLen, 'warning');
        setRuleState(ruleSubjectMax, 'done');
      } else {
        setRuleState(ruleSubjectLen, 'error');
        setRuleState(ruleSubjectMax, 'error');
      }
    }

    // Rule 4: Starts with Lowercase
    if (len === 0) {
      setRuleState(ruleLowercase, 'pending');
    } else {
      const firstChar = commitState.subject.charAt(0);
      if (firstChar >= 'A' && firstChar <= 'Z') {
        setRuleState(ruleLowercase, 'error');
      } else if (/[a-z0-9]/.test(firstChar)) {
        setRuleState(ruleLowercase, 'done');
      } else {
        // e.g. symbols, allow but warn or pass. Let's pass.
        setRuleState(ruleLowercase, 'done');
      }
    }

    // Rule 5: No trailing period
    if (len === 0) {
      setRuleState(rulePeriod, 'pending');
    } else {
      const lastChar = commitState.subject.slice(-1);
      if (['.', '!', '?'].includes(lastChar)) {
        setRuleState(rulePeriod, 'error');
      } else {
        setRuleState(rulePeriod, 'done');
      }
    }

    // Rule 6: Body blank line spacing
    if (commitState.body) {
      setRuleState(ruleBodySpacing, 'done');
    } else {
      setRuleState(ruleBodySpacing, 'pending');
    }

    // Overall Health Badge
    if (len === 0) {
      overallHealth.textContent = 'Drafting';
      overallHealth.className = 'health-status badge-secondary';
    } else if (errorsCount > 0) {
      overallHealth.textContent = 'Errors';
      overallHealth.className = 'health-status badge-danger';
    } else if (warningsCount > 0) {
      overallHealth.textContent = 'Warning';
      overallHealth.className = 'health-status badge-warning';
    } else {
      overallHealth.textContent = 'Passed';
      overallHealth.className = 'health-status badge-success';
    }
  };

  // --- PRESETS LOADING ---
  const applyPreset = (presetName) => {
    const data = presets[presetName];
    if (!data) return;

    typeSelect.value = data.type;
    scopeInput.value = data.scope;
    subjectInput.value = data.subject;
    breakingCheckbox.checked = data.breaking;
    breakingDescText.value = data.breakingDesc;
    bodyText.value = data.body;
    footerInput.value = data.footer;

    if (data.breaking) {
      breakingGroup.classList.add('active');
      breakingDescText.required = true;
    } else {
      breakingGroup.classList.remove('active');
      breakingDescText.required = false;
    }

    updateStateFromInputs();
  };

  document.querySelectorAll('.btn-preset').forEach((button) => {
    button.addEventListener('click', (e) => {
      // Styles active
      document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const presetName = button.getAttribute('data-preset');
      applyPreset(presetName);
    });
  });

  // --- FORM INPUT EVENTS ---
  typeSelect.addEventListener('change', updateStateFromInputs);
  scopeInput.addEventListener('input', updateStateFromInputs);
  subjectInput.addEventListener('input', updateStateFromInputs);
  breakingDescText.addEventListener('input', updateStateFromInputs);
  bodyText.addEventListener('input', updateStateFromInputs);
  footerInput.addEventListener('input', updateStateFromInputs);

  breakingCheckbox.addEventListener('change', () => {
    if (breakingCheckbox.checked) {
      breakingGroup.classList.add('active');
      breakingDescText.required = true;
      // Focus breaking change description
      setTimeout(() => breakingDescText.focus(), 150);
    } else {
      breakingGroup.classList.remove('active');
      breakingDescText.required = false;
      breakingDescText.value = '';
    }
    updateStateFromInputs();
  });

  // --- PREVIEW TAB CONTROLS ---
  tabRaw.addEventListener('click', () => {
    tabRaw.classList.add('active');
    tabShell.classList.remove('active');
    activeTab = 'raw';
    compileOutput();
  });

  tabShell.addEventListener('click', () => {
    tabShell.classList.add('active');
    tabRaw.classList.remove('active');
    activeTab = 'shell';
    compileOutput();
  });

  // --- COPY UTILITY ---
  copyBtn.addEventListener('click', () => {
    const textToCopy = outputPreview.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Success indicator animation
      const originalText = copyBtnText.textContent;
      copyBtnText.textContent = 'Copied!';
      copyBtn.classList.remove('btn-secondary');
      copyBtn.classList.add('btn-primary');
      copyBtn.querySelector('i').className = 'fa-solid fa-check';

      setTimeout(() => {
        copyBtnText.textContent = originalText;
        copyBtn.classList.remove('btn-primary');
        copyBtn.classList.add('btn-secondary');
        copyBtn.querySelector('i').className = 'fa-regular fa-copy';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });

  // --- RESET FORM ---
  resetBtn.addEventListener('click', () => {
    // Reset to defaults
    typeSelect.value = 'feat';
    scopeInput.value = '';
    subjectInput.value = '';
    breakingCheckbox.checked = false;
    breakingDescText.value = '';
    breakingDescText.required = false;
    breakingGroup.classList.remove('active');
    bodyText.value = '';
    footerInput.value = '';

    // Deactivate presets styling
    document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));

    updateStateFromInputs();
  });

  // --- FORM COMMIT TO HISTORY SUBMIT ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check errors
    const errorItems = document.querySelectorAll('.checklist-item.error');
    if (errorItems.length > 0) {
      alert('Please fix validation errors before committing to history.');
      return;
    }

    if (!commitState.subject.trim()) {
      alert('Subject Description is required.');
      return;
    }

    const newCommit = {
      sha: generateSha(),
      type: commitState.type,
      scope: commitState.scope,
      subject: commitState.subject,
      breaking: commitState.breaking,
      breakingDesc: commitState.breakingDesc,
      body: commitState.body,
      footer: commitState.footer,
      timestamp: new Date().toISOString()
    };

    // Prepend to history
    commitHistory.unshift(newCommit);
    saveHistory();
    renderHistory();

    // Flash visual timeline glow feedback
    const firstNode = gitTimeline.firstChild;
    if (firstNode && firstNode.classList) {
      firstNode.classList.add('flash-glow');
      setTimeout(() => firstNode.classList.remove('flash-glow'), 1000);
    }

    // Optional: Clear form except type
    scopeInput.value = '';
    subjectInput.value = '';
    breakingCheckbox.checked = false;
    breakingDescText.value = '';
    breakingDescText.required = false;
    breakingGroup.classList.remove('active');
    bodyText.value = '';
    footerInput.value = '';

    updateStateFromInputs();
  });

  // --- INITIALIZE APPLICATION ---
  initTheme();
  applyPreset('feat-ui'); // Load initial preset default
  loadHistory();
});
