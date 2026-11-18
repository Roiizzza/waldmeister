'use strict';
/* ================= Utils ================= */
const TAU = Math.PI * 2, PI = Math.PI;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[(Math.random() * a.length) | 0];
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const angDiff = (a, b) => ((b - a + PI) % TAU + TAU) % TAU - PI;
const angDamp = (a, b, k, dt) => a + angDiff(a, b) * (1 - Math.exp(-k * dt));
const fmt = n => Math.floor(n).toLocaleString('en-US');
const $ = id => document.getElementById(id);

/* ================= Colour management (r128: hex colours are sRGB, lighting is linear) ================= */
(function () {
  const orig = THREE.Color.prototype.setHex;
  THREE.Color.prototype.setHex = function (hex) { orig.call(this, hex); return this.convertSRGBToLinear(); };
})();

/* ================= Device detection ================= */
const MOBILE = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
document.documentElement.classList.toggle('touch', MOBILE);

/* ================= Renderer / Scene ================= */
const host = $('game');
const renderer = new THREE.WebGLRenderer({ antialias: !MOBILE, powerPreference: 'high-performance' });
renderer.setPixelRatio(MOBILE ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9fb8d8, 0.010);
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 420);
scene.add(camera);

/* ================= Canvas textures ================= */
function canvasTex(w, h, draw, rep, srgb) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb !== false) t.encoding = THREE.sRGBEncoding;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (rep) t.repeat.set(rep[0], rep[1]);
  t.anisotropy = 4;
  return t;
}
function speckle(x, w, h, n, amax, rgb, smax) {
  for (let i = 0; i < n; i++) {
    x.fillStyle = 'rgba(' + rgb + ',' + (Math.random() * amax).toFixed(3) + ')';
    const s = rand(1, smax || 3);
    x.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
}
function cracks(x, w, h, n, len, col) {
  x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    let px = Math.random() * w, py = Math.random() * h, a = Math.random() * TAU;
    x.beginPath(); x.moveTo(px, py);
    const steps = randi(6, len);
    for (let k = 0; k < steps; k++) {
      a += rand(-.7, .7); px += Math.cos(a) * rand(6, 18); py += Math.sin(a) * rand(6, 18);
      x.lineTo(px, py);
    }
    x.strokeStyle = col; x.lineWidth = rand(.8, 2.4); x.stroke();
  }
}
const TEX = {};
TEX.asphalt = () => canvasTex(512, 512, (x, w, h) => {
  x.fillStyle = '#3a4047'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const cx = Math.random() * w, cy = Math.random() * h, r = rand(30, 120);
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    const l = Math.random() < .5;
    g.addColorStop(0, l ? 'rgba(120,128,136,.10)' : 'rgba(8,10,12,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  speckle(x, w, h, 7000, .16, '200,205,210', 1.6);
  speckle(x, w, h, 4000, .22, '0,0,0', 1.8);
  cracks(x, w, h, 12, 14, 'rgba(8,9,11,.8)');
  x.fillStyle = 'rgba(190,170,70,.22)'; x.fillRect(0, h * .46, w * .55, 7);
  x.fillStyle = 'rgba(190,170,70,.12)'; x.fillRect(w * .62, h * .46, w * .2, 7);
}, [40, 40]);
TEX.concrete = () => canvasTex(512, 512, (x, w, h) => {
  x.fillStyle = '#6a7078'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    const px = Math.random() * w, ww = rand(6, 40);
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(10,14,12,0)'); g.addColorStop(rand(.3, .7), 'rgba(10,14,12,' + rand(.05, .2).toFixed(2) + ')'); g.addColorStop(1, 'rgba(10,14,12,0)');
    x.fillStyle = g; x.fillRect(px, 0, ww, h);
  }
  speckle(x, w, h, 8000, .3, '230,235,240', 2.5);
  speckle(x, w, h, 6000, .3, '0,0,0', 3);
  x.strokeStyle = 'rgba(10,12,14,.55)'; x.lineWidth = 3;
  for (let y = 0; y <= h; y += 128) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
  for (let X = 0; X <= w; X += 256) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, h); x.stroke(); }
  cracks(x, w, h, 8, 12, 'rgba(8,9,11,.8)');
}, [1, 1]);
TEX.leaves = () => canvasTex(256, 512, (x, w, h) => {
  x.clearRect(0, 0, w, h);
  for (let v = 0; v < 7; v++) {
    let px = rand(20, w - 20), y = 0; x.strokeStyle = '#1b2a17'; x.lineWidth = rand(1.5, 3);
    x.beginPath(); x.moveTo(px, 0);
    const len = rand(h * .35, h * .95);
    while (y < len) { y += 10; px += rand(-4, 4); x.lineTo(px, y); if (Math.random() < .55) { x.fillStyle = pick(['#27431f', '#2f5a24', '#1f3719', '#3d6b2a']); x.beginPath(); x.ellipse(px + rand(-12, 12), y, rand(6, 11), rand(3, 6), rand(0, PI), 0, TAU); x.fill(); } }
    x.stroke();
  }
});
TEX.fence = () => canvasTex(128, 128, (x, w, h) => {
  x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(150,158,166,.95)'; x.lineWidth = 3;
  for (let i = -h; i < w + h; i += 22) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i + h, 0); x.lineTo(i, h); x.stroke(); }
}, [10, 2.5]);
TEX.crate = () => canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#6a5136'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(' + (i % 2 ? '0,0,0' : '255,220,170') + ',.08)'; x.fillRect(0, i * 43, w, 43); x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, i * 43, w, 3); }
  speckle(x, w, h, 2500, .3, '0,0,0', 3);
  x.strokeStyle = '#2f2418'; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16);
  x.beginPath(); x.moveTo(8, 8); x.lineTo(w - 8, h - 8); x.stroke();
});
TEX.glow = canvasTex(128, 128, (x) => {
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.22, 'rgba(255,255,255,.55)'); g.addColorStop(.6, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
}, null, false);

const _glowMats = {};
function glowSprite(color, size, opacity) {
  const key = color + '|' + (opacity || 1);
  if (!_glowMats[key]) _glowMats[key] = new THREE.SpriteMaterial({ map: TEX.glow, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: opacity || 1 });
  const s = new THREE.Sprite(_glowMats[key]); s.scale.set(size, size, 1); return s;
}

/* ================= Particles (GPU points) ================= */
class Particles {
  constructor(max, additive) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3); this.vel = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3); this.size = new Float32Array(max); this.alpha = new Float32Array(max);
    this.life = new Float32Array(max); this.ml = new Float32Array(max); this.grav = new Float32Array(max);
    this.drag = new Float32Array(max); this.s0 = new Float32Array(max); this.grow = new Float32Array(max); this.a0 = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    this.gp = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.gc = new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage);
    this.gs = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    this.ga = new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.gp); g.setAttribute('aColor', this.gc); g.setAttribute('aSize', this.gs); g.setAttribute('aAlpha', this.ga);
    g.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 600 }, uGlow: { value: additive ? 1 : 0 } },
      vertexShader: 'attribute vec3 aColor;attribute float aSize;attribute float aAlpha;varying vec3 vC;varying float vA;uniform float uScale;void main(){vC=aColor;vA=aAlpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=max(1.,aSize*uScale/(-mv.z));gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'varying vec3 vC;varying float vA;uniform float uGlow;void main(){float d=length(gl_PointCoord-.5)*2.;float a=1.-smoothstep(.0,1.,d);a*=a;gl_FragColor=vec4(vC*(1.+uGlow*a*1.5),a*vA);}',
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; this.points.renderOrder = 5;
    scene.add(this.points);
  }
  emit(x, y, z, vx, vy, vz, life, size, r, g, b, grav, drag, alpha, grow) {
    if (this.n >= this.max) return;
    const i = this.n++, i3 = i * 3;
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.col[i3] = r; this.col[i3 + 1] = g; this.col[i3 + 2] = b;
    this.life[i] = life; this.ml[i] = life; this.s0[i] = size; this.grav[i] = grav || 0; this.drag[i] = drag || 0;
    this.a0[i] = alpha === undefined ? 1 : alpha; this.grow[i] = grow || 0;
  }
  update(dt) {
    let i = 0;
    while (i < this.n) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        const l = --this.n;
        if (i !== l) {
          const i3 = i * 3, l3 = l * 3;
          for (let k = 0; k < 3; k++) { this.pos[i3 + k] = this.pos[l3 + k]; this.vel[i3 + k] = this.vel[l3 + k]; this.col[i3 + k] = this.col[l3 + k]; }
          this.life[i] = this.life[l]; this.ml[i] = this.ml[l]; this.s0[i] = this.s0[l]; this.grav[i] = this.grav[l];
          this.drag[i] = this.drag[l]; this.a0[i] = this.a0[l]; this.grow[i] = this.grow[l];
        }
        continue;
      }
      const i3 = i * 3, k = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i3] *= k; this.vel[i3 + 1] = this.vel[i3 + 1] * k - this.grav[i] * dt; this.vel[i3 + 2] *= k;
      this.pos[i3] += this.vel[i3] * dt; this.pos[i3 + 1] += this.vel[i3 + 1] * dt; this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      if (this.grav[i] > 0 && this.pos[i3 + 1] < 0.04) { this.pos[i3 + 1] = 0.04; this.vel[i3 + 1] *= -0.35; this.vel[i3] *= .7; this.vel[i3 + 2] *= .7; }
      const t = this.life[i] / this.ml[i];
      this.size[i] = this.s0[i] * (t * .6 + .4 + this.grow[i] * (1 - t));
      this.alpha[i] = this.a0[i] * Math.min(1, t * 2.2);
      i++;
    }
    this.points.geometry.setDrawRange(0, this.n);
    this.gp.needsUpdate = this.gc.needsUpdate = this.gs.needsUpdate = this.ga.needsUpdate = true;
  }
}
const fxAdd = new Particles(MOBILE ? 1600 : 3000, true);
const fxSmoke = new Particles(MOBILE ? 250 : 500, false);

function setParticleScale() {
  const s = (renderer.domElement.height / 2) / Math.tan(camera.fov * PI / 360);
  fxAdd.mat.uniforms.uScale.value = s; fxSmoke.mat.uniforms.uScale.value = s;
}

/* particle helpers (colors are 0..1 rgb arrays) */
const COL = {
  orange: [1, .55, .15], yellow: [1, .85, .35], cyan: [.2, .85, 1], white: [1, 1, 1], red: [1, .2, .1], gold: [1, .78, .2],
  green: [.5, 1, .3], blood: [.5, .08, .1], dust: [.34, .31, .28], violet: [.7, .35, 1]
};
let FXM = 1; // particle density multiplier (graphics quality)
function sparks(x, y, z, n, col, speed, life) {
  n = Math.ceil(n * FXM);
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), up = rand(.2, 1.2), sp = rand(.4, 1) * speed;
    fxAdd.emit(x, y, z, Math.cos(a) * sp, up * speed * .6, Math.sin(a) * sp, rand(.25, 1) * (life || .6), rand(.06, .16), col[0], col[1], col[2], 14, .6, 1);
  }
}
function puff(x, y, z, n, size, life, col, spread) {
  col = col || COL.dust; n = Math.ceil(n * FXM);
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), sp = rand(.2, 1) * (spread || 2);
    fxSmoke.emit(x + rand(-.3, .3), y, z + rand(-.3, .3), Math.cos(a) * sp, rand(.2, 1.4), Math.sin(a) * sp, rand(.5, 1) * life, size * rand(.7, 1.3), col[0], col[1], col[2], -.2, 1.6, .38, 1.6);
  }
}
function glowBurst(x, y, z, size, col, life) { fxAdd.emit(x, y, z, 0, 0, 0, life || .25, size, col[0], col[1], col[2], 0, 0, .9, .6); }

/* ================= Audio (tiny synth) ================= */
let AC = null, muted = false, _nbuf = null;
function audioInit() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      _nbuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
      const d = _nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { AC = null; }
}
function tone(type, f0, f1, dur, vol, delay) {
  if (!AC || muted) return;
  try {
    const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + .03);
  } catch (e) { }
}
function noiseHit(dur, vol, f0, f1) {
  if (!AC || muted || !_nbuf) return;
  try {
    const t = AC.currentTime, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = _nbuf; f.type = 'lowpass'; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
  } catch (e) { }
}
const _sfxT = {};
const SFXD = {
  shoot: () => tone('triangle', 900, 280, .09, .06), hit: () => noiseHit(.07, .12, 3500, 800), crit: () => { noiseHit(.12, .16, 5000, 600); tone('square', 1500, 700, .06, .04); },
  explode: () => { noiseHit(.8, .45, 1800, 60); tone('sine', 120, 30, .6, .25); }, coin: () => tone('sine', 1250, 1900, .07, .05),
  hurt: () => { tone('sawtooth', 240, 70, .22, .14); noiseHit(.12, .15, 1200, 200); }, dash: () => noiseHit(.2, .13, 4500, 500),
  nova: () => { noiseHit(.55, .3, 3500, 100); tone('sine', 220, 40, .55, .22); }, level: () => [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, .14, .09, i * .08)),
  buy: () => tone('square', 700, 1500, .09, .05), deny: () => tone('square', 160, 100, .1, .05), slam: () => { noiseHit(.4, .32, 700, 60); tone('sine', 90, 30, .35, .25); },
  spit: () => tone('sine', 420, 800, .12, .07), die: () => noiseHit(.25, .14, 1800, 200), boss: () => { tone('sawtooth', 70, 35, 1.2, .2); noiseHit(1, .2, 500, 50); },
  over: () => tone('sawtooth', 300, 40, 1.2, .18), pop: () => { noiseHit(.25, .18, 1600, 150); tone('sine', 160, 50, .2, .12); }, clang: () => { tone('square', 1800, 900, .08, .05); noiseHit(.05, .1, 5000, 2000); }, heal: () => tone('sine', 600, 1000, .25, .06), start: () => tone('triangle', 330, 660, .25, .08)
};
function sfx(n, minGap) {
  const now = performance.now(), g = minGap === undefined ? 40 : minGap;
  if (_sfxT[n] && now - _sfxT[n] < g) return;
  _sfxT[n] = now; if (SFXD[n]) SFXD[n]();
}
