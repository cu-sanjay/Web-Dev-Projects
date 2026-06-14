# Coral Reef · Ecosystem Simulator

A premium marine biology virtual laboratory built with vanilla HTML, CSS, and JavaScript. Simulate coral reef dynamics with real-time Canvas rendering, thermal bleaching physics, herbivore grazing mechanics, and multi-agent autonomous fish behavior.

---

## Marine Ecosystem Model

The simulation models a shallow tropical reef with three interacting entity classes:

### Entity Classes

| Entity | Type | Behavior |
|---|---|---|
| **Coral Polyps** | Fixed structures | Stationary along reef floor; color shifts from vibrant pink/purple/orange through bleached white to dead gray based on thermal and pH stress |
| **Herbivorous Fish** | Autonomous agents | Boid-style steering toward random targets; graze on background algae; population controlled by density slider |
| **Algae** | Background matrix | Grows on dead coral skeletons and open substrate; suppressed by grazing fish; accelerates under warm temperatures |

### Bleaching Model

Coral bleaching follows an exponential stress function:

$$P_b = 1 - e^{-\lambda (T - T_{\text{opt}})}$$

Where:
- $P_b$ = bleaching probability (0–1)
- $\lambda = 0.15$ = stress coefficient
- $T$ = current sea surface temperature (°C)
- $T_{\text{opt}} = 27°C$ = optimal temperature threshold

Additional stressors:
- **pH acidification**: pH < 7.8 adds linear stress component
- **Temperature spike**: T > 32°C adds compounding stress

### State Transitions

```
Vibrant (health > 0.5)
    ↓  thermal/pH stress
Bleached (health ≤ 0.5, health > 0)
    ↓  prolonged stress
Dead (health ≤ 0) → Algae overgrowth
    ↑  temperature recovery + larvae seeding
Bleached → slow recovery to Vibrant
```

---

## Telemetry Metrics

| Metric | Calculation |
|---|---|
| **Calcification Rate** | (Healthy colonies / Total) × (1 − max(0, T − T_opt) × 0.03) × 100 |
| **Zooxanthellae Coverage** | (Healthy colonies / Total) × (1 − max(0, T − T_opt) × 0.04) × 100 |
| **Bleached Colony Ratio** | (Bleached colonies / Total) × 100 |
| **Dead Colony Ratio** | (Dead colonies / Total) × 100 |

### Reef Health Statuses

| Condition | Status Label |
|---|---|
| Calcification > 80% | PRISTINE SYMBIOSIS |
| Temp > 29°C or bleached > 15% | THERMAL STRESS FLAGGED |
| Bleached > 40% | BLEACHING CASCADE ACTIVE |
| Dead > 40% | REEF COLLAPSE EXHAUSTION |

---

## File Structure

```
├── index.html         Main application shell
├── style.css          Dark marine laboratory terminal theme
├── script.js          Ecosystem engine, canvas rendering, bleaching physics
├── README.md          This documentation
└── project.json       Project metadata
```

No dependencies. Open `index.html` in any browser.
