(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const HALF_W = WIDTH / 2;
  const HALF_H = HEIGHT / 2;
  const WORLD = { width: 2800, height: 2800 };
  const STEP = 1 / 60;
  const PLAYER_BASE_RADIUS = 28;

  const keys = new Set();
  const pointer = { x: 0, y: 0, down: false };
  let lastFrame = performance.now();
  let rafId = 0;

  const ui = {
    heroEyebrow: document.getElementById("hero-eyebrow"),
    heroLede: document.getElementById("hero-lede"),
    featureList: document.getElementById("feature-list"),
    configKicker: document.getElementById("config-kicker"),
    configTitle: document.getElementById("config-title"),
    languageLabel: document.getElementById("language-label"),
    difficultyLabel: document.getElementById("difficulty-label"),
    detailLabel: document.getElementById("detail-label"),
    shakeLabel: document.getElementById("shake-label"),
    difficultySelect: document.getElementById("difficulty-select"),
    detailSelect: document.getElementById("detail-select"),
    shakeSelect: document.getElementById("shake-select"),
    languageButtons: [...document.querySelectorAll("[data-language]")],
    sigilKicker: document.getElementById("sigil-kicker"),
    sigilTitle: document.getElementById("sigil-title"),
    sigilBody: document.getElementById("sigil-body"),
    launchKicker: document.getElementById("launch-kicker"),
    launchHint: document.getElementById("launch-hint"),
    footerMove: document.getElementById("footer-move"),
    footerUpgrade: document.getElementById("footer-upgrade"),
    footerFullscreen: document.getElementById("footer-fullscreen")
  };

  const SETTINGS_KEY = "spud-arena-settings-v3";
  const defaultSettings = {
    language: "en",
    difficulty: "normal",
    detail: "lush",
    shake: "on"
  };

  const difficultyProfiles = {
    relaxed: { spawnRate: 0.82, hp: 0.9, speed: 0.94, damage: 0.88, xp: 1.12 },
    normal: { spawnRate: 1, hp: 1, speed: 1, damage: 1, xp: 1 },
    brutal: { spawnRate: 1.18, hp: 1.16, speed: 1.08, damage: 1.14, xp: 0.95 }
  };

  const text = {
    en: {
      heroEyebrow: "Arcade Survival",
      heroLede: "A compact Brotato-inspired arena shooter with more control over the run. Tune the language, pressure, and field density before you step into the harvest.",
      features: ["Auto-fire combat", "Bilingual UI", "Flexible difficulty", "Boss harvests"],
      configKicker: "Flexible Setup",
      configTitle: "Run Configuration",
      languageLabel: "Language",
      languageOptions: {
        en: "English",
        zh: "Chinese"
      },
      difficultyLabel: "Difficulty",
      detailLabel: "Field detail",
      shakeLabel: "Screen shake",
      difficultyOptions: {
        relaxed: "Relaxed",
        normal: "Normal",
        brutal: "Brutal"
      },
      detailOptions: {
        lush: "Lush",
        clean: "Minimal"
      },
      shakeOptions: {
        on: "On",
        off: "Off"
      },
      sigilKicker: "Harvest Sigil",
      sigilTitle: "Sickle And Wheat",
      sigilBody: "The field now opens with a stronger ritual frame, a cleaner control layout, and more ornamental harvest motifs so the game looks closer to a complete arcade piece.",
      launchKicker: "Quick Launch",
      launchHint: "Use the terminal command, or hit F5 in VSCode. The run link prints directly in the terminal.",
      footerMove: "Move: WASD / Arrow Keys",
      footerUpgrade: "Upgrade: 1 / 2 / 3 or click",
      footerFullscreen: "Fullscreen: F",
      menu: {
        kicker: "Harvest Ritual",
        title: "Spud Arena",
        tagline: "Auto-fire. Dodge hard. Build fast.",
        subline: "Tune the run in the sidebar, then dive into the field.",
        tipsTitle: "Field Notes",
        start: "Click anywhere or press Enter to begin",
        configTitle: "Active Loadout",
        language: "Language",
        difficulty: "Difficulty",
        detail: "Field",
        shake: "Shake"
      },
      hudStatus: "HARVEST STATUS",
      waveLabel: "Wave",
      timeLabel: "Time",
      killsLabel: "Kills",
      scoreLabel: "Score",
      levelLabel: "Level",
      hpLabel: "HP",
      bossIncoming: "Boss harvest incoming",
      waveSurges: (wave) => `Wave ${wave} surges`,
      upgradeSecured: "Upgrade secured",
      levelUp: {
        eyebrow: "Level Up",
        title: "Choose Your Upgrade",
        hint: "Press 1, 2, 3 or click a card"
      },
      gameOver: {
        title: "Harvest Lost",
        line: (wave, kills) => `You reached wave ${wave} and knocked out ${kills} enemies`,
        hint: "Click anywhere to jump back in",
        score: (score) => `Final score ${score}`,
        subline: "Reset, reroll your upgrades, and try to build a nastier run."
      },
      upgrades: {
        "rapid-fire": { title: "Clockwork Oil", subtitle: "Attack speed", detail: "Fire interval is reduced by 18%." },
        "heavy-rounds": { title: "Packed Rounds", subtitle: "Damage boost", detail: "Projectiles deal 12 more damage." },
        "greased-boots": { title: "Butter Slide", subtitle: "Move speed", detail: "Movement speed increases by 12%." },
        "wide-burst": { title: "Twin Burst", subtitle: "Firepower", detail: "Shoot one additional potato shot each volley." },
        "hot-soup": { title: "Hot Soup", subtitle: "Recovery", detail: "Gain 20 max HP and heal 20 immediately." },
        "sniper-salt": { title: "Sniper Salt", subtitle: "Projectile speed", detail: "Shots travel 18% faster and reach farther." },
        "thresher-ring": { title: "Thresher Ring", subtitle: "Orbiting blade", detail: "Summon a rotating blade around the hero." }
      }
    },
    zh: {
      heroEyebrow: "生存街机",
      heroLede: "这是一个受土豆兄弟启发的紧凑型生存射击游戏，现在可以在开局前自由调整语言、压力等级和地图细节，让每一局更灵活。",
      features: ["自动射击战斗", "中英双语", "难度可调", "Boss 波次"],
      configKicker: "灵活配置",
      configTitle: "开局设置",
      languageLabel: "语言",
      languageOptions: {
        en: "英文",
        zh: "中文"
      },
      difficultyLabel: "难度",
      detailLabel: "地图细节",
      shakeLabel: "震屏效果",
      difficultyOptions: {
        relaxed: "轻松",
        normal: "标准",
        brutal: "残酷"
      },
      detailOptions: {
        lush: "丰富",
        clean: "简洁"
      },
      shakeOptions: {
        on: "开启",
        off: "关闭"
      },
      sigilKicker: "收割纹章",
      sigilTitle: "镰刀与麦穗",
      sigilBody: "首屏现在加入了更完整的仪式感布局、可切换配置和更明显的收割主题装饰，让它更像一个完整的街机游戏，而不是单纯的测试画面。",
      launchKicker: "快速启动",
      launchHint: "可以在终端运行命令，也可以在 VSCode 里按 F5。游戏地址会直接打印在终端里。",
      footerMove: "移动：WASD / 方向键",
      footerUpgrade: "升级：1 / 2 / 3 或点击",
      footerFullscreen: "全屏：F",
      menu: {
        kicker: "收割仪式",
        title: "Spud Arena",
        tagline: "自动开火，灵活走位，快速成型。",
        subline: "先在左侧调整这局的配置，再踏进这片收割场。",
        tipsTitle: "开局提示",
        start: "点击任意位置或按 Enter 开始",
        configTitle: "当前配置",
        language: "语言",
        difficulty: "难度",
        detail: "地图",
        shake: "震屏"
      },
      hudStatus: "战局状态",
      waveLabel: "波次",
      timeLabel: "时间",
      killsLabel: "击败",
      scoreLabel: "分数",
      levelLabel: "等级",
      hpLabel: "生命",
      bossIncoming: "Boss 波次来袭",
      waveSurges: (wave) => `第 ${wave} 波正在加强`,
      upgradeSecured: "升级已生效",
      levelUp: {
        eyebrow: "升级",
        title: "选择你的强化",
        hint: "按 1、2、3 或直接点击卡片"
      },
      gameOver: {
        title: "收割失败",
        line: (wave, kills) => `你撑到了第 ${wave} 波，并击败了 ${kills} 个敌人`,
        hint: "点击任意位置重新开始",
        score: (score) => `最终分数 ${score}`,
        subline: "重开一局，换一种构筑方式再试试看。"
      },
      upgrades: {
        "rapid-fire": { title: "齿轮润滑", subtitle: "攻速强化", detail: "射击间隔缩短 18%。" },
        "heavy-rounds": { title: "压实弹丸", subtitle: "伤害强化", detail: "子弹伤害提高 12 点。" },
        "greased-boots": { title: "滚烫黄油", subtitle: "移速强化", detail: "移动速度提升 12%。" },
        "wide-burst": { title: "双发发射", subtitle: "火力强化", detail: "每轮额外发射 1 枚子弹。" },
        "hot-soup": { title: "热汤补给", subtitle: "续航强化", detail: "最大生命 +20，并立刻回复 20 点生命。" },
        "sniper-salt": { title: "海盐瞄具", subtitle: "弹速强化", detail: "子弹速度提升 18%，射程同步增加。" },
        "thresher-ring": { title: "旋耕护环", subtitle: "环绕刀片", detail: "生成一枚环绕角色旋转的刀片。" }
      }
    }
  };

  function loadSettings() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}");
      return {
        ...defaultSettings,
        ...parsed
      };
    } catch {
      return { ...defaultSettings };
    }
  }

  let settings = loadSettings();

  function saveSettings() {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function getPack() {
    return text[settings.language] || text.en;
  }

  function getDifficultyProfile(key = settings.difficulty) {
    return difficultyProfiles[key] || difficultyProfiles.normal;
  }

  function getUpgradeCopy(id) {
    const pack = getPack();
    return pack.upgrades[id] || text.en.upgrades[id];
  }

  function getOptionLabel(group, value) {
    const pack = getPack();
    return pack[group]?.[value] || text.en[group]?.[value] || value;
  }

  function updateStaticUi() {
    const pack = getPack();
    document.documentElement.lang = settings.language === "zh" ? "zh-CN" : "en";
    document.title = pack.menu.title;
    ui.heroEyebrow.textContent = pack.heroEyebrow;
    ui.heroLede.textContent = pack.heroLede;
    ui.configKicker.textContent = pack.configKicker;
    ui.configTitle.textContent = pack.configTitle;
    ui.languageLabel.textContent = pack.languageLabel;
    ui.difficultyLabel.textContent = pack.difficultyLabel;
    ui.detailLabel.textContent = pack.detailLabel;
    ui.shakeLabel.textContent = pack.shakeLabel;
    ui.sigilKicker.textContent = pack.sigilKicker;
    ui.sigilTitle.textContent = pack.sigilTitle;
    ui.sigilBody.textContent = pack.sigilBody;
    ui.launchKicker.textContent = pack.launchKicker;
    ui.launchHint.textContent = pack.launchHint;
    ui.footerMove.textContent = pack.footerMove;
    ui.footerUpgrade.textContent = pack.footerUpgrade;
    ui.footerFullscreen.textContent = pack.footerFullscreen;

    ui.featureList.innerHTML = "";
    for (const feature of pack.features) {
      const chip = document.createElement("span");
      chip.textContent = feature;
      ui.featureList.appendChild(chip);
    }

    for (const option of ui.difficultySelect.options) {
      option.textContent = getOptionLabel("difficultyOptions", option.value);
    }
    for (const option of ui.detailSelect.options) {
      option.textContent = getOptionLabel("detailOptions", option.value);
    }
    for (const option of ui.shakeSelect.options) {
      option.textContent = getOptionLabel("shakeOptions", option.value);
    }

    ui.difficultySelect.value = settings.difficulty;
    ui.detailSelect.value = settings.detail;
    ui.shakeSelect.value = settings.shake;
    for (const button of ui.languageButtons) {
      button.classList.toggle("is-active", button.dataset.language === settings.language);
    }
  }

  function applySettings(patch) {
    settings = { ...settings, ...patch };
    saveSettings();
    updateStaticUi();
    if (state.mode === "menu" || state.mode === "gameover") {
      state = createState();
      state.mode = "menu";
    }
    draw();
  }

  const upgradeCatalog = [
    {
      id: "rapid-fire",
      title: "Clockwork Oil",
      subtitle: "Attack speed",
      detail: "Fire interval is reduced by 18%.",
      apply: (state) => {
        state.player.fireRate *= 0.82;
      }
    },
    {
      id: "heavy-rounds",
      title: "Packed Rounds",
      subtitle: "Damage boost",
      detail: "Projectiles deal 12 more damage.",
      apply: (state) => {
        state.player.damage += 12;
      }
    },
    {
      id: "greased-boots",
      title: "Butter Slide",
      subtitle: "Move speed",
      detail: "Movement speed increases by 12%.",
      apply: (state) => {
        state.player.speed *= 1.12;
      }
    },
    {
      id: "wide-burst",
      title: "Twin Burst",
      subtitle: "Firepower",
      detail: "Shoot one additional potato shot each volley.",
      apply: (state) => {
        state.player.multishot += 1;
      }
    },
    {
      id: "hot-soup",
      title: "Hot Soup",
      subtitle: "Recovery",
      detail: "Gain 20 max HP and heal 20 immediately.",
      apply: (state) => {
        state.player.maxHp += 20;
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + 20);
      }
    },
    {
      id: "sniper-salt",
      title: "Sniper Salt",
      subtitle: "Projectile speed",
      detail: "Shots travel 18% faster and reach farther.",
      apply: (state) => {
        state.player.projectileSpeed *= 1.18;
        state.player.range += 60;
      }
    },
    {
      id: "thresher-ring",
      title: "Thresher Ring",
      subtitle: "Orbiting blade",
      detail: "Summon a rotating blade around the hero.",
      apply: (state) => {
        state.player.orbitals += 1;
      }
    }
  ];

  function createState() {
    const difficulty = getDifficultyProfile();
    return {
      mode: "menu",
      time: 0,
      runTime: 0,
      score: 0,
      kills: 0,
      wave: 1,
      level: 1,
      cameraShake: 0,
      messageTimer: 0,
      player: {
        x: WORLD.width / 2,
        y: WORLD.height / 2,
        vx: 0,
        vy: 0,
        radius: PLAYER_BASE_RADIUS,
        speed: 320,
        hp: 100,
        maxHp: 100,
        fireCooldown: 0,
        fireRate: 0.38,
        damage: 26,
        projectileSpeed: 780,
        range: 520,
        xp: 0,
        xpToLevel: 70,
        multishot: 1,
        orbitals: 0,
        invuln: 0,
        aimAngle: 0
      },
      enemies: [],
      projectiles: [],
      particles: [],
      pickups: [],
      splats: [],
      upgradeChoices: [],
      bossAlive: false,
      spawnBank: 0,
      nextWaveAt: 18,
      worldPulse: 0,
      difficulty,
      decor: generateDecor(settings.detail)
    };
  }

  let state = createState();

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function angleTo(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function wrapText(text, maxWidth) {
    const units = text.includes(" ") ? text.split(" ") : Array.from(text);
    const lines = [];
    let line = "";
    for (const unit of units) {
      const spacer = text.includes(" ") && line ? " " : "";
      const test = `${line}${spacer}${unit}`;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = unit;
      } else {
        line = test;
      }
    }
    if (line) {
      lines.push(line);
    }
    return lines;
  }

  function pickUpgradeChoices(count) {
    const pool = [...upgradeCatalog];
    const picks = [];
    while (pool.length && picks.length < count) {
      const index = randInt(0, pool.length - 1);
      picks.push(pool.splice(index, 1)[0]);
    }
    return picks;
  }

  function spawnEnemy(kind) {
    const edge = randInt(0, 3);
    let x = 0;
    let y = 0;
    const margin = 240;
    if (edge === 0) {
      x = rand(margin, WORLD.width - margin);
      y = rand(80, margin);
    } else if (edge === 1) {
      x = WORLD.width - rand(80, margin);
      y = rand(margin, WORLD.height - margin);
    } else if (edge === 2) {
      x = rand(margin, WORLD.width - margin);
      y = WORLD.height - rand(80, margin);
    } else {
      x = rand(80, margin);
      y = rand(margin, WORLD.height - margin);
    }

    const presets = {
      grub: { radius: 24, speed: 110, hp: 34, color: "#85b547", xp: 10, damage: 12 },
      beet: { radius: 30, speed: 82, hp: 84, color: "#8c4e34", xp: 18, damage: 18 },
      thorn: { radius: 20, speed: 168, hp: 22, color: "#f26d3d", xp: 12, damage: 10 },
      boss: { radius: 58, speed: 74, hp: 360, color: "#3d271c", xp: 80, damage: 24 }
    };
    const preset = presets[kind];
    const profile = state.difficulty;
    state.enemies.push({
      kind,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: preset.radius,
      speed: (preset.speed + state.wave * (kind === "boss" ? 6 : 3)) * profile.speed,
      hp: (preset.hp + state.wave * (kind === "boss" ? 42 : 8)) * profile.hp,
      maxHp: (preset.hp + state.wave * (kind === "boss" ? 42 : 8)) * profile.hp,
      color: preset.color,
      xp: Math.round(preset.xp * profile.xp),
      damage: preset.damage * profile.damage,
      hitFlash: 0
    });
    if (kind === "boss") {
      state.bossAlive = true;
      state.messageTimer = 2.2;
    }
  }

  function emitParticles(x, y, color, amount, speed) {
    for (let i = 0; i < amount; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const velocity = rand(speed * 0.35, speed);
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: rand(0.25, 0.6),
        maxLife: 0.6,
        size: rand(4, 10),
        color
      });
    }
  }

  function createPickup(x, y, value) {
    state.pickups.push({
      x,
      y,
      radius: 11,
      value,
      phase: rand(0, Math.PI * 2)
    });
  }

  function damageEnemy(enemy, amount, impulseAngle) {
    enemy.hp -= amount;
    enemy.hitFlash = 0.12;
    enemy.vx += Math.cos(impulseAngle) * 55;
    enemy.vy += Math.sin(impulseAngle) * 55;
    emitParticles(enemy.x, enemy.y, "#ffd8b1", 5, 160);
    if (enemy.hp <= 0) {
      state.score += enemy.kind === "boss" ? 120 : 16;
      state.kills += 1;
      state.splats.push({
        x: enemy.x,
        y: enemy.y,
        radius: enemy.radius * rand(1.1, 1.8),
        life: 10,
        color: enemy.kind === "boss" ? "rgba(75, 38, 26, 0.32)" : "rgba(126, 62, 35, 0.24)"
      });
      emitParticles(enemy.x, enemy.y, "#ffcf8d", enemy.kind === "boss" ? 22 : 10, enemy.kind === "boss" ? 260 : 180);
      createPickup(enemy.x, enemy.y, enemy.xp);
      if (enemy.kind === "boss") {
        state.bossAlive = false;
      }
      return true;
    }
    return false;
  }

  function fireProjectile(angleOffset) {
    const player = state.player;
    const targetAngle = player.aimAngle + angleOffset;
    state.projectiles.push({
      x: player.x + Math.cos(targetAngle) * 28,
      y: player.y + Math.sin(targetAngle) * 28,
      vx: Math.cos(targetAngle) * player.projectileSpeed,
      vy: Math.sin(targetAngle) * player.projectileSpeed,
      radius: 9,
      damage: player.damage,
      life: player.range / player.projectileSpeed,
      hue: randInt(38, 52)
    });
  }

  function tryAutoShoot() {
    const player = state.player;
    if (player.fireCooldown > 0 || !state.enemies.length) {
      return;
    }

    let closest = null;
    let bestDist = Infinity;
    for (const enemy of state.enemies) {
      const dist = distance(player, enemy);
      if (dist < bestDist) {
        bestDist = dist;
        closest = enemy;
      }
    }
    if (!closest || bestDist > player.range + 140) {
      return;
    }

    player.aimAngle = angleTo(player, closest);
    const shotCount = player.multishot;
    const spread = shotCount > 1 ? 0.16 : 0;
    for (let i = 0; i < shotCount; i += 1) {
      const offset = shotCount === 1 ? 0 : lerp(-spread, spread, i / (shotCount - 1));
      fireProjectile(offset);
    }
    player.fireCooldown = player.fireRate;
    const shakeMult = settings.shake === "on" ? 1 : 0.18;
    state.cameraShake = Math.min(10, state.cameraShake + 2.4 * shakeMult);
  }

  function collectXp() {
    const player = state.player;
    for (let i = state.pickups.length - 1; i >= 0; i -= 1) {
      const pickup = state.pickups[i];
      const dist = distance(player, pickup);
      if (dist < 180) {
        const pull = clamp(1 - dist / 180, 0.05, 1);
        const angle = angleTo(pickup, player);
        pickup.x += Math.cos(angle) * pull * 360 * STEP;
        pickup.y += Math.sin(angle) * pull * 360 * STEP;
      }
      if (dist < player.radius + pickup.radius + 6) {
        player.xp += pickup.value;
        state.pickups.splice(i, 1);
        emitParticles(pickup.x, pickup.y, "#f8ffb4", 5, 120);
        while (player.xp >= player.xpToLevel) {
          player.xp -= player.xpToLevel;
          player.xpToLevel = Math.round(player.xpToLevel * 1.22);
          state.level += 1;
          state.mode = "levelup";
          state.upgradeChoices = pickUpgradeChoices(3);
        }
      }
    }
  }

  function selectUpgrade(index) {
    if (state.mode !== "levelup" || !state.upgradeChoices[index]) {
      return;
    }
    state.upgradeChoices[index].apply(state);
    state.upgradeChoices = [];
    state.mode = "playing";
    state.messageTimer = 1.2;
  }

  function resetGame() {
    state = createState();
    state.mode = "playing";
  }

  function updateMenuInput() {
    if (pointer.down) {
      state.mode = "playing";
      pointer.down = false;
    }
  }

  function updatePlaying(dt) {
    const player = state.player;
    state.time += dt;
    state.runTime += dt;
    state.worldPulse += dt * 0.6;
    state.cameraShake = Math.max(0, state.cameraShake - dt * 14);
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    player.invuln = Math.max(0, player.invuln - dt);

    let moveX = 0;
    let moveY = 0;
    if (keys.has("arrowleft") || keys.has("a")) moveX -= 1;
    if (keys.has("arrowright") || keys.has("d")) moveX += 1;
    if (keys.has("arrowup") || keys.has("w")) moveY -= 1;
    if (keys.has("arrowdown") || keys.has("s")) moveY += 1;

    const length = Math.hypot(moveX, moveY) || 1;
    const targetVx = (moveX / length) * player.speed;
    const targetVy = (moveY / length) * player.speed;
    player.vx = lerp(player.vx, targetVx, 0.18);
    player.vy = lerp(player.vy, targetVy, 0.18);
    player.x = clamp(player.x + player.vx * dt, 70, WORLD.width - 70);
    player.y = clamp(player.y + player.vy * dt, 70, WORLD.height - 70);

    tryAutoShoot();

    state.spawnBank += dt * (1.6 + state.wave * 0.28) * state.difficulty.spawnRate;
    while (state.spawnBank >= 1) {
      state.spawnBank -= 1;
      const roll = Math.random();
      if (state.wave >= 3 && roll > 0.72) {
        spawnEnemy("beet");
      } else if (state.wave >= 2 && roll > 0.46) {
        spawnEnemy("thorn");
      } else {
        spawnEnemy("grub");
      }
    }

    if (state.runTime >= state.nextWaveAt) {
      state.wave += 1;
      state.nextWaveAt += 18;
      state.messageTimer = 1.8;
      if (state.wave % 3 === 0 && !state.bossAlive) {
        spawnEnemy("boss");
      }
    }

    for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = state.projectiles[i];
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      let remove = projectile.life <= 0;
      for (let j = state.enemies.length - 1; j >= 0 && !remove; j -= 1) {
        const enemy = state.enemies[j];
        if (distance(projectile, enemy) < projectile.radius + enemy.radius) {
          const angle = Math.atan2(projectile.vy, projectile.vx);
          const killed = damageEnemy(enemy, projectile.damage, angle);
          if (killed) {
            state.enemies.splice(j, 1);
          }
          remove = true;
        }
      }
      if (
        remove ||
        projectile.x < -120 ||
        projectile.x > WORLD.width + 120 ||
        projectile.y < -120 ||
        projectile.y > WORLD.height + 120
      ) {
        state.projectiles.splice(i, 1);
      }
    }

    const orbitalDamage = 26;
    for (let o = 0; o < player.orbitals; o += 1) {
      const angle = state.time * 2.6 + (Math.PI * 2 * o) / Math.max(1, player.orbitals);
      const ox = player.x + Math.cos(angle) * 72;
      const oy = player.y + Math.sin(angle) * 72;
      for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
        const enemy = state.enemies[i];
        if (distance({ x: ox, y: oy }, enemy) < enemy.radius + 20) {
          const killed = damageEnemy(enemy, orbitalDamage * dt * 4.2, angle);
          if (killed) {
            state.enemies.splice(i, 1);
          }
        }
      }
    }

    for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = state.enemies[i];
      const angle = angleTo(enemy, player);
      enemy.vx = lerp(enemy.vx, Math.cos(angle) * enemy.speed, 0.08);
      enemy.vy = lerp(enemy.vy, Math.sin(angle) * enemy.speed, 0.08);
      enemy.x = clamp(enemy.x + enemy.vx * dt, 20, WORLD.width - 20);
      enemy.y = clamp(enemy.y + enemy.vy * dt, 20, WORLD.height - 20);
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

      if (distance(enemy, player) < enemy.radius + player.radius + 6 && player.invuln <= 0) {
        player.hp -= enemy.damage;
        player.invuln = 0.65;
        state.cameraShake = settings.shake === "on" ? 18 : 3;
        emitParticles(player.x, player.y, "#fff0db", 18, 260);
        if (player.hp <= 0) {
          player.hp = 0;
          state.mode = "gameover";
        }
      }
    }

    collectXp();

    for (let i = state.pickups.length - 1; i >= 0; i -= 1) {
      state.pickups[i].phase += dt * 3.6;
    }

    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const particle = state.particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.96;
      particle.vy *= 0.96;
      particle.life -= dt;
      if (particle.life <= 0) {
        state.particles.splice(i, 1);
      }
    }

    for (let i = state.splats.length - 1; i >= 0; i -= 1) {
      state.splats[i].life -= dt;
      if (state.splats[i].life <= 0) {
        state.splats.splice(i, 1);
      }
    }
  }

  function updateGameOver() {
    if (pointer.down) {
      resetGame();
      pointer.down = false;
    }
  }

  function update(dt) {
    if (state.mode === "menu") {
      state.time += dt;
      state.worldPulse += dt * 0.5;
      updateMenuInput();
      return;
    }
    if (state.mode === "playing") {
      updatePlaying(dt);
      return;
    }
    if (state.mode === "levelup") {
      state.time += dt;
      state.worldPulse += dt * 0.4;
      return;
    }
    if (state.mode === "gameover") {
      state.time += dt;
      state.worldPulse += dt * 0.25;
      updateGameOver();
    }
  }

  function getCamera() {
    const targetX = clamp(state.player.x, HALF_W, WORLD.width - HALF_W);
    const targetY = clamp(state.player.y, HALF_H, WORLD.height - HALF_H);
    const shake = settings.shake === "on" ? state.cameraShake : state.cameraShake * 0.15;
    return {
      x: targetX + rand(-shake, shake),
      y: targetY + rand(-shake, shake)
    };
  }

  function drawRoundedPanel(x, y, width, height, radius, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    ctx.stroke();
  }

  function drawEye(x, y, size) {
    ctx.fillStyle = "#1c0d09";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(x - size * 0.22, y - size * 0.22, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  function generateDecor(detail) {
    const lush = detail === "lush";
    const props = [];
    const count = lush ? 140 : 72;
    for (let i = 0; i < count; i += 1) {
      const roll = Math.random();
      const type =
        roll < 0.22 ? "hay" :
        roll < 0.4 ? "lantern" :
        roll < 0.58 ? "crate" :
        roll < 0.78 ? "scarecrow" :
        roll < 0.92 ? "rock" :
        "sickle";
      props.push({
        type,
        x: rand(100, WORLD.width - 100),
        y: rand(100, WORLD.height - 100),
        scale: rand(0.75, 1.35),
        phase: rand(0, Math.PI * 2)
      });
    }
    return props;
  }

  function drawSickleSigil(x, y, scale, glowAlpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = `rgba(255, 206, 129, ${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f4cf8a";
    ctx.beginPath();
    ctx.arc(-6, -4, 34, -1.1, 1.15, false);
    ctx.arc(14, -2, 22, 1.2, -1.2, true);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff0c6";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "#6d351d";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-10, 20);
    ctx.lineTo(26, -26);
    ctx.stroke();

    ctx.strokeStyle = "#ffd68f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-46, -12);
    ctx.quadraticCurveTo(-58, 8, -54, 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(44, -8);
    ctx.quadraticCurveTo(56, 10, 54, 34);
    ctx.stroke();
    for (let i = 0; i < 3; i += 1) {
      const offset = -6 + i * 18;
      ctx.beginPath();
      ctx.moveTo(-48, offset);
      ctx.lineTo(-64, offset - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(48, offset);
      ctx.lineTo(64, offset - 6);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawWorldProp(prop) {
    ctx.save();
    ctx.translate(prop.x, prop.y);
    ctx.scale(prop.scale, prop.scale);

    if (prop.type === "hay") {
      drawShadow(0, 18, 22, 8, 0.14);
      ctx.fillStyle = "#dba75f";
      ctx.beginPath();
      ctx.roundRect(-18, -12, 36, 24, 8);
      ctx.fill();
      ctx.strokeStyle = "#c7853d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, -11);
      ctx.lineTo(-12, 11);
      ctx.moveTo(0, -11);
      ctx.lineTo(0, 11);
      ctx.moveTo(12, -11);
      ctx.lineTo(12, 11);
      ctx.stroke();
    } else if (prop.type === "lantern") {
      drawShadow(0, 20, 18, 7, 0.12);
      ctx.strokeStyle = "#6b361e";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 18);
      ctx.lineTo(0, -10);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 227, 144, 0.18)";
      ctx.beginPath();
      ctx.arc(0, -14, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe8a7";
      ctx.beginPath();
      ctx.arc(0, -14, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (prop.type === "crate") {
      drawShadow(0, 18, 20, 7, 0.14);
      ctx.fillStyle = "#8b512f";
      ctx.beginPath();
      ctx.roundRect(-16, -14, 32, 28, 6);
      ctx.fill();
      ctx.strokeStyle = "#c88b57";
      ctx.lineWidth = 3;
      ctx.strokeRect(-12, -10, 24, 20);
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(16, 14);
      ctx.moveTo(16, -14);
      ctx.lineTo(-16, 14);
      ctx.stroke();
    } else if (prop.type === "scarecrow") {
      drawShadow(0, 24, 18, 7, 0.12);
      ctx.strokeStyle = "#6b361e";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, 24);
      ctx.lineTo(0, -10);
      ctx.moveTo(-18, 0);
      ctx.lineTo(18, -6);
      ctx.stroke();
      ctx.fillStyle = "#d5a15d";
      ctx.beginPath();
      ctx.arc(0, -18, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a44d2a";
      ctx.fillRect(-14, 0, 28, 18);
    } else if (prop.type === "rock") {
      drawShadow(0, 16, 18, 7, 0.1);
      ctx.fillStyle = "#7e5b4a";
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.arc(-4, -3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (prop.type === "sickle") {
      drawShadow(0, 20, 22, 8, 0.14);
      drawSickleSigil(0, 0, 0.36, 0.08);
    }

    ctx.restore();
  }

  function drawBackground(camera) {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#fce7c9");
    sky.addColorStop(0.3, "#f3b670");
    sky.addColorStop(0.72, "#955330");
    sky.addColorStop(1, "#36140c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const sun = ctx.createRadialGradient(WIDTH * 0.78, HEIGHT * 0.18, 0, WIDTH * 0.78, HEIGHT * 0.18, 180);
    sun.addColorStop(0, "rgba(255, 246, 210, 0.9)");
    sun.addColorStop(0.35, "rgba(255, 205, 132, 0.56)");
    sun.addColorStop(1, "rgba(255, 190, 110, 0)");
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(WIDTH * 0.78, HEIGHT * 0.18, 180, 0, Math.PI * 2);
    ctx.fill();

    const horizon = HEIGHT * 0.38;
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.beginPath();
    ctx.ellipse(WIDTH * 0.18, horizon - 56, 220, 82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(WIDTH * 0.78, horizon - 12, 180, 68, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#7e3f24";
    ctx.beginPath();
    ctx.moveTo(0, horizon + 10);
    for (let x = 0; x <= WIDTH; x += 90) {
      ctx.lineTo(x, horizon + Math.sin((x + state.worldPulse * 90) * 0.0065) * 26);
    }
    ctx.lineTo(WIDTH, HEIGHT);
    ctx.lineTo(0, HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#5e2717";
    ctx.beginPath();
    ctx.moveTo(0, horizon + 52);
    for (let x = 0; x <= WIDTH; x += 70) {
      ctx.lineTo(x, horizon + 50 + Math.cos((x + state.worldPulse * 130) * 0.01) * 18);
    }
    ctx.lineTo(WIDTH, HEIGHT);
    ctx.lineTo(0, HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 235, 205, 0.08)";
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 93 + state.worldPulse * 22) % (WIDTH + 120) - 60;
      const y = 120 + (i % 6) * 42;
      ctx.beginPath();
      ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(HALF_W - camera.x, HALF_H - camera.y);

    const field = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    field.addColorStop(0, "#bf7b3a");
    field.addColorStop(0.45, "#99552d");
    field.addColorStop(1, "#4a2417");
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    for (let x = 0; x < WORLD.width; x += 120) {
      ctx.strokeStyle = "rgba(63, 23, 10, 0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(state.worldPulse + x * 0.008) * 44, WORLD.height);
      ctx.stroke();
    }

    for (let y = 140; y < WORLD.height; y += 220) {
      ctx.fillStyle = "rgba(255, 239, 204, 0.07)";
      ctx.fillRect(0, y, WORLD.width, 18);
    }

    for (let x = 60; x < WORLD.width; x += 120) {
      for (let y = 60; y < WORLD.height; y += 120) {
        const sway = Math.sin((x + y) * 0.01 + state.worldPulse * 2.5) * 4;
        ctx.strokeStyle = "rgba(255, 211, 129, 0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 12);
        ctx.quadraticCurveTo(x + sway, y - 8, x + sway * 0.4, y - 24);
        ctx.stroke();
      }
    }

    const left = camera.x - HALF_W - 120;
    const right = camera.x + HALF_W + 120;
    const top = camera.y - HALF_H - 120;
    const bottom = camera.y + HALF_H + 120;
    for (const prop of state.decor) {
      if (prop.x < left || prop.x > right || prop.y < top || prop.y > bottom) {
        continue;
      }
      drawWorldProp(prop);
    }

    for (const splat of state.splats) {
      ctx.fillStyle = splat.color;
      ctx.beginPath();
      ctx.ellipse(splat.x, splat.y, splat.radius, splat.radius * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    const vignette = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * 0.2, WIDTH / 2, HEIGHT / 2, HEIGHT * 0.78);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(22,6,3,0.28)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawShadow(x, y, rx, ry, alpha) {
    ctx.fillStyle = `rgba(54, 21, 11, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEntities(camera) {
    ctx.save();
    ctx.translate(HALF_W - camera.x, HALF_H - camera.y);

    for (const pickup of state.pickups) {
      const bob = Math.sin(pickup.phase) * 4;
      drawShadow(pickup.x, pickup.y + 18, 14, 8, 0.22);
      ctx.fillStyle = "rgba(255, 234, 151, 0.22)";
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y + bob, pickup.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff3b0";
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y + bob, pickup.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffbe1";
      ctx.beginPath();
      ctx.arc(pickup.x - 3, pickup.y - 3 + bob, pickup.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const projectile of state.projectiles) {
      drawShadow(projectile.x, projectile.y + 13, 14, 7, 0.18);
      ctx.fillStyle = `hsla(${projectile.hue} 100% 70% / 0.2)`;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `hsl(${projectile.hue} 100% 70%)`;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(projectile.x - 3, projectile.y - 3, projectile.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const enemy of state.enemies) {
      drawShadow(enemy.x, enemy.y + enemy.radius * 0.72, enemy.radius * 0.8, enemy.radius * 0.36, 0.2);
      const enemyGradient = ctx.createRadialGradient(
        enemy.x - enemy.radius * 0.28,
        enemy.y - enemy.radius * 0.3,
        enemy.radius * 0.2,
        enemy.x,
        enemy.y,
        enemy.radius * 1.15
      );
      enemyGradient.addColorStop(0, enemy.hitFlash > 0 ? "#fff8e1" : "#d8f59f");
      enemyGradient.addColorStop(0.45, enemy.hitFlash > 0 ? "#fff1cb" : enemy.color);
      enemyGradient.addColorStop(1, enemy.kind === "boss" ? "#1c0d09" : "rgba(31, 14, 8, 0.86)");
      ctx.fillStyle = enemyGradient;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(33, 12, 8, 0.32)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 241, 218, 0.18)";
      ctx.beginPath();
      ctx.arc(enemy.x - enemy.radius * 0.26, enemy.y - enemy.radius * 0.22, enemy.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();

      const eyeOffset = enemy.kind === "boss" ? 12 : 7;
      drawEye(enemy.x - eyeOffset, enemy.y - 4, 4);
      drawEye(enemy.x + eyeOffset, enemy.y - 4, 4);

      if (enemy.kind === "boss") {
        ctx.strokeStyle = "rgba(255, 226, 179, 0.36)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 10 + Math.sin(state.time * 4) * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 205, 142, 0.14)";
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 18, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(61, 31, 10, 0.48)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y + enemy.radius * 0.14, enemy.radius * 0.35, 0.25, Math.PI - 0.25);
        ctx.stroke();
      }

      const hpWidth = enemy.radius * 1.7;
      ctx.fillStyle = "rgba(24, 9, 4, 0.35)";
      ctx.beginPath();
      ctx.roundRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 18, hpWidth, 6, 999);
      ctx.fill();
      ctx.fillStyle = enemy.kind === "boss" ? "#ffd479" : "#a7ef7d";
      ctx.beginPath();
      ctx.roundRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 18, hpWidth * (enemy.hp / enemy.maxHp), 6, 999);
      ctx.fill();
    }

    const player = state.player;
    drawShadow(player.x, player.y + player.radius + 12, player.radius, player.radius * 0.44, 0.24);
    const playerGradient = ctx.createRadialGradient(
      player.x - 10,
      player.y - 18,
      4,
      player.x,
      player.y,
      player.radius * 1.15
    );
    playerGradient.addColorStop(0, player.invuln > 0 ? "#fffdf1" : "#ffdfa3");
    playerGradient.addColorStop(0.4, player.invuln > 0 ? "#fff2cb" : "#d8a460");
    playerGradient.addColorStop(1, "#7f4d2c");
    ctx.fillStyle = playerGradient;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(64, 23, 11, 0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#f8e3b5";
    ctx.beginPath();
    ctx.arc(player.x - 10, player.y - 10, player.radius * 0.44, 0, Math.PI * 2);
    ctx.fill();
    drawEye(player.x - 8, player.y - 2, 5);
    drawEye(player.x + 8, player.y - 2, 5);
    ctx.strokeStyle = "#3b2016";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(player.x, player.y + 4, 11, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.strokeStyle = "#5d2f19";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(player.x - Math.cos(player.aimAngle) * 4, player.y - Math.sin(player.aimAngle) * 4);
    ctx.lineTo(player.x + Math.cos(player.aimAngle) * 38, player.y + Math.sin(player.aimAngle) * 38);
    ctx.stroke();
    ctx.strokeStyle = "#f3c577";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(player.x + Math.cos(player.aimAngle) * 10, player.y + Math.sin(player.aimAngle) * 10);
    ctx.lineTo(player.x + Math.cos(player.aimAngle) * 34, player.y + Math.sin(player.aimAngle) * 34);
    ctx.stroke();

    if (player.fireCooldown > player.fireRate * 0.7) {
      ctx.fillStyle = "rgba(255, 212, 118, 0.45)";
      ctx.beginPath();
      ctx.arc(player.x + Math.cos(player.aimAngle) * 42, player.y + Math.sin(player.aimAngle) * 42, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let o = 0; o < player.orbitals; o += 1) {
      const angle = state.time * 2.6 + (Math.PI * 2 * o) / Math.max(1, player.orbitals);
      const ox = player.x + Math.cos(angle) * 72;
      const oy = player.y + Math.sin(angle) * 72;
      drawShadow(ox, oy + 10, 16, 7, 0.16);
      ctx.fillStyle = "rgba(255, 200, 96, 0.22)";
      ctx.beginPath();
      ctx.arc(ox, oy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffcb60";
      ctx.beginPath();
      ctx.moveTo(ox, oy - 16);
      ctx.lineTo(ox + 11, oy);
      ctx.lineTo(ox, oy + 16);
      ctx.lineTo(ox - 11, oy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fff2c9";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    for (const particle of state.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawHud() {
    const player = state.player;
    ctx.save();
    drawRoundedPanel(24, 20, 374, 142, 26, "rgba(39, 13, 8, 0.78)", "rgba(255, 232, 202, 0.14)");
    ctx.fillStyle = "rgba(255, 191, 125, 0.14)";
    ctx.beginPath();
    ctx.roundRect(24, 20, 374, 142, 26);
    ctx.fill();

    ctx.fillStyle = "#fff3df";
    ctx.font = "800 16px Manrope";
    ctx.fillText("HARVEST STATUS", 44, 48);
    ctx.font = "800 28px Alegreya";
    ctx.fillText(`Wave ${state.wave}`, 44, 78);
    ctx.font = "700 14px Manrope";
    ctx.fillStyle = "rgba(255,245,230,0.74)";
    ctx.fillText(`Time ${state.runTime.toFixed(0)}s`, 44, 106);
    ctx.fillText(`Kills ${state.kills}`, 128, 106);
    ctx.fillText(`Score ${state.score}`, 206, 106);
    ctx.fillText(`Level ${state.level}`, 304, 106);

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.roundRect(44, 120, 312, 16, 999);
    ctx.fill();
    const hpBar = ctx.createLinearGradient(44, 0, 356, 0);
    hpBar.addColorStop(0, "#ff8a63");
    hpBar.addColorStop(1, "#ffcc70");
    ctx.fillStyle = hpBar;
    ctx.beginPath();
    ctx.roundRect(44, 120, 312 * (player.hp / player.maxHp), 16, 999);
    ctx.fill();
    ctx.fillStyle = "#fff7eb";
    ctx.font = "700 12px Manrope";
    ctx.fillText(`HP ${Math.ceil(player.hp)} / ${player.maxHp}`, 50, 132);

    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.beginPath();
    ctx.roundRect(44, 144, 312, 10, 999);
    ctx.fill();
    const xpBar = ctx.createLinearGradient(44, 0, 356, 0);
    xpBar.addColorStop(0, "#ffe474");
    xpBar.addColorStop(1, "#fff2b1");
    ctx.fillStyle = xpBar;
    ctx.beginPath();
    ctx.roundRect(44, 144, 312 * (player.xp / player.xpToLevel), 10, 999);
    ctx.fill();

    if (state.messageTimer > 0) {
      const label = state.bossAlive ? "Boss harvest incoming" : state.mode === "playing" ? `Wave ${state.wave} surges` : "Upgrade secured";
      ctx.textAlign = "center";
      ctx.font = "800 30px Alegreya";
      ctx.fillStyle = "rgba(74, 23, 4, 0.28)";
      ctx.fillText(label, WIDTH / 2 + 2, 84);
      ctx.fillStyle = "#fff8dd";
      ctx.fillText(label, WIDTH / 2, 80);
      ctx.textAlign = "left";
    }
    ctx.restore();
  }

  function drawMenu() {
    drawBackground({ x: WORLD.width / 2, y: WORLD.height / 2 });
    ctx.fillStyle = "rgba(30, 10, 5, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "rgba(49, 17, 10, 0.84)";
    ctx.strokeStyle = "rgba(255, 230, 191, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(162, 96, WIDTH - 324, HEIGHT - 192, 34);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd37f";
    ctx.font = "800 20px Manrope";
    ctx.fillText("Garden Run", WIDTH / 2, 170);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 78px Alegreya";
    ctx.fillText("Spud Arena", WIDTH / 2, 260);
    ctx.font = "600 26px Manrope";
    ctx.fillStyle = "rgba(255, 246, 228, 0.82)";
    ctx.fillText("自动开火，走位生存，升级构筑。", WIDTH / 2, 314);

    ctx.textAlign = "left";
    const tips = [
      "WASD / 方向键移动",
      "靠近经验豆自动吸附",
      "升级时按 1 / 2 / 3 选择",
      "按 F 切换全屏",
      "撑过每 3 波一次的 Boss 进攻"
    ];
    ctx.font = "700 22px Manrope";
    for (let i = 0; i < tips.length; i += 1) {
      const y = 404 + i * 42;
      ctx.fillStyle = "rgba(255, 222, 162, 0.88)";
      ctx.fillText("•", 286, y);
      ctx.fillStyle = "#fff8eb";
      ctx.fillText(tips[i], 316, y);
    }

    const pulse = 0.5 + Math.sin(state.time * 3.2) * 0.5;
    ctx.fillStyle = `rgba(255, 146, 71, ${0.28 + pulse * 0.16})`;
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - 170, HEIGHT - 180, 340, 74, 999);
    ctx.fill();
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 26px Manrope";
    ctx.textAlign = "center";
    ctx.fillText("点击开始收割", WIDTH / 2, HEIGHT - 132);
    ctx.textAlign = "left";
  }

  function drawLevelUp() {
    drawHud();
    ctx.fillStyle = "rgba(29, 10, 5, 0.58)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd78a";
    ctx.font = "800 26px Manrope";
    ctx.fillText("Level Up", WIDTH / 2, 120);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 58px Alegreya";
    ctx.fillText("Choose Your Upgrade", WIDTH / 2, 180);
    ctx.font = "600 20px Manrope";
    ctx.fillStyle = "rgba(255,247,232,0.78)";
    ctx.fillText("按 1 / 2 / 3 或直接点击卡片", WIDTH / 2, 220);

    const top = 282;
    const cardWidth = 280;
    const gap = 32;
    const left = (WIDTH - (cardWidth * 3 + gap * 2)) / 2;
    state.upgradeChoices.forEach((choice, index) => {
      const x = left + index * (cardWidth + gap);
      const hovered = pointer.x >= x && pointer.x <= x + cardWidth && pointer.y >= top && pointer.y <= top + 260;
      ctx.fillStyle = hovered ? "rgba(101, 42, 18, 0.96)" : "rgba(61, 25, 13, 0.92)";
      ctx.strokeStyle = hovered ? "rgba(255, 213, 133, 0.76)" : "rgba(255, 232, 204, 0.16)";
      ctx.lineWidth = hovered ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(x, top, cardWidth, 260, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffd78a";
      ctx.font = "800 16px Manrope";
      ctx.fillText(`${index + 1}`, x + 30, top + 38);
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff8eb";
      ctx.font = "800 34px Alegreya";
      ctx.fillText(choice.title, x + 28, top + 90);
      ctx.fillStyle = "rgba(255, 220, 166, 0.9)";
      ctx.font = "800 16px Manrope";
      ctx.fillText(choice.subtitle, x + 28, top + 122);
      ctx.fillStyle = "rgba(255, 247, 232, 0.78)";
      ctx.font = "600 18px Manrope";
      const lines = wrapText(choice.detail, 216);
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + 28, top + 168 + lineIndex * 28);
      });
      ctx.textAlign = "center";
    });
    ctx.textAlign = "left";
  }

  function drawGameOver() {
    drawHud();
    ctx.fillStyle = "rgba(24, 9, 5, 0.6)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff0da";
    ctx.font = "800 72px Alegreya";
    ctx.fillText("Harvest Lost", WIDTH / 2, 250);
    ctx.font = "700 24px Manrope";
    ctx.fillStyle = "rgba(255,247,232,0.82)";
    ctx.fillText(`你撑到了第 ${state.wave} 波，击败 ${state.kills} 个敌人`, WIDTH / 2, 314);
    ctx.fillText("点击画面重新开始", WIDTH / 2, 356);

    ctx.fillStyle = "rgba(61, 25, 13, 0.92)";
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - 180, 408, 360, 106, 28);
    ctx.fill();
    ctx.fillStyle = "#ffd78a";
    ctx.font = "800 20px Manrope";
    ctx.fillText(`最终分数 ${state.score}`, WIDTH / 2, 458);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "600 18px Manrope";
    ctx.fillText("再来一局，看看这次能不能把构筑滚起来。", WIDTH / 2, 492);
    ctx.textAlign = "left";
  }

  function drawEntities(camera) {
    ctx.save();
    ctx.translate(HALF_W - camera.x, HALF_H - camera.y);

    for (const pickup of state.pickups) {
      const bob = Math.sin(pickup.phase) * 4;
      drawShadow(pickup.x, pickup.y + 18, 14, 8, 0.22);
      ctx.fillStyle = "rgba(255, 234, 151, 0.22)";
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y + bob, pickup.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff3b0";
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y + bob, pickup.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffbe1";
      ctx.beginPath();
      ctx.arc(pickup.x - 3, pickup.y - 3 + bob, pickup.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const projectile of state.projectiles) {
      drawShadow(projectile.x, projectile.y + 13, 14, 7, 0.18);
      ctx.fillStyle = `hsla(${projectile.hue} 100% 70% / 0.2)`;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `hsl(${projectile.hue} 100% 70%)`;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(projectile.x - 3, projectile.y - 3, projectile.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const enemy of state.enemies) {
      drawShadow(enemy.x, enemy.y + enemy.radius * 0.72, enemy.radius * 0.8, enemy.radius * 0.36, 0.2);
      const enemyGradient = ctx.createRadialGradient(
        enemy.x - enemy.radius * 0.28,
        enemy.y - enemy.radius * 0.3,
        enemy.radius * 0.2,
        enemy.x,
        enemy.y,
        enemy.radius * 1.15
      );
      enemyGradient.addColorStop(0, enemy.hitFlash > 0 ? "#fff8e1" : "#d8f59f");
      enemyGradient.addColorStop(0.45, enemy.hitFlash > 0 ? "#fff1cb" : enemy.color);
      enemyGradient.addColorStop(1, enemy.kind === "boss" ? "#1c0d09" : "rgba(31, 14, 8, 0.86)");
      ctx.fillStyle = enemyGradient;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(33, 12, 8, 0.32)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 241, 218, 0.18)";
      ctx.beginPath();
      ctx.arc(enemy.x - enemy.radius * 0.26, enemy.y - enemy.radius * 0.22, enemy.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();

      const eyeOffset = enemy.kind === "boss" ? 12 : 7;
      drawEye(enemy.x - eyeOffset, enemy.y - 4, 4);
      drawEye(enemy.x + eyeOffset, enemy.y - 4, 4);

      if (enemy.kind === "boss") {
        ctx.strokeStyle = "rgba(255, 226, 179, 0.36)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 10 + Math.sin(state.time * 4) * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 205, 142, 0.14)";
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 18, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(61, 31, 10, 0.48)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y + enemy.radius * 0.14, enemy.radius * 0.35, 0.25, Math.PI - 0.25);
        ctx.stroke();
      }

      const hpWidth = enemy.radius * 1.7;
      ctx.fillStyle = "rgba(24, 9, 4, 0.35)";
      ctx.beginPath();
      ctx.roundRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 18, hpWidth, 6, 999);
      ctx.fill();
      ctx.fillStyle = enemy.kind === "boss" ? "#ffd479" : "#a7ef7d";
      ctx.beginPath();
      ctx.roundRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 18, hpWidth * (enemy.hp / enemy.maxHp), 6, 999);
      ctx.fill();
    }

    const player = state.player;
    drawShadow(player.x, player.y + player.radius + 12, player.radius, player.radius * 0.44, 0.24);
    const playerGradient = ctx.createRadialGradient(player.x - 10, player.y - 18, 4, player.x, player.y, player.radius * 1.15);
    playerGradient.addColorStop(0, player.invuln > 0 ? "#fffdf1" : "#ffdfa3");
    playerGradient.addColorStop(0.4, player.invuln > 0 ? "#fff2cb" : "#d8a460");
    playerGradient.addColorStop(1, "#7f4d2c");
    ctx.fillStyle = playerGradient;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(64, 23, 11, 0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#f8e3b5";
    ctx.beginPath();
    ctx.arc(player.x - 10, player.y - 10, player.radius * 0.44, 0, Math.PI * 2);
    ctx.fill();
    drawEye(player.x - 8, player.y - 2, 5);
    drawEye(player.x + 8, player.y - 2, 5);
    ctx.strokeStyle = "#3b2016";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(player.x, player.y + 4, 11, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.strokeStyle = "#5d2f19";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(player.x - Math.cos(player.aimAngle) * 4, player.y - Math.sin(player.aimAngle) * 4);
    ctx.lineTo(player.x + Math.cos(player.aimAngle) * 38, player.y + Math.sin(player.aimAngle) * 38);
    ctx.stroke();
    ctx.strokeStyle = "#f3c577";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(player.x + Math.cos(player.aimAngle) * 10, player.y + Math.sin(player.aimAngle) * 10);
    ctx.lineTo(player.x + Math.cos(player.aimAngle) * 34, player.y + Math.sin(player.aimAngle) * 34);
    ctx.stroke();

    if (player.fireCooldown > player.fireRate * 0.7) {
      ctx.fillStyle = "rgba(255, 212, 118, 0.45)";
      ctx.beginPath();
      ctx.arc(player.x + Math.cos(player.aimAngle) * 42, player.y + Math.sin(player.aimAngle) * 42, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let o = 0; o < player.orbitals; o += 1) {
      const angle = state.time * 2.6 + (Math.PI * 2 * o) / Math.max(1, player.orbitals);
      const ox = player.x + Math.cos(angle) * 72;
      const oy = player.y + Math.sin(angle) * 72;
      drawShadow(ox, oy + 10, 16, 7, 0.16);
      ctx.fillStyle = "rgba(255, 200, 96, 0.22)";
      ctx.beginPath();
      ctx.arc(ox, oy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffcb60";
      ctx.beginPath();
      ctx.moveTo(ox, oy - 16);
      ctx.lineTo(ox + 11, oy);
      ctx.lineTo(ox, oy + 16);
      ctx.lineTo(ox - 11, oy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fff2c9";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    for (const particle of state.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawHud() {
    const player = state.player;
    ctx.save();
    drawRoundedPanel(24, 20, 374, 142, 26, "rgba(39, 13, 8, 0.78)", "rgba(255, 232, 202, 0.14)");
    ctx.fillStyle = "rgba(255, 191, 125, 0.14)";
    ctx.beginPath();
    ctx.roundRect(24, 20, 374, 142, 26);
    ctx.fill();

    ctx.fillStyle = "#fff3df";
    ctx.font = "800 16px Manrope";
    ctx.fillText("HARVEST STATUS", 44, 48);
    ctx.font = "800 28px Alegreya";
    ctx.fillText(`Wave ${state.wave}`, 44, 78);
    ctx.font = "700 14px Manrope";
    ctx.fillStyle = "rgba(255,245,230,0.74)";
    ctx.fillText(`Time ${state.runTime.toFixed(0)}s`, 44, 106);
    ctx.fillText(`Kills ${state.kills}`, 128, 106);
    ctx.fillText(`Score ${state.score}`, 206, 106);
    ctx.fillText(`Level ${state.level}`, 304, 106);

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.roundRect(44, 120, 312, 16, 999);
    ctx.fill();
    const hpBar = ctx.createLinearGradient(44, 0, 356, 0);
    hpBar.addColorStop(0, "#ff8a63");
    hpBar.addColorStop(1, "#ffcc70");
    ctx.fillStyle = hpBar;
    ctx.beginPath();
    ctx.roundRect(44, 120, 312 * (player.hp / player.maxHp), 16, 999);
    ctx.fill();
    ctx.fillStyle = "#fff7eb";
    ctx.font = "700 12px Manrope";
    ctx.fillText(`HP ${Math.ceil(player.hp)} / ${player.maxHp}`, 50, 132);

    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.beginPath();
    ctx.roundRect(44, 144, 312, 10, 999);
    ctx.fill();
    const xpBar = ctx.createLinearGradient(44, 0, 356, 0);
    xpBar.addColorStop(0, "#ffe474");
    xpBar.addColorStop(1, "#fff2b1");
    ctx.fillStyle = xpBar;
    ctx.beginPath();
    ctx.roundRect(44, 144, 312 * (player.xp / player.xpToLevel), 10, 999);
    ctx.fill();

    if (state.messageTimer > 0) {
      const label = state.bossAlive ? "Boss harvest incoming" : state.mode === "playing" ? `Wave ${state.wave} surges` : "Upgrade secured";
      ctx.textAlign = "center";
      ctx.font = "800 30px Alegreya";
      ctx.fillStyle = "rgba(74, 23, 4, 0.28)";
      ctx.fillText(label, WIDTH / 2 + 2, 84);
      ctx.fillStyle = "#fff8dd";
      ctx.fillText(label, WIDTH / 2, 80);
      ctx.textAlign = "left";
    }
    ctx.restore();
  }

  function drawMenu() {
    drawBackground({ x: WORLD.width / 2, y: WORLD.height / 2 });
    ctx.fillStyle = "rgba(19, 7, 4, 0.56)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawRoundedPanel(148, 82, WIDTH - 296, HEIGHT - 164, 36, "rgba(55, 18, 9, 0.9)", "rgba(255, 223, 184, 0.16)");
    ctx.fillStyle = "rgba(255, 191, 126, 0.08)";
    ctx.beginPath();
    ctx.roundRect(148, 82, WIDTH - 296, HEIGHT - 164, 36);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd37f";
    ctx.font = "800 20px Manrope";
    ctx.fillText("Garden Run", WIDTH / 2, 154);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 96px Alegreya";
    ctx.fillText("Spud Arena", WIDTH / 2, 248);
    ctx.font = "600 26px Manrope";
    ctx.fillStyle = "rgba(255, 246, 228, 0.82)";
    ctx.fillText("Auto-fire. Dodge hard. Build fast.", WIDTH / 2, 304);
    ctx.font = "600 17px Manrope";
    ctx.fillStyle = "rgba(255, 238, 213, 0.72)";
    ctx.fillText("A condensed survival run with cleaner rhythm and a heavier arcade look.", WIDTH / 2, 336);

    ctx.textAlign = "left";
    const tips = [
      "Move with WASD or the arrow keys",
      "XP cores vacuum in when you get close",
      "Use 1, 2, 3 or click to take upgrades",
      "Press F to toggle fullscreen",
      "Every third wave can spawn a boss harvest"
    ];
    ctx.font = "700 20px Manrope";
    for (let i = 0; i < tips.length; i += 1) {
      const y = 398 + i * 40;
      ctx.fillStyle = "rgba(255, 222, 162, 0.88)";
      ctx.fillText("•", 272, y);
      ctx.fillStyle = "#fff8eb";
      ctx.fillText(tips[i], 302, y);
    }

    const pulse = 0.5 + Math.sin(state.time * 3.2) * 0.5;
    ctx.fillStyle = `rgba(255, 146, 71, ${0.24 + pulse * 0.18})`;
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - 200, HEIGHT - 180, 400, 80, 999);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 219, 154, 0.42)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 26px Manrope";
    ctx.textAlign = "center";
    ctx.fillText("Click anywhere to start the harvest", WIDTH / 2, HEIGHT - 130);
    ctx.textAlign = "left";
  }

  function drawLevelUp() {
    drawHud();
    ctx.fillStyle = "rgba(29, 10, 5, 0.58)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd78a";
    ctx.font = "800 26px Manrope";
    ctx.fillText("Level Up", WIDTH / 2, 120);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 58px Alegreya";
    ctx.fillText("Choose Your Upgrade", WIDTH / 2, 180);
    ctx.font = "600 20px Manrope";
    ctx.fillStyle = "rgba(255,247,232,0.78)";
    ctx.fillText("Press 1, 2, 3 or click a card", WIDTH / 2, 220);

    const top = 282;
    const cardWidth = 280;
    const gap = 32;
    const left = (WIDTH - (cardWidth * 3 + gap * 2)) / 2;
    state.upgradeChoices.forEach((choice, index) => {
      const x = left + index * (cardWidth + gap);
      const hovered = pointer.x >= x && pointer.x <= x + cardWidth && pointer.y >= top && pointer.y <= top + 260;
      ctx.fillStyle = hovered ? "rgba(115, 48, 20, 0.98)" : "rgba(61, 25, 13, 0.92)";
      ctx.strokeStyle = hovered ? "rgba(255, 213, 133, 0.76)" : "rgba(255, 232, 204, 0.16)";
      ctx.lineWidth = hovered ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(x, top, cardWidth, 260, 28);
      ctx.fill();
      ctx.stroke();
      if (hovered) {
        ctx.fillStyle = "rgba(255, 205, 133, 0.08)";
        ctx.beginPath();
        ctx.roundRect(x, top, cardWidth, 260, 28);
        ctx.fill();
      }

      ctx.fillStyle = "#ffd78a";
      ctx.font = "800 16px Manrope";
      ctx.fillText(`${index + 1}`, x + 30, top + 38);
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff8eb";
      ctx.font = "800 34px Alegreya";
      ctx.fillText(choice.title, x + 28, top + 90);
      ctx.fillStyle = "rgba(255, 220, 166, 0.9)";
      ctx.font = "800 16px Manrope";
      ctx.fillText(choice.subtitle, x + 28, top + 122);
      ctx.fillStyle = "rgba(255, 247, 232, 0.78)";
      ctx.font = "600 18px Manrope";
      const lines = wrapText(choice.detail, 216);
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + 28, top + 168 + lineIndex * 28);
      });
      ctx.textAlign = "center";
    });
    ctx.textAlign = "left";
  }

  function drawGameOver() {
    drawHud();
    ctx.fillStyle = "rgba(24, 9, 5, 0.64)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff0da";
    ctx.font = "800 72px Alegreya";
    ctx.fillText("Harvest Lost", WIDTH / 2, 250);
    ctx.font = "700 24px Manrope";
    ctx.fillStyle = "rgba(255,247,232,0.82)";
    ctx.fillText(`You reached wave ${state.wave} and knocked out ${state.kills} enemies`, WIDTH / 2, 314);
    ctx.fillText("Click anywhere to jump back in", WIDTH / 2, 356);

    ctx.fillStyle = "rgba(61, 25, 13, 0.92)";
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - 190, 408, 380, 106, 28);
    ctx.fill();
    ctx.fillStyle = "#ffd78a";
    ctx.font = "800 20px Manrope";
    ctx.fillText(`Final score ${state.score}`, WIDTH / 2, 458);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "600 18px Manrope";
    ctx.fillText("Reset, reroll your upgrades, and try to build a nastier run.", WIDTH / 2, 492);
    ctx.textAlign = "left";
  }

  function drawConfigRow(label, value, x, y, width) {
    ctx.fillStyle = "rgba(255, 243, 224, 0.08)";
    ctx.beginPath();
    ctx.roundRect(x, y, width, 38, 14);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 224, 176, 0.78)";
    ctx.font = "700 14px Manrope";
    ctx.fillText(label, x + 14, y + 24);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff8eb";
    ctx.fillText(value, x + width - 14, y + 24);
    ctx.textAlign = "left";
  }

  function renderHud() {
    const player = state.player;
    const pack = getPack();
    ctx.save();
    drawRoundedPanel(24, 20, 390, 150, 26, "rgba(39, 13, 8, 0.78)", "rgba(255, 232, 202, 0.14)");
    ctx.fillStyle = "rgba(255, 191, 125, 0.14)";
    ctx.beginPath();
    ctx.roundRect(24, 20, 390, 150, 26);
    ctx.fill();

    ctx.fillStyle = "#fff3df";
    ctx.font = "800 16px Manrope";
    ctx.fillText(pack.hudStatus, 44, 48);
    ctx.font = "800 28px Alegreya";
    ctx.fillText(`${pack.waveLabel} ${state.wave}`, 44, 78);
    ctx.font = "700 14px Manrope";
    ctx.fillStyle = "rgba(255,245,230,0.74)";
    ctx.fillText(`${pack.timeLabel} ${state.runTime.toFixed(0)}s`, 44, 106);
    ctx.fillText(`${pack.killsLabel} ${state.kills}`, 144, 106);
    ctx.fillText(`${pack.scoreLabel} ${state.score}`, 238, 106);
    ctx.fillText(`${pack.levelLabel} ${state.level}`, 330, 106);

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.roundRect(44, 120, 320, 16, 999);
    ctx.fill();
    const hpBar = ctx.createLinearGradient(44, 0, 364, 0);
    hpBar.addColorStop(0, "#ff8a63");
    hpBar.addColorStop(1, "#ffcc70");
    ctx.fillStyle = hpBar;
    ctx.beginPath();
    ctx.roundRect(44, 120, 320 * (player.hp / player.maxHp), 16, 999);
    ctx.fill();
    ctx.fillStyle = "#fff7eb";
    ctx.font = "700 12px Manrope";
    ctx.fillText(`${pack.hpLabel} ${Math.ceil(player.hp)} / ${player.maxHp}`, 50, 132);

    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.beginPath();
    ctx.roundRect(44, 144, 320, 10, 999);
    ctx.fill();
    const xpBar = ctx.createLinearGradient(44, 0, 364, 0);
    xpBar.addColorStop(0, "#ffe474");
    xpBar.addColorStop(1, "#fff2b1");
    ctx.fillStyle = xpBar;
    ctx.beginPath();
    ctx.roundRect(44, 144, 320 * (player.xp / player.xpToLevel), 10, 999);
    ctx.fill();

    if (state.messageTimer > 0) {
      const label = state.bossAlive ? pack.bossIncoming : state.mode === "playing" ? pack.waveSurges(state.wave) : pack.upgradeSecured;
      ctx.textAlign = "center";
      ctx.font = "800 30px Alegreya";
      ctx.fillStyle = "rgba(74, 23, 4, 0.28)";
      ctx.fillText(label, WIDTH / 2 + 2, 84);
      ctx.fillStyle = "#fff8dd";
      ctx.fillText(label, WIDTH / 2, 80);
      ctx.textAlign = "left";
    }
    ctx.restore();
  }

  function renderStartScreen() {
    const pack = getPack();
    drawBackground({ x: WORLD.width / 2, y: WORLD.height / 2 });
    ctx.fillStyle = "rgba(18, 7, 4, 0.58)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawRoundedPanel(92, 72, WIDTH - 184, HEIGHT - 144, 40, "rgba(52, 17, 9, 0.9)", "rgba(255, 223, 184, 0.16)");
    ctx.fillStyle = "rgba(255, 184, 110, 0.06)";
    ctx.beginPath();
    ctx.roundRect(92, 72, WIDTH - 184, HEIGHT - 144, 40);
    ctx.fill();

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffd37f";
    ctx.font = "800 18px Manrope";
    ctx.fillText(pack.menu.kicker, 144, 140);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 92px Alegreya";
    ctx.fillText(pack.menu.title, 140, 240);
    ctx.font = "700 28px Manrope";
    ctx.fillStyle = "rgba(255, 245, 229, 0.9)";
    ctx.fillText(pack.menu.tagline, 144, 292);
    ctx.font = "600 18px Manrope";
    ctx.fillStyle = "rgba(255, 238, 213, 0.72)";
    ctx.fillText(pack.menu.subline, 144, 330);

    ctx.fillStyle = "#ffd37f";
    ctx.font = "800 16px Manrope";
    ctx.fillText(pack.menu.tipsTitle, 144, 396);
    const tips = settings.language === "zh"
      ? ["WASD 或方向键移动", "靠近经验核心自动吸附", "升级时可按 1 / 2 / 3 选择", "每三波可能出现 Boss"]
      : ["Move with WASD or arrow keys", "XP cores vacuum in when close", "Use 1 / 2 / 3 to lock upgrades", "Boss pressure spikes every third wave"];
    ctx.font = "700 19px Manrope";
    for (let i = 0; i < tips.length; i += 1) {
      const y = 438 + i * 38;
      ctx.fillStyle = "rgba(255, 222, 162, 0.9)";
      ctx.fillText("-", 144, y);
      ctx.fillStyle = "#fff8eb";
      ctx.fillText(tips[i], 166, y);
    }

    drawRoundedPanel(772, 130, 340, 270, 28, "rgba(71, 27, 14, 0.82)", "rgba(255, 222, 179, 0.14)");
    ctx.fillStyle = "#ffd37f";
    ctx.font = "800 16px Manrope";
    ctx.fillText(pack.menu.configTitle, 798, 164);
    drawConfigRow(pack.menu.language, getOptionLabel("languageOptions", settings.language) || (settings.language === "zh" ? "中文" : "English"), 798, 190, 288);
    drawConfigRow(pack.menu.difficulty, getOptionLabel("difficultyOptions", settings.difficulty), 798, 238, 288);
    drawConfigRow(pack.menu.detail, getOptionLabel("detailOptions", settings.detail), 798, 286, 288);
    drawConfigRow(pack.menu.shake, getOptionLabel("shakeOptions", settings.shake), 798, 334, 288);

    drawSickleSigil(948, 516, 1.18, 0.08);

    const pulse = 0.5 + Math.sin(state.time * 3.2) * 0.5;
    ctx.fillStyle = `rgba(255, 146, 71, ${0.24 + pulse * 0.18})`;
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - 230, HEIGHT - 150, 460, 80, 999);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 219, 154, 0.42)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 26px Manrope";
    ctx.fillText(pack.menu.start, WIDTH / 2, HEIGHT - 99);
    ctx.textAlign = "left";
  }

  function renderUpgradeScreen() {
    const pack = getPack();
    renderHud();
    ctx.fillStyle = "rgba(29, 10, 5, 0.62)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd78a";
    ctx.font = "800 26px Manrope";
    ctx.fillText(pack.levelUp.eyebrow, WIDTH / 2, 120);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "800 58px Alegreya";
    ctx.fillText(pack.levelUp.title, WIDTH / 2, 180);
    ctx.font = "600 20px Manrope";
    ctx.fillStyle = "rgba(255,247,232,0.78)";
    ctx.fillText(pack.levelUp.hint, WIDTH / 2, 220);

    const top = 282;
    const cardWidth = 280;
    const gap = 32;
    const left = (WIDTH - (cardWidth * 3 + gap * 2)) / 2;
    state.upgradeChoices.forEach((choice, index) => {
      const x = left + index * (cardWidth + gap);
      const copy = getUpgradeCopy(choice.id);
      const hovered = pointer.x >= x && pointer.x <= x + cardWidth && pointer.y >= top && pointer.y <= top + 260;
      ctx.fillStyle = hovered ? "rgba(115, 48, 20, 0.98)" : "rgba(61, 25, 13, 0.92)";
      ctx.strokeStyle = hovered ? "rgba(255, 213, 133, 0.76)" : "rgba(255, 232, 204, 0.16)";
      ctx.lineWidth = hovered ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(x, top, cardWidth, 260, 28);
      ctx.fill();
      ctx.stroke();
      if (hovered) {
        ctx.fillStyle = "rgba(255, 205, 133, 0.08)";
        ctx.beginPath();
        ctx.roundRect(x, top, cardWidth, 260, 28);
        ctx.fill();
      }
      ctx.fillStyle = "#ffd78a";
      ctx.font = "800 16px Manrope";
      ctx.fillText(`${index + 1}`, x + 30, top + 38);
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff8eb";
      ctx.font = "800 34px Alegreya";
      ctx.fillText(copy.title, x + 28, top + 90);
      ctx.fillStyle = "rgba(255, 220, 166, 0.9)";
      ctx.font = "800 16px Manrope";
      ctx.fillText(copy.subtitle, x + 28, top + 122);
      ctx.fillStyle = "rgba(255, 247, 232, 0.78)";
      ctx.font = "600 18px Manrope";
      const lines = wrapText(copy.detail, 216);
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + 28, top + 168 + lineIndex * 28);
      });
      ctx.textAlign = "center";
    });
    ctx.textAlign = "left";
  }

  function renderGameOverScreen() {
    const pack = getPack();
    renderHud();
    ctx.fillStyle = "rgba(24, 9, 5, 0.66)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff0da";
    ctx.font = "800 72px Alegreya";
    ctx.fillText(pack.gameOver.title, WIDTH / 2, 250);
    ctx.font = "700 24px Manrope";
    ctx.fillStyle = "rgba(255,247,232,0.82)";
    ctx.fillText(pack.gameOver.line(state.wave, state.kills), WIDTH / 2, 314);
    ctx.fillText(pack.gameOver.hint, WIDTH / 2, 356);
    ctx.fillStyle = "rgba(61, 25, 13, 0.92)";
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - 190, 408, 380, 106, 28);
    ctx.fill();
    ctx.fillStyle = "#ffd78a";
    ctx.font = "800 20px Manrope";
    ctx.fillText(pack.gameOver.score(state.score), WIDTH / 2, 458);
    ctx.fillStyle = "#fff8eb";
    ctx.font = "600 18px Manrope";
    ctx.fillText(pack.gameOver.subline, WIDTH / 2, 492);
    ctx.textAlign = "left";
  }

  function draw() {
    const camera = getCamera();
    drawBackground(camera);
    if (state.mode !== "menu") {
      drawEntities(camera);
      renderHud();
    }
    if (state.mode === "menu") {
      renderStartScreen();
    } else if (state.mode === "levelup") {
      renderUpgradeScreen();
    } else if (state.mode === "gameover") {
      renderGameOverScreen();
    }
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - lastFrame) / 1000);
    lastFrame = now;
    const steps = Math.max(1, Math.round(dt / STEP));
    for (let i = 0; i < steps; i += 1) {
      update(STEP);
    }
    draw();
    rafId = requestAnimationFrame(frame);
  }

  function advanceTime(ms) {
    const steps = Math.max(1, Math.round(ms / (STEP * 1000)));
    for (let i = 0; i < steps; i += 1) {
      update(STEP);
    }
    draw();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function updatePointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    pointer.x = (event.clientX - rect.left) * scaleX;
    pointer.y = (event.clientY - rect.top) * scaleY;
  }

  function handleCanvasClick() {
    if (state.mode === "menu") {
      state.mode = "playing";
      return;
    }
    if (state.mode === "gameover") {
      resetGame();
      return;
    }
    if (state.mode === "levelup") {
      const top = 282;
      const cardWidth = 280;
      const gap = 32;
      const left = (WIDTH - (cardWidth * 3 + gap * 2)) / 2;
      for (let i = 0; i < 3; i += 1) {
        const x = left + i * (cardWidth + gap);
        if (pointer.x >= x && pointer.x <= x + cardWidth && pointer.y >= top && pointer.y <= top + 260) {
          selectUpgrade(i);
          return;
        }
      }
    }
  }

  for (const button of ui.languageButtons) {
    button.addEventListener("click", () => {
      applySettings({ language: button.dataset.language });
    });
  }

  ui.difficultySelect.addEventListener("change", (event) => {
    applySettings({ difficulty: event.target.value });
  });
  ui.detailSelect.addEventListener("change", (event) => {
    applySettings({ detail: event.target.value });
  });
  ui.shakeSelect.addEventListener("change", (event) => {
    applySettings({ shake: event.target.value });
  });

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "f", "1", "2", "3", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
    }
    keys.add(key);

    if (key === "f") {
      toggleFullscreen();
    }
    if (state.mode === "menu" && (key === " " || key === "enter")) {
      state.mode = "playing";
    }
    if (state.mode === "levelup" && ["1", "2", "3"].includes(key)) {
      selectUpgrade(Number(key) - 1);
    }
    if (state.mode === "gameover" && (key === " " || key === "enter")) {
      resetGame();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  canvas.addEventListener("mousemove", updatePointerPosition);
  canvas.addEventListener("mousedown", (event) => {
    updatePointerPosition(event);
    pointer.down = true;
    handleCanvasClick();
  });
  window.addEventListener("mouseup", () => {
    pointer.down = false;
  });
  canvas.addEventListener("mouseleave", () => {
    pointer.down = false;
  });

  document.addEventListener("fullscreenchange", () => {
    draw();
  });

  window.render_game_to_text = function renderGameToText() {
    const payload = {
      note: "origin=(0,0) at top-left; +x moves right; +y moves down",
      mode: state.mode,
      settings,
      wave: state.wave,
      level: state.level,
      time: Number(state.runTime.toFixed(2)),
      score: state.score,
      kills: state.kills,
      player: {
        x: Number(state.player.x.toFixed(1)),
        y: Number(state.player.y.toFixed(1)),
        vx: Number(state.player.vx.toFixed(1)),
        vy: Number(state.player.vy.toFixed(1)),
        hp: Number(state.player.hp.toFixed(1)),
        maxHp: state.player.maxHp,
        xp: state.player.xp,
        xpToLevel: state.player.xpToLevel,
        fireCooldown: Number(state.player.fireCooldown.toFixed(2)),
        multishot: state.player.multishot,
        orbitals: state.player.orbitals
      },
      enemies: state.enemies.slice(0, 8).map((enemy) => ({
        kind: enemy.kind,
        x: Number(enemy.x.toFixed(1)),
        y: Number(enemy.y.toFixed(1)),
        hp: Number(enemy.hp.toFixed(1)),
        radius: enemy.radius
      })),
      projectiles: state.projectiles.slice(0, 8).map((projectile) => ({
        x: Number(projectile.x.toFixed(1)),
        y: Number(projectile.y.toFixed(1)),
        damage: projectile.damage
      })),
      pickups: state.pickups.slice(0, 8).map((pickup) => ({
        x: Number(pickup.x.toFixed(1)),
        y: Number(pickup.y.toFixed(1)),
        value: pickup.value
      })),
      upgrades: state.upgradeChoices.map((choice) => choice.id)
    };
    return JSON.stringify(payload);
  };

  window.advanceTime = advanceTime;
  updateStaticUi();
  draw();
  rafId = requestAnimationFrame(frame);

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
  });
}());
