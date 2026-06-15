(function(){'use strict';
const missions=[
{name:'Operation Echo',location:'Istanbul',briefing:'Infiltrate a secure facility to extract classified documents from a foreign intelligence operative.',baseRisk:0.7,baseSuccess:0.5,reward:'$500K',duration:'72h'},
{name:'Nightfall Protocol',location:'Vienna',briefing:'Conduct a covert surveillance operation on a suspected double agent during a diplomatic gala.',baseRisk:0.5,baseSuccess:0.7,reward:'$350K',duration:'48h'},
{name:'Ghost Wire',location:'Singapore',briefing:'Intercept encrypted communications from a corporate espionage ring operating out of a tech hub.',baseRisk:0.6,baseSuccess:0.6,reward:'$750K',duration:'96h'},
{name:'Iron Shadow',location:'Pyongyang',briefing:'Extract a defector with critical intelligence on missile programs. High risk, high reward.',baseRisk:0.9,baseSuccess:0.3,reward:'$2M',duration:'120h'}
];
let currentMission=0;
let selectedGadgets=[];

function renderMission(){
const m=missions[currentMission];
document.getElementById('mission-name').textContent=m.name;
document.getElementById('mission-location').textContent='📍 '+m.location;
document.getElementById('briefing-text').textContent=m.briefing;
document.getElementById('reward-value').textContent=m.reward;
document.getElementById('duration-value').textContent=m.duration;
updateRisk();
}

function updateRisk(){
const m=missions[currentMission];
const gadgetBonus=selectedGadgets.length*0.05;
const risk=Math.round((m.baseRisk-gadgetBonus)*100);
const success=Math.round((m.baseSuccess+gadgetBonus)*100);
document.getElementById('risk-value').textContent=risk+'%';
document.getElementById('risk-value').className='m-value '+(risk>=70?'risk-high':risk>=50?'risk-med':'');
document.getElementById('success-value').textContent=success+'%';
document.getElementById('success-value').style.color=success>=60?'#22c55e':'#eab308';
document.getElementById('risk-detection').style.width=Math.round(risk*0.9)+'%';
document.getElementById('risk-comms').style.width=Math.round(40+selectedGadgets.length*5)+'%';
document.getElementById('risk-extraction').style.width=Math.round(risk*0.8)+'%';
}

document.querySelectorAll('.mission-btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.mission-btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
currentMission=parseInt(this.dataset.mission);
renderMission();
});
});
document.querySelectorAll('.gadget-cb').forEach(cb=>{
cb.addEventListener('change',function(){
selectedGadgets=[];
document.querySelectorAll('.gadget-cb:checked').forEach(c=>selectedGadgets.push(c.dataset.gadget));
updateRisk();
});
});
document.getElementById('btn-launch').addEventListener('click',function(){
const m=missions[currentMission];
const risk=parseInt(document.getElementById('risk-value').textContent);
const success=parseInt(document.getElementById('success-value').textContent);
const log=document.getElementById('mission-log');
const d=document.createElement('div');d.className='log-entry';
const outcome=Math.random()*100<success?'✅ MISSION SUCCESS: '+m.name+' completed. Reward: '+m.reward:'❌ MISSION FAILED: '+m.name+' compromised. Abort!';
d.textContent=outcome;
d.style.color=outcome.includes('SUCCESS')?'#22c55e':'#ef4444';
log.appendChild(d);
});
renderMission();
})();
