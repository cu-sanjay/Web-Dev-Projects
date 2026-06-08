# Job Application Tracker

A premium, interactive Kanban-style Job Application Tracker designed to help job seekers organize their career pipeline. Features native HTML5 drag-and-drop operations, real-time analytics, status logs, interview reminders, and data persistence inside a polished, modern Light Theme.

## Project Overview
This tool helps organize job hunts efficiently. Using a clear 5-column Kanban layout (Wishlist, Applied, Interviewing, Offer, Rejected), job seekers can visualize their progress, log company details, track target salaries, set interview calendar alerts, write custom job logs, and move cards across columns dynamically.

## Features
- **Interactive Kanban Board**: Fully functional drag-and-drop column grid using native HTML5 Drag and Drop API.
- **Application Management**: Add, edit, and delete job records containing title, company, salary range, application URL, logs, and dates.
- **Analytics Dashboard Header**: Visual cards tracking total jobs, active interviews, offers received, and current conversion rate metrics.
- **Live Search & Filters**: Search company names or job titles dynamically with live filter indicators.
- **Calendar Reminders**: Highlight upcoming interviews and date listings.
- **Notes System**: Add and revise notes and comments for each application.
- **Session Caching**: Saves and retrieves all columns, cards, notes, and stats using `localStorage`.
- **Responsive Layout**: Responsive columns that adjust dynamically across phone, tablet, and desktop interfaces.

## Technology Stack
- **HTML5**: Native semantic markup and Drag and Drop API elements.
- **CSS3**: Variable-based styling properties, flex/grid layouts, card shadows, drop-target focus borders, and keyframe slide animations.
- **JavaScript (ES6)**: State management, event handlers, and cache routines.

## Installation Steps & Local Setup
No build compilers, script bundles, or server frameworks are required. To run locally:

### Direct File Execution
1. Clone the repository fork:
   ```bash
   git clone https://github.com/MistryVishwa/Web-Dev-Projects.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "Web-Dev-Projects/Projects/Job Application Tracker"
   ```
3. Open `index.html` directly in any web browser by double-clicking it.

### Local Server Launch
To host the tracker on a static port:
- **Python (v3+)**:
  ```bash
  python -m http.server 8000
  ```
- **NodeJS (`serve` helper)**:
  ```bash
  npx serve -l 8000
  ```
Then visit `http://localhost:8000` inside your browser.

## Folder Structure
```
Job Application Tracker/
├── index.html       # Application layout skeleton
├── style.css        # Custom CSS variables, Kanban styles, animations
├── script.js        # Drag-and-drop API bindings, modal triggers, local caches
├── project.json     # Project listing descriptor
├── thumbnail.svg    # Dashboard preview icon
└── README.md        # Documentation file
```

## Usage Instructions
1. View the **Analytics Summary** in the header to read totals, active interviews, and success rates.
2. Click the **Add Application** button in the header to open the dialog form and enter job details.
3. **Move Cards**: Click and drag any card, and drop it into another column to update its status instantly.
4. **Edit / View Details**: Click on any card to open the details modal. Modify salaries, interview dates, or add notes, and click **Save Changes**.
5. **Search**: Enter text in the search input to filter cards instantly by company name or position title.
6. **Delete**: Click the trash icon (`🗑️`) on any card to delete the entry.

## Screenshots Section
*(Add visual previews of the light theme Kanban layout here)*

## Future Enhancements
- Integration of deadline reminders and push notifications.
- Direct resumes/cover letter PDF attachments.
- Custom kanban columns creation.

## Author Details
- **Name**: MistryVishwa
- **GitHub**: [MistryVishwa](https://github.com/MistryVishwa)

## License Information
This project is licensed under the MIT License. See the main repository `LICENSE` file for details.
