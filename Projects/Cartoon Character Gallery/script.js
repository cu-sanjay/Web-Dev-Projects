/* ============================================================
   TOON-SPROUT // Cartoon Character Gallery — Script Engine
   ============================================================ */

/* ----- CHARACTER DATABASE (14 Records) ----- */
const ALL_CHARACTERS = [
  {
    id: 1, name: 'Bramble Whisk', universe: 'Whimsy Woods',
    era: 'Golden', origin: 'Television', alignment: 'Heroic',
    description: 'A spirited woodland squirrel who navigates magical forests to recover ancient acorn artifacts. Known for fearless tree-leaping and a map collection written on bark. His courage is matched only by his boundless curiosity.',
    stats: { power: 65, agility: 92, comedy: 45 },
    tags: ['animal', 'squirrel', 'forest', 'treasure', 'courageous', 'map'],
    year: 1985
  },
  {
    id: 2, name: 'Zara Quantum', universe: 'Lyra Nebula',
    era: 'Modern', origin: 'Cinematic Feature', alignment: 'Heroic',
    description: 'An interstellar diplomat from the Lyra Nebula who wields probability manipulation. Calm yet determined, she negotiates peace across warring star systems using impossible mathematics and quiet resolve.',
    stats: { power: 88, agility: 72, comedy: 20 },
    tags: ['sci-fi', 'alien', 'diplomat', 'space', 'peacekeeper', 'quantum'],
    year: 2021
  },
  {
    id: 3, name: 'Morgrim Shadowdusk', universe: 'Nethervale',
    era: 'Modern', origin: 'Indie Webcomic', alignment: 'Mischievous',
    description: 'A brooding shadowcaster from the Nethervale who collects lost souls in crystal vials. Speaks in riddles and never reveals his true intentions. Despite his ominous facade, he secretly aids lost spirits find peace.',
    stats: { power: 95, agility: 48, comedy: 35 },
    tags: ['dark', 'wizard', 'shadow', 'crystals', 'mysterious', 'souls'],
    year: 2023
  },
  {
    id: 4, name: 'Pip Squeakerson', universe: 'Mouseton',
    era: 'Classic', origin: 'Television', alignment: 'Heroic',
    description: 'The smallest mouse in Mouseton with the biggest heart. Always outsmarting cats twice his size using nothing but clever traps and cheese decoys. His rallying cry "From tiny paws, mighty deeds!" inspires rodents everywhere.',
    stats: { power: 28, agility: 85, comedy: 78 },
    tags: ['animal', 'mouse', 'comedy', 'tricks', 'brave', 'cheese'],
    year: 1958
  },
  {
    id: 5, name: 'Nova Stardust', universe: 'Celestial Expanse',
    era: 'Modern', origin: 'Cinematic Feature', alignment: 'Heroic',
    description: 'A cosmic guardian born from a dying star. Wields the Celestial Spear to defend the universe from void creatures threatening reality itself. Her luminous presence brings hope to the darkest corners of space.',
    stats: { power: 92, agility: 70, comedy: 25 },
    tags: ['sci-fi', 'guardian', 'star', 'cosmic', 'warrior', 'light'],
    year: 2022
  },
  {
    id: 6, name: 'Thistle McThorn', universe: 'Wildwood Glade',
    era: 'Golden', origin: 'Television', alignment: 'Mischievous',
    description: 'A mischievous garden sprite who rearranges flower beds for entertainment. Leaves trails of pollen dust and giggling echoes wherever she flits. Her pranks are legendary, but the flowers always bloom brighter after her visits.',
    stats: { power: 42, agility: 90, comedy: 72 },
    tags: ['fairy', 'trickster', 'garden', 'pollen', 'fly', 'flowers'],
    year: 1978
  },
  {
    id: 7, name: 'Luna Moonwhisper', universe: 'Silver Crescent',
    era: 'Classic', origin: 'Cinematic Feature', alignment: 'Neutral',
    description: 'An eternal lunar spirit who guides lost travelers. Neither good nor evil, she simply observes, occasionally nudging fate in subtle ways. Her silver tears become falling stars that grant quiet wishes.',
    stats: { power: 78, agility: 55, comedy: 30 },
    tags: ['spirit', 'moon', 'eternal', 'guide', 'mystical', 'stars'],
    year: 1965
  },
  {
    id: 8, name: 'Blip Blorp', universe: 'Circuit Cavern',
    era: 'Modern', origin: 'Indie Webcomic', alignment: 'Heroic',
    description: 'A malfunctioning utility droid who gained sentience after a lightning strike. Speaks in beeps but communicates complex emotions through holographic emoji projections. His quest is to find the perfect cup of oil.',
    stats: { power: 35, agility: 60, comedy: 88 },
    tags: ['robot', 'sci-fi', 'comedy', 'droid', 'hologram', 'sentient'],
    year: 2024
  },
  {
    id: 9, name: 'Captain Riptide', universe: 'Skyward Seas',
    era: 'Golden', origin: 'Cinematic Feature', alignment: 'Heroic',
    description: 'A swashbuckling sea captain with a ship that sails on clouds. Master of the "tidal pivot" maneuver and collector of rare oceanic artifacts. His compass points not north, but toward the next great adventure.',
    stats: { power: 82, agility: 68, comedy: 40 },
    tags: ['adventure', 'pirate', 'ocean', 'clouds', 'captain', 'ship'],
    year: 1988
  },
  {
    id: 10, name: 'Glimmer Shard', universe: 'Geo-Hearth',
    era: 'Modern', origin: 'Indie Webcomic', alignment: 'Neutral',
    description: 'A crystalline entity from the Geo-Hearth dimension. Reflects emotions as colored light patterns and remains neutral in all conflicts. Her facets reveal different truths depending on how the light hits them.',
    stats: { power: 70, agility: 45, comedy: 50 },
    tags: ['crystal', 'gem', 'light', 'neutral', 'dimension', 'reflection'],
    year: 2022
  },
  {
    id: 11, name: 'Buster B. Bunny', universe: 'Bunny Burrow',
    era: 'Classic', origin: 'Television', alignment: 'Mischievous',
    description: 'The fastest carrot-chomper in cartoon history. Always pulling pranks on farmers and foxes, but has a secret soft spot for helping lost baby animals. His clever trickster ways have foiled countless would-be captors.',
    stats: { power: 38, agility: 95, comedy: 85 },
    tags: ['animal', 'rabbit', 'comedy', 'pranks', 'speed', 'carrot'],
    year: 1952
  },
  {
    id: 12, name: 'Fern Wildheart', universe: 'Verdant Reach',
    era: 'Modern', origin: 'Indie Webcomic', alignment: 'Heroic',
    description: 'A gentle dryad who speaks the language of leaves. She nurtures dying forests back to life and communicates through rustling foliage and blooming flowers. Every step she takes leaves a trail of new growth.',
    stats: { power: 72, agility: 50, comedy: 42 },
    tags: ['dryad', 'nature', 'forest', 'plants', 'healing', 'growth'],
    year: 2023
  },
  {
    id: 13, name: 'Dr. Volt Static', universe: 'Clockwork Citadel',
    era: 'Golden', origin: 'Television', alignment: 'Neutral',
    description: 'A brilliant but eccentric scientist who replaced half his brain with clockwork gears. Builds incredible inventions that work 60% of the time, every time. His laboratory is a beautiful chaos of whirring gears and crackling energy.',
    stats: { power: 85, agility: 40, comedy: 65 },
    tags: ['sci-fi', 'inventor', 'clockwork', 'electric', 'eccentric', 'gear'],
    year: 1975
  },
  {
    id: 14, name: 'Poppy Seedworth', universe: 'Dreamweave Valley',
    era: 'Modern', origin: 'Cinematic Feature', alignment: 'Heroic',
    description: 'A dream weaver who paints the night sky with stardust. Each dream she creates is a miniature universe where impossible things happen daily. She believes every dreamer holds the brush to their own destiny.',
    stats: { power: 60, agility: 75, comedy: 55 },
    tags: ['dream', 'stars', 'magic', 'night', 'painter', 'imagination'],
    year: 2020
  }
];

/* ============================================================
   SVG AVATAR GENERATOR
   ============================================================ */
function generateAvatarSVG(char) {
  const palette = {
    Classic: { g1: '#4caf50', g2: '#2e7d32', deco: '#81c784', accent: '#a5d6a7' },
    Golden: { g1: '#009688', g2: '#00695c', deco: '#4db6ac', accent: '#80cbc4' },
    Modern: { g1: '#795548', g2: '#4e342e', deco: '#a1887f', accent: '#bcaaa4' }
  };
  const p = palette[char.era] || palette.Modern;
  const shapes = [
    `<circle cx="50" cy="52" r="28" fill="${p.deco}" opacity="0.35"/>`,
    `<polygon points="50,22 78,36 78,64 50,78 22,64 22,36" fill="${p.deco}" opacity="0.35"/>`,
    `<polygon points="50,25 75,50 50,75 25,50" fill="${p.deco}" opacity="0.35"/>`,
    `<polygon points="50,28 58,43 77,46 63,58 67,78 50,68 33,78 37,58 23,46 42,43" fill="${p.deco}" opacity="0.35"/>`,
    `<polygon points="50,28 76,72 24,72" fill="${p.deco}" opacity="0.35"/>`,
    `<polygon points="50,30 74,52 66,74 34,74 26,52" fill="${p.deco}" opacity="0.35"/>`
  ];
  const mouthMap = {
    Heroic: `M 40 62 Q 50 72 60 62`,
    Neutral: `M 42 64 L 58 64`,
    Mischievous: `M 42 62 Q 50 62 60 56`
  };
  const seed = char.id % shapes.length;
  const initial = char.name.charAt(0).toUpperCase();
  const eyeColor = char.alignment === 'Mischievous' ? '#1b3a24' : '#ffffff';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="av-bg-${char.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p.g1}"/>
        <stop offset="100%" stop-color="${p.g2}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="16" fill="url(#av-bg-${char.id})"/>
    ${shapes[seed]}
    <circle cx="38" cy="44" r="4" fill="${eyeColor}" opacity="0.85"/>
    <circle cx="62" cy="44" r="4" fill="${eyeColor}" opacity="0.85"/>
    <circle cx="38" cy="44" r="1.5" fill="#1b3a24" opacity="0.6"/>
    <circle cx="62" cy="44" r="1.5" fill="#1b3a24" opacity="0.6"/>
    <path d="${mouthMap[char.alignment]}" fill="none" stroke="${eyeColor}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    <text x="50" y="87" text-anchor="middle" fill="${p.accent}" font-size="18" font-weight="700" font-family="ui-monospace,Consolas,monospace" opacity="0.9">${initial}</text>
  </svg>`;
}

/* ============================================================
   STATE MANAGEMENT
   ============================================================ */
const state = {
  searchQuery: '',
  selectedEras: [],
  selectedOrigins: [],
  selectedAlignments: [],
  powerMax: 100,
  agilityMax: 100,
  comedyMax: 100,
  sortMode: 'alphabetical',
  filteredCharacters: [],
  activeFilters: 0
};

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  gridCanvas: $('#gridCanvas'),
  searchInput: $('#searchInput'),
  sortSelect: $('#sortSelect'),
  totalCount: $('#totalCount'),
  visibleCount: $('#visibleCount'),
  filterCount: $('#filterCount'),
  statusText: $('.status-text'),
  statusDot: $('.status-dot'),
  powerSlider: $('#powerSlider'),
  agilitySlider: $('#agilitySlider'),
  comedySlider: $('#comedySlider'),
  powerVal: $('#powerVal'),
  agilityVal: $('#agilityVal'),
  comedyVal: $('#comedyVal'),
  modal: $('#characterModal'),
  modalBody: $('#modalBody'),
  modalClose: $('#modalClose'),
  reflowBtn: $('#reflowBtn'),
  clearBtn: $('#clearBtn'),
  randomBtn: $('#randomBtn'),
  exportBtn: $('#exportBtn')
};

/* ============================================================
   GRID COLUMN CALCULATOR (W_card formula)
   ============================================================ */
function calculateGridLayout() {
  const wViewport = dom.gridCanvas.clientWidth;
  const gap = 16;
  const padding = 32;
  let nCols;
  if (wViewport < 640) nCols = 1;
  else if (wViewport < 860) nCols = 2;
  else if (wViewport < 1100) nCols = 3;
  else nCols = 4;
  const wCard = (wViewport - (gap * (nCols - 1)) - padding) / nCols;
  dom.gridCanvas.style.gridTemplateColumns = `repeat(${nCols}, 1fr)`;
  return { nCols, wCard };
}

/* ============================================================
   FILTER PIPELINE — M(q, Tc) matching
   ============================================================ */
function matchesSearch(char) {
  const q = state.searchQuery.trim().toLowerCase();
  if (!q) return true;
  if (char.name.toLowerCase().includes(q)) return true;
  return char.tags.some(t => t.toLowerCase().includes(q));
}

function countActiveFilters() {
  let n = 0;
  if (state.searchQuery) n++;
  if (state.selectedEras.length) n++;
  if (state.selectedOrigins.length) n++;
  if (state.selectedAlignments.length) n++;
  if (state.powerMax < 100) n++;
  if (state.agilityMax < 100) n++;
  if (state.comedyMax < 100) n++;
  return n;
}

function filterCharacters() {
  return ALL_CHARACTERS.filter(char => {
    if (!matchesSearch(char)) return false;
    if (state.selectedEras.length && !state.selectedEras.includes(char.era)) return false;
    if (state.selectedOrigins.length && !state.selectedOrigins.includes(char.origin)) return false;
    if (state.selectedAlignments.length && !state.selectedAlignments.includes(char.alignment)) return false;
    if (char.stats.power > state.powerMax) return false;
    if (char.stats.agility > state.agilityMax) return false;
    if (char.stats.comedy > state.comedyMax) return false;
    return true;
  });
}

/* ============================================================
   SORT ENGINE
   ============================================================ */
function sortCharacters(arr) {
  const s = state.sortMode;
  if (s === 'alphabetical') arr.sort((a, b) => a.name.localeCompare(b.name));
  else if (s === 'power') arr.sort((a, b) => b.stats.power - a.stats.power);
  else if (s === 'year') arr.sort((a, b) => b.year - a.year);
}

/* ============================================================
   RENDER ENGINE
   ============================================================ */
function renderGallery(animate) {
  calculateGridLayout();
  const list = state.filteredCharacters;
  dom.gridCanvas.innerHTML = '';

  if (!list.length) {
    dom.gridCanvas.innerHTML = `
      <div class="grid-empty">
        <svg viewBox="0 0 60 60" width="60" height="60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#c8d8be" stroke-width="2"/>
          <path d="M 22 22 L 38 38 M 38 22 L 22 38" stroke="#c8d8be" stroke-width="2" stroke-linecap="round"/>
          <circle cx="30" cy="15" r="4" fill="#e2ebd9"/>
          <circle cx="30" cy="45" r="4" fill="#e2ebd9"/>
        </svg>
        <div class="grid-empty-text">No Characters Found</div>
        <div class="grid-empty-sub">Adjust your filter criteria to expand the catalog</div>
      </div>`;
    dom.visibleCount.textContent = '0';
    updateStatus('NO CHARACTER IDENTITIES MATCH BOUNDING CRITERIA');
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach((char, i) => {
    const svg = generateAvatarSVG(char);
    const originShort = char.origin === 'Cinematic Feature' ? 'Cinematic'
      : char.origin === 'Indie Webcomic' ? 'Webcomic' : char.origin;
    const eraClass = `era-${char.era.replace(/\s+/g, '')}`;
    const originClass = `origin-${originShort}`;
    const alignClass = `align-${char.alignment}`;

    const card = document.createElement('div');
    card.className = 'character-card' + (animate ? ' bloom' : '');
    if (animate) card.style.animationDelay = `${i * 50}ms`;
    card.dataset.id = char.id;
    card.innerHTML = `
      <div class="card-avatar">${svg}</div>
      <div class="card-body">
        <div class="card-name">${char.name}</div>
        <div class="card-universe">${char.universe}</div>
        <div class="card-badges">
          <span class="card-badge ${eraClass}">${char.era}</span>
          <span class="card-badge ${originClass}">${originShort}</span>
          <span class="card-badge ${alignClass}">${char.alignment}</span>
        </div>
        <div class="card-stats">
          <div class="card-stat">
            <span class="card-stat-label">PWR</span>
            <div class="card-stat-bar"><div class="card-stat-fill power" style="width:${char.stats.power}%"></div></div>
            <span class="card-stat-val">${char.stats.power}</span>
          </div>
          <div class="card-stat">
            <span class="card-stat-label">AGI</span>
            <div class="card-stat-bar"><div class="card-stat-fill agility" style="width:${char.stats.agility}%"></div></div>
            <span class="card-stat-val">${char.stats.agility}</span>
          </div>
          <div class="card-stat">
            <span class="card-stat-label">COM</span>
            <div class="card-stat-bar"><div class="card-stat-fill comedy" style="width:${char.stats.comedy}%"></div></div>
            <span class="card-stat-val">${char.stats.comedy}</span>
          </div>
        </div>
      </div>`;
    fragment.appendChild(card);
  });

  dom.gridCanvas.appendChild(fragment);

  dom.visibleCount.textContent = list.length;

  if (state.activeFilters > 0) {
    updateStatus('CATALOG MATCHING SUCCESSFUL');
  } else {
    updateStatus('AWAITING TRANSFORMATION MATRIX');
  }
}

/* ============================================================
   MODAL SYSTEM
   ============================================================ */
function openModal(char) {
  const svg = generateAvatarSVG(char);
  const originShort = char.origin === 'Cinematic Feature' ? 'Cinematic'
    : char.origin === 'Indie Webcomic' ? 'Webcomic' : char.origin;
  const eraClass = `era-${char.era.replace(/\s+/g, '')}`;
  const originClass = `origin-${originShort}`;
  const alignClass = `align-${char.alignment}`;

  dom.modalBody.innerHTML = `
    <div class="modal-header">
      <div class="modal-avatar">${svg}</div>
      <div class="modal-header-info">
        <div class="modal-name">${char.name}</div>
        <div class="modal-universe">${char.universe}</div>
        <div class="modal-badges">
          <span class="modal-badge ${eraClass}">${char.era}</span>
          <span class="modal-badge ${originClass}">${originShort}</span>
          <span class="modal-badge ${alignClass}">${char.alignment}</span>
        </div>
      </div>
    </div>
    <div class="modal-description"><p>${char.description}</p></div>
    <div class="modal-stats-section">
      <div class="modal-stats-title">Attribute Matrix</div>
      ${['power','agility','comedy'].map(s => `
        <div class="modal-stat-row">
          <span class="modal-stat-label">${s.toUpperCase()}</span>
          <div class="modal-stat-bar-bg"><div class="modal-stat-bar-fill ${s}" style="width:${char.stats[s]}%"></div></div>
          <span class="modal-stat-value">${char.stats[s]}</span>
        </div>`).join('')}
    </div>
    <div class="modal-tags-section">
      <div class="modal-tags-title">Tag Index</div>
      <div class="modal-tags-grid">
        ${char.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
      </div>
    </div>`;

  dom.modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  dom.modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ============================================================
   CSV EXPORT ENGINE
   ============================================================ */
function exportCSV() {
  const chars = state.filteredCharacters;
  if (!chars.length) return;
  const headers = ['ID','Name','Universe','Era','Origin','Alignment','Power','Agility','Comedy','Year','Tags'];
  const rows = chars.map(c => [
    c.id, c.name, c.universe, c.era, c.origin, c.alignment,
    c.stats.power, c.stats.agility, c.stats.comedy, c.year,
    `"${c.tags.join(', ')}"`
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `toon-sprout-manifest-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
function showRandomCharacter() {
  const pool = state.filteredCharacters.length ? state.filteredCharacters : ALL_CHARACTERS;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick) openModal(pick);
}

function clearFilters() {
  dom.searchInput.value = '';
  $$('.checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);
  [dom.powerSlider, dom.agilitySlider, dom.comedySlider].forEach(s => s.value = '100');
  dom.powerVal.textContent = '100';
  dom.agilityVal.textContent = '100';
  dom.comedyVal.textContent = '100';
  dom.sortSelect.value = 'alphabetical';

  state.searchQuery = '';
  state.selectedEras = [];
  state.selectedOrigins = [];
  state.selectedAlignments = [];
  state.powerMax = 100;
  state.agilityMax = 100;
  state.comedyMax = 100;
  state.sortMode = 'alphabetical';

  applyFilters();
}

function triggerReflow() {
  $$('.character-card').forEach(c => c.classList.add('leaving'));
  updateStatus('GRID RE-ARRANGING OVER TIME...');
  setTimeout(() => renderGallery(true), 350);
}

function updateStatus(msg) {
  dom.statusText.textContent = msg;
}

/* ============================================================
   MASTER FILTER APPLY
   ============================================================ */
function applyFilters() {
  state.activeFilters = countActiveFilters();
  dom.filterCount.textContent = state.activeFilters;

  let result = filterCharacters();
  sortCharacters(result);
  state.filteredCharacters = result;

  renderGallery(false);
}

/* ============================================================
   EVENT BINDINGS
   ============================================================ */
function bindEvents() {
  /* Search input */
  dom.searchInput.addEventListener('input', () => {
    state.searchQuery = dom.searchInput.value;
    applyFilters();
  });

  /* Checkbox groups */
  $$('.checkbox-group').forEach(group => {
    group.addEventListener('change', () => {
      const type = group.dataset.filter;
      const checked = [...group.querySelectorAll('input:checked')].map(cb => cb.value);
      if (type === 'era') state.selectedEras = checked;
      else if (type === 'origin') state.selectedOrigins = checked;
      else if (type === 'alignment') state.selectedAlignments = checked;
      applyFilters();
    });
  });

  /* Range sliders */
  dom.powerSlider.addEventListener('input', () => {
    state.powerMax = +dom.powerSlider.value;
    dom.powerVal.textContent = state.powerMax;
    applyFilters();
  });
  dom.agilitySlider.addEventListener('input', () => {
    state.agilityMax = +dom.agilitySlider.value;
    dom.agilityVal.textContent = state.agilityMax;
    applyFilters();
  });
  dom.comedySlider.addEventListener('input', () => {
    state.comedyMax = +dom.comedySlider.value;
    dom.comedyVal.textContent = state.comedyMax;
    applyFilters();
  });

  /* Sort select */
  dom.sortSelect.addEventListener('change', () => {
    state.sortMode = dom.sortSelect.value;
    applyFilters();
  });

  /* Card click delegation for modal */
  dom.gridCanvas.addEventListener('click', (e) => {
    const card = e.target.closest('.character-card');
    if (!card) return;
    const id = parseInt(card.dataset.id);
    const char = ALL_CHARACTERS.find(c => c.id === id);
    if (char) openModal(char);
  });

  /* Modal close */
  dom.modal.addEventListener('click', (e) => {
    if (e.target === dom.modal) closeModal();
  });
  dom.modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* Action buttons */
  dom.reflowBtn.addEventListener('click', triggerReflow);
  dom.clearBtn.addEventListener('click', clearFilters);
  dom.randomBtn.addEventListener('click', showRandomCharacter);
  dom.exportBtn.addEventListener('click', exportCSV);

  /* Window resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      calculateGridLayout();
    }, 150);
  });
}

/* ============================================================
   INITIALIZATION
   ============================================================ */
function init() {
  state.filteredCharacters = [...ALL_CHARACTERS];
  sortCharacters(state.filteredCharacters);
  dom.totalCount.textContent = ALL_CHARACTERS.length;
  dom.visibleCount.textContent = ALL_CHARACTERS.length;
  dom.filterCount.textContent = '0';
  bindEvents();
  renderGallery(true);
}

document.addEventListener('DOMContentLoaded', init);
