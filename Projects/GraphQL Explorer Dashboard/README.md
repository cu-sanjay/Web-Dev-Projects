# GraphQL Explorer Dashboard

A premium client-side GraphQL IDE and schema documentation explorer (brand name **GraphExplorer**) built with vanilla web technologies. It allows developers to browse GraphQL schemas, write queries with autocomplete helpers, configure dynamic query variables, and run live operations or offline client-side mock schemas.

## 🚀 Features

- **Schema Documentation Browser**: Traversable dictionary rendering schemas, query arguments, objects, fields, and description tooltips. Clicking items resolves definitions instantly.
- **Interactive Query Editor**: Monospace query field supporting collapsible query variables, formatting helpers, and a quick-action toolbar containing common structural blocks (e.g. `query`, `mutation`, fields).
- **Resolver Engine & Local Storage Mock**: Evaluates GraphQL queries natively inside Javascript, matching query paths against a simulated local database (simulates SpaceX mock data, Blog platform, and User Directory) to return precise mock payloads.
- **Copy Utilities**: Dynamic code generation for executed queries in cURL commands, JS Fetch payloads, and Python scripts.
- **Query Run History**: Maintained cache listing previously executed query strings, enabling one-click reloading back into the active editing dashboard.
- **Premium Glassmorphic Theme**: Sleek slate-dark visual theme optimized for developers, fully responsive on both mobile and large workspace screen sizes.

## 📂 Project Structure

```
GraphQL Explorer Dashboard/
├── README.md         # Developer instructions
├── project.json      # Metadata workspace index
├── index.html        # App interface structure
├── style.css         # Styling system & dark mode selectors
├── script.js         # GraphQL parser resolvers & UI controller
└── thumbnail.svg     # Branding SVG mockup vector
```

## 🛠️ How to Use

1. Open `index.html` in any modern browser.
2. Select a schema preset (e.g. User Directory, SpaceX API) from the header select bar.
3. Browse Types and Fields inside the left sidebar **Docs** tab.
4. Input your queries into the central editor. Add JSON variables in the bottom drawer if needed.
5. Click **Run Query** (Play button) to view outputs on the right panel.
6. Check **History** tab to reload past executions, or copy code templates from the bottom console tab.
