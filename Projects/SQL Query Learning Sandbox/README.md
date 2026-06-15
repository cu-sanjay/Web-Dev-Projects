# SQL Query Learning Sandbox

An interactive client-side SQL learning laboratory designed to teach relational query writing in a gamified environment.

## Features

- **Guided SQL Curriculum**: 6 progressive lessons covering essential database topics:
  1. `SELECT & FROM` - Retrieving columns.
  2. `Filtering (WHERE)` - Relational operators.
  3. `Sorting (ORDER BY)` - Ascending/descending columns.
  4. `Aggregates (COUNT, AVG, SUM)` - Computing summaries.
  5. `Grouping (GROUP BY)` - Aggregating subsets.
  6. `INNER JOIN` - Combining relational tables.
- **Relational Schema Diagrams**: Direct visual representation of the datasets (`students`, `courses`, `enrollments`) mapped with column types and primary/foreign keys.
- **Auto-Grading Result Engine**: Compares output datasets set-wise to check logic accuracy and unlocks subsequent lesson plans.
- **SQL Helper Toolbar**: Autocomplete buttons to quickly write clauses.

## Directory Structure

```
SQL Query Learning Sandbox/
├── project.json       # Catalog metadata manifest
├── README.md          # User manual and course outline
├── index.html         # Workspace panels layout
├── style.css          # Glassmorphic learning layout styling
├── script.js          # Core SQL parser execution and lesson controllers
└── thumbnail.svg      # Workspace branding graphic
```

## How to Run

1. Open the `index.html` file in a modern browser.
2. Select a Lesson from the Left Panel checklist.
3. Read the Lesson details, constraints, and target schema instructions.
4. Input your SQL query into the Editor box (center) or use the help button indicators.
5. Click **Run Query** to verify output records against the target dataset results.
