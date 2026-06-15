(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── DOM REFS ─── */
  const methodSelect = $('#methodSelect');
  const endpointInput = $('#endpointInput');
  const endpointBar = $('#endpointBar');
  const requestPanel = $('#requestPanel');
  const requestBody = $('#requestBody');
  const bodyStatus = $('#bodyStatus');
  const responseBody = $('#responseBody');
  const responseHeaders = $('#responseHeaders');
  const tStatus = $('#tStatus');
  const tLatency = $('#tLatency');
  const tWeight = $('#tWeight');
  const tContentType = $('#tContentType');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const btnSend = $('#btnSend');
  const btnSimulate = $('#btnSimulate');
  const btnInject = $('#btnInject');
  const btnFlush = $('#btnFlush');

  /* ─── STATE ─── */
  let pendingTimeout = null;
  let bodyValid = true;

  /* ─── METHOD COLORS ─── */
  const METHOD_COLORS = {
    GET: { border: 'rgba(0,255,255,0.15)', text: '#00ffff' },
    POST: { border: 'rgba(51,204,102,0.15)', text: '#33cc66' },
    PUT: { border: 'rgba(255,204,0,0.15)', text: '#ffcc00' },
    DELETE: { border: 'rgba(255,59,48,0.15)', text: '#ff3b30' }
  };

  /* ─── MOCK RESPONSE GENERATORS ─── */
  const MOCK_RESPONSES = {
    GET: {
      body: { status: 'ok', data: { id: 42, name: 'Sample Resource', createdAt: '2026-06-15T12:00:00Z', updatedAt: '2026-06-15T12:30:00Z' }, meta: { page: 1, total: 100 } },
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req_' + Math.random().toString(36).slice(2,10), 'X-Powered-By': 'Native-JS-Engine', 'Cache-Control': 'public, max-age=60' }
    },
    POST: {
      body: { status: 'created', data: { id: 101, username: 'john.doe', email: 'john@example.com', role: 'developer' }, message: 'Resource created successfully' },
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req_' + Math.random().toString(36).slice(2,10), 'X-Powered-By': 'Native-JS-Engine', 'Location': '/api/v1/users/101' }
    },
    PUT: {
      body: { status: 'updated', data: { id: 42, name: 'Sample Resource', changes: ['name', 'role'] }, message: 'Resource updated successfully' },
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req_' + Math.random().toString(36).slice(2,10), 'X-Powered-By': 'Native-JS-Engine' }
    },
    DELETE: {
      body: { status: 'deleted', message: 'Resource successfully removed', id: 42 },
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req_' + Math.random().toString(36).slice(2,10), 'X-Powered-By': 'Native-JS-Engine' }
    }
  };

  /* ─── METHOD CHANGE ─── */
  function onMethodChange() {
    const method = methodSelect.value;
    const colors = METHOD_COLORS[method];

    /* update endpoint bar border color */
    endpointBar.className = 'endpoint-bar mode-' + method;

    /* show/hide request body */
    if (method === 'GET' || method === 'DELETE') {
      requestPanel.classList.add('hidden');
    } else {
      requestPanel.classList.remove('hidden');
    }

    /* update send button color */
    btnSend.style.borderColor = colors.text;
    btnSend.style.color = colors.text;

    validateBody();
  }

  methodSelect.addEventListener('change', onMethodChange);

  /* ─── JSON BODY VALIDATION ─── */
  function validateBody() {
    const method = methodSelect.value;
    if (method === 'GET' || method === 'DELETE') {
      bodyStatus.className = 'body-status';
      bodyStatus.textContent = '[HTTP ' + method + ': Payload Body Inhibited for Data Ingestion]';
      bodyValid = true;
      requestBody.classList.remove('json-error');
      return;
    }

    const text = requestBody.value.trim();
    if (!text) {
      bodyStatus.className = 'body-status';
      bodyStatus.textContent = '';
      bodyValid = false;
      requestBody.classList.remove('json-error');
      return;
    }

    try {
      JSON.parse(text);
      bodyStatus.className = 'body-status valid';
      bodyStatus.textContent = '[ JSON VALID: STRUCTURAL INTEGRITY CONFIRMED ]';
      bodyValid = true;
      requestBody.classList.remove('json-error');
    } catch (e) {
      bodyStatus.className = 'body-status active';
      bodyStatus.textContent = e.message;
      bodyValid = false;
      requestBody.classList.add('json-error');
    }
  }

  requestBody.addEventListener('input', validateBody);

  /* ─── SEND / SIMULATE REQUEST ─── */
  function sendRequest() {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    const method = methodSelect.value;
    const endpoint = endpointInput.value.trim() || 'https://api.example.com/v1/resources';

    /* validate body if needed */
    if ((method === 'POST' || method === 'PUT') && !bodyValid) {
      tBadge.className = 'tele-badge error';
      tBadge.textContent = '[ REQUEST BLOCKED: INVALID JSON BODY ]';
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = 'Correct JSON syntax errors before sending.';
      return;
    }

    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';

    responseBody.textContent = 'Sending ' + method + ' request to ' + endpoint + '...';
    responseHeaders.textContent = 'Waiting for response...';

    tBadge.className = 'tele-badge active';
    tBadge.textContent = '[ REQUEST IN FLIGHT: AWAITING RESPONSE ]';

    const latency = 100 + Math.floor(Math.random() * 500);

    pendingTimeout = setTimeout(() => {
      pendingTimeout = null;

      /* get mock response */
      const mock = MOCK_RESPONSES[method] || MOCK_RESPONSES.GET;
      const bodyStr = JSON.stringify(mock.body, null, 2);
      const headersArr = [];
      for (const [k, v] of Object.entries(mock.headers)) {
        headersArr.push(k + ': ' + v);
      }
      const headersStr = headersArr.join('\n');
      const byteWeight = new TextEncoder().encode(bodyStr).length;

      responseBody.textContent = bodyStr;
      responseHeaders.textContent = headersStr;

      /* telemetry */
      const statusCodes = { GET: 200, POST: 201, PUT: 200, DELETE: 200 };
      tStatus.textContent = statusCodes[method] + ' ' + method;
      tStatus.style.color = METHOD_COLORS[method].text;
      tLatency.textContent = latency + 'ms';
      tWeight.textContent = byteWeight + ' B';
      tContentType.textContent = 'application/json';

      tBadge.className = 'tele-badge success';
      tBadge.textContent = '[ ROUTING STABLE: RESPONSE DELIVERED (' + latency + 'ms) ]';

    }, latency);
  }

  /* ─── INJECT SUCCESS PROFILE ─── */
  function injectProfile() {
    methodSelect.value = 'POST';
    onMethodChange();
    endpointInput.value = 'https://api.example.com/v1/users';
    requestBody.value = JSON.stringify({
      username: 'jane.doe',
      email: 'jane@example.com',
      role: 'senior-developer',
      department: 'engineering',
      tags: ['api', 'backend', 'microservices']
    }, null, 2);
    validateBody();
    sendRequest();
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    if (pendingTimeout) { clearTimeout(pendingTimeout); pendingTimeout = null; }
    methodSelect.value = 'GET';
    onMethodChange();
    endpointInput.value = '';
    requestBody.value = '';
    responseBody.textContent = '<awaiting request>';
    responseHeaders.textContent = '<awaiting request>';
    tStatus.textContent = '--';
    tStatus.style.color = '';
    tLatency.textContent = '--';
    tWeight.textContent = '--';
    tContentType.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
    bodyStatus.className = 'body-status';
    bodyStatus.textContent = '';
    requestBody.classList.remove('json-error');
  }

  /* ─── EVENTS ─── */
  btnSend.addEventListener('click', sendRequest);
  btnSimulate.addEventListener('click', sendRequest);
  btnInject.addEventListener('click', injectProfile);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    endpointInput.value = 'https://api.example.com/v1/users/42';
    onMethodChange();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
