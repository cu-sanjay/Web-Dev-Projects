(function(){'use strict';
const challenges=[
{title:'Challenge 1: Port Scan',desc:'Scan the network to find open ports. Use: scan [ip]','hint':'Try: scan 192.168.1.1',answer:'scan 192.168.1.1',openPorts:[22,80,443]},
{title:'Challenge 2: Decrypt Password',desc:'Decrypt the base64 encoded password. Use: decode [string]','hint':'Try: decode cGFzc3dvcmQxMjM=',answer:'decode cGFzc3dvcmQxMjM='},
{title:'Challenge 3: SQL Injection',desc:"Inject SQL to bypass login. Use: inject ' [payload]",'hint':"Try: inject ' OR 1=1 --",answer:"inject ' OR 1=1 --"},
{title:'Challenge 4: Reverse Binary',desc:'Reverse the hex string to find the secret. Use: reverse [hex]','hint':'Try: reverse 48656C6C6F',answer:'reverse 48656C6C6F'},
{title:'Challenge 5: Root Access',desc:'Escalate privileges to root. Use: sudo [command]','hint':'Try: sudo whoami',answer:'sudo whoami'}
];
let currentChallenge=0;
let completed=[false,false,false,false,false];
let timer=900;
let timerInterval=null;

function startTimer(){
if(timerInterval)return;
timerInterval=setInterval(()=>{
timer--;
const m=Math.floor(timer/60),s=timer%60;
document.getElementById('timer-display').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
if(timer<=60)document.getElementById('timer-display').style.color='#ef4444';
if(timer<=0){clearInterval(timerInterval);addOutput('TIME EXPIRED. System locked.','error');}
},1000);
}

function addOutput(text,cls=''){
const out=document.getElementById('terminal-output');
const d=document.createElement('div');d.className='line'+(cls?' '+cls:'');d.textContent=text;out.appendChild(d);
out.scrollTop=out.scrollHeight;
}

function renderChallenge(){
const ch=challenges[currentChallenge];
document.getElementById('challenge-title').textContent=ch.title;
document.getElementById('challenge-desc').textContent=ch.desc;
document.getElementById('challenge-status').textContent=completed[currentChallenge]?'✅ Done':'🔒 Locked';
document.getElementById('challenge-status').className='challenge-status'+(completed[currentChallenge]?' done':' locked');
document.getElementById('progress-fill').style.width=(completed.filter(Boolean).length/5*100)+'%';
// reset ports
document.querySelectorAll('.port').forEach(p=>p.classList.remove('open'));
if(currentChallenge===0){
document.getElementById('port-grid').style.display='grid';
document.querySelectorAll('.port').forEach(p=>{
const port=parseInt(p.dataset.port);
if(challenges[0].openPorts.includes(port))p.classList.add('open');
});
}else{
document.getElementById('port-grid').style.display='none';
}
}
function nextChallenge(){
if(currentChallenge<4){currentChallenge++;renderChallenge();addOutput('Proceeding to '+challenges[currentChallenge].title);}else{addOutput('🎉 All challenges complete! You escaped!','success');}
}
document.getElementById('terminal-input').addEventListener('keydown',function(e){
if(e.key!=='Enter')return;
const cmd=this.value.trim().toLowerCase();
this.value='';
addOutput('$ '+cmd);
if(cmd==='help'){addOutput('Commands: scan [ip], decode [str], inject [payload], reverse [hex], sudo [cmd], help, clear');document.getElementById('hint-text').textContent=challenges[Math.min(currentChallenge,challenges.length-1)].hint;}
else if(cmd==='clear'){document.getElementById('terminal-output').innerHTML='';}
else if(completed[currentChallenge]){addOutput('Challenge already completed.','error');nextChallenge();}
else{
const ch=challenges[currentChallenge];
if(cmd===ch.answer){completed[currentChallenge]=true;addOutput('SUCCESS. Challenge complete!','success');renderChallenge();nextChallenge();}
else{addOutput('Incorrect. Try again.','error');}
}
});
renderChallenge();
startTimer();
// Click on ports for visual feedback
document.querySelectorAll('.port').forEach(p=>{p.addEventListener('click',function(){if(this.classList.contains('open')){addOutput('Port '+this.dataset.port+' is OPEN.','success');}else{addOutput('Port '+this.dataset.port+' is closed.','error');}});});
})();
