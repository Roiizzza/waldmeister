'use strict';
/* ================= Shared geometry + helpers ================= */
const GEO = {
  sphere: new THREE.SphereGeometry(1, 16, 12),
  sphereLo: new THREE.SphereGeometry(1, 8, 6),
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  cylLo: new THREE.CylinderGeometry(1, 1, 1, 7),
  cone: new THREE.ConeGeometry(1, 1, 8),
  limb: new THREE.CylinderGeometry(1, 1, 1, 10).translate(0, -.5, 0),
  limbT: new THREE.CylinderGeometry(1, .72, 1, 10).translate(0, -.5, 0),
  ring: new THREE.RingGeometry(.9, 1, 48).rotateX(-PI / 2),
  disc: new THREE.CircleGeometry(1, 48).rotateX(-PI / 2),
  ico: new THREE.IcosahedronGeometry(1, 0)
};
function M(geo, mat, parent, x, y, z, sx, sy, sz, cast) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x || 0, y || 0, z || 0);
  const a = sx === undefined ? 1 : sx;
  m.scale.set(a, sy === undefined ? a : sy, sz === undefined ? a : sz);
  m.castShadow = !!cast;
  if (parent) parent.add(m);
  return m;
}
function G3(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); if (parent) parent.add(g); return g; }
const mat = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .7, metalness: .1 }, o || {}));
const glowMat = (color, emissive, k) => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: k || 2, roughness: .35 });
const basic = c => new THREE.MeshBasicMaterial({ color: c });

/* ================= PLAYER: kleiner Bohnen-Soldat mit Schusswaffen ================= */
function segMesh(parent, m) { const s = new THREE.Mesh(GEO.cylLo, m); parent.add(s); return s; }
function buildGuns(parent, P) {
  const metal = mat(0x2b3138, { metalness: .6, roughness: .35 }), steel = mat(0x8795a3, { metalness: .6, roughness: .35 }), wood = mat(0x8a5a2a, { roughness: .7 }), dark = mat(0x15191e, { roughness: .6 });
  const G = [];
  const mk = (fn, muz) => { const g = G3(parent); fn(g); g.visible = false; g.userData.muz = muz; G.push(g); return g; };
  mk(g => { // Pistole
    M(GEO.box, metal, g, 0, .05, .3, .12, .16, .5, true); M(GEO.box, steel, g, 0, .1, .35, .1, .06, .46); M(GEO.box, dark, g, 0, -.12, .12, .1, .26, .14, true);
  }, .62);
  mk(g => { // MP
    M(GEO.box, metal, g, 0, .05, .34, .14, .18, .72, true); M(GEO.box, steel, g, 0, .15, .3, .06, .05, .5); M(GEO.box, dark, g, 0, -.2, .3, .09, .32, .12, true); M(GEO.box, dark, g, 0, -.1, .02, .1, .22, .12, true); M(GEO.box, metal, g, 0, .02, -.08, .1, .1, .22);
  }, .78);
  mk(g => { // Schrotflinte
    M(GEO.box, wood, g, 0, 0, -.1, .14, .16, .5, true); M(GEO.box, metal, g, 0, .06, .55, .12, .12, 1.0, true); M(GEO.box, steel, g, 0, -.04, .5, .15, .1, .4, true);
  }, 1.08);
  mk(g => { // Sturmgewehr
    M(GEO.box, metal, g, 0, .05, .4, .14, .18, .95, true); M(GEO.box, steel, g, 0, .18, .35, .06, .06, .6); M(GEO.box, dark, g, 0, -.18, .35, .1, .3, .14, true); M(GEO.box, dark, g, 0, 0, -.2, .12, .2, .35, true); M(GEO.box, metal, g, 0, .05, .95, .06, .06, .3);
  }, 1.1);
  mk(g => { // Scharfschütze
    M(GEO.box, metal, g, 0, .05, .5, .1, .12, 1.3, true); M(GEO.cyl, steel, g, 0, .2, .35, .07, .5, .07).rotation.x = PI / 2; M(GEO.box, dark, g, 0, 0, -.2, .11, .22, .4, true); M(GEO.box, steel, g, 0, -.04, 1.2, .05, .05, .5);
  }, 1.4);
  P.guns = G;
}
function buildGun(i) { const g = G3(null), P = {}; buildGuns(g, P); const o = P.guns[i]; o.visible = true; o.scale.setScalar(1.1); o.rotation.y = -PI / 2; return o; }
function buildPlayer() {
  const root = new THREE.Group(), body = G3(root);
  const green = mat(0x58c02e, { roughness: .55 }), greenD = mat(0x3a8a20, { roughness: .6 }), skin = mat(0xf2c79a, { roughness: .7 });
  const helm = mat(0x3f7a28, { roughness: .45, metalness: .25 }), dark = mat(0x24292f, { roughness: .6 }), white = mat(0xffffff, { roughness: .35 });
  const shorts = mat(0x3a5fa8, { roughness: .7 }), hair = mat(0x6b4a2b, { roughness: .8 });
  const star = new THREE.MeshStandardMaterial({ color: 0xffd34a, emissive: 0xffa800, emissiveIntensity: .35, metalness: .5, roughness: .4 });
  const P = { root, body, flashMats: [green, greenD, skin, helm, shorts, hair], ph: 0, cyan: star, legs: [], arms: [], pony: [], gunOn: true };
  const blob = new THREE.Mesh(new THREE.CircleGeometry(.6, 20).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .3, depthWrite: false }));
  blob.position.y = .04; blob.renderOrder = 1; root.add(blob); P.blob = blob;
  const outfit = [], vestG = [], helmG = [], ringG = [], tagG = [];
  const add = (list, mesh) => { list.push(mesh); return mesh; };
  // Beine: nackt, mit Hose und Stiefeln erst mit Rüstung
  [-1, 1].forEach(s => {
    const leg = G3(body, s * .2, .42, 0);
    M(GEO.limbT, skin, leg, 0, 0, 0, .15, .36, .15, true);
    add(outfit, M(GEO.limbT, greenD, leg, 0, 0, 0, .18, .3, .18, true));
    add(outfit, M(GEO.sphere, dark, leg, 0, -.4, .07, .21, .14, .28, true));
    P.legs.push(leg);
  });
  // Körper: nackte Bohne mit Unterhose
  const torso = G3(body, 0, 0, 0); P.torso = torso;
  M(GEO.sphere, skin, torso, 0, .92, 0, .5, .58, .44, true);
  M(GEO.sphere, shorts, torso, 0, .56, 0, .5, .2, .45, true);
  // Rüstung: Weste mit Tarnflecken, Gürtel, Rucksack
  add(vestG, M(GEO.sphere, green, torso, 0, .95, 0, .56, .5, .5, true));
  [[.2, .75, .44], [-.25, 1.05, .42], [.05, 1.15, .47], [-.3, .72, .4]].forEach(([x, y, z]) => add(vestG, M(GEO.sphere, greenD, torso, x, y, z, .12, .09, .05)));
  add(vestG, M(GEO.cyl, dark, torso, 0, .62, 0, .56, .09, .5));
  add(vestG, M(GEO.box, star, torso, 0, .62, .5, .1, .07, .03));
  add(vestG, M(GEO.box, greenD, torso, 0, .95, -.5, .5, .55, .26, true));
  // Amulett: Marke an Kette
  add(tagG, new THREE.Mesh(new THREE.TorusGeometry(.2, .02, 6, 18), star)).position.set(0, 1.18, .3); tagG[0].rotation.x = 1.2; torso.add(tagG[0]);
  const tag = add(tagG, M(GEO.box, star, torso, 0, 1.0, .46, .1, .16, .03));
  // Kopf: nackt mit Haaren, Helm bei Rüstung
  const head = G3(body, 0, 1.52, 0); P.head = head;
  M(GEO.sphere, skin, head, 0, .08, .02, .4, .34, .38, true);
  [-1, 1].forEach(s => { M(GEO.sphere, white, head, s * .15, .1, .33, .11); M(GEO.sphere, dark, head, s * .15, .1, .42, .055); });
  M(GEO.sphere, dark, head, 0, -.04, .37, .08, .03, .03);
  const hr = M(GEO.sphere, hair, head, 0, .3, -.06, .34, .16, .34); P.hair = hr;
  add(helmG, M(GEO.sphere, helm, head, 0, .26, 0, .46, .3, .45, true));
  add(helmG, M(GEO.cyl, helm, head, 0, .2, .02, .54, .06, .52, true));
  add(helmG, M(GEO.box, star, head, 0, .36, .38, .12, .12, .03)).rotation.z = PI / 4;
  // Arme: nackt, Ärmel bei Rüstung, Ringe als Armreifen
  const armL = G3(body, -.5, 1.05, .05), armR = G3(body, .5, 1.05, .05); P.arms.push(armL, armR);
  [armL, armR].forEach(a => { M(GEO.limbT, skin, a, 0, 0, 0, .13, .42, .13, true); add(outfit, M(GEO.limbT, green, a, 0, 0, 0, .16, .3, .16, true)); M(GEO.sphere, skin, a, 0, -.46, 0, .13);
    const rg = add(ringG, new THREE.Mesh(new THREE.TorusGeometry(.14, .045, 6, 14), star)); rg.position.set(0, -.34, 0); rg.rotation.x = PI / 2; a.add(rg); });
  // Waffen
  const mount = G3(body, .0, .98, .5); P.gunMount = mount;
  buildGuns(mount, P);
  const mz = glowSprite(0xffc040, .9, .9); mount.add(mz); P.muzzle = mz;
  P.gunIdx = 0;
  P.setWeapon = function (i) { P.gunIdx = i; P.guns.forEach((g, k) => g.visible = P.gunOn && k === i); mz.position.set(0, .06, P.guns[i].userData.muz); };
  // look: { gun: Waffenindex oder -1, armor/ring/amulet: Seltenheitsfarbe (Hex-String) oder null }
  P.setLook = function (lk) {
    P.gunOn = lk.gun >= 0; P.setWeapon(Math.max(0, lk.gun));
    const on = !!lk.armor; vestG.forEach(o => o.visible = on); helmG.forEach(o => o.visible = on); outfit.forEach(o => o.visible = on); P.hair.visible = !on;
    ringG.forEach(o => o.visible = !!lk.ring); tagG.forEach(o => o.visible = !!lk.amulet);
    if (lk.armor) star.color.set(lk.armor), star.emissive.set(lk.armor); else if (lk.ring || lk.amulet) star.color.set(lk.ring || lk.amulet), star.emissive.set(lk.ring || lk.amulet);
  };
  P.setLook({ gun: 0, armor: 'x', ring: null, amulet: null }); star.color.set(0xffd34a); star.emissive.set(0xffa800);

  P.setFlash = function (v) { for (const m of this.flashMats) { m.emissive.setRGB(.04 + v, .1 + v * .12, .02 + v * .08); m.emissiveIntensity = 1; } };
  P.anim = function (st, dt, t) {
    const a = Math.min(1, st.speed / 4), aim = st.aim, ph = this.ph += dt * (2.4 + st.speed * 1.0), g = this.gunOn;
    const jig = Math.sin(ph * 2) * .035 * a + Math.sin(t * 2.2) * .015;
    this.body.position.y = Math.abs(Math.sin(ph)) * .1 * a;
    this.body.scale.set(1 - jig, 1 + jig * 1.6, 1 - jig);
    this.legs[0].rotation.x = Math.sin(ph) * .9 * a; this.legs[1].rotation.x = -Math.sin(ph) * .9 * a;
    this.torso.rotation.x = .12 * a + (st.dash ? .25 : 0); this.torso.rotation.z = Math.sin(ph) * .06 * a;
    this.head.rotation.x = -.04 * a; this.head.rotation.z = -Math.sin(ph) * .06 * a;
    this.body.rotation.y = -aim * .15; this.body.position.z = -st.recoil * .12;
    if (g) { this.arms[0].rotation.x = -1.25 - st.recoil * .15; this.arms[0].rotation.z = .55; this.arms[1].rotation.x = -1.3 - st.recoil * .2; this.arms[1].rotation.z = -.5; }
    else { this.arms[0].rotation.x = Math.sin(ph) * .8 * a; this.arms[0].rotation.z = .18; this.arms[1].rotation.x = -Math.sin(ph) * .8 * a; this.arms[1].rotation.z = -.18; }
    this.gunMount.position.z = .5 - st.recoil * .14; this.gunMount.rotation.x = -st.recoil * .12;
    this.blob.scale.setScalar(.95 + Math.sin(t * 2.2) * .03);
    this.muzzle.scale.setScalar(.15 + st.recoil * 1.5 * (st.recoil > .5 ? 1 : .3));
    star.emissiveIntensity = .35 + (st.od ? 1.8 : 0) + Math.sin(t * 3) * .05;
  };
  return P;
}

/* ================= ENEMIES ================= */
const _eyeM = basic(0xff2c1a);
function eyePair(parent, x, y, z, r, gsize, em, gc) {
  [1, -1].forEach(s => {
    M(GEO.sphere, em || _eyeM, parent, s * x, y, z, r);
    const g = glowSprite(gc || 0xff3322, gsize || r * 8, .85); g.position.set(s * x, y, z + r * .6); parent.add(g);
  });
}

function buildCrawler() {
  const root = new THREE.Group(), body = G3(root);
  const skin = mat(0x7a5566, { roughness: .65 }), dark = mat(0x3d2c38, { roughness: .5, metalness: .25 }), bone = mat(0xd8cba8, { roughness: .5 });
  M(GEO.sphere, skin, body, 0, .62, 0, .42, .34, .8, true);
  M(GEO.sphere, dark, body, 0, .74, -.52, .34, .3, .42, true);
  const head = G3(body, 0, .6, .8);
  M(GEO.sphere, skin, head, 0, 0, 0, .27, .23, .32, true);
  M(GEO.sphere, dark, head, 0, -.14, .14, .17, .06, .22);
  eyePair(head, .12, .07, .2, .05, .45);
  [1, -1].forEach(s => { const m = M(GEO.cone, bone, head, s * .09, -.14, .32, .025, .2, .025); m.rotation.x = PI / 2 + .6; });
  for (let i = 0; i < 6; i++) { const sp = M(GEO.cone, dark, body, 0, .98, .55 - i * .27, .06, .3 - i * .015, .06); sp.rotation.x = -.45; }
  const legs = [];
  [[1, .4, 0], [-1, .4, 1], [1, -.35, 1], [-1, -.35, 0]].forEach(([s, z, p]) => {
    const hip = G3(body, s * .3, .62, z); hip.rotation.z = s * .95;
    M(GEO.limbT, skin, hip, 0, 0, 0, .075, .45, .075, true);
    const knee = G3(hip, 0, -.45, 0); knee.rotation.z = -s * 1.55;
    M(GEO.limbT, dark, knee, 0, 0, 0, .055, .5, .055, true);
    M(GEO.cone, bone, knee, 0, -.52, 0, .04, .16, .04).rotation.x = PI;
    legs.push({ hip, knee, p });
  });
  let ph = rand(0, 6);
  return {
    root, flashMats: [skin, dark], hitR: .8,
    anim(e, dt) {
      ph += dt * (5 + e.curSpeed * 2.2);
      body.position.y = Math.abs(Math.sin(ph)) * .05 * Math.min(1, e.curSpeed);
      legs.forEach(L => { L.hip.rotation.x = Math.sin(ph + L.p * PI) * .6 * Math.min(1, e.curSpeed / 2); L.knee.rotation.z += 0; });
      head.rotation.x = e.lunge > 0 ? .5 : Math.sin(ph * 2) * .06;
      body.rotation.x = e.lunge > 0 ? -.25 : 0;
    }
  };
}

function buildSpitter(variant) {
  const root = new THREE.Group(), body = G3(root);
  const healer = variant === 'healer', shield = variant === 'shield';
  const skin = mat(healer ? 0x6f9a84 : shield ? 0x8590a0 : 0x77818f, { roughness: .65 }), cloth = mat(healer ? 0x2d4a3a : shield ? 0x3a3f48 : 0x4a4038, { roughness: .9 }), bone = mat(0xd8ccb0, { roughness: .5 }), dark = mat(0x2e2528, { metalness: .3, roughness: .5 });
  const core = glowMat(healer ? 0x063318 : 0x330606, healer ? 0x40ff7a : 0xff3418, 1.6);
  const eyeMat = healer ? basic(0x7dffa8) : shield ? basic(0xffb030) : _eyeM, eyeGlow = healer ? 0x40ff7a : shield ? 0xffa020 : 0xff3322;
  const legs = [], arms = [];
  [1, -1].forEach(s => {
    const hip = G3(body, s * .12, .88, 0);
    M(GEO.limbT, cloth, hip, 0, 0, 0, .1, .46, .1, true);
    const knee = G3(hip, 0, -.46, 0);
    M(GEO.limbT, skin, knee, 0, 0, 0, .075, .44, .075, true);
    M(GEO.box, dark, knee, 0, -.45, .05, .12, .08, .26);
    legs.push({ hip, knee, s });
  });
  const torso = G3(body, 0, .88, 0); torso.rotation.x = .3;
  const ch = new THREE.Mesh(new THREE.CylinderGeometry(.2, .15, .55, 8), skin); ch.position.y = .3; ch.scale.z = .7; ch.castShadow = true; torso.add(ch);
  M(GEO.sphere, cloth, torso, 0, .08, 0, .17, .14, .13, true);
  [-.07, 0, .07].forEach((x, i) => { const c = M(GEO.box, core, torso, x, .34 - Math.abs(x) * .6, .125, .02, .26, .01); c.rotation.z = x * 4; });
  const cg = glowSprite(healer ? 0x40ff7a : 0xff3418, .9, .8); cg.position.set(0, .34, .2); torso.add(cg);
  for (let i = 0; i < 4; i++) { const sp = M(GEO.cone, bone, torso, 0, .5 - i * .13, -.14, .03, .15, .03); sp.rotation.x = -1.1; }
  const head = G3(torso, 0, .66, .06); head.rotation.x = -.3;
  M(GEO.sphere, skin, head, 0, 0, 0, .125, .14, .13, true);
  M(GEO.sphere, dark, head, 0, -.1, .05, .08, .05, .1);
  eyePair(head, .05, .025, .11, .022, .24, eyeMat, eyeGlow);
  let orb = null;
  if (healer) { orb = glowSprite(0x40ff7a, .9, .85); orb.position.set(0, 2.35, 0); root.add(orb); }
  let shieldG = null;
  if (shield) {
    shieldG = G3(root, 0, 0, 0);
    const steel = mat(0x9aa6b4, { metalness: .85, roughness: .28 }), rim = glowMat(0x0a2a44, 0x35a8ff, 1.8);
    M(GEO.box, steel, shieldG, 0, 1.05, .72, 1.15, 1.7, .12, true);
    M(GEO.box, rim, shieldG, 0, 1.9, .79, 1.15, .06, .03); M(GEO.box, rim, shieldG, 0, .2, .79, 1.15, .06, .03);
    M(GEO.box, rim, shieldG, .56, 1.05, .79, .06, 1.7, .03); M(GEO.box, rim, shieldG, -.56, 1.05, .79, .06, 1.7, .03);
    M(GEO.sphere, rim, shieldG, 0, 1.05, .8, .12, .12, .05);
  }
  [1, -1].forEach(s => {
    const sh = G3(torso, s * .24, .5, 0);
    M(GEO.limbT, skin, sh, 0, 0, 0, .055, .42, .055, true);
    const el = G3(sh, 0, -.42, 0);
    M(GEO.limbT, skin, el, 0, 0, 0, .045, .44, .045, true);
    for (let k = -1; k <= 1; k++) { const c = M(GEO.cone, bone, el, k * .025, -.5, 0, .014, .14, .014); c.rotation.x = PI; }
    arms.push({ sh, el, s });
  });
  let ph = rand(0, 6);
  return {
    root, shieldG, flashMats: [skin, cloth], hitR: .55,
    anim(e, dt) {
      ph += dt * (3.2 + e.curSpeed * 1.4);
      const m = Math.min(1, e.curSpeed / 2), w = e.windup > 0 ? 1 - e.windup / e.windupMax : 0;
      body.position.y = Math.abs(Math.sin(ph)) * .04 * m;
      legs.forEach((L, i) => { const p = ph + (i ? PI : 0); L.hip.rotation.x = Math.sin(p) * .55 * m; L.knee.rotation.x = Math.max(0, Math.sin(p + 1)) * .7 * m + .05; });
      arms.forEach((A, i) => {
        const p = ph + (i ? 0 : PI);
        A.sh.rotation.x = lerp(Math.sin(p) * .35 * m - .15, -2.3, w); A.sh.rotation.z = A.s * lerp(.12, .25, w); A.el.rotation.x = lerp(-.2, -.5, w);
      });
      core.emissiveIntensity = 1.4 + w * 5 + Math.sin(ph * 2) * .3; cg.scale.setScalar(.9 + w * 1.2);
      if (orb) { orb.position.y = 2.35 + Math.sin(ph * 2) * .08; orb.scale.setScalar(.8 + w * 1.4 + Math.sin(ph * 3) * .06); }
      torso.rotation.x = .3 - w * .3;
    }
  };
}

function buildBomber() {
  const root = new THREE.Group(), body = G3(root);
  const skin = mat(0x7a4630, { roughness: .6 }), dark = mat(0x2d1f1a, { roughness: .5, metalness: .3 });
  const core = glowMat(0x401008, 0xff5a14, 2);
  const blob = G3(body);
  M(GEO.sphere, skin, blob, 0, .72, 0, .6, .52, .62, true);
  M(GEO.sphere, core, blob, 0, .64, .3, .36, .3, .3);
  const cg = glowSprite(0xff6a1c, 1.3, .8); cg.position.set(0, .66, .58); blob.add(cg);
  M(GEO.cyl, dark, blob, 0, 1.3, 0, .05, .4, .05);
  const fuse = glowSprite(0xffd060, .7, 1); fuse.position.set(0, 1.52, 0); blob.add(fuse);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, sp = M(GEO.cone, dark, blob, Math.cos(a) * .4, 1.0, Math.sin(a) * .42 - .05, .07, .3, .07); sp.rotation.z = -Math.cos(a) * .6; sp.rotation.x = Math.sin(a) * .6; }
  M(GEO.sphere, skin, blob, 0, .82, .58, .22, .2, .24, true);
  eyePair(blob, .09, .88, .72, .04, .35, basic(0xffe040), 0xffc020);
  const legs = [];
  [[1, .3], [-1, .3], [1, -.3], [-1, -.3]].forEach(([s, z], i) => {
    const hip = G3(body, s * .36, .42, z); hip.rotation.z = s * .5;
    M(GEO.limbT, dark, hip, 0, 0, 0, .09, .42, .09, true);
    legs.push({ hip, i });
  });
  let ph = rand(0, 6);
  return {
    root, flashMats: [skin], hitR: .7,
    anim(e, dt) {
      ph += dt * (9 + e.curSpeed * 2);
      const w = e.windup > 0 ? 1 - e.windup / e.windupMax : 0, m = Math.min(1, e.curSpeed / 2);
      legs.forEach(L => { L.hip.rotation.x = Math.sin(ph + L.i * 1.6) * .8 * m; });
      blob.position.y = Math.abs(Math.sin(ph)) * .08 * m;
      blob.scale.setScalar(1 + w * .3 + (w > 0 ? Math.sin(ph * 6) * .06 : 0));
      core.emissiveIntensity = 2 + w * 9 + Math.sin(ph * 3) * (w > 0 ? 2 : .4);
      cg.scale.setScalar(1.3 + w * 2.2); fuse.scale.setScalar(.7 + Math.sin(ph * 5) * .15 + w * .6);
    }
  };
}

function buildBrute(boss) {
  const root = new THREE.Group(), body = G3(root);
  const skin = mat(boss ? 0x8a2f2a : 0x8a7066, { roughness: .7 });
  const plate = mat(boss ? 0x4a4d58 : 0x7c8a46, { roughness: .5, metalness: .4 });
  const dark = mat(0x2c2326, { roughness: .5, metalness: .3 });
  const bone = mat(0xd2c7a8, { roughness: .45 });
  const core = glowMat(0x401006, boss ? 0xff7a1c : 0xff3a1c, 2);
  const legs = [], arms = [];
  [1, -1].forEach(s => {
    const hip = G3(body, s * .4, 1.2, 0);
    M(GEO.limbT, skin, hip, 0, 0, 0, .26, .62, .26, true);
    const knee = G3(hip, 0, -.62, 0);
    M(GEO.sphere, plate, knee, 0, 0, .1, .26, .22, .2, true);
    M(GEO.limbT, skin, knee, 0, 0, 0, .2, .6, .2, true);
    M(GEO.box, dark, knee, 0, -.62, .1, .4, .2, .6, true);
    legs.push({ hip, knee });
  });
  const torso = G3(body, 0, 1.2, 0);
  M(GEO.sphere, skin, torso, 0, .45, 0, .62, .55, .5, true);
  M(GEO.sphere, skin, torso, 0, 1.0, .05, .88, .68, .6, true);
  M(GEO.box, plate, torso, 0, 1.05, .52, .84, .5, .14, true).rotation.x = -.12;
  M(GEO.box, plate, torso, 0, .5, .46, .6, .3, .1, true);
  M(GEO.sphere, core, torso, 0, 1.05, .6, .12);
  const cg = glowSprite(boss ? 0xff7a1c : 0xff3a1c, 1.1, .8); cg.position.set(0, 1.05, .7); torso.add(cg);
  for (let i = 0; i < 6; i++) { const sp = M(GEO.cone, dark, torso, (i % 2 ? .22 : -.22) * (i > 3 ? 1.4 : 1), .5 + i * .22, -.48, .1, .5 - i * .03, .1, true); sp.rotation.x = -.8; sp.rotation.z = (i % 2 ? -1 : 1) * .25; }
  [1, -1].forEach(s => {
    const pad = M(GEO.sphere, plate, torso, s * .98, 1.5, 0, .4, .3, .42, true);
    for (let k = 0; k < 3; k++) { const sp = M(GEO.cone, dark, pad, (k - 1) * .5, 1.0, 0, .2, .9, .2); sp.rotation.z = (k - 1) * -.45; }
  });
  const head = G3(torso, 0, 1.5, .42);
  M(GEO.sphere, skin, head, 0, 0, 0, .3, .26, .3, true);
  M(GEO.sphere, dark, head, 0, -.15, .1, .2, .08, .22);
  M(GEO.box, dark, head, 0, .1, .22, .46, .08, .1);
  eyePair(head, .12, .04, .26, .05, .55);
  [1, -1].forEach(s => { const t = M(GEO.cone, bone, head, s * .12, -.17, .24, .04, .2, .04); t.rotation.x = PI + .3; });
  if (boss) [1, -1].forEach(s => { const h = M(GEO.cone, bone, head, s * .28, .26, -.04, .07, .6, .07, true); h.rotation.z = -s * .6; h.rotation.x = .25; });
  [1, -1].forEach(s => {
    const sh = G3(torso, s * 1.0, 1.25, 0);
    M(GEO.limbT, skin, sh, 0, 0, 0, .22, .75, .22, true);
    const el = G3(sh, 0, -.75, 0);
    M(GEO.sphere, plate, el, 0, 0, 0, .27, .22, .27, true);
    M(GEO.limbT, skin, el, 0, 0, 0, .27, .85, .27, true);
    M(GEO.sphere, skin, el, 0, -.85, 0, .3, .26, .3, true);
    for (let k = -1; k <= 1; k++) { const c = M(GEO.cone, bone, el, k * .14, -1.05, .1, .05, .32, .05); c.rotation.x = PI - .3; }
    arms.push({ sh, el, s });
  });
  let ph = rand(0, 6);
  return {
    root, flashMats: [skin, plate], hitR: boss ? 1.1 : .9,
    anim(e, dt) {
      ph += dt * (2.2 + e.curSpeed * .9);
      const m = Math.min(1, e.curSpeed / 2), w = e.windup > 0 ? 1 - e.windup / e.windupMax : 0, sl = e.slam > 0 ? e.slam : 0;
      body.position.y = Math.abs(Math.sin(ph)) * .09 * m;
      legs.forEach((L, i) => { const p = ph + (i ? PI : 0); L.hip.rotation.x = Math.sin(p) * .5 * m; L.knee.rotation.x = Math.max(0, Math.sin(p + 1)) * .6 * m + .04; });
      arms.forEach((A, i) => {
        const p = ph + (i ? 0 : PI), idle = Math.sin(p) * .4 * m;
        A.sh.rotation.x = e.windup > 0 ? lerp(idle, -2.8, w) : lerp(idle, .6, sl);
        A.sh.rotation.z = A.s * (.12 + w * .2);
        A.el.rotation.x = e.windup > 0 ? lerp(-.3, -.9, w) : -.3;
      });
      torso.rotation.x = .12 + w * -.2 + sl * .5;
      core.emissiveIntensity = 1.6 + Math.sin(ph * 2) * .4 + (boss ? 1 + (1 - e.hp / e.maxHp) * 3 : 0);
    }
  };
}

/* ================= Projectiles / pickups ================= */
const _arrowMats = {};
function arrowMat(c) { return _arrowMats[c] || (_arrowMats[c] = basic(c)); }
function buildArrow(color, glowCol) { // Kugel mit Leuchtspur
  const g = new THREE.Group(), m = arrowMat(color);
  M(GEO.cyl, m, g, 0, 0, -.1, .05, .55, .05).rotation.x = PI / 2;
  M(GEO.sphere, arrowMat(0xffffff), g, 0, 0, .2, .07, .07, .1);
  const gl = glowSprite(glowCol, 1.0, .8); g.add(gl);
  return g;
}
function buildOrb(color, glow, r) {
  const g = new THREE.Group();
  M(GEO.sphere, arrowMat(color), g, 0, 0, 0, r);
  const gl = glowSprite(glow, r * 5, .9); g.add(gl);
  return g;
}
function buildCoin() {
  const g = new THREE.Group(), spin = G3(g);
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9a21b, emissive: 0xffa800, emissiveIntensity: .7, metalness: .8, roughness: .25 });
  const c = M(GEO.cyl, gold, spin, 0, 0, 0, .22, .06, .22); c.rotation.x = PI / 2;
  const r2 = M(GEO.cyl, arrowMat(0xffe18a), spin, 0, 0, 0, .14, .07, .14); r2.rotation.x = PI / 2;
  const gl = glowSprite(0xffb52e, .85, .55); g.add(gl);
  g.userData.spin = spin; return g;
}
function buildMat(rune) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: rune ? 0x3a1060 : 0x5a3410, emissive: rune ? 0xb06bff : 0xff9a3a, emissiveIntensity: rune ? 2.2 : 1.6, roughness: .35, metalness: .4 });
  const o = M(rune ? GEO.ico : GEO.box, m, g, 0, 0, 0, rune ? .26 : .22, rune ? .26 : .22, rune ? .26 : .22); g.userData.spin = o;
  const gl = glowSprite(rune ? 0xb06bff : 0xff9a3a, 1, .7); g.add(gl);
  return g;
}
function buildXpOrb() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x0d3550, emissive: 0x2fb6ff, emissiveIntensity: 2.2, roughness: .3 });
  const o = M(GEO.ico, m, g, 0, 0, 0, .2); g.userData.spin = o;
  const gl = glowSprite(0x35b8ff, .9, .7); g.add(gl);
  return g;
}

/* Ausrüstungs-Beute: Kiste/Schmuck mit Lichtsäule in Seltenheitsfarbe */
function buildGear(it) {
  const col = new THREE.Color(RAR[it.rar].c), g = new THREE.Group(), spin = G3(g);
  const m = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .9, metalness: .5, roughness: .3 });
  const dk = mat(0x2a3140, { metalness: .5, roughness: .4 });
  if (it.slot === 'weapon') { M(GEO.box, m, spin, 0, 0, 0, .12, .9, .12).rotation.z = .6; M(GEO.box, dk, spin, 0, -.15, 0, .5, .1, .12).rotation.z = .6; }
  else if (it.slot === 'armor') { M(GEO.box, m, spin, 0, 0, 0, .6, .55, .3); M(GEO.box, dk, spin, 0, .12, .16, .5, .1, .02); }
  else if (it.slot === 'ring') { const r = new THREE.Mesh(new THREE.TorusGeometry(.26, .08, 8, 18), m); spin.add(r); M(GEO.ico, m, spin, 0, .32, 0, .13); }
  else { M(GEO.ico, m, spin, 0, 0, 0, .3); M(GEO.box, dk, spin, 0, .38, 0, .06, .2, .06); }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.22, .5, 9, 10, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  beam.position.y = 4.4; g.add(beam);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.55, .75, 28).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .8, depthWrite: false, side: THREE.DoubleSide })); ring.position.y = -.3; g.add(ring);
  const gl = glowSprite(col.getHex(), 2.4, .8); g.add(gl);
  g.scale.setScalar(1.1 + it.rar * .12); g.userData.spin = spin; g.userData.beam = beam; return g;
}

/* ================= Neue Gegner: Scharfschütze, Stürmer, Magier, Geist, Schleim ================= */
function buildSniper() {
  const root = new THREE.Group(), body = G3(root);
  const cloak = mat(0x3d5a3a, { roughness: .9 }), skin = mat(0x6b7a5a, { roughness: .7 }), dark = mat(0x1f2a1e, { roughness: .6 }), wood = mat(0x6a4a2a, { roughness: .6 });
  M(GEO.cone, cloak, body, 0, .75, 0, .42, 1.5, .42, true);
  const head = G3(body, 0, 1.62, 0);
  M(GEO.sphere, skin, head, 0, 0, 0, .24, .24, .26, true);
  M(GEO.cone, cloak, head, 0, .16, -.04, .3, .4, .3, true);
  eyePair(head, .1, .0, .2, .05, .4);
  const gun = G3(body, .32, 1.05, .2);
  M(GEO.box, dark, gun, 0, 0, .5, .09, .12, 1.5, true);
  M(GEO.box, wood, gun, 0, -.06, -.1, .1, .2, .5);
  M(GEO.cyl, glowMat(0x330606, 0xff3418, 2), gun, 0, .1, .5, .05, .2, .05).rotation.x = PI / 2;
  let ph = rand(0, 6);
  return { root, flashMats: [cloak, skin], anim(e, dt) { ph += dt * (4 + e.curSpeed); body.position.y = Math.abs(Math.sin(ph)) * .05 * Math.min(1, e.curSpeed); gun.rotation.x = e.windup > 0 ? -.05 : .1; } };
}
function buildCharger() {
  const root = new THREE.Group(), body = G3(root);
  const hide = mat(0x6e4a3a, { roughness: .8 }), dark = mat(0x3a2a22, { roughness: .6 }), bone = mat(0xf0e6c8, { roughness: .4 });
  M(GEO.sphere, hide, body, 0, .95, 0, .75, .65, 1.05, true);
  M(GEO.sphere, dark, body, 0, 1.2, -.1, .62, .35, .8, true);
  const head = G3(body, 0, .9, 1.0);
  M(GEO.sphere, hide, head, 0, 0, 0, .46, .42, .5, true);
  M(GEO.sphere, dark, head, 0, -.15, .3, .3, .16, .28);
  eyePair(head, .17, .12, .36, .07, .5);
  [1, -1].forEach(s => { const t = M(GEO.cone, bone, head, s * .3, -.12, .38, .07, .55, .07); t.rotation.x = PI / 2 - .5; t.rotation.z = s * .3; });
  const legs = [];
  [[1, .5], [-1, .5], [1, -.5], [-1, -.5]].forEach(([s, z], i) => { const l = G3(body, s * .42, .6, z); M(GEO.limbT, dark, l, 0, 0, 0, .14, .6, .14, true); legs.push(l); });
  let ph = rand(0, 6);
  return { root, flashMats: [hide, dark], anim(e, dt) { ph += dt * (5 + e.curSpeed * 1.2); legs.forEach((l, i) => l.rotation.x = Math.sin(ph + (i % 2) * PI) * .6 * Math.min(1, e.curSpeed / 2)); body.rotation.x = e.charging ? .15 : 0; head.rotation.x = e.charging ? .3 : Math.sin(ph) * .05; } };
}
function buildMage() {
  const root = new THREE.Group(), body = G3(root);
  const robe = mat(0x5a3a8c, { roughness: .8 }), skin = mat(0xd9b89a, { roughness: .7 }), trim = new THREE.MeshStandardMaterial({ color: 0xf2b53a, emissive: 0xffa800, emissiveIntensity: .3, metalness: .6, roughness: .4 });
  const orbM = glowMat(0x2a0a50, 0xc060ff, 2.4);
  M(GEO.cone, robe, body, 0, .8, 0, .5, 1.6, .5, true);
  M(GEO.cyl, trim, body, 0, .55, 0, .36, .1, .36);
  const head = G3(body, 0, 1.7, 0);
  M(GEO.sphere, skin, head, 0, 0, 0, .22, .22, .24, true);
  M(GEO.cone, robe, head, 0, .38, 0, .3, .62, .3, true); M(GEO.cyl, robe, head, 0, .1, 0, .38, .05, .38);
  eyePair(head, .09, .0, .2, .04, .4);
  const staff = G3(body, .5, 0, .3);
  M(GEO.cyl, mat(0x5a3a1a), staff, 0, 1.0, 0, .04, 2, .04);
  const orb = M(GEO.sphere, orbM, staff, 0, 2.1, 0, .17);
  const gl = glowSprite(0xc060ff, 1.4, .8); gl.position.set(0, 2.1, 0); staff.add(gl);
  let ph = rand(0, 6);
  return { root, flashMats: [robe, skin], anim(e, dt, t) { ph += dt * (3 + e.curSpeed); body.position.y = Math.sin(t * 2 + e.seed) * .08; orb.scale.setScalar(.17 * (1 + (e.castT > 0 ? .5 + Math.sin(t * 20) * .2 : 0))); gl.scale.setScalar(1.4 + (e.castT > 0 ? 1 : 0)); staff.rotation.z = e.castT > 0 ? -.3 : 0; } };
}
function buildGhost() {
  const root = new THREE.Group(), body = G3(root);
  const m = new THREE.MeshStandardMaterial({ color: 0xdfe8ff, emissive: 0x6a8cff, emissiveIntensity: .5, transparent: true, opacity: .8, roughness: .5 });
  M(GEO.sphere, m, body, 0, 1.5, 0, .5, .5, .5, true);
  const tail = M(GEO.cone, m, body, 0, .75, 0, .5, 1.5, .5); tail.rotation.x = PI;
  [1, -1].forEach(s => M(GEO.sphere, m, body, s * .6, 1.0, .2, .15, .4, .15).rotation.z = s * .5);
  const eyes = G3(body, 0, 1.55, 0); eyePair(eyes, .17, 0, .4, .07, .5);
  let ph = rand(0, 6);
  return { root, flashMats: [m], ghostMats: [m], anim(e, dt, t) { ph += dt * 3; body.position.y = Math.sin(ph) * .15; const a = e.hidden ? .0 : (e.ghostA === undefined ? .8 : e.ghostA); m.opacity = a; body.visible = a > .02; } };
}
function buildSlime(small) {
  const root = new THREE.Group(), body = G3(root);
  const m = new THREE.MeshStandardMaterial({ color: 0x6adf5a, emissive: 0x1a6a10, emissiveIntensity: .5, transparent: true, opacity: .92, roughness: .3 });
  const core = glowMat(0x0a3a08, 0x9aff6a, 1.6);
  const blob = M(GEO.sphere, m, body, 0, .6, 0, .7, .6, .7, true);
  M(GEO.sphere, core, body, 0, .55, 0, .25);
  eyePair(body, .2, .85, .5, .08, .5);
  let ph = rand(0, 6);
  return { root, flashMats: [m], anim(e, dt) { ph += dt * (6 + e.curSpeed); const k = Math.sin(ph) * .08 * (.4 + Math.min(1, e.curSpeed)); blob.scale.set(.7 * (1 + k), .6 * (1 - k * 1.4), .7 * (1 + k)); } };
}
