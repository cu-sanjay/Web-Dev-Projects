/**
 * REST API Testing Studio - Core Engine Script
 * Handles Request Builder, Mock Database Sandboxing, JSON Pretty-Printing & Collections
 */

// ==========================================================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================================================
let state = {
  history: [],
  collections: [],
  mockDatabase: {
    users: [],
    todos: []
  },
  theme: 'dark'
};

const STORAGE_KEYS = {
  HISTORY: 'cc_api_history',
  COLLECTIONS: 'cc_api_collections',
  DATABASE: 'cc_api_mockdb',
  THEME: 'cc_api_theme'
};

// ==========================================================================
// SEED DATA GENERATOR
// ==========================================================================
function getMockDatabaseSeeds() {
  return {
    users: [
      { id: 1, name: 'Alice Vance', email: 'alice@dev.local', role: 'Staff Engineer' },
      { id: 2, name: 'Bob Sterling', email: 'bob@ops.local', role: 'DevOps Lead' },
      { id: 3, name: 'Charlie Dean', email: 'charlie@prod.local', role: 'Product Manager' },
      { id: 4, name: 'Diana Prince', email: 'diana@sec.local', role: 'Security Engineer' }
    ],
    todos: [
      { id: 1, title: 'Implement Web Audio synthesizers', completed: true },
      { id: 2, title: 'Verify layout access keys & ARIA specs', completed: false },
      { id: 3, title: 'Sync database JSON backups uploader', completed: false },
      { id: 4, title: 'Commit repository issue updates', completed: true }
    ]
  };
}

function generateDefaultSeeds() {
  const seedsDb = getMockDatabaseSeeds();
  
  const defaultCollections = [
    {
      id: 'c-1',
      name: 'Mock Server Users API',
      requests: [
        {
          id: 'cr-1',
          name: 'GET All Users',
          method: 'GET',
          url: 'https://api.mockbin/v1/users',
          query: [],
          headers: [{ key: 'Accept', value: 'application/json' }],
          auth: { type: 'none', bearer: '', basicUser: '', basicPass: '', keyName: '', keyValue: '' },
          body: ''
        },
        {
          id: 'cr-2',
          name: 'POST Create User',
          method: 'POST',
          url: 'https://api.mockbin/v1/users',
          query: [],
          headers: [{ key: 'Content-Type', value: 'application/json' }],
          auth: { type: 'bearer', bearer: 'mock_token_xyz123', basicUser: '', basicPass: '', keyName: '', keyValue: '' },
          body: '{\n  "name": "Bruce Wayne",\n  "email": "bruce@gotham.local",\n  "role": "CEO & Tech Lead"\n}'
        }
      ]
    },
    {
      id: 'c-2',
      name: 'Mock Server Todos API',
      requests: [
        {
          id: 'cr-3',
          name: 'GET Pending Todos',
          method: 'GET',
          url: 'https://api.mockbin/v1/todos',
          query: [{ key: 'completed', value: 'false' }],
          headers: [],
          auth: { type: 'none', bearer: '', basicUser: '', basicPass: '', keyName: '', keyValue: '' },
          body: ''
        }
      ]
    }
  ];

  const defaultHistory = [
    {
      id: 'h-1',
      method: 'GET',
      url: 'https://api.mockbin/v1/users',
      query: [],
      headers: [{ key: 'Accept', value: 'application/json' }],
      auth: { type: 'none', bearer: '', basicUser: '', basicPass: '', keyName: '', keyValue: '' },
      body: '',
      timestamp: new Date().toLocaleTimeString(),
      status: 200,
      statusText: 'OK',
      time: 140,
      size: '0.45 KB'
    }
  ];

  return { history: defaultHistory, collections: defaultCollections, mockDatabase: seedsDb, theme: 'dark' };
}

function loadState() {
  const localHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const localCollections = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
  const localDatabase = localStorage.getItem(STORAGE_KEYS.DATABASE);
  const localTheme = localStorage.getItem(STORAGE_KEYS.THEME);

  if (localHistory || localCollections || localDatabase) {
    state.history = JSON.parse(localHistory || '[]');
    state.collections = JSON.parse(localCollections || '[]');
    state.mockDatabase = JSON.parse(localDatabase || '{"users":[],"todos":[]}');
    state.theme = localTheme || 'dark';
  } else {
    state = generateDefaultSeeds();
    saveState();
  }
  applyTheme();
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(state.collections));
  localStorage.setItem(STORAGE_KEYS.DATABASE, JSON.stringify(state.mockDatabase));
  localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

// ==========================================================================
// LOCAL MOCK SERVER ROUTER (Bypasses CORS restrictions offline)
// ==========================================================================
function isMockURL(url) {
  return url.toLowerCase().includes('api.mockbin/v1');
}

function simulateMockRequest(method, urlPath, queryParams, headers, body) {
  return new Promise((resolve) => {
    // Generate realistic server latency (100ms - 250ms)
    const latency = Math.floor(Math.random() * 150) + 100;
    
    // Parse URL path to find table & dynamic IDs (e.g. /users or /users/1)
    const cleanPath = urlPath.toLowerCase().replace(/https?:\/\/api\.mockbin\/v1\/?/, '').split('?')[0];
    const pathParts = cleanPath.split('/').filter(p => p !== '');
    
    const table = pathParts[0]; // 'users' or 'todos'
    const id = pathParts[1] ? parseInt(pathParts[1]) : null;

    setTimeout(() => {
      // Check resource tables
      if (table !== 'users' && table !== 'todos') {
        resolve({
          status: 404,
          statusText: 'Not Found',
          time: latency,
          headers: {
            'Content-Type': 'application/json',
            'X-Powered-By': 'Mockbin Sandbox Engine',
            'Date': new Date().toUTCString()
          },
          body: JSON.stringify({ error: `Mock endpoint path "/${table}" is not configured. Supported tables: /users, /todos` })
        });
        return;
      }

      const dbTable = state.mockDatabase[table];
      let responseBody = null;
      let statusCode = 200;
      let statusText = 'OK';

      // PROCESS REQUEST METHODS
      if (method === 'GET') {
        if (id) {
          const item = dbTable.find(x => x.id === id);
          if (item) {
            responseBody = item;
          } else {
            statusCode = 404;
            statusText = 'Not Found';
            responseBody = { error: `Record with ID ${id} not found in mock /${table} table.` };
          }
        } else {
          // Check query filters
          let results = [...dbTable];
          queryParams.forEach(q => {
            if (q.key && q.value) {
              results = results.filter(x => {
                const val = x[q.key];
                if (typeof val === 'boolean') {
                  return val.toString() === q.value.toLowerCase();
                }
                return val && val.toString().toLowerCase().includes(q.value.toLowerCase());
              });
            }
          });
          responseBody = results;
        }
      } 
      
      else if (method === 'POST') {
        try {
          const payload = JSON.parse(body || '{}');
          if (!payload.name && table === 'users') {
            statusCode = 400;
            statusText = 'Bad Request';
            responseBody = { error: 'Payload validation failed: "name" property is required.' };
          } else if (!payload.title && table === 'todos') {
            statusCode = 400;
            statusText = 'Bad Request';
            responseBody = { error: 'Payload validation failed: "title" property is required.' };
          } else {
            const newId = dbTable.length > 0 ? Math.max(...dbTable.map(x => x.id)) + 1 : 1;
            
            let newItem = { id: newId, ...payload };
            if (table === 'todos') {
              newItem.completed = payload.completed !== undefined ? payload.completed : false;
            }

            dbTable.push(newItem);
            saveState();
            updateDatabaseUI();
            
            statusCode = 21; // Custom 201 Created alias, styled inside badges
            statusText = 'Created';
            responseBody = newItem;
          }
        } catch (e) {
          statusCode = 400;
          statusText = 'Bad Request';
          responseBody = { error: 'Payload parsing failed. Body must be a valid JSON string.' };
        }
      } 
      
      else if (method === 'PUT' || method === 'PATCH') {
        if (!id) {
          statusCode = 400;
          statusText = 'Bad Request';
          responseBody = { error: 'Record ID missing in URL path.' };
        } else {
          const idx = dbTable.findIndex(x => x.id === id);
          if (idx === -1) {
            statusCode = 404;
            statusText = 'Not Found';
            responseBody = { error: `Record with ID ${id} not found in mock /${table} table.` };
          } else {
            try {
              const payload = JSON.parse(body || '{}');
              const current = dbTable[idx];
              
              // Modify record
              dbTable[idx] = { ...current, ...payload, id }; // Force ID lock
              saveState();
              updateDatabaseUI();
              
              responseBody = dbTable[idx];
            } catch (e) {
              statusCode = 400;
              statusText = 'Bad Request';
              responseBody = { error: 'Payload parsing failed. Body must be a valid JSON string.' };
            }
          }
        }
      } 
      
      else if (method === 'DELETE') {
        if (!id) {
          statusCode = 400;
          statusText = 'Bad Request';
          responseBody = { error: 'Record ID missing in URL path.' };
        } else {
          const idx = dbTable.findIndex(x => x.id === id);
          if (idx === -1) {
            statusCode = 404;
            statusText = 'Not Found';
            responseBody = { error: `Record with ID ${id} not found in mock /${table} table.` };
          } else {
            dbTable.splice(idx, 1);
            saveState();
            updateDatabaseUI();
            
            responseBody = { success: true, message: `Record with ID ${id} successfully deleted from mock /${table} table.` };
          }
        }
      }

      resolve({
        status: statusCode,
        statusText: statusText,
        time: latency,
        headers: {
          'Content-Type': 'application/json',
          'X-Powered-By': 'Mockbin Sandbox Engine',
          'Date': new Date().toUTCString(),
          'Server-Latency': `${latency}ms`
        },
        body: JSON.stringify(responseBody, null, 2)
      });
    }, latency);
  });
}

// ==========================================================================
// DYNAMIC BIDIRECTIONAL PARAMS EDITORS GRID
// ==========================================================================
function getParamsFromGrid(gridId) {
  const container = document.getElementById(gridId);
  const rows = container.querySelectorAll('.param-row');
  const params = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const key = inputs[0].value.trim();
    const val = inputs[1].value.trim();
    if (key || val) {
      params.push({ key, value: val });
    }
  });
  return params;
}

function renderParamsGrid(gridId, paramsArray) {
  const container = document.getElementById(gridId);
  container.innerHTML = '';

  const params = paramsArray && paramsArray.length > 0 ? paramsArray : [{ key: '', value: '' }];

  params.forEach((param, idx) => {
    const row = document.createElement('div');
    row.className = 'param-row';
    row.innerHTML = `
      <input type="text" placeholder="Key" value="${escapeHTML(param.key)}" data-type="key">
      <input type="text" placeholder="Value" value="${escapeHTML(param.value)}" data-type="value">
      <button class="btn-icon text-danger" onclick="removeParamRow('${gridId}', ${idx})" title="Remove parameter row"><i class="fa-solid fa-trash-can"></i></button>
    `;

    // Listeners for key/value change to auto sync queries with URL bar
    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        if (gridId === 'query-params-grid') {
          syncParamsToURL();
        }
      });
    });

    container.appendChild(row);
  });
}

function addParamRow(gridId) {
  const params = getParamsFromGrid(gridId);
  params.push({ key: '', value: '' });
  renderParamsGrid(gridId, params);
}

function removeParamRow(gridId, idx) {
  const params = getParamsFromGrid(gridId);
  params.splice(idx, 1);
  renderParamsGrid(gridId, params);
  if (gridId === 'query-params-grid') {
    syncParamsToURL();
  }
}

// Bidirectional URL Query synchronization
function syncParamsToURL() {
  const urlInput = document.getElementById('request-url');
  let urlStr = urlInput.value.trim();
  if (!urlStr) return;

  try {
    const params = getParamsFromGrid('query-params-grid');
    // Strip existing query if present
    const basePart = urlStr.split('?')[0];
    
    if (params.length === 0) {
      urlInput.value = basePart;
      return;
    }

    const searchParams = new URLSearchParams();
    params.forEach(p => {
      if (p.key) {
        searchParams.append(p.key, p.value);
      }
    });

    const queryString = searchParams.toString();
    urlInput.value = queryString ? `${basePart}?${queryString}` : basePart;
  } catch (e) {
    // Silently proceed for relative or custom URLs
  }
}

function syncURLToParams() {
  const urlInput = document.getElementById('request-url');
  const urlStr = urlInput.value.trim();
  if (!urlStr) return;

  try {
    const idx = urlStr.indexOf('?');
    if (idx === -1) {
      renderParamsGrid('query-params-grid', []);
      return;
    }

    const queryString = urlStr.substring(idx + 1);
    const searchParams = new URLSearchParams(queryString);
    const params = [];
    searchParams.forEach((val, key) => {
      params.push({ key, value: val });
    });

    renderParamsGrid('query-params-grid', params);
  } catch (e) {
    // Non-standard formats
  }
}

// ==========================================================================
// CORE SEND REQUEST LOGIC
// ==========================================================================
async function sendAPIRequest() {
  const method = document.getElementById('request-method').value;
  const url = document.getElementById('request-url').value.trim();
  
  if (!url) {
    alert('Please enter a target request URL endpoint.');
    return;
  }

  // Toggle Loading State view
  document.getElementById('response-blank-state').classList.add('hidden');
  document.getElementById('response-loading-state').classList.remove('hidden');
  document.getElementById('response-active-pane').classList.add('hidden');
  document.getElementById('response-stats-bar').classList.add('hidden');

  const queryParams = getParamsFromGrid('query-params-grid');
  const headers = getParamsFromGrid('headers-params-grid');
  const auth = getAuthConfig();
  const requestBody = document.getElementById('request-body-area').value;

  // Process Authorization injection
  const finalHeaders = [...headers];
  if (auth.type === 'bearer' && auth.bearer) {
    finalHeaders.push({ key: 'Authorization', value: `Bearer ${auth.bearer}` });
  } else if (auth.type === 'basic' && auth.basicUser) {
    const encoded = btoa(`${auth.basicUser}:${auth.basicPass}`);
    finalHeaders.push({ key: 'Authorization', value: `Basic ${encoded}` });
  } else if (auth.type === 'apikey' && auth.keyName) {
    finalHeaders.push({ key: auth.keyName, value: auth.keyValue });
  }

  let finalResponse = null;

  if (isMockURL(url)) {
    // Route to internal local server sandbox simulator
    finalResponse = await simulateMockRequest(method, url, queryParams, finalHeaders, requestBody);
  } else {
    // Real HTTP Fetch execution
    const t0 = performance.now();
    try {
      const fetchOptions = {
        method: method,
        headers: {}
      };

      finalHeaders.forEach(h => {
        if (h.key) {
          fetchOptions.headers[h.key] = h.value;
        }
      });

      if (method !== 'GET' && method !== 'HEAD' && requestBody) {
        fetchOptions.body = requestBody;
      }

      const response = await fetch(url, fetchOptions);
      const text = await response.text();
      const t1 = performance.now();

      const responseHeaders = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      finalResponse = {
        status: response.status,
        statusText: response.statusText,
        time: Math.round(t1 - t0),
        headers: responseHeaders,
        body: text
      };
    } catch (err) {
      finalResponse = {
        status: 0,
        statusText: 'Network Error',
        time: Math.round(performance.now() - t0),
        headers: {
          'X-Error-Reason': 'CORS policy blocked request or target server offline.'
        },
        body: JSON.stringify({
          error: 'HTTP Fetch failed. Check server status or browser CORS blockers.',
          message: err.message,
          tip: 'Use mock endpoints like https://api.mockbin/v1/users to test API queries offline without CORS blocks.'
        }, null, 2)
      };
    }
  }

  // Render Response Inspectors
  displayResponseData(finalResponse);

  // Save request to Sidebar history array
  const historyItem = {
    id: `h-${Date.now()}`,
    method: method,
    url: url,
    query: queryParams,
    headers: headers,
    auth: auth,
    body: requestBody,
    timestamp: new Date().toLocaleTimeString(),
    status: finalResponse.status,
    statusText: finalResponse.statusText,
    time: finalResponse.time,
    size: (finalResponse.body.length / 1024).toFixed(2) + ' KB'
  };

  state.history.unshift(historyItem);
  saveState();
  renderHistory();
}

function getAuthConfig() {
  const type = document.getElementById('auth-type').value;
  return {
    type: type,
    bearer: document.getElementById('auth-bearer-token').value,
    basicUser: document.getElementById('auth-basic-username').value,
    basicPass: document.getElementById('auth-basic-password').value,
    keyName: document.getElementById('auth-api-key-name').value,
    keyValue: document.getElementById('auth-api-key-value').value
  };
}

function setAuthConfig(auth) {
  if (!auth) return;
  document.getElementById('auth-type').value = auth.type;
  document.getElementById('auth-bearer-token').value = auth.bearer || '';
  document.getElementById('auth-basic-username').value = auth.basicUser || '';
  document.getElementById('auth-basic-password').value = auth.basicPass || '';
  document.getElementById('auth-api-key-name').value = auth.keyName || '';
  document.getElementById('auth-api-key-value').value = auth.keyValue || '';
  
  toggleAuthFields();
}

function displayResponseData(response) {
  // Sync Status line stats values
  const statsBar = document.getElementById('response-stats-bar');
  const badge = document.getElementById('resp-status-badge');
  const time = document.getElementById('resp-time-badge');
  const size = document.getElementById('resp-size-badge');

  statsBar.classList.remove('hidden');
  document.getElementById('response-loading-state').classList.add('hidden');
  document.getElementById('response-active-pane').classList.remove('hidden');

  badge.innerText = `${response.status} ${response.statusText}`;
  
  // Set badge colors based on status code ranges
  if (response.status >= 200 && response.status < 300) {
    badge.className = 'badge-status status-success';
  } else if (response.status >= 400 && response.status < 500) {
    badge.className = 'badge-status status-client-error';
  } else {
    badge.className = 'badge-status status-server-error';
  }

  time.innerHTML = `<i class="fa-solid fa-stopwatch"></i> ${response.time} ms`;
  
  const byteLength = response.body ? response.body.length : 0;
  size.innerHTML = `<i class="fa-solid fa-file-code"></i> ${(byteLength / 1024).toFixed(2)} KB`;

  // Render Body Pretty code (Detect JSON and syntax highlight it)
  const bodyPre = document.getElementById('response-body-pre');
  try {
    const parsedJSON = JSON.parse(response.body);
    bodyPre.innerHTML = highlightJSON(parsedJSON);
  } catch (e) {
    bodyPre.innerText = response.body || 'Empty response payload...';
  }

  // Render Response headers list
  const headersContainer = document.getElementById('response-headers-container');
  headersContainer.innerHTML = '';

  Object.entries(response.headers).forEach(([key, val]) => {
    const row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = `
      <span class="hdr-key">${escapeHTML(key)}</span>
      <span class="hdr-value">${escapeHTML(val)}</span>
    `;
    headersContainer.appendChild(row);
  });
}

// Pretty print JSON Parser with CSS span markers
function highlightJSON(json) {
  let jsonString = typeof json !== 'string' ? JSON.stringify(json, null, 2) : json;
  
  // Escape HTML brackets
  jsonString = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Replace tokens with span classes
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
// HISTORY LOG VIEWERS
// ==========================================================================
function renderHistory() {
  const container = document.getElementById('history-container');
  container.innerHTML = '';

  if (state.history.length === 0) {
    container.innerHTML = '<div style="font-size:0.8rem; color:var(--text-secondary); text-align:center; padding-top:20px;">No requests logged in history list.</div>';
    return;
  }

  state.history.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.onclick = () => loadRequestState(item);

    // Extract path name only to keep URL logs readable
    let displayUrl = item.url;
    try {
      const urlObj = new URL(item.url);
      displayUrl = urlObj.pathname + urlObj.search;
    } catch (e) {
      // Relative URL
    }

    el.innerHTML = `
      <span class="badge-method method-${item.method}">${item.method}</span>
      <span class="history-url" title="${escapeHTML(item.url)}">${escapeHTML(displayUrl)}</span>
      <span style="font-size:0.65rem; color:var(--text-secondary); font-weight:600;">${item.status || 'ERR'}</span>
    `;
    container.appendChild(el);
  });
}

function loadRequestState(req) {
  document.getElementById('request-method').value = req.method;
  document.getElementById('request-url').value = req.url;
  document.getElementById('request-body-area').value = req.body || '';

  renderParamsGrid('query-params-grid', req.query);
  renderParamsGrid('headers-params-grid', req.headers);
  setAuthConfig(req.auth);

  // Sync preset selectors
  const presets = document.getElementById('preset-endpoints');
  presets.value = '';
}

function clearHistory() {
  const confirmAction = confirm('Clear request history history list?');
  if (confirmAction) {
    state.history = [];
    saveState();
    renderHistory();
  }
}

// ==========================================================================
// COLLECTIONS TREE COMPILER
// ==========================================================================
function renderCollections() {
  const container = document.getElementById('collections-container');
  container.innerHTML = '';

  if (state.collections.length === 0) {
    container.innerHTML = '<div style="font-size:0.8rem; color:var(--text-secondary); text-align:center; padding-top:20px;">No folder collections created.</div>';
    return;
  }

  state.collections.forEach(col => {
    const folder = document.createElement('div');
    folder.className = 'collection-folder';
    folder.id = `folder-node-${col.id}`;
    
    let itemsHTML = '';
    col.requests.forEach(req => {
      itemsHTML += `
        <div class="folder-request-item" onclick="loadRequestStateById('${col.id}', '${req.id}')">
          <span class="badge-method method-${req.method}" style="width:36px; padding:2px 4px; font-size:0.55rem;">${req.method}</span>
          <span class="col-req-name" title="${escapeHTML(req.name)}">${escapeHTML(req.name)}</span>
          <button class="btn-icon-delete" onclick="deleteCollectionRequest('${col.id}', '${req.id}', event)" title="Delete Request"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `;
    });

    folder.innerHTML = `
      <div class="folder-header" onclick="toggleFolder('${col.id}')">
        <div class="folder-left">
          <i class="fa-solid fa-folder"></i>
          <span>${escapeHTML(col.name)}</span>
        </div>
        <div class="folder-actions">
          <button class="btn-folder-action" onclick="deleteCollection('${col.id}', event)" title="Delete Folder"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
      <div class="folder-requests-list">
        ${itemsHTML || '<div style="font-size:0.7rem; color:var(--text-secondary); padding:4px 10px;">Empty folder. Save requests here.</div>'}
      </div>
    `;
    container.appendChild(folder);
  });

  // Sync Save Request modal dropdown
  const select = document.getElementById('save-request-collection');
  select.innerHTML = '';
  state.collections.forEach(col => {
    const opt = document.createElement('option');
    opt.value = col.id;
    opt.innerText = col.name;
    select.appendChild(opt);
  });
}

function toggleFolder(id) {
  const folder = document.getElementById(`folder-node-${id}`);
  if (folder) {
    folder.classList.toggle('open');
  }
}

function loadRequestStateById(colId, reqId) {
  const col = state.collections.find(c => c.id === colId);
  if (col) {
    const req = col.requests.find(r => r.id === reqId);
    if (req) {
      loadRequestState(req);
    }
  }
}

function createNewCollection(name) {
  if (!name.trim()) return;
  state.collections.push({
    id: `c-${Date.now()}`,
    name: name.trim(),
    requests: []
  });
  saveState();
  renderCollections();
}

function deleteCollection(id, event) {
  event.stopPropagation();
  const confirmAction = confirm('Delete this collection folder and all saved requests?');
  if (confirmAction) {
    state.collections = state.collections.filter(c => c.id !== id);
    saveState();
    renderCollections();
  }
}

function deleteCollectionRequest(colId, reqId, event) {
  event.stopPropagation();
  const col = state.collections.find(c => c.id === colId);
  if (col) {
    col.requests = col.requests.filter(r => r.id !== reqId);
    saveState();
    renderCollections();
  }
}

function saveRequestToCollection(name, colId) {
  const col = state.collections.find(c => c.id === colId);
  if (!col) return;

  const method = document.getElementById('request-method').value;
  const url = document.getElementById('request-url').value.trim();
  const query = getParamsFromGrid('query-params-grid');
  const headers = getParamsFromGrid('headers-params-grid');
  const auth = getAuthConfig();
  const body = document.getElementById('request-body-area').value;

  col.requests.push({
    id: `cr-${Date.now()}`,
    name: name.trim() || 'Saved Request',
    method,
    url,
    query,
    headers,
    auth,
    body
  });

  saveState();
  renderCollections();
}

// ==========================================================================
// MOCK DATABASE VIEWER & CONTROLLER
// ==========================================================================
function updateDatabaseUI() {
  document.getElementById('db-count-users').innerText = `${state.mockDatabase.users.length} records`;
  document.getElementById('db-count-todos').innerText = `${state.mockDatabase.todos.length} records`;
}

function resetMockDatabase() {
  const confirmAction = confirm('Are you sure you want to reset the offline mock database tables? This action deletes all custom additions.');
  if (confirmAction) {
    state.mockDatabase = getMockDatabaseSeeds();
    saveState();
    updateDatabaseUI();
    alert('Mock Server Sandbox tables reset successfully.');
  }
}

// ==========================================================================
// INTERFACE CONTROLS & SUB-TABS ROUTING
// ==========================================================================
function switchSidebarTab(tabName) {
  // Toggle tab buttons active
  document.querySelectorAll('.side-tab').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle tab panes active
  document.querySelectorAll('.sidebar-pane').forEach(pane => {
    if (pane.id === `pane-${tabName}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

function switchConfigTab(tabName) {
  document.querySelectorAll('.config-tab').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.config-pane').forEach(pane => {
    if (pane.id === `pane-config-${tabName}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

function switchResponseTab(tabName) {
  document.querySelectorAll('.resp-tab').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.response-sub-pane').forEach(pane => {
    if (pane.id === `resp-pane-${tabName}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

function toggleAuthFields() {
  const type = document.getElementById('auth-type').value;
  
  // Hide all fields first
  document.querySelectorAll('.auth-fields-block').forEach(b => b.classList.add('hidden'));

  if (type === 'bearer') {
    document.getElementById('auth-block-bearer').classList.remove('hidden');
  } else if (type === 'basic') {
    document.getElementById('auth-block-basic').classList.remove('hidden');
  } else if (type === 'apikey') {
    document.getElementById('auth-block-apikey').classList.remove('hidden');
  }
}

function formatJSONRequestBody() {
  const area = document.getElementById('request-body-area');
  try {
    const parsed = JSON.parse(area.value);
    area.value = JSON.stringify(parsed, null, 2);
  } catch (e) {
    alert('JSON validation failed. Ensure syntax is correct before format.');
  }
}

// ==========================================================================
// INITIALIZATIONS & BIND EVENT LISTENERS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Initial UI Renderers
  renderHistory();
  renderCollections();
  updateDatabaseUI();
  
  // Load empty parametrical grids
  renderParamsGrid('query-params-grid', []);
  renderParamsGrid('headers-params-grid', []);

  // Sync URL bar presets options
  const presetSelect = document.getElementById('preset-endpoints');
  presetSelect.addEventListener('change', (e) => {
    const url = e.target.value;
    document.getElementById('request-url').value = url;
    
    // Automatically match methods based on preset selection
    const methodSelect = document.getElementById('request-method');
    if (url.includes('posts/1')) {
      methodSelect.value = 'GET';
    } else {
      methodSelect.value = 'GET';
    }
    
    syncURLToParams();
  });

  // URL input keyup synchronizers
  document.getElementById('request-url').addEventListener('input', syncURLToParams);

  // Trigger click handlers
  document.getElementById('btn-send-request').addEventListener('click', sendAPIRequest);

  // Params rows add binders
  document.getElementById('btn-add-query').addEventListener('click', () => addParamRow('query-params-grid'));
  document.getElementById('btn-add-header').addEventListener('click', () => addParamRow('headers-params-grid'));
  document.getElementById('btn-format-json-body').addEventListener('click', formatJSONRequestBody);

  // Sub tabs controls
  document.querySelectorAll('.side-tab').forEach(btn => {
    btn.addEventListener('click', (e) => switchSidebarTab(e.target.getAttribute('data-tab')));
  });

  document.querySelectorAll('.config-tab').forEach(btn => {
    btn.addEventListener('click', (e) => switchConfigTab(e.target.getAttribute('data-tab')));
  });

  document.querySelectorAll('.resp-tab').forEach(btn => {
    btn.addEventListener('click', (e) => switchResponseTab(e.target.getAttribute('data-tab')));
  });

  // Auth form changes
  document.getElementById('auth-type').addEventListener('change', toggleAuthFields);

  // Database controllers reset
  document.getElementById('btn-reset-db').addEventListener('click', resetMockDatabase);
  document.getElementById('btn-clear-history').addEventListener('click', clearHistory);

  // Save requests collection trigger modal dialogs
  const saveModal = document.getElementById('save-request-modal');
  document.getElementById('btn-save-request').addEventListener('click', () => {
    const url = document.getElementById('request-url').value.trim();
    if (!url) {
      alert('Cannot save blank query parameters.');
      return;
    }
    saveModal.classList.remove('hidden');
    document.getElementById('save-request-name').value = '';
  });

  document.getElementById('btn-close-save-modal').addEventListener('click', () => saveModal.classList.add('hidden'));
  document.getElementById('btn-cancel-save').addEventListener('click', () => saveModal.classList.add('hidden'));
  document.getElementById('btn-confirm-save').addEventListener('click', () => {
    const name = document.getElementById('save-request-name').value;
    const colId = document.getElementById('save-request-collection').value;
    if (name.trim() && colId) {
      saveRequestToCollection(name, colId);
      saveModal.classList.add('hidden');
    } else {
      alert('Please fill out name details.');
    }
  });

  // Create collections folder dialog triggers
  const colModal = document.getElementById('collection-creation-modal');
  document.getElementById('btn-new-collection').addEventListener('click', () => {
    colModal.classList.remove('hidden');
    document.getElementById('new-col-name').value = '';
  });

  document.getElementById('btn-close-col-modal').addEventListener('click', () => colModal.classList.add('hidden'));
  document.getElementById('btn-cancel-col').addEventListener('click', () => colModal.classList.add('hidden'));
  document.getElementById('btn-save-col').addEventListener('click', () => {
    const name = document.getElementById('new-col-name').value;
    if (name.trim()) {
      createNewCollection(name);
      colModal.classList.add('hidden');
    } else {
      alert('Collection name cannot be blank.');
    }
  });

  // Global key overrides
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      saveModal.classList.add('hidden');
      colModal.classList.add('hidden');
    }
  });

  // Close modals clicking background overlays
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        saveModal.classList.add('hidden');
        colModal.classList.add('hidden');
      }
    });
  });
});

// Helper Escape HTML tags
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
