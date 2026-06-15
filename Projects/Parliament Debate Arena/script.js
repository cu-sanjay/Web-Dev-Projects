const state = {
  session: 1,
  govSeats: 0,
  oppSeats: 0,
  motionsPassed: 0,
  currentTopic: null,
  votes: { fors: 0, against: 0, abstain: 0 },
  voted: false,
  usedTopics: [],
  totalSeats: 435,
};

const TOPICS = [
  { title: "Climate Emergency Declaration", desc: "Declare a national climate emergency and commit to net-zero emissions by 2050 with $200B in green investments.", govArg: "This is an existential threat. We must act now with binding targets and substantial funding to secure our children's future.", oppArg: "While climate change is serious, this declaration is symbolic posturing. The $200B price tag will balloon deficits without concrete emission reduction guarantees." },
  { title: "Universal Basic Income Pilot", desc: "Launch a 3-year UBI pilot program providing $800/month to 50,000 citizens to study economic and social impacts.", govArg: "UBI is the future of social safety nets. This pilot will provide crucial data on how unconditional payments affect work, health, and community wellbeing.", oppArg: "This is an expensive experiment that will create dependency. We should focus on job creation and targeted assistance rather than giving money with no strings attached." },
  { title: "Digital Privacy Bill", desc: "Strengthen digital privacy protections, requiring explicit consent for data collection and imposing fines up to 4% of revenue for violations.", govArg: "Citizens deserve control over their personal data. Big tech has had free reign long enough. This bill puts people before profits.", oppArg: "While privacy matters, this bill's compliance costs will crush small businesses and startups. The 4% revenue fine is excessive and will stifle innovation." },
  { title: "National Health Service Expansion", desc: "Expand public healthcare coverage to include dental, vision, and mental health services with a $45B annual investment.", govArg: "Healthcare is a right, not a privilege. Dental and mental health are integral to overall wellbeing. This investment pays for itself in productivity gains.", oppArg: "The $45B annual cost is unsustainable. We should focus on making existing services efficient before expanding. This will require tax increases on the middle class." },
  { title: "Electoral Reform Act", desc: "Implement ranked-choice voting and automatic voter registration to increase participation and ensure majority-supported representation.", govArg: "Our democracy needs modernization. Ranked-choice voting eliminates strategic voting and ensures winners have majority support. Auto-registration will add millions of voters.", oppArg: "This is a power grab disguised as reform. Ranked-choice voting confuses voters and auto-registration risks fraud. Our current system works." },
  { title: "Housing First Initiative", desc: "Invest $30B in permanent supportive housing for the homeless, providing shelter plus mental health and job training services.", govArg: "Housing is the foundation for solving homelessness. The Housing First model has proven success rates above 80% in keeping people housed long-term.", oppArg: "We've spent billions on homelessness with little to show. This program doesn't address root causes like addiction and mental illness. We need mandatory treatment, not just housing." },
  { title: "AI Regulation Framework", desc: "Establish a regulatory framework for artificial intelligence requiring safety testing, transparency, and liability for AI-generated content.", govArg: "AI develops faster than our laws can keep up. We need a proactive framework ensuring safety and accountability before, not after, a catastrophe.", oppArg: "Regulation will stifle one of our most promising industries. Let innovation lead and address problems as they arise—not throttle progress with bureaucratic red tape." },
  { title: "Free College Tuition Act", desc: "Eliminate tuition at all public universities and community colleges, funded by a modest financial transactions tax.", govArg: "Education should be a pathway to opportunity, not lifelong debt. Free college will create a more skilled workforce and reduce economic inequality.", oppArg: "Free college means taxpayers subsidize the wealthy. The transactions tax will hurt retirement savings. We should target aid to those who need it, not universal free tuition." },
];

const $=id=>document.getElementById(id);

function initSeats(){
  state.govSeats=Math.floor(Math.random()*50+200);
  state.oppSeats=state.totalSeats-state.govSeats;
}

function addLog(msg){
  const el=$('logEntries');
  const e=document.createElement('div'); e.className='log-entry';
  e.innerHTML=`<span class="session">S${state.session}</span> ${msg}`;
  el.prepend(e);
  if(el.children.length>30) el.removeChild(el.lastChild);
}

function updateUI(){
  $('govSeats').textContent=state.govSeats;
  $('oppSeats').textContent=state.oppSeats;
  $('sessionVal').textContent=state.session;
  $('passedVal').textContent=state.motionsPassed;
  renderTopics();
}

function renderTopics(){
  const list=$('topicList');
  const remaining=TOPICS.filter((_,i)=>!state.usedTopics.includes(i));
  if(!remaining.length){
    list.innerHTML='<p class="empty-state">All topics debated. Start a new session.</p>';
    return;
  }
  list.innerHTML=remaining.map((t,i)=>{
    const realIdx=TOPICS.indexOf(t);
    return `<button class="topic-btn" data-idx="${realIdx}">
      ${t.title}
      <span class="topic-desc">${t.desc.slice(0,80)}${t.desc.length>80?'...':''}</span>
    </button>`;
  }).join('');
  list.querySelectorAll('.topic-btn').forEach(b=>b.addEventListener('click',()=>startDebate(parseInt(b.dataset.idx))));
}

function startDebate(idx){
  state.currentTopic=TOPICS[idx];
  state.votes={ fors: 0, against: 0, abstain: 0 };
  state.voted=false;
  state.usedTopics.push(idx);

  $('chamberPlaceholder').style.display='none';
  $('chamberContent').style.display='block';

  $('motionTitle').textContent=state.currentTopic.title;
  $('motionDesc').textContent=state.currentTopic.desc;
  $('speechGov').textContent=state.currentTopic.govArg;
  $('speechOpp').textContent=state.currentTopic.oppArg;

  document.querySelectorAll('.result-banner').forEach(r=>r.remove());
  updateVotes();
  addLog(`Debate started: "${state.currentTopic.title}"`);
}

function updateVotes(){
  $('voteFor').textContent=state.votes.fors;
  $('voteAgainst').textContent=state.votes.against;
  $('voteAbstain').textContent=state.votes.abstain;

  const total=state.votes.fors+state.votes.against+state.votes.abstain;
  const pct=total>0?(state.votes.fors/total)*100:0;
  $('voteFill').style.width=pct+'%';

  $('voteForBtn').disabled=state.voted;
  $('voteAgainstBtn').disabled=state.voted;
  $('voteAbstainBtn').disabled=state.voted;

  if(state.voted){
    const passed=state.votes.fors>state.votes.against;
    const banner=document.createElement('div');
    banner.className='result-banner '+(passed?'passed':'rejected');
    banner.textContent=passed?'MOTION PASSED — The bill has been approved.' : 'MOTION REJECTED — The bill has been defeated.';
    const voteArea=document.querySelector('.vote-area');
    if(!voteArea.querySelector('.result-banner')) voteArea.appendChild(banner);
    if(passed) state.motionsPassed++;
    addLog(`Vote result: "${state.currentTopic.title}" ${passed?'PASSED':'REJECTED'} (${state.votes.fors}-${state.votes.against})`);
    state.session++;
    setTimeout(()=>{ document.querySelectorAll('.result-banner').forEach(r=>r.remove()); }, 100);
  }
}

function castVote(type){
  if(state.voted||!state.currentTopic) return;

  const govWeight=state.govSeats;
  const oppWeight=state.oppSeats;
  const swing=Math.floor(Math.random()*20-10);
  const baseFor=type==='for'?govWeight+swing:type==='against'?oppWeight-swing:Math.floor((govWeight+oppWeight)*0.05);

  if(type==='for'){
    state.votes.fors+=baseFor;
    const oppVotes=Math.floor(oppWeight*0.15);
    state.votes.against+=oppVotes;
    state.votes.abstain+=Math.floor((govWeight+oppWeight)*0.05);
  } else if(type==='against'){
    state.votes.against+=baseFor;
    const govVotes=Math.floor(govWeight*0.15);
    state.votes.fors+=govVotes;
    state.votes.abstain+=Math.floor((govWeight+oppWeight)*0.05);
  } else {
    state.votes.abstain+=Math.floor((govWeight+oppWeight)*0.3);
    state.votes.fors+=Math.floor(govWeight*0.35);
    state.votes.against+=Math.floor(oppWeight*0.35);
  }

  state.voted=true;
  updateVotes();
  updateUI();
}

initSeats();
$('voteForBtn').addEventListener('click',()=>castVote('for'));
$('voteAgainstBtn').addEventListener('click',()=>castVote('against'));
$('voteAbstainBtn').addEventListener('click',()=>castVote('abstain'));
updateUI();
addLog(`Parliament convened. Government: ${state.govSeats} seats, Opposition: ${state.oppSeats} seats.`);
