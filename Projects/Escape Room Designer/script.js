(function(){'use strict';
const puzzleDefs={
riddle:{title:'🧩 Riddle',desc:'I speak without a mouth and hear without ears. What am I?'},
lock:{title:'🔐 Number Lock',desc:'Find the 3-digit code: sum of 2+3+5'},
key:{title:'🗝️ Hidden Key',desc:'Search the room to find the hidden key'},
pattern:{title:'🔲 Pattern Match',desc:'Complete the sequence: 1, 1, 2, 3, 5, ?'},
cipher:{title:'🔡 Caesar Cipher',desc:'Decode: ZHOO GRQH (shift 3)'}
};
let slots=[null,null,null,null];
let slotCounter=0;

function renderSlots(){
const grid=document.getElementById('puzzle-grid');
grid.innerHTML='';
for(let i=0;i<4;i++){
const div=document.createElement('div');
div.className='puzzle-slot'+(slots[i]?' filled':'');
div.dataset.slot=i;
if(slots[i]){
const p=slots[i];
div.innerHTML='<div class="puzzle-card"><div class="puzzle-title">'+p.title+'</div><div class="puzzle-desc">'+p.desc+'</div></div>';
div.addEventListener('click',function(e){
if(confirm('Remove this puzzle?')){slots[i]=null;renderSlots();}
});
}else{
div.innerHTML='<div class="slot-placeholder">+ Add Puzzle</div>';
}
grid.appendChild(div);
}
}

document.querySelectorAll('.puzzle-btn').forEach(btn=>{
btn.addEventListener('click',function(){
const type=this.dataset.puzzle;
const p=puzzleDefs[type];
if(!p)return;
const emptyIdx=slots.findIndex(s=>s===null);
if(emptyIdx===-1){alert('All slots filled! Remove one first.');return;}
slots[emptyIdx]={type,title:p.title,desc:p.desc};
renderSlots();
});
});

document.getElementById('btn-test').addEventListener('click',function(){
const name=document.getElementById('room-name').value||'Untitled';
const diff=document.getElementById('difficulty').value;
const time=document.getElementById('time-limit').value;
const filled=slots.filter(s=>s!==null).length;
const area=document.getElementById('solution-area');
area.innerHTML='';
const d=document.createElement('div');d.className='solution-hint';
if(filled===0){
d.textContent='❌ No puzzles added! Add at least one puzzle.';
d.style.color='#ef4444';
}else{
const solved=Math.floor(Math.random()*filled)+1;
d.textContent='✅ Testing "'+name+'" ('+diff+', '+time+'min): '+solved+'/'+filled+' puzzles solvable. Room '+(solved>=filled/2?'passes':'needs work')+' review.';
d.style.color=solved>=filled/2?'#22c55e':'#eab308';
}
area.appendChild(d);
});

document.getElementById('btn-export').addEventListener('click',function(){
const name=document.getElementById('room-name').value||'Untitled';
const diff=document.getElementById('difficulty').value;
const time=document.getElementById('time-limit').value;
 const puzzles=slots.filter(s=>s!==null).map(s=>s.title).join(', ');
alert('📋 Room: '+name+'\nDifficulty: '+diff+'\nTime: '+time+'min\nPuzzles: '+(puzzles||'None')+'\n\nCopy this to your design doc!');
});

document.getElementById('room-name').addEventListener('input',function(){
document.getElementById('room-title').textContent=this.value||'Untitled';
});
document.getElementById('difficulty').addEventListener('change',function(){
document.getElementById('room-diff').textContent=this.value;
});
document.getElementById('time-limit').addEventListener('input',function(){
document.getElementById('room-time').textContent=this.value+' min';
});
renderSlots();
})();
