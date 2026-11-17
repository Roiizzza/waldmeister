'use strict';
/* ================= STATE ================= */
const S = {
  state: 'menu', wave: 0, maxWave: 20, gold: 0, totalGold: 0, kills: 0, level: 1, xp: 0, xpNeed: 45, pendingLv: 0,
  camYaw: PI, camPitch: .4, camDist: 7.8, shake: 0, time: 0, vig: 0, hitstop: 0, magnetAll: false, deadT: 0
};
const player = {};
const enemies = [], arrows = [], eshots = [], pickups = [], timers = [], rings = [];
const W = { total: 0, queue: [], alive: 0, spawnCd: 0, prep: 0, cleared: false, clearT: 0, active: false, cap: 16 };
const K = {}, joy = { x: 0, y: 0 };
let pl = null, reticle = null;

const aspdNow = () => player.aspdMul * (player.od > 0 ? 1.7 : 1);
const dmgNow = () => player.baseDmg * player.dmgMul * (player.od > 0 ? 1.3 : 1);

function resetPlayer() {
  Object.assign(player, {
    x: 0, z: 0, vx: 0, vz: 0, kx: 0, kz: 0, yaw: PI, hp: 200, maxHp: 200, energy: 100, maxEnergy: 100, enRegen: 9, speed: 7.4,
    baseDmg: 22, dmgMul: 1, aspdMul: 1, spdMul: 1, armor: 0, cdr: 0, multi: 0, pierce: 0, ricochet: 0, crit: .08, fire: 0, vamp: 0,
    hasOD: false, od: 0, cd: [0, 0, 0, 0], atkT: 0, aim: 0, recoil: 0, dash: 0, dashV: 0, dashX: 0, dashZ: 1, invuln: 0, hurt: 0,
    moving: false, target: null, dead: false, tal: {}, speedNow: 0, moveX: 0, moveZ: 0
  });
}

/* ================= EFFECT HELPERS ================= */
function later(sec, fn) { timers.push({ t: sec, fn }); }
function ringFx(x, y, z, r, life, color) {
  const m = new THREE.Mesh(GEO.ring, new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9, side: THREE.DoubleSide }));
  m.position.set(x, y, z); m.scale.set(.3, 1, .3); scene.add(m); rings.push({ m, t: 0, life, r });
}
function updateRings(dt) {
  for (let i = rings.length - 1; i >= 0; i--) {
    const r = rings[i]; r.t += dt; const k = r.t / r.life;
    if (k >= 1) { scene.remove(r.m); r.m.material.dispose(); rings.splice(i, 1); continue; }
    const s = lerp(.3, r.r, 1 - Math.pow(1 - k, 2.2)); r.m.scale.set(s, 1, s); r.m.material.opacity = .9 * (1 - k);
  }
}
function shake(v) { S.shake = Math.max(S.shake, v); }
function healPlayer(v) {
  const p = player, before = p.hp; p.hp = Math.min(p.maxHp, p.hp + v);
  const d = p.hp - before;
  if (d > .5) { addFloater(p.x, 2.4, p.z, '+' + Math.round(d), '#5dff8a', 30); for (let i = 0; i < 12; i++) fxAdd.emit(p.x + rand(-.5, .5), rand(.2, 1.6), p.z + rand(-.5, .5), 0, rand(1, 2.5), 0, rand(.5, 1), .22, .3, 1, .4, 0, .5, .9); }
}
function addXp(v) {
  S.xp += v;
  while (S.xp >= S.xpNeed) {
    S.xp -= S.xpNeed; S.level++; S.xpNeed = Math.round(45 + 28 * (S.level - 1)); S.pendingLv++;
    ringFx(player.x, .15, player.z, 6, .7, 0x35e3ff); addFloater(player.x, 2.8, player.z, 'LEVEL UP!', '#35e3ff', 40);
    healPlayer(player.maxHp * .1); sparks(player.x, 1, player.z, 30, COL.cyan, 9, 1);
  }
}

/* ================= EXPLOSIONS ================= */
function explode(x, z, radius, dmg, selfDmg) {
  sfx('explode', 0); shake(.9); world.lights.flash.position.set(x, 2, z); world.lights.flash.intensity = 14;
  ringFx(x, .2, z, radius * 1.25, .5, 0xff9a3a); ringFx(x, .25, z, radius * .7, .3, 0xffe08a);
  for (let i = 0; i < 70; i++) {
    const a = rand(0, TAU), e = rand(.2, 1), sp = rand(3, 13) * e, up = rand(2, 11);
    const c = Math.random() < .5 ? COL.yellow : Math.random() < .6 ? COL.orange : COL.red;
    fxAdd.emit(x, .6, z, Math.cos(a) * sp, up, Math.sin(a) * sp, rand(.4, 1.1), rand(.35, .9), c[0], c[1], c[2], 9, 1.2, 1);
  }
  glowBurst(x, 1.2, z, 7, COL.orange, .35);
  sparks(x, .8, z, 40, COL.yellow, 14, 1); puff(x, .5, z, 14, 2.4, 1.6, [.12, .11, .1], 4);
  scorchMark(x, z, radius * .55);
  enemies.forEach(e => {
    if (e.dead || e.spawnT > 0) return;
    const d = Math.hypot(e.x - x, e.z - z);
    if (d < radius + e.r) {
      const f = 1 - clamp(d / (radius + e.r), 0, 1) * .55, nx = (e.x - x) / (d || 1), nz = (e.z - z) / (d || 1);
      damageEnemy(e, dmg * f, false, nx, nz, { kb: 11 / (e.type === 'brute' ? 4 : e.type === 'boss' ? 12 : 1) });
    }
  });
  const dp = Math.hypot(player.x - x, player.z - z);
  if (dp < radius) { if (hurtPlayer(selfDmg * (1 - dp / radius * .5), x, z)) { player.kx += (player.x - x) / (dp || 1) * 9; player.kz += (player.z - z) / (dp || 1) * 9; } }
  obstacles.slice().forEach(o => { if (o.explosive && !o.dead && Math.hypot(o.x - x, o.z - z) < radius) later(rand(.1, .28), () => explodeBarrel(o)); });
}
function explodeBarrel(o) { if (o.dead) return; o.dead = true; removeObstacle(o); explode(o.x, o.z, 6.5, 85 + S.wave * 9, 38); }

/* ================= PICKUPS ================= */
function dropPickup(kind, x, z, val) {
  const mesh = kind === 'coin' ? buildCoin() : buildXpOrb();
  const a = rand(0, TAU), sp = rand(1.5, 5);
  const k = { kind, x, y: 1, z, vx: Math.cos(a) * sp, vy: rand(5, 9), vz: Math.sin(a) * sp, val, mesh, t: 0, landed: false };
  mesh.position.set(x, 1, z); scene.add(mesh); pickups.push(k);
}
function updatePickups(dt) {
  const p = player;
  for (let i = pickups.length - 1; i >= 0; i--) {
    const k = pickups[i]; k.t += dt;
    if (!k.landed) {
      k.vy -= 24 * dt; k.x += k.vx * dt; k.z += k.vz * dt; k.y += k.vy * dt;
      k.x = clamp(k.x, -PLAY, PLAY); k.z = clamp(k.z, -PLAY, PLAY);
      if (k.y <= .4) { k.y = .4; if (Math.abs(k.vy) > 3) { k.vy *= -.35; k.vx *= .6; k.vz *= .6; } else { k.landed = true; } }
    }
    const dx = p.x - k.x, dz = p.z - k.z, d = Math.hypot(dx, dz);
    if (!p.dead && k.t > .35 && (S.magnetAll || d < 5.2)) {
      k.landed = true; const sp = (S.magnetAll ? 22 : 12) + (1 - Math.min(1, d / 6)) * 14;
      k.x += dx / d * sp * dt; k.z += dz / d * sp * dt; k.y = lerp(k.y, 1.1, Math.min(1, dt * 8));
    }
    if (d < 1 && k.t > .3 && !p.dead) {
      if (k.kind === 'coin') { S.gold += k.val; S.totalGold += k.val; sfx('coin', 50); } else { addXp(k.val); sfx('coin', 50); }
      const c = k.kind === 'coin' ? COL.gold : COL.cyan;
      for (let n = 0; n < 6; n++) fxAdd.emit(k.x, k.y, k.z, rand(-2, 2), rand(1, 3), rand(-2, 2), .4, .16, c[0], c[1], c[2], 6, 1, 1);
      scene.remove(k.mesh); pickups.splice(i, 1); continue;
    }
    k.mesh.position.set(k.x, k.y + (k.landed ? Math.sin(k.t * 4 + i) * .07 : 0), k.z);
    if (k.mesh.userData.spin) k.mesh.userData.spin.rotation.y += dt * 4;
  }
}

/* ================= DAMAGE ================= */
function damageEnemy(e, amt, crit, dx, dz, o) {
  if (e.dead || e.spawnT > 0) return;
  o = o || {};
  e.hp -= amt; e.flash = .14;
  addFloater(e.x, e.topY * (e.scale || 1) * .8, e.z, '-' + Math.round(amt), crit ? '#35e3ff' : o.burn ? '#ffb030' : '#ff8f3a', crit ? 46 : 30);
  if (!o.burn) {
    sparks(e.x, 1.1, e.z, crit ? 14 : 7, crit ? COL.cyan : COL.orange, crit ? 8 : 6);
    const kb = (o.kb !== undefined ? o.kb : (e.type === 'crawler' ? 3.5 : e.type === 'spitter' ? 2.6 : e.type === 'brute' ? .5 : .1)) * (crit ? 1.5 : 1);
    e.kvx += dx * kb; e.kvz += dz * kb;
    sfx(crit ? 'crit' : 'hit');
  }
  if (e.hp <= 0) killEnemy(e, crit);
}
function killEnemy(e, crit) {
  e.dead = true; e.dying = .6; W.alive--; S.kills++;
  if (e.tele) clearTele(e);
  const T = ET[e.type], coinVal = Math.round(10 + S.wave * 3);
  for (let i = 0; i < T.coins; i++) dropPickup('coin', e.x, e.z, coinVal);
  const orbs = e.isBoss ? 5 : 1; for (let i = 0; i < orbs; i++) dropPickup('xp', e.x, e.z, Math.round(T.xp / orbs));
  if (player.vamp > 0) healPlayer(player.vamp);
  player.energy = Math.min(player.maxEnergy, player.energy + 2.5);
  sfx('die', 30); puff(e.x, .6, e.z, e.isBoss ? 14 : 4, e.isBoss ? 3 : 1.2, 1, [.25, .08, .08], 3);
  for (let i = 0; i < (e.isBoss ? 60 : 16); i++) { const c = Math.random() < .5 ? COL.blood : COL.orange; fxAdd.emit(e.x, 1, e.z, rand(-5, 5), rand(1, 7), rand(-5, 5), rand(.4, .9), rand(.1, .25), c[0], c[1], c[2], 14, .5, 1); }
  if (e.isBoss) { shake(1); sfx('explode', 0); ringFx(e.x, .2, e.z, 12, .8, 0xffa040); explodeFx(e); S.hitstop = .25; }
  else if (crit) S.hitstop = Math.max(S.hitstop, .03);
}
function explodeFx(e) { world.lights.flash.position.set(e.x, 3, e.z); world.lights.flash.intensity = 16; glowBurst(e.x, 2, e.z, 12, COL.orange, .5); }
function hurtPlayer(dmg, sx, sz) {
  const p = player; if (p.dead || p.invuln > 0 || p.dash > 0) return false;
  dmg *= (1 - p.armor); p.hp -= dmg; p.invuln = .4; p.hurt = .25; S.vig = Math.max(S.vig, .8); shake(.4);
  addFloater(p.x, 2.5, p.z, '-' + Math.round(dmg), '#ff4a3a', 38); sfx('hurt', 80);
  sparks(p.x, 1.2, p.z, 12, COL.red, 6);
  if (p.hp <= 0) die();
  return true;
}
function die() {
  const p = player; p.hp = 0; p.dead = true; S.state = 'dead'; S.deadT = 0; sfx('over', 0); shake(.8);
  sparks(p.x, 1.2, p.z, 50, COL.cyan, 10, 1.2); ringFx(p.x, .2, p.z, 7, .7, 0xff4a3a);
}

/* ================= PLAYER ATTACKS ================= */
function spawnArrow(a, dmg, crit, extraPierce, bounceOverride) {
  const p = player, fire = p.fire > 0;
  const mesh = buildArrow(crit ? 0xffe48a : fire ? 0xffc58a : 0x9ff4ff, crit ? 0xffc040 : fire ? 0xff7a20 : 0x35e3ff);
  const dx = Math.sin(a), dz = Math.cos(a), x = p.x + dx * .9, z = p.z + dz * .9;
  mesh.position.set(x, 1.35, z); mesh.rotation.y = a; scene.add(mesh);
  arrows.push({ mesh, x, z, y: 1.35, dx, dz, sp: 34, dmg, crit, pierce: p.pierce + (extraPierce || 0), bounce: bounceOverride === undefined ? p.ricochet : bounceOverride, hit: [], life: 1.15, fire });
}
function shootBasic() {
  const p = player, t = p.target; if (!t) return;
  const a0 = Math.atan2(t.x - p.x, t.z - p.z), n = 1 + p.multi, per = n > 1 ? .72 : 1;
  for (let i = 0; i < n; i++) {
    const crit = Math.random() < p.crit, a = a0 + (i - (n - 1) / 2) * .11;
    spawnArrow(a, dmgNow() * per * (crit ? 2.2 : 1), crit);
  }
  p.recoil = 1; sfx('shoot', 30);
  glowBurst(p.x + Math.sin(a0) * 1.2, 1.4, p.z + Math.cos(a0) * 1.2, 1.2, COL.cyan, .12);
}
function useAbility(i) {
  const p = player; if (S.state !== 'playing' || p.dead) return;
  const a = AB[i];
  if (i === 3 && !p.hasOD) { sfx('deny', 200); showHint('Overdrive-Chip im Shop kaufen, um Fähigkeit 4 freizuschalten.', 3500); return; }
  if (p.cd[i] > 0 || p.energy < a.cost) { sfx('deny', 150); return; }
  p.energy -= a.cost; p.cd[i] = a.cd * (1 - p.cdr);
  if (i === 0) {
    const t = p.target, a0 = t ? Math.atan2(t.x - p.x, t.z - p.z) : p.yaw;
    for (let k = -3; k <= 3; k++) { const crit = Math.random() < p.crit; spawnArrow(a0 + k * .13, dmgNow() * .85 * (crit ? 2.2 : 1), crit, 1, 0); }
    p.aim = 1; p.recoil = 1; p.yaw = a0; sfx('shoot', 0); shake(.15);
  } else if (i === 1) {
    let dx = player.moveX, dz = player.moveZ;
    if (Math.hypot(dx, dz) < .1) { dx = Math.sin(p.yaw); dz = Math.cos(p.yaw); }
    const l = Math.hypot(dx, dz); p.dashX = dx / l; p.dashZ = dz / l; p.dash = .22; p.invuln = Math.max(p.invuln, .35);
    sfx('dash', 0); puff(p.x, .3, p.z, 6, 1, .6, COL.dust, 2);
  } else if (i === 2) {
    sfx('nova', 0); shake(.55);
    const R = 9.5; ringFx(p.x, .2, p.z, R, .55, 0x6ae0ff); ringFx(p.x, .3, p.z, R * .6, .35, 0xffffff);
    for (let k = 0; k < 64; k++) { const a = k / 64 * TAU, sp = rand(11, 17); fxAdd.emit(p.x, .4, p.z, Math.cos(a) * sp, rand(0, 1.5), Math.sin(a) * sp, rand(.3, .6), rand(.15, .3), .4, .9, 1, 3, 1.5, 1); }
    glowBurst(p.x, 1.2, p.z, 6, COL.cyan, .3);
    enemies.forEach(e => {
      if (e.dead || e.spawnT > 0) return; const d = Math.hypot(e.x - p.x, e.z - p.z);
      if (d < R + e.r) { const nx = (e.x - p.x) / (d || 1), nz = (e.z - p.z) / (d || 1); damageEnemy(e, dmgNow() * 3.2, false, nx, nz, { kb: e.type === 'brute' ? 4 : e.type === 'boss' ? 1.5 : 14 }); if (p.fire > 0) ignite(e); }
    });
    for (let k = eshots.length - 1; k >= 0; k--) { const s = eshots[k]; if (Math.hypot(s.x - p.x, s.z - p.z) < R) { sparks(s.x, s.y, s.z, 6, COL.green, 5); scene.remove(s.mesh); eshots.splice(k, 1); } }
    obstacles.slice().forEach(o => { if (o.explosive && !o.dead && Math.hypot(o.x - p.x, o.z - p.z) < R) later(rand(.1, .3), () => explodeBarrel(o)); });
  } else {
    p.od = 7; sfx('level', 0); ringFx(p.x, .2, p.z, 5, .6, 0xffc34f); sparks(p.x, 1, p.z, 40, COL.gold, 10, 1);
    addFloater(p.x, 3, p.z, 'OVERDRIVE', '#ffc34f', 38);
  }
}
function ignite(e) { e.burnT = 3; e.burnDps = dmgNow() * .3 * player.fire; }

/* ================= ARROWS / ENEMY SHOTS ================= */
function updateArrows(dt) {
  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i]; let dead = false;
    const sx = a.sp * dt;
    a.x += a.dx * sx; a.z += a.dz * sx; a.life -= dt;
    fxAdd.emit(a.x - a.dx * .4, a.y, a.z - a.dz * .4, 0, 0, 0, .22, a.crit ? .3 : .2, a.fire ? 1 : .3, a.fire ? .5 : .9, a.fire ? .15 : 1, 0, 0, .8);
    if (a.fire && Math.random() < .5) fxAdd.emit(a.x, a.y, a.z, rand(-.5, .5), rand(.5, 1.5), rand(-.5, .5), .35, .18, 1, .45, .1, -1, .5, .9);
    if (a.life <= 0 || Math.abs(a.x) > A - .4 || Math.abs(a.z) > A - .4) { sparks(a.x, a.y, a.z, 4, COL.cyan, 4, .4); dead = true; }
    if (!dead) for (let k = 0; k < obstacles.length; k++) {
      const o = obstacles[k];
      if (Math.hypot(a.x - o.x, a.z - o.z) < o.r * .85) { if (o.explosive) explodeBarrel(o); else { sparks(a.x, a.y, a.z, 6, COL.yellow, 5); sfx('hit', 60); } dead = true; break; }
    }
    if (!dead) for (let k = 0; k < enemies.length; k++) {
      const e = enemies[k];
      if (e.dead || e.spawnT > 0 || a.hit.indexOf(e) >= 0) continue;
      if (Math.hypot(a.x - e.x, a.z - e.z) < e.r + .3) {
        a.hit.push(e); damageEnemy(e, a.dmg, a.crit, a.dx, a.dz); if (a.fire) ignite(e);
        if (a.pierce > 0) a.pierce--;
        else if (a.bounce > 0) {
          let best = null, bd = 15;
          enemies.forEach(o => { if (o.dead || o.spawnT > 0 || a.hit.indexOf(o) >= 0) return; const d = Math.hypot(o.x - a.x, o.z - a.z); if (d < bd) { bd = d; best = o; } });
          if (best) { const l = Math.hypot(best.x - a.x, best.z - a.z); a.dx = (best.x - a.x) / l; a.dz = (best.z - a.z) / l; a.mesh.rotation.y = Math.atan2(a.dx, a.dz); a.bounce--; a.life = 1; a.dmg *= .8; sparks(a.x, a.y, a.z, 8, COL.cyan, 6); } else dead = true;
        } else dead = true;
        break;
      }
    }
    if (dead) { scene.remove(a.mesh); arrows.splice(i, 1); continue; }
    a.mesh.position.set(a.x, a.y, a.z);
  }
}
function enemyShot(x, z, dx, dz, sp, dmg, kind) {
  const boss = kind === 'boss';
  const mesh = buildOrb(boss ? 0xff7a3a : 0xb6ff4a, boss ? 0xff4a18 : 0x7cff2a, boss ? .38 : .3);
  mesh.position.set(x, 1.2, z); scene.add(mesh);
  eshots.push({ mesh, x, z, y: 1.2, dx, dz, sp, dmg, r: boss ? .5 : .4, life: 4.5, boss });
}
function updateEShots(dt) {
  const p = player;
  for (let i = eshots.length - 1; i >= 0; i--) {
    const s = eshots[i]; let dead = false;
    s.x += s.dx * s.sp * dt; s.z += s.dz * s.sp * dt; s.life -= dt;
    fxAdd.emit(s.x, s.y, s.z, rand(-.3, .3), rand(-.3, .3), rand(-.3, .3), .3, .28, s.boss ? 1 : .55, s.boss ? .4 : 1, s.boss ? .1 : .2, 0, 1, .8);
    if (s.life <= 0 || Math.abs(s.x) > A - .5 || Math.abs(s.z) > A - .5) dead = true;
    if (!dead) for (let k = 0; k < obstacles.length; k++) { const o = obstacles[k]; if (Math.hypot(s.x - o.x, s.z - o.z) < o.r) { dead = true; break; } }
    if (!dead && !p.dead && Math.hypot(s.x - p.x, s.z - p.z) < s.r + .45) {
      if (p.dash > 0 || p.invuln > 0) { /* pass through while invulnerable */ } else { hurtPlayer(s.dmg, s.x, s.z); dead = true; }
    }
    if (dead) { sparks(s.x, s.y, s.z, 8, s.boss ? COL.orange : COL.green, 5); scene.remove(s.mesh); eshots.splice(i, 1); continue; }
    s.mesh.position.set(s.x, s.y, s.z);
  }
}

/* ================= ENEMIES ================= */
const ET = {
  crawler: { hp: 42, speed: 5.6, r: .75, dmg: 9, xp: 8, coins: 1, topY: 1.3, build: buildCrawler, scale: 1 },
  spitter: { hp: 62, speed: 3.2, r: .5, dmg: 12, xp: 12, coins: 2, topY: 2.1, build: buildSpitter, scale: 1 },
  brute: { hp: 280, speed: 2.9, r: 1.15, dmg: 26, xp: 32, coins: 6, topY: 3.2, build: () => buildBrute(false), scale: 1 },
  boss: { hp: 950, speed: 2.4, r: 2.1, dmg: 38, xp: 160, coins: 28, topY: 3.3, build: () => buildBrute(true), scale: 1.75 }
};
function spawnEnemy(type, x, z, countsToWave) {
  const T = ET[type], hpMul = 1 + (S.wave - 1) * .17;
  const model = T.build(); const hp = T.hp * hpMul * (type === 'boss' ? 1 + S.wave * .05 : 1);
  const e = {
    type, x, z, hp, maxHp: hp, r: T.r, speed: T.speed * (1 + (S.wave - 1) * .012), curSpeed: 0, dmg: T.dmg * (1 + (S.wave - 1) * .05),
    model, mesh: model.root, yaw: Math.atan2(player.x - x, player.z - z), spawnT: .9, atkCd: rand(.2, .8), windup: 0, windupMax: 1, slam: 0, lunge: 0, flash: 0, _fv: -1,
    kvx: 0, kvz: 0, burnT: 0, burnDps: 0, burnTick: 0, dying: 0, dead: false, shootT: rand(1, 2.6), ringT: 3, ringOff: 0, isBoss: type === 'boss', topY: T.topY, scale: T.scale || 1,
    seed: rand(0, 6), tele: null, summoned: false
  };
  e.mesh.scale.setScalar(e.scale); e.mesh.position.set(x, -2.4, z); e.mesh.rotation.y = e.yaw;
  e.mesh.traverse(o => { if (o.isMesh) o.frustumCulled = true; });
  scene.add(e.mesh); enemies.push(e);
  if (countsToWave !== false) W.alive++; else { W.alive++; W.total++; }
  puff(x, .2, z, 8, 1.6, 1, COL.dust, 3); ringFx(x, .1, z, type === 'boss' ? 6 : 2.2, .6, 0xff5a3a); glowBurst(x, .5, z, 3, COL.red, .5);
  return e;
}
function makeTele(e, radius) {
  const g = new THREE.Group();
  const d = new THREE.Mesh(GEO.disc, new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: .32, depthWrite: false }));
  const r = new THREE.Mesh(GEO.ring, new THREE.MeshBasicMaterial({ color: 0xff6a3a, transparent: true, opacity: .95, depthWrite: false }));
  g.add(d, r); g.scale.set(radius, 1, radius); g.position.set(e.x, .07, e.z); scene.add(g); e.tele = { g, d, r };
}
function clearTele(e) { if (!e.tele) return; scene.remove(e.tele.g); e.tele.d.material.dispose(); e.tele.r.material.dispose(); e.tele = null; }
function startSlam(e, radius, wind) { e.windup = e.windupMax = wind; e.slamR = radius; makeTele(e, radius); }
function doSlam(e, radius, dmg) {
  clearTele(e); e.slam = .3; sfx('slam', 0); shake(e.isBoss ? .85 : .5);
  ringFx(e.x, .12, e.z, radius, .45, 0xffa040); puff(e.x, .2, e.z, 12, 1.6, 1, COL.dust, 4); sparks(e.x, .3, e.z, 20, COL.orange, 9);
  const p = player, d = Math.hypot(p.x - e.x, p.z - e.z);
  if (d < radius + .3) { if (hurtPlayer(dmg, e.x, e.z)) { p.kx += (p.x - e.x) / (d || 1) * 10; p.kz += (p.z - e.z) / (d || 1) * 10; } }
}
function updateEnemies(dt) {
  const p = player;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.dying > 0) {
      e.dying -= dt; const k = 1 - e.dying / .6;
      e.mesh.rotation.x = -k * 1.2; e.mesh.position.y = -k * k * 1.4; e.mesh.scale.setScalar(e.scale * (1 - Math.max(0, k - .6) * 1.5));
      if (e.dying <= 0) { scene.remove(e.mesh); enemies.splice(i, 1); }
      continue;
    }
    if (e.spawnT > 0) {
      e.spawnT -= dt; e.mesh.position.y = -Math.max(0, e.spawnT / .9) * 2.4;
      if (Math.random() < dt * 25) puff(e.x, .2, e.z, 1, 1, .6, COL.dust, 2);
      continue;
    }
    e.flash = Math.max(0, e.flash - dt);
    const fv = e.flash > 0 ? e.flash / .14 : 0;
    if (fv !== e._fv) { e._fv = fv; for (const m of e.model.flashMats) { m.emissive.setRGB(fv * .9, fv * .35, fv * .2); m.emissiveIntensity = 1; } }
    if (e.burnT > 0) {
      e.burnT -= dt; e.burnTick -= dt;
      if (Math.random() < dt * 30) fxAdd.emit(e.x + rand(-.4, .4), rand(.5, 1.8), e.z + rand(-.4, .4), 0, rand(1, 2), 0, .5, .25, 1, .45, .1, -1, .5, .9);
      if (e.burnTick <= 0) { e.burnTick = .5; damageEnemy(e, e.burnDps * .5, false, 0, 0, { burn: true }); if (e.dead) continue; }
    }
    const dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz) || .001, nx = dx / d, nz = dz / d;
    let vx = 0, vz = 0;
    e.atkCd -= dt; e.lunge = Math.max(0, e.lunge - dt); e.slam = Math.max(0, e.slam - dt);
    switch (e.type) {
      case 'crawler':
        vx = nx * e.speed; vz = nz * e.speed;
        if (d < 1.7 && e.atkCd <= 0 && !p.dead) { e.atkCd = .95; e.lunge = .2; if (hurtPlayer(e.dmg, e.x, e.z)) { sparks(p.x, 1.2, p.z, 6, COL.red, 5); } }
        if (e.lunge > 0) { vx = nx * 9; vz = nz * 9; }
        break;
      case 'spitter': {
        const dir = d < 8 ? -1 : d > 14 ? 1 : 0, side = Math.sin(S.time * .7 + e.seed) * 1.4;
        if (e.windup > 0) {
          e.windup -= dt;
          if (e.windup <= 0) {
            const l = Math.hypot(p.x - e.x, p.z - e.z) || 1, ex = e.x + nx * .8, ez = e.z + nz * .8;
            enemyShot(ex, ez, (p.x - e.x) / l, (p.z - e.z) / l, 12, e.dmg, 'spit'); sfx('spit', 30);
          }
        } else {
          vx = nx * dir * e.speed - nz * side; vz = nz * dir * e.speed + nx * side;
          e.shootT -= dt;
          if (e.shootT <= 0 && d < 28 && !p.dead) { e.windup = e.windupMax = .55; e.shootT = rand(1.9, 3); }
        }
        break;
      }
      case 'brute':
        if (e.windup > 0) { e.windup -= dt; if (e.tele) { e.tele.d.scale.setScalar(1 - e.windup / e.windupMax); e.tele.g.position.set(e.x, .07, e.z); } if (e.windup <= 0) doSlam(e, e.slamR, e.dmg); }
        else { vx = nx * e.speed; vz = nz * e.speed; if (d < 3.4 && e.atkCd <= 0 && !p.dead) { startSlam(e, 4, .85); e.atkCd = 2; } }
        break;
      case 'boss': {
        const rage = e.hp < e.maxHp * .35, sp = e.speed * (rage ? 1.4 : 1);
        if (e.windup > 0) { e.windup -= dt; if (e.tele) { e.tele.d.scale.setScalar(1 - e.windup / e.windupMax); e.tele.g.position.set(e.x, .07, e.z); } if (e.windup <= 0) doSlam(e, e.slamR, e.dmg); }
        else {
          vx = nx * sp; vz = nz * sp;
          if (d < 6 && e.atkCd <= 0 && !p.dead) { startSlam(e, 7, 1); e.atkCd = 3.2; }
          e.ringT -= dt;
          if (e.ringT <= 0 && !p.dead) {
            e.ringT = rage ? 2.4 : 3.4; const n = rage ? 22 : 15; e.ringOff += PI / n;
            for (let k = 0; k < n; k++) { const a = e.ringOff + k * TAU / n; enemyShot(e.x + Math.sin(a) * 2.2, e.z + Math.cos(a) * 2.2, Math.sin(a), Math.cos(a), 8.5, 13, 'boss'); }
            sfx('boss', 0); shake(.4); ringFx(e.x, .3, e.z, 5, .5, 0xff7a3a);
          }
          if (!e.summoned && e.hp < e.maxHp * .5) {
            e.summoned = true; showBanner('VERSTÄRKUNG', 'Der Boss ruft Crawler'); sfx('boss', 0);
            for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .4; spawnEnemy('crawler', clamp(e.x + Math.sin(a) * 6, -PLAY, PLAY), clamp(e.z + Math.cos(a) * 6, -PLAY, PLAY), false); }
          }
        }
        break;
      }
    }
    e.kvx *= Math.exp(-7 * dt); e.kvz *= Math.exp(-7 * dt);
    const heavy = e.type === 'brute' || e.type === 'boss';
    e.x += (vx + e.kvx) * dt; e.z += (vz + e.kvz) * dt;
    e.x = clamp(e.x, -PLAY, PLAY); e.z = clamp(e.z, -PLAY, PLAY);
    collideObstacles(e, Math.min(e.r * .8, 1.2));
    e.curSpeed = damp(e.curSpeed, Math.hypot(vx, vz), 10, dt);
    e.yaw = angDamp(e.yaw, Math.atan2(nx, nz), heavy ? 5 : 10, dt);
    e.mesh.position.set(e.x, 0, e.z); e.mesh.rotation.set(0, e.yaw, 0);
    e.model.anim(e, dt, S.time);
  }
  // separation
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i]; if (a.dead || a.spawnT > 0) continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j]; if (b.dead || b.spawnT > 0) continue;
      const dx = b.x - a.x, dz = b.z - a.z, min = (Math.min(a.r, 1.2) + Math.min(b.r, 1.2)) * .8, d2 = dx * dx + dz * dz;
      if (d2 < min * min && d2 > 1e-6) { const d = Math.sqrt(d2), k = (min - d) / d * .5; a.x -= dx * k; a.z -= dz * k; b.x += dx * k; b.z += dz * k; }
    }
    const pdx = a.x - p.x, pdz = a.z - p.z, pd = Math.hypot(pdx, pdz), pm = Math.min(a.r, 1.2) * .8 + .45;
    if (pd < pm && pd > 1e-4) { a.x += pdx / pd * (pm - pd); a.z += pdz / pd * (pm - pd); }
  }
}

/* ================= WAVES ================= */
function makeQueue(w) {
  const boss = w % 5 === 0, q = [];
  const cr = boss ? 3 + Math.floor(w / 2) : 4 + w + Math.floor(w * .4);
  const sp = w >= 2 ? Math.min(10, Math.floor(w * .55)) : 0, br = w >= 4 ? Math.floor((w - 1) / 3) : 0;
  for (let i = 0; i < cr; i++) q.push('crawler'); for (let i = 0; i < sp; i++) q.push('spitter'); for (let i = 0; i < br; i++) q.push('brute');
  for (let i = q.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [q[i], q[j]] = [q[j], q[i]]; }
  if (boss) q.unshift('boss');
  return q;
}
function startWave(n) {
  S.wave = n; W.queue = makeQueue(n); W.total = W.queue.length; W.alive = 0; W.active = true; W.cleared = false; W.prep = 2.4; W.spawnCd = 0; S.magnetAll = false;
  W.cap = MOBILE ? (n % 5 === 0 ? 9 : 11) : (n % 5 === 0 ? 13 : 16);
  const boss = n % 5 === 0;
  showBanner('WAVE ' + n, boss ? 'BOSS-WELLE' : n === 1 ? 'Stehenbleiben = schießen' : '');
  if (boss) sfx('boss', 0); else sfx('start', 0);
  let have = obstacles.filter(o => o.explosive).length;
  for (let i = have; i < 4; i++) { const s = freeSpot(8, .8, player.x, player.z); spawnBarrel(s.x, s.z); }
}
function startNextWave() { startWave(S.wave + 1); S.state = 'playing'; }
function waveCleared() {
  W.cleared = true; W.clearT = 2.6; S.magnetAll = true;
  const bonus = 60 + S.wave * 15; S.gold += bonus; S.totalGold += bonus;
  showBanner('WELLE GESCHAFFT', '+$ ' + bonus); sfx('level', 0);
  healPlayer(player.maxHp * .15);
  for (let i = eshots.length - 1; i >= 0; i--) { scene.remove(eshots[i].mesh); eshots.splice(i, 1); }
}
function updateWave(dt) {
  if (!W.active) return;
  if (W.prep > 0) { W.prep -= dt; return; }
  if (W.queue.length > 0) {
    W.spawnCd -= dt;
    if (W.spawnCd <= 0 && W.alive < W.cap) {
      const t = W.queue.shift(), s = freeSpot(12, 1.2, player.x, player.z);
      if (t === 'boss') spawnEnemy('boss', clamp(player.x + Math.sin(S.camYaw) * 16, -PLAY + 3, PLAY - 3), clamp(player.z + Math.cos(S.camYaw) * 16, -PLAY + 3, PLAY - 3)); else spawnEnemy(t, s.x, s.z);
      W.spawnCd = t === 'boss' ? 1.5 : .3;
    }
  } else if (W.alive <= 0 && !W.cleared) waveCleared();
  if (W.cleared) {
    W.clearT -= dt;
    if (W.clearT <= 0) { W.active = false; if (S.wave >= S.maxWave) { S.state = 'won'; showEnd(true); sfx('level', 0); } else openShop(); }
  }
}

/* ================= PLAYER UPDATE ================= */
function updatePlayer(dt) {
  const p = player;
  if (p.dead) return;
  let ix = (K.KeyD || K.ArrowRight ? 1 : 0) - (K.KeyA || K.ArrowLeft ? 1 : 0) + joy.x, iy = (K.KeyW || K.ArrowUp ? 1 : 0) - (K.KeyS || K.ArrowDown ? 1 : 0) + joy.y;
  const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
  const sy = Math.sin(S.camYaw), cy = Math.cos(S.camYaw);
  const mx = sy * iy - cy * ix, mz = cy * iy + sy * ix;
  p.moveX = mx; p.moveZ = mz;
  const wantsMove = il > .12;
  p.invuln = Math.max(0, p.invuln - dt); p.hurt = Math.max(0, p.hurt - dt); p.recoil = Math.max(0, p.recoil - dt * 6);
  p.od = Math.max(0, p.od - dt);
  for (let i = 0; i < 4; i++) p.cd[i] = Math.max(0, p.cd[i] - dt);
  p.energy = Math.min(p.maxEnergy, p.energy + p.enRegen * dt);
  if (p.dash > 0) {
    p.dash -= dt; p.vx = p.dashX * 26; p.vz = p.dashZ * 26;
    fxAdd.emit(p.x, 1, p.z, 0, 0, 0, .35, .7, .3, .85, 1, 0, 0, .7); fxAdd.emit(p.x, .5, p.z, rand(-1, 1), rand(0, 1), rand(-1, 1), .4, .3, .4, .9, 1, 0, 1, .8);
  } else {
    const sp = p.speed * p.spdMul * (p.od > 0 ? 1.15 : 1), k = wantsMove ? 14 : 18;
    p.vx = damp(p.vx, mx * sp, k, dt); p.vz = damp(p.vz, mz * sp, k, dt);
  }
  p.kx *= Math.exp(-9 * dt); p.kz *= Math.exp(-9 * dt);
  p.x += (p.vx + p.kx) * dt; p.z += (p.vz + p.kz) * dt;
  p.x = clamp(p.x, -PLAY, PLAY); p.z = clamp(p.z, -PLAY, PLAY);
  collideObstacles(p, .45);
  p.speedNow = Math.hypot(p.vx, p.vz);
  p.moving = wantsMove || p.dash > 0;
  // targeting
  let best = null, bd = 30 * 30;
  for (const e of enemies) { if (e.dead || e.spawnT > 0) continue; const d = (e.x - p.x) ** 2 + (e.z - p.z) ** 2; if (d < bd) { bd = d; best = e; } }
  p.target = best;
  // facing
  let wantYaw = p.yaw;
  if (p.moving && p.speedNow > .6) wantYaw = Math.atan2(p.vx, p.vz); else if (best) wantYaw = Math.atan2(best.x - p.x, best.z - p.z);
  p.yaw = angDamp(p.yaw, wantYaw, p.moving ? 16 : 22, dt);
  // shooting (stand still to shoot)
  const interval = .62 / aspdNow();
  p.atkT = Math.min(interval, p.atkT + dt);
  const aiming = !p.moving && best && p.dash <= 0;
  p.aim = damp(p.aim, aiming ? 1 : 0, aiming ? 18 : 12, dt);
  if (aiming && p.aim > .8 && p.atkT >= interval && Math.abs(angDiff(p.yaw, wantYaw)) < .35) { p.atkT = 0; shootBasic(); }
  if (p.od > 0 && Math.random() < dt * 50) fxAdd.emit(p.x + rand(-.4, .4), rand(.1, 1.8), p.z + rand(-.4, .4), 0, rand(.5, 2), 0, .6, .22, 1, .75, .2, -1, .4, .8);
  p.dashV = damp(p.dashV, p.dash > 0 ? 1 : 0, 18, dt);
  // footsteps dust
  if (p.speedNow > 5 && Math.random() < dt * 8) puff(p.x, .1, p.z, 1, .6, .5, COL.dust, 1);
}

/* ================= MAIN UPDATE ================= */
function updateGame(dt) {
  const p = player;
  updatePlayer(dt);
  updateEnemies(dt);
  updateArrows(dt); updateEShots(dt); updatePickups(dt); updateWave(dt);
  for (let i = timers.length - 1; i >= 0; i--) { timers[i].t -= dt; if (timers[i].t <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }
  if (S.pendingLv > 0 && S.state === 'playing' && !p.dead) openLevelUp();
}
function updateModels(dt) {
  const p = player;
  pl.root.position.set(p.x, 0, p.z); pl.root.rotation.y = p.yaw;
  if (p.dead) { S.deadT += dt; const k = Math.min(1, S.deadT / .7); pl.root.rotation.x = -k * 1.45; pl.root.position.y = k * .25; if (S.deadT > 1.8 && S.state === 'dead' && !hudCache.endShown) { hudCache.endShown = true; showEnd(false); } }
  else { pl.root.rotation.x = 0; pl.root.position.y = 0; }
  pl.anim({ speed: p.speedNow, aim: p.aim, recoil: p.recoil, dash: p.dashV, od: p.od > 0 }, dt, S.time);
  pl.setFlash(p.hurt > 0 ? p.hurt / .25 * .7 : (p.invuln > 0 && p.dash > 0 ? .25 : 0));
  // lock-on reticle
  const t = p.target;
  if (t && !p.dead && S.state === 'playing') {
    reticle.visible = true; const s = (t.r + .55) * (1 + Math.sin(S.time * 8) * .06);
    reticle.position.set(t.x, .08, t.z); reticle.scale.set(s, 1, s); reticle.rotation.y = S.time * 1.5;
  } else reticle.visible = false;
  world.lights.player.color.setHex(p.od > 0 ? 0xffb54a : 0x5fe0ff);
}
function updateCamera(dt) {
  const p = player;
  if (S.state === 'menu') { S.camYaw += dt * .12; }
  else if (S.state === 'shop' || S.state === 'dead' || S.state === 'won' || S.state === 'levelup') S.camYaw += dt * .06;
  if (K.KeyQ) S.camYaw += dt * 2.2; if (K.KeyE) S.camYaw -= dt * 2.2;
  S.shake = Math.max(0, S.shake - dt * 2.4); S.vig = Math.max(0, S.vig - dt * 2.2);
  const yaw = S.camYaw, pitch = S.camPitch, dist = S.camDist, cp = Math.cos(pitch), sp = Math.sin(pitch);
  const fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -Math.cos(yaw), rz = Math.sin(yaw);
  let cx = p.x - fx * cp * dist + rx * 1.15, cz = p.z - fz * cp * dist + rz * 1.15;
  const cy = 1.7 + sp * dist;
  cx = clamp(cx, -(A - 1.3), A - 1.3); cz = clamp(cz, -(A - 1.3), A - 1.3);
  const k = 1 - Math.exp(-14 * dt);
  camera.position.x += (cx - camera.position.x) * k; camera.position.y += (cy - camera.position.y) * k; camera.position.z += (cz - camera.position.z) * k;
  const sh = S.shake * .5;
  camera.position.x += rand(-sh, sh) * .3; camera.position.y += rand(-sh, sh) * .3; camera.position.z += rand(-sh, sh) * .3;
  camera.lookAt(p.x + fx * 4.5 + rx * 1.15, 1.1, p.z + fz * 4.5 + rz * 1.15);
}

/* ================= RUN CONTROL ================= */
function clearWorld() {
  [enemies, arrows, eshots, pickups].forEach(list => { list.forEach(o => scene.remove(o.mesh)); list.length = 0; });
  enemies.length = 0; enemies.forEach(() => { });
  rings.forEach(r => { scene.remove(r.m); }); rings.length = 0; timers.length = 0; floaters.length = 0;
}
function newRun() {
  // remove tele meshes of old enemies
  enemies.forEach(e => clearTele(e));
  clearWorld();
  obstacles.slice().forEach(o => { if (o.explosive) removeObstacle(o); });
  resetPlayer();
  Object.assign(S, { state: 'playing', wave: 0, gold: 0, totalGold: 0, kills: 0, level: 1, xp: 0, xpNeed: 45, pendingLv: 0, shake: 0, vig: 0, hitstop: 0, magnetAll: false, deadT: 0, camYaw: PI });
  Object.keys(shopLv).forEach(k => delete shopLv[k]);
  hudCache.endShown = false;
  W.queue = []; W.total = 0; W.alive = 0; W.active = false;
  $('hud').classList.remove('off');
  hideScreen('startScreen'); hideScreen('endScreen'); hideScreen('shopScreen'); hideScreen('levelScreen'); hideScreen('pauseScreen');
  pl.root.rotation.set(0, PI, 0); pl.root.position.set(0, 0, 0);
  startWave(1);
  showHint(MOBILE ? 'Links ziehen = bewegen · Loslassen = automatisch schießen · Rechts ziehen = Kamera' : 'Stehen bleiben = automatisch schießen · WASD bewegen · Maus ziehen = Kamera · 1 bis 4 Fähigkeiten', 12000);
}
function togglePause() {
  if (S.state === 'playing') { S.state = 'paused'; showScreen('pauseScreen'); }
  else if (S.state === 'paused') { S.state = 'playing'; hideScreen('pauseScreen'); }
}

/* ================= INPUT ================= */
window.addEventListener('keydown', e => {
  audioInit();
  if (S.state === 'levelup') {
    const m = /^Digit([1-3])$/.exec(e.code);
    if (m) { const c = $('levelScreen')._choices; if (c && c[+m[1] - 1]) pickTalent(c[+m[1] - 1].id); }
    return;
  }
  if (e.code === 'KeyP' || e.code === 'Escape') { togglePause(); return; }
  if (e.code === 'KeyM') { muted = !muted; return; }
  if (S.state !== 'playing') return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
  K[e.code] = true;
  if (e.repeat) return;
  if (e.code === 'Digit1') useAbility(0); else if (e.code === 'Digit2' || e.code === 'Space') useAbility(1); else if (e.code === 'Digit3') useAbility(2); else if (e.code === 'Digit4') useAbility(3);
});
window.addEventListener('keyup', e => { K[e.code] = false; });
window.addEventListener('blur', () => { for (const k in K) K[k] = false; if (S.state === 'playing') togglePause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.state === 'playing') togglePause(); });

const ptrs = {};
const cv = renderer.domElement;
cv.addEventListener('pointerdown', e => {
  audioInit();
  const touch = e.pointerType === 'touch', role = touch && e.clientX < window.innerWidth * .45 ? 'joy' : 'cam';
  ptrs[e.pointerId] = { role, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
  try { cv.setPointerCapture(e.pointerId); } catch (_) { }
  if (role === 'joy') { const j = $('joy'); j.classList.remove('hidden'); j.style.left = e.clientX + 'px'; j.style.top = e.clientY + 'px'; $('stick').style.transform = 'translate(0,0)'; }
});
cv.addEventListener('pointermove', e => {
  const q = ptrs[e.pointerId]; if (!q) return;
  const dx = e.clientX - q.x, dy = e.clientY - q.y; q.x = e.clientX; q.y = e.clientY;
  if (q.role === 'cam') { const k = MOBILE ? 1.35 : 1; S.camYaw -= dx * .0055 * k; S.camPitch = clamp(S.camPitch + dy * .0032 * k, .2, 1.1); }
  else {
    const r = Math.max(parseFloat(getComputedStyle(document.documentElement).fontSize) * 5.5, 56);
    let vx = (e.clientX - q.sx) / r, vy = (e.clientY - q.sy) / r; const l = Math.hypot(vx, vy); if (l > 1) { vx /= l; vy /= l; }
    joy.x = vx; joy.y = -vy; $('stick').style.transform = 'translate(' + (vx * r * .7) + 'px,' + (vy * r * .7) + 'px)';
  }
});
function endPtr(e) {
  const q = ptrs[e.pointerId]; if (!q) return;
  if (q.role === 'joy') { joy.x = joy.y = 0; $('joy').classList.add('hidden'); }
  delete ptrs[e.pointerId];
}
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { S.camDist = clamp(S.camDist + e.deltaY * .01, 6, 17); e.preventDefault(); }, { passive: false });
cv.addEventListener('contextmenu', e => e.preventDefault());
$('btnStart').addEventListener('click', () => { audioInit(); sfx('start', 0); newRun(); });
$('btnResume').addEventListener('click', () => { audioInit(); togglePause(); });
$('pauseScreen').addEventListener('click', e => { if (e.target.id === 'pauseScreen') togglePause(); });

/* ================= PORTRAIT (second tiny renderer, shows the head) ================= */
let portrait = null;
function initPortrait() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setSize(MOBILE ? 128 : 256, MOBILE ? 128 : 256, false); r.setClearColor(0x000000, 0); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
    $('portraitHost').appendChild(r.domElement);
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(26, 1, .1, 10);
    const model = buildPlayer(); sc.add(model.root);
    sc.add(new THREE.HemisphereLight(0x9bb4e0, 0x332a24, .8));
    const key = new THREE.DirectionalLight(0xffeedd, 1.5); key.position.set(1.5, 2.8, 2.5); sc.add(key);
    const rim = new THREE.PointLight(0x35e3ff, 1.2, 6); rim.position.set(-1, 2.2, -.5); sc.add(rim);
    cam.position.set(.45, 2.0, 1.25); cam.lookAt(0, 1.93, 0);
    model.anim({ speed: 0, aim: 0, recoil: 0, dash: 0 }, 0, 0);
    portrait = { r, sc, cam, model, t: 0 };
  } catch (e) { portrait = null; }
}
function updatePortrait(dt) {
  if (!portrait) return; portrait.t += dt; if (portrait.t < (MOBILE ? .25 : .1)) return; portrait.t = 0;
  const m = portrait.model; m.anim({ speed: 0, aim: 0, recoil: 0, dash: 0 }, .1, S.time); m.root.rotation.y = Math.sin(S.time * .6) * .25;
  m.setFlash(player.hurt > 0 ? .7 : 0); portrait.r.render(portrait.sc, portrait.cam);
}

/* ================= LOOP ================= */
let fpsAvg = 60, lowQ = false, lowT = 0, mmT = 0;
function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  setParticleScale(); resizeOverlay();
}
window.addEventListener('resize', onResize);
const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const real = Math.min(clock.getDelta(), .05); S.time += real;
  fpsAvg = fpsAvg * .95 + (1 / Math.max(real, .001)) * .05;
  if (!lowQ && S.state === 'playing') { lowT = fpsAvg < (MOBILE ? 38 : 32) ? lowT + real : 0; if (lowT > (MOBILE ? 2.5 : 4)) { lowQ = true; renderer.setPixelRatio(1); renderer.setSize(window.innerWidth, window.innerHeight); world.lights.moon.castShadow = false; setParticleScale(); showHint('Grafik automatisch reduziert, damit das Spiel flüssig läuft.', 4000); } }
  let dt = real;
  if (S.state === 'playing') { if (S.hitstop > 0) { S.hitstop -= real; dt = real * .15; } updateGame(dt); }
  updateModels(real); updateRings(real);
  fxAdd.update(real); fxSmoke.update(real);
  updateCamera(real);
  updateWorld(real, S.time, camera, player);
  if (S.state !== 'menu') {
    updateHUD(); drawOverlay(real);
    if ((mmT += real) > .033) { mmT = 0; drawMinimap(); }
  } else drawOverlay(real);
  updatePortrait(real);
  renderer.render(scene, camera);
}

/* ================= INIT ================= */
resetPlayer();
buildWorld();
pl = buildPlayer(); scene.add(pl.root);
pl.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
reticle = new THREE.Mesh(GEO.ring, new THREE.MeshBasicMaterial({ color: 0xff4a2a, transparent: true, opacity: .9, depthWrite: false })); reticle.visible = false; reticle.renderOrder = 2; scene.add(reticle);
buildAbilityUI(); initPortrait(); onResize();
camera.position.set(0, 6, 10);
requestAnimationFrame(frame);
