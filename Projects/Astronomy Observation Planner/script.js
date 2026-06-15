(function(){'use strict';
const canvas=document.getElementById('sky-canvas');
const ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height;

const constellations=[
{name:'Ursa Major',stars:[[380,100],[400,120],[420,140],[440,130],[460,150],[430,170],[390,160]],color:'#64748b'},
{name:'Orion',stars:[[200,380],[220,370],[240,360],[230,390],[250,410],[270,400],[260,380]],color:'#64748b'},
{name:'Cassiopeia',stars:[[600,80],[630,100],[660,70],[690,110],[720,80]],color:'#64748b'},
{name:'Scorpius',stars:[[150,500],[170,490],[190,510],[210,500],[230,520],[250,510],[270,530]],color:'#64748b'}
];
const planets=[
{name:'Jupiter',mag:-2.5,x:300,y:180,color:'#eab308'},
{name:'Saturn',mag:-0.5,x:550,y:250,color:'#06b6d4'},
{name:'Mars',mag:-1.0,x:700,y:150,color:'#f97316'},
{name:'Venus',mag:-3.8,x:450,y:400,color:'#a78bfa'}
];

const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let lat=40,month=5,time=22;

document.getElementById('lat-slider').addEventListener('input',function(){lat=parseInt(this.value);document.getElementById('lat-value').textContent=lat+'° '+(lat>=0?'N':'S');draw();});
document.getElementById('month-slider').addEventListener('input',function(){month=parseInt(this.value)-1;document.getElementById('month-value').textContent=months[month];draw();});
document.getElementById('time-slider').addEventListener('input',function(){time=parseFloat(this.value);const h=Math.floor(time);const m=(time-h)*60;document.getElementById('time-value').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');draw();});

function draw(){
const stars=[];
for(let i=0;i<250;i++){
stars.push({x:Math.random()*W*1.2-W*0.1,y:Math.random()*H*1.2-H*0.1,r:Math.random()*1.8+0.3,b:Math.random()*0.8+0.2});
for(let j=0;j<i;j++){const dx=stars[i].x-stars[j].x,dy=stars[i].y-stars[j].y;if(dx*dx+dy*dy<9){stars[i].x+=Math.random()*20-10;stars[i].y+=Math.random()*20-10;}}
}

ctx.fillStyle='#0a0510';ctx.fillRect(0,0,W,H);

// horizon
const horizonY=H-60-(lat+90)*0.3;
const grad=ctx.createLinearGradient(0,0,0,horizonY+30);
grad.addColorStop(0,'#0a0510');
grad.addColorStop(0.7,'#0d0a1a');
grad.addColorStop(1,'#1a1a2e');
ctx.fillStyle=grad;ctx.fillRect(0,0,W,horizonY+30);

// ground
const groundGrad=ctx.createLinearGradient(0,horizonY+30,0,H);
groundGrad.addColorStop(0,'#0a0a0a');
groundGrad.addColorStop(1,'#050505');
ctx.fillStyle=groundGrad;ctx.fillRect(0,horizonY+30,W,H-horizonY-30);

// stars
for(const s of stars){
const twinkle=0.7+Math.random()*0.3;
ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
ctx.fillStyle=`rgba(255,255,255,${s.b*twinkle})`;ctx.fill();
}

// Milky Way band
ctx.save();
ctx.globalAlpha=0.04;
for(let i=0;i<20;i++){
const y=horizonY-100+Math.sin(i*0.3)*200+Math.cos(i*0.7)*100;
ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(40+i*40,y+30,20,80,0.2,0,Math.PI*2);ctx.fill();
}
ctx.restore();

// constellations
for(const c of constellations){
ctx.strokeStyle=c.color;ctx.lineWidth=0.5;ctx.setLineDash([3,3]);
ctx.beginPath();
for(let i=0;i<c.stars.length;i++){
const s=c.stars[i];
i===0?ctx.moveTo(s[0],s[1]):ctx.lineTo(s[0],s[1]);
}
ctx.stroke();
ctx.setLineDash([]);
for(const s of c.stars){
ctx.beginPath();ctx.arc(s[0],s[1],2,0,Math.PI*2);ctx.fillStyle='#94a3b8';ctx.fill();
}
ctx.fillStyle='#64748b';ctx.font='9px ui-monospace,monospace';
ctx.fillText(c.name,c.stars[0][0]-15,c.stars[0][1]-8);
}

// planets
for(const p of planets){
const r=3+Math.abs(p.mag)*0.5;
ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);
ctx.fillStyle=p.color;ctx.fill();
ctx.strokeStyle=p.color+'40';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(p.x,p.y,r+3,0,Math.PI*2);ctx.stroke();
ctx.fillStyle=p.color;ctx.font='10px ui-monospace,monospace';ctx.fillText(p.name,p.x+8,p.y+3);
}

// moon phase
const moonX=650,moonY=80;
const phase=(month/12+time/24)%1;
ctx.beginPath();ctx.arc(moonX,moonY,18,0,Math.PI*2);
ctx.fillStyle='#eab308';ctx.fill();
ctx.beginPath();ctx.arc(moonX+18*(phase-0.5)*2,moonY,18,0,Math.PI*2);
ctx.fillStyle='#0a0510';ctx.fill();
ctx.strokeStyle='#eab308';ctx.lineWidth=1;
ctx.beginPath();ctx.arc(moonX,moonY,18,0,Math.PI*2);ctx.stroke();

// horizon line
ctx.strokeStyle='#334155';ctx.lineWidth=1;ctx.setLineDash([]);
ctx.beginPath();ctx.moveTo(0,horizonY+29);ctx.lineTo(W,horizonY+29);ctx.stroke();

// conditions
const visibility=lat>-30?Math.max(0.3,1-Math.abs(time-0)/12):0.5;
const txt=visibility>0.7?'Excellent':visibility>0.5?'Good':'Fair';
document.getElementById('conditions').textContent=txt;
}
draw();
})();
