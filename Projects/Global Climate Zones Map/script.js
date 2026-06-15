(function () {
  'use strict';

  /* ==============================================================
     I. DATA
     ============================================================== */

  const ZONES = {
    tropical:  { id: 'tropical',  name: 'Tropical',  color: '#22c55e', icon: '🌴', temp: '25–30°C', humidity: 'High (80%+)', rainfall: '2,000+ mm', seasonal: 'Low', vegDensity: 'Very Dense', desc: 'Hot and humid year-round with abundant rainfall. Home to the world\'s most biodiverse ecosystems.' },
    desert:    { id: 'desert',    name: 'Desert',    color: '#f59e0b', icon: '🏜️', temp: '35–50°C (day)', humidity: 'Low (<20%)', rainfall: '<250 mm', seasonal: 'Extreme', vegDensity: 'Sparse', desc: 'Extreme temperatures with minimal precipitation. Specialized plants and animals adapted to harsh conditions.' },
    temperate: { id: 'temperate', name: 'Temperate', color: '#38bdf8', icon: '🌳', temp: '5–25°C', humidity: 'Moderate (50–70%)', rainfall: '500–1,500 mm', seasonal: 'Distinct', vegDensity: 'Moderate', desc: 'Four distinct seasons with moderate rainfall. Supports diverse deciduous forests and grasslands.' },
    polar:     { id: 'polar',     name: 'Polar',     color: '#e0f2fe', icon: '❄️', temp: '-50–0°C', humidity: 'Low (30–50%)', rainfall: '<200 mm', seasonal: 'Extreme', vegDensity: 'Minimal', desc: 'Extreme cold with permanent ice sheets. Brief summer allows only hardy mosses and lichens to survive.' },
    mountain:  { id: 'mountain',  name: 'Mountain',  color: '#64748b', icon: '🏔️', temp: 'Varies by elevation', humidity: 'Variable', rainfall: 'Variable', seasonal: 'Rapid shifts', vegDensity: 'Zonal', desc: 'Altitude-driven climate zones. Temperature drops ~6.5°C per 1,000 m elevation gain.' }
  };

  const REGIONS = [
    { id:'amazon', name:'Amazon Basin', zone:'tropical', continent:'South America', coords:'3°S, 60°W', temp:'26–28°C', rainfall:'2,300 mm', humidity:'85%', growingSeason:'Year-round', vegetation:'Tropical Rainforest', wildlife:'Jaguar, Toucan, Anaconda, Macaw, Sloth', importance:'Produces 6% of global oxygen; home to 10% of known species', facts:['The Amazon River discharges 209,000 m³/s—more than the next 7 largest rivers combined.','Over 40,000 plant species have been identified in the Amazon.','Some Amazon trees have been alive for over 1,000 years.','The Amazon covers 5.5 million km² across 9 countries.'], pts:[[130,190],[170,190],[175,240],[165,260],[145,255],[125,230]], cx:150,cy:220 },
    { id:'congo', name:'Congo Basin', zone:'tropical', continent:'Africa', coords:'0°N, 20°E', temp:'25–27°C', rainfall:'1,800 mm', humidity:'82%', growingSeason:'Year-round', vegetation:'Tropical Rainforest', wildlife:'Gorilla, Okapi, Forest Elephant, Bonobo, Congo Peacock', importance:'Second-largest rainforest; vital carbon sink', facts:['The Congo Basin is the world\'s second-largest rainforest spanning 2 million km².','The Congo River is the deepest in the world at 220 m.','Bonobos, our closest living relatives, live only in the Congo Basin.','Over 10,000 plant species are found in the Congo Basin.'], pts:[[280,200],[340,200],[345,245],[335,265],[290,260],[275,230]], cx:310,cy:225 },
    { id:'indonesia', name:'Indonesia', zone:'tropical', continent:'Asia', coords:'0°S, 120°E', temp:'26–30°C', rainfall:'2,800 mm', humidity:'87%', growingSeason:'Year-round', vegetation:'Tropical Rainforest, Mangroves', wildlife:'Orangutan, Komodo Dragon, Bird of Paradise, Tarsier', importance:'One of the most biodiverse countries on Earth', facts:['Indonesia has over 17,000 islands, of which only 6,000 are inhabited.','The Komodo dragon is the largest lizard on Earth, reaching 3 m in length.','Indonesia has the second-highest bird species count in the world.','The country sits on the "Ring of Fire" with 130 active volcanoes.'], pts:[[490,230],[530,225],[535,260],[520,270],[495,260],[485,245]], cx:510,cy:240 },
    { id:'seasia', name:'Southeast Asia', zone:'tropical', continent:'Asia', coords:'15°N, 105°E', temp:'25–32°C', rainfall:'2,400 mm', humidity:'83%', growingSeason:'Year-round', vegetation:'Tropical Rainforest, Monsoon Forest', wildlife:'Tiger, Asian Elephant, Clouded Leopard, Hornbill, Sun Bear', importance:'Critical biodiversity hotspot with rapid deforestation', facts:['Southeast Asia has the highest deforestation rate of any major tropical region.','The Mekong River supports the largest inland fishery in the world.','Over 600 million people live in Southeast Asia.','The region contains three of Earth\'s 36 biodiversity hotspots.'], pts:[[435,160],[480,165],[490,200],[480,215],[440,210],[430,180]], cx:455,cy:180 },

    { id:'sahara', name:'Sahara Desert', zone:'desert', continent:'Africa', coords:'25°N, 15°E', temp:'38–50°C (day)', rainfall:'<25 mm', humidity:'15%', growingSeason:'None', vegetation:'Sparse shrubs, Cacti', wildlife:'Fennec Fox, Dromedary, Addax, Horned Viper, Desert Scorpion', importance:'Largest hot desert; vital for global atmospheric circulation', facts:['The Sahara covers 9.2 million km²—roughly the size of the USA.','Temperatures can swing from 50°C during the day to below 0°C at night.','The Sahara was once a lush grassland with lakes and rivers 10,000 years ago.','Saharan dust fertilizes the Amazon rainforest across the Atlantic.'], pts:[[260,135],[365,135],[370,175],[355,185],[270,180],[255,160]], cx:310,cy:155 },
    { id:'arabian', name:'Arabian Desert', zone:'desert', continent:'Asia', coords:'22°N, 45°E', temp:'35–48°C (day)', rainfall:'<100 mm', humidity:'20%', growingSeason:'None', vegetation:'Acacia, Tamarisk, Desert Shrubs', wildlife:'Arabian Oryx, Sand Cat, Camel, Caracal, Desert Hedgehog', importance:'Major oil reserves; extreme arid environment', facts:['The Rub\' al Khali (Empty Quarter) is the largest continuous sand desert on Earth.','Some areas receive no rainfall for years at a time.','The Arabian oryx was saved from extinction through captive breeding.','Ancient trade routes crossed this desert for thousands of years.'], pts:[[375,125],[425,130],[430,170],[415,180],[385,170],[370,150]], cx:395,cy:145 },
    { id:'gobi', name:'Gobi Desert', zone:'desert', continent:'Asia', coords:'42°N, 105°E', temp:'30–40°C (summer)', rainfall:'<200 mm', humidity:'25%', growingSeason:'Short (2-3 months)', vegetation:'Sparse grass, Saxaul shrubs', wildlife:'Bactrian Camel, Snow Leopard, Gobi Bear, Golden Eagle, Argali Sheep', importance:'Cold desert with extreme seasonal variation', facts:['The Gobi is a cold desert with winter temperatures dropping to -40°C.','The Gobi Desert is expanding rapidly due to desertification—it is the fastest-growing desert on Earth.','The Flaming Cliffs of the Gobi are famous for dinosaur fossil discoveries.','The two-humped Bactrian camel is uniquely adapted to the Gobi\'s extreme conditions.'], pts:[[450,95],[510,100],[515,135],[505,145],[460,140],[445,115]], cx:475,cy:115 },
    { id:'outback', name:'Australian Outback', zone:'desert', continent:'Australia', coords:'25°S, 130°E', temp:'35–45°C (day)', rainfall:'<250 mm', humidity:'18%', growingSeason:'Variable', vegetation:'Spinifex grass, Acacia, Eucalyptus', wildlife:'Kangaroo, Dingo, Thorny Devil, Emu, Perentie Lizard', importance:'Ancient landscape with unique endemic species', facts:['The Outback covers 70% of Australia but contains less than 5% of its population.','Uluru (Ayers Rock) is a 600-million-year-old sandstone monolith.','Some Outback regions have not received rainfall in recorded history.','The thorny devil collects water through its skin from morning dew.'], pts:[[565,245],[645,250],[650,285],[635,310],[580,305],[555,275]], cx:605,cy:275 },

    { id:'europe', name:'Europe', zone:'temperate', continent:'Europe', coords:'50°N, 10°E', temp:'5–20°C', rainfall:'600–1,200 mm', humidity:'65%', growingSeason:'6-8 months', vegetation:'Deciduous Forest, Mixed Forest', wildlife:'Red Deer, Brown Bear, Wolf, Fox, European Bison', importance:'Cradle of modern civilization; diverse agricultural heartland', facts:['Europe has the most fragmented forests of any continent.','The European bison was extinct in the wild but reintroduced successfully.','Europe\'s temperate forests are among the most managed ecosystems on Earth.','The continent spans 10 major climate sub-types within the temperate zone.'], pts:[[245,50],[345,55],[340,100],[330,115],[290,120],[255,110],[240,85]], cx:290,cy:80 },
    { id:'eus', name:'Eastern USA', zone:'temperate', continent:'North America', coords:'40°N, 80°W', temp:'5–25°C', rainfall:'1,000 mm', humidity:'60%', growingSeason:'5-7 months', vegetation:'Deciduous Forest, Mixed Forest', wildlife:'White-tailed Deer, Black Bear, Bald Eagle, Raccoon, Eastern Gray Squirrel', importance:'Major agricultural region; iconic four-season climate', facts:['The Appalachian Mountains are over 480 million years old—older than the Himalayas.','The Eastern USA experiences all four seasons distinctly.','The region has some of the world\'s most productive agricultural soils.','Fall foliage in New England attracts millions of visitors annually.'], pts:[[40,70],[135,75],[140,120],[130,140],[100,145],[55,125],[35,95]], cx:90,cy:95 },
    { id:'china', name:'China', zone:'temperate', continent:'Asia', coords:'35°N, 110°E', temp:'5–25°C', rainfall:'600–1,500 mm', humidity:'62%', growingSeason:'5-8 months', vegetation:'Mixed Deciduous Forest, Bamboo', wildlife:'Giant Panda, Red Panda, Golden Monkey, Chinese Alligator, Crested Ibis', importance:'Ancient civilization; world\'s most populous country', facts:['China is home to the Giant Panda, one of the world\'s most endangered species.','The Yangtze River is the third-longest river in the world at 6,300 km.','China\'s temperate zone supports over 1.3 billion people.','Bamboo forests can grow up to 1 m per day in ideal conditions.'], pts:[[440,110],[540,115],[545,160],[530,175],[460,175],[435,145]], cx:490,cy:120 },
    { id:'nz', name:'New Zealand', zone:'temperate', continent:'Oceania', coords:'42°S, 175°E', temp:'8–18°C', rainfall:'600–2,500 mm', humidity:'70%', growingSeason:'9-12 months', vegetation:'Temperate Rainforest, Grasslands', wildlife:'Kiwi, Kea, Tuatara, Yellow-eyed Penguin, Hector\'s Dolphin', importance:'Unique island ecosystem with high endemism', facts:['New Zealand has no native land mammals (except bats)—birds fill every ecological niche.','The kiwi is a flightless bird that lays the largest egg relative to body size of any bird.','More than 80% of New Zealand\'s flora is endemic.','The country\'s temperate rainforests receive up to 2,500 mm of rain annually.'], pts:[[620,310],[665,315],[670,345],[650,355],[625,345],[615,325]], cx:640,cy:325 },

    { id:'antarctica', name:'Antarctica', zone:'polar', continent:'Antarctica', coords:'82°S, 60°E', temp:'-60–0°C', rainfall:'<50 mm (snow)', humidity:'35%', growingSeason:'<1 month', vegetation:'Mosses, Lichens, Algae', wildlife:'Emperor Penguin, Weddell Seal, Krill, Snow Petrel, Leopard Seal', importance:'Largest ice sheet; critical for global climate regulation', facts:['Antarctica holds 60% of Earth\'s fresh water frozen in its ice sheet.','The ice sheet is up to 4.8 km thick—the highest continent by average elevation.','Antarctica has no permanent human residents, only research scientists.','The lowest recorded temperature on Earth was -89.2°C at Vostok Station.'], pts:[[60,390],[200,370],[380,365],[500,368],[620,375],[740,392],[700,410],[450,418],[200,415],[50,405]], cx:400,cy:395 },
    { id:'greenland', name:'Greenland', zone:'polar', continent:'North America', coords:'72°N, 40°W', temp:'-30–5°C', rainfall:'<200 mm (snow)', humidity:'40%', growingSeason:'2-3 months', vegetation:'Tundra mosses, Dwarf shrubs', wildlife:'Polar Bear, Arctic Fox, Musk Ox, Walrus, Snowy Owl', importance:'Second-largest ice sheet; crucial for sea level research', facts:['Greenland\'s ice sheet is 3 km thick and contains 10% of the world\'s fresh water.','If Greenland\'s ice sheet melted completely, sea levels would rise by 7.4 m.','The name "Greenland" was a medieval marketing tactic by Erik the Red.','Greenland experiences 24-hour daylight in summer and 24-hour darkness in winter.'], pts:[[195,15],[270,18],[275,55],[265,75],[235,80],[205,65],[190,35]], cx:235,cy:40 },
    { id:'arctic', name:'Arctic Circle', zone:'polar', continent:'Multiple', coords:'75°N, 0°E', temp:'-40–5°C', rainfall:'<250 mm (snow)', humidity:'38%', growingSeason:'1-2 months', vegetation:'Tundra, Mosses, Lichens, Arctic Willow', wildlife:'Polar Bear, Walrus, Arctic Fox, Caribou, Narwhal', importance:'Sensitive indicator of global climate change', facts:['The Arctic is warming at 4 times the global average rate.','Arctic sea ice has declined by 40% since 1979.','The word "Arctic" comes from the Greek word for "bear" (arktos).','Permafrost underlies 65% of Arctic land and contains vast amounts of trapped methane.'], pts:[[200,5],[600,5],[610,28],[520,35],[380,38],[250,35],[190,28]], cx:400,cy:20 },

    { id:'himalayas', name:'Himalayas', zone:'mountain', continent:'Asia', coords:'28°N, 85°E', temp:'-20–20°C (by elevation)', rainfall:'Varies (600–3,000 mm)', humidity:'Variable', growingSeason:'2-6 months (by elevation)', vegetation:'Alpine meadows, Coniferous forest, Tundra', wildlife:'Snow Leopard, Red Panda, Himalayan Tahr, Musk Deer, Griffon Vulture', importance:'Highest mountain range; source of 10 major rivers', facts:['The Himalayas are the youngest mountain range on Earth, formed 50 million years ago.','Mount Everest grows about 4 mm taller each year due to tectonic activity.','The Himalayas feed 10 major rivers that support over 1.5 billion people.','Temperature drops about 6.5°C for every 1,000 m of elevation gain.'], pts:[[405,100],[475,105],[480,125],[465,135],[420,130],[400,115]], cx:440,cy:110 },
    { id:'andes', name:'Andes', zone:'mountain', continent:'South America', coords:'20°S, 65°W', temp:'Varies by elevation', rainfall:'Varies (200–3,000 mm)', humidity:'Variable', growingSeason:'Variable by elevation', vegetation:'Tropical forest, Alpine tundra, Páramo', wildlife:'Condor, Llama, Vicuña, Spectacled Bear, Chinchilla', importance:'World\'s longest mountain range; critical freshwater source', facts:['The Andes stretch 7,000 km across 7 countries—the longest continental mountain range.','The Andes are home to the world\'s highest active volcano, Ojos del Salado (6,893 m).','The Inca civilization thrived in the Andes for over 3,000 years.','The Andes create a rain shadow that makes the Atacama Desert the driest on Earth.'], pts:[[105,165],[150,170],[155,200],[150,240],[140,275],[120,280],[105,250],[95,210]], cx:125,cy:230 },
    { id:'alps', name:'Alps', zone:'mountain', continent:'Europe', coords:'46°N, 10°E', temp:'-10–15°C (by elevation)', rainfall:'800–2,000 mm', humidity:'60–80%', growingSeason:'3-6 months (by elevation)', vegetation:'Coniferous forest, Alpine meadows', wildlife:'Ibex, Chamois, Golden Eagle, Alpine Marmot, Snow Vole', importance:'Major European water tower; iconic alpine landscape', facts:['The Alps span 1,200 km across 8 European countries.','The Alps contain about 4,000 glaciers, most of which are rapidly retreating.','The Matterhorn is one of the most photographed mountains in the world.','The Alpine region attracts over 120 million visitors annually.'], pts:[[275,80],[325,83],[330,98],[320,108],[290,108],[270,95]], cx:300,cy:85 },
    { id:'rockies', name:'Rocky Mountains', zone:'mountain', continent:'North America', coords:'45°N, 110°W', temp:'-15–20°C (by elevation)', rainfall:'400–1,500 mm', humidity:'50–75%', growingSeason:'2-5 months (by elevation)', vegetation:'Coniferous forest, Alpine tundra', wildlife:'Grizzly Bear, Elk, Bighorn Sheep, Gray Wolf, Mountain Goat', importance:'Major continental divide; headwaters of North America', facts:['The Rockies stretch 4,800 km from Canada to the USA.','The Continental Divide runs along the crest of the Rockies.','The Rockies contain some of the oldest rocks in North America (over 1.7 billion years old).','Yellowstone National Park sits atop a supervolcano caldera in the Rockies.'], pts:[[35,55],[110,60],[115,80],[110,110],[100,135],[75,130],[50,110],[30,80]], cx:70,cy:80 }
  ];

  // Temperature overlay zones (horizontal gradient bands)
  const TEMP_ZONES = [
    { y:0, h:40,  temp:'-40°C', color:'#3b82f6' },  // Polar
    { y:40, h:50,  temp:'-10°C', color:'#60a5fa' },
    { y:90, h:60,  temp:'5°C', color:'#93c5fd' },
    { y:150, h:60, temp:'15°C',  color:'#fcd34d' },
    { y:210, h:50, temp:'25°C',  color:'#f97316' },
    { y:260, h:50, temp:'22°C',  color:'#fb923c' },
    { y:310, h:40, temp:'12°C',  color:'#93c5fd' },
    { y:350, h:50, temp:'-30°C', color:'#60a5fa' }
  ];

  // Rainfall overlay - high/low regions
  const RAIN_ZONES = [
    { x:120,y:180,w:80,h:90,  intensity:'Very High', color:'#1d4ed8', op:0.4 },
    { x:270,y:190,w:80,h:80,  intensity:'High', color:'#2563eb', op:0.35 },
    { x:480,y:220,w:60,h:60,  intensity:'Very High', color:'#1d4ed8', op:0.4 },
    { x:430,y:150,w:60,h:70,  intensity:'High', color:'#2563eb', op:0.35 },
    { x:260,y:130,w:110,h:60, intensity:'Very Low', color:'#fcd34d', op:0.3 },
    { x:375,y:120,w:60,h:60,  intensity:'Low', color:'#fde68a', op:0.25 },
    { x:450,y:90,w:70,h:60,   intensity:'Low', color:'#fde68a', op:0.25 },
    { x:560,y:240,w:90,h:70,  intensity:'Low', color:'#fde68a', op:0.25 },
    { x:240,y:40,w:110,h:80,  intensity:'Moderate', color:'#7c3aed', op:0.2 },
    { x:40,y:65,w:100,h:80,   intensity:'Moderate', color:'#7c3aed', op:0.2 },
    { x:60,y:385,w:680,h:25,  intensity:'Very Low', color:'#e0f2fe', op:0.2 }
  ];

  // Vegetation overlay
  const VEG_ZONES = [
    { x:120,y:185,w:60,h:90,  density:'Dense Forest', color:'#15803d', op:0.4 },
    { x:270,y:195,w:80,h:80,  density:'Dense Forest', color:'#15803d', op:0.4 },
    { x:480,y:225,w:60,h:60,  density:'Dense Forest', color:'#15803d', op:0.4 },
    { x:430,y:155,w:60,h:70,  density:'Forest', color:'#16a34a', op:0.35 },
    { x:250,y:45,w:100,h:80,  density:'Mixed Forest', color:'#22c55e', op:0.3 },
    { x:40,y:65,w:100,h:85,   density:'Mixed Forest', color:'#22c55e', op:0.3 },
    { x:440,y:105,w:110,h:75, density:'Mixed Forest', color:'#22c55e', op:0.3 },
    { x:260,y:125,w:110,h:65, density:'Sparse', color:'#a16207', op:0.25 },
    { x:375,y:120,w:60,h:60,  density:'Barren', color:'#854d0e', op:0.2 },
    { x:560,y:240,w:90,h:70,  density:'Sparse', color:'#a16207', op:0.25 },
    { x:195,y:5,w:80,h:75,    density:'Tundra', color:'#94a3b8', op:0.2 },
    { x:200,y:0,w:410,h:40,   density:'Tundra', color:'#94a3b8', op:0.2 },
    { x:60,y:370,w:680,h:35,  density:'Ice', color:'#e2e8f0', op:0.25 }
  ];

  // Population overlay - circles at major population centers
  const POP_CENTERS = [
    { cx:80,cy:105,r:12, name:'Eastern US', density:'High' },
    { cx:300,cy:85,r:14, name:'Europe', density:'Very High' },
    { cx:490,cy:120,r:20, name:'China/East Asia', density:'Very High' },
    { cx:465,cy:155,r:10, name:'Southeast Asia', density:'High' },
    { cx:145,cy:230,r:6, name:'Amazon Basin', density:'Very Low' },
    { cx:380,cy:155,r:4,name:'Sahara', density:'None' },
    { cx:400,cy:390,r:2,name:'Antarctica', density:'None' },
    { cx:235,cy:40,r:2,name:'Greenland', density:'Very Low' },
    { cx:140,cy:220,r:3,name:'Congo Basin', density:'Low' },
    { cx:490,cy:190,r:8,name:'Indonesia', density:'Moderate' },
    { cx:310,cy:225,r:5,name:'Central Africa', density:'Moderate' },
    { cx:620,cy:330,r:3,name:'New Zealand', density:'Low' }
  ];

  // Biodiversity overlay
  const BIO_ZONES = [
    { x:120,y:185,w:60,h:90,  richness:'Extreme',   color:'#8b5cf6', op:0.35 },
    { x:270,y:195,w:80,h:80,  richness:'Extreme',   color:'#8b5cf6', op:0.35 },
    { x:480,y:225,w:60,h:60,  richness:'Very High', color:'#a78bfa', op:0.3 },
    { x:430,y:155,w:60,h:70,  richness:'Very High', color:'#a78bfa', op:0.3 },
    { x:250,y:45,w:100,h:80,  richness:'Moderate',  color:'#c4b5fd', op:0.2 },
    { x:40,y:65,w:100,h:85,   richness:'High',      color:'#a78bfa', op:0.25 },
    { x:440,y:105,w:110,h:75, richness:'High',      color:'#a78bfa', op:0.25 },
    { x:260,y:125,w:110,h:65, richness:'Low',       color:'#ddd6fe', op:0.15 },
    { x:560,y:240,w:90,h:70,  richness:'Moderate',  color:'#c4b5fd', op:0.2 },
    { x:60,y:370,w:680,h:35,  richness:'Minimal',   color:'#e4e4e7', op:0.15 }
  ];

  const QUIZZES = [
    { q:'Which climate zone covers the largest land area on Earth?', o:['Tropical','Desert','Temperate','Polar'], a:2, f:'Temperate zones cover the largest area, spanning vast regions of North America, Europe, and Asia.' },
    { q:'What percentage of Earth\'s fresh water is stored in Antarctica\'s ice sheet?', o:['30%','45%','60%','75%'], a:2, f:'Antarctica holds 60% of Earth\'s fresh water—enough to raise sea levels by 58 m if melted.' },
    { q:'Which climate zone has the highest biodiversity?', o:['Desert','Temperate','Tropical','Polar'], a:2, f:'Tropical rainforests host more species than any other terrestrial ecosystem.' },
    { q:'The Amazon produces approximately what share of global oxygen?', o:['2%','6%','15%','25%'], a:1, f:'While often cited as 20%, scientific estimates place the Amazon\'s oxygen contribution at about 6%.' },
    { q:'What is the primary difference between a cold desert (Gobi) and a hot desert (Sahara)?', o:['Rainfall amount','Temperature range','Soil type','Elevation'], a:1, f:'Cold deserts like the Gobi experience freezing winters, while hot deserts like the Sahara stay warm year-round.' },
    { q:'How much does temperature drop per 1,000 m of elevation gain?', o:['3.2°C','6.5°C','9.8°C','12.1°C'], a:1, f:'This rate is called the environmental lapse rate—about 6.5°C per 1,000 m.' },
    { q:'Which polar region is warming the fastest?', o:['Antarctica','Greenland','Arctic','Patagonia'], a:2, f:'The Arctic is warming at 4 times the global average rate—a phenomenon called Arctic amplification.' },
    { q:'What is the largest hot desert in the world?', o:['Arabian','Gobi','Kalahari','Sahara'], a:3, f:'The Sahara covers 9.2 million km²—nearly the size of the entire United States.' },
    { q:'Which climate zone has the most distinct four seasons?', o:['Tropical','Desert','Temperate','Mountain'], a:2, f:'Temperate zones experience spring, summer, autumn, and winter with clear transitions between each.' },
    { q:'What percentage of Madagascar\'s wildlife is found nowhere else?', o:['50%','70%','90%','99%'], a:2, f:'Madagascar\'s 88 million years of isolation led to over 90% endemic wildlife.' },
    { q:'The Congo River is the deepest in the world at what maximum depth?', o:['120 m','220 m','320 m','420 m'], a:1, f:'The Congo reaches depths of 220 m—so deep that sunlight cannot reach the bottom in places.' },
    { q:'Which desert is expanding the fastest due to climate change?', o:['Sahara','Arabian','Gobi','Atacama'], a:2, f:'The Gobi Desert is the fastest-growing desert on Earth, expanding by 3,600 km² annually.' },
    { q:'How many countries do the Alps span?', o:['5','6','7','8'], a:3, f:'The Alps span 8 countries: France, Monaco, Italy, Switzerland, Liechtenstein, Germany, Austria, and Slovenia.' },
    { q:'What is permafrost?', o:['Frozen lakes','Permanent ice caves','Frozen ground','Ancient icebergs'], a:2, f:'Permafrost is ground that remains frozen for at least 2 consecutive years and underlies 65% of Arctic land.' },
    { q:'The Andes is the longest continental mountain range at what length?', o:['5,000 km','6,000 km','7,000 km','8,000 km'], a:2, f:'The Andes stretch 7,000 km along the western edge of South America.' }
  ];

  const CLIMATE_FACTS = [
    'Earth\'s average temperature has risen by about 1.2°C since the late 19th century due to human activity.',
    'The world\'s largest desert by area is actually Antarctica—it\'s a polar desert with less than 50 mm of precipitation annually.',
    'Coral reefs are considered the "rainforests of the sea" for their immense biodiversity.',
    'The Sahara Desert was once a lush, green landscape with lakes, rivers, and grasslands about 10,000 years ago.',
    'Mount Everest grows approximately 4 mm taller every year due to ongoing tectonic plate collision.',
    'The Arctic sea ice has declined by more than 40% since satellite records began in 1979.',
    'Tropical rainforests cover only about 6% of Earth\'s land surface but host more than 50% of all known species.',
    'The Gobi Desert is one of the fastest-growing deserts in the world due to desertification.',
    'Greenland\'s ice sheet contains enough water to raise global sea levels by 7.4 m.',
    'The Amazon River discharges 209,000 m³ of water per second—more than the next 7 largest rivers combined.',
    'Desertification threatens the livelihoods of over 1 billion people in more than 100 countries.',
    'The Alps have lost about 50% of their glacier volume since 1900.',
    'Indonesia has the second-highest level of bird endemism in the world.',
    'The Himalayas are home to the highest peak on every continent\'s "Seven Summits" list—Mount Everest.',
    'The Atacama Desert in Chile is the driest non-polar place on Earth, with some areas never recording rainfall.',
    'Global sea levels have risen by about 20 cm since 1901, and the rate is accelerating.',
    'The Sundarbans mangrove forest is the largest in the world and protects millions from storm surges.',
    'New Zealand was the last major landmass to be settled by humans (around 1300 AD).',
    'The Congo Basin is the second-largest tropical rainforest and a critical carbon sink.',
    'Climate models predict that up to 30% of all species could face extinction if global warming exceeds 2°C.'
  ];

  const ACHIEVEMENTS = [
    { id:'first_region', name:'First Exploration', desc:'Explore your first climate region', icon:'🌍', check:s=>s.explored.length>=1 },
    { id:'five_regions', name:'Climate Traveler', desc:'Explore 5 climate regions', icon:'🗺️', check:s=>s.explored.length>=5 },
    { id:'all_regions', name:'Climate Master', desc:'Explore all 20 climate regions', icon:'🌏', check:s=>s.explored.length>=20 },
    { id:'all_zones', name:'Zone Explorer', desc:'Visit all 5 climate zones', icon:'🌟', check:s=>{const z=new Set(REGIONS.filter(r=>s.explored.includes(r.id)).map(r=>r.zone));return z.size>=5} },
    { id:'first_quiz', name:'Climate Student', desc:'Complete your first quiz', icon:'📚', check:s=>s.quizScore>=1 },
    { id:'five_quiz', name:'Climate Scholar', desc:'Complete 5 quizzes', icon:'🎓', check:s=>s.quizScore>=5 },
    { id:'ten_quiz', name:'Climate Scientist', desc:'Complete 10 quizzes', icon:'🔬', check:s=>s.quizScore>=10 },
    { id:'bookmark_3', name:'Region Curator', desc:'Bookmark 3 regions', icon:'📌', check:s=>s.bookmarks.length>=3 },
    { id:'bookmark_5', name:'Collection Keeper', desc:'Bookmark 5 regions', icon:'🏛️', check:s=>s.bookmarks.length>=5 },
    { id:'facts_10', name:'Knowledge Seeker', desc:'Discover 10 climate facts', icon:'💡', check:s=>s.factsSeen>=10 },
    { id:'overlay_all', name:'Layer Analyst', desc:'Use all 5 overlay types', icon:'📊', check:s=>s.overlaysUsed.size>=5 },
    { id:'compare_3', name:'Comparative Mind', desc:'Compare 3 different region pairs', icon:'⚖️', check:s=>s.compares>=3 },
    { id:'export', name:'Data Archivist', desc:'Export climate data as JSON', icon:'📦', check:s=>s.hasExported }
  ];

  const CONTINENT_PATHS = [
    { id:'north-america', d:'M 30,60 C 45,45 80,40 110,45 C 130,48 145,55 145,80 C 145,100 135,110 135,130 C 135,145 120,150 105,145 C 90,140 75,125 60,110 C 45,95 35,80 30,60 Z' },
    { id:'south-america', d:'M 115,155 C 135,150 150,155 160,175 C 170,195 170,225 155,260 C 145,285 130,305 115,290 C 105,275 100,240 100,200 C 100,175 105,160 115,155 Z' },
    { id:'africa', d:'M 255,130 C 275,115 310,115 340,125 C 360,135 370,155 370,180 C 370,205 360,240 345,270 C 325,305 310,310 295,295 C 280,280 265,245 255,200 C 245,165 245,145 255,130 Z' },
    { id:'europe', d:'M 250,50 C 270,35 310,35 335,45 C 350,55 350,80 340,100 C 330,115 310,120 290,120 C 270,120 255,110 245,95 C 235,80 235,65 250,50 Z' },
    { id:'asia', d:'M 340,45 C 370,25 420,25 475,30 C 525,35 565,50 590,70 C 610,90 610,115 590,140 C 570,160 535,175 490,180 C 450,185 410,175 385,155 C 360,135 345,110 335,85 C 325,65 325,50 340,45 Z' },
    { id:'australia', d:'M 560,240 C 585,225 620,225 650,240 C 670,255 675,285 655,310 C 635,335 605,340 580,320 C 555,300 540,270 560,240 Z' },
    { id:'antarctica', d:'M 60,390 C 150,370 300,365 450,365 C 550,365 650,370 740,390 C 700,410 450,415 300,415 C 150,415 80,405 60,390 Z' },
    { id:'greenland', d:'M 195,15 C 215,5 250,5 265,15 C 280,25 285,45 270,65 C 255,80 230,85 215,75 C 200,65 190,40 195,15 Z' }
  ];

  /* ==============================================================
     II. STATE
     ============================================================== */

  const STORAGE_KEY = 'gczm_state';
  function defaultState() {
    return {
      explored: [],
      bookmarks: [],
      completedQuizzes: [],
      quizScore: 0,
      factsSeen: 0,
      compares: 0,
      hasExported: false,
      overlaysUsed: new Set(),
      selectedZone: 'all',
      activeOverlay: 'temperature',
      achievements: [],
      scenarioLevel: 0
    };
  }
  let state = loadState();
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const p = JSON.parse(raw);
      const s = defaultState();
      Object.keys(p).forEach(k => { if (k === 'overlaysUsed') s.overlaysUsed = new Set(p[k]||[]); else s[k] = p[k]; });
      return s;
    } catch { return defaultState(); }
  }
  function saveState() {
    try {
      const o = {};
      Object.keys(state).forEach(k => { o[k] = k === 'overlaysUsed' ? [...state.overlaysUsed] : state[k]; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
    } catch {}
  }

  function getZone(id) { return ZONES[id]; }
  function getRegion(id) { return REGIONS.find(r => r.id === id); }
  function getRegionsByZone(zoneId) {
    if (zoneId === 'all') return REGIONS;
    return REGIONS.filter(r => r.zone === zoneId);
  }

  /* ==============================================================
     III. DOM REFS
     ============================================================== */

  const $ = id => document.getElementById(id);

  const zoneCards = $('zoneCards');
  const statsGrid = $('statsGrid');
  const charPanel = $('charPanel');
  const feedContainer = $('feedContainer');
  const continentsGroup = $('continentsGroup');
  const regionsGroup = $('regionsGroup');
  const markersGroup = $('markersGroup');
  const overlayGroup = $('overlayGroup');
  const climateMap = $('climateMap');
  const tbZone = $('tbZone');
  const tbRegion = $('tbRegion');
  const tbTemp = $('tbTemp');
  const tbCategory = $('tbCategory');
  const mapLegend = $('mapLegend');

  const statRegions = $('statRegions');
  const statTemp = $('statTemp');
  const statRainfall = $('statRainfall');
  const statBiodiversity = $('statBiodiversity');

  const charTemp = $('charTemp');
  const charHumidity = $('charHumidity');
  const charRainfall = $('charRainfall');
  const charSeasonal = $('charSeasonal');
  const charVegDensity = $('charVegDensity');

  const infoModal = $('infoModal');
  const infoModalTitle = $('infoModalTitle');
  const infoModalBody = $('infoModalBody');
  const infoModalClose = $('infoModalClose');
  const compareModal = $('compareModal');
  const compareModalTitle = $('compareModalTitle');
  const compareModalBody = $('compareModalBody');
  const compareModalClose = $('compareModalClose');
  const quizModal = $('quizModal');
  const quizModalTitle = $('quizModalTitle');
  const quizModalBody = $('quizModalBody');
  const quizModalClose = $('quizModalClose');
  const bookmarkModal = $('bookmarkModal');
  const bookmarkModalBody = $('bookmarkModalBody');
  const bookmarkModalClose = $('bookmarkModalClose');
  const climateModal = $('climateModal');
  const climateModalTitle = $('climateModalTitle');
  const climateModalBody = $('climateModalBody');
  const climateModalClose = $('climateModalClose');
  const toastContainer = $('toastContainer');

  const btnSeasonal = $('btnSeasonal');
  const btnCompare = $('btnCompare');
  const btnQuiz = $('btnQuiz');
  const btnExport = $('btnExport');

  let selectedRegionId = null;
  let seasonalMode = false;

  /* ==============================================================
     IV. MAP RENDERING
     ============================================================== */

  function renderMap() {
    renderContinents();
    renderRegions();
    renderMarkers();
    renderOverlay(state.activeOverlay);
  }

  function renderContinents() {
    continentsGroup.innerHTML = '';
    CONTINENT_PATHS.forEach(c => {
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', c.d);
      path.classList.add('continent-path');
      continentsGroup.appendChild(path);
    });
  }

  function renderRegions(filterZone) {
    regionsGroup.innerHTML = '';
    const filtered = filterZone && filterZone !== 'all' ? REGIONS.filter(r => r.zone === filterZone) : REGIONS;

    REGIONS.forEach(r => {
      const ptsStr = r.pts.map(p => p.join(',')).join(' ');
      const zone = ZONES[r.zone];
      const isExplored = state.explored.includes(r.id);
      const isFiltered = filtered.includes(r);
      const isActive = r.id === selectedRegionId;

      const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
      poly.setAttribute('points', ptsStr);
      poly.setAttribute('fill', zone.color);
      poly.setAttribute('fill-opacity', isActive ? '0.35' : isFiltered ? '0.2' : '0.06');
      poly.setAttribute('stroke', isActive ? '#fff' : isFiltered ? zone.color : 'transparent');
      poly.setAttribute('stroke-width', isActive ? '1.8' : isFiltered ? '1' : '0');
      poly.classList.add('region-poly');
      if (isActive) poly.classList.add('region-poly--active');
      if (!isFiltered && filterZone && filterZone !== 'all') poly.classList.add('region-poly--dimmed');
      poly.dataset.regionId = r.id;
      poly.setAttribute('tabindex','0');
      poly.setAttribute('role','button');
      poly.setAttribute('aria-label',`${r.name} — ${zone.name} Zone`);
      poly.addEventListener('click',() => selectRegion(r.id));
      poly.addEventListener('keydown',e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); selectRegion(r.id); } });
      regionsGroup.appendChild(poly);
    });
  }

  function renderMarkers() {
    markersGroup.innerHTML = '';
    REGIONS.forEach(r => {
      const zone = ZONES[r.zone];
      const isExplored = state.explored.includes(r.id);

      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.dataset.regionId = r.id;
      g.classList.add('region-marker');
      g.setAttribute('tabindex','-1');
      g.setAttribute('aria-label',`${r.name}: ${zone.name}`);

      const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
      circle.setAttribute('cx', r.cx);
      circle.setAttribute('cy', r.cy);
      circle.setAttribute('r', isExplored ? '3.5' : '2.5');
      circle.setAttribute('fill', isExplored ? zone.color : '#475569');
      circle.classList.add('region-marker-inner');
      g.appendChild(circle);

      const label = document.createElementNS('http://www.w3.org/2000/svg','text');
      label.setAttribute('x', r.cx);
      label.setAttribute('y', r.cy - 8);
      label.textContent = r.name;
      label.classList.add('region-label');
      if (selectedRegionId === r.id || isExplored) label.classList.add('region-label--visible');
      g.appendChild(label);

      g.addEventListener('click',() => selectRegion(r.id));
      markersGroup.appendChild(g);
    });
  }

  function renderOverlay(type) {
    overlayGroup.innerHTML = '';
    if (type === 'none') return;

    const defs = climateMap.querySelector('defs');

    if (type === 'temperature') {
      TEMP_ZONES.forEach(z => {
        const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
        r.setAttribute('x','0'); r.setAttribute('y',z.y); r.setAttribute('width','800'); r.setAttribute('height',z.h);
        r.setAttribute('fill',z.color); r.setAttribute('opacity','0.15');
        r.classList.add('overlay-rect');
        overlayGroup.appendChild(r);
      });
      // Add equator line
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1','0'); line.setAttribute('y1','200'); line.setAttribute('x2','800'); line.setAttribute('y2','200');
      line.setAttribute('stroke','#ef4444'); line.setAttribute('stroke-width','1'); line.setAttribute('stroke-dasharray','6,3');
      line.setAttribute('opacity','0.5');
      overlayGroup.appendChild(line);
    } else if (type === 'rainfall') {
      RAIN_ZONES.forEach(z => {
        const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
        r.setAttribute('x',z.x); r.setAttribute('y',z.y); r.setAttribute('width',z.w); r.setAttribute('height',z.h);
        r.setAttribute('fill',z.color); r.setAttribute('opacity',z.op);
        r.setAttribute('rx','4');
        r.classList.add('overlay-rect');
        overlayGroup.appendChild(r);
      });
    } else if (type === 'vegetation') {
      VEG_ZONES.forEach(z => {
        const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
        r.setAttribute('x',z.x); r.setAttribute('y',z.y); r.setAttribute('width',z.w); r.setAttribute('height',z.h);
        r.setAttribute('fill',z.color); r.setAttribute('opacity',z.op);
        r.setAttribute('rx','4');
        r.classList.add('overlay-rect');
        overlayGroup.appendChild(r);
      });
    } else if (type === 'population') {
      POP_CENTERS.forEach(p => {
        const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx',p.cx); c.setAttribute('cy',p.cy); c.setAttribute('r',p.r);
        c.setAttribute('fill','#dc2626'); c.setAttribute('opacity','0.2');
        c.classList.add('overlay-rect');
        overlayGroup.appendChild(c);
      });
    } else if (type === 'biodiversity') {
      BIO_ZONES.forEach(z => {
        const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
        r.setAttribute('x',z.x); r.setAttribute('y',z.y); r.setAttribute('width',z.w); r.setAttribute('height',z.h);
        r.setAttribute('fill',z.color); r.setAttribute('opacity',z.op);
        r.setAttribute('rx','4');
        r.classList.add('overlay-rect');
        overlayGroup.appendChild(r);
      });
    }

    state.overlaysUsed.add(type);
  }

  /* ==============================================================
     V. INTERACTIONS
     ============================================================== */

  function selectRegion(regionId) {
    selectedRegionId = regionId;
    const region = getRegion(regionId);
    if (!region) return;

    // Mark explored
    if (!state.explored.includes(regionId)) {
      state.explored.push(regionId);
      addFeedItem(`🌍 Explored ${region.name} in the ${ZONES[region.zone].name} zone`, ZONES[region.zone].color);
      checkAchievements();
    }
    saveState();

    // Update toolbar
    tbZone.textContent = ZONES[region.zone].name;
    tbRegion.textContent = region.name;
    tbTemp.textContent = region.temp;
    tbCategory.textContent = `${region.continent} • ${region.coords}`;

    // Update characteristics
    updateCharacteristics(region.zone);

    // Re-render
    const filterZone = state.selectedZone;
    renderRegions(filterZone);
    renderMarkers();
    updateStats();

    // Show info modal automatically after short delay
    openInfoModal(regionId);
  }

  function updateCharacteristics(zoneId) {
    const zone = getZone(zoneId);
    if (!zone) {
      charTemp.textContent = '—'; charHumidity.textContent = '—';
      charRainfall.textContent = '—'; charSeasonal.textContent = '—';
      charVegDensity.textContent = '—';
      return;
    }
    charTemp.textContent = zone.temp;
    charHumidity.textContent = zone.humidity;
    charRainfall.textContent = zone.rainfall;
    charSeasonal.textContent = zone.seasonal;
    charVegDensity.textContent = zone.vegDensity;
  }

  function updateStats() {
    const filtered = state.selectedZone === 'all' ? REGIONS : REGIONS.filter(r => r.zone === state.selectedZone);
    const exploredInFilter = filtered.filter(r => state.explored.includes(r.id));

    statRegions.textContent = `${exploredInFilter.length}/${filtered.length}`;

    // Calculate avg temp based on explored regions
    let totalTemp = 0; let count = 0;
    exploredInFilter.forEach(r => {
      const match = r.temp.match(/(\d+)/g);
      if (match) { const nums = match.map(Number); totalTemp += (nums.reduce((a,b)=>a+b,0)/nums.length); count++; }
    });
    statTemp.textContent = count > 0 ? `${(totalTemp/count).toFixed(1)}°C` : '—';

    // Avg rainfall
    let totalRain = 0; let rainCount = 0;
    exploredInFilter.forEach(r => {
      const match = r.rainfall.match(/([\d,]+)/);
      if (match) { totalRain += parseInt(match[1].replace(/,/g,'')); rainCount++; }
    });
    statRainfall.textContent = rainCount > 0 ? `${Math.round(totalRain/rainCount).toLocaleString()} mm` : '—';

    // Biodiversity (explored / total)
    const pct = filtered.length > 0 ? Math.round((exploredInFilter.length / filtered.length) * 100) : 0;
    statBiodiversity.textContent = `${pct}%`;
  }

  function filterByZone(zoneId) {
    state.selectedZone = zoneId;
    saveState();

    // Update UI
    zoneCards.querySelectorAll('.zone-card').forEach(c => {
      const isActive = c.dataset.zone === zoneId;
      c.classList.toggle('zone-card--active', isActive);
      c.setAttribute('aria-selected', isActive.toString());
      c.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    renderRegions(zoneId);
    updateStats();

    if (zoneId === 'all') {
      tbZone.textContent = 'All Zones';
    } else {
      tbZone.textContent = ZONES[zoneId]?.name || zoneId;
      updateCharacteristics(zoneId);
    }

    addFeedItem(`🔍 Filtered to ${zoneId === 'all' ? 'All Climate Zones' : ZONES[zoneId]?.name || zoneId} zone`, '#38bdf8');
  }

  function switchOverlay(type) {
    state.activeOverlay = type;
    saveState();

    overlayControls.querySelectorAll('.overlay-btn').forEach(b => {
      const isActive = b.dataset.overlay === type;
      b.classList.toggle('overlay-btn--active', isActive);
      b.setAttribute('aria-pressed', isActive.toString());
    });

    renderOverlay(type);
  }

  /* ==============================================================
     VI. INFO PANEL
     ============================================================== */

  function openInfoModal(regionId) {
    const region = getRegion(regionId);
    if (!region) return;
    const zone = ZONES[region.zone];

    infoModalTitle.textContent = region.name;
    infoModalBody.innerHTML = `
      <div class="detail-header">
        <span class="detail-zone-badge" style="background:${zone.color}22;color:${zone.color};border:1px solid ${zone.color}44">${zone.icon} ${zone.name}</span>
        <span class="detail-name">${region.name}</span>
      </div>
      <div class="detail-meta">
        <div class="detail-meta-item"><span class="detail-meta-label">Continent</span><span class="detail-meta-value">${region.continent}</span></div>
        <div class="detail-meta-item"><span class="detail-meta-label">Coordinates</span><span class="detail-meta-value">${region.coords}</span></div>
        <div class="detail-meta-item"><span class="detail-meta-label">Avg Temperature</span><span class="detail-meta-value">${region.temp}</span></div>
        <div class="detail-meta-item"><span class="detail-meta-label">Rainfall</span><span class="detail-meta-value">${region.rainfall}</span></div>
        <div class="detail-meta-item"><span class="detail-meta-label">Humidity</span><span class="detail-meta-value">${region.humidity}</span></div>
        <div class="detail-meta-item"><span class="detail-meta-label">Growing Season</span><span class="detail-meta-value">${region.growingSeason}</span></div>
      </div>
      <div class="detail-section-title">🌿 Ecosystem</div>
      <div class="detail-text"><strong>Vegetation:</strong> ${region.vegetation}</div>
      <div class="detail-text"><strong>Wildlife:</strong> ${region.wildlife}</div>
      <div class="detail-text"><strong>Importance:</strong> ${region.importance}</div>
      <div class="detail-section-title">💡 Climate Facts</div>
      <ul class="detail-facts">${region.facts.map(f=>`<li>${f}</li>`).join('')}</ul>
      <div class="detail-actions">
        <button class="detail-btn" data-bookmark="${region.id}">${state.bookmarks.includes(region.id) ? '📌 Saved' : '📌 Bookmark'}</button>
        <button class="detail-btn" data-compare="${region.id}">⚖️ Compare</button>
        <button class="detail-btn" data-quiz="${region.zone}">📝 Zone Quiz</button>
        <button class="detail-btn" data-fact>💡 Random Fact</button>
      </div>`;

    infoModal.removeAttribute('hidden');
    infoModal.setAttribute('aria-hidden','false');

    infoModalBody.querySelector('[data-bookmark]')?.addEventListener('click',e => {
      const id = e.target.dataset.bookmark;
      toggleBookmark(id);
      e.target.textContent = state.bookmarks.includes(id) ? '📌 Saved' : '📌 Bookmark';
    });
    infoModalBody.querySelector('[data-compare]')?.addEventListener('click',e => {
      closeAllModals();
      setTimeout(() => openCompareModal(e.target.dataset.compare), 200);
    });
    infoModalBody.querySelector('[data-quiz]')?.addEventListener('click',e => {
      closeAllModals();
      setTimeout(() => openQuizModal(e.target.dataset.quiz), 200);
    });
    infoModalBody.querySelector('[data-fact]')?.addEventListener('click', showRandomFact);

    infoModalClose.onclick = closeAllModals;
    infoModal.addEventListener('click',e => { if (e.target === infoModal) closeAllModals(); });
  }

  /* ==============================================================
     VII. COMPARISON
     ============================================================== */

  function openCompareModal(regionId1) {
    const region1 = getRegion(regionId1);
    if (!region1) return;

    const otherRegions = REGIONS.filter(r => r.id !== regionId1);
    compareModalTitle.textContent = 'Climate Zone Comparison';
    compareModalBody.innerHTML = `
      <div class="compare-picker">
        <select id="compLeft"><option value="${region1.id}">${region1.name}</option></select>
        <select id="compRight">${otherRegions.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>
      </div>
      <div class="compare-grid" id="compGrid"></div>`;

    compareModal.removeAttribute('hidden');
    compareModal.setAttribute('aria-hidden','false');
    compareModalClose.onclick = closeAllModals;
    compareModal.addEventListener('click',e => { if (e.target === compareModal) closeAllModals(); });

    function renderComparison(r1, r2) {
      if (!r1 || !r2) return;
      state.compares++;
      saveState();
      checkAchievements();
      const z1 = ZONES[r1.zone], z2 = ZONES[r2.zone];
      const metrics = [
        { label:'Climate Zone', v1:z1.name, v2:z2.name },
        { label:'Continent', v1:r1.continent, v2:r2.continent },
        { label:'Temperature', v1:r1.temp, v2:r2.temp },
        { label:'Rainfall', v1:r1.rainfall, v2:r2.rainfall },
        { label:'Humidity', v1:r1.humidity, v2:r2.humidity },
        { label:'Growing Season', v1:r1.growingSeason, v2:r2.growingSeason },
        { label:'Vegetation', v1:r1.vegetation, v2:r2.vegetation },
      ];
      const grid = $('compGrid');
      if (!grid) return;
      grid.innerHTML = `<div class="compare-column"><h3 style="color:${z1.color}">${r1.name}</h3>${metrics.map(m => `<div class="compare-row"><span class="compare-label">${m.label}</span><span class="compare-value">${m.v1}</span></div>`).join('')}</div>
        <div class="compare-column"><h3 style="color:${z2.color}">${r2.name}</h3>${metrics.map(m => `<div class="compare-row"><span class="compare-label">${m.label}</span><span class="compare-value">${m.v2}</span></div>`).join('')}</div>`;
    }

    const selLeft = $('compLeft');
    const selRight = $('compRight');
    if (selLeft && selRight) {
      renderComparison(region1, getRegion(selRight.value));
      selRight.addEventListener('change', () => renderComparison(region1, getRegion(selRight.value)));
    }
  }

  /* ==============================================================
     VIII. QUIZ
     ============================================================== */

  function openQuizModal(zoneId) {
    const available = zoneId ? QUIZZES : QUIZZES;
    const quiz = available[Math.floor(Math.random() * available.length)];
    if (!quiz) { showToast('No quizzes available','#ef4444'); return; }

    const zoneName = zoneId ? (ZONES[zoneId]?.name || 'Climate') : 'Climate';
    quizModalTitle.textContent = `📝 ${zoneName} Knowledge Quiz`;
    quizModalBody.innerHTML = `
      <p class="quiz-question">${quiz.q}</p>
      <div class="quiz-options">${quiz.o.map((opt,i) => `<button class="quiz-option" data-idx="${i}">${opt}</button>`).join('')}</div>
      <div id="quizResultWrap"></div>`;

    quizModal.removeAttribute('hidden');
    quizModal.setAttribute('aria-hidden','false');
    quizModalClose.onclick = closeAllModals;
    quizModal.addEventListener('click',e => { if (e.target === quizModal) closeAllModals(); });

    const options = quizModalBody.querySelectorAll('.quiz-option');
    options.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const correct = idx === quiz.a;
        options.forEach((b,i) => {
          b.disabled = true;
          if (i === quiz.a) b.classList.add('quiz-option--correct');
          if (i === idx && !correct) b.classList.add('quiz-option--wrong');
        });
        state.completedQuizzes.push(quiz.q.slice(0,40));
        state.quizScore++;
        saveState();
        checkAchievements();

        const wrap = $('quizResultWrap');
        if (wrap) {
          wrap.innerHTML = `<div class="quiz-result ${correct ? 'quiz-result--correct' : 'quiz-result--wrong'}">
            ${correct ? '✅ Correct!' : '❌ Not quite!'} ${correct ? '' : `Answer: <strong>${quiz.o[quiz.a]}</strong>`}
          </div>
          <div class="quiz-result quiz-result--correct">${quiz.f}</div>
          <div class="quiz-score">Quizzes completed: ${state.quizScore}</div>`;
        }
        addFeedItem(`${correct ? '✅' : '📝'} ${correct ? 'Correct' : 'Completed'} quiz question`, correct ? '#22c55e' : '#64748b');
      });
    });
  }

  /* ==============================================================
     IX. BOOKMARKS
     ============================================================== */

  function toggleBookmark(regionId) {
    const idx = state.bookmarks.indexOf(regionId);
    if (idx >= 0) state.bookmarks.splice(idx,1);
    else state.bookmarks.push(regionId);
    saveState();
    checkAchievements();
    showToast(state.bookmarks.includes(regionId) ? '📌 Region bookmarked' : '📌 Bookmark removed', '#38bdf8');
  }

  function openBookmarkModal() {
    bookmarkModalBody.innerHTML = state.bookmarks.length === 0
      ? '<p class="bm-empty">No saved regions yet. Explore the map and bookmark regions you find interesting!</p>'
      : `<div class="bm-list">${state.bookmarks.map(id => {
          const r = getRegion(id); if (!r) return '';
          const z = ZONES[r.zone];
          return `<div class="bm-item">
            <div class="bm-item-info"><span class="bm-item-name">${r.name}</span><span class="bm-item-zone" style="color:${z.color}">${z.name} • ${r.continent}</span></div>
            <button class="bm-item-remove" data-bm="${id}">Remove</button>
          </div>`;
        }).join('')}</div>`;

    bookmarkModal.removeAttribute('hidden');
    bookmarkModal.setAttribute('aria-hidden','false');
    bookmarkModalClose.onclick = closeAllModals;
    bookmarkModal.addEventListener('click',e => { if (e.target === bookmarkModal) closeAllModals(); });

    bookmarkModalBody.querySelectorAll('[data-bm]').forEach(b => {
      b.addEventListener('click', () => {
        toggleBookmark(b.dataset.bm);
        openBookmarkModal();
      });
    });
  }

  /* ==============================================================
     X. CLIMATE CHANGE SCENARIO
     ============================================================== */

  function openClimateModal() {
    const scenarios = [
      { label:'Pre-industrial (1850)', temp:'13.7°C', co2:'280 ppm', desc:'Before significant human industrial activity. Natural climate systems in balance.' },
      { label:'Present Day', temp:'14.8°C', co2:'420 ppm', desc:'Current conditions. Global temperatures have risen 1.2°C since pre-industrial times.' },
      { label:'+1.5°C Scenario (2040)', temp:'16.0°C', co2:'450 ppm', desc:'Paris Agreement target. Coral reefs may decline by 70-90%. Arctic summer ice likely gone.' },
      { label:'+2.0°C Scenario (2060)', temp:'16.8°C', co2:'500 ppm', desc:'Critical threshold. Up to 30% of species face extinction. Extreme weather events intensify.' },
      { label:'+3.0°C Scenario (2080)', temp:'17.8°C', co2:'600 ppm', desc:'High-emissions pathway. Widespread desertification, coastal flooding, food system collapse risks.' }
    ];

    climateModalTitle.textContent = '🌡️ Climate Change Scenario Simulator';
    climateModalBody.innerHTML = `
      <input type="range" class="scenario-slider" id="scenarioSlider" min="0" max="${scenarios.length-1}" value="${state.scenarioLevel}" step="1">
      <div class="scenario-labels">${scenarios.map((s,i) => `<span>${i===0||i===scenarios.length-1?s.label.split('(')[0].trim():''}</span>`).join('')}</div>
      <div class="scenario-info" id="scenarioInfo">${renderScenarioInfo(scenarios[state.scenarioLevel])}</div>`;

    climateModal.removeAttribute('hidden');
    climateModal.setAttribute('aria-hidden','false');
    climateModalClose.onclick = closeAllModals;
    climateModal.addEventListener('click',e => { if (e.target === climateModal) closeAllModals(); });

    const slider = $('scenarioSlider');
    if (slider) {
      slider.addEventListener('input', () => {
        const idx = parseInt(slider.value);
        state.scenarioLevel = idx;
        saveState();
        const info = $('scenarioInfo');
        if (info) info.innerHTML = renderScenarioInfo(scenarios[idx]);
      });
    }
  }

  function renderScenarioInfo(s) {
    return `<strong>${s.label}</strong><br>Global Avg Temp: ${s.temp}<br>CO₂: ${s.co2}<br><br>${s.desc}`;
  }

  /* ==============================================================
     XI. EXPORT
     ============================================================== */

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      stats: {
        totalRegions: REGIONS.length,
        explored: state.explored.length,
        bookmarks: state.bookmarks.length,
        quizzesCompleted: state.quizScore,
        totalXP: state.explored.length * 10 + state.quizScore * 15
      },
      exploredRegions: state.explored.map(id => {
        const r = getRegion(id);
        return r ? { name:r.name, zone:r.zone, continent:r.continent, coordinates:r.coords } : null;
      }).filter(Boolean),
      bookmarkedRegions: state.bookmarks.map(id => {
        const r = getRegion(id);
        return r ? { name:r.name, zone:r.zone } : null;
      }).filter(Boolean),
      achievements: state.achievements.map(id => {
        const a = ACHIEVEMENTS.find(x => x.id === id);
        return a ? { name:a.name, description:a.desc } : null;
      }).filter(Boolean)
    };

    const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `climate-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    state.hasExported = true;
    saveState();
    checkAchievements();
    showToast('📦 Climate data exported as JSON','#38bdf8');
  }

  /* ==============================================================
     XII. FACT GENERATOR
     ============================================================== */

  function showRandomFact() {
    const fact = CLIMATE_FACTS[Math.floor(Math.random() * CLIMATE_FACTS.length)];
    state.factsSeen++;
    saveState();
    checkAchievements();

    const badge = document.createElement('div');
    badge.className = 'fact-badge';
    badge.innerHTML = `<div class="fact-badge-icon">💡</div><div class="fact-badge-text">${fact}</div>`;
    document.body.appendChild(badge);
    setTimeout(() => { badge.style.opacity = '0'; setTimeout(() => badge.remove(), 500); }, 5000);

    addFeedItem(`💡 Climate fact discovered`, '#38bdf8');
  }

  /* ==============================================================
     XIII. SEASONAL MODE
     ============================================================== */

  function toggleSeasonal() {
    seasonalMode = !seasonalMode;
    btnSeasonal.style.borderColor = seasonalMode ? 'var(--text-accent)' : 'var(--bg-border)';
    btnSeasonal.style.color = seasonalMode ? 'var(--text-accent)' : 'var(--text-muted)';
    showToast(seasonalMode ? '🌞 Seasonal visualization enabled' : '❄️ Seasonal visualization disabled', '#38bdf8');

    // For seasonal mode, we adjust overlay opacity slightly
    const overlays = overlayGroup.querySelectorAll('.overlay-rect');
    overlays.forEach(el => {
      const currentOp = parseFloat(el.getAttribute('opacity') || '0.15');
      el.setAttribute('opacity', seasonalMode ? (currentOp * 0.7).toFixed(3) : (currentOp / 0.7).toFixed(3));
    });
  }

  /* ==============================================================
     XIV. ACHIEVEMENTS
     ============================================================== */

  function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
      if (!state.achievements.includes(a.id) && a.check(state)) {
        state.achievements.push(a.id);
        showAchievementPopup(a);
        addFeedItem(`🏅 ${a.name}: ${a.desc}`, '#f59e0b');
      }
    });
    saveState();
  }

  function showAchievementPopup(a) {
    const p = document.createElement('div');
    p.className = 'fact-badge';
    p.style.borderColor = 'rgba(245,158,11,0.3)';
    p.innerHTML = `<div class="fact-badge-icon">${a.icon}</div><div class="fact-badge-text" style="color:#f59e0b;font-weight:700">${a.name}</div><div class="fact-badge-text">${a.desc}</div>`;
    document.body.appendChild(p);
    setTimeout(() => { p.style.opacity = '0'; setTimeout(() => p.remove(), 500); }, 4000);
  }

  /* ==============================================================
     XV. FEED
     ============================================================== */

  function addFeedItem(text, color) {
    const empty = feedContainer.querySelector('.feed-empty');
    if (empty) empty.remove();
    const item = document.createElement('div');
    item.className = 'feed-item';
    const dot = document.createElement('span');
    dot.className = 'feed-dot';
    dot.style.background = color || '#38bdf8';
    item.appendChild(dot);
    item.appendChild(document.createTextNode(text));
    feedContainer.appendChild(item);
    feedContainer.scrollTop = feedContainer.scrollHeight;
  }

  function showToast(message, color) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderColor = color || 'var(--glass-border)';
    t.textContent = message;
    toastContainer.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  function closeAllModals() {
    [infoModal, compareModal, quizModal, bookmarkModal, climateModal].forEach(m => {
      m.setAttribute('hidden','');
      m.setAttribute('aria-hidden','true');
    });
  }

  /* ==============================================================
     XVI. KEYBOARD
     ============================================================== */

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
    if (e.key === 'r' && !document.querySelector('.modal-overlay:not([hidden])')) showRandomFact();
  });

  /* ==============================================================
     XVII. INIT
     ============================================================== */

  function init() {
    // Zone card click handlers
    zoneCards.querySelectorAll('.zone-card').forEach(card => {
      card.addEventListener('click', () => filterByZone(card.dataset.zone));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); filterByZone(card.dataset.zone); }
      });
    });

    // Overlay button handlers
    const overlayControls = $('overlayControls');
    overlayControls.querySelectorAll('.overlay-btn').forEach(btn => {
      btn.addEventListener('click', () => switchOverlay(btn.dataset.overlay));
    });

    // Toolbar buttons
    btnSeasonal.addEventListener('click', toggleSeasonal);
    btnCompare.addEventListener('click', () => {
      if (selectedRegionId) openCompareModal(selectedRegionId);
      else showToast('Select a region first to compare','#f59e0b');
    });
    btnQuiz.addEventListener('click', () => openQuizModal(null));
    btnExport.addEventListener('click', exportData);

    // Key shortcut for bookmarks (B key)
    document.addEventListener('keydown', e => {
      if ((e.key === 'b' || e.key === 'B') && !document.querySelector('.modal-overlay:not([hidden])')) {
        openBookmarkModal();
      }
      if (e.key === 'c' && !document.querySelector('.modal-overlay:not([hidden])')) openClimateModal();
    });

    // Initial render
    renderMap();
    filterByZone('all');

    // Restore feed from previous session
    if (state.explored.length > 0) {
      addFeedItem(`👋 Welcome back! Explored ${state.explored.length} regions. Press 'R' for random facts.`, '#38bdf8');
    } else {
      addFeedItem('👋 Welcome! Click a region on the map to begin exploring Earth\'s climate zones.', '#38bdf8');
    }
  }

  init();
})();
