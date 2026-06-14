# AI Startup Validation Dashboard

An interactive, responsive client-side startup idea validator and financial incubator dashboard. Pitch ideas, analyze SWOT metrics, map competitors, simulate financial projection curves over a 12-month timeline, and check off validation milestones.

## Core Features

- **viability Pitch Validator**: Input startup descriptions, audience demographics, target TAM bounds, and pricing models to compute viability score ratings (0-100%).
- **SWOT Analysis Cards**: Synthesizes custom Strengths, Weaknesses, Opportunities, and Threats points derived from your pitch inputs.
- **Financial Projections Graph**: Slide inputs for expected user acquisitions and user pricing structures to render a 12-month interactive revenue chart using CSS grid columns scales, flagging profitable months vs deficit margins.
- **Validation Milestones Track**: Checklist to log important tasks (landing page setup, email collection rates, user interviews), persisted in the browser's `localStorage`.
- **Bookmarks History**: Save, compare, and switch between multiple startup validation profiles.

## Startup instructions

Open `index.html` in any web browser.

## Tech stack

- HTML5
- CSS3 (Vanilla variable layouts, financial grid bars, flex styling parameters, transition frames)
- Vanilla JavaScript (Viability parsers algorithms, financial curve simulators, local storage registers)
