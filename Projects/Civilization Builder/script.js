(function(){'use strict';
const GRID=6;
const buildings={
house:{cost:20,icon:'🏠',color:'#f97316',effect:{pop:2}},
farm:{cost:15,icon:'🌾',color:'#22c55e',effect:{food:5}},
mine:{cost:30,icon:'⛏️',color:'#a78bfa',effect:{gold:3}},
market:{cost:40,icon:'🏪',color:'#eab308',effect:{gold:6}},
barracks:{cost:50,icon:'⚔️',color:'#ef4444',effect:{pop:1,gold:-1}},
library:{cost:60,icon:'📚',color:'#3b82f6',effect:{gold:2,food:2}}
};
let state={
turn:1,
gold:100,
food:50,
population:10,
grid:Array(GRID*GRID).fill(null),
log:['Game started. Turn 1.']
};
function render(){
document.getElementById('turn-display').textContent=state.turn;
document.getElementById('gold-display').textContent=state.gold;
document.getElementById('food-display').textContent=state.food;
document.getElementById('pop-display').textContent=state.population;
const gridEl=document.getElementById('grid');
gridEl.innerHTML='';
state.grid.forEach((cell,i)=>{
const div=document.createElement('div');
div.className='cell'+(cell?' building-'+cell:'');
div.textContent=cell?buildings[cell].icon:'';
div.dataset.index=i;
div.addEventListener('click',function(){/* click handled via build */});
gridEl.appendChild(div);
});
const logEl=document.getElementById('game-log');
logEl.innerHTML='';
state.log.slice(-5).forEach(msg=>{
const d=document.createElement('div');d.className='log-entry';d.textContent=msg;logEl.appendChild(d);
});
}
function build(type){
const b=buildings[type];
if(!b)return;
if(state.gold<b.cost){state.log.push('Not enough gold!');render();return;}
state.gold-=b.cost;
// find empty cell or random
let emptyIdx=-1;
for(let i=0;i<state.grid.length;i++){if(!state.grid[i]){emptyIdx=i;break;}}
if(emptyIdx===-1){state.log.push('No empty land!');state.gold+=b.cost;render();return;}
state.grid[emptyIdx]=type;
state.log.push(`Built ${type} on plot ${emptyIdx+1}.`);
applyEffect(type);
render();
}
function applyEffect(type){
const b=buildings[type];
if(!b.effect)return;
state.gold+=(b.effect.gold||0);
state.food+=(b.effect.food||0);
state.population+=(b.effect.pop||0);
}
function nextTurn(){
state.turn++;
// passive income
state.gold+=Math.max(0,Math.floor(state.population*0.5));
state.food+=Math.max(0,Math.floor(state.population*0.3));
// consume food
state.food-=state.population;
if(state.food<0){
const starve=Math.min(state.population,Math.abs(state.food));
state.population-=starve;
state.food=0;
state.log.push(`${starve} people starved!`);
}
state.log.push(`Turn ${state.turn} started.`);
render();
}
function resetGame(){
state={turn:1,gold:100,food:50,population:10,grid:Array(GRID*GRID).fill(null),log:['Game restarted.']};
render();
}
document.querySelectorAll('.build-btn').forEach(btn=>{
btn.addEventListener('click',function(){build(this.dataset.building);});
});
document.getElementById('btn-next').addEventListener('click',nextTurn);
document.getElementById('btn-reset').addEventListener('click',resetGame);
render();
})();
