# Phishing Awareness Quiz

A cyber-defense training terminal for identifying phishing emails, built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Interactive Email Mockups** — Faithful replication of corporate/personal emails with From, Reply-To, Subject headers and body content. Hover over inline links to preview the destination URL in a monospace bar below.
- **11 Real-World Scenarios** — Covers fake MFA alerts (Netflix, Apple, Microsoft), shipping scams (DHL), credential harvesting (PayPal, LinkedIn), developer tool lures (GitHub, Stack Overflow), and legitimate emails (Google, Dropbox, internal HR). Seeded automatically on first boot.
- **Exploit-Safe Input Locking** — Buttons freeze instantly on selection to prevent double-click scoring exploits.
- **Correct Analysis** → Emerald glow on email card, score boost (10 + streak×2, max 30), streak increments.
- **Incorrect Analysis** → Screen shake animation, crimson flash, opens a "Security Defect Breakdown" drawer highlighting the specific email fields (red bounding frames on mismatched domains, suspicious Reply-To, deceptive URLs) and listing detailed analytical red flags.
- **Progression** — "Next Scenario" button smoothly advances without page refresh, clearing highlights and state.
- **Summary Modal** — After all scenarios, displays score, rating tier (Elite Guardian/Security Analyst/Security Trainee/At Risk), correct/incorrect counts, accuracy %, and best streak.
- **localStorage Persistence** — Best streak saved across sessions.

## UI Theme

High-end defensive network monitoring node aesthetic: `#04060f` backdrop, charcoal glassmorphic cards, neon cyan accents, monospace link preview, crimson red-flag breakdowns, spring-easing micro-interactions.

## Usage

Open `index.html` in any browser. Read each email, hover any links to verify the destination URL, then choose "Legitimate Email" or "Phishing Threat".
