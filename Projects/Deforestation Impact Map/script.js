/* ============================================================
   Deforestation Impact Map — Application Logic
   ============================================================ */

// --- Centralized State Management ---
const STATE = {
  selectedRegion: 'global',
  selectedYear: 2025,
  comparisonYear: 'prev', // 'prev', '1990', '2000'
  isPlaying: false,
  playbackSpeed: 800, // interval in ms
  comparisonMode: false,
  exploredRegions: new Set(),
  bookmarkedViews: [],
  quizState: {
    active: false,
    score: 0,
    currentQuestionIndex: 0,
    questions: [],
    streak: 0
  },
  mapMode: 'standard', // 'standard', 'heatmap', 'recovery'
  zoomScale: 1,
  zoomX: 0,
  zoomY: 0
};

// --- GIS Cell Coordinates for Regions ---
const FOREST_CELLS = {
  amazon: [
    { x: 185, y: 185 }, { x: 195, y: 180 }, { x: 205, y: 175 }, { x: 215, y: 185 },
    { x: 180, y: 195 }, { x: 190, y: 190 }, { x: 200, y: 185 }, { x: 210, y: 190 }, { x: 220, y: 195 },
    { x: 185, y: 205 }, { x: 195, y: 200 }, { x: 205, y: 195 }, { x: 215, y: 200 }, { x: 225, y: 205 },
    { x: 190, y: 215 }, { x: 200, y: 210 }, { x: 210, y: 205 }, { x: 220, y: 210 }
  ],
  congo: [
    { x: 380, y: 145 }, { x: 390, y: 140 }, { x: 400, y: 142 }, { x: 410, y: 145 },
    { x: 375, y: 155 }, { x: 385, y: 150 }, { x: 395, y: 148 }, { x: 405, y: 150 }, { x: 415, y: 155 }, { x: 425, y: 158 },
    { x: 380, y: 165 }, { x: 390, y: 160 }, { x: 400, y: 158 }, { x: 410, y: 160 }, { x: 420, y: 165 },
    { x: 385, y: 175 }, { x: 395, y: 170 }, { x: 405, y: 168 }, { x: 415, y: 172 }
  ],
  southeast_asia: [
    { x: 515, y: 142 }, { x: 525, y: 138 }, { x: 535, y: 140 }, { x: 545, y: 142 }, { x: 555, y: 145 },
    { x: 518, y: 152 }, { x: 528, y: 148 }, { x: 538, y: 150 }, { x: 548, y: 152 }, { x: 558, y: 155 }, { x: 568, y: 158 },
    { x: 532, y: 162 }, { x: 542, y: 158 }, { x: 552, y: 160 }, { x: 562, y: 165 },
    { x: 545, y: 172 }, { x: 555, y: 170 }, { x: 565, y: 175 }, { x: 575, y: 178 }
  ],
  boreal: [
    // Canada Boreal
    { x: 90, y: 50 }, { x: 105, y: 48 }, { x: 120, y: 47 }, { x: 135, y: 50 }, { x: 150, y: 52 }, { x: 165, y: 55 },
    { x: 85, y: 60 }, { x: 100, y: 58 }, { x: 115, y: 57 }, { x: 130, y: 60 }, { x: 145, y: 62 }, { x: 160, y: 65 }, { x: 175, y: 68 },
    { x: 95, y: 70 }, { x: 110, y: 68 }, { x: 125, y: 67 }, { x: 140, y: 70 }, { x: 155, y: 72 },
    // Eurasia Boreal
    { x: 430, y: 42 }, { x: 450, y: 40 }, { x: 470, y: 38 }, { x: 490, y: 40 }, { x: 510, y: 42 }, { x: 530, y: 45 }, { x: 550, y: 48 }, { x: 570, y: 50 }, { x: 590, y: 52 }, { x: 610, y: 55 }, { x: 630, y: 58 },
    { x: 440, y: 52 }, { x: 460, y: 50 }, { x: 480, y: 48 }, { x: 500, y: 50 }, { x: 520, y: 52 }, { x: 540, y: 55 }, { x: 560, y: 58 }, { x: 580, y: 60 }, { x: 600, y: 62 }, { x: 620, y: 65 },
    { x: 450, y: 62 }, { x: 470, y: 60 }, { x: 490, y: 58 }, { x: 510, y: 60 }, { x: 530, y: 62 }, { x: 550, y: 65 }, { x: 570, y: 68 }, { x: 590, y: 70 }
  ],
  north_america: [
    { x: 100, y: 85 }, { x: 115, y: 82 }, { x: 130, y: 80 }, { x: 145, y: 82 }, { x: 160, y: 85 },
    { x: 95, y: 95 }, { x: 110, y: 92 }, { x: 125, y: 90 }, { x: 140, y: 92 }, { x: 155, y: 95 }, { x: 170, y: 98 },
    { x: 90, y: 105 }, { x: 105, y: 102 }, { x: 120, y: 100 }, { x: 135, y: 102 }, { x: 150, y: 105 }, { x: 165, y: 108 }, { x: 180, y: 110 },
    { x: 100, y: 118 }, { x: 115, y: 115 }, { x: 130, y: 112 }, { x: 145, y: 115 }, { x: 160, y: 118 },
    { x: 110, y: 128 }, { x: 125, y: 125 }, { x: 140, y: 122 }, { x: 155, y: 125 }
  ],
  europe: [
    { x: 360, y: 52 }, { x: 372, y: 48 }, { x: 385, y: 46 }, { x: 398, y: 48 }, { x: 410, y: 52 },
    { x: 358, y: 62 }, { x: 370, y: 58 }, { x: 382, y: 56 }, { x: 395, y: 58 }, { x: 408, y: 62 }, { x: 420, y: 65 },
    { x: 362, y: 72 }, { x: 375, y: 68 }, { x: 388, y: 66 }, { x: 400, y: 68 }, { x: 412, y: 72 }, { x: 425, y: 75 },
    { x: 368, y: 82 }, { x: 380, y: 78 }, { x: 392, y: 76 }, { x: 405, y: 78 }, { x: 418, y: 82 },
    { x: 375, y: 90 }, { x: 388, y: 86 }, { x: 400, y: 85 }, { x: 412, y: 88 }
  ],
  australia: [
    { x: 650, y: 240 }, { x: 665, y: 235 }, { x: 680, y: 238 }, { x: 695, y: 242 },
    { x: 645, y: 250 }, { x: 660, y: 246 }, { x: 675, y: 248 }, { x: 690, y: 252 }, { x: 702, y: 255 },
    { x: 642, y: 260 }, { x: 658, y: 256 }, { x: 672, y: 258 }, { x: 688, y: 262 }, { x: 700, y: 265 },
    { x: 648, y: 270 }, { x: 662, y: 266 }, { x: 678, y: 268 }, { x: 692, y: 272 },
    { x: 655, y: 280 }, { x: 670, y: 276 }, { x: 685, y: 278 }
  ]
};

// --- Target Region Zoom Parameters ---
const ZOOM_CONFIG = {
  global: { scale: 1, tx: 0, ty: 0 },
  amazon: { scale: 2.8, tx: -160, ty: -350 },
  congo: { scale: 3.2, tx: -880, ty: -310 },
  southeast_asia: { scale: 3.4, tx: -1420, ty: -350 },
  boreal: { scale: 1.6, tx: -210, ty: -10 },
  north_america: { scale: 2.4, tx: 50, ty: -90 },
  europe: { scale: 3.0, tx: -760, ty: -50 },
  australia: { scale: 2.6, tx: -1340, ty: -470 }
};

// --- Conservation Intelligence Database ---
const FOREST_DATABASE = {
  amazon: {
    name: "Amazon Rainforest",
    continent: "South America",
    type: "Tropical Rainforest",
    totalArea: 5500000,
    treeDensity: 150,
    rainfall: "2,200 mm/year",
    biodiversityTotal: 3000000,
    endemicPercent: 45,
    conservationEfforts: [
      "Amazon Region Protected Areas (ARPA) network",
      "Real-time monitoring using DETER satellite alerts",
      "Reforestation of ranching corridors in Pará"
    ],
    drivers: { "Cattle Ranching": 65, "Soy Agriculture": 20, "Logging": 10, "Wildfires": 5 },
    anchors: {
      1990: { coverage: 87.5, biodiversityIndex: 9.8, threatenedSpecies: 240, carbonStorage: 110 },
      2000: { coverage: 82.1, biodiversityIndex: 9.1, threatenedSpecies: 380, carbonStorage: 103 },
      2010: { coverage: 75.4, biodiversityIndex: 8.2, threatenedSpecies: 680, carbonStorage: 95 },
      2020: { coverage: 68.2, biodiversityIndex: 6.9, threatenedSpecies: 1120, carbonStorage: 86 },
      2025: { coverage: 63.5, biodiversityIndex: 5.8, threatenedSpecies: 1450, carbonStorage: 80 }
    }
  },
  congo: {
    name: "Congo Basin",
    continent: "Africa",
    type: "Tropical Rainforest",
    totalArea: 1780000,
    treeDensity: 180,
    rainfall: "2,000 mm/year",
    biodiversityTotal: 400000,
    endemicPercent: 30,
    conservationEfforts: [
      "Congo Basin Forest Partnership (CBFP)",
      "Community-led wildlife corridors in Gabon and DRC",
      "FSC-certified sustainable timber zoning schemes"
    ],
    drivers: { "Smallholder Agriculture": 55, "Industrial Logging": 25, "Charcoal Production": 12, "Mining": 8 },
    anchors: {
      1990: { coverage: 92.4, biodiversityIndex: 9.6, threatenedSpecies: 110, carbonStorage: 46 },
      2000: { coverage: 89.8, biodiversityIndex: 9.2, threatenedSpecies: 160, carbonStorage: 44 },
      2010: { coverage: 86.5, biodiversityIndex: 8.7, threatenedSpecies: 290, carbonStorage: 43 },
      2020: { coverage: 81.3, biodiversityIndex: 7.8, threatenedSpecies: 490, carbonStorage: 40 },
      2025: { coverage: 77.8, biodiversityIndex: 7.1, threatenedSpecies: 640, carbonStorage: 38 }
    }
  },
  southeast_asia: {
    name: "Southeast Asia",
    continent: "Asia",
    type: "Tropical Rainforest",
    totalArea: 1900000,
    treeDensity: 140,
    rainfall: "2,500 mm/year",
    biodiversityTotal: 2000000,
    endemicPercent: 55,
    conservationEfforts: [
      "Heart of Borneo declaration for trans-boundary protection",
      "Palm oil concession moratoria and NDPE policies",
      "Peatland and mangrove rehabilitation in Sumatra"
    ],
    drivers: { "Palm Oil Plantation": 58, "Logging": 22, "Wildfires": 12, "Mining": 8 },
    anchors: {
      1990: { coverage: 78.4, biodiversityIndex: 9.2, threatenedSpecies: 380, carbonStorage: 34 },
      2000: { coverage: 69.1, biodiversityIndex: 8.0, threatenedSpecies: 590, carbonStorage: 30 },
      2010: { coverage: 58.6, biodiversityIndex: 6.5, threatenedSpecies: 980, carbonStorage: 25 },
      2020: { coverage: 51.2, biodiversityIndex: 5.2, threatenedSpecies: 1350, carbonStorage: 22 },
      2025: { coverage: 47.9, biodiversityIndex: 4.5, threatenedSpecies: 1600, carbonStorage: 20 }
    }
  },
  boreal: {
    name: "Boreal Forests",
    continent: "North America/Eurasia",
    type: "Boreal Forest (Taiga)",
    totalArea: 15000000,
    treeDensity: 95,
    rainfall: "600 mm/year",
    biodiversityTotal: 20000,
    endemicPercent: 5,
    conservationEfforts: [
      "Canadian Boreal Forest Agreement",
      "Siberian protected wilderness zones (Zapovedniks)",
      "Wildfire early-warning satellite networks"
    ],
    drivers: { "Wildfires": 45, "Logging": 35, "Mining / Oil Expansion": 12, "Pest Outbreaks": 8 },
    anchors: {
      1990: { coverage: 94.2, biodiversityIndex: 9.7, threatenedSpecies: 45, carbonStorage: 180 },
      2000: { coverage: 93.0, biodiversityIndex: 9.5, threatenedSpecies: 65, carbonStorage: 177 },
      2010: { coverage: 91.5, biodiversityIndex: 9.2, threatenedSpecies: 105, carbonStorage: 174 },
      2020: { coverage: 88.6, biodiversityIndex: 8.6, threatenedSpecies: 190, carbonStorage: 169 },
      2025: { coverage: 86.8, biodiversityIndex: 8.2, threatenedSpecies: 245, carbonStorage: 165 }
    }
  },
  north_america: {
    name: "North America",
    continent: "North America",
    type: "Temperate Forest",
    totalArea: 3100000,
    treeDensity: 110,
    rainfall: "1,100 mm/year",
    biodiversityTotal: 120000,
    endemicPercent: 15,
    conservationEfforts: [
      "US Forest Service timber extraction limits",
      "Old-growth forest protection acts",
      "Appalachian corridor wildlife tunnels"
    ],
    drivers: { "Urban Expansion": 38, "Logging": 32, "Wildfires": 20, "Pest Outbreaks": 10 },
    anchors: {
      1990: { coverage: 65.5, biodiversityIndex: 8.5, threatenedSpecies: 80, carbonStorage: 48 },
      2000: { coverage: 64.2, biodiversityIndex: 8.2, threatenedSpecies: 110, carbonStorage: 47 },
      2010: { coverage: 63.8, biodiversityIndex: 8.1, threatenedSpecies: 145, carbonStorage: 47 },
      2020: { coverage: 62.1, biodiversityIndex: 7.7, threatenedSpecies: 210, carbonStorage: 45 },
      2025: { coverage: 61.4, biodiversityIndex: 7.4, threatenedSpecies: 250, carbonStorage: 45 }
    }
  },
  europe: {
    name: "Europe",
    continent: "Europe",
    type: "Temperate Forest",
    totalArea: 1900000,
    treeDensity: 130,
    rainfall: "850 mm/year",
    biodiversityTotal: 80000,
    endemicPercent: 8,
    conservationEfforts: [
      "Natura 2000 protected network of EU ecosystems",
      "Bialowieza Forest protection campaigns in Poland",
      "Active afforestation and rewilding initiatives (e.g. Rewilding Europe)"
    ],
    drivers: { "Infrastructure Expansion": 40, "Agriculture": 30, "Wildfires": 18, "Logging": 12 },
    anchors: {
      1990: { coverage: 40.2, biodiversityIndex: 7.2, threatenedSpecies: 95, carbonStorage: 22 },
      2000: { coverage: 41.5, biodiversityIndex: 7.4, threatenedSpecies: 105, carbonStorage: 23 },
      2010: { coverage: 42.8, biodiversityIndex: 7.7, threatenedSpecies: 110, carbonStorage: 24 },
      2020: { coverage: 43.5, biodiversityIndex: 7.9, threatenedSpecies: 115, carbonStorage: 24 },
      2025: { coverage: 44.1, biodiversityIndex: 8.1, threatenedSpecies: 120, carbonStorage: 25 }
    }
  },
  australia: {
    name: "Australia",
    continent: "Oceania",
    type: "Dry Sclerophyll Forest",
    totalArea: 1340000,
    treeDensity: 80,
    rainfall: "700 mm/year",
    biodiversityTotal: 600000,
    endemicPercent: 85,
    conservationEfforts: [
      "Queensland land-clearing restriction acts",
      "Bushfire recovery and koala habitat seeding",
      "Eucalyptus seed banks and corridor connections"
    ],
    drivers: { "Wildfires": 50, "Agriculture Expansion": 28, "Urban Expansion": 12, "Mining": 10 },
    anchors: {
      1990: { coverage: 68.2, biodiversityIndex: 8.9, threatenedSpecies: 140, carbonStorage: 26 },
      2000: { coverage: 65.4, biodiversityIndex: 8.4, threatenedSpecies: 195, carbonStorage: 25 },
      2010: { coverage: 62.1, biodiversityIndex: 7.9, threatenedSpecies: 290, carbonStorage: 23 },
      2020: { coverage: 56.4, biodiversityIndex: 6.4, threatenedSpecies: 580, carbonStorage: 21 },
      2025: { coverage: 58.1, biodiversityIndex: 6.8, threatenedSpecies: 520, carbonStorage: 22 }
    }
  }
};

// --- 10 Ecology Quiz Questions (5 selected randomly) ---
const QUIZ_BANK = [
  {
    question: "Which region is home to the largest continuous rainforest on Earth?",
    options: ["Congo Basin", "Southeast Asia", "Amazon Rainforest", "Boreal Forests"],
    correct: 2,
    explanation: "The Amazon Rainforest is the largest continuous tropical rainforest, covering about 5.5 million square kilometers in South America."
  },
  {
    question: "What percentage of global greenhouse gas emissions comes from deforestation and forest degradation?",
    options: ["Around 5%", "Around 12-15%", "Over 40%", "Less than 1%"],
    correct: 1,
    explanation: "Deforestation and land-use changes account for roughly 12-15% of global anthropogenic CO₂ emissions, comparable to the entire transport sector."
  },
  {
    question: "Which of the following is the leading driver of deforestation in the Amazon Rainforest?",
    options: ["Commercial logging", "Agricultural expansion (cattle and soy)", "Forest wildfires", "Urban expansion"],
    correct: 1,
    explanation: "Cattle ranching and large-scale soybean farming represent the primary drivers of tree clearing in the South American Amazon."
  },
  {
    question: "What unique benefit does Boreal forest land provide for the global climate?",
    options: ["It stores massive amounts of soil carbon in permafrost", "It produces 80% of global oxygen", "It prevents hurricanes in coastal zones", "It transpires twice as much water as tropical forests"],
    correct: 0,
    explanation: "Boreal forests (taiga) store massive amounts of carbon, particularly in soil, peatlands, and surrounding permafrost, making their preservation critical."
  },
  {
    question: "Which country reversed its deforestation trend, doubling its forest cover over the last 40 years?",
    options: ["Brazil", "Indonesia", "Costa Rica", "Russia"],
    correct: 2,
    explanation: "Costa Rica doubled its forest cover from 26% in the 1980s to over 52% today through aggressive payments for ecosystem services."
  },
  {
    question: "What is an 'endemic species'?",
    options: ["A species that causes crop diseases", "A species found exclusively in one specific geographic area", "A species that migrates across continents", "An extinct species"],
    correct: 1,
    explanation: "Endemic species are native to and found only in a specific region, meaning regional deforestation can drive them straight to extinction."
  },
  {
    question: "Which region suffered severe bushfires in 2019-2020, destroying millions of hectares of eucalyptus forests?",
    options: ["Australia", "Siberia", "Amazon Basin", "Europe"],
    correct: 0,
    explanation: "Australia's 'Black Summer' bushfires in 2019-2020 burned millions of hectares, causing extreme wildlife loss and localized forest degradation."
  },
  {
    question: "What does a 'Biodiversity Impact Index' of 5.0 generally indicate?",
    options: ["An ecosystem in perfect pre-industrial condition", "50% loss of native species abundance and habitat health", "A 5-fold increase in species populations", "High risk of acid rain"],
    correct: 1,
    explanation: "A lower Biodiversity Index indicates habitat degradation and species abundance reduction. A value of 5.0 indicates significant damage."
  },
  {
    question: "What are 'ecosystem services'?",
    options: ["NGO support services for forest rangers", "Natural processes (like water filtration and carbon storage) that benefit humans", "Government regulations for logging", "The tourism bureau of national parks"],
    correct: 1,
    explanation: "Ecosystem services are the direct and indirect benefits that ecosystems provide to humans, including clean air, water purification, and climate regulation."
  },
  {
    question: "Which forest type has the highest canopy and tree density?",
    options: ["Boreal Forest", "Temperate Forest", "Tropical Rainforest", "Savanna Woodlands"],
    correct: 2,
    explanation: "Tropical rainforests feature a dense, layered canopy, hosting intense tree densities and the highest biodiversity density on Earth."
  }
];

// --- 8 Random Environmental Facts ---
const ECO_FACTS = [
  "The Amazon Rainforest generates its own rain via transpiration, acting as a massive water pump for South America.",
  "Boreal forests cover roughly 11% of Earth's land, making them the largest terrestrial biome.",
  "Over 80% of terrestrial biodiversity is found in forests, making deforestation the primary cause of land extinctions.",
  "Mature forests function as 'carbon sinks', absorbing approximately 2.6 billion tonnes of carbon dioxide every year.",
  "An estimated 1.6 billion people rely directly on forest resources for food, shelter, livelihood, and medicine.",
  "Every minute, a forest area equivalent to 27 football fields is lost globally to deforestation.",
  "Costa Rica's conservation success is funded partly by a national tax on fossil fuels, creating a direct feedback loop.",
  "The Great Green Wall in Africa is planned to span 8,000 km across the Sahel, restoring agricultural productivity."
];

// --- Variables for Intervals ---
let timelineInterval = null;

// --- Initialize DOM Selectors ---
document.addEventListener("DOMContentLoaded", () => {
  initPreferences();
  bindEvents();
  renderForestCells();
  updatePlatform();
  logActivity("System initialized. Deforestation Impact Map ready.");
});

// --- Preference & State Load ---
function initPreferences() {
  const savedPrefRegion = localStorage.getItem("deforestation_pref_region");
  const savedPrefYear = localStorage.getItem("deforestation_pref_year");
  const savedBookmarks = localStorage.getItem("deforestation_bookmarks");
  const savedHighScore = localStorage.getItem("deforestation_quiz_highscore");

  if (savedPrefRegion && FOREST_DATABASE[savedPrefRegion]) {
    STATE.selectedRegion = savedPrefRegion;
    document.getElementById("regionSelect").value = savedPrefRegion;
  }
  if (savedPrefYear) {
    const yr = parseInt(savedPrefYear, 10);
    if (yr >= 1990 && yr <= 2025) {
      STATE.selectedYear = yr;
      document.getElementById("yearSlider").value = yr;
    }
  }
  if (savedBookmarks) {
    try {
      STATE.bookmarkedViews = JSON.parse(savedBookmarks);
      updateBookmarksList();
    } catch(e) {
      STATE.bookmarkedViews = [];
    }
  }
  if (savedHighScore) {
    document.getElementById("quizHighScore").textContent = savedHighScore;
  }
}

// --- Bind Event Listeners ---
function bindEvents() {
  // Region Select Dropdown
  const regionSelect = document.getElementById("regionSelect");
  regionSelect.addEventListener("change", (e) => {
    STATE.selectedRegion = e.target.value;
    localStorage.setItem("deforestation_pref_region", STATE.selectedRegion);
    
    // Zoom focus to clicked/selected region
    applyMapZoom(STATE.selectedRegion);
    renderForestCells();
    updatePlatform();
    logActivity(`Loaded region: ${getRegionName(STATE.selectedRegion)}`);
  });

  // Year Slider
  const yearSlider = document.getElementById("yearSlider");
  yearSlider.addEventListener("input", (e) => {
    STATE.selectedYear = parseInt(e.target.value, 10);
    localStorage.setItem("deforestation_pref_year", STATE.selectedYear);
    updatePlatform();
  });
  yearSlider.addEventListener("change", () => {
    logActivity(`Selected timeline year: ${STATE.selectedYear}`);
  });

  // Timeline buttons
  document.getElementById("prevYearBtn").addEventListener("click", () => {
    adjustTimelineYear(-1);
  });
  document.getElementById("nextYearBtn").addEventListener("click", () => {
    adjustTimelineYear(1);
  });
  
  const playBtn = document.getElementById("playBtn");
  playBtn.addEventListener("click", () => {
    if (STATE.isPlaying) {
      pauseTimeline();
    } else {
      playTimeline();
    }
  });

  // Playback speeds
  document.querySelectorAll(".speed-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      STATE.playbackSpeed = parseInt(e.target.getAttribute("data-speed"), 10);
      
      // If playing, restart interval with new speed
      if (STATE.isPlaying) {
        pauseTimeline();
        playTimeline();
      }
    });
  });

  // Comparison toggle
  const compareCheck = document.getElementById("compareModeCheck");
  compareCheck.addEventListener("change", (e) => {
    STATE.comparisonMode = e.target.checked;
    const selectorWrapper = document.getElementById("comparisonSelectorWrapper");
    if (STATE.comparisonMode) {
      selectorWrapper.style.display = "block";
      logActivity("Comparison Mode enabled.");
    } else {
      selectorWrapper.style.display = "none";
      logActivity("Comparison Mode disabled.");
    }
    updatePlatform();
  });

  const compareYearSelect = document.getElementById("compareYearSelect");
  compareYearSelect.addEventListener("change", (e) => {
    STATE.comparisonYear = e.target.value;
    logActivity(`Comparing Year ${STATE.selectedYear} vs baseline: ${STATE.comparisonYear}`);
    updatePlatform();
  });

  // Floating map modes
  document.getElementById("mapModeStandard").addEventListener("click", (e) => {
    setMapMode("standard", e.target);
  });
  document.getElementById("mapModeHeatmap").addEventListener("click", (e) => {
    setMapMode("heatmap", e.target);
  });
  document.getElementById("mapModeRecovery").addEventListener("click", (e) => {
    setMapMode("recovery", e.target);
  });

  // GIS SVG Zoom Controls
  document.getElementById("zoomInBtn").addEventListener("click", () => {
    adjustCustomZoom(1.2);
  });
  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    adjustCustomZoom(0.8);
  });
  document.getElementById("zoomResetBtn").addEventListener("click", () => {
    applyMapZoom(STATE.selectedRegion);
  });

  // Map clicks (continent paths and click handling)
  document.querySelectorAll(".continent").forEach(path => {
    path.addEventListener("click", (e) => {
      const id = e.target.id;
      let targetRegion = 'global';
      if (id === 'cont-sa') targetRegion = 'amazon';
      else if (id === 'cont-africa') targetRegion = 'congo';
      else if (id === 'cont-seasia-1' || id === 'cont-seasia-2') targetRegion = 'southeast_asia';
      else if (id === 'cont-australia') targetRegion = 'australia';
      else if (id === 'cont-na') targetRegion = 'north_america';
      else if (id === 'cont-europe') targetRegion = 'europe';
      else if (id === 'cont-asia') targetRegion = 'boreal';

      if (targetRegion !== 'global') {
        STATE.selectedRegion = targetRegion;
        document.getElementById("regionSelect").value = targetRegion;
        localStorage.setItem("deforestation_pref_region", targetRegion);
        applyMapZoom(targetRegion);
        renderForestCells();
        updatePlatform();
        logActivity(`Map Click: Loaded ${getRegionName(targetRegion)}`);
      }
    });
  });

  // Active Region badge clear selection
  document.getElementById("activeRegionClose").addEventListener("click", () => {
    STATE.selectedRegion = 'global';
    document.getElementById("regionSelect").value = 'global';
    localStorage.setItem("deforestation_pref_region", 'global');
    applyMapZoom('global');
    renderForestCells();
    updatePlatform();
    logActivity("Cleared region selection. Displaying Global Overview.");
  });

  // Coordinates hover tracking on SVG map
  const worldMap = document.getElementById("worldMap");
  worldMap.addEventListener("mousemove", (e) => {
    const rect = worldMap.getBoundingClientRect();
    // coordinates relative to viewbox 800x400
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    
    // Latitude / Longitude calculations
    const lng = ((x - 400) * 0.45).toFixed(1);
    const lat = ((200 - y) * 0.45).toFixed(1);
    
    // Update active region badge type subtitle to show coordinates
    const indicatorType = document.getElementById("activeRegionType");
    const formattedLng = lng >= 0 ? `${lng}°E` : `${Math.abs(lng)}°W`;
    const formattedLat = lat >= 0 ? `${lat}°N` : `${Math.abs(lat)}°S`;
    
    if (STATE.selectedRegion !== 'global') {
      const dbEntry = FOREST_DATABASE[STATE.selectedRegion];
      indicatorType.innerHTML = `${dbEntry.type} <span class="mono text-accent" style="margin-left: 8px;">[${formattedLat}, ${formattedLng}]</span>`;
    }
  });

  // Bookmarking Views
  document.getElementById("addBookmarkBtn").addEventListener("click", () => {
    addCurrentViewBookmark();
  });

  // Bottom action bar navigation
  document.getElementById("openQuizBtn").addEventListener("click", () => openModal("quizModal"));
  document.getElementById("closeQuizModal").addEventListener("click", () => closeModal("quizModal"));
  document.getElementById("startQuizBtn").addEventListener("click", startQuiz);
  document.getElementById("quizNextBtn").addEventListener("click", nextQuizQuestion);
  document.getElementById("quizRestartBtn").addEventListener("click", startQuiz);

  document.getElementById("openCalculatorBtn").addEventListener("click", () => {
    openModal("calculatorModal");
    updateCalculatorResults();
  });
  document.getElementById("closeCalculatorModal").addEventListener("click", () => closeModal("calculatorModal"));
  document.getElementById("calcAreaInput").addEventListener("input", updateCalculatorResults);
  document.getElementById("calcRegionSelect").addEventListener("change", updateCalculatorResults);

  document.getElementById("openSuccessBtn").addEventListener("click", () => openModal("successModal"));
  document.getElementById("closeSuccessModal").addEventListener("click", () => closeModal("successModal"));

  document.getElementById("randomFactBtn").addEventListener("click", triggerRandomEcoFact);
  document.getElementById("closeFactToast").addEventListener("click", () => {
    document.getElementById("factToast").style.display = "none";
  });

  document.getElementById("exportDataBtn").addEventListener("click", exportAnalyticsData);

  // Region details modal close
  document.getElementById("closeDetailModal").addEventListener("click", () => closeModal("regionDetailModal"));
  
  // High contrast mode trigger using custom keyboard keys (e.g. Alt + C)
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === 'c') {
      document.body.classList.toggle("high-contrast");
      logActivity(`Toggled High Contrast accessibility mode: ${document.body.classList.contains("high-contrast")}`);
    }
  });
}

// --- Dynamic Forest Cell Rendering ---
function renderForestCells() {
  const container = document.getElementById("forestCellsGroup");
  container.innerHTML = "";
  
  const drawList = [];
  if (STATE.selectedRegion === 'global') {
    Object.keys(FOREST_CELLS).forEach(r => {
      FOREST_CELLS[r].forEach((c, idx) => {
        drawList.push({ region: r, index: idx, x: c.x, y: c.y });
      });
    });
  } else if (FOREST_CELLS[STATE.selectedRegion]) {
    FOREST_CELLS[STATE.selectedRegion].forEach((c, idx) => {
      drawList.push({ region: STATE.selectedRegion, index: idx, x: c.x, y: c.y });
    });
  }

  drawList.forEach(cell => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cell.x);
    circle.setAttribute("cy", cell.y);
    circle.setAttribute("r", 4);
    circle.setAttribute("class", "forest-cell");
    circle.setAttribute("data-region", cell.region);
    circle.setAttribute("data-index", cell.index);
    circle.setAttribute("tabindex", "0");
    circle.setAttribute("role", "img");
    
    // Accessibility labels
    circle.setAttribute("aria-label", `Forest grid cell in ${getRegionName(cell.region)}`);

    // Interactive details card on cell click
    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      openRegionDetailsModal(cell.region);
    });

    circle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openRegionDetailsModal(cell.region);
      }
    });

    container.appendChild(circle);
  });

  updateCellColors();
}

// --- Cell Color Interpolation Engine ---
function updateCellColors() {
  const cells = document.querySelectorAll(".forest-cell");
  cells.forEach(c => {
    const region = c.getAttribute("data-region");
    const index = parseInt(c.getAttribute("data-index"), 10);
    const cellsInRegion = FOREST_CELLS[region].length;

    // Vulnerability threshold for spreading deforestation (0 to 1)
    const vulnerability = (index + 0.5) / cellsInRegion;

    const dataYear2 = getInterpolatedData(region, STATE.selectedYear);
    const coverageYear2 = dataYear2.coverage / 100; // 0 to 1

    if (STATE.mapMode === 'standard') {
      c.className.baseVal = "forest-cell";
      // standard color grading
      if (vulnerability > coverageYear2) {
        c.classList.add("cell-deforested");
      } else if (coverageYear2 - vulnerability < 0.12) {
        c.classList.add("cell-sparse");
      } else if (coverageYear2 - vulnerability < 0.28) {
        c.classList.add("cell-moderate");
      } else {
        c.classList.add("cell-dense");
      }
    } 
    else if (STATE.mapMode === 'heatmap') {
      c.className.baseVal = "forest-cell";
      // Show critical points of loss
      const initialCoverage = FOREST_DATABASE[region].anchors[1990].coverage / 100;
      const totalLossRatio = initialCoverage - coverageYear2;

      if (vulnerability > coverageYear2) {
        if (totalLossRatio > 0.3) c.classList.add("cell-heat-critical");
        else if (totalLossRatio > 0.15) c.classList.add("cell-heat-high");
        else c.classList.add("cell-heat-moderate");
      } else {
        c.classList.add("cell-heat-stable");
      }
    } 
    else if (STATE.mapMode === 'recovery') {
      c.className.baseVal = "forest-cell";
      
      // Compare current year against a baseline year
      let baseYear = 1990;
      if (STATE.comparisonYear === 'prev') baseYear = Math.max(1990, STATE.selectedYear - 1);
      else baseYear = parseInt(STATE.comparisonYear, 10);

      const dataYear1 = getInterpolatedData(region, baseYear);
      const coverageYear1 = dataYear1.coverage / 100;

      const wasDeforested = vulnerability > coverageYear1;
      const isDeforested = vulnerability > coverageYear2;

      if (wasDeforested && !isDeforested) {
        c.classList.add("cell-diff-recovered"); // Recovered forest
      } else if (!wasDeforested && isDeforested) {
        c.classList.add("cell-diff-lost"); // Lost forest
      } else if (isDeforested) {
        c.classList.add("cell-diff-stable"); // Stable deforested area
      } else {
        // At risk if in sparse zones
        if (coverageYear2 - vulnerability < 0.08) {
          c.classList.add("cell-diff-atrisk");
        } else {
          c.classList.add("cell-diff-stable");
        }
      }
    }
  });
}

// --- Interpolation Engine for Yearly Data ---
function getInterpolatedData(regionKey, year) {
  const region = FOREST_DATABASE[regionKey];
  if (!region) return { coverage: 0, biodiversityIndex: 0, threatenedSpecies: 0, carbonStorage: 0 };

  const anchors = Object.keys(region.anchors).map(y => parseInt(y, 10)).sort((a,b)=>a-b);
  
  if (region.anchors[year]) {
    return region.anchors[year];
  }

  // Find surrounding anchors
  let lowerYear = anchors[0];
  let upperYear = anchors[anchors.length - 1];

  for (let i = 0; i < anchors.length - 1; i++) {
    if (year > anchors[i] && year < anchors[i+1]) {
      lowerYear = anchors[i];
      upperYear = anchors[i+1];
      break;
    }
  }

  const lowerVal = region.anchors[lowerYear];
  const upperVal = region.anchors[upperYear];
  
  const t = (year - lowerYear) / (upperYear - lowerYear);

  return {
    coverage: lowerVal.coverage + t * (upperVal.coverage - lowerVal.coverage),
    biodiversityIndex: lowerVal.biodiversityIndex + t * (upperVal.biodiversityIndex - lowerVal.biodiversityIndex),
    threatenedSpecies: Math.round(lowerVal.threatenedSpecies + t * (upperVal.threatenedSpecies - lowerVal.threatenedSpecies)),
    carbonStorage: lowerVal.carbonStorage + t * (upperVal.carbonStorage - lowerVal.carbonStorage)
  };
}

// --- Get Dynamic Aggregated Global Data ---
function getGlobalDataForYear(year) {
  let totalArea = 0;
  let weightedCoverage = 0;
  let weightedBioIndex = 0;
  let totalThreatened = 0;
  let totalCarbon = 0;

  Object.keys(FOREST_DATABASE).forEach(key => {
    const region = FOREST_DATABASE[key];
    const data = getInterpolatedData(key, year);
    totalArea += region.totalArea;
    weightedCoverage += data.coverage * region.totalArea;
    weightedBioIndex += data.biodiversityIndex * region.totalArea;
    totalThreatened += data.threatenedSpecies;
    totalCarbon += data.carbonStorage;
  });

  return {
    coverage: weightedCoverage / totalArea,
    biodiversityIndex: weightedBioIndex / totalArea,
    threatenedSpecies: totalThreatened,
    carbonStorage: totalCarbon
  };
}

// --- Update UI Statistics and Panels ---
function updatePlatform() {
  const isGlobal = STATE.selectedRegion === 'global';
  let activeData, baseData;
  let labelText = getRegionName(STATE.selectedRegion);
  
  if (isGlobal) {
    activeData = getGlobalDataForYear(STATE.selectedYear);
  } else {
    activeData = getInterpolatedData(STATE.selectedRegion, STATE.selectedYear);
    STATE.exploredRegions.add(STATE.selectedRegion);
  }

  // Map header updates
  document.getElementById("mapHeaderRegion").textContent = labelText;
  document.getElementById("mapHeaderYear").textContent = STATE.selectedYear;
  document.getElementById("mapHeaderCoverage").textContent = `${activeData.coverage.toFixed(1)}%`;
  
  const headRisk = document.getElementById("mapHeaderRisk");
  const riskAssessment = calculateRisk(STATE.selectedRegion, activeData.coverage);
  headRisk.textContent = riskAssessment.label;
  headRisk.className = `map-header-value ${riskAssessment.colorClass}`;

  // Left panel details updates
  const areaValue = isGlobal 
    ? Object.values(FOREST_DATABASE).reduce((a,b)=>a+b.totalArea, 0)
    : FOREST_DATABASE[STATE.selectedRegion].totalArea;
    
  const currentCoverageKm = (activeData.coverage / 100) * areaValue;

  // Set the text contents
  document.getElementById("currentYearDisplay").textContent = STATE.selectedYear;
  document.getElementById("statCoverage").textContent = `${activeData.coverage.toFixed(1)}%`;
  document.getElementById("statArea").textContent = `${formatNumber(currentCoverageKm)} km²`;
  document.getElementById("statCarbon").textContent = `${activeData.carbonStorage.toFixed(1)} Gt`;
  document.getElementById("statBiodiversity").textContent = `${activeData.biodiversityIndex.toFixed(1)}/10`;
  document.getElementById("bioProgressFill").style.width = `${activeData.biodiversityIndex * 10}%`;

  // Lost forest calculation
  let initialCoveragePct = 0;
  if (isGlobal) {
    initialCoveragePct = Object.keys(FOREST_DATABASE).reduce((acc, k) => {
      return acc + (FOREST_DATABASE[k].anchors[1990].coverage * FOREST_DATABASE[k].totalArea);
    }, 0) / areaValue;
  } else {
    initialCoveragePct = FOREST_DATABASE[STATE.selectedRegion].anchors[1990].coverage;
  }
  
  const lostArea = Math.max(0, (initialCoveragePct - activeData.coverage) / 100 * areaValue);
  document.getElementById("statLost").textContent = `${formatNumber(lostArea)} km²`;

  // Risk monitor card
  const rIndicator = document.getElementById("riskIndicator");
  const rLabel = document.getElementById("riskLabel");
  const rDesc = document.getElementById("riskDescription");
  
  rLabel.textContent = riskAssessment.label;
  rDesc.textContent = riskAssessment.desc;
  rIndicator.className = `risk-indicator ${riskAssessment.colorClass}`;

  // Active region badge overlay on right panel
  const activeRegionBadge = document.getElementById("activeRegionIndicator");
  if (isGlobal) {
    activeRegionBadge.hidden = true;
  } else {
    activeRegionBadge.hidden = false;
    document.getElementById("activeRegionTitle").textContent = labelText;
    document.getElementById("activeRegionType").textContent = FOREST_DATABASE[STATE.selectedRegion].type;
  }

  // Trigger cell colors redraw
  updateCellColors();
}

// --- Deforestation Risk Assessment Formula ---
function calculateRisk(regionKey, coveragePct) {
  let initial = 100;
  if (regionKey === 'global') {
    initial = 68.5; // Average 1990 global coverage
  } else {
    initial = FOREST_DATABASE[regionKey].anchors[1990].coverage;
  }

  const lossRatio = (initial - coveragePct) / initial;

  if (lossRatio < 0.03) {
    return {
      label: "STABLE",
      colorClass: "text-accent risk-stable",
      desc: "Forest loss is negligible. Ecosystem services are in a highly stable condition."
    };
  } else if (lossRatio < 0.12) {
    return {
      label: "MODERATE LOSS",
      colorClass: "text-warning risk-moderate",
      desc: "Detecting localized deforestation pathways. Wildlife corridors are experiencing initial fragmentation."
    };
  } else if (lossRatio < 0.25) {
    return {
      label: "HIGH LOSS",
      colorClass: "text-danger risk-high",
      desc: "Severe habitat shrinkage. Carbon capture rate has degraded significantly with increased risks."
    };
  } else {
    return {
      label: "CRITICAL LOSS",
      colorClass: "text-danger risk-critical",
      desc: "Critical ecosystem collapse imminent. Severe biodiversity depletion and high carbon emissions."
    };
  }
}

// --- Map Selection Highlight and Zoom Focusing ---
function applyMapZoom(regionKey) {
  const config = ZOOM_CONFIG[regionKey] || ZOOM_CONFIG.global;
  const viewport = document.getElementById("mapViewportGroup");
  
  STATE.zoomScale = config.scale;
  STATE.zoomX = config.tx;
  STATE.zoomY = config.ty;

  viewport.style.transform = `translate(${STATE.zoomX}px, ${STATE.zoomY}px) scale(${STATE.zoomScale})`;
  
  // Update UI selection on continents paths
  document.querySelectorAll(".continent").forEach(el => el.classList.remove("selected-region"));
  
  const mappedContinentId = getContinentIdForRegion(regionKey);
  if (mappedContinentId) {
    const contElement = document.getElementById(mappedContinentId);
    if (contElement) contElement.classList.add("selected-region");
  }
}

function adjustCustomZoom(factor) {
  STATE.zoomScale = Math.max(1, Math.min(10, STATE.zoomScale * factor));
  // Keep centered
  const viewport = document.getElementById("mapViewportGroup");
  viewport.style.transform = `translate(${STATE.zoomX}px, ${STATE.zoomY}px) scale(${STATE.zoomScale})`;
}

// --- Timeline Playback controls ---
function adjustTimelineYear(delta) {
  let newYear = STATE.selectedYear + delta;
  if (newYear < 1990) newYear = 1990;
  if (newYear > 2025) newYear = 2025;
  
  STATE.selectedYear = newYear;
  document.getElementById("yearSlider").value = newYear;
  localStorage.setItem("deforestation_pref_year", newYear);
  updatePlatform();
}

function playTimeline() {
  if (STATE.selectedYear >= 2025) {
    STATE.selectedYear = 1990;
    document.getElementById("yearSlider").value = 1990;
  }
  
  STATE.isPlaying = true;
  document.querySelector(".icon-play").style.display = "none";
  document.querySelector(".icon-pause").style.display = "inline";
  
  logActivity("Started timeline playback.");
  
  timelineInterval = setInterval(() => {
    if (STATE.selectedYear < 2025) {
      adjustTimelineYear(1);
    } else {
      pauseTimeline();
    }
  }, STATE.playbackSpeed);
}

function pauseTimeline() {
  STATE.isPlaying = false;
  document.querySelector(".icon-play").style.display = "inline";
  document.querySelector(".icon-pause").style.display = "none";
  clearInterval(timelineInterval);
  logActivity("Paused timeline playback.");
}

// --- Map Modes Setter ---
function setMapMode(mode, targetBtn) {
  STATE.mapMode = mode;
  document.querySelectorAll(".floating-btn").forEach(btn => btn.classList.remove("active"));
  targetBtn.classList.add("active");

  // Toggle visible legends
  document.getElementById("legendStandard").style.display = mode === 'standard' ? 'flex' : 'none';
  document.getElementById("legendHeatmap").style.display = mode === 'heatmap' ? 'flex' : 'none';
  document.getElementById("legendRecovery").style.display = mode === 'recovery' ? 'flex' : 'none';

  logActivity(`Map mode updated to: ${mode.toUpperCase()}`);
  updateCellColors();
}

// --- Open Detailed Region Analytics modal ---
function openRegionDetailsModal(regionKey) {
  const db = FOREST_DATABASE[regionKey];
  if (!db) return;

  const activeData = getInterpolatedData(regionKey, STATE.selectedYear);

  document.getElementById("modalRegionTitle").textContent = db.name;
  document.getElementById("modalRegionBadge").textContent = db.type;
  document.getElementById("modalContinent").textContent = db.continent;
  document.getElementById("modalTotalArea").textContent = `${formatNumber(db.totalArea)} km²`;
  document.getElementById("modalTreeDensity").textContent = `${db.treeDensity} trees / hectare`;
  document.getElementById("modalRainfall").textContent = db.rainfall;

  document.getElementById("modalBioTotal").textContent = formatNumber(db.biodiversityTotal);
  document.getElementById("modalBioThreatened").textContent = activeData.threatenedSpecies;
  document.getElementById("modalBioEndemic").textContent = `${db.endemicPercent}%`;

  // Deforestation drivers progress bars
  const driversContainer = document.getElementById("modalDriversList");
  driversContainer.innerHTML = "";
  
  Object.keys(db.drivers).forEach(driver => {
    const value = db.drivers[driver];
    const row = document.createElement("div");
    row.className = "driver-row";
    row.innerHTML = `
      <div class="driver-info">
        <span>${driver}</span>
        <span class="mono text-warning">${value}%</span>
      </div>
      <div class="driver-bar-bg">
        <div class="driver-bar-fill" style="width: ${value}%"></div>
      </div>
    `;
    driversContainer.appendChild(row);
  });

  // Conservation list
  const listContainer = document.getElementById("modalConservationList");
  listContainer.innerHTML = "";
  db.conservationEfforts.forEach(effort => {
    const li = document.createElement("li");
    li.textContent = effort;
    listContainer.appendChild(li);
  });

  openModal("regionDetailModal");
  logActivity(`Opened deep analytics for ${db.name}`);
}

// --- Carbon and Land Offset Calculator ---
function updateCalculatorResults() {
  const area = parseFloat(document.getElementById("calcAreaInput").value) || 1;
  const region = document.getElementById("calcRegionSelect").value;
  
  let carbonFactor = 16000; // t CO₂ eq per km²
  let valueFactor = 12000; // dollars per km²
  let speciesDensity = 480; // species per km²

  if (region === 'boreal') {
    carbonFactor = 11000;
    valueFactor = 7000;
    speciesDensity = 120;
  } else if (region === 'europe') {
    carbonFactor = 8500;
    valueFactor = 9500;
    speciesDensity = 210;
  }

  const carbonTotal = area * carbonFactor;
  const carsEquivalent = Math.round(carbonTotal / 4.6); // 4.6 tons per car per year
  const speciesProtected = Math.round(area * speciesDensity);
  const economicValue = area * valueFactor;

  document.getElementById("calcCarbon").textContent = `${formatNumber(Math.round(carbonTotal))} t CO₂eq`;
  document.getElementById("calcCars").textContent = `${formatNumber(carsEquivalent)} cars/year`;
  document.getElementById("calcSpecies").textContent = `${formatNumber(speciesProtected)} species`;
  document.getElementById("calcValue").textContent = `$${formatNumber(Math.round(economicValue))} / year`;
}

// --- Bookmarking View System ---
function addCurrentViewBookmark() {
  if (STATE.bookmarkedViews.length >= 5) {
    logActivity("Bookmark limit reached (max 5). Delete an existing view.");
    alert("Bookmark limit reached. Please remove one before saving.");
    return;
  }

  const nameInput = prompt("Enter a label for this bookmarked view:", `${getRegionName(STATE.selectedRegion)} [${STATE.selectedYear}]`);
  if (!nameInput) return;

  const bookmark = {
    id: Date.now(),
    name: nameInput,
    region: STATE.selectedRegion,
    year: STATE.selectedYear,
    mode: STATE.mapMode
  };

  STATE.bookmarkedViews.push(bookmark);
  localStorage.setItem("deforestation_bookmarks", JSON.stringify(STATE.bookmarkedViews));
  updateBookmarksList();
  logActivity(`Saved view bookmark: "${bookmark.name}"`);
}

function updateBookmarksList() {
  const container = document.getElementById("bookmarksList");
  container.innerHTML = "";

  if (STATE.bookmarkedViews.length === 0) {
    container.innerHTML = `<span class="empty-text">No saved views yet.</span>`;
    return;
  }

  STATE.bookmarkedViews.forEach(bookmark => {
    const item = document.createElement("div");
    item.className = "bookmark-item";
    item.innerHTML = `
      <div class="bookmark-details" style="flex:1;">
        <div class="bookmark-title font-semibold">${bookmark.name}</div>
        <div class="bookmark-meta text-xs text-muted">${getRegionName(bookmark.region)} | ${bookmark.year}</div>
      </div>
      <button class="bookmark-delete-btn" aria-label="Delete saved view">&times;</button>
    `;

    // Click details to load bookmark
    item.addEventListener("click", () => {
      STATE.selectedRegion = bookmark.region;
      STATE.selectedYear = bookmark.year;
      STATE.mapMode = bookmark.mode;
      
      document.getElementById("regionSelect").value = bookmark.region;
      document.getElementById("yearSlider").value = bookmark.year;
      
      // Update UI button state
      const targetBtnId = bookmark.mode === 'standard' ? 'mapModeStandard' : bookmark.mode === 'heatmap' ? 'mapModeHeatmap' : 'mapModeRecovery';
      document.querySelectorAll(".floating-btn").forEach(btn => btn.classList.remove("active"));
      document.getElementById(targetBtnId).classList.add("active");

      applyMapZoom(bookmark.region);
      renderForestCells();
      updatePlatform();
      logActivity(`Loaded saved view bookmark: "${bookmark.name}"`);
    });

    // Delete bookmark handler
    item.querySelector(".bookmark-delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      STATE.bookmarkedViews = STATE.bookmarkedViews.filter(b => b.id !== bookmark.id);
      localStorage.setItem("deforestation_bookmarks", JSON.stringify(STATE.bookmarkedViews));
      updateBookmarksList();
      logActivity(`Deleted saved view: "${bookmark.name}"`);
    });

    container.appendChild(item);
  });
}

// --- Ecology Quiz Engine ---
function startQuiz() {
  STATE.quizState.active = true;
  STATE.quizState.score = 0;
  STATE.quizState.currentQuestionIndex = 0;
  STATE.quizState.streak = 0;
  
  // Shuffle and select 5 questions from the bank of 10
  STATE.quizState.questions = shuffleArray([...QUIZ_BANK]).slice(0, 5);

  document.getElementById("quizSetup").style.display = "none";
  document.getElementById("quizResultPanel").style.display = "none";
  document.getElementById("quizQuestionPanel").style.display = "block";
  document.getElementById("quizFeedback").style.display = "none";
  document.getElementById("quizNextBtn").style.display = "none";

  loadQuizQuestion();
}

function loadQuizQuestion() {
  const currentIdx = STATE.quizState.currentQuestionIndex;
  const q = STATE.quizState.questions[currentIdx];

  document.getElementById("currentQuestionNum").textContent = currentIdx + 1;
  document.getElementById("quizQuestionText").textContent = q.question;
  
  // Progress Bar
  document.getElementById("quizProgressFill").style.width = `${((currentIdx) / 5) * 100}%`;

  const optionsList = document.getElementById("quizOptionsList");
  optionsList.innerHTML = "";

  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleQuizAnswer(index, btn));
    optionsList.appendChild(btn);
  });

  document.getElementById("quizFeedback").style.display = "none";
  document.getElementById("quizNextBtn").style.display = "none";
}

function handleQuizAnswer(selectedIndex, selectedBtn) {
  const currentIdx = STATE.quizState.currentQuestionIndex;
  const q = STATE.quizState.questions[currentIdx];
  const optionsList = document.getElementById("quizOptionsList");
  
  // Disable all buttons in list
  optionsList.querySelectorAll(".quiz-opt-btn").forEach(btn => btn.disabled = true);

  const feedbackBox = document.getElementById("quizFeedback");
  const feedbackText = document.getElementById("factToastText"); // reuse or use feedbackText
  
  if (selectedIndex === q.correct) {
    STATE.quizState.score++;
    STATE.quizState.streak++;
    selectedBtn.classList.add("correct");
    document.getElementById("quizFeedbackText").innerHTML = `<strong class="text-accent">Correct!</strong> ${q.explanation}`;
  } else {
    STATE.quizState.streak = 0;
    selectedBtn.classList.add("wrong");
    optionsList.children[q.correct].classList.add("correct");
    document.getElementById("quizFeedbackText").innerHTML = `<strong class="text-danger">Incorrect.</strong> ${q.explanation}`;
  }

  document.getElementById("quizScore").textContent = STATE.quizState.score;
  feedbackBox.style.display = "block";
  document.getElementById("quizNextBtn").style.display = "block";
}

function nextQuizQuestion() {
  STATE.quizState.currentQuestionIndex++;
  if (STATE.quizState.currentQuestionIndex < 5) {
    loadQuizQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  document.getElementById("quizQuestionPanel").style.display = "none";
  document.getElementById("quizResultPanel").style.display = "block";
  document.getElementById("finalScore").textContent = STATE.quizState.score;

  // Set highscore
  const currentHighScore = parseInt(localStorage.getItem("deforestation_quiz_highscore") || "0", 10);
  if (STATE.quizState.score > currentHighScore) {
    localStorage.setItem("deforestation_quiz_highscore", STATE.quizState.score);
    document.getElementById("quizHighScore").textContent = STATE.quizState.score;
    logActivity(`New Quiz High Score achieved: ${STATE.quizState.score}/5`);
  }

  // Explore Achievements
  const achievementNotice = document.getElementById("quizAchievementNotice");
  const achievementName = document.getElementById("achievementName");
  
  if (STATE.quizState.score === 5) {
    achievementNotice.style.display = "flex";
    achievementName.textContent = "Earth Sentinel (5/5 Correct)";
  } else if (STATE.quizState.score >= 3) {
    achievementNotice.style.display = "flex";
    achievementName.textContent = "Forest Ranger (Passed Quiz)";
  } else {
    achievementNotice.style.display = "none";
  }
}

// --- Random Eco Fact Generator ---
function triggerRandomEcoFact() {
  const index = Math.floor(Math.random() * ECO_FACTS.length);
  const toast = document.getElementById("factToast");
  const text = document.getElementById("factToastText");
  
  text.textContent = ECO_FACTS[index];
  toast.style.display = "block";
  
  // Log fact
  logActivity(`Triggered Eco Fact insight.`);

  // Auto hide after 8 seconds
  setTimeout(() => {
    toast.style.display = "none";
  }, 8000);
}

// --- Export Analytics as JSON ---
function exportAnalyticsData() {
  const region = STATE.selectedRegion;
  const db = FOREST_DATABASE[region];
  
  let exportPayload = {};

  if (region === 'global') {
    exportPayload = {
      title: "Deforestation Impact Map Global Export",
      timestamp: new Date().toISOString(),
      region: "Global Overview",
      historicalSeries: {}
    };
    for (let year = 1990; year <= 2025; year++) {
      exportPayload.historicalSeries[year] = getGlobalDataForYear(year);
    }
  } else {
    exportPayload = {
      title: `Deforestation Impact Map Export - ${db.name}`,
      timestamp: new Date().toISOString(),
      regionName: db.name,
      continent: db.continent,
      forestType: db.type,
      totalAreaKm2: db.totalArea,
      drivers: db.drivers,
      historicalSeries: {}
    };
    for (let year = 1990; year <= 2025; year++) {
      exportPayload.historicalSeries[year] = getInterpolatedData(region, year);
    }
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Deforestation_Impact_${region}_${STATE.selectedYear}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  logActivity(`Exported climate intelligence data for ${getRegionName(region)}`);
}

// --- Helper Utilities ---
function formatNumber(num) {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getRegionName(key) {
  if (key === 'global') return "Global Overview";
  return FOREST_DATABASE[key] ? FOREST_DATABASE[key].name : key;
}

function getContinentIdForRegion(key) {
  const mapping = {
    amazon: 'cont-sa',
    congo: 'cont-africa',
    southeast_asia: 'cont-seasia-1',
    boreal: 'cont-asia',
    north_america: 'cont-na',
    europe: 'cont-europe',
    australia: 'cont-australia'
  };
  return mapping[key] || null;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function logActivity(text) {
  const feed = document.getElementById("activityFeed");
  if (!feed) return;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  const item = document.createElement("div");
  item.className = "activity-item";
  item.innerHTML = `<span class="activity-time mono">${timeStr}</span><span class="activity-text">${text}</span>`;
  
  // Prepend
  feed.insertBefore(item, feed.firstChild);

  // Cap at 20 items to prevent memory bloat
  while (feed.children.length > 20) {
    feed.removeChild(feed.lastChild);
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
  }
}
