# Startup Equity Simulator

An advanced financial modeling dashboard to simulate company capitalization tables (cap tables), model equity dilution through multiple funding rounds, configure option pools (ESOP), and simulate exit payouts and investor/founder ROI multiples.

## Core Features

- **Cap Table Modeling**: Itemize initial stakeholders (Founders, Co-founders, Angel Investors, early employees) with share counts and cash investments to compute initial ownership structures.
- **Funding Round Dilution Engine**: Add custom fundraising milestones:
  * Amount raised ($).
  * Post-money/Pre-money valuation ($).
  * ESOP Set-Aside % (Option Pool expansions, e.g. 10%).
  * Automatically handles proportion dilution of all existing shareholders.
- **Exit Scenario Simulator**: Slide target exits from $0 to $1B+ and instantly evaluate:
  * Total payout cash value per shareholder.
  * Return on Investment (ROI) multipliers (e.g. 5.2x).
  * Post-dilution final ownership percentages.
- **Dynamic Pie Chart Viz**: Segmented vector SVG charts rendering pre-financing vs post-financing cap distributions.
- **Scenario Vault**: Save and persist named configurations (e.g. "Founder-Controlled", "Venture Scale", "Flat Round") in `localStorage`.

## Run it

Open `index.html` in any modern web browser.

## Technical Details

- **HTML5 & CSS3**: Glassmorphic dashboard templates, interactive layouts, and color-coded status badges.
- **Vanilla JavaScript**: Math systems computing pre/post round shares expansion, option pools creation, exit distributions, and calculating SVG arc segment path nodes dynamically.
- **Storage**: JSON models mapped and loaded from `localStorage`.
