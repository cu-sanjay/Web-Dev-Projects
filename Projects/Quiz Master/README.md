# Quiz Master

A premium client-side MCQ Quiz application featuring dynamic categories, timer-based gameplay modes, local user accounts, point-based leaderboards, and an AI-mock topic quiz generator. Conforms strictly to the client-side, zero-backend guidelines of the repository.

## Run it
Open `index.html` in any modern web browser.

## Features
- **Premium Black & Orange Interface**: Visual styling with high-contrast active highlights and smooth interactive transition keyframes.
- **Dynamic Dual Themes**: Workspace Light Mode and Dark Mode support.
- **Client-Side Account Registry**: 
  - Signup / Login validation panels.
  - User profiles (Name, Email, password change, stats).
- **Core Quiz Features**:
  - *Subject Categorization*: Play quizzes in JavaScript, React, HTML, CSS, Python, or General Knowledge.
  - *Difficulty modes*: Select between Easy, Medium, and Hard sets.
  - *Interactive Quiz Gameplay*: Dynamic countdown timers, progress bars, interactive option triggers, and instant correct/incorrect highlight states.
- **Achievements & Badges**: Unlock milestones (e.g. "Perfect Score", "Fast Learner", "Quiz Addict") tracked and saved locally in `localStorage`.
- **Leaderboard & Ranks**: Compare score achievements with other simulated local profiles.
- **Progress Log**: Review detailed reports on past games, categories played, accuracy scores, and dates.
- **AI Custom Quiz Generator**:
  - Input any custom prompt topic (e.g., "SQL Joins", "Machine Learning", "Git Branching").
  - The local semantic parser dynamically synthesizes and launches an accurate, subject-matching set of MCQs.

## Technical Details & Architecture
- **Structure**: Core SPA (Single Page Application) structured with HTML5, CSS Variables, and ES6 JavaScript.
- **State System**: User statistics, leaderboard slots, account entries, and progress logs are saved and synced inside `localStorage`.
- **Vanilla Animation**: Uses keyframe scaling for questions and answers widgets.
