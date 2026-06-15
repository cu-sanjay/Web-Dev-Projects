(function () {
  'use strict';

  const QUESTIONS = [
    {
      id: 1,
      category: 'Technical',
      question: 'Explain the concept of closure in JavaScript. How does it work and when would you use it?',
      keywords: ['function', 'scope', 'lexical', 'variable', 'inner', 'outer', 'return', 'private', 'callback', 'state'],
      minWords: 15
    },
    {
      id: 2,
      category: 'Technical',
      question: 'What is the difference between REST and GraphQL? When would you choose one over the other?',
      keywords: ['endpoint', 'query', 'mutation', 'overfetching', 'underfetching', 'schema', 'resolver', 'http', 'cache', 'flexible'],
      minWords: 20
    },
    {
      id: 3,
      category: 'System Design',
      question: 'Design a URL shortening service like TinyURL. Walk through the key components and trade-offs.',
      keywords: ['hash', 'database', 'redirect', 'cache', 'load balancer', 'key', 'scalable', 'latency', 'storage', 'replication'],
      minWords: 30
    },
    {
      id: 4,
      category: 'Behavioral',
      question: 'Tell me about a time you had to resolve a conflict within your team. What approach did you take?',
      keywords: ['communication', 'listen', 'compromise', 'solution', 'team', 'feedback', 'resolve', 'understand', 'collaborate', 'improve'],
      minWords: 25
    },
    {
      id: 5,
      category: 'Technical',
      question: 'Explain how the event loop works in JavaScript. What are microtasks and macrotasks?',
      keywords: ['call stack', 'callback', 'promise', 'async', 'queue', 'microtask', 'macrotask', 'event', 'loop', 'execution'],
      minWords: 20
    },
    {
      id: 6,
      category: 'System Design',
      question: 'How would you design a real-time chat application? Discuss the architecture and key decisions.',
      keywords: ['websocket', 'message', 'queue', 'presence', 'notification', 'database', 'horizontal', 'scalability', 'session', 'delivery'],
      minWords: 30
    },
    {
      id: 7,
      category: 'Behavioral',
      question: 'Describe a project where you took initiative beyond your assigned responsibilities. What was the outcome?',
      keywords: ['initiative', 'ownership', 'impact', 'challenge', 'solution', 'responsibility', 'team', 'result', 'improvement', 'learn'],
      minWords: 25
    },
    {
      id: 8,
      category: 'Technical',
      question: 'What is the virtual DOM in React and how does it improve performance? Compare with direct DOM manipulation.',
      keywords: ['virtual', 'dom', 'diff', 'reconciliation', 'update', 'batch', 'render', 'performance', 'component', 'state'],
      minWords: 20
    }
  ];

  const TIME_PER_QUESTION = 120;
  const CIRCUMFERENCE = 263.9;

  const state = {
    currentIndex: 0,
    answers: [],
    timeRemaining: TIME_PER_QUESTION,
    isRunning: false,
    isPaused: false,
    isSessionActive: false,
    totalTimeUsed: 0,
    timerInterval: null,
    startTime: null,
    streak: 0
  };

  const $ = (id) => document.getElementById(id);

  const dom = {
    questionText: $('question-text'),
    questionCategory: $('question-category'),
    questionCounter: $('question-counter'),
    answerInput: $('answer-input'),
    answerStats: $('answer-stats'),
    timerFill: $('timer-fill'),
    timerText: $('timer-text'),
    timerStatus: $('timer-status'),
    progressBarFill: $('progress-bar-fill'),
    progressPct: $('progress-pct'),
    progressDots: $('progress-dots'),
    feedbackScore: $('feedback-score'),
    evalRelevance: $('eval-relevance'),
    evalDepth: $('eval-depth'),
    evalKeywords: $('eval-keywords'),
    evalClarity: $('eval-clarity'),
    feedbackDetail: $('feedback-detail'),
    reportQuestions: $('report-questions'),
    reportQuestionsDetail: $('report-questions-detail'),
    reportAvgScore: $('report-avg-score'),
    reportTime: $('report-time'),
    reportStreak: $('report-streak'),
    interviewerTitle: $('interviewer-title'),
    btnStart: $('btn-start'),
    btnNext: $('btn-next'),
    btnEnd: $('btn-end'),
    btnSubmit: $('btn-submit')
  };

  function init() {
    renderProgressDots();
    dom.btnStart.addEventListener('click', startSession);
    dom.btnNext.addEventListener('click', nextQuestion);
    dom.btnEnd.addEventListener('click', endSession);
    dom.btnSubmit.addEventListener('click', submitAnswer);
    dom.answerInput.addEventListener('input', updateAnswerStats);
  }

  function renderProgressDots() {
    let html = '';
    for (let i = 0; i < QUESTIONS.length; i++) {
      html += '<div class="progress-dot" data-idx="' + i + '">' + (i + 1) + '</div>';
    }
    dom.progressDots.innerHTML = html;
  }

  function updateProgressDots() {
    const dots = dom.progressDots.querySelectorAll('.progress-dot');
    dots.forEach((dot, i) => {
      dot.classList.remove('active', 'answered', 'skipped');
      if (i < state.currentIndex && state.answers[i]) {
        dot.classList.add(state.answers[i].skipped ? 'skipped' : 'answered');
      } else if (i === state.currentIndex && state.isSessionActive) {
        dot.classList.add('active');
      }
    });
  }

  function updateProgressBar() {
    const pct = Math.round((state.currentIndex / QUESTIONS.length) * 100);
    dom.progressBarFill.style.width = pct + '%';
    dom.progressPct.textContent = pct + '%';
  }

  function loadQuestion(index) {
    const q = QUESTIONS[index];
    dom.questionText.textContent = q.question;
    dom.questionCategory.textContent = q.category;
    dom.questionCounter.textContent = (index + 1) + ' / ' + QUESTIONS.length;
    dom.interviewerTitle.textContent = q.category + ' Interview';
    dom.answerInput.value = '';
    dom.answerInput.disabled = false;
    dom.answerInput.focus();
    dom.feedbackScore.textContent = '--';
    dom.feedbackScore.style.color = '';
    dom.evalRelevance.style.width = '0%';
    dom.evalDepth.style.width = '0%';
    dom.evalKeywords.style.width = '0%';
    dom.evalClarity.style.width = '0%';
    dom.feedbackDetail.innerHTML = '<p class="feedback-placeholder">Type your answer and submit for evaluation.</p>';
    dom.answerStats.textContent = '0 words';
    dom.btnSubmit.disabled = false;
    dom.btnNext.disabled = true;
    state.timeRemaining = TIME_PER_QUESTION;
    updateTimerDisplay();
    updateProgressDots();
    updateProgressBar();
  }

  function startSession() {
    state.isSessionActive = true;
    state.currentIndex = 0;
    state.answers = [];
    state.totalTimeUsed = 0;
    state.streak = 0;
    dom.btnStart.disabled = true;
    dom.btnEnd.disabled = false;
    dom.btnNext.disabled = true;
    dom.reportQuestionsDetail.innerHTML = '';
    dom.reportAvgScore.textContent = '--';
    dom.reportTime.textContent = '0:00';
    dom.reportStreak.textContent = '0';
    loadQuestion(0);
    startTimer();
    dom.timerStatus.textContent = 'Question ' + (state.currentIndex + 1);
  }

  function startTimer() {
    state.isRunning = true;
    state.isPaused = false;
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.startTime = Date.now();
    state.timerInterval = setInterval(tick, 100);
  }

  function tick() {
    if (!state.isRunning) return;
    state.timeRemaining -= 0.1;
    if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      updateTimerDisplay();
      handleTimeUp();
      return;
    }
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timeRemaining / 60);
    const secs = Math.floor(state.timeRemaining % 60);
    dom.timerText.textContent = mins + ':' + String(secs).padStart(2, '0');
    const offset = CIRCUMFERENCE - (state.timeRemaining / TIME_PER_QUESTION) * CIRCUMFERENCE;
    dom.timerFill.style.strokeDashoffset = offset;
    if (state.timeRemaining <= 15) {
      dom.timerFill.style.stroke = '#ef4444';
    } else if (state.timeRemaining <= 30) {
      dom.timerFill.style.stroke = '#f59e0b';
    } else {
      dom.timerFill.style.stroke = '#38bdf8';
    }
  }

  function handleTimeUp() {
    clearInterval(state.timerInterval);
    state.isRunning = false;
    dom.timerStatus.textContent = 'Time\'s up!';
    submitAnswer();
  }

  function submitAnswer() {
    const text = dom.answerInput.value.trim();
    const q = QUESTIONS[state.currentIndex];
    const skipped = text.length === 0;
    const elapsed = TIME_PER_QUESTION - state.timeRemaining;
    state.totalTimeUsed += elapsed;

    const evaluation = skipped
      ? { score: 0, relevance: 0, depth: 0, keywords: 0, clarity: 0, matched: [], missing: [], feedback: 'No answer provided.' }
      : evaluateAnswer(text, q);

    state.answers[state.currentIndex] = {
      questionId: q.id,
      category: q.category,
      skipped,
      score: evaluation.score,
      elapsed
    };

    if (evaluation.score >= 70) state.streak++;
    else state.streak = 0;

    renderEvaluation(evaluation);
    dom.btnSubmit.disabled = true;
    dom.answerInput.disabled = true;
    dom.btnNext.disabled = state.currentIndex >= QUESTIONS.length - 1;
    updateProgressDots();
    updateProgressBar();
    clearInterval(state.timerInterval);
    state.isRunning = false;
    dom.timerStatus.textContent = evaluation.score >= 70 ? 'Good answer!' : evaluation.score >= 40 ? 'Needs improvement' : 'Review suggested';
    updateReport();
  }

  function evaluateAnswer(text, q) {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(w => w.length > 1);

    const matched = q.keywords.filter(k => lower.includes(k.toLowerCase()));
    const missing = q.keywords.filter(k => !lower.includes(k.toLowerCase()));
    const kwScore = q.keywords.length > 0 ? Math.round((matched.length / q.keywords.length) * 100) : 0;

    const wordCount = words.length;
    const depthScore = Math.min(100, Math.round((wordCount / q.minWords) * 100));

    let relevance = 50;
    relevance += Math.min(matched.length * 8, 40);
    relevance += wordCount >= q.minWords ? 10 : 0;
    relevance = Math.min(100, relevance);
    if (wordCount < 5) relevance = Math.max(10, relevance - 30);

    const hasStructure = /first|second|then|finally|because|however|therefore|specifically|for example|in addition/i.test(text);
    const clarity = Math.min(100, Math.round(
      30 + (wordCount >= q.minWords ? 20 : 0) +
      (hasStructure ? 20 : 0) +
      (matched.length > 2 ? 15 : 0) +
      (wordCount > 10 ? 15 : 0)
    ));

    const overall = Math.round(relevance * 0.30 + depthScore * 0.20 + kwScore * 0.30 + clarity * 0.20);

    let feedback = '';
    if (overall >= 80) {
      feedback = 'Strong answer. You covered the key concepts well with good depth and structure.';
    } else if (overall >= 60) {
      feedback = 'Solid answer. Try to include more specific technical details and structured reasoning.';
    } else if (overall >= 40) {
      feedback = 'Adequate but room for improvement. Focus on addressing the core question directly with concrete examples.';
    } else {
      feedback = 'Brief answer. Expand with detailed explanations, technical depth, and relevant examples.';
    }

    if (matched.length > 0) {
      feedback += ' Key terms detected: ' + matched.join(', ') + '.';
    }
    if (missing.length > 0 && overall < 70) {
      feedback += ' Consider discussing: ' + missing.slice(0, 4).join(', ') + '.';
    }

    return {
      score: overall,
      relevance: Math.min(100, relevance),
      depth: Math.min(100, depthScore),
      keywords: kwScore,
      clarity,
      matched,
      missing,
      feedback
    };
  }

  function renderEvaluation(eval) {
    dom.feedbackScore.textContent = eval.score;
    dom.feedbackScore.style.color = eval.score >= 80 ? 'var(--excellent)' : eval.score >= 60 ? 'var(--good)' : eval.score >= 40 ? 'var(--moderate)' : 'var(--poor)';
    dom.evalRelevance.style.width = eval.relevance + '%';
    dom.evalRelevance.style.background = eval.relevance >= 80 ? 'var(--excellent)' : eval.relevance >= 60 ? 'var(--good)' : eval.relevance >= 40 ? 'var(--moderate)' : 'var(--poor)';
    dom.evalDepth.style.width = eval.depth + '%';
    dom.evalDepth.style.background = eval.depth >= 80 ? 'var(--excellent)' : eval.depth >= 60 ? 'var(--good)' : eval.depth >= 40 ? 'var(--moderate)' : 'var(--poor)';
    dom.evalKeywords.style.width = eval.keywords + '%';
    dom.evalKeywords.style.background = eval.keywords >= 80 ? 'var(--excellent)' : eval.keywords >= 60 ? 'var(--good)' : eval.keywords >= 40 ? 'var(--moderate)' : 'var(--poor)';
    dom.evalClarity.style.width = eval.clarity + '%';
    dom.evalClarity.style.background = eval.clarity >= 80 ? 'var(--excellent)' : eval.clarity >= 60 ? 'var(--good)' : eval.clarity >= 40 ? 'var(--moderate)' : 'var(--poor)';
    dom.feedbackDetail.innerHTML = '<p>' + escHtml(eval.feedback) + '</p>';
  }

  function nextQuestion() {
    if (state.currentIndex < QUESTIONS.length - 1) {
      state.currentIndex++;
      loadQuestion(state.currentIndex);
      startTimer();
      dom.timerStatus.textContent = 'Question ' + (state.currentIndex + 1);
    }
  }

  function endSession() {
    clearInterval(state.timerInterval);
    state.isRunning = false;
    state.isSessionActive = false;
    dom.btnStart.disabled = false;
    dom.btnEnd.disabled = true;
    dom.btnNext.disabled = true;
    dom.btnSubmit.disabled = true;
    dom.answerInput.disabled = true;
    dom.timerStatus.textContent = 'Session ended';
    dom.questionText.textContent = 'Interview session complete. Review your report below.';
    dom.answerInput.value = '';
    updateProgressDots();
    updateReportSummary();
  }

  function updateAnswerStats() {
    const words = dom.answerInput.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    dom.answerStats.textContent = words + ' words';
  }

  function updateReport() {
    const answered = state.answers.filter(a => a).length;
    const avg = answered > 0 ? Math.round(state.answers.filter(a => a).reduce((s, a) => s + a.score, 0) / answered) : 0;
    const mins = Math.floor(state.totalTimeUsed / 60);
    const secs = Math.floor(state.totalTimeUsed % 60);
    const totalQ = QUESTIONS.length;

    dom.reportQuestions.textContent = answered + ' / ' + totalQ;
    dom.reportAvgScore.textContent = avg;
    dom.reportAvgScore.style.color = avg >= 80 ? 'var(--excellent)' : avg >= 60 ? 'var(--good)' : avg >= 40 ? 'var(--moderate)' : 'var(--poor)';
    dom.reportTime.textContent = mins + ':' + String(secs).padStart(2, '0');
    dom.reportStreak.textContent = state.streak;

    let html = '';
    for (let i = 0; i < state.answers.length; i++) {
      const a = state.answers[i];
      if (!a) continue;
      html += '<div class="rq-item">' +
        '<span class="rq-num">Q' + (i + 1) + '</span>' +
        '<span class="rq-cat">' + a.category + '</span>' +
        '<span class="rq-text">' + (a.skipped ? '[Skipped]' : escHtml(QUESTIONS[i].question.substring(0, 50) + '...')) + '</span>' +
        '<span class="rq-score" style="color:' + (a.score >= 80 ? 'var(--excellent)' : a.score >= 60 ? 'var(--good)' : a.score >= 40 ? 'var(--moderate)' : 'var(--poor)') + '">' + a.score + '</span>' +
        '</div>';
    }
    dom.reportQuestionsDetail.innerHTML = html;
  }

  function updateReportSummary() {
    const answered = state.answers.filter(a => a).length;
    const avg = answered > 0 ? Math.round(state.answers.filter(a => a).reduce((s, a) => s + a.score, 0) / answered) : 0;
    const mins = Math.floor(state.totalTimeUsed / 60);
    const secs = Math.floor(state.totalTimeUsed % 60);

    dom.reportQuestions.textContent = answered + ' / ' + QUESTIONS.length;
    dom.reportAvgScore.textContent = avg;
    dom.reportAvgScore.style.color = avg >= 80 ? 'var(--excellent)' : avg >= 60 ? 'var(--good)' : avg >= 40 ? 'var(--moderate)' : 'var(--poor)';
    dom.reportTime.textContent = mins + ':' + String(secs).padStart(2, '0');
    dom.reportStreak.textContent = state.streak;
  }

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
