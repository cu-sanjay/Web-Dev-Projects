# Food · Nutrition Dashboard

A dietetic informatics terminal featuring a food database with Atwater caloric calculations, interactive meal ledger with delete controls, animated Canvas macronutrient bar chart, dietetic classification engine, and caloric surplus injection. Built with zero dependencies.

---

## Food Database (per 100g)

| Item | Protein | Carbs | Fats | Energy |
|---|---|---|---|---|
| Grilled Chicken | 31g | 0g | 3.6g | 156 kcal |
| Brown Rice | 2.6g | 23g | 0.9g | 109 kcal |
| Avocado | 2g | 8.5g | 15g | 167 kcal |
| Egg Whites | 10.9g | 0.7g | 0.2g | 48 kcal |
| Olive Oil | 0g | 0g | 100g | 900 kcal |

## Atwater Equation

$$E = 4 \times \text{Protein} + 4 \times \text{Carbs} + 9 \times \text{Fats}$$

## Presets

| Meal | Items | Total kcal |
|---|---|---|
| Ketogenic Breakfast | Egg Whites 150g + Avocado 100g + Olive Oil 20g | ~540 kcal |
| High-Protein Mass Gainer | Chicken 250g + Rice 200g + Egg Whites 100g | ~1000 kcal |
| Balanced Mediterranean | Chicken 150g + Rice 150g + Avocado 80g + Olive Oil 15g | ~840 kcal |

## Classification Engine

| Dominant Macro | Badge |
|---|---|
| Protein | `[HIGH-PROTEIN ANABOLIC RECOVERY PROFILE]` |
| Carbs | `[CARBOHYDRATE GLYCOGEN OVER-SURGE PINPOINTED]` |
| Fats | `[LIPID-DOMINANT KETOGENIC STATE]` |
| Balanced | `[BALANCED DIETETIC PROFILE]` |

## Canvas Features

- Horizontal stacked bar chart for P/C/F with gradient fills and rounded corners
- Grid with numeric axis labels
- Live-updating with smooth animation

---

## File Structure

```
├── index.html         Layout — presets, food selector + portion slider, meal ledger table, macro canvas, telemetry
├── style.css          Dark dietetics lab — glassmorphic panels, P=#ff3366 C=#ffcc00 F=#3399ff macro colors
├── script.js          Full engine — food database, Atwater equation, ledger CRUD, Canvas bar chart, classification
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
