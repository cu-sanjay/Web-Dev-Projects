const state = {
  budget: 1000000,
  approval: 50,
  day: 1,
  maxDays: 30,
  votes: 0,
  log: [],
  sentiment: {
    overall: 50,
    youth: 50, suburban: 50, rural: 50, urban: 50,
    seniors: 50, undecided: 50,
  },
};

const ACTIONS = [
  { name: "TV Ad Campaign", cost: 80000, approval: 3, votes: 5000, desc: "Broadcast ads across key networks" },
  { name: "Rally in City", cost: 30000, approval: 2, votes: 3000, desc: "Hold a major rally in an urban center" },
  { name: "Door-to-Door Canvassing", cost: 15000, approval: 1, votes: 2000, desc: "Volunteers engage voters personally" },
  { name: "Social Media Blitz", cost: 10000, approval: 1, votes: 1500, desc: "Targeted digital campaign" },
  { name: "Town Hall Meeting", cost: 20000, approval: 4, votes: 1000, desc: "Answer questions from undecided voters" },
  { name: "Radio Interview", cost: 5000, approval: 1, votes: 800, desc: "Speak on popular talk radio" },
  { name: "Fundraising Dinner", cost: -40000, approval: 0, votes: 0, desc: "Raise funds from donors (gain budget)" },
  { name: "Opposition Research", cost: 25000, approval: 0, votes: 6000, desc: "Uncover weakness in opponent's record" },
  { name: "Get Out The Vote", cost: 40000, approval: 0, votes: 8000, desc: "Mobilize supporters on election day" },
];

const SPEECHES = {
  economy: { impact: { youth: 2, suburban: 3, rural: 2, seniors: 3, urban: 2 }, approval: 2 },
  healthcare: { impact: { youth: 3, suburban: 3, rural: 2, seniors: 4, urban: 3 }, approval: 3 },
  education: { impact: { youth: 4, suburban: 3, rural: 1, seniors: 1, urban: 3 }, approval: 2 },
  security: { impact: { youth: 1, suburban: 2, rural: 3, seniors: 4, urban: 1 }, approval: 2 },
  environment: { impact: { youth: 4, suburban: 3, rural: 1, seniors: 1, urban: 2 }, approval: 1 },
};

const NAMES = ["Urban voters","Suburban families","Rural communities","Young voters","Senior citizens","Undecided voters"];

const $=id=>document.getElementById(id);

function updateUI(){
  $('budgetVal').textContent='$'+state.budget.toLocaleString();
  $('approvalVal').textContent=state.approval+'%';
  $('approvalVal').style.color=state.approval>=60?'var(--green)':state.approval>=40?'var(--gold)':'var(--red)';
  $('dayVal').textContent=state.day+' / '+state.maxDays;
  $('votesVal').textContent=state.votes.toLocaleString();
  const fill=$('sentimentFill');
  fill.style.width=state.sentiment.overall+'%';
  const labels=['Hostile','Unfavorable','Neutral','Favorable','Adoring'];
  const idx=state.sentiment.overall<20?0:state.sentiment.overall<40?1:state.sentiment.overall<60?2:state.sentiment.overall<80?3:4;
  $('sentimentLabel').textContent=labels[idx];

  const demo=$('demographics');
  const groups=['youth','suburban','rural','urban','seniors','undecided'];
  demo.innerHTML=groups.map(g=>{
    const val=state.sentiment[g];
    const color=val>=60?'var(--green)':val>=40?'var(--gold)':'var(--red)';
    const label=g==='youth'?'Youth (18-29)':g==='suburban'?'Suburban':g==='rural'?'Rural':g==='urban'?'Urban':g==='seniors'?'Seniors (65+)':'Undecided';
    return `<div class="demo-row"><span class="label">${label}</span><span class="val" style="color:${color}">${val}%</span></div>`;
  }).join('');

  const acts=$('actionsList');
  acts.innerHTML=ACTIONS.map((a,i)=>{
    const affordable=a.cost<=0||a.cost<=state.budget;
    const canAct=state.day<state.maxDays;
    return `<button class="action-btn" data-idx="${i}" ${(!affordable||!canAct)?'disabled':''}>
      ${a.name} <span class="cost">${a.cost<0?'+$'+Math.abs(a.cost).toLocaleString():'$'+a.cost.toLocaleString()} · ${a.votes.toLocaleString()} votes · +${a.approval}% app.</span>
    </button>`;
  }).join('');
  acts.querySelectorAll('.action-btn').forEach(b=>b.addEventListener('click',()=>performAction(parseInt(b.dataset.idx))));
}

function performAction(idx){
  const a=ACTIONS[idx];
  if(a.cost>0&&a.cost>state.budget) return;
  if(state.day>=state.maxDays) return;
  state.budget-=a.cost;
  state.approval=Math.min(100,Math.max(0,state.approval+a.approval+Math.floor(Math.random()*3-1)));
  state.votes+=Math.floor(a.votes*(0.8+Math.random()*0.4));
  state.sentiment.overall=Math.min(100,Math.max(0,state.sentiment.overall+Math.floor(Math.random()*4-1)));
  state.day++;
  addLog(`Day ${state.day-1}: ${a.name}`, a.desc);
  randomEvent();
  updateUI();
  if(state.day>=state.maxDays) endCampaign();
}

function deliverSpeech(){
  const topic=$('speechTopic').value;
  const text=$('speechText').value.trim();
  if(!text){ addLog('Speech draft empty','Write something before delivering.'); return; }
  if(state.day>=state.maxDays) return;

  const sp=SPEECHES[topic];
  Object.keys(sp.impact).forEach(k=>{
    state.sentiment[k]=Math.min(100,Math.max(0,state.sentiment[k]+sp.impact[k]));
  });
  const avg=Object.values(state.sentiment).slice(0,5).reduce((a,b)=>a+b,0)/5;
  state.sentiment.overall=Math.round(avg);
  state.approval=Math.min(100,Math.max(0,state.approval+sp.approval+Math.floor(Math.random()*2)));
  state.day++;
  addLog(`Speech on ${topic}`, text.length>80?text.slice(0,80)+'...':text);
  $('speechText').value='';

  const log=$('speechLog');
  const entry=document.createElement('div');
  entry.className='speech-entry';
  entry.innerHTML=`<span class="topic">[${topic}]</span> "${text.length>60?text.slice(0,60)+'...':text}" <span class="impact">+${sp.approval}% approval</span>`;
  log.prepend(entry);
  if(log.children.length>5) log.removeChild(log.lastChild);

  randomEvent();
  updateUI();
  if(state.day>=state.maxDays) endCampaign();
}

function randomEvent(){
  const events=[
    { msg:"Endorsement from a local newspaper!", approval:2, votes:2000 },
    { msg:"Your opponent released a negative ad.", approval:-2, votes:-1000 },
    { msg:"A gaffe at a public event hurts your campaign.", approval:-3, votes:-1500 },
    { msg:"A celebrity endorses you!", approval:2, votes:3000 },
    { msg:"Debate performance praised by pundits.", approval:3, votes:2500 },
    { msg:"Bad weather reduces rally turnout.", approval:-1, votes:-500 },
    { msg:"A policy proposal gains national attention!", approval:3, votes:4000 },
    { msg:"Campaign staff error causes scheduling chaos.", approval:-1, votes:-500 },
  ];
  if(Math.random()<0.35){
    const e=events[Math.floor(Math.random()*events.length)];
    state.approval=Math.min(100,Math.max(0,state.approval+e.approval));
    state.votes=Math.max(0,state.votes+e.votes);
    addLog('Event: '+e.msg,'');
  }
}

function addLog(title,desc){
  const el=$('logEntries');
  const entry=document.createElement('div');
  entry.className='log-entry';
  entry.innerHTML=`<span class="day">D${state.day}</span> <span><strong>${title}</strong>${desc?' — '+desc:''}</span>`;
  el.prepend(entry);
  if(el.children.length>20) el.removeChild(el.lastChild);
}

function endCampaign(){
  const win=state.votes>=50000;
  const msg=win?'Congratulations! You won the election with '+state.votes.toLocaleString()+' votes!' : 'You lost the election with '+state.votes.toLocaleString()+' votes. Try a different strategy next time.';
  addLog('Election Day!',msg);
  $('actionsList').innerHTML=`<div class="empty-state" style="padding:30px">Campaign Over — ${msg}<br><br><button class="btn" onclick="location.reload()">Start New Campaign</button></div>`;
}

$('deliverSpeech').addEventListener('click',deliverSpeech);
updateUI();
addLog('Campaign Kickoff','Your campaign for office has begun. You have 30 days and $1,000,000.');
