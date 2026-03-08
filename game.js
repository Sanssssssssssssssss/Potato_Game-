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

  const upgradeCatalog = [
    {
      id: "rapid-fire",
      title: "齿轮润滑",
      subtitle: "攻速强化",
      detail: "射击间隔缩短 18%。",
      apply: (state) => {
        state.player.fireRate *= 0.82;
      }
    },
    {
      id: "heavy-rounds",
      title: "压实弹丸",
      subtitle: "伤害强化",
      detail: "子弹伤害 +12。",
      apply: (state) => {
        state.player.damage += 12;
      }
    },
    {
      id: "greased-boots",
      title: "滚烫黄油",
      subtitle: "移动强化",
      detail: "移动速度 +12%。",
      apply: (state) => {
        state.player.speed *= 1.12;
      }
    },
    {
      id: "wide-burst",
      title: "双发发射",
      subtitle: "火力强化",
      detail: "每轮多发射 1 枚子弹。",
      apply: (state) => {
        state.player.multishot += 1;
      }
    },
    {
      id: "hot-soup",
      title: "热汤补给",
      subtitle: "续航强化",
      detail: "最大生命 +20，当前回复 20。",
      apply: (state) => {
        state.player.maxHp += 20;
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + 20);
      }
    },
    {
      id: "sniper-salt",
      title: "海盐瞄具",
      subtitle: "弹速强化",
      detail: "子弹速度 +18%，射程略增。",
      apply: (state) => {
        state.player.projectileSpeed *= 1.18;
        state.player.range += 60;
      }
    },
    {
      id: "thresher-ring",
      title: "旋耕护环",
      subtitle: "近战护体",
      detail: "生成一个环绕刀片。",
      apply: (state) => {
        state.player.orbitals += 1;
      }
    }
  ];

  function createState() {
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
      worldPulse: 0
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
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
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
    state.enemies.push({
      kind,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: preset.radius,
      speed: preset.speed + state.wave * (kind === "boss" ? 6 : 3),
      hp: preset.hp + state.wave * (kind === "boss" ? 42 : 8),
      maxHp: preset.hp + state.wave * (kind === "boss" ? 42 : 8),
      color: preset.color,
      xp: preset.xp,
      damage: preset.damage,
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
    state.cameraShake = Math.min(10, state.cameraShake + 2.4);
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

    state.spawnBank += dt * (1.6 + state.wave * 0.28);
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
        state.cameraShake = 18;
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
    const shake = state.cameraShake;
    return {
      x: targetX + rand(-shake, shake),
      y: targetY + rand(-shake, shake)
    };
  }

  function drawBackground(camera) {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#ffefcc");
    sky.addColorStop(0.4, "#f8c27b");
    sky.addColorStop(1, "#7d462c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const horizon = HEIGHT * 0.36;
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.beginPath();
    ctx.ellipse(WIDTH * 0.14, horizon - 40, 180, 72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(WIDTH * 0.82, horizon - 26, 160, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#aa643c";
    ctx.beginPath();
    ctx.moveTo(0, horizon + 16);
    for (let x = 0; x <= WIDTH; x += 120) {
      ctx.lineTo(x, horizon + Math.sin((x + state.worldPulse * 120) * 0.008) * 22);
    }
    ctx.lineTo(WIDTH, HEIGHT);
    ctx.lineTo(0, HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(HALF_W - camera.x, HALF_H - camera.y);

    const field = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    field.addColorStop(0, "#cc8f45");
    field.addColorStop(1, "#6f4026");
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    for (let x = 0; x < WORLD.width; x += 120) {
      ctx.strokeStyle = "rgba(83, 44, 23, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(state.worldPulse + x * 0.01) * 36, WORLD.height);
      ctx.stroke();
    }

    for (let y = 140; y < WORLD.height; y += 220) {
      ctx.fillStyle = "rgba(255, 239, 204, 0.08)";
      ctx.fillRect(0, y, WORLD.width, 16);
    }

    for (const splat of state.splats) {
      ctx.fillStyle = splat.color;
      ctx.beginPath();
      ctx.ellipse(splat.x, splat.y, splat.radius, splat.radius * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
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
      drawShadow(pickup.x, pickup.y + 16, 13, 7, 0.18);
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
      ctx.fillStyle = enemy.hitFlash > 0 ? "#fff8e1" : enemy.color;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 241, 218, 0.22)";
      ctx.beginPath();
      ctx.arc(enemy.x - enemy.radius * 0.26, enemy.y - enemy.radius * 0.22, enemy.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();

      const eyeOffset = enemy.kind === "boss" ? 12 : 7;
      ctx.fillStyle = "#1c0d09";
      ctx.beginPath();
      ctx.arc(enemy.x - eyeOffset, enemy.y - 4, 4, 0, Math.PI * 2);
      ctx.arc(enemy.x + eyeOffset, enemy.y - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      if (enemy.kind === "boss") {
        ctx.strokeStyle = "rgba(255, 226, 179, 0.36)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 10 + Math.sin(state.time * 4) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const player = state.player;
    drawShadow(player.x, player.y + player.radius + 10, player.radius * 0.95, player.radius * 0.42, 0.2);
    ctx.fillStyle = player.invuln > 0 ? "#fff9dd" : "#d5a15d";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4d4a5";
    ctx.beginPath();
    ctx.arc(player.x - 10, player.y - 10, player.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#322118";
    ctx.beginPath();
    ctx.arc(player.x - 8, player.y - 2, 5, 0, Math.PI * 2);
    ctx.arc(player.x + 8, player.y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#322118";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(player.x, player.y + 4, 11, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.strokeStyle = "#6c3a1e";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + Math.cos(player.aimAngle) * 34, player.y + Math.sin(player.aimAngle) * 34);
    ctx.stroke();

    for (let o = 0; o < player.orbitals; o += 1) {
      const angle = state.time * 2.6 + (Math.PI * 2 * o) / Math.max(1, player.orbitals);
      const ox = player.x + Math.cos(angle) * 72;
      const oy = player.y + Math.sin(angle) * 72;
      drawShadow(ox, oy + 10, 16, 7, 0.16);
      ctx.fillStyle = "#ffcb60";
      ctx.beginPath();
      ctx.moveTo(ox, oy - 16);
      ctx.lineTo(ox + 11, oy);
      ctx.lineTo(ox, oy + 16);
      ctx.lineTo(ox - 11, oy);
      ctx.closePath();
      ctx.fill();
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
    ctx.fillStyle = "rgba(45, 18, 10, 0.76)";
    ctx.strokeStyle = "rgba(255, 234, 204, 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(24, 22, 360, 126, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff5e6";
    ctx.font = "800 20px Manrope";
    ctx.fillText(`Wave ${state.wave}`, 44, 56);
    ctx.font = "700 16px Manrope";
    ctx.fillStyle = "rgba(255,245,230,0.76)";
    ctx.fillText(`Time ${state.runTime.toFixed(0)}s`, 44, 82);
    ctx.fillText(`Kills ${state.kills}`, 156, 82);
    ctx.fillText(`Score ${state.score}`, 244, 82);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.roundRect(44, 98, 300, 16, 999);
    ctx.fill();
    ctx.fillStyle = "#ff8762";
    ctx.beginPath();
    ctx.roundRect(44, 98, 300 * (player.hp / player.maxHp), 16, 999);
    ctx.fill();
    ctx.fillStyle = "#fff5e6";
    ctx.font = "700 13px Manrope";
    ctx.fillText(`HP ${Math.ceil(player.hp)} / ${player.maxHp}`, 48, 111);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.roundRect(44, 122, 300, 10, 999);
    ctx.fill();
    ctx.fillStyle = "#ffd966";
    ctx.beginPath();
    ctx.roundRect(44, 122, 300 * (player.xp / player.xpToLevel), 10, 999);
    ctx.fill();
    ctx.fillStyle = "rgba(255,245,230,0.78)";
    ctx.fillText(`Level ${state.level}`, 48, 142);

    if (state.messageTimer > 0) {
      const label = state.bossAlive ? "Boss incoming" : state.mode === "playing" ? `Harvest wave ${state.wave}` : "Upgrade chosen";
      ctx.textAlign = "center";
      ctx.font = "800 30px Alegreya";
      ctx.fillStyle = "rgba(74, 23, 4, 0.26)";
      ctx.fillText(label, WIDTH / 2 + 2, 82);
      ctx.fillStyle = "#fff8dd";
      ctx.fillText(label, WIDTH / 2, 78);
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

  function draw() {
    const camera = getCamera();
    drawBackground(camera);
    if (state.mode !== "menu") {
      drawEntities(camera);
      drawHud();
    }
    if (state.mode === "menu") {
      drawMenu();
    } else if (state.mode === "levelup") {
      drawLevelUp();
    } else if (state.mode === "gameover") {
      drawGameOver();
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
  draw();
  rafId = requestAnimationFrame(frame);

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
  });
}());
