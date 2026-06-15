# Internship Application Tracker

An interactive, responsive client-side recruitment tracker dashboard. Organize target roles, manage recruitment funnel metrics, track milestones checklists, and write interview notes.

## Core Features

- **recruitment Funnel Analytics**: Dynamic horizontal metrics bars mapping pipeline conversions:
  * Bookmarked -> Applied -> Interviewing -> Offered -> Rejected.
  * Calculates interview conversion percentages and active offer statistics.
- **Application Feed**: A scrollable board containing internship cards details (Company Name, Role Title, Stipend metrics, Status Badges, Applied Date).
- **Relational Inspector Panel**: Click a card to expand the inspector drawer to:
  * Edit Company, Role, Stipend, Status, and JD Links.
  * Add custom sub-task checklists (e.g. Write cover letter, Practice array trees, Complete OA).
  * Write interviewer names, notes, and logs.
- **Filtering & Searches**: Fast text query searches indexing companies and roles.
- **Local Storage State Persistence**: Keeps internship profiles and checklists synced locally.

## Startup instructions

Open `index.html` in any web browser.

## Tech stack

- HTML5
- CSS3 (Vanilla variable parameters, flexbox columns, grid alignments, transition frames)
- Vanilla JavaScript (Pipeline funnels calculators, list filters, local storage sync logs)
