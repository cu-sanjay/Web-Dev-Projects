# GitScope - GitHub User Search Dashboard

A premium, production-grade analytics dashboard that fetches, displays, and caches GitHub user profile information and repository metrics in real time. Built entirely using high-performance client-side web standards, showcasing a premium design system featuring a Black & Dark Gray base with elegant Orange accents.

## Project Overview
GitScope provides developers and recruiters with a clean, high-fidelity visualization of any public GitHub profile. By leveraging the public GitHub REST API, it generates real-time analytics, calculates custom achievements, draws language statistics, maps timelines of recent activities, and parses developer profile README documents natively in the browser.

## Features
- **Comprehensive API Integration**: Direct retrieval of user profiles, public events, repository languages, and account metadata.
- **Client-side Markdown Parsing**: Automatically fetches and renders the user's special profile README (`username/username`) dynamically using `marked.js`.
- **Paginated Repositories List**: Neatly displays all public repositories in a paginated grid of 6 cards per page.
- **Dynamic Heatmaps & Charts**: Integrates live-rendered SVG activity heatmaps and line graph activity trends themed matching the system colors.
- **Dynamic Achievements & Badges**: Calculates and unlocks custom developer status badges (e.g. *Early Adopter*, *Pro Coder*, *Influencer*) from live statistics.
- **Event Log Timeline**: Lists the 10 most recent activities (commits, stars, fork references, issue comments) chronologically.
- **Search History Quick-Tags**: Persists the 5 most recent successful profile queries in `localStorage` as clickable search buttons.
- **Robust Error States**: Visual alerts for `404 User Not Found` and `403 API Rate Limit Exceeded` boundaries.
- **Light/Dark Toggle**: Workspace color systems that persist preference configurations locally.

## Tech Stack
- **Structure**: Semantic HTML5 markup
- **Styling**: Modern CSS3 (CSS custom properties, flex/grid templates, keyframe animations)
- **Scripting**: Vanilla ES6 JavaScript (Asynchronous fetch logic, event handlers)
- **External libraries**: [marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js) (client-side markdown parsing)
- **Visual integrations**: [ghchart](https://ghchart.rshah.org/) (heatmap charts), [activity-graph](https://github-readme-activity-graph.vercel.app/) (trend charts)

## Installation Guide & Local Setup
No compilation, package installs, or environment configurations are required. Follow the instructions below to run GitScope locally:

### Direct File Execution (Quick Start)
1. Clone your fork of the repository:
   ```bash
   git clone https://github.com/MistryVishwa/Web-Dev-Projects.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "Web-Dev-Projects/Projects/GitHub User Search"
   ```
3. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari) by double-clicking it.

### Serving with local web server
To host it locally on a static HTTP port, run one of the following commands in the directory:
- **Python (v3+)**:
  ```bash
  python -m http.server 8000
  ```
- **NodeJS (`serve` utility)**:
  ```bash
  npx serve -l 8000
  ```
Then visit `http://localhost:8000` in your web browser.

## Usage Guide
1. Enter a valid GitHub username (e.g., `torvalds` or `gaearon`) inside the search input bar.
2. Press **Enter** or click **Search** to run.
3. Switch between tabs inside the profile summary content pane:
   - **Overview**: View metadata details, language breakdown charts, dynamically computed achievement badges, and the parsed Profile README.
   - **Repositories**: Browse through the top-starred public repos and paginate through the list of recent repositories.
   - **Analytics & Timeline**: View the contribution heatmap, weekly activity chart, and event timeline log.
4. Click on the Moon/Sun icon in the header to switch between Light and Dark visual theme modes.

## API Information
This dashboard queries the public GitHub REST v3 API:
- User details: `https://api.github.com/users/{username}`
- Repositories list: `https://api.github.com/users/{username}/repos?per_page=100`
- Profile README: `https://api.github.com/repos/{username}/{username}/readme`
- Activity logs: `https://api.github.com/users/{username}/events`

*Note: Unauthenticated requests to GitHub's REST API are rate-limited to 60 requests per hour per IP. In case of limitation, the application displays a rate-limit alert.*

## Folder Structure
```
GitHub User Search/
├── index.html       # Application entry page structure
├── style.css        # Premium stylesheets (Light/Dark themes)
├── script.js        # API requests, pagination and state handlers
├── project.json     # Repo catalog indexing metadata
├── thumbnail.svg    # Visual logo graphic container
└── README.md        # Documentation guide
```

## Screenshots Section
*(Add visual previews of your dashboard screens here)*

## Future Enhancements
- Integration of GitHub OAuth token logins to bypass public rate limits.
- Advanced charts for repository languages and monthly activity breakdown.
- PDF generation of developer resume reports compiled from dashboard metrics.

## Contribution Guidelines
Please follow the repository guidelines:
- Commit code inside `Projects/GitHub User Search/` directory only.
- Adhere to the `2 spaces` standard indentation model.
- Keep the script vanilla with zero external build systems.

## License Information
This project is licensed under the MIT License. See the main repository `LICENSE` file for details.
