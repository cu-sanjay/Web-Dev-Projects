const state = {
  cash: 100000,
  portfolio: 0,
  deals: 0,
  episode: 1,
  currentPitch: null,
  usedPitches: [],
};

const PITCHES = [
  { name: "EcoSnap", desc: "A biodegradable phone case that plants a tree for every purchase. Compostable material decomposes in 180 days.", story: "I started EcoSnap after finding plastic on a beach near my hometown. People love their phones but hate plastic waste. We've sold 12,000 units through Instagram alone. With your help, we can expand to retail chains.", ask: 50000, equity: 10, revenue: 180000, valuation: 500000 },
  { name: "SmartMug", desc: "A temperature-controlled coffee mug that keeps your drink at the perfect temperature for 2 hours using a phone app.", story: "I'm a software engineer who got tired of cold coffee during long coding sessions. SmartMug uses a precision heating element and app-based temperature control. We have a patent pending and 5,000 pre-orders.", ask: 75000, equity: 15, revenue: 95000, valuation: 500000 },
  { name: "PetBot", desc: "An AI-powered automatic pet feeder with camera that lets owners interact with their pets remotely.", story: "My dog has separation anxiety, and I felt guilty working long hours. PetBot lets me talk to him, dispense treats, and monitor his activity through my phone. We've sold 3,000 units with zero marketing.", ask: 60000, equity: 12, revenue: 210000, valuation: 500000 },
  { name: "FreshThreads", desc: "A subscription service delivering curated, sustainable clothing rental for professionals who want variety without waste.", story: "Fast fashion is destroying the planet. FreshThreads lets you rotate your wardrobe monthly without buying new clothes. We dry-clean and repair everything. 2,000 subscribers and 92% retention rate.", ask: 80000, equity: 8, revenue: 320000, valuation: 1000000 },
  { name: "CodeCamp Jr", desc: "Online coding classes for kids aged 7–14 with live instructors and project-based curriculum.", story: "As a former teacher, I saw how uneven access to tech education was. CodeCamp Jr offers live, small-group coding classes at a fraction of the cost of competitors. We've taught 8,000 students with a 4.8-star rating.", ask: 100000, equity: 20, revenue: 240000, valuation: 500000 },
  { name: "SnackBox", desc: "Curated monthly snack boxes featuring products from small-batch, minority-owned food businesses.", story: "I found amazing snacks from small producers who had no way to reach customers. SnackBox connects them to food lovers nationwide. Each box features 8–10 products with stories about the makers.", ask: 40000, equity: 10, revenue: 150000, valuation: 400000 },
  { name: "HealthSync", desc: "A wearable health tracker focused specifically on women's health with cycle tracking, fertility insights, and telemedicine.", story: "Women's health has been an afterthought in wearables. HealthSync is built by women, for women. Our accuracy beats general fitness trackers by 40% for cycle predictions. We have 15,000 pre-orders.", ask: 120000, equity: 15, revenue: 50000, valuation: 800000 },
  { name: "ParkEase", desc: "An app that finds and reserves parking spots in real-time using IoT sensors installed in partner parking lots.", story: "I spent 3 months of my life looking for parking. ParkEase partners with parking lot owners to install sensors and let users reserve spots through our app. 200 partner lots, 50,000 downloads.", ask: 90000, equity: 18, revenue: 130000, valuation: 500000 },
];

const $=id=>document.getElementById(id);

function addLog(msg){
  const el=$('logEntries');
  const e=document.createElement('div'); e.className='log-entry';
  e.innerHTML=`<span class="ep">E${state.episode}</span> ${msg}`;
  el.prepend(e);
  if(el.children.length>30) el.removeChild(el.lastChild);
}

function updateUI(){
  $('cashVal').textContent='$'+state.cash.toLocaleString();
  $('portfolioVal').textContent='$'+state.portfolio.toLocaleString();
  $('dealsVal').textContent=state.deals;
  $('episodeVal').textContent=state.episode;
  renderPitches();
}

function renderPitches(){
  const list=$('pitchList');
  const remaining=PITCHES.filter((_,i)=>!state.usedPitches.includes(i));
  if(!remaining.length){
    list.innerHTML='<p class="empty-state">All pitches seen! Start a new round.</p>';
    list.innerHTML+='<button class="pitch-btn" onclick="location.reload()" style="text-align:center;margin-top:8px">New Season</button>';
    return;
  }
  list.innerHTML=remaining.map((p,i)=>{
    const realIdx=PITCHES.indexOf(p);
    return `<button class="pitch-btn" data-idx="${realIdx}">
      ${p.name}
      <span class="p-meta"><span>Ask: $${p.ask.toLocaleString()}</span><span>${p.equity}% equity</span><span>Rev: $${p.revenue.toLocaleString()}</span></span>
    </button>`;
  }).join('');
  list.querySelectorAll('.pitch-btn').forEach(b=>b.addEventListener('click',()=>openPitch(parseInt(b.dataset.idx))));
}

function openPitch(idx){
  const p=PITCHES[idx];
  state.currentPitch=p;
  state.usedPitches.push(idx);

  $('tankPlaceholder').style.display='none';
  $('pitchDetail').style.display='block';
  $('dealResult').className='deal-result';

  $('pitchName').textContent=p.name;
  $('pitchDesc').textContent=p.desc;
  $('pitchAsk').textContent='$'+p.ask.toLocaleString();
  $('pitchEquity').textContent=p.equity+'%';
  $('pitchRevenue').textContent='$'+p.revenue.toLocaleString();
  $('pitchValuation').textContent='$'+p.valuation.toLocaleString();
  $('pitchStory').textContent='"'+p.story+'"';
  $('offerAmount').value=p.ask;
  $('offerEquity').value=p.equity;
  $('investBtn').disabled=false;
  $('passBtn').disabled=false;

  addLog(`Heard pitch from ${p.name} — asking $${p.ask.toLocaleString()} for ${p.equity}%`);
}

function makeOffer(){
  const p=state.currentPitch;
  if(!p) return;
  const offerAmt=parseInt($('offerAmount').value);
  const offerEq=parseFloat($('offerEquity').value);
  if(!offerAmt||!offerEq||offerAmt<0||offerEq<0||offerEq>100){
    showDealResult('Enter valid offer amounts.', 'fail');
    return;
  }
  if(offerAmt>state.cash){
    showDealResult('You don\'t have enough cash for this offer!', 'fail');
    return;
  }

  const askRatio=offerAmt/p.ask;
  const equityRatio=offerEq/p.equity;
  const score=(askRatio*0.5+equityRatio*0.5)*100;
  const threshold=40+Math.random()*25;
  const accepted=score>=threshold;

  $('investBtn').disabled=true;
  $('passBtn').disabled=true;

  if(accepted){
    state.cash-=offerAmt;
    const estimatedValue=p.revenue*(offerEq/100)*3;
    state.portfolio+=Math.floor(estimatedValue);
    state.deals++;
    state.episode++;
    showDealResult(`DEAL! ${p.name} accepted your offer of $${offerAmt.toLocaleString()} for ${offerEq}%. Your stake is valued at ~$${Math.floor(estimatedValue).toLocaleString()}.`, 'success');
    addLog(`DEAL: Invested $${offerAmt.toLocaleString()} in ${p.name} for ${offerEq}%`);
  } else {
    state.episode++;
    showDealResult(`No deal. ${p.name} felt the offer didn't reflect their valuation. They were asking $${p.ask.toLocaleString()} for ${p.equity}% and you offered $${offerAmt.toLocaleString()} for ${offerEq}%.`, 'fail');
    addLog(`NO DEAL: ${p.name} rejected $${offerAmt.toLocaleString()} for ${offerEq}%`);
  }
  updateUI();
}

function passOnPitch(){
  if(!state.currentPitch) return;
  state.episode++;
  $('investBtn').disabled=true;
  $('passBtn').disabled=true;
  showDealResult(`You passed on ${state.currentPitch.name}. They were seeking $${state.currentPitch.ask.toLocaleString()} for ${state.currentPitch.equity}%.`, 'fail');
  addLog(`PASSED on ${state.currentPitch.name}`);
}

function showDealResult(msg, type){
  const r=$('dealResult');
  r.textContent=msg;
  r.className='deal-result show '+type;
}

$('investBtn').addEventListener('click',makeOffer);
$('passBtn').addEventListener('click',passOnPitch);
updateUI();
addLog('Shark Tank season started with $100,000 to invest.');
