# Epidemiology Spread Simulator Pro

An advanced, offline-first epidemiology research dashboard integrating deterministic SEIRHDV compartmental models, a real-time agent-based particle physics sandbox, and dynamic Non-Pharmaceutical Interventions (NPI) timeline schedulers.

---

## Compartmental Modeling System (SEIRHDV)

This simulator implements an extended compartmental model ($SEIRHDV$) tracking the progression of an infectious pathogen through seven distinct health states:

- **Susceptible (S)**: Healthy individuals vulnerable to infection.
- **Exposed (E)**: Individuals infected but not yet infectious (incubation phase).
- **Infectious (I)**: Active transmitters shedding pathogens.
- **Hospitalized (H)**: Severe cases requiring medical isolation/care (critical capacity limited).
- **Recovered (R)**: Recovered individuals with temporary or permanent immunity.
- **Deceased (D)**: Cumulative fatalities resulting from disease complications.
- **Vaccinated (V)**: Individuals who acquired active immunity via immunization.

### Governing Differential Equations

$$\frac{dS}{dt} = -\frac{\beta(t) \cdot S \cdot I}{N} - \nu(t) \cdot S$$

$$\frac{dE}{dt} = \frac{\beta(t) \cdot S \cdot I}{N} - \sigma \cdot E$$

$$\frac{dI}{dt} = \sigma \cdot E - (\gamma + \eta) \cdot I$$

$$\frac{dH}{dt} = \eta \cdot I - (\mu(H) + \theta) \cdot H$$

$$\frac{dR}{dt} = \gamma \cdot I + \theta \cdot H$$

$$\frac{dD}{dt} = \mu(H) \cdot H$$

$$\frac{dV}{dt} = \nu(t) \cdot S$$

### Model Constants & Parameters

- $\beta(t)$: Time-varying transmission rate, adjusted dynamically by active NPIs (Mask Mandates, Lockdowns).
- $\sigma$: Rate of transition from Exposed to Infectious ($1/\text{Incubation Period}$).
- $\gamma$: Rate of recovery for mild infectious cases ($1/\text{Infectious Period}$).
- $\eta$: Hospitalization rate of active infected cases (percentage requiring clinical beds).
- $\theta$: Rate of recovery from hospital beds ($1/\text{Hospital Stay duration}$).
- $\mu(H)$: Death rate of hospitalized cases. If hospitalizations $H$ exceed the clinical bed capacity $H_{max}$, mortality multiplies:
  $$\mu(H) = \mu_{base} \times \left(1 + \kappa \cdot \max\left(0, \frac{H - H_{max}}{H_{max}}\right)\right)$$
- $\nu(t)$: Daily vaccination rate (percentage of susceptible population immunized per day).

---

## Agent-Based Physics Sandbox

Alongside the mathematical ODE model, the dashboard features a **stochastic 2D particle sandbox** to study spatial transmission dynamics:
1. **Collisions & Contact Transmission**: Particles move under continuous velocity vectors with randomized brownian drift. When an Infectious agent ($I$, red) steps into the transmission radius of a Susceptible agent ($S$, green), transmission occurs based on exposure probability per tick.
2. **Hospital Ward Isolation**: Hospitalized agents ($H$, cyan) are physically routed out of the main arena to the critical care ward where they remain static and cannot infect others.
3. **Quarantine Containment Box**: If the quarantine intervention is scheduled/toggled, testing captures infectious agents and isolates them in the secure containment box (zero contact rate).
4. **Vaccination Ring/Shields**: Immunized agents ($V$, purple/violet) display protective rings, forming a barrier to shield remaining susceptible clusters.

---

## Non-Pharmaceutical Interventions (NPI) Timeline

Users can dynamically toggle or schedule interventions at specific days:
- **Lockdown**: Reduces agent velocities by 90% and shrinks their interaction radius to simulate restricted social contact.
- **Mask Mandate**: Slashes pathogen transmission probability by 70% per contact.
- **Testing & Isolation**: Quarantines infectious agents into the containment ward after a short delay (simulating diagnostic time).
- **Mass Vaccination**: Runs a vaccine distribution campaign, immunizing susceptible individuals at the designated rate.

---

## Local Standalone Execution

1. Clone or download this project folder.
2. Double-click `index.html` to run the application in any modern web browser.
3. Completely offline-capable with custom HTML5 Canvas rendering—no external CDNs, JS charting packages, or server runtimes needed.
