/**
 * PathAdvisor - AI Career Advisor Dashboard
 * Core Frontend Logic
 */

// 1. Career Profiles Database
const CAREERS_DATABASE = [
  {
    id: "solutions_architect",
    title: "Solutions Architect",
    category: "Cloud & Systems",
    description: "Designs highly scalable, secure, and reliable cloud infrastructures. Bridges technical development grids with business strategy needs.",
    weights: { tech: 90, design: 40, data: 60, strategy: 80 },
    keywords: ["cloud", "aws", "azure", "architect", "scaling", "security", "infrastructure", "deployment"],
    growth: "+24% YoY",
    salary: "$152,000/yr",
    milestones: [
      "Obtain AWS Certified Solutions Architect credential",
      "Master Cloud network routing and secure VPC patterns",
      "Understand microservice routing and system design models",
      "Build a multi-region automatic load balancing test mock"
    ],
    resource: { name: "AWS Certification Pathways Guide", url: "https://aws.amazon.com/certification/" }
  },
  {
    id: "ux_researcher",
    title: "UX Researcher",
    category: "Design & Product",
    description: "Evaluates user behaviors, needs, and motivations. Designs intuitive interfaces and coordinates user test studies.",
    weights: { tech: 30, design: 90, data: 50, strategy: 65 },
    keywords: ["figma", "design", "user experience", "ux", "testing", "survey", "persona", "prototype"],
    growth: "+18% YoY",
    salary: "$118,000/yr",
    milestones: [
      "Master Figma prototyping and interaction states",
      "Learn structured user interviewing and survey design",
      "Analyze quantitative usability metrics and analytics",
      "Author a comprehensive mobile app usability study"
    ],
    resource: { name: "Nielsen Norman Group UX Research Methods", url: "https://www.nngroup.com" }
  },
  {
    id: "data_scientist",
    title: "Data Scientist",
    category: "Data & Math",
    description: "Extracts actionable insights from massive structured and unstructured datasets. Models prediction systems using statistical algorithms.",
    weights: { tech: 80, design: 30, data: 95, strategy: 60 },
    keywords: ["python", "sql", "machine learning", "data", "statistics", "model", "dataframe", "numpy"],
    growth: "+31% YoY",
    salary: "$135,000/yr",
    milestones: [
      "Master advanced SQL join queries and database indexing",
      "Learn Pandas and NumPy data manipulation libraries",
      "Study supervised and unsupervised ML models in Python",
      "Model customer churn predictions using Scikit-Learn"
    ],
    resource: { name: "Kaggle Data Science Courses & Datasets", url: "https://www.kaggle.com/learn" }
  },
  {
    id: "product_manager",
    title: "Product Manager",
    category: "Strategy & Operations",
    description: "Defines product visions, features, and success metrics. Coordinates developers and stakeholders to ship roadmaps.",
    weights: { tech: 60, design: 55, data: 70, strategy: 95 },
    keywords: ["product", "roadmap", "kpi", "stakeholder", "sprint", "metric", "scrum", "conversion"],
    growth: "+15% YoY",
    salary: "$126,000/yr",
    milestones: [
      "Study Agile sprint backlogs management frameworks",
      "Master RICE score feature prioritization calculations",
      "Design user telemetry tracking metrics dashboards",
      "Draft a complete Product Requirement Document (PRD)"
    ],
    resource: { name: "Product School Free PM Guides", url: "https://productschool.com/resources" }
  },
  {
    id: "devops_engineer",
    title: "DevOps Engineer",
    category: "Cloud & DevOps",
    description: "Automates software build pipelines, automated testing runs, and cloud environment cluster nodes.",
    weights: { tech: 95, design: 20, data: 55, strategy: 70 },
    keywords: ["docker", "ci/cd", "pipeline", "linux", "kubernetes", "bash", "deploy", "monitoring"],
    growth: "+22% YoY",
    salary: "$142,000/yr",
    milestones: [
      "Master Linux shell command pipes and scripting",
      "Learn Docker image building and network port mapping",
      "Design YAML automated testing deployment pipelines",
      "Deploy container applications to Kubernetes clusters"
    ],
    resource: { name: "DevOps Learning Roadmap guides", url: "https://roadmap.sh/devops" }
  }
];

// 2. Demo profile credentials data
const DEMO_RESUME = `CS major interested in data science. Highly proficient in Python programming, Pandas dataframes, and SQL database querying. Familiar with modeling basic machine learning datasets. Looking to design prediction systems and analyze metrics.`;

// 3. State Management Variables
let activeSelectedCareerId = "";
let userChecklistsState = {}; // { [careerId]: { [milestoneIndex]: boolean } }
let studyStreak = 0;
let lastStudyDate = "";

// 4. DOM Cache
const rangeTechEl = document.getElementById("range-tech");
const rangeDesignEl = document.getElementById("range-design");
const rangeDataEl = document.getElementById("range-data");
const rangeStrategyEl = document.getElementById("range-strategy");

const lblValTechEl = document.getElementById("lbl-val-tech");
const lblValDesignEl = document.getElementById("lbl-val-design");
const lblValDataEl = document.getElementById("lbl-val-data");
const lblValStrategyEl = document.getElementById("lbl-val-strategy");

const txtBioEl = document.getElementById("txt-bio");
const btnCalculateEl = document.getElementById("btn-calculate");
const btnLoadDemoEl = document.getElementById("btn-load-demo");
const btnResetDataEl = document.getElementById("btn-reset-data");

const matchesCardsListEl = document.getElementById("matches-cards-list");
const lblMatchesCountEl = document.getElementById("lbl-matches-count");

// Details drawer panel
const detailsEmptyEl = document.getElementById("details-empty");
const detailsActiveEl = document.getElementById("details-active");
const lblDetailsCategoryEl = document.getElementById("lbl-details-category");
const lblDetailsNameEl = document.getElementById("lbl-details-name");
const roadmapIndicatorEl = document.getElementById("roadmap-indicator");
const lblDetailsRoadmapPercentEl = document.getElementById("lbl-details-roadmap-percent");
const lblDetailsDescEl = document.getElementById("lbl-details-desc");
const lblDetailsGrowthEl = document.getElementById("lbl-details-growth");
const lblDetailsSalaryEl = document.getElementById("lbl-details-salary");
const detailsChecklistEl = document.getElementById("details-checklist");
const detailsResourceBoxEl = document.getElementById("details-resource-box");

const valStreakEl = document.getElementById("val-streak");

// 5. Initializer
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  updateStreakUI();
});

// 6. Data Loaders & Synchronizers
function loadData() {
  const checklists = localStorage.getItem("pathadvisor_checklists");
  if (checklists) {
    try { userChecklistsState = JSON.parse(checklists); } catch (e) { userChecklistsState = {}; }
  }
  
  studyStreak = parseInt(localStorage.getItem("pathadvisor_streak")) || 0;
  lastStudyDate = localStorage.getItem("pathadvisor_last_date") || "";

  calculateStreak();
}

function saveChecklists() {
  localStorage.setItem("pathadvisor_checklists", JSON.stringify(userChecklistsState));
}

function calculateStreak() {
  if (!lastStudyDate) {
    studyStreak = 0;
    return;
  }
  
  const today = new Date();
  const lastDate = new Date(lastStudyDate);
  const timeDiff = today.getTime() - lastDate.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  if (dayDiff > 1) {
    studyStreak = 0;
    localStorage.setItem("pathadvisor_streak", 0);
  }
}

function updateStreakUI() {
  valStreakEl.textContent = `${studyStreak} day${studyStreak === 1 ? '' : 's'}`;
}

// 7. Event listeners and Sliders binding
function setupEventListeners() {
  // Bind slider values updates
  const bindSliderInput = (slider, label) => {
    slider.addEventListener("input", () => {
      label.textContent = `${slider.value}%`;
    });
  };

  bindSliderInput(rangeTechEl, lblValTechEl);
  bindSliderInput(rangeDesignEl, lblValDesignEl);
  bindSliderInput(rangeDataEl, lblValDataEl);
  bindSliderInput(rangeStrategyEl, lblValStrategyEl);

  // Load demo profile
  btnLoadDemoEl.addEventListener("click", () => {
    rangeTechEl.value = "80";
    lblValTechEl.textContent = "80%";
    rangeDesignEl.value = "25";
    lblValDesignEl.textContent = "25%";
    rangeDataEl.value = "85";
    lblValDataEl.textContent = "85%";
    rangeStrategyEl.value = "50";
    lblValStrategyEl.textContent = "50%";

    txtBioEl.value = DEMO_RESUME;
    
    // Automatically match
    handleMatchesCalculation();
  });

  // Calculate Matches Click
  btnCalculateEl.addEventListener("click", handleMatchesCalculation);

  // Reset database data
  btnResetDataEl.addEventListener("click", () => {
    if (confirm("Reset career milestones history and study logs? This clears saved state.")) {
      localStorage.clear();
      userChecklistsState = {};
      studyStreak = 0;
      lastStudyDate = "";
      
      updateStreakUI();
      
      // Close active panel
      activeSelectedCareerId = "";
      detailsActiveEl.classList.add("hidden");
      detailsEmptyEl.classList.remove("hidden");
      
      // Reset matches list
      matchesCardsListEl.innerHTML = `
        <div class="welcome-placeholder">
          <i class="fa-solid fa-arrows-to-eye placeholder-icon"></i>
          <h3>Ready for Assessment</h3>
          <p>Adjust your skill configuration sliders and enter your background credentials, then trigger matching loops to view calculated career tracks.</p>
        </div>
      `;
      lblMatchesCountEl.textContent = "Ready to match";
      
      // Reset inputs
      rangeTechEl.value = "50"; lblValTechEl.textContent = "50%";
      rangeDesignEl.value = "50"; lblValDesignEl.textContent = "50%";
      rangeDataEl.value = "50"; lblValDataEl.textContent = "50%";
      rangeStrategyEl.value = "50"; lblValStrategyEl.textContent = "50%";
      txtBioEl.value = "";
    }
  });
}

// 8. Career Similarity calculations
function handleMatchesCalculation() {
  const userTech = parseInt(rangeTechEl.value);
  const userDesign = parseInt(rangeDesignEl.value);
  const userData = parseInt(rangeDataEl.value);
  const userStrategy = parseInt(rangeStrategyEl.value);
  const bioText = txtBioEl.value.trim().toLowerCase();

  // Sort and match loop
  const matchingScores = CAREERS_DATABASE.map(c => {
    // A. Interest Delta Math: 60 points
    const diff = Math.abs(userTech - c.weights.tech) +
                 Math.abs(userDesign - c.weights.design) +
                 Math.abs(userData - c.weights.data) +
                 Math.abs(userStrategy - c.weights.strategy);
    // Average delta per category max 100
    const interestMatch = Math.max(0, 100 - (diff / 4));

    // B. Bio Keyword Match: 40 points
    let matchesCount = 0;
    c.keywords.forEach(kw => {
      const reg = new RegExp(`\\b${kw}\\b`, "i");
      if (reg.test(bioText)) {
        matchesCount++;
      }
    });

    const keywordMatch = c.keywords.length > 0 ? (matchesCount / c.keywords.length) * 40 : 0;

    const finalScore = Math.min(Math.round((interestMatch * 0.6) + keywordMatch), 100);

    return {
      ...c,
      matchScore: finalScore,
      matchedKeywordCount: matchesCount
    };
  });

  // Sort by highest match score first
  matchingScores.sort((a, b) => b.matchScore - a.matchScore);

  // Render cards lists
  renderMatchesList(matchingScores);

  // Auto select top matched card
  if (matchingScores.length > 0) {
    loadCareerDetails(matchingScores[0].id);
  }
}

function renderMatchesList(matches) {
  matchesCardsListEl.innerHTML = "";
  lblMatchesCountEl.textContent = `Calculated ${matches.length} matches`;

  matches.forEach(m => {
    const card = document.createElement("div");
    card.className = `match-card ${activeSelectedCareerId === m.id ? 'active' : ''}`;
    card.id = `card-${m.id}`;

    let ratingClass = "fair";
    let scoreTitle = "Fair Match";
    if (m.matchScore >= 80) {
      ratingClass = "strong";
      scoreTitle = "Strong Match";
    } else if (m.matchScore < 50) {
      ratingClass = "";
      scoreTitle = "Low Match";
    }

    card.innerHTML = `
      <div class="match-card-header">
        <h4>${m.title}</h4>
        <span class="match-score-badge ${ratingClass}">${m.matchScore}% Match</span>
      </div>
      <p class="match-card-desc">${m.description.substring(0, 85)}...</p>
      <div class="match-card-footer">
        <span class="match-cat">${m.category}</span>
        <button class="btn btn-secondary btn-sm btn-view-path">Explore Path <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    `;

    const triggerSelect = () => {
      document.querySelectorAll(".match-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      loadCareerDetails(m.id);
    };

    card.querySelector(".btn-view-path").addEventListener("click", triggerSelect);
    card.addEventListener("click", triggerSelect);

    matchesCardsListEl.appendChild(card);
  });
}

// 9. Milestone checklist & progress persistence
function loadCareerDetails(careerId) {
  activeSelectedCareerId = careerId;
  const career = CAREERS_DATABASE.find(c => c.id === careerId);
  if (!career) return;

  lblDetailsCategoryEl.textContent = career.category;
  lblDetailsNameEl.textContent = career.title;
  lblDetailsDescEl.textContent = career.description;
  lblDetailsGrowthEl.textContent = career.growth;
  lblDetailsSalaryEl.textContent = career.salary;

  // Resource Box links
  detailsResourceBoxEl.innerHTML = `
    <a href="${career.resource.url}" target="_blank" rel="noopener noreferrer" class="resource-link-box">
      <span><i class="fa-solid fa-graduation-cap"></i> ${career.resource.name}</span>
      <i class="fa-solid fa-up-right-from-square"></i>
    </a>
  `;

  // Dynamic roadmap checklist builder
  renderMilestoneChecklist(career);

  // Calculations
  updateRoadmapProgress(career);

  // Switch screens
  detailsEmptyEl.classList.add("hidden");
  detailsActiveEl.classList.remove("hidden");
}

function renderMilestoneChecklist(career) {
  detailsChecklistEl.innerHTML = "";
  
  if (!userChecklistsState[career.id]) {
    userChecklistsState[career.id] = {};
  }
  
  const checklist = userChecklistsState[career.id];

  career.milestones.forEach((m, index) => {
    const isChecked = !!checklist[index];

    const li = document.createElement("li");
    li.className = `milestone-item ${isChecked ? 'checked' : ''}`;
    li.setAttribute("role", "checkbox");
    li.setAttribute("aria-checked", isChecked);
    li.tabIndex = 0;

    li.innerHTML = `
      <div class="chk-icon"><i class="fa-solid fa-check"></i></div>
      <span class="chk-text">${m}</span>
    `;

    const toggleAction = () => {
      checklist[index] = !isChecked;
      saveChecklists();
      
      // Update checklist item color in UI
      li.className = `milestone-item ${!isChecked ? 'checked' : ''}`;
      li.setAttribute("aria-checked", !isChecked);
      
      // Re-trigger progress re-evaluation
      updateRoadmapProgress(career);

      // Streak log calculation
      const todayStr = new Date().toDateString();
      if (lastStudyDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastStudyDate === yesterday.toDateString()) {
          studyStreak++;
        } else {
          studyStreak = 1;
        }
        
        lastStudyDate = todayStr;
        localStorage.setItem("pathadvisor_streak", studyStreak);
        localStorage.setItem("pathadvisor_last_date", lastStudyDate);
        updateStreakUI();
      }

      // Re-render item lists to match checks
      renderMilestoneChecklist(career);
    };

    li.addEventListener("click", toggleAction);
    li.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleAction();
      }
    });

    detailsChecklistEl.appendChild(li);
  });
}

function updateRoadmapProgress(career) {
  const checklist = userChecklistsState[career.id] || {};
  const total = career.milestones.length;
  
  let checkedCount = 0;
  career.milestones.forEach((m, index) => {
    if (checklist[index]) checkedCount++;
  });

  const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  
  // Animate dial indicator
  animateRoadmapGauge(percentage);
}

function animateRoadmapGauge(target) {
  let val = 0;
  const maxOffset = 276;

  if (window.roadmapGaugeInterval) clearInterval(window.roadmapGaugeInterval);

  window.roadmapGaugeInterval = setInterval(() => {
    if (val < target) val++;
    else if (val > target) val--;
    else clearInterval(window.roadmapGaugeInterval);

    lblDetailsRoadmapPercentEl.textContent = `${val}%`;
    const offset = maxOffset - (maxOffset * val) / 100;
    roadmapIndicatorEl.style.strokeDashoffset = offset;

    // Dial colors
    if (val >= 80) roadmapIndicatorEl.style.stroke = "var(--clr-success)";
    else if (val >= 40) roadmapIndicatorEl.style.stroke = "var(--clr-secondary)";
    else roadmapIndicatorEl.style.stroke = "var(--clr-accent)";
  }, 10);
}
