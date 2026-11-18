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
    bow: () => '<path d="M7 3c8 3 8 15 0 18" stroke="#7fe0ff" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M7 3v18M7 12h14" stroke="#fff" stroke-width="1.3"/><path d="M21 12l-4-2.5v5z" fill="#fff"/>',
    xbow: () => '<path d="M3 8c6-3 12-3 18 0" stroke="#ff9a3a" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M12 6v15" stroke="#fff" stroke-width="2.4"/><path d="M12 21l-2.6-4h5.2z" fill="#fff"/><path d="M3 8l9 5 9-5" stroke="#ffd0a0" stroke-width="1" fill="none"/>',
    rapid: () => '<path d="M4 6h12M2 12h16M4 18h12" stroke="#6dff9a" stroke-width="2.2" stroke-linecap="round"/><path d="M16 3l6 3-6 3zM18 9l4 3-4 3zM16 15l6 3-6 3z" fill="#fff"/>',
    gem: () => '<path d="M6 3h12l4 6-10 12L2 9z" fill="#4cc3ff"/><path d="M2 9h20M9 3l-2 6 5 12 5-12-2-6" stroke="#dff6ff" stroke-width="1" fill="none"/>',
    boom: () => '<circle cx="12" cy="12" r="4" fill="#ffb030"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5M4 4l3.5 3.5M16.5 16.5L20 20M20 4l-3.5 3.5M7.5 16.5L4 20" stroke="#ff7a20" stroke-width="2.4" stroke-linecap="round"/>',
    chain: () => '<path d="M14 2 6 13h5l-3 9 11-13h-6z" fill="#8fe9ff" stroke="#fff" stroke-width=".8" stroke-linejoin="round"/>',
    inferno: () => '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 1.5 2 2 3 .8-2.6.4-5.6 1-8z" fill="#ff4a20"/><circle cx="4" cy="19" r="2" fill="#ffb030"/><circle cx="20" cy="19" r="2" fill="#ffb030"/>',
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
  const box = $('abilities'); if (!box) return; box.innerHTML = '';
  AB.forEach((a, i) => {
    const w = document.createElement('div'); w.className = 'slotWrap';
    w.innerHTML = `<div class="slot" title="${a.name}">${svgIcon(a.ic)}<div class="mask"></div><div class="num"></div>${i === 1 ? '<div class="badge"></div>' : ''}</div><div class="key">${a.key}</div>`;
    const s = w.firstChild;
    s.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit(); useAbility(i); });
    box.appendChild(w);
    slotEls.push({ s, mask: s.querySelector('.mask'), num: s.querySelector('.num'), badge: s.querySelector('.badge') });
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
  setTxt('waveTitle', (S.roomKind === 'choice' ? 'TÜREN ' : 'RAUM ') + Math.max(1, S.wave) + (S.endless ? ' · ENDLOS' : ' / ' + S.maxWave));
  const prog = W.total ? (W.total - rem) / W.total : (S.roomKind === 'choice' ? 1 : 0);
  setW('waveFill', ((S.wave - 1 + (S.roomKind === 'choice' ? 1 : prog)) / (S.endless ? Math.max(S.wave, 1) : S.maxWave)));
  setTxt('waveEn', S.roomKind === 'choice' ? 'Wähle eine Tür' : W.cleared ? 'Tür offen ▲' : 'Gegner: ' + rem);
  setW('hpFill', p.hp / p.maxHp);
  setTxt('hpTxt', Math.ceil(p.hp) + ' / ' + Math.round(p.maxHp));
  setW('enFill', p.energy / p.maxEnergy);
  AB.forEach((a, i) => {
    const el = slotEls[i]; if (!el) return; const locked = i === 3 && !p.hasOD, cdMax = i === 1 ? (p.dashCh <= 0 ? 3.2 * (1 - p.cdr) : .25) : a.cd * (1 - p.cdr);
    let cd = p.cd[i]; if (i === 1 && p.dashCh <= 0) cd = Math.max(cd, 3.2 * (1 - p.cdr) - p.dashRegen);
    const frac = locked ? 0 : clamp(cd / cdMax, 0, 1);
    if (el.badge) { const b = p.dashCh + ''; if (el.badge.textContent !== b) el.badge.textContent = b; }
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
  { id: 'haste', name: 'Adrenalin', ic: 'haste', max: 5, desc: '+20% Feuerrate.', apply: p => p.aspdMul *= 1.2 },
  { id: 'deathx', name: 'Todesexplosion', ic: 'boom', max: 3, desc: 'Besiegte Gegner explodieren und verletzen Gegner in der Nähe.', apply: p => p.explode++ },
  { id: 'chain', name: 'Kettenblitz', ic: 'chain', max: 3, desc: 'Kritische Treffer und manche Treffer springen als Blitz auf nahe Gegner über.', apply: p => p.chain++ },
  { id: 'inferno', name: 'Flammenmeer', ic: 'inferno', max: 1, req: 'fire', desc: 'Brennende Gegner stecken beim Tod alle Gegner in der Nähe an. Benötigt Brandpfeile.', apply: p => p.spread++ }
];
function openLevelUp() {
  S.state = 'levelup'; sfx('level', 0);
  const pool = TALENTS.filter(t => (player.tal[t.id] || 0) < t.max && (!t.req || player.tal[t.req]));
  const ch = []; while (ch.length < 3 && pool.length) ch.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
  const el = $('levelScreen');
  el.innerHTML = `<div class="card"><h2>LEVEL ${S.level}</h2><div class="note" style="margin:.4rem 0 0">${MOBILE ? 'Tippe ein Talent an.' : 'Wähle ein Talent. (Taste 1, 2 oder 3)'}</div><div class="talents">` +
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

/* ================= Options (shared) ================= */
function optionsHTML() {
  const Q = ['Niedrig', 'Mittel', 'Hoch'];
  return `<div class="opts"><div class="chips">${Q.map((n, i) => `<button class="chip ${save.quality === i ? 'on' : ''}" data-q="${i}">Grafik ${n}</button>`).join('')}<button class="chip ${save.rain ? 'on' : ''}" data-rain="1">Regen ${save.rain ? 'an' : 'aus'}</button></div></div>`;
}
function bindOptions(root) {
  root.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { save.quality = +b.dataset.q; lowQ = false; writeSave(); applyQuality(); root.innerHTML = optionsHTML(); bindOptions(root); }));
  root.querySelectorAll('[data-rain]').forEach(b => b.addEventListener('click', () => { save.rain = !save.rain; writeSave(); applyRain(); root.innerHTML = optionsHTML(); bindOptions(root); }));
}

/* ================= Start screen / Werkstatt ================= */
const META = [
  { id: 'life', name: 'Panzerplatten', ic: 'heart', max: 10, desc: '+10% Start-Leben pro Stufe.', cost: l => 8 + l * 6 },
  { id: 'dmg', name: 'Kernverstärker', ic: 'sword', max: 10, desc: '+6% Grundschaden pro Stufe.', cost: l => 10 + l * 7 },
  { id: 'gold', name: 'Beutesensor', ic: 'plus', max: 8, desc: '+10% Gold aus Gegnern und Wellen-Bonus.', cost: l => 8 + l * 6 },
  { id: 'xp', name: 'Lernmodul', ic: 'bolt', max: 8, desc: '+8% Erfahrung pro Stufe.', cost: l => 8 + l * 6 }
];
function renderStart() {
  const el = $('startDyn');
  el.innerHTML = `<div class="srow"><span>Beste Welle <b>${save.best}</b></span><span>Meiste Kills <b>${save.bestKills}</b></span><span>Kerne <b>${save.cores}</b></span></div>` +
    `<div class="wcards">${WEAPONS.map((w, i) => `<div class="wcard ${save.weapon === i ? 'on' : ''}" data-w="${i}">${svgIcon(w.ic)}<h3>${w.name}</h3><p>${w.desc}</p></div>`).join('')}</div>` +
    `<div class="chips">${DIFF.map((d, i) => `<button class="chip ${save.diff === i ? 'on' : ''}" data-d="${i}">${d.name}</button>`).join('')}</div>` +
    `<div id="startOpts"></div>` +
    `<div style="text-align:center"><button class="btn" id="btnStart">SPIELEN</button><br><button class="btn2" id="btnInv">AUSRÜSTUNG</button><button class="btn2" id="btnWork">WERKSTATT</button></div>`;
  el.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { save.weapon = +b.dataset.w; writeSave(); applyWeaponVisual(); renderStart(); }));
  el.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { save.diff = +b.dataset.d; writeSave(); renderStart(); }));
  const o = $('startOpts'); o.innerHTML = optionsHTML(); bindOptions(o);
  $('btnStart').addEventListener('click', () => { audioInit(); hideScreen('startScreen'); openMap(); });
  $('btnInv').addEventListener('click', () => { audioInit(); hideScreen('startScreen'); openInv('startScreen'); });
  $('btnWork').addEventListener('click', () => { audioInit(); hideScreen('startScreen'); renderWork(); showScreen('workScreen'); });
}
function renderWork() {
  const el = $('workScreen');
  el.innerHTML = `<div class="card"><div class="shopHead"><div><h2>WERKSTATT</h2><div class="note" style="margin:.3rem 0 0">Dauerhafte Verbesserungen für jeden Lauf.</div></div><div class="shopGold">Kerne ${save.cores}</div></div><div class="wgrid">` +
    META.map(m => {
      const lv = save.meta[m.id], maxed = lv >= m.max, c = m.cost(lv), ok = !maxed && save.cores >= c;
      return `<div class="item"><div class="ic">${svgIcon(m.ic)}</div><h3>${m.name}</h3><p>${m.desc}</p><div class="lv">STUFE ${lv} / ${m.max}</div><button class="buy" data-m="${m.id}" ${ok ? '' : 'disabled'}>${maxed ? 'MAX' : c + ' Kerne'}</button></div>`;
    }).join('') + `</div><div style="text-align:center"><button class="btn sm" id="btnWBack">ZURÜCK</button></div></div>`;
  el.querySelectorAll('.buy').forEach(b => b.addEventListener('click', () => {
    const m = META.find(x => x.id === b.dataset.m), lv = save.meta[m.id], c = m.cost(lv);
    if (lv >= m.max || save.cores < c) { sfx('deny', 0); return; }
    save.cores -= c; save.meta[m.id]++; writeSave(); sfx('buy', 0); renderWork();
  }));
  $('btnWBack').addEventListener('click', () => { hideScreen('workScreen'); renderStart(); showScreen('startScreen'); });
}

/* ================= Level-Übersicht ================= */
let mapSel = { c: 0, s: 0 };
function openMap() {
  // select first unlocked, not-cleared stage
  let best = { c: 0, s: 0 };
  for (let c = 0; c < MAPS.length; c++) for (let s = 0; s < STAGES; s++) if (stageUnlocked(c, s)) best = { c, s };
  if (!stageUnlocked(mapSel.c, mapSel.s)) mapSel = best;
  renderMap(); showScreen('mapScreen');
}
function renderMap() {
  const el = $('mapScreen'), c = mapSel.c, s = mapSel.s, M = MAPS[c];
  const tabs = MAPS.map((m, i) => { const un = stageUnlocked(i, 0), done = [0, 1, 2, 3, 4].reduce((a, k) => a + (stageStars(i, k) ? 1 : 0), 0);
    return `<div class="mtab ${i === c ? 'on' : ''} ${un ? '' : 'lock'}" data-c="${i}"><div class="sw" style="background:${m.col}"></div><h3>${un ? m.name : '🔒 ' + m.name}</h3><p>${m.tier} · ${done}/${STAGES} geschafft</p></div>`; }).join('');
  const stg = [0, 1, 2, 3, 4].map(k => { const un = stageUnlocked(c, k), st = stageStars(c, k);
    return `<div class="stg ${k === s ? 'on' : ''} ${un ? '' : 'lock'} ${k === STAGES - 1 ? 'boss' : ''}" data-s="${k}"><b>${un ? (k === STAGES - 1 ? 'BOSS' : (c + 1) + '-' + (k + 1)) : '🔒'}</b><div class="st">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</div></div>`; }).join('');
  const rec = (c * STAGES + s) * 6, gs = gearScore();
  el.innerHTML = `<div class="card"><div class="shopHead"><div><h2>STAGE-AUSWAHL</h2><div class="note" style="margin:.3rem 0 0">${M.desc}</div></div><div class="shopGold">Kerne ${save.cores}</div></div>` +
    `<div class="mapTabs">${tabs}</div><div class="stages">${stg}</div>` +
    `<div class="detail"><b>${stageName(c, s)}</b> · ${stageWaves(s)} Räume${s === STAGES - 1 ? ' · Boss' : ''} · Gegner <b>${M.tier}</b> (Leben ×${M.hp}, Schaden ×${M.dmg})<br>Empfohlene Ausrüstung <b style="color:${gs >= rec ? '#6dff9a' : '#ff8a6a'}">${rec}</b> · Deine Ausrüstung <b>${gs}</b></div>` +
    `<div style="text-align:center"><button class="btn" id="btnGo">LOS</button><br><button class="btn2" id="btnMInv">AUSRÜSTUNG</button><button class="btn2" id="btnMBack">ZURÜCK</button></div></div>`;
  el.querySelectorAll('.mtab').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.c; if (!stageUnlocked(i, 0)) { sfx('deny', 0); return; } mapSel = { c: i, s: 0 }; for (let k = 0; k < STAGES; k++) if (stageUnlocked(i, k)) mapSel.s = k; renderMap(); }));
  el.querySelectorAll('.stg').forEach(b => b.addEventListener('click', () => { const k = +b.dataset.s; if (!stageUnlocked(c, k)) { sfx('deny', 0); return; } mapSel.s = k; renderMap(); }));
  $('btnGo').addEventListener('click', () => { audioInit(); sfx('start', 0); hideScreen('mapScreen'); newRun(mapSel.c, mapSel.s); });
  $('btnMInv').addEventListener('click', () => { hideScreen('mapScreen'); openInv('mapScreen'); });
  $('btnMBack').addEventListener('click', () => { hideScreen('mapScreen'); renderStart(); showScreen('startScreen'); });
}

/* ================= Inventar ================= */
let invSel = null, invBack = 'startScreen';
function statLines(it) { return Object.keys(it.st).map(k => `<div>+${(it.st[k] * (1 + .15 * it.lvl) * 100).toFixed(1).replace('.', ',')}% ${STATS[k][0]}</div>`).join(''); }
function itemCell(it, sel) {
  const sl = SLOTS.find(x => x.id === it.slot);
  return `<div class="cell ${sel ? 'sel' : ''}" data-i="${it.id}" style="border-color:${RAR[it.rar].c}">${svgIcon(sl.ic)}${it.lvl ? `<span class="lv">+${it.lvl}</span>` : ''}</div>`;
}
function openInv(back) { invBack = back || 'startScreen'; renderInv(); showScreen('invScreen'); }
function renderInv() {
  const el = $('invScreen'), inv = save.inv, g = gearStats();
  const sel = inv.find(i => i.id === invSel) || null;
  const equipped = id => SLOTS.some(sl => save.eq[sl.id] === id);
  const eqHTML = SLOTS.map(sl => { const it = inv.find(i => i.id === save.eq[sl.id]);
    return `<div class="eqRow">${it ? itemCell(it, sel && sel.id === it.id) : `<div class="cell" style="opacity:.5">${svgIcon(sl.ic)}</div>`}<div><b style="color:#fff">${sl.name}</b><br>${it ? `<span style="color:${RAR[it.rar].c}">${it.name}</span>` : 'leer'}</div></div>`; }).join('');
  const list = inv.filter(i => !equipped(i.id));
  const cells = list.map(it => itemCell(it, sel && sel.id === it.id)).join('') + Array(Math.max(0, INV_MAX - list.length - SLOTS.filter(sl => save.eq[sl.id]).length)).fill('<div class="cell" style="opacity:.25;cursor:default"></div>').join('');
  let det = '<div class="idet">Wähle einen Gegenstand.</div>';
  if (sel) { const eq = equipped(sel.id), cost = (sel.rar + 1) * (sel.lvl + 1) * 5, sell = RAR[sel.rar].sell + sel.lvl * 2;
    det = `<div class="idet"><h3 style="color:${RAR[sel.rar].c}">${sel.name} ${sel.lvl ? '+' + sel.lvl : ''}</h3><div style="color:#8fa0ad">${RAR[sel.rar].n} · ${SLOTS.find(x => x.id === sel.slot).name} · Stärke ${itemPower(sel)}</div>${statLines(sel)}<div style="margin-top:.5rem">` +
      `<button class="btn2" id="iEq">${eq ? 'Ablegen' : 'Anlegen'}</button>` + `<button class="btn2" id="iUp" ${sel.lvl >= 5 || save.cores < cost ? 'disabled' : ''}>${sel.lvl >= 5 ? 'Max' : 'Verbessern (' + cost + ' Kerne)'}</button>` + (eq ? '' : `<button class="btn2" id="iSell">Verkaufen (+${sell})</button>`) + `</div></div>`; }
  const sum = Object.keys(g).filter(k => g[k] > 0).map(k => `${STATS[k][0]} +${(g[k] * 100).toFixed(0)}%`).join(' · ') || 'keine Boni';
  el.innerHTML = `<div class="card"><div class="shopHead"><div><h2>AUSRÜSTUNG</h2><div class="note" style="margin:.3rem 0 0">${sum}</div></div><div class="shopGold">Kerne ${save.cores}</div></div><div class="invWrap"><div class="eqCol">${eqHTML}</div><div><div class="igrid">${cells}</div>${det}</div></div><div style="text-align:center;margin-top:.8rem"><button class="btn sm" id="iBack">ZURÜCK</button></div></div>`;
  el.querySelectorAll('.cell[data-i]').forEach(c => c.addEventListener('click', () => { invSel = +c.dataset.i; renderInv(); }));
  if (sel) {
    $('iEq').addEventListener('click', () => { if (equipped(sel.id)) save.eq[sel.slot] = 0; else save.eq[sel.slot] = sel.id; writeSave(); sfx('buy', 0); renderInv(); });
    $('iUp').addEventListener('click', () => { const cost = (sel.rar + 1) * (sel.lvl + 1) * 5; if (sel.lvl >= 5 || save.cores < cost) return; save.cores -= cost; sel.lvl++; writeSave(); sfx('level', 0); renderInv(); });
    const sb = $('iSell'); if (sb) sb.addEventListener('click', () => { save.cores += RAR[sel.rar].sell + sel.lvl * 2; save.inv = save.inv.filter(i => i.id !== sel.id); invSel = null; writeSave(); sfx('buy', 0); renderInv(); });
  }
  $('iBack').addEventListener('click', () => { hideScreen('invScreen'); if (invBack === 'mapScreen') openMap(); else { renderStart(); showScreen('startScreen'); } });
}

/* ================= End screen ================= */
function showEnd(win) {
  const el = $('endScreen'), cores = S.lastCores || 0, final = S.map === MAPS.length - 1 && S.stage === STAGES - 1;
  const next = win && !S.endless && !final ? (S.stage < STAGES - 1 ? [S.map, S.stage + 1] : [S.map + 1, 0]) : null;
  const drops = (S.drops || []).map(it => `<div style="color:${RAR[it.rar].c}">${it.name} (${RAR[it.rar].n})${it.auto ? ' – Inventar voll, verkauft für ' + it.auto + ' Kerne' : ''}</div>`).join('');
  el.innerHTML = `<div class="card"><h2 style="color:${win ? 'var(--gold)' : 'var(--red)'}">${win ? 'STAGE GESCHAFFT' : 'GEFALLEN'}</h2>` +
    `<div class="note" style="margin:.2rem 0 0">${win ? stageName(S.map, S.stage) + ' · ' + '★'.repeat(S.stars) + '☆'.repeat(3 - S.stars) : 'Du hast Raum ' + S.wave + ' erreicht (' + stageName(S.map, S.stage) + ').'}</div>` +
    `<div class="endStats"><span>Raum</span><b>${S.wave}${S.endless ? '' : ' / ' + S.maxWave}</b><span>Level</span><b>${S.level}</b><span>Besiegte Gegner</span><b>${S.kills}</b><span>Gesammeltes Gold</span><b>$ ${fmt(S.totalGold)}</b><span>Verdiente Kerne</span><b>+${cores}</b></div>` +
    (drops ? `<div class="detail"><b>Beute</b>${drops}</div>` : '') +
    `<div style="text-align:center">${next ? '<button class="btn" id="btnNextStage">NÄCHSTE STAGE</button><br>' : ''}${win && final && !S.endless ? '<button class="btn" id="btnEndless">ENDLOS WEITER</button><br>' : ''}<button class="btn ${win ? 'sm' : ''}" id="btnAgain">NOCH EINMAL</button><br><button class="btn2" id="btnToMap">STAGE-AUSWAHL</button><button class="btn2" id="btnEInv">AUSRÜSTUNG</button><button class="btn2" id="btnToMenu">HAUPTMENÜ</button></div></div>`;
  showScreen('endScreen');
  $('btnAgain').addEventListener('click', () => { audioInit(); hideScreen('endScreen'); newRun(); });
  $('btnToMenu').addEventListener('click', () => { hideScreen('endScreen'); toMenu(); });
  $('btnToMap').addEventListener('click', () => { hideScreen('endScreen'); toMenu(); hideScreen('startScreen'); mapSel = { c: S.map, s: S.stage }; openMap(); });
  $('btnEInv').addEventListener('click', () => { hideScreen('endScreen'); toMenu(); hideScreen('startScreen'); openInv('mapScreen'); });
  if (next) $('btnNextStage').addEventListener('click', () => { audioInit(); hideScreen('endScreen'); mapSel = { c: next[0], s: next[1] }; newRun(next[0], next[1]); });
  if (win && final && !S.endless) $('btnEndless').addEventListener('click', () => { audioInit(); hideScreen('endScreen'); S.endless = true; S.state = 'trans'; transition(() => startWave(S.wave + 1)); });
}
