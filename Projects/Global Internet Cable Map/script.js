(function(){'use strict';
const CABLES=[
{id:'sea-me-we-5',name:'SEA-ME-WE 5',length:20000,capacity:'24 Tbps',landings:['Singapore','Malaysia','Indonesia','Myanmar','Bangladesh','Sri Lanka','Pakistan','UAE','Saudi Arabia','Egypt','Turkey','Italy','France'],status:'Active',year:2016,color:'#38bdf8'},
{id:'mars',name:'MARS',length:9800,capacity:'16 Tbps',landings:['Singapore','Malaysia','Indonesia','Philippines'],status:'Active',year:2020,color:'#22c55e'},
{id:'ea-1',name:'EA-1',length:8700,capacity:'10 Tbps',landings:['United Kingdom','Spain','Portugal','Morocco','Senegal','Nigeria','Ghana','Cameroon','Angola','South Africa'],status:'Active',year:2023,color:'#a78bfa'},
{id:'smw4',name:'SEA-ME-WE 4',length:18800,capacity:'5 Tbps',landings:['Singapore','Malaysia','Thailand','Bangladesh','India','Sri Lanka','Pakistan','UAE','Saudi Arabia','Egypt','Italy','France'],status:'Active',year:2005,color:'#60a5fa'},
{id:'tata-tgn',name:'Tata TGN',length:31000,capacity:'10 Tbps',landings:['United Kingdom','France','Spain','Portugal','Italy','Egypt','India','Singapore','Japan','United States'],status:'Active',year:2004,color:'#f59e0b'},
{id:'hibernia',name:'Hibernia Express',length:4600,capacity:'8 Tbps',landings:['Ireland','United Kingdom','Canada','United States'],status:'Active',year:2015,color:'#ec4899'},
{id:'southern-cross',name:'Southern Cross',length:30500,capacity:'12 Tbps',landings:['United States','Fiji','New Zealand','Australia'],status:'Active',year:2000,color:'#14b8a6'},
{id:'fla',name:'FLAG Atlantic-1',length:15000,capacity:'8 Tbps',landings:['United Kingdom','France','Portugal','United States','Canada'],status:'Active',year:2000,color:'#8b5cf6'},
{id:'japan-us',name:'Japan-US Cable',length:21000,capacity:'12 Tbps',landings:['Japan','United States','Canada'],status:'Active',year:2008,color:'#06b6d4'},
{id:'asia-america',name:'Asia-America Gateway',length:20000,capacity:'4 Tbps',landings:['United States','Hawaii','Guam','Philippines','Hong Kong','Singapore','Malaysia','Thailand','Vietnam'],status:'Active',year:2009,color:'#f97316'}
];
const LANDINGS={};
CABLES.forEach(c=>{c.landings.forEach(l=>{if(!LANDINGS[l])LANDINGS[l]=[];LANDINGS[l].push(c.name);});});
const POINTS={
'Singapore':[780,300],'Malaysia':[765,315],'Indonesia':[730,345],'Myanmar':[730,280],'Bangladesh':[720,270],'Sri Lanka':[700,310],'Pakistan':[660,275],'UAE':[620,270],'Saudi Arabia':[610,280],'Egypt':[590,285],'Turkey':[600,250],'Italy':[560,255],'France':[540,270],'United Kingdom':[530,250],'Spain':[545,285],'Portugal':[530,290],'Morocco':[545,300],'Senegal':[520,330],'Nigeria':[570,335],'Ghana':[555,340],'Cameroon':[580,345],'Angola':[570,380],'South Africa':[570,420],'Thailand':[755,300],'India':[690,285],'Philippines':[800,325],'Ireland':[520,260],'Canada':[360,240],'United States':[350,275],'Fiji':[870,370],'New Zealand':[900,410],'Australia':[880,380],'Hawaii':[830,290],'Guam':[830,320],'Hong Kong':[800,285],'Vietnam':[770,300],'Japan':[850,250],'Senegal':[520,330]
};
const $=id=>document.getElementById(id);
const dom={searchInput:$('search-input'),cableList:$('cable-list'),mapSvg:$('map-svg'),detailPanel:$('detail-panel'),cableCount:$('cable-count'),landingCount:$('landing-count')};
let selectedCable=null;
function init(){
dom.cableCount.textContent=CABLES.length;
dom.landingCount.textContent=Object.keys(LANDINGS).length;
renderCableList();
renderMap();
dom.searchInput.addEventListener('input',function(){renderCableList(this.value.toLowerCase());});
}
function renderCableList(search){
let filtered=CABLES;
if(search)filtered=CABLES.filter(c=>c.name.toLowerCase().includes(search)||c.landings.some(l=>l.toLowerCase().includes(search)));
let html='';
for(const c of filtered){
const active=selectedCable===c.id?'active':'';
html+=`<div class="cable-item ${active}" data-id="${c.id}"><div class="ci-name">${esc(c.name)}</div><div class="ci-detail">${c.length.toLocaleString()} km · ${c.capacity} · ${c.year}</div></div>`;
}
dom.cableList.innerHTML=html;
dom.cableList.querySelectorAll('.cable-item').forEach(el=>{
el.addEventListener('click',function(){selectCable(this.dataset.id);});
});
}
function renderMap(){
const svg=dom.mapSvg;
const cablesG=svg.querySelector('#map-cables');
const pointsG=svg.querySelector('#map-points');
const labelsG=svg.querySelector('#map-labels');
cablesG.innerHTML='';
pointsG.innerHTML='';
labelsG.innerHTML='';
for(const c of CABLES){
if(c.landings.length<2)continue;
const pts=c.landings.map(l=>POINTS[l]).filter(p=>p);
if(pts.length<2)continue;
const opacity=(selectedCable&&selectedCable!==c.id)?'0.1':'0.25';
const strokeW=(selectedCable===c.id)?'2.5':'1.2';
for(let i=0;i<pts.length-1;i++){
const line=document.createElementNS('http://www.w3.org/2000/svg','line');
line.setAttribute('x1',pts[i][0]);line.setAttribute('y1',pts[i][1]);
line.setAttribute('x2',pts[i+1][0]);line.setAttribute('y2',pts[i+1][1]);
line.setAttribute('stroke',c.color);line.setAttribute('stroke-width',strokeW);
line.setAttribute('opacity',opacity);line.setAttribute('class','cable-line');
line.dataset.cable=c.id;
line.addEventListener('click',function(e){e.stopPropagation();selectCable(this.dataset.cable);});
cablesG.appendChild(line);
}
}
const drawnPoints={};
for(const c of CABLES){
for(const l of c.landings){
const pt=POINTS[l];
if(!pt||drawnPoints[`${pt[0]}-${pt[1]}`])continue;
drawnPoints[`${pt[0]}-${pt[1]}`]=true;
const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
circle.setAttribute('cx',pt[0]);circle.setAttribute('cy',pt[1]);
circle.setAttribute('r',selectedCable?(LANDINGS[l].some(cl=>cl===CABLES.find(cc=>cc.id===selectedCable)?.name)?'5':'2'):'3');
circle.setAttribute('fill',selectedCable&&LANDINGS[l].some(cl=>cl===CABLES.find(cc=>cc.id===selectedCable)?.name)?'#22c55e':'#38bdf8');
circle.setAttribute('opacity',selectedCable&&!LANDINGS[l].some(cl=>cl===CABLES.find(cc=>cc.id===selectedCable)?.name)?'0.2':'0.8');
circle.dataset.landing=l;
circle.addEventListener('click',function(e){e.stopPropagation();showLandingDetail(this.dataset.landing);});
pointsG.appendChild(circle);
const label=document.createElementNS('http://www.w3.org/2000/svg','text');
label.setAttribute('x',pt[0]+6);label.setAttribute('y',pt[1]+3);
label.setAttribute('font-size','6');label.setAttribute('fill','#64748b');
label.setAttribute('font-family','ui-monospace,monospace');
label.setAttribute('opacity',selectedCable?'0.6':'0.4');
label.textContent=l;
labelsG.appendChild(label);
}
}
}
function selectCable(id){
selectedCable=(selectedCable===id)?null:id;
renderCableList(dom.searchInput.value.toLowerCase());
renderMap();
const cable=CABLES.find(c=>c.id===id);
if(cable&&selectedCable){
let html=`<strong>${esc(cable.name)}</strong><br>`;
html+=`<span class="dp-label">Length</span> ${cable.length.toLocaleString()} km<br>`;
html+=`<span class="dp-label">Capacity</span> ${cable.capacity}<br>`;
html+=`<span class="dp-label">Status</span> ${cable.status} (${cable.year})<br>`;
html+=`<span class="dp-label">Landing Points</span><br>`;
for(const l of cable.landings)html+=`${esc(l)} `;
dom.detailPanel.innerHTML=html;
}else{
dom.detailPanel.innerHTML='<div class="detail-placeholder">Click a cable or landing point for details</div>';
}
}
function showLandingDetail(name){
const cables=LANDINGS[name];
if(!cables)return;
let html=`<strong>${esc(name)}</strong><br>`;
html+=`<span class="dp-label">Connected Cables</span><br>`;
for(const c of cables)html+=`${esc(c)} `;
dom.detailPanel.innerHTML=html;
selectedCable=null;
renderCableList(dom.searchInput.value.toLowerCase());
renderMap();
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
document.addEventListener('DOMContentLoaded',init);
})();
