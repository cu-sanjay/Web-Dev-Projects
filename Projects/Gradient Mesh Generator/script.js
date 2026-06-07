const colorPickers = [
  document.getElementById('color-1'),
  document.getElementById('color-2'),
  document.getElementById('color-3'),
  document.getElementById('color-4'),
];

const hexInputs = [
  document.getElementById('hex-1'),
  document.getElementById('hex-2'),
  document.getElementById('hex-3'),
  document.getElementById('hex-4'),
];

const meshContainer = document.getElementById('mesh-container');
const cssOutput = document.getElementById('css-output');
const randomizeBtn = document.getElementById('randomize-btn');
const copyBtn = document.getElementById('copy-btn');

function buildMeshCSS(colors) {
  return (
    `radial-gradient(circle at 0% 0%, ${colors[0]} 0%, transparent 70%),` +
    `radial-gradient(circle at 100% 0%, ${colors[1]} 0%, transparent 70%),` +
    `radial-gradient(circle at 0% 100%, ${colors[2]} 0%, transparent 70%),` +
    `radial-gradient(circle at 100% 100%, ${colors[3]} 0%, transparent 70%)`
  );
}

function getColors() {
  return colorPickers.map(function (picker) {
    return picker.value;
  });
}

function update() {
  const colors = getColors();

  for (var i = 0; i < 4; i++) {
    hexInputs[i].value = colors[i];
  }

  const css = buildMeshCSS(colors);
  meshContainer.style.backgroundImage = css;
  cssOutput.value = 'background-image:\n  ' + css + ';';
}

function syncHexToPicker(hexInput, picker) {
  var val = hexInput.value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    picker.value = val;
    update();
  }
}

function randomHex() {
  var chars = '0123456789abcdef';
  var hex = '#';
  for (var i = 0; i < 6; i++) {
    hex += chars[Math.floor(Math.random() * 16)];
  }
  return hex;
}

function randomizePalette() {
  for (var i = 0; i < 4; i++) {
    colorPickers[i].value = randomHex();
  }
  update();
}

for (var i = 0; i < 4; i++) {
  (function (index) {
    colorPickers[index].addEventListener('input', update);

    hexInputs[index].addEventListener('input', function () {
      syncHexToPicker(hexInputs[index], colorPickers[index]);
    });
  })(i);
}

randomizeBtn.addEventListener('click', randomizePalette);

copyBtn.addEventListener('click', function () {
  cssOutput.select();
  navigator.clipboard.writeText(cssOutput.value);
  copyBtn.textContent = 'Copied!';
  copyBtn.classList.add('copied');
  setTimeout(function () {
    copyBtn.textContent = 'Copy Code';
    copyBtn.classList.remove('copied');
  }, 2000);
});

update();
