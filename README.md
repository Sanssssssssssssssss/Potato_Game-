# Spud Arena

Spud Arena is a polished, no-build browser survival shooter inspired by Brotato.

## Features

- Auto-firing combat with smooth keyboard movement
- Escalating waves with boss rounds
- XP pickups and three-choice level-up cards
- Fullscreen toggle on `F`
- Deterministic hooks for browser automation: `window.render_game_to_text()` and `window.advanceTime(ms)`

## Run In VSCode

### Option 1: Terminal

Open the integrated terminal in VSCode and run:

```powershell
npm run dev
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

The terminal now prints:

```text
Open the game here: http://127.0.0.1:4173/index.html
```

In VSCode's terminal this URL should be clickable.

If `npm` is not recognized in an already-open terminal, close that terminal and open a new one in VSCode. This workspace includes `.vscode/settings.json` to inject `C:\Program Files\nodejs` into the terminal PATH.

### Option 1B: Fallback Without npm

If you want a startup command that does not depend on Node PATH at all:

```powershell
.\run-game.ps1
```

### Option 2: VSCode Run Button

This repo now includes:

- `.vscode/tasks.json` to start the local server
- `.vscode/launch.json` to open the game in Edge or Chrome

In VSCode:

1. Open the Run and Debug panel.
2. Choose `Open Spud Arena (Edge)` or `Open Spud Arena (Chrome)`.
3. Press `F5`.

VSCode will start the local server automatically and open the game URL.

## Controls

- `WASD` or arrow keys: move
- `1 / 2 / 3`: choose upgrades
- Mouse click: start game / pick upgrade cards
- `F`: toggle fullscreen

## Files

- [index.html](/D:/GPT_Project/ArtGame/index.html): page shell
- [styles.css](/D:/GPT_Project/ArtGame/styles.css): layout and presentation
- [game.js](/D:/GPT_Project/ArtGame/game.js): gameplay, rendering, and state hooks
- [package.json](/D:/GPT_Project/ArtGame/package.json): local run scripts
- [test-actions.json](/D:/GPT_Project/ArtGame/test-actions.json): Playwright action burst used for verification
