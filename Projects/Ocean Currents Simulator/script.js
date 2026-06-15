/* ============================================================
   Ocean Currents Simulator — Simulation Engine
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1.  OCEAN CURRENT DATABASE
     ========================================================== */

  const CURRENTS = [
    {
      id: 'gulf-stream',
      name: 'Gulf Stream',
      basin: 'Atlantic Ocean',
      type: 'warm',
      avgSpeed: '2.5 m/s',
      tempRange: '24–28°C',
      depthInfluence: '1,000 m',
      length: '1,600 km',
      description: 'The Gulf Stream is a powerful western boundary current that transports warm water from the Gulf of Mexico along the eastern coast of the United States before crossing the Atlantic toward Europe. It is a major driver of the North Atlantic climate system.',
      tempEffects: ['Warms the east coast of North America', 'Contributes to mild winters in Western Europe', 'Raises coastal temperatures by 5–10°C'],
      rainEffects: ['Increases rainfall along the Gulf Stream path', 'Supports subtropical storm systems', 'Modulates precipitation in the British Isles'],
      stormEffects: ['Fuels Atlantic hurricane development', 'Warm waters provide energy for tropical storms', 'Influences hurricane intensity and trajectory'],
      bioEffects: ['Supports rich pelagic fisheries', 'Transports larvae from Caribbean to North Atlantic', 'Creates habitat for bluefin tuna and marlin', 'Drives seasonal plankton blooms'],
      affectedRegions: ['Eastern United States', 'Western Europe', 'British Isles', 'Iceland', 'North Atlantic'],
      path: 'M 70 240 Q 120 230 170 215 Q 210 200 250 185 Q 290 170 330 160 Q 370 148 410 140 Q 450 132 490 125 Q 530 118 570 110 Q 610 105 640 100',
      color: '#f97316'
    },
    {
      id: 'north-atlantic-drift',
      name: 'North Atlantic Drift',
      basin: 'Atlantic Ocean',
      type: 'warm',
      avgSpeed: '1.2 m/s',
      tempRange: '12–20°C',
      depthInfluence: '500 m',
      length: '3,000 km',
      description: 'The North Atlantic Drift is the northeastern extension of the Gulf Stream that brings warm, saline water across the North Atlantic toward Europe, significantly moderating the climate of northwestern Europe.',
      tempEffects: ['Warms Western Europe by 5–10°C', 'Prevents Arctic ice formation near Norway', 'Maintains ice-free ports in Scandinavia'],
      rainEffects: ['Increases precipitation in Ireland and UK', 'Supports mild, wet winters in Europe', 'Influences North Atlantic oscillation patterns'],
      stormEffects: ['Drives North Atlantic storm tracks', 'Influences European windstorm intensity', 'Creates cyclogenesis zones near Iceland'],
      bioEffects: ['Supports North Sea fisheries', 'Transports nutrients from the south', 'Drives cod and herring spawning grounds', 'Sustains deep-sea coral habitats'],
      affectedRegions: ['Western Europe', 'United Kingdom', 'Ireland', 'Scandinavia', 'North Sea'],
      path: 'M 490 125 Q 530 115 570 108 Q 610 102 650 98 Q 690 95 720 92',
      color: '#f97316'
    },
    {
      id: 'canary-current',
      name: 'Canary Current',
      basin: 'Atlantic Ocean',
      type: 'cool',
      avgSpeed: '0.8 m/s',
      tempRange: '18–22°C',
      depthInfluence: '300 m',
      length: '2,000 km',
      description: 'The Canary Current is a cool, wind-driven current that flows southward along the northwest coast of Africa, forming part of the North Atlantic Gyre.',
      tempEffects: ['Cools the coast of Northwest Africa', 'Creates coastal upwelling zones', 'Reduces temperatures in the Canary Islands'],
      rainEffects: ['Contributes to aridity in the Sahara', 'Reduces rainfall along the African coast', 'Creates fog zones near the Canary Islands'],
      stormEffects: ['Weakens tropical storm development', 'Inhibits hurricane formation near Africa', 'Moderates Cape Verde-type storms'],
      bioEffects: ['Creates one of the world\'s richest upwelling zones', 'Supports massive sardine and anchovy populations', 'Critical for sea bird populations', 'Sustain tuna and swordfish habitats'],
      affectedRegions: ['Northwest Africa', 'Canary Islands', 'Cape Verde', 'Morocco', 'Western Sahara'],
      path: 'M 380 200 Q 370 230 365 260 Q 360 290 358 320 Q 355 340 350 358',
      color: '#38bdf8'
    },
    {
      id: 'labrador-current',
      name: 'Labrador Current',
      basin: 'Atlantic Ocean',
      type: 'cold',
      avgSpeed: '1.0 m/s',
      tempRange: '0–10°C',
      depthInfluence: '600 m',
      length: '2,500 km',
      description: 'The Labrador Current is a cold, southward-flowing current that carries Arctic waters from the Labrador Sea along the coasts of Labrador and Newfoundland, meeting the warm Gulf Stream near the Grand Banks.',
      tempEffects: ['Cools the coast of Newfoundland and Nova Scotia', 'Creates dense fog banks at the Grand Banks', 'Lowers sea temperatures by 5–10°C'],
      rainEffects: ['Contributes to fog and drizzle along the coast', 'Modulates precipitation in Atlantic Canada', 'Influences spring sea ice extent'],
      stormEffects: ['Influences nor\'easter development', 'Creates temperature gradients that fuel storms', 'Interacts with Gulf Stream to intensify cyclones'],
      bioEffects: ['Transports nutrients from the Arctic', 'Supports rich cod and haddock grounds', 'Carries zooplankton from the north', 'Critical habitat for harp seals and whales'],
      affectedRegions: ['Eastern Canada', 'Labrador', 'Newfoundland', 'Nova Scotia', 'Grand Banks'],
      path: 'M 290 80 Q 280 110 275 140 Q 270 170 268 200 Q 265 220 260 235',
      color: '#2563eb'
    },
    {
      id: 'kuroshio-current',
      name: 'Kuroshio Current',
      basin: 'Pacific Ocean',
      type: 'warm',
      avgSpeed: '3.0 m/s',
      tempRange: '22–30°C',
      depthInfluence: '1,200 m',
      length: '2,500 km',
      description: 'The Kuroshio Current is the Pacific equivalent of the Gulf Stream, flowing northward along the east coast of Japan before turning eastward into the North Pacific. It is one of the strongest western boundary currents in the world.',
      tempEffects: ['Warms the coast of Japan', 'Influences the climate of East Asia', 'Creates the warm "Kuroshio" water mass'],
      rainEffects: ['Brings heavy rainfall to southern Japan', 'Supports the East Asian monsoon', 'Increases precipitation along the Kuroshio path'],
      stormEffects: ['Fuels typhoon development in the Pacific', 'Warm waters energize tropical cyclones', 'Influences typhoon tracks toward Japan'],
      bioEffects: ['Supports diverse marine ecosystems', 'Transports tropical species northward', 'Critical for Japanese fisheries (tuna, skipjack)', 'Sustains coral reefs around Japan'],
      affectedRegions: ['Japan', 'Taiwan', 'East China Sea', 'Philippines', 'Korea'],
      path: 'M 700 200 Q 710 180 715 160 Q 720 140 725 120 Q 730 105 740 90',
      color: '#f97316'
    },
    {
      id: 'california-current',
      name: 'California Current',
      basin: 'Pacific Ocean',
      type: 'cool',
      avgSpeed: '0.6 m/s',
      tempRange: '12–18°C',
      depthInfluence: '400 m',
      length: '2,800 km',
      description: 'The California Current is a cool, southward-flowing eastern boundary current that transports subarctic waters along the western coast of North America, creating one of the most productive marine ecosystems in the world.',
      tempEffects: ['Cools the coast of California and Oregon', 'Creates coastal fog and cool summers', 'Contributes to the Mediterranean climate'],
      rainEffects: ['Reduces summer rainfall along the coast', 'Creates fog-dependent ecosystems', 'Modulates drought patterns in California'],
      stormEffects: ['Weakens approaching Pacific storms', 'Reduces tropical storm formation in the East Pacific', 'Influences atmospheric river dynamics'],
      bioEffects: ['Drives one of the world\'s most productive upwelling zones', 'Supports massive krill and anchovy populations', 'Critical for gray whale migration', 'Sustain sea bird colonies along the coast'],
      affectedRegions: ['California', 'Oregon', 'Washington', 'Baja California', 'Pacific Northwest'],
      path: 'M 120 110 Q 115 140 112 170 Q 110 200 108 230 Q 105 260 100 280',
      color: '#38bdf8'
    },
    {
      id: 'peru-current',
      name: 'Peru Current (Humboldt)',
      basin: 'Pacific Ocean',
      type: 'cool',
      avgSpeed: '0.7 m/s',
      tempRange: '14–20°C',
      depthInfluence: '500 m',
      length: '3,000 km',
      description: 'The Peru Current, also known as the Humboldt Current, is a cold, nutrient-rich eastern boundary current flowing northward along the west coast of South America. It supports the world\'s largest single-species fishery.',
      tempEffects: ['Cools the coast of Peru and Chile', 'Creates the Humboldt upwelling system', 'Reduces coastal temperatures by 6–8°C'],
      rainEffects: ['Creates the Atacama Desert (world\'s driest)', 'Inhibits rainfall along the Peruvian coast', 'Supports fog-based ecosystems (lomas)'],
      stormEffects: ['Suppresses tropical cyclone formation in the SE Pacific', 'Influences El Niño Southern Oscillation', 'Modulates extreme weather in South America'],
      bioEffects: ['Supports the world\'s largest anchovy fishery', 'Creates rich seabird guano deposits', 'Critical habitat for penguins and seals', 'Drives the most productive marine ecosystem on Earth'],
      affectedRegions: ['Peru', 'Chile', 'Ecuador', 'Galapagos Islands', 'South America'],
      path: 'M 175 300 Q 170 280 168 260 Q 165 240 163 220 Q 160 200 158 185',
      color: '#38bdf8'
    },
    {
      id: 'north-pacific-drift',
      name: 'North Pacific Drift',
      basin: 'Pacific Ocean',
      type: 'warm',
      avgSpeed: '0.9 m/s',
      tempRange: '14–20°C',
      depthInfluence: '400 m',
      length: '4,000 km',
      description: 'The North Pacific Drift is a warm eastward-flowing extension of the Kuroshio Current that transports warm water across the North Pacific toward the coast of North America.',
      tempEffects: ['Moderates the climate of the Pacific Northwest', 'Warms the Gulf of Alaska', 'Influences sea surface temperature patterns'],
      rainEffects: ['Carries moisture to the Pacific Northwest', 'Supports rainforest ecosystems in Alaska', 'Influences precipitation along the BC coast'],
      stormEffects: ['Drives Aleutian low pressure systems', 'Influences Pacific storm tracks toward North America', 'Creates atmospheric river events'],
      bioEffects: ['Transports nutrients across the Pacific', 'Sustains salmon migration routes', 'Supports open-ocean marine life', 'Drives plankton blooms in the subarctic Pacific'],
      affectedRegions: ['Alaska', 'British Columbia', 'Pacific Northwest', 'Aleutian Islands'],
      path: 'M 730 90 Q 760 95 790 100 Q 810 105 830 108',
      color: '#f97316'
    },
    {
      id: 'agulhas-current',
      name: 'Agulhas Current',
      basin: 'Indian Ocean',
      type: 'warm',
      avgSpeed: '3.5 m/s',
      tempRange: '22–28°C',
      depthInfluence: '1,500 m',
      length: '1,000 km',
      description: 'The Agulhas Current is the largest western boundary current in the Southern Hemisphere, flowing southward along the east coast of South Africa. It is one of the fastest ocean currents in the world.',
      tempEffects: ['Warms the coast of southeastern Africa', 'Influences the climate of Madagascar', 'Creates the Agulhas Retroflection near the Cape'],
      rainEffects: ['Increases rainfall in Mozambique and KwaZulu-Natal', 'Supports tropical cyclone rainfall', 'Influences South African precipitation patterns'],
      stormEffects: ['Fuels tropical cyclones in the SW Indian Ocean', 'Creates hazardous "rogue wave" conditions', 'Influences storm tracks around South Africa'],
      bioEffects: ['Supports rich marine biodiversity', 'Creates migration routes for whale sharks', 'Critical for sardine run migration', 'Hosts diverse reef ecosystems'],
      affectedRegions: ['South Africa', 'Mozambique', 'Madagascar', 'Indian Ocean basin'],
      path: 'M 570 310 Q 585 300 595 285 Q 605 270 610 255 Q 615 240 620 225',
      color: '#f97316'
    },
    {
      id: 'west-australian-current',
      name: 'West Australian Current',
      basin: 'Indian Ocean',
      type: 'cool',
      avgSpeed: '0.5 m/s',
      tempRange: '16–22°C',
      depthInfluence: '300 m',
      length: '2,200 km',
      description: 'The West Australian Current is a cool northward-flowing eastern boundary current that brings Antarctic waters along the western coast of Australia, forming part of the South Indian Ocean Gyre.',
      tempEffects: ['Cools the west coast of Australia', 'Creates the Leeuwin Current interaction', 'Moderates temperatures in Perth and SW Australia'],
      rainEffects: ['Contributes to aridity in Western Australia', 'Reduces coastal rainfall', 'Creates fog along the Ningaloo coast'],
      stormEffects: ['Weakens tropical cyclone development', 'Moderates storm intensity approaching Australia', 'Influences Indian Ocean Dipole dynamics'],
      bioEffects: ['Supports the Ningaloo Reef ecosystem', 'Transports nutrients from the Southern Ocean', 'Critical for whale shark aggregation', 'Drives plankton productivity'],
      affectedRegions: ['Western Australia', 'Perth', 'Ningaloo Coast', 'Shark Bay'],
      path: 'M 620 320 Q 610 300 605 280 Q 600 260 595 240',
      color: '#38bdf8'
    },
    {
      id: 'monsoon-current',
      name: 'Monsoon Current',
      basin: 'Indian Ocean',
      type: 'warm',
      avgSpeed: '1.0 m/s',
      tempRange: '26–30°C',
      depthInfluence: '200 m',
      length: '1,800 km',
      description: 'The Monsoon Current is a seasonally reversing current system in the northern Indian Ocean, driven by the Asian monsoon winds. It reverses direction between summer and winter.',      tempEffects: ['Warms the Bay of Bengal and Arabian Sea', 'Drives seasonal upwelling in the Arabian Sea', 'Influences sea surface temperature for monsoons'],
      rainEffects: ['Directly drives the South Asian monsoon', 'Carries moisture from ocean to the Indian subcontinent', 'Influences rainfall patterns across SE Asia'],
      stormEffects: ['Fuels Bay of Bengal cyclones', 'Creates conditions for tropical cyclone development', 'Influences monsoon depression tracks'],
      bioEffects: ['Creates seasonal upwelling and productivity', 'Supports sardine and mackerel fisheries', 'Drives phytoplankton blooms', 'Critical for sea turtle nesting migration'],
      affectedRegions: ['India', 'Sri Lanka', 'Bangladesh', 'Myanmar', 'Arabian Peninsula'],
      path: 'M 540 175 Q 560 185 580 195 Q 600 205 615 210 Q 630 215 640 218',
      color: '#f97316'
    },
    {
      id: 'antarctic-circumpolar',
      name: 'Antarctic Circumpolar Current',
      basin: 'Polar',
      type: 'cold',
      avgSpeed: '1.5 m/s',
      tempRange: '-2–4°C',
      depthInfluence: '2,000 m',
      length: '20,000 km',
      description: 'The Antarctic Circumpolar Current (ACC) is the most powerful ocean current on Earth, flowing eastward around Antarctica and connecting the Atlantic, Pacific, and Indian Oceans. It is the primary driver of global ocean circulation.',
      tempEffects: ['Isolates Antarctica from warm waters', 'Drives Antarctic cooling', 'Creates the Polar Front (Antarctic Convergence)'],
      rainEffects: ['Influences Southern Ocean precipitation', 'Modulates Antarctic sea ice formation', 'Drives westerly wind belts'],
      stormEffects: ['Generates the "Roaring Forties" and "Furious Fifties"', 'Creates the most intense storm track on Earth', 'Drives the Southern Ocean wave climate'],
      bioEffects: ['Connects marine ecosystems globally', 'Distributes krill around Antarctica', 'Supports whale migration routes', 'Creates the most productive ocean region for phytoplankton'],
      affectedRegions: ['Antarctica', 'Southern Ocean', 'South America', 'Australia', 'New Zealand'],
      path: 'M 50 345 Q 130 340 220 338 Q 330 335 440 338 Q 550 340 650 342 Q 730 345 780 348',
      color: '#2563eb'
    },
    {
      id: 'arctic-currents',
      name: 'Arctic Surface Currents',
      basin: 'Polar',
      type: 'cold',
      avgSpeed: '0.4 m/s',
      tempRange: '-2–2°C',
      depthInfluence: '200 m',
      length: '3,500 km',
      description: 'The Arctic surface current system is driven by the Transpolar Drift and Beaufort Gyre, moving sea ice and cold surface waters across the Arctic Ocean toward the North Atlantic.',
      tempEffects: ['Cools the Arctic Basin', 'Drives sea ice export through Fram Strait', 'Influences North Atlantic deep water formation'],
      rainEffects: ['Modulates Arctic precipitation patterns', 'Carries freshwater from Siberian rivers', 'Influences sea ice melt and formation'],
      stormEffects: ['Influences Arctic cyclone tracks', 'Drives polar vortex dynamics', 'Modulates Arctic amplification patterns'],
      bioEffects: ['Transports nutrients across the Arctic', 'Supports polar bear and seal habitats', 'Drives Arctic plankton blooms', 'Critical for Arctic food web structure'],
      affectedRegions: ['Arctic Ocean', 'Greenland', 'Siberia', 'Canada', 'Scandinavia'],
      path: 'M 280 30 Q 340 25 400 22 Q 460 20 520 25 Q 570 30 610 35',
      color: '#2563eb'
    }
  ];

  /* ==========================================================
     2.  SUPPORTING DATA
     ========================================================== */

  const BASIN_GROUPS = {
    'Atlantic Ocean': 'ATLANTIC',
    'Pacific Ocean': 'PACIFIC',
    'Indian Ocean': 'INDIAN',
    'Polar': 'POLAR'
  };

  const OCEAN_FACTS = [
    { fact: 'The ocean covers 71% of Earth\'s surface and contains 97% of its water.', source: 'NOAA' },
    { fact: 'The average ocean depth is 3,682 meters. The deepest point is the Mariana Trench at 11,034 meters.', source: 'NOAA' },
    { fact: 'The Antarctic Circumpolar Current is the largest ocean current, transporting 150 million cubic meters of water per second.', source: 'NASA' },
    { fact: 'The Gulf Stream moves more water than all rivers on Earth combined.', source: 'NOAA' },
    { fact: 'Ocean currents affect weather by transporting heat from the equator toward the poles.', source: 'NASA Earth Observatory' },
    { fact: 'It would take a water molecule approximately 1,000 years to complete a full circuit of the global ocean conveyor belt.', source: 'WHOI' },
    { fact: 'The ocean absorbs about 30% of the CO2 produced by humans, causing ocean acidification.', source: 'IPCC' },
    { fact: 'Phytoplankton in the ocean produce 50–80% of the world\'s oxygen.', source: 'NASA' },
    { fact: 'El Niño is a climate pattern caused by weakening of the Peru Current and warming of the central Pacific.', source: 'NOAA' },
    { fact: 'Kuroshio means "Black Stream" in Japanese, named for the dark blue color of its warm water.', source: 'JAMSTEC' }
  ];

  const QUIZ_QUESTIONS = [
    { q: 'Which is the largest and most powerful ocean current on Earth?', options: ['Gulf Stream', 'Kuroshio Current', 'Antarctic Circumpolar Current', 'Peru Current'], answer: 2 },
    { q: 'What drives the Gulf Stream?', options: ['Wind', 'Coriolis effect', 'Temperature differences', 'Tides'], answer: 2 },
    { q: 'The Peru Current is also known as:', options: ['El Niño', 'Humboldt Current', 'Pacific Drift', 'Agulhas Current'], answer: 1 },
    { q: 'Which current has the fastest measured speed?', options: ['Gulf Stream', 'Kuroshio Current', 'Agulhas Current', 'Antarctic Circumpolar'], answer: 2 },
    { q: 'What type of current is the California Current?', options: ['Warm', 'Cool (upwelling)', 'Cold', 'Hot'], answer: 1 },
    { q: 'The Canary Current is part of which gyre?', options: ['North Pacific Gyre', 'South Atlantic Gyre', 'North Atlantic Gyre', 'Indian Ocean Gyre'], answer: 2 },
    { q: 'Which current transports warm water to Western Europe?', options: ['Labrador Current', 'North Atlantic Drift', 'Canary Current', 'Gulf Stream only'], answer: 1 },
    { q: 'What influences the Monsoon Current in the Indian Ocean?', options: ['Trade winds', 'Monsoon winds', 'Coriolis force', 'Tides'], answer: 1 },
    { q: 'Which current is associated with the world\'s most productive fishery?', options: ['Gulf Stream', 'Kuroshio Current', 'Peru Current', 'Labrador Current'], answer: 2 },
    { q: 'The "Roaring Forties" is associated with which current?', options: ['Agulhas Current', 'Antarctic Circumpolar Current', 'West Australian Current', 'Peru Current'], answer: 1 },
    { q: 'How deep does the Agulhas Current influence the ocean?', options: ['200 m', '500 m', '1,500 m', '3,000 m'], answer: 2 },
    { q: 'Which current creates the fog banks at the Grand Banks of Newfoundland?', options: ['Gulf Stream', 'Labrador Current', 'North Atlantic Drift', 'Canary Current'], answer: 1 },
    { q: 'El Niño is characterized by the weakening of which current?', options: ['California Current', 'Peru Current', 'Kuroshio Current', 'West Australian Current'], answer: 1 },
    { q: 'The Kuroshio Current flows along which country\'s coast?', options: ['China', 'Japan', 'Korea', 'Taiwan only'], answer: 1 },
    { q: 'What is the temperature range of the Labrador Current?', options: ['10–15°C', '5–10°C', '0–10°C', '-2–5°C'], answer: 2 }
  ];

  /* ==========================================================
     3.  STATE MANAGEMENT
     ========================================================== */

  const STORAGE_KEY = 'oceanCurrentsSimulator';

  let state = {
    selectedCurrent: null,
    speedPct: 50,
    temperature: 15,
    flowIntensity: 50,
    animSpeed: 5,
    effects: { temp: true, rain: true, storm: true, bio: true },
    heatmapVisible: false,
    history: [],
    mapZoom: 1
  };

  function loadState () {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) state = { ...state, ...JSON.parse(saved) };
    } catch (e) { /* */ }
  }

  function saveState () {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* */ }
  }

  function getCurrent (id) { return CURRENTS.find(c => c.id === id); }

  /* ==========================================================
     4.  DOM REFERENCES
     ========================================================== */

  const $ = id => document.getElementById(id);

  const dom = {
    searchInput: $('searchInput'),
    listAtlantic: $('listAtlantic'),
    listPacific: $('listPacific'),
    listIndian: $('listIndian'),
    listPolar: $('listPolar'),

    speedSlider: $('speedSlider'),
    tempSlider: $('tempSlider'),
    flowSlider: $('flowSlider'),
    animSlider: $('animSlider'),
    speedValue: $('speedValue'),
    tempValue: $('tempValue'),
    flowValue: $('flowValue'),
    animValue: $('animValue'),

    toggleTemp: $('toggleTemp'),
    toggleRain: $('toggleRain'),
    toggleStorm: $('toggleStorm'),
    toggleBio: $('toggleBio'),

    statusName: $('statusName'),
    statusSpeed: $('statusSpeed'),
    statusTemp: $('statusTemp'),
    statusClimate: $('statusClimate'),
    activityFeed: $('activityFeed'),

    worldMap: $('worldMap'),
    currentsGroup: $('currentsGroup'),
    particlesGroup: $('particlesGroup'),
    arrowsGroup: $('arrowsGroup'),
    resetViewBtn: $('resetViewBtn'),
    zoomInBtn: $('zoomInBtn'),
    zoomOutBtn: $('zoomOutBtn'),
    exportBtn: $('exportBtn'),

    activeCurrent: $('activeCurrent'),
    activeBasin: $('activeBasin'),
    activeTemp: $('activeTemp'),
    activeVelocity: $('activeVelocity'),

    infoCardOverlay: $('infoCardOverlay'),
    infoCard: $('infoCard'),
    infoCardClose: $('infoCardClose'),
    infoCardTitle: $('infoCardTitle'),
    infoCardType: $('infoCardType'),
    infoCardOcean: $('infoCardOcean'),
    infoCardDesc: $('infoCardDesc'),
    infoTempEffects: $('infoTempEffects'),
    infoRainEffects: $('infoRainEffects'),
    infoStormEffects: $('infoStormEffects'),
    infoBioEffects: $('infoBioEffects'),
    infoLength: $('infoLength'),
    infoAvgSpeed: $('infoAvgSpeed'),
    infoTempRange: $('infoTempRange'),
    infoDepth: $('infoDepth'),

    quizModal: $('quizModal'),
    quizModalClose: $('quizModalClose'),
    quizModalBody: $('quizModalBody'),
    compareModal: $('compareModal'),
    compareModalClose: $('compareModalClose'),
    compareModalBody: $('compareModalBody'),
    historyModal: $('historyModal'),
    historyModalClose: $('historyModalClose'),
    historyModalBody: $('historyModalBody'),

    toastContainer: $('toastContainer'),
    quizBtn: $('quizBtn'),
    compareBasinBtn: $('compareBasinBtn'),
    heatmapBtn: $('heatmapBtn'),
    randomFactBtn: $('randomFactBtn'),

    app: $('app')
  };

  /* ==========================================================
     5.  MAP RENDERING
     ========================================================== */

  function getTypeColor (type) {
    const colors = { warm: '#f97316', cool: '#38bdf8', hot: '#ef4444', cold: '#2563eb' };
    return colors[type] || '#7dd3fc';
  }

  function createPathElement (current, isActive) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', current.path);
    path.setAttribute('class', `current-path${isActive ? ' current-path--active' : ' current-path--inactive'}`);
    path.setAttribute('stroke', current.color);
    path.setAttribute('data-current-id', current.id);
    path.style.strokeDasharray = '8 4';
    return path;
  }

  function getPointOnPath (pathElem, t) {
    const len = pathElem.getTotalLength();
    return pathElem.getPointAtLength(t * len);
  }

  function generateArrows (current, isActive) {
    if (!isActive) return [];
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', current.path);
    const len = path.getTotalLength();
    const arrows = [];
    const count = Math.max(3, Math.floor(5 * (state.flowIntensity / 50)));

    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const pt = path.getPointAtLength(t * len);
      const dt = 0.001;
      const pt2 = path.getPointAtLength(Math.min((t + dt) * len, len));
      const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'flow-arrow-group');
      g.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0'); line.setAttribute('y1', '0');
      line.setAttribute('x2', '10'); line.setAttribute('y2', '0');
      line.setAttribute('class', 'flow-arrow');
      line.setAttribute('stroke', current.color);

      const head = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      head.setAttribute('points', '10,0 4,-4 4,4');
      head.setAttribute('class', 'flow-arrow-head');
      head.setAttribute('fill', current.color);
      head.setAttribute('stroke', current.color);
      head.setAttribute('opacity', '0.7');

      g.appendChild(line);
      g.appendChild(head);
      arrows.push(g);
    }
    return arrows;
  }

  function generateParticles (current, isActive) {
    if (!isActive) return [];
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', current.path);
    const len = path.getTotalLength();
    const particles = [];
    const density = Math.floor(40 * (state.flowIntensity / 50));

    for (let i = 0; i < density; i++) {
      const t = i / density;
      const pt = path.getPointAtLength((t * len) % len);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x.toString());
      circle.setAttribute('cy', pt.y.toString());
      circle.setAttribute('r', (1.5 + Math.random() * 1.5).toString());
      circle.setAttribute('class', 'flow-particle');
      circle.setAttribute('fill', current.color);
      circle.setAttribute('opacity', (0.2 + Math.random() * 0.4).toString());
      circle.dataset.t = Math.random().toString();
      circle.dataset.speed = (0.2 + Math.random() * 0.8).toString();
      particles.push(circle);
    }
    return particles;
  }

  function renderCurrents () {
    dom.currentsGroup.innerHTML = '';
    dom.arrowsGroup.innerHTML = '';
    dom.particlesGroup.innerHTML = '';

    CURRENTS.forEach(c => {
      const isActive = state.selectedCurrent === c.id;
      const pathEl = createPathElement(c, isActive);
      dom.currentsGroup.appendChild(pathEl);

      generateArrows(c, isActive).forEach(a => dom.arrowsGroup.appendChild(a));
      generateParticles(c, isActive).forEach(p => dom.particlesGroup.appendChild(p));
    });

    particleAnimFrame = null;
    if (state.selectedCurrent) startParticleAnimation();
  }

  /* ==========================================================
     6.  PARTICLE ANIMATION
     ========================================================== */

  let particleAnimFrame = null;
  let particleTime = 0;

  function startParticleAnimation () {
    const current = getCurrent(state.selectedCurrent);
    if (!current) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', current.path);
    const len = path.getTotalLength();
    const speedFactor = state.animSpeed / 5 * (state.speedPct / 50);
    const particles = dom.particlesGroup.querySelectorAll('.flow-particle');
    const arrows = dom.arrowsGroup.querySelectorAll('.flow-arrow-group');

    function animate () {
      particleTime += 0.02 * speedFactor;
      const offset = particleTime % 1;

      particles.forEach(p => {
        const t = ((parseFloat(p.dataset.t) || 0) + offset * (parseFloat(p.dataset.speed) || 0.5)) % 1;
        try {
          const pt = path.getPointAtLength(t * len);
          p.setAttribute('cx', pt.x.toString());
          p.setAttribute('cy', pt.y.toString());
        } catch (e) { /* */ }
      });

      arrows.forEach((a, i) => {
        const count = arrows.length;
        const t = ((i / count) + offset) % 1;
        try {
          const pt = path.getPointAtLength(t * len);
          const dt2 = 0.002;
          const pt2 = path.getPointAtLength(Math.min((t + dt2) * len, len));
          const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
          a.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);
        } catch (e) { /* */ }
      });

      particleAnimFrame = requestAnimationFrame(animate);
    }

    if (particleAnimFrame) cancelAnimationFrame(particleAnimFrame);
    animate();
  }

  /* ==========================================================
     7.  CURRENT SELECTION
     ========================================================== */

  function selectCurrent (id) {
    const current = getCurrent(id);
    if (!current) return;

    state.selectedCurrent = id;

    state.history.unshift({
      id: current.id,
      name: current.name,
      basin: current.basin,
      timestamp: new Date().toISOString()
    });

    updateMapHeader(current);
    updateStatus(current);
    renderCurrents();
    addActivityItem(current);
    renderCurrentButtons();
    saveState();
  }

  function updateMapHeader (current) {
    dom.activeCurrent.textContent = current.name;
    dom.activeBasin.textContent = current.basin;
    dom.activeTemp.textContent = current.tempRange;
    dom.activeVelocity.textContent = current.avgSpeed;
  }

  function updateStatus (current) {
    dom.statusName.textContent = current.name;
    dom.statusSpeed.textContent = state.speedPct + '%';
    dom.statusTemp.textContent = state.temperature.toFixed(1) + '°C';
    const influence = computeClimateInfluence(current);
    dom.statusClimate.textContent = influence.toFixed(0) + '%';
  }

  function computeClimateInfluence (current) {
    const base = 50;
    const tempFactor = state.effects.temp ? (current.type === 'warm' ? 25 : current.type === 'cold' ? -15 : 10) : 0;
    const rainFactor = state.effects.rain ? 15 : 0;
    const stormFactor = state.effects.storm ? 10 : 0;
    const bioFactor = state.effects.bio ? 10 : 0;
    const speedMod = (state.speedPct - 50) * 0.2;
    const flowMod = (state.flowIntensity - 50) * 0.15;
    return Math.max(0, Math.min(100, base + tempFactor + rainFactor + stormFactor + bioFactor + speedMod + flowMod));
  }

  function addActivityItem (current) {
    const now = new Date();
    const ts = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const typeColor = getTypeColor(current.type);
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="activity-dot" style="background:${typeColor}"></span>
      <span>${current.name} activated</span>
      <span class="activity-time">${ts}</span>
    `;
    const empty = dom.activityFeed.querySelector('.activity-empty');
    if (empty) empty.remove();
    dom.activityFeed.insertBefore(item, dom.activityFeed.firstChild);
    while (dom.activityFeed.children.length > 20) dom.activityFeed.removeChild(dom.activityFeed.lastChild);
  }

  /* ==========================================================
     8.  CURRENT BUTTONS
     ========================================================== */

  function renderCurrentButtons () {
    const lists = {
      'Atlantic Ocean': dom.listAtlantic,
      'Pacific Ocean': dom.listPacific,
      'Indian Ocean': dom.listIndian,
      'Polar': dom.listPolar
    };

    Object.keys(lists).forEach(basin => {
      lists[basin].innerHTML = '';
      CURRENTS.filter(c => c.basin === basin).forEach(c => {
        const btn = document.createElement('button');
        btn.className = `current-btn current-btn--${c.type}${state.selectedCurrent === c.id ? ' current-btn--active' : ''}`;
        btn.textContent = c.name;
        btn.setAttribute('data-current-id', c.id);
        btn.setAttribute('aria-pressed', state.selectedCurrent === c.id ? 'true' : 'false');
        btn.addEventListener('click', () => selectCurrent(c.id));
        btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCurrent(c.id); } });
        lists[basin].appendChild(btn);
      });
    });
  }

  /* ==========================================================
     9.  SIMULATION CONTROLS
     ========================================================== */

  function initControls () {
    dom.speedSlider.addEventListener('input', () => {
      state.speedPct = parseInt(dom.speedSlider.value);
      dom.speedValue.textContent = state.speedPct + '%';
      if (state.selectedCurrent) updateStatus(getCurrent(state.selectedCurrent));
      saveState();
    });

    dom.tempSlider.addEventListener('input', () => {
      state.temperature = parseFloat(dom.tempSlider.value);
      dom.tempValue.textContent = state.temperature.toFixed(1) + '°C';
      if (state.selectedCurrent) updateStatus(getCurrent(state.selectedCurrent));
      saveState();
    });

    dom.flowSlider.addEventListener('input', () => {
      state.flowIntensity = parseInt(dom.flowSlider.value);
      dom.flowValue.textContent = state.flowIntensity + '%';
      if (state.selectedCurrent) { renderCurrents(); saveState(); }
    });

    dom.animSlider.addEventListener('input', () => {
      state.animSpeed = parseInt(dom.animSlider.value);
      dom.animValue.textContent = state.animSpeed + 'x';
      if (state.selectedCurrent) { startParticleAnimation(); saveState(); }
    });

    dom.toggleTemp.addEventListener('change', () => { state.effects.temp = dom.toggleTemp.checked; updateStatusFromEffects(); saveState(); });
    dom.toggleRain.addEventListener('change', () => { state.effects.rain = dom.toggleRain.checked; updateStatusFromEffects(); saveState(); });
    dom.toggleStorm.addEventListener('change', () => { state.effects.storm = dom.toggleStorm.checked; updateStatusFromEffects(); saveState(); });
    dom.toggleBio.addEventListener('change', () => { state.effects.bio = dom.toggleBio.checked; updateStatusFromEffects(); saveState(); });
  }

  function updateStatusFromEffects () {
    if (state.selectedCurrent) updateStatus(getCurrent(state.selectedCurrent));
  }

  /* ==========================================================
     10. SEARCH & FILTER
     ========================================================== */

  function initSearch () {
    dom.searchInput.addEventListener('input', () => {
      const q = dom.searchInput.value.toLowerCase().trim();
      document.querySelectorAll('.current-btn').forEach(btn => {
        const name = btn.textContent.toLowerCase();
        const id = btn.dataset.currentId;
        const current = getCurrent(id);
        const match = !q || name.includes(q) || current.basin.toLowerCase().includes(q) || current.type.includes(q);
        btn.style.display = match ? '' : 'none';
      });
    });
  }

  /* ==========================================================
     11. INFO CARD (CLIMATE INTELLIGENCE)
     ========================================================== */

  function showInfoCard (current) {
    dom.infoCardTitle.textContent = current.name;
    dom.infoCardType.textContent = `${current.type.charAt(0).toUpperCase() + current.type.slice(1)} Current · ${current.avgSpeed}`;
    dom.infoCardOcean.textContent = current.basin;
    dom.infoCardDesc.textContent = current.description;

    dom.infoTempEffects.innerHTML = current.tempEffects.map(e => `<li>${e}</li>`).join('');
    dom.infoRainEffects.innerHTML = current.rainEffects.map(e => `<li>${e}</li>`).join('');
    dom.infoStormEffects.innerHTML = current.stormEffects.map(e => `<li>${e}</li>`).join('');
    dom.infoBioEffects.innerHTML = current.bioEffects.map(e => `<li>${e}</li>`).join('');

    dom.infoLength.textContent = current.length;
    dom.infoAvgSpeed.textContent = current.avgSpeed;
    dom.infoTempRange.textContent = current.tempRange;
    dom.infoDepth.textContent = current.depthInfluence;

    dom.infoCardOverlay.removeAttribute('hidden');
    dom.infoCardOverlay.removeAttribute('aria-hidden');
    dom.infoCardOverlay.addEventListener('click', e => { if (e.target === dom.infoCardOverlay) hideInfoCard(); });
    document.addEventListener('keydown', handleInfoEsc);
    dom.infoCard.scrollTop = 0;
  }

  function hideInfoCard () {
    dom.infoCardOverlay.setAttribute('hidden', '');
    dom.infoCardOverlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', handleInfoEsc);
  }

  function handleInfoEsc (e) { if (e.key === 'Escape') hideInfoCard(); }

  /* ==========================================================
     12. QUIZ
     ========================================================== */

  let quizState = { current: 0, score: 0, answered: false, questions: [] };

  function startQuiz () {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    quizState = { current: 0, score: 0, answered: false, questions: shuffled };
    renderQuizQuestion();
    dom.quizModal.removeAttribute('hidden');
    dom.quizModal.removeAttribute('aria-hidden');
  }

  function renderQuizQuestion () {
    if (quizState.current >= quizState.questions.length) {
      dom.quizModalBody.innerHTML = `
        <div style="text-align:center;padding:20px">
          <div class="quiz-score">Score: ${quizState.score}/${quizState.questions.length}</div>
          <p style="color:var(--text-body);margin:12px 0;font-size:0.78rem">
            ${quizState.score >= 8 ? 'Excellent oceanography knowledge!' : quizState.score >= 5 ? 'Good work, keep exploring!' : 'Dive deeper to learn more about ocean currents!'}
          </p>
          <button class="quiz-btn" id="quizRestart">Play Again</button>
        </div>
      `;
      const r = dom.quizModalBody.querySelector('#quizRestart');
      if (r) r.addEventListener('click', startQuiz);
      return;
    }

    const q = quizState.questions[quizState.current];
    const letters = ['A', 'B', 'C', 'D'];
    dom.quizModalBody.innerHTML = `
      <div class="quiz-question">
        <span style="font-size:0.66rem;color:var(--text-muted);display:block;margin-bottom:6px">Question ${quizState.current + 1} of ${quizState.questions.length}</span>
        ${q.q}
      </div>
      <div class="quiz-options">
        ${q.options.map((o, i) => `<button class="quiz-option" data-idx="${i}" ${quizState.answered ? 'disabled' : ''}>${letters[i]}. ${o}</button>`).join('')}
      </div>
      ${quizState.answered ? `<div style="text-align:center;margin-top:12px"><button class="quiz-btn" id="quizNext">${quizState.current < quizState.questions.length - 1 ? 'Next Question' : 'See Results'}</button></div>` : ''}
    `;

    if (!quizState.answered) {
      dom.quizModalBody.querySelectorAll('.quiz-option').forEach(b => b.addEventListener('click', () => handleQuizAnswer(b)));
    } else {
      const n = dom.quizModalBody.querySelector('#quizNext');
      if (n) n.addEventListener('click', () => { quizState.current++; quizState.answered = false; renderQuizQuestion(); });
    }
  }

  function handleQuizAnswer (btn) {
    if (quizState.answered) return;
    quizState.answered = true;
    const idx = parseInt(btn.dataset.idx);
    const q = quizState.questions[quizState.current];
    if (idx === q.answer) quizState.score++;

    dom.quizModalBody.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = true;
      if (parseInt(b.dataset.idx) === q.answer) b.classList.add('quiz-option--correct');
      else if (b === btn && parseInt(b.dataset.idx) !== q.answer) b.classList.add('quiz-option--wrong');
    });
    renderQuizQuestion();
  }

  /* ==========================================================
     13. BASIN COMPARISON
     ========================================================== */

  function showBasinComparison () {
    const basins = {};
    CURRENTS.forEach(c => {
      if (!basins[c.basin]) basins[c.basin] = [];
      basins[c.basin].push(c);
    });

    let html = '';
    Object.keys(basins).forEach(basin => {
      const currents = basins[basin];
      html += `<div class="cmp-title">${basin}</div><div class="cmp-grid">`;
      const cols = currents.map(c => {
        const typeSymbol = c.type === 'warm' ? '🔥' : c.type === 'hot' ? '🔥' : c.type === 'cool' ? '💧' : '🧊';
        return `<div class="cmp-col">
          <h3>${typeSymbol} ${c.name}</h3>
          <div class="cmp-row"><span class="cmp-label">Type</span><span class="cmp-value">${c.type.toUpperCase()}</span></div>
          <div class="cmp-row"><span class="cmp-label">Speed</span><span class="cmp-value">${c.avgSpeed}</span></div>
          <div class="cmp-row"><span class="cmp-label">Temp Range</span><span class="cmp-value">${c.tempRange}</span></div>
          <div class="cmp-row"><span class="cmp-label">Depth</span><span class="cmp-value">${c.depthInfluence}</span></div>
          <div class="cmp-row"><span class="cmp-label">Length</span><span class="cmp-value">${c.length}</span></div>
        </div>`;
      }).join('');
      html += cols + '</div>';
    });

    dom.compareModalBody.innerHTML = html;
    dom.compareModal.removeAttribute('hidden');
    dom.compareModal.removeAttribute('aria-hidden');
  }

  /* ==========================================================
     14. HEATMAP / HISTORY / FACT / EXPORT
     ========================================================== */

  function toggleHeatmap () {
    state.heatmapVisible = !state.heatmapVisible;
    dom.heatmapBtn.classList.toggle('map-control-btn--active', state.heatmapVisible);
    if (state.heatmapVisible) {
      // Generate heatmap overlay as colored circles along active current
      const current = getCurrent(state.selectedCurrent);
      if (current) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', current.path);
        const len = path.getTotalLength();
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
          const pt = path.getPointAtLength(t * len);
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', pt.x.toString());
          circle.setAttribute('cy', pt.y.toString());
          circle.setAttribute('r', (8 + (state.speedPct / 100) * 15).toString());
          circle.setAttribute('fill', state.speedPct > 70 ? '#ef4444' : state.speedPct > 40 ? '#f97316' : '#38bdf8');
          circle.setAttribute('opacity', '0.15');
          circle.setAttribute('class', 'heat-dot');
          dom.currentsGroup.appendChild(circle);
        }
      }
    } else {
      dom.currentsGroup.querySelectorAll('.heat-dot').forEach(d => d.remove());
    }
    saveState();
  }

  function showHistory () {
    const title = dom.historyModal.querySelector('#historyModalTitle') || dom.historyModal.querySelector('h2');
    if (title) title.textContent = 'Simulation History';
    if (state.history.length === 0) {
      dom.historyModalBody.innerHTML = '<p class="history-empty">No currents activated yet. Select a current to begin.</p>';
    } else {
      let html = '<div class="history-timeline">';
      state.history.slice(0, 30).forEach(entry => {
        const c = getCurrent(entry.id);
        const t = new Date(entry.timestamp);
        const ts = t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        html += `<div class="history-item">
          <span class="history-dot" style="background:${c ? getTypeColor(c.type) : '#64748b'}"></span>
          <div class="history-content">
            <div class="history-name">${entry.name}</div>
            <div class="history-meta">${entry.basin}</div>
            <div class="history-time">${ts}</div>
          </div>
        </div>`;
      });
      html += '</div>';
      dom.historyModalBody.innerHTML = html;
    }
    dom.historyModal.removeAttribute('hidden');
    dom.historyModal.removeAttribute('aria-hidden');
  }

  function showToast (msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function exportData () {
    const data = {
      exportDate: new Date().toISOString(),
      selectedCurrent: state.selectedCurrent ? getCurrent(state.selectedCurrent)?.name : null,
      parameters: {
        speedPct: state.speedPct,
        temperature: state.temperature,
        flowIntensity: state.flowIntensity,
        animSpeed: state.animSpeed,
        effects: state.effects
      },
      history: state.history.slice(0, 50)
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocean-simulation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📊 Simulation data exported as JSON');
  }

  /* ==========================================================
     15. ZOOM & RESET
     ========================================================== */

  function zoomIn () {
    state.mapZoom = Math.min(state.mapZoom + 0.15, 2);
    applyZoom();
  }
  function zoomOut () {
    state.mapZoom = Math.max(state.mapZoom - 0.15, 0.5);
    applyZoom();
  }
  function resetView () {
    state.mapZoom = 1;
    applyZoom();
  }
  function applyZoom () {
    dom.worldMap.style.transform = `scale(${state.mapZoom})`;
    dom.worldMap.style.transformOrigin = 'center center';
    saveState();
  }

  /* ==========================================================
     16. INITIALIZATION
     ========================================================== */

  function init () {
    loadState();

    renderCurrentButtons();
    renderCurrents();

    if (state.selectedCurrent) {
      const current = getCurrent(state.selectedCurrent);
      if (current) {
        selectCurrent(current.id);
        updateMapHeader(current);
        updateStatus(current);
      }
    }

    // Slider values
    dom.speedSlider.value = state.speedPct;
    dom.speedValue.textContent = state.speedPct + '%';
    dom.tempSlider.value = state.temperature;
    dom.tempValue.textContent = state.temperature.toFixed(1) + '°C';
    dom.flowSlider.value = state.flowIntensity;
    dom.flowValue.textContent = state.flowIntensity + '%';
    dom.animSlider.value = state.animSpeed;
    dom.animValue.textContent = state.animSpeed + 'x';

    // Toggles
    dom.toggleTemp.checked = state.effects.temp;
    dom.toggleRain.checked = state.effects.rain;
    dom.toggleStorm.checked = state.effects.storm;
    dom.toggleBio.checked = state.effects.bio;

    // Zoom
    applyZoom();

    // Restore history
    if (state.history.length > 0) {
      state.history.slice(0, 20).forEach(entry => {
        const c = getCurrent(entry.id);
        if (c) addActivityItem(c);
      });
    }

    initControls();
    initSearch();

    dom.infoCardClose.addEventListener('click', hideInfoCard);

    dom.resetViewBtn.addEventListener('click', resetView);
    dom.zoomInBtn.addEventListener('click', zoomIn);
    dom.zoomOutBtn.addEventListener('click', zoomOut);
    dom.exportBtn.addEventListener('click', exportData);

    dom.quizBtn.addEventListener('click', startQuiz);
    dom.compareBasinBtn.addEventListener('click', showBasinComparison);
    dom.heatmapBtn.addEventListener('click', toggleHeatmap);
    dom.randomFactBtn.addEventListener('click', () => {
      const entry = OCEAN_FACTS[Math.floor(Math.random() * OCEAN_FACTS.length)];
      showToast(`💡 ${entry.fact}`);
    });

    dom.quizModalClose.addEventListener('click', () => { dom.quizModal.setAttribute('hidden', ''); dom.quizModal.setAttribute('aria-hidden', 'true'); });
    dom.compareModalClose.addEventListener('click', () => { dom.compareModal.setAttribute('hidden', ''); dom.compareModal.setAttribute('aria-hidden', 'true'); });
    dom.historyModalClose.addEventListener('click', () => { dom.historyModal.setAttribute('hidden', ''); dom.historyModal.setAttribute('aria-hidden', 'true'); });

    [dom.quizModal, dom.compareModal, dom.historyModal].forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) { m.setAttribute('hidden', ''); m.setAttribute('aria-hidden', 'true'); } });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        [dom.quizModal, dom.compareModal, dom.historyModal].forEach(m => {
          if (!m.hasAttribute('hidden')) { m.setAttribute('hidden', ''); m.setAttribute('aria-hidden', 'true'); }
        });
        hideInfoCard();
      }
    });

    setTimeout(() => showToast('🌊 Welcome to the Ocean Currents Simulator! Select a current to begin.'), 500);
  }

  /* ==========================================================
     17. START
     ========================================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
