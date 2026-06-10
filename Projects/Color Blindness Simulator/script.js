// ============================================================
//  COLOR BLINDNESS SIMULATOR — Core Engine
//  SVG feColorMatrix filter switchboard + scientific telemetry
// ============================================================

// ─── VISION PROFILE DATABASE ───────────────────────────────

const VISION_PROFILES = {
  normal: {
    label: 'None (Trichromacy)',
    prevalence: '~100% of population',
    receptor: 'None — all cones active',
    axis: '—',
    access: 'PASS — Full color differentiation',
    accessClass: 'telem-access-ok',
    filter: 'url(#vision-normal)',
    filterLabel: 'NONE (IDENTITY)',
  },
  protanopia: {
    label: 'Protanopia (L-cone deficit)',
    prevalence: '~2.5% of males / ~0.05% of females',
    receptor: 'L-cones (long-wavelength / red)',
    axis: 'Red-Green (L-M confusion)',
    access: 'FAIL — Red/green differentiation severely impaired',
    accessClass: 'telem-access-fail',
    filter: 'url(#vision-protanopia)',
    filterLabel: 'PROTANOPIA (RED-BLIND)',
  },
  deuteranopia: {
    label: 'Deuteranopia (M-cone deficit)',
    prevalence: '~6.0% of males / ~0.4% of females',
    receptor: 'M-cones (medium-wavelength / green)',
    axis: 'Red-Green (M-L confusion)',
    access: 'FAIL — Green/red differentiation severely impaired',
    accessClass: 'telem-access-fail',
    filter: 'url(#vision-deuteranopia)',
    filterLabel: 'DEUTERANOPIA (GREEN-BLIND)',
  },
  tritanopia: {
    label: 'Tritanopia (S-cone deficit)',
    prevalence: '~0.05% of population (equal sex ratio)',
    receptor: 'S-cones (short-wavelength / blue)',
    axis: 'Blue-Yellow (S-LM confusion)',
    access: 'FAIL — Blue/yellow differentiation impaired',
    accessClass: 'telem-access-fail',
    filter: 'url(#vision-tritanopia)',
    filterLabel: 'TRITANOPIA (BLUE-BLIND)',
  },
  achromatopsia: {
    label: 'Achromatopsia (Monochromacy)',
    prevalence: '~0.003% of population (~1 in 33,000)',
    receptor: 'All cones — no functional photopigment',
    axis: 'All axes (complete desaturation)',
    access: 'CRITICAL — No color differentiation possible',
    accessClass: 'telem-access-fail',
    filter: 'url(#vision-achromatopsia)',
    filterLabel: 'ACHROMATOPSIA (MONOCHROMACY)',
  },
};

// ─── STATE ──────────────────────────────────────────────────

const state = {
  activeVision: 'normal',
  axisGuideVisible: false,
};

// ─── DOM REFS ───────────────────────────────────────────────

const simStage = document.getElementById('simulation-stage');
const simFilter = document.getElementById('sim-filter');
const visionBtns = document.querySelectorAll('.vision-btn');
const telemDeficit = document.getElementById('telem-deficit');
const telemPrevalence = document.getElementById('telem-prevalence');
const telemReceptor = document.getElementById('telem-receptor');
const telemAxis = document.getElementById('telem-axis');
const telemAccess = document.getElementById('telem-access');
const btnAxisGuide = document.getElementById('btn-axis-guide');
const btnReset = document.getElementById('btn-reset');
const confusionZone = document.getElementById('confusion-zone');

// ─── FILTER SWITCHBOARD ────────────────────────────────────

function setVisionProfile(profileKey) {
  const profile = VISION_PROFILES[profileKey];
  if (!profile) return;

  state.activeVision = profileKey;

  // Apply SVG filter to simulation stage
  simStage.style.filter = profile.filter;
  simFilter.textContent = 'FILTER: ' + profile.filterLabel;

  // Update button states
  visionBtns.forEach(btn => {
    const key = btn.dataset.vision;
    btn.classList.toggle('active', key === profileKey);
  });

  // Update telemetry with animation
  updateTelemetry(profile);

  // Toggle confusion zone highlight
  if (profileKey !== 'normal') {
    confusionZone.classList.add('highlight');
  } else {
    confusionZone.classList.remove('highlight');
  }
}

// ─── TELEMETRY UPDATER ─────────────────────────────────────

function updateTelemetry(profile) {
  telemDeficit.textContent = profile.label;
  telemPrevalence.textContent = profile.prevalence;
  telemReceptor.textContent = profile.receptor;
  telemAxis.textContent = profile.axis;

  telemAccess.textContent = profile.access;
  telemAccess.className = 'telem-value ' + profile.accessClass;

  // Trigger CSS transition by removing and re-adding
  [telemDeficit, telemPrevalence, telemReceptor, telemAxis, telemAccess].forEach(el => {
    el.style.transition = 'none';
    el.style.opacity = '0.4';
    requestAnimationFrame(() => {
      el.style.transition = 'all 0.25s var(--ease-out-expo)';
      el.style.opacity = '1';
    });
  });
}

// ─── VISION BUTTON CLICK HANDLERS ──────────────────────────

visionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const profileKey = btn.dataset.vision;
    if (state.activeVision === profileKey) return;
    setVisionProfile(profileKey);
  });
});

// ─── ACTION BUTTONS ────────────────────────────────────────

btnAxisGuide.addEventListener('click', () => {
  state.axisGuideVisible = !state.axisGuideVisible;
  btnAxisGuide.classList.toggle('active');

  if (state.axisGuideVisible) {
    confusionZone.classList.add('highlight');
    confusionZone.style.transition = 'box-shadow 0.3s var(--ease-out-expo)';
    confusionZone.style.boxShadow = '0 0 20px rgba(239,68,68,0.15), inset 0 0 20px rgba(239,68,68,0.05)';
  } else {
    confusionZone.style.boxShadow = 'none';
    if (state.activeVision === 'normal') {
      confusionZone.classList.remove('highlight');
    }
  }
});

btnReset.addEventListener('click', () => {
  setVisionProfile('normal');
  if (state.axisGuideVisible) {
    state.axisGuideVisible = false;
    btnAxisGuide.classList.remove('active');
    confusionZone.style.boxShadow = 'none';
  }
});

// ─── INIT ───────────────────────────────────────────────────

function init() {
  setVisionProfile('normal');
}

init();
