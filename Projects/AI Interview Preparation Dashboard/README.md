# AI Interview Preparation Dashboard

An interactive, premium client-side preparation hub that conducts voice-assisted mock interviews, grades your speech analytics, stores mock performance records, and guides your structural storytelling drafts via the STAR method.

## Features

- **Voice-Assisted AI Mock Interviewer**: Integrates with the browser's native Web Speech API (`speechSynthesis` and `webkitSpeechRecognition`) to speak questions aloud and record spoken responses.
- **Analytics Metrics Evaluator**: Automatically evaluates answer duration, speech pace (WPM), relevance, vocabulary length, and provides constructive feedback.
- **STAR Behavioral Builder**: Guides structure for behavioral answers (Situation, Task, Action, Result) with real-time word checks and saving profiles.
- **Mock Attempt History Logs**: Persists completed interview performance logs to `localStorage` to view score changes over time.
- **Premium Glassmorphism Design**: High-fidelity dark mode dashboard featuring visual mic trackers, radial progress gauges, and responsive grids.

## Run it

Open `index.html` in any modern browser.

## What it shows

- Using browser Web Speech API for Text-to-Speech (TTS) and Speech-to-Text (STT).
- Analytical logic computing speech velocity, answer duration, and keyword frequencies.
- Structural paragraph parsing and feedback calculations.
- Local storage data saving, mapping attempts, and custom saved STAR answers.
- Accessible ARIA labels and clean HTML5 elements.
