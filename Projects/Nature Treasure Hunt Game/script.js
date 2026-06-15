(function () {
  'use strict';

  /* ==============================================================
     DATA
     ============================================================== */

  const ZONES = [
    { id: 'amazon',    name: 'Amazon Rainforest',    color: '#059669', difficulty: 1, cx: 200, cy: 240, points: [[160,220],[240,220],[250,280],[150,280]] },
    { id: 'sahara',    name: 'Sahara Desert',        color: '#d97706', difficulty: 2, cx: 310, cy: 190, points: [[270,170],[350,170],[360,230],[260,230]] },
    { id: 'coral',     name: 'Great Barrier Reef',   color: '#0284c7', difficulty: 1, cx: 510, cy: 270, points: [[480,240],[540,240],[550,310],[470,310]] },
    { id: 'himalaya',  name: 'Himalayas',            color: '#94a3b8', difficulty: 3, cx: 440, cy: 100, points: [[400,80],[480,80],[490,140],[390,140]] },
    { id: 'congo',     name: 'Congo Basin',          color: '#16a34a', difficulty: 2, cx: 300, cy: 250, points: [[270,230],[330,230],[340,280],[260,280]] },
    { id: 'arctict',   name: 'Arctic Tundra',        color: '#e2e8f0', difficulty: 3, cx: 370, cy: 30,  points: [[330,10],[410,10],[420,60],[320,60]] },
    { id: 'mada',      name: 'Madagascar',           color: '#65a30d', difficulty: 2, cx: 370, cy: 270, points: [[350,250],[390,250],[395,300],[345,300]] },
    { id: 'borneo',    name: 'Borneo Rainforest',    color: '#15803d', difficulty: 2, cx: 540, cy: 200, points: [[515,180],[565,180],[575,230],[505,230]] },
    { id: 'andaman',   name: 'Andaman Islands',      color: '#06b6d4', difficulty: 1, cx: 450, cy: 160, points: [[435,145],[465,145],[470,180],[430,180]] },
    { id: 'patagonia', name: 'Patagonia',            color: '#b45309', difficulty: 3, cx: 180, cy: 330, points: [[150,310],[210,310],[220,360],[140,360]] },
    { id: 'serengeti', name: 'Serengeti',            color: '#ca8a04', difficulty: 2, cx: 350, cy: 240, points: [[325,220],[375,220],[385,270],[315,270]] },
    { id: 'galapagos', name: 'Galapagos',            color: '#0891b2', difficulty: 1, cx: 60,  cy: 250, points: [[40,235],[80,235],[85,275],[35,275]] },
    { id: 'taiga',     name: 'Siberian Taiga',       color: '#1d4ed8', difficulty: 2, cx: 560, cy: 60,  points: [[520,40],[600,40],[610,100],[510,100]] },
    { id: 'sundarbans',name: 'Sundarbans Delta',     color: '#0f766e', difficulty: 3, cx: 420, cy: 190, points: [[395,175],[445,175],[450,215],[390,215]] },
    { id: 'alps',      name: 'European Alps',        color: '#64748b', difficulty: 2, cx: 270, cy: 130, points: [[245,115],[295,115],[305,155],[235,155]] },
    { id: 'atacama',   name: 'Atacama Desert',       color: '#a16207', difficulty: 3, cx: 120, cy: 280, points: [[95,260],[145,260],[155,310],[85,310]] },
    { id: 'newguinea', name: 'New Guinea',           color: '#166534', difficulty: 2, cx: 600, cy: 230, points: [[575,210],[625,210],[635,260],[565,260]] },
    { id: 'everglades',name: 'Everglades',           color: '#2e7d32', difficulty: 1, cx: 50,  cy: 190, points: [[30,170],[70,170],[80,215],[20,215]] }
  ];

  const TREASURES = (() => {
    const t = [];
    let id = 1;
    const push = (zoneId, name, clue, answer, fact, xp) => {
      t.push({ id: id++, zoneId, name, clue, answer: answer.toLowerCase().trim(), fact, xp });
    };
    push('amazon', 'Golden Tree Frog', 'I glow in the dark, my skin is bright, a poisonous gem of the rainforest night. What am I?', 'poison dart frog', 'Poison dart frogs are among the most toxic animals on Earth—one golden poison frog has enough toxin to kill 10 grown men. Indigenous peoples used their toxins to tip blowgun darts.', 150);
    push('amazon', 'Healing Leaf', 'My canopy layers stretch to the sky, where countless species live and die. I am often called the "lungs of the planet." What type of forest am I?', 'rainforest', 'The Amazon produces about 6% of the world\'s oxygen and is home to 10% of all known species on Earth, many still undiscovered.', 100);
    push('sahara', 'Desert Rose', 'I\'m found in an oasis, a gift in the sand. Without this precious resource, nothing can withstand. What am I?', 'water', 'Despite its harsh conditions, the Sahara Desert hosts over 500 plant species, 70 mammal species, and 90 bird species around its rare water sources.', 120);
    push('sahara', 'Sand Cat', 'By day I\'m scorching, by night I freeze. My golden dunes stretch beyond what eyes can see. What ecosystem is this?', 'desert', 'The Sahara is the largest hot desert in the world, covering 9.2 million km²—almost the entire African continent!', 100);
    push('coral', 'Neon Clownfish', 'I\'m a living city beneath the waves, home to a quarter of all marine life. Made by tiny architects, I am the ocean\'s most vibrant neighborhood. What am I?', 'coral reef', 'Coral reefs cover less than 1% of the ocean floor but support 25% of all marine species. The Great Barrier Reef is visible from space!', 150);
    push('coral', 'Sea Turtle\'s Path', 'I build enormous structures in the ocean, but I\'m not a fish—I\'m an animal. What am I?', 'coral', 'Corals are actually colonies of tiny living animals called polyps. Each polyp builds a limestone skeleton that forms the reef structure.', 100);
    push('himalaya', 'Snow Leopard Clue', 'I pierce the sky, crowned in eternal white. My glaciers feed rivers that give life to billions. What mountain range am I?', 'himalayas', 'The Himalayas contain the world\'s highest peak, Mount Everest at 8,849 m, and are the source of 10 major rivers that sustain over 1.5 billion people.', 180);
    push('himalaya', 'Yeti\'s Secret', 'I am found above the tree line, with fur as thick as winter\'s bite. What big cat is known as the "ghost of the mountains"?', 'snow leopard', 'Snow leopards can leap up to 15 meters—six times their body length—and their thick fur acts as a natural snowshoe on steep, icy terrain.', 120);
    push('congo', 'Gorilla\'s Haven', 'I\'m the second largest rainforest, dark and deep, where forest elephants silently creep. What river basin am I?', 'congo basin', 'The Congo Basin is the world\'s second-largest rainforest and the deepest known river, reaching depths of over 220 meters.', 140);
    push('congo', 'Okapi\'s Gift', 'I\'m the largest primate on Earth, a gentle giant of the forest floor. Known as the "gardener of the jungle," what am I?', 'gorilla', 'Gorillas share about 98.3% of their DNA with humans. They build fresh sleeping nests each night and are crucial seed dispersers for forest regeneration.', 110);
    push('arctict', 'Polar Bear\'s Secret', 'I\'m the coldest, most extreme landscape on Earth. My endless ice is home to seals, bears, and the midnight sun. Where am I?', 'arctic tundra', 'The Arctic tundra experiences winter temperatures as low as -50°C and summer temperatures up to 10°C. Permafrost lies beneath the surface year-round.', 160);
    push('arctict', 'Northern Lights Key', 'This massive white bear is the apex predator of the frozen north, perfectly adapted for life on sea ice. What is it?', 'polar bear', 'Polar bears have black skin under their white fur to absorb sunlight, and their fur is actually transparent—it only appears white because of light refraction.', 130);
    push('mada', 'Lemur\'s Treasure', 'I\'m an island of wonders found nowhere else. My lemurs sing, my baobabs touch the sky. What island am I?', 'madagascar', 'Madagascar split from Africa 88 million years ago, allowing its plants and animals to evolve in isolation—over 90% of its wildlife is found nowhere else on Earth.', 130);
    push('mada', 'Chameleon\'s Gem', 'With eyes that move independently and a tongue longer than my body, I\'m a master of disguise. What reptile am I?', 'chameleon', 'The smallest chameleon species (Brookesia nana) is only 22 mm long, while the largest (Parson\'s chameleon) can reach 69 cm.', 100);
    push('borneo', 'Orangutan\'s Gift', 'I\'m home to the oldest rainforest on Earth, shared by three countries and the "man of the forest." Where am I?', 'borneo', 'Borneo\'s rainforests are estimated to be 130 million years old—among the oldest in the world. They host over 15,000 plant species and 220 mammal species.', 140);
    push('borneo', 'Pitcher Plant Prize', 'This great ape is my closest relative in the trees. With my reddish-brown fur, I spend most of my life among branches. What am I?', 'orangutan', 'Orangutans share about 97% of their DNA with humans. Their name means "person of the forest" in Malay and Indonesian.', 110);
    push('andaman', 'Tribal Key', 'I\'m a chain of emerald islands in the Bay of Bengal, with pristine reefs and ancient tribal cultures. Where am I?', 'andaman islands', 'The Andaman Islands are home to some of the last uncontacted tribes on Earth, including the Sentinelese, who have lived in isolation for up to 60,000 years.', 100);
    push('andaman', 'Coconut Treasure', 'These islands were formed by fire beneath the sea. What type of island am I?', 'volcanic', 'The Andaman Islands are the peaks of a submerged mountain range created by tectonic plate activity and volcanic eruptions millions of years ago.', 80);
    push('patagonia', 'Condor\'s Secret', 'I\'m a land of glaciers, winds, and endless steppe at the southern tip of South America. What region am I?', 'patagonia', 'Patagonia spans over 1 million km² across Argentina and Chile, with some of the strongest winds on Earth reaching over 100 km/h regularly.', 160);
    push('patagonia', 'Guanaco\'s Path', 'I\'m the world\'s largest flying bird, soaring on Andean thermals with a wingspan that casts a three-meter shadow. What am I?', 'andean condor', 'The Andean condor is a national symbol across several South American countries and can soar up to 5,500 meters without flapping its wings for hours.', 120);
    push('serengeti', 'Lion\'s Mane', 'I\'m a vast savanna where wildebeest thunder across the plains and acacias silhouette the sunset. What ecosystem am I?', 'serengeti', 'The Serengeti hosts the largest terrestrial mammal migration on Earth—over 1.5 million wildebeest and 250,000 zebras travel 800 km each year.', 150);
    push('serengeti', 'Baobab Secret', 'I\'m known as the king of the savanna, but I don\'t have a mane. My roar can be heard from 8 km away. What big cat am I?', 'lion', 'Lions are the only social cats, living in prides of up to 30 individuals. A lion\'s roar can reach 114 decibels.', 110);
    push('galapagos', 'Tortoise\'s Wisdom', 'I\'m an archipelago that inspired a theory of evolution. My giant tortoises and marine iguanas exist nowhere else. Where am I?', 'galapagos islands', 'The Galapagos Islands are home to 13 species of Darwin\'s finches, whose beak adaptations helped Charles Darwin develop his theory of natural selection.', 140);
    push('galapagos', 'Blue-Footed Booby', 'I can weigh over 250 kg and live for more than 150 years. I\'m the gentle giant of these volcanic islands. What am I?', 'giant tortoise', 'Galapagos giant tortoises can survive up to a year without food or water, an adaptation to the islands\' harsh dry seasons. They can weigh up to 417 kg.', 100);
    push('taiga', 'Amur Tiger Key', 'I\'m the largest biome on land, a forest of cone-bearing trees stretching across continents. My winters are long and bitterly cold. What am I?', 'taiga', 'The taiga (boreal forest) is the world\'s largest terrestrial biome, covering 17 million km²—about 11% of Earth\'s land surface—mostly in Russia and Canada.', 150);
    push('taiga', 'Wolf Pack Clue', 'This striped hunter of the far east is the largest cat in the world, adapted to snowy forests. What is it?', 'siberian tiger', 'The Siberian (Amur) tiger is the largest wild cat species, with males reaching up to 300 kg and 3.5 meters in length from nose to tail.', 120);
    push('sundarbans', 'Royal Bengal Clue', 'I\'m a mangrove labyrinth where land meets sea, home to a swimming cat that hunts in the delta. What am I?', 'sundarbans', 'The Sundarbans is the largest mangrove forest in the world, covering 10,000 km² across Bangladesh and India. It is a UNESCO World Heritage Site.', 170);
    push('sundarbans', 'Mangrove\'s Secret', 'This fearless feline of the delta is the only cat species that regularly swims in saltwater and hunts in mangrove creeks. What is it?', 'bengal tiger', 'Sundarbans tigers are known to swim up to 10 km across rivers and have adapted to a semi-aquatic lifestyle unique among tigers.', 130);
    push('alps', 'Edelweiss Key', 'I\'m a crescent-shaped mountain range across eight countries, where ibex leap on rocky peaks and glaciers carve the landscape. Where am I?', 'alps', 'The Alps cover 1,200 km across Europe and contain about 4,000 glaciers. The Matterhorn, one of the most iconic peaks, stands at 4,478 m.', 140);
    push('alps', 'Chamois Clue', 'A flower of high altitudes, I\'m a symbol of rugged beauty and adventure. I grow on rocky slopes above the treeline. What flower am I?', 'edelweiss', 'Edelweiss (Leontopodium alpinum) is protected in many European countries and has become an iconic symbol of alpine exploration and mountaineering.', 90);
    push('atacama', 'Geoglyph Riddle', 'I\'m the driest place on Earth, where no rain has fallen for decades. Yet life thrives—microbes, flamingos, and cacti call me home. Where am I?', 'atacama desert', 'The Atacama Desert is so dry that some weather stations have never recorded rainfall. Despite this, over 1,000 plant species have adapted to survive there.', 160);
    push('atacama', 'Flamingo\'s Oasis', 'I\'m a massive figure carved into a desert hillside by ancient hands. What ancient symbol stretches across this arid landscape?', 'geoglyph', 'The Atacama is home to the Atacama Giant, the largest prehistoric human figure in the world at 119 meters long, carved into a hillside by the Chinchorro people.', 100);
    push('newguinea', 'Bird of Paradise', 'I\'m a tropical island with over 800 languages and some of the most spectacular birds on the planet. What island am I?', 'new guinea', 'New Guinea is the world\'s second-largest island and has the highest linguistic diversity on Earth—over 800 languages spoken by just 11 million people.', 140);
    push('newguinea', 'Tree Kangaroo Key', 'My plumage is the most brilliant of any bird. My dance is mesmerizing. In the forests of New Guinea, I am the ultimate performer. What am I?', 'bird of paradise', 'Birds of paradise have the most elaborate courtship dances in the animal kingdom, with some species performing for hours to attract a mate.', 110);
    push('everglades', 'Alligator\'s Secret', 'I\'m a slow-moving river of grass, where crocodiles and alligators coexist and panthers roam under subtropical skies. What am I?', 'everglades', 'The Everglades is the only place on Earth where alligators and crocodiles coexist. It spans 1.5 million acres and is often called the "River of Grass."', 130);
    push('everglades', 'Manatee\'s Gem', 'I\'m a reptile that has survived since the time of dinosaurs. With a powerful tail and a mouth full of teeth, I\'m the ruler of this watery wilderness. What am I?', 'american alligator', 'Alligators have been around for 37 million years. They can go through up to 3,000 teeth in a lifetime, replacing each tooth as it wears down.', 100);
    return t;
  })();

  const QUIZZES = (() => {
    const q = [];
    let id = 1;
    const push = (zoneId, question, options, correctIndex, fact) => {
      q.push({ id: id++, zoneId, question, options, correctIndex, fact });
    };
    push('amazon', 'What percentage of the world\'s oxygen does the Amazon produce?', ['About 2%', 'About 6%', 'About 15%', 'About 20%'], 1, 'The Amazon produces about 6% of the world\'s oxygen, though this number is often debated among scientists.');
    push('amazon', 'How many known species call the Amazon home?', ['1 million', '3 million', '5 million', '10 million'], 1, 'The Amazon is estimated to have 3 million known species, with many more still undiscovered.');
    push('sahara', 'What is the approximate area of the Sahara Desert?', ['5.2 million km²', '7.1 million km²', '9.2 million km²', '11 million km²'], 2, 'The Sahara covers 9.2 million km², nearly the entire African continent.');
    push('sahara', 'Which animal is known as the "ship of the desert"?', ['Horse', 'Camel', 'Donkey', 'Llama'], 1, 'Camels can drink up to 40 gallons of water at once and their humps store fat, not water.');
    push('coral', 'What percentage of marine species live in coral reefs?', ['10%', '15%', '25%', '50%'], 2, 'Coral reefs cover less than 1% of the ocean floor but support a quarter of all marine species.');
    push('coral', 'What tiny animals build coral reefs?', ['Sponges', 'Polyps', 'Anemones', 'Jellyfish'], 1, 'Each coral is a colony of tiny polyps that secrete calcium carbonate to form their hard skeletons.');
    push('himalaya', 'How many people rely on rivers fed by Himalayan glaciers?', ['500 million', '1 billion', '1.5 billion', '2 billion'], 2, 'The Himalayas feed 10 major rivers that sustain over 1.5 billion people across Asia.');
    push('himalaya', 'What adaptation helps snow leopards walk on deep snow?', ['Sharp claws', 'Large paws', 'Long tail', 'Thick whiskers'], 1, 'Snow leopards have large, fur-covered paws that act as natural snowshoes.');
    push('congo', 'What is the maximum depth of the Congo River?', ['80 m', '120 m', '220 m', '350 m'], 2, 'The Congo River reaches depths of over 220 meters, making it the deepest river in the world.');
    push('congo', 'What percentage of DNA do gorillas share with humans?', ['95%', '96.5%', '98.3%', '99%'], 2, 'Gorillas share about 98.3% of their DNA with humans, making them one of our closest relatives.');
    push('arctict', 'What is the lowest winter temperature in the Arctic tundra?', ['-30°C', '-40°C', '-50°C', '-60°C'], 2, 'Arctic winter temperatures can drop to -50°C, with permafrost beneath the surface year-round.');
    push('arctict', 'What color is a polar bear\'s skin under its fur?', ['White', 'Pink', 'Black', 'Gray'], 2, 'Polar bears have black skin to absorb sunlight, and their fur is actually transparent.');
    push('mada', 'What percentage of Madagascar\'s wildlife is found nowhere else?', ['50%', '70%', '90%', '99%'], 2, 'Over 90% of Madagascar\'s wildlife is endemic, found nowhere else on Earth.');
    push('mada', 'How long ago did Madagascar separate from Africa?', ['20 million years', '50 million years', '88 million years', '140 million years'], 2, 'Madagascar\'s 88-million-year isolation allowed unique evolution of its plants and animals.');
    push('borneo', 'How old are Borneo\'s rainforests?', ['30 million years', '70 million years', '100 million years', '130 million years'], 3, 'Borneo\'s rainforests are about 130 million years old, among the oldest in the world.');
    push('borneo', 'What does "orangutan" mean in Malay?', ['Red ape', 'Forest man', 'Person of the forest', 'Tree dweller'], 2, 'The name "orangutan" literally means "person of the forest" in Malay and Indonesian.');
    push('everglades', 'What is the Everglades often called?', ['River of Grass', 'Ocean of Reeds', 'Sea of Flowers', 'Lake of Trees'], 0, 'The Everglades is often called the "River of Grass" for its slow-moving water flowing through sawgrass marshes.');
    push('everglades', 'The Everglades is the only place where these two reptiles coexist:', ['Snakes and lizards', 'Alligators and crocodiles', 'Turtles and tortoises', 'Frogs and toads'], 1, 'The Everglades is the only place on Earth where both alligators and crocodiles live together.');
    push('alps', 'How many countries do the Alps span?', ['4', '6', '8', '10'], 2, 'The Alps span 1,200 km across eight European countries: France, Monaco, Italy, Switzerland, Liechtenstein, Germany, Austria, and Slovenia.');
    push('alps', 'How many glaciers are in the Alps?', ['1,000', '2,000', '4,000', '8,000'], 2, 'The Alps contain about 4,000 glaciers, though many are retreating due to climate change.');
    push('serengeti', 'How many wildebeest participate in the Great Migration?', ['500,000', '1 million', '1.5 million', '3 million'], 2, 'Over 1.5 million wildebeest and 250,000 zebras participate in the annual Serengeti migration.');
    push('serengeti', 'How far can a lion\'s roar be heard?', ['3 km', '5 km', '8 km', '12 km'], 2, 'A lion\'s roar can be heard from up to 8 km away and can reach 114 decibels.');
    push('sundarbans', 'What is the area of the Sundarbans mangrove forest?', ['5,000 km²', '8,000 km²', '10,000 km²', '15,000 km²'], 2, 'The Sundarbans is the largest mangrove forest in the world at about 10,000 km².');
    push('patagonia', 'How fast do winds regularly blow in Patagonia?', ['50 km/h', '80 km/h', '100 km/h', '120 km/h'], 2, 'Patagonian winds regularly exceed 100 km/h, shaping the landscape and vegetation.');
    push('taiga', 'What percentage of Earth\'s land is covered by the taiga?', ['5%', '8%', '11%', '15%'], 2, 'The taiga covers about 11% of Earth\'s land, making it the largest terrestrial biome.');
    push('taiga', 'How much does the largest Siberian tiger weigh?', ['200 kg', '250 kg', '300 kg', '350 kg'], 2, 'Male Siberian tigers can reach up to 300 kg and are the largest of all wild cats.');
    push('atacama', 'What is the Atacama Giant?', ['A mountain peak', 'A volcano', 'A prehistoric geoglyph', 'A rock formation'], 2, 'The Atacama Giant is a 119-meter-long prehistoric human figure carved into a desert hillside.');
    push('galapagos', 'How many species of Darwin\'s finches are in the Galapagos?', ['8', '10', '13', '15'], 2, 'Thirteen species of Darwin\'s finches exist in the Galapagos, with distinct beak adaptations.');
    return q;
  })();

  const ACHIEVEMENTS = [
    { id: 'first_treasure', name: 'First Discovery', desc: 'Find your first treasure', icon: '🗺️', check: s => s.foundTreasures >= 1 },
    { id: 'five_treasures', name: 'Treasure Hunter', desc: 'Find 5 treasures', icon: '🔦', check: s => s.foundTreasures >= 5 },
    { id: 'ten_treasures', name: 'Expert Explorer', desc: 'Find 10 treasures', icon: '🧭', check: s => s.foundTreasures >= 10 },
    { id: 'twenty_treasures', name: 'Legendary Adventurer', desc: 'Find 20 treasures', icon: '👑', check: s => s.foundTreasures >= 20 },
    { id: 'all_treasures', name: 'Treasure Master', desc: 'Find all treasures', icon: '💎', check: s => s.foundTreasures >= TREASURES.length },
    { id: 'first_quiz', name: 'Quick Learner', desc: 'Complete your first nature challenge', icon: '📖', check: s => s.completedQuizzes >= 1 },
    { id: 'five_quizzes', name: 'Nature Scholar', desc: 'Complete 5 nature challenges', icon: '🎓', check: s => s.completedQuizzes >= 5 },
    { id: 'ten_quizzes', name: 'Knowledge Keeper', desc: 'Complete 10 nature challenges', icon: '🏆', check: s => s.completedQuizzes >= 10 },
    { id: 'explorer_5', name: 'Globe Trotter', desc: 'Explore 5 different zones', icon: '🌍', check: s => s.exploredZones >= 5 },
    { id: 'explorer_10', name: 'World Explorer', desc: 'Explore 10 different zones', icon: '🌏', check: s => s.exploredZones >= 10 },
    { id: 'explorer_all', name: 'Nature\'s Champion', desc: 'Explore all zones', icon: '🌟', check: s => s.exploredZones >= ZONES.length },
    { id: 'level_5', name: 'Seasoned Explorer', desc: 'Reach Level 5', icon: '⭐', check: s => getLevel(s.totalXp) >= 5 },
    { id: 'level_10', name: 'Master Naturalist', desc: 'Reach Level 10', icon: '🌿', check: s => getLevel(s.totalXp) >= 10 },
    { id: 'score_1000', name: 'Century Club', desc: 'Earn 1,000 XP', icon: '💚', check: s => s.totalXp >= 1000 },
    { id: 'score_2500', name: 'Elite Explorer', desc: 'Earn 2,500 XP', icon: '🔥', check: s => s.totalXp >= 2500 },
  ];

  /* ==============================================================
     STATE
     ============================================================== */

  const STORAGE_KEY = 'nth_game_state';
  function defaultState() {
    return {
      foundTreasures: [],
      completedQuizzes: [],
      totalXp: 0,
      score: 0,
      exploredZones: [],
      unlockedAchievements: [],
      activityLog: [],
      usedClues: []
    };
  }
  let state = loadState();
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    } catch { return defaultState(); }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function getLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  function getXpForLevel(level) {
    return (level - 1) * (level - 1) * 100;
  }

  function getZone(id) { return ZONES.find(z => z.id === id); }
  function getZoneTreasures(zoneId) { return TREASURES.filter(t => t.zoneId === zoneId); }
  function getZoneQuizzes(zoneId) { return QUIZZES.filter(q => q.zoneId === zoneId); }
  function nextClue(zoneId) {
    const zoneT = getZoneTreasures(zoneId).filter(t => !state.foundTreasures.includes(t.id) && !state.usedClues.includes(t.id));
    if (zoneT.length === 0) return null;
    return zoneT[Math.floor(Math.random() * zoneT.length)];
  }

  /* ==============================================================
     DOM REFS
     ============================================================== */

  const $ = id => document.getElementById(id);
  const panelLeft = document.querySelector('.panel--left');
  const zonesGroup = $('zonesGroup');
  const treasuresGroup = $('treasuresGroup');
  const gameMap = $('gameMap');
  const activeRegion = $('activeRegion');
  const activeDifficulty = $('activeDifficulty');
  const activeFound = $('activeFound');
  const activeXp = $('activeXp');
  const playerLevel = $('playerLevel');
  const xpFill = $('xpFill');
  const xpText = $('xpText');
  const statTreasures = $('statTreasures');
  const statChallenges = $('statChallenges');
  const statFacts = $('statFacts');
  const missionCard = $('missionCard');
  const clueBox = $('clueBox');
  const cluePrompt = $('cluePrompt');
  const activityFeed = $('activityFeed');
  const toastContainer = $('toastContainer');

  const clueModal = $('clueModal');
  const clueModalTitle = $('clueModalTitle');
  const clueModalBody = $('clueModalBody');
  const clueModalClose = $('clueModalClose');
  const quizModal = $('quizModal');
  const quizModalTitle = $('quizModalTitle');
  const quizModalBody = $('quizModalBody');
  const quizModalClose = $('quizModalClose');
  const resultModal = $('resultModal');
  const resultModalBody = $('resultModalBody');
  const infoModal = $('infoModal');
  const infoModalTitle = $('infoModalTitle');
  const infoModalBody = $('infoModalBody');
  const infoModalClose = $('infoModalClose');

  let activeZoneId = null;
  let currentClue = null;

  /* ==============================================================
     RENDER MAP
     ============================================================== */

  function renderMap() {
    zonesGroup.innerHTML = '';
    treasuresGroup.innerHTML = '';

    ZONES.forEach(z => {
      const isExplored = state.exploredZones.includes(z.id);
      const pointsStr = z.points.map(p => p.join(',')).join(' ');
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.dataset.zoneId = z.id;

      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', pointsStr);
      poly.setAttribute('fill', z.color);
      poly.setAttribute('fill-opacity', isExplored ? '0.15' : '0.25');
      poly.setAttribute('stroke', isExplored ? '#475569' : z.color);
      poly.setAttribute('stroke-width', isExplored ? '0.8' : '1.2');
      poly.classList.add('zone-path');
      if (isExplored) poly.classList.add('zone-path--explored');
      poly.setAttribute('tabindex', '0');
      poly.setAttribute('role', 'button');
      poly.setAttribute('aria-label', `${z.name}${isExplored ? ' (explored)' : ''} — Difficulty ${z.difficulty}`);
      poly.addEventListener('click', () => selectZone(z.id));
      poly.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectZone(z.id); }
      });
      g.appendChild(poly);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', z.cx);
      label.setAttribute('y', z.cy);
      label.textContent = z.name;
      label.classList.add('zone-label');
      if (activeZoneId === z.id || isExplored) label.classList.add('zone-label--visible');
      g.appendChild(label);

      zonesGroup.appendChild(g);
    });

    renderTreasures();
  }

  function renderTreasures() {
    treasuresGroup.innerHTML = '';
    TREASURES.forEach(t => {
      const zone = getZone(t.zoneId);
      if (!zone) return;
      const found = state.foundTreasures.includes(t.id);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const baseX = zone.cx + (t.id % 5 - 2) * 8;
      const baseY = zone.cy + (Math.floor(t.id / 3) % 4 - 1.5) * 8 + 12;

      g.classList.add('treasure-marker');
      if (found) g.classList.add('treasure-marker--found');
      g.dataset.treasureId = t.id;
      g.setAttribute('tabindex', found ? '-1' : '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${found ? 'Found: ' : 'Hidden: '}${t.name}`);

      // glow
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('cx', baseX);
      glow.setAttribute('cy', baseY);
      glow.setAttribute('r', '7');
      glow.setAttribute('fill', 'url(#treasureGlow)');
      glow.classList.add('treasure-glow');
      g.appendChild(glow);

      // icon
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      icon.setAttribute('cx', baseX);
      icon.setAttribute('cy', baseY);
      icon.setAttribute('r', found ? '4' : '3');
      icon.setAttribute('fill', found ? '#64748b' : '#facc15');
      icon.setAttribute('stroke', found ? 'none' : '#f59e0b');
      icon.setAttribute('stroke-width', '1');
      icon.classList.add('treasure-icon');
      g.appendChild(icon);

      if (!found) {
        g.addEventListener('click', () => openClueModal(t));
        g.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openClueModal(t); }
        });
      }

      treasuresGroup.appendChild(g);
    });
    // Update header
    const foundCount = state.foundTreasures.length;
    activeFound.textContent = `${foundCount} / ${TREASURES.length}`;
  }

  function selectZone(zoneId) {
    activeZoneId = zoneId;
    const zone = getZone(zoneId);
    if (!zone) return;

    // Mark explored
    if (!state.exploredZones.includes(zoneId)) {
      state.exploredZones.push(zoneId);
      addActivity(zone.name, zone.color);
      checkAchievements();
    }
    saveState();

    // Update header
    activeRegion.textContent = zone.name;
    const diffStr = ['Easy', 'Medium', 'Hard'][zone.difficulty - 1] || 'Unknown';
    activeDifficulty.textContent = diffStr;
    const xpVal = zone.difficulty * 20;
    activeXp.textContent = `+${xpVal} XP`;

    // Mission card
    missionCard.innerHTML = '';
    const mc = document.createElement('div');
    mc.className = 'mission-content';
    const zoneT = getZoneTreasures(zoneId).filter(t => !state.foundTreasures.includes(t.id));
    const zoneQ = getZoneQuizzes(zoneId);
    mc.innerHTML = `<strong>${zone.name}</strong><br>Explore the ${zone.name} to discover <strong>${zoneT.length} hidden treasures</strong> and complete <strong>${zoneQ.length} nature challenges</strong>.`;
    missionCard.appendChild(mc);

    // Update clue
    updateClue(zoneId);

    // Render labels
    document.querySelectorAll('.zone-label').forEach(l => l.classList.remove('zone-label--visible'));
    const labels = zonesGroup.querySelectorAll('.zone-label');
    labels.forEach((l, i) => {
      const z = ZONES[i];
      if (z && (z.id === zoneId || state.exploredZones.includes(z.id))) l.classList.add('zone-label--visible');
    });

    // Re-render treasures
    renderTreasures();
  }

  function updateClue(zoneId) {
    const next = nextClue(zoneId);
    if (!next) {
      clueBox.innerHTML = '';
      const span = document.createElement('span');
      span.className = 'clue-text';
      span.textContent = '✨ All treasures found in this zone!';
      clueBox.appendChild(span);
      cluePrompt.textContent = '';
      currentClue = null;
      return;
    }
    currentClue = next;
    clueBox.innerHTML = '';
    const span = document.createElement('span');
    span.className = 'clue-text';
    span.textContent = `"${next.clue}"`;
    clueBox.appendChild(span);
    cluePrompt.textContent = '';
  }

  /* ==============================================================
     CLUE MODAL
     ============================================================== */

  function openClueModal(treasure) {
    if (state.foundTreasures.includes(treasure.id)) return;
    clueModalTitle.textContent = '🔍 Hidden Treasure';
    const clueIndex = state.usedClues.filter(id => id === treasure.id).length;
    const maxAttempts = 3;

    let html = `<p class="clue-text-display">"${treasure.clue}"</p>
      <p class="clue-progress">Attempt ${Math.min(clueIndex + 1, maxAttempts)} of ${maxAttempts}</p>`;

    if (clueIndex >= maxAttempts) {
      // Show answer and fact directly
      html += `<div class="clue-result clue-result--correct"><strong>Answer:</strong> ${treasure.answer.charAt(0).toUpperCase() + treasure.answer.slice(1)}</div>
        <div class="clue-result clue-result--correct" style="margin-top:8px">${treasure.fact}</div>
        <div style="text-align:center;margin-top:14px"><button class="result-btn" data-dismiss-modal>Continue</button></div>`;
    } else {
      html += `<div class="clue-input-area">
        <input type="text" class="clue-input" id="clueAnswerInput" placeholder="Type your answer..." maxlength="80" autocomplete="off">
        <button class="clue-submit" id="clueSubmitBtn">Submit</button>
      </div>
      <div id="clueResultArea"></div>
      <p class="clue-progress" style="margin-top:8px">Tip: Think about the ecosystem and key species!</p>`;
    }

    clueModalBody.innerHTML = html;
    clueModal.removeAttribute('hidden');
    clueModal.setAttribute('aria-hidden', 'false');

    if (clueIndex < maxAttempts) {
      const input = $('clueAnswerInput');
      const submit = $('clueSubmitBtn');
      if (input) {
        input.focus();
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') submitAnswer(treasure);
        });
      }
      if (submit) submit.addEventListener('click', () => submitAnswer(treasure));
    }

    // Dismiss
    clueModalBody.querySelector('[data-dismiss-modal]')?.addEventListener('click', closeAllModals);

    // Close button & overlay click
    clueModalClose.onclick = closeAllModals;
    clueModal.addEventListener('click', e => { if (e.target === clueModal) closeAllModals(); });
  }

  function submitAnswer(treasure) {
    const input = $('clueAnswerInput');
    const submit = $('clueSubmitBtn');
    const resultArea = $('clueResultArea');
    if (!input || !resultArea) return;

    const answer = input.value.trim().toLowerCase();
    if (!answer) return;

    // Track used clue
    if (!state.usedClues.includes(treasure.id)) state.usedClues.push(treasure.id);
    const clueIndex = state.usedClues.filter(id => id === treasure.id).length;

    const isCorrect = answer === treasure.answer;
    const maxAttempts = 3;

    if (isCorrect) {
      // Found!
      state.foundTreasures.push(treasure.id);
      const levelBefore = getLevel(state.totalXp);
      state.totalXp += treasure.xp;
      // Score is tracked via totalXp
      const levelAfter = getLevel(state.totalXp);

      resultArea.innerHTML = `<div class="clue-result clue-result--correct">
        <strong>Correct!</strong> You found: ${treasure.name} (+${treasure.xp} XP)
      </div>
      <div class="clue-result clue-result--correct" style="margin-top:8px">${treasure.fact}</div>
      <div style="text-align:center;margin-top:12px"><button class="result-btn" data-dismiss-modal>Awesome!</button></div>`;

      submit.disabled = true;
      input.disabled = true;

      // Log activity
      state.activityLog.push({ type: 'treasure', text: `Found "${treasure.name}" in ${getZone(treasure.zoneId)?.name || 'unknown'} (+${treasure.xp} XP)` });
      addActivity(`🎁 Found "${treasure.name}"`, '#facc15');
      checkAchievements();

      // Show level up
      if (levelAfter > levelBefore) {
        showToast(`🎉 Level Up! You are now Level ${levelAfter}!`, '#f59e0b');
      }

      renderTreasures();
      if (activeZoneId) selectZone(activeZoneId); // refresh
      updateDashboard();
      saveState();

      resultArea.querySelector('[data-dismiss-modal]')?.addEventListener('click', () => {
        closeAllModals();
        if (activeZoneId && nextClue(activeZoneId)) {
          showToast(`💡 ${getZone(activeZoneId)?.name} still has treasures to find!`, '#34d399');
        }
      });
    } else {
      if (clueIndex >= maxAttempts) {
        // Out of attempts
        const levelBefore = getLevel(state.totalXp);
        state.totalXp += Math.floor(treasure.xp * 0.3);
        state.foundTreasures.push(treasure.id);
        const levelAfter = getLevel(state.totalXp);

        resultArea.innerHTML = `<div class="clue-result clue-result--wrong">
          Out of attempts! The answer was: <strong>${treasure.answer.charAt(0).toUpperCase() + treasure.answer.slice(1)}</strong><br>
          <span style="font-size:0.76rem">(Partial credit: +${Math.floor(treasure.xp * 0.3)} XP)</span>
        </div>
        <div class="clue-result clue-result--correct" style="margin-top:8px">${treasure.fact}</div>
        <div style="text-align:center;margin-top:12px"><button class="result-btn" data-dismiss-modal>Okay</button></div>`;

        submit.disabled = true;
        input.disabled = true;

        state.activityLog.push({ type: 'treasure', text: `Revealed "${treasure.name}" in ${getZone(treasure.zoneId)?.name} (+${Math.floor(treasure.xp * 0.3)} XP)` });
        addActivity(`📖 Revealed "${treasure.name}"`, '#64748b');
        checkAchievements();

        if (levelAfter > levelBefore) {
          showToast(`🎉 Level Up! You are now Level ${levelAfter}!`, '#f59e0b');
        }

        renderTreasures();
        if (activeZoneId) selectZone(activeZoneId);
        updateDashboard();
        saveState();

        resultArea.querySelector('[data-dismiss-modal]')?.addEventListener('click', closeAllModals);
      } else {
        resultArea.innerHTML = `<div class="clue-result clue-result--wrong">
          ❌ Not quite. Try again! (${clueIndex}/${maxAttempts} used)
        </div>`;
        input.value = '';
        input.focus();
      }
    }
    updateDashboard();
  }

  /* ==============================================================
     QUIZ MODAL
     ============================================================== */

  function openQuizModal(zoneId) {
    const zoneQuizzes = getZoneQuizzes(zoneId).filter(q => !state.completedQuizzes.includes(q.id));
    if (zoneQuizzes.length === 0) {
      openResultModal('📚', 'All Done!', 'You\'ve completed all the nature challenges in this zone!', 0, null);
      return;
    }
    const quiz = zoneQuizzes[Math.floor(Math.random() * zoneQuizzes.length)];
    quizModalTitle.textContent = `🌿 Nature Challenge — ${getZone(zoneId)?.name || ''}`;

    let html = `<p class="quiz-question">${quiz.question}</p><div class="quiz-options">`;
    quiz.options.forEach((opt, i) => {
      html += `<button class="quiz-option" data-opt-index="${i}" disabled="${i === quiz.correctIndex ? '' : ''}" ${activeZoneId !== zoneId ? 'disabled' : ''}>${opt}</button>`;
    });
    html += '</div><div id="quizResultArea"></div>';

    quizModalBody.innerHTML = html;
    quizModal.removeAttribute('hidden');
    quizModal.setAttribute('aria-hidden', 'false');

    const options = quizModalBody.querySelectorAll('.quiz-option');
    options.forEach(btn => {
      btn.removeAttribute('disabled');
      btn.addEventListener('click', () => handleQuizAnswer(quiz, parseInt(btn.dataset.optIndex), options));
    });

    quizModalClose.onclick = closeAllModals;
    quizModal.addEventListener('click', e => { if (e.target === quizModal) closeAllModals(); });
  }

  function handleQuizAnswer(quiz, selected, options) {
    const isCorrect = selected === quiz.correctIndex;
    options.forEach((btn, i) => {
      btn.disabled = true;
      if (i === quiz.correctIndex) btn.classList.add('quiz-option--correct');
      if (i === selected && !isCorrect) btn.classList.add('quiz-option--wrong');
    });

    state.completedQuizzes.push(quiz.id);
    const xpReward = isCorrect ? 80 : 20;
    const levelBefore = getLevel(state.totalXp);
    state.totalXp += xpReward;

    if (isCorrect) {
      state.activityLog.push({ type: 'quiz', text: `Correct: "${quiz.question.slice(0, 40)}..." (+${xpReward} XP)` });
      addActivity(`✅ Correct challenge answer! (+${xpReward} XP)`, '#34d399');
    } else {
      state.activityLog.push({ type: 'quiz', text: `Challenge attempt: "${quiz.question.slice(0, 40)}..." (+${xpReward} XP)` });
      addActivity(`📝 Challenge completed (+${xpReward} XP)`, '#64748b');
    }

    const levelAfter = getLevel(state.totalXp);
    if (levelAfter > levelBefore) {
      showToast(`🎉 Level Up! You are now Level ${levelAfter}!`, '#f59e0b');
    }

    state.factsUnlocked = (state.factsUnlocked || 0) + 1;

    const resultArea = $('quizResultArea');
    if (resultArea) {
      resultArea.innerHTML = `<div class="clue-result ${isCorrect ? 'clue-result--correct' : 'clue-result--wrong'}">
        ${isCorrect ? '✅ Correct!' : '❌ Not quite!'} ${isCorrect ? '' : `The answer was: <strong>${quiz.options[quiz.correctIndex]}</strong>`}<br>
        <span style="font-size:0.76rem">+${xpReward} XP</span>
      </div>
      <div class="clue-result clue-result--correct" style="margin-top:8px">${quiz.fact}</div>
      <div style="text-align:center;margin-top:12px">
        <button class="result-btn" data-continue>Continue</button>
      </div>`;

      resultArea.querySelector('[data-continue]')?.addEventListener('click', closeAllModals);
    }

    // Update stat
    statChallenges.textContent = state.completedQuizzes.length;
    checkAchievements();
    updateDashboard();
    saveState();
  }

  /* ==============================================================
     RESULT / INFO MODALS
     ============================================================== */

  function openResultModal(icon, title, desc, xp, fact) {
    let html = `<div class="result-icon">${icon}</div>
      <div class="result-title">${title}</div>
      <div class="result-desc">${desc}</div>`;
    if (xp > 0) html += `<div class="result-xp">+${xp} XP</div>`;
    if (fact) html += `<div class="result-fact">💡 ${fact}</div>`;
    html += '<button class="result-btn" data-dismiss>Great!</button>';
    resultModalBody.innerHTML = html;
    resultModal.removeAttribute('hidden');
    resultModal.setAttribute('aria-hidden', 'false');
    resultModalBody.querySelector('[data-dismiss]')?.addEventListener('click', closeAllModals);
    resultModal.addEventListener('click', e => { if (e.target === resultModal) closeAllModals(); });
  }

  function openInfoModal(zoneId) {
    const zone = getZone(zoneId);
    if (!zone) return;
    infoModalTitle.textContent = `🌍 ${zone.name}`;
    const html = `<div class="fact-content">
      <div class="fact-icon">${zone.difficulty <= 1 ? '🌿' : zone.difficulty === 2 ? '🌲' : '🏔️'}</div>
      <div class="fact-title">${zone.name}</div>
      <div class="fact-desc">Difficulty: ${['Easy', 'Medium', 'Hard'][zone.difficulty - 1]} | Treasures: ${getZoneTreasures(zoneId).length} | Quizzes: ${getZoneQuizzes(zoneId).length}</div>
      <ul class="fact-list">
        <li>${getZoneTreasures(zoneId).length} hidden treasures to discover</li>
        <li>${getZoneQuizzes(zoneId).length} nature challenges to complete</li>
        <li>Reward: ${zone.difficulty * 20} XP per exploration</li>
      </ul>
    </div>`;
    infoModalBody.innerHTML = html;
    infoModal.removeAttribute('hidden');
    infoModal.setAttribute('aria-hidden', 'false');
    infoModalClose.onclick = closeAllModals;
    infoModal.addEventListener('click', e => { if (e.target === infoModal) closeAllModals(); });
  }

  function closeAllModals() {
    [clueModal, quizModal, resultModal, infoModal].forEach(m => {
      m.setAttribute('hidden', '');
      m.setAttribute('aria-hidden', 'true');
    });
  }

  /* ==============================================================
     UI HELPERS
     ============================================================== */

  function addActivity(text, color) {
    const empty = activityFeed.querySelector('.activity-empty');
    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = 'activity-item';
    const dot = document.createElement('span');
    dot.className = 'activity-dot';
    dot.style.background = color || '#34d399';
    item.appendChild(dot);
    item.appendChild(document.createTextNode(text));
    activityFeed.appendChild(item);
    activityFeed.scrollTop = activityFeed.scrollHeight;
  }

  function showToast(message, color) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderColor = color || 'var(--glass-border)';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
      if (!state.unlockedAchievements.includes(a.id) && a.check(state)) {
        state.unlockedAchievements.push(a.id);
        showAchievementPopup(a);
        state.activityLog.push({ type: 'achievement', text: `Unlocked: ${a.name}` });
        addActivity(`🏅 Achievement: ${a.name}`, '#facc15');
      }
    });
  }

  function showAchievementPopup(a) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `<div class="achievement-popup-icon">${a.icon}</div>
      <div class="achievement-popup-title">${a.name}</div>
      <div class="achievement-popup-desc">${a.desc}</div>`;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.opacity = '0'; setTimeout(() => popup.remove(), 500); }, 3500);
  }

  function updateDashboard() {
    const level = getLevel(state.totalXp);
    playerLevel.textContent = level;

    const xpForCurrent = getXpForLevel(level);
    const xpForNext = getXpForLevel(level + 1);
    const progress = ((state.totalXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;
    xpFill.style.width = `${Math.min(progress, 100)}%`;
    xpText.textContent = `${state.totalXp} XP`;

    statTreasures.textContent = state.foundTreasures.length;
    statChallenges.textContent = state.completedQuizzes.length;
    statFacts.textContent = state.exploredZones.length;
  }

  /* ==============================================================
     KEYBOARD SHORTCUTS
     ============================================================== */

  document.addEventListener('keydown', e => {
    // Escape to close modals
    if (e.key === 'Escape') closeAllModals();
    // Quick quiz for active zone
    if (e.key === 'q' && activeZoneId && !document.querySelector('.modal-overlay:not([hidden])')) {
      openQuizModal(activeZoneId);
    }
    // Show info for active zone
    if (e.key === 'i' && activeZoneId && !document.querySelector('.modal-overlay:not([hidden])')) {
      openInfoModal(activeZoneId);
    }
  });

  /* ==============================================================
     INIT
     ============================================================== */

  function init() {
    // Restore activity log
    state.activityLog.forEach(a => addActivity(a.text, a.type === 'treasure' ? '#facc15' : a.type === 'achievement' ? '#facc15' : a.type === 'quiz' ? '#34d399' : '#64748b'));

    renderMap();
    updateDashboard();

    // Select first unexplored zone or first zone
    const firstExplored = state.exploredZones[state.exploredZones.length - 1];
    if (firstExplored) {
      selectZone(firstExplored);
    } else {
      selectZone(ZONES[0].id);
    }

    // Show welcome
    if (state.foundTreasures.length === 0) {
      openResultModal('🗺️', 'Welcome, Explorer!', 'Explore the world map, discover hidden treasures by solving clues, and complete nature challenges. Click on any highlighted zone to start your adventure!', 0, 'Use "Q" to open a nature challenge for the active zone. Use "I" to see zone info. Press Escape to close modals.');
    } else {
      showToast(`👋 Welcome back! You've found ${state.foundTreasures.length} treasures so far.`, '#34d399');
    }
  }

  init();
})();
