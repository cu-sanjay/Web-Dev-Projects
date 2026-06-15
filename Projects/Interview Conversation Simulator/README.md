# Interview Conversation Simulator

An AI-powered interview practice platform that simulates a live technical interview experience with timed questions, real-time answer evaluation, and comprehensive session reporting — all running entirely client-side.

---

## Features

- **8 Realistic Interview Questions** — Covers Technical, System Design, and Behavioral categories
- **Timed Responses** — 2-minute countdown per question with visual urgency cues (color changes at 30s and 15s)
- **Answer Evaluation** — Multi-dimensional scoring: Relevance, Depth, Keyword Coverage, and Clarity
- **Detailed Feedback** — Per-question analysis with detected keywords and suggestions for improvement
- **Session Report** — Cumulative stats: questions answered, average score, time used, answer streak
- **Progress Tracking** — Visual progress bar and dot indicators for each question

---

## Question Categories

| Category | Focus Area |
|----------|------------|
| Technical | JavaScript closures, event loop, React virtual DOM, REST vs GraphQL |
| System Design | URL shortener, real-time chat application |
| Behavioral | Conflict resolution, initiative and ownership |

---

## Evaluation Methodology

### Scoring Dimensions

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Relevance | 30% | Keyword match rate + answer length adequacy |
| Depth | 20% | Word count relative to minimum expected length |
| Keywords | 30% | Percentage of expected keywords found in answer |
| Clarity | 20% | Structural indicators, length, keyword density |

### Score Categories

| Score | Rating |
|-------|--------|
| 80–100 | Strong — well-structured, comprehensive |
| 60–79 | Solid — good coverage, minor gaps |
| 40–59 | Adequate — needs more depth and detail |
| Below 40 | Brief — expand with technical specifics |

---

## Local Deployment

```bash
git clone <repository-url>
cd "Interview Conversation Simulator"
start index.html
```

---

## Project Structure

```
Interview Conversation Simulator/
  index.html        Application layout
  style.css         Visual design and animations
  script.js         Question bank, timer, evaluation engine
  README.md         Documentation
  project.json      Project metadata
  thumbnail.svg     Project thumbnail
```

---

## Author

**Shruti Narsulwar** — [@Shrutiii01](https://github.com/Shrutiii01)
