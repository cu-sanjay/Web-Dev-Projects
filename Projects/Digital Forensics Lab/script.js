(function(){'use strict';
const data={
image1:{
sig:'89 50 4E 47',type:'PNG Image',analysis:'File signature: 89 50 4E 47 → PNG image. No corruption detected. EXIF metadata present.',
hex:['89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52','00 00 01 90 00 00 00 C8 08 02 00 00 00 7C 4B 3F','FF D8 FF E0 00 10 4A 46 49 46 00 01 01 01 00 48','73 74 64 41 63 74 69 6F 6E 20 6F 66 20 65 76 69'],
ascii:'.PNG........IHDN.........C?.....JFIF.....HHstdAction of evi'},
log1:{
sig:'0A 0D 0D 0A',type:'Log File',analysis:'Log file with standard line breaks. Contains 127 entries. Suspicious IP: 192.168.1.105',
hex:['0A 0D 0D 0A 32 30 32 34 2D 30 31 2D 31 35 20 31','34 3A 32 33 3A 31 32 20 20 31 39 32 2E 31 36 38','2E 31 2E 31 30 35 20 2D 20 46 41 49 4C 45 44 20','4C 4F 47 49 4E 20 61 74 74 65 6D 70 74 20 66 6F'],
ascii:'....2024-01-15 14:23:12 192.168.1.105 - FAILED LOGIN attemfo'},
mem1:{
sig:'4D 53 41 4D',type:'Memory Dump',analysis:'Memory dump captured from Windows 11. 3 active processes. Network connection to 10.0.0.5:443',
hex:['4D 53 41 4D 44 55 4D 50 56 31 2E 30 00 00 00 00','10 00 00 00 50 72 6F 63 65 73 73 20 49 44 3A 20','31 32 33 34 20 2D 20 63 68 72 6F 6D 65 2E 65 78','65 00 00 4E 65 74 77 6F 72 6B 20 74 6F 20 31 30'],
ascii:'MSAMDUMVP1.0....Process ID: 1234 - chrome.exe..Network to 10'},
usb1:{
sig:'EB 3C 90 2E',type:'USB Image (FAT32)',analysis:'USB drive formatted as FAT32. Contains 23 files. 2 deleted files potentially recoverable.',
hex:['EB 3C 90 2E 4D 53 44 4F 53 35 2E 30 00 02 08 20','00 02 00 00 00 00 F8 00 00 3F 00 FF 00 00 00 00','52 4F 4F 54 20 44 49 52 20 20 20 20 20 20 20 20','44 45 4C 45 54 45 44 20 66 69 6C 65 20 66 6F 75'],
ascii:'.<..MSDOS5.0..... .....x..?.......ROOT DIR        DELETED file fou'}
};
const metadata={
image1:[{label:'Dimensions',value:'400×200'},{label:'Color Depth',value:'24-bit'},{label:'Created',value:'2024-03-15'},{label:'Modified',value:'2024-06-20'},{label:'Camera',value:'Canon EOS R5'},{label:'GPS',value:'40.7128° N'}],
log1:[{label:'Entries',value:'127'},{label:'Date Range',value:'Jan-Jun 2024'},{label:'Unique IPs',value:'14'},{label:'Suspicious',value:'3 events'},{label:'File Size',value:'12.4 KB'},{label:'Encoding',value:'UTF-8'}],
mem1:[{label:'OS',value:'Windows 11'},{label:'RAM Size',value:'16 GB'},{label:'Processes',value:'78'},{label:'Active Net',value:'5 connections'},{label:'Dump Type',value:'Full'},{label:'Hash',value:'SHA256'}],
usb1:[{label:'Filesystem',value:'FAT32'},{label:'Capacity',value:'8 GB'},{label:'Used',value:'3.2 GB'},{label:'Files',value:'23'},{label:'Deleted',value:'2 recoverable'},{label:'Serial',value:'USB-2024-03'}]
};
const timeline={
image1:[{time:'2024-06-20 14:30',desc:'File created'}],
log1:[{time:'2024-01-15 14:23',desc:'Suspicious login from 192.168.1.105'},{time:'2024-01-15 14:25',desc:'Brute force attempt detected'},{time:'2024-01-15 14:30',desc:'Access granted to unknown user'}],
mem1:[{time:'2024-06-15 09:00',desc:'System boot'},{time:'2024-06-15 09:05',desc:'Chrome.exe started'},{time:'2024-06-15 09:10',desc:'Connection to 10.0.0.5:443 established'}],
usb1:[{time:'2024-03-01 10:00',desc:'USB device connected'},{time:'2024-03-15 16:45',desc:'File "confidential.pdf" deleted'},{time:'2024-06-20 11:00',desc:'USB device disconnected'}]
};
let currentFile='image1',currentTool='hex';
function renderHex(){
document.getElementById('hex-rows').innerHTML='';
const d=data[currentFile];
if(!d)return;
d.hex.forEach((row,i)=>{
const div=document.createElement('div');div.className='hex-row';
div.innerHTML='<span class="hex-offset">'+(i*16).toString(16).padStart(8,'0')+'</span><span class="hex-bytes">'+row+'</span><span class="hex-ascii">'+(d.ascii.split(' ')[i]||'')+'</span>';
document.getElementById('hex-rows').appendChild(div);
});
document.getElementById('hex-analysis-text').textContent=d.analysis;
}
function renderTimeline(){
const el=document.getElementById('timeline-events');el.innerHTML='';
const tl=timeline[currentFile]||[];
tl.forEach(t=>{
const div=document.createElement('div');div.className='timeline-item';
div.innerHTML='<span class="timeline-time">'+t.time+'</span><span class="timeline-desc">'+t.desc+'</span>';
el.appendChild(div);});
if(tl.length===0)el.innerHTML='<div style="color:var(--muted);font-size:11px">No timeline events for this file.</div>';
}
function renderMetadata(){
const el=document.getElementById('meta-grid');el.innerHTML='';
const md=metadata[currentFile]||[];
md.forEach(m=>{
const div=document.createElement('div');div.className='meta-item';
div.innerHTML='<span class="meta-label">'+m.label+'</span><span class="meta-value">'+m.value+'</span>';
el.appendChild(div);});
if(md.length===0)el.innerHTML='<div style="color:var(--muted);font-size:11px">No metadata available.</div>';
}
function renderRecovery(){
const recs={image1:['deleted_photo_001.png','backup_old.png'],log1:[],mem1:[],usb1:['confidential.pdf','notes.txt']};
const el=document.getElementById('recovered-files');el.innerHTML='';
const files=recs[currentFile]||[];
files.forEach(f=>{
const div=document.createElement('div');div.className='rec-file';
div.innerHTML='<span>'+f+'</span><span class="rec-status">Recoverable</span>';
el.appendChild(div);});
const pct=files.length*25;
document.getElementById('recovery-fill').style.width=Math.min(pct,100)+'%';
}
function switchTool(tool){
currentTool=tool;
document.querySelectorAll('.tool-btn').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));
const names={hex:'Hex Viewer',timeline:'Timeline',metadata:'Metadata',recovery:'File Recovery'};
document.getElementById('active-tool').textContent=names[tool]||'Tool';
['hex-view','timeline-view','metadata-view','recovery-view'].forEach(id=>document.getElementById(id).classList.toggle('hidden',id!==tool+'-view'));
if(tool==='hex')renderHex();
else if(tool==='timeline')renderTimeline();
else if(tool==='metadata')renderMetadata();
else if(tool==='recovery')renderRecovery();
}
document.querySelectorAll('.tool-btn').forEach(btn=>btn.addEventListener('click',function(){switchTool(this.dataset.tool);}));
document.querySelectorAll('.file-item').forEach(item=>item.addEventListener('click',function(){
document.querySelectorAll('.file-item').forEach(f=>f.classList.remove('active'));
this.classList.add('active');
currentFile=this.dataset.file;
switchTool(currentTool);
}));
document.getElementById('btn-export').addEventListener('click',()=>alert('Report exported as DF-2024-0042_report.pdf'));
switchTool('hex');
})();
