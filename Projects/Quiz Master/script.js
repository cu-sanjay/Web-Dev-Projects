(function () {
  var STORAGE_KEY = 'quiz_master_highs';

  var QUESTIONS = {
    science: {
      name: 'Science',
      icon: '\uD83D\uDD2C',
      questions: [
        { q: 'What is the chemical symbol for gold?', opts: ['Au', 'Ag', 'Fe', 'Cu'], ans: 0 },
        { q: 'What planet is known as the Red Planet?', opts: ['Venus', 'Mars', 'Jupiter', 'Saturn'], ans: 1 },
        { q: 'What is the largest organ in the human body?', opts: ['Liver', 'Brain', 'Skin', 'Heart'], ans: 2 },
        { q: 'What gas do plants absorb from the atmosphere?', opts: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], ans: 2 },
        { q: 'What is the speed of light approximately?', opts: ['3\u00d710\u2076 m/s', '3\u00d710\u2078 m/s', '3\u00d710\u00b9\u2070 m/s', '3\u00d710\u00b9\u00b2 m/s'], ans: 1 },
      ],
    },
    technology: {
      name: 'Technology',
      icon: '\uD83D\uDCBB',
      questions: [
        { q: 'What does "CPU" stand for?', opts: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], ans: 0 },
        { q: 'Which company developed the Android OS?', opts: ['Apple', 'Microsoft', 'Google', 'Samsung'], ans: 2 },
        { q: 'What does "HTML" stand for?', opts: ['HyperText Markup Language', 'HighTech Modern Language', 'Home Tool Markup Language', 'Hyper Transfer Markup Language'], ans: 0 },
        { q: 'What year was the first iPhone released?', opts: ['2005', '2006', '2007', '2008'], ans: 2 },
        { q: 'Which programming language is primarily used for iOS development?', opts: ['Kotlin', 'Swift', 'Java', 'C#'], ans: 1 },
      ],
    },
    math: {
      name: 'Mathematics',
      icon: '\uD83D\uDCD0',
      questions: [
        { q: 'What is the value of \u03C0 to two decimal places?', opts: ['3.14', '3.16', '3.12', '3.18'], ans: 0 },
        { q: 'What is the square root of 144?', opts: ['10', '11', '12', '13'], ans: 2 },
        { q: 'What is 15% of 200?', opts: ['20', '25', '30', '35'], ans: 2 },
        { q: 'How many sides does a dodecagon have?', opts: ['10', '11', '12', '13'], ans: 2 },
        { q: 'What is the derivative of x\u00b2?', opts: ['x', '2x', '2', 'x\u00b2'], ans: 1 },
      ],
    },
  };

  var CATEGORIES = Object.keys(QUESTIONS);

  var currentCat = null;
  var currentIdx = 0;
  var score = 0;
  var correctCount = 0;
  var incorrectCount = 0;
  var locked = false;
  var timerId = null;
  var timeLeft = 15;
  var highScores = {};

  /* ---- Elements ---- */
  var categoryScreen = document.getElementById('categoryScreen');
  var categoryGrid = document.getElementById('categoryGrid');
  var quizScreen = document.getElementById('quizScreen');
  var quizCategory = document.getElementById('quizCategory');
  var quizIndex = document.getElementById('quizIndex');
  var timerText = document.getElementById('timerText');
  var timerFill = document.getElementById('timerFill');
  var questionText = document.getElementById('questionText');
  var optionsList = document.getElementById('optionsList');
  var feedbackBanner = document.getElementById('feedbackBanner');
  var nextBtn = document.getElementById('nextBtn');
  var summaryScreen = document.getElementById('summaryScreen');
  var summaryPoints = document.getElementById('summaryPoints');
  var summaryTotal = document.getElementById('summaryTotal');
  var summaryCorrect = document.getElementById('summaryCorrect');
  var summaryIncorrect = document.getElementById('summaryIncorrect');
  var summaryAccuracy = document.getElementById('summaryAccuracy');
  var summaryHigh = document.getElementById('summaryHigh');
  var newBadge = document.getElementById('newBadge');
  var summaryBtn = document.getElementById('summaryBtn');

  /* ---- High scores ---- */
  function loadHighs() {
    try { var r = localStorage.getItem(STORAGE_KEY); if (r) highScores = JSON.parse(r); } catch (e) {}
  }

  function saveHighs() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(highScores)); } catch (e) {}
  }

  function getHigh(cat) { return highScores[cat] || 0; }
  function setHigh(cat, val) {
    if (val > getHigh(cat)) { highScores[cat] = val; saveHighs(); return true; }
    return false;
  }

  /* ---- Category screen ---- */
  function renderCategories() {
    categoryGrid.innerHTML = '';
    CATEGORIES.forEach(function (key) {
      var cat = QUESTIONS[key];
      var high = getHigh(key);
      var card = document.createElement('div');
      card.className = 'cat-card';
      card.innerHTML =
        '<div class="cat-icon">' + cat.icon + '</div>' +
        '<div class="cat-name">' + cat.name + '</div>' +
        '<div class="cat-count">' + cat.questions.length + ' questions</div>' +
        (high > 0 ? '<div class="cat-high">\u2B50 ' + high + '</div>' : '');
      card.addEventListener('click', function () { startQuiz(key); });
      categoryGrid.appendChild(card);
    });
  }

  /* ---- Start quiz ---- */
  function startQuiz(catKey) {
    currentCat = catKey;
    currentIdx = 0;
    score = 0;
    correctCount = 0;
    incorrectCount = 0;
    categoryScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    quizCategory.textContent = QUESTIONS[catKey].name;
    loadQuestion();
  }

  function loadQuestion() {
    var cat = QUESTIONS[currentCat];
    var qs = cat.questions;
    quizIndex.textContent = (currentIdx + 1) + ' / ' + qs.length;
    var q = qs[currentIdx];
    questionText.textContent = q.q;
    feedbackBanner.classList.add('hidden');
    nextBtn.classList.add('hidden');
    locked = false;
    renderOptions(q);
    startTimer();
  }

  function renderOptions(q) {
    optionsList.innerHTML = '';
    q.opts.forEach(function (opt, idx) {
      var btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.dataset.idx = idx;
      btn.addEventListener('click', function () { selectOption(idx); });
      optionsList.appendChild(btn);
    });
  }

  /* ---- Timer ---- */
  function startTimer() {
    timeLeft = 15;
    timerText.textContent = '15s';
    timerFill.style.transition = 'none';
    timerFill.style.width = '100%';
    clearInterval(timerId);

    setTimeout(function () {
      timerFill.style.transition = 'width ' + timeLeft + 's linear';
      timerFill.style.width = '0%';
    }, 20);

    timerId = setInterval(function () {
      timeLeft--;
      timerText.textContent = timeLeft + 's';
      if (timeLeft <= 0) {
        clearInterval(timerId);
        handleTimeout();
      }
    }, 1000);
  }

  function stopTimer() { clearInterval(timerId); }

  function handleTimeout() {
    if (locked) return;
    locked = true;
    incorrectCount++;
    var q = QUESTIONS[currentCat].questions[currentIdx];
    highlightAnswers(q.ans, null);
    feedbackBanner.className = 'incorrect';
    feedbackBanner.textContent = '\u23F0 Time\'s up! The correct answer was: ' + q.opts[q.ans];
    feedbackBanner.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
  }

  /* ---- Selection ---- */
  function selectOption(idx) {
    if (locked) return;
    locked = true;
    stopTimer();

    var q = QUESTIONS[currentCat].questions[currentIdx];
    var isCorrect = idx === q.ans;

    if (isCorrect) { score++; correctCount++; } else { incorrectCount++; }

    highlightAnswers(q.ans, idx);
    feedbackBanner.className = isCorrect ? 'correct' : 'incorrect';
    feedbackBanner.textContent = isCorrect ? '\u2705 Correct!' : '\u274C Incorrect. The correct answer is: ' + q.opts[q.ans];
    feedbackBanner.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
  }

  function highlightAnswers(correctIdx, selectedIdx) {
    var btns = optionsList.querySelectorAll('.option-btn');
    btns.forEach(function (btn, idx) {
      btn.disabled = true;
      if (idx === correctIdx) btn.classList.add('correct');
      else if (idx === selectedIdx) btn.classList.add('incorrect');
      else if (selectedIdx === null && idx !== correctIdx) btn.classList.add('reveal');
    });
  }

  /* ---- Next ---- */
  function nextQuestion() {
    currentIdx++;
    var qs = QUESTIONS[currentCat].questions;
    if (currentIdx >= qs.length) {
      endQuiz();
    } else {
      loadQuestion();
    }
  }

  nextBtn.addEventListener('click', nextQuestion);

  /* ---- End ---- */
  function endQuiz() {
    stopTimer();
    quizScreen.classList.add('hidden');

    var total = QUESTIONS[currentCat].questions.length;
    var pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    var isNew = setHigh(currentCat, score);

    summaryPoints.textContent = score;
    summaryTotal.textContent = total;
    summaryCorrect.textContent = correctCount;
    summaryIncorrect.textContent = incorrectCount;
    summaryAccuracy.textContent = pct + '%';
    summaryHigh.textContent = getHigh(currentCat);

    if (isNew) { newBadge.classList.remove('hidden'); } else { newBadge.classList.add('hidden'); }

    summaryScreen.classList.remove('hidden');
  }

  summaryBtn.addEventListener('click', function () {
    summaryScreen.classList.add('hidden');
    categoryScreen.classList.remove('hidden');
    renderCategories();
  });

  /* ---- Boot ---- */
  loadHighs();
  renderCategories();
})();
