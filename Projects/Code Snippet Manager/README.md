# Code Snippet Manager

An interactive developer utility to organize, edit, and execute code snippets in-browser. It features a split-pane editor, local storage indexing, a live iframe runner sandbox for web snippets, simulated compilers for other languages, search/tag filters, and JSON exports.

## Features

- **Live Code Execution Sandbox**: Write and run web snippets (HTML, CSS, JS) instantly using a sandboxed `iframe` preview viewport.
- **Console Output Simulator**: Executing backend snippets (Python, SQL, C++, Go) runs a simulated compiler that displays outputs or errors in a dark monospace console.
- **Snippet Categorizer**: Organize code by tags and presets folders (e.g. Utility, Algorithms, UI Components, Database Scripts).
- **Search & Query Filter**: Quickly find snippets by querying titles, keywords, tag lists, or filter by Star/Favorites.
- **Developer IDE Editor UI**: A sleek, VS Code inspired interface featuring dynamic line numbers and a copy-to-clipboard action.
- **Import / Export Library**: Back up your snippet library by downloading it as a JSON file, or restore saved snippet packs instantly.

## Supported Languages

- **HTML5 / CSS3 / JavaScript**: Renders directly inside sandbox layout.
- **Python**: Parses standard CLI `print` commands, string manipulations, and basic calculations.
- **SQL**: Simulates database schema checks and prints readable query result tables.
- **C++**: Compiles structure templates and prints mock compiler builds and outputs.
- **Go**: Executes server main templates and returns simulated server starts.

## Run it

Open `index.html` in any modern browser.
