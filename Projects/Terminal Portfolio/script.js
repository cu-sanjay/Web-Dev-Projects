(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#matrixCanvas');
  const ctx = canvas.getContext('2d');
  const termBody = $('#termBody');
  const termInput = $('#termInput');
  const terminal = $('#terminal-container');

  let matrixBright = false;
  let historyStack = [];
  let historyIdx = -1;

  /* ─── MATRIX RAIN ─── */
  let drops = [];
  let cols = 0;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;

    cols = Math.floor(w / 12);
    drops = [];
    for (let i = 0; i < cols; i++) {
      drops.push({ y: Math.random() * h, speed: 0.5 + Math.random() * 2, len: 5 + Math.floor(Math.random() * 15) });
    }
  }

  function drawMatrix() {
    const w = canvas._w, h = canvas._h;
    ctx.fillStyle = 'rgba(5,6,11,0.05)';
    ctx.fillRect(0, 0, w, h);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const x = i * 12;
      for (let j = 0; j < d.len; j++) {
        const yy = d.y - j * 12;
        if (yy < -12 || yy > h + 12) continue;
        const alpha = 1 - (j / d.len);
        ctx.fillStyle = 'rgba(51,255,102,' + (alpha * 0.6) + ')';
        ctx.font = '10px "Courier New",monospace';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, yy);
      }
      d.y += d.speed;
      if (d.y - d.len * 12 > h) {
        d.y = -d.len * 12;
        d.speed = 0.5 + Math.random() * 2;
        d.len = 5 + Math.floor(Math.random() * 15);
      }
    }
  }

  function matrixLoop() {
    drawMatrix();
    requestAnimationFrame(matrixLoop);
  }

  /* ─── COMMANDS ─── */
  const COMMANDS = {
    help: function() {
      return [
        { text: 'Available commands:', type: 'info' },
        { text: '  about    — biographical profile', type: 'output' },
        { text: '  skills   — technical skill matrix', type: 'output' },
        { text: '  projects — open-source portfolio', type: 'output' },
        { text: '  matrix   — toggle rain intensity', type: 'output' },
        { text: '  clear    — flush terminal buffer', type: 'output' },
        { text: '  sudo     — escalation prank', type: 'output' }
      ];
    },
    about: function() {
      return [
        { text: '┌── BIOGRAPHICAL PROFILE ───────────────', type: 'highlight' },
        { text: '│ Name:    Girish Madarkar', type: 'output' },
        { text: '│ Age:     20', type: 'output' },
        { text: '│ Field:   Computer Engineering', type: 'output' },
        { text: '│ CGPA:    9.8 / 10.0', type: 'output' },
        { text: '│ Focus:   Full-Stack Systems, UI/UX', type: 'output' },
        { text: '└────────────────────────────────────────', type: 'highlight' }
      ];
    },
    skills: function() {
      return [
        { text: '┌── TECHNICAL SKILL MATRIX ─────────────', type: 'highlight' },
        { text: '│ Full-Stack Engineering', type: 'output' },
        { text: '│   ├─ React · TypeScript · Tailwind', type: 'dim' },
        { text: '│   └─ Python · Node.js · PostgreSQL', type: 'dim' },
        { text: '│ UI/UX Design', type: 'output' },
        { text: '│   └─ Figma · Prototyping · HCI', type: 'dim' },
        { text: '│ Core CS', type: 'output' },
        { text: '│   └─ DBMS · OOP · DSA · OS', type: 'dim' },
        { text: '└────────────────────────────────────────', type: 'highlight' }
      ];
    },
    projects: function() {
      return [
        { text: '┌── OPEN-SOURCE PROJECTS ───────────────', type: 'highlight' },
        { text: '│ SmartAttend', type: 'output' },
        { text: '│   └─ AI-based attendance system', type: 'dim' },
        { text: '│ CivicArch AI', type: 'output' },
        { text: '│   └─ Urban planning intelligence', type: 'dim' },
        { text: '│ NSOC Level-3 Animation Tools', type: 'output' },
        { text: '│   └─ Network security visualization', type: 'dim' },
        { text: '│ Terminal Portfolio (this)', type: 'output' },
        { text: '│   └─ Retro shell command center', type: 'dim' },
        { text: '└────────────────────────────────────────', type: 'highlight' }
      ];
    },
    matrix: function() {
      matrixBright = !matrixBright;
      $('#matrixCanvas').classList.toggle('bright', matrixBright);
      return [
        { text: matrixBright ? '[MATRIX] Rain intensity: HIGH' : '[MATRIX] Rain intensity: LOW', type: 'info' }
      ];
    },
    clear: function() {
      termBody.innerHTML = '';
      return [];
    },
    sudo: function() {
      return [
        { text: 'Nice try. You are not in the sudoers file.', type: 'error' },
        { text: 'This incident will be reported.', type: 'dim' }
      ];
    }
  };

  function getCommand(cmd) {
    return COMMANDS[cmd];
  }

  /* ─── TYPING ANIMATION ─── */
  async function typeLine(text, cls, delay) {
    return new Promise(resolve => {
      const div = document.createElement('div');
      div.className = 'log-line typing ' + (cls || 'output');
      div.dataset.fullText = text;
      div.textContent = '';
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;

      let idx = 0;
      function step() {
        if (idx >= text.length) {
          div.classList.remove('typing');
          div.textContent = text;
          resolve();
          return;
        }
        div.textContent = text.slice(0, idx + 1);
        idx++;
        termBody.scrollTop = termBody.scrollHeight;
        setTimeout(step, delay || 6);
      }
      step();
    });
  }

  function appendLine(text, cls) {
    const div = document.createElement('div');
    div.className = 'log-line ' + (cls || 'output');
    div.textContent = text;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  /* ─── PROCESS COMMAND ─── */
  async function processCommand(input) {
    const trimmed = input.trim();
    const cmd = trimmed.toLowerCase().split(/\s+/)[0];

    if (!cmd) return;

    historyStack.push(trimmed);
    historyIdx = historyStack.length;

    const fn = getCommand(cmd);
    if (!fn) {
      appendLine('guest@girish:~$ ' + trimmed, 'dim');
      appendLine('command not found: ' + cmd + '. Type help for commands.', 'error');
      return;
    }

    appendLine('guest@girish:~$ ' + trimmed, 'dim');
    const result = fn();

    if (cmd === 'clear') return;

    for (const line of result) {
      await typeLine(line.text, line.type, 4);
    }
  }

  /* ─── INPUT HANDLER ─── */
  termInput.addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
      const val = this.value;
      this.value = '';
      await processCommand(val);
      termBody.scrollTop = termBody.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyStack.length === 0) return;
      historyIdx = Math.max(0, historyIdx - 1);
      this.value = historyStack[historyIdx] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyStack.length === 0) return;
      historyIdx = Math.min(historyStack.length, historyIdx + 1);
      this.value = historyStack[historyIdx] || '';
    }
  });

  /* ─── AUTO-FOCUS ─── */
  terminal.addEventListener('click', function() {
    termInput.focus();
  });

  /* ─── RESIZE ─── */
  let resizeTm;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTm);
    resizeTm = setTimeout(resizeCanvas, 100);
  });

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    matrixLoop();
    termInput.focus();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
