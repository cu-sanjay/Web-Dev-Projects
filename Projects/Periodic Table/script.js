(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const gridContainer = $('#gridContainer');
  const inspectorEmpty = $('#inspectorEmpty');
  const inspectorData = $('#inspectorData');
  const idNum = $('#idNum');
  const idSym = $('#idSym');
  const idMass = $('#idMass');
  const idName = $('#idName');
  const idEn = $('#idEn');
  const idFamily = $('#idFamily');
  const idPeriod = $('#idPeriod');
  const idGroup = $('#idGroup');
  const idFact = $('#idFact');
  const inspectorHint = $('#inspectorHint');
  const familyVal = $('#familyVal');
  const countVal = $('#countVal');
  const searchInput = $('#searchInput');
  const btnShell = $('#btnShell');
  const btnPurge = $('#btnPurge');
  const toastContainer = $('#toastContainer');
  const filterBtns = $$('.filter-btn');

  /* ─── ELEMENT DATA ─── */
  const ELEMENTS = [
    {n:1,sym:'H',name:'Hydrogen',mass:1.008,en:2.20,family:'nonmetal',g:1,p:1,x:1,y:1,fact:'Hydrogen is the most abundant element in the universe, comprising about 75% of its elemental mass.'},
    {n:2,sym:'He',name:'Helium',mass:4.003,en:0.00,family:'noble-gas',g:18,p:1,x:18,y:1,fact:'Helium is the second most abundant element in the universe and was first discovered in the Sun\'s spectrum.'},

    {n:3,sym:'Li',name:'Lithium',mass:6.941,en:0.98,family:'alkali-metal',g:1,p:2,x:1,y:2,fact:'Lithium is a key component in rechargeable batteries and the lightest solid element at room temperature.'},
    {n:4,sym:'Be',name:'Beryllium',mass:9.012,en:1.57,family:'alkaline-earth',g:2,p:2,x:2,y:2,fact:'Beryllium is used as a neutron moderator in nuclear reactors and is transparent to X-rays.'},
    {n:5,sym:'B',name:'Boron',mass:10.81,en:2.04,family:'metalloid',g:13,p:2,x:13,y:2,fact:'Boron is essential for plant growth and is used in borosilicate glass (Pyrex).'},
    {n:6,sym:'C',name:'Carbon',mass:12.011,en:2.55,family:'nonmetal',g:14,p:2,x:14,y:2,fact:'Carbon forms the chemical basis of all known life and can exist as diamond, graphite, or graphene.'},
    {n:7,sym:'N',name:'Nitrogen',mass:14.007,en:3.04,family:'nonmetal',g:15,p:2,x:15,y:2,fact:'Nitrogen makes up 78% of Earth\'s atmosphere and is a critical component of amino acids and DNA.'},
    {n:8,sym:'O',name:'Oxygen',mass:15.999,en:3.44,family:'nonmetal',g:16,p:2,x:16,y:2,fact:'Oxygen is the third most abundant element in the universe and is essential for cellular respiration.'},
    {n:9,sym:'F',name:'Fluorine',mass:18.998,en:3.98,family:'halogen',g:17,p:2,x:17,y:2,fact:'Fluorine is the most electronegative element and reacts explosively with hydrogen.'},
    {n:10,sym:'Ne',name:'Neon',mass:20.180,en:0.00,family:'noble-gas',g:18,p:2,x:18,y:2,fact:'Neon produces a distinct reddish-orange glow in gas-discharge tubes and is used in advertising signs.'},

    {n:11,sym:'Na',name:'Sodium',mass:22.990,en:0.93,family:'alkali-metal',g:1,p:3,x:1,y:3,fact:'Sodium reacts violently with water and is essential for nerve impulse transmission in the body.'},
    {n:12,sym:'Mg',name:'Magnesium',mass:24.305,en:1.31,family:'alkaline-earth',g:2,p:3,x:2,y:3,fact:'Magnesium is the eighth most abundant element in Earth\'s crust and is central to photosynthesis (chlorophyll).'},
    {n:13,sym:'Al',name:'Aluminium',mass:26.982,en:1.61,family:'post-transition',g:13,p:3,x:13,y:3,fact:'Aluminium is the most abundant metal in Earth\'s crust and is fully recyclable with no loss of quality.'},
    {n:14,sym:'Si',name:'Silicon',mass:28.086,en:1.90,family:'metalloid',g:14,p:3,x:14,y:3,fact:'Silicon is the fundamental material of modern microchips and solar cells.'},
    {n:15,sym:'P',name:'Phosphorus',mass:30.974,en:2.19,family:'nonmetal',g:15,p:3,x:15,y:3,fact:'Phosphorus is a key component of ATP (energy currency of cells) and DNA backbone structure.'},
    {n:16,sym:'S',name:'Sulfur',mass:32.065,en:2.58,family:'nonmetal',g:16,p:3,x:16,y:3,fact:'Sulfur is a component of gunpowder and is responsible for the distinctive smell of rotten eggs.'},
    {n:17,sym:'Cl',name:'Chlorine',mass:35.453,en:3.16,family:'halogen',g:17,p:3,x:17,y:3,fact:'Chlorine is used as a disinfectant in drinking water and swimming pools worldwide.'},
    {n:18,sym:'Ar',name:'Argon',mass:39.948,en:0.00,family:'noble-gas',g:18,p:3,x:18,y:3,fact:'Argon is the third most abundant gas in Earth\'s atmosphere and is used as an inert welding shield.'},

    {n:19,sym:'K',name:'Potassium',mass:39.098,en:0.82,family:'alkali-metal',g:1,p:4,x:1,y:4,fact:'Potassium is essential for heart function and muscle contraction, and bananas are a rich dietary source.'},
    {n:20,sym:'Ca',name:'Calcium',mass:40.078,en:1.00,family:'alkaline-earth',g:2,p:4,x:2,y:4,fact:'Calcium is the most abundant mineral in the human body and gives bones and teeth their rigidity.'},
    {n:21,sym:'Sc',name:'Scandium',mass:44.956,en:1.36,family:'transition',g:3,p:4,x:3,y:4,fact:'Scandium is used in high-performance sports equipment such as aluminum-scandium bicycle frames.'},
    {n:22,sym:'Ti',name:'Titanium',mass:47.867,en:1.54,family:'transition',g:4,p:4,x:4,y:4,fact:'Titanium has the highest strength-to-weight ratio of any metal and is used in aircraft and implants.'},
    {n:23,sym:'V',name:'Vanadium',mass:50.942,en:1.63,family:'transition',g:5,p:4,x:5,y:4,fact:'Vanadium redox flow batteries are a promising large-scale energy storage technology.'},
    {n:24,sym:'Cr',name:'Chromium',mass:51.996,en:1.66,family:'transition',g:6,p:4,x:6,y:4,fact:'Chromium gives rubies their red color and stainless steel its corrosion resistance.'},
    {n:25,sym:'Mn',name:'Manganese',mass:54.938,en:1.55,family:'transition',g:7,p:4,x:7,y:4,fact:'Manganese is essential for bone formation and is a cofactor for many enzymes in the body.'},
    {n:26,sym:'Fe',name:'Iron',mass:55.845,en:1.83,family:'transition',g:8,p:4,x:8,y:4,fact:'Iron is the most stable element (highest binding energy per nucleon) and forms Earth\'s core.'},
    {n:27,sym:'Co',name:'Cobalt',mass:58.933,en:1.88,family:'transition',g:9,p:4,x:9,y:4,fact:'Cobalt-60 is a radioactive isotope used in medical radiation therapy for cancer treatment.'},
    {n:28,sym:'Ni',name:'Nickel',mass:58.693,en:1.91,family:'transition',g:10,p:4,x:10,y:4,fact:'Nickel is the primary component of stainless steel and is used in nickel-metal hydride batteries.'},
    {n:29,sym:'Cu',name:'Copper',mass:63.546,en:1.90,family:'transition',g:11,p:4,x:11,y:4,fact:'Copper has been used by humans for over 10,000 years and is essential for electrical wiring due to high conductivity.'},
    {n:30,sym:'Zn',name:'Zinc',mass:65.380,en:1.65,family:'transition',g:12,p:4,x:12,y:4,fact:'Zinc is used in galvanization to prevent rust and is an essential trace element for immune function.'},
    {n:31,sym:'Ga',name:'Gallium',mass:69.723,en:1.81,family:'post-transition',g:13,p:4,x:13,y:4,fact:'Gallium melts at 29.8°C, allowing it to liquefy in your hand, and is used in semiconductors.'},
    {n:32,sym:'Ge',name:'Germanium',mass:72.630,en:2.01,family:'metalloid',g:14,p:4,x:14,y:4,fact:'Germanium was used in the first transistors and is now critical for fiber-optic communications.'},
    {n:33,sym:'As',name:'Arsenic',mass:74.922,en:2.18,family:'metalloid',g:15,p:4,x:15,y:4,fact:'Arsenic is famously poisonous yet was historically used in medicine and as a pigment.'},
    {n:34,sym:'Se',name:'Selenium',mass:78.971,en:2.55,family:'nonmetal',g:16,p:4,x:16,y:4,fact:'Selenium is an essential trace element with antioxidant properties, found in Brazil nuts.'},
    {n:35,sym:'Br',name:'Bromine',mass:79.904,en:2.96,family:'halogen',g:17,p:4,x:17,y:4,fact:'Bromine is one of only two elements that is liquid at room temperature (the other being mercury).'},
    {n:36,sym:'Kr',name:'Krypton',mass:83.798,en:0.00,family:'noble-gas',g:18,p:4,x:18,y:4,fact:'The meter was once defined by the wavelength of krypton-86 orange-red spectral line.'},

    {n:37,sym:'Rb',name:'Rubidium',mass:85.468,en:0.82,family:'alkali-metal',g:1,p:5,x:1,y:5,fact:'Rubidium is used in atomic clocks and its name means "deep red" in Latin, referencing its spectral line.'},
    {n:38,sym:'Sr',name:'Strontium',mass:87.620,en:0.95,family:'alkaline-earth',g:2,p:5,x:2,y:5,fact:'Strontium salts produce a brilliant red color in fireworks and flares.'},
    {n:39,sym:'Y',name:'Yttrium',mass:88.906,en:1.22,family:'transition',g:3,p:5,x:3,y:5,fact:'Yttrium is a key component in YBCO superconductors and high-temperature ceramic superconductors.'},
    {n:40,sym:'Zr',name:'Zirconium',mass:91.224,en:1.33,family:'transition',g:4,p:5,x:4,y:5,fact:'Zirconium is used in nuclear reactors due to its low neutron-capture cross-section.'},
    {n:41,sym:'Nb',name:'Niobium',mass:92.906,en:1.60,family:'transition',g:5,p:5,x:5,y:5,fact:'Niobium is a key component in superconducting magnets for MRI machines and particle accelerators.'},
    {n:42,sym:'Mo',name:'Molybdenum',mass:95.950,en:2.16,family:'transition',g:6,p:5,x:6,y:5,fact:'Molybdenum is an essential trace element for plants and is used in high-strength steel alloys.'},
    {n:43,sym:'Tc',name:'Technetium',mass:98.000,en:1.90,family:'transition',g:7,p:5,x:7,y:5,fact:'Technetium is the lightest radioactive element and was the first artificially synthesized element.'},
    {n:44,sym:'Ru',name:'Ruthenium',mass:101.07,en:2.20,family:'transition',g:8,p:5,x:8,y:5,fact:'Ruthenium is used in electrical contacts and as a catalyst in the production of ammonia.'},
    {n:45,sym:'Rh',name:'Rhodium',mass:102.91,en:2.28,family:'transition',g:9,p:5,x:9,y:5,fact:'Rhodium is the most expensive precious metal and is used in catalytic converters.'},
    {n:46,sym:'Pd',name:'Palladium',mass:106.42,en:2.20,family:'transition',g:10,p:5,x:10,y:5,fact:'Palladium can absorb up to 900 times its volume in hydrogen gas.'},
    {n:47,sym:'Ag',name:'Silver',mass:107.87,en:1.93,family:'transition',g:11,p:5,x:11,y:5,fact:'Silver has the highest electrical and thermal conductivity of any metal.'},
    {n:48,sym:'Cd',name:'Cadmium',mass:112.41,en:1.69,family:'transition',g:12,p:5,x:12,y:5,fact:'Cadmium is used in nickel-cadmium batteries and as a neutron absorber in nuclear reactors.'},
    {n:49,sym:'In',name:'Indium',mass:114.82,en:1.78,family:'post-transition',g:13,p:5,x:13,y:5,fact:'Indium tin oxide (ITO) is the transparent conductive coating used in touchscreens and LCD displays.'},
    {n:50,sym:'Sn',name:'Tin',mass:118.71,en:1.96,family:'post-transition',g:14,p:5,x:14,y:5,fact:'Tin was a major driver of Bronze Age trade and is still used today in food canning and solder.'},
    {n:51,sym:'Sb',name:'Antimony',mass:121.76,en:2.05,family:'metalloid',g:15,p:5,x:15,y:5,fact:'Antimony is used as a flame retardant and its symbol Sb comes from the Latin "stibium".'},
    {n:52,sym:'Te',name:'Tellurium',mass:127.60,en:2.10,family:'metalloid',g:16,p:5,x:16,y:5,fact:'Tellurium is a semiconductor used in thermoelectric cooling devices and phase-change memory.'},
    {n:53,sym:'I',name:'Iodine',mass:126.90,en:2.66,family:'halogen',g:17,p:5,x:17,y:5,fact:'Iodine is essential for thyroid hormone production and is added to table salt for public health.'},
    {n:54,sym:'Xe',name:'Xenon',mass:131.29,en:0.00,family:'noble-gas',g:18,p:5,x:18,y:5,fact:'Xenon is used in high-intensity discharge lamps and as a general anesthetic in medicine.'},

    {n:55,sym:'Cs',name:'Caesium',mass:132.91,en:0.79,family:'alkali-metal',g:1,p:6,x:1,y:6,fact:'Caesium is the most reactive metal and the SI unit of time (second) is defined by caesium atomic clocks.'},
    {n:56,sym:'Ba',name:'Barium',mass:137.33,en:0.89,family:'alkaline-earth',g:2,p:6,x:2,y:6,fact:'Barium sulfate is used as a radiocontrast agent for X-ray imaging of the digestive tract.'},
    {n:57,sym:'La',name:'Lanthanum',mass:138.91,en:1.10,family:'lanthanide',g:3,p:6,x:3,y:6,fact:'Lanthanum carbonate is used as a phosphate binder for patients with chronic kidney disease.'},
    {n:58,sym:'Ce',name:'Cerium',mass:140.12,en:1.12,family:'lanthanide',g:4,p:9,x:4,y:9,fact:'Cerium oxide is used in catalytic converters and as a glass polishing agent for optics.'},
    {n:59,sym:'Pr',name:'Praseodymium',mass:140.91,en:1.13,family:'lanthanide',g:5,p:9,x:5,y:9,fact:'Praseodymium gives glass a yellow-green color and is used in welding goggles.'},
    {n:60,sym:'Nd',name:'Neodymium',mass:144.24,en:1.14,family:'lanthanide',g:6,p:9,x:6,y:9,fact:'Neodymium magnets are the strongest permanent magnets commercially available.'},
    {n:61,sym:'Pm',name:'Promethium',mass:145.00,en:0.00,family:'lanthanide',g:7,p:9,x:7,y:9,fact:'Promethium is the only radioactive lanthanide and is used in pacemaker batteries.'},
    {n:62,sym:'Sm',name:'Samarium',mass:150.36,en:1.17,family:'lanthanide',g:8,p:9,x:8,y:9,fact:'Samarium cobalt magnets maintain their magnetism at temperatures exceeding 300°C.'},
    {n:63,sym:'Eu',name:'Europium',mass:151.96,en:0.00,family:'lanthanide',g:9,p:9,x:9,y:9,fact:'Europium is used in the red phosphor in LED and fluorescent lamps and in anti-counterfeiting Euro banknotes.'},
    {n:64,sym:'Gd',name:'Gadolinium',mass:157.25,en:1.20,family:'lanthanide',g:10,p:9,x:10,y:9,fact:'Gadolinium is used as a contrast agent in MRI scans due to its strong paramagnetic properties.'},
    {n:65,sym:'Tb',name:'Terbium',mass:158.93,en:0.00,family:'lanthanide',g:11,p:9,x:11,y:9,fact:'Terbium is used in solid-state devices and as a green phosphor in color TV tubes.'},
    {n:66,sym:'Dy',name:'Dysprosium',mass:162.50,en:1.22,family:'lanthanide',g:12,p:9,x:12,y:9,fact:'Dysprosium is used in high-strength permanent magnets for electric vehicle motors.'},
    {n:67,sym:'Ho',name:'Holmium',mass:164.93,en:1.23,family:'lanthanide',g:13,p:9,x:13,y:9,fact:'Holmium has the strongest magnetic moment of any element and is used in solid-state lasers.'},
    {n:68,sym:'Er',name:'Erbium',mass:167.26,en:1.24,family:'lanthanide',g:14,p:9,x:14,y:9,fact:'Erbium-doped fiber amplifiers (EDFAs) are critical for long-distance fiber-optic communications.'},
    {n:69,sym:'Tm',name:'Thulium',mass:168.93,en:1.25,family:'lanthanide',g:15,p:9,x:15,y:9,fact:'Thulium is the least abundant lanthanide and is used in portable X-ray devices.'},
    {n:70,sym:'Yb',name:'Ytterbium',mass:173.05,en:0.00,family:'lanthanide',g:16,p:9,x:16,y:9,fact:'Ytterbium is used in atomic clocks and as a doping agent in laser crystals.'},
    {n:71,sym:'Lu',name:'Lutetium',mass:174.97,en:1.27,family:'lanthanide',g:17,p:9,x:17,y:9,fact:'Lutetium is the last lanthanide and is used in PET scan detectors for medical imaging.'},
    {n:72,sym:'Hf',name:'Hafnium',mass:178.49,en:1.30,family:'transition',g:4,p:6,x:4,y:6,fact:'Hafnium has a very high neutron absorption cross-section and is used in nuclear control rods.'},
    {n:73,sym:'Ta',name:'Tantalum',mass:180.95,en:1.50,family:'transition',g:5,p:6,x:5,y:6,fact:'Tantalum resists corrosion by acids and is used in surgical implants and smartphone capacitors.'},
    {n:74,sym:'W',name:'Tungsten',mass:183.84,en:2.36,family:'transition',g:6,p:6,x:6,y:6,fact:'Tungsten has the highest melting point of any element (3422°C) and is used in light bulb filaments.'},
    {n:75,sym:'Re',name:'Rhenium',mass:186.21,en:1.90,family:'transition',g:7,p:6,x:7,y:6,fact:'Rhenium is one of the rarest elements in Earth\'s crust and is used in superalloys for jet engines.'},
    {n:76,sym:'Os',name:'Osmium',mass:190.23,en:2.20,family:'transition',g:8,p:6,x:8,y:6,fact:'Osmium is the densest naturally occurring element at 22.59 g/cm².'},
    {n:77,sym:'Ir',name:'Iridium',mass:192.22,en:2.20,family:'transition',g:9,p:6,x:9,y:6,fact:'The Cretaceous-Paleogene extinction layer is enriched in iridium, evidence of a massive asteroid impact.'},
    {n:78,sym:'Pt',name:'Platinum',mass:195.08,en:2.28,family:'transition',g:10,p:6,x:10,y:6,fact:'Platinum is used in catalytic converters, jewelry, and as a catalyst in fuel cells.'},
    {n:79,sym:'Au',name:'Gold',mass:196.97,en:2.54,family:'transition',g:11,p:6,x:11,y:6,fact:'Gold is the most malleable metal — a single gram can be hammered into a 1 m² sheet.'},
    {n:80,sym:'Hg',name:'Mercury',mass:200.59,en:2.00,family:'post-transition',g:12,p:6,x:12,y:6,fact:'Mercury is the only metal that is liquid at room temperature and was used in thermometers.'},
    {n:81,sym:'Tl',name:'Thallium',mass:204.38,en:2.04,family:'post-transition',g:13,p:6,x:13,y:6,fact:'Thallium is highly toxic and was famously used as a poison before its properties were understood.'},
    {n:82,sym:'Pb',name:'Lead',mass:207.20,en:2.33,family:'post-transition',g:14,p:6,x:14,y:6,fact:'Lead has been used by humans for millennia in pipes, paint, and batteries despite its toxicity.'},
    {n:83,sym:'Bi',name:'Bismuth',mass:208.98,en:2.02,family:'post-transition',g:15,p:6,x:15,y:6,fact:'Bismuth has a rainbow-colored oxide layer and is the heaviest element without a stable isotope.'},
    {n:84,sym:'Po',name:'Polonium',mass:209.00,en:2.00,family:'post-transition',g:16,p:6,x:16,y:6,fact:'Polonium is extremely radioactive and was used to poison Alexander Litvinenko in 2006.'},
    {n:85,sym:'At',name:'Astatine',mass:210.00,en:2.20,family:'halogen',g:17,p:6,x:17,y:6,fact:'Astatine is the rarest naturally occurring element on Earth with less than 1 gram present at any time.'},
    {n:86,sym:'Rn',name:'Radon',mass:222.00,en:0.00,family:'noble-gas',g:18,p:6,x:18,y:6,fact:'Radon is a radioactive noble gas that accumulates in basements and is the second leading cause of lung cancer.'},

    {n:87,sym:'Fr',name:'Francium',mass:223.00,en:0.70,family:'alkali-metal',g:1,p:7,x:1,y:7,fact:'Francium is the most unstable naturally occurring element with a half-life of just 22 minutes.'},
    {n:88,sym:'Ra',name:'Radium',mass:226.00,en:0.90,family:'alkaline-earth',g:2,p:7,x:2,y:7,fact:'Radium was once used in luminous watch dials and its discovery led to the term "radioactivity".'},
    {n:89,sym:'Ac',name:'Actinium',mass:227.00,en:1.10,family:'actinide',g:3,p:7,x:3,y:7,fact:'Actinium is 150 times more radioactive than radium and glows blue in the dark.'},
    {n:90,sym:'Th',name:'Thorium',mass:232.04,en:0.00,family:'actinide',g:4,p:10,x:4,y:10,fact:'Thorium is a potential nuclear fuel that produces less long-lived radioactive waste than uranium.'},
    {n:91,sym:'Pa',name:'Protactinium',mass:231.04,en:0.00,family:'actinide',g:5,p:10,x:5,y:10,fact:'Protactinium is scarce and was the last naturally occurring element to be discovered (1917).'},
    {n:92,sym:'U',name:'Uranium',mass:238.03,en:1.38,family:'actinide',g:6,p:10,x:6,y:10,fact:'Uranium is the heaviest naturally occurring element and is used as fuel in nuclear power plants.'},
    {n:93,sym:'Np',name:'Neptunium',mass:237.00,en:1.36,family:'actinide',g:7,p:10,x:7,y:10,fact:'Neptunium was the first transuranium element discovered and is named after the planet Neptune.'},
    {n:94,sym:'Pu',name:'Plutonium',mass:244.00,en:1.28,family:'actinide',g:8,p:10,x:8,y:10,fact:'Plutonium-238 produces heat via radioactive decay and powers NASA deep-space probes.'},
    {n:95,sym:'Am',name:'Americium',mass:243.00,en:1.30,family:'actinide',g:9,p:10,x:9,y:10,fact:'Americium is used in household smoke detectors as a source of alpha radiation.'},
    {n:96,sym:'Cm',name:'Curium',mass:247.00,en:1.30,family:'actinide',g:10,p:10,x:10,y:10,fact:'Curium is named after Marie and Pierre Curie and is used in alpha particle X-ray spectrometers.'},
    {n:97,sym:'Bk',name:'Berkelium',mass:247.00,en:1.30,family:'actinide',g:11,p:10,x:11,y:10,fact:'Berkelium was first synthesized at UC Berkeley in 1949 (named after the city).'},
    {n:98,sym:'Cf',name:'Californium',mass:251.00,en:1.30,family:'actinide',g:12,p:10,x:12,y:10,fact:'Californium-252 is a powerful neutron source used in airport security scanning.'},
    {n:99,sym:'Es',name:'Einsteinium',mass:252.00,en:1.30,family:'actinide',g:13,p:10,x:13,y:10,fact:'Einsteinium was discovered in the debris of the first hydrogen bomb test in 1952.'},
    {n:100,sym:'Fm',name:'Fermium',mass:257.00,en:1.30,family:'actinide',g:14,p:10,x:14,y:10,fact:'Fermium was named after Enrico Fermi and is produced by bombarding plutonium with neutrons.'},
    {n:101,sym:'Md',name:'Mendelevium',mass:258.00,en:1.30,family:'actinide',g:15,p:10,x:15,y:10,fact:'Mendelevium was named after Dmitri Mendeleev, creator of the periodic table.'},
    {n:102,sym:'No',name:'Nobelium',mass:259.00,en:1.30,family:'actinide',g:16,p:10,x:16,y:10,fact:'Nobelium is named after Alfred Nobel and was first synthesized at the Nobel Institute in Sweden.'},
    {n:103,sym:'Lr',name:'Lawrencium',mass:266.00,en:0.00,family:'actinide',g:17,p:10,x:17,y:10,fact:'Lawrencium was named after Ernest Lawrence, inventor of the cyclotron particle accelerator.'},
    {n:104,sym:'Rf',name:'Rutherfordium',mass:267.00,en:0.00,family:'transition',g:4,p:7,x:4,y:7,fact:'Rutherfordium is named after Ernest Rutherford and was first synthesized in 1964.'},
    {n:105,sym:'Db',name:'Dubnium',mass:268.00,en:0.00,family:'transition',g:5,p:7,x:5,y:7,fact:'Dubnium was named after the Russian town Dubna where it was first synthesized.'},
    {n:106,sym:'Sg',name:'Seaborgium',mass:269.00,en:0.00,family:'transition',g:6,p:7,x:6,y:7,fact:'Seaborgium is named after Glenn Seaborg and was the first element named after a person while alive.'},
    {n:107,sym:'Bh',name:'Bohrium',mass:270.00,en:0.00,family:'transition',g:7,p:7,x:7,y:7,fact:'Bohrium is named after Niels Bohr and was first synthesized by a German-Russian collaboration.'},
    {n:108,sym:'Hs',name:'Hassium',mass:269.00,en:0.00,family:'transition',g:8,p:7,x:8,y:7,fact:'Hassium is named after the German state of Hessen where it was discovered at GSI.'},
    {n:109,sym:'Mt',name:'Meitnerium',mass:278.00,en:0.00,family:'transition',g:9,p:7,x:9,y:7,fact:'Meitnerium is named after Lise Meitner, co-discoverer of nuclear fission.'},
    {n:110,sym:'Ds',name:'Darmstadtium',mass:281.00,en:0.00,family:'transition',g:10,p:7,x:10,y:7,fact:'Darmstadtium is named after Darmstadt, Germany, home to the GSI research facility.'},
    {n:111,sym:'Rg',name:'Roentgenium',mass:282.00,en:0.00,family:'transition',g:11,p:7,x:11,y:7,fact:'Roentgenium is named after Wilhelm Röntgen, discoverer of X-rays.'},
    {n:112,sym:'Cn',name:'Copernicium',mass:285.00,en:0.00,family:'transition',g:12,p:7,x:12,y:7,fact:'Copernicium is named after Nicolaus Copernicus and is highly unstable.'},
    {n:113,sym:'Nh',name:'Nihonium',mass:286.00,en:0.00,family:'post-transition',g:13,p:7,x:13,y:7,fact:'Nihonium was first synthesized by RIKEN in Japan and named after Nihon (Japan).'},
    {n:114,sym:'Fl',name:'Flerovium',mass:289.00,en:0.00,family:'post-transition',g:14,p:7,x:14,y:7,fact:'Flerovium is named after the Flerov Laboratory of Nuclear Reactions in Russia.'},
    {n:115,sym:'Mc',name:'Moscovium',mass:290.00,en:0.00,family:'post-transition',g:15,p:7,x:15,y:7,fact:'Moscovium is named after Moscow Oblast and was confirmed in 2016.'},
    {n:116,sym:'Lv',name:'Livermorium',mass:293.00,en:0.00,family:'post-transition',g:16,p:7,x:16,y:7,fact:'Livermorium is named after Lawrence Livermore National Laboratory in California.'},
    {n:117,sym:'Ts',name:'Tennessine',mass:294.00,en:0.00,family:'halogen',g:17,p:7,x:17,y:7,fact:'Tennessine is named after Tennessee, home to Oak Ridge National Laboratory and Vanderbilt University.'},
    {n:118,sym:'Og',name:'Oganesson',mass:294.00,en:0.00,family:'noble-gas',g:18,p:7,x:18,y:7,fact:'Oganesson is the heaviest known element and is named after Yuri Oganessian, a pioneer in superheavy element research.'}
  ];

  /* ─── STATE ─── */
  let selectedEl = null;
  let activeFamily = 'all';
  let searchQuery = '';

  /* ─── BUILD GRID ─── */
  function buildGrid() {
    gridContainer.innerHTML = '';
    ELEMENTS.forEach(el => {
      const cell = document.createElement('div');
      cell.className = 'el-cell family-' + el.family;
      cell.dataset.n = el.n;
      cell.dataset.sym = el.sym;
      cell.dataset.name = el.name.toLowerCase();
      cell.style.gridColumn = el.x;
      cell.style.gridRow = el.y;

      cell.innerHTML = `
        <div class="el-number">${el.n}</div>
        <div class="el-symbol">${el.sym}</div>
        <div class="el-name">${el.name}</div>
        <div class="el-mass">${el.mass}</div>
      `;

      cell.addEventListener('click', () => selectElement(el));
      cell.addEventListener('mouseenter', () => hoverElement(el, cell));
      gridContainer.appendChild(cell);
    });
  }

  /* ─── SELECTION ─── */
  function selectElement(el) {
    selectedEl = el;
    $$('.el-cell').forEach(c => c.classList.remove('selected'));
    const cell = document.querySelector(`.el-cell[data-n="${el.n}"]`);
    if (cell) cell.classList.add('selected');
    showInspector(el);
    showToast('[SELECT] ' + el.sym + ' (' + el.name + ')', getFamilyColor(el.family));
    countVal.textContent = el.sym;
  }

  function hoverElement(el, cell) {
    if (selectedEl && selectedEl.n === el.n) return;
    showInspector(el);
    inspectorHint.textContent = el.sym;
  }

  function showInspector(el) {
    inspectorEmpty.classList.add('hidden');
    inspectorData.classList.remove('hidden');
    idNum.textContent = el.n;
    idSym.textContent = el.sym;
    idSym.style.color = getFamilyColor(el.family);
    idMass.textContent = el.mass + ' u';
    idName.textContent = el.name;
    idEn.textContent = el.en || '--';
    idFamily.textContent = formatFamily(el.family);
    idFamily.style.color = getFamilyColor(el.family);
    idPeriod.textContent = el.p;
    idGroup.textContent = el.g;
    idFact.textContent = el.fact;
  }

  function clearInspector() {
    inspectorEmpty.classList.remove('hidden');
    inspectorData.classList.add('hidden');
    inspectorHint.textContent = '--';
  }

  /* ─── FAMILY FILTER ─── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      activeFamily = this.dataset.family;
      familyVal.textContent = activeFamily === 'all' ? 'ALL' : formatFamily(activeFamily).toUpperCase();
      applyFilters();
      showToast('[FILTER] ' + formatFamily(activeFamily), getFamilyColor(activeFamily));
    });
  });

  function applyFilters() {
    const cards = $$('.el-cell');
    let visible = 0;
    cards.forEach(c => {
      const n = parseInt(c.dataset.n, 10);
      const el = ELEMENTS.find(e => e.n === n);
      if (!el) return;

      const matchFamily = activeFamily === 'all' || el.family === activeFamily;
      const matchSearch = !searchQuery ||
        el.name.toLowerCase().includes(searchQuery) ||
        el.sym.toLowerCase().includes(searchQuery) ||
        el.n.toString() === searchQuery;

      if (matchFamily && matchSearch) {
        c.classList.remove('dim');
        visible++;
      } else {
        c.classList.add('dim');
      }
    });
    countVal.textContent = visible;
  }

  /* ─── SEARCH ─── */
  searchInput.addEventListener('input', function() {
    searchQuery = this.value.trim().toLowerCase();
    applyFilters();

    if (searchQuery) {
      const exact = ELEMENTS.find(el =>
        el.name.toLowerCase() === searchQuery ||
        el.sym.toLowerCase() === searchQuery
      );
      if (exact) {
        const cell = document.querySelector(`.el-cell[data-n="${exact.n}"]`);
        if (cell) {
          cell.classList.add('matched');
          setTimeout(() => cell.classList.remove('matched'), 2400);
          selectElement(exact);
        }
      }
    }
  });

  /* ─── SHELL CONFIG ─── */
  btnShell.addEventListener('click', function() {
    if (!selectedEl) {
      showToast('[WARN] No element selected — click a grid cell first', '#ffb800');
      return;
    }
    const config = getShellConfig(selectedEl.n);
    showToast('[SHELL] ' + selectedEl.sym + ' electron config: ' + config, '#00e5ff');
  });

  function getShellConfig(n) {
    if (n <= 2) return '1s' + (n === 1 ? '¹' : '²');
    if (n <= 10) {
      const inner = '1s²2s²2p' + toSuperscript(n - 4);
      return inner;
    }
    if (n <= 18) {
      const inner = '1s²2s²2p⁶3s²3p' + toSuperscript(n - 12);
      return inner;
    }
    if (n <= 36) {
      return '1s²2s²2p⁶3s²3p⁶4s²3d¹⁰4p' + toSuperscript(n - 30);
    }
    if (n <= 54) {
      return '1s²2s²2p⁶3s²3p⁶4s²3d¹⁰4p⁶5s²4d¹⁰5p' + toSuperscript(n - 48);
    }
    if (n <= 86) {
      return '1s²2s²2p⁶3s²3p⁶4s²3d¹⁰4p⁶5s²4d¹⁰5p⁶6s²4f¹⁴5d¹⁰6p' + toSuperscript(n - 80);
    }
    return '1s²2s²2p⁶3s²3p⁶4s²3d¹⁰4p⁶5s²4d¹⁰5p⁶6s²4f¹⁴5d¹⁰6p⁶7s²5f¹⁴6d¹⁰7p' + toSuperscript(n - 118);
  }

  function toSuperscript(num) {
    const supers = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    return num.toString().split('').map(d => supers[parseInt(d)]).join('');
  }

  /* ─── PURGE ─── */
  btnPurge.addEventListener('click', function() {
    selectedEl = null;
    activeFamily = 'all';
    searchQuery = '';
    searchInput.value = '';
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-family="all"]').classList.add('active');
    familyVal.textContent = 'ALL';
    clearInspector();
    $$('.el-cell').forEach(c => {
      c.classList.remove('dim', 'selected', 'matched');
    });
    countVal.textContent = ELEMENTS.length;
    showToast('[PURGE] Selection cleared — grid restored', '#8892a8');
  });

  /* ─── HELPERS ─── */
  function getFamilyColor(family) {
    const colors = {
      'alkali-metal':'#ff6d00','alkaline-earth':'#ffea00','transition':'#00e5ff',
      'post-transition':'#00bcd4','metalloid':'#ffb800','nonmetal':'#e91e63',
      'halogen':'#ffea00','noble-gas':'#00e676','lanthanide':'#7c4dff',
      'actinide':'#ff1744'
    };
    return colors[family] || '#00e5ff';
  }

  function formatFamily(family) {
    const names = {
      'alkali-metal':'Alkali Metal','alkaline-earth':'Alkaline Earth','transition':'Transition Metal',
      'post-transition':'Post-Transition Metal','metalloid':'Metalloid','nonmetal':'Nonmetal',
      'halogen':'Halogen','noble-gas':'Noble Gas','lanthanide':'Lanthanide','actinide':'Actinide',
      'all':'All Elements'
    };
    return names[family] || family;
  }

  function showToast(msg, color) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    if (color) el.style.borderLeft = '3px solid ' + color;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
    }, 3500);
  }

  /* ─── INIT ─── */
  buildGrid();
  countVal.textContent = ELEMENTS.length;
  showToast('[INIT] Periodic table loaded — ' + ELEMENTS.length + ' elements', '#00e676');

})();
