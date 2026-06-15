/* OSI Model Interactive Explorer - Core Logic */

document.addEventListener("DOMContentLoaded", () => {
  
  // --- OSI Layers Dataset ---
  const OSI_LAYERS = [
    {
      number: 7,
      name: "Application",
      pdu: "Data",
      hardware: "Gateway, Firewall, Host PC, Smart Devices",
      protocols: "HTTP, HTTPS, DNS, SMTP, FTP, SSH, DHCP",
      desc: "Serves as the window for applications to access network services. It directly interfaces with software application processes and handles user authentication, resource negotiation, and data transfer requests.",
      functions: [
        "Identifies communication partners and establishes connection viability.",
        "Determines resource availability and synchronizes application tasks.",
        "Directly supports application-level services (like browsing, email, and file transfers)."
      ],
      analogyHeader: "Postal Analogy",
      analogyIcon: "✍️",
      analogy: "Writing the actual letter. You decide what the content says and who the destination recipient is."
    },
    {
      number: 6,
      name: "Presentation",
      pdu: "Data",
      hardware: "Host CPU, Gateway",
      protocols: "SSL, TLS, JPEG, GIF, ASCII, EBCDIC, JSON, XML",
      desc: "Acts as the translator of the network. It formats, structures, encrypts, and compresses data to ensure that information sent from the application layer of one system is readable by the application layer of another.",
      functions: [
        "Data translation (e.g. converting between character encodings ASCII and EBCDIC).",
        "Encryption and decryption (e.g. SSL/TLS negotiation for secure connections).",
        "Data compression and decompression to optimize bandwidth consumption."
      ],
      analogyHeader: "Postal Analogy",
      analogyIcon: "🔒",
      analogy: "Translating the letter into a common language (or encrypting it in secret code) and folding it so it fits into the envelope."
    },
    {
      number: 5,
      name: "Session",
      pdu: "Data",
      hardware: "Host CPU, Gateway",
      protocols: "NetBIOS, RPC, SOCKS, PPTP, SQL Session",
      desc: "Manages, coordinates, and terminates conversational sessions between remote applications. It acts as the coordinator, establishing session checkpoints, synchronization flags, and handling connection recovery.",
      functions: [
        "Establishes, maintains, and tears down session connections between nodes.",
        "Dialog control (determining who transmits, when, and for how long).",
        "Session checkpointing (inserting flags to allow resumption after network failure)."
      ],
      analogyHeader: "Postal Analogy",
      analogyIcon: "☎️",
      analogy: "Calling the recipient to confirm they are available, setting up a schedule of correspondence, and ensuring they know when you are done writing."
    },
    {
      number: 4,
      name: "Transport",
      pdu: "Segment (TCP) / Datagram (UDP)",
      hardware: "Layer 4 Firewall, Host OS Gateway",
      protocols: "TCP, UDP, SCTP, BGP (via TCP), RIP (via UDP)",
      desc: "Responsible for end-to-end communication control, error correction, and flow control. It breaks large application payloads into smaller blocks (segments) at the sender, and reassembles them at the receiver.",
      functions: [
        "Segmentation and reassembly of large data payloads.",
        "Connection control (TCP handshake for reliable transmission or UDP for fast connectionless transport).",
        "Flow control (preventing receiver buffer overload) and error recovery (retransmitting lost packets)."
      ],
      analogyHeader: "Postal Analogy",
      analogyIcon: "📦",
      analogy: "Dividing a large manuscript into numbered sheets, adding serial numbers, and packing them into standard boxes so they can be reassembled in order."
    },
    {
      number: 3,
      name: "Network",
      pdu: "Packet",
      hardware: "Router, Layer 3 Switch, ICMP Firewall",
      protocols: "IP (IPv4/IPv6), ICMP, IPsec, ARP, OSPF, RIP",
      desc: "Handles path determination, logical addressing, and routing across multiple intermediate subnets. It determines the optimal routing path based on logical IP addresses.",
      functions: [
        "Logical IP addressing (assigning logical source and destination coordinates).",
        "Routing (forwarding packets through intermediate routers toward their destination).",
        "Fragmentation of packets when they exceed the Maximum Transmission Unit (MTU) size."
      ],
      analogyHeader: "Postal Analogy",
      analogyIcon: "🗺️",
      analogy: "Writing the street address and ZIP code of the recipient on the outside of each box, and having sorting centers route them across highways."
    },
    {
      number: 2,
      name: "Data Link",
      pdu: "Frame",
      hardware: "Switch, Network Interface Card (NIC), Bridge",
      protocols: "Ethernet (802.3), Wi-Fi (802.11), PPP, Frame Relay, L2TP",
      desc: "Ensures node-to-node link-level transmission. It packages network packets into structural frames, manages physical hardware addressing (MAC addresses), handles media access control, and performs checksum error checking.",
      functions: [
        "Framing (attaching synchronized headers and cyclic redundancy check trailers).",
        "Physical addressing (using MAC addresses to direct packets on the local subnet layer).",
        "Error detection (verifying Frame Check Sequence (FCS) checksum fields)."
      ],
      analogyHeader: "Postal Analogy",
      analogyIcon: "🚚",
      analogy: "Putting the address box onto local delivery vans, using registration barcodes to inspect transit logs at each terminal warehouse."
    },
    {
      number: 1,
      name: "Physical",
      pdu: "Bit",
      hardware: "Hub, Repeater, Fiber Optics, RJ45 Cable, Transceiver",
      protocols: "RS-232, 100BASE-T Ethernet Physical, DSL, Bluetooth Physical",
      desc: "Responsible for transmitting raw binary bits over a physical transmission medium. It defines electrical voltages, optical frequencies, radio signals, pinouts, and physical cable specifications.",
      functions: [
        "Transmission of unstructured binary bit streams across physical mediums.",
        "Defining interface standards (connector shapes, pin configurations, fiber wavelengths).",
        "Encoding/Modulation (representing binary 0 and 1 values as physical signals)."
      ],
      analogyHeader: "Postal Analogy",
      analogyIcon: "⚡",
      analogy: "The physical roads, tracks, trucks, and sorting conveyor belts that literally carry the boxes from one location to another."
    }
  ];

  // --- State Variables ---
  let selectedLayer = 7;
  
  // Simulation State
  let currentSimStep = 0;
  const maxSimStep = 14;
  let simIntervalId = null;
  let simSpeed = 1500; // ms
  let simPayload = "GET /index.html HTTP/1.1";
  let simPreset = "http";

  // Simulation Steps Descriptions
  const SIM_STEPS = [
    { phase: "encap", layer: 7, name: "Application", action: "Appends application header matching protocol requirements.", detail: "The web browser encapsulates our text payload into an HTTP GET request frame payload.", header: "HTTP GET" },
    { phase: "encap", layer: 6, name: "Presentation", action: "Data format structuring and SSL/TLS encryption mapping.", detail: "Standardizes character encoding to ASCII and executes TLS payload formatting.", header: "TLS Hdr" },
    { phase: "encap", layer: 5, name: "Session", action: "Configures checkpoints and logical connection tracking.", detail: "Establishes socket session state to track requests and associate replies.", header: "SESS Hdr" },
    { phase: "encap", layer: 4, name: "Transport", action: "Segments payload and appends source/destination port ports.", detail: "Appends TCP segments header. Source Port (random e.g. 5123) & Destination Port 80 (HTTP). Adds sequence numbers.", header: "TCP Hdr" },
    { phase: "encap", layer: 3, name: "Network", action: "Appends logical source and destination IP coordinates.", detail: "Encapsulates segment into an IP packet. Inserts Source IP (Sender) and Destination IP (Web Server). Ready for routing.", header: "IP Hdr" },
    { phase: "encap", layer: 2, name: "Data Link", action: "Wraps packet in frame with local hardware MAC addresses.", detail: "Encapsulates packet into an Ethernet Frame. Inserts Source MAC (Sender NIC) and Destination MAC (Local Gateway Router). Computes checksum trailer.", header: "Eth Hdr", trailer: "Eth FCS" },
    { phase: "encap", layer: 1, name: "Physical", action: "Serializes frame into unstructured electrical/optical binary stream.", detail: "Converts Ethernet frame data bytes into a stream of electrical voltage pulses representing bits (1s and 0s). Ready to pulse across link.", header: "" },
    { phase: "phys", layer: 1, name: "Transmission Wire", action: "Signals traverse physical medium towards destination interface.", detail: "Raw binary bitstream propagates across network cable links (copper RJ45 or fiber optic pulses).", header: "" },
    { phase: "decap", layer: 1, name: "Physical (Receiver)", action: "Receives raw signals and converts back to digital bits.", detail: "Receiver NIC registers incoming voltage changes and compiles the stream of bits back into digital memory buffers.", header: "" },
    { phase: "decap", layer: 2, name: "Data Link (Receiver)", action: "Inspects MAC address destination and verifies frame integrity.", detail: "Validates destination MAC matches NIC. Recomputes CRC checksum. Verification succeeds! Strips Ethernet header and trailer.", header: "Eth Hdr", trailer: "Eth FCS" },
    { phase: "decap", layer: 3, name: "Network (Receiver)", action: "Validates target logical IP and processes routing bounds.", detail: "Validates destination IP matches host. Strips IP header. Forwards payload packet to Transport stack.", header: "IP Hdr" },
    { phase: "decap", layer: 4, name: "Transport (Receiver)", action: "Inspects ports and verifies sequential segments integrity.", detail: "Validates TCP checksum and segment order. Strips TCP header. Maps destination port 80 to web server socket process.", header: "TCP Hdr" },
    { phase: "decap", layer: 5, name: "Session (Receiver)", action: "Matches incoming packets sequence to active session socket.", detail: "Identifies and resumes active session socket, organizing fragments.", header: "SESS Hdr" },
    { phase: "decap", layer: 6, name: "Presentation (Receiver)", action: "Decodes binary representation and decrypts TLS envelope.", detail: "Decodes ASCII characters stream and decrypts secure TLS payload envelope.", header: "TLS Hdr" },
    { phase: "decap", layer: 7, name: "Application (Receiver)", action: "Recovers raw payload text and executes server requests.", detail: "Web server parses request: GET /index.html. Recovers original application payload!", header: "HTTP GET" }
  ];

  // Preset payload defaults
  const PRESET_PAYLOADS = {
    "http": { payload: "GET /index.html HTTP/1.1", l7Header: "HTTP GET", l4Header: "TCP Hdr" },
    "dns": { payload: "Query: example.com (A Record)", l7Header: "DNS Qry", l4Header: "UDP Hdr" },
    "ping": { payload: "Ping Echo Request (Type 8)", l7Header: "ICMP Hdr", l4Header: "Raw IP" } // Ping has no transport header, ICMP wraps in IP directly
  };

  // Matching Game State
  let gameScore = 0;
  let gameTotal = 0;
  let gameCurrentItem = null;
  
  const GAME_POOL = [
    { name: "HTTP / HTTPS", layer: 7, hint: "Application layer web browsing protocols" },
    { name: "Router", layer: 3, hint: "Hardware device that handles inter-network pathfinding" },
    { name: "Switch", layer: 2, hint: "Subnet node device forwarding local frames by MAC addresses" },
    { name: "TCP / UDP", layer: 4, hint: "End-to-end transmission protocol managing segments flow" },
    { name: "IP Address", layer: 3, hint: "Logical coordinates used to route packets across subnets" },
    { name: "MAC Address", layer: 2, hint: "Hardware addressing burned into NIC card chips" },
    { name: "Hub / Repeater", layer: 1, hint: "Simple signal boosting device repeating incoming bits" },
    { name: "TLS / SSL", layer: 6, hint: "Cryptographic layers handling handshake encryption" },
    { name: "RPC (Remote Procedure Call)", layer: 5, hint: "Protocol coordinating remote inter-process sessions" },
    { name: "ASCII / JPEG", layer: 6, hint: "Data translation formats and file encoding standards" },
    { name: "JSON Data Format", layer: 6, hint: "Structured data representations used by REST APIs" },
    { name: "OSPF", layer: 3, hint: "Link-State routing algorithm calculating network hops" },
    { name: "RJ45 Copper Cable", layer: 1, hint: "Physical interface carrying electrical signals" },
    { name: "Fiber Optic Line", layer: 1, hint: "Physical cable media transporting light pulse streams" },
    { name: "Ethernet Frame Checksum", layer: 2, hint: "Data link checks to verify frame checksum integrity" },
    { name: "NetBIOS", layer: 5, hint: "Local name registration protocol maintaining active sessions" }
  ];

  // --- DOM Caching ---
  const osiStackPillar = document.getElementById("osi-stack-pillar");
  const layerInspectorPanel = document.getElementById("layer-inspector-panel");
  const inspectorLayerNumber = document.getElementById("inspector-layer-number");
  const inspectorLayerName = document.getElementById("inspector-layer-name");
  const inspectorLayerDesc = document.getElementById("inspector-layer-desc");
  const inspectorPdu = document.getElementById("inspector-pdu");
  const inspectorHardware = document.getElementById("inspector-hardware");
  const inspectorProtocols = document.getElementById("inspector-protocols");
  const inspectorFunctions = document.getElementById("inspector-functions");
  const inspectorAnalogyText = document.getElementById("inspector-analogy-text");
  
  // Sim controls
  const payloadInput = document.getElementById("payload-input");
  const simulationPresetSelect = document.getElementById("simulation-preset");
  const btnPrevStep = document.getElementById("btn-prev-step");
  const btnTogglePlay = document.getElementById("btn-toggle-play");
  const btnNextStep = document.getElementById("btn-next-step");
  const btnReset = document.getElementById("btn-reset");
  const simSpeedSlider = document.getElementById("sim-speed");
  const speedValueLabel = document.getElementById("speed-value");

  // Sim Status
  const simStatusBadge = document.getElementById("sim-status-badge");
  const simStatusLayerInfo = document.getElementById("sim-status-layer-info");
  const simStatusDescription = document.getElementById("sim-status-description");
  const packetRenderRow = document.getElementById("packet-render-row");
  const wireBitstream = document.getElementById("wire-bitstream");
  const pulsePacketIcon = document.getElementById("pulse-packet-icon");

  // Game UI
  const gameStartView = document.getElementById("game-start-view");
  const gameActiveView = document.getElementById("game-active-view");
  const btnStartGame = document.getElementById("btn-start-game");
  const gameItemName = document.getElementById("game-item-name");
  const gameItemHint = document.getElementById("game-item-hint");
  const gameSlotsContainer = document.getElementById("game-slots-container");
  const gameFeedbackBox = document.getElementById("game-feedback-box");
  const gameFeedbackText = document.getElementById("game-feedback-text");
  const gameScoreVal = document.getElementById("game-score-val");
  const btnQuitGame = document.getElementById("btn-quit-game");
  const btnNextGame = document.getElementById("btn-next-game");

  // --- Initialise OSI Stack Column ---
  function renderStackColumn() {
    osiStackPillar.innerHTML = "";
    
    // Render from Application (7) down to Physical (1)
    [...OSI_LAYERS].forEach(layer => {
      const btn = document.createElement("button");
      btn.className = "stack-layer-btn";
      btn.setAttribute("data-layer", layer.number);
      if (layer.number === selectedLayer) {
        btn.classList.add("active");
      }

      btn.innerHTML = `
        <span class="layer-num">L${layer.number}</span>
        <span class="layer-title">${layer.name}</span>
        <span class="layer-pdu-badge">${layer.pdu.split(" ")[0]}</span>
      `;

      btn.addEventListener("click", () => {
        selectOsiLayer(layer.number);
      });

      osiStackPillar.appendChild(btn);
    });
  }

  function selectOsiLayer(num) {
    selectedLayer = num;
    
    // Update active stack button highlight
    const allBtns = osiStackPillar.querySelectorAll(".stack-layer-btn");
    allBtns.forEach(btn => {
      const btnLayerNum = parseInt(btn.getAttribute("data-layer"), 10);
      if (btnLayerNum === num) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Populate details in inspector card
    const layer = OSI_LAYERS.find(l => l.number === num);
    if (!layer) return;

    inspectorLayerNumber.textContent = `Layer ${layer.number}`;
    inspectorLayerName.textContent = `${layer.name} Layer`;
    inspectorLayerDesc.textContent = layer.desc;
    inspectorPdu.textContent = layer.pdu;
    inspectorHardware.textContent = layer.hardware;
    inspectorProtocols.textContent = layer.protocols;
    
    // Custom borders
    layerInspectorPanel.style.borderLeftColor = `var(--color-l${num})`;

    // Core functions
    inspectorFunctions.innerHTML = "";
    layer.functions.forEach(fn => {
      const li = document.createElement("li");
      li.textContent = fn;
      inspectorFunctions.appendChild(li);
    });

    // Analogy
    inspectorAnalogyText.textContent = layer.analogy;
    const analogyHeader = layerInspectorPanel.querySelector(".analogy-header span");
    analogyHeader.textContent = `${layer.name} Layer Analogy`;
    const analogyIcon = layerInspectorPanel.querySelector(".analogy-icon");
    analogyIcon.textContent = layer.analogyIcon;
  }

  // --- Encapsulation Simulator Engine ---
  function updateSimulationStep() {
    const step = SIM_STEPS[currentSimStep];
    const presetInfo = PRESET_PAYLOADS[simPreset];
    simPayload = payloadInput.value.trim() || "GET /index.html HTTP/1.1";

    // 1. Highlight stack layer matching simulation step
    selectOsiLayer(step.layer);

    // 2. Set phase and titles
    if (step.phase === "encap") {
      simStatusBadge.className = "status-phase-badge encap";
      simStatusBadge.textContent = "ENCAP: SENDER";
    } else if (step.phase === "decap") {
      simStatusBadge.className = "status-phase-badge decap";
      simStatusBadge.textContent = "DECAP: RECEIVER";
    } else {
      simStatusBadge.className = "status-phase-badge phys";
      simStatusBadge.textContent = "PHYSICAL WIRE";
    }

    simStatusLayerInfo.textContent = step.phase === "phys" ? "Transmission Wire (Layer 1)" : `Layer ${step.layer}: ${step.name}`;
    simStatusDescription.innerHTML = `<b>${step.action}</b><br><span style="opacity:0.85;">${step.detail}</span>`;

    // 3. Render visual packet blocks
    renderPacketVisuals(step, presetInfo);

    // 4. Update playback controls disabled states
    btnPrevStep.disabled = (currentSimStep === 0);
    btnNextStep.disabled = (currentSimStep === maxSimStep);
    btnReset.disabled = (currentSimStep === 0);
  }

  function renderPacketVisuals(step, presetInfo) {
    packetRenderRow.innerHTML = "";
    pulsePacketIcon.classList.add("hidden");

    // During physical transmission wire phase, pulse packet across cable and show binary
    if (step.phase === "phys") {
      packetRenderRow.innerHTML = `<div class="packet-block payload font-mono" style="background:#0f172a; border-style:dashed;">01001000 01100101 ... Binary stream</div>`;
      pulsePacketIcon.classList.remove("hidden");
      return;
    }

    // Determine headers active at current step
    const activeHeaders = [];
    
    // Encapsulation adds layers one by one (L7, then L6, L5, L4, L3, L2)
    if (step.phase === "encap") {
      // Step indices correspond to layers: 0=L7, 1=L6, 2=L5, 3=L4, 4=L3, 5=L2, 6=L1
      if (currentSimStep >= 0) activeHeaders.push({ id: 7, label: presetInfo.l7Header });
      if (currentSimStep >= 1) activeHeaders.push({ id: 6, label: "TLS Hdr" });
      if (currentSimStep >= 2) activeHeaders.push({ id: 5, label: "SESS Hdr" });
      // Ping skips TCP/UDP
      if (currentSimStep >= 3) {
        if (simPreset !== "ping") activeHeaders.push({ id: 4, label: presetInfo.l4Header });
        else activeHeaders.push({ id: 4, label: "ICMP Hdr" });
      }
      if (currentSimStep >= 4) activeHeaders.push({ id: 3, label: "IP Hdr" });
      if (currentSimStep >= 5) activeHeaders.push({ id: 2, label: "Eth Hdr", isEthernet: true });
    } else {
      // Decapsulation removes layers one by one (Receiver reads: 8=L1, 9=L2, 10=L3, 11=L4, 12=L5, 13=L6, 14=L7)
      // Step indices:
      // 8 => All headers present (Eth, IP, Transport, Session, Presentation, Application)
      // 9 => Ethernet removed (IP, Transport, Session, Presentation, Application)
      // 10 => IP removed (Transport, Session, Presentation, Application)
      // 11 => Transport removed (Session, Presentation, Application)
      // 12 => Session removed (Presentation, Application)
      // 13 => Presentation removed (Application)
      // 14 => Application removed (Only payload)
      if (currentSimStep <= 13) activeHeaders.push({ id: 7, label: presetInfo.l7Header });
      if (currentSimStep <= 12) activeHeaders.push({ id: 6, label: "TLS Hdr" });
      if (currentSimStep <= 11) activeHeaders.push({ id: 5, label: "SESS Hdr" });
      if (currentSimStep <= 10) {
        if (simPreset !== "ping") activeHeaders.push({ id: 4, label: presetInfo.l4Header });
        else activeHeaders.push({ id: 4, label: "ICMP Hdr" });
      }
      if (currentSimStep <= 9) activeHeaders.push({ id: 3, label: "IP Hdr" });
      if (currentSimStep <= 8) activeHeaders.push({ id: 2, label: "Eth Hdr", isEthernet: true });
    }

    // Build DOM structure left-to-right (Ethernet Hdr, IP Hdr, TCP Hdr, SESS Hdr, TLS Hdr, HTTP Hdr, payload, Ethernet FCS)
    const sortedHeaders = [...activeHeaders].sort((a, b) => a.id - b.id); // Sorted 2 to 7
    
    // Ethernet header goes first (outermost on left)
    const ethHdr = sortedHeaders.find(h => h.isEthernet);
    if (ethHdr) {
      const block = document.createElement("div");
      block.className = "packet-block l2";
      block.textContent = ethHdr.label;
      packetRenderRow.appendChild(block);
    }

    // Next IP, TCP, Session, Presentation, Application
    sortedHeaders.forEach(hdr => {
      if (hdr.isEthernet) return; // Already rendered
      const block = document.createElement("div");
      block.className = `packet-block l${hdr.id}`;
      block.textContent = hdr.label;
      packetRenderRow.appendChild(block);
    });

    // Central Payload box
    const payloadBlock = document.createElement("div");
    payloadBlock.className = "packet-block payload";
    
    // Truncate payload text if too long
    const valText = simPayload.length > 28 ? simPayload.substring(0, 25) + "..." : simPayload;
    payloadBlock.textContent = `"${valText}"`;
    packetRenderRow.appendChild(payloadBlock);

    // Ethernet trailer FCS (outermost on right)
    if (ethHdr) {
      const block = document.createElement("div");
      block.className = "packet-block l2-trailer";
      block.textContent = "Eth FCS";
      packetRenderRow.appendChild(block);
    }
  }

  function generateWireBitstream() {
    let bits = "";
    for (let i = 0; i < 50; i++) {
      bits += Math.floor(Math.random() * 2) + " ";
    }
    wireBitstream.textContent = bits;
  }

  // --- Automator Playback ---
  function startSimulation() {
    if (simIntervalId !== null) return;
    
    btnTogglePlay.classList.add("btn-primary");
    document.getElementById("play-icon").classList.add("hidden");
    document.getElementById("pause-icon").classList.remove("hidden");
    btnTogglePlay.querySelector("span").textContent = "Pause Simulation";

    simIntervalId = setInterval(() => {
      if (currentSimStep >= maxSimStep) {
        stopSimulation();
        return;
      }
      currentSimStep++;
      updateSimulationStep();
    }, simSpeed);
  }

  function stopSimulation() {
    if (simIntervalId === null) return;
    clearInterval(simIntervalId);
    simIntervalId = null;

    document.getElementById("play-icon").classList.remove("hidden");
    document.getElementById("pause-icon").classList.add("hidden");
    btnTogglePlay.querySelector("span").textContent = "Run Simulation";
  }

  function toggleSimulation() {
    if (simIntervalId === null) {
      if (currentSimStep >= maxSimStep) {
        currentSimStep = 0;
      }
      startSimulation();
    } else {
      stopSimulation();
    }
  }

  // --- Game Sandbox Engine ---
  btnStartGame.addEventListener("click", () => {
    gameStartView.classList.add("hidden");
    gameActiveView.classList.remove("hidden");
    gameScore = 0;
    gameTotal = 0;
    updateGameScoreLabel();
    loadNextGameItem();
  });

  btnQuitGame.addEventListener("click", () => {
    gameStartView.classList.remove("hidden");
    gameActiveView.classList.add("hidden");
  });

  btnNextGame.addEventListener("click", () => {
    loadNextGameItem();
  });

  function updateGameScoreLabel() {
    gameScoreVal.textContent = `${gameScore}/${gameTotal}`;
  }

  function loadNextGameItem() {
    gameFeedbackBox.className = "game-feedback mt-12 hidden";
    btnNextGame.classList.add("hidden");

    // Pick a random game item
    gameCurrentItem = GAME_POOL[Math.floor(Math.random() * GAME_POOL.length)];
    gameItemName.textContent = gameCurrentItem.name;
    gameItemHint.textContent = gameCurrentItem.hint;

    // Render slots matching buttons (Layers 7 down to 1)
    gameSlotsContainer.innerHTML = "";
    
    [...OSI_LAYERS].forEach(layer => {
      const btn = document.createElement("button");
      btn.className = "btn-game-slot";
      btn.innerHTML = `
        <span class="slot-idx">L${layer.number}</span>
        <span class="slot-title">${layer.name}</span>
      `;
      btn.addEventListener("click", () => handleGameSlotSelection(btn, layer.number));
      gameSlotsContainer.appendChild(btn);
    });
  }

  function handleGameSlotSelection(selectedBtn, layerNum) {
    const isCorrect = (layerNum === gameCurrentItem.layer);

    // Lock slots
    const allBtns = gameSlotsContainer.querySelectorAll(".btn-game-slot");
    allBtns.forEach(btn => {
      btn.disabled = true;
    });

    if (isCorrect) {
      selectedBtn.classList.add("correct");
      gameFeedbackBox.className = "game-feedback mt-12 correct";
      gameFeedbackText.textContent = "Correct! Spot-on mapping.";
      gameScore++;
    } else {
      selectedBtn.classList.add("incorrect");
      // Find and highlight correct slot
      allBtns.forEach(btn => {
        const titleSpan = btn.querySelector(".slot-title");
        const correctLayer = OSI_LAYERS.find(l => l.number === gameCurrentItem.layer);
        if (titleSpan && titleSpan.textContent === correctLayer.name) {
          btn.classList.add("correct");
        }
      });

      gameFeedbackBox.className = "game-feedback mt-12 incorrect";
      const correctLayer = OSI_LAYERS.find(l => l.number === gameCurrentItem.layer);
      gameFeedbackText.innerHTML = `Incorrect. <b>${gameCurrentItem.name}</b> operates at <b>Layer ${gameCurrentItem.layer}: ${correctLayer.name}</b>.`;
    }

    gameTotal++;
    updateGameScoreLabel();
    btnNextGame.classList.remove("hidden");
  }

  // --- Preset Selection Handler ---
  simulationPresetSelect.addEventListener("change", () => {
    simPreset = simulationPresetSelect.value;
    const presetInfo = PRESET_PAYLOADS[simPreset];
    payloadInput.value = presetInfo.payload;
    
    // Reset simulation
    stopSimulation();
    currentSimStep = 0;
    updateSimulationStep();
  });

  // --- Input and timeline event binds ---
  payloadInput.addEventListener("input", () => {
    if (simIntervalId === null && currentSimStep < 7) {
      updateSimulationStep();
    }
  });

  btnPrevStep.addEventListener("click", () => {
    stopSimulation();
    if (currentSimStep > 0) {
      currentSimStep--;
      updateSimulationStep();
    }
  });

  btnNextStep.addEventListener("click", () => {
    stopSimulation();
    if (currentSimStep < maxSimStep) {
      currentSimStep++;
      updateSimulationStep();
    }
  });

  btnReset.addEventListener("click", () => {
    stopSimulation();
    currentSimStep = 0;
    updateSimulationStep();
  });

  btnTogglePlay.addEventListener("click", toggleSimulation);

  simSpeedSlider.addEventListener("input", (e) => {
    simSpeed = parseInt(e.target.value, 10);
    speedValueLabel.textContent = `Speed: ${(simSpeed / 1000).toFixed(1)}s`;
    
    if (simIntervalId !== null) {
      stopSimulation();
      startSimulation();
    }
  });

  // --- Kickstart ---
  renderStackColumn();
  selectOsiLayer(7);
  generateWireBitstream();
  setInterval(generateWireBitstream, 500); // Pulse binary digits in background
  
  // Set default payload
  payloadInput.value = PRESET_PAYLOADS["http"].payload;
  updateSimulationStep();
});
