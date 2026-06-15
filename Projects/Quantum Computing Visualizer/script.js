(function(){'use strict';
const complex={re:0,im:0};
let state=[{re:1,im:0},{re:0,im:0}];
function applyGate(gate){
let a=state[0],b=state[1];
switch(gate){
case'H':state=[{re:(a.re+b.re)/Math.SQRT2,im:(a.im+b.im)/Math.SQRT2},{re:(a.re-b.re)/Math.SQRT2,im:(a.im-b.im)/Math.SQRT2}];break;
case'X':state=[b,a];break;
case'Y':state=[{re:-b.im,im:b.re},{re:a.im,im:-a.re}];break;
case'Z':state=[a,{re:-b.re,im:-b.im}];break;
case'S':state=[a,{re:-b.im,im:b.re}];break;
case'T':const c=Math.cos(Math.PI/4),s=Math.sin(Math.PI/4);state=[a,{re:b.re*c-b.im*s,im:b.re*s+b.im*c}];break;
}
normalize();
renderAll();
}
function normalize(){
let n=Math.sqrt(state[0].re*state[0].re+state[0].im*state[0].im+state[1].re*state[1].re+state[1].im*state[1].im);
if(n>0){state[0].re/=n;state[0].im/=n;state[1].re/=n;state[1].im/=n;}
}
function resetState(){state=[{re:1,im:0},{re:0,im:0}];renderAll();}
const canvas=document.getElementById('circuit');
const ctx=canvas.getContext('2d');
const blochCanvas=document.getElementById('bloch');
const bctx=blochCanvas.getContext('2d');

function renderAll(){
renderCircuit();
renderBloch();
renderProbs();
renderQubitState();
}
function renderCircuit(){
const W=canvas.width,H=canvas.height;
ctx.clearRect(0,0,W,H);
ctx.fillStyle='#0a0f1a';ctx.fillRect(0,0,W,H);
const cols=['H','X','Y','Z','S','T'];
ctx.strokeStyle='#334155';ctx.lineWidth=2;ctx.setLineDash([]);
ctx.beginPath();ctx.moveTo(30,H/2);ctx.lineTo(W-30,H/2);ctx.stroke();
ctx.fillStyle='#64748b';ctx.font='10px ui-monospace,monospace';
ctx.fillText('|0⟩',8,H/2+4);
for(let i=0;i<cols.length;i++){
const x=80+i*95;
ctx.strokeStyle='#334155';ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x,H-20);ctx.stroke();
ctx.fillStyle='#64748b';ctx.font='9px ui-monospace,monospace';ctx.fillText((i+1),x-3,14);
ctx.fillStyle='#06b6d4';ctx.font='bold 11px ui-monospace,monospace';
ctx.fillText(cols[i],x-6,H/2+4);
}
}
function renderBloch(){
const W=blochCanvas.width,H=blochCanvas.height,cx=W/2,cy=H/2,r=75;
bctx.clearRect(0,0,W,H);
bctx.fillStyle='#0a0f1a';bctx.fillRect(0,0,W,H);
bctx.strokeStyle='#334155';bctx.lineWidth=1;
bctx.beginPath();bctx.arc(cx,cy,r,0,Math.PI*2);bctx.stroke();
bctx.beginPath();bctx.ellipse(cx,cy,r,r*0.3,0,0,Math.PI*2);bctx.stroke();
bctx.beginPath();bctx.moveTo(cx-r,cy);bctx.lineTo(cx+r,cy);bctx.stroke();
bctx.beginPath();bctx.moveTo(cx,cy-r);bctx.lineTo(cx,cy+r);bctx.stroke();
const theta=2*Math.acos(Math.max(-1,Math.min(1,state[0].re)));
const phi=Math.atan2(state[1].im,state[1].re)||0;
const px=cx+r*Math.sin(theta)*Math.cos(phi);
const py=cy-r*Math.cos(theta);
bctx.fillStyle='#06b6d4';bctx.beginPath();bctx.arc(px,py,6,0,Math.PI*2);bctx.fill();
bctx.fillStyle='rgba(6,182,212,0.15)';bctx.beginPath();bctx.arc(px,py,12,0,Math.PI*2);bctx.fill();
bctx.strokeStyle='#06b6d4';bctx.lineWidth=1.5;
bctx.beginPath();bctx.moveTo(cx,cy);bctx.lineTo(px,py);bctx.stroke();
}
function renderProbs(){
const p0=state[0].re*state[0].re+state[0].im*state[0].im;
const p1=state[1].re*state[1].re+state[1].im*state[1].im;
document.getElementById('prob-0').style.width=(p0*100)+'%';
document.getElementById('prob-1').style.width=(p1*100)+'%';
document.getElementById('prob-val-0').textContent=Math.round(p0*100)+'%';
document.getElementById('prob-val-1').textContent=Math.round(p1*100)+'%';
}
function renderQubitState(){
const p0=state[0].re*state[0].re+state[0].im*state[0].im;
const p1=state[1].re*state[1].re+state[1].im*state[1].im;
const amp0=state[0].re.toFixed(2)+(state[0].im>=0?'+':'')+state[0].im.toFixed(2)+'i';
const amp1=state[1].re.toFixed(2)+(state[1].im>=0?'+':'')+state[1].im.toFixed(2)+'i';
document.getElementById('qubit-state').textContent='|ψ⟩ = '+amp0+'|0⟩ + '+amp1+'|1⟩';
}
document.querySelectorAll('.gate-btn').forEach(btn=>{btn.addEventListener('click',function(){applyGate(this.dataset.gate);});});
document.getElementById('btn-reset').addEventListener('click',resetState);
renderAll();
})();
