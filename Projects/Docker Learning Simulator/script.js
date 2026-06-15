/**
 * DockerSim - Interactive Docker Learning Simulator
 * Core Application Script
 * Strictly Vanilla JS, offline-safe, with detailed terminal parsing,
 * daemon visualization, and a mock browser preview system.
 */

// ==========================================================================
// 1. LESSONS CURRICULUM DEFINITIONS
// ==========================================================================
const lessons = [
  {
    level: 1,
    title: "Level 1: Hello Container",
    badge: "Level 1: First Container",
    concept: "Welcome to DockerSim! Docker containers are isolated environments that bundle an application with its dependencies. To verify Docker is running, we execute a simple greeting container using the <code>hello-world</code> image.",
    objectives: [
      { id: "run_hello_world", text: 'Run the hello-world container using <code>docker run hello-world</code>', done: false }
    ],
    hint: "Type <code>docker run hello-world</code> in the terminal and press Enter. This will check local registry, simulate pulling the image from Docker Hub, and execute its greeting code.",
    dockerfileLocked: true,
    dockerfileInitial: ""
  },
  {
    level: 2,
    title: "Level 2: Web Server & Ports",
    badge: "Level 2: Web Server & Ports",
    concept: "Containers are completely isolated from the host network by default. To make a web server (like Nginx) accessible, you must publish its port using the <code>-p &lt;host_port&gt;:&lt;container_port&gt;</code> flag. We also want to run it in detached (background) mode with <code>-d</code> and name it <code>web-server</code> using the <code>--name</code> flag.",
    objectives: [
      { id: "run_nginx_detached", text: "Run an <code>nginx</code> container in detached mode (<code>-d</code>)", done: false },
      { id: "port_mapping_8080", text: "Map host port <code>8080</code> to container port <code>80</code> (<code>-p 8080:80</code>)", done: false },
      { id: "name_web_server", text: "Name the container <code>web-server</code> (<code>--name web-server</code>)", done: false }
    ],
    hint: "Type: <code>docker run -d -p 8080:80 --name web-server nginx</code>. Once running, you can click on the port link in the container card or refresh the browser preview to see the Nginx welcome page!",
    dockerfileLocked: true,
    dockerfileInitial: ""
  },
  {
    level: 3,
    title: "Level 3: Database & Envs",
    badge: "Level 3: Database & Envs",
    concept: "Docker allows you to inject configuration parameters called environment variables inside containers using the <code>-e KEY=VALUE</code> flag. Databases like PostgreSQL require env vars to initialize their root database credentials.",
    objectives: [
      { id: "run_postgres_detached", text: "Run a <code>postgres</code> container in detached mode", done: false },
      { id: "name_db", text: "Name the container <code>db</code> (<code>--name db</code>)", done: false },
      { id: "env_password", text: "Set environment variable <code>POSTGRES_PASSWORD=secret</code>", done: false }
    ],
    hint: "Type: <code>docker run -d -e POSTGRES_PASSWORD=secret --name db postgres</code>. You can verify environment variables by typing <code>docker inspect db</code>.",
    dockerfileLocked: true,
    dockerfileInitial: ""
  },
  {
    level: 4,
    title: "Level 4: Volumes Storage",
    badge: "Level 4: Volumes Storage",
    concept: "By default, containers are ephemeral: any files created inside them are deleted when they stop. To persist files, Docker maps a host directory or volume to a container path using the <code>-v &lt;volume_name&gt;:&lt;container_path&gt;</code> flag. Let's start a persistent Redis cache.",
    objectives: [
      { id: "run_redis_detached", text: "Run a <code>redis</code> container in detached mode with name <code>storage</code>", done: false },
      { id: "volume_mount", text: "Mount host volume <code>data_store</code> to <code>/data</code> (<code>-v data_store:/data</code>)", done: false }
    ],
    hint: "Type: <code>docker run -d -v data_store:/data --name storage redis</code>. This will automatically allocate a volume named <code>data_store</code> on your host and attach it to Redis's data store directory.",
    dockerfileLocked: true,
    dockerfileInitial: ""
  },
  {
    level: 5,
    title: "Level 5: Build Custom Images",
    badge: "Level 5: Custom Images",
    concept: "To deploy custom code, you write a <code>Dockerfile</code>. Open the <b>Dockerfile</b> tab in the sidebar. Write standard directives to compile a Node.js web server. Then build it into an image named <code>node-app</code> and run it, tunneling host port <code>3000</code>.",
    objectives: [
      { id: "write_dockerfile", text: "Write the correct Dockerfile directives in the editor tab", done: false },
      { id: "build_image", text: "Build the image named <code>node-app</code> (<code>docker build -t node-app .</code>)", done: false },
      { id: "run_node_app", text: "Run the container from <code>node-app</code> mapping host port <code>3000</code> to container port <code>3000</code> in detached mode", done: false }
    ],
    hint: "1. Go to the <b>Dockerfile</b> tab. Put in directives: <code>FROM node:18</code>, <code>WORKDIR /app</code>, <code>COPY package.json .</code>, <code>RUN npm install</code>, <code>COPY . .</code>, <code>EXPOSE 3000</code>, and <code>CMD [\"node\", \"server.js\"]</code>.<br>2. Click <b>Build Image</b> or run <code>docker build -t node-app .</code> in the CLI.<br>3. Run: <code>docker run -d -p 3000:3000 node-app</code>.",
    dockerfileLocked: false,
    dockerfileInitial: `# Write your Dockerfile instructions here...
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`
  }
];

// ==========================================================================
// 2. STATE MANAGER VARIABLES
// ==========================================================================
const state = {
  currentLevel: 1,
  pulledImages: [], // array of { repository: string, tag: string, id: string, created: string, size: string }
  containers: [], // array of { id: string, name: string, image: string, status: string, ports: string, env: object, volume: string, created: string, isDetached: boolean, command: string }
  volumes: [], // array of string names
  commandHistory: [],
  historyIndex: -1,
  dockerfileContent: "",
  isDockerfileValid: false,
  isAttachedMode: false,
  attachedContainerId: null,
  browserPort: null,
  activeTab: "lessons" // "lessons" or "dockerfile"
};

// Available simulation images dictionary
const SIMULATION_IMAGES = {
  'hello-world': { repository: 'hello-world', tag: 'latest', id: 'feb5d9fea6a5', size: '13.3 kB', cmd: '/hello' },
  'nginx': { repository: 'nginx', tag: 'latest', id: '605c77e624dd', size: '141 MB', cmd: '/docker-entrypoint.sh' },
  'postgres': { repository: 'postgres', tag: 'latest', id: '3b66d8e8b2cc', size: '379 MB', cmd: 'docker-entrypoint.s…' },
  'redis': { repository: 'redis', tag: 'latest', id: '7614ae1553b1', size: '113 MB', cmd: 'docker-entrypoint.s…' },
  'node': { repository: 'node', tag: '18', id: 'a5c3e9812dd9', size: '912 MB', cmd: 'node' }
};

let levelPreviouslyCompleted = false;

// ==========================================================================
// 3. INITIALIZATION & BINDINGS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initElements();
  loadStateFromLocalStorage();
  loadLevel(state.currentLevel);
  setupEventListeners();
  renderImages();
  renderContainers();
  renderVolumes();
  loadBrowserPreview(state.browserPort);
  
  // Focus CLI
  terminalInput.focus();
  updateCaret();
});

// Cache DOM Nodes
let themeToggle, levelBadge, progressPercentage, progressFillBar;
let tabLessons, tabDockerfile, panelLessons, panelDockerfile;
let lessonSelect, lessonDetails;
let buildImageBtn, dockerfileTextarea;
let resetTerminalBtn, terminalScreen, terminalInput, terminalCaret;
let imageRegistryList, containersList, volumesList;
let browserAddress, browserRefreshBtn, browserViewportScreen;

function initElements() {
  themeToggle = document.getElementById("theme-toggle");
  levelBadge = document.getElementById("level-badge");
  progressPercentage = document.getElementById("progress-percentage");
  progressFillBar = document.getElementById("progress-fill-bar");
  
  tabLessons = document.getElementById("tab-lessons");
  tabDockerfile = document.getElementById("tab-dockerfile");
  panelLessons = document.getElementById("panel-lessons");
  panelDockerfile = document.getElementById("panel-dockerfile");
  
  lessonSelect = document.getElementById("lesson-select");
  lessonDetails = document.getElementById("lesson-details");
  
  buildImageBtn = document.getElementById("build-image-btn");
  dockerfileTextarea = document.getElementById("dockerfile-textarea");
  
  resetTerminalBtn = document.getElementById("reset-terminal-btn");
  terminalScreen = document.getElementById("terminal-screen");
  terminalInput = document.getElementById("terminal-input");
  terminalCaret = document.getElementById("terminal-caret");
  
  imageRegistryList = document.getElementById("image-registry-list");
  containersList = document.getElementById("containers-list");
  volumesList = document.getElementById("volumes-list");
  
  browserAddress = document.getElementById("browser-address");
  browserRefreshBtn = document.getElementById("browser-refresh-btn");
  browserViewportScreen = document.getElementById("browser-viewport-screen");
}

function setupEventListeners() {
  // Theme Toggle
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // Toggle Icon
    const icon = themeToggle.querySelector("i");
    if (newTheme === "light") {
      icon.className = "fa-solid fa-sun";
    } else {
      icon.className = "fa-solid fa-moon";
    }
    localStorage.setItem("dockerSimTheme", newTheme);
  });
  
  // Load stored theme
  const storedTheme = localStorage.getItem("dockerSimTheme");
  if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
    themeToggle.querySelector("i").className = storedTheme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  // Sidebar navigation tabs switching
  tabLessons.addEventListener("click", () => switchTab("lessons"));
  tabDockerfile.addEventListener("click", () => switchTab("dockerfile"));

  // Select checkpoint dropdown level loader
  lessonSelect.addEventListener("change", (e) => {
    loadLevel(parseInt(e.target.value));
  });

  // Dockerfile directive buttons helper injection
  document.querySelectorAll(".btn-directive").forEach(btn => {
    btn.addEventListener("click", () => {
      if (dockerfileTextarea.disabled) return;
      const directiveText = btn.getAttribute("data-dir");
      insertTextAtCursor(dockerfileTextarea, directiveText);
      validateDockerfileInput();
    });
  });

  // Dockerfile editor change validator hook
  dockerfileTextarea.addEventListener("input", () => {
    validateDockerfileInput();
  });

  // Build image button trigger
  buildImageBtn.addEventListener("click", () => {
    if (buildImageBtn.disabled) return;
    executeBuildProcess();
  });

  // Terminal screen focus click handler
  terminalScreen.addEventListener("click", (e) => {
    // Prevent focus loss if clicking something selectable, but focus text input otherwise
    if (e.target !== terminalInput) {
      terminalInput.focus();
    }
  });

  // Terminal CLI keys keydown handler (Arrows, Tab, Enter)
  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTerminalEnter();
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleTerminalAutocomplete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handleHistoryRecall(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleHistoryRecall(1);
    }
  });

  terminalInput.addEventListener("input", updateCaret);

  // Clear log screen action button
  resetTerminalBtn.addEventListener("click", () => {
    clearTerminalScreen();
  });

  // Browser refresh trigger preview reload
  browserRefreshBtn.addEventListener("click", () => {
    loadBrowserPreview(state.browserPort);
    // Add reload spin animation
    const icon = browserRefreshBtn.querySelector("i");
    icon.classList.add("fa-spin");
    setTimeout(() => {
      icon.classList.remove("fa-spin");
    }, 500);
  });
}

// ==========================================================================
// 4. LEVEL CONFIGURATION LOADING
// ==========================================================================
function loadLevel(levelNum) {
  state.currentLevel = levelNum;
  lessonSelect.value = levelNum;
  levelPreviouslyCompleted = false;

  const data = lessons[levelNum - 1];
  
  // Set headers UI
  levelBadge.textContent = data.badge;

  // Insert Lesson panel card data
  lessonDetails.innerHTML = `
    <h3 class="lesson-title">${data.title}</h3>
    <p class="lesson-concept">${data.concept}</p>
    
    <h4>Objectives</h4>
    <div id="objectives-list-container">
      <!-- Objectives checkboxes -->
    </div>
    
    <h4>Hint</h4>
    <p class="lesson-hint">${data.hint}</p>
  `;

  // Render its objectives checkboxes list
  renderObjectives();

  // Manage Dockerfile editor state lock
  if (data.dockerfileLocked) {
    dockerfileTextarea.disabled = true;
    dockerfileTextarea.value = "";
    buildImageBtn.disabled = true;
    document.querySelectorAll(".btn-directive").forEach(btn => btn.disabled = true);
    
    // Switch to lessons tab if on Dockerfile tab
    if (state.activeTab === "dockerfile") {
      switchTab("lessons");
    }
  } else {
    dockerfileTextarea.disabled = false;
    // Populate with template if empty
    if (!dockerfileTextarea.value || dockerfileTextarea.value.trim() === "") {
      dockerfileTextarea.value = data.dockerfileInitial;
    }
    document.querySelectorAll(".btn-directive").forEach(btn => btn.disabled = false);
    validateDockerfileInput();
  }

  // Recalculate objectives progress checklist completion
  checkLevelObjectives();
  saveStateToLocalStorage();
}

function switchTab(tabName) {
  state.activeTab = tabName;
  if (tabName === "lessons") {
    tabLessons.classList.add("active");
    tabDockerfile.classList.remove("active");
    panelLessons.classList.remove("hidden");
    panelDockerfile.classList.add("hidden");
  } else {
    tabDockerfile.classList.add("active");
    tabLessons.classList.remove("active");
    panelDockerfile.classList.remove("hidden");
    panelLessons.classList.add("hidden");
    dockerfileTextarea.focus();
  }
}

// Insert directives helper at cursor
function insertTextAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const newVal = val.substring(0, start) + text + "\n" + val.substring(end);
  textarea.value = newVal;
  textarea.selectionStart = textarea.selectionEnd = start + text.length + 1;
  textarea.focus();
}

// Dockerfile validation interface
function validateDockerfileInput() {
  const content = dockerfileTextarea.value;
  state.dockerfileContent = content;

  // Insert or query dynamic status box in panel
  let statusDiv = document.getElementById("dockerfile-status-box");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "dockerfile-status-box";
    statusDiv.style.fontSize = "0.74rem";
    statusDiv.style.borderRadius = "var(--radius-sm)";
    statusDiv.style.padding = "8px 12px";
    statusDiv.style.marginTop = "auto"; // Push to bottom of flex
    panelDockerfile.appendChild(statusDiv);
  }

  const check = validateDockerfileText(content);
  state.isDockerfileValid = check.valid;

  if (check.valid) {
    buildImageBtn.disabled = false;
    statusDiv.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
    statusDiv.style.border = "1px solid rgba(16, 185, 129, 0.2)";
    statusDiv.style.color = "var(--status-success)";
    
    let wTxt = "";
    if (check.warnings.length > 0) {
      wTxt = `<br><span style="color: var(--status-warning); font-weight:600;"><i class="fa-solid fa-triangle-exclamation"></i> Warnings:</span><ul style="padding-left:16px; margin-top:4px;">` + 
             check.warnings.map(w => `<li>${w}</li>`).join('') + `</ul>`;
    }
    
    statusDiv.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Dockerfile is valid!</strong> Ready to build.${wTxt}`;
    markObjectiveDone("write_dockerfile");
  } else {
    buildImageBtn.disabled = true;
    statusDiv.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
    statusDiv.style.border = "1px solid rgba(239, 68, 68, 0.2)";
    statusDiv.style.color = "var(--status-danger)";
    
    const errList = check.errors.map(err => `<li>${err}</li>`).join('');
    statusDiv.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> Build validation errors:</strong>
                           <ul style="padding-left: 16px; margin-top: 4px;">${errList}</ul>`;
    
    // Uncheck write objective if invalid
    setObjectiveState("write_dockerfile", false);
    updateProgressUI();
  }
}

function validateDockerfileText(content) {
  const lines = content.split('\n').map(l => l.trim());
  let hasFrom = false;
  let hasExpose = false;
  let hasCmd = false;
  let errors = [];
  let warnings = [];

  for (let line of lines) {
    if (line.startsWith('#') || !line) continue;
    
    const parts = line.split(/\s+/);
    const directive = parts[0].toUpperCase();
    
    if (directive === 'FROM') {
      const img = parts.slice(1).join(' ');
      if (img.toLowerCase().includes('node')) {
        hasFrom = true;
      } else {
        errors.push("FROM instruction must specify a node image, e.g., 'FROM node:18'.");
      }
    } else if (directive === 'EXPOSE') {
      const port = parts.slice(1).join(' ');
      if (port.includes('3000')) {
        hasExpose = true;
      } else {
        errors.push("Invalid exposed port. The custom server runs on port 3000. Expose 3000.");
      }
    } else if (directive === 'CMD') {
      hasCmd = true;
    }
  }

  if (!hasFrom) {
    errors.push("Missing 'FROM' instruction (e.g. FROM node:18).");
  }
  if (!hasExpose) {
    errors.push("Missing 'EXPOSE 3000' instruction.");
  }
  if (!hasCmd) {
    errors.push("Missing 'CMD' startup execution script.");
  }

  // Add recommendations as warnings
  const upperVal = content.toUpperCase();
  if (!upperVal.includes('WORKDIR')) {
    warnings.push("No WORKDIR defined. Recommended to set WORKDIR /app.");
  }
  if (!upperVal.includes('COPY PACKAGE.JSON') && !upperVal.includes('COPY PACKAGE*')) {
    warnings.push("Consider copying package.json separately to leverage layer cache.");
  }
  if (!upperVal.includes('RUN NPM INSTALL') && !upperVal.includes('RUN NPM I')) {
    warnings.push("No dependencies install step found (RUN npm install).");
  }

  return { valid: errors.length === 0, errors, warnings };
}

// Execute Dockerfile compile simulator
async function executeBuildProcess() {
  switchTab("lessons"); // switch back to see terminal action logs
  await sleep(100);
  await simulateBuild('node-app');
  checkLevelObjectives();
  saveStateToLocalStorage();
}

// ==========================================================================
// 5. VIEW RENDERING ENGINE
// ==========================================================================
function renderObjectives() {
  const container = document.getElementById("objectives-list-container");
  if (!container) return;

  const currentLvlData = lessons[state.currentLevel - 1];
  
  container.innerHTML = currentLvlData.objectives.map(obj => {
    const checkClass = obj.done ? "done" : "";
    const iconClass = obj.done ? "fa-solid fa-square-check" : "fa-regular fa-square";
    return `
      <div class="objective-item ${checkClass}">
        <i class="${iconClass}"></i>
        <span>${obj.text}</span>
      </div>
    `;
  }).join('');
}

function renderImages() {
  if (state.pulledImages.length === 0) {
    imageRegistryList.innerHTML = `
      <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 12px; border: 1px dashed var(--border-glass); border-radius: var(--radius-sm);">
        No local images. Run a command like <code>docker run nginx</code> to pull images.
      </div>
    `;
    return;
  }

  imageRegistryList.innerHTML = state.pulledImages.map(img => {
    return `
      <div class="image-item-card">
        <div class="image-item-left">
          <i class="fa-solid fa-box-archive"></i>
          <span class="image-name-tag">${img.repository}:${img.tag}</span>
        </div>
        <span class="image-size">${img.size}</span>
      </div>
    `;
  }).join('');
}

function renderContainers() {
  if (state.containers.length === 0) {
    containersList.innerHTML = `
      <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 12px; border: 1px dashed var(--border-glass); border-radius: var(--radius-sm);">
        No active containers. Run <code>docker run</code> in the terminal to launch containers.
      </div>
    `;
    return;
  }

  containersList.innerHTML = state.containers.map(c => {
    const ledClass = c.status === 'running' ? 'running' : 'stopped';
    
    // Parse port mappings
    let portHtml = "";
    if (c.ports) {
      if (c.ports.includes('->')) {
        // "hostPort:containerPort" format or complete map
        const hostPort = c.ports.split(':')[0];
        const containerPort = c.ports.split(':')[1].split('->')[0] || c.ports.split(':')[1];
        
        if (c.status === 'running') {
          portHtml = `
            <div class="spec-info-pill clickable" onclick="openPort(${hostPort})">
              <i class="fa-solid fa-link"></i>
              <span>${hostPort}:${containerPort}</span>
            </div>
          `;
        } else {
          portHtml = `
            <div class="spec-info-pill">
              <i class="fa-solid fa-link"></i>
              <span style="text-decoration: line-through; opacity: 0.5;">${hostPort}:${containerPort}</span>
            </div>
          `;
        }
      } else {
        // default port like "5432"
        portHtml = `
          <div class="spec-info-pill">
            <i class="fa-solid fa-link"></i>
            <span>${c.ports}</span>
          </div>
        `;
      }
    }

    // Parse environment variable text representation
    let envHtml = "";
    if (c.env && Object.keys(c.env).length > 0) {
      const keys = Object.keys(c.env);
      envHtml = keys.map(k => `
        <div class="spec-info-pill" title="Env: ${k}=${c.env[k]}">
          <i class="fa-solid fa-key"></i>
          <span>${k}=${c.env[k]}</span>
        </div>
      `).join('');
    }

    // Parse volume mounts
    let volHtml = "";
    if (c.volume) {
      const volName = c.volume.split(':')[0];
      volHtml = `
        <div class="spec-info-pill">
          <i class="fa-solid fa-hard-drive"></i>
          <span>${volName}</span>
        </div>
      `;
    }

    return `
      <div class="container-card-node">
        <div class="container-card-top">
          <div class="container-info-left">
            <span class="container-status-led ${ledClass}" title="Status: ${c.status}"></span>
            <span class="container-name-label">${c.name}</span>
            <span class="container-image-tag">${c.image}</span>
          </div>
          <span class="container-card-id">${c.id}</span>
        </div>
        <div class="container-specs-row">
          <div class="spec-info-pill">
            <i class="fa-solid fa-network-wired"></i>
            <span>Bridge</span>
          </div>
          ${portHtml}
          ${envHtml}
          ${volHtml}
        </div>
      </div>
    `;
  }).join('');
}

function renderVolumes() {
  if (state.volumes.length === 0) {
    volumesList.innerHTML = `
      <div style="font-size: 0.72rem; color: var(--text-muted); padding: 4px;">No volume storage partitions allocated on host.</div>
    `;
    return;
  }

  volumesList.innerHTML = state.volumes.map(vol => {
    return `
      <div class="volume-item-card">
        <i class="fa-solid fa-hard-drive"></i>
        <span>${vol}</span>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// 6. TERMINAL INPUT HANDLING & CORE INTERPRETER
// ==========================================================================
function updateCaret() {
  terminalCaret.textContent = terminalInput.value + '█';
}

function handleHistoryRecall(direction) {
  if (state.commandHistory.length === 0) return;

  if (direction === -1) {
    // Up arrow
    if (state.historyIndex === -1) {
      state.historyIndex = state.commandHistory.length - 1;
    } else {
      state.historyIndex = Math.max(0, state.historyIndex - 1);
    }
    terminalInput.value = state.commandHistory[state.historyIndex];
  } else {
    // Down arrow
    if (state.historyIndex !== -1) {
      if (state.historyIndex === state.commandHistory.length - 1) {
        state.historyIndex = -1;
        terminalInput.value = "";
      } else {
        state.historyIndex = Math.min(state.commandHistory.length - 1, state.historyIndex + 1);
        terminalInput.value = state.commandHistory[state.historyIndex];
      }
    }
  }
  updateCaret();
}

function handleTerminalAutocomplete() {
  const val = terminalInput.value.trim();
  if (!val) return;

  const words = val.split(' ');
  const lastWord = words[words.length - 1];

  const autocompletePool = [
    'docker', 'docker run', 'docker ps', 'docker images', 'docker stop', 'docker rm', 'docker rmi',
    'docker logs', 'docker inspect', 'docker build', 'docker volume', 'docker volume ls', 'docker volume create',
    'docker volume rm', 'clear', 'help', 'next', 'nginx', 'postgres', 'redis', 'hello-world', 'node-app',
    '--name', '--detach', '--publish', '--env', '--volume', 'data_store', 'web-server'
  ];

  // Try to find matching prefix
  const matches = autocompletePool.filter(cmd => cmd.startsWith(val));
  if (matches.length === 1) {
    terminalInput.value = matches[0];
  } else {
    // Try autocomplete last word
    const subMatches = autocompletePool.filter(item => item.startsWith(lastWord));
    if (subMatches.length === 1) {
      words[words.length - 1] = subMatches[0];
      terminalInput.value = words.join(' ');
    }
  }
  updateCaret();
}

function handleTerminalEnter() {
  // If attached container wait mode, any Enter press acts as SIGINT / Detach signal
  if (state.isAttachedMode) {
    exitAttachedMode();
    return;
  }

  const rawCmd = terminalInput.value;
  const cmd = rawCmd.trim();
  
  if (cmd) {
    // Log cmd echo
    writeLog(`user@dockersim:~$ ${rawCmd}`, 'command-echo');
    
    // Add to recall history
    state.commandHistory.push(cmd);
    state.historyIndex = -1;
    
    // Execute command
    executeCommand(cmd);
  } else {
    writeLog(`user@dockersim:~$`, 'command-echo');
  }

  terminalInput.value = "";
  updateCaret();
}

function clearTerminalScreen() {
  const container = terminalScreen.querySelector(".terminal-log");
  container.innerHTML = "";
  writeLog("Terminal buffer cleared.", 'info');
}

function writeLog(text, type = 'system-output') {
  const container = terminalScreen.querySelector(".terminal-log");
  const p = document.createElement("p");
  p.className = `system-output ${type}`;
  p.innerHTML = text;
  container.appendChild(p);
  
  // Auto scroll to bottom
  terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

// --------------------------------------------------------------------------
// Command Tokenizer & Core Evaluator Engine
// --------------------------------------------------------------------------
function tokenize(commandLine) {
  const tokens = [];
  let currentToken = '';
  let inDoubleQuotes = false;
  let inSingleQuotes = false;

  for (let i = 0; i < commandLine.length; i++) {
    const char = commandLine[i];

    if (char === '"' && !inSingleQuotes) {
      inDoubleQuotes = !inDoubleQuotes;
    } else if (char === "'" && !inDoubleQuotes) {
      inSingleQuotes = !inSingleQuotes;
    } else if (char === ' ' && !inDoubleQuotes && !inSingleQuotes) {
      if (currentToken.length > 0) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }
  if (currentToken.length > 0) {
    tokens.push(currentToken);
  }
  return tokens;
}

async function executeCommand(cmdLine) {
  const tokens = tokenize(cmdLine);
  if (tokens.length === 0) return;

  const base = tokens[0].toLowerCase();

  if (base === 'clear') {
    clearTerminalScreen();
    return;
  }
  
  if (base === 'help') {
    showHelpMenu();
    return;
  }

  if (base === 'next') {
    advanceLevel();
    return;
  }

  if (base !== 'docker') {
    writeLog(`bash: ${base}: command not found. Type 'help' or 'docker' to list operations.`, 'error');
    return;
  }

  // Handle docker commands
  if (tokens.length === 1 || tokens[1].toLowerCase() === 'help' || tokens[1] === '--help') {
    showHelpMenu();
    return;
  }

  const action = tokens[1].toLowerCase();
  
  switch(action) {
    case 'run':
      await handleDockerRun(tokens);
      break;
    case 'ps':
      handleDockerPs(tokens);
      break;
    case 'images':
      handleDockerImages(tokens);
      break;
    case 'stop':
      handleDockerStop(tokens);
      break;
    case 'rm':
      handleDockerRm(tokens);
      break;
    case 'rmi':
      handleDockerRmi(tokens);
      break;
    case 'logs':
      handleDockerLogs(tokens);
      break;
    case 'inspect':
      handleDockerInspect(tokens);
      break;
    case 'build':
      await handleDockerBuild(tokens);
      break;
    case 'volume':
      handleDockerVolume(tokens);
      break;
    default:
      writeLog(`docker: '${action}' is not a docker command. See 'docker --help'`, 'error');
  }
  
  checkLevelObjectives();
  saveStateToLocalStorage();
}

function showHelpMenu() {
  writeLog(`
<span class="highlight" style="font-weight:600;">DockerSim Command-Line Interface Guide</span>
Available commands in this environment:

  <span class="highlight">docker run [options] &lt;image&gt;</span>     Pull, construct, and start a container node
     <span class="info">-d, --detach</span>             Run in background (detached mode)
     <span class="info">-p, --publish &lt;h:c&gt;</span>     Map host port &lt;h&gt; to container port &lt;c&gt;
     <span class="info">--name &lt;name&gt;</span>            Provide a custom unique name tag
     <span class="info">-e, --env &lt;K=V&gt;</span>          Pass environment credentials configurations
     <span class="info">-v, --volume &lt;v:c&gt;</span>       Mount storage partitions volume from host
  
  <span class="highlight">docker ps [-a]</span>                  List running (or stop-exited) containers
  <span class="highlight">docker images</span>                   Show local image registries
  <span class="highlight">docker stop &lt;name|id&gt;</span>           Stop an active running container
  <span class="highlight">docker rm &lt;name|id&gt;</span>             Remove stopped container cards
  <span class="highlight">docker rmi &lt;image&gt;</span>              Remove local container image files
  <span class="highlight">docker logs &lt;name|id&gt;</span>           Fetch logs outputs of container processes
  <span class="highlight">docker inspect &lt;name|id&gt;</span>        Inspect metadata structures in JSON details
  <span class="highlight">docker build -t &lt;tag&gt; .</span>         Compile Dockerfile directives in workspace
  
  <span class="highlight">docker volume ls</span>                List all host volumes
  <span class="highlight">docker volume create &lt;name&gt;</span>     Create a host volume partition
  <span class="highlight">docker volume rm &lt;name&gt;</span>         Delete a host volume partition
  
  <span class="highlight">clear</span>                           Empty output console logs
  <span class="highlight">help</span>                            Render this reference manual
  <span class="highlight">next</span>                            Proceed to next level (when goals finished)
`, 'system-output');
}

// --------------------------------------------------------------------------
// Async Pull Helper
// --------------------------------------------------------------------------
async function simulatePull(imageName, tag) {
  const imageKey = `${imageName}:${tag}`;
  terminalInput.disabled = true;
  
  writeLog(`Unable to find image '${imageKey}' locally`, 'system-output');
  await sleep(400);
  writeLog(`${tag}: Pulling from library/${imageName}`, 'system-output');
  await sleep(400);
  
  const layers = ['8a716c52a0a2', 'c5f013d2de89', '55d9d71c4c1a'];
  for (const layer of layers) {
    writeLog(`${layer}: Pulling fs layer`, 'system-output');
    await sleep(200);
  }
  for (const layer of layers) {
    writeLog(`${layer}: Downloading [========================>]  8.4MB/8.4MB`, 'system-output');
    await sleep(200);
  }
  for (const layer of layers) {
    writeLog(`${layer}: Pull complete`, 'success');
    await sleep(200);
  }
  
  const digest = 'sha256:' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
  writeLog(`Digest: ${digest}`, 'system-output');
  writeLog(`Status: Downloaded newer image for ${imageKey}`, 'success');
  
  const imgMeta = SIMULATION_IMAGES[imageName] || { repository: imageName, tag: tag, id: 'abc123def456', size: '100 MB' };
  
  state.pulledImages.push({
    repository: imageName,
    tag: tag,
    id: imgMeta.id,
    created: '2 weeks ago',
    size: imgMeta.size
  });
  
  renderImages();
  terminalInput.disabled = false;
  terminalInput.focus();
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// --------------------------------------------------------------------------
// docker run Handler
// --------------------------------------------------------------------------
async function handleDockerRun(tokens) {
  const args = tokens.slice(2);
  if (args.length === 0 || (args.length === 1 && (args[0] === '--help' || args[0] === 'help'))) {
    writeLog(`
Usage:  docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
Run a command in a new container

Options:
  -d, --detach                         Run container in background and print container ID
  -p, --publish list                   Publish a container's port(s) to the host
      --name string                    Assign a name to the container
  -e, --env list                       Set environment variables
  -v, --volume list                    Bind mount a volume
`, 'system-output');
    return;
  }

  let isDetached = false;
  let portMapping = null;
  let containerName = null;
  let envVars = {};
  let volumeMount = null;
  let imageName = null;
  let runCommand = [];

  // Parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-d' || arg === '--detach') {
      isDetached = true;
    } else if (arg === '-p' || arg.startsWith('--publish')) {
      let val = '';
      if (arg.includes('=')) {
        val = arg.split('=')[1];
      } else {
        val = args[++i];
      }
      portMapping = val;
    } else if (arg === '--name') {
      containerName = args[++i];
    } else if (arg.startsWith('--name=')) {
      containerName = arg.split('=')[1];
    } else if (arg === '-e' || arg.startsWith('--env')) {
      let val = '';
      if (arg.includes('=')) {
        val = arg.substring(arg.indexOf('=') + 1);
      } else {
        val = args[++i];
      }
      if (val && val.includes('=')) {
        const eqIdx = val.indexOf('=');
        const k = val.substring(0, eqIdx);
        const v = val.substring(eqIdx + 1);
        envVars[k] = v;
      }
    } else if (arg === '-v' || arg.startsWith('--volume')) {
      let val = '';
      if (arg.includes('=')) {
        val = arg.split('=')[1];
      } else {
        val = args[++i];
      }
      volumeMount = val;
    } else {
      // First non-flag is the image
      if (!imageName) {
        imageName = arg;
      } else {
        runCommand.push(arg);
      }
    }
  }

  if (!imageName) {
    writeLog("docker: \"run\" requires at least 1 argument. See 'docker run --help'.", "error");
    return;
  }

  // Extract base image and tag
  let baseImage = imageName;
  let tag = 'latest';
  if (imageName.includes(':')) {
    baseImage = imageName.split(':')[0];
    tag = imageName.split(':')[1];
  }

  // Validate image exists in local registry
  const isImageLocal = state.pulledImages.some(img => img.repository === baseImage && img.tag === tag);
  const isImageRecognized = SIMULATION_IMAGES[baseImage] || baseImage === 'node-app';

  if (!isImageRecognized) {
    writeLog(`docker: Error response from daemon: pull access denied for ${imageName}, repository does not exist or may require 'docker login'.`, "error");
    return;
  }

  // Pull image asynchronously if not local
  if (!isImageLocal) {
    await simulatePull(baseImage, tag);
  }

  // Generate attributes
  const containerId = Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16)).join('');
  const finalName = containerName || generateRandomName();

  // Validate container name uniqueness
  if (state.containers.some(c => c.name === finalName)) {
    writeLog(`docker: Error response from daemon: Conflict. The container name "/${finalName}" is already in use by container "${state.containers.find(c => c.name === finalName).id}". You have to remove (or rename) that container to be able to reuse that name.`, "error");
    return;
  }

  // Validate host port mapping conflicts
  if (portMapping && portMapping.includes(':')) {
    const hostPort = portMapping.split(':')[0];
    const conflictingContainer = state.containers.find(c => c.status === 'running' && c.ports && c.ports.startsWith(`${hostPort}:`));
    if (conflictingContainer) {
      writeLog(`docker: Error response from daemon: driver failed programming external connectivity on endpoint ${finalName}: Bind for 0.0.0.0:${hostPort} failed: port is already allocated.`, "error");
      return;
    }
  }

  // Handle volumes automatically allocating
  if (volumeMount) {
    const volName = volumeMount.split(':')[0];
    if (!state.volumes.includes(volName)) {
      state.volumes.push(volName);
      renderVolumes();
    }
  }

  // Construct container database node entry
  const newContainer = {
    id: containerId,
    name: finalName,
    image: `${baseImage}:${tag}`,
    status: 'running',
    ports: portMapping || (baseImage === 'postgres' ? '5432/tcp' : baseImage === 'redis' ? '6379/tcp' : '80/tcp'),
    env: envVars,
    volume: volumeMount,
    created: 'Just now',
    isDetached: isDetached,
    command: runCommand.join(' ') || (SIMULATION_IMAGES[baseImage] ? SIMULATION_IMAGES[baseImage].cmd : 'node server.js')
  };

  state.containers.push(newContainer);
  renderContainers();

  // Mode paths
  if (isDetached) {
    // Return detached hash log
    const fullId = containerId + Array.from({length: 52}, () => Math.floor(Math.random()*16).toString(16)).join('');
    writeLog(fullId, 'system-output');
    
    // Automatically load Nginx welcome or Node service welcome inside the browser card
    if (portMapping) {
      const hostPort = parseInt(portMapping.split(':')[0]);
      loadBrowserPreview(hostPort);
    }
  } else {
    // Attached mode process logs lock
    await enterAttachedMode(newContainer);
  }
}

// Attached terminal execution simulation blocking console
async function enterAttachedMode(c) {
  state.isAttachedMode = true;
  state.attachedContainerId = c.id;
  terminalInput.placeholder = "Press Enter key to detach (Ctrl+C mock)...";
  
  writeLog(`docker: Attaching to stdout/stderr of container [${c.name}]...`, 'info');
  await sleep(400);

  if (c.image.startsWith('hello-world')) {
    // Hello world prints greeting and stops (exits)
    writeLog(`
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more challenging, you can run a Ubuntu container:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
`, 'system-output');
    
    // Set to exited
    c.status = 'stopped';
    c.created = 'Exited (0) Just now';
    renderContainers();
    exitAttachedMode(false);
  } else if (c.image.startsWith('nginx')) {
    writeLog(`/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration`, 'system-output');
    await sleep(250);
    writeLog(`/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/`, 'system-output');
    await sleep(150);
    writeLog(`/docker-entrypoint.sh: Configuration complete; ready for start up`, 'system-output');
    await sleep(250);
    writeLog(`2026/06/15 03:40:00 [notice] 1#1: using the "epoll" event method`, 'system-output');
    writeLog(`2026/06/15 03:40:00 [notice] 1#1: nginx/1.25.1`, 'system-output');
    writeLog(`2026/06/15 03:40:00 [notice] 1#1: start worker process 31`, 'system-output');
    
    if (c.ports) {
      const hostPort = parseInt(c.ports.split(':')[0]);
      loadBrowserPreview(hostPort);
    }
  } else if (c.image.startsWith('postgres')) {
    writeLog(`PostgreSQL Database directory appears to contain a database; Skipping initialization`, 'system-output');
    await sleep(200);
    writeLog(`2026-06-15 03:40:00.123 UTC [1] LOG:  starting PostgreSQL 15.3 on x86_64-pc-linux-gnu`, 'system-output');
    writeLog(`2026-06-15 03:40:00.124 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432`, 'system-output');
    await sleep(200);
    writeLog(`2026-06-15 03:40:00.135 UTC [1] LOG:  database system is ready to accept connections`, 'system-output');
  } else if (c.image.startsWith('redis')) {
    writeLog(`1:C 15 Jun 2026 03:40:00.000 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo`, 'system-output');
    writeLog(`1:C 15 Jun 2026 03:40:00.000 # Redis version=7.0.11, bits=64, commit=00000000`, 'system-output');
    await sleep(200);
    writeLog(`1:M 15 Jun 2026 03:40:00.005 * Running mode=standalone, port=6379.`, 'system-output');
    writeLog(`1:M 15 Jun 2026 03:40:00.006 * Ready to accept connections`, 'system-output');
  } else if (c.image.startsWith('node-app')) {
    writeLog(`> node-app@1.0.0 start`, 'system-output');
    writeLog(`> node server.js`, 'system-output');
    await sleep(300);
    writeLog(`Server is running on port 3000`, 'success');
    writeLog(`Database connected: true`, 'success');
    writeLog(`Environment variables loaded successfully.`, 'system-output');
    
    if (c.ports) {
      const hostPort = parseInt(c.ports.split(':')[0]);
      loadBrowserPreview(hostPort);
    }
  }
}

// Press Enter to leave attached console
function exitAttachedMode(stopContainer = true) {
  const c = state.containers.find(x => x.id === state.attachedContainerId);
  
  if (c && stopContainer) {
    // attached server SIGINT stops it
    c.status = 'stopped';
    c.created = 'Exited (130) Just now';
    writeLog(`\n^C`, 'command-echo');
    writeLog(`docker: Container ${c.name} stopped.`, 'info');
    renderContainers();
    
    // Clear browser viewport if port was mapped
    if (c.ports && c.ports.includes(':')) {
      const hostPort = parseInt(c.ports.split(':')[0]);
      if (state.browserPort === hostPort) {
        loadBrowserPreview(hostPort); // Refreshes to show disconnected page
      }
    }
  }
  
  state.isAttachedMode = false;
  state.attachedContainerId = null;
  terminalInput.placeholder = "";
  writeLog("", 'system-output'); // Add line space
  terminalInput.focus();
}

function generateRandomName() {
  const left = ['pedantic', 'romantic', 'clever', 'funny', 'dreamy', 'jolly', 'eager', 'admiring', 'stoic', 'vibrant'];
  const right = ['turing', 'hopper', 'lovelace', 'einstein', 'newton', 'curie', 'hawking', 'pasteur', 'darwin', 'easley'];
  return `${left[Math.floor(Math.random() * left.length)]}_${right[Math.floor(Math.random() * right.length)]}`;
}

// --------------------------------------------------------------------------
// docker ps Handler
// --------------------------------------------------------------------------
function handleDockerPs(tokens) {
  const args = tokens.slice(2);
  const showAll = args.includes('-a') || args.includes('--all');

  let list = state.containers;
  if (!showAll) {
    list = state.containers.filter(c => c.status === 'running');
  }

  if (list.length === 0) {
    writeLog(`CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES`, 'system-output');
    return;
  }

  // Construct table outputs
  let output = `<span class="highlight" style="font-weight: 600;">CONTAINER ID   IMAGE               COMMAND                  CREATED          STATUS          PORTS                    NAMES</span>\n`;
  
  list.forEach(c => {
    // Formats padding
    const idStr = padString(c.id, 14);
    const imgStr = padString(c.image, 19);
    const cmdStr = padString(`"${c.command}"`, 24);
    const createdStr = padString(c.created, 16);
    
    let statusLabel = "";
    if (c.status === 'running') {
      statusLabel = "Up Just now";
    } else {
      statusLabel = c.created.startsWith('Exited') ? c.created : 'Exited (0) Just now';
    }
    const statusStr = padString(statusLabel, 15);
    
    let portStr = "";
    if (c.ports) {
      if (c.status === 'running') {
        portStr = c.ports.includes(':') ? `0.0.0.0:${c.ports.split(':')[0]}->${c.ports.split(':')[1]}/tcp` : c.ports;
      } else {
        // stopped container ports aren't active
        portStr = "";
      }
    }
    const portStrPadded = padString(portStr, 24);
    const nameStr = c.name;

    output += `${idStr}${imgStr}${cmdStr}${createdStr}${statusStr}${portStrPadded}${nameStr}\n`;
  });

  writeLog(output, 'system-output');
}

function padString(str, len) {
  if (str.length >= len) {
    return str.substring(0, len - 3) + '... ';
  }
  return str + ' '.repeat(len - str.length);
}

// --------------------------------------------------------------------------
// docker images Handler
// --------------------------------------------------------------------------
function handleDockerImages(tokens) {
  if (state.pulledImages.length === 0) {
    writeLog(`REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE`, 'system-output');
    return;
  }

  let output = `<span class="highlight" style="font-weight: 600;">REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE</span>\n`;
  
  state.pulledImages.forEach(img => {
    const repStr = padString(img.repository, 20);
    const tagStr = padString(img.tag, 20);
    const idStr = padString(img.id, 20);
    const createdStr = padString(img.created, 20);
    const sizeStr = img.size;
    output += `${repStr}${tagStr}${idStr}${createdStr}${sizeStr}\n`;
  });

  writeLog(output, 'system-output');
}

// --------------------------------------------------------------------------
// docker stop Handler
// --------------------------------------------------------------------------
function handleDockerStop(tokens) {
  const args = tokens.slice(2);
  if (args.length === 0) {
    writeLog("docker stop requires at least 1 container name or ID. Usage: docker stop &lt;container&gt;", "error");
    return;
  }

  const target = args[0];
  const container = state.containers.find(c => c.name === target || c.id === target);

  if (!container) {
    writeLog(`Error response from daemon: No such container: ${target}`, "error");
    return;
  }

  if (container.status === 'stopped') {
    writeLog(target, 'system-output'); // already stopped, docker just outputs name
    return;
  }

  container.status = 'stopped';
  container.created = 'Exited (0) Just now';
  renderContainers();
  writeLog(target, 'system-output');

  // If this stopped container was mapped to current browser port, update view
  if (container.ports && container.ports.includes(':')) {
    const hostPort = parseInt(container.ports.split(':')[0]);
    if (state.browserPort === hostPort) {
      loadBrowserPreview(hostPort); // site can't be reached
    }
  }
}

// --------------------------------------------------------------------------
// docker rm Handler
// --------------------------------------------------------------------------
function handleDockerRm(tokens) {
  const args = tokens.slice(2);
  if (args.length === 0) {
    writeLog("docker rm requires at least 1 container name or ID. Usage: docker rm &lt;container&gt;", "error");
    return;
  }

  const force = args.includes('-f') || args.includes('--force');
  // Extract target (non-flag)
  const target = args.find(a => a !== '-f' && a !== '--force');
  if (!target) {
    writeLog("docker rm: missing container target. Usage: docker rm &lt;container&gt;", "error");
    return;
  }

  const containerIndex = state.containers.findIndex(c => c.name === target || c.id === target);

  if (containerIndex === -1) {
    writeLog(`Error response from daemon: No such container: ${target}`, "error");
    return;
  }

  const container = state.containers[containerIndex];

  if (container.status === 'running' && !force) {
    writeLog(`Error response from daemon: You cannot remove a running container ${container.name} (id: ${container.id}). Stop the container before attempting removal or force remove (-f)`, "error");
    return;
  }

  // Remove container
  state.containers.splice(containerIndex, 1);
  renderContainers();
  writeLog(target, 'system-output');

  // If this container was mapped to current browser port, update view
  if (container.ports && container.ports.includes(':')) {
    const hostPort = parseInt(container.ports.split(':')[0]);
    if (state.browserPort === hostPort) {
      loadBrowserPreview(null);
    }
  }
}

// --------------------------------------------------------------------------
// docker rmi Handler
// --------------------------------------------------------------------------
function handleDockerRmi(tokens) {
  const args = tokens.slice(2);
  if (args.length === 0) {
    writeLog("docker rmi requires at least 1 image name or ID. Usage: docker rmi &lt;image&gt;", "error");
    return;
  }

  const target = args[0];
  let baseImage = target;
  let tag = 'latest';
  if (target.includes(':')) {
    baseImage = target.split(':')[0];
    tag = target.split(':')[1];
  }

  const imageIndex = state.pulledImages.findIndex(img => 
    img.id === target || (img.repository === baseImage && img.tag === tag)
  );

  if (imageIndex === -1) {
    writeLog(`Error response from daemon: No such image: ${target}`, "error");
    return;
  }

  const imageObj = state.pulledImages[imageIndex];

  // Validate if image is in use by running or stopped containers
  const isUsed = state.containers.some(c => c.image === `${imageObj.repository}:${imageObj.tag}`);
  if (isUsed) {
    const usedBy = state.containers.find(c => c.image === `${imageObj.repository}:${imageObj.tag}`);
    writeLog(`Error response from daemon: conflict: unable to delete ${imageObj.id} (must be forced) - image is being used by stopped/running container ${usedBy.id}`, "error");
    return;
  }

  // Remove
  state.pulledImages.splice(imageIndex, 1);
  renderImages();
  writeLog(`Untagged: ${imageObj.repository}:${imageObj.tag}`, 'system-output');
  writeLog(`Deleted: sha256:${imageObj.id}`, 'system-output');
}

// --------------------------------------------------------------------------
// docker logs Handler
// --------------------------------------------------------------------------
function handleDockerLogs(tokens) {
  const args = tokens.slice(2);
  if (args.length === 0) {
    writeLog("docker logs requires 1 container name or ID. Usage: docker logs &lt;container&gt;", "error");
    return;
  }

  const target = args[0];
  const container = state.containers.find(c => c.name === target || c.id === target);

  if (!container) {
    writeLog(`Error: No such container: ${target}`, "error");
    return;
  }

  // Render logs
  if (container.image.startsWith('hello-world')) {
    writeLog(`
Hello from Docker!
This message shows that your installation appears to be working correctly.
`, 'system-output');
  } else if (container.image.startsWith('nginx')) {
    writeLog(`/docker-entrypoint.sh: Configuration complete; ready for start up
2026/06/15 03:40:00 [notice] 1#1: using the "epoll" event method
2026/06/15 03:40:00 [notice] 1#1: nginx/1.25.1
2026/06/15 03:40:00 [notice] 1#1: start worker process 31`, 'system-output');
  } else if (container.image.startsWith('postgres')) {
    writeLog(`PostgreSQL Database directory appears to contain a database; Skipping initialization
2026-06-15 03:40:00.123 UTC [1] LOG:  starting PostgreSQL 15.3 on x86_64-pc-linux-gnu
2026-06-15 03:40:00.124 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2026-06-15 03:40:00.135 UTC [1] LOG:  database system is ready to accept connections`, 'system-output');
  } else if (container.image.startsWith('redis')) {
    writeLog(`1:C 15 Jun 2026 03:40:00.000 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
1:M 15 Jun 2026 03:40:00.005 * Running mode=standalone, port=6379.
1:M 15 Jun 2026 03:40:00.006 * Ready to accept connections`, 'system-output');
  } else if (container.image.startsWith('node-app')) {
    writeLog(`> node-app@1.0.0 start
> node server.js

Server is running on port 3000
Database connected: true
Environment variables loaded successfully.`, 'system-output');
  }
}

// --------------------------------------------------------------------------
// docker inspect Handler
// --------------------------------------------------------------------------
function handleDockerInspect(tokens) {
  const args = tokens.slice(2);
  if (args.length === 0) {
    writeLog("docker inspect requires 1 container name or ID. Usage: docker inspect &lt;container&gt;", "error");
    return;
  }

  const target = args[0];
  const container = state.containers.find(c => c.name === target || c.id === target);

  if (!container) {
    writeLog(`Error: No such container: ${target}`, "error");
    return;
  }

  // Format environmental list in JSON
  const envList = [];
  if (container.env) {
    Object.keys(container.env).forEach(k => {
      envList.push(`${k}=${container.env[k]}`);
    });
  }

  const inspectJson = [
    {
      "Id": container.id + "e8b4fa9c68db2d9e1f5793e5b721acb",
      "Created": "2026-06-15T03:40:00.123Z",
      "Path": container.command.startsWith('docker-entrypoint') ? '/docker-entrypoint.sh' : 'node',
      "Args": [
        container.command
      ],
      "State": {
        "Status": container.status,
        "Running": container.status === 'running',
        "ExitCode": container.status === 'running' ? 0 : 130
      },
      "Config": {
        "Image": container.image,
        "Env": envList.concat([
          "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        ])
      },
      "NetworkSettings": {
        "Ports": {
          "80/tcp": container.ports && container.ports.includes(':') ? [
            {
              "HostIp": "0.0.0.0",
              "HostPort": container.ports.split(':')[0]
            }
          ] : null
        }
      },
      "Mounts": container.volume ? [
        {
          "Type": "volume",
          "Name": container.volume.split(':')[0],
          "Source": "/var/lib/docker/volumes/" + container.volume.split(':')[0] + "/_data",
          "Destination": container.volume.split(':')[1],
          "Driver": "local"
        }
      ] : []
    }
  ];

  writeLog(JSON.stringify(inspectJson, null, 2), 'system-output');
}

// --------------------------------------------------------------------------
// docker build Handler
// --------------------------------------------------------------------------
async function handleDockerBuild(tokens) {
  const args = tokens.slice(2);
  if (args.length === 0 || !args.includes('.')) {
    writeLog("docker build requires a path (e.g. '.'). Usage: docker build -t &lt;tag&gt; .", "error");
    return;
  }

  if (state.currentLevel < 5) {
    writeLog("docker: Error response from daemon: Dockerfile workspace is locked. Complete previous levels to unlock custom builds.", "error");
    return;
  }

  // Get tag value
  const tIdx = args.indexOf('-t');
  if (tIdx === -1 || tIdx === args.length - 1) {
    writeLog("docker build requires a tag flag (e.g. -t node-app). Usage: docker build -t &lt;tag&gt; .", "error");
    return;
  }

  const tag = args[tIdx + 1];

  // Validate current Dockerfile contents
  const check = validateDockerfileText(dockerfileTextarea.value);
  if (!check.valid) {
    writeLog("docker build: Dockerfile compile check failed! Open Dockerfile tab to fix build errors.", "error");
    return;
  }

  await simulateBuild(tag);
}

// --------------------------------------------------------------------------
// docker volume Handler
// --------------------------------------------------------------------------
function handleDockerVolume(tokens) {
  const args = tokens.slice(2);
  if (args.length === 0) {
    writeLog(`
Usage:  docker volume COMMAND
Manage volumes

Commands:
  create      Create a volume
  inspect     Display detailed information on one or more volumes
  ls          List volumes
  rm          Remove one or more volumes
`, 'system-output');
    return;
  }

  const cmd = args[0].toLowerCase();
  
  if (cmd === 'ls') {
    if (state.volumes.length === 0) {
      writeLog(`DRIVER    VOLUME NAME`, 'system-output');
      return;
    }
    let output = `<span class="highlight" style="font-weight: 600;">DRIVER    VOLUME NAME</span>\n`;
    state.volumes.forEach(vol => {
      output += `local     ${vol}\n`;
    });
    writeLog(output, 'system-output');
  } 
  
  else if (cmd === 'create') {
    if (args.length === 1) {
      writeLog("docker volume create requires a name. Usage: docker volume create &lt;name&gt;", "error");
      return;
    }
    const name = args[1];
    if (state.volumes.includes(name)) {
      writeLog(name, 'system-output');
      return;
    }
    state.volumes.push(name);
    renderVolumes();
    writeLog(name, 'system-output');
  } 
  
  else if (cmd === 'rm') {
    if (args.length === 1) {
      writeLog("docker volume rm requires a name. Usage: docker volume rm &lt;name&gt;", "error");
      return;
    }
    const name = args[1];
    const idx = state.volumes.indexOf(name);
    if (idx === -1) {
      writeLog(`Error response from daemon: get ${name}: no such volume`, "error");
      return;
    }
    
    // Check if in use by running container
    const isInUse = state.containers.some(c => c.volume && c.volume.split(':')[0] === name);
    if (isInUse) {
      writeLog(`Error response from daemon: volume is in use by container`, "error");
      return;
    }
    
    state.volumes.splice(idx, 1);
    renderVolumes();
    writeLog(name, 'system-output');
  } 
  
  else {
    writeLog(`docker volume: '${cmd}' command unrecognized.`, 'error');
  }
}

// --------------------------------------------------------------------------
// Level progression mechanism
// --------------------------------------------------------------------------
function advanceLevel() {
  const currentLvlData = lessons[state.currentLevel - 1];
  const allDone = currentLvlData.objectives.every(obj => obj.done);
  
  if (!allDone) {
    writeLog("Level checkpoint incomplete. Complete all active objectives before typing 'next'!", "error");
    return;
  }

  if (state.currentLevel === lessons.length) {
    writeLog("You have completed the entire course catalog! Congratulations! 🐳🎓", "success");
    return;
  }

  loadLevel(state.currentLevel + 1);
  writeLog(`\n--- Selected ${lessons[state.currentLevel - 1].title} ---`, 'info');
  writeLog(`Read guidelines on sidebar, type help for directives.`, 'system-output');
}

// ==========================================================================
// 7. GRADING VALIDATIONS & MAPPING ACTIONS
// ==========================================================================
function markObjectiveDone(objId) {
  const currentLvlData = lessons[state.currentLevel - 1];
  const obj = currentLvlData.objectives.find(o => o.id === objId);
  if (obj && !obj.done) {
    obj.done = true;
    updateProgressUI();
  }
}

function setObjectiveState(objId, isDone) {
  const currentLvlData = lessons[state.currentLevel - 1];
  const obj = currentLvlData.objectives.find(o => o.id === objId);
  if (obj) {
    obj.done = isDone;
  }
}

function checkLevelObjectives() {
  const currentLvlData = lessons[state.currentLevel - 1];
  
  if (state.currentLevel === 1) {
    const ranHelloWorld = state.containers.some(c => c.image.startsWith('hello-world'));
    setObjectiveState("run_hello_world", ranHelloWorld);
  } 
  
  else if (state.currentLevel === 2) {
    const nginxContainers = state.containers.filter(c => c.image.startsWith('nginx'));
    const isDetached = nginxContainers.some(c => c.isDetached);
    const correctPort = nginxContainers.some(c => c.ports === "8080:80" || c.ports === "8080:80->80/tcp");
    const correctName = nginxContainers.some(c => c.name === "web-server");
    
    setObjectiveState("run_nginx_detached", nginxContainers.length > 0 && isDetached);
    setObjectiveState("port_mapping_8080", correctPort);
    setObjectiveState("name_web_server", correctName);
  } 
  
  else if (state.currentLevel === 3) {
    const pgContainers = state.containers.filter(c => c.image.startsWith('postgres'));
    const isDetached = pgContainers.some(c => c.isDetached);
    const correctName = pgContainers.some(c => c.name === "db");
    const correctEnv = pgContainers.some(c => c.env && c.env.POSTGRES_PASSWORD === "secret");
    
    setObjectiveState("run_postgres_detached", pgContainers.length > 0 && isDetached);
    setObjectiveState("name_db", correctName);
    setObjectiveState("env_password", correctEnv);
  } 
  
  else if (state.currentLevel === 4) {
    const redisContainers = state.containers.filter(c => c.image.startsWith('redis'));
    const correctNameAndDetached = redisContainers.some(c => c.name === "storage" && c.isDetached);
    const correctVolume = redisContainers.some(c => c.volume === "data_store:/data");
    
    setObjectiveState("run_redis_detached", correctNameAndDetached);
    setObjectiveState("volume_mount", correctVolume);
  } 
  
  else if (state.currentLevel === 5) {
    const dockerfileCheck = validateDockerfileText(dockerfileTextarea.value);
    setObjectiveState("write_dockerfile", dockerfileCheck.valid);
    
    const imageBuilt = state.pulledImages.some(img => img.repository === 'node-app');
    setObjectiveState("build_image", imageBuilt);
    
    const nodeContainers = state.containers.filter(c => c.image.startsWith('node-app'));
    const isRunningCorrect = nodeContainers.some(c => (c.ports === "3000:3000" || c.ports === "3000:3000->3000/tcp") && c.isDetached && c.status === 'running');
    
    setObjectiveState("run_node_app", isRunningCorrect);
  }

  updateProgressUI();
}

function triggerSuccessFlash() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  header.style.transition = 'box-shadow 0.3s ease-in-out';
  header.style.boxShadow = '0 0 20px var(--status-success)';
  setTimeout(() => {
    header.style.boxShadow = 'var(--shadow-sm)';
  }, 1200);
}

// --------------------------------------------------------------------------
// Browser Port Forward Web page rendering mappings
// --------------------------------------------------------------------------
function loadBrowserPreview(port) {
  if (!port) {
    browserAddress.value = "http://localhost:8080";
    browserViewportScreen.innerHTML = `
      <div class="browser-empty-state">
        <i class="fa-solid fa-globe"></i>
        <p>No active port forwarding detected. Try running a web container with port mappings (e.g. <code>docker run -d -p 8080:80 nginx</code>) to access localhost.</p>
      </div>
    `;
    state.browserPort = null;
    return;
  }
  
  browserAddress.value = `http://localhost:${port}`;
  state.browserPort = port;
  
  // Find running container mapped to this hostPort
  const container = state.containers.find(c => 
    c.status === 'running' && 
    c.ports && 
    (c.ports.split(':')[0] === port.toString() || c.ports.startsWith(`${port}:`))
  );
  
  if (!container) {
    browserViewportScreen.innerHTML = `
      <div class="browser-empty-state">
        <i class="fa-solid fa-triangle-exclamation" style="color: var(--status-danger);"></i>
        <p><strong>This site can't be reached</strong></p>
        <p style="font-size: 0.68rem; color: var(--text-muted);">localhost refused to connect. Port ${port} is not forwarded by any active running container.</p>
      </div>
    `;
    return;
  }
  
  if (port === 8080) {
    browserViewportScreen.innerHTML = `
      <div class="nginx-page">
        <h1>Welcome to nginx!</h1>
        <p>If you see this page, the nginx web server is successfully installed and running. Further configuration is required.</p>
        <p style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);"><em>Thank you for using nginx.</em></p>
      </div>
    `;
  } else if (port === 3000) {
    browserViewportScreen.innerHTML = `
      <div class="node-page">
        <div class="node-header">
          <h2>Node.js API Service running inside container</h2>
        </div>
        <div class="node-content-box">
          <p><strong>Response Code:</strong> 200 OK</p>
          <p><strong>Message:</strong> Hello from custom Node app container!</p>
          <p><strong>App Version:</strong> 1.0.0</p>
          <p><strong>Environment:</strong> production</p>
        </div>
        <span class="node-status-badge">API Online</span>
      </div>
    `;
  } else {
    browserViewportScreen.innerHTML = `
      <div class="browser-empty-state">
        <i class="fa-solid fa-circle-info" style="color: var(--accent);"></i>
        <p><strong>Generic Service Port Detected</strong></p>
        <p style="font-size: 0.68rem; color: var(--text-muted);">Running container "${container.name}" exposes port ${port}.</p>
      </div>
    `;
  }
}

// Global hook for port mappings clicks
window.openPort = function(port) {
  loadBrowserPreview(port);
};

// ==========================================================================
// 8. STORAGE PERSISTENCE SYNC
// ==========================================================================
function saveStateToLocalStorage() {
  const dataToSave = {
    currentLevel: state.currentLevel,
    pulledImages: state.pulledImages,
    containers: state.containers,
    volumes: state.volumes,
    commandHistory: state.commandHistory,
    dockerfileContent: dockerfileTextarea.value,
    browserPort: state.browserPort
  };
  localStorage.setItem("dockerSimSaveState", JSON.stringify(dataToSave));
}

function loadStateFromLocalStorage() {
  const saved = localStorage.getItem("dockerSimSaveState");
  if (!saved) return;
  
  try {
    const data = JSON.parse(saved);
    state.currentLevel = data.currentLevel || 1;
    state.pulledImages = data.pulledImages || [];
    state.containers = data.containers || [];
    state.volumes = data.volumes || [];
    state.commandHistory = data.commandHistory || [];
    state.browserPort = data.browserPort || null;
    
    if (data.dockerfileContent && dockerfileTextarea) {
      dockerfileTextarea.value = data.dockerfileContent;
    }
  } catch (e) {
    console.error("Could not parse saved DockerSim state", e);
  }
}
