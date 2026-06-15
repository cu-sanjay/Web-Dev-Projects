/**
 * ResuAlign - AI Resume Analyzer & Skill Gap Tracker
 * Core Javascript Logic
 */

// 1. Roles & Skills Database
const ROLES_DATABASE = {
  frontend: {
    title: "Frontend Engineer",
    skills: [
      { id: "html", name: "HTML5", category: "Core Languages", regex: /\bhtml5?\b/i },
      { id: "css", name: "CSS3 / Sass", category: "Core Languages", regex: /\bcss3?\b|\bsass\b/i },
      { id: "javascript", name: "JavaScript (ES6+)", category: "Core Languages", regex: /\bjavascript\b|\bjs\b/i },
      { id: "react", name: "React.js", category: "Frameworks & Libraries", regex: /\breact(\.js)?\b/i },
      { id: "responsive", name: "Responsive Design", category: "UI Development", regex: /\bresponsive( design)?\b|\bflexbox\b|\bcss grid\b/i },
      { id: "a11y", name: "Web Accessibility (a11y)", category: "UI Development", regex: /\baccessibility\b|\ba11y\b|\bw3c\b|\bwai-aria\b/i },
      { id: "git", name: "Git & Version Control", category: "Developer Tools", regex: /\bgit(hub)?\b/i },
      { id: "webpack", name: "Build Tools (Vite/Webpack)", category: "Developer Tools", regex: /\bvite\b|\bwebpack\b|\bparcel\b|\brollup\b/i },
      { id: "performance", name: "Performance Optimization", category: "Advanced Skills", regex: /\bperformance\b|\blazy load\b|\bseo\b/i },
      { id: "npm", name: "NPM / Yarn Package Managers", category: "Developer Tools", regex: /\bnpm\b|\byarn\b|\bpnpm\b/i }
    ],
    verbs: ["Engineered", "Architected", "Optimized", "Refactored", "Spearheaded", "Streamlined"],
    resources: [
      { name: "MDN Web Docs - HTML/CSS/JS Reference", url: "https://developer.mozilla.org" },
      { name: "React Official Documentation & Guides", url: "https://react.dev" },
      { name: "W3C Web Accessibility Tutorials", url: "https://www.w3.org/WAI/tutorials/" },
      { name: "JavaScript.info - From Basics to Advanced", url: "https://javascript.info" }
    ]
  },
  backend: {
    title: "Backend Developer",
    skills: [
      { id: "nodejs", name: "Node.js", category: "Runtime Environments", regex: /\bnode(\.js)?\b/i },
      { id: "express", name: "Express.js / Koa", category: "Frameworks & Libraries", regex: /\bexpress(\.js)?\b|\bkoa\b/i },
      { id: "sql", name: "SQL Databases (Postgres/MySQL)", category: "Data Storage", regex: /\bsql\b|\bpostgresql\b|\bmysql\b|\bsqlite\b/i },
      { id: "nosql", name: "NoSQL Databases (MongoDB)", category: "Data Storage", regex: /\bnosql\b|\bmongodb\b|\bmongo\b|\bredis\b/i },
      { id: "apis", name: "RESTful APIs / GraphQL", category: "Networking", regex: /\brest(ful)? api\b|\bgraphql\b|\bap(i|is)\b/i },
      { id: "git", name: "Git & Version Control", category: "Developer Tools", regex: /\bgit(hub)?\b/i },
      { id: "docker", name: "Docker & Containers", category: "DevOps & Cloud", regex: /\bdocker\b|\bcontainer(s)?\b|\bkubernetes\b/i },
      { id: "jwt", name: "JWT & Auth Protocols", category: "Security", regex: /\bjwt\b|\bauth\b|\boauth\b|\bsecurity\b/i },
      { id: "testing", name: "Unit Testing (Jest/Mocha)", category: "Developer Tools", regex: /\btesting\b|\bjest\b|\bmocha\b|\bchai\b/i },
      { id: "mvc", name: "Microservices & Architecture", category: "Advanced Skills", regex: /\bmicroservice(s)?\b|\bsystem design\b|\bmvc\b/i }
    ],
    verbs: ["Constructed", "Developed", "Integrated", "Scaled", "Optimized", "Configured"],
    resources: [
      { name: "Node.js Developer Guides", url: "https://nodejs.org/en/docs" },
      { name: "RESTful API Design Best Practices", url: "https://restfulapi.net" },
      { name: "Docker Curriculum - Beginner to Pro", url: "https://docker-curriculum.com" },
      { name: "PostgreSQL Tutorial for Developers", url: "https://www.postgresqltutorial.com" }
    ]
  },
  fullstack: {
    title: "Fullstack Engineer",
    skills: [
      { id: "react", name: "React.js / Next.js", category: "Frontend Core", regex: /\breact(\.js)?\b|\bnext(\.js)?\b/i },
      { id: "nodejs", name: "Node.js", category: "Backend Core", regex: /\bnode(\.js)?\b/i },
      { id: "apis", name: "RESTful APIs", category: "Networking", regex: /\brest(ful)? api\b|\bap(i|is)\b/i },
      { id: "sql", name: "SQL & Relational DBs", category: "Data Storage", regex: /\bsql\b|\bpostgresql\b|\bmysql\b/i },
      { id: "git", name: "Git & Version Control", category: "Developer Tools", regex: /\bgit(hub)?\b/i },
      { id: "system-design", name: "System Design", category: "Advanced Skills", regex: /\bsystem design\b|\bscaling\b|\bload balancer\b/i },
      { id: "jwt", name: "JWT & Security Check", category: "Security", regex: /\bjwt\b|\boauth\b|\bauth\b/i },
      { id: "cloud", name: "Cloud Platforms (AWS/Vercel)", category: "DevOps & Cloud", regex: /\baws\b|\bvercel\b|\bheroku\b|\bcloud\b/i },
      { id: "responsive", name: "CSS Flex/Grid Layouts", category: "Frontend Core", regex: /\bflexbox\b|\bcss grid\b|\bresponsive\b/i },
      { id: "state", name: "State Management (Redux/Zustand)", category: "Frontend Core", regex: /\bredux\b|\bzustand\b|\bcontext api\b/i }
    ],
    verbs: ["Built", "Engineered", "Deployed", "Implemented", "Designed", "Orchestrated"],
    resources: [
      { name: "Full Stack Open - University of Helsinki", url: "https://fullstackopen.com/en" },
      { name: "System Design Primer Guide", url: "https://github.com/donnemartin/system-design-primer" },
      { name: "Next.js Learning Course", url: "https://nextjs.org/learn" },
      { name: "AWS Fundamentals Tutorial", url: "https://aws.amazon.com/getting-started/" }
    ]
  },
  "data-science": {
    title: "Data Scientist",
    skills: [
      { id: "python", name: "Python", category: "Core Languages", regex: /\bpython\b|\bpy\b/i },
      { id: "sql", name: "SQL Databases", category: "Data Storage", regex: /\bsql\b|\bpostgres\b|\bmysql\b/i },
      { id: "ml", name: "Machine Learning Concepts", category: "Algorithms", regex: /\bmachine learning\b|\bml\b|\bsupervised\b/i },
      { id: "pandas", name: "Pandas & NumPy", category: "Data Libraries", regex: /\bpandas\b|\bnumpy\b/i },
      { id: "dataviz", name: "Data Visualization (Matplotlib)", category: "Data Libraries", regex: /\bvisualization\b|\bmatplotlib\b|\bseaborn\b|\btableau\b/i },
      { id: "stats", name: "Statistical Analysis & Math", category: "Core Knowledge", regex: /\bstatistics\b|\bprobability\b|\bhypothesis testing\b/i },
      { id: "git", name: "Git & Version Control", category: "Developer Tools", regex: /\bgit(hub)?\b/i },
      { id: "jupyter", name: "Jupyter Notebooks", category: "Developer Tools", regex: /\bjupyter\b|\bnotebooks\b/i },
      { id: "scikit", name: "Scikit-Learn", category: "Frameworks & Libraries", regex: /\bscikit\b|\bsklearn\b/i },
      { id: "bigdata", name: "Big Data (Spark/Hadoop)", category: "Advanced Skills", regex: /\bspark\b|\bhadoop\b|\bpyspark\b/i }
    ],
    verbs: ["Analyzed", "Processed", "Modeled", "Derived", "Predicted", "Visualized"],
    resources: [
      { name: "Kaggle - Learn Data Science", url: "https://www.kaggle.com/learn" },
      { name: "Python Data Science Handbook", url: "https://jakevdp.github.io/PythonDataScienceHandbook/" },
      { name: "Scikit-Learn Machine Learning Guides", url: "https://scikit-learn.org" },
      { name: "SQL Zoo Interactive Tutorial", url: "https://sqlzoo.net" }
    ]
  },
  "mobile-developer": {
    title: "Mobile App Developer",
    skills: [
      { id: "reactnative", name: "React Native", category: "Cross-Platform", regex: /\breact native\b/i },
      { id: "flutter", name: "Flutter & Dart", category: "Cross-Platform", regex: /\bflutter\b|\bdart\b/i },
      { id: "swift", name: "Swift & iOS SDK", category: "Native iOS", regex: /\bswift\b|\bxcode\b|\bios sdk\b/i },
      { id: "kotlin", name: "Kotlin / Java for Android", category: "Native Android", regex: /\bkotlin\b|\bjava\b|\bandroid studio\b/i },
      { id: "mobileui", name: "Mobile UI/UX Principles", category: "Design Guidelines", regex: /\bmobile ui\b|\bmaterial design\b|\bhuman interface guidelines\b/i },
      { id: "apis", name: "RESTful APIs Integration", category: "Networking", regex: /\brest(ful)? api\b|\bap(i|is)\b/i },
      { id: "appstore", name: "App Store Publishing", category: "Deployment", regex: /\bapp store\b|\bgoogle play\b|\bpublishing\b/i },
      { id: "git", name: "Git & Version Control", category: "Developer Tools", regex: /\bgit(hub)?\b/i },
      { id: "statemobile", name: "Mobile State Management", category: "Frameworks & Libraries", regex: /\bredux\b|\bprovider\b|\bbloc\b/i },
      { id: "notifications", name: "Push Notifications", category: "Services", regex: /\bpush notification(s)?\b|\bfirebase\b|\bfcm\b/i }
    ],
    verbs: ["Launched", "Published", "Coded", "Designed", "Debugged", "Architected"],
    resources: [
      { name: "Flutter Official Codelabs", url: "https://docs.flutter.dev/reference/codelabs" },
      { name: "React Native Architecture Guide", url: "https://reactnative.dev/docs/getting-started" },
      { name: "Apple Swift & iOS Developer Tutorial", url: "https://developer.apple.com/swift/" },
      { name: "Android Developer Training Guides", url: "https://developer.android.com/courses" }
    ]
  }
};

// 2. Demo Resume Template
const DEMO_RESUME = `Jane Doe
E-mail: jane.doe@example.com | Phone: (123) 456-7890 | GitHub: github.com/janedoe

PROFESSIONAL SUMMARY
Dynamic Developer with 2+ years of hands-on experience building web designs. Passionate about structuring clean user interfaces, refactoring legacy codebases, and collaborating with multidisciplinary teams.

WORK EXPERIENCE
Frontend Web Intern - Tech Corp (May 2024 - Present)
- Developed HTML5 & CSS3 layout systems for several internal client-facing applications.
- Refactored legacy JavaScript codebases to ES6 standard, optimizing page load times.
- Worked on a collaborative Scrum environment using Git workflow to ship new features.
- Helped UI/UX team improve responsive styles across tablet and mobile interfaces.

PROJECTS
Personal Portfolio Site
- Coded and deployed a custom profile website showcasing layout work, yielding 100+ visitors.
- Used CSS Flexbox and Grid to design adaptive frameworks without heavy systems.

EDUCATION
B.S. in Computer Science - Tech University (2021 - 2025)`;

// 3. State Management Variables
let currentActiveRole = "";
let currentResumeText = "";
let scannedSkills = [];       // array of objects: { skillId, name, matched: boolean }
let userCheckedSkills = {};   // key-value map: { roleId: { skillId: boolean } }
let diagnosticStatus = {
  contact: false,
  summary: false,
  experience: false,
  formatting: false
};
let activeTab = "missing";
let isDragging = false;

// 4. DOM Elements Cache
const selectRoleEl = document.getElementById("select-role");
const resumeTextEl = document.getElementById("resume-text");
const charCounterEl = document.getElementById("char-counter");
const btnLoadDemoEl = document.getElementById("btn-load-demo");
const btnAnalyzeEl = document.getElementById("btn-analyze");

// Workspace Blocks
const wsEmptyEl = document.getElementById("workspace-empty");
const wsLoaderEl = document.getElementById("workspace-loader");
const wsResultsEl = document.getElementById("workspace-results");

// Drag & Drop
const dropZoneEl = document.getElementById("drop-zone");
const fileInputEl = document.getElementById("file-input");
const fileStatusEl = document.getElementById("file-status");
const fileNameEl = document.getElementById("file-name");
const btnRemoveFileEl = document.getElementById("btn-remove-file");

// Results Elements
const scoreValEl = document.getElementById("score-val");
const scoreBadgeEl = document.getElementById("score-badge");
const progressIndicatorEl = document.getElementById("progress-indicator");
const statKeywordsEl = document.getElementById("stat-keywords");
const statReadabilityEl = document.getElementById("stat-readability");
const statSectionsEl = document.getElementById("stat-sections");

// Diagnostics list nodes
const diagContactEl = document.getElementById("diag-contact");
const diagSummaryEl = document.getElementById("diag-summary");
const diagExperienceEl = document.getElementById("diag-experience");
const diagFormattingEl = document.getElementById("diag-formatting");

// Skills Container
const skillsListEl = document.getElementById("skills-list");
const skillSearchEl = document.getElementById("skill-search");
const countMissingEl = document.getElementById("count-missing");
const countMatchedEl = document.getElementById("count-matched");
const countAllEl = document.getElementById("count-all");
const roadmapPercentEl = document.getElementById("roadmap-percent");
const roadmapProgressFillEl = document.getElementById("roadmap-progress-fill");

// Suggestions Container
const suggestedVerbsEl = document.getElementById("suggested-verbs");
const suggestedKeywordsEl = document.getElementById("suggested-keywords");
const suggestedResourcesEl = document.getElementById("suggested-resources");

// Tab and reset controls
const tabButtons = document.querySelectorAll(".tab-btn");
const btnResetStorageEl = document.getElementById("btn-reset-storage");

// Modal Elements
const btnExportEl = document.getElementById("btn-export-report");
const modalEl = document.getElementById("export-modal");
const btnCloseModalEl = document.getElementById("btn-close-modal");
const modalReportBodyEl = document.getElementById("modal-report-body");
const btnCopyReportEl = document.getElementById("btn-copy-report");
const btnPrintReportEl = document.getElementById("btn-print-report");

// Accordion Toggles
const accordionItems = document.querySelectorAll(".accordion-item");

// 5. Initializer
window.addEventListener("DOMContentLoaded", () => {
  loadLocalStorage();
  setupEventListeners();
  updateCharCounter();
});

// 6. Data Loaders & Persisters
function loadLocalStorage() {
  const storedData = localStorage.getItem("resualign_user_skills");
  if (storedData) {
    try {
      userCheckedSkills = JSON.parse(storedData);
    } catch (e) {
      console.error("Error reading localStorage", e);
      userCheckedSkills = {};
    }
  }
}

function saveToLocalStorage() {
  localStorage.setItem("resualign_user_skills", JSON.stringify(userCheckedSkills));
}

// 7. Event Binding
function setupEventListeners() {
  // Demo resume click
  btnLoadDemoEl.addEventListener("click", () => {
    resumeTextEl.value = DEMO_RESUME;
    // Set role to frontend automatically since demo fits frontend
    selectRoleEl.value = "frontend";
    updateCharCounter();
    // Smooth scroll if needed
    btnAnalyzeEl.scrollIntoView({ behavior: "smooth" });
  });

  // Textarea character count
  resumeTextEl.addEventListener("input", updateCharCounter);

  // Drag and drop setup
  setupDragAndDrop();

  // Run analysis button
  btnAnalyzeEl.addEventListener("click", handleRunAnalysis);

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      tabButtons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      activeTab = e.target.getAttribute("data-tab");
      renderSkillsGrid();
    });
  });

  // Filter Search Input
  skillSearchEl.addEventListener("input", renderSkillsGrid);

  // Reset local data
  btnResetStorageEl.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your saved learning progress? This resets all marked skills.")) {
      localStorage.removeItem("resualign_user_skills");
      userCheckedSkills = {};
      if (wsResultsEl.classList.contains("hidden") === false && currentActiveRole) {
        // Recalculate score and render if active
        analyzeResumeLogic();
      }
    }
  });

  // Accordion list interactions
  accordionItems.forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    trigger.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      accordionItems.forEach(i => i.classList.remove("active"));
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // Modal actions
  btnExportEl.addEventListener("click", showExportReportModal);
  btnCloseModalEl.addEventListener("click", hideModal);
  btnCopyReportEl.addEventListener("click", copyReportText);
  btnPrintReportEl.addEventListener("click", () => {
    window.print();
  });
  
  // Hide modal on outer click
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) hideModal();
  });
}

// Update text character count helper
function updateCharCounter() {
  const count = resumeTextEl.value.length;
  charCounterEl.textContent = `${count.toLocaleString()} characters`;
}

// 8. Drag and Drop Actions
function setupDragAndDrop() {
  dropZoneEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneEl.classList.add("drag-over");
  });

  dropZoneEl.addEventListener("dragleave", () => {
    dropZoneEl.classList.remove("drag-over");
  });

  dropZoneEl.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZoneEl.classList.remove("drag-over");
    
    if (e.dataTransfer.files.length > 0) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  dropZoneEl.addEventListener("click", () => {
    fileInputEl.click();
  });

  fileInputEl.addEventListener("change", () => {
    if (fileInputEl.files.length > 0) {
      handleUploadedFile(fileInputEl.files[0]);
    }
  });

  btnRemoveFileEl.addEventListener("click", (e) => {
    e.stopPropagation(); // Avoid triggering drop-zone click
    clearUploadedFile();
  });
}

function handleUploadedFile(file) {
  // Show file status
  fileNameEl.textContent = file.name;
  fileStatusEl.classList.remove("hidden");
  
  // Read contents if it's text, or simulate details for pdf/docx
  const reader = new FileReader();
  
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    reader.onload = function(e) {
      resumeTextEl.value = e.target.result;
      updateCharCounter();
    };
    reader.readAsText(file);
  } else {
    // Simulated ATS parsing for PDF/Word files
    // Pre-populate with typical text representing content of the file
    let simulatedText = `Simulated parsed text from ${file.name}\n\n`;
    simulatedText += `Applicant Name: Resume File User\n`;
    simulatedText += `Selected File: ${file.name} (File Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB)\n\n`;
    simulatedText += `PROFESSIONAL SUMMARIES\n`;
    simulatedText += `Full-stack specialist with key experience in designing high performance systems.\n\n`;
    simulatedText += `EXPERIENCES & PATHS\n`;
    simulatedText += `- Deployed scalable cloud platforms using standard tools like AWS.\n`;
    simulatedText += `- Developed frontend web architecture using basic CSS layouts and JS script functions.\n`;
    simulatedText += `- Implemented Restful API systems and parsed MySQL data grids.\n`;
    simulatedText += `- Version control managed in Github repositories.`;
    
    resumeTextEl.value = simulatedText;
    updateCharCounter();
  }
}

function clearUploadedFile() {
  fileInputEl.value = "";
  fileStatusEl.classList.add("hidden");
  fileNameEl.textContent = "";
}

// 9. Core Analysis Trigger
function handleRunAnalysis() {
  const selectedRole = selectRoleEl.value;
  const resumeText = resumeTextEl.value.trim();

  // Validate inputs
  if (!selectedRole) {
    alert("Please select a target job role before analyzing.");
    selectRoleEl.focus();
    return;
  }
  if (!resumeText) {
    alert("Please upload a file or paste your resume text to begin.");
    resumeTextEl.focus();
    return;
  }

  currentActiveRole = selectedRole;
  currentResumeText = resumeText;

  // Show Loader
  wsEmptyEl.classList.add("hidden");
  wsResultsEl.classList.add("hidden");
  wsLoaderEl.classList.remove("hidden");
  
  // Reset logs
  document.getElementById("log-1").className = "log-line active";
  document.getElementById("log-2").className = "log-line";
  document.getElementById("log-3").className = "log-line";
  document.getElementById("log-1").querySelector("i").className = "fa-solid fa-circle-notch fa-spin";
  document.getElementById("log-2").querySelector("i").className = "fa-solid fa-circle-notch fa-spin";
  document.getElementById("log-3").querySelector("i").className = "fa-solid fa-circle-notch fa-spin";

  // Simulate scanning percentages and logs
  let progress = 0;
  const percentEl = document.getElementById("scan-percentage");
  const descEl = document.getElementById("scan-status-desc");
  const titleEl = document.getElementById("scan-status-title");

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 5;
    if (progress > 100) progress = 100;
    
    percentEl.textContent = `${progress}%`;

    if (progress >= 30 && progress < 70) {
      titleEl.textContent = "Scanning Skill Matrix...";
      descEl.textContent = "Matching token segments against keyword databases";
      document.getElementById("log-1").className = "log-line";
      document.getElementById("log-1").querySelector("i").className = "fa-solid fa-circle-check text-success";
      document.getElementById("log-2").className = "log-line active";
    } else if (progress >= 70 && progress < 100) {
      titleEl.textContent = "Assessing Document Quality...";
      descEl.textContent = "Analyzing structure, layout benchmarks, and formatting diagnostics";
      document.getElementById("log-2").className = "log-line";
      document.getElementById("log-2").querySelector("i").className = "fa-solid fa-circle-check text-success";
      document.getElementById("log-3").className = "log-line active";
    }

    if (progress === 100) {
      clearInterval(interval);
      document.getElementById("log-3").className = "log-line";
      document.getElementById("log-3").querySelector("i").className = "fa-solid fa-circle-check text-success";
      
      setTimeout(() => {
        // Show results
        wsLoaderEl.classList.add("hidden");
        wsResultsEl.classList.remove("hidden");
        
        analyzeResumeLogic();
        wsResultsEl.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, 100);
}

// 10. ATS Parser Algorithm
function analyzeResumeLogic() {
  const db = ROLES_DATABASE[currentActiveRole];
  const resumeLower = currentResumeText.toLowerCase();

  // A. Diagnose Sections
  // Standard resume section detection using keywords
  diagnosticStatus.contact = /\b(phone|email|e-mail|address|github|linkedin|contact)\b/i.test(resumeLower);
  diagnosticStatus.summary = /\b(summary|profile|about me|objective|professional summary)\b/i.test(resumeLower);
  diagnosticStatus.experience = /\b(experience|history|employment|work history|career)\b/i.test(resumeLower);
  
  // Format checks: Word limit, standard font sizes (simulated)
  diagnosticStatus.formatting = currentResumeText.length > 300 && currentResumeText.length < 15000;

  // B. Match Core Keywords/Skills
  scannedSkills = db.skills.map(skill => {
    // Check match against regex
    const hasMatched = skill.regex.test(resumeLower);
    return {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      matched: hasMatched
    };
  });

  // Calculate scores
  calculateAndUpdateScore();

  // C. Populate Suggestions
  // Missing tags
  suggestedKeywordsEl.innerHTML = "";
  const missingKeywords = scannedSkills.filter(s => !s.matched);
  if (missingKeywords.length > 0) {
    missingKeywords.forEach(k => {
      const tag = document.createElement("span");
      tag.textContent = k.name;
      suggestedKeywordsEl.appendChild(tag);
    });
  } else {
    suggestedKeywordsEl.innerHTML = "<span>All core keywords detected! Excellent.</span>";
  }

  // Action verbs (Find which ones user used, show replacements/suggestions)
  suggestedVerbsEl.innerHTML = "";
  db.verbs.forEach(v => {
    const span = document.createElement("span");
    // Highlight if used, else make slightly dimmer
    const regex = new RegExp(`\\b${v}\\b`, "i");
    if (regex.test(resumeLower)) {
      span.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> ${v}`;
      span.title = "Used in your resume!";
    } else {
      span.innerHTML = v;
      span.title = "Try using this action verb to demonstrate impact.";
    }
    suggestedVerbsEl.appendChild(span);
  });

  // Resources list
  suggestedResourcesEl.innerHTML = "";
  db.resources.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="${r.url}" target="_blank" rel="noopener noreferrer">
        <span><i class="fa-solid fa-graduation-cap"></i> ${r.name}</span>
        <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    `;
    suggestedResourcesEl.appendChild(li);
  });

  // Render Skill Tabs & List
  renderSkillsGrid();
}

// Calculate match score and render gauges
function calculateAndUpdateScore() {
  const db = ROLES_DATABASE[currentActiveRole];
  
  // Section completion score: up to 30 points
  let sectionScore = 0;
  let sectionCount = 0;
  if (diagnosticStatus.contact) { sectionScore += 10; sectionCount++; }
  if (diagnosticStatus.summary) { sectionScore += 10; sectionCount++; }
  if (diagnosticStatus.experience) { sectionScore += 10; sectionCount++; }
  
  statSectionsEl.textContent = `${sectionCount}/3`;

  // Update Diagnostic Checklist UI
  updateDiagnosticCheckbox(diagContactEl, diagnosticStatus.contact);
  updateDiagnosticCheckbox(diagSummaryEl, diagnosticStatus.summary);
  updateDiagnosticCheckbox(diagExperienceEl, diagnosticStatus.experience);
  updateDiagnosticCheckbox(diagFormattingEl, diagnosticStatus.formatting);

  // Skill matches score: up to 70 points
  const totalSkills = scannedSkills.length;
  
  // Count matches (incorporating checked items from localStorage)
  let matchCount = 0;
  const roleChecked = userCheckedSkills[currentActiveRole] || {};

  scannedSkills.forEach(s => {
    // It's matched if scanned matched OR user checked it off as learned
    const isLearned = !!roleChecked[s.id];
    if (s.matched || isLearned) {
      matchCount++;
    }
  });

  const skillScoreRatio = totalSkills > 0 ? (matchCount / totalSkills) : 0;
  const skillPoints = Math.round(skillScoreRatio * 70);

  // Readability text check
  const wordCount = currentResumeText.split(/\s+/).filter(Boolean).length;
  let readabilityGrade = "Good";
  if (wordCount < 100) {
    readabilityGrade = "Too Short";
    statReadabilityEl.className = "stat-value text-danger";
  } else if (wordCount > 1000) {
    readabilityGrade = "Wordy";
    statReadabilityEl.className = "stat-value text-warning";
  } else {
    readabilityGrade = "Good";
    statReadabilityEl.className = "stat-value text-success";
  }
  statReadabilityEl.textContent = readabilityGrade;

  // Final Total Score
  const totalScore = sectionScore + skillPoints;
  
  // Trigger animations
  animateScoreGauge(totalScore);

  // Keywords ratio display
  statKeywordsEl.textContent = `${matchCount}/${totalSkills}`;

  // Tab counters update
  // Original scan stats (before checkboxes) or live checked stats? Let's show current status
  const missingCount = scannedSkills.filter(s => !s.matched && !roleChecked[s.id]).length;
  const matchedCount = scannedSkills.filter(s => s.matched || roleChecked[s.id]).length;

  countMissingEl.textContent = missingCount;
  countMatchedEl.textContent = matchedCount;
  countAllEl.textContent = totalSkills;

  // Roadmap percentage
  const roadPercentVal = Math.round(skillScoreRatio * 100);
  roadmapPercentEl.textContent = `${roadPercentVal}%`;
  roadmapProgressFillEl.style.width = `${roadPercentVal}%`;
}

function updateDiagnosticCheckbox(el, success) {
  if (success) {
    el.className = "checked";
    el.querySelector("i").className = "fa-solid fa-circle-check";
  } else {
    el.className = "failed";
    el.querySelector("i").className = "fa-solid fa-circle-xmark";
  }
}

// 11. Score Gauge Animation
function animateScoreGauge(targetScore) {
  let currentVal = 0;
  const circleOffsetMax = 314; // Circle circumference (2 * pi * r; r = 50 => ~314)
  
  // Clean intervals
  if (window.scoreAnimationInterval) {
    clearInterval(window.scoreAnimationInterval);
  }

  window.scoreAnimationInterval = setInterval(() => {
    if (currentVal < targetScore) {
      currentVal++;
    } else if (currentVal > targetScore) {
      currentVal--;
    } else {
      clearInterval(window.scoreAnimationInterval);
    }

    scoreValEl.textContent = currentVal;
    
    // SVG radial update
    const offset = circleOffsetMax - (circleOffsetMax * currentVal) / 100;
    progressIndicatorEl.style.strokeDashoffset = offset;

    // Apply color gradient dynamically based on value
    if (currentVal >= 80) {
      progressIndicatorEl.style.stroke = "var(--clr-success)";
      scoreBadgeEl.textContent = "Strong Match";
      scoreBadgeEl.className = "score-rating-badge excellent";
    } else if (currentVal >= 55) {
      progressIndicatorEl.style.stroke = "var(--clr-accent)";
      scoreBadgeEl.textContent = "Fair Match";
      scoreBadgeEl.className = "score-rating-badge";
    } else {
      progressIndicatorEl.style.stroke = "var(--clr-warning)";
      scoreBadgeEl.textContent = "Needs Improvement";
      scoreBadgeEl.className = "score-rating-badge fair";
    }
  }, 12);
}

// 12. Render Skills List Tab Content
function renderSkillsGrid() {
  if (!currentActiveRole) return;

  const searchQuery = skillSearchEl.value.toLowerCase().trim();
  const roleChecked = userCheckedSkills[currentActiveRole] || {};

  skillsListEl.innerHTML = "";

  // Filter skills based on tab and search
  const filteredSkills = scannedSkills.filter(s => {
    // Apply search filter
    const matchesSearch = s.name.toLowerCase().includes(searchQuery) || s.category.toLowerCase().includes(searchQuery);
    if (!matchesSearch) return false;

    const isLearned = !!roleChecked[s.id];

    // Apply tab filter
    if (activeTab === "missing") {
      return !s.matched && !isLearned;
    } else if (activeTab === "matched") {
      return s.matched || isLearned;
    }
    // "all" tab
    return true;
  });

  if (filteredSkills.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "text-muted text-center";
    emptyMsg.style.gridColumn = "span 2";
    emptyMsg.style.padding = "2rem 0";
    emptyMsg.innerHTML = `<i class="fa-solid fa-folder-open"></i> No skills matching filter criteria.`;
    skillsListEl.appendChild(emptyMsg);
    return;
  }

  filteredSkills.forEach(s => {
    const isLearned = !!roleChecked[s.id];
    const isMatched = s.matched || isLearned;
    const canCheck = !s.matched; // original matched skills cannot be unchecked

    const card = document.createElement("div");
    card.className = `skill-checkbox-card ${isMatched ? 'matched' : ''}`;
    card.setAttribute("role", "checkbox");
    card.setAttribute("aria-checked", isMatched);
    card.tabIndex = 0;

    card.innerHTML = `
      <div class="checkbox-custom">
        <i class="fa-solid fa-check"></i>
      </div>
      <div class="skill-info">
        <span class="skill-name">${s.name}</span>
        <span class="skill-category">${s.category}</span>
      </div>
      <span class="badge-tag ${isMatched ? 'badge-matched' : 'badge-missing'}">
        ${isMatched ? 'Matched' : 'Missing'}
      </span>
    `;

    // Click handler for toggle-checking
    const toggleAction = () => {
      if (!canCheck) {
        // User cannot uncheck originally matched skills
        alert("This skill is already detected inside your resume text. To remove it, edit your resume text and re-analyze.");
        return;
      }

      if (!userCheckedSkills[currentActiveRole]) {
        userCheckedSkills[currentActiveRole] = {};
      }

      userCheckedSkills[currentActiveRole][s.id] = !isLearned;
      saveToLocalStorage();
      
      // Update data and recalculate score
      calculateAndUpdateScore();
      renderSkillsGrid();
    };

    card.addEventListener("click", toggleAction);
    card.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleAction();
      }
    });

    skillsListEl.appendChild(card);
  });
}

// 13. Export & Modal Report Generation
function showExportReportModal() {
  if (!currentActiveRole) return;
  const db = ROLES_DATABASE[currentActiveRole];
  const roleChecked = userCheckedSkills[currentActiveRole] || {};

  const totalScore = parseInt(scoreValEl.textContent) || 0;
  const matched = scannedSkills.filter(s => s.matched || roleChecked[s.id]);
  const missing = scannedSkills.filter(s => !s.matched && !roleChecked[s.id]);

  let htmlReport = `
    <div class="report-header">
      <div class="report-title">
        <h4>${db.title} ATS Matching Profile</h4>
        <span>Generated on: ${new Date().toLocaleDateString()}</span>
      </div>
      <div class="report-score-pill">Score: ${totalScore}/100</div>
    </div>
    
    <div class="report-section">
      <h5>Analysis Summary</h5>
      <p>The candidate profile was cross-referenced with target requirements. Readability is evaluated as <strong>${statReadabilityEl.textContent}</strong>, matching key blocks on standard formatting requirements.</p>
    </div>

    <div class="report-section">
      <h5>Matched Credentials (${matched.length})</h5>
      <ul class="report-list">
  `;

  matched.forEach(m => {
    htmlReport += `<li><i class="fa-solid fa-circle-check text-success"></i> <strong>${m.name}</strong> - ${m.category}</li>`;
  });

  htmlReport += `
      </ul>
    </div>
    
    <div class="report-section">
      <h5>Identified Skill Gaps (${missing.length})</h5>
      <p>${missing.length > 0 ? 'Address the following missing items to align with target role specs:' : 'All target keywords fully resolved!'}</p>
      <ul class="report-list">
  `;

  missing.forEach(m => {
    htmlReport += `<li><i class="fa-solid fa-triangle-exclamation text-warning"></i> <strong>${m.name}</strong> - ${m.category}</li>`;
  });

  htmlReport += `
      </ul>
    </div>
    
    <div class="report-section">
      <h5>Recommended Action Items</h5>
      <ul class="report-list">
        <li><i class="fa-solid fa-arrow-right"></i> Integrate missing industry terms natively into your job summaries.</li>
        <li><i class="fa-solid fa-arrow-right"></i> Incorporate impact-driven verbs like: <em>${db.verbs.slice(0, 3).join(", ")}</em>.</li>
        <li><i class="fa-solid fa-arrow-right"></i> Complete lessons and sample projects in high-gap sections.</li>
      </ul>
    </div>
  `;

  modalReportBodyEl.innerHTML = htmlReport;
  modalEl.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Prevent background scroll
}

function hideModal() {
  modalEl.classList.add("hidden");
  document.body.style.overflow = "";
}

function copyReportText() {
  const textContent = modalReportBodyEl.innerText;
  navigator.clipboard.writeText(textContent).then(() => {
    alert("Report text copied to clipboard successfully!");
  }).catch(err => {
    console.error("Unable to copy report", err);
  });
}
