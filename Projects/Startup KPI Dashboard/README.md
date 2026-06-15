# Startup KPI Dashboard

An advanced, interactive SaaS metric center designed for startups to track and simulate key performance indicators (KPIs) like Monthly Recurring Revenue (MRR), Customer Acquisition Cost (CAC), Lifetime Value (LTV), Churn Rate, and CAC Payback periods.

## Core Features

- **Granular SaaS Inputs**: Customize current operational metrics:
  * **Current MRR ($)**: Starting baseline monthly recurring revenue.
  * **New MRR / Month ($)**: Average monthly revenue from new signups.
  * **Monthly Churn Rate (%)**: Slider to simulate percentage of customer cancellations.
  * **CAC ($)**: Marketing and sales cost to acquire a single customer.
  * **ARPA ($/mo)**: Average Revenue Per Account (monthly contract size).
- **Core SaaS Metrics Calculator**: Real-time evaluation of:
  * **LTV (Customer Lifetime Value)**: computed as `ARPA / Churn Rate`.
  * **LTV : CAC Ratio**: computed as `LTV / CAC`. Indicates customer unit economics viability (Red < 1.5x, Amber 1.5x - 3.0x, Emerald > 3.0x).
  * **CAC Payback Period**: computed as `CAC / ARPA` (Months to recover customer acquisition costs).
  * **Net MRR Growth**: tracks growth accounting trends.
- **Dual-Axis Projection Chart**: A beautiful responsive SVG chart projecting MRR (growth line) and Customer Count (growth bars) over a 12-month timeline.
- **Monthly Ledgers**: Tabular view of detailed SaaS growth parameters.
- **Scenario Vault**: Save and compare models (e.g. "Conservative Target", "Base Growth", "High-Scale Performance") in `localStorage`.

## Run it

Open `index.html` in any modern web browser.

## Technical Details

- **HTML5 & CSS3**: Responsive 3-column dashboard, range sliders styling, glassmorphism templates, and CSS gradients.
- **Vanilla JavaScript**: SaaS formulas engine, dynamic SVG pathing (coordinate projection mapping for line curves and bar rect elements), tooltip tracking, and local storage sync.
- **Storage**: JSON models mapped and loaded from `localStorage`.
