/* GENE-OS // DNA Sequence Visualizer - Engine & Interactive Controls */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- PRESET GENOMIC DATA ---
  const PRESETS = {
    gfp: {
      name: "Green Fluorescent Protein (GFP) Gene",
      title: "GFP_Monomeric_Coding",
      sequence: "ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAGCAGCACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTACAAGACCCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGGACGGCAACATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAACGGCATCAAGGTGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTCGCCGACCACTACCAGCAGAACACCCCCATCGGCGACGGCCCCGTGCTGCTGCCCGACAACCACTACCTGAGCACCCAGTCCGCCCTGAGCAAAGACCCCAACGAGAAGCGCGATCACATGGTCCTGCTGGAGTTCGTGACCGCCGCCGGGATCACTCTCGGCATGGACGAGCTGTACAAGTAA"
    },
    hbb: {
      name: "Beta-Globin (HBB) Sickle-Cell Region",
      title: "Human_HBB_SickleCell_Hotspot",
      sequence: "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGACAACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGATCCTGAGAACTTCAGGCTCCTGGGCAACGTGCTGGTCTGTGTGCTGGCCCATCACTTTGGCAAAGAATTCACCCCACCAGTGCAGGCTGCCTATCAGAAAGTGGTGGCTGGTGTGGCTAATGCCCTGGCCCACAAGTATCACTAA"
    },
    sars2: {
      name: "SARS-CoV-2 Spike Fragment",
      title: "SARSCoV2_Spike_RBD_Excerpt",
      sequence: "ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAATTACCCCCTGCATACACTAATTCTTTCACACGTGGTGTTTATTACCCTGACAAAGTTTTCAGATCCTCAGTTTTACATTCAACTCAGGACTTGTTCTTACCTTTCTTTTCCAATGTTACTTGGTTCCATGCTATACATGTCTCTGGGACCAATGGTACTAAGAGGTTTGATAACCCTGTCCTACCATTTAATGATGGTGTTTATTTTGCTTCCACTGAGAAGTCTAACATAATAAGAGGCTGGATTTTTGGTACTACTTTAGATTCGAAGACCCAGTCCCTACTTATTGTTAATAACGCTACTAATGTTGTTATTAAAGTCTGTGAATTTCAATTTTGTAATGATCCATTTTTGGGTGTTTATTACCACAAAAACAACAAAAGTTGGATGGAAAGTGAGTTCAGAGTTTATTCTAGTGCGAATAATTGCACTTTTGAATATGTCTCTCAGCCTTTTCTTATGGACCTTGAAGGAAAACAGGGTAATTTCAAAAATCTTAGGGATTTT"
    }
  };

  // --- AMINO ACID CODON DICTIONARY ---
  const CODON_TABLE = {
    "UUU":"F", "UUC":"F", "UUA":"L", "UUG":"L",
    "UCU":"S", "UCC":"S", "UCA":"S", "UCG":"S",
    "UAU":"Y", "UAC":"Y", "UAA":"*", "UAG":"*",
    "UGU":"C", "UGC":"C", "UGA":"*", "UGG":"W",
    "CUU":"L", "CUC":"L", "CUA":"L", "CUG":"L",
    "CCU":"P", "CCC":"P", "CCA":"P", "CCG":"P",
    "CAU":"H", "CAC":"H", "CAA":"Q", "CAG":"Q",
    "CGU":"R", "CGC":"R", "CGA":"R", "CGG":"R",
    "AUU":"I", "AUC":"I", "AUA":"I", "AUG":"M",
    "ACU":"T", "ACC":"T", "ACA":"T", "ACG":"T",
    "AAU":"N", "AAC":"N", "AAA":"K", "AAG":"K",
    "AGU":"S", "AGC":"S", "AGA":"R", "AGG":"R",
    "GUU":"V", "GUC":"V", "GUA":"V", "GUG":"V",
    "GCU":"A", "GCC":"A", "GCA":"A", "GCG":"A",
    "GAU":"D", "GAC":"D", "GAA":"E", "GAG":"E",
    "GGU":"G", "GGC":"G", "GGA":"G", "GGG":"G"
  };

  const AMINO_ACID_NAMES = {
    "F": "Phenylalanine", "L": "Leucine", "S": "Serine", "Y": "Tyrosine",
    "C": "Cysteine", "W": "Tryptophan", "P": "Proline", "H": "Histidine",
    "Q": "Glutamine", "R": "Arginine", "I": "Isoleucine", "M": "Methionine (Start)",
    "T": "Threonine", "N": "Asparagine", "K": "Lysine", "V": "Valine",
    "A": "Alanine", "D": "Aspartic Acid", "E": "Glutamic Acid", "G": "Glycine",
    "*": "Stop Codon"
  };

  // --- RESTRICTION ENZYMES ---
  const ENZYMES = [
    { id: "ecori", name: "EcoRI", sequence: "GAATTC", color: "#ff2a5f" },
    { id: "hindiii", name: "HindIII", sequence: "AAGCTT", color: "#ffb800" },
    { id: "bamhi", name: "BamHI", sequence: "GGATCC", color: "#00b2ff" },
    { id: "alui", name: "AluI", sequence: "AGCT", color: "#00e575" },
    { id: "hhai", name: "HhaI", sequence: "GCGC", color: "#e040fb" }
  ];

  // --- STATE ---
  let originalSequence = PRESETS.gfp.sequence; // Default original
  let currentSequence = originalSequence.split(""); // Array of base chars
  let mutations = []; // History log: { type, index, from, to, label }
  let activeFrame = 1; // 1, 2, or 3
  let selectedBaseIndex = null; // For mutation panel placement

  // Helix Canvas state
  let canvas = document.getElementById('helix-canvas');
  let ctx = canvas.getContext('2d');
  let angle = 0; // Rotation tracking
  let helixHoverNode = null; // Hovered helix node tracker

  // --- DOM ELEMENTS ---
  const presetSelector = document.getElementById('preset-selector');
  const btnCustomInput = document.getElementById('btn-custom-input');
  const customInputModal = document.getElementById('custom-input-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelInput = document.getElementById('btn-cancel-input');
  const btnApplySequence = document.getElementById('btn-apply-sequence');
  const fastaTitle = document.getElementById('fasta-title');
  const fastaSequence = document.getElementById('fasta-sequence');
  const validBasesCount = document.getElementById('valid-bases-count');
  const invalidCharCount = document.getElementById('invalid-char-count');
  const validatorStatus = document.getElementById('validator-status');
  
  const sliderSpeed = document.getElementById('slider-speed');
  const sliderZoom = document.getElementById('slider-zoom');
  const sliderSpacing = document.getElementById('slider-spacing');
  const sliderFreq = document.getElementById('slider-freq');
  
  const valSpeed = document.getElementById('val-speed');
  const valZoom = document.getElementById('val-zoom');
  const valSpacing = document.getElementById('val-spacing');
  const valFreq = document.getElementById('val-freq');
  
  const telemetryRpm = document.getElementById('telemetry-rpm');
  const telemetryPitch = document.getElementById('telemetry-pitch');
  const telemetryLength = document.getElementById('telemetry-length');

  const btnResetMutations = document.getElementById('btn-reset-mutations');
  const mutationLogList = document.getElementById('mutation-log-list');

  const statBpVal = document.getElementById('stat-bp-val');
  const statGcVal = document.getElementById('stat-gc-val');
  const statTmVal = document.getElementById('stat-tm-val');
  const statMwVal = document.getElementById('stat-mw-val');

  const sequenceExplorerGrid = document.getElementById('sequence-explorer-grid');
  
  const panelDnaCoding = document.getElementById('panel-dna-coding');
  const panelDnaTemplate = document.getElementById('panel-dna-template');
  const panelMrna = document.getElementById('panel-mrna');
  const panelProtein = document.getElementById('panel-protein');

  const mutationPanel = document.getElementById('mutation-panel');
  const btnCloseMutation = document.getElementById('btn-close-mutation');
  const mutBaseIdx = document.getElementById('mut-base-idx');
  const mutBaseChar = document.getElementById('mut-base-char');
  const btnMutDelete = document.getElementById('btn-mut-delete');
  const btnMutInsert = document.getElementById('btn-mut-insert');
  const insertBaseSelector = document.getElementById('insert-base-selector');

  const digestMapSvg = document.getElementById('digest-map-svg');
  const digestResultsSummary = document.getElementById('digest-results-summary');

  const distributionPieChart = document.getElementById('distribution-pie-chart');
  const distributionLegend = document.getElementById('distribution-legend');

  // --- INITIALIZATION ---
  function init() {
    loadCachedOrPreset();
    setupCanvas();
    bindEvents();
    triggerFullAnalysis();
    
    // Start canvas render loop
    requestAnimationFrame(renderHelix);
  }

  // --- LOCAL STORAGE & DATA LOADING ---
  function loadCachedOrPreset() {
    const cachedOrig = localStorage.getItem('geneos_original_seq');
    const cachedCurr = localStorage.getItem('geneos_current_seq');
    const cachedMuts = localStorage.getItem('geneos_mutations');
    const cachedPreset = localStorage.getItem('geneos_preset_key') || 'gfp';

    if (cachedOrig && cachedCurr) {
      originalSequence = cachedOrig;
      currentSequence = cachedCurr.split("");
      try {
        mutations = JSON.parse(cachedMuts) || [];
      } catch (e) {
        mutations = [];
      }
      presetSelector.value = localStorage.getItem('geneos_preset_key') || 'custom';
    } else {
      loadPreset(cachedPreset);
    }
    updateMutationLog();
  }

  function saveStateToLocalStorage() {
    localStorage.setItem('geneos_original_seq', originalSequence);
    localStorage.setItem('geneos_current_seq', currentSequence.join(""));
    localStorage.setItem('geneos_mutations', JSON.stringify(mutations));
    localStorage.setItem('geneos_preset_key', presetSelector.value);
  }

  function loadPreset(key) {
    if (PRESETS[key]) {
      originalSequence = PRESETS[key].sequence;
      currentSequence = originalSequence.split("");
      mutations = [];
      presetSelector.value = key;
      updateMutationLog();
      saveStateToLocalStorage();
    }
  }

  // --- EVENTS BINDING ---
  function bindEvents() {
    // Preset select change
    presetSelector.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val !== 'custom') {
        loadPreset(val);
        triggerFullAnalysis();
        hideMutationPanel();
      } else {
        openCustomInput();
      }
    });

    // Custom sequence modal trigger
    btnCustomInput.addEventListener('click', openCustomInput);
    btnCloseModal.addEventListener('click', closeCustomInput);
    btnCancelInput.addEventListener('click', closeCustomInput);
    
    // Live validator inside modal
    fastaSequence.addEventListener('input', validateModalInput);

    btnApplySequence.addEventListener('click', () => {
      const title = fastaTitle.value.trim() || "Custom_DNA_Sequence";
      const cleaned = cleanDNAStrand(fastaSequence.value);
      if (cleaned.length < 3) {
        alert("Sequence must be at least 3 base pairs long.");
        return;
      }
      originalSequence = cleaned;
      currentSequence = cleaned.split("");
      mutations = [];
      presetSelector.value = 'custom';
      updateMutationLog();
      saveStateToLocalStorage();
      closeCustomInput();
      triggerFullAnalysis();
      hideMutationPanel();
    });

    // Helix control sliders
    sliderSpeed.addEventListener('input', (e) => {
      valSpeed.textContent = `${e.target.value} RPM`;
      telemetryRpm.textContent = e.target.value;
    });
    sliderZoom.addEventListener('input', (e) => {
      valZoom.textContent = `${(e.target.value / 10).toFixed(1)}x`;
    });
    sliderSpacing.addEventListener('input', (e) => {
      valSpacing.textContent = `${e.target.value}px`;
      telemetryPitch.textContent = `${Math.round(e.target.value * 0.45)}px`;
    });
    sliderFreq.addEventListener('input', (e) => {
      valFreq.textContent = `${(e.target.value / 10).toFixed(1)}x`;
    });

    // Reset mutations
    btnResetMutations.addEventListener('click', () => {
      currentSequence = originalSequence.split("");
      mutations = [];
      updateMutationLog();
      saveStateToLocalStorage();
      triggerFullAnalysis();
      hideMutationPanel();
    });

    // Reading Frame toggles
    document.querySelectorAll('.frame-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.frame-toggle').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeFrame = parseInt(e.target.dataset.frame, 10);
        renderSequenceExplorer();
        renderTranslationWorkspace();
      });
    });

    // Enzyme checkboxes
    document.querySelectorAll('.enzyme-toggles input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', renderRestrictionMapper);
    });

    // Canvas resizing
    window.addEventListener('resize', setupCanvas);

    // Canvas click interaction (for finding base)
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasHover);
    canvas.addEventListener('mouseleave', () => {
      const tooltip = document.getElementById('helix-tooltip');
      tooltip.classList.add('hidden');
      helixHoverNode = null;
    });

    // Mutation panel triggers
    btnCloseMutation.addEventListener('click', hideMutationPanel);

    document.querySelectorAll('.mut-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        applySubstitution(selectedBaseIndex, e.target.dataset.base);
      });
    });

    btnMutDelete.addEventListener('click', () => {
      applyDeletion(selectedBaseIndex);
    });

    btnMutInsert.addEventListener('click', () => {
      const base = insertBaseSelector.value;
      applyInsertion(selectedBaseIndex, base);
    });
  }

  // --- BIO-ENGINE LOGIC ---
  function cleanDNAStrand(str) {
    // Standardizes input to UPPERCASE and keeps only A, T, C, G
    return str.toUpperCase().replace(/[^ATCG]/g, "");
  }

  function getComplementaryStrand(seqArray) {
    const pairs = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' };
    return seqArray.map(base => pairs[base] || '?');
  }

  function transcribeDNATomRNA(seqArray) {
    // Coding strand transcription replicates the coding sequence but swaps T for U.
    return seqArray.map(base => base === 'T' ? 'U' : base);
  }

  function translateRNA(mrnaArray, frameOffset = 0) {
    const aminoAcids = [];
    const sequenceStr = mrnaArray.join("");
    
    // Standard translation frame starts
    for (let i = frameOffset; i < sequenceStr.length - 2; i += 3) {
      const codon = sequenceStr.substring(i, i + 3);
      const aa = CODON_TABLE[codon] || '?';
      aminoAcids.push({
        aa: aa,
        codon: codon,
        index: i // Start index of codon in RNA sequence
      });
    }
    return aminoAcids;
  }

  function calculateMolecularWeight(seqArray) {
    // Multi-base molecular weight calculator
    const weights = { 'A': 313.2, 'T': 304.2, 'C': 289.2, 'G': 329.2 };
    
    // Single strand
    let ssWeight = seqArray.reduce((acc, char) => acc + (weights[char] || 0), 0) - 61.9;
    
    // Complement strand
    let dsWeight = ssWeight + seqArray.reduce((acc, char) => {
      const compChar = char === 'A' ? 'T' : (char === 'T' ? 'A' : (char === 'C' ? 'G' : 'C'));
      return acc + (weights[compChar] || 0);
    }, 0) - 61.9;

    return {
      single: Math.max(0, ssWeight) / 1000, // in kDa
      double: Math.max(0, dsWeight) / 1000  // in kDa
    };
  }

  function calculateMeltingTemp(seqArray) {
    // Basic melting temp calculator
    const counts = getBaseCounts(seqArray);
    const w = counts.A + counts.T;
    const s = counts.G + counts.C;
    const len = seqArray.length;
    
    if (len === 0) return 0;
    
    if (len < 14) {
      // Wallace Formula
      return (2 * w) + (4 * s);
    } else {
      // Salt-adjusted formula
      return 64.9 + 41 * (s - 16.4) / len;
    }
  }

  function getBaseCounts(seqArray) {
    const counts = { A: 0, T: 0, C: 0, G: 0 };
    seqArray.forEach(b => {
      if (counts[b] !== undefined) counts[b]++;
    });
    return counts;
  }

  // --- ACTIONS & MUTATIONS ---
  function applySubstitution(index, toBase) {
    const fromBase = currentSequence[index];
    if (fromBase === toBase) {
      hideMutationPanel();
      return;
    }

    currentSequence[index] = toBase;
    
    const label = `${fromBase}${index + 1}${toBase}`;
    mutations.push({
      type: "Substitution",
      index: index,
      from: fromBase,
      to: toBase,
      label: label,
      desc: `Substituted base ${fromBase} for ${toBase} at bp ${index + 1}`
    });

    postMutationUpdate();
  }

  function applyDeletion(index) {
    const fromBase = currentSequence[index];
    currentSequence.splice(index, 1);

    mutations.push({
      type: "Deletion",
      index: index,
      from: fromBase,
      to: "-",
      label: `Δ${fromBase}${index + 1}`,
      desc: `Deleted base ${fromBase} at bp ${index + 1}`
    });

    postMutationUpdate();
  }

  function applyInsertion(index, base) {
    currentSequence.splice(index + 1, 0, base);

    mutations.push({
      type: "Insertion",
      index: index + 1,
      from: "-",
      to: base,
      label: `+${base}${index + 2}`,
      desc: `Inserted base ${base} after bp ${index + 1}`
    });

    postMutationUpdate();
  }

  function postMutationUpdate() {
    saveStateToLocalStorage();
    updateMutationLog();
    triggerFullAnalysis();
    hideMutationPanel();
  }

  function updateMutationLog() {
    mutationLogList.innerHTML = "";
    
    if (mutations.length === 0) {
      btnResetMutations.disabled = true;
      const placeholder = document.createElement('li');
      placeholder.className = 'log-placeholder';
      placeholder.textContent = "No mutations recorded. Click on a base in the explorer to mutate.";
      mutationLogList.appendChild(placeholder);
      return;
    }

    btnResetMutations.disabled = false;
    
    mutations.forEach(mut => {
      const li = document.createElement('li');
      const badge = document.createElement('span');
      badge.className = `log-badge ${mut.type.substring(0,3).toLowerCase()}`;
      badge.textContent = mut.type.toUpperCase();
      
      const details = document.createElement('span');
      details.innerHTML = ` <strong>${mut.label}</strong>: ${mut.desc}`;
      
      li.appendChild(badge);
      li.appendChild(details);
      mutationLogList.appendChild(li);
    });

    // Auto-scroll mutation log list to bottom
    mutationLogList.scrollTop = mutationLogList.scrollHeight;
  }

  // --- TRIGGER ANALYSIS RUNNERS ---
  function triggerFullAnalysis() {
    telemetryLength.textContent = `${currentSequence.length} bp`;
    
    // Core telemetry
    const gcRatio = calculateGCContent(currentSequence);
    const tmVal = calculateMeltingTemp(currentSequence);
    const mwObj = calculateMolecularWeight(currentSequence);

    statBpVal.innerHTML = `${currentSequence.length} <span class="unit">bp</span>`;
    statGcVal.innerHTML = `${gcRatio.toFixed(1)} <span class="unit">%</span>`;
    statTmVal.innerHTML = `${tmVal.toFixed(1)} <span class="unit">°C</span>`;
    statMwVal.innerHTML = `${mwObj.double.toFixed(1)} <span class="unit">kDa</span>`;

    // Trigger panel renders
    renderSequenceExplorer();
    renderTranslationWorkspace();
    renderRestrictionMapper();
    renderDistributionChart();
  }

  function calculateGCContent(seqArray) {
    if (seqArray.length === 0) return 0;
    const counts = getBaseCounts(seqArray);
    return ((counts.G + counts.C) / seqArray.length) * 100;
  }

  // --- RENDERING WORKSPACE COMPONENTS ---

  // 1. Sequence Explorer Grid
  function renderSequenceExplorer() {
    sequenceExplorerGrid.innerHTML = "";
    const frameOffset = activeFrame - 1;
    
    // Pre-extract mutated indices for visualization
    const mutatedIndices = new Set(mutations.map(m => m.index));

    // Render in codon groupings
    let i = 0;

    // Render preceding offset bases if frame is +2 or +3
    if (frameOffset > 0) {
      const offsetGroup = document.createElement('div');
      offsetGroup.className = 'codon-group text-muted';
      
      const basesDiv = document.createElement('div');
      basesDiv.className = 'codon-bases';

      for (let j = 0; j < frameOffset; j++) {
        if (j < currentSequence.length) {
          basesDiv.appendChild(createBaseTile(j, currentSequence[j], mutatedIndices));
          i++;
        }
      }
      
      const aaDiv = document.createElement('div');
      aaDiv.className = 'codon-aa';
      aaDiv.textContent = "-";
      
      offsetGroup.appendChild(basesDiv);
      offsetGroup.appendChild(aaDiv);
      sequenceExplorerGrid.appendChild(offsetGroup);
    }

    // Render codons
    while (i < currentSequence.length - 2) {
      const codonGroup = document.createElement('div');
      codonGroup.className = 'codon-group';
      
      const basesDiv = document.createElement('div');
      basesDiv.className = 'codon-bases';
      
      const base1 = currentSequence[i];
      const base2 = currentSequence[i+1];
      const base3 = currentSequence[i+2];

      basesDiv.appendChild(createBaseTile(i, base1, mutatedIndices));
      basesDiv.appendChild(createBaseTile(i+1, base2, mutatedIndices));
      basesDiv.appendChild(createBaseTile(i+2, base3, mutatedIndices));

      // Calculate codon translation
      const rnaCodon = transcribeDNATomRNA([base1, base2, base3]).join("");
      const aa = CODON_TABLE[rnaCodon] || '?';

      const aaDiv = document.createElement('div');
      aaDiv.className = `codon-aa ${getAminoAcidPropertyClass(aa)}`;
      aaDiv.textContent = aa;
      aaDiv.title = AMINO_ACID_NAMES[aa] || "Unknown Amino Acid";

      codonGroup.appendChild(basesDiv);
      codonGroup.appendChild(aaDiv);
      sequenceExplorerGrid.appendChild(codonGroup);

      i += 3;
    }

    // Render leftover bases
    if (i < currentSequence.length) {
      const leftoverGroup = document.createElement('div');
      leftoverGroup.className = 'codon-group text-muted';
      
      const basesDiv = document.createElement('div');
      basesDiv.className = 'codon-bases';

      while (i < currentSequence.length) {
        basesDiv.appendChild(createBaseTile(i, currentSequence[i], mutatedIndices));
        i++;
      }
      
      const aaDiv = document.createElement('div');
      aaDiv.className = 'codon-aa';
      aaDiv.textContent = "-";
      
      leftoverGroup.appendChild(basesDiv);
      leftoverGroup.appendChild(aaDiv);
      sequenceExplorerGrid.appendChild(leftoverGroup);
    }
  }

  function createBaseTile(index, base, mutatedIndices) {
    const tile = document.createElement('span');
    tile.className = `base-tile ${base.toLowerCase()}`;
    if (mutatedIndices.has(index)) {
      tile.classList.add('mutated');
    }
    tile.textContent = base;
    tile.setAttribute('data-idx', index + 1);
    tile.setAttribute('data-index-zero', index);
    
    // Active state highlighting during panel edit
    if (selectedBaseIndex === index) {
      tile.classList.add('active-edit');
    }

    tile.addEventListener('click', (e) => {
      e.stopPropagation();
      openMutationPanel(index, tile);
    });

    return tile;
  }

  function getAminoAcidPropertyClass(aa) {
    if (["A","V","I","L","M","F","Y","W"].includes(aa)) return "am-hydrophobic";
    if (["S","T","N","Q","C","G","P"].includes(aa)) return "am-polar";
    if (["D","E"].includes(aa)) return "am-acidic";
    if (["K","R","H"].includes(aa)) return "am-basic";
    if (aa === "*") return "am-stop";
    return "";
  }

  // 2. Transcription & Translation Workspace
  function renderTranslationWorkspace() {
    // 5' -> 3' DNA coding
    panelDnaCoding.innerHTML = currentSequence.map((b, idx) => 
      `<span class="base-span-${b.toLowerCase()}" data-idx="${idx}">${b}</span>`
    ).join("");

    // 3' -> 5' DNA template complementary
    const compStrand = getComplementaryStrand(currentSequence);
    panelDnaTemplate.innerHTML = compStrand.map((b, idx) => 
      `<span class="base-span-${b.toLowerCase()}" data-idx="${idx}">${b}</span>`
    ).join("");

    // mRNA
    const mrnaStrand = transcribeDNATomRNA(currentSequence);
    panelMrna.innerHTML = mrnaStrand.map((b, idx) => 
      `<span class="base-span-${b.toLowerCase()}" data-idx="${idx}">${b}</span>`
    ).join("");

    // Protein Amino Acid chain render
    panelProtein.innerHTML = "";
    const frameOffset = activeFrame - 1;
    const aminoAcids = translateRNA(mrnaStrand, frameOffset);

    if (aminoAcids.length === 0) {
      panelProtein.textContent = "Sequence too short for translation.";
      return;
    }

    aminoAcids.forEach(item => {
      const aaBlock = document.createElement('div');
      aaBlock.className = `amino-acid-block ${getAminoAcidPropertyClass(item.aa)}`;
      aaBlock.innerHTML = `<span>${item.aa}</span><span class="codon-lbl">${item.codon}</span>`;
      aaBlock.title = `${AMINO_ACID_NAMES[item.aa] || "Unknown"} (mRNA Codon: ${item.codon}, Base Index: ${item.index + 1})`;
      panelProtein.appendChild(aaBlock);
    });
  }

  // 3. Restriction Mapper
  function renderRestrictionMapper() {
    digestMapSvg.innerHTML = "";
    digestResultsSummary.innerHTML = "";
    
    const seqStr = currentSequence.join("");
    const length = currentSequence.length;
    if (length === 0) return;

    // Filter active enzymes
    const activeEnzymes = ENZYMES.filter(enz => 
      document.getElementById(`chk-enzyme-${enz.id}`).checked
    );

    // Scan for cuts
    const cuts = []; // { enzyme, index }
    
    activeEnzymes.forEach(enz => {
      let idx = seqStr.indexOf(enz.sequence);
      while (idx !== -1) {
        cuts.push({
          enzyme: enz,
          index: idx // Position of the cut start
        });
        idx = seqStr.indexOf(enz.sequence, idx + 1);
      }
    });

    // Sort cuts chronologically
    cuts.sort((a, b) => a.index - b.index);

    // RENDER SVG MAP (500x50 coordinates)
    const padding = 20;
    const mapWidth = 460;
    const lineY = 25;

    // Base backbone line
    const backbone = document.createElementNS("http://www.w3.org/2000/svg", "line");
    backbone.setAttribute("x1", padding);
    backbone.setAttribute("y1", lineY);
    backbone.setAttribute("x2", padding + mapWidth);
    backbone.setAttribute("y2", lineY);
    backbone.setAttribute("stroke", "rgba(255,255,255,0.15)");
    backbone.setAttribute("stroke-width", "6");
    backbone.setAttribute("stroke-linecap", "round");
    digestMapSvg.appendChild(backbone);

    // Render cut markers
    cuts.forEach(cut => {
      const relativeX = padding + (cut.index / length) * mapWidth;

      // Vertical tick mark
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tick.setAttribute("x1", relativeX);
      tick.setAttribute("y1", lineY - 12);
      tick.setAttribute("x2", relativeX);
      tick.setAttribute("y2", lineY + 12);
      tick.setAttribute("stroke", cut.enzyme.color);
      tick.setAttribute("stroke-width", "3");
      digestMapSvg.appendChild(tick);

      // Circle anchor
      const anchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      anchor.setAttribute("cx", relativeX);
      anchor.setAttribute("cy", lineY);
      anchor.setAttribute("r", "5");
      anchor.setAttribute("fill", "#070a13");
      anchor.setAttribute("stroke", cut.enzyme.color);
      anchor.setAttribute("stroke-width", "2");
      
      // Tooltip description
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = `${cut.enzyme.name} cut site at base ${cut.index + 1} (${cut.enzyme.sequence})`;
      anchor.appendChild(title);
      
      digestMapSvg.appendChild(anchor);
    });

    // RENDER FRAGMENT RESULTS
    if (cuts.length === 0) {
      digestResultsSummary.innerHTML = `<div class="no-cuts">No cut sites detected for active enzymes. Try checked other enzymes or modifying base sequences to create restriction targets.</div>`;
      return;
    }

    // Compute fragment sizes
    let prevIndex = 0;
    const fragments = [];

    cuts.forEach((cut, i) => {
      const fragSize = cut.index - prevIndex;
      if (fragSize > 0) {
        fragments.push({
          start: prevIndex + 1,
          end: cut.index,
          size: fragSize,
          label: `Frag ${fragments.length + 1}`
        });
      }
      prevIndex = cut.index;
    });

    // Last fragment
    const lastSize = length - prevIndex;
    if (lastSize > 0) {
      fragments.push({
        start: prevIndex + 1,
        end: length,
        size: lastSize,
        label: `Frag ${fragments.length + 1}`
      });
    }

    // Sort fragments by size descending
    fragments.sort((a, b) => b.size - a.size);

    fragments.forEach(frag => {
      const badge = document.createElement('div');
      badge.className = 'digest-cut-badge';
      badge.innerHTML = `<span class="enzyme-name">${frag.label}</span><span class="value font-mono">${frag.size} bp <span class="text-muted">(${frag.start}-${frag.end})</span></span>`;
      digestResultsSummary.appendChild(badge);
    });
  }

  // 4. Base Distribution Donut Chart
  function renderDistributionChart() {
    distributionPieChart.innerHTML = "";
    distributionLegend.innerHTML = "";
    
    const counts = getBaseCounts(currentSequence);
    const total = currentSequence.length;

    if (total === 0) {
      distributionPieChart.innerHTML = `<circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="15" />`;
      return;
    }

    const proportions = [
      { name: "Adenine", char: "A", count: counts.A, color: "var(--color-a)", percentage: (counts.A / total) * 100 },
      { name: "Thymine", char: "T", count: counts.T, color: "var(--color-t)", percentage: (counts.T / total) * 100 },
      { name: "Cytosine", char: "C", count: counts.C, color: "var(--color-c)", percentage: (counts.C / total) * 100 },
      { name: "Guanine", char: "G", count: counts.G, color: "var(--color-g)", percentage: (counts.G / total) * 100 }
    ];

    // Compute stroke dash configurations for circular arcs
    const radius = 30;
    const circumference = 2 * Math.PI * radius; // ~188.5
    let cumulativePercent = 0;

    proportions.forEach(prop => {
      if (prop.count === 0) return;

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "50");
      circle.setAttribute("cy", "50");
      circle.setAttribute("r", radius.toString());
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", prop.color);
      circle.setAttribute("stroke-width", "12");

      const strokeDash = (prop.percentage / 100) * circumference;
      const strokeOffset = circumference - ((cumulativePercent / 100) * circumference);

      circle.setAttribute("stroke-dasharray", `${strokeDash} ${circumference - strokeDash}`);
      circle.setAttribute("stroke-dashoffset", strokeOffset.toString());
      circle.setAttribute("transform", "rotate(-90 50 50)"); // Start top-center

      // Tooltip SVG
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = `${prop.name} (Char ${prop.char}): ${prop.count} (${prop.percentage.toFixed(1)}%)`;
      circle.appendChild(title);

      distributionPieChart.appendChild(circle);
      cumulativePercent += prop.percentage;
    });

    // Donut hole center text
    const centerTextVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
    centerTextVal.setAttribute("x", "50");
    centerTextVal.setAttribute("y", "48");
    centerTextVal.setAttribute("text-anchor", "middle");
    centerTextVal.setAttribute("fill", "#fff");
    centerTextVal.setAttribute("font-size", "10");
    centerTextVal.setAttribute("font-weight", "800");
    centerTextVal.setAttribute("font-family", "var(--font-mono)");
    centerTextVal.textContent = total.toString();
    distributionPieChart.appendChild(centerTextVal);

    const centerTextLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    centerTextLbl.setAttribute("x", "50");
    centerTextLbl.setAttribute("y", "58");
    centerTextLbl.setAttribute("text-anchor", "middle");
    centerTextLbl.setAttribute("fill", "var(--text-muted)");
    centerTextLbl.setAttribute("font-size", "6");
    centerTextLbl.setAttribute("font-weight", "600");
    centerTextLbl.textContent = "BP TOTAL";
    distributionPieChart.appendChild(centerTextLbl);

    // Build Legend
    proportions.forEach(prop => {
      const row = document.createElement('div');
      row.className = 'legend-stat-row';
      row.innerHTML = `
        <span class="legend-stat-label">
          <span class="legend-dot" style="background-color: ${prop.color}"></span>
          ${prop.name} (${prop.char})
        </span>
        <span class="legend-stat-val">${prop.count} <span class="text-muted">(${prop.percentage.toFixed(1)}%)</span></span>
      `;
      distributionLegend.appendChild(row);
    });
  }

  // --- FLOATING MUTATION CONTROL ---
  function openMutationPanel(index, tileElement) {
    selectedBaseIndex = index;
    const base = currentSequence[index];

    mutBaseIdx.textContent = index + 1;
    mutBaseChar.textContent = base;

    // Highlight selected tile
    document.querySelectorAll('.base-tile').forEach(t => t.classList.remove('active-edit'));
    tileElement.classList.add('active-edit');

    // Display position near tile
    const rect = tileElement.getBoundingClientRect();
    const parentRect = document.body.getBoundingClientRect();
    
    let left = rect.left - parentRect.left;
    let top = rect.bottom - parentRect.top + 8;

    // Boundary constraints check
    if (left + 280 > window.innerWidth) {
      left = window.innerWidth - 300;
    }

    mutationPanel.style.left = `${left}px`;
    mutationPanel.style.top = `${top}px`;
    mutationPanel.classList.remove('hidden');
  }

  function hideMutationPanel() {
    selectedBaseIndex = null;
    document.querySelectorAll('.base-tile').forEach(t => t.classList.remove('active-edit'));
    mutationPanel.classList.add('hidden');
  }

  // --- CUSTOM FASTA SEQUENCER MODAL ---
  function openCustomInput() {
    fastaTitle.value = `Custom_Genomic_Strand_${Math.floor(100 + Math.random() * 900)}`;
    fastaSequence.value = currentSequence.join("");
    validateModalInput();
    customInputModal.classList.remove('hidden');
  }

  function closeCustomInput() {
    customInputModal.classList.add('hidden');
    // If preset Selector was left in custom but cancelled, reset selector to matches current preset
    if (presetSelector.value === 'custom' && mutations.length === 0 && originalSequence !== currentSequence.join("")) {
      presetSelector.value = 'custom';
    }
  }

  function validateModalInput() {
    const rawVal = fastaSequence.value;
    const uppercase = rawVal.toUpperCase();
    
    // Count valid and invalid characters
    let valid = 0;
    let invalid = 0;

    for (let char of uppercase) {
      if (['A', 'T', 'C', 'G'].includes(char)) {
        valid++;
      } else if (!['\n', ' ', '\r', '\t', '>', '-'].includes(char)) {
        // Exclude general space formatting and FASTA file lines
        invalid++;
      }
    }

    validBasesCount.textContent = valid;
    invalidCharCount.textContent = invalid;

    if (invalid > 0) {
      validatorStatus.style.color = "var(--color-danger)";
    } else {
      validatorStatus.style.color = "var(--text-muted)";
    }
  }

  // --- CANVAS 3D HELIX GRAPHICS ENGINE ---
  function setupCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function handleCanvasHover(e) {
    const tooltip = document.getElementById('helix-tooltip');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Retrieve active helix coordinate points
    const points = calculateHelixPoints();
    let hoverFound = null;

    // Detect closest node within 8px radius
    for (let p of points) {
      const dx1 = x - p.x1;
      const dy1 = y - p.y;
      const dx2 = x - p.x2;
      const dy2 = y - p.y;

      if (Math.sqrt(dx1*dx1 + dy1*dy1) < 8) {
        hoverFound = { base: p.base1, index: p.index, strand: 1, px: p.x1, py: p.y };
        break;
      }
      if (Math.sqrt(dx2*dx2 + dy2*dy2) < 8) {
        hoverFound = { base: p.base2, index: p.index, strand: 2, px: p.x2, py: p.y };
        break;
      }
    }

    if (hoverFound) {
      helixHoverNode = hoverFound;
      tooltip.innerHTML = `<strong>Base ${hoverFound.base}</strong><br>Index: bp ${hoverFound.index + 1}<br>Strand: ${hoverFound.strand === 1 ? 'Coding (5\'→3\')' : 'Template (3\'→5\')'}`;
      tooltip.style.left = `${hoverFound.px}px`;
      tooltip.style.top = `${hoverFound.py}px`;
      tooltip.classList.remove('hidden');
      canvas.style.cursor = 'pointer';
    } else {
      helixHoverNode = null;
      tooltip.classList.add('hidden');
      canvas.style.cursor = 'default';
    }
  }

  function handleCanvasClick(e) {
    if (helixHoverNode) {
      // Find corresponding base tile in Sequence Explorer and trigger its mutation dialog
      const index = helixHoverNode.index;
      const tiles = document.querySelectorAll('.base-tile');
      
      for (let tile of tiles) {
        if (parseInt(tile.getAttribute('data-index-zero'), 10) === index) {
          tile.click();
          break;
        }
      }
    }
  }

  function calculateHelixPoints() {
    const length = currentSequence.length;
    if (length === 0) return [];

    const spacingSliderVal = parseInt(sliderSpacing.value, 10);
    const zoomSliderVal = parseInt(sliderZoom.value, 10) / 10;
    const freqSliderVal = parseInt(sliderFreq.value, 10) / 10;

    const points = [];
    const stepY = spacingSliderVal * 0.45; // Vertical spacing step
    const amplitude = 60 * zoomSliderVal;   // Wave width scaling
    const center = canvas.width / 2;

    const maxVisibleBases = Math.ceil(canvas.height / stepY) + 2;
    const renderBasesCount = Math.min(length, maxVisibleBases);

    for (let i = 0; i < renderBasesCount; i++) {
      const y = 30 + i * stepY;
      if (y > canvas.height + 20) break;

      // Compute phase angle
      const theta = (i * 0.45 * freqSliderVal) + angle;

      const base1 = currentSequence[i];
      const base2 = base1 === 'A' ? 'T' : (base1 === 'T' ? 'A' : (base1 === 'C' ? 'G' : 'C')); // Complementary

      // 3D coordinates (x, y, z). Strand 2 is anti-parallel offset by PI
      const xOffset1 = amplitude * Math.cos(theta);
      const z1 = amplitude * Math.sin(theta);
      
      const xOffset2 = amplitude * Math.cos(theta + Math.PI);
      const z2 = amplitude * Math.sin(theta + Math.PI);

      points.push({
        index: i,
        base1: base1,
        base2: base2,
        y: y,
        x1: center + xOffset1,
        z1: z1,
        x2: center + xOffset2,
        z2: z2
      });
    }

    return points;
  }

  function renderHelix() {
    if (!canvas || !ctx) return;

    // Retrieve parameters
    const speedSliderVal = parseInt(sliderSpeed.value, 10);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dynamic rotation angle increment
    angle += (speedSliderVal * 0.001);

    const points = calculateHelixPoints();
    if (points.length === 0) {
      requestAnimationFrame(renderHelix);
      return;
    }

    // BASE COLORS
    const colorMap = {
      'A': '#ff2a5f',
      'T': '#ffb800',
      'C': '#00e575',
      'G': '#00b2ff'
    };

    // Draw elements using painter's algorithm (render back-to-front by Z-ordering)
    // Create flat draw elements list (connecting bars and individual nucleotide nodes)
    const elements = [];

    points.forEach(p => {
      // 1. Base bridging link
      // Determine average depth of bridge
      const bridgeZ = (p.z1 + p.z2) / 2;
      elements.push({
        type: 'bridge',
        z: bridgeZ,
        x1: p.x1,
        x2: p.x2,
        y: p.y,
        base1: p.base1,
        base2: p.base2,
        z1: p.z1,
        z2: p.z2
      });

      // 2. Node 1 (Strand 1)
      elements.push({
        type: 'node',
        z: p.z1,
        x: p.x1,
        y: p.y,
        base: p.base1,
        index: p.index,
        strand: 1
      });

      // 3. Node 2 (Strand 2)
      elements.push({
        type: 'node',
        z: p.z2,
        x: p.x2,
        y: p.y,
        base: p.base2,
        index: p.index,
        strand: 2
      });
    });

    // Sort by depth Z descending (Painter's algorithm: draw lowest Z (furthest) first)
    elements.sort((a, b) => a.z - b.z);

    // Draw each element
    elements.forEach(el => {
      // Depth-based scaling parameters
      const perspectiveScale = 1 + el.z / 300; 
      const alpha = 0.25 + 0.75 * ((el.z + 60) / 120); // Normalized alpha mapping
      const clampedAlpha = Math.max(0.15, Math.min(1.0, alpha));

      if (el.type === 'bridge') {
        // Draw bridge linking bases
        ctx.beginPath();
        ctx.moveTo(el.x1, el.y);
        ctx.lineTo(el.x2, el.y);
        
        // Color transition using gradient
        const gradient = ctx.createLinearGradient(el.x1, el.y, el.x2, el.y);
        gradient.addColorStop(0, hexToRgba(colorMap[el.base1] || '#999', clampedAlpha));
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.08)');
        gradient.addColorStop(1, hexToRgba(colorMap[el.base2] || '#999', clampedAlpha));

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5 * perspectiveScale;
        ctx.stroke();

      } else if (el.type === 'node') {
        // Draw nucleotide node
        const radius = (selectedBaseIndex === el.index ? 8.5 : 6) * perspectiveScale;
        const color = colorMap[el.base] || '#999';

        ctx.beginPath();
        ctx.arc(el.x, el.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = hexToRgba(color, clampedAlpha);
        ctx.fill();

        // Glowing border for mutated/active nodes
        const isMutated = mutations.some(m => m.index === el.index);
        if (isMutated || selectedBaseIndex === el.index) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = selectedBaseIndex === el.index ? 2.5 : 1.5;
          ctx.stroke();
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Base single-letter overlay inside node if scale is large enough
        if (perspectiveScale > 1.05) {
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${Math.round(8 * perspectiveScale)}px var(--font-sans)`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.base, el.x, el.y);
        }
      }
    });

    // Draw active highlights if hovering node in Canvas
    if (helixHoverNode) {
      ctx.beginPath();
      ctx.arc(helixHoverNode.px, helixHoverNode.py, 10, 0, 2 * Math.PI);
      ctx.strokeStyle = 'var(--color-brand)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Keep loop spinning
    requestAnimationFrame(renderHelix);
  }

  function hexToRgba(hex, alpha) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x' + c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return 'rgba(255,255,255,'+alpha+')';
  }

  // Run initial setup
  init();
});
