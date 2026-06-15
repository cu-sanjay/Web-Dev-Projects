(function () {
  'use strict';

  const DATA = {
    profile: { name: 'Shruti Narsulwar', handle: '@Shrutiii01', rating: 1423, rank: '#892', solved: 156 },
    difficulty: { easy: 78, medium: 54, hard: 24 },
    topics: [
      { name: 'Arrays', solved: 28, total: 40, color: '#38bdf8' },
      { name: 'Strings', solved: 18, total: 30, color: '#22c55e' },
      { name: 'Dynamic Programming', solved: 22, total: 50, color: '#a78bfa' },
      { name: 'Graphs', solved: 15, total: 35, color: '#f59e0b' },
      { name: 'Trees', solved: 20, total: 30, color: '#84cc16' },
      { name: 'Sorting & Searching', solved: 25, total: 35, color: '#38bdf8' },
      { name: 'Greedy', solved: 16, total: 25, color: '#f97316' },
      { name: 'Math & Number Theory', solved: 12, total: 25, color: '#ec4899' },
      { name: 'Bit Manipulation', solved: 8, total: 15, color: '#8b5cf6' },
      { name: 'Recursion & Backtracking', solved: 10, total: 20, color: '#14b8a6' }
    ],
    problems: [
      { name: 'Two Sum', difficulty: 'easy', topic: 'Arrays', status: 'done' },
      { name: 'Valid Parentheses', difficulty: 'easy', topic: 'Strings', status: 'done' },
      { name: 'Merge Intervals', difficulty: 'medium', topic: 'Arrays', status: 'done' },
      { name: 'Longest Substring Without Repeating Characters', difficulty: 'medium', topic: 'Strings', status: 'done' },
      { name: 'Trapping Rain Water', difficulty: 'hard', topic: 'Arrays', status: 'done' },
      { name: 'Climbing Stairs', difficulty: 'easy', topic: 'DP', status: 'done' },
      { name: 'Coin Change', difficulty: 'medium', topic: 'DP', status: 'done' },
      { name: 'Edit Distance', difficulty: 'hard', topic: 'DP', status: 'attempted' },
      { name: 'Number of Islands', difficulty: 'medium', topic: 'Graphs', status: 'done' },
      { name: 'Clone Graph', difficulty: 'medium', topic: 'Graphs', status: 'done' },
      { name: 'Binary Tree Level Order Traversal', difficulty: 'medium', topic: 'Trees', status: 'done' },
      { name: 'Maximum Depth of Binary Tree', difficulty: 'easy', topic: 'Trees', status: 'done' },
      { name: 'Binary Search', difficulty: 'easy', topic: 'Searching', status: 'done' },
      { name: 'Merge Sort', difficulty: 'medium', topic: 'Sorting', status: 'done' },
      { name: 'Implement Trie', difficulty: 'medium', topic: 'Trees', status: 'done' },
      { name: 'LRU Cache', difficulty: 'hard', topic: 'Design', status: 'done' },
      { name: 'Serialize and Deserialize Binary Tree', difficulty: 'hard', topic: 'Trees', status: 'done' },
      { name: 'Word Break', difficulty: 'medium', topic: 'DP', status: 'done' },
      { name: 'Longest Palindromic Substring', difficulty: 'medium', topic: 'Strings', status: 'attempted' },
      { name: 'Find Median from Data Stream', difficulty: 'hard', topic: 'Design', status: 'done' },
      { name: 'Rotate Image', difficulty: 'medium', topic: 'Arrays', status: 'done' },
      { name: 'Jump Game', difficulty: 'medium', topic: 'Greedy', status: 'done' },
      { name: 'Combination Sum', difficulty: 'medium', topic: 'Backtracking', status: 'done' },
      { name: 'Subarray Sum Equals K', difficulty: 'medium', topic: 'Arrays', status: 'done' },
      { name: 'Word Search', difficulty: 'medium', topic: 'Backtracking', status: 'done' },
      { name: 'Kth Largest Element', difficulty: 'medium', topic: 'Sorting', status: 'done' },
      { name: 'Minimum Window Substring', difficulty: 'hard', topic: 'Strings', status: 'attempted' },
      { name: 'Decode String', difficulty: 'medium', topic: 'Strings', status: 'done' },
      { name: 'Group Anagrams', difficulty: 'medium', topic: 'Strings', status: 'done' },
      { name: 'Reorder List', difficulty: 'medium', topic: 'Linked List', status: 'done' }
    ],
    recent: [
      { name: 'Longest Palindromic Substring', diff: 'medium', topic: 'Strings', ok: false },
      { name: 'Word Break', diff: 'medium', topic: 'DP', ok: true },
      { name: 'Number of Islands', diff: 'medium', topic: 'Graphs', ok: true },
      { name: 'LRU Cache', diff: 'hard', topic: 'Design', ok: true },
      { name: 'Minimum Window Substring', diff: 'hard', topic: 'Strings', ok: false }
    ],
    activity: [12, 8, 15, 5, 20, 10, 18, 14, 22, 7, 16, 11]
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const $ = (id) => document.getElementById(id);

  const dom = {
    qsSolved: $('qs-solved'), qsRating: $('qs-rating'), qsStreak: $('qs-streak'), qsRank: $('qs-rank'),
    ovEasy: $('ov-easy'), ovMedium: $('ov-medium'), ovHard: $('ov-hard'), ovRating: $('ov-rating'),
    currentDate: $('current-date'),
    activityChart: $('activity-chart'),
    recentList: $('recent-list'),
    topicsGrid: $('topics-grid'),
    ssCurrent: $('ss-current'), ssLongest: $('ss-longest'), ssTotal: $('ss-total'), ssConsistency: $('ss-consistency'),
    streakHeaderInfo: $('streak-header-info'),
    streakCalendar: $('streak-calendar'),
    problemList: $('problem-list'),
    navBtns: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    filterBtns: document.querySelectorAll('.filter-btn')
  };

  function init() {
    dom.currentDate.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    renderOverview();
    renderTopics();
    renderStreaks();
    renderProblems('all');
    setupNavigation();
    setupFilters();
  }

  function renderOverview() {
    dom.qsSolved.textContent = DATA.profile.solved;
    dom.qsRating.textContent = DATA.profile.rating;
    dom.qsStreak.textContent = '12';
    dom.qsRank.textContent = DATA.profile.rank;
    dom.ovEasy.textContent = DATA.difficulty.easy;
    dom.ovMedium.textContent = DATA.difficulty.medium;
    dom.ovHard.textContent = DATA.difficulty.hard;
    dom.ovRating.textContent = DATA.profile.rating;

    const max = Math.max(...DATA.activity);
    let chartHtml = '';
    for (let i = 0; i < DATA.activity.length; i++) {
      const h = Math.max(4, (DATA.activity[i] / max) * 110);
      chartHtml += '<div class="chart-bar" style="height:' + h + 'px;background:' + (DATA.activity[i] > 15 ? '#38bdf8' : DATA.activity[i] > 10 ? '#60a5fa' : '#93c5fd') + '">' +
        '<span class="bar-tooltip">' + MONTHS[i] + ': ' + DATA.activity[i] + ' problems</span></div>';
    }
    dom.activityChart.innerHTML = chartHtml;

    let recentHtml = '';
    for (const r of DATA.recent) {
      recentHtml += '<div class="recent-item">' +
        '<span class="ri-diff ' + r.diff + '">' + r.diff + '</span>' +
        '<span class="ri-name">' + escHtml(r.name) + '</span>' +
        '<span class="ri-topic">' + r.topic + '</span>' +
        '<span class="ri-status ' + (r.ok ? '' : 'wrong') + '">' + (r.ok ? 'Accepted' : 'WA') + '</span></div>';
    }
    dom.recentList.innerHTML = recentHtml;
  }

  function renderTopics() {
    let html = '';
    for (const t of DATA.topics) {
      const pct = Math.round((t.solved / t.total) * 100);
      const color = pct >= 80 ? 'var(--excellent)' : pct >= 50 ? 'var(--good)' : pct >= 30 ? 'var(--moderate)' : 'var(--poor)';
      html += '<div class="topic-card">' +
        '<div class="topic-header"><span class="topic-name">' + escHtml(t.name) + '</span><span class="topic-pct" style="color:' + color + '">' + pct + '%</span></div>' +
        '<div class="topic-bar"><div class="topic-fill" style="width:' + pct + '%;background:' + t.color + '"></div></div>' +
        '<div class="topic-sub"><span>Solved: ' + t.solved + '</span><span>Total: ' + t.total + '</span></div></div>';
    }
    dom.topicsGrid.innerHTML = html;
  }

  function renderStreaks() {
    dom.ssCurrent.textContent = '12';
    dom.ssLongest.textContent = '47';
    dom.ssTotal.textContent = '89';
    dom.ssConsistency.textContent = '68%';
    dom.streakHeaderInfo.textContent = 'Current streak: 12 days';

    const levels = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (let i = 0; i < 30; i++) {
      if (i > 10) levels[i] = Math.floor(Math.random() * 5);
    }
    levels[28] = 4; levels[29] = 4;

    const weekDays = ['Mo','Tu','We','Th','Fr','Sa','Su'];
    let calHtml = '<div class="streak-month"><div class="sm-label">Activity — Last 30 Days</div><div class="sm-grid">';
    for (let i = 0; i < 30; i++) {
      const today = i === 29;
      calHtml += '<div class="sm-day level-' + levels[i] + (today ? ' today"' : '"') + ' title="Day ' + (i + 1) + ': ' + levels[i] + ' problems"></div>';
    }
    calHtml += '</div></div>';
    dom.streakCalendar.innerHTML = calHtml;
  }

  function renderProblems(filter) {
    const filtered = filter === 'all' ? DATA.problems : DATA.problems.filter(p => p.difficulty === filter);
    if (filtered.length === 0) {
      dom.problemList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:30px;">No problems found for this difficulty.</div>';
      return;
    }
    let html = '';
    for (const p of filtered) {
      html += '<div class="problem-item">' +
        '<span class="pi-diff ' + p.difficulty + '"></span>' +
        '<span class="pi-name">' + escHtml(p.name) + '</span>' +
        '<span class="pi-topic">' + p.topic + '</span>' +
        '<span class="pi-status ' + p.status + '">' + (p.status === 'done' ? 'Solved' : 'Attempted') + '</span></div>';
    }
    dom.problemList.innerHTML = html;
  }

  function setupNavigation() {
    dom.navBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        dom.navBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); b.tabIndex = -1; });
        dom.tabContents.forEach(tc => { tc.classList.remove('active'); tc.hidden = true; });
        this.classList.add('active'); this.setAttribute('aria-selected','true'); this.tabIndex = 0;
        const tab = document.getElementById('tab-' + this.dataset.tab);
        if (tab) { tab.classList.add('active'); tab.hidden = false; }
      });
      btn.addEventListener('keydown', function (e) {
        const btns = [...dom.navBtns];
        const idx = btns.indexOf(this);
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); const next = btns[(idx + 1) % btns.length]; next.focus(); next.click(); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const prev = btns[(idx - 1 + btns.length) % btns.length]; prev.focus(); prev.click(); }
      });
    });
  }

  function setupFilters() {
    dom.filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        dom.filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderProblems(this.dataset.filter);
      });
    });
  }

  function escHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  document.addEventListener('DOMContentLoaded', init);
})();
