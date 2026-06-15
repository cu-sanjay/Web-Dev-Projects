# JSON Schema Playground

An interactive sandbox for writing, validating, and exploring JSON Schemas, generating functional web forms, and browsing auto-generated documentation.

## Features

- **AJV Integration**: Utilizes Ajv (JSON Schema validator) from a CDN to enforce strict Draft-07 compliance.
- **Bi-Directional Binding**:
  - Edit the schema and test JSON data manually to check instant validation reports.
  - Or let the playground compile the schema into an interactive HTML form. Filling out the form compiles the JSON instance data in real time!
- **Schema Documentation**: Automatically generates properties documentation including types, descriptions, default values, and required constraints.
- **Validation Log**: Displays clean success banners or precise validation error trees complete with error paths and descriptive messages.
- **Presets & Templates**: Pre-loaded schema configurations (User profile, E-commerce inventory, advanced settings schemas).

## Directory Structure

```
JSON Schema Playground/
├── project.json       # Workspace metadata manifest
├── README.md          # User manual and configuration guide
├── index.html         # Workspace panels layout
├── style.css          # Premium glassmorphic interface styles
├── script.js          # Core compilation, forms and validation engine
└── thumbnail.svg      # Workspace branding graphic
```

## How to Use

1. **Load a Preset**: Choose a sample template from the dropdown menu to inspect its schema and structure.
2. **Schema Editor (Left)**: Modify the JSON Schema configuration. The app checks schema validation and live rebuilds the dynamic form and docs.
3. **Data Editor (Middle)**: Edit the JSON instance data directly, or use the interactive form on the right to input fields.
4. **Dynamic Form & Docs (Right)**:
   - Click the **Interactive Form** tab to use form inputs dynamically derived from the schema.
   - Click the **Schema Docs** tab to review property listings and descriptions.
   - Look at the **Validation Log** at the bottom right to verify validity and read logs.
