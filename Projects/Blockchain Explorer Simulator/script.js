/**
 * Compact, synchronous SHA-256 implementation in JavaScript.
 * Suitable for running in tight mining loops.
 */
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  var mathPow = Math.pow;
  var maxWord = 0xffffffff;
  var result = '';
  
  var words = [];
  var asciiLength = ascii.length * 8;
  
  var i, j; // Loop counters
  var hash = sha256.h = sha256.h || [];
  var k = sha256.k = sha256.k || [];
  var primeCounter = k.length;

  var isFilled = {};
  for (var factor = 2; primeCounter < 64; factor++) {
    if (!isFilled[factor]) {
      for (i = 0; i < 313; i += factor) {
        isFilled[i] = 1;
      }
      hash[primeCounter] = (mathPow(factor, .5) * 0x100000000) | 0;
      k[primeCounter++] = (mathPow(factor, 1/3) * 0x100000000) | 0;
    }
  }
  
  ascii += '\x80'; // Append 1 '1' bit and 56 '0' bits
  while (ascii.length % 64 - 56) ascii += '\x00'; // Buffer length must be congruent to 448 mod 512
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ""; // Only support ASCII
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words[words.length] = ((asciiLength / 0x100000000) | 0);
  words[words.length] = (asciiLength | 0);
  
  // Clone baseline hash
  var currentHash = hash.slice(0);
  
  // Process each 512-bit chunk
  for (j = 0; j < words.length;) {
    var w = words.slice(j, j += 16); 
    var oldHash = currentHash.slice(0);
    
    for (i = 0; i < 64; i++) {
      var wItem = w[i];
      if (i >= 16) {
        var s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        wItem = w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      
      var ch = (currentHash[4] & currentHash[5]) ^ (~currentHash[4] & currentHash[6]);
      var maj = (currentHash[0] & currentHash[1]) ^ (currentHash[0] & currentHash[2]) ^ (currentHash[1] & currentHash[2]);
      var sigma0 = rightRotate(currentHash[0], 2) ^ rightRotate(currentHash[0], 13) ^ rightRotate(currentHash[0], 22);
      var sigma1 = rightRotate(currentHash[4], 6) ^ rightRotate(currentHash[4], 11) ^ rightRotate(currentHash[4], 25);
      
      var temp1 = (currentHash[7] + sigma1 + ch + k[i] + wItem) | 0;
      var temp2 = (sigma0 + maj) | 0;
      
      currentHash = [
        (temp1 + temp2) | 0,
        currentHash[0],
        currentHash[1],
        currentHash[2],
        (currentHash[3] + temp1) | 0,
        currentHash[4],
        currentHash[5],
        currentHash[6]
      ];
    }
    
    for (i = 0; i < 8; i++) {
      currentHash[i] = (currentHash[i] + oldHash[i]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    var val = currentHash[i];
    if (val < 0) val += 0x100000000;
    var strVal = val.toString(16);
    while (strVal.length < 8) strVal = '0' + strVal;
    result += strVal;
  }
  return result;
}

/**
 * Transaction class representation
 */
class Transaction {
  constructor(sender, recipient, amount, timestamp = null, txHash = null) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = parseFloat(amount);
    this.timestamp = timestamp || Date.now();
    this.hash = txHash || this.calculateHash();
  }

  calculateHash() {
    return sha256(this.sender + this.recipient + this.amount + this.timestamp);
  }
}

/**
 * Block representation in the Blockchain
 */
class Block {
  constructor(index, transactions, previousHash = '', timestamp = null, nonce = 0, hash = '', difficulty = 2) {
    this.index = index;
    this.timestamp = timestamp || Date.now();
    this.transactions = transactions.map(t => new Transaction(t.sender, t.recipient, t.amount, t.timestamp, t.hash));
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.hash = hash || this.calculateHash();
  }

  calculateHash() {
    // Generate serialization of transactions data
    const txDataStr = JSON.stringify(this.transactions.map(tx => ({
      sender: tx.sender,
      recipient: tx.recipient,
      amount: tx.amount,
      timestamp: tx.timestamp
    })));
    return sha256(this.index + this.previousHash + this.timestamp + txDataStr + this.nonce + this.difficulty);
  }
}

/**
 * Blockchain class managing mining, block insertion, and tampering detection
 */
class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 2;
  }

  loadFromState(savedState) {
    this.difficulty = savedState.difficulty || 2;
    this.pendingTransactions = (savedState.pendingTransactions || []).map(
      t => new Transaction(t.sender, t.recipient, t.amount, t.timestamp, t.hash)
    );
    this.chain = (savedState.chain || []).map(
      b => new Block(b.index, b.transactions, b.previousHash, b.timestamp, b.nonce, b.hash, b.difficulty)
    );
  }

  initializeDefaultChain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 2;

    // 1. Genesis Block creation
    const genesisTx = [new Transaction("System", "Sujal", 50.0)];
    const genesisBlock = new Block(0, genesisTx, "0000000000000000000000000000000000000000000000000000000000000000", Date.now() - 3600000 * 2, 82, "", 2);
    this.chain.push(genesisBlock);

    // 2. Block 1
    const block1Tx = [
      new Transaction("Sujal", "Alice", 10.0, Date.now() - 3600000 + 100),
      new Transaction("Sujal", "Bob", 5.0, Date.now() - 3600000 + 200)
    ];
    const block1 = new Block(1, block1Tx, genesisBlock.hash, Date.now() - 3600000, 194, "", 2);
    this.chain.push(block1);

    // 3. Block 2
    const block2Tx = [
      new Transaction("Alice", "Charlie", 2.5, Date.now() - 1800000 + 100),
      new Transaction("Bob", "David", 1.2, Date.now() - 1800000 + 200)
    ];
    const block2 = new Block(2, block2Tx, block1.hash, Date.now() - 1800000, 241, "", 2);
    this.chain.push(block2);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(tx) {
    this.pendingTransactions.push(tx);
  }

  /**
   * Validates the integrity of the chain
   * Returns object indicating valid status and which index first breaks (if any)
   */
  validateChainIntegrity() {
    const target = Array(this.difficulty + 1).join("0");
    
    for (let i = 0; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      
      // Check if current block hash matches calculated hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return { isValid: false, brokenIndex: i, reason: "Hash mismatch (data tampered)" };
      }

      // Check consensus difficulty requirement
      const diffTarget = Array(currentBlock.difficulty + 1).join("0");
      if (currentBlock.hash.substring(0, currentBlock.difficulty) !== diffTarget) {
        return { isValid: false, brokenIndex: i, reason: "Block hash does not meet difficulty requirement" };
      }

      // Check linkage with previous block
      if (i > 0) {
        const previousBlock = this.chain[i - 1];
        if (currentBlock.previousHash !== previousBlock.hash) {
          return { isValid: false, brokenIndex: i, reason: "Linkage broken: previousHash reference invalid" };
        }
      }
    }
    return { isValid: true, brokenIndex: -1 };
  }
}

// Global Application State & DOM Elements
const blockchain = new Blockchain();
let isMining = false;

// DOM Selectors
const statusCard = document.getElementById("status-card");
const chainStatusLabel = document.getElementById("chain-status");
const statusDot = document.getElementById("status-dot");
const metricBlocks = document.getElementById("metric-blocks");
const metricMempool = document.getElementById("metric-mempool");
const metricDifficulty = document.getElementById("metric-difficulty");

const txForm = document.getElementById("tx-form");
const txSender = document.getElementById("tx-sender");
const txRecipient = document.getElementById("tx-recipient");
const txAmount = document.getElementById("tx-amount");

const difficultySelect = document.getElementById("difficulty-select");
const btnMineBlock = document.getElementById("btn-mine-block");
const miningStatusDisplay = document.getElementById("mining-status-display");
const mineNonces = document.getElementById("mine-nonces");
const mineHashrate = document.getElementById("mine-hashrate");

const node2Badge = document.getElementById("node2-badge");
const btnResetChain = document.getElementById("btn-reset-chain");

const explorerSearch = document.getElementById("explorer-search");
const btnSearch = document.getElementById("btn-search");
const searchResultsOverlay = document.getElementById("search-results-overlay");
const searchResultsBody = document.getElementById("search-results-body");
const btnCloseResults = document.getElementById("btn-close-results");

const mempoolList = document.getElementById("mempool-list");
const emptyMempool = document.getElementById("empty-mempool");
const mempoolBadge = document.getElementById("mempool-badge");

const blockchainScroller = document.getElementById("blockchain-scroller");
const consoleLogs = document.getElementById("console-logs");
const btnClearConsole = document.getElementById("btn-clear-console");

const detailModal = document.getElementById("detail-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const btnCloseModal = document.getElementById("btn-close-modal");

// Initialize Setup
function init() {
  const savedStateStr = localStorage.getItem("blockchain_simulator_state");
  if (savedStateStr) {
    try {
      const savedState = JSON.parse(savedStateStr);
      blockchain.loadFromState(savedState);
      addConsoleLog("SYSTEM", "Restored blockchain ledger state from local storage.", "system");
    } catch (e) {
      blockchain.initializeDefaultChain();
      saveState();
    }
  } else {
    blockchain.initializeDefaultChain();
    saveState();
  }

  difficultySelect.value = blockchain.difficulty.toString();
  
  // Setup Event Listeners
  txForm.addEventListener("submit", handleCreateTransaction);
  difficultySelect.addEventListener("change", handleDifficultyChange);
  btnMineBlock.addEventListener("click", handleMineBlock);
  btnResetChain.addEventListener("click", handleResetLedger);
  btnSearch.addEventListener("click", handleSearch);
  explorerSearch.addEventListener("keyup", (e) => { if (e.key === "Enter") handleSearch(); });
  btnCloseResults.addEventListener("click", () => searchResultsOverlay.classList.add("hide"));
  btnClearConsole.addEventListener("click", () => consoleLogs.innerHTML = "");
  btnCloseModal.addEventListener("click", closeModal);
  detailModal.addEventListener("click", (e) => { if (e.target === detailModal) closeModal(); });

  updateUI();
}

// Persist Blockchain to Local Storage
function saveState() {
  const state = {
    chain: blockchain.chain,
    pendingTransactions: blockchain.pendingTransactions,
    difficulty: blockchain.difficulty
  };
  localStorage.setItem("blockchain_simulator_state", JSON.stringify(state));
}

// Log message helper to simulated network console
function addConsoleLog(source, message, type = "p2p") {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-source">[${source}]</span> ${message}`;
  consoleLogs.appendChild(entry);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Reset ledger action
function handleResetLedger() {
  if (isMining) return;
  if (confirm("Are you sure you want to reset the blockchain ledger? All custom blocks and mempool items will be deleted.")) {
    blockchain.initializeDefaultChain();
    saveState();
    updateUI();
    addConsoleLog("SYSTEM", "Ledger reset to genesis. Nodes synced back to Block #0.", "error");
  }
}

// Adjust mining difficulty
function handleDifficultyChange(e) {
  blockchain.difficulty = parseInt(e.target.value);
  saveState();
  updateUI();
  addConsoleLog("SYSTEM", `Network mining difficulty adjusted to ${blockchain.difficulty}.`, "system");
}

// Handle transaction creation submission
function handleCreateTransaction(e) {
  e.preventDefault();
  
  const sender = txSender.value.trim();
  const recipient = txRecipient.value.trim();
  const amountVal = parseFloat(txAmount.value);

  if (!sender || !recipient || isNaN(amountVal) || amountVal <= 0) {
    alert("Please fill in valid addresses and amounts.");
    return;
  }

  const tx = new Transaction(sender, recipient, amountVal);
  blockchain.addTransaction(tx);
  saveState();
  updateUI();

  // Reset form inputs (keep Alice/Bob presets for quick sandbox testing)
  txAmount.value = (Math.random() * 5 + 0.1).toFixed(2);
  
  addConsoleLog("Node #1", `Broadcasted transaction TX(${tx.hash.substring(0, 10)}...): ${sender} &rarr; ${recipient} (${amountVal} ETH)`, "p2p");
  addConsoleLog("Node #2", `Queued transaction to Mempool. Mempool size: ${blockchain.pendingTransactions.length}`, "mining");
}

// Asynchronous Mining Loop to keep the UI fully responsive
function mineBlockAsync(block, difficulty) {
  return new Promise((resolve) => {
    const target = Array(difficulty + 1).join("0");
    let nonce = 0;
    const startTime = Date.now();
    
    function mineStep() {
      if (!isMining) {
        // Mining was cancelled
        resolve(null);
        return;
      }

      // Check nonces in chunks of 15000 to balance speed and UI frame rate
      for (let i = 0; i < 15000; i++) {
        block.nonce = nonce;
        block.hash = block.calculateHash();
        
        if (block.hash.substring(0, difficulty) === target) {
          const timeSpent = (Date.now() - startTime) / 1000;
          resolve({
            hash: block.hash,
            nonce: nonce,
            timeSpent: timeSpent
          });
          return;
        }
        nonce++;
      }
      
      const timeSpent = (Date.now() - startTime) / 1000;
      const hashrate = Math.round(nonce / (timeSpent || 0.001));
      
      // Update mining metrics in real time
      mineNonces.textContent = nonce.toLocaleString();
      mineHashrate.textContent = hashrate.toLocaleString();
      
      setTimeout(mineStep, 0);
    }
    
    mineStep();
  });
}

// Handle Mempool mining
async function handleMineBlock() {
  if (isMining) return;

  if (blockchain.pendingTransactions.length === 0) {
    addConsoleLog("Node #2", "Mining rejected: no pending transactions in mempool. Generate some first!", "error");
    alert("Mempool is empty. Create a transaction first before mining!");
    return;
  }

  isMining = true;
  btnMineBlock.disabled = true;
  btnMineBlock.classList.remove("pulse-effect");
  btnMineBlock.querySelector(".btn-text").textContent = "Mining Block...";
  miningStatusDisplay.classList.remove("hide");
  node2Badge.className = "node-badge mining";
  node2Badge.textContent = "Mining...";

  const previousBlock = blockchain.getLatestBlock();
  const nextIndex = previousBlock.index + 1;
  const newBlock = new Block(
    nextIndex, 
    blockchain.pendingTransactions, 
    previousBlock.hash, 
    Date.now(), 
    0, 
    "", 
    blockchain.difficulty
  );

  addConsoleLog("Node #2", `Commencing Proof-of-Work mining for Block #${nextIndex} (Difficulty: ${blockchain.difficulty})...`, "mining");

  const result = await mineBlockAsync(newBlock, blockchain.difficulty);

  if (result) {
    // Mining successful
    newBlock.hash = result.hash;
    newBlock.nonce = result.nonce;
    blockchain.chain.push(newBlock);
    blockchain.pendingTransactions = []; // Empty mempool
    saveState();
    
    addConsoleLog("Node #2", `Block Mined! Hash: ${result.hash.substring(0, 16)}... | Nonce: ${result.nonce} | Time: ${result.timeSpent.toFixed(2)}s`, "success");
    addConsoleLog("Node #1", `Block #${newBlock.index} accepted. Syncing peer nodes...`, "p2p");
    addConsoleLog("Node #3", `Consensus sync complete. Linked Block #${newBlock.index}`, "p2p");
  }

  isMining = false;
  btnMineBlock.disabled = false;
  btnMineBlock.classList.add("pulse-effect");
  btnMineBlock.querySelector(".btn-text").textContent = "Mine Mempool Block";
  miningStatusDisplay.classList.add("hide");
  node2Badge.className = "node-badge sync";
  node2Badge.textContent = "Synced";

  updateUI();
}

// Asynchronously re-mine a specific tampered block in the chain
async function handleReMineBlock(blockIndex) {
  if (isMining) return;

  isMining = true;
  
  // Set mining visual status for node 2
  node2Badge.className = "node-badge mining";
  node2Badge.textContent = `Mining Block #${blockIndex}...`;
  addConsoleLog("Node #2", `Commencing re-mine of Block #${blockIndex} to restore chain consensus...`, "mining");

  const targetBlock = blockchain.chain[blockIndex];
  const targetDiff = targetBlock.difficulty;
  
  // Show general mining indicator panel in settings sidebar as well
  miningStatusDisplay.classList.remove("hide");
  btnMineBlock.disabled = true;

  const result = await mineBlockAsync(targetBlock, targetDiff);

  if (result) {
    targetBlock.hash = result.hash;
    targetBlock.nonce = result.nonce;

    addConsoleLog("Node #2", `Re-mined Block #${blockIndex} successfully! Hash: ${result.hash.substring(0, 16)}...`, "success");

    // Propagate changes and fix linkage hashes for subsequent blocks
    for (let i = blockIndex + 1; i < blockchain.chain.length; i++) {
      blockchain.chain[i].previousHash = blockchain.chain[i - 1].hash;
      blockchain.chain[i].hash = blockchain.chain[i].calculateHash();
      addConsoleLog("Node #1", `Recalculated linkage pointer hash for Block #${i}`, "p2p");
    }

    saveState();
    addConsoleLog("SYSTEM", "Chain verification restored. Consensus synced across all nodes.", "success");
  }

  isMining = false;
  btnMineBlock.disabled = false;
  miningStatusDisplay.classList.add("hide");
  node2Badge.className = "node-badge sync";
  node2Badge.textContent = "Synced";

  updateUI();
}

// Modify transaction data inside a block to simulate tamper attack
function handleTamperTransaction(blockIndex, txIndex, inputElement) {
  const newText = inputElement.value.trim();
  if (!newText) {
    alert("Transaction description cannot be empty.");
    updateUI();
    return;
  }

  // Parse modified transaction details (Expected Format: "Sender -> Recipient: Amount ETH")
  // e.g. "Alice -> Charlie: 2.5 ETH"
  const regex = /^\s*(.+?)\s*->\s*(.+?)\s*:\s*([\d.]+)\s*(?:ETH)?\s*$/i;
  const match = newText.match(regex);

  if (!match) {
    alert("Invalid transaction format! Must be: Sender -> Recipient: Amount (e.g. Alice -> Bob: 10)");
    updateUI();
    return;
  }

  const sender = match[1];
  const recipient = match[2];
  const amount = parseFloat(match[3]);

  if (isNaN(amount) || amount <= 0) {
    alert("Transaction amount must be a positive number.");
    updateUI();
    return;
  }

  const block = blockchain.chain[blockIndex];
  const oldTx = block.transactions[txIndex];
  
  // Replace transaction details in place
  block.transactions[txIndex] = new Transaction(sender, recipient, amount, oldTx.timestamp);
  
  // Recalculate this block's hash to reflect modified content
  block.hash = block.calculateHash();

  addConsoleLog("ATTACKER", `TAMPERED with Block #${blockIndex} Tx #${txIndex}! Modified data to: "${sender} -> ${recipient}: ${amount} ETH"`, "error");
  addConsoleLog("SYSTEM", `Block #${blockIndex} hash changed to: ${block.hash.substring(0, 16)}...`, "error");
  addConsoleLog("Node #1", `CRITICAL: Hash mismatch detected on Block #${blockIndex}! Refusing chain consensus.`, "error");

  // Keep subsequent block reference links broken intentionally (until re-mined)
  // Subsequent blocks are NOT recalculated automatically here, which causes index mismatch breaks
  saveState();
  updateUI();
}

// Global UI Rendering State Management
function updateUI() {
  const check = blockchain.validateChainIntegrity();
  
  // 1. Update Metrics dashboard indicators
  metricBlocks.textContent = blockchain.chain.length;
  metricMempool.textContent = blockchain.pendingTransactions.length;
  metricDifficulty.textContent = blockchain.difficulty;

  if (check.isValid) {
    chainStatusLabel.textContent = "SECURE";
    statusDot.className = "status-dot green";
    statusCard.style.borderColor = "var(--color-accent)";
  } else {
    chainStatusLabel.textContent = "COMPROMISED";
    statusDot.className = "status-dot red";
    statusCard.style.borderColor = "var(--color-danger)";
  }

  // 2. Render Mempool (Pending transaction list)
  mempoolBadge.textContent = `${blockchain.pendingTransactions.length} pending`;
  mempoolList.innerHTML = "";
  
  if (blockchain.pendingTransactions.length === 0) {
    mempoolList.appendChild(emptyMempool);
  } else {
    blockchain.pendingTransactions.forEach(tx => {
      const card = document.createElement("div");
      card.className = "mempool-tx-card";
      
      const formattedDate = new Date(tx.timestamp).toLocaleTimeString();
      card.innerHTML = `
        <div class="mempool-tx-header">
          <span>TX: ${tx.hash.substring(0, 12)}...</span>
          <span>${formattedDate}</span>
        </div>
        <div class="tx-addresses">
          <div>From: <strong>${tx.sender}</strong></div>
          <div>To: <strong>${tx.recipient}</strong></div>
        </div>
        <div class="tx-value">${tx.amount} ETH</div>
      `;
      
      card.addEventListener("click", () => showTransactionDetails(tx, "Mempool (Pending)"));
      mempoolList.appendChild(card);
    });
  }

  // 3. Render Blockchain Visual Cards
  blockchainScroller.innerHTML = "";
  
  blockchain.chain.forEach((block, bIndex) => {
    const card = document.createElement("div");
    
    // Check validation of this specific block
    let isBlockValid = true;
    let failReason = "";

    // A block is invalid if its hash does not match computed value
    if (block.hash !== block.calculateHash()) {
      isBlockValid = false;
      failReason = "Tampered Block Data";
    }
    // A block is invalid if it has difficulty requirements unfulfilled
    const diffTarget = Array(block.difficulty + 1).join("0");
    if (block.hash.substring(0, block.difficulty) !== diffTarget) {
      isBlockValid = false;
      failReason = `Hash does not satisfy Difficulty target (${block.difficulty} zeroes)`;
    }
    // A block is invalid if index > 0 and previousHash mismatch
    if (bIndex > 0) {
      const prevBlock = blockchain.chain[bIndex - 1];
      if (block.previousHash !== prevBlock.hash) {
        isBlockValid = false;
        failReason = "Broken linkage to previous block";
      }
    }

    card.className = `block-card ${isBlockValid ? 'valid' : 'invalid'}`;
    
    const formattedDate = new Date(block.timestamp).toLocaleString();
    
    // Create inner DOM elements
    let htmlContent = `
      <div class="block-card-header">
        <span class="block-index">BLOCK #${block.index}</span>
        <span class="block-badge">${isBlockValid ? 'Secure' : 'Corrupt'}</span>
      </div>
      
      <div class="block-info-row">
        <span class="info-label">Block Hash</span>
        <span class="info-value font-mono">${block.hash}</span>
      </div>

      <div class="block-info-row">
        <span class="info-label">Previous Hash</span>
        <span class="info-value font-mono">${block.previousHash}</span>
      </div>

      <div class="block-info-row">
        <span class="info-label">Timestamp</span>
        <span class="info-value font-mono">${formattedDate}</span>
      </div>

      <div class="block-info-row">
        <span class="info-label">Nonce / Difficulty</span>
        <span class="info-value font-mono">${block.nonce} (Diff: ${block.difficulty})</span>
      </div>

      <div class="block-info-row">
        <span class="info-label">Transactions (${block.transactions.length})</span>
        <div class="block-transactions-box">
    `;

    block.transactions.forEach((tx, tIndex) => {
      const txText = `${tx.sender} -> ${tx.recipient}: ${tx.amount} ETH`;
      htmlContent += `
        <div class="block-tx-item">
          <input type="text" class="tx-edit-input" 
                 value="${txText}" 
                 title="Double-click to edit and tamper with transaction data"
                 data-block="${bIndex}" 
                 data-tx="${tIndex}">
        </div>
      `;
    });

    htmlContent += `
        </div>
      </div>

      <div class="block-actions">
        <button class="btn btn-secondary btn-sm btn-inspect-block" data-index="${bIndex}">Inspect Details</button>
    `;

    if (!isBlockValid) {
      htmlContent += `<button class="btn btn-remine btn-sm btn-mine-repair" data-index="${bIndex}">Re-Mine Block</button>`;
    }

    htmlContent += `</div>`;
    
    card.innerHTML = htmlContent;

    // Attach listeners inside card
    const inspectBtn = card.querySelector(".btn-inspect-block");
    inspectBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showBlockDetails(block, isBlockValid, failReason);
    });

    const repairBtn = card.querySelector(".btn-mine-repair");
    if (repairBtn) {
      repairBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleReMineBlock(bIndex);
      });
    }

    // Attach change events on tx edit inputs (Tampering simulation)
    const inputs = card.querySelectorAll(".tx-edit-input");
    inputs.forEach(input => {
      input.addEventListener("change", (e) => {
        const bIdx = parseInt(e.target.dataset.block);
        const tIdx = parseInt(e.target.dataset.tx);
        handleTamperTransaction(bIdx, tIdx, e.target);
      });
      // Prevent clicking input from triggering parent card inspectors
      input.addEventListener("click", (e) => e.stopPropagation());
    });

    // Inspect block on card click
    card.addEventListener("click", () => showBlockDetails(block, isBlockValid, failReason));

    blockchainScroller.appendChild(card);
  });
}

// Block Explorer Search Logic
function handleSearch() {
  const query = explorerSearch.value.trim().toLowerCase();
  
  if (!query) {
    searchResultsOverlay.classList.add("hide");
    return;
  }

  searchResultsBody.innerHTML = "";
  searchResultsOverlay.classList.remove("hide");

  let matches = [];

  // 1. Search Block Index
  blockchain.chain.forEach(block => {
    if (block.index.toString() === query || 
        block.hash.toLowerCase().includes(query) || 
        block.previousHash.toLowerCase().includes(query)) {
      matches.push({ type: "block", data: block });
    }
    
    // 2. Search Block Transactions
    block.transactions.forEach(tx => {
      if (tx.hash.toLowerCase().includes(query) || 
          tx.sender.toLowerCase().includes(query) || 
          tx.recipient.toLowerCase().includes(query)) {
        matches.push({ type: "transaction", data: tx, blockIndex: block.index });
      }
    });
  });

  // 3. Search Pending Mempool Transactions
  blockchain.pendingTransactions.forEach(tx => {
    if (tx.hash.toLowerCase().includes(query) || 
        tx.sender.toLowerCase().includes(query) || 
        tx.recipient.toLowerCase().includes(query)) {
      matches.push({ type: "transaction", data: tx, blockIndex: null });
    }
  });

  if (matches.length === 0) {
    searchResultsBody.innerHTML = `
      <div class="empty-mempool-message">
        No blocks or transactions matching "${query}" were found.
      </div>
    `;
    return;
  }

  // Display results list
  matches.forEach(match => {
    const card = document.createElement("div");
    card.className = "search-item-card";

    if (match.type === "block") {
      card.innerHTML = `
        <div style="font-weight:700; color:var(--color-primary);">BLOCK #${match.data.index}</div>
        <div class="font-mono" style="font-size:0.75rem; color:var(--color-text-muted);">Hash: ${match.data.hash}</div>
        <div style="font-size:0.8rem;">Transactions Count: ${match.data.transactions.length}</div>
      `;
      card.addEventListener("click", () => {
        searchResultsOverlay.classList.add("hide");
        showBlockDetails(match.data);
      });
    } else {
      const location = match.blockIndex !== null ? `Mined in Block #${match.blockIndex}` : "Pending in Mempool";
      card.innerHTML = `
        <div style="font-weight:700; color:var(--color-warn);">TRANSACTION</div>
        <div class="font-mono" style="font-size:0.75rem; color:var(--color-text-muted);">TX ID: ${match.data.hash}</div>
        <div style="font-size:0.85rem; margin-top:0.25rem;">
          ${match.data.sender} &rarr; ${match.data.recipient} : <strong>${match.data.amount} ETH</strong>
        </div>
        <div style="font-size:0.75rem; color:var(--color-text-dim);">${location}</div>
      `;
      card.addEventListener("click", () => {
        searchResultsOverlay.classList.add("hide");
        showTransactionDetails(match.data, location);
      });
    }
    searchResultsBody.appendChild(card);
  });
}

// Modal Detail Presenters
function showBlockDetails(block, isValid = null, failReason = "") {
  if (isValid === null) {
    const integrity = blockchain.validateChainIntegrity();
    isValid = true;
    if (block.hash !== block.calculateHash()) {
      isValid = false;
      failReason = "Block details do not match hashing requirements (tampered block)";
    } else if (block.index > 0 && block.previousHash !== blockchain.chain[block.index - 1].hash) {
      isValid = false;
      failReason = "Broken linkage to previous block";
    }
  }

  modalTitle.textContent = `Block #${block.index} Parameters`;
  
  let txHtml = "";
  block.transactions.forEach((tx, i) => {
    txHtml += `
      <div class="block-tx-item" style="padding:0.4rem 0;">
        <strong>#${i} TX ID:</strong> <span class="font-mono">${tx.hash}</span><br>
        <strong>From:</strong> ${tx.sender} &nbsp;|&nbsp; <strong>To:</strong> ${tx.recipient} &nbsp;|&nbsp; <strong>Amount:</strong> ${tx.amount} ETH
      </div>
    `;
  });

  modalBody.innerHTML = `
    <div class="modal-detail-group">
      <span class="modal-detail-title">Block Height Index</span>
      <div class="modal-detail-content font-mono">${block.index}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Verification Status</span>
      <div class="modal-detail-content" style="color: ${isValid ? 'var(--color-accent)' : 'var(--color-danger)'}; font-weight:700;">
        ${isValid ? 'SECURE (Cryptographically Validated)' : `COMPROMISED: ${failReason}`}
      </div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Block SHA-256 Hash</span>
      <div class="modal-detail-content font-mono">${block.hash}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Previous Link Hash</span>
      <div class="modal-detail-content font-mono">${block.previousHash}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Timestamp</span>
      <div class="modal-detail-content font-mono">${new Date(block.timestamp).toString()}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Nonce / Difficulty Target</span>
      <div class="modal-detail-content font-mono">Nonce: ${block.nonce} &nbsp;|&nbsp; Difficulty: ${block.difficulty}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Block Transactions</span>
      <div class="modal-detail-content code-box">
        ${txHtml || 'No transactions in block.'}
      </div>
    </div>
  `;
  
  detailModal.classList.remove("hide");
}

function showTransactionDetails(tx, statusText) {
  modalTitle.textContent = `Transaction Audit`;
  
  modalBody.innerHTML = `
    <div class="modal-detail-group">
      <span class="modal-detail-title">Transaction Hash</span>
      <div class="modal-detail-content font-mono">${tx.hash}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Consensus Status</span>
      <div class="modal-detail-content">${statusText}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Sender Address</span>
      <div class="modal-detail-content font-mono">${tx.sender}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Recipient Address</span>
      <div class="modal-detail-content font-mono">${tx.recipient}</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Amount Transferred</span>
      <div class="modal-detail-content" style="font-weight:700; color: #ffffff;">${tx.amount} ETH</div>
    </div>
    <div class="modal-detail-group">
      <span class="modal-detail-title">Tx Timestamp</span>
      <div class="modal-detail-content font-mono">${new Date(tx.timestamp).toString()}</div>
    </div>
  `;
  
  detailModal.classList.remove("hide");
}

function closeModal() {
  detailModal.classList.add("hide");
}

// Boot the app
window.addEventListener("DOMContentLoaded", init);
