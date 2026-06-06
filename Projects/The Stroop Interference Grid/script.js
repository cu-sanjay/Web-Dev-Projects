(function(){
  'use strict';

  const COLORS = [
    { id:'red',    name:'Red',    hex:'#ef4444' },
    { id:'blue',   name:'Blue',   hex:'#3b82f6' },
    { id:'green',  name:'Green',  hex:'#10b981' },
    { id:'yellow', name:'Yellow', hex:'#f59e0b' },
    { id:'purple', name:'Purple', hex:'#a855f7' }
  ];

  const STATE = {
    running: false,
    currentWordId: '',
    currentInkId: '',
    currentRule: '',
    correctAnswer: '',
    streak: 0,
    bestStreak: 0,
    totalRounds: 0,
    correctRounds: 0,
    timerRAF: null,
    timerTimeout: null,
    roundStartTime: 0,
    locked: false
  };

  const el = {
    streak: document.getElementById('streak-display'),
    best: document.getElementById('best-display'),
    rounds: document.getElementById('rounds-display'),
    accuracy: document.getElementById('accuracy-display'),
    resetBtn: document.getElementById('reset-btn'),
    mainContent: document.getElementById('main-content'),
    ruleBanner: document.getElementById('rule-banner'),
    stimulus: document.getElementById('stroop-stimulus'),
    targetGrid: document.getElementById('target-grid'),
    timerFill: document.getElementById('timer-fill')
  };

  let audioCtx = null;

  function shuffleArray(arr){
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  function loadBestStreak(){
    try{
      const d=JSON.parse(localStorage.getItem('stroop-best'));
      if(d&&typeof d.bestStreak==='number') STATE.bestStreak=d.bestStreak;
    }catch(e){}
  }

  function saveBestStreak(){
    if(STATE.streak>STATE.bestStreak){
      STATE.bestStreak=STATE.streak;
      try{
        localStorage.setItem('stroop-best',JSON.stringify({bestStreak:STATE.bestStreak}));
      }catch(e){}
    }
  }

  function updateStats(){
    const acc=STATE.totalRounds>0?Math.round((STATE.correctRounds/STATE.totalRounds)*100):0;
    el.streak.textContent=STATE.streak;
    el.best.textContent=STATE.bestStreak;
    el.rounds.textContent=STATE.totalRounds;
    el.accuracy.textContent=acc+'%';
  }

  function stopTimer(){
    if(STATE.timerRAF){cancelAnimationFrame(STATE.timerRAF);STATE.timerRAF=null;}
    if(STATE.timerTimeout){clearTimeout(STATE.timerTimeout);STATE.timerTimeout=null;}
  }

  function updateTimerBar(){
    if(!STATE.running)return;
    const elapsed=performance.now()-STATE.roundStartTime;
    const pct=Math.max(0,1-elapsed/2000);
    el.timerFill.style.width=(pct*100)+'%';
    if(pct>0){
      STATE.timerRAF=requestAnimationFrame(updateTimerBar);
    }
  }

  function startRoundTimer(){
    STATE.roundStartTime=performance.now();
    el.timerFill.className='timer-fill';
    el.timerFill.style.width='100%';
    STATE.timerRAF=requestAnimationFrame(updateTimerBar);
    STATE.timerTimeout=setTimeout(function(){
      if(STATE.running) handleTimeout();
    },2000);
  }

  function playCorrectTone(){
    try{
      if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume();
      const osc=audioCtx.createOscillator();
      const gain=audioCtx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(880,audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25,audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime+0.12);
    }catch(e){}
  }

  function renderButtons(){
    const shuffled=shuffleArray([...COLORS]);
    el.targetGrid.innerHTML='';
    shuffled.forEach(function(color){
      const btn=document.createElement('button');
      btn.className='color-target-btn';
      btn.dataset.color=color.id;
      const badge=document.createElement('span');
      badge.className='color-badge';
      badge.style.background=color.hex;
      const label=document.createElement('span');
      label.className='color-name';
      label.textContent=color.name;
      btn.appendChild(badge);
      btn.appendChild(label);
      btn.addEventListener('click',function(){handleChoice(color.id);});
      el.targetGrid.appendChild(btn);
    });
  }

  function generateStimulus(){
    const shuffled=shuffleArray([...COLORS]);
    const wordColor=shuffled[0];
    const inkColor=shuffled[1];
    STATE.currentWordId=wordColor.id;
    STATE.currentInkId=inkColor.id;
    STATE.currentRule=Math.random()<0.5?'color':'meaning';
    STATE.correctAnswer=STATE.currentRule==='color'?inkColor.id:wordColor.id;
    el.stimulus.textContent=wordColor.name.toUpperCase();
    el.stimulus.style.color=inkColor.hex;
    const isColorRule=STATE.currentRule==='color';
    el.ruleBanner.textContent=isColorRule?'RULE: TAP THE TEXT COLOR':'RULE: TAP THE WORD MEANING';
    el.ruleBanner.style.borderColor=isColorRule?'#3b82f6':'#a855f7';
    el.ruleBanner.style.color=isColorRule?'#3b82f6':'#a855f7';
    el.ruleBanner.classList.add('rule-text-mode');
    renderButtons();
  }

  function nextRound(){
    generateStimulus();
    STATE.running=true;
    STATE.locked=false;
    startRoundTimer();
  }

  function handleChoice(chosen){
    if(!STATE.running||STATE.locked)return;
    STATE.locked=true;
    STATE.running=false;
    stopTimer();
    STATE.totalRounds++;
    if(chosen===STATE.correctAnswer){
      STATE.streak++;
      STATE.correctRounds++;
      saveBestStreak();
      updateStats();
      el.timerFill.classList.add('correct');
      playCorrectTone();
      setTimeout(function(){nextRound();},150);
    }else{
      STATE.streak=0;
      saveBestStreak();
      updateStats();
      el.timerFill.classList.add('incorrect');
      el.mainContent.classList.remove('grid-shake');
      void el.mainContent.offsetWidth;
      el.mainContent.classList.add('grid-shake');
      setTimeout(function(){
        el.mainContent.classList.remove('grid-shake');
        nextRound();
      },400);
    }
  }

  function handleTimeout(){
    if(!STATE.running||STATE.locked)return;
    STATE.locked=true;
    STATE.running=false;
    STATE.streak=0;
    STATE.totalRounds++;
    saveBestStreak();
    updateStats();
    el.timerFill.classList.add('incorrect');
    el.mainContent.classList.remove('grid-shake');
    void el.mainContent.offsetWidth;
    el.mainContent.classList.add('grid-shake');
    setTimeout(function(){
      el.mainContent.classList.remove('grid-shake');
      nextRound();
    },400);
  }

  function resetGame(){
    stopTimer();
    STATE.running=false;
    STATE.locked=false;
    STATE.streak=0;
    STATE.totalRounds=0;
    STATE.correctRounds=0;
    el.mainContent.classList.remove('grid-shake');
    el.timerFill.className='timer-fill';
    el.timerFill.style.width='100%';
    updateStats();
    setTimeout(function(){nextRound();},200);
  }

  function init(){
    loadBestStreak();
    updateStats();
    el.resetBtn.addEventListener('click',resetGame);
    setTimeout(function(){nextRound();},300);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();