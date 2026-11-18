'use strict';
/* ================= Charaktere: je eine Fähigkeit + eine Ultimate (angelehnt an bekannte MOBA-Helden, mit eigenen Namen) ================= */
const lineHit = (a, width, len, fn) => {
  const p = player, sx = Math.sin(a), sz = Math.cos(a);
  enemies.forEach(e => { if (e.dead || e.spawnT > 0 || e.hidden) return; const dx = e.x - p.x, dz = e.z - p.z, al = dx * sx + dz * sz, pe = dx * sz - dz * sx; if (al > 0 && al < len && Math.abs(pe) < width / 2 + e.r) fn(e, al); });
};
const coneHit = (a, half, len, fn) => {
  const p = player;
  enemies.forEach(e => { if (e.dead || e.spawnT > 0 || e.hidden) return; const dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz); if (d > len + e.r) return; if (d < 1.2 || Math.abs(angDiff(Math.atan2(dx, dz), a)) < half + Math.atan2(e.r, Math.max(.5, d))) fn(e, d); });
};
const circleHit = (x, z, r, fn) => { enemies.forEach(e => { if (e.dead || e.spawnT > 0 || e.hidden) return; if (Math.hypot(e.x - x, e.z - z) < r + e.r) fn(e); }); };
const hitE = (e, mult, a, o) => { const p = player, crit = Math.random() < p.crit; damageEnemy(e, dmgNow() * mult * (crit ? p.critMul : 1), crit, Math.sin(a) * .5, Math.cos(a) * .5, o); };
function lineFx(a, len, w, col) {
  const p = player, sx = Math.sin(a), sz = Math.cos(a);
  for (let d = 1; d < len; d += .45) for (let k = 0; k < 2; k++) { const o = rand(-w / 2, w / 2); fxAdd.emit(p.x + sx * d + sz * o, rand(.5, 1.5), p.z + sz * d - sx * o, rand(-.5, .5), rand(0, 1), rand(-.5, .5), rand(.25, .5), rand(.3, .6) * (w > 2 ? 1.6 : 1), col[0], col[1], col[2], 0, 0, .9); }
}
function coneFx(a, half, len, col) {
  const p = player;
  for (let i = 0; i < 70; i++) { const aa = a + rand(-half, half), d = rand(1, len); fxAdd.emit(p.x + Math.sin(aa) * d, rand(.4, 1.3), p.z + Math.cos(aa) * d, Math.sin(aa) * 4, rand(0, 1.5), Math.cos(aa) * 4, rand(.25, .5), rand(.25, .5), col[0], col[1], col[2], 0, 0, .9); }
}

const CHARS = [
  { id: 'reif', name: 'Reif', lol: 'Ashe', tint: [0x6fb8e8, 0x3f7fb5, 0x2c5f8f],
    info: 'Frostschützin. Entspricht „Ashe“ aus League of Legends.',
    skill: { id: 'frostfaecher', name: 'Frostfächer', ic: 'volley', cd: 7, lolName: 'Ashe · Volley', desc: 'Ein Fächer aus Frostkugeln: Schaden und 2,5 s verlangsamt.', aim: { t: 'cone', half: .5, len: 14 },
      cast(c) { coneFx(c.a, .5, 14, [.6, .9, 1]); coneHit(c.a, .5, 14, e => { hitE(e, 1.8, c.a); e.slowT = 2.5; }); sfx('shoot', 0); shake(.2); return true; } },
    ult: { id: 'kristallpfeil', name: 'Kristallpfeil', ic: 'freeze', cd: 38, lolName: 'Ashe · Enchanted Crystal Arrow', desc: 'Riesiger Eispfeil quer über die Map: betäubt den ersten Gegner 2,5 s und verletzt alle in der Nähe.', aim: { t: 'line', w: 1.6, len: 60 },
      cast(c) {
        let best = null, bd = 1e9; lineHit(c.a, 1.6, 60, (e, al) => { if (al < bd) { bd = al; best = e; } });
        lineFx(c.a, best ? bd : 40, 1.4, [.5, .85, 1]); sfx('boom', 0); shake(.4);
        if (!best) { addFloater(player.x, 3, player.z, 'Kein Treffer', '#9fe4ff', 26); return true; }
        const bx = best.x, bz = best.z; hitE(best, 4, c.a); best.stun = 2.5; ringFx(bx, .2, bz, 5, .6, 0x7fd8ff); glowBurst(bx, 1, bz, 5, [.5, .85, 1], .4);
        circleHit(bx, bz, 4.5, e => { if (e !== best) { hitE(e, 2, c.a); e.slowT = 2.5; } }); return true;
      } } },
  { id: 'bolzen', name: 'Bolzen', lol: 'Ezreal', tint: [0xe0b050, 0xa07a28, 0x6a4a18],
    info: 'Arkaner Scharfschütze. Entspricht „Ezreal“ aus League of Legends.',
    skill: { id: 'zauberbolzen', name: 'Zauberbolzen', ic: 'pierce', cd: 4, lolName: 'Ezreal · Mystic Shot', desc: 'Schneller Energiebolzen, der alle Gegner in einer Linie trifft. Treffer verkürzen die Ultimate-Abklingzeit.', aim: { t: 'line', w: 1.2, len: 30 },
      cast(c) { let n = 0; lineFx(c.a, 28, 1, [1, .85, .4]); lineHit(c.a, 1.2, 30, e => { hitE(e, 2.6, c.a); n++; }); if (n) player.ultCd = Math.max(0, player.ultCd - 1.2 * Math.min(n, 3)); sfx('shoot', 0); shake(.15); return true; } },
    ult: { id: 'sternenstrahl', name: 'Sternenstrahl', ic: 'chain', cd: 36, lolName: 'Ezreal · Trueshot Barrage', desc: 'Gewaltiger Strahl über die ganze Map: verursacht hohen Schaden an allen Gegnern in der Linie.', aim: { t: 'line', w: 3.4, len: 65 },
      cast(c) { lineFx(c.a, 62, 3, [1, .8, .3]); lineHit(c.a, 3.4, 65, e => hitE(e, 6, c.a)); sfx('nova', 0); shake(.7); S.fovKick = 1; return true; } } },
  { id: 'glut', name: 'Glutfee', lol: 'Annie', tint: [0xe0603a, 0xa83a22, 0x6a2214],
    info: 'Feuermagierin mit Begleiter. Entspricht „Annie“ aus League of Legends.',
    skill: { id: 'feuerkegel', name: 'Feuerkegel', ic: 'fire', cd: 6, lolName: 'Annie · Incinerate', desc: 'Flammenkegel vor dir: Schaden und Brand.', aim: { t: 'cone', half: .55, len: 9.5 },
      cast(c) { coneFx(c.a, .55, 9.5, [1, .5, .15]); coneHit(c.a, .55, 9.5, e => { hitE(e, 2.4, c.a); e.burnT = 3; e.burnDps = dmgNow() * .35; }); sfx('boom', 0); shake(.25); return true; } },
    ult: { id: 'glutbaer', name: 'Glutbär', ic: 'inferno', cd: 40, lolName: 'Annie · Summon: Tibbers', desc: 'Beschwört einen Feuerbären an der Zielstelle: Flächenschaden und 9 Sekunden lang kämpft er für dich.', aim: { t: 'circle', r: 4.4, range: 11 },
      cast(c) {
        ringFx(c.tx, .2, c.tz, 4.4, .6, 0xff7a2a); glowBurst(c.tx, 1.2, c.tz, 7, [1, .5, .15], .5); circleHit(c.tx, c.tz, 4.4, e => { hitE(e, 4.5, c.a); e.burnT = 3; e.burnDps = dmgNow() * .35; });
        const m = new THREE.Group(); M(GEO.sphere, mat(0x6a3a22, { roughness: .8 }), m, 0, 1.1, 0, 1.1, 1.0, .9, true); M(GEO.sphere, mat(0x6a3a22), m, 0, 2.1, .2, .6); M(GEO.sphere, glowMat(0xff8a30, 0xff5a10, 1.6), m, .35, 2.2, .7, .12); M(GEO.sphere, glowMat(0xff8a30, 0xff5a10, 1.6), m, -.35, 2.2, .7, .12);
        const gl = glowSprite(0xff7a20, 4, .6); gl.position.y = 1.2; m.add(gl); m.position.set(c.tx, 0, c.tz); scene.add(m);
        ALLIES.push({ m, x: c.tx, z: c.tz, t: 9, hit: 0 }); sfx('boss', 0); shake(.5); return true;
      } } },
  { id: 'gruft', name: 'Totengräber', lol: 'Karthus', tint: [0x8a6ad0, 0x5a3f9a, 0x3a2a6a],
    info: 'Beschwörer des Verfalls. Entspricht „Karthus“ aus League of Legends.',
    skill: { id: 'verwuestung', name: 'Verwüstung', ic: 'boom', cd: 5, lolName: 'Karthus · Lay Waste', desc: 'Markiert eine Stelle: kurz darauf explodiert dort die Erde und verletzt alle Gegner im Bereich.', aim: { t: 'circle', r: 3.4, range: 11 },
      cast(c) {
        const tx = c.tx, tz = c.tz; const rg = new THREE.Mesh(new THREE.RingGeometry(3.1, 3.4, 36).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0xb08aff, transparent: true, opacity: .8, depthWrite: false, fog: false })); rg.position.set(tx, .12, tz); scene.add(rg);
        later(.7, () => { scene.remove(rg); circleHit(tx, tz, 3.4, e => hitE(e, 3.2, c.a)); ringFx(tx, .2, tz, 3.6, .5, 0xb08aff); glowBurst(tx, 1, tz, 5, [.7, .5, 1], .4); sfx('boom', 0); shake(.3); }); return true;
      } },
    ult: { id: 'requiem', name: 'Requiem', ic: 'vamp', cd: 45, lolName: 'Karthus · Requiem', desc: 'Nach kurzer Verzögerung erleidet jeder Gegner auf der Map schweren Schaden.', aim: { t: 'self' },
      cast(c) {
        showBanner('REQUIEM', 'Die Toten rufen …'); sfx('boss', 0); S.vig = Math.max(S.vig, .6);
        later(2.4, () => { if (S.state === 'dead') return; enemies.forEach(e => { if (e.dead || e.spawnT > 0) return; hitE(e, 4.6, 0); ringFx(e.x, .2, e.z, 2.6, .5, 0xb08aff); glowBurst(e.x, 1.4, e.z, 3.5, [.7, .5, 1], .4); }); shake(.8); sfx('nova', 0); });
        return true;
      } } },
  { id: 'eisen', name: 'Eisenfaust', lol: 'Garen', tint: [0xc8d0dc, 0x8a96a8, 0x566074],
    info: 'Gepanzerter Nahkämpfer. Entspricht „Garen“ aus League of Legends.',
    skill: { id: 'urteil', name: 'Urteil', ic: 'sword', cd: 9, lolName: 'Garen · Judgment', desc: '2,5 Sekunden lang wirbelt er und verletzt alle Gegner um sich herum. Dabei bist du schneller.', aim: { t: 'self', r: 3.6 },
      cast(c) { player.spinT = 2.5; player.spinTick = 0; ringFx(player.x, .2, player.z, 3.6, .4, 0xdfe6ee); sfx('nova', 0); return true; } },
    ult: { id: 'gerechtigkeit', name: 'Gerechtigkeit', ic: 'exec', cd: 30, lolName: 'Garen · Demacian Justice', desc: 'Ein Lichtstrahl richtet den gewählten Gegner hin: Je weniger Leben er hat, desto größer der Schaden.', aim: { t: 'circle', r: 2.6, range: 13 },
      cast(c) {
        let best = null, bd = 1e9; enemies.forEach(e => { if (e.dead || e.spawnT > 0 || e.hidden) return; const d = Math.hypot(e.x - c.tx, e.z - c.tz); if (d < 2.6 + e.r && d < bd) { bd = d; best = e; } });
        if (!best) { showHint('Kein Ziel – zielen auf einen Gegner', 1500); return false; }
        const bx = best.x, bz = best.z; hitE(best, 5 + 3 * (1 - best.hp / best.maxHp), 0, { kb: 0 }); if (!best.dead && best.hp < best.maxHp * .3) damageEnemy(best, best.hp + 1, false, 0, 0);
        for (let i = 0; i < 40; i++) fxAdd.emit(bx + rand(-.4, .4), rand(0, 9), bz + rand(-.4, .4), 0, rand(-1, 1), 0, rand(.4, .8), rand(.4, .9), 1, .95, .6, 0, 0, .9);
        ringFx(bx, .2, bz, 3.4, .5, 0xfff0a0); glowBurst(bx, 1.5, bz, 7, [1, .95, .6], .5); sfx('boom', 0); shake(.6); return true;
      } } }
];
const ALLIES = [];
const charDef = () => CHARS.find(c => c.id === save.char) || CHARS[0];
const abilityDef = slot => slot ? charDef().ult : charDef().skill;

/* Ausführen: slot 0 = Fähigkeit, 1 = Ultimate. aim = { a, mag, drag } (optional) */
function useAbility(slot, aim) {
  const p = player; if (S.state !== 'playing' || p.dead) return;
  const ab = abilityDef(slot), cdKey = slot ? 'ultCd' : 'skCd', mxKey = slot ? 'ultMax' : 'skMax';
  if (p[cdKey] > 0) { sfx('deny', 150); return; }
  const t = p.target, ad = ab.aim; let a, mag = 1, tx, tz;
  if (aim && aim.drag) { a = aim.a; mag = aim.mag; } else a = t && !t.dead ? Math.atan2(t.x - p.x, t.z - p.z) : p.yaw;
  if (ad.t === 'circle') {
    if (aim && aim.drag) { const d = ad.range * Math.max(.25, mag); tx = p.x + Math.sin(a) * d; tz = p.z + Math.cos(a) * d; }
    else if (t && !t.dead) { const d = Math.min(ad.range, Math.hypot(t.x - p.x, t.z - p.z)); tx = p.x + Math.sin(a) * d; tz = p.z + Math.cos(a) * d; if (d >= Math.hypot(t.x - p.x, t.z - p.z) - .01) { tx = t.x; tz = t.z; } }
    else { tx = p.x + Math.sin(a) * ad.range * .6; tz = p.z + Math.cos(a) * ad.range * .6; }
  }
  if (ad.t !== 'self') { p.yaw = a; p.aim = 1; p.recoil = 1; }
  if (ab.cast({ a, tx, tz }) === false) return;
  const cd = save.adm && save.adm.nocd ? 0 : ab.cd * (1 - Math.min(.5, p.cdr)); p[mxKey] = p[cdKey] = Math.max(.01, cd); p.skillUsed++;
}
function updateChars(dt) {
  const p = player;
  p.ultCd = Math.max(0, p.ultCd - dt);
  if (p.spinT > 0) {
    p.spinT -= dt; p.spinTick -= dt;
    if (p.spinTick <= 0) { p.spinTick = .3; circleHit(p.x, p.z, 3.6, e => hitE(e, 1.0, 0, { kb: 6 })); ringFx(p.x, .3, p.z, 3.6, .3, 0xdfe6ee); sfx('hit', 60); }
    pl.root.rotation.y += dt * 0;
    for (let k = 0; k < 3; k++) { const a = S.time * 14 + k * 2.1; fxAdd.emit(p.x + Math.cos(a) * 3.2, 1, p.z + Math.sin(a) * 3.2, 0, 0, 0, .25, .5, .9, .95, 1, 0, 0, .9); }
  }
  for (let i = ALLIES.length - 1; i >= 0; i--) {
    const al = ALLIES[i]; al.t -= dt; al.hit -= dt;
    let tgt = null, bd = 1e9; enemies.forEach(e => { if (e.dead || e.spawnT > 0 || e.hidden) return; const d = Math.hypot(e.x - al.x, e.z - al.z); if (d < bd) { bd = d; tgt = e; } });
    if (tgt && bd > 1.8) { const nx = (tgt.x - al.x) / bd, nz = (tgt.z - al.z) / bd; al.x += nx * 4.2 * dt; al.z += nz * 4.2 * dt; al.m.rotation.y = Math.atan2(nx, nz); }
    if (al.hit <= 0) { al.hit = .6; let n = 0; circleHit(al.x, al.z, 3.2, e => { hitE(e, 1.1, 0, { kb: 3 }); e.burnT = 2; e.burnDps = dmgNow() * .3; n++; }); if (n) { ringFx(al.x, .3, al.z, 3.2, .3, 0xff7a2a); sfx('hit', 60); } }
    al.m.position.set(al.x, Math.abs(Math.sin(S.time * 6)) * .12, al.z);
    if (al.t <= 0) { scene.remove(al.m); ALLIES.splice(i, 1); puff(al.x, 1, al.z, 8, 2, .8, [.4, .2, .1], 3); }
  }
}
function clearAllies() { ALLIES.forEach(a => scene.remove(a.m)); ALLIES.length = 0; }

/* ===== Ziel-Vorschau am Boden ===== */
const SK_AIM = { active: false, slot: 0, a: 0, mag: 1, drag: false };
const _aimM = {};
function aimMesh(ad) {
  const mk = (geo, o) => new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x7fe0ff, transparent: true, opacity: o || .26, depthWrite: false, fog: false, side: THREE.DoubleSide }));
  const g = new THREE.Group();
  if (ad.t === 'cone') {
    const v = [0, 0, 0], N = 18; for (let i = 0; i <= N; i++) { const a = -ad.half + 2 * ad.half * i / N; v.push(Math.sin(a) * ad.len, 0, Math.cos(a) * ad.len); }
    const idx = []; for (let i = 1; i <= N; i++) idx.push(0, i, i + 1);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex(idx); g.add(mk(geo));
  } else if (ad.t === 'line') {
    g.add(mk(new THREE.PlaneGeometry(ad.w, ad.len).rotateX(-PI / 2).translate(0, 0, ad.len / 2)));
  } else if (ad.t === 'circle') {
    const c = mk(new THREE.CircleGeometry(ad.r, 32).rotateX(-PI / 2), .38); c.userData.target = 1; g.add(c);
    const lim = mk(new THREE.RingGeometry(ad.range - .15, ad.range, 48).rotateX(-PI / 2), .14); lim.userData.fixed = 1; g.add(lim);
  } else if (ad.t === 'self' && ad.r) {
    g.add(mk(new THREE.CircleGeometry(ad.r, 32).rotateX(-PI / 2), .3));
  }
  g.position.y = .1; g.visible = false; scene.add(g); return g;
}
function updateAimPreview() {
  Object.values(_aimM).forEach(m => m.visible = false);
  const p = player; if (!SK_AIM.active || p.dead || S.state !== 'playing') return;
  const ab = abilityDef(SK_AIM.slot), ad = ab.aim; if (ad.t === 'self' && !ad.r) return;
  const m = _aimM[ab.id] || (_aimM[ab.id] = aimMesh(ad)); m.visible = true; m.position.set(p.x, .1, p.z); m.rotation.y = 0;
  if (ad.t === 'cone' || ad.t === 'line') m.rotation.y = SK_AIM.a;
  if (ad.t === 'circle') {
    let d = ad.range * .6; const t = p.target;
    if (SK_AIM.drag) d = ad.range * Math.max(.25, SK_AIM.mag); else if (t && !t.dead) d = Math.min(ad.range, Math.hypot(t.x - p.x, t.z - p.z));
    m.children.forEach(c => { if (c.userData.target) c.position.set(Math.sin(SK_AIM.a) * d, 0, Math.cos(SK_AIM.a) * d); else c.position.set(0, 0, 0); });
  }
  m.children.forEach(c => { c.material.opacity = (c.userData.fixed ? .14 : c.userData.target ? .38 : .26) + Math.sin(S.time * 10) * .05; });
}
function skillAimDir(ax, ay) { const sy = Math.sin(S.camYaw), cy = Math.cos(S.camYaw); const mx = sy * ay - cy * ax, mz = cy * ay + sy * ax; return Math.atan2(mx, mz); }
