(function(){'use strict';
const SITES=[
{name:'Great Wall of China',country:'China',region:'Asia',type:'Cultural',icon:'🏯',year:1987,desc:'A series of fortifications built across northern China to protect from invasions.'},
{name:'Machu Picchu',country:'Peru',region:'South America',type:'Mixed',icon:'🏔️',year:1983,desc:'15th-century Inca citadel set high in the Andes Mountains.'},
{name:'Taj Mahal',country:'India',region:'Asia',type:'Cultural',icon:'🕌',year:1983,desc:'Ivory-white marble mausoleum on the Yamuna river.'},
{name:'Colosseum',country:'Italy',region:'Europe',type:'Cultural',icon:'🏛️',year:1980,desc:'Ancient amphitheater in the center of Rome.'},
{name:'Pyramids of Giza',country:'Egypt',region:'Africa',type:'Cultural',icon:'🔺',year:1979,desc:'Ancient pyramid complex on the Giza plateau.'},
{name:'Great Barrier Reef',country:'Australia',region:'Oceania',type:'Natural',icon:'🐠',year:1981,desc:'World\'s largest coral reef system.'},
{name:'Petra',country:'Jordan',region:'Asia',type:'Cultural',icon:'🏜️',year:1985,desc:'Historical and archaeological city carved into rose rock.'},
{name:'Christ the Redeemer',country:'Brazil',region:'South America',type:'Cultural',icon:'🗿',year:2012,desc:'Art Deco statue of Jesus Christ overlooking Rio de Janeiro.'},
{name:'Stonehenge',country:'United Kingdom',region:'Europe',type:'Cultural',icon:'🪨',year:1986,desc:'Prehistoric monument of standing stones in Wiltshire.'},
{name:'Angkor Wat',country:'Cambodia',region:'Asia',type:'Cultural',icon:'🛕',year:1992,desc:'Temple complex and largest religious monument in the world.'},
{name:'Acropolis',country:'Greece',region:'Europe',type:'Cultural',icon:'🏗️',year:1987,desc:'Ancient citadel containing the Parthenon.'},
{name:'Grand Canyon',country:'United States',region:'North America',type:'Natural',icon:'🏜️',year:1979,desc:'Steep-sided canyon carved by the Colorado River.'},
{name:'Serengeti National Park',country:'Tanzania',region:'Africa',type:'Natural',icon:'🦁',year:1981,desc:'Vast savanna ecosystem known for the Great Migration.'},
{name:'Santorini',country:'Greece',region:'Europe',type:'Cultural',icon:'🏝️',year:2005,desc:'Volcanic island with iconic white and blue architecture.'},
{name:'Easter Island',country:'Chile',region:'South America',type:'Cultural',icon:'🗿',year:1995,desc:'Remote island famous for its moai statues.'},
{name:'Versailles Palace',country:'France',region:'Europe',type:'Cultural',icon:'🏰',year:1979,desc:'Royal palace with extensive gardens outside Paris.'},
{name:'Mount Fuji',country:'Japan',region:'Asia',type:'Cultural',icon:'🗻',year:2013,desc:'Active volcano and Japan\'s tallest peak.'},
{name:'Banff National Park',country:'Canada',region:'North America',type:'Natural',icon:'🏔️',year:1984,desc:'Mountainous park in the Canadian Rockies.'},
{name:'Iguazu National Park',country:'Argentina',region:'South America',type:'Natural',icon:'🌊',year:1984,desc:'Massive waterfall system on the Argentina-Brazil border.'},
{name:'Historic Cairo',country:'Egypt',region:'Africa',type:'Cultural',icon:'🕌',year:1979,desc:'One of the world\'s oldest Islamic cities.'},
{name:'Venice',country:'Italy',region:'Europe',type:'Cultural',icon:'🚣',year:1987,desc:'City built on 118 small islands in the Venetian Lagoon.'},
{name:'Yellowstone',country:'United States',region:'North America',type:'Natural',icon:'🌋',year:1978,desc:'First national park with geothermal features.'},
{name:'Uluru',country:'Australia',region:'Oceania',type:'Mixed',icon:'🟥',year:1987,desc:'Massive sandstone monolith in central Australia.'},
{name:'Krakow Old Town',country:'Poland',region:'Europe',type:'Cultural',icon:'🏘️',year:1978,desc:'Historic center of Poland\'s former capital.'}
];
const $=id=>document.getElementById(id);
const dom={searchInput:$('search-input'),sitesGrid:$('sites-grid'),regionFilters:$('region-filters'),typeFilters:$('type-filters'),totalSites:$('total-sites'),totalCountries:$('total-countries')};
let state={search:'',region:'all',type:'all'};
function getRegions(){return[...new Set(SITES.map(s=>s.region))].sort()}
function getTypes(){return[...new Set(SITES.map(s=>s.type))].sort()}
function getCountries(){return[...new Set(SITES.map(s=>s.country))].sort()}
function init(){
setupFilters();
renderSites();
dom.searchInput.addEventListener('input',function(){state.search=this.value.toLowerCase();renderSites();});
}
function setupFilters(){
const regions=getRegions();
let rHtml='<button class="filter-btn active" data-region="all">All Regions</button>';
for(const r of regions)rHtml+=`<button class="filter-btn" data-region="${r}">${r}</button>`;
dom.regionFilters.innerHTML=rHtml;
dom.regionFilters.querySelectorAll('.filter-btn').forEach(b=>{
b.addEventListener('click',function(){
dom.regionFilters.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
this.classList.add('active');
state.region=this.dataset.region;
renderSites();
});
});
const types=getTypes();
let tHtml='<button class="filter-btn active" data-type="all">All Types</button>';
for(const t of types)tHtml+=`<button class="filter-btn" data-type="${t}">${t}</button>`;
dom.typeFilters.innerHTML=tHtml;
dom.typeFilters.querySelectorAll('.filter-btn').forEach(b=>{
b.addEventListener('click',function(){
dom.typeFilters.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
this.classList.add('active');
state.type=this.dataset.type;
renderSites();
});
});
}
function renderSites(){
let filtered=SITES.filter(s=>{
if(state.region!=='all'&&s.region!==state.region)return false;
if(state.type!=='all'&&s.type!==state.type)return false;
if(state.search&&!s.name.toLowerCase().includes(state.search)&&!s.country.toLowerCase().includes(state.search))return false;
return true;
});
dom.totalSites.textContent=filtered.length;
dom.totalCountries.textContent=[...new Set(filtered.map(s=>s.country))].length;
if(filtered.length===0){
dom.sitesGrid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted);font-size:13px">No sites found matching your criteria.</div>';
return;
}
let html='';
for(const s of filtered){
html+=`<div class="site-card"><div class="site-icon">${s.icon}</div><div class="site-name">${esc(s.name)}</div><div class="site-country">${esc(s.country)}</div><span class="site-type">${s.type}</span><div class="site-desc">${esc(s.desc)}</div><div class="site-year">UNESCO ${s.year} · ${s.region}</div></div>`;
}
dom.sitesGrid.innerHTML=html;
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
document.addEventListener('DOMContentLoaded',init);
})();
