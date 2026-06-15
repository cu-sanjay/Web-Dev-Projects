(function(){'use strict';
const cases=[
{name:'The Stolen Diamond',scene:'Grand Ballroom',culprit:'The Butler',
clues:['Security footage shows a figure at 11PM','Fingerprints on the display case','Torn piece of fabric from a uniform'],
suspects:[{name:'The Butler',desc:'Has worked here for 20 years'},{name:'The Heiress',desc:'Recently arrived from Paris'},{name:'The Rival',desc:'Known collector of rare gems'}],
interactions:{window:'You examine the window. It was left slightly ajar. You find a thread caught on the latch.',table:'The display case is empty. Fingerprint powder reveals partial prints.',door:'The door shows no signs of forced entry. The culprit had a key.',rug:'You lift the rug. There is a faint stain underneath.'}},
{name:'The Missing Will',scene:'Law Library',culprit:'The Lawyer',
clues:['Ink smudge on page 4','Half-burned document in fireplace','Witness saw someone leave at 2AM'],
suspects:[{name:'The Lawyer',desc:'Executor of the estate'},{name:'The Niece',desc:'Disinherited last month'},{name:'The Gardener',desc:'Has access to all rooms'}],
interactions:{window:'The window overlooks the garden. Fresh footprints below.',table:'A desk drawer is open. Inside: a half-empty ink bottle.',door:'The library door creaks. Someone has been here recently.',rug:'The rug is slightly shifted, revealing a floor safe.'}}
];
let currentCase=0,cluesFound=[],interacted=[];
function initCase(){
const c=cases[currentCase];
cluesFound=[false,false,false];
interacted=[false,false,false,false];
document.getElementById('case-name').textContent=c.name;
document.getElementById('scene-name').textContent=c.scene;
document.getElementById('status-badge').textContent='Active';
document.getElementById('status-badge').className='status-badge active';
renderClues();renderSuspects();updateProgress();
document.getElementById('action-log').innerHTML='<div class="log-entry">New case: '+c.name+'. Investigate the scene.</div>';
}
function renderClues(){
const c=cases[currentCase];
const el=document.getElementById('clue-list');el.innerHTML='';
c.clues.forEach((clue,i)=>{
const div=document.createElement('div');div.className='clue-item'+(cluesFound[i]?' found':'');
div.textContent=cluesFound[i]?'🔍 '+clue:'❓ '+clue;
el.appendChild(div);});
}
function renderSuspects(){
const c=cases[currentCase];
const el=document.getElementById('suspects');el.innerHTML='';
const clueCounts=[0,0,0];
cluesFound.forEach(found=>{if(found)for(let i=0;i<3;i++)clueCounts[i]+=Math.random()>0.5?1:0;});
clueCounts[0]=cluesFound.filter(Boolean).length-Math.floor(Math.random()*2);
clueCounts[0]=Math.max(0,clueCounts[0]);
clueCounts[1]=Math.floor(cluesFound.filter(Boolean).length*0.5);
clueCounts[2]=Math.floor(cluesFound.filter(Boolean).length*0.2);
c.suspects.forEach((s,i)=>{
const div=document.createElement('div');div.className='suspect';
div.innerHTML='<span class="suspect-name">'+s.name+'</span><span class="suspect-clues">'+clueCounts[i]+'/3 linked</span>';
el.appendChild(div);});
}
function updateProgress(){
const p=cluesFound.filter(Boolean).length/3*100;
document.getElementById('progress-fill').style.width=p+'%';
}
document.querySelectorAll('.scene-object').forEach(obj=>{
obj.addEventListener('click',function(){
const action=this.dataset.action;
const idx=['window','table','door','rug'].indexOf(action);
if(idx>-1&&!interacted[idx]){
interacted[idx]=true;
const c=cases[currentCase];
const msg=c.interactions[action]||'Nothing unusual.';
const log=document.getElementById('action-log');
const d=document.createElement('div');d.className='log-entry';d.textContent='🔍 '+msg;log.appendChild(d);
if(Math.random()>0.5){
const clueIdx=cluesFound.findIndex(f=>!f);
if(clueIdx>-1){cluesFound[clueIdx]=true;renderClues();renderSuspects();updateProgress();
const d2=document.createElement('div');d2.className='log-entry';d2.textContent='✅ New clue discovered!';log.appendChild(d2);}}
const allFound=cluesFound.every(Boolean);
if(allFound){document.getElementById('status-badge').textContent='Ready to Accuse';
document.getElementById('status-badge').className='status-badge';(document.getElementById('status-badge').style.background='#22c55e40');(document.getElementById('status-badge').style.color='#22c55e');(document.getElementById('status-badge').style.borderColor='#22c55e');}
}
});
});
document.getElementById('btn-accuse').addEventListener('click',function(){
const allFound=cluesFound.every(Boolean);
if(!allFound){const log=document.getElementById('action-log');
const d=document.createElement('div');d.className='log-entry';d.textContent='⚠️ Collect all clues before accusing!';log.appendChild(d);return;}
const c=cases[currentCase];
const correct=c.culprit;
const names=c.suspects.map(s=>s.name);
const guess=prompt('Who is the culprit?\nOptions: '+names.join(', '));
if(guess&&guess.toLowerCase().includes(correct.toLowerCase())){
const log=document.getElementById('action-log');
const d=document.createElement('div');d.className='log-entry';d.textContent='🎉 Correct! '+correct+' was the culprit! Case solved.';log.appendChild(d);
document.getElementById('status-badge').textContent='Solved!';document.getElementById('status-badge').className='status-badge';
(document.getElementById('status-badge').style.background='#22c55e40');(document.getElementById('status-badge').style.color='#22c55e');(document.getElementById('status-badge').style.borderColor='#22c55e');
}else if(guess){
const log=document.getElementById('action-log');
const d=document.createElement('div');d.className='log-entry';d.textContent='❌ Wrong! The culprit was '+correct+'.';log.appendChild(d);}
});
document.getElementById('btn-reset').addEventListener('click',function(){currentCase=(currentCase+1)%cases.length;initCase();});
initCase();
})();
