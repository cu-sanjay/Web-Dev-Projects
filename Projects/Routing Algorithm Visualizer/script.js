/**
 * Routing Algorithm Visualizer - State & Algorithm Solvers
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Graph State ---
  let nodes = [];
  let links = [];
  
  // Selection & Mode State
  let activeMode = "inspect"; // inspect, add, connect
  let selectedNodeId = null;
  let connectStartNodeId = null;
  let draggingNode = null;

  // Query config
  let sourceNodeId = "";
  let destNodeId = "";
  let activeAlgorithm = "dijkstra";

  // Simulation Timeline
  let simStep = 0;
  let activePath = [];      // Shortest path array e.g. ["A", "C", "E", "F"]
  let pathCost = 0;
  let simulationHops = [];  // Array of hops to animate step-by-step
  
  let playbackIntervalId = null;
  let playbackSpeed = 1500; // ms
  let logHistory = [];

  // Default Topology presets
  const PRESETS = {
    "mesh": {
      nodes: [
        { id: "A", x: 80, y: 200 },
        { id: "B", x: 230, y: 80 },
        { id: "C", x: 230, y: 320 },
        { id: "D", x: 380, y: 80 },
        { id: "E", x: 380, y: 320 },
        { id: "F", x: 530, y: 200 }
      ],
      links: [
        { u: "A", v: "B", cost: 4 },
        { u: "A", v: "C", cost: 2 },
        { u: "B", v: "C", cost: 3 },
        { u: "B", v: "D", cost: 3 },
        { u: "B", v: "E", cost: 7 },
        { u: "C", v: "E", cost: 3 },
        { u: "D", v: "E", cost: 2 },
        { u: "D", v: "F", cost: 4 },
        { u: "E", v: "F", cost: 2 }
      ]
    },
    "ring": {
      nodes: [
        { id: "A", x: 80, y: 200 },
        { id: "B", x: 210, y: 80 },
        { id: "C", x: 400, y: 80 },
        { id: "D", x: 530, y: 200 },
        { id: "E", x: 400, y: 320 },
        { id: "F", x: 210, y: 320 }
      ],
      links: [
        { u: "A", v: "B", cost: 3 },
        { u: "B", v: "C", cost: 3 },
        { u: "C", v: "D", cost: 3 },
        { u: "D", v: "E", cost: 3 },
        { u: "E", v: "F", cost: 3 },
        { u: "F", v: "A", cost: 3 }
      ]
    },
    "star": {
      nodes: [
        { id: "A", x: 305, y: 200 }, // Hub
        { id: "B", x: 140, y: 80 },
        { id: "C", x: 470, y: 80 },
        { id: "D", x: 470, y: 320 },
        { id: "E", x: 140, y: 320 }
      ],
      links: [
        { u: "A", v: "B", cost: 2 },
        { u: "A", v: "C", cost: 2 },
        { u: "A", v: "D", cost: 2 },
        { u: "A", v: "E", cost: 2 }
      ]
    },
    "line": {
      nodes: [
        { id: "A", x: 60, y: 200 },
        { id: "B", x: 155, y: 200 },
        { id: "C", x: 250, y: 200 },
        { id: "D", x: 345, y: 200 },
        { id: "E", x: 440, y: 200 },
        { id: "F", x: 535, y: 200 }
      ],
      links: [
        { u: "A", v: "B", cost: 2 },
        { u: "B", v: "C", cost: 2 },
        { u: "C", v: "D", cost: 2 },
        { u: "D", v: "E", cost: 2 },
        { u: "E", v: "F", cost: 2 }
      ]
    }
  };

  // --- UI Elements ---
  const topologyPresetSelect = document.getElementById("topology-preset");
  const btnResetPreset = document.getElementById("btn-reset-preset");
  const btnClearGraph = document.getElementById("btn-clear-graph");

  const btnModeSelect = document.getElementById("btn-mode-select");
  const btnModeAdd = document.getElementById("btn-mode-add");
  const btnModeConnect = document.getElementById("btn-mode-connect");
  const canvasInstructionLabel = document.querySelector(".canvas-instructions-label span");

  const canvasContainer = document.getElementById("canvas-container");
  const networkSvg = document.getElementById("network-svg");
  const nodesLayer = document.getElementById("nodes-layer");
  const routingPacket = document.getElementById("routing-packet");

  const sourceNodeSelect = document.getElementById("source-node");
  const destNodeSelect = document.getElementById("dest-node");
  const activeAlgorithmSelect = document.getElementById("active-algorithm");
  const btnCalculatePath = document.getElementById("btn-calculate-path");

  const btnPrevStep = document.getElementById("btn-prev-step");
  const btnTogglePlay = document.getElementById("btn-toggle-play");
  const btnNextStep = document.getElementById("btn-next-step");
  const btnReset = document.getElementById("btn-reset");
  const simSpeedSlider = document.getElementById("sim-speed");
  const speedValueLabel = document.getElementById("speed-value");

  const nodeRtTitle = document.getElementById("rt-card-title");
  const nodeRtTableBody = document.querySelector("#node-rt-table tbody");
  const logConsole = document.getElementById("log-console");
  const btnClearLogs = document.getElementById("btn-clear-logs");

  // Comparison Matrix elements
  const rowDijkstra = document.getElementById("row-dijkstra");
  const rowBellman = document.getElementById("row-bellman");
  const rowFlooding = document.getElementById("row-flooding");

  // --- Initialisation ---
  function loadPresetTopology() {
    const key = topologyPresetSelect.value;
    const preset = PRESETS[key] || PRESETS["mesh"];
    
    // Deep copy preset
    nodes = JSON.parse(JSON.stringify(preset.nodes));
    links = JSON.parse(JSON.stringify(preset.links));

    selectedNodeId = nodes[0] ? nodes[0].id : null;
    connectStartNodeId = null;
    draggingNode = null;

    stopPlayback();
    simStep = 0;
    activePath = [];
    simulationHops = [];
    routingPacket.classList.add("hidden");

    logConsole.innerHTML = "";
    addLog(`Loaded '${topologyPresetSelect.options[topologyPresetSelect.selectedIndex].text}' preset.`, "system");

    updateDropdownSelectors();
    
    // Select default source/destination
    if (nodes.length >= 2) {
      sourceNodeSelect.value = nodes[0].id;
      destNodeSelect.value = nodes[nodes.length - 1].id;
    }

    renderAll();
    runAllAlgorithmsComparison();
  }

  function renderAll() {
    renderNodes();
    renderEdges();
    renderRoutingTable();
    updatePlaybackControls();
  }

  // --- Dropdown Selectors Update ---
  function updateDropdownSelectors() {
    const srcVal = sourceNodeSelect.value;
    const dstVal = destNodeSelect.value;

    sourceNodeSelect.innerHTML = "";
    destNodeSelect.innerHTML = "";

    nodes.forEach(node => {
      sourceNodeSelect.innerHTML += `<option value="${node.id}">Router ${node.id}</option>`;
      destNodeSelect.innerHTML += `<option value="${node.id}">Router ${node.id}</option>`;
    });

    if (nodes.some(n => n.id === srcVal)) sourceNodeSelect.value = srcVal;
    if (nodes.some(n => n.id === dstVal)) destNodeSelect.value = dstVal;
  }

  // --- Telemetry Logging ---
  function addLog(message, type = "system") {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = document.createElement("div");
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `<span style="opacity: 0.5;">[${timeStr}]</span> ${message}`;
    logConsole.appendChild(logEntry);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  // --- Playback Controls Utility ---
  function updatePlaybackControls() {
    const pathLen = activePath.length;
    btnPrevStep.disabled = (pathLen === 0 || simStep === 0);
    btnNextStep.disabled = (pathLen === 0 || simStep >= pathLen - 1);
    btnReset.disabled = (pathLen === 0 || simStep === 0);
    btnTogglePlay.disabled = (pathLen === 0);
  }

  // --- HTML Node Renderer ---
  function renderNodes() {
    nodesLayer.innerHTML = "";
    nodes.forEach(node => {
      const div = document.createElement("div");
      div.className = "router-node";
      div.id = `node-${node.id}`;
      div.textContent = node.id;
      
      // Node positioning
      div.style.left = `${node.x - 24}px`;
      div.style.top = `${node.y - 24}px`;

      // Visual classes
      if (node.id === selectedNodeId) div.classList.add("selected-node");
      if (node.id === sourceNodeSelect.value) div.classList.add("source-node");
      if (node.id === destNodeSelect.value) div.classList.add("dest-node");

      // Active simulation path highlighting
      if (simStep > 0 && activePath.includes(node.id)) {
        // Highlight active subsegment
        const pathIndex = activePath.indexOf(node.id);
        if (pathIndex <= simStep) {
          div.classList.add("active-path-node");
          div.classList.add(`path-${activeAlgorithm}`);
        }
      }

      // Drag and click handlers
      div.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        if (activeMode === "inspect") {
          draggingNode = node;
          selectNode(node.id);
        } else if (activeMode === "connect") {
          handleConnectAction(node.id);
        }
      });

      nodesLayer.appendChild(div);
    });
  }

  // --- SVG Edge Renderer ---
  function renderEdges() {
    networkSvg.innerHTML = "";
    links.forEach(link => {
      const uNode = nodes.find(n => n.id === link.u);
      const vNode = nodes.find(n => n.id === link.v);
      if (!uNode || !vNode) return;

      const pathGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

      // Line edge
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", uNode.x);
      line.setAttribute("y1", uNode.y);
      line.setAttribute("x2", vNode.x);
      line.setAttribute("y2", vNode.y);
      line.setAttribute("stroke", "rgba(255,255,255,0.08)");
      line.setAttribute("stroke-width", "3");

      // Active path highlight edge drawing
      if (simStep > 0 && activePath.length > 0) {
        // Is this link in the active path?
        const uIdx = activePath.indexOf(link.u);
        const vIdx = activePath.indexOf(link.v);
        
        // Ensure consecutive link matches on active path segment
        if (uIdx !== -1 && vIdx !== -1 && Math.abs(uIdx - vIdx) === 1) {
          const maxStepIdx = Math.max(uIdx, vIdx);
          if (maxStepIdx <= simStep) {
            line.setAttribute("stroke", `var(--color-${activeAlgorithm})`);
            line.setAttribute("stroke-width", "4.5");
            line.setAttribute("filter", `url(#glowCyan)`);
          }
        }
      }
      pathGroup.appendChild(line);

      // Metric cost text tag at line midpoint
      const mx = (uNode.x + vNode.x) / 2;
      const my = (uNode.y + vNode.y) / 2 - 5;

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", mx);
      text.setAttribute("y", my);
      text.setAttribute("text-anchor", "middle");
      text.className.baseVal = "svg-edge-cost-label";
      text.textContent = link.cost.toString();

      // Click metric to edit weight cost
      text.addEventListener("click", (e) => {
        e.stopPropagation();
        const newCost = prompt(`Enter new link cost between Router ${link.u} & Router ${link.v}:`, link.cost);
        if (newCost !== null) {
          const val = parseInt(newCost, 10);
          if (!isNaN(val) && val > 0) {
            link.cost = val;
            addLog(`Updated Cost: Router ${link.u} &harr; Router ${link.v} cost set to ${val}.`, "system");
            renderAll();
            runAllAlgorithmsComparison();
          } else {
            alert("Cost must be a positive integer.");
          }
        }
      });
      pathGroup.appendChild(text);

      networkSvg.appendChild(pathGroup);
    });
  }

  // --- Dynamic Routing Table Computation ---
  function renderRoutingTable() {
    if (!selectedNodeId) {
      nodeRtTitle.textContent = "Select a node to inspect routing tables";
      nodeRtTableBody.innerHTML = `<tr><td colspan="3" class="select-hint">Click a router node on the canvas to inspect its compiled routes.</td></tr>`;
      return;
    }

    nodeRtTitle.textContent = `Router ${selectedNodeId} Local Routing Table`;
    nodeRtTableBody.innerHTML = "";

    // Solve Dijkstra for selected node to compile routing table
    const tableData = solveDijkstraTable(selectedNodeId);
    
    nodes.forEach(node => {
      if (node.id === selectedNodeId) return; // Skip self

      const entry = tableData[node.id];
      const tr = document.createElement("tr");

      const destTd = document.createElement("td");
      destTd.textContent = `Router ${node.id}`;
      destTd.style.fontWeight = "bold";
      tr.appendChild(destTd);

      const nextTd = document.createElement("td");
      nextTd.textContent = entry && entry.nextHop ? `Router ${entry.nextHop}` : "Direct";
      tr.appendChild(nextTd);

      const metricTd = document.createElement("td");
      metricTd.textContent = entry && entry.cost !== Infinity ? entry.cost : "Unreachable";
      tr.appendChild(metricTd);

      nodeRtTableBody.appendChild(tr);
    });
  }

  // Dijkstra table compiler
  function solveDijkstraTable(startNode) {
    let dist = {};
    let prev = {};
    let nextHop = {};
    
    nodes.forEach(n => {
      dist[n.id] = Infinity;
      prev[n.id] = null;
      nextHop[n.id] = null;
    });
    dist[startNode] = 0;

    let unvisited = new Set(nodes.map(n => n.id));

    while (unvisited.size > 0) {
      // Find node in unvisited with minimum distance
      let u = null;
      let minDist = Infinity;
      unvisited.forEach(nid => {
        if (dist[nid] < minDist) {
          minDist = dist[nid];
          u = nid;
        }
      });

      if (u === null) break;
      unvisited.delete(u);

      // Get neighbors of u
      const neighbors = getNeighbors(u);
      neighbors.forEach(neighbor => {
        const link = links.find(l => (l.u === u && l.v === neighbor) || (l.v === u && l.u === neighbor));
        const cost = link ? link.cost : Infinity;
        const alt = dist[u] + cost;

        if (alt < dist[neighbor]) {
          dist[neighbor] = alt;
          prev[neighbor] = u;
          
          // Backtrace next hop link
          if (u === startNode) {
            nextHop[neighbor] = neighbor;
          } else {
            nextHop[neighbor] = nextHop[u];
          }
        }
      });
    }

    let routingEntries = {};
    nodes.forEach(n => {
      routingEntries[n.id] = { cost: dist[n.id], nextHop: nextHop[n.id] };
    });
    return routingEntries;
  }

  function getNeighbors(nodeId) {
    const list = [];
    links.forEach(l => {
      if (l.u === nodeId) list.push(l.v);
      else if (l.v === nodeId) list.push(l.u);
    });
    return list;
  }

  // --- Active Mode Toggles ---
  function selectMode(mode) {
    activeMode = mode;
    btnModeSelect.className = "btn btn-small " + (mode === "inspect" ? "btn-primary" : "btn-secondary");
    btnModeAdd.className = "btn btn-small " + (mode === "add" ? "btn-primary" : "btn-secondary");
    btnModeConnect.className = "btn btn-small " + (mode === "connect" ? "btn-primary" : "btn-secondary");

    if (mode === "inspect") {
      canvasInstructionLabel.innerHTML = "Mode: <b>Inspect</b>. Drag nodes to move. Click nodes to view routing table.";
      canvasContainer.style.cursor = "default";
    } else if (mode === "add") {
      canvasInstructionLabel.innerHTML = "Mode: <b>Add Router</b>. Click empty canvas space to construct a new node.";
      canvasContainer.style.cursor = "crosshair";
    } else {
      canvasInstructionLabel.innerHTML = "Mode: <b>Connect Links</b>. Click start node, then destination node to add a link.";
      canvasContainer.style.cursor = "pointer";
    }
    connectStartNodeId = null;
  }

  btnModeSelect.addEventListener("click", () => selectMode("inspect"));
  btnModeAdd.addEventListener("click", () => selectMode("add"));
  btnModeConnect.addEventListener("click", () => selectMode("connect"));

  // Canvas Workspace Click actions
  canvasContainer.addEventListener("mousedown", (e) => {
    if (e.target !== canvasContainer && e.target !== networkSvg && e.target.id !== "nodes-layer") return;

    if (activeMode === "add") {
      // Allocate next character ID
      let nextChar = "A";
      for (let i = 0; i < 26; i++) {
        let char = String.fromCharCode(65 + i);
        if (!nodes.some(n => n.id === char)) {
          nextChar = char;
          break;
        }
      }

      // Add node at coordinates
      const rect = canvasContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      nodes.push({ id: nextChar, x: Math.round(x), y: Math.round(y) });
      addLog(`Created Router node ${nextChar} at coordinate (${Math.round(x)}, ${Math.round(y)}).`, "system");
      
      updateDropdownSelectors();
      renderAll();
      runAllAlgorithmsComparison();
      
      // Auto toggle back to select mode
      selectMode("inspect");
      selectNode(nextChar);
    } else {
      clearNodeSelection();
    }
  });

  // Reposition node dragging moves
  window.addEventListener("mousemove", (e) => {
    if (draggingNode === null) return;
    
    const rect = canvasContainer.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp inside canvas bounds
    x = Math.max(24, Math.min(x, rect.width - 24));
    y = Math.max(24, Math.min(y, rect.height - 24));

    draggingNode.x = Math.round(x);
    draggingNode.y = Math.round(y);

    renderAll();
  });

  window.addEventListener("mouseup", () => {
    if (draggingNode) {
      draggingNode = null;
      runAllAlgorithmsComparison();
    }
  });

  function selectNode(nodeId) {
    selectedNodeId = nodeId;
    renderNodes();
    renderRoutingTable();
  }

  function clearNodeSelection() {
    selectedNodeId = null;
    renderNodes();
    renderRoutingTable();
  }

  function handleConnectAction(nodeId) {
    if (connectStartNodeId === null) {
      connectStartNodeId = nodeId;
      addLog(`Link connection start: Selected Router ${nodeId}. Click destination node to connect...`, "system");
      highlightNodeBorder(nodeId, "var(--color-accent)");
    } else {
      if (connectStartNodeId === nodeId) {
        connectStartNodeId = null;
        renderAll();
        return;
      }

      // Connect connectStartNodeId <-> nodeId
      const alreadyConnected = links.some(l => 
        (l.u === connectStartNodeId && l.v === nodeId) || (l.v === connectStartNodeId && l.u === nodeId)
      );

      if (alreadyConnected) {
        alert("These nodes are already connected.");
      } else {
        const costStr = prompt(`Enter transmission cost weight between Router ${connectStartNodeId} & Router ${nodeId}:`, "5");
        if (costStr !== null) {
          const cost = parseInt(costStr, 10);
          if (!isNaN(cost) && cost > 0) {
            links.push({ u: connectStartNodeId, v: nodeId, cost: cost });
            addLog(`Link connected: Router ${connectStartNodeId} &harr; Router ${nodeId} (Cost metric: ${cost})`, "success");
            renderAll();
            runAllAlgorithmsComparison();
          } else {
            alert("Cost must be a positive integer.");
          }
        }
      }
      connectStartNodeId = null;
      selectMode("inspect");
    }
  }

  function highlightNodeBorder(nodeId, color) {
    const el = document.getElementById(`node-${nodeId}`);
    if (el) {
      el.style.borderColor = color;
      el.style.boxShadow = `0 0 12px ${color}`;
    }
  }

  // --- Shortest Path Solvers ---

  // 1. Dijkstra Solver
  function solveDijkstra(startNode, endNode) {
    let dist = {};
    let prev = {};
    
    nodes.forEach(n => {
      dist[n.id] = Infinity;
      prev[n.id] = null;
    });
    dist[startNode] = 0;

    let unvisited = new Set(nodes.map(n => n.id));
    let stepLog = [];

    stepLog.push(`[Dijkstra init] Target: ${startNode} &rarr; ${endNode}. Initial distance table set to Infinity.`);

    while (unvisited.size > 0) {
      // Find node in unvisited with minimum distance
      let u = null;
      let minDist = Infinity;
      unvisited.forEach(nid => {
        if (dist[nid] < minDist) {
          minDist = dist[nid];
          u = nid;
        }
      });

      if (u === null || u === endNode) break;
      unvisited.delete(u);

      stepLog.push(`Visited Router <b>${u}</b> (cumulative cost: ${dist[u]}). Relaxing neighboring edges...`);

      // Get neighbors of u
      const neighbors = getNeighbors(u);
      neighbors.forEach(neighbor => {
        if (!unvisited.has(neighbor)) return;

        const link = links.find(l => (l.u === u && l.v === neighbor) || (l.v === u && l.u === neighbor));
        const cost = link ? link.cost : Infinity;
        const alt = dist[u] + cost;

        if (alt < dist[neighbor]) {
          stepLog.push(`  Path via ${u} is shorter: Router ${neighbor} cost updated from ${dist[neighbor]} &rarr; <b>${alt}</b>`);
          dist[neighbor] = alt;
          prev[neighbor] = u;
        }
      });
    }

    // Reconstruct path
    let path = [];
    let curr = endNode;
    if (dist[endNode] !== Infinity || startNode === endNode) {
      while (curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
      }
    }

    return { path, cost: dist[endNode], logs: stepLog };
  }

  // 2. Bellman-Ford Solver
  function solveBellmanFord(startNode, endNode) {
    let dist = {};
    let prev = {};

    nodes.forEach(n => {
      dist[n.id] = Infinity;
      prev[n.id] = null;
    });
    dist[startNode] = 0;

    let stepLog = [];
    stepLog.push(`[Bellman-Ford init] Distance vectors initialized. Starting iteration sweeps.`);

    // Relax all edges V-1 times
    const V = nodes.length;
    for (let i = 1; i < V; i++) {
      let updated = false;
      stepLog.push(`Sweep Iteration ${i} relaxation:`);
      
      links.forEach(link => {
        // Since bidirectional, relax in both directions
        const u = link.u;
        const v = link.v;
        const cost = link.cost;

        // u -> v
        if (dist[u] !== Infinity && dist[u] + cost < dist[v]) {
          dist[v] = dist[u] + cost;
          prev[v] = u;
          updated = true;
          stepLog.push(`  Relaxed edge ${u}&rarr;${v}: Cost to ${v} updated to ${dist[v]}`);
        }

        // v -> u
        if (dist[v] !== Infinity && dist[v] + cost < dist[u]) {
          dist[u] = dist[v] + cost;
          prev[u] = v;
          updated = true;
          stepLog.push(`  Relaxed edge ${v}&rarr;${u}: Cost to ${u} updated to ${dist[u]}`);
        }
      });

      if (!updated) {
        stepLog.push(`  No vector updates. Algorithms converged early at iteration ${i}.`);
        break;
      }
    }

    // Reconstruct path
    let path = [];
    let curr = endNode;
    if (dist[endNode] !== Infinity || startNode === endNode) {
      while (curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
      }
    }

    return { path, cost: dist[endNode], logs: stepLog };
  }

  // 3. Flooding Broadcast Solver
  function solveFlooding(startNode, endNode) {
    // Flooding finds the shortest hop path
    let queue = [[startNode]];
    let visited = new Set([startNode]);
    let shortestHopPath = [];
    let cost = Infinity;
    
    // Packet overhead counters
    let packetStormCount = 0;
    let stepLog = [];

    stepLog.push(`[Flooding init] Broadcasting packet sequence from root ${startNode}.`);

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === endNode) {
        shortestHopPath = path;
        break;
      }

      const neighbors = getNeighbors(node);
      neighbors.forEach(neighbor => {
        // Every link gets a packet duplicated
        packetStormCount++;
        
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const newPath = [...path, neighbor];
          queue.push(newPath);
          stepLog.push(`Router ${node} broadcasts copy &rarr; Neighbor ${neighbor} (Hops: ${newPath.length - 1})`);
        } else {
          stepLog.push(`Router ${node} transmits copy &rarr; Neighbor ${neighbor}. Duplication detected! Packet discarded.`);
        }
      });
    }

    // Compute cost of shortest hop path
    if (shortestHopPath.length > 0) {
      cost = 0;
      for (let i = 0; i < shortestHopPath.length - 1; i++) {
        const u = shortestHopPath[i];
        const v = shortestHopPath[i+1];
        const link = links.find(l => (l.u === u && l.v === v) || (l.v === u && l.u === v));
        cost += link ? link.cost : 0;
      }
    }

    return { path: shortestHopPath, cost, packetCount: packetStormCount, logs: stepLog };
  }

  // --- Run All Algorithms Comparative Solver ---
  function runAllAlgorithmsComparison() {
    const src = sourceNodeSelect.value;
    const dst = destNodeSelect.value;
    if (!src || !dst) return;

    // 1. Dijkstra
    const dRes = solveDijkstra(src, dst);
    updateMatrixRow("row-dijkstra", dRes.path, dRes.cost, 1, dRes.cost * 10);

    // 2. Bellman-Ford
    const bRes = solveBellmanFord(src, dst);
    updateMatrixRow("row-bellman", bRes.path, bRes.cost, 1, bRes.cost * 10);

    // 3. Flooding
    const fRes = solveFlooding(src, dst);
    updateMatrixRow("row-flooding", fRes.path, fRes.cost, fRes.packetCount, fRes.path.length * 10);
  }

  function updateMatrixRow(rowId, path, cost, packets, delay) {
    const row = document.getElementById(rowId);
    if (!row) return;

    const cells = row.querySelectorAll("td");
    const pathStr = path.length > 0 ? path.join(" &rarr; ") : "Unreachable";
    
    cells[1].innerHTML = pathStr;
    cells[2].textContent = path.length > 0 ? (path.length - 1) : "0";
    cells[3].textContent = cost !== Infinity ? cost : "--";
    cells[4].textContent = packets;
    cells[5].textContent = cost !== Infinity ? `${delay} ms` : "--";
  }

  // --- Simulation Stepper Controls ---
  function startPathSimulation() {
    stopPlayback();
    simStep = 0;
    logConsole.innerHTML = "";
    
    const src = sourceNodeSelect.value;
    const dst = destNodeSelect.value;
    activeAlgorithm = activeAlgorithmSelect.value;

    if (src === dst) {
      alert("Source and Destination nodes must be different.");
      return;
    }

    let solverRes = null;
    if (activeAlgorithm === "dijkstra") {
      solverRes = solveDijkstra(src, dst);
    } else if (activeAlgorithm === "bellman") {
      solverRes = solveBellmanFord(src, dst);
    } else {
      solverRes = solveFlooding(src, dst);
    }

    activePath = solverRes.path;
    pathCost = solverRes.cost;

    if (activePath.length === 0) {
      addLog(`Routing failed. No path exists between Router ${src} & Router ${dst}.`, "error");
      routingPacket.classList.add("hidden");
      return;
    }

    // Print calculated shortest paths
    addLog(`<b>[Solver]</b> Algorithm selected: <b>${activeAlgorithm.toUpperCase()}</b>`, "system");
    addLog(`Shortest path compiled: <b>${activePath.join(" &rarr; ")}</b> (Metric Cost: ${pathCost})`, "success");

    // Output trace logs for algorithm steps
    solverRes.logs.forEach(line => {
      addLog(line, activeAlgorithm);
    });

    // Reset packet position at start node
    routingPacket.classList.remove("hidden");
    positionPacketAtNode(src);

    renderAll();
    updatePlaybackControls();
  }

  function positionPacketAtNode(nodeId) {
    const containerRect = canvasContainer.getBoundingClientRect();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Center packet circle (radius 12, diameter 24)
    routingPacket.style.left = `${node.x - 12}px`;
    routingPacket.style.top = `${node.y - 12}px`;
  }

  function stepTimelineForward() {
    if (activePath.length === 0) {
      startPathSimulation();
      return;
    }

    if (simStep >= activePath.length - 1) {
      stopPlayback();
      addLog("Packet reached destination. Routing simulation complete.", "success");
      return;
    }

    simStep++;
    const nextHopId = activePath[simStep];
    const prevHopId = activePath[simStep - 1];

    addLog(`Packet routed: Router <b>${prevHopId}</b> &rarr; Router <b>${nextHopId}</b>.`, "success");

    // Animate packet to next coordinates
    positionPacketAtNode(nextHopId);
    renderAll();
  }

  function stepTimelineBackward() {
    if (simStep === 0) return;
    
    simStep--;
    const currentHopId = activePath[simStep];
    addLog(`Rollback hop: Packet returned to Router <b>${currentHopId}</b>.`, "system");
    
    positionPacketAtNode(currentHopId);
    renderAll();
  }

  // --- Automator Playback functions ---
  function startPlayback() {
    if (playbackIntervalId !== null) return;

    btnTogglePlay.classList.add("btn-primary");
    document.getElementById("play-icon").classList.add("hidden");
    document.getElementById("pause-icon").classList.remove("hidden");
    btnTogglePlay.querySelector("span").textContent = "Pause Route";

    playbackIntervalId = setInterval(() => {
      stepTimelineForward();
    }, playbackSpeed);
  }

  function stopPlayback() {
    if (playbackIntervalId === null) return;

    clearInterval(playbackIntervalId);
    playbackIntervalId = null;

    document.getElementById("play-icon").classList.remove("hidden");
    document.getElementById("pause-icon").classList.add("hidden");
    btnTogglePlay.querySelector("span").textContent = "Run Route";
  }

  function togglePlayback() {
    if (playbackIntervalId === null) {
      if (simStep >= activePath.length - 1) {
        simStep = 0;
        if (activePath.length > 0) positionPacketAtNode(activePath[0]);
      }
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  // --- Event Handlers & Listeners ---
  topologyPresetSelect.addEventListener("change", loadPresetTopology);
  
  btnResetPreset.addEventListener("click", () => {
    loadPresetTopology();
  });

  btnClearGraph.addEventListener("click", () => {
    nodes = [];
    links = [];
    selectedNodeId = null;
    connectStartNodeId = null;
    activePath = [];
    simStep = 0;
    
    routingPacket.classList.add("hidden");
    updateDropdownSelectors();
    renderAll();
    runAllAlgorithmsComparison();
    addLog("Canvas wiped. Topology cleared.", "system");
  });

  btnCalculatePath.addEventListener("click", () => {
    startPathSimulation();
  });

  btnTogglePlay.addEventListener("click", () => {
    togglePlayback();
  });

  btnPrevStep.addEventListener("click", () => {
    stopPlayback();
    stepTimelineBackward();
  });

  btnNextStep.addEventListener("click", () => {
    stopPlayback();
    stepTimelineForward();
  });

  btnReset.addEventListener("click", () => {
    if (activePath.length > 0) {
      stopPlayback();
      simStep = 0;
      positionPacketAtNode(activePath[0]);
      renderAll();
      addLog("Timeline reset to start node.", "system");
    }
  });

  simSpeedSlider.addEventListener("input", (e) => {
    playbackSpeed = parseInt(e.target.value, 10);
    speedValueLabel.textContent = `Speed: ${(playbackSpeed / 1000).toFixed(1)}s`;
    
    if (playbackIntervalId !== null) {
      stopPlayback();
      startPlayback();
    }
  });

  sourceNodeSelect.addEventListener("change", () => {
    simStep = 0;
    activePath = [];
    routingPacket.classList.add("hidden");
    renderNodes();
    runAllAlgorithmsComparison();
  });

  destNodeSelect.addEventListener("change", () => {
    simStep = 0;
    activePath = [];
    routingPacket.classList.add("hidden");
    renderNodes();
    runAllAlgorithmsComparison();
  });

  btnClearLogs.addEventListener("click", () => {
    logConsole.innerHTML = "";
    addLog("Trace logs cleared.", "system");
  });

  // Re-adjust layouts on resize
  window.addEventListener("resize", () => {
    renderEdges();
    if (activePath.length > 0) {
      positionPacketAtNode(activePath[simStep]);
    }
  });

  // --- Kickstart ---
  loadPresetTopology();
});
