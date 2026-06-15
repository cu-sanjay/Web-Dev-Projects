const state = {
  year: 2026,
  gdp: 2.1,
  unemployment: 4.8,
  inflation: 2.3,
  deficit: 340,
  confidence: 72,
  enactedPolicies: [],
  history: [],
};

const POLICIES = [
  {
    name: "Cut Corporate Tax",
    desc: "Reduce corporate tax rate from 21% to 15%",
    effects: { gdp: 0.8, unemployment: -0.3, inflation: 0.4, deficit: 120, confidence: 5 },
  },
  {
    name: "Increase Infrastructure Spending",
    desc: "$500B investment in roads, bridges, and broadband",
    effects: { gdp: 1.2, unemployment: -0.6, inflation: 0.3, deficit: 180, confidence: 8 },
  },
  {
    name: "Raise Minimum Wage",
    desc: "Increase federal minimum wage to $15/hour",
    effects: { gdp: 0.1, unemployment: 0.5, inflation: 0.6, deficit: 20, confidence: 3 },
  },
  {
    name: "Universal Healthcare",
    desc: "Implement single-payer healthcare system",
    effects: { gdp: -0.3, unemployment: 0.1, inflation: 0.2, deficit: 250, confidence: 6 },
  },
  {
    name: "Education Reform",
    desc: "Free public college and vocational training",
    effects: { gdp: 0.5, unemployment: -0.2, inflation: 0.1, deficit: 90, confidence: 7 },
  },
  {
    name: "Green Energy Subsidies",
    desc: "Tax credits for renewable energy adoption",
    effects: { gdp: 0.6, unemployment: -0.1, inflation: 0.2, deficit: 60, confidence: 4 },
  },
  {
    name: "Deregulation Package",
    desc: "Reduce business regulations across industries",
    effects: { gdp: 0.7, unemployment: -0.4, inflation: 0.1, deficit: -10, confidence: 2 },
  },
  {
    name: "Trade Tariffs",
    desc: "Impose 10% tariff on imported goods",
    effects: { gdp: -0.4, unemployment: 0.2, inflation: 1.1, deficit: -40, confidence: -3 },
  },
  {
    name: "Universal Basic Income",
    desc: "$500/month basic income for all citizens",
    effects: { gdp: 0.3, unemployment: 0.3, inflation: 1.0, deficit: 320, confidence: 2 },
  },
  {
    name: "Housing Affordability Act",
    desc: "Subsidies and incentives for affordable housing",
    effects: { gdp: 0.4, unemployment: -0.2, inflation: 0.3, deficit: 70, confidence: 5 },
  },
];

const $=id=>document.getElementById(id);

function addLog(msg){
  const el=$('logEntries');
  const e=document.createElement('div'); e.className='log-entry';
  e.innerHTML=`<span class="year">${state.year}</span> ${msg}`;
  el.prepend(e);
  if(el.children.length>30) el.removeChild(el.lastChild);
}

function updateUI(){
  $('gdpVal').textContent=state.gdp.toFixed(1)+'%';
  $('gdpVal').style.color=state.gdp>=2?'var(--green)':state.gdp>=0?'var(--gold)':'var(--red)';
  $('unempVal').textContent=state.unemployment.toFixed(1)+'%';
  $('unempVal').style.color=state.unemployment<=5?'var(--green)':state.unemployment<=7?'var(--gold)':'var(--red)';
  $('inflVal').textContent=state.inflation.toFixed(1)+'%';
  $('inflVal').style.color=state.inflation<=3?'var(--green)':state.inflation<=5?'var(--gold)':'var(--red)';
  $('defVal').textContent='$'+(state.deficit>=0?state.deficit:0)+'B';
  $('defVal').style.color=state.deficit<=200?'var(--green)':state.deficit<=400?'var(--gold)':'var(--red)';
  $('confVal').textContent=state.confidence;
  $('confVal').style.color=state.confidence>=70?'var(--green)':state.confidence>=50?'var(--gold)':'var(--red)';
  $('yearVal').textContent=state.year;

  renderPolicies();
  renderEnacted();
  renderChart();
}

function renderPolicies(){
  const list=$('policyList');
  list.innerHTML=POLICIES.map((p,i)=>{
    const canEnact=!state.enactedPolicies.includes(i);
    return `<button class="policy-btn" data-idx="${i}" ${!canEnact?'disabled':''}>
      ${p.name}
      <span class="effects">${p.desc}<br>
        <span class="pos">GDP: +${p.effects.gdp}%</span> ·
        <span class="${p.effects.unemployment<0?'pos':'neg'}">Unemp: ${p.effects.unemployment>=0?'+':''}${p.effects.unemployment}%</span> ·
        <span class="${p.effects.inflation<=0.3?'pos':'neg'}">Infl: +${p.effects.inflation}%</span> ·
        Deficit: +$${p.effects.deficit}B
      </span>
    </button>`;
  }).join('');
  list.querySelectorAll('.policy-btn').forEach(b=>b.addEventListener('click',()=>enact(parseInt(b.dataset.idx))));
}

function enact(idx){
  const p=POLICIES[idx];
  state.enactedPolicies.push(idx);
  state.gdp+=p.effects.gdp;
  state.unemployment+=p.effects.unemployment;
  state.inflation+=p.effects.inflation;
  state.deficit+=p.effects.deficit;
  state.confidence+=p.effects.confidence;
  state.gdp=Math.round(state.gdp*10)/10;
  state.unemployment=Math.round(Math.max(1,state.unemployment)*10)/10;
  state.inflation=Math.round(Math.max(0,state.inflation)*10)/10;
  state.deficit=Math.max(0,state.deficit);
  state.confidence=Math.min(100,Math.max(0,state.confidence));
  state.year++;

  state.history.push({
    year: state.year-1,
    policy: p.name,
    gdp: state.gdp,
    unemployment: state.unemployment,
    inflation: state.inflation,
  });

  addLog(`Enacted "${p.name}" — GDP: ${state.gdp.toFixed(1)}%, Unemployment: ${state.unemployment.toFixed(1)}%, Inflation: ${state.inflation.toFixed(1)}%`);
  updateUI();
}

function renderEnacted(){
  const el=$('enactedPolicies');
  if(!state.enactedPolicies.length){
    el.innerHTML='<p class="empty-state">No policies enacted yet. Choose from the left panel.</p>';
    return;
  }
  el.innerHTML=state.enactedPolicies.map(i=>{
    const p=POLICIES[i];
    return `<div class="enacted-item"><span class="name">${p.name}</span><br>${p.desc}</div>`;
  }).join('');
}

function renderChart(){
  const bars=$('chartBars');
  const data=state.history;
  if(!data.length){
    bars.innerHTML='<div class="empty-state" style="width:100%;padding:40px">Enact policies to see the economic impact timeline.</div>';
    return;
  }
  const max=Math.max(...data.map(d=>Math.max(d.gdp,d.unemployment,d.inflation,5)));
  bars.innerHTML=data.map(d=>{
    const gH=Math.max(2,(d.gdp/max)*180);
    const uH=Math.max(2,(d.unemployment/max)*180);
    const iH=Math.max(2,(d.inflation/max)*180);
    return `<div class="chart-col"><div class="chart-bar-wrap">
      <div class="chart-bar gdp" style="height:${gH}px" title="GDP ${d.gdp}%"></div>
      <div class="chart-bar unemp" style="height:${uH}px" title="Unemployment ${d.unemployment}%"></div>
      <div class="chart-bar infl" style="height:${iH}px" title="Inflation ${d.inflation}%"></div>
    </div><span class="year-label">${d.year}</span></div>`;
  }).join('');
}

updateUI();
addLog('Simulation started. GDP: 2.1%, Unemployment: 4.8%, Inflation: 2.3%');
