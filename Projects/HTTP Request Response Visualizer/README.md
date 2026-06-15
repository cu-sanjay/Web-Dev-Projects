# HTTP Request Response Visualizer

An interactive educational dashboard designed to demystify the Hypertext Transfer Protocol (HTTP) request/response cycle. Senders customize HTTP methods, paths, custom headers, and request bodies. The server processes routing criteria, returning status codes, cookies, and payloads rendered inside a mock client viewport.

## Core Features

1. **HTTP Request Constructor**:
   - Customize methods: `GET`, `POST`, `PUT`, `DELETE`, `HEAD`.
   - Toggle paths: `/` (home page), `/index.html`, `/api/users` (JSON payload), `/login` (auth session test), `/admin/secure` (requires authorization header), or `/nonexistent` (trigger 404s).
   - Set custom request header variables (`Content-Type`, `Authorization`, `Accept-Language`, `User-Agent`).
   - Define payload body data for `POST` and `PUT` methods.

2. **Live Browser Viewport**:
   - A mock browser frame showing rendering results.
   - If the server replies with HTML, the browser displays a formatted, styled interface.
   - If the server returns JSON data, it displays a formatted, syntax-highlighted object node tree.
   - Shows cookie alerts and secure lock signs.

3. **Packet Transmission Animation**:
   - Animate the Request packet sliding across the wire from Web Browser to Web Server.
   - Watch the Server process routing conditions, compile headers, and send the Response packet back to the Client.

4. **Raw Header Inspector with Tooltips**:
   - Compiles exact raw HTTP request/response headers text (`GET /index.html HTTP/1.1\r\nHost: localhost...`).
   - Hovering over a header line pops up an educational tooltip detailing its purpose and usage.

5. **HTTP Quiz Simulator**:
   - Multi-choice training card containing questions about HTTP status code classifications (2xx, 3xx, 4xx, 5xx), header functions, and method behaviors.

## Run Locally
Double-click `index.html` in any modern web browser to open. No configurations, packages, or servers required.
