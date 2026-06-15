(function(){'use strict';
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2;

const proteins={
hemoglobin:{name:'Hemoglobin',desc:'Oxygen transport protein in red blood cells',structure:'α2β2 tetramer',residues:'574',mw:'64.5',
helices:[[0,0,120,0,0,180],[0,0,100,80,0,160],[0,0,140,-80,0,200],[0,0,110,160,0,190]],
sheets:[[80,80,80,-80,80,-80,-80,-80],[80,-80,80,80,-80,80,-80,-80]]},
insulin:{name:'Insulin',desc:'Blood glucose regulation hormone',structure:'α/β peptide',residues:'51',mw:'5.8',
helices:[[0,0,60,20,0,100],[0,0,50,-30,0,90],[0,0,55,40,0,80]],
sheets:[[30,30,30,-30,30,-30,-30,-30]]},
collagen:{name:'Collagen',desc:'Structural protein in connective tissue',structure:'Triple helix',residues:'1050',mw:'120',
helices:[[0,0,200,0,0,280],[0,0,195,40,0,275],[0,0,205,-40,0,285]],
sheets:[]},
lysozyme:{name:'Lysozyme',desc:'Antibacterial enzyme in tears/saliva',structure:'α+β mixed',residues:'129',mw:'14.3',
helices:[[0,0,80,10,0,130],[0,0,70,-20,0,120],[0,0,75,30,0,110],[0,0,65,-40,0,100]],
sheets:[[40,40,40,-40,40,-40,-40,-40],[-30,-30,30,-30,30,30,-30,30]]}
};

let currentProtein='hemoglobin';
let displayMode='ribbon';
let rotX=0,rotY=0,rotZ=0;
let isDragging=false,lastMX=0,lastMY=0,zoom=1;

function rotate(x,y,z){
let c=Math.cos(rotX),s=Math.sin(rotX);
let y1=y*c-z*s,z1=y*s+z*c;
c=Math.cos(rotY);s=Math.sin(rotY);
let x2=x*c+z1*s,z2=-x*s+z1*c;
c=Math.cos(rotZ);s=Math.sin(rotZ);
return{x:x2*c-y1*s,y:x2*s+y1*c,z:z2};
}

function project(x,y,z){
const zz=z+400;
const scale=zoom*400/zz;
return{x:cx+x*scale,y:cy+y*scale};
}

function drawHelix(h,color){
const pts=[];
const segments=30;
for(let i=0;i<=segments;i++){
const t=i/segments;
const x=h[0]+(h[3]-h[0])*t+Math.sin(t*Math.PI*6)*15;
const y=h[1]+(h[4]-h[1])*t+Math.cos(t*Math.PI*6)*15;
const z=h[2]+(h[5]-h[2])*t;
const r=rotate(x,y,z);
pts.push(r);
}
if(displayMode==='ribbon'){
ctx.beginPath();
for(let i=0;i<pts.length;i++){
const p=project(pts[i].x,pts[i].y,pts[i].z);
i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
}
ctx.strokeStyle=color;ctx.lineWidth=5;ctx.stroke();
}else if(displayMode==='sphere'){
for(let i=0;i<pts.length;i+=3){
const p=project(pts[i].x,pts[i].y,pts[i].z);
ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);
ctx.fillStyle=color;ctx.fill();
}
}else{
ctx.beginPath();
for(let i=0;i<pts.length;i++){
const p=project(pts[i].x,pts[i].y,pts[i].z);
i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
}
ctx.strokeStyle=color;ctx.lineWidth=1;ctx.stroke();
}
}

function drawSheet(points,color){
const pts=[];
for(let i=0;i<8;i+=2){
const x=points[i],y=points[i+1];
const p=rotate(x*3,y*3,0);
pts.push(p);
}
if(displayMode==='ribbon'||displayMode==='wireframe'){
ctx.beginPath();
for(let i=0;i<pts.length;i++){
const p=project(pts[i].x,pts[i].y,pts[i].z);
i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
}
ctx.closePath();
ctx.strokeStyle=color;ctx.lineWidth=displayMode==='ribbon'?3:1;ctx.stroke();
if(displayMode==='ribbon'){ctx.fillStyle=color+'30';ctx.fill();}
}
}

function render(){
ctx.fillStyle='#0a0f1a';ctx.fillRect(0,0,W,H);
const pro=proteins[currentProtein];
pro.helices.forEach(h=>drawHelix(h,'#22c55e'));
pro.sheets.forEach(s=>drawSheet(s,'#3b82f6'));
const p=rotate(0,0,0);
const center=project(p.x,p.y,p.z);
ctx.beginPath();ctx.arc(center.x,center.y,3,0,Math.PI*2);
ctx.fillStyle='#a78bfa';ctx.fill();
}
render();

document.querySelectorAll('.protein-btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.protein-btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
currentProtein=this.dataset.protein;
const d=proteins[currentProtein];
document.getElementById('p-name').textContent=d.name;
document.getElementById('p-desc').textContent=d.desc;
document.getElementById('p-structure').textContent=d.structure;
document.getElementById('p-residues').textContent=d.residues;
document.getElementById('p-mw').textContent=d.mw;
render();
});
});
document.querySelectorAll('.display-options .btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.display-options .btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
displayMode=this.id.replace('disp-','');
render();
});
});
canvas.addEventListener('mousedown',function(e){isDragging=true;lastMX=e.offsetX;lastMY=e.offsetY;});
window.addEventListener('mousemove',function(e){
if(!isDragging)return;
const dx=e.offsetX-lastMX,dy=e.offsetY-lastMY;
rotY+=dx*0.005;rotX+=dy*0.005;
lastMX=e.offsetX;lastMY=e.offsetY;
render();
});
window.addEventListener('mouseup',function(){isDragging=false;});
canvas.addEventListener('wheel',function(e){
e.preventDefault();
zoom*=e.deltaY>0?0.9:1.1;
zoom=Math.max(0.3,Math.min(3,zoom));
render();
});
})();
