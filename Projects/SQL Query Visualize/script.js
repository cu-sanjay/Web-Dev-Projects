const mockDatabase = {
    users: [
        { id: 1, name: 'Alice', age: 22, city: 'Delhi', salary: 50000 },
        { id: 2, name: 'Bob', age: 30, city: 'Mumbai', salary: 70000 },
        { id: 3, name: 'Charlie', age: 19, city: 'Delhi', salary: 40000 },
        { id: 4, name: 'David', age: 35, city: 'Bangalore', salary: 90000 },
        { id: 5, name: 'Emma', age: 28, city: 'Hyderabad', salary: 65000 }
    ]
};

const exampleQueries = {
    'simple-select': 'SELECT name, salary FROM users;',
    'where-filter': 'SELECT * FROM users WHERE age > 25;',
    'order-by': 'SELECT name, salary FROM users ORDER BY salary DESC;',
    'limit': 'SELECT name, city FROM users LIMIT 3;',
    'group-by': 'SELECT city, COUNT(*) as count FROM users GROUP BY city;',
    'count': 'SELECT COUNT(*) as total_users FROM users;',
    'complex': 'SELECT name, salary FROM users WHERE age > 25 ORDER BY salary DESC LIMIT 2;'
};

class SQLExecutor {
    constructor(database) {
        this.database = database;
        this.executionSteps = [];
        this.explanation = '';
        this.statistics = {
            sourceRows: 0,
            filteredRows: 0,
            returnedRows: 0,
            executionSteps: 0
        };
    }

    parseQuery(query) {
        const normalized = query.trim().toUpperCase().replace(/\s+/g, ' ');
        
        const parsedQuery = {
            original: query.trim(),
            type: 'SELECT',
            selectColumns: [],
            fromTable: '',
            whereCondition: null,
            groupByColumns: [],
            orderByColumn: null,
            orderByDirection: 'ASC',
            limitValue: null
        };

        // Extract SELECT columns
        const selectMatch = normalized.match(/SELECT\s+(.*?)\s+FROM/);
        if (selectMatch) {
            const columnsStr = selectMatch[1].trim();
            if (columnsStr === '*') {
                parsedQuery.selectColumns = ['*'];
            } else {
                parsedQuery.selectColumns = columnsStr.split(',').map(col => {
                    // Handle COUNT(*) and other functions
                    return col.trim().split(/\s+AS\s+/)[0].trim();
                });
            }
        }

        // Extract FROM table
        const fromMatch = normalized.match(/FROM\s+(\w+)/);
        if (fromMatch) {
            parsedQuery.fromTable = fromMatch[1].toLowerCase();
        }

        // Extract WHERE condition
        const whereMatch = normalized.match(/WHERE\s+(.*?)(?:GROUP BY|ORDER BY|LIMIT|$)/);
        if (whereMatch) {
            parsedQuery.whereCondition = whereMatch[1].trim();
        }

        // Extract GROUP BY
        const groupMatch = normalized.match(/GROUP BY\s+(.*?)(?:ORDER BY|LIMIT|$)/);
        if (groupMatch) {
            parsedQuery.groupByColumns = groupMatch[1].split(',').map(col => col.trim().toLowerCase());
        }

        // Extract ORDER BY
        const orderMatch = normalized.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)?/);
        if (orderMatch) {
            parsedQuery.orderByColumn = orderMatch[1].toLowerCase();
            parsedQuery.orderByDirection = orderMatch[2] || 'ASC';
        }

        // Extract LIMIT
        const limitMatch = normalized.match(/LIMIT\s+(\d+)/);
        if (limitMatch) {
            parsedQuery.limitValue = parseInt(limitMatch[1]);
        }

        return parsedQuery;
    }

    execute(query) {
        this.executionSteps = [];
        
        const parsed = this.parseQuery(query);
        let data = [...this.database[parsed.fromTable] || []];

        this.statistics.sourceRows = data.length;

        // Step 1: FROM clause
        this.executionSteps.push({
            clause: 'FROM',
            description: `Load data from "${parsed.fromTable}" table`,
            rowsAfter: data.length,
            data: JSON.parse(JSON.stringify(data))
        });

        // Step 2: WHERE clause
        if (parsed.whereCondition) {
            data = this.applyWhereClause(data, parsed.whereCondition);
            this.executionSteps.push({
                clause: 'WHERE',
                description: `Filter rows where ${parsed.whereCondition}`,
                rowsAfter: data.length,
                data: JSON.parse(JSON.stringify(data))
            });
        }

        this.statistics.filteredRows = data.length;

        // Step 3: GROUP BY clause
        if (parsed.groupByColumns.length > 0) {
            data = this.applyGroupBy(data, parsed.groupByColumns);
            this.executionSteps.push({
                clause: 'GROUP BY',
                description: `Group by ${parsed.groupByColumns.join(', ')}`,
                rowsAfter: data.length,
                data: JSON.parse(JSON.stringify(data))
            });
        }

        // Step 4: SELECT clause
        if (parsed.selectColumns[0] !== '*') {
            data = this.applySelectColumns(data, parsed.selectColumns);
        }
        this.executionSteps.push({
            clause: 'SELECT',
            description: `Select columns: ${parsed.selectColumns.join(', ')}`,
            rowsAfter: data.length,
            data: JSON.parse(JSON.stringify(data))
        });

        // Step 5: ORDER BY clause
        if (parsed.orderByColumn) {
            data = this.applyOrderBy(data, parsed.orderByColumn, parsed.orderByDirection);
            this.executionSteps.push({
                clause: 'ORDER BY',
                description: `Sort by ${parsed.orderByColumn} ${parsed.orderByDirection}`,
                rowsAfter: data.length,
                data: JSON.parse(JSON.stringify(data))
            });
        }

        // Step 6: LIMIT clause
        if (parsed.limitValue !== null) {
            data = data.slice(0, parsed.limitValue);
            this.executionSteps.push({
                clause: 'LIMIT',
                description: `Limit result to ${parsed.limitValue} rows`,
                rowsAfter: data.length,
                data: JSON.parse(JSON.stringify(data))
            });
        }

        this.statistics.returnedRows = data.length;
        this.statistics.executionSteps = this.executionSteps.length;

        this.generateExplanation(parsed);

        return {
            finalResult: data,
            steps: this.executionSteps,
            statistics: this.statistics,
            explanation: this.explanation,
            parsed: parsed
        };
    }

    applyWhereClause(data, condition) {
        return data.filter(row => this.evaluateCondition(row, condition));
    }

    evaluateCondition(row, condition) {
        if (condition.toUpperCase().includes(' AND ')) {
            const parts = condition.split(/\s+AND\s+/i);
            return parts.every(part => this.evaluateSingleCondition(row, part.trim()));
        }

        if (condition.toUpperCase().includes(' OR ')) {
            const parts = condition.split(/\s+OR\s+/i);
            return parts.some(part => this.evaluateSingleCondition(row, part.trim()));
        }

        return this.evaluateSingleCondition(row, condition);
    }

    evaluateSingleCondition(row, condition) {
        const gtMatch = condition.match(/(\w+)\s*>\s*(\d+)/);
        if (gtMatch) {
            return row[gtMatch[1]] > parseInt(gtMatch[2]);
        }

        const ltMatch = condition.match(/(\w+)\s*<\s*(\d+)/);
        if (ltMatch) {
            return row[ltMatch[1]] < parseInt(ltMatch[2]);
        }

        const eqMatch = condition.match(/(\w+)\s*=\s*['"]?(\w+)['"]?/);
        if (eqMatch) {
            return row[eqMatch[1]] == eqMatch[2];
        }

        const gteMatch = condition.match(/(\w+)\s*>=\s*(\d+)/);
        if (gteMatch) {
            return row[gteMatch[1]] >= parseInt(gteMatch[2]);
        }

        const lteMatch = condition.match(/(\w+)\s*<=\s*(\d+)/);
        if (lteMatch) {
            return row[lteMatch[1]] <= parseInt(lteMatch[2]);
        }

        return true;
    }

    applyGroupBy(data, columns) {
        const grouped = {};

        data.forEach(row => {
            const key = columns.map(col => row[col]).join('|');
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(row);
        });

        return Object.entries(grouped).map(([key, rows]) => {
            const result = {};
            columns.forEach((col, idx) => {
                result[col] = rows[0][col];
            });
            return result;
        });
    }

    applySelectColumns(data, columns) {
        return data.map(row => {
            const newRow = {};
            columns.forEach(col => {
                if (col.includes('COUNT(*)')) {
                    newRow['count'] = 1;
                } else {
                    newRow[col] = row[col];
                }
            });
            return newRow;
        });
    }

    applyOrderBy(data, column, direction) {
        const sorted = [...data];
        sorted.sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];

            if (typeof aVal === 'string') {
                return direction === 'ASC' 
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return direction === 'ASC' ? aVal - bVal : bVal - aVal;
        });
        return sorted;
    }

    generateExplanation(parsed) {
        let explanation = '';

        // SELECT part
        if (parsed.selectColumns[0] === '*') {
            explanation += 'Select all columns ';
        } else {
            explanation += `Select the ${parsed.selectColumns.join(', ')} column(s) `;
        }

        // FROM part
        explanation += `from the ${parsed.fromTable} table`;

        // WHERE part
        if (parsed.whereCondition) {
            explanation += ` where ${parsed.whereCondition}`;
        }

        // GROUP BY part
        if (parsed.groupByColumns.length > 0) {
            explanation += `. Group the results by ${parsed.groupByColumns.join(', ')}`;
        }

        // ORDER BY part
        if (parsed.orderByColumn) {
            explanation += `. Sort the results by ${parsed.orderByColumn} in ${parsed.orderByDirection} order`;
        }

        // LIMIT part
        if (parsed.limitValue) {
            explanation += ` and return only the first ${parsed.limitValue} row(s)`;
        }

        explanation += '.';

        this.explanation = explanation;
    }
}

class UIManager {
    constructor() {
        this.executor = new SQLExecutor(mockDatabase);
        this.currentResult = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('visualizeBtn').addEventListener('click', () => this.visualizeQuery());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyQuery());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetApp());
        document.getElementById('exampleSelect').addEventListener('change', (e) => this.loadExample(e.target.value));
    }

    visualizeQuery() {
        const query = document.getElementById('queryInput').value.trim();

        if (!query) {
            this.showNotification('Please enter a SQL query', 'error');
            return;
        }

        try {
            this.showLoading(true);

            setTimeout(() => {
                const result = this.executor.execute(query);
                this.currentResult = result;

                this.updateStatistics(result.statistics);
                this.renderExecutionPipeline(result.steps);
                this.renderExplanation(result.explanation);
                this.renderExecutionOrder(result.parsed);
                this.renderDataTransformation(result.steps, result.finalResult);

                this.showLoading(false);
                this.showNotification('Query executed successfully!', 'success');
            }, 300);
        } catch (error) {
            this.showLoading(false);
            this.showNotification('Error parsing query: ' + error.message, 'error');
            console.error('Query execution error:', error);
        }
    }


    updateStatistics(stats) {
        document.getElementById('sourceRows').textContent = stats.sourceRows;
        document.getElementById('filteredRows').textContent = stats.filteredRows;
        document.getElementById('returnedRows').textContent = stats.returnedRows;
        document.getElementById('executionSteps').textContent = stats.executionSteps;
    }


    renderExecutionPipeline(steps) {
        const container = document.getElementById('executionPipeline');
        container.innerHTML = '';

        steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'execution-step';
            stepEl.innerHTML = `
                <div class="execution-step-icon">${this.getClauseIcon(step.clause)}</div>
                <div class="execution-step-content">
                    <div class="execution-step-title">${step.clause}</div>
                    <div class="execution-step-desc">${step.description}</div>
                    <div class="row-count"><strong>${step.rowsAfter}</strong> row(s)</div>
                </div>
            `;
            container.appendChild(stepEl);

            if (index < steps.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'execution-arrow';
                arrow.textContent = '↓';
                container.appendChild(arrow);
            }

            setTimeout(() => {
                stepEl.classList.add('active');
            }, index * 200);
        });
    }


    getClauseIcon(clause) {
        const icons = {
            'FROM': '📊',
            'WHERE': '🔍',
            'GROUP BY': '📈',
            'SELECT': '✓',
            'ORDER BY': '↕',
            'LIMIT': '🎯'
        };
        return icons[clause] || '●';
    }

    renderExplanation(explanation) {
        document.getElementById('explanationText').textContent = explanation;
    }

    renderExecutionOrder(parsed) {
        const container = document.getElementById('executionOrder');
        container.innerHTML = '';

        const executionOrder = [
            { name: 'FROM', active: !!parsed.fromTable },
            { name: 'WHERE', active: !!parsed.whereCondition },
            { name: 'GROUP BY', active: parsed.groupByColumns.length > 0 },
            { name: 'SELECT', active: true },
            { name: 'ORDER BY', active: !!parsed.orderByColumn },
            { name: 'LIMIT', active: !!parsed.limitValue }
        ];

        executionOrder.forEach((item, index) => {
            const orderEl = document.createElement('div');
            orderEl.className = `order-item ${item.active ? 'executed' : ''}`;
            orderEl.innerHTML = `
                <span class="order-number">${index + 1}</span>
                <span class="order-name">${item.name}</span>
            `;
            container.appendChild(orderEl);

            if (item.active) {
                setTimeout(() => {
                    orderEl.classList.add('current');
                }, index * 100);

                setTimeout(() => {
                    orderEl.classList.remove('current');
                }, index * 100 + 500);
            }
        });
    }

    renderDataTransformation(steps, finalResult) {
        const container = document.getElementById('transformationSteps');
        container.innerHTML = '';

        steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'transformation-step';
            stepEl.style.animationDelay = `${index * 0.1}s`;

            const tableHtml = this.generateTableHtml(step.data);

            stepEl.innerHTML = `
                <div class="transformation-step-title">${step.clause}</div>
                <div class="transformation-step-table">${tableHtml}</div>
                <div class="row-count">Result: <strong>${step.rowsAfter}</strong> row(s)</div>
            `;

            container.appendChild(stepEl);
        });

        const finalEl = document.createElement('div');
        finalEl.className = 'transformation-step';
        finalEl.style.animationDelay = `${steps.length * 0.1}s`;

        const finalTableHtml = this.generateTableHtml(finalResult);

        finalEl.innerHTML = `
            <div class="transformation-step-title">✨ Final Result</div>
            <div class="transformation-step-table">${finalTableHtml}</div>
            <div class="row-count">Final Result: <strong>${finalResult.length}</strong> row(s)</div>
        `;

        container.appendChild(finalEl);
    }

    generateTableHtml(data) {
        if (data.length === 0) {
            return '<p style="color: var(--text-secondary); text-align: center;">No rows</p>';
        }

        const headers = Object.keys(data[0]);
        let html = '<table class="data-table"><thead><tr>';

        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });

        html += '</tr></thead><tbody>';

        data.slice(0, 5).forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                html += `<td>${row[header]}</td>`;
            });
            html += '</tr>';
        });

        if (data.length > 5) {
            html += `<tr><td colspan="${headers.length}" style="text-align: center; color: var(--text-secondary);">... and ${data.length - 5} more rows</td></tr>`;
        }

        html += '</tbody></table>';

        return html;
    }

    copyQuery() {
        const query = document.getElementById('queryInput').value;
        if (!query) {
            this.showNotification('No query to copy', 'error');
            return;
        }

        navigator.clipboard.writeText(query).then(() => {
            this.showNotification('Query copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy query', 'error');
        });
    }

    loadExample(key) {
        if (key && exampleQueries[key]) {
            document.getElementById('queryInput').value = exampleQueries[key];
            this.visualizeQuery();
        }
    }

    resetApp() {
        document.getElementById('queryInput').value = '';
        document.getElementById('exampleSelect').value = '';
        document.getElementById('executionPipeline').innerHTML = '';
        document.getElementById('transformationSteps').innerHTML = '';
        document.getElementById('explanationText').textContent = 'Enter a SQL query and click "Visualize Query" to see the explanation.';
        document.getElementById('executionOrder').innerHTML = '';

        document.getElementById('sourceRows').textContent = '0';
        document.getElementById('filteredRows').textContent = '0';
        document.getElementById('returnedRows').textContent = '0';
        document.getElementById('executionSteps').textContent = '0';

        this.showNotification('Application reset', 'success');
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.add('active');
        } else {
            spinner.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        notificationText.textContent = message;
        notification.className = 'notification show';

        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.classList.remove('show', 'hide');
            }, 400);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const uiManager = new UIManager();

    document.getElementById('queryInput').value = exampleQueries['simple-select'];
});
