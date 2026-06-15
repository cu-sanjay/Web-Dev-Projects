# AI Resume Analyzer & Skill Gap Tracker

An interactive, premium client-side ATS (Applicant Tracking System) simulator that scans and scores resumes, highlights keyword matches, tracks skill gaps for specific roles, and maintains a checklist of skills you need to learn.

## Features

- **ATS Score Predictor**: Immediate client-side analysis and scoring (0-100) based on targeted role requirements.
- **Dynamic Role Selector**: Configured with preset job descriptions for roles like Frontend Engineer, Backend Developer, Fullstack Engineer, Data Scientist, and Mobile App Developer.
- **Skill Gap Dashboard**: Interactive comparisons between skills in your resume and skills required by the selected role.
- **Learning Checklist Tracker**: Interactive checklists to mark off skills as they are acquired, with progress saved to `localStorage`.
- **ATS Optimizer Suggestions**: Visual action items, readability assessments, and formatting tips to maximize recruiter response rate.
- **Premium UI & Glassmorphism**: Stunning dark-mode layout with smooth visual transitions, custom graphs, and responsive columns.

## Run it

Open `index.html` in any modern browser.

## What it shows

- Client-side text processing and keyword-matching algorithms.
- Custom state management storing user resume text, target roles, and checked learning items.
- Dynamic DOM updating with CSS transitions and SVG visualization gauges.
- Local storage persistence mapping.
- Accessible, clean semantic structure (`main`, `section`, `header`, `footer`) with ARIA properties.
