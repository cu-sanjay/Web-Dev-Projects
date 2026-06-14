(function () {
  'use strict';

  /* ============================================================
     BIOME & QUESTION DATA MATRIX
     ============================================================ */
  const DATA = [
    {
      id: 'rainforest',
      name: 'Amazon Rainforest',
      icon: '🌿',
      desc: 'Earth\'s most biodiverse terrestrial ecosystem',
      questions: [
        {
          q: 'What approximate percentage of Earth\'s land surface does the Amazon Rainforest cover?',
          options: ['0.5%', '2%', '8%', '15%'],
          correct: 1,
          explain: 'The Amazon covers about 2% of Earth\'s land surface yet harbors ~10% of all known species.'
        },
        {
          q: 'How many tree species are estimated to inhabit the Amazon basin?',
          options: ['~3,200', '~8,000', '~16,000', '~50,000'],
          correct: 2,
          explain: 'Studies estimate ~16,000 tree species in the Amazon, though many remain undiscovered.'
        },
        {
          q: 'Which big cat is the apex predator of the Amazon canopy?',
          options: ['Cougar', 'Ocelot', 'Jaguar', 'Margay'],
          correct: 2,
          explain: 'The jaguar is the top predator across the Amazon, controlling prey populations.'
        },
        {
          q: 'What percentage of global freshwater discharge flows through the Amazon River?',
          options: ['~5%', '~10%', '~20%', '~35%'],
          correct: 2,
          explain: 'The Amazon discharges roughly 20% of all freshwater entering Earth\'s oceans.'
        },
        {
          q: 'What is the primary driver of deforestation in the Brazilian Amazon?',
          options: ['Urban expansion', 'Cattle ranching', 'Mining', 'Hydroelectric dams'],
          correct: 1,
          explain: 'Cattle ranching accounts for ~80% of cleared areas in the Brazilian Amazon.'
        },
        {
          q: 'How many indigenous ethnic groups are estimated to live in the Amazon?',
          options: ['~50', '~150', '~400', '~1,200'],
          correct: 2,
          explain: 'Approximately 400 indigenous groups reside in the Amazon, with ~50 living in voluntary isolation.'
        }
      ]
    },
    {
      id: 'desert',
      name: 'Sahara Desert',
      icon: '🏜️',
      desc: 'The world\'s largest hot desert expanse',
      questions: [
        {
          q: 'What is the approximate area of the Sahara Desert?',
          options: ['3.6 million km²', '6.2 million km²', '9.2 million km²', '14.8 million km²'],
          correct: 2,
          explain: 'The Sahara covers ~9.2 million km², nearly the size of China or the United States.'
        },
        {
          q: 'What is the highest recorded temperature in the Sahara?',
          options: ['49.6°C', '57.7°C', '63.2°C', '71.4°C'],
          correct: 1,
          explain: 'The highest reliably recorded temperature in the Sahara is 57.7°C (135.9°F) at Al\'Aziziyah.'
        },
        {
          q: 'A dromedary camel\'s hump primarily stores what substance for long journeys?',
          options: ['Water', 'Fat', 'Glycogen', 'Protein'],
          correct: 1,
          explain: 'Camel humps store up to 36 kg of fat, which serves as an energy reserve and insulates the body.'
        },
        {
          q: 'What is the name for a sea of sand dunes in the Sahara?',
          options: ['Reg', 'Erg', 'Hamada', 'Wadi'],
          correct: 1,
          explain: 'An erg is a vast area of shifting sand dunes. The Grand Erg Oriental spans ~600 km in Algeria.'
        },
        {
          q: 'Which antelope species is adapted to survive months without direct water access?',
          options: ['Gazelle', 'Oryx', 'Addax', 'Springbok'],
          correct: 2,
          explain: 'The addax can survive in temperatures above 50°C by deriving water from the vegetation it eats.'
        },
        {
          q: 'Approximately how much has the Sahara expanded over the past century?',
          options: ['~2%', '~10%', '~25%', '~40%'],
          correct: 1,
          explain: 'The Sahara has expanded ~10% since the early 1900s due to climate change and desertification.'
        }
      ]
    },
    {
      id: 'reef',
      name: 'Great Barrier Reef',
      icon: '🐠',
      desc: 'The largest living structure on Earth',
      questions: [
        {
          q: 'How long is the Great Barrier Reef system?',
          options: ['~800 km', '~1,500 km', '~2,300 km', '~3,400 km'],
          correct: 2,
          explain: 'The Great Barrier Reef stretches ~2,300 km along the Queensland coast of Australia.'
        },
        {
          q: 'What is the primary cause of coral bleaching on the Great Barrier Reef?',
          options: ['Ocean acidification', 'Rising sea temperatures', 'Overfishing', 'Sewage runoff'],
          correct: 1,
          explain: 'Elevated sea temperatures cause corals to expel symbiotic zooxanthellae, leading to bleaching.'
        },
        {
          q: 'How many fish species inhabit the Great Barrier Reef?',
          options: ['~400', '~800', '~1,500', '~3,000'],
          correct: 2,
          explain: 'The reef hosts ~1,500 fish species, 400 coral species, and 4,000 mollusk species.'
        },
        {
          q: 'Which natural predator helps control the destructive crown-of-thorns starfish?',
          options: ['Manta ray', 'Giant triton snail', 'Reef shark', 'Moray eel'],
          correct: 1,
          explain: 'The giant triton snail is one of the few natural predators capable of preying on crown-of-thorns.'
        },
        {
          q: 'In which year did UNESCO propose listing the Great Barrier Reef as endangered?',
          options: ['2015', '2018', '2021', '2023'],
          correct: 2,
          explain: 'UNESCO proposed an endangered listing in 2021 citing three major bleaching events since 2015.'
        },
        {
          q: 'What percentage of the world\'s marine biodiversity does the reef support?',
          options: ['~5%', '~10%', '~25%', '~50%'],
          correct: 2,
          explain: 'Although covering <1% of the ocean, the reef supports ~25% of all marine biodiversity.'
        }
      ]
    },
    {
      id: 'tundra',
      name: 'Arctic Tundra',
      icon: '❄️',
      desc: 'Frozen biome with extreme seasonal contrasts',
      questions: [
        {
          q: 'What is permafrost?',
          options: [
            'Surface ice that never melts',
            'Ground frozen for ≥2 consecutive years',
            'Subsurface glacial remnant',
            'Seasonal frost layer in soil'
          ],
          correct: 1,
          explain: 'Permafrost is ground (soil, sediment, or rock) that remains at or below 0°C for at least two years.'
        },
        {
          q: 'How long is the typical growing season in the Arctic tundra?',
          options: ['10–20 days', '50–60 days', '90–120 days', '150–180 days'],
          correct: 1,
          explain: 'The tundra growing season lasts only 50–60 days, with extremely low precipitation (~150–250 mm/yr).'
        },
        {
          q: 'Which animal species has the largest antler-to-body-size ratio on the tundra?',
          options: ['Moose', 'Caribou', 'Musk ox', 'Arctic hare'],
          correct: 1,
          explain: 'Caribou (reindeer) have proportionally the largest antlers of any deer species, used for foraging through snow.'
        },
        {
          q: 'What approximate fraction of Earth\'s surface does tundra cover?',
          options: ['~1/50', '~1/20', '~1/10', '~1/5'],
          correct: 2,
          explain: 'Tundra ecosystems cover roughly 10% of Earth\'s land surface (~10 million km²).'
        },
        {
          q: 'What is the single greatest threat to Arctic tundra ecosystems?',
          options: ['Oil drilling', 'Climate change', 'Hunting pressure', 'Invasive species'],
          correct: 1,
          explain: 'Climate change is warming the Arctic 2–3× faster than the global average, thawing permafrost and altering habitats.'
        },
        {
          q: 'How deep can permafrost extend in the Siberian Arctic?',
          options: ['~50 m', '~250 m', '~700 m', '~1,500 m'],
          correct: 3,
          explain: 'Siberian permafrost can reach depths exceeding 1,500 m, representing millennia of frozen organic matter.'
        }
      ]
    }
  ];

  /* ============================================================
     BADGE TIERS
     ============================================================ */
  const BADGES = [
    { min: 0, title: 'Seedling Explorer', label: 'SEEDLING' },
    { min: 20, title: 'Biome Tracker', label: 'TRACKER' },
    { min: 40, title: 'Eco Warrior', label: 'WARRIOR' },
    { min: 60, title: 'Conservation Champion', label: 'CHAMPION' },
    { min: 80, title: 'Earth Guardian', label: 'GUARDIAN' }
  ];

  /* ============================================================
     STATE
     ============================================================ */
  const STORAGE_KEY = 'natureExplorerState';

  let state = {
    unlocked: [0],
    completed: [],
    scores: {},            // { biomeIdx: correctCount }
    answers: {},           // { 'bIdx_qIdx': selectedOption }
    correctQuestions: {},  // { 'bIdx_qIdx': true } — correctly answered
    totalPoints: 0,
    badgeTitle: BADGES[0].title,
    badgeLabel: BADGES[0].label,
    currentBiome: null,
    currentQ: 0,
    submittedQ: {}         // { 'bIdx_qIdx': true } — submitted
  };

  /* ============================================================
     DOM REFS
     ============================================================ */
  const $ = id => document.getElementById(id);
  const mapGrid = $('mapGrid');
  const quizBody = $('quizBody');
  const quizIdle = $('quizIdle');
  const quizActive = $('quizActive');
  const quizResult = $('quizResult');
  const quizHint = $('quizHint');
  const quizProgress = $('quizProgress');
  const qCounter = $('qCounter');
  const qText = $('qText');
  const qOptions = $('qOptions');
  const qFeedback = $('qFeedback');
  const btnSubmit = $('btnSubmit');
  const btnPrev = $('btnPrev');
  const btnNext = $('btnNext');
  const btnRetry = $('btnRetry');
  const btnReturn = $('btnReturn');
  const btnAbort = $('btnAbort');
  const btnPurge = $('btnPurge');
  const toastContainer = $('toastContainer');

  // Top metrics
  const chipBiomes = $('chipBiomes');
  const chipLevel = $('chipLevel');
  const scoreDisplay = $('scoreDisplay');
  const badgeDisplay = $('badgeDisplay');

  /* ============================================================
     STATE PERSISTENCE
     ============================================================ */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* storage full */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        Object.assign(state, saved);
        return true;
      }
    } catch (_) { /* corrupt */ }
    return false;
  }

  function resetState() {
    state = {
      unlocked: [0],
      completed: [],
      scores: {},
      answers: {},
      correctQuestions: {},
      totalPoints: 0,
      badgeTitle: BADGES[0].title,
      badgeLabel: BADGES[0].label,
      currentBiome: null,
      currentQ: 0,
      submittedQ: {}
    };
    saveState();
  }

  /* ============================================================
     BADGE CALC
     ============================================================ */
  function getBadge(pts) {
    let badge = BADGES[0];
    for (let i = BADGES.length - 1; i >= 0; i--) {
      if (pts >= BADGES[i].min) { badge = BADGES[i]; break; }
    }
    return badge;
  }

  /* ============================================================
     UPDATE METRICS
     ============================================================ */
  function updateMetrics() {
    const unlockedCount = state.unlocked.length;
    const badge = getBadge(state.totalPoints);
    state.badgeTitle = badge.title;
    state.badgeLabel = badge.label;

    chipBiomes.innerHTML = `BIOMES <strong>${state.completed.length}/${DATA.length}</strong>`;
    chipLevel.innerHTML = `LVL <strong>${badge.label}</strong>`;
    scoreDisplay.textContent = state.totalPoints;
    badgeDisplay.textContent = badge.title;
  }

  /* ============================================================
     RENDER MAP
     ============================================================ */
  function renderMap() {
    mapGrid.innerHTML = '';
    DATA.forEach((biome, idx) => {
      const node = document.createElement('div');
      node.className = 'biome-node';
      node.dataset.idx = idx;

      let statusText, cls;
      if (state.completed.includes(idx)) {
        cls = 'completed';
        statusText = '✓ COMPLETED';
      } else if (state.currentBiome === idx) {
        cls = 'active';
        statusText = '◆ ACTIVE EXPEDITION';
      } else if (state.unlocked.includes(idx)) {
        cls = 'unlocked';
        statusText = '◉ READY';
      } else {
        cls = 'locked';
        statusText = '⊗ LOCKED';
      }
      node.classList.add(cls);

      node.innerHTML = `
        <span class="node-icon">${biome.icon}</span>
        <span class="node-name">${biome.name}</span>
        <span class="node-status">${statusText}</span>
        ${cls === 'locked' ? '<span class="node-lock">🔒</span>' : ''}
      `;

      if (state.completed.includes(idx) || state.unlocked.includes(idx)) {
        node.addEventListener('click', () => selectBiome(idx));
      }

      mapGrid.appendChild(node);
    });
  }

  /* ============================================================
     SELECT BIOME
     ============================================================ */
  function selectBiome(idx) {
    if (state.completed.includes(idx) && state.currentBiome !== idx) {
      // Already completed — show results view
      state.currentBiome = idx;
      renderMap();
      showResult(idx);
      return;
    }
    if (state.currentBiome === idx) return;

    state.currentBiome = idx;
    state.currentQ = 0;
    // Pre-fill any previously submitted answers for this biome
    const prefix = idx + '_';
    Object.keys(state.answers).forEach(k => {
      if (k.startsWith(prefix)) {
        state.submittedQ[k] = true;
      }
    });
    renderMap();
    startQuiz();
  }

  /* ============================================================
     QUIZ: START
     ============================================================ */
  function startQuiz() {
    quizIdle.classList.add('hidden');
    quizResult.classList.add('hidden');
    quizActive.classList.remove('hidden');
    quizHint.textContent = 'active expedition';

    renderQuestion();
  }

  /* ============================================================
     QUIZ: RENDER QUESTION
     ============================================================ */
  function renderQuestion() {
    const bIdx = state.currentBiome;
    const qIdx = state.currentQ;
    const biome = DATA[bIdx];
    const q = biome.questions[qIdx];
    const total = biome.questions.length;
    const qKey = bIdx + '_' + qIdx;
    const isSubmitted = !!state.submittedQ[qKey];
    const selected = state.answers[qKey];

    qCounter.textContent = `Question ${qIdx + 1} / ${total}`;
    qText.textContent = q.q;

    // Progress dots
    quizProgress.innerHTML = '';
    biome.questions.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'q-prog-dot';
      const key = bIdx + '_' + i;
      if (state.submittedQ[key]) {
        const correct = state.answers[key] === DATA[bIdx].questions[i].correct;
        dot.classList.add(correct ? 'correct' : 'wrong');
      }
      if (i === qIdx) dot.classList.add('current');
      quizProgress.appendChild(dot);
    });

    // Options
    qOptions.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, oi) => {
      const el = document.createElement('div');
      el.className = 'q-opt';
      if (isSubmitted) {
        el.classList.add('disabled');
        if (oi === selected) {
          el.classList.add(oi === q.correct ? 'correct' : 'wrong');
        } else if (oi === q.correct) {
          el.classList.add('correct');
        }
      } else if (selected === oi) {
        el.classList.add('selected');
      }
      el.innerHTML = `
        <span class="opt-marker">${isSubmitted && (oi === selected || oi === q.correct) ? (oi === q.correct ? '✓' : '✗') : ''}</span>
        <span class="opt-label">${labels[oi]}</span>
        <span>${opt}</span>
      `;
      if (!isSubmitted) {
        el.addEventListener('click', () => selectOption(oi));
      }
      qOptions.appendChild(el);
    });

    // Feedback
    if (isSubmitted) {
      const correct = selected === q.correct;
      qFeedback.className = 'q-feedback ' + (correct ? 'correct' : 'wrong');
      qFeedback.textContent = correct ? '✓ Correct! ' + q.explain : '✗ ' + q.explain;
      qFeedback.classList.remove('hidden');
    } else {
      qFeedback.classList.add('hidden');
    }

    // Buttons
    btnSubmit.classList.toggle('hidden', isSubmitted);
    btnNext.classList.toggle('hidden', !isSubmitted);
    if (isSubmitted) {
      btnNext.textContent = qIdx < biome.questions.length - 1 ? 'Next ▸' : 'See Results ▸';
    }
    btnPrev.disabled = qIdx === 0;
    btnSubmit.disabled = selected === undefined;
    btnSubmit.style.opacity = selected === undefined ? '0.3' : '1';
  }

  /* ============================================================
     QUIZ: SELECT OPTION
     ============================================================ */
  function selectOption(oi) {
    const k = state.currentBiome + '_' + state.currentQ;
    if (state.submittedQ[k]) return;
    state.answers[k] = oi;
    renderQuestion();
  }

  /* ============================================================
     QUIZ: SUBMIT ANSWER
     ============================================================ */
  function submitAnswer() {
    const bIdx = state.currentBiome;
    const qIdx = state.currentQ;
    const k = bIdx + '_' + qIdx;
    if (state.answers[k] === undefined) return;

    state.submittedQ[k] = true;
    saveState();
    renderQuestion();
    updateMetrics();
  }

  /* ============================================================
     QUIZ: NAVIGATE
     ============================================================ */
  function nextQuestion() {
    const bIdx = state.currentBiome;
    const biome = DATA[bIdx];
    if (state.currentQ < biome.questions.length - 1) {
      state.currentQ++;
      renderQuestion();
    } else {
      // End of quiz — calculate results
      calculateResult(bIdx);
    }
  }

  function prevQuestion() {
    if (state.currentQ > 0) {
      state.currentQ--;
      renderQuestion();
    }
  }

  /* ============================================================
     CALCULATE RESULT
     ============================================================ */
  function calculateResult(bIdx) {
    const biome = DATA[bIdx];
    const total = biome.questions.length;
    let correct = 0;

    biome.questions.forEach((q, idx) => {
      const k = bIdx + '_' + idx;
      if (state.answers[k] === q.correct) {
        correct++;
        if (!state.correctQuestions[k]) {
          state.correctQuestions[k] = true;
          state.totalPoints += 5;
        }
      }
    });

    state.scores[bIdx] = correct;
    const pct = (correct / total) * 100;
    const passed = pct >= 75;

    const badge = getBadge(state.totalPoints);
    state.badgeTitle = badge.title;
    state.badgeLabel = badge.label;

    if (passed && !state.completed.includes(bIdx)) {
      state.completed.push(bIdx);
      const nextIdx = bIdx + 1;
      if (nextIdx < DATA.length && !state.unlocked.includes(nextIdx)) {
        state.unlocked.push(nextIdx);
        showToast('🔓 New biome unlocked: ' + DATA[nextIdx].name, 4000);
      }
    }

    saveState();
    renderMap();
    updateMetrics();
    showResult(bIdx);
  }

  /* ============================================================
     SHOW RESULT
     ============================================================ */
  function showResult(bIdx) {
    quizIdle.classList.add('hidden');
    quizActive.classList.add('hidden');
    quizResult.classList.remove('hidden');
    quizHint.textContent = 'expedition concluded';

    const biome = DATA[bIdx];
    const total = biome.questions.length;
    const correct = state.scores[bIdx] || 0;
    const pct = (correct / total) * 100;
    const passed = pct >= 75;
    const isCompleted = state.completed.includes(bIdx);

    if (isCompleted && passed) {
      $('resultIcon').textContent = '🏆';
      $('resultTitle').textContent = 'Biome Cataloged Successfully';
      $('resultMsg').textContent = `You've fully documented the ${biome.name}. Your ecological knowledge advances the expedition.`;
      $('resultBadge').classList.remove('hidden');
      $('resultBadge').textContent = '✦ ' + state.badgeTitle;
      btnRetry.classList.add('hidden');
      btnReturn.textContent = 'Return to Map';
    } else if (passed) {
      $('resultIcon').textContent = '🌟';
      $('resultTitle').textContent = 'Expedition Threshold Met';
      $('resultMsg').textContent = `Accuracy ${pct.toFixed(0)}% — you meet the 75% threshold. Next biome unlocking. New badge awarded: ${state.badgeTitle}.`;
      $('resultBadge').classList.remove('hidden');
      $('resultBadge').textContent = '✦ ' + state.badgeTitle;
      btnRetry.classList.add('hidden');
      btnReturn.textContent = 'Return to Map';
    } else {
      $('resultIcon').textContent = '🔬';
      $('resultTitle').textContent = 'Insufficient Classification Data';
      $('resultMsg').textContent = `Accuracy ${pct.toFixed(0)}% requires ≥75% to unlock the next biome. Review the ecosystem data and re-attempt.`;
      $('resultBadge').classList.add('hidden');
      btnRetry.classList.remove('hidden');
      btnReturn.textContent = 'Return to Map';
    }

    $('resultScore').textContent = `Score: ${correct}/${total} (${pct.toFixed(0)}%)`;
    $('resultScore').style.color = passed ? '#00e676' : '#ffb800';
  }

  /* ============================================================
     RETRY / RETURN
     ============================================================ */
  function retryBiome() {
    const bIdx = state.currentBiome;
    const prefix = bIdx + '_';
    Object.keys(state.answers).forEach(k => {
      if (k.startsWith(prefix)) {
        delete state.answers[k];
        delete state.submittedQ[k];
      }
    });
    if (state.scores[bIdx]) delete state.scores[bIdx];
    state.currentQ = 0;
    saveState();
    startQuiz();
  }

  function returnToMap() {
    state.currentBiome = null;
    state.currentQ = 0;
    quizResult.classList.add('hidden');
    quizActive.classList.add('hidden');
    quizIdle.classList.remove('hidden');
    quizHint.textContent = 'awaiting deployment';
    renderMap();
    updateMetrics();
  }

  /* ============================================================
     ABORT EXPEDITION
     ============================================================ */
  function abortExpedition() {
    if (state.currentBiome === null) return;
    state.currentBiome = null;
    state.currentQ = 0;
    quizResult.classList.add('hidden');
    quizActive.classList.add('hidden');
    quizIdle.classList.remove('hidden');
    quizHint.textContent = 'awaiting deployment';
    renderMap();
    updateMetrics();
    showToast('⏹ Expedition aborted. Return to map standby.', 2000);
  }

  /* ============================================================
     PURGE ALL PROGRESS
     ============================================================ */
  function purgeAll() {
    resetState();
    returnToMap();
    showToast('♻️ All progress purged. Map sockets re-seeded for genesis run.', 3000);
  }

  /* ============================================================
     TOAST
     ============================================================ */
  function showToast(msg, duration) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => el.remove(), 250);
    }, duration || 2500);
  }

  /* ============================================================
     KEYBOARD
     ============================================================ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !quizActive.classList.contains('hidden')) {
      if (!btnSubmit.classList.contains('hidden') && !btnSubmit.disabled) submitAnswer();
      else if (!btnNext.classList.contains('hidden')) nextQuestion();
    }
    if (e.key === 'ArrowLeft') prevQuestion();
    if (e.key === 'ArrowRight') nextQuestion();
    if (e.key === '1') selectOption(0);
    if (e.key === '2') selectOption(1);
    if (e.key === '3') selectOption(2);
    if (e.key === '4') selectOption(3);
  });

  /* ============================================================
     EVENT BINDING
     ============================================================ */
  btnSubmit.addEventListener('click', submitAnswer);
  btnNext.addEventListener('click', nextQuestion);
  btnPrev.addEventListener('click', prevQuestion);
  btnRetry.addEventListener('click', retryBiome);
  btnReturn.addEventListener('click', returnToMap);
  btnAbort.addEventListener('click', abortExpedition);
  btnPurge.addEventListener('click', purgeAll);

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    const hasSave = loadState();

    if (!hasSave) {
      resetState();
      showToast('[EXPLORER NETWORK ACCESS ESTABLISHED: COMMENCING GENESIS MAP RUN]', 4000);
    }

    updateMetrics();
    renderMap();
  }

  init();

})();
