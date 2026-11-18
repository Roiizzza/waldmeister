'use strict';
/* ================= WORLD: ruined arena at night ================= */
const A = 30;            // inner half-size of the arena walls
const PLAY = 27.6;       // movement limit
const obstacles = [];    // circle colliders {x,z,r,type,explosive,obj}
const world = { fires: [], scorches: [], lights: {}, sky: null, moon: null };

function addCollider(x, z, r, type, obj, extra) {
  const o = Object.assign({ x, z, r, type, obj }, extra || {});
  obstacles.push(o); return o;
}

function buildWorld() {
  /* ---- sky ---- */
  const skyTex = canvasTex(1024, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#02040a'); g.addColorStop(.3, '#07101c'); g.addColorStop(.47, '#0d1826'); g.addColorStop(1, '#0d1826');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { x.fillStyle = 'rgba(255,255,255,' + rand(.1, .8).toFixed(2) + ')'; x.fillRect(Math.random() * w, Math.random() * h * .42, rand(.6, 1.8), rand(.6, 1.8)); }
    for (let i = 0; i < 80; i++) {
      const cx = Math.random() * w, cy = rand(h * .1, h * .46), rx = rand(70, 220), ry = rand(8, 30);
      x.save(); x.translate(cx, cy); x.scale(1, ry / rx);
      const rg = x.createRadialGradient(0, 0, 0, 0, 0, rx);
      rg.addColorStop(0, 'rgba(120,150,190,' + rand(.04, .1).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(120,150,190,0)');
      x.fillStyle = rg; x.fillRect(-rx, -rx, rx * 2, rx * 2); x.restore();
    }
  }, null, true);
  skyTex.wrapS = skyTex.wrapT = THREE.ClampToEdgeWrapping;
  world.sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
  world.sky.renderOrder = -10; world.sky.frustumCulled = false; scene.add(world.sky);

  const moonTex = canvasTex(256, 256, (x) => {
    let g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, 'rgba(190,210,255,.55)'); g.addColorStop(.3, 'rgba(150,180,255,.18)'); g.addColorStop(1, 'rgba(120,150,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#f4f7ff'; x.beginPath(); x.arc(128, 128, 20, 0, TAU); x.fill();
    x.fillStyle = 'rgba(150,160,185,.35)';
    [[120, 122, 5], [134, 134, 4], [126, 138, 3], [136, 120, 3]].forEach(c => { x.beginPath(); x.arc(c[0], c[1], c[2], 0, TAU); x.fill(); });
  }, null, false);
  world.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, fog: false, depthWrite: false }));
  world.moon.scale.set(95, 95, 1); world.moon.renderOrder = -9; scene.add(world.moon);
  world.moonDir = new THREE.Vector3(-.35, .5, -.8).normalize();

  /* ---- lights ---- */
  const hemi = new THREE.HemisphereLight(0x86a2d6, 0x2a241e, .95); scene.add(hemi); world.hemi = hemi;
  const moonL = new THREE.DirectionalLight(0xb4c9ff, 1.25);
  moonL.castShadow = true; moonL.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
  const sc = moonL.shadow.camera; const sr = MOBILE ? 24 : 30; sc.left = -sr; sc.right = sr; sc.top = sr; sc.bottom = -sr; sc.near = 1; sc.far = 140;
  moonL.shadow.bias = -.0006; moonL.shadow.normalBias = .04;
  scene.add(moonL); scene.add(moonL.target);
  world.lights.moon = moonL;
  const spot = new THREE.SpotLight(0xe8fff0, 2.4, 95, .62, .7, 1.2);
  spot.position.set(-A + 2.5, 13.2, -A + 2.5); spot.target.position.set(4, 0, 4); scene.add(spot); scene.add(spot.target);
  world.lights.spot = spot;
  world.lights.fire1 = new THREE.PointLight(0xff7a2a, 1.6, 17, 2); world.lights.fire2 = new THREE.PointLight(0xff7a2a, 1.6, 17, 2);
  world.lights.flash = new THREE.PointLight(0xffb060, 0, 30, 2);
  world.lights.player = new THREE.PointLight(0x5fe0ff, .55, 9, 2);
  scene.add(world.lights.fire1, world.lights.fire2, world.lights.flash, world.lights.player);

  /* ---- ground ---- */
  const aTex = TEX.asphalt();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), new THREE.MeshStandardMaterial({ map: aTex, bumpMap: aTex, bumpScale: .25, roughness: .93, metalness: .05 }));
  ground.rotation.x = -PI / 2; ground.receiveShadow = true; scene.add(ground); world.ground = ground;

  /* ---- walls ---- */
  const cTex = TEX.concrete();
  const wallMats = [new THREE.MeshStandardMaterial({ map: cTex, roughness: .95 }), new THREE.MeshStandardMaterial({ map: cTex, color: 0xb4bbc4, roughness: .95 })];
  world.wallMats = wallMats;
  const rust = mat(0x5a3220, { roughness: .8, metalness: .4 });
  const leafTex = TEX.leaves();
  const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: 1 });
  const fenceTex = TEX.fence();
  const fenceMat = new THREE.MeshStandardMaterial({ map: fenceTex, transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: .6, metalness: .6 });
  const sides = [
    { n: [0, 1], c: [0, -(A + .9)] }, { n: [0, -1], c: [0, A + .9] },
    { n: [1, 0], c: [-(A + .9), 0] }, { n: [-1, 0], c: [A + .9, 0] }
  ];
  sides.forEach((sd, si) => {
    const alongX = sd.n[0] === 0, th = Math.atan2(sd.n[0], sd.n[1]);
    for (let i = 0; i < 10; i++) {
      const u = -27 + i * 6, broken = Math.random() < .28;
      const h = broken ? rand(2.6, 4) : rand(6, 8.5), w = 6.02;
      const px = sd.c[0] + (alongX ? u : 0), pz = sd.c[1] + (alongX ? 0 : u);
      const seg = M(GEO.box, wallMats[(i + si) % 2], scene, px, h / 2, pz, alongX ? w : 1.8, h, alongX ? 1.8 : w, true);
      seg.receiveShadow = true;
      // jagged top + rebar
      const tx = alongX ? 1 : 0, tz = alongX ? 0 : 1;
      for (let k = 0; k < 2; k++) {
        const off = rand(-2, 2), bh = rand(.5, 1.3), bw = rand(1, 2.2);
        const ch = M(GEO.box, wallMats[k % 2], scene, px + tx * off, h + bh / 2 - .1, pz + tz * off, alongX ? bw : 1.5, bh, alongX ? 1.5 : bw, true);
        ch.rotation.y = rand(-.15, .15); ch.rotation.z = rand(-.12, .12);
      }
      if (broken || Math.random() < .4) for (let k = 0; k < 4; k++) {
        const off = rand(-2.4, 2.4), len = rand(1, 2.2);
        const rb = M(GEO.cyl, rust, scene, px + tx * off + sd.n[0] * rand(-.4, .4), h + len / 2 - .2, pz + tz * off + sd.n[1] * rand(-.4, .4), .045, len, .045);
        rb.rotation.z = rand(-.35, .35); rb.rotation.x = rand(-.35, .35);
      }
      if (Math.random() < .42) {
        const v = new THREE.Mesh(new THREE.PlaneGeometry(rand(2, 3), rand(2.2, Math.min(7, h))), leafMat);
        v.position.set(sd.c[0] - sd.n[0] * -.92 + (alongX ? u + rand(-1.5, 1.5) : 0) - sd.n[0] * 0, h - v.geometry.parameters.height / 2 + .3, sd.c[1] - sd.n[1] * -.92 + (alongX ? 0 : u + rand(-1.5, 1.5)));
        v.position.x = (alongX ? px + rand(-1.5, 1.5) : sd.c[0] + sd.n[0] * .93);
        v.position.z = (alongX ? sd.c[1] + sd.n[1] * .93 : pz + rand(-1.5, 1.5));
        v.rotation.y = th; scene.add(v);
      }
    }
  });
  // corner pillars
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => {
    const p = M(GEO.box, wallMats[1], scene, c[0] * (A + .9), 6, c[1] * (A + .9), 2.6, 12, 2.6, true);
    M(GEO.box, rust, scene, c[0] * (A + .9), 12.2, c[1] * (A + .9), .2, 1.6, .2);
  });
  // chain-link fence on west wall
  const fence = new THREE.Mesh(new THREE.PlaneGeometry(24, 2.8), fenceMat);
  fence.position.set(-(A + .2), 6.2, -6); fence.rotation.y = PI / 2; scene.add(fence);
  const fence2 = fence.clone(); fence2.position.set(-(A + .2), 4.4, 14); fence2.scale.y = .7; scene.add(fence2);

  /* ---- floodlight tower ---- */
  const metal = mat(0x2b3036, { metalness: .7, roughness: .45 });
  const fx = -A + 2.5, fz = -A + 2.5;
  M(GEO.cyl, metal, scene, fx, 6.5, fz, .22, 13, .22, true);
  M(GEO.box, metal, scene, fx, 13.2, fz, 3.4, 1.5, .5, true).lookAt(4, 8, 4);
  const lampM = glowMat(0x777777, 0xfff4d8, 4);
  const lamp = new THREE.Group(); lamp.position.set(fx, 13.2, fz); scene.add(lamp); lamp.lookAt(4, 5, 4);
  [[-.75, .35], [.75, .35], [-.75, -.35], [.75, -.35]].forEach(o => { M(GEO.box, lampM, lamp, o[0], o[1], .3, .6, .5, .06); });
  const lg = glowSprite(0xe8ffe8, 7, .75); lg.position.set(fx, 13.2, fz); scene.add(lg);
  const coneLen = Math.hypot(4 - fx, 0 - 13.2, 4 - fz);
  const cg = new THREE.ConeGeometry(11, coneLen, 28, 1, true); cg.translate(0, -coneLen / 2, 0); cg.rotateX(-PI / 2);
  const cone = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: .045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  cone.position.set(fx, 13.2, fz); cone.lookAt(4, 0, 4); scene.add(cone);

  /* ---- background ruins ---- */
  const bgMat = mat(0x0c121a, { roughness: 1 });
  const winM = new THREE.MeshBasicMaterial({ color: 0xffa84a });
  const NB = MOBILE ? 20 : 38;
  for (let i = 0; i < NB; i++) {
    const a = (i / NB) * TAU + rand(-.08, .08), d = rand(52, 120);
    const w = rand(6, 16), h = rand(12, 44), dd = rand(6, 16);
    const b = M(GEO.box, bgMat, scene, Math.cos(a) * d, h / 2 - 1, Math.sin(a) * d, w, h, dd);
    b.rotation.y = rand(0, PI); b.rotation.z = rand(-.05, .05);
    if (Math.random() < .45) { const t = M(GEO.box, bgMat, scene, b.position.x + rand(-2, 2), h + 2, b.position.z, w * .5, rand(3, 9), dd * .5); t.rotation.y = b.rotation.y; t.rotation.z = rand(-.3, .3); }
    if (Math.random() < .3) { const wn = M(GEO.box, winM, scene, b.position.x, rand(5, h - 3), b.position.z, .8, 1.1, .8); wn.lookAt(0, wn.position.y, 0); wn.translateZ(Math.min(w, dd) * .5 + .1); }
  }

  /* ---- props ---- */
  const crateTex = TEX.crate(), crateMat = new THREE.MeshStandardMaterial({ map: crateTex, roughness: .9 });
  [[-13, -9], [15, -12], [-17, 13], [21, 9], [8, 19], [-4, -21], [24, -3]].forEach(c => {
    const g = new THREE.Group(); g.position.set(c[0], 0, c[1]); g.rotation.y = rand(0, PI); scene.add(g);
    const s = rand(1.5, 1.9); M(GEO.box, crateMat, g, 0, s / 2, 0, s, s, s, true).receiveShadow = true;
    if (Math.random() < .7) { const s2 = s * .75; M(GEO.box, crateMat, g, rand(-.2, .2), s + s2 / 2, rand(-.2, .2), s2, s2, s2, true).rotation.y = rand(-.4, .4); }
    addCollider(c[0], c[1], 1.05, 'crate', g);
  });
  const barrierMat = mat(0x8e949b, { roughness: .9 });
  [[0, -15, 0], [-9, 12, .4], [11, 5, -.7], [-20, -3, PI / 2], [19, -6, 1.4], [3, 13, .1]].forEach(b => {
    const g = new THREE.Group(); g.position.set(b[0], 0, b[1]); g.rotation.y = b[2]; scene.add(g);
    M(GEO.box, barrierMat, g, 0, .27, 0, 3.4, .55, .85, true).receiveShadow = true;
    M(GEO.box, barrierMat, g, 0, .8, 0, 3.4, .55, .5, true);
    M(GEO.box, mat(0xc8a21e), g, 0, .72, .26, 3.0, .12, .02);
    for (let k = -1; k <= 1; k++) addCollider(b[0] + Math.cos(b[2]) * k * 1.15, b[1] - Math.sin(b[2]) * k * 1.15, .75, 'barrier', g);
  });
  const carBody = mat(0x5b3a2b, { roughness: .6, metalness: .45 }), carGlass = mat(0x0b1015, { roughness: .1, metalness: .8 }), tyre = mat(0x101113, { roughness: .9 });
  [[-19, -15, .7], [16, 20, -.4]].forEach(c => {
    const g = new THREE.Group(); g.position.set(c[0], 0, c[1]); g.rotation.y = c[2]; g.rotation.z = .03; scene.add(g);
    M(GEO.box, carBody, g, 0, .75, 0, 4.4, .75, 1.95, true);
    M(GEO.box, carBody, g, -.2, 1.35, 0, 2.3, .6, 1.75, true);
    M(GEO.box, carGlass, g, -.2, 1.38, 0, 2.2, .45, 1.8);
    M(GEO.box, rust, g, 1.9, 1.1, .4, .6, .1, .8).rotation.z = -.5;
    [[1.4, .85], [-1.4, .85], [1.4, -.85], [-1.4, -.85]].forEach(w => { const wh = M(GEO.cyl, tyre, g, w[0], .4, w[1], .42, .3, .42, true); wh.rotation.x = PI / 2; });
    for (let k = -1; k <= 1; k++) addCollider(c[0] + Math.cos(c[2]) * k * 1.5, c[1] - Math.sin(c[2]) * k * 1.5, 1.15, 'car', g);
  });
  // burning barrels (decor + light)
  [[-10, -16, 'fire1'], [22, -19, 'fire2']].forEach(f => {
    const b = buildBarrel(false); b.position.set(f[0], 0, f[1]); scene.add(b);
    addCollider(f[0], f[1], .6, 'barrel', b);
    world.fires.push({ x: f[0], z: f[1], light: world.lights[f[2]], t: rand(0, 6) });
    world.lights[f[2]].position.set(f[0], 1.8, f[1]);
  });
  // rubble
  const rubM = mat(0x555b62, { roughness: .95 });
  for (let i = 0; i < (MOBILE ? 30 : 70); i++) {
    const a = rand(0, TAU), d = rand(4, 29);
    const r = M(GEO.box, rubM, scene, Math.cos(a) * d, rand(.05, .2), Math.sin(a) * d, rand(.15, .6), rand(.1, .35), rand(.15, .6));
    r.rotation.set(rand(0, 1), rand(0, PI), rand(0, 1)); r.castShadow = Math.random() < .3;
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
function freeSpot(minPlayerDist, r, px, pz) {
  for (let t = 0; t < 30; t++) {
    const x = rand(-PLAY + 2, PLAY - 2), z = rand(-PLAY + 2, PLAY - 2);
    if (Math.hypot(x - px, z - pz) < minPlayerDist) continue;
    let ok = true;
    for (const o of obstacles) if (Math.hypot(x - o.x, z - o.z) < o.r + r + .3) { ok = false; break; }
    if (ok) return { x, z };
  }
  return { x: rand(-10, 10), z: rand(-10, 10) };
}
function scorchMark(x, z, r) {
  const s = world.scorches.reduce((a, b) => (a.t < b.t ? a : b));
  s.t = 1; s.m.visible = true; s.m.position.x = x; s.m.position.z = z; s.m.scale.set(r * 2, 1, r * 2); s.m.rotation.y = rand(0, TAU);
}
function updateWorld(dt, t, cam, pp) {
  world.sky.position.copy(cam.position);
  world.moon.position.copy(cam.position).addScaledVector(world.moonDir, 250);
  const L = world.lights;
  L.moon.position.set(pp.x - 22, 42, pp.z - 14); L.moon.target.position.set(pp.x, 0, pp.z); L.moon.target.updateMatrixWorld();
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
