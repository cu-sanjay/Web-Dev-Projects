(function(){'use strict';
const nodes=['web','db','mail','dns','app'];
const defenses={firewall:{cost:10,effect:20,desc:'Blocks network layer attacks'},antivirus:{cost:15,effect:15,desc:'Detects and removes malware'},ids:{cost:25,effect:30,desc:'Intrusion detection alerts'},waf:{cost:30,effect:35,desc:'Web application firewall'},backup:{cost:20,effect:25,desc:'Restores compromised nodes'}};
const attacks=['DDoS','Malware','SQL Injection','Phishing','Ransomware','Zero Day','Brute Force','XSS'];
let state={wave:1,health:100,score:0,points:50,nodeHealth:{web:100,db:100,mail:100,dns:100,app:100},deployed:[],activeAttacks:[]};
function log(msg,cls=''){const el=document.getElementById('attack-log');const d=document.createElement('div');d.className='log-entry'+(cls?' '+cls:'');d.textContent=msg;el.appendChild(d);el.scrollTop=el.scrollHeight;}
function render(){
document.getElementById('wave').textContent=state.wave;
document.getElementById('health').textContent=state.health;
document.getElementById('score').textContent=state.score;
document.getElementById('points').textContent=state.points;
nodes.forEach(n=>{
const el=document.querySelector(`.node[data-node="${n}"]`);
const h=state.nodeHealth[n];
if(h<=0){el.classList.add('compromised');el.classList.remove('down');}
else if(h<50){el.classList.add('down');el.classList.remove('compromised');}
else{el.classList.remove('compromised','down');}
el.querySelector('.node-health').style.width=h+'%';
});
}
function deploy(type){
const d=defenses[type];
if(!d)return;
if(state.points<d.cost){log('Not enough points for '+type,'');return;}
if(state.deployed.includes(type)){log(type+' already deployed','');return;}
state.points-=d.cost;
state.deployed.push(type);
log('Deployed '+type+' - '+d.desc,'defense');
render();
}
function nextWave(){
state.wave++;
const attackCount=Math.min(1+Math.floor(state.wave/2),5);
const attackNames=attacks.sort(()=>Math.random()-0.5).slice(0,attackCount);
state.activeAttacks=attackNames;
let totalDamage=0;
let blocked=0;
attackNames.forEach((a,i)=>{
const target=nodes[Math.floor(Math.random()*nodes.length)];
const defBonus=state.deployed.length*5;
const damage=Math.max(5,20+state.wave*3-defBonus-Math.floor(Math.random()*15));
log(`⚠️ ${a} attack targeting ${target}! (${damage} damage)`,damage>15?'attack':'defense');
if(state.deployed.length>0&&Math.random()>0.3+state.deployed.length*0.05){
blocked++;
log(`✅ ${a} blocked by ${state.deployed[Math.floor(Math.random()*state.deployed.length)]}`,'defense');
}else{
state.nodeHealth[target]=Math.max(0,state.nodeHealth[target]-damage);
totalDamage+=damage;
if(state.nodeHealth[target]<=0){
log(`❌ ${target} compromised!`,'attack');
}
}
});
// health drain
const compromised=nodes.filter(n=>state.nodeHealth[n]<=0).length;
state.health=Math.max(0,state.health-compromised*5-totalDamage*0.2+state.deployed.length*2);
state.health=Math.round(Math.min(100,state.health));
state.score+=blocked*10+state.wave*5;
// points per wave
state.points+=15+state.wave*5;
log(`--- Wave ${state.wave} complete. ${blocked}/${attackNames.length} attacks blocked ---`);
if(state.health<=0){
log('💀 NETWORK DESTROYED. GAME OVER.','attack');
} else if(compromised>=3){
log('⚠️ Multiple nodes compromised!','attack');
}
render();
}
function resetGame(){
state={wave:1,health:100,score:0,points:50,nodeHealth:{web:100,db:100,mail:100,dns:100,app:100},deployed:[],activeAttacks:[]};
document.getElementById('attack-log').innerHTML='<div class="log-entry">System reset. Defenses ready.</div>';
render();
}
document.querySelectorAll('.def-btn').forEach(btn=>btn.addEventListener('click',function(){deploy(this.dataset.type);}));
document.getElementById('btn-next-wave').addEventListener('click',nextWave);
document.getElementById('btn-reset').addEventListener('click',resetGame);
render();
log('Firewall and Antivirus recommended for Wave 1.','defense');
})();
