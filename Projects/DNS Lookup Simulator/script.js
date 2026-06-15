/**
 * DNS Lookup Simulator - Script Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DNS Zone Databases Data ---
  const ZONE_ROOT = [
    { name: ".", type: "NS", value: "ns1.tld-com.net" },
    { name: ".", type: "NS", value: "ns1.tld-org.org" },
    { name: ".", type: "NS", value: "ns1.tld-uk.co.uk" },
    { name: "ns1.tld-com.net", type: "A", value: "192.5.6.30" },
    { name: "ns1.tld-org.org", type: "A", value: "192.5.6.40" },
    { name: "ns1.tld-uk.co.uk", type: "A", value: "192.5.6.50" }
  ];

  const ZONE_TLD = {
    "com": [
      { name: "google.com.", type: "NS", value: "ns1.google.com" },
      { name: "github.com.", type: "NS", value: "ns1.github.net" },
      { name: "yahoo.com.", type: "NS", value: "ns1.yahoo.com" },
      { name: "ns1.google.com", type: "A", value: "216.239.32.10" },
      { name: "ns1.github.net", type: "A", value: "207.97.224.2" },
      { name: "ns1.yahoo.com", type: "A", value: "68.180.131.16" }
    ],
    "org": [
      { name: "wikipedia.org.", type: "NS", value: "ns1.wikimedia.org" },
      { name: "ns1.wikimedia.org", type: "A", value: "208.80.154.238" }
    ],
    "uk": [
      { name: "yahoo.co.uk.", type: "NS", value: "ns1.yahoo-uk.co.uk" },
      { name: "ns1.yahoo-uk.co.uk", type: "A", value: "124.108.243.20" }
    ]
  };

  const ZONE_AUTH = {
    "google.com": [
      { name: "google.com.", type: "A", value: "142.250.190.46", ttl: 60 },
      { name: "www.google.com.", type: "A", value: "142.250.190.46", ttl: 60 },
      { name: "google.com.", type: "AAAA", value: "2607:f8b0:4005:802::200e", ttl: 80 },
      { name: "google.com.", type: "MX", value: "10 mail.google.com.", ttl: 120 },
      { name: "mail.google.com.", type: "A", value: "142.250.190.50", ttl: 60 },
      { name: "google.com.", type: "NS", value: "ns1.google.com.", ttl: 300 }
    ],
    "github.io": [
      { name: "blog.github.io.", type: "CNAME", value: "github.github.io.", ttl: 90 },
      { name: "github.github.io.", type: "A", value: "185.199.108.153", ttl: 60 }
    ],
    "github.com": [
      { name: "github.com.", type: "A", value: "140.82.121.4", ttl: 60 },
      { name: "github.com.", type: "AAAA", value: "2001:4860:4860::8888", ttl: 60 }
    ],
    "yahoo.co.uk": [
      { name: "yahoo.co.uk.", type: "A", value: "98.137.11.163", ttl: 60 },
      { name: "mail.yahoo.co.uk.", type: "MX", value: "10 mta.yahoo.co.uk.", ttl: 120 },
      { name: "mta.yahoo.co.uk.", type: "A", value: "98.137.11.200", ttl: 60 }
    ],
    "wikipedia.org": [
      { name: "wikipedia.org.", type: "A", value: "208.80.154.224", ttl: 80 },
      { name: "www.wikipedia.org.", type: "A", value: "208.80.154.224", ttl: 80 },
      { name: "wikipedia.org.", type: "TXT", value: "\"v=spf1 include:wikimedia.org ~all\"", ttl: 150 }
    ]
  };

  // --- DNS Cache Memory Tables (Dynamic TTL count downs) ---
  let browserCache = [
    { domain: "localhost", type: "A", value: "127.0.0.1", ttl: 300, initialTtl: 300 }
  ];
  let osCache = [
    { domain: "myrouter.local", type: "A", value: "192.168.1.1", ttl: 600, initialTtl: 600 }
  ];
  let resolverCache = [
    { domain: "ns1.tld-com.net", type: "A", value: "192.5.6.30", ttl: 1200, initialTtl: 1200 }
  ];

  // --- Simulation State Variables ---
  let queryDomain = "google.com";
  let queryType = "A";
  let queryMode = "recursive";
  
  let simStep = 0;
  const MAX_STEPS = 8;
  
  let historyStack = [];
  let logHistory = [];
  
  let playbackIntervalId = null;
  let playbackSpeed = 1500; // ms

  // Resolution output variables
  let finalResolvedRecord = null;
  let resolvedFrom = "None"; // Browser Cache, OS Cache, Resolver Cache, Authority
  let hopsCount = 0;
  let simulatedLatency = 0;

  // Active nameservers IP/Names parsed dynamically during step paths
  let activeTldName = "com";
  let activeTldIp = "192.5.6.30";
  let activeAuthName = "google.com";
  let activeAuthIp = "216.239.32.10";

  // --- UI Elements ---
  const domainPresetSelect = document.getElementById("domain-preset");
  const queryDomainInput = document.getElementById("query-domain");
  const queryTypeSelect = document.getElementById("query-type");
  const queryModeSelect = document.getElementById("query-mode");
  const btnResolveDns = document.getElementById("btn-resolve-dns");

  const btnPrevStep = document.getElementById("btn-prev-step");
  const btnTogglePlay = document.getElementById("btn-toggle-play");
  const btnNextStep = document.getElementById("btn-next-step");
  const btnReset = document.getElementById("btn-reset");
  const simSpeedSlider = document.getElementById("sim-speed");
  const speedValueLabel = document.getElementById("speed-value");

  const statHops = document.getElementById("stat-hops");
  const statCacheHit = document.getElementById("stat-cache-hit");
  const statLatency = document.getElementById("stat-latency");

  const dnsMap = document.getElementById("dns-map");
  const linesSvg = document.getElementById("lines-svg");
  const nodeClient = document.getElementById("node-client");
  const nodeResolver = document.getElementById("node-resolver");
  const nodeRoot = document.getElementById("node-root");
  const nodeTld = document.getElementById("node-tld");
  const nodeAuth = document.getElementById("node-auth");
  const tldLabel = document.getElementById("tld-label");
  const tldIpLabel = document.getElementById("tld-ip");
  const authLabel = document.getElementById("auth-label");
  const authIpLabel = document.getElementById("auth-ip");
  const dnsPacket = document.getElementById("dns-packet");

  const cacheTabBtns = document.querySelectorAll(".cache-tab-btn");
  const cacheTabContents = document.querySelectorAll(".cache-tab-content");
  const dbTabBtns = document.querySelectorAll(".db-tab-btn");
  const dbTabContents = document.querySelectorAll(".db-tab-content");

  const logConsole = document.getElementById("log-console");
  const btnClearLogs = document.getElementById("btn-clear-logs");

  // --- Cache Tables ---
  const tableCacheBrowser = document.querySelector("#table-cache-browser tbody");
  const tableCacheOs = document.querySelector("#table-cache-os tbody");
  const tableCacheResolver = document.querySelector("#table-cache-resolver tbody");

  // --- Zone Tables ---
  const tableDbRoot = document.querySelector("#table-db-root tbody");
  const tableDbTld = document.querySelector("#table-db-tld tbody");
  const tableDbAuth = document.querySelector("#table-db-auth tbody");

  // --- Initialisation ---
  function initSimulator() {
    stopPlayback();
    simStep = 0;
    stepHistory = [];
    logConsole.innerHTML = "";
    
    queryDomain = queryDomainInput.value.trim().toLowerCase();
    queryType = queryTypeSelect.value;
    queryMode = queryModeSelect.value;

    // Parse TLD suffix (e.g. google.com -> com, yahoo.co.uk -> uk)
    activeTldName = getTldSuffix(queryDomain);
    const tldInfo = getTldServerDetails(activeTldName);
    activeTldIp = tldInfo.ip;
    
    // Parse Auth Domain (e.g. google.com -> google.com, blog.github.io -> github.io)
    activeAuthName = getAuthDomain(queryDomain);
    activeAuthIp = getAuthServerIp(activeAuthName);

    // Update Server Labels in Tree
    tldLabel.textContent = `TLD (.${activeTldName})`;
    tldIpLabel.textContent = activeTldIp;
    authLabel.textContent = `Auth (${activeAuthName})`;
    authIpLabel.textContent = activeAuthIp;

    // Analytics Reset
    statHops.textContent = "0";
    statCacheHit.textContent = "MISS";
    statLatency.textContent = "0 ms";

    dnsPacket.classList.add("hidden");
    resetNodeHighlights();
    renderAll();
    drawConnectionLines();
    updatePlaybackControls();

    addLog("DNS Lookup Simulator initialized. Configure record query and press 'Resolve'.", "system");
  }

  // --- Get domain details helper ---
  function getTldSuffix(domain) {
    if (domain.endsWith(".co.uk")) return "uk";
    const parts = domain.split(".");
    return parts[parts.length - 1] || "com";
  }

  function getTldServerDetails(tld) {
    if (tld === "org") return { name: "ns1.tld-org.org", ip: "192.5.6.40" };
    if (tld === "uk") return { name: "ns1.tld-uk.co.uk", ip: "192.5.6.50" };
    return { name: "ns1.tld-com.net", ip: "192.5.6.30" };
  }

  function getAuthDomain(domain) {
    if (domain.endsWith(".co.uk")) {
      const parts = domain.split(".");
      return parts.slice(parts.length - 3).join(".");
    }
    const parts = domain.split(".");
    if (parts.length >= 2) {
      return parts.slice(parts.length - 2).join(".");
    }
    return domain;
  }

  function getAuthServerIp(authDomain) {
    if (authDomain === "github.io" || authDomain === "github.com") return "207.97.224.2";
    if (authDomain === "wikipedia.org") return "208.80.154.238";
    if (authDomain === "yahoo.co.uk") return "124.108.243.20";
    return "216.239.32.10"; // Default Google
  }

  // --- Cache Lookups ---
  function checkCacheHit(domain, type) {
    // 1. Browser Cache
    let idx = browserCache.findIndex(e => e.domain === domain && e.type === type);
    if (idx !== -1) return { layer: "Browser Cache", record: browserCache[idx], latency: 1 };

    // 2. OS Cache
    idx = osCache.findIndex(e => e.domain === domain && e.type === type);
    if (idx !== -1) return { layer: "OS System Cache", record: osCache[idx], latency: 10 };

    // 3. Resolver Cache
    idx = resolverCache.findIndex(e => e.domain === domain && e.type === type);
    if (idx !== -1) return { layer: "ISP Resolver Cache", record: resolverCache[idx], latency: 50 };

    return null;
  }

  // --- DNS Database Search ---
  function fetchAuthoritativeRecord(domain, type) {
    const zoneName = getAuthDomain(domain);
    const records = ZONE_AUTH[zoneName] || [];
    
    // Exact or wildcard domain search
    let match = records.find(r => (r.name === domain || r.name === domain + ".") && r.type === type);
    
    if (!match && type === "CNAME") {
      // Return A or AAAA if CNAME requested and CNAME points somewhere?
      // Typically CNAME maps domain to alias
    }

    if (!match && type === "A") {
      // Look if domain maps to CNAME first
      const cnameMatch = records.find(r => (r.name === domain || r.name === domain + ".") && r.type === "CNAME");
      if (cnameMatch) {
        // We found a CNAME. Search A record for that canonical alias!
        const alias = cnameMatch.value;
        const aliasZone = getAuthDomain(alias);
        const aliasRecords = ZONE_AUTH[aliasZone] || [];
        const aliasMatch = aliasRecords.find(r => (r.name === alias || r.name === alias + ".") && r.type === "A");
        if (aliasMatch) {
          // Return compound detail
          return { cname: cnameMatch, target: aliasMatch };
        }
        return { cname: cnameMatch };
      }
    }

    return match ? { target: match } : null;
  }

  // --- Start Query Resolution Process ---
  function startQueryResolution() {
    initSimulator();

    // Verify domain syntax
    if (!queryDomain || !queryDomain.includes(".")) {
      alert("Please enter a valid domain name (e.g. google.com).");
      return;
    }

    // Step 0: Check Local Cache Hits
    addLog(`Initiating lookup for domain: <b>${queryDomain}</b> (Record Type: ${queryType})`, "client");
    
    const hit = checkCacheHit(queryDomain, queryType);
    if (hit) {
      // Cache Hit! Resolution instantly completes
      finalResolvedRecord = hit.record;
      resolvedFrom = hit.layer;
      hopsCount = hit.layer === "ISP Resolver Cache" ? 1 : 0;
      simulatedLatency = hit.latency;

      statHops.textContent = hopsCount.toString();
      statCacheHit.textContent = "HIT";
      statLatency.textContent = `${simulatedLatency} ms`;

      highlightNode("node-client");
      if (hopsCount === 1) {
        highlightNode("node-resolver");
        // Animate packet Client <-> Resolver
        animatePacketPath("node-client", "node-resolver", () => {
          animatePacketPath("node-resolver", "node-client");
        });
      }

      addLog(`<b>Cache Hit!</b> Mapped entry found in <b>${resolvedFrom}</b>.`, "success");
      addLog(`Resolved: <b>${queryDomain}</b> &rarr; <b>${finalResolvedRecord.value}</b> (TTL Remaining: ${finalResolvedRecord.ttl}s)`, "success");
      
      // Flash table row highlight
      highlightCacheTableRow(resolvedFrom, queryDomain);
      
      btnPrevStep.disabled = true;
      btnNextStep.disabled = true;
      return;
    }

    // Cache Miss. Must proceed up the tree
    addLog(`Cache Miss at local Client layers. Delegating query to Local DNS Resolver...`, "warning");
    executeStep(1);
  }

  // --- Step Timeline Executor ---
  function executeStep(stepIndex) {
    saveStepSnapshot();
    simStep = stepIndex;

    // Reset animations & highlights
    resetNodeHighlights();
    dnsPacket.classList.remove("hidden");

    // Dynamic map steps
    switch (stepIndex) {
      case 1:
        // Client -> Resolver
        highlightNode("node-client");
        highlightNode("node-resolver");
        animatePacketPath("node-client", "node-resolver");
        
        hopsCount = 1;
        simulatedLatency = 50;
        statHops.textContent = hopsCount.toString();
        statLatency.textContent = `${simulatedLatency} ms`;
        
        addLog("Query packet transmitted from Client Browser/OS &rarr; Local Resolver.", "client");
        break;

      case 2:
        // Resolver -> Root
        highlightNode("node-resolver");
        highlightNode("node-root");
        animatePacketPath("node-resolver", "node-root");
        
        hopsCount = 2;
        simulatedLatency = 120;
        statHops.textContent = hopsCount.toString();
        statLatency.textContent = `${simulatedLatency} ms`;

        addLog("Local Resolver queries Root Nameserver (.) for TLD pointers.", "resolver");
        break;

      case 3:
        // Root -> Resolver (Referral)
        highlightNode("node-root");
        highlightNode("node-resolver");
        animatePacketPath("node-root", "node-resolver");
        
        hopsCount = 2;
        simulatedLatency = 150;
        statLatency.textContent = `${simulatedLatency} ms`;

        addLog(`Root nameserver returns referral: pointing to TLD (.${activeTldName}) server at IP ${activeTldIp}.`, "root");
        break;

      case 4:
        // Resolver -> TLD
        highlightNode("node-resolver");
        highlightNode("node-tld");
        animatePacketPath("node-resolver", "node-tld");
        
        hopsCount = 3;
        simulatedLatency = 220;
        statHops.textContent = hopsCount.toString();
        statLatency.textContent = `${simulatedLatency} ms`;

        addLog(`Local Resolver queries TLD (.${activeTldName}) Server for Authoritative pointers.`, "resolver");
        break;

      case 5:
        // TLD -> Resolver (Referral)
        highlightNode("node-tld");
        highlightNode("node-resolver");
        animatePacketPath("node-tld", "node-resolver");
        
        hopsCount = 3;
        simulatedLatency = 250;
        statLatency.textContent = `${simulatedLatency} ms`;

        addLog(`TLD nameserver returns referral: pointing to Authoritative DNS zones for <b>${activeAuthName}</b> at IP ${activeAuthIp}.`, "tld");
        break;

      case 6:
        // Resolver -> Auth
        highlightNode("node-resolver");
        highlightNode("node-auth");
        animatePacketPath("node-resolver", "node-auth");
        
        hopsCount = 4;
        simulatedLatency = 320;
        statHops.textContent = hopsCount.toString();
        statLatency.textContent = `${simulatedLatency} ms`;

        addLog(`Local Resolver queries Authoritative Nameserver (${activeAuthName}) directly.`, "resolver");
        break;

      case 7:
        // Auth -> Resolver (Answer)
        highlightNode("node-auth");
        highlightNode("node-resolver");
        animatePacketPath("node-auth", "node-resolver");
        
        hopsCount = 4;
        simulatedLatency = 350;
        statLatency.textContent = `${simulatedLatency} ms`;

        // Retrieve target from Auth Zone DB
        const matchResult = fetchAuthoritativeRecord(queryDomain, queryType);
        if (matchResult) {
          if (matchResult.cname && matchResult.target) {
            finalResolvedRecord = matchResult.target;
            addLog(`Authoritative Server returns CNAME mapping pointing to canonical A record: <b>${matchResult.cname.value}</b> &rarr; IP <b>${matchResult.target.value}</b>.`, "auth");
            
            // Cache both CNAME and A record!
            cacheRecord(matchResult.cname);
            cacheRecord(matchResult.target);
          } else if (matchResult.cname) {
            finalResolvedRecord = matchResult.cname;
            addLog(`Authoritative Server returns CNAME alias mapping: <b>${queryDomain}</b> &rarr; <b>${matchResult.cname.value}</b>.`, "auth");
            cacheRecord(matchResult.cname);
          } else {
            finalResolvedRecord = matchResult.target;
            addLog(`Authoritative Server returns final resource record: <b>${queryDomain}</b> &rarr; <b>${finalResolvedRecord.value}</b>.`, "auth");
            cacheRecord(finalResolvedRecord);
          }
        } else {
          // NXDOMAIN
          finalResolvedRecord = { domain: queryDomain, type: queryType, value: "NXDOMAIN (Host Not Found)", ttl: 15 };
          addLog(`Authoritative Server reports: <b>NXDOMAIN</b> (Record not found in zone files).`, "error");
        }
        break;

      case 8:
        // Resolver -> Client
        highlightNode("node-resolver");
        highlightNode("node-client");
        animatePacketPath("node-resolver", "node-client", () => {
          dnsPacket.classList.add("hidden");
        });
        
        hopsCount = 4;
        simulatedLatency = 360;
        statLatency.textContent = `${simulatedLatency} ms`;

        addLog(`Local Resolver delivers Answer packet to Client Browser/OS. Mappings added to Browser/OS cache registries.`, "success");
        addLog(`<b>DNS Resolution Completed!</b> Resolved: <b>${queryDomain}</b> &rarr; <b>${finalResolvedRecord.value}</b>`, "success");
        
        renderAll();
        break;
    }

    updatePlaybackControls();
  }

  function saveStepSnapshot() {
    stepHistory.push({
      simStep: simStep,
      browserCache: JSON.parse(JSON.stringify(browserCache)),
      osCache: JSON.parse(JSON.stringify(osCache)),
      resolverCache: JSON.parse(JSON.stringify(resolverCache)),
      statHops: statHops.textContent,
      statCacheHit: statCacheHit.textContent,
      statLatency: statLatency.textContent,
      logs: logConsole.innerHTML,
      finalResolvedRecord: finalResolvedRecord ? { ...finalResolvedRecord } : null
    });
  }

  function stepBackward() {
    if (stepHistory.length === 0) return;
    
    stopPlayback();
    const snapshot = stepHistory.pop();

    simStep = snapshot.simStep;
    browserCache = snapshot.browserCache;
    osCache = snapshot.osCache;
    resolverCache = snapshot.resolverCache;
    statHops.textContent = snapshot.statHops;
    statCacheHit.textContent = snapshot.statCacheHit;
    statLatency.textContent = snapshot.statLatency;
    finalResolvedRecord = snapshot.finalResolvedRecord;
    
    logConsole.innerHTML = snapshot.logs;
    logConsole.scrollTop = logConsole.scrollHeight;

    resetNodeHighlights();
    positionPacketOnMap(simStep);
    renderAll();
    updatePlaybackControls();
  }

  // --- Caching Database Operations ---
  function cacheRecord(record) {
    const domainName = record.name.replace(/\.$/, ""); // remove trailing dot for uniform keys
    
    // 1. Cache in Local Resolver Cache
    resolverCache.push({
      domain: domainName,
      type: record.type,
      value: record.value,
      ttl: record.ttl || 60,
      initialTtl: record.ttl || 60
    });

    // 2. Cache in OS Cache
    osCache.push({
      domain: domainName,
      type: record.type,
      value: record.value,
      ttl: Math.floor((record.ttl || 60) * 0.8), // OS cache lifespan slightly shorter
      initialTtl: Math.floor((record.ttl || 60) * 0.8)
    });

    // 3. Cache in Browser Cache
    browserCache.push({
      domain: domainName,
      type: record.type,
      value: record.value,
      ttl: Math.floor((record.ttl || 60) * 0.5), // Browser cache shortest lifespan
      initialTtl: Math.floor((record.ttl || 60) * 0.5)
    });
  }

  // --- Timer Tick decrements TTL ---
  function startTtlTimer() {
    setInterval(() => {
      let cacheEviction = false;

      // 1. Browser Cache
      browserCache.forEach(e => {
        if (e.ttl > 0) e.ttl--;
      });
      const bCountBefore = browserCache.length;
      browserCache = browserCache.filter(e => {
        if (e.ttl <= 0) {
          addLog(`[Cache Eviction] Browser cache entry for <b>${e.domain}</b> (${e.type}) expired.`, "system");
          cacheEviction = true;
          return false;
        }
        return true;
      });

      // 2. OS Cache
      osCache.forEach(e => {
        if (e.ttl > 0) e.ttl--;
      });
      osCache = osCache.filter(e => {
        if (e.ttl <= 0) {
          addLog(`[Cache Eviction] OS hosts cache entry for <b>${e.domain}</b> (${e.type}) expired.`, "system");
          cacheEviction = true;
          return false;
        }
        return true;
      });

      // 3. Resolver Cache
      resolverCache.forEach(e => {
        if (e.ttl > 0) e.ttl--;
      });
      resolverCache = resolverCache.filter(e => {
        if (e.ttl <= 0) {
          addLog(`[Cache Eviction] ISP Resolver cache entry for <b>${e.domain}</b> (${e.type}) expired.`, "system");
          cacheEviction = true;
          return false;
        }
        return true;
      });

      if (cacheEviction) {
        renderCaches();
      } else {
        // Just update numbers without rewriting full HTML rows (reduces layout thrashing)
        updateCacheTtlNumbers();
      }
    }, 1000);
  }

  function updateCacheTtlNumbers() {
    // Safely update DOM text fields for TTL counts
    const bRows = tableCacheBrowser.querySelectorAll("tr");
    bRows.forEach((row, i) => {
      const e = browserCache[i];
      if (e) {
        const ttlCell = row.querySelectorAll("td")[3];
        if (ttlCell) {
          ttlCell.textContent = `${e.ttl}s`;
          if (e.ttl <= 5) ttlCell.className = "cell-ttl-expiring";
        }
      }
    });

    const osRows = tableCacheOs.querySelectorAll("tr");
    osRows.forEach((row, i) => {
      const e = osCache[i];
      if (e) {
        const ttlCell = row.querySelectorAll("td")[3];
        if (ttlCell) {
          ttlCell.textContent = `${e.ttl}s`;
          if (e.ttl <= 5) ttlCell.className = "cell-ttl-expiring";
        }
      }
    });

    const rRows = tableCacheResolver.querySelectorAll("tr");
    rRows.forEach((row, i) => {
      const e = resolverCache[i];
      if (e) {
        const ttlCell = row.querySelectorAll("td")[3];
        if (ttlCell) {
          ttlCell.textContent = `${e.ttl}s`;
          if (e.ttl <= 5) ttlCell.className = "cell-ttl-expiring";
        }
      }
    });
  }

  // --- Dynamic Packet Positioning Animation ---
  function positionPacketOnMap(step) {
    if (step === 0) {
      dnsPacket.classList.add("hidden");
      return;
    }
    dnsPacket.classList.remove("hidden");

    switch (step) {
      case 1:
        // Client -> Resolver
        positionAtNode("node-resolver");
        break;
      case 2:
        // Resolver -> Root
        positionAtNode("node-root");
        break;
      case 3:
        // Root -> Resolver
        positionAtNode("node-resolver");
        break;
      case 4:
        // Resolver -> TLD
        positionAtNode("node-tld");
        break;
      case 5:
        // TLD -> Resolver
        positionAtNode("node-resolver");
        break;
      case 6:
        // Resolver -> Auth
        positionAtNode("node-auth");
        break;
      case 7:
        // Auth -> Resolver
        positionAtNode("node-resolver");
        break;
      case 8:
        // Resolver -> Client
        positionAtNode("node-client");
        break;
    }
  }

  function positionAtNode(nodeId) {
    const containerRect = dnsMap.getBoundingClientRect();
    const nodeEl = document.getElementById(nodeId);
    if (!nodeEl) return;
    const nodeRect = nodeEl.getBoundingClientRect();

    const targetLeft = nodeRect.left - containerRect.left + (nodeRect.width / 2) - 24;
    const targetTop = nodeRect.top - containerRect.top + 12;
    
    dnsPacket.style.left = `${targetLeft}px`;
    dnsPacket.style.top = `${targetTop}px`;
  }

  function animatePacketPath(srcId, dstId, callback) {
    // Position packet first at source
    dnsPacket.classList.remove("hidden");
    const containerRect = dnsMap.getBoundingClientRect();
    
    const srcEl = document.getElementById(srcId);
    const dstEl = document.getElementById(dstId);
    if (!srcEl || !dstEl) return;

    const srcRect = srcEl.getBoundingClientRect();
    const dstRect = dstEl.getBoundingClientRect();

    const startLeft = srcRect.left - containerRect.left + (srcRect.width / 2) - 24;
    const startTop = srcRect.top - containerRect.top + 12;

    const endLeft = dstRect.left - containerRect.left + (dstRect.width / 2) - 24;
    const endTop = dstRect.top - containerRect.top + 12;

    // Place packet at start synchronously
    dnsPacket.style.transition = "none";
    dnsPacket.style.left = `${startLeft}px`;
    dnsPacket.style.top = `${startTop}px`;

    // Trigger reflow to apply transition
    dnsPacket.offsetHeight;

    // Animate to end
    dnsPacket.style.transition = `left ${playbackSpeed * 0.55}ms cubic-bezier(0.25, 1, 0.5, 1), top ${playbackSpeed * 0.55}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    dnsPacket.style.left = `${endLeft}px`;
    dnsPacket.style.top = `${endTop}px`;

    if (callback) {
      setTimeout(callback, playbackSpeed * 0.6);
    }
  }

  function highlightNode(nodeId) {
    const node = document.getElementById(nodeId);
    if (node) node.classList.add("active-processing");
  }

  function resetNodeHighlights() {
    nodeClient.classList.remove("active-processing");
    nodeResolver.classList.remove("active-processing");
    nodeRoot.classList.remove("active-processing");
    nodeTld.classList.remove("active-processing");
    nodeAuth.classList.remove("active-processing");
  }

  // --- Dynamic SVG Lines Connector ---
  function drawConnectionLines() {
    linesSvg.innerHTML = "";
    
    const links = [
      ["node-client", "node-resolver", "var(--color-client)"],
      ["node-resolver", "node-root", "var(--color-resolver)"],
      ["node-resolver", "node-tld", "var(--color-resolver)"],
      ["node-resolver", "node-auth", "var(--color-resolver)"]
    ];

    const containerRect = dnsMap.getBoundingClientRect();

    links.forEach(([srcId, dstId, color]) => {
      const srcEl = document.getElementById(srcId);
      const dstEl = document.getElementById(dstId);
      if (!srcEl || !dstEl) return;

      const srcRect = srcEl.getBoundingClientRect();
      const dstRect = dstEl.getBoundingClientRect();

      const x1 = srcRect.left - containerRect.left + (srcRect.width / 2);
      const y1 = srcRect.top - containerRect.top + (srcRect.height / 2);
      const x2 = dstRect.left - containerRect.left + (dstRect.width / 2);
      const y2 = dstRect.top - containerRect.top + (dstRect.height / 2);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-dasharray", "4 3");
      line.setAttribute("opacity", "0.3");

      linesSvg.appendChild(line);
    });
  }

  // --- Render Tables & UI Elements ---
  function renderAll() {
    renderCaches();
    renderDatabases();
  }

  function renderCaches() {
    // 1. Browser Cache
    tableCacheBrowser.innerHTML = "";
    browserCache.forEach(e => {
      const tr = document.createElement("tr");
      tr.id = `browser-rec-${e.domain}`;
      tr.innerHTML = `<td>${e.domain}</td><td>${e.type}</td><td>${e.value}</td><td>${e.ttl}s</td>`;
      tableCacheBrowser.appendChild(tr);
    });

    // 2. OS Cache
    tableCacheOs.innerHTML = "";
    osCache.forEach(e => {
      const tr = document.createElement("tr");
      tr.id = `os-rec-${e.domain}`;
      tr.innerHTML = `<td>${e.domain}</td><td>${e.type}</td><td>${e.value}</td><td>${e.ttl}s</td>`;
      tableCacheOs.appendChild(tr);
    });

    // 3. Resolver Cache
    tableCacheResolver.innerHTML = "";
    resolverCache.forEach(e => {
      const tr = document.createElement("tr");
      tr.id = `resolver-rec-${e.domain}`;
      tr.innerHTML = `<td>${e.domain}</td><td>${e.type}</td><td>${e.value}</td><td>${e.ttl}s</td>`;
      tableCacheResolver.appendChild(tr);
    });
  }

  function renderDatabases() {
    // 1. Root Zone DB
    tableDbRoot.innerHTML = "";
    ZONE_ROOT.forEach(r => {
      tableDbRoot.innerHTML += `<tr><td>${r.name}</td><td>${r.type}</td><td>${r.value}</td></tr>`;
    });

    // 2. TLD Zone DB
    tableDbTld.innerHTML = "";
    const activeZoneData = ZONE_TLD[activeTldName] || ZONE_TLD["com"];
    activeZoneData.forEach(r => {
      tableDbTld.innerHTML += `<tr><td>${r.name}</td><td>${r.type}</td><td>${r.value}</td></tr>`;
    });

    // 3. Authoritative Zone DB
    tableDbAuth.innerHTML = "";
    const activeAuthData = ZONE_AUTH[activeAuthName] || ZONE_AUTH["google.com"];
    activeAuthData.forEach(r => {
      tableDbAuth.innerHTML += `<tr><td>${r.name}</td><td>${r.type}</td><td>${r.value}</td></tr>`;
    });
  }

  function highlightCacheTableRow(layer, domain) {
    let rowId = "";
    let table = null;
    
    if (layer === "Browser Cache") {
      rowId = `browser-rec-${domain}`;
      table = tableCacheBrowser;
    } else if (layer === "OS System Cache") {
      rowId = `os-rec-${domain}`;
      table = tableCacheOs;
    } else {
      rowId = `resolver-rec-${domain}`;
      table = tableCacheResolver;
    }

    const row = document.getElementById(rowId);
    if (row) {
      row.classList.add("flash-cached-record");
      setTimeout(() => row.classList.remove("flash-cached-record"), 1500);
    }
  }

  function updatePlaybackControls() {
    btnPrevStep.disabled = stepHistory.length === 0;
    btnNextStep.disabled = simStep >= MAX_STEPS;
  }

  // --- Playback Automator Functions ---
  function triggerNextStep() {
    if (simStep >= MAX_STEPS) {
      stopPlayback();
      return;
    }
    executeStep(simStep + 1);
  }

  function startPlayback() {
    if (playbackIntervalId !== null) return;
    
    btnTogglePlay.classList.add("btn-primary");
    document.getElementById("play-icon").classList.add("hidden");
    document.getElementById("pause-icon").classList.remove("hidden");
    btnTogglePlay.querySelector("span").textContent = "Pause Steps";

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
    btnTogglePlay.querySelector("span").textContent = "Run Steps";
  }

  function togglePlayback() {
    if (playbackIntervalId === null) {
      if (simStep >= MAX_STEPS) {
        initSimulator();
      }
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  // --- Event Listeners ---
  domainPresetSelect.addEventListener("change", loadPreset);

  btnResolveDns.addEventListener("click", () => {
    startQueryResolution();
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
    speedValueLabel.textContent = `Speed: ${(playbackSpeed / 1000).toFixed(1)}s`;
    
    if (playbackIntervalId !== null) {
      stopPlayback();
      startPlayback();
    }
  });

  // Tab switching for Caches
  cacheTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      cacheTabBtns.forEach(b => b.classList.remove("active"));
      cacheTabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-cache");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Tab switching for Zone DBs
  dbTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      dbTabBtns.forEach(b => b.classList.remove("active"));
      dbTabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-db");
      document.getElementById(targetId).classList.add("active");
    });
  });

  btnClearLogs.addEventListener("click", () => {
    logConsole.innerHTML = "";
    addLog("Trace console log cleared.", "system");
  });

  // Re-draw SVG connections on window resizing
  window.addEventListener("resize", () => {
    drawConnectionLines();
    if (simStep > 0) positionPacketOnMap(simStep);
  });

  // --- Kickstart ---
  loadPreset();
  startTtlTimer();
});
