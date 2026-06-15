(function(){'use strict';
const civs={
mayan:{name:'Mayan Civilization',period:'2000 BCE - 900 CE',overview:'The Maya civilization flourished in Mesoamerica, known for its hieroglyphic script, advanced mathematics, and astronomical systems spanning present-day Mexico, Guatemala, Belize, Honduras, and El Salvador.',
facts:['📅 Advanced calendar system','🔤 Hieroglyphic writing','🏛️ Pyramid architecture','🔢 Concept of zero'],
achievements:['Developed the only fully developed writing system in pre-Columbian Americas','Created accurate calendars based on astronomical observations','Built monumental pyramids and cities like Tikal and Chichen Itza','Advanced mathematics including the concept of zero'],
mystery:'The Classic Maya collapse around 900 CE remains debated — causes include drought, overpopulation, deforestation, and political instability.'},
indus:{name:'Indus Valley Civilization',period:'3300 - 1300 BCE',overview:'One of the three great ancient civilizations of the Old World, the Indus Valley (Harappan) civilization flourished in South Asia with advanced urban planning and drainage systems.',
facts:['🏛️ Grid-based cities','💧 Advanced drainage','📦 Standardized weights','🔤 Undeciphered script'],
achievements:['Built well-planned cities with grid layouts and advanced drainage systems','Standardized weights and measures across vast distances','Developed one of the earliest writing systems still undeciphered','Extensive trade networks with Mesopotamia'],
mystery:'The Indus script remains undeciphered. The civilization declined around 1300 BCE, possibly due to climate change, river shifts, or invasions.'},
minoan:{name:'Minoan Civilization',period:'2700 - 1100 BCE',overview:'Europe\'s first advanced civilization, based on the island of Crete. Named after the legendary King Minos, known for the palace of Knossos and vibrant frescoes.',
facts:['🏛️ Palace of Knossos','🎨 Colorful frescoes','📜 Linear A script','🌊 Maritime trade'],
achievements:['Built the massive palace complex at Knossos with advanced plumbing','Created vibrant frescoes depicting daily life and nature','Developed Linear A script (still undeciphered)','Controlled Mediterranean trade routes'],
mystery:'The fate of the Minoans is debated — the Thera eruption (c. 1600 BCE) may have caused tsunamis and economic decline, leading to Mycenaean conquest.'},
atlantis:{name:'Atlantis',period:'Legendary (c. 9600 BCE)',overview:'First described by Plato in Timaeus and Critias, Atlantis was a powerful island civilization that supposedly sank in a single day and night of earthquakes and floods.',
facts:['📚 First described by Plato','🏗️ Advanced engineering','⚡ Legendary power','🌊 Sudden disappearance'],
achievements:['Described as possessing advanced technology and architecture','Said to have concentric ring canals and a powerful navy','Allegedly ruled by kings descended from Poseidon','Inspired countless theories and expeditions'],
mystery:'No archaeological evidence exists. Theories range from a fictional allegory to memories of the Minoan/Thera destruction or a real island in the Atlantic.'}
};

document.querySelectorAll('.civ-btn').forEach(btn=>{
btn.addEventListener('click',function(){
document.querySelectorAll('.civ-btn').forEach(b=>b.classList.remove('active'));
this.classList.add('active');
const c=civs[this.dataset.civ];
if(!c)return;
document.getElementById('civ-name').textContent=c.name;
document.getElementById('civ-period').textContent=c.period;
document.getElementById('civ-overview').textContent=c.overview;
document.getElementById('civ-mystery').textContent=c.mystery;
const fl=document.getElementById('fact-list');fl.innerHTML='';
c.facts.forEach(f=>{const d=document.createElement('div');d.className='fact';d.textContent=f;fl.appendChild(d);});
const al=document.getElementById('civ-achievements');al.innerHTML='';
c.achievements.forEach(a=>{const li=document.createElement('li');li.textContent=a;al.appendChild(li);});
});
});
})();
