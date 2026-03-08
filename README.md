# Spud Arena

Spud Arena is a polished, no-build browser survival shooter inspired by Brotato.

## Features

- Auto-firing combat with smooth keyboard movement
- Escalating waves with boss rounds
- XP pickups and three-choice level-up cards
- Fullscreen toggle on `F`
- Deterministic hooks for browser automation: `window.render_game_to_text()` and `window.advanceTime(ms)`

## Run

Open [index.html](/D:/GPT_Project/ArtGame/index.html) directly in a browser, or serve the folder locally:

```powershell
py -m http.server 4173
```

Then open `http://127.0.0.1:4173/index.html`.

## Controls

- `WASD` or arrow keys: move
- `1 / 2 / 3`: choose upgrades
- Mouse click: start game / pick upgrade cards
- `F`: toggle fullscreen

## Files

- [index.html](/D:/GPT_Project/ArtGame/index.html): page shell
- [styles.css](/D:/GPT_Project/ArtGame/styles.css): layout and presentation
- [game.js](/D:/GPT_Project/ArtGame/game.js): gameplay, rendering, and state hooks
- [test-actions.json](/D:/GPT_Project/ArtGame/test-actions.json): Playwright action burst used for verification
