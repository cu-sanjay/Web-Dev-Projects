// In-memory Database Tables State
const defaultDatabase = {
  users: [
    { id: 1, name: "Alice", age: 28, country: "USA" },
    { id: 2, name: "Bob", age: 34, country: "UK" },
    { id: 3, name: "Charlie", age: 22, country: "Canada" },
    { id: 4, name: "David", age: 45, country: "Germany" },
    { id: 5, name: "Emma", age: 28, country: "USA" },
    { id: 6, name: "Frank", age: 19, country: "France" },
    { id: 7, name: "Grace", age: 31, country: "UK" },
    { id: 8, name: "Henry", age: 25, country: "Canada" },
    { id: 9, name: "Isabella", age: 29, country: "USA" },
    { id: 10, name: "Jack", age: 42, country: "Australia" }
  ],
  orders: [
    { order_id: 101, user_id: 1, product_id: 501, amount: 250.0 },
    { order_id: 102, user_id: 3, product_id: 503, amount: 1200.0 },
    { order_id: 103, user_id: 1, product_id: 502, amount: 45.0 },
    { order_id: 104, user_id: 7, product_id: 501, amount: 15.5 },
    { order_id: 105, user_id: 5, product_id: 504, amount: 85.0 },
    { order_id: 106, user_id: 2, product_id: 502, amount: 120.0 },
    { order_id: 107, user_id: 10, product_id: 503, amount: 400.0 },
    { order_id: 108, user_id: 4, product_id: 501, amount: 95.0 }
  ],
  products: [
    { product_id: 501, title: "Phone Charger", price: 15.5 },
    { product_id: 502, title: "Leather Wallet", price: 45.0 },
    { product_id: 503, title: "Gaming Monitor", price: 400.0 },
    { product_id: 504, title: "Coffee Mug", price: 12.0 },
    { product_id: 505, title: "Bluetooth Speaker", price: 85.0 }
  ]
};

// Available Indexes
let databaseIndexes = {
  "users.id": true, // users ID is primary index
  "orders.order_id": true,
  "products.product_id": true
};

// SQL query template definitions
const queryTemplates = {
  select_all: "SELECT * FROM users;",
  select_filter: "SELECT name, age FROM users WHERE age > 25;",
  index_filter: "SELECT * FROM users WHERE id = 3;",
  join_loop: "SELECT users.name, orders.amount FROM users JOIN orders ON users.id = orders.user_id;",
  create_index: "CREATE INDEX ON users (age);"
};

// App Engine State
let db = JSON.parse(JSON.stringify(defaultDatabase));
let activeQuery = "";
let currentStepIndex = -1;
let executionSteps = [];
let stepIntervalTimer = null;
let currentActiveTable = "users";

// DOM Elements
const querySelect = document.getElementById("query-select");
const sqlEditor = document.getElementById("sql-editor");
const btnRun = document.getElementById("btn-run");
const btnStep = document.getElementById("btn-step");
const btnReset = document.getElementById("btn-reset");
const schemaList = document.getElementById("schema-list");
const planTreeContainer = document.getElementById("plan-tree-container");
const costSeq = document.getElementById("cost-seq");
const costIndex = document.getElementById("cost-index");
const optimizerBox = document.getElementById("optimizer-box");
const tableViewerSelect = document.getElementById("table-viewer-select");
const activeTableDataScroller = document.getElementById("active-table-data-scroller");
const queryResultScroller = document.getElementById("query-result-scroller");
const consoleLogs = document.getElementById("console-logs");
const btnClearConsole = document.getElementById("btn-clear-console");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

const metricTables = document.getElementById("metric-tables");
const metricRows = document.getElementById("metric-rows");
const metricIndexes = document.getElementById("metric-indexes");
const metricPages = document.getElementById("metric-pages");
const metricPagesCard = document.getElementById("metric-pages-card");

const stepProgressDisplay = document.getElementById("step-progress-display");
const currentStepName = document.getElementById("current-step-name");
const stepDotsContainer = document.getElementById("step-dots-container");

// Boot Setup
function init() {
  const savedCode = localStorage.getItem("db_visualizer_code");
  const savedTemplate = localStorage.getItem("db_visualizer_template") || "index_filter";
  
  querySelect.value = savedTemplate;
  sqlEditor.value = savedCode || queryTemplates[savedTemplate];

  // Event Listeners
  querySelect.addEventListener("change", handleTemplateChange);
  btnRun.addEventListener("click", handleRunQuery);
  btnStep.addEventListener("click", handleStepClick);
  btnReset.addEventListener("click", handleResetDB);
  tableViewerSelect.addEventListener("change", (e) => {
    currentActiveTable = e.target.value;
    renderTableData(currentActiveTable);
  });
  btnClearConsole.addEventListener("click", () => consoleLogs.innerHTML = "");

  // Tab triggering
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });

  // Render initial workspace structures
  renderSchema();
  renderTableData(currentActiveTable);
  updateMetrics();
  addConsoleLog("SYSTEM", "SQL Database engine initialised.", "system");
}

// Persist Query String
function handleTemplateChange(e) {
  const selected = e.target.value;
  sqlEditor.value = queryTemplates[selected];
  localStorage.setItem("db_visualizer_template", selected);
  localStorage.setItem("db_visualizer_code", sqlEditor.value);
  resetExecutionState();
}

// Log Diagnostic messaging to bottom panel
function addConsoleLog(source, message, type = "system") {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-source">[${source}]</span> ${message}`;
  consoleLogs.appendChild(entry);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Reset tables & indexes configuration
function handleResetDB() {
  if (stepIntervalTimer) clearInterval(stepIntervalTimer);
  db = JSON.parse(JSON.stringify(defaultDatabase));
  databaseIndexes = {
    "users.id": true,
    "orders.order_id": true,
    "products.product_id": true
  };
  localStorage.removeItem("db_visualizer_code");
  localStorage.removeItem("db_visualizer_template");
  
  querySelect.value = "index_filter";
  sqlEditor.value = queryTemplates["index_filter"];
  
  resetExecutionState();
  renderSchema();
  renderTableData(currentActiveTable);
  updateMetrics();
  
  addConsoleLog("SYSTEM", "In-Memory database tables restored to default sample data.", "error");
}

// Render column schema metadata in sidebar
function renderSchema() {
  schemaList.innerHTML = "";
  
  for (let tableName in db) {
    const card = document.createElement("div");
    card.className = "schema-table-card";
    
    // Check active indexes
    const tableIndexes = Object.keys(databaseIndexes)
      .filter(idx => idx.startsWith(tableName))
      .map(idx => idx.split(".")[1]);
      
    const idxText = tableIndexes.length > 0 ? `IDX: [${tableIndexes.join(", ")}]` : "No indexes";

    let colsHtml = "";
    // Grab columns from first item
    const firstRow = db[tableName][0];
    for (let colName in firstRow) {
      const isPK = colName === "id" || colName === "order_id" || colName === "product_id";
      colsHtml += `
        <div class="schema-col-item ${isPK ? 'primary-key' : ''}">
          <span>${isPK ? '🔑' : '🔹'}</span>
          <span>${colName} (${typeof firstRow[colName] === 'number' ? 'INT' : 'VARCHAR'})</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="schema-table-name">
        <span>📋 ${tableName}</span>
        <span class="schema-table-indexes">${idxText}</span>
      </div>
      <div class="schema-columns">${colsHtml}</div>
    `;
    schemaList.appendChild(card);
  }
}

// Render Raw Table Grid Viewer (supports animations)
function renderTableData(tableName) {
  activeTableDataScroller.innerHTML = "";
  
  if (!db[tableName] || db[tableName].length === 0) {
    activeTableDataScroller.innerHTML = `<div class="placeholder-text">Table is empty.</div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "db-grid-table";
  table.id = `view-grid-${tableName}`;

  // Headers
  const firstRow = db[tableName][0];
  let headersHtml = "<tr>";
  for (let colName in firstRow) {
    headersHtml += `<th>${colName}</th>`;
  }
  headersHtml += "</tr>";

  // Rows
  let rowsHtml = "";
  db[tableName].forEach((row, idx) => {
    // Unique ID for row highlighting
    const rowId = `row-${tableName}-${idx}`;
    let colsHtml = "";
    for (let key in row) {
      colsHtml += `<td>${row[key]}</td>`;
    }
    rowsHtml += `<tr id="${rowId}">${colsHtml}</tr>`;
  });

  table.innerHTML = headersHtml + rowsHtml;
  activeTableDataScroller.appendChild(table);
}

// Update Top Dashboard stats
function updateMetrics() {
  metricTables.textContent = Object.keys(db).length;
  let totalRows = 0;
  for (let table in db) {
    totalRows += db[table].length;
  }
  metricRows.textContent = totalRows;
  metricIndexes.textContent = Object.keys(databaseIndexes).length;
}

// Reset Query Planner state variables
function resetExecutionState() {
  if (stepIntervalTimer) clearInterval(stepIntervalTimer);
  currentStepIndex = -1;
  executionSteps = [];
  stepProgressDisplay.classList.add("hide");
  planTreeContainer.innerHTML = `<div class="placeholder-text">Run or step a query to compile the execution planner tree.</div>`;
  queryResultScroller.innerHTML = `<div class="placeholder-text">Query results will display here.</div>`;
  metricPages.textContent = "0";
  metricPagesCard.style.borderColor = "var(--border-glass)";
}

// SQL Lexer / Parser - generates query plans & stepped instructions
function parseSQLQuery(queryText) {
  const clean = queryText.trim().replace(/\s+/g, " ").replace(/;$/, "");
  
  // Create default instruction steps
  const steps = [];

  // Parse SQL command type
  if (clean.toUpperCase().startsWith("CREATE INDEX")) {
    // e.g. CREATE INDEX ON users (age)
    const match = clean.match(/CREATE\s+INDEX\s+ON\s+(\w+)\s*\(\s*(\w+)\s*\)/i);
    if (match) {
      const tableName = match[1];
      const colName = match[2];
      
      steps.push({
        name: "Lexer Parsing",
        desc: "Syntax validation & token extraction completed.",
        action: () => addConsoleLog("LEXER", `Tokenized index instruction: CREATE INDEX ON table "${tableName}" column "${colName}"`, "parser")
      });
      steps.push({
        name: "Logical Planner",
        desc: "Constructing B-Tree logical index nodes.",
        action: () => addConsoleLog("PLANNER", `Generating index builder tree for ${tableName}.${colName}`, "system")
      });
      steps.push({
        name: "Index Building",
        desc: "Sorting values and mapping row pointers.",
        action: () => {
          const idxKey = `${tableName}.${colName}`;
          databaseIndexes[idxKey] = true;
          renderSchema();
          updateMetrics();
          addConsoleLog("ENGINE", `Index built successfully: ${idxKey}`, "match");
        }
      });
      return { type: "create_index", steps };
    }
  }

  // SELECT query compiler
  if (clean.toUpperCase().startsWith("SELECT")) {
    // Basic SELECT regex: SELECT cols FROM table WHERE filter ORDER BY col
    const selectMatch = clean.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+JOIN\s+(\w+)\s+ON\s+([\w.]+)\s*=\s*([\w.]+))?(?:\s+WHERE\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i);
    
    if (selectMatch) {
      const columns = selectMatch[1].split(",").map(c => c.trim());
      const primaryTable = selectMatch[2];
      const joinTable = selectMatch[3] || null;
      const joinCol1 = selectMatch[4] || null;
      const joinCol2 = selectMatch[5] || null;
      const filterStr = selectMatch[6] || null;
      const limitStr = selectMatch[7] || null;

      // Validate tables existence
      if (!db[primaryTable]) {
        alert(`Table "${primaryTable}" not found!`);
        return null;
      }

      // Build execution AST node representation
      const ast = {
        type: "SELECT",
        from: primaryTable,
        join: joinTable ? { table: joinTable, on: [joinCol1, joinCol2] } : null,
        where: parseFilter(filterStr),
        columns: columns,
        limit: limitStr ? parseInt(limitStr) : null
      };

      // Generate explain costs
      const logicalPlanNodes = buildLogicalPlanTree(ast);
      
      // Load initial compile steps
      steps.push({
        name: "Lexer Parser",
        desc: "SQL tokenised and syntax trees parsed.",
        action: () => {
          addConsoleLog("LEXER", `Parsed SELECT target columns: [${columns.join(", ")}]`, "parser");
          renderPlanTree(logicalPlanNodes);
        }
      });

      steps.push({
        name: "Explain Planner",
        desc: "Logical node optimization tree built.",
        action: () => {
          addConsoleLog("PLANNER", `Explain plan generated. Primary Scan node type: ${logicalPlanNodes.scanType}`, "system");
          // Update costs UI comparison
          updateCostOptimizerPanel(primaryTable, ast.where, logicalPlanNodes.scanType);
        }
      });

      // Query results storage
      let queryResultSet = [];

      // Join operations vs Single table scans
      if (joinTable) {
        steps.push({
          name: "Nested Loop Join",
          desc: "Scanning outer table and searching inner matches.",
          action: () => {
            addConsoleLog("ENGINE", `Initiating Nested Loop Join between ${primaryTable} and ${joinTable}...`, "scan");
            switchTab("active-table");
            tableViewerSelect.value = primaryTable;
            renderTableData(primaryTable);
          }
        });

        // Generate nested loops steps
        db[primaryTable].forEach((rowOuter, outIdx) => {
          steps.push({
            name: `Scan Outer Row #${outIdx}`,
            desc: `Outer row values: ${JSON.stringify(rowOuter)}`,
            action: () => {
              // Highlight outer row
              clearTableHighlights(primaryTable);
              highlightRow(primaryTable, outIdx, "scanning");
              addConsoleLog("ENGINE", `Outer Table row read: ID ${rowOuter.id || rowOuter.order_id}`, "scan");
            }
          });

          // Scan inner table
          db[joinTable].forEach((rowInner, inIdx) => {
            const joinMatch = evaluateJoinCondition(rowOuter, rowInner, joinCol1, joinCol2);
            steps.push({
              name: `Evaluate Inner Row #${inIdx}`,
              desc: `Inner row values: ${JSON.stringify(rowInner)}`,
              action: () => {
                // Toggle tab viewer select
                if (tableViewerSelect.value !== joinTable) {
                  tableViewerSelect.value = joinTable;
                  renderTableData(joinTable);
                }
                clearTableHighlights(joinTable);
                highlightRow(joinTable, inIdx, joinMatch ? "matching" : "scanning");
                
                if (joinMatch) {
                  addConsoleLog("ENGINE", `-> JOIN match found! Outer User ID: ${rowOuter.id} matches Inner Order User ID: ${rowInner.user_id}`, "match");
                  // Push joint columns
                  const merged = { ...rowOuter, ...rowInner };
                  queryResultSet.push(filterColumns(merged, columns));
                }
              }
            });
          });
        });

      } else {
        // Single table scan
        const scanType = logicalPlanNodes.scanType;

        steps.push({
          name: scanType,
          desc: scanType === "Index Scan" ? `Accessing indices for WHERE constraint.` : "Iterating table pages.",
          action: () => {
            addConsoleLog("ENGINE", `Commencing ${scanType} on table "${primaryTable}"...`, "scan");
            switchTab("active-table");
            tableViewerSelect.value = primaryTable;
            renderTableData(primaryTable);
          }
        });

        if (scanType === "Index Scan") {
          // Find matching key using B-Tree index scan simulation
          const targetId = ast.where.val;
          const matchedIndex = db[primaryTable].findIndex(r => r.id === targetId);

          if (matchedIndex !== -1) {
            steps.push({
              name: "Index Lookup Key Match",
              desc: `Index matched key: id = ${targetId}`,
              action: () => {
                highlightRow(primaryTable, matchedIndex, "matching");
                metricPages.textContent = "1"; // Cheap
                metricPagesCard.style.borderColor = "var(--color-accent)";
                addConsoleLog("ENGINE", `Index hit! Row pointer fetched directly for Key ${targetId}. Pages fetched: 1`, "match");
                
                const matchedRow = db[primaryTable][matchedIndex];
                queryResultSet.push(filterColumns(matchedRow, columns));
              }
            });
          } else {
            steps.push({
              name: "Index Lookup No Match",
              desc: `Index search for key id = ${targetId} failed.`,
              action: () => addConsoleLog("ENGINE", `Index scan complete: key not found.`, "error")
            });
          }
        } else {
          // Seq scan step loop
          db[primaryTable].forEach((row, rowIdx) => {
            const isMatch = evaluateFilter(row, ast.where);
            steps.push({
              name: `Evaluate Row #${rowIdx + 1}`,
              desc: `Testing WHERE match: ${row.name || row.id}`,
              action: () => {
                clearTableHighlights(primaryTable);
                highlightRow(primaryTable, rowIdx, isMatch ? "matching" : "scanning");
                
                // Pages metrics increments
                const pageCost = Math.ceil((rowIdx + 1) / 3); // 3 rows per page block
                metricPages.textContent = pageCost;
                metricPagesCard.style.borderColor = "var(--color-warn)";
                
                if (isMatch) {
                  addConsoleLog("ENGINE", `Match tuple found: Row ${rowIdx + 1} meets condition`, "match");
                  queryResultSet.push(filterColumns(row, columns));
                } else {
                  addConsoleLog("ENGINE", `Seq check: Row ${rowIdx + 1} does not match filter.`, "scan");
                }
              }
            });
          });
        }
      }

      // Projection output step
      steps.push({
        name: "Projection / Output Results",
        desc: `Exporting columns: ${columns.join(", ")}`,
        action: () => {
          clearTableHighlights(primaryTable);
          if (joinTable) clearTableHighlights(joinTable);
          
          switchTab("query-result");
          renderQueryResults(queryResultSet);
          
          addConsoleLog("ENGINE", `Projection completed. Outputting ${queryResultSet.length} matching rows.`, "system");
        }
      });

      return { type: "select", steps };
    }
  }

  // Syntax error callback
  alert("Unsupported SQL syntax! Presets available in dropdown templates.");
  return null;
}

// Regex filter parsers
function parseFilter(filterStr) {
  if (!filterStr) return null;
  // Parse format: col operator val (e.g. age > 25, id = 3)
  const match = filterStr.match(/(\w+)\s*(=|>|<)\s*(.+)/);
  if (!match) return null;
  const col = match[1].trim();
  const op = match[2].trim();
  let val = match[3].trim().replace(/['"]/g, ""); // Clean quotes
  if (!isNaN(val)) val = parseFloat(val);
  return { col, op, val };
}

// Evaluate join equations
function evaluateJoinCondition(outer, inner, col1, col2) {
  // e.g. users.id = orders.user_id
  const v1 = outer[col1.split(".")[1]] || outer[col1];
  const v2 = inner[col2.split(".")[1]] || inner[col2];
  return v1 !== undefined && v2 !== undefined && v1 === v2;
}

// Evaluate row conditions
function evaluateFilter(row, filter) {
  if (!filter) return true;
  const cell = row[filter.col];
  if (cell === undefined) return false;
  
  switch (filter.op) {
    case "=": return cell === filter.val;
    case ">": return cell > filter.val;
    case "<": return cell < filter.val;
    default: return false;
  }
}

// Filter fields matching SELECT constraints
function filterColumns(row, columns) {
  if (columns.includes("*")) return row;
  const out = {};
  columns.forEach(col => {
    // Handle table.col names mapping in join queries
    const shortName = col.includes(".") ? col.split(".")[1] : col;
    out[shortName] = row[shortName] !== undefined ? row[shortName] : row[col];
  });
  return out;
}

// Logical Execution Tree generation
function buildLogicalPlanTree(ast) {
  const table = ast.from;
  let scanType = "Seq Scan";
  
  // Decide optimization scans
  if (ast.where && ast.where.col === "id" && databaseIndexes[`${table}.id`]) {
    scanType = "Index Scan";
  } else if (ast.where && ast.where.col === "age" && databaseIndexes[`${table}.age`]) {
    scanType = "Index Scan";
  }

  const scanNode = {
    title: scanType,
    details: `on table "${table}" ${ast.where ? `(Filter: ${ast.where.col} ${ast.where.op} ${ast.where.val})` : ''}`,
    children: []
  };

  let rootNode = scanNode;

  if (ast.join) {
    const outerScan = {
      title: "Seq Scan",
      details: `on table "${ast.join.table}"`,
      children: []
    };
    const joinNode = {
      title: "Nested Loop Join",
      details: `Condition: ${ast.join.on[0]} = ${ast.join.on[1]}`,
      children: [rootNode, outerScan]
    };
    rootNode = joinNode;
  }

  const projectNode = {
    title: "Projection",
    details: `Columns: ${ast.columns.join(", ")}`,
    children: [rootNode]
  };

  // Attach active scan spec tag for metrics
  projectNode.scanType = scanType;

  return projectNode;
}

// Query Cost Calculator Visuals
function updateCostOptimizerPanel(tableName, filter, activeScan) {
  optimizerBox.style.display = "flex";
  
  const totalRows = db[tableName].length;
  const pageCapacity = 3; // 3 items per page block
  const seqPageReads = Math.ceil(totalRows / pageCapacity);
  
  const seqCost = (seqPageReads * 1.0) + (totalRows * 0.01); // Page fetch + CPU tuple scans
  
  let indexCost = 999.0;
  let indexExists = false;

  if (filter) {
    const idxKey = `${tableName}.${filter.col}`;
    indexExists = !!databaseIndexes[idxKey];
    if (indexExists) {
      indexCost = 1.0 + (1 * 0.1) + (1 * 0.01); // 1.0 tree index, 1 matched page read, 1 tuple CPU
    }
  }

  costSeq.textContent = `${seqCost.toFixed(2)} cost units (${seqPageReads} pages read)`;
  costIndex.textContent = indexExists ? `${indexCost.toFixed(2)} cost units (1 page read)` : "N/A (No index on column)";
  
  const stats = document.querySelectorAll(".cost-stat");
  if (activeScan === "Index Scan") {
    stats[0].classList.remove("highlight");
    stats[1].classList.add("highlight");
  } else {
    stats[0].classList.add("highlight");
    stats[1].classList.remove("highlight");
  }
}

// Tree visual drawing recursive logic
function renderPlanTree(node) {
  planTreeContainer.innerHTML = "";
  planTreeContainer.appendChild(drawNodeElement(node));
}

function drawNodeElement(node) {
  const container = document.createElement("div");
  container.className = "plan-node-wrapper";

  const card = document.createElement("div");
  card.className = "plan-node-card";
  card.id = `plan-card-${node.title.replace(/\s+/g, "-")}`;
  card.innerHTML = `
    <div class="plan-node-title">${node.title}</div>
    <div class="plan-node-details">${node.details}</div>
  `;
  container.appendChild(card);

  if (node.children && node.children.length > 0) {
    const childrenRow = document.createElement("div");
    childrenRow.className = "plan-node-children";
    node.children.forEach(child => {
      childrenRow.appendChild(drawNodeElement(child));
    });
    container.appendChild(childrenRow);
  }

  return container;
}

// DOM Tab selector helper
function switchTab(tabId) {
  tabButtons.forEach(b => {
    if (b.dataset.tab === tabId) b.classList.add("active");
    else b.classList.remove("active");
  });
  tabPanes.forEach(p => {
    if (p.id === `tab-${tabId}`) p.classList.add("active");
    else p.classList.remove("active");
  });
}

// Render filtered queries into result grid
function renderQueryResults(resultSet) {
  queryResultScroller.innerHTML = "";

  if (resultSet.length === 0) {
    queryResultScroller.innerHTML = `<div class="placeholder-text">Empty result set (0 rows matched).</div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "db-grid-table";

  // Headers
  let headersHtml = "<tr>";
  const firstRow = resultSet[0];
  for (let key in firstRow) {
    headersHtml += `<th>${key}</th>`;
  }
  headersHtml += "</tr>";

  // Rows
  let rowsHtml = "";
  resultSet.forEach(row => {
    let colsHtml = "";
    for (let key in row) {
      colsHtml += `<td>${row[key]}</td>`;
    }
    rowsHtml += `<tr>${colsHtml}</tr>`;
  });

  table.innerHTML = headersHtml + rowsHtml;
  queryResultScroller.appendChild(table);
}

// Highlights specific rows
function highlightRow(tableName, index, cssClass) {
  const row = document.getElementById(`row-${tableName}-${index}`);
  if (row) {
    row.className = cssClass;
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Reset highlights
function clearTableHighlights(tableName) {
  const grid = document.getElementById(`view-grid-${tableName}`);
  if (grid) {
    const rows = grid.querySelectorAll("tr");
    rows.forEach(r => r.className = "");
  }
}

// Handle Run Execution (auto step timer loop)
function handleRunQuery() {
  resetExecutionState();
  const sql = sqlEditor.value;
  const parsed = parseSQLQuery(sql);
  if (!parsed) return;

  activeQuery = sql;
  executionSteps = parsed.steps;
  currentStepIndex = 0;

  // Initialize step display
  stepProgressDisplay.classList.remove("hide");
  renderStepDots();

  // Run stepping on a quick timer interval
  stepIntervalTimer = setInterval(() => {
    if (currentStepIndex >= executionSteps.length) {
      clearInterval(stepIntervalTimer);
      addConsoleLog("SYSTEM", "Query execution completed successfully.", "system");
      return;
    }
    executeStep(currentStepIndex);
    currentStepIndex++;
  }, 600);
}

// Single step click event
function handleStepClick() {
  if (currentStepIndex === -1 || activeQuery !== sqlEditor.value) {
    // Initialize query steps
    resetExecutionState();
    const sql = sqlEditor.value;
    const parsed = parseSQLQuery(sql);
    if (!parsed) return;

    activeQuery = sql;
    executionSteps = parsed.steps;
    currentStepIndex = 0;

    stepProgressDisplay.classList.remove("hide");
    renderStepDots();
  }

  if (currentStepIndex >= executionSteps.length) {
    addConsoleLog("SYSTEM", "Query execution already completed.", "error");
    return;
  }

  executeStep(currentStepIndex);
  currentStepIndex++;
}

// Build progress tracking dots in visual planner
function renderStepDots() {
  stepDotsContainer.innerHTML = "";
  executionSteps.forEach((s, idx) => {
    const dot = document.createElement("span");
    dot.className = "step-dot";
    dot.id = `step-dot-${idx}`;
    stepDotsContainer.appendChild(dot);
  });
}

// Run single step execution instructions
function executeStep(idx) {
  const step = executionSteps[idx];
  
  // Highlight steps dots
  const dot = document.getElementById(`step-dot-${idx}`);
  if (dot) dot.className = "step-dot active";
  
  // Mark previous dots passed
  for (let i = 0; i < idx; i++) {
    const pDot = document.getElementById(`step-dot-${i}`);
    if (pDot) pDot.className = "step-dot passed";
  }

  currentStepName.textContent = step.name;

  // Highlight active logical node cards matching operation name
  const nodes = document.querySelectorAll(".plan-node-card");
  nodes.forEach(n => n.classList.remove("active"));
  
  // Map step names to cards
  let cardTarget = null;
  if (step.name.includes("Seq Scan")) cardTarget = document.getElementById("plan-card-Seq-Scan");
  else if (step.name.includes("Index Scan")) cardTarget = document.getElementById("plan-card-Index-Scan");
  else if (step.name.includes("Nested Loop Join")) cardTarget = document.getElementById("plan-card-Nested-Loop-Join");
  else if (step.name.includes("Projection")) cardTarget = document.getElementById("plan-card-Projection");

  if (cardTarget) cardTarget.classList.add("active");

  // Run step handler callbacks
  step.action();
}

// Boot application
window.addEventListener("DOMContentLoaded", init);
