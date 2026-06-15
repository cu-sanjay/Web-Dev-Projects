(function(){'use strict';
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
let W=900,H=600,cx=W/2,cy=H/2;
let mass=10,diskAmount=0.6,spin=0.3;
const stars=[];
for(let i=0;i<200;i++){stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+0.5,b:Math.random()*0.7+0.3})}
const bgStars=[];
for(let i=0;i<300;i++){bgStars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1+0.2,b:Math.random()*0.5+0.1})}

function resize(){
const rect=canvas.parentElement.getBoundingClientRect();
if(rect.width>0){const s=Math.min(rect.width/W,rect.height/H);canvas.style.width=(W*s)+'px';canvas.style.height=(H*s)+'px';}
}
window.addEventListener('resize',resize);

document.getElementById('mass-slider').addEventListener('input',function(){mass=parseInt(this.value);document.getElementById('mass-value').textContent=mass+' M☉';document.getElementById('mass-display').textContent='Mass: '+mass+' M☉';});
document.getElementById('disk-slider').addEventListener('input',function(){diskAmount=parseInt(this.value)/100;document.getElementById('disk-value').textContent=parseInt(this.value)+'%';});
document.getElementById('spin-slider').addEventListener('input',function(){spin=parseInt(this.value)/100;document.getElementById('spin-value').textContent=spin.toFixed(1);});
document.getElementById('btn-reset').addEventListener('click',function(){document.getElementById('mass-slider').value=10;mass=10;document.getElementById('mass-value').textContent='10 M☉';document.getElementById('mass-display').textContent='Mass: 10 M☉';document.getElementById('disk-slider').value=60;diskAmount=0.6;document.getElementById('disk-value').textContent='60%';document.getElementById('spin-slider').value=30;spin=0.3;document.getElementById('spin-value').textContent='0.3';});

let angle=0;
function draw(){
const horizonRadius=20+mass*1.5;
const lensRadius=horizonRadius*4;

ctx.fillStyle='#0a0f1a';
ctx.fillRect(0,0,W,H);

// background stars with lensing
for(const s of bgStars){
const dx=s.x-cx,dy=s.y-cy;
const dist=Math.sqrt(dx*dx+dy*dy);
let sx=s.x,sy=s.y;
if(dist<lensRadius&&dist>horizonRadius){
const bend=Math.pow(1-dist/lensRadius,2)*(40+mass*2)/dist;
const a=Math.atan2(dy,dx);
sx+=Math.cos(a)*bend;
sy+=Math.sin(a)*bend;
}
ctx.beginPath();ctx.arc(sx,sy,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${s.b*0.3})`;ctx.fill();
}

// accretion disk
if(diskAmount>0){
for(let r=horizonRadius+8;r<horizonRadius+80;r+=2){
const intensity=Math.max(0,1-(r-horizonRadius)/80)*diskAmount;
const a=angle*spin*2+r*0.02;
const segments=24;
for(let i=0;i<segments;i++){
const theta=(i/segments)*Math.PI*2+a;
const nextTheta=((i+1)/segments)*Math.PI*2+a;
const wobble=Math.sin(theta*3+angle)*3;
const r2=r+wobble;
const x1=cx+Math.cos(theta)*r2;
const y1=cy+Math.sin(theta)*r2*0.4;
const x2=cx+Math.cos(nextTheta)*(r2+2);
const y2=cy+Math.sin(nextTheta)*(r2+2)*0.4;
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
const hue=30+r*1.5;
ctx.strokeStyle=`hsla(${hue},100%,${50+intensity*30}%,${intensity*0.6})`;
ctx.lineWidth=3;ctx.stroke();
}
}
}

// lensing ring
const grad=ctx.createRadialGradient(cx,cy,horizonRadius,cx,cy,horizonRadius*3);
grad.addColorStop(0,'rgba(167,139,250,0)');
grad.addColorStop(0.3,'rgba(167,139,250,0.05)');
grad.addColorStop(0.6,'rgba(167,139,250,0.02)');
grad.addColorStop(1,'rgba(167,139,250,0)');
ctx.fillStyle=grad;
ctx.beginPath();ctx.arc(cx,cy,horizonRadius*3,0,Math.PI*2);ctx.fill();

// photon ring
for(let r=0;r<3;r++){
const pr=horizonRadius*1.05+r*3;
ctx.beginPath();ctx.arc(cx,cy,pr,angle*spin+Math.PI*0.5*r,angle*spin+Math.PI+Math.PI*0.5*r);
ctx.strokeStyle=`rgba(255,200,100,${0.15-r*0.04})`;
ctx.lineWidth=2;ctx.stroke();
}

// event horizon
const ehGrad=ctx.createRadialGradient(cx-8,cy-8,horizonRadius*0.3,cx,cy,horizonRadius);
ehGrad.addColorStop(0,'#000');
ehGrad.addColorStop(0.7,'#0a0a0a');
ehGrad.addColorStop(0.9,'#1a1020');
ehGrad.addColorStop(1,'rgba(167,139,250,0.3)');
ctx.fillStyle=ehGrad;
ctx.beginPath();ctx.arc(cx,cy,horizonRadius,0,Math.PI*2);ctx.fill();

// foreground stars (unaffected)
for(const s of stars){
const dx=s.x-cx,dy=s.y-cy;
const dist=Math.sqrt(dx*dx+dy*dy);
if(dist>horizonRadius*4||dist<horizonRadius){
ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${s.b})`;ctx.fill();
}
}

angle+=0.02;
requestAnimationFrame(draw);
}
resize();
draw();
})();
