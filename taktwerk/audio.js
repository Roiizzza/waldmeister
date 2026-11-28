// Procedural Web Audio sound engine for Taktwerk (zero external files).
export class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.noiseBuf = null;
    this.lastWrench = 0;
    this.lastWeld = 0;
  }

  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.25, this.ctx.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    } catch {}
  }

  ready() {
    return this.enabled && this.ctx && this.ctx.state === 'running';
  }

  tone(freq, dur = 0.09, type = 'triangle', gain = 0.03, freqEnd = null, delay = 0) {
    if (!this.ready()) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  }

  noise(dur = 0.08, bandHz = 2200, q = 2, gain = 0.035) {
    if (!this.ready() || !this.noiseBuf) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const flt = this.ctx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.value = bandHz;
    flt.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(flt);
    flt.connect(g);
    g.connect(this.ctx.destination);
    src.start(t);
    src.stop(t + dur + 0.01);
  }

  click() {
    this.tone(420, 0.045, 'triangle', 0.022, 540);
  }

  wrench(nowMs) {
    if (!this.ready() || nowMs - this.lastWrench < 85) return;
    this.lastWrench = nowMs;
    this.tone(240 + Math.random() * 55, 0.04, 'sawtooth', 0.018, 120);
    this.noise(0.03, 1800, 3.2, 0.02);
  }

  weld(nowMs) {
    if (!this.ready() || nowMs - this.lastWeld < 70) return;
    this.lastWeld = nowMs;
    this.noise(0.065, 3400 + Math.random() * 1400, 1.4, 0.028);
    this.tone(110 + Math.random() * 40, 0.05, 'sawtooth', 0.012);
  }

  fit() {
    this.tone(175, 0.09, 'sine', 0.045, 78);
    this.tone(520, 0.07, 'triangle', 0.028, 640, 0.035);
  }

  testPass(perfect = false) {
    this.tone(580, 0.09, 'triangle', 0.032, 620);
    this.tone(perfect ? 980 : 780, 0.13, 'triangle', 0.032, perfect ? 1080 : 820, 0.08);
  }

  testFail() {
    this.tone(220, 0.14, 'sawtooth', 0.024, 150);
  }

  complete() {
    this.noise(0.07, 1500, 0.9, 0.022);
    this.tone(520, 0.08, 'triangle', 0.028, 560);
    this.tone(660, 0.11, 'triangle', 0.03, 700, 0.06);
  }

  build() {
    this.tone(140, 0.14, 'sine', 0.05, 95);
    this.tone(330, 0.12, 'triangle', 0.026, 360, 0.05);
    this.tone(495, 0.16, 'triangle', 0.028, 540, 0.11);
  }

  contract() {
    this.tone(440, 0.1, 'triangle', 0.03);
    this.tone(554, 0.1, 'triangle', 0.03, null, 0.08);
    this.tone(659, 0.18, 'triangle', 0.034, null, 0.16);
  }
}
