(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── DOM REFS ─── */
  const jwtInput = $('#jwtInput');
  const headerView = $('#headerView');
  const payloadView = $('#payloadView');
  const signatureView = $('#signatureView');
  const tAlg = $('#tAlg');
  const tValidity = $('#tValidity');
  const tCountdown = $('#tCountdown');
  const tClaims = $('#tClaims');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const presetValid = $('#presetValid');
  const presetExpired = $('#presetExpired');
  const presetMalformed = $('#presetMalformed');
  const btnExecute = $('#btnExecute');
  const btnValidate = $('#btnValidate');
  const btnFlush = $('#btnFlush');

  /* ─── STATE ─── */
  let countdownInterval = null;
  let currentPayload = null;
  let currentHeader = null;

  /* ─── TOKEN BUILDER ─── */
  function b64url(str) {
    const encoded = btoa(str);
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function buildToken(header, payload, secret) {
    const h = b64url(JSON.stringify(header));
    const p = b64url(JSON.stringify(payload));
    const fakeSig = b64url(secret || 'insecure-development-secret-key-for-demo-purposes-only');
    return h + '.' + p + '.' + fakeSig;
  }

  /* ─── PRESET TOKENS ─── */
  function makeValidToken() {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: 'admin',
      name: 'Girish Madarkar',
      iat: now - 3600,
      exp: now + 7200,
      role: 'administrator',
      permissions: ['read', 'write', 'delete', 'audit']
    };
    return buildToken(header, payload, 'production-signing-key-2026');
  }

  function makeExpiredToken() {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      sub: 'session-user',
      name: 'Jane Doe',
      iat: now - 86400,
      exp: now - 3600,
      role: 'viewer',
      permissions: ['read']
    };
    return buildToken(header, payload, 'expired-key-2025');
  }

  function makeMalformedToken() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.incomplete-segment';
  }

  presetValid.addEventListener('click', () => { jwtInput.value = makeValidToken(); decompose(); });
  presetExpired.addEventListener('click', () => { jwtInput.value = makeExpiredToken(); decompose(); });
  presetMalformed.addEventListener('click', () => { jwtInput.value = makeMalformedToken(); decompose(); });

  /* ─── BASE64URL DECODE ─── */
  function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    /* pad = (4 - len % 4) % 4 */
    const pad = (4 - (base64.length % 4)) % 4;
    base64 += '='.repeat(pad);
    try {
      return atob(base64);
    } catch (e) {
      throw new Error('Base64 decoding failed: ' + e.message);
    }
  }

  /* ─── DECOMPOSE ─── */
  function decompose() {
    stopCountdown();
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
    currentPayload = null;
    currentHeader = null;

    const token = jwtInput.value.trim();
    if (!token) {
      resetViews();
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      headerView.textContent = 'DECOMPOSITION ERROR';
      payloadView.textContent = 'DECOMPOSITION ERROR';
      signatureView.textContent = 'DECOMPOSITION ERROR';
      tAlg.textContent = '--';
      tValidity.textContent = 'MALFORMED';
      tValidity.style.color = '#ff1744';
      tCountdown.textContent = '--';
      tClaims.textContent = '--';
      tBadge.className = 'tele-badge invalid';
      tBadge.textContent = '[ ANATOMY_ERROR: MALFORMED TOKENS PAYLOAD ]';
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = 'Token contains ' + parts.length + ' segments — expected exactly 3 (header.payload.signature)';
      return;
    }

    try {
      const headerRaw = base64UrlDecode(parts[0]);
      let headerObj;
      try { headerObj = JSON.parse(headerRaw); } catch {
        throw new Error('Header segment is not valid JSON');
      }
      currentHeader = headerObj;
      headerView.textContent = JSON.stringify(headerObj, null, 2);
    } catch (e) {
      headerView.textContent = 'DECODE ERROR: ' + e.message;
      signalAnatomyError(e.message);
      return;
    }

    try {
      const payloadRaw = base64UrlDecode(parts[1]);
      let payloadObj;
      try { payloadObj = JSON.parse(payloadRaw); } catch {
        throw new Error('Payload segment is not valid JSON');
      }
      currentPayload = payloadObj;
      payloadView.textContent = JSON.stringify(payloadObj, null, 2);
    } catch (e) {
      payloadView.textContent = 'DECODE ERROR: ' + e.message;
      signalAnatomyError(e.message);
      return;
    }

    /* signature as hex */
    try {
      const sigRaw = base64UrlDecode(parts[2]);
      let hex = '';
      for (let i = 0; i < sigRaw.length; i++) {
        hex += sigRaw.charCodeAt(i).toString(16).padStart(2, '0');
      }
      signatureView.textContent = hex.toUpperCase() || '(empty signature)';
    } catch {
      signatureView.textContent = '(raw) ' + parts[2];
    }

    /* ─── UPDATE TELEMETRY ─── */
    const alg = currentHeader.alg || 'unknown';
    tAlg.textContent = alg;

    const claimKeys = Object.keys(currentPayload);
    tClaims.textContent = claimKeys.length;

    const exp = currentPayload.exp;
    const iat = currentPayload.iat;
    const now = Math.floor(Date.now() / 1000);

    if (exp) {
      const delta = exp - now;
      if (delta > 0) {
        tValidity.textContent = 'ACTIVE';
        tValidity.style.color = '#00e676';
        tBadge.className = 'tele-badge valid';
        tBadge.textContent = '[ TOKEN_LIFECYCLE: VALID UNEXPIRED CLAIMS ]';
        startCountdown(delta);
      } else {
        tValidity.textContent = 'EXPIRED';
        tValidity.style.color = '#ff1744';
        tCountdown.textContent = '0s';
        tBadge.className = 'tele-badge invalid';
        tBadge.textContent = '[ TOKEN_LIFECYCLE: EXPIRED KEY EXPIRATION ]';
        errorDetail.className = 'error-detail active';
        errorDetail.textContent = 'Token expired ' + Math.abs(delta).toFixed(0) + 's ago (exp: ' + new Date(exp * 1000).toISOString() + ')';
      }
    } else {
      tValidity.textContent = 'NO EXP';
      tValidity.style.color = '#ffc800';
      tCountdown.textContent = '--';
      tBadge.className = 'tele-badge warn';
      tBadge.textContent = '[ WARNING: NO EXPIRATION CLAIM PRESENT ]';
    }
  }

  /* ─── ANATOMY ERROR ─── */
  function signalAnatomyError(msg) {
    tAlg.textContent = '--';
    tValidity.textContent = 'ERROR';
    tValidity.style.color = '#ff1744';
    tCountdown.textContent = '--';
    tClaims.textContent = '--';
    tBadge.className = 'tele-badge invalid';
    tBadge.textContent = '[ ANATOMY_ERROR: MALFORMED TOKENS PAYLOAD ]';
    errorDetail.className = 'error-detail active';
    errorDetail.textContent = msg;
  }

  /* ─── COUNTDOWN ─── */
  function startCountdown(delta) {
    stopCountdown();
    let remaining = delta;
    updateCountdownDisplay(remaining);
    countdownInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        remaining = 0;
        updateCountdownDisplay(remaining);
        stopCountdown();
        tValidity.textContent = 'EXPIRED';
        tValidity.style.color = '#ff1744';
        tBadge.className = 'tele-badge invalid';
        tBadge.textContent = '[ TOKEN_LIFECYCLE: EXPIRED KEY EXPIRATION ]';
        tCountdown.style.color = '#ff1744';
        return;
      }
      updateCountdownDisplay(remaining);
    }, 1000);
  }

  function updateCountdownDisplay(secs) {
    if (secs > 3600) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      tCountdown.textContent = h + 'h ' + m + 'm ' + s + 's';
    } else if (secs > 60) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      tCountdown.textContent = m + 'm ' + s + 's';
    } else {
      tCountdown.textContent = secs + 's';
    }
    tCountdown.style.color = secs < 60 ? '#ffc800' : '#00e676';
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  /* ─── RESET VIEWS ─── */
  function resetViews() {
    headerView.textContent = '<awaiting token>';
    payloadView.textContent = '<awaiting token>';
    signatureView.textContent = '<awaiting token>';
    tAlg.textContent = '--';
    tValidity.textContent = '--';
    tValidity.style.color = '';
    tCountdown.textContent = '--';
    tCountdown.style.color = '';
    tClaims.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
  }

  /* ─── VALIDATE ─── */
  function validateClaims() {
    if (!currentPayload) {
      decompose();
      if (!currentPayload) return;
    }

    const exp = currentPayload.exp;
    const iat = currentPayload.iat;
    const now = Math.floor(Date.now() / 1000);
    let issues = [];

    if (iat && iat > now) {
      issues.push('iat (' + iat + ') is in the future');
    }
    if (exp && exp <= now) {
      issues.push('exp (' + exp + ') is in the past — TOKEN EXPIRED');
    }
    if (!exp) {
      issues.push('No exp claim — token never expires');
    }

    if (issues.length === 0) {
      tBadge.className = 'tele-badge valid';
      tBadge.textContent = '[ CLAIM VALIDATION: ALL CONSTRAINTS SATISFIED ]';
      errorDetail.className = 'error-detail';
      errorDetail.textContent = '';
    } else {
      tBadge.className = 'tele-badge invalid';
      tBadge.textContent = '[ CLAIM VALIDATION: ' + issues.length + ' VIOLATION(S) DETECTED ]';
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = issues.join('; ');
    }
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    stopCountdown();
    jwtInput.value = '';
    currentPayload = null;
    currentHeader = null;
    resetViews();
  }

  /* ─── EVENTS ─── */
  btnExecute.addEventListener('click', decompose);
  btnValidate.addEventListener('click', validateClaims);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    jwtInput.value = makeValidToken();
    decompose();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
