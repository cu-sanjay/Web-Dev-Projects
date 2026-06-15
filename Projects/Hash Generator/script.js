(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── DOM REFS ─── */
  const msgInput = $('#msgInput');
  const md5Output = $('#md5Output');
  const sha1Output = $('#sha1Output');
  const sha256Output = $('#sha256Output');
  const tChars = $('#tChars');
  const tBytes = $('#tBytes');
  const tWidth = $('#tWidth');
  const tAvalanche = $('#tAvalanche');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const latencySlider = $('#latencySlider');
  const latencyVal = $('#latencyVal');
  const avlPrev = $('#avlPrev');
  const avlCurr = $('#avlCurr');
  const avlDiff = $('#avlDiff');
  const avlBar = $('#avlBar');
  const btnExecute = $('#btnExecute');
  const btnAvalanche = $('#btnAvalanche');
  const btnFlush = $('#btnFlush');
  const presetDb = $('#presetDb');
  const presetApi = $('#presetApi');
  const presetSys = $('#presetSys');

  /* ─── STATE ─── */
  let previousDigest = '';
  let currentHashes = { md5: '', sha1: '', sha256: '' };

  /* ─── LATENCY SLIDER ─── */
  latencySlider.addEventListener('input', () => {
    latencyVal.textContent = latencySlider.value + 'ms';
  });

  /* ─── PURE JS MD5 (dependency-free) ─── */
  /* classic MD5 implementation, RFC 1321 */
  const MD5 = (function() {
    const S = [
      7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
      5, 9,14,20, 5, 9,14,20, 5, 9,14,20, 5, 9,14,20,
      4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
      6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21
    ];
    const T = new Array(64);
    for (let i = 0; i < 64; i++) {
      T[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
    }

    function F(x, y, z) { return (x & y) | (~x & z); }
    function G(x, y, z) { return (x & z) | (y & ~z); }
    function H(x, y, z) { return x ^ y ^ z; }
    function I(x, y, z) { return y ^ (x | ~z); }
    function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }

    function FF(a, b, c, d, x, s, t) {
      return (b + rotl((a + F(b, c, d) + x + t) >>> 0, s)) >>> 0;
    }
    function GG(a, b, c, d, x, s, t) {
      return (b + rotl((a + G(b, c, d) + x + t) >>> 0, s)) >>> 0;
    }
    function HH(a, b, c, d, x, s, t) {
      return (b + rotl((a + H(b, c, d) + x + t) >>> 0, s)) >>> 0;
    }
    function II(a, b, c, d, x, s, t) {
      return (b + rotl((a + I(b, c, d) + x + t) >>> 0, s)) >>> 0;
    }

    function strToWords(s) {
      const bytes = [];
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if (c < 0x80) bytes.push(c);
        else if (c < 0x800) { bytes.push(0xc0 | (c >> 6)); bytes.push(0x80 | (c & 0x3f)); }
        else if (c < 0xd800 || c >= 0xe000) { bytes.push(0xe0 | (c >> 12)); bytes.push(0x80 | ((c >> 6) & 0x3f)); bytes.push(0x80 | (c & 0x3f)); }
        else { i++; const c2 = s.charCodeAt(i); const cp = ((c & 0x3ff) << 10) + (c2 & 0x3ff) + 0x10000; bytes.push(0xf0 | (cp >> 18)); bytes.push(0x80 | ((cp >> 12) & 0x3f)); bytes.push(0x80 | ((cp >> 6) & 0x3f)); bytes.push(0x80 | (cp & 0x3f)); }
      }
      const lenBits = bytes.length * 8;
      bytes.push(0x80);
      while ((bytes.length * 8) % 512 !== 448) bytes.push(0);
      for (let i = 0; i < 8; i++) bytes.push((lenBits >>> (i * 8)) & 0xff);
      const words = [];
      for (let i = 0; i < bytes.length; i += 4) {
        words.push((bytes[i] | (bytes[i+1] << 8) | (bytes[i+2] << 16) | (bytes[i+3] << 24)) >>> 0);
      }
      return words;
    }

    return function md5(str) {
      const words = strToWords(str);
      let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
      for (let i = 0; i < words.length; i += 16) {
        let a = a0, b = b0, c = c0, d = d0;
        for (let j = 0; j < 64; j++) {
          let f, g;
          if (j < 16) { f = F(b, c, d); g = j; }
          else if (j < 32) { f = G(b, c, d); g = (5 * j + 1) % 16; }
          else if (j < 48) { f = H(b, c, d); g = (3 * j + 5) % 16; }
          else { f = I(b, c, d); g = (7 * j) % 16; }
          const temp = d;
          d = c;
          c = b;
          b = (b + rotl((a + f + T[j] + words[i + g]) >>> 0, S[j])) >>> 0;
          a = temp;
        }
        a0 = (a0 + a) >>> 0;
        b0 = (b0 + b) >>> 0;
        c0 = (c0 + c) >>> 0;
        d0 = (d0 + d) >>> 0;
      }
      function toHex(n) { return ((n >>> 0) & 0xffffffff).toString(16).padStart(8, '0'); }
      return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
    };
  })();

  /* ─── WEB CRYPTO DIGESTS ─── */
  async function shaDigest(algorithm, text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ─── SLEEP FOR LATENCY ─── */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ─── MAIN COMPUTE ─── */
  async function computeAll(text) {
    if (!text) {
      md5Output.textContent = '<awaiting input>';
      md5Output.classList.remove('active');
      sha1Output.textContent = '<awaiting input>';
      sha1Output.classList.remove('active');
      sha256Output.textContent = '<awaiting input>';
      sha256Output.classList.remove('active');
      updateTelemetry(0, 0, 0);
      return;
    }

    const latency = parseInt(latencySlider.value);

    /* MD5 (synchronous, but we delay) */
    if (latency > 0) await sleep(latency);
    const md5 = MD5(text);
    md5Output.textContent = md5;
    md5Output.classList.add('active');

    /* SHA-1 */
    if (latency > 0) await sleep(latency);
    const sha1 = await shaDigest('SHA-1', text);
    sha1Output.textContent = sha1;
    sha1Output.classList.add('active');

    /* SHA-256 */
    if (latency > 0) await sleep(latency);
    const sha256 = await shaDigest('SHA-256', text);
    sha256Output.textContent = sha256;
    sha256Output.classList.add('active');

    /* store for avalanche */
    currentHashes = { md5, sha1, sha256 };

    updateTelemetry(text.length, new TextEncoder().encode(text).length, sha256.length * 4);
    tBadge.className = 'tele-badge valid';
    tBadge.textContent = '[ DIGEST TRACKING: INTEGRITY SECURE ]';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';

    /* compute avalanche against previous */
    computeAvalanche(md5, previousDigest);
    previousDigest = md5;
  }

  /* ─── UPDATE TELEMETRY ─── */
  function updateTelemetry(chars, bytes, bits) {
    tChars.textContent = chars;
    tBytes.textContent = bytes + ' B';
    tWidth.textContent = bits + 'b';
  }

  /* ─── AVALANCHE COMPUTATION ─── */
  function computeAvalanche(current, prev) {
    if (!prev || !current || prev === current) {
      avlPrev.textContent = prev || '--';
      avlCurr.textContent = current || '--';
      avlDiff.textContent = '0.00%';
      avlBar.style.width = '0%';
      tAvalanche.textContent = '0.00%';
      return;
    }

    avlPrev.textContent = prev;
    avlCurr.textContent = current;

    let diffBits = 0;
    const maxLen = Math.max(prev.length, current.length);
    for (let i = 0; i < maxLen; i++) {
      const c1 = prev[i] || '0';
      const c2 = current[i] || '0';
      const xor = parseInt(c1, 16) ^ parseInt(c2, 16);
      /* count bits in xor */
      for (let b = 0; b < 4; b++) {
        if ((xor >> b) & 1) diffBits++;
      }
    }

    const totalBits = maxLen * 4;
    const pct = (diffBits / totalBits) * 100;
    avlDiff.textContent = diffBits + ' / ' + totalBits + ' bits (' + pct.toFixed(2) + '%)';
    avlBar.style.width = Math.min(pct, 100) + '%';
    tAvalanche.textContent = pct.toFixed(2) + '%';
  }

  /* ─── COPY HANDLERS ─── */
  $$('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const el = $('#' + targetId);
      if (!el || !el.textContent || el.textContent.startsWith('<')) return;
      navigator.clipboard.writeText(el.textContent).then(() => {
        btn.textContent = 'COPIED';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'COPY';
          btn.classList.remove('copied');
        }, 1200);
      }).catch(() => {});
    });
  });

  /* ─── PRESETS ─── */
  const PRESETS = {
    db: 'postgresql://admin:REPLACE_WITH_REAL_CRED@prod-db-01.internal:5432/main?sslmode=verify-full&pool_size=25',
    api: 'POST /api/v2/orders HTTP/1.1\nHost: api.gateway.io\nAuthorization: Bearer REPLACE_WITH_REAL_TOKEN\nX-Timestamp: 1718467200\nX-Signature: HMAC-SHA256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    sys: '{\n  "service": "auth-gateway",\n  "version": "3.2.1",\n  "region": "us-east-1",\n  "replicas": 6,\n  "features": {\n    "mtls": true,\n    "hsm": false,\n    "rate_limit": 1000,\n    "algorithms": ["SHA-256", "SHA-384", "SHA-512"]\n  },\n  "dependencies": ["postgres", "redis", "vault", "kafka"]\n}'
  };

  presetDb.addEventListener('click', () => { msgInput.value = PRESETS.db; compute(); });
  presetApi.addEventListener('click', () => { msgInput.value = PRESETS.api; compute(); });
  presetSys.addEventListener('click', () => { msgInput.value = PRESETS.sys; compute(); });

  /* ─── COMPUTE WRAPPER ─── */
  let computing = false;

  async function compute() {
    if (computing) return;
    computing = true;
    const text = msgInput.value.trim();
    try {
      await computeAll(text);
    } catch (e) {
      tBadge.className = 'tele-badge warn';
      tBadge.textContent = '[ COMPUTATION ERROR ]';
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = e.message;
    }
    computing = false;
  }

  /* ─── AVALANCHE VERIFY ─── */
  function verifyAvalanche() {
    const md5 = md5Output.textContent;
    if (!md5 || md5.startsWith('<')) return;
    const prev = avlPrev.textContent;
    if (prev && prev !== md5) {
      computeAvalanche(md5, prev);
      tBadge.className = 'tele-badge valid';
      tBadge.textContent = '[ AVALANCHE DISPERSION: VERIFIED ]';
    } else {
      /* mutate input slightly and recompute to show avalanche */
      const text = msgInput.value;
      if (text) {
        msgInput.value = text + ' ';
        compute();
        msgInput.value = text;
      }
    }
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    previousDigest = '';
    currentHashes = { md5: '', sha1: '', sha256: '' };
    msgInput.value = '';
    md5Output.textContent = '<awaiting input>';
    md5Output.classList.remove('active');
    sha1Output.textContent = '<awaiting input>';
    sha1Output.classList.remove('active');
    sha256Output.textContent = '<awaiting input>';
    sha256Output.classList.remove('active');
    tChars.textContent = '--';
    tBytes.textContent = '--';
    tWidth.textContent = '--';
    tAvalanche.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
    avlPrev.textContent = '--';
    avlCurr.textContent = '--';
    avlDiff.textContent = '--';
    avlBar.style.width = '0%';
  }

  /* ─── EVENTS ─── */
  msgInput.addEventListener('input', compute);
  btnExecute.addEventListener('click', compute);
  btnAvalanche.addEventListener('click', verifyAvalanche);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    /* select all text in presets on click */
    compute();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
