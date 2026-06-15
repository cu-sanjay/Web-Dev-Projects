# Food Chain Visualizer

An interactive ecological laboratory visualizer. It models energy flow, trophic interactions, bio-accumulation, and system stability within biotope networks. Features include force-directed food web layout springs, biomagnification toxin loaders, Lindeman's energy pyramids, and cascade disturbance managers.

---

## Features

### 1. Interactive Force-Directed Food Web (Physics Canvas)
- Maps species relationships inside a physics-based graph:
  - **Repulsion Forces**: Nodes repel one another to avoid overlaps.
  - **Spring-Link Attraction**: Energy paths pull predator and prey nodes into natural spatial clusters.
  - **Boundary Constraints**: Contains all elements within the canvas viewport.
- **Trophic sorting**: Toggle between dynamic force-directed layouts and horizontal/vertical trophic alignment (sorting species strictly by Trophic Level 1, 2, 3, or 4).
- **Interactive Highlighting**: Hover over a species to isolate its direct food pathways (eats and eaten-by lines glow).

### 2. Biomagnification Simulator (Bio-Accumulation)
- Models how fat-soluble chemicals (DDT, Mercury, Microplastics) accumulate at higher rates up the food chain.
- Inject toxins at a base concentration. As energy transfers up, the toxin concentration in parts-per-million (ppm) multiplies by **10x** at each trophic level.
- High-concentration toxicity displays as a glowing neon hazard overlay on the node. Breaking critical thresholds causes species warning alerts.

### 3. Trophic Cascades & Disruptions
- Simulates how adjusting a single population triggers massive ecosystem cascades:
  - **Top-Down Control**: Removing apex predators (e.g. Wolves, Sharks) causes deer or small fish to overpopulate, leading to overgrazing and deforestation.
  - **Bottom-Up Control**: Eliminating producers (e.g. Algae, Grass) starves primary consumers, triggering total collapse of predators.
- Displays state indicators on nodes: "Overpopulated", "Extinct", "Starving", or "Healthy".

### 4. Lindeman's 10% Energy Pyramid
- Renders a responsive trophic pyramid demonstrating Lindeman's Thermodynamic Rule:
  - Only **10%** of available energy is transferred to the next level.
  - **90%** of energy is lost as heat through respiration, excretion, and metabolic entropy.
- Select nodes to view exact calorie/joule counts and heat losses at that stage.

---

## Ecosystem Biotopes Presets

- **Deciduous Forest Web**:
  - Trophic 1: Grass, Oak Tree, Berries
  - Trophic 2: Cricket, Rabbit, Deer
  - Trophic 3: Frog, Snake, Robin
  - Trophic 4: Hawk, Wolf
- **Pelagic Marine Web**:
  - Trophic 1: Phytoplankton, Kelp
  - Trophic 2: Zooplankton, Krill, Sea Urchin
  - Trophic 3: Anchovy, Sea Otter, Crab
  - Trophic 4: Tuna, Shark
- **African Grassland Web**:
  - Trophic 1: Acacia, Grass
  - Trophic 2: Termite, Zebra, Gazelle
  - Trophic 3: Baboon, Cheetah, Hyena
  - Trophic 4: Lion

---

## File Structure
```
Food Chain Visualizer/
├── index.html        # Dashboard grid with canvas views and energy stats
├── style.css         # Modern dark glassmorphic stylesheet
├── script.js         # Force physics, biomagnification calculations, and charts
├── README.md         # Documentation
├── project.json      # Metadata configuration
└── thumbnail.svg     # Modern vector graphic of the food web
```
