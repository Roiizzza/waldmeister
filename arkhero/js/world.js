'use strict';
/* ================= WORLD: ruined arena at night ================= */
const HW0 = 5.6, PXL0 = 4.7;
let HW = HW0;          // corridor inner half width
let PXL = PXL0;         // movement limit in x
let ZB = 37; const ZA = -6;  // corridor start / end (z)
const obstacles = [];    // circle colliders {x,z,r,type,explosive,obj}
const world = { fires: [], scorches: [], lights: {}, sky: null, moon: null, doors: [], roomObjs: [] };

function addCollider(x, z, r, type, obj, extra) {
  const o = Object.assign({ x, z, r, type, obj }, extra || {});
  obstacles.push(o); return o;
}

function buildWorld() {
  /* ---- sky ---- */
  const skyTex = canvasTex(1024, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#4f9cf0'); g.addColorStop(.3, '#86c0f8'); g.addColorStop(.47, '#cfe8ff'); g.addColorStop(1, '#cfe8ff');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) {
      const cx = Math.random() * w, cy = rand(h * .1, h * .46), rx = rand(70, 220), ry = rand(8, 30);
      x.save(); x.translate(cx, cy); x.scale(1, ry / rx);
      const rg = x.createRadialGradient(0, 0, 0, 0, 0, rx);
      rg.addColorStop(0, 'rgba(255,255,255,' + rand(.12, .32).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = rg; x.fillRect(-rx, -rx, rx * 2, rx * 2); x.restore();
    }
  }, null, true);
  skyTex.wrapS = skyTex.wrapT = THREE.ClampToEdgeWrapping;
  world.sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
  world.sky.renderOrder = -10; world.sky.frustumCulled = false; scene.add(world.sky);

  const moonTex = canvasTex(256, 256, (x) => {
    let g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,244,200,.85)'); g.addColorStop(.3, 'rgba(255,230,160,.3)'); g.addColorStop(1, 'rgba(255,220,140,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#fffbe6'; x.beginPath(); x.arc(128, 128, 22, 0, TAU); x.fill();
  }, null, false);
  world.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, fog: false, depthWrite: false }));
  world.moon.scale.set(95, 95, 1); world.moon.renderOrder = -9; scene.add(world.moon);
  world.moonDir = new THREE.Vector3(-.35, .5, -.8).normalize();

  /* ---- lights ---- */
  const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x8a7a68, 1.6); scene.add(hemi); world.hemi = hemi;
  const moonL = new THREE.DirectionalLight(0xfff2dc, 2.1);
  moonL.castShadow = true; moonL.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
  const sc = moonL.shadow.camera; const sr = MOBILE ? 24 : 30; sc.left = -sr; sc.right = sr; sc.top = sr; sc.bottom = -sr; sc.near = 1; sc.far = 140;
  moonL.shadow.bias = -.0006; moonL.shadow.normalBias = .04;
  scene.add(moonL); scene.add(moonL.target);
  world.lights.moon = moonL;
  const spot = new THREE.SpotLight(0xfff6e8, 1.6, 95, .62, .7, 1.2);
  spot.position.set(0, 14, ZA); spot.target.position.set(0, 0, 8); scene.add(spot); scene.add(spot.target);
  world.lights.spot = spot;
  world.lights.fire1 = new THREE.PointLight(0xff7a2a, 1.6, 17, 2); world.lights.fire2 = new THREE.PointLight(0xff7a2a, 1.6, 17, 2);
  world.lights.flash = new THREE.PointLight(0xffb060, 0, 30, 2);
  world.lights.player = new THREE.PointLight(0xfff0d0, .5, 9, 2);
  scene.add(world.lights.fire1, world.lights.fire2, world.lights.flash, world.lights.player);

  /* ---- ground ---- */
  const aTex = TEX.asphalt();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), new THREE.MeshStandardMaterial({ map: aTex, bumpMap: aTex, bumpScale: .25, roughness: .93, metalness: .05 }));
  ground.rotation.x = -PI / 2; ground.position.z = 20; ground.receiveShadow = true; scene.add(ground); world.ground = ground;

  /* ---- corridor walls ---- */
  const cTex = TEX.concrete();
  const wallMats = [new THREE.MeshStandardMaterial({ map: cTex, roughness: .95 }), new THREE.MeshStandardMaterial({ map: cTex, color: 0xb4bbc4, roughness: .95 })];
  world.wallMats = wallMats;
  const rust = mat(0x5a3220, { roughness: .8, metalness: .4 });
  const lampBox = glowMat(0x553311, 0xffb060, 3);
  world.lampSprites = []; const wn0 = scene.children.length;
  for (let side = -1; side <= 1; side += 2) {
    for (let z = ZA - 4, i = 0; z < ZB + 10; z += 6, i++) {
      const broken = Math.random() < .25, h = broken ? rand(3.4, 4.6) : rand(6, 8.5), px = side * (HW + .9), pz = z + 3;
      const seg = M(GEO.box, wallMats[(i + (side > 0 ? 1 : 0)) % 2], scene, px, h / 2, pz, 1.8, h, 6.02, true); seg.receiveShadow = true;
      for (let k = 0; k < 2; k++) { const off = rand(-2, 2), bh = rand(.5, 1.2), bw = rand(1, 2.2); const ch = M(GEO.box, wallMats[k % 2], scene, px, h + bh / 2 - .1, pz + off, 1.5, bh, bw, true); ch.rotation.y = rand(-.15, .15); ch.rotation.z = rand(-.12, .12); }
      if (broken) for (let k = 0; k < 3; k++) { const len = rand(1, 2), rb = M(GEO.cyl, rust, scene, px + rand(-.4, .4), h + len / 2 - .2, pz + rand(-2, 2), .045, len, .045); rb.rotation.z = rand(-.35, .35); rb.rotation.x = rand(-.35, .35); }
      if (i % 2 === 0) { // wall lamp
        M(GEO.box, lampBox, scene, side * (HW - .05), 3.6, pz, .3, .5, .7);
        const g = glowSprite(0xffb060, 4.2, .55); g.material = g.material.clone(); g.position.set(side * (HW - .6), 3.6, pz); scene.add(g); world.lampSprites.push(g);
      }
    }
  }
  world.wallParts = scene.children.slice(wn0).map(o => ({ o, bx: o.position.x, s: Math.sign(o.position.x) }));
  const backWall = M(GEO.box, wallMats[0], scene, 0, .7, ZA - .9, 2 * HW + 4, 1.4, 1.8, true); backWall.receiveShadow = true;
  const sl1 = M(GEO.box, mat(0x2a3036, { roughness: .8 }), scene, 0, .06, ZA + .2, 2 * HW, .12, .6); // start line
  const sl2 = M(GEO.box, glowMat(0x112233, 0x35e3ff, 2), scene, 0, .1, ZA + 1.2, 2 * HW - .6, .05, .12);
  world.widthMeshes = [backWall, sl1, sl2].map(o => ({ o, sx: o.scale.x }));
  world.fenceDecor = null;

  /* ---- background ruins ---- */
  const bgMat = mat(0x0c121a, { roughness: 1 });
  const winM = new THREE.MeshBasicMaterial({ color: 0xffa84a });
  const NB = MOBILE ? 20 : 38;
  for (let i = 0; i < NB; i++) {
    const a = (i / NB) * TAU + rand(-.08, .08), d = rand(40, 120);
    const w = rand(6, 16), h = rand(12, 44), dd = rand(6, 16);
    const b = M(GEO.box, bgMat, scene, Math.cos(a) * d, h / 2 - 1, 20 + Math.sin(a) * d, w, h, dd);
    b.rotation.y = rand(0, PI); b.rotation.z = rand(-.05, .05);
    if (Math.random() < .45) { const t = M(GEO.box, bgMat, scene, b.position.x + rand(-2, 2), h + 2, b.position.z, w * .5, rand(3, 9), dd * .5); t.rotation.y = b.rotation.y; t.rotation.z = rand(-.3, .3); }
    if (Math.random() < .3) { const wn = M(GEO.box, winM, scene, b.position.x, rand(5, h - 3), b.position.z, .8, 1.1, .8); wn.lookAt(0, wn.position.y, 20); wn.translateZ(Math.min(w, dd) * .5 + .1); }
  }

  // scorch decals
  const scTex = canvasTex(128, 128, (x) => {
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(.6, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  }, null, false);
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ map: scTex, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.y = .03; m.renderOrder = 1; m.visible = false; scene.add(m); world.scorches.push({ m, t: 0 });
  }
}

function buildBarrel(explosive) {
  const g = new THREE.Group();
  const body = mat(explosive ? 0xa5301f : 0x3e4f5c, { roughness: .55, metalness: .45 });
  const ring = mat(explosive ? 0x6b1c12 : 0x2a3640, { roughness: .5, metalness: .6 });
  M(GEO.cyl, body, g, 0, .55, 0, .45, 1.1, .45, true);
  [.2, .55, .9].forEach(y => M(GEO.cyl, ring, g, 0, y, 0, .47, .06, .47, true));
  if (explosive) {
    M(GEO.cyl, mat(0xe0b020), g, 0, .55, 0, .462, .22, .462);
    const sym = M(GEO.box, mat(0x1a1210), g, 0, .55, .46, .12, .12, .02); sym.rotation.z = PI / 4;
    const gl = glowSprite(0xff4020, 1.2, .35); gl.position.set(0, 1.25, 0); g.add(gl);
  } else {
    M(GEO.cyl, basic(0x120d0a), g, 0, 1.1, 0, .38, .02, .38);
  }
  return g;
}
function spawnBarrel(x, z) {
  const b = buildBarrel(true); b.position.set(x, 0, z); scene.add(b);
  return addCollider(x, z, .6, 'barrel', b, { explosive: true, hp: 1 });
}
function removeObstacle(o) {
  const i = obstacles.indexOf(o); if (i >= 0) obstacles.splice(i, 1);
  if (o.obj) scene.remove(o.obj);
}
/* push a {x,z} body of radius r out of every obstacle */
function collideObstacles(b, r) {
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i], dx = b.x - o.x, dz = b.z - o.z, min = o.r + r, d2 = dx * dx + dz * dz;
    if (d2 < min * min) {
      const d = Math.sqrt(d2) || .001, k = (min - d) / d;
      b.x += dx * k; b.z += dz * k;
    }
  }
}
function freeSpot(minPlayerDist, r, px, pz, z0, z1) {
  z0 = z0 === undefined ? ZA + 9 : z0; z1 = z1 === undefined ? ZB - 6 : z1;
  for (let t = 0; t < 30; t++) {
    const x = rand(-PXL + .8, PXL - .8), z = rand(z0, z1);
    if (Math.hypot(x - px, z - pz) < minPlayerDist) continue;
    let ok = true;
    for (const o of obstacles) if (Math.hypot(x - o.x, z - o.z) < o.r + r + .3) { ok = false; break; }
    if (ok) return { x, z };
  }
  return { x: rand(-3, 3), z: rand(z0, z1) };
}

/* ================= ROOMS: front wall + doors + props, rebuilt for every room ================= */
let _roomMats = null;
function roomMats() {
  if (_roomMats) return _roomMats;
  _roomMats = { crate: new THREE.MeshStandardMaterial({ map: TEX.crate(), roughness: .9 }), barrier: mat(0x8e949b, { roughness: .9 }), stripe: mat(0xc8a21e),
    carBody: mat(0x5b3a2b, { roughness: .6, metalness: .45 }), carGlass: mat(0x0b1015, { roughness: .1, metalness: .8 }), tyre: mat(0x101113, { roughness: .9 }),
    rust: mat(0x5a3220, { roughness: .8, metalness: .4 }), dark: mat(0x20262c, { roughness: .6, metalness: .6 }) };
  return _roomMats;
}
function labelSprite(text, color, big) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
  let fs = big === false ? 64 : 78; x.font = '700 ' + fs + 'px Rajdhani, Arial, sans-serif'; while (x.measureText(text).width > 480 && fs > 28) { fs -= 4; x.font = '700 ' + fs + 'px Rajdhani, Arial, sans-serif'; }
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 10; x.strokeStyle = 'rgba(0,0,0,.9)'; x.strokeText(text, 256, 68); x.fillStyle = color; x.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); sp.scale.set(4.4, 1.1, 1); return sp;
}
function clearRoom() {
  world.roomObjs.forEach(o => { scene.remove(o); });
  world.roomObjs.length = 0; world.doors.length = 0; world.fires.length = 0;
  obstacles.slice().forEach(removeObstacle);
}
function addRoomObj(o) { scene.add(o); world.roomObjs.push(o); return o; }
function makeCrate(x, z) {
  const R = roomMats(), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rand(0, PI); scene.add(g);
  const s = rand(1.5, 1.9); M(GEO.box, R.crate, g, 0, s / 2, 0, s, s, s, true).receiveShadow = true;
  if (Math.random() < .7) { const s2 = s * .75; M(GEO.box, R.crate, g, rand(-.2, .2), s + s2 / 2, rand(-.2, .2), s2, s2, s2, true).rotation.y = rand(-.4, .4); }
  addCollider(x, z, 1.05, 'crate', g);
}
function makeBarrier(x, z, rot) {
  const R = roomMats(), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  M(GEO.box, R.barrier, g, 0, .27, 0, 3.4, .55, .85, true).receiveShadow = true;
  M(GEO.box, R.barrier, g, 0, .8, 0, 3.4, .55, .5, true); M(GEO.box, R.stripe, g, 0, .72, .26, 3.0, .12, .02);
  for (let k = -1; k <= 1; k++) addCollider(x + Math.cos(rot) * k * 1.15, z - Math.sin(rot) * k * 1.15, .75, 'barrier', g);
}
function makeCar(x, z, rot) {
  const R = roomMats(), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; g.rotation.z = .03; scene.add(g);
  M(GEO.box, R.carBody, g, 0, .75, 0, 4.4, .75, 1.95, true); M(GEO.box, R.carBody, g, -.2, 1.35, 0, 2.3, .6, 1.75, true); M(GEO.box, R.carGlass, g, -.2, 1.38, 0, 2.2, .45, 1.8);
  [[1.4, .85], [-1.4, .85], [1.4, -.85], [-1.4, -.85]].forEach(w => { const wh = M(GEO.cyl, R.tyre, g, w[0], .4, w[1], .42, .3, .42, true); wh.rotation.x = PI / 2; });
  for (let k = -1; k <= 1; k++) addCollider(x + Math.cos(rot) * k * 1.5, z - Math.sin(rot) * k * 1.5, 1.15, 'car', g);
}
function setRoomWidth(f) {
  HW = HW0 * f; PXL = PXL0 * f;
  world.wallParts.forEach(q => { q.o.position.x = q.bx + q.s * (HW - HW0); });
  world.widthMeshes.forEach(q => { q.o.scale.x = q.sx * f; });
}
function buildRoom(kind, count) {
  clearRoom(); setRoomWidth(S.inf ? 2.25 : 1.5);
  ZB = kind === 'choice' ? 22 : 37;
  const R = roomMats(), fz = ZB + .9, choice = kind === 'choice';
  const gaps = choice ? [-2.7, 2.7] : [0], half = 1.5, W = HW + 1.8;
  // front wall pieces
  let start = -W; const pieces = [];
  gaps.slice().sort((a, b) => a - b).forEach(gx => { pieces.push([start, gx - half]); start = gx + half; }); pieces.push([start, W]);
  pieces.forEach((p, i) => { const w = p[1] - p[0]; if (w > .05) { const m = M(GEO.box, world.wallMats[i % 2], scene, (p[0] + p[1]) / 2, 4, fz, w, 8, 1.8, true); m.receiveShadow = true; world.roomObjs.push(m); } });
  { const vm = world.voidMat || (world.voidMat = new THREE.MeshBasicMaterial({ color: 0x010203, fog: false }));
    const v = M(GEO.box, vm, scene, 0, 4, fz + .9 + 6, (HW + 1.8) * 2, 8, 12); world.roomObjs.push(v); }  // dunkle Leere hinter der Wand und den Türen
  gaps.forEach((gx, i) => {
    const col = choice ? (gx > 0 ? 0xffa030 : 0x40ff7a) : 0xff4a3a;
    const lintel = M(GEO.box, world.wallMats[1], scene, gx, 6.1, fz, half * 2, 3.8, 1.8, true); world.roomObjs.push(lintel);
    const trim = M(GEO.box, glowMat(0x220a05, col, 2.2), scene, gx, 4.15, fz - .95, half * 2 + .2, .14, .1); world.roomObjs.push(trim);
    [-1, 1].forEach(sd => { const t = M(GEO.box, glowMat(0x220a05, col, 2.2), scene, gx + sd * (half + .05), 2.1, fz - .95, .1, 4.2, .1); world.roomObjs.push(t); });
    const panel = new THREE.Group(); panel.position.set(gx, 2.1, fz - .2); scene.add(panel); world.roomObjs.push(panel);
    M(GEO.box, R.dark, panel, 0, 0, 0, half * 2, 4.2, .35, true);
    for (let k = 0; k < 4; k++) M(GEO.box, glowMat(0x220a05, col, 1.4), panel, 0, -1.6 + k * 1.05, -.2, half * 1.8, .12, .05);
    const glow = glowSprite(col, 6, .5); glow.material = glow.material.clone(); glow.material.opacity = 0; glow.position.set(gx, 1.2, fz - 2); scene.add(glow); world.roomObjs.push(glow);
    const d = { mesh: panel, x: gx, open: false, y: 2.1, glow, col };
    if (choice) { const lb = labelSprite(gx > 0 ? 'BONUS' : 'HEILUNG', gx > 0 ? '#ffb050' : '#6dff9a'); lb.position.set(gx, 6.6, fz - 1.1); scene.add(lb); world.roomObjs.push(lb); d.label = lb;
      const sub = gx > 0 ? (S.choiceTal ? S.choiceTal.name : 'Volle Heilung') : 'Volle Leben', lb2 = labelSprite(sub, gx > 0 ? '#ffe2b0' : '#c4ffd6', false); lb2.position.set(gx, 4.95, fz - 1.1); lb2.scale.set(3.6, .9, 1); scene.add(lb2); world.roomObjs.push(lb2); lb.position.y = 5.9; }
    world.doors.push(d);
  });
  // props
  if (!choice) {
    const n = 3 + ((Math.random() * 3) | 0) + (count > 8 ? 1 : 0);
    for (let i = 0; i < n; i++) { const s = freeSpot(0, 1.4, 0, ZA, ZA + 12, ZB - 8); const r = Math.random(); if (r < .5) makeCrate(s.x, s.z); else if (r < .9) makeBarrier(s.x, s.z, rand(-.6, .6) + (Math.random() < .5 ? 0 : PI / 2)); else makeCar(s.x, s.z, rand(-.3, .3) + PI / 2); }
  }
  // burning barrels
  const fp = choice ? [ZB - 4, ZB - 4] : [rand(ZA + 14, ZA + 26), rand(ZA + 26, ZB - 6)];
  [['fire1', -1], ['fire2', 1]].forEach(([k, sd], i) => {
    const x = sd * (HW - .9), z = fp[i], b = buildBarrel(false); b.position.set(x, 0, z); scene.add(b);
    addCollider(x, z, .6, 'barrel', b);
    world.fires.push({ x, z, light: world.lights[k], t: rand(0, 6) }); world.lights[k].position.set(x, 1.8, z);
  });
  buildDecor(S.map, choice);
  if (kind === 'combat' || kind === 'boss') buildTraps(S.map, kind === 'boss' ? 6 : count); else world.traps.length = 0;
}
/* ---- map decor + floor traps ---- */
world.traps = [];
function buildDecor(map, choice) {
  const addD = o => { scene.add(o); world.roomObjs.push(o); return o; };
  const n = MOBILE ? 7 : 12;
  for (let i = 0; i < n; i++) {
    const side = Math.random() < .5 ? -1 : 1, x = side * (HW - rand(.5, 1.1)), z = rand(ZA + 4, ZB - 4);
    if (map === 1) { // cacti + sand piles
      const g = new THREE.Group(); g.position.set(x, 0, z); addD(g);
      const cm = mat(0x3f8a46, { roughness: .8 });
      M(GEO.cyl, cm, g, 0, .8, 0, .22, 1.6, .22, true);
      if (Math.random() < .7) { M(GEO.cyl, cm, g, side * -.4, .85, 0, .14, .5, .14, true).rotation.z = 0; const arm = M(GEO.cyl, cm, g, side * -.28, .6, 0, .14, .4, .14, true); arm.rotation.z = PI / 2; }
      const pile = M(GEO.sphere, mat(0xd9b070, { roughness: 1 }), scene, x - side * rand(0, .8), 0, z + rand(-1, 1), rand(.9, 1.7), rand(.25, .45), rand(.9, 1.5)); world.roomObjs.push(pile);
    } else if (map === 2) { // ice crystals + snow drifts
      const g = new THREE.Group(); g.position.set(x, 0, z); addD(g);
      const im = glowMat(0x1a4a6a, 0x6ac8ff, .9);
      for (let k = 0; k < 3; k++) { const c = M(GEO.cone, im, g, rand(-.35, .35), .7 + k * .12, rand(-.3, .3), rand(.16, .3), rand(1, 2.1), rand(.16, .3)); c.rotation.z = rand(-.25, .25); c.rotation.x = rand(-.25, .25); }
      const gl = glowSprite(0x6ac8ff, 2.6, .35); gl.position.y = 1; g.add(gl);
      const dr = M(GEO.sphere, mat(0xeaf4ff, { roughness: 1 }), scene, x - side * rand(0, .7), 0, z + rand(-1, 1), rand(.9, 1.6), rand(.25, .4), rand(.9, 1.4)); world.roomObjs.push(dr);
    } else if (map === 3) { // lava pools + glowing cracks
      const lv = new THREE.Mesh(new THREE.CircleGeometry(rand(.7, 1.3), 14).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); lv.position.set(x - side * rand(0, .5), .05, z); addD(lv);
      const gl = glowSprite(0xff7a20, 5.5, .8); gl.position.set(lv.position.x, .5, z); addD(gl);
      const rk = M(GEO.sphere, mat(0x2a1612, { roughness: 1 }), scene, x + side * .4, .2, z + rand(-1, 1), rand(.3, .6), rand(.25, .5), rand(.3, .6), true); world.roomObjs.push(rk);
    } else if (!choice && i < 5) { // ruins: broken pillars
      const pm = mat(0x6b737b, { roughness: .95 }); const h = rand(.5, 1.8);
      const pc = M(GEO.cyl, pm, scene, x, h / 2, z, .38, h, .38, true); pc.rotation.z = rand(-.15, .15); world.roomObjs.push(pc);
    }
  }
  if (map === 3 || map === 2) { // floor cracks / frost patches (flat, no collision)
    for (let i = 0; i < 6; i++) {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(rand(.15, .3), rand(2, 4.5)).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: map === 3 ? 0xff7a2a : 0xcfeaff, transparent: true, opacity: map === 3 ? .8 : .35, depthWrite: false }));
      c.position.set(rand(-PXL, PXL), .035, rand(ZA + 6, ZB - 5)); c.rotation.y = rand(-.9, .9); c.renderOrder = 1; addD(c);
    }
  }
}
const TRAP_COL = [0xff4a3a, 0xff9a3a, 0x6ac8ff, 0xff5a1a];
function buildTraps(map, count) {
  world.traps.length = 0;
  const n = Math.min(4, Math.floor(count / 3));
  for (let i = 0; i < n; i++) {
    const s = freeSpot(0, 1.3, 0, ZA, ZA + 12, ZB - 8), w = rand(2.6, 4), d = 1.6;
    const g = new THREE.Group(); g.position.set(s.x, 0, s.z); scene.add(g); world.roomObjs.push(g);
    M(GEO.box, mat(0x1a1f24, { roughness: .7, metalness: .5 }), g, 0, .03, 0, w, .06, d);
    const glowM = new THREE.MeshBasicMaterial({ color: TRAP_COL[map], transparent: true, opacity: .2, depthWrite: false });
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(w * .96, d * .9).rotateX(-PI / 2), glowM); mark.position.y = .07; g.add(mark);
    const spikes = G3(g, 0, 0, 0); const sm = mat(0xcfd6dc, { metalness: .8, roughness: .3 });
    const cols = Math.floor(w / .5), rows = 3;
    for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) M(GEO.cone, sm, spikes, -w / 2 + .3 + a * (w - .6) / (cols - 1), .3, -d / 2 + .3 + b * (d - .6) / (rows - 1), .1, .6, .1, true);
    spikes.scale.y = .01;
    world.traps.push({ x: s.x, z: s.z, w, d, t: rand(0, 2.6), spikes, glowM, hit: false });
  }
}
function setDoors(open) { world.doors.forEach(d => { d.open = open; }); }
function doorAt(x) { for (const d of world.doors) if (d.open && Math.abs(x - d.x) < 1.2) return d; return null; }
function scorchMark(x, z, r) {
  const s = world.scorches.reduce((a, b) => (a.t < b.t ? a : b));
  s.t = 1; s.m.visible = true; s.m.position.x = x; s.m.position.z = z; s.m.scale.set(r * 2, 1, r * 2); s.m.rotation.y = rand(0, TAU);
}
function updateWorld(dt, t, cam, pp) {
  world.sky.position.copy(cam.position);
  world.moon.position.copy(cam.position).addScaledVector(world.moonDir, 250);
  const L = world.lights;
  L.moon.position.set(pp.x - 22, 42, pp.z - 14); L.moon.target.position.set(pp.x, 0, pp.z); L.moon.target.updateMatrixWorld();
  L.spot.position.set(0, 14, pp.z - 7); L.spot.target.position.set(0, 0, pp.z + 7); L.spot.target.updateMatrixWorld();
  world.doors.forEach(d => { const ty = d.open ? 6.4 : 2.1; d.y = damp(d.y, ty, 4, dt); d.mesh.position.y = d.y; d.glow.material.opacity = damp(d.glow.material.opacity, d.open ? .55 : 0, 4, dt); if (d.label) d.label.position.y = 6.6 + Math.sin(t * 2) * .12; });
  L.player.position.set(pp.x, 2.6, pp.z);
  world.fires.forEach(f => {
    f.t += dt; const fl = .8 + Math.sin(f.t * 17) * .12 + Math.sin(f.t * 7.3) * .1 + Math.random() * .1;
    f.light.intensity = 1.6 * fl;
    if (Math.random() < dt * 40) fxAdd.emit(f.x + rand(-.25, .25), 1.15, f.z + rand(-.25, .25), rand(-.3, .3), rand(1.2, 2.6), rand(-.3, .3), rand(.5, 1), rand(.35, .6), 1, rand(.35, .6), .1, -.5, .3, .9);
    if (Math.random() < dt * 5) fxSmoke.emit(f.x, 1.6, f.z, rand(-.3, .3), rand(1, 1.8), rand(-.3, .3), 2.2, rand(.8, 1.3), .08, .08, .09, 0, .3, .3, 2);
    if (Math.random() < dt * 8) fxAdd.emit(f.x, 1.3, f.z, rand(-1, 1), rand(2, 4), rand(-1, 1), rand(.6, 1.2), .08, 1, .7, .3, 3, 0, 1);
  });
  L.flash.intensity = Math.max(0, L.flash.intensity - dt * 28);
  world.scorches.forEach(s => { if (s.t > 0) { s.t -= dt * .05; s.m.material.opacity = Math.max(0, s.t); if (s.t <= 0) s.m.visible = false; } });
}
