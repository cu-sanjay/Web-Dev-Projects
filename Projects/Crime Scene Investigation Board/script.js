(function(){'use strict';
const board=document.getElementById('board');
const svg=document.getElementById('board-svg');
let items=[],connections=[],idCounter=0;
const icons={fingerprint:'🖐️',footprint:'👣',dna:'🧬',weapon:'🔪',letter:'📝',photo:'📸'};

function render(){
svg.innerHTML='';
// resize svg to match board
const rect=board.getBoundingClientRect();
svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
// connections
connections.forEach(c=>{
const from=items.find(i=>i.id===c.from);
const to=items.find(i=>i.id===c.to);
if(!from||!to)return;
const line=document.createElementNS('http://www.w3.org/2000/svg','line');
line.setAttribute('x1',from.x+from.el.offsetWidth/2);
line.setAttribute('y1',from.y+from.el.offsetHeight/2);
line.setAttribute('x2',to.x+to.el.offsetWidth/2);
line.setAttribute('y2',to.y+to.el.offsetHeight/2);
line.setAttribute('stroke','#ef4444');line.setAttribute('stroke-width','2');
line.setAttribute('stroke-dasharray','6 3');
line.setAttribute('opacity','0.5');
svg.appendChild(line);
});
}

function addItem(type,data,x,y){
const div=document.createElement('div');
div.className='board-item '+(type==='ev'?'evidence':'suspect '+(data==='john'?'john':data==='jane'?'jane':'bob'));
div.textContent=type==='ev'?icons[data]||'📌 '+data:'👤 '+data.charAt(0).toUpperCase()+data.slice(1)+' '+(data==='john'?'Doe':data==='jane'?'Smith':'Wilson');
div.style.left=x+'px';div.style.top=y+'px';
const id=++idCounter;
items.push({id,type,data,x,y,el:div});
const removeBtn=document.createElement('button');
removeBtn.className='remove-btn';removeBtn.textContent='×';
removeBtn.addEventListener('click',function(e){e.stopPropagation();const idx=items.findIndex(i=>i.id===id);if(idx>-1){items.splice(idx,1);connections=connections.filter(c=>c.from!==id&&c.to!==id);div.remove();render();}});
div.appendChild(removeBtn);
div.addEventListener('click',function(){
// toggle connection mode or just select
});
// drag
let dragging=false,startX,startY,origX,origY;
div.addEventListener('mousedown',function(e){
if(e.target===removeBtn)return;
dragging=true;startX=e.clientX;startY=e.clientY;
origX=parseFloat(div.style.left);origY=parseFloat(div.style.top);
div.style.zIndex=10;
});
document.addEventListener('mousemove',function(e){
if(!dragging)return;
const dx=e.clientX-startX,dy=e.clientY-startY;
div.style.left=(origX+dx)+'px';div.style.top=(origY+dy)+'px';
const item=items.find(i=>i.id===id);
if(item){item.x=origX+dx;item.y=origY+dy;}
render();
});
document.addEventListener('mouseup',function(){dragging=false;div.style.zIndex=2;});
board.appendChild(div);
// auto connect last 2 evidence
const evItems=items.filter(i=>i.type==='ev');
if(evItems.length>1){const last=evItems[evItems.length-1];const prev=evItems[evItems.length-2];if(last.id!==prev.id)connections.push({from:prev.id,to:last.id});}
render();
}

// drag from sidebar
document.querySelectorAll('.ev-item,.sus-item').forEach(el=>{
el.addEventListener('dragstart',function(e){
const isEv=this.classList.contains('ev-item');
e.dataTransfer.setData('text/plain',JSON.stringify({type:isEv?'ev':'sus',data:this.dataset.ev||this.dataset.sus}));
});
});
board.addEventListener('dragover',function(e){e.preventDefault();});
board.addEventListener('drop',function(e){
e.preventDefault();
const data=JSON.parse(e.dataTransfer.getData('text/plain'));
const rect=board.getBoundingClientRect();
const x=e.clientX-rect.left-40;
const y=e.clientY-rect.top-15;
addItem(data.type,data.data,x,y);
});

document.getElementById('btn-add-tl').addEventListener('click',function(){
const input=document.getElementById('tl-input');
const val=input.value.trim();
if(!val)return;
const div=document.createElement('div');div.className='tl-item';
div.textContent=val;
document.getElementById('tl-list').appendChild(div);
input.value='';
});
document.getElementById('btn-reset').addEventListener('click',function(){
document.querySelectorAll('.board-item').forEach(el=>el.remove());
items=[];connections=[];idCounter=0;
svg.innerHTML='';
});
})();
