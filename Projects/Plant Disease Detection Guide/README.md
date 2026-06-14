# Plant Disease · Detection Guide

An expert systems diagnostic assistant for agricultural pathology. Select observable symptoms across leaf, stem, and root/fruit markers to identify plant diseases with confidence-rated matching and clinical treatment blueprints.

## Features

- **6-Disease Database**: Early Blight, Powdery Mildew, Black Rot, Root Rot Oomycete, Tobacco Mosaic Virus, Anthracnose
- **Symptom Selection Matrix**: 9 symptoms grouped by Leaf (4), Stem (3), and Root/Fruit (2) markers
- **Confidence Engine**: Intersection scoring — Confidence % = (matching symptoms / total disease symptoms) × 100, results sorted by confidence
- **Clinical Action Blueprint**: Pathogen name, confidence gauge ring, organic treatment checklist, chemical prevention list, quarantine severity badge (LOW / MODERATE / SEVERE)
- **Tomato Blight Preset**: One-click pre-selection of Early Blight symptom vector
- **Zero-Refresh Purge**: Clears all checkboxes, resets results and clinical panels

## Disease Profiles

| Disease | Pathogen | Key Symptoms | Quarantine |
|---|---|---|---|
| Early Blight | *Alternaria solani* | Dark Spots, Wilting, Cankers | MODERATE |
| Powdery Mildew | *Erysiphe cichoracearum* | White Spots, Stunted Stems | LOW |
| Black Rot | *Xanthomonas campestris* | Spots, Cankers, Fruit Rot, Ooze | SEVERE |
| Root Rot | *Phytophthora infestans* | Root Rot, Wilting, Stunting | MODERATE |
| Tobacco Mosaic | *Tobamovirus* | Mottle, Wilting, Stunting | SEVERE |
| Anthracnose | *Colletotrichum gloeosporioides* | Spots, Fruit Rot, Wilting | MODERATE |

## Tech Stack

- HTML5 + CSS3 (glassmorphism, custom checkboxes, CSS grid)
- Vanilla JavaScript (ES6+, expert system logic, intersection algorithm)
- Google Fonts (Inter, JetBrains Mono, Orbitron)

## How to Use

1. Open `index.html` in any modern browser
2. Check symptom boxes matching the observed plant damage
3. Results appear in real-time sorted by confidence
4. Click a disease result to view its clinical action blueprint
5. Click **Pre-Select Tomato Blight Preset** for a demo
6. Click **Purge Diagnostic Query Canvas** to reset

## License

MIT
