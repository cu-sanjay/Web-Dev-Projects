(function(){'use strict';
const LANGUAGES=[
{id:'mandarin',name:'Mandarin Chinese',family:'Sino-Tibetan',speakers:1120,million:true,countries:['China','Taiwan','Singapore'],region:'asia',color:'#38bdf8',
desc:'The most spoken language in the world by native speakers. Uses logographic characters and tonal pronunciation.',
writing:'Chinese characters (hanzi)',script:'Simplified/Traditional'},
{id:'english',name:'English',family:'Germanic',speakers:1450,million:true,countries:['United States','United Kingdom','Canada','Australia','India','Nigeria','South Africa','Ireland','New Zealand'],region:'europe',color:'#22c55e',
desc:'The global lingua franca for business, science, and international communication.',
writing:'Latin script',script:'Latin'},
{id:'hindi',name:'Hindi',family:'Indo-Aryan',speakers:650,million:true,countries:['India','Fiji','Nepal'],region:'asia',color:'#f59e0b',
desc:'One of India\'s official languages, written in Devanagari script. Widely spoken across northern India.',
writing:'Devanagari',script:'Devanagari'},
{id:'spanish',name:'Spanish',family:'Romance',speakers:600,million:true,countries:['Spain','Mexico','Argentina','Colombia','Peru','Chile','Venezuela','Ecuador','Guatemala','Cuba','Dominican Republic'],region:'europe',color:'#ef4444',
desc:'Second most spoken native language in the world. Official language of 20+ countries.',
writing:'Latin script',script:'Latin'},
{id:'arabic',name:'Arabic',family:'Semitic',speakers:420,million:true,countries:['Egypt','Saudi Arabia','Iraq','United Arab Emirates','Morocco','Algeria','Jordan','Lebanon','Qatar','Kuwait','Oman','Syria','Yemen'],region:'africa',color:'#a78bfa',
desc:'The liturgical language of Islam. Written right-to-left in the Arabic script.',
writing:'Arabic script',script:'Arabic'},
{id:'bengali',name:'Bengali',family:'Indo-Aryan',speakers:300,million:true,countries:['Bangladesh','India'],region:'asia',color:'#f97316',
desc:'The official language of Bangladesh and second most spoken in India.',
writing:'Bengali script',script:'Bengali'},
{id:'portuguese',name:'Portuguese',family:'Romance',speakers:260,million:true,countries:['Portugal','Brazil','Angola','Mozambique','Cape Verde'],region:'europe',color:'#84cc16',
desc:'Official language of 9 countries across 4 continents.',
writing:'Latin script',script:'Latin'},
{id:'russian',name:'Russian',family:'Slavic',speakers:260,million:true,countries:['Russia','Ukraine','Belarus','Kazakhstan'],region:'europe',color:'#14b8a6',
desc:'The most widely spoken Slavic language. Uses the Cyrillic alphabet.',
writing:'Cyrillic script',script:'Cyrillic'},
{id:'japanese',name:'Japanese',family:'Japonic',speakers:125,million:true,countries:['Japan'],region:'asia',color:'#ec4899',
desc:'Known for its three writing systems: hiragana, katakana, and kanji.',
writing:'Hiragana, Katakana, Kanji',script:'Mixed'},
{id:'german',name:'German',family:'Germanic',speakers:135,million:true,countries:['Germany','Austria','Switzerland','Belgium','Luxembourg'],region:'europe',color:'#8b5cf6',
desc:'The most spoken native language in the European Union.',
writing:'Latin script',script:'Latin'},
{id:'french',name:'French',family:'Romance',speakers:320,million:true,countries:['France','Canada','Belgium','Switzerland','Senegal','Ivory Coast','Morocco','Algeria','Tunisia'],region:'europe',color:'#06b6d4',
desc:'An official language of international organizations including the UN, EU, and IOC.',
writing:'Latin script',script:'Latin'},
{id:'swahili',name:'Swahili',family:'Bantu',speakers:200,million:true,countries:['Tanzania','Kenya','Uganda','Rwanda','DR Congo'],region:'africa',color:'#f59e0b',
desc:'A Bantu language widely used as a lingua franca in East Africa.',
writing:'Latin script',script:'Latin'}
];
const REGIONS={asia:{x:680,y:140,w:200,h:140,label:'Asia'},europe:{x:420,y:90,w:140,h:100,label:'Europe'},africa:{x:450,y:250,w:140,h:140,label:'Africa'},americas:{x:250,y:160,w:100,h:150,label:'Americas'},oceania:{x:800,y:300,w:80,h:60,label:'Oceania'}};
const $=id=>document.getElementById(id);
const dom={searchInput:$('search-input'),langList:$('lang-list'),mapSvg:$('map-svg'),detailPanel:$('detail-panel'),totalLangs:$('total-langs'),totalSpeakers:$('total-speakers')};
let selected=null;
function init(){
dom.totalLangs.textContent=LANGUAGES.length;
const total=LANGUAGES.reduce((s,l)=>s+l.speakers,0);
dom.totalSpeakers.textContent=(total/1000).toFixed(1)+'B';
renderMap();
renderList();
dom.searchInput.addEventListener('input',function(){renderList(this.value.toLowerCase());});
}
function renderList(search){
let filtered=LANGUAGES;
if(search)filtered=LANGUAGES.filter(l=>l.name.toLowerCase().includes(search)||l.countries.some(c=>c.toLowerCase().includes(search)));
let html='';
for(const l of filtered){
const active=l.id===selected?'active':'';
html+=`<div class="lang-item ${active}" data-id="${l.id}"><div class="li-name">${esc(l.name)}</div><div class="li-speakers">${l.speakers}M speakers · ${esc(l.family)}</div></div>`;
}
dom.langList.innerHTML=html;
dom.langList.querySelectorAll('.lang-item').forEach(el=>{el.addEventListener('click',function(){select(this.dataset.id);});});
}
function renderMap(){
const svg=dom.mapSvg;
const regionsG=svg.querySelector('#map-regions');
const labelsG=svg.querySelector('#map-labels');
regionsG.innerHTML='';labelsG.innerHTML='';
for(const[key,reg]of Object.entries(REGIONS)){
const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
rect.setAttribute('x',reg.x);rect.setAttribute('y',reg.y);
rect.setAttribute('width',reg.w);rect.setAttribute('height',reg.h);
rect.setAttribute('rx','6');
rect.setAttribute('fill',selected?LANGUAGES.find(l=>l.id===selected)?.color||'#38bdf8':'#38bdf8');
rect.setAttribute('stroke','#475569');
rect.setAttribute('class','region-box');
rect.dataset.region=key;
regionsG.appendChild(rect);
const label=document.createElementNS('http://www.w3.org/2000/svg','text');
label.setAttribute('x',reg.x+reg.w/2);label.setAttribute('y',reg.y+reg.h/2+3);
label.setAttribute('text-anchor','middle');label.setAttribute('font-size','12');
label.setAttribute('font-weight','600');label.setAttribute('fill','#cbd5e1');
label.setAttribute('font-family','ui-monospace,monospace');
label.textContent=reg.label;
labelsG.appendChild(label);
}
}
function select(id){
selected=id;
renderList(dom.searchInput.value.toLowerCase());
renderMap();
const lang=LANGUAGES.find(l=>l.id===id);
if(!lang)return;
const reg=REGIONS[lang.region];
let html=`<strong>${lang.name}</strong> — ${lang.family}<br>`;
html+=`<span style="color:var(--muted);font-size:10px">${lang.writing}</span>`;
html+=`<div class="dp-grid">`;
html+=`<div class="dp-stat"><span class="dp-val">${lang.speakers}M</span><span class="dp-label">Speakers</span></div>`;
html+=`<div class="dp-stat"><span class="dp-val">${lang.countries.length}</span><span class="dp-label">Countries</span></div>`;
html+=`<div class="dp-stat"><span class="dp-val">${reg?reg.label:lang.region}</span><span class="dp-label">Region</span></div>`;
html+=`<div class="dp-stat"><span class="dp-val">${lang.script}</span><span class="dp-label">Script</span></div>`;
html+=`</div>`;
html+=`<p style="font-size:11px;margin-top:8px;color:var(--sec)">${lang.desc}</p>`;
html+=`<p style="font-size:10px;margin-top:6px;color:var(--muted)">Countries: ${lang.countries.join(', ')}</p>`;
dom.detailPanel.innerHTML=html;
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
document.addEventListener('DOMContentLoaded',init);
})();
