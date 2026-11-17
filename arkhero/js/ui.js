'use strict';
/* ================= Icons ================= */
function svgIcon(name, c) {
  c = c || '#fff';
  const P = {
    volley: () => {
      let s = '';
      [-34, 0, 34].forEach(a => {
        const r = a * PI / 180, tx = 12 + Math.sin(r) * 16, ty = 20 - Math.cos(r) * 16;
        const nx = Math.cos(r), ny = Math.sin(r);
        s += `<path d="M12 21 L${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="#8fe9ff" stroke-width="1.7" stroke-linecap="round" fill="none"/>` +
          `<path d="M${tx.toFixed(1)} ${ty.toFixed(1)} L${(tx - Math.sin(r) * 4 + nx * 2.6).toFixed(1)} ${(ty + Math.cos(r) * 4 + ny * 2.6).toFixed(1)} L${(tx - Math.sin(r) * 4 - nx * 2.6).toFixed(1)} ${(ty + Math.cos(r) * 4 - ny * 2.6).toFixed(1)}Z" fill="#fff"/>`;
      });
      return s;
    },
    dash: () => '<path d="M3 5l7 7-7 7M11 5l7 7-7 7" stroke="#7fe0ff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 7l3 5-3 5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    nova: () => {
      let s = '<circle cx="12" cy="12" r="3.2" fill="#fff"/><circle cx="12" cy="12" r="7" stroke="#6cd7ff" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="10.5" stroke="#6cd7ff" stroke-width="1" fill="none" opacity=".6"/>';
      for (let i = 0; i < 8; i++) { const a = i * PI / 4; s += `<path d="M${(12 + Math.cos(a) * 4.6).toFixed(1)} ${(12 + Math.sin(a) * 4.6).toFixed(1)}L${(12 + Math.cos(a) * 9).toFixed(1)} ${(12 + Math.sin(a) * 9).toFixed(1)}" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`; }
      return s;
    },
    overdrive: () => '<path d="M13.5 2 5 13.5h5.5L9.5 22 19 9.8h-5.7z" fill="#ffc34f" stroke="#fff3c9" stroke-width=".8" stroke-linejoin="round"/>',
    plus: () => `<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" fill="#ff6b5b"/>`,
    sword: () => '<path d="M14 4h6v6L10.5 19.5 7 16z" fill="#dfe6ec"/><path d="M5 14l5 5-2.4 2.4-5-5z" fill="#d79a35"/><path d="M3 21l2.6-2.6" stroke="#8a5a1a" stroke-width="2"/>',
    bolt: () => '<path d="M13.5 2 5 13.5h5.5L9.5 22 19 9.8h-5.7z" fill="#46b8ff"/>',
    shield: () => '<path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z" fill="#8ea8be"/><path d="M12 5v14c3-1.2 5.5-4 5.5-7.6V7.4z" fill="#bcd0e0"/>',
    heart: () => '<path fill="#ee3a2c" d="M12 21s-8.5-5.4-8.5-11.2C3.5 6.6 5.8 4.5 8.4 4.5c1.6 0 2.9.8 3.6 2 .7-1.2 2-2 3.6-2 2.6 0 4.9 2.1 4.9 5.3C20.5 15.6 12 21 12 21z"/>',
    boot: () => '<path d="M8 3h6v8l6 3.5V20H4v-4l4-2z" fill="#cfa86e"/><path d="M4 18h16v2H4z" fill="#6a4a22"/>',
    clock: () => '<circle cx="12" cy="12" r="9" stroke="#9fe0ff" stroke-width="2" fill="none"/><path d="M12 6v6l4 2" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>',
    multi: () => '<g stroke="#8fe9ff" stroke-width="1.8" stroke-linecap="round"><path d="M3 18 18 3M3 12 12 3M9 21 21 9"/></g>',
    pierce: () => '<circle cx="12" cy="12" r="6" stroke="#ffb15a" stroke-width="2" fill="none"/><path d="M2 12h20" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M22 12l-4-3v6z" fill="#fff"/>',
    ricochet: () => '<path d="M3 20 11 6 15 14 21 4" stroke="#9fefff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 4l-6 .8 4 4z" fill="#fff"/>',
    crit: () => '<path d="M12 2l2.7 6.3 6.8.6-5.2 4.5 1.6 6.7L12 16.5 6.1 20.1l1.6-6.7L2.5 8.9l6.8-.6z" fill="#ffd34f"/>',
    fire: () => '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 1.5 2 2 3 .8-2.6.4-5.6 1-8z" fill="#ff8a24"/><path d="M12 12c.6 2 3 3 3 5.4a3 3 0 0 1-6 0c0-1.6 1.6-2.4 3-5.4z" fill="#ffd36a"/>',
    vamp: () => '<path d="M12 2.5C9 8 5 11 5 15.5a7 7 0 0 0 14 0C19 11 15 8 12 2.5z" fill="#c9202f"/><path d="M9 15a3 3 0 0 0 3 3" stroke="#ff9aa4" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    haste: () => '<path d="M11 3 3 13h5l-1 8 9-11h-5.2z" fill="#46b8ff"/><path d="M17 4l-6 8h4l-1 6 6-8h-4z" fill="#bfe8ff" opacity=".85"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${(P[name] || P.bolt)()}</svg>`;
}

/* ================= Ability slots ================= */
const AB = [
  { name: 'Salve', cd: 5, cost: 25, ic: 'volley', key: '1' },
  { name: 'Sprung', cd: 2.6, cost: 12, ic: 'dash', key: '2' },
  { name: 'Schockwelle', cd: 9, cost: 35, ic: 'nova', key: '3' },
  { name: 'Overdrive', cd: 22, cost: 45, ic: 'overdrive', key: '4' }
];
const slotEls = [];
function buildAbilityUI() {
  const box = $('abilities'); box.innerHTML = '';
  AB.forEach((a, i) => {
    const w = document.createElement('div'); w.className = 'slotWrap';
    w.innerHTML = `<div class="slot" title="${a.name}">${svgIcon(a.ic)}<div class="mask"></div><div class="num"></div></div><div class="key">${a.key}</div>`;
    const s = w.firstChild;
    s.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit(); useAbility(i); });
    box.appendChild(w);
    slotEls.push({ s, mask: s.querySelector('.mask'), num: s.querySelector('.num') });
  });
}

/* ================= HUD ================= */
const hudCache = {};
function setTxt(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
function setW(id, p) { const v = (clamp(p, 0, 1) * 100).toFixed(1) + '%'; if (hudCache[id] !== v) { hudCache[id] = v; $(id).style.width = v; } }
function waveRemaining() { return W.queue.length + W.alive; }
function updateHUD() {
  const p = player, rem = waveRemaining();
  setTxt('moneyV', fmt(S.gold));
  setTxt('lvlTxt', 'LEVEL ' + S.level);
  setW('xpFill', S.xp / S.xpNeed);
  setTxt('waveTitle', 'WAVE ' + Math.max(1, S.wave) + ' / ' + S.maxWave);
  setW('waveFill', W.total ? (W.total - rem) / W.total : 0);
  setTxt('waveEn', 'Verbleibende Gegner: ' + rem + '/' + W.total);
  setW('hpFill', p.hp / p.maxHp);
  setTxt('hpTxt', Math.ceil(p.hp) + ' / ' + Math.round(p.maxHp));
  setW('enFill', p.energy / p.maxEnergy);
  AB.forEach((a, i) => {
    const el = slotEls[i], locked = i === 3 && !p.hasOD, cdMax = a.cd * (1 - p.cdr), cd = p.cd[i];
    const frac = locked ? 0 : clamp(cd / cdMax, 0, 1);
    el.mask.style.height = (frac * 100).toFixed(0) + '%';
    const t = cd > 0 && !locked ? cd.toFixed(1) : '';
    if (el.num.textContent !== t) el.num.textContent = t;
    el.s.classList.toggle('lock', locked);
    el.s.classList.toggle('low', !locked && cd <= 0 && p.energy < a.cost);
    el.s.classList.toggle('ready', !locked && cd <= 0 && p.energy >= a.cost);
  });
  const boss = enemies.find(e => e.isBoss && !e.dead);
  const bb = $('bossBar');
  if (boss && S.state !== 'menu') { if (bb.classList.contains('hidden')) bb.classList.remove('hidden'); setW('bossFill', boss.hp / boss.maxHp); }
  else if (!bb.classList.contains('hidden')) bb.classList.add('hidden');
  const v = $('vignette'), low = p.hp / p.maxHp < .3 && !p.dead ? .35 + Math.sin(S.time * 6) * .15 : 0;
  const vo = Math.max(S.vig, low).toFixed(2);
  if (hudCache.vig !== vo) { hudCache.vig = vo; v.style.opacity = vo; }
}

/* ================= Minimap ================= */
const mm = $('minimap'), mctx = mm.getContext('2d');
function drawMinimap() {
  const W2 = mm.width, c = W2 / 2, R = c - 10, scale = R / 30;
  const yaw = S.camYaw, fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -Math.cos(yaw), rz = Math.sin(yaw), p = player;
  const mp = (x, z) => { const dx = x - p.x, dz = z - p.z; return [c + (dx * rx + dz * rz) * scale, c - (dx * fx + dz * fz) * scale]; };
  mctx.clearRect(0, 0, W2, W2);
  mctx.save(); mctx.beginPath(); mctx.arc(c, c, R, 0, TAU); mctx.clip();
  mctx.fillStyle = 'rgba(8,16,22,.88)'; mctx.fillRect(0, 0, W2, W2);
  mctx.beginPath();
  [[-A, -A], [A, -A], [A, A], [-A, A]].forEach((q, i) => { const m = mp(q[0], q[1]); i ? mctx.lineTo(m[0], m[1]) : mctx.moveTo(m[0], m[1]); });
  mctx.closePath(); mctx.fillStyle = 'rgba(46,72,82,.6)'; mctx.fill(); mctx.lineWidth = 6; mctx.strokeStyle = 'rgba(170,196,205,.9)'; mctx.stroke();
  // view wedge
  mctx.beginPath(); mctx.moveTo(c, c); mctx.lineTo(c - R * .75, c - R * .95); mctx.lineTo(c + R * .75, c - R * .95); mctx.closePath();
  mctx.fillStyle = 'rgba(255,255,255,.06)'; mctx.fill();
  obstacles.forEach(o => { const m = mp(o.x, o.z); mctx.fillStyle = o.explosive ? '#ff8a24' : 'rgba(150,160,170,.55)'; mctx.beginPath(); mctx.arc(m[0], m[1], o.explosive ? 6 : 4, 0, TAU); mctx.fill(); });
  pickups.forEach(k => { const m = mp(k.x, k.z); mctx.fillStyle = k.kind === 'coin' ? '#ffcf4a' : '#4cc3ff'; mctx.fillRect(m[0] - 2.5, m[1] - 2.5, 5, 5); });
  enemies.forEach(e => { if (e.dead) return; const m = mp(e.x, e.z); mctx.fillStyle = '#ff3b2e'; mctx.beginPath(); mctx.arc(m[0], m[1], e.isBoss ? 13 : e.type === 'brute' ? 9 : 6, 0, TAU); mctx.fill(); if (e.type === 'brute' || e.isBoss) { mctx.strokeStyle = '#fff'; mctx.lineWidth = 2; mctx.stroke(); } });
  mctx.restore();
  // ring + ticks
  mctx.strokeStyle = '#a6b4bd'; mctx.lineWidth = 6; mctx.beginPath(); mctx.arc(c, c, R, 0, TAU); mctx.stroke();
  mctx.lineWidth = 3;
  for (let i = 0; i < 36; i++) { const a = i * TAU / 36, l = i % 3 === 0 ? 12 : 6; mctx.beginPath(); mctx.moveTo(c + Math.cos(a) * (R + 2), c + Math.sin(a) * (R + 2)); mctx.lineTo(c + Math.cos(a) * (R + 2 + l * .6), c + Math.sin(a) * (R + 2 + l * .6)); mctx.stroke(); }
  // north marker
  const nx = c - Math.sin(yaw) * (R - 4), ny = c + Math.cos(yaw) * (R - 4);
  mctx.fillStyle = '#0b1218'; mctx.beginPath(); mctx.arc(nx, ny, 20, 0, TAU); mctx.fill(); mctx.strokeStyle = '#ff9a3a'; mctx.lineWidth = 3; mctx.stroke();
  mctx.fillStyle = '#ffb25e'; mctx.font = '700 26px Rajdhani, Arial, sans-serif'; mctx.textAlign = 'center'; mctx.textBaseline = 'middle'; mctx.fillText('N', nx, ny + 1);
  // player marker
  mctx.save(); mctx.translate(c, c); mctx.rotate(angDiff(0, player.yaw - yaw) * -1 + 0);
  mctx.fillStyle = '#fff'; mctx.strokeStyle = '#0a1016'; mctx.lineWidth = 3;
  mctx.beginPath(); mctx.moveTo(0, -14); mctx.lineTo(10, 11); mctx.lineTo(0, 6); mctx.lineTo(-10, 11); mctx.closePath(); mctx.stroke(); mctx.fill();
  mctx.restore();
}

/* ================= 2D overlay: damage numbers + enemy bars ================= */
const fx2d = $('fx2d'), ctx2 = fx2d.getContext('2d');
const floaters = [];
function resizeOverlay() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  fx2d.width = window.innerWidth * dpr; fx2d.height = window.innerHeight * dpr; ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
}
const _pv = new THREE.Vector3();
function toScreen(x, y, z) {
  _pv.set(x, y, z).project(camera);
  if (_pv.z > 1) return null;
  return { x: (_pv.x * .5 + .5) * window.innerWidth, y: (-_pv.y * .5 + .5) * window.innerHeight };
}
function addFloater(x, y, z, text, color, size) {
  if (floaters.length > 70) floaters.shift();
  floaters.push({ x: x + rand(-.4, .4), y, z: z + rand(-.4, .4), text, color, size: size || 30, t: 0, life: .95, dx: rand(-18, 18) });
}
function drawOverlay(dt) {
  const w = window.innerWidth, h = window.innerHeight;
  ctx2.clearRect(0, 0, w, h);
  if (S.state === 'menu') return;
  // enemy hp bars (only damaged, non-boss)
  enemies.forEach(e => {
    if (e.dead || e.dying > 0 || e.spawnT > 0 || e.isBoss || e.hp >= e.maxHp) return;
    const s = toScreen(e.x, e.topY * (e.scale || 1) + .3, e.z); if (!s) return;
    const bw = e.type === 'brute' ? 74 : 46, f = clamp(e.hp / e.maxHp, 0, 1);
    ctx2.fillStyle = 'rgba(0,0,0,.7)'; ctx2.fillRect(s.x - bw / 2 - 1.5, s.y - 1.5, bw + 3, 8);
    ctx2.fillStyle = '#d8281c'; ctx2.fillRect(s.x - bw / 2, s.y, bw * f, 5);
    ctx2.fillStyle = 'rgba(255,255,255,.35)'; ctx2.fillRect(s.x - bw / 2, s.y, bw * f, 2);
  });
  // lock-on tag handled in 3D (ring). floaters:
  ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle'; ctx2.lineJoin = 'round';
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i]; f.t += dt;
    if (f.t >= f.life) { floaters.splice(i, 1); continue; }
    const s = toScreen(f.x, f.y, f.z); if (!s) continue;
    const k = f.t / f.life, pop = 1 + .55 * Math.max(0, 1 - f.t * 7);
    const sz = f.size * pop;
    ctx2.globalAlpha = k > .6 ? 1 - (k - .6) / .4 : 1;
    ctx2.font = '700 ' + sz.toFixed(0) + 'px Rajdhani, "Arial Narrow", sans-serif';
    const yy = s.y - k * 62, xx = s.x + f.dx * k;
    ctx2.lineWidth = Math.max(3, sz * .14); ctx2.strokeStyle = 'rgba(0,0,0,.85)'; ctx2.strokeText(f.text, xx, yy);
    ctx2.fillStyle = f.color; ctx2.fillText(f.text, xx, yy);
  }
  ctx2.globalAlpha = 1;
}

/* ================= Banner / screens ================= */
function showBanner(big, sub) {
  const b = $('banner'); $('bannerBig').textContent = big; $('bannerSub').textContent = sub || '';
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}
function showScreen(id) { $(id).classList.remove('hidden'); }
function hideScreen(id) { $(id).classList.add('hidden'); }
function showHint(txt, ms) {
  const h = $('hint'); h.textContent = txt; h.classList.remove('hidden'); h.style.opacity = 1;
  clearTimeout(showHint._t); showHint._t = setTimeout(() => { h.style.opacity = 0; setTimeout(() => h.classList.add('hidden'), 1000); }, ms || 9000);
}

/* ================= Talents (level up) ================= */
const TALENTS = [
  { id: 'multi', name: 'Mehrfachschuss', ic: 'multi', max: 3, desc: '+1 Pfeil pro Schuss. Der Schaden pro Pfeil sinkt leicht.', apply: p => p.multi++ },
  { id: 'pierce', name: 'Durchschlag', ic: 'pierce', max: 3, desc: 'Pfeile durchbohren einen weiteren Gegner.', apply: p => p.pierce++ },
  { id: 'ricochet', name: 'Querschläger', ic: 'ricochet', max: 3, desc: 'Pfeile prallen nach einem Treffer auf einen weiteren Gegner ab.', apply: p => p.ricochet++ },
  { id: 'crit', name: 'Scharfschütze', ic: 'crit', max: 5, desc: '+12% Krit-Chance. Kritische Treffer machen 2,2-fachen Schaden.', apply: p => p.crit += .12 },
  { id: 'fire', name: 'Brandpfeile', ic: 'fire', max: 3, desc: 'Treffer setzen Gegner in Brand und verursachen Schaden über Zeit.', apply: p => p.fire++ },
  { id: 'vamp', name: 'Blutdurst', ic: 'vamp', max: 3, desc: 'Jeder besiegte Gegner heilt dich um 4 Leben.', apply: p => p.vamp += 4 },
  { id: 'hp', name: 'Zähigkeit', ic: 'heart', max: 4, desc: '+25% maximale Leben und sofortige Heilung um diesen Betrag.', apply: p => { const d = p.maxHp * .25; p.maxHp += d; p.hp += d; } },
  { id: 'rage', name: 'Plasma-Kern', ic: 'sword', max: 6, desc: '+25% Pfeilschaden.', apply: p => p.dmgMul *= 1.25 },
  { id: 'haste', name: 'Adrenalin', ic: 'haste', max: 5, desc: '+20% Feuerrate.', apply: p => p.aspdMul *= 1.2 }
];
function openLevelUp() {
  S.state = 'levelup'; sfx('level', 0);
  const pool = TALENTS.filter(t => (player.tal[t.id] || 0) < t.max);
  const ch = []; while (ch.length < 3 && pool.length) ch.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
  const el = $('levelScreen');
  el.innerHTML = `<div class="card"><h2>LEVEL ${S.level}</h2><div class="note" style="margin:.4rem 0 0">Wähle ein Talent. (Taste 1, 2 oder 3)</div><div class="talents">` +
    ch.map((t, i) => `<button class="talent" data-id="${t.id}"><div class="ic">${svgIcon(t.ic)}</div><h3>${t.name}</h3><p>${t.desc}</p><div class="k">Stufe ${(player.tal[t.id] || 0) + 1} · Taste ${i + 1}</div></button>`).join('') + `</div></div>`;
  el._choices = ch;
  el.querySelectorAll('.talent').forEach(b => b.addEventListener('click', () => pickTalent(b.dataset.id)));
  showScreen('levelScreen');
  const f = el.querySelector('.talent'); if (f) f.focus();
}
function pickTalent(id) {
  const t = TALENTS.find(x => x.id === id); if (!t) return;
  player.tal[id] = (player.tal[id] || 0) + 1; t.apply(player);
  sfx('buy', 0); S.pendingLv--; hideScreen('levelScreen');
  if (S.pendingLv > 0) openLevelUp(); else S.state = 'playing';
}

/* ================= Shop ================= */
const SHOP = [
  { id: 'heal', name: 'Notfall-Kit', ic: 'plus', desc: () => 'Heilt 50% deiner maximalen Leben.', cost: () => 100 + S.wave * 12, repeat: true, can: () => player.hp < player.maxHp - 1, buy: () => healPlayer(player.maxHp * .5) },
  { id: 'dmg', name: 'Plasma-Spitzen', ic: 'sword', desc: () => '+15% Pfeilschaden.', base: 190, g: 1.35, buy: () => player.dmgMul *= 1.15 },
  { id: 'aspd', name: 'Servo-Sehne', ic: 'haste', desc: () => '+12% Feuerrate.', base: 190, g: 1.35, buy: () => player.aspdMul *= 1.12 },
  { id: 'armor', name: 'Nano-Panzerung', ic: 'shield', desc: () => '7% weniger erlittener Schaden.', base: 260, g: 1.4, max: 5, buy: () => player.armor += .07 },
  { id: 'hp', name: 'Vitalmodul', ic: 'heart', desc: () => '+30 maximale Leben, heilt 30.', base: 170, g: 1.3, buy: () => { player.maxHp += 30; player.hp += 30; } },
  { id: 'en', name: 'Energiezelle', ic: 'bolt', desc: () => '+25 max. Energie, +1,5 Regeneration pro Sekunde.', base: 150, g: 1.3, max: 6, buy: () => { player.maxEnergy += 25; player.energy += 25; player.enRegen += 1.5; } },
  { id: 'speed', name: 'Servo-Stiefel', ic: 'boot', desc: () => '+8% Lauftempo.', base: 140, g: 1.3, max: 5, buy: () => player.spdMul *= 1.08 },
  { id: 'cdr', name: 'Kühlsystem', ic: 'clock', desc: () => '10% kürzere Abklingzeit der Fähigkeiten.', base: 280, g: 1.4, max: 4, buy: () => player.cdr += .1 },
  { id: 'od', name: 'Overdrive-Chip', ic: 'overdrive', desc: () => 'Schaltet Fähigkeit 4 frei: 7 s lang mehr Schaden und Feuerrate.', base: 520, g: 1, max: 1, buy: () => { player.hasOD = true; } }
];
const shopLv = {};
function shopCost(it) { return it.cost ? it.cost() : Math.round(it.base * Math.pow(it.g, shopLv[it.id] || 0) / 5) * 5; }
function renderShop() {
  const el = $('shopScreen'), old = el.querySelector('.card'), sc = old ? old.scrollTop : 0, p = player;
  const aps = (aspdNow() / .62).toFixed(2).replace('.', ',');
  el.innerHTML = `<div class="card"><div class="shopHead"><div><h2>AUSRÜSTUNGS-SHOP</h2><div class="note" style="margin:.3rem 0 0">Welle ${S.wave} geschafft. Rüste dich für Welle ${Math.min(S.maxWave, S.wave + 1)}.</div></div><div class="shopGold">$ ${fmt(S.gold)}</div></div>` +
    `<div class="grid">` + SHOP.map(it => {
      const lv = shopLv[it.id] || 0, maxed = it.max && lv >= it.max, cost = shopCost(it);
      const ok = !maxed && S.gold >= cost && (!it.can || it.can());
      return `<div class="item"><div class="ic">${svgIcon(it.ic)}</div><h3>${it.name}</h3><p>${it.desc()}</p>` +
        (it.repeat ? '' : `<div class="lv">STUFE ${lv}${it.max ? ' / ' + it.max : ''}</div>`) +
        `<button class="buy" data-id="${it.id}" ${ok ? '' : 'disabled'}>${maxed ? 'MAX' : '$ ' + fmt(cost)}</button></div>`;
    }).join('') + `</div><div class="shopFoot"><div class="stats"><span>Schaden <b>${Math.round(dmgNow())}</b></span><span>Schüsse/s <b>${aps}</b></span><span>Leben <b>${Math.ceil(p.hp)}/${Math.round(p.maxHp)}</b></span><span>Rüstung <b>${Math.round(p.armor * 100)}%</b></span><span>Krit <b>${Math.round(p.crit * 100)}%</b></span></div><button class="btn" id="btnNext">NÄCHSTE WELLE ▶</button></div></div>`;
  el.querySelectorAll('.buy').forEach(b => b.addEventListener('click', () => buyItem(b.dataset.id)));
  $('btnNext').addEventListener('click', () => { audioInit(); sfx('start', 0); hideScreen('shopScreen'); startNextWave(); });
  const nc = el.querySelector('.card'); if (nc) nc.scrollTop = sc;
}
function buyItem(id) {
  const it = SHOP.find(x => x.id === id), lv = shopLv[id] || 0, cost = shopCost(it);
  if (!it || (it.max && lv >= it.max) || S.gold < cost || (it.can && !it.can())) { sfx('deny', 0); return; }
  S.gold -= cost; shopLv[id] = lv + 1; it.buy(); sfx('buy', 0); renderShop();
}
function openShop() { S.state = 'shop'; renderShop(); showScreen('shopScreen'); const b = $('btnNext'); if (b) b.focus(); }

/* ================= End screen ================= */
function showEnd(win) {
  const el = $('endScreen');
  el.innerHTML = `<div class="card"><h2 style="color:${win ? 'var(--gold)' : 'var(--red)'}">${win ? 'SIEG' : 'GEFALLEN'}</h2>` +
    `<div class="note" style="margin:.2rem 0 0">${win ? 'Alle 20 Wellen sind überstanden.' : 'Du hast Welle ' + S.wave + ' erreicht.'}</div>` +
    `<div class="endStats"><span>Welle</span><b>${S.wave} / ${S.maxWave}</b><span>Level</span><b>${S.level}</b><span>Besiegte Gegner</span><b>${S.kills}</b><span>Gesammeltes Gold</span><b>$ ${fmt(S.totalGold)}</b></div>` +
    `<button class="btn" id="btnAgain">NOCH EINMAL</button></div>`;
  showScreen('endScreen');
  $('btnAgain').addEventListener('click', () => { audioInit(); hideScreen('endScreen'); newRun(); });
}
