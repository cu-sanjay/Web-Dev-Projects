/**
 * Network Packet Simulator - Interactive Script Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Simulation Configuration Variables ---
  let appPayload = "GET /index.html HTTP/1.1\nHost: 8.8.8.8";
  let transportProtocol = "tcp";
  let srcPort = 49152;
  let dstPort = 80;
  let srcIp = "192.168.1.100";
  let dstIp = "8.8.8.8";
  let ipTtl = 64;
  let srcMac = "00:0A:95:9D:68:16";
  let dstMac = "00:0A:95:9D:68:01"; // Router's gateway MAC

  // Router Interface Details (for Layer 3 hop transformations)
  const ROUTER_MAC_LAN = "00:0A:95:9D:68:01"; // Incoming interface MAC
  const ROUTER_MAC_WAN = "00:0E:83:8B:11:0A"; // Outgoing interface MAC
  const SERVER_MAC = "00:1C:C0:5E:AA:99";     // Server interface MAC

  // Preset Configurations
  const PRESETS = {
    "http-get": {
      payload: "GET /index.html HTTP/1.1\nHost: 8.8.8.8\nUser-Agent: Mozilla/5.0",
      proto: "tcp",
      sport: 49152,
      dport: 80,
      sip: "192.168.1.100",
      dip: "8.8.8.8",
      ttl: 64,
      smac: "00:0A:95:9D:68:16",
      dmac: "00:0A:95:9D:68:01"
    },
    "dns-lookup": {
      payload: "OP: QUERY, NAME: google.com, TYPE: A",
      proto: "udp",
      sport: 51200,
      dport: 53,
      sip: "192.168.1.100",
      dip: "8.8.8.8",
      ttl: 64,
      smac: "00:0A:95:9D:68:16",
      dmac: "00:0A:95:9D:68:01"
    },
    "ping-request": {
      payload: "abcdefghijklmnopqrstuvwabcdefghi", // 32-byte ICMP payload
      proto: "icmp", // We treat ICMP as bypassing transport layer ports
      sport: 0,
      dport: 0,
      sip: "192.168.1.100",
      dip: "8.8.8.8",
      ttl: 128,
      smac: "00:0A:95:9D:68:16",
      dmac: "00:0A:95:9D:68:01"
    }
  };

  // --- Simulation State ---
  let simStep = 0; // Current step index: 0 to 12
  const MAX_STEPS = 12;
  
  // History stack for backward steps
  let stepHistory = [];
  
  // Auto-run Timer
  let playbackIntervalId = null;
  let playbackSpeed = 1500; // ms

  // Packet Structure State (Snapshot at current step)
  let currentPacket = {
    l5: { protocol: "", data: "", size: "" },
    l4: { protocol: "", sport: "", dport: "", seq: "", checksum: "" },
    l3: { version: "IPv4", sip: "", dip: "", ttl: 0, proto: "" },
    l2: { smac: "", dmac: "", type: "0x0800 (IPv4)", fcs: "0x7F41AA2E" },
    l1: { bits: "" }
  };

  // --- UI Elements ---
  const protocolPresetSelect = document.getElementById("protocol-preset");
  const appPayloadInput = document.getElementById("app-payload");
  const transportProtocolSelect = document.getElementById("transport-protocol");
  const srcPortInput = document.getElementById("src-port");
  const dstPortInput = document.getElementById("dst-port");
  const srcIpInput = document.getElementById("src-ip");
  const dstIpInput = document.getElementById("dst-ip");
  const ipTtlInput = document.getElementById("ip-ttl");
  const srcMacInput = document.getElementById("src-mac");
  const dstMacInput = document.getElementById("dst-mac");
  const btnLoadConfig = document.getElementById("btn-load-config");

  const networkMap = document.getElementById("network-map");
  const nodeClient = document.getElementById("node-client");
  const nodeSwitch = document.getElementById("node-switch");
  const nodeRouter = document.getElementById("node-router");
  const nodeServer = document.getElementById("node-server");
  const animPacket = document.getElementById("anim-packet");

  const btnPrevStep = document.getElementById("btn-prev-step");
  const btnTogglePlay = document.getElementById("btn-toggle-play");
  const btnNextStep = document.getElementById("btn-next-step");
  const btnReset = document.getElementById("btn-reset");
  const simSpeedSlider = document.getElementById("sim-speed");
  const speedValueLabel = document.getElementById("speed-value");

  // Stack Layers
  const layerApp = document.getElementById("layer-app");
  const layerTrans = document.getElementById("layer-trans");
  const layerNet = document.getElementById("layer-net");
  const layerLink = document.getElementById("layer-link");
  const layerPhys = document.getElementById("layer-phys");

  const badgeApp = document.getElementById("badge-app");
  const badgeTrans = document.getElementById("badge-trans");
  const badgeNet = document.getElementById("badge-net");
  const badgeLink = document.getElementById("badge-link");
  const badgePhys = document.getElementById("badge-phys");

  const previewApp = document.getElementById("preview-app");
  const previewTrans = document.getElementById("preview-trans");
  const previewNet = document.getElementById("preview-net");
  const previewLink = document.getElementById("preview-link");
  const previewPhys = document.getElementById("preview-phys");

  // Inspector
  const inspectorHintMsg = document.getElementById("inspector-hint-msg");
  const inspectorDetails = document.getElementById("inspector-details");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Inspector Fields
  const inspL2Dmac = document.getElementById("insp-l2-dmac");
  const inspL2Smac = document.getElementById("insp-l2-smac");
  const inspL2Type = document.getElementById("insp-l2-type");
  const inspL2Fcs = document.getElementById("insp-l2-fcs");

  const inspL3Dip = document.getElementById("insp-l3-dip");
  const inspL3Sip = document.getElementById("insp-l3-sip");
  const inspL3Ttl = document.getElementById("insp-l3-ttl");
  const inspL3Proto = document.getElementById("insp-l3-proto");

  const inspL4Proto = document.getElementById("insp-l4-proto");
  const inspL4Dport = document.getElementById("insp-l4-dport");
  const inspL4Sport = document.getElementById("insp-l4-sport");
  const inspL4Seq = document.getElementById("insp-l4-seq");
  const inspL4Check = document.getElementById("insp-l4-check");

  const inspL5Payload = document.getElementById("insp-l5-payload");
  const inspL5Size = document.getElementById("insp-l5-size");

  const logConsole = document.getElementById("log-console");
  const btnClearLogs = document.getElementById("btn-clear-logs");

  // --- Initialize Simulation state ---
  function initSimulation() {
    stopPlayback();
    simStep = 0;
    stepHistory = [];
    logConsole.innerHTML = "";
    
    // Read input fields
    appPayload = appPayloadInput.value;
    transportProtocol = transportProtocolSelect.value;
    srcPort = parseInt(srcPortInput.value, 10) || 49152;
    dstPort = parseInt(dstPortInput.value, 10) || 80;
    srcIp = srcIpInput.value;
    dstIp = dstIpInput.value;
    ipTtl = parseInt(ipTtlInput.value, 10) || 64;
    srcMac = srcMacInput.value;
    dstMac = dstMacInput.value;

    // Build default initial packet structure
    currentPacket = {
      l5: { protocol: getAppProtoLabel(), data: appPayload, size: `${appPayload.length} bytes` },
      l4: { protocol: transportProtocol.toUpperCase(), sport: srcPort, dport: dstPort, seq: "1001", checksum: calculateChecksum(appPayload) },
      l3: { version: "IPv4", sip: srcIp, dip: dstIp, ttl: ipTtl, proto: getL3ProtoLabel() },
      l2: { smac: srcMac, dmac: dstMac, type: "0x0800 (IPv4)", fcs: "0x7F41AA2E" },
      l1: { bits: convertStringToBinary(appPayload) }
    };

    // GUI Visual Resets
    animPacket.classList.add("hidden");
    resetMapNodeHighlights();
    updateLayerStackUI();
    updateInspectorUI();
    updatePlaybackControls();

    addLog("Simulator initialized with Loaded Configuration.", "system");
    addLog(`Protocol stack ready. Client host interface online. MAC: ${srcMac}, IP: ${srcIp}`, "success");
  }

  // --- Configuration presets ---
  function loadPreset() {
    const presetKey = protocolPresetSelect.value;
    const config = PRESETS[presetKey];
    if (!config) return;

    appPayloadInput.value = config.payload;
    transportProtocolSelect.value = config.proto;
    srcPortInput.value = config.sport;
    dstPortInput.value = config.dport;
    srcIpInput.value = config.sip;
    dstIpInput.value = config.dip;
    ipTtlInput.value = config.ttl;
    srcMacInput.value = config.smac;
    dstMacInput.value = config.dmac;

    // Enable/disable port configurations based on ICMP/Ping
    if (config.proto === "icmp") {
      srcPortInput.setAttribute("disabled", "true");
      dstPortInput.setAttribute("disabled", "true");
    } else {
      srcPortInput.removeAttribute("disabled");
      dstPortInput.removeAttribute("disabled");
    }

    initSimulation();
  }

  // --- Dynamic Packet Placement on Network Map ---
  function positionPacketOnMap(stepIndex) {
    if (stepIndex < 5) {
      // Still encapsulating inside Client
      animPacket.classList.add("hidden");
      highlightMapNode("node-client");
      return;
    }

    animPacket.classList.remove("hidden");
    
    // Coordinates based on step index (routing hops)
    if (stepIndex === 5) {
      // Layer 1 Physical serialization - ready at client port
      positionAtNode("node-client");
      highlightMapNode("node-client");
    } else if (stepIndex === 6) {
      // Traveling: Client -> Switch
      positionAtNode("node-switch");
      highlightMapNode("node-switch");
    } else if (stepIndex === 7) {
      // Traveling: Switch -> Router
      positionAtNode("node-router");
      highlightMapNode("node-router");
    } else if (stepIndex === 8) {
      // Traveling: Router -> Server
      positionAtNode("node-server");
      highlightMapNode("node-server");
    } else {
      // Decapsulating at Server
      positionAtNode("node-server");
      highlightMapNode("node-server");
    }
  }

  function positionAtNode(nodeId) {
    const containerRect = networkMap.getBoundingClientRect();
    const nodeEl = document.getElementById(nodeId);
    if (!nodeEl) return;
    const nodeRect = nodeEl.getBoundingClientRect();

    const targetLeft = nodeRect.left - containerRect.left + (nodeRect.width / 2) - 25;
    const targetTop = nodeRect.top - containerRect.top + 10;
    
    animPacket.style.left = `${targetLeft}px`;
    animPacket.style.top = `${targetTop}px`;
  }

  function highlightMapNode(nodeId) {
    resetMapNodeHighlights();
    const node = document.getElementById(nodeId);
    if (node) {
      node.classList.add("active-processing");
    }
  }

  function resetMapNodeHighlights() {
    nodeClient.classList.remove("active-processing");
    nodeSwitch.classList.remove("active-processing");
    nodeRouter.classList.remove("active-processing");
    nodeServer.classList.remove("active-processing");
  }

  // --- Protocol Header Text Generators ---
  function getAppProtoLabel() {
    const preset = protocolPresetSelect.value;
    if (preset === "http-get") return "HTTP";
    if (preset === "dns-lookup") return "DNS";
    return "ICMP";
  }

  function getL3ProtoLabel() {
    if (transportProtocol === "tcp") return "6 (TCP)";
    if (transportProtocol === "udp") return "17 (UDP)";
    return "1 (ICMP)";
  }

  function calculateChecksum(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0; // Clamp to 32bit integer
    }
    return "0x" + Math.abs(hash).toString(16).substring(0, 4).toUpperCase();
  }

  function convertStringToBinary(str) {
    let output = "";
    for (let i = 0; i < Math.min(str.length, 12); i++) {
      output += str.charCodeAt(i).toString(2).padStart(8, "0") + " ";
    }
    if (str.length > 12) output += "...";
    return output.trim();
  }

  // --- Step-by-Step Simulation Execution Loop ---
  function executeStep(stepIndex) {
    // 1. Log previous state in stack history
    saveStateHistory();

    // 2. Process routing transformations
    if (stepIndex === 7) {
      // Router Hop: decrement TTL, update MACs
      currentPacket.l3.ttl = Math.max(0, currentPacket.l3.ttl - 1);
      // Source MAC is now Router's external interface MAC (WAN)
      currentPacket.l2.smac = ROUTER_MAC_WAN;
      // Dest MAC is now Server's MAC address
      currentPacket.l2.dmac = SERVER_MAC;
    }

    // 3. Trigger console trace log for this step
    logStepDetails(stepIndex);

    // 4. Update UI states
    simStep = stepIndex;
    updateLayerStackUI();
    positionPacketOnMap(stepIndex);
    updateInspectorUI();
    updatePlaybackControls();
  }

  function saveStateHistory() {
    stepHistory.push({
      simStep: simStep,
      packet: JSON.parse(JSON.stringify(currentPacket)),
      logs: logConsole.innerHTML
    });
  }

  function stepBackward() {
    if (stepHistory.length === 0) return;
    
    stopPlayback();
    const snapshot = stepHistory.pop();
    
    simStep = snapshot.simStep;
    currentPacket = snapshot.packet;
    logConsole.innerHTML = snapshot.logs;
    logConsole.scrollTop = logConsole.scrollHeight;

    updateLayerStackUI();
    positionPacketOnMap(simStep);
    updateInspectorUI();
    updatePlaybackControls();
  }

  // --- Telemetry Logger Helper ---
  function addLog(msg, type = "system") {
    const el = document.createElement("div");
    el.className = `log-entry ${type}`;
    
    let timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    el.innerHTML = `[${timeStr}] ${msg}`;
    
    logConsole.appendChild(el);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  function logStepDetails(stepIndex) {
    const proto = currentPacket.l5.protocol;
    switch (stepIndex) {
      case 1:
        addLog(`<b>[L5 App] Encapsulating Application Payload:</b> Loaded raw ${proto} data text. Size: ${currentPacket.l5.size}.`, "app");
        break;
      
      case 2:
        if (transportProtocol === "icmp") {
          addLog(`<b>[L4 Transport] Bypassed:</b> ICMP protocol encapsulation does not utilize standard L4 UDP/TCP ports.`, "trans");
        } else {
          addLog(`<b>[L4 Transport] Encapsulating Segment:</b> Wrapped L5 payload with ${currentPacket.l4.protocol} header. Ports: Source ${currentPacket.l4.sport} &rarr; Destination ${currentPacket.l4.dport}. Seq: ${currentPacket.l4.seq}. Checksum: ${currentPacket.l4.checksum}`, "trans");
        }
        break;

      case 3:
        addLog(`<b>[L3 Network] Encapsulating Packet:</b> Wrapped L4 segment with IPv4 header. Mapped IP: Source ${currentPacket.l3.sip} &rarr; Destination ${currentPacket.l3.dip}. TTL set to ${currentPacket.l3.ttl}. Protocol index: ${currentPacket.l3.proto}`, "net");
        break;

      case 4:
        addLog(`<b>[L2 Data Link] Encapsulating Frame:</b> Wrapped L3 IP packet inside Ethernet II frame. Mapped MAC links: Source Client ${currentPacket.l2.smac} &rarr; Destination Gateway ${currentPacket.l2.dmac}. Ethernet type: ${currentPacket.l2.type}.`, "link");
        break;

      case 5:
        addLog(`<b>[L1 Physical] Serialization:</b> Frame blocks parsed to serial binary representation: <code>${currentPacket.l1.bits}</code>. Packet ready for transmission.`, "phys");
        break;

      case 6:
        addLog(`<b>[L2 Hop: Client &rarr; Switch]:</b> Bit stream transmitted across copper media. Layer 2 Switch receives frame. Inspects Destination MAC: <b>${currentPacket.l2.dmac}</b>. Switch forwards frame to matching physical interface port leading to Gateway Router.`, "success");
        break;

      case 7:
        addLog(`<b>[L3 Hop: Switch &rarr; Router]:</b> Router receives frame on interface LAN. Decapsulates Layer 2 and reads Layer 3 IP header. Destination IP is <b>${currentPacket.l3.dip}</b> (external network).`, "net");
        addLog(`<b>[Router Lookup Actions]:</b> 1. Decremented TTL limit (New TTL: <b>${currentPacket.l3.ttl}</b>). 2. Routing table lookup maps target via WAN gateway interface. 3. <b>MAC Headers updated:</b> Source MAC rewritten to Router WAN (${ROUTER_MAC_WAN}) & Destination MAC rewritten to Server MAC (${SERVER_MAC}). Re-encapsulated frame forwarded.`, "success");
        break;

      case 8:
        addLog(`<b>[L2 Hop: Router &rarr; Server]:</b> Frame travels across network backbone. Mapped Server interface card receives frame.`, "success");
        break;

      case 9:
        addLog(`<b>[Server Decapsulation: L1 &amp; L2]:</b> Server reads L2 Ethernet frame. Destination MAC matches Server MAC address (<b>${currentPacket.l2.dmac}</b>). Link layer verified. Ethernet header stripped.`, "link");
        break;

      case 10:
        addLog(`<b>[Server Decapsulation: L3]:</b> Server inspects L3 IP packet. Destination IP matches local IP address (<b>${currentPacket.l3.dip}</b>). Network layer verified. IPv4 header stripped.`, "net");
        break;

      case 11:
        if (transportProtocol === "icmp") {
          addLog(`<b>[Server Decapsulation: L4 ICMP]:</b> Server processes ICMP Echo request directly.`, "trans");
        } else {
          addLog(`<b>[Server Decapsulation: L4]:</b> Server inspects L4 segment. Port matches running socket daemon (Port <b>${currentPacket.l4.dport}</b>). Checksum ${currentPacket.l4.checksum} validated. TCP header stripped. Segment delivered.`, "trans");
        }
        break;

      case 12:
        addLog(`<b>[Server Delivery: L5]:</b> Web Daemon extracts payload text data:<br><pre>${currentPacket.l5.data}</pre>`, "app");
        addLog(`Packet successfully transmitted, routed, and decapsulated. Transmission cycle complete.`, "success");
        break;
    }
  }

  // --- UI Layout Updates ---
  function updateLayerStackUI() {
    // App layer L5
    toggleLayerActive(layerApp, badgeApp, currentPacket.l5.protocol, previewApp, currentPacket.l5.data, 1);
    
    // Trans L4
    const transText = transportProtocol === "icmp" ? "ICMP" : `${currentPacket.l4.protocol} (Ports: ${currentPacket.l4.sport} &rarr; ${currentPacket.l4.dport})`;
    toggleLayerActive(layerTrans, badgeTrans, transportProtocol === "icmp" ? "ICMP" : currentPacket.l4.protocol, previewTrans, transText, 2);
    
    // Net L3
    const netText = `IP: ${currentPacket.l3.sip} &rarr; ${currentPacket.l3.dip} | TTL: ${currentPacket.l3.ttl}`;
    toggleLayerActive(layerNet, badgeNet, "IPv4", previewNet, netText, 3);

    // Link L2
    const linkText = `MAC: ${currentPacket.l2.smac} &rarr; ${currentPacket.l2.dmac}`;
    toggleLayerActive(layerLink, badgeLink, "Ethernet", previewLink, linkText, 4);

    // Phys L1
    toggleLayerActive(layerPhys, badgePhys, "Bits", previewPhys, currentPacket.l1.bits, 5);
  }

  function toggleLayerActive(layerEl, badgeEl, protoName, previewEl, contentText, layerIndex) {
    const isEncapsulating = simStep >= layerIndex && simStep <= 8;
    const isDecapsulating = simStep > 8 && simStep <= (13 - layerIndex);
    
    if (simStep > 0 && (isEncapsulating || isDecapsulating)) {
      layerEl.classList.remove("inactive");
      layerEl.classList.add("active");
      badgeEl.textContent = protoName;
      previewEl.innerHTML = contentText;
    } else {
      layerEl.classList.remove("active");
      layerEl.classList.add("inactive");
      badgeEl.textContent = "--";
      previewEl.textContent = "Awaiting step execution...";
    }
  }

  function updateInspectorUI() {
    if (simStep === 0) {
      inspectorHintMsg.classList.remove("hidden");
      inspectorDetails.classList.add("hidden");
      return;
    }

    inspectorHintMsg.classList.add("hidden");
    inspectorDetails.classList.remove("hidden");

    // Populate Fields
    inspL2Dmac.textContent = currentPacket.l2.dmac;
    inspL2Smac.textContent = currentPacket.l2.smac;
    inspL2Type.textContent = currentPacket.l2.type;
    inspL2Fcs.textContent = currentPacket.l2.fcs;

    inspL3Dip.textContent = currentPacket.l3.dip;
    inspL3Sip.textContent = currentPacket.l3.sip;
    inspL3Ttl.textContent = currentPacket.l3.ttl;
    inspL3Proto.textContent = currentPacket.l3.proto;

    if (transportProtocol === "icmp") {
      inspL4Proto.textContent = "ICMP (IP protocol 1)";
      inspL4Dport.textContent = "N/A (No ports)";
      inspL4Sport.textContent = "N/A (No ports)";
      inspL4Seq.textContent = "N/A";
      inspL4Check.textContent = currentPacket.l4.checksum;
    } else {
      inspL4Proto.textContent = currentPacket.l4.protocol;
      inspL4Dport.textContent = currentPacket.l4.dport;
      inspL4Sport.textContent = currentPacket.l4.sport;
      inspL4Seq.textContent = currentPacket.l4.seq;
      inspL4Check.textContent = currentPacket.l4.checksum;
    }

    inspL5Payload.textContent = currentPacket.l5.data;
    inspL5Size.textContent = currentPacket.l5.size;

    // Enable/disable tabs depending on encapsulation state
    updateInspectorTabsAvailability();
  }

  function updateInspectorTabsAvailability() {
    tabButtons.forEach(btn => {
      const targetTab = btn.getAttribute("data-tab");
      let disabled = false;

      if (simStep === 1 && targetTab !== "tab-l5") disabled = true;
      if (simStep === 2 && !["tab-l4", "tab-l5"].includes(targetTab)) disabled = true;
      if (simStep === 3 && targetTab === "tab-l2") disabled = true;

      // During decapsulation, hide tabs as they are stripped
      if (simStep === 10 && targetTab === "tab-l2") disabled = true;
      if (simStep === 11 && ["tab-l2", "tab-l3"].includes(targetTab)) disabled = true;
      if (simStep === 12 && targetTab !== "tab-l5") disabled = true;

      if (disabled) {
        btn.setAttribute("disabled", "true");
        if (btn.classList.contains("active")) {
          // Move active tab to L5 if current disabled
          switchActiveTab("tab-l5");
        }
      } else {
        btn.removeAttribute("disabled");
      }
    });
  }

  function switchActiveTab(tabId) {
    tabButtons.forEach(b => {
      if (b.getAttribute("data-tab") === tabId) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
    tabContents.forEach(c => {
      if (c.getAttribute("id") === tabId) {
        c.classList.add("active");
      } else {
        c.classList.remove("active");
      }
    });
  }

  function updatePlaybackControls() {
    btnPrevStep.disabled = stepHistory.length === 0;
    btnNextStep.disabled = simStep >= MAX_STEPS;
  }

  // --- Playback Automator Functions ---
  function triggerNextStep() {
    if (simStep >= MAX_STEPS) {
      stopPlayback();
      addLog("Simulation timeline successfully finished.", "system");
      return;
    }
    executeStep(simStep + 1);
  }

  function startPlayback() {
    if (playbackIntervalId !== null) return;

    btnTogglePlay.classList.add("btn-primary");
    document.getElementById("play-icon").classList.add("hidden");
    document.getElementById("pause-icon").classList.remove("hidden");
    btnTogglePlay.querySelector("span").textContent = "Pause Timeline";

    playbackIntervalId = setInterval(() => {
      triggerNextStep();
    }, playbackSpeed);
  }

  function stopPlayback() {
    if (playbackIntervalId === null) return;
    
    clearInterval(playbackIntervalId);
    playbackIntervalId = null;

    document.getElementById("play-icon").classList.remove("hidden");
    document.getElementById("pause-icon").classList.add("hidden");
    btnTogglePlay.querySelector("span").textContent = "Run Simulation";
  }

  function togglePlayback() {
    if (playbackIntervalId === null) {
      if (simStep >= MAX_STEPS) {
        initSimulation();
      }
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  // --- Event Listeners ---
  protocolPresetSelect.addEventListener("change", loadPreset);

  btnLoadConfig.addEventListener("click", () => {
    initSimulation();
  });

  btnPrevStep.addEventListener("click", () => {
    stepBackward();
  });

  btnNextStep.addEventListener("click", () => {
    stopPlayback();
    triggerNextStep();
  });

  btnReset.addEventListener("click", () => {
    initSimulation();
  });

  btnClearLogs.addEventListener("click", () => {
    logConsole.innerHTML = "";
    addLog("Trace console log cleared.", "system");
  });

  simSpeedSlider.addEventListener("input", (e) => {
    playbackSpeed = parseInt(e.target.value, 10);
    speedValueLabel.textContent = `Speed: ${(playbackSpeed / 1000).toFixed(1)}s`;
    
    if (playbackIntervalId !== null) {
      stopPlayback();
      startPlayback();
    }
  });

  // Header Inspector Tabs Toggle
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      switchActiveTab(targetTab);
    });
  });

  // Handle port inputs disabling on transport change
  transportProtocolSelect.addEventListener("change", () => {
    if (transportProtocolSelect.value === "icmp") {
      srcPortInput.setAttribute("disabled", "true");
      dstPortInput.setAttribute("disabled", "true");
    } else {
      srcPortInput.removeAttribute("disabled");
      dstPortInput.removeAttribute("disabled");
    }
  });

  // Re-center packet animation on window resize (since node coordinates shift in flex)
  window.addEventListener("resize", () => {
    if (simStep >= 5) {
      positionPacketOnMap(simStep);
    }
  });

  // --- Kickstart ---
  loadPreset();
});
