(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── HTTP STATUS DATABASE ─── */
  const STATUS_CODES = [
    { code: 100, phrase: 'Continue', cls: 1, description: 'Indicates that the initial part of a request has been received and has not yet been rejected by the server. The client should continue by sending the remainder of the request or, if the request has already been completed, ignore this response.', commonHeaders: ['Cache-Control: no-cache', 'Expect: 100-continue'], rawHttp: 'HTTP/1.1 100 Continue\r\nCache-Control: no-cache\r\n\r\n' },
    { code: 101, phrase: 'Switching Protocols', cls: 1, description: 'The server understands and is willing to comply with the client request to switch protocols. The server will switch protocols to those defined by the Upgrade message header field.', commonHeaders: ['Upgrade: websocket', 'Connection: Upgrade'], rawHttp: 'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n' },
    { code: 200, phrase: 'OK', cls: 2, description: 'The request has succeeded. The meaning of the success depends on the HTTP method: GET — resource fetched; POST — resource created; PUT — resource updated; DELETE — resource deleted.', commonHeaders: ['Cache-Control: public, max-age=3600', 'Content-Type: application/json'], rawHttp: 'HTTP/1.1 200 OK\r\nCache-Control: public, max-age=3600\r\nContent-Type: application/json\r\nContent-Length: 243\r\n\r\n{"status":"ok","data":[]}' },
    { code: 201, phrase: 'Created', cls: 2, description: 'The request has been fulfilled and has resulted in one or more new resources being created. Typically sent in response to POST or PUT requests.', commonHeaders: ['Location: /resources/123', 'Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 201 Created\r\nLocation: /resources/123\r\nCache-Control: no-cache\r\nContent-Length: 0\r\n\r\n' },
    { code: 204, phrase: 'No Content', cls: 2, description: 'The server has successfully fulfilled the request and there is no additional content to send in the response payload body. Commonly used for DELETE operations.', commonHeaders: ['Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 204 No Content\r\nCache-Control: no-cache\r\n\r\n' },
    { code: 301, phrase: 'Moved Permanently', cls: 3, description: 'The target resource has been assigned a new permanent URI and any future references to this resource should use one of the enclosed URIs.', commonHeaders: ['Location: https://example.com/new-path', 'Cache-Control: public, max-age=86400'], rawHttp: 'HTTP/1.1 301 Moved Permanently\r\nLocation: https://example.com/new-path\r\nCache-Control: public, max-age=86400\r\nContent-Length: 0\r\n\r\n' },
    { code: 302, phrase: 'Found', cls: 3, description: 'The target resource resides temporarily under a different URI. The client should use the provided Location header for the immediate request.', commonHeaders: ['Location: /temporary-redirect'], rawHttp: 'HTTP/1.1 302 Found\r\nLocation: /temporary-redirect\r\nCache-Control: no-cache\r\n\r\n' },
    { code: 304, phrase: 'Not Modified', cls: 3, description: 'A conditional GET request has been received and the resource has not been modified since the date specified in the If-Modified-Since or If-None-Match header.', commonHeaders: ['Cache-Control: public, max-age=86400', 'ETag: "a1b2c3d4"'], rawHttp: 'HTTP/1.1 304 Not Modified\r\nCache-Control: public, max-age=86400\r\nETag: "a1b2c3d4"\r\n\r\n' },
    { code: 400, phrase: 'Bad Request', cls: 4, description: 'The server cannot or will not process the request due to something that is perceived to be a client error — malformed syntax, invalid request message framing, or deceptive request routing.', commonHeaders: ['Cache-Control: no-cache', 'Content-Type: application/problem+json'], rawHttp: 'HTTP/1.1 400 Bad Request\r\nCache-Control: no-cache\r\nContent-Type: application/problem+json\r\n\r\n{"error":"invalid_request","detail":"Missing required field"}' },
    { code: 401, phrase: 'Unauthorized', cls: 4, description: 'The request has not been applied because it lacks valid authentication credentials for the target resource. The response must include a WWW-Authenticate header.', commonHeaders: ['WWW-Authenticate: Bearer realm="api"', 'Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Bearer realm="api"\r\nCache-Control: no-cache\r\n\r\n{"error":"unauthorized","message":"Invalid or expired token"}' },
    { code: 403, phrase: 'Forbidden', cls: 4, description: 'The server understood the request but refuses to authorize it. Unlike 401, authenticating will make no difference, and the request SHOULD NOT be repeated.', commonHeaders: ['Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 403 Forbidden\r\nCache-Control: no-cache\r\n\r\n{"error":"forbidden","message":"Insufficient permissions"}' },
    { code: 404, phrase: 'Not Found', cls: 4, description: 'The origin server did not find a current representation for the target resource or is not willing to disclose that one exists. The most common HTTP error encountered.', commonHeaders: ['Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 404 Not Found\r\nCache-Control: no-cache\r\nContent-Type: text/plain\r\n\r\nResource not found: /api/users/999' },
    { code: 405, phrase: 'Method Not Allowed', cls: 4, description: 'The method received in the request-line is known by the origin server but not supported by the target resource. The response must include an Allow header.', commonHeaders: ['Allow: GET, HEAD, OPTIONS', 'Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 405 Method Not Allowed\r\nAllow: GET, HEAD, OPTIONS\r\nCache-Control: no-cache\r\n\r\n{"error":"method_not_allowed","allowed":["GET","HEAD","OPTIONS"]}' },
    { code: 429, phrase: 'Too Many Requests', cls: 4, description: 'The user has sent too many requests in a given amount of time ("rate limiting"). The response should include details explaining the condition and a Retry-After header.', commonHeaders: ['Retry-After: 60', 'X-RateLimit-Reset: 1718467260', 'Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 429 Too Many Requests\r\nRetry-After: 60\r\nX-RateLimit-Reset: 1718467260\r\nCache-Control: no-cache\r\n\r\n{"error":"rate_limit_exceeded","retry_after_seconds":60}' },
    { code: 500, phrase: 'Internal Server Error', cls: 5, description: 'The server encountered an unexpected condition that prevented it from fulfilling the request. This is a generic catch-all error for server-side failures.', commonHeaders: ['Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 500 Internal Server Error\r\nCache-Control: no-cache\r\nContent-Type: text/plain\r\n\r\nInternal Server Error — contact support with reference ID: ERR-7f3a9b' },
    { code: 502, phrase: 'Bad Gateway', cls: 5, description: 'The server, while acting as a gateway or proxy, received an invalid response from an upstream server it accessed to fulfill the request.', commonHeaders: ['Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 502 Bad Gateway\r\nCache-Control: no-cache\r\n\r\n<html><body><h1>502 Bad Gateway</h1><p>Upstream server unavailable</p></body></html>' },
    { code: 503, phrase: 'Service Unavailable', cls: 5, description: 'The server is currently unable to handle the request due to a temporary overload or scheduled maintenance. The Retry-After header should indicate when the service is expected to be available.', commonHeaders: ['Retry-After: 120', 'Cache-Control: no-cache'], rawHttp: 'HTTP/1.1 503 Service Unavailable\r\nRetry-After: 120\r\nCache-Control: no-cache\r\n\r\n{"error":"service_unavailable","maintenance":true,"estimated_downtime_seconds":120}' }
  ];

  /* ─── DOM REFS ─── */
  const searchInput = $('#searchInput');
  const filterRow = $('#filterRow');
  const cardsGrid = $('#cardsGrid');
  const resultCount = $('#resultCount');
  const inspectorContent = $('#inspectorContent');
  const tFilter = $('#tFilter');
  const tCount = $('#tCount');
  const tCache = $('#tCache');
  const tConn = $('#tConn');
  const tBadge = $('#tBadge');
  const btnCopyAll = $('#btnCopyAll');
  const btnSync = $('#btnSync');
  const btnErrors = $('#btnErrors');
  const btnFlush = $('#btnFlush');

  /* ─── STATE ─── */
  let activeClass = 'all';
  let searchQuery = '';
  let selectedCode = null;

  /* ─── RENDER CARDS ─── */
  function render() {
    const filtered = getFiltered();
    cardsGrid.innerHTML = '';
    resultCount.textContent = filtered.length;
    tCount.textContent = filtered.length;

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card cls-' + item.cls + (selectedCode === item.code ? ' selected' : '');
      card.dataset.code = item.code;
      card.innerHTML = '<div class="card-code">' + item.code + '</div><div class="card-phrase">' + item.phrase.toUpperCase() + '</div><div class="card-class">' + classLabel(item.cls) + '</div>';
      card.addEventListener('click', () => inspect(item));
      cardsGrid.appendChild(card);
    });

    updateTelemetry(filtered);
  }

  /* ─── FILTER LOGIC ─── */
  function getFiltered() {
    return STATUS_CODES.filter(item => {
      if (activeClass !== 'all' && item.cls !== parseInt(activeClass)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const codeMatch = item.code.toString().includes(q);
        const phraseMatch = item.phrase.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        if (!codeMatch && !phraseMatch && !descMatch) return false;
      }
      return true;
    });
  }

  function classLabel(cls) {
    const labels = { 1: '1xx INFORMATIONAL', 2: '2xx SUCCESS', 3: '3xx REDIRECTION', 4: '4xx CLIENT ERROR', 5: '5xx SERVER ERROR' };
    return labels[cls] || 'UNKNOWN';
  }

  /* ─── INSPECT ─── */
  function inspect(item) {
    selectedCode = item.code;
    /* update card selection */
    $$('.card').forEach(c => c.classList.toggle('selected', parseInt(c.dataset.code) === item.code));

    const headersHtml = item.commonHeaders.map(h => '<div>' + escapeHTML(h) + '</div>').join('');

    inspectorContent.innerHTML =
      '<div class="ins-code" style="color:' + classColor(item.cls) + '">' + item.code + '</div>' +
      '<div class="ins-phrase">' + item.phrase.toUpperCase() + '</div>' +
      '<div class="ins-desc">' + escapeHTML(item.description) + '</div>' +
      '<div class="ins-section-title">COMMON RESPONSE HEADERS</div>' +
      '<div class="ins-headers">' + headersHtml + '</div>' +
      '<div class="ins-section-title">RAW HTTP PAYLOAD</div>' +
      '<div class="ins-raw" id="rawPayload">' + escapeHTML(item.rawHttp) + '</div>' +
      '<button class="ins-copy-btn" id="copyRawBtn">COPY RAW PAYLOAD</button>';

    document.getElementById('copyRawBtn').addEventListener('click', () => {
      const payload = document.getElementById('rawPayload').textContent;
      navigator.clipboard.writeText(payload).then(() => {
        const btn = document.getElementById('copyRawBtn');
        btn.textContent = 'COPIED';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'COPY RAW PAYLOAD'; btn.classList.remove('copied'); }, 1200);
      }).catch(() => {});
    });
  }

  function classColor(cls) {
    const colors = { 1: '#00ffff', 2: '#33cc66', 3: '#af52de', 4: '#ffcc00', 5: '#ff3b30' };
    return colors[cls] || '#00e5ff';
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry(filtered) {
    const anyCached = filtered.some(item => item.commonHeaders.some(h => h.toLowerCase().includes('cache-control')));
    const anyPersistent = filtered.some(item => item.commonHeaders.some(h => h.toLowerCase().includes('keep-alive') || h.toLowerCase().includes('persistent')));

    tFilter.textContent = activeClass === 'all' ? 'ALL' : activeClass + 'xx ' + classLabel(parseInt(activeClass)).split(' ')[1];
    tCache.textContent = anyCached ? 'ELIGIBLE' : 'NONE';
    tCache.style.color = anyCached ? '#33cc66' : '#ffc800';
    tConn.textContent = anyPersistent ? 'PERSISTENT' : 'STANDARD';
    tConn.style.color = anyPersistent ? '#33cc66' : '#00e5ff';

    if (filtered.length > 0) {
      tBadge.className = 'tele-badge active';
      tBadge.textContent = '[ PROTOCOL INTEGRITY: ' + filtered.length + ' NODES ACTIVE ]';
    } else {
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'STANDBY — NO MATCHING CODES';
    }
  }

  /* ─── SYNC — rebuild registry display ─── */
  function syncRegistry() {
    selectedCode = null;
    render();
    inspectorContent.innerHTML = '<div class="inspector-empty">SELECT A STATUS CODE TO INSPECT</div>';
    tBadge.className = 'tele-badge active';
    tBadge.textContent = '[ PROTOCOL REGISTRY SYNCHRONIZED ]';
  }

  /* ─── ISOLATE ERRORS (4xx + 5xx) ─── */
  function isolateErrors() {
    activeClass = 'all';
    searchQuery = '';
    searchInput.value = '';
    $$('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.class === 'all'));
    /* filter to 4xx and 5xx */
    const errors = STATUS_CODES.filter(item => item.cls >= 4);
    cardsGrid.innerHTML = '';
    resultCount.textContent = errors.length;
    tCount.textContent = errors.length;

    errors.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card cls-' + item.cls;
      card.dataset.code = item.code;
      card.innerHTML = '<div class="card-code">' + item.code + '</div><div class="card-phrase">' + item.phrase.toUpperCase() + '</div><div class="card-class">' + classLabel(item.cls) + '</div>';
      card.addEventListener('click', () => inspect(item));
      cardsGrid.appendChild(card);
    });

    tFilter.textContent = '4xx-5xx ERRORS';
    updateTelemetry(errors);
    tBadge.className = 'tele-badge active';
    tBadge.textContent = '[ ERROR CLUSTERS ISOLATED: ' + errors.length + ' CODES ]';
    selectedCode = null;
    inspectorContent.innerHTML = '<div class="inspector-empty">SELECT A STATUS CODE TO INSPECT</div>';
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    activeClass = 'all';
    searchQuery = '';
    searchInput.value = '';
    selectedCode = null;
    $$('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.class === 'all'));
    render();
    inspectorContent.innerHTML = '<div class="inspector-empty">SELECT A STATUS CODE TO INSPECT</div>';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
  }

  /* ─── COPY ALL ─── */
  btnCopyAll.addEventListener('click', () => {
    const filtered = getFiltered();
    const text = filtered.map(item => item.code + ' ' + item.phrase).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      btnCopyAll.textContent = 'COPIED ' + filtered.length + ' RESULTS';
      btnCopyAll.style.borderColor = '#00e676';
      btnCopyAll.style.color = '#00e676';
      setTimeout(() => {
        btnCopyAll.textContent = 'COPY ALL RESULTS';
        btnCopyAll.style.borderColor = '';
        btnCopyAll.style.color = '';
      }, 1500);
    }).catch(() => {});
  });

  /* ─── EVENTS ─── */
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    render();
  });

  filterRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeClass = btn.dataset.class;
    render();
  });

  btnSync.addEventListener('click', syncRegistry);
  btnErrors.addEventListener('click', isolateErrors);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    render();
    /* inspect 200 by default */
    const ok = STATUS_CODES.find(c => c.code === 200);
    if (ok) inspect(ok);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
