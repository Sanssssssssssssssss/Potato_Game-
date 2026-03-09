# Spud Arena

> A compact arcade survival shooter inspired by Brotato.

Spud Arena drops you into a scorched harvest field where a heavily armed potato automatically fires at incoming pests. Your job is simple: keep moving, survive the wave ramp, and stack upgrades fast enough to stay ahead of the swarm.

![Combat Screenshot](assets/readme/combat.png)

## What It Feels Like

- Auto-fire combat with movement-first survival
- Tight wave escalation with boss harvest rounds
- Three-card upgrade picks that push fast builds
- Fullscreen-ready play loop for short arcade sessions

## Screens

### Arena Combat

The core run is built around weaving through lanes, vacuuming XP cores, and keeping your firing line clean while enemy density climbs.

![Arena Combat](assets/readme/combat.png)

### Upgrade Draft

Each level-up pauses the action and gives you three cards, so the run can swing toward faster fire, heavier damage, more mobility, or orbital defense.

![Upgrade Draft](assets/readme/upgrade.png)

## Controls

- `WASD` or arrow keys: move
- Mouse click: start the run / click cards
- `1 / 2 / 3`: choose an upgrade
- `F`: toggle fullscreen

## Quick Start

### VSCode Terminal

```powershell
npm run dev
```

The terminal prints:

```text
Open the game here: http://127.0.0.1:4173/index.html
```

Open that URL in your browser. In VSCode terminal it should be clickable.

If `npm` is not recognized in an older terminal tab, close that tab and open a new one. This workspace injects `C:\Program Files\nodejs` into the terminal PATH through `.vscode/settings.json`.

### Fallback

```powershell
.\run-game.ps1
```

### VSCode Run And Debug

This project includes:

- `.vscode/tasks.json` to start the local server
- `.vscode/launch.json` to open the game in Edge or Chrome

Use `F5` with `Open Spud Arena (Edge)` or `Open Spud Arena (Chrome)`.

## Project Files

- `index.html`: page shell
- `styles.css`: outer presentation and layout
- `game.js`: gameplay, rendering, wave logic, and state hooks
- `serve.py`: local dev server with direct launch URL output
- `run-game.ps1`: simple PowerShell launcher

## Technical Notes

- No build step required
- Runs as a static browser game
- Includes `window.render_game_to_text()` and `window.advanceTime(ms)` for deterministic browser testing
