# Chemical Reaction Simulator

An interactive, high-fidelity physical chemistry laboratory simulator. It models chemical kinetics, collision theory, and thermodynamics in real time, featuring a custom particle-physics beaker canvas, reaction balance checkers, dynamic concentration graphs, and thermodynamic profile boards.

---

## Features

### 1. Interactive Collision Beaker (Physics Canvas)
- Simulates reactant atoms/molecules as 2D bouncing particles inside a glass beaker, resolving elastic collisions.
- **Kinetics reactions**: Reactions occur when reactants collide with sufficient **kinetic energy** (controlled by temperature) and proper alignment.
- Visual effects:
  - **Bubbling**: Oxygen/Hydrogen gas release creates rising bubble particles.
  - **Precipitation**: Insoluble salts form solid particles that drift downwards and rest at the bottom.
  - **Color transitions**: Solutions shift colors during neutralizations (pH indicators) or metal displacements.
  - **Thermal glows**: Glowing beaker outline indicating heat generation (Exothermic) or heat absorption (Endothermic).

### 2. Kinetics & Thermodynamics Controls
- **Arrhenius Reaction Rates**: Particle collision frequency and success rates are governed by:
  - **Temperature**: Higher temperatures increase particle velocities, collision counts, and the probability of crossing the activation energy threshold.
  - **Concentration**: Adjust reactant concentrations to alter the frequency of molecular collisions.
  - **Catalyst**: Lowers the reaction's Activation Energy ($E_a$), dramatically accelerating reactant conversion.
  - **Surface Area**: Controls the availability of solid reactants (like Zinc or Iron dust vs blocks).

### 3. Live Concentration Charting & Energy Curves
- **Concentration Curve**: Renders real-time trends for Reactant vs. Product levels over time.
- **Energy Profile Diagram**: Visualizes the potential energy curve of the reaction, plotting:
  - Reactants energy state
  - Transition state peak (Activation Energy $E_a$)
  - Products energy state ($\Delta H$)
  - Shows the catalyzed reaction pathway overlay when a catalyst is active.

### 4. Hazard & Safety Indicators (NFPA 704 Diamond)
- Displays safety data for each reactant and product:
  - **Health** (Blue): Level of toxicity.
  - **Flammability** (Red): Combustion hazard.
  - **Instability** (Yellow): Reactivity hazard.
  - **Special** (White): Specific hazards (Oxidizer, Corrosive, etc.).

---

## Preset Reactions Catalog

| Reaction Type | Equation | Visual Behaviors | NFPA Hazard Levels |
|---|---|---|---|
| **Acid-Base Neutralization** | $HCl + NaOH \rightarrow NaCl + H_2O$ | pH indicator color shift (Bright Red $\rightarrow$ Dark Pink $\rightarrow$ Emerald/Neutral Green) | **HCl**: Health 3, Reactivity 1<br>**NaOH**: Health 3, Reactivity 1 |
| **Synthesis / Combustion** | $2H_2 + O_2 \rightarrow 2H_2O$ | High-energy collision sparks, gas bubble explosions | **H2**: Flammability 4, Reactivity 0 |
| **Single Displacement** | $Fe + CuSO_4 \rightarrow FeSO_4 + Cu(s)$ | Copper solution fades from blue to green; copper precipitate forms | **CuSO4**: Health 2, Special: Tox |
| **Decomposition** | $2H_2O_2 \rightarrow 2H_2O + O_2(g)$ | Gas bubbles form, accelerated by Catalyst | **H2O2**: Health 2, Flammability 0 |
| **Double Displacement** | $AgNO_3 + NaCl \rightarrow AgCl(s) + NaNO_3$ | White solid precipitate forms instantly, falls to bottom | **AgNO3**: Health 3, Special: OX |

---

## File Structure
```
Chemical Reaction Simulator/
├── index.html        # Dashboard layout with canvas container and stat readouts
├── style.css         # Sleek modern glassmorphic terminal styles
├── script.js         # Beaker physics simulator, Arrhenius kinetics, charts, and equations
├── README.md         # Documentation
├── project.json      # Metadata configuration
└── thumbnail.svg     # Modern vector graphic of the simulator beaker
```
