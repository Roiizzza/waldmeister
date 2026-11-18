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
    multi: () => '<g stroke="#8fe9ff" stroke-width="2" stroke-linecap="round" fill="none"><path d="M1.5 12H8M12.5 12H19"/></g><path d="M10.5 12 7 9.2v5.6zM22.5 12 19 9.2v5.6z" fill="#fff"/>',
    dbl: () => '<g stroke="#8fe9ff" stroke-width="2" stroke-linecap="round" fill="none"><path d="M2 8h14M2 16h14"/></g><path d="M22 8l-5-3v6zM22 16l-5-3v6z" fill="#fff"/>',
    wall: () => '<path d="M3 21 12 4 21 21" stroke="#9fefff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 3v18M22 3v18" stroke="#8a97a6" stroke-width="2"/>',
    freeze: () => '<g stroke="#bff3ff" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/></g>',
    homing: () => '<circle cx="12" cy="12" r="8" stroke="#ff6b5b" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="2.5" fill="#ff6b5b"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5" stroke="#fff" stroke-width="2"/>',
    exec: () => '<path d="M4 4l16 16M20 4 4 20" stroke="#ff4a3a" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="#fff"/>',
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
  if (S.inf) {
    const t = Math.floor(S.infT); setTxt('waveTitle', 'ENDLOS ' + Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'));
    setW('waveFill', (S.infT % 14) / 14); setTxt('waveEn', 'Gegner: ' + W.alive + ' · Kills ' + S.kills);
  } else {
  setTxt('waveTitle', (S.roomKind === 'choice' ? 'TÜREN ' : 'RAUM ') + Math.max(1, S.wave) + (S.endless ? ' · ENDLOS' : ' / ' + S.maxWave));
  const prog = W.total ? (W.total - rem) / W.total : (S.roomKind === 'choice' ? 1 : 0);
  setW('waveFill', ((S.wave - 1 + (S.roomKind === 'choice' ? 1 : prog)) / (S.endless ? Math.max(S.wave, 1) : S.maxWave)));
  setTxt('waveEn', S.roomKind === 'choice' ? 'Wähle eine Tür' : W.cleared ? 'Tür offen ▲' : 'Gegner: ' + rem);
  }
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
  { id: 'multi', name: 'Mehrfachschuss', ic: 'multi', capInf: 4, max: 2, desc: '+1 Pfeil hintereinander: Jeder Schuss feuert kurz nacheinander noch einmal.', apply: p => p.dbl++ },
  { id: 'dbl', name: 'Doppelschuss', ic: 'dbl', capInf: 6, max: 3, desc: '+1 Pfeil nebeneinander pro Schuss. Schaden pro Pfeil sinkt leicht.', apply: p => p.multi++ },
  { id: 'pierce', inf: 1, name: 'Durchschlagender Pfeil', ic: 'pierce', max: 1, desc: 'Pfeile durchbohren einen Gegner und treffen den dahinter.', apply: p => p.pierce++ },
  { id: 'ricochet', inf: 1, name: 'Querschläger', ic: 'ricochet', max: 1, desc: 'Pfeile springen nach einem Treffer auf einen weiteren Gegner über.', apply: p => p.ricochet++ },
  { id: 'wall', inf: 1, name: 'Wandabpraller', ic: 'wall', max: 1, desc: 'Pfeile prallen bis zu 2-mal an Wänden ab und treffen auch um die Ecke.', apply: p => p.wall += 2 },
  { id: 'homing', name: 'Zielsuchend', ic: 'homing', max: 1, desc: 'Pfeile lenken leicht auf nahe Gegner ein.', apply: p => p.homing++ },
  { id: 'freeze', name: 'Frostpfeile', ic: 'freeze', max: 1, desc: 'Getroffene Gegner sind 2 Sekunden lang um 45% verlangsamt.', apply: p => p.freeze++ },
  { id: 'exec', inf: 1, name: 'Henker', ic: 'exec', max: 2, desc: '+50% Schaden gegen Gegner unter 35% Leben.', apply: p => p.exec++ },
  { id: 'crit', inf: 1, name: 'Scharfschütze', ic: 'crit', max: 5, desc: '+12% Krit-Chance. Kritische Treffer machen 2,2-fachen Schaden.', apply: p => p.crit += .12 },
  { id: 'fire', inf: 1, name: 'Brandpfeile', ic: 'fire', max: 3, desc: 'Treffer setzen Gegner in Brand und verursachen Schaden über Zeit.', apply: p => p.fire++ },
  { id: 'vamp', inf: 1, name: 'Blutdurst', ic: 'vamp', max: 3, desc: 'Jeder besiegte Gegner heilt dich um 4 Leben.', apply: p => p.vamp += 4 },
  { id: 'hp', inf: 1, name: 'Zähigkeit', ic: 'heart', max: 4, desc: '+25% maximale Leben und sofortige Heilung um diesen Betrag.', apply: p => { const d = p.maxHp * .25; p.maxHp += d; p.hp += d; } },
  { id: 'rage', inf: 1, name: 'Plasma-Kern', ic: 'sword', max: 6, desc: '+25% Pfeilschaden.', apply: p => p.dmgMul *= 1.25 },
  { id: 'haste', inf: 1, name: 'Adrenalin', ic: 'haste', max: 5, desc: '+20% Feuerrate.', apply: p => p.aspdMul *= 1.2 },
  { id: 'deathx', inf: 1, name: 'Todesexplosion', ic: 'boom', max: 3, desc: 'Besiegte Gegner explodieren und verletzen Gegner in der Nähe.', apply: p => p.explode++ },
  { id: 'chain', inf: 1, name: 'Kettenblitz', ic: 'chain', max: 3, desc: 'Kritische Treffer und manche Treffer springen als Blitz auf nahe Gegner über.', apply: p => p.chain++ },
  { id: 'inferno', name: 'Flammenmeer', ic: 'inferno', max: 1, req: 'fire', desc: 'Brennende Gegner stecken beim Tod alle Gegner in der Nähe an. Benötigt Brandpfeile.', apply: p => p.spread++ }
];
const talentMax = t => S.inf ? (t.capInf || (t.inf ? 1e9 : t.max)) : t.max;
const talentPool = () => TALENTS.filter(t => (player.tal[t.id] || 0) < talentMax(t) && (!t.req || player.tal[t.req]));
function talentListHTML() {
  const l = TALENTS.filter(t => player.tal[t.id]);
  if (!l.length) return '<div class="note" style="margin:.6rem 0">Noch keine Effekte gewählt.</div>';
  return '<div class="tlist">' + l.map(t => `<div class="trow"><div class="ic">${svgIcon(t.ic)}</div><div><b>${t.name}</b> <span class="lv">Stufe ${player.tal[t.id]}${talentMax(t) < 99 ? '/' + talentMax(t) : ''}</span><p>${t.desc}</p></div></div>`).join('') + '</div>';
}
function openLevelUp() {
  S.state = 'levelup'; sfx('level', 0);
  const pool = talentPool();
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
  sfx('buy', 0); S.pendingLv--; hideScreen('levelScreen'); renderTalList();
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
  return `<div class="opts"><div class="chips">${Q.map((n, i) => `<button class="chip ${save.quality === i ? 'on' : ''}" data-q="${i}">Grafik ${n}</button>`).join('')}<button class="chip ${save.rain ? 'on' : ''}" data-rain="1">Regen ${save.rain ? 'an' : 'aus'}</button></div>` +
    `<div class="chips"><button class="chip ${save.sound ? 'on' : ''}" data-snd="1">Ton ${save.sound ? 'an' : 'aus'}</button><button class="chip ${save.vib ? 'on' : ''}" data-vib="1">Vibration ${save.vib ? 'an' : 'aus'}</button>${['Klein', 'Mittel', 'Groß'].map((n, i) => `<button class="chip ${save.joy === i ? 'on' : ''}" data-joy="${i}">Stick ${n}</button>`).join('')}</div>${S.state === 'menu' ? `<div class="chips"><button class="chip reset" data-reset="1">Spielstand neu beginnen</button></div>` : ''}</div>`;
}
function bindOptions(root) {
  root.querySelectorAll('[data-reset]').forEach(b => b.addEventListener('click', () => {
    if (!b._arm) { b._arm = 1; b.textContent = 'Wirklich alles löschen? Nochmal tippen'; b.classList.add('on'); setTimeout(() => { b._arm = 0; b.textContent = 'Spielstand neu beginnen'; b.classList.remove('on'); }, 4000); return; }
    try { localStorage.removeItem(SAVE_KEY); } catch (_) { } location.reload();
  }));
  root.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { save.quality = +b.dataset.q; lowQ = false; writeSave(); applyQuality(); root.innerHTML = optionsHTML(); bindOptions(root); }));
  root.querySelectorAll('[data-snd]').forEach(b => b.addEventListener('click', () => { save.sound = !save.sound; applyAudioJoy(); writeSave(); root.innerHTML = optionsHTML(); bindOptions(root); }));
  root.querySelectorAll('[data-vib]').forEach(b => b.addEventListener('click', () => { save.vib = !save.vib; writeSave(); vib(40); root.innerHTML = optionsHTML(); bindOptions(root); }));
  root.querySelectorAll('[data-joy]').forEach(b => b.addEventListener('click', () => { save.joy = +b.dataset.joy; applyAudioJoy(); writeSave(); root.innerHTML = optionsHTML(); bindOptions(root); }));
  root.querySelectorAll('[data-rain]').forEach(b => b.addEventListener('click', () => { save.rain = !save.rain; writeSave(); applyRain(); root.innerHTML = optionsHTML(); bindOptions(root); }));
}

/* ================= Start screen / Werkstatt ================= */
const META = [
  { id: 'life', name: 'Panzerplatten', ic: 'heart', max: 10, desc: '+10% Start-Leben pro Stufe.', cost: l => 8 + l * 6 },
  { id: 'dmg', name: 'Kernverstärker', ic: 'sword', max: 10, desc: '+6% Grundschaden pro Stufe.', cost: l => 10 + l * 7 },
  { id: 'gold', name: 'Beutesensor', ic: 'plus', max: 8, desc: '+10% Gold aus Gegnern und Wellen-Bonus.', cost: l => 8 + l * 6 },
  { id: 'xp', name: 'Lernmodul', ic: 'bolt', max: 8, desc: '+8% Erfahrung pro Stufe.', cost: l => 8 + l * 6 }
];
function fmtT(t) { t = Math.floor(t); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
function renderStart() {
  const el = $('startDyn');
  el.innerHTML = `<div class="srow"><span>Weitester Level <b>${Math.max(0, ...Object.keys(save.stars).filter(k => k[0] === 'L').map(k => +k.slice(1) + 1))}</b></span><span>Endlos-Bestzeit <b>${fmtT(save.infBest || 0)}</b></span><span>Meiste Kills <b>${save.bestKills}</b></span></div>` +
    `<div class="wcards">${WEAPONS.map((w, i) => `<div class="wcard ${save.weapon === i ? 'on' : ''}" data-w="${i}">${svgIcon(w.ic)}<h3>${w.name}${save.wlvl[i] ? ' +' + save.wlvl[i] : ''}</h3><p>${w.desc}</p></div>`).join('')}</div>` +
    `<div class="chips">${DIFF.map((d, i) => `<button class="chip ${save.diff === i ? 'on' : ''}" data-d="${i}">${d.name}</button>`).join('')}</div>` +
    `<div class="playRow"><button class="btn" id="btnStart">SPIELEN</button><button class="btn endl" id="btnInf">ENDLOS<small>Bestzeit ${fmtT(save.infBest || 0)}</small></button></div>` +
    `<details class="keysBox"><summary class="note" style="cursor:pointer">Optionen</summary><div id="startOpts"></div></details>`;
  el.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { save.weapon = +b.dataset.w; writeSave(); applyWeaponVisual(); renderStart(); }));
  el.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { save.diff = +b.dataset.d; writeSave(); renderStart(); }));
  const o = $('startOpts'); o.innerHTML = optionsHTML(); bindOptions(o);
  $('btnStart').addEventListener('click', () => goTab('map'));
  $('btnInf').addEventListener('click', () => { audioInit(); sfx('start', 0); hideMenuUi(); newRun((Math.random() * MAPS.length) | 0, 0, true); });
}
/* ===== Tab-Navigation ===== */
const TABS = { home: 'startScreen', gear: 'invScreen', smith: 'smithScreen', work: 'workScreen', daily: 'dailyScreen', map: 'mapScreen' };
let curTab = 'home';
function hideMenuUi() { Object.values(TABS).forEach(hideScreen); $('nav').classList.add('hidden'); $('resBar').classList.add('hidden'); }
function goTab(t) {
  audioInit(); Object.values(TABS).forEach(hideScreen); curTab = t;
  if (t === 'home') renderStart(); else if (t === 'gear') renderInv(); else if (t === 'smith') renderSmith(); else if (t === 'work') renderWork(); else if (t === 'daily') renderDaily(); else if (t === 'map') openMap();
  showScreen(TABS[t]); if (t === 'map') scrollMapToSel(); $('nav').classList.remove('hidden'); $('resBar').classList.remove('hidden'); updateNav();
}
function updateNav() {
  const act = curTab === 'map' ? 'home' : curTab;
  document.querySelectorAll('#nav button').forEach(b => { b.classList.toggle('on', b.dataset.t === act); const d = b.querySelector('.dot'); if (d) d.classList.toggle('hidden', !(b.dataset.t === 'daily' && dailyClaimable())); });
  $('rCores').textContent = fmt(save.cores); $('rOre').textContent = save.ore; $('rRune').textContent = save.rune;
}
function initNav() {
  const ic = { work: 'bolt', gear: 'shield', home: 'bow', smith: 'sword', daily: 'clock' }, nm = { work: 'Werkstatt', gear: 'Ausrüstung', home: 'Spielen', smith: 'Schmiede', daily: 'Aufgaben' };
  $('nav').innerHTML = ['work', 'gear', 'home', 'smith', 'daily'].map(t => `<button data-t="${t}" class="${t === 'home' ? 'mid' : ''}"><i>${svgIcon(ic[t])}</i><span>${nm[t]}</span><em class="dot hidden"></em></button>`).join('');
  $('nav').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { sfx('buy', 0); goTab(b.dataset.t); }));
  setInterval(() => { if (!$('nav').classList.contains('hidden')) updateNav(); }, 400);
}
function renderWork() {
  const el = $('workScreen');
  el.innerHTML = `<div class="card"><div class="shopHead"><div><h2>WERKSTATT</h2><div class="note" style="margin:.3rem 0 0">Dauerhafte Verbesserungen für jeden Lauf.</div></div><div class="shopGold">Kerne ${save.cores}</div></div><div class="wgrid">` +
    META.map(m => {
      const lv = save.meta[m.id], maxed = lv >= m.max, c = m.cost(lv), ok = !maxed && save.cores >= c;
      return `<div class="item"><div class="ic">${svgIcon(m.ic)}</div><h3>${m.name}</h3><p>${m.desc}</p><div class="lv">STUFE ${lv} / ${m.max}</div><button class="buy" data-m="${m.id}" ${ok ? '' : 'disabled'}>${maxed ? 'MAX' : c + ' Kerne'}</button></div>`;
    }).join('') + `</div></div>`;
  el.querySelectorAll('.buy').forEach(b => b.addEventListener('click', () => {
    const m = META.find(x => x.id === b.dataset.m), lv = save.meta[m.id], c = m.cost(lv);
    if (lv >= m.max || save.cores < c) { sfx('deny', 0); return; }
    save.cores -= c; save.meta[m.id]++; writeSave(); sfx('buy', 0); renderWork();
  }));
}

/* ================= Level-Pfad ================= */
let mapSel = 0, mapScroll = true, mapKeep = false;
function openMap() {
  let best = 0; for (let L = 0; L < PATH_LEN; L++) if (stageUnlocked(L)) best = L;
  if (!mapKeep || !stageUnlocked(mapSel)) mapSel = best; mapKeep = false;
  mapScroll = true; renderMap();
}
function scrollMapToSel() {
  const sc = $('pscroll'); if (!sc) return; const ROW = 9.5, offs = 0, y = (PATH_LEN - 1 - mapSel) * ROW + 6, fs = parseFloat(getComputedStyle(document.documentElement).fontSize);
  sc.scrollTop = Math.max(0, y * fs - sc.clientHeight * .6);
}
function renderMap() {
  const el = $('mapScreen'), L = mapSel, M = MAPS[PATH[L]], ROW = 9.5, offs = [0, 6, 9, 6, 0, -6, -9, -6];
  let svg = '', nodes = '';
  const pos = i => ({ x: 50 + offs[i % 8] * 3.2, y: (PATH_LEN - 1 - i) * ROW + 6 });
  for (let i = 0; i < PATH_LEN; i++) {
    const q = pos(i), m = MAPS[PATH[i]], un = stageUnlocked(i), st = stageStars(i), boss = isBossLvl(i);
    if (i < PATH_LEN - 1) { const n = pos(i + 1); svg += `<line x1="${q.x}%" y1="${q.y}rem" x2="${n.x}%" y2="${n.y}rem" class="pl ${stageStars(i) ? 'done' : ''}"/>`; }
    nodes += `<div class="pnode ${i === L ? 'on' : ''} ${un ? '' : 'lock'} ${boss ? 'boss' : ''} ${un && !st ? 'cur' : ''}" data-l="${i}" style="left:${q.x}%;top:${q.y}rem"><div class="pcirc" style="--c:${m.col}"><b>${un ? (boss ? '☠' : i + 1) : '🔒'}</b></div><div class="pst">${un ? '<span>' + '★'.repeat(st) + '☆'.repeat(3 - st) + '</span>' : ''}</div><div class="pmap">${un ? m.name : ''}</div></div>`;
  }
  const rec = L * 6, gs = gearScore(), un = stageUnlocked(L);
  el.innerHTML = `<div class="card"><div class="ptitle">LEVEL-PFAD</div><div class="pscroll" id="pscroll"><div class="ppath" style="height:${PATH_LEN * ROW + 8}rem"><svg class="psvg" width="100%" height="100%">${svg}</svg>${nodes}</div></div>` +
    `<div class="psheet"><div><b style="font-size:1.8rem">${stageName(L)}</b><div class="pinfo">${stageWaves(L)} Räume${isBossLvl(L) ? ' · <span style="color:#ff6a4a">BOSS</span>' : ''} · Leben ×${lvHp(L).toFixed(1)} · Schaden ×${lvDmg(L).toFixed(1)}<br>${M.desc}<br>Empfohlen <b style="color:${gs >= rec ? '#6dff9a' : '#ff8a6a'}">${rec}</b> · Deine Ausrüstung <b>${gs}</b></div></div><button class="btn" id="btnGo" ${un ? '' : 'disabled'}>LOS</button></div></div>`;
  el.querySelectorAll('.pnode').forEach(n => n.addEventListener('click', () => { const i = +n.dataset.l; if (!stageUnlocked(i)) { sfx('deny', 0); return; } mapSel = i; mapScroll = false; const sc = $('pscroll').scrollTop; renderMap(); $('pscroll').scrollTop = sc; }));
  $('btnGo').addEventListener('click', () => { audioInit(); sfx('start', 0); hideMenuUi(); newRun(PATH[mapSel], mapSel, false); });
}

/* ================= Inventar ================= */
let invSel = null;
function statLines(it) { return Object.keys(it.st).map(k => `<div>+${(it.st[k] * (1 + .15 * it.lvl) * 100).toFixed(1).replace('.', ',')}% ${STATS[k][0]}</div>`).join(''); }
function itemCell(it, sel, attr) {
  const sl = SLOTS.find(x => x.id === it.slot), c = RAR[it.rar].c;
  return `<div class="tile ${sel ? 'sel' : ''}" ${attr || 'data-i'}="${it.id}" style="--rc:${c}"><span class="tset">${it.set !== undefined ? SETS[it.set].n[0] : ''}</span>${svgIcon(sl.ic)}${it.lvl ? `<span class="tlv">+${it.lvl}</span>` : ''}</div>`;
}
let invSort = 0;
function openInv() { goTab('gear'); }
function renderInv() {
  const el = $('invScreen'), inv = save.inv, g = gearStats();
  const sel = inv.find(i => i.id === invSel) || null;
  const equipped = id => SLOTS.some(sl => save.eq[sl.id] === id);
  const slotHTML = sl => { const it = inv.find(i => i.id === save.eq[sl.id]);
    return it ? itemCell(it, sel && sel.id === it.id).replace('class="tile', 'class="tile big') : `<div class="tile big empty">${svgIcon(sl.ic)}</div>`; };
  const list = inv.filter(i => !equipped(i.id)).sort((a, b) => invSort === 0 ? (b.rar - a.rar || b.lvl - a.lvl) : invSort === 1 ? (a.slot > b.slot ? 1 : -1) : (b.lvl - a.lvl));
  const cells = list.map(it => itemCell(it, sel && sel.id === it.id)).join('') + Array(Math.max(0, INV_MAX - inv.length)).fill('<div class="tile empty ghost"></div>').join('');
  const atk = Math.round(22 * (WEAPONS[save.weapon] || WEAPONS[0]).dmg * (1 + .06 * save.meta.dmg) * (1 + .1 * (save.wlvl[save.weapon] || 0)) * (1 + g.dmg)), hp = Math.round(200 * (1 + .1 * save.meta.life) * (1 + g.hp));
  let det = '';
  if (sel) { const eq = equipped(sel.id), sell = RAR[sel.rar].sell + sel.lvl * 2;
    det = `<div class="idet sheet"><h3 style="color:${RAR[sel.rar].c}">${sel.name} ${sel.lvl ? '+' + sel.lvl : ''}</h3><div style="color:#8fa0ad">${RAR[sel.rar].n} · ${SLOTS.find(x => x.id === sel.slot).name} · ${sel.set !== undefined ? SETS[sel.set].n + '-Set · ' : ''}Stärke ${itemPower(sel)}</div>${statLines(sel)}<div class="irow">` +
      `<button class="pill" id="iEq">${eq ? 'Ablegen' : 'Anlegen'}</button><button class="pill gold" id="iUp">Schmieden</button>` + (eq ? '' : `<button class="pill" id="iSell">Verkaufen +${sell}</button>`) + `</div></div>`; }
  const sinf = setInfo();
  el.innerHTML = `<div class="card"><div class="gearTop"><div class="gcol">${slotHTML(SLOTS[0])}${slotHTML(SLOTS[1])}</div><div class="gmid"><div class="gstat"><span>ATK</span><b>${atk}</b><span>HP</span><b>${hp}</b></div>${sinf.length ? `<div class="gset">${sinf.join(' · ')}</div>` : ''}</div><div class="gcol">${slotHTML(SLOTS[2])}${slotHTML(SLOTS[3])}</div></div>` +
    `<div class="gearBar"><button class="pill gold" id="iSort">${['Nach Qualität', 'Nach Slot', 'Nach Stufe'][invSort]}</button><button class="pill gold" id="iSmithGo">Schmiede</button></div>` +
    `<div class="tgrid">${cells}</div>${det}</div>`;
  el.querySelectorAll('.tile[data-i]').forEach(c => c.addEventListener('click', () => { invSel = +c.dataset.i; renderInv(); }));
  $('iSort').addEventListener('click', () => { invSort = (invSort + 1) % 3; renderInv(); });
  $('iSmithGo').addEventListener('click', () => { smithSel = invSel ? { t: 'i', id: invSel } : null; smithMsg = ''; goTab('smith'); });
  if (sel) {
    $('iEq').addEventListener('click', () => { if (equipped(sel.id)) save.eq[sel.slot] = 0; else save.eq[sel.slot] = sel.id; writeSave(); sfx('buy', 0); renderInv(); });
    $('iUp').addEventListener('click', () => { smithSel = { t: 'i', id: sel.id }; smithMsg = ''; goTab('smith'); });
    const sb = $('iSell'); if (sb) sb.addEventListener('click', () => { save.cores += RAR[sel.rar].sell + sel.lvl * 2; save.inv = save.inv.filter(i => i.id !== sel.id); invSel = null; writeSave(); sfx('buy', 0); renderInv(); });
  }
}

/* ================= End screen ================= */
function showEnd(win) {
  const el = $('endScreen'), cores = S.lastCores || 0, final = S.stage === PATH_LEN - 1;
  const next = win && !S.inf && !final ? S.stage + 1 : null;
  const drops = (S.drops || []).map(it => `<div style="color:${RAR[it.rar].c}">${it.name} (${RAR[it.rar].n})${it.auto ? ' – Inventar voll, verkauft für ' + it.auto + ' Kerne' : ''}</div>`).join('');
  el.innerHTML = `<div class="card"><h2 style="color:${win ? 'var(--gold)' : 'var(--red)'}">${win ? 'STAGE GESCHAFFT' : 'GEFALLEN'}</h2>` +
    `<div class="note" style="margin:.2rem 0 0">${win ? stageName(S.stage) + ' · ' + '★'.repeat(S.stars) + '☆'.repeat(3 - S.stars) : S.inf ? 'Endlos · ' + MAPS[S.map].name : 'Du hast Raum ' + S.wave + ' erreicht (' + stageName(S.stage) + ').'}</div>` +
    `<div class="endStats">${S.inf ? `<span>Überlebt</span><b>${fmtT(S.infT)}</b><span>Bestzeit</span><b>${fmtT(save.infBest || 0)}</b>` : `<span>Raum</span><b>${S.wave} / ${S.maxWave}</b>`}<span>Level</span><b>${S.level}</b><span>Besiegte Gegner</span><b>${S.kills}</b><span>Gesammeltes Gold</span><b>$ ${fmt(S.totalGold)}</b><span>Verdiente Kerne</span><b>+${cores}</b>${S.ore || S.rune ? `<span>Schmiedematerial</span><b><span style="color:#ffa850">${S.ore} Erz</span> · <span style="color:#c890ff">${S.rune} Runen</span></b>` : ''}</div>` +
    (drops ? `<div class="detail"><b>Beute</b>${drops}</div>` : '') +
    `<div style="text-align:center">${next ? '<button class="btn" id="btnNextStage">NÄCHSTE STAGE</button><br>' : ''}<button class="btn ${win ? 'sm' : ''}" id="btnAgain">NOCH EINMAL</button><br><button class="btn2" id="btnToMap">LEVEL-PFAD</button><button class="btn2" id="btnEInv">AUSRÜSTUNG</button><button class="btn2" id="btnToMenu">HAUPTMENÜ</button></div></div>`;
  showScreen('endScreen');
  $('btnAgain').addEventListener('click', () => { audioInit(); hideScreen('endScreen'); newRun(); });
  $('btnToMenu').addEventListener('click', () => { hideScreen('endScreen'); toMenu(); });
  $('btnToMap').addEventListener('click', () => { hideScreen('endScreen'); toMenu(); mapSel = S.stage; mapKeep = true; goTab('map'); });
  $('btnEInv').addEventListener('click', () => { hideScreen('endScreen'); toMenu(); goTab('gear'); });
  if (next) $('btnNextStage').addEventListener('click', () => { audioInit(); hideScreen('endScreen'); mapSel = next; newRun(PATH[next], next, false); });
}

/* ================= Talentliste im HUD ================= */
function renderTalList() {
  const el = $('talList'); if (!el) return;
  el.innerHTML = TALENTS.filter(t => player.tal[t.id]).map(t => `<span class="tchip" title="${t.name}">${svgIcon(t.ic)}<b>${player.tal[t.id]}</b></span>`).join('');
}

/* ================= Schmiede ================= */
let smithSel = null, smithMsg = '';
function smithTarget(sel) {
  if (!sel) return null;
  if (sel.t === 'w') { const w = WEAPONS[sel.id]; return { name: w.name, ic: w.ic, col: '#' + w.color.toString(16).padStart(6, '0'), get: () => save.wlvl[sel.id] || 0, set: v => { save.wlvl[sel.id] = v; }, info: `+10% Schaden pro Stufe (jetzt +${(save.wlvl[sel.id] || 0) * 10}%)` }; }
  const it = save.inv.find(i => i.id === sel.id); if (!it) return null;
  return { name: it.name, ic: SLOTS.find(x => x.id === it.slot).ic, col: RAR[it.rar].c, get: () => it.lvl, set: v => { it.lvl = v; }, info: `+15% Werte pro Stufe`, it };
}
function renderSmith() {
  const el = $('smithScreen'), tg = smithTarget(smithSel);
  if (!tg) smithSel = null;
  const wc = WEAPONS.map((w, i) => `<div class="tile ${smithSel && smithSel.t === 'w' && smithSel.id === i ? 'sel' : ''}" data-w="${i}" style="--rc:${save.weapon === i ? '#ffc34f' : '#4aa8ff'}">${svgIcon(w.ic)}${save.wlvl[i] ? `<span class="tlv">+${save.wlvl[i]}</span>` : ''}</div>`).join('');
  const ic = save.inv.slice().sort((a, b) => b.rar - a.rar || b.lvl - a.lvl).map(it => itemCell(it, smithSel && smithSel.t === 'i' && smithSel.id === it.id, 'data-si')).join('');
  let det = '<div class="idet sheet">Wähle eine Waffe oder einen Gegenstand.</div>';
  if (tg) {
    const l = tg.get(), max = l >= SMITH_MAX, ore = smithOre(l), rune = smithRune(l), r = SMITH_RATE[l], ok = !max && save.ore >= ore && save.rune >= rune;
    det = `<div class="idet sheet"><h3 style="color:${tg.col}">${tg.name} +${l}${max ? ' (MAX)' : ''}</h3><div style="color:#8fa0ad">${tg.info}</div>` +
      (max ? '' : `<div style="margin:.4rem 0">Stufe +${l} → +${l + 1} · Erfolgschance <b style="color:${r >= .6 ? '#6dff9a' : r >= .35 ? '#ffc34f' : '#ff6b5b'}">${Math.round(r * 100)}%</b><br>Kosten: <b style="color:#ffa850">${ore} Erz</b>${rune ? ` + <b style="color:#c890ff">${rune} Runen</b>` : ''}<br><span style="color:#ff8f7a">Bei Fehlschlag sinkt die Stufe um 1.</span></div><button class="btn" id="smBtn" ${ok ? '' : 'disabled'}>SCHMIEDEN</button>`) + `<div id="smMsg" style="margin-top:.4rem;font-weight:700">${smithMsg}</div></div>`;
  }
  el.innerHTML = `<div class="card"><div class="shopHead"><div><h2>SCHMIEDE</h2><div class="note" style="margin:.3rem 0 0">Waffen und Ausrüstung bis +9 verbessern. Erz und Runen droppen Gegner.</div></div><div class="shopGold"><span style="color:#ffa850">Erz ${save.ore}</span> · <span style="color:#c890ff">Runen ${save.rune}</span></div></div>` +
    `<div class="note" style="margin:.2rem 0">Waffen</div><div class="tgrid">${wc}</div><div class="note" style="margin:.2rem 0">Ausrüstung</div><div class="tgrid">${ic || '<div class="note">Noch keine Ausrüstung.</div>'}</div>${det}` +
    `</div>`;
  el.querySelectorAll('[data-w]').forEach(c => c.addEventListener('click', () => { smithSel = { t: 'w', id: +c.dataset.w }; smithMsg = ''; renderSmith(); }));
  el.querySelectorAll('[data-si]').forEach(c => c.addEventListener('click', () => { smithSel = { t: 'i', id: +c.dataset.si }; smithMsg = ''; renderSmith(); }));
  const b = $('smBtn'); if (b) b.addEventListener('click', () => {
    const res = smithDo(tg); if (res === null) { sfx('deny', 0); return; }
    smithMsg = res ? `<span style="color:#6dff9a">ERFOLG! Jetzt +${tg.get()}</span>` : `<span style="color:#ff6b5b">FEHLSCHLAG – Stufe sinkt auf +${tg.get()}</span>`;
    sfx(res ? 'level' : 'over', 0); vib(res ? 30 : 80); renderSmith();
  });
}

/* ================= Tagesaufgaben ================= */
function renderDaily() {
  const el = $('dailyScreen'), d = ensureDaily();
  el.innerHTML = `<div class="card"><div class="shopHead"><div><h2>TAGESAUFGABEN</h2><div class="note" style="margin:.3rem 0 0">Erneuern sich jeden Tag.</div></div><div class="shopGold">Kerne ${save.cores}</div></div><div class="wgrid">` +
    TASKS.map(t => { const p = Math.min(t.goal, d.prog[t.id] || 0), done = p >= t.goal, cl = d.claimed[t.id];
      return `<div class="item"><h3>${t.name}</h3><p>${p} / ${t.goal}</p><div class="lv">Belohnung: ${t.reward} Kerne${t.chest ? ' + Truhe' : ''}</div><button class="buy" data-t="${t.id}" ${done && !cl ? '' : 'disabled'}>${cl ? 'ERHALTEN' : done ? 'ABHOLEN' : 'OFFEN'}</button></div>`; }).join('') +
    `</div><div id="dailyMsg" class="note" style="text-align:center"></div></div>`;
  el.querySelectorAll('.buy').forEach(b => b.addEventListener('click', () => { const it = claimDaily(b.dataset.t); sfx('level', 0); renderDaily(); if (it) $('dailyMsg').innerHTML = `Truhe: <b style="color:${RAR[it.rar].c}">${it.name}</b>${it.auto ? ' (Inventar voll, verkauft)' : ''}`; }));
}
