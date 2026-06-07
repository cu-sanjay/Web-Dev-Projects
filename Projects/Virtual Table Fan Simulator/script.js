/**
 * DYNAMIC HARDWARE SIMULATION ENGINE & AUDIO SYNTHESIZER
 * Real-time Inertia Tracker Tracking Loop Module via Core Client Web APIs
 */

class FanSimulator {
    constructor() {
        // Core Internal State Machine Variables
        this.state = {
            currentSpeedSetting: 0, 
            targetRPM: 0,
            currentRPM: 0,
            isOscillating: false,
            oscillationAngle: 0,
            oscillationDirection: 1, // 1 = Right, -1 = Left
            currentRotationDegree: 0,
            energyLoadPercent: 0
        };

        // Static Multi-Step Hardware Bounds Array Metrics
        this.hardwareSpecs = {
            0: { targetRPM: 0, load: 0, audioVol: 0.0, filterFreq: 120 },
            1: { targetRPM: 480, load: 28, audioVol: 0.35, filterFreq: 260 },
            2: { targetRPM: 920, load: 62, audioVol: 0.65, filterFreq: 440 },
            3: { targetRPM: 1450, load: 100, audioVol: 1.0, filterFreq: 680 }
        };

        // Angular Limits configuration maps mapping spatial mechanics boundary properties
        this.oscillationLimit = 40; // Max sweep bounds left/right (+/- degrees)
        this.oscillationSpeedFactor = 0.025; // Continuous interpolation step increment

        // Inertia Constants mapping acceleration/deceleration coefficients
        this.inertiaAcceleration = 2.8; 
        this.inertiaDeceleration = 1.9;

        // Audio System State Infrastructure Nodes Tracking Multi-Channel Context Hooks
        this.audio = {
            context: null,
            brownNoiseNode: null,
            biquadFilter: null,
            gainNode: null,
            lowOscillator: null,
            oscGain: null,
            initialized: false
        };

        this.lastTimestamp = performance.now();

        // Target Global DOM UI Element Mapping Nodes
        this.dom = {
            assembly: document.getElementById('fan-hardware-assembly'),
            bladeContainer: document.getElementById('fan-blade-container'),
            rpmValue: document.getElementById('rpm-value'),
            rpmProgress: document.getElementById('rpm-progress'),
            diagnosticStatus: document.getElementById('diagnostic-status'),
            telemetryAngle: document.getElementById('telemetry-angle'),
            telemetryLoad: document.getElementById('telemetry-load'),
            oscButton: document.getElementById('oscillation-toggle'),
            speedButtons: document.querySelectorAll('.speed-btn')
        };

        this.initEventListeners();
        this.startSimulationLoop();
    }

    /**
     * DOM Selector Hook Registration Loops
     */
    initEventListeners() {
        // Speed Selector Buttons Integration Hooks
        this.dom.speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.currentTarget;
                const selectedSpeed = parseInt(targetBtn.getAttribute('data-speed'), 10);
                this.setSpeed(selectedSpeed);
            });
        });

        // Oscillation Toggle Interceptor Hook
        this.dom.oscButton.addEventListener('click', () => {
            this.toggleOscillation();
        });
    }

    /**
     * Initializes Browser Audio Context Node Framework on Dynamic Interactions
     */
    initAudioSynthesis() {
        if (this.audio.initialized) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audio.context = new AudioContextClass();

            // 1. Establish custom procedural brown noise generator node algorithm buffers
            const bufferSize = 2 * this.audio.context.sampleRate;
            const noiseBuffer = this.audio.context.createBuffer(1, bufferSize, this.audio.context.sampleRate);
            const outputBuffer = noiseBuffer.getChannelData(0);
            
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                // Brown noise filtration accumulation formula pass
                outputBuffer[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = outputBuffer[i];
                outputBuffer[i] *= 3.5; // Compensate structural gain curves loss
            }

            this.audio.brownNoiseNode = this.audio.context.createBufferSource();
            this.audio.brownNoiseNode.buffer = noiseBuffer;
            this.audio.brownNoiseNode.loop = true;

            // 2. Set up high-precision real-time sound optimization filter components
            this.audio.biquadFilter = this.audio.context.createBiquadFilter();
            this.audio.biquadFilter.type = 'lowpass';
            this.audio.biquadFilter.Q.value = 1.0;

            this.audio.gainNode = this.audio.context.createGain();
            this.audio.gainNode.gain.value = 0.0;

            // 3. Connect low frequency hum synthesizer oscillator to map real motor load
            this.audio.lowOscillator = this.audio.context.createOscillator();
            this.audio.lowOscillator.type = 'sine';
            this.audio.lowOscillator.frequency.value = 45; // Low frequency base pitch hum

            this.audio.oscGain = this.audio.context.createGain();
            this.audio.oscGain.gain.value = 0.0;

            // 4. Mesh internal pipeline audio processing matrix node graph lines
            this.audio.brownNoiseNode.connect(this.audio.biquadFilter);
            this.audio.biquadFilter.connect(this.audio.gainNode);
            
            this.audio.lowOscillator.connect(this.audio.oscGain);
            
            // Channel routing directly terminating in primary hardware speakers
            this.audio.gainNode.connect(this.audio.context.destination);
            this.audio.oscGain.connect(this.audio.context.destination);

            // Trigger constant sound loop loops
            this.audio.brownNoiseNode.start(0);
            this.audio.lowOscillator.start(0);

            this.audio.initialized = true;
        } catch (err) {
            console.error("Audio Context initialization failed or browser permissions blocked context channel paths:", err);
        }
    }

    /**
     * Safe execution helper wrapper evaluating audio state context updates safely
     */
    resumeAudioContext() {
        this.initAudioSynthesis();
        if (this.audio.context && this.audio.context.state === 'suspended') {
            this.audio.context.resume();
        }
    }

    /**
     * Updates internal target tracking metrics following user selection adjustments
     */
    setSpeed(speedIndex) {
        this.resumeAudioContext();
        
        this.state.currentSpeedSetting = speedIndex;
        const targetSpec = this.hardwareSpecs[speedIndex];
        
        this.state.targetRPM = targetSpec.targetRPM;
        
        // Update Selector Interactive Classes UI Components Matrix Layout
        this.dom.speedButtons.forEach(btn => {
            if (parseInt(btn.getAttribute('data-speed'), 10) === speedIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.updateDiagnosticsUI();
    }

    /**
     * Configures internal oscillation mode parameters state structures
     */
    toggleOscillation() {
        this.resumeAudioContext();
        
        this.state.isOscillating = !this.state.isOscillating;
        
        if (this.state.isOscillating) {
            this.dom.oscButton.classList.add('active-mode');
            this.dom.oscButton.innerHTML = `<span class="indicator-dot"></span><span class="toggle-text">OSCILLATION MODE: ENABLED</span>`;
        } else {
            this.dom.oscButton.classList.remove('active-mode');
            this.dom.oscButton.innerHTML = `<span class="indicator-dot"></span><span class="toggle-text">OSCILLATION MODE: DISABLED</span>`;
        }
        
        this.updateDiagnosticsUI();
    }

    /**
     * Computes localized runtime diagnostics messages reflecting active hardware configurations
     */
    updateDiagnosticsUI() {
        const speed = this.state.currentSpeedSetting;
        let promptMessage = "IDLE";
        
        this.dom.diagnosticStatus.className = "status-indicator";

        if (speed === 0) {
            promptMessage = "IDLE";
            this.dom.diagnosticStatus.classList.add('state-off');
        } else {
            if (speed === 1) promptMessage = "LOW VELOCITY";
            if (speed === 2) promptMessage = "MID VELOCITY";
            if (speed === 3) promptMessage = "MAX VELOCITY";
            this.dom.diagnosticStatus.classList.add('state-active');
        }

        if (this.state.isOscillating && speed > 0) {
            promptMessage += " // OSCILLATING";
        }

        this.dom.diagnosticStatus.innerText = promptMessage;
    }

    /**
     * Core Simulation Loop Handler ticking precisely with display frame rates
     */
    startSimulationLoop() {
        const loop = (timestamp) => {
            const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Delta in fractional seconds
            this.lastTimestamp = timestamp;

            this.processPhysicsInertia(deltaTime);
            this.processOscillationMechanics(deltaTime);
            this.processAudioParameters();
            this.renderGraphics();

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    /**
     * Tracks dynamic acceleration and deceleration loops emulating true rotational mass inertia
     */
    processPhysicsInertia(deltaTime) {
        const current = this.state.currentRPM;
        const target = this.state.targetRPM;

        if (current < target) {
            // Apply linear inertia acceleration delta scaling
            this.state.currentRPM = Math.min(target, current + (this.inertiaAcceleration * 150 * deltaTime));
        } else if (current > target) {
            // Apply coast-down friction resistance parameters tracking loop deceleration
            this.state.currentRPM = Math.max(target, current - (this.inertiaDeceleration * 150 * deltaTime));
        }

        // Linearly scale energy load telemetry based on simulated velocity tracking margins
        const targetLoad = this.hardwareSpecs[this.state.currentSpeedSetting].load;
        const currentLoad = this.state.energyLoadPercent;
        
        if (currentLoad < targetLoad) {
            this.state.energyLoadPercent = Math.min(targetLoad, currentLoad + (50 * deltaTime));
        } else {
            this.state.energyLoadPercent = Math.max(targetLoad, currentLoad - (50 * deltaTime));
        }

        // Accumulate active angular degree steps relative to fractional RPM speed tracking increments
        const rotationsPerSecond = this.state.currentRPM / 60;
        const degreesPerSecond = rotationsPerSecond * 360;
        this.state.currentRotationDegree += degreesPerSecond * deltaTime;
        
        // Prevent floating-point overflow memory constraints via modular wrapping checks
        if (this.state.currentRotationDegree >= 360) {
            this.state.currentRotationDegree %= 360;
        }
    }

    /**
     * Manages side-to-side sweeping mechanics step increments based on current mechanical speed metrics
     */
    processOscillationMechanics(deltaTime) {
        // Oscillation logic requires structural energy load velocity to drive mechanical gears
        if (this.state.isOscillating && this.state.currentRPM > 10) {
            // Scale horizontal sweep cycle speeds dynamically based on current real-time RPM rates
            const rpmFactor = this.state.currentRPM / 1450;
            const currentStep = this.oscillationDirection * this.oscillationLimit * this.oscillationSpeedFactor * (0.4 + (0.6 * rpmFactor));
            
            this.state.oscillationAngle += currentStep;

            // Enforce hard hardware turnaround boundaries limits
            if (this.state.oscillationAngle >= this.oscillationLimit) {
                this.state.oscillationAngle = this.oscillationLimit;
                this.oscillationDirection = -1; // Change tracking vector direction leftwards
            } else if (this.state.oscillationAngle <= -this.oscillationLimit) {
                this.state.oscillationAngle = -this.oscillationLimit;
                this.oscillationDirection = 1; // Change tracking vector direction rightwards
            }
        } else if (!this.state.isOscillating && this.state.oscillationAngle !== 0) {
            // Gradually return chassis center-mass back to neutral straight configuration point when deactivated
            const returnStep = 15 * deltaTime;
            if (Math.abs(this.state.oscillationAngle) <= returnStep) {
                this.state.oscillationAngle = 0;
            } else {
                this.state.oscillationAngle -= Math.sign(this.state.oscillationAngle) * returnStep;
            }
        }
    }

    /**
     * Scales high-fidelity browser audio gain parameters mapping directly into continuous current physical RPM curves
     */
    processAudioParameters() {
        if (!this.audio.initialized) return;

        const currentRPM = this.state.currentRPM;
        const maxRPM = 1450;
        const rpmRatio = currentRPM / maxRPM;

        if (currentRPM < 5) {
            // Drop volume thresholds completely down when static layout patterns persist
            this.audio.gainNode.gain.setTargetAtTime(0, this.audio.context.currentTime, 0.1);
            this.audio.oscGain.gain.setTargetAtTime(0, this.audio.context.currentTime, 0.1);
        } else {
            // 1. Synthesize air displacement turbulence parameters (Brownian noise matrix pass)
            const targetWindVolume = 0.02 + (0.16 * Math.pow(rpmRatio, 1.5));
            this.audio.gainNode.gain.setTargetAtTime(targetWindVolume, this.audio.context.currentTime, 0.1);

            // Set filter ceiling values representing higher air velocity frequencies
            const lowFreqCutoff = 150;
            const highFreqCutoff = 650;
            const targetFilterFreq = lowFreqCutoff + ((highFreqCutoff - lowFreqCutoff) * rpmRatio);
            this.audio.biquadFilter.frequency.setTargetAtTime(targetFilterFreq, this.audio.context.currentTime, 0.15);

            // 2. Synthesize heavy structural engine core motor vibrations (sine oscillator frequency scaling)
            const targetMotorHumVolume = 0.005 + (0.025 * rpmRatio);
            this.audio.oscGain.gain.setTargetAtTime(targetMotorHumVolume, this.audio.context.currentTime, 0.1);
            
            const baseOscFreq = 30;
            const topOscFreq = 62;
            const currentOscFreq = baseOscFreq + ((topOscFreq - baseOscFreq) * rpmRatio);
            this.audio.lowOscillator.frequency.setTargetAtTime(currentOscFreq, this.audio.context.currentTime, 0.1);
        }
    }

    /**
     * Flushes physical interface variables cleanly out directly into CSS custom properties and text tokens
     */
    renderGraphics() {
        // Update DOM Telemetry text content blocks cleanly
        this.dom.rpmValue.innerText = Math.round(this.state.currentRPM);
        this.dom.telemetryAngle.innerText = `${this.state.oscillationAngle.toFixed(1)}°`;
        this.dom.telemetryLoad.innerText = `${Math.round(this.state.energyLoadPercent)}%`;

        // Update linear telemetry progress bar percentage width boundaries
        const progressWidth = (this.state.currentRPM / 1450) * 100;
        this.dom.rpmProgress.style.width = `${progressWidth}%`;

        // Pass continuous dynamic positioning degrees explicitly into hardware transform property layers
        this.dom.bladeContainer.style.setProperty('--fan-rotation-deg', `${this.state.currentRotationDegree}deg`);
        this.dom.assembly.style.setProperty('--fan-oscillation-deg', `${this.state.oscillationAngle}deg`);
    }
}

// Instantiate Hardware Simulation Routine on application payload initialization
document.addEventListener('DOMContentLoaded', () => {
    new FanSimulator();
});