/**
 * Atomic Structure Explorer - Simulation Logic
 * Author: Sujal
 * Version: v2.5.0-QUANTUM
 */

// Element Presets & Properties (Hydrogen to Calcium, Z = 1 to 20)
const ELEMENT_DATA = {
  1: { symbol: 'H', name: 'Hydrogen', group: '1 (Alkali Metal / Gas)', period: 1, stableNeutrons: [0, 1], stdNeutrons: 0, desc: 'The most abundant chemical substance in the universe. Standard hydrogen has 0 neutrons (Protium).' },
  2: { symbol: 'He', name: 'Helium', group: '18 (Noble Gas)', period: 1, stableNeutrons: [1, 2], stdNeutrons: 2, desc: 'Colorless, odorless noble gas. Extremely low boiling point, does not react under normal conditions.' },
  3: { symbol: 'Li', name: 'Lithium', group: '1 (Alkali Metal)', period: 2, stableNeutrons: [3, 4], stdNeutrons: 4, desc: 'Highly reactive alkali metal. Lightest solid element, critical for modern lithium-ion batteries.' },
  4: { symbol: 'Be', name: 'Beryllium', group: '2 (Alkaline Earth Metal)', period: 2, stableNeutrons: [5], stdNeutrons: 5, desc: 'Strong, lightweight, and toxic alkaline earth metal. Used in spacecraft components and X-ray windows.' },
  5: { symbol: 'B', name: 'Boron', group: '13 (Metalloid)', period: 2, stableNeutrons: [5, 6], stdNeutrons: 6, desc: 'Metalloid element. Essential in borosilicate glass production and semiconductor doping.' },
  6: { symbol: 'C', name: 'Carbon', group: '14 (Reactive Nonmetal)', period: 2, stableNeutrons: [6, 7], stdNeutrons: 6, desc: 'Tetravalent nonmetal. The chemical basis for all known organic life and carbon-dating models.' },
  7: { symbol: 'N', name: 'Nitrogen', group: '15 (Reactive Nonmetal)', period: 2, stableNeutrons: [7, 8], stdNeutrons: 7, desc: 'Diatomic nonmetal gas making up 78% of Earth\'s atmosphere. Crucial for proteins and DNA synthesis.' },
  8: { symbol: 'O', name: 'Oxygen', group: '16 (Reactive Nonmetal)', period: 2, stableNeutrons: [8, 9, 10], stdNeutrons: 8, desc: 'Highly reactive chalcogen gas. Vital oxidizer for cellular respiration and combustion reactions.' },
  9: { symbol: 'F', name: 'Fluorine', group: '17 (Halogen)', period: 2, stableNeutrons: [10], stdNeutrons: 10, desc: 'Extremely toxic and reactive halogen gas. Strongest electronegative element in the periodic table.' },
  10: { symbol: 'Ne', name: 'Neon', group: '18 (Noble Gas)', period: 2, stableNeutrons: [10, 11, 12], stdNeutrons: 10, desc: 'Chemically inert noble gas. Glows with a distinctive reddish-orange light in neon discharge tubes.' },
  11: { symbol: 'Na', name: 'Sodium', group: '1 (Alkali Metal)', period: 3, stableNeutrons: [12], stdNeutrons: 12, desc: 'Soft, silver-white alkali metal. Reacts violently with water; critical electrolyte for human nerve signaling.' },
  12: { symbol: 'Mg', name: 'Magnesium', group: '2 (Alkaline Earth Metal)', period: 3, stableNeutrons: [12, 13, 14], stdNeutrons: 12, desc: 'Shiny gray alkaline earth metal. Burns with a brilliant white light. Central atom in chlorophyll molecule.' },
  13: { symbol: 'Al', name: 'Aluminum', group: '13 (Post-Transition Metal)', period: 3, stableNeutrons: [14], stdNeutrons: 14, desc: 'Low-density, corrosion-resistant post-transition metal. The most abundant metal in Earth\'s crust.' },
  14: { symbol: 'Si', name: 'Silicon', group: '14 (Metalloid)', period: 3, stableNeutrons: [14, 15, 16], stdNeutrons: 14, desc: 'Hard crystalline metalloid. The foundation of silicon-based semiconductors and modern microelectronics.' },
  15: { symbol: 'P', name: 'Phosphorus', group: '15 (Reactive Nonmetal)', period: 3, stableNeutrons: [16], stdNeutrons: 16, desc: 'Highly reactive nonmetal. Vital structural element in ATP (adenosine triphosphate) energy transfers.' },
  16: { symbol: 'S', name: 'Sulfur', group: '16 (Reactive Nonmetal)', period: 3, stableNeutrons: [16, 17, 18, 20], stdNeutrons: 16, desc: 'Abundant, multivalent nonmetal. Yellow solid at room temperature; key component in amino acids.' },
  17: { symbol: 'Cl', name: 'Chlorine', group: '17 (Halogen)', period: 3, stableNeutrons: [18, 20], stdNeutrons: 18, desc: 'Yellow-green halogen gas. Strong disinfectant used in water purification and table salt (NaCl).' },
  18: { symbol: 'Ar', name: 'Argon', group: '18 (Noble Gas)', period: 3, stableNeutrons: [18, 20, 22], stdNeutrons: 22, desc: 'Colorless, odorless noble gas. Third-most abundant atmospheric gas, commonly used in welding shields.' },
  19: { symbol: 'K', name: 'Potassium', group: '1 (Alkali Metal)', period: 4, stableNeutrons: [20, 22], stdNeutrons: 20, desc: 'Silver-white alkali metal that oxidizes rapidly. Essential nutrient for cellular fluid balance.' },
  20: { symbol: 'Ca', name: 'Calcium', group: '2 (Alkaline Earth Metal)', period: 4, stableNeutrons: [20, 22, 23, 24, 26, 28], stdNeutrons: 20, desc: 'Gray alkaline earth metal. The fifth-most abundant element, essential for bone structures and muscle actions.' }
};

// Physics Constants
const RYDBERG_CONSTANT = 1.097373e7; // m^-1
const SPEED_OF_LIGHT = 2.99792e8; // m/s
const BOHR_RADIUS_BASE = 8.0; // Base radial multiplier (in pixels) for r_n = n^2 * r_0

// App State
let simState = {
  protons: 6,
  neutrons: 6,
  electrons: 6,
  
  // Orbits state
  isPlaying: true,
  orbitSpeed: 1.0,
  orbitAngles: [0, 0, 0, 0, 0, 0], // Angles for shells n = 1 to 6
  
  // Electron shell occupancy distribution
  // K (n=1), L (n=2), M (n=3), N (n=4), O (n=5), P (n=6)
  shells: [2, 4, 0, 0, 0, 0], 
  
  // Active transitions
  transition: null, // { type: 'excite'|'relax', ni, nf, progress, duration, electronAngle, photon }
  
  // Highlighting spectral lines
  activeSpectralLine: null, // { wavelength, color, intensity }
  
  // UI and rendering
  time: 0,
  nucleusParticles: []
};

// DOM Elements
const elProtonsVal = document.getElementById('val-protons');
const elNeutronsVal = document.getElementById('val-neutrons');
const elElectronsVal = document.getElementById('val-electrons');

const btnDecProtons = document.getElementById('btn-dec-protons');
const btnIncProtons = document.getElementById('btn-inc-protons');
const btnDecNeutrons = document.getElementById('btn-dec-neutrons');
const btnIncNeutrons = document.getElementById('btn-inc-neutrons');
const btnDecElectrons = document.getElementById('btn-dec-electrons');
const btnIncElectrons = document.getElementById('btn-inc-electrons');

const selectInitial = document.getElementById('select-initial-shell');
const selectFinal = document.getElementById('select-final-shell');
const btnExcite = document.getElementById('btn-transition-excite');
const btnRelax = document.getElementById('btn-transition-relax');

const hudMass = document.getElementById('hud-mass');
const hudProtons = document.getElementById('hud-protons');
const hudCharge = document.getElementById('hud-charge');

const btnPlayPause = document.getElementById('btn-play-pause');
const playIcon = document.getElementById('play-icon');
const playText = document.getElementById('play-text');
const btnResetAtom = document.getElementById('btn-reset-atom');
const speedBtns = document.querySelectorAll('.speed-btn');

const presetBtns = document.querySelectorAll('.preset-btn');

const ledElementName = document.getElementById('led-element-name');
const lblIsotopeStability = document.getElementById('lbl-isotope-stability');
const ledIonType = document.getElementById('led-ion-type');
const ledElectronConfig = document.getElementById('led-electron-config');
const ledShellLedger = document.getElementById('led-shell-ledger');
const ledWavelength = document.getElementById('led-wavelength');

const lblSpectralSeries = document.getElementById('lbl-spectral-series');
const canvasSpectrometer = document.getElementById('canvas-spectrometer');
const loggerConsole = document.getElementById('logger-console');
const btnClearLogs = document.getElementById('btn-clear-logs');

const mainCanvas = document.getElementById('sim-canvas');

// Canvas Contexts
const ctxMain = mainCanvas.getContext('2d');
const ctxSpec = canvasSpectrometer.getContext('2d');

// Helper: Shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Populate Dropdowns Dynamically to include Shells 5 and 6
function setupDropdowns() {
  selectInitial.innerHTML = `
    <option value="6">Shell 6 (P)</option>
    <option value="5">Shell 5 (O)</option>
    <option value="4">Shell 4 (N)</option>
    <option value="3" selected>Shell 3 (M)</option>
    <option value="2">Shell 2 (L)</option>
  `;
  
  selectFinal.innerHTML = `
    <option value="5">Shell 5 (O)</option>
    <option value="4">Shell 4 (N)</option>
    <option value="3">Shell 3 (M)</option>
    <option value="2" selected>Shell 2 (L)</option>
    <option value="1">Shell 1 (K)</option>
  `;
}

// Convert Wavelength to RGB hex for canvas drawings
function wavelengthToRGB(wavelengthNm) {
  let r, g, b, alpha = 1.0;
  
  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    r = 0.0;
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1.0;
    g = -(wavelengthNm - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  } else {
    // Ultraviolet (<380) or Infrared (>780) - invisible
    return { r: 120, g: 120, b: 120, isVisible: false, hex: '#78828f' };
  }

  // Adjust intensity near the limits of human vision
  let factor = 0.0;
  if (wavelengthNm >= 380 && wavelengthNm < 420) {
    factor = 0.3 + 0.7 * (wavelengthNm - 380) / (420 - 380);
  } else if (wavelengthNm >= 420 && wavelengthNm < 701) {
    factor = 1.0;
  } else if (wavelengthNm >= 701 && wavelengthNm <= 780) {
    factor = 0.3 + 0.7 * (780 - wavelengthNm) / (780 - 701);
  }
  
  r = Math.round(r * factor * 255);
  g = Math.round(g * factor * 255);
  b = Math.round(b * factor * 255);
  
  const toHex = (c) => c.toString(16).padStart(2, '0');
  return { r, g, b, isVisible: true, hex: `#${toHex(r)}${toHex(g)}${toHex(b)}` };
}

// Generate dense packed nuclear sphere structure
function generateNucleusStructure() {
  const Z = simState.protons;
  const N = simState.neutrons;
  const total = Z + N;
  
  let particleTypes = [];
  for (let i = 0; i < Z; i++) particleTypes.push('proton');
  for (let i = 0; i < N; i++) particleTypes.push('neutron');
  
  // Shuffle to interleave protons and neutrons cleanly
  shuffle(particleTypes);
  
  const spacing = 7.5; // pixel spacing between packed particles
  let particles = [];
  
  for (let i = 0; i < total; i++) {
    // Fermat's spiral packing
    const r = spacing * Math.sqrt(i + 0.5);
    const theta = i * 2.39996; // Golden Angle
    
    particles.push({
      type: particleTypes[i],
      localX: r * Math.cos(theta),
      localY: r * Math.sin(theta),
      z: Math.random() // Used for sorting render layers
    });
  }
  
  // Sort by z-value so that overlapping particles render in order
  particles.sort((a, b) => a.z - b.z);
  simState.nucleusParticles = particles;
}

// Distribute electrons to Bohr shells under ground state rules
function getGroundStateConfiguration(electronsCount) {
  let remaining = electronsCount;
  // Capacities: K:2, L:8, M:8, N:2 (standard ground configuration up to Z=20)
  // If electrons exceed 20, fill outward.
  const capacities = [2, 8, 8, 2, 8, 18]; // Capacities for shells n=1 to 6
  let configs = [0, 0, 0, 0, 0, 0];
  
  for (let i = 0; i < configs.length; i++) {
    const fill = Math.min(remaining, capacities[i]);
    configs[i] = fill;
    remaining -= fill;
    if (remaining <= 0) break;
  }
  
  // If there are still electrons left, dump them in outer shell
  if (remaining > 0) {
    configs[5] += remaining;
  }
  
  return configs;
}

// Write line logs to retro console simulator
function addConsoleLog(text, type = 'sys') {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  
  let prefix = '[SYS]';
  if (type === 'phys') prefix = '[PHYSICS]';
  if (type === 'warn') prefix = '[WARNING]';
  if (type === 'event') prefix = '[QUANTUM]';
  
  entry.textContent = `[${timeStr}] ${prefix} ${text}`;
  loggerConsole.appendChild(entry);
  
  // Auto-scroll to bottom
  loggerConsole.scrollTop = loggerConsole.scrollHeight;
}

// Solve Rydberg parameters
function calculateRydberg(ni, nf) {
  if (ni <= nf) return null;
  
  // Rydberg formula: 1/lambda = R_H * (1/nf^2 - 1/ni^2)
  const invWavelength = RYDBERG_CONSTANT * (1 / (nf * nf) - 1 / (ni * ni));
  const wavelengthM = 1 / invWavelength;
  const wavelengthNm = wavelengthM * 1e9;
  
  // Calculate energy transition ΔE = h*c / lambda
  // h = 4.1357e-15 eV*s, c = 3e8 m/s => h*c = 1240 eV*nm
  const energyEV = 1239.84 / wavelengthNm;
  
  // Series identification
  let seriesName = 'Quantum';
  if (nf === 1) seriesName = 'Lyman (UV)';
  else if (nf === 2) seriesName = 'Balmer (Visible)';
  else if (nf === 3) seriesName = 'Paschen (IR)';
  else if (nf === 4) seriesName = 'Brackett (IR)';
  else if (nf === 5) seriesName = 'Pfund (IR)';
  
  return {
    wavelength: wavelengthNm,
    energy: energyEV,
    series: seriesName
  };
}

// Return radius of Bohr shell n on screen
function getShellRadius(n) {
  // Use quadratic radius model: r_n = n^2 * r_0
  return n * n * BOHR_RADIUS_BASE + 25.0; // Offset slightly so n=1 is readable outside the nucleus
}

// Setup active states based on variables
function syncStateToUI() {
  const Z = simState.protons;
  const N = simState.neutrons;
  const E = simState.electrons;
  
  // Update numerical counters
  elProtonsVal.textContent = Z;
  elNeutronsVal.textContent = N;
  elElectronsVal.textContent = E;
  
  // Handle HUD
  hudMass.textContent = Z + N;
  hudProtons.textContent = Z;
  
  const charge = Z - E;
  if (charge === 0) {
    hudCharge.textContent = '0';
    ledIonType.textContent = 'NEUTRAL ATOM';
    ledIonType.style.color = 'var(--color-neutral)';
  } else if (charge > 0) {
    hudCharge.textContent = `+${charge}`;
    ledIonType.textContent = `CATION (+${charge})`;
    ledIonType.style.color = 'var(--color-cation)';
  } else {
    hudCharge.textContent = `${charge}`;
    ledIonType.textContent = `ANION (${charge})`;
    ledIonType.style.color = 'var(--color-anion)';
  }
  
  // Element Profiles
  const profile = ELEMENT_DATA[Z];
  if (profile) {
    ledElementName.textContent = `${profile.name.toUpperCase()}-${Z + N}`;
    
    // Check stability
    const isStable = profile.stableNeutrons.includes(N);
    if (isStable) {
      lblIsotopeStability.textContent = 'STABLE ISOTOPE';
      lblIsotopeStability.className = 'green-glow';
    } else {
      let decay = 'Unstable Beta Decay';
      if (N < Math.min(...profile.stableNeutrons)) {
        decay = 'Beta+ Positron Emission / Electron Capture';
      } else if (N > Math.max(...profile.stableNeutrons)) {
        decay = 'Beta- Emission (Radioactive)';
      }
      lblIsotopeStability.textContent = 'UNSTABLE / RADIOACTIVE';
      lblIsotopeStability.className = 'yellow-glow';
    }
    
    // Configurations display
    // Clean trailing zeros for configuration
    const activeShells = simState.shells.filter((v, idx) => idx < 6);
    let lastNonZeroIdx = 0;
    for (let i = 0; i < activeShells.length; i++) {
      if (activeShells[i] > 0) lastNonZeroIdx = i;
    }
    const configStr = activeShells.slice(0, lastNonZeroIdx + 1).join(', ') || '0';
    ledElectronConfig.textContent = configStr;
    
    // Occupancy labels
    const labels = ['K', 'L', 'M', 'N', 'O', 'P'];
    const ledgerItems = labels.map((l, idx) => `${l}: ${simState.shells[idx]}`);
    ledShellLedger.textContent = ledgerItems.join(', ');
  }
}

// Adjust counters
function modifyProtons(delta) {
  const oldVal = simState.protons;
  const newVal = Math.min(Math.max(simState.protons + delta, 1), 20);
  if (oldVal !== newVal) {
    simState.protons = newVal;
    
    // Automatically match electrons for neutral atom if it wasn't already configured manually,
    // or just let users construct ions. Let's make electrons match protons to be convenient!
    simState.electrons = newVal;
    simState.shells = getGroundStateConfiguration(newVal);
    
    generateNucleusStructure();
    syncStateToUI();
    
    const profile = ELEMENT_DATA[newVal];
    addConsoleLog(`Loaded preset ${profile.name} (Z=${newVal}). ${profile.desc}`, 'phys');
    
    // Sync presets active states
    presetBtns.forEach(btn => {
      const zVal = getPresetProtons(btn.getAttribute('data-preset'));
      if (zVal === newVal) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

function modifyNeutrons(delta) {
  const oldVal = simState.neutrons;
  const newVal = Math.min(Math.max(simState.neutrons + delta, 0), 30);
  if (oldVal !== newVal) {
    simState.neutrons = newVal;
    generateNucleusStructure();
    syncStateToUI();
    
    // Determine stability warning logs
    const Z = simState.protons;
    const profile = ELEMENT_DATA[Z];
    const isStable = profile.stableNeutrons.includes(newVal);
    if (!isStable) {
      let mode = 'decay';
      if (newVal < Math.min(...profile.stableNeutrons)) {
        mode = 'Positron emission (Beta+) / Electron capture';
      } else {
        mode = 'Beta particle emission (Beta-)';
      }
      addConsoleLog(`Warning: Isotope ${profile.name}-${Z+newVal} is radioactive! Principal decay mode: ${mode}.`, 'warn');
    } else {
      addConsoleLog(`Isotope ${profile.name}-${Z+newVal} stabilized.`, 'sys');
    }
  }
}

function modifyElectrons(delta) {
  const oldVal = simState.electrons;
  const newVal = Math.min(Math.max(simState.electrons + delta, 0), 20);
  if (oldVal !== newVal) {
    simState.electrons = newVal;
    simState.shells = getGroundStateConfiguration(newVal);
    syncStateToUI();
    
    const charge = simState.protons - newVal;
    if (charge > 0) {
      addConsoleLog(`Electron detached. Cation created (+${charge} charge state).`, 'sys');
    } else if (charge < 0) {
      addConsoleLog(`Extra electron added. Anion created (${charge} charge state).`, 'sys');
    } else {
      addConsoleLog(`Atom neutral charge state restored.`, 'sys');
    }
  }
}

// Convert preset keys to Z values
function getPresetProtons(presetKey) {
  switch (presetKey) {
    case 'preset-h': return 1;
    case 'preset-he': return 2;
    case 'preset-c': return 6;
    case 'preset-o': return 8;
    case 'preset-ne': return 10;
    case 'preset-na': return 11;
    case 'preset-ca': return 20;
    default: return 6;
  }
}

// Apply Preset
function loadPreset(presetKey) {
  presetBtns.forEach(btn => {
    if (btn.getAttribute('data-preset') === presetKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  const Z = getPresetProtons(presetKey);
  const profile = ELEMENT_DATA[Z];
  
  simState.protons = Z;
  simState.neutrons = profile.stdNeutrons;
  simState.electrons = Z;
  simState.shells = getGroundStateConfiguration(Z);
  
  generateNucleusStructure();
  syncStateToUI();
  
  addConsoleLog(`Preset ${profile.name} loaded successfully (Z=${Z}, N=${profile.stdNeutrons}, E=${Z}).`, 'phys');
}

// Quantum Transition logic (Excite)
function triggerExcitation() {
  if (simState.transition) {
    addConsoleLog('A transition is currently in progress. Please wait.', 'warn');
    return;
  }
  
  const ni = parseInt(selectInitial.value);
  const nf = parseInt(selectFinal.value);
  
  if (ni <= nf) {
    addConsoleLog(`Quantum forbidden: Initial excitation energy shell must be higher than final shell (n_i > n_f).`, 'warn');
    return;
  }
  
  // Excite moves electron from nf (lower) to ni (higher)
  const sourceShellIdx = nf - 1;
  const targetShellIdx = ni - 1;
  
  if (simState.shells[sourceShellIdx] <= 0) {
    addConsoleLog(`Excitation failed: No electrons in source Shell ${nf} to excite.`, 'warn');
    return;
  }
  
  // Calculate Rydberg profile
  const quantumInfo = calculateRydberg(ni, nf);
  const rgb = wavelengthToRGB(quantumInfo.wavelength);
  
  addConsoleLog(`Excitation triggered: Absorbing photon energy at ${quantumInfo.wavelength.toFixed(1)} nm (${quantumInfo.energy.toFixed(2)} eV).`, 'event');
  
  // Setup transition animation parameters
  // The photon travels inwards, hits the electron, then electron moves outward.
  simState.transition = {
    type: 'excite',
    ni,
    nf,
    progress: 0,
    duration: 80, // frames
    electronAngle: simState.orbitAngles[sourceShellIdx] + Math.random() * Math.PI, // Random position on source shell
    photon: {
      active: true,
      x: 0,
      y: 0,
      targetRadius: getShellRadius(nf),
      progress: 0,
      wavelength: quantumInfo.wavelength,
      color: rgb.hex,
      isVisible: rgb.isVisible
    }
  };
  
  // Decrement source shell electron immediately so it is drawn moving
  simState.shells[sourceShellIdx]--;
  syncStateToUI();
}

// Quantum Transition logic (Relax)
function triggerRelaxation() {
  if (simState.transition) {
    addConsoleLog('A transition is currently in progress. Please wait.', 'warn');
    return;
  }
  
  const ni = parseInt(selectInitial.value);
  const nf = parseInt(selectFinal.value);
  
  if (ni <= nf) {
    addConsoleLog(`Quantum forbidden: Emission requires decay from a higher energy shell to a lower shell (n_i > n_f).`, 'warn');
    return;
  }
  
  // Relax moves electron from ni (higher) to nf (lower)
  const sourceShellIdx = ni - 1;
  const targetShellIdx = nf - 1;
  
  if (simState.shells[sourceShellIdx] <= 0) {
    addConsoleLog(`Relaxation failed: No electrons in higher Shell ${ni} to relax.`, 'warn');
    return;
  }
  
  // Calculate Rydberg details
  const quantumInfo = calculateRydberg(ni, nf);
  const rgb = wavelengthToRGB(quantumInfo.wavelength);
  
  addConsoleLog(`Relaxation triggered: Electron decaying ${ni} → ${nf}. Emitting a photon...`, 'event');
  
  // Setup transition
  // Electron moves inward, once it completes, photon shoots outward.
  simState.transition = {
    type: 'relax',
    ni,
    nf,
    progress: 0,
    duration: 80,
    electronAngle: simState.orbitAngles[sourceShellIdx] + Math.random() * Math.PI,
    photon: {
      active: false, // Becomes active when electron hits the final shell
      x: 0,
      y: 0,
      startRadius: getShellRadius(nf),
      progress: 0,
      wavelength: quantumInfo.wavelength,
      color: rgb.hex,
      isVisible: rgb.isVisible,
      series: quantumInfo.series
    }
  };
  
  // Decrement source shell electron immediately
  simState.shells[sourceShellIdx]--;
  syncStateToUI();
}

// Finalize transitions and update configurations
function completeTransition() {
  const t = simState.transition;
  if (!t) return;
  
  if (t.type === 'excite') {
    // Add electron to excited target shell
    simState.shells[t.ni - 1]++;
    addConsoleLog(`Electron successfully excited to Shell ${t.ni}.`, 'event');
    ledWavelength.textContent = `${t.photon.wavelength.toFixed(1)} nm`;
  } else {
    // Add electron to relaxed final shell
    simState.shells[t.nf - 1]++;
    addConsoleLog(`Quantum state relaxed! Emission wavelength: ${t.photon.wavelength.toFixed(1)} nm. Series: ${t.photon.series}.`, 'event');
    
    ledWavelength.textContent = `${t.photon.wavelength.toFixed(1)} nm`;
    
    // Flash corresponding spectral line
    simState.activeSpectralLine = {
      wavelength: t.photon.wavelength,
      color: t.photon.color,
      intensity: 1.0
    };
    
    // Set spectrometer header label
    lblSpectralSeries.textContent = t.photon.series.toUpperCase();
    if (t.nf === 2) {
      lblSpectralSeries.className = 'green-glow';
    } else {
      lblSpectralSeries.className = 'yellow-glow';
    }
  }
  
  simState.transition = null;
  syncStateToUI();
}

// Draw main orbital sandbox canvas
function renderMain() {
  const width = mainCanvas.width;
  const height = mainCanvas.height;
  
  ctxMain.clearRect(0, 0, width, height);
  
  const xc = width / 2;
  const yc = height / 2;
  
  // 1. Draw concentric Bohr orbits
  const maxShells = 6;
  const transitionTarget = simState.transition;
  
  for (let n = 1; n <= maxShells; n++) {
    const r = getShellRadius(n);
    ctxMain.beginPath();
    ctxMain.arc(xc, yc, r, 0, 2 * Math.PI);
    
    // Draw excited/selected lines with highlight
    let isHighlighted = false;
    if (transitionTarget) {
      if (transitionTarget.ni === n || transitionTarget.nf === n) {
        isHighlighted = true;
      }
    }
    
    if (isHighlighted) {
      ctxMain.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctxMain.lineWidth = 1.8;
      ctxMain.setLineDash([]);
    } else {
      ctxMain.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctxMain.lineWidth = 1.0;
      ctxMain.setLineDash([4, 6]);
    }
    ctxMain.stroke();
    ctxMain.setLineDash([]);
    
    // Draw Shell label
    ctxMain.fillStyle = isHighlighted ? '#00e5ff' : 'rgba(148, 163, 184, 0.4)';
    ctxMain.font = '10px JetBrains Mono';
    ctxMain.fillText(`n=${n}`, xc + r * Math.cos(-Math.PI / 4) + 5, yc + r * Math.sin(-Math.PI / 4) - 2);
  }
  
  // 2. Draw orbiting electrons in ground/current states
  for (let n = 1; n <= maxShells; n++) {
    const r = getShellRadius(n);
    const count = simState.shells[n - 1];
    if (count <= 0) continue;
    
    const baseAngle = simState.orbitAngles[n - 1];
    
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i * 2 * Math.PI) / count;
      const ex = xc + r * Math.cos(angle);
      const ey = yc + r * Math.sin(angle);
      
      // Draw rotation trail
      ctxMain.beginPath();
      // Draw a 30 degree arc behind electron
      const trailStart = angle - 0.4;
      ctxMain.arc(xc, yc, r, trailStart, angle);
      ctxMain.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      ctxMain.lineWidth = 2;
      ctxMain.stroke();
      
      // Draw electron sphere
      ctxMain.save();
      ctxMain.shadowColor = '#00e5ff';
      ctxMain.shadowBlur = 6;
      
      const grad = ctxMain.createRadialGradient(ex - 1.5, ey - 1.5, 0.5, ex, ey, 4.5);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#00e5ff');
      
      ctxMain.fillStyle = grad;
      ctxMain.beginPath();
      ctxMain.arc(ex, ey, 4.5, 0, 2 * Math.PI);
      ctxMain.fill();
      ctxMain.restore();
    }
  }
  
  // 3. Draw transitioning electron (if active)
  if (transitionTarget) {
    const t = transitionTarget;
    let r_curr = 0;
    
    if (t.type === 'excite') {
      if (t.photon.active) {
        // Phase 1: Electron stays at source shell, photon moves inward
        r_curr = getShellRadius(t.nf);
      } else {
        // Phase 2: Electron moves outward to target shell
        const p_elec = (t.progress - 0.4) / 0.6; // Scale remaining progress
        r_curr = getShellRadius(t.nf) + p_elec * (getShellRadius(t.ni) - getShellRadius(t.nf));
      }
    } else {
      // Relax: Electron moves inward, once it hits target, photon triggers
      if (t.progress < 0.6) {
        const p_elec = t.progress / 0.6;
        r_curr = getShellRadius(t.ni) - p_elec * (getShellRadius(t.ni) - getShellRadius(t.nf));
      } else {
        // Stays at target shell, photon moves outward
        r_curr = getShellRadius(t.nf);
      }
    }
    
    const ex = xc + r_curr * Math.cos(t.electronAngle);
    const ey = yc + r_curr * Math.sin(t.electronAngle);
    
    ctxMain.save();
    ctxMain.shadowColor = '#ffea00';
    ctxMain.shadowBlur = 10;
    
    const grad = ctxMain.createRadialGradient(ex - 1.5, ey - 1.5, 0.5, ex, ey, 5.5);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ffea00');
    grad.addColorStop(1, '#ff9100');
    
    ctxMain.fillStyle = grad;
    ctxMain.beginPath();
    ctxMain.arc(ex, ey, 5.5, 0, 2 * Math.PI);
    ctxMain.fill();
    ctxMain.restore();
    
    // 4. Draw Transitioning Photon Wave Packet
    const photon = t.photon;
    if (photon.active) {
      let photonR = 0;
      let angle = t.electronAngle;
      
      if (t.type === 'excite') {
        // Incoming wave moves inward
        const R_max = 280; // Start distance
        photonR = R_max - (photon.progress / 0.4) * (R_max - getShellRadius(t.nf));
      } else {
        // Outgoing wave moves outward
        const R_max = 280;
        const p_phot = (t.progress - 0.6) / 0.4;
        photonR = getShellRadius(t.nf) + p_phot * (R_max - getShellRadius(t.nf));
      }
      
      const px = xc + photonR * Math.cos(angle);
      const py = yc + photonR * Math.sin(angle);
      
      ctxMain.save();
      ctxMain.translate(px, py);
      ctxMain.rotate(angle); // Align wave packet radially
      
      ctxMain.strokeStyle = photon.color;
      ctxMain.lineWidth = 1.8;
      ctxMain.shadowColor = photon.color;
      ctxMain.shadowBlur = 8;
      
      // Calculate frequency multiplier based on wavelength
      // Visual scale: map 380nm (UV/violet) -> short period, 750nm (IR/red) -> long period
      const screenWavelength = 8 + (photon.wavelength - 380) * (18 / 400); // 8px to 26px period
      const waveFreq = (2 * Math.PI) / screenWavelength;
      
      ctxMain.beginPath();
      const length = 45; // total visual packet span
      for (let x = -length; x <= length; x += 0.5) {
        // Gaussian envelope for wave packet structure
        const env = Math.exp(-Math.pow(x / 14.0, 2));
        const yVal = Math.sin(x * waveFreq - simState.time * 0.3) * env * 10;
        
        if (x === -length) {
          ctxMain.moveTo(x, yVal);
        } else {
          ctxMain.lineTo(x, yVal);
        }
      }
      ctxMain.stroke();
      ctxMain.restore();
    }
  }
  
  // 5. Draw nuclear core structure
  const nucleusJitter = simState.isPlaying ? 0.7 : 0.0;
  
  simState.nucleusParticles.forEach(p => {
    // Add high-frequency thermal vibration
    const jitterX = (Math.random() - 0.5) * nucleusJitter;
    const jitterY = (Math.random() - 0.5) * nucleusJitter;
    
    const nx = xc + p.localX + jitterX;
    const ny = yc + p.localY + jitterY;
    const radius = 6.5;
    
    ctxMain.beginPath();
    ctxMain.arc(nx, ny, radius, 0, 2 * Math.PI);
    
    // Create 3D spherical gradients
    const grad = ctxMain.createRadialGradient(nx - 2, ny - 2, 0.5, nx, ny, radius);
    if (p.type === 'proton') {
      grad.addColorStop(0, '#ffa0b0');
      grad.addColorStop(1, '#ff1744');
      ctxMain.shadowColor = 'rgba(255, 23, 68, 0.4)';
      ctxMain.shadowBlur = 4;
    } else {
      grad.addColorStop(0, '#e2e8f0');
      grad.addColorStop(1, '#64748b');
      ctxMain.shadowColor = 'rgba(100, 116, 139, 0.2)';
      ctxMain.shadowBlur = 3;
    }
    
    ctxMain.fillStyle = grad;
    ctxMain.fill();
    ctxMain.shadowBlur = 0; // Reset
    
    // Draw subtle border
    ctxMain.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctxMain.lineWidth = 0.5;
    ctxMain.stroke();
  });
}

// Draw Balmer Spectrometer Strip Panel
function renderSpectrometer() {
  const w = canvasSpectrometer.width;
  const h = canvasSpectrometer.height;
  
  ctxSpec.clearRect(0, 0, w, h);
  
  // 1. Draw a dark gridded background
  ctxSpec.fillStyle = '#020306';
  ctxSpec.fillRect(0, 0, w, h);
  
  // Draw gridded line reference guides
  ctxSpec.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctxSpec.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 30) {
    ctxSpec.beginPath();
    ctxSpec.moveTo(gx, 0);
    ctxSpec.lineTo(gx, h);
    ctxSpec.stroke();
  }
  
  // Map wavelength to x coordinates (visible spectrum maps 380nm - 750nm across 300px width)
  const getX = (lambda) => {
    return ((lambda - 380) / (750 - 380)) * w;
  };
  
  // 2. Draw standard reference line ticks for the Balmer series (Visible, nf=2)
  const referenceLines = [
    { wl: 656.3, color: '#ff1744', label: 'Hα' },
    { wl: 486.1, color: '#00e5ff', label: 'Hβ' },
    { wl: 434.0, color: '#2979ff', label: 'Hγ' },
    { wl: 410.2, color: '#d500f9', label: 'Hδ' }
  ];
  
  referenceLines.forEach(line => {
    const rx = getX(line.wl);
    ctxSpec.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctxSpec.lineWidth = 1;
    ctxSpec.beginPath();
    ctxSpec.moveTo(rx, 0);
    ctxSpec.lineTo(rx, h);
    ctxSpec.stroke();
  });
  
  // 3. Highlight emitted spectral lines with decay phosphorescence
  const activeLine = simState.activeSpectralLine;
  if (activeLine) {
    const lx = getX(activeLine.wavelength);
    
    // Draw glowing line only if within bounds of the visual panel range
    if (lx >= 0 && lx <= w) {
      ctxSpec.save();
      ctxSpec.strokeStyle = activeLine.color;
      ctxSpec.lineWidth = 2.5;
      
      // Phosphorescent glow
      ctxSpec.shadowColor = activeLine.color;
      ctxSpec.shadowBlur = 10 * activeLine.intensity;
      ctxSpec.globalAlpha = activeLine.intensity;
      
      ctxSpec.beginPath();
      ctxSpec.moveTo(lx, 0);
      ctxSpec.lineTo(lx, h);
      ctxSpec.stroke();
      
      ctxSpec.restore();
      
      // Slowly decay intensity over time
      if (simState.isPlaying) {
        activeLine.intensity -= 0.006; // Fades out in ~2.5 seconds
        if (activeLine.intensity <= 0) {
          simState.activeSpectralLine = null;
        }
      }
    }
  }
}

// Master loop updates
function updateSimulation() {
  simState.time++;
  
  if (simState.isPlaying) {
    const speed = simState.orbitSpeed;
    
    // Update orbit positions (Kepler speed profile: velocity v_n = v_0 / sqrt(n) or angular velocity omega_n = w_0 / n^2)
    for (let n = 1; n <= 6; n++) {
      const omega = 0.025 / (n * n); // Angular velocity decreases for outer shells
      simState.orbitAngles[n - 1] += omega * speed;
      
      // Cap angles
      if (simState.orbitAngles[n - 1] > 2 * Math.PI) {
        simState.orbitAngles[n - 1] -= 2 * Math.PI;
      }
    }
    
    // Update transition animations
    const t = simState.transition;
    if (t) {
      t.progress += 1 / t.duration;
      
      if (t.type === 'excite') {
        // Phase 1: Incoming photon travels (0.0 to 0.4)
        if (t.progress < 0.4) {
          t.photon.active = true;
          t.photon.progress = t.progress;
        } else {
          // Phase 2: Photon absorbed, electron moves to target (0.4 to 1.0)
          t.photon.active = false;
        }
      } else {
        // Relaxation
        // Phase 1: Electron falls (0.0 to 0.6)
        if (t.progress < 0.6) {
          t.photon.active = false;
        } else {
          // Phase 2: Photon emitted and leaves (0.6 to 1.0)
          t.photon.active = true;
          t.photon.progress = t.progress;
        }
      }
      
      if (t.progress >= 1.0) {
        completeTransition();
      }
    }
  }
}

// Main Draw Loop
function animate() {
  updateSimulation();
  renderMain();
  renderSpectrometer();
  requestAnimationFrame(animate);
}

// Setup Event Listeners
function bindEvents() {
  // Counters
  btnDecProtons.addEventListener('click', () => modifyProtons(-1));
  btnIncProtons.addEventListener('click', () => modifyProtons(1));
  btnDecNeutrons.addEventListener('click', () => modifyNeutrons(-1));
  btnIncNeutrons.addEventListener('click', () => modifyNeutrons(1));
  btnDecElectrons.addEventListener('click', () => modifyElectrons(-1));
  btnIncElectrons.addEventListener('click', () => modifyElectrons(1));
  
  // Transition actions
  btnExcite.addEventListener('click', triggerExcitation);
  btnRelax.addEventListener('click', triggerRelaxation);
  
  // Playback Control
  btnPlayPause.addEventListener('click', () => {
    simState.isPlaying = !simState.isPlaying;
    if (simState.isPlaying) {
      playIcon.textContent = '⏸️';
      playText.textContent = 'Pause';
      addConsoleLog('Atom simulation resumed.', 'sys');
    } else {
      playIcon.textContent = '▶️';
      playText.textContent = 'Play';
      addConsoleLog('Atom simulation paused.', 'sys');
    }
  });
  
  btnResetAtom.addEventListener('click', () => {
    loadPreset('preset-c');
    addConsoleLog('Simulation reset to stable Carbon-12 standard atom.', 'sys');
  });
  
  // Speed selectors
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseFloat(btn.getAttribute('data-speed'));
      simState.orbitSpeed = val;
      addConsoleLog(`Simulation speed multiplier changed to ${val}x.`, 'sys');
    });
  });
  
  // Preset selectors
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      loadPreset(preset);
    });
  });
  
  // Clear Logs
  btnClearLogs.addEventListener('click', () => {
    loggerConsole.innerHTML = '<div class="log-entry log-sys">[SYS] Logs cleared. Quantum monitoring engine active.</div>';
  });
  
  // Keyboard Accessibility
  window.addEventListener('keydown', (e) => {
    // Space bar toggles playback when in main layout (ignore if focus in select/buttons)
    if (e.code === 'Space' && document.activeElement.tagName !== 'BUTTON' && document.activeElement.tagName !== 'SELECT') {
      e.preventDefault();
      btnPlayPause.click();
    }
  });
}

// Adjust canvas resolution for high-DPI screens
function fitCanvasResolution() {
  const rect = mainCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  mainCanvas.width = rect.width * dpr;
  mainCanvas.height = rect.height * dpr;
  
  ctxMain.scale(dpr, dpr);
}

// Initialize application on load
window.addEventListener('DOMContentLoaded', () => {
  setupDropdowns();
  generateNucleusStructure();
  syncStateToUI();
  bindEvents();
  
  // High DPI sizing
  fitCanvasResolution();
  window.addEventListener('resize', fitCanvasResolution);
  
  // Set default preset active state
  loadPreset('preset-c');
  
  // Begin main render loop
  requestAnimationFrame(animate);
});
