# AI Coding Mentor Dashboard

An interactive, responsive client-side coding environment and educational tutoring dashboard. It features a simulated IDE workspace, live JavaScript code executor, a simulated AI Code Mentor providing structural and complexity reviews, and gamified progress tracking.

## Core Features

- **Simulated IDE Workspace**: Editor with synchronized line numbering, automatic starter templates, code resetting, and a custom output console.
- **Client-Side Code Sandbox**: Runs JavaScript code safely in a try-catch block, overriding `console.log` to capture output in real-time.
- **Simulated AI Mentor & Reviewer**: Scans user code logic (loops, recursion, variables, signatures) and generates tabbed reviews detailing:
  * Review feedback (syntax, style, correctness).
  * Optimized refactored alternatives.
  * Concept explanations for code patterns.
- **Interactive Coding Challenges**: Predefined JavaScript coding tasks ranging from string reversal to Fibonacci sequences, matching inputs and expected outputs.
- **Gamified Achievements**: Level-up progression using XP scales, daily streak checks, and badge achievements, all persisted in the browser's `localStorage`.

## Run instructions

Open `index.html` in any web browser.

## Tech stack

- HTML5
- CSS3 (Vanilla design tokens, custom font variables, flex/grid templates)
- Vanilla JavaScript (local storage sync, sandbox evaluators, regex heuristic analyzers)
