/* TCP Three-Way Handshake Simulator - Core Logic */

document.addEventListener("DOMContentLoaded", () => {
  
  // --- Socket State Constants ---
  const STATES = {
    CLOSED: "CLOSED",
    LISTEN: "LISTEN",
    SYN_SENT: "SYN-SENT",
    SYN_RECEIVED: "SYN-RECEIVED",
    ESTABLISHED: "ESTABLISHED",
    FIN_WAIT_1: "FIN-WAIT-1",
    FIN_WAIT_2: "FIN-WAIT-2",
    CLOSE_WAIT: "CLOSE-WAIT",
    LAST_ACK: "LAST-ACK",
    TIME_WAIT: "TIME-WAIT"
  };

  // --- State Variables ---
  let clientState = STATES.CLOSED;
  let serverState = STATES.LISTEN;

  let clientISN = 1000;
  let serverISN = 5000;

  let clientSndNxt = null;
  let clientRcvNxt = null;
  let serverSndNxt = null;
  let serverRcvNxt = null;

  // Simulation Controls State
  let activeScenario = "standard"; // standard, lossy, teardown, simultaneous
  let currentSimStep = 0;
  let isPacketLossEnabled = false;
  let isSimultaneousOpenEnabled = false;
  
  let playIntervalId = null;
  let playSpeed = 2000; // ms
  
  // Retransmission Timer variables
  let clientRtoActive = false;
  let clientRtoSeconds = 4.0;
  let clientRtoIntervalId = null;
  
  let serverRtoActive = false;
  let serverRtoSeconds = 4.0;
  let serverRtoIntervalId = null;

  // Active packet details
  let activeSegment = null;
  let animationTimeoutId = null;

  // Quiz State
  let quizScore = 0;
  let quizTotal = 0;
  let currentQuizQuestion = null;

  // --- DOM Elements Caching ---
  const clientIsnInput = document.getElementById("client-isn");
  const serverIsnInput = document.getElementById("server-isn");
  const togglePacketLoss = document.getElementById("toggle-packet-loss");
  const toggleSimOpen = document.getElementById("toggle-sim-open");
  
  const btnInitHandshake = document.getElementById("btn-init-handshake");
  const btnInitTeardown = document.getElementById("btn-init-teardown");

  // Terminal Sockets
  const nodeClient = document.getElementById("node-client");
  const nodeServer = document.getElementById("node-server");
  const clientLed = document.getElementById("client-led");
  const serverLed = document.getElementById("server-led");
  
  const clientStateLabel = document.getElementById("client-state");
  const serverStateLabel = document.getElementById("server-state");
  
  const clientSndNxtLabel = document.getElementById("client-snd-nxt");
  const clientRcvNxtLabel = document.getElementById("client-rcv-nxt");
  const serverSndNxtLabel = document.getElementById("server-snd-nxt");
  const serverRcvNxtLabel = document.getElementById("server-rcv-nxt");

  // Retransmission boxes
  const clientRtoBox = document.getElementById("client-rto-box");
  const clientRtoVal = document.getElementById("client-rto-val");
  const serverRtoBox = document.getElementById("server-rto-box");
  const serverRtoVal = document.getElementById("server-rto-val");

  // Wire
  const travelingSegment = document.getElementById("traveling-segment");
  const packetFlagsShort = document.getElementById("packet-flags-short");
  const packetArrowDir = document.getElementById("packet-arrow-dir");

  // Inspector
  const hdrSrcPort = document.getElementById("hdr-src-port");
  const hdrDstPort = document.getElementById("hdr-dst-port");
  const hdrSeqVal = document.getElementById("hdr-seq-val");
  const hdrAckVal = document.getElementById("hdr-ack-val");
  const hdrWinVal = document.getElementById("hdr-win-val");

  const flagUrg = document.getElementById("flag-urg");
  const flagAck = document.getElementById("flag-ack");
  const flagPsh = document.getElementById("flag-psh");
  const flagRst = document.getElementById("flag-rst");
  const flagSyn = document.getElementById("flag-syn");
  const flagFin = document.getElementById("flag-fin");

  // Stepper
  const btnPrevStep = document.getElementById("btn-prev-step");
  const btnTogglePlay = document.getElementById("btn-toggle-play");
  const btnNextStep = document.getElementById("btn-next-step");
  const btnReset = document.getElementById("btn-reset");
  const simSpeedSlider = document.getElementById("sim-speed");
  const speedValueLabel = document.getElementById("speed-value");

  // Logs
  const logConsole = document.getElementById("log-console");
  const btnClearLogs = document.getElementById("btn-clear-logs");
  const simulationPresetSelect = document.getElementById("simulation-preset");

  // Quiz
  const quizStartView = document.getElementById("quiz-start-view");
  const quizActiveView = document.getElementById("quiz-active-view");
  const btnStartQuiz = document.getElementById("btn-start-quiz");
  const quizQuestionText = document.getElementById("quiz-question-text");
  const quizOptionsContainer = document.getElementById("quiz-options-container");
  const quizFeedbackBox = document.getElementById("quiz-feedback-box");
  const quizFeedbackText = document.getElementById("quiz-feedback-text");
  const quizScoreVal = document.getElementById("quiz-score-val");
  const btnQuitQuiz = document.getElementById("btn-quit-quiz");
  const btnNextQuiz = document.getElementById("btn-next-quiz");

  // --- Telemetry Logger ---
  function addLog(msg, source = "system") {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = document.createElement("div");
    logEntry.className = `log-entry ${source}`;
    logEntry.innerHTML = `<span style="opacity:0.4;">[${timeStr}]</span> ${msg}`;
    logConsole.appendChild(logEntry);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  // --- TCP State Machine UI Refresher ---
  function renderAll() {
    // LED classes
    updateLed(clientLed, clientState);
    updateLed(serverLed, serverState);

    // Badges & text
    clientStateLabel.textContent = clientState;
    clientStateLabel.className = `terminal-state-badge state-${clientState.toLowerCase()}`;
    
    serverStateLabel.textContent = serverState;
    serverStateLabel.className = `terminal-state-badge state-${serverState.toLowerCase()}`;

    // SND/RCV lists
    clientSndNxtLabel.textContent = clientSndNxt !== null ? clientSndNxt : "--";
    clientRcvNxtLabel.textContent = clientRcvNxt !== null ? clientRcvNxt : "--";
    serverSndNxtLabel.textContent = serverSndNxt !== null ? serverSndNxt : "--";
    serverRcvNxtLabel.textContent = serverRcvNxt !== null ? serverRcvNxt : "--";

    // Playback control button triggers
    updatePlaybackControls();
  }

  function updateLed(ledEl, state) {
    ledEl.className = "dot-led";
    if (state === STATES.ESTABLISHED) {
      ledEl.classList.add("active");
      ledEl.style.backgroundColor = "var(--color-success)";
      ledEl.style.boxShadow = "0 0 10px var(--success-glow)";
    } else if (state !== STATES.CLOSED && state !== STATES.LISTEN) {
      ledEl.classList.add("active");
      if (ledEl === clientLed) {
        ledEl.style.backgroundColor = "var(--color-client)";
        ledEl.style.boxShadow = "0 0 10px var(--client-glow)";
      } else {
        ledEl.style.backgroundColor = "var(--color-server)";
        ledEl.style.boxShadow = "0 0 10px var(--server-glow)";
      }
    } else {
      ledEl.style.backgroundColor = "var(--text-muted)";
      ledEl.style.boxShadow = "none";
    }
  }

  function updatePlaybackControls() {
    // Determine active scenario step limitations
    const maxSteps = getScenarioMaxSteps();
    btnPrevStep.disabled = (currentSimStep === 0);
    btnNextStep.disabled = (currentSimStep >= maxSteps || clientRtoActive || serverRtoActive);
    btnReset.disabled = (currentSimStep === 0 && clientState === STATES.CLOSED);
    
    // Toggle teardown button viability
    btnInitTeardown.disabled = (clientState !== STATES.ESTABLISHED || serverState !== STATES.ESTABLISHED);
  }

  function getScenarioMaxSteps() {
    if (activeScenario === "standard" || activeScenario === "lossy") return 3;
    if (activeScenario === "teardown") return 4;
    if (activeScenario === "simultaneous") return 4;
    return 3;
  }

  // --- Reset Entire Simulation ---
  function resetSimulation(soft = false) {
    stopSimulation();
    stopRtoCountdown("client");
    stopRtoCountdown("server");

    currentSimStep = 0;
    
    if (!soft) {
      clientISN = parseInt(clientIsnInput.value, 10) || 1000;
      serverISN = parseInt(serverIsnInput.value, 10) || 5000;
      
      clientState = STATES.CLOSED;
      serverState = STATES.LISTEN;
      
      clientSndNxt = null;
      clientRcvNxt = null;
      serverSndNxt = null;
      serverRcvNxt = null;
      
      logConsole.innerHTML = "";
      addLog("TCP Simulation reset. Client socket is CLOSED, Server socket is in LISTEN mode.", "system");
    }

    clearInspector();
    travelingSegment.classList.add("hidden");
    travelingSegment.className = "segment-packet hidden";
    
    renderAll();
  }

  // --- Segment Header Inspector updates ---
  function updateInspector(seg) {
    if (!seg) {
      clearInspector();
      return;
    }

    hdrSrcPort.textContent = seg.srcPort;
    hdrDstPort.textContent = seg.dstPort;
    hdrSeqVal.textContent = seg.seq;
    hdrAckVal.textContent = seg.ack !== 0 ? seg.ack : "--";
    hdrWinVal.textContent = seg.win;

    updateFlagCell(flagUrg, seg.flags.URG);
    updateFlagCell(flagAck, seg.flags.ACK);
    updateFlagCell(flagPsh, seg.flags.PSH);
    updateFlagCell(flagRst, seg.flags.RST);
    updateFlagCell(flagSyn, seg.flags.SYN);
    updateFlagCell(flagFin, seg.flags.FIN);
  }

  function updateFlagCell(cellEl, flagVal) {
    cellEl.textContent = `${cellEl.id.split("-")[1].toUpperCase()}: ${flagVal}`;
    if (flagVal === 1) {
      cellEl.classList.add("active-flag");
    } else {
      cellEl.classList.remove("active-flag");
    }
  }

  function clearInspector() {
    hdrSrcPort.textContent = "--";
    hdrDstPort.textContent = "--";
    hdrSeqVal.textContent = "--";
    hdrAckVal.textContent = "--";
    hdrWinVal.textContent = "1024";

    const flags = [flagUrg, flagAck, flagPsh, flagRst, flagSyn, flagFin];
    flags.forEach(f => {
      f.textContent = `${f.id.split("-")[1].toUpperCase()}: 0`;
      f.classList.remove("active-flag");
    });
  }

  // --- Wire Packet Travel Animator ---
  function animatePacket(fromNode, toNode, flagsLabel, onArrival, onDrop = null) {
    // Cancel any existing transitions
    clearTimeout(animationTimeoutId);
    
    travelingSegment.className = "segment-packet";
    travelingSegment.style.transition = "none";
    
    // Set initial position
    if (fromNode === "client") {
      travelingSegment.style.left = "10%";
      packetArrowDir.innerHTML = "&rarr;";
      travelingSegment.style.backgroundColor = "var(--color-client)";
    } else {
      travelingSegment.style.left = "90%";
      packetArrowDir.innerHTML = "&larr;";
      travelingSegment.style.backgroundColor = "var(--color-server)";
    }

    packetFlagsShort.textContent = flagsLabel;
    travelingSegment.classList.remove("hidden");

    // Force style recalculation before trigger transition
    travelingSegment.offsetHeight;

    // Trigger transition slide
    travelingSegment.style.transition = `left ${playSpeed / 1000}s linear`;
    
    if (toNode === "client") {
      travelingSegment.style.left = "10%";
    } else {
      travelingSegment.style.left = "90%";
    }

    // Packet drop timer check
    if (onDrop) {
      const dropPointTime = playSpeed * 0.5; // Drop mid-way
      animationTimeoutId = setTimeout(() => {
        travelingSegment.classList.add("dropped");
        addLog(`<b>[WIRE ERROR]</b> Segment carrying [${flagsLabel}] dropped in transit! Packet Loss detected.`, "error");
        setTimeout(() => {
          travelingSegment.classList.add("hidden");
        }, 500);
        onDrop();
      }, dropPointTime);
    } else {
      // Normal arrival
      animationTimeoutId = setTimeout(() => {
        travelingSegment.classList.add("hidden");
        onArrival();
      }, playSpeed);
    }
  }

  // --- RTO Retransmission Countdown Timer ---
  function startRtoCountdown(node, onTimeout) {
    if (node === "client") {
      stopRtoCountdown("client");
      clientRtoActive = true;
      clientRtoSeconds = 4.0;
      clientRtoBox.classList.remove("hidden");
      clientRtoVal.textContent = `${clientRtoSeconds.toFixed(1)}s`;

      clientRtoIntervalId = setInterval(() => {
        clientRtoSeconds -= 0.1;
        if (clientRtoSeconds <= 0) {
          stopRtoCountdown("client");
          onTimeout();
        } else {
          clientRtoVal.textContent = `${clientRtoSeconds.toFixed(1)}s`;
        }
      }, 100);
    } else {
      stopRtoCountdown("server");
      serverRtoActive = true;
      serverRtoSeconds = 4.0;
      serverRtoBox.classList.remove("hidden");
      serverRtoVal.textContent = `${serverRtoSeconds.toFixed(1)}s`;

      serverRtoIntervalId = setInterval(() => {
        serverRtoSeconds -= 0.1;
        if (serverRtoSeconds <= 0) {
          stopRtoCountdown("server");
          onTimeout();
        } else {
          serverRtoVal.textContent = `${serverRtoSeconds.toFixed(1)}s`;
        }
      }, 100);
    }
    renderAll();
  }

  function stopRtoCountdown(node) {
    if (node === "client") {
      clearInterval(clientRtoIntervalId);
      clientRtoIntervalId = null;
      clientRtoActive = false;
      clientRtoBox.classList.add("hidden");
    } else {
      clearInterval(serverRtoIntervalId);
      serverRtoIntervalId = null;
      serverRtoActive = false;
      serverRtoBox.classList.add("hidden");
    }
    renderAll();
  }

  // --- Handshake Solver Engine ---
  
  // STEP 0: Send SYN (Client -> Server)
  function executeStep0() {
    clientState = STATES.SYN_SENT;
    clientSndNxt = clientISN;
    
    activeSegment = {
      srcPort: 51234,
      dstPort: 80,
      seq: clientISN,
      ack: 0,
      win: 1024,
      flags: { URG: 0, ACK: 0, PSH: 0, RST: 0, SYN: 1, FIN: 0 }
    };
    updateInspector(activeSegment);

    addLog("Client: Transition from CLOSED to <b>SYN-SENT</b>. Sending SYN segment.", "client");
    addLog(`TCP Header: SYN=1, ACK=0, Seq=${clientISN}, Ack=--`, "client");

    const onArrival = () => {
      serverState = STATES.SYN_RECEIVED;
      serverRcvNxt = clientISN + 1; // SYN consumes 1 sequence number
      addLog("Server: Received SYN segment from Client. Transition to <b>SYN-RECEIVED</b>.", "server");
      renderAll();
    };

    const onDrop = () => {
      // In lossy scenario, start Client RTO Timer to resend SYN
      startRtoCountdown("client", () => {
        addLog("Client: Retransmission Timeout (RTO) expired! Resending SYN segment...", "warning");
        animatePacket("client", "server", "SYN", onArrival);
      });
    };

    // If packet loss is checked in this step
    const dropThisSegment = isPacketLossEnabled;
    animatePacket("client", "server", "SYN", onArrival, dropThisSegment ? onDrop : null);
    renderAll();
  }

  // STEP 1: Send SYN-ACK (Server -> Client)
  function executeStep1() {
    serverState = STATES.SYN_RECEIVED;
    serverSndNxt = serverISN;
    
    // Ack is Client's Seq + 1
    const targetAck = clientISN + 1;

    activeSegment = {
      srcPort: 80,
      dstPort: 51234,
      seq: serverISN,
      ack: targetAck,
      win: 1024,
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 1, FIN: 0 }
    };
    updateInspector(activeSegment);

    addLog("Server: Preparing SYN-ACK response.", "server");
    addLog(`TCP Header: SYN=1, ACK=1, Seq=${serverISN}, Ack=${targetAck}`, "server");

    const onArrival = () => {
      clientState = STATES.ESTABLISHED;
      clientRcvNxt = serverISN + 1;
      clientSndNxt = clientISN + 1;
      addLog("Client: Received SYN-ACK. Transition to <b>ESTABLISHED</b> connection.", "client");
      renderAll();
    };

    const onDrop = () => {
      // Server waits for ACK, but Client SYN timer is also waiting.
      // Usually, Client SYN-SENT will timeout because it never receives SYN-ACK.
      startRtoCountdown("client", () => {
        addLog("Client: Timeout waiting for SYN-ACK! Resending client SYN...", "warning");
        // Re-run standard SYN
        animatePacket("client", "server", "SYN", () => {
          serverState = STATES.SYN_RECEIVED;
          addLog("Server: Received duplicate SYN. Resending SYN-ACK...", "server");
          animatePacket("server", "client", "SYN-ACK", onArrival);
        });
      });
    };

    animatePacket("server", "client", "SYN-ACK", onArrival, isPacketLossEnabled ? onDrop : null);
    renderAll();
  }

  // STEP 2: Send ACK (Client -> Server)
  function executeStep2() {
    clientState = STATES.ESTABLISHED;
    
    const targetSeq = clientISN + 1;
    const targetAck = serverISN + 1;

    activeSegment = {
      srcPort: 51234,
      dstPort: 80,
      seq: targetSeq,
      ack: targetAck,
      win: 1024,
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 0, FIN: 0 }
    };
    updateInspector(activeSegment);

    addLog("Client: Sending final ACK segment to establish connection.", "client");
    addLog(`TCP Header: SYN=0, ACK=1, Seq=${targetSeq}, Ack=${targetAck}`, "client");

    const onArrival = () => {
      serverState = STATES.ESTABLISHED;
      serverSndNxt = serverISN + 1;
      addLog("Server: Final ACK received. Transition to <b>ESTABLISHED</b>. Handshake complete!", "success");
      renderAll();
    };

    const onDrop = () => {
      // Server will timeout waiting for ACK and resend SYN-ACK
      startRtoCountdown("server", () => {
        addLog("Server: Timeout waiting for ACK! Retransmitting SYN-ACK...", "warning");
        animatePacket("server", "client", "SYN-ACK", () => {
          addLog("Client: Duplicate SYN-ACK received. Resending ACK...", "client");
          animatePacket("client", "server", "ACK", onArrival);
        });
      });
    };

    animatePacket("client", "server", "ACK", onArrival, isPacketLossEnabled ? onDrop : null);
    renderAll();
  }

  // STEP 3 (Standard): Complete handshake validation
  function executeStep3() {
    addLog("TCP Connection is fully ESTABLISHED. Sockets are open for full-duplex transmission.", "success");
    renderAll();
  }

  // --- Simultaneous Open Handshake (collision SYN) ---
  function executeSimOpenStep0() {
    clientState = STATES.SYN_SENT;
    serverState = STATES.SYN_SENT;
    clientSndNxt = clientISN;
    serverSndNxt = serverISN;

    addLog("Simultaneous Open: Both nodes initiate connection requests simultaneously.", "system");
    addLog("Client sends SYN (Seq=1000). Server sends SYN (Seq=5000). Both enter <b>SYN-SENT</b>.", "system");

    // Animate packet collisions visually on the wire
    animatePacket("client", "server", "SYN", () => {});
    
    // We delay the server animation slightly to represent collision crossing path
    setTimeout(() => {
      animatePacket("server", "client", "SYN", () => {
        clientState = STATES.SYN_RECEIVED;
        serverState = STATES.SYN_RECEIVED;
        clientRcvNxt = serverISN + 1;
        serverRcvNxt = clientISN + 1;
        addLog("Collision: Sockets receive matching SYNs. Both transition to <b>SYN-RECEIVED</b>.", "system");
        renderAll();
      });
    }, 200);

    renderAll();
  }

  function executeSimOpenStep1() {
    // Both send ACKs to acknowledge the other's SYN
    addLog("Client replies with ACK (Seq=1001, Ack=5001). Server replies with ACK (Seq=5001, Ack=1001).", "system");

    animatePacket("client", "server", "ACK", () => {});
    setTimeout(() => {
      animatePacket("server", "client", "ACK", () => {
        clientState = STATES.ESTABLISHED;
        serverState = STATES.ESTABLISHED;
        clientSndNxt = clientISN + 1;
        serverSndNxt = serverISN + 1;
        addLog("Simultaneous Open Complete: Both sockets transition to <b>ESTABLISHED</b>.", "success");
        renderAll();
      });
    }, 200);

    renderAll();
  }

  // --- Teardown connection (4-Way FIN Handshake) ---
  // Starts with Client & Server ESTABLISHED.
  function executeTeardownStep0() {
    clientState = STATES.FIN_WAIT_1;
    
    activeSegment = {
      srcPort: 51234,
      dstPort: 80,
      seq: clientSndNxt,
      ack: clientRcvNxt,
      win: 1024,
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 0, FIN: 1 }
    };
    updateInspector(activeSegment);

    addLog("Client: Initiating connection teardown. Transition to <b>FIN-WAIT-1</b>. Sending FIN.", "client");
    addLog(`TCP Header: FIN=1, ACK=1, Seq=${clientSndNxt}, Ack=${clientRcvNxt}`, "client");

    const onArrival = () => {
      serverState = STATES.CLOSE_WAIT;
      serverRcvNxt += 1; // FIN consumes 1 sequence number
      addLog("Server: Received FIN. Transition to <b>CLOSE-WAIT</b>. Server half of connection closed.", "server");
      renderAll();
    };

    animatePacket("client", "server", "FIN", onArrival);
    renderAll();
  }

  function executeTeardownStep1() {
    // Server sends ACK. Sockets go to CLOSE-WAIT & FIN-WAIT-2
    serverState = STATES.CLOSE_WAIT;
    
    activeSegment = {
      srcPort: 80,
      dstPort: 51234,
      seq: serverSndNxt,
      ack: serverRcvNxt,
      win: 1024,
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 0, FIN: 0 }
    };
    updateInspector(activeSegment);

    addLog("Server: Sending ACK to confirm Client's FIN.", "server");
    addLog(`TCP Header: ACK=1, Seq=${serverSndNxt}, Ack=${serverRcvNxt}`, "server");

    const onArrival = () => {
      clientState = STATES.FIN_WAIT_2;
      clientRcvNxt = serverSndNxt;
      clientSndNxt += 1;
      addLog("Client: Received ACK. Transition to <b>FIN-WAIT-2</b>. Awaiting Server's FIN.", "client");
      renderAll();
    };

    animatePacket("server", "client", "ACK", onArrival);
    renderAll();
  }

  function executeTeardownStep2() {
    // Server has finished data transfer, sends its own FIN. Goes to LAST-ACK
    serverState = STATES.LAST_ACK;
    
    activeSegment = {
      srcPort: 80,
      dstPort: 51234,
      seq: serverSndNxt,
      ack: serverRcvNxt,
      win: 1024,
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 0, FIN: 1 }
    };
    updateInspector(activeSegment);

    addLog("Server: Initiating active close from server side. Transition to <b>LAST-ACK</b>. Sending FIN.", "server");
    addLog(`TCP Header: FIN=1, ACK=1, Seq=${serverSndNxt}, Ack=${serverRcvNxt}`, "server");

    const onArrival = () => {
      clientState = STATES.TIME_WAIT;
      clientRcvNxt += 1;
      addLog("Client: Received Server's FIN. Transition to <b>TIME-WAIT</b> (starts 2*MSL timer).", "client");
      renderAll();
    };

    animatePacket("server", "client", "FIN", onArrival);
    renderAll();
  }

  function executeTeardownStep3() {
    // Client sends final ACK. Server will close when received.
    clientState = STATES.TIME_WAIT;
    
    activeSegment = {
      srcPort: 51234,
      dstPort: 80,
      seq: clientSndNxt,
      ack: clientRcvNxt,
      win: 1024,
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 0, FIN: 0 }
    };
    updateInspector(activeSegment);

    addLog("Client: Sending final ACK to confirm Server's teardown request.", "client");
    addLog(`TCP Header: ACK=1, Seq=${clientSndNxt}, Ack=${clientRcvNxt}`, "client");

    const onArrival = () => {
      serverState = STATES.CLOSED;
      addLog("Server: Final ACK received. Server socket closed completely (<b>CLOSED</b>).", "server");
      
      // Simulate client MSL wait expiry
      setTimeout(() => {
        clientState = STATES.CLOSED;
        addLog("Client: 2*MSL wait timer expired. Client socket closed completely (<b>CLOSED</b>). Teardown complete!", "success");
        renderAll();
      }, 1000);
      
      renderAll();
    };

    animatePacket("client", "server", "ACK", onArrival);
    renderAll();
  }

  function executeTeardownStep4() {
    addLog("TCP connection teardown successfully closed on both sides. Sockets are CLOSED.", "system");
    renderAll();
  }

  // --- Step Selection Router ---
  function executeTimelineForward() {
    if (activeScenario === "standard" || activeScenario === "lossy") {
      if (currentSimStep === 0) executeStep0();
      else if (currentSimStep === 1) executeStep1();
      else if (currentSimStep === 2) executeStep2();
      else if (currentSimStep === 3) executeStep3();
    } else if (activeScenario === "simultaneous") {
      if (currentSimStep === 0) executeSimOpenStep0();
      else if (currentSimStep === 1) executeSimOpenStep1();
      else if (currentSimStep === 2) executeStep3();
    } else if (activeScenario === "teardown") {
      if (currentSimStep === 0) executeTeardownStep0();
      else if (currentSimStep === 1) executeTeardownStep1();
      else if (currentSimStep === 2) executeTeardownStep2();
      else if (currentSimStep === 3) executeTeardownStep3();
      else if (currentSimStep === 4) executeTeardownStep4();
    }
  }

  // --- Stepper Playback controls ---
  function startSimulation() {
    if (playIntervalId !== null) return;
    
    btnTogglePlay.classList.add("btn-primary");
    document.getElementById("play-icon").classList.add("hidden");
    document.getElementById("pause-icon").classList.remove("hidden");
    btnTogglePlay.querySelector("span").textContent = "Pause Stepper";

    playIntervalId = setInterval(() => {
      const maxSteps = getScenarioMaxSteps();
      if (currentSimStep >= maxSteps) {
        stopSimulation();
        return;
      }
      currentSimStep++;
      executeTimelineForward();
    }, playSpeed + 200); // Add safety buffer for transition slide
  }

  function stopSimulation() {
    if (playIntervalId === null) return;
    clearInterval(playIntervalId);
    playIntervalId = null;

    document.getElementById("play-icon").classList.remove("hidden");
    document.getElementById("pause-icon").classList.add("hidden");
    btnTogglePlay.querySelector("span").textContent = "Run Stepper";
  }

  function toggleSimulation() {
    if (playIntervalId === null) {
      const maxSteps = getScenarioMaxSteps();
      if (currentSimStep >= maxSteps) {
        resetSimulation(true);
      }
      startSimulation();
    } else {
      stopSimulation();
    }
  }

  // --- Quiz Generator & Trainer ---
  btnStartQuiz.addEventListener("click", () => {
    quizStartView.classList.add("hidden");
    quizActiveView.classList.remove("hidden");
    quizScore = 0;
    quizTotal = 0;
    updateQuizScoreLabel();
    loadNextQuizQuestion();
  });

  btnQuitQuiz.addEventListener("click", () => {
    quizStartView.classList.remove("hidden");
    quizActiveView.classList.add("hidden");
  });

  btnNextQuiz.addEventListener("click", () => {
    loadNextQuizQuestion();
  });

  function updateQuizScoreLabel() {
    quizScoreVal.textContent = `${quizScore}/${quizTotal}`;
  }

  function loadNextQuizQuestion() {
    quizFeedbackBox.className = "quiz-feedback mt-16 hidden";
    btnNextQuiz.classList.add("hidden");

    currentQuizQuestion = generateRandomQuizQuestion();

    quizQuestionText.innerHTML = currentQuizQuestion.text;
    quizOptionsContainer.innerHTML = "";

    currentQuizQuestion.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn-quiz-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => handleQuizAnswerSelection(btn, opt));
      quizOptionsContainer.appendChild(btn);
    });
  }

  function handleQuizAnswerSelection(selectedBtn, answer) {
    const isCorrect = (answer === currentQuizQuestion.correct);
    
    // Disable all options buttons to lock answers
    const allBtns = quizOptionsContainer.querySelectorAll(".btn-quiz-option");
    allBtns.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === currentQuizQuestion.correct) {
        btn.classList.add("correct");
      }
    });

    // Apply color highlights
    if (isCorrect) {
      selectedBtn.classList.add("correct");
      quizFeedbackBox.className = "quiz-feedback mt-16 correct";
      quizFeedbackText.textContent = "Correct! Spot-on calculations.";
      quizScore++;
    } else {
      selectedBtn.classList.add("incorrect");
      quizFeedbackBox.className = "quiz-feedback mt-16 incorrect";
      quizFeedbackText.innerHTML = `Incorrect. Correct answer is <b>${currentQuizQuestion.correct}</b>.<br><span style="font-size:0.75rem;">${currentQuizQuestion.explanation}</span>`;
    }

    quizTotal++;
    updateQuizScoreLabel();
    btnNextQuiz.classList.remove("hidden");
  }

  function generateRandomQuizQuestion() {
    const questionTypes = ["syn-ack-ack", "syn-ack-seq", "ack-seq", "fin-ack", "states"];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    const cISN = Math.floor(Math.random() * 500) + 1000;
    const sISN = Math.floor(Math.random() * 500) + 5000;

    let text = "";
    let correct = "";
    let options = [];
    let explanation = "";

    switch (type) {
      case "syn-ack-ack":
        text = `During a TCP Handshake, Client sends a <b>SYN</b> with <b>Seq = ${cISN}</b>.<br>Server replies with its own SYN-ACK segment. What should the Server set as the <b>Acknowledgment Number (Ack)</b> in its header?`;
        correct = (cISN + 1).toString();
        options = [
          correct,
          cISN.toString(),
          (cISN + 2).toString(),
          (sISN + 1).toString()
        ];
        explanation = `The SYN flag consumes exactly 1 sequence number logically. Therefore, the Server acknowledges receipt by setting Ack = Seq + 1 (${cISN} + 1 = ${correct}).`;
        break;

      case "syn-ack-seq":
        text = `Client sends a <b>SYN (Seq = ${cISN})</b>. Server replies with <b>SYN-ACK (Seq = ${sISN}, Ack = ${cISN + 1})</b>.<br>What is the <b>Sequence Number (Seq)</b> of the Client's responding final <b>ACK</b> segment?`;
        correct = (cISN + 1).toString();
        options = [
          correct,
          cISN.toString(),
          (sISN + 1).toString(),
          (cISN + 2).toString()
        ];
        explanation = `The client's first SYN consumed sequence ${cISN}. The next byte sent (the final ACK) will have Seq = ISN + 1 (${cISN} + 1 = ${correct}).`;
        break;

      case "ack-seq":
        text = `Client sends a <b>SYN (Seq = ${cISN})</b>. Server replies with <b>SYN-ACK (Seq = ${sISN}, Ack = ${cISN + 1})</b>.<br>What is the <b>Acknowledgment Number (Ack)</b> of the Client's responding final <b>ACK</b> segment?`;
        correct = (sISN + 1).toString();
        options = [
          correct,
          sISN.toString(),
          (cISN + 1).toString(),
          (sISN + 2).toString()
        ];
        explanation = `The client must acknowledge receipt of the server's SYN-ACK. Since the server's SYN-ACK segment has Seq = ${sISN}, the client sets Ack = sISN + 1 (${sISN} + 1 = ${correct}).`;
        break;

      case "fin-ack":
        text = `During a connection teardown, Client sends a <b>FIN</b> segment with <b>Seq = ${cISN + 2}</b>.<br>What is the <b>Acknowledgment Number (Ack)</b> of the Server's immediate responding <b>ACK</b> segment?`;
        correct = (cISN + 3).toString();
        options = [
          correct,
          (cISN + 2).toString(),
          (cISN + 4).toString(),
          (sISN + 1).toString()
        ];
        explanation = `The FIN flag, like SYN, consumes exactly 1 sequence number. Thus, the Ack number must be Seq + 1 (${cISN + 2} + 1 = ${correct}).`;
        break;

      case "states":
        text = `If a Client socket in the <b>SYN-SENT</b> state receives a valid <b>SYN-ACK</b> segment, what state does it transition to next?`;
        correct = STATES.ESTABLISHED;
        options = [
          correct,
          STATES.SYN_RECEIVED,
          STATES.LISTEN,
          STATES.CLOSED
        ];
        explanation = `Receiving the SYN-ACK completes the client's half-connection and it transitions immediately to ESTABLISHED.`;
        break;
    }

    // Deduplicate choices
    options = [...new Set(options)];
    while (options.length < 4) {
      const filler = (Math.floor(Math.random() * 200) + 1000).toString();
      if (!options.includes(filler)) options.push(filler);
    }

    options.sort(() => Math.random() - 0.5);
    return { text, correct, options, explanation };
  }

  // --- Scenario Configuration Preset Handlers ---
  simulationPresetSelect.addEventListener("change", () => {
    activeScenario = simulationPresetSelect.value;
    
    // Configure checkbox overrides
    isPacketLossEnabled = (activeScenario === "lossy");
    togglePacketLoss.checked = isPacketLossEnabled;

    isSimultaneousOpenEnabled = (activeScenario === "simultaneous");
    toggleSimOpen.checked = isSimultaneousOpenEnabled;

    if (activeScenario === "teardown") {
      // Setup mock active connection to start from teardown
      clientState = STATES.ESTABLISHED;
      serverState = STATES.ESTABLISHED;
      clientSndNxt = clientISN + 1;
      clientRcvNxt = serverISN + 1;
      serverSndNxt = serverISN + 1;
      serverRcvNxt = clientISN + 1;
      addLog("Scenario: Loaded Active connection teardown (ESTABLISHED state). Ready for teardown.", "system");
    } else {
      // Re-initialize standard variables
      clientState = STATES.CLOSED;
      serverState = STATES.LISTEN;
      clientSndNxt = null;
      clientRcvNxt = null;
      serverSndNxt = null;
      serverRcvNxt = null;
    }

    resetSimulation(true);
  });

  // --- Checkbox and inputs binds ---
  togglePacketLoss.addEventListener("change", (e) => {
    isPacketLossEnabled = e.target.checked;
    if (isPacketLossEnabled && activeScenario !== "lossy") {
      simulationPresetSelect.value = "lossy";
      activeScenario = "lossy";
    }
  });

  toggleSimOpen.addEventListener("change", (e) => {
    isSimultaneousOpenEnabled = e.target.checked;
    if (isSimultaneousOpenEnabled && activeScenario !== "simultaneous") {
      simulationPresetSelect.value = "simultaneous";
      activeScenario = "simultaneous";
      resetSimulation();
    }
  });

  clientIsnInput.addEventListener("change", () => {
    resetSimulation();
  });

  serverIsnInput.addEventListener("change", () => {
    resetSimulation();
  });

  btnInitHandshake.addEventListener("click", () => {
    if (clientState !== STATES.CLOSED) {
      resetSimulation();
    }
    executeTimelineForward();
  });

  btnInitTeardown.addEventListener("click", () => {
    if (clientState === STATES.ESTABLISHED && serverState === STATES.ESTABLISHED) {
      simulationPresetSelect.value = "teardown";
      activeScenario = "teardown";
      currentSimStep = 0;
      executeTimelineForward();
    }
  });

  btnPrevStep.addEventListener("click", () => {
    stopSimulation();
    if (currentSimStep > 0) {
      currentSimStep--;
      // Simple reload to prev state
      addLog(`Step rollback: Returned to step ${currentSimStep}.`, "system");
      executeTimelineForward();
    }
  });

  btnNextStep.addEventListener("click", () => {
    stopSimulation();
    const maxSteps = getScenarioMaxSteps();
    if (currentSimStep < maxSteps) {
      currentSimStep++;
      executeTimelineForward();
    }
  });

  btnReset.addEventListener("click", () => {
    resetSimulation();
  });

  simSpeedSlider.addEventListener("input", (e) => {
    playSpeed = parseInt(e.target.value, 10);
    speedValueLabel.textContent = `Speed: ${(playSpeed / 1000).toFixed(1)}s`;
    
    if (playIntervalId !== null) {
      stopSimulation();
      startSimulation();
    }
  });

  btnTogglePlay.addEventListener("click", toggleSimulation);

  btnClearLogs.addEventListener("click", () => {
    logConsole.innerHTML = "";
    addLog("Trace logs cleared.", "system");
  });

  // --- Kickstart ---
  resetSimulation();
});
