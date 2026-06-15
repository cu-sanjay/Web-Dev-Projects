(function(){'use strict';
const VOLCANOES=[
{id:'mauna-loa',name:'Mauna Loa',region:'Hawaii, USA',icon:'🌋',lat:19.48,lon:-155.61,risk:'Moderate',elevation:'4,169m',type:'Shield',lastEruption:'2022',status:'Active',
desc:'The largest active volcano on Earth by volume. Its eruptions are typically non-explosive, producing fluid lava flows.',
eruptions:[{year:2022,vei:0,desc:'Northeast Rift Zone eruption'},{year:1984,vei:0,desc:'Lava flows approached Hilo'},{year:1950,vei:1,desc:'Massive lava flow to the ocean'},{year:1926,vei:0,desc:'Coastal village destroyed'}]},
{id:'fuji',name:'Mount Fuji',region:'Honshu, Japan',icon:'🗻',lat:35.36,lon:138.73,risk:'Moderate',elevation:'3,776m',type:'Stratovolcano',lastEruption:'1707',status:'Dormant',
desc:'Japan\'s tallest peak and cultural icon. A stratovolcano that last erupted in 1707 during the Edo period.',
eruptions:[{year:1707,vei:5,desc:'Hoei eruption — ash reached Edo (Tokyo)'},{year:1083,vei:0,desc:'Minor eruption recorded'},{year:864,vei:0,desc:'Eruption created Aokigahara forest'}]},
{id:'vesuvius',name:'Mount Vesuvius',region:'Campania, Italy',icon:'🌋',lat:40.82,lon:14.43,risk:'Critical',elevation:'1,281m',type:'Stratovolcano',lastEruption:'1944',status:'Active',
desc:'One of the most dangerous volcanoes in the world, located near Naples and known for the catastrophic 79 CE eruption that destroyed Pompeii.',
eruptions:[{year:1944,vei:3,desc:'WWII eruption — damaged Allied aircraft'},{year:1906,vei:4,desc:'Major eruption — Naples covered in ash'},{year:1631,vei:4,desc:'Destructive eruption — 4,000+ fatalities'},{year:79,vei:5,desc:'Catastrophic — Pompeii and Herculaneum destroyed'}]},
{id:'krakatoa',name:'Krakatoa',region:'Sunda Strait, Indonesia',icon:'🌋',lat:-6.10,lon:105.39,risk:'High',elevation:'813m',type:'Caldera',lastEruption:'2020',status:'Active',
desc:'Notorious for the 1883 explosion — one of the deadliest volcanic events in history. The Anak Krakatoa child volcano remains active.',
eruptions:[{year:2018,vei:3,desc:'Anak Krakatoa collapse — tsunami'},{year:1883,vei:6,desc:'Cataclysmic explosion — 36,000+ deaths'},{year:1680,vei:0,desc:'Earlier eruption (pre-caldera)'}]},
{id:'etna',name:'Mount Etna',region:'Sicily, Italy',icon:'🌋',lat:37.75,lon:14.99,risk:'Moderate',elevation:'3,357m',type:'Stratovolcano',lastEruption:'2023',status:'Active',
desc:'Europe\'s most active volcano. Frequent eruptions provide stunning displays of lava fountains and flows.',
eruptions:[{year:2023,vei:2,desc:'Lava fountain episodes'},{year:2002,vei:3,desc:'Major flank eruption — destroyed tourist facilities'},{year:1669,vei:4,desc:'Catania partially destroyed'},{year:122,vei:0,desc:'Ancient eruption recorded by Pliny'}]},
{id:'yellowstone',name:'Yellowstone Caldera',region:'Wyoming, USA',icon:'♨️',lat:44.43,lon:-110.67,risk:'High',elevation:'2,805m',type:'Supervolcano',lastEruption:'640,000 years ago',status:'Dormant',
desc:'A massive supervolcano whose caldera spans 70×45 km. Its past eruptions were among the largest in Earth\'s history.',
eruptions:[{year:-640000,vei:8,desc:'Lava Creek eruption — caldera formed'},{year:-2100000,vei:8,desc:'Huckleberry Ridge eruption — largest'},{year:-1300000,vei:8,desc:'Mesa Falls eruption'}]},
{id:'merapi',name:'Mount Merapi',region:'Java, Indonesia',icon:'🌋',lat:-7.54,lon:110.44,risk:'Critical',elevation:'2,930m',type:'Stratovolcano',lastEruption:'2023',status:'Active',
desc:'Indonesia\'s most active volcano. Its frequent eruptions pose a constant threat to the densely populated surrounding areas.',
eruptions:[{year:2010,vei:4,desc:'Major eruption — 350+ fatalities'},{year:2006,vei:3,desc:'Large eruption with pyroclastic flows'},{year:1930,vei:3,desc:'Large eruption — 1,300+ deaths'},{year:1006,vei:4,desc:'Eruption may have destroyed Mataram kingdom'}]},
{id:'east',name:'Mount Erebus',region:'Ross Island, Antarctica',icon:'❄️',lat:-77.53,lon:167.17,risk:'Low',elevation:'3,794m',type:'Stratovolcano',lastEruption:'Ongoing',status:'Active',
desc:'The southernmost active volcano on Earth, known for its persistent lava lake and unique Antarctic environment.',
eruptions:[{year:1972,vei:0,desc:'Persistent lava lake activity'},{year:1841,vei:0,desc:'First observed by James Ross'}]}
];
const $=id=>document.getElementById(id);
const dom={volcanoList:$('volcano-list'),detailArea:$('detail-area'),riskFilter:$('risk-filter'),regionFilter:$('region-filter')};
let selected=null;
function init(){
const regions=[...new Set(VOLCANOES.map(v=>v.region.split(',')[1]?.trim()||v.region))].sort();
let ro='<option value="all">All Regions</option>';
for(const r of regions)ro+=`<option value="${r}">${r}</option>`;
dom.regionFilter.innerHTML=ro;
dom.riskFilter.addEventListener('change',renderList);
dom.regionFilter.addEventListener('change',renderList);
renderList();
}
function getFiltered(){
const risk=dom.riskFilter.value;
const region=dom.regionFilter.value;
return VOLCANOES.filter(v=>{
if(risk!=='all'&&v.risk!==risk)return false;
if(region!=='all'){const r=v.region.split(',')[1]?.trim()||v.region;if(r!==region)return false;}
return true;
});
}
function renderList(){
const filtered=getFiltered();
let html='';
for(const v of filtered){
const active=v.id===selected?'active':'';
html+=`<div class="v-item ${active}" data-id="${v.id}"><div class="v-name">${v.icon} ${esc(v.name)}</div><div class="v-region">${esc(v.region)}</div><span class="v-risk ${v.risk}">${v.risk}</span></div>`;
}
dom.volcanoList.innerHTML=html;
dom.volcanoList.querySelectorAll('.v-item').forEach(el=>{el.addEventListener('click',function(){select(this.dataset.id);});});
if(selected&&filtered.some(v=>v.id===selected))renderDetail();
else if(filtered.length>0){select(filtered[0].id);}
else{dom.detailArea.innerHTML='<div class="welcome"><h2>🌋 No volcanoes match</h2><p>Try changing the filters.</p></div>';}
}
function select(id){
selected=id;
renderList();
renderDetail();
}
function renderDetail(){
if(!selected){dom.detailArea.innerHTML='<div class="welcome"><h2>🌋 Volcano Activity Tracker</h2><p>Select a volcano from the list.</p></div>';return;}
const v=VOLCANOES.find(x=>x.id===selected);
if(!v)return;
const riskColor={Low:'#22c55e',Moderate:'#f59e0b',High:'#f97316',Critical:'#ef4444'};
let html=`<div class="volcano-detail"><div class="vd-header"><div class="vd-icon">${v.icon}</div><div class="vd-title"><h2>${esc(v.name)}</h2><p>${esc(v.region)} · ${v.type} · ${v.elevation}</p></div></div>`;
html+=`<div class="vd-section"><h3>Overview</h3><p>${v.desc}</p></div>`;
html+=`<div class="vd-section"><h3>Activity Status</h3><div class="vd-grid"><div class="vd-stat"><span class="vd-stat-val" style="color:${riskColor[v.risk]}">${v.risk}</span><span class="vd-stat-label">Risk Level</span></div><div class="vd-stat"><span class="vd-stat-val" style="color:var(--accent)">${esc(v.lastEruption)}</span><span class="vd-stat-label">Last Eruption</span></div><div class="vd-stat"><span class="vd-stat-val" style="color:var(--accent)">${v.status}</span><span class="vd-stat-label">Status</span></div><div class="vd-stat"><span class="vd-stat-val" style="color:var(--accent)">${v.eruptions.length}</span><span class="vd-stat-label">Recorded Eruptions</span></div></div></div>`;
html+=`<div class="vd-section"><h3>Eruption History</h3>`;
for(const e of v.eruptions){
const yearDisplay=e.year<0?Math.abs(e.year)+' BCE':e.year;
html+=`<div class="eruption-item"><span class="eruption-year">${yearDisplay}</span> VEI ${e.vei} — ${esc(e.desc)}</div>`;
}
html+=`</div></div>`;
dom.detailArea.innerHTML=html;
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
document.addEventListener('DOMContentLoaded',init);
})();
