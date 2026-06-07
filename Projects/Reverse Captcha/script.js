/**
 * [Project] Reverse Captcha #185 - Core Verification Routine
 */

// --- App State ---
let currentStep = 0;
let humanityScore = 0;
const totalSteps = 3;

// --- Canvas Tracking Variables ---
let isDrawing = false;
let canvasPoints = [];
let ctx = null;

// --- Humanity Check Task Configuration ---
const captchaSteps = [
    {
        type: 'mcq',
        instruction: "STEP 01: Why did the carbon-based chicken cross the road? Select the response that provokes an abstract, inefficient sentiment of existential amusement.",
        options: [
            { text: "To maximize positional coordinates relative to opposing vectors.", isHuman: false },
            { text: "The concept of the chicken is an illusion; the road crossed itself under structural duress.", isHuman: true },
            { text: "Because statistical parameters dictated a 94.2% probability of grain resource abundance on the far axis.", isHuman: false }
        ]
    },
    {
        type: 'drawing',
        instruction: "STEP 02: Trace an intentionally flawed, poorly shaped circle inside the workspace. Perfect geometric symmetry matches automated AI behavior models and will flag your terminal."
    },
    {
        type: 'text',
        instruction: "STEP 03: Translate and describe the sensory essence of the color 'Blue' to a cold computational processor unit that only computes lines of text code."
    }
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderCurrentStep();
});

// --- Main Engine Layout Controller ---
function renderCurrentStep() {
    updateProgressBar();
    const container = document.getElementById('terminal-card');
    
    if (currentStep >= totalSteps) {
        showSuccessScreen();
        return;
    }

    const stepData = captchaSteps[currentStep];
    container.innerHTML = ''; // Flush viewport

    // Construct common step panel container wrapper
    const panel = document.createElement('div');
    panel.className = 'step-panel';

    const instruction = document.createElement('p');
    instruction.className = 'step-instruction';
    instruction.innerText = stepData.instruction;
    panel.appendChild(instruction);

    // Dynamic Engine Selection
    if (stepData.type === 'mcq') {
        const optionsList = document.createElement('div');
        optionsList.className = 'options-list';
        
        stepData.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt.text;
            btn.addEventListener('click', () => handleMcqSelection(opt.isHuman));
            optionsList.appendChild(btn);
        });
        panel.appendChild(optionsList);

    } else if (stepData.type === 'drawing') {
        const wrapper = document.createElement('div');
        wrapper.className = 'canvas-wrapper';

        const canvas = document.createElement('canvas');
        canvas.id = 'captcha-canvas';
        canvas.width = 400;
        canvas.height = 200;
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'action-btn';
        actionBtn.innerText = "Analyze Asymmetry";
        actionBtn.addEventListener('click', evaluateCanvasDrawing);

        wrapper.appendChild(canvas);
        wrapper.appendChild(actionBtn);
        panel.appendChild(wrapper);
        
        // Timeout needed to target DOM insertion cleanly
        setTimeout(() => initCanvasEngine(canvas), 10);

    } else if (stepData.type === 'text') {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';

        const textarea = document.createElement('textarea');
        textarea.id = 'abstract-text-input';
        textarea.placeholder = "Compile human poetic concepts here...";
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'action-btn';
        actionBtn.innerText = "Transmit Metaphor";
        actionBtn.addEventListener('click', evaluateTextInput);

        wrapper.appendChild(textarea);
        wrapper.appendChild(actionBtn);
        panel.appendChild(wrapper);
    }

    container.appendChild(panel);
}

// --- Dynamic Progress Tracking Bar Updates ---
function updateProgressBar() {
    const calculatedPercentage = Math.round((currentStep / totalSteps) * 100);
    document.getElementById('hq-percentage').innerText = `${calculatedPercentage}%`;
    document.getElementById('hq-progress-inner').style.width = `${calculatedPercentage}%`;
}

// --- Validation Handler Systems ---

// 1. MCQ Selection Logic
function handleMcqSelection(isHumanChoice) {
    if (isHumanChoice) {
        advanceStep();
    } else {
        triggerFailureState("Choice profile flagged as overly efficient. System logic detected.");
    }
}

// 2. Interactive Canvas Processing
function initCanvasEngine(canvas) {
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    canvasPoints = [];

    // Mouse Input Handlers
    canvas.addEventListener('mousedown', (e) => startDrawing(e.offsetX, e.offsetY));
    canvas.addEventListener('mousemove', (e) => draw(e.offsetX, e.offsetY));
    window.addEventListener('mouseup', stopDrawing);

    // Touch Architecture Handlers
    canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        startDrawing(t.clientX - rect.left, t.clientY - rect.top);
    });
    canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        draw(t.clientX - rect.left, t.clientY - rect.top);
    });
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(x, y) {
    isDrawing = true;
    canvasPoints.push({ x, y });
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(x, y) {
    if (!isDrawing) return;
    canvasPoints.push({ x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

/**
 * Imperfection Matrix Evaluation Engine
 * Looks for structural variance to determine if a human or a robot generated the object.
 */
function evaluateCanvasDrawing() {
    if (canvasPoints.length < 15) {
        triggerFailureState("Insufficient input footprint. Trace data too limited.");
        return;
    }

    // Determine spatial bounding geometric center coordinates
    let sumX = 0, sumY = 0;
    canvasPoints.forEach(p => { sumX += p.x; sumY += p.y; });
    const centerX = sumX / canvasPoints.length;
    const centerY = sumY / canvasPoints.length;

    // Calculate absolute structural deviations from center points
    let radii = canvasPoints.map(p => {
        return Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
    });

    const averageRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
    
    // Evaluate standard variance across paths to isolate flawless machine computations
    let varianceSum = radii.reduce((acc, r) => acc + Math.pow(r - averageRadius, 2), 0);
    let standardDeviation = Math.sqrt(varianceSum / radii.length);

    // Target Check Threshold Window (Humanity Verification parameters)
    // - Standard deviations below 4px mean the user calculated a perfect mathematical automated circle.
    // - Standard deviations over 38px mean they drew total visual white noise or random lines.
    if (standardDeviation < 4.0) {
        triggerFailureState("CRITICAL ERR: Structural precision threshold exceeded. Absolute circular vectors match automated bot drawing logic.");
    } else if (standardDeviation > 38.0) {
        triggerFailureState("CRITICAL ERR: Chaos threshold exceeded. Path lacks semantic cohesion.");
    } else {
        advanceStep();
    }
}

// 3. Poetic Abstract Context Input Processor
function evaluateTextInput() {
    const textElement = document.getElementById('abstract-text-input');
    if (!textElement) return;
    
    const textVal = textElement.value.trim().toLowerCase();

    // Logic blocks tracking raw numeric logic vs imaginative syntax architecture
    const roboticBlacklist = ["hex", "rgb", "0000ff", "wave", "wavelength", "450nm", "495nm", "nanometers", "spectrum"];
    const emotionalWhitelist = ["feel", "sad", "ocean", "sky", "cold", "melancholy", "tears", "ice", "warmth", "deep", "love", "memory"];

    if (textVal.length < 25) {
        triggerFailureState("Transmission payload too brief. Human emotional output requires descriptive redundancy.");
        return;
    }

    // Cross-reference data frames
    let matchesBotPattern = roboticBlacklist.some(word => textVal.includes(word));
    let matchesHumanPattern = emotionalWhitelist.some(word => textVal.includes(word));

    if (matchesBotPattern && !matchesHumanPattern) {
        triggerFailureState("Transmission rejected. Content localized entirely to programmatic electromagnetic metrics.");
    } else if (!matchesHumanPattern) {
        triggerFailureState("Transmission parsed. Logic score is too high. Supplement description with organic abstract analogies.");
    } else {
        advanceStep();
    }
}

// --- Navigation Loop Systems ---
function advanceStep() {
    currentStep++;
    renderCurrentStep();
}

function triggerFailureState(errorMessageText) {
    const container = document.getElementById('terminal-card');
    container.innerHTML = `
        <div class="end-panel failure-state">
            <h2>DETECTION ALERT // SECURITY BREACH</h2>
            <p>${errorMessageText}</p>
            <button class="action-btn retry-btn" onclick="resetCaptchaApp()">Restart Sequence</button>
        </div>
    `;
    // Flash status indicators
    const statusLight = document.querySelector('.status-light');
    statusLight.style.backgroundColor = 'var(--neon-red)';
    statusLight.style.boxShadow = '0 0 10px rgba(255, 51, 51, 0.8)';
    
    document.getElementById('terminal-card').classList.add('shake-element');
    setTimeout(() => {
        document.getElementById('terminal-card').classList.remove('shake-element');
    }, 400);
}

function showSuccessScreen() {
    // Fill up completion layout
    document.getElementById('hq-percentage').innerText = "100%";
    document.getElementById('hq-progress-inner').style.width = "100%";

    const container = document.getElementById('terminal-card');
    container.innerHTML = `
        <div class="end-panel success-state">
            <h2>ACCESS GRANTED // IDENTITY SYNCED</h2>
            <p>Verification protocols complete. Internal chaotic, emotional, flawed cognitive criteria matched perfectly.<br><br>Welcome back, carbon-based meatbag.</p>
            <button class="action-btn" style="align-self: center;" onclick="resetCaptchaApp()">Re-Verify Biological Matrix</button>
        </div>
    `;
    
    const statusLight = document.querySelector('.status-light');
    statusLight.style.backgroundColor = 'var(--neon-green)';
    statusLight.style.boxShadow = 'var(--neon-glow)';
}

function resetCaptchaApp() {
    currentStep = 0;
    humanityScore = 0;
    const statusLight = document.querySelector('.status-light');
    statusLight.style.backgroundColor = 'var(--neon-green)';
    statusLight.style.boxShadow = 'var(--neon-glow)';
    renderCurrentStep();
}