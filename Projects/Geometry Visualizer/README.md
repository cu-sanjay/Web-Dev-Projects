# Geometry · Visualizer

A spatial drafting and CAD-style geometry terminal featuring 5 shape modes, context-aware parameter sliders, real-time Canvas vector plotting with coordinate grid backdrop, 3D isometric wireframe projection, and formula blueprint display. Built with zero dependencies.

---

## Shape Modes

| Shape | Parameters | Outputs |
|---|---|---|
| **Circle** | Radius | Circumference, Area (Planar) |
| **Rectangle** | Width, Height | Perimeter, Area (Planar) |
| **Right Triangle** | Base, Height (+ hypotenuse) | Perimeter, Area (Planar) |
| **Sphere** | Radius | Circumference, Surface Area, Volume |
| **Cylinder** | Radius, Height | Circumference, Surface Area, Volume |

## Formulas

| Shape | Key Equations |
|---|---|
| Circle | C = 2πr, A = πr² |
| Rectangle | P = 2(w + h), A = w × h |
| Right Triangle | c² = a² + b², A = ½bh |
| Sphere | SA = 4πr², V = ⁴⁄₃πr³ |
| Cylinder | SA = 2πr² + 2πrh, V = πr²h |

## Controls

| Action | Function |
|---|---|
| Execute Vector Run | Recomputes geometry and redraws canvas |
| Deploy 3D Projection | Toggles isometric wireframe overlay on Sphere / Cylinder |
| Flush Drafting Canvas | Resets to Circle, clears all telemetry and vectors |

## Canvas Features

- 30px coordinate grid with centering axes
- Real-time vector plotting with dimension callouts
- 3D isometric lines (ellipse-based wireframes) for Sphere and Cylinder
- Color-coded: cyan for planar shapes, amber for 3D solids

---

## File Structure

```
├── index.html         Layout — shape selector, sliders, canvas + formula panel, telemetry, action footer
├── style.css          Dark CAD lab — glassmorphic panels, cyan planar / amber 3D neon states
├── script.js          Full engine — shape dictionary, slider builder, Canvas grid + shape renderer
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
