# Population Growth Analyzer

An interactive, high-fidelity demographic laboratory simulator. It models age-structured cohort-component population projections (Leslie-style matrices), dynamic Age-Gender pyramids, the five stages of the Demographic Transition Model (DTM), dependency ratio shifts, and net migration vectors. 

---

## Features

### 1. Cohort-Component Projection Solver
- Segregates the population into 9 distinct 10-year cohorts (`0-9`, `10-19`, ..., `80+`) for both Males and Females.
- Models fertility across reproductive cohorts (`10-19` through `40-49`) and survival rates across all age brackets.
- Models net migration by adding or subtracting young adults dynamically.

### 2. Interactive Age-Gender Pyramid (Pyramid Viewport)
- Renders Males (cyan) on the left and Females (magenta) on the right.
- Displays transitions of population structures:
  - **Expansive (Niger/Stage 2)**: Wide base, high fertility, low median age.
  - **Stable (USA/Stage 4)**: Near-replacement fertility (~2.1), stable barrel shape.
  - **Constrictive (Japan/Stage 5)**: Sub-replacement fertility, narrow base, high median age (aging population crisis).
- Animates a **Baby Boom Bulge** showing demographic momentum as the birth spike ages over generations.

### 3. Demographic Transition Model (DTM Viewport)
- Plots Crude Birth Rate (CBR) and Crude Death Rate (CDR) curves.
- Dynamically moves a cursor across DTM Stages 1 to 5 to indicate the state of the active simulated population.

### 4. Interactive Charts & Telemetry
- Plots Total Population alongside Dependency Ratio (dependents vs working-class populations) up to 100 years into the future.
- Displays CBR, CDR, median age, annual growth rate, and dependency percentage.

---

## Run It

Open `index.html` in any modern browser. No build steps, servers, or packages required.

---

## Scientific Formulations Used

- **Cohort components aging (Leslie Matrix Equivalent)**:
  $$N_c(t + 10) = N_{c-1}(t) \cdot S_{c-1}$$
  Where $N_c$ is the population in cohort $c$, and $S_{c-1}$ is the survival rate of the previous cohort.
- **Births Component**:
  $$B(t + 10) = \sum_{c \in \text{childbearing}} N_{c, \text{Female}}(t) \cdot F_c$$
  Where $F_c$ is the age-specific fertility rate of cohort $c$.
- **Crude Birth Rate (CBR)**:
  $$\text{CBR} = \frac{\text{Births}}{\text{Total Population}} \cdot 1000$$
- **Crude Death Rate (CDR)**:
  $$\text{CDR} = \frac{\text{Deaths}}{\text{Total Population}} \cdot 1000$$
- **Dependency Ratio**:
  $$\text{Dependency Ratio} = \frac{N_{0-19} + N_{60+}}{N_{20-59}} \cdot 100$$
  *(Note: Brackets are scaled to represent children and retirees vs the active labor force).*
