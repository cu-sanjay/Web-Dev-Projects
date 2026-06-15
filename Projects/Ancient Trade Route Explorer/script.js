(function(){'use strict';
const routes={
silk:{name:'Silk Road',desc:'Connected China to the Mediterranean, facilitating trade of silk, spices, and ideas for over 1,500 years.',distance:'6,400 km',era:'130 BCE - 1453 CE',goods:'Silk, Spices, Paper, Porcelain',path:'M120 220 Q200 180 280 160 Q360 140 420 170 Q480 200 540 160 Q600 130 640 180',cities:[{x:120,y:220,label:"Chang'an"},{x:280,y:160,label:'Samarkand'},{x:420,y:170,label:'Baghdad'},{x:540,y:160,label:'Constantinople'},{x:640,y:180,label:'Rome'}]},
spice:{name:'Spice Route',desc:'Maritime trade network connecting Southeast Asia to East Africa and Europe, transporting valuable spices.',distance:'11,000 km',era:'200 BCE - 1500 CE',goods:'Pepper, Cinnamon, Nutmeg, Cloves',path:'M400 350 Q480 300 520 250 Q560 200 580 150 Q600 100 550 80 Q500 70 480 100',cities:[{x:400,y:350,label:'Malacca'},{x:520,y:250,label:'Calicut'},{x:580,y:150,label:'Aden'},{x:550,y:80,label:'Venice'}]},
incense:{name:'Incense Route',desc:'Overland trade route from Yemen to the Mediterranean, carrying frankincense and myrrh.',distance:'3,400 km',era:'1200 BCE - 600 CE',goods:'Frankincense, Myrrh, Spices',path:'M250 360 Q280 300 350 280 Q420 260 480 240 Q520 220 560 200',cities:[{x:250,y:360,label:'Yemen'},{x:350,y:280,label:'Mecca'},{x:480,y:240,label:'Petra'},{x:560,y:200,label:'Damascus'}]},
amber:{name:'Amber Road',desc:'Ancient trade route from the Baltic Sea to the Mediterranean, primarily for amber.',distance:'2,000 km',era:'1500 BCE - 500 CE',goods:'Amber, Furs, Honey, Wax',path:'M300 50 Q350 100 400 150 Q450 200 500 250 Q550 300 600 320',cities:[{x:300,y:50,label:'Baltic Sea'},{x:400,y:150,label:'Aquileia'},{x:500,y:250,label:'Rome'},{x:600,y:320,label:'Carthage'}]}
};

document.querySelectorAll('.route-btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.route-btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
const r=routes[this.dataset.route];
if(!r)return;
document.getElementById('route-name').textContent=r.name;
document.getElementById('route-desc').textContent=r.desc;
document.getElementById('route-dist').textContent=r.distance;
document.getElementById('route-era').textContent=r.era;
document.getElementById('route-goods').textContent=r.goods;
// update map
const svg=document.getElementById('route-map');
const path=svg.querySelector('.route-line');
path.setAttribute('d',r.path);
// update cities
svg.querySelectorAll('circle').forEach((c,i)=>{if(i>0)c.remove();});
svg.querySelectorAll('text').forEach((t,i)=>{if(i>0)t.remove();});
r.cities.forEach(c=>{
const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
circle.setAttribute('cx',c.x);circle.setAttribute('cy',c.y);circle.setAttribute('r','5');
circle.setAttribute('fill','#ef4444');svg.appendChild(circle);
const text=document.createElementNS('http://www.w3.org/2000/svg','text');
text.setAttribute('x',c.x-5);text.setAttribute('y',c.y-10);
text.setAttribute('font-size','8');text.setAttribute('fill','#64748b');
text.setAttribute('font-family','monospace');text.textContent=c.label;
svg.appendChild(text);
});
});
});
})();
