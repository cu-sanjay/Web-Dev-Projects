// Presets of Solidity-like code templates
const contractTemplates = {
  storage: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 public storedData;

    event StorageUpdated(uint256 newValue);

    function store(uint256 x) public {
        storedData = x;
        emit StorageUpdated(x);
    }

    function retrieve() public view returns (uint256) {
        return storedData;
    }
}`,

  token: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ERC20Token {
    string public name = "KraftToken";
    string public symbol = "KFT";
    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;
        balances[msg.sender] = initialSupply;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
}`,

  voting: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleBallot {
    string public proposalName;
    uint256 public voteCount;
    mapping(address => bool) public hasVoted;

    event Voted(address indexed voter);

    constructor(string memory proposal) {
        proposalName = proposal;
    }

    function vote() public {
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        voteCount += 1;
        emit Voted(msg.sender);
    }
}`,

  crowdfund: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdfundPool {
    uint256 public targetAmount;
    uint256 public totalRaised;
    bool public isFinalized;
    mapping(address => uint256) public contributions;

    event ContributionReceived(address indexed contributor, uint256 amount);
    event GoalAchieved();

    constructor(uint256 target) {
        targetAmount = target;
    }

    function contribute() public payable {
        require(!isFinalized, "Fund closed");
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        emit ContributionReceived(msg.sender, msg.value);
        if (totalRaised >= targetAmount) {
            emit GoalAchieved();
        }
    }

    function finalize() public {
        require(totalRaised >= targetAmount, "Target not met");
        isFinalized = true;
    }
}`
};

// Simulated State Storage
let activeAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
let activeBalance = 100.00;
let gasPrice = 20; // Gwei

// Compilation outputs
let currentABI = [];
let currentAST = {};
let currentOpcodes = "";
let currentContractName = "SimpleStorage";
let currentContractType = "storage";

// Registry of Deployed Contracts
let deployedContracts = {}; // address -> deployed contract state instance
let selectedDeployedAddress = "";

// DOM elements
const editorSelect = document.getElementById("template-select");
const solidityEditor = document.getElementById("solidity-editor");
const lineNumbers = document.getElementById("line-numbers");
const btnCompile = document.getElementById("btn-compile");

const abiOutput = document.getElementById("abi-output");
const astOutput = document.getElementById("ast-output");
const opcodesOutput = document.getElementById("opcodes-output");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

const constructorInputsContainer = document.getElementById("constructor-inputs-container");
const btnDeploy = document.getElementById("btn-deploy");
const deployedContractsSelect = document.getElementById("deployed-contracts-select");
const interactionForms = document.getElementById("interaction-forms");
const storageSlotsTable = document.getElementById("storage-slots-table");

const evmStack = document.getElementById("evm-stack");
const receiptsLog = document.getElementById("receipts-log");
const btnClearReceipts = document.getElementById("btn-clear-receipts");

const accountAddressLabel = document.getElementById("account-address");
const accountBalanceLabel = document.getElementById("account-balance");

// Init Hook
function init() {
  // Restore Editor templates if saved
  const savedCode = localStorage.getItem("sc_visualizer_code");
  const savedType = localStorage.getItem("sc_visualizer_type") || "storage";

  editorSelect.value = savedType;
  currentContractType = savedType;
  solidityEditor.value = savedCode || contractTemplates[savedType];
  
  // Account Presets
  accountAddressLabel.textContent = activeAccount;
  accountBalanceLabel.textContent = `${activeBalance.toFixed(2)} ETH`;

  // Render Line Numbers
  updateLineNumbers();
  
  // Event Bindings
  editorSelect.addEventListener("change", handleTemplateChange);
  solidityEditor.addEventListener("input", updateLineNumbers);
  solidityEditor.addEventListener("keydown", handleTabKeyPress);
  btnCompile.addEventListener("click", handleCompile);
  btnDeploy.addEventListener("click", handleDeploy);
  deployedContractsSelect.addEventListener("change", handleContractChange);
  btnClearReceipts.addEventListener("click", () => receiptsLog.innerHTML = "");

  // Tab triggering
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });

  // Attempt initial compile
  handleCompile();
}

// Format Line Numbers inside the textarea IDE gutter
function updateLineNumbers() {
  const lines = solidityEditor.value.split("\n").length;
  let numbersHtml = "";
  for (let i = 1; i <= lines; i++) {
    numbersHtml += `<div>${i}</div>`;
  }
  lineNumbers.innerHTML = numbersHtml;
  localStorage.setItem("sc_visualizer_code", solidityEditor.value);
}

// Tab key spacing handling inside Editor
function handleTabKeyPress(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 4;
    updateLineNumbers();
  }
}

// Switching presets code templates
function handleTemplateChange(e) {
  const selected = e.target.value;
  currentContractType = selected;
  solidityEditor.value = contractTemplates[selected];
  localStorage.setItem("sc_visualizer_type", selected);
  updateLineNumbers();
  handleCompile();
}

// Compile Code Parser & Artifacts Generator
function handleCompile() {
  const code = solidityEditor.value;
  
  // 1. Regex parsing variables
  const contractNameMatch = code.match(/contract\s+(\w+)/);
  currentContractName = contractNameMatch ? contractNameMatch[1] : "SmartContract";

  // Parse functions, constructors, state variables
  const constructorArgs = parseConstructorArgs(code);
  const stateVars = parseStateVariables(code);
  const functions = parseFunctions(code);

  // 2. Generate ABI Spec
  currentABI = [];

  // Add constructor
  if (constructorArgs.length > 0 || code.includes("constructor")) {
    currentABI.push({
      type: "constructor",
      inputs: constructorArgs,
      stateMutability: "nonpayable"
    });
  }

  // Add variables as getter methods
  stateVars.forEach(v => {
    if (v.visibility === "public") {
      let inputs = [];
      if (v.type.startsWith("mapping")) {
        // Find map key input type
        const match = v.type.match(/mapping\((.*?)\s*=>\s*(.*?)\)/);
        inputs.push({ name: "key", type: match ? match[1] : "address" });
      }
      currentABI.push({
        name: v.name,
        type: "function",
        stateMutability: "view",
        inputs: inputs,
        outputs: [{ name: "", type: v.type.startsWith("mapping") ? v.type.match(/=>\s*(.*?)$/)[1] : v.type }]
      });
    }
  });

  // Add normal functions
  functions.forEach(f => {
    currentABI.push({
      name: f.name,
      type: "function",
      stateMutability: f.mutability,
      inputs: f.inputs,
      outputs: f.outputs
    });
  });

  abiOutput.textContent = JSON.stringify(currentABI, null, 2);

  // 3. Render AST Graph Node explorer
  currentAST = buildSimplifiedAST(currentContractName, stateVars, functions);
  astOutput.innerHTML = "";
  astOutput.appendChild(renderASTNode(currentAST));

  // 4. Generate Opcodes/Bytecode Instruction visual representation
  currentOpcodes = generateMockOpcodes(currentContractName, functions);
  opcodesOutput.textContent = currentOpcodes;

  // 5. Update Constructor Deploy Inputs UI
  renderConstructorInputs(constructorArgs);

  addConsoleLog("SYSTEM", `Successfully compiled contract: ${currentContractName}`, "system");
}

// Compile RegEx Parsers
function parseConstructorArgs(code) {
  const match = code.match(/constructor\s*\((.*?)\)/s);
  if (!match) return [];
  const argsStr = match[1].trim();
  if (!argsStr) return [];
  return argsStr.split(",").map(part => {
    const tokens = part.trim().split(/\s+/);
    // uint256 initialSupply, or string memory proposal
    const type = tokens[0];
    const name = tokens[tokens.length - 1];
    return { name, type };
  });
}

function parseStateVariables(code) {
  const lines = code.split("\n");
  const vars = [];
  lines.forEach(line => {
    // Check if line declares variable inside contract body, but not inside functions
    const isVar = line.match(/^\s*(uint256|string|bool|address|mapping\(.*?\))\s+(public|private|internal)?\s+(\w+)\s*(=|;)/);
    if (isVar) {
      vars.push({
        type: isVar[1],
        visibility: isVar[2] || "internal",
        name: isVar[3]
      });
    }
  });
  return vars;
}

function parseFunctions(code) {
  const funcs = [];
  // Regex finding function header signatures
  const regex = /function\s+(\w+)\s*\((.*?)\)\s+(public|external|internal|private)\s*(view|pure|payable)?\s*(returns\s*\((.*?)\))?/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const name = match[1];
    const argsStr = match[2].trim();
    const visibility = match[3];
    const mutability = match[4] || "nonpayable";
    const returnsStr = match[6] || "";

    const inputs = argsStr ? argsStr.split(",").map(p => {
      const tokens = p.trim().split(/\s+/);
      return { name: tokens[tokens.length - 1], type: tokens[0] };
    }) : [];

    const outputs = returnsStr ? returnsStr.split(",").map(p => {
      const tokens = p.trim().split(/\s+/);
      return { type: tokens[0] };
    }) : [];

    funcs.push({ name, inputs, visibility, mutability, outputs });
  }
  return funcs;
}

// Render dynamic input fields based on constructor ABI requirements
function renderConstructorInputs(args) {
  constructorInputsContainer.innerHTML = "";
  if (args.length === 0) {
    btnDeploy.disabled = false;
    return;
  }

  args.forEach(arg => {
    const group = document.createElement("div");
    group.className = "input-group";
    
    const label = document.createElement("label");
    label.textContent = `Constructor: ${arg.name} (${arg.type})`;
    
    const input = document.createElement("input");
    input.type = arg.type.includes("uint") ? "number" : "text";
    input.dataset.name = arg.name;
    input.dataset.type = arg.type;
    input.placeholder = arg.type.includes("uint") ? "e.g. 1000" : "e.g. Test proposal";
    input.required = true;
    
    group.appendChild(label);
    group.appendChild(input);
    constructorInputsContainer.appendChild(group);
  });
  btnDeploy.disabled = false;
}

// AST Tree Generation
function buildSimplifiedAST(contractName, vars, functions) {
  return {
    nodeType: "SourceUnit",
    children: [
      {
        nodeType: "PragmaDirective",
        value: "^0.8.0"
      },
      {
        nodeType: "ContractDefinition",
        name: contractName,
        children: [
          ...vars.map(v => ({
            nodeType: "VariableDeclaration",
            name: v.name,
            type: v.type,
            visibility: v.visibility
          })),
          ...functions.map(f => ({
            nodeType: "FunctionDefinition",
            name: f.name,
            stateMutability: f.mutability,
            visibility: f.visibility,
            inputs: f.inputs.map(i => `${i.type} ${i.name}`),
            outputs: f.outputs.map(o => o.type)
          }))
        ]
      }
    ]
  };
}

// Recursively print AST element nodes
function renderASTNode(node) {
  const container = document.createElement("div");
  container.className = "tree-node";

  const label = document.createElement("span");
  label.className = "tree-node-label";
  label.textContent = node.nodeType;

  if (node.name) {
    label.innerHTML += ` <span class="tree-node-value">"${node.name}"</span>`;
  } else if (node.value) {
    label.innerHTML += ` <span class="tree-node-value">"${node.value}"</span>`;
  }

  container.appendChild(label);

  // Render variables/fields in details
  if (node.type || node.visibility || node.stateMutability) {
    const details = document.createElement("div");
    details.className = "input-help";
    details.style.marginLeft = "1rem";
    let text = [];
    if (node.type) text.push(`Type: ${node.type}`);
    if (node.visibility) text.push(`Vis: ${node.visibility}`);
    if (node.stateMutability) text.push(`Mutability: ${node.stateMutability}`);
    details.textContent = text.join(" | ");
    container.appendChild(details);
  }

  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      container.appendChild(renderASTNode(child));
    });
  }

  return container;
}

// Generating realistic Assembly Bytecode/Opcodes
function generateMockOpcodes(name, functions) {
  let hexBytes = "608060405234801561001057600080fd5b50";
  let lines = [
    `; --- CONTEXT: ${name} ---`,
    "PUSH1 0x80",
    "PUSH1 0x40",
    "MSTORE    ; Setup memory pointers",
    "CALLVALUE",
    "DUP1",
    "ISZERO",
    "PUSH2 0x0010",
    "JUMPI",
    "PUSH1 0x00",
    "DUP1",
    "REVERT    ; Revert if ether is sent",
    "JUMPDEST",
    "POP",
    "; --- FUNCTION DISPATCHER ---",
    "PUSH1 0x04",
    "CALLDATASIZE",
    "LT",
    "PUSH2 0x0040",
    "JUMPI"
  ];

  functions.forEach((f, idx) => {
    // Generate signature hash
    const signature = `${f.name}(${f.inputs.map(i => i.type).join(",")})`;
    const sigHash = sha256_sig(signature);
    lines.push(`PUSH4 0x${sigHash}  ; hash of ${signature}`);
    lines.push("DUP2");
    lines.push("EQ");
    lines.push(`PUSH2 0x00e${idx}  ; jump to ${f.name}`);
    lines.push("JUMPI");
  });

  lines.push("JUMPDEST", "PUSH1 0x00", "DUP1", "REVERT    ; function fallback");

  return lines.join("\n") + "\n\nBytecode Binary:\n" + hexBytes + "...";
}

// Simple Helper to mock a signature hash (e.g. 4 bytes of sha256)
function sha256_sig(str) {
  // Take first 8 chars of a raw SHA-256
  const hash = sha256(str);
  return hash.substring(0, 8);
}

// Helper to log receipts into the bottom terminal pane
function addConsoleLog(source, message, type = "system", data = null) {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-source">[${source}]</span> ${message}`;
  
  if (data) {
    const receiptBlock = document.createElement("div");
    receiptBlock.className = "log-receipt-block font-mono";
    let details = [];
    for (let key in data) {
      details.push(`${key}: ${data[key]}`);
    }
    receiptBlock.innerHTML = details.join("<br>");
    entry.appendChild(receiptBlock);
  }

  receiptsLog.appendChild(entry);
  receiptsLog.scrollTop = receiptsLog.scrollHeight;
}

// Solidity Editor Deploy Logic
function handleDeploy() {
  // Read constructor inputs
  const constructorArgs = {};
  let valid = true;
  
  const inputs = constructorInputsContainer.querySelectorAll("input");
  inputs.forEach(input => {
    const val = input.value.trim();
    if (!val) {
      alert(`Please input value for ${input.dataset.name}`);
      valid = false;
      return;
    }
    constructorArgs[input.dataset.name] = input.dataset.type.includes("uint") ? parseInt(val) : val;
  });

  if (!valid) return;

  // Simulate Deployment Gas usage
  const deployGas = 350000 + Math.floor(Math.random() * 50000);
  const deployCost = (deployGas * gasPrice * 1e-9); // ETH cost
  
  if (activeBalance < deployCost) {
    addConsoleLog("SYSTEM", "Deploy transaction REVERTED: Insufficient funds for deployment.", "error");
    alert("Insufficient ETH balance to cover gas fees for deployment!");
    return;
  }

  // Deduct user balance
  activeBalance -= deployCost;
  accountBalanceLabel.textContent = `${activeBalance.toFixed(4)} ETH`;

  // Generate unique EVM contract address
  const deployedAddress = "0x" + sha256(currentContractName + Date.now()).substring(0, 40);

  // Initialize VM memory storage structure
  const stateStorage = {};
  
  // Apply initial variable defaults based on type/template
  if (currentContractType === "storage") {
    stateStorage["storedData"] = { slot: 0, type: "uint256", value: 0 };
  } else if (currentContractType === "token") {
    const initialSupply = constructorArgs["initialSupply"] || 1000000;
    stateStorage["name"] = { slot: 0, type: "string", value: "KraftToken" };
    stateStorage["symbol"] = { slot: 1, type: "string", value: "KFT" };
    stateStorage["totalSupply"] = { slot: 2, type: "uint256", value: initialSupply };
    
    // Mapping mapping is represented dynamically: Slot hash key
    const mappingSlotBase = 3;
    stateStorage[`balances[${activeAccount}]`] = { 
      slot: `keccak256(${activeAccount} + Slot ${mappingSlotBase})`, 
      type: "uint256", 
      value: initialSupply 
    };
  } else if (currentContractType === "voting") {
    const propName = constructorArgs["proposal"] || "Test Proposal";
    stateStorage["proposalName"] = { slot: 0, type: "string", value: propName };
    stateStorage["voteCount"] = { slot: 1, type: "uint256", value: 0 };
  } else if (currentContractType === "crowdfund") {
    const target = constructorArgs["target"] || 100;
    stateStorage["targetAmount"] = { slot: 0, type: "uint256", value: target };
    stateStorage["totalRaised"] = { slot: 1, type: "uint256", value: 0 };
    stateStorage["isFinalized"] = { slot: 2, type: "bool", value: false };
  }

  // Register deployed contract metadata
  deployedContracts[deployedAddress] = {
    name: currentContractName,
    type: currentContractType,
    abi: currentABI,
    storage: stateStorage,
    address: deployedAddress,
    args: constructorArgs
  };

  // Populate Selector dropdown
  const option = document.createElement("option");
  option.value = deployedAddress;
  option.textContent = `${currentContractName} @ ${deployedAddress.substring(0, 10)}...`;
  deployedContractsSelect.appendChild(option);
  deployedContractsSelect.value = deployedAddress;

  handleContractChange({ target: { value: deployedAddress } });

  // Add Receipts log output
  addConsoleLog("EVM", `Deployed ${currentContractName} contract successfully.`, "deploy", {
    "Contract Address": deployedAddress,
    "Transaction Hash": "0x" + sha256("tx" + Date.now()),
    "Gas Used": `${deployGas} units`,
    "Gas Price": `${gasPrice} Gwei`,
    "Transaction Cost": `${deployCost.toFixed(6)} ETH`,
    "Status": "0x1 (SUCCESS)"
  });

  // Run dynamic compilation stack visual steps for deployed constructor
  animateEVMExecution([
    "PUSH1 0x80",
    "PUSH1 0x40",
    "MSTORE",
    `PUSH1 ${Object.values(constructorArgs)[0] || 0} ; constructor input`,
    "PUSH1 0x00",
    "SSTORE ; store initial state variable variables"
  ]);
}

// Selection of Deployed Contract changes
function handleContractChange(e) {
  selectedDeployedAddress = e.target.value;
  
  if (!selectedDeployedAddress) {
    interactionForms.innerHTML = `<div class="empty-forms-message">Deploy a contract to generate call interfaces.</div>`;
    storageSlotsTable.innerHTML = `<div class="empty-mempool-message">Deploy and execute write functions to view state variables allocation.</div>`;
    return;
  }

  const contract = deployedContracts[selectedDeployedAddress];
  
  // Render ABI Interaction Card
  renderInteractionForms(contract);
  
  // Update state variable Storage Slots table
  updateStorageSlotsTable(contract);
}

// Generate interaction inputs based on ABI schemas
function renderInteractionForms(contract) {
  interactionForms.innerHTML = "";
  
  const executableFuncs = contract.abi.filter(item => item.type === "function");

  if (executableFuncs.length === 0) {
    interactionForms.innerHTML = `<div class="empty-forms-message">Contract contains no callable public functions.</div>`;
    return;
  }

  executableFuncs.forEach(func => {
    const card = document.createElement("div");
    // View functions (reads) vs State variables inputs (writes)
    const isView = func.stateMutability === "view" || func.stateMutability === "pure";
    card.className = `abi-func-card ${isView ? 'view' : 'nonpayable'}`;

    let inputsHtml = "";
    func.inputs.forEach((input, index) => {
      inputsHtml += `
        <input type="${input.type.includes("uint") ? 'number' : 'text'}" 
               placeholder="${input.name} (${input.type})" 
               data-arg-idx="${index}" 
               required>
      `;
    });

    card.innerHTML = `
      <div class="abi-func-header">
        <span class="abi-func-name">${func.name}()</span>
        <span class="abi-func-type">${func.stateMutability}</span>
      </div>
      ${inputsHtml ? `<div class="abi-func-inputs">${inputsHtml}</div>` : ""}
      <div class="abi-func-actions">
        <button class="btn ${isView ? 'btn-primary' : 'btn-transact'} btn-sm btn-call-func">${isView ? 'Call' : 'Transact'}</button>
        <span class="abi-func-outputs" id="out-${func.name}"></span>
      </div>
    `;

    // Action execution listener
    const btn = card.querySelector(".btn-call-func");
    btn.addEventListener("click", () => {
      const inputs = card.querySelectorAll(".abi-func-inputs input");
      const args = Array.from(inputs).map(input => {
        const val = input.value.trim();
        return input.type === "number" ? parseFloat(val) : val;
      });
      executeContractFunction(contract, func, args, card.querySelector(".abi-func-outputs"));
    });

    interactionForms.appendChild(card);
  });
}

// Function Execution Machine
function executeContractFunction(contract, func, args, outputLabel) {
  const isView = func.stateMutability === "view" || func.stateMutability === "pure";
  
  // View functions read local VM state and don't charge gas
  if (isView) {
    let result = "";
    
    // Simulate read logic based on templates
    if (contract.type === "storage") {
      if (func.name === "retrieve") {
        result = contract.storage["storedData"].value;
      } else if (func.name === "storedData") {
        result = contract.storage["storedData"].value;
      }
    } else if (contract.type === "token") {
      if (func.name === "balanceOf") {
        const addr = args[0] || activeAccount;
        const bal = contract.storage[`balances[${addr}]`]?.value || 0;
        result = `${bal} KFT`;
      } else if (func.name === "totalSupply") {
        result = contract.storage["totalSupply"].value;
      } else if (func.name === "name") {
        result = contract.storage["name"].value;
      } else if (func.name === "symbol") {
        result = contract.storage["symbol"].value;
      }
    } else if (contract.type === "voting") {
      if (func.name === "proposalName") {
        result = contract.storage["proposalName"].value;
      } else if (func.name === "voteCount") {
        result = contract.storage["voteCount"].value;
      } else if (func.name === "hasVoted") {
        const addr = args[0] || activeAccount;
        result = contract.storage[`hasVoted[${addr}]`]?.value || false;
      }
    } else if (contract.type === "crowdfund") {
      if (func.name === "targetAmount") {
        result = contract.storage["targetAmount"].value;
      } else if (func.name === "totalRaised") {
        result = contract.storage["totalRaised"].value;
      } else if (func.name === "isFinalized") {
        result = contract.storage["isFinalized"].value;
      } else if (func.name === "contributions") {
        const addr = args[0] || activeAccount;
        result = contract.storage[`contributions[${addr}]`]?.value || 0;
      }
    }

    outputLabel.textContent = `&rarr; ${result}`;
    addConsoleLog("EVM (Call)", `Called read method ${func.name}(). Output: ${result}`, "call");

    animateEVMExecution([
      "PUSH1 0x04",
      "CALLDATALOAD",
      `SLOAD ; Load from storage slot`,
      "PUSH1 0x40",
      "MSTORE",
      "RETURN"
    ]);

  } else {
    // Write (Transact) requires gas cost computation
    const txGas = 21000 + Math.floor(Math.random() * 25000);
    const txCost = (txGas * gasPrice * 1e-9);

    if (activeBalance < txCost) {
      addConsoleLog("SYSTEM", "Write transaction REVERTED: Insufficient funds for gas.", "error");
      alert("Insufficient account balance to transact!");
      return;
    }

    activeBalance -= txCost;
    accountBalanceLabel.textContent = `${activeBalance.toFixed(4)} ETH`;

    // Process State updates inside VM Storage
    let revertTx = false;
    let revertReason = "";
    let stackOps = [];

    if (contract.type === "storage") {
      if (func.name === "store") {
        const val = parseInt(args[0]) || 0;
        contract.storage["storedData"].value = val;
        
        stackOps = [
          `PUSH1 ${val} ; input value`,
          "PUSH1 0x00 ; storage slot 0",
          "SSTORE ; store new value",
          `LOG1 ; emit StorageUpdated(${val})`
        ];
      }
    } else if (contract.type === "token") {
      if (func.name === "transfer") {
        const toAddress = args[0];
        const amount = parseInt(args[1]) || 0;

        if (!toAddress) {
          revertTx = true;
          revertReason = "Invalid recipient address";
        } else {
          // Check balances
          const currentSenderBal = contract.storage[`balances[${activeAccount}]`]?.value || 0;
          if (currentSenderBal < amount) {
            revertTx = true;
            revertReason = "Insufficient balance";
          } else {
            // Apply updates
            contract.storage[`balances[${activeAccount}]`].value -= amount;
            
            // Recipient slot setup
            const recSlotKey = `balances[${toAddress}]`;
            if (!contract.storage[recSlotKey]) {
              contract.storage[recSlotKey] = {
                slot: `keccak256(${toAddress} + Slot 3)`,
                type: "uint256",
                value: 0
              };
            }
            contract.storage[recSlotKey].value += amount;

            stackOps = [
              `PUSH1 ${amount} ; input amount`,
              `PUSH20 ${toAddress} ; recipient`,
              `CALLER ; loader msg.sender`,
              "SLOAD ; load sender balance",
              "SUB ; subtract amount",
              "SSTORE ; update sender slot",
              "SLOAD ; load recipient balance",
              "ADD ; add amount",
              "SSTORE ; update recipient slot",
              "LOG3 ; emit Transfer(msg.sender, recipient, amount)"
            ];
          }
        }
      }
    } else if (contract.type === "voting") {
      if (func.name === "vote") {
        const hasVotedKey = `hasVoted[${activeAccount}]`;
        if (contract.storage[hasVotedKey]?.value === true) {
          revertTx = true;
          revertReason = "Already voted";
        } else {
          contract.storage[hasVotedKey] = {
            slot: `keccak256(${activeAccount} + Slot 2)`,
            type: "bool",
            value: true
          };
          contract.storage["voteCount"].value += 1;

          stackOps = [
            `CALLER ; get msg.sender`,
            "SLOAD ; check hasVoted slot",
            "JUMPI ; revert if true",
            "PUSH1 0x01 ; value true",
            "SSTORE ; set hasVoted = true",
            "SLOAD ; load voteCount slot",
            "PUSH1 0x01 ; load 1",
            "ADD ; increment",
            "SSTORE ; store voteCount",
            "LOG1 ; emit Voted(voter)"
          ];
        }
      }
    } else if (contract.type === "crowdfund") {
      if (func.name === "contribute") {
        const ethVal = parseFloat(prompt("Enter amount of ETH to send with this payable transaction:", "5"));
        if (isNaN(ethVal) || ethVal <= 0) {
          revertTx = true;
          revertReason = "Invalid payable call value";
        } else if (contract.storage["isFinalized"].value === true) {
          revertTx = true;
          revertReason = "Fund already finalized";
        } else {
          // Adjust wallets
          if (activeBalance < ethVal) {
            revertTx = true;
            revertReason = "Insufficient wallet balance to contribute";
          } else {
            activeBalance -= ethVal;
            accountBalanceLabel.textContent = `${activeBalance.toFixed(4)} ETH`;

            contract.storage["totalRaised"].value += ethVal;
            
            const contSlotKey = `contributions[${activeAccount}]`;
            if (!contract.storage[contSlotKey]) {
              contract.storage[contSlotKey] = {
                slot: `keccak256(${activeAccount} + Slot 3)`,
                type: "uint256",
                value: 0
              };
            }
            contract.storage[contSlotKey].value += ethVal;

            stackOps = [
              "CALLVALUE ; load sent value",
              "SLOAD ; load totalRaised",
              "ADD ; add value",
              "SSTORE ; save totalRaised",
              "LOG2 ; emit ContributionReceived"
            ];
          }
        }
      } else if (func.name === "finalize") {
        const totalRaised = contract.storage["totalRaised"].value;
        const target = contract.storage["targetAmount"].value;
        if (totalRaised < target) {
          revertTx = true;
          revertReason = "Funding target amount not met";
        } else {
          contract.storage["isFinalized"].value = true;
          stackOps = [
            "SLOAD ; load totalRaised",
            "SLOAD ; load target",
            "LT ; check if less than",
            "JUMPI ; revert if true",
            "PUSH1 0x01 ; value true",
            "PUSH1 0x02 ; slot 2 (isFinalized)",
            "SSTORE ; update"
          ];
        }
      }
    }

    if (revertTx) {
      addConsoleLog("EVM (Transact)", `Transaction REVERTED: ${revertReason}`, "error");
      animateEVMExecution(["PUSH1 0x00", "DUP1", "REVERT ; " + revertReason]);
    } else {
      addConsoleLog("EVM (Transact)", `Executed state write ${func.name}() successfully.`, "transact", {
        "Transaction Hash": "0x" + sha256("tx" + Date.now()),
        "From Account": activeAccount,
        "Gas Consumed": `${txGas} units`,
        "Transaction Status": "0x1 (SUCCESS)"
      });
      animateEVMExecution(stackOps);
    }

    updateStorageSlotsTable(contract);
  }
}

// Display EVM Storage variables allocation
function updateStorageSlotsTable(contract) {
  storageSlotsTable.innerHTML = "";
  
  const header = document.createElement("div");
  header.className = "slots-header";
  header.innerHTML = `
    <div>Slot</div>
    <div>Variable</div>
    <div>Value</div>
  `;
  storageSlotsTable.appendChild(header);

  let hasData = false;
  for (let key in contract.storage) {
    const v = contract.storage[key];
    const row = document.createElement("div");
    row.className = "slots-row";
    
    // Show short addresses
    const formattedSlot = typeof v.slot === "number" ? `0x${v.slot.toString(16).padStart(2, '0')}` : v.slot.substring(0, 16) + "...";
    
    row.innerHTML = `
      <div class="slot-index font-mono" title="${v.slot}">${formattedSlot}</div>
      <div class="slot-var font-mono">${key}</div>
      <div class="slot-val font-mono">${v.value}</div>
    `;
    storageSlotsTable.appendChild(row);
    hasData = true;
  }

  if (!hasData) {
    storageSlotsTable.innerHTML = `<div class="empty-mempool-message">No active state storage variables initialized yet.</div>`;
  }
}

// Animate Virtual EVM stack inputs pushing and popping
function animateEVMExecution(opcodes) {
  evmStack.innerHTML = "";
  
  if (opcodes.length === 0) {
    evmStack.innerHTML = `<div class="stack-empty">Stack Empty (Awaiting instructions)</div>`;
    return;
  }

  let index = 0;
  const timer = setInterval(() => {
    if (index >= opcodes.length) {
      clearInterval(timer);
      return;
    }
    
    // Parse instruction pushes
    const op = opcodes[index];
    const node = document.createElement("div");
    node.className = "stack-node";
    node.innerHTML = `
      <span>${op}</span>
      <span class="stack-node-index">Stack [${evmStack.children.length}]</span>
    `;
    
    // Push on top
    evmStack.appendChild(node);
    evmStack.scrollTop = evmStack.scrollHeight;
    
    index++;
  }, 350);
}

// Standard helper functions - pure local SHA256 string hashing
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
  
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ""; 
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words[words.length] = ((asciiLength / 0x100000000) | 0);
  words[words.length] = (asciiLength | 0);
  
  var currentHash = hash.slice(0);
  
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

window.addEventListener("DOMContentLoaded", init);
