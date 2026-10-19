# ORBIT

**[Play in your browser →](https://santillio.github.io/orbit/)**

A small, endless 2D arcade game in a single self-contained HTML file.

A ball orbits a planet. Time your launch to send it along a tangent and catch
the next planet's orbit. Miss the orbit and your run ends.

## Run locally

Download `index.html` and open it in a browser. No installation, build step,
or internet connection is required. Play with a keyboard, mouse, or touchscreen.

## Controls

| Action | Input |
| --- | --- |
| Start / launch | Space, click, or tap |
| Pause / resume | P or Esc |
| Restart | R |
| Toggle sound | M or the speaker button |

The mint arc marks the launch window. Its narrow, bright segment marks the
Perfect Launch window. The short dotted line ahead of the ball shows its flight direction.

## Features

- Procedural planets and increasing difficulty.
- Each planet adds 10% of the starting angular speed to the orbit speed.
- Smooth camera movement, a continuous ball trail, and planet explosions.
- Smooth orbit capture that carries arrival speed into the new orbit.
- Perfect Launch bonuses, combos, and brief, eased slow motion.
- A high score saved in browser storage when available.
- Automatic pause when switching windows and reduced-motion support.
- Synthesized sound with no external assets, muted by default.

A regular capture earns 1 point. A Perfect Launch earns 2 points, and consecutive
perfect captures increase the reward up to 6 points. A regular capture resets the combo.

## GitHub Pages

In the repository settings, open **Pages → Deploy from a branch** and choose
**main** and **/ (root)**. GitHub displays the game URL once deployment is complete.

The game has no dependencies, external fonts, external images, or network requests.
