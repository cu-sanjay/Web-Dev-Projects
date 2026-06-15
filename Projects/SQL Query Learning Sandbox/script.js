/**
 * SQLearn - SQL Query Learning Sandbox script.js
 * Client-side SQL parsing engine, automated result validator, and progression controller.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Datasets ---
  const mockDatabase = {
    students: [
      { id: 1, name: 'Alice Smith', age: 20, grade: 'A' },
      { id: 2, name: 'Bob Johnson', age: 22, grade: 'B' },
      { id: 3, name: 'Charlie Brown', age: 19, grade: 'C' },
      { id: 4, name: 'David Lee', age: 21, grade: 'A' },
      { id: 5, name: 'Emma Watson', age: 23, grade: 'B' }
    ],
    courses: [
      { course_id: 101, title: 'Introduction to SQL', instructor: 'Dr. Codd' },
      { course_id: 102, title: 'Web Development 101', instructor: 'Prof. Eich' },
      { course_id: 103, title: 'Advanced Algorithms', instructor: 'Dr. Knuth' }
    ],
    enrollments: [
      { student_id: 1, course_id: 101, score: 95 },
      { student_id: 1, course_id: 102, score: 88 },
      { student_id: 2, course_id: 101, score: 78 },
      { student_id: 3, course_id: 102, score: 65 },
      { student_id: 4, course_id: 101, score: 92 },
      { student_id: 4, course_id: 103, score: 89 },
      { student_id: 5, course_id: 102, score: 84 }
    ]
  };

  // --- Curriculum Lessons ---
  const lessons = [
    {
      id: 1,
      title: 'SELECT & FROM',
      concept: 'The SELECT clause determines which columns of data to retrieve, and the FROM clause defines the table source. Use a comma to separate columns (e.g. `SELECT name, age FROM students;`) or use `*` to retrieve all columns.',
      objective: 'Retrieve names and grades of all students. Select: `name`, `grade` from the `students` table.',
      targetQuery: 'SELECT name, grade FROM students;',
      initialQuery: 'SELECT * FROM students;',
      targetTable: 'students'
    },
    {
      id: 2,
      title: 'Filtering with WHERE',
      concept: 'The WHERE clause filters rows based on a comparison condition. Supported operators include: `=`, `>`, `<`, `>=`, `<=`, `!=` (not equal), and logical operators `AND` / `OR` to chain rules.',
      objective: 'Find all students who are 21 years or older. Retrieve all columns (`*`) from the `students` table.',
      targetQuery: 'SELECT * FROM students WHERE age >= 21;',
      initialQuery: 'SELECT * FROM students WHERE age > 18;',
      targetTable: 'students'
    },
    {
      id: 3,
      title: 'Sorting with ORDER BY',
      concept: 'The ORDER BY clause sorts output rows based on a specified column. Add `ASC` for ascending order (A-Z, lowest-highest) or `DESC` for descending order (Z-A, highest-lowest).',
      objective: 'Retrieve all courses sorted by title in alphabetical order. Select all columns (`*`) from the `courses` table.',
      targetQuery: 'SELECT * FROM courses ORDER BY title ASC;',
      initialQuery: 'SELECT * FROM courses ORDER BY course_id;',
      targetTable: 'courses'
    },
    {
      id: 4,
      title: 'Aggregate Functions',
      concept: 'Aggregate functions compute summaries from multiple values. Key aggregates: `COUNT(*)` counts rows, `SUM(col)` adds numbers, and `AVG(col)` returns average values. Use `AS alias` to rename output columns.',
      objective: 'Calculate the average score of all course enrollments. Retrieve a single column renamed to `score_average`.',
      targetQuery: 'SELECT AVG(score) as score_average FROM enrollments;',
      initialQuery: 'SELECT score FROM enrollments;',
      targetTable: 'enrollments'
    },
    {
      id: 5,
      title: 'Grouping with GROUP BY',
      concept: 'The GROUP BY clause collapses multiple rows into aggregate subsets based on identical values in specified columns. It is typically combined with aggregate functions.',
      objective: 'Count how many students are in each grade. Return columns `grade` and `student_count`. Hint: use `COUNT(*)` renamed to `student_count` grouped by `grade`.',
      targetQuery: 'SELECT grade, COUNT(*) as student_count FROM students GROUP BY grade;',
      initialQuery: 'SELECT grade FROM students;',
      targetTable: 'students'
    },
    {
      id: 6,
      title: 'Relational INNER JOINs',
      concept: 'JOIN combines rows from two tables based on a related column between them. In this sandbox, map tables with `JOIN table2 ON table1.id = table2.table1_id` syntax.',
      objective: 'List student names alongside the course IDs they are enrolled in. Map student_id inside `enrollments` to id inside `students`. Select columns: `name` and `course_id`.',
      targetQuery: 'SELECT name, course_id FROM enrollments JOIN students ON enrollments.student_id = students.id;',
      initialQuery: 'SELECT * FROM enrollments;',
      targetTable: 'enrollments'
    }
  ];

  // --- DOM References ---
  const lessonCheckpoints = document.getElementById('lesson-checkpoints');
  const lessonTitle = document.getElementById('lesson-title');
  const lessonConcept = document.getElementById('lesson-concept');
  const lessonObjective = document.getElementById('lesson-objective');
  const sqlEditor = document.getElementById('sql-editor-textarea');

  const btnRunQuery = document.getElementById('btn-run-query');
  const btnResetCode = document.getElementById('btn-reset-code');
  const keywordButtons = document.querySelectorAll('.btn-keyword');
  
  const progressFill = document.getElementById('progress-fill');
  const progressStatusText = document.getElementById('progress-status-text');

  const inspectorTabs = document.querySelectorAll('.inspector-tab');
  const rawTableDataBox = document.getElementById('raw-table-data-box');

  const tabTriggers = document.querySelectorAll('[data-right-tab]');
  const actualPane = document.getElementById('pane-actual-output');
  const expectedPane = document.getElementById('pane-expected-output');
  const actualTableContainer = document.getElementById('actual-table-container');
  const expectedTableContainer = document.getElementById('expected-table-container');
  const resultStatusPanel = document.getElementById('result-status-panel');

  // --- State Tracker ---
  let state = {
    activeLessonIndex: 0,
    completedLessons: [],   // List of completed lesson IDs
    actualResult: null,
    expectedResult: null,
    activeLeftTab: 'lessons',
    activeRightTab: 'actual'
  };

  // --- SQL Compiler Parsing Executor Class ---
  class SQLExecutor {
    constructor(db) {
      this.db = db;
    }

    execute(query) {
      const normalized = query.trim().replace(/\s+/g, ' ');
      const upper = normalized.toUpperCase();

      if (!upper.startsWith('SELECT')) {
        throw new Error('Only SELECT queries are supported in this playground.');
      }

      const parsed = this.parse(normalized);
      
      // Load raw table data
      let data = [];
      
      if (parsed.joinClause) {
        // Evaluate Join
        const t1 = this.db[parsed.fromTable];
        const t2 = this.db[parsed.joinClause.table];
        
        if (!t1) throw new Error(`Table "${parsed.fromTable}" does not exist in schema.`);
        if (!t2) throw new Error(`Table "${parsed.joinClause.table}" does not exist in schema.`);

        let joined = [];
        t1.forEach(row1 => {
          t2.forEach(row2 => {
            // Compare ON keys (e.g. enrollments.student_id = students.id)
            const val1 = parsed.joinClause.key1.table === parsed.fromTable ? row1[parsed.joinClause.key1.field] : row2[parsed.joinClause.key1.field];
            const val2 = parsed.joinClause.key2.table === parsed.joinClause.table ? row2[parsed.joinClause.key2.field] : row1[parsed.joinClause.key2.field];
            
            if (val1 !== undefined && val2 !== undefined && val1 == val2) {
              joined.push({ ...row1, ...row2 });
            }
          });
        });
        data = joined;
      } else {
        data = this.db[parsed.fromTable];
        if (!data) {
          throw new Error(`Table "${parsed.fromTable}" does not exist in schema.`);
        }
        // Deep copy table array rows
        data = JSON.parse(JSON.stringify(data));
      }

      // Apply WHERE Filter
      if (parsed.whereClause) {
        data = data.filter(row => this.evaluateCondition(row, parsed.whereClause));
      }

      // Apply GROUP BY & Aggregates
      const isAggregated = parsed.selectColumns.some(col => /(COUNT|AVG|SUM|MIN|MAX)\(/i.test(col));
      
      if (parsed.groupByColumns.length > 0) {
        data = this.applyGroupBy(data, parsed.groupByColumns, parsed.selectColumns);
      } else if (isAggregated) {
        data = this.applyGlobalAggregates(data, parsed.selectColumns);
      } else {
        // Normal column projections
        data = this.applyProjections(data, parsed.selectColumns);
      }

      // Apply ORDER BY
      if (parsed.orderByColumn) {
        data = this.applyOrderBy(data, parsed.orderByColumn, parsed.orderByDirection);
      }

      // Apply LIMIT
      if (parsed.limitValue !== null) {
        data = data.slice(0, parsed.limitValue);
      }

      return data;
    }

    parse(query) {
      const upper = query.toUpperCase();
      const parsed = {
        selectColumns: [],
        fromTable: '',
        joinClause: null,
        whereClause: null,
        groupByColumns: [],
        orderByColumn: null,
        orderByDirection: 'ASC',
        limitValue: null
      };

      // Extract SELECT columns
      const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/i);
      if (!selectMatch) throw new Error('Query syntax error: missing SELECT or FROM keyword.');
      
      const colsStr = selectMatch[1].trim();
      parsed.selectColumns = colsStr.split(',').map(c => c.trim());

      // Extract FROM table name
      const fromMatch = query.match(/FROM\s+(\w+)/i);
      if (!fromMatch) throw new Error('Query syntax error: missing table after FROM.');
      parsed.fromTable = fromMatch[1].toLowerCase();

      // Parse INNER JOIN or JOIN ON
      // FROM enrollments JOIN students ON enrollments.student_id = students.id
      const joinMatch = query.match(/FROM\s+\w+\s+(?:INNER\s+)?JOIN\s+(\w+)\s+ON\s+([\w.]+)\s*=\s*([\w.]+)/i);
      if (joinMatch) {
        const jTable = joinMatch[1].toLowerCase();
        const k1 = joinMatch[2].split('.');
        const k2 = joinMatch[3].split('.');
        
        parsed.joinClause = {
          table: jTable,
          key1: { table: k1[0].toLowerCase(), field: k1[1] },
          key2: { table: k2[0].toLowerCase(), field: k2[1] }
        };
      }

      // Extract WHERE filter condition
      const whereMatch = query.match(/WHERE\s+(.*?)(?:GROUP BY|ORDER BY|LIMIT|$)/i);
      if (whereMatch) {
        parsed.whereClause = whereMatch[1].trim();
      }

      // Extract GROUP BY columns
      const groupMatch = query.match(/GROUP BY\s+(.*?)(?:ORDER BY|LIMIT|$)/i);
      if (groupMatch) {
        parsed.groupByColumns = groupMatch[1].split(',').map(c => {
          let col = c.trim().toLowerCase();
          if (col.includes('.')) col = col.split('.')[1];
          return col;
        });
      }

      // Extract ORDER BY columns
      const orderMatch = query.match(/ORDER BY\s+([\w.]+)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        let col = orderMatch[1].toLowerCase();
        if (col.includes('.')) col = col.split('.')[1];
        parsed.orderByColumn = col;
        parsed.orderByDirection = (orderMatch[2] || 'ASC').toUpperCase();
      }

      // Extract LIMIT number
      const limitMatch = query.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        parsed.limitValue = parseInt(limitMatch[1], 10);
      }

      return parsed;
    }

    evaluateCondition(row, condition) {
      if (condition.toUpperCase().includes(' AND ')) {
        const parts = condition.split(/\s+AND\s+/i);
        return parts.every(p => this.evaluateSingleCondition(row, p.trim()));
      }
      if (condition.toUpperCase().includes(' OR ')) {
        const parts = condition.split(/\s+OR\s+/i);
        return parts.some(p => this.evaluateSingleCondition(row, p.trim()));
      }
      return this.evaluateSingleCondition(row, condition);
    }

    evaluateSingleCondition(row, cond) {
      const match = cond.match(/([\w.]+)\s*(>=|<=|!=|>|<|=)\s*['"]?([^'"]+)['"]?/i);
      if (!match) return true;

      let col = match[1];
      if (col.includes('.')) col = col.split('.')[1];
      
      const op = match[2];
      const val = match[3].trim();
      
      const rowVal = row[col];
      if (rowVal === undefined) {
        throw new Error(`Column name "${col}" does not exist in active query dataset.`);
      }

      const isNum = !isNaN(rowVal) && !isNaN(val);
      const rVal = isNum ? Number(rowVal) : rowVal;
      const cVal = isNum ? Number(val) : val;

      switch (op) {
        case '=': return rVal == cVal;
        case '!=': return rVal != cVal;
        case '>': return rVal > cVal;
        case '<': return rVal < cVal;
        case '>=': return rVal >= cVal;
        case '<=': return rVal <= cVal;
        default: return true;
      }
    }

    applyProjections(data, columns) {
      if (columns[0] === '*') return data;

      return data.map(row => {
        const newRow = {};
        columns.forEach(col => {
          // Check for alias: `name as student_name` or `name student_name`
          const aliasParts = col.split(/\s+AS\s+/i);
          let rawCol = aliasParts[0].trim();
          let aliasName = aliasParts[1] ? aliasParts[1].trim() : rawCol;

          if (rawCol.includes('.')) rawCol = rawCol.split('.')[1];
          if (aliasName.includes('.')) aliasName = aliasName.split('.')[1];

          if (!(rawCol in row)) {
            throw new Error(`Column "${rawCol}" requested in SELECT is invalid.`);
          }
          newRow[aliasName] = row[rawCol];
        });
        return newRow;
      });
    }

    applyGlobalAggregates(data, columns) {
      const row = {};
      columns.forEach(col => {
        const aliasParts = col.split(/\s+AS\s+/i);
        const expr = aliasParts[0].trim();
        
        const funcMatch = expr.match(/(COUNT|AVG|SUM|MIN|MAX)\((.*?)\)/i);
        if (funcMatch) {
          const func = funcMatch[1].toUpperCase();
          let arg = funcMatch[2].trim();
          if (arg.includes('.')) arg = arg.split('.')[1];

          const alias = aliasParts[1] ? aliasParts[1].trim() : `${func.toLowerCase()}_${arg.replace('*', 'all')}`;

          if (func === 'COUNT') {
            row[alias] = data.length;
          } else {
            const numbers = data.map(r => Number(r[arg])).filter(n => !isNaN(n));
            if (numbers.length === 0) {
              row[alias] = null;
            } else {
              const sum = numbers.reduce((a, b) => a + b, 0);
              if (func === 'SUM') row[alias] = sum;
              else if (func === 'AVG') row[alias] = Number((sum / numbers.length).toFixed(2));
              else if (func === 'MIN') row[alias] = Math.min(...numbers);
              else if (func === 'MAX') row[alias] = Math.max(...numbers);
            }
          }
        } else {
          // Literal constant or group fallback
          let rawCol = expr;
          if (rawCol.includes('.')) rawCol = rawCol.split('.')[1];
          const alias = aliasParts[1] ? aliasParts[1].trim() : rawCol;
          row[alias] = data.length > 0 ? data[0][rawCol] : null;
        }
      });
      return [row];
    }

    applyGroupBy(data, groupColumns, selectColumns) {
      const grouped = {};
      
      data.forEach(row => {
        const key = groupColumns.map(col => row[col]).join('|');
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row);
      });

      return Object.entries(grouped).map(([key, rows]) => {
        const resultRow = {};
        
        // Load group variables
        groupColumns.forEach((col, idx) => {
          resultRow[col] = rows[0][col];
        });

        // Load aggregates
        selectColumns.forEach(col => {
          const aliasParts = col.split(/\s+AS\s+/i);
          const expr = aliasParts[0].trim();
          
          const funcMatch = expr.match(/(COUNT|AVG|SUM|MIN|MAX)\((.*?)\)/i);
          if (funcMatch) {
            const func = funcMatch[1].toUpperCase();
            let arg = funcMatch[2].trim();
            if (arg.includes('.')) arg = arg.split('.')[1];

            const alias = aliasParts[1] ? aliasParts[1].trim() : `${func.toLowerCase()}_${arg.replace('*', 'all')}`;

            if (func === 'COUNT') {
              resultRow[alias] = rows.length;
            } else {
              const numbers = rows.map(r => Number(r[arg])).filter(n => !isNaN(n));
              if (numbers.length === 0) {
                resultRow[alias] = null;
              } else {
                const sum = numbers.reduce((a, b) => a + b, 0);
                if (func === 'SUM') resultRow[alias] = sum;
                else if (func === 'AVG') resultRow[alias] = Number((sum / rows.length).toFixed(2));
                else if (func === 'MIN') resultRow[alias] = Math.min(...rows);
                else if (func === 'MAX') resultRow[alias] = Math.max(...rows);
              }
            }
          }
        });
        return resultRow;
      });
    }

    applyOrderBy(data, col, direction) {
      const sorted = [...data];
      sorted.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        
        if (valA === undefined || valB === undefined) return 0;

        if (typeof valA === 'string') {
          return direction === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return direction === 'ASC' ? valA - valB : valB - valA;
      });
      return sorted;
    }
  }

  const executor = new SQLExecutor(mockDatabase);

  // --- Curriculum Managers ---
  function loadHistoryProgress() {
    try {
      const saved = localStorage.getItem('sqlearn_progress');
      if (saved) {
        state.completedLessons = JSON.parse(saved);
        updateProgressGauge();
      }
    } catch (e) {
      console.error('Failed to load local progress:', e);
    }
  }

  function saveHistoryProgress() {
    try {
      localStorage.setItem('sqlearn_progress', JSON.stringify(state.completedLessons));
      updateProgressGauge();
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }

  function updateProgressGauge() {
    const total = lessons.length;
    const count = state.completedLessons.length;
    const pct = (count / total) * 100;
    progressFill.style.width = `${pct}%`;
    progressStatusText.textContent = `${count} / ${total} Lessons Completed`;
  }

  function renderCurriculumList() {
    lessonCheckpoints.innerHTML = '';
    
    lessons.forEach((lesson, index) => {
      const isPassed = state.completedLessons.includes(lesson.id);
      const isLocked = index > 0 && !state.completedLessons.includes(lessons[index - 1].id);
      
      const card = document.createElement('div');
      card.className = `lesson-checkpoint-item ${isPassed ? 'passed' : ''} ${isLocked ? 'locked' : ''} ${index === state.activeLessonIndex ? 'active' : ''}`;
      
      let badgeIcon = '<i class="fa-regular fa-circle lesson-item-icon"></i>';
      if (isPassed) badgeIcon = '<i class="fa-solid fa-circle-check lesson-item-icon text-success"></i>';
      else if (isLocked) badgeIcon = '<i class="fa-solid fa-lock lesson-item-icon"></i>';

      card.innerHTML = `
        <span class="lesson-item-title">${index + 1}. ${lesson.title}</span>
        ${badgeIcon}
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          state.activeLessonIndex = index;
          renderCurriculumList();
          loadLessonDetails();
        });
      }

      lessonCheckpoints.appendChild(card);
    });
  }

  function loadLessonDetails() {
    const lesson = lessons[state.activeLessonIndex];
    lessonTitle.textContent = lesson.title;
    lessonConcept.textContent = lesson.concept;
    lessonObjective.textContent = lesson.objective;
    
    // Load initial code snippet
    sqlEditor.value = lesson.initialQuery;

    // Reset results panels
    actualTableContainer.innerHTML = `
      <div class="empty-results-state">
        <i class="fa-solid fa-terminal"></i>
        <p>Run your SQL query to see table output records.</p>
      </div>
    `;
    resultStatusPanel.innerHTML = `
      <div class="result-card-alert border-glass" style="background-color: rgba(255,255,255,0.01)">
        <i class="fa-solid fa-info-circle text-accent"></i>
        <div class="alert-text-content">
          <h4>New Lesson Loaded</h4>
          <p>Read the objective parameters, write your SQL query and click Run Query to verify.</p>
        </div>
      </div>
    `;

    // Render expected target outputs
    state.expectedResult = executor.execute(lesson.targetQuery);
    expectedTableContainer.innerHTML = generateTableHtml(state.expectedResult);
  }

  // --- HTML Table Generators ---
  function generateTableHtml(data) {
    if (!data || data.length === 0) {
      return `<p style="text-align: center; color: var(--text-muted); font-style: italic; padding: 20px;">Returned empty dataset (0 rows)</p>`;
    }

    const headers = Object.keys(data[0]);
    let html = `<table class="data-table"><thead><tr>`;
    headers.forEach(h => {
      html += `<th>${h}</th>`;
    });
    html += `</tr></thead><tbody>`;

    data.forEach(row => {
      html += `<tr>`;
      headers.forEach(h => {
        html += `<td>${row[h] !== null ? row[h] : 'NULL'}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    return html;
  }

  // Inspect raw mock database tables
  function loadRawTableInspector(tableName) {
    const data = mockDatabase[tableName] || [];
    rawTableDataBox.innerHTML = generateTableHtml(data);
  }

  // --- SQL Result Set Equivalency Grader ---
  function gradeQueryResult(actual, expected) {
    if (!actual || !expected) return false;
    if (actual.length !== expected.length) return false;

    // Convert rows into normalized key:value strings, sort and compare
    const serialize = row => Object.entries(row)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');

    const actualRows = actual.map(serialize).sort();
    const expectedRows = expected.map(serialize).sort();

    return actualRows.every((r, idx) => r === expectedRows[idx]);
  }

  // --- Running the query ---
  function executeUserQuery() {
    const userQuery = sqlEditor.value.trim();
    const activeLesson = lessons[state.activeLessonIndex];

    if (!userQuery) {
      resultStatusPanel.innerHTML = `
        <div class="result-card-alert alert-fail">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div class="alert-text-content">
            <h4>Empty Editor</h4>
            <p>Please write a SELECT query before hitting Run Query.</p>
          </div>
        </div>
      `;
      return;
    }

    try {
      // Execute
      const actual = executor.execute(userQuery);
      state.actualResult = actual;

      // Render actual output table
      actualTableContainer.innerHTML = generateTableHtml(actual);

      // Grade against target
      const isCorrect = gradeQueryResult(actual, state.expectedResult);

      if (isCorrect) {
        // Unlock progression
        if (!state.completedLessons.includes(activeLesson.id)) {
          state.completedLessons.push(activeLesson.id);
          saveHistoryProgress();
        }

        resultStatusPanel.innerHTML = `
          <div class="result-card-alert alert-pass">
            <i class="fa-solid fa-circle-check"></i>
            <div class="alert-text-content">
              <h4>Objective Unlocked!</h4>
              <p>Excellent work. Your SQL query matches the target output perfectly. You can proceed to the next lesson.</p>
            </div>
          </div>
        `;

        renderCurriculumList();

      } else {
        resultStatusPanel.innerHTML = `
          <div class="result-card-alert alert-fail">
            <i class="fa-solid fa-circle-xmark"></i>
            <div class="alert-text-content">
              <h4>Output Mismatch</h4>
              <p>Your query executed successfully, but the returned row records do not match the expected lesson targets. Try again.</p>
            </div>
          </div>
        `;
      }

      // Switch to actual tab
      switchRightTab('actual');

    } catch (err) {
      // Clear actual outputs and show error diagnostics
      actualTableContainer.innerHTML = `
        <div class="empty-results-state">
          <i class="fa-solid fa-bug text-danger"></i>
          <p>Query execution failed due to database engine compile issues.</p>
        </div>
      `;

      resultStatusPanel.innerHTML = `
        <div class="result-card-alert alert-fail">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div class="alert-text-content">
            <h4>SQL Compilation Error</h4>
            <p>${err.message}</p>
          </div>
        </div>
      `;
    }
  }

  // Helper selectors switcher
  function switchRightTab(tabName) {
    state.activeRightTab = tabName;
    tabTriggers.forEach(btn => {
      if (btn.getAttribute('data-right-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (tabName === 'actual') {
      actualPane.classList.add('active');
      expectedPane.classList.remove('active');
    } else {
      actualPane.classList.remove('active');
      expectedPane.classList.add('active');
    }
  }

  // --- Event Listeners ---

  // Run Query click
  btnRunQuery.addEventListener('click', () => {
    executeUserQuery();
  });

  // Reset editor
  btnResetCode.addEventListener('click', () => {
    const lesson = lessons[state.activeLessonIndex];
    sqlEditor.value = lesson.initialQuery;
    executeUserQuery();
  });

  // Autocomplete keywords injection helpers
  keywordButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const keyword = btn.getAttribute('data-keyword');
      const start = sqlEditor.selectionStart;
      const end = sqlEditor.selectionEnd;
      const text = sqlEditor.value;
      
      sqlEditor.value = text.substring(0, start) + keyword + text.substring(end);
      sqlEditor.focus();
      sqlEditor.selectionStart = sqlEditor.selectionEnd = start + keyword.length;
    });
  });

  // Raw table inspector tabs
  inspectorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      inspectorTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadRawTableInspector(tab.getAttribute('data-table'));
    });
  });

  // Left sidebar tab selector triggers
  document.querySelectorAll('[data-left-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-left-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const val = btn.getAttribute('data-left-tab');
      if (val === 'lessons') {
        document.getElementById('pane-lessons').classList.add('active');
        document.getElementById('pane-schema').classList.remove('active');
      } else {
        document.getElementById('pane-lessons').classList.remove('active');
        document.getElementById('pane-schema').classList.add('active');
      }
    });
  });

  // Right sidebar results tab selector triggers
  tabTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      switchRightTab(btn.getAttribute('data-right-tab'));
    });
  });

  // Start app
  loadHistoryProgress();
  renderCurriculumList();
  loadLessonDetails();
  loadRawTableInspector('students'); // default inspect students
});
