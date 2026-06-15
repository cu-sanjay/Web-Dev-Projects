(function(){'use strict';
const data={
frontal:{name:'Frontal Lobe',functions:['Executive functions','Decision making','Social behavior','Motor planning','Language production (Broca)'],desc:'The frontal lobe is the largest lobe, located at the front of each hemisphere. It is associated with higher cognitive functions including reasoning, planning, problem-solving, and social interaction.',size:'~30% of cortex',areas:'4, 6, 8-10, 44-47'},
parietal:{name:'Parietal Lobe',functions:['Sensory integration','Spatial awareness','Touch perception','Reading & arithmetic','Body orientation'],desc:'The parietal lobe processes sensory information from the body, including touch, temperature, and pain. It plays a key role in spatial navigation and coordinating movement.',size:'~20% of cortex',areas:'1-3, 5, 7, 39-40'},
temporal:{name:'Temporal Lobe',functions:['Auditory processing','Language comprehension','Memory formation','Facial recognition','Emotion regulation'],desc:'The temporal lobe processes auditory information and is critical for language comprehension (Wernicke area), memory consolidation via the hippocampus, and recognizing faces.',size:'~22% of cortex',areas:'20-22, 27-28, 34-37, 41-42'},
occipital:{name:'Occipital Lobe',functions:['Visual processing','Object recognition','Color perception','Motion detection','Depth perception'],desc:'The occipital lobe is the visual processing center, containing the primary visual cortex. It receives input from the eyes and processes shape, color, and motion.',size:'~12% of cortex',areas:'17-19'},
cerebellum:{name:'Cerebellum',functions:['Motor coordination','Balance & posture','Fine motor control','Procedural learning','Timing & rhythm'],desc:'The cerebellum (little brain) contains half of all brain neurons. It coordinates voluntary movements, maintains balance, and is involved in motor learning and timing.',size:'~10% of brain volume',areas:'Lobules I-X'}
};
let activeLobe='frontal';
function selectLobe(lobeId){
if(!data[lobeId])return;
const d=data[lobeId];
document.querySelectorAll('.lobe').forEach(l=>{
l.classList.toggle('active',l.dataset.lobe===lobeId);
l.style.filter=l.dataset.lobe===lobeId?'drop-shadow(0 0 8px currentColor)':'none';
});
activeLobe=lobeId;
document.getElementById('lobe-name').textContent=d.name;
const ul=document.getElementById('lobe-functions-list');
ul.innerHTML='';
d.functions.forEach(f=>{const li=document.createElement('li');li.textContent=f;ul.appendChild(li);});
document.getElementById('lobe-desc').textContent=d.desc;
const stats=document.querySelectorAll('.lobe-stats .stat-value');
if(stats.length>=2){stats[0].textContent=d.size;stats[1].textContent=d.areas;}
}
document.querySelectorAll('.lobe').forEach(el=>{
el.addEventListener('click',function(){selectLobe(this.dataset.lobe);});
});
selectLobe('frontal');
})();
