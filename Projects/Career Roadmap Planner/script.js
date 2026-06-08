document.addEventListener('DOMContentLoaded', () => {
  // Preset Career Roadmap Data Tree Structures
  const ROADMAPS = {
    frontend: {
      name: "Frontend Developer",
      phases: [
        {
          id: "beginner",
          name: "1. Beginner Essentials",
          skills: [
            {
              id: "html",
              label: "HTML5 Structure",
              desc: "Learn structural semantic markup layouts, document accessibility, and forms components validation.",
              checkpoints: ["Semantic HTML5 tags", "Forms and validations", "SEO Metadata structure", "Web Accessibility standards"],
              resources: [
                { type: "doc", label: "MDN Semantic HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics" },
                { type: "video", label: "HTML Full Course by FCC", url: "https://www.youtube.com/watch?v=kUMe1FH4CHE" }
              ]
            },
            {
              id: "css",
              label: "CSS3 Styling",
              desc: "Implement modern styling grids, layouts, responsive layouts, variables, animations, and typography configurations.",
              checkpoints: ["Box Model parameters", "Flexbox and Grid systems", "Media Queries breakpoints", "CSS Variables tokens"],
              resources: [
                { type: "doc", label: "CSS-Tricks Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
                { type: "video", label: "CSS Grid Tutorial by Dave Gray", url: "https://www.youtube.com/watch?v=jV8B24rSN5o" }
              ]
            },
            {
              id: "js",
              label: "JavaScript Foundations",
              desc: "Master language structures, scope, async closures, event loops, DOM traversals, and modern ES6 APIs.",
              checkpoints: ["Variables and functions", "DOM selection interfaces", "Promises and async fetch callbacks", "Event bubbling & capture"],
              resources: [
                { type: "doc", label: "javascript.info Tutorial", url: "https://javascript.info/" },
                { type: "video", label: "JS Crash Course by Traversy", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c" }
              ]
            }
          ]
        },
        {
          id: "intermediate",
          name: "2. Intermediate Frameworks",
          skills: [
            {
              id: "git",
              label: "Git Version Control",
              desc: "Manage projects collaborative loops, merges, conflicts, branch configurations, and remote repositories hooks.",
              checkpoints: ["Basic commands (add, commit, push)", "Branches creation and merging", "Resolving merge conflicts", "Github fork & pull requests workflow"],
              resources: [
                { type: "doc", label: "Git Official Manual", url: "https://git-scm.com/doc" },
                { type: "video", label: "Git & GitHub Beginner Tutorial", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" }
              ]
            },
            {
              id: "react",
              label: "React.js Framework",
              desc: "Understand components architectures, lifecycle triggers, state management scopes, custom hooks, and virtual DOM calculations.",
              checkpoints: ["JSX syntax markup rules", "Props vs State components data flow", "React Hooks (useState, useEffect)", "Context API state management"],
              resources: [
                { type: "doc", label: "React Official Documentation", url: "https://react.dev/" },
                { type: "video", label: "React Course for Beginners", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" }
              ]
            },
            {
              id: "tailwind",
              label: "Tailwind CSS Utility",
              desc: "Scale styles faster using functional classes configurations, preset configs, responsive modifiers, and themes integrations.",
              checkpoints: ["Utility-first principles", "Tailwind configuration options", "Responsive layouts modifiers", "Customizing themes & plugins"],
              resources: [
                { type: "doc", label: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs" }
              ]
            }
          ]
        },
        {
          id: "advanced",
          name: "3. Advanced Architectures",
          skills: [
            {
              id: "ts",
              label: "TypeScript Integration",
              desc: "Inject type systems validations to prevent runtime errors, declare interfaces, aliases, types, and generic modules.",
              checkpoints: ["Basic type annotations", "Interfaces and Types", "Generics syntax guidelines", "Integrating TS with React codebases"],
              resources: [
                { type: "doc", label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" }
              ]
            },
            {
              id: "nextjs",
              label: "Next.js Framework",
              desc: "Develop production-ready SSR layouts, dynamic route setups, API fetch hooks, server configurations, and hydration models.",
              checkpoints: ["App Router layouts directories", "Server vs Client Components", "Static vs Server-side rendering", "API Routes integration"],
              resources: [
                { type: "doc", label: "Next.js Docs", url: "https://nextjs.org/docs" }
              ]
            }
          ]
        }
      ]
    },
    backend: {
      name: "Backend Developer",
      phases: [
        {
          id: "beginner",
          name: "1. Backend Basics",
          skills: [
            {
              id: "nodejs",
              label: "Node.js Platform",
              desc: "Run JavaScript server-side, map event loops configurations, handle fs file buffers, stream APIs, and request modules.",
              checkpoints: ["Node Runtime execution environments", "NPM package package loaders", "File system modules read/write", "Event-driven loop structures"],
              resources: [
                { type: "doc", label: "Node.js Docs", url: "https://nodejs.org/docs" }
              ]
            },
            {
              id: "express",
              label: "Express.js REST APIs",
              desc: "Construct routing controllers, write custom middleware intercepts, manage request headers, and capture status parameters.",
              checkpoints: ["App Routing setup", "Request/Response parameters mapping", "Writing custom Middleware", "RESTful path architectures"],
              resources: [
                { type: "doc", label: "Express Guide", url: "https://expressjs.com/" }
              ]
            }
          ]
        },
        {
          id: "intermediate",
          name: "2. Databases & Security",
          skills: [
            {
              id: "sql",
              label: "Relational SQL (Postgres)",
              desc: "Master query syntax, tables relationships configurations, normalization rules, and performance index parameters.",
              checkpoints: ["CRUD Select query syntax", "Joins (Inner, Left, Right)", "DB Schemas designing and Normalization", "Index creation for fast queries"],
              resources: [
                { type: "doc", label: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/" }
              ]
            },
            {
              id: "mongodb",
              label: "NoSQL Database (MongoDB)",
              desc: "Store dynamic JSON collections, map index indices, query nested documents, and setup mongoose models validation.",
              checkpoints: ["Document-based tables concepts", "Mongoose models setups", "Aggregate queries pipelines", "Indexed key checks"],
              resources: [
                { type: "doc", label: "MongoDB University Docs", url: "https://learn.mongodb.com/" }
              ]
            }
          ]
        },
        {
          id: "advanced",
          name: "3. Systems at Scale",
          skills: [
            {
              id: "docker",
              label: "Docker Containerization",
              desc: "Package applications with dependencies, construct Dockerfile configs, manage volumes, network bindings, and compose sets.",
              checkpoints: ["Containers vs Virtual Machines", "Writing Dockerfiles configs", "Docker Compose services mapping", "Volume caching databases"],
              resources: [
                { type: "doc", label: "Docker Reference Docs", url: "https://docs.docker.com/" }
              ]
            }
          ]
        }
      ]
    },
    "data-science": {
      name: "Data Scientist",
      phases: [
        {
          id: "beginner",
          name: "1. Statistics Foundations",
          skills: [
            {
              id: "python",
              label: "Python Programming",
              desc: "Learn scripting syntax, structures, modules imports, lists/dicts logic, and clean functional programming.",
              checkpoints: ["Variables and functions", "OOP concepts", "Data Structures", "Libraries management (pip)"],
              resources: [
                { type: "doc", label: "Python Docs", url: "https://docs.python.org/3/" }
              ]
            },
            {
              id: "math",
              label: "Linear Algebra & Prob",
              desc: "Master vector dot products, matrices operations, probability distributions, limits, and regression math concepts.",
              checkpoints: ["Matrix multiplication operations", "Probability Distributions", "Hypothesis Testing parameters", "Calculus gradient descents"],
              resources: [
                { type: "doc", label: "Khan Academy Math Course", url: "https://www.khanacademy.org/math" }
              ]
            }
          ]
        },
        {
          id: "intermediate",
          name: "2. Data Wrangling & Viz",
          skills: [
            {
              id: "pandas",
              label: "Pandas DataFrames",
              desc: "Manipulate arrays, perform group-by analysis, merge multiple datasets, and clean up empty null fields.",
              checkpoints: ["DataFrame arrays selection", "Data cleaning and NULL replacement", "GroupBy aggregations", "Merging and Joining sets"],
              resources: [
                { type: "doc", label: "Pandas User Guide", url: "https://pandas.pydata.org/docs/user_guide/index.html" }
              ]
            }
          ]
        },
        {
          id: "advanced",
          name: "3. Machine Learning",
          skills: [
            {
              id: "sklearn",
              label: "Scikit-Learn Algorithms",
              desc: "Train regression models, setup classifiers, evaluate performance grids (F1-score, Precision), and tune hyperparameters.",
              checkpoints: ["Supervised vs Unsupervised learning", "Model training & validation splits", "Linear/Logistic regression models", "Random Forest classifications"],
              resources: [
                { type: "doc", label: "Scikit-Learn Docs", url: "https://scikit-learn.org/stable/" }
              ]
            }
          ]
        }
      ]
    },
    "ai-ml": {
      name: "AI / ML Engineer",
      phases: [
        {
          id: "beginner",
          name: "1. Mathematical Core",
          skills: [
            {
              id: "python-ml",
              label: "Python SciPy Stack",
              desc: "Work with NumPy matrices arrays, execute fast mathematical calculations, and write basic vector mathematics.",
              checkpoints: ["NumPy arrays operations", "SciPy scientific modules", "Vectorized calculations logic", "Matplotlib visualization scripts"],
              resources: [
                { type: "doc", label: "NumPy Quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html" }
              ]
            }
          ]
        },
        {
          id: "intermediate",
          name: "2. Classical Algorithms",
          skills: [
            {
              id: "regression",
              label: "Statistical Models",
              desc: "Understand cost functions, write gradient descents, compute multi-class classifications, and avoid overfitting.",
              checkpoints: ["Loss functions calculations", "Gradient Descent optimizations", "L1 / L2 Regularization parameters", "Clustering (K-Means)"],
              resources: [
                { type: "doc", label: "Machine Learning Crash Course by Google", url: "https://developers.google.com/machine-learning/crash-course" }
              ]
            }
          ]
        },
        {
          id: "advanced",
          name: "3. Deep Learning Core",
          skills: [
            {
              id: "pytorch",
              label: "PyTorch Framework",
              desc: "Design neural networks layers, write loss function loops, compute backpropagation gradients, and train CNNs.",
              checkpoints: ["Tensors manipulation APIs", "Building Custom NN Modules", "Loss functions and optimizers", "CNNs / RNNs layer layouts"],
              resources: [
                { type: "doc", label: "PyTorch Documentation", url: "https://pytorch.org/docs/" }
              ]
            }
          ]
        }
      ]
    }
  };

  // OOP State Manager
  class RoadmapManager {
    constructor() {
      this.activeTrack = 'frontend';
      this.completedNodes = new Set(JSON.parse(localStorage.getItem('crp_completed_nodes')) || []);
    }

    toggleNode(nodeId) {
      if (this.completedNodes.has(nodeId)) {
        this.completedNodes.delete(nodeId);
      } else {
        this.completedNodes.add(nodeId);
      }
      this.saveProgress();
    }

    resetProgress() {
      // Clear all completed skills in active track
      const activeRoadmap = ROADMAPS[this.activeTrack];
      activeRoadmap.phases.forEach(phase => {
        phase.skills.forEach(skill => {
          this.completedNodes.delete(skill.id);
        });
      });
      this.saveProgress();
    }

    saveProgress() {
      localStorage.setItem('crp_completed_nodes', JSON.stringify([...this.completedNodes]));
    }

    calculateOverallStats() {
      const activeRoadmap = ROADMAPS[this.activeTrack];
      let totalSkills = 0;
      let completedSkills = 0;

      activeRoadmap.phases.forEach(phase => {
        phase.skills.forEach(skill => {
          totalSkills++;
          if (this.completedNodes.has(skill.id)) {
            completedSkills++;
          }
        });
      });

      const percentage = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
      return { totalSkills, completedSkills, percentage };
    }

    calculatePhaseStats(phaseId) {
      const activeRoadmap = ROADMAPS[this.activeTrack];
      const phase = activeRoadmap.phases.find(p => p.id === phaseId);
      if (!phase) return { total: 0, completed: 0, percentage: 0 };

      let total = 0;
      let completed = 0;
      phase.skills.forEach(skill => {
        total++;
        if (this.completedNodes.has(skill.id)) {
          completed++;
        }
      });

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { total, completed, percentage };
    }
  }

  // UI controller
  class UIController {
    constructor(engine) {
      this.engine = engine;

      // DOM Elements
      this.roadmapSelect = document.getElementById('roadmap-select');
      this.resetBtn = document.getElementById('reset-progress-btn');
      this.roadmapCanvas = document.getElementById('roadmap-canvas');

      // Overall Progress Header displays
      this.overallProgressVal = document.getElementById('overall-progress-val');
      this.completedFraction = document.getElementById('completed-fraction');
      this.progressCircle = document.getElementById('overall-progress-circle');

      // Sidebar detail panel displays
      this.detailPanel = document.getElementById('detail-panel');
      this.nodeIcon = document.getElementById('node-icon');
      this.nodeTitle = document.getElementById('node-title');
      this.nodeStatus = document.getElementById('node-status');
      this.nodeDescription = document.getElementById('node-description');
      
      this.checkpointsContainer = document.getElementById('checkpoints-container');
      this.checkpointsList = document.getElementById('checkpoints-list');
      
      this.resourcesContainer = document.getElementById('resources-container');
      this.resourcesList = document.getElementById('resources-list');
      
      this.nodeActionContainer = document.getElementById('node-action-container');
      this.markCompleteBtn = document.getElementById('mark-complete-btn');

      // Sidebar summary progress bars
      this.summaryList = document.getElementById('summary-list');

      this.activeNodeId = null;

      this.init();
    }

    init() {
      this.roadmapSelect.addEventListener('change', (e) => {
        this.engine.activeTrack = e.target.value;
        this.activeNodeId = null;
        this.resetDetailPanel();
        this.renderRoadmap();
      });

      this.resetBtn.addEventListener('click', () => {
        this.engine.resetProgress();
        this.updateStats();
        this.renderRoadmap();
        if (this.activeNodeId) {
          this.loadNodeDetails(this.activeNodeId);
        }
      });

      this.markCompleteBtn.addEventListener('click', () => {
        if (this.activeNodeId) {
          this.engine.toggleNode(this.activeNodeId);
          this.updateStats();
          this.renderRoadmap();
          this.loadNodeDetails(this.activeNodeId);
        }
      });

      // Load cached level settings if exists
      this.engine.activeTrack = this.roadmapSelect.value;
      this.renderRoadmap();
    }

    resetDetailPanel() {
      this.nodeTitle.textContent = "Select a Skill";
      this.nodeIcon.textContent = "💡";
      this.nodeStatus.textContent = "PENDING";
      this.nodeStatus.className = "badge pending";
      this.nodeDescription.textContent = "Click any skill node on the roadmap to view its study checkpoints, tutorials, and documentation resources.";
      this.checkpointsContainer.style.display = 'none';
      this.resourcesContainer.style.display = 'none';
      this.nodeActionContainer.style.display = 'none';
    }

    renderRoadmap() {
      this.roadmapCanvas.innerHTML = '';
      const trackData = ROADMAPS[this.engine.activeTrack];

      trackData.phases.forEach(phase => {
        const phaseSection = document.createElement('div');
        phaseSection.className = `phase-section ${phase.id}`;

        const phaseTitle = document.createElement('h3');
        phaseTitle.className = 'phase-title';
        phaseTitle.innerHTML = `<span class="phase-dot"></span>${phase.name}`;
        phaseSection.appendChild(phaseTitle);

        const nodesGrid = document.createElement('div');
        nodesGrid.className = 'nodes-grid';

        phase.skills.forEach(skill => {
          const nodeCard = document.createElement('div');
          const isCompleted = this.engine.completedNodes.has(skill.id);
          nodeCard.className = `node-card ${isCompleted ? 'completed' : ''} ${this.activeNodeId === skill.id ? 'active-card' : ''}`;
          nodeCard.innerHTML = `
            <div class="node-info-group">
              <span class="node-label">${skill.label}</span>
              <span class="node-meta">${skill.checkpoints.length} Objectives</span>
            </div>
            <div class="node-checkbox">✓</div>
          `;

          nodeCard.addEventListener('click', () => {
            // Deselect previous node
            const prevActive = this.roadmapCanvas.querySelector('.active-card');
            if (prevActive) prevActive.classList.remove('active-card');
            
            nodeCard.classList.add('active-card');
            this.loadNodeDetails(skill.id);
          });

          nodesGrid.appendChild(nodeCard);
        });

        phaseSection.appendChild(nodesGrid);
        this.roadmapCanvas.appendChild(phaseSection);
      });

      this.updateStats();
    }

    loadNodeDetails(skillId) {
      this.activeNodeId = skillId;
      const trackData = ROADMAPS[this.engine.activeTrack];
      
      // Find skill node parameters
      let foundSkill = null;
      trackData.phases.forEach(phase => {
        const s = phase.skills.find(sk => sk.id === skillId);
        if (s) foundSkill = s;
      });

      if (!foundSkill) return;

      const isCompleted = this.engine.completedNodes.has(skillId);

      this.nodeTitle.textContent = foundSkill.label;
      this.nodeIcon.textContent = "⚡";
      this.nodeStatus.textContent = isCompleted ? "COMPLETED" : "PENDING";
      this.nodeStatus.className = `badge ${isCompleted ? 'completed' : 'pending'}`;
      this.nodeDescription.textContent = foundSkill.desc;

      // Populate objectives checklists
      this.checkpointsList.innerHTML = '';
      foundSkill.checkpoints.forEach(chk => {
        const li = document.createElement('li');
        li.textContent = chk;
        this.checkpointsList.appendChild(li);
      });
      this.checkpointsContainer.style.display = 'block';

      // Populate resource links anchors
      this.resourcesList.innerHTML = '';
      if (foundSkill.resources && foundSkill.resources.length > 0) {
        foundSkill.resources.forEach(res => {
          const rLink = document.createElement('a');
          rLink.href = res.url;
          rLink.target = '_blank';
          rLink.className = 'resource-link';
          rLink.innerHTML = `
            <span>${res.label}</span>
            <span class="link-type">${res.type}</span>
          `;
          this.resourcesList.appendChild(rLink);
        });
        this.resourcesContainer.style.display = 'block';
      } else {
        this.resourcesContainer.style.display = 'none';
      }

      // Action button updates
      this.markCompleteBtn.textContent = isCompleted ? "Reset Progress" : "Mark Completed";
      this.nodeActionContainer.style.display = 'block';
    }

    updateStats() {
      // Calculate overall stats values
      const stats = this.engine.calculateOverallStats();
      this.overallProgressVal.textContent = `${stats.percentage}%`;
      this.completedFraction.textContent = `${stats.completedSkills} / ${stats.totalSkills} Skills`;

      // Update circular SVG timeline ring offset
      // Stroke dash offset calculation: circumference = 2 * PI * r = 150.79
      const c = 150.79;
      const offset = c - (stats.percentage / 100) * c;
      this.progressCircle.style.strokeDashoffset = offset;

      // Update Phase summary columns progress bars
      this.summaryList.innerHTML = '';
      const trackData = ROADMAPS[this.engine.activeTrack];
      
      trackData.phases.forEach(phase => {
        const pStats = this.engine.calculatePhaseStats(phase.id);
        const item = document.createElement('div');
        item.className = `summary-item ${phase.id}`;
        item.innerHTML = `
          <div class="summary-meta">
            <span class="summary-lbl">${phase.name.split('. ').pop()}</span>
            <span class="summary-val">${pStats.percentage}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${pStats.percentage}%"></div>
          </div>
        `;
        this.summaryList.appendChild(item);
      });
    }

    formatTime(totalSecs) {
      const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
      const secs = (totalSecs % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    }
  }

  // Ignite Engine
  const engine = new RoadmapManager();
  new UIController(engine);
});
