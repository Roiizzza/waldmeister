import * as T from './vendor/three.js';
import { raster } from './raster.js';
import { SPAN, DISPATCH, HALLS, BUILDINGS, PAINTS } from './data.mjs';

const clamp = T.MathUtils.clamp;
const damp = T.MathUtils.damp;

const isSoftwareGl = (() => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

export function world(container) {
  const scene = new T.Scene();
  scene.background = new T.Color(0xcbd6ca);
  scene.fog = new T.FogExp2(0xd4d8ce, 0.015);

  let renderer;
  let useWebGL = true;
  try {
    renderer = new T.WebGLRenderer({ antialias: !isSoftwareGl, powerPreference: 'high-performance' });
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
  } catch {
    renderer = raster();
    useWebGL = false;
  }
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(devicePixelRatio, 1.75));
  if (useWebGL) {
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
  }
  container.append(renderer.domElement);

  const cam = new T.PerspectiveCamera(57, 1, 0.08, 360);
  cam.rotation.order = 'YXZ';

  // Warm/Cool Studio & Outdoor Daylight Rig
  const sun = new T.DirectionalLight(0xfff1da, 2.35);
  sun.position.set(-28, 48, 22);
  sun.target.position.set(10, 0, 0);
  const hemi = new T.HemisphereLight(0xeef8ff, 0x8d8573, 1.85);
  const rim = new T.DirectionalLight(0xbcd8eb, 0.65);
  rim.position.set(45, 22, -32);
  scene.add(sun, sun.target, hemi, rim);

  if (useWebGL && !isSoftwareGl) {
    sun.castShadow = true;
    Object.assign(sun.shadow.camera, { left: -65, right: 65, top: 65, bottom: -65, near: 1, far: 160 });
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.normalBias = 0.02;
    sun.shadow.bias = -0.0003;
  }

  // Shared Geometries & Material Cache
  const coal = 0x2b3534;
  const steel = 0x566765;
  const al = 0xa3b0a8;
  const silver = 0xc4ccc1;
  const orange = 0xe36a2c;
  const yellow = 0xe4a743;
  const green = 0x83998f;
  const wall = 0xd8d8c9;

  const geos = {
    box: new T.BoxGeometry(1, 1, 1),
    cyl: new T.CylinderGeometry(0.5, 0.5, 1, 18),
    bolt: new T.CylinderGeometry(0.5, 0.5, 1, 6),
    cone: new T.ConeGeometry(0.5, 1, 8)
  };
  const mats = new Map();
  function getMat(color, metal = 0, rough = null, emissive = 0) {
    const r = rough !== null ? rough : (metal > 0.2 ? 0.38 : 0.78);
    const key = color + '/' + metal + '/' + r + '/' + emissive;
    let m = mats.get(key);
    if (!m) {
      m = new T.MeshStandardMaterial({
        color,
        metalness: metal,
        roughness: r,
        emissive: emissive ? new T.Color(emissive) : new T.Color(0x000000),
        emissiveIntensity: emissive ? 0.9 : 0
      });
      mats.set(key, m);
    }
    return m;
  }

  const paintMats = Object.fromEntries(
    PAINTS.map(p => [
      p.id,
      new T.MeshStandardMaterial({ color: p.num, metalness: 0.38, roughness: 0.32 })
    ])
  );

  function grp(p = scene, x = 0, y = 0, z = 0) {
    const g = new T.Group();
    p.add(g);
    g.position.set(x, y, z);
    return g;
  }

  // Batch helper for static geometry
  function createBatcher() {
    const batches = new Map();
    const tmpObj = new T.Object3D();
    function shape(p, type, color, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0, metal = 0, rough = null, emissive = 0) {
      const m = getMat(color, metal, rough, emissive);
      const key = p.id + '/' + type + '/' + m.uuid;
      let set = batches.get(key);
      if (!set) {
        set = { p, g: geos[type], m, ls: [] };
        batches.set(key, set);
      }
      tmpObj.position.set(x, y, z);
      tmpObj.scale.set(w, h, d);
      tmpObj.rotation.set(rx, ry, rz);
      tmpObj.updateMatrix();
      set.ls.push(tmpObj.matrix.clone());
    }
    const box = (p, c, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0, m = 0, r = null, em = 0) =>
      shape(p, 'box', c, x, y, z, w, h, d, rx, ry, rz, m, r, em);
    const cyl = (p, c, x, y, z, d, h, rx = 0, rz = 0, m = 0.27, type = 'cyl', r = null, em = 0) =>
      shape(p, type, c, x, y, z, d, h, d, rx, 0, rz, m, r, em);
    const cone = (p, c, x, y, z, d, h, m = 0) =>
      shape(p, 'cone', c, x, y, z, d, h, d, 0, 0, 0, m, 0.85, 0);
    function rod(p, c, a, b, d, m = 0.28) {
      const A = new T.Vector3(...a);
      const v = new T.Vector3(...b).sub(A);
      const mid = A.addScaledVector(v, 0.5);
      const rot = new T.Euler().setFromQuaternion(
        new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), v.clone().normalize())
      );
      shape(p, 'cyl', c, mid.x, mid.y, mid.z, d, v.length(), d, rot.x, rot.y, rot.z, m);
    }
    function flush() {
      for (const { p, g, m, ls } of batches.values()) {
        const mesh = new T.InstancedMesh(g, m, ls.length);
        ls.forEach((mat, idx) => mesh.setMatrixAt(idx, mat));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.computeBoundingSphere();
        p.add(mesh);
      }
      batches.clear();
    }
    return { box, cyl, cone, rod, flush };
  }

  function makeMesh(p, type, mat, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0) {
    const m = new T.Mesh(geos[type], mat);
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    m.receiveShadow = true;
    p.add(m);
    return m;
  }

  function makeSignTexture(txt, sub, w, h, bg = '#2b3835', fg = '#fff4de', accent = null) {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = Math.max(100, Math.round(640 * h / w));
    const a = c.getContext('2d');
    a.fillStyle = bg;
    a.fillRect(0, 0, c.width, c.height);
    if (accent) {
      a.fillStyle = accent;
      a.fillRect(0, 0, 18, c.height);
    }
    a.fillStyle = fg;
    a.textBaseline = 'middle';
    a.font = 'bold ' + Math.round(c.height * (sub ? 0.48 : 0.62)) + 'px Arial, sans-serif';
    a.fillText(txt, accent ? 38 : 28, c.height * (sub ? 0.38 : 0.52), 575);
    if (sub) {
      a.font = 'bold ' + Math.round(c.height * 0.17) + 'px monospace';
      a.fillStyle = '#c8d6cd';
      a.fillText(sub, accent ? 40 : 30, c.height * 0.80, 565);
    }
    const map = new T.CanvasTexture(c);
    map.colorSpace = T.SRGBColorSpace;
    if (useWebGL && renderer.capabilities) {
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }
    return map;
  }

  function addSign(p, txt, sub, x, y, z, w, h, bg = '#2b3835', fg = '#fff4de', accent = null) {
    const map = makeSignTexture(txt, sub, w, h, bg, fg, accent);
    const mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map }));
    mesh.position.set(x, y, z);
    p.add(mesh);
    return mesh;
  }

  // =========================================================================
  // 1. ASSEMBLY HALL INTERIOR (Mode: 'hall')
  // =========================================================================
  const hallRoot = grp(scene);
  const hb = createBatcher();
  const hall = grp(hallRoot);

  // Floor & expansion joints
  hb.box(hall, 0x96a095, 52, -0.12, 0, 148, 0.24, 24, 0, 0, 0, 0, 0.88);
  for (let x = -20; x < 128; x += 4) {
    hb.box(hall, 0x80887e, x, 0.005, 0, 0.02, 0.005, 24);
    for (const z of [-8, -4, 4, 8]) hb.box(hall, 0x818c81, x + 2, 0.005, z, 3.98, 0.006, 0.02);
  }
  for (const z of [-2.3, 2.05, 4.92]) hb.box(hall, z > 4 ? wall : yellow, 52, 0.01, z, 144, 0.01, 0.08);
  for (let x = -20; x < 126; x += 0.53) hb.box(hall, 0xd4a347, x, 0.012, 2.24, 0.16, 0.012, 0.37, 0, -0.45);

  // Back wall, roof & trusses
  hb.box(hall, wall, 52, 3.55, -7.7, 148, 7.1, 0.25);
  hb.box(hall, 0x8da499, 52, 1, -7.49, 148, 2, 0.18);
  hb.box(hall, 0xbfc5ba, 52, 7.6, 0, 148, 0.15, 22);
  for (let x = -20; x < 129; x += 4) {
    hb.box(hall, steel, x + 1.92, 4.53, -7.43, 3.8, 3.32, 0.16, 0, 0, 0, 0.3);
    for (const q of [0.96, 2.87]) {
      for (const h of [3.8, 5.27]) hb.box(hall, h > 4 ? 0xe4efe6 : 0xc0d6cc, x + q, h, -7.29, 1.78, 1.36, 0.05, 0, 0, 0, 0.05, 0.25);
    }
    for (const z of [-6.85, 7.5]) {
      hb.box(hall, steel, x, 3.75, z, 0.24, 7.5, 0.31, 0, 0, 0, 0.35);
      hb.box(hall, coal, x, 3.75, z + 0.16, 0.34, 7.5, 0.05);
      hb.box(hall, yellow, x, 0.63, z, 0.41, 1.26, 0.42);
      hb.box(hall, coal, x, 0.22, z, 0.43, 0.15, 0.43);
    }
    hb.box(hall, steel, x, 6.93, 0.4, 0.18, 0.18, 14.6, 0, 0, 0, 0.35);
    hb.box(hall, steel, x, 7.47, 0.4, 0.15, 0.12, 14.6, 0, 0, 0, 0.35);
    for (let z = -6.6; z < 7; z += 1.5) hb.rod(hall, green, [x, 6.95, z], [x, 7.45, z + 0.85], 0.08);
    for (const z of [-3.6, 3.6]) {
      hb.box(hall, steel, x + 1.7, 6.6, z, 2.8, 0.14, 0.35);
      hb.box(hall, 0xfffbe2, x + 1.7, 6.51, z, 2.69, 0.045, 0.29, 0, 0, 0, 0, 0.4, 0xfff6cf);
    }
  }
  for (const z of [-5.9, -5.64, -5.37]) hb.rod(hall, z < -5.8 ? 0xa5754f : al, [-22, 5.85, z], [123, 5.85, z], 0.14);
  for (let x = -16; x < 129; x += 9) {
    hb.box(hall, orange, x, 5.8, 0, 0.42, 0.45, 13, 0, 0, 0, 0.25);
    hb.box(hall, yellow, x + 0.22, 5.61, 0, 0.06, 0.12, 12.9);
    hb.box(hall, coal, x, 5.42, -0.4, 0.78, 0.33, 0.84);
    for (const q of [-0.13, 0.13]) hb.rod(hall, coal, [x + q, 5.4, -0.4], [x + q, 4.9, -0.4], 0.035);
    hb.box(hall, yellow, x, 4.86, -0.4, 0.42, 0.16, 0.18);
  }
  for (let x = -19; x < 125; x += 8) {
    for (let j = 0; j < 3; j++) {
      const xx = x + j * 0.92;
      hb.box(hall, j ? 0xa4b1a6 : green, xx, 1.05, -6.7, 0.88, 2.08, 0.78);
      hb.box(hall, coal, xx + 0.29, 0.98, -6.29, 0.035, 0.23, 0.035);
      for (let k = 0; k < 4; k++) hb.box(hall, steel, xx, 1.68 + k * 0.068, -6.295, 0.43, 0.018, 0.015);
    }
    for (const y of [0.22, 0.86, 1.5]) {
      hb.box(hall, orange, x + 4.4, y, -5.7, 2.95, 0.1, 1.04);
      for (let j = -1; j <= 1; j++) {
        hb.box(hall, j === 0 ? green : 0x708983, x + 4.4 + j * 0.86, y + 0.24, -5.7, 0.75, 0.39, 0.79);
        hb.box(hall, wall, x + 4.4 + j * 0.86, y + 0.25, -5.294, 0.28, 0.1, 0.014);
      }
    }
    for (const q of [-1.5, 1.5]) for (const z of [-6.24, -5.16]) hb.box(hall, steel, x + 4.4 + q, 1, z, 0.08, 2, 0.08);
    for (const q of [0, 3.3]) hb.cyl(hall, yellow, x + q, 0.48, -3.33, 0.13, 0.97);
    for (const y of [0.48, 0.9]) hb.rod(hall, yellow, [x, y, -3.33], [x + 3.3, y, -3.33], 0.075);
  }

  // Conveyor line
  hb.box(hall, coal, 52, 0.70, 0, 136, 0.19, 2.5, 0, 0, 0, 0.35);
  for (let x = -21; x < 125; x += 0.29) hb.cyl(hall, Math.round(x * 10) % 3 ? al : 0x94a49d, x, 0.858, 0, 0.18, 2.45, Math.PI / 2, 0, 0.45);
  for (const z of [-1.26, 1.26]) {
    hb.box(hall, coal, 52, 0.74, z, 136, 0.33, 0.14);
    hb.box(hall, al, 52, 0.921, z, 136, 0.045, 0.16, 0, 0, 0, 0.4);
    hb.box(hall, orange, 52, 0.74, z + Math.sign(z) * 0.081, 136, 0.10, 0.025);
  }
  for (let x = -20; x < 125; x += 2.2) {
    for (const z of [-1, 1]) {
      hb.box(hall, steel, x, 0.38, z, 0.17, 0.73, 0.21, 0, 0, 0, 0.35);
      hb.box(hall, coal, x, 0.055, z, 0.4, 0.11, 0.39);
      hb.cyl(hall, silver, x, 0.8, z * 1.35, 0.065, 0.027, Math.PI / 2, 0, 0.4, 'bolt');
    }
    hb.box(hall, steel, x, 0.28, 0, 0.12, 0.12, 2.14);
  }

  // Dispatch Gate (open bay so finished cars roll visibly outside!)
  for (const z of [-6, 6]) hb.box(hall, wall, DISPATCH - 3, 3.5, z, 0.3, 7, 8);
  hb.box(hall, wall, DISPATCH - 3, 5.45, 0, 0.3, 3.1, 4.1);
  for (const z of [-1.95, 1.95]) hb.box(hall, steel, DISPATCH - 0.5, 2.53, z, 5, 3.2, 0.15, 0, 0, 0, 0.35);
  hb.box(hall, steel, DISPATCH - 0.5, 4.06, 0, 5, 0.15, 4.0);
  // Outdoor apron visible through dispatch gate
  hb.box(hall, 0x6f7872, DISPATCH + 11, -0.1, 0, 24, 0.2, 16, 0, 0, 0, 0, 0.9);
  hb.box(hall, yellow, DISPATCH + 11, 0.02, -1.5, 22, 0.02, 0.12);
  hb.box(hall, yellow, DISPATCH + 11, 0.02, 1.5, 22, 0.02, 0.12);
  addSign(hall, 'VERSAND', 'FAHRZEUGAUSLIEFERUNG', DISPATCH - 2, 3.05, -2.5, 3.6, 0.85, '#1c2824', '#fff5dc', '#ff813e');

  for (let i = 1; i < 4; i++) {
    const xx = i * SPAN - 6;
    addSign(hall, 'PUFFER 0' + i, 'ERSATZTEILVERLADUNG', xx, 2.6, -4.4, 3.1, 0.68);
    for (const side of [-1, 1]) hb.box(hall, yellow, xx + side * 1.27, 0.03, -4.5, 0.09, 0.035, 6.4);
  }

  // Dynamic Hall Header Sign & Station Signs + Traffic Lights (Ampeln)
  const hallHeaderSign = addSign(hall, 'WERK I · V8-KLASSIKER', 'TAKTWERK INDUSTRIESTADT', -0.5, 2.15, -7.28, 6.4, 0.95, '#1b2622', '#fff4de', '#ff813e');
  const stationSigns = [];
  const stationLamps = [];
  const arms = [];
  const workers = [];

  for (let i = 0; i < 4; i++) {
    const x = i * SPAN;
    const p = grp(hall, x);
    hb.box(p, steel, 1.7, 1.95, -2.24, 0.13, 3.9, 0.14, 0, 0, 0, 0.35);
    hb.box(p, coal, 0.96, 3.76, -2.24, 1.56, 0.10, 0.14);
    const stSign = addSign(p, '0' + (i + 1), HALLS[0].specs[i].name.toUpperCase(), 0.95, 3.26, -2.14, 1.76, 0.88);
    stationSigns.push(stSign);
    hb.box(p, orange, 0.07, 3.26, -2.1, 0.07, 0.88, 0.04);

    // Control pedestal
    hb.box(p, green, -2, 0.61, -1.94, 0.66, 1.18, 0.56);
    hb.box(p, coal, -2, 1.42, -1.9, 0.77, 0.52, 0.23);
    addSign(p, 'TW / 0' + (i + 1), '', -2, 1.43, -1.77, 0.6, 0.27, '#243b36', '#a1d5a7');

    // Interactive 3-color Ampel (Green / Yellow / Red)
    const lampMats = [
      new T.MeshStandardMaterial({ color: 0x3ba85f, emissive: 0x26b557, emissiveIntensity: 0.1, roughness: 0.3 }),
      new T.MeshStandardMaterial({ color: 0xe4a743, emissive: 0xf2a727, emissiveIntensity: 0.1, roughness: 0.3 }),
      new T.MeshStandardMaterial({ color: 0xd9483b, emissive: 0xef3e2c, emissiveIntensity: 0.1, roughness: 0.3 })
    ];
    for (let j = 0; j < 3; j++) {
      const bulb = new T.Mesh(geos.cyl, lampMats[j]);
      bulb.position.set(-2.23, 1.78 + j * 0.105, -1.89);
      bulb.scale.set(0.11, 0.09, 0.11);
      p.add(bulb);
    }
    stationLamps.push(lampMats);

    // 2-Link IK Robot Arm
    const arm = grp(hallRoot, x + 1.17, 0, -2.03);
    hb.box(arm, coal, 0, 0.09, 0, 1.08, 0.18, 1.04);
    hb.cyl(arm, orange, 0, 0.43, 0, 0.68, 0.64);
    const swivel = grp(arm, 0, 0.8);
    hb.cyl(swivel, coal, 0, 0.02, 0, 0.61, 0.14);
    const shoulder = grp(swivel, 0, 0.11);
    const elbow = grp(shoulder, 0, 1.74);
    for (const [g, len, w] of [[shoulder, 1.74, 0.29], [elbow, 1.64, 0.22]]) {
      hb.box(g, orange, 0, len * 0.5, 0, w, len, w, 0, 0, 0, 0.25);
      hb.rod(g, al, [w * 0.62, 0.1, 0], [w * 0.62, len - 0.1, 0], 0.055);
      hb.cyl(g, coal, 0, 0, 0, 0.42, 0.4, 0, Math.PI / 2);
      hb.cyl(g, al, -0.22, 0, 0, 0.24, 0.04, 0, Math.PI / 2);
    }
    hb.cyl(elbow, coal, 0, 1.64, 0, 0.23, 0.16);
    for (const s of [-1, 1]) hb.box(elbow, steel, s * 0.085, 1.78, 0, 0.055, 0.21, 0.065);
    arms.push({ arm, swivel, shoulder, elbow });
    arm.visible = false;

    // Worker figure
    const wg = grp(hallRoot, x - 0.38, 0, -1.68);
    for (const wx of [-0.16, 0.16]) {
      hb.box(wg, coal, wx, 0.42, 0, 0.23, 0.75, 0.26);
      hb.box(wg, steel, wx, 0.10, 0.06, 0.26, 0.2, 0.37);
    }
    hb.box(wg, 0x335859, 0, 1.05, 0, 0.62, 0.68, 0.34);
    hb.box(wg, yellow, 0, 1.05, 0.18, 0.6, 0.09, 0.04);
    hb.cyl(wg, 0xb98261, 0, 1.59, 0, 0.34, 0.34);
    hb.cyl(wg, yellow, 0, 1.79, 0, 0.42, 0.16);
    hb.box(wg, yellow, 0, 1.74, 0.12, 0.45, 0.055, 0.32);
    const hand = grp(wg, -0.26, 1.32, 0.05);
    hb.rod(hand, 0x335859, [0, 0, 0], [-0.15, -0.19, 0.23], 0.19);
    hb.rod(hand, 0xb98261, [-0.15, -0.19, 0.23], [0, -0.14, 0.48], 0.14);
    hb.rod(wg, 0x335859, [0.27, 1.33, 0], [0.44, 0.97, 0.15], 0.19);
    workers.push({ g: wg, hand });
  }

  // Interactive tool, weld sparks & bolt targets
  const arc = grp(hallRoot);
  for (let k = 0; k < 10; k++) {
    const a = k * 0.628;
    hb.rod(arc, k % 2 ? 0xffae43 : 0xfff8cc, [0, 0, 0], [Math.cos(a) * 0.18, 0.08 + (k % 3) * 0.08, Math.sin(a) * 0.16], 0.018);
  }
  arc.visible = false;

  const tool = grp(hallRoot);
  hb.cyl(tool, silver, 0, 0.09, 0, 0.067, 0.18, 0, 0, 0.5);
  hb.cyl(tool, coal, 0, 0.22, 0, 0.14, 0.13);
  hb.box(tool, orange, 0, 0.39, 0, 0.2, 0.29, 0.26);
  hb.box(tool, coal, 0, 0.39, 0.19, 0.14, 0.15, 0.21);
  hb.box(tool, steel, 0, 0.39, 0.31, 0.2, 0.2, 0.1);
  tool.visible = false;

  // Dynamic targets container (rebuilt when active hall switches)
  const targetPool = grp(hallRoot);
  let targetGroups = [];
  let dragModels = [];

  hb.flush();

  // ---- Multi-Vehicle Procedural Template Factory (5 distinct vehicles!) ----
  function buildPalletBase(p) {
    makeMesh(p, 'box', getMat(0x726d5d, 0, 0.85), 0, 0.045, 0, 3.1, 0.09, 2.0);
    makeMesh(p, 'box', getMat(al, 0.35, 0.5), 0, 0.111, 0, 2.98, 0.045, 1.9);
    for (const z of [-0.74, 0.74]) {
      makeMesh(p, 'box', getMat(coal, 0.2), 0, 0.17, z, 2.66, 0.1, 0.14);
    }
  }

  function buildEngineModel(p, layers, style) {
    const isElectric = style === 'elektro' || style === 'stadtbus';
    const scaleX = style === 'lkw' || style === 'stadtbus' ? 1.15 : 1;
    makeMesh(p, 'box', getMat(coal, 0.3), 0, 0.16, 0, 1.8 * scaleX, 0.22, 0.74);
    makeMesh(p, 'box', getMat(isElectric ? 0x3b4d54 : steel, 0.45, 0.4), 0, 0.42, 0, 1.94 * scaleX, 0.42, 0.84);
    if (isElectric) {
      // Electric HV drive housing + glowing cyan inverter busbars
      makeMesh(p, 'cyl', getMat(al, 0.5, 0.3), 0, 0.55, 0, 0.72, 1.55 * scaleX, 0.72, 0, 0, Math.PI / 2);
      makeMesh(layers[0], 'box', getMat(0x28363c, 0.3), 0, 0.96, 0, 1.55, 0.22, 0.62);
      makeMesh(layers[0], 'box', getMat(0x45d6f5, 0.2, 0.25, 0x26b9e0), 0, 1.08, 0, 1.32, 0.05, 0.22);
      makeMesh(layers[1], 'box', getMat(orange, 0.2, 0.4), 0, 1.15, 0, 1.48, 0.07, 0.36);
    } else {
      for (const s of [-1, 1]) {
        const bank = grp(p, 0, 0.36, s * 0.26);
        bank.rotation.x = s * 0.54;
        makeMesh(bank, 'box', getMat(0x84948e, 0.35), 0, 0.24, 0, 2.0 * scaleX, 0.44, 0.43);
        makeMesh(bank, 'box', getMat(coal, 0.2), 0, 0.48, 0, 2.05 * scaleX, 0.12, 0.48);
        makeMesh(bank, 'box', getMat(style === 'lkw' ? 0x993e2e : 0x627674, 0.36), 0, 0.59, 0, 1.95 * scaleX, 0.16, 0.44);
      }
      makeMesh(layers[0], 'box', getMat(steel, 0.45), 0, 1.02, 0, 1.69 * scaleX, 0.18, 0.38);
      makeMesh(layers[1], 'box', getMat(al, 0.5), 0, 1.15, 0, 1.6 * scaleX, 0.07, 0.33);
    }
    makeMesh(p, 'cyl', getMat(orange, 0.2), 0.59, 1.0, 0.51, 0.16, 0.09, 0.16);
  }

  function buildWheelMesh(p, x, z, r = 0.37) {
    makeMesh(p, 'cyl', getMat(0x1f2526, 0.05, 0.9), x, r, z, 2 * r, 0.26, 2 * r, Math.PI / 2, 0, 0);
    makeMesh(p, 'cyl', getMat(steel, 0.5, 0.35), x, r, z + Math.sign(z) * 0.145, 1.42 * r, 0.04, 1.42 * r, Math.PI / 2, 0, 0);
    makeMesh(p, 'cyl', getMat(silver, 0.65, 0.25), x, r, z + Math.sign(z) * 0.17, 0.56 * r, 0.05, 0.56 * r, Math.PI / 2, 0, 0);
  }

  function tagPaint(mesh) {
    mesh.userData.paintable = true;
    return mesh;
  }

  function buildVehicleBody(p, style, paintMat) {
    const glassMat = getMat(0x3b5458, 0.25, 0.18);
    const lampMat = getMat(0xfff6d2, 0.1, 0.2, 0xffe49c);
    const tailMat = getMat(0xd94132, 0.1, 0.3, 0xb8291d);
    const darkMat = getMat(coal, 0.25, 0.65);

    if (style === 'transporter') {
      // High-roof cargo van
      tagPaint(makeMesh(p, 'box', paintMat, 0.1, 0.42, 0, 3.05, 0.52, 1.56));
      tagPaint(makeMesh(p, 'box', paintMat, 0.48, 1.05, 0, 2.28, 0.86, 1.52));
      tagPaint(makeMesh(p, 'box', paintMat, -0.92, 0.82, 0, 0.85, 0.44, 1.48));
      makeMesh(p, 'box', glassMat, -0.78, 1.02, 0, 0.66, 0.46, 1.38);
      makeMesh(p, 'box', darkMat, 0.45, 1.52, 0, 2.0, 0.06, 1.3);
      for (const s of [-1, 1]) {
        makeMesh(p, 'box', lampMat, -1.43, 0.48, s * 0.52, 0.06, 0.18, 0.32);
        makeMesh(p, 'box', tailMat, 1.63, 0.52, s * 0.56, 0.05, 0.28, 0.22);
      }
      return;
    }
    if (style === 'elektro') {
      // Sleek aero sports coupe with rear spoiler & LED bar
      tagPaint(makeMesh(p, 'box', paintMat, 0, 0.32, 0, 3.05, 0.36, 1.54));
      tagPaint(makeMesh(p, 'box', paintMat, 0.12, 0.56, 0, 1.95, 0.22, 1.44));
      makeMesh(p, 'box', glassMat, 0.16, 0.80, 0, 1.45, 0.34, 1.24);
      tagPaint(makeMesh(p, 'box', paintMat, 0.22, 1.01, 0, 1.22, 0.08, 1.28));
      // Spoiler & HV side strip
      makeMesh(p, 'box', darkMat, 1.38, 0.72, 0, 0.24, 0.06, 1.46);
      for (const s of [-1, 1]) {
        makeMesh(p, 'box', darkMat, 1.34, 0.58, s * 0.46, 0.06, 0.26, 0.06);
        makeMesh(p, 'box', getMat(0x3ad6f2, 0.2, 0.2, 0x26b7d8), 0, 0.16, s * 0.78, 1.9, 0.05, 0.04);
      }
      makeMesh(p, 'box', lampMat, -1.53, 0.38, 0, 0.05, 0.09, 1.32);
      makeMesh(p, 'box', tailMat, 1.53, 0.44, 0, 0.05, 0.08, 1.32);
      return;
    }
    if (style === 'lkw') {
      // Heavy 3-axle cab-over truck with flatbed & chrome stacks
      tagPaint(makeMesh(p, 'box', paintMat, -0.92, 0.96, 0, 1.16, 1.26, 1.62));
      makeMesh(p, 'box', glassMat, -1.04, 1.18, 0, 0.98, 0.46, 1.52);
      makeMesh(p, 'box', darkMat, -1.51, 0.62, 0, 0.06, 0.42, 1.32);
      // Flatbed cargo frame
      makeMesh(p, 'box', getMat(0x5a6562, 0.4, 0.55), 0.58, 0.52, 0, 1.96, 0.22, 1.64);
      tagPaint(makeMesh(p, 'box', paintMat, 0.58, 0.84, 0, 1.92, 0.44, 1.58));
      // Chrome exhaust stacks
      for (const s of [-1, 1]) {
        makeMesh(p, 'cyl', getMat(silver, 0.75, 0.22), -0.32, 1.18, s * 0.84, 0.11, 1.25, 0.11);
        makeMesh(p, 'box', lampMat, -1.52, 0.44, s * 0.58, 0.06, 0.16, 0.28);
        makeMesh(p, 'box', tailMat, 1.58, 0.50, s * 0.60, 0.05, 0.18, 0.24);
      }
      return;
    }
    if (style === 'stadtbus') {
      // Long panoramic e-city bus with rooftop battery pods
      tagPaint(makeMesh(p, 'box', paintMat, 0, 0.52, 0, 3.32, 0.66, 1.62));
      makeMesh(p, 'box', glassMat, 0, 1.10, 0, 3.24, 0.56, 1.58);
      tagPaint(makeMesh(p, 'box', paintMat, 0, 1.46, 0, 3.30, 0.18, 1.62));
      // Roof battery modules
      makeMesh(p, 'box', getMat(0xdce2de, 0.25, 0.45), -0.35, 1.64, 0, 1.75, 0.18, 1.16);
      makeMesh(p, 'box', getMat(0x3ad6f2, 0.2, 0.3, 0x22a8cc), -0.35, 1.66, 0, 1.5, 0.06, 1.2);
      // Destination LED display
      makeMesh(p, 'box', getMat(0xffa63d, 0.1, 0.3, 0xf28729), -1.66, 1.38, 0, 0.04, 0.16, 0.92);
      for (const s of [-1, 1]) {
        makeMesh(p, 'box', lampMat, -1.67, 0.44, s * 0.56, 0.05, 0.14, 0.28);
        makeMesh(p, 'box', tailMat, 1.67, 0.48, s * 0.56, 0.05, 0.22, 0.22);
      }
      return;
    }
    // Default: 'kompakt' V8-Klassiker
    tagPaint(makeMesh(p, 'box', paintMat, 0, 0.36, 0, 2.88, 0.45, 1.46));
    tagPaint(makeMesh(p, 'box', paintMat, 0.24, 0.68, 0, 1.66, 0.25, 1.4));
    makeMesh(p, 'box', glassMat, 0.21, 0.94, 0, 1.37, 0.41, 1.23);
    tagPaint(makeMesh(p, 'box', paintMat, 0.22, 1.18, 0, 1.49, 0.1, 1.34));
    for (const s of [-1, 1]) {
      makeMesh(p, 'box', lampMat, -1.45, 0.43, s * 0.48, 0.04, 0.16, 0.31);
      makeMesh(p, 'box', tailMat, 1.45, 0.44, s * 0.48, 0.04, 0.14, 0.28);
    }
  }

  function createHallTemplates(hallId) {
    const paintMat = paintMats.sage;
    const stages = [];
    for (let i = 0; i < 4; i++) {
      const pallet = new T.Group();
      buildPalletBase(pallet);
      const piece = grp(pallet, 0, 0.22);
      const layers = [grp(piece), grp(piece)];
      if (i === 0) {
        buildEngineModel(piece, layers, hallId);
      } else {
        const len = hallId === 'stadtbus' ? 2.85 : hallId === 'lkw' ? 2.75 : 2.45;
        makeMesh(piece, 'box', getMat(steel, 0.4), 0, 0.25, 0, len, 0.2, 0.68);
        for (const offset of [-0.48, 0.48]) makeMesh(piece, 'box', getMat(coal, 0.2), 0, 0.29, offset, len + 0.15, 0.14, 0.12);
        const axX = hallId === 'stadtbus' || hallId === 'lkw' ? [-1.02, 0.98] : [-0.94, 0.94];
        const wr = hallId === 'lkw' ? 0.42 : 0.37;
        for (const xx of axX) {
          const axle = i === 1 ? layers[xx < 0 ? 0 : 1] : piece;
          makeMesh(axle, 'cyl', getMat(al, 0.45), xx, 0.36, 0, 0.15, 1.56, 0.15, Math.PI / 2, 0, 0);
          for (const side of [-1, 1]) {
            makeMesh(axle, 'cyl', getMat(al, 0.45), xx, 0.36, side * 0.68, 0.43, 0.095, 0.43, Math.PI / 2, 0, 0);
            if (i === 3) buildWheelMesh(layers[xx < 0 ? 0 : 1], xx, side * 0.78, wr);
          }
        }
        // Third tandem axle on LKW
        if (hallId === 'lkw') {
          const axle3 = i === 1 ? layers[1] : piece;
          makeMesh(axle3, 'cyl', getMat(al, 0.45), 0.28, 0.36, 0, 0.15, 1.56, 0.15, Math.PI / 2, 0, 0);
          if (i === 3) {
            for (const side of [-1, 1]) buildWheelMesh(layers[1], 0.28, side * 0.78, wr);
          }
        }
        if (i >= 2) buildVehicleBody(i === 2 ? layers[0] : piece, hallId, paintMat);
      }
      stages.push({ pallet, piece });
    }
    return stages;
  }

  const hallTemplates = Object.fromEntries(HALLS.map(h => [h.id, createHallTemplates(h.id)]));

  function applyPaint(obj, paintId) {
    const mat = paintMats[paintId] || paintMats.sage;
    obj.traverse(c => {
      if (c.isMesh && c.userData.paintable) c.material = mat;
    });
  }

  let currentHallId = null;
  const partCache = new Map();
  const exitCache = new Map();

  function clearPartCaches() {
    for (const o of partCache.values()) hallRoot.remove(o.g);
    partCache.clear();
    for (const o of exitCache.values()) hallRoot.remove(o.g);
    exitCache.clear();
  }

  function syncHallAssets(hallDef) {
    if (currentHallId === hallDef.id) return;
    currentHallId = hallDef.id;
    clearPartCaches();

    // Update header & station signs
    hallHeaderSign.material.map.dispose();
    hallHeaderSign.material.map = makeSignTexture(
      hallDef.name.toUpperCase(),
      'TAKTWERK INDUSTRIESTADT · ' + hallDef.vehicle.toUpperCase(),
      6.4, 0.95, '#1b2622', '#fff4de', '#' + hallDef.accent.toString(16).padStart(6, '0')
    );
    hallHeaderSign.material.needsUpdate = true;

    hallDef.specs.forEach((sp, i) => {
      stationSigns[i].material.map.dispose();
      stationSigns[i].material.map = makeSignTexture('0' + (i + 1), sp.name.toUpperCase(), 1.76, 0.88);
      stationSigns[i].material.needsUpdate = true;
    });

    // Rebuild bolt/weld targets & drag preview models for this hall
    targetPool.clear();
    targetGroups = hallDef.specs.map((d, i) => d.ops.map(o => {
      const g = grp(targetPool, i * SPAN + o.point[0], o.point[1], o.point[2]);
      if (o.kind === 'bolt') {
        makeMesh(g, 'cyl', getMat(coal, 0.2), 0, -0.038, 0, 0.23, 0.06, 0.23);
        makeMesh(g, 'bolt', getMat(0xcf9d51, 0.55, 0.35), 0, 0.035, 0, 0.195, 0.114, 0.195);
        makeMesh(g, 'box', getMat(coal), 0, 0.094, 0, 0.106, 0.008, 0.026);
      } else if (o.kind === 'weld') {
        makeMesh(g, 'cyl', getMat(0xd58552, 0.3, 0.4, 0x803d14), 0, 0, 0, 0.12, 0.07, 0.12, Math.PI / 2);
      }
      g.visible = false;
      return g;
    }));

    dragModels = hallDef.specs.map((_, i) => {
      const g = grp(targetPool);
      if (i === 1) {
        makeMesh(g, 'cyl', getMat(al, 0.45), 0, 0, 0, 0.14, 1.6, 0.14, Math.PI / 2);
        for (const z of [-0.65, 0.65]) makeMesh(g, 'cyl', getMat(steel, 0.4), 0, 0, z, 0.4, 0.16, 0.4, Math.PI / 2);
      } else if (i === 2) {
        buildVehicleBody(g, hallDef.id, paintMats[hallDef.defaultPaint] || paintMats.sage);
      } else {
        buildWheelMesh(g, 0, 0.01, hallDef.id === 'lkw' ? 0.42 : 0.37);
      }
      g.visible = false;
      return g;
    });
  }

  // =========================================================================
  // 2. 3D INDUSTRIAL CITY CAMPUS (Mode: 'city')
  // =========================================================================
  const cityRoot = grp(scene);
  cityRoot.visible = false;
  const cb = createBatcher();

  // Expansive meadow terrain reaching horizon (no walls!)
  cb.box(cityRoot, 0x8ea386, 0, -0.35, 0, 440, 0.7, 440, 0, 0, 0, 0, 0.95);
  // Concrete industrial campus plate
  cb.box(cityRoot, 0xadb3ab, 0, 0.02, -4, 124, 0.08, 86, 0, 0, 0, 0, 0.92);

  // River/canal along south side
  cb.box(cityRoot, 0x4b7c8c, 0, -0.02, 54, 360, 0.14, 16, 0, 0, 0, 0.2, 0.2);
  cb.box(cityRoot, 0x7b857b, 0, 0.08, 45.6, 360, 0.25, 1.2);
  cb.box(cityRoot, 0x7b857b, 0, 0.08, 62.4, 360, 0.25, 1.2);
  // Access road bridge over canal
  cb.box(cityRoot, 0x48504f, 0, 0.18, 54, 9.5, 0.3, 20);
  for (const s of [-4.6, 4.6]) cb.box(cityRoot, silver, s, 0.68, 54, 0.28, 0.75, 20, 0, 0, 0, 0.4);

  // Multi-lane industrial road grid connecting all 12 plots
  const roadColor = 0x3b4342;
  // Horizontal avenues (z = 0, z = 28, z = -24, z = -44)
  for (const z of [0, 28, -24]) {
    cb.box(cityRoot, roadColor, 0, 0.075, z, 118, 0.04, 6.2, 0, 0, 0, 0, 0.88);
    for (let x = -54; x <= 54; x += 5) cb.box(cityRoot, 0xede6cf, x, 0.1, z, 2.2, 0.015, 0.16);
  }
  // Vertical streets (x = -56, -33, -11, 11, 33, 56)
  for (const x of [-56, -11, 11, 56]) {
    cb.box(cityRoot, roadColor, x, 0.072, 2, 6.2, 0.04, 58, 0, 0, 0, 0, 0.88);
    for (let z = -22; z <= 26; z += 5) cb.box(cityRoot, 0xede6cf, x, 0.098, z, 0.16, 0.015, 2.2);
  }
  // South highway connector to bridge
  cb.box(cityRoot, roadColor, 0, 0.075, 38, 6.8, 0.04, 18);

  // Northern railway corridor
  cb.box(cityRoot, 0x6f685e, 0, 0.08, -48, 320, 0.12, 5.2);
  for (const z of [-49.1, -46.9]) cb.box(cityRoot, silver, 0, 0.18, z, 320, 0.09, 0.14, 0, 0, 0, 0.65);
  for (let x = -140; x <= 140; x += 1.6) cb.box(cityRoot, 0x4b3c31, x, 0.13, -48, 0.26, 0.07, 3.0);

  // Perimeter trees & gentle landscape framing (natural outdoor perimeter)
  const treeCoords = [];
  for (let i = 0; i < 64; i++) {
    const ang = (i / 64) * Math.PI * 2;
    const rad = 76 + (i % 5) * 9;
    const tx = Math.cos(ang) * rad * 1.25;
    const tz = Math.sin(ang) * rad * 0.92;
    if (Math.abs(tx) < 10 && tz > 30) continue;
    if (tz > 43 && tz < 64) continue;
    if (tz < -43 && tz > -53) continue;
    treeCoords.push([tx, tz, 0.85 + (i % 4) * 0.22]);
  }
  for (const [tx, tz, sc] of treeCoords) {
    cb.cyl(cityRoot, 0x664d3b, tx, 1.3 * sc, tz, 0.55 * sc, 2.6 * sc, 0, 0, 0);
    cb.cone(cityRoot, 0x4c6e55, tx, 3.8 * sc, tz, 3.1 * sc, 3.6 * sc);
    cb.cone(cityRoot, 0x5c7f62, tx, 5.2 * sc, tz, 2.3 * sc, 2.8 * sc);
  }
  // Streetlights along main boulevard
  for (let x = -48; x <= 48; x += 16) {
    cb.cyl(cityRoot, coal, x, 2.6, 3.5, 0.16, 5.2);
    cb.box(cityRoot, 0xfff3c4, x, 5.2, 2.8, 0.45, 0.14, 1.1, 0, 0, 0, 0, 0.3, 0xffe49a);
  }

  cb.flush();

  // Animated City Props: Wind Turbines, Freight Train, City Traffic Vehicles
  const windRotors = [];
  const cityPlots = new Map();
  const plotHitboxes = [];

  // Selection highlight frame in city view
  const selectFrame = grp(cityRoot);
  selectFrame.visible = false;
  const selMat = new T.MeshStandardMaterial({ color: 0xff813e, emissive: 0xff6a1a, emissiveIntensity: 0.7, roughness: 0.3 });
  for (const z of [-8.8, 8.8]) makeMesh(selectFrame, 'box', selMat, 0, 0.22, z, 18.2, 0.22, 0.42);
  for (const x of [-9.0, 9.0]) makeMesh(selectFrame, 'box', selMat, x, 0.22, 0, 0.42, 0.22, 17.8);

  // Build all 12 Plot Visual Containers (Empty pad + Built multi-part structure)
  function createPlotPad(title, sub, accentHex) {
    const pad = new T.Group();
    makeMesh(pad, 'box', getMat(0x9ea59d, 0, 0.92), 0, 0.09, 0, 17.2, 0.12, 16.4);
    makeMesh(pad, 'box', getMat(0x889189, 0, 0.9), 0, 0.16, 0, 15.6, 0.04, 14.8);
    for (const sx of [-7.8, 7.8]) {
      for (const sz of [-7.4, 7.4]) {
        makeMesh(pad, 'cyl', getMat(orange, 0.2), sx, 0.85, sz, 0.35, 1.5, 0.35);
      }
    }
    const board = addSign(pad, title, sub, 0, 2.6, 0, 10.5, 2.6, '#1c2622', '#f5f4ea', accentHex);
    board.rotation.x = -0.35;
    return pad;
  }

  function buildCityHallMesh(def) {
    const g = new T.Group();
    // Foundation apron
    makeMesh(g, 'box', getMat(0x879088, 0, 0.9), 0, 0.12, 0, 17.6, 0.22, 16.6);
    // Main industrial hall body
    makeMesh(g, 'box', getMat(0xd6d7cb, 0.05, 0.78), 0, 3.1, -0.8, 15.4, 5.8, 12.2);
    // Accent brand band
    makeMesh(g, 'box', getMat(def.accent, 0.2, 0.45), 0, 5.4, 5.36, 15.5, 0.65, 0.14);
    // Sawtooth industrial roof ridges & skylights
    for (let k = -2; k <= 2; k++) {
      makeMesh(g, 'box', getMat(steel, 0.4, 0.45), k * 2.9, 6.65, -0.8, 2.4, 1.2, 11.8, 0, 0, 0.24);
      makeMesh(g, 'box', getMat(0xd8eef2, 0.15, 0.2, 0x99d0e0), k * 2.9 + 0.9, 6.72, -0.8, 0.32, 0.8, 11.4);
    }
    // Loading bay doors
    for (const dx of [-4.2, 0, 4.2]) {
      makeMesh(g, 'box', getMat(coal, 0.3), dx, 1.8, 5.35, 2.6, 3.2, 0.18);
      makeMesh(g, 'box', getMat(yellow, 0.1), dx, 3.5, 5.42, 2.8, 0.18, 0.12);
    }
    // Roof exhaust vents & billboard
    for (const vx of [-5, 5]) makeMesh(g, 'cyl', getMat(al, 0.45), vx, 7.6, -4.5, 0.95, 2.4, 0.95);
    const roofSign = addSign(g, def.code + ' · ' + def.short.toUpperCase(), 'MONTAGEHALLE', 0, 8.2, 5.2, 11.5, 2.2, '#18231f', '#fff4dc', '#' + def.accent.toString(16).padStart(6, '0'));
    roofSign.rotation.x = -0.22;
    return g;
  }

  function buildCitySupportMesh(def) {
    const g = new T.Group();
    makeMesh(g, 'box', getMat(0x8a928a, 0, 0.9), 0, 0.12, 0, 17.6, 0.22, 16.6);
    const id = def.id;

    if (id === 'kraftwerk') {
      // Substation building
      makeMesh(g, 'box', getMat(0xc8cdc2, 0.1, 0.75), -4.2, 2.4, -2.5, 6.8, 4.4, 6.2);
      makeMesh(g, 'box', getMat(yellow, 0.2), -4.2, 4.3, 0.65, 6.9, 0.45, 0.12);
      // Solar array rows
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          makeMesh(g, 'box', getMat(0x24496e, 0.55, 0.25), -5.2 + c * 3.0, 0.9, 2.6 + r * 2.1, 2.5, 0.12, 1.55, 0.38, 0, 0);
        }
      }
      // Twin animated wind turbines
      for (const [tx, tz] of [[4.2, -3.5], [5.4, 3.2]]) {
        makeMesh(g, 'cyl', getMat(0xeef1ec, 0.2, 0.45), tx, 6.4, tz, 0.62, 12.6, 0.62);
        makeMesh(g, 'box', getMat(0xd5dcd7, 0.3), tx, 12.7, tz + 0.3, 0.9, 0.9, 1.7);
        const hub = grp(g, tx, 12.7, tz + 1.25);
        for (let b = 0; b < 3; b++) {
          const blade = grp(hub);
          blade.rotation.z = (b * Math.PI * 2) / 3;
          makeMesh(blade, 'box', getMat(0xf5f6f0, 0.15, 0.35), 0, 2.2, 0, 0.32, 4.4, 0.09);
        }
        windRotors.push(hub);
      }
    } else if (id === 'presswerk') {
      // Heavy foundry hall + twin smokestacks + furnace glow + steel coils
      makeMesh(g, 'box', getMat(0x4a5554, 0.45, 0.55), -1, 3.6, -1.2, 13.6, 7.0, 10.6);
      makeMesh(g, 'box', getMat(orange, 0.2), -1, 6.7, 4.15, 13.7, 0.5, 0.14);
      makeMesh(g, 'box', getMat(0xff7b2c, 0.1, 0.3, 0xff5a12), -3.5, 1.8, 4.16, 3.6, 2.2, 0.15);
      for (const sx of [4.8, 6.8]) {
        makeMesh(g, 'cyl', getMat(0x3a4242, 0.45), sx, 6.2, -4.4, 1.35, 12.2, 1.35);
        makeMesh(g, 'cyl', getMat(orange, 0.1), sx, 10.5, -4.4, 1.4, 1.1, 1.4);
      }
      for (let k = 0; k < 4; k++) {
        makeMesh(g, 'cyl', getMat(silver, 0.7, 0.32), -4.5 + k * 2.2, 1.0, 6.0, 1.4, 1.4, 1.4, 0, 0, Math.PI / 2);
      }
    } else if (id === 'lackiererei') {
      // Cleanroom paint shop with color stripes & exhaust scrubbers
      makeMesh(g, 'box', getMat(0xf0f1ea, 0.1, 0.55), 0, 3.0, -0.6, 14.6, 5.6, 11.4);
      const stripeCols = [0x73908d, 0xe2aa3b, 0xc84b3c, 0x3e6f98];
      stripeCols.forEach((sc, idx) => {
        makeMesh(g, 'box', getMat(sc, 0.35, 0.3), -4.5 + idx * 3.0, 4.8, 5.16, 2.7, 0.9, 0.14);
      });
      for (const sx of [-4.2, 0, 4.2]) {
        makeMesh(g, 'cyl', getMat(al, 0.5, 0.35), sx, 6.9, -2.5, 1.9, 2.4, 1.9);
      }
    } else if (id === 'batteriewerk') {
      // High-tech glass gigafactory with cyan accents
      makeMesh(g, 'box', getMat(0x2c3b42, 0.4, 0.4), 0, 3.5, -0.5, 15.2, 6.6, 11.8);
      makeMesh(g, 'box', getMat(0x6bbcd4, 0.3, 0.2), 0, 3.5, 5.45, 13.4, 3.6, 0.14);
      makeMesh(g, 'box', getMat(0x3ad6f2, 0.2, 0.2, 0x22b5dc), 0, 6.6, 5.46, 15.3, 0.36, 0.16);
      for (let k = -2; k <= 2; k++) {
        makeMesh(g, 'box', getMat(silver, 0.5), k * 2.8, 7.4, -1.5, 1.8, 1.2, 6.2);
      }
    } else if (id === 'logistik') {
      // Freight hub with gantry crane & colorful containers
      makeMesh(g, 'box', getMat(0x637178, 0.35), -3.8, 2.6, 1.4, 8.2, 4.8, 8.6);
      // Yellow container crane over yard
      for (const sx of [2.0, 6.8]) {
        makeMesh(g, 'box', getMat(yellow, 0.25), sx, 4.4, -2.5, 0.55, 8.4, 0.55);
        makeMesh(g, 'box', getMat(yellow, 0.25), sx, 4.4, 4.5, 0.55, 8.4, 0.55);
      }
      makeMesh(g, 'box', getMat(orange, 0.25), 4.4, 8.4, 1.0, 5.6, 0.75, 8.2);
      // Container stacks
      const cCols = [0xc84b3c, 0x3e6f98, 0xe2aa3b, 0x4b7f66];
      for (let k = 0; k < 4; k++) {
        makeMesh(g, 'box', getMat(cCols[k], 0.2), 4.4, 1.05 + (k % 2) * 1.8, -1.0 + Math.floor(k / 2) * 3.4, 2.2, 1.75, 2.8);
      }
    } else if (id === 'akademie') {
      // Modern tiered R&D & training campus
      makeMesh(g, 'box', getMat(0xe5e6dc, 0.1, 0.65), 0, 2.2, 0, 14.2, 4.2, 10.6);
      makeMesh(g, 'box', getMat(0x3a6478, 0.3, 0.22), 0, 2.3, 5.36, 10.8, 2.4, 0.15);
      makeMesh(g, 'box', getMat(0xd4d9d1, 0.1, 0.6), -2.2, 5.6, -1.2, 8.6, 3.2, 7.2);
      makeMesh(g, 'cyl', getMat(silver, 0.6), 4.2, 6.0, -2.2, 0.22, 3.6, 0.22);
      makeMesh(g, 'cone', getMat(0xf2f4ee, 0.2), 4.2, 7.8, -2.2, 2.4, 0.9);
    } else if (id === 'wohnviertel') {
      // Warm residential blocks with courtyard greenery (extra stories scale by level)
      const blocks = [
        [-4.5, -3.2, 5.6, 5.4, 5.2, 0xe7dfd1],
        [4.2, -3.0, 5.6, 6.8, 5.2, 0xd7cbb8],
        [-4.4, 3.8, 5.4, 4.6, 4.8, 0xd8dfd3],
        [4.3, 3.8, 5.6, 5.8, 4.8, 0xe4d5c3]
      ];
      blocks.forEach(([bx, bz, bw, bh, bd, col], idx) => {
        const blk = grp(g, bx, 0, bz);
        blk.userData.minLv = idx < 2 ? 1 : idx;
        makeMesh(blk, 'box', getMat(col, 0.05, 0.8), 0, bh * 0.5, 0, bw, bh, bd);
        makeMesh(blk, 'box', getMat(0x8c4e38, 0.1, 0.75), 0, bh + 0.25, 0, bw + 0.3, 0.5, bd + 0.3);
        // Warm windows
        for (let wy = 1.4; wy < bh - 0.5; wy += 1.6) {
          makeMesh(blk, 'box', getMat(0xffeab8, 0.1, 0.25, 0xe5b864), 0, wy, bd * 0.5 + 0.05, bw * 0.72, 0.65, 0.05);
        }
      });
      // Park tree in center courtyard
      makeMesh(g, 'cyl', getMat(0x664d3b), 0, 1.1, 0.4, 0.45, 2.2, 0.45);
      makeMesh(g, 'cone', getMat(0x4c7854), 0, 3.1, 0.4, 2.8, 3.2);
    }

    const bSign = addSign(g, def.short.toUpperCase(), def.category.toUpperCase(), 0, 8.2, 6.6, 9.6, 2.0, '#18231f', '#fff4dc', '#' + def.accent.toString(16).padStart(6, '0'));
    bSign.rotation.x = -0.22;
    return g;
  }

  // Register all 5 Assembly Hall plots & 7 Building plots
  for (const h of HALLS) {
    const root = grp(cityRoot, h.plotPos[0], 0, h.plotPos[2]);
    const pad = createPlotPad(h.code + ' · ' + h.short.toUpperCase(), 'FAHRZEUGWERK', '#' + h.accent.toString(16).padStart(6, '0'));
    const built = buildCityHallMesh(h);
    root.add(pad, built);
    const hit = new T.Mesh(geos.box, new T.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, 4.2, 0);
    hit.scale.set(17.6, 8.4, 16.6);
    hit.userData = { plotType: 'hall', plotId: h.id };
    root.add(hit);
    plotHitboxes.push(hit);
    cityPlots.set('hall:' + h.id, { type: 'hall', id: h.id, root, pad, built, pos: h.plotPos });
  }

  for (const b of BUILDINGS) {
    const root = grp(cityRoot, b.plotPos[0], 0, b.plotPos[2]);
    const pad = createPlotPad(b.short.toUpperCase(), b.category.toUpperCase(), '#' + b.accent.toString(16).padStart(6, '0'));
    const built = buildCitySupportMesh(b);
    root.add(pad, built);
    const hit = new T.Mesh(geos.box, new T.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, 4.2, 0);
    hit.scale.set(17.6, 8.4, 16.6);
    hit.userData = { plotType: 'building', plotId: b.id };
    root.add(hit);
    plotHitboxes.push(hit);
    cityPlots.set('building:' + b.id, { type: 'building', id: b.id, root, pad, built, pos: b.plotPos });
  }

  // Freight Train on Northern Railway (visible once Logistik-Hub is built!)
  const train = grp(cityRoot, -90, 0.25, -48);
  makeMesh(train, 'box', getMat(orange, 0.35), 0, 1.4, 0, 7.2, 2.4, 2.5);
  makeMesh(train, 'box', getMat(coal, 0.3), -2.4, 2.65, 0, 2.1, 0.6, 2.3);
  for (let w = 1; w <= 5; w++) {
    makeMesh(train, 'box', getMat(w % 2 ? 0x3e6f98 : 0x5c6e78, 0.3), -w * 8.4, 1.35, 0, 7.6, 2.2, 2.4);
  }
  train.visible = false;

  // Living City Road Traffic Loop (miniature built vehicles driving on the industrial roads!)
  const trafficWaypoints = [
    [-56, 28], [56, 28], [56, 0], [-11, 0], [-11, -24], [56, -24], [56, 28], [-56, 28], [-56, -24], [11, -24], [11, 0], [-56, 0]
  ];
  const trafficActors = [];
  for (let i = 0; i < 14; i++) {
    const g = grp(cityRoot, 0, 0.12, 0);
    const body = makeMesh(g, 'box', getMat(0x73908d, 0.35, 0.32), 0, 0.58, 0, 2.6, 0.72, 1.32);
    const cabin = makeMesh(g, 'box', getMat(0x3a5256, 0.2, 0.2), 0.1, 1.12, 0, 1.4, 0.48, 1.16);
    makeMesh(g, 'box', getMat(0xfff4c2, 0.1, 0.2, 0xffe296), -1.32, 0.55, 0, 0.06, 0.2, 1.0);
    g.visible = false;
    trafficActors.push({
      g,
      body,
      cabin,
      seg: i % (trafficWaypoints.length - 1),
      t: (i * 0.27) % 1,
      speed: 0.18 + (i % 4) * 0.04,
      hallIdx: i % HALLS.length
    });
  }

  // =========================================================================
  // 3. CAMERA, CONTROLS & MODE SWITCHING
  // =========================================================================
  let viewMode = 'hall'; // 'hall' | 'city'
  let yaw = 0;
  let pitch = 0;
  let joy = [0, 0];
  let previousSig = '';
  const keys = new Set();

  // City orbit/pan camera targets (smoothly damped)
  const cityCam = {
    tx: 0, tz: 2,
    txGoal: 0, tzGoal: 2,
    dist: 66, distGoal: 66,
    angle: 0.52, angleGoal: 0.52,
    elev: 0.68, elevGoal: 0.68
  };

  const _v3 = new T.Vector3();
  const _ray = new T.Raycaster();
  const _mouse = new T.Vector2();

  function setMode(mode) {
    if (viewMode === mode) return;
    viewMode = mode;
    hallRoot.visible = mode === 'hall';
    cityRoot.visible = mode === 'city';
    if (mode === 'city') {
      scene.background.setHex(0xc4d8d4);
      scene.fog.color.setHex(0xc4d8d4);
      scene.fog.density = 0.0042;
      cam.fov = 46;
      cam.updateProjectionMatrix();
    } else {
      scene.background.setHex(0xcbd6ca);
      scene.fog.color.setHex(0xd4d8ce);
      scene.fog.density = 0.015;
      cam.fov = 57;
      cam.updateProjectionMatrix();
    }
    previousSig = '';
  }

  function visit(i) {
    setMode('hall');
    const narrow = innerWidth / innerHeight < 1;
    cam.position.set(i * SPAN - (narrow ? 0.65 : 1.65), narrow ? 4.42 : 3.65, narrow ? 4.5 : 3.65);
    _v3.set(i * SPAN, 1.85, 0).sub(cam.position);
    yaw = Math.atan2(-_v3.x, -_v3.z);
    pitch = Math.atan2(_v3.y, Math.hypot(_v3.x, _v3.z));
    cam.rotation.set(pitch, yaw, 0, 'YXZ');
    previousSig = '';
  }

  function focusCityPlot(key) {
    const plot = cityPlots.get(key);
    if (!plot) return;
    cityCam.txGoal = plot.pos[0];
    cityCam.tzGoal = plot.pos[2];
    cityCam.distGoal = clamp(cityCam.distGoal, 32, 54);
    selectFrame.visible = true;
    selectFrame.position.set(plot.pos[0], 0, plot.pos[2]);
    previousSig = '';
  }

  function clearCitySelection() {
    selectFrame.visible = false;
    previousSig = '';
  }

  function resetCityCamera() {
    cityCam.txGoal = 0;
    cityCam.tzGoal = 2;
    cityCam.distGoal = 74;
    cityCam.angleGoal = 0.52;
    cityCam.elevGoal = 0.68;
    previousSig = '';
  }

  function zoomCity(delta) {
    cityCam.distGoal = clamp(cityCam.distGoal + delta, 24, 125);
    previousSig = '';
  }

  function panCity(dx, dy) {
    const scale = cityCam.dist * 0.0022;
    const ca = Math.cos(cityCam.angle);
    const sa = Math.sin(cityCam.angle);
    cityCam.txGoal = clamp(cityCam.txGoal - (dx * ca + dy * sa) * scale, -64, 64);
    cityCam.tzGoal = clamp(cityCam.tzGoal - (-dx * sa + dy * ca) * scale, -54, 42);
    previousSig = '';
  }

  function rotateCity(dx) {
    cityCam.angleGoal -= dx * 0.0055;
    previousSig = '';
  }

  function pickCityPlot(clientX, clientY) {
    if (viewMode !== 'city') return null;
    const rect = renderer.domElement.getBoundingClientRect();
    _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    _ray.setFromCamera(_mouse, cam);
    const hits = _ray.intersectObjects(plotHitboxes, false);
    if (!hits.length) return null;
    const u = hits[0].object.userData;
    return { type: u.plotType, id: u.plotId, key: u.plotType + ':' + u.plotId };
  }

  function resize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    cam.aspect = container.clientWidth / Math.max(1, container.clientHeight);
    cam.updateProjectionMatrix();
    previousSig = '';
  }
  resize();
  window.addEventListener('resize', resize);
  visit(0);

  // ---- Display Part helper (Hall interior) ----
  function displayPart(p, hallSim, templates, sale = false) {
    const stage = Math.min(p.at, 3);
    const prev = Math.max(0, p.at - 1);
    const atDock = !sale && p.at < 4 && Math.abs(p.x - p.at * SPAN) < 0.01;
    const buildHere = atDock && (stage === 0 || p.work.some(Boolean) || hallSim.stations[stage].run);
    const model = buildHere ? stage : prev;
    const final = p.at === 4 || (!buildHere && p.at > 0);
    const key = (sale ? 'S' : 'P') + p.id;
    let obj = partCache.get(key);
    if (!obj || obj.model !== model) {
      if (obj) hallRoot.remove(obj.g);
      const g = templates[model].pallet.clone(true);
      g.visible = true;
      hallRoot.add(g);
      obj = { g, model, piece: g.children[g.children.length - 1], seen: true, paint: '' };
      partCache.set(key, obj);
    }
    if (obj.paint !== hallSim.paint) {
      applyPaint(obj.g, hallSim.paint);
      obj.paint = hallSim.paint;
    }
    obj.seen = true;
    obj.g.position.set(p.x, 0.96, sale ? p.z : 0);
    const layers = obj.piece.children.slice(0, 2);
    const count = p.work.filter(v => v >= 1).length;
    layers.forEach((l, j) => {
      l.visible = final || (model === 0 ? j === 0 || count >= 4 : model === 2 ? p.work[0] >= 1 : p.work[j] >= 1);
    });
    if (model >= 1 && !obj.engine) {
      obj.engine = templates[0].piece.clone(true);
      obj.engine.scale.setScalar(0.45);
      obj.engine.position.set(-0.36, 0.5, 0);
      obj.piece.add(obj.engine);
    }
  }

  let animTime = 0;

  function render(dt, citySim, playing, drag) {
    animTime += dt;
    const hallSim = citySim.activeHall;

    if (viewMode === 'hall') {
      syncHallAssets(hallSim.def);
      const templates = hallTemplates[hallSim.id];

      const f = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')) - joy[1];
      const r = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + joy[0];
      const k = playing
        ? Math.min(dt, 0.09) * (4.6 + citySim.player.pace * 0.85) * (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 1.55 : 1) / Math.max(1, Math.hypot(f, r))
        : 0;
      cam.position.x = clamp(cam.position.x + (-Math.sin(yaw) * f + Math.cos(yaw) * r) * k, -8, DISPATCH + 1);
      cam.position.z = clamp(cam.position.z + (-Math.cos(yaw) * f - Math.sin(yaw) * r) * k, 1.72, 9.9);
      cam.rotation.set(pitch, yaw, 0, 'YXZ');
      cam.updateMatrixWorld();

      for (const o of partCache.values()) o.seen = false;
      for (const p of hallSim.parts) displayPart(p, hallSim, templates, false);
      for (const p of hallSim.sales) displayPart(p, hallSim, templates, true);
      for (const [id, o] of partCache) {
        if (!o.seen) {
          hallRoot.remove(o.g);
          partCache.delete(id);
        }
      }

      // Render finished vehicles rolling out through the dispatch gate
      for (const o of exitCache.values()) o.seen = false;
      for (const ex of hallSim.exits) {
        let o = exitCache.get(ex.id);
        if (!o) {
          const g = templates[3].piece.clone(true);
          applyPaint(g, ex.paint);
          g.visible = true;
          hallRoot.add(g);
          o = { g, seen: true };
          exitCache.set(ex.id, o);
        }
        o.seen = true;
        o.g.position.set(ex.x, 0.05, 0);
      }
      for (const [id, o] of exitCache) {
        if (!o.seen) {
          hallRoot.remove(o.g);
          exitCache.delete(id);
        }
      }

      tool.visible = false;
      arc.visible = false;

      hallSim.stations.forEach((s, i) => {
        const p = hallSim.dock(i);
        const run = s.run;
        const arm = arms[i];
        const worker = workers[i];
        const op = run && hallSim.specs[i].ops[run.j];
        const progress = run ? p.work[run.j] : 0;
        const reach = run ? Math.min(1, Math.sin(Math.PI * progress) * 4) : 0;

        // Traffic light status (Ampel: 0=green, 1=yellow, 2=red)
        const st = hallSim.status(i);
        const lm = stationLamps[i];
        lm[0].emissiveIntensity = st === 'running' ? 1.5 : 0.05;
        lm[1].emissiveIntensity = (st === 'waiting' || st === 'starved' || st === 'idle' || st === 'recording') ? 1.4 : 0.05;
        lm[2].emissiveIntensity = st === 'blocked' ? 1.7 : 0.05;

        arm.arm.visible = s.robot;
        worker.g.visible = !!s.staff;
        worker.hand.rotation.x = run?.who === 'worker' ? -0.55 + 0.28 * Math.sin(progress * 12) : 0;

        if (s.robot) {
          const t = run?.who === 'robot' ? reach : 0;
          const pt = op?.point || [0, 2, 0];
          const tx = T.MathUtils.lerp(-0.36, pt[0] - 1.17, t);
          const tz = T.MathUtils.lerp(0.62, pt[2] + 2.03, t);
          const ty = T.MathUtils.lerp(1.72, pt[1] - 0.8, t);
          const h = Math.hypot(tx, tz);
          const L = clamp(Math.hypot(h, ty), 0.12, 3.379);
          arm.swivel.rotation.y = Math.atan2(tx, tz);
          arm.shoulder.rotation.x = Math.atan2(h, ty) - Math.acos(clamp((L * L + 1.74 ** 2 - 1.64 ** 2) / (2 * L * 1.74), -1, 1));
          arm.elbow.rotation.x = Math.PI - Math.acos(clamp((1.74 ** 2 + 1.64 ** 2 - L * L) / (2 * 1.74 * 1.64), -1, 1));
        }

        targetGroups[i].forEach((g, j) => {
          const o = hallSim.specs[i].ops[j];
          g.visible = !!p && (o.kind === 'bolt' || o.kind === 'weld') && (hallSim.available(i, p).includes(j) || p.work[j] > 0);
          if (g.visible) {
            g.position.y = o.point[1] - 0.065 * p.work[j];
            g.rotation.y = p.work[j] * Math.PI * 5;
          }
        });

        if (run && run.who !== 'robot' && op.kind !== 'fit') {
          tool.visible = true;
          tool.position.set(i * SPAN + op.point[0], op.point[1] + 0.10 - 0.06 * progress, op.point[2]);
          tool.rotation.set(0.21, Math.sin(progress * 36) * 0.08, -0.3);
        }
        if (run && op.kind === 'weld') {
          arc.visible = true;
          arc.position.set(i * SPAN + op.point[0], op.point[1], op.point[2]);
          arc.rotation.y = progress * 38;
          arc.scale.setScalar(0.65 + 0.55 * Math.abs(Math.sin(progress * 32)));
        }

        const dragObj = dragModels[i];
        dragObj.visible = op?.kind === 'fit';
        if (dragObj.visible) {
          if (i === 2) applyPaint(dragObj, hallSim.paint);
          const a = op.from;
          const b = op.point;
          let t = progress;
          if (run.who === 'player' && drag) t = drag.fraction || 0;
          dragObj.position.set(i * SPAN + a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
        }
      });

      renderer.render(scene, cam);
      return;
    }

    // ---- CITY MODE RENDER ----
    const panSpd = playing ? Math.min(dt, 0.08) * (cityCam.dist * 0.72) : 0;
    const kf = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')) - joy[1];
    const kr = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + joy[0];
    if (kf || kr) {
      const ca = Math.cos(cityCam.angle);
      const sa = Math.sin(cityCam.angle);
      cityCam.txGoal = clamp(cityCam.txGoal + (kr * ca - kf * sa) * panSpd, -64, 64);
      cityCam.tzGoal = clamp(cityCam.tzGoal + (-kr * sa - kf * ca) * panSpd, -54, 42);
    }
    if (keys.has('KeyQ')) cityCam.angleGoal += dt * 1.4;
    if (keys.has('KeyE')) cityCam.angleGoal -= dt * 1.4;

    cityCam.tx = damp(cityCam.tx, cityCam.txGoal, 8, dt);
    cityCam.tz = damp(cityCam.tz, cityCam.tzGoal, 8, dt);
    cityCam.dist = damp(cityCam.dist, cityCam.distGoal, 8, dt);
    cityCam.angle = damp(cityCam.angle, cityCam.angleGoal, 8, dt);
    cityCam.elev = damp(cityCam.elev, cityCam.elevGoal, 8, dt);

    const horiz = cityCam.dist * Math.cos(cityCam.elev);
    cam.position.set(
      cityCam.tx + Math.sin(cityCam.angle) * horiz,
      cityCam.dist * Math.sin(cityCam.elev),
      cityCam.tz + Math.cos(cityCam.angle) * horiz
    );
    cam.lookAt(cityCam.tx, 1.5, cityCam.tz);
    cam.updateMatrixWorld();

    // Sync plot visibility (built vs unbuilt pad + residential level blocks)
    for (const h of citySim.halls) {
      const plot = cityPlots.get('hall:' + h.id);
      if (plot) {
        plot.built.visible = h.unlocked;
        plot.pad.visible = !h.unlocked;
      }
    }
    for (const b of BUILDINGS) {
      const lv = citySim.buildings[b.id] || 0;
      const plot = cityPlots.get('building:' + b.id);
      if (plot) {
        plot.built.visible = lv > 0;
        plot.pad.visible = lv === 0;
        if (b.id === 'wohnviertel' && lv > 0) {
          plot.built.children.forEach(ch => {
            if (ch.userData.minLv) ch.visible = lv >= ch.userData.minLv;
          });
        }
      }
    }

    // Spin wind turbines
    if (citySim.buildings.kraftwerk > 0) {
      const rotSpd = dt * (1.2 + citySim.buildings.kraftwerk * 0.35);
      for (const hub of windRotors) hub.rotation.z -= rotSpd;
    }

    // Move freight train if Logistik-Hub built
    train.visible = citySim.buildings.logistik > 0;
    if (train.visible) {
      train.position.x = -120 + ((animTime * 11) % 270);
    }

    // Drive unlocked vehicles along the city boulevards
    const openHalls = citySim.halls.filter(h => h.unlocked);
    const activeTraffic = Math.min(trafficActors.length, 3 + openHalls.length * 2 + Math.min(5, Math.floor(citySim.totalShipped() / 4)));
    trafficActors.forEach((tr, idx) => {
      if (idx >= activeTraffic) {
        tr.g.visible = false;
        return;
      }
      const hallSource = openHalls[idx % openHalls.length];
      tr.g.visible = true;
      tr.body.material = paintMats[hallSource.paint] || paintMats.sage;
      const isHeavy = hallSource.id === 'lkw' || hallSource.id === 'stadtbus';
      tr.g.scale.set(isHeavy ? 1.35 : 1, hallSource.id === 'transporter' || isHeavy ? 1.25 : 1, 1);

      tr.t += dt * tr.speed;
      if (tr.t >= 1) {
        tr.t -= 1;
        tr.seg = (tr.seg + 1) % (trafficWaypoints.length - 1);
      }
      const a = trafficWaypoints[tr.seg];
      const b = trafficWaypoints[tr.seg + 1];
      const x = a[0] + (b[0] - a[0]) * tr.t;
      const z = a[1] + (b[1] - a[1]) * tr.t;
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      // Offset to right lane
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len;
      const nz = dx / len;
      tr.g.position.set(x + nx * 1.25, 0.12, z + nz * 1.25);
      tr.g.rotation.y = Math.atan2(-dz, dx) + Math.PI;
    });

    renderer.render(scene, cam);
  }

  function project(i, point) {
    _v3.set(i * SPAN + point[0], point[1], point[2]).project(cam);
    return {
      x: (_v3.x + 1) * container.clientWidth / 2,
      y: (1 - _v3.y) * container.clientHeight / 2,
      visible: _v3.z > 0 && _v3.z < 1 && Math.abs(_v3.x) < 1 && Math.abs(_v3.y) < 1
    };
  }

  return {
    canvas: renderer.domElement,
    keys,
    setMode,
    getMode: () => viewMode,
    visit,
    focusCityPlot,
    clearCitySelection,
    resetCityCamera,
    zoomCity,
    panCity,
    rotateCity,
    pickCityPlot,
    render,
    project,
    look(dx, dy) {
      yaw -= dx * 0.004;
      pitch = clamp(pitch - dy * 0.0032, -1.25, 1.04);
    },
    joystick(x, y) {
      joy = [x, y];
    },
    nearest: () => clamp(Math.round(cam.position.x / SPAN), 0, 3),
    far: i => Math.hypot(cam.position.x - i * SPAN, cam.position.z) > 6.3
  };
}
