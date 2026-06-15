(function(){'use strict';
const artifacts={
vase:{icon:'🏺',name:'Greek Vase',desc:'Black-figure pottery amphora depicting scenes from Greek mythology, c. 520 BCE'},
statue:{icon:'🗿',name:'Marble Statue',desc:'Hellenistic marble sculpture of a standing figure, Roman copy of Greek original'},
coin:{icon:'🪙',name:'Ancient Coin',desc:'Silver tetradrachm from Athens, featuring Athena and an owl, c. 450 BCE'},
scroll:{icon:'📜',name:'Papyrus Scroll',desc:'Fragment of a Greek philosophical text on papyrus, possibly from the Library of Alexandria'},
armor:{icon:'⚔️',name:'Bronze Armor',desc:'Corinthian bronze helmet and greaves from the Persian Wars period, c. 480 BCE'},
jewelry:{icon:'💍',name:'Gold Jewelry',desc:'Hellenistic gold earrings and pendant, intricate filigree work from 3rd century BCE'}
};
let slots=[null,null,null,null];
function renderSlots(){
const grid=document.getElementById('exhibit-grid');
grid.innerHTML='';
const count=slots.filter(s=>s!==null).length;
document.getElementById('artifact-count').textContent=count+' artifacts';
for(let i=0;i<4;i++){
const div=document.createElement('div');
div.className='exhibit-slot'+(slots[i]?' filled':'');
div.dataset.idx=i;
if(slots[i]){
const a=slots[i];
div.innerHTML='<div class="slot-inner"><div class="slot-artifact-icon">'+a.icon+'</div><div class="slot-artifact-name">'+a.name+'</div><div class="slot-artifact-desc">'+a.desc+'</div><button class="slot-remove">×</button></div>';
const removeBtn=div.querySelector('.slot-remove');
removeBtn.addEventListener('click',function(e){e.stopPropagation();slots[i]=null;renderSlots();});
}else{
div.innerHTML='<div class="slot-inner empty"><span class="slot-icon">➕</span><span>Add Artifact</span></div>';
}
grid.appendChild(div);
}
}
document.querySelectorAll('.artifact-btn').forEach(btn=>{
btn.addEventListener('click',function(){
const key=this.dataset.art;
const a=artifacts[key];
if(!a)return;
const emptyIdx=slots.findIndex(s=>s===null);
if(emptyIdx===-1){alert('Exhibit is full! Remove an artifact first.');return;}
slots[emptyIdx]=a;
renderSlots();
});
});
document.getElementById('btn-create').addEventListener('click',function(){
const name=document.getElementById('exhibit-name').value||'Untitled';
const theme=document.getElementById('exhibit-theme');
const themeText=theme.options[theme.selectedIndex].text;
const count=slots.filter(s=>s!==null).length;
if(count===0){alert('Add at least one artifact to create an exhibit!');return;}
const msg='🏛️ Exhibit Created!\n\nTitle: '+name+'\nTheme: '+themeText+'\nArtifacts: '+count+'\n\nExhibit is now live in the virtual gallery.';
alert(msg);
});
document.getElementById('exhibit-name').addEventListener('input',function(){
document.getElementById('exhibit-title').textContent=this.value||'Untitled';
});
document.getElementById('exhibit-theme').addEventListener('change',function(){
const sel=this;const txt=sel.options[sel.selectedIndex].text;
document.getElementById('exhibit-theme-label').textContent=txt;
});
renderSlots();
})();
