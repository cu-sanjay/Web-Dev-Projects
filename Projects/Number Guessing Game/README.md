# Number Guessing Game - Aero Decrypter

A classic number guessing game built in a nostalgic **Frutiger Aero** visual style, drawing design cues from early 2010s operating systems (like Windows Vista and Windows 7). 

This project is completely self-contained with no external resources or compilers.

## Features

- **Aero Glass Interface**: Translucent frosted panels with heavy backdrop blurs, thick reflective borders, and realistic box-shadow depths.
- **Organic Floating Bubbles**: Live CSS keyframe-animated glossy bubbles that drift upwards in the background.
- **Skeuomorphic Controls**: Beautiful 3D glassy buttons, glowing inputs, and gel gradients that highlight on hover.
- **Soft Chime Synthesizer**: Utilizes the browser's Web Audio API to synthesize smooth digital chimes (similar to classic Windows startup soundscapes and bubble-popping sound effects).
- **Difficulty presets**:
  - **Easy**: Guess between `1` and `50` (8 attempts).
  - **Medium**: Guess between `1` and `100` (6 attempts).
  - **Hard**: Guess between `1` and `200` (5 attempts).
- **Responsive Clue Log**: Submitting a guess logs it inside a glassy warm-alert bubble card (too high) or cool-blue bubble card (too low) to guide your next guess.
- **High Score Board**: Tracks and saves your best game score (decryption with the fewest attempts used) in browser `localStorage`.

## File Structure

```text
Projects/Number Guessing Game/
├── index.html        # Aero window structure & templates
├── styles.css        # Vista-style frames, glassy shadows & bubble animations
├── app.js            # Randomizer, chimes synthesizers & validation logic
├── project.json      # Workspace metadata card config
├── thumbnail.svg     # Windows-inspired glass icon graphic
└── README.md         # Readme instructions
```

## How to Play

1. Open `index.html` in a web browser.
2. Select your difficulty level (Easy, Medium, or Hard) and make sure sound is enabled.
3. Type a number within the target range into the input box or click the custom keypad.
4. Click **Submit Guess** or press Enter.
5. Review the scrollable Decryption History card for thermal clues (red indicator for "too high", ice blue for "too low").
6. Decrypt the code before you run out of firewall attempts!
