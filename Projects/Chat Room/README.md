# Chat Room

A real-time multi-tab chat room built with plain HTML, CSS and JavaScript — no server, no dependencies.

## Features

- **Real-time messaging** across multiple browser tabs using the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel).
- **Persistent history** — last 100 messages stored in `localStorage`, so they survive page refreshes.
- **Live presence** — shows online users and their count, updated as tabs open and close.
- **Echo bot** — a friendly bot replies when you're chatting alone (single-tab mode).
- **Typing indicator** — shows when another tab's user is typing, with animated dots.
- **Message grouping** — consecutive messages from the same sender are grouped for a cleaner look.
- **Dark glassmorphism UI** — premium dark theme with gradient accents and smooth animations.
- Fully responsive; sidebar collapses on mobile.
- Keyboard accessible (Enter to send, Shift+Enter for newline, full Tab support).
- Respects `prefers-reduced-motion`.

## Run it

Open `index.html` in any modern browser. Open a **second tab** with the same file to chat between tabs in real time.

> No build step. No `npm install`. No server. Just double-click.

## What it demonstrates

- **BroadcastChannel API** — native browser API for same-origin cross-tab communication.
- `localStorage` as lightweight message persistence.
- DOM templating with `<template>` elements — no framework needed.
- Event-driven async patterns (message events, storage events, heartbeat timers).
- Responsive CSS layout (sidebar + chat column) with CSS custom properties.
- Accessible ARIA roles (`role="dialog"`, `aria-live`, `aria-label`).
