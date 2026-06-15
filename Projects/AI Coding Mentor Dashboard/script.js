/**
 * CodeMentor AI - Coding Mentor Dashboard
 * Core Frontend & Sandbox Script Logic
 */

// 1. CHALLLENGES REGISTRY DATABASE
const CHALLENGES_DATABASE = [
  {
    id: "reverse_string",
    title: "Reverse a String",
    difficulty: "Easy",
    desc: "Write a function that accepts a string and returns it in reverse order. Try doing this without using standard JS array reverse utilities for an extra challenge!",
    starter: `function reverseString(str) {
  // Write your code here
  
}`,
    example: "Input: \"hello\"\nOutput: \"olleh\"\n\nInput: \"CodeMentor\"\nOutput: \"rotneMedoC\"",
    testCases: [
      { input: "hello", expected: "olleh" },
      { input: "CodeMentor", expected: "rotneMedoC" },
      { input: "", expected: "" }
    ],
    xpReward: 30,
    complexity: "Time Complexity: O(n) | Space Complexity: O(n)",
    optimizedCode: `function reverseString(str) {
  let reversed = "";
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
    concept: {
      title: "String & Character Swaps",
      body: `<p>Strings are immutable lists of characters in JavaScript. To reverse a string, we typically iterate through characters from tail to head, building up a new string sequence.</p>
             <p>Key takeaways:</p>
             <ul>
               <li><strong>Iterative Loops</strong>: Reverse loops let you index elements starting at <code>length - 1</code> down to <code>0</code>.</li>
               <li><strong>Immutability</strong>: Modifying characters directly like <code>str[0] = 'a'</code> fails silently; you must construct a brand new string block.</li>
             </ul>`
    }
  },
  {
    id: "max_value",
    title: "Find Max Value in Array",
    difficulty: "Easy",
    desc: "Write a function that accepts an array of numbers and returns the largest number in that array. Your solution must handle negative numbers as well.",
    starter: `function findMax(arr) {
  // Write your code here
  
}`,
    example: "Input: [1, 5, 3, 9, 2]\nOutput: 9\n\nInput: [-10, -5, -2, -22]\nOutput: -5",
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expected: 9 },
      { input: [[-10, -5, -2, -22]], expected: -5 },
      { input: [[42]], expected: 42 }
    ],
    xpReward: 30,
    complexity: "Time Complexity: O(n) | Space Complexity: O(1)",
    optimizedCode: `function findMax(arr) {
  if (arr.length === 0) return null;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
    concept: {
      title: "Linear Scans",
      body: `<p>Finding elements in unsorted lists requires looking at every element exactly once. This is called a linear scan, operating in O(n) time complexity.</p>
             <p>Key takeaways:</p>
             <ul>
               <li><strong>Baseline Initializers</strong>: Initialize your accumulator using the first array item <code>arr[0]</code> instead of <code>0</code>, as all elements might be negative.</li>
               <li><strong>Short Circuits</strong>: Check if inputs are empty to return early or raise appropriate edge case logs.</li>
             </ul>`
    }
  },
  {
    id: "is_palindrome",
    title: "Palindrome Checker",
    difficulty: "Easy",
    desc: "Write a function that returns true if a given string is a palindrome (reads the same forward and backward). Ignore letter casing, spaces, and punctuation symbols.",
    starter: `function isPalindrome(str) {
  // Write your code here
  
}`,
    example: "Input: \"racecar\"\nOutput: true\n\nInput: \"A man a plan a canal Panama\"\nOutput: true",
    testCases: [
      { input: "racecar", expected: true },
      { input: "hello", expected: false },
      { input: "A man a plan a canal Panama", expected: true }
    ],
    xpReward: 30,
    complexity: "Time Complexity: O(n) | Space Complexity: O(1)",
    optimizedCode: `function isPalindrome(str) {
  // Lowercase and remove non-alphanumeric chars
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  let left = 0;
  let right = cleanStr.length - 1;
  
  while (left < right) {
    if (cleanStr[left] !== cleanStr[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}`,
    concept: {
      title: "Two-Pointer Strategy",
      body: `<p>The two-pointer technique uses indices at the start and end of a structure to move towards each other, comparing character pairings at each step.</p>
             <p>Key takeaways:</p>
             <ul>
               <li><strong>Regex Sanitations</strong>: <code>/[^a-z0-9]/g</code> cleans out symbols, non-alphabetic elements, and whitespace structures.</li>
               <li><strong>Efficiency</strong>: Using pointers checks halves of strings in place, reducing spatial complexity to O(1) compared to array copy allocations.</li>
             </ul>`
    }
  },
  {
    id: "is_prime",
    title: "Check Prime Number",
    difficulty: "Medium",
    desc: "Write a function that returns true if an input number is prime, and false otherwise. Primes are numbers greater than 1 that have no positive divisors other than 1 and themselves.",
    starter: `function isPrime(num) {
  // Write your code here
  
}`,
    example: "Input: 7\nOutput: true\n\nInput: 4\nOutput: false",
    testCases: [
      { input: 7, expected: true },
      { input: 4, expected: false },
      { input: 1, expected: false },
      { input: 2, expected: true }
    ],
    xpReward: 50,
    complexity: "Time Complexity: O(sqrt(n)) | Space Complexity: O(1)",
    optimizedCode: `function isPrime(num) {
  if (num <= 1) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  
  // Test divisibility up to square root of num
  const limit = Math.sqrt(num);
  for (let i = 3; i <= limit; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}`,
    concept: {
      title: "Primality Algorithms",
      body: `<p>A naive divisibility search from 2 to N runs in O(N) steps. We can optimize this by checking divisors up to the square root of N, as divisors pair up symmetrically around it.</p>
             <p>Key takeaways:</p>
             <ul>
               <li><strong>Square Root Limits</strong>: Modulo checking stops at <code>Math.sqrt(num)</code> reducing steps significantly for massive integers.</li>
               <li><strong>Even Elimination</strong>: Eliminate even numbers early on, enabling increments of 2 in divisor checks.</li>
             </ul>`
    }
  },
  {
    id: "fibonacci",
    title: "Fibonacci Sequence Index",
    difficulty: "Medium",
    desc: "Write a function that returns the nth Fibonacci number in the sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21... where fib(0) = 0 and fib(1) = 1.",
    starter: `function fibonacci(n) {
  // Write your code here
  
}`,
    example: "Input: 5\nOutput: 5\n\nInput: 8\nOutput: 21",
    testCases: [
      { input: 5, expected: 5 },
      { input: 0, expected: 0 },
      { input: 8, expected: 21 }
    ],
    xpReward: 50,
    complexity: "Time Complexity: O(n) | Space Complexity: O(1)",
    optimizedCode: `function fibonacci(n) {
  if (n < 0) return 0;
  if (n === 0) return 0;
  if (n === 1) return 1;
  
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`,
    concept: {
      title: "Dynamic Programming vs Recursion",
      body: `<p>Computing Fibonacci numbers using simple double recursion <code>fib(n-1) + fib(n-2)</code> results in exponential time growth O(2^n). Using iteration processes values bottom-up in O(n) linear steps.</p>
             <p>Key takeaways:</p>
             <ul>
               <li><strong>Redundant Computations</strong>: Avoid repeating work. Track state transitions dynamically in variables.</li>
               <li><strong>Iterative Shifts</strong>: Shifting values inside variables like <code>temp = a + b</code> models accumulator states in-place.</li>
             </ul>`
    }
  }
];

// 2. STATE LOGS & LOCAL STORAGE PERSISTENCE
let activeChallengeId = "reverse_string";
let userLevel = 1;
let userXP = 0;
let streakDays = 0;
let lastCodedDate = "";
let solvedChallengesState = {}; // { [challengeId]: boolean }
let unlockedBadges = [];

const BADGES_DATABASE = [
  { id: "first_steps", icon: "fa-solid fa-seedling", title: "First Steps", desc: "Completed first coding challenge." },
  { id: "streak_3", icon: "fa-solid fa-fire-glow", title: "Streak Master", desc: "Coded for 3 consecutive days." },
  { id: "level_3", icon: "fa-solid fa-crown", title: "Ascended Coder", desc: "Reached coder Level 3." },
  { id: "polymath", icon: "fa-solid fa-graduation-cap", title: "Language Polymath", desc: "Solved all easy & medium tasks." }
];

// 3. DOM ELEMENT CACHE
const streakDaysEl = document.getElementById("streak-days");
const userLevelEl = document.getElementById("user-level");
const lblUserRankEl = document.getElementById("lbl-user-rank");
const userXpEl = document.getElementById("user-xp");
const xpTargetEl = document.getElementById("xp-target");
const xpPercentageEl = document.getElementById("xp-percentage");
const xpProgressFillEl = document.getElementById("xp-progress-fill");
const badgesContainerEl = document.getElementById("badges-container");

const easyCountEl = document.getElementById("easy-count");
const easyListEl = document.getElementById("easy-list");
const mediumCountEl = document.getElementById("medium-count");
const mediumListEl = document.getElementById("medium-list");

const activeChallengeTitleEl = document.getElementById("active-challenge-title");
const challengeDescTextEl = document.getElementById("challenge-desc-text");
const challengeExampleBoxEl = document.getElementById("challenge-example-box");

const lineNumbersEl = document.getElementById("line-numbers");
const codeEditorEl = document.getElementById("code-editor");

const btnResetEl = document.getElementById("btn-reset");
const btnRunEl = document.getElementById("btn-run");
const btnSubmitEl = document.getElementById("btn-submit");
const consoleOutputEl = document.getElementById("console-output");
const btnClearConsoleEl = document.getElementById("btn-clear-console");
const btnResetWorkspaceEl = document.getElementById("btn-reset-workspace");

// AI Mentor elements
const chatMessagesEl = document.getElementById("chat-messages");
const chatInputEl = document.getElementById("chat-input");
const btnSendChatEl = document.getElementById("btn-send-chat");

const reviewPlaceholderEl = document.getElementById("review-placeholder");
const reviewDetailsBoxEl = document.getElementById("review-details-box");
const lblQualityScoreEl = document.getElementById("lbl-quality-score");
const reviewBulletsListEl = document.getElementById("review-bullets-list");

const optimizedPlaceholderEl = document.getElementById("optimized-placeholder");
const optimizedDetailsBoxEl = document.getElementById("optimized-details-box");
const codeMentorOptimizedEl = document.getElementById("code-mentor-optimized");
const lblMetricComplexityEl = document.getElementById("lbl-metric-complexity");
const lblMetricSpaceEl = document.getElementById("lbl-metric-space");
const btnInsertCodeEl = document.getElementById("btn-insert-code");

const conceptsPlaceholderEl = document.getElementById("concepts-placeholder");
const conceptsDetailsBoxEl = document.getElementById("concepts-details-box");
const lblConceptTitleEl = document.getElementById("lbl-concept-title");
const lblConceptBodyEl = document.getElementById("lbl-concept-body");

const tabButtons = document.querySelectorAll(".mentor-tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// 4. MAIN INITIALIZER
window.addEventListener("DOMContentLoaded", () => {
  loadWorkspaceData();
  setupEventListeners();
  renderSidebarChallenges();
  loadActiveChallenge(activeChallengeId);
  updateStatsUI();
  updateBadgesUI();
});

// 5. LOCAL STORAGE SYNCS
function loadWorkspaceData() {
  userLevel = parseInt(localStorage.getItem("codementor_level")) || 1;
  userXP = parseInt(localStorage.getItem("codementor_xp")) || 0;
  streakDays = parseInt(localStorage.getItem("codementor_streak")) || 0;
  lastCodedDate = localStorage.getItem("codementor_last_date") || "";
  
  try {
    solvedChallengesState = JSON.parse(localStorage.getItem("codementor_solved")) || {};
  } catch (e) {
    solvedChallengesState = {};
  }

  try {
    unlockedBadges = JSON.parse(localStorage.getItem("codementor_badges")) || [];
  } catch (e) {
    unlockedBadges = [];
  }

  activeChallengeId = localStorage.getItem("codementor_active_id") || "reverse_string";
  
  verifyStreakValidity();
}

function saveWorkspaceData() {
  localStorage.setItem("codementor_level", userLevel);
  localStorage.setItem("codementor_xp", userXP);
  localStorage.setItem("codementor_streak", streakDays);
  localStorage.setItem("codementor_last_date", lastCodedDate);
  localStorage.setItem("codementor_solved", JSON.stringify(solvedChallengesState));
  localStorage.setItem("codementor_badges", JSON.stringify(unlockedBadges));
  localStorage.setItem("codementor_active_id", activeChallengeId);
}

function verifyStreakValidity() {
  if (!lastCodedDate) return;
  const today = new Date().toDateString();
  const lastDate = new Date(lastCodedDate).toDateString();
  
  if (today === lastDate) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (lastDate !== yesterdayStr) {
    // Streak broken
    streakDays = 0;
    localStorage.setItem("codementor_streak", 0);
  }
}

// 6. UI UPDATER METRICS
function updateStatsUI() {
  streakDaysEl.textContent = `${streakDays} Day${streakDays === 1 ? "" : "s"}`;
  userLevelEl.textContent = userLevel;
  
  const xpTarget = userLevel * 100;
  userXpEl.textContent = userXP;
  xpTargetEl.textContent = xpTarget;
  
  const percentage = Math.min(100, Math.round((userXP / xpTarget) * 100));
  xpPercentageEl.textContent = `${percentage}%`;
  xpProgressFillEl.style.width = `${percentage}%`;

  // Update Ranks based on levels
  let rank = "Apprentice Coder";
  if (userLevel >= 5) rank = "Coding Guru";
  else if (userLevel >= 3) rank = "Master Codecraft";
  else if (userLevel >= 2) rank = "Sophomore Dev";
  lblUserRankEl.textContent = `Rank: ${rank}`;
}

function updateBadgesUI() {
  badgesContainerEl.innerHTML = "";
  
  BADGES_DATABASE.forEach(b => {
    const isUnlocked = unlockedBadges.includes(b.id);
    const badgeEl = document.createElement("div");
    badgeEl.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
    badgeEl.setAttribute("data-tooltip", `${b.title}: ${b.desc}`);
    badgeEl.innerHTML = `<i class="${b.icon}"></i>`;
    badgesContainerEl.appendChild(badgeEl);
  });
}

// 7. SIDEBAR & CHALLENGES LOADING
function renderSidebarChallenges() {
  easyListEl.innerHTML = "";
  mediumListEl.innerHTML = "";

  const easyChallenges = CHALLENGES_DATABASE.filter(c => c.difficulty === "Easy");
  const mediumChallenges = CHALLENGES_DATABASE.filter(c => c.difficulty === "Medium");

  const renderItem = (c, container) => {
    const isSolved = !!solvedChallengesState[c.id];
    const item = document.createElement("div");
    item.className = `challenge-item ${activeChallengeId === c.id ? 'active' : ''} ${isSolved ? 'solved' : ''}`;
    
    item.innerHTML = `
      <div class="challenge-meta">
        <div class="challenge-status"><i class="fa-solid fa-check"></i></div>
        <span class="challenge-title">${c.title}</span>
      </div>
      <span class="challenge-xp-badge">+${c.xpReward} XP</span>
    `;

    item.addEventListener("click", () => {
      document.querySelectorAll(".challenge-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      loadActiveChallenge(c.id);
    });

    container.appendChild(item);
  };

  easyChallenges.forEach(c => renderItem(c, easyListEl));
  mediumChallenges.forEach(c => renderItem(c, mediumListEl));

  // Count updates
  const easySolved = easyChallenges.filter(c => solvedChallengesState[c.id]).length;
  easyCountEl.textContent = `${easySolved}/${easyChallenges.length}`;

  const mediumSolved = mediumChallenges.filter(c => solvedChallengesState[c.id]).length;
  mediumCountEl.textContent = `${mediumSolved}/${mediumChallenges.length}`;
}

function loadActiveChallenge(challengeId) {
  activeChallengeId = challengeId;
  const challenge = CHALLENGES_DATABASE.find(c => c.id === challengeId);
  if (!challenge) return;

  saveWorkspaceData();

  activeChallengeTitleEl.textContent = challenge.title;
  challengeDescTextEl.textContent = challenge.desc;
  challengeExampleBoxEl.textContent = challenge.example;

  // Retrieve starter code from localStorage or DB
  const storedCode = localStorage.getItem(`codementor_code_${challengeId}`);
  codeEditorEl.value = storedCode ? storedCode : challenge.starter;

  updateLineNumbers();

  // Load Concept tabs automatically
  conceptsPlaceholderEl.classList.add("hidden");
  conceptsDetailsBoxEl.classList.remove("hidden");
  lblConceptTitleEl.textContent = `Concept: ${challenge.concept.title}`;
  lblConceptBodyEl.innerHTML = challenge.concept.body;

  // Reset results panes to default if not submitted
  hideMentorDetailsPanes();
}

function hideMentorDetailsPanes() {
  reviewDetailsBoxEl.classList.add("hidden");
  reviewPlaceholderEl.classList.remove("hidden");

  optimizedDetailsBoxEl.classList.add("hidden");
  optimizedPlaceholderEl.classList.remove("hidden");
}

// 8. EDITOR SCROLL AND LINE COUNTER SYNC
function updateLineNumbers() {
  const code = codeEditorEl.value;
  const lines = code.split("\n").length;
  let numberHTML = "";
  for (let i = 1; i <= lines; i++) {
    numberHTML += `<div>${i}</div>`;
  }
  lineNumbersEl.innerHTML = numberHTML;
}

// 9. SANDBOX CODE EXECUTION RUNNER
function runCodeTestCases(userCode, challenge, isSubmission = false) {
  let logs = [];
  const originalLog = console.log;
  console.log = function(...args) {
    logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" "));
  };

  let execution = {
    compiled: true,
    passed: true,
    feedback: [],
    logs: logs,
    error: null,
    passCount: 0
  };

  try {
    // Sandboxing using dynamic evaluation
    const wrapper = new Function(`
      ${userCode}
      return {
        reverseString: typeof reverseString !== 'undefined' ? reverseString : null,
        findMax: typeof findMax !== 'undefined' ? findMax : null,
        isPrime: typeof isPrime !== 'undefined' ? isPrime : null,
        fibonacci: typeof fibonacci !== 'undefined' ? fibonacci : null,
        isPalindrome: typeof isPalindrome !== 'undefined' ? isPalindrome : null
      };
    `);

    const exports = wrapper();
    let targetFunc = null;

    if (challenge.id === "reverse_string") targetFunc = exports.reverseString;
    else if (challenge.id === "max_value") targetFunc = exports.findMax;
    else if (challenge.id === "is_prime") targetFunc = exports.isPrime;
    else if (challenge.id === "fibonacci") targetFunc = exports.fibonacci;
    else if (challenge.id === "is_palindrome") targetFunc = exports.isPalindrome;

    if (!targetFunc) {
      throw new Error(`Target function for this challenge was not declared correctly. Check your spelling.`);
    }

    challenge.testCases.forEach((tc, idx) => {
      // Deep clone inputs
      const inputCopy = Array.isArray(tc.input) ? JSON.parse(JSON.stringify(tc.input)) : tc.input;
      let outputVal;

      if (Array.isArray(inputCopy)) {
        outputVal = targetFunc(...inputCopy);
      } else {
        outputVal = targetFunc(inputCopy);
      }

      const isMatch = JSON.stringify(outputVal) === JSON.stringify(tc.expected);
      if (isMatch) {
        execution.passCount++;
        execution.feedback.push(`Test Case ${idx + 1}: Passed ✔ (Returned: ${JSON.stringify(outputVal)})`);
      } else {
        execution.passed = false;
        execution.feedback.push(`Test Case ${idx + 1}: Failed ❌ (Expected: ${JSON.stringify(tc.expected)}, Got: ${JSON.stringify(outputVal)})`);
      }
    });

  } catch (err) {
    execution.compiled = false;
    execution.passed = false;
    execution.error = err.message;
  } finally {
    console.log = originalLog;
  }

  return execution;
}

// 10. HEURISTIC AI MENTOR SYSTEM
function processMentorReview(userCode, challenge, execution) {
  // A. Review Comments Generator
  reviewPlaceholderEl.classList.add("hidden");
  reviewDetailsBoxEl.classList.remove("hidden");

  let bulletPoints = [];
  let codeScore = 100;

  if (!execution.compiled) {
    codeScore = 10;
    bulletPoints.push({
      type: "incorrect",
      text: `<strong>Compilation Error</strong>: ${execution.error}. Verify parentheses pairings, object checks, or variable scopes.`
    });
  } else {
    // 1. Correctness checks
    if (execution.passed) {
      bulletPoints.push({
        type: "correct",
        text: "<strong>Correctness</strong>: Code passes all validation tests! The output outputs match correct expected indices."
      });
    } else {
      codeScore -= 30;
      bulletPoints.push({
        type: "incorrect",
        text: `<strong>Correctness Issues</strong>: Solved ${execution.passCount} of ${challenge.testCases.length} tests. Re-check loops bounds and logic parameters.`
      });
    }

    // 2. Linting and best practices
    const hasConsoleLog = userCode.includes("console.log");
    if (hasConsoleLog) {
      codeScore -= 5;
      bulletPoints.push({
        type: "warning",
        text: "<strong>Quality Nudge</strong>: Extraneous <code>console.log</code> instances found. Clean up diagnostic logs before submissions."
      });
    }

    const hasVar = /\bvar\b/.test(userCode);
    if (hasVar) {
      codeScore -= 10;
      bulletPoints.push({
        type: "warning",
        text: "<strong>Modern Standard</strong>: Used legacy keyword <code>var</code>. Prefer block-scoped variables using <code>let</code> or <code>const</code>."
      });
    } else {
      bulletPoints.push({
        type: "correct",
        text: "<strong>Modern Standard</strong>: Excellent! Proper ES6 block scopes applied cleanly using <code>let</code> and <code>const</code>."
      });
    }

    // 3. Complexity Heuristics
    if (challenge.id === "reverse_string") {
      const hasReverseFunc = userCode.includes(".reverse()");
      if (hasReverseFunc) {
        bulletPoints.push({
          type: "warning",
          text: "<strong>Algorithmic Challenge</strong>: Used standard array reverse utility. Re-design using manual character loops to master indexes."
        });
      } else {
        bulletPoints.push({
          type: "correct",
          text: "<strong>Design Pattern</strong>: Swapped characters manually in O(n) linear complexity without cheating arrays."
        });
      }
    }

    if (challenge.id === "fibonacci") {
      const isRecursive = /fibonacci\s*\(.*-/.test(userCode);
      if (isRecursive) {
        codeScore -= 15;
        bulletPoints.push({
          type: "warning",
          text: "<strong>Recursion Caution</strong>: Used recursive loops. This results in exponential time growth O(2^n). Optimize iteratively."
        });
      } else {
        bulletPoints.push({
          type: "correct",
          text: "<strong>Complexity</strong>: Iterated iteratively in linear O(n) steps, minimizing stack allocations."
        });
      }
    }
  }

  // Set Score
  lblQualityScoreEl.textContent = `${Math.max(10, codeScore)}%`;
  
  // Render bullets
  reviewBulletsListEl.innerHTML = "";
  bulletPoints.forEach(pt => {
    const li = document.createElement("li");
    li.className = `review-bullet-item ${pt.type}`;
    let icon = "fa-solid fa-circle-check";
    if (pt.type === "incorrect") icon = "fa-solid fa-circle-xmark";
    else if (pt.type === "warning") icon = "fa-solid fa-triangle-exclamation";

    li.innerHTML = `<i class="${icon}"></i> <span>${pt.text}</span>`;
    reviewBulletsListEl.appendChild(li);
  });

  // B. Optimized Refactored Code loader
  optimizedPlaceholderEl.classList.add("hidden");
  optimizedDetailsBoxEl.classList.remove("hidden");
  codeMentorOptimizedEl.textContent = challenge.optimizedCode;
  
  // Set complexity values
  const compSplit = challenge.complexity.split(" | ");
  lblMetricComplexityEl.textContent = compSplit[0].replace("Time Complexity: ", "");
  lblMetricSpaceEl.textContent = compSplit[1].replace("Space Complexity: ", "");

  // Auto switch mentor panel tabs to display review
  switchMentorTab("review");

  // Send review notification in chat bubble
  addMessage("assistant", `I have completed an assessment on your submission for **${challenge.title}**. Click the **Review** and **Code** tabs to see detailed feedback and my optimized solution!`);
}

function processMentorChat(userInput) {
  const text = userInput.trim().toLowerCase();
  let reply = "";

  if (text.includes("let") || text.includes("const") || text.includes("var")) {
    reply = `In modern JavaScript (ES6), <code>const</code> stands for constant references (cannot be reassigned). <code>let</code> is for block-scoped values that change. Avoid using legacy <code>var</code> variables because they ignore block levels and cause hoisting bugs!`;
  } else if (text.includes("recursion") || text.includes("recursive")) {
    reply = `Recursion is when a function calls itself to solve smaller pieces of a problem. Be sure to include a **base case** to stop the process, or you will run into a <strong>Stack Overflow</strong> error!`;
  } else if (text.includes("complexity") || text.includes("time complexity") || text.includes("o(")) {
    reply = `Time complexity describes how computation steps scale as inputs grow. For instance, **O(1)** is constant time (instant), **O(n)** is linear (grows directly with inputs), and **O(n²)** indicates loops nested within loops.`;
  } else if (text.includes("optimize") || text.includes("slow")) {
    reply = `To optimize code performance: 
      1. Eliminate redundant nested loops. 
      2. Store repeated computation states in variables instead of re-running them. 
      3. Use pointers or indexes to review inputs in place, avoiding allocating memory variables.`;
  } else {
    // Contextual tip about active challenge
    const challenge = CHALLENGES_DATABASE.find(c => c.id === activeChallengeId);
    reply = `I see you are working on **${challenge.title}**. Remember to verify edge cases: like empty arrays, strings with capital letters, or integers smaller than zero. Let me know if you would like me to explain the core concepts of this problem!`;
  }

  addMessage("assistant", reply);
}

// 11. GAMIFICATION ENGINE LOGIC
function triggerChallengeSuccess(challenge) {
  // If not solved before, reward XP
  if (!solvedChallengesState[challenge.id]) {
    solvedChallengesState[challenge.id] = true;
    userXP += challenge.xpReward;
    
    // Check level ups
    let xpTarget = userLevel * 100;
    while (userXP >= xpTarget) {
      userXP -= xpTarget;
      userLevel++;
      xpTarget = userLevel * 100;
      addMessage("assistant", `🎉 **CONGRATULATIONS!** You have leveled up! You are now **Level ${userLevel}**. Keep solving problems to reach higher ranks!`);
    }

    // Check streak counts
    const todayStr = new Date().toDateString();
    if (lastCodedDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastCodedDate === yesterdayStr) {
        streakDays++;
      } else {
        streakDays = 1;
      }
      lastCodedDate = todayStr;
    }

    checkBadgeUnlocks();
    saveWorkspaceData();
    updateStatsUI();
    updateBadgesUI();
    renderSidebarChallenges();
  }
}

function checkBadgeUnlocks() {
  // 1. First steps
  if (!unlockedBadges.includes("first_steps")) {
    unlockedBadges.push("first_steps");
    addMessage("assistant", "🏆 **Badge Unlocked**: *First Steps* (Completed your first challenge successfully!)");
  }

  // 2. Streak 3
  if (streakDays >= 3 && !unlockedBadges.includes("streak_3")) {
    unlockedBadges.push("streak_3");
    addMessage("assistant", "🏆 **Badge Unlocked**: *Streak Master* (Coded for 3 consecutive days!)");
  }

  // 3. Level 3
  if (userLevel >= 3 && !unlockedBadges.includes("level_3")) {
    unlockedBadges.push("level_3");
    addMessage("assistant", "🏆 **Badge Unlocked**: *Ascended Coder* (Reached programmer level 3!)");
  }

  // 4. Polymath (solve all 5)
  const totalSolvedCount = CHALLENGES_DATABASE.filter(c => solvedChallengesState[c.id]).length;
  if (totalSolvedCount === CHALLENGES_DATABASE.length && !unlockedBadges.includes("polymath")) {
    unlockedBadges.push("polymath");
    addMessage("assistant", "🏆 **Badge Unlocked**: *Language Polymath* (Solved all easy and medium challenges on the board!)");
  }
}

// 12. CHAT RENDERING CONTROLLERS
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender === 'user' ? 'user-msg' : 'assistant-msg'}`;
  
  const icon = sender === 'user' ? 'fa-solid fa-user-ninja' : 'fa-solid fa-robot';
  
  msg.innerHTML = `
    <div class="msg-avatar"><i class="${icon}"></i></div>
    <div class="msg-bubble"><p>${text}</p></div>
  `;

  chatMessagesEl.appendChild(msg);
  
  // Scroll to bottom
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function switchMentorTab(tabName) {
  tabButtons.forEach(btn => {
    if (btn.getAttribute("data-tab") === tabName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  tabPanes.forEach(pane => {
    if (pane.id === `pane-${tabName}`) {
      pane.classList.add("active");
    } else {
      pane.classList.remove("active");
    }
  });
}

// 13. EVENT LISTENERS SETUP
function setupEventListeners() {
  
  // Editor changes line number calculation
  codeEditorEl.addEventListener("input", () => {
    updateLineNumbers();
    // Cache current typing state
    localStorage.setItem(`codementor_code_${activeChallengeId}`, codeEditorEl.value);
  });

  codeEditorEl.addEventListener("scroll", () => {
    lineNumbersEl.scrollTop = codeEditorEl.scrollTop;
  });

  // Editor reset template
  btnResetEl.addEventListener("click", () => {
    const challenge = CHALLENGES_DATABASE.find(c => c.id === activeChallengeId);
    if (challenge && confirm("Reset code editor to starter template? This deletes unsaved changes in active challenge.")) {
      codeEditorEl.value = challenge.starter;
      updateLineNumbers();
      localStorage.removeItem(`codementor_code_${activeChallengeId}`);
      
      const systemLog = document.createElement("span");
      systemLog.className = "system-log";
      systemLog.textContent = `Editor template reset for challenge: ${challenge.title}`;
      consoleOutputEl.appendChild(systemLog);
      consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
    }
  });

  // Run code check
  btnRunEl.addEventListener("click", () => {
    const challenge = CHALLENGES_DATABASE.find(c => c.id === activeChallengeId);
    if (!challenge) return;

    const code = codeEditorEl.value;
    const execution = runSandbox(code, challenge.testCases, challenge.id); // Wait, runSandbox vs runCodeTestCases
    
    // We declared execution = runSandbox in description but runCodeTestCases is robust
    const result = runCodeTestCases(code, challenge);
    
    // Render console
    consoleOutputEl.innerHTML = "";
    
    // System log
    const sysLog = document.createElement("span");
    sysLog.className = "system-log";
    sysLog.textContent = `Running tests for challenge: ${challenge.title}...`;
    consoleOutputEl.appendChild(sysLog);

    // Logs captured
    if (result.logs.length > 0) {
      result.logs.forEach(log => {
        const span = document.createElement("span");
        span.className = "user-log";
        span.textContent = `[Log]: ${log}`;
        consoleOutputEl.appendChild(span);
      });
    }

    if (!result.compiled) {
      const errSpan = document.createElement("span");
      errSpan.className = "error-log";
      errSpan.textContent = `Compilation Error: ${result.error}`;
      consoleOutputEl.appendChild(errSpan);
    } else {
      result.feedback.forEach(fb => {
        const span = document.createElement("span");
        span.className = fb.includes("Passed") ? "success-log" : "error-log";
        span.textContent = fb;
        consoleOutputEl.appendChild(span);
      });

      const finalSpan = document.createElement("span");
      finalSpan.className = result.passed ? "success-log" : "error-log";
      finalSpan.innerHTML = result.passed ? "<strong>All test cases passed successfully! Ready to submit.</strong>" : "<strong>Some test cases failed. Debug your logic inputs.</strong>";
      consoleOutputEl.appendChild(finalSpan);
    }

    consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
  });

  // Submit code for reviews
  btnSubmitEl.addEventListener("click", () => {
    const challenge = CHALLENGES_DATABASE.find(c => c.id === activeChallengeId);
    if (!challenge) return;

    const code = codeEditorEl.value;
    const result = runCodeTestCases(code, challenge);

    consoleOutputEl.innerHTML = "";
    
    const sysLog = document.createElement("span");
    sysLog.className = "system-log";
    sysLog.textContent = `Evaluating solution for: ${challenge.title}...`;
    consoleOutputEl.appendChild(sysLog);

    if (!result.compiled) {
      const errSpan = document.createElement("span");
      errSpan.className = "error-log";
      errSpan.textContent = `Evaluation failed. Fix compilation errors before submitting.`;
      consoleOutputEl.appendChild(errSpan);
      
      // Load mentor critique
      processMentorReview(code, challenge, result);
    } else if (!result.passed) {
      const failSpan = document.createElement("span");
      failSpan.className = "error-log";
      failSpan.textContent = `Submission failed. Solution does not pass all validations.`;
      consoleOutputEl.appendChild(failSpan);

      // Load mentor critique
      processMentorReview(code, challenge, result);
    } else {
      const passSpan = document.createElement("span");
      passSpan.className = "success-log";
      passSpan.innerHTML = `<strong>Challenge Solved! +${challenge.xpReward} XP earned.</strong>`;
      consoleOutputEl.appendChild(passSpan);

      triggerChallengeSuccess(challenge);
      processMentorReview(code, challenge, result);
    }

    consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
  });

  // Clear Console output window
  btnClearConsoleEl.addEventListener("click", () => {
    consoleOutputEl.innerHTML = `<span class="system-log">Console cleared.</span>`;
  });

  // Reset workspace state logs
  btnResetWorkspaceEl.addEventListener("click", () => {
    if (confirm("Reset all Coding Mentor progress, including resolved challenges, unlocked badges, streaks, and user levels? This cannot be undone.")) {
      localStorage.clear();
      solvedChallengesState = {};
      unlockedBadges = [];
      userLevel = 1;
      userXP = 0;
      streakDays = 0;
      lastCodedDate = "";
      
      saveWorkspaceData();
      updateStatsUI();
      updateBadgesUI();
      renderSidebarChallenges();
      loadActiveChallenge("reverse_string");

      consoleOutputEl.innerHTML = `<span class="system-log">Workspace reset complete. All stored memory erased.</span>`;
      chatMessagesEl.innerHTML = `
        <div class="message assistant-msg">
          <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
          <div class="msg-bubble">
            <p>Welcome, student! I am Sensei.ai, your personalized programming tutor. How can I assist you on your coding journey today?</p>
          </div>
        </div>
      `;
    }
  });

  // Chat message submit actions
  const triggerSendChat = () => {
    const text = chatInputEl.value.trim();
    if (!text) return;

    addMessage("user", text);
    chatInputEl.value = "";

    // Simulate AI thinking and replying
    setTimeout(() => {
      processMentorChat(text);
    }, 400);
  };

  btnSendChatEl.addEventListener("click", triggerSendChat);
  chatInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      triggerSendChat();
    }
  });

  // Handle clicking chat suggestions directly
  chatMessagesEl.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("chat-suggestion-btn")) {
      const text = e.target.textContent;
      chatInputEl.value = text;
      triggerSendChat();
    }
  });

  // Copy refactored mentor code to editor
  btnInsertCodeEl.addEventListener("click", () => {
    const challenge = CHALLENGES_DATABASE.find(c => c.id === activeChallengeId);
    if (challenge && confirm("Copy the optimized mentor code directly into your code editor? This overwrites your current work.")) {
      codeEditorEl.value = challenge.optimizedCode;
      updateLineNumbers();
      localStorage.setItem(`codementor_code_${activeChallengeId}`, challenge.optimizedCode);

      const span = document.createElement("span");
      span.className = "info-log";
      span.textContent = `Optimized code copied into editor template.`;
      consoleOutputEl.appendChild(span);
      consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
    }
  });

  // Mentor Tab switcher
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchMentorTab(tabName);
    });
  });

  // Tab key intercept within code editor to insert two spaces instead of switching focus
  codeEditorEl.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = codeEditorEl.selectionStart;
      const end = codeEditorEl.selectionEnd;
      const value = codeEditorEl.value;

      codeEditorEl.value = value.substring(0, start) + "  " + value.substring(end);
      codeEditorEl.selectionStart = codeEditorEl.selectionEnd = start + 2;
      updateLineNumbers();
    }
  });
}
