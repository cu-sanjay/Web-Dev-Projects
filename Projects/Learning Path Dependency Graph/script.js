(function () {
  'use strict';

  const TOPICS = [
    { id: 'html', label: 'HTML', icon: '🌐', tier: 1, description: 'Structure web pages with semantic HTML5 elements, forms, and accessibility attributes.', prereqs: [] },
    { id: 'css', label: 'CSS', icon: '🎨', tier: 1, description: 'Style web pages with layouts (Flexbox, Grid), responsive design, and animations.', prereqs: [] },
    { id: 'git', label: 'Git Basics', icon: '📦', tier: 1, description: 'Version control fundamentals: commits, branches, merges, and remote repositories.', prereqs: [] },
    { id: 'js', label: 'JavaScript', icon: '⚡', tier: 2, description: 'Core language: variables, functions, closures, promises, async/await, and ES6+ features.', prereqs: ['html'] },
    { id: 'dom', label: 'DOM', icon: '🖥️', tier: 3, description: 'Manipulate the DOM, handle events, and build interactive user interfaces.', prereqs: ['html', 'js'] },
    { id: 'node', label: 'Node.js', icon: '🟢', tier: 3, description: 'Server-side JavaScript: modules, file system, streams, Express, and REST APIs.', prereqs: ['js', 'git'] },
    { id: 'react', label: 'React', icon: '⚛️', tier: 4, description: 'Component-based UI: hooks, state management, routing, and performance optimization.', prereqs: ['dom', 'js'] },
    { id: 'express', label: 'Express', icon: '🚂', tier: 4, description: 'Web framework for Node.js: middleware, routing, error handling, and authentication.', prereqs: ['node'] },
    { id: 'sql', label: 'Databases', icon: '🗄️', tier: 4, description: 'Relational (PostgreSQL) and NoSQL (MongoDB) databases, queries, and ORMs.', prereqs: ['node'] },
    { id: 'fullstack', label: 'Full Stack', icon: '🏗️', tier: 5, description: 'Combine frontend and backend into production applications with auth, deployment, and testing.', prereqs: ['react', 'express', 'sql'] },
    { id: 'testing', label: 'Testing', icon: '🧪', tier: 5, description: 'Unit, integration, and e2e testing with Jest, React Testing Library, and Cypress.', prereqs: ['react', 'express'] },
    { id: 'deploy', label: 'Deployment', icon: '🚀', tier: 5, description: 'CI/CD pipelines, cloud hosting (AWS/Vercel), Docker, and monitoring.', prereqs: ['fullstack', 'testing'] }
  ];

  const state = {
    completed: [],
    selected: null
  };

  const $ = (id) => document.getElementById(id);

  const dom = {
    progressFill: $('progress-fill'),
    progressPct: $('progress-pct'),
    completedCount: $('completed-count'),
    totalCount: $('total-count'),
    detailHeader: $('detail-header'),
    detailBody: $('detail-body'),
    btnComplete: $('btn-complete'),
    btnReset: $('btn-reset'),
    graphSvg: $('graph-svg'),
    nodeLayer: $('node-layer')
  };

  function getState() { return dom.completedCount; }

  function computeTierPositions() {
    const tiers = [...new Set(TOPICS.map(t => t.tier))].sort();
    const positions = [];
    for (const t of tiers) {
      const nodes = TOPICS.filter(n => n.tier === t);
      positions.push({ tier: t, count: nodes.length });
    }
    return positions;
  }

  function layoutNodes(containerWidth, containerHeight) {
    const tiers = [...new Set(TOPICS.map(t => t.tier))].sort();
    const tierCounts = tiers.map(t => TOPICS.filter(n => n.tier === t).length);
    const maxInTier = Math.max(...tierCounts);

    const marginX = 80;
    const marginY = 70;
    const nodeW = 120;
    const nodeH = 56;

    const positions = {};

    for (const t of tiers) {
      const nodes = TOPICS.filter(n => n.tier === t);
      const count = nodes.length;
      const spacingY = (containerHeight - marginY * 2) / (count + 1);
      const spacingX = (containerWidth - marginX * 2) / (tiers.length);

      for (let i = 0; i < nodes.length; i++) {
        const x = marginX + (t - 1) * spacingX + spacingX / 2;
        const y = marginY + (i + 0.5) * ((containerHeight - marginY * 2) / count);
        positions[nodes[i].id] = { x, y };
      }
    }

    return positions;
  }

  let nodePositions = {};
  let selectedId = null;

  function renderGraph() {
    const container = dom.graphContainer || document.querySelector('.graph-container');
    const rect = container.getBoundingClientRect();
    const width = rect.width || 900;
    const height = rect.height || 500;

    nodePositions = layoutNodes(width, height);

    const svg = dom.graphSvg;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

    let edgesHtml = '';
    for (const topic of TOPICS) {
      for (const prereq of topic.prereqs) {
        const from = nodePositions[prereq];
        const to = nodePositions[topic.id];
        if (!from || !to) continue;
        const completed = state.completed.includes(prereq);
        edgesHtml += '<line class="graph-edge ' + (completed ? 'active' : 'pending') + '" ' +
          'x1="' + from.x + '" y1="' + from.y + '" x2="' + to.x + '" y2="' + to.y + '" ' +
          'marker-end="url(#arrowhead' + (completed ? '-active' : '') + ')" />';
      }
    }
    svg.innerHTML = svg.innerHTML.split('<defs')[0] + '<defs>' + svg.querySelector('defs').innerHTML + '</defs>' + edgesHtml;

    let nodesHtml = '';
    for (const topic of TOPICS) {
      const pos = nodePositions[topic.id];
      if (!pos) continue;
      const isCompleted = state.completed.includes(topic.id);
      const isUnlocked = canUnlock(topic);
      const isLocked = !isCompleted && !isUnlocked;
      const stateClass = isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked';
      nodesHtml += '<div class="graph-node state-' + stateClass + '" data-id="' + topic.id + '" tabindex="0" role="button" aria-label="' + topic.label + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px">' +
        '<span class="node-icon">' + topic.icon + '</span>' +
        '<span class="node-label">' + topic.label + '</span>' +
        '<span class="node-status">' + (isCompleted ? '✓ Done' : isUnlocked ? 'Available' : '🔒') + '</span></div>';
    }
    dom.nodeLayer.innerHTML = nodesHtml;

    dom.nodeLayer.querySelectorAll('.graph-node').forEach(el => {
      el.addEventListener('click', function () { selectNode(this.dataset.id); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectNode(this.dataset.id); } });
    });
  }

  function canUnlock(topic) {
    if (topic.prereqs.length === 0) return true;
    return topic.prereqs.every(p => state.completed.includes(p));
  }

  function selectNode(id) {
    const topic = TOPICS.find(t => t.id === id);
    if (!topic) return;
    selectedId = id;
    const isCompleted = state.completed.includes(id);
    const isUnlocked = canUnlock(topic);
    const isLocked = !isCompleted && !isUnlocked;

    dom.detailHeader.textContent = topic.icon + ' ' + topic.label;

    let html = '<p>' + topic.description + '</p>';
    html += '<p style="margin-top:6px;color:var(--text-muted);font-size:11px">Tier ' + topic.tier + ' · ' + topic.prereqs.length + ' prerequisite(s)</p>';

    if (topic.prereqs.length > 0) {
      html += '<div class="detail-prereq"><strong style="font-size:11px;color:var(--text-secondary)">Prerequisites:</strong><br>';
      for (const p of topic.prereqs) {
        const met = state.completed.includes(p);
        const pTopic = TOPICS.find(t => t.id === p);
        html += '<span class="' + (met ? 'met' : '') + '">' + (met ? '✓ ' : '✗ ') + (pTopic ? pTopic.label : p) + '</span>';
      }
      html += '</div>';
    }

    dom.detailBody.innerHTML = html;

    if (isLocked) {
      dom.btnComplete.disabled = true;
      dom.btnComplete.textContent = 'Locked — Complete Prerequisites';
    } else if (isCompleted) {
      dom.btnComplete.disabled = true;
      dom.btnComplete.textContent = '✓ Completed';
    } else {
      dom.btnComplete.disabled = false;
      dom.btnComplete.textContent = 'Mark Complete';
    }
  }

  function completeTopic() {
    if (!selectedId) return;
    if (state.completed.includes(selectedId)) return;
    const topic = TOPICS.find(t => t.id === selectedId);
    if (!topic || !canUnlock(topic)) return;

    state.completed.push(selectedId);
    saveState();
    updateProgress();
    renderGraph();
    selectNode(selectedId);
  }

  function updateProgress() {
    const total = TOPICS.length;
    const done = state.completed.length;
    const pct = Math.round((done / total) * 100);
    dom.progressFill.style.width = pct + '%';
    dom.progressPct.textContent = pct + '%';
    dom.completedCount.textContent = done;
    dom.totalCount.textContent = total;
  }

  function resetProgress() {
    state.completed = [];
    selectedId = null;
    saveState();
    updateProgress();
    renderGraph();
    dom.detailHeader.textContent = 'Select a topic';
    dom.detailBody.innerHTML = '<p class="detail-placeholder">Click a node on the graph to view details and mark it as complete.</p>';
    dom.btnComplete.disabled = true;
    dom.btnComplete.textContent = 'Mark Complete';
  }

  function saveState() {
    try {
      localStorage.setItem('lpg-completed', JSON.stringify(state.completed));
    } catch (e) {}
  }

  function loadState() {
    try {
      const saved = localStorage.getItem('lpg-completed');
      if (saved) state.completed = JSON.parse(saved);
    } catch (e) {}
  }

  function init() {
    loadState();
    dom.totalCount.textContent = TOPICS.length;
    updateProgress();
    renderGraph();

    dom.btnComplete.addEventListener('click', completeTopic);
    dom.btnReset.addEventListener('click', resetProgress);

    if (TOPICS.length > 0) {
      const first = TOPICS.filter(t => canUnlock(t));
      if (first.length > 0) selectNode(first[0].id);
    }

    window.addEventListener('resize', () => {
      renderGraph();
      if (selectedId) selectNode(selectedId);
    });
  }

  Object.defineProperty(dom, 'graphContainer', {
    get: function() { return document.querySelector('.graph-container'); }
  });

  document.addEventListener('DOMContentLoaded', init);
})();
