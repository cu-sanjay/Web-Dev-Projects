# Weather Dashboard

A premium dark cyberpunk weather dashboard built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Asynchronous API Pipeline** — `async/await` fetches from OpenWeatherMap (current + 5-day/3-hour forecast). Graceful static mock fallback if no API key is configured.
- **Geolocation** — One-click "Use My Location" button via `navigator.geolocation`.
- **Adaptive Weather Themes** — Background gradients and accent shadow colors shift based on condition (e.g. electric blue for Rain, radiant amber for Clear, slate grey for Clouds).
- **5-Day Forecast Grid** — Responsive card deck with day name, weather icon, high/low temps, and description.
- **Recent Search History** — Last 8 cities cached in `localStorage` and rendered as clickable chips in the sidebar.
- **Defensive Validation** — Empty input rejection, API error fallback, geolocation failure handling, loading spinner for all requests.
- **Dark Cyberpunk Aesthetic** — `#050811` background, glassmorphic cards (`backdrop-filter`), monospace metrics, neon accent states.

## Usage

Set your OpenWeatherMap API key in `script.js`:
```js
var APPID = 'your_key_here';
```
If `APPID` remains the default, mock data will be used automatically.

## Run it

Open `index.html` in any modern browser.
