/* ============================================================
   Nature Explorer Map — Application Engine
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1.  ECOSYSTEM DATABASE
     ========================================================== */
  const LOCATIONS = [
    {
      id: 'amazon-rainforest',
      name: 'Amazon Rainforest',
      ecosystem: 'forest',
      continent: 'South America',
      lat: -3.4653, lng: -62.2159,
      area: '5.5 million km²',
      climate: 'Tropical rainforest',
      biodiversity: 96,
      wildlife: ['Jaguar', 'Macaw', 'Sloth', 'Poison Dart Frog', 'Anaconda'],
      facts: [
        'Produces approximately 20% of Earth\'s oxygen.',
        'Contains an estimated 390 billion individual trees.',
        'Spans across 9 South American countries.',
        'Home to 10% of all known species on Earth.',
        'The Amazon River is the largest river by discharge volume.'
      ],
      importance: 'The Amazon rainforest plays a critical role in regulating the global climate by absorbing vast amounts of carbon dioxide. It is one of the most biodiverse regions on the planet and serves as a vital habitat for millions of species, many of which are endemic.'
    },
    {
      id: 'congo-rainforest',
      name: 'Congo Rainforest',
      ecosystem: 'forest',
      continent: 'Africa',
      lat: 0, lng: 20,
      area: '2 million km²',
      climate: 'Tropical',
      biodiversity: 88,
      wildlife: ['Gorilla', 'Okapi', 'Forest Elephant', 'Chimpanzee', 'Bongo'],
      facts: [
        'The second-largest tropical rainforest in the world.',
        'Covers parts of 6 Central African countries.',
        'Home to the endangered Mountain Gorilla.',
        'Stores around 8% of the world\'s forest-based carbon.',
        'Contains the world\'s second-largest river by volume.'
      ],
      importance: 'The Congo Basin rainforest is a crucial carbon sink and biodiversity hotspot. It provides shelter to endangered species like gorillas and forest elephants, and sustains the livelihoods of over 75 million people.'
    },
    {
      id: 'black-forest',
      name: 'Black Forest',
      ecosystem: 'forest',
      continent: 'Europe',
      lat: 48, lng: 8,
      area: '6,009 km²',
      climate: 'Temperate oceanic',
      biodiversity: 72,
      wildlife: ['Red Deer', 'Wild Boar', 'Eurasian Lynx', 'Black Woodpecker', 'Fire Salamander'],
      facts: [
        'The name originates from the dense canopy of fir trees that block sunlight.',
        'Inspired many of the Grimm Brothers\' fairy tales.',
        'Famous for cuckoo clocks and Black Forest cake.',
        'The highest peak is Feldberg at 1,493 meters.',
        'The region is home to the endangered Western Capercaillie.'
      ],
      importance: 'The Black Forest is one of Europe\'s most iconic temperate forests, providing habitat for diverse wildlife and playing a key role in regional water regulation and climate moderation.'
    },
    {
      id: 'daintree-rainforest',
      name: 'Daintree Rainforest',
      ecosystem: 'forest',
      continent: 'Australia',
      lat: -16, lng: 145,
      area: '1,200 km²',
      climate: 'Tropical',
      biodiversity: 78,
      wildlife: ['Cassowary', 'Tree Kangaroo', 'Boyd\'s Forest Dragon', 'Ulysses Butterfly', 'Saltwater Crocodile'],
      facts: [
        'Estimated to be over 180 million years old — one of the oldest rainforests.',
        'Part of the Wet Tropics World Heritage Area.',
        'Contains 30% of Australia\'s frog, reptile, and marsupial species.',
        'The Daintree River is home to the estuarine crocodile.',
        'Named after Australian geologist Richard Daintree.'
      ],
      importance: 'The Daintree Rainforest is a living museum of evolutionary history, with ancient plant species that predate the separation of continents. It is critical for preserving Australia\'s unique biodiversity.'
    },
    {
      id: 'sahara-desert',
      name: 'Sahara Desert',
      ecosystem: 'desert',
      continent: 'Africa',
      lat: 25, lng: 10,
      area: '9.2 million km²',
      climate: 'Arid / Hyper-arid',
      biodiversity: 42,
      wildlife: ['Fennec Fox', 'Camel', 'Addax', 'Horned Viper', 'Scarab Beetle'],
      facts: [
        'The largest hot desert in the world, comparable to the size of China.',
        'Temperatures can reach up to 57.7°C (135.9°F).',
        'Only about 25% of the Sahara is covered in sand — the rest is rock and gravel.',
        'The Sahara has been expanding and contracting for millennia.',
        'It was once a lush, green region with lakes and rivers 6,000 years ago.'
      ],
      importance: 'The Sahara influences global atmospheric circulation and weather patterns. Its unique ecosystems support specially adapted species, and its mineral-rich sands provide essential nutrients to distant ecosystems via wind transport.'
    },
    {
      id: 'arabian-desert',
      name: 'Arabian Desert',
      ecosystem: 'desert',
      continent: 'Asia',
      lat: 25, lng: 45,
      area: '2.3 million km²',
      climate: 'Arid',
      biodiversity: 38,
      wildlife: ['Arabian Oryx', 'Sand Gazelle', 'Arabian Wolf', 'Spiny-tailed Lizard', 'Camel Spider'],
      facts: [
        'One of the largest deserts in the world, covering most of the Arabian Peninsula.',
        'Beneath its sands lie some of the world\'s largest oil reserves.',
        'The Rub\' al Khali (Empty Quarter) is the largest continuous sand desert.',
        'Temperatures can swing from 50°C during the day to near freezing at night.',
        'The Arabian Oryx was once extinct in the wild but has been reintroduced.'
      ],
      importance: 'The Arabian Desert is a region of extreme adaptation, where species have evolved remarkable strategies to survive. It also holds significant cultural and economic importance as the cradle of ancient civilizations.'
    },
    {
      id: 'gobi-desert',
      name: 'Gobi Desert',
      ecosystem: 'desert',
      continent: 'Asia',
      lat: 42, lng: 105,
      area: '1.3 million km²',
      climate: 'Cold desert / Continental',
      biodiversity: 35,
      wildlife: ['Bactrian Camel', 'Snow Leopard', 'Gobi Bear', 'Golden Eagle', 'Jerboa'],
      facts: [
        'A cold desert — temperatures can drop below -40°C in winter.',
        'Famous for its dinosaur fossil discoveries, including the first Velociraptor.',
        'The Gobi is expanding due to desertification, affecting millions in China.',
        'It is the source of many of the sandstorms that affect East Asia.',
        'The elusive Snow Leopard still roams the mountain ranges of the Gobi.'
      ],
      importance: 'The Gobi Desert is a critical paleontological site and a living laboratory for studying desertification and climate change. Its cold desert ecosystem supports uniquely adapted species.'
    },
    {
      id: 'atacama-desert',
      name: 'Atacama Desert',
      ecosystem: 'desert',
      continent: 'South America',
      lat: -24, lng: -70,
      area: '105,000 km²',
      climate: 'Arid / Hyper-arid',
      biodiversity: 28,
      wildlife: ['Vicuña', 'Flamingo', 'Atacama Toad', 'Desert Fox', 'Chinchilla'],
      facts: [
        'The driest non-polar desert in the world — some areas have never recorded rain.',
        'Used as a test site for Mars rover prototypes due to its extreme aridity.',
        'Some parts are so dry that no life exists at all.',
        'The blooming desert phenomenon occurs after rare rainfall events.',
        'Home to the world\'s largest copper mines.'
      ],
      importance: 'The Atacama Desert provides a unique environment for astrobiology research and is a natural laboratory for understanding life\'s limits. Its mineral wealth is crucial for modern technology.'
    },
    {
      id: 'himalayas',
      name: 'Himalayas',
      ecosystem: 'mountain',
      continent: 'Asia',
      lat: 28, lng: 85,
      area: '595,000 km²',
      climate: 'Alpine / Tundra',
      biodiversity: 74,
      wildlife: ['Snow Leopard', 'Red Panda', 'Himalayan Tahr', 'Musk Deer', 'Himalayan Griffon'],
      facts: [
        'Home to Mount Everest, the world\'s tallest peak at 8,848.86 meters.',
        'The range spans 5 countries: India, Nepal, Bhutan, China, Pakistan.',
        'The Himalayas are still rising by about 5mm per year due to tectonic activity.',
        'They are the source of 10 major rivers, including the Ganges, Indus, and Brahmaputra.',
        'Approximately 52 million people live in the Himalayan region.'
      ],
      importance: 'The Himalayas regulate the climate of South Asia, act as a massive freshwater reservoir, and support diverse ecosystems from tropical forests to alpine tundra. They are sacred to billions of people.'
    },
    {
      id: 'andes',
      name: 'Andes',
      ecosystem: 'mountain',
      continent: 'South America',
      lat: -20, lng: -68,
      area: '3.3 million km²',
      climate: 'Alpine / Tropical',
      biodiversity: 82,
      wildlife: ['Condor', 'Llama', 'Spectacled Bear', 'Vicuña', 'Chinchilla'],
      facts: [
        'The longest continental mountain range in the world at 8,900 km.',
        'Traverses 7 countries: Venezuela, Colombia, Ecuador, Peru, Bolivia, Chile, Argentina.',
        'Aconcagua is the highest peak outside of Asia at 6,961 meters.',
        'The Andes are home to the highest volcano on Earth, Ojos del Salado.',
        'Potatoes and tomatoes originated in the Andes region.'
      ],
      importance: 'The Andes are a biodiversity superhighway, creating countless microclimates and ecosystems. They are vital for water supply in western South America and have been home to human civilizations for millennia.'
    },
    {
      id: 'rocky-mountains',
      name: 'Rocky Mountains',
      ecosystem: 'mountain',
      continent: 'North America',
      lat: 40, lng: -110,
      area: '991,691 km²',
      climate: 'Alpine / Continental',
      biodiversity: 68,
      wildlife: ['Grizzly Bear', 'Bald Eagle', 'Mule Deer', 'Bighorn Sheep', 'Mountain Lion'],
      facts: [
        'The Rocky Mountains stretch over 4,800 km from Canada to New Mexico.',
        'Formed between 80 and 55 million years ago during the Laramide orogeny.',
        'Mount Elbert at 4,401 m is the highest peak in the Rockies.',
        'The Continental Divide runs along the crest of the Rockies.',
        'Yellowstone National Park, the first national park, lies within the Rockies.'
      ],
      importance: 'The Rockies are a critical water tower for western North America, providing water to millions through the Colorado, Missouri, and Columbia river systems. They are a haven for biodiversity and outdoor recreation.'
    },
    {
      id: 'alps',
      name: 'Alps',
      ecosystem: 'mountain',
      continent: 'Europe',
      lat: 46, lng: 8,
      area: '207,000 km²',
      climate: 'Alpine',
      biodiversity: 62,
      wildlife: ['Ibex', 'Chamois', 'Golden Eagle', 'Alpine Marmot', 'Lynx'],
      facts: [
        'The Alps stretch across 8 countries: France, Monaco, Italy, Switzerland, Germany, Austria, Liechtenstein, Slovenia.',
        'Mont Blanc at 4,808 m is the highest peak in the Alps.',
        'Over 100 million people visit the Alps each year for tourism.',
        'The Alps are the source of major European rivers like the Rhine and the Po.',
        'The region contains over 1,200 glaciers, which are rapidly retreating.'
      ],
      importance: 'The Alps provide essential ecosystem services including freshwater supply, climate regulation, and biodiversity conservation. They are also a vital cultural and economic region for Europe.'
    },
    {
      id: 'pacific-ocean',
      name: 'Pacific Ocean',
      ecosystem: 'ocean',
      continent: 'Multiple',
      lat: 0, lng: -150,
      area: '165.25 million km²',
      climate: 'Tropical to Polar',
      biodiversity: 92,
      wildlife: ['Great White Shark', 'Humpback Whale', 'Sea Turtle', 'Clownfish', 'Giant Pacific Octopus'],
      facts: [
        'The largest and deepest ocean, covering about 32% of Earth\'s surface.',
        'The Mariana Trench is the deepest point at 11,034 meters.',
        'Contains over 25,000 islands, mostly in the South Pacific.',
        'The Great Barrier Reef, the largest coral reef system, lies in the Pacific.',
        'The Pacific Ring of Fire is home to 75% of the world\'s active volcanoes.'
      ],
      importance: 'The Pacific Ocean drives global climate systems through phenomena like El Niño. It supports the highest marine biodiversity of any ocean and is critical for global trade, food security, and oxygen production.'
    },
    {
      id: 'atlantic-ocean',
      name: 'Atlantic Ocean',
      ecosystem: 'ocean',
      continent: 'Multiple',
      lat: 0, lng: -40,
      area: '106.46 million km²',
      climate: 'Tropical to Polar',
      biodiversity: 85,
      wildlife: ['Blue Whale', 'Atlantic Salmon', 'Loggerhead Turtle', 'Killer Whale', 'Atlantic Cod'],
      facts: [
        'The second-largest ocean, covering 20% of Earth\'s surface.',
        'The Mid-Atlantic Ridge is the world\'s longest mountain range, mostly underwater.',
        'The Sargasso Sea is the only sea without a coastline.',
        'The Atlantic is the saltiest of the major oceans.',
        'The Titanic rests on the Atlantic seafloor at 3,800 meters deep.'
      ],
      importance: 'The Atlantic Ocean plays a crucial role in global heat distribution through the Gulf Stream. It supports major fisheries and is a vital corridor for international shipping and communication.'
    },
    {
      id: 'indian-ocean',
      name: 'Indian Ocean',
      ecosystem: 'ocean',
      continent: 'Multiple',
      lat: -10, lng: 70,
      area: '70.56 million km²',
      climate: 'Tropical to Temperate',
      biodiversity: 80,
      wildlife: ['Whale Shark', 'Manta Ray', 'Dugong', 'Green Turtle', 'Flying Fish'],
      facts: [
        'The third-largest ocean, bounded by Africa, Asia, Australia, and Antarctica.',
        'The monsoon winds of the Indian Ocean drive weather across South Asia.',
        'Contains the world\'s largest island nation, Indonesia.',
        'The ocean is warming faster than any other tropical ocean.',
        'Home to the mysterious "Gravity Hole" — a point of lower gravity.'
      ],
      importance: 'The Indian Ocean is critical for global climate regulation, especially the monsoon systems that feed billions. It is a biodiversity hotspot for coral reefs and supports one-third of the world\'s population living along its coast.'
    },
    {
      id: 'arctic-ocean',
      name: 'Arctic Ocean',
      ecosystem: 'ocean',
      continent: 'Multiple',
      lat: 85, lng: 0,
      area: '14.06 million km²',
      climate: 'Polar',
      biodiversity: 40,
      wildlife: ['Polar Bear', 'Narwhal', 'Walrus', 'Arctic Fox', 'Bowhead Whale'],
      facts: [
        'The smallest and shallowest of the world\'s oceans.',
        'Sea ice extent has declined by about 13% per decade since satellite records began.',
        'The North Pole is covered by sea ice year-round.',
        'The Arctic is warming nearly four times faster than the global average.',
        'Home to the amazing narwhal, often called the "unicorn of the sea."'
      ],
      importance: 'The Arctic Ocean is a critical regulator of Earth\'s climate through its ice-albedo effect. It is home to uniquely adapted species and is experiencing the most rapid environmental changes on the planet.'
    },
    {
      id: 'pantanal',
      name: 'Pantanal',
      ecosystem: 'wetland',
      continent: 'South America',
      lat: -18, lng: -57,
      area: '150,000 km²',
      climate: 'Tropical seasonal',
      biodiversity: 90,
      wildlife: ['Jaguar', 'Capybara', 'Giant Otter', 'Hyacinth Macaw', 'Yacare Caiman'],
      facts: [
        'The world\'s largest tropical wetland, spanning Brazil, Bolivia, and Paraguay.',
        'During the wet season, 80% of the Pantanal floods.',
        'Has the highest concentration of wildlife in South America.',
        'Home to the largest jaguar population in the world.',
        'The Pantanal is one of the best places to see wild jaguars.'
      ],
      importance: 'The Pantanal is a biodiversity wonderland and a crucial habitat for endangered species like the jaguar and giant otter. Its seasonal flooding cycle creates a dynamic ecosystem that supports an extraordinary density of life.'
    },
    {
      id: 'everglades',
      name: 'Everglades',
      ecosystem: 'wetland',
      continent: 'North America',
      lat: 26, lng: -81,
      area: '15,000 km²',
      climate: 'Tropical / Subtropical',
      biodiversity: 76,
      wildlife: ['American Alligator', 'West Indian Manatee', 'Roseate Spoonbill', 'Florida Panther', 'Wood Stork'],
      facts: [
        'The largest subtropical wilderness in the United States.',
        'Often called the "River of Grass" because of its slow-moving water.',
        'The only place on Earth where alligators and crocodiles coexist.',
        'Provides drinking water for over 8 million Floridians.',
        'The Everglades are a UNESCO World Heritage Site.'
      ],
      importance: 'The Everglades is a vital ecosystem that provides clean water, flood protection, and habitat for numerous endangered species. It is a globally important wetland that has been recognized for its ecological significance.'
    },
    {
      id: 'antarctica',
      name: 'Antarctica',
      ecosystem: 'polar',
      continent: 'Antarctica',
      lat: -80, lng: 0,
      area: '14.2 million km²',
      climate: 'Polar ice cap',
      biodiversity: 25,
      wildlife: ['Emperor Penguin', 'Weddell Seal', 'Krill', 'Snow Petrel', 'Leopard Seal'],
      facts: [
        'The coldest, windiest, and driest continent on Earth.',
        'Contains about 70% of the world\'s fresh water in its ice sheet.',
        'The lowest recorded temperature was -89.2°C at Vostok Station.',
        'Antarctica is a desert — it receives less than 200mm of precipitation annually.',
        'No permanent human population, only scientific research stations.'
      ],
      importance: 'Antarctica is crucial for regulating Earth\'s climate and sea levels. Its ice cores provide a 800,000-year record of atmospheric history. The continent is protected by international treaty for peaceful scientific research.'
    },
    {
      id: 'arctic-circle',
      name: 'Arctic Circle Region',
      ecosystem: 'polar',
      continent: 'Multiple',
      lat: 66.5, lng: 0,
      area: '21 million km²',
      climate: 'Polar tundra',
      biodiversity: 35,
      wildlife: ['Reindeer', 'Arctic Wolf', 'Snowy Owl', 'Musk Ox', 'Arctic Hare'],
      facts: [
        'The Arctic Circle experiences 24-hour daylight in summer and 24-hour darkness in winter.',
        'Indigenous peoples have lived in the Arctic for thousands of years.',
        'Permafrost beneath the Arctic tundra contains vast amounts of trapped methane.',
        'The Arctic is home to the fastest-warming region on Earth.',
        'Sea ice loss threatens the survival of polar bears and other ice-dependent species.'
      ],
      importance: 'The Arctic is a sentinel for climate change, warming at unprecedented rates. Its ecosystems support unique wildlife adapted to extreme conditions, and its fate is intimately tied to global sea-level rise and weather patterns.'
    }
  ];

  /* ==========================================================
     2.  ADDITIONAL DATA FOR ADVANCED FEATURES
     ========================================================== */

  const CONTINENTS = [
    'North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia', 'Antarctica'
  ];

  const ECOSYSTEM_TYPES = ['forest', 'desert', 'mountain', 'ocean', 'wetland', 'grassland', 'polar'];

  const RANDOM_FACTS = [
    { fact: 'Earth has approximately 3.04 trillion trees.', source: 'Yale University, 2015' },
    { fact: 'Coral reefs support 25% of all marine species but cover less than 1% of the ocean floor.', source: 'NOAA' },
    { fact: 'The Greenland ice sheet contains enough water to raise global sea levels by 7 meters.', source: 'NASA' },
    { fact: 'Tropical rainforests cover only 6% of Earth\'s surface but contain half of all species.', source: 'WWF' },
    { fact: 'The Sahara Desert was once a lush grassland with lakes and rivers 10,000 years ago.', source: 'NASA Earth Observatory' },
    { fact: 'Mount Everest grows about 4mm taller each year due to tectonic uplift.', source: 'USGS' },
    { fact: 'The Amazon produces about 20% of the world\'s oxygen.', source: 'NASA' },
    { fact: 'Over 80% of the world\'s oceans remain unmapped and unexplored.', source: 'NOAA' },
    { fact: 'Wetlands are disappearing three times faster than forests globally.', source: 'Ramsar Convention' },
    { fact: 'Antarctica has the cleanest air on Earth, with virtually no pollution.', source: 'Scripps Institution' },
    { fact: 'The Atacama Desert in Chile is the driest non-polar place on Earth.', source: 'National Geographic' },
    { fact: 'The Arctic is warming nearly four times faster than the global average.', source: 'IPCC' },
    { fact: 'Coral reefs are home to more than 4,000 species of fish.', source: 'WWF' },
    { fact: 'The Pantanal wetland is home to the highest concentration of jaguars in the world.', source: 'Panthera' },
    { fact: 'Biodiversity loss is occurring at 1,000 times the natural extinction rate.', source: 'UN Environment' }
  ];

  const ACHIEVEMENT_DEFS = [
    { id: 'first-explore', name: 'First Steps', desc: 'Discover your first location', icon: '📍', check: s => s.exploredLocations.length >= 1 },
    { id: 'explorer-5', name: 'Pathfinder', desc: 'Discover 5 locations', icon: '🗺️', check: s => s.exploredLocations.length >= 5 },
    { id: 'explorer-10', name: 'Voyager', desc: 'Discover 10 locations', icon: '🌍', check: s => s.exploredLocations.length >= 10 },
    { id: 'explorer-15', name: 'Pioneer', desc: 'Discover 15 locations', icon: '🌟', check: s => s.exploredLocations.length >= 15 },
    { id: 'all-ecosystems', name: 'Ecosystem Master', desc: 'Explore all ecosystem types', icon: '🌿', check: s => s.ecosystemsExplored.length >= ECOSYSTEM_TYPES.length },
    { id: 'all-continents', name: 'Global Explorer', desc: 'Visit all continents', icon: '🌎', check: s => s.continentsCovered.length >= CONTINENTS.length },
    { id: 'forest-fan', name: 'Forest Friend', desc: 'Explore 2+ forest locations', icon: '🌲', check: s => s.exploredLocations.filter(id => getLocation(id).ecosystem === 'forest').length >= 2 },
    { id: 'desert-dweller', name: 'Desert Dweller', desc: 'Explore 2+ desert locations', icon: '🏜️', check: s => s.exploredLocations.filter(id => getLocation(id).ecosystem === 'desert').length >= 2 },
    { id: 'mountain-summit', name: 'Mountain Summit', desc: 'Explore 2+ mountain locations', icon: '⛰️', check: s => s.exploredLocations.filter(id => getLocation(id).ecosystem === 'mountain').length >= 2 },
    { id: 'ocean-explorer', name: 'Ocean Explorer', desc: 'Explore 2+ ocean locations', icon: '🌊', check: s => s.exploredLocations.filter(id => getLocation(id).ecosystem === 'ocean').length >= 2 }
  ];

  const ECOSYSTEM_ICONS = {
    forest: { color: '#22c55e', symbol: '🌲' },
    desert: { color: '#f59e0b', symbol: '🏜️' },
    mountain: { color: '#94a3b8', symbol: '⛰️' },
    ocean: { color: '#0ea5e9', symbol: '🌊' },
    wetland: { color: '#06b6d4', symbol: '🌿' },
    grassland: { color: '#84cc16', symbol: '🌾' },
    polar: { color: '#e2e8f0', symbol: '❄️' }
  };

  const ECOSYSTEM_LABELS = {
    forest: 'Forest', desert: 'Desert', mountain: 'Mountain', ocean: 'Ocean',
    wetland: 'Wetland', grassland: 'Grassland', polar: 'Polar'
  };

  /* ==========================================================
     3.  STATE MANAGEMENT
     ========================================================== */

  const STORAGE_KEY = 'natureExplorerMap';

  let state = {
    selectedLocation: null,
    ecosystemType: null,
    exploredLocations: [],
    ecosystemsExplored: [],
    continentsCovered: [],
    activeFilters: ['all'],
    mapZoomLevel: 1,
    discoveryProgress: 0,
    bookmarks: [],
    history: [],
    achievements: [],
    theme: 'night',
    comparison: { active: false, location1: null, location2: null }
  };

  function loadState () {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      }
    } catch (e) { /* ignore */ }
  }

  function saveState () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function getLocation (id) {
    return LOCATIONS.find(l => l.id === id);
  }

  /* ==========================================================
     4.  DOM REFERENCES
     ========================================================== */

  const $ = id => document.getElementById(id);

  const dom = {
    // Left panel
    searchInput: $('searchInput'),
    filterChips: $('filterChips'),
    statTotal: $('statTotal'),
    statExplored: $('statExplored'),
    statContinents: $('statContinents'),
    statProgress: $('statProgress'),
    progressFill: $('progressFill'),
    activityFeed: $('activityFeed'),

    // Map
    worldMap: $('worldMap'),
    markersGroup: $('markersGroup'),
    mapHeader: $('mapHeader'),
    activeLocationName: $('activeLocationName'),
    activeEcosystem: $('activeEcosystem'),
    activeContinent: $('activeContinent'),
    activeCoords: $('activeCoords'),
    zoomInBtn: $('zoomInBtn'),
    zoomOutBtn: $('zoomOutBtn'),
    themeToggleBtn: $('themeToggleBtn'),

    // Info card
    infoCardOverlay: $('infoCardOverlay'),
    infoCard: $('infoCard'),
    infoCardClose: $('infoCardClose'),
    infoCardHero: $('infoCardHero'),
    infoCardTitle: $('infoCardTitle'),
    infoCardBadge: $('infoCardBadge'),
    infoContinent: $('infoContinent'),
    infoArea: $('infoArea'),
    infoClimate: $('infoClimate'),
    infoBiodiversity: $('infoBiodiversity'),
    infoWildlife: $('infoWildlife'),
    infoFacts: $('infoFacts'),
    infoImportance: $('infoImportance'),
    bookmarkBtn: $('bookmarkBtn'),
    compareBtn: $('compareBtn'),

    // Modals
    compareModal: $('compareModal'),
    compareModalClose: $('compareModalClose'),
    compareModalBody: $('compareModalBody'),
    quizModal: $('quizModal'),
    quizModalClose: $('quizModalClose'),
    quizModalBody: $('quizModalBody'),
    historyModal: $('historyModal'),
    historyModalClose: $('historyModalClose'),
    historyModalBody: $('historyModalBody'),

    // Toast
    toastContainer: $('toastContainer'),

    // Action bar
    showHistoryBtn: $('showHistoryBtn'),
    showAchievementsBtn: $('showAchievementsBtn'),
    showQuizBtn: $('showQuizBtn'),
    showRankingsBtn: $('showRankingsBtn'),
    randomFactBtn: $('randomFactBtn'),

    // App
    app: $('app')
  };

  /* ==========================================================
     5.  MAP COORDINATE MATH
     ========================================================== */

  function latLngToSvg (lat, lng, width, height) {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  }

  /* ==========================================================
     6.  MAP MARKER RENDERING
     ========================================================== */

  function getMarkerColor (ecosystem) {
    const colors = {
      forest: '#22c55e',
      desert: '#f59e0b',
      mountain: '#94a3b8',
      ocean: '#0ea5e9',
      wetland: '#06b6d4',
      grassland: '#84cc16',
      polar: '#e2e8f0'
    };
    return colors[ecosystem] || '#38bdf8';
  }

  function createMarkerElement (location, isActive, isBookmarked) {
    const { x, y } = latLngToSvg(location.lat, location.lng, 800, 400);
    const color = getMarkerColor(location.ecosystem);
    const explored = state.exploredLocations.includes(location.id);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `map-marker${isActive ? ' map-marker--active' : ''}`);
    g.setAttribute('data-location-id', location.id);
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `${location.name}, ${ECOSYSTEM_LABELS[location.ecosystem]}${explored ? ' — Discovered' : ''}`);
    g.setAttribute('style', `transform: translate(${x}px, ${y}px)`);

    // Glow circle
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('class', 'map-marker-glow');
    glow.setAttribute('cx', '0');
    glow.setAttribute('cy', '0');
    glow.setAttribute('r', '24');
    glow.setAttribute('fill', `url(#markerGlow${ECOSYSTEM_LABELS[location.ecosystem]})`);
    g.appendChild(glow);

    // Outer ring
    const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outer.setAttribute('class', 'map-marker-pin');
    outer.setAttribute('cx', '0');
    outer.setAttribute('cy', '0');
    outer.setAttribute('r', explored ? '6' : '5');
    outer.setAttribute('fill', explored ? color : '#1e293b');
    outer.setAttribute('stroke', color);
    outer.setAttribute('stroke-width', '2');
    if (isBookmarked) {
      outer.setAttribute('stroke-dasharray', '4,2');
    }
    g.appendChild(outer);

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('class', 'map-marker-label');
    label.setAttribute('x', '0');
    label.setAttribute('y', '14');
    label.textContent = location.name;
    g.appendChild(label);

    // Events
    g.addEventListener('click', () => selectLocation(location.id));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectLocation(location.id);
      }
    });

    return g;
  }

  function renderMarkers () {
    dom.markersGroup.innerHTML = '';
    const filter = state.activeFilters.includes('all')
      ? null
      : state.activeFilters[0];

    LOCATIONS.forEach(loc => {
      if (filter && loc.ecosystem !== filter) return;
      const isActive = state.selectedLocation === loc.id;
      const isBookmarked = state.bookmarks.includes(loc.id);
      const marker = createMarkerElement(loc, isActive, isBookmarked);
      dom.markersGroup.appendChild(marker);
    });
  }

  /* ==========================================================
     7.  LOCATION SELECTION & INFO CARD
     ========================================================== */

  function selectLocation (id) {
    const location = getLocation(id);
    if (!location) return;

    state.selectedLocation = id;
    state.ecosystemType = location.ecosystem;

    // Track exploration
    if (!state.exploredLocations.includes(id)) {
      state.exploredLocations.push(id);

      if (!state.ecosystemsExplored.includes(location.ecosystem)) {
        state.ecosystemsExplored.push(location.ecosystem);
      }

      if (location.continent !== 'Multiple' && !state.continentsCovered.includes(location.continent)) {
        state.continentsCovered.push(location.continent);
      }

      state.history.unshift({
        id: location.id,
        name: location.name,
        ecosystem: location.ecosystem,
        timestamp: new Date().toISOString()
      });

      addActivityItem(location);
      checkAchievements();
    }

    updateMapHeader(location);
    updateStats();
    renderMarkers();
    showInfoCard(location);
    saveState();
  }

  function updateMapHeader (location) {
    dom.activeLocationName.textContent = location.name;
    dom.activeEcosystem.textContent = ECOSYSTEM_LABELS[location.ecosystem];
    dom.activeContinent.textContent = location.continent;
    dom.activeCoords.textContent = `${Math.abs(location.lat).toFixed(1)}°${location.lat >= 0 ? 'N' : 'S'}, ${Math.abs(location.lng).toFixed(1)}°${location.lng >= 0 ? 'E' : 'W'}`;
  }

  /* ==========================================================
     8.  INFO CARD DISPLAY
     ========================================================== */

  function generateHeroSVG (location) {
    const color = getMarkerColor(location.ecosystem);
    const name = location.name;
    const ecoType = location.ecosystem;

    let elements = '';

    // Forest
    if (ecoType === 'forest') {
      elements = `
        <rect width="520" height="140" fill="#0a1f0e"/>
        <circle cx="80" cy="120" r="30" fill="#1a4a2a" opacity="0.6"/>
        <circle cx="160" cy="110" r="40" fill="#1a5a2a" opacity="0.5"/>
        <circle cx="250" cy="115" r="35" fill="#1a4a2a" opacity="0.6"/>
        <circle cx="340" cy="105" r="45" fill="#1a5a2a" opacity="0.5"/>
        <circle cx="430" cy="115" r="30" fill="#1a4a2a" opacity="0.6"/>
        <rect x="30" y="95" width="4" height="40" fill="#4a3520"/>
        <rect x="140" y="85" width="4" height="50" fill="#4a3520"/>
        <rect x="230" y="90" width="4" height="45" fill="#4a3520"/>
        <rect x="320" y="78" width="4" height="55" fill="#4a3520"/>
        <rect x="410" y="90" width="4" height="45" fill="#4a3520"/>
        <text x="260" y="20" fill="${color}" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.4">${name}</text>
      `;
    // Desert
    } else if (ecoType === 'desert') {
      elements = `
        <rect width="520" height="140" fill="#1a1200"/>
        <path d="M0 120 Q 80 90 160 115 Q 240 85 320 110 Q 400 80 520 105 L 520 140 L 0 140 Z" fill="#2a2000" opacity="0.8"/>
        <path d="M0 130 Q 100 100 200 125 Q 300 95 400 120 Q 450 100 520 115 L 520 140 L 0 140 Z" fill="#3a2e00" opacity="0.6"/>
        <circle cx="100" cy="40" r="20" fill="#f59e0b" opacity="0.08"/>
        <circle cx="400" cy="30" r="30" fill="#f59e0b" opacity="0.08"/>
        <circle cx="260" cy="25" r="18" fill="#f59e0b" opacity="0.06"/>
        <text x="260" y="20" fill="${color}" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.4">${name}</text>
      `;
    // Mountain
    } else if (ecoType === 'mountain') {
      elements = `
        <rect width="520" height="140" fill="#0f172a"/>
        <polygon points="0,140 80,30 160,140" fill="#334155" opacity="0.7"/>
        <polygon points="120,140 220,20 320,140" fill="#475569" opacity="0.6"/>
        <polygon points="260,140 380,35 520,140" fill="#334155" opacity="0.7"/>
        <polygon points="340,140 440,55 520,140" fill="#1e293b" opacity="0.5"/>
        <polygon points="160,140 260,80 370,140" fill="#64748b" opacity="0.3"/>
        <text x="260" y="20" fill="${color}" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.4">${name}</text>
      `;
    // Ocean
    } else if (ecoType === 'ocean') {
      elements = `
        <rect width="520" height="140" fill="#082840"/>
        <path d="M0 60 Q 40 40 80 60 Q 120 40 160 60 Q 200 40 240 60 Q 280 40 320 60 Q 360 40 400 60 Q 440 40 480 60 Q 520 40 520 60 L 520 140 L 0 140 Z" fill="#0a3050" opacity="0.6"/>
        <path d="M0 80 Q 50 65 100 80 Q 150 65 200 80 Q 250 65 300 80 Q 350 65 400 80 Q 450 65 520 80 L 520 140 L 0 140 Z" fill="#0c3860" opacity="0.4"/>
        <path d="M0 100 Q 60 88 120 100 Q 180 88 240 100 Q 300 88 360 100 Q 420 88 520 100 L 520 140 L 0 140 Z" fill="#0e4070" opacity="0.3"/>
        <circle cx="400" cy="45" r="4" fill="#38bdf8" opacity="0.3"/>
        <circle cx="420" cy="52" r="3" fill="#38bdf8" opacity="0.2"/>
        <circle cx="380" cy="55" r="2" fill="#38bdf8" opacity="0.2"/>
        <text x="260" y="20" fill="${color}" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.4">${name}</text>
      `;
    // Wetland
    } else if (ecoType === 'wetland') {
      elements = `
        <rect width="520" height="140" fill="#082020"/>
        <rect x="0" y="100" width="520" height="40" fill="#0a3020" opacity="0.6"/>
        <ellipse cx="80" cy="95" rx="30" ry="8" fill="#06b6d4" opacity="0.15"/>
        <ellipse cx="200" cy="90" rx="25" ry="6" fill="#06b6d4" opacity="0.12"/>
        <ellipse cx="350" cy="93" rx="28" ry="7" fill="#06b6d4" opacity="0.13"/>
        <ellipse cx="460" cy="96" rx="22" ry="5" fill="#06b6d4" opacity="0.1"/>
        <line x1="60" y1="80" x2="60" y2="60" stroke="#0a5030" stroke-width="2"/>
        <line x1="160" y1="78" x2="160" y2="55" stroke="#0a5030" stroke-width="2"/>
        <line x1="310" y1="82" x2="310" y2="58" stroke="#0a5030" stroke-width="2"/>
        <line x1="430" y1="76" x2="430" y2="52" stroke="#0a5030" stroke-width="2"/>
        <text x="260" y="20" fill="${color}" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.4">${name}</text>
      `;
    // Grassland
    } else if (ecoType === 'grassland') {
      elements = `
        <rect width="520" height="140" fill="#0a1a00"/>
        <rect x="0" y="100" width="520" height="40" fill="#1a3a00" opacity="0.5"/>
        <line x1="50" y1="100" x2="50" y2="65" stroke="#2a5a00" stroke-width="1.5" transform="rotate(-5, 50, 100)"/>
        <line x1="120" y1="100" x2="120" y2="70" stroke="#2a5a00" stroke-width="1.5" transform="rotate(3, 120, 100)"/>
        <line x1="190" y1="100" x2="190" y2="68" stroke="#2a5a00" stroke-width="1.5" transform="rotate(-2, 190, 100)"/>
        <line x1="260" y1="100" x2="260" y2="65" stroke="#2a5a00" stroke-width="1.5" transform="rotate(4, 260, 100)"/>
        <line x1="340" y1="100" x2="340" y2="72" stroke="#2a5a00" stroke-width="1.5" transform="rotate(-3, 340, 100)"/>
        <line x1="420" y1="100" x2="420" y2="67" stroke="#2a5a00" stroke-width="1.5" transform="rotate(2, 420, 100)"/>
        <line x1="490" y1="100" x2="490" y2="70" stroke="#2a5a00" stroke-width="1.5" transform="rotate(-4, 490, 100)"/>
        <text x="260" y="20" fill="${color}" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.4">${name}</text>
      `;
    // Polar
    } else {
      elements = `
        <rect width="520" height="140" fill="#0a1018"/>
        <rect x="0" y="100" width="520" height="40" fill="#1a2a3a" opacity="0.5"/>
        <polygon points="260,40 240,100 280,100" fill="#e2e8f0" opacity="0.08"/>
        <polygon points="200,55 180,100 220,100" fill="#e2e8f0" opacity="0.06"/>
        <polygon points="320,50 300,100 340,100" fill="#e2e8f0" opacity="0.07"/>
        <circle cx="150" cy="45" r="6" fill="#e2e8f0" opacity="0.05"/>
        <circle cx="370" cy="38" r="8" fill="#e2e8f0" opacity="0.05"/>
        <circle cx="450" cy="50" r="5" fill="#e2e8f0" opacity="0.04"/>
        <text x="260" y="20" fill="${color}" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.4">${name}</text>
      `;
    }

    return `<svg viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg">${elements}</svg>`;
  }

  function showInfoCard (location) {
    const color = getMarkerColor(location.ecosystem);
    const ecoLabel = ECOSYSTEM_LABELS[location.ecosystem];

    dom.infoCardHero.innerHTML = generateHeroSVG(location);
    dom.infoCardTitle.textContent = location.name;
    dom.infoCardBadge.textContent = ecoLabel;
    dom.infoCardBadge.className = `info-card-badge badge-${location.ecosystem}`;
    dom.infoContinent.textContent = location.continent;
    dom.infoArea.textContent = location.area;
    dom.infoClimate.textContent = location.climate;
    dom.infoBiodiversity.textContent = `${location.biodiversity}/100`;

    // Wildlife
    dom.infoWildlife.innerHTML = '';
    location.wildlife.forEach(a => {
      const li = document.createElement('li');
      li.textContent = a;
      dom.infoWildlife.appendChild(li);
    });

    // Facts
    dom.infoFacts.innerHTML = '';
    location.facts.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      dom.infoFacts.appendChild(li);
    });

    // Importance
    dom.infoImportance.textContent = location.importance;

    // Bookmark state
    const isBookmarked = state.bookmarks.includes(location.id);
    dom.bookmarkBtn.classList.toggle('info-card-action-btn--active', isBookmarked);
    dom.bookmarkBtn.querySelector('span').textContent = isBookmarked ? 'Bookmarked' : 'Bookmark';

    dom.infoCardOverlay.removeAttribute('hidden');
    dom.infoCardOverlay.removeAttribute('aria-hidden');
    dom.infoCardOverlay.focus();

    // Focus trap - close on overlay click
    dom.infoCardOverlay.addEventListener('click', (e) => {
      if (e.target === dom.infoCardOverlay) hideInfoCard();
    });

    // Close on escape
    document.addEventListener('keydown', handleInfoCardEscape);

    dom.infoCard.scrollTop = 0;
  }

  function hideInfoCard () {
    dom.infoCardOverlay.setAttribute('hidden', '');
    dom.infoCardOverlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', handleInfoCardEscape);
  }

  function handleInfoCardEscape (e) {
    if (e.key === 'Escape') hideInfoCard();
  }

  /* ==========================================================
     9.  ACTIVITY FEED
     ========================================================== */

  function addActivityItem (location) {
    const ecoColor = getMarkerColor(location.ecosystem);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="activity-dot" style="background:${ecoColor}"></span>
      <span>${location.name} discovered</span>
      <span class="activity-time">${timeStr}</span>
    `;

    const empty = dom.activityFeed.querySelector('.activity-empty');
    if (empty) empty.remove();

    dom.activityFeed.insertBefore(item, dom.activityFeed.firstChild);

    // Keep max 20 items
    while (dom.activityFeed.children.length > 20) {
      dom.activityFeed.removeChild(dom.activityFeed.lastChild);
    }
  }

  /* ==========================================================
     10. STATISTICS ENGINE
     ========================================================== */

  function updateStats () {
    const total = LOCATIONS.length;
    const explored = state.exploredLocations.length;
    const continents = state.continentsCovered.length;
    const progress = total > 0 ? Math.round((explored / total) * 100) : 0;

    dom.statTotal.textContent = total;
    dom.statExplored.textContent = explored;
    dom.statContinents.textContent = continents;
    dom.statProgress.textContent = `${progress}%`;
    dom.progressFill.style.width = `${progress}%`;
    dom.progressFill.parentElement.setAttribute('aria-valuenow', progress);

    state.discoveryProgress = progress;
  }

  /* ==========================================================
     11. FILTERS & SEARCH
     ========================================================== */

  function applyFilters () {
    const query = dom.searchInput.value.toLowerCase().trim();

    LOCATIONS.forEach(loc => {
      const marker = dom.markersGroup.querySelector(`[data-location-id="${loc.id}"]`);
      if (!marker) return;

      const filterMatch = state.activeFilters.includes('all') || state.activeFilters.includes(loc.ecosystem);
      const searchMatch = !query ||
        loc.name.toLowerCase().includes(query) ||
        loc.continent.toLowerCase().includes(query) ||
        ECOSYSTEM_LABELS[loc.ecosystem].toLowerCase().includes(query);

      marker.style.display = (filterMatch && searchMatch) ? '' : 'none';
    });
  }

  function initFilters () {
    dom.filterChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      const filter = chip.dataset.filter;

      dom.filterChips.querySelectorAll('.chip').forEach(c => {
        c.classList.remove('chip--active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('chip--active');
      chip.setAttribute('aria-pressed', 'true');

      state.activeFilters = [filter];
      renderMarkers();
      applyFilters();
      saveState();
    });
  }

  function initSearch () {
    dom.searchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

  /* ==========================================================
     12. ECOSYSTEM COMPARISON
     ========================================================== */

  function showComparison (location1Id, location2Id) {
    const loc1 = getLocation(location1Id);
    const loc2 = getLocation(location2Id);

    if (!loc1 || !loc2) return;

    dom.compareModalBody.innerHTML = `
      <div class="comparison-grid">
        <div class="comparison-column">
          <h3>${loc1.name}</h3>
          <div class="comparison-row"><span class="comparison-label">Ecosystem</span><span class="comparison-value">${ECOSYSTEM_LABELS[loc1.ecosystem]}</span></div>
          <div class="comparison-row"><span class="comparison-label">Continent</span><span class="comparison-value">${loc1.continent}</span></div>
          <div class="comparison-row"><span class="comparison-label">Area</span><span class="comparison-value">${loc1.area}</span></div>
          <div class="comparison-row"><span class="comparison-label">Climate</span><span class="comparison-value">${loc1.climate}</span></div>
          <div class="comparison-row"><span class="comparison-label">Biodiversity</span><span class="comparison-value">${loc1.biodiversity}/100</span></div>
          <div class="comparison-row"><span class="comparison-label">Wildlife</span><span class="comparison-value">${loc1.wildlife.length} species</span></div>
        </div>
        <div class="comparison-column">
          <h3>${loc2.name}</h3>
          <div class="comparison-row"><span class="comparison-label">Ecosystem</span><span class="comparison-value">${ECOSYSTEM_LABELS[loc2.ecosystem]}</span></div>
          <div class="comparison-row"><span class="comparison-label">Continent</span><span class="comparison-value">${loc2.continent}</span></div>
          <div class="comparison-row"><span class="comparison-label">Area</span><span class="comparison-value">${loc2.area}</span></div>
          <div class="comparison-row"><span class="comparison-label">Climate</span><span class="comparison-value">${loc2.climate}</span></div>
          <div class="comparison-row"><span class="comparison-label">Biodiversity</span><span class="comparison-value">${loc2.biodiversity}/100</span></div>
          <div class="comparison-row"><span class="comparison-label">Wildlife</span><span class="comparison-value">${loc2.wildlife.length} species</span></div>
        </div>
      </div>
    `;
    dom.compareModal.removeAttribute('hidden');
    dom.compareModal.removeAttribute('aria-hidden');
  }

  /* ==========================================================
     13. QUIZ ENGINE
     ========================================================== */

  let quizState = { current: 0, score: 0, answered: false, questions: [] };

  function generateQuizQuestions () {
    const questions = [];
    const used = new Set();

    while (questions.length < 10) {
      const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      if (used.has(loc.id)) continue;
      used.add(loc.id);

      const qType = Math.floor(Math.random() * 4);
      let question, answer, options;

      switch (qType) {
        case 0: // Name -> Ecosystem
          question = `What ecosystem type is ${loc.name}?`;
          answer = ECOSYSTEM_LABELS[loc.ecosystem];
          options = ECOSYSTEM_TYPES.map(t => ECOSYSTEM_LABELS[t]).filter(l => l !== answer);
          options = shuffleArray(options).slice(0, 3);
          options.push(answer);
          break;
        case 1: // Name -> Continent
          question = `Which continent is ${loc.name} located in?`;
          answer = loc.continent;
          const otherConts = CONTINENTS.filter(c => c !== loc.continent);
          options = shuffleArray(otherConts).slice(0, 3);
          options.push(answer);
          break;
        case 2: // Fact -> Name
          const fact = loc.facts[Math.floor(Math.random() * loc.facts.length)];
          question = `Which location does this fact describe?\n"${fact}"`;
          answer = loc.name;
          const others = LOCATIONS.filter(l => l.id !== loc.id);
          options = shuffleArray(others).slice(0, 3).map(l => l.name);
          options.push(answer);
          break;
        case 3: // Biodiversity score
          question = `What is the biodiversity score of ${loc.name}?`;
          answer = `${loc.biodiversity}/100`;
          const scores = LOCATIONS.filter(l => l.id !== loc.id).map(l => `${l.biodiversity}/100`);
          options = shuffleArray(scores).slice(0, 3);
          options.push(answer);
          break;
      }

      options = shuffleArray(options);

      questions.push({ question, answer, options, locationId: loc.id });
    }

    return questions;
  }

  function startQuiz () {
    quizState = {
      current: 0,
      score: 0,
      answered: false,
      questions: generateQuizQuestions()
    };
    renderQuizQuestion();
    dom.quizModal.removeAttribute('hidden');
    dom.quizModal.removeAttribute('aria-hidden');
  }

  function renderQuizQuestion () {
    if (quizState.current >= quizState.questions.length) {
      dom.quizModalBody.innerHTML = `
        <div style="text-align:center;padding:20px">
          <div class="quiz-score">Your Score: ${quizState.score}/${quizState.questions.length}</div>
          <p style="color:var(--text-body);margin:12px 0;font-size:0.82rem">
            ${quizState.score >= 8 ? 'Excellent! You\'re an ecosystem expert!' :
              quizState.score >= 5 ? 'Great job! Keep exploring!' :
              'Keep exploring the world\'s ecosystems to learn more!'}
          </p>
          <button class="quiz-btn" id="quizRestartBtn">Play Again</button>
        </div>
      `;
      const restartBtn = dom.quizModalBody.querySelector('#quizRestartBtn');
      if (restartBtn) restartBtn.addEventListener('click', startQuiz);
      return;
    }

    const q = quizState.questions[quizState.current];

    dom.quizModalBody.innerHTML = `
      <div class="quiz-question">
        <span style="font-size:0.7rem;color:var(--text-muted);display:block;margin-bottom:6px">
          Question ${quizState.current + 1} of ${quizState.questions.length}
        </span>
        ${q.question}
      </div>
      <div class="quiz-options" id="quizOptions">
        ${q.options.map(opt => `
          <button class="quiz-option" data-answer="${opt === q.answer}" ${quizState.answered ? 'disabled' : ''}>
            ${opt}
          </button>
        `).join('')}
      </div>
      ${quizState.answered ? `
        <div style="text-align:center;margin-top:12px">
          <button class="quiz-btn" id="quizNextBtn">
            ${quizState.current < quizState.questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        </div>
      ` : `
        <div class="quiz-score" style="display:none"></div>
      `}
    `;

    if (!quizState.answered) {
      dom.quizModalBody.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => handleQuizAnswer(btn));
      });
    } else {
      const nextBtn = dom.quizModalBody.querySelector('#quizNextBtn');
      if (nextBtn) nextBtn.addEventListener('click', () => {
        quizState.current++;
        quizState.answered = false;
        renderQuizQuestion();
      });
    }
  }

  function handleQuizAnswer (btn) {
    if (quizState.answered) return;
    quizState.answered = true;

    const isCorrect = btn.dataset.answer === 'true';
    if (isCorrect) quizState.score++;

    dom.quizModalBody.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = true;
      if (b.dataset.answer === 'true') b.classList.add('quiz-option--correct');
      else if (b === btn && !isCorrect) b.classList.add('quiz-option--wrong');
    });

    setTimeout(() => {
      const scoreDiv = dom.quizModalBody.querySelector('.quiz-score');
      if (scoreDiv) {
        scoreDiv.style.display = 'block';
        scoreDiv.textContent = `Score: ${quizState.score}/${quizState.current + 1}`;
      }
    }, 200);

    renderQuizQuestion();
  }

  /* ==========================================================
     14. ACHIEVEMENTS SYSTEM
     ========================================================== */

  function checkAchievements () {
    const newlyUnlocked = [];

    ACHIEVEMENT_DEFS.forEach(def => {
      if (!state.achievements.includes(def.id) && def.check(state)) {
        state.achievements.push(def.id);
        newlyUnlocked.push(def);
      }
    });

    newlyUnlocked.forEach(a => {
      showToast(`🏆 ${a.name}: ${a.desc}`, 'achievement');
      saveState();
    });
  }

  function showAchievementsModal () {
    dom.historyModal.setAttribute('hidden', '');
    dom.quizModal.setAttribute('hidden', '');

    let html = '<div class="achievement-grid">';

    ACHIEVEMENT_DEFS.forEach(def => {
      const unlocked = state.achievements.includes(def.id);
      html += `
        <div class="achievement-item ${unlocked ? 'achievement-item--unlocked' : 'achievement-item--locked'}">
          <div class="achievement-icon">${def.icon}</div>
          <div class="achievement-name">${def.name}</div>
          <div class="achievement-desc">${def.desc}</div>
        </div>
      `;
    });

    html += '</div>';
    html += `<div style="text-align:center;margin-top:14px;color:var(--text-muted);font-size:0.78rem">
      ${state.achievements.length}/${ACHIEVEMENT_DEFS.length} achievements unlocked
    </div>`;

    dom.historyModalBody.innerHTML = html;
    const achievementTitle = dom.historyModal.querySelector('#historyModalTitle') ||
      dom.historyModal.querySelector('h2');
    if (achievementTitle) achievementTitle.textContent = '🏆 Achievements';
    dom.historyModal.removeAttribute('hidden');
    dom.historyModal.removeAttribute('aria-hidden');
  }

  /* ==========================================================
     15. HISTORY TIMELINE
     ========================================================== */

  function showHistory () {
    const historyTitle = dom.historyModal.querySelector('#historyModalTitle') ||
      dom.historyModal.querySelector('h2');
    if (historyTitle) historyTitle.textContent = 'Exploration History';

    if (state.history.length === 0) {
      dom.historyModalBody.innerHTML = '<p class="history-empty">No locations explored yet. Start your journey by clicking a marker on the map!</p>';
    } else {
      let html = '<div class="history-timeline">';
      state.history.slice(0, 30).forEach(entry => {
        const color = getMarkerColor(entry.ecosystem);
        const time = new Date(entry.timestamp);
        const timeStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        html += `
          <div class="history-item">
            <span class="history-dot" style="background:${color}"></span>
            <div class="history-content">
              <div class="history-name">${entry.name}</div>
              <div class="history-meta">${ECOSYSTEM_LABELS[entry.ecosystem]} — ${getLocation(entry.id)?.continent || ''}</div>
              <div class="history-time">${timeStr}</div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      dom.historyModalBody.innerHTML = html;
    }

    dom.historyModal.removeAttribute('hidden');
    dom.historyModal.removeAttribute('aria-hidden');
  }

  /* ==========================================================
     16. BIODIVERSITY RANKINGS
     ========================================================== */

  function showRankings () {
    const rankingsTitle = dom.historyModal.querySelector('#historyModalTitle') ||
      dom.historyModal.querySelector('h2');
    if (rankingsTitle) rankingsTitle.textContent = 'Biodiversity Rankings';

    const sorted = [...LOCATIONS].sort((a, b) => b.biodiversity - a.biodiversity);
    const maxScore = sorted[0]?.biodiversity || 100;

    let html = '<div class="rankings-list">';

    sorted.forEach((loc, idx) => {
      const pct = (loc.biodiversity / maxScore) * 100;
      html += `
        <div class="ranking-item">
          <span class="ranking-number">#${idx + 1}</span>
          <div class="ranking-info">
            <div class="ranking-name">${loc.name}</div>
            <div class="ranking-score">${loc.biodiversity}/100 — ${ECOSYSTEM_LABELS[loc.ecosystem]}</div>
          </div>
          <div class="ranking-bar-wrapper">
            <div class="ranking-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    dom.historyModalBody.innerHTML = html;
    dom.historyModal.removeAttribute('hidden');
    dom.historyModal.removeAttribute('aria-hidden');
  }

  /* ==========================================================
     17. RANDOM FACT GENERATOR
     ========================================================== */

  function showRandomFact () {
    const entry = RANDOM_FACTS[Math.floor(Math.random() * RANDOM_FACTS.length)];
    showToast(`💡 ${entry.fact}`, 'fact');
  }

  /* ==========================================================
     18. TOAST NOTIFICATIONS
     ========================================================== */

  function showToast (message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'achievement' ? 'toast--achievement' : ''}`;
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ==========================================================
     19. THEME TOGGLE
     ========================================================== */

  function toggleTheme () {
    const isDay = state.theme === 'day';
    state.theme = isDay ? 'night' : 'day';
    dom.app.classList.toggle('app--day', !isDay);
    updateThemeIcons(!isDay);
    saveState();
  }

  function updateThemeIcons (isDay) {
    const sun = dom.themeToggleBtn.querySelector('.theme-icon-sun');
    const moon = dom.themeToggleBtn.querySelector('.theme-icon-moon');
    if (sun) sun.style.display = isDay ? 'none' : '';
    if (moon) moon.style.display = isDay ? '' : 'none';
  }

  /* ==========================================================
     20. BOOKMARKING
     ========================================================== */

  function toggleBookmark (id) {
    const idx = state.bookmarks.indexOf(id);
    if (idx >= 0) {
      state.bookmarks.splice(idx, 1);
      showToast('Bookmark removed');
    } else {
      state.bookmarks.push(id);
      showToast(`⭐ ${getLocation(id).name} bookmarked!`);
    }
    saveState();
    renderMarkers();

    // Update button state
    const isBookmarked = state.bookmarks.includes(id);
    dom.bookmarkBtn.classList.toggle('info-card-action-btn--active', isBookmarked);
    dom.bookmarkBtn.querySelector('span').textContent = isBookmarked ? 'Bookmarked' : 'Bookmark';
  }

  /* ==========================================================
     21. MAP ZOOM
     ========================================================== */

  function zoomIn () {
    state.mapZoomLevel = Math.min(state.mapZoomLevel + 0.15, 2);
    applyZoom();
  }

  function zoomOut () {
    state.mapZoomLevel = Math.max(state.mapZoomLevel - 0.15, 0.5);
    applyZoom();
  }

  function applyZoom () {
    dom.worldMap.style.transform = `scale(${state.mapZoomLevel})`;
    dom.worldMap.style.transformOrigin = 'center center';
    saveState();
  }

  /* ==========================================================
     22. INITIALIZATION
     ========================================================== */

  function shuffleArray (arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function init () {
    loadState();

    // Apply theme
    if (state.theme === 'day') {
      dom.app.classList.add('app--day');
      updateThemeIcons(true);
    }

    // Render markers
    renderMarkers();
    applyZoom();

    // Update stats
    updateStats();

    // Restore activity feed from history
    if (state.history.length > 0) {
      state.history.slice(0, 20).forEach(entry => {
        const loc = getLocation(entry.id);
        if (loc) addActivityItem(loc);
      });
    }

    // Init filters & search
    initFilters();
    initSearch();

    // Apply initial filters
    applyFilters();

    // Info card close
    dom.infoCardClose.addEventListener('click', hideInfoCard);

    // Bookmark
    dom.bookmarkBtn.addEventListener('click', () => {
      if (state.selectedLocation) toggleBookmark(state.selectedLocation);
    });

    // Compare button
    dom.compareBtn.addEventListener('click', () => {
      if (state.selectedLocation) {
        const others = LOCATIONS.filter(l => l.id !== state.selectedLocation);
        if (others.length > 0) {
          const pick = others[Math.floor(Math.random() * others.length)];
          showComparison(state.selectedLocation, pick.id);
        }
      }
    });

    // Map controls
    dom.zoomInBtn.addEventListener('click', zoomIn);
    dom.zoomOutBtn.addEventListener('click', zoomOut);
    dom.themeToggleBtn.addEventListener('click', toggleTheme);

    // Action bar
    dom.showHistoryBtn.addEventListener('click', showHistory);
    dom.showAchievementsBtn.addEventListener('click', showAchievementsModal);
    dom.showQuizBtn.addEventListener('click', startQuiz);
    dom.showRankingsBtn.addEventListener('click', showRankings);
    dom.randomFactBtn.addEventListener('click', showRandomFact);

    // Modal closes
    dom.compareModalClose.addEventListener('click', () => {
      dom.compareModal.setAttribute('hidden', '');
      dom.compareModal.setAttribute('aria-hidden', 'true');
    });
    dom.quizModalClose.addEventListener('click', () => {
      dom.quizModal.setAttribute('hidden', '');
      dom.quizModal.setAttribute('aria-hidden', 'true');
    });
    dom.historyModalClose.addEventListener('click', () => {
      dom.historyModal.setAttribute('hidden', '');
      dom.historyModal.setAttribute('aria-hidden', 'true');
    });

    // Close modals on overlay click
    [dom.compareModal, dom.quizModal, dom.historyModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.setAttribute('hidden', '');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    });

    // Keyboard: Escape closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        [dom.compareModal, dom.quizModal, dom.historyModal].forEach(modal => {
          if (!modal.hasAttribute('hidden')) {
            modal.setAttribute('hidden', '');
            modal.setAttribute('aria-hidden', 'true');
          }
        });
        hideInfoCard();
      }
    });

    // Welcome toast
    setTimeout(() => {
      showToast('🌍 Welcome to Nature Explorer Map! Click a marker to begin.', 'fact');
    }, 500);
  }

  /* ==========================================================
     23. START
     ========================================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
