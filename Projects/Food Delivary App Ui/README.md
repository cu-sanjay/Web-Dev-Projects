# Zaffron // Premium Food Delivery & Exploration Platform

Zaffron is a high-fidelity frontend restaurant exploration and delivery interface designed around the modular layouts, chip filtering architectures, and menu customization mechanisms found in modern food apps like Zomato. Built on 100% dependency-free vanilla paradigms, it runs entirely client-side.

---

## Technical Features & Implementation Specifications

### 1. Dual-Scroll Container Matrix (`style.css`)

- **3-Column Workspace Constrainment Layout:** Lock application metrics onto a rigid dashboard workspace panel (`1280px` by `780px`) to prevent adaptive design drift across varying high-resolution desktop screen frames.
- **Jitter-Free In-basket Steppers:** Price calculations, item notifications, and inline quantity steppers deploy targeted font family cascades (`ui-monospace`, `Consolas`), ensuring smooth metric updates without text shifting.

### 2. Live Dynamic Order Engine Tracking (`script.js`)

- **Customization Drawer Logic:** Computes dynamic variant add-ons (such as _Enrichment Toppings_ or _Side Breads_) through isolated array structures, tracking real-time cost accumulations inside slide-out drawers before data migration passes.
- **Smart Array Consolidation Pass:** Checks active basket nodes on form submission. If matching ingredient profiles exist, it merges the counts; unique variation paths create independent checkout cards.
- **Interval Status Progress Simulator:** Placing an order starts a step-by-step progress loop that gives real-time visual feedback on delivery statuses, complete with shifting ETA labels.
