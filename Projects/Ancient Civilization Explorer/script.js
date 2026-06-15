(function(){'use strict';
const CIVS=[
{id:'egypt',name:'Ancient Egypt',icon:'🔺',period:'c. 3100–332 BCE',region:'Northeast Africa',capital:'Memphis / Thebes',
map:[200,280],desc:'One of the world\'s oldest civilizations, known for monumental architecture, hieroglyphic writing, and advanced mathematics.',
stats:{duration:'2,700+ years',population:'3–5 million',area:'1,000,000 km²',knownRulers:'170+'},
achievements:['Pyramids of Giza — last surviving Wonder of the Ancient World','Hieroglyphic writing system — one of earliest','365-day calendar with 12 months','Advanced mummification techniques','First known peace treaty (Egyptian–Hittite)'],
timeline:[
{year:'c. 3100 BCE',event:'Unification of Upper and Lower Egypt by Narmer'},
{year:'c. 2560 BCE',event:'Great Pyramid of Giza completed'},
{year:'c. 1500 BCE',event:'Height of Egyptian power under Thutmose III'},
{year:'1332 BCE',event:'Tutankhamun\'s reign'},
{year:'332 BCE',event:'Alexander the Great conquers Egypt'}
]},
{id:'indus',name:'Indus Valley',icon:'🏛️',period:'c. 3300–1300 BCE',region:'South Asia (Pakistan, India)',capital:'Harappa / Mohenjo-Daro',
map:[680,285],desc:'A bronze age civilization known for sophisticated urban planning, advanced drainage systems, and undeciphered script.',
stats:{duration:'2,000+ years',population:'5+ million',area:'1,250,000 km²',knownCities:'1,000+'},
achievements:['Grid-based city planning with advanced drainage','Standardized fired bricks and weights','First civilization to grow and weave cotton','Indus script — 400+ symbols still undeciphered','Extensive maritime trade routes'],
timeline:[
{year:'c. 3300 BCE',event:'Earliest settlements and writing emerges'},
{year:'c. 2600 BCE',event:'Mature Harappan phase — peak urbanization'},
{year:'c. 1900 BCE',event:'Begin of decline — possible climate change'},
{year:'c. 1300 BCE',event:'Final phase — Vedic period begins'}
]},
{id:'mesopotamia',name:'Mesopotamia',icon:'⚱️',period:'c. 3500–539 BCE',region:'Middle East (Iraq, Syria)',capital:'Babylon / Ur',
map:[590,265],desc:'Often called the Cradle of Civilization, birthplace of writing, the wheel, and codified law.',
stats:{duration:'3,000+ years',population:'2–4 million',area:'650,000 km²',knownRulers:'200+'},
achievements:['Cuneiform script — earliest known writing system','Code of Hammurabi — first written laws','Invention of the wheel (c. 3500 BCE)','First cities — Uruk, Ur, Babylon','Base-60 number system (60 seconds, 360 degrees)'],
timeline:[
{year:'c. 3500 BCE',event:'Sumerians develop cuneiform writing'},
{year:'c. 2334 BCE',event:'Akkadian Empire — first empire in history'},
{year:'1792 BCE',event:'Hammurabi becomes king of Babylon'},
{year:'612 BCE',event:'Fall of Assyrian Empire'},
{year:'539 BCE',event:'Persian conquest of Babylon'}
]},
{id:'greece',name:'Ancient Greece',icon:'🏗️',period:'c. 1200–146 BCE',region:'Southeastern Europe',capital:'Athens / Sparta',
map:[560,255],desc:'Birthplace of democracy, philosophy, and Western science. Known for art, architecture, and naval power.',
stats:{duration:'1,000+ years',population:'3–6 million',area:'500,000 km²',cityStates:'1,500+'},
achievements:['Democracy — first developed in Athens','Olympic Games — started 776 BCE','Philosophy — Socrates, Plato, Aristotle','Geometry, physics, and medicine foundations','Theater — tragedy and comedy genres'],
timeline:[
{year:'c. 1200 BCE',event:'Mycenaean period — Trojan War era'},
{year:'776 BCE',event:'First recorded Olympic Games'},
{year:'508 BCE',event:'Athenian democracy established'},
{year:'480 BCE',event:'Battle of Thermopylae'},
{year:'146 BCE',event:'Roman conquest of Greece'}
]},
{id:'rome',name:'Ancient Rome',icon:'🏛️',period:'753 BCE–476 CE',region:'Southern Europe, Mediterranean',capital:'Rome',
map:[560,260],desc:'The most powerful empire of the ancient world, known for law, engineering, military strategy, and cultural influence.',
stats:{duration:'1,200+ years',population:'50–70 million',area:'5,000,000 km²',knownEmperors:'80+'},
achievements:['Roman law — foundation of modern legal systems','Concrete and aqueducts — revolutionary engineering','Road network — 400,000+ km connecting the empire','Latin script — used by most European languages','Julian calendar — predecessor to Gregorian'],
timeline:[
{year:'753 BCE',event:'Traditional founding of Rome'},
{year:'27 BCE',event:'Roman Empire begins under Augustus'},
{year:'117 CE',event:'Empire at its greatest territorial extent'},
{year:'313 CE',event:'Christianity legalized under Constantine'},
{year:'476 CE',event:'Fall of Western Roman Empire'}
]},
{id:'china',name:'Ancient China',icon:'🏯',period:'c. 2070 BCE–1912 CE',region:'East Asia',capital:'Various (Xi\'an, Beijing)',
map:[800,270],desc:'One of the world\'s oldest continuous civilizations, with written records spanning 3,500+ years.',
stats:{duration:'3,500+ years',population:'50–60 million',area:'9,600,000 km²',dynasties:'20+'},
achievements:['Four Great Inventions — paper, printing, gunpowder, compass','Great Wall — 21,000+ km defensive structure','Silk Road — transcontinental trade network','Confucianism and Daoism — major philosophical systems','Civil service exam system (keju) — 1,300 years'],
timeline:[
{year:'c. 2070 BCE',event:'Xia Dynasty — first dynasty in Chinese history'},
{year:'221 BCE',event:'Qin Shi Huang unifies China'},
{year:'136 BCE',event:'Silk Road trade route established'},
{year:'618 CE',event:'Tang Dynasty — golden age of culture'},
{year:'1912 CE',event:'End of imperial rule — Republic established'}
]}
];
const $=id=>document.getElementById(id);
const dom={civList:$('civ-list'),timeline:$('timeline'),content:$('content')};
let selected=null;
function init(){renderCivList();}
function renderCivList(){
let html='';
for(const c of CIVS){
const active=c.id===selected?'active':'';
html+=`<button class="civ-btn ${active}" data-id="${c.id}"><span class="civ-icon">${c.icon}</span>${c.name}</button>`;
}
dom.civList.innerHTML=html;
dom.civList.querySelectorAll('.civ-btn').forEach(b=>{b.addEventListener('click',function(){select(this.dataset.id);});});
renderTimeline();
renderDetail();
}
function select(id){
selected=id;
renderCivList();
}
function renderTimeline(){
if(!selected){dom.timeline.innerHTML='<div class="tl-title">Timeline</div><p style="font-size:11px;color:var(--muted)">Select a civilization</p>';return;}
const civ=CIVS.find(c=>c.id===selected);
if(!civ)return;
let html='<div class="tl-title">Timeline — '+civ.name+'</div>';
for(const t of civ.timeline){
html+=`<div class="tl-item"><div class="tl-dot"></div><div class="tl-year">${t.year}</div><div class="tl-desc">${esc(t.event)}</div></div>`;
}
dom.timeline.innerHTML=html;
}
function renderDetail(){
if(!selected){dom.content.innerHTML='<div class="welcome"><h2>Explore Ancient Civilizations</h2><p>Select a civilization from the left to begin your journey through history.</p></div>';return;}
const civ=CIVS.find(c=>c.id===selected);
if(!civ)return;
let html='<div class="civ-detail">';
html+=`<div class="cd-header"><div class="cd-icon">${civ.icon}</div><div class="cd-title"><h2>${civ.name}</h2><p>${civ.period} · ${civ.region} · Capital: ${civ.capital}</p></div></div>`;
html+=`<div class="cd-section"><h3>Overview</h3><p>${civ.desc}</p></div>`;
html+=`<div class="cd-section"><h3>Key Statistics</h3><div class="cd-grid">`;
for(const[key,val]of Object.entries(civ.stats)){
html+=`<div class="cd-stat"><span class="cd-stat-val">${esc(val)}</span><span class="cd-stat-label">${esc(key)}</span></div>`;
}
html+=`</div></div>`;
html+=`<div class="cd-section"><h3>Major Achievements</h3>`;
for(const a of civ.achievements){
html+=`<div class="cd-achievement"><span class="a-icon">✦</span>${esc(a)}</div>`;
}
html+=`</div></div>`;
dom.content.innerHTML=html;
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
document.addEventListener('DOMContentLoaded',init);
})();
