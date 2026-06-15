# Database Query Execution Simulator

An interactive, client-side educational simulator modeling how SQL queries are processed by a database engine. It highlights SQL syntax parsing, Abstract Syntax Trees (ASTs), physical query plans, performance optimization choices (Sequential Scans vs. Index Scans), and step-by-step query execution across visual table grids.

## Features

- **SQL Query Editor & Presets**: Input query box with syntax templates for `SELECT`, `JOIN`, `WHERE` filters, `INDEX` creation, and `INSERT/UPDATE` operations.
- **Physical Query Execution Planner**:
  - **AST Visualizer**: Structural view of the parsed SQL tokens.
  - **Explain Plan Tree**: Graphical flow of processing steps (e.g. `Filter` &rarr; `Index Scan` on `users` &rarr; `Nested Loop Join`).
  - **Cost Analyzer**: Displays estimated disk block reads, page fetches, and CPU comparisons.
- **Interactive Step-by-Step Executer**: Step through query nodes node-by-node.
- **Live Row-Scanning Highlights**: Watch table rows flash yellow as they are read from memory/indexes, showing exactly how indices reduce scanned tuples.
- **Dynamic Database State Tables**: Interactive viewer for default schemas (`users`, `orders`, `products`) with the ability to add, edit, or delete entries.
- **Execution Log Console**: Terminal recording parse tokens, query plan choices, index scan hits, and sorting statistics.
- **Premium Glassmorphic Workspace Dashboard**: Modern dark-mode panels styled with CSS variables and responsive grids.

## Run it

Open `index.html` in any modern web browser.

## What it shows

- **Index Optimization (B-Tree-like Scans)**: How matching keys instantly fetch tuples vs checking every row (O(log N) vs O(N)).
- **Join Strategies (Nested Loop)**: Visual representation of how outer table rows match inner table pages.
- **Memory vs Disk Cost Models**: Simulated database cost formulas detailing how page sizes affect scan efficiency.
