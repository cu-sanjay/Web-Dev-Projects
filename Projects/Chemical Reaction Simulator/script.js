/* CHEM-LAB // Chemical Reaction Simulator - Beaker Physics & Kinetics Engine */

document.addEventListener('DOMContentLoaded', () => {

  // --- REACTION DATABASE PRESETS ---
  const PRESETS = {
    neutralization: {
      name: "Acid-Base Neutralization",
      equation: "<span class='coeff'></span>HCl + <span class='coeff'></span>NaOH → <span class='coeff'></span>NaCl + H₂O",
      reactantsText: "HCl + NaOH",
      type: "Exothermic",
      deltaH: -57.1, // kJ/mol
      eaNormal: 35, // Activation Energy units
      eaCatalyzed: 18,
      hasCatalyst: false,
      colorStart: "rgba(239, 68, 68, 0.18)", // Bright acid red
      colorEnd: "rgba(16, 185, 129, 0.15)",   // Neutral green
      colorExcessBase: "rgba(139, 92, 246, 0.18)", // Basic purple/magenta
      description: "Hydrochloric acid reacts with Sodium hydroxide to produce Sodium chloride salt and water. Toggling temperatures affects kinetic speeds.",
      chemicals: {
        A: { name: "HCl (Acid)", type: "acid", color: "#ff2a5f", nfpa: { h: 3, f: 0, r: 1, s: "COR" } },
        B: { name: "NaOH (Base)", type: "base", color: "#3b82f6", nfpa: { h: 3, f: 0, r: 1, s: "ALK" } },
        C: { name: "NaCl (Aqueous Salt)", type: "product_sol", color: "#10b981", nfpa: { h: 1, f: 0, r: 0, s: "" } }
      }
    },
    combustion: {
      name: "Hydrogen Combustion",
      equation: "<span class='coeff'>2</span>H₂ + O₂ → <span class='coeff'>2</span>H₂O",
      reactantsText: "H₂ + O₂",
      type: "Highly Exothermic",
      deltaH: -241.8,
      eaNormal: 85,
      eaCatalyzed: 40,
      hasCatalyst: true, // e.g. Platinum/Palladium spark
      colorStart: "rgba(0, 229, 255, 0.05)",
      colorEnd: "rgba(255, 255, 255, 0.04)",
      description: "Combustion of hydrogen gas with oxygen, forming water vapor. Requires high temperature (kinetic energy) or a catalyst spark to react.",
      chemicals: {
        A: { name: "H₂ (Hydrogen Gas)", type: "gas_react_a", color: "#ff5a79", nfpa: { h: 0, f: 4, r: 0, s: "" } },
        B: { name: "O₂ (Oxygen Gas)", type: "gas_react_b", color: "#00b2ff", nfpa: { h: 0, f: 0, r: 0, s: "OX" } },
        C: { name: "H₂O (Water Vapor)", type: "gas_prod", color: "#e2e8f0", nfpa: { h: 0, f: 0, r: 0, s: "" } }
      }
    },
    displacement: {
      name: "Metal Displacement",
      equation: "Fe + CuSO₄ → FeSO₄ + Cu(s)",
      reactantsText: "Fe + CuSO₄",
      type: "Exothermic",
      deltaH: -150.0,
      eaNormal: 50,
      eaCatalyzed: 28,
      hasCatalyst: false,
      colorStart: "rgba(59, 130, 246, 0.2)", // CuSO4 Blue solution
      colorEnd: "rgba(16, 185, 129, 0.15)",   // FeSO4 Green solution
      description: "Solid Iron displaces Copper ions from solution. Dissolved blue CuSO₄ solution fades to green FeSO₄ as metallic copper precipitation forms.",
      chemicals: {
        A: { name: "Fe (Iron powder)", type: "solid", color: "#94a3b8", nfpa: { h: 0, f: 1, r: 0, s: "" } },
        B: { name: "CuSO₄ (Copper sulfate)", type: "sol_react", color: "#3b82f6", nfpa: { h: 2, f: 0, r: 0, s: "TOX" } },
        C: { name: "FeSO₄ (Iron sulfate)", type: "sol_prod", color: "#10b981", nfpa: { h: 1, f: 0, r: 0, s: "" } },
        D: { name: "Cu (Copper metal)", type: "precipitate", color: "#d97706", nfpa: { h: 0, f: 0, r: 0, s: "" } }
      }
    },
    decomposition: {
      name: "Catalytic Decomposition",
      equation: "<span class='coeff'>2</span>H₂O₂ → <span class='coeff'>2</span>H₂O + O₂(g)",
      reactantsText: "H₂O₂",
      type: "Exothermic",
      deltaH: -98.2,
      eaNormal: 75,
      eaCatalyzed: 22,
      hasCatalyst: true, // yeast or MnO2
      colorStart: "rgba(255, 255, 255, 0.08)",
      colorEnd: "rgba(255, 255, 255, 0.04)",
      description: "Hydrogen Peroxide breaks down into water and oxygen gas. The reaction is extremely slow normally, but spikes instantly when a catalyst is present.",
      chemicals: {
        A: { name: "H₂O₂ (Hydrogen Peroxide)", type: "liquid_react", color: "#ff7da4", nfpa: { h: 2, f: 0, r: 1, s: "OX" } },
        B: { name: "MnO₂ (Catalyst)", type: "catalyst_agent", color: "#94a3b8", nfpa: { h: 1, f: 0, r: 0, s: "" } },
        C: { name: "H₂O (Water)", type: "liquid_prod", color: "#ffffff", nfpa: { h: 0, f: 0, r: 0, s: "" } },
        E: { name: "O₂ (Oxygen gas)", type: "bubble", color: "#94a3b8", nfpa: { h: 0, f: 0, r: 0, s: "OX" } }
      }
    },
    precipitation: {
      name: "Precipitation Reaction",
      equation: "AgNO₃ + NaCl → AgCl(s) + NaNO₃",
      reactantsText: "AgNO₃ + NaCl",
      type: "Slightly Exothermic",
      deltaH: -65.7,
      eaNormal: 15,
      eaCatalyzed: 10,
      hasCatalyst: false,
      colorStart: "rgba(0, 229, 255, 0.04)",
      colorEnd: "rgba(255, 255, 255, 0.05)",
      description: "Aqueous Silver nitrate and Sodium chloride react to yield an insoluble white precipitate of Silver chloride, which sinks to the bottom.",
      chemicals: {
        A: { name: "AgNO₃ (Silver nitrate)", type: "sol_react_a", color: "#e2e8f0", nfpa: { h: 3, f: 0, r: 0, s: "OX" } },
        B: { name: "NaCl (Salt solution)", type: "sol_react_b", color: "#7dd3fc", nfpa: { h: 1, f: 0, r: 0, s: "" } },
        C: { name: "NaNO₃ (Sodium nitrate)", type: "sol_prod", color: "#00b2ff", nfpa: { h: 1, f: 0, r: 0, s: "" } },
        D: { name: "AgCl (Silver chloride)", type: "precipitate_white", color: "#ffffff", nfpa: { h: 1, f: 0, r: 0, s: "" } }
      }
    }
  };

  // --- STATE ---
  let activePresetKey = 'neutralization';
  let activePreset = PRESETS[activePresetKey];
  let isRunning = true;

  // Beaker particles state
  let particles = [];
  const maxParticlesLimit = 150;
  
  // Kinetics rates
  let temperature = 25; // °C
  let concentration = 50; // % slider
  let surfaceArea = 2; // 1: Block, 2: Powder, 3: Dust
  let catalystActive = false;

  // Analytics history arrays (for the graph)
  let timeTicks = 0;
  let reactantHistory = [];
  let productHistory = [];
  const maxHistoryPoints = 120;

  // Beaker dimensions
  const beakerWidth = 250;
  const beakerHeight = 280;

  // --- DOM CACHING ---
  const presetSelector = document.getElementById('reaction-preset');
  const equationDisplay = document.getElementById('balanced-equation-display');
  
  const sliderTemp = document.getElementById('slider-temp');
  const sliderConc = document.getElementById('slider-conc');
  const sliderSurface = document.getElementById('slider-surface');
  const toggleCatalyst = document.getElementById('toggle-catalyst');
  
  const valTemp = document.getElementById('val-temp');
  const valConc = document.getElementById('val-conc');
  const valSurface = document.getElementById('val-surface');
  
  const nfpaChemName = document.getElementById('nfpa-chemical-name');
  const nfpaHealth = document.getElementById('nfpa-health');
  const nfpaFire = document.getElementById('nfpa-fire');
  const nfpaInstability = document.getElementById('nfpa-instability');
  const nfpaSpecial = document.getElementById('nfpa-special');
  const hazardTextLog = document.getElementById('hazard-text-log');

  const thermalGlowIndicator = document.getElementById('thermal-glow-indicator');
  const beakerGlowEnvelope = document.getElementById('beaker-glow-envelope');
  const beakerLiquidFill = document.getElementById('beaker-liquid-fill');
  
  const beakerCanvas = document.getElementById('beaker-canvas');
  let beakerCtx = beakerCanvas.getContext('2d');
  
  const countA = document.getElementById('count-a');
  const countB = document.getElementById('count-b');
  const countProd = document.getElementById('count-prod');
  const telemetryState = document.getElementById('telemetry-state');

  const btnPlay = document.getElementById('btn-play');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const btnAddReactants = document.getElementById('btn-add-reactants');

  const chartCanvas = document.getElementById('concentration-chart');
  let chartCtx = chartCanvas.getContext('2d');

  const energyProfileSvg = document.getElementById('energy-profile-svg');
  const lblReactionThermo = document.getElementById('lbl-reaction-thermo');
  const lblDeltaH = document.getElementById('lbl-delta-h');
  const lblEaVal = document.getElementById('lbl-ea-val');

  // --- INITIALIZATION ---
  function init() {
    setupCanvases();
    bindEvents();
    loadPreset(activePresetKey);
    
    // Start loop
    requestAnimationFrame(renderLoop);
  }

  function setupCanvases() {
    // Beaker canvas size matches physical glass tube container bounding rect
    beakerCanvas.width = 250;
    beakerCanvas.height = 280;

    // Chart dimensions
    const chartRect = chartCanvas.parentNode.getBoundingClientRect();
    chartCanvas.width = chartRect.width;
    chartCanvas.height = chartRect.height;
  }

  // --- EVENTS ---
  function bindEvents() {
    presetSelector.addEventListener('change', (e) => {
      loadPreset(e.target.value);
    });

    sliderTemp.addEventListener('input', (e) => {
      temperature = parseInt(e.target.value, 10);
      valTemp.textContent = `${temperature} °C`;
      updateKineticsPhysics();
    });

    sliderConc.addEventListener('input', (e) => {
      concentration = parseInt(e.target.value, 10);
      valConc.textContent = `${concentration}%`;
    });

    sliderSurface.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      surfaceArea = val;
      if (val === 1) valSurface.textContent = "Low (Solid block)";
      else if (val === 2) valSurface.textContent = "Medium (Powder)";
      else valSurface.textContent = "High (Fine dust)";
    });

    toggleCatalyst.addEventListener('change', (e) => {
      catalystActive = e.target.checked;
      renderEnergyProfile();
    });

    btnPlay.addEventListener('click', () => {
      isRunning = true;
      telemetryState.textContent = "RUNNING";
      telemetryState.className = "text-success";
    });

    btnPause.addEventListener('click', () => {
      isRunning = false;
      telemetryState.textContent = "PAUSED";
      telemetryState.className = "text-secondary";
    });

    btnReset.addEventListener('click', () => {
      resetParticles();
      resetChartHistory();
    });

    btnAddReactants.addEventListener('click', () => {
      injectReactants();
    });

    window.addEventListener('resize', () => {
      const chartRect = chartCanvas.parentNode.getBoundingClientRect();
      chartCanvas.width = chartRect.width;
      chartCanvas.height = chartRect.height;
    });
  }

  // --- PRESET LOADER ---
  function loadPreset(key) {
    activePresetKey = key;
    activePreset = PRESETS[key];
    
    // Set UI displays
    equationDisplay.innerHTML = activePreset.equation;
    lblReactionThermo.textContent = activePreset.type.toUpperCase();
    
    if (activePreset.type.includes("Highly")) {
      lblReactionThermo.className = "font-mono text-danger";
    } else {
      lblReactionThermo.className = "font-mono text-success";
    }

    lblDeltaH.textContent = `${activePreset.deltaH} kJ/mol`;
    
    // Set catalyst accessibility
    toggleCatalyst.disabled = !activePreset.hasCatalyst;
    if (!activePreset.hasCatalyst) {
      toggleCatalyst.checked = false;
      catalystActive = false;
    }
    
    // Draw thermodynamic charts
    renderEnergyProfile();
    
    // Populate hazard metrics
    updateHazardDisplay();

    // Reset solution color and beaker glow
    beakerLiquidFill.style.backgroundColor = activePreset.colorStart;
    beakerGlowEnvelope.style.boxShadow = "none";
    thermalGlowIndicator.textContent = "STABLE";
    thermalGlowIndicator.className = "badge live-badge";

    // Re-seed beaker particles
    resetParticles();
    resetChartHistory();
  }

  function updateKineticsPhysics() {
    // Increase heat glows if temperature is high and preset is exothermic
    if (temperature > 70) {
      beakerGlowEnvelope.style.boxShadow = "inset 0 0 20px rgba(239, 68, 68, 0.3), 0 5px 15px rgba(239, 68, 68, 0.2)";
      thermalGlowIndicator.textContent = "HOT";
      thermalGlowIndicator.className = "badge hazard-badge";
    } else if (temperature < 10) {
      beakerGlowEnvelope.style.boxShadow = "inset 0 0 20px rgba(59, 130, 246, 0.3), 0 5px 15px rgba(59, 130, 246, 0.2)";
      thermalGlowIndicator.textContent = "CHILLED";
      thermalGlowIndicator.className = "badge tech-badge";
    } else {
      beakerGlowEnvelope.style.boxShadow = "none";
      thermalGlowIndicator.textContent = "STABLE";
      thermalGlowIndicator.className = "badge live-badge";
    }
  }

  function updateHazardDisplay() {
    // Displays hazard details of Reactant A primarily
    const chemA = activePreset.chemicals.A;
    nfpaChemName.textContent = chemA.name.split(" ")[0];
    nfpaHealth.textContent = chemA.nfpa.h;
    nfpaFire.textContent = chemA.nfpa.f;
    nfpaInstability.textContent = chemA.nfpa.r;
    nfpaSpecial.textContent = chemA.nfpa.s || "—";

    hazardTextLog.innerHTML = "";
    
    // Hazard alerts text mapping
    if (chemA.nfpa.h >= 3) {
      hazardTextLog.innerHTML += `<div class="alert danger"><strong>Toxicity Hazard:</strong> Corrosive. Causes severe tissue damage and eye burns on contact.</div>`;
    }
    if (chemA.nfpa.f >= 3) {
      hazardTextLog.innerHTML += `<div class="alert danger"><strong>Flammable Gas:</strong> Avoid open flames. Flash ignition hazard under pressure.</div>`;
    }
    if (chemA.nfpa.s === "OX") {
      hazardTextLog.innerHTML += `<div class="alert warn"><strong>Oxidizer:</strong> Reacts strongly with organic matter. Keep away from reducing agents.</div>`;
    }
    if (activePresetKey === 'displacement') {
      hazardTextLog.innerHTML += `<div class="alert warn"><strong>Irritant:</strong> Aqueous Copper Sulfate solution is toxic to aquatic organisms.</div>`;
    }
    if (hazardTextLog.innerHTML === "") {
      hazardTextLog.innerHTML = `<div class="alert warn"><strong>General Laboratory:</strong> Follow standard lab protocols. Wear safety goggles and gloves.</div>`;
    }
  }

  // --- PARTICLE GENERATION & PHYSICS ---
  function resetParticles() {
    particles = [];
    injectReactants();
  }

  function injectReactants() {
    const counts = calculateInitialCounts();
    const radius = 6;
    
    // Reactant A particles (Red)
    for (let i = 0; i < counts.A; i++) {
      if (particles.length >= maxParticlesLimit) break;
      spawnParticle('A', radius);
    }

    // Reactant B particles (Blue)
    for (let i = 0; i < counts.B; i++) {
      if (particles.length >= maxParticlesLimit) break;
      spawnParticle('B', radius);
    }

    // Special layout modifications if Reactant A is solid block (displacement)
    if (activePresetKey === 'displacement' && surfaceArea === 1) {
      // Remove A particles and build a large solid shelf at the bottom
      particles = particles.filter(p => p.type !== 'A');
      spawnSolidBlock();
    }
  }

  function spawnParticle(type, radius) {
    const padding = 15;
    
    // Bounce particles inside liquid boundaries (Y: 80 to 270)
    const x = padding + Math.random() * (beakerCanvas.width - 2 * padding);
    const y = 85 + Math.random() * (beakerCanvas.height - 85 - padding);
    
    // Scale velocity with temperature
    const baseSpeed = 0.5 + (temperature / 50);
    const angle = Math.random() * 2 * Math.PI;
    const vx = baseSpeed * Math.cos(angle);
    const vy = baseSpeed * Math.sin(angle);

    particles.push({
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      radius: radius,
      type: type,
      color: activePreset.chemicals[type].color,
      isSolidBlock: false,
      life: 1.0 // For bubbles or reaction sparks fading
    });
  }

  function spawnSolidBlock() {
    // Draws a solid metal line/rect at the bottom of the beaker
    particles.push({
      x: beakerCanvas.width / 2,
      y: beakerCanvas.height - 25,
      vx: 0,
      vy: 0,
      radius: 35, // large collision radius
      type: 'A',
      color: activePreset.chemicals.A.color,
      isSolidBlock: true,
      life: 1.0
    });
  }

  function calculateInitialCounts() {
    // Scaled by concentration slider
    const factor = concentration / 100;
    
    if (activePresetKey === 'decomposition') {
      // Direct H2O2 decomposition (single reactant)
      return { A: Math.round(70 * factor), B: 0 };
    }
    
    // Stoichiometric inputs
    if (activePresetKey === 'combustion') {
      // 2H2 : 1O2
      return { A: Math.round(50 * factor), B: Math.round(25 * factor) };
    }
    
    return { A: Math.round(40 * factor), B: Math.round(40 * factor) };
  }

  // --- PHYSICS ENGINE LOGIC (Collisions & reaction mechanics) ---
  function updatePhysics() {
    if (!isRunning) return;

    // Filter out decayed gas bubbles or sparks
    particles = particles.filter(p => p.type !== 'spark' || p.life > 0);
    
    // Decent drag/forces
    const surfaceLine = 75; // Y liquid bounds

    particles.forEach(p => {
      if (p.isSolidBlock) return;

      // Update positions
      p.x += p.vx;
      p.y += p.vy;

      // Handle boundaries
      // Side bounds
      if (p.x - p.radius < 5) {
        p.x = 5 + p.radius;
        p.vx *= -1;
      }
      if (p.x + p.radius > beakerCanvas.width - 5) {
        p.x = beakerCanvas.width - 5 - p.radius;
        p.vx *= -1;
      }

      // Vertical bounds (solution fluid surface vs bottom)
      if (p.type === 'bubble') {
        // Gas bubbles rise, ignoring gravity
        p.vy = -0.6 - Math.random() * 0.4;
        p.vx += (Math.random() - 0.5) * 0.2; // wobble
        
        if (p.y < surfaceLine + 5) {
          // Fade/decay when escaping surface
          p.life -= 0.05;
        }
      } else if (p.type === 'precipitate' || p.type === 'precipitate_white') {
        // Solids settle down to bottom
        p.vy = Math.min(0.6, p.vy + 0.05); // slight gravity drift
        p.vx *= 0.95; // drag
        
        if (p.y + p.radius > beakerCanvas.height - 8) {
          p.y = beakerCanvas.height - 8 - p.radius;
          p.vy = 0;
          p.vx = 0;
        }
      } else {
        // Normal molecules
        if (p.y - p.radius < surfaceLine) {
          p.y = surfaceLine + p.radius;
          p.vy *= -1;
        }
        if (p.y + p.radius > beakerCanvas.height - 8) {
          p.y = beakerCanvas.height - 8 - p.radius;
          p.vy *= -1;
        }
      }
    });

    // Detect particle-to-particle collisions
    handleCollisions();
  }

  function handleCollisions() {
    const len = particles.length;
    
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        if (p1.type === 'spark' || p2.type === 'spark') continue;
        if (p1.type === 'bubble' || p2.type === 'bubble') continue;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist) {
          // Resolve overlapping
          resolveElasticCollision(p1, p2, dx, dy, dist);
          
          // Test chemical reaction
          evaluateReactionCollision(p1, p2, i, j);
        }
      }
    }
  }

  function resolveElasticCollision(p1, p2, dx, dy, dist) {
    if (p1.isSolidBlock || p2.isSolidBlock) {
      // Bounce mobile particle away from solid block
      const solid = p1.isSolidBlock ? p1 : p2;
      const mobile = p1.isSolidBlock ? p2 : p1;
      
      const bounceDx = mobile.x - solid.x;
      const bounceDy = mobile.y - solid.y;
      const bounceDist = Math.sqrt(bounceDx*bounceDx + bounceDy*bounceDy);
      
      mobile.vx = (bounceDx / bounceDist) * (1.2 + temperature / 50);
      mobile.vy = (bounceDy / bounceDist) * (1.2 + temperature / 50);
      return;
    }

    // Normal elastic physics
    const nx = dx / dist;
    const ny = dy / dist;

    // Target velocity vectors relative to normal axes
    const kx = p1.vx - p2.vx;
    const ky = p1.vy - p2.vy;
    const relativeVelocity = kx * nx + ky * ny;

    if (relativeVelocity > 0) {
      // Swap normal velocities
      p1.vx -= relativeVelocity * nx;
      p1.vy -= relativeVelocity * ny;
      p2.vx += relativeVelocity * nx;
      p2.vy += relativeVelocity * ny;
    }
  }

  function evaluateReactionCollision(p1, p2, idx1, idx2) {
    // 1. Check if they are valid reactants
    const reactionPossible = checkReactantCompatibility(p1.type, p2.type);
    if (!reactionPossible) return;

    // 2. Compute Arrhenius collision probability
    // probability = P_base * exp(-E_a / R*T) * catalyst_multiplier
    const ea = catalystActive ? activePreset.eaCatalyzed : activePreset.eaNormal;
    
    // Map absolute temperature Kelvin
    const kelvin = temperature + 273.15;
    
    // Scale activation factor
    const probability = Math.exp(-ea / (0.3 * (kelvin / 10)));
    
    if (Math.random() < probability) {
      triggerMolecularReaction(p1, p2, idx1, idx2);
    }
  }

  function checkReactantCompatibility(t1, t2) {
    if (activePresetKey === 'neutralization') {
      // Acid A + Base B
      return (t1 === 'A' && t2 === 'B') || (t1 === 'B' && t2 === 'A');
    }
    if (activePresetKey === 'combustion') {
      // H2 A + O2 B
      return (t1 === 'A' && t2 === 'B') || (t1 === 'B' && t2 === 'A');
    }
    if (activePresetKey === 'displacement') {
      // Solid metal A + Solution ions B
      return (t1 === 'A' && t2 === 'B') || (t1 === 'B' && t2 === 'A');
    }
    if (activePresetKey === 'decomposition') {
      // H2O2 is single reactant. Reacts on self-collision or catalyst contact
      if (catalystActive) {
        // If catalyst is on, collisions react easily
        return (t1 === 'A');
      }
      return (t1 === 'A' && t2 === 'A');
    }
    if (activePresetKey === 'precipitation') {
      // AgNO3 + NaCl
      return (t1 === 'A' && t2 === 'B') || (t1 === 'B' && t2 === 'A');
    }
    return false;
  }

  function triggerMolecularReaction(p1, p2, idx1, idx2) {
    // Average coordinate coordinates for visual effects
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    // Spawn transient visual flash
    particles.push({
      x: midX,
      y: midY,
      vx: 0, vy: 0, radius: 15,
      type: 'spark',
      color: 'rgba(255, 229, 0, 0.7)',
      life: 1.0
    });

    // Handle reactant updates depending on preset rules
    if (activePresetKey === 'neutralization') {
      // HCl + NaOH -> NaCl + H2O. Convert both particles to green product
      p1.type = 'C';
      p1.color = activePreset.chemicals.C.color;
      p2.type = 'C';
      p2.color = activePreset.chemicals.C.color;

    } else if (activePresetKey === 'combustion') {
      // 2H2 + O2 -> 2H2O. Stoichiometric ratios. Remove reactants and spawn clear water vapors
      p1.type = 'C';
      p1.color = activePreset.chemicals.C.color;
      
      // Turn p2 to bubble rising up
      p2.type = 'bubble';
      p2.color = activePreset.chemicals.C.color;
      p2.radius = 4;
      p2.vy = -1;

    } else if (activePresetKey === 'displacement') {
      // Fe (A) + CuSO4 (B) -> FeSO4 (C) + Cu (D). Fe fades, copper precipitate drops
      if (p1.isSolidBlock || p2.isSolidBlock) {
        // Handle solid shelf collision
        const mobile = p1.isSolidBlock ? p2 : p1;
        mobile.type = 'C'; // dissolved solution turns to green FeSO4 product
        mobile.color = activePreset.chemicals.C.color;
        
        // Spawn copper precipitate dropping down
        particles.push({
          x: mobile.x,
          y: mobile.y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.2,
          radius: 5,
          type: 'precipitate',
          color: activePreset.chemicals.D.color,
          isSolidBlock: false,
          life: 1.0
        });
      } else {
        // Powder collisions
        p1.type = 'C'; // FeSO4
        p1.color = activePreset.chemicals.C.color;
        
        p2.type = 'precipitate'; // Cu(s)
        p2.color = activePreset.chemicals.D.color;
        p2.radius = 5;
        p2.vy = 0.5; // fall
      }

    } else if (activePresetKey === 'decomposition') {
      // 2H2O2 -> 2H2O + O2(g)
      p1.type = 'C'; // Water product
      p1.color = activePreset.chemicals.C.color;
      
      p2.type = 'bubble'; // Oxygen bubble
      p2.color = activePreset.chemicals.E.color;
      p2.radius = 3.5;
      p2.vy = -1;

    } else if (activePresetKey === 'precipitation') {
      // AgNO3 + NaCl -> AgCl(s) + NaNO3
      p1.type = 'C'; // NaNO3 product
      p1.color = activePreset.chemicals.C.color;
      
      p2.type = 'precipitate_white'; // AgCl precipitate
      p2.color = activePreset.chemicals.D.color;
      p2.radius = 5.5;
      p2.vy = 0.4;
    }

    // Dynamic beaker liquid background adjustments
    adjustBeakerLiquidColor();
  }

  function adjustBeakerLiquidColor() {
    const counts = getCurrentBaseCounts();
    const total = counts.A + counts.B + counts.C;
    if (total === 0) return;

    if (activePresetKey === 'neutralization') {
      // Solution color represents pH level (ratio of acid HCl to base NaOH)
      const acidPct = counts.A / total;
      const basePct = counts.B / total;
      
      if (acidPct > 0.55) {
        beakerLiquidFill.style.backgroundColor = "rgba(239, 68, 68, 0.18)"; // Acid red
      } else if (basePct > 0.55) {
        beakerLiquidFill.style.backgroundColor = "rgba(139, 92, 246, 0.18)"; // Base purple
      } else {
        // Neutral salt solution
        beakerLiquidFill.style.backgroundColor = "rgba(16, 185, 129, 0.15)"; // neutral green
      }
    } else if (activePresetKey === 'displacement') {
      // Transition from CuSO4 deep blue to FeSO4 green solution
      const cuPct = counts.B / total;
      const r = Math.round(59 * cuPct + 16 * (1 - cuPct));
      const g = Math.round(130 * cuPct + 185 * (1 - cuPct));
      const b = Math.round(246 * cuPct + 129 * (1 - cuPct));
      beakerLiquidFill.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.18)`;
    }
  }

  function getCurrentBaseCounts() {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    particles.forEach(p => {
      if (p.type === 'A') counts.A++;
      else if (p.type === 'B') counts.B++;
      else if (p.type === 'C') counts.C++;
      else if (p.type === 'precipitate' || p.type === 'precipitate_white') counts.D++;
      else if (p.type === 'bubble') counts.E++;
    });
    return counts;
  }

  // --- RENDERING CANVAS BEAKER PARTICLES ---
  function drawBeaker() {
    if (!beakerCtx) return;

    beakerCtx.clearRect(0, 0, beakerCanvas.width, beakerCanvas.height);

    // Draw particles
    particles.forEach(p => {
      if (p.type === 'spark') {
        // Draw expanding light flash
        const radGrad = beakerCtx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
        radGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
        radGrad.addColorStop(0.3, 'rgba(255, 180, 0, 0.8)');
        radGrad.addColorStop(1, 'rgba(255,0,0,0)');
        
        beakerCtx.beginPath();
        beakerCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        beakerCtx.fillStyle = radGrad;
        beakerCtx.fill();
        
        p.life -= 0.08; // spark decay
        return;
      }

      if (p.type === 'bubble') {
        // Draw transparent rising gas bubble
        beakerCtx.beginPath();
        beakerCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        beakerCtx.strokeStyle = `rgba(255, 255, 255, ${0.1 + 0.3 * p.life})`;
        beakerCtx.lineWidth = 1;
        beakerCtx.stroke();
        
        // Glare spot
        beakerCtx.beginPath();
        beakerCtx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, 1, 0, 2 * Math.PI);
        beakerCtx.fillStyle = `rgba(255, 255, 255, ${0.25 * p.life})`;
        beakerCtx.fill();
        return;
      }

      if (p.isSolidBlock) {
        // Draw solid shelf representing metal block
        beakerCtx.beginPath();
        beakerCtx.roundRect(p.x - 70, p.y - 10, 140, 20, 6);
        beakerCtx.fillStyle = p.color;
        beakerCtx.shadowColor = p.color;
        beakerCtx.shadowBlur = 8;
        beakerCtx.fill();
        beakerCtx.shadowBlur = 0; // reset
        
        beakerCtx.strokeStyle = "rgba(255,255,255,0.2)";
        beakerCtx.stroke();
        return;
      }

      // Standard particle
      beakerCtx.beginPath();
      beakerCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      beakerCtx.fillStyle = p.color;
      
      // Sparkly glow indicators
      if (p.type === 'A' || p.type === 'B') {
        beakerCtx.shadowColor = p.color;
        beakerCtx.shadowBlur = 4;
      }
      beakerCtx.fill();
      beakerCtx.shadowBlur = 0; // reset

      beakerCtx.strokeStyle = "rgba(255,255,255,0.18)";
      beakerCtx.lineWidth = 0.5;
      beakerCtx.stroke();
    });

    // Render counts on UI
    const c = getCurrentBaseCounts();
    countA.textContent = c.A;
    countB.textContent = c.B;
    countProd.textContent = c.C + c.D + c.E;
  }

  // --- CONCENTRATION RATE CHARTING ---
  function resetChartHistory() {
    reactantHistory = [];
    productHistory = [];
    timeTicks = 0;
  }

  function logChartData() {
    if (!isRunning) return;
    
    // Sample every 15 frames to prevent chart overloading
    timeTicks++;
    if (timeTicks % 15 !== 0) return;

    const counts = getCurrentBaseCounts();
    const total = counts.A + counts.B + counts.C + counts.D + counts.E;

    let rRatio = 0;
    let pRatio = 0;
    
    if (total > 0) {
      rRatio = (counts.A + counts.B) / total;
      pRatio = (counts.C + counts.D + counts.E) / total;
    }

    reactantHistory.push(rRatio);
    productHistory.push(pRatio);

    if (reactantHistory.length > maxHistoryPoints) {
      reactantHistory.shift();
      productHistory.shift();
    }

    drawChart();
  }

  function drawChart() {
    if (!chartCtx) return;

    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    const w = chartCanvas.width;
    const h = chartCanvas.height;
    const padding = 15;

    // Draw background grid lines
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    chartCtx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const lineY = padding + i * (h - 2 * padding) / 4;
      chartCtx.beginPath();
      chartCtx.moveTo(padding, lineY);
      chartCtx.lineTo(w - padding, lineY);
      chartCtx.stroke();
    }

    if (reactantHistory.length < 2) return;

    // Plot reactants curve
    chartCtx.beginPath();
    chartCtx.strokeStyle = "var(--color-react-a)";
    chartCtx.lineWidth = 2.5;
    
    let stepX = (w - 2 * padding) / (maxHistoryPoints - 1);
    
    reactantHistory.forEach((val, idx) => {
      const cx = padding + idx * stepX;
      const cy = h - padding - val * (h - 2 * padding);
      if (idx === 0) chartCtx.moveTo(cx, cy);
      else chartCtx.lineTo(cx, cy);
    });
    chartCtx.stroke();

    // Plot products curve
    chartCtx.beginPath();
    chartCtx.strokeStyle = "var(--color-prod)";
    chartCtx.lineWidth = 2.5;
    
    productHistory.forEach((val, idx) => {
      const cx = padding + idx * stepX;
      const cy = h - padding - val * (h - 2 * padding);
      if (idx === 0) chartCtx.moveTo(cx, cy);
      else chartCtx.lineTo(cx, cy);
    });
    chartCtx.stroke();
  }

  // --- SVG THERMODYNAMIC ENERGY CURVE ---
  function renderEnergyProfile() {
    energyProfileSvg.innerHTML = "";
    
    // Potential Energy coordinates
    // Reactants height = 120
    // Transition State peak = 120 - Ea
    // Products height = 120 - DeltaH
    const eaVal = catalystActive ? activePreset.eaCatalyzed : activePreset.eaNormal;
    const dhVal = activePreset.deltaH;

    // Scale values to fit inside 300x180 canvas bounds
    // Map DeltaH from kJ/mol (-250 to +50) to pixels (height range 30 to 150)
    // Map Ea from units (0 to 100) to height
    const yReact = 110;
    const yPeak = yReact - (eaVal * 0.9);
    
    // Scale delta H. For combustion (-241.8) delta H should drop low.
    // If dhVal is negative (exothermic), products are lower (larger Y value)
    const yProd = yReact - (dhVal * 0.22); 

    lblEaVal.textContent = `${eaVal} kJ/mol`;

    // 1. Plot Bezier path curve
    // Draw standard potential energy curve path
    const pathCurve = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M 30 ${yReact} C 90 ${yReact}, 110 ${yPeak}, 150 ${yPeak} C 190 ${yPeak}, 210 ${yProd}, 270 ${yProd}`;
    pathCurve.setAttribute("d", d);
    pathCurve.setAttribute("fill", "none");
    pathCurve.setAttribute("stroke", "var(--color-brand)");
    pathCurve.setAttribute("stroke-width", "3");
    pathCurve.setAttribute("filter", "url(#neonGlow)");
    energyProfileSvg.appendChild(pathCurve);

    // 2. Plot uncatalyzed alternate path if catalyst is active
    if (activePreset.hasCatalyst && catalystActive) {
      // Draw higher dashed curve for comparison
      const pathUncat = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const uncatPeakY = yReact - (activePreset.eaNormal * 0.9);
      const dUncat = `M 30 ${yReact} C 90 ${yReact}, 110 ${uncatPeakY}, 150 ${uncatPeakY} C 190 ${uncatPeakY}, 210 ${yProd}, 270 ${yProd}`;
      pathUncat.setAttribute("d", dUncat);
      pathUncat.setAttribute("fill", "none");
      pathUncat.setAttribute("stroke", "rgba(255,255,255,0.18)");
      pathUncat.setAttribute("stroke-width", "2");
      pathUncat.setAttribute("stroke-dasharray", "4 4");
      energyProfileSvg.appendChild(pathUncat);
    }

    // 3. Draw text label markers
    // Reactants Label
    const textReact = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textReact.setAttribute("x", "30");
    textReact.setAttribute("y", (yReact + 16).toString());
    textReact.setAttribute("fill", "var(--text-secondary)");
    textReact.setAttribute("font-size", "9");
    textReact.setAttribute("font-family", "var(--font-sans)");
    textReact.textContent = activePreset.reactantsText;
    energyProfileSvg.appendChild(textReact);

    // Products Label
    const textProd = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textProd.setAttribute("x", "220");
    textProd.setAttribute("y", (yProd - 8).toString());
    textProd.setAttribute("fill", "var(--color-prod)");
    textProd.setAttribute("font-size", "9");
    textProd.setAttribute("font-family", "var(--font-sans)");
    textProd.textContent = activePreset.chemicals.C.name.split(" ")[0];
    energyProfileSvg.appendChild(textProd);

    // Delta H height indicator line
    const lineDh = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineDh.setAttribute("x1", "210");
    lineDh.setAttribute("y1", yReact.toString());
    lineDh.setAttribute("x2", "210");
    lineDh.setAttribute("y2", yProd.toString());
    lineDh.setAttribute("stroke", "var(--color-react-a)");
    lineDh.setAttribute("stroke-width", "1");
    lineDh.setAttribute("stroke-dasharray", "2 2");
    energyProfileSvg.appendChild(lineDh);
  }

  // --- CORE RENDER LOOP ---
  function renderLoop() {
    updatePhysics();
    drawBeaker();
    logChartData();
    
    requestAnimationFrame(renderLoop);
  }

  // Start program
  init();
});
