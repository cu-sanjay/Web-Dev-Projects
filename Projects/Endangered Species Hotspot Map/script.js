/* ============================================================
   Endangered Species Hotspot Map — Application Engine
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1.  ENDANGERED SPECIES DATABASE
     ========================================================== */

  const SPECIES = [
    {
      id: 'bengal-tiger',
      name: 'Bengal Tiger',
      scientific: 'Panthera tigris tigris',
      category: 'mammal',
      status: 'endangered',
      population: '2,600',
      region: 'Asia',
      lat: 22, lng: 80,
      climate: 'Tropical / Subtropical',
      habitat: 'Tropical forests, mangroves, grasslands',
      range: 'India, Bangladesh, Nepal, Bhutan',
      threats: [
        { name: 'Habitat Loss', pct: 85 },
        { name: 'Poaching', pct: 90 },
        { name: 'Human Conflict', pct: 70 },
        { name: 'Prey Depletion', pct: 65 },
        { name: 'Climate Change', pct: 40 }
      ],
      conservation: [
        'Project Tiger (India) — 50+ protected reserves',
        'WWF Tigers Alive Initiative',
        'Global Tiger Recovery Program (GTRP)',
        'Anti-poaching patrols and camera trap monitoring',
        'Community-based conservation in the Sundarbans'
      ],
      facts: [
        'Each Bengal Tiger has a unique stripe pattern, like human fingerprints.',
        'They can consume up to 40 kg of meat in a single meal.',
        'Bengal Tigers are apex predators and control prey populations.',
        'Their roar can be heard from up to 3 km away.',
        'They are excellent swimmers and often hunt in water.'
      ],
      ecologicalRole: 'Keystone predator regulating herbivore populations and maintaining ecosystem balance.',
      popHistory: [50000, 30000, 15000, 8000, 4500, 3500, 2600],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    },
    {
      id: 'snow-leopard',
      name: 'Snow Leopard',
      scientific: 'Panthera uncia',
      category: 'mammal',
      status: 'vulnerable',
      population: '4,000–6,500',
      region: 'Asia',
      lat: 32, lng: 80,
      climate: 'Alpine / Cold arid',
      habitat: 'High-altitude mountain ranges',
      range: 'Himalayas, Central Asia, Mongolia',
      threats: [
        { name: 'Habitat Loss', pct: 60 },
        { name: 'Climate Change', pct: 80 },
        { name: 'Poaching', pct: 55 },
        { name: 'Human Conflict', pct: 50 },
        { name: 'Prey Decline', pct: 65 }
      ],
      conservation: [
        'Global Snow Leopard Ecosystem Protection Program (GSLEP)',
        'Snow Leopard Trust community conservation',
        'Transboundary protected area networks',
        'Livestock insurance programs to reduce conflict',
        'Camera trap monitoring across 12 range countries'
      ],
      facts: [
        'Snow leopards can leap up to 15 meters in a single bound.',
        'Their thick fur acts as a natural sleeping bag.',
        'They use their long tails as blankets to cover their faces during sleep.',
        'Snow leopards are crepuscular — most active at dawn and dusk.',
        'They cannot roar, unlike other big cats.'
      ],
      ecologicalRole: 'Indicator species for high-altitude ecosystem health.',
      popHistory: [10000, 8500, 7500, 6500, 5500, 5000, 4500],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    },
    {
      id: 'giant-panda',
      name: 'Giant Panda',
      scientific: 'Ailuropoda melanoleuca',
      category: 'mammal',
      status: 'vulnerable',
      population: '1,864',
      region: 'Asia',
      lat: 30, lng: 103,
      climate: 'Temperate / Subtropical',
      habitat: 'Bamboo forests',
      range: 'South-central China (Sichuan, Shaanxi, Gansu)',
      threats: [
        { name: 'Habitat Loss', pct: 75 },
        { name: 'Low Birth Rate', pct: 60 },
        { name: 'Bamboo Decline', pct: 70 },
        { name: 'Fragmentation', pct: 65 },
        { name: 'Climate Change', pct: 55 }
      ],
      conservation: [
        'China\'s Giant Panda National Park (27,000 km²)',
        'Captive breeding programs with 600+ pandas',
        'Bamboo corridor restoration projects',
        'International Giant Panda合作协议',
        'WWF flagship species program'
      ],
      facts: [
        'Pandas spend 10–16 hours a day eating bamboo — up to 38 kg daily.',
        'They have a special thumb-like wrist bone for gripping bamboo.',
        'Newborn pandas are tiny — only 1/900th the size of their mother.',
        'Pandas are excellent climbers from 6 months old.',
        'Their black-and-white coloring provides camouflage in snowy and shady forests.'
      ],
      ecologicalRole: 'Umbrella species — protecting pandas protects entire bamboo forest ecosystems.',
      popHistory: [1000, 800, 1100, 1500, 1600, 1800, 1864],
      popLabels: ['1970', '1980', '1990', '2000', '2010', '2018', '2024']
    },
    {
      id: 'orangutan',
      name: 'Orangutan',
      scientific: 'Pongo pygmaeus',
      category: 'mammal',
      status: 'critical',
      population: '55,000',
      region: 'Asia',
      lat: -1, lng: 115,
      climate: 'Tropical rainforest',
      habitat: 'Lowland and montane rainforests',
      range: 'Borneo and Sumatra (Indonesia, Malaysia)',
      threats: [
        { name: 'Deforestation', pct: 95 },
        { name: 'Palm Oil', pct: 90 },
        { name: 'Poaching', pct: 50 },
        { name: 'Pet Trade', pct: 45 },
        { name: 'Forest Fires', pct: 70 }
      ],
      conservation: [
        'Borneo Orangutan Survival Foundation (BOSF)',
        'Sumatran Orangutan Conservation Programme',
        'Palm oil certification (RSPO) initiatives',
        'Reintroduction and rehabilitation centers',
        'Protected areas like Gunung Leuser National Park'
      ],
      facts: [
        'Orangutans share 97% of their DNA with humans.',
        'They build new nests in trees every single night.',
        'Mothers care for their young for up to 8 years — the longest of any animal.',
        'Orangutans use tools like leaves as umbrellas and gloves.',
        'Their name means "person of the forest" in Malay.'
      ],
      ecologicalRole: 'Seed disperser — over 500 plant species depend on orangutans.',
      popHistory: [230000, 180000, 120000, 80000, 60000, 55000, 55000],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    },
    {
      id: 'black-rhino',
      name: 'Black Rhino',
      scientific: 'Diceros bicornis',
      category: 'mammal',
      status: 'critical',
      population: '6,487',
      region: 'Africa',
      lat: -20, lng: 25,
      climate: 'Tropical / Subtropical',
      habitat: 'Savanna, scrubland, deserts',
      range: 'Southern and Eastern Africa',
      threats: [
        { name: 'Poaching', pct: 98 },
        { name: 'Horn Trade', pct: 95 },
        { name: 'Habitat Loss', pct: 60 },
        { name: 'Civil Unrest', pct: 40 },
        { name: 'Inbreeding', pct: 30 }
      ],
      conservation: [
        'Intensive anti-poaching patrols and ranger units',
        'Rhino translocation to safer habitats',
        'DNA tracking of rhino horn trade',
        'Community conservancies (e.g., Namibia\'s communal lands)',
        'Dehorning programs to deter poachers'
      ],
      facts: [
        'Black rhinos are not actually black — they are grayish-brown.',
        'They have a prehensile upper lip for grasping leaves and branches.',
        'A rhino\'s horn is made of keratin, like human fingernails.',
        'They can run at speeds up to 55 km/h (34 mph).',
        'Black rhinos have poor eyesight but excellent hearing and smell.'
      ],
      ecologicalRole: 'Megaherbivore shaping savanna vegetation structure.',
      popHistory: [100000, 65000, 15000, 2500, 3500, 5000, 6487],
      popLabels: ['1900', '1950', '1970', '1990', '2005', '2014', '2024']
    },
    {
      id: 'african-wild-dog',
      name: 'African Wild Dog',
      scientific: 'Lycaon pictus',
      category: 'mammal',
      status: 'endangered',
      population: '6,600',
      region: 'Africa',
      lat: -10, lng: 30,
      climate: 'Savanna / Semi-arid',
      habitat: 'Savanna, grasslands, open woodlands',
      range: 'Southern and Eastern Africa (fragmented)',
      threats: [
        { name: 'Habitat Fragmentation', pct: 80 },
        { name: 'Human Conflict', pct: 75 },
        { name: 'Disease', pct: 65 },
        { name: 'Roadkill', pct: 40 },
        { name: 'Climate Change', pct: 35 }
      ],
      conservation: [
        'Painted Dog Conservation (Zimbabwe)',
        'African Wild Dog Range Wide Planning',
        'Community wildlife management programs',
        'Road signage and crossing structures',
        'Vaccination programs for domestic dogs'
      ],
      facts: [
        'African wild dogs have a hunting success rate of 80% — higher than lions.',
        'They have unique coat patterns, like human fingerprints.',
        'Pack members communicate through sneezes to vote on hunting decisions.',
        'They are incredibly social and care for sick and injured pack members.',
        'Wild dogs can run at speeds up to 70 km/h for several kilometers.'
      ],
      ecologicalRole: 'Regulating herbivore populations through pack hunting.',
      popHistory: [500000, 300000, 100000, 30000, 12000, 8000, 6600],
      popLabels: ['1900', '1950', '1970', '1990', '2005', '2014', '2024']
    },
    {
      id: 'mountain-gorilla',
      name: 'Mountain Gorilla',
      scientific: 'Gorilla beringei beringei',
      category: 'mammal',
      status: 'endangered',
      population: '1,063',
      region: 'Africa',
      lat: -1, lng: 29,
      climate: 'Montane / Tropical',
      habitat: 'Mountain rainforests',
      range: 'Virunga Mountains (Rwanda, Uganda, DRC)',
      threats: [
        { name: 'Habitat Loss', pct: 60 },
        { name: 'Poaching', pct: 45 },
        { name: 'Civil Unrest', pct: 70 },
        { name: 'Disease', pct: 55 },
        { name: 'Climate Change', pct: 30 }
      ],
      conservation: [
        'Karisoke Research Center (Dian Fossey Gorilla Fund)',
        'International Gorilla Conservation Programme (IGCP)',
        'Gorilla trekking ecotourism revenue sharing',
        'Transboundary Virunga Conservation Area',
        'Veterinary monitoring and intervention programs'
      ],
      facts: [
        'Mountain gorillas share 98% of their DNA with humans.',
        'Gorilla groups are led by a dominant silverback male.',
        'They rarely drink water — they get moisture from their food.',
        'Each gorilla has a distinct nose print, like human fingerprints.',
        'Despite their size, they are gentle and rarely aggressive.'
      ],
      ecologicalRole: 'Seed disperser and ecosystem engineer of montane forests.',
      popHistory: [620, 480, 400, 320, 380, 600, 1063],
      popLabels: ['1950', '1970', '1980', '1990', '2000', '2010', '2024']
    },
    {
      id: 'ethiopian-wolf',
      name: 'Ethiopian Wolf',
      scientific: 'Canis simensis',
      category: 'mammal',
      status: 'endangered',
      population: '500',
      region: 'Africa',
      lat: 9, lng: 39,
      climate: 'Alpine / Afromontane',
      habitat: 'High-altitude grasslands and heathlands',
      range: 'Ethiopian Highlands (isolated pockets)',
      threats: [
        { name: 'Habitat Loss', pct: 75 },
        { name: 'Disease', pct: 80 },
        { name: 'Human Encroachment', pct: 65 },
        { name: 'Climate Change', pct: 60 },
        { name: 'Roadkill', pct: 30 }
      ],
      conservation: [
        'Ethiopian Wolf Conservation Programme (EWCP)',
        'Vaccination campaigns for domestic dogs',
        'Community-based grassland management',
        'Protected area expansion in Bale Mountains',
        'Livestock guardian dog programs'
      ],
      facts: [
        'The Ethiopian wolf is the rarest canid species in the world.',
        'It is also called the "red jackal" or "Simien fox."',
        'They feed almost exclusively on giant mole rats.',
        'Ethiopian wolves are found only above 3,000 meters elevation.',
        'They are more closely related to gray wolves than to coyotes.'
      ],
      ecologicalRole: 'Specialist predator of high-altitude rodent populations.',
      popHistory: [2000, 1500, 1200, 800, 600, 500, 500],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    },
    {
      id: 'california-condor',
      name: 'California Condor',
      scientific: 'Gymnogyps californianus',
      category: 'bird',
      status: 'critical',
      population: '347',
      region: 'North America',
      lat: 35, lng: -119,
      climate: 'Mediterranean / Temperate',
      habitat: 'Rocky cliffs, canyons, forests',
      range: 'California, Arizona, Utah, Baja California',
      threats: [
        { name: 'Lead Poisoning', pct: 90 },
        { name: 'Habitat Loss', pct: 40 },
        { name: 'Microtrash', pct: 60 },
        { name: 'Disease', pct: 30 },
        { name: 'Wind Turbines', pct: 25 }
      ],
      conservation: [
        'USFWS California Condor Recovery Program',
        'Captive breeding at San Diego and LA Zoos',
        'Lead-free ammunition education programs',
        'Wild condor release and monitoring',
        'Veterinary care and treatment facilities'
      ],
      facts: [
        'California condors have the largest wingspan of any North American bird (3 meters).',
        'They can fly at speeds up to 90 km/h and soar at 4,500 meters.',
        'Condors are scavengers and play a vital role in ecosystem health.',
        'They were down to just 22 individuals in 1982 before recovery efforts began.',
        'Condors mate for life and may live 60+ years in the wild.'
      ],
      ecologicalRole: 'Essential scavenger preventing disease spread through carcass disposal.',
      popHistory: [100, 50, 22, 52, 150, 250, 347],
      popLabels: ['1950', '1970', '1982', '1995', '2005', '2014', '2024']
    },
    {
      id: 'red-wolf',
      name: 'Red Wolf',
      scientific: 'Canis rufus',
      category: 'mammal',
      status: 'critical',
      population: '15–17',
      region: 'North America',
      lat: 35.5, lng: -76,
      climate: 'Temperate subtropical',
      habitat: 'Coastal marshes, forests, swamps',
      range: 'Eastern North Carolina (reintroduced)',
      threats: [
        { name: 'Hybridization', pct: 85 },
        { name: 'Habitat Loss', pct: 70 },
        { name: 'Poaching', pct: 60 },
        { name: 'Road Mortality', pct: 50 },
        { name: 'Human Intolerance', pct: 65 }
      ],
      conservation: [
        'USFWS Red Wolf Recovery Program',
        'Captive breeding (240+ in 40+ facilities)',
        'Red Wolf SAFE (Species Survival Plan)',
        'Hazing and coexistence education',
        'Genetic diversity management program'
      ],
      facts: [
        'Red wolves are the most endangered canid species in the world.',
        'They are smaller than gray wolves but larger than coyotes.',
        'Red wolves were declared extinct in the wild in 1980 before reintroduction.',
        'They help control deer and nutria populations in their ecosystem.',
        'Red wolves mate for life and maintain strict pack hierarchies.'
      ],
      ecologicalRole: 'Mesopredator controller maintaining prey balance in coastal ecosystems.',
      popHistory: [10000, 0, 0, 100, 120, 90, 16],
      popLabels: ['1800', '1970', '1980', '1995', '2005', '2014', '2024']
    },
    {
      id: 'golden-lion-tamarin',
      name: 'Golden Lion Tamarin',
      scientific: 'Leontopithecus rosalia',
      category: 'mammal',
      status: 'endangered',
      population: '3,200',
      region: 'South America',
      lat: -22, lng: -42,
      climate: 'Tropical / Atlantic forest',
      habitat: 'Coastal lowland rainforests',
      range: 'Atlantic Forest, Brazil (Rio de Janeiro state)',
      threats: [
        { name: 'Deforestation', pct: 85 },
        { name: 'Habitat Fragmentation', pct: 80 },
        { name: 'Pet Trade', pct: 40 },
        { name: 'Disease', pct: 35 },
        { name: 'Road Mortality', pct: 25 }
      ],
      conservation: [
        'Golden Lion Tamarin Association (AMLD)',
        'Reintroduction of captive-born tamarins',
        'Atlantic Forest corridor restoration',
        'Private reserve network (RPPN) program',
        'Yellow fever vaccination for wild tamarins'
      ],
      facts: [
        'Golden lion tamarins get their name from their striking fiery-orange mane.',
        'They are tiny — weighing only 400–800 grams.',
        'Females typically give birth to twins each year.',
        'They eat fruit, insects, small birds, and tree sap.',
        'Golden lion tamarins communicate with over 17 distinct vocalizations.'
      ],
      ecologicalRole: 'Seed disperser critical for Atlantic Forest regeneration.',
      popHistory: [200, 150, 250, 800, 1800, 2600, 3200],
      popLabels: ['1950', '1970', '1980', '1995', '2005', '2014', '2024']
    },
    {
      id: 'amazon-dolphin',
      name: 'Amazon River Dolphin',
      scientific: 'Inia geoffrensis',
      category: 'marine',
      status: 'endangered',
      population: '10,000+',
      region: 'South America',
      lat: -3, lng: -60,
      climate: 'Tropical rainforest',
      habitat: 'Amazon and Orinoco river systems',
      range: 'Amazon Basin (Brazil, Peru, Colombia, Venezuela)',
      threats: [
        { name: 'Dams', pct: 75 },
        { name: 'Pollution', pct: 65 },
        { name: 'Fisheries Bycatch', pct: 60 },
        { name: 'Mercury from Gold Mining', pct: 80 },
        { name: 'Boat Traffic', pct: 45 }
      ],
      conservation: [
        'WWF Amazon River Dolphin Initiative',
        'Projeto Boto (Brazilian research program)',
        'Mercury-free gold mining campaigns',
        'Protected area design along river corridors',
        'Community-based dolphin monitoring'
      ],
      facts: [
        'Amazon river dolphins are the largest river dolphins in the world.',
        'They can turn their necks 180 degrees — unlike ocean dolphins.',
        'Their pink coloration intensifies during mating season.',
        'They use echolocation to navigate through muddy Amazon waters.',
        'Amazon river dolphins are considered sacred in local folklore.'
      ],
      ecologicalRole: 'Indicator species for freshwater ecosystem health in the Amazon Basin.',
      popHistory: [30000, 25000, 20000, 16000, 13000, 11000, 10000],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    },
    {
      id: 'koala',
      name: 'Koala',
      scientific: 'Phascolarctos cinereus',
      category: 'mammal',
      status: 'vulnerable',
      population: '50,000–80,000',
      region: 'Australia',
      lat: -28, lng: 148,
      climate: 'Temperate / Subtropical',
      habitat: 'Eucalyptus forests and woodlands',
      range: 'Eastern and southeastern Australia',
      threats: [
        { name: 'Habitat Loss', pct: 85 },
        { name: 'Bushfires', pct: 90 },
        { name: 'Climate Change', pct: 75 },
        { name: 'Disease', pct: 65 },
        { name: 'Roadkill', pct: 50 }
      ],
      conservation: [
        'Australian Koala Foundation conservation planning',
        'Koala Protection (EPBC Act listing)',
        'Habitat corridor restoration programs',
        'Koala hospital and rescue networks',
        'Chlamydia vaccine research program'
      ],
      facts: [
        'Koalas sleep up to 20 hours a day to conserve energy.',
        'They eat only eucalyptus leaves — a toxic food source for most animals.',
        'Koala fingerprints are almost identical to human fingerprints.',
        'Babies are called "joeys" and live in their mother\'s pouch for 6 months.',
        'Koalas have four thumbs on each paw for better gripping.'
      ],
      ecologicalRole: 'Specialist herbivore and indicator of eucalyptus forest health.',
      popHistory: [300000, 200000, 150000, 100000, 80000, 60000, 55000],
      popLabels: ['1800', '1900', '1950', '1980', '2000', '2014', '2024']
    },
    {
      id: 'tasmanian-devil',
      name: 'Tasmanian Devil',
      scientific: 'Sarcophilus harrisii',
      category: 'mammal',
      status: 'endangered',
      population: '25,000',
      region: 'Australia',
      lat: -42, lng: 146,
      climate: 'Temperate',
      habitat: 'Coastal forests, woodlands, scrublands',
      range: 'Tasmania (Australia)',
      threats: [
        { name: 'DFTD Disease', pct: 95 },
        { name: 'Roadkill', pct: 55 },
        { name: 'Habitat Loss', pct: 40 },
        { name: 'Climate Change', pct: 35 },
        { name: 'Fox Predation', pct: 20 }
      ],
      conservation: [
        'Save the Tasmanian Devil Program (STDP)',
        'Devil Ark insurance population program',
        'DFTD vaccine research project',
        'Road mortality mitigation measures',
        'Island sanctuaries for disease-free populations'
      ],
      facts: [
        'Tasmanian devils have the strongest bite force relative to body size of any mammal.',
        'Devil Facial Tumor Disease (DFTD) is one of only three known contagious cancers.',
        'They are nocturnal and hunt alone despite their social reputation.',
        'Pregnant females have 20–30 embryos but only 2–4 survive.',
        'Their blood-curdling screams earned them the name "devil."'
      ],
      ecologicalRole: 'Scavenger and predator controlling small mammal and carrion populations.',
      popHistory: [100000, 90000, 70000, 50000, 35000, 28000, 25000],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    },
    {
      id: 'blue-whale',
      name: 'Blue Whale',
      scientific: 'Balaenoptera musculus',
      category: 'marine',
      status: 'endangered',
      population: '10,000–25,000',
      region: 'Oceans',
      lat: 0, lng: -40,
      climate: 'Global (Polar to Tropical)',
      habitat: 'Open ocean',
      range: 'All major oceans, migrating between poles',
      threats: [
        { name: 'Ship Strikes', pct: 70 },
        { name: 'Climate Change', pct: 75 },
        { name: 'Noise Pollution', pct: 60 },
        { name: 'Entanglement', pct: 50 },
        { name: 'Historical Whaling', pct: 95 }
      ],
      conservation: [
        'International Whaling Commission (IWC) moratorium',
        'Ship speed reduction zones',
        'Blue Whale Conservation Network (BCN)',
        'Satellite tracking and migration mapping',
        'Whale-safe shipping lane redesign'
      ],
      facts: [
        'Blue whales are the largest animals ever known to have existed.',
        'Their heart is the size of a small car and can be heard from 2 km away.',
        'A blue whale can consume up to 4 tons of krill per day.',
        'Their calls can travel thousands of kilometers underwater.',
        'Calves gain 90 kg per day drinking their mother\'s milk.'
      ],
      ecologicalRole: 'Ocean nutrient cycler — their waste fertilizes phytoplankton, the base of the marine food web.',
      popHistory: [350000, 12000, 8000, 10000, 15000, 18000, 20000],
      popLabels: ['1900', '1950', '1970', '1990', '2005', '2014', '2024']
    },
    {
      id: 'hawksbill-turtle',
      name: 'Hawksbill Sea Turtle',
      scientific: 'Eretmochelys imbricata',
      category: 'reptile',
      status: 'critical',
      population: '25,000',
      region: 'Oceans',
      lat: 10, lng: -75,
      climate: 'Tropical / Subtropical',
      habitat: 'Coral reefs, lagoons, coastal waters',
      range: 'Tropical oceans worldwide',
      threats: [
        { name: 'Turtle Shell Trade', pct: 85 },
        { name: 'Bycatch', pct: 75 },
        { name: 'Coral Reef Loss', pct: 80 },
        { name: 'Climate Change', pct: 70 },
        { name: 'Coastal Development', pct: 65 }
      ],
      conservation: [
        'CITES Appendix I listing (banning shell trade)',
        'Sea turtle nesting beach protection',
        'Bycatch reduction device (BRD) programs',
        'Coral reef restoration projects',
        'Community-based conservation in nesting sites'
      ],
      facts: [
        'Hawksbills are named for their narrow, bird-like beak.',
        'They are the only sea turtles that feed primarily on sponges.',
        'Their shells are made of overlapping scutes of keratin.',
        'Hawksbills help maintain coral reef health by controlling sponge growth.',
        'Females return to the same beach where they were born to lay eggs.'
      ],
      ecologicalRole: 'Coral reef keystone species maintaining sponge-coral balance.',
      popHistory: [1000000, 500000, 200000, 100000, 50000, 30000, 25000],
      popLabels: ['1900', '1950', '1970', '1990', '2005', '2014', '2024']
    },
    {
      id: 'vaquita',
      name: 'Vaquita',
      scientific: 'Phocoena sinus',
      category: 'marine',
      status: 'critical',
      population: '10',
      region: 'Oceans',
      lat: 30, lng: -114,
      climate: 'Subtropical / Arid',
      habitat: 'Shallow coastal lagoons',
      range: 'Upper Gulf of California, Mexico',
      threats: [
        { name: 'Gillnet Bycatch', pct: 99 },
        { name: 'Illegal Fishing', pct: 95 },
        { name: 'Habitat Degradation', pct: 60 },
        { name: 'Inbreeding', pct: 50 },
        { name: 'Pollution', pct: 40 }
      ],
      conservation: [
        'VaquitaCPR (emergency recovery program)',
        'Gillnet ban in the Upper Gulf of California',
        'International trade sanctions enforcement',
        'Acoustic monitoring system network',
        'Alternative gear development for local fishers'
      ],
      facts: [
        'The vaquita is the world\'s most endangered marine mammal.',
        'There are only about 10 individuals left in the wild.',
        'They are the smallest living cetacean species.',
        'Vaquitas are shy and rarely seen — they spend most of their time underwater.',
        'The name "vaquita" means "little cow" in Spanish.'
      ],
      ecologicalRole: 'Indicator species for the health of the Gulf of California ecosystem.',
      popHistory: [1000, 800, 500, 300, 100, 30, 10],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    },
    {
      id: 'polar-bear',
      name: 'Polar Bear',
      scientific: 'Ursus maritimus',
      category: 'mammal',
      status: 'vulnerable',
      population: '26,000',
      region: 'Polar',
      lat: 75, lng: -80,
      climate: 'Polar / Arctic',
      habitat: 'Sea ice, coastal areas',
      range: 'Arctic Circle (Alaska, Canada, Russia, Greenland, Norway)',
      threats: [
        { name: 'Sea Ice Loss', pct: 95 },
        { name: 'Climate Change', pct: 98 },
        { name: 'Pollution', pct: 55 },
        { name: 'Oil Exploration', pct: 45 },
        { name: 'Human Conflict', pct: 35 }
      ],
      conservation: [
        'Polar Bear Conservation Management Plan (USFWS)',
        'Circumpolar Action Plan (Arctic Council)',
        'Indigenous community monitoring programs',
        'Marine mammal protection regulations',
        'Climate change policy advocacy'
      ],
      facts: [
        'Polar bears are classified as marine mammals because of their dependence on sea ice.',
        'They have black skin underneath their white fur for better heat absorption.',
        'A polar bear can smell a seal from 1 km away through 1 meter of ice.',
        'They are the largest land carnivores, weighing up to 700 kg.',
        'Polar bears must eat 50+ seals per year to survive.'
      ],
      ecologicalRole: 'Apex predator of the Arctic marine ecosystem.',
      popHistory: [50000, 40000, 35000, 30000, 28000, 26000, 26000],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    },
    {
      id: 'emperor-penguin',
      name: 'Emperor Penguin',
      scientific: 'Aptenodytes forsteri',
      category: 'bird',
      status: 'endangered',
      population: '265,000',
      region: 'Polar',
      lat: -70, lng: 0,
      climate: 'Polar / Antarctic',
      habitat: 'Antarctic sea ice and coastline',
      range: 'Antarctica',
      threats: [
        { name: 'Sea Ice Loss', pct: 90 },
        { name: 'Climate Change', pct: 95 },
        { name: 'Krill Decline', pct: 65 },
        { name: 'Ocean Acidification', pct: 50 },
        { name: 'Tourism Disturbance', pct: 20 }
      ],
      conservation: [
        'Antarctic Treaty and Protocol on Environmental Protection',
        'Commission for the Conservation of Antarctic Marine Living Resources (CCAMLR)',
        'Marine Protected Areas around Antarctica',
        'Emperor penguin colony monitoring by satellite',
        'Climate change mitigation advocacy'
      ],
      facts: [
        'Emperor penguins are the tallest and heaviest of all penguin species.',
        'They can dive to depths of over 500 meters and hold their breath for 20+ minutes.',
        'Males incubate the single egg on their feet under a brood pouch for 65 days.',
        'They form massive huddles of thousands to survive -60°C temperatures.',
        'Emperor penguins can fast for up to 120 days during the breeding season.'
      ],
      ecologicalRole: 'Indicator species for Antarctic marine ecosystem health.',
      popHistory: [400000, 380000, 350000, 320000, 300000, 280000, 265000],
      popLabels: ['1950', '1970', '1985', '1995', '2005', '2014', '2024']
    }
  ];

  /* ==========================================================
     2.  SUPPORTING DATA
     ========================================================== */

  const CATEGORY_LABELS = {
    mammal: 'Mammal', bird: 'Bird', reptile: 'Reptile',
    amphibian: 'Amphibian', marine: 'Marine Species', insect: 'Insect'
  };

  const CATEGORY_COLORS = {
    mammal: '#f59e0b', bird: '#3b82f6', reptile: '#84cc16',
    amphibian: '#a855f7', marine: '#0ea5e9', insect: '#ec4899'
  };

  const STATUS_LABELS = {
    low: 'Low Risk', vulnerable: 'Vulnerable',
    endangered: 'Endangered', critical: 'Critically Endangered'
  };

  const STATUS_COLORS = {
    low: '#22c55e', vulnerable: '#f59e0b',
    endangered: '#f97316', critical: '#dc2626'
  };

  const REGIONS = ['Asia', 'Africa', 'North America', 'South America', 'Australia', 'Oceans', 'Polar'];

  const RANDOM_FACTS = [
    { fact: 'It is estimated that 150–200 species go extinct every 24 hours.', source: 'UN Environment' },
    { fact: 'Wildlife populations have declined by 69% on average since 1970.', source: 'WWF Living Planet Report' },
    { fact: 'One third of all amphibian species are threatened with extinction.', source: 'IUCN Red List' },
    { fact: 'Over 1 million species are currently at risk of extinction globally.', source: 'IPBES Global Assessment' },
    { fact: 'Coral reefs support 25% of marine life but 50% have been lost.', source: 'NOAA' },
    { fact: 'Poaching has reduced African elephant populations by 60% in a decade.', source: 'UNEP' },
    { fact: 'Illegal wildlife trafficking is worth $23 billion per year.', source: 'UNODC' },
    { fact: 'Protected areas now cover 15% of Earth\'s land surface.', source: 'UNEP-WCMC' },
    { fact: 'Climate change threatens 50% of all species with extinction by 2100.', source: 'IPCC' },
    { fact: 'Conservation efforts saved 48 species from extinction between 1993–2020.', source: 'Conservation Biology' },
    { fact: 'The vaquita is the world\'s most endangered marine mammal with only ~10 left.', source: 'IUCN' },
    { fact: 'Sea turtles have existed for over 100 million years.', source: 'NOAA' }
  ];

  const ACHIEVEMENT_DEFS = [
    { id: 'first-explore', name: 'Wildlife Watcher', desc: 'Explore your first species', icon: '🔍', check: s => s.exploredSpecies.length >= 1 },
    { id: 'explorer-5', name: 'Nature Enthusiast', desc: 'Explore 5 species', icon: '🌿', check: s => s.exploredSpecies.length >= 5 },
    { id: 'explorer-10', name: 'Conservationist', desc: 'Explore 10 species', icon: '🛡️', check: s => s.exploredSpecies.length >= 10 },
    { id: 'explorer-15', name: 'Wildlife Guardian', desc: 'Explore 15 species', icon: '🌟', check: s => s.exploredSpecies.length >= 15 },
    { id: 'all-regions', name: 'Global Tracker', desc: 'Explore all world regions', icon: '🌎', check: s => s.regionsExplored.length >= REGIONS.length },
    { id: 'critical-watch', name: 'Critical Watch', desc: 'Explore 5+ critically endangered species', icon: '⚠️', check: s => s.exploredSpecies.filter(id => getSpecies(id).status === 'critical').length >= 5 },
    { id: 'marine-explorer', name: 'Ocean Guardian', desc: 'Explore 3+ marine species', icon: '🌊', check: s => s.exploredSpecies.filter(id => getSpecies(id).category === 'marine').length >= 3 },
    { id: 'bird-watcher', name: 'Bird Watcher', desc: 'Explore 2+ bird species', icon: '🐦', check: s => s.exploredSpecies.filter(id => getSpecies(id).category === 'bird').length >= 2 },
    { id: 'mammal-tracker', name: 'Mammal Tracker', desc: 'Explore 5+ mammal species', icon: '🐾', check: s => s.exploredSpecies.filter(id => getSpecies(id).category === 'mammal').length >= 5 },
    { id: 'africa-explorer', name: 'Africa Scout', desc: 'Explore all African species', icon: '🦁', check: s => {
      const africaIds = SPECIES.filter(sp => sp.region === 'Africa').map(sp => sp.id);
      return africaIds.every(id => s.exploredSpecies.includes(id));
    }}
  ];

  const SUCCESS_STORIES = [
    {
      species: 'Mountain Gorilla',
      text: 'Mountain gorilla populations have risen from a low of 620 individuals in the 1950s to over 1,063 today — a remarkable recovery driven by intensive anti-poaching patrols, veterinary interventions, and community-based ecotourism programs in Rwanda, Uganda, and the Democratic Republic of Congo.',
      highlight: 'Population increased by 70% since 2000.'
    },
    {
      species: 'California Condor',
      text: 'Once down to just 22 individuals in 1982, the California condor has been brought back from the brink of extinction through a pioneering captive breeding program. Today, over 340 condors exist, with more than half flying free in the wild.',
      highlight: 'Recovered from 22 to 340+ individuals.'
    },
    {
      species: 'Giant Panda',
      text: 'Giant pandas were upgraded from "Endangered" to "Vulnerable" in 2021 thanks to decades of habitat protection and captive breeding. China\'s extensive panda reserve system now protects 67% of the wild population.',
      highlight: 'Status improved from endangered to vulnerable.'
    },
    {
      species: 'Golden Lion Tamarin',
      text: 'Through reintroduction programs and forest corridor restoration, Golden Lion Tamarin numbers have risen from just 200 in the 1950s to over 3,200 today. The Brazilian Atlantic Forest restoration is a global conservation success.',
      highlight: 'Population increased 16-fold since 1950.'
    },
    {
      species: 'Black Rhino',
      text: 'Black rhino populations have rebounded from a low of 2,500 in 1990 to over 6,400 today. Intensive protection and translocation programs in South Africa, Namibia, and Kenya have driven the recovery.',
      highlight: 'Population more than doubled since 1990.'
    }
  ];

  /* ==========================================================
     3.  STATE MANAGEMENT
     ========================================================== */

  const STORAGE_KEY = 'endangeredSpeciesMap';

  let state = {
    selectedSpecies: null,
    selectedRegion: null,
    selectedCategory: null,
    exploredSpecies: [],
    regionsExplored: [],
    activeFilters: ['all'],
    mapZoomLevel: 1,
    heatmapVisible: true,
    bookmarks: [],
    history: [],
    achievements: [],
    discoveryProgress: 0
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

  function getSpecies (id) { return SPECIES.find(s => s.id === id); }

  /* ==========================================================
     4.  DOM REFERENCES
     ========================================================== */

  const $ = id => document.getElementById(id);

  const dom = {
    searchInput: $('searchInput'),
    filterChips: $('filterChips'),
    statTotal: $('statTotal'),
    statHotspots: $('statHotspots'),
    statCritical: $('statCritical'),
    statProtected: $('statProtected'),
    statSuccess: $('statSuccess'),
    progressFill: $('progressFill'),
    threatLow: $('threatLow'),
    threatVulnerable: $('threatVulnerable'),
    threatEndangered: $('threatEndangered'),
    threatCritical: $('threatCritical'),
    activityFeed: $('activityFeed'),

    worldMap: $('worldMap'),
    markersGroup: $('markersGroup'),
    heatZones: document.querySelector('.heat-zones'),
    heatmapToggle: $('heatmapToggle'),
    zoomInBtn: $('zoomInBtn'),
    zoomOutBtn: $('zoomOutBtn'),

    mapHeader: $('mapHeader'),
    activeSpecies: $('activeSpecies'),
    activeStatus: $('activeStatus'),
    activeRegion: $('activeRegion'),
    activePopulation: $('activePopulation'),

    infoCardOverlay: $('infoCardOverlay'),
    infoCard: $('infoCard'),
    infoCardClose: $('infoCardClose'),
    infoCardHero: $('infoCardHero'),
    infoCardTitle: $('infoCardTitle'),
    infoScientific: $('infoScientific'),
    infoCardBadge: $('infoCardBadge'),
    infoCategory: $('infoCategory'),
    infoPopulation: $('infoPopulation'),
    infoRegion: $('infoRegion'),
    infoClimate: $('infoClimate'),
    infoHabitat: $('infoHabitat'),
    infoRange: $('infoRange'),
    trendChart: $('trendChart'),
    threatBars: $('threatBars'),
    infoConservation: $('infoConservation'),
    infoFacts: $('infoFacts'),
    bookmarkBtn: $('bookmarkBtn'),
    compareBtn: $('compareBtn'),

    compareModal: $('compareModal'),
    compareModalClose: $('compareModalClose'),
    compareModalBody: $('compareModalBody'),
    quizModal: $('quizModal'),
    quizModalClose: $('quizModalClose'),
    quizModalBody: $('quizModalBody'),
    historyModal: $('historyModal'),
    historyModalClose: $('historyModalClose'),
    historyModalBody: $('historyModalBody'),
    storiesModal: $('storiesModal'),
    storiesModalClose: $('storiesModalClose'),
    storiesModalBody: $('storiesModalBody'),

    toastContainer: $('toastContainer'),
    showHistoryBtn: $('showHistoryBtn'),
    showAchievementsBtn: $('showAchievementsBtn'),
    showQuizBtn: $('showQuizBtn'),
    showStoriesBtn: $('showStoriesBtn'),
    randomFactBtn: $('randomFactBtn'),

    app: $('app')
  };

  /* ==========================================================
     5.  MAP COORDINATES & RENDERING
     ========================================================== */

  function latLngToSvg (lat, lng, w, h) {
    return { x: ((lng + 180) / 360) * w, y: ((90 - lat) / 180) * h };
  }

  function getCategoryColor (cat) { return CATEGORY_COLORS[cat] || '#64748b'; }

  function createMarker (species, isActive, isBookmarked) {
    const { x, y } = latLngToSvg(species.lat, species.lng, 800, 400);
    const color = getCategoryColor(species.category);
    const explored = state.exploredSpecies.includes(species.id);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `hotspot-marker${isActive ? ' hotspot-marker--active' : ''}`);
    g.setAttribute('data-species-id', species.id);
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `${species.name} — ${CATEGORY_LABELS[species.category]}, ${STATUS_LABELS[species.status]}`);
    g.setAttribute('style', `transform: translate(${x}px, ${y}px)`);

    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('class', 'hotspot-marker-glow');
    glow.setAttribute('cx', '0');
    glow.setAttribute('cy', '0');
    glow.setAttribute('r', '22');
    const capitalized = species.category.charAt(0).toUpperCase() + species.category.slice(1);
    glow.setAttribute('fill', `url(#hotspotGlow${capitalized})`);
    g.appendChild(glow);

    const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pin.setAttribute('class', 'hotspot-marker-pin');
    pin.setAttribute('cx', '0');
    pin.setAttribute('cy', '0');
    pin.setAttribute('r', explored ? '6' : '4.5');
    pin.setAttribute('fill', explored ? color : '#1e293b');
    pin.setAttribute('stroke', color);
    pin.setAttribute('stroke-width', '2');
    if (isBookmarked) pin.setAttribute('stroke-dasharray', '4,2');
    if (species.status === 'critical') {
      const annulus = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      annulus.setAttribute('cx', '0');
      annulus.setAttribute('cy', '0');
      annulus.setAttribute('r', '10');
      annulus.setAttribute('fill', 'none');
      annulus.setAttribute('stroke', '#dc2626');
      annulus.setAttribute('stroke-width', '1');
      annulus.setAttribute('opacity', '0.5');
      g.appendChild(annulus);
    }
    g.appendChild(pin);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('class', 'hotspot-marker-label');
    label.setAttribute('x', '0');
    label.setAttribute('y', '14');
    label.textContent = species.name;
    g.appendChild(label);

    g.addEventListener('click', () => selectSpecies(species.id));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSpecies(species.id); }
    });

    return g;
  }

  function renderMarkers () {
    dom.markersGroup.innerHTML = '';
    const filter = state.activeFilters.includes('all') ? null : state.activeFilters[0];
    SPECIES.forEach(sp => {
      if (filter && sp.category !== filter) return;
      const m = createMarker(sp, state.selectedSpecies === sp.id, state.bookmarks.includes(sp.id));
      dom.markersGroup.appendChild(m);
    });
    applyFilters();
  }

  /* ==========================================================
     6.  SPECIES SELECTION
     ========================================================== */

  function selectSpecies (id) {
    const species = getSpecies(id);
    if (!species) return;

    state.selectedSpecies = id;
    state.selectedCategory = species.category;
    state.selectedRegion = species.region;

    if (!state.exploredSpecies.includes(id)) {
      state.exploredSpecies.push(id);
      if (!state.regionsExplored.includes(species.region)) {
        state.regionsExplored.push(species.region);
      }
      state.history.unshift({
        id: species.id,
        name: species.name,
        category: species.category,
        timestamp: new Date().toISOString()
      });
      addActivityItem(species);
      checkAchievements();
    }

    updateMapHeader(species);
    updateStats();
    renderMarkers();
    showInfoCard(species);
    saveState();
  }

  function updateMapHeader (species) {
    dom.activeSpecies.textContent = species.name;
    dom.activeStatus.textContent = STATUS_LABELS[species.status];
    dom.activeStatus.style.color = STATUS_COLORS[species.status];
    dom.activeRegion.textContent = species.region;
    dom.activePopulation.textContent = species.population;
  }

  /* ==========================================================
     7.  INFO CARD
     ========================================================== */

  function generateHeroSVG (species) {
    const cat = species.category;
    if (cat === 'mammal') {
      return `<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="130" fill="#1a0e00"/>
        <ellipse cx="270" cy="90" rx="200" ry="50" fill="#2a1800" opacity="0.5"/>
        <ellipse cx="200" cy="50" rx="40" ry="25" fill="#f59e0b" opacity="0.08"/>
        <ellipse cx="340" cy="55" rx="35" ry="22" fill="#f59e0b" opacity="0.06"/>
        <ellipse cx="150" cy="45" rx="20" ry="15" fill="#f59e0b" opacity="0.04"/>
        <ellipse cx="390" cy="48" rx="18" ry="12" fill="#f59e0b" opacity="0.04"/>
        <text x="270" y="18" fill="#f59e0b" font-size="9" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.35">${species.name}</text>
      </svg>`;
    } else if (cat === 'bird') {
      return `<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="130" fill="#061020"/>
        <circle cx="100" cy="80" r="25" fill="#3b82f6" opacity="0.04"/>
        <circle cx="200" cy="70" r="20" fill="#3b82f6" opacity="0.06"/>
        <circle cx="300" cy="85" r="22" fill="#3b82f6" opacity="0.05"/>
        <circle cx="400" cy="75" r="18" fill="#3b82f6" opacity="0.06"/>
        <circle cx="500" cy="80" r="15" fill="#3b82f6" opacity="0.04"/>
        <path d="M0 110 Q 135 80 270 100 Q 405 75 540 95" stroke="#3b82f6" stroke-width="0.5" fill="none" opacity="0.15"/>
        <text x="270" y="18" fill="#3b82f6" font-size="9" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.35">${species.name}</text>
      </svg>`;
    } else if (cat === 'reptile') {
      return `<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="130" fill="#081400"/>
        <path d="M0 110 Q 100 60 200 105 Q 300 55 400 100 Q 450 60 540 95 L 540 130 L 0 130 Z" fill="#1a3000" opacity="0.5"/>
        <path d="M0 118 Q 120 80 240 115 Q 360 70 540 108 L 540 130 L 0 130 Z" fill="#2a4a00" opacity="0.3"/>
        <text x="270" y="18" fill="#84cc16" font-size="9" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.35">${species.name}</text>
      </svg>`;
    } else if (cat === 'amphibian') {
      return `<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="130" fill="#0a0020"/>
        <circle cx="80" cy="90" r="20" fill="#a855f7" opacity="0.06"/>
        <circle cx="180" cy="80" r="16" fill="#a855f7" opacity="0.05"/>
        <circle cx="280" cy="95" r="22" fill="#a855f7" opacity="0.07"/>
        <circle cx="380" cy="78" r="14" fill="#a855f7" opacity="0.05"/>
        <circle cx="470" cy="85" r="18" fill="#a855f7" opacity="0.06"/>
        <ellipse cx="270" cy="105" rx="220" ry="30" fill="#a855f7" opacity="0.04"/>
        <text x="270" y="18" fill="#a855f7" font-size="9" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.35">${species.name}</text>
      </svg>`;
    } else if (cat === 'marine') {
      return `<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="130" fill="#041828"/>
        <path d="M0 50 Q 70 30 140 50 Q 210 30 280 50 Q 350 30 420 50 Q 490 30 540 50 L 540 130 L 0 130 Z" fill="#0a2848" opacity="0.5"/>
        <path d="M0 70 Q 80 50 160 70 Q 240 50 320 70 Q 400 50 480 70 L 540 60 L 540 130 L 0 130 Z" fill="#0c3060" opacity="0.35"/>
        <path d="M0 90 Q 100 75 200 90 Q 300 75 400 90 Q 470 78 540 85 L 540 130 L 0 130 Z" fill="#0e3870" opacity="0.2"/>
        <circle cx="120" cy="40" r="3" fill="#0ea5e9" opacity="0.2"/>
        <circle cx="250" cy="35" r="2" fill="#0ea5e9" opacity="0.15"/>
        <circle cx="380" cy="42" r="3" fill="#0ea5e9" opacity="0.2"/>
        <circle cx="480" cy="38" r="2" fill="#0ea5e9" opacity="0.15"/>
        <text x="270" y="18" fill="#0ea5e9" font-size="9" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.35">${species.name}</text>
      </svg>`;
    } else {
      return `<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="130" fill="#0f0a20"/>
        <rect x="0" y="95" width="540" height="35" fill="#1a1530" opacity="0.5"/>
        <circle cx="135" cy="50" r="18" fill="#ec4899" opacity="0.06"/>
        <circle cx="270" cy="45" r="20" fill="#ec4899" opacity="0.07"/>
        <circle cx="405" cy="52" r="16" fill="#ec4899" opacity="0.06"/>
        <text x="270" y="18" fill="#ec4899" font-size="9" font-weight="600" text-anchor="middle" font-family="system-ui" opacity="0.35">${species.name}</text>
      </svg>`;
    }
  }

  function renderThreatBars (species) {
    dom.threatBars.innerHTML = '';
    species.threats.forEach(t => {
      const color = t.pct >= 80 ? '#dc2626' : t.pct >= 60 ? '#f59e0b' : t.pct >= 40 ? '#f97316' : '#22c55e';
      const row = document.createElement('div');
      row.className = 'threat-bar-row';
      row.innerHTML = `
        <span class="threat-bar-label">${t.name}</span>
        <div class="threat-bar-track"><div class="threat-bar-fill" style="width:${t.pct}%;background:${color}"></div></div>
        <span class="threat-bar-pct">${t.pct}%</span>
      `;
      dom.threatBars.appendChild(row);
    });
  }

  function renderTrendChart (species) {
    dom.trendChart.innerHTML = '';
    const max = Math.max(...species.popHistory);
    species.popHistory.forEach((val, i) => {
      const h = (val / max) * 100;
      const bar = document.createElement('div');
      bar.className = 'trend-bar';
      const first = species.popHistory[0];
      const last = species.popHistory[species.popHistory.length - 1];
      const declining = last < first;
      const color = declining ? '#dc2626' : '#22c55e';
      bar.style.height = `${Math.max(h, 4)}%`;
      bar.style.background = color;
      bar.style.opacity = '0.7';
      bar.innerHTML = `
        <span class="trend-bar-value">${val.toLocaleString()}</span>
        <span class="trend-bar-label">${species.popLabels[i]}</span>
      `;
      dom.trendChart.appendChild(bar);
    });
  }

  function showInfoCard (species) {
    const color = STATUS_COLORS[species.status];
    dom.infoCardHero.innerHTML = generateHeroSVG(species);
    dom.infoCardTitle.textContent = species.name;
    dom.infoScientific.textContent = species.scientific;
    dom.infoCardBadge.textContent = STATUS_LABELS[species.status];
    dom.infoCardBadge.className = `info-card-badge badge-${species.status}`;
    dom.infoCategory.textContent = CATEGORY_LABELS[species.category];
    dom.infoPopulation.textContent = species.population;
    dom.infoRegion.textContent = species.region;
    dom.infoClimate.textContent = species.climate;
    dom.infoHabitat.textContent = species.habitat;
    dom.infoRange.textContent = species.range;

    renderThreatBars(species);
    renderTrendChart(species);

    dom.infoConservation.innerHTML = '';
    species.conservation.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c;
      dom.infoConservation.appendChild(li);
    });

    dom.infoFacts.innerHTML = '';
    species.facts.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      dom.infoFacts.appendChild(li);
    });

    const bookmarked = state.bookmarks.includes(species.id);
    dom.bookmarkBtn.classList.toggle('info-card-action-btn--active', bookmarked);
    dom.bookmarkBtn.querySelector('span').textContent = bookmarked ? 'Bookmarked' : 'Bookmark';

    dom.infoCardOverlay.removeAttribute('hidden');
    dom.infoCardOverlay.removeAttribute('aria-hidden');
    dom.infoCardOverlay.addEventListener('click', e => { if (e.target === dom.infoCardOverlay) hideInfoCard(); });
    document.addEventListener('keydown', handleEsc);
    dom.infoCard.scrollTop = 0;
  }

  function hideInfoCard () {
    dom.infoCardOverlay.setAttribute('hidden', '');
    dom.infoCardOverlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', handleEsc);
  }

  function handleEsc (e) { if (e.key === 'Escape') hideInfoCard(); }

  /* ==========================================================
     8.  ACTIVITY FEED
     ========================================================== */

  function addActivityItem (species) {
    const color = getCategoryColor(species.category);
    const now = new Date();
    const ts = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="activity-dot" style="background:${color}"></span>
      <span>${species.name} hotspot explored</span>
      <span class="activity-time">${ts}</span>
    `;
    const empty = dom.activityFeed.querySelector('.activity-empty');
    if (empty) empty.remove();
    dom.activityFeed.insertBefore(item, dom.activityFeed.firstChild);
    while (dom.activityFeed.children.length > 20) dom.activityFeed.removeChild(dom.activityFeed.lastChild);
  }

  /* ==========================================================
     9.  STATISTICS ENGINE
     ========================================================== */

  function updateStats () {
    const total = SPECIES.length;
    const explored = state.exploredSpecies.length;
    const regions = state.regionsExplored.length;
    const critical = SPECIES.filter(s => s.status === 'critical').length;
    const progress = total > 0 ? Math.round((explored / total) * 100) : 0;

    dom.statTotal.textContent = total;
    dom.statHotspots.textContent = total;
    dom.statCritical.textContent = critical;
    dom.statProtected.textContent = `${regions} / ${REGIONS.length}`;
    dom.statSuccess.textContent = `${Math.round((explored / total) * 100)}%`;
    dom.progressFill.style.width = `${progress}%`;
    dom.progressFill.parentElement.setAttribute('aria-valuenow', progress);

    state.discoveryProgress = progress;

    // Threat level counts
    dom.threatLow.textContent = SPECIES.filter(s => s.status === 'low').length;
    dom.threatVulnerable.textContent = SPECIES.filter(s => s.status === 'vulnerable').length;
    dom.threatEndangered.textContent = SPECIES.filter(s => s.status === 'endangered').length;
    dom.threatCritical.textContent = SPECIES.filter(s => s.status === 'critical').length;
  }

  /* ==========================================================
     10. FILTERS & SEARCH
     ========================================================== */

  function applyFilters () {
    const query = dom.searchInput.value.toLowerCase().trim();
    SPECIES.forEach(sp => {
      const marker = dom.markersGroup.querySelector(`[data-species-id="${sp.id}"]`);
      if (!marker) return;
      const filterMatch = state.activeFilters.includes('all') || state.activeFilters.includes(sp.category);
      const searchMatch = !query ||
        sp.name.toLowerCase().includes(query) ||
        sp.scientific.toLowerCase().includes(query) ||
        sp.region.toLowerCase().includes(query) ||
        sp.habitat.toLowerCase().includes(query) ||
        STATUS_LABELS[sp.status].toLowerCase().includes(query);
      marker.style.display = (filterMatch && searchMatch) ? '' : 'none';
    });
  }

  function initFilters () {
    dom.filterChips.addEventListener('click', e => {
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
      saveState();
    });
  }

  function initSearch () {
    dom.searchInput.addEventListener('input', applyFilters);
  }

  /* ==========================================================
     11. HEATMAP TOGGLE
     ========================================================== */

  function toggleHeatmap () {
    state.heatmapVisible = !state.heatmapVisible;
    dom.heatZones.style.opacity = state.heatmapVisible ? '0.08' : '0';
    dom.heatmapToggle.classList.toggle('map-control-btn--active', state.heatmapVisible);
    saveState();
  }

  /* ==========================================================
     12. COMPARISON
     ========================================================== */

  function showComparison (id1, id2) {
    const s1 = getSpecies(id1);
    const s2 = getSpecies(id2);
    if (!s1 || !s2) return;
    dom.compareModalBody.innerHTML = `
      <div class="comparison-grid">
        <div class="comparison-column">
          <h3>${s1.name}</h3>
          <div class="comparison-row"><span class="comparison-label">Category</span><span class="comparison-value">${CATEGORY_LABELS[s1.category]}</span></div>
          <div class="comparison-row"><span class="comparison-label">Status</span><span class="comparison-value">${STATUS_LABELS[s1.status]}</span></div>
          <div class="comparison-row"><span class="comparison-label">Population</span><span class="comparison-value">${s1.population}</span></div>
          <div class="comparison-row"><span class="comparison-label">Region</span><span class="comparison-value">${s1.region}</span></div>
          <div class="comparison-row"><span class="comparison-label">Habitat</span><span class="comparison-value">${s1.habitat.split(',')[0]}</span></div>
          <div class="comparison-row"><span class="comparison-label">Top Threat</span><span class="comparison-value">${s1.threats[0].name} (${s1.threats[0].pct}%)</span></div>
          <div class="comparison-row"><span class="comparison-label">Pop. Trend</span><span class="comparison-value">${s1.popHistory[0] > s1.popHistory[s1.popHistory.length-1] ? 'Declining' : 'Recovering'}</span></div>
        </div>
        <div class="comparison-column">
          <h3>${s2.name}</h3>
          <div class="comparison-row"><span class="comparison-label">Category</span><span class="comparison-value">${CATEGORY_LABELS[s2.category]}</span></div>
          <div class="comparison-row"><span class="comparison-label">Status</span><span class="comparison-value">${STATUS_LABELS[s2.status]}</span></div>
          <div class="comparison-row"><span class="comparison-label">Population</span><span class="comparison-value">${s2.population}</span></div>
          <div class="comparison-row"><span class="comparison-label">Region</span><span class="comparison-value">${s2.region}</span></div>
          <div class="comparison-row"><span class="comparison-label">Habitat</span><span class="comparison-value">${s2.habitat.split(',')[0]}</span></div>
          <div class="comparison-row"><span class="comparison-label">Top Threat</span><span class="comparison-value">${s2.threats[0].name} (${s2.threats[0].pct}%)</span></div>
          <div class="comparison-row"><span class="comparison-label">Pop. Trend</span><span class="comparison-value">${s2.popHistory[0] > s2.popHistory[s2.popHistory.length-1] ? 'Declining' : 'Recovering'}</span></div>
        </div>
      </div>
    `;
    dom.compareModal.removeAttribute('hidden');
    dom.compareModal.removeAttribute('aria-hidden');
  }

  /* ==========================================================
     13. QUIZ
     ========================================================== */

  let quizState = { current: 0, score: 0, answered: false, questions: [] };

  function shuffleArray (arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function generateQuizQuestions () {
    const questions = [];
    const used = new Set();
    while (questions.length < 10) {
      const sp = SPECIES[Math.floor(Math.random() * SPECIES.length)];
      if (used.has(sp.id)) continue;
      used.add(sp.id);
      const qType = Math.floor(Math.random() * 3);
      let question, answer, options;
      switch (qType) {
        case 0:
          question = `What is the conservation status of the ${sp.name}?`;
          answer = STATUS_LABELS[sp.status];
          options = Object.values(STATUS_LABELS).filter(l => l !== answer);
          options = shuffleArray(options).slice(0, 3);
          options.push(answer);
          break;
        case 1:
          question = `Which category does the ${sp.name} belong to?`;
          answer = CATEGORY_LABELS[sp.category];
          options = Object.values(CATEGORY_LABELS).filter(l => l !== answer);
          options = shuffleArray(options).slice(0, 3);
          options.push(answer);
          break;
        case 2: {
          const fact = sp.facts[Math.floor(Math.random() * sp.facts.length)];
          question = `Which species does this fact describe?\n"${fact}"`;
          answer = sp.name;
          const others = SPECIES.filter(x => x.id !== sp.id);
          options = shuffleArray(others).slice(0, 3).map(x => x.name);
          options.push(answer);
          break;
        }
      }
      questions.push({ question, answer, options: shuffleArray(options), speciesId: sp.id });
    }
    return questions;
  }

  function startQuiz () {
    quizState = { current: 0, score: 0, answered: false, questions: generateQuizQuestions() };
    renderQuiz();
    dom.quizModal.removeAttribute('hidden');
    dom.quizModal.removeAttribute('aria-hidden');
  }

  function renderQuiz () {
    if (quizState.current >= quizState.questions.length) {
      dom.quizModalBody.innerHTML = `
        <div style="text-align:center;padding:20px">
          <div class="quiz-score">Score: ${quizState.score}/${quizState.questions.length}</div>
          <p style="color:var(--text-body);margin:12px 0;font-size:0.8rem">
            ${quizState.score >= 8 ? 'Excellent conservation knowledge!' : quizState.score >= 5 ? 'Good work — keep learning!' : 'Explore more species to improve your knowledge!'}
          </p>
          <button class="quiz-btn" id="quizRestartBtn">Play Again</button>
        </div>
      `;
      const r = dom.quizModalBody.querySelector('#quizRestartBtn');
      if (r) r.addEventListener('click', startQuiz);
      return;
    }
    const q = quizState.questions[quizState.current];
    dom.quizModalBody.innerHTML = `
      <div class="quiz-question">
        <span style="font-size:0.68rem;color:var(--text-muted);display:block;margin-bottom:6px">Question ${quizState.current + 1} of ${quizState.questions.length}</span>
        ${q.question}
      </div>
      <div class="quiz-options" id="quizOptions">
        ${q.options.map(o => `<button class="quiz-option" data-answer="${o === q.answer}" ${quizState.answered ? 'disabled' : ''}>${o}</button>`).join('')}
      </div>
      ${quizState.answered ? `<div style="text-align:center;margin-top:12px"><button class="quiz-btn" id="quizNextBtn">${quizState.current < quizState.questions.length - 1 ? 'Next Question' : 'See Results'}</button></div>` : ''}
    `;
    if (!quizState.answered) {
      dom.quizModalBody.querySelectorAll('.quiz-option').forEach(b => b.addEventListener('click', () => handleAnswer(b)));
    } else {
      const n = dom.quizModalBody.querySelector('#quizNextBtn');
      if (n) n.addEventListener('click', () => { quizState.current++; quizState.answered = false; renderQuiz(); });
    }
  }

  function handleAnswer (btn) {
    if (quizState.answered) return;
    quizState.answered = true;
    const correct = btn.dataset.answer === 'true';
    if (correct) quizState.score++;
    dom.quizModalBody.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = true;
      if (b.dataset.answer === 'true') b.classList.add('quiz-option--correct');
      else if (b === btn && !correct) b.classList.add('quiz-option--wrong');
    });
    renderQuiz();
  }

  /* ==========================================================
     14. ACHIEVEMENTS
     ========================================================== */

  function checkAchievements () {
    ACHIEVEMENT_DEFS.forEach(def => {
      if (!state.achievements.includes(def.id) && def.check(state)) {
        state.achievements.push(def.id);
        showToast(`🏆 ${def.name}: ${def.desc}`, 'achievement');
        saveState();
      }
    });
  }

  function showAchievementsModal () {
    let html = '<div class="achievement-grid">';
    ACHIEVEMENT_DEFS.forEach(def => {
      const unlocked = state.achievements.includes(def.id);
      html += `<div class="achievement-item ${unlocked ? 'achievement-item--unlocked' : 'achievement-item--locked'}">
        <div class="achievement-icon">${def.icon}</div>
        <div class="achievement-name">${def.name}</div>
        <div class="achievement-desc">${def.desc}</div>
      </div>`;
    });
    html += '</div>';
    html += `<div style="text-align:center;margin-top:14px;color:var(--text-muted);font-size:0.76rem">${state.achievements.length}/${ACHIEVEMENT_DEFS.length} unlocked</div>`;
    const title = dom.historyModal.querySelector('#historyModalTitle') || dom.historyModal.querySelector('h2');
    if (title) title.textContent = '🏆 Achievements';
    dom.historyModalBody.innerHTML = html;
    dom.historyModal.removeAttribute('hidden');
    dom.historyModal.removeAttribute('aria-hidden');
  }

  /* ==========================================================
     15. HISTORY
     ========================================================== */

  function showHistory () {
    const title = dom.historyModal.querySelector('#historyModalTitle') || dom.historyModal.querySelector('h2');
    if (title) title.textContent = 'Exploration History';
    if (state.history.length === 0) {
      dom.historyModalBody.innerHTML = '<p class="history-empty">No species explored yet. Click a hotspot marker to begin.</p>';
    } else {
      let html = '<div class="history-timeline">';
      state.history.slice(0, 30).forEach(entry => {
        const sp = getSpecies(entry.id);
        const color = sp ? getCategoryColor(sp.category) : '#64748b';
        const t = new Date(entry.timestamp);
        const ts = t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        html += `<div class="history-item">
          <span class="history-dot" style="background:${color}"></span>
          <div class="history-content">
            <div class="history-name">${entry.name}</div>
            <div class="history-meta">${entry.category ? CATEGORY_LABELS[entry.category] : ''} — ${sp ? sp.region : ''}</div>
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

  /* ==========================================================
     16. SUCCESS STORIES
     ========================================================== */

  function showStories () {
    let html = '';
    SUCCESS_STORIES.forEach(story => {
      html += `<div class="story-card">
        <div class="story-title">${story.species}</div>
        <div class="story-species">${story.highlight}</div>
        <div class="story-text">${story.text}</div>
      </div>`;
    });
    dom.storiesModalBody.innerHTML = html;
    dom.storiesModal.removeAttribute('hidden');
    dom.storiesModal.removeAttribute('aria-hidden');
  }

  /* ==========================================================
     17. BOOKMARK, RANDOM FACT, ZOOM
     ========================================================== */

  function toggleBookmark (id) {
    const idx = state.bookmarks.indexOf(id);
    if (idx >= 0) { state.bookmarks.splice(idx, 1); showToast('Bookmark removed'); }
    else { state.bookmarks.push(id); showToast(`⭐ ${getSpecies(id).name} bookmarked!`); }
    saveState();
    renderMarkers();
    const sp = getSpecies(id);
    if (sp && state.selectedSpecies === id) {
      const bookmarked = state.bookmarks.includes(id);
      dom.bookmarkBtn.classList.toggle('info-card-action-btn--active', bookmarked);
      dom.bookmarkBtn.querySelector('span').textContent = bookmarked ? 'Bookmarked' : 'Bookmark';
    }
  }

  function showRandomFact () {
    const entry = RANDOM_FACTS[Math.floor(Math.random() * RANDOM_FACTS.length)];
    showToast(`💡 ${entry.fact}`);
  }

  function zoomIn () {
    state.mapZoomLevel = Math.min(state.mapZoomLevel + 0.15, 2);
    dom.worldMap.style.transform = `scale(${state.mapZoomLevel})`;
    dom.worldMap.style.transformOrigin = 'center center';
    saveState();
  }

  function zoomOut () {
    state.mapZoomLevel = Math.max(state.mapZoomLevel - 0.15, 0.5);
    dom.worldMap.style.transform = `scale(${state.mapZoomLevel})`;
    dom.worldMap.style.transformOrigin = 'center center';
    saveState();
  }

  function showToast (msg, type) {
    const toast = document.createElement('div');
    toast.className = `toast${type === 'achievement' ? ' toast--achievement' : ''}`;
    toast.textContent = msg;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ==========================================================
     18. INITIALIZATION
     ========================================================== */

  function init () {
    loadState();

    if (state.exploredSpecies.length > 0) {
      state.history.slice(0, 20).forEach(entry => {
        const sp = getSpecies(entry.id);
        if (sp) addActivityItem(sp);
      });
    }

    if (state.selectedSpecies) {
      const sp = getSpecies(state.selectedSpecies);
      if (sp) updateMapHeader(sp);
    }

    if (!state.heatmapVisible) {
      dom.heatZones.style.opacity = '0';
      dom.heatmapToggle.classList.add('map-control-btn--active');
    }

    renderMarkers();
    updateStats();
    initFilters();
    initSearch();
    applyFilters();

    // Apply zoom
    dom.worldMap.style.transform = `scale(${state.mapZoomLevel})`;
    dom.worldMap.style.transformOrigin = 'center center';

    // Close buttons
    dom.infoCardClose.addEventListener('click', hideInfoCard);
    dom.bookmarkBtn.addEventListener('click', () => { if (state.selectedSpecies) toggleBookmark(state.selectedSpecies); });
    dom.compareBtn.addEventListener('click', () => {
      if (state.selectedSpecies) {
        const others = SPECIES.filter(s => s.id !== state.selectedSpecies);
        if (others.length) showComparison(state.selectedSpecies, others[Math.floor(Math.random() * others.length)].id);
      }
    });

    // Map controls
    dom.heatmapToggle.addEventListener('click', toggleHeatmap);
    dom.zoomInBtn.addEventListener('click', zoomIn);
    dom.zoomOutBtn.addEventListener('click', zoomOut);

    // Action bar
    dom.showHistoryBtn.addEventListener('click', showHistory);
    dom.showAchievementsBtn.addEventListener('click', showAchievementsModal);
    dom.showQuizBtn.addEventListener('click', startQuiz);
    dom.showStoriesBtn.addEventListener('click', showStories);
    dom.randomFactBtn.addEventListener('click', showRandomFact);

    // Modal closes
    const closeModal = (modal) => {
      modal.setAttribute('hidden', '');
      modal.setAttribute('aria-hidden', 'true');
    };

    dom.compareModalClose.addEventListener('click', () => closeModal(dom.compareModal));
    dom.quizModalClose.addEventListener('click', () => closeModal(dom.quizModal));
    dom.historyModalClose.addEventListener('click', () => closeModal(dom.historyModal));
    dom.storiesModalClose.addEventListener('click', () => closeModal(dom.storiesModal));

    [dom.compareModal, dom.quizModal, dom.historyModal, dom.storiesModal].forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) closeModal(m); });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        [dom.compareModal, dom.quizModal, dom.historyModal, dom.storiesModal].forEach(m => {
          if (!m.hasAttribute('hidden')) closeModal(m);
        });
        hideInfoCard();
      }
    });

    setTimeout(() => showToast('🛡️ Welcome to the Endangered Species Hotspot Map! Click a marker to begin.', 'achievement'), 500);
  }

  /* ==========================================================
     19. START
     ========================================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
