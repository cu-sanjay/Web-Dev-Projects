(function(){'use strict';
const dynasties={
ming:{name:'Ming Dynasty',from:1368,to:1644,desc:'The Ming ruled China for 276 years, known for maritime exploration, construction of the Forbidden City, and porcelain.',
events:[{year:1368,title:'Zhu Yuanzhang crowned',desc:'Hongwu Emperor establishes the Ming Dynasty',type:'birth'},{year:1405,title:'Zheng He voyages',desc:'First of seven maritime expeditions across the Indian Ocean',type:'culture'},{year:1420,title:'Forbidden City completed',desc:'Imperial palace complex built in Beijing',type:'culture'},{year:1449,title:'Tumu Crisis',desc:'Ming forces defeated by Mongol Oirats; emperor captured',type:'war'},{year:1557,title:'Macau leased',desc:'Portugal establishes trading post in Macau',type:'death'},{year:1644,title:'Ming falls',desc:'Li Zicheng captures Beijing; last emperor hangs himself',type:'death'}]},
tudor:{name:'Tudor Dynasty',from:1485,to:1603,desc:'The Tudor dynasty ruled England for 118 years, overseeing the English Reformation and the Elizabethan era.',
events:[{year:1485,title:'Battle of Bosworth',desc:'Henry Tudor defeats Richard III; Tudor dynasty begins',type:'war'},{year:1509,title:'Henry VIII crowned',desc:'Henry VIII becomes king; later breaks from Catholic Church',type:'birth'},{year:1534,title:'Act of Supremacy',desc:'Henry VIII declared Supreme Head of Church of England',type:'death'},{year:1558,title:'Elizabeth I crowned',desc:'Elizabethan era begins; golden age of English culture',type:'birth'},{year:1588,title:'Spanish Armada',desc:'English navy defeats Spanish invasion fleet',type:'war'},{year:1603,title:'Tudor ends',desc:'Elizabeth I dies; James VI of Scotland succeeds',type:'death'}]},
ottoman:{name:'Ottoman Empire',from:1299,to:1922,desc:'The Ottoman Empire spanned 623 years across three continents, centered in Anatolia and the Balkans.',
events:[{year:1299,title:'Osman I founds state',desc:'Small beylik begins expansion into empire',type:'birth'},{year:1453,title:'Fall of Constantinople',desc:'Mehmed II conquers Constantinople; end of Byzantine Empire',type:'war'},{year:1520,title:'Suleiman the Magnificent',desc:'Golden age of Ottoman legal and cultural development',type:'culture'},{year:1571,title:'Battle of Lepanto',desc:'Ottoman navy defeated by Holy League',type:'war'},{year:1683,title:'Siege of Vienna',desc:'Ottoman expansion into Europe halted',type:'death'},{year:1922,title:'Empire dissolved',desc:'Turkish War of Independence; Republic of Turkey founded',type:'death'}]},
maurya:{name:'Maurya Empire',from:322,to:185,desc:'The Maurya Empire was ancient Indias largest empire, uniting most of the Indian subcontinent.',
events:[{year:322,title:'Chandragupta Maurya',desc:'Founded Maurya dynasty after overthrowing the Nanda empire',type:'birth'},{year:269,title:'Ashoka the Great',desc:'Ashoka becomes emperor; later converts to Buddhism',type:'birth'},{year:261,title:'Kalinga War',desc:'Brutal war leads Ashoka to embrace non-violence and Buddhism',type:'war'},{year:250,title:'Buddhist missions',desc:'Ashoka sends missionaries to spread Buddhism across Asia',type:'culture'},{year:232,title:'Ashoka dies',desc:'Empire begins gradual decline after Ashokas death',type:'death'},{year:185,title:'Empire falls',desc:'Last Mauryan ruler assassinated; Shunga dynasty begins',type:'death'}]}
};

function renderTimeline(key){
const d=dynasties[key];
if(!d)return;
document.getElementById('dynasty-name').textContent=d.name;
document.getElementById('dynasty-from').textContent=d.from;
document.getElementById('dynasty-to').textContent=d.to;
document.getElementById('dynasty-desc').textContent=d.desc;
const container=document.getElementById('timeline-events');
container.innerHTML='';
d.events.forEach(e=>{
const div=document.createElement('div');div.className='tl-event '+e.type;
div.innerHTML='<span class="tl-year">'+e.year+'</span><div class="tl-content"><div class="tl-title">'+e.title+'</div><div class="tl-desc">'+e.desc+'</div></div>';
container.appendChild(div);
});
}
document.querySelectorAll('.dynasty-btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.dynasty-btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
renderTimeline(this.dataset.dynasty);
});
});
renderTimeline('ming');
})();
