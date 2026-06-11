(function(){

const state={
  processes:[],
  timeline:[],
  mergedTimeline:[],
  algorithm:'fcfs',
  quantum:4,
  preemptive:false,
  priorityHighNumeric:true,
  completedProcesses:[],
  currentTime:0,
  totalBusyTime:0,
  simulationDone:false,
  stepMode:false,
  stepTimeline:[],
  stepIndex:0,
  chartInstance:null,
  pidCounter:1,
  processColors:{}
};

const COLOR_PALETTE=[
  '#2e7d32','#388e3c','#43a047','#4caf50','#66bb6a',
  '#81c784','#558b2f','#689f38','#8bc34a','#9ccc65'
];

function assignColor(pid){
  if(!state.processColors[pid]){
    const used=Object.keys(state.processColors).length;
    state.processColors[pid]=COLOR_PALETTE[used%COLOR_PALETTE.length];
  }
  return state.processColors[pid];
}

const $=(s)=>document.querySelector(s);
const $$=(s)=>document.querySelectorAll(s);

const ALGO_LABELS={fcfs:'FCFS',sjf:'SJF',rr:'RR',priority:'Priority'};

function validateProcessId(id){
  return id.trim()!==''&&!state.processes.some(p=>p.id===id.trim());
}

function addProcess(){
  const pid=$('#inject-pid').value.trim();
  const at=parseInt($('#inject-at').value)||0;
  const bt=parseInt($('#inject-bt').value)||1;
  const priority=parseInt($('#inject-priority').value)||1;

  if(!pid){alert('Enter a Process ID');return;}
  if(state.processes.some(p=>p.id===pid)){alert('PID "'+pid+'" already exists. Use a unique ID.');return;}
  if(bt<1){alert('Burst Time must be >= 1');return;}

  state.processes.push({id:pid,at,bt,priority:Math.min(10,Math.max(1,priority))});
  $('#inject-pid').value='P'+(parseInt(pid.slice(1))||state.processes.length+1);
  resetSimulation();
  renderProcessTable();
}

function removeProcess(pid){
  state.processes=state.processes.filter(p=>p.id!==pid);
  delete state.processColors[pid];
  resetSimulation();
  renderProcessTable();
}

function clearProcesses(){
  state.processes=[];
  state.processColors={};
  state.pidCounter=1;
  $('#inject-pid').value='P1';
  resetSimulation();
  renderProcessTable();
}

function loadPreset(name){
  const presets={
    convoy:[
      {id:'P1',at:0,bt:20,priority:1},
      {id:'P2',at:0,bt:2,priority:2},
      {id:'P3',at:0,bt:3,priority:3},
      {id:'P4',at:0,bt:2,priority:2}
    ],
    preempt:[
      {id:'P1',at:0,bt:10,priority:3},
      {id:'P2',at:2,bt:2,priority:5},
      {id:'P3',at:4,bt:3,priority:8},
      {id:'P4',at:6,bt:1,priority:10},
      {id:'P5',at:9,bt:4,priority:1}
    ],
    balanced:[
      {id:'P1',at:0,bt:6,priority:3},
      {id:'P2',at:1,bt:4,priority:2},
      {id:'P3',at:2,bt:8,priority:5},
      {id:'P4',at:3,bt:3,priority:1},
      {id:'P5',at:5,bt:5,priority:4}
    ]
  };
  if(presets[name]){
    state.processes=presets[name].map(p=>({...p}));
    state.processColors={};
    resetSimulation();
    renderProcessTable();
    $('#inject-pid').value='P'+(state.processes.length+1);
  }
}

function resetSimulation(){
  state.timeline=[];
  state.mergedTimeline=[];
  state.completedProcesses=[];
  state.currentTime=0;
  state.totalBusyTime=0;
  state.simulationDone=false;
  state.stepMode=false;
  state.stepTimeline=[];
  state.stepIndex=0;
  $('#gantt-content').style.display='none';
  $('#gantt-empty').style.display='flex';
  $('#chart-section').style.display='none';
  updateStatus();
  clearMetrics();
  clearTelemetry();
}

function clearMetrics(){
  $('#avg-wt').textContent='—';
  $('#avg-tat').textContent='—';
  $('#max-latency').textContent='—';
  $('#throughput').textContent='—';
}

function clearTelemetry(){
  $('#telemetry-body').innerHTML='';
}

// --- SCHEDULING ENGINE ---

function generateTimeline(){
  const algo=state.algorithm;
  const preemptive=state.preemptive;
  const quantum=state.quantum;
  const highNumeric=state.priorityHighNumeric;
  const procs=state.processes.map(p=>({
    ...p,rem:p.bt,arrived:false,completed:false,
    completionTime:null,firstStartTime:null
  }));
  if(procs.length===0)return[];
  procs.sort((a,b)=>a.at-b.at);

  const timeline=[];
  let time=0;
  let completedCount=0;
  const total=procs.length;
  const MAX_TIME=1000;
  let idleTicks=0;

  let readyQueue=[];
  let current=null;
  let rrQuantumUsed=0;

  function addArrivals(t){
    for(const p of procs){
      if(!p.arrived&&p.at<=t){
        p.arrived=true;
        readyQueue.push(p);
      }
    }
  }

  function selectFCFS(){
    addArrivals(time);
    if(readyQueue.length===0)return null;
    return readyQueue.shift();
  }

  function selectSJF(){
    addArrivals(time);
    if(readyQueue.length===0)return null;
    readyQueue.sort((a,b)=>a.rem-b.rem);
    return readyQueue.shift();
  }

  function selectPriority(){
    addArrivals(time);
    if(readyQueue.length===0)return null;
    readyQueue.sort((a,b)=>highNumeric?b.priority-a.priority:a.priority-b.priority);
    return readyQueue.shift();
  }

  function runFCFS(){
    while(completedCount<total&&time<MAX_TIME){
      addArrivals(time);
      if(readyQueue.length===0){
        const next=procs.find(p=>!p.arrived);
        if(!next)break;
        const idleEnd=next.at;
        while(time<idleEnd){
          timeline.push({pid:'Idle',time,state:'idle'});
          time++;idleTicks++;
        }
        continue;
      }
      const p=readyQueue.shift();
      if(p.firstStartTime===null)p.firstStartTime=time;
      const execStart=time;
      while(time<execStart+p.rem){
        timeline.push({pid:p.id,time,state:'running'});
        time++;
      }
      p.rem=0;
      p.completionTime=time;
      p.completed=true;
      completedCount++;
    }
  }

  function runSJFnp(){
    while(completedCount<total&&time<MAX_TIME){
      addArrivals(time);
      if(readyQueue.length===0){
        const next=procs.find(p=>!p.arrived);
        if(!next)break;
        while(time<next.at){
          timeline.push({pid:'Idle',time,state:'idle'});
          time++;idleTicks++;
        }
        continue;
      }
      readyQueue.sort((a,b)=>a.rem-b.rem);
      const p=readyQueue.shift();
      if(p.firstStartTime===null)p.firstStartTime=time;
      const execStart=time;
      while(time<execStart+p.rem){
        timeline.push({pid:p.id,time,state:'running'});
        time++;
      }
      p.rem=0;
      p.completionTime=time;
      p.completed=true;
      completedCount++;
    }
  }

  function runSRTF(){
    while(completedCount<total&&time<MAX_TIME){
      addArrivals(time);
      if(readyQueue.length===0){
        timeline.push({pid:'Idle',time,state:'idle'});
        time++;idleTicks++;
        continue;
      }
      if(current&&current.rem>0){
        const hasHigherPriority=readyQueue.some(p=>p.rem<current.rem);
        if(hasHigherPriority){
          readyQueue.push(current);
          current=null;
        }
      }
      if(!current){
        readyQueue.sort((a,b)=>a.rem-b.rem);
        current=readyQueue.shift();
        if(current.firstStartTime===null)current.firstStartTime=time;
      }
      timeline.push({pid:current.id,time,state:'running'});
      current.rem--;
      time++;
      if(current.rem===0){
        current.completionTime=time;
        current.completed=true;
        completedCount++;
        current=null;
      }
    }
    if(current&&current.rem>0){
      while(current.rem>0){
        timeline.push({pid:current.id,time,state:'running'});
        current.rem--;
        time++;
      }
      current.completionTime=time;
      current.completed=true;
      completedCount++;
    }
  }

  function runRR(){
    while(completedCount<total&&time<MAX_TIME){
      addArrivals(time);
      if(readyQueue.length===0){
        timeline.push({pid:'Idle',time,state:'idle'});
        time++;idleTicks++;
        continue;
      }
      const p=readyQueue.shift();
      if(p.firstStartTime===null)p.firstStartTime=time;
      const execTime=Math.min(quantum,p.rem);
      let tick=0;
      while(tick<execTime){
        timeline.push({pid:p.id,time,state:'running'});
        p.rem--;time++;tick++;
        addArrivals(time);
      }
      if(p.rem===0){
        p.completionTime=time;
        p.completed=true;
        completedCount++;
      }else{
        readyQueue.push(p);
      }
    }
  }

  function runPriorityNp(){
    while(completedCount<total&&time<MAX_TIME){
      addArrivals(time);
      if(readyQueue.length===0){
        const next=procs.find(p=>!p.arrived);
        if(!next)break;
        while(time<next.at){
          timeline.push({pid:'Idle',time,state:'idle'});
          time++;idleTicks++;
        }
        continue;
      }
      readyQueue.sort((a,b)=>highNumeric?b.priority-a.priority:a.priority-b.priority);
      const p=readyQueue.shift();
      if(p.firstStartTime===null)p.firstStartTime=time;
      while(p.rem>0){
        timeline.push({pid:p.id,time,state:'running'});
        p.rem--;time++;
      }
      p.completionTime=time;
      p.completed=true;
      completedCount++;
    }
  }

  function runPriorityP(){
    while(completedCount<total&&time<MAX_TIME){
      addArrivals(time);
      if(readyQueue.length===0&&(!current||current.rem===0)){
        timeline.push({pid:'Idle',time,state:'idle'});
        time++;idleTicks++;
        continue;
      }
      if(current&&current.rem>0){
        const better=readyQueue.some(p=>highNumeric?p.priority>current.priority:p.priority<current.priority);
        if(better){
          readyQueue.push(current);
          current=null;
        }
      }
      if(!current||current.rem===0){
        if(current&&current.rem===0){
          current.completionTime=time;
          current.completed=true;
          completedCount++;
          current=null;
        }
        readyQueue.sort((a,b)=>highNumeric?b.priority-a.priority:a.priority-b.priority);
        if(readyQueue.length>0){
          current=readyQueue.shift();
          if(current.firstStartTime===null)current.firstStartTime=time;
        }else{
          timeline.push({pid:'Idle',time,state:'idle'});
          time++;idleTicks++;
          continue;
        }
      }
      timeline.push({pid:current.id,time,state:'running'});
      current.rem--;
      time++;
      if(current.rem===0){
        current.completionTime=time;
        current.completed=true;
        completedCount++;
        current=null;
      }
    }
    if(current&&current.rem>0){
      while(current.rem>0){
        timeline.push({pid:current.id,time,state:'running'});
        current.rem--;
        time++;
      }
      current.completionTime=time;
      current.completed=true;
    }
  }

  if(algo==='fcfs')runFCFS();
  else if(algo==='sjf'&&!preemptive)runSJFnp();
  else if(algo==='sjf'&&preemptive)runSRTF();
  else if(algo==='rr')runRR();
  else if(algo==='priority'&&!preemptive)runPriorityNp();
  else if(algo==='priority'&&preemptive)runPriorityP();

  state.currentTime=time;
  state.totalBusyTime=time-idleTicks;
  state.completedProcesses=procs.map(p=>({
    id:p.id,at:p.at,bt:p.bt,priority:p.priority,
    completionTime:p.completionTime||time,
    firstStartTime:p.firstStartTime
  }));

  return timeline;
}

function mergeTimeline(timeline){
  if(timeline.length===0)return[];
  const merged=[];
  let cur={...timeline[0],startTime:timeline[0].time,endTime:timeline[0].time+1};
  for(let i=1;i<timeline.length;i++){
    const e=timeline[i];
    if(e.pid===cur.pid&&e.state===cur.state){
      cur.endTime=e.time+1;
    }else{
      merged.push(cur);
      cur={...e,startTime:e.time,endTime:e.time+1};
    }
  }
  merged.push(cur);
  return merged;
}

// --- COMPUTE METRICS ---

function computeMetrics(){
  const procs=state.completedProcesses;
  if(procs.length===0)return;
  const totalTime=state.currentTime||1;

  let sumWT=0,sumTAT=0,maxWT=0,maxWTProc='';
  const rows=procs.map(p=>{
    const ct=p.completionTime||0;
    const tat=ct-p.at;
    const wt=tat-p.bt;
    const nrr=wt/p.bt+1;
    if(wt>maxWT){maxWT=wt;maxWTProc=p.id;}
    sumWT+=wt;sumTAT+=tat;
    return{...p,ct,tat,wt,nrr};
  });

  const avgWT=sumWT/procs.length;
  const avgTAT=sumTAT/procs.length;
  const throughput=procs.length/totalTime;
  const cpuUtil=state.totalBusyTime/totalTime*100;

  return{rows,avgWT,avgTAT,maxWT,maxWTProc,throughput,cpuUtil};
}

// --- RENDER GANTT ---

function renderGantt(){
  const timeline=state.timeline;
  if(timeline.length===0)return;
  const merged=mergeTimeline(timeline);
  state.mergedTimeline=merged;

  $('#gantt-empty').style.display='none';
  const content=$('#gantt-content');
  content.style.display='flex';

  const maxTime=Math.max(...merged.map(m=>m.endTime));
  const laneWidth=Math.max(600,maxTime*36);

  const axis=$('#gantt-time-axis');
  axis.innerHTML='';
  axis.style.width=laneWidth+'px';
  for(let t=0;t<=maxTime;t++){
    const tick=document.createElement('div');
    tick.className='time-tick';
    tick.style.width='36px';
    tick.textContent=t;
    axis.appendChild(tick);
  }

  const lanes=$('#gantt-lanes');
  lanes.innerHTML='';

  const legend=$('#gantt-legend');
  legend.innerHTML='';
  const seenPids=new Set();
  for(const m of merged){
    if(m.pid!=='Idle'&&!seenPids.has(m.pid)){
      seenPids.add(m.pid);
      const item=document.createElement('span');
      item.className='legend-item';
      item.innerHTML='<span class="legend-swatch" style="background:'+assignColor(m.pid)+'"></span>'+m.pid;
      legend.appendChild(item);
    }
  }
  if(seenPids.size>0){
    const idleItem=document.createElement('span');
    idleItem.className='legend-item';
    idleItem.innerHTML='<span class="legend-swatch" style="background:var(--slate)"></span>Idle';
    legend.appendChild(idleItem);
  }

  const processIds=[...new Set(merged.filter(m=>m.pid!=='Idle').map(m=>m.pid))];
  processIds.sort();

  const laneMap={};
  for(const pid of processIds){
    const lane=document.createElement('div');
    lane.className='gantt-lane';
    lane.style.width=laneWidth+'px';
    const label=document.createElement('div');
    label.className='gantt-lane-label';
    label.textContent=pid;
    const track=document.createElement('div');
    track.className='gantt-lane-track';
    track.style.width=(laneWidth-32)+'px';
    lane.appendChild(label);
    lane.appendChild(track);
    lanes.appendChild(lane);
    laneMap[pid]=track;
  }

  const idleLane=document.createElement('div');
  idleLane.className='gantt-lane';
  idleLane.style.width=laneWidth+'px';
  const idleLabel=document.createElement('div');
  idleLabel.className='gantt-lane-label';
  idleLabel.textContent='Idle';
  const idleTrack=document.createElement('div');
  idleTrack.className='gantt-lane-track';
  idleTrack.style.width=(laneWidth-32)+'px';
  idleLane.appendChild(idleLabel);
  idleLane.appendChild(idleTrack);
  lanes.appendChild(idleLane);

  for(const m of merged){
    const left=(m.startTime*36)+'px';
    const width=((m.endTime-m.startTime)*36-2)+'px';
    if(m.pid==='Idle'){
      const block=document.createElement('div');
      block.className='gantt-block idle-block';
      block.style.left=left;
      block.style.width=width;
      if((m.endTime-m.startTime)>=2)block.textContent='Idle';
      idleTrack.appendChild(block);
    }else{
      const track=laneMap[m.pid];
      if(!track)continue;
      const block=document.createElement('div');
      block.className='gantt-block';
      block.style.left=left;
      block.style.width=width;
      block.style.background=assignColor(m.pid);
      if((m.endTime-m.startTime)>=2)block.textContent=m.pid;
      block.title=m.pid+' ['+m.startTime+'-'+m.endTime+']';
      track.appendChild(block);
    }
  }

  // current time indicator for step mode
  if(state.stepMode&&state.stepIndex>0){
    const curTime=state.stepTimeline[state.stepIndex-1]?.time||0;
    const line=document.createElement('div');
    line.className='gantt-current-line';
    line.style.left=(curTime*36+32)+'px';
    lanes.appendChild(line);
  }
}

// --- RENDER TELEMETRY ---

function renderTelemetry(){
  const metrics=computeMetrics();
  if(!metrics)return;
  const tbody=$('#telemetry-body');
  tbody.innerHTML='';

  for(const row of metrics.rows){
    const tr=document.createElement('tr');
    if(row.wt===metrics.maxWT&&row.wt>0)tr.className='max-wt';
    tr.innerHTML=
      '<td>'+row.id+'</td>'+
      '<td>'+row.at+'</td>'+
      '<td>'+row.bt+'</td>'+
      '<td>'+row.priority+'</td>'+
      '<td>'+row.ct+'</td>'+
      '<td>'+row.tat.toFixed(1)+'</td>'+
      '<td>'+row.wt.toFixed(1)+'</td>'+
      '<td>'+row.nrr.toFixed(2)+'</td>';
    tbody.appendChild(tr);
  }

  const tfoot=document.createElement('tfoot');
  const avgWT=metrics.avgWT.toFixed(2);
  const avgTAT=metrics.avgTAT.toFixed(2);
  tfoot.innerHTML='<tr><td colspan="4">Averages</td><td>—</td><td>'+avgTAT+'</td><td>'+avgWT+'</td><td>—</td></tr>';
  tbody.appendChild(tfoot);

  $('#avg-wt').textContent=metrics.avgWT.toFixed(2);
  $('#avg-tat').textContent=metrics.avgTAT.toFixed(2);
  $('#max-latency').textContent=metrics.maxWT.toFixed(1)+(metrics.maxWTProc?' ('+metrics.maxWTProc+')':'');
  $('#throughput').textContent=metrics.throughput.toFixed(3)+' p/ut';

  updateStatus(metrics.cpuUtil);

  renderChart(metrics.rows);
}

// --- CHART ---

function renderChart(rows){
  const canvas=$('#metrics-chart');
  if(!canvas)return;
  $('#chart-section').style.display='block';

  if(state.chartInstance){
    state.chartInstance.destroy();
    state.chartInstance=null;
  }

  const ctx=canvas.getContext('2d');
  state.chartInstance=new Chart(ctx,{
    type:'bar',
    data:{
      labels:rows.map(r=>r.id),
      datasets:[
        {
          label:'Turnaround Time (TAT)',
          data:rows.map(r=>r.tat),
          backgroundColor:rows.map(r=>assignColor(r.id)+'cc'),
          borderColor:rows.map(r=>assignColor(r.id)),
          borderWidth:1,
          borderRadius:3
        },
        {
          label:'Waiting Time (WT)',
          data:rows.map(r=>r.wt),
          backgroundColor:rows.map(()=>'rgba(176,190,197,0.7)'),
          borderColor:rows.map(()=>'#b0bec5'),
          borderWidth:1,
          borderRadius:3
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{
          labels:{
            boxWidth:10,
            boxHeight:10,
            padding:8,
            font:{size:9,weight:'600'},
            color:'#557a61'
          }
        }
      },
      scales:{
        x:{
          grid:{display:false},
          ticks:{font:{size:8,weight:'600',family:'ui-monospace,monospace'},color:'#557a61'}
        },
        y:{
          beginAtZero:true,
          grid:{color:'#e2ebd9',drawBorder:false},
          ticks:{font:{size:8,family:'ui-monospace,monospace'},color:'#557a61'}
        }
      }
    }
  });
}

// --- UPDATE STATUS ---

function updateStatus(cpuUtil){
  $('#cpu-time').textContent=state.currentTime;
  if(cpuUtil!==undefined){
    $('#cpu-util').textContent=cpuUtil.toFixed(1)+'%';
  }
  const algo=state.algorithm;
  const labels={fcfs:'FCFS',sjf:'SJF'+(state.preemptive?' (SRTF)':''),rr:'RR (q='+state.quantum+')',priority:'Priority'+(state.preemptive?' (P)':' (NP)')};
  $('#current-algo').textContent=algo==='rr'?'RR (q='+state.quantum+')':labels[algo];
  if(state.simulationDone&&state.completedProcesses.length>0){
    const running=state.completedProcesses.filter(p=>p.completionTime>state.currentTime);
    if(running.length===0)$('#active-block').textContent='—';
    else $('#active-block').textContent=running[0].id;
  }else{
    $('#active-block').textContent='—';
  }
}

// --- EXPORT CSV ---

function exportCSV(){
  const metrics=computeMetrics();
  if(!metrics||metrics.rows.length===0){
    alert('No data to export. Run a simulation first.');
    return;
  }
  let csv='Process ID,Arrival Time,Burst Time,Priority,Completion Time,Turnaround Time,Waiting Time,Normalized RR\n';
  for(const r of metrics.rows){
    csv+=r.id+','+r.at+','+r.bt+','+r.priority+','+r.ct+','+r.tat.toFixed(1)+','+r.wt.toFixed(1)+','+r.nrr.toFixed(2)+'\n';
  }
  csv+='\nAvg Waiting Time,'+metrics.avgWT.toFixed(2)+'\n';
  csv+='Avg Turnaround Time,'+metrics.avgTAT.toFixed(2)+'\n';
  csv+='Throughput,'+metrics.throughput.toFixed(3)+'\n';
  csv+='CPU Utilization,'+metrics.cpuUtil.toFixed(1)+'%\n';

  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download='cpu_scheduling_analysis.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// --- EXECUTE SCHEDULE ---

function executeSchedule(){
  if(state.processes.length===0){alert('Add at least one process first.');return;}
  resetSimulation();
  const tl=generateTimeline();
  state.timeline=tl;
  state.simulationDone=true;
  renderGantt();
  renderTelemetry();
  updateStatus();
}

// --- STEP TICK ---

function initStepMode(){
  if(state.processes.length===0){alert('Add at least one process first.');return;}
  state.stepMode=true;
  state.stepIndex=0;
  state.simulationDone=false;
  state.completedProcesses=[];
  state.currentTime=0;
  state.totalBusyTime=0;

  const procs=state.processes.map(p=>({
    ...p,rem:p.bt,arrived:false,completed:false,
    completionTime:null,firstStartTime:null
  }));
  procs.sort((a,b)=>a.at-b.at);

  state.stepState={procs,time:0,completedCount:0,current:null,readyQueue:[],rrQuantumUsed:0,idleTicks:0};
  state.stepTimeline=[];
  $('#gantt-empty').style.display='none';
  $('#gantt-content').style.display='flex';
  $('#gantt-time-axis').innerHTML='';
  $('#gantt-lanes').innerHTML='';
  clearMetrics();
  clearTelemetry();
  updateStatus();

  // initial arrivals
  const ss=state.stepState;
  for(const p of ss.procs){
    if(p.at===0){p.arrived=true;ss.readyQueue.push(p);}
  }
}

function stepTick(){
  if(state.processes.length===0){alert('Add at least one process first.');return;}
  if(state.simulationDone){alert('Simulation complete. Press FLUSH to reset.');return;}
  if(!state.stepMode)initStepMode();

  const ss=state.stepState;
  const algo=state.algorithm;
  const preemptive=state.preemptive;
  const quantum=state.quantum;
  const highNumeric=state.priorityHighNumeric;
  const MAX_TIME=1000;

  if(ss.completedCount>=ss.procs.length||ss.time>=MAX_TIME){
    state.simulationDone=true;
    state.currentTime=ss.time;
    state.totalBusyTime=ss.time-ss.idleTicks;
    state.completedProcesses=ss.procs.map(p=>({
      id:p.id,at:p.at,bt:p.bt,priority:p.priority,
      completionTime:p.completionTime||ss.time,
      firstStartTime:p.firstStartTime
    }));
    state.timeline=state.stepTimeline;
    renderGantt();
    renderTelemetry();
    updateStatus();
    return;
  }

  // add new arrivals
  for(const p of ss.procs){
    if(!p.arrived&&p.at===ss.time){
      p.arrived=true;
      ss.readyQueue.push(p);
    }
  }

  if(algo==='fcfs'||algo==='rr'||(algo==='sjf'&&!preemptive)||(algo==='priority'&&!preemptive)){
    if(!ss.current||ss.current.rem===0){
      if(ss.current&&ss.current.rem===0){
        ss.current.completionTime=ss.time;
        ss.current.completed=true;
        ss.completedCount++;
        // add arrivals that arrived during this tick
        for(const p of ss.procs){
          if(!p.arrived&&p.at===ss.time){
            p.arrived=true;ss.readyQueue.push(p);
          }
        }
        ss.current=null;
      }
      if(ss.current===null&&ss.readyQueue.length===0){
        state.stepTimeline.push({pid:'Idle',time:ss.time,state:'idle'});
        ss.time++;ss.idleTicks++;
        state.currentTime=ss.time;
        updateStatus();
        return;
      }
      if(ss.current===null){
        if(algo==='fcfs'){ss.current=ss.readyQueue.shift();}
        else if(algo==='rr'){ss.current=ss.readyQueue.shift();}
        else if(algo==='sjf'){
          ss.readyQueue.sort((a,b)=>a.rem-b.rem);
          ss.current=ss.readyQueue.shift();
        }
        else if(algo==='priority'){
          ss.readyQueue.sort((a,b)=>highNumeric?b.priority-a.priority:a.priority-b.priority);
          ss.current=ss.readyQueue.shift();
        }
        if(ss.current&&ss.current.firstStartTime===null)ss.current.firstStartTime=ss.time;
      }
    }
  }else if(algo==='sjf'&&preemptive){
    if(ss.current&&ss.current.rem>0){
      const better=ss.readyQueue.some(p=>p.rem<ss.current.rem);
      if(better){
        ss.readyQueue.push(ss.current);
        ss.readyQueue.sort((a,b)=>a.rem-b.rem);
        ss.current=ss.readyQueue.shift();
      }
    }else if((!ss.current||ss.current.rem===0)&&ss.readyQueue.length>0){
      if(ss.current&&ss.current.rem===0){
        ss.current.completionTime=ss.time;
        ss.current.completed=true;
        ss.completedCount++;
        for(const p of ss.procs){
          if(!p.arrived&&p.at===ss.time){
            p.arrived=true;ss.readyQueue.push(p);
          }
        }
        ss.current=null;
      }
      if(ss.readyQueue.length>0){
        ss.readyQueue.sort((a,b)=>a.rem-b.rem);
        ss.current=ss.readyQueue.shift();
        if(ss.current.firstStartTime===null)ss.current.firstStartTime=ss.time;
      }
    }
    if(!ss.current&&ss.readyQueue.length===0){
      state.stepTimeline.push({pid:'Idle',time:ss.time,state:'idle'});
      ss.time++;ss.idleTicks++;
      state.currentTime=ss.time;
      updateStatus();
      return;
    }
  }else if(algo==='priority'&&preemptive){
    if(ss.current&&ss.current.rem>0){
      const better=ss.readyQueue.some(p=>highNumeric?p.priority>ss.current.priority:p.priority<ss.current.priority);
      if(better){
        ss.readyQueue.push(ss.current);
        ss.readyQueue.sort((a,b)=>highNumeric?b.priority-a.priority:a.priority-b.priority);
        ss.current=ss.readyQueue.shift();
      }
    }else if((!ss.current||ss.current.rem===0)&&ss.readyQueue.length>0){
      if(ss.current&&ss.current.rem===0){
        ss.current.completionTime=ss.time;
        ss.current.completed=true;
        ss.completedCount++;
        for(const p of ss.procs){
          if(!p.arrived&&p.at===ss.time){
            p.arrived=true;ss.readyQueue.push(p);
          }
        }
        ss.current=null;
      }
      if(ss.readyQueue.length>0){
        ss.readyQueue.sort((a,b)=>highNumeric?b.priority-a.priority:a.priority-b.priority);
        ss.current=ss.readyQueue.shift();
        if(ss.current.firstStartTime===null)ss.current.firstStartTime=ss.time;
      }
    }
    if(!ss.current&&ss.readyQueue.length===0){
      state.stepTimeline.push({pid:'Idle',time:ss.time,state:'idle'});
      ss.time++;ss.idleTicks++;
      state.currentTime=ss.time;
      updateStatus();
      return;
    }
  }

  // execute current process for 1 tick (or quantum for RR)
  if(ss.current){
    const isRR=(algo==='rr');
    if(isRR){
      const execTime=Math.min(quantum-ss.rrQuantumUsed,ss.current.rem);
      state.stepTimeline.push({pid:ss.current.id,time:ss.time,state:'running'});
      ss.current.rem--;
      ss.rrQuantumUsed++;
      ss.time++;
      if(ss.current.rem===0){
        ss.current.completionTime=ss.time;
        ss.current.completed=true;
        ss.completedCount++;
        ss.current=null;
        ss.rrQuantumUsed=0;
      }else if(ss.rrQuantumUsed>=quantum){
        ss.readyQueue.push(ss.current);
        ss.current=null;
        ss.rrQuantumUsed=0;
      }
    }else{
      state.stepTimeline.push({pid:ss.current.id,time:ss.time,state:'running'});
      ss.current.rem--;
      ss.time++;
      if(ss.current.rem===0){
        ss.current.completionTime=ss.time;
        ss.current.completed=true;
        ss.completedCount++;
        ss.current=null;
      }
    }
  }else{
    state.stepTimeline.push({pid:'Idle',time:ss.time,state:'idle'});
    ss.time++;
    ss.idleTicks++;
  }

  state.currentTime=ss.time;
  state.stepIndex=state.stepTimeline.length;
  state.timeline=state.stepTimeline;

  // build completed processes for partial display
  state.completedProcesses=ss.procs.filter(p=>p.completed).map(p=>({
    id:p.id,at:p.at,bt:p.bt,priority:p.priority,
    completionTime:p.completionTime,
    firstStartTime:p.firstStartTime
  }));

  renderGantt();

  if(ss.completedCount>0){
    renderTelemetry();
  }
  updateStatus();

  if(ss.completedCount>=ss.procs.length){
    state.simulationDone=true;
    state.totalBusyTime=ss.time-ss.idleTicks;
    state.completedProcesses=ss.procs.map(p=>({
      id:p.id,at:p.at,bt:p.bt,priority:p.priority,
      completionTime:p.completionTime||ss.time,
      firstStartTime:p.firstStartTime
    }));
    renderGantt();
    renderTelemetry();
    updateStatus();
  }
}

// --- RENDER PROCESS TABLE ---

function renderProcessTable(){
  const container=$('#process-table');
  const count=$('#process-count');
  count.textContent=state.processes.length;

  if(state.processes.length===0){
    container.innerHTML='<div class="empty-queue">No processes added. Use the injector above.</div>';
    return;
  }

  container.innerHTML='';
  for(const p of state.processes){
    const row=document.createElement('div');
    row.className='process-row';
    row.innerHTML=
      '<span class="pid">'+p.id+'</span>'+
      '<span class="params"><span>AT:'+p.at+'</span><span>BT:'+p.bt+'</span><span>P:'+p.priority+'</span></span>'+
      '<button class="remove-btn" data-pid="'+p.id+'" title="Remove '+p.id+'">&times;</button>';
    container.appendChild(row);
  }

  container.querySelectorAll('.remove-btn').forEach(btn=>{
    btn.addEventListener('click',()=>removeProcess(btn.dataset.pid));
  });
}

// --- UI SETUP ---

function init(){
  // algorithm tabs
  $$('.algo-tab').forEach(tab=>{
    tab.addEventListener('click',function(){
      $$('.algo-tab').forEach(t=>t.classList.remove('active'));
      this.classList.add('active');
      state.algorithm=this.dataset.algo;
      // show relevant options
      $$('.algo-options').forEach(o=>o.classList.add('hidden'));
      const optMap={sjf:'opt-sjf',rr:'opt-rr',priority:'opt-priority'};
      const optId=optMap[state.algorithm];
      if(optId)document.getElementById(optId).classList.remove('hidden');
      resetSimulation();
      updateStatus();
    });
  });

  // quantum slider
  const qSlider=$('#rr-quantum-slider');
  const qDisplay=$('#rr-quantum-display');
  qSlider.addEventListener('input',function(){
    state.quantum=parseInt(this.value);
    qDisplay.textContent=this.value;
    resetSimulation();
    updateStatus();
  });

  // sjf preemptive
  $('#sjf-preemptive').addEventListener('change',function(){
    state.preemptive=this.checked;
    resetSimulation();
    updateStatus();
  });

  // priority preemptive
  $('#priority-preemptive').addEventListener('change',function(){
    state.preemptive=this.checked;
    resetSimulation();
    updateStatus();
  });

  // priority order
  $('#priority-order').addEventListener('change',function(){
    state.priorityHighNumeric=this.value==='high-numeric';
    resetSimulation();
    updateStatus();
  });

  // add process
  $('#btn-add-process').addEventListener('click',addProcess);
  document.querySelectorAll('.form-input').forEach(inp=>{
    inp.addEventListener('keydown',e=>{if(e.key==='Enter')addProcess();});
  });

  // presets
  $$('.btn-preset').forEach(btn=>{
    btn.addEventListener('click',()=>loadPreset(btn.dataset.preset));
  });

  // execute
  $('#btn-execute').addEventListener('click',executeSchedule);

  // step tick
  $('#btn-step').addEventListener('click',stepTick);

  // flush
  $('#btn-flush').addEventListener('click',function(){
    clearProcesses();
    resetSimulation();
  });

  // export
  $('#btn-export').addEventListener('click',exportCSV);

  updateStatus();
}

document.addEventListener('DOMContentLoaded',init);

})();
