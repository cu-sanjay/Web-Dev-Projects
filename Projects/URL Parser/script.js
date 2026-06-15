(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── DOM REFS ─── */
  const urlInput = $('#urlInput');
  const rebuiltUrl = $('#rebuiltUrl');
  const segProtocol = $('#segProtocol');
  const segHost = $('#segHost');
  const segPort = $('#segPort');
  const segPath = $('#segPath');
  const segHash = $('#segHash');
  const queryTable = $('#queryTable');
  const tChars = $('#tChars');
  const tParams = $('#tParams');
  const tPort = $('#tPort');
  const tSSL = $('#tSSL');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const btnParse = $('#btnParse');
  const btnReconstruct = $('#btnReconstruct');
  const btnAddParam = $('#btnAddParam');
  const btnFlush = $('#btnFlush');
  const presetEcom = $('#presetEcom');
  const presetOAuth = $('#presetOAuth');
  const presetLocal = $('#presetLocal');

  /* ─── STATE ─── */
  let currentUrl = null;
  let suppressSync = false;

  /* ─── PRESETS ─── */
  const PRESETS = {
    ecom: 'https://shop.example.com:443/products/category?page=2&sort=price_asc&limit=24&filter=in_stock#reviews',
    oauth: 'https://auth.provider.io/oauth/callback?code=4xR7t9mK2wQ5bL8nV1cF3pY6&state=csrf_token_a1b2c3d4e5&scope=openid+profile+email&redirect_uri=https://app.example.com/dashboard',
    local: 'http://localhost:3000/dev-tools/debug?file=main.bundle.js&env=development&cache=false&sourcemap=true#:~:text=debugging'
  };

  presetEcom.addEventListener('click', () => { urlInput.value = PRESETS.ecom; parseUrl(); });
  presetOAuth.addEventListener('click', () => { urlInput.value = PRESETS.oauth; parseUrl(); });
  presetLocal.addEventListener('click', () => { urlInput.value = PRESETS.local; parseUrl(); });

  /* ─── PARSE URL ─── */
  function parseUrl() {
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';

    const raw = urlInput.value.trim();
    if (!raw) {
      resetSegments();
      rebuiltUrl.value = '';
      updateTelemetry(0, 0, false, false);
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'STANDBY';
      return;
    }

    try {
      const url = new URL(raw);
      currentUrl = url;
      populateSegments(url);
      populateQueryTable(url);
      rebuildUrlString(url);
      updateTelemetry(raw.length, url.searchParams.size, !!url.port, url.protocol === 'https:');
      tBadge.className = 'tele-badge valid';
      tBadge.textContent = '[ PARSER STABILIZED: UNIFORM RESOURCE NODE MAPPED ]';
    } catch (e) {
      currentUrl = null;
      resetSegments();
      rebuiltUrl.value = '';
      updateTelemetry(raw.length, 0, false, false);
      tBadge.className = 'tele-badge invalid';
      tBadge.textContent = '[ PARSER ERROR: MALFORMED URL STRING ]';
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = e.message;
    }
  }

  /* ─── POPULATE SEGMENTS ─── */
  function populateSegments(url) {
    segProtocol.textContent = url.protocol || '--';
    segHost.textContent = url.hostname || '--';
    segPort.textContent = url.port || '(default)';
    segPath.textContent = url.pathname || '--';
    segHash.textContent = url.hash || '(none)';
  }

  function resetSegments() {
    segProtocol.textContent = '--';
    segHost.textContent = '--';
    segPort.textContent = '--';
    segPath.textContent = '--';
    segHash.textContent = '--';
  }

  /* ─── QUERY TABLE ─── */
  function populateQueryTable(url) {
    /* keep header row, remove data rows */
    while (queryTable.children.length > 1) {
      queryTable.removeChild(queryTable.lastChild);
    }

    url.searchParams.forEach((value, key) => {
      addQueryRow(key, value);
    });
  }

  function addQueryRow(key, value) {
    const row = document.createElement('div');
    row.className = 'query-row';

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'qp-key';
    keyInput.value = key;
    keyInput.placeholder = 'key';

    const valInput = document.createElement('input');
    valInput.type = 'text';
    valInput.className = 'qp-val';
    valInput.value = value;
    valInput.placeholder = 'value';

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete parameter';

    row.appendChild(keyInput);
    row.appendChild(valInput);
    row.appendChild(delBtn);
    queryTable.appendChild(row);

    /* synchronize on edit */
    keyInput.addEventListener('input', syncFromTable);
    valInput.addEventListener('input', syncFromTable);
    delBtn.addEventListener('click', () => {
      queryTable.removeChild(row);
      syncFromTable();
    });
  }

  /* ─── TWO-WAY SYNC ─── */
  function syncFromTable() {
    if (suppressSync || !currentUrl) return;

    /* rebuild URL from current rows */
    const rows = $$('.query-row');
    const params = [];
    rows.forEach(row => {
      const key = row.querySelector('.qp-key').value.trim();
      const val = row.querySelector('.qp-val').value.trim();
      if (key) params.push([key, val]);
    });

    /* mutate currentUrl search params */
    currentUrl.search = '';
    params.forEach(([k, v]) => currentUrl.searchParams.append(k, v));

    rebuildUrlString(currentUrl);
    updateTelemetry(urlInput.value.length, currentUrl.searchParams.size, !!currentUrl.port, currentUrl.protocol === 'https:');
  }

  /* ─── REBUILD URL STRING ─── */
  function rebuildUrlString(url) {
    rebuiltUrl.value = url.toString();
  }

  /* ─── RECONSTRUCT ─── */
  function reconstructUrl() {
    if (!currentUrl) { parseUrl(); return; }
    /* push current URL back to input */
    suppressSync = true;
    urlInput.value = currentUrl.toString();
    suppressSync = false;
    parseUrl();
  }

  /* ─── ADD BLANK PARAM ─── */
  function addBlankParam() {
    if (!currentUrl) {
      /* try to parse first */
      parseUrl();
      if (!currentUrl) return;
    }
    addQueryRow('', '');
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry(chars, paramCount, hasPort, isSecure) {
    tChars.textContent = chars;
    tParams.textContent = paramCount;
    tPort.textContent = hasPort ? 'CUSTOM' : 'DEFAULT';
    tPort.style.color = hasPort ? '#ffc800' : '#00e676';
    tSSL.textContent = isSecure ? 'HTTPS' : 'HTTP';
    tSSL.style.color = isSecure ? '#00e676' : '#ffc800';
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    currentUrl = null;
    urlInput.value = '';
    rebuiltUrl.value = '';
    resetSegments();
    while (queryTable.children.length > 1) queryTable.removeChild(queryTable.lastChild);
    tChars.textContent = '--';
    tParams.textContent = '--';
    tPort.textContent = '--';
    tPort.style.color = '';
    tSSL.textContent = '--';
    tSSL.style.color = '';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
  }

  /* ─── EVENTS ─── */
  btnParse.addEventListener('click', parseUrl);
  btnReconstruct.addEventListener('click', reconstructUrl);
  btnAddParam.addEventListener('click', addBlankParam);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    parseUrl();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
