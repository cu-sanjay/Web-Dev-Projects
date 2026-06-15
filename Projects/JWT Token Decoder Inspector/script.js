/**
 * JWTAlign - JWT Token Decoder & Inspector
 * Core Cryptography & Interface Script
 */

// ==========================================================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================================================
let state = {
  history: [],
  keychain: [],
  theme: 'dark'
};

const STORAGE_KEYS = {
  HISTORY: 'jwt_history',
  KEYCHAIN: 'jwt_keychain',
  THEME: 'jwt_theme'
};

// ==========================================================================
// PRESET MOCK TOKENS AND SEEDS
// ==========================================================================
const PRESET_SECRET = 'super-secret-key-123';

const PRESETS = {
  'hs256-valid': {
    token: '', // Generated dynamically on init to ensure it has a valid active expiration timestamp
    secret: PRESET_SECRET
  },
  'hs256-expired': {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRvbmFsZCBEdWNrIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsImlzcyI6ImF1dGgtc2VydmVyIn0.rG2K22P6D9z_C2q-52e_0o5r2L381i0Ld2_w-T4Y18A',
    secret: 'secret-key-expired'
  },
  'invalid-structure': {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0',
    secret: ''
  }
};

function generateActivePresetToken() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSecs = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'dev-sujal-77',
    name: 'Sujal Kamate',
    iss: 'cc-auth-authority',
    iat: nowSecs,
    exp: nowSecs + (2 * 60 * 60) // Expires in 2 hours
  };
  
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const sig = hmacSHA256(`${encodedHeader}.${encodedPayload}`, PRESET_SECRET);
  
  PRESETS['hs256-valid'].token = `${encodedHeader}.${encodedPayload}.${sig}`;
}

function loadState() {
  const localHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const localKeychain = localStorage.getItem(STORAGE_KEYS.KEYCHAIN);
  const localTheme = localStorage.getItem(STORAGE_KEYS.THEME);

  if (localHistory || localKeychain) {
    state.history = JSON.parse(localHistory || '[]');
    state.keychain = JSON.parse(localKeychain || '[]');
    state.theme = localTheme || 'dark';
  } else {
    // Populate default seeds
    state.history = [
      { id: 'h-1', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRvbmFsZCBEdWNrIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsImlzcyI6ImF1dGgtc2VydmVyIn0.rG2K22P6D9z_C2q-52e_0o5r2L381i0Ld2_w-T4Y18A', timestamp: new Date().toLocaleTimeString() }
    ];
    state.keychain = [
      { id: 'k-1', label: 'Preset Demo Secret', value: PRESET_SECRET },
      { id: 'k-2', label: 'Staging API Key', value: 'staging-env-passphrase-jwt-auth-999' }
    ];
    state.theme = 'dark';
    saveState();
  }
  applyTheme();
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
  localStorage.setItem(STORAGE_KEYS.KEYCHAIN, JSON.stringify(state.keychain));
  localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

// ==========================================================================
// BASE64URL CODING ALGORITHMS
// ==========================================================================
function base64urlEncode(str) {
  try {
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    return '';
  }
}

function base64urlDecode(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    return null;
  }
}

function base64urlDecodeToBytes(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    return null;
  }
}

function bytesToBase64Url(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ==========================================================================
// PURE JAVASCRIPT CRYPTOGRAPHY ENGINES (SHA256 & HMAC-SHA256)
// ==========================================================================
// A clean, compact implementation of HMAC-SHA256 operating strictly client-side.
const sha256 = (function() {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  function hash(words) {
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    const w = new Int32Array(64);

    for (let i = 0; i < words.length; i += 16) {
      for (let t = 0; t < 16; t++) {
        w[t] = words[i + t];
      }
      for (let t = 16; t < 64; t++) {
        const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }

      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;
      let f = h5;
      let g = h6;
      let h = h7;

      for (let t = 0; t < 64; t++) {
        const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[t] + w[t]) | 0;
        const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }

      h0 = (h0 + a) | 0;
      h1 = (h1 + b) | 0;
      h2 = (h2 + c) | 0;
      h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0;
      h5 = (h5 + f) | 0;
      h6 = (h6 + g) | 0;
      h7 = (h7 + h) | 0;
    }

    return [h0, h1, h2, h3, h4, h5, h6, h7];
  }

  function utf8ToWords(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const charcode = str.charCodeAt(i);
      if (charcode < 0x80) bytes.push(charcode);
      else if (charcode < 0x800) {
        bytes.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        bytes.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
      } else {
        i++;
        const val = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        bytes.push(0xf0 | (val >> 18), 0x80 | ((val >> 12) & 0x3f), 0x80 | ((val >> 6) & 0x3f), 0x80 | (val & 0x3f));
      }
    }
    
    // Bytes array to 32-bit words
    const words = new Int32Array(((bytes.length + 8) >> 6) + 1 << 4);
    for (let i = 0; i < bytes.length; i++) {
      words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
    }
    
    // Add bit count padding
    const bitLength = bytes.length * 8;
    const paddingIndex = bytes.length;
    words[paddingIndex >> 2] |= 0x80 << (24 - (paddingIndex % 4) * 8);
    
    words[words.length - 1] = bitLength;
    return words;
  }

  return {
    digest: function(str) {
      const words = utf8ToWords(str);
      const output = hash(words);
      const bytes = new Uint8Array(32);
      for (let i = 0; i < 8; i++) {
        bytes[i * 4] = (output[i] >>> 24) & 0xff;
        bytes[i * 4 + 1] = (output[i] >>> 16) & 0xff;
        bytes[i * 4 + 2] = (output[i] >>> 8) & 0xff;
        bytes[i * 4 + 3] = output[i] & 0xff;
      }
      return bytes;
    },
    digestBytes: function(byteArray) {
      const bitLength = byteArray.length * 8;
      const paddingIndex = byteArray.length;
      const totalWords = ((byteArray.length + 8) >> 6) + 1 << 4;
      const words = new Int32Array(totalWords);
      
      for (let i = 0; i < byteArray.length; i++) {
        words[i >> 2] |= byteArray[i] << (24 - (i % 4) * 8);
      }
      words[paddingIndex >> 2] |= 0x80 << (24 - (paddingIndex % 4) * 8);
      words[words.length - 1] = bitLength;

      const output = hash(words);
      const bytes = new Uint8Array(32);
      for (let i = 0; i < 8; i++) {
        bytes[i * 4] = (output[i] >>> 24) & 0xff;
        bytes[i * 4 + 1] = (output[i] >>> 16) & 0xff;
        bytes[i * 4 + 2] = (output[i] >>> 8) & 0xff;
        bytes[i * 4 + 3] = output[i] & 0xff;
      }
      return bytes;
    }
  };
})();

function hmacSHA256(message, secret, secretIsBase64 = false) {
  let keyBytes;
  if (secretIsBase64) {
    keyBytes = base64urlDecodeToBytes(secret);
    if (!keyBytes) {
      // Fallback to text key if base64 decoding fails
      keyBytes = new TextEncoder().encode(secret);
    }
  } else {
    keyBytes = new TextEncoder().encode(secret);
  }

  // SHA256 Block Size is 64 bytes
  const blockSize = 64;
  if (keyBytes.length > blockSize) {
    keyBytes = sha256.digestBytes(keyBytes);
  }

  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(keyBytes);

  const innerPad = new Uint8Array(blockSize);
  const outerPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    innerPad[i] = paddedKey[i] ^ 0x36;
    outerPad[i] = paddedKey[i] ^ 0x5c;
  }

  const msgBytes = new TextEncoder().encode(message);
  
  // Inner hash: H(innerPad || message)
  const innerBuffer = new Uint8Array(blockSize + msgBytes.length);
  innerBuffer.set(innerPad);
  innerBuffer.set(msgBytes, blockSize);
  const innerHash = sha256.digestBytes(innerBuffer);

  // Outer hash: H(outerPad || innerHash)
  const outerBuffer = new Uint8Array(blockSize + innerHash.length);
  outerBuffer.set(outerPad);
  outerBuffer.set(innerHash, blockSize);
  const outerHash = sha256.digestBytes(outerBuffer);

  return bytesToBase64Url(outerHash);
}

// ==========================================================================
// CORE TOKEN DECODER FUNCTIONALITY
// ==========================================================================
let countdownInterval = null;

function decodeJWTInput() {
  const token = document.getElementById('encoded-token-textarea').value.trim();
  const secret = document.getElementById('verification-secret-key').value;
  const isBase64Secret = document.getElementById('secret-base64-encoded').checked;

  const headerCode = document.getElementById('decoded-header-code');
  const payloadCode = document.getElementById('decoded-payload-code');
  const badgeStructure = document.getElementById('badge-token-structure');
  
  // Clear countdown intervals if running
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  if (!token) {
    headerCode.innerText = 'Empty header segment...';
    payloadCode.innerText = 'Empty payload segment...';
    badgeStructure.className = 'badge badge-neutral';
    badgeStructure.innerText = 'No Token';
    setSignatureStatus('unverified');
    toggleTimeline(false);
    return;
  }

  const parts = token.split('.');

  if (parts.length !== 3) {
    badgeStructure.className = 'badge badge-danger';
    badgeStructure.innerText = 'Malformed Structure';
    headerCode.innerText = 'Error: JWT must contain exactly three segments separated by dots (header.payload.signature).';
    payloadCode.innerText = 'Error: Segment split failed.';
    setSignatureStatus('invalid');
    toggleTimeline(false);
    return;
  }

  // Parse header
  const headerJsonStr = base64urlDecode(parts[0]);
  let header = null;
  if (!headerJsonStr) {
    headerCode.innerText = 'Error: Base64Url decoding failed for header segment.';
  } else {
    try {
      header = JSON.parse(headerJsonStr);
      headerCode.innerHTML = highlightJSON(header);
    } catch (e) {
      headerCode.innerText = `Error: Header segment is not a valid JSON object:\n${headerJsonStr}`;
    }
  }

  // Parse payload
  const payloadJsonStr = base64urlDecode(parts[1]);
  let payload = null;
  if (!payloadJsonStr) {
    payloadCode.innerText = 'Error: Base64Url decoding failed for payload segment.';
  } else {
    try {
      payload = JSON.parse(payloadJsonStr);
      payloadCode.innerHTML = highlightJSON(payload);
    } catch (e) {
      payloadCode.innerText = `Error: Payload segment is not a valid JSON object:\n${payloadJsonStr}`;
    }
  }

  if (header && payload) {
    badgeStructure.className = 'badge badge-success';
    badgeStructure.innerText = `${header.alg || 'Unknown Alg'} Standard Token`;
    
    // Signature Check (Only supports HS256 algorithm offline)
    const alg = (header.alg || '').toUpperCase();
    if (alg !== 'HS256') {
      setSignatureStatus('unverified', `Alg ${alg} not supported for local crypt verification`);
    } else if (!secret) {
      setSignatureStatus('unverified', 'Signature key required to verify');
    } else {
      const calculatedSig = hmacSHA256(`${parts[0]}.${parts[1]}`, secret, isBase64Secret);
      if (calculatedSig === parts[2]) {
        setSignatureStatus('verified');
      } else {
        setSignatureStatus('invalid');
      }
    }

    // Load claims timeline
    renderClaimsTimeline(payload);
  } else {
    badgeStructure.className = 'badge badge-danger';
    badgeStructure.innerText = 'Parsing Error';
    setSignatureStatus('invalid');
    toggleTimeline(false);
  }
}

function setSignatureStatus(status, text) {
  const badge = document.getElementById('badge-signature-status');
  if (status === 'verified') {
    badge.className = 'badge-signature sig-verified';
    badge.innerText = text || 'Signature Verified';
  } else if (status === 'invalid') {
    badge.className = 'badge-signature sig-invalid';
    badge.innerText = text || 'Invalid Signature';
  } else {
    badge.className = 'badge-signature sig-unverified';
    badge.innerText = text || 'Signature Unverified';
  }
}

function toggleTimeline(show) {
  const empty = document.getElementById('timeline-empty-state');
  const active = document.getElementById('timeline-active-state');
  if (show) {
    empty.classList.add('hidden');
    active.classList.remove('hidden');
  } else {
    empty.classList.remove('hidden');
    active.classList.add('hidden');
  }
}

// Claims inspector conversions
function renderClaimsTimeline(payload) {
  toggleTimeline(true);

  const formatEpoch = (epoch) => {
    if (!epoch || isNaN(epoch)) return 'Not Present';
    const date = new Date(epoch * 1000);
    return date.toLocaleString();
  };

  // iss
  const issRow = document.getElementById('timeline-iss-row');
  if (payload.iss) {
    issRow.classList.remove('hidden');
    document.getElementById('timeline-iss-val').innerText = payload.iss;
  } else {
    issRow.classList.add('hidden');
  }

  // sub
  const subRow = document.getElementById('timeline-sub-row');
  if (payload.sub) {
    subRow.classList.remove('hidden');
    document.getElementById('timeline-sub-val').innerText = payload.sub;
  } else {
    subRow.classList.add('hidden');
  }

  // iat
  const iatRow = document.getElementById('timeline-iat-row');
  if (payload.iat) {
    iatRow.classList.remove('hidden');
    document.getElementById('timeline-iat-val').innerText = formatEpoch(payload.iat);
  } else {
    iatRow.classList.add('hidden');
  }

  // exp
  const expRow = document.getElementById('timeline-exp-row');
  if (payload.exp) {
    expRow.classList.remove('hidden');
    const expVal = document.getElementById('timeline-exp-val');
    expVal.innerText = formatEpoch(payload.exp);

    const expTimeMs = payload.exp * 1000;
    const marker = document.getElementById('timeline-exp-marker');
    const countdown = document.getElementById('badge-expiry-countdown');

    const updateCountdown = () => {
      const now = Date.now();
      const diff = expTimeMs - now;

      if (diff <= 0) {
        countdown.className = 'badge badge-expired';
        countdown.innerText = 'Expired';
        marker.className = 'timeline-marker color-purple'; // Red/Purple marker for expired
      } else {
        countdown.className = 'badge badge-active';
        marker.className = 'timeline-marker color-teal'; // Green marker for active
        
        // Format time remaining
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        let displayStr = 'Expires in ';
        if (hours > 0) displayStr += `${hours}h `;
        if (minutes > 0 || hours > 0) displayStr += `${minutes}m `;
        displayStr += `${seconds}s`;

        countdown.innerText = displayStr;
      }
    };

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  } else {
    expRow.classList.add('hidden');
  }
}

// JSON syntax coloring spans
function highlightJSON(json) {
  let jsonString = typeof json !== 'string' ? JSON.stringify(json, null, 2) : json;
  
  // Escape tags
  jsonString = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'json-value-num';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-value-bool';
    } else if (/null/.test(match)) {
      cls = 'json-value-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

// ==========================================================================
// TOKEN GENERATOR / BUILDER ENGINE
// ==========================================================================
function updateGeneratedToken() {
  const headerText = document.getElementById('builder-header-textarea').value;
  const payloadText = document.getElementById('builder-payload-textarea').value;
  const secret = document.getElementById('builder-secret-key').value;
  const generatedArea = document.getElementById('generated-token-textarea');

  try {
    const headerObj = JSON.parse(headerText);
    const payloadObj = JSON.parse(payloadText);

    const encodedHeader = base64urlEncode(JSON.stringify(headerObj));
    const encodedPayload = base64urlEncode(JSON.stringify(payloadObj));
    
    // Automatically force alg match HS256 for browser build
    if (headerObj.alg !== 'HS256') {
      headerObj.alg = 'HS256';
      document.getElementById('builder-header-textarea').value = JSON.stringify(headerObj, null, 2);
    }

    const tokenMsg = `${encodedHeader}.${encodedPayload}`;
    const signature = hmacSHA256(tokenMsg, secret || '');
    
    generatedArea.value = `${tokenMsg}.${signature}`;
  } catch (e) {
    generatedArea.value = `Syntax Error: Ensure Header and Payload JSON inputs are structured correctly.`;
  }
}

function formatBuilderJSON(targetId) {
  const area = document.getElementById(targetId);
  try {
    const parsed = JSON.parse(area.value);
    area.value = JSON.stringify(parsed, null, 2);
    updateGeneratedToken();
  } catch (e) {
    alert('JSON validation failed. Ensure syntax is valid before formatting.');
  }
}

// ==========================================================================
// VAULT KEYCHAIN KEYS
// ==========================================================================
function renderKeychain() {
  const container = document.getElementById('secrets-container');
  container.innerHTML = '';

  if (state.keychain.length === 0) {
    container.innerHTML = '<div style="font-size:0.75rem; color:var(--text-secondary); padding:4px 0;">Keychain is empty.</div>';
    return;
  }

  state.keychain.forEach(key => {
    const el = document.createElement('div');
    el.className = 'secret-key-badge';
    el.onclick = () => loadSecret(key.value);
    el.innerHTML = `
      <span class="sec-label" title="${escapeHTML(key.label)}">${escapeHTML(key.label)}</span>
      <button class="btn-icon-del" onclick="deleteSecret('${key.id}', event)" title="Delete Key"><i class="fa-solid fa-xmark"></i></button>
    `;
    container.appendChild(el);
  });
}

function loadSecret(secret) {
  document.getElementById('verification-secret-key').value = secret;
  document.getElementById('builder-secret-key').value = secret;
  
  // Re-run decoder verification checks if active
  decodeJWTInput();
  // Re-run encoder compiler if active
  updateGeneratedToken();
}

function createNewSecret(label, value) {
  if (!label.trim() || !value.trim()) return;
  state.keychain.push({
    id: `k-${Date.now()}`,
    label: label.trim(),
    value: value.trim()
  });
  saveState();
  renderKeychain();
}

function deleteSecret(id, event) {
  event.stopPropagation();
  state.keychain = state.keychain.filter(x => x.id !== id);
  saveState();
  renderKeychain();
}

// ==========================================================================
// HISTORY LOG VIEWERS
// ==========================================================================
function renderHistory() {
  const container = document.getElementById('history-container');
  container.innerHTML = '';

  if (state.history.length === 0) {
    container.innerHTML = '<div style="font-size:0.75rem; color:var(--text-secondary); text-align:center; padding-top:20px;">No decoded history logs.</div>';
    return;
  }

  state.history.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.onclick = () => {
      document.getElementById('encoded-token-textarea').value = item.token;
      decodeJWTInput();
    };

    // Extract claims previews
    let claimDesc = 'No payload parsed';
    const parts = item.token.split('.');
    if (parts.length === 3) {
      const decodedPayload = base64urlDecode(parts[1]);
      if (decodedPayload) {
        try {
          const payload = JSON.parse(decodedPayload);
          claimDesc = payload.sub || payload.name || 'Unnamed session';
        } catch (e) {}
      }
    }

    el.innerHTML = `
      <h4>${escapeHTML(claimDesc)}</h4>
      <p title="${escapeHTML(item.token)}">${escapeHTML(item.token)}</p>
    `;
    container.appendChild(el);
  });
}

function saveTokenToHistory(token) {
  // Prevent duplicate additions
  if (state.history.some(x => x.token === token)) return;
  
  state.history.unshift({
    id: `h-${Date.now()}`,
    token: token,
    timestamp: new Date().toLocaleTimeString()
  });

  if (state.history.length > 15) {
    state.history.pop();
  }

  saveState();
  renderHistory();
}

function clearHistory() {
  const confirmAction = confirm('Clear decoded token history logs?');
  if (confirmAction) {
    state.history = [];
    saveState();
    renderHistory();
  }
}

// ==========================================================================
// TAB PANEL ROUTING & INTERFACES CONTROLS
// ==========================================================================
function switchWorkspaceMode(mode) {
  document.querySelectorAll('.mode-tab').forEach(btn => {
    if (btn.getAttribute('data-mode') === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.mode-workspace').forEach(view => {
    if (view.id === `workspace-${mode}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  if (mode === 'decoder') {
    decodeJWTInput();
  } else {
    updateGeneratedToken();
  }
}

function resetBoardWorkspace() {
  document.getElementById('encoded-token-textarea').value = '';
  document.getElementById('verification-secret-key').value = '';
  document.getElementById('select-preset-token').value = '';
  
  // Reset builder values to basic HS256 preset
  document.getElementById('builder-header-textarea').value = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2);
  document.getElementById('builder-payload-textarea').value = JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: 1516239022 }, null, 2);
  document.getElementById('builder-secret-key').value = 'secret-signing-key';

  decodeJWTInput();
  updateGeneratedToken();
}

// ==========================================================================
// INITIALIZATIONS & BIND EVENT LISTENERS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  generateActivePresetToken();
  loadState();

  // Initial renders
  renderKeychain();
  renderHistory();
  
  // Set defaults builder inputs if empty
  document.getElementById('builder-header-textarea').value = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2);
  document.getElementById('builder-payload-textarea').value = JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: 1516239022 }, null, 2);
  document.getElementById('builder-secret-key').value = 'secret-signing-key';

  // Decode modes listeners
  const tokenArea = document.getElementById('encoded-token-textarea');
  tokenArea.addEventListener('input', () => {
    decodeJWTInput();
    if (tokenArea.value.trim().split('.').length === 3) {
      saveTokenToHistory(tokenArea.value.trim());
    }
  });

  document.getElementById('verification-secret-key').addEventListener('input', decodeJWTInput);
  document.getElementById('secret-base64-encoded').addEventListener('change', decodeJWTInput);

  // Visibility toggle
  const secretKeyInput = document.getElementById('verification-secret-key');
  document.getElementById('btn-toggle-secret-visibility').addEventListener('click', (e) => {
    const icon = e.currentTarget.querySelector('i');
    if (secretKeyInput.type === 'password') {
      secretKeyInput.type = 'text';
      icon.className = 'fa-solid fa-eye';
    } else {
      secretKeyInput.type = 'password';
      icon.className = 'fa-solid fa-eye-slash';
    }
  });

  // Builder modes listeners
  document.getElementById('builder-header-textarea').addEventListener('input', updateGeneratedToken);
  document.getElementById('builder-payload-textarea').addEventListener('input', updateGeneratedToken);
  document.getElementById('builder-secret-key').addEventListener('input', updateGeneratedToken);

  document.getElementById('btn-format-builder-header').addEventListener('click', () => formatBuilderJSON('builder-header-textarea'));
  document.getElementById('btn-format-builder-payload').addEventListener('click', () => formatBuilderJSON('builder-payload-textarea'));

  // Copy button action
  document.getElementById('btn-copy-generated-token').addEventListener('click', () => {
    const token = document.getElementById('generated-token-textarea').value;
    if (token && !token.startsWith('Syntax Error')) {
      navigator.clipboard.writeText(token);
      alert('Generated JWT token copied to clipboard!');
      saveTokenToHistory(token);
    }
  });

  // Navigation binders
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchWorkspaceMode(e.currentTarget.getAttribute('data-mode'));
    });
  });

  document.getElementById('btn-reset-workspace').addEventListener('click', resetBoardWorkspace);
  document.getElementById('btn-clear-history').addEventListener('click', clearHistory);

  // Preset selector binders
  document.getElementById('select-preset-token').addEventListener('change', (e) => {
    const preset = PRESETS[e.target.value];
    if (preset) {
      document.getElementById('encoded-token-textarea').value = preset.token;
      document.getElementById('verification-secret-key').value = preset.secret;
      decodeJWTInput();
      saveTokenToHistory(preset.token);
    }
  });

  // Keychain secrets modal dialog inputs
  const secretModal = document.getElementById('save-secret-modal');
  document.getElementById('btn-save-secret').addEventListener('click', () => {
    secretModal.classList.remove('hidden');
    document.getElementById('save-secret-name').value = '';
    document.getElementById('save-secret-value').value = '';
  });

  document.getElementById('btn-close-secret-modal').addEventListener('click', () => secretModal.classList.add('hidden'));
  document.getElementById('btn-cancel-secret').addEventListener('click', () => secretModal.classList.add('hidden'));
  document.getElementById('btn-confirm-secret').addEventListener('click', () => {
    const label = document.getElementById('save-secret-name').value;
    const val = document.getElementById('save-secret-value').value;
    if (label.trim() && val.trim()) {
      createNewSecret(label, val);
      secretModal.classList.add('hidden');
    } else {
      alert('Key labels and passphrases are required.');
    }
  });

  // Global key overrides
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      secretModal.classList.add('hidden');
    }
  });

  // Close modals clicking background overlays
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        secretModal.classList.add('hidden');
      }
    });
  });

  // Trigger default empty checks
  decodeJWTInput();
});

// Helper Escape HTML
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
