# REST API Testing Studio

A professional API request builder and response inspector operating 100% inside your browser. Build client-side HTTP queries, customize parameters, manage persistent collections, and test API endpoints offline using an integrated **Local Mock Server Sandbox**.

## 🚀 Key Features

- **Multi-Method Request Builder**: Perform GET, POST, PUT, DELETE, and PATCH requests.
- **Tabbed Request Configuration**:
  - *Headers*: Set custom request headers (with auto-suggest keys like `Authorization` or `Content-Type`).
  - *Query Params*: Add URL queries that sync bidirectionally with the URL input bar.
  - *Auth*: Configure Bearer Tokens, Basic Auth, or API Keys.
  - *JSON Body*: Custom writing text area for raw JSON request payloads.
- **Response Inspector**: Detailed status descriptors (`200 OK`, `404 Not Found`, etc.), request latency statistics (ms), and response body payload size (KB).
- **Highlighted Code Viewer**: Custom pretty-printer mapping distinct CSS colors to JSON elements (string values, keys, numbers, booleans, nulls).
- **Offline Mock Server Sandbox**: Real-time mock router capturing requests to `https://api.mockbin/v1/*` to read/mutate local databases (e.g. `/users`, `/todos`) without CORS errors.
- **History & Collections**: Persistent sidebar history cataloging prior queries. Group requests into custom collections saved inside `localStorage`.

## 📂 Folder Layout

```
REST API Testing Studio/
├── README.md         # Detailed user manual
├── project.json      # Metadata descriptor
├── index.html        # App HTML structures
├── style.css         # Stylized themes, headers tabs, and syntax highlighters
├── script.js         # Core database managers, mock router, & query pretty-printer
└── thumbnail.svg     # Project showcase graphic
```

## 🛠️ How to Use

1. Open `index.html` in any modern browser.
2. Select a preset query from the dropdown list or type a request address.
3. Test mutated requests by sending `POST` or `PUT` payloads to the mock endpoints (`https://api.mockbin/v1/users`).
4. Select matching tabs to add authentication bearer headers or customize queries.
5. Double-click or select historical logs in the sidebar to restore past configurations.
