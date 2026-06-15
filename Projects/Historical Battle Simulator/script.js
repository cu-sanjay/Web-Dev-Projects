(function(){'use strict';
const canvas=document.getElementById('battle-canvas');
const ctx=canvas.getContext('2d');
const W=800,H=400;

function getVals(){
return{ai:parseInt(document.getElementById('a-inf').value)*10,ac:parseInt(document.getElementById('a-cav').value)*10,aa:parseInt(document.getElementById('a-arch').value)*10,bi:parseInt(document.getElementById('b-inf').value)*10,bc:parseInt(document.getElementById('b-cav').value)*10,ba:parseInt(document.getElementById('b-arch').value)*10};
}
function setDisplay(v){
document.getElementById('a-inf-v').textContent=v.ai;document.getElementById('a-cav-v').textContent=v.ac;
document.getElementById('a-arch-v').textContent=v.aa;document.getElementById('b-inf-v').textContent=v.bi;
document.getElementById('b-cav-v').textContent=v.bc;document.getElementById('b-arch-v').textContent=v.ba;
const aTotal=v.ai+v.ac+v.aa,bTotal=v.bi+v.bc+v.ba;
document.getElementById('army-a-label').textContent='Army A: '+aTotal;
document.getElementById('army-b-label').textContent='Army B: '+bTotal;
}

const terrainBonuses={plains:{inf:1,cav:1.3,arch:1.1},forest:{inf:1.2,cav:0.7,arch:0.9},hills:{inf:1.1,cav:0.8,arch:1.2},river:{inf:0.8,cav:0.5,arch:1.0},siege:{inf:1.3,cav:0.6,arch:1.4}};

function drawArmy(x,y,count,color,label){
const cols=Math.min(8,Math.ceil(Math.sqrt(count/10)));
const rows=Math.ceil(count/10/cols);
for(let r=0;r<rows&&r<6;r++){for(let c=0;c<cols&&c<10;c++){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+c*8-(cols*4),y+r*10,4,0,Math.PI*2);ctx.fill();}}
ctx.fillStyle=color;ctx.font='bold 11px ui-monospace,monospace';ctx.fillText(label,x-20,y-15);
}

function simulate(){
const v=getVals();
setDisplay(v);
const terrain=document.getElementById('terrain').value;
const tb=terrainBonuses[terrain]||{inf:1,cav:1,arch:1};
const aPower=v.ai*tb.inf+v.ac*tb.cav+v.aa*tb.arch;
const bPower=v.bi*tb.inf+v.bc*tb.cav+v.ba*tb.arch;
const totalA=v.ai+v.ac+v.aa,totalB=v.bi+v.bc+v.ba;
const ratio=Math.min(2,Math.max(0.3,(aPower+Math.random()*aPower*0.2)/(bPower+Math.random()*bPower*0.2+1)));
let winA,desc;
if(ratio>1.15){winA=true;desc='Army A dominates the battlefield!';}else if(ratio<0.85){winA=false;desc='Army B claims victory!';}else{winA=ratio>1;desc='A narrow '+ (ratio>1?'Army A':'Army B') +' victory!';}
const casA=Math.round(totalA*(0.3+Math.random()*0.3)*(winA?0.6:1.2));
const casB=Math.round(totalB*(0.3+Math.random()*0.3)*(winA?1.2:0.6));
const surA=totalA-casA,surB=totalB-casB;
document.getElementById('outcome-title').textContent=winA?'🏆 Army A Wins!':'🏆 Army B Wins!';
document.getElementById('outcome-title').style.color=winA?'#3b82f6':'#ef4444';
document.getElementById('outcome-text').textContent=desc+' Terrain: '+terrain+'. '+surA+'/'+totalA+' vs '+surB+'/'+totalB+' remaining.';
document.getElementById('cas-a').textContent=casA;document.getElementById('cas-b').textContent=casB;
// draw
ctx.clearRect(0,0,W,H);
ctx.fillStyle='#0a0f1a';ctx.fillRect(0,0,W,H);
const colors={plains:'#1a3010',forest:'#0a2010',hills:'#1a1a10',river:'#0a1020',siege:'#1a1010'};
ctx.fillStyle=colors[terrain]||'#0a0f1a';ctx.fillRect(0,180,W,40);
ctx.fillStyle='#64748b';ctx.font='10px ui-monospace,monospace';ctx.fillText('🌾 Plains',10,20);
ctx.fillText('🌲 Forest',110,20);ctx.fillText('⛰️ Hills',210,20);ctx.fillText('🌊 River',310,20);ctx.fillText('🏰 Siege',410,20);
ctx.strokeStyle='#334155';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(0,200);ctx.lineTo(W,200);ctx.stroke();
drawArmy(200,160,totalA,'#3b82f6','Army A');
drawArmy(600,220,totalB,'#ef4444','Army B');
}

document.querySelectorAll('.army-panel input').forEach(el=>el.addEventListener('input',()=>{const v=getVals();setDisplay(v);}));
document.getElementById('btn-battle').addEventListener('click',simulate);
const v=getVals();setDisplay(v);
})();
