// Map values to DOM selector target controls
const customTextInput = document.getElementById('customText');
const presetSelect = document.getElementById('stylePreset');
const textPreview = document.getElementById('textPreview');
const cssOutput = document.getElementById('cssOutput');
const copyBtn = document.getElementById('copyBtn');

// Typography Sliders
const fontSizeSlider = document.getElementById('fontSize');
const letterSpacingSlider = document.getElementById('letterSpacing');
const fontWeightSlider = document.getElementById('fontWeight');

// Shadow Customizer Sliders
const shadowXSlider = document.getElementById('shadowX');
const shadowYSlider = document.getElementById('shadowY');
const shadowBlurSlider = document.getElementById('shadowBlur');

// Preset Vector Rules Configuration Matrix
const PRESETS = {
  none: { x: 0, y: 0, blur: 0, color: 'transparent', textColor: '#ffffff' },
  neon: { x: 0, y: 0, blur: 15, color: '#ec4899', textColor: '#ffffff', multi: true },
  'retro-3d': { x: 4, y: 4, blur: 0, color: '#3b82f6', textColor: '#facc15', step3d: true },
  glitch: { x: -3, y: 0, blur: 0, color: '#06b6d4', textColor: '#fff', glitch: true }
};

/**
 * Updates the display string tags with their respective slider coordinates
 */
function updateLabel(id, value) {
  document.getElementById(`val${id}`).textContent = value;
}

/**
 * Calculates structural text attributes and updates display frame contexts 
 */
function updatePlayground() {
  const textValue = customTextInput.value || 'DESIGN';
  textPreview.textContent = textValue;

  const size = fontSizeSlider.value;
  const spacing = letterSpacingSlider.value;
  const weight = fontWeightSlider.value;

  const sX = parseInt(shadowXSlider.value, 10);
  const sY = parseInt(shadowYSlider.value, 10);
  const sBlur = parseInt(shadowBlurSlider.value, 10);
  const currentPreset = presetSelect.value;

  // Track Label numbers update
  updateLabel('Size', size);
  updateLabel('Spacing', spacing);
  updateLabel('Weight', weight);
  updateLabel('X', sX);
  updateLabel('Y', sY);
  updateLabel('Blur', sBlur);

  // Default Baseline Style assignments
  textPreview.style.fontSize = `${size}px`;
  textPreview.style.letterSpacing = `${spacing}px`;
  textPreview.style.fontWeight = weight;

  let shadowString = '';
  let activeTextColor = '#ffffff';

  // Handle preset algorithmic branching properties
  if (currentPreset === 'none') {
    shadowString = sX === 0 && sY === 0 && sBlur === 0 ? 'none' : `${sX}px ${sY}px ${sBlur}px rgba(255,255,255,0.2)`;
  } else if (currentPreset === 'neon') {
    activeTextColor = '#ffffff';
    shadowString = `0 0 ${sBlur}px #ec4899, 0 0 ${sBlur + 10}px #a855f7, 0 0 ${sBlur + 20}px #2563eb`;
  } else if (currentPreset === 'retro-3d') {
    activeTextColor = '#facc15';
    // Generate layered step shadows to produce smooth solid 3D extrusion blocks
    const layers = [];
    const limit = Math.max(Math.abs(sX), Math.abs(sY));
    const stepX = sX === 0 ? 0 : sX / limit;
    const stepY = sY === 0 ? 0 : sY / limit;

    for (let i = 1; i <= limit; i++) {
      layers.push(`${Math.round(stepX * i)}px ${Math.round(stepY * i)}px 0px #3b82f6`);
    }
    shadowString = layers.length > 0 ? layers.join(', ') : 'none';
  } else if (currentPreset === 'glitch') {
    activeTextColor = '#ffffff';
    shadowString = `${sX}px ${sY}px 0 #06b6d4, ${-sX}px ${-sY}px 0 #ef4444`;
  }

  textPreview.style.color = activeTextColor;
  textPreview.style.textShadow = shadowString;

  // Build out matching code snippets cleanly formatted
  let codeSnippet = `.text-effect {\n`;
  codeSnippet += `  font-size: ${size}px;\n`;
  codeSnippet += `  letter-spacing: ${spacing}px;\n`;
  codeSnippet += `  font-weight: ${weight};\n`;
  codeSnippet += `  color: ${activeTextColor};\n`;
  codeSnippet += `  text-shadow: ${shadowString};\n}`;

  cssOutput.textContent = codeSnippet;
}

/**
 * Syncs presets adjustments directly to slider controller metrics maps
 */
function applyPreset() {
  const selection = presetSelect.value;
  const config = PRESETS[selection];

  if (!config) return;

  if (selection === 'none') {
    shadowXSlider.value = 0;
    shadowYSlider.value = 0;
    shadowBlurSlider.value = 0;
  } else if (selection === 'neon') {
    shadowXSlider.value = 0;
    shadowYSlider.value = 0;
    shadowBlurSlider.value = 15;
  } else if (selection === 'retro-3d') {
    shadowXSlider.value = 6;
    shadowYSlider.value = 6;
    shadowBlurSlider.value = 0;
  } else if (selection === 'glitch') {
    shadowXSlider.value = -3;
    shadowYSlider.value = 1;
    shadowBlurSlider.value = 0;
  }

  updatePlayground();
}

// --- Interaction Clipboard Copy Logic ---
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(cssOutput.textContent).then(() => {
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');

    setTimeout(() => {
      copyBtn.textContent = 'Copy Code';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
});

// --- Dynamic Event Listener Registrations ---
const inputs = [
  customTextInput, presetSelect, fontSizeSlider, 
  letterSpacingSlider, fontWeightSlider, 
  shadowXSlider, shadowYSlider, shadowBlurSlider
];

inputs.forEach(input => input.addEventListener('input', updatePlayground));
presetSelect.addEventListener('change', applyPreset);

// Initial application boot kickstart
applyPreset();