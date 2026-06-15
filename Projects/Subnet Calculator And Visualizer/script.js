/* Subnet Calculator & Visualizer - Core Logic */

document.addEventListener("DOMContentLoaded", () => {
  // --- State Variables ---
  let baseIpAddress = "192.168.1.0";
  let cidrPrefix = 24;
  let vlsmSubnets = [
    { id: 1, name: "Subnet A", hosts: 60 },
    { id: 2, name: "Subnet B", hosts: 28 },
    { id: 3, name: "Subnet C", hosts: 12 },
    { id: 4, name: "Subnet D", hosts: 2 }
  ];
  let allocations = [];
  let activeTab = "vlsm"; // vlsm, flsm

  // Quiz State
  let quizScore = 0;
  let quizTotal = 0;
  let currentQuizQuestion = null;

  // --- UI Elements Caching ---
  const selectCidr = document.getElementById("select-cidr");
  const inputIp = document.getElementById("input-ip");
  const ipErrorMsg = document.getElementById("ip-error-msg");
  const sliderCidr = document.getElementById("slider-cidr");
  const labelSliderCidr = document.getElementById("label-slider-cidr");
  const ipPresetSelect = document.getElementById("ip-preset");

  // Metrics elements
  const metricNetwork = document.getElementById("metric-network");
  const metricMask = document.getElementById("metric-mask");
  const metricFirstHost = document.getElementById("metric-first-host");
  const metricLastHost = document.getElementById("metric-last-host");
  const metricBroadcast = document.getElementById("metric-broadcast");
  const metricHosts = document.getElementById("metric-hosts");
  const metricTotalIps = document.getElementById("metric-total-ips");
  const metricScope = document.getElementById("metric-scope");
  const badgeIpClass = document.getElementById("badge-ip-class");

  // Binary elements
  const binaryBitContainer = document.getElementById("binary-bit-container");
  const binValIp = document.getElementById("bin-val-ip");
  const binValMask = document.getElementById("bin-val-mask");

  // Address map
  const addressMapContainer = document.getElementById("address-map-container");
  const mapPlaceholder = document.getElementById("map-placeholder");
  const mapScaleLabel = document.getElementById("map-scale-label");

  // Planner tabs
  const tabBtnVlsm = document.getElementById("tab-btn-vlsm");
  const tabBtnFlsm = document.getElementById("tab-btn-flsm");
  const plannerVlsmView = document.getElementById("planner-vlsm-view");
  const plannerFlsmView = document.getElementById("planner-flsm-view");

  // Planner controls
  const vlsmSubnetsContainer = document.getElementById("vlsm-subnets-container");
  const btnAddVlsmRow = document.getElementById("btn-add-vlsm-row");
  const btnResetVlsm = document.getElementById("btn-reset-vlsm");
  const btnSolveVlsm = document.getElementById("btn-solve-vlsm");

  const flsmSplitType = document.getElementById("flsm-split-type");
  const flsmSplitValue = document.getElementById("flsm-split-value");
  const labelFlsmSplitVal = document.getElementById("label-flsm-split-val");
  const btnSolveFlsm = document.getElementById("btn-solve-flsm");

  // Allocations panel
  const allocationsPanel = document.getElementById("allocations-panel");
  const tableAllocationsBody = document.querySelector("#table-allocations tbody");
  const allocationStats = document.getElementById("allocation-stats");
  const btnClearAllocations = document.getElementById("btn-clear-allocations");

  // Quiz elements
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

  // --- Initialise IPv4 Prefix Dropdown ---
  function initCidrDropdown() {
    selectCidr.innerHTML = "";
    for (let i = 0; i <= 32; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `/${i} (${longToIp(getCidrMask(i))})`;
      if (i === 24) opt.selected = true;
      selectCidr.appendChild(opt);
    }
  }

  // --- IPv4 Calculations Helpers ---
  function ipToLong(ip) {
    const parts = ip.split(".").map(Number);
    return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  }

  function longToIp(longVal) {
    return [
      (longVal >>> 24) & 255,
      (longVal >>> 16) & 255,
      (longVal >>> 8) & 255,
      longVal & 255
    ].join(".");
  }

  function isValidIp(ip) {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
  }

  function getCidrMask(prefix) {
    if (prefix === 0) return 0;
    return (~0 << (32 - prefix)) >>> 0;
  }

  function getIpClass(ip) {
    const firstOctet = parseInt(ip.split(".")[0], 10);
    if (isNaN(firstOctet)) return "C";
    if (firstOctet >= 1 && firstOctet <= 126) return "A";
    if (firstOctet >= 128 && firstOctet <= 191) return "B";
    if (firstOctet >= 192 && firstOctet <= 223) return "C";
    if (firstOctet >= 224 && firstOctet <= 239) return "D";
    return "E";
  }

  function getIpScope(ipLong) {
    // Check RFC 1918 Private Ranges
    const block10 = ipToLong("10.0.0.0");
    const block172 = ipToLong("172.16.0.0");
    const block192 = ipToLong("192.168.0.0");

    if (ipLong >= block10 && ipLong <= ipToLong("10.255.255.255")) {
      return "Private (RFC 1918)";
    }
    if (ipLong >= block172 && ipLong <= ipToLong("172.31.255.255")) {
      return "Private (RFC 1918)";
    }
    if (ipLong >= block192 && ipLong <= ipToLong("192.168.255.255")) {
      return "Private (RFC 1918)";
    }
    // Loopback
    if (ipLong >= ipToLong("127.0.0.0") && ipLong <= ipToLong("127.255.255.255")) {
      return "Local Loopback";
    }
    // Link Local
    if (ipLong >= ipToLong("169.254.0.0") && ipLong <= ipToLong("169.254.255.255")) {
      return "Link-Local Autoconfig";
    }
    // Documentation
    if (ipLong >= ipToLong("192.0.2.0") && ipLong <= ipToLong("192.0.2.255")) {
      return "Documentation (TEST-NET-1)";
    }
    return "Public Address Space";
  }

  // --- Dynamic Single Calculator Updates ---
  function updateSingleCalculator() {
    const rawIp = inputIp.value.trim();
    if (!isValidIp(rawIp)) {
      ipErrorMsg.classList.remove("hidden");
      return;
    }
    ipErrorMsg.classList.add("hidden");
    baseIpAddress = rawIp;

    const ipLong = ipToLong(baseIpAddress);
    const maskLong = getCidrMask(cidrPrefix);
    
    // Core Calculations
    const networkLong = (ipLong & maskLong) >>> 0;
    const broadcastLong = (networkLong | ~maskLong) >>> 0;
    
    let firstHostLong = 0;
    let lastHostLong = 0;
    let usableHosts = 0;

    if (cidrPrefix === 32) {
      firstHostLong = networkLong;
      lastHostLong = networkLong;
      usableHosts = 1;
    } else if (cidrPrefix === 31) {
      firstHostLong = networkLong;
      lastHostLong = broadcastLong;
      usableHosts = 2;
    } else {
      firstHostLong = networkLong + 1;
      lastHostLong = broadcastLong - 1;
      usableHosts = (broadcastLong - networkLong) - 1;
    }

    const totalIps = Math.pow(2, 32 - cidrPrefix);

    // Update Text Elements
    metricNetwork.textContent = longToIp(networkLong);
    metricMask.textContent = longToIp(maskLong);
    metricFirstHost.textContent = longToIp(firstHostLong);
    metricLastHost.textContent = longToIp(lastHostLong);
    metricBroadcast.textContent = longToIp(broadcastLong);
    metricHosts.textContent = usableHosts.toLocaleString();
    metricTotalIps.textContent = totalIps.toLocaleString();
    metricScope.textContent = getIpScope(ipLong);
    
    const ipClass = getIpClass(baseIpAddress);
    badgeIpClass.textContent = `Class ${ipClass}`;
    
    // Update Slider / Dropdown synchronization
    selectCidr.value = cidrPrefix;
    sliderCidr.value = cidrPrefix;
    labelSliderCidr.textContent = `/${cidrPrefix}`;
    mapScaleLabel.textContent = `Total Block: /${cidrPrefix} (${totalIps.toLocaleString()} IPs)`;

    // Update Graphics & tables
    renderBinaryBits(ipLong, maskLong);
    updateFlsmOptions();
  }

  // --- Render 32-Bit Binary boxes ---
  function renderBinaryBits(ipLong, maskLong) {
    binaryBitContainer.innerHTML = "";
    
    // Get class default boundaries to determine default Network bits
    const ipClass = getIpClass(baseIpAddress);
    let classBoundary = 24; // Default C
    if (ipClass === "A") classBoundary = 8;
    if (ipClass === "B") classBoundary = 16;
    if (ipClass === "D" || ipClass === "E") classBoundary = 32;

    const binIpStr = ipLong.toString(2).padStart(32, "0");
    const binMaskStr = maskLong.toString(2).padStart(32, "0");

    let binIpFormatted = [];
    let binMaskFormatted = [];

    for (let octet = 0; octet < 4; octet++) {
      const octetDiv = document.createElement("div");
      octetDiv.className = "octet-group";
      
      let ipOctet = "";
      let maskOctet = "";

      for (let bit = 0; bit < 8; bit++) {
        const bitIdx = octet * 8 + bit;
        const bitVal = binIpStr[bitIdx];
        
        ipOctet += bitVal;
        maskOctet += binMaskStr[bitIdx];

        const bitBox = document.createElement("div");
        bitBox.textContent = bitVal;
        
        // Define color classes
        if (bitIdx < classBoundary) {
          // Original network bits
          if (bitIdx < cidrPrefix) {
            bitBox.className = "bit-box net-bit";
          } else {
            bitBox.className = "bit-box host-bit";
          }
        } else {
          // Borrowed subnet bits
          if (bitIdx < cidrPrefix) {
            bitBox.className = "bit-box sub-bit";
          } else {
            bitBox.className = "bit-box host-bit";
          }
        }

        // Add visual click listener to shift CIDR bounds
        bitBox.style.cursor = "pointer";
        bitBox.title = `Bit position: ${bitIdx + 1}. Click to set prefix to /${bitIdx + 1}`;
        bitBox.addEventListener("click", () => {
          cidrPrefix = bitIdx + 1;
          updateSingleCalculator();
          if (allocations.length > 0) {
            if (activeTab === "vlsm") solveVLSM();
            else solveFLSM();
          }
        });

        octetDiv.appendChild(bitBox);
      }
      
      binaryBitContainer.appendChild(octetDiv);
      binIpFormatted.push(ipOctet);
      binMaskFormatted.push(maskOctet);
    }

    binValIp.textContent = binIpFormatted.join(".");
    binValMask.textContent = binMaskFormatted.join(".");
  }

  // --- Plan visual address space block representation ---
  function renderSubnetMap(totalBaseIps) {
    addressMapContainer.innerHTML = "";
    
    if (allocations.length === 0) {
      addressMapContainer.appendChild(mapPlaceholder);
      return;
    }

    // Sort allocations ascending by IP address to place sequentially
    const sortedAlloc = [...allocations].sort((a, b) => a.startLong - b.startLong);
    const baseStartLong = ipToLong(metricNetwork.textContent);

    let currentOffset = baseStartLong;

    sortedAlloc.forEach(subnet => {
      // Draw gap if there is unallocated space between pointer and subnet start
      if (subnet.startLong > currentOffset) {
        const gapSize = subnet.startLong - currentOffset;
        createMapBlock(gapSize, totalBaseIps, "Free Space", "free", currentOffset);
        currentOffset = subnet.startLong;
      }

      // Draw subnet block
      const subType = subnet.isWasted ? "wasted" : "allocated";
      createMapBlock(subnet.size, totalBaseIps, subnet.name, subType, subnet.startLong, subnet);
      currentOffset += subnet.size;
    });

    // Draw final free space gap if any
    const endBoundary = baseStartLong + totalBaseIps;
    if (currentOffset < endBoundary) {
      const remainingSize = endBoundary - currentOffset;
      createMapBlock(remainingSize, totalBaseIps, "Free Space", "free", currentOffset);
    }
  }

  function createMapBlock(size, totalBaseIps, label, type, startLong, subnet = null) {
    const block = document.createElement("div");
    block.className = `map-block ${type}`;
    
    const percentage = (size / totalBaseIps) * 100;
    block.style.width = `${percentage}%`;
    block.style.height = "100%";

    const ipRangeStr = `${longToIp(startLong)}/${32 - Math.log2(size)}`;

    // Build educational tooltip content
    let tooltip = `${label} (${size} IPs) | ${ipRangeStr}`;
    if (subnet && !subnet.isWasted) {
      tooltip += ` | Usable: ${subnet.usableRange} (${subnet.requested} hosts requested)`;
    }
    block.setAttribute("data-tooltip", tooltip);

    // Label sizing
    if (percentage > 8) {
      block.innerHTML = `<span style="font-weight:700;">${label}</span><span style="font-size:0.65rem; opacity:0.75;">/${32 - Math.log2(size)}</span>`;
    } else if (percentage > 3) {
      block.textContent = label;
    } else {
      block.textContent = "";
    }

    // Click block to inspect or highlight in calculator
    block.addEventListener("click", () => {
      if (subnet) {
        inputIp.value = longToIp(subnet.startLong);
        cidrPrefix = subnet.cidr;
        updateSingleCalculator();
      } else {
        inputIp.value = longToIp(startLong);
        cidrPrefix = 32 - Math.log2(size);
        updateSingleCalculator();
      }
    });

    addressMapContainer.appendChild(block);
  }

  // --- FLSM Splits Options Update ---
  function updateFlsmOptions() {
    const splitType = flsmSplitType.value;
    const currentSplitVal = flsmSplitValue.value;
    
    flsmSplitValue.innerHTML = "";
    const remainingBits = 32 - cidrPrefix;

    if (splitType === "subnets") {
      labelFlsmSplitVal.textContent = "Number of Subnets";
      // Populate subnets as powers of 2 (2, 4, 8, ... up to remaining bits or limit)
      const maxSubnetsBits = Math.min(remainingBits, 8); // Limit to 256 for browser rendering safety
      
      if (maxSubnetsBits <= 0) {
        flsmSplitValue.innerHTML = `<option value="0">Cannot split further (/32)</option>`;
        return;
      }

      for (let i = 1; i <= maxSubnetsBits; i++) {
        const count = Math.pow(2, i);
        const opt = document.createElement("option");
        opt.value = count;
        opt.textContent = `${count} Subnets (borrowing ${i} bit${i > 1 ? "s" : ""}, new prefix /${cidrPrefix + i})`;
        flsmSplitValue.appendChild(opt);
      }
    } else {
      labelFlsmSplitVal.textContent = "Usable Hosts per Subnet";
      // Populate host partitions
      // Need at least 2 host bits to have network/broadcast, except /31 and /32 which are special.
      if (remainingBits <= 2) {
        flsmSplitValue.innerHTML = `<option value="0">Cannot split further</option>`;
        return;
      }

      for (let h = remainingBits - 1; h >= 2; h--) {
        const usableHosts = Math.pow(2, h) - 2;
        const opt = document.createElement("option");
        opt.value = usableHosts;
        opt.textContent = `${usableHosts} usable hosts (block size: ${Math.pow(2, h)}, mask /${32 - h})`;
        flsmSplitValue.appendChild(opt);
      }
    }

    if (flsmSplitValue.querySelector(`option[value="${currentSplitVal}"]`)) {
      flsmSplitValue.value = currentSplitVal;
    }
  }

  // --- Tab Toggles ---
  tabBtnVlsm.addEventListener("click", () => {
    activeTab = "vlsm";
    tabBtnVlsm.classList.add("active");
    tabBtnFlsm.classList.remove("active");
    plannerVlsmView.classList.remove("hidden");
    plannerFlsmView.classList.add("hidden");
  });

  tabBtnFlsm.addEventListener("click", () => {
    activeTab = "flsm";
    tabBtnFlsm.classList.add("active");
    tabBtnVlsm.classList.remove("active");
    plannerFlsmView.classList.remove("hidden");
    plannerVlsmView.classList.add("hidden");
    updateFlsmOptions();
  });

  flsmSplitType.addEventListener("change", updateFlsmOptions);

  // --- Dynamic VLSM List Editor ---
  function renderVlsmSubnetsList() {
    vlsmSubnetsContainer.innerHTML = "";
    vlsmSubnets.forEach((sub, idx) => {
      const row = document.createElement("div");
      row.className = "subnet-row";
      
      row.innerHTML = `
        <input type="text" class="custom-input subnet-row-name" value="${sub.name}" placeholder="Subnet Name" data-id="${sub.id}">
        <input type="number" class="custom-input subnet-row-hosts" value="${sub.hosts}" placeholder="Hosts" min="1" max="16777214" data-id="${sub.id}">
        <button type="button" class="btn-delete-row" title="Delete subnet row" data-id="${sub.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      // Save input changes on change
      row.querySelector(".subnet-row-name").addEventListener("input", (e) => {
        sub.name = e.target.value;
      });

      row.querySelector(".subnet-row-hosts").addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        sub.hosts = isNaN(val) ? 0 : val;
      });

      row.querySelector(".btn-delete-row").addEventListener("click", () => {
        vlsmSubnets = vlsmSubnets.filter(s => s.id !== sub.id);
        renderVlsmSubnetsList();
      });

      vlsmSubnetsContainer.appendChild(row);
    });
  }

  btnAddVlsmRow.addEventListener("click", () => {
    const nextId = vlsmSubnets.length > 0 ? Math.max(...vlsmSubnets.map(s => s.id)) + 1 : 1;
    const nextChar = String.fromCharCode(65 + (vlsmSubnets.length % 26));
    vlsmSubnets.push({
      id: nextId,
      name: `Subnet ${nextChar}`,
      hosts: 10
    });
    renderVlsmSubnetsList();
  });

  btnResetVlsm.addEventListener("click", () => {
    vlsmSubnets = [
      { id: 1, name: "Subnet A", hosts: 60 },
      { id: 2, name: "Subnet B", hosts: 28 },
      { id: 3, name: "Subnet C", hosts: 12 },
      { id: 4, name: "Subnet D", hosts: 2 }
    ];
    renderVlsmSubnetsList();
  });

  // --- VLSM Allocation Solver Heuristics ---
  function solveVLSM() {
    const baseIpLong = ipToLong(metricNetwork.textContent);
    const totalBaseIps = Math.pow(2, 32 - cidrPrefix);
    const maxBoundary = baseIpLong + totalBaseIps;

    // 1. Process and validate inputs
    const validSubnets = vlsmSubnets
      .filter(s => s.name.trim() !== "" && s.hosts > 0)
      .map(s => ({
        name: s.name.trim(),
        requested: s.hosts
      }));

    if (validSubnets.length === 0) {
      alert("Please enter at least one valid subnet row with hosts > 0.");
      return;
    }

    // 2. Sort subnets DESCENDING by hosts requested (Greedy approach)
    validSubnets.sort((a, b) => b.requested - a.requested);

    allocations = [];
    let currentPointer = baseIpLong;
    let totalUsableAllocated = 0;
    let totalBlockAllocated = 0;
    let outOfSpace = false;

    // 3. Sequential greedy block allocation
    for (let i = 0; i < validSubnets.length; i++) {
      const sub = validSubnets[i];
      const neededHosts = sub.requested;
      
      // Calculate power-of-2 block size including Network & Broadcast bits
      const overheadHosts = neededHosts + 2;
      let powerOf2Size = 2;
      while (powerOf2Size < overheadHosts) {
        powerOf2Size *= 2;
      }
      
      // Subnet prefix length
      const subnetCidr = 32 - Math.log2(powerOf2Size);
      
      // Cisco Alignment Rule: Address pointer must align to a multiple of its size
      const misalignment = currentPointer % powerOf2Size;
      if (misalignment !== 0) {
        // Record wasted/fragmented space gap
        const gapSize = powerOf2Size - misalignment;
        if (currentPointer + gapSize <= maxBoundary) {
          allocations.push({
            name: "Fragmentation Gap",
            startLong: currentPointer,
            size: gapSize,
            cidr: 32 - Math.log2(gapSize),
            requested: 0,
            usableRange: "--",
            broadcast: longToIp(currentPointer + gapSize - 1),
            isWasted: true
          });
          totalBlockAllocated += gapSize;
          currentPointer += gapSize;
        }
      }

      // Check boundary limit
      if (currentPointer + powerOf2Size > maxBoundary) {
        outOfSpace = true;
        sub.failed = true;
        continue;
      }

      // Compute allocation details
      const netAddress = currentPointer;
      const maskLong = getCidrMask(subnetCidr);
      const broadcastLong = netAddress + powerOf2Size - 1;
      
      let rangeStr = "";
      if (subnetCidr === 32) {
        rangeStr = longToIp(netAddress);
      } else if (subnetCidr === 31) {
        rangeStr = `${longToIp(netAddress)} - ${longToIp(broadcastLong)}`;
      } else {
        rangeStr = `${longToIp(netAddress + 1)} - ${longToIp(broadcastLong - 1)}`;
      }

      allocations.push({
        name: sub.name,
        startLong: netAddress,
        size: powerOf2Size,
        cidr: subnetCidr,
        requested: neededHosts,
        usableRange: rangeStr,
        broadcast: longToIp(broadcastLong),
        isWasted: false
      });

      totalUsableAllocated += neededHosts;
      totalBlockAllocated += powerOf2Size;
      currentPointer += powerOf2Size;
    }

    renderAllocationsTable(totalBaseIps, totalBlockAllocated, totalUsableAllocated, outOfSpace);
  }

  // --- FLSM Split Solver ---
  function solveFLSM() {
    const baseIpLong = ipToLong(metricNetwork.textContent);
    const totalBaseIps = Math.pow(2, 32 - cidrPrefix);

    const splitType = flsmSplitType.value;
    const splitVal = parseInt(flsmSplitValue.value, 10);

    if (isNaN(splitVal) || splitVal <= 0) {
      alert("Invalid split configuration parameters.");
      return;
    }

    allocations = [];
    let numSubnets = 0;
    let subnetBlockSize = 0;

    if (splitType === "subnets") {
      numSubnets = splitVal;
      subnetBlockSize = totalBaseIps / numSubnets;
    } else {
      // splitVal represents hosts per subnet
      const neededHosts = splitVal + 2; // add network & broadcast
      subnetBlockSize = 2;
      while (subnetBlockSize < neededHosts) {
        subnetBlockSize *= 2;
      }
      numSubnets = totalBaseIps / subnetBlockSize;
    }

    const subnetCidr = 32 - Math.log2(subnetBlockSize);
    let totalUsableAllocated = 0;
    let totalBlockAllocated = 0;

    for (let i = 0; i < numSubnets; i++) {
      const netAddress = baseIpLong + (i * subnetBlockSize);
      const broadcastLong = netAddress + subnetBlockSize - 1;
      
      const usableHosts = subnetBlockSize - 2;
      let rangeStr = `${longToIp(netAddress + 1)} - ${longToIp(broadcastLong - 1)}`;
      if (subnetCidr === 32) rangeStr = longToIp(netAddress);
      if (subnetCidr === 31) rangeStr = `${longToIp(netAddress)} - ${longToIp(broadcastLong)}`;

      allocations.push({
        name: `Subnet #${i + 1}`,
        startLong: netAddress,
        size: subnetBlockSize,
        cidr: subnetCidr,
        requested: usableHosts,
        usableRange: rangeStr,
        broadcast: longToIp(broadcastLong),
        isWasted: false
      });

      totalUsableAllocated += usableHosts;
      totalBlockAllocated += subnetBlockSize;
    }

    renderAllocationsTable(totalBaseIps, totalBlockAllocated, totalUsableAllocated, false);
  }

  // --- Render Allocations Results ---
  function renderAllocationsTable(totalBaseIps, totalBlockAllocated, totalUsableAllocated, outOfSpace) {
    tableAllocationsBody.innerHTML = "";
    allocationsPanel.classList.remove("hidden");

    if (allocations.length === 0) {
      tableAllocationsBody.innerHTML = `<tr><td colspan="7" class="text-center">No allocations compiled.</td></tr>`;
      return;
    }

    // Populate table rows
    allocations.forEach(subnet => {
      const tr = document.createElement("tr");
      if (subnet.isWasted) {
        tr.style.opacity = 0.5;
      }

      tr.innerHTML = `
        <td class="font-bold text-cyan">${subnet.name}</td>
        <td>${longToIp(subnet.startLong)}</td>
        <td>${subnet.usableRange}</td>
        <td>${subnet.broadcast}</td>
        <td>/${subnet.cidr}</td>
        <td>${subnet.isWasted ? "None" : `${subnet.requested} / ${subnet.size - 2}`}</td>
        <td>${subnet.isWasted ? subnet.size : (subnet.size - 2 - subnet.requested)}</td>
      `;

      tableAllocationsBody.appendChild(tr);
    });

    // Compute metrics stats
    const efficiency = totalBlockAllocated > 0 ? ((totalUsableAllocated / totalBlockAllocated) * 100).toFixed(1) : 0;
    const wasteIps = totalBlockAllocated - totalUsableAllocated;
    const freeIps = totalBaseIps - totalBlockAllocated;

    let statsHtml = `
      Base Pool Capacity: <b>${totalBaseIps.toLocaleString()} IPs</b> | 
      Allocated Block: <b>${totalBlockAllocated.toLocaleString()} IPs</b> (${((totalBlockAllocated / totalBaseIps) * 100).toFixed(1)}%) | 
      Usable Hosts Assigned: <b>${totalUsableAllocated.toLocaleString()}</b> <br>
      Allocation Efficiency: <b>${efficiency}%</b> | 
      Wasted Addresses: <span class="text-cyan">${wasteIps.toLocaleString()} IPs</span> | 
      Free Pool Remaining: <b>${freeIps.toLocaleString()} IPs</b>
    `;

    if (outOfSpace) {
      statsHtml += `<div class="input-error-hint mt-12" style="font-weight:bold;">[WARNING] Address capacity exceeded. Some requested subnets could not be allocated.</div>`;
    }

    allocationStats.innerHTML = statsHtml;

    // Render graphic treemap
    renderSubnetMap(totalBaseIps);
  }

  btnClearAllocations.addEventListener("click", () => {
    allocations = [];
    allocationsPanel.classList.add("hidden");
    renderSubnetMap(Math.pow(2, 32 - cidrPrefix));
  });

  btnSolveVlsm.addEventListener("click", solveVLSM);
  btnSolveFlsm.addEventListener("click", solveFLSM);

  // --- Quiz Engine & Training Simulator ---
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

    // Generate random question parameters
    currentQuizQuestion = generateRandomQuizQuestion();

    // Render Question
    quizQuestionText.innerHTML = currentQuizQuestion.text;
    quizOptionsContainer.innerHTML = "";

    // Render Choice buttons
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
      quizFeedbackText.textContent = "Correct! Well calculated.";
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
    const questionTypes = ["network", "broadcast", "hosts", "mask"];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    // Generate a random subnet prefix between 18 and 30
    const prefix = Math.floor(Math.random() * 12) + 18; 
    const blockSize = Math.pow(2, 32 - prefix);

    // Generate random octets
    const oct1 = Math.floor(Math.random() * 220) + 1; // Class A, B or C
    const oct2 = Math.floor(Math.random() * 255);
    const oct3 = Math.floor(Math.random() * 255);
    // Align base network oct4 to increments of block size if we want a clean boundary,
    // or generate a random offset to force the user to find the parent subnet start.
    const multiplier = Math.floor(Math.random() * (256 / Math.min(256, blockSize)));
    const blockStartOctet4 = multiplier * Math.min(256, blockSize);
    const offsetOctet4 = Math.floor(Math.random() * Math.min(256, blockSize));
    const finalOct4 = blockStartOctet4 + offsetOctet4;

    const baseIp = `${oct1}.${oct2}.${oct3}.${blockStartOctet4}`;
    const targetIp = `${oct1}.${oct2}.${oct3}.${finalOct4}`;

    // Solve parameters
    const ipLong = ipToLong(targetIp);
    const maskLong = getCidrMask(prefix);
    const networkLong = (ipLong & maskLong) >>> 0;
    const broadcastLong = (networkLong | ~maskLong) >>> 0;
    const usableHosts = (prefix === 31 || prefix === 32) ? Math.pow(2, 32 - prefix) : Math.pow(2, 32 - prefix) - 2;

    let text = "";
    let correct = "";
    let options = [];
    let explanation = "";

    switch (type) {
      case "network":
        text = `What is the <b>Network Address</b> for the subnet containing IP <b>${targetIp}/${prefix}</b>?`;
        correct = longToIp(networkLong);
        options = [
          correct,
          longToIp(networkLong + Math.min(256, blockSize)),
          longToIp((networkLong - Math.min(256, blockSize) >= 0 ? networkLong - Math.min(256, blockSize) : networkLong)),
          longToIp(networkLong + 1)
        ];
        explanation = `The netmask is ${longToIp(maskLong)}. Performing a logical bitwise AND yields ${correct}.`;
        break;

      case "broadcast":
        text = `What is the <b>Broadcast Address</b> for the subnet containing IP <b>${targetIp}/${prefix}</b>?`;
        correct = longToIp(broadcastLong);
        options = [
          correct,
          longToIp(broadcastLong - 1),
          longToIp(broadcastLong + Math.min(256, blockSize)),
          longToIp(networkLong)
        ];
        explanation = `The network address is ${longToIp(networkLong)} and block size is ${blockSize}. Thus broadcast is ${correct}.`;
        break;

      case "hosts":
        text = `How many <b>usable hosts</b> can a subnet with prefix <b>/${prefix}</b> support?`;
        correct = usableHosts.toLocaleString();
        options = [
          correct,
          (usableHosts + 2).toLocaleString(), // 2^h
          (usableHosts - 2 > 0 ? usableHosts - 2 : usableHosts + 4).toLocaleString(),
          (usableHosts * 2).toLocaleString()
        ];
        explanation = `Formula: 2^(32 - prefix) - 2 (subtract network & broadcast). 2^(${32 - prefix}) - 2 = ${correct}.`;
        break;

      case "mask":
        text = `What is the standard decimal <b>Subnet Mask</b> for prefix <b>/${prefix}</b>?`;
        correct = longToIp(maskLong);
        options = [
          correct,
          longToIp(getCidrMask(prefix - 1)),
          longToIp(getCidrMask(prefix + 1)),
          `255.255.255.${Math.max(0, 256 - blockSize - 1)}`
        ];
        explanation = `A /${prefix} network has ${prefix} sequential bits set to 1, representing netmask ${correct}.`;
        break;
    }

    // Deduplicate choices
    options = [...new Set(options)];
    while (options.length < 4) {
      // Fallback filler option
      const filler = `${oct1}.${oct2}.${oct3}.${Math.floor(Math.random() * 255)}`;
      if (!options.includes(filler)) options.push(filler);
    }

    // Shuffle options array
    options.sort(() => Math.random() - 0.5);

    return { text, correct, options, explanation };
  }

  // --- Preset Dropdown handler ---
  ipPresetSelect.addEventListener("change", () => {
    const val = ipPresetSelect.value;
    const parts = val.split("/");
    inputIp.value = parts[0];
    cidrPrefix = parseInt(parts[1], 10);
    
    updateSingleCalculator();
    if (allocations.length > 0) {
      if (activeTab === "vlsm") solveVLSM();
      else solveFLSM();
    }
  });

  // --- Input event binds ---
  inputIp.addEventListener("input", () => {
    updateSingleCalculator();
  });

  selectCidr.addEventListener("change", (e) => {
    cidrPrefix = parseInt(e.target.value, 10);
    updateSingleCalculator();
  });

  sliderCidr.addEventListener("input", (e) => {
    cidrPrefix = parseInt(e.target.value, 10);
    updateSingleCalculator();
  });

  // --- Kickstart ---
  initCidrDropdown();
  updateSingleCalculator();
  renderVlsmSubnetsList();
});
