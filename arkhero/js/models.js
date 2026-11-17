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
  const armor = mat(0x9aa4ae, { metalness: .5, roughness: .4 });
  const armorD = mat(0x3a424c, { metalness: .5, roughness: .5 });
  const suit = mat(0x262b33, { roughness: .8 });
  const skin = mat(0xcaa08a, { roughness: .55 });
  const hairM = mat(0x4a2a1a, { roughness: .5 });
  const leather = mat(0x4d3524, { roughness: .8 });
  const cyan = glowMat(0x0a3640, 0x2de4ff, 2.4);
  const bowM = new THREE.MeshStandardMaterial({ color: 0x2b3138, emissive: 0x20c8ff, emissiveIntensity: 1, metalness: .7, roughness: .3 });
  const P = { root, body, flashMats: [armor, armorD, suit, skin], ph: 0, legs: [], arms: [], pony: [], cyan, bowM };

  // legs
  [1, -1].forEach(s => {
    const hip = G3(body, s * .14, .98, 0);
    M(GEO.limbT, suit, hip, 0, 0, 0, .105, .5, .105, true);
    M(GEO.box, armor, hip, 0, -.24, .07, .17, .3, .07, true);
    const knee = G3(hip, 0, -.5, 0);
    M(GEO.sphere, armorD, knee, 0, 0, .02, .095, .095, .095, true);
    M(GEO.limbT, suit, knee, 0, 0, 0, .085, .48, .085, true);
    M(GEO.box, armor, knee, 0, -.22, .075, .13, .32, .06, true);
    M(GEO.box, cyan, knee, 0, -.12, .11, .028, .16, .01);
    const foot = G3(knee, 0, -.48, 0);
    M(GEO.box, armorD, foot, 0, -.04, .06, .15, .1, .32, true);
    M(GEO.box, armor, foot, 0, .03, .1, .12, .05, .14, true);
    P.legs.push({ hip, knee, foot, s });
  });
  M(GEO.box, armorD, body, 0, 1.0, 0, .42, .2, .27, true);
  M(GEO.box, cyan, body, 0, 1.0, .14, .12, .03, .01);

  // torso
  const torso = G3(body, 0, 1.08, 0); P.torso = torso;
  M(GEO.cyl, suit, torso, 0, .08, 0, .17, .24, .14, true);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(.25, .19, .5, 10), armor);
  chest.scale.z = .72; chest.position.y = .4; chest.castShadow = true; torso.add(chest);
  M(GEO.box, armorD, torso, 0, .42, .15, .3, .32, .06, true);
  M(GEO.box, cyan, torso, 0, .5, .185, .22, .025, .01);
  M(GEO.box, cyan, torso, 0, .34, .185, .16, .02, .01);
  // back pack with cyan cells
  M(GEO.box, armorD, torso, 0, .38, -.2, .3, .34, .13, true);
  M(GEO.box, cyan, torso, -.08, .38, -.27, .035, .26, .01);
  M(GEO.box, cyan, torso, .08, .38, -.27, .035, .26, .01);
  // quiver
  const quiver = G3(torso, .13, .46, -.3); quiver.rotation.z = -.38; quiver.rotation.x = -.15;
  M(GEO.cyl, leather, quiver, 0, 0, 0, .06, .55, .06, true);
  for (let i = 0; i < 6; i++) {
    const a = M(GEO.cyl, cyan, quiver, rand(-.03, .03), .3 + rand(0, .1), rand(-.03, .03), .012, .22, .012);
    a.rotation.z = rand(-.2, .2);
    M(GEO.sphere, cyan, quiver, a.position.x, a.position.y + .13, a.position.z, .022);
  }
  const strap = M(GEO.box, leather, torso, 0, .42, 0, .05, .62, .3); strap.rotation.z = .55;
  // neck + head
  M(GEO.cyl, skin, torso, 0, .7, 0, .055, .1, .055, true);
  const head = G3(torso, 0, .86, .01); P.head = head;
  M(GEO.sphere, skin, head, 0, 0, 0, .135, .155, .145, true);
  M(GEO.sphere, skin, head, 0, -.09, .05, .08, .075, .08);
  for (const s of [1, -1]) {
    M(GEO.sphere, basic(0xffffff), head, s * .055, .02, .125, .028, .02, .012);
    M(GEO.sphere, basic(0x1a1210), head, s * .055, .02, .135, .015, .017, .01);
    const brow = M(GEO.box, hairM, head, s * .055, .062, .13, .055, .011, .012); brow.rotation.z = s * -.12;
    M(GEO.sphere, hairM, head, s * .14, -.01, -.02, .035, .095, .06);
    M(GEO.cyl, cyan, head, s * .147, -.01, .02, .035, .025, .035).rotation.z = PI / 2;
  }
  M(GEO.sphere, mat(0xb8806d), head, 0, -.015, .148, .016, .02, .02);
  M(GEO.box, mat(0x8c3d3d), head, 0, -.08, .135, .04, .01, .01);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12, 0, TAU, 0, PI * .66), hairM);
  dome.scale.set(.15, .163, .162); dome.position.set(0, .015, -.025); dome.rotation.x = -.35; dome.castShadow = true; head.add(dome);
  M(GEO.sphere, hairM, head, 0, .1, .085, .12, .035, .06);
  M(GEO.sphere, hairM, head, 0, .02, -.1, .14, .15, .09, true);
  // mic boom
  const boom = M(GEO.cyl, armorD, head, .15, -.04, .07, .005, .09, .005); boom.rotation.x = PI / 2; boom.rotation.y = .5;
  M(GEO.sphere, cyan, head, .12, -.045, .13, .014);
  // ponytail chain
  const pBase = G3(head, 0, .075, -.17); P.pony.push(pBase);
  let par = pBase;
  for (let i = 0; i < 4; i++) {
    const w = .062 * (1 - i * .16);
    M(GEO.limbT, hairM, par, 0, 0, 0, w, .15, w, true);
    M(GEO.sphere, hairM, par, 0, -.012, 0, w * 1.1);
    const nx = G3(par, 0, -.14, 0); P.pony.push(nx); par = nx;
  }
  M(GEO.cyl, cyan, pBase, 0, -.01, 0, .07, .03, .07);

  // arms: arms[0] = bow arm (+x), arms[1] = string arm (-x)
  [1, -1].forEach(s => {
    const sh = G3(torso, s * .31, .58, 0);
    M(GEO.sphere, armor, sh, s * .03, .03, 0, .14, .11, .14, true);
    M(GEO.box, cyan, sh, s * .06, .1, 0, .06, .012, .1);
    M(GEO.limbT, suit, sh, 0, 0, 0, .065, .32, .065, true);
    M(GEO.box, armor, sh, s * .025, -.12, 0, .05, .2, .12, true);
    const el = G3(sh, 0, -.32, 0);
    M(GEO.sphere, armorD, el, 0, 0, 0, .06);
    M(GEO.limbT, suit, el, 0, 0, 0, .055, .3, .055, true);
    M(GEO.box, armor, el, 0, -.13, 0, .11, .17, .12, true);
    M(GEO.box, cyan, el, s * .06, -.13, 0, .01, .12, .04);
    M(GEO.sphere, armorD, el, 0, -.31, 0, .055);
    P.arms.push({ sh, el, s });
  });
  // bow in left hand
  const bowMount = G3(P.arms[0].el, 0, -.3, 0); P.bowMount = bowMount;
  const bow = G3(bowMount); P.bow = bow;
  const R = .62, depth = .5 * R;
  const arcHolder = G3(bow, 0, 0, -depth); arcHolder.rotation.y = -PI / 2; arcHolder.scale.set(.5, 1, 1);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(R, .026, 8, 32, PI), bowM); arc.rotation.z = -PI / 2; arc.castShadow = true; arcHolder.add(arc);
  M(GEO.box, leather, bow, 0, 0, 0, .05, .2, .06, true);
  for (const s of [1, -1]) { const tip = glowSprite(0x35e3ff, .5, .9); tip.position.set(0, s * R, -depth * .1); bow.add(tip); }
  M(GEO.cyl, basic(0xbff6ff), bow, 0, 0, -depth, .006, R * 2, .006);
  const nock = G3(bow, 0, 0, -depth); P.nock = nock;
  const sh1 = M(GEO.cyl, basic(0x9ff4ff), nock, 0, 0, .45, .014, .9, .014); sh1.rotation.x = PI / 2;
  const hd = M(GEO.cone, basic(0xffffff), nock, 0, 0, .95, .045, .16, .045); hd.rotation.x = PI / 2;
  const nglow = glowSprite(0x35e3ff, .5, .9); nglow.position.set(0, 0, .95); nock.add(nglow);
  nock.visible = false;

  P.setFlash = function (v) {
    for (const m of this.flashMats) { m.emissive.setRGB(v, v * .12, v * .08); m.emissiveIntensity = 1; }
  };
  P.anim = function (st, dt, t) {
    const a = Math.min(1, st.speed / 3), aim = st.aim, dash = st.dash || 0;
    this.ph += dt * (4 + st.speed * 1.15);
    const ph = this.ph;
    this.legs.forEach((L, i) => {
      const p = ph + (i ? PI : 0);
      L.hip.rotation.x = Math.sin(p) * .85 * a - dash * .55;
      L.knee.rotation.x = Math.max(0, Math.sin(p + 1.3)) * 1.15 * a + .06 + dash * .8;
      L.foot.rotation.x = -(L.hip.rotation.x + L.knee.rotation.x) * .35;
    });
    this.body.position.y = Math.abs(Math.sin(ph)) * .05 * a - dash * .12;
    this.torso.rotation.x = .08 * a + dash * .45 + aim * .06 + Math.sin(t * 1.8) * .01;
    this.torso.rotation.y = lerp(Math.sin(ph) * .08 * a, -.18, aim);
    const [L, Rr] = this.arms, sw = Math.sin(ph) * .75 * a;
    L.sh.rotation.x = lerp(-sw * .9 - .12, -1.42, aim) - st.recoil * .08;
    L.sh.rotation.z = lerp(.1, 0, aim);
    L.el.rotation.x = lerp(-.3 - .2 * a, -.06, aim);
    Rr.sh.rotation.x = lerp(sw * .9 - .1, -1.15, aim);
    Rr.sh.rotation.z = lerp(-.1, -.55, aim);
    Rr.el.rotation.x = lerp(-.35 - .2 * a, -2.05, aim) + st.recoil * .9;
    this.bowMount.rotation.x = aim * PI / 2;
    this.nock.visible = aim > .65 && st.recoil < .35;
    const lag = a * .55 + .3 + dash * .5;
    this.pony.forEach((l, i) => { l.rotation.x = (i === 0 ? .5 + lag : 0) + Math.sin(ph * .6 + i * .9) * .16 * (a + .25) + (i ? .1 * a : 0); });
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
