(function(){'use strict';
const canvas=document.getElementById('viz-canvas');
const ctx=canvas.getContext('2d');
const W=900,H=500;

const patterns={
microservices:{
name:'Microservices Architecture',
desc:'Decompose applications into small, independent services that communicate over a network.',
complexity:'High',scalability:'Excellent',team:'Medium+',
nodes:[{x:60,y:100,label:'API Gateway',color:'#a78bfa',type:'gateway'},
{x:220,y:40,label:'Auth Service',color:'#3b82f6',type:'service'},
{x:220,y:160,label:'User Service',color:'#3b82f6',type:'service'},
{x:420,y:40,label:'Order Service',color:'#3b82f6',type:'service'},
{x:420,y:160,label:'Payment Service',color:'#3b82f6',type:'service'},
{x:620,y:40,label:'Notification',color:'#3b82f6',type:'service'},
{x:620,y:160,label:'Inventory',color:'#3b82f6',type:'service'},
{x:820,y:100,label:'Queue',color:'#22c55e',type:'queue'},
{x:220,y:280,label:'User DB',color:'#f97316',type:'db'},
{x:420,y:280,label:'Order DB',color:'#f97316',type:'db'},
{x:620,y:280,label:'Cache',color:'#ef4444',type:'cache'}],
edges:[[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[3,7],[4,7],[5,7],[6,7],[2,8],[3,9],[4,9],[6,10]]
},
monolith:{
name:'Monolithic Architecture',
desc:'Single unified codebase handling all functionality. Simple to develop but hard to scale.',
complexity:'Low',scalability:'Limited',team:'Small',
nodes:[{x:350,y:180,label:'Monolithic App',color:'#3b82f6',type:'service'},
{x:150,y:350,label:'Database',color:'#f97316',type:'db'},
{x:550,y:350,label:'Cache',color:'#ef4444',type:'cache'}],
edges:[[0,1],[0,2]]
},
layered:{
name:'Layered Architecture',
desc:'Organize code into horizontal layers (presentation, business, persistence). Each layer communicates only with adjacent layers.',
complexity:'Low',scalability:'Medium',team:'Small-Medium',
nodes:[{x:350,y:60,label:'Presentation',color:'#3b82f6',type:'service'},
{x:350,y:170,label:'Business Logic',color:'#a78bfa',type:'gateway'},
{x:350,y:280,label:'Persistence',color:'#22c55e',type:'queue'},
{x:150,y:400,label:'User DB',color:'#f97316',type:'db'},
{x:550,y:400,label:'Report DB',color:'#f97316',type:'db'}],
edges:[[0,1],[1,2],[2,3],[2,4]]
},
event:{
name:'Event-Driven Architecture',
desc:'Components communicate via events through a message broker. Highly decoupled and scalable.',
complexity:'High',scalability:'Excellent',team:'Medium+',
nodes:[{x:60,y:250,label:'Producer A',color:'#3b82f6',type:'service'},
{x:60,y:400,label:'Producer B',color:'#3b82f6',type:'service'},
{x:450,y:250,label:'Event Bus',color:'#22c55e',type:'queue'},
{x:820,y:150,label:'Consumer A',color:'#a78bfa',type:'gateway'},
{x:820,y:250,label:'Consumer B',color:'#a78bfa',type:'gateway'},
{x:820,y:350,label:'Consumer C',color:'#a78bfa',type:'gateway'}],
edges:[[0,2],[1,2],[2,3],[2,4],[2,5]]
},
hexagonal:{
name:'Hexagonal Architecture',
desc:'Core business logic is isolated from external concerns via ports and adapters. Also known as Ports & Adapters.',
complexity:'Medium',scalability:'Medium',team:'Medium',
nodes:[{x:450,y:250,label:'Core Domain',color:'#ef4444',type:'cache'},
{x:100,y:100,label:'REST Adapter',color:'#3b82f6',type:'service'},
{x:100,y:400,label:'DB Adapter',color:'#f97316',type:'db'},
{x:800,y:100,label:'Queue Adapter',color:'#22c55e',type:'queue'},
{x:800,y:400,label:'UI Adapter',color:'#3b82f6',type:'service'}],
edges:[[1,0],[2,0],[3,0],[4,0]]
},
cqrs:{
name:'CQRS Architecture',
desc:'Separate read and write operations into different models. Optimize queries and commands independently.',
complexity:'High',scalability:'Excellent',team:'Medium+',
nodes:[{x:60,y:250,label:'Command',color:'#3b82f6',type:'service'},
{x:250,y:100,label:'Write Model',color:'#f97316',type:'db'},
{x:250,y:400,label:'Read Model',color:'#22c55e',type:'queue'},
{x:500,y:250,label:'Event Store',color:'#a78bfa',type:'gateway'},
{x:750,y:100,label:'Query',color:'#3b82f6',type:'service'},
{x:750,y:400,label:'Materialized',color:'#ef4444',type:'cache'}],
edges:[[0,1],[0,3],[3,2],[2,4],[2,5]]
}
};

let currentPattern='microservices';

function drawPattern(key){
const pat=patterns[key];
if(!pat)return;
ctx.clearRect(0,0,W,H);
ctx.fillStyle='#0a0f1a';ctx.fillRect(0,0,W,H);

// edges
pat.edges.forEach(([from,to])=>{
const f=pat.nodes[from],t=pat.nodes[to];
if(!f||!t)return;
ctx.beginPath();ctx.strokeStyle='#334155';ctx.lineWidth=2;
ctx.moveTo(f.x+40,f.y+15);ctx.lineTo(t.x,t.y+15);
ctx.stroke();
});

// nodes
pat.nodes.forEach(n=>{
ctx.fillStyle=n.color+'20';ctx.strokeStyle=n.color;ctx.lineWidth=2;
ctx.beginPath();ctx.roundRect(n.x,n.y,80,30,6);
ctx.fill();ctx.stroke();

ctx.fillStyle=n.color;ctx.font='bold 10px ui-monospace,monospace';ctx.textAlign='center';
ctx.fillText(n.label,n.x+40,n.y+19);
});

document.getElementById('viz-name').textContent=pat.name;

// info
document.getElementById('pat-name').textContent=currentPattern.charAt(0).toUpperCase()+currentPattern.slice(1);
document.getElementById('pat-desc').textContent=pat.desc;
const cs=document.getElementById('pat-complexity');
cs.textContent=pat.complexity;cs.className=pat.complexity==='High'?'stat-high':pat.complexity==='Medium'?'stat-med':'stat-low';
const ss=document.getElementById('pat-scalability');
ss.textContent=pat.scalability;ss.className=pat.scalability==='Excellent'||pat.scalability==='Excellent'?'stat-high':'stat-med';
const ts=document.getElementById('pat-team');
ts.textContent=pat.team;ts.className=pat.team==='Medium+||Large'?'stat-high':pat.team==='Medium'?'stat-med':'stat-low';
}

// roundRect polyfill for canvas
if(!CanvasRenderingContext2D.prototype.roundRect){
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
this.moveTo(x+r,y);this.lineTo(x+w-r,y);this.quadraticCurveTo(x+w,y,x+w,y+r);
this.lineTo(x+w,y+h-r);this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
this.lineTo(x+r,y+h);this.quadraticCurveTo(x,y+h,x,y+h-r);
this.lineTo(x,y+r);this.quadraticCurveTo(x,y,x+r,y);
};
}

document.querySelectorAll('.pattern-btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.pattern-btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
currentPattern=this.dataset.pattern;
drawPattern(currentPattern);
});
});

document.getElementById('btn-legend').addEventListener('click',function(){
const l=document.getElementById('legend-bar');
l.classList.toggle('hidden');
});

drawPattern('microservices');
})();
