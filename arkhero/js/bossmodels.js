/* ===== Boss-Modelle: Quaternius „Bestiary – Dungeon Monsters“ (GLB mit Skelett, per Code animiert) ===== */
const BOSSM = {
  defs: { puglin: { file: 'Puglin', ph: 3.4 }, imp: { file: 'Imp', ph: 3.0 } },
  gl: {}, state: 0, cbs: [],
  ready() { return this.state === 2; },
  load(cb) {
    if (this.state === 2) { cb && cb(true); return; }
    if (cb) this.cbs.push(cb);
    if (this.state === 1) return;
    if (!THREE.GLTFLoader || !THREE.SkeletonUtils) { this.state = -1; this.cbs.splice(0).forEach(f => f(false)); return; }
    this.state = 1; const ids = Object.keys(this.defs); let left = ids.length, bad = false;
    const done = () => { if (--left > 0) return; this.state = bad ? -1 : 2; this.cbs.splice(0).forEach(f => f(!bad)); };
    ids.forEach(id => new THREE.GLTFLoader().load('assets/' + this.defs[id].file + '.glb?v=1', g => { this.gl[id] = g; done(); }, undefined, () => { bad = true; done(); }));
  },
  build(id) { return this.ready() ? bossModel(id, this.gl[id], this.defs[id]) : null; }
};

/* Drehung eines Knochens in Modell-Achsen (Z, dann X, dann Y) – unabhängig davon, wie der Knochen im Rig ausgerichtet ist */
const _bq = new THREE.Quaternion(), _be = new THREE.Euler();
function bonePose(b, x, y, z) {
  _bq.setFromEuler(_be.set(x, y, z, 'YXZ'));
  b.quaternion.copy(b._Pi).multiply(_bq).multiply(b._P).multiply(b._q0);
}
const BONES = ['pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'Head', 'upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r', 'foot_l', 'foot_r'];
const _sm = t => t * t * (3 - 2 * t);
/* Grundhaltung: Arme hängen locker, Ellbogen leicht gebeugt */
const BASE_POSE = { upperarm_l: [0, 0, -1.28], upperarm_r: [0, 0, 1.28], lowerarm_l: [0, -.35, 0], lowerarm_r: [0, .35, 0], spine_01: [.06, 0, 0], Head: [-.05, 0, 0] };
const ARMS_UP = [-2.7, 0, 0];
/* Schlüsselbilder je Angriff: [Anteil, {Knochen: [x,y,z]}]; fehlende Knochen = Grundhaltung */
const CLIPS = {
  smash: [[0, {}], [.58, { upperarm_l: [-2.75, 0, -.45], upperarm_r: [-2.75, 0, .45], lowerarm_l: [0, -.5, 0], lowerarm_r: [0, .5, 0], spine_01: [-.4, 0, 0], spine_02: [-.25, 0, 0], Head: [-.3, 0, 0], thigh_l: [.25, 0, 0], thigh_r: [.25, 0, 0] }],
    [.7, { upperarm_l: [-1.0, 0, -.9], upperarm_r: [-1.0, 0, .9], lowerarm_l: [0, -.2, 0], lowerarm_r: [0, .2, 0], spine_01: [.55, 0, 0], spine_02: [.35, 0, 0], Head: [.3, 0, 0], thigh_l: [-.55, 0, 0], thigh_r: [-.55, 0, 0], calf_l: [.5, 0, 0], calf_r: [.5, 0, 0] }],
    [.88, { upperarm_l: [-1.0, 0, -.9], upperarm_r: [-1.0, 0, .9], spine_01: [.5, 0, 0], spine_02: [.3, 0, 0], thigh_l: [-.5, 0, 0], thigh_r: [-.5, 0, 0], calf_l: [.45, 0, 0], calf_r: [.45, 0, 0] }], [1, {}]],
  swing: [[0, {}], [.55, { upperarm_r: [-.3, 0, -.4], lowerarm_r: [0, 1.0, 0], upperarm_l: [0, 0, -.7], spine_02: [0, 1.0, 0], spine_03: [0, .4, 0], Head: [-.05, -.5, 0], thigh_l: [.3, 0, 0] }],
    [.68, { upperarm_r: [-1.5, 0, 1.2], lowerarm_r: [0, .2, 0], upperarm_l: [-.4, 0, -1.1], spine_02: [.1, -1.1, 0], spine_03: [0, -.5, 0], Head: [0, .5, 0], thigh_r: [-.4, 0, 0] }],
    [.88, { upperarm_r: [-1.5, 0, 1.2], lowerarm_r: [0, .2, 0], spine_02: [.1, -1.0, 0], spine_03: [0, -.4, 0] }], [1, {}]],
  cast: [[0, {}], [.4, { upperarm_l: [-1.45, 0, -.55], upperarm_r: [-1.45, 0, .55], lowerarm_l: [0, -.25, 0], lowerarm_r: [0, .25, 0], spine_01: [-.2, 0, 0], Head: [-.35, 0, 0] }],
    [.75, { upperarm_l: [-1.65, 0, -.3], upperarm_r: [-1.65, 0, .3], lowerarm_l: [0, -.1, 0], lowerarm_r: [0, .1, 0], spine_01: [.15, 0, 0], Head: [.1, 0, 0] }], [1, {}]],
  roar: [[0, {}], [.3, { upperarm_l: [-.2, 0, -.15], upperarm_r: [-.2, 0, .15], lowerarm_l: [0, -.2, 0], lowerarm_r: [0, .2, 0], spine_01: [-.45, 0, 0], spine_02: [-.3, 0, 0], Head: [-.6, 0, 0], neck_01: [-.2, 0, 0] }],
    [.8, { upperarm_l: [-.1, 0, -.1], upperarm_r: [-.1, 0, .1], lowerarm_l: [0, -.2, 0], lowerarm_r: [0, .2, 0], spine_01: [-.5, 0, 0], spine_02: [-.3, 0, 0], Head: [-.6, 0, 0] }], [1, {}]],
  jump: [[0, {}], [.28, { spine_01: [.6, 0, 0], spine_02: [.3, 0, 0], thigh_l: [-1.0, 0, 0], thigh_r: [-1.0, 0, 0], calf_l: [1.5, 0, 0], calf_r: [1.5, 0, 0], upperarm_l: [.9, 0, -.9], upperarm_r: [.9, 0, .9] }],
    [.45, { spine_01: [-.1, 0, 0], thigh_l: [-1.2, 0, 0], thigh_r: [-.6, 0, 0], calf_l: [1.6, 0, 0], calf_r: [1.2, 0, 0], upperarm_l: [-2.4, 0, -.7], upperarm_r: [-2.4, 0, .7] }],
    [.78, { spine_01: [-.1, 0, 0], thigh_l: [-.4, 0, 0], thigh_r: [-.4, 0, 0], calf_l: [.6, 0, 0], calf_r: [.6, 0, 0], upperarm_l: [-2.6, 0, -.8], upperarm_r: [-2.6, 0, .8] }],
    [.9, { spine_01: [.65, 0, 0], thigh_l: [-1.0, 0, 0], thigh_r: [-1.0, 0, 0], calf_l: [1.4, 0, 0], calf_r: [1.4, 0, 0], upperarm_l: [-.6, 0, -1.0], upperarm_r: [-.6, 0, 1.0] }], [1, {}]],
  stun: [[0, {}], [.2, { spine_01: [.35, 0, 0], Head: [.5, 0, 0], upperarm_l: [0, 0, -1.1], upperarm_r: [0, 0, 1.1] }], [1, { spine_01: [.35, 0, 0], Head: [.5, 0, 0], upperarm_l: [0, 0, -1.1], upperarm_r: [0, 0, 1.1] }]]
};
function clipPose(name, u, out) {
  const k = CLIPS[name]; let i = 0; while (i < k.length - 2 && u > k[i + 1][0]) i++;
  const a = k[i], b = k[i + 1], t = _sm(Math.max(0, Math.min(1, (u - a[0]) / Math.max(.001, b[0] - a[0]))));
  for (const n of BONES) {
    const bs = BASE_POSE[n] || [0, 0, 0], pa = a[1][n] || bs, pb = b[1][n] || bs;
    out[n][0] = pa[0] + (pb[0] - pa[0]) * t; out[n][1] = pa[1] + (pb[1] - pa[1]) * t; out[n][2] = pa[2] + (pb[2] - pa[2]) * t;
  }
}
function bossModel(id, gltf, def) {
  const root = new THREE.Group(), pivot = new THREE.Group(); root.add(pivot);
  const sc = THREE.SkeletonUtils.clone(gltf.scene); pivot.add(sc); root.updateMatrixWorld(true);
  const B = {}; sc.traverse(o => { if (o.isBone) B[o.name] = o; });
  for (const n of BONES) { const b = B[n]; if (!b) continue; b._q0 = b.quaternion.clone(); b._P = b.parent.getWorldQuaternion(new THREE.Quaternion()); b._Pi = b._P.clone().invert(); }
  const meshes = [];
  sc.traverse(o => {
    if (!o.isMesh) return; o.frustumCulled = false;
    const m0 = o.material.clone(), mf = m0.clone(); m0._tinted = mf._tinted = 1;
    mf.emissiveMap = null; mf.emissive = new THREE.Color(.6, .14, .08); mf.emissiveIntensity = 1;
    o._m0 = m0; o._mf = mf; o.material = m0; meshes.push(o);
  });
  let on = false;
  const flashProxy = { emissive: { setRGB(r) { const f = r > .02; if (f === on) return; on = f; for (const o of meshes) o.material = f ? o._mf : o._m0; } }, set emissiveIntensity(v) { } };
  const cur = {}, tgt = {}; for (const n of BONES) { cur[n] = [...(BASE_POSE[n] || [0, 0, 0])]; tgt[n] = [0, 0, 0]; }
  let ph = Math.random() * 6, idleT = Math.random() * 10;
  const model = {
    root, flashMats: [flashProxy], hitR: 1,
    anim(e, dt, time) {
      idleT += dt; const spd = Math.min(1.4, (e.curSpeed || 0) / def.ph), att = e.att;
      ph += dt * (2 + (e.curSpeed || 0) * 1.35);
      let bob = 0, lean = 0, twist = 0;
      if (att) { att.t += dt; if (att.t >= att.T && !att.hold) { e.att = null; } }
      if (e.att) clipPose(e.att.k, Math.min(1, e.att.t / e.att.T), tgt);
      else {
        for (const n of BONES) { const bs = BASE_POSE[n] || [0, 0, 0]; tgt[n][0] = bs[0]; tgt[n][1] = bs[1]; tgt[n][2] = bs[2]; }
        const s = Math.sin(ph), c = Math.cos(ph), br = Math.sin(idleT * 2.1);
        tgt.thigh_l[0] = -s * .75 * spd; tgt.thigh_r[0] = s * .75 * spd;
        tgt.calf_l[0] = Math.max(0, -c) * 1.0 * spd; tgt.calf_r[0] = Math.max(0, c) * 1.0 * spd;
        tgt.upperarm_l[0] = s * .55 * spd; tgt.upperarm_r[0] = -s * .55 * spd;
        tgt.spine_01[0] += .16 * spd + br * .02; tgt.spine_02[1] = s * .18 * spd; tgt.spine_02[0] = br * .03; tgt.Head[1] = Math.sin(idleT * .8) * .22 * (1 - spd);
        tgt.upperarm_l[2] += br * .03; tgt.upperarm_r[2] -= br * .03;
        bob = Math.abs(s) * .07 * spd + br * .004;
      }
      const k = 1 - Math.exp(-(e.att ? 16 : 11) * dt);
      for (const n of BONES) { const b = B[n]; if (!b) continue; const c = cur[n], t = tgt[n]; c[0] += (t[0] - c[0]) * k; c[1] += (t[1] - c[1]) * k; c[2] += (t[2] - c[2]) * k; bonePose(b, c[0], c[1], c[2]); }
      pivot.position.y = bob + (e.jy || 0) / (e.scale || 1);
      pivot.rotation.y = e.spinY || 0;
    }
  };
  return model;
}
