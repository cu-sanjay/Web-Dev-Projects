// Paging & Segmentation Visualizer App Logic

// Simulator Mode
let activeMode = "paging"; // 'paging' or 'segmentation'

// Paging State Settings
let pageSize = 2048; // Bytes
let ramFramesCount = 8;
let tlbCapacity = 4;

// Paging Data structures
let pageTable = []; // index is Page #, value is { frame, valid }
let tlb = [];       // array of { page, frame, lastUsed }
let physicalFrames = []; // index is Frame #, value is loadedPage (number or null)
let tlbAccessCounter = 0;

// Paging Statistics
let statsPaging = {
  total: 0,
  tlbHits: 0,
  tlbMisses: 0,
  pageFaults: 0
};

// Segmentation Configuration
// Segments: Code (0), Data (1), Stack (2), Heap (3)
let segments = [
  { id: 0, name: "Code", base: 12, limit: 6, permissions: "Read-Execute" },
  { id: 1, name: "Data", base: 20, limit: 4, permissions: "Read-Write" },
  { id: 2, name: "Stack", base: 2, limit: 3, permissions: "Read-Write" },
  { id: 3, name: "Heap", base: 35, limit: 8, permissions: "Read-Write" }
];

// Segmentation Statistics
let statsSeg = {
  total: 0,
  safe: 0,
  faults: 0
};

// DOM Elements
const selectPageSize = document.getElementById('page-size');
const selectFrames = document.getElementById('ram-frames');
const selectTlbEntries = document.getElementById('tlb-entries');
const btnApplyPaging = document.getElementById('btn-apply-paging');
const btnApplySegmentation = document.getElementById('btn-apply-segmentation');

const togglePagingBtn = document.getElementById('toggle-paging');
const toggleSegBtn = document.getElementById('toggle-segmentation');
const cardConfigPaging = document.getElementById('card-config-paging');
const cardConfigSegmentation = document.getElementById('card-config-segmentation');

const inputPagingAddrWrapper = document.getElementById('input-paging-addr-wrapper');
const inputSegAddrWrapper = document.getElementById('input-seg-addr-wrapper');
const btnTranslate = document.getElementById('btn-translate');

const pagingBitVisual = document.getElementById('paging-bit-visual');
const segBoundsVisual = document.getElementById('seg-bounds-visual');

const pagingVirtualAddrInput = document.getElementById('paging-virtual-addr');
const pagingBinaryTxt = document.getElementById('paging-binary-txt');
const txtPageNum = document.getElementById('txt-page-num');
const txtPageBinary = document.getElementById('txt-page-binary');
const txtPageOffset = document.getElementById('txt-page-offset');
const txtPageOffsetBin = document.getElementById('txt-page-offset-bin');

const segNumberSelect = document.getElementById('seg-number-select');
const segOffsetInput = document.getElementById('seg-offset-input');
const txtSegOffsetCheck = document.getElementById('txt-seg-offset-check');
const txtSegLimitCheck = document.getElementById('txt-seg-limit-check');
const segCheckSign = document.getElementById('seg-check-sign');

const statsPagingGrid = document.getElementById('stats-paging-grid');
const statsSegGrid = document.getElementById('stats-seg-grid');
const statPagingTotal = document.getElementById('stat-paging-total');
const statTlbHits = document.getElementById('stat-tlb-hits');
const statTlbRate = document.getElementById('stat-tlb-rate');
const statPageFaults = document.getElementById('stat-page-faults');

const statSegTotal = document.getElementById('stat-seg-total');
const statSegSafe = document.getElementById('stat-seg-safe');
const statSegFaults = document.getElementById('stat-seg-faults');
const tlbProgressBar = document.getElementById('tlb-progress-bar');
const statusBadge = document.getElementById('status-badge');

const visualPagingWrapper = document.getElementById('visual-paging-wrapper');
const visualSegmentationWrapper = document.getElementById('visual-segmentation-wrapper');

const logConsole = document.getElementById('log-console');
const btnClearLogs = document.getElementById('btn-clear-logs');

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  reconfigurePaging();
  reconfigureSegmentation();
  logMessage("Visualizer loaded. Toggle Paging or Segmentation above.", "system");
});

function setupEventListeners() {
  btnApplyPaging.addEventListener('click', reconfigurePaging);
  btnApplySegmentation.addEventListener('click', reconfigureSegmentation);
  btnTranslate.addEventListener('click', handleTranslation);
  
  pagingVirtualAddrInput.addEventListener('input', (e) => {
    updatePagingBinaryPreview(parseInt(e.target.value) || 0);
  });

  btnClearLogs.addEventListener('click', () => {
    logConsole.innerHTML = "";
  });
}

// ----------------------------------------------------
// MODE SWITCHER
// ----------------------------------------------------
function switchMode(mode) {
  activeMode = mode;
  
  // Toggles active button headers
  togglePagingBtn.classList.toggle('active', mode === 'paging');
  toggleSegBtn.classList.toggle('active', mode === 'segmentation');
  
  // Toggles settings cards
  cardConfigPaging.classList.toggle('hidden', mode !== 'paging');
  cardConfigSegmentation.classList.toggle('hidden', mode !== 'segmentation');
  
  // Toggles address input sections
  inputPagingAddrWrapper.classList.toggle('hidden', mode !== 'paging');
  inputSegAddrWrapper.classList.toggle('hidden', mode !== 'segmentation');
  
  // Toggles bit Slice visualizations
  pagingBitVisual.classList.toggle('hidden', mode !== 'paging');
  segBoundsVisual.classList.toggle('hidden', mode !== 'segmentation');

  // Toggles metrics and dashboards panels
  statsPagingGrid.classList.toggle('hidden', mode !== 'paging');
  statsSegGrid.classList.toggle('hidden', mode !== 'segmentation');
  visualPagingWrapper.classList.toggle('hidden', mode !== 'paging');
  visualSegmentationWrapper.classList.toggle('hidden', mode !== 'segmentation');

  document.getElementById('stats-panel').className = "stats-panel-card card blue-gradient";
  statusBadge.className = "badge";
  statusBadge.textContent = "Safe";
  
  // Reset logs
  logConsole.innerHTML = "";
  logMessage(`Switched to ${mode.toUpperCase()} translation mode.`, "system");

  if (mode === 'paging') {
    updateStatsPaging();
    updatePagingBinaryPreview(parseInt(pagingVirtualAddrInput.value) || 0);
  } else {
    updateStatsSeg();
    updateSegmentationPreview();
  }
}

// ----------------------------------------------------
// PAGING ENGINE CONFIG & TRANSLATION
// ----------------------------------------------------

function reconfigurePaging() {
  pageSize = parseInt(selectPageSize.value);
  ramFramesCount = parseInt(selectFrames.value);
  tlbCapacity = parseInt(selectTlbEntries.value);

  // Initialize Page Table: support up to 16 pages
  pageTable = [];
  const presetFrames = [3, 5, 1, 7, -1, 2, -1, -1, 4, 6, -1, -1, 0, -1, -1, -1];
  
  for (let p = 0; p < 16; p++) {
    const isVal = presetFrames[p] !== -1 && presetFrames[p] < ramFramesCount;
    pageTable.push({
      frame: isVal ? presetFrames[p] : 0,
      valid: isVal
    });
  }

  // Initialize TLB Cache
  tlb = [];
  tlbAccessCounter = 0;

  // Initialize Physical RAM Frames
  physicalFrames = Array(ramFramesCount).fill(null);
  pageTable.forEach((entry, pageIdx) => {
    if (entry.valid) {
      physicalFrames[entry.frame] = pageIdx;
    }
  });

  // Reset counters
  statsPaging = { total: 0, tlbHits: 0, tlbMisses: 0, pageFaults: 0 };

  // Draw GUI Page Tables
  buildPageTableEditorHTML();
  renderPagingUI();
  updatePagingBinaryPreview(parseInt(pagingVirtualAddrInput.value) || 0);
  updateStatsPaging();
  logMessage(`Paging reconfigured. Page size: ${pageSize/1024}KB, RAM capacity: ${ramFramesCount} frames.`, "system");
}

function buildPageTableEditorHTML() {
  const tbody = document.querySelector('#editor-page-table tbody');
  tbody.innerHTML = "";

  for (let p = 0; p < 16; p++) {
    const tr = document.createElement('tr');
    const entry = pageTable[p];
    
    // Build options frame drop downs
    let frameOpts = "";
    for (let f = 0; f < ramFramesCount; f++) {
      frameOpts += `<option value="${f}" ${entry.frame === f ? 'selected' : ''}>Frame ${f}</option>`;
    }

    tr.innerHTML = `
      <td>Page ${p}</td>
      <td>
        <select class="custom-select-small" onchange="onEditorFrameChange(${p}, this.value)">
          ${frameOpts}
        </select>
      </td>
      <td>
        <input type="checkbox" ${entry.valid ? 'checked' : ''} onchange="onEditorValidChange(${p}, this.checked)">
      </td>
    `;
    tbody.appendChild(tr);
  }
}

// Editor changes frame links
function onEditorFrameChange(pageIdx, frameVal) {
  const f = parseInt(frameVal);
  pageTable[pageIdx].frame = f;
  
  // Update Physical frames mapping list
  syncPhysicalRAMFromPageTable();
  renderPagingUI();
}

function onEditorValidChange(pageIdx, isValid) {
  pageTable[pageIdx].valid = isValid;
  
  // Sync frame mapped
  syncPhysicalRAMFromPageTable();
  renderPagingUI();
}

function syncPhysicalRAMFromPageTable() {
  physicalFrames = Array(ramFramesCount).fill(null);
  pageTable.forEach((entry, pageIdx) => {
    if (entry.valid) {
      physicalFrames[entry.frame] = pageIdx;
    }
  });
}

function renderPagingUI() {
  // 1. Render TLB Cache
  const tlbBody = document.querySelector('#tlb-table tbody');
  tlbBody.innerHTML = "";
  
  for (let i = 0; i < tlbCapacity; i++) {
    const entry = tlb[i];
    const tr = document.createElement('tr');
    tr.setAttribute("id", `tlb-row-${i}`);
    
    if (entry) {
      tr.innerHTML = `
        <td>Slot ${i}</td>
        <td class="font-mono">Page ${entry.page}</td>
        <td class="font-mono text-cyan">Frame ${entry.frame}</td>
      `;
    } else {
      tr.innerHTML = `
        <td>Slot ${i}</td>
        <td class="text-muted">Empty</td>
        <td class="text-muted">--</td>
      `;
    }
    tlbBody.appendChild(tr);
  }

  // 2. Render Logical pages list
  const logicalList = document.getElementById('logical-pages-list');
  logicalList.innerHTML = "";
  for (let p = 0; p < 16; p++) {
    const item = document.createElement('div');
    item.setAttribute("id", `log-page-${p}`);
    item.className = "item-block";
    item.innerHTML = `
      <span class="item-block-title">Page ${p}</span>
      <span class="item-block-value">${pageSize/1024} KB</span>
    `;
    logicalList.appendChild(item);
  }

  // 3. Render Page Table
  const pageTableList = document.getElementById('page-table-list');
  pageTableList.innerHTML = "";
  pageTable.forEach((entry, pageIdx) => {
    const item = document.createElement('div');
    item.setAttribute("id", `page-table-row-${pageIdx}`);
    item.className = "item-block";
    
    let frameLabel = entry.valid ? `Frame ${entry.frame}` : "--";
    let statusLabel = entry.valid ? `<span class="text-success" style="font-weight:bold;">V</span>` : `<span class="text-danger">I</span>`;
    
    item.innerHTML = `
      <span class="item-block-title">Page ${pageIdx} &rarr; ${frameLabel}</span>
      <span class="item-block-value">${statusLabel}</span>
    `;
    pageTableList.appendChild(item);
  });

  // 4. Render Physical RAM Frames
  const physicalList = document.getElementById('physical-frames-list');
  physicalList.innerHTML = "";
  for (let f = 0; f < ramFramesCount; f++) {
    const item = document.createElement('div');
    item.setAttribute("id", `phys-frame-${f}`);
    item.className = "item-block";
    
    const loadedPage = physicalFrames[f];
    const loadedLabel = loadedPage !== null ? `Page ${loadedPage}` : "Empty";
    
    item.innerHTML = `
      <span class="item-block-title text-cyan">Frame ${f}</span>
      <span class="item-block-value">${loadedLabel}</span>
    `;
    physicalList.appendChild(item);
  }
}

function updatePagingBinaryPreview(val) {
  // Assume a 16-bit virtual address for preview
  const binaryStr = val.toString(2).padStart(14, '0');
  
  // Format offset offset bits length
  const offsetBitsCount = Math.log2(pageSize);
  
  const pPart = binaryStr.slice(0, binaryStr.length - offsetBitsCount);
  const dPart = binaryStr.slice(-offsetBitsCount);
  
  pagingBinaryTxt.innerHTML = `<span class="text-cyan">${pPart}</span><span class="text-muted">${dPart}</span>`;

  // Update slices displays
  const pageNum = Math.floor(val / pageSize);
  const pageOffset = val % pageSize;

  txtPageNum.textContent = pageNum;
  txtPageBinary.textContent = pageNum.toString(2).padStart(4, '0');
  txtPageOffset.textContent = `${pageOffset} B`;
  txtPageOffsetBin.textContent = pageOffset.toString(2).padStart(offsetBitsCount, '0');
}

// ----------------------------------------------------
// SEGMENTATION ENGINE CONFIG & TRANSLATION
// ----------------------------------------------------

function reconfigureSegmentation() {
  // Read values from form rows
  for (let i = 0; i < 4; i++) {
    segments[i].base = parseInt(document.getElementById(`seg-base-${i}`).value) || 0;
    segments[i].limit = parseInt(document.getElementById(`seg-limit-${i}`).value) || 1;
  }

  // Reset counters
  statsSeg = { total: 0, safe: 0, faults: 0 };

  renderSegmentationUI();
  updateSegmentationPreview();
  updateStatsSeg();
  
  logMessage("Segmentation base addresses and limits reconfigured.", "system");
}

function renderSegmentationUI() {
  // 1. Render Segment Table
  const tbody = document.querySelector('#segment-table tbody');
  tbody.innerHTML = "";
  
  segments.forEach(seg => {
    const tr = document.createElement('tr');
    tr.setAttribute("id", `segment-row-${seg.id}`);
    tr.innerHTML = `
      <td class="font-mono">Segment ${seg.id}</td>
      <td style="font-weight:600;">${seg.name}</td>
      <td class="font-mono text-cyan">${seg.base} KB</td>
      <td class="font-mono">${seg.limit} KB</td>
      <td class="text-muted">${seg.permissions}</td>
    `;
    tbody.appendChild(tr);
  });

  // 2. Render linear RAM map (64 KB)
  const mapContainer = document.getElementById('segment-physical-bar');
  mapContainer.innerHTML = "";

  // Sort segments by base address to map segments visually
  const sortedSegs = [...segments].sort((a,b) => a.base - b.base);
  
  let currentAddr = 0;
  sortedSegs.forEach(seg => {
    // Check if there is free space before this segment
    if (seg.base > currentAddr) {
      const gap = seg.base - currentAddr;
      createFreeSpaceBlock(mapContainer, currentAddr, gap);
    }
    
    // Create segment block
    const block = document.createElement('div');
    block.setAttribute("id", `physical-seg-block-${seg.id}`);
    block.className = `physical-segment-block segment-${seg.id}`;
    
    const pctWidth = (seg.limit / 64) * 100;
    block.style.width = `${pctWidth}%`;
    block.innerHTML = `
      <span>${seg.name}</span>
      <span class="seg-addr-tag start">${seg.base}K</span>
      <span class="seg-addr-tag end">${seg.base + seg.limit}K</span>
    `;
    
    mapContainer.appendChild(block);
    currentAddr = seg.base + seg.limit;
  });

  // Check if there is leftover space at the end (64 KB limit)
  if (currentAddr < 64) {
    createFreeSpaceBlock(mapContainer, currentAddr, 64 - currentAddr);
  }
}

function createFreeSpaceBlock(container, start, size) {
  const block = document.createElement('div');
  block.className = "physical-segment-block free-space";
  const pctWidth = (size / 64) * 100;
  block.style.width = `${pctWidth}%`;
  block.innerHTML = `
    <span class="text-muted" style="font-size:0.65rem;">Free</span>
    <span class="seg-addr-tag start">${start}K</span>
    <span class="seg-addr-tag end">${start + size}K</span>
  `;
  container.appendChild(block);
}

function updateSegmentationPreview() {
  const offset = parseInt(segOffsetInput.value) || 0;
  const segId = parseInt(segNumberSelect.value);
  const seg = segments[segId];

  txtSegOffsetCheck.textContent = `${offset} KB`;
  txtSegLimitCheck.textContent = `${seg.limit} KB`;
  
  if (offset < seg.limit) {
    segCheckSign.textContent = "<";
    segCheckSign.style.color = "var(--success-accent)";
  } else {
    segCheckSign.textContent = "≥";
    segCheckSign.style.color = "var(--danger-accent)";
  }
}

// ----------------------------------------------------
// ADDRESS TRANSLATOR ANIMATOR PIPELINES
// ----------------------------------------------------

function handleTranslation() {
  // Reset any flashing highlights
  clearHighlights();

  if (activeMode === 'paging') {
    const val = parseInt(pagingVirtualAddrInput.value) || 0;
    runPagingTranslation(val);
  } else {
    const segId = parseInt(segNumberSelect.value);
    const offset = parseInt(segOffsetInput.value) || 0;
    runSegmentationTranslation(segId, offset);
  }
}

async function runPagingTranslation(virtualAddr) {
  const page = Math.floor(virtualAddr / pageSize);
  const offset = virtualAddr % pageSize;
  const pageHex = `Page ${page}`;

  statsPaging.total++;
  logMessage(`[START] CPU requested virtual memory address: ${virtualAddr} (Decimal)`, "info");
  logMessage(`Address Decoded: Page Number p = ${page}, Offset d = ${offset} Bytes`, "info");

  // Step 1: Check TLB lookup cache
  logMessage("[Step 1] Querying Translation Lookaside Buffer (TLB)...", "info");
  
  // Animate TLB search visual
  const tlbCard = document.querySelector('.tlb-card');
  if (tlbCard) tlbCard.style.outline = "2px solid var(--warning-accent)";
  await delay(400);
  if (tlbCard) tlbCard.style.outline = "";

  let tlbHitIndex = -1;
  for (let i = 0; i < tlb.length; i++) {
    if (tlb[i].page === page) {
      tlbHitIndex = i;
      break;
    }
  }

  if (tlbHitIndex !== -1) {
    // TLB HIT
    statsPaging.tlbHits++;
    
    // Update LRU counter timestamp
    tlbAccessCounter++;
    tlb[tlbHitIndex].lastUsed = tlbAccessCounter;

    const frame = tlb[tlbHitIndex].frame;
    const physicalAddr = frame * pageSize + offset;

    // Highlights TLB hit row
    const hitRow = document.getElementById(`tlb-row-${tlbHitIndex}`);
    if (hitRow) hitRow.classList.add('tlb-hit-highlight');

    // Highlights target page block, table rows and RAM blocks
    highlightPagingBlocks(page, frame);

    logMessage(`[TLB HIT] Page ${page} found in TLB! Maps immediately to Frame ${frame}.`, "success");
    logMessage(`Physical Address = Frame ${frame} * Page Size ${pageSize} + Offset ${offset} = ${physicalAddr}`, "success");
    
    // Success dashboard trigger
    flashPanelState('success');
  } 
  
  else {
    // TLB MISS
    statsPaging.tlbMisses++;
    logMessage("[TLB MISS] Page mapping not found in TLB cache. Querying Page Table...", "warning");
    
    // Flash TLB rows red/orange to show miss
    for (let i = 0; i < tlbCapacity; i++) {
      const row = document.getElementById(`tlb-row-${i}`);
      if (row) row.classList.add('tlb-miss-highlight');
    }
    
    await delay(300);
    for (let i = 0; i < tlbCapacity; i++) {
      const row = document.getElementById(`tlb-row-${i}`);
      if (row) row.classList.remove('tlb-miss-highlight');
    }

    // Step 2: Query Page Table
    const tableRow = document.getElementById(`page-table-row-${page}`);
    if (tableRow) tableRow.classList.add('searching-active');
    await delay(400);

    const ptEntry = pageTable[page];
    if (ptEntry && ptEntry.valid) {
      // Valid Entry in Page Table
      const frame = ptEntry.frame;
      const physicalAddr = frame * pageSize + offset;

      if (tableRow) {
        tableRow.classList.remove('searching-active');
        tableRow.classList.add('hit-active');
      }

      // Add entry back to TLB cache
      updateTLBCache(page, frame);

      highlightPagingBlocks(page, frame);

      logMessage(`[PAGE TABLE HIT] Page Table matched: Page ${page} maps to Frame ${frame}.`, "success");
      logMessage(`TLB updated with new Page ${page} mapping.`, "info");
      logMessage(`Physical Address = Frame ${frame} * Page Size ${pageSize} + Offset ${offset} = ${physicalAddr}`, "success");
      
      flashPanelState('success');
    } 
    
    else {
      // Invalid Entry: Page Fault
      statsPaging.pageFaults++;
      
      if (tableRow) {
        tableRow.classList.remove('searching-active');
        tableRow.classList.add('miss-active');
      }

      logMessage(`[PAGE FAULT] Trap alert: Page ${page} valid bit is 0 (Page not loaded in RAM).`, "error");
      logMessage("Interrupting CPU: loading Page from virtual swap disk to RAM...", "warning");
      
      flashPanelState('danger');
      await delay(600);

      // Handle Page Fault (allocate free frame or evict one)
      const allocatedFrame = resolvePageFault(page);
      const physicalAddr = allocatedFrame * pageSize + offset;

      // Reset block styles to show loaded state
      if (tableRow) {
        tableRow.classList.remove('miss-active');
        tableRow.classList.add('hit-active');
      }

      // Insert to TLB
      updateTLBCache(page, allocatedFrame);

      highlightPagingBlocks(page, allocatedFrame);

      logMessage(`[PAGE LOADED] Page ${page} loaded to physical Frame ${allocatedFrame}. Valid bit set to 1.`, "success");
      logMessage(`Physical Address = Frame ${allocatedFrame} * Page Size ${pageSize} + Offset ${offset} = ${physicalAddr}`, "success");
      
      flashPanelState('success');
    }
  }

  // Reload tables to display dynamic LRU states and allocations
  renderPagingUI();
  updateStatsPaging();
}

function updateTLBCache(page, frame) {
  tlbAccessCounter++;
  
  if (tlb.length < tlbCapacity) {
    // Fit into empty slot
    tlb.push({ page, frame, lastUsed: tlbAccessCounter });
  } else {
    // Evict target using LRU strategy (evicts entry with min lastUsed timestamp)
    let minIdx = 0;
    let minTimestamp = tlb[0].lastUsed;
    for (let i = 1; i < tlb.length; i++) {
      if (tlb[i].lastUsed < minTimestamp) {
        minTimestamp = tlb[i].lastUsed;
        minIdx = i;
      }
    }
    
    const evicted = tlb[minIdx];
    logMessage(`[TLB EVICT] TLB Cache is full. Evicting Page ${evicted.page} mapping (Least Recently Used).`, "warning");
    tlb[minIdx] = { page, frame, lastUsed: tlbAccessCounter };
  }
}

// Allocates free frame or triggers evictions
function resolvePageFault(pageIdx) {
  // Check if there is an empty frame in RAM
  let freeFrameIdx = -1;
  for (let f = 0; f < ramFramesCount; f++) {
    if (physicalFrames[f] === null) {
      freeFrameIdx = f;
      break;
    }
  }

  if (freeFrameIdx !== -1) {
    // Load directly
    pageTable[pageIdx].frame = freeFrameIdx;
    pageTable[pageIdx].valid = true;
    physicalFrames[freeFrameIdx] = pageIdx;
    return freeFrameIdx;
  } else {
    // RAM is full, must evict a random frame mapping
    const victimFrame = Math.floor(Math.random() * ramFramesCount);
    const victimPage = physicalFrames[victimFrame];

    // Evict old mapping
    pageTable[victimPage].valid = false;
    logMessage(`[RAM EVICTION] RAM capacity reached. Evicting Page ${victimPage} from Frame ${victimFrame} to allocate Page ${pageIdx}.`, "error");

    // Load new mapping
    pageTable[pageIdx].frame = victimFrame;
    pageTable[pageIdx].valid = true;
    physicalFrames[victimFrame] = pageIdx;
    return victimFrame;
  }
}

function highlightPagingBlocks(page, frame) {
  const logBlock = document.getElementById(`log-page-${page}`);
  const ptBlock = document.getElementById(`page-table-row-${page}`);
  const physBlock = document.getElementById(`phys-frame-${frame}`);

  if (logBlock) logBlock.classList.add('hit-active');
  if (ptBlock) ptBlock.classList.add('hit-active');
  if (physBlock) physBlock.classList.add('hit-active');
}

// ----------------------------------------------------
// SEGMENTATION TRANSLATION PIPELINE
// ----------------------------------------------------

async function runSegmentationTranslation(segId, offset) {
  const seg = segments[segId];
  statsSeg.total++;

  logMessage(`[START] CPU requested virtual memory address: Segment ${segId} (${seg.name}), Offset = ${offset} KB`, "info");
  
  // Bounds check animation
  const visualBox = document.getElementById('seg-bounds-visual');
  const checkOffsetBox = document.getElementById('seg-check-box-1');
  const checkLimitBox = document.getElementById('seg-check-box-2');
  
  // Preview target limit
  txtSegOffsetCheck.textContent = `${offset} KB`;
  txtSegLimitCheck.textContent = `${seg.limit} KB`;

  // Flash compare step
  if (checkOffsetBox) checkOffsetBox.classList.add('searching-active');
  if (checkLimitBox) checkLimitBox.classList.add('searching-active');
  await delay(400);
  if (checkOffsetBox) checkOffsetBox.classList.remove('searching-active');
  if (checkLimitBox) checkLimitBox.classList.remove('searching-active');

  // Compare offsets
  if (offset < seg.limit) {
    // ACCESS SAFE
    statsSeg.safe++;
    
    // Highlight segment row in table
    const tableRow = document.getElementById(`segment-row-${segId}`);
    if (tableRow) tableRow.classList.add('tlb-hit-highlight');

    // Highlight physical segment block
    const physBlock = document.getElementById(`physical-seg-block-${segId}`);
    if (physBlock) physBlock.classList.add('highlight-lookup');

    const physicalAddr = seg.base + offset;

    logMessage(`[ACCESS SAFE] Bounds check: Offset ${offset} KB &lt; Limit size ${seg.limit} KB. Access verified.`, "success");
    logMessage(`Physical Address = Base ${seg.base} KB + Offset ${offset} KB = ${physicalAddr} KB.`, "success");
    
    flashPanelState('success');
  } 
  
  else {
    // SEGMENTATION FAULT
    statsSeg.faults++;
    
    // Add pulsing red outline to bounds check visualizer box
    if (visualBox) visualBox.classList.add('bounds-fault');
    
    const physBlock = document.getElementById(`physical-seg-block-${segId}`);
    if (physBlock) physBlock.classList.add('fault-lookup');

    logMessage(`[SEG FAULT TRAP] Bounds Violation: Offset ${offset} KB &ge; Limit size ${seg.limit} KB.`, "error");
    logMessage(`[FATAL] Access Violation trap: CPU aborted instruction. Segmentation Fault raised!`, "error");

    flashPanelState('danger');
  }

  updateStatsSeg();
}

// ----------------------------------------------------
// UI UTILITIES & COUNTERS
// ----------------------------------------------------

function clearHighlights() {
  // Paging rows
  const ptRows = document.querySelectorAll('#page-table-list .item-block');
  ptRows.forEach(r => r.className = "item-block");
  
  const logRows = document.querySelectorAll('#logical-pages-list .item-block');
  logRows.forEach(r => r.className = "item-block");

  const physRows = document.querySelectorAll('#physical-frames-list .item-block');
  physRows.forEach(r => r.className = "item-block");

  const tlbRows = document.querySelectorAll('#tlb-table tr');
  tlbRows.forEach(r => r.classList.remove('tlb-hit-highlight', 'tlb-hit-row'));

  // Segmentation
  const segRows = document.querySelectorAll('#segment-table tr');
  segRows.forEach(r => r.classList.remove('tlb-hit-highlight'));

  const segBlocks = document.querySelectorAll('.physical-segment-block');
  segBlocks.forEach(b => b.classList.remove('highlight-lookup', 'fault-lookup'));

  const boundsBox = document.getElementById('seg-bounds-visual');
  if (boundsBox) boundsBox.classList.remove('bounds-fault');
}

function flashPanelState(state) {
  const panel = document.getElementById('stats-panel');
  panel.className = "stats-panel-card card";
  statusBadge.className = "badge";

  if (state === 'success') {
    panel.classList.add('blue-gradient');
    statusBadge.classList.add('success-badge');
    statusBadge.textContent = "Safe";
  } else if (state === 'danger') {
    panel.classList.add('danger-gradient');
    statusBadge.classList.add('trap-fault');
    statusBadge.textContent = "TRAP FAULT";
  }
}

function updateStatsPaging() {
  statPagingTotal.textContent = statsPaging.total;
  statTlbHits.textContent = statsPaging.tlbHits;
  statPageFaults.textContent = statsPaging.pageFaults;
  
  if (statsPaging.total > 0) {
    const rate = (statsPaging.tlbHits / statsPaging.total) * 100;
    statTlbRate.textContent = `${rate.toFixed(0)}%`;
    tlbProgressBar.style.width = `${rate}%`;
  } else {
    statTlbRate.textContent = "0%";
    tlbProgressBar.style.width = "0%";
  }
}

function updateStatsSeg() {
  statSegTotal.textContent = statsSeg.total;
  statSegSafe.textContent = statsSeg.safe;
  statSegFaults.textContent = statsSeg.faults;

  if (statsSeg.total > 0) {
    const rate = (statsSeg.safe / statsSeg.total) * 100;
    tlbProgressBar.style.width = `${rate}%`;
  } else {
    tlbProgressBar.style.width = "0%";
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ----------------------------------------------------
// TELEMETRY LOGGER
// ----------------------------------------------------
function logMessage(text, type = "system") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  
  const time = new Date();
  const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
  
  entry.innerHTML = `<span style="color:#4b5563; font-size: 0.725rem;">[${timeString}]</span> ${text}`;
  logConsole.appendChild(entry);
  
  logConsole.scrollTop = logConsole.scrollHeight;
}
