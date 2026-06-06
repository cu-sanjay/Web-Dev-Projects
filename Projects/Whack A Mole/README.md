# Whack A Mole - Retro Arcade Game

A premium, neon-themed **Whack-A-Mole** game built with semantic HTML5, modern CSS3 (featuring glassmorphic panels, 3D mole holes, smooth transitions, and keyframe-based particle explosions), and Vanilla JavaScript. 

It is completely self-contained, requiring no external assets or build tools.

## Features

- **Retro-Futuristic Visuals**: A deep violet and magenta arcade cabinet theme with frosted glass scoreboards and glowing interfaces.
- **Dynamic 3D Moles**: Custom vector SVG moles that rise smoothly out of perspective-mode garden holes.
- **Web Audio API Synth**: Real-time sound effect synthesis (pop, whack, miss, timer ticking, game-over fanfare) created on-the-fly. No static media loading required!
- **Juicy Game Feel**: Screen shake transitions, floating point indicators (`+100` floating labels), and physics-based particle bursts when hit.
- **Difficulty settings**: Configurable difficulty settings (Easy, Medium, Hard) that adjust mole spawn speed and active duration.
- **State Persistence**: High score tracking using `localStorage`.

## Naming & File Structure

```text
Projects/Whack A Mole/
├── index.html        # Game layout & semantic structure
├── styles.css        # Interactive arcade theme, transitions & keyframes
├── app.js            # Synthesizers, particle engine, state, and game loop
├── project.json      # Workspace metadata catalog entry
├── thumbnail.svg     # SVG grid card thumbnail
└── README.md         # Documentation
```

## How to Play

1. Open `index.html` in any modern browser.
2. Select your desired difficulty (Easy, Medium, or Hard) and toggle sound on/off using the sound button.
3. Click **Start Game** to begin the 30-second round.
4. Click/tap on the moles as they pop up to whack them and score points!
5. Avoid clicking empty holes to prevent missed whacks.
6. Try to beat your High Score!
