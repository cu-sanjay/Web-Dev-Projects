(function(){'use strict';
const compDefs={
client:{label:'Client',color:'#3b82f6',icon:'📱'},
server:{label:'Server',color:'#f97316',icon:'🖥️'},
db:{label:'Database',color:'#22c55e',icon:'🗄️'},
cache:{label:'Cache',color:'#eab308',icon:'⚡'},
queue:{label:'Queue',color:'#a78bfa',icon:'📨'},
cdn:{label:'CDN',color:'#06b6d4',icon:'🌐'},
lb:{label:'Load\nBalancer',color:'#ec4899',icon:'⚖️'}
};
let nodes=[],edges=[],counter=0;
const svg=document.getElementById('diagram-svg');
const placeholder=document.getElementById('placeholder-text');

function render(){
svg.innerHTML='';
// background
const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
bg.setAttribute('width','800');bg.setAttribute('height','500');bg.setAttribute('fill','#0a0f1a');bg.setAttribute('rx','6');
svg.appendChild(bg);

if(nodes.length===0){
const t=document.createElementNS('http://www.w3.org/2000/svg','text');
t.setAttribute('x','400');t.setAttribute('y','250');t.setAttribute('text-anchor','middle');
t.setAttribute('font-family','monospace');t.setAttribute('font-size','14');t.setAttribute('fill','#334155');
t.textContent='Click components to build your architecture diagram';
svg.appendChild(t);
return;
}

// edges
edges.forEach(e=>{
const from=nodes.find(n=>n.id===e.from);const to=nodes.find(n=>n.id===e.to);
if(!from||!to)return;
const line=document.createElementNS('http://www.w3.org/2000/svg','line');
line.setAttribute('x1',from.x+60);line.setAttribute('y1',from.y+25);
line.setAttribute('x2',to.x);line.setAttribute('y2',to.y+25);
line.setAttribute('stroke','#334155');line.setAttribute('stroke-width','2');
line.setAttribute('class','diagram-arrow');
svg.appendChild(line);
});

// nodes
nodes.forEach(n=>{
const g=document.createElementNS('http://www.w3.org/2000/svg','g');
g.setAttribute('class','diagram-node');
g.dataset.id=n.id;

const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
rect.setAttribute('x',n.x);rect.setAttribute('y',n.y);
rect.setAttribute('width','120');rect.setAttribute('height','50');
rect.setAttribute('rx','6');rect.setAttribute('fill',n.color+'20');
rect.setAttribute('stroke',n.color);rect.setAttribute('stroke-width','2');
g.appendChild(rect);

const label=n.label.split('\n');
label.forEach((l,i)=>{
const t=document.createElementNS('http://www.w3.org/2000/svg','text');
t.setAttribute('x',n.x+60);t.setAttribute('y',n.y+25+((label.length>1)?(i-0.5)*14:0));
t.setAttribute('text-anchor','middle');t.setAttribute('dominant-baseline','middle');
t.setAttribute('font-family','monospace');t.setAttribute('font-size','11');
t.setAttribute('fill',n.color);t.setAttribute('font-weight','600');
t.textContent=l;
g.appendChild(t);
});

g.addEventListener('click',function(){
const id=parseInt(this.dataset.id);
const i=nodes.findIndex(n=>n.id===id);
if(i>-1){nodes.splice(i,1);edges=edges.filter(e=>e.from!==id&&e.to!==id);render();}
});

svg.appendChild(g);
});
document.getElementById('status').textContent=nodes.length+' components · Right-click to remove';
}

function placeComponent(type){
const def=compDefs[type];
if(!def)return;
counter++;
const existing=nodes.filter(n=>n.type===type).length;
const x=50+Math.floor(counter%6)*120;
const y=50+Math.floor(counter/6)*80;
if(y>420)return;
nodes.push({id:counter,type,label:def.label,color:def.color,x,y});
if(nodes.length>1){edges.push({from:nodes[nodes.length-2].id,to:counter});}
render();
}

function loadPreset(preset){
nodes=[];edges=[];counter=0;
const presets={
chatapp:[
{type:'client',id:1,x:20,y:30},{type:'lb',id:2,x:20,y:140},{type:'server',id:3,x:20,y:250},{type:'server',id:4,x:160,y:250},{type:'db',id:5,x:20,y:360},{type:'cache',id:6,x:160,y:360}
],
ecom:[
{type:'client',id:1,x:20,y:30},{type:'cdn',id:2,x:170,y:30},{type:'lb',id:3,x:20,y:140},{type:'server',id:4,x:20,y:250},{type:'cache',id:5,x:170,y:250},{type:'db',id:6,x:20,y:360},{type:'queue',id:7,x:170,y:360}
],
video:[
{type:'client',id:1,x:20,y:30},{type:'cdn',id:2,x:170,y:30},{type:'lb',id:3,x:20,y:140},{type:'server',id:4,x:20,y:250},{type:'server',id:5,x:170,y:250},{type:'db',id:6,x:20,y:360},{type:'cache',id:7,x:170,y:360},{type:'queue',id:8,x:20,y:460}
]
};
const data=presets[preset];
if(!data)return;
counter=data.length;
data.forEach((d,i)=>{
const def=compDefs[d.type];
if(def)nodes.push({id:d.id,type:d.type,label:def.label,color:def.color,x:d.x,y:d.y});
});
edges=[];
for(let i=1;i<data.length;i++){edges.push({from:data[i-1].id,to:data[i].id});}
render();
}

document.querySelectorAll('.comp-btn').forEach(btn=>{
btn.addEventListener('click',function(){placeComponent(this.dataset.comp);});
});
document.querySelectorAll('.preset-btn').forEach(btn=>{
btn.addEventListener('click',function(){loadPreset(this.dataset.preset);});
});
document.getElementById('btn-clear').addEventListener('click',function(){nodes=[];edges=[];counter=0;render();});
document.getElementById('btn-export').addEventListener('click',function(){
if(nodes.length===0){alert('Add some components first!');return;}
let txt='Architecture Diagram:\n';
nodes.forEach(n=>{txt+=`- ${n.label} (${n.x},${n.y})\n`;});
txt+='\nConnections:\n';
edges.forEach(e=>{const fn=nodes.find(n=>n.id===e.from);const tn=nodes.find(n=>n.id===e.to);if(fn&&tn)txt+=`${fn.label} → ${tn.label}\n`;});
alert(txt);
});
render();
})();
