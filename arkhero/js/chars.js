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
let _AM = 1, _FL = 0;
const FS = () => 1 + .06 * _FL;
const tierOf = () => _FL >= 9 ? 3 : _FL >= 6 ? 2 : _FL >= 3 ? 1 : 0;
const goldMix = col => { const t = _FL >= 9 ? .55 : 0; return [col[0] + (1 - col[0]) * t, col[1] + (.85 - col[1]) * t, col[2] + (.3 - col[2]) * t]; };
const ablLv = id => (save.abl && save.abl[id]) || 0;
const hitE = (e, mult, a, o) => { const p = player, crit = Math.random() < p.crit; damageEnemy(e, dmgNow() * mult * _AM * (crit ? p.critMul : 1), crit, Math.sin(a) * .5, Math.cos(a) * .5, o); S.hitstop = Math.max(S.hitstop || 0, .02); };
function lineFx(a, len, w, col) {
  const p = player, sx = Math.sin(a), sz = Math.cos(a);
  for (let d = 1; d < len; d += .45) for (let k = 0; k < 2; k++) { const o = rand(-w / 2, w / 2); fxAdd.emit(p.x + sx * d + sz * o, rand(.5, 1.5), p.z + sz * d - sx * o, rand(-.5, .5), rand(0, 1), rand(-.5, .5), rand(.25, .5), rand(.3, .6) * (w > 2 ? 1.6 : 1), col[0], col[1], col[2], 0, 0, .9); }
}
function coneFx(a, half, len, col) {
  const p = player;
  for (let i = 0; i < 70; i++) { const aa = a + rand(-half, half), d = rand(1, len); fxAdd.emit(p.x + Math.sin(aa) * d, rand(.4, 1.3), p.z + Math.cos(aa) * d, Math.sin(aa) * 4, rand(0, 1.5), Math.cos(aa) * 4, rand(.25, .5), rand(.25, .5), col[0], col[1], col[2], 0, 0, .9); }
}

/* ===== Effekt-Engine für Fähigkeiten ===== */
const FX = [];
const _ADD = (col, o) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: o === undefined ? .8 : o, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
const _col = c => new THREE.Color(c[0], c[1], c[2]).getHex();
function fxObj(obj, life, upd) { scene.add(obj); FX.push({ obj, t: 0, life, upd }); return obj; }
function updateFX(dt) {
  for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt; const k = Math.min(1, f.t / f.life); if (f.upd) f.upd(k, f.obj, dt); if (k >= 1) { scene.remove(f.obj); FX.splice(i, 1); } }
}
function clearFX() { FX.forEach(f => scene.remove(f.obj)); FX.length = 0; }
function flashLight(x, z, v) { try { world.lights.flash.position.set(x, 3, z); world.lights.flash.intensity = v || 12; } catch (_) { } }
function shockFx(x, z, r, col, life) {   // sich ausdehnende Bodenwelle
  r *= FS(); col = goldMix(col); if (tierOf() >= 1 && !shockFx._n) { shockFx._n = 1; shockFx(x, z, r * .7, [1, 1, 1], (life || .45) * 1.3); shockFx._n = 0; }
  const m = new THREE.Mesh(new THREE.RingGeometry(.82, 1, 40).rotateX(-PI / 2), _ADD(_col(col), .9)); m.position.set(x, .15, z);
  fxObj(m, life || .45, (k, o) => { const s = .15 + r * (1 - Math.pow(1 - k, 2)); o.scale.set(s, 1, s); o.material.opacity = .9 * (1 - k); });
}
function beamFx(a, len, w, col, life, y) {   // leuchtender Strahl aus zwei Röhren (Hülle + weißer Kern)
  w *= FS(); col = goldMix(col); if (tierOf() >= 2 && !beamFx._n) { beamFx._n = 1; beamFx(a, len, w * 1.9, col, (life || .35) * 1.2, y); beamFx._n = 0; }
  const p = player, g = new THREE.Group(); g.position.set(p.x + Math.sin(a) * .8, y || 1.1, p.z + Math.cos(a) * .8); g.rotation.y = a;
  const geo = new THREE.CylinderGeometry(1, 1, 1, 14, 1, true).rotateX(PI / 2).translate(0, 0, .5);
  const o = new THREE.Mesh(geo, _ADD(_col(col), .55)), i = new THREE.Mesh(geo, _ADD(0xffffff, .95)); o.scale.set(w / 2, w / 2, len); i.scale.set(w / 5, w / 5, len); g.add(o, i);
  const fl = glowSprite(_col(col), w * 3.2, .9); fl.material = fl.material.clone(); g.add(fl);
  fxObj(g, life || .35, k => { const s = 1 - k * k; o.scale.set(w / 2 * (1 + k * .4) * s, w / 2 * (1 + k * .4) * s, len); i.scale.set(w / 5 * s, w / 5 * s, len); o.material.opacity = .55 * (1 - k); i.material.opacity = .95 * (1 - k); fl.material.opacity = .9 * (1 - k); });
  for (let d = 2; d < len; d += Math.max(.5, 1.6 - .1 * _FL)) fxAdd.emit(p.x + Math.sin(a) * d, rand(.6, 1.6), p.z + Math.cos(a) * d, rand(-1, 1), rand(0, 1.5), rand(-1, 1), rand(.3, .6), rand(.3, .7), col[0], col[1], col[2], 0, 0, .9);
}
function boltFx(a, len, col, size, life) {   // fliegende Energiekugel mit Schweif entlang der Linie
  size *= FS(); col = goldMix(col); const p = player, g = new THREE.Group(), core = glowSprite(_col(col), size * 3, .95), hd = new THREE.Mesh(GEO.sphere, _ADD(0xffffff, .95)); hd.scale.setScalar(size * .35); g.add(core, hd);
  const sx = Math.sin(a), sz = Math.cos(a), x0 = p.x + sx * .8, z0 = p.z + sz * .8;
  fxObj(g, life || .22, (k, o, dt) => { const d = len * k; o.position.set(x0 + sx * d, 1.2, z0 + sz * d); for (let n = 0; n < 3; n++) fxAdd.emit(o.position.x - sx * rand(0, 2), 1.2 + rand(-.2, .2), o.position.z - sz * rand(0, 2), rand(-.4, .4), rand(-.2, .4), rand(-.4, .4), .35, size * rand(.4, .8), col[0], col[1], col[2], 0, 0, .9); });
}
function fanFx(a, half, len, col, life) {   // sich öffnender Fächer am Boden + fliegende Splitter
  col = goldMix(col); const p = player, v = [0, 0, 0], N = 18; for (let i = 0; i <= N; i++) { const aa = -half + 2 * half * i / N; v.push(Math.sin(aa), 0, Math.cos(aa)); }
  const idx = []; for (let i = 1; i <= N; i++) idx.push(0, i, i + 1);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, _ADD(_col(col), .75)); m.position.set(p.x, .25, p.z); m.rotation.y = a;
  fxObj(m, life || .4, (k, o) => { const s = len * (1 - Math.pow(1 - k, 3)); o.scale.set(s, 1, s); o.material.opacity = .5 * (1 - k); });
  for (let n = 0; n < 12 + 2 * _FL; n++) {
    const aa = a + rand(-half, half), sp = len / .32, sh = new THREE.Mesh(GEO.cone, _ADD(_col(col), .95)); sh.scale.set(.28, 1.6, .28); sh.rotation.set(PI / 2, 0, 0); const holder = new THREE.Group(); holder.rotation.y = aa; holder.add(sh); sh.position.z = 0;
    holder.position.set(p.x, 1.1, p.z); const dx = Math.sin(aa), dz = Math.cos(aa), x0 = p.x, z0 = p.z, L = len * rand(.7, 1);
    fxObj(holder, .32, k => { const d = 1 + L * k; holder.position.set(x0 + dx * d, 1.1 + Math.sin(k * 3) * .15, z0 + dz * d); sh.material.opacity = .95 * (1 - k * k); });
  }
}
function meteorFx(x, z, col, delay, impact, size) {   // Einschlag von oben
  size *= FS(); col = goldMix(col);
  const g = new THREE.Group(), hd = new THREE.Mesh(GEO.ico, _ADD(0xffffff, .95)); hd.scale.setScalar(size * .5); g.add(hd, glowSprite(_col(col), size * 4, .9));
  const sx = x + 7, sz = z + 4; let done = false;
  fxObj(g, delay, (k, o) => { const e = k * k; o.position.set(sx + (x - sx) * e, 22 * (1 - e) + .6, sz + (z - sz) * e); hd.rotation.x += .3; hd.rotation.y += .2;
    for (let n = 0; n < 4; n++) fxAdd.emit(o.position.x + rand(-.3, .3), o.position.y + rand(-.3, .3), o.position.z + rand(-.3, .3), rand(-1, 1), rand(0, 2), rand(-1, 1), .4, size * rand(.4, .9), col[0], col[1], col[2], 0, 0, .9);
    if (k > .97 && !done) { done = true; impact && impact(); } });
}
function impactFx(x, z, r, col) {
  col = goldMix(col); const fs = FS(); r *= fs; if (tierOf() >= 2 && !impactFx._n) { impactFx._n = 1; pillarFx(x, z, r * .35, col, .5, 16); impactFx._n = 0; }
  shockFx(x, z, r, col, .5); shockFx(x, z, r * .6, [1, 1, 1], .35); glowBurst(x, 1, z, r * 1.4, col, .45); flashLight(x, z, 14); puff(x, .3, z, 10, 2, .9, COL.dust, 4);
  for (let n = 0; n < 40 + 6 * _FL; n++) { const a = rand(0, TAU), sp = rand(4, 10); fxAdd.emit(x, .4, z, Math.cos(a) * sp, rand(2, 8), Math.sin(a) * sp, rand(.4, .9), rand(.15, .3), col[0], col[1], col[2], 14, .5, 1); }
}
function pillarFx(x, z, r, col, life, h) {   // Lichtsäule vom Himmel
  r *= FS(); col = goldMix(col);
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const o = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, h || 26, 20, 1, true).translate(0, (h || 26) / 2, 0), _ADD(_col(col), .55)), i = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, h || 26, 14, 1, true).translate(0, (h || 26) / 2, 0), _ADD(0xffffff, .9)); g.add(o, i);
  fxObj(g, life || .6, k => { const s = k < .15 ? k / .15 : 1 - (k - .15) / .85; o.scale.set(r * (.4 + .6 * s), 1, r * (.4 + .6 * s)); i.scale.set(r * .4 * s, 1, r * .4 * s); o.material.opacity = .55 * s; i.material.opacity = .9 * s; });
}
function bladesFx(life) {   // kreisende Klingen um den Spieler (Urteil)
  const g = new THREE.Group(), bl = [];
  const nb = 3 + Math.floor(_FL / 3); for (let k = 0; k < nb; k++) { const b = new THREE.Group(); const m = new THREE.Mesh(GEO.box, _ADD(_FL >= 9 ? 0xffe9a0 : 0xdfe8f5, .9)); m.scale.set(.18, .06, 2.4); m.position.z = 1.9; b.add(m); const tr = new THREE.Mesh(GEO.box, _ADD(0x9fc0ff, .35)); tr.scale.set(.9, .03, 3); tr.position.set(-.5, 0, 1.9); b.add(tr); b.rotation.y = k * TAU / nb; g.add(b); bl.push(b); }
  fxObj(g, life, (k, o, dt) => { o.position.set(player.x, 1.0, player.z); o.rotation.y += dt * 15; o.children.forEach(c => c.children.forEach(m => { m.material.opacity = (m.scale.x > .5 ? .35 : .9) * (k > .85 ? (1 - k) / .15 : 1); })); });
}

const CHARS = [
  { id: 'reif', name: 'Reif', lol: 'Ashe', tint: [0x6fb8e8, 0x3f7fb5, 0x2c5f8f],
    info: 'Frostschützin. Entspricht „Ashe“ aus League of Legends.',
    skill: { id: 'frostfaecher', name: 'Frostfächer', ic: 'volley', cd: 7, lolName: 'Ashe · Volley', desc: 'Ein Fächer aus Frostkugeln: Schaden und 2,5 s verlangsamt.', aim: { t: 'cone', half: .5, len: 14 },
      cast(c) { fanFx(c.a, .5, 14, [.6, .9, 1], .45); coneFx(c.a, .5, 14, [.6, .9, 1]); coneHit(c.a, .5, 14, e => { hitE(e, 1.8, c.a); e.slowT = 2.5; sparks(e.x, 1.2, e.z, 8, [.7, .93, 1], 6, .5); glowBurst(e.x, 1.2, e.z, 2.2, [.6, .9, 1], .3); }); sfx('shoot', 0); shake(.25); return true; } },
    ult: { id: 'kristallpfeil', name: 'Kristallpfeil', ic: 'freeze', cd: 38, lolName: 'Ashe · Enchanted Crystal Arrow', desc: 'Riesiger Eispfeil quer über die Map: betäubt den ersten Gegner 2,5 s und verletzt alle in der Nähe.', aim: { t: 'line', w: 1.6, len: 60 },
      cast(c) {
        let best = null, bd = 1e9; lineHit(c.a, 1.6, 60, (e, al) => { if (al < bd) { bd = al; best = e; } });
        const ln = best ? bd : 40; boltFx(c.a, ln, [.5, .85, 1], 1.6, .22 + ln / 260); beamFx(c.a, ln, 1.3, [.5, .85, 1], .5); lineFx(c.a, ln, 1.4, [.5, .85, 1]); sfx('boom', 0); shake(.4);
        if (!best) { addFloater(player.x, 3, player.z, 'Kein Treffer', '#9fe4ff', 26); return true; }
        const bx = best.x, bz = best.z; hitE(best, 4, c.a); best.stun = 2.5; const fl1 = _FL; later(.1 + bd / 260, () => { _FL = fl1; impactFx(bx, bz, 5, [.5, .85, 1]); pillarFx(bx, bz, 1.4, [.5, .85, 1], .6, 14); shake(.5); });
        circleHit(bx, bz, 4.5, e => { if (e !== best) { hitE(e, 2, c.a); e.slowT = 2.5; } }); return true;
      } } },
  { id: 'bolzen', name: 'Bolzen', lol: 'Ezreal', tint: [0xe0b050, 0xa07a28, 0x6a4a18],
    info: 'Arkaner Scharfschütze. Entspricht „Ezreal“ aus League of Legends.',
    skill: { id: 'zauberbolzen', name: 'Zauberbolzen', ic: 'pierce', cd: 4, lolName: 'Ezreal · Mystic Shot', desc: 'Schneller Energiebolzen, der alle Gegner in einer Linie trifft. Treffer verkürzen die Ultimate-Abklingzeit.', aim: { t: 'line', w: 1.2, len: 30 },
      cast(c) { let n = 0; boltFx(c.a, 28, [1, .85, .4], 1.2, .16); beamFx(c.a, 28, .7, [1, .85, .4], .25); lineHit(c.a, 1.2, 30, e => { hitE(e, 2.6, c.a); n++; sparks(e.x, 1.2, e.z, 7, COL.gold, 7, .4); glowBurst(e.x, 1.2, e.z, 2, [1, .85, .4], .3); }); if (n) player.ultCd = Math.max(0, player.ultCd - 1.2 * Math.min(n, 3)); sfx('shoot', 0); shake(.15); return true; } },
    ult: { id: 'sternenstrahl', name: 'Sternenstrahl', ic: 'chain', cd: 36, lolName: 'Ezreal · Trueshot Barrage', desc: 'Gewaltiger Strahl über die ganze Map: verursacht hohen Schaden an allen Gegnern in der Linie.', aim: { t: 'line', w: 3.4, len: 65 },
      cast(c) { beamFx(c.a, 65, 3.4, [1, .75, .25], .9); lineFx(c.a, 62, 3, [1, .8, .3]); shockFx(player.x, player.z, 5, [1, .8, .3], .5); flashLight(player.x, player.z, 16); lineHit(c.a, 3.4, 65, e => { hitE(e, 6, c.a); impactFx(e.x, e.z, 2.6, [1, .8, .3]); }); sfx('nova', 0); shake(.8); S.fovKick = 1; return true; } } },
  { id: 'glut', name: 'Glutfee', lol: 'Annie', tint: [0xe0603a, 0xa83a22, 0x6a2214],
    info: 'Feuermagierin mit Begleiter. Entspricht „Annie“ aus League of Legends.',
    skill: { id: 'feuerkegel', name: 'Feuerkegel', ic: 'fire', cd: 6, lolName: 'Annie · Incinerate', desc: 'Flammenkegel vor dir: Schaden und Brand.', aim: { t: 'cone', half: .55, len: 9.5 },
      cast(c) { fanFx(c.a, .55, 9.5, [1, .45, .1], .45); coneFx(c.a, .55, 9.5, [1, .5, .15]); coneHit(c.a, .55, 9.5, e => { hitE(e, 2.4, c.a); e.burnT = 3; e.burnDps = dmgNow() * .35; glowBurst(e.x, 1.2, e.z, 2.6, [1, .5, .15], .35); }); glowBurst(player.x + Math.sin(c.a) * 1.5, 1.2, player.z + Math.cos(c.a) * 1.5, 3, [1, .6, .2], .3); sfx('boom', 0); shake(.3); return true; } },
    ult: { id: 'glutbaer', name: 'Glutbär', ic: 'inferno', cd: 40, lolName: 'Annie · Summon: Tibbers', desc: 'Beschwört einen Feuerbären an der Zielstelle: Flächenschaden und 9 Sekunden lang kämpft er für dich.', aim: { t: 'circle', r: 4.4, range: 11 },
      cast(c) {
        const am = _AM, fl0 = _FL, tx0 = c.tx, tz0 = c.tz; shockFx(tx0, tz0, 4.4, [1, .5, .15], .6); meteorFx(tx0, tz0, [1, .5, .15], .5, () => { _AM = am; _FL = fl0; impactFx(tx0, tz0, 4.4, [1, .5, .15]); shake(.6); circleHit(tx0, tz0, 4.4, e => { hitE(e, 4.5, c.a); e.burnT = 3; e.burnDps = dmgNow() * .35; }); }, 1.4);
        const m = new THREE.Group(); M(GEO.sphere, mat(0x6a3a22, { roughness: .8 }), m, 0, 1.1, 0, 1.1, 1.0, .9, true); M(GEO.sphere, mat(0x6a3a22), m, 0, 2.1, .2, .6); M(GEO.sphere, glowMat(0xff8a30, 0xff5a10, 1.6), m, .35, 2.2, .7, .12); M(GEO.sphere, glowMat(0xff8a30, 0xff5a10, 1.6), m, -.35, 2.2, .7, .12);
        const gl = glowSprite(0xff7a20, 4, .6); gl.position.y = 1.2; m.add(gl); m.position.set(c.tx, 0, c.tz); scene.add(m);
        ALLIES.push({ m, x: c.tx, z: c.tz, t: 9, hit: 0 }); sfx('boss', 0); shake(.5); return true;
      } } },
  { id: 'gruft', name: 'Totengräber', lol: 'Karthus', tint: [0x8a6ad0, 0x5a3f9a, 0x3a2a6a],
    info: 'Beschwörer des Verfalls. Entspricht „Karthus“ aus League of Legends.',
    skill: { id: 'verwuestung', name: 'Verwüstung', ic: 'boom', cd: 5, lolName: 'Karthus · Lay Waste', desc: 'Markiert eine Stelle: kurz darauf explodiert dort die Erde und verletzt alle Gegner im Bereich.', aim: { t: 'circle', r: 3.4, range: 11 },
      cast(c) {
        const am = _AM, fl0 = _FL, tx = c.tx, tz = c.tz; const rg = new THREE.Mesh(new THREE.RingGeometry(3.1, 3.4, 36).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0xb08aff, transparent: true, opacity: .8, depthWrite: false, fog: false })); rg.position.set(tx, .12, tz); scene.add(rg);
        meteorFx(tx, tz, [.7, .5, 1], .7, () => { _AM = am; _FL = fl0; scene.remove(rg); circleHit(tx, tz, 3.4, e => hitE(e, 3.2, c.a)); impactFx(tx, tz, 3.6, [.7, .5, 1]); pillarFx(tx, tz, 1.6, [.7, .5, 1], .5, 10); sfx('boom', 0); shake(.4); }, 1.1); return true;
      } },
    ult: { id: 'requiem', name: 'Requiem', ic: 'vamp', cd: 45, lolName: 'Karthus · Requiem', desc: 'Nach kurzer Verzögerung erleidet jeder Gegner auf der Map schweren Schaden.', aim: { t: 'self' },
      cast(c) {
        showBanner('REQUIEM', 'Die Toten rufen …'); sfx('boss', 0); S.vig = Math.max(S.vig, .6);
        enemies.forEach(e => { if (!e.dead && e.spawnT <= 0) { const sh = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 28).rotateX(-PI / 2), _ADD(0xb08aff, .8)); sh.position.set(e.x, .15, e.z); fxObj(sh, 2.4, (k, o) => { o.position.set(e.x, .15, e.z); const s = 3 * (1 - k) + .8; o.scale.set(s, 1, s); }); } });
        const am = _AM, fl0 = _FL;
        later(2.4, () => { _AM = am; _FL = fl0; if (S.state === 'dead') return; flashLight(player.x, player.z, 18); enemies.forEach(e => { if (e.dead || e.spawnT > 0) return; hitE(e, 4.6, 0); impactFx(e.x, e.z, 2.4, [.7, .5, 1]); pillarFx(e.x, e.z, 1, [.7, .5, 1], .6, 12); }); shake(1); sfx('nova', 0); S.fovKick = 1; });
        return true;
      } } },
  { id: 'eisen', name: 'Eisenfaust', lol: 'Garen', tint: [0xc8d0dc, 0x8a96a8, 0x566074],
    info: 'Gepanzerter Nahkämpfer. Entspricht „Garen“ aus League of Legends.',
    skill: { id: 'urteil', name: 'Urteil', ic: 'sword', cd: 9, lolName: 'Garen · Judgment', desc: '2,5 Sekunden lang wirbelt er und verletzt alle Gegner um sich herum. Dabei bist du schneller.', aim: { t: 'self', r: 3.6 },
      cast(c) { player.spinT = 2.5; player.spinTick = 0; bladesFx(2.5); shockFx(player.x, player.z, 3.8, [.85, .9, 1], .4); sfx('nova', 0); return true; } },
    ult: { id: 'gerechtigkeit', name: 'Gerechtigkeit', ic: 'exec', cd: 30, lolName: 'Garen · Demacian Justice', desc: 'Ein Lichtstrahl richtet den gewählten Gegner hin: Je weniger Leben er hat, desto größer der Schaden.', aim: { t: 'circle', r: 2.6, range: 13 },
      cast(c) {
        let best = null, bd = 1e9; enemies.forEach(e => { if (e.dead || e.spawnT > 0 || e.hidden) return; const d = Math.hypot(e.x - c.tx, e.z - c.tz); if (d < 2.6 + e.r && d < bd) { bd = d; best = e; } });
        if (!best) { showHint('Kein Ziel – zielen auf einen Gegner', 1500); return false; }
        const bx = best.x, bz = best.z; hitE(best, 5 + 3 * (1 - best.hp / best.maxHp), 0, { kb: 0 }); if (!best.dead && best.hp < best.maxHp * .3) damageEnemy(best, best.hp + 1, false, 0, 0);
        pillarFx(bx, bz, 1.8, [1, .93, .55], .8, 30); const fl2 = _FL; later(.12, () => { _FL = fl2; impactFx(bx, bz, 3.4, [1, .93, .55]); shake(.7); }); for (let i = 0; i < 40; i++) fxAdd.emit(bx + rand(-.4, .4), rand(0, 9), bz + rand(-.4, .4), 0, rand(-1, 1), 0, rand(.4, .8), rand(.4, .9), 1, .95, .6, 0, 0, .9);
        sfx('boom', 0); return true;
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
  const lv = ablLv(ab.id); _AM = 1 + .1 * lv; _FL = lv;
  if (ab.cast({ a, tx, tz }) === false) return;
  levelFlair(slot);
  const cd = save.adm && save.adm.nocd ? 0 : ab.cd * (1 - .03 * lv) * (1 - Math.min(.5, p.cdr)); p[mxKey] = p[cdKey] = Math.max(.01, cd); p.skillUsed++;
}
function levelFlair(slot) {   // zusätzlicher Glanz je Stufe: ab 3 Ring, ab 6 Lichtsäule, ab 9 goldener Ausbruch
  const p = player, t = tierOf(); if (!t) return;
  const col = slot ? [.85, .6, 1] : [.5, .9, 1];
  glowBurst(p.x, 1.2, p.z, 3 + t * 1.5, goldMix(col), .4); shockFx(p.x, p.z, 3.2 + t, col, .45);
  if (t >= 2) pillarFx(p.x, p.z, 1.1, col, .5, 12);
  if (t >= 3) { flashLight(p.x, p.z, 16); shake(.5); for (let i = 0; i < 40; i++) { const a = rand(0, TAU), sp = rand(3, 9); fxAdd.emit(p.x, 1, p.z, Math.cos(a) * sp, rand(1, 6), Math.sin(a) * sp, rand(.5, 1), rand(.15, .3), 1, .85, .3, 10, .5, 1); } }
}
function updateChars(dt) {
  const p = player; updateFX(dt);
  p.ultCd = Math.max(0, p.ultCd - dt);
  if (p.spinT > 0) {
    p.spinT -= dt; p.spinTick -= dt;
    if (p.spinTick <= 0) { p.spinTick = .3; circleHit(p.x, p.z, 3.6, e => { hitE(e, 1.0, 0, { kb: 6 }); sparks(e.x, 1.2, e.z, 8, [.9, .95, 1], 7, .35); }); shockFx(p.x, p.z, 3.6, [.85, .9, 1], .3); sfx('hit', 60); }
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
function clearAllies() { clearFX(); ALLIES.forEach(a => scene.remove(a.m)); ALLIES.length = 0; }

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
