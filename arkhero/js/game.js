'use strict';
/* ================= STATE ================= */
const S = {
  state: 'menu', wave: 0, maxWave: 20, gold: 0, totalGold: 0, kills: 0, level: 1, xp: 0, xpNeed: 45, pendingLv: 0,
  camYaw: PI, camPitch: .4, camDist: 7.8, shake: 0, time: 0, vig: 0, hitstop: 0, magnetAll: false, deadT: 0, camInputT: -99, fovKick: 0,
  ore: 0, rune: 0, oreBanked: 0, runeBanked: 0, inf: false, infT: 0, infSpawn: 0, infBoss: 0, infElite: 0, endless: false, map: 0, stage: 0, waveOff: 0, fogBase: .010, drops: [], stars: 0, winPaid: false, coresPaid: 0, lastHS: 0, fogTarget: .010
};
const player = {};

/* ===== Save, difficulty, weapons ===== */
const SAVE_KEY = 'arkhero.save.v1';
const save = { best: 0, bestKills: 0, gold: 0, meta: { life: 0, dmg: 0, gold: 0, xp: 0, aspd: 0, crit: 0, cdmg: 0, boss: 0, armor: 0, regen: 0, cdr: 0, rev: 0, mag: 0, start: 0, forge: 0 }, diff: 1, weapon: 0, stars: {}, sound: true, vib: true, joy: 1, daily: null, inv: [], eq: { weapon: 0, armor: 0, ring: 0, amulet: 0 }, nextId: 1, ore: 0, rune: 0, wlvl: [0, 0, 0, 0, 0], wfound: [true, false, false, false, false], quality: MOBILE ? 1 : 2, rain: false, tutDone: false, skill: 'volley' };
function loadSave() {
  try { const j = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (j) { Object.assign(save, j); save.meta = Object.assign({ life: 0, dmg: 0, gold: 0, xp: 0, aspd: 0, crit: 0, cdmg: 0, boss: 0, armor: 0, regen: 0, cdr: 0, rev: 0, mag: 0, start: 0, forge: 0 }, j.meta || {}); if (j.cores) { save.gold = (j.gold || 0) + j.cores * 40; } delete save.cores; save.eq = Object.assign({ weapon: 0, armor: 0, ring: 0, amulet: 0 }, j.eq || {}); { const ns = {}; for (const k in (save.stars || {})) { const m = /^(\d+)-(\d+)$/.exec(k); if (m) ns['L' + (+m[1] * 5 + +m[2])] = Math.max(ns['L' + (+m[1] * 5 + +m[2])] || 0, save.stars[k]); else ns[k] = save.stars[k]; } save.stars = ns; }
  if (!Array.isArray(save.wlvl) || save.wlvl.length < 5) save.wlvl = [0, 0, 0, 0, 0]; if (!Array.isArray(save.wfound) || save.wfound.length < 5) save.wfound = [true, false, false, false, false]; save.wfound[0] = true; save.inv.forEach(it => { if (it.set === undefined) it.set = it.id % 4; }); } } catch (_) { }
}
function vib(ms) { if (save.vib && MOBILE && navigator.vibrate) { try { navigator.vibrate(ms); } catch (_) { } } }
function applyAudioJoy() { muted = !save.sound; document.documentElement.style.setProperty('--js', [.8, 1, 1.3][save.joy] || 1); }
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) { } }
const DIFF = [{ name: 'Leicht', hp: 1.15, dmg: 1.0, rew: .8 }, { name: 'Normal', hp: 1.7, dmg: 1.6, rew: 1.2 }, { name: 'Schwer', hp: 2.5, dmg: 2.0, rew: 2 }];
const WEAPONS = [
  { id: 'pistol', name: 'Pistole', ic: 'pistol', desc: 'Startwaffe: zuverlässig, normale Feuerrate und Schaden.', dmg: 1, rate: 1, pierce: 0, n: 1, spr: 0, sp: 34, life: 1.15, arrow: 0xfff2b0, glow: 0xffc040, color: 0xffc040, thick: 1 },
  { id: 'smg', name: 'Maschinenpistole', ic: 'smg', desc: 'Sehr hohe Feuerrate, dafür schwache Kugeln mit leichter Streuung.', dmg: .42, rate: 2.5, pierce: 0, n: 1, spr: .09, sp: 36, life: 1.0, arrow: 0xc8ffd0, glow: 0x4aff7a, color: 0x4aff7a, thick: .8 },
  { id: 'shotgun', name: 'Schrotflinte', ic: 'shotgun', desc: 'Fünf Schrotkugeln im Fächer – stark auf kurze Distanz.', dmg: .5, rate: .62, pierce: 0, n: 5, spr: .5, sp: 30, life: .55, arrow: 0xffd6a0, glow: 0xff8a24, color: 0xff8a24, thick: .9 },
  { id: 'rifle', name: 'Sturmgewehr', ic: 'rifle', desc: 'Schnell und kräftig: starke Allround-Waffe.', dmg: .95, rate: 1.7, pierce: 0, n: 1, spr: .03, sp: 40, life: 1.3, arrow: 0x9ff4ff, glow: 0x35e3ff, color: 0x35e3ff, thick: 1 },
  { id: 'sniper', name: 'Scharfschützengewehr', ic: 'sniper', desc: 'Langsam, riesiger Schaden, Kugeln durchschlagen zwei Gegner.', dmg: 3.6, rate: .42, pierce: 2, n: 1, spr: 0, sp: 60, life: 1.5, arrow: 0xe0b8ff, glow: 0xb060ff, color: 0xb060ff, thick: 1.5 }
];
const curW = () => WEAPONS[S.weapon || 0] || WEAPONS[0];
const curWLv = () => save.wlvl[S.weapon || 0] || 0;
const eqCol = slot => { const it = save.inv.find(i => i.id === save.eq[slot]); return it ? RAR[it.rar].c : null; };
function applyWeaponVisual() {
  const lk = { gun: S.weapon || 0, armor: eqCol('armor'), ring: eqCol('ring'), amulet: eqCol('amulet') };
  [pl, portrait && portrait.model].forEach(m => { if (m && m.setLook) m.setLook(lk); });
  if (hero) hero.model.setLook({ gun: eqCol('weapon') ? 0 : -1, armor: lk.armor, ring: lk.ring, amulet: lk.amulet });
}
function applyQuality() {
  const q = save.quality;
  renderer.setPixelRatio(MOBILE ? (q >= 2 ? 1.25 : 1) : (q === 0 ? .85 : q === 1 ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)));
  renderer.setSize(window.innerWidth, window.innerHeight);
  world.lights.moon.castShadow = q > 0;
  FXM = q === 0 ? .4 : q === 1 ? .7 : 1;
  setParticleScale(); resizeOverlay();
}
const enemies = [], arrows = [], eshots = [], pickups = [], timers = [], rings = [];
const W = { total: 0, queue: [], alive: 0, spawnCd: 0, prep: 0, cleared: false, clearT: 0, active: false, cap: 16 };
const K = {}, joy = { x: 0, y: 0 };
let pl = null, reticle = null;

const aspdNow = () => player.aspdMul * curW().rate * (player.od > 0 ? 1.7 : 1);
const dmgNow = () => player.baseDmg * curW().dmg * (1 + .1 * curWLv()) * player.dmgMul * (player.od > 0 ? 1.3 : 1);

function resetPlayer() {
  Object.assign(player, {
    x: 0, z: 0, vx: 0, vz: 0, kx: 0, kz: 0, yaw: 0, hp: 200, maxHp: 200, energy: 100, maxEnergy: 100, enRegen: 9, speed: 7.4,
    baseDmg: 22, dmgMul: 1, aspdMul: 1, spdMul: 1, armor: 0, cdr: 0, multi: 0, pierce: 0, ricochet: 0, crit: .08, fire: 0, vamp: 0,
    hasOD: false, od: 0, cd: [0, 0, 0, 0], atkT: 0, aim: 0, recoil: 0, dash: 0, dashV: 0, dashX: 0, dashZ: 1, invuln: 0, hurt: 0,
    moving: false, target: null, dead: false, tal: {}, speedNow: 0, moveX: 0, moveZ: 0,
    skCd: 0, skMax: 1, dashCh: 2, dashMax: 2, dashRegen: 0, moved: 0, dashUsed: 0, skillUsed: 0, explode: 0, chain: 0, spread: 0, dbl: 0, wall: 0, homing: 0, freeze: 0, exec: 0
  });
  const m = save.meta;
  player.maxHp = Math.round(200 * (1 + .1 * m.life)); player.hp = player.maxHp;
  player.baseDmg = 22 * (1 + .06 * m.dmg); player.aspdMul = 1; player.pierce = 0;
  const g = gearStats();
  player.dmgMul *= 1 + g.dmg; player.maxHp = Math.round(player.maxHp * (1 + g.hp)); player.hp = player.maxHp; player.aspdMul *= 1 + g.aspd;
  player.crit += g.crit; player.armor = Math.min(.6, player.armor + g.armor); player.spdMul *= 1 + g.speed;
  player.aspdMul *= 1 + .04 * m.aspd; player.crit += .015 * m.crit; player.critMul = 2.2 + .12 * m.cdmg; player.armor = Math.min(.6, player.armor + .015 * m.armor);
  player.regen = .004 * m.regen; player.bossMul = 1 + .06 * m.boss; player.cdr += .06 * m.cdr; player.magR = 5.2 * (1 + .15 * m.mag);
}

/* ===== Tagesaufgaben ===== */
const TASKS = [{ id: 'kills', name: 'Besiege Gegner', goal: 120, reward: 500 }, { id: 'rooms', name: 'Schließe Räume ab', goal: 12, reward: 700 }, { id: 'stage', name: 'Gewinne eine Stage', goal: 1, reward: 1200, chest: true }];
function ensureDaily() { const d = new Date().toLocaleDateString('sv'); if (!save.daily || save.daily.date !== d) save.daily = { date: d, prog: { kills: 0, rooms: 0, stage: 0 }, claimed: {} }; return save.daily; }
function dailyAdd(id, n) { const d = ensureDaily(); d.prog[id] = (d.prog[id] || 0) + n; }
function dailyClaimable() { const d = ensureDaily(); return TASKS.some(t => d.prog[t.id] >= t.goal && !d.claimed[t.id]); }
function claimDaily(id) {
  const d = ensureDaily(), t = TASKS.find(x => x.id === id); if (!t || d.claimed[id] || d.prog[id] < t.goal) return null;
  d.claimed[id] = 1; save.gold += t.reward; let it = null; if (t.chest) it = giveItem(genItem(1, 3, true)); writeSave(); return it;
}

/* ===== Inventory / Gear ===== */
const SLOTS = [{ id: 'weapon', name: 'Waffe', ic: 'sword' }, { id: 'armor', name: 'Rüstung', ic: 'shield' }, { id: 'ring', name: 'Ring', ic: 'gem' }, { id: 'amulet', name: 'Amulett', ic: 'heart' }];
const RAR = [{ n: 'Gewöhnlich', c: '#aab4bd', m: 1, sell: 100 }, { n: 'Selten', c: '#4aa8ff', m: 1.5, sell: 260 }, { n: 'Episch', c: '#b66bff', m: 2.2, sell: 700 }, { n: 'Legendär', c: '#ffb23a', m: 3.2, sell: 1800 }];
const STATS = { dmg: ['Schaden', .08], hp: ['Leben', .1], aspd: ['Feuerrate', .06], crit: ['Krit-Chance', .04], armor: ['Rüstung', .03], speed: ['Tempo', .04] };
const PRIM = { weapon: ['dmg', 'crit'], armor: ['hp', 'armor'], ring: ['aspd', 'crit'], amulet: ['speed', 'hp'] };
const SETS = [{ n: 'Feuer' }, { n: 'Wind' }, { n: 'Eisen' }, { n: 'Jade' }];
const NAMES = { weapon: ['Zielfernrohr', 'Schalldämpfer', 'Laservisier', 'Magazin'], armor: ['Lamellenpanzer', 'Do-Brustplatte', 'Haori-Mantel', 'Kriegsharnisch'], ring: ['Siegelring', 'Jadering', 'Fokusring', 'Glücksring'], amulet: ['Omamori', 'Windtalisman', 'Drachenzahn', 'Glücksstein'] };
/* ===== Schmiede ===== */
const SMITH_MAX = 9, SMITH_RATE = [1, .95, .85, .75, .6, .45, .35, .25, .15];
const smithRate = l => Math.min(1, SMITH_RATE[l] + .02 * save.meta.forge);
const smithOre = l => 4 + 3 * l, smithRune = l => l >= 4 ? l - 3 : 0;
const smithSacNeed = l => l + 1;                       // für +N brauchst du N Opfergegenstände
const SAC_BONUS = .3;
function smithSacList(t) { // schwächste Gegenstände zuerst, nie das Ziel oder Angelegtes
  const need = smithSacNeed(t.get()), skip = new Set(SLOTS.map(sl => save.eq[sl.id])); if (t.it) skip.add(t.it.id);
  const c = save.inv.filter(i => !skip.has(i.id)).sort((a, b) => a.rar - b.rar || a.lvl - b.lvl || itemPower(a) - itemPower(b));
  return { need, have: c.length, pick: c.slice(0, need) };
}
function smithDo(t, sac) { // t: {get,set}; sac: true = Opfergaben einsetzen
  const l = t.get(), ore = smithOre(l), rune = smithRune(l);
  if (l >= SMITH_MAX || save.ore < ore || save.rune < rune) return null;
  let r = smithRate(l);
  if (sac) { const sl = smithSacList(t); if (sl.pick.length < sl.need) return null; const ids = new Set(sl.pick.map(i => i.id)); save.inv = save.inv.filter(i => !ids.has(i.id)); r = Math.min(1, r + SAC_BONUS); }
  save.ore -= ore; save.rune -= rune;
  const ok = Math.random() < r; t.set(ok ? l + 1 : Math.max(0, l - 1)); writeSave(); return ok;
}
const itemPower = it => Math.round(10 * RAR[it.rar].m * (1 + .2 * it.lvl));
function genItem(c, s, boss) {
  const p = s, r = Math.random();
  let rar = r < .02 + p * .006 ? 3 : r < .1 + p * .015 ? 2 : r < .35 + p * .02 ? 1 : 0;
  if (boss) rar = Math.max(rar, 1 + (c >= 2 ? 1 : 0));
  const slot = SLOTS[(Math.random() * 4) | 0].id, prim = PRIM[slot][0], sc = 1 + p * .06, st = {};
  st[prim] = +(STATS[prim][1] * RAR[rar].m * sc).toFixed(3);
  const keys = Object.keys(STATS).filter(k => k !== prim);
  for (let i = 0; i < rar; i++) { const k = keys.splice((Math.random() * keys.length) | 0, 1)[0]; st[k] = +(STATS[k][1] * RAR[rar].m * sc * .55).toFixed(3); }
  const pre = ['Rostiger', 'Solider', 'Feiner', 'Meisterlicher', 'Legendärer'][Math.min(4, rar + (p > 12 ? 1 : 0))];
  const set = (Math.random() * 4) | 0;
  return { id: save.nextId++, slot, rar, lvl: 0, st, set, name: pre + ' ' + NAMES[slot][(Math.random() * 4) | 0] };
}
function giveItem(it) { it.fresh = 1; save.inv.push(it); return it; }
function gearStats() {
  const g = { dmg: 0, hp: 0, aspd: 0, crit: 0, armor: 0, speed: 0 };
  const cnt = [0, 0, 0, 0];
  SLOTS.forEach(sl => { const it = save.inv.find(i => i.id === save.eq[sl.id]); if (it) { for (const k in it.st) g[k] += it.st[k] * (1 + .15 * it.lvl); if (it.set !== undefined) cnt[it.set]++; } });
  cnt.forEach(n => { if (n >= 2) { g.dmg += .08; g.hp += .08; } if (n >= 3) { g.aspd += .08; g.crit += .04; } if (n >= 4) { g.dmg += .15; g.hp += .1; } });
  return g;
}
function setInfo() { const cnt = [0, 0, 0, 0]; SLOTS.forEach(sl => { const it = save.inv.find(i => i.id === save.eq[sl.id]); if (it && it.set !== undefined) cnt[it.set]++; }); return cnt.map((n, i) => n >= 2 ? SETS[i].n + '-Set ' + n + '/4' : '').filter(Boolean); }
function gearScore() { let t = 0; SLOTS.forEach(sl => { const it = save.inv.find(i => i.id === save.eq[sl.id]); if (it) t += itemPower(it); }); return t; }
function stageWon() {
  S.state = 'won'; const s = S.stage, hpf = player.hp / player.maxHp, st = hpf >= .7 ? 3 : hpf >= .35 ? 2 : 1;
  S.stars = st; save.stars['L' + s] = Math.max(stageStars(s), st);
  dailyAdd('stage', 1); S.lastCores = payGold();
  for (let i = pickups.length - 1; i >= 0; i--) if (pickups[i].kind === 'gear') { collectGear(pickups[i]); pickups.splice(i, 1); } else if (pickups[i].kind === 'weapon') { collectWeapon(pickups[i]); pickups.splice(i, 1); }
  writeSave(); showEnd(true); sfx('level', 0);
}

/* ===== Maps / Stages ===== */
const MAPS = [
  { id: 'ruins', name: 'Ruinenstadt', tier: 'Stufe I', hp: 1, dmg: 1, col: '#5a7aa6', tint: null, mix: { splitter: 1.8, sniper: 1.7 }, fog: [0xa6bdd8, .010], ground: 0xffffff, wall: 0xffffff, sky: 0xffffff, hemi: [0xcfe0ff, 0x8a7a68], moon: 0xfff2dc, desc: 'Verlassene Stadt bei Nacht. Gemischte Gegner.', lamp: 0xffb060 },
  { id: 'desert', name: 'Glutwüste', tier: 'Stufe II', hp: 1.25, dmg: 1.15, col: '#d98a3a', tint: 0xffc890, mix: { bomber: 1.8, crawler: 1.2, charger: 2 }, fog: [0xe8c496, .009], ground: 0xf0c080, wall: 0xe4b070, sky: 0xffc890, hemi: [0xffe6c0, 0xa08050], moon: 0xffe0b0, desc: 'Heiße Dünen. Viele Selbstsprenger und schnelle Crawler.', lamp: 0xffcf80 },
  { id: 'ice', name: 'Frostfeld', tier: 'Stufe III', hp: 1.6, dmg: 1.3, col: '#6ab8ff', tint: 0xa8d4ff, mix: { shielder: 2, healer: 2, mage: 1.8, ghost: 1.6 }, fog: [0xd0e6ff, .012], ground: 0xd8ecff, wall: 0xc4e0fa, sky: 0xbfdcff, hemi: [0xe4f2ff, 0x8aa0c0], moon: 0xeaf6ff, desc: 'Eisige Weite. Schildträger und Heiler in Gruppen.', lamp: 0x6ac8ff },
  { id: 'lava', name: 'Aschekrater', tier: 'Stufe IV', hp: 2.1, dmg: 1.5, col: '#e0402a', tint: 0xff7a5a, mix: { brute: 2, spitter: 1.6, charger: 1.6, mage: 1.6 }, fog: [0xc07058, .010], ground: 0xe89078, wall: 0xc87860, sky: 0xffa070, hemi: [0xffd0a8, 0x9a5a40], moon: 0xffc898, desc: 'Glühender Vulkan. Schwere Brutes und Spitter.', lamp: 0xff6a30 }
];
const PATH_LEN = 30;
const PATH = (() => { const a = [0]; let sd = 7; for (let i = 1; i < PATH_LEN; i++) { sd = (sd * 1103515245 + 12345) & 0x7fffffff; let m = (sd >> 8) % MAPS.length; if (m === a[i - 1] || (i > 1 && m === a[i - 2] && ((sd >> 4) & 1))) m = (m + 1 + ((sd >> 12) % 3)) % MAPS.length; if (m === a[i - 1]) m = (m + 1) % MAPS.length; a.push(m); } return a; })();
const isWaveLvl = L => L % 4 === 3;
const stageWaves = L => isWaveLvl(L) ? 10 : 40;
const isBossLvl = L => L % 5 === 4;
const lvHp = L => 1 + L * .15, lvDmg = L => 1 + L * .065;
function stageStars(L) { return save.stars['L' + L] || 0; }
function stageUnlocked(L) { return L === 0 || stageStars(L - 1) > 0; }
function stageName(L) { return 'Level ' + (L + 1) + ' · ' + MAPS[PATH[L]].name; }
function applyTheme(i) {
  const T = MAPS[i], c = new THREE.Color();
  scene.fog.color.setHex(T.fog[0]); S.fogBase = T.fog[1]; S.fogTarget = T.fog[1];
  world.ground.material.color.setHex(T.ground); world.wallMats.forEach(m => m.color.setHex(T.wall));
  world.sky.material.color.setHex(T.sky);
  world.lampSprites.forEach(l => l.material.color.setHex(T.lamp || 0xffb060));
  world.hemi.color.setHex(T.hemi[0]); world.hemi.groundColor.setHex(T.hemi[1]); world.lights.moon.color.setHex(T.moon);
  world.lights.fire1.intensity = world.lights.fire2.intensity = i === 3 ? 2.6 : 1.6; world.hemi.intensity = i === 3 ? 1.9 : 1.6;
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
  S.xp += v * (1 + .08 * save.meta.xp);
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
  if (dmg > 0) enemies.forEach(e => {
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
  const mesh = kind === 'coin' ? buildCoin() : kind === 'ore' ? buildMat(false) : kind === 'rune' ? buildMat(true) : buildXpOrb();
  const a = rand(0, TAU), sp = rand(1.5, 5);
  const k = { kind, x, y: 1, z, vx: Math.cos(a) * sp, vy: rand(5, 9), vz: Math.sin(a) * sp, val, mesh, t: 0, landed: false };
  mesh.position.set(x, 1, z); scene.add(mesh); pickups.push(k);
}
function dropGear(x, z, it) {
  const mesh = buildGear(it), a = rand(0, TAU), sp = rand(1, 3);
  const k = { kind: 'gear', item: it, x, y: 1, z, vx: Math.cos(a) * sp, vy: rand(6, 8), vz: Math.sin(a) * sp, val: 0, mesh, t: 0, landed: false };
  mesh.position.set(x, 1, z); scene.add(mesh); pickups.push(k); sfx('level', 30);
  addFloater(x, 2.6, z, RAR[it.rar].n + 'e Beute!', RAR[it.rar].c, 28);
}
function dropWeapon(x, z, id) {
  const w = WEAPONS[id], mesh = buildGear({ rar: 3, slot: 'weapon' }), a = rand(0, TAU), sp = rand(1, 3);
  mesh.userData.spin.children.forEach(c => c.visible = false);
  const gm = buildGun(id); mesh.userData.spin.add(gm); mesh.scale.setScalar(1.5);
  const k = { kind: 'weapon', wid: id, x, y: 1, z, vx: Math.cos(a) * sp, vy: rand(6, 8), vz: Math.sin(a) * sp, val: 0, mesh, t: 0, landed: false };
  mesh.position.set(x, 1, z); scene.add(mesh); pickups.push(k); sfx('level', 30);
  addFloater(x, 2.8, z, w.name + '!', '#' + w.color.toString(16).padStart(6, '0'), 30);
}
function collectWeapon(k) {
  const w = WEAPONS[k.wid]; const isNew = !save.wfound[k.wid]; save.wfound[k.wid] = true; S.weapon = k.wid; applyWeaponVisual();
  sfx('level', 0); vib(40); addFloater(k.x, 2.4, k.z, (isNew ? 'NEU: ' : '') + w.name, '#' + w.color.toString(16).padStart(6, '0'), 26);
  for (let n = 0; n < 20; n++) fxAdd.emit(k.x, k.y, k.z, rand(-3, 3), rand(1, 5), rand(-3, 3), .6, .22, 1, .9, .5, 6, 1, 1);
  scene.remove(k.mesh); writeSave(); updateHUD && updateHUD();
}
function collectGear(k) {
  const it = giveItem(k.item); S.drops.push(it); sfx('level', 0); vib(30);
  addFloater(k.x, 2.2, k.z, it.name + (it.auto ? ' (verkauft)' : ''), RAR[it.rar].c, 30);
  for (let n = 0; n < 16; n++) fxAdd.emit(k.x, k.y, k.z, rand(-3, 3), rand(1, 5), rand(-3, 3), .6, .22, 1, .9, .5, 6, 1, 1);
  scene.remove(k.mesh); writeSave();
}
function updatePickups(dt) {
  const p = player;
  for (let i = pickups.length - 1; i >= 0; i--) {
    const k = pickups[i]; k.t += dt;
    if (!k.landed) {
      k.vy -= 24 * dt; k.x += k.vx * dt; k.z += k.vz * dt; k.y += k.vy * dt;
      k.x = clamp(k.x, -PXL, PXL); k.z = clamp(k.z, ZA + .5, ZB - .5);
      if (k.y <= .4) { k.y = .4; if (Math.abs(k.vy) > 3) { k.vy *= -.35; k.vx *= .6; k.vz *= .6; } else { k.landed = true; } }
    }
    const dx = p.x - k.x, dz = p.z - k.z, d = Math.hypot(dx, dz);
    if (!p.dead && k.t > .35 && (k.kind === 'gear' || k.kind === 'weapon' ? d < 2.6 : (S.magnetAll || d < player.magR))) {
      k.landed = true; const sp = (S.magnetAll && k.kind !== 'gear' ? 22 : 12) + (1 - Math.min(1, d / 6)) * 14;
      k.x += dx / d * sp * dt; k.z += dz / d * sp * dt; k.y = lerp(k.y, 1.1, Math.min(1, dt * 8));
    }
    if (d < (k.kind === 'gear' || k.kind === 'weapon' ? 1.3 : 1) && k.t > .3 && !p.dead) {
      if (k.kind === 'weapon') { collectWeapon(k); pickups.splice(i, 1); continue; }
      if (k.kind === 'gear') { collectGear(k); pickups.splice(i, 1); continue; }
      if (k.kind === 'coin') { S.gold += k.val; S.totalGold += k.val; sfx('coin', 50); }
      else if (k.kind === 'ore' || k.kind === 'rune') { S[k.kind] += k.val; sfx('coin', 50); addFloater(k.x, 1.8, k.z, k.kind === 'ore' ? '+1 Erz' : '+1 Rune', k.kind === 'ore' ? '#ffa850' : '#c890ff', 24); }
      else { addXp(k.val); sfx('coin', 50); }
      const c = k.kind === 'coin' ? COL.gold : k.kind === 'ore' ? [1, .6, .2] : k.kind === 'rune' ? [.7, .4, 1] : COL.cyan;
      for (let n = 0; n < 6; n++) fxAdd.emit(k.x, k.y, k.z, rand(-2, 2), rand(1, 3), rand(-2, 2), .4, .16, c[0], c[1], c[2], 6, 1, 1);
      scene.remove(k.mesh); pickups.splice(i, 1); continue;
    }
    k.mesh.position.set(k.x, k.y + (k.landed ? Math.sin(k.t * 4 + i) * .07 : 0), k.z);
    if (k.mesh.userData.spin) k.mesh.userData.spin.rotation.y += dt * 4;
    if (k.mesh.userData.beam) k.mesh.userData.beam.material.opacity = .22 + Math.sin(k.t * 3) * .07;
  }
}

/* ================= DAMAGE ================= */
function damageEnemy(e, amt, crit, dx, dz, o) {
  if (e.dead || e.spawnT > 0 || e.hidden) return;
  o = o || {};
  if (e.isBoss || e.elite) amt *= player.bossMul || 1;
  e.hp -= amt; e.flash = .14;
  if (!o.burn) { e.squash = .16; if (S.time - S.lastHS > .14) { S.lastHS = S.time; S.hitstop = Math.max(S.hitstop, crit ? .04 : .022); } }
  addFloater(e.x, e.topY * (e.scale || 1) * .8, e.z, '-' + Math.round(amt), crit ? '#35e3ff' : o.burn ? '#ffb030' : '#ff8f3a', crit ? 46 : 30);
  if (!o.burn) {
    sparks(e.x, 1.1, e.z, crit ? 14 : 7, crit ? COL.cyan : COL.orange, crit ? 8 : 6);
    const kb = (o.kb !== undefined ? o.kb : (e.type === 'crawler' ? 3.5 : e.type === 'spitter' ? 2.6 : e.type === 'brute' ? .5 : .1)) * (crit ? 1.5 : 1);
    e.kvx += dx * kb; e.kvz += dz * kb;
    sfx(crit ? 'crit' : 'hit');
  }
  if (e.hp <= 0) killEnemy(e, crit, dx, dz);
}
function killEnemy(e, crit, dx, dz) {
  dailyAdd('kills', 1);
  e.dead = true; e.dying = .6; W.alive--; S.kills++;
  if (e.tele) clearTele(e);
  if (e.aim) clearAim(e);
  const fl = e.type === 'brute' ? 2.5 : e.isBoss ? .5 : 9;
  e.kvx += (dx || 0) * fl; e.kvz += (dz || 0) * fl;
  const T = ET[e.type], DF = DIFF[save.diff], coinVal = Math.round((10 + dw() * 3) * DF.rew * (1 + .1 * save.meta.gold)), em = e.elite ? 3 : 1;
  for (let i = 0; i < Math.min(8, T.coins * em); i++) dropPickup('coin', e.x, e.z, coinVal);
  { const nOre = e.isBoss ? 6 : e.elite ? 2 : Math.random() < .22 + .03 * save.meta.ore ? 1 : 0, nRune = e.isBoss ? 3 : e.elite && Math.random() < .4 ? 1 : 0;
    for (let i = 0; i < nOre; i++) dropPickup('ore', e.x, e.z, 1); for (let i = 0; i < nRune; i++) dropPickup('rune', e.x, e.z, 1); }
  { const lv = S.inf ? Math.floor(S.infT / 25) : S.stage, n = e.isBoss ? 2 : (e.elite ? Math.random() < .4 : Math.random() < .02 + Math.min(.012, lv * .0008)) ? 1 : 0;
    for (let i = 0; i < n; i++) dropGear(e.x + rand(-.8, .8), e.z + rand(-.8, .8), genItem(0, lv, e.isBoss && i === 0)); }
  { const lv = S.inf ? Math.floor(S.infT / 25) : S.stage, ch = e.isBoss ? 1 : e.elite ? .3 : .012;
    if (Math.random() < ch) { const top = Math.min(4, 1 + Math.floor(lv / 2) + (e.isBoss ? 1 : 0)), id = 1 + Math.floor(Math.random() * top); if (id !== S.weapon) dropWeapon(e.x + rand(-.8, .8), e.z + rand(-.8, .8), id); } }
  if (e.type === 'splitter') for (let k = 0; k < 2; k++) spawnEnemy('slimelet', clamp(e.x + (k ? 1 : -1) * rand(.5, 1), -PXL, PXL), clamp(e.z + rand(-.8, .8), ZA + 1, ZB - 3), false);
  const orbs = e.isBoss ? 5 : 1; for (let i = 0; i < orbs; i++) dropPickup('xp', e.x, e.z, Math.round(T.xp * (e.elite ? 2 : 1) / orbs));
  if (player.explode > 0) later(.07, () => miniBlast(e.x, e.z, 3.4, dmgNow() * .9 * player.explode, true));
  if (player.spread > 0 && e.burnT > 0) { ringFx(e.x, .2, e.z, 5.5, .5, 0xff7a2a); enemies.forEach(o => { if (o !== e && !o.dead && o.spawnT <= 0 && Math.hypot(o.x - e.x, o.z - e.z) < 5.5) ignite(o); }); }
  if (player.vamp > 0) healPlayer(player.vamp);
  player.energy = Math.min(player.maxEnergy, player.energy + 2.5);
  sfx('die', 30); puff(e.x, .6, e.z, e.isBoss ? 14 : 4, e.isBoss ? 3 : 1.2, 1, [.25, .08, .08], 3);
  for (let i = 0; i < (e.isBoss ? 60 : 16); i++) { const c = Math.random() < .5 ? COL.blood : COL.orange; fxAdd.emit(e.x, 1, e.z, rand(-5, 5), rand(1, 7), rand(-5, 5), rand(.4, .9), rand(.1, .25), c[0], c[1], c[2], 14, .5, 1); }
  if (e.isBoss) { vib(90); shake(1); sfx('explode', 0); ringFx(e.x, .2, e.z, 12, .8, 0xffa040); explodeFx(e); S.hitstop = .25; }
  else if (crit) S.hitstop = Math.max(S.hitstop, .03);
}
function explodeFx(e) { world.lights.flash.position.set(e.x, 3, e.z); world.lights.flash.intensity = 16; glowBurst(e.x, 2, e.z, 12, COL.orange, .5); }
function hurtPlayer(dmg, sx, sz) {
  const p = player; if (p.dead || p.invuln > 0 || p.dash > 0) return false;
  dmg *= (1 - p.armor); p.hp -= dmg; p.invuln = .4; p.hurt = .25; S.vig = Math.max(S.vig, .8); shake(.4);
  addFloater(p.x, 2.5, p.z, '-' + Math.round(dmg), '#ff4a3a', 38); sfx('hurt', 80); vib(35);
  sparks(p.x, 1.2, p.z, 12, COL.red, 6);
  if (p.hp <= 0) die();
  return true;
}
function die() {
  const p = player;
  if (!S.revUsed) { p.hp = 1; S.state = 'revive'; p.vx = p.vz = 0; sfx('over', 0); shake(.5); showReviveAsk(); return; }
  trueDeath();
}
function trueDeath() {
  const p = player; p.hp = 0; p.dead = true; S.state = 'dead'; S.deadT = 0; sfx('over', 0); shake(.8);
  S.lastCores = payGold();
  sparks(p.x, 1.2, p.z, 50, COL.cyan, 10, 1.2); ringFx(p.x, .2, p.z, 7, .7, 0xff4a3a);
}
const revivePct = () => Math.min(1, .4 + .2 * save.meta.rev);
function doRevive() {
  const p = player; S.revUsed = true; S.state = 'playing'; p.dead = false; p.hp = Math.round(p.maxHp * revivePct()); p.invuln = 3; p.hurt = 0;
  hideScreen('reviveScreen');
  showBanner('WIEDERBELEBT', 'Mach weiter!'); sfx('level', 0); vib(60); S.vig = 0;
  ringFx(p.x, .2, p.z, 9, .8, 0x6dff9a); ringFx(p.x, .3, p.z, 5, .5, 0xffffff); sparks(p.x, 1.2, p.z, 40, COL.gold, 10, 1);
  enemies.forEach(e => { if (e.dead) return; const d = Math.hypot(e.x - p.x, e.z - p.z); if (d < 10) { const nx = (e.x - p.x) / (d || 1), nz = (e.z - p.z) / (d || 1); e.kvx += nx * (e.isBoss ? 6 : 22); e.kvz += nz * (e.isBoss ? 6 : 22); } });
  for (let k = eshots.length - 1; k >= 0; k--) { scene.remove(eshots[k].mesh); eshots.splice(k, 1); }
}

/* ================= PLAYER ATTACKS ================= */
function spawnArrow(a, dmg, crit, extraPierce, bounceOverride) {
  const p = player, fire = p.fire > 0;
  const wp = curW();
  const mesh = buildArrow(crit ? 0xffe48a : fire ? 0xffc58a : wp.arrow, crit ? 0xffc040 : fire ? 0xff7a20 : wp.glow);
  if (wp.thick !== 1) mesh.scale.set(wp.thick, wp.thick, 1);
  const dx = Math.sin(a), dz = Math.cos(a), x = p.x + dx * .9, z = p.z + dz * .9;
  mesh.position.set(x, 1.15, z); mesh.rotation.y = a; scene.add(mesh);
  arrows.push({ mesh, x, z, y: 1.15, dx, dz, sp: wp.sp, dmg, crit, pierce: p.pierce + wp.pierce + (extraPierce || 0), bounce: bounceOverride === undefined ? p.ricochet : bounceOverride, wall: p.wall, homing: p.homing > 0, hit: [], life: p.wall ? wp.life + .45 : wp.life, fire });
}
const volleys = [];
function fireVolley(first) {
  const p = player, t = p.target; if (p.dead) return;
  const w = curW(), a0 = t && !t.dead ? Math.atan2(t.x - p.x, t.z - p.z) : p.yaw, n = 1 + p.multi, per = (n > 1 ? .72 : 1) * (p.dbl ? .85 : 1);
  for (let i = 0; i < n; i++) {
    const crit = Math.random() < p.crit;
    for (let k = 0; k < w.n; k++) {
      const off = w.n > 1 ? (k - (w.n - 1) / 2) * (w.spr / (w.n - 1)) + rand(-.04, .04) : rand(-w.spr, w.spr);
      spawnArrow(a0 + (i - (n - 1) / 2) * .11 + off, dmgNow() * per * (crit ? player.critMul : 1), crit);
    }
  }
  p.recoil = 1; sfx('shoot', 30);
  glowBurst(p.x + Math.sin(a0) * 1.2, 1.4, p.z + Math.cos(a0) * 1.2, 1.2, COL.gold, .1);
}
function shootBasic() {
  const p = player; if (!p.target) return;
  fireVolley();
  for (let k = 1; k <= p.dbl; k++) volleys.push(.1 * k);
}
function updateVolleys(dt) {
  for (let i = volleys.length - 1; i >= 0; i--) { volleys[i] -= dt; if (volleys[i] <= 0) { volleys.splice(i, 1); if (player.target && !player.dead) fireVolley(); } }
}
const SKILLS = [
  { id: 'volley', name: 'Kugelhagel', ic: 'volley', cd: 9, desc: 'Ein Fächer aus 9 Kugeln in Zielrichtung.' },
  { id: 'nova', name: 'Schockwelle', ic: 'nova', cd: 14, desc: 'Schleudert Gegner weg, verursacht Schaden und löscht gegnerische Geschosse.' },
  { id: 'rage', name: 'Kampfrausch', ic: 'overdrive', cd: 22, desc: '7 Sekunden lang deutlich schneller schießen und laufen.' },
  { id: 'dash', name: 'Schattenschritt', ic: 'dash', cd: 6, desc: 'Blitzschneller Sprung mit kurzer Unverwundbarkeit.' },
  { id: 'heal', name: 'Heilsegen', ic: 'plus', cd: 30, desc: 'Heilt sofort 35 % deines Lebens.' }
];
const skillDef = () => SKILLS.find(k => k.id === save.skill) || SKILLS[0];
function useSkill() {
  const p = player; if (S.state !== 'playing' || p.dead) return;
  if (p.skCd > 0) { sfx('deny', 150); return; }
  const sk = skillDef(); p.skMax = p.skCd = sk.cd * (1 - Math.min(.5, p.cdr)); p.skillUsed++;
  if (sk.id === 'volley') {
    const t = p.target, a0 = t ? Math.atan2(t.x - p.x, t.z - p.z) : p.yaw;
    for (let k = -4; k <= 4; k++) { const crit = Math.random() < p.crit; spawnArrow(a0 + k * .12, dmgNow() * .9 * (crit ? player.critMul : 1), crit, 1, 0); }
    p.aim = 1; p.recoil = 1; p.yaw = a0; sfx('shoot', 0); shake(.2);
  } else if (sk.id === 'dash') {
    let dx = player.moveX, dz = player.moveZ;
    if (Math.hypot(dx, dz) < .1) { dx = Math.sin(p.yaw); dz = Math.cos(p.yaw); }
    const l = Math.hypot(dx, dz); p.dashX = dx / l; p.dashZ = dz / l; p.dash = .24; p.invuln = Math.max(p.invuln, .45);
    sfx('dash', 0); S.fovKick = 1; puff(p.x, .3, p.z, 6, 1, .6, COL.dust, 2);
  } else if (sk.id === 'nova') {
    sfx('nova', 0); shake(.55); S.fovKick = .8;
    const R = 9.5; ringFx(p.x, .2, p.z, R, .55, 0x6ae0ff); ringFx(p.x, .3, p.z, R * .6, .35, 0xffffff);
    for (let k = 0; k < 64; k++) { const a = k / 64 * TAU, sp = rand(11, 17); fxAdd.emit(p.x, .4, p.z, Math.cos(a) * sp, rand(0, 1.5), Math.sin(a) * sp, rand(.3, .6), rand(.15, .3), .4, .9, 1, 3, 1.5, 1); }
    glowBurst(p.x, 1.2, p.z, 6, COL.cyan, .3);
    enemies.forEach(e => {
      if (e.dead || e.spawnT > 0) return; const d = Math.hypot(e.x - p.x, e.z - p.z);
      if (d < R + e.r) { const nx = (e.x - p.x) / (d || 1), nz = (e.z - p.z) / (d || 1); damageEnemy(e, dmgNow() * 3, false, nx, nz, { kb: e.type === 'brute' ? 4 : e.isBoss ? 1.5 : 14 }); if (p.fire > 0) ignite(e); }
    });
    for (let k = eshots.length - 1; k >= 0; k--) { const s = eshots[k]; if (Math.hypot(s.x - p.x, s.z - p.z) < R) { sparks(s.x, s.y, s.z, 6, COL.green, 5); scene.remove(s.mesh); eshots.splice(k, 1); } }
    obstacles.slice().forEach(o => { if (o.explosive && !o.dead && Math.hypot(o.x - p.x, o.z - p.z) < R) later(rand(.1, .3), () => explodeBarrel(o)); });
  } else if (sk.id === 'rage') {
    p.od = 7; sfx('level', 0); ringFx(p.x, .2, p.z, 5, .6, 0xffc34f); sparks(p.x, 1, p.z, 40, COL.gold, 10, 1);
    addFloater(p.x, 3, p.z, 'KAMPFRAUSCH', '#ffc34f', 38);
  } else {
    healPlayer(p.maxHp * .35); sfx('heal', 0); ringFx(p.x, .2, p.z, 6, .6, 0x40ff7a); sparks(p.x, 1, p.z, 30, COL.green, 8, 1);
  }
}
function ignite(e) { e.burnT = 3; e.burnDps = dmgNow() * .3 * player.fire; }

/* ================= ARROWS / ENEMY SHOTS ================= */
/* ===== boss patterns: Ansturm, Fächer, Meteorregen ===== */
function bossPattern(e, nx, nz) {
  const p = player, k = (e.patI = (e.patI || 0) + 1) % 3;
  if (k === 0) { e.charge = { phase: 0, t: .9, dx: nx, dz: nz, hit: false }; showHint('Boss stürmt los – seitlich ausweichen!', 1800); sfx('boss', 0); }
  else if (k === 1) {
    for (let b = 0; b < 3; b++) later(b * .38, () => {
      if (e.dead || player.dead) return; const a0 = Math.atan2(player.x - e.x, player.z - e.z);
      for (let i = -2; i <= 2; i++) { const a = a0 + i * .22; enemyShot(e.x + Math.sin(a) * 2.2, e.z + Math.cos(a) * 2.2, Math.sin(a), Math.cos(a), 11, 14, 'boss'); }
      sfx('boss', 60);
    });
  } else {
    for (let i = 0; i < 5; i++) {
      const x = clamp(p.x + rand(-3.8, 3.8), -PXL, PXL), z = clamp(p.z + rand(-4, 4), ZA + 2, ZB - 3);
      later(i * .15, () => { ringFx(x, .1, z, 3, 1.1, 0xff3a2a); });
      later(1.1 + i * .15, () => { if (!e.dead) explode(x, z, 3, 0, 18 + dw()); });
    }
    showHint('Meteorregen!', 1500);
  }
}

/* ===== floor traps (Schockplatten) ===== */
function updateTraps(dt) {
  const p = player;
  world.traps.forEach(tr => {
    tr.t = (tr.t + dt) % 3; const ph = tr.t; let up = 0, glow = .15;
    if (ph >= 1.4 && ph < 2.3) glow = .2 + ((ph - 1.4) / .9) * .55 + Math.sin(S.time * 18) * .08;
    else if (ph >= 2.3 && ph < 2.9) { up = 1; glow = .9; }
    else if (ph >= 2.9) { up = 1 - (ph - 2.9) / .1; glow = .3; }
    if (ph < 2.3) tr.hit = false;
    tr.spikes.scale.y = Math.max(.01, up); tr.glowM.opacity = glow;
    if (up > .8 && !tr.hit && !p.dead && Math.abs(p.x - tr.x) < tr.w / 2 + .15 && Math.abs(p.z - tr.z) < tr.d / 2 + .15) {
      tr.hit = true; if (hurtPlayer(12 + dw() * 1.2, tr.x, tr.z)) { sparks(p.x, 1, p.z, 14, COL.cyan, 7); p.kz -= 5; }
    }
  });
}

/* ===== helper effects ===== */
function miniBlast(x, z, R, dmg, fire) {
  sfx('pop', 40); ringFx(x, .2, z, R, .35, fire ? 0xff7a2a : 0x6ae0ff); glowBurst(x, 1, z, 3, fire ? COL.orange : COL.cyan, .25);
  sparks(x, .8, z, 14, fire ? COL.orange : COL.cyan, 8, .6);
  enemies.forEach(o => { if (o.dead || o.spawnT > 0) return; const d = Math.hypot(o.x - x, o.z - z); if (d < R + o.r) damageEnemy(o, dmg, false, (o.x - x) / (d || 1), (o.z - z) / (d || 1), { kb: 6 }); });
}
function chainHit(from, dmg) {
  let cur = from, hit = [from]; const n = 1 + player.chain;
  for (let k = 0; k < n; k++) {
    let best = null, bd = 9;
    enemies.forEach(o => { if (o.dead || o.spawnT > 0 || hit.indexOf(o) >= 0) return; const d = Math.hypot(o.x - cur.x, o.z - cur.z); if (d < bd) { bd = d; best = o; } });
    if (!best) break;
    const steps = 6; for (let s = 0; s <= steps; s++) { const t = s / steps; fxAdd.emit(cur.x + (best.x - cur.x) * t + rand(-.3, .3), 1.3 + rand(-.2, .2), cur.z + (best.z - cur.z) * t + rand(-.3, .3), 0, 0, 0, .18, .35, .6, .9, 1, 0, 0, 1); }
    damageEnemy(best, dmg * .55, false, 0, 0, { kb: 0 }); hit.push(best); cur = best;
  }
  sfx('crit', 60);
}
function makeAim(e) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.16, 1), new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: .55, depthWrite: false }));
  m.rotation.x = -PI / 2; m.position.y = .09; m.renderOrder = 2; scene.add(m); e.aim = m;
}
function aimLine(e, ax, az, L, w, op) {
  if (!e.aim) makeAim(e);
  e.aim.scale.set(w, L, 1); e.aim.rotation.order = 'YXZ'; e.aim.rotation.set(-PI / 2, Math.atan2(ax, az) + PI, 0);
  e.aim.position.set(e.x + ax * L / 2, .09, e.z + az * L / 2); e.aim.material.opacity = op;
}
function clearAim(e) { if (!e.aim) return; scene.remove(e.aim); e.aim.geometry.dispose(); e.aim.material.dispose(); e.aim = null; }
function payGold() { // verdientes Gold wandert ins Konto für Dauer-Upgrades
  save.ore += S.ore - S.oreBanked; save.rune += S.rune - S.runeBanked; S.oreBanked = S.ore; S.runeBanked = S.rune;
  const rew = DIFF[save.diff].rew, c = Math.round(S.totalGold * .22 + (S.wave * 14 + (S.inf ? S.infT * 3 : 0) + S.kills * 1.2 + (S.state === 'won' ? 220 + S.stage * 90 : 0)) * rew), delta = Math.max(0, c - S.coresPaid);
  S.coresPaid = Math.max(c, S.coresPaid); save.gold += delta;
  if (S.inf) save.infBest = Math.max(save.infBest || 0, Math.floor(S.infT)); else save.best = Math.max(save.best, S.wave); save.bestKills = Math.max(save.bestKills, S.kills);
  writeSave(); return delta;
}

function updateArrows(dt) {
  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i]; let dead = false;
    if (a.homing) {
      let best = null, bd = 11;
      for (const o of enemies) { if (o.dead || o.spawnT > 0 || a.hit.indexOf(o) >= 0) continue; const d = Math.hypot(o.x - a.x, o.z - a.z); if (d < bd) { bd = d; best = o; } }
      if (best) {
        const cur = Math.atan2(a.dx, a.dz); let want = Math.atan2(best.x - a.x, best.z - a.z) - cur;
        while (want > Math.PI) want -= 6.283; while (want < -Math.PI) want += 6.283;
        const na = cur + Math.max(-3.2 * dt, Math.min(3.2 * dt, want)); a.dx = Math.sin(na); a.dz = Math.cos(na); a.mesh.rotation.y = na;
      }
    }
    const sx = a.sp * dt;
    a.x += a.dx * sx; a.z += a.dz * sx; a.life -= dt;
    fxAdd.emit(a.x - a.dx * .4, a.y, a.z - a.dz * .4, 0, 0, 0, .22, a.crit ? .3 : .2, a.fire ? 1 : .3, a.fire ? .5 : .9, a.fire ? .15 : 1, 0, 0, .8);
    if (a.fire && Math.random() < .5) fxAdd.emit(a.x, a.y, a.z, rand(-.5, .5), rand(.5, 1.5), rand(-.5, .5), .35, .18, 1, .45, .1, -1, .5, .9);
    if (a.wall > 0 && a.life > 0 && (Math.abs(a.x) > HW - .2 || a.z < ZA || a.z > ZB)) {
      if (Math.abs(a.x) > HW - .2) { a.x = Math.sign(a.x) * (HW - .25); a.dx = -a.dx; } else { a.z = a.z < ZA ? ZA + .05 : ZB - .05; a.dz = -a.dz; }
      a.wall--; a.life = Math.max(a.life, 1); a.mesh.rotation.y = Math.atan2(a.dx, a.dz); sparks(a.x, a.y, a.z, 6, COL.cyan, 6, .5); sfx('hit', 90);
    }
    if (a.life <= 0 || Math.abs(a.x) > HW - .2 || a.z < ZA || a.z > ZB) { sparks(a.x, a.y, a.z, 5, COL.cyan, 4, .4); if (a.life > 0) { puff(a.x, a.y, a.z, 2, .7, .5, COL.dust, 1.2); sparks(a.x, a.y, a.z, 4, COL.yellow, 5, .5); } dead = true; }
    if (!dead) for (let k = 0; k < obstacles.length; k++) {
      const o = obstacles[k];
      if (Math.hypot(a.x - o.x, a.z - o.z) < o.r * .85) { if (o.explosive) explodeBarrel(o); else { sparks(a.x, a.y, a.z, 6, COL.yellow, 5); sfx('hit', 60); } dead = true; break; }
    }
    if (!dead) for (let k = 0; k < enemies.length; k++) {
      const e = enemies[k];
      if (e.dead || e.spawnT > 0 || e.hidden || a.hit.indexOf(e) >= 0) continue;
      if (Math.hypot(a.x - e.x, a.z - e.z) < e.r + .3) {
        a.hit.push(e);
        if (e.type === 'shielder' && !e.shieldBroken && a.dx * Math.sin(e.yaw) + a.dz * Math.cos(e.yaw) < -.35) {
          sparks(a.x, a.y, a.z, 10, [.5, .8, 1], 7); addFloater(e.x, e.topY * e.scale * .8, e.z, 'BLOCK', '#8fd0ff', 26); sfx('clang', 40);
          damageEnemy(e, a.dmg * .1, false, 0, 0, { kb: 0 }); dead = true;
          e.shieldHp = (e.shieldHp === undefined ? 6 : e.shieldHp) - 1;
          if (e.shieldHp <= 0) {
            e.shieldBroken = true; e.stun = 2; if (e.model.shieldG) e.model.shieldG.visible = false;
            addFloater(e.x, e.topY * e.scale * 1.05, e.z, 'SCHILD ZERBROCHEN', '#ffd34f', 30); sparks(e.x + Math.sin(e.yaw) * .8, 1.2, e.z + Math.cos(e.yaw) * .8, 24, COL.yellow, 9, .8); ringFx(e.x, .2, e.z, 3, .4, 0x8fd0ff); sfx('boom', 80); shake(.2);
          } else addFloater(e.x, e.topY * e.scale * 1.05, e.z, 'Schild ' + e.shieldHp, '#8fd0ff', 20);
          break;
        }
        damageEnemy(e, a.dmg * (player.exec && e.hp < e.maxHp * .35 ? 1 + .5 * player.exec : 1), a.crit, a.dx, a.dz); if (a.fire) ignite(e);
        if (player.freeze) { e.slowT = 2; sparks(e.x, 1.2, e.z, 4, [.7, .93, 1], 4, .4); }
        if (player.chain > 0 && (a.crit || Math.random() < .3 * player.chain)) chainHit(e, a.dmg);
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
  const boss = kind === 'boss', sn = kind === 'snipe', mg = kind === 'magic';
  const mesh = buildOrb(boss ? 0xff7a3a : sn ? 0xff8a8a : mg ? 0xe0a0ff : 0xb6ff4a, boss ? 0xff4a18 : sn ? 0xff2020 : mg ? 0xb040ff : 0x7cff2a, boss ? .38 : sn ? .34 : .3);
  mesh.position.set(x, 1.2, z); scene.add(mesh);
  eshots.push({ mesh, x, z, y: 1.2, dx, dz, sp, dmg, r: boss ? .5 : .4, life: sn ? 3 : 4.5, boss });
}
function updateEShots(dt) {
  const p = player;
  for (let i = eshots.length - 1; i >= 0; i--) {
    const s = eshots[i]; let dead = false;
    s.x += s.dx * s.sp * dt; s.z += s.dz * s.sp * dt; s.life -= dt;
    fxAdd.emit(s.x, s.y, s.z, rand(-.3, .3), rand(-.3, .3), rand(-.3, .3), .3, .28, s.boss ? 1 : .55, s.boss ? .4 : 1, s.boss ? .1 : .2, 0, 1, .8);
    if (s.life <= 0 || Math.abs(s.x) > HW - .2 || s.z < ZA - 2 || s.z > ZB + 1) dead = true;
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
  boss: { hp: 950, speed: 2.4, r: 2.1, dmg: 38, xp: 160, coins: 28, topY: 3.3, build: () => buildBrute(true), scale: 1.75 },
  bomber: { hp: 32, speed: 7.2, r: .7, dmg: 24, xp: 6, coins: 1, topY: 1.6, build: buildBomber, scale: 1 },
  shielder: { hp: 175, speed: 3.3, r: .75, dmg: 16, xp: 22, coins: 4, topY: 2.1, build: () => buildSpitter('shield'), scale: 1.12 },
  sniper: { hp: 85, speed: 3.6, r: .55, dmg: 22, xp: 16, coins: 3, topY: 2.4, build: buildSniper, scale: 1 },
  charger: { hp: 240, speed: 3.4, r: 1.0, dmg: 24, xp: 26, coins: 5, topY: 2.0, build: buildCharger, scale: 1 },
  mage: { hp: 125, speed: 3.0, r: .55, dmg: 11, xp: 20, coins: 4, topY: 2.6, build: buildMage, scale: 1 },
  ghost: { hp: 80, speed: 4.2, r: .6, dmg: 17, xp: 18, coins: 3, topY: 2.2, build: buildGhost, scale: 1 },
  splitter: { hp: 170, speed: 3.0, r: .95, dmg: 13, xp: 18, coins: 3, topY: 1.8, build: () => buildSlime(false), scale: 1.25 },
  slimelet: { hp: 42, speed: 6.2, r: .5, dmg: 8, xp: 4, coins: 1, topY: 1.1, build: () => buildSlime(true), scale: .75 },
  healer: { hp: 78, speed: 3.1, r: .55, dmg: 0, xp: 18, coins: 3, topY: 2.1, build: () => buildSpitter('healer'), scale: 1 }
};
function spawnEnemy(type, x, z, countsToWave, elite) {
  const T = ET[type], DF = DIFF[save.diff], MP = MAPS[S.map], hpMul = (1 + (dw() - 1) * .23) * (S.inf ? (1 + S.infT / 40) * Math.pow(1.005, S.infT) : lvHp(S.stage));
  const model = T.build(); const hp = T.hp * hpMul * DF.hp * (type === 'boss' ? 1 + dw() * .05 : 1) * (elite ? 1.8 : 1);
  const e = {
    type, x, z, hp, maxHp: hp, r: T.r, speed: T.speed * (1 + Math.min(.5, (dw() - 1) * .016)), curSpeed: 0, dmg: T.dmg * (1 + (dw() - 1) * .07) * (S.inf ? (1 + S.infT / 100) * Math.pow(1.002, S.infT) : lvDmg(S.stage)) * DF.dmg * (elite ? 1.2 : 1),
    model, mesh: model.root, yaw: Math.atan2(player.x - x, player.z - z), spawnT: .9, atkCd: rand(.2, .8), windup: 0, windupMax: 1, slam: 0, lunge: 0, flash: 0, _fv: -1,
    kvx: 0, kvz: 0, burnT: 0, burnDps: 0, burnTick: 0, dying: 0, dead: false, shootT: rand(1, 2.6), ringT: 3, ringOff: 0, isBoss: type === 'boss', topY: T.topY, scale: (T.scale || 1) * (elite ? 1.22 : 1),
    seed: rand(0, 6), castT: 0, fireT: 0, spin: 0, ch: null, hidden: false, ghostA: .8, gph: 0, blinkT: rand(2, 3.5), stun: 0, tele: null, summoned: false, elite: !!elite, squash: 0, aim: null
  };
  if (elite) { const au = glowSprite(0xffc23a, 3.4, .6); au.position.y = 1.2; e.mesh.add(au); }
  if (MP.tint) { const tc = new THREE.Color(MP.tint); e.mesh.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && !o.material._tinted) { o.material.color.multiply(tc); o.material._tinted = 1; } }); }
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
      e.kvx *= Math.exp(-4 * dt); e.kvz *= Math.exp(-4 * dt); e.x = clamp(e.x + e.kvx * dt, -PXL, PXL); e.z = clamp(e.z + e.kvz * dt, ZA + 1, ZB - 2); e.mesh.position.x = e.x; e.mesh.position.z = e.z;
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
          if (!e.aim) makeAim(e);
          { const L = 26; e.aim.scale.set(1, L, 1); e.aim.rotation.order = 'YXZ'; e.aim.rotation.set(-PI / 2, Math.atan2(nx, nz) + PI, 0); e.aim.position.set(e.x + nx * L / 2, .09, e.z + nz * L / 2); e.aim.material.opacity = .25 + (1 - e.windup / e.windupMax) * .5; }
          if (e.windup <= 0) {
            clearAim(e);
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
      case 'bomber':
        if (e.windup > 0) {
          e.windup -= dt; vx = nx * e.speed * .2; vz = nz * e.speed * .2;
          if (e.windup <= 0) { explode(e.x, e.z, 4.4, 0, e.dmg); if (!e.dead) killEnemy(e, false); continue; }
        } else {
          vx = nx * e.speed; vz = nz * e.speed;
          if (d < 2.6 && !p.dead) { e.windup = e.windupMax = .5; sfx('spit', 0); }
        }
        break;
      case 'shielder':
        if (e.stun > 0) { e.stun -= dt; e.atkCd = Math.max(e.atkCd, .4); break; }
        vx = nx * e.speed; vz = nz * e.speed;
        if (d < 2 && e.atkCd <= 0 && !p.dead) { e.atkCd = 1.2; e.lunge = .18; if (hurtPlayer(e.dmg, e.x, e.z)) { player.kx += nx * 6; player.kz += nz * 6; } }
        if (e.lunge > 0) { vx = nx * 8; vz = nz * 8; }
        break;
      case 'healer': {
        const dir = d < 10 ? -1 : d > 15 ? 1 : 0, side = Math.sin(S.time * .6 + e.seed) * 1.8;
        vx = nx * dir * e.speed - nz * side; vz = nz * dir * e.speed + nx * side;
        e.shootT -= dt;
        if (e.shootT <= 0) {
          e.shootT = 2.6; let any = false;
          enemies.forEach(o => { if (o === e || o.dead || o.spawnT > 0 || o.type === 'healer' || Math.hypot(o.x - e.x, o.z - e.z) > 9 || o.hp >= o.maxHp) return; o.hp = Math.min(o.maxHp, o.hp + o.maxHp * .14); any = true; sparks(o.x, 1.4, o.z, 6, COL.green, 3, .6); addFloater(o.x, o.topY * o.scale, o.z, '+', '#6dff9a', 26); });
          if (any) { ringFx(e.x, .2, e.z, 9, .5, 0x40ff7a); sfx('heal', 100); }
        }
        break;
      }
      case 'sniper': {
        const dir = d < 12 ? -1 : d > 19 ? 1 : 0, side = Math.sin(S.time * .8 + e.seed) * 1.6;
        if (e.windup > 0) {
          e.windup -= dt; const k = 1 - e.windup / e.windupMax; if (e.windup > .3) { e.lx = nx; e.lz = nz; }
          aimLine(e, e.lx, e.lz, 40, .1 + k * .12, .25 + k * .6);
          if (e.windup <= 0) { clearAim(e); enemyShot(e.x + e.lx * .8, e.z + e.lz * .8, e.lx, e.lz, 24, e.dmg * 1.6, 'snipe'); sfx('spit', 30); e.shootT = rand(2.8, 3.8); }
        } else {
          vx = nx * dir * e.speed - nz * side; vz = nz * dir * e.speed + nx * side;
          e.shootT -= dt;
          if (e.shootT <= 0 && d < 36 && !p.dead) { e.windup = e.windupMax = 1.05; e.lx = nx; e.lz = nz; }
        }
        break;
      }
      case 'charger': {
        if (e.stun > 0) { e.stun -= dt; e.charging = false; break; }
        if (e.ch) {
          const c = e.ch; c.t -= dt;
          if (c.ph === 0) {
            if (c.t > .25) { c.dx = nx; c.dz = nz; }
            aimLine(e, c.dx, c.dz, 24, 2.2, .18 + (1 - c.t / c.T) * .5);
            if (c.t <= 0) { c.ph = 1; c.t = 1.4; clearAim(e); e.charging = true; sfx('boss', 0); shake(.2); }
          } else {
            vx = c.dx * 20; vz = c.dz * 20; e.yaw = Math.atan2(c.dx, c.dz);
            if (Math.random() < dt * 30) puff(e.x, .3, e.z, 1, 1.4, .5, COL.dust, 1.5);
            if (!c.hit && d < e.r + .9 && !p.dead) { c.hit = true; if (hurtPlayer(e.dmg * 1.2, e.x, e.z)) { p.kx += c.dx * 10; p.kz += c.dz * 10; } }
            const wall = Math.abs(e.x) >= PXL - .3 || e.z <= ZA + 1.2 || e.z >= ZB - 2.2;
            if (wall || c.t <= 0) {
              e.ch = null; e.charging = false; e.atkCd = 2.4; e.stun = wall ? 1.8 : .5;
              if (wall) { shake(.45); sparks(e.x, 1, e.z, 16, COL.yellow, 8); sfx('slam', 0); addFloater(e.x, 2.8, e.z, 'BETÄUBT', '#ffd34f', 28); }
            }
          }
          break;
        }
        vx = nx * e.speed; vz = nz * e.speed;
        if (e.atkCd <= 0 && d < 17 && d > 4 && !p.dead) e.ch = { ph: 0, t: .85, T: .85, dx: nx, dz: nz };
        if (d < 2.2 && e.atkCd <= 0 && !p.dead) { e.atkCd = 1.2; e.lunge = .18; if (hurtPlayer(e.dmg * .6, e.x, e.z)) { p.kx += nx * 6; p.kz += nz * 6; } }
        break;
      }
      case 'mage': {
        const dir = d < 9 ? -1 : d > 14 ? 1 : 0, side = Math.sin(S.time * .5 + e.seed) * 2;
        if (e.castT > 0) {
          e.castT -= dt; e.fireT -= dt;
          if (e.fireT <= 0) { e.fireT = .17; e.spin += .6; for (let q = 0; q < 2; q++) { const a = e.spin + q * PI; enemyShot(e.x + Math.sin(a) * .9, e.z + Math.cos(a) * .9, Math.sin(a), Math.cos(a), 6.5, e.dmg, 'magic'); } sfx('spit', 40); }
          if (e.castT <= 0) e.shootT = rand(3, 4.5);
        } else if (e.windup > 0) {
          e.windup -= dt; if (e.windup <= 0) { e.castT = 2.2; e.fireT = 0; e.spin = rand(0, TAU); sfx('boss', 0); }
        } else {
          vx = nx * dir * e.speed - nz * side; vz = nz * dir * e.speed + nx * side;
          e.shootT -= dt;
          if (e.shootT <= 0 && d < 26 && !p.dead) { e.windup = e.windupMax = .6; ringFx(e.x, .2, e.z, 3.2, .6, 0xc060ff); }
        }
        break;
      }
      case 'ghost': {
        if (e.windup > 0) { e.windup -= dt; if (e.tele) { e.tele.d.scale.setScalar(1 - e.windup / e.windupMax); e.tele.g.position.set(e.x, .07, e.z); } if (e.windup <= 0) doSlam(e, e.slamR, e.dmg); break; }
        if (e.gph === 1) { e.ghostA = Math.max(0, e.ghostA - dt * 3); if (e.ghostA <= 0) { e.hidden = true; e.gph = 2; e.gt = .55; } }
        else if (e.gph === 2) {
          e.gt -= dt;
          if (e.gt <= 0) { const a = Math.random() * TAU; e.x = clamp(p.x + Math.sin(a) * 3.6, -PXL, PXL); e.z = clamp(p.z + Math.cos(a) * 3.6, ZA + 2, ZB - 3); e.hidden = false; e.gph = 3; puff(e.x, .4, e.z, 5, 1.2, .8, [.7, .8, 1], 2); }
        } else if (e.gph === 3) { e.ghostA = Math.min(.8, e.ghostA + dt * 4); if (e.ghostA >= .8) { e.gph = 0; startSlam(e, 2.7, .75); e.blinkT = rand(3.5, 5); } }
        else {
          vx = nx * e.speed; vz = nz * e.speed; e.blinkT -= dt; if (e.blinkT <= 0) e.gph = 1;
          if (d < 1.8 && e.atkCd <= 0 && !p.dead) { e.atkCd = 1.1; e.lunge = .15; hurtPlayer(e.dmg * .7, e.x, e.z); }
        }
        break;
      }
      case 'splitter': case 'slimelet':
        vx = nx * e.speed; vz = nz * e.speed;
        if (d < (e.type === 'splitter' ? 2.3 : 1.6) && e.atkCd <= 0 && !p.dead) { e.atkCd = 1; e.lunge = .2; hurtPlayer(e.dmg, e.x, e.z); }
        if (e.lunge > 0) { vx = nx * 8; vz = nz * 8; }
        break;
      case 'brute':
        if (e.windup > 0) { e.windup -= dt; if (e.tele) { e.tele.d.scale.setScalar(1 - e.windup / e.windupMax); e.tele.g.position.set(e.x, .07, e.z); } if (e.windup <= 0) doSlam(e, e.slamR, e.dmg); }
        else { vx = nx * e.speed; vz = nz * e.speed; if (d < 3.4 && e.atkCd <= 0 && !p.dead) { startSlam(e, 4, .85); e.atkCd = 2; } }
        break;
      case 'boss': {
        const rage = e.hp < e.maxHp * .35, sp = e.speed * (rage ? 1.4 : 1);
        if (e.charge) {
          const c = e.charge; c.t -= dt;
          if (c.phase === 0) {
            if (!e.aim) makeAim(e);
            e.aim.scale.set(3.2, 16, 1); e.aim.rotation.order = 'YXZ'; e.aim.rotation.set(-PI / 2, Math.atan2(c.dx, c.dz) + PI, 0); e.aim.position.set(e.x + c.dx * 8, .09, e.z + c.dz * 8); e.aim.material.opacity = .2 + (1 - c.t / .9) * .5;
            if (c.t <= 0) { c.phase = 1; c.t = .65; clearAim(e); sfx('boss', 0); shake(.3); }
          } else {
            vx = c.dx * 19; vz = c.dz * 19;
            if (!c.hit && d < e.r + .9 && !p.dead) { c.hit = true; if (hurtPlayer(e.dmg * 1.1, e.x, e.z)) { p.kx += c.dx * 10; p.kz += c.dz * 10; } }
            puff(e.x, .3, e.z, 1, 1.4, .5, COL.dust, 1.5);
            if (c.t <= 0) { e.charge = null; e.atkCd = 1.2; }
          }
          break;
        }
        if (e.windup > 0) { e.windup -= dt; if (e.tele) { e.tele.d.scale.setScalar(1 - e.windup / e.windupMax); e.tele.g.position.set(e.x, .07, e.z); } if (e.windup <= 0) doSlam(e, e.slamR, e.dmg); }
        else {
          vx = nx * sp; vz = nz * sp;
          e.patT = (e.patT === undefined ? 5 : e.patT) - dt;
          if (e.patT <= 0 && !p.dead) { e.patT = rage ? 4 : 6; bossPattern(e, nx, nz); }
          if (d < 6 && e.atkCd <= 0 && !p.dead) { startSlam(e, 7, 1); e.atkCd = 3.2; }
          e.ringT -= dt;
          if (e.ringT <= 0 && !p.dead) {
            e.ringT = rage ? 2.4 : 3.4; const n = rage ? 22 : 15; e.ringOff += PI / n;
            for (let k = 0; k < n; k++) { const a = e.ringOff + k * TAU / n; enemyShot(e.x + Math.sin(a) * 2.2, e.z + Math.cos(a) * 2.2, Math.sin(a), Math.cos(a), 8.5, 13, 'boss'); }
            sfx('boss', 0); shake(.4); ringFx(e.x, .3, e.z, 5, .5, 0xff7a3a);
          }
          if (!e.summoned && e.hp < e.maxHp * .5) {
            e.summoned = true; showBanner('VERSTÄRKUNG', 'Der Boss ruft Crawler'); sfx('boss', 0);
            for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .4; spawnEnemy('crawler', clamp(e.x + Math.sin(a) * 4, -PXL, PXL), clamp(e.z + Math.cos(a) * 4, ZA + 2, ZB - 2), false); }
          }
        }
        break;
      }
    }
    e.kvx *= Math.exp(-7 * dt); e.kvz *= Math.exp(-7 * dt);
    const heavy = e.type === 'brute' || e.type === 'boss';
    if (e.slowT > 0) { e.slowT -= dt; vx *= .55; vz *= .55; }
    e.x += (vx + e.kvx) * dt; e.z += (vz + e.kvz) * dt;
    e.x = clamp(e.x, -PXL, PXL); e.z = clamp(e.z, ZA + 1, ZB - 2);
    collideObstacles(e, Math.min(e.r * .8, 1.2));
    e.curSpeed = damp(e.curSpeed, Math.hypot(vx, vz), 10, dt);
    e.yaw = angDamp(e.yaw, Math.atan2(nx, nz), heavy ? 5 : 10, dt);
    e.mesh.position.set(e.x, 0, e.z); e.mesh.rotation.set(0, e.yaw, 0);
    e.model.anim(e, dt, S.time);
    if (e.squash > 0) { e.squash = Math.max(0, e.squash - dt); const q = e.squash / .16, s = e.scale; e.mesh.scale.set(s * (1 + q * .22), s * (1 - q * .2), s * (1 + q * .22)); }
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
const dw = () => S.inf ? S.wave + S.waveOff : S.wave * (S.maxWave > 20 ? .45 : 1) + S.waveOff + (S.waveIdx || 0) * .35;
S.roomKind = 'combat'; S.pendingChoice = false;
function makeRoomQueue(w, boss) {
  const mx = MAPS[S.map].mix, q = [];
  const avail = ['crawler'];
  if (w >= 2) avail.push('spitter'); if (w >= 3) avail.push('bomber'); if (w >= 4) avail.push('brute', 'splitter'); if (w >= 5) avail.push('sniper');
  if (w >= 6) avail.push('charger'); if (w >= 5 || mx.shielder) avail.push('shielder'); if (w >= 8 || mx.mage) avail.push('mage'); if (w >= 7 || mx.healer) avail.push('healer'); if (w >= 10 || mx.ghost) avail.push('ghost');
  Object.keys(mx).forEach(t => { if (avail.indexOf(t) >= 0 && mx[t] > 1.5 && Math.random() < .7) avail.push(t); });
  const pick = []; const pool = avail.slice();
  const k = Math.min(pool.length, 2 + (Math.random() < .5 ? 1 : 0));
  if (Math.random() < .35 && pool.indexOf('crawler') >= 0) { pick.push('crawler'); pool.splice(pool.indexOf('crawler'), 1); }
  while (pick.length < k && pool.length) pick.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
  const N = boss ? 7 : Math.min(MOBILE ? 18 : 22, 5 + Math.floor(w * .75));
  for (let i = 0; i < N; i++) { const r = Math.random(); let t = pick[r < .5 ? 0 : r < .8 ? Math.min(1, pick.length - 1) : pick.length - 1]; if (['brute', 'charger', 'mage', 'sniper', 'ghost'].indexOf(t) >= 0 && q.filter(x => x === t).length >= 3) t = pick[0]; q.push(t); }
  W.event = null;
  if (!boss && w >= 2) { const ev = w % 4; W.event = ev === 2 ? 'barrels' : ev === 3 ? 'fog' : ev === 0 ? 'elite' : null; }
  if (W.event === 'elite') { const pl2 = ['brute', 'shielder', 'crawler']; for (let i = 0; i < 1 + Math.floor(w / 8); i++) q.push('*' + pl2[i % 3]); }
  if (boss) q.unshift('boss');
  return q;
}
function frontSpot() {
  const p = player; let z0 = Math.max(p.z + 8, ZA + 8), z1 = ZB - 2.5;   // über die ganze Map verteilt, gleich vor dem Spieler beginnend
  if (z0 > z1 - 1) { z0 = Math.max(ZA + 8, p.z - 18); z1 = z0 + 2; }
  return freeSpot(7, 1.2, p.x, p.z, z0, z1);
}
function resetRoomState() {
  enemies.forEach(e => { clearTele(e); clearAim(e); });
  clearWorld();
  const p = player; p.x = 0; p.z = ZA + 2.6; p.vx = p.vz = p.kx = p.kz = 0; p.yaw = 0; p.dash = 0; p.target = null; pl.root.position.set(p.x, 0, p.z); pl.root.rotation.set(0, 0, 0);
  joy.x = joy.y = 0; S.magnetAll = false; camera.position.set(0, 14, p.z - 10);
}
function startWave(n) {
  S.wave = n; S.waveIdx = 0; const bossRoom = !S.endless && !S.inf && (n === S.maxWave || (S.maxWave >= 4 && n === Math.floor(S.maxWave / 2))), boss0 = bossRoom; S.waveTotal = (isWaveLvl(S.stage) && !S.inf && !S.endless && !boss0) ? 10 : 1; const boss = S.endless ? n % 5 === 0 : bossRoom;
  S.roomKind = boss ? 'boss' : 'combat';
  buildRoom(S.roomKind, n); resetRoomState();
  W.queue = makeRoomQueue(S.wave + Math.floor(S.waveOff * .3) + (S.waveTotal > 1 ? 6 : 0), boss);
  if (!S.endless && n === S.maxWave && !boss) { W.event = 'elite'; for (let i = 0; i < 2 + Math.floor(S.stage / 6); i++) W.queue.push('*' + ['brute', 'shielder', 'crawler'][i % 3]); }
  W.total = W.queue.length; W.alive = 0; W.active = true; W.cleared = false; W.prep = 1.8; W.spawnCd = 0; W.clearT = 0;
  W.cap = MOBILE ? (boss ? 10 : 13) : (boss ? 12 : 16);
  S.pendingChoice = (n % 5 === 0) && (S.endless || n < S.maxWave);
  const EVT = { barrels: 'FASS-RAUM · überall Sprengfässer', fog: 'NEBEL · eingeschränkte Sicht', elite: 'ELITE-RAUM · goldene Gegner, dreifache Beute' };
  S.fogTarget = W.event === 'fog' ? .05 : S.fogBase;
  showBanner(boss ? 'BOSS-RAUM' : 'RAUM ' + n, boss ? 'Besiege den Boss' : W.event ? EVT[W.event] : n === 1 ? 'Laufe nach vorne, Gegner kommen dir entgegen' : '');
  sfx(boss ? 'boss' : 'start', 0);
  const nb = W.event === 'barrels' ? 7 : 2;
  for (let i = 0; i < nb; i++) { const s = freeSpot(6, .8, player.x, player.z, ZA + 10, ZB - 6); spawnBarrel(s.x, s.z); }
}
/* ===== Endlos-Modus ===== */
function startInfinite() {
  S.wave = 1; S.roomKind = 'combat'; buildRoom('combat', 6); resetRoomState();
  W.queue = []; W.total = 0; W.alive = 0; W.active = false; W.cleared = false; S.pendingChoice = false; S.fogTarget = S.fogBase;
  showBanner('ENDLOS', 'Halte durch – es kommen immer mehr'); sfx('start', 0);
}
const infSpot = () => {
  const p = player, z0 = p.z + 14, z1 = Math.min(ZB - 2.5, p.z + 26);
  if (z0 < z1 - 1) return freeSpot(9, 1.2, p.x, p.z, z0, z1);
  return freeSpot(9, 1.2, p.x, p.z, Math.max(ZA + 3, p.z - 26), Math.max(ZA + 4, p.z - 14));
};
function updateInfinite(dt) {
  S.infT += dt; const D = Math.floor(S.infT / 10); S.wave = 1 + D; S.magnetAll = true;
  const w = S.wave, avail = ['crawler'];
  if (w >= 2) avail.push('spitter'); if (w >= 2) avail.push('bomber'); if (w >= 3) avail.push('brute'); if (w >= 4) avail.push('shielder', 'splitter', 'sniper'); if (w >= 5) avail.push('healer', 'charger'); if (w >= 6) avail.push('mage'); if (w >= 8) avail.push('ghost');
  const cap = Math.min(MOBILE ? 40 : 50, 12 + Math.floor(S.infT / 4));
  S.infSpawn -= dt;
  if (S.infSpawn <= 0 && W.alive < cap) {
    S.infSpawn = Math.max(.1, .8 - S.infT * .005);
    let t = Math.random() < .45 ? 'crawler' : avail[(Math.random() * avail.length) | 0];
    if (['brute', 'charger', 'mage', 'ghost', 'sniper'].indexOf(t) >= 0 && enemies.filter(e => !e.dead && e.type === t).length >= 2 + Math.floor(S.infT / 120)) t = 'crawler';
    const s = infSpot(); spawnEnemy(t, s.x, s.z, true, Math.random() < Math.min(.3, .06 + S.infT / 900));
  }
  S.infMeteor = (S.infMeteor === undefined ? 20 : S.infMeteor) - dt;
  if (S.infMeteor <= 0 && S.infT > 20) { S.infMeteor = Math.max(2.2, 7 - S.infT / 25); const n = 1 + Math.floor(S.infT / 60); for (let i = 0; i < n; i++) { const mx = clamp(player.x + player.vx * .6 + rand(-5, 5) * (i ? 1 : .2), -PXL, PXL), mz = clamp(player.z + player.vz * .6 + rand(-5, 5) * (i ? 1 : .2), ZA + 1, ZB - 3); ringFx(mx, .1, mz, 4.5, 1.1, 0xff3a2a); later(1.1, () => { if (S.state === 'playing' && S.inf) explode(mx, mz, 4.5, 0, 25 + S.infT * .35); }); } showHint('Meteoritenschauer – Warnkreisen ausweichen!', 1500); }
  if (S.infT > (S.infBurst || 20)) { S.infBurst = S.infT + 15; for (let i = 0; i < 8 + Math.floor(S.infT / 20); i++) { const s = infSpot(); spawnEnemy('crawler', s.x, s.z, true, false); } }
  if (S.infT > S.infElite) { S.infElite = S.infT + 20; for (let i = 0; i < 4 + Math.floor(S.infT / 40); i++) { const s = infSpot(); spawnEnemy(['brute', 'shielder', 'crawler'][i % 3], s.x, s.z, true, true); } showBanner('ELITE-WELLE', 'goldene Gegner'); }
  if (S.infT > S.infBoss + 75 && !enemies.some(e => e.isBoss && !e.dead)) { S.infBoss = S.infT; spawnEnemy('boss', 0, ZB - 6); showBanner('BOSS', 'Er kommt von oben'); sfx('boss', 0); }
}
function startChoice() {
  S.roomKind = 'choice'; S.choiceTal = pickChoiceTalent(); buildRoom('choice', S.wave); resetRoomState();
  W.queue = []; W.total = 0; W.alive = 0; W.active = false; W.cleared = true; S.fogTarget = S.fogBase; S.pendingChoice = false;
  setDoors(true);
  showBanner('WÄHLE EINE TÜR', 'Bonus-Effekt oder volle Heilung'); sfx('level', 0);
}
function startNextWave() { startWave(S.wave + 1); S.state = 'playing'; }
function waveCleared() {
  W.cleared = true; W.clearT = 2.2; S.magnetAll = true; addFloater(player.x, 3.2, player.z, 'TEMPO +50 %', '#7fe0ff', 30); dailyAdd('rooms', 1); vib(20); writeSave();
  const bonus = Math.round((20 + dw() * 5) * (1 + .1 * save.meta.gold)); S.gold += bonus; S.totalGold += bonus;
  healPlayer(player.maxHp * .06);
  for (let i = eshots.length - 1; i >= 0; i--) { scene.remove(eshots[i].mesh); eshots.splice(i, 1); }
  if (S.wave === S.maxWave && !S.endless) { showBanner(S.roomKind === 'boss' ? 'BOSS BESIEGT' : 'LEVEL GESCHAFFT', '+$ ' + bonus); sfx('level', 0); return; }
  setDoors(true); showBanner('TÜR OFFEN', 'Weiter nach vorne  ▲'); sfx('level', 0);
}
function updateWave(dt) {
  if (!W.active) return;
  if (W.prep > 0) { W.prep -= dt; return; }
  if (W.queue.length > 0) {
    W.spawnCd -= dt;
    if (W.spawnCd <= 0 && W.alive < W.cap) {
      let t = W.queue.shift(); const el = t[0] === '*'; if (el) t = t.slice(1); const s = frontSpot();
      if (t === 'boss') spawnEnemy('boss', 0, ZB - 6); else spawnEnemy(t, s.x, s.z, true, el);
      W.spawnCd = t === 'boss' ? 1.5 : .33;
    }
  } else if (W.alive <= 0 && !W.cleared) {
    if (S.waveIdx < S.waveTotal - 1) {
      S.waveIdx++; W.queue = makeRoomQueue(S.wave + Math.floor(S.waveOff * .3) + 6 + Math.floor(S.waveIdx / 2), false); W.total = W.queue.length; W.prep = .9; W.spawnCd = 0;
      healPlayer(player.maxHp * .03); showBanner('WELLE ' + (S.waveIdx + 1) + ' / ' + S.waveTotal, 'Raum ' + S.wave); sfx('start', 0);
    } else waveCleared();
  }
  if (W.cleared && S.wave === S.maxWave && !S.endless) { W.clearT -= dt; if (W.clearT <= 0) { W.active = false; stageWon(); } }
}
function transition(fn) {
  const f = $('fade'); f.classList.add('on');
  setTimeout(() => { fn(); if (S.state === 'trans') S.state = 'playing'; setTimeout(() => f.classList.remove('on'), 80); }, 420);
}
function pickChoiceTalent() {
  const pool = talentPool();
  return pool.length ? pool[(Math.random() * pool.length) | 0] : null;
}
function giveBonus() {
  const t = S.choiceTal; if (!t) { healPlayer(player.maxHp); S.bonusName = 'Volle Heilung'; return; }
  player.tal[t.id] = (player.tal[t.id] || 0) + 1; t.apply(player); S.bonusName = t.name + ' – ' + t.desc; renderTalList();
}
function enterDoor(d) {
  if (S.state !== 'playing') return;
  S.state = 'trans'; player.vx = player.vz = 0; sfx('start', 0); S.fovKick = 1.6; vib(25);
  for (let i = pickups.length - 1; i >= 0; i--) if (pickups[i].kind === 'gear') { collectGear(pickups[i]); pickups.splice(i, 1); } else if (pickups[i].kind === 'weapon') { collectWeapon(pickups[i]); pickups.splice(i, 1); }
  transition(() => {
    if (S.roomKind === 'choice') {
      if (d.x > 0) { giveBonus(); startWave(S.wave + 1); setTimeout(() => showBanner('BONUS', S.bonusName || ''), 200); }
      else { player.hp = player.maxHp; startWave(S.wave + 1); setTimeout(() => showBanner('VOLL GEHEILT', ''), 200); }
    } else if (S.pendingChoice) startChoice();
    else startWave(S.wave + 1);
  });
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
    const sp = p.speed * p.spdMul * (p.od > 0 ? 1.15 : 1) * (W.cleared ? 1.5 : 1), k = wantsMove ? 14 : 18;
    p.vx = damp(p.vx, mx * sp, k, dt); p.vz = damp(p.vz, mz * sp, k, dt);
  }
  p.kx *= Math.exp(-9 * dt); p.kz *= Math.exp(-9 * dt);
  p.x += (p.vx + p.kx) * dt; p.z += (p.vz + p.kz) * dt;
  p.x = clamp(p.x, -PXL, PXL);
  { let zmax = ZB - 1.7; const d = doorAt(p.x);
    if (p.z > zmax && d) { zmax = ZB + 2.5; p.x = clamp(p.x, d.x - 1.0, d.x + 1.0); if (p.z > ZB + .3) enterDoor(d); }
    p.z = clamp(p.z, ZA + .9, zmax); }
  collideObstacles(p, .45);
  p.speedNow = Math.hypot(p.vx, p.vz);
  p.moving = wantsMove || p.dash > 0;
  // targeting
  let best = null, bd = 30 * 30;
  for (const e of enemies) { if (e.dead || e.spawnT > 0 || e.hidden) continue; const d = (e.x - p.x) ** 2 + (e.z - p.z) ** 2; if (d < bd) { bd = d; best = e; } }
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
  p.skCd = Math.max(0, p.skCd - dt);
  if (p.dashCh < p.dashMax) { p.dashRegen += dt; if (p.dashRegen >= 3.2 * (1 - p.cdr)) { p.dashRegen = 0; p.dashCh++; } } else p.dashRegen = 0;
  if (scene.fog) scene.fog.density = damp(scene.fog.density, S.fogTarget, 1.5, dt);
  if (p.regen > 0 && !p.dead && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + p.maxHp * p.regen * dt);
  updatePlayer(dt); updateTutorial(dt); updateTraps(dt);
  updateEnemies(dt);
  if (S.inf && S.state === 'playing') updateInfinite(dt);
  updateVolleys(dt); updateArrows(dt); updateEShots(dt); updatePickups(dt); updateWave(dt);
  for (let i = timers.length - 1; i >= 0; i--) { timers[i].t -= dt; if (timers[i].t <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }
  if (S.pendingLv > 0 && S.state === 'playing' && !p.dead) openLevelUp();
}
function updateModels(dt) {
  const p = player;
  if (S.state === 'trans') p.z += 9 * dt;
  pl.root.position.set(p.x, 0, p.z); pl.root.rotation.y = p.yaw;
  if (p.dead) { S.deadT += dt; const k = Math.min(1, S.deadT / .7); pl.root.rotation.x = -k * .5; pl.root.rotation.z = k * .6; pl.root.position.y = -k * .95; if (S.deadT > 1.8 && S.state === 'dead' && !hudCache.endShown) { hudCache.endShown = true; showEnd(false); } }
  else { pl.root.rotation.x = 0; pl.root.rotation.z = 0; pl.root.position.y = 0; }
  pl.anim({ speed: p.speedNow, aim: p.aim, recoil: p.recoil, dash: p.dashV, od: p.od > 0 }, dt, S.time);
  pl.setFlash(p.hurt > 0 ? p.hurt / .25 * .7 : (p.invuln > 0 && p.dash > 0 ? .25 : 0));
  // lock-on reticle
  const t = p.target;
  if (t && !p.dead && S.state === 'playing') {
    reticle.visible = true; const s = (t.r + .55) * (1 + Math.sin(S.time * 8) * .06);
    reticle.position.set(t.x, .08, t.z); reticle.scale.set(s, 1, s); reticle.rotation.y = S.time * 1.5;
  } else reticle.visible = false;
  world.lights.player.color.setHex(p.od > 0 ? 0xffb54a : 0xfff0d0);
}
function updateCamera(dt) {
  const p = player; S.camYaw = 0;
  S.shake = Math.max(0, S.shake - dt * 2.4); S.vig = Math.max(0, S.vig - dt * 2.2);
  S.fovKick = Math.max(0, S.fovKick - dt * 3);
  const port = window.innerHeight > window.innerWidth;
  const fov = (port ? 66 : 56) + S.fovKick * 7;
  if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
  const zf = S.inf ? 1.8 : 1.2, H = (port ? 18 : 12.5) * zf, back = (port ? 9 : 8.5) * zf, ahead = port ? 7 : 6;
  S.camPush = S.state === 'trans' ? Math.min(1, (S.camPush || 0) + dt * 2.5) : Math.max(0, (S.camPush || 0) - dt * 3);
  const tx = p.x * .65, cx = tx, cy = H - S.camPush * 4, cz = p.z - back + S.camPush * 6;
  const k = 1 - Math.exp(-9 * dt);
  camera.position.x += (cx - camera.position.x) * k; camera.position.y += (cy - camera.position.y) * k; camera.position.z += (cz - camera.position.z) * k;
  const sh = S.shake * .5;
  camera.position.x += rand(-sh, sh) * .3; camera.position.y += rand(-sh, sh) * .3; camera.position.z += rand(-sh, sh) * .3;
  camera.lookAt(tx, .6, p.z + ahead);
}

/* ================= RUN CONTROL ================= */
function clearWorld() {
  [enemies, arrows, eshots, pickups].forEach(list => { list.forEach(o => scene.remove(o.mesh)); list.length = 0; });
  enemies.length = 0; enemies.forEach(() => { });
  rings.forEach(r => { scene.remove(r.m); }); rings.length = 0; timers.length = 0; floaters.length = 0;
}
function newRun(c, s, inf) {
  volleys.length = 0;
  if (inf !== undefined) S.inf = inf;
  if (c !== undefined) { S.stage = s; S.map = S.inf ? c : PATH[s]; }
  // remove tele meshes of old enemies
  enemies.forEach(e => clearTele(e));
  clearWorld();
  obstacles.slice().forEach(o => { if (o.explosive) removeObstacle(o); });
  resetPlayer();
  Object.assign(S, { ore: 0, rune: 0, oreBanked: 0, runeBanked: 0, state: 'playing', wave: 0, gold: 0, totalGold: 0, kills: 0, level: 1, xp: 0, xpNeed: 45, pendingLv: 0, shake: 0, vig: 0, hitstop: 0, magnetAll: false, deadT: 0, camYaw: 0, endless: false, coresPaid: 0, lastCores: 0, drops: [], stars: 0, maxWave: stageWaves(S.stage), waveOff: S.inf ? 0 : S.stage, infT: 0, infSpawn: 0, infBoss: 0, infElite: 25, infBurst: 20, infMeteor: 20, revUsed: false, weapon: 0 });
  applyTheme(S.map);
  S.gold = 120 * save.meta.start;
  renderTalList(); tut.step = save.tutDone ? -1 : 0; tut.d = 0; tut.lx = 0; tut.lz = 0; $('tut').classList.add('hidden');
  Object.keys(shopLv).forEach(k => delete shopLv[k]);
  hudCache.endShown = false;
  W.queue = []; W.total = 0; W.alive = 0; W.active = false;
  $('hud').classList.remove('off');
  hideMenuUi(); hideScreen('reviveScreen'); hideScreen('endScreen'); hideScreen('shopScreen'); hideScreen('levelScreen'); hideScreen('pauseScreen');
  S.state = 'playing'; if (S.inf) startInfinite(); else startWave(1);
  showHint(MOBILE ? 'Finger ziehen = laufen · Loslassen = automatisch schießen' : 'WASD oder Maus ziehen = laufen · Stehen bleiben = automatisch schießen', 9000);
}
function toMenu() {
  enemies.forEach(e => { clearTele(e); clearAim(e); });
  clearWorld(); obstacles.slice().forEach(o => { if (o.explosive) removeObstacle(o); });
  resetPlayer(); S.state = 'menu'; applyTheme(0); W.active = false; $('hud').classList.add('off'); $('tut').classList.add('hidden');
  ['endScreen', 'pauseScreen', 'shopScreen', 'levelScreen', 'workScreen', 'smithScreen', 'reviveScreen'].forEach(hideScreen);
  buildRoom('combat', 0); resetRoomState(); pl.root.visible = true; S.roomKind = 'combat';
  goTab('home');
}
function pauseView(set) {
  $('pauseMain').classList.toggle('hidden', set); $('pauseSet').classList.toggle('hidden', !set);
  if (set) { const o = $('pauseOpts'); o.innerHTML = optionsHTML(); bindOptions(o); }
}
function togglePause() {
  if (S.state === 'playing') { S.state = 'paused'; $('pauseTal').innerHTML = talentListHTML(); $('pauseWeapon').innerHTML = 'Waffe · <b style="color:#ffc34f">' + curW().name + (curWLv() ? ' +' + curWLv() : '') + '</b>'; pauseView(false); showScreen('pauseScreen'); }
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
  if (e.code === 'KeyM') { save.sound = !save.sound; applyAudioJoy(); writeSave(); return; }
  if (S.state !== 'playing') return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
  K[e.code] = true;
  if (e.repeat) return;
  if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Digit1') useSkill();
});
window.addEventListener('keyup', e => { K[e.code] = false; });
window.addEventListener('blur', () => { for (const k in K) K[k] = false; if (S.state === 'playing') togglePause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.state === 'playing') togglePause(); });

const ptrs = {};
const cv = renderer.domElement;
let joyId = null, joyO = { x: 0, y: 0 };
cv.addEventListener('pointerdown', e => {
  audioInit(); if (joyId !== null) return;
  joyId = e.pointerId; joyO = { x: e.clientX, y: e.clientY };
  try { cv.setPointerCapture(e.pointerId); } catch (_) { }
  const j = $('joy'); j.classList.remove('hidden'); j.style.left = e.clientX + 'px'; j.style.top = e.clientY + 'px'; $('stick').style.transform = 'translate(0,0)';
});
cv.addEventListener('pointermove', e => {
  if (e.pointerId !== joyId) return;
  const r = Math.max(parseFloat(getComputedStyle(document.documentElement).fontSize) * 5.5, 56) * ([.8, 1, 1.3][save.joy] || 1);
  let vx = (e.clientX - joyO.x) / r, vy = (e.clientY - joyO.y) / r; const l = Math.hypot(vx, vy);
  if (l > 1) { // floating base follows the thumb
    joyO.x += (e.clientX - joyO.x) - vx / l * r; joyO.y += (e.clientY - joyO.y) - vy / l * r; $('joy').style.left = joyO.x + 'px'; $('joy').style.top = joyO.y + 'px'; vx /= l; vy /= l;
  }
  const ll = Math.min(1, l), dz = .14, m = ll < dz ? 0 : (ll - dz) / (1 - dz), dn = ll || 1;
  joy.x = vx / dn * m * (l > 1 ? dn : 1); joy.y = -vy / dn * m * (l > 1 ? dn : 1);
  const sl = Math.hypot(vx, vy) || 1, sm = Math.min(1, l);
  $('stick').style.transform = 'translate(' + (vx / sl * sm * r * .7) + 'px,' + (vy / sl * sm * r * .7) + 'px)';
});
function endPtr(e) { if (e.pointerId !== joyId) return; joyId = null; joy.x = joy.y = 0; $('joy').classList.add('hidden'); }
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('contextmenu', e => e.preventDefault());
$('pauseBtn').addEventListener('click', () => { audioInit(); togglePause(); });
$('btnSettings').addEventListener('click', () => { sfx('buy', 0); pauseView(true); });
$('btnSetBack').addEventListener('click', () => { sfx('buy', 0); pauseView(false); });
$('btnMenu').addEventListener('click', () => { hideScreen('pauseScreen'); toMenu(); });
$('btnResume').addEventListener('click', () => { audioInit(); togglePause(); });
$('pauseScreen').addEventListener('click', e => { if (e.target.id === 'pauseScreen' && !$('pauseMain').classList.contains('hidden')) togglePause(); });

/* ================= PORTRAIT (second tiny renderer, shows the head) ================= */
let portrait = null, hero = null;
function initHero() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true }), W = MOBILE ? 300 : 440, H = MOBILE ? 360 : 520;
    r.setSize(W, H, false); r.setClearColor(0x000000, 0); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.2;
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, W / H, .1, 20), model = buildPlayer(); sc.add(model.root);
    sc.add(new THREE.HemisphereLight(0xcfe0ff, 0x4a3a2a, .75));
    const key = new THREE.DirectionalLight(0xfff0dd, 1.3); key.position.set(2, 3.5, 3); sc.add(key);
    const rim = new THREE.PointLight(0x7fe0ff, 1.4, 8); rim.position.set(-2, 2.5, -1.5); sc.add(rim);
    cam.position.set(0, 1.5, 6.2); cam.lookAt(0, 1.05, 0);
    r.domElement.className = 'heroCanvas'; hero = { r, sc, cam, model, t: 0, host: null };
  } catch (e) { hero = null; }
}
function attachHero(host) { if (!hero || !host) return; hero.host = host; host.appendChild(hero.r.domElement); applyWeaponVisual(); }
function updateHero(dt) {
  if (pl && pl.root) pl.root.visible = !(hero && hero.host && hero.host.isConnected && hero.host.offsetParent !== null);
  if (!hero || !hero.host || !hero.host.isConnected || hero.host.offsetParent === null) return; hero.t += dt;
  const m = hero.model; m.anim({ speed: 0, aim: 0, recoil: 0, dash: 0 }, dt, hero.t); m.root.rotation.y = Math.sin(hero.t * .7) * .5; m.setFlash(0);
  hero.r.render(hero.sc, hero.cam);
}

function initPortrait() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setSize(MOBILE ? 128 : 256, MOBILE ? 128 : 256, false); r.setClearColor(0x000000, 0); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
    $('portraitHost').appendChild(r.domElement);
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1, .1, 10);
    const model = buildPlayer(); sc.add(model.root);
    sc.add(new THREE.HemisphereLight(0x9bb4e0, 0x332a24, .8));
    const key = new THREE.DirectionalLight(0xffeedd, 1.5); key.position.set(1.5, 2.8, 2.5); sc.add(key);
    const rim = new THREE.PointLight(0x35e3ff, 1.2, 6); rim.position.set(-1, 2.2, -.5); sc.add(rim);
    cam.position.set(1.4, 2.0, 2.5); cam.lookAt(0, 1.35, 0.1);
    model.anim({ speed: 0, aim: 0, recoil: 0, dash: 0 }, 0, 0);
    portrait = { r, sc, cam, model, t: 0 };
  } catch (e) { portrait = null; }
}
function updatePortrait(dt) {
  if (!portrait) return; portrait.t += dt; if (portrait.t < (MOBILE ? .25 : .1)) return; portrait.t = 0;
  const m = portrait.model; m.anim({ speed: 0, aim: 0, recoil: 0, dash: 0 }, .1, S.time); m.root.rotation.y = Math.sin(S.time * .6) * .5;
  m.setFlash(player.hurt > 0 ? .7 : 0); portrait.r.render(portrait.sc, portrait.cam);
}

/* ================= LOOP ================= */
let fpsAvg = 60, lowQ = false, lowT = 0, mmT = 0;
function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  setParticleScale(); resizeOverlay();
}
/* ===== tutorial ===== */
const tut = { step: -1, d: 0, lx: 0, lz: 0 };
const TUTS = [
  () => MOBILE ? 'Tippe und ziehe mit einem Finger, um zu laufen' : 'Laufe mit W A S D oder gedrückter Maustaste',
  () => 'Bleib stehen: du schießt automatisch auf den nächsten Gegner',
  () => 'Besiege alle Gegner, dann öffnet sich die Tür'
];
function updateTutorial(dt) {
  if (tut.step < 0 || S.state !== 'playing' || S.wave !== 1 || W.prep > 0) return;
  const p = player, el = $('tut');
  if (tut.lx === 0 && tut.lz === 0) { tut.lx = p.x + 1e-3; tut.lz = p.z; }
  tut.d += Math.hypot(p.x - tut.lx, p.z - tut.lz); tut.lx = p.x; tut.lz = p.z;
  const done = tut.step === 0 ? tut.d > 5 : tut.step === 1 ? S.kills >= 1 : W.cleared;
  el.textContent = TUTS[tut.step](); el.classList.remove('hidden');
  if (done) { tut.step++; tut.d = 0; sfx('buy', 0); if (tut.step >= TUTS.length) { tut.step = -1; save.tutDone = true; writeSave(); el.classList.add('hidden'); } }
}

/* ===== weather & ambience ===== */
let rain = null;
function applyRain() {
  if (rain) { scene.remove(rain); rain.geometry.dispose(); rain.material.dispose(); rain = null; }
  if (!save.rain) return;
  const n = MOBILE ? 220 : 520, pos = new Float32Array(n * 6), g = new THREE.BufferGeometry();
  for (let i = 0; i < n; i++) { const x = rand(-22, 22), y = rand(0, 18), z = rand(-22, 22); pos.set([x, y, z, x - .15, y - 1.1, z + .05], i * 6); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x9ab8d0, transparent: true, opacity: .35, depthWrite: false }));
  rain.frustumCulled = false; rain.userData.n = n; scene.add(rain);
}
function updateRain(dt) {
  if (!rain) return;
  const a = rain.geometry.attributes.position.array, n = rain.userData.n, px = camera.position.x, pz = camera.position.z;
  for (let i = 0; i < n; i++) {
    const o = i * 6, f = 26 * dt;
    a[o + 1] -= f; a[o + 4] -= f; a[o] -= 1.6 * dt; a[o + 3] -= 1.6 * dt;
    if (a[o + 1] < 0) { const x = px + rand(-22, 22), z = pz + rand(-22, 22), y = rand(12, 18); a[o] = x; a[o + 1] = y; a[o + 2] = z; a[o + 3] = x - .15; a[o + 4] = y - 1.1; a[o + 5] = z + .05; }
  }
  rain.geometry.attributes.position.needsUpdate = true;
}
function updateDust(dt) {
  if (Math.random() > dt * 36 * FXM) return;
  const p = player, x = p.x + rand(-9, 9), z = p.z + rand(-5, 18);
  if (S.map === 2) fxSmoke.emit(x, rand(6, 10), z, rand(-.4, .4), -rand(1.5, 2.5), rand(-.3, .3), 4, .14, .95, .97, 1, 0, 0, .8);
  else if (S.map === 3) fxAdd.emit(x, rand(0, 1), z, rand(-.3, .3), rand(1, 2.4), rand(-.3, .3), rand(1.5, 2.5), .12, 1, .45, .1, 0, 0, .9);
  else if (S.map === 1) fxSmoke.emit(x, rand(.3, 3), z, rand(1.5, 2.8), rand(-.1, .2), rand(-.3, .3), 3, rand(.3, .6), .85, .7, .45, 0, 0, .16, 1.5);
  else fxSmoke.emit(x, rand(.5, 5), z, rand(-.2, .2), rand(0, .15), rand(-.2, .2), rand(3, 5), rand(.06, .1), .7, .75, .8, 0, 0, .25);
}
(function () { const v = document.createElement('div'); v.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.12))'; document.body.appendChild(v); })();

window.addEventListener('resize', onResize);
const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
setTimeout(() => { const l = $('loading'); if (l) l.classList.add('hidden'); }, 300);
  const real = Math.min(clock.getDelta(), .05); S.time += real;
  fpsAvg = fpsAvg * .95 + (1 / Math.max(real, .001)) * .05;
  if (!lowQ && S.state === 'playing') { lowT = fpsAvg < (MOBILE ? 38 : 32) ? lowT + real : 0; if (lowT > (MOBILE ? 2.5 : 4)) { lowQ = true; renderer.setPixelRatio(1); renderer.setSize(window.innerWidth, window.innerHeight); world.lights.moon.castShadow = false; FXM = .45; setParticleScale(); showHint('Grafik automatisch reduziert, damit das Spiel flüssig läuft.', 4000); } }
  let dt = real;
  updateRain(real); updateDust(real);
  if (S.state === 'playing') { if (S.hitstop > 0) { S.hitstop -= real; dt = real * .15; } updateGame(dt); }
  updateModels(real); updateRings(real);
  fxAdd.update(real); fxSmoke.update(real);
  updateCamera(real);
  updateWorld(real, S.time, camera, player);
  if (S.state !== 'menu') {
    updateHUD(); drawOverlay(real);
  } else drawOverlay(real);
  updatePortrait(real); updateHero(real);
  renderer.render(scene, camera);
}

/* ================= INIT ================= */
resetPlayer();
buildWorld(); buildRoom('combat', 0);
pl = buildPlayer(); scene.add(pl.root);
pl.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
reticle = new THREE.Mesh(GEO.ring, new THREE.MeshBasicMaterial({ color: 0xff4a2a, transparent: true, opacity: .9, depthWrite: false })); reticle.visible = false; reticle.renderOrder = 2; scene.add(reticle);
loadSave(); applyAudioJoy(); applyTheme(0); buildAbilityUI(); initPortrait(); initHero(); onResize(); applyQuality(); applyRain(); applyWeaponVisual(); initNav(); goTab('home');
camera.position.set(0, 6, 10);
requestAnimationFrame(frame);
setTimeout(() => { const l = $('loading'); if (l) l.classList.add('hidden'); }, 300);
