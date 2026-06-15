(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── DOM REFS ─── */
  const sourceText = $('#sourceText');
  const outputText = $('#outputText');
  const dropzone = $('#dropzone');
  const filePicker = $('#filePicker');
  const fileInfo = $('#fileInfo');
  const fileName = $('#fileName');
  const fileSize = $('#fileSize');
  const textInputGroup = $('#textInputGroup');
  const fileInputGroup = $('#fileInputGroup');
  const modeText = $('#modeText');
  const modeFile = $('#modeFile');
  const dirEncode = $('#dirEncode');
  const dirDecode = $('#dirDecode');
  const tOp = $('#tOp');
  const tBytes = $('#tBytes');
  const tExpansion = $('#tExpansion');
  const tPadding = $('#tPadding');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const btnExecute = $('#btnExecute');
  const btnDecode = $('#btnDecode');
  const btnCopy = $('#btnCopy');
  const btnDownload = $('#btnDownload');
  const btnPurge = $('#btnPurge');

  /* ─── STATE ─── */
  let mode = 'text';        /* 'text' | 'file' */
  let direction = 'encode'; /* 'encode' | 'decode' */
  let fileDataUrl = null;
  let fileBytes = null;
  let currentRawBytes = null; /* Uint8Array for download */

  /* ─── MODE TOGGLES ─── */
  modeText.addEventListener('click', () => {
    mode = 'text';
    modeText.classList.add('active');
    modeFile.classList.remove('active');
    textInputGroup.classList.remove('hidden');
    fileInputGroup.classList.add('hidden');
    updateOutput();
  });

  modeFile.addEventListener('click', () => {
    mode = 'file';
    modeFile.classList.add('active');
    modeText.classList.remove('active');
    textInputGroup.classList.add('hidden');
    fileInputGroup.classList.remove('hidden');
    if (fileDataUrl) {
      outputText.value = fileDataUrl;
      computeTelemetry(fileDataUrl, 'encode');
    }
  });

  /* ─── DIRECTION TOGGLES ─── */
  dirEncode.addEventListener('click', () => {
    direction = 'encode';
    dirEncode.classList.add('active');
    dirDecode.classList.remove('active');
    updateOutput();
  });

  dirDecode.addEventListener('click', () => {
    direction = 'decode';
    dirDecode.classList.add('active');
    dirEncode.classList.remove('active');
    updateOutput();
  });

  /* ─── FILE DROPZONE ─── */
  dropzone.addEventListener('click', () => filePicker.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  filePicker.addEventListener('change', () => {
    if (filePicker.files.length > 0) handleFile(filePicker.files[0]);
  });

  function handleFile(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    fileInfo.classList.remove('hidden');
    fileBytes = file.size;

    const reader = new FileReader();
    reader.onload = (e) => {
      fileDataUrl = e.target.result;
      outputText.value = fileDataUrl;
      computeTelemetry(fileDataUrl, 'encode');

      /* store raw bytes for download */
      const arrayReader = new FileReader();
      arrayReader.onload = (ev) => {
        currentRawBytes = new Uint8Array(ev.target.result);
      };
      arrayReader.readAsArrayBuffer(file);
    };
    reader.readAsDataURL(file);
  }

  /* ─── ENCODE / DECODE CORE ─── */
  function encodeBase64(str) {
    try {
      /* use UTF-8 encoding for proper multi-byte support */
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const encoded = btoa(binary);
      currentRawBytes = bytes;
      return { success: true, data: encoded, bytes: bytes.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  function decodeBase64(str) {
    try {
      /* strip potential data URL prefix */
      let clean = str;
      const commaIdx = str.indexOf(',');
      if (commaIdx >= 0 && str.startsWith('data:')) {
        clean = str.slice(commaIdx + 1);
      }
      clean = clean.replace(/\s/g, '');

      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoded = new TextDecoder().decode(bytes);
      currentRawBytes = bytes;
      return { success: true, data: decoded, bytes: bytes.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /* ─── COMPUTE EXPANSION ─── */
  function computeExpansion(inputBytes, outputStr) {
    if (inputBytes === 0) return '0.00%';
    const rawOutputLen = outputStr.length;
    /* base64 expansion: L = 4 * ceil(B/3) */
    const theoretical = 4 * Math.ceil(inputBytes / 3);
    const ratio = ((rawOutputLen / inputBytes) * 100);
    return ratio.toFixed(2) + '%';
  }

  function countPadding(str) {
    const commaIdx = str.indexOf(',');
    const clean = commaIdx >= 0 ? str.slice(commaIdx + 1) : str;
    const trimmed = clean.replace(/\s/g, '');
    const match = trimmed.match(/=+$/);
    return match ? match[0].length : 0;
  }

  /* ─── TELEMETRY ─── */
  function computeTelemetry(outputStr, dir) {
    const isDataUrl = outputStr.startsWith('data:');
    const base64Part = isDataUrl ? outputStr.slice(outputStr.indexOf(',') + 1) : outputStr;
    const cleanB64 = base64Part.replace(/\s/g, '');
    const byteLen = isDataUrl
      ? Math.floor(cleanB64.length * 0.75) - (cleanB64.endsWith('==') ? 2 : cleanB64.endsWith('=') ? 1 : 0)
      : cleanB64.length;

    let dataBytes = 0;
    if (dir === 'encode' && mode === 'text') {
      dataBytes = new TextEncoder().encode(sourceText.value).length;
    } else if (dir === 'encode' && mode === 'file' && fileBytes) {
      dataBytes = fileBytes;
    } else if (dir === 'decode') {
      dataBytes = new TextEncoder().encode(outputText.value).length;
    }

    const expansion = computeExpansion(dataBytes || byteLen, outputStr);
    const padCount = countPadding(outputStr);

    tBytes.textContent = byteLen + ' B';
    tExpansion.textContent = expansion;
    tPadding.textContent = padCount;
  }

  /* ─── VALIDATE ─── */
  function validateOutput(dir) {
    const output = outputText.value;
    if (!output) {
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'STANDBY';
      return;
    }

    if (dir === 'encode') {
      /* base64 alphabet validation */
      const base64Part = output.startsWith('data:') ? output.slice(output.indexOf(',') + 1) : output;
      const clean = base64Part.replace(/\s/g, '');
      const valid = /^[A-Za-z0-9+/]*={0,2}$/.test(clean);
      if (valid) {
        tBadge.className = 'tele-badge valid';
        tBadge.textContent = 'INTEGRITY: BASE64 STREAM VALID';
      } else {
        tBadge.className = 'tele-badge invalid';
        tBadge.textContent = 'SERIALIZATION ERR: INVALID CHARACTER ALIGNMENT';
      }
    } else {
      /* decode: just check if it's valid base64 */
      const clean = output.trim();
      try {
        const commaIdx = clean.indexOf(',');
        const b64 = commaIdx >= 0 ? clean.slice(commaIdx + 1) : clean;
        atob(b64.replace(/\s/g, ''));
        tBadge.className = 'tele-badge valid';
        tBadge.textContent = 'INTEGRITY: DECODE STREAM STABLE';
      } catch {
        tBadge.className = 'tele-badge invalid';
        tBadge.textContent = 'SERIALIZATION ERR: INVALID CHARACTER ALIGNMENT';
      }
    }
  }

  /* ─── UPDATE OUTPUT ─── */
  function updateOutput() {
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';

    if (mode === 'file') {
      /* file mode: output already set by handleFile */
      if (fileDataUrl) {
        computeTelemetry(fileDataUrl, 'encode');
        validateOutput('encode');
        tOp.textContent = 'FILE LOADED';
        if (direction === 'decode') {
          /* decode the data URL back */
          const result = decodeBase64(fileDataUrl);
          if (result.success) {
            outputText.value = result.data;
            tOp.textContent = 'DECODED';
            computeTelemetry(outputText.value, 'decode');
            validateOutput('decode');
          } else {
            tOp.textContent = 'DECODE ERROR';
            errorDetail.className = 'error-detail active';
            errorDetail.textContent = result.error;
            tBadge.className = 'tele-badge invalid';
            tBadge.textContent = 'SERIALIZATION ERR: INVALID CHARACTER ALIGNMENT';
          }
        }
      } else {
        outputText.value = '';
        tOp.textContent = '--';
        tBytes.textContent = '--';
        tExpansion.textContent = '--';
        tPadding.textContent = '--';
        tBadge.className = 'tele-badge standby';
        tBadge.textContent = 'STANDBY';
      }
      return;
    }

    const text = sourceText.value;
    if (!text) {
      outputText.value = '';
      tOp.textContent = '--';
      tBytes.textContent = '--';
      tExpansion.textContent = '--';
      tPadding.textContent = '--';
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'STANDBY';
      return;
    }

    if (direction === 'encode') {
      const result = encodeBase64(text);
      if (result.success) {
        outputText.value = result.data;
        tOp.textContent = 'ENCODED';
        computeTelemetry(result.data, 'encode');
        validateOutput('encode');
      } else {
        outputText.value = '';
        tOp.textContent = 'ENCODE ERROR';
        tBadge.className = 'tele-badge warn';
        tBadge.textContent = 'ENCODING FAILURE';
        errorDetail.className = 'error-detail active';
        errorDetail.textContent = result.error;
      }
    } else {
      const result = decodeBase64(text);
      if (result.success) {
        outputText.value = result.data;
        tOp.textContent = 'DECODED';
        computeTelemetry(text, 'decode');
        validateOutput('decode');
      } else {
        outputText.value = '';
        tOp.textContent = 'DECODE ERROR';
        tBadge.className = 'tele-badge invalid';
        tBadge.textContent = 'SERIALIZATION ERR: INVALID CHARACTER ALIGNMENT';
        errorDetail.className = 'error-detail active';
        errorDetail.textContent = result.error;
      }
    }
  }

  /* ─── INPUT EVENTS ─── */
  sourceText.addEventListener('input', updateOutput);

  /* ─── EXECUTE BUTTONS ─── */
  btnExecute.addEventListener('click', () => {
    direction = 'encode';
    dirEncode.classList.add('active');
    dirDecode.classList.remove('active');
    if (mode === 'file' && fileDataUrl) {
      outputText.value = fileDataUrl;
      tOp.textContent = 'ENCODED';
      computeTelemetry(fileDataUrl, 'encode');
      validateOutput('encode');
      return;
    }
    updateOutput();
  });

  btnDecode.addEventListener('click', () => {
    direction = 'decode';
    dirDecode.classList.add('active');
    dirEncode.classList.remove('active');
    updateOutput();
  });

  /* ─── COPY ─── */
  btnCopy.addEventListener('click', () => {
    const text = outputText.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopy.textContent;
      btnCopy.textContent = 'COPIED';
      btnCopy.style.borderColor = '#00e676';
      btnCopy.style.color = '#00e676';
      setTimeout(() => {
        btnCopy.textContent = orig;
        btnCopy.style.borderColor = '';
        btnCopy.style.color = '';
      }, 1500);
    }).catch(() => {});
  });

  /* ─── DOWNLOAD ─── */
  btnDownload.addEventListener('click', () => {
    const text = outputText.value;
    if (!text) return;
    const ext = direction === 'encode' ? '.b64' : '.txt';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output' + ext;
    a.click();
    URL.revokeObjectURL(url);
  });

  /* ─── PURGE ─── */
  function purgeAll() {
    sourceText.value = '';
    outputText.value = '';
    fileDataUrl = null;
    fileBytes = null;
    currentRawBytes = null;
    fileInfo.classList.add('hidden');
    fileName.textContent = '';
    fileSize.textContent = '';
    filePicker.value = '';
    dropzone.classList.remove('drag-over');
    tOp.textContent = '--';
    tBytes.textContent = '--';
    tExpansion.textContent = '--';
    tPadding.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
  }

  btnPurge.addEventListener('click', purgeAll);

  /* ─── HELPERS ─── */
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  /* ─── INIT ─── */
  function init() {
    /* set initial UI state */
    sourceText.value = 'Hello, Base64 World!';
    updateOutput();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
