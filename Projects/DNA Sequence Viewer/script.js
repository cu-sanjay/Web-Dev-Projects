(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#helixCanvas');
  const ctx = canvas.getContext('2d');
  const seqInput = $('#seqInput');
  const sliderSpeed = $('#sliderSpeed');
  const valSpeed = $('#valSpeed');
  const btnAnalyze = $('#btnAnalyze');
  const btnTranscribe = $('#btnTranscribe');
  const btnOrf = $('#btnOrf');
  const btnFlush = $('#btnFlush');
  const lenVal = $('#lenVal');
  const gcVal = $('#gcVal');
  const orfVal = $('#orfVal');
  const topBadge = $('#topBadge');
  const baseGrid = $('#baseGrid');
  const gridCount = $('#gridCount');
  const teleLen = $('#teleLen');
  const teleGc = $('#teleGc');
  const teleA = $('#teleA');
  const teleT = $('#teleT');
  const teleC = $('#teleC');
  const teleG = $('#teleG');
  const teleMrna = $('#teleMrna');
  const toastContainer = $('#toastContainer');
  const presetBtns = $$('.preset-btn');

  /* ─── PRESETS ─── */
  const PRESETS = {
    insulin: {
      label: 'Human Insulin Exon',
      seq: 'ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGGGAGGCAGAGGACCTGCAGGTGGGGCAGGTGGAGCTGGGCGGGGGCCCTGGTGCAGGCAGCCTGCAGCCCTTGGCCCTGGAGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGTACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAACTAG'
    },
    phage: {
      label: 'Bacteriophage Vector',
      seq: 'GATCCCCGGGTACCGAGCTCGAATTCGTACCGATCGATCTCTAGAGTCGACCTGCAGGCATGCAAGCTTGGCACTGGCCGTCGTTTTACAACGTCGTGACTGGGAAAACCCTGGCGTTACCCAACTTAATCGCCTTGCAGCACATCCCCCTTTCGCCAGCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCCTGATGCGGTATTTTCTCCTTACGCATCTGTGCGGTATTTCACACCGCATATGGTGCACTCTCAGTACAATCTGCTCTGATGCCGCATAGTTAAGCCAGCCCCGACACCCGCCAACACCCGCTGACGCGCCCTGACGGGCTTGTCTGCTCCCGGCATCCGCTTACAGACAAGCTGTGACCGTCTCCGGGAGCTGCATGTGTCAGAGGTTTTCACCGTCATCACCGAAACGCGCGA'
    },
    crispr: {
      label: 'CRISPR Target Space',
      seq: 'ATGGATAAGAAATACTCAATAGGCTTAGATATCGGCACAAATAGCGTCGGATGGGCGGTGATCACTGATGATTATAAGTTACCGTCTAAAAAATTTACGGTTCTTGGGAATACAGACAGTGAGTCGATGAGAGCTTTGTTCCACGATGGCTTTTCGTGTGAACTTAAGCTGTTGAGATCCATTTTTGTGGACAATGACAGTAAGGATGCGAACATCATAAAGCTGGTCGGAACCGGTGCCTATAGTGAAAGAAAGAACATCATCGGATCGCGGCACGGTGAGGATTTTTTGCATTATGCCGACATAAGCGAGATGTACGGTCTTAATCCTGAACTTATCGTCCAATACAACTTGTTACAAAATATTAACCGG'
    }
  };

  let filteredSeq = '';
  let time = 0;
  let animId = null;

  /* ─── PRESET LOADER ─── */
  presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      presetBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const p = PRESETS[this.dataset.preset];
      if (!p) return;
      seqInput.value = p.seq;
      runAnalysis();
      showToast('[PRESET] Loaded: ' + p.label, '#33cc66');
    });
  });

  /* ─── SEQUENCE FILTER ─── */
  function filterSequence(raw) {
    return raw.toUpperCase().replace(/[^ATCG]/g, '');
  }

  /* ─── ANALYSIS ─── */
  function runAnalysis() {
    const raw = seqInput.value || '';
    filteredSeq = filterSequence(raw);
    if (filteredSeq.length !== raw.length && raw.length > 0) {
      showToast('[WARN] Non-nucleotide characters stripped (A/T/C/G only)', '#ffb800');
    }
    seqInput.value = filteredSeq;

    const len = filteredSeq.length;
    const counts = { A: 0, T: 0, C: 0, G: 0 };
    for (const ch of filteredSeq) counts[ch]++;

    const gc = len > 0 ? ((counts.C + counts.G) / len * 100) : 0;

    lenVal.textContent = len;
    gcVal.textContent = gc.toFixed(1);
    teleLen.textContent = len + ' bp';
    teleGc.textContent = gc.toFixed(2) + '%';
    teleA.textContent = counts.A;
    teleT.textContent = counts.T;
    teleC.textContent = counts.C;
    teleG.textContent = counts.G;
    gridCount.textContent = len;
    topBadge.textContent = len > 0 ? len + ' bp' : 'STANDBY';

    renderBaseGrid(filteredSeq);
    teleMrna.textContent = '--';
    orfVal.textContent = '--';

    if (len > 0) showToast('[ANALYSIS] ' + len + ' bp | GC: ' + gc.toFixed(1) + '%', '#33cc66');
  }

  /* ─── BASE GRID ─── */
  function renderBaseGrid(seq) {
    baseGrid.innerHTML = '';
    if (!seq) { gridCount.textContent = '0'; return; }

    /* show first 600 bases to avoid massive DOM */
    const display = seq.slice(0, 600);
    for (const ch of display) {
      const el = document.createElement('span');
      el.className = 'base-token base-' + ch;
      el.textContent = ch;
      baseGrid.appendChild(el);
    }
    if (seq.length > 600) {
      const more = document.createElement('span');
      more.className = 'base-token base-empty';
      more.textContent = '... +' + (seq.length - 600) + ' more';
      baseGrid.appendChild(more);
    }
  }

  /* ─── TRANSCRIPTION ─── */
  function transcribe() {
    if (!filteredSeq) { showToast('[WARN] No sequence loaded — paste or load a preset first', '#ffb800'); return; }
    const map = { A: 'U', T: 'A', C: 'G', G: 'C' };
    const mrna = filteredSeq.split('').map(ch => map[ch] || '').join('');
    teleMrna.textContent = mrna;
    showToast('[TRANSCRIBE] mRNA transcript generated (' + mrna.length + ' bases)', '#00e5ff');
  }

  /* ─── ORF VALIDATION ─── */
  function validateOrf() {
    if (!filteredSeq) { showToast('[WARN] No sequence loaded', '#ffb800'); return; }
    const seq = filteredSeq;
    const start = seq.indexOf('ATG');
    if (start === -1) {
      orfVal.textContent = 'NO START';
      showToast('[ORF] No start codon (ATG) found', '#ff1744');
      return;
    }
    let end = -1;
    const stops = ['TAG', 'TAA', 'TGA'];
    for (let i = start + 3; i <= seq.length - 3; i += 3) {
      const codon = seq.substr(i, 3);
      if (stops.includes(codon)) { end = i; break; }
    }
    if (end === -1) {
      orfVal.textContent = 'OPEN (no stop)';
      showToast('[ORF] ORF open — start at ' + (start + 1) + ', no stop codon found', '#ffb800');
      return;
    }
    const len = end - start + 3;
    orfVal.textContent = (start + 1) + '-' + (end + 3) + ' (' + (len / 3) + ' aa)';
    showToast('[ORF] Valid ORF: ' + (start + 1) + '–' + (end + 3) + ' (' + (len / 3) + ' codons)', '#00e676');
  }

  /* ─── CANVAS DOUBLE HELIX ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 300;
    const h = Math.max(220, Math.min(380, w * 0.55));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  function drawHelix(time) {
    const w = canvas._w;
    const h = canvas._h;
    ctx.clearRect(0, 0, w, h);

    if (!filteredSeq) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Paste sequence or load a preset', w/2, h/2);
      return;
    }

    const cx = w / 2;
    const speed = parseFloat(sliderSpeed.value) || 60;
    const phase = (time * speed * 0.0003) % (Math.PI * 2);

    /* scale strands to fit content */
    const seqLen = Math.min(filteredSeq.length, 80);
    const spacing = Math.min(14, Math.max(6, (h - 30) / Math.max(1, seqLen)));
    const startY = 15;
    const amp = Math.min(cx - 20, 60);

    const used = Math.min(filteredSeq.length, seqLen);

    for (let i = 0; i < used; i++) {
      const y = startY + i * spacing;
      const offset = i * 0.5;
      const angle = phase + offset * 0.3;

      const x1 = cx + Math.sin(angle) * amp;
      const x2 = cx + Math.sin(angle + Math.PI) * amp;

      const base = filteredSeq[i];

      /* base pair link */
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = getBaseColor(base, 0.15);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      /* strands */
      ctx.fillStyle = getBaseColor(base, 0.6);
      ctx.beginPath(); ctx.arc(x1, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x2, y, 3, 0, Math.PI * 2); ctx.fill();

      /* base letter */
      ctx.fillStyle = getBaseColor(base, 0.9);
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(base, x1, y);
      ctx.fillText(complement(base), x2, y);
    }

    /* backbone traces */
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      for (let i = 0; i < used; i++) {
        const y = startY + i * spacing;
        const offset = i * 0.5;
        const angle = phase + offset * 0.3;
        const x = pass === 0
          ? cx + Math.sin(angle) * amp
          : cx + Math.sin(angle + Math.PI) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    /* labels */
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.font = '4.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('5\'', 4, 2);
    ctx.textAlign = 'right';
    ctx.fillText('3\'', w - 4, 2);
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('3\'', 4, h - 2);
    ctx.textAlign = 'right';
    ctx.fillText('5\'', w - 4, h - 2);
  }

  function getBaseColor(base, alpha) {
    const colors = { A: '#ff3366', T: '#ffcc00', C: '#33cc66', G: '#3399ff' };
    const c = colors[base] || '#8892a8';
    return c;
  }

  function complement(base) {
    const map = { A: 'T', T: 'A', C: 'G', G: 'C' };
    return map[base] || '';
  }

  function animateHelix() {
    time++;
    drawHelix(time);
    animId = requestAnimationFrame(animateHelix);
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    filteredSeq = '';
    time = 0;
    seqInput.value = '';
    lenVal.textContent = '0';
    gcVal.textContent = '--';
    orfVal.textContent = '--';
    topBadge.textContent = 'STANDBY';
    teleLen.textContent = '0';
    teleGc.textContent = '--';
    teleA.textContent = '0';
    teleT.textContent = '0';
    teleC.textContent = '0';
    teleG.textContent = '0';
    teleMrna.textContent = '--';
    gridCount.textContent = '0';
    baseGrid.innerHTML = '';
    presetBtns.forEach(b => b.classList.remove('active'));
    sliderSpeed.value = 60;
    valSpeed.textContent = '60';
    showToast('[FLUSH] Sequence matrix cleared — cache purged', '#8892a8');
  }

  /* ─── EVENT BINDINGS ─── */
  sliderSpeed.addEventListener('input', function() {
    valSpeed.textContent = this.value;
  });

  btnAnalyze.addEventListener('click', runAnalysis);
  btnTranscribe.addEventListener('click', transcribe);
  btnOrf.addEventListener('click', validateOrf);
  btnFlush.addEventListener('click', flushAll);

  seqInput.addEventListener('input', function() {
    /* live filter on paste/type */
    setTimeout(() => {
      const filtered = filterSequence(this.value);
      if (filtered !== this.value) {
        this.value = filtered;
      }
    }, 0);
  });

  seqInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) runAnalysis();
  });

  window.addEventListener('resize', () => { resizeCanvas(); });

  /* ─── TOAST ─── */
  function showToast(msg, color) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    if (color) el.style.borderLeft = '3px solid ' + color;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
    }, 3500);
  }

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    animateHelix();
    /* load default preset */
    document.querySelector('.preset-btn[data-preset="insulin"]').click();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
