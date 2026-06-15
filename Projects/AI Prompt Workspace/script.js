(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── PROMPT DATABASE ─── */
  const DEFAULT_PROMPTS = [
    { id: 'p1', title: 'Web Code Generator', category: 'development', text: 'Generate a {{language}} web component that {{functionality}}. Include {{framework}} best practices, responsive styling with {{css_approach}}, and error handling for edge cases.', favorite: false, tags: ['code', 'web', 'generator'] },
    { id: 'p2', title: 'Figma Layout Generator', category: 'ui-ux', text: 'Create a Figma design system for {{app_name}} targeting {{platform}}. The layout should include {{component_list}} with a {{color_scheme}} palette and {{typography_style}} typography.', favorite: false, tags: ['figma', 'design', 'ui'] },
    { id: 'p3', title: 'API Architecture Blueprint', category: 'architecture', text: 'Design a {{protocol}} API for {{service_name}} with {{auth_method}} authentication. Support {{feature_list}} with rate limiting of {{rate_limit}} requests per minute. Include caching via {{cache_strategy}}.', favorite: false, tags: ['api', 'architecture', 'backend'] },
    { id: 'p4', title: 'Data Pipeline Orchestrator', category: 'data-science', text: 'Build a data pipeline that ingests from {{source}} and transforms using {{transform_tool}}. Output to {{destination}} with {{validation_method}} validation. Schedule via {{scheduler}} with {{frequency}} frequency.', favorite: false, tags: ['data', 'pipeline', 'etl'] },
    { id: 'p5', title: 'React Component Builder', category: 'development', text: 'Create a React component for {{component_name}} using {{hooks}} hooks. It should handle {{states}} states and integrate with {{api_endpoint}}. Style with {{styling_solution}} and include {{testing_tool}} tests.', favorite: false, tags: ['react', 'component', 'frontend'] },
    { id: 'p6', title: 'System Migration Strategy', category: 'architecture', text: 'Plan a migration from {{source_system}} to {{target_system}}. The strategy must cover {{downtime}} downtime, {{data_volume}} data volume, {{rollback_strategy}} rollback, and {{validation_steps}} validation steps.', favorite: false, tags: ['migration', 'strategy', 'devops'] }
  ];

  /* ─── STORAGE KEYS ─── */
  const STORAGE_KEY = 'ai_prompt_workspace_data';

  function loadPrompts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_PROMPTS));
  }

  function savePrompts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch (e) { /* ignore */ }
  }

  let prompts = loadPrompts();

  /* ─── DOM REFS ─── */
  const searchInput = $('#searchInput');
  const categorySelect = $('#categorySelect');
  const cardsGrid = $('#cardsGrid');
  const resultCount = $('#resultCount');
  const inspectorContent = $('#inspectorContent');
  const tTokens = $('#tTokens');
  const tChars = $('#tChars');
  const tStarred = $('#tStarred');
  const tCategory = $('#tCategory');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const btnNewPrompt = $('#btnNewPrompt');
  const btnAnalyze = $('#btnAnalyze');
  const btnTemplate = $('#btnTemplate');
  const btnFlush = $('#btnFlush');

  /* ─── STATE ─── */
  let selectedId = null;

  /* ─── RENDER ─── */
  function render() {
    const query = searchInput.value.toLowerCase();
    const cat = categorySelect.value;

    const filtered = prompts.filter(p => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (query) {
        return p.title.toLowerCase().includes(query) ||
               p.text.toLowerCase().includes(query) ||
               p.tags.some(t => t.toLowerCase().includes(query));
      }
      return true;
    });

    cardsGrid.innerHTML = '';
    resultCount.textContent = filtered.length;

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'pcard' + (p.id === selectedId ? ' selected' : '');
      card.dataset.id = p.id;
      card.innerHTML =
        '<div class="pcard-title">' + escapeHTML(p.title) + '</div>' +
        '<div class="pcard-text">' + escapeHTML(p.text) + '</div>' +
        '<div class="pcard-footer">' +
        '<span class="pcard-cat">' + catLabel(p.category) + '</span>' +
        '<button class="pcard-star' + (p.favorite ? ' active' : '') + '">★</button>' +
        '</div>';
      card.addEventListener('click', () => selectPrompt(p.id));
      card.querySelector('.pcard-star').addEventListener('click', (e) => {
        e.stopPropagation();
        p.favorite = !p.favorite;
        savePrompts();
        render();
        updateTelemetry();
      });
      cardsGrid.appendChild(card);
    });

    if (filtered.length === 0) {
      cardsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2em;color:rgba(255,255,255,0.04);font-size:clamp(6px,0.65vmin,9px)">NO PROMPTS FOUND</div>';
    }

    updateTelemetry();
  }

  /* ─── SELECT PROMPT ─── */
  function selectPrompt(id) {
    selectedId = id;
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    renderInspector(prompt);
    render();
  }

  /* ─── INSPECTOR ─── */
  function renderInspector(prompt) {
    const vars = extractVariables(prompt.text);
    let varHtml = '';
    let previewText = prompt.text;

    vars.forEach(v => {
      const currentVal = prompt._values && prompt._values[v] ? prompt._values[v] : '';
      varHtml += '<div class="ins-var-row">' +
        '<span class="ins-var-label">{{' + v + '}}</span>' +
        '<input type="text" class="ins-var-input" data-var="' + v + '" value="' + escapeHTML(currentVal) + '" placeholder="Enter ' + v + '...">' +
        '</div>';
    });

    /* build preview with current values */
    if (prompt._values) {
      for (const [k, v] of Object.entries(prompt._values)) {
        if (v) previewText = previewText.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), v);
      }
    }

    inspectorContent.innerHTML =
      '<div class="ins-title">' + escapeHTML(prompt.title) + '</div>' +
      '<div class="ins-cat-tag">' + catLabel(prompt.category) + ' | ' + prompt.tags.map(t => '#' + t).join(' ') + '</div>' +
      '<div class="ins-section-label">PROMPT TEXT</div>' +
      '<div class="ins-prompt-box">' + escapeHTML(prompt.text) + '</div>' +
      (vars.length ? '<div class="ins-section-label">VARIABLE PLACEHOLDERS</div>' + varHtml : '<div style="font-size:clamp(5px,0.5vmin,7px);color:rgba(255,255,255,0.04)">No variables found in this prompt.</div>') +
      '<div class="ins-section-label">COMPILED PREVIEW</div>' +
      '<div class="ins-preview" id="compiledPreview">' + escapeHTML(previewText) + '</div>';

    /* bind variable inputs */
    $$('.ins-var-input').forEach(input => {
      input.addEventListener('input', () => {
        const v = input.dataset.var;
        if (!prompt._values) prompt._values = {};
        prompt._values[v] = input.value;

        /* rebuild preview */
        let text = prompt.text;
        if (prompt._values) {
          for (const [k, val] of Object.entries(prompt._values)) {
            if (val) text = text.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), val);
            else text = text.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), '{{' + k + '}}');
          }
        }
        document.getElementById('compiledPreview').textContent = text;

        updateTelemetryForText(text);
      });
    });

    updateTelemetryForPrompt(prompt);
  }

  /* ─── VARIABLE EXTRACTOR ─── */
  function extractVariables(text) {
    const regex = /\{\{(\w+)\}\}/g;
    const vars = [];
    let m;
    while ((m = regex.exec(text)) !== null) {
      if (!vars.includes(m[1])) vars.push(m[1]);
    }
    return vars;
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry() {
    const starred = prompts.filter(p => p.favorite).length;
    tStarred.textContent = starred;

    const selected = prompts.find(p => p.id === selectedId);
    if (selected) {
      updateTelemetryForPrompt(selected);
    } else {
      tTokens.textContent = '--';
      tChars.textContent = '--';
      tCategory.textContent = '--';
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'STANDBY';
    }
  }

  function updateTelemetryForPrompt(prompt) {
    const chars = prompt.text.length;
    const words = prompt.text.split(/\s+/).length;
    const tokens = Math.ceil(chars / 3.8);
    tTokens.textContent = tokens;
    tChars.textContent = chars + 'c / ' + words + 'w';
    tCategory.textContent = catLabel(prompt.category);
    /* model suitability */
    if (tokens > 4000) {
      tBadge.className = 'tele-badge warn';
      tBadge.textContent = '[ LLM PROFILE: LONG-CONTEXT BUFFER REQUIRED ]';
    } else if (tokens > 1000) {
      tBadge.className = 'tele-badge active';
      tBadge.textContent = '[ LLM PROFILE: STANDARD CONTEXT MODEL SUITABLE ]';
    } else {
      tBadge.className = 'tele-badge success';
      tBadge.textContent = '[ LLM PROFILE: CONCISE — HIGH PERFORMANCE ]';
    }
  }

  function updateTelemetryForText(text) {
    const chars = text.length;
    const words = text.split(/\s+/).length;
    const tokens = Math.ceil(chars / 3.8);
    tTokens.textContent = tokens;
    tChars.textContent = chars + 'c / ' + words + 'w';
    if (tokens > 4000) {
      tBadge.className = 'tele-badge warn';
      tBadge.textContent = '[ LLM PROFILE: LONG-CONTEXT BUFFER REQUIRED ]';
    } else if (tokens > 1000) {
      tBadge.className = 'tele-badge active';
      tBadge.textContent = '[ LLM PROFILE: STANDARD CONTEXT MODEL SUITABLE ]';
    } else {
      tBadge.className = 'tele-badge success';
      tBadge.textContent = '[ LLM PROFILE: CONCISE — HIGH PERFORMANCE ]';
    }
  }

  /* ─── NEW PROMPT ─── */
  function createPrompt() {
    const id = 'p' + Date.now();
    prompts.push({
      id: id,
      title: 'New Prompt',
      category: 'development',
      text: 'Write a {{task}} for {{context}} with {{constraints}}.',
      favorite: false,
      tags: ['new']
    });
    savePrompts();
    render();
    selectPrompt(id);
  }

  /* ─── ANALYZE ─── */
  function analyzeTokens() {
    const totalTokens = prompts.reduce((sum, p) => sum + Math.ceil(p.text.length / 3.8), 0);
    const totalChars = prompts.reduce((sum, p) => sum + p.text.length, 0);
    tTokens.textContent = totalTokens;
    tChars.textContent = totalChars + 'c';
    tBadge.className = 'tele-badge active';
    tBadge.textContent = '[ TOKEN VOLUME: ' + totalTokens + ' TOKENS ACROSS ' + prompts.length + ' PROMPTS ]';
  }

  /* ─── TEMPLATE ─── */
  const TEMPLATE = {
    id: 'template',
    title: 'Multi-Stage Optimization Pipeline',
    category: 'architecture',
    text: 'Design a {{stage_count}}-stage pipeline for {{workload_type}} processing. Stage 1: {{stage_1}} using {{tool_1}}. Stage 2: {{stage_2}} validated by {{validation_method}}. Stage 3: {{stage_3}} with {{optimization_goal}} optimization. Deploy on {{infrastructure}} with {{scaling_policy}} scaling.',
    favorite: false,
    tags: ['pipeline', 'optimization', 'multi-stage']
  };

  function injectTemplate() {
    prompts.push(TEMPLATE);
    savePrompts();
    render();
    selectPrompt(TEMPLATE.id);
    tBadge.className = 'tele-badge success';
    tBadge.textContent = '[ COMPLEX OPTIMIZATION TEMPLATE INJECTED ]';
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    prompts = JSON.parse(JSON.stringify(DEFAULT_PROMPTS));
    selectedId = null;
    searchInput.value = '';
    categorySelect.value = 'all';
    savePrompts();
    render();
    inspectorContent.innerHTML = '<div class="inspector-empty">SELECT A PROMPT TO INSPECT</div>';
    tTokens.textContent = '--';
    tChars.textContent = '--';
    tStarred.textContent = '--';
    tCategory.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
  }

  /* ─── HELPERS ─── */
  function catLabel(cat) {
    const labels = { 'development': 'DEV', 'architecture': 'ARCH', 'ui-ux': 'UI/UX', 'data-science': 'DATA' };
    return labels[cat] || cat.toUpperCase();
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── EVENTS ─── */
  searchInput.addEventListener('input', render);
  categorySelect.addEventListener('change', render);
  btnNewPrompt.addEventListener('click', createPrompt);
  btnAnalyze.addEventListener('click', analyzeTokens);
  btnTemplate.addEventListener('click', injectTemplate);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
