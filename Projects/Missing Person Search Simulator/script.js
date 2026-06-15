(function(){'use strict';
const canvas=document.getElementById('heatmap');
const ctx=canvas.getContext('2d');
const W=600,H=500;
let currentSector='a';
const sectors={a:{name:'Sector A',terrain:'Urban',baseProb:0.3,biasX:0,biasY:0},b:{name:'Sector B',terrain:'Forest',baseProb:0.45,biasX:200,biasY:0},c:{name:'Sector C',terrain:'Coastal',baseProb:0.15,biasX:0,biasY:250},d:{name:'Sector D',terrain:'Mountain',baseProb:0.1,biasX:200,biasY:250}};

function generateHeatmap(sector){
const s=sectors[sector];
const W=600,H=500;
const imageData=ctx.createImageData(W,H);
const data=imageData.data;
for(let y=0;y<H;y++){
for(let x=0;x<W;x++){
let prob=s.baseProb;
const dx=x-(300+s.biasX),dy=y-(250+s.biasY);
const dist=Math.sqrt(dx*dx+dy*dy);
prob+=0.4*Math.exp(-dist*dist/30000);
prob+=0.1*Math.sin(x*0.02)*Math.cos(y*0.03);
prob=Math.max(0,Math.min(1,prob));
const idx=(y*W+x)*4;
let r,g,b;
if(prob<0.25){r=59;g=130;b=246;}
else if(prob<0.5){r=34;g=197;b=94;}
else if(prob<0.75){r=234;g=179;b=8;}
else{r=239;g=68;b=68;}
data[idx]=r;data[idx+1]=g;data[idx+2]=b;
data[idx+3]=Math.round(80+prob*120);
}
}
ctx.putImageData(imageData,0,0);
// overlay grid lines
ctx.strokeStyle='#334155';ctx.lineWidth=0.5;
for(let i=0;i<=4;i++){const p=i*150;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,H);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(W,p);ctx.stroke();}
// sector labels
ctx.fillStyle='#64748b';ctx.font='10px ui-monospace,monospace';ctx.textAlign='center';
const labels=[{x:75,y:65,text:'Sector A'},{x:75,y:315,text:'Sector C'},{x:375,y:65,text:'Sector B'},{x:375,y:315,text:'Sector D'}];
labels.forEach(l=>{ctx.fillStyle='#64748b';ctx.fillText(l.text,l.x,l.y);});
// highlight current sector
const cx=sector==='a'?75:sector==='b'?375:sector==='c'?75:375;
const cy=sector==='a'?65:sector==='b'?65:sector==='c'?315:315;
ctx.strokeStyle='#eab308';ctx.lineWidth=3;
ctx.strokeRect(cx-70,cy-55,140,110);
}

document.querySelectorAll('.sector-btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.sector-btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
currentSector=this.dataset.sector;
document.getElementById('search-status').textContent='Search Area: '+sectors[currentSector].name;
generateHeatmap(currentSector);
});
});
document.getElementById('btn-search-area').addEventListener('click',function(){
const s=sectors[currentSector];
const found=Math.random()<s.baseProb+0.2;
const log=document.getElementById('action-log');
const d=document.createElement('div');d.className='log-entry';
d.textContent=found?'✅ Found clue in '+s.name+'! Clue logged.':'❌ No findings in '+s.name+'. Continuing search.';
log.appendChild(d);
if(found){
const clueLog=document.getElementById('clue-log');
const clues=['📱 Signal detected','👣 Fresh tracks','👕 Fabric sample','📦 Personal item','🗣️ Witness report'];
const c=document.createElement('div');c.className='clue-entry';
c.textContent=clues[Math.floor(Math.random()*clues.length)];
clueLog.appendChild(c);
}
const pct=document.querySelectorAll('.clue-entry').length*10+5;
document.getElementById('searched-pct').textContent=Math.min(pct,100)+'%';
const prob=Math.round(30+Math.random()*50);
document.getElementById('prob-pct').textContent=prob+'%';
document.getElementById('prob-pct').className=prob>=65?'prob-high':prob>=40?'prob-med':'prob-low';
});
generateHeatmap('a');
})();
