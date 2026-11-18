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

/* ================= PLAYER: sci-fi huntress with energy bow ================= */
function buildPlayer() {
  const root = new THREE.Group(), body = G3(root);
  const shell = mat(0xb9c4cf, { metalness: .6, roughness: .32 });
  const shellD = mat(0x2d343d, { metalness: .6, roughness: .45 });
  const trim = mat(0xe8eef3, { metalness: .5, roughness: .35 });
  const cyan = glowMat(0x0a3640, 0x2de4ff, 2.4);
  const lens = glowMat(0x061018, 0x7af0ff, 3.2);
  const bowM = new THREE.MeshStandardMaterial({ color: 0x2b3138, emissive: 0x20c8ff, emissiveIntensity: 1, metalness: .7, roughness: .3 });
  const P = { root, body, flashMats: [shell, shellD, trim], ph: 0, cyan, bowM, legs: [], arms: [], pony: [] };
  const HOVER = 1.15;
  // soft blob shadow on the ground
  const blob = new THREE.Mesh(new THREE.CircleGeometry(.62, 20).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .38, depthWrite: false }));
  blob.position.y = .04; blob.renderOrder = 1; root.add(blob); P.blob = blob;

  const hull = G3(body); P.hull = hull;
  // chassis: flattened shell + dark belly
  M(GEO.sphere, shell, hull, 0, 0, 0, .46, .3, .56, true);
  M(GEO.sphere, shellD, hull, 0, -.13, -.02, .4, .17, .5, true);
  M(GEO.box, trim, hull, 0, .2, -.05, .1, .05, .5, true);
  // nose: sensor eye
  M(GEO.sphere, shellD, hull, 0, .02, .46, .21, .17, .13, true);
  M(GEO.sphere, lens, hull, 0, .02, .55, .1, .1, .05);
  const eg = glowSprite(0x7af0ff, .9, .8); eg.position.set(0, .02, .62); hull.add(eg); P.eyeGlow = eg;
  // cyan accent strips
  [1, -1].forEach(s => { M(GEO.box, cyan, hull, s * .3, .02, .1, .03, .05, .6); });
  // rear core + antenna
  M(GEO.sphere, cyan, hull, 0, .04, -.5, .14, .14, .09);
  const cg = glowSprite(0x2de4ff, .9, .7); cg.position.set(0, .04, -.58); hull.add(cg);
  const ant = M(GEO.cyl, shellD, hull, .16, .38, -.25, .012, .4, .012); ant.rotation.z = -.15;
  M(GEO.sphere, cyan, hull, .185, .58, -.25, .03);
  // side pods with spinning rotor rings
  P.rings = [];
  [1, -1].forEach(s => {
    const pod = G3(hull, s * .62, -.02, .0);
    M(GEO.cyl, shellD, pod, 0, 0, 0, .1, .22, .1, true);
    M(GEO.box, shell, pod, -s * .26, .03, 0, .5, .05, .1, true);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.26, .028, 6, 20).rotateX(PI / 2), cyan); ring.position.y = .13; pod.add(ring); P.rings.push(ring);
    const bl = M(GEO.cyl, basic(0x9ff4ff), pod, 0, .13, 0, .24, .01, .24); bl.material = new THREE.MeshBasicMaterial({ color: 0x9ff4ff, transparent: true, opacity: .16, depthWrite: false }); P.rings.push(bl);
    const jet = glowSprite(0x35e3ff, .8, .8); jet.position.set(0, -.2, 0); pod.add(jet);
  });
  // belly thruster glow
  const bj = glowSprite(0x35e3ff, 1.5, .55); bj.position.set(0, -.35, 0); hull.add(bj); P.belly = bj;
  // weapon module on the nose (scaled per weapon)
  const bowMount = G3(hull, 0, -.04, .5); P.bowMount = bowMount;
  const bow = G3(bowMount); P.bow = bow;
  M(GEO.cyl, shellD, bow, 0, 0, .25, .075, .5, .075, true).rotation.x = PI / 2;
  const barrel = M(GEO.cyl, bowM, bow, 0, 0, .52, .055, .26, .055, true); barrel.rotation.x = PI / 2;
  [1, -1].forEach(s => { const rail = M(GEO.box, bowM, bow, s * .13, 0, .3, .035, .06, .44, true); });
  const mz = glowSprite(0x35e3ff, .5, .9); mz.position.set(0, 0, .68); bow.add(mz); P.muzzle = mz;
  P.nock = G3(bow); P.nock.visible = false;
  P.head = hull; P.torso = body;

  P.setFlash = function (v) {
    for (const m of this.flashMats) { m.emissive.setRGB(v, v * .12, v * .08); m.emissiveIntensity = 1; }
  };
  P.anim = function (st, dt, t) {
    const a = Math.min(1, st.speed / 4), aim = st.aim;
    this.ph += dt * (2.4 + st.speed * .4);
    this.body.position.y = HOVER + Math.sin(t * 2.4) * .06 + Math.sin(this.ph) * .03 * a;
    this.hull.rotation.x = .26 * a + aim * -.05 - st.recoil * .18;
    this.hull.rotation.z = Math.sin(t * 1.7) * .03;
    this.hull.position.z = -st.recoil * .12;
    this.bow.position.z = aim * .1;
    this.rings.forEach((r, i) => { if (r.geometry.type === 'TorusGeometry') r.rotation.y += dt * (6 + st.speed * 1.5) * (i ? -1 : 1); });
    this.blob.scale.setScalar(.95 + Math.sin(t * 2.4) * .04);
    this.belly.scale.setScalar(1.5 + a * .5 + Math.sin(t * 9) * .08);
    this.muzzle.scale.setScalar(.5 + aim * .35 + st.recoil * 1.4);
    this.cyan.emissiveIntensity = 2.1 + Math.sin(t * 3) * .4 + (st.od ? 1.6 : 0);
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
  if (shield) {
    const steel = mat(0x9aa6b4, { metalness: .85, roughness: .28 }), rim = glowMat(0x0a2a44, 0x35a8ff, 1.8);
    M(GEO.box, steel, root, 0, 1.05, .72, 1.15, 1.7, .12, true);
    M(GEO.box, rim, root, 0, 1.9, .79, 1.15, .06, .03); M(GEO.box, rim, root, 0, .2, .79, 1.15, .06, .03);
    M(GEO.box, rim, root, .56, 1.05, .79, .06, 1.7, .03); M(GEO.box, rim, root, -.56, 1.05, .79, .06, 1.7, .03);
    M(GEO.sphere, rim, root, 0, 1.05, .8, .12, .12, .05);
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
    root, flashMats: [skin, cloth], hitR: .55,
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
function buildArrow(color, glowCol) {
  const g = new THREE.Group(), m = arrowMat(color);
  M(GEO.cyl, m, g, 0, 0, 0, .028, 1.15, .028).rotation.x = PI / 2;
  M(GEO.cone, arrowMat(0xffffff), g, 0, 0, .64, .075, .24, .075).rotation.x = PI / 2;
  const f = M(GEO.box, m, g, 0, 0, -.5, .005, .16, .16); const f2 = M(GEO.box, m, g, 0, 0, -.5, .16, .005, .16);
  const gl = glowSprite(glowCol, 1.05, .8); g.add(gl);
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
function buildXpOrb() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x0d3550, emissive: 0x2fb6ff, emissiveIntensity: 2.2, roughness: .3 });
  const o = M(GEO.ico, m, g, 0, 0, 0, .2); g.userData.spin = o;
  const gl = glowSprite(0x35b8ff, .9, .7); g.add(gl);
  return g;
}
