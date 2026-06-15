/* FOOD-NET // Food Chain Visualizer - Force Layout & Biomagnification */

document.addEventListener('DOMContentLoaded', () => {

  // --- BIOTOPE WEBS DATABASE ---
  const BIOTOPES = {
    forest: {
      name: "Deciduous Forest Web",
      nodes: [
        { id: "oak", name: "Oak Tree", tier: 1, size: 22, icon: "🌳", eats: [], status: "Healthy", desc: "Deciduous oak tree generating large biomass and acorns." },
        { id: "grass", name: "Wild Grass", tier: 1, size: 16, icon: "🌱", eats: [], status: "Healthy", desc: "Primary herbaceous producer covering the forest floor." },
        { id: "berries", name: "Wild Berries", tier: 1, size: 15, icon: "🍓", eats: [], status: "Healthy", desc: "Shrubs yielding sweet berries rich in simple carbohydrates." },
        
        { id: "cricket", name: "Cricket", tier: 2, size: 12, icon: "🦗", eats: ["grass"], status: "Healthy", desc: "Invertebrate herbivore consuming blades of wild grass." },
        { id: "rabbit", name: "Rabbit", tier: 2, size: 14, icon: "🐇", eats: ["grass", "berries"], status: "Healthy", desc: "Small mammal foraging on grasses and low-hanging forest berries." },
        { id: "deer", name: "Red Deer", tier: 2, size: 19, icon: "🦌", eats: ["oak", "grass"], status: "Healthy", desc: "Large ruminant herbivore browsing foliage and grass." },
        
        { id: "frog", name: "Forest Frog", tier: 3, size: 13, icon: "🐸", eats: ["cricket"], status: "Healthy", desc: "Amphibian predator preying on insect crickets." },
        { id: "snake", name: "Garter Snake", tier: 3, size: 14, icon: "🐍", eats: ["rabbit", "frog"], status: "Healthy", desc: "Reptilian consumer hunting amphibians and small rodents." },
        { id: "robin", name: "Robin Redbreast", tier: 3, size: 12, icon: "🐦", eats: ["cricket"], status: "Healthy", desc: "Avian predator foraging for crickets and worms in ground soil." },
        
        { id: "hawk", name: "Red-Tailed Hawk", tier: 4, size: 16, icon: "🦅", eats: ["snake", "robin", "rabbit"], status: "Healthy", desc: "Apex raptor scanning fields for snakes, robins, and rodents." },
        { id: "wolf", name: "Timber Wolf", tier: 4, size: 19, icon: "🐺", eats: ["deer", "rabbit"], status: "Healthy", desc: "Apex pack predator hunting large cervids and small rabbits." }
      ],
      links: [
        { source: "oak", target: "deer" },
        { source: "grass", target: "cricket" },
        { source: "grass", target: "rabbit" },
        { source: "grass", target: "deer" },
        { source: "berries", target: "rabbit" },
        { source: "cricket", target: "frog" },
        { source: "cricket", target: "robin" },
        { source: "rabbit", target: "snake" },
        { source: "rabbit", target: "hawk" },
        { source: "rabbit", target: "wolf" },
        { source: "deer", target: "wolf" },
        { source: "frog", target: "snake" },
        { source: "snake", target: "hawk" },
        { source: "robin", target: "hawk" }
      ]
    },
    marine: {
      name: "Pelagic Marine Web",
      nodes: [
        { id: "phytoplankton", name: "Phytoplankton", tier: 1, size: 15, icon: "🦠", eats: [], status: "Healthy", desc: "Microscopic photosynthetic organisms drifting in sunlit surface water." },
        { id: "kelp", name: "Giant Kelp", tier: 1, size: 22, icon: "🌿", eats: [], status: "Healthy", desc: "Large brown algae forming dense sub-tidal marine forests." },
        
        { id: "zooplankton", name: "Zooplankton", tier: 2, size: 11, icon: "🦐", eats: ["phytoplankton"], status: "Healthy", desc: "Tiny drifting marine animals grazing on phytoplankton." },
        { id: "krill", name: "Krill", tier: 2, size: 13, icon: "🦐", eats: ["phytoplankton"], status: "Healthy", desc: "Small shrimp-like crustaceans forming massive swarms in cold oceans." },
        { id: "urchin", name: "Sea Urchin", tier: 2, size: 14, icon: "🦔", eats: ["kelp"], status: "Healthy", desc: "Spiny invertebrates browsing kelp holdfasts at the seafloor." },
        
        { id: "anchovy", name: "Anchovy", tier: 3, size: 12, icon: "🐟", eats: ["zooplankton", "krill"], status: "Healthy", desc: "Small schooling forage fish filtering krill and zooplankton." },
        { id: "otter", name: "Sea Otter", tier: 3, size: 18, icon: "🦦", eats: ["urchin"], status: "Healthy", desc: "Keystone marine mammal feeding on sea urchins, protecting kelp beds." },
        { id: "crab", name: "Rock Crab", tier: 3, size: 14, icon: "🦀", eats: ["zooplankton", "urchin"], status: "Healthy", desc: "Crustacean scavenger and predator feeding on kelp urchins." },
        
        { id: "tuna", name: "Bluefin Tuna", tier: 4, size: 17, icon: "🐟", eats: ["anchovy", "crab"], status: "Healthy", desc: "Fast pelagic predator hunting forage schooling fish." },
        { id: "shark", name: "Great White Shark", tier: 4, size: 21, icon: "🦈", eats: ["tuna", "otter"], status: "Healthy", desc: "Apex marine predator stalking seals, large fish, and sea otters." }
      ],
      links: [
        { source: "phytoplankton", target: "zooplankton" },
        { source: "phytoplankton", target: "krill" },
        { source: "kelp", target: "urchin" },
        { source: "zooplankton", target: "anchovy" },
        { source: "zooplankton", target: "crab" },
        { source: "krill", target: "anchovy" },
        { source: "urchin", target: "otter" },
        { source: "urchin", target: "crab" },
        { source: "anchovy", target: "tuna" },
        { source: "otter", target: "shark" },
        { source: "crab", target: "tuna" },
        { source: "tuna", target: "shark" }
      ]
    },
    grassland: {
      name: "African Grassland Web",
      nodes: [
        { id: "acacia", name: "Acacia Tree", tier: 1, size: 21, icon: "🌳", eats: [], status: "Healthy", desc: "Drought-resistant trees with thorny branches and nutrient-rich leaves." },
        { id: "savannagrass", name: "Savanna Grass", tier: 1, size: 16, icon: "🌱", eats: [], status: "Healthy", desc: "Dense grasses covering the open plains, dormant during dry seasons." },
        
        { id: "termite", name: "Termite", tier: 2, size: 11, icon: "🐜", eats: ["acacia"], status: "Healthy", desc: "Decomposer and consumer feeding on cellulose and woody acacia fibers." },
        { id: "zebra", name: "Plains Zebra", tier: 2, size: 17, icon: "🦓", eats: ["savannagrass"], status: "Healthy", desc: "Striped equid herbivore grazing on tall coarse grassland grasses." },
        { id: "gazelle", name: "Thomson's Gazelle", tier: 2, size: 15, icon: "🦌", eats: ["savannagrass", "acacia"], status: "Healthy", desc: "Agile ungulate grazing grasses and browsing low acacia foliage." },
        
        { id: "baboon", name: "Chacma Baboon", tier: 3, size: 15, icon: "🐒", eats: ["termite"], status: "Healthy", desc: "Omnivorous primate foraging for termites, seeds, and small lizards." },
        { id: "cheetah", name: "Cheetah", tier: 3, size: 17, icon: "🐆", eats: ["gazelle"], status: "Healthy", desc: "Fast land predator hunting small ungulates by high-speed sprints." },
        { id: "hyena", name: "Spotted Hyena", tier: 3, size: 17, icon: "🐺", eats: ["zebra", "gazelle"], status: "Healthy", desc: "Social pack predator and scavenger capable of crushing heavy bones." },
        
        { id: "lion", name: "African Lion", tier: 4, size: 20, icon: "🦁", eats: ["zebra", "gazelle", "hyena"], status: "Healthy", desc: "Apex pride predator hunting zebra, gazelles, or competing with hyenas." }
      ],
      links: [
        { source: "acacia", target: "termite" },
        { source: "acacia", target: "gazelle" },
        { source: "savannagrass", target: "zebra" },
        { source: "savannagrass", target: "gazelle" },
        { source: "termite", target: "baboon" },
        { source: "zebra", target: "hyena" },
        { source: "zebra", target: "lion" },
        { source: "gazelle", target: "cheetah" },
        { source: "gazelle", target: "hyena" },
        { source: "gazelle", target: "lion" },
        { source: "hyena", target: "lion" }
      ]
    }
  };

  const TOXINS = {
    ddt: { name: "DDT (Pesticide)", safetyLimit: 12.0, baseAccumulation: 0.05 },
    mercury: { name: "Methylmercury (Heavy Metal)", safetyLimit: 8.0, baseAccumulation: 0.08 },
    microplastics: { name: "Microplastics", safetyLimit: 18.0, baseAccumulation: 0.12 }
  };

  // --- STATE ---
  let activeBiotopeKey = 'forest';
  let activeWeb = JSON.parse(JSON.stringify(BIOTOPES[activeBiotopeKey])); // Deep copy
  let activeToxinKey = 'ddt';
  let activeToxin = TOXINS[activeToxinKey];

  let selectedNode = null;
  let hoveredNode = null;
  let draggedNode = null;

  // Physics params
  let isPhysicsRunning = true;
  let alignmentHierarchy = false;
  let repelStrength = 220;
  const gravityStrength = 0.05;
  const springStrength = 0.04;
  const damping = 0.85;

  // Toxin influx
  let toxinInflux = 0.05; // Base ppm injected into T1
  let activeToxicityAlert = false;

  // Pyramids Active Tier
  let selectedPyramidTier = 1;

  // Canvas References
  const canvas = document.getElementById('network-canvas');
  const ctx = canvas.getContext('2d');
  
  // Chart references
  const chartCanvas = document.getElementById('ppm-chart');
  const chartCtx = chartCanvas.getContext('2d');

  // --- DOM REFERENCES ---
  const biotopePreset = document.getElementById('biotope-preset');
  const pollutantType = document.getElementById('pollutant-type');
  
  const btnKillApex = document.getElementById('btn-kill-apex');
  const btnRunoff = document.getElementById('btn-runoff');
  const btnDisease = document.getElementById('btn-disease');
  const btnRestore = document.getElementById('btn-restore');
  
  const chkToggleHierarchy = document.getElementById('chk-toggle-hierarchy');
  const btnPlayPhysics = document.getElementById('btn-play-physics');
  const sliderRepel = document.getElementById('slider-repel');
  const sliderToxinInflux = document.getElementById('slider-toxin-influx');
  
  const valToxinInflux = document.getElementById('val-toxin-influx');
  const btnInjectToxin = document.getElementById('btn-inject-toxin');
  const btnFlushToxin = document.getElementById('btn-flush-toxin');
  
  const lblPhysicsState = document.getElementById('lbl-physics-state');
  const lblRepelVal = document.getElementById('lbl-repel-val');
  const lblLinksCount = document.getElementById('lbl-links-count');
  
  const canvasOverlayAlert = document.getElementById('canvas-overlay-alert');
  const speciesInfoBody = document.getElementById('species-info-body');
  const lblNodeStatus = document.getElementById('lbl-node-status');

  const pyramidValApex = document.getElementById('pyramid-val-apex');
  const pyramidValPred = document.getElementById('pyramid-val-pred');
  const pyramidValHerb = document.getElementById('pyramid-val-herb');
  const pyramidValProd = document.getElementById('pyramid-val-prod');

  // --- INITIALIZATION ---
  function init() {
    setupCanvasSizes();
    bindEvents();
    loadBiotope(activeBiotopeKey);

    // Start render loop
    requestAnimationFrame(renderLoop);
  }

  function setupCanvasSizes() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const chartRect = chartCanvas.parentNode.getBoundingClientRect();
    chartCanvas.width = chartRect.width;
    chartCanvas.height = chartRect.height;
  }

  // --- EVENTS ---
  function bindEvents() {
    biotopePreset.addEventListener('change', (e) => {
      loadBiotope(e.target.value);
    });

    pollutantType.addEventListener('change', (e) => {
      activeToxinKey = e.target.value;
      activeToxin = TOXINS[activeToxinKey];
      sliderToxinInflux.value = activeToxin.baseAccumulation * 100;
      toxinInflux = activeToxin.baseAccumulation;
      valToxinInflux.textContent = `${toxinInflux.toFixed(2)} ppm`;
      
      // Recompute bio-accumulation
      recalculateBiomagnification();
    });

    // Cascade Scenario Buttons
    btnKillApex.addEventListener('click', triggerApexExtinctionCascade);
    btnRunoff.addEventListener('click', triggerRunoffCascade);
    btnDisease.addEventListener('click', triggerDiseaseCascade);
    btnRestore.addEventListener('click', restoreEcosystemBalance);

    // Layout controls
    chkToggleHierarchy.addEventListener('change', (e) => {
      alignmentHierarchy = e.target.checked;
    });

    btnPlayPhysics.addEventListener('click', () => {
      isPhysicsRunning = !isPhysicsRunning;
      btnPlayPhysics.textContent = isPhysicsRunning ? "Freeze Layout" : "Unfreeze Physics";
      lblPhysicsState.textContent = isPhysicsRunning ? "ACTIVE" : "FROZEN";
    });

    sliderRepel.addEventListener('input', (e) => {
      repelStrength = parseInt(e.target.value, 10);
      lblRepelVal.textContent = repelStrength;
    });

    sliderToxinInflux.addEventListener('input', (e) => {
      toxinInflux = parseInt(e.target.value, 10) / 100;
      valToxinInflux.textContent = `${toxinInflux.toFixed(2)} ppm`;
    });

    btnInjectToxin.addEventListener('click', () => {
      injectToxinToProducers();
    });

    btnFlushToxin.addEventListener('click', () => {
      flushToxins();
    });

    // Lindeman's pyramid clicks
    document.querySelectorAll('.pyramid-tier').forEach(tier => {
      tier.addEventListener('click', (e) => {
        const tierNum = parseInt(tier.dataset.tier, 10);
        selectedPyramidTier = tierNum;
        document.querySelectorAll('.pyramid-tier').forEach(t => t.classList.remove('active'));
        tier.classList.add('active');
        updatePyramidInformation();
      });
    });

    // Mouse interactions on Canvas (dragging nodes)
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    window.addEventListener('resize', setupCanvasSizes);
  }

  // --- BIOTOPE & SETUP ---
  function loadBiotope(key) {
    activeBiotopeKey = key;
    activeWeb = JSON.parse(JSON.stringify(BIOTOPES[key]));
    selectedNode = null;
    hoveredNode = null;
    
    // Distribute nodes randomly in central space
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    activeWeb.nodes.forEach((node, i) => {
      const angle = (i / activeWeb.nodes.length) * 2 * Math.PI;
      node.x = center.x + 100 * Math.cos(angle);
      node.y = center.y + 100 * Math.sin(angle);
      node.vx = 0;
      node.vy = 0;
      node.toxinLevel = 0.0; // Starts clean
      node.incomingLinks = activeWeb.links.filter(l => l.target === node.id);
      node.outgoingLinks = activeWeb.links.filter(l => l.source === node.id);
    });

    lblLinksCount.textContent = activeWeb.links.length;

    restoreEcosystemBalance();
  }

  // --- TROPHIC CASCADE SCENARIOS ---
  function triggerApexExtinctionCascade() {
    // Top-Down: Remove Level 4 apex
    activeWeb.nodes.forEach(node => {
      if (node.tier === 4) {
        node.status = "Extinct";
      } else if (node.tier === 3) {
        node.status = "Overpopulated"; // frog/snake populations grow
      } else if (node.tier === 2) {
        node.status = "Depleted/Starving"; // intense predation
      } else if (node.tier === 1) {
        node.status = "Overpopulated/Healthy"; // herbivores depleted, plants thrive
      }
    });
    updateEcosystemStatusUI();
  }

  function triggerRunoffCascade() {
    // Bottom-Up: Multiply producers (algal bloom / fertilizer runoff)
    activeWeb.nodes.forEach(node => {
      if (node.tier === 1) {
        node.status = "Overpopulated";
      } else if (node.tier === 2) {
        node.status = "Overpopulated/Healthy"; // plenty food
      } else if (node.tier === 3) {
        node.status = "Healthy";
      } else if (node.tier === 4) {
        node.status = "Healthy";
      }
    });
    updateEcosystemStatusUI();
  }

  function triggerDiseaseCascade() {
    // Plague in T2 Herbivores
    activeWeb.nodes.forEach(node => {
      if (node.tier === 2) {
        node.status = "Infected/Depleted";
      } else if (node.tier === 3) {
        node.status = "Starving"; // no prey
      } else if (node.tier === 4) {
        node.status = "Starving/Threatened"; // cascades up
      } else if (node.tier === 1) {
        node.status = "Overpopulated"; // no grazing
      }
    });
    updateEcosystemStatusUI();
  }

  function restoreEcosystemBalance() {
    activeWeb.nodes.forEach(node => {
      node.status = "Healthy";
    });
    updateEcosystemStatusUI();
  }

  function updateEcosystemStatusUI() {
    recalculateBiomagnification();
    updatePyramidInformation();
    renderSelectedNodeProfile();
  }

  // --- BIOMAGNIFICATION SYSTEM ---
  function injectToxinToProducers() {
    // Add toxin influx directly to Trophic Level 1 producers
    activeWeb.nodes.forEach(node => {
      if (node.tier === 1) {
        node.toxinLevel = Math.max(node.toxinLevel, toxinInflux);
      }
    });
    recalculateBiomagnification();
  }

  function flushToxins() {
    activeWeb.nodes.forEach(node => {
      node.toxinLevel = 0.0;
    });
    recalculateBiomagnification();
  }

  function recalculateBiomagnification() {
    // Biomagnification accumulates up the food chain.
    // Iteratively resolve T2 -> T3 -> T4.
    // T1 is already loaded.
    const tiers = [2, 3, 4];
    
    // Reset bio-accumulation flags
    activeToxicityAlert = false;

    tiers.forEach(tier => {
      activeWeb.nodes.forEach(node => {
        if (node.tier === tier) {
          // Find food links
          const preyIds = node.eats;
          if (preyIds.length === 0) return;

          // Find corresponding prey nodes
          const preyNodes = activeWeb.nodes.filter(n => preyIds.includes(n.id));
          
          // Toxin level is average of prey times biomagnification factor (approx 10x per level)
          let avgPreyToxin = preyNodes.reduce((acc, p) => acc + p.toxinLevel, 0) / preyNodes.length;
          
          // Bio-concentration scaling factor
          node.toxinLevel = avgPreyToxin * 9.5; 
          
          if (node.status === "Extinct") {
            node.toxinLevel = 0;
          }

          if (node.toxinLevel > activeToxin.safetyLimit) {
            activeToxicityAlert = true;
          }
        }
      });
    });

    // Show warning alert overlay if lethal toxicity is breached
    if (activeToxicityAlert) {
      canvasOverlayAlert.textContent = `CRITICAL ${activeToxin.name.toUpperCase()} TOXICITY REACHED`;
      canvasOverlayAlert.classList.remove('hidden');
    } else {
      canvasOverlayAlert.classList.add('hidden');
    }

    renderSelectedNodeProfile();
    drawPpmChart();
  }

  // --- LINDEMAN'S 10% ENERGY PYRAMID INFO UPDATES ---
  function updatePyramidInformation() {
    // Calculate relative biomass sums to display Joule dynamics
    // Base calories: Trophic 1 = 10,000 J, T2 = 1,000 J, T3 = 100 J, T4 = 10 J
    let baseEnergy = { 1: 10000, 2: 1000, 3: 100, 4: 10 };
    
    // Adjust levels if cascades have depleted producers or consumers
    let scaleFactors = { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0 };
    
    activeWeb.nodes.forEach(node => {
      if (node.status.includes("Depleted")) {
        scaleFactors[node.tier] *= 0.3;
      } else if (node.status.includes("Overpopulated")) {
        scaleFactors[node.tier] *= 2.0;
      } else if (node.status === "Extinct") {
        scaleFactors[node.tier] = 0;
      }
    });

    // Update HTML energy readings
    pyramidValProd.textContent = `${Math.round(baseEnergy[1] * scaleFactors[1]).toLocaleString()} J`;
    pyramidValHerb.textContent = `${Math.round(baseEnergy[2] * scaleFactors[2]).toLocaleString()} J`;
    pyramidValPred.textContent = `${Math.round(baseEnergy[3] * scaleFactors[3]).toLocaleString()} J`;
    pyramidValApex.textContent = `${Math.round(baseEnergy[4] * scaleFactors[4]).toLocaleString()} J`;
  }

  // --- RENDER SELECTED NODE SPECIFICATION CARD ---
  function renderSelectedNodeProfile() {
    if (!selectedNode) {
      speciesInfoBody.innerHTML = `
        <div class="profile-placeholder">
          Click on a node in the network to inspect its place in the food web, trophic connections, and toxic accumulation data.
        </div>`;
      lblNodeStatus.textContent = "SELECT AN AGENT";
      lblNodeStatus.className = "badge tech-badge";
      return;
    }

    // Identify selected node's prey and predators
    const preyTags = selectedNode.eats.map(pId => {
      const match = activeWeb.nodes.find(n => n.id === pId);
      return match ? `<span class="tag tag-h">${match.name}</span>` : "";
    }).join("");

    const predTags = activeWeb.nodes.filter(n => n.eats.includes(selectedNode.id)).map(p => 
      `<span class="tag tag-a">${p.name}</span>`
    ).join("");

    // Identify trophic status
    let statusClass = "badge live-badge";
    if (selectedNode.status.includes("Overpopulated")) statusClass = "badge success-badge";
    if (selectedNode.status.includes("Depleted") || selectedNode.status.includes("Starving")) statusClass = "badge hazard-badge";
    if (selectedNode.status === "Extinct") statusClass = "badge hazard-badge";

    lblNodeStatus.textContent = selectedNode.status.toUpperCase();
    lblNodeStatus.className = statusClass;

    const toxPct = Math.min(100, (selectedNode.toxinLevel / activeToxin.safetyLimit) * 100);
    const isLethal = selectedNode.toxinLevel > activeToxin.safetyLimit;

    speciesInfoBody.innerHTML = `
      <div class="profile-title-row">
        <span class="profile-icon">${selectedNode.icon}</span>
        <div>
          <h4 class="profile-name">${selectedNode.name}</h4>
          <span class="text-muted">Trophic Level ${selectedNode.tier}</span>
        </div>
      </div>
      <div class="profile-grid">
        <span class="label">Status:</span>
        <span class="val">${selectedNode.status}</span>

        <span class="label">Bio-load:</span>
        <span class="val font-mono ${isLethal ? 'text-danger' : ''}">${selectedNode.toxinLevel.toFixed(3)} ppm</span>
        
        <span class="label">Toxic Load:</span>
        <span class="val">
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden; border:1px solid var(--border-glass)">
            <div style="width:${toxPct}%; height:100%; background:${isLethal ? 'var(--color-danger)' : 'var(--color-warning)'}"></div>
          </div>
        </span>

        <span class="label">Diet (Prey):</span>
        <span class="val tag-container">${preyTags || "<span class='text-muted'>None (Primary Producer)</span>"}</span>

        <span class="label">Predators:</span>
        <span class="val tag-container">${predTags || "<span class='text-muted'>None (Apex Predator)</span>"}</span>

        <span class="label">Profile:</span>
        <span class="val text-muted" style="font-size:0.75rem; line-height:1.3">${selectedNode.desc}</span>
      </div>
    `;
  }

  // --- FORCE-DIRECTED VECTOR MATHEMATICS ---
  function updatePhysics() {
    if (!isPhysicsRunning && !draggedNode) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = { x: width / 2, y: height / 2 };

    const nodes = activeWeb.nodes;
    const links = activeWeb.links;

    // 1. Repulsion forces (Coulomb's Law)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const u = nodes[i];
        const v = nodes[j];

        const dx = v.x - u.x;
        const dy = v.y - u.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 0.1;

        if (dist < 200) {
          // Push apart force
          const force = (repelStrength * repelStrength) / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!u.isFixed) { u.vx -= fx * 0.15; u.vy -= fy * 0.15; }
          if (!v.isFixed) { v.vx += fx * 0.15; v.vy += fy * 0.15; }
        }
      }
    }

    // 2. Attraction spring forces (Hooke's Law)
    links.forEach(link => {
      // Find source/target node objects
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);

      if (!sourceNode || !targetNode) return;

      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 0.1;

      // Spring rest length = 90px
      const springLength = 90;
      const force = springStrength * (dist - springLength);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!sourceNode.isFixed) { sourceNode.vx += fx; sourceNode.vy += fy; }
      if (!targetNode.isFixed) { targetNode.vx -= fx; targetNode.vy -= fy; }
    });

    // 3. Gravity center pull
    nodes.forEach(node => {
      if (node.isFixed) return;

      const dx = center.x - node.x;
      const dy = center.y - node.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 0.1;

      node.vx += dx * gravityStrength * 0.1;
      node.vy += dy * gravityStrength * 0.1;
    });

    // 4. Update coordinates & apply damping
    nodes.forEach(node => {
      if (node === draggedNode) return;

      // Apply forces
      node.vx *= damping;
      node.vy *= damping;
      
      node.x += node.vx;
      node.y += node.vy;

      // Restrict to screen boundary
      node.x = Math.max(node.size + 10, Math.min(width - node.size - 10, node.x));
      node.y = Math.max(node.size + 10, Math.min(height - node.size - 10, node.y));
    });

    // 5. Trophic Level Alignment Override
    if (alignmentHierarchy) {
      // Slides nodes vertically based on their Trophic level (Apex 4 on top, Producer 1 at bottom)
      nodes.forEach(node => {
        if (node === draggedNode) return;

        // Coordinates targets
        const targetY = 50 + (4 - node.tier) * ((height - 100) / 3);
        const yDiff = targetY - node.y;
        node.y += yDiff * 0.15; // smooth slide
        node.vy = 0;
      });
    }
  }

  // --- DRAWING CANVAS INTERACTION NETWORKS ---
  function drawNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodes = activeWeb.nodes;
    const links = activeWeb.links;

    // Trophic tier color map
    const colorMap = {
      1: "var(--color-producer)",
      2: "var(--color-herbivore)",
      3: "var(--color-predator)",
      4: "var(--color-apex)"
    };

    // 1. Draw Links (directed energy arrows)
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);

      if (!sourceNode || !targetNode) return;
      if (sourceNode.status === "Extinct" || targetNode.status === "Extinct") return;

      const isFocused = (hoveredNode && (hoveredNode.id === sourceNode.id || hoveredNode.id === targetNode.id)) ||
                         (selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id));

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      
      if (isFocused) {
        // Glowing path
        ctx.strokeStyle = hoveredNode && hoveredNode.id === sourceNode.id ? "rgba(245, 158, 11, 0.7)" : "rgba(0, 229, 255, 0.7)";
        ctx.lineWidth = 2.5;
      } else {
        // Muted path
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      // Draw arrow pointer meeting edge of target node
      drawArrowHead(sourceNode, targetNode, colorMap[targetNode.tier], isFocused);
    });

    // 2. Draw Nodes (species circles)
    nodes.forEach(node => {
      if (node.status === "Extinct") return;

      const color = colorMap[node.tier];
      const radius = node.size;

      // Glowing selection outer ring
      if (selectedNode && selectedNode.id === node.id) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI);
        ctx.strokeStyle = "var(--color-brand)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw main circle node
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      
      // Inject radioactive hazard green if toxin is high
      const isLethal = node.toxinLevel > activeToxin.safetyLimit;
      if (isLethal) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.85)"; // Toxic red/danger
        ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
        ctx.shadowBlur = 10;
      } else if (node.toxinLevel > 0) {
        // Mix green base with toxic yellow
        ctx.fillStyle = color;
        ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = color;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw central species emoji icon
      ctx.fillStyle = "#ffffff";
      ctx.font = `${Math.round(radius * 0.95)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.icon, node.x, node.y + 1);

      // Draw status warning tags above nodes if necessary
      if (node.status !== "Healthy") {
        ctx.fillStyle = node.status.includes("Overpopulated") ? "var(--color-producer)" : "var(--color-apex)";
        ctx.font = "8px var(--font-sans)";
        ctx.fillText(node.status.split("/")[0].toUpperCase(), node.x, node.y - radius - 5);
      }
    });
  }

  function drawArrowHead(fromNode, toNode, color, isFocused) {
    // Arrow math calculations
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 40) return;

    // Arrow coordinate position sits right at the border of target node
    const arrowX = toNode.x - (toNode.size + 4) * Math.cos(angle);
    const arrowY = toNode.y - (toNode.size + 4) * Math.sin(angle);

    ctx.fillStyle = isFocused ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI/6), arrowY - 8 * Math.sin(angle - Math.PI/6));
    ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI/6), arrowY - 8 * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
  }

  // --- MOUSE NODE DRAGGING ---
  function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Detect if click landed inside a node
    let clickedNode = null;
    activeWeb.nodes.forEach(node => {
      if (node.status === "Extinct") return;
      
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx*dx + dy*dy < node.size * node.size) {
        clickedNode = node;
      }
    });

    if (clickedNode) {
      draggedNode = clickedNode;
      selectedNode = clickedNode;
      clickedNode.isFixed = true;
      renderSelectedNodeProfile();
    }
  }

  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedNode) {
      draggedNode.x = x;
      draggedNode.y = y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    } else {
      // Hover checks
      let foundHover = null;
      activeWeb.nodes.forEach(node => {
        if (node.status === "Extinct") return;

        const dx = x - node.x;
        const dy = y - node.y;
        if (dx*dx + dy*dy < node.size * node.size) {
          foundHover = node;
        }
      });
      hoveredNode = foundHover;
    }
  }

  function handleMouseUp() {
    if (draggedNode) {
      draggedNode.isFixed = false;
      draggedNode = null;
    }
  }

  // --- PPM LOGARITHMIC BAR CHART ---
  function drawPpmChart() {
    if (!chartCtx) return;

    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    const w = chartCanvas.width;
    const h = chartCanvas.height;
    const padding = 20;

    // Calculate maximum PPM level inside nodes for scaling bounds
    let maxPpm = activeWeb.nodes.reduce((acc, n) => Math.max(acc, n.toxinLevel), 0);
    maxPpm = Math.max(5.0, maxPpm); // Base cap at 5.0 ppm

    // Aggregate average PPM concentrations per trophic level
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const sums = { 1: 0, 2: 0, 3: 0, 4: 0 };

    activeWeb.nodes.forEach(n => {
      if (n.status !== "Extinct") {
        counts[n.tier]++;
        sums[n.tier] += n.toxinLevel;
      }
    });

    const averages = [
      counts[1] > 0 ? sums[1] / counts[1] : 0,
      counts[2] > 0 ? sums[2] / counts[2] : 0,
      counts[3] > 0 ? sums[3] / counts[3] : 0,
      counts[4] > 0 ? sums[4] / counts[4] : 0
    ];

    // Draw grid lines
    chartCtx.strokeStyle = "rgba(255,255,255,0.03)";
    chartCtx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const gridY = padding + i * (h - 2*padding) / 4;
      chartCtx.beginPath();
      chartCtx.moveTo(padding, gridY);
      chartCtx.lineTo(w - padding, gridY);
      chartCtx.stroke();
    }

    // Colors mapping
    const colors = [
      "var(--color-producer)",
      "var(--color-herbivore)",
      "var(--color-predator)",
      "var(--color-apex)"
    ];

    // Plot 4 vertical bar columns represent T1 -> T4
    const barWidth = 35;
    const colStep = (w - 2 * padding) / 4;

    averages.forEach((avg, i) => {
      const cx = padding + i * colStep + colStep/2;
      
      // Calculate height relative to maxPpm
      const barHeight = Math.max(2, (avg / maxPpm) * (h - 2 * padding - 20));
      const cy = h - padding - barHeight;

      // Draw bar column
      chartCtx.fillStyle = colors[i];
      chartCtx.beginPath();
      chartCtx.roundRect(cx - barWidth/2, cy, barWidth, barHeight, [4, 4, 0, 0]);
      chartCtx.fill();

      // Draw border outline
      chartCtx.strokeStyle = "rgba(255,255,255,0.15)";
      chartCtx.stroke();

      // PPM text readout above column
      chartCtx.fillStyle = "#ffffff";
      chartCtx.font = "bold 9px var(--font-mono)";
      chartCtx.textAlign = "center";
      chartCtx.fillText(`${avg.toFixed(2)}`, cx, cy - 5);

      // Label under column
      chartCtx.fillStyle = "var(--text-secondary)";
      chartCtx.font = "8px var(--font-sans)";
      chartCtx.fillText(`Tier ${i + 1}`, cx, h - 5);
    });
  }

  // --- CORE SYSTEM RENDERING LOOP ---
  function renderLoop() {
    updatePhysics();
    drawNetwork();
    
    requestAnimationFrame(renderLoop);
  }

  // Run initializer
  init();
});
