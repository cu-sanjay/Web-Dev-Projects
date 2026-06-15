/* HTTP Request & Response Visualizer - Core Logic */

document.addEventListener("DOMContentLoaded", () => {
  
  // --- Header Explanatory Dictionary ---
  const HEADER_DICTIONARY = {
    // Request Headers
    "Host": {
      name: "Host",
      type: "Request",
      desc: "Specifies the domain name of the target server and the TCP port number on which the server is listening. Mandatory in HTTP/1.1."
    },
    "User-Agent": {
      name: "User-Agent",
      type: "Request",
      desc: "Contains a characteristic string that allows network protocol peers to identify the application type, operating system, software vendor, or software version of the requesting client."
    },
    "Accept": {
      name: "Accept",
      type: "Request",
      desc: "Informs the server about the media types (e.g. text/html, application/json) that the client is willing and able to process in response."
    },
    "Accept-Language": {
      name: "Accept-Language",
      type: "Request",
      desc: "Advertises which languages (e.g. en-US, fr-FR) the client is able to understand, allowing the server to perform content negotiation."
    },
    "Authorization": {
      name: "Authorization",
      type: "Request",
      desc: "Carries credentials (such as a Bearer token or username/password digest) to authenticate the client browser session with the secure server."
    },
    "Content-Type": {
      name: "Content-Type",
      type: "Both",
      desc: "Declares the media type (MIME type) of the resource or request payload body (e.g. application/json, text/html) so the receiver knows how to parse it."
    },
    "Content-Length": {
      name: "Content-Length",
      type: "Both",
      desc: "Indicates the size of the request or response body, in decimal number of octets (bytes), transmitted to the receiver."
    },
    "Cookie": {
      name: "Cookie",
      type: "Request",
      desc: "Contains stored HTTP cookies previously sent by the server via the Set-Cookie header. Used to maintain stateful session info."
    },
    
    // Response Headers
    "Server": {
      name: "Server",
      type: "Response",
      desc: "Contains information about the software used by the origin server to handle the request (e.g. Nginx, Apache, Node.js)."
    },
    "Date": {
      name: "Date",
      type: "Response",
      desc: "Indicates the date and time at which the HTTP response message was originated and sent by the server."
    },
    "Set-Cookie": {
      name: "Set-Cookie",
      type: "Response",
      desc: "Instructs the web browser to store a cookie locally (session tokens, user preferences) to be sent back in subsequent Request headers."
    },
    "Cache-Control": {
      name: "Cache-Control",
      type: "Both",
      desc: "Holds directives (e.g. max-age, no-cache, public) for caching mechanisms in both browsers and intermediate CDNs/proxies."
    },
    "Connection": {
      name: "Connection",
      type: "Both",
      desc: "Controls whether the network socket connection stays open or is closed after the current transaction completes (e.g. keep-alive, close)."
    },
    "Location": {
      name: "Location",
      type: "Response",
      desc: "Indicates the URL to redirect the browser to. Used in conjunction with 3xx redirection status codes."
    },
    "WWW-Authenticate": {
      name: "WWW-Authenticate",
      type: "Response",
      desc: "Defines the authentication method that should be used to gain access to the requested secure resource. Sent with 401 Unauthorized status."
    }
  };

  // --- State Variables ---
  let requestMethod = "GET";
  let requestPath = "/";
  let requestHeaders = [
    { key: "Host", val: "localhost:8080" },
    { key: "User-Agent", val: "Mozilla/5.0 (Windows NT 10.0; Chrome/100)" },
    { key: "Accept", val: "text/html,application/xhtml+xml" }
  ];
  let requestBody = "";
  let isSending = false;

  let lastCompiledRequest = "";
  let lastCompiledResponse = "";
  let currentActiveTab = "request"; // request, response

  // Quiz State
  let quizScore = 0;
  let quizTotal = 0;
  let currentQuizQuestion = null;

  // --- DOM Elements Caching ---
  const reqMethodSelect = document.getElementById("req-method");
  const reqPathSelect = document.getElementById("req-path");
  const reqHeadersContainer = document.getElementById("req-headers-container");
  
  const btnAddHeaderRow = document.getElementById("btn-add-header-row");
  const btnAddJsonHeader = document.getElementById("btn-add-json-header");
  const btnAddAuthHeader = document.getElementById("btn-add-auth-header");
  
  const reqBodyPanel = document.getElementById("req-body-panel");
  const reqBodyInput = document.getElementById("req-body-input");
  const btnSendRequest = document.getElementById("btn-send-request");

  const requestPresetSelect = document.getElementById("request-preset");

  // Browser Mock elements
  const urlBarPath = document.getElementById("url-bar-path");
  const urlLockIcon = document.getElementById("url-lock-icon");
  const browserStatusBadge = document.getElementById("browser-status-badge");
  const cookieBannerBox = document.getElementById("cookie-banner-box");
  const cookieBannerVal = document.getElementById("cookie-banner-val");
  const btnDismissCookie = document.getElementById("btn-dismiss-cookie");
  const browserViewportDisplay = document.getElementById("browser-viewport-display");

  // Wire elements
  const travelingPacket = document.getElementById("traveling-packet");
  const packetLabel = document.getElementById("packet-label");
  const packetArrow = document.getElementById("packet-arrow");

  // Inspector tabs
  const tabBtnRequest = document.getElementById("tab-btn-request");
  const tabBtnResponse = document.getElementById("tab-btn-response");
  const rawConsoleDisplay = document.getElementById("raw-console-display");
  
  // Tooltip
  const tooltipTitle = document.getElementById("tooltip-title");
  const tooltipDesc = document.getElementById("tooltip-desc");
  const explanationTooltipBox = document.getElementById("explanation-tooltip-box");

  // Quiz UI
  const quizStartView = document.getElementById("quiz-start-view");
  const quizActiveView = document.getElementById("quiz-active-view");
  const btnStartQuiz = document.getElementById("btn-start-quiz");
  const quizQuestionText = document.getElementById("quiz-question-text");
  const quizOptionsContainer = document.getElementById("quiz-options-container");
  const quizFeedbackBox = document.getElementById("quiz-feedback-box");
  const quizFeedbackText = document.getElementById("quiz-feedback-text");
  const quizScoreVal = document.getElementById("quiz-score-val");
  const btnQuitQuiz = document.getElementById("btn-quit-quiz");
  const btnNextQuiz = document.getElementById("btn-next-quiz");

  // --- Dynamic Headers Editor Rows ---
  function renderHeaderRows() {
    reqHeadersContainer.innerHTML = "";
    requestHeaders.forEach((hdr, idx) => {
      const row = document.createElement("div");
      row.className = "header-row";
      row.innerHTML = `
        <input type="text" class="custom-input header-key-input" value="${hdr.key}" placeholder="Header-Name" data-idx="${idx}">
        <input type="text" class="custom-input header-val-input" value="${hdr.val}" placeholder="Value" data-idx="${idx}">
        <button type="button" class="btn-delete-header" title="Delete header line" data-idx="${idx}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      // Event handlers to update state dynamically
      row.querySelector(".header-key-input").addEventListener("input", (e) => {
        hdr.key = e.target.value;
      });

      row.querySelector(".header-val-input").addEventListener("input", (e) => {
        hdr.val = e.target.value;
      });

      row.querySelector(".btn-delete-header").addEventListener("click", () => {
        requestHeaders = requestHeaders.filter((_, i) => i !== idx);
        renderHeaderRows();
      });

      reqHeadersContainer.appendChild(row);
    });
  }

  btnAddHeaderRow.addEventListener("click", () => {
    requestHeaders.push({ key: "", val: "" });
    renderHeaderRows();
  });

  btnAddJsonHeader.addEventListener("click", () => {
    // Add Content-Type if not present
    if (!requestHeaders.some(h => h.key.toLowerCase() === "content-type")) {
      requestHeaders.push({ key: "Content-Type", val: "application/json" });
      renderHeaderRows();
    }
  });

  btnAddAuthHeader.addEventListener("click", () => {
    // Add Auth token if not present
    if (!requestHeaders.some(h => h.key.toLowerCase() === "authorization")) {
      requestHeaders.push({ key: "Authorization", val: "Bearer secret_api_token_val_1082" });
      renderHeaderRows();
    }
  });

  // --- Collapsible request body controls ---
  function updateBodyVisibility() {
    const method = reqMethodSelect.value;
    if (method === "POST" || method === "PUT") {
      reqBodyPanel.classList.remove("hidden");
    } else {
      reqBodyPanel.classList.add("hidden");
    }
  }

  reqMethodSelect.addEventListener("change", () => {
    updateBodyVisibility();
  });

  // --- Routing & Server Response compiles ---
  function routeRequest(method, path, headers, body) {
    const respHeaders = {
      "Server": "Nginx/1.22.1 (Ubuntu)",
      "Date": new Date().toUTCString(),
      "Connection": "keep-alive"
    };

    let status = 200;
    let statusText = "OK";
    let respBody = "";

    // Parse Authorization header
    const authHdr = headers.find(h => h.key.toLowerCase() === "authorization");
    const isAuthorized = authHdr && authHdr.val.startsWith("Bearer ");

    // Routing Logic
    if (path === "/" || path === "/index.html") {
      if (method === "GET" || method === "HEAD") {
        respHeaders["Content-Type"] = "text/html; charset=UTF-8";
        respBody = `
          <div class="mock-landing-page">
            <h3>🏠 Port Portfolio Portal</h3>
            <p>Welcome to your local network dashboard. Connection established successfully via local subnet loop. System is listening for API and static requests.</p>
            <div class="mock-features-grid">
              <div class="feature-box">🔒 Local Host</div>
              <div class="feature-box">📦 HTTP/1.1 API</div>
              <div class="feature-box">🍪 Cookie Session</div>
            </div>
          </div>
        `;
        if (method === "HEAD") respBody = ""; // HEAD returns no body
      } else {
        status = 405;
        statusText = "Method Not Allowed";
        respHeaders["Content-Type"] = "text/html";
        respBody = `<h3>405 Method Not Allowed</h3><p>Method ${method} is not accepted on static route ${path}.</p>`;
      }
    } 
    
    else if (path === "/api/users") {
      if (method === "GET") {
        respHeaders["Content-Type"] = "application/json";
        respBody = JSON.stringify([
          { id: 1, name: "Alice", role: "Network Architect", ip: "192.168.1.50" },
          { id: 2, name: "Bob", role: "Security Analyst", ip: "192.168.1.60" },
          { id: 3, name: "Sujal", role: "DevOps Engineer", ip: "192.168.1.10" }
        ], null, 2);
      } else {
        status = 400;
        statusText = "Bad Request";
        respHeaders["Content-Type"] = "application/json";
        respBody = JSON.stringify({ error: "Bad Request", message: "Only GET is supported on /api/users" });
      }
    } 
    
    else if (path === "/login") {
      if (method === "POST") {
        status = 201;
        statusText = "Created";
        respHeaders["Content-Type"] = "application/json";
        respHeaders["Set-Cookie"] = "session_token=secret_jwt_user_1028; Max-Age=3600; Path=/; HttpOnly";
        
        // Parse credentials if body is JSON
        let user = "Anonymous";
        try {
          const parsed = JSON.parse(body);
          if (parsed.username) user = parsed.username;
        } catch(e) {
          // Fallback parsing for raw strings
          if (body.includes("username")) {
            user = "AdminUser";
          }
        }

        respBody = JSON.stringify({
          status: "success",
          message: "Session authenticated successfully",
          user: user
        }, null, 2);
      } else {
        status = 405;
        statusText = "Method Not Allowed";
        respHeaders["Content-Type"] = "text/html";
        respBody = `<h3>405 Method Not Allowed</h3><p>Authentication requires POST payloads.</p>`;
      }
    } 
    
    else if (path === "/admin/secure") {
      respHeaders["Content-Type"] = "text/html; charset=UTF-8";
      if (isAuthorized) {
        respBody = `
          <div class="mock-landing-page">
            <h3>👑 Admin Command Console</h3>
            <p style="color:var(--color-success);">AUTHENTICATION VERIFIED: Secure Session Active.</p>
            <p>Admin credentials verified successfully. System telemetry: active. Firewall drops: 0. Database node links: Operational.</p>
          </div>
        `;
      } else {
        status = 401;
        statusText = "Unauthorized";
        respHeaders["WWW-Authenticate"] = 'Bearer realm="Secure Admin Console"';
        respBody = `
          <div class="mock-landing-page">
            <h3 style="color:var(--color-danger);">🔒 401 Unauthorized</h3>
            <p>Access Denied: Authentication credentials missing or invalid. Please supply a valid HTTP Authorization Header Bearer token.</p>
          </div>
        `;
      }
    } 
    
    else {
      // 404
      status = 404;
      statusText = "Not Found";
      respHeaders["Content-Type"] = "text/html";
      respBody = `<h3>⚠️ 404 Not Found</h3><p>The requested path <b>${path}</b> does not exist on this server.</p>`;
    }

    // Append Content-Length automatically
    respHeaders["Content-Length"] = new Blob([respBody]).size.toString();
    
    return { status, statusText, headers: respHeaders, body: respBody };
  }

  // --- Raw Packet String Builders ---
  function compileRawRequest(method, path, headers, body) {
    let raw = `${method} ${path} HTTP/1.1\r\n`;
    
    // Add headers
    headers.forEach(h => {
      if (h.key.trim() !== "") {
        raw += `${h.key}: ${h.val}\r\n`;
      }
    });

    // Add Content-Length if body exists
    if (body.trim() !== "" && (method === "POST" || method === "PUT")) {
      const len = new Blob([body]).size;
      raw += `Content-Length: ${len}\r\n`;
    }

    raw += "\r\n"; // End of headers blank line
    
    if (body.trim() !== "" && (method === "POST" || method === "PUT")) {
      raw += body;
    }

    return raw;
  }

  function compileRawResponse(resp) {
    let raw = `HTTP/1.1 ${resp.status} ${resp.statusText}\r\n`;
    
    for (const [key, val] of Object.entries(resp.headers)) {
      raw += `${key}: ${val}\r\n`;
    }

    raw += "\r\n";
    raw += resp.body;
    return raw;
  }

  // --- Render raw inspector consoles with hover bindings ---
  function renderRawInspector(rawText) {
    rawConsoleDisplay.innerHTML = "";
    
    const lines = rawText.split("\n");
    lines.forEach(line => {
      // Ignore trailing blank lines at very end
      if (line.trim() === "" && lines.indexOf(line) === lines.length - 1) return;

      const div = document.createElement("div");
      div.className = "code-line";
      div.textContent = line;

      // Check if line contains a colon representing a header
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim();
        const headerInfo = HEADER_DICTIONARY[key];
        
        if (headerInfo) {
          // Hook up tooltip hover binding
          div.addEventListener("mouseover", () => {
            explanationTooltipBox.classList.add("highlight");
            tooltipTitle.textContent = `${headerInfo.name} [${headerInfo.type} Header]`;
            tooltipDesc.textContent = headerInfo.desc;
          });
          div.addEventListener("mouseout", () => {
            explanationTooltipBox.classList.remove("highlight");
            tooltipTitle.textContent = "Header Inspector";
            tooltipDesc.textContent = "Hover over any raw header line in the code console above to display its TCP/HTTP specifications.";
          });
        }
      }

      rawConsoleDisplay.appendChild(div);
    });
  }

  // --- Transmit Packet Wire Animator ---
  function transmitHTTPCycle() {
    if (isSending) return;
    isSending = true;

    btnSendRequest.disabled = true;
    cookieBannerBox.classList.add("hidden");

    // Clear viewport
    browserViewportDisplay.innerHTML = `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-muted);">Transmitting HTTP Request...</div>`;

    requestMethod = reqMethodSelect.value;
    requestPath = reqPathSelect.value;
    requestBody = reqBodyInput.value;

    // Compile packets
    lastCompiledRequest = compileRawRequest(requestMethod, requestPath, requestHeaders, requestBody);
    
    // Switch to request tab first
    currentActiveTab = "request";
    tabBtnRequest.classList.add("active");
    tabBtnResponse.classList.remove("active");
    renderRawInspector(lastCompiledRequest);

    // Animate Request packet client -> server
    travelingPacket.className = "http-packet";
    travelingPacket.style.transition = "none";
    travelingPacket.style.left = "10%";
    packetLabel.textContent = requestMethod;
    packetArrow.innerHTML = "&rarr;";
    travelingPacket.classList.remove("hidden");

    // Force reflow
    travelingPacket.offsetHeight;

    travelingPacket.style.transition = `left ${playSpeed / 1000}s cubic-bezier(0.25, 1, 0.5, 1)`;
    travelingPacket.style.left = "80%";

    // On request packet arrival at server
    setTimeout(() => {
      // Process response
      const response = routeRequest(requestMethod, requestPath, requestHeaders, requestBody);
      lastCompiledResponse = compileRawResponse(response);

      // Animate Response packet server -> client
      travelingPacket.className = "http-packet response-packet";
      
      // Highlight response packet based on status code
      if (response.status >= 200 && response.status < 300) {
        travelingPacket.classList.add("success-packet");
      }
      
      travelingPacket.style.transition = "none";
      travelingPacket.style.left = "80%";
      packetLabel.textContent = `HTTP ${response.status}`;
      packetArrow.innerHTML = "&larr;";

      // Force reflow
      travelingPacket.offsetHeight;

      travelingPacket.style.transition = `left ${playSpeed / 1000}s cubic-bezier(0.25, 1, 0.5, 1)`;
      travelingPacket.style.left = "10%";

      // On response packet arrival at client browser
      setTimeout(() => {
        travelingPacket.classList.add("hidden");
        isSending = false;
        btnSendRequest.disabled = false;

        // Auto switch tab to response
        currentActiveTab = "response";
        tabBtnResponse.classList.add("active");
        tabBtnRequest.classList.remove("active");
        renderRawInspector(lastCompiledResponse);

        // Update mockup browser URL bar
        urlBarPath.textContent = requestPath;
        browserStatusBadge.textContent = `${response.status} ${response.statusText}`;
        
        // Lock secure icon checks
        if (requestPath === "/admin/secure" && response.status === 200) {
          urlLockIcon.textContent = "🔒";
          urlLockIcon.style.color = "var(--color-success)";
        } else {
          urlLockIcon.textContent = "🔓";
          urlLockIcon.style.color = "var(--text-muted)";
        }

        // Status code class adjustments
        if (response.status >= 200 && response.status < 300) {
          browserStatusBadge.className = "status-indicator-badge";
        } else if (response.status >= 300 && response.status < 400) {
          browserStatusBadge.className = "status-indicator-badge status-yellow";
        } else {
          browserStatusBadge.className = "status-indicator-badge status-red";
        }

        // Render viewport payload
        renderViewportBody(response);

        // Cookie check
        if (response.headers["Set-Cookie"]) {
          const cookieVal = response.headers["Set-Cookie"].split(";")[0];
          cookieBannerBox.classList.remove("hidden");
          cookieBannerVal.textContent = cookieVal;
        }

      }, playSpeed);

    }, playSpeed);
  }

  function renderViewportBody(response) {
    browserViewportDisplay.innerHTML = "";
    
    const cType = response.headers["Content-Type"];

    if (cType && cType.includes("application/json")) {
      // Render JSON tree
      const pre = document.createElement("pre");
      pre.className = "font-mono";
      pre.style.fontSize = "0.825rem";
      
      // Apply syntax highlighting
      let json = response.body;
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      const highlighted = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
        let cls = 'json-value-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-value-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-value-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-value-null';
        }
        return `<span class="${cls}">${match}</span>`;
      });

      pre.innerHTML = highlighted;
      browserViewportDisplay.appendChild(pre);
    } else {
      // Render HTML page
      const div = document.createElement("div");
      div.innerHTML = response.body;
      browserViewportDisplay.appendChild(div);
    }
  }

  btnSendRequest.addEventListener("click", transmitHTTPCycle);

  btnDismissCookie.addEventListener("click", () => {
    cookieBannerBox.classList.add("hidden");
  });

  // --- Inspector Tabs selectors ---
  tabBtnRequest.addEventListener("click", () => {
    currentActiveTab = "request";
    tabBtnRequest.classList.add("active");
    tabBtnResponse.classList.remove("active");
    renderRawInspector(lastCompiledRequest || "GET /index.html HTTP/1.1\r\nHost: localhost:8080\r\n\r\n");
  });

  tabBtnResponse.addEventListener("click", () => {
    currentActiveTab = "response";
    tabBtnResponse.classList.add("active");
    tabBtnRequest.classList.remove("active");
    renderRawInspector(lastCompiledResponse || "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n");
  });

  // --- Preset Load handler ---
  requestPresetSelect.addEventListener("change", () => {
    const val = requestPresetSelect.value;
    cookieBannerBox.classList.add("hidden");
    
    // Clear custom headers first
    requestHeaders = [
      { key: "Host", val: "localhost:8080" },
      { key: "User-Agent", val: "Mozilla/5.0 (Windows NT 10.0; Chrome)" },
      { key: "Accept", val: "*/*" }
    ];

    if (val === "get-html") {
      reqMethodSelect.value = "GET";
      reqPathSelect.value = "/index.html";
      requestHeaders.push({ key: "Accept-Language", val: "en-US,en" });
    } 
    
    else if (val === "get-api") {
      reqMethodSelect.value = "GET";
      reqPathSelect.value = "/api/users";
      requestHeaders.push({ key: "Accept", val: "application/json" });
    } 
    
    else if (val === "post-login") {
      reqMethodSelect.value = "POST";
      reqPathSelect.value = "/login";
      requestHeaders.push({ key: "Content-Type", val: "application/json" });
      reqBodyInput.value = JSON.stringify({ username: "sujal_admin", password: "password123" }, null, 2);
    } 
    
    else if (val === "get-secure") {
      reqMethodSelect.value = "GET";
      reqPathSelect.value = "/admin/secure";
      // Intentionally leave Authorization header out so they get 401 first, can add it later
    } 
    
    else if (val === "get-error") {
      reqMethodSelect.value = "GET";
      reqPathSelect.value = "/missing";
    }

    updateBodyVisibility();
    renderHeaderRows();
    
    // Reset browser viewport status codes
    urlBarPath.textContent = reqPathSelect.value;
    browserStatusBadge.textContent = "---";
    browserStatusBadge.className = "status-indicator-badge status-yellow";
    browserViewportDisplay.innerHTML = `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-muted);">Press Send Request to execute.</div>`;
  });

  // --- Quiz Generator & Trainer ---
  btnStartQuiz.addEventListener("click", () => {
    quizStartView.classList.add("hidden");
    quizActiveView.classList.remove("hidden");
    quizScore = 0;
    quizTotal = 0;
    updateQuizScoreLabel();
    loadNextQuizQuestion();
  });

  btnQuitQuiz.addEventListener("click", () => {
    quizStartView.classList.remove("hidden");
    quizActiveView.classList.add("hidden");
  });

  btnNextQuiz.addEventListener("click", () => {
    loadNextQuizQuestion();
  });

  function updateQuizScoreLabel() {
    quizScoreVal.textContent = `${quizScore}/${quizTotal}`;
  }

  function loadNextQuizQuestion() {
    quizFeedbackBox.className = "quiz-feedback mt-16 hidden";
    btnNextQuiz.classList.add("hidden");

    currentQuizQuestion = generateRandomQuizQuestion();

    quizQuestionText.innerHTML = currentQuizQuestion.text;
    quizOptionsContainer.innerHTML = "";

    currentQuizQuestion.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn-quiz-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => handleQuizAnswerSelection(btn, opt));
      quizOptionsContainer.appendChild(btn);
    });
  }

  function handleQuizAnswerSelection(selectedBtn, answer) {
    const isCorrect = (answer === currentQuizQuestion.correct);
    
    // Disable all options buttons to lock answers
    const allBtns = quizOptionsContainer.querySelectorAll(".btn-quiz-option");
    allBtns.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === currentQuizQuestion.correct) {
        btn.classList.add("correct");
      }
    });

    // Apply color highlights
    if (isCorrect) {
      selectedBtn.classList.add("correct");
      quizFeedbackBox.className = "quiz-feedback mt-16 correct";
      quizFeedbackText.textContent = "Correct! Great understanding of the HTTP spec.";
      quizScore++;
    } else {
      selectedBtn.classList.add("incorrect");
      quizFeedbackBox.className = "quiz-feedback mt-16 incorrect";
      quizFeedbackText.innerHTML = `Incorrect. Correct answer is <b>${currentQuizQuestion.correct}</b>.<br><span style="font-size:0.75rem;">${currentQuizQuestion.explanation}</span>`;
    }

    quizTotal++;
    updateQuizScoreLabel();
    btnNextQuiz.classList.remove("hidden");
  }

  function generateRandomQuizQuestion() {
    const questionTypes = ["status", "method", "header-auth", "header-cookie", "redirect"];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let text = "";
    let correct = "";
    let options = [];
    let explanation = "";

    switch (type) {
      case "status":
        text = "Which HTTP status code corresponds to a resource that was successfully created on the server (typically returning from a POST request)?";
        correct = "201 Created";
        options = [
          correct,
          "200 OK",
          "202 Accepted",
          "204 No Content"
        ];
        explanation = "201 Created is the standard status code returned when a resource is successfully created as a result of the request.";
        break;

      case "method":
        text = "Which of the following HTTP methods is considered <b>idempotent</b>, meaning multiple identical requests will have the same effect as a single request?";
        correct = "GET";
        options = [
          correct,
          "POST",
          "PATCH",
          "CONNECT"
        ];
        explanation = "GET, PUT, and DELETE are idempotent. POST and PATCH are not, as subsequent requests can create multiple resources or update data repeatedly.";
        break;

      case "header-auth":
        text = "Which HTTP request header is typically used to carry credentials or Bearer tokens to authenticate a client with a secure API server?";
        correct = "Authorization";
        options = [
          correct,
          "Authenticate",
          "WWW-Authenticate",
          "Proxy-Authorization"
        ];
        explanation = "The Authorization request header is used to pass client credentials, while WWW-Authenticate is sent by the server in 401 responses.";
        break;

      case "header-cookie":
        text = "Which HTTP header is sent by a <b>Web Server</b> to instruct the browser to store a specific state session key locally?";
        correct = "Set-Cookie";
        options = [
          correct,
          "Cookie",
          "Cache-Control",
          "Session-ID"
        ];
        explanation = "Set-Cookie is a response header sent by the server. The client browser returns these cookies in subsequent request headers named 'Cookie'.";
        break;

      case "redirect":
        text = "If a server sends back a redirection status code (like <b>301 Moved Permanently</b>), which header specifies the new URL target address?";
        correct = "Location";
        options = [
          correct,
          "Referer",
          "Destination",
          "Connection"
        ];
        explanation = "The Location response header indicates the URL to redirect the browser client to.";
        break;
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    return { text, correct, options, explanation };
  }

  // --- Initial Synchronizations ---
  renderHeaderRows();
  updateBodyVisibility();
  
  // Set default initial Raw console displays
  lastCompiledRequest = compileRawRequest("GET", "/", requestHeaders, "");
  renderRawInspector(lastCompiledRequest);

  // Speed slider binding
  simSpeedSlider.addEventListener("input", (e) => {
    playSpeed = parseInt(e.target.value, 10);
    speedValueLabel.textContent = `Speed: ${(playSpeed / 1000).toFixed(1)}s`;
  });
});
