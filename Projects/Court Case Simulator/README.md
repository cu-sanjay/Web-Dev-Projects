# Court Case Simulator

An interactive legal simulation platform where users review evidence, analyze witness statements, evaluate credibility, and generate verdicts through a realistic courtroom decision-making process.

## Court Simulation Workflow

1. **Select a Case** — Choose from five pre-built fictional cases (Theft Investigation, Cyber Fraud, Contract Dispute, Property Conflict, Workplace Misconduct) or build your own Custom Case Scenario.
2. **Review Evidence** — Examine documents, photos, emails, messages, and financial records. Each piece of evidence includes relevance and authenticity scores.
3. **Interview Witnesses** — Read witness statements, evaluate key claims, and identify contradictions. Each witness has a dynamically calculated credibility rating.
4. **Evaluate Arguments** — Review arguments from both sides to understand the full legal context.
5. **Deliver a Verdict** — Based on the evidence and testimony reviewed, the system calculates a confidence score and you can deliver one of three verdicts.

## Evidence Review System

Each evidence item in the Evidence Locker includes:

- **Type** — Document, photo, email, message, or financial record
- **Relevance Score** — How relevant the evidence is to the case (0–100%)
- **Authenticity Rating** — How reliable/authentic the evidence is (0–100%)
- **Impact Score** — A composite score calculated from relevance, authenticity, and related witness credibility
- **Related Witnesses** — Links to witnesses connected to this evidence

## Witness Credibility Analysis

Witness credibility is calculated dynamically based on three factors:

- **Base Credibility** — Inherent reliability of the witness
- **Supporting Evidence Bonus** — Credibility increases when witness claims are backed by evidence
- **Contradiction Penalty** — Credibility decreases when witness statements contain contradictions

Credibility ratings:
- **High (75–100%)** — Reliable witness with supporting evidence and no contradictions
- **Medium (45–74%)** — Moderately reliable witness
- **Low (0–44%)** — Unreliable witness with contradictions or lack of evidence

## Verdict Generation Methodology

The verdict confidence percentage is calculated using:

- **Evidence Weight (55%)** — Average impact score across all reviewed evidence
- **Witness Credibility Weight (35%)** — Average credibility score of interviewed witnesses
- **Contradiction Penalty (up to -15%)** — Penalty for contradictions in testimony

Confidence thresholds:
- **65%+** — Strong case, guilty/plaintiff wins recommended
- **40–64%** — Moderate case, settlement recommended
- **Below 40%** — Weak case, not guilty/defendant wins recommended

## Data Structure

The application uses a structured JavaScript object for each case:

```
Case {
  id, title, type, dateFiled, parties, status, sessionStatus,
  description, category,
  evidence: [{
    id, title, type, icon, description, source,
    importance, relevanceScore, authenticityRating, relatedWitnesses
  }],
  witnesses: [{
    id, name, occupation, relationship, credibility,
    statement, keyClaims, contradictions, supportingEvidence
  }],
  arguments: { plaintiff, defense },
  verdictOutcomes: { guilty, notGuilty, settlement }
}
```

## Accessibility Features

- **Keyboard Navigation** — All interactive elements are keyboard-accessible with visible focus indicators
- **ARIA Labels** — Proper ARIA roles, labels, and attributes throughout
- **Screen Reader Support** — Semantic HTML structure with skip-to-content link
- **Reduced Motion** — Respects `prefers-reduced-motion` by disabling animations
- **High Contrast** — Respects `prefers-contrast: high` with enhanced borders and colors

## Local Deployment Guide

1. Clone or download the repository.
2. Navigate to `Projects/Court Case Simulator/`.
3. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
4. No build tools, package managers, or server required — the application runs entirely client-side.

### File Structure

```
Court Case Simulator/
├── index.html        — Main application entry point
├── style.css         — Premium legal theme stylesheet
├── script.js         — Application logic and case database
├── README.md         — This documentation file
├── project.json      — Project metadata
└── thumbnail.svg     — Preview thumbnail
```
