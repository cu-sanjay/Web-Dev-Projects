/**
 * Virtual Memory Manager Simulator - Interactive Logic Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Simulation Parameters & Configuration ---
  const PAGE_SIZE = 32;       // bytes
  const NUM_PAGES = 8;        // VPN 0 - 7
  const NUM_FRAMES = 4;       // PFN 0 - 3
  const ADDRESS_SPACE = 256;  // 8-bit address space (0x00 - 0xFF)

  // --- Core State Variables ---
  let tlbEntriesCount = 4;
  let replacementPolicy = "lru"; // lru, fifo, clock, optimal
  let tlbReplacementPolicy = "lru"; // We keep it in sync with page policy for simplicity

  let tlb = [];            // Cache entries
  let pageTable = [];      // Mappings VPN -> PFN
  let ram = [];            // Physical RAM frames
  let disk = [];           // Swap space page contents

  let stats = {
    accesses: 0,
    tlbHits: 0,
    pageFaults: 0,
    diskAccesses: 0
  };

  let stream = [];         // Reference address stream
  let streamIndex = 0;     // Current position in the stream
  let history = [];        // Snapshots for backward stepping
  let logHistory = [];     // Console logs array
  
  let accessCounter = 0;   // Used for LRU tracking
  let loadCounter = 0;     // Used for FIFO tracking
  let ramClockPointer = 0; // Clock algorithm pointer for RAM
  let tlbClockPointer = 0; // Clock algorithm pointer for TLB

  // Auto-run Timer
  let playbackIntervalId = null;
  let playbackSpeed = 1500; // ms

  // Pre-coded Reference Presets
  const PRESETS = {
    "tlb-demo": [0x20, 0x24, 0x28, 0x40, 0x44, 0x20, 0x80, 0xA0, 0x40], // VPN: 1, 1, 1, 2, 2, 1, 4, 5, 2 (Temporal Locality)
    "page-fault-demo": [0x00, 0x20, 0x40, 0x60, 0x80, 0xA0, 0xC0, 0xE0], // VPN: 0, 1, 2, 3, 4, 5, 6, 7 (Sequential scanning, RAM thrashing)
    "writeback-demo": [0x00, 0x20, 0x40, 0x60, 0x80, 0x00, 0xA0], // Alternating accesses to show dirty evictions
    "lru-fifo-demo": [0x00, 0x20, 0x40, 0x60, 0x00, 0x80] // Highlights differences between LRU and FIFO
  };

  // Preset write modes (default to read unless specified)
  const PRESET_MODES = {
    "writeback-demo": ["write", "write", "write", "write", "read", "read", "read"]
  };

  // --- UI Elements ---
  const addressStreamPreset = document.getElementById("address-stream-preset");
  const addressInput = document.getElementById("address-input");
  const accessModeSelect = document.getElementById("access-mode");
  const btnRandomAddress = document.getElementById("btn-random-address");
  const btnSubmitTranslation = document.getElementById("btn-submit-translation");
  const streamInput = document.getElementById("stream-input");
  const btnLoadStream = document.getElementById("btn-load-stream");
  const streamIndexLabel = document.getElementById("stream-index-label");

  const btnPrevStep = document.getElementById("btn-prev-step");
  const btnTogglePlay = document.getElementById("btn-toggle-play");
  const btnNextStep = document.getElementById("btn-next-step");
  const btnReset = document.getElementById("btn-reset");
  const simSpeedSlider = document.getElementById("sim-speed");
  const speedValueLabel = document.getElementById("speed-value");

  const tlbEntriesSelect = document.getElementById("tlb-entries");
  const replacementPolicySelect = document.getElementById("replacement-policy");

  const statAccesses = document.getElementById("stat-accesses");
  const statTlbHits = document.getElementById("stat-tlb-hits");
  const statTlbRate = document.getElementById("stat-tlb-rate");
  const statFaults = document.getElementById("stat-faults");

  const logConsole = document.getElementById("log-console");
  const btnClearLogs = document.getElementById("btn-clear-logs");

  // Flowchart Elements
  const flowAddrBox = document.getElementById("flow-addr-box");
  const flowVpnVal = document.getElementById("flow-vpn-val");
  const flowOffsetVal = document.getElementById("flow-offset-val");
  const arrowToTlb = document.getElementById("arrow-to-tlb");
  const flowNodeTlb = document.getElementById("flow-node-tlb");
  const flowTlbBadge = document.getElementById("flow-tlb-badge");
  const flowTlbDesc = document.getElementById("flow-tlb-desc");
  const flowTlbBranches = document.getElementById("flow-tlb-branches");
  const branchHitArrow = document.getElementById("branch-hit-arrow");
  const branchMissArrow = document.getElementById("branch-miss-arrow");
  const flowNodeHit = document.getElementById("flow-node-hit");
  const flowHitDesc = document.getElementById("flow-hit-desc");
  const flowNodePt = document.getElementById("flow-node-pt");
  const flowPtDesc = document.getElementById("flow-pt-desc");
  const flowPtBadge = document.getElementById("flow-pt-badge");
  const arrowFromPt = document.getElementById("arrow-from-pt");
  const flowNodeRam = document.getElementById("flow-node-ram");
  const flowRamBadge = document.getElementById("flow-ram-badge");
  const flowRamDesc = document.getElementById("flow-ram-desc");
  const arrowToPhys = document.getElementById("arrow-to-phys");
  const flowPhysAddrBox = document.getElementById("flow-phys-addr-box");
  const physPfnDisplay = document.getElementById("phys-pfn-display");
  const physOffsetDisplay = document.getElementById("phys-offset-display");
  const physFullDisplay = document.getElementById("phys-full-display");

  const tlbTableBody = document.querySelector("#tlb-table tbody");
  const pageTableBody = document.querySelector("#page-table tbody");
  const ramContainer = document.getElementById("ram-container");
  const diskContainer = document.getElementById("disk-container");

  // --- Initialisation ---
  function initSimulator() {
    stopPlayback();
    tlbEntriesCount = parseInt(tlbEntriesSelect.value, 10);
    replacementPolicy = replacementPolicySelect.value;
    tlbReplacementPolicy = replacementPolicy; // Keep aligned for consistency

    // Initialize Empty TLB
    tlb = [];
    for (let i = 0; i < tlbEntriesCount; i++) {
      tlb.push({ index: i, vpn: null, pfn: null, valid: false, dirty: false, lastAccessTime: 0, insertTime: 0, refBit: 0 });
    }

    // Initialize Page Table (VPN 0 to 7)
    pageTable = [];
    for (let i = 0; i < NUM_PAGES; i++) {
      pageTable.push({ vpn: i, pfn: null, valid: false, dirty: false, refBit: 0, permission: "Read/Write" });
    }

    // Initialize Physical RAM Frames (0 to 3)
    ram = [];
    for (let i = 0; i < NUM_FRAMES; i++) {
      ram.push({ frameId: i, loadedVpn: null, dirty: false, refBit: 0, lastAccessTime: 0, insertTime: 0, content: "[ Empty Frame ]" });
    }

    // Initialize Swap Disk (Pages 0 to 7)
    disk = [];
    for (let i = 0; i < NUM_PAGES; i++) {
      disk.push({ vpn: i, dirty: false, content: `Page ${i} Data Block` });
    }

    // Reset counters and history
    stats = { accesses: 0, tlbHits: 0, pageFaults: 0, diskAccesses: 0 };
    history = [];
    logHistory = [];
    accessCounter = 0;
    loadCounter = 0;
    ramClockPointer = 0;
    tlbClockPointer = 0;

    logConsole.innerHTML = "";
    addLog("System initialized. Ready for address translation.", "system");

    // Load stream preset
    loadPresetStream();
    resetFlowChartVisuals();
    renderAll();
  }

  // --- Preset loading ---
  function loadPresetStream() {
    const key = addressStreamPreset.value;
    if (key === "custom") {
      // Leave stream-input as is or enable customization
      streamInput.removeAttribute("readonly");
      btnLoadStream.removeAttribute("disabled");
      return;
    }

    streamInput.setAttribute("readonly", "true");
    btnLoadStream.setAttribute("disabled", "true");

    const presetAddresses = PRESETS[key] || [];
    const hexStrings = presetAddresses.map(addr => "0x" + addr.toString(16).toUpperCase());
    streamInput.value = hexStrings.join(", ");
    parseAndLoadStream();
  }

  function parseAndLoadStream() {
    const raw = streamInput.value;
    const tokens = raw.split(/[\s,]+/);
    stream = [];
    streamIndex = 0;

    tokens.forEach(tok => {
      if (!tok.trim()) return;
      let val = parseAddressString(tok);
      if (val !== null) {
        stream.push(val);
      }
    });

    updateStreamLabel();
    updateTimelineButtons();
  }

  function parseAddressString(str) {
    str = str.trim().toLowerCase();
    if (str.startsWith("0x")) {
      return parseInt(str.substring(2), 16);
    } else if (str.startsWith("0b")) {
      return parseInt(str.substring(2), 2);
    } else if (/^[0-1]{8}$/.test(str)) {
      return parseInt(str, 2);
    } else {
      let val = parseInt(str, 10);
      return isNaN(val) ? null : val;
    }
  }

  function updateStreamLabel() {
    if (stream.length === 0) {
      streamIndexLabel.textContent = "No addresses loaded";
    } else {
      streamIndexLabel.textContent = `Index: ${streamIndex}/${stream.length}`;
    }
  }

  function updateTimelineButtons() {
    btnPrevStep.disabled = history.length === 0;
    btnNextStep.disabled = streamIndex >= stream.length && addressStreamPreset.value !== "custom";
  }

  // --- Address Translation Core Engine ---
  function translateAddress(virtualAddress, mode = "read") {
    // Save state snapshot for rollback before changes
    saveStateSnapshot();

    accessCounter++;
    stats.accesses++;
    
    // Clamp to 8-bit space
    virtualAddress = virtualAddress & 0xFF;
    
    // Decompose address: 3 bits VPN, 5 bits Offset
    const vpn = (virtualAddress >> 5) & 0x07;
    const offset = virtualAddress & 0x1F;

    addLog(`<b>Access:</b> ${mode.toUpperCase()} Address 0x${virtualAddress.toString(16).toUpperCase()} (VPN: ${vpn}, Offset: ${offset})`, "info");

    let pfn = null;
    let tlbHit = false;
    let pageFault = false;
    let evictedVpn = null;
    let writebackOccurred = false;

    // Reset flowchart details first
    resetFlowChartVisuals();

    // Fill address box
    document.querySelector("#flow-vpn-val .split-hex").textContent = `0x${vpn.toString(16).toUpperCase()}`;
    document.querySelector("#flow-vpn-val .split-bin").textContent = `VPN: ${vpn.toString(2).padStart(3, "0")}`;
    document.querySelector("#flow-offset-val .split-hex").textContent = `0x${offset.toString(16).toUpperCase()}`;
    document.querySelector("#flow-offset-val .split-bin").textContent = `Offset: ${offset.toString(2).padStart(5, "0")}`;
    flowAddrBox.classList.add("glow-active");
    arrowToTlb.classList.add("active");

    // 1. Search TLB Cache
    const tlbMatchIndex = tlb.findIndex(entry => entry.valid && entry.vpn === vpn);
    
    // Show TLB searching state
    flowNodeTlb.classList.remove("active-idle");
    flowNodeTlb.classList.add("active-searching");
    flowTlbBadge.textContent = "Searching";
    
    if (tlbMatchIndex !== -1) {
      // --- TLB Hit ---
      tlbHit = true;
      stats.tlbHits++;
      const matchedEntry = tlb[tlbMatchIndex];
      pfn = matchedEntry.pfn;
      
      // Update TLB entry status
      matchedEntry.lastAccessTime = accessCounter;
      matchedEntry.refBit = 1;
      
      // Synchronize back to Page Table and RAM Frame
      pageTable[vpn].refBit = 1;
      ram[pfn].refBit = 1;
      ram[pfn].lastAccessTime = accessCounter;

      if (mode === "write") {
        matchedEntry.dirty = true;
        pageTable[vpn].dirty = true;
        ram[pfn].dirty = true;
        disk[vpn].dirty = true; // Sync disk metadata
      }

      addLog(`TLB Hit! PFN ${pfn} fetched directly from TLB index ${tlbMatchIndex}.`, "success");

      // UI Flowchart updates
      flowTlbBadge.textContent = "HIT";
      flowTlbBadge.style.backgroundColor = "var(--color-ram)";
      flowTlbDesc.textContent = `Found mapping VPN ${vpn} -> PFN ${pfn} at index ${tlbMatchIndex}.`;
      flowTlbBranches.classList.remove("hidden");
      branchHitArrow.classList.remove("hidden");
      flowNodeHit.classList.remove("hidden");
      flowHitDesc.textContent = `Direct mapping matched: VPN ${vpn} maps to Frame ${pfn}.`;
      
      flowNodeRam.classList.remove("active-idle", "hidden");
      flowNodeRam.classList.add("active-access");
      flowRamBadge.textContent = mode.toUpperCase();
      flowRamDesc.textContent = `Accessing Physical Frame ${pfn} containing: "${ram[pfn].content}".`;

      arrowToPhys.classList.add("active");
      flowPhysAddrBox.classList.add("glow-active");
    } else {
      // --- TLB Miss ---
      addLog(`TLB Miss. Accessing process Page Table...`, "warning");
      
      flowTlbBadge.textContent = "MISS";
      flowTlbBadge.style.backgroundColor = "var(--color-danger)";
      flowTlbDesc.textContent = `VPN ${vpn} not cached in TLB. Fallback to Page Table lookup.`;
      flowTlbBranches.classList.remove("hidden");
      branchMissArrow.classList.remove("hidden");
      flowNodePt.classList.remove("hidden");
      flowNodePt.classList.add("active-searching");
      flowPtDesc.textContent = `Searching Page Table index VPN ${vpn}...`;

      // 2. Search Page Table
      if (pageTable[vpn].valid) {
        // --- Page Table Hit ---
        pfn = pageTable[vpn].pfn;
        pageTable[vpn].refBit = 1;
        ram[pfn].refBit = 1;
        ram[pfn].lastAccessTime = accessCounter;

        if (mode === "write") {
          pageTable[vpn].dirty = true;
          ram[pfn].dirty = true;
          disk[vpn].dirty = true;
        }

        addLog(`Page Table Hit. VPN ${vpn} is valid in RAM Frame ${pfn}.`, "success");
        flowPtDesc.textContent = `Page is Valid in RAM. VPN ${vpn} maps to Frame ${pfn}.`;

        // Update TLB entry
        insertIntoTlb(vpn, pfn, pageTable[vpn].dirty);
        
        flowNodeRam.classList.remove("active-idle", "hidden");
        flowNodeRam.classList.add("active-access");
        flowRamBadge.textContent = mode.toUpperCase();
        flowRamDesc.textContent = `Accessing Frame ${pfn} (Data: "${ram[pfn].content}").`;
        
        arrowToPhys.classList.add("active");
        flowPhysAddrBox.classList.add("glow-active");
      } else {
        // --- Page Table Miss (Page Fault) ---
        pageFault = true;
        stats.pageFaults++;
        addLog(`Page Fault! VPN ${vpn} is invalid (not loaded in RAM).`, "error");
        
        flowNodePt.classList.remove("active-searching");
        flowNodePt.classList.add("active-fault");
        flowPtBadge.classList.remove("hidden");
        flowPtDesc.textContent = `VPN ${vpn} is Invalid (Not in RAM). Page Fault triggered.`;

        // 3. Resolve Page Fault: RAM allocation/eviction
        let frameId = findFreeRamFrame();
        
        flowNodeRam.classList.remove("active-idle", "hidden");

        if (frameId !== -1) {
          // Loaded directly into empty frame
          addLog(`Empty RAM Frame ${frameId} found. Loading Page ${vpn} from Disk.`, "info");
          flowNodeRam.classList.add("active-access");
          flowRamBadge.textContent = "LOAD";
          flowRamDesc.textContent = `Allocated empty Frame ${frameId}. Fetching Page ${vpn} from swap space...`;
        } else {
          // RAM is full, select victim frame
          frameId = selectVictimRamFrame();
          evictedVpn = ram[frameId].loadedVpn;
          
          addLog(`RAM is full. Victim Frame ${frameId} containing Page ${evictedVpn} selected for eviction.`, "warning");
          
          // Check if victim is dirty
          if (ram[frameId].dirty || pageTable[evictedVpn].dirty) {
            writebackOccurred = true;
            stats.diskAccesses++; // disk write
            disk[evictedVpn].content = ram[frameId].content; // Write back
            disk[evictedVpn].dirty = false;
            addLog(`Victim Page ${evictedVpn} is Dirty. Writing modified data back to Swap Disk.`, "warning");
          } else {
            addLog(`Victim Page ${evictedVpn} is Clean. Swapping out without disk write-back.`, "system");
          }

          // Invalidate evicted page in page table and TLB
          pageTable[evictedVpn].valid = false;
          pageTable[evictedVpn].pfn = null;
          pageTable[evictedVpn].dirty = false;
          pageTable[evictedVpn].refBit = 0;

          invalidateTlbEntry(evictedVpn);

          flowNodeRam.classList.add("active-eviction");
          flowRamBadge.textContent = "EVICT";
          flowRamDesc.textContent = `Evicting Page ${evictedVpn} (dirty check) from Frame ${frameId} & loading Page ${vpn}.`;
        }

        // Load new page into frame
        stats.diskAccesses++; // disk read
        const pageContent = disk[vpn].content;
        
        ram[frameId] = {
          frameId: frameId,
          loadedVpn: vpn,
          dirty: (mode === "write"),
          refBit: 1,
          lastAccessTime: accessCounter,
          insertTime: accessCounter,
          content: pageContent
        };

        // Update Page Table
        pageTable[vpn].valid = true;
        pageTable[vpn].pfn = frameId;
        pageTable[vpn].dirty = (mode === "write");
        pageTable[vpn].refBit = 1;

        pfn = frameId;

        // Insert mapping into TLB
        insertIntoTlb(vpn, pfn, pageTable[vpn].dirty);

        addLog(`Page ${vpn} successfully loaded into RAM Frame ${pfn}. Address translation retried.`, "success");
        
        arrowToPhys.classList.add("active");
        flowPhysAddrBox.classList.add("glow-active");
      }
    }

    // Combine PFN and Offset for final Physical Address
    const physicalAddress = (pfn * PAGE_SIZE) + offset;
    addLog(`<b>Translation Complete:</b> Physical Address: <b>0x${physicalAddress.toString(16).toUpperCase()}</b> (Frame: ${pfn}, Byte Offset: ${offset})`, "success");

    // Display physical address details in flowchart
    physPfnDisplay.querySelector(".phys-num").textContent = pfn.toString();
    physOffsetDisplay.querySelector(".phys-num").textContent = `0x${offset.toString(16).toUpperCase()}`;
    physFullDisplay.querySelector(".phys-num").textContent = `0x${physicalAddress.toString(16).toUpperCase()}`;

    // Highlight row in active page table & TLB
    renderAll();
    highlightActiveTranslationRows(vpn, pfn);
  }

  // --- TLB Eviction / Insertion helper ---
  function insertIntoTlb(vpn, pfn, isDirty) {
    // Check if TLB already has empty entry
    const emptyIndex = tlb.findIndex(entry => !entry.valid);
    
    if (emptyIndex !== -1) {
      tlb[emptyIndex] = {
        index: emptyIndex,
        vpn: vpn,
        pfn: pfn,
        valid: true,
        dirty: isDirty,
        lastAccessTime: accessCounter,
        insertTime: accessCounter,
        refBit: 1
      };
      addLog(`Inserted mapping VPN ${vpn} &rarr; PFN ${pfn} in empty TLB entry ${emptyIndex}.`, "system");
    } else {
      // TLB is full, select victim entry to evict
      const victimIdx = selectVictimTlbEntry();
      const oldVpn = tlb[victimIdx].vpn;
      
      addLog(`TLB is full. Evicted VPN ${oldVpn} from TLB index ${victimIdx} (Cache Eviction).`, "warning");
      
      tlb[victimIdx] = {
        index: victimIdx,
        vpn: vpn,
        pfn: pfn,
        valid: true,
        dirty: isDirty,
        lastAccessTime: accessCounter,
        insertTime: accessCounter,
        refBit: 1
      };
      addLog(`Inserted mapping VPN ${vpn} &rarr; PFN ${pfn} at TLB index ${victimIdx}.`, "system");
    }
  }

  function invalidateTlbEntry(vpn) {
    const idx = tlb.findIndex(entry => entry.valid && entry.vpn === vpn);
    if (idx !== -1) {
      tlb[idx].valid = false;
      tlb[idx].vpn = null;
      tlb[idx].pfn = null;
      tlb[idx].dirty = false;
      addLog(`TLB entry index ${idx} invalidated because Page ${vpn} was evicted from RAM.`, "system");
    }
  }

  // --- Memory Search Helpers ---
  function findFreeRamFrame() {
    return ram.findIndex(frame => frame.loadedVpn === null);
  }

  // --- Replacement Algorithms Implementations ---

  // Select victim entry from TLB
  function selectVictimTlbEntry() {
    if (tlbReplacementPolicy === "fifo") {
      // Minimum insert time
      let minInsert = Infinity;
      let victimIdx = 0;
      tlb.forEach((entry, idx) => {
        if (entry.insertTime < minInsert) {
          minInsert = entry.insertTime;
          victimIdx = idx;
        }
      });
      return victimIdx;
    } else if (tlbReplacementPolicy === "clock") {
      // Clock algorithm on TLB
      let victimIdx = -1;
      let iterations = 0;
      while (victimIdx === -1 && iterations < tlbEntriesCount * 2) {
        let entry = tlb[tlbClockPointer];
        if (entry.refBit === 1) {
          entry.refBit = 0;
          tlbClockPointer = (tlbClockPointer + 1) % tlbEntriesCount;
        } else {
          victimIdx = tlbClockPointer;
          tlbClockPointer = (tlbClockPointer + 1) % tlbEntriesCount;
        }
        iterations++;
      }
      return victimIdx === -1 ? 0 : victimIdx;
    } else {
      // Default: LRU (Minimum access time)
      let minAccess = Infinity;
      let victimIdx = 0;
      tlb.forEach((entry, idx) => {
        if (entry.lastAccessTime < minAccess) {
          minAccess = entry.lastAccessTime;
          victimIdx = idx;
        }
      });
      return victimIdx;
    }
  }

  // Select victim frame from Physical RAM
  function selectVictimRamFrame() {
    if (replacementPolicy === "fifo") {
      // Evict page that was loaded earliest
      let minInsert = Infinity;
      let victimFrame = 0;
      ram.forEach((frame, idx) => {
        if (frame.insertTime < minInsert) {
          minInsert = frame.insertTime;
          victimFrame = idx;
        }
      });
      return victimFrame;
    } else if (replacementPolicy === "clock") {
      // Clock / Second chance scan
      let victimFrame = -1;
      while (victimFrame === -1) {
        let frame = ram[ramClockPointer];
        let pVpn = frame.loadedVpn;
        
        if (pageTable[pVpn].refBit === 1 || frame.refBit === 1) {
          // Clear reference flags and advance pointer
          pageTable[pVpn].refBit = 0;
          frame.refBit = 0;
          ramClockPointer = (ramClockPointer + 1) % NUM_FRAMES;
        } else {
          // Victim frame found!
          victimFrame = ramClockPointer;
          ramClockPointer = (ramClockPointer + 1) % NUM_FRAMES;
        }
      }
      return victimFrame;
    } else if (replacementPolicy === "optimal") {
      // Optimal (Future Oracle)
      let victimFrame = 0;
      let maxNextUseIndex = -1;

      ram.forEach((frame, idx) => {
        const frameVpn = frame.loadedVpn;
        let nextUseIndex = Infinity;

        // Search future stream for this VPN
        for (let s = streamIndex; s < stream.length; s++) {
          const nextAddr = stream[s];
          const nextVpn = (nextAddr >> 5) & 0x07;
          if (nextVpn === frameVpn) {
            nextUseIndex = s;
            break;
          }
        }

        if (nextUseIndex > maxNextUseIndex) {
          maxNextUseIndex = nextUseIndex;
          victimFrame = idx;
        }
      });

      return victimFrame;
    } else {
      // Default: LRU (Evict page that has not been accessed for longest time)
      let minAccess = Infinity;
      let victimFrame = 0;
      ram.forEach((frame, idx) => {
        if (frame.lastAccessTime < minAccess) {
          minAccess = frame.lastAccessTime;
          victimFrame = idx;
        }
      });
      return victimFrame;
    }
  }

  // --- Snapshot Save/Restore (Backward Stepping) ---
  function saveStateSnapshot() {
    // Keep history maximum length capped at 100 entries
    if (history.length > 100) {
      history.shift();
    }

    history.push({
      tlb: JSON.parse(JSON.stringify(tlb)),
      pageTable: JSON.parse(JSON.stringify(pageTable)),
      ram: JSON.parse(JSON.stringify(ram)),
      disk: JSON.parse(JSON.stringify(disk)),
      stats: { ...stats },
      streamIndex: streamIndex,
      logs: [...logHistory],
      accessCounter: accessCounter,
      loadCounter: loadCounter,
      ramClockPointer: ramClockPointer,
      tlbClockPointer: tlbClockPointer
    });
  }

  function stepBackward() {
    if (history.length === 0) return;
    
    stopPlayback();
    const snapshot = history.pop();

    tlb = snapshot.tlb;
    pageTable = snapshot.pageTable;
    ram = snapshot.ram;
    disk = snapshot.disk;
    stats = snapshot.stats;
    streamIndex = snapshot.streamIndex;
    logHistory = snapshot.logs;
    accessCounter = snapshot.accessCounter;
    loadCounter = snapshot.loadCounter;
    ramClockPointer = snapshot.ramClockPointer;
    tlbClockPointer = snapshot.tlbClockPointer;

    // Redraw console
    logConsole.innerHTML = "";
    logHistory.forEach(log => {
      const el = document.createElement("div");
      el.className = `log-entry ${log.type}`;
      el.innerHTML = `[Step ${log.step}] ${log.msg}`;
      logConsole.appendChild(el);
    });
    logConsole.scrollTop = logConsole.scrollHeight;

    resetFlowChartVisuals();
    renderAll();
    updateTimelineButtons();
    updateStreamLabel();
  }

  // --- UI Render Utilities ---
  function renderAll() {
    renderStats();
    renderTlbTable();
    renderPageTable();
    renderRamBlocks();
    renderDiskBlocks();
  }

  function renderStats() {
    statAccesses.textContent = stats.accesses.toString();
    statTlbHits.textContent = stats.tlbHits.toString();
    statFaults.textContent = stats.pageFaults.toString();
    
    const rate = stats.accesses > 0 ? ((stats.tlbHits / stats.accesses) * 100).toFixed(1) : "0.0";
    statTlbRate.textContent = `${rate}%`;
  }

  function renderTlbTable() {
    tlbTableBody.innerHTML = "";
    tlb.forEach(entry => {
      const tr = document.createElement("tr");
      tr.id = `tlb-row-${entry.index}`;

      const indexTd = document.createElement("td");
      indexTd.textContent = entry.index;
      tr.appendChild(indexTd);

      const vpnTd = document.createElement("td");
      vpnTd.textContent = entry.valid ? `Page ${entry.vpn}` : "--";
      tr.appendChild(vpnTd);

      const pfnTd = document.createElement("td");
      pfnTd.textContent = entry.valid ? `Frame ${entry.pfn}` : "--";
      tr.appendChild(pfnTd);

      const validTd = document.createElement("td");
      const vSpan = document.createElement("span");
      vSpan.className = entry.valid ? "cell-badge-valid" : "cell-badge-invalid";
      vSpan.textContent = entry.valid ? "V" : "I";
      validTd.appendChild(vSpan);
      tr.appendChild(validTd);

      const dirtyTd = document.createElement("td");
      if (entry.valid && entry.dirty) {
        const dSpan = document.createElement("span");
        dSpan.className = "cell-badge-dirty";
        dSpan.textContent = "D";
        dirtyTd.appendChild(dSpan);
      } else {
        dirtyTd.textContent = "-";
      }
      tr.appendChild(dirtyTd);

      const refTd = document.createElement("td");
      if (entry.valid) {
        if (tlbReplacementPolicy === "clock") {
          refTd.textContent = `Ref: ${entry.refBit}`;
        } else if (tlbReplacementPolicy === "fifo") {
          refTd.textContent = `Load: ${entry.insertTime}`;
        } else {
          refTd.textContent = `Age: ${entry.lastAccessTime}`;
        }
      } else {
        refTd.textContent = "--";
      }
      tr.appendChild(refTd);

      tlbTableBody.appendChild(tr);
    });
  }

  function renderPageTable() {
    pageTableBody.innerHTML = "";
    pageTable.forEach(entry => {
      const tr = document.createElement("tr");
      tr.id = `pt-row-${entry.vpn}`;

      const vpnTd = document.createElement("td");
      vpnTd.textContent = `Page ${entry.vpn}`;
      vpnTd.style.fontWeight = "bold";
      tr.appendChild(vpnTd);

      const pfnTd = document.createElement("td");
      pfnTd.textContent = entry.valid ? `Frame ${entry.pfn}` : "Disk (Swap)";
      tr.appendChild(pfnTd);

      const validTd = document.createElement("td");
      const vSpan = document.createElement("span");
      vSpan.className = entry.valid ? "cell-badge-valid" : "cell-badge-invalid";
      vSpan.textContent = entry.valid ? "Valid" : "Invalid";
      validTd.appendChild(vSpan);
      tr.appendChild(validTd);

      const dirtyTd = document.createElement("td");
      if (entry.dirty) {
        const dSpan = document.createElement("span");
        dSpan.className = "cell-badge-dirty";
        dSpan.textContent = "Dirty";
        dirtyTd.appendChild(dSpan);
      } else {
        dirtyTd.textContent = "Clean";
      }
      tr.appendChild(dirtyTd);

      const refTd = document.createElement("td");
      refTd.textContent = entry.refBit.toString();
      tr.appendChild(refTd);

      const permTd = document.createElement("td");
      permTd.textContent = entry.permission;
      tr.appendChild(permTd);

      pageTableBody.appendChild(tr);
    });
  }

  function renderRamBlocks() {
    ramContainer.innerHTML = "";
    ram.forEach(frame => {
      const div = document.createElement("div");
      div.className = "mem-visual-block";
      div.id = `ram-block-${frame.frameId}`;

      const left = document.createElement("div");
      left.className = "mem-block-left";
      
      const title = document.createElement("div");
      title.className = "mem-block-title";
      title.textContent = `Physical Frame ${frame.frameId}`;
      left.appendChild(title);

      const desc = document.createElement("div");
      desc.className = "mem-block-desc";
      if (frame.loadedVpn !== null) {
        desc.textContent = `Contains Page ${frame.loadedVpn} | Ref: ${frame.refBit} | ${frame.dirty ? "Dirty" : "Clean"}`;
      } else {
        desc.textContent = "Unallocated Frame Space";
      }
      left.appendChild(desc);
      div.appendChild(left);

      const right = document.createElement("div");
      right.className = "mem-block-right";

      const tag = document.createElement("span");
      if (frame.loadedVpn !== null) {
        tag.className = "mem-tag-loaded ram-tag";
        tag.textContent = `VPN ${frame.loadedVpn}`;
      } else {
        tag.className = "mem-tag-loaded empty-tag";
        tag.textContent = "Empty";
      }
      right.appendChild(tag);
      div.appendChild(right);

      ramContainer.appendChild(div);
    });
  }

  function renderDiskBlocks() {
    diskContainer.innerHTML = "";
    disk.forEach(page => {
      const div = document.createElement("div");
      div.className = "mem-visual-block";
      div.id = `disk-block-${page.vpn}`;

      const left = document.createElement("div");
      left.className = "mem-block-left";

      const title = document.createElement("div");
      title.className = "mem-block-title";
      title.textContent = `Swap Disk Page ${page.vpn}`;
      left.appendChild(title);

      const desc = document.createElement("div");
      desc.className = "mem-block-desc";
      
      // Is this page currently mapped in RAM?
      const isMapped = pageTable[page.vpn].valid;
      desc.textContent = isMapped ? "Mirrored in Active RAM" : "Primary storage copy";
      left.appendChild(desc);
      div.appendChild(left);

      const right = document.createElement("div");
      right.className = "mem-block-right";

      const tag = document.createElement("span");
      tag.className = "mem-tag-loaded disk-tag";
      tag.textContent = `Page ${page.vpn}`;
      right.appendChild(tag);
      div.appendChild(right);

      diskContainer.appendChild(div);
    });
  }

  // --- Visual highlight triggers ---
  function resetFlowChartVisuals() {
    flowAddrBox.classList.remove("glow-active");
    arrowToTlb.classList.remove("active");
    
    flowNodeTlb.className = "flow-node block-tlb active-idle";
    flowTlbBadge.textContent = "Idle";
    flowTlbBadge.style.backgroundColor = "";
    flowTlbDesc.textContent = "Awaiting memory translation trigger...";

    flowTlbBranches.classList.add("hidden");
    branchHitArrow.classList.add("hidden");
    branchMissArrow.classList.add("hidden");

    flowNodeHit.classList.add("hidden");
    
    flowNodePt.className = "flow-node block-pt hidden";
    flowPtBadge.classList.add("hidden");
    flowPtDesc.textContent = "VPN not in TLB. Accessing Page Table...";

    arrowFromPt.classList.add("hidden");
    
    flowNodeRam.className = "flow-node block-ram active-idle hidden";
    flowRamBadge.textContent = "Ready";
    flowRamDesc.textContent = "Awaiting physical frame allocation...";
    
    arrowToPhys.classList.remove("active");
    flowPhysAddrBox.classList.remove("glow-active");

    document.querySelectorAll("#flow-vpn-val span").forEach(el => el.textContent = "--");
    document.querySelectorAll("#flow-offset-val span").forEach(el => el.textContent = "--");
    document.querySelectorAll(".phys-result-display span.phys-num").forEach(el => el.textContent = "--");

    // Remove active highlight rows
    document.querySelectorAll("tr").forEach(tr => tr.classList.remove("row-active-translation"));
    document.querySelectorAll(".mem-visual-block").forEach(b => b.classList.remove("active-flash-ram", "active-flash-disk"));
  }

  function highlightActiveTranslationRows(vpn, pfn) {
    // Page table row
    const ptRow = document.getElementById(`pt-row-${vpn}`);
    if (ptRow) ptRow.classList.add("row-active-translation");

    // TLB row if found
    const tlbIdx = tlb.findIndex(entry => entry.valid && entry.vpn === vpn);
    if (tlbIdx !== -1) {
      const tlbRow = document.getElementById(`tlb-row-${tlbIdx}`);
      if (tlbRow) tlbRow.classList.add("row-active-translation");
    }

    // Physical memory card
    const ramBlock = document.getElementById(`ram-block-${pfn}`);
    if (ramBlock) {
      ramBlock.classList.add("active-flash-ram");
      setTimeout(() => ramBlock.classList.remove("active-flash-ram"), 1200);
    }
  }

  // --- Telemetry logs console ---
  function addLog(msg, type = "info") {
    const stepNumber = stats.accesses;
    logHistory.push({ step: stepNumber, msg: msg, type: type });
    
    const el = document.createElement("div");
    el.className = `log-entry ${type}`;
    el.innerHTML = `[Access ${stepNumber}] ${msg}`;
    logConsole.appendChild(el);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  // --- Playback Automator Functions ---
  function triggerNextStep() {
    if (stream.length === 0) return;

    if (streamIndex >= stream.length) {
      if (addressStreamPreset.value === "custom") {
        // Generate random one in custom mode
        const randomAddr = Math.floor(Math.random() * 256);
        const randomMode = Math.random() > 0.7 ? "write" : "read";
        translateAddress(randomAddr, randomMode);
      } else {
        // End of preset stream
        stopPlayback();
        addLog("End of address reference stream completed.", "system");
      }
      return;
    }

    // Determine read/write mode for this step
    let mode = "read";
    const presetKey = addressStreamPreset.value;
    if (PRESET_MODES[presetKey] && PRESET_MODES[presetKey][streamIndex]) {
      mode = PRESET_MODES[presetKey][streamIndex];
    } else {
      mode = accessModeSelect.value;
    }

    const addr = stream[streamIndex];
    translateAddress(addr, mode);
    
    streamIndex++;
    updateStreamLabel();
    updateTimelineButtons();
  }

  function startPlayback() {
    if (playbackIntervalId !== null) return;
    
    btnTogglePlay.classList.add("btn-primary");
    document.getElementById("play-icon").classList.add("hidden");
    document.getElementById("pause-icon").classList.remove("hidden");
    btnTogglePlay.querySelector("span").textContent = "Pause Stream";

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
    btnTogglePlay.querySelector("span").textContent = "Run Stream";
  }

  function togglePlayback() {
    if (playbackIntervalId === null) {
      if (streamIndex >= stream.length && addressStreamPreset.value !== "custom") {
        // Reset to index 0 if clicked run at the end of stream
        streamIndex = 0;
        updateStreamLabel();
      }
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  // --- Event Handlers & Listeners ---
  addressStreamPreset.addEventListener("change", () => {
    initSimulator();
  });

  btnRandomAddress.addEventListener("click", () => {
    const val = Math.floor(Math.random() * 256);
    addressInput.value = "0x" + val.toString(16).toUpperCase();
  });

  btnSubmitTranslation.addEventListener("click", () => {
    const rawVal = addressInput.value;
    const addr = parseAddressString(rawVal);
    if (addr === null || isNaN(addr) || addr < 0 || addr > 255) {
      alert("Please enter a valid 8-bit virtual address (0 - 255, 0x00 - 0xFF, or 8-bit binary).");
      return;
    }
    const mode = accessModeSelect.value;
    translateAddress(addr, mode);
    updateTimelineButtons();
  });

  btnLoadStream.addEventListener("click", () => {
    parseAndLoadStream();
    addLog(`Stream loaded with ${stream.length} memory references. Ready.`, "system");
  });

  btnPrevStep.addEventListener("click", () => {
    stepBackward();
  });

  btnNextStep.addEventListener("click", () => {
    stopPlayback();
    triggerNextStep();
  });

  btnReset.addEventListener("click", () => {
    initSimulator();
  });

  simSpeedSlider.addEventListener("input", (e) => {
    playbackSpeed = parseInt(e.target.value, 10);
    speedValueLabel.textContent = `Interval: ${(playbackSpeed / 1000).toFixed(1)}s`;
    
    if (playbackIntervalId !== null) {
      // Re-trigger playback timer with new speed
      stopPlayback();
      startPlayback();
    }
  });

  tlbEntriesSelect.addEventListener("change", () => {
    initSimulator();
  });

  replacementPolicySelect.addEventListener("change", () => {
    initSimulator();
  });

  btnClearLogs.addEventListener("click", () => {
    logConsole.innerHTML = "";
    addLog("Console log cleared.", "system");
  });

  // --- Kickstart ---
  initSimulator();
});
