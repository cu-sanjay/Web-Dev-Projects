# Binary Search Tree (BST) Playground

An interactive, high-fidelity web application to visualize and master **Binary Search Trees (BST)**. This educational tool makes it easy to understand standard and advanced tree operations, path search trajectories, tree properties, and balancing strategies.

## 🚀 Key Features

*   **Interactive Visual Node Operations**:
    *   **Insert Node**: Animate path highlights (going left or right based on value comparison) and watch the node fade and scale into place.
    *   **Delete Node**: Select from two deletion strategies: replacing the deleted node with its **Inorder Successor** or **Inorder Predecessor**. Watch nodes rearrange dynamically.
    *   **Find Node**: Trace a binary search path through the tree. High-priority elements will glow to indicate comparisons.
*   **Advanced BST Operations**:
    *   **Lowest Common Ancestor (LCA)**: Select any two nodes in the tree to highlight their respective paths from the root and visually discover their lowest common ancestor.
    *   **Tree Rotations (Left & Right)**: Click a node and perform left or right rotations on it. Understand how tree rotations change heights and structures — the core foundation of self-balancing trees like AVL and Red-Black Trees!
    *   **Tree Properties**: Displays live calculations for **Tree Height**, **Is Balanced?** (AVL balance check: height difference $\le$ 1 for all subtrees), **Node Count**, **Max Depth**, and **Leaf Count**.
*   **Synchronized Pseudocode & Step-by-Step logs**:
    *   Watch traversal algorithms (`Preorder`, `Inorder`, `Postorder`, and `Breadth-First Search`) run step-by-step.
    *   The **Pseudocode Tracker** panel highlights the exact line of code currently running.
    *   The **Execution Telemetry Log** details comparison checks, pointer adjustments, and search outcomes.
*   **Responsive SVG Canvas**:
    *   Interactive SVG canvas supporting smooth zoom, pan, and centering controls.
    *   Hover/Click on any node to view detailed telemetry: value, height, depth, balance factor, parent node, and child node references.
    *   Load preset structures instantly: Balanced, Left-Skewed, Right-Skewed, Random, or custom arrays.

## 🛠️ Technology Stack

*   **HTML5** for semantic document structures.
*   **CSS3** for glassmorphism panels, dark-theme palette variables, and responsive layout.
*   **Vanilla JS (ES6)** for layout nodes, BST operations, and SVG render triggers.
*   **Google Fonts** (Outfit, Fira Code) for polished typography.
*   No external visual dependencies or heavy frameworks!

## 📂 Project Structure

```text
Binary Search Tree Playground/
├── index.html        # Skeleton structure, panels, and SVG canvas container
├── style.css         # Styling system, responsive grid layouts, and active status states
├── script.js         # Operations, layout rules, and animation event timeline
├── project.json      # Workspace metadata and entry tags
├── README.md         # Documentation and guide
└── thumbnail.svg     # SVG representation of the playground
```

## 🎮 How to Use

1.  Open the `index.html` file in any modern web browser.
2.  Use the **Presets** dropdown to seed a simple balanced or random tree layout.
3.  Type a value into the **Add Node** input and watch the comparison trace step-by-step.
4.  Run any **Traversal** and adjust the playback speed using the slider.
5.  Double-click or click on any node to load its properties in the **Node Inspector**, or select a node to perform **Left/Right Rotations**.
