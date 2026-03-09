Original prompt: 目前这是一个空文件夹，我需要你写一个游戏并且在Github上面更新，要求美工精美，类似于一个土豆兄弟的游戏但是简化版

- Initialized a no-build static web game project with `index.html`, `styles.css`, and `game.js`.
- Built first playable loop: movement, auto-shooting, enemy spawning, XP pickups, level-up choices, wave progression, boss rounds, restart, and fullscreen toggle.
- Added `window.render_game_to_text` and `window.advanceTime(ms)` to support deterministic browser testing.
- Installed Node.js locally, installed Playwright in the skill directory, and verified the game with the required web-game client.
- Verified outputs from `output/web-game/`: menu render, active gameplay at wave 2, and level-up overlay with upgrade choices. No console/page errors were emitted during the automated run.
- Added `README.md`, `.gitignore`, and `test-actions.json` for repo hygiene and reproducible checks.
- Added `package.json` plus `.vscode/tasks.json` and `.vscode/launch.json` so the project can be run directly from VSCode via `npm run dev` or `F5`.
- Repository has been pushed to GitHub, including merge to `main`.
