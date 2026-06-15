# Swatch Memory Master

An advanced cognitive training game utilizing high-proximity hue pairs to challenge human sensory chromatic memory.

---

## Chromatic Cognition and Hue Variance Theory

### Why Color Proximity Matters

Traditional memory matching games use distinct iconography (animals, shapes, symbols) that encode to verbal memory. This application instead challenges **chromatic sensory memory** — the brain's ability to hold fine-grained color information across short intervals.

The color pairs are engineered with deliberate micro-variance:

| Pair | Hex 1 | Hex 2 | Delta-E (approx) |
|------|-------|-------|-------------------|
| Ocean Teal | `#14b8a6` | `#0d9488` | ~8 |
| Rose Pink | `#f43f5e` | `#e11d48` | ~7 |
| Amber | `#f59e0b` | `#d97706` | ~10 |
| Violet | `#a855f7` | `#9333ea` | ~9 |
| Cyan | `#06b6d4` | `#0891b2` | ~8 |
| Emerald | `#10b981` | `#059669` | ~9 |

These delta values place each pair in the "noticeable but confusable" range — close enough that players must rely on active chromatic memory rather than verbal labeling.

### The 1-Second Preview Constraint

During the **MEMORIZE** phase, all 12 cards are revealed simultaneously for exactly 1000ms. This forces the brain to engage its **iconic memory** buffer — a high-capacity, rapid-decay visual store that holds roughly 500–1000ms of pre-attentive visual information. Players must rapidly encode 6 pairs of near-identical hues before the buffer decays.

---

## Asynchronous State Machine Lifecycles

### State Transitions

```
IDLE → MEMORIZE → PLAY → VICTORY
                ↘ PLAY → PLAY (loop on match/mismatch)
```

### Phase Details

1. **IDLE** (`AWAITING INITIALIZATION`)
   - Grid rendered face-down with geometric pattern back
   - All input locked
   - INITIALIZE button active

2. **MEMORIZE** (`MEMORIZE SWATCH MATRIX (1.0s)`)
   - All cards flip face-up via `.flipped` class
   - Async `Promise` + `setTimeout(1000)` creates precise preview window
   - After 1s, all cards flip face-down
   - Input lock released → transition to PLAY

3. **PLAY** (`MATRIX UNLOCKED — CHOOSE PAIR`)
   - Player clicks cards to reveal colors
   - First click: flip card, record index
   - Second click: flip card, compare pair values
   - If match: cards stay face-up, marked `.matched`, increment counter
   - If mismatch: cards shake, wait 800ms via `setTimeout`, flip back down, increment mistake counter
   - When 6/6 pairs found → VICTORY

4. **VICTORY** (`VICTORY — ALL PAIRS IDENTIFIED`)
   - Grid pulses with emerald glow via `victory-glow` class
   - All input locked
   - Player can RESTART to begin new round

### Async Control Flow

```javascript
async function startPreview() {
  flipAllCardsUp();
  await new Promise(r => setTimeout(r, 1000)); // non-blocking 1s delay
  flipAllCardsDown();
  unlockInput();
}
```

The `setTimeout` wrapped in a `Promise` creates a non-blocking 1000ms delay without freezing the UI thread. During this period, CSS animations continue to render smoothly.

---

## 3D Transition Matrix CSS Layout Setup

### Card Flip Architecture

Each card is a composite of four nested elements:

```
.card                         ← click target, position: relative
  .card-inner                  ← transform container, perspective
    .card-face.card-back       ← face-down (geometric pattern)
    .card-face.card-front      ← face-up (color swatch)
```

### CSS 3D Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `perspective` | `1000px` | Establishes 3D depth on parent grid |
| `transform-style` | `preserve-3d` | Allows children to occupy 3D space |
| `backface-visibility` | `hidden` | Hides reverse side of each face |
| `transition` | `transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)` | Smooth flip animation |

### Flip Mechanics

- **Default state**: `.card-inner` has `transform: none` → back face visible
- **`.flipped` state**: `.card-inner` has `transform: rotateY(180deg)` → front face visible
- **Front face**: Pre-rotated `transform: rotateY(180deg)` so it faces the correct direction when the container flips

### Shake Animation (Mismatch Feedback)

```css
@keyframes cardShake {
  0%, 100% { transform: rotateY(180deg) translateX(0); }
  20% { transform: rotateY(180deg) translateX(-4px); }
  40% { transform: rotateY(180deg) translateX(4px); }
  /* ... */
}
```

The shake preserves the flipped 180-degree rotation while adding horizontal oscillation.

---

## Operational Instructions

### How to Play

1. Click **INITIALIZE MEMORY MATRIX** to start a new game
2. All 12 cards will flip face-up for exactly **1 second** — memorize the pair positions
3. Cards flip face-down — click any card to reveal its color
4. Click a second card to attempt a match
5. If the hues match, both cards stay face-up
6. If the hues mismatch, cards shake and flip back after 800ms
7. Find all 6 pairs to win

### Controls

| Input | Action |
|-------|--------|
| Click card | Reveal / select color swatch |
| INITIALIZE / RESTART | Start new game round |

### Scoring

- **Pairs Found**: Tracks matches out of 6
- **Accuracy**: Percentage of clicks that resulted in matches (hits / total clicks)
- **Mistakes**: Total mismatches (incorrect pair attempts)

---

## File Directory Layout

```
swatch-memory-master/
├── index.html        # Application structure with telemetry and card grid
├── style.css         # 3D card flip mechanics, perspective grid, shake animation
├── script.js         # Async state machine, match logic, preview timer
├── README.md         # This documentation file
├── project.json      # Project metadata configuration
└── thumbnail.svg     # Application thumbnail icon
```

### Architecture

- **index.html** — Dual-column layout: Control Center (left) with pairs counter, accuracy meter, mistake counter, and initialize button; 3D Swatch Grid Arena (right) with 4×3 card matrix
- **style.css** — CSS Grid dashboard, `perspective: 1000px` parent, `transform-style: preserve-3d` cards with `backface-visibility: hidden`, `0.6s cubic-bezier` flip transitions, geometric wireframe back-face pattern, shake keyframe animation
- **script.js** — State machine (idle → memorize → play → victory), Fisher-Yates shuffle, async `setTimeout(1000)` preview Promise, click handler with input lock, pair comparison with 800ms mismatch delay, accuracy calculator

---

## Local Deployment Verification

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools, frameworks, or external dependencies required

### Steps

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd swatch-memory-master
   ```

2. Open `index.html` in your web browser:
   ```
   # On Windows
   start index.html

   # On macOS
   open index.html

   # On Linux
   xdg-open index.html
   ```

3. Verify the application loads with:
   - Dual-column dashboard layout
   - Dark engineering theme (#070a13 background)
   - 4×3 grid of face-down cards
   - Telemetry showing 0 / 6 FOUND

### Testing

1. Click INITIALIZE — verify all cards flip up for exactly 1 second, then flip down
2. Click two cards — verify they flip up and match logic triggers
3. On mismatch — verify the 800ms delay, shake animation, and card flip-back
4. Complete all 6 pairs — verify victory state with glow
5. Verify accuracy and mistake counters update correctly

---

## Technical Details

- **Grid**: 4×3 = 12 cards (6 color pairs)
- **Card Flip**: 3D CSS transforms with GPU compositing
- **Preview Timer**: `setTimeout` wrapped in `Promise` — 1000ms
- **Mismatch Delay**: 800ms for hue deviation processing
- **Color Pool**: 6 intentionally proximate hue pairs (Teal, Pink, Amber, Violet, Cyan, Emerald)
- **Shuffle Algorithm**: Fisher-Yates (Knuth) $O(n)$
- **Theme**: Vercel, Figma, and Linear.app inspired dark dashboard
- **Typography**: `ui-monospace, Consolas, monospace` monospaced stack

### Color Reference

| Token | Hex | Usage |
|-------|-----|-------|
| App background | `#070a13` | Main canvas and body |
| Panel surface | `#111827` | Sidebar panels |
| Border | `#1f2937` | Panel dividers and outlines |
| Text primary | `#f8fafc` | Telemetry values |
| Text secondary | `#94a3b8` | Labels and metadata |
| Interactive | `#3b82f6` | Action button |
| Memorize | `#f59e0b` | Preview phase accent |
| Play | `#10b981` | Active phase accent |
| Mismatch | `#ef4444` | Error feedback |
