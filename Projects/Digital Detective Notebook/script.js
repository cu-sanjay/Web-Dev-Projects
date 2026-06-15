(function(){'use strict';
const canvas=document.getElementById('graph-canvas');
const ctx=canvas.getContext('2d');
const W=700,H=400;

function drawGraph(){
ctx.clearRect(0,0,W,H);
ctx.fillStyle='#0a0f1a';ctx.fillRect(0,0,W,H);
const nodes=[{x:350,y:60,label:'CCTV',color:'#ef4444'},{x:150,y:200,label:'Weapon',color:'#ef4444'},{x:550,y:200,label:'Letter',color:'#ef4444'},{x:200,y:340,label:'John Doe',color:'#3b82f6'},{x:500,y:340,label:'Jane Smith',color:'#3b82f6'}];
const edges=[[0,1],[0,2],[1,3],[2,4],[3,0]];
edges.forEach(([f,t])=>{
ctx.beginPath();ctx.strokeStyle='#334155';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
ctx.moveTo(nodes[f].x,nodes[f].y);ctx.lineTo(nodes[t].x,nodes[t].y);ctx.stroke();ctx.setLineDash([]);
});
nodes.forEach(n=>{
ctx.fillStyle=n.color+'20';ctx.strokeStyle=n.color;ctx.lineWidth=2;
ctx.beginPath();ctx.arc(n.x,n.y,20,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle=n.color;ctx.font='bold 10px ui-monospace,monospace';ctx.textAlign='center';
ctx.fillText(n.label,n.x,n.y+4);
});
}

document.querySelectorAll('.tab-btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
document.getElementById('tab-'+this.dataset.tab).classList.add('active');
if(this.dataset.tab==='graph')drawGraph();
});
});
document.getElementById('btn-add-clue').addEventListener('click',function(){
const name=prompt('Clue name:');
if(!name)return;
const list=document.getElementById('clue-list');
const d=document.createElement('div');d.className='clue-card';
d.innerHTML='<span class="clue-icon">📌</span><div><strong>'+name+'</strong><p>Added manually</p></div><span class="clue-tag">Custom</span>';
list.appendChild(d);
updateProgress();
});
document.getElementById('btn-add-suspect').addEventListener('click',function(){
const name=prompt('Suspect name:');
if(!name)return;
const cards=document.getElementById('suspect-cards');
const initials=name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const d=document.createElement('div');d.className='suspect-card';
d.innerHTML='<div class="suspect-avatar">'+initials+'</div><div><strong>'+name+'</strong><p>Motive: Unknown</p><p>Alibi: Unknown</p></div><span class="suspect-status">🔵 Person of Interest</span>';
cards.appendChild(d);
updateProgress();
});
function updateProgress(){
const clues=document.querySelectorAll('#clue-list .clue-card').length;
const suspects=document.querySelectorAll('#suspect-cards .suspect-card').length;
const connections=clues+suspects;
const pct=Math.min(100,Math.round((clues+suspects)/6*100));
document.getElementById('p-clues').textContent=clues;
document.getElementById('p-suspects').textContent=suspects;
document.getElementById('p-connections').textContent=connections;
document.getElementById('p-completion').textContent=pct+'%';
document.getElementById('progress-fill-lg').style.width=pct+'%';
document.getElementById('case-progress').textContent=clues+'/'+suspects;
}
drawGraph();
})();
