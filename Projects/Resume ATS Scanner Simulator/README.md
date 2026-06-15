# Resume ATS Scanner Simulator

A browser-based Applicant Tracking System (ATS) compatibility simulator that analyzes resumes against job descriptions, calculates match scores, identifies missing keywords, and provides actionable optimization suggestions — all running entirely client-side.

---

## Features

- **ATS Compatibility Score** — 0–100 composite score based on keyword match, section completeness, format quality, and experience relevance
- **Keyword Analysis** — Extracts meaningful keywords from job descriptions and matches them against resume content with weighted importance
- **Missing Keyword Detection** — Identifies critical gaps in resume terminology ranked by ATS weight
- **Resume Section Detection** — Automatically detects 8 standard resume sections (Summary, Experience, Education, Skills, Projects, Certifications, Languages, Publications)
- **Format Quality Check** — Evaluates contact info presence, bullet point usage, length appropriateness, and structural quality
- **Experience Relevance Scoring** — Compares years of experience, seniority level, and action verb usage against job requirements
- **Optimization Suggestions** — Actionable recommendations prioritized by criticality (critical, warning, improvement, positive)
- **Sample Data** — Pre-loaded sample resume and job description for demonstration
- **No Dependencies** — Pure HTML, CSS, and JavaScript with zero external libraries or build tools

---

## How ATS Scoring Works

### Score Components

| Component | Weight | Description |
|-----------|--------|-------------|
| Keyword Match | 40% | Percentage of weighted job description keywords found in resume |
| Section Completeness | 20% | Ratio of detected standard resume sections to total expected sections |
| Format Quality | 20% | Contact info presence, bullet points, length, structural quality |
| Experience Relevance | 20% | Years match, seniority alignment, action verb usage |

### Overall ATS Score

```
ATS Score = (KeywordMatch × 0.40) + (SectionScore × 0.20) + (FormatScore × 0.20) + (ExperienceScore × 0.20)
```

### Score Categories

| Score | Rating |
|-------|--------|
| 80–100 | Excellent — well-optimized for ATS |
| 60–79 | Good — minor improvements recommended |
| 40–59 | Below Average — targeted optimization needed |
| Below 40 | Critical — significant restructuring required |

---

## Keyword Analysis Methodology

1. **Extraction** — Tokenize job description, filter stop words, identify single-word and multi-word technical terms
2. **Weighting** — Apply importance multipliers (1×, 1.5×, 2×) based on keyword relevance to senior technical roles
3. **Matching** — Check each weighted keyword against the full resume text (case-insensitive)
4. **Scoring** — Calculate weighted match percentage: matched weight / total weight × 100

---

## Resume Section Detection

The scanner detects these standard resume sections using header pattern matching:

| Section | Common Headers |
|---------|---------------|
| Professional Summary | Summary, Profile, About Me, Objective |
| Work Experience | Experience, Employment, Work History |
| Education | Education, Academic, Degree, University |
| Skills | Skills, Technologies, Competencies, Expertise |
| Projects | Projects, Portfolio |
| Certifications | Certifications, Licenses |
| Languages | Languages |
| Publications | Publications, Research |

---

## Local Deployment

```bash
git clone <repository-url>
cd "Resume ATS Scanner Simulator"
start index.html
```

No build tools or server required. Open `index.html` directly in any modern browser.

---

## Project Structure

```
Resume ATS Scanner Simulator/
  index.html        Application layout and structure
  style.css         Visual design system
  script.js         ATS scanning engine and UI
  README.md         Documentation
  project.json      Project metadata
  thumbnail.svg     Project thumbnail
```

---

## Author

**Shruti Narsulwar** — [@Shrutiii01](https://github.com/Shrutiii01)
