(function(){
  'use strict';

  const ROWS = 4;
  const COLS = 4;

  const STATE = {
    board: [],
    selected: [],
    target: 0,
    constraint: { type: 'none' },
    score: 0,
    targetsCleared: 0,
    streak: 0,
    multiplier: 1,
    timeLeft: 60,
    timer: null,
    running: false,
    locked: false
  };

  const el = {
    score: document.getElementById('score-display'),
    targets: document.getElementById('targets-display'),
    multiplier: document.getElementById('multiplier-display'),
    timerSeconds: document.getElementById('timer-seconds'),
    restartBtn: document.getElementById('restart-btn'),
    targetValue: document.getElementById('target-value'),
    constraintBadge: document.getElementById('constraint-badge'),
    grid: document.getElementById('matrix-grid'),
    overlay: document.getElementById('game-over-overlay'),
    finalScore: document.getElementById('final-score'),
    finalTargets: document.getElementById('final-targets'),
    finalBest: document.getElementById('final-best'),
    bestStat: document.getElementById('best-stat'),
    playAgainBtn: document.getElementById('play-again-btn'),
    highScore: document.getElementById('high-score'),
    hsDisplay: document.getElementById('hs-display')
  };

  const tiles = Array.from(document.querySelectorAll('.matrix-tile'));

  function shuffleArray(arr){
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  function randomInt(min,max){
    return min+Math.floor(Math.random()*(max-min+1));
  }

  function getTileElement(row,col){
    return document.querySelector(`.matrix-tile[data-row="${row}"][data-col="${col}"]`);
  }

  function removeClassAll(className){
    tiles.forEach(t=>t.classList.remove(className));
  }

  function clearFeedbackTimers(){
    if (STATE._shakeTimer){
      clearTimeout(STATE._shakeTimer);
      STATE._shakeTimer=null;
    }
    if (STATE._fadeTimer){
      clearTimeout(STATE._fadeTimer);
      STATE._fadeTimer=null;
    }
  }

  function generateBoard(){
    const board=[];
    for(let r=0;r<ROWS;r++){
      const row=[];
      for(let c=0;c<COLS;c++){
        row.push(randomInt(1,9));
      }
      board.push(row);
    }
    return board;
  }

  function renderBoard(newPositions){
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const tile=getTileElement(r,c);
        tile.textContent=STATE.board[r][c];
        tile.classList.remove('enter');
      }
    }
    if(newPositions){
      newPositions.forEach(({row,col})=>{
        const tile=getTileElement(row,col);
        tile.classList.add('enter');
      });
    }
  }

  function generatePuzzle(){
    const positions=[];
    for(let r=0;r<ROWS;r++)
      for(let c=0;c<COLS;c++)
        positions.push({row:r,col:c});

    const count=randomInt(2,4);
    const picked=shuffleArray([...positions]).slice(0,count);
    const sum=picked.reduce((s,p)=>s+STATE.board[p.row][p.col],0);

    const allEven=picked.every(p=>STATE.board[p.row][p.col]%2===0);
    const allOdd=picked.every(p=>STATE.board[p.row][p.col]%2===1);

    const options=[{type:'none'}];
    if(allEven)options.push({type:'even'});
    if(allOdd)options.push({type:'odd'});
    options.push({type:'blocks',value:count});

    const constraint=options[randomInt(0,options.length-1)];
    STATE.target=sum;
    STATE.constraint=constraint;
    updatePuzzleDisplay();
  }

  function constraintLabel(c){
    switch(c.type){
      case 'blocks':return `EXACTLY ${c.value} BLOCKS`;
      case 'even':return 'ONLY EVEN NUMBERS';
      case 'odd':return 'ONLY ODD NUMBERS';
      default:return 'SUM ONLY (NO CONSTRAINT)';
    }
  }

  function updatePuzzleDisplay(){
    el.targetValue.textContent=STATE.target;
    el.constraintBadge.textContent='CONSTRAINT: '+constraintLabel(STATE.constraint);
  }

  function updateStats(){
    const acc=STATE.streak;
    STATE.multiplier=1+Math.floor(acc/3);
    el.score.textContent=STATE.score;
    el.targets.textContent=STATE.targetsCleared;
    el.multiplier.textContent=STATE.multiplier+'x';
  }

  function updateTimerDisplay(){
    el.timerSeconds.textContent=STATE.timeLeft;
  }

  function clearSelection(){
    STATE.selected=[];
    removeClassAll('selected');
  }

  function getSum(){
    return STATE.selected.reduce((s,item)=>s+item.value,0);
  }

  function triggerShake(){
    STATE.locked=true;
    STATE.streak=0;
    updateStats();
    STATE.selected.forEach(({row,col})=>{
      getTileElement(row,col).classList.add('shake');
    });
    STATE._shakeTimer=setTimeout(()=>{
      removeClassAll('shake');
      clearSelection();
      if(STATE.running) STATE.locked=false;
    },380);
  }

  function applyGravity(cleared){
    const newPositions=[];
    const clearedSet=new Set(cleared.map(p=>`${p.row},${p.col}`));
    for(let c=0;c<COLS;c++){
      const remaining=[];
      for(let r=ROWS-1;r>=0;r--){
        if(!clearedSet.has(`${r},${c}`)){
          remaining.push(STATE.board[r][c]);
        }
      }
      let ri=0;
      for(let r=ROWS-1;r>=0;r--){
        if(ri<remaining.length){
          STATE.board[r][c]=remaining[ri];
          ri++;
        }else{
          STATE.board[r][c]=randomInt(1,9);
          newPositions.push({row:r,col:c});
        }
      }
    }
    return newPositions;
  }

  function handleSuccess(){
    STATE.locked=true;
    const cleared=STATE.selected.slice();
    cleared.forEach(({row,col})=>{
      getTileElement(row,col).classList.add('fade-out');
    });
    const tileCount=cleared.length;
    STATE.score+=10*tileCount*STATE.multiplier;
    STATE.targetsCleared++;
    STATE.streak++;
    updateStats();
    STATE._fadeTimer=setTimeout(()=>{
      const newPos=applyGravity(cleared);
      removeClassAll('fade-out');
      removeClassAll('selected');
      renderBoard(newPos);
      generatePuzzle();
      STATE.selected=[];
      STATE.locked=false;
    },300);
  }

  function handleTileClick(row,col){
    if(STATE.locked||!STATE.running)return;
    const idx=STATE.selected.findIndex(s=>s.row===row&&s.col===col);
    if(idx!==-1){
      STATE.selected.splice(idx,1);
      getTileElement(row,col).classList.remove('selected');
      return;
    }
    const val=STATE.board[row][col];
    if(STATE.constraint.type==='even'&&val%2!==0){triggerShake();return;}
    if(STATE.constraint.type==='odd'&&val%2===0){triggerShake();return;}
    if(STATE.constraint.type==='blocks'&&STATE.selected.length>=STATE.constraint.value){
      triggerShake();
      return;
    }
    STATE.selected.push({row,col,value:val});
    getTileElement(row,col).classList.add('selected');
    const sum=getSum();
    if(sum>STATE.target){
      triggerShake();
      return;
    }
    if(sum===STATE.target){
      if(STATE.constraint.type==='blocks'&&STATE.selected.length!==STATE.constraint.value){
        triggerShake();
        return;
      }
      handleSuccess();
      return;
    }
  }

  function saveHighScore(score){
    let data={};
    try{
      data=JSON.parse(localStorage.getItem('gridlock-hs'))||{};
    }catch(e){}
    if(!data.highScore||score>data.highScore){
      data.highScore=score;
      data.date=new Date().toISOString();
      localStorage.setItem('gridlock-hs',JSON.stringify(data));
    }
    renderHighScore(data);
  }

  function renderHighScore(data){
    if(data&&data.highScore){
      el.highScore.style.display='flex';
      el.hsDisplay.textContent=data.highScore;
    }
  }

  function loadHighScore(){
    try{
      const data=JSON.parse(localStorage.getItem('gridlock-hs'))||{};
      renderHighScore(data);
    }catch(e){}
  }

  function showGameOver(){
    STATE.running=false;
    STATE.locked=true;
    el.overlay.style.display='flex';
    el.finalScore.textContent=STATE.score;
    el.finalTargets.textContent=STATE.targetsCleared;
    let data={};
    try{
      data=JSON.parse(localStorage.getItem('gridlock-hs'))||{};
    }catch(e){}
    if(data&&data.highScore){
      el.bestStat.style.display='flex';
      el.finalBest.textContent=data.highScore;
    }
    saveHighScore(STATE.score);
  }

  function startGame(){
    clearFeedbackTimers();
    if(STATE.timer){
      clearInterval(STATE.timer);
      STATE.timer=null;
    }
    STATE.running=false;
    STATE.locked=false;
    STATE.score=0;
    STATE.targetsCleared=0;
    STATE.streak=0;
    STATE.multiplier=1;
    STATE.timeLeft=60;
    STATE.selected=[];
    el.overlay.style.display='none';
    removeClassAll('fade-out');
    removeClassAll('shake');
    removeClassAll('selected');
    removeClassAll('enter');
    STATE.board=generateBoard();
    renderBoard();
    generatePuzzle();
    updateStats();
    updateTimerDisplay();
    STATE.running=true;
    STATE.timer=setInterval(()=>{
      STATE.timeLeft--;
      updateTimerDisplay();
      if(STATE.timeLeft<=0){
        clearInterval(STATE.timer);
        STATE.timer=null;
        showGameOver();
      }
    },1000);
  }

  function init(){
    tiles.forEach(tile=>{
      tile.addEventListener('click',function(){
        const row=parseInt(this.dataset.row,10);
        const col=parseInt(this.dataset.col,10);
        handleTileClick(row,col);
      });
    });
    el.restartBtn.addEventListener('click',startGame);
    el.playAgainBtn.addEventListener('click',function(){
      startGame();
    });
    loadHighScore();
    startGame();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();