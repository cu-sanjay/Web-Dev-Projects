>[!WARNING]
> You should not edit the main `projects.json` file manually. Simply submit your project folder with its own `project.json` file included. The project index is generated automatically.
Please avoid making any changes outside your project's folder.

<div align="center">

<img src="assets/icons/logo.svg" alt="Web Dev Projects" width="110" />

# Web Dev Projects

**A curated, beginner-friendly hub for HTML, CSS & JavaScript projects.**
Learn Git, GitHub and open source by shipping real work — and get recognised in
NSoC '26, GSSoC, GSoC and Hacktoberfest along the way.

<br />

![Maintained](https://img.shields.io/badge/Maintained-Yes-1f6f3a?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-1f6f3a?style=for-the-badge)
![Beginner Friendly](https://img.shields.io/badge/Beginner-Friendly-c97a2b?style=for-the-badge)
![Made with HTML CSS JS](https://img.shields.io/badge/Made_with-HTML_·_CSS_·_JS-1c1c1e?style=for-the-badge)

![NSoC 2026](https://img.shields.io/badge/NSoC-2026-1c1c1e?style=flat-square)
![GSSoC](https://img.shields.io/badge/GirlScript_Summer_of_Code-Ready-c97a2b?style=flat-square)
![GSoC](https://img.shields.io/badge/Google_Summer_of_Code-Ready-1f6f3a?style=flat-square)
![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-Ready-1c1c1e?style=flat-square)

[**Live Showcase**](https://cu-sanjay.github.io/Web-Dev-Projects/) ·
[**Contribute**](./CONTRIBUTING.md) ·
[**Code of Conduct**](./CODE_OF_CONDUCT.md) ·
[**Open an Issue**](../../issues/new/choose)

</div>

## What is this?

`Web-Dev-Projects` is a community repository where developers — especially
first-time contributors — add their own **static web projects** built with
HTML, CSS and JavaScript. Every accepted project is automatically picked up
by a GitHub Action and rendered on the live showcase page.

The repo doubles as:

- A **practice ground** for learning Git, branches and pull requests.
- A **portfolio surface** — your folder, your README, your credit.
- A **launchpad** for open-source programs (NSoC, GSSoC, GSoC, Hacktoberfest).

## How it works

```text
Projects/
  Notes App/                  <-- your folder, Title Case with spaces
    README.md                 <-- required, describes the project
    project.json              <-- required, machine-readable metadata
    index.html                <-- entry point
    style.css
    script.js
```

1. Fork the repo and create a branch.
2. Add a new folder under `Projects/` named like **"To Do Web App"**
   (Title Case, real spaces — not `to-do`, not `to_do`).
3. Inside it, ship your code plus a `README.md` and a `project.json`.
4. Open a pull request. After review, the showcase page rebuilds automatically.

Full rules and the `project.json` schema live in
[CONTRIBUTING.md](./CONTRIBUTING.md). Read it before opening a PR — it keeps
the repo clean and your PR fast to merge.

## Example projects

Four reference projects ship with the repo so you can see the expected shape:

| Project | What it shows |
| --- | --- |
| [Notes App](./Projects/Notes%20App) | LocalStorage, live URL detection inside notes, tag filters |
| [Music Player](./Projects/Music%20Player) | iPhone-style player UI, album art cards, audio API |
| [2048 Game](./Projects/2048%20Game) | Keyboard + swipe input, grid logic, score persistence |
| [Daily Wheels](./Projects/Daily%20Wheels) | Spinning decision wheel, custom SVG graphics |

Open any of them, read the README, copy the structure.

## The showcase page
>[!IMPORTANT]
> The file `index.html` at the repo root is a fully responsive, classic UI that
lists every project under `Projects/`. It reads from `projects.json`, which is
regenerated on every push by
[`.github/workflows/index-projects.yml`](./.github/workflows/index-projects.yml).

>[!WARNING]
> You never edit `projects.json` by hand — just ship your folder and the index
takes care of itself.

The page is published with GitHub Pages from the `main` branch.

## Open-source programs this repo supports

- **NSoC 2026** — [Nexus Spring of Code](https://www.nsoc.in/)
- **GSSoC** — [GirlScript Summer of Code](https://gssoc.girlscript.org/)
- **GSoC** — [Google Summer of Code](https://summerofcode.withgoogle.com/)
- **Hacktoberfest** — [DigitalOcean & friends](https://hacktoberfest.com/)

Program-specific labels are added to issues during each event window.
Watch the repo to get notified.

## Repository documents

- [CONTRIBUTING.md](./CONTRIBUTING.md) — rules, naming, `project.json` schema
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) — Contributor Covenant v2.1
- [SECURITY.md](./SECURITY.md) — how to report a vulnerability
- [LICENSE](./LICENSE) — MIT

## Maintainer

Maintained by [@cu-sanjay](https://github.com/cu-sanjay). Star the repo if it
helps you learn — it genuinely keeps the project moving.
