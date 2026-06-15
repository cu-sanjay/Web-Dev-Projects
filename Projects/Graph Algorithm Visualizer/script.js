/**
 * Graph Algorithm Visualizer - Core Logic and UI Controller
 */

// Model structures
class Vertex {
  constructor(id, name, x, y) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
  }
}

class Edge {
  constructor(id, source, target, weight = 1) {
    this.id = id;
    this.source = source; // Vertex object
    this.target = target; // Vertex object
    this.weight = weight;
  }
}

class Graph {
  constructor() {
    this.vertices = new Map(); // id -> Vertex
    this.edges = new Map();    // id -> Edge
    this.isDirected = false;
  }

  clear() {
    this.vertices.clear();
    this.edges.clear();
  }

  addVertex(id, name, x, y) {
    const v = new Vertex(id, name, x, y);
    this.vertices.set(id, v);
    return v;
  }

  removeVertex(id) {
    this.vertices.delete(id);
    // Remove all incident edges
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.source.id === id || edge.target.id === id) {
        this.edges.delete(edgeId);
      }
    }
  }

  addEdge(sourceId, targetId, weight = 1) {
    const source = this.vertices.get(sourceId);
    const target = this.vertices.get(targetId);
    if (!source || !target) return null;

    // Check if edge already exists
    const edgeId = this.getEdgeId(sourceId, targetId);
    if (this.edges.has(edgeId)) {
      this.edges.get(edgeId).weight = weight;
      return this.edges.get(edgeId);
    }

    const e = new Edge(edgeId, source, target, weight);
    this.edges.set(edgeId, e);
    return e;
  }

  removeEdge(sourceId, targetId) {
    const edgeId = this.getEdgeId(sourceId, targetId);
    this.edges.delete(edgeId);
  }

  getEdgeId(u, v) {
    if (this.isDirected) {
      return `edge-${u}-${v}`;
    } else {
      // For undirected, sort IDs so order doesn't matter
      return u < v ? `edge-${u}-${v}` : `edge-${v}-${u}`;
    }
  }

  getNeighbors(vertexId) {
    const neighbors = [];
    for (const edge of this.edges.values()) {
      if (edge.source.id === vertexId) {
        neighbors.push({ vertex: edge.target, weight: edge.weight, edgeId: edge.id });
      } else if (!this.isDirected && edge.target.id === vertexId) {
        neighbors.push({ vertex: edge.source, weight: edge.weight, edgeId: edge.id });
      }
    }
    return neighbors;
  }
}

// Global States
const graph = new Graph();
let nextVertexId = 1;
let activeTool = 'draw'; // 'draw' or 'delete'
let selectedNodeForLink = null;
let dragNode = null;
let isDraggingNode = false;

// SVGPanning & Zooming
let panX = 0;
let panY = 0;
let scale = 1.0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

// Playback queue variables
let animationQueue = [];
let animIndex = -1;
let isPlaying = false;
let playTimeout = null;
let speed = 800;

// DOM Elements
const svgWrapper = document.getElementById('svg-wrapper');
const graphSvg = document.getElementById('graph-svg');
const panGroup = document.getElementById('svg-pan-group');
const edgesGroup = document.getElementById('edges-group');
const nodesGroup = document.getElementById('nodes-group');

const valNodes = document.getElementById('val-nodes');
const valEdges = document.getElementById('val-edges');
const valFrontier = document.getElementById('val-frontier');
const valPathCost = document.getElementById('val-path-cost');
const pathCostLabel = document.getElementById('path-cost-label');
const valStatus = document.getElementById('val-status');

const presetSelect = document.getElementById('preset-select');
const btnSeed = document.getElementById('btn-seed');
const btnTopoUndirected = document.getElementById('btn-topology-undirected');
const btnTopoDirected = document.getElementById('btn-topology-directed');

const btnToolDraw = document.getElementById('btn-tool-draw');
const btnToolDelete = document.getElementById('btn-tool-delete');

const algoSelect = document.getElementById('algo-select');
const startNodeSelect = document.getElementById('start-node-select');
const targetNodeSelect = document.getElementById('target-node-select');
const targetNodeGroup = document.getElementById('target-node-group');

const btnPlay = document.getElementById('btn-play');
const btnStep = document.getElementById('btn-step');
const btnResetAnim = document.getElementById('btn-reset-anim');
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');

const btnThemeToggle = document.getElementById('btn-theme-toggle');
const btnMatrixToggle = document.getElementById('btn-matrix-toggle');
const matrixDrawer = document.getElementById('matrix-drawer');
const btnCloseMatrix = document.getElementById('btn-close-matrix');
const adjacencyMatrixTable = document.getElementById('adjacency-matrix-table');
const btnClearGraph = document.getElementById('btn-clear-graph');

const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnZoomReset = document.getElementById('btn-zoom-reset');

const logBody = document.getElementById('log-body');
const logCounter = document.getElementById('log-counter');
const codeAlgoTitle = document.getElementById('code-algo-title');
const pseudocodeDisplay = document.getElementById('pseudocode-display');

// Pseudocode text maps
const PSEUDOCODE = {
  bfs: [
    { line: 1, text: "procedure BFS(G, start_node):", indent: 0 },
    { line: 2, text: "    let Q be a queue", indent: 0 },
    { line: 3, text: "    Q.enqueue(start_node)", indent: 0 },
    { line: 4, text: "    mark start_node as visiting", indent: 0 },
    { line: 5, text: "    while Q is not empty:", indent: 0 },
    { line: 6, text: "        curr = Q.dequeue()", indent: 0 },
    { line: 7, text: "        mark curr as visited", indent: 0 },
    { line: 8, text: "        for each neighbor n of curr:", indent: 0 },
    { line: 9, text: "            if n is unvisited:", indent: 0 },
    { line: 10, text: "                Q.enqueue(n)", indent: 0 },
    { line: 11, text: "                mark n as visiting", indent: 0 }
  ],
  dfs: [
    { line: 1, text: "procedure DFS(G, curr):", indent: 0 },
    { line: 2, text: "    mark curr as visiting", indent: 0 },
    { line: 3, text: "    for each neighbor n of curr:", indent: 0 },
    { line: 4, text: "        if n is unvisited:", indent: 0 },
    { line: 5, text: "            set n.parent = curr", indent: 0 },
    { line: 6, text: "            DFS(G, n)", indent: 0 },
    { line: 7, text: "    mark curr as visited", indent: 0 }
  ],
  dijkstra: [
    { line: 1, text: "procedure Dijkstra(G, start):", indent: 0 },
    { line: 2, text: "    dist[v] = infinity for all v, dist[start] = 0", indent: 0 },
    { line: 3, text: "    create MinPriorityQueue PQ containing all v", indent: 0 },
    { line: 4, text: "    while PQ is not empty:", indent: 0 },
    { line: 5, text: "        curr = PQ.extractMin()", indent: 0 },
    { line: 6, text: "        mark curr as visited", indent: 0 },
    { line: 7, text: "        for each neighbor n of curr:", indent: 0 },
    { line: 8, text: "            altDist = dist[curr] + weight(curr, n)", indent: 0 },
    { line: 9, text: "            if altDist < dist[n]:", indent: 0 },
    { line: 10, text: "                dist[n] = altDist, set n.parent = curr", indent: 0 },
    { line: 11, text: "                PQ.decreaseKey(n, altDist)", indent: 0 }
  ],
  prim: [
    { line: 1, text: "procedure Prim(G, start):", indent: 0 },
    { line: 2, text: "    key[v] = infinity for all v, key[start] = 0", indent: 0 },
    { line: 3, text: "    create MinPriorityQueue PQ containing all v", indent: 0 },
    { line: 4, text: "    while PQ is not empty:", indent: 0 },
    { line: 5, text: "        curr = PQ.extractMin()", indent: 0 },
    { line: 6, text: "        add edge(curr.parent, curr) to MST", indent: 0 },
    { line: 7, text: "        for each neighbor n of curr:", indent: 0 },
    { line: 8, text: "            if n in PQ and weight(curr, n) < key[n]:", indent: 0 },
    { line: 9, text: "                key[n] = weight(curr, n), parent[n] = curr", indent: 0 },
    { line: 10, text: "                PQ.decreaseKey(n, key[n])", indent: 0 }
  ]
};

// ==========================================
// PRESET GRAPHS INITIALIZATION
// ==========================================
function loadPresetGraph(presetName) {
  graph.clear();
  selectedNodeForLink = null;
  resetAnimation();
  clearLogs();

  const w = svgWrapper.getBoundingClientRect().width || 800;
  const h = svgWrapper.getBoundingClientRect().height || 500;
  const centerX = w / 2;
  const centerY = h / 2;

  switch (presetName) {
    case 'weighted-mesh':
      graph.addVertex(1, '1', centerX - 180, centerY - 100);
      graph.addVertex(2, '2', centerX, centerY - 120);
      graph.addVertex(3, '3', centerX + 180, centerY - 100);
      graph.addVertex(4, '4', centerX - 120, centerY + 80);
      graph.addVertex(5, '5', centerX + 120, centerY + 80);
      graph.addVertex(6, '6', centerX, centerY + 120);
      graph.addVertex(7, '7', centerX, centerY);

      graph.addEdge(1, 2, 4);
      graph.addEdge(1, 4, 6);
      graph.addEdge(1, 7, 3);
      graph.addEdge(2, 3, 5);
      graph.addEdge(2, 7, 2);
      graph.addEdge(3, 5, 4);
      graph.addEdge(3, 7, 6);
      graph.addEdge(4, 6, 3);
      graph.addEdge(4, 7, 7);
      graph.addEdge(5, 6, 2);
      graph.addEdge(5, 7, 1);
      graph.addEdge(6, 7, 5);
      
      nextVertexId = 8;
      break;

    case 'binary-tree':
      graph.addVertex(1, '1', centerX, centerY - 140);
      graph.addVertex(2, '2', centerX - 160, centerY - 40);
      graph.addVertex(3, '3', centerX + 160, centerY - 40);
      graph.addVertex(4, '4', centerX - 240, centerY + 80);
      graph.addVertex(5, '5', centerX - 80, centerY + 80);
      graph.addVertex(6, '6', centerX + 80, centerY + 80);
      graph.addVertex(7, '7', centerX + 240, centerY + 80);

      graph.addEdge(1, 2, 1);
      graph.addEdge(1, 3, 1);
      graph.addEdge(2, 4, 1);
      graph.addEdge(2, 5, 1);
      graph.addEdge(3, 6, 1);
      graph.addEdge(3, 7, 1);

      nextVertexId = 8;
      break;

    case 'complete-graph':
      // K5 layout in a circle
      const r = 120;
      for (let i = 1; i <= 5; i++) {
        const angle = ((i - 1) * 2 * Math.PI) / 5 - Math.PI / 2;
        const vx = centerX + r * Math.cos(angle);
        const vy = centerY + r * Math.sin(angle);
        graph.addVertex(i, i.toString(), vx, vy);
      }
      for (let i = 1; i <= 5; i++) {
        for (let j = i + 1; j <= 5; j++) {
          graph.addEdge(i, j, Math.floor(Math.random() * 8) + 2);
        }
      }
      nextVertexId = 6;
      break;

    case 'cyclic-cycle':
      const cr = 130;
      for (let i = 1; i <= 5; i++) {
        const angle = ((i - 1) * 2 * Math.PI) / 5 - Math.PI / 2;
        const vx = centerX + cr * Math.cos(angle);
        const vy = centerY + cr * Math.sin(angle);
        graph.addVertex(i, i.toString(), vx, vy);
      }
      for (let i = 1; i <= 5; i++) {
        const next = i === 5 ? 1 : i + 1;
        graph.addEdge(i, next, 1);
      }
      nextVertexId = 6;
      break;

    case 'empty':
      nextVertexId = 1;
      break;
  }

  updateNodeSelectors();
  updateTelemetry();
  updateAdjacencyMatrix();
  renderGraphVisuals();
  centerGraph();
  addLogEntry('System', 'Graph Seeding', `Generated preset graph: ${presetName}`, 'All');
}

// ==========================================
// SVG RENDER PIPELINE
// ==========================================
function renderGraphVisuals() {
  edgesGroup.innerHTML = '';
  nodesGroup.innerHTML = '';

  const vertices = Array.from(graph.vertices.values());
  const edges = Array.from(graph.edges.values());

  // 1. Draw Edges
  edges.forEach(edge => {
    drawEdge(edge);
  });

  // 2. Draw Nodes
  vertices.forEach(vertex => {
    drawNode(vertex);
  });
}

function drawEdge(edge) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'edge-group');
  g.setAttribute('id', `edge-group-${edge.id}`);

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', edge.source.x);
  line.setAttribute('y1', edge.source.y);
  line.setAttribute('x2', edge.target.x);
  line.setAttribute('y2', edge.target.y);
  line.setAttribute('class', 'edge-line');
  line.setAttribute('id', edge.id);

  // Set marker if directed
  if (graph.isDirected) {
    line.setAttribute('marker-end', 'url(#arrow)');
  }

  // Animation highlighting states
  if (animIndex >= 0 && animIndex < animationQueue.length) {
    const frame = animationQueue[animIndex];
    if (frame.edgesState && frame.edgesState[edge.id]) {
      const state = frame.edgesState[edge.id];
      line.classList.add(state);
      if (graph.isDirected) {
        if (state === 'checking') line.setAttribute('marker-end', 'url(#arrow-checking)');
        else if (state === 'active-path') line.setAttribute('marker-end', 'url(#arrow-active)');
        else if (state === 'shortest-path' || state === 'mst') line.setAttribute('marker-end', 'url(#arrow-highlight)');
      }
    }
  }

  // Edge Weight label card
  const midX = (edge.source.x + edge.target.x) / 2;
  const midY = (edge.source.y + edge.target.y) / 2;

  // Small background block for weights
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', midX - 12);
  rect.setAttribute('y', midY - 9);
  rect.setAttribute('width', 24);
  rect.setAttribute('height', 18);
  rect.setAttribute('class', 'edge-weight-bg');

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', midX);
  text.setAttribute('y', midY);
  text.setAttribute('class', 'edge-weight-text');
  text.textContent = edge.weight;

  g.appendChild(line);
  g.appendChild(rect);
  g.appendChild(text);

  // Click handler to delete or edit edge
  g.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      graph.removeEdge(edge.source.id, edge.target.id);
      updateTelemetry();
      updateAdjacencyMatrix();
      renderGraphVisuals();
      addLogEntry('Eraser', 'Delete Edge', `Deleted edge between Node ${edge.source.name} and Node ${edge.target.name}`, 'Edge');
    } else {
      // Prompt to edit weight
      const newWeight = prompt(`Enter new weight for edge (${edge.source.name} - ${edge.target.name}):`, edge.weight);
      if (newWeight !== null) {
        const wVal = parseInt(newWeight);
        if (!isNaN(wVal) && wVal >= 1 && wVal <= 99) {
          edge.weight = wVal;
          updateAdjacencyMatrix();
          renderGraphVisuals();
          addLogEntry('Config', 'Update Weight', `Updated edge weight (${edge.source.name} - ${edge.target.name}) to ${wVal}`, 'Weight');
        } else {
          alert("Please enter a valid weight between 1 and 99.");
        }
      }
    }
  });

  edgesGroup.appendChild(g);
}

function drawNode(vertex) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'node-group');
  g.setAttribute('transform', `translate(${vertex.x}, ${vertex.y})`);
  g.setAttribute('id', `node-group-${vertex.id}`);

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('r', 18);
  circle.setAttribute('class', 'node-circle');
  circle.setAttribute('id', `node-circle-${vertex.id}`);

  // Set start/target node markers
  const startVal = parseInt(startNodeSelect.value);
  const targetVal = parseInt(targetNodeSelect.value);
  if (vertex.id === startVal) circle.classList.add('start-node');
  if (vertex.id === targetVal && algoSelect.value !== 'prim') circle.classList.add('target-node');

  // Animation highlighting states
  let distanceLabelText = '';
  if (animIndex >= 0 && animIndex < animationQueue.length) {
    const frame = animationQueue[animIndex];
    if (frame.nodesState && frame.nodesState[vertex.id]) {
      circle.classList.add(frame.nodesState[vertex.id]);
    }
    // Check if distances are mapped in animation frame
    if (frame.distances && frame.distances[vertex.id] !== undefined) {
      const dist = frame.distances[vertex.id];
      distanceLabelText = dist === Infinity ? '∞' : dist.toString();
    }
  }

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('class', 'node-text');
  text.textContent = vertex.name;

  // Add Distance Label above node during Dijkstra animations
  const distanceLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  distanceLabel.setAttribute('class', 'node-weight-label');
  distanceLabel.setAttribute('y', -24);
  distanceLabel.textContent = distanceLabelText;

  g.appendChild(circle);
  g.appendChild(text);
  g.appendChild(distanceLabel);

  // Mouse handlers for dragging & linking
  g.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      graph.removeVertex(vertex.id);
      updateNodeSelectors();
      updateTelemetry();
      updateAdjacencyMatrix();
      renderGraphVisuals();
      addLogEntry('Eraser', 'Delete Node', `Deleted node ${vertex.name} and all connected edges`, 'Node');
    } else {
      isDraggingNode = true;
      dragNode = vertex;
      // If we are starting connection line
      if (e.shiftKey) {
        selectedNodeForLink = vertex;
        addLogEntry('Drawing', 'Select Link Source', `Click another node to draw edge from ${vertex.name}`, 'Vertex');
      }
    }
  });

  g.addEventListener('click', (e) => {
    e.stopPropagation();
    if (selectedNodeForLink && selectedNodeForLink !== vertex) {
      // Complete connection
      const source = selectedNodeForLink;
      const target = vertex;
      selectedNodeForLink = null;

      const wPrompt = prompt(`Enter edge weight from Node ${source.name} to Node ${target.name}:`, "1");
      if (wPrompt !== null) {
        const wVal = parseInt(wPrompt);
        if (!isNaN(wVal) && wVal >= 1 && wVal <= 99) {
          graph.addEdge(source.id, target.id, wVal);
          updateTelemetry();
          updateAdjacencyMatrix();
          renderGraphVisuals();
          addLogEntry('Drawing', 'Add Edge', `Connected Node ${source.name} ──(${wVal})──> Node ${target.name}`, 'Edge');
        } else {
          alert("Please enter a valid integer between 1 and 99.");
        }
      }
    }
  });

  nodesGroup.appendChild(g);
}

// ==========================================
// TELEMETRY UPDATERS
// ==========================================
function updateTelemetry() {
  valNodes.textContent = graph.vertices.size;
  valEdges.textContent = graph.edges.size;
}

function updateNodeSelectors() {
  const startVal = startNodeSelect.value;
  const targetVal = targetNodeSelect.value;

  startNodeSelect.innerHTML = '<option value="">Choose Node</option>';
  targetNodeSelect.innerHTML = '<option value="">Choose Node</option>';

  const vertices = Array.from(graph.vertices.values());
  vertices.forEach(v => {
    const optStart = document.createElement('option');
    optStart.value = v.id;
    optStart.textContent = `Node ${v.name}`;
    startNodeSelect.appendChild(optStart);

    const optTarget = document.createElement('option');
    optTarget.value = v.id;
    optTarget.textContent = `Node ${v.name}`;
    targetNodeSelect.appendChild(optTarget);
  });

  // Maintain selected values if they still exist
  if (graph.vertices.has(parseInt(startVal))) startNodeSelect.value = startVal;
  if (graph.vertices.has(parseInt(targetVal))) targetNodeSelect.value = targetVal;
}

// Render dynamic adjacency matrix
function updateAdjacencyMatrix() {
  const vertices = Array.from(graph.vertices.values()).sort((a,b) => a.id - b.id);
  const size = vertices.length;

  if (size === 0) {
    adjacencyMatrixTable.innerHTML = '<tr><td class="empty-log">Empty Graph</td></tr>';
    return;
  }

  let html = '<tr><th class="matrix-corner"></th>';
  // Headers
  vertices.forEach(v => {
    html += `<th>${v.name}</th>`;
  });
  html += '</tr>';

  // Matrix values
  vertices.forEach(u => {
    html += `<tr><th>${u.name}</th>`;
    vertices.forEach(v => {
      if (u.id === v.id) {
        html += '<td>0</td>';
      } else {
        const edgeId = graph.getEdgeId(u.id, v.id);
        const edge = graph.edges.get(edgeId);

        if (edge) {
          if (graph.isDirected && edge.source.id !== u.id) {
            // Directed, but reverse direction
            html += '<td>-</td>';
          } else {
            html += `<td class="weight-active">${edge.weight}</td>`;
          }
        } else {
          html += '<td>-</td>';
        }
      }
    });
    html += '</tr>';
  });

  adjacencyMatrixTable.innerHTML = html;
}

// ==========================================
// LOGGER PANEL
// ==========================================
function addLogEntry(op, action, description, activeQueue = '-') {
  const row = document.createElement('tr');
  const stepNum = logBody.querySelectorAll('tr:not(.empty-row)').length + 1;

  let opClass = 'op-bfs';
  if (op.toLowerCase().includes('dfs')) opClass = 'op-dfs';
  else if (op.toLowerCase().includes('dijkstra')) opClass = 'op-dijkstra';
  else if (op.toLowerCase().includes('prim')) opClass = 'op-prim';

  row.innerHTML = `
    <td class="log-step">#${stepNum}</td>
    <td class="log-op ${opClass}">${op}</td>
    <td>${description}</td>
    <td class="log-target">${activeQueue}</td>
  `;

  const emptyRow = logBody.querySelector('.empty-log');
  if (emptyRow) {
    logBody.innerHTML = '';
  }

  logBody.appendChild(row);
  logBody.parentElement.parentElement.scrollTop = logBody.parentElement.parentElement.scrollHeight;
  logCounter.textContent = `${stepNum} entries`;
}

function clearLogs() {
  logBody.innerHTML = `<tr><td colspan="4" class="empty-log">Awaiting operation parameters...</td></tr>`;
  logCounter.textContent = '0 entries';
}

// ==========================================
// PSEUDOCODE HIGHLIGHTER
// ==========================================
function loadPseudocode(type) {
  codeAlgoTitle.textContent = type.toUpperCase();
  const lines = PSEUDOCODE[type];
  if (!lines) {
    pseudocodeDisplay.innerHTML = '// Algorithm loaded...';
    return;
  }

  pseudocodeDisplay.innerHTML = '';
  lines.forEach(l => {
    const span = document.createElement('span');
    span.className = 'code-line';
    span.id = `code-line-${l.line}`;
    span.textContent = l.text;
    pseudocodeDisplay.appendChild(span);
  });
}

function highlightCodeLine(lineNum, stateClass = 'active-line') {
  const lines = pseudocodeDisplay.querySelectorAll('.code-line');
  lines.forEach(l => {
    l.classList.remove('active-line');
    l.classList.remove('check-line');
  });

  const activeLine = document.getElementById(`code-line-${lineNum}`);
  if (activeLine) {
    activeLine.classList.add(stateClass);
    activeLine.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ==========================================
// ANIMATION TIMELINE PLAYER
// ==========================================
function playAnimation() {
  if (animationQueue.length === 0) return;
  isPlaying = true;
  btnPlay.innerHTML = `<span class="btn-icon">⏸</span> Pause`;
  btnPlay.classList.replace('btn-success', 'btn-danger');

  function step() {
    if (!isPlaying) return;
    if (animIndex < animationQueue.length - 1) {
      animIndex++;
      applyAnimationFrame(animationQueue[animIndex]);
      playTimeout = setTimeout(step, speed);
    } else {
      isPlaying = false;
      btnPlay.innerHTML = `<span class="btn-icon">▶</span> Play`;
      btnPlay.classList.replace('btn-danger', 'btn-success');
      valStatus.textContent = 'SUCCESS';
      valStatus.className = 'metric-value status-badge success';
    }
  }
  step();
}

function pauseAnimation() {
  isPlaying = false;
  clearTimeout(playTimeout);
  btnPlay.innerHTML = `<span class="btn-icon">▶</span> Play`;
  btnPlay.classList.replace('btn-danger', 'btn-success');
}

function stepForward() {
  pauseAnimation();
  if (animationQueue.length === 0) return;
  if (animIndex < animationQueue.length - 1) {
    animIndex++;
    applyAnimationFrame(animationQueue[animIndex]);
  }
}

function resetAnimation() {
  pauseAnimation();
  animIndex = -1;
  animationQueue = [];
  valFrontier.textContent = '-';
  valPathCost.textContent = '-';
  valStatus.textContent = 'IDLE';
  valStatus.className = 'metric-value status-badge empty';
  renderGraphVisuals();
  
  // Clear code line markers
  const lines = pseudocodeDisplay.querySelectorAll('.code-line');
  lines.forEach(l => {
    l.classList.remove('active-line');
    l.classList.remove('check-line');
  });
}

function applyAnimationFrame(frame) {
  // Sync highlights onto nodes & lines in SVG
  renderGraphVisuals();

  // Highlight line in Pseudocode tracker
  if (frame.pseudocodeLine) {
    highlightCodeLine(frame.pseudocodeLine, frame.highlightClass || 'active-line');
  }

  // Update telemetry details
  if (frame.queueString !== undefined) {
    valFrontier.textContent = frame.queueString;
  }
  if (frame.pathCost !== undefined) {
    valPathCost.textContent = frame.pathCost;
  }

  // Log steps
  if (frame.log) {
    addLogEntry(frame.log.op, frame.log.action, frame.log.text, frame.log.queueState);
  }
}

// ==========================================
// ALGORITHM SOLVERS & QUEUE BUILDERS
// ==========================================

// 1. Breadth-First Search (BFS)
function buildBfsQueue(startId, targetId) {
  resetAnimation();
  loadPseudocode('bfs');
  const queue = [];

  const Q = [startId];
  const visited = new Set();
  const visiting = new Set([startId]);
  const parent = {};

  const getNodesState = () => {
    const states = {};
    visiting.forEach(id => { states[id] = 'visiting'; });
    visited.forEach(id => { states[id] = 'visited'; });
    return states;
  };

  const getEdgesState = () => {
    const states = {};
    for (const [v, p] of Object.entries(parent)) {
      const edgeId = graph.getEdgeId(parseInt(p), parseInt(v));
      states[edgeId] = 'active-path';
    }
    return states;
  };

  queue.push({
    nodesState: getNodesState(),
    pseudocodeLine: 3,
    queueString: `[${Q.map(id => graph.vertices.get(id).name).join(', ')}]`,
    log: { op: 'BFS', action: 'Initialize', text: `Enqueued start Node ${graph.vertices.get(startId).name}`, queueState: `[${Q.map(id => graph.vertices.get(id).name).join(', ')}]` }
  });

  let found = false;

  while (Q.length > 0) {
    const currId = Q.shift();
    visiting.delete(currId);
    visited.add(currId);

    const currNodeName = graph.vertices.get(currId).name;

    queue.push({
      nodesState: getNodesState(),
      edgesState: getEdgesState(),
      pseudocodeLine: 6,
      queueString: `[${Q.map(id => graph.vertices.get(id).name).join(', ')}]`,
      log: { op: 'BFS', action: 'Dequeue', text: `Dequeued and visiting Node ${currNodeName}`, queueState: `[${Q.map(id => graph.vertices.get(id).name).join(', ')}]` }
    });

    if (currId === targetId) {
      found = true;
      queue.push({
        nodesState: { ...getNodesState(), [targetId]: 'shortest-path' },
        edgesState: getEdgesState(),
        pseudocodeLine: 7,
        log: { op: 'BFS', action: 'Found', text: `Reached target Node ${graph.vertices.get(targetId).name}! BFS Completed.`, queueState: 'Done' }
      });
      break;
    }

    const neighbors = graph.getNeighbors(currId);
    for (const n of neighbors) {
      const nId = n.vertex.id;
      if (!visited.has(nId) && !visiting.has(nId)) {
        parent[nId] = currId;
        visiting.add(nId);
        Q.push(nId);

        const edgeId = graph.getEdgeId(currId, nId);
        const tempEdges = getEdgesState();
        tempEdges[edgeId] = 'checking';

        queue.push({
          nodesState: { ...getNodesState(), [nId]: 'checking' },
          edgesState: tempEdges,
          pseudocodeLine: 10,
          queueString: `[${Q.map(id => graph.vertices.get(id).name).join(', ')}]`,
          log: { op: 'BFS', action: 'Enqueue Neighbor', text: `Discovered unvisited Node ${n.vertex.name}. Enqueued.`, queueState: `[${Q.map(id => graph.vertices.get(id).name).join(', ')}]` }
        });
      }
    }
  }

  // Draw final shortest path if found
  if (found) {
    const pathEdges = {};
    const pathNodes = {};
    let curr = targetId;
    let cost = 0;
    while (parent[curr] !== undefined) {
      const p = parent[curr];
      const edgeId = graph.getEdgeId(p, curr);
      pathEdges[edgeId] = 'shortest-path';
      pathNodes[curr] = 'shortest-path';
      cost += graph.edges.get(edgeId).weight;
      curr = p;
    }
    pathNodes[startId] = 'shortest-path';

    queue.push({
      nodesState: pathNodes,
      edgesState: pathEdges,
      pseudocodeLine: 7,
      pathCost: cost,
      log: { op: 'BFS', action: 'Path Trace', text: `Shortest Path cost by edge count is ${cost}.`, queueState: 'Done' }
    });
  } else {
    queue.push({
      nodesState: getNodesState(),
      edgesState: getEdgesState(),
      pseudocodeLine: 5,
      log: { op: 'BFS', action: 'Finished', text: `BFS completed. Target Node is unreachable from start.`, queueState: 'Empty' }
    });
  }

  animationQueue = queue;
}

// 2. Depth-First Search (DFS)
function buildDfsQueue(startId, targetId) {
  resetAnimation();
  loadPseudocode('dfs');
  const queue = [];

  const visiting = new Set();
  const visited = new Set();
  const parent = {};
  const stack = [];

  const getNodesState = () => {
    const states = {};
    visiting.forEach(id => { states[id] = 'visiting'; });
    visited.forEach(id => { states[id] = 'visited'; });
    return states;
  };

  const getEdgesState = () => {
    const states = {};
    for (const [v, p] of Object.entries(parent)) {
      const edgeId = graph.getEdgeId(parseInt(p), parseInt(v));
      states[edgeId] = 'active-path';
    }
    return states;
  };

  let found = false;

  const dfsRecursive = (currId) => {
    if (found) return;
    visiting.add(currId);
    stack.push(currId);

    const nodeName = graph.vertices.get(currId).name;

    queue.push({
      nodesState: getNodesState(),
      edgesState: getEdgesState(),
      pseudocodeLine: 2,
      queueString: `[${stack.map(id => graph.vertices.get(id).name).join(' → ')}]`,
      log: { op: 'DFS', action: 'Visit Node', text: `Visiting Node ${nodeName} recursively`, queueState: `[Stack: ${stack.map(id => graph.vertices.get(id).name).join(', ')}]` }
    });

    if (currId === targetId) {
      found = true;
      queue.push({
        nodesState: { ...getNodesState(), [targetId]: 'shortest-path' },
        edgesState: getEdgesState(),
        pseudocodeLine: 2,
        log: { op: 'DFS', action: 'Found', text: `Reached target Node ${graph.vertices.get(targetId).name}! DFS Complete.`, queueState: 'Done' }
      });
      return;
    }

    const neighbors = graph.getNeighbors(currId);
    for (const n of neighbors) {
      if (found) return;
      const nId = n.vertex.id;

      if (!visiting.has(nId) && !visited.has(nId)) {
        parent[nId] = currId;

        const edgeId = graph.getEdgeId(currId, nId);
        const tempEdges = getEdgesState();
        tempEdges[edgeId] = 'checking';

        queue.push({
          nodesState: { ...getNodesState(), [nId]: 'checking' },
          edgesState: tempEdges,
          pseudocodeLine: 4,
          log: { op: 'DFS', action: 'Inspect Edge', text: `Inspecting branch from ${nodeName} to ${n.vertex.name}`, queueState: `[Stack: ${stack.map(id => graph.vertices.get(id).name).join(', ')}]` }
        });

        dfsRecursive(nId);
      }
    }

    if (found) return;
    visiting.delete(currId);
    visited.add(currId);
    stack.pop();

    queue.push({
      nodesState: getNodesState(),
      edgesState: getEdgesState(),
      pseudocodeLine: 7,
      queueString: `[${stack.map(id => graph.vertices.get(id).name).join(' → ')}]`,
      log: { op: 'DFS', action: 'Backtrack', text: `Finished checking all neighbors. Backtracking from Node ${nodeName}`, queueState: `[Stack: ${stack.map(id => graph.vertices.get(id).name).join(', ')}]` }
    });
  };

  dfsRecursive(startId);

  // Draw final path if found
  if (found) {
    const pathEdges = {};
    const pathNodes = {};
    let curr = targetId;
    let cost = 0;
    while (parent[curr] !== undefined) {
      const p = parent[curr];
      const edgeId = graph.getEdgeId(p, curr);
      pathEdges[edgeId] = 'shortest-path';
      pathNodes[curr] = 'shortest-path';
      cost += graph.edges.get(edgeId).weight;
      curr = p;
    }
    pathNodes[startId] = 'shortest-path';

    queue.push({
      nodesState: pathNodes,
      edgesState: pathEdges,
      pseudocodeLine: 7,
      pathCost: cost,
      log: { op: 'DFS', action: 'Path Completed', text: `Shortest path route found with cost ${cost}.`, queueState: 'Done' }
    });
  } else {
    queue.push({
      nodesState: getNodesState(),
      edgesState: getEdgesState(),
      pseudocodeLine: 7,
      log: { op: 'DFS', action: 'Finished', text: `DFS completed. Target Node is unreachable.`, queueState: 'Empty' }
    });
  }

  animationQueue = queue;
}

// 3. Dijkstra's Shortest Path Algorithm
function buildDijkstraQueue(startId, targetId) {
  resetAnimation();
  loadPseudocode('dijkstra');
  const queue = [];

  const dist = {};
  const parent = {};
  const visited = new Set();
  const PQ = []; // Stores node IDs

  // Initialize bounds
  graph.vertices.forEach(v => {
    dist[v.id] = Infinity;
  });
  dist[startId] = 0;
  PQ.push(startId);

  const getNodesState = () => {
    const states = {};
    PQ.forEach(id => { states[id] = 'visiting'; });
    visited.forEach(id => { states[id] = 'visited'; });
    return states;
  };

  const getEdgesState = () => {
    const states = {};
    for (const [v, p] of Object.entries(parent)) {
      const edgeId = graph.getEdgeId(parseInt(p), parseInt(v));
      states[edgeId] = 'active-path';
    }
    return states;
  };

  queue.push({
    nodesState: getNodesState(),
    distances: { ...dist },
    pseudocodeLine: 2,
    log: { op: 'Dijkstra', action: 'Initialize', text: `Set start Node dist = 0, all other nodes dist = ∞`, queueState: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]` }
  });

  let found = false;

  while (PQ.length > 0) {
    // Extract min distance node from priority queue
    PQ.sort((a, b) => dist[a] - dist[b]);
    const currId = PQ.shift();
    visited.add(currId);

    const currNodeName = graph.vertices.get(currId).name;

    queue.push({
      nodesState: getNodesState(),
      edgesState: getEdgesState(),
      distances: { ...dist },
      pseudocodeLine: 5,
      queueString: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]`,
      log: { op: 'Dijkstra', action: 'Extract Min', text: `Popped Node ${currNodeName} with smallest distance ${dist[currId]}`, queueState: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]` }
    });

    if (currId === targetId) {
      found = true;
      queue.push({
        nodesState: { ...getNodesState(), [targetId]: 'shortest-path' },
        distances: { ...dist },
        pseudocodeLine: 6,
        log: { op: 'Dijkstra', action: 'Found Target', text: `Reached target Node ${graph.vertices.get(targetId).name}! Dijkstra algorithm succeeded.`, queueState: 'Done' }
      });
      break;
    }

    const neighbors = graph.getNeighbors(currId);
    for (const n of neighbors) {
      const nId = n.vertex.id;
      if (visited.has(nId)) continue;

      const altDist = dist[currId] + n.weight;
      const edgeId = graph.getEdgeId(currId, nId);
      const tempEdges = getEdgesState();
      tempEdges[edgeId] = 'checking';

      queue.push({
        nodesState: { ...getNodesState(), [nId]: 'checking' },
        edgesState: tempEdges,
        distances: { ...dist },
        pseudocodeLine: 8,
        log: { op: 'Dijkstra', action: 'Compare Path', text: `Checking edge ${currNodeName} ─(${n.weight})─> ${n.vertex.name}. Path cost: ${altDist}`, queueState: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]` }
      });

      if (altDist < dist[nId]) {
        dist[nId] = altDist;
        parent[nId] = currId;
        
        if (!PQ.includes(nId)) {
          PQ.push(nId);
        }

        queue.push({
          nodesState: getNodesState(),
          edgesState: getEdgesState(),
          distances: { ...dist },
          pseudocodeLine: 10,
          log: { op: 'Dijkstra', action: 'Relax Edge', text: `Relaxed! Updated Node ${n.vertex.name} min distance to ${altDist}`, queueState: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]` }
        });
      }
    }
  }

  // Trace final path
  if (found) {
    const pathEdges = {};
    const pathNodes = {};
    let curr = targetId;
    let cost = 0;
    while (parent[curr] !== undefined) {
      const p = parent[curr];
      const edgeId = graph.getEdgeId(p, curr);
      pathEdges[edgeId] = 'shortest-path';
      pathNodes[curr] = 'shortest-path';
      cost += graph.edges.get(edgeId).weight;
      curr = p;
    }
    pathNodes[startId] = 'shortest-path';

    queue.push({
      nodesState: pathNodes,
      edgesState: pathEdges,
      distances: { ...dist },
      pseudocodeLine: 6,
      pathCost: cost,
      log: { op: 'Dijkstra', action: 'Shortest Path Found', text: `Minimum Cost route calculated successfully. Total Cost: ${cost}`, queueState: 'Done' }
    });
  } else {
    queue.push({
      nodesState: getNodesState(),
      distances: { ...dist },
      pseudocodeLine: 4,
      log: { op: 'Dijkstra', action: 'Finished', text: `Unreachable target. Dijkstra traversal finished.`, queueState: 'Empty' }
    });
  }

  animationQueue = queue;
}

// 4. Prim's Minimum Spanning Tree (MST)
function buildPrimQueue(startId) {
  resetAnimation();
  loadPseudocode('prim');
  const queue = [];

  const key = {};
  const parent = {};
  const inMST = new Set();
  const PQ = []; // Stores node IDs

  graph.vertices.forEach(v => {
    key[v.id] = Infinity;
  });
  key[startId] = 0;
  PQ.push(startId);

  const getNodesState = () => {
    const states = {};
    PQ.forEach(id => { states[id] = 'visiting'; });
    inMST.forEach(id => { states[id] = 'visited'; });
    return states;
  };

  const getEdgesState = () => {
    const states = {};
    for (const [v, p] of Object.entries(parent)) {
      if (inMST.has(parseInt(v))) {
        const edgeId = graph.getEdgeId(parseInt(p), parseInt(v));
        states[edgeId] = 'mst';
      }
    }
    return states;
  };

  queue.push({
    nodesState: getNodesState(),
    distances: { ...key },
    pseudocodeLine: 2,
    log: { op: 'Prim MST', action: 'Initialize', text: `Set start Node key = 0, all other keys = ∞`, queueState: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]` }
  });

  let totalMSTWeight = 0;

  while (PQ.length > 0) {
    PQ.sort((a, b) => key[a] - key[b]);
    const currId = PQ.shift();
    inMST.add(currId);

    const currNodeName = graph.vertices.get(currId).name;
    const parentId = parent[currId];

    if (parentId !== undefined) {
      const edgeId = graph.getEdgeId(parentId, currId);
      totalMSTWeight += graph.edges.get(edgeId).weight;
    }

    queue.push({
      nodesState: getNodesState(),
      edgesState: getEdgesState(),
      distances: { ...key },
      pseudocodeLine: 5,
      pathCost: totalMSTWeight,
      log: { op: 'Prim MST', action: 'Extract Min', text: `Added Node ${currNodeName} to MST. Key = ${key[currId]}`, queueState: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]` }
    });

    const neighbors = graph.getNeighbors(currId);
    for (const n of neighbors) {
      const nId = n.vertex.id;
      if (inMST.has(nId)) continue;

      const edgeId = graph.getEdgeId(currId, nId);
      const tempEdges = getEdgesState();
      tempEdges[edgeId] = 'checking';

      queue.push({
        nodesState: { ...getNodesState(), [nId]: 'checking' },
        edgesState: tempEdges,
        distances: { ...key },
        pseudocodeLine: 7,
        log: { op: 'Prim MST', action: 'Check Link', text: `Inspecting edge ${currNodeName} ─(${n.weight})─> ${n.vertex.name}`, queueState: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]` }
      });

      if (n.weight < key[nId]) {
        key[nId] = n.weight;
        parent[nId] = currId;

        if (!PQ.includes(nId)) {
          PQ.push(nId);
        }

        queue.push({
          nodesState: getNodesState(),
          edgesState: getEdgesState(),
          distances: { ...key },
          pseudocodeLine: 9,
          log: { op: 'Prim MST', action: 'Update Key', text: `Cheaper link found! Node ${n.vertex.name} key updated to ${n.weight}`, queueState: `PQ: [${PQ.map(id => graph.vertices.get(id).name).join(', ')}]` }
        });
      }
    }
  }

  // Trace completed MST
  const mstEdges = {};
  const mstNodes = {};
  graph.vertices.forEach(v => {
    mstNodes[v.id] = 'visited';
  });
  for (const [v, p] of Object.entries(parent)) {
    const edgeId = graph.getEdgeId(parseInt(p), parseInt(v));
    mstEdges[edgeId] = 'mst';
  }

  queue.push({
    nodesState: mstNodes,
    edgesState: mstEdges,
    distances: { ...key },
    pseudocodeLine: 6,
    pathCost: totalMSTWeight,
    log: { op: 'Prim MST', action: 'Complete MST', text: `MST constructed successfully. Total Weight: ${totalMSTWeight}`, queueState: 'Done' }
  });

  animationQueue = queue;
}

// ==========================================
// INTERACTIVE SVG CAMERA CONTROL (PAN & ZOOM)
// ==========================================
function updateSvgTransform() {
  panGroup.setAttribute('transform', `translate(${panX}, ${panY}) scale(${scale})`);
}

svgWrapper.addEventListener('mousedown', (e) => {
  // Only start panning if clicked directly on canvas background
  if (e.target.tagName === 'svg' || e.target.id === 'edges-group' || e.target.id === 'nodes-group' || e.target.id === 'svg-pan-group') {
    isPanning = true;
    startPanX = e.clientX - panX;
    startPanY = e.clientY - panY;
  }
});

svgWrapper.addEventListener('mousemove', (e) => {
  if (isPanning) {
    panX = e.clientX - startPanX;
    panY = e.clientY - startPanY;
    updateSvgTransform();
  } else if (isDraggingNode && dragNode) {
    // Move node coords matching mouse cursor
    const rect = svgWrapper.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panX) / scale;
    const mouseY = (e.clientY - rect.top - panY) / scale;
    
    dragNode.x = mouseX;
    dragNode.y = mouseY;
    renderGraphVisuals();
  }
});

window.addEventListener('mouseup', () => {
  isPanning = false;
  isDraggingNode = false;
  dragNode = null;
  updateAdjacencyMatrix();
});

svgWrapper.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = 1.05;
  const oldScale = scale;

  if (e.deltaY < 0) {
    scale = Math.min(4.0, scale * zoomFactor);
  } else {
    scale = Math.max(0.15, scale / zoomFactor);
  }

  const rect = svgWrapper.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  panX = mouseX - (mouseX - panX) * (scale / oldScale);
  panY = mouseY - (mouseY - panY) * (scale / oldScale);

  updateSvgTransform();
});

// Fit nodes into SVG viewbox
function centerGraph() {
  const vertices = Array.from(graph.vertices.values());
  if (vertices.length === 0) return;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  vertices.forEach(v => {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  });

  const gw = maxX - minX;
  const gh = maxY - minY;

  const rect = svgWrapper.getBoundingClientRect();
  const cw = rect.width;
  const ch = rect.height;

  const padding = 50;
  const zoomX = (cw - padding * 2) / (gw || 1);
  const zoomY = (ch - padding * 2) / (gh || 1);
  scale = Math.min(1.2, Math.max(0.4, Math.min(zoomX, zoomY)));

  panX = (cw - (gw * scale)) / 2 - minX * scale;
  panY = (ch - (gh * scale)) / 2 - minY * scale;

  updateSvgTransform();
}

btnZoomIn.addEventListener('click', () => {
  scale = Math.min(4.0, scale * 1.2);
  updateSvgTransform();
});

btnZoomOut.addEventListener('click', () => {
  scale = Math.max(0.15, scale / 1.2);
  updateSvgTransform();
});

btnZoomReset.addEventListener('click', centerGraph);

// ==========================================
// DOUBLE-CLICK CANVAS TO SPAWN NODES
// ==========================================
svgWrapper.addEventListener('dblclick', (e) => {
  // Verify we only double click canvas background
  if (e.target.tagName === 'svg' || e.target.id === 'edges-group' || e.target.id === 'nodes-group' || e.target.id === 'svg-pan-group') {
    if (activeTool === 'delete') return;

    const rect = svgWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / scale;
    const y = (e.clientY - rect.top - panY) / scale;

    const name = nextVertexId.toString();
    graph.addVertex(nextVertexId, name, x, y);
    addLogEntry('Canvas', 'Create Node', `Added Node ${name} at coordinate (${Math.round(x)}, ${Math.round(y)})`, 'Node');

    nextVertexId++;
    updateNodeSelectors();
    updateTelemetry();
    updateAdjacencyMatrix();
    renderGraphVisuals();
  }
});

// ==========================================
// THEME MANAGER
// ==========================================
let currentTheme = 'dark';
btnThemeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', currentTheme);
});

// ==========================================
// UI INTERACTION HANDLERS
// ==========================================
btnSeed.addEventListener('click', () => {
  loadPresetGraph(presetSelect.value);
});

btnTopoUndirected.addEventListener('click', () => {
  if (!graph.isDirected) return;
  graph.isDirected = false;
  btnTopoUndirected.classList.add('active');
  btnTopoDirected.classList.remove('active');
  
  // Re-sync edges mapping (merges u->v and v->u edges)
  const tempEdges = Array.from(graph.edges.values());
  graph.edges.clear();
  tempEdges.forEach(e => {
    graph.addEdge(e.source.id, e.target.id, e.weight);
  });

  updateAdjacencyMatrix();
  renderGraphVisuals();
  addLogEntry('Config', 'Toggle Topology', 'Graph structure set to Undirected.', 'All');
});

btnTopoDirected.addEventListener('click', () => {
  if (graph.isDirected) return;
  graph.isDirected = true;
  btnTopoDirected.classList.add('active');
  btnTopoUndirected.classList.remove('active');

  updateAdjacencyMatrix();
  renderGraphVisuals();
  addLogEntry('Config', 'Toggle Topology', 'Graph structure set to Directed.', 'All');
});

// Tool selectors draw vs delete
btnToolDraw.addEventListener('click', () => {
  activeTool = 'draw';
  btnToolDraw.classList.add('active');
  btnToolDelete.classList.remove('active');
  document.body.classList.remove('eraser-mode');
});

btnToolDelete.addEventListener('click', () => {
  activeTool = 'delete';
  btnToolDelete.classList.add('active');
  btnToolDraw.classList.remove('active');
  document.body.classList.add('eraser-mode');
  selectedNodeForLink = null;
});

// Change start/target nodes updates
startNodeSelect.addEventListener('change', () => {
  resetAnimation();
  renderGraphVisuals();
});

targetNodeSelect.addEventListener('change', () => {
  resetAnimation();
  renderGraphVisuals();
});

// Hide/Show target selectors based on algorithm
algoSelect.addEventListener('change', () => {
  resetAnimation();
  const algo = algoSelect.value;
  if (algo === 'prim') {
    targetNodeGroup.classList.add('hidden');
    pathCostLabel.textContent = 'MST Cost';
  } else {
    targetNodeGroup.classList.remove('hidden');
    pathCostLabel.textContent = 'Path Cost';
  }
});

btnPlay.addEventListener('click', () => {
  if (isPlaying) {
    pauseAnimation();
  } else {
    if (animationQueue.length === 0 || animIndex === animationQueue.length - 1) {
      // Build animation steps
      const startId = parseInt(startNodeSelect.value);
      const targetId = parseInt(targetNodeSelect.value);
      const algo = algoSelect.value;

      if (isNaN(startId)) {
        alert("Please select a Starting Node.");
        return;
      }
      if (algo !== 'prim' && isNaN(targetId)) {
        alert("Please select a Target Node.");
        return;
      }

      valStatus.textContent = 'RUNNING';
      valStatus.className = 'metric-value status-badge active';

      if (algo === 'bfs') {
        buildBfsQueue(startId, targetId);
      } else if (algo === 'dfs') {
        buildDfsQueue(startId, targetId);
      } else if (algo === 'dijkstra') {
        buildDijkstraQueue(startId, targetId);
      } else if (algo === 'prim') {
        buildPrimQueue(startId);
      }
    }
    playAnimation();
  }
});

btnStep.addEventListener('click', () => {
  if (animationQueue.length === 0 || animIndex === animationQueue.length - 1) {
    const startId = parseInt(startNodeSelect.value);
    const targetId = parseInt(targetNodeSelect.value);
    const algo = algoSelect.value;

    if (isNaN(startId)) return;
    if (algo !== 'prim' && isNaN(targetId)) return;

    if (algo === 'bfs') buildBfsQueue(startId, targetId);
    else if (algo === 'dfs') buildDfsQueue(startId, targetId);
    else if (algo === 'dijkstra') buildDijkstraQueue(startId, targetId);
    else if (algo === 'prim') buildPrimQueue(startId);
  }
  stepForward();
});

btnResetAnim.addEventListener('click', resetAnimation);

speedSlider.addEventListener('input', () => {
  speed = parseInt(speedSlider.value);
  speedVal.textContent = `${speed}ms`;
});

btnMatrixToggle.addEventListener('click', () => {
  matrixDrawer.classList.toggle('hidden');
});

btnCloseMatrix.addEventListener('click', () => {
  matrixDrawer.classList.add('hidden');
});

btnClearGraph.addEventListener('click', () => {
  graph.clear();
  selectedNodeForLink = null;
  resetAnimation();
  clearLogs();
  updateNodeSelectors();
  updateTelemetry();
  updateAdjacencyMatrix();
  renderGraphVisuals();
  addLogEntry('System', 'Reset Workspace', 'All network nodes and links cleared.', 'All');
});

// Setup default weighted graph
loadPresetGraph('weighted-mesh');
updateTelemetry();
setTimeout(centerGraph, 300);
