# Currency Converter

A premium, glassmorphic currency converter with live exchange rates, offline caching, and real-time conversion.

## Features

- **Live Rates**: Fetches exchange rates from `open.er-api.com` on load
- **Offline Cache**: Falls back to `localStorage` when offline or API fails
- **Bidirectional Swap**: Animated swap button toggles base/target currencies
- **Input Sanitization**: Blocks negatives, exponents, and non-numeric input
- **Conversion History**: Tracks recent conversions with timestamps
- **Rate Breakdown**: Shows mid-market rate with 4-decimal precision

## How to Run

Open `index.html` in any modern browser. No build tools or API keys required.
