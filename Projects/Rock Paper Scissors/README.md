````markdown
# ✊ ✋ ✌️ Rock Paper Scissors (Premium Edition)

A premium, interactive, and fully responsive classical Rock Paper Scissors game developed using pure **Vanilla HTML5**, **CSS3 (Custom Grid Layouts & Glassmorphic Elements)**, and **Structural JavaScript (Web Audio API)**. This project has been developed as an isolated feature layer under `Projects/` for NSoC '26.

---

## ⚡ Key Upgrades & Advanced Features

We have enhanced the traditional game design with advanced dynamic UI mechanisms:

- 🔥 **Win/Loss Streak Counter:** Tracks consecutive player wins in real-time. Reaching a 3+ win streak activates a high-energy glowing streak badge.
- 🌐 **Synthesized Audio Feedback:** Integrated the native browser **Web Audio API** to programmatically generate sound waves (Oscillator Nodes) for wins and losses. Avoids breaking external media pathways.
- 🎨 **Dynamic Theme Glowing FX:** Visual state transitions injected into the glassmorphism layout — glowing **Emerald Green** upon victory and **Crimson Red** upon defeat.
- 📋 **Dynamic Match History Timeline:** Implements a real-time rolling timeline buffer displaying data states (`W` / `L` / `T`) of the last 5 active rounds.
- 💾 **Score & Streak Persistence:** Leverages browser `localStorage` matrices to cache scores and active streaks securely across explicit page reloads.
- 📱 **Fluid Responsiveness:** Utilizes standalone CSS Grid components and viewpoint scaling to adapt seamlessly between massive desktops and mobile viewports.

---

## 📂 Isolated Architecture Layout

The folder structures are strictly isolated to avoid core layout collisions on the global repository:

```text
Rock Paper Scissors/
├── index.html       # Structural DOM architecture and modular asset nodes
├── style.css        # Encapsulated glassmorphic presentation layer & glowing states
├── script.js        # Core game engine logic, state managers, & Web Audio oscillators
├── project.json     # Strict schema descriptor metadata for automated site indexing
└── README.md        # Feature blueprint documentation
```

---

## 🚀 How to Run Locally

1. Clone or sync your workspace branch:

```bash
git checkout project-rock-paper-scissors
```

2. Open `index.html` directly via your preferred local development loop (e.g., VS Code Live Server or Python's `http.server` layer).

3. Tap on any weapon grid (**Rock**, **Paper**, or **Scissors**) to run live battle instances against the CPU!
````