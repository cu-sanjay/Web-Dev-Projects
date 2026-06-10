<div align="center">

<img src="assets/GH_Header.png" alt="OpenStudio — Build in public. Grow through open source." width="100%" />

<br/><br/>

# OpenStudio

### Build in public. Grow through open source.

**A curated collection of beginner-friendly HTML, CSS and JavaScript projects — built by the community, for the community.**

Ship real projects, sharpen your craft, and earn recognition through **Hacktoberfest 2026**, **GSSoC**, **GSoC**, and beyond.

<br>

![Maintained](https://img.shields.io/badge/Maintained-Yes-1f6f3a?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-1f6f3a?style=for-the-badge)
![Beginner Friendly](https://img.shields.io/badge/Beginner-Friendly-c97a2b?style=for-the-badge)
![Made with HTML CSS JS](https://img.shields.io/badge/Made_with-HTML_·_CSS_·_JS-1c1c1e?style=for-the-badge)

<br>

![NSoC 2026](https://img.shields.io/badge/NSoC-2026-1c1c1e?style=flat-square)
![GSSoC](https://img.shields.io/badge/GirlScript_Summer_of_Code-Ready-c97a2b?style=flat-square)
![GSoC](https://img.shields.io/badge/Google_Summer_of_Code-Ready-1f6f3a?style=flat-square)
![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-Ready-1c1c1e?style=flat-square)

<br><br>

<a href="https://cu-sanjay.github.io/Web-Dev-Projects/">🌐 Live Showcase</a>
&nbsp;•&nbsp;
<a href="./CONTRIBUTING.md">🤝 Contribute</a>
&nbsp;•&nbsp;
<a href="./CODE_OF_CONDUCT.md">📜 Code of Conduct</a>
&nbsp;•&nbsp;
<a href="../../issues/new/choose">🐛 Open an Issue</a>

</div>

## 🚀 What Is This?

**Web Dev Projects** is a community-driven repository where developers, especially first-time contributors, can submit their own **static web projects** built using **HTML, CSS and JavaScript**.

Every accepted project is automatically discovered by GitHub Actions and showcased on the live website.

This repository serves as:

- **A practice ground** for Git, GitHub, branching and pull requests.
- **A portfolio platform** where every contributor gets visible credit.
- **A launchpad** for open-source programs such as NSoC, GSSoC, GSoC and Hacktoberfest.

## ⚙️ How It Works

```text
Projects/
  Notes App/
    README.md
    project.json
    index.html
    style.css
    script.js
```

### Submission Flow

1. Fork the repository and create a new branch.
2. Add a folder inside **Projects/** using **Title Case with spaces**.
3. Include your project files along with:
   - **README.md**
   - **project.json**
4. Open a Pull Request.
5. After approval, the showcase updates automatically.

### Folder Naming Example

✅ To Do Web App

❌ to-do-web-app

❌ to_do_web_app

❌ todowebapp

Full contribution rules and the **project.json schema** are available in **CONTRIBUTING.md**.

Reading it before opening a PR helps keep reviews fast and the repository clean.

## 📄 project.json Template

Every project must include a **project.json** file inside its project folder.

Use the template below and update the values according to your project:

```json
{
  "title": "2048 Game",
  "description": "The classic 2048 puzzle with keyboard and swipe input, smooth tile transitions and best-score persistence.",
  "author": {
    "name": "Your Name",
    "github": "github-username"
  },
  "tags": [
    "game",
    "canvas-free",
    "vanilla-js"
  ],
  "entry": "index.html",
  "thumbnail": "thumbnail.svg"
}
```

### Field Reference

| Field | Required | Description |
|---------|----------|-------------|
| title | ✅ | Name of your project |
| description | ✅ | Short summary shown on the showcase page |
| author.name | ✅ | Your display name |
| author.github | ✅ | Your GitHub username only |
| tags | ✅ | Relevant keywords describing your project |
| entry | ✅ | Main HTML file, usually `index.html` |
| thumbnail | ✅ | Preview image shown on the showcase |

### Before Opening a Pull Request

- Ensure all fields are filled correctly.
- Verify that **entry** points to an existing file.
- Verify that **thumbnail** exists inside your project folder.
- Keep descriptions concise and meaningful.
- Use relevant tags so users can discover your project easily.

> [!TIP]
> The easiest approach is to copy the **project.json** from any existing project, update the values, and place it inside your own project folder.

## 📦 Example Projects

These projects are included as references so you can understand the expected structure and quality.

| Project | Highlights |
|----------|------------|
| [Notes App](./Projects/Notes%20App) | LocalStorage, URL detection, tag filtering |
| [Music Player](./Projects/Music%20Player) | iPhone-inspired UI, album artwork, Audio API |
| [2048 Game](./Projects/2048%20Game) | Keyboard controls, swipe gestures, score saving |
| [Daily Wheels](./Projects/Daily%20Wheels) | Decision wheel, custom SVG graphics |

Explore any of them, read the README and follow the structure.

## 🌐 Showcase Website

> [!IMPORTANT]
> The root **index.html** powers the live showcase website.
>
> Every project inside **Projects/** is automatically indexed through **projects.json**, which is regenerated on every push using:
>
> **.github/workflows/index-projects.yml**

> [!WARNING]
> Never edit **projects.json** manually.
>
> Add your project folder and let the automation handle everything else.

The showcase is deployed using **GitHub Pages** directly from the **main** branch.

## 🏆 Open Source Programs Supported

- **NSoC 2026** → https://www.nsoc.in/
- **GSSoC** → https://gssoc.girlscript.org/
- **GSoC** → https://summerofcode.withgoogle.com/
- **Hacktoberfest** → https://hacktoberfest.com/

Special labels are added during active program periods.

⭐ Watch the repository to stay updated.

## 📚 Repository Documents

| Document | Purpose |
|-----------|----------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution rules and project.json schema |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Community guidelines |
| [SECURITY.md](./SECURITY.md) | Vulnerability reporting |
| [LICENSE](./LICENSE) | MIT License |

## 👨‍💻 Maintainer

Maintained by **[@cu-sanjay](https://github.com/cu-sanjay)**

If this repository helps you learn, contribute or prepare for open source programs, consider giving it a ⭐.

It genuinely helps the project grow.

<div align="center">

# 🏛️ Hall Of Fame

### Every Avatar Below Represents Code That Made This Repository Better

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=130&color=0:0f172a,100:1e293b&section=header&text=Contributors&fontColor=ffffff&fontSize=42"/>

<br>

<a href="https://github.com/cu-sanjay/Web-Dev-Projects/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=cu-sanjay/Web-Dev-Projects&max=500" />
</a>

<br><br>

### ⭐ Builders • Creators • Fixers • Contributors ⭐

Every merged contribution earns a permanent place in this wall.

Thank you for helping future developers learn, build and grow through open source.

<br>

</div>
