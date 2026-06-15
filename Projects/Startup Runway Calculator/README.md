# Startup Runway Calculator

An advanced financial modeling dashboard for startups to compute cash runway lengths, track operating expenses (OpEx) by category, adjust monthly revenue growth rates, simulate hiring/cost events, and compare planning scenarios.

## Core Features

- **Granular Operating Expenses Tracker**: Itemize cash outlays across key startup operational pools:
  * **Salaries & Payroll**: Core staff, contractors, benefits.
  * **Marketing & Acquisition**: Ads, events, agency costs.
  * **SaaS & Infrastructure**: Server hosting, software subscriptions.
  * **Office & Overhead**: Rent, utilities, logistics.
  * **Miscellaneous / Legal**: Fees, insurance, other administrative expenses.
- **Runway & Net Burn Forecast**: Instantly evaluates how many months of operational cash remain based on current balances, monthly revenue, and monthly growth rate.
- **Urgency Meter & Alive classification**:
  * Classified as **Default Alive** (profitable or growing to profitability before depletion) or **Default Dead**.
  * Dynamic visual status badges (Red for runway < 6 months, Amber for 6-12 months, Emerald for >12 months or Profitable).
- **Interactive SVG Chart**: Dynamic line chart rendering cash balance decline or upward trajectory over the next 12-24 months.
- **What-If Scenario Sandbox**: Quick adjustments for revenue growth rate inputs and immediate visualization of how scaling expenses affects cash lifecycle.
- **Scenario Vault**: Save multiple plan configurations (e.g. "Worst Case", "Moderate Base", "Aggressive Growth Plan") in `localStorage`.

## Run it

Open `index.html` in any modern web browser.

## Technical Details

- **HTML5 & CSS3**: Glassmorphic dashboard templates, neon status indicators, and responsive flexboxes.
- **Vanilla JavaScript**: Math systems calculating compound growth rates, zero cash dates, and generating dynamic coordinate matrices for responsive SVG chart lines.
- **Storage**: JSON models mapped and loaded from `localStorage`.
