# SQL Query Visualizer

An interactive educational tool that helps beginners understand how SQL queries are executed internally. This application visually breaks down SQL queries into execution steps and displays data transformation at each stage.

## Overview

SQL Query Visualizer is a **frontend-only** web application that demystifies SQL query execution by providing step-by-step visualization of how data flows through different SQL clauses. Perfect for learning and teaching SQL fundamentals.

## Features

### 1. **SQL Query Input**
- Large, user-friendly SQL editor textarea
- Preloaded example queries for quick learning
- "Visualize Query" button to execute analysis
- Dropdown to load predefined example queries

### 2. **Supported SQL Clauses**
- `SELECT` - Column selection
- `FROM` - Table specification
- `WHERE` - Row filtering
- `ORDER BY` - Sorting (ASC/DESC)
- `LIMIT` - Result limiting
- `GROUP BY` - Basic grouping
- `COUNT(*)` - Aggregation

### 3. **Mock Dataset**
Includes a sample "users" table with realistic data:
```
id | name    | age | city       | salary
1  | Alice   | 22  | Delhi      | 50000
2  | Bob     | 30  | Mumbai     | 70000
3  | Charlie | 19  | Delhi      | 40000
4  | David   | 35  | Bangalore  | 90000
5  | Emma    | 28  | Hyderabad  | 65000
```

### 4. **Animated Execution Pipeline**
Visualize query execution flow:
```
FROM users
    ↓
WHERE age > 25
    ↓
ORDER BY salary DESC
    ↓
LIMIT 2
    ↓
FINAL RESULT
```

### 5. **Data Transformation View**
See how data changes through each step:
- Original table
- Filtered results
- Sorted results
- Final output

### 6. **Query Explanation Panel**
Auto-generated plain-English explanations:
> "Select the name and salary columns from users where age is greater than 25. Sort the results by salary in descending order and return only the first two rows."

### 7. **Execution Order Display**
Shows the actual SQL execution order:
1. FROM
2. WHERE
3. GROUP BY
4. SELECT
5. ORDER BY
6. LIMIT

Currently executing step is highlighted.

### 8. **Execution Statistics**
Track query performance metrics:
- Total rows in source table
- Rows after WHERE filter
- Rows after GROUP BY
- Final rows returned
- Estimated execution steps

### 9. **Modern UI/UX**
- **Dark theme** for reduced eye strain
- **Glassmorphism** card designs
- **Smooth animations** for visual feedback
- **Responsive layout** works on all devices
- **Professional developer-tool appearance**
- **SQL syntax-inspired color scheme**

### 10. **Additional Features**
- 📋 **Copy Query** - Copy query to clipboard
- 🔄 **Reset** - Clear all and start fresh
- 📊 **Query Statistics** - Execution details
- 💾 **Local Data** - No backend required
- ⚡ **Instant Execution** - Real-time visualization

## Supported Example Queries

1. **Simple SELECT**
   ```sql
   SELECT name, salary FROM users;
   ```

2. **WHERE Filtering**
   ```sql
   SELECT * FROM users WHERE age > 25;
   ```

3. **ORDER BY Sorting**
   ```sql
   SELECT name, salary FROM users ORDER BY salary DESC;
   ```

4. **LIMIT Constraint**
   ```sql
   SELECT name, city FROM users LIMIT 3;
   ```

5. **GROUP BY Aggregation**
   ```sql
   SELECT city, COUNT(*) as count FROM users GROUP BY city;
   ```

6. **Complex Query**
   ```sql
   SELECT name, salary FROM users 
   WHERE age > 25 
   ORDER BY salary DESC 
   LIMIT 2;
   ```

## Project Structure

```
SQL_Query_Visualizer/
├── README.md              # Project documentation
├── project.json          # Project metadata
├── index.html            # Main HTML file
├── style.css             # Styling and animations
├── script.js             # Core application logic
└── thumbnail.svg         # Project thumbnail (optional)
```

## How It Works

1. **Enter SQL Query** - Type or select an example query
2. **Click Visualize** - Parse and execute the query
3. **Watch Animation** - See the execution pipeline
4. **Analyze Results** - View data transformation at each step
5. **Read Explanation** - Understand what the query does
6. **Learn Statistics** - See execution metrics

## Technical Details

- **No frameworks** - Pure Vanilla JavaScript
- **No backend** - Completely client-side
- **No external APIs** - Fully self-contained
- **No dependencies** - Single HTML file can run offline
- **Browser compatible** - Works in all modern browsers

## Getting Started

1. Open `index.html` in a web browser
2. Enter a SQL query or load an example
3. Click "Visualize Query" button
4. Explore the execution pipeline and data transformation

## Features Demonstration

### Query Parsing
The application parses SQL queries and identifies:
- Selected columns
- Source table
- Filter conditions
- Sort fields and direction
- Result limits
- Grouping fields

### Data Simulation
Mock data is processed according to SQL rules:
- Filtering based on WHERE conditions
- Grouping and aggregation
- Sorting by specified columns
- Limiting result set

### Visualization
- Animated step-by-step execution
- Color-coded data transformation
- Clear indication of rows processed
- Before/after comparison

## Browser Compatibility

- ✅ Chrome/Edge (v88+)
- ✅ Firefox (v85+)
- ✅ Safari (v14+)
- ✅ Opera (v74+)

## Future Improvements

- [ ] JOIN operations visualization
- [ ] SUBQUERY support
- [ ] Multiple table support
- [ ] Custom data input
- [ ] Query performance estimation
- [ ] SQL syntax validation
- [ ] Download visualization as image
- [ ] Query complexity analyzer
- [ ] SQL execution time simulation
- [ ] Dark/Light theme toggle
- [ ] Query history
- [ ] Shareable query URLs

## Educational Value

Perfect for:
- 🎓 Students learning SQL basics
- 👨‍🏫 Teachers explaining query execution
- 🔍 Beginners debugging SQL queries
- 📚 Self-learners understanding databases

## License

Open source - Feel free to use, modify, and share!

## Author

**Ayush Kumar Singh**
- GitHub: [@ayushsinghbodra](https://github.com/ayushsinghbodra)

---

**Happy Learning! 🚀**

*SQL Query Visualizer - Making SQL execution visual and intuitive*
