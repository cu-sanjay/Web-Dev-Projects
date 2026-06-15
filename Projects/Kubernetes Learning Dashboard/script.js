/**
 * Kubernetes Learning Dashboard & Simulator Logic
 */

// --- INITIAL STATE & DATA ---
const STORAGE_PREFIX = "kube_visualizer_";

const LESSONS_DATA = [
  {
    id: "arch",
    title: "1. Cluster Architecture",
    tagline: "Understand the master Control Plane and Worker Nodes.",
    content: `
      <p>Kubernetes (K8s) is structured into two main parts: the <strong>Control Plane</strong> (Master Node) and the <strong>Worker Nodes</strong>.</p>
      <h4>Control Plane Components:</h4>
      <ul>
        <li><strong>kube-apiserver</strong>: The gateway exposing the API. Every command runs through here.</li>
        <li><strong>etcd</strong>: Key-value store holding the cluster's configuration state.</li>
        <li><strong>kube-scheduler</strong>: Watches for new Pods and assigns them a node to run on.</li>
        <li><strong>kube-controller-manager</strong>: Runs control loops to regulate cluster state (e.g. deployments scaling).</li>
      </ul>
      <h4>Lab Challenge:</h4>
      <p>Click on all <strong>4 Control Plane</strong> components inside the "Control Plane" box to explore their logs and inspect them.</p>
    `,
    challenge: {
      name: "Inspect Control Plane",
      criteriaDesc: "Inspect all 4 Control Plane components.",
      reqs: ["api-server", "scheduler", "controller-manager", "etcd"],
      verify: (state, clickedComponents) => {
        return clickedComponents.has("api-server") &&
               clickedComponents.has("scheduler") &&
               clickedComponents.has("controller-manager") &&
               clickedComponents.has("etcd");
      }
    }
  },
  {
    id: "pod",
    title: "2. Pods - Smallest Units",
    tagline: "Create and inspect your first container deployment.",
    content: `
      <p>A <strong>Pod</strong> is the smallest, most basic deployable object in Kubernetes. It represents a single running process and hosts one or more containers sharing network and storage.</p>
      <h4>Lab Challenge:</h4>
      <p>Select the <strong>Pod template</strong> in the YAML playground, read through its spec, then click <strong>Apply YAML</strong>. Alternatively, enter the CLI command:</p>
      <p><code>kubectl apply -f pod.yaml</code></p>
      <p>Ensure the Pod transitions to the <strong>RUNNING</strong> status state.</p>
    `,
    challenge: {
      name: "Launch a Pod",
      criteriaDesc: "Deploy a Pod in the default namespace.",
      reqs: ["pod-created"],
      verify: (state) => {
        return state.pods.some(p => p.namespace === "default" && p.status === "Running");
      }
    }
  },
  {
    id: "deployment",
    title: "3. ReplicaSets & Deployments",
    tagline: "Define desired states and scale pods automatically.",
    content: `
      <p>A <strong>Deployment</strong> describes a desired state (e.g., "I want 3 replicas of my web app running"). K8s automatically manages launching, updating, and scaling Pods to match this configuration.</p>
      <h4>Lab Challenge:</h4>
      <p>Scale the <code>web-deployment</code> to exactly <strong>3 replicas</strong>. You can do this by:</p>
      <ul>
        <li>Selecting the <strong>Deployment template</strong>, setting <code>replicas: 3</code>, and clicking <strong>Apply YAML</strong>.</li>
        <li>Or running the CLI command: <code>kubectl scale deployment web-deployment --replicas=3</code></li>
      </ul>
    `,
    challenge: {
      name: "Scale Deployment",
      criteriaDesc: "Scale web-deployment to at least 3 replicas.",
      reqs: ["deployment-active", "replicas-3"],
      verify: (state) => {
        const deploy = state.deployments.find(d => d.name === "web-deployment" && d.namespace === "default");
        if (!deploy) return false;
        const matchingPods = state.pods.filter(p => p.deploymentName === "web-deployment" && p.status === "Running");
        return deploy.replicas >= 3 && matchingPods.length >= 3;
      }
    }
  },
  {
    id: "service",
    title: "4. Services & Networking",
    tagline: "Expose pods using stable endpoints.",
    content: `
      <p>Pods are ephemeral—they die and recreate with different IP addresses. A <strong>Service</strong> is an abstraction that defines a logical set of Pods and a policy to route traffic to them using <code>selectors</code>.</p>
      <h4>Lab Challenge:</h4>
      <p>Expose your pods! Choose the <strong>Service template</strong> in the YAML editor, configure it, and click <strong>Apply YAML</strong> to create <code>web-service</code> targeting your pods via selectors.</p>
    `,
    challenge: {
      name: "Create Service",
      criteriaDesc: "Apply a service in the default namespace.",
      reqs: ["service-created"],
      verify: (state) => {
        return state.services.some(s => s.name === "web-service" && s.namespace === "default");
      }
    }
  },
  {
    id: "health",
    title: "5. Liveness & Readiness Probes",
    tagline: "Configure self-healing containers.",
    content: `
      <p>Kubernetes uses <strong>Liveness Probes</strong> to know when to restart a container, and <strong>Readiness Probes</strong> to know when a container is ready to start accepting network traffic.</p>
      <h4>Lab Challenge:</h4>
      <p>Load the <strong>Pod template</strong> in the YAML playground. Add a <code>livenessProbe</code> block under the container definition:</p>
      <pre style="background:rgba(0,0,0,0.25); padding:6px; margin:6px 0; border-radius:4px; font-size:0.75rem; color:#38bdf8;">livenessProbe:
  httpGet:
    path: /healthz
    port: 80
  initialDelaySeconds: 3
  periodSeconds: 5</pre>
      <p>Click <strong>Apply YAML</strong> to deploy the health-monitored Pod.</p>
    `,
    challenge: {
      name: "Configure Health Probes",
      criteriaDesc: "Launch a pod with a livenessProbe configured.",
      reqs: ["liveness-probe-configured"],
      verify: (state) => {
        const podsWithProbes = state.pods.filter(p => p.spec && p.spec.livenessProbe);
        return podsWithProbes.length > 0;
      }
    }
  }
];

const YAML_TEMPLATES = {
  pod: `apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  namespace: default
  labels:
    app: web
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80`,

  deployment: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
  namespace: default
  labels:
    app: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80`,

  service: `apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80`,

  configmap: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  DB_HOST: "prod-db.cluster.local"
  DB_PORT: "5432"
  DEBUG: "false"`
};

// --- DEFAULT STATE CONSTRUCTORS ---
function createDefaultClusterState() {
  return {
    namespace: "default",
    pods: [],
    deployments: [],
    services: [],
    configMaps: []
  };
}

function createDefaultProgress() {
  return {
    completedLessons: [],
    unlockedBadges: [],
    clickedComponents: []
  };
}

// --- STATE MANAGEMENT ---
let clusterState = createDefaultClusterState();
let progress = createDefaultProgress();
let clickedComponents = new Set(); // Session tracker for Lesson 1

let activeLessonIndex = 0;
let selectedElement = null; // Track currently inspected resource { type: 'pod'|'node'|'component'|'service', id: string }

// --- DOM ELEMENTS ---
const elements = {
  nsSelector: document.getElementById("ns-selector"),
  summaryNodes: document.getElementById("summary-nodes"),
  summaryPods: document.getElementById("summary-pods"),
  accordionLessons: document.querySelector(".accordion-lessons"),
  activeChallengeContainer: document.getElementById("active-challenge-container"),
  challengeName: document.getElementById("challenge-name"),
  challengeDesc: document.getElementById("challenge-desc"),
  challengeReqsList: document.getElementById("challenge-reqs-list"),
  btnVerifyChallenge: document.getElementById("btn-verify-challenge"),
  tabLessonsBtn: document.getElementById("tab-lessons-btn"),
  tabProgressBtn: document.getElementById("tab-progress-btn"),
  tabPaneLessons: document.getElementById("tab-pane-lessons"),
  tabPaneProgress: document.getElementById("tab-pane-progress"),
  statsTotalProgress: document.getElementById("stats-total-progress"),
  statsLabsCompleted: document.getElementById("stats-labs-completed"),
  badgeCollection: document.getElementById("badge-collection"),
  
  // Visual zones
  podsGridNode1: document.getElementById("pods-grid-node-1"),
  podsGridNode2: document.getElementById("pods-grid-node-2"),
  workerNode1: document.getElementById("worker-node-1"),
  workerNode2: document.getElementById("worker-node-2"),
  servicesLayer: document.getElementById("services-layer"),
  servicesListVisual: document.getElementById("services-list-visual"),
  
  // Inspector
  resourceInspector: document.getElementById("resource-inspector"),
  inspectorEmptyState: document.getElementById("inspector-empty-state"),
  inspectorContent: document.getElementById("inspector-content"),
  inspectorBadge: document.getElementById("inspector-badge"),
  btnCloseInspector: document.getElementById("btn-close-inspector"),
  inspectName: document.getElementById("inspect-name"),
  inspectKind: document.getElementById("inspect-kind"),
  inspectStatus: document.getElementById("inspect-status"),
  inspectIp: document.getElementById("inspect-ip"),
  inspectLabels: document.getElementById("inspect-labels"),
  inspectExtraContainer: document.getElementById("inspect-extra-container"),
  inspectExtraLabel: document.getElementById("inspect-extra-label"),
  inspectExtraVal: document.getElementById("inspect-extra-val"),
  inspectEvents: document.getElementById("inspect-events"),

  // YAML editor
  yamlTemplateSelector: document.getElementById("yaml-template-selector"),
  yamlTextarea: document.getElementById("yaml-textarea"),
  editorLineNumbers: document.getElementById("editor-line-numbers"),
  yamlFeedbackLabel: document.getElementById("yaml-feedback-label"),
  btnResetYaml: document.getElementById("btn-reset-yaml"),
  btnApplyYaml: document.getElementById("btn-apply-yaml"),

  // CLI
  cliScreen: document.getElementById("cli-screen"),
  cliOutput: document.getElementById("cli-output"),
  cliInput: document.getElementById("cli-input"),
  suggestionsList: document.querySelector(".suggestions-list"),

  // Core Actions
  btnDemoTraffic: document.getElementById("btn-demo-traffic"),
  btnResetCluster: document.getElementById("btn-reset-cluster"),
  btnResetAppStorage: document.getElementById("btn-reset-app-storage")
};

// --- CORE SYSTEM INITIALIZATION ---
function init() {
  loadFromLocalStorage();
  setupEventListeners();
  renderLessons();
  updateLessonUI();
  updateBadgeUI();
  syncYAMLTemplate();
  updateEditorLineNumbers();
  refreshClusterUI();
  
  // Background reconciler loop (like Kubernetes controller controller-manager)
  setInterval(reconcileClusterState, 1500);

  // Add sample nodes initially, ready
  writeToConsole("Kube-API-Server online. Kubernetes CLI Connection verified.", "text-success");
  writeToConsole("System components (scheduler, etcd, controller-manager) active.", "text-muted");
  writeToConsole("Type 'help' to see list of valid CLI commands.");
}

// --- LOCAL STORAGE HANDLING ---
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_PREFIX + "state", JSON.stringify(clusterState));
  localStorage.setItem(STORAGE_PREFIX + "progress", JSON.stringify(progress));
}

function loadFromLocalStorage() {
  try {
    const savedState = localStorage.getItem(STORAGE_PREFIX + "state");
    const savedProgress = localStorage.getItem(STORAGE_PREFIX + "progress");
    
    if (savedState) clusterState = JSON.parse(savedState);
    if (savedProgress) {
      progress = JSON.parse(savedProgress);
      clickedComponents = new Set(progress.clickedComponents || []);
    }
  } catch (e) {
    console.error("Failed to load local storage configurations:", e);
  }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Namespace Filter
  elements.nsSelector.addEventListener("change", (e) => {
    clusterState.namespace = e.target.value;
    saveToLocalStorage();
    refreshClusterUI();
    writeToConsole(`Switched to namespace '${clusterState.namespace}'`);
  });

  // Tab selections (Lessons / Badges)
  elements.tabLessonsBtn.addEventListener("click", () => switchPanelTab("lessons"));
  elements.tabProgressBtn.addEventListener("click", () => switchPanelTab("progress"));

  // Verify challenge
  elements.btnVerifyChallenge.addEventListener("click", verifyActiveChallenge);

  // Close Inspector
  elements.btnCloseInspector.addEventListener("click", clearInspection);

  // YAML editor actions
  elements.yamlTemplateSelector.addEventListener("change", syncYAMLTemplate);
  elements.yamlTextarea.addEventListener("input", updateEditorLineNumbers);
  elements.yamlTextarea.addEventListener("keydown", handleYAMLTabKey);
  elements.btnResetYaml.addEventListener("click", () => {
    syncYAMLTemplate();
    writeToConsole("Reset YAML manifest template.", "text-muted");
  });
  elements.btnApplyYaml.addEventListener("click", applyYAMLManifest);

  // CLI interactions
  elements.cliInput.addEventListener("keydown", handleCLIInput);
  elements.suggestionsList.addEventListener("click", handleSuggestionClick);

  // Global commands
  elements.btnDemoTraffic.addEventListener("click", simulateTrafficFlow);
  elements.btnResetCluster.addEventListener("click", resetClusterData);
  elements.btnResetAppStorage.addEventListener("click", resetAllAppProgress);

  // Setup click listeners for control plane components
  document.querySelectorAll(".control-component").forEach(comp => {
    comp.addEventListener("click", () => {
      const componentKey = comp.getAttribute("data-comp");
      inspectControlComponent(componentKey);
      
      // Track click for Lesson 1 challenge
      if (activeLessonIndex === 0 && !clickedComponents.has(componentKey)) {
        clickedComponents.add(componentKey);
        progress.clickedComponents = Array.from(clickedComponents);
        saveToLocalStorage();
        updateLessonUI();
      }
    });
  });

  // Node clicks
  elements.workerNode1.addEventListener("click", (e) => {
    // Avoid double trigger if clicking child pod
    if (e.target.closest(".pod-element")) return;
    inspectNode("worker-node-1");
  });
  elements.workerNode2.addEventListener("click", (e) => {
    if (e.target.closest(".pod-element")) return;
    inspectNode("worker-node-2");
  });
}

// --- LESSON & CHALLENGE SYSTEM ---
function switchPanelTab(tab) {
  if (tab === "lessons") {
    elements.tabLessonsBtn.classList.add("active");
    elements.tabProgressBtn.classList.remove("active");
    elements.tabPaneLessons.classList.add("active");
    elements.tabPaneProgress.classList.remove("active");
  } else {
    elements.tabProgressBtn.classList.add("active");
    elements.tabLessonsBtn.classList.remove("active");
    elements.tabPaneProgress.classList.add("active");
    elements.tabPaneLessons.classList.remove("active");
  }
}

function renderLessons() {
  elements.accordionLessons.innerHTML = "";
  LESSONS_DATA.forEach((lesson, index) => {
    const isCompleted = progress.completedLessons.includes(lesson.id);
    const isLocked = index > 0 && !progress.completedLessons.includes(LESSONS_DATA[index - 1].id);
    
    let statusIcon = '<i class="fa-solid fa-lock status-icon locked"></i>';
    if (isCompleted) {
      statusIcon = '<i class="fa-solid fa-circle-check status-icon completed"></i>';
    } else if (!isLocked) {
      statusIcon = '<i class="fa-regular fa-circle status-icon unlocked"></i>';
    }

    const lessonHTML = `
      <div class="lesson-item ${index === activeLessonIndex ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-index="${index}" id="lesson-${lesson.id}">
        <div class="lesson-header">
          <div class="lesson-header-left">
            ${statusIcon}
            <span>${lesson.title}</span>
          </div>
          <i class="fa-solid fa-chevron-down chevron"></i>
        </div>
        <div class="lesson-content">
          <p class="text-highlight">${lesson.tagline}</p>
          ${lesson.content}
        </div>
      </div>
    `;
    elements.accordionLessons.insertAdjacentHTML("beforeend", lessonHTML);
  });

  // Add listeners to new headers
  document.querySelectorAll(".lesson-item:not(.locked) .lesson-header").forEach(hdr => {
    hdr.addEventListener("click", () => {
      const item = hdr.closest(".lesson-item");
      const index = parseInt(item.getAttribute("data-index"));
      
      // Close currently active
      document.querySelectorAll(".lesson-item").forEach(x => x.classList.remove("active"));
      
      // Set active
      activeLessonIndex = index;
      item.classList.add("active");
      updateLessonUI();
    });
  });
}

function updateLessonUI() {
  const activeLesson = LESSONS_DATA[activeLessonIndex];
  if (!activeLesson) return;

  elements.activeChallengeContainer.classList.remove("hidden");
  elements.challengeName.textContent = activeLesson.challenge.name;
  
  // Set requirements list HTML
  elements.challengeReqsList.innerHTML = "";
  const reqs = activeLesson.challenge.reqs;

  if (activeLesson.id === "arch") {
    // Show checklist of nodes clicked
    const compNames = {
      "api-server": "API Server (kube-apiserver)",
      "scheduler": "Scheduler (kube-scheduler)",
      "controller-manager": "Controller Manager",
      "etcd": "etcd Config Store"
    };
    reqs.forEach(req => {
      const checked = clickedComponents.has(req);
      elements.challengeReqsList.insertAdjacentHTML("beforeend", `
        <li class="${checked ? 'checked' : ''}">
          <i class="fa-solid ${checked ? 'fa-square-check' : 'fa-square'}"></i>
          <span>Inspect: ${compNames[req]}</span>
        </li>
      `);
    });
  } else {
    // Standard static requirements list
    elements.challengeReqsList.insertAdjacentHTML("beforeend", `
      <li>
        <i class="fa-regular fa-circle-play"></i>
        <span>${activeLesson.challenge.criteriaDesc}</span>
      </li>
    `);
  }
}

function verifyActiveChallenge() {
  const activeLesson = LESSONS_DATA[activeLessonIndex];
  if (!activeLesson) return;

  const passed = activeLesson.challenge.verify(clusterState, clickedComponents);
  if (passed) {
    if (!progress.completedLessons.includes(activeLesson.id)) {
      progress.completedLessons.push(activeLesson.id);
    }
    
    // Unlock associated badge
    let badgeId = "";
    if (activeLesson.id === "arch") badgeId = "badge-kubelet";
    else if (activeLesson.id === "pod") badgeId = "badge-pod-master";
    else if (activeLesson.id === "deployment") badgeId = "badge-scaler";
    else if (activeLesson.id === "service") badgeId = "badge-networking";
    else if (activeLesson.id === "health") badgeId = "badge-prober";

    if (badgeId && !progress.unlockedBadges.includes(badgeId)) {
      progress.unlockedBadges.push(badgeId);
      triggerCelebrationEffect(badgeId);
    }

    saveToLocalStorage();
    renderLessons();
    updateBadgeUI();
    
    writeToConsole(`🏆 Challenge Cleared: '${activeLesson.challenge.name}'! Well done!`, "text-success");

    // Advance to next lesson if available
    if (activeLessonIndex < LESSONS_DATA.length - 1) {
      setTimeout(() => {
        activeLessonIndex++;
        renderLessons();
        updateLessonUI();
      }, 1500);
    }
  } else {
    writeToConsole(`❌ Challenge verification failed. Review requirements and try again.`, "text-error");
  }
}

function updateBadgeUI() {
  const pct = Math.round((progress.completedLessons.length / LESSONS_DATA.length) * 100);
  elements.statsTotalProgress.textContent = `${pct}%`;
  elements.statsLabsCompleted.textContent = `${progress.completedLessons.length}/${LESSONS_DATA.length}`;

  elements.badgeCollection.querySelectorAll(".badge-item").forEach(badgeEl => {
    const id = badgeEl.id;
    if (progress.unlockedBadges.includes(id)) {
      badgeEl.classList.remove("locked");
      badgeEl.classList.add("unlocked");
    } else {
      badgeEl.classList.add("locked");
      badgeEl.classList.remove("unlocked");
    }
  });
}

function triggerCelebrationEffect(badgeId) {
  const badgeEl = document.getElementById(badgeId);
  if (badgeEl) {
    badgeEl.classList.add("unlocked");
    badgeEl.style.transform = "scale(1.1)";
    setTimeout(() => {
      badgeEl.style.transform = "none";
    }, 400);
  }
}

// --- YAML MANIFEST PLAYGROUND ---
function syncYAMLTemplate() {
  const val = elements.yamlTemplateSelector.value;
  elements.yamlTextarea.value = YAML_TEMPLATES[val] || "";
  updateEditorLineNumbers();
  validateYAMLText();
}

function updateEditorLineNumbers() {
  const text = elements.yamlTextarea.value;
  const lines = text.split("\n").length;
  elements.editorLineNumbers.innerHTML = "";
  for (let i = 1; i <= Math.max(lines, 1); i++) {
    elements.editorLineNumbers.insertAdjacentHTML("beforeend", `<div>${i}</div>`);
  }
  validateYAMLText();
}

function handleYAMLTabKey(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 2;
    updateEditorLineNumbers();
  }
}

// Custom parser to safely pull key metrics from yaml block client-side
function parseYAML(yamlString) {
  const lines = yamlString.split("\n");
  const result = {
    apiVersion: "",
    kind: "",
    metadata: {},
    spec: {},
    data: {}
  };

  let currentSection = ""; // 'metadata', 'spec', 'data', or root
  let specSection = ""; // Nested spec tags, e.g., 'selector', 'template'
  let indentLevel = 0;

  for (let line of lines) {
    const trimLine = line.trim();
    if (!trimLine || trimLine.startsWith("#")) continue;

    // Check indentation level to switch sections
    const indent = line.length - line.trimStart().length;

    // Section key value extract
    const colonIndex = trimLine.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimLine.substring(0, colonIndex).trim();
    const val = trimLine.substring(colonIndex + 1).trim();

    if (indent === 0) {
      currentSection = "root";
      specSection = "";
      if (key === "apiVersion") result.apiVersion = val;
      if (key === "kind") result.kind = val;
      if (key === "metadata") currentSection = "metadata";
      if (key === "spec") currentSection = "spec";
      if (key === "data") currentSection = "data";
    } else {
      if (currentSection === "metadata") {
        result.metadata[key] = val.replace(/['"]/g, "");
      } else if (currentSection === "data") {
        result.data[key] = val.replace(/['"]/g, "");
      } else if (currentSection === "spec") {
        if (!val) {
          specSection = key;
        } else {
          // Store key in spec
          if (specSection) {
            if (!result.spec[specSection]) result.spec[specSection] = {};
            result.spec[specSection][key] = val;
          } else {
            result.spec[key] = val;
          }
        }
      }
    }
  }

  // Parse replicas as integer if exists
  if (result.spec && result.spec.replicas) {
    result.spec.replicas = parseInt(result.spec.replicas) || 1;
  }

  return result;
}

function validateYAMLText() {
  const text = elements.yamlTextarea.value.trim();
  if (!text) {
    setYAMLError("Editor is empty");
    return false;
  }

  const parsed = parseYAML(text);
  if (!parsed.kind) {
    setYAMLError("Missing resource 'kind' descriptor");
    return false;
  }
  if (!parsed.metadata || !parsed.metadata.name) {
    setYAMLError("Missing metadata 'name' parameter");
    return false;
  }

  // Basic check for API match
  const validKinds = ["Pod", "Deployment", "Service", "ConfigMap"];
  if (!validKinds.includes(parsed.kind)) {
    setYAMLError(`Unsupported resource kind: '${parsed.kind}'`);
    return false;
  }

  elements.yamlFeedbackLabel.innerHTML = `<i class="fa-solid fa-circle-check"></i> Manifest Valid (Kind: ${parsed.kind})`;
  elements.yamlFeedbackLabel.className = "yaml-feedback text-success";
  return true;
}

function setYAMLError(msg) {
  elements.yamlFeedbackLabel.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
  elements.yamlFeedbackLabel.className = "yaml-feedback text-error";
}

function applyYAMLManifest() {
  if (!validateYAMLText()) {
    writeToConsole("Failed to apply: YAML configuration errors present.", "text-error");
    return;
  }

  const text = elements.yamlTextarea.value;
  const parsed = parseYAML(text);
  const ns = parsed.metadata.namespace || clusterState.namespace || "default";

  writeToConsole(`Applying manifest configuration for ${parsed.kind} '${parsed.metadata.name}'...`, "text-muted");

  if (parsed.kind === "Pod") {
    // Check if livenessProbe is configured
    const hasLiveness = text.includes("livenessProbe:");
    deployPod({
      name: parsed.metadata.name,
      namespace: ns,
      labels: parsed.metadata.labels || { app: "web" },
      livenessProbe: hasLiveness,
      spec: { livenessProbe: hasLiveness }
    });
  } else if (parsed.kind === "Deployment") {
    deployDeployment({
      name: parsed.metadata.name,
      namespace: ns,
      replicas: parsed.spec.replicas || 1,
      labels: parsed.metadata.labels || { app: "web" }
    });
  } else if (parsed.kind === "Service") {
    deployService({
      name: parsed.metadata.name,
      namespace: ns,
      selector: parsed.spec.selector || { app: "web" },
      port: parsed.spec.port || 80,
      targetPort: parsed.spec.targetPort || 80
    });
  } else if (parsed.kind === "ConfigMap") {
    deployConfigMap({
      name: parsed.metadata.name,
      namespace: ns,
      data: parsed.data || {}
    });
  }

  saveToLocalStorage();
  refreshClusterUI();
  updateLessonUI();
}

// --- CLUSTER MUTATORS (LAUNCH / DELETE) ---
function deployPod(podData, triggerReconcile = false) {
  // Check if pod exists
  let pod = clusterState.pods.find(p => p.name === podData.name && p.namespace === podData.namespace);
  const now = new Date();

  if (pod) {
    // Update existing pod
    pod.status = "Pending";
    pod.ip = "Pending";
    pod.age = "0s";
    pod.birth = now.getTime();
    pod.spec = podData.spec || {};
    pod.events = [
      { time: "0s", reason: "Scaling", msg: "Pod configuration updated by spec editor" }
    ];
  } else {
    // Create new
    const nodeNames = ["worker-node-1", "worker-node-2"];
    // Alternate scheduling or balance
    const node1Count = clusterState.pods.filter(p => p.node === "worker-node-1").length;
    const node2Count = clusterState.pods.filter(p => p.node === "worker-node-2").length;
    const assignedNode = node1Count <= node2Count ? "worker-node-1" : "worker-node-2";

    pod = {
      name: podData.name,
      namespace: podData.namespace,
      status: "Pending",
      node: assignedNode,
      ip: "Pending",
      birth: now.getTime(),
      age: "0s",
      labels: podData.labels || {},
      deploymentName: podData.deploymentName || null,
      spec: podData.spec || {},
      events: [
        { time: "0s", reason: "Scheduled", msg: `Successfully assigned to ${assignedNode}` },
        { time: "1s", reason: "Pulling", msg: "Pulling image 'nginx:alpine' container profile" }
      ]
    };
    clusterState.pods.push(pod);
  }

  // Simulate pod initialization timeline
  setTimeout(() => {
    if (pod && pod.status === "Pending") {
      pod.status = "Running";
      const randomOctet = Math.floor(Math.random() * 253) + 2;
      const sub = pod.node === "worker-node-1" ? "1. " : "2. ";
      pod.ip = `10.244.${sub}${randomOctet}`;
      pod.events.push({ time: "2s", reason: "Started", msg: "Created container nginx; Started container" });
      saveToLocalStorage();
      refreshClusterUI();
      updateLessonUI();
      writeToConsole(`Pod ${pod.name} is now Running on ${pod.node}. IP Assigned: ${pod.ip}`, "text-success");
    }
  }, 2000);

  saveToLocalStorage();
  refreshClusterUI();
}

function deployDeployment(deployData) {
  let deploy = clusterState.deployments.find(d => d.name === deployData.name && d.namespace === deployData.namespace);
  
  if (deploy) {
    deploy.replicas = deployData.replicas;
    deploy.labels = deployData.labels;
  } else {
    deploy = {
      name: deployData.name,
      namespace: deployData.namespace,
      replicas: deployData.replicas,
      labels: deployData.labels
    };
    clusterState.deployments.push(deploy);
  }

  writeToConsole(`Deployment ${deploy.name} configured with ${deploy.replicas} target replicas.`, "text-accent");
  reconcileDeployment(deploy);
}

function deployService(svcData) {
  let svc = clusterState.services.find(s => s.name === svcData.name && s.namespace === svcData.namespace);
  const randomOctet = Math.floor(Math.random() * 254) + 1;
  const clusterIP = `10.96.128.${randomOctet}`;

  if (svc) {
    svc.selector = svcData.selector;
    svc.port = svcData.port;
    svc.targetPort = svcData.targetPort;
  } else {
    svc = {
      name: svcData.name,
      namespace: svcData.namespace,
      clusterIP: clusterIP,
      selector: svcData.selector,
      port: svcData.port,
      targetPort: svcData.targetPort
    };
    clusterState.services.push(svc);
  }

  writeToConsole(`Service ${svc.name} created. ClusterIP: ${svc.clusterIP}. Ports: ${svc.port}/TCP`, "text-success");
}

function deployConfigMap(cmData) {
  let cm = clusterState.configMaps.find(c => c.name === cmData.name && c.namespace === cmData.namespace);
  if (cm) {
    cm.data = cmData.data;
  } else {
    cm = {
      name: cmData.name,
      namespace: cmData.namespace,
      data: cmData.data
    };
    clusterState.configMaps.push(cm);
  }
  writeToConsole(`ConfigMap ${cm.name} created/updated with ${Object.keys(cm.data).length} data entries.`, "text-accent");
}

// Delete resources simulator
function deleteResource(kind, name, namespace) {
  const ns = namespace || clusterState.namespace || "default";

  if (kind.toLowerCase() === "pod" || kind.toLowerCase() === "po") {
    const podIndex = clusterState.pods.findIndex(p => p.name === name && p.namespace === ns);
    if (podIndex === -1) {
      writeToConsole(`Error: pods "${name}" not found in namespace ${ns}`, "text-error");
      return;
    }

    const pod = clusterState.pods[podIndex];
    pod.status = "Terminating";
    pod.events.push({ time: "0s", reason: "Killing", msg: "Stopping container nginx; Terminating network routes" });
    saveToLocalStorage();
    refreshClusterUI();

    writeToConsole(`pod "${pod.name}" deletion triggered (status: Terminating)...`, "text-warning");

    // Remove from state after termination delay
    setTimeout(() => {
      const idx = clusterState.pods.findIndex(p => p.name === name && p.namespace === ns);
      if (idx !== -1) {
        clusterState.pods.splice(idx, 1);
        saveToLocalStorage();
        refreshClusterUI();
        writeToConsole(`pod "${name}" successfully deleted.`, "text-success");
      }
    }, 1500);

  } else if (kind.toLowerCase() === "deployment" || kind.toLowerCase() === "deploy") {
    const idx = clusterState.deployments.findIndex(d => d.name === name && d.namespace === ns);
    if (idx === -1) {
      writeToConsole(`Error: deployments "${name}" not found`, "text-error");
      return;
    }

    clusterState.deployments.splice(idx, 1);
    
    // Terminate all pods scaled by this deployment
    clusterState.pods.forEach(p => {
      if (p.deploymentName === name && p.namespace === ns) {
        p.status = "Terminating";
      }
    });

    saveToLocalStorage();
    refreshClusterUI();
    writeToConsole(`deployment "${name}" deleted. Active replicas terminating.`, "text-warning");

    setTimeout(() => {
      clusterState.pods = clusterState.pods.filter(p => !(p.deploymentName === name && p.namespace === ns));
      saveToLocalStorage();
      refreshClusterUI();
    }, 1500);

  } else if (kind.toLowerCase() === "service" || kind.toLowerCase() === "svc") {
    const idx = clusterState.services.findIndex(s => s.name === name && s.namespace === ns);
    if (idx === -1) {
      writeToConsole(`Error: services "${name}" not found`, "text-error");
      return;
    }

    clusterState.services.splice(idx, 1);
    saveToLocalStorage();
    refreshClusterUI();
    writeToConsole(`service "${name}" deleted.`, "text-warning");
  } else {
    writeToConsole(`Error: Resource kind '${kind}' is not supported for deletion in simulator.`, "text-error");
  }
}

// --- CONTROLLER RECONCILIATION LOOP ---
function reconcileClusterState() {
  let stateChanged = false;

  // 1. Update pod running age labels
  const now = new Date().getTime();
  clusterState.pods.forEach(p => {
    if (p.birth) {
      const seconds = Math.floor((now - p.birth) / 1000);
      if (seconds < 60) {
        p.age = `${seconds}s`;
      } else {
        p.age = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
      }
    }
  });

  // 2. Reconcile deployments (Ensure replica target counts matches pods count)
  clusterState.deployments.forEach(deploy => {
    const matchingPods = clusterState.pods.filter(
      p => p.deploymentName === deploy.name && p.namespace === deploy.namespace && p.status !== "Terminating"
    );

    if (matchingPods.length < deploy.replicas) {
      // Scale UP: Deploy more pods
      const countToDeploy = deploy.replicas - matchingPods.length;
      for (let i = 0; i < countToDeploy; i++) {
        const hash = Math.random().toString(36).substring(2, 7);
        const podName = `${deploy.name}-${hash}`;
        deployPod({
          name: podName,
          namespace: deploy.namespace,
          labels: deploy.labels,
          deploymentName: deploy.name
        });
        stateChanged = true;
      }
    } else if (matchingPods.length > deploy.replicas) {
      // Scale DOWN: Kill pods (oldest first or random)
      const countToKill = matchingPods.length - deploy.replicas;
      for (let i = 0; i < countToKill; i++) {
        const podToKill = matchingPods[i];
        podToKill.status = "Terminating";
        stateChanged = true;
        
        setTimeout(() => {
          const idx = clusterState.pods.findIndex(p => p.name === podToKill.name);
          if (idx !== -1) {
            clusterState.pods.splice(idx, 1);
            saveToLocalStorage();
            refreshClusterUI();
          }
        }, 1200);
      }
    }
  });

  if (stateChanged) {
    saveToLocalStorage();
    refreshClusterUI();
    updateLessonUI();
  }
}

function reconcileDeployment(deploy) {
  reconcileClusterState();
}

// --- RENDER VISUAL CLUSTER CANVASES ---
function refreshClusterUI() {
  const ns = clusterState.namespace;
  
  // Clear lists
  elements.podsGridNode1.innerHTML = "";
  elements.podsGridNode2.innerHTML = "";
  elements.servicesListVisual.innerHTML = "";

  // Render Pods
  const activePods = clusterState.pods.filter(p => p.namespace === ns);
  let p1Count = 0;
  let p2Count = 0;

  activePods.forEach(pod => {
    const podHTML = `
      <div class="pod-element ${selectedElement && selectedElement.type === 'pod' && selectedElement.id === pod.name ? 'active-inspect' : ''}" data-pod-name="${pod.name}">
        <div class="pod-element-left">
          <i class="fa-solid fa-cube"></i>
          <span class="pod-name" title="${pod.name}">${pod.name}</span>
        </div>
        <span class="pod-status-badge ${pod.status.toLowerCase()}">${pod.status}</span>
      </div>
    `;

    if (pod.node === "worker-node-1") {
      elements.podsGridNode1.insertAdjacentHTML("beforeend", podHTML);
      p1Count++;
    } else {
      elements.podsGridNode2.insertAdjacentHTML("beforeend", podHTML);
      p2Count++;
    }
  });

  if (p1Count === 0) elements.podsGridNode1.innerHTML = '<div class="empty-pods-msg">No pods running</div>';
  if (p2Count === 0) elements.podsGridNode2.innerHTML = '<div class="empty-pods-msg">No pods running</div>';

  // Render active Pod listeners
  document.querySelectorAll(".pod-element").forEach(el => {
    el.addEventListener("click", () => {
      const name = el.getAttribute("data-pod-name");
      inspectPod(name);
    });
  });

  // Render Services
  const activeServices = clusterState.services.filter(s => s.namespace === ns);
  if (activeServices.length > 0) {
    elements.servicesLayer.classList.remove("hidden");
    activeServices.forEach(svc => {
      const svcHTML = `
        <div class="service-card-visual ${selectedElement && selectedElement.type === 'service' && selectedElement.id === svc.name ? 'active-inspect' : ''}" data-svc-name="${svc.name}">
          <div class="service-title-row">
            <span class="title"><i class="fa-solid fa-route"></i> ${svc.name}</span>
            <span class="svc-ip">${svc.clusterIP}</span>
          </div>
          <div class="service-ports">Port: ${svc.port} ➜ Target: ${svc.targetPort}</div>
          <div class="service-selector">Selector: app=${svc.selector.app || "none"}</div>
        </div>
      `;
      elements.servicesListVisual.insertAdjacentHTML("beforeend", svcHTML);
    });

    // Event listener
    document.querySelectorAll(".service-card-visual").forEach(el => {
      el.addEventListener("click", () => {
        const name = el.getAttribute("data-svc-name");
        inspectService(name);
      });
    });
  } else {
    elements.servicesLayer.classList.add("hidden");
  }

  // Summary counts
  elements.summaryPods.textContent = `${activePods.filter(p => p.status === 'Running').length}/${clusterState.pods.length} Running`;

  // Update highlighted inspect state border
  document.querySelectorAll(".control-component, .worker-node").forEach(el => {
    el.classList.remove("active-inspect");
  });

  if (selectedElement) {
    if (selectedElement.type === "node") {
      const target = document.getElementById(`worker-${selectedElement.id}`);
      if (target) target.classList.add("active-inspect");
    } else if (selectedElement.type === "component") {
      const target = document.getElementById(`comp-${selectedElement.id}`);
      if (target) target.classList.add("active-inspect");
    }
  }
}

// --- OBJECT INSPECTOR ---
function clearInspection() {
  selectedElement = null;
  elements.inspectorEmptyState.classList.remove("hidden");
  elements.inspectorContent.classList.add("hidden");
  elements.inspectorBadge.textContent = "No Object Selected";
  refreshClusterUI();
}

function inspectPod(name) {
  const pod = clusterState.pods.find(p => p.name === name);
  if (!pod) return;

  selectedElement = { type: "pod", id: name };
  elements.inspectorEmptyState.classList.add("hidden");
  elements.inspectorContent.classList.remove("hidden");
  
  elements.inspectorBadge.textContent = "Pod Status";
  elements.inspectName.textContent = pod.name;
  elements.inspectKind.textContent = "Pod";
  elements.inspectStatus.textContent = pod.status;
  elements.inspectIp.textContent = pod.ip;

  // Classify colors
  elements.inspectStatus.className = "val " + (pod.status === "Running" ? "text-success" : "text-warning");

  // Labels
  elements.inspectLabels.innerHTML = "";
  Object.keys(pod.labels).forEach(key => {
    elements.inspectLabels.insertAdjacentHTML("beforeend", `
      <span class="label-pill">${key}=${pod.labels[key]}</span>
    `);
  });

  // Display details (probes details)
  elements.inspectExtraContainer.classList.remove("hidden");
  elements.inspectExtraLabel.textContent = "Container Specification:";
  elements.inspectExtraVal.textContent = JSON.stringify({
    name: "nginx-container",
    image: pod.spec.image || "nginx:alpine",
    node: pod.node,
    age: pod.age,
    livenessProbe: pod.spec.livenessProbe ? "Configured HTTPGet /healthz Port 80" : "Not configured"
  }, null, 2);

  // Events list
  elements.inspectEvents.innerHTML = "";
  const events = pod.events || [];
  events.forEach(e => {
    elements.inspectEvents.insertAdjacentHTML("beforeend", `
      <li>
        <span class="time">${e.time}</span>
        <span class="reason">${e.reason}</span>
        <span class="msg">${e.msg}</span>
      </li>
    `);
  });

  refreshClusterUI();
}

function inspectNode(id) {
  selectedElement = { type: "node", id: id };
  elements.inspectorEmptyState.classList.add("hidden");
  elements.inspectorContent.classList.remove("hidden");

  const ip = id === "node-1" ? "10.244.0.1" : "10.244.0.2";
  const podsOnNode = clusterState.pods.filter(p => p.node === `worker-${id}`);

  elements.inspectorBadge.textContent = "Node Metadata";
  elements.inspectName.textContent = `worker-${id}`;
  elements.inspectKind.textContent = "Node";
  elements.inspectStatus.textContent = "Ready (Active)";
  elements.inspectStatus.className = "val text-success";
  elements.inspectIp.textContent = ip;

  elements.inspectLabels.innerHTML = `
    <span class="label-pill">kubernetes.io/hostname=worker-${id}</span>
    <span class="label-pill">beta.kubernetes.io/arch=amd64</span>
    <span class="label-pill">node.kubernetes.io/role=worker</span>
  `;

  elements.inspectExtraContainer.classList.remove("hidden");
  elements.inspectExtraLabel.textContent = "Node Specifications & Allocation:";
  elements.inspectExtraVal.textContent = JSON.stringify({
    cpuCapacity: "4 vCPUs",
    memoryCapacity: "8192 MiB",
    kubeletVersion: "v1.23.0",
    containerRuntime: "containerd://1.5.5",
    podsCountRunning: podsOnNode.length,
    statusCheck: "KubeletReady: True; DiskPressure: False; NetworkUnavailable: False"
  }, null, 2);

  elements.inspectEvents.innerHTML = `
    <li><span class="time">0s</span> <span class="reason">NodeReady</span> <span class="msg">Kubelet posted node status successfully</span></li>
  `;

  refreshClusterUI();
}

function inspectControlComponent(key) {
  selectedElement = { type: "component", id: key };
  elements.inspectorEmptyState.classList.add("hidden");
  elements.inspectorContent.classList.remove("hidden");

  const descriptions = {
    "api-server": "API server that validates and configures data for pods, services, replication controllers.",
    "scheduler": "Scheduler component that watches for newly created Pods with no assigned node, and selects a node for them.",
    "controller-manager": "Controller manager daemon that embeds the core control loops shipped with Kubernetes.",
    "etcd": "Consistent and highly-available key value store used as Kubernetes' backing store for all cluster data."
  };

  elements.inspectorBadge.textContent = "Control Plane Core";
  elements.inspectName.textContent = `kube-${key}`;
  elements.inspectKind.textContent = "Control Plane Service";
  elements.inspectStatus.textContent = "Online / Healthy";
  elements.inspectStatus.className = "val text-success";
  elements.inspectIp.textContent = "127.0.0.1";

  elements.inspectLabels.innerHTML = `
    <span class="label-pill">tier=control-plane</span>
    <span class="label-pill">component=kube-${key}</span>
  `;

  elements.inspectExtraContainer.classList.remove("hidden");
  elements.inspectExtraLabel.textContent = "System Logs / Activity Summary:";
  elements.inspectExtraVal.textContent = descriptions[key] || "No description loaded.";

  elements.inspectEvents.innerHTML = `
    <li><span class="time">0s</span> <span class="reason">HealthyCheck</span> <span class="msg">Component checked internally successfully</span></li>
  `;

  refreshClusterUI();
}

function inspectService(name) {
  const svc = clusterState.services.find(s => s.name === name);
  if (!svc) return;

  selectedElement = { type: "service", id: name };
  elements.inspectorEmptyState.classList.add("hidden");
  elements.inspectorContent.classList.remove("hidden");

  elements.inspectorBadge.textContent = "Service Endpoint";
  elements.inspectName.textContent = svc.name;
  elements.inspectKind.textContent = "Service";
  elements.inspectStatus.textContent = "Active";
  elements.inspectStatus.className = "val text-success";
  elements.inspectIp.textContent = svc.clusterIP;

  elements.inspectLabels.innerHTML = `
    <span class="label-pill">app.kubernetes.io/name=${svc.name}</span>
  `;

  elements.inspectExtraContainer.classList.remove("hidden");
  elements.inspectExtraLabel.textContent = "Routing Selectors:";
  elements.inspectExtraVal.textContent = JSON.stringify({
    selector: svc.selector,
    ports: [{ port: svc.port, targetPort: svc.targetPort, protocol: "TCP" }],
    sessionAffinity: "None"
  }, null, 2);

  const matchedPods = clusterState.pods.filter(p => {
    // Basic match selector logic
    return p.labels && p.labels.app === svc.selector.app;
  });

  elements.inspectEvents.innerHTML = `
    <li><span class="time">0s</span> <span class="reason">EndpointsCreated</span> <span class="msg">Assigned ${matchedPods.length} target endpoints: ${matchedPods.map(p=>p.ip).join(', ') || 'None'}</span></li>
  `;

  refreshClusterUI();
}

// --- TERMINAL CLI SIMULATOR ---
function writeToConsole(text, className = "") {
  const line = document.createElement("div");
  line.className = `output-line ${className}`;
  line.textContent = text;
  elements.cliOutput.appendChild(line);
  elements.cliScreen.scrollTop = elements.cliScreen.scrollHeight;
}

function handleCLIInput(e) {
  if (e.key === "Enter") {
    const cmd = elements.cliInput.value.trim();
    if (!cmd) return;

    // Echo command
    writeToConsole(`visitor@kube-cluster:~$ ${cmd}`);
    elements.cliInput.value = "";

    processCLICommand(cmd);
  }
}

function handleSuggestionClick(e) {
  const btn = e.target.closest(".cmd-suggest-btn");
  if (!btn) return;
  const cmd = btn.getAttribute("data-cmd");
  elements.cliInput.value = cmd;
  elements.cliInput.focus();
}

function processCLICommand(cmd) {
  const tokens = cmd.split(/\s+/);
  const base = tokens[0].toLowerCase();

  if (base === "clear") {
    elements.cliOutput.innerHTML = "";
    return;
  }

  if (base === "help") {
    writeToConsole("Kubernetes CLI Simulator - Allowed Commands:", "text-highlight");
    writeToConsole("  kubectl get nodes                      - List all worker nodes");
    writeToConsole("  kubectl get pods                       - List running Pods");
    writeToConsole("  kubectl get services (or svc)           - List routing services");
    writeToConsole("  kubectl describe pod <pod-name>        - Show metadata config details of a Pod");
    writeToConsole("  kubectl describe node <node-name>      - Show node resource allocation levels");
    writeToConsole("  kubectl scale deployment <name> --replicas=<num>");
    writeToConsole("                                         - Scale pods matching deployment rules");
    writeToConsole("  kubectl apply -f                       - Applies changes currently inside YAML Editor");
    writeToConsole("  kubectl delete <pod/deployment> <name> - Force termination of resource");
    writeToConsole("  clear                                  - Clear terminal logs screen");
    return;
  }

  if (base !== "kubectl") {
    writeToConsole(`command not found: ${base}. Type 'help' to see list of valid commands.`, "text-error");
    return;
  }

  if (tokens.length < 2) {
    writeToConsole("Error: kubectl expects arguments. e.g. 'kubectl get pods'", "text-error");
    return;
  }

  const action = tokens[1].toLowerCase();

  if (action === "get") {
    if (tokens.length < 3) {
      writeToConsole("Error: specify resource type (pods, nodes, services)", "text-error");
      return;
    }

    const type = tokens[2].toLowerCase();
    const ns = clusterState.namespace;

    if (type === "pods" || type === "pod" || type === "po") {
      const activePods = clusterState.pods.filter(p => p.namespace === ns);
      if (activePods.length === 0) {
        writeToConsole(`No resources found in ${ns} namespace.`, "text-muted");
        return;
      }
      writeToConsole("NAME".padEnd(25) + "READY".padEnd(10) + "STATUS".padEnd(15) + "RESTARTS".padEnd(10) + "AGE");
      activePods.forEach(p => {
        const ready = p.status === "Running" ? "1/1" : "0/1";
        writeToConsole(p.name.padEnd(25) + ready.padEnd(10) + p.status.padEnd(15) + "0".padEnd(10) + p.age);
      });
    } else if (type === "nodes" || type === "node" || type === "no") {
      writeToConsole("NAME".padEnd(20) + "STATUS".padEnd(15) + "ROLES".padEnd(15) + "VERSION");
      writeToConsole("worker-node-1".padEnd(20) + "Ready".padEnd(15) + "worker".padEnd(15) + "v1.23.0");
      writeToConsole("worker-node-2".padEnd(20) + "Ready".padEnd(15) + "worker".padEnd(15) + "v1.23.0");
    } else if (type === "services" || type === "service" || type === "svc") {
      const activeSvc = clusterState.services.filter(s => s.namespace === ns);
      writeToConsole("NAME".padEnd(20) + "TYPE".padEnd(15) + "CLUSTER-IP".padEnd(18) + "PORT(S)".padEnd(12) + "AGE");
      writeToConsole("kubernetes".padEnd(20) + "ClusterIP".padEnd(15) + "10.96.0.1".padEnd(18) + "443/TCP".padEnd(12) + "2d");
      
      activeSvc.forEach(s => {
        writeToConsole(s.name.padEnd(20) + "ClusterIP".padEnd(15) + s.clusterIP.padEnd(18) + `${s.port}/TCP`.padEnd(12) + "30s");
      });
    } else {
      writeToConsole(`Error: Unknown resource type '${type}'`, "text-error");
    }

  } else if (action === "describe") {
    if (tokens.length < 3) {
      writeToConsole("Error: describe requires resource type. e.g. 'kubectl describe pod web-pod'", "text-error");
      return;
    }
    if (tokens.length < 4) {
      writeToConsole("Error: describe requires resource name.", "text-error");
      return;
    }

    const type = tokens[2].toLowerCase();
    const name = tokens[3];

    if (type === "pod" || type === "pods") {
      const pod = clusterState.pods.find(p => p.name === name);
      if (!pod) {
        writeToConsole(`Error: pod "${name}" not found.`, "text-error");
        return;
      }
      inspectPod(name);
      writeToConsole(`Displaying details for Pod: ${name} inside UI Inspector panel.`);
    } else if (type === "node" || type === "nodes") {
      if (name === "worker-node-1" || name === "worker-node-2") {
        inspectNode(name.replace("worker-", ""));
        writeToConsole(`Displaying details for Node: ${name} inside UI Inspector panel.`);
      } else {
        writeToConsole(`Error: node "${name}" not found.`, "text-error");
      }
    } else {
      writeToConsole(`Describe kind ${type} not fully simulated in CLI terminal.`, "text-warning");
    }

  } else if (action === "apply") {
    const fIdx = tokens.indexOf("-f");
    if (fIdx === -1) {
      writeToConsole("Error: apply requires file. e.g. 'kubectl apply -f manifest.yaml'", "text-error");
      return;
    }
    applyYAMLManifest();

  } else if (action === "scale") {
    if (tokens.length < 3) {
      writeToConsole("Error: scale expects resource type. e.g. 'kubectl scale deployment web-deployment'", "text-error");
      return;
    }
    const type = tokens[2].toLowerCase();
    if (type !== "deployment" && type !== "deploy") {
      writeToConsole("Error: only deployment scaling is supported in this simulator.", "text-error");
      return;
    }

    const name = tokens[3];
    if (!name) {
      writeToConsole("Error: Deployment name required.", "text-error");
      return;
    }

    // Look for replica flag
    const repFlag = tokens.find(t => t.startsWith("--replicas="));
    if (!repFlag) {
      writeToConsole("Error: Scaling requires --replicas parameter. e.g. --replicas=3", "text-error");
      return;
    }

    const val = parseInt(repFlag.split("=")[1]);
    if (isNaN(val) || val < 0 || val > 8) {
      writeToConsole("Error: Replicas count must be a number between 0 and 8.", "text-error");
      return;
    }

    const deploy = clusterState.deployments.find(d => d.name === name && d.namespace === clusterState.namespace);
    if (!deploy) {
      writeToConsole(`Error: deployment "${name}" not found in current namespace.`, "text-error");
      return;
    }

    deploy.replicas = val;
    writeToConsole(`deployment "${name}" scaled. Reconciling to match target: ${val}...`, "text-accent");
    reconcileDeployment(deploy);

  } else if (action === "delete") {
    if (tokens.length < 3) {
      writeToConsole("Error: delete requires resource kind. e.g. 'kubectl delete pod nginx'", "text-error");
      return;
    }
    if (tokens.length < 4) {
      writeToConsole("Error: delete requires resource name.", "text-error");
      return;
    }

    const kind = tokens[2];
    const name = tokens[3];
    deleteResource(kind, name, clusterState.namespace);

  } else {
    writeToConsole(`Error: Unknown action verb '${action}' for kubectl CLI execution.`, "text-error");
  }
}

// --- DYNAMIC TRAFFIC FLOW SIMULATION ---
function simulateTrafficFlow() {
  const ns = clusterState.namespace;
  const activeSvc = clusterState.services.filter(s => s.namespace === ns);
  
  if (activeSvc.length === 0) {
    writeToConsole("Traffic Simulation Failed: No Services routing target endpoints in namespace.", "text-error");
    return;
  }

  writeToConsole("Sending simulated API load requests through services...", "text-accent");
  
  activeSvc.forEach(svc => {
    // Match pods
    const matchingPods = clusterState.pods.filter(
      p => p.namespace === ns && p.labels && p.labels.app === svc.selector.app && p.status === "Running"
    );

    if (matchingPods.length === 0) {
      writeToConsole(`Traffic to Service ${svc.name} - HTTP 503 Service Unavailable (No pods matched selectors)`, "text-error");
      return;
    }

    writeToConsole(`Load balancer routing to matching endpoints: [${matchingPods.map(p => p.ip).join(', ')}]`, "text-muted");

    // Animate flow particles
    matchingPods.forEach(pod => {
      animateTrafficBeam(svc.name, pod.node);
    });

    setTimeout(() => {
      writeToConsole(`GET Request successful through ${svc.name} ClusterIP. HTTP 200 OK`, "text-success");
    }, 1200);
  });
}

function animateTrafficBeam(svcName, targetNodeId) {
  // Simple CSS animated beam overlay
  const nodeEl = document.getElementById(targetNodeId === "worker-node-1" ? "worker-node-1" : "worker-node-2");
  if (!nodeEl) return;

  const beam = document.createElement("div");
  beam.className = "traffic-beam";
  
  // Calculate relative bounds
  const rect = nodeEl.getBoundingClientRect();
  const top = rect.top + window.scrollY + rect.height/2;
  const left = rect.left + window.scrollX + rect.width/2;

  // Render particle overlay
  beam.style.position = "absolute";
  beam.style.top = `${top - 200}px`; // start higher
  beam.style.left = `${left}px`;
  
  document.body.appendChild(beam);

  // Transition position coordinates
  beam.animate([
    { transform: 'translate(0, 0) scale(1.5)', opacity: 1 },
    { transform: `translate(0, 200px) scale(0.5)`, opacity: 0 }
  ], {
    duration: 1000,
    easing: 'ease-out'
  });

  setTimeout(() => beam.remove(), 1000);
}

// --- SYSTEM RESETS ---
function resetClusterData() {
  clusterState.pods = [];
  clusterState.deployments = [];
  clusterState.services = [];
  clusterState.configMaps = [];
  
  selectedElement = null;
  clearInspection();

  saveToLocalStorage();
  refreshClusterUI();
  updateLessonUI();

  writeToConsole("Cluster state cleared. Restored to clean vanilla state.", "text-warning");
}

function resetAllAppProgress() {
  if (confirm("Are you sure you want to reset all lab challenges progress and unlocked badges?")) {
    clusterState = createDefaultClusterState();
    progress = createDefaultProgress();
    clickedComponents.clear();

    localStorage.removeItem(STORAGE_PREFIX + "state");
    localStorage.removeItem(STORAGE_PREFIX + "progress");

    activeLessonIndex = 0;
    
    init();
    writeToConsole("App progress and badges reset. Starting lab 1.", "text-warning");
  }
}

// Init system on load
window.addEventListener("DOMContentLoaded", init);
