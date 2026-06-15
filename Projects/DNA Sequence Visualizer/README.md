# DNA Sequence Visualizer

An advanced bio-informatics playground and interactive DNA terminal. It features a real-time, custom 3D-perspective Canvas-rendered DNA double-helix, dynamic mRNA transcription, multi-frame codon-to-amino-acid translation, a point/insertion/deletion mutation sandbox, restriction site digestion mapping, and detailed molecular telemetry.

---

## Features

### 1. Interactive 3D Double-Helix Canvas
- Renders the classical Watson-Crick DNA double-helix using interactive 2D canvas mapping.
- Simulates 3D depth by translating coordinates along the Z-axis, adjusting node radius, base connector line thickness, and alpha values accordingly.
- Double-helix customizable properties: Rotation speed (RPM), zoom level, strand spacing, and wave amplitude.
- Interactive node detection: Hovering over nucleotide nodes displays its base and exact index.

### 2. Live Sequence Explorer & Mutation Sandbox
- Displays a graphical map of the sequence grouped into codons (triplets) for easy scanning.
- Click any nucleotide to open the **Mutation Sandbox**:
  - **Substitution**: Change a base to any other nucleotide (A, T, C, G).
  - **Deletion**: Delete the base, triggering a frame-shift mutation.
  - **Insertion**: Insert a base before/after, recalculating the down-stream translation frame.
- Immediate visual highlights for codon alterations and frame-shifts.

### 3. Transcription & Translation Engine
- **Transcription**: Transcribes the template/coding strand into a 5′ → 3′ mRNA strand (substituting Thymine `T` for Uracil `U`).
- **Translation**: Translates the sequence into amino acids using the standard genetic code.
- **Reading Frames**: Support for scanning frames (+1, +2, +3).
- Amino acids are color-coded based on chemical properties (hydrophobic, polar, acidic, basic, stop).

### 4. Telemetry & Analytics Dashboard
- **GC/AT Content**: Calculates the total GC percentage, vital for assessing DNA stability.
- **Melting Temperature ($T_m$)**:
  - For short sequences (< 14 bp): Wallace Formula: $T_m = 2(A+T) + 4(G+C)$ °C
  - For longer sequences: Salt-adjusted formula: $T_m = 64.9 + 41(G+C-16.4)/(A+T+G+C)$ °C
- **Molecular Weight**: Computes the molecular weight of the single strand (~330 g/mol per nucleotide) and double strand (~660 g/mol per base pair).
- **Base Distribution Chart**: Interactive SVG charts visualizing the proportions of Adenine, Thymine, Cytosine, and Guanine.

### 5. Restriction Enzyme Digest Mapper
- Scans DNA for standard restriction endonuclease target sites:
  - **EcoRI**: `GAATTC`
  - **HindIII**: `AAGCTT`
  - **BamHI**: `GGATCC`
  - **AluI**: `AGCT`
  - **HhaI**: `GCGC`
- Renders a linear mapping of the sequence indicating cut locations and lengths of the resulting digestion fragments.

---

## Preset Sequences
- **GFP Gene Excerpt**: Coding segment of Green Fluorescent Protein.
- **SARS-CoV-2 Spike Segment**: Genomic fragment encoding the spike protein receptor-binding domain.
- **Hemoglobin Beta (HBB)**: Gene encoding human beta-globin, including the sickle-cell mutation hotspot.

---

## File Structure
```
DNA Sequence Visualizer/
├── index.html        # Futuristic dashboard layout with glassmorphic cards and canvas
├── style.css         # Sleek bio-tech dark-theme CSS with neon color variables
├── script.js         # Biochemical logic, Canvas Z-depth calculation, and state management
├── README.md         # Documentation
├── project.json      # Metadata configuration
└── thumbnail.svg     # Modern vector graphic showing the visualizer theme
```
