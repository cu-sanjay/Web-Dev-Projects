# DNA Sequence · Viewer

A genetic informatics terminal featuring real-time rotating double-helix Canvas rendering, color-coded oligonucleotide grid, base pair analysis (GC-content, nucleotide frequencies), mRNA transcription, and ORF boundary validation. Built with zero dependencies.

---

## Features

### Analysis Engine
- **Filtering**: Strips non-nucleotide characters, converts to uppercase on input
- **GC Content**: GC% = (G + C) / Total × 100
- **Nucleotide counts**: Individual A/T/C/G frequency counters

### Canvas Helix
- Dual anti-parallel sine-wave strands offset by π radians
- Rotating animation with configurable RPM (10–200)
- Base-pair bridging links with colored nucleotide nodes
- 5′/3′ direction labels

### Oligonucleotide Grid
- Color-coded base tiles (A = crimson, T = gold, C = emerald, G = cobalt)
- Scrollable grid showing up to 600 bases at once

### mRNA Transcription
- DNA → mRNA mapping: A→U, T→A, C→G, G→C

### ORF Validation
- Locates start codon ATG, scans for stop codons TAG/TAA/TGA
- Reports position and codon count

## Presets

| Preset | Length | Description |
|---|---|---|
| Human Insulin Exon | 339 bp | Insulin gene coding region |
| Bacteriophage Vector | 387 bp | Phage cloning vector segment |
| CRISPR Target Space | 423 bp | SpCas9 guide RNA target |

## Base Colors

| Base | Color | Code |
|---|---|---|
| A (Adenine) | Crimson | `#ff3366` |
| T (Thymine) | Gold | `#ffcc00` |
| C (Cytosine) | Emerald | `#33cc66` |
| G (Guanine) | Cobalt | `#3399ff` |

---

## File Structure

```
├── index.html         Layout — presets, sequence input + velocity slider, helix canvas + base grid, telemetry, footer
├── style.css          Dark bio-lab — glassmorphic panels, A/T/C/G neon base colors
├── script.js          Full engine — regex filter, GC/transcription/ORF logic, Canvas helix + grid renderer
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
