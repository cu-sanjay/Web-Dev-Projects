# API Documentation Viewer

An interactive, client-side API documentation viewer and request testing console (brand name **APIDoc**) built with vanilla web languages. It lets developers load standard OpenAPI v3 specifications (via JSON, YAML upload, or built-in templates), browse endpoints grouped by tags in a Stripe-docs style three-column interface, inspect request/response schemas, and execute live or mock sandboxed test queries.

## 🚀 Features

- **OpenAPI v3 Specification Reader**: Render JSON or YAML API schema specifications. Parses details on servers, tags, endpoints, schemas, authentication, and parameters.
- **Three-Column Dashboard UI**:
  - **Column 1 (Navigation)**: Search query filter, authorization header locker (ApiKey, Bearer Token), and endpoints grouped by tags with colored HTTP request badges (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`).
  - **Column 2 (Documentation Details)**: In-depth parameter listings (query, path, header), type constraints, request body structure, and responses schema tables.
  - **Column 3 (Try-It-Out Sandbox)**: Dynamic request parameters builder, headers injector, code snippets generator (Curl, JS, Python, Go), and response logger.
- **Dual Sandbox Engine**: Toggle between **Live API Server** (fires actual requests across browser fetch) and **Mock Sandbox** (auto-synthesizes dummy response files matching spec schemas, letting the tool run completely offline).
- **Interactive Schema Trees**: Collapsible and color-coded nested JSON model schemas mapping array lists, object keys, and string formats.
- **Presets Loader**: Seeds fully featured preset specs for the Swagger Petstore API, E-Commerce Store API, and Tasks/Auth Tracker API.

## 📂 Project Structure

```
API Documentation Viewer/
├── README.md         # Developer instructions
├── project.json      # Workspace catalog index entry
├── index.html        # App interface markup
├── style.css         # Three-column layout and animations style sheet
├── script.js         # OpenAPI parser, mock generator, and sandbox script
└── thumbnail.svg     # Branding SVG mockup graphic
```

## 🛠️ How to Run

1. Open `index.html` in a modern browser.
2. Select one of the preset specs from the dropdown or click **Upload Spec** to choose a custom JSON or YAML file.
3. Browse endpoints in the left sidebar.
4. Fill in queries or authentication tokens, view generated request codes, and click **Send Request** to test.
