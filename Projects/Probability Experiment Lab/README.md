# Probability Experiment Lab

A stochastic simulation sandbox demonstrating the Law of Large Numbers through interactive Monte Carlo experiments. Three probability modes — Binomial Coin Flip (bias-adjustable), Discrete 6-Sided Dice Roll, and Random Card Suit Draw — with real-time Canvas frequency histograms, empirical convergence tracking, and deviation-from-theoretical telemetry.

---

## Features

### Simulation Engine
- **Coin Flip**: Bernoulli trials with adjustable bias (0–100% Heads)
- **Dice Roll**: Uniform discrete distribution (1–6, each 16.66%)
- **Card Suit Draw**: Balanced 4-state matrix (Hearts/Diamonds/Clubs/Spades, each 25%)

### Canvas Histogram
- Dynamic frequency bars with smooth height transitions
- Neon dashed theoretical target overlay
- Emerald glow when experimental frequencies converge within 3% of target

### Control Deck
- Batch volume selector: 1 / 10 / 100 / 1000 trials
- Bias/Variance slider for coin flip mode
- Theoretical target display updates in real time

### Monte Carlo Sweep
- Executes 10,000 trials in chunked `requestAnimationFrame` batches
- Streams chart updates and telemetry without browser lockup

### Statistical Telemetry
- Cumulative trials counter
- Deviation delta variance from theoretical expected yields
- Law of Large Numbers convergence badge (STANDBY → APPROACHING → LLN STABLE)
- Per-outcome empirical breakdown

## Controls

| Action | Function |
|---|---|
| Mode Ribbon | Switch between Coin / Dice / Card |
| Batch Buttons | Select trial count per execution |
| Execute Stochastic Sample Loop | Run one batch |
| Run 10K Monte Carlo Sweep | Stream 10,000 trials non-blocking |
| Purge Experimental Cache | Clear all data and reset charts |

---

## File Structure

```
├── index.html        Layout — mode ribbon, control deck, canvas, ledger, telemetry, admin footer
├── style.css         Dark terminal lab — glassmorphic panels, neon cyan/yellow/emerald states
├── script.js         Engine — RNG, outcome matrices, Canvas histogram, chunked MC sweep, telemetry
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
