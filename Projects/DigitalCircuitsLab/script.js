// Application States
let state = {
  nodes: [],          // Placed circuit nodes
  wires: [],          // Connection wires
  selectedElement: null, // Placed node or connection
  activeLabId: null,  // Currently active educational challenge
  drawingWire: null,  // Holds temporary connection coordinates during drag
  theme: 'dark'
};

// Component Definitions
const COMPONENT_TYPES = {
  INPUT: { label: 'Input Switch', w: 70, h: 40, inputs: 0, outputs: 1 },
  OUTPUT: { label: 'Output Bulb', w: 50, h: 50, inputs: 1, outputs: 0 },
  AND: { label: 'AND Gate', w: 90, h: 60, inputs: 2, outputs: 1 },
  OR: { label: 'OR Gate', w: 90, h: 60, inputs: 2, outputs: 1 },
  NOT: { label: 'NOT Gate', w: 80, h: 50, inputs: 1, outputs: 1 },
  XOR: { label: 'XOR Gate', w: 90, h: 60, inputs: 2, outputs: 1 },
  NAND: { label: 'NAND Gate', w: 90, h: 60, inputs: 2, outputs: 1 }
};

// DOM Elements
const svg = document.getElementById('schematic-canvas');
const wiresGroup = document.getElementById('wires-group');
const nodesGroup = document.getElementById('nodes-group');
const tempWire = document.getElementById('temp-wire');
const componentPalette = document.getElementById('component-palette');
const selectionDetailsPane = document.getElementById('selection-details-pane');
const activeLabBadge = document.getElementById('active-lab-badge');
const activeLabName = document.getElementById('active-lab-name');
const verificationPanel = document.getElementById('verification-panel');
const verifyCircuitBtn = document.getElementById('verify-circuit-btn');
const quitLabBtn = document.getElementById('quit-lab-btn');
const clearCanvasBtn = document.getElementById('clear-canvas-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initializePalette();
  initializeUI();
  setupEvents();
  loadStateFromLocalStorage();
  evaluateCircuit();
  redraw();
  lucide.createIcons();
});

// Setup Left Component Palette
function initializePalette() {
  componentPalette.innerHTML = '';
  Object.keys(COMPONENT_TYPES).forEach(type => {
    const item = document.createElement('div');
    item.className = 'palette-item';
    item.innerHTML = `
      <i data-lucide="${getIconForType(type)}"></i>
      <span>${COMPONENT_TYPES[type].label}</span>
    `;
    item.addEventListener('click', () => spawnNode(type));
    componentPalette.appendChild(item);
  });
}

function getIconForType(type) {
  switch (type) {
    case 'INPUT': return 'toggle-left';
    case 'OUTPUT': return 'lightbulb';
    case 'AND': return 'shuffle';
    case 'OR': return 'merge';
    case 'NOT': return 'circle-dot';
    case 'XOR': return 'git-branch';
    case 'NAND': return 'circle-off';
    default: return 'component';
  }
}

// Config Panel setups
function initializeUI() {
  themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    themeIcon.setAttribute('data-lucide', state.theme === 'light' ? 'sun' : 'moon');
    lucide.createIcons();
    saveStateToLocalStorage();
  });

  clearCanvasBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your current circuit design?")) {
      state.nodes = [];
      state.wires = [];
      state.selectedElement = null;
      saveStateToLocalStorage();
      evaluateCircuit();
      redraw();
      updateInspectionPane();
    }
  });

  // Setup Labs
  document.querySelectorAll('.start-lab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const labId = btn.getAttribute('data-lab');
      startLab(labId);
    });
  });

  quitLabBtn.addEventListener('click', quitLab);
  verifyCircuitBtn.addEventListener('click', verifyActiveLabCircuit);
}

// Drag & Drop event bindings
let draggedNode = null;
let offset = { x: 0, y: 0 };

function setupEvents() {
  // Click on canvas background deselects elements
  svg.addEventListener('click', (e) => {
    if (e.target.id === 'canvas-bg' || e.target.id === 'schematic-canvas') {
      state.selectedElement = null;
      redraw();
      updateInspectionPane();
    }
  });

  // Wire drawing tracker
  svg.addEventListener('mousemove', handleMouseMove);
  svg.addEventListener('mouseup', handleMouseUp);

  // Keypress listener to delete selected elements
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (state.selectedElement) {
        if (state.selectedElement.fromNodeId) {
          // It's a wire
          state.wires = state.wires.filter(w => w !== state.selectedElement);
        } else {
          // It's a node
          const nodeId = state.selectedElement.id;
          state.nodes = state.nodes.filter(n => n.id !== nodeId);
          // Delete attached wires
          state.wires = state.wires.filter(w => w.fromNodeId !== nodeId && w.toNodeId !== nodeId);
        }
        state.selectedElement = null;
        saveStateToLocalStorage();
        evaluateCircuit();
        redraw();
        updateInspectionPane();
      }
    }
  });
}

// Spawn component nodes
function spawnNode(type, x = 150, y = 100) {
  const def = COMPONENT_TYPES[type];
  const newNode = {
    id: 'node_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    type,
    label: def.label,
    x,
    y,
    w: def.w,
    h: def.h,
    inputs: Array(def.inputs).fill(false),  // Low logic state initial
    outputs: Array(def.outputs).fill(false),
    switchState: false // Specific to INPUT toggle switches
  };

  state.nodes.push(newNode);
  saveStateToLocalStorage();
  evaluateCircuit();
  redraw();
}

// Draw wires, nodes, terminals
function redraw() {
  // Clear lists
  wiresGroup.innerHTML = '';
  nodesGroup.innerHTML = '';

  // 1. Draw Wires
  state.wires.forEach(wire => {
    const fromNode = state.nodes.find(n => n.id === wire.fromNodeId);
    const toNode = state.nodes.find(n => n.id === wire.toNodeId);

    if (fromNode && toNode) {
      const start = getTerminalCoord(fromNode, 'out', wire.fromOutputIdx);
      const end = getTerminalCoord(toNode, 'in', wire.toInputIdx);
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const dx = Math.abs(end.x - start.x) * 0.5;
      path.setAttribute('d', `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`);
      
      const isActive = fromNode.outputs[wire.fromOutputIdx];
      path.setAttribute('class', `wire-path ${isActive ? 'active' : ''} ${state.selectedElement === wire ? 'selected' : ''}`);
      
      // Select wire handler
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedElement = wire;
        redraw();
        updateInspectionPane();
      });

      wiresGroup.appendChild(path);
    }
  });

  // 2. Draw Nodes
  state.nodes.forEach(node => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    g.setAttribute('class', 'circuit-node');

    const isSelected = state.selectedElement === node;

    // Draw main body shape
    if (node.type === 'INPUT') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', node.w);
      rect.setAttribute('height', node.h);
      rect.setAttribute('rx', '8');
      rect.setAttribute('class', `switch-base ${node.switchState ? 'active' : ''} ${isSelected ? 'selected' : ''}`);
      
      // Toggle Switch action
      rect.addEventListener('click', (e) => {
        e.stopPropagation();
        node.switchState = !node.switchState;
        saveStateToLocalStorage();
        evaluateCircuit();
        redraw();
        updateInspectionPane();
      });

      // Lever circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.switchState ? 48 : 22);
      circle.setAttribute('cy', 20);
      circle.setAttribute('r', '8');
      circle.setAttribute('class', 'switch-lever');
      
      g.appendChild(rect);
      g.appendChild(circle);

    } else if (node.type === 'OUTPUT') {
      // Glow boundary ring
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('cx', 25);
      glow.setAttribute('cy', 25);
      glow.setAttribute('r', '24');
      const isActive = node.inputs[0];
      glow.setAttribute('class', `bulb-glow ${isActive ? 'active' : ''}`);

      const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      core.setAttribute('cx', 25);
      core.setAttribute('cy', 25);
      core.setAttribute('r', '14');
      core.setAttribute('class', `bulb-core ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`);

      g.appendChild(glow);
      g.appendChild(core);

    } else {
      // Logic Gate base shapes
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', getGatePath(node.type, node.w, node.h));
      path.setAttribute('class', `gate-body ${isSelected ? 'selected' : ''}`);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.w / 2);
      text.setAttribute('y', node.h / 2 + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'gate-label');
      text.textContent = node.type;

      g.appendChild(path);
      g.appendChild(text);
    }

    // Add drag handlers to node body
    g.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('terminal-pin')) return; // Ignore drag triggers on terminals
      draggedNode = node;
      offset.x = e.clientX - node.x;
      offset.y = e.clientY - node.y;
      state.selectedElement = node;
      redraw();
      updateInspectionPane();
    });

    // 3. Draw input terminals (on left boundary)
    for (let i = 0; i < node.inputs.length; i++) {
      const pinCoord = getTerminalRelativeOffset(node, 'in', i);
      const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pin.setAttribute('cx', pinCoord.x);
      pin.setAttribute('cy', pinCoord.y);
      pin.setAttribute('r', '5');
      pin.setAttribute('class', `terminal-pin ${node.inputs[i] ? 'active' : ''}`);
      
      // Wire ending target listeners
      pin.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        if (state.drawingWire) {
          createWireConnection(state.drawingWire.fromNodeId, state.drawingWire.fromOutputIdx, node.id, i);
        }
      });

      g.appendChild(pin);
    }

    // 4. Draw output terminals (on right boundary)
    for (let i = 0; i < node.outputs.length; i++) {
      const pinCoord = getTerminalRelativeOffset(node, 'out', i);
      const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pin.setAttribute('cx', pinCoord.x);
      pin.setAttribute('cy', pinCoord.y);
      pin.setAttribute('r', '5');
      pin.setAttribute('class', `terminal-pin ${node.outputs[i] ? 'active' : ''}`);

      // Drag wire start actions
      pin.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const start = getTerminalCoord(node, 'out', i);
        state.drawingWire = {
          fromNodeId: node.id,
          fromOutputIdx: i,
          startX: start.x,
          startY: start.y
        };
      });

      g.appendChild(pin);
    }

    nodesGroup.appendChild(g);
  });
}

// Coordinate calculators
function getTerminalRelativeOffset(node, dir, index) {
  const count = dir === 'in' ? node.inputs.length : node.outputs.length;
  const spacing = node.h / (count + 1);
  const y = spacing * (index + 1);
  const x = dir === 'in' ? 0 : node.w;
  return { x, y };
}

function getTerminalCoord(node, dir, index) {
  const relative = getTerminalRelativeOffset(node, dir, index);
  return {
    x: node.x + relative.x,
    y: node.y + relative.y
  };
}

// Logic gate graphic shapes builders
function getGatePath(type, w, h) {
  switch(type) {
    case 'NOT':
      return `M 0,0 L ${w - 15},${h / 2} L 0,${h} Z M ${w - 15},${h / 2} m 5,0 a 5,5 0 1,0 -10,0 a 5,5 0 1,0 10,0`;
    case 'OR':
    case 'XOR':
      return `M 0,0 Q ${w/3},${h/2} 0,${h} Q ${w/2},${h} ${w},${h/2} Q ${w/2},0 0,0`;
    case 'NAND':
      return `M 0,0 H ${w - 15} A ${h/2},${h/2} 0 0,1 ${w - 15},${h} H 0 Z M ${w - 15},${h/2} m 5,0 a 5,5 0 1,0 -10,0 a 5,5 0 1,0 10,0`;
    default: // AND
      return `M 0,0 H ${w/2} A ${h/2},${h/2} 0 0,1 ${w/2},${h} H 0 Z`;
  }
}

// Mouse movement triggers
function handleMouseMove(e) {
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (draggedNode) {
    draggedNode.x = mouseX - offset.x;
    draggedNode.y = mouseY - offset.y;
    
    // Snap-to-grid controls (20px resolution)
    draggedNode.x = Math.round(draggedNode.x / 20) * 20;
    draggedNode.y = Math.round(draggedNode.y / 20) * 20;

    redraw();
  } else if (state.drawingWire) {
    // Render draft wire line dynamically
    tempWire.style.display = 'block';
    const start = state.drawingWire;
    const dx = Math.abs(mouseX - start.startX) * 0.5;
    tempWire.setAttribute('d', `M ${start.startX} ${start.startY} C ${start.startX + dx} ${start.startY}, ${mouseX - dx} ${mouseY}, ${mouseX} ${mouseY}`);
  }
}

function handleMouseUp() {
  draggedNode = null;
  state.drawingWire = null;
  tempWire.style.display = 'none';
  saveStateToLocalStorage();
}

// Connection creator logic
function createWireConnection(fromId, outIdx, toId, inIdx) {
  // Prevent cycles or inputs already connected
  const alreadyConnected = state.wires.some(w => w.toNodeId === toId && w.toInputIdx === inIdx);
  if (alreadyConnected || fromId === toId) return;

  const newWire = {
    fromNodeId: fromId,
    fromOutputIdx: outIdx,
    toNodeId: toId,
    toInputIdx: inIdx
  };

  state.wires.push(newWire);
  saveStateToLocalStorage();
  evaluateCircuit();
  redraw();
}

// Live simulation propagation loop engine
function evaluateCircuit() {
  // 1. Reset all inputs of logic gates downstream to false
  state.nodes.forEach(node => {
    if (node.type !== 'INPUT') {
      node.inputs.fill(false);
    }
  });

  // Evaluate topological orders iteratively (using Simple BFS/Graph traversal)
  let queue = state.nodes.filter(n => n.type === 'INPUT');
  
  // Set starting values for inputs
  queue.forEach(n => {
    n.outputs[0] = n.switchState;
  });

  // Build temporary nodes lookup list
  const nodeMap = {};
  state.nodes.forEach(n => { nodeMap[n.id] = n; });

  // Evaluate logic states down the wires
  let iterations = 0;
  const maxIterations = 200; // Prevent infinite feedback loops

  while (queue.length > 0 && iterations < maxIterations) {
    const node = queue.shift();
    iterations++;

    // Propagate output states downstream
    const outgoingWires = state.wires.filter(w => w.fromNodeId === node.id);
    outgoingWires.forEach(wire => {
      const targetNode = nodeMap[wire.toNodeId];
      if (targetNode) {
        // Set input state of downstream pin
        const signal = node.outputs[wire.fromOutputIdx];
        targetNode.inputs[wire.toInputIdx] = signal;
        
        // Evaluate target logic
        const oldOutputs = [...targetNode.outputs];
        evaluateNodeLogic(targetNode);
        
        // Queue target node if output values changed
        const outputChanged = targetNode.outputs.some((val, idx) => val !== oldOutputs[idx]);
        if (outputChanged || targetNode.type === 'OUTPUT') {
          queue.push(targetNode);
        }
      }
    });
  }
}

function evaluateNodeLogic(node) {
  const i0 = node.inputs[0];
  const i1 = node.inputs[1];

  switch (node.type) {
    case 'AND':
      node.outputs[0] = i0 && i1;
      break;
    case 'OR':
      node.outputs[0] = i0 || i1;
      break;
    case 'NOT':
      node.outputs[0] = !i0;
      break;
    case 'XOR':
      node.outputs[0] = i0 !== i1;
      break;
    case 'NAND':
      node.outputs[0] = !(i0 && i1);
      break;
    case 'OUTPUT':
      // Output bulbs have no outputs, only visual states
      break;
  }
}

// Component Inspector details builder & Truth Tables
function updateInspectionPane() {
  selectionDetailsPane.innerHTML = '';
  
  const selected = state.selectedElement;
  if (!selected || selected.fromNodeId) {
    // No node selected
    selectionDetailsPane.innerHTML = `
      <div class="empty-selection">
        <p>Click a logic gate component on the canvas to inspect its current Boolean state.</p>
      </div>
    `;
    return;
  }

  // It's a node
  const node = selected;
  const inputsHtml = node.inputs.map((val, idx) => `
    <div class="detail-state">
      <span>Input Terminal ${idx + 1}</span>
      <span class="state-badge ${val ? 'high' : 'low'}">${val ? 'HIGH (1)' : 'LOW (0)'}</span>
    </div>
  `).join('');

  const outputsHtml = node.outputs.map((val, idx) => `
    <div class="detail-state">
      <span>Output Terminal ${idx + 1}</span>
      <span class="state-badge ${val ? 'high' : 'low'}">${val ? 'HIGH (1)' : 'LOW (0)'}</span>
    </div>
  `).join('');

  let extraHtml = '';
  if (['AND', 'OR', 'NOT', 'XOR', 'NAND'].includes(node.type)) {
    extraHtml = `
      <div style="margin-top: 12px;">
        <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Truth Table</h4>
        ${getTruthTableHtml(node)}
      </div>
    `;
  }

  selectionDetailsPane.innerHTML = `
    <div class="detail-card">
      <div class="detail-title">${node.label}</div>
      <div class="detail-body" style="display: flex; flex-direction: column; gap: 8px;">
        ${inputsHtml}
        ${outputsHtml}
      </div>
      ${extraHtml}
    </div>
  `;
}

function getTruthTableHtml(node) {
  if (node.type === 'NOT') {
    const activeVal = node.inputs[0] ? 1 : 0;
    return `
      <table class="truth-table">
        <thead>
          <tr><th>Input</th><th>Output</th></tr>
        </thead>
        <tbody>
          <tr class="${activeVal === 0 ? 'active-row' : ''}"><td>0</td><td>1</td></tr>
          <tr class="${activeVal === 1 ? 'active-row' : ''}"><td>1</td><td>0</td></tr>
        </tbody>
      </table>
    `;
  }

  // Two input gates (AND, OR, XOR, NAND)
  const i0 = node.inputs[0] ? 1 : 0;
  const i1 = node.inputs[1] ? 1 : 0;
  
  const getOutput = (a, b) => {
    if (node.type === 'AND') return a && b;
    if (node.type === 'OR') return a || b;
    if (node.type === 'XOR') return a !== b;
    if (node.type === 'NAND') return !(a && b);
    return 0;
  };

  const rows = [
    [0, 0], [0, 1], [1, 0], [1, 1]
  ].map(([a, b]) => {
    const isCurrent = (a === i0 && b === i1);
    const outVal = getOutput(a, b) ? 1 : 0;
    return `<tr class="${isCurrent ? 'active-row' : ''}"><td>${a}</td><td>${b}</td><td>${outVal}</td></tr>`;
  }).join('');

  return `
    <table class="truth-table">
      <thead>
        <tr><th>A</th><th>B</th><th>Output</th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Educational challenges Verification Engine
function startLab(labId) {
  state.activeLabId = labId;
  
  // Highlight lab visual card
  document.querySelectorAll('.lab-item-card').forEach(card => {
    card.classList.remove('completed');
    if (card.getAttribute('data-lab') === labId) {
      card.style.borderColor = 'var(--warning)';
    } else {
      card.style.borderColor = 'var(--card-border)';
    }
  });

  // Display badges
  activeLabBadge.style.display = 'flex';
  verificationPanel.style.display = 'block';
  
  if (labId === 'lab1') activeLabName.textContent = 'NOT from NAND';
  if (labId === 'lab2') activeLabName.textContent = 'Exclusive OR (XOR)';
  if (labId === 'lab3') activeLabName.textContent = 'Half Adder';
}

function quitLab() {
  state.activeLabId = null;
  activeLabBadge.style.display = 'none';
  verificationPanel.style.display = 'none';
  document.querySelectorAll('.lab-item-card').forEach(card => {
    card.style.borderColor = 'var(--card-border)';
  });
}

function verifyActiveLabCircuit() {
  if (!state.activeLabId) return;

  let success = false;
  
  if (state.activeLabId === 'lab1') {
    success = verifyNandInverter();
  } else if (state.activeLabId === 'lab2') {
    success = verifyXorCircuit();
  } else if (state.activeLabId === 'lab3') {
    success = verifyHalfAdderCircuit();
  }

  if (success) {
    alert("🎉 Lab Completed Successfully! Excellent circuit design.");
    const activeCard = document.querySelector(`.lab-item-card[data-lab="${state.activeLabId}"]`);
    if (activeCard) activeCard.classList.add('completed');
    quitLab();
  } else {
    alert("❌ Verification Failed. Circuit outputs do not match the expected Boolean truth table. Verify your wiring connection!");
  }
}

// Lab 1: Verify NAND Inverter
function verifyNandInverter() {
  // Find switch and NAND gate
  const switches = state.nodes.filter(n => n.type === 'INPUT');
  const nands = state.nodes.filter(n => n.type === 'NAND');
  const bulbs = state.nodes.filter(n => n.type === 'OUTPUT');

  if (switches.length !== 1 || nands.length !== 1 || bulbs.length !== 1) return false;

  const inputSwitch = switches[0];
  const nandGate = nands[0];
  const outputBulb = bulbs[0];

  // Test both logic input combinations (0 and 1)
  const testVal = (stateVal) => {
    inputSwitch.switchState = stateVal;
    evaluateCircuit();
    // NOT outputs should be inverse of inputs
    return outputBulb.inputs[0] === !stateVal;
  };

  return testVal(false) && testVal(true);
}

// Lab 2: Verify XOR Circuit
function verifyXorCircuit() {
  const switches = state.nodes.filter(n => n.type === 'INPUT');
  const bulbs = state.nodes.filter(n => n.type === 'OUTPUT');

  if (switches.length !== 2 || bulbs.length !== 1) return false;

  const sa = switches[0];
  const sb = switches[1];
  const bulb = bulbs[0];

  // Test truth table
  const testVal = (a, b) => {
    sa.switchState = a;
    sb.switchState = b;
    evaluateCircuit();
    return bulb.inputs[0] === (a !== b); // XOR check
  };

  return testVal(false, false) && testVal(false, true) && testVal(true, false) && testVal(true, true);
}

// Lab 3: Verify Half Adder Circuit
function verifyHalfAdderCircuit() {
  const switches = state.nodes.filter(n => n.type === 'INPUT');
  const bulbs = state.nodes.filter(n => n.type === 'OUTPUT');

  // Must have 2 inputs (A, B) and 2 outputs (Sum, Carry)
  if (switches.length !== 2 || bulbs.length !== 2) return false;

  const sa = switches[0];
  const sb = switches[1];

  // We need to identify Sum vs Carry bulbs by tracing.
  // Evaluate combinations
  let carryBulb = null;
  let sumBulb = null;

  // Let's analyze outputs to distinguish Sum vs Carry
  sa.switchState = true;
  sb.switchState = true;
  evaluateCircuit();
  // when A=1, B=1: Carry=1, Sum=0
  if (bulbs[0].inputs[0] === true && bulbs[1].inputs[0] === false) {
    carryBulb = bulbs[0];
    sumBulb = bulbs[1];
  } else if (bulbs[1].inputs[0] === true && bulbs[0].inputs[0] === false) {
    carryBulb = bulbs[1];
    sumBulb = bulbs[0];
  } else {
    return false; // Neither behaved as carry
  }

  // Now verify remaining combinations
  const testVal = (a, b) => {
    sa.switchState = a;
    sb.switchState = b;
    evaluateCircuit();
    const sumExpected = a !== b;
    const carryExpected = a && b;
    return sumBulb.inputs[0] === sumExpected && carryBulb.inputs[0] === carryExpected;
  };

  return testVal(false, false) && testVal(false, true) && testVal(true, false) && testVal(true, true);
}

// Local Storage configurations
function saveStateToLocalStorage() {
  localStorage.setItem('digital_circuit_lab_state', JSON.stringify({
    nodes: state.nodes,
    wires: state.wires
  }));
}

function loadStateFromLocalStorage() {
  const localData = localStorage.getItem('digital_circuit_lab_state');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      state.nodes = parsed.nodes || [];
      state.wires = parsed.wires || [];
    } catch(e) {
      console.error("Failed to parse local storage data", e);
    }
  }
}
