# Git Commit Generator

An interactive, premium client-side utility (brand name **GitCommit**) designed to help developers write and manage clean Conventional Commits. It validates syntax rules in real time, generates copyable git terminal command strings, and features an interactive local Git history graph simulation.

## 🚀 Features

- **Conventional Commits Form**: Easily build commit messages with standardized selectors for commit types (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`), optional scopes, descriptions, breaking change flags, optional body paragraphs, and footer references.
- **Real-Time Rules Validator**: Checks messages instantly against git guidelines, monitoring subject line length (warning at 50 characters, error at 72 characters), ensuring lowercased descriptions, checking for trailing punctuation/periods, and verifying empty lines between headings and body content.
- **Copy Utilities**: Copy the raw commit message for manual use OR the ready-to-run terminal shell command (`git commit -m "..." -m "..."`) with a single click.
- **Interactive Local Git Graph**: Simulates a local repository graph history timeline. Clicking "Commit to History" generates a mock commit hash (7-char SHA), timestamps, and logs it onto a visual git branch tree visualization with color-coded nodes.
- **Premium Glassmorphic UI**: Beautiful developer-focused dashboard styling with high-contrast layout, progress meters, and dynamic CSS/SVG graphics.

## 📂 Project Structure

```
Git Commit Generator/
├── README.md         # Detailed user manual
├── project.json      # Workspace registry descriptor
├── index.html        # Main app UI structure
├── style.css         # UI aesthetics & responsive rules styling
├── script.js         # Commit compilers, validators, & timeline graph logic
└── thumbnail.svg     # Branding SVG graphic
```

## 🛠️ How to Run

1. Open `index.html` in a modern web browser.
2. Select or enter values in the builder form to construct your commit.
3. Review the **Commit Rules Validator** checklist for any warnings or errors.
4. Click **Copy Message** or **Copy Shell Command** to copy outputs.
5. Click **Commit to History** to add the drafted commit to the simulated Git Graph log timeline.
