/**
 * Binary Search Tree Playground - Core Logic and Visualizer
 */

// Node Structure
class BSTNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.height = 0;
    this.depth = 0;
    
    // Position coordinates
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
  }
}

// Tree Manager
class BST {
  constructor() {
    this.root = null;
    this.nodeMap = new Map(); // Fast access by value
  }

  clear() {
    this.root = null;
    this.nodeMap.clear();
  }

  // Calculate height and depth of all nodes
  updateMetadata(node = this.root, depth = 0) {
    if (!node) return -1;
    node.depth = depth;
    const leftHeight = this.updateMetadata(node.left, depth + 1);
    const rightHeight = this.updateMetadata(node.right, depth + 1);
    node.height = Math.max(leftHeight, rightHeight) + 1;
    return node.height;
  }

  // Inorder list of nodes
  inorderNodes(node = this.root, arr = []) {
    if (!node) return arr;
    this.inorderNodes(node.left, arr);
    arr.push(node);
    this.inorderNodes(node.right, arr);
    return arr;
  }

  // Preorder list
  preorderNodes(node = this.root, arr = []) {
    if (!node) return arr;
    arr.push(node);
    this.preorderNodes(node.left, arr);
    this.preorderNodes(node.right, arr);
    return arr;
  }

  // Postorder list
  postorderNodes(node = this.root, arr = []) {
    if (!node) return arr;
    this.postorderNodes(node.left, arr);
    this.postorderNodes(node.right, arr);
    arr.push(node);
    return arr;
  }

  // Breadth-First list
  levelorderNodes() {
    const arr = [];
    if (!this.root) return arr;
    const queue = [this.root];
    while (queue.length > 0) {
      const curr = queue.shift();
      arr.push(curr);
      if (curr.left) queue.push(curr.left);
      if (curr.right) queue.push(curr.right);
    }
    return arr;
  }

  // Find min node in a subtree
  findMin(node) {
    let curr = node;
    while (curr && curr.left) {
      curr = curr.left;
    }
    return curr;
  }

  // Find max node in a subtree
  findMax(node) {
    let curr = node;
    while (curr && curr.right) {
      curr = curr.right;
    }
    return curr;
  }

  // Insertion without visual queue (immediate)
  insertValue(val) {
    if (this.nodeMap.has(val)) return false;
    const newNode = new BSTNode(val);
    this.nodeMap.set(val, newNode);

    if (!this.root) {
      this.root = newNode;
      newNode.x = window.innerWidth / 2 - 170; // spawn at center
      newNode.y = 80;
      return true;
    }

    let curr = this.root;
    let parent = null;
    while (curr) {
      parent = curr;
      if (val < curr.val) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }

    newNode.parent = parent;
    if (val < parent.val) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    // Spawn coordinate inherits parent's current position to slide out
    newNode.x = parent.x;
    newNode.y = parent.y;
    return true;
  }

  // Deletion (immediate)
  deleteValue(val, strategy = 'successor') {
    if (!this.nodeMap.has(val)) return false;
    const nodeToDelete = this.nodeMap.get(val);
    
    this._deleteNode(nodeToDelete, strategy);
    this.nodeMap.delete(val);
    return true;
  }

  _deleteNode(node, strategy) {
    // Case 1: Leaf
    if (!node.left && !node.right) {
      if (node === this.root) {
        this.root = null;
      } else {
        const parent = node.parent;
        if (parent.left === node) parent.left = null;
        else parent.right = null;
      }
      return;
    }

    // Case 2: One child
    if (!node.left || !node.right) {
      const child = node.left ? node.left : node.right;
      if (node === this.root) {
        this.root = child;
        child.parent = null;
      } else {
        const parent = node.parent;
        if (parent.left === node) parent.left = child;
        else parent.right = child;
        child.parent = parent;
      }
      return;
    }

    // Case 3: Two children
    if (strategy === 'successor') {
      const succ = this.findMin(node.right);
      const tempVal = succ.val;
      // We must swap map keys to maintain references
      this.nodeMap.delete(succ.val);
      this.nodeMap.set(tempVal, node); // Node gets successor's value
      
      this._deleteNode(succ, strategy);
      node.val = tempVal;
    } else {
      const pred = this.findMax(node.left);
      const tempVal = pred.val;
      this.nodeMap.delete(pred.val);
      this.nodeMap.set(tempVal, node); // Node gets predecessor's value
      
      this._deleteNode(pred, strategy);
      node.val = tempVal;
    }
  }

  // Left Rotation at node
  rotateLeft(val) {
    if (!this.nodeMap.has(val)) return false;
    const node = this.nodeMap.get(val);
    if (!node.right) return false;

    const pivot = node.right;
    node.right = pivot.left;
    if (pivot.left) pivot.left.parent = node;

    pivot.parent = node.parent;
    if (!node.parent) {
      this.root = pivot;
    } else if (node.parent.left === node) {
      node.parent.left = pivot;
    } else {
      node.parent.right = pivot;
    }

    pivot.left = node;
    node.parent = pivot;

    return true;
  }

  // Right Rotation at node
  rotateRight(val) {
    if (!this.nodeMap.has(val)) return false;
    const node = this.nodeMap.get(val);
    if (!node.left) return false;

    const pivot = node.left;
    node.left = pivot.right;
    if (pivot.right) pivot.right.parent = node;

    pivot.parent = node.parent;
    if (!node.parent) {
      this.root = pivot;
    } else if (node.parent.left === node) {
      node.parent.left = pivot;
    } else {
      node.parent.right = pivot;
    }

    pivot.right = node;
    node.parent = pivot;

    return true;
  }

  // Height Balance Check
  isBalanced(node = this.root) {
    if (!node) return { balanced: true, height: 0 };

    const left = this.isBalanced(node.left);
    const right = this.isBalanced(node.right);

    const balanced = left.balanced && right.balanced && Math.abs(left.height - right.height) <= 1;
    const height = Math.max(left.height, right.height) + 1;

    return { balanced, height };
  }

  // Get balance factor of a node
  getBalanceFactor(node) {
    if (!node) return 0;
    const leftH = node.left ? node.left.height : 0;
    const rightH = node.right ? node.right.height : 0;
    return leftH - rightH;
  }

  // Rebalance using AVL tree rules
  balanceTree() {
    const vals = this.inorderNodes().map(n => n.val);
    this.clear();
    this.buildBalancedFromArray(vals);
  }

  buildBalancedFromArray(arr) {
    arr.sort((a, b) => a - b);
    const build = (start, end, parent = null) => {
      if (start > end) return null;
      const mid = Math.floor((start + end) / 2);
      const node = new BSTNode(arr[mid]);
      this.nodeMap.set(arr[mid], node);
      node.parent = parent;
      node.left = build(start, mid - 1, node);
      node.right = build(mid + 1, end, node);
      return node;
    };
    this.root = build(0, arr.length - 1);
  }
}

// Global visualizer state
const tree = new BST();
let animationQueue = [];
let animIndex = -1;
let isPlaying = false;
let playTimeout = null;
let speed = 1000;

// SVG Coordinates placement config
const HORIZONTAL_GAP = 55;
const VERTICAL_GAP = 75;
const NODE_RADIUS = 20;

// SVG Pan & Zoom state
let panX = 0;
let panY = 0;
let scale = 1.0;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;

// DOM Selectors
const svgWrapper = document.getElementById('svg-wrapper');
const treeSvg = document.getElementById('tree-svg');
const panGroup = document.getElementById('svg-pan-group');
const linksGroup = document.getElementById('links-group');
const nodesGroup = document.getElementById('nodes-group');

// Telemetry counters
const valNodes = document.getElementById('val-nodes');
const valHeight = document.getElementById('val-height');
const valBalanced = document.getElementById('val-balanced');
const valLeaves = document.getElementById('val-leaves');
const valRoot = document.getElementById('val-root');

// Operations inputs
const presetSelect = document.getElementById('preset-select');
const customArrayGroup = document.getElementById('custom-array-group');
const customArrayInput = document.getElementById('custom-array-input');
const btnSeed = document.getElementById('btn-seed');

const insertVal = document.getElementById('insert-val');
const btnInsert = document.getElementById('btn-insert');
const deleteVal = document.getElementById('delete-val');
const btnDelete = document.getElementById('btn-delete');
const findVal = document.getElementById('find-val');
const btnFind = document.getElementById('btn-find');

const lcaVal1 = document.getElementById('lca-val-1');
const lcaVal2 = document.getElementById('lca-val-2');
const btnLca = document.getElementById('btn-lca');

const rotateVal = document.getElementById('rotate-val');
const btnRotateLeft = document.getElementById('btn-rotate-left');
const btnRotateRight = document.getElementById('btn-rotate-right');

const traversalSelect = document.getElementById('traversal-select');
const btnPlay = document.getElementById('btn-play');
const btnStep = document.getElementById('btn-step');
const btnResetAnim = document.getElementById('btn-reset-anim');
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');

const btnThemeToggle = document.getElementById('btn-theme-toggle');
const btnClearTree = document.getElementById('btn-clear-tree');
const btnBalanceAvl = document.getElementById('btn-balance-avl');

const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnZoomReset = document.getElementById('btn-zoom-reset');

// Node Inspector selectors
const nodeInspector = document.getElementById('node-inspector');
const btnCloseInspector = document.getElementById('btn-close-inspector');
const inspectVal = document.getElementById('inspect-val');
const inspectDepth = document.getElementById('inspect-depth');
const inspectHeight = document.getElementById('inspect-height');
const inspectBf = document.getElementById('inspect-bf');
const inspectParent = document.getElementById('inspect-parent');
const inspectChildren = document.getElementById('inspect-children');
const inspectPath = document.getElementById('inspect-path');

// Logger selectors
const logBody = document.getElementById('log-body');
const logCounter = document.getElementById('log-counter');
const codeAlgoTitle = document.getElementById('code-algo-title');
const pseudocodeDisplay = document.getElementById('pseudocode-display');

// Pseudocode definitions
const PSEUDOCODE = {
  insert: [
    { line: 1, text: "if root is null:", indent: 0 },
    { line: 2, text: "    root = new Node(value)", indent: 0 },
    { line: 3, text: "    return", indent: 0 },
    { line: 4, text: "curr = root", indent: 0 },
    { line: 5, text: "while curr is not null:", indent: 0 },
    { line: 6, text: "    if value < curr.val:", indent: 0 },
    { line: 7, text: "        if curr.left is null:", indent: 0 },
    { line: 8, text: "            curr.left = new Node(value)", indent: 0 },
    { line: 9, text: "            return", indent: 0 },
    { line: 10, text: "        else: curr = curr.left", indent: 0 },
    { line: 11, text: "    else if value > curr.val:", indent: 0 },
    { line: 12, text: "        if curr.right is null:", indent: 0 },
    { line: 13, text: "            curr.right = new Node(value)", indent: 0 },
    { line: 14, text: "            return", indent: 0 },
    { line: 15, text: "        else: curr = curr.right", indent: 0 }
  ],
  delete: [
    { line: 1, text: "node = find(value)", indent: 0 },
    { line: 2, text: "if node has no children:", indent: 0 },
    { line: 3, text: "    remove node, set parent link to null", indent: 0 },
    { line: 4, text: "else if node has one child:", indent: 0 },
    { line: 5, text: "    replace node with its single child", indent: 0 },
    { line: 6, text: "else if node has two children:", indent: 0 },
    { line: 7, text: "    successor = findMin(node.right) // or predecessor", indent: 0 },
    { line: 8, text: "    node.val = successor.val", indent: 0 },
    { line: 9, text: "    delete successor node recursively", indent: 0 }
  ],
  find: [
    { line: 1, text: "curr = root", indent: 0 },
    { line: 2, text: "while curr is not null:", indent: 0 },
    { line: 3, text: "    if value == curr.val:", indent: 0 },
    { line: 4, text: "        return curr // Found!", indent: 0 },
    { line: 5, text: "    else if value < curr.val:", indent: 0 },
    { line: 6, text: "        curr = curr.left // Go Left", indent: 0 },
    { line: 7, text: "    else:", indent: 0 },
    { line: 8, text: "        curr = curr.right // Go Right", indent: 0 },
    { line: 9, text: "return null // Not Found", indent: 0 }
  ],
  rotateLeft: [
    { line: 1, text: "pivot = node.right", indent: 0 },
    { line: 2, text: "node.right = pivot.left", indent: 0 },
    { line: 3, text: "pivot.left = node", indent: 0 },
    { line: 4, text: "update parent pointers", indent: 0 },
    { line: 5, text: "recompute heights & balance factor", indent: 0 }
  ],
  rotateRight: [
    { line: 1, text: "pivot = node.left", indent: 0 },
    { line: 2, text: "node.left = pivot.right", indent: 0 },
    { line: 3, text: "pivot.right = node", indent: 0 },
    { line: 4, text: "update parent pointers", indent: 0 },
    { line: 5, text: "recompute heights & balance factor", indent: 0 }
  ],
  lca: [
    { line: 1, text: "curr = root", indent: 0 },
    { line: 2, text: "while curr is not null:", indent: 0 },
    { line: 3, text: "    if valA < curr.val and valB < curr.val:", indent: 0 },
    { line: 4, text: "        curr = curr.left // LCA must be in left subtree", indent: 0 },
    { line: 5, text: "    else if valA > curr.val and valB > curr.val:", indent: 0 },
    { line: 6, text: "        curr = curr.right // LCA must be in right subtree", indent: 0 },
    { line: 7, text: "    else:", indent: 0 },
    { line: 8, text: "        return curr // Current node is split or matches. LCA!", indent: 0 }
  ],
  traversal: [
    { line: 1, text: "procedure traverse(node):", indent: 0 },
    { line: 2, text: "    if node is null: return", indent: 0 },
    { line: 3, text: "    // --- Preorder: Visit Node ---", indent: 0 },
    { line: 4, text: "    traverse(node.left)", indent: 0 },
    { line: 5, text: "    // --- Inorder: Visit Node ---", indent: 0 },
    { line: 6, text: "    traverse(node.right)", indent: 0 },
    { line: 7, text: "    // --- Postorder: Visit Node ---", indent: 0 }
  ]
};

// ==========================================
// PRESETS INITIALIZATION
// ==========================================
function loadPreset(type) {
  tree.clear();
  nodeInspector.classList.add('hidden');
  resetAnimation();
  clearLogs();

  let values = [];
  switch (type) {
    case 'balanced':
      values = [15, 8, 22, 4, 11, 18, 27, 2, 6, 9, 13, 16, 20, 24, 30];
      break;
    case 'skewed-left':
      values = [50, 40, 30, 20, 10];
      break;
    case 'skewed-right':
      values = [10, 20, 30, 40, 50];
      break;
    case 'random':
      while (values.length < 12) {
        const r = Math.floor(Math.random() * 98) + 2;
        if (!values.includes(r)) values.push(r);
      }
      break;
    case 'custom':
      const raw = customArrayInput.value.split(',');
      raw.forEach(v => {
        const n = parseInt(v.trim());
        if (!isNaN(n) && n > 0 && n < 1000) {
          if (!values.includes(n)) values.push(n);
        }
      });
      if (values.length === 0) {
        addLogEntry('System', 'Validation Error', 'Invalid or empty custom array values entered.', 'None');
        return;
      }
      break;
  }

  values.forEach(v => tree.insertValue(v));
  tree.updateMetadata();
  triggerLayoutUpdate();
  updateTelemetry();
  centerTree();
  addLogEntry('System', 'Tree Seeding', `Generated tree structure from values: [${values.join(', ')}]`, 'Root');
}

// ==========================================
// TREE LAYOUT COMPUTATION
// ==========================================
// Uses an In-Order traversal coordinate assignment to guarantee NO overlapping nodes
function triggerLayoutUpdate() {
  const nodes = tree.inorderNodes();
  if (nodes.length === 0) return;

  const svgRect = svgWrapper.getBoundingClientRect();
  const canvasWidth = svgRect.width || 800;
  
  // Dynamic horizontal spacing: scale spacing smaller for large trees to fit nicely
  const spacing = Math.max(HORIZONTAL_GAP, Math.min(80, canvasWidth / (nodes.length + 1)));
  
  nodes.forEach((node, index) => {
    node.targetX = (index + 1) * spacing;
    node.targetY = 80 + node.depth * VERTICAL_GAP;
  });

  // Calculate layout offset to center the tree boundaries on canvas
  const minX = nodes[0].targetX;
  const maxX = nodes[nodes.length - 1].targetX;
  const treeWidth = maxX - minX;
  const offset = (canvasWidth - treeWidth) / 2 - minX;

  nodes.forEach(node => {
    node.targetX += offset;
  });
}

// Smooth position interpolation coordinate updates
function smoothCoordsLoop() {
  const nodes = Array.from(tree.nodeMap.values());
  let changes = false;

  nodes.forEach(node => {
    const dx = node.targetX - node.x;
    const dy = node.targetY - node.y;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      node.x += dx * 0.12; // Spring multiplier
      node.y += dy * 0.12;
      changes = true;
    } else {
      node.x = node.targetX;
      node.y = node.targetY;
    }
  });

  renderTreeVisuals();
  requestAnimationFrame(smoothCoordsLoop);
}

// Start coordinate loop
requestAnimationFrame(smoothCoordsLoop);

// ==========================================
// SVG RENDER PIPELINE
// ==========================================
function renderTreeVisuals() {
  // Clear lists
  linksGroup.innerHTML = '';
  nodesGroup.innerHTML = '';

  const nodes = Array.from(tree.nodeMap.values());
  if (nodes.length === 0) return;

  // 1. Draw Links/Edges
  nodes.forEach(node => {
    if (node.left) drawEdge(node, node.left, 'left');
    if (node.right) drawEdge(node, node.right, 'right');
  });

  // 2. Draw Nodes
  nodes.forEach(node => {
    drawNode(node);
  });
}

function drawEdge(parent, child, type) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', parent.x);
  line.setAttribute('y1', parent.y);
  line.setAttribute('x2', child.x);
  line.setAttribute('y2', child.y);
  line.setAttribute('class', 'tree-edge');
  
  // Link key identifier: e.g. "link-15-8"
  const edgeKey = `link-${parent.val}-${child.val}`;
  line.setAttribute('id', edgeKey);

  // Mark if this edge is active in the animation frame
  if (animIndex >= 0 && animIndex < animationQueue.length) {
    const frame = animationQueue[animIndex];
    if (frame.edgesState && frame.edgesState[edgeKey]) {
      line.classList.add(frame.edgesState[edgeKey]);
    }
  }

  // Set arrowhead marker
  const isHighlighted = line.classList.contains('highlighted') || line.classList.contains('active-path');
  line.setAttribute('marker-end', isHighlighted ? 'url(#arrow-highlight)' : 'url(#arrow)');

  linksGroup.appendChild(line);
}

function drawNode(node) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'tree-node-group');
  g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
  g.setAttribute('data-val', node.val);

  // Node Circle
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('r', NODE_RADIUS);
  circle.setAttribute('class', 'node-circle');
  circle.setAttribute('id', `node-circle-${node.val}`);

  // Apply visual highlights from current animation frame
  if (animIndex >= 0 && animIndex < animationQueue.length) {
    const frame = animationQueue[animIndex];
    if (frame.nodesState && frame.nodesState[node.val]) {
      circle.classList.add(frame.nodesState[node.val]);
    }
  }

  // Node text label
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('class', 'node-text');
  text.textContent = node.val;

  // Node height indicators on subtrees (hover assistance)
  const heightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  heightText.setAttribute('class', 'node-label-height');
  heightText.setAttribute('y', NODE_RADIUS + 12);
  heightText.textContent = `h=${node.height} | bf=${tree.getBalanceFactor(node)}`;

  // SVG tooltip
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.textContent = `Node: ${node.val}\nHeight: ${node.height}\nBalance Factor: ${tree.getBalanceFactor(node)}`;

  g.appendChild(circle);
  g.appendChild(text);
  g.appendChild(heightText);
  g.appendChild(title);

  // Click handler to load Inspector data
  g.addEventListener('click', (e) => {
    e.stopPropagation();
    loadNodeIntoInspector(node);
  });

  nodesGroup.appendChild(g);
}

// ==========================================
// TELEMETRY UPDATER
// ==========================================
function updateTelemetry() {
  const nodes = Array.from(tree.nodeMap.values());
  valNodes.textContent = nodes.length;
  valHeight.textContent = tree.root ? tree.root.height - 1 : -1;
  valRoot.textContent = tree.root ? tree.root.val : 'None';

  // Leaf Count
  const leafCount = nodes.filter(n => !n.left && !n.right).length;
  valLeaves.textContent = leafCount;

  // Balanced status
  if (nodes.length === 0) {
    valBalanced.textContent = 'Empty';
    valBalanced.className = 'metric-value status-badge empty';
  } else {
    const isB = tree.isBalanced();
    valBalanced.textContent = isB.balanced ? 'Yes' : 'No';
    valBalanced.className = `metric-value status-badge ${isB.balanced ? 'balanced' : 'unbalanced'}`;
  }
}

// ==========================================
// NODE INSPECTOR PANEL
// ==========================================
function loadNodeIntoInspector(node) {
  nodeInspector.classList.remove('hidden');
  inspectVal.textContent = node.val;
  inspectDepth.textContent = node.depth;
  inspectHeight.textContent = node.height;
  
  const bf = tree.getBalanceFactor(node);
  inspectBf.textContent = bf;
  if (bf > 1 || bf < -1) {
    inspectBf.className = 'highlight-text danger-text';
  } else {
    inspectBf.className = '';
  }

  inspectParent.textContent = node.parent ? node.parent.val : 'None (Root Node)';
  
  let childrenStr = 'None';
  if (node.left && node.right) childrenStr = `Left: ${node.left.val}, Right: ${node.right.val}`;
  else if (node.left) childrenStr = `Left: ${node.left.val}`;
  else if (node.right) childrenStr = `Right: ${node.right.val}`;
  inspectChildren.textContent = childrenStr;

  // Compute path from Root to Node
  const path = [];
  let curr = node;
  while (curr) {
    path.unshift(curr.val);
    curr = curr.parent;
  }
  inspectPath.textContent = path.join(' → ');
}

btnCloseInspector.addEventListener('click', () => {
  nodeInspector.classList.add('hidden');
});

// ==========================================
// LOGS MODULE
// ==========================================
function addLogEntry(op, action, description, target) {
  const row = document.createElement('tr');
  const stepNum = logBody.querySelectorAll('tr:not(.empty-row)').length + 1;

  // Set style badge class
  let opClass = 'op-insert';
  if (op.toLowerCase().includes('delete')) opClass = 'op-delete';
  else if (op.toLowerCase().includes('find') || op.toLowerCase().includes('search')) opClass = 'op-search';
  else if (op.toLowerCase().includes('traverse')) opClass = 'op-traverse';
  else if (op.toLowerCase().includes('rotate')) opClass = 'op-rotate';

  row.innerHTML = `
    <td class="log-step">#${stepNum}</td>
    <td class="log-op ${opClass}">${op}</td>
    <td>${description}</td>
    <td class="log-target">${target}</td>
  `;

  // Remove empty label
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
// PSEUDOCODE TRACKER
// ==========================================
function loadPseudocode(type) {
  codeAlgoTitle.textContent = type.toUpperCase();
  const lines = PSEUDOCODE[type];
  if (!lines) {
    pseudocodeDisplay.innerHTML = '// Code trace loaded...';
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
// ANIMATION QUEUE EXECUTION
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
  renderTreeVisuals();
  
  // Clear pseudocode highlights
  const lines = pseudocodeDisplay.querySelectorAll('.code-line');
  lines.forEach(l => {
    l.classList.remove('active-line');
    l.classList.remove('check-line');
  });
}

function applyAnimationFrame(frame) {
  // Update node colors & paths on the SVG
  renderTreeVisuals();

  // Highlight line in Pseudocode tracker
  if (frame.pseudocodeLine) {
    highlightCodeLine(frame.pseudocodeLine, frame.highlightClass || 'active-line');
  }

  // Append entry to trace logs
  if (frame.log) {
    addLogEntry(frame.log.op, frame.log.action, frame.log.text, frame.log.targetVal);
  }

  // Execute structural change if this frame contains one (e.g. dynamic insert/delete trigger)
  if (frame.action) {
    frame.action();
  }
}

// ==========================================
// INTERACTIVE ALGORITHM SIMULATIONS
// ==========================================

// 1. Trace Find / Search
function buildSearchQueue(val) {
  resetAnimation();
  loadPseudocode('find');
  
  const queue = [];
  if (!tree.root) {
    queue.push({
      pseudocodeLine: 1,
      log: { op: 'Search', action: 'Null Check', text: 'Tree is empty. Cannot perform lookup.', targetVal: val }
    });
    animationQueue = queue;
    return;
  }

  let curr = tree.root;
  const visitedNodes = {};
  const visitedEdges = {};
  
  queue.push({
    nodesState: { ...visitedNodes, [curr.val]: 'checking' },
    pseudocodeLine: 1,
    log: { op: 'Search', action: 'Initialize', text: `Start search at Root node containing ${curr.val}`, targetVal: curr.val }
  });

  let found = false;
  while (curr) {
    visitedNodes[curr.val] = 'checking';
    
    queue.push({
      nodesState: { ...visitedNodes, [curr.val]: 'active' },
      edgesState: { ...visitedEdges },
      pseudocodeLine: 3,
      log: { op: 'Search', action: 'Compare', text: `Checking if node value ${curr.val} matches query ${val}`, targetVal: curr.val }
    });

    if (curr.val === val) {
      visitedNodes[curr.val] = 'found';
      queue.push({
        nodesState: { ...visitedNodes },
        edgesState: { ...visitedEdges },
        pseudocodeLine: 4,
        log: { op: 'Search', action: 'Found', text: `Matches query! Value ${val} found successfully.`, targetVal: val }
      });
      found = true;
      break;
    }

    const prev = curr;
    if (val < curr.val) {
      curr = curr.left;
      if (curr) {
        visitedEdges[`link-${prev.val}-${curr.val}`] = 'active-path';
        queue.push({
          nodesState: { ...visitedNodes, [curr.val]: 'checking' },
          edgesState: { ...visitedEdges },
          pseudocodeLine: 5,
          log: { op: 'Search', action: 'Branch Left', text: `${val} < ${prev.val}. Branching left to node ${curr.val}`, targetVal: curr.val }
        });
      } else {
        queue.push({
          nodesState: { ...visitedNodes },
          edgesState: { ...visitedEdges },
          pseudocodeLine: 6,
          log: { op: 'Search', action: 'Dead End', text: `${val} < ${prev.val}, but left child is null.`, targetVal: val }
        });
      }
    } else {
      curr = curr.right;
      if (curr) {
        visitedEdges[`link-${prev.val}-${curr.val}`] = 'active-path';
        queue.push({
          nodesState: { ...visitedNodes, [curr.val]: 'checking' },
          edgesState: { ...visitedEdges },
          pseudocodeLine: 7,
          log: { op: 'Search', action: 'Branch Right', text: `${val} > ${prev.val}. Branching right to node ${curr.val}`, targetVal: curr.val }
        });
      } else {
        queue.push({
          nodesState: { ...visitedNodes },
          edgesState: { ...visitedEdges },
          pseudocodeLine: 8,
          log: { op: 'Search', action: 'Dead End', text: `${val} > ${prev.val}, but right child is null.`, targetVal: val }
        });
      }
    }
  }

  if (!found) {
    queue.push({
      nodesState: { ...visitedNodes },
      edgesState: { ...visitedEdges },
      pseudocodeLine: 9,
      log: { op: 'Search', action: 'Not Found', text: `Search trajectory completed. Value ${val} is not present in tree.`, targetVal: val }
    });
  }

  animationQueue = queue;
}

// 2. Trace Insert
function buildInsertQueue(val) {
  resetAnimation();
  loadPseudocode('insert');
  const queue = [];

  // If already exists
  if (tree.nodeMap.has(val)) {
    queue.push({
      pseudocodeLine: 1,
      log: { op: 'Insert', action: 'Error', text: `Duplicate detected! Value ${val} already exists.`, targetVal: val }
    });
    animationQueue = queue;
    return;
  }

  if (!tree.root) {
    queue.push({
      pseudocodeLine: 1,
      log: { op: 'Insert', action: 'Check Empty', text: 'Tree is empty. Setting node as root.', targetVal: val }
    });
    queue.push({
      pseudocodeLine: 2,
      action: () => {
        tree.insertValue(val);
        tree.updateMetadata();
        triggerLayoutUpdate();
        updateTelemetry();
      },
      log: { op: 'Insert', action: 'Insert Root', text: `Inserted ${val} as new root node.`, targetVal: val }
    });
    animationQueue = queue;
    return;
  }

  let curr = tree.root;
  const visitedNodes = {};
  const visitedEdges = {};

  queue.push({
    nodesState: { ...visitedNodes, [curr.val]: 'checking' },
    pseudocodeLine: 4,
    log: { op: 'Insert', action: 'Start', text: `Begin search at root node ${curr.val} for value ${val}`, targetVal: curr.val }
  });

  let parent = null;
  while (curr) {
    parent = curr;
    visitedNodes[curr.val] = 'checking';

    if (val < curr.val) {
      curr = curr.left;
      if (curr) {
        visitedEdges[`link-${parent.val}-${curr.val}`] = 'active-path';
        queue.push({
          nodesState: { ...visitedNodes, [curr.val]: 'checking' },
          edgesState: { ...visitedEdges },
          pseudocodeLine: 6,
          log: { op: 'Insert', action: 'Go Left', text: `${val} < ${parent.val}. Traversing left subtree.`, targetVal: curr.val }
        });
      } else {
        // Find insert spot
        queue.push({
          nodesState: { ...visitedNodes },
          edgesState: { ...visitedEdges },
          pseudocodeLine: 7,
          log: { op: 'Insert', action: 'Spot Found', text: `${val} < ${parent.val}. Left child is null. Inserting here.`, targetVal: val }
        });
      }
    } else {
      curr = curr.right;
      if (curr) {
        visitedEdges[`link-${parent.val}-${curr.val}`] = 'active-path';
        queue.push({
          nodesState: { ...visitedNodes, [curr.val]: 'checking' },
          edgesState: { ...visitedEdges },
          pseudocodeLine: 11,
          log: { op: 'Insert', action: 'Go Right', text: `${val} > ${parent.val}. Traversing right subtree.`, targetVal: curr.val }
        });
      } else {
        // Find insert spot
        queue.push({
          nodesState: { ...visitedNodes },
          edgesState: { ...visitedEdges },
          pseudocodeLine: 12,
          log: { op: 'Insert', action: 'Spot Found', text: `${val} > ${parent.val}. Right child is null. Inserting here.`, targetVal: val }
        });
      }
    }
  }

  // Insert Action Frame
  queue.push({
    nodesState: { ...visitedNodes, [val]: 'found' },
    edgesState: { ...visitedEdges, [`link-${parent.val}-${val}`]: 'highlighted' },
    pseudocodeLine: val < parent.val ? 8 : 13,
    action: () => {
      tree.insertValue(val);
      tree.updateMetadata();
      triggerLayoutUpdate();
      updateTelemetry();
    },
    log: { op: 'Insert', action: 'Insert Complete', text: `Node ${val} successfully added as child of ${parent.val}.`, targetVal: val }
  });

  animationQueue = queue;
}

// 3. Trace Delete
function buildDeleteQueue(val, strategy) {
  resetAnimation();
  loadPseudocode('delete');
  const queue = [];

  if (!tree.nodeMap.has(val)) {
    queue.push({
      pseudocodeLine: 1,
      log: { op: 'Delete', action: 'Error', text: `Node ${val} does not exist in the tree.`, targetVal: val }
    });
    animationQueue = queue;
    return;
  }

  const node = tree.nodeMap.get(val);
  const parent = node.parent;

  queue.push({
    nodesState: { [val]: 'active' },
    pseudocodeLine: 1,
    log: { op: 'Delete', action: 'Locate Node', text: `Located node ${val} to delete. Checking child counts.`, targetVal: val }
  });

  // Case 1: Leaf
  if (!node.left && !node.right) {
    queue.push({
      nodesState: { [val]: 'deleted' },
      pseudocodeLine: 2,
      log: { op: 'Delete', action: 'Check Children', text: `Node ${val} has no children. Safe to remove directly.`, targetVal: val }
    });

    queue.push({
      pseudocodeLine: 3,
      action: () => {
        tree.deleteValue(val, strategy);
        tree.updateMetadata();
        triggerLayoutUpdate();
        updateTelemetry();
        nodeInspector.classList.add('hidden');
      },
      log: { op: 'Delete', action: 'Remove Node', text: `Node ${val} removed from tree parent.`, targetVal: val }
    });
  } 
  // Case 2: One Child
  else if (!node.left || !node.right) {
    const child = node.left ? node.left : node.right;
    queue.push({
      nodesState: { [val]: 'active', [child.val]: 'replacement' },
      pseudocodeLine: 4,
      log: { op: 'Delete', action: 'Check Children', text: `Node ${val} has exactly one child (${child.val}).`, targetVal: val }
    });

    queue.push({
      nodesState: { [val]: 'deleted', [child.val]: 'found' },
      pseudocodeLine: 5,
      action: () => {
        tree.deleteValue(val, strategy);
        tree.updateMetadata();
        triggerLayoutUpdate();
        updateTelemetry();
        nodeInspector.classList.add('hidden');
      },
      log: { op: 'Delete', action: 'Link Bypass', text: `Linked parent of ${val} directly to child ${child.val}.`, targetVal: child.val }
    });
  } 
  // Case 3: Two Children (Replace with Inorder Successor or Predecessor)
  else {
    queue.push({
      nodesState: { [val]: 'active' },
      pseudocodeLine: 6,
      log: { op: 'Delete', action: 'Check Children', text: `Node ${val} has two children. Finding replacement element.`, targetVal: val }
    });

    if (strategy === 'successor') {
      const succ = tree.findMin(node.right);
      
      // Step trace to find successor
      let succPath = [];
      let temp = node.right;
      while (temp) {
        succPath.push(temp.val);
        temp = temp.left;
      }
      
      queue.push({
        nodesState: { [val]: 'active', [succ.val]: 'replacement' },
        pseudocodeLine: 7,
        log: { op: 'Delete', action: 'Find Successor', text: `Located Inorder Successor (min of right subtree): ${succ.val} via path: [${succPath.join(' → ')}]`, targetVal: succ.val }
      });

      queue.push({
        nodesState: { [val]: 'found', [succ.val]: 'deleted' },
        pseudocodeLine: 8,
        log: { op: 'Delete', action: 'Value Swap', text: `Swapping values: Node ${val} takes successor value ${succ.val}. Now deleting original successor node.`, targetVal: val }
      });

      queue.push({
        nodesState: { [val]: 'found' },
        pseudocodeLine: 9,
        action: () => {
          tree.deleteValue(val, strategy);
          tree.updateMetadata();
          triggerLayoutUpdate();
          updateTelemetry();
          nodeInspector.classList.add('hidden');
        },
        log: { op: 'Delete', action: 'Subtree Delete', text: `Deleted old successor node containing ${succ.val} recursively.`, targetVal: succ.val }
      });
    } else {
      const pred = tree.findMax(node.left);
      
      // Step trace to find predecessor
      let predPath = [];
      let temp = node.left;
      while (temp) {
        predPath.push(temp.val);
        temp = temp.right;
      }

      queue.push({
        nodesState: { [val]: 'active', [pred.val]: 'replacement' },
        pseudocodeLine: 7,
        log: { op: 'Delete', action: 'Find Predecessor', text: `Located Inorder Predecessor (max of left subtree): ${pred.val} via path: [${predPath.join(' → ')}]`, targetVal: pred.val }
      });

      queue.push({
        nodesState: { [val]: 'found', [pred.val]: 'deleted' },
        pseudocodeLine: 8,
        log: { op: 'Delete', action: 'Value Swap', text: `Swapping values: Node ${val} takes predecessor value ${pred.val}. Now deleting original predecessor node.`, targetVal: val }
      });

      queue.push({
        nodesState: { [val]: 'found' },
        pseudocodeLine: 9,
        action: () => {
          tree.deleteValue(val, strategy);
          tree.updateMetadata();
          triggerLayoutUpdate();
          updateTelemetry();
          nodeInspector.classList.add('hidden');
        },
        log: { op: 'Delete', action: 'Subtree Delete', text: `Deleted old predecessor node containing ${pred.val} recursively.`, targetVal: pred.val }
      });
    }
  }

  animationQueue = queue;
}

// 4. Trace Traversals
function buildTraversalQueue(type) {
  resetAnimation();
  loadPseudocode('traversal');
  const queue = [];

  if (!tree.root) {
    queue.push({
      pseudocodeLine: 2,
      log: { op: 'Traversal', action: 'Empty Check', text: 'Tree is empty. Traversal complete.', targetVal: 'None' }
    });
    animationQueue = queue;
    return;
  }

  const visitedNodes = [];
  const activeStates = {};

  if (type === 'levelorder') {
    // BFS queue tracing
    const bfsNodes = tree.levelorderNodes();
    bfsNodes.forEach((node, index) => {
      activeStates[node.val] = 'found';
      queue.push({
        nodesState: { ...activeStates },
        pseudocodeLine: 5,
        log: { op: 'Traversal', action: 'Queue Process', text: `BFS Step ${index + 1}: Visited node ${node.val} at depth ${node.depth}`, targetVal: node.val }
      });
    });
  } else {
    // DFS Traversals (Inorder, Preorder, Postorder)
    const traverse = (node) => {
      if (!node) return;

      // 1. Preorder Visit
      if (type === 'preorder') {
        visitedNodes.push(node.val);
        activeStates[node.val] = 'found';
        queue.push({
          nodesState: { ...activeStates, [node.val]: 'active' },
          pseudocodeLine: 3,
          log: { op: 'Preorder', action: 'Visit Root', text: `Preorder visit node: ${node.val}`, targetVal: node.val }
        });
      } else {
        queue.push({
          nodesState: { ...activeStates, [node.val]: 'checking' },
          pseudocodeLine: 2,
          log: { op: 'Traversal', action: 'Traverse Call', text: `Checking left child of node: ${node.val}`, targetVal: node.val }
        });
      }

      // 2. Traverse Left
      if (node.left) {
        queue.push({
          nodesState: { ...activeStates, [node.val]: 'checking' },
          edgesState: { [`link-${node.val}-${node.left.val}`]: 'active-path' },
          pseudocodeLine: 4,
          log: { op: 'Traversal', action: 'Move Left', text: `Traversing left subtree of ${node.val}`, targetVal: node.left.val }
        });
      }
      traverse(node.left);

      // 3. Inorder Visit
      if (type === 'inorder') {
        visitedNodes.push(node.val);
        activeStates[node.val] = 'found';
        queue.push({
          nodesState: { ...activeStates, [node.val]: 'active' },
          pseudocodeLine: 5,
          log: { op: 'Inorder', action: 'Visit Node', text: `Inorder visit node: ${node.val}`, targetVal: node.val }
        });
      }

      // 4. Traverse Right
      if (node.right) {
        queue.push({
          nodesState: { ...activeStates, [node.val]: 'checking' },
          edgesState: { [`link-${node.val}-${node.right.val}`]: 'active-path' },
          pseudocodeLine: 6,
          log: { op: 'Traversal', action: 'Move Right', text: `Traversing right subtree of ${node.val}`, targetVal: node.right.val }
        });
      }
      traverse(node.right);

      // 5. Postorder Visit
      if (type === 'postorder') {
        visitedNodes.push(node.val);
        activeStates[node.val] = 'found';
        queue.push({
          nodesState: { ...activeStates, [node.val]: 'active' },
          pseudocodeLine: 7,
          log: { op: 'Postorder', action: 'Visit Root', text: `Postorder visit node: ${node.val}`, targetVal: node.val }
        });
      }
    };

    traverse(tree.root);
  }

  animationQueue = queue;
}

// 5. Trace Lowest Common Ancestor (LCA)
function buildLcaQueue(valA, valB) {
  resetAnimation();
  loadPseudocode('lca');
  const queue = [];

  if (!tree.nodeMap.has(valA) || !tree.nodeMap.has(valB)) {
    queue.push({
      pseudocodeLine: 1,
      log: { op: 'LCA Trace', action: 'Error', text: `One or both values (${valA}, ${valB}) do not exist in the tree.`, targetVal: 'None' }
    });
    animationQueue = queue;
    return;
  }

  let curr = tree.root;
  const visitedNodes = {};
  const visitedEdges = {};

  queue.push({
    nodesState: { ...visitedNodes, [curr.val]: 'checking' },
    pseudocodeLine: 1,
    log: { op: 'LCA Trace', action: 'Start', text: `LCA search initialized at root: ${curr.val}`, targetVal: curr.val }
  });

  while (curr) {
    visitedNodes[curr.val] = 'checking';
    
    // Highlight paths of target nodes
    visitedNodes[valA] = 'highlighted-sub';
    visitedNodes[valB] = 'highlighted-sub';

    queue.push({
      nodesState: { ...visitedNodes, [curr.val]: 'active' },
      edgesState: { ...visitedEdges },
      pseudocodeLine: 2,
      log: { op: 'LCA Trace', action: 'Checking Node', text: `Inspecting node ${curr.val} for LCA bounds.`, targetVal: curr.val }
    });

    if (valA < curr.val && valB < curr.val) {
      const prev = curr;
      curr = curr.left;
      visitedEdges[`link-${prev.val}-${curr.val}`] = 'active-path';
      queue.push({
        nodesState: { ...visitedNodes, [curr.val]: 'checking' },
        edgesState: { ...visitedEdges },
        pseudocodeLine: 3,
        log: { op: 'LCA Trace', action: 'Go Left', text: `Both ${valA} and ${valB} < ${prev.val}. LCA must be in left child ${curr.val}`, targetVal: curr.val }
      });
    } else if (valA > curr.val && valB > curr.val) {
      const prev = curr;
      curr = curr.right;
      visitedEdges[`link-${prev.val}-${curr.val}`] = 'active-path';
      queue.push({
        nodesState: { ...visitedNodes, [curr.val]: 'checking' },
        edgesState: { ...visitedEdges },
        pseudocodeLine: 5,
        log: { op: 'LCA Trace', action: 'Go Right', text: `Both ${valA} and ${valB} > ${prev.val}. LCA must be in right child ${curr.val}`, targetVal: curr.val }
      });
    } else {
      // Current node is split point or matches one of the values. This is LCA!
      visitedNodes[curr.val] = 'lca';
      queue.push({
        nodesState: { ...visitedNodes },
        edgesState: { ...visitedEdges },
        pseudocodeLine: 8,
        log: { op: 'LCA Trace', action: 'LCA Found', text: `Split point reached at node ${curr.val}. Lowest Common Ancestor is ${curr.val}.`, targetVal: curr.val }
      });
      break;
    }
  }

  animationQueue = queue;
}

// 6. Tree Rotations
function triggerRotation(val, direction) {
  resetAnimation();
  loadPseudocode(direction === 'left' ? 'rotateLeft' : 'rotateRight');

  if (!tree.nodeMap.has(val)) {
    addLogEntry('Rotation', 'Error', `Node ${val} does not exist. Cannot rotate.`, val);
    return;
  }

  const node = tree.nodeMap.get(val);
  const queue = [];

  if (direction === 'left') {
    if (!node.right) {
      addLogEntry('Rotation', 'Error', `Node ${val} has no right child. Cannot perform Left Rotation.`, val);
      return;
    }
    const pivot = node.right;
    queue.push({
      nodesState: { [node.val]: 'active', [pivot.val]: 'checking' },
      pseudocodeLine: 1,
      log: { op: 'Rotate Left', action: 'Pivot Check', text: `Selected right child ${pivot.val} of node ${node.val} as pivot.`, targetVal: pivot.val }
    });
    
    queue.push({
      nodesState: { [node.val]: 'active', [pivot.val]: 'found' },
      pseudocodeLine: 3,
      action: () => {
        tree.rotateLeft(val);
        tree.updateMetadata();
        triggerLayoutUpdate();
        updateTelemetry();
        nodeInspector.classList.add('hidden');
      },
      log: { op: 'Rotate Left', action: 'Rotate Executed', text: `Pivot ${pivot.val} raised above node ${node.val}. Rotations complete.`, targetVal: pivot.val }
    });
  } else {
    if (!node.left) {
      addLogEntry('Rotation', 'Error', `Node ${val} has no left child. Cannot perform Right Rotation.`, val);
      return;
    }
    const pivot = node.left;
    queue.push({
      nodesState: { [node.val]: 'active', [pivot.val]: 'checking' },
      pseudocodeLine: 1,
      log: { op: 'Rotate Right', action: 'Pivot Check', text: `Selected left child ${pivot.val} of node ${node.val} as pivot.`, targetVal: pivot.val }
    });
    
    queue.push({
      nodesState: { [node.val]: 'active', [pivot.val]: 'found' },
      pseudocodeLine: 3,
      action: () => {
        tree.rotateRight(val);
        tree.updateMetadata();
        triggerLayoutUpdate();
        updateTelemetry();
        nodeInspector.classList.add('hidden');
      },
      log: { op: 'Rotate Right', action: 'Rotate Executed', text: `Pivot ${pivot.val} raised above node ${node.val}. Rotations complete.`, targetVal: pivot.val }
    });
  }

  animationQueue = queue;
  playAnimation();
}

// ==========================================
// INTERACTIVE SVG CAMERA CONTROL (PAN & ZOOM)
// ==========================================
function updateSvgTransform() {
  panGroup.setAttribute('transform', `translate(${panX}, ${panY}) scale(${scale})`);
}

svgWrapper.addEventListener('mousedown', (e) => {
  if (e.target.tagName === 'svg' || e.target.id === 'links-group' || e.target.id === 'nodes-group' || e.target.id === 'svg-pan-group') {
    isDragging = true;
    startDragX = e.clientX - panX;
    startDragY = e.clientY - panY;
  }
});

svgWrapper.addEventListener('mousemove', (e) => {
  if (isDragging) {
    panX = e.clientX - startDragX;
    panY = e.clientY - startDragY;
    updateSvgTransform();
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
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

  // Adjust zoom towards mouse pointer position
  const rect = svgWrapper.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  panX = mouseX - (mouseX - panX) * (scale / oldScale);
  panY = mouseY - (mouseY - panY) * (scale / oldScale);

  updateSvgTransform();
});

// Fit Tree boundaries to canvas
function centerTree() {
  const nodes = Array.from(tree.nodeMap.values());
  if (nodes.length === 0) return;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  nodes.forEach(n => {
    minX = Math.min(minX, n.targetX);
    maxX = Math.max(maxX, n.targetX);
    minY = Math.min(minY, n.targetY);
    maxY = Math.max(maxY, n.targetY);
  });

  const treeW = maxX - minX;
  const treeH = maxY - minY;

  const rect = svgWrapper.getBoundingClientRect();
  const canvasW = rect.width;
  const canvasH = rect.height;

  // Calculate zoom fitting multiplier
  const padding = 60;
  const zoomX = (canvasW - padding * 2) / (treeW || 1);
  const zoomY = (canvasH - padding * 2) / (treeH || 1);
  scale = Math.min(1.2, Math.max(0.4, Math.min(zoomX, zoomY)));

  // Shift to center of canvas
  panX = (canvasW - (treeW * scale)) / 2 - minX * scale;
  panY = 60;

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

btnZoomReset.addEventListener('click', centerTree);

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

// Display Custom Array input if custom selected
presetSelect.addEventListener('change', () => {
  if (presetSelect.value === 'custom') {
    customArrayGroup.classList.remove('hidden');
  } else {
    customArrayGroup.classList.add('hidden');
  }
});

btnSeed.addEventListener('click', () => {
  loadPreset(presetSelect.value);
});

btnInsert.addEventListener('click', () => {
  const val = parseInt(insertVal.value);
  if (isNaN(val) || val < 1 || val > 999) {
    addLogEntry('System', 'Validation Error', 'Input must be a valid number between 1 and 999.', 'None');
    return;
  }
  
  if (tree.nodeMap.has(val)) {
    addLogEntry('Insert', 'Error', `Value ${val} is already in the tree.`, val);
    return;
  }

  buildInsertQueue(val);
  insertVal.value = '';
  playAnimation();
});

insertVal.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnInsert.click();
});

btnDelete.addEventListener('click', () => {
  const val = parseInt(deleteVal.value);
  if (isNaN(val) || val < 1 || val > 999) {
    addLogEntry('System', 'Validation Error', 'Input must be a valid number between 1 and 999.', 'None');
    return;
  }

  if (!tree.nodeMap.has(val)) {
    addLogEntry('Delete', 'Error', `Node ${val} does not exist in the tree.`, val);
    return;
  }

  const strategy = document.querySelector('input[name="del-strategy"]:checked').value;
  buildDeleteQueue(val, strategy);
  deleteVal.value = '';
  playAnimation();
});

deleteVal.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnDelete.click();
});

btnFind.addEventListener('click', () => {
  const val = parseInt(findVal.value);
  if (isNaN(val) || val < 1 || val > 999) {
    addLogEntry('System', 'Validation Error', 'Input must be a valid number between 1 and 999.', 'None');
    return;
  }

  buildSearchQueue(val);
  findVal.value = '';
  playAnimation();
});

findVal.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnFind.click();
});

btnLca.addEventListener('click', () => {
  const valA = parseInt(lcaVal1.value);
  const valB = parseInt(lcaVal2.value);
  if (isNaN(valA) || isNaN(valB) || valA < 1 || valA > 999 || valB < 1 || valB > 999) {
    addLogEntry('System', 'Validation Error', 'Enter valid integers between 1 and 999 for both fields.', 'None');
    return;
  }

  buildLcaQueue(valA, valB);
  lcaVal1.value = '';
  lcaVal2.value = '';
  playAnimation();
});

btnRotateLeft.addEventListener('click', () => {
  const val = parseInt(rotateVal.value);
  if (isNaN(val)) return;
  triggerRotation(val, 'left');
  rotateVal.value = '';
});

btnRotateRight.addEventListener('click', () => {
  const val = parseInt(rotateVal.value);
  if (isNaN(val)) return;
  triggerRotation(val, 'right');
  rotateVal.value = '';
});

rotateVal.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    // Left rotate by default on Enter
    btnRotateLeft.click();
  }
});

// Traversal operations
traversalSelect.addEventListener('change', () => {
  resetAnimation();
});

btnPlay.addEventListener('click', () => {
  if (isPlaying) {
    pauseAnimation();
  } else {
    if (animationQueue.length === 0 || animIndex === animationQueue.length - 1) {
      // Initialize a new animation queue if empty/finished
      buildTraversalQueue(traversalSelect.value);
    }
    playAnimation();
  }
});

btnStep.addEventListener('click', () => {
  if (animationQueue.length === 0 || animIndex === animationQueue.length - 1) {
    buildTraversalQueue(traversalSelect.value);
  }
  stepForward();
});

btnResetAnim.addEventListener('click', () => {
  resetAnimation();
});

speedSlider.addEventListener('input', () => {
  speed = parseInt(speedSlider.value);
  speedVal.textContent = `${speed}ms`;
});

btnClearTree.addEventListener('click', () => {
  tree.clear();
  nodeInspector.classList.add('hidden');
  resetAnimation();
  clearLogs();
  updateTelemetry();
  renderTreeVisuals();
  addLogEntry('System', 'Clear Workspace', 'All tree nodes purged successfully.', 'All');
});

btnBalanceAvl.addEventListener('click', () => {
  if (!tree.root) return;
  tree.balanceTree();
  tree.updateMetadata();
  triggerLayoutUpdate();
  updateTelemetry();
  centerTree();
  addLogEntry('System', 'Rebalance Tree', 'Tree structure balanced using global AVL array alignment.', 'Root');
});

// Handle canvas resize
window.addEventListener('resize', () => {
  triggerLayoutUpdate();
});

// Initialize first preset tree
loadPreset('balanced');
updateTelemetry();
setTimeout(centerTree, 300);
