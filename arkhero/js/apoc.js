/* ===== Post-Apokalypse-Paket (Quaternius): Kartenobjekte, spielbare Figuren, Waffen ===== */
function loadGlbList(cache, names, cb) {
  if (!THREE.GLTFLoader || !THREE.SkeletonUtils) { cb(false); return; }
  let left = names.length, bad = false; const fin = () => { if (--left <= 0) cb(!bad); };
  if (!names.length) { cb(true); return; }
  names.forEach(n => { if (cache[n]) { fin(); return; } new THREE.GLTFLoader().load('assets/' + n + '.glb?v=1', g => { cache[n] = g; fin(); }, undefined, () => { bad = true; fin(); }); });
}

/* ---- Kartenobjekte (statisch) ---- */
const PROPS = {
  // L = längste Seite, H = Höhe (in Spielmetern)
  defs: {
    container_red: { L: 4.6 }, container_green: { L: 4.6 }, pallet: { L: 1.5 }, pallet_broken: { L: 1.5 }, barrel: { H: 1.2 },
    traffic_barrier: { L: 2.6 }, plastic_barrier: { L: 2.4 }, traffic_cone: { H: .9 }, trash_bag: { H: .8 }, trash_bags: { H: 1.2 },
    fire_hydrant: { H: 1.0 }, cinder_block: { H: .55 }, pipes: { L: 3.2 }, wheels_stack: { H: 1.4 }, wheel: { H: .9 },
    street_light: { H: 5.8 }, traffic_light: { H: 4.8 }, town_sign: { H: 3.6 }, water_tower: { H: 7.5 }, damaged_couch: { L: 2.7 }, chest: { H: 1.2 },
    street_straight: { L: 8 }, street_straight_crack: { L: 8 }, street_turn: { L: 8 }, street_t: { L: 8 }, cross_walk: { L: 8 }, blood_splat: { L: 2.6 }, blood: { L: 2 }
  },
  gl: {}, tpl: {}, state: 0,
  ready() { return this.state === 2; },
  load() {
    if (this.state !== 0) return; this.state = 1;
    loadGlbList(this.gl, Object.keys(this.defs).map(k => 'prop_' + k), ok => { if (ok) this.measure(); this.state = ok ? 2 : -1; });
  },
  measure() {
    for (const id in this.defs) {
      const d = this.defs[id], g = this.gl['prop_' + id], inner = g.scene.clone(true), holder = new THREE.Group(); holder.add(inner); holder.updateMatrixWorld(true);
      let bb = new THREE.Box3().setFromObject(holder); const dx = bb.max.x - bb.min.x, dy = bb.max.y - bb.min.y, dz = bb.max.z - bb.min.z;
      const k = d.L ? d.L / Math.max(dx, dz, .001) : d.H / Math.max(dy, .001); inner.scale.setScalar(k); if (d.L && dz > dx * 1.05) inner.rotation.y = Math.PI / 2;
      holder.updateMatrixWorld(true); bb = new THREE.Box3().setFromObject(holder);
      inner.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
      const top = new THREE.Group(); top.add(holder); top.traverse(o => { if (o.isMesh) { o.castShadow = !d.L || d.L < 6.5 && id.indexOf('street') < 0 && id.indexOf('blood') < 0 && id !== 'cross_walk'; o.receiveShadow = true; } });
      this.tpl[id] = top;
    }
  },
  make(id) { return this.ready() && this.tpl[id] ? this.tpl[id].clone(true) : null; }
};

/* ---- Spielbare Figuren ---- */
const SKINS = [
  { id: 'soldat', name: 'Soldat' },
  { id: 'shaun', name: 'Shaun', file: 'char_shaun' }, { id: 'sam', name: 'Sam', file: 'char_sam' },
  { id: 'matt', name: 'Matt', file: 'char_matt' }, { id: 'lis', name: 'Lis', file: 'char_lis' }
];
const GUNS_GLB = [{ f: 'gun_pistol', L: .34 }, { f: 'gun_smg', L: .55 }, { f: 'gun_shotgun', L: .8 }, { f: 'gun_rifle', L: .85 }, { f: 'gun_rifle', L: 1.1 }];
const CHR = {
  gl: {}, state: 0, cbs: [],
  ready() { return this.state === 2; },
  load(cb) {
    if (this.state === 2) { cb && cb(true); return; } if (cb) this.cbs.push(cb); if (this.state === 1 || this.state === -1) return; this.state = 1;
    loadGlbList(this.gl, SKINS.filter(s => s.file).map(s => s.file).concat(GUNS_GLB.map(g => g.f).filter((v, i, a) => a.indexOf(v) === i)), ok => { this.state = ok ? 2 : -1; this.cbs.splice(0).forEach(f => f(ok)); });
  }
};
const _gunTpl = {};
function gunTemplate(i) {   // Waffe in Spielmetern, Lauf zeigt nach +Z, Ursprung am Griff
  if (_gunTpl[i]) return _gunTpl[i];
  const d = GUNS_GLB[i], g = CHR.gl[d.f]; if (!g) return null;
  const inner = g.scene.clone(true), holder = new THREE.Group(); holder.add(inner); holder.updateMatrixWorld(true);
  let bb = new THREE.Box3().setFromObject(holder); const dx = bb.max.x - bb.min.x, dz = bb.max.z - bb.min.z;
  inner.scale.setScalar(d.L / Math.max(dx, dz, .001)); if (dx > dz) inner.rotation.y = Math.PI / 2; holder.updateMatrixWorld(true);
  bb = new THREE.Box3().setFromObject(holder);
  inner.position.set(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + (bb.max.y - bb.min.y) * .72), -(bb.min.z + (bb.max.z - bb.min.z) * .35));
  const top = new THREE.Group(); top.add(holder); return (_gunTpl[i] = top);
}
function buildGlbPlayer(skin) {
  const g = CHR.gl[skin.file], root = new THREE.Group(), pivot = new THREE.Group(), inner = new THREE.Group();
  const sc = THREE.SkeletonUtils.clone(g.scene); inner.add(sc); pivot.add(inner); root.add(pivot);
  sc.traverse(o => { if (o.isMesh && !o.isSkinnedMesh) o.visible = false; });   // eingebaute Nahkampfwaffe ausblenden
  const blob = new THREE.Mesh(new THREE.CircleGeometry(.6, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .3, depthWrite: false }));
  blob.position.y = .04; blob.renderOrder = 1; root.add(blob);
  const mixer = new THREE.AnimationMixer(sc), A = {};
  for (const [k, n] of [['idle', 'Idle'], ['idleGun', 'Idle_Gun'], ['run', 'Run'], ['runGun', 'Run_Gun']]) { const c = findClip(g.animations, n); if (c) { A[k] = mixer.clipAction(c); A[k].play(); A[k].weight = 0; } }
  // Größe auf Zielhöhe bringen (Ruhepose Idle_Gun)
  if (A.idleGun) { A.idleGun.weight = 1; } mixer.setTime(0); sc.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(sc), k = 1.9 / Math.max(.1, bb.max.y - bb.min.y); inner.scale.setScalar(k); inner.position.y = -bb.min.y * k; root.updateMatrixWorld(true);
  // Waffe an die rechte Hand hängen: Ausrichtung so, dass der Lauf in der Zielpose nach vorne zeigt
  const hand = sc.getObjectByName('LowerArm.R'), fing = sc.getObjectByName('Middle1.R'), grip = new THREE.Group();
  if (hand) {
    const wp = new THREE.Vector3(); (fing || hand).getWorldPosition(wp); const wq = new THREE.Quaternion(); hand.getWorldQuaternion(wq);
    grip.position.copy(hand.worldToLocal(wp)); grip.quaternion.copy(wq.invert()); const ws = new THREE.Vector3(); hand.getWorldScale(ws); grip.scale.setScalar(1 / ws.x); hand.add(grip);
  }
  const flash = glbFlash(sc);
  const P = { root, flashMats: [flash], gunOn: true, gunIdx: 0, grip, cur: null, tint: null };
  P.setTint = function () { };
  P.setWeapon = function (i) {
    P.gunIdx = i; while (grip.children.length) grip.remove(grip.children[0]);
    if (!P.gunOn) return; const t = gunTemplate(Math.max(0, Math.min(GUNS_GLB.length - 1, i))); if (t) { const c = t.clone(true); c.traverse(o => { if (o.isMesh) o.castShadow = true; }); grip.add(c); }
  };
  P.setLook = function (lk) { P.gunOn = lk.gun >= 0; P.setWeapon(Math.max(0, lk.gun)); };
  P.setFlash = function (v) { flash.emissive.setRGB(v); };
  P.anim = function (st, dt, t) {
    const moving = st.speed > .8, gun = P.gunOn;
    const want = gun ? (moving ? 'runGun' : 'idleGun') : (moving ? 'run' : 'idle'), a = A[want] || A.idle;
    if (a && want !== P.cur) { if (P.cur && A[P.cur]) A[P.cur].fadeOut(.15); a.reset().fadeIn(.15).play(); P.cur = want; }
    const ts = Math.max(.7, Math.min(1.7, st.speed / 5.2)); if (A.run) A.run.timeScale = ts; if (A.runGun) A.runGun.timeScale = ts;
    mixer.update(dt); inner.position.z = -(st.recoil || 0) * .1; pivot.rotation.y = -(st.aim || 0) * .1;
    blob.scale.setScalar(.95 + Math.sin(t * 2.2) * .03);
  };
  P.setLook({ gun: 0 }); P.anim({ speed: 0, aim: 0, recoil: 0 }, .02, 0);
  return P;
}
function skinDef() { return SKINS.find(s => s.id === save.skin) || SKINS[0]; }
function buildPlayerSkin() { const s = skinDef(); return s.file && CHR.ready() ? buildGlbPlayer(s) : buildPlayer(); }
function rebuildPlayerModels() {   // Spielfigur, Vorschau und Porträt neu aufbauen (nach Wechsel der Figur)
  const swap = (holder, key, sceneObj) => {
    const old = holder[key]; if (!old) return; const nm = buildPlayerSkin(); const par = old.root.parent || sceneObj; if (par) { par.remove(old.root); par.add(nm.root); } holder[key] = nm; return nm;
  };
  if (typeof pl !== 'undefined' && pl) { const old = pl, nm = buildPlayerSkin(); const par = old.root.parent || scene; par.remove(old.root); par.add(nm.root); nm.root.position.copy(old.root.position); nm.root.rotation.copy(old.root.rotation); nm.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); pl = nm; }
  if (typeof hero !== 'undefined' && hero) swap(hero, 'model', hero.sc);
  if (typeof portrait !== 'undefined' && portrait) swap(portrait, 'model', portrait.sc);
  applyWeaponVisual();
}
function setSkin(id) { save.skin = id; writeSave(); if (skinDef().file && !CHR.ready()) CHR.load(() => rebuildPlayerModels()); else rebuildPlayerModels(); }
