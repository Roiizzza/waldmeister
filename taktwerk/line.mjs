import {
  SPAN, GAP, DISPATCH, HALLS, BUILDINGS, RESEARCH, PAINTS, PERSONAL, STATION_UP, CITY_TIERS
} from './data.mjs';

export { SPAN, GAP, DISPATCH, HALLS, BUILDINGS, RESEARCH, PAINTS, PERSONAL, STATION_UP, CITY_TIERS };
export const specs = HALLS[0].specs;
export const personal = PERSONAL;
export const stationUp = STATION_UP;

const bounded = (x, hi) => Math.max(0, Math.min(hi, Math.floor(Number(x)) || 0));
const zeroOps = (hallSpec, i) => hallSpec.specs[i].ops.map(() => 0);

function makeStation(i) {
  return {
    open: i === 0,
    tool: 0,
    quality: 0,
    belt: 0,
    buffer: 0,
    staff: 0,
    robot: false,
    auto: false,
    program: null,
    programTime: 0,
    made: 0,
    reserve: 0,
    run: null,
    idle: 0,
    lastCycle: 0,
    cycleStart: 0
  };
}

export class AssemblyLine {
  constructor(hallDef, city) {
    this.def = hallDef;
    this.id = hallDef.id;
    this.specs = hallDef.specs;
    this.city = city;
    this.unlocked = hallDef.unlockCost === 0;
    this.paint = hallDef.defaultPaint || 'sage';
    this.stations = this.specs.map((_, i) => makeStation(i));
    this.sales = [];
    this.parts = [];
    this.exits = [];
    this.serial = 0;
    this.shipped = 0;
    this.record = null;
    this.make(0, 0);
    this.feed();
  }

  make(i, x) {
    const p = {
      id: ++this.serial,
      at: i,
      x,
      work: i < 4 ? zeroOps(this.def, i) : [],
      manual: false,
      precision: 0,
      born: this.city.time
    };
    this.parts.push(p);
    return p;
  }

  feed() {
    if (!this.unlocked) return;
    if (!this.parts.some(p => p.x < GAP - 0.001)) this.make(0, -3.8);
  }

  validProgram(i, p) {
    const ops = this.specs[i].ops;
    return Array.isArray(p) &&
      p.length === ops.length &&
      new Set(p.map(c => c?.j)).size === p.length &&
      p.every((c, k) =>
        Number.isInteger(c.j) &&
        ops[c.j] &&
        Number.isFinite(c.wait) &&
        c.wait >= 0 &&
        (!k || ops[c.j].phase >= ops[p[k - 1].j].phase)
      );
  }

  loadData(v, legacyModern = true) {
    if (!v || !Array.isArray(v.states) || v.states.length !== 4) return;
    this.unlocked = v.unlocked !== undefined ? !!v.unlocked : this.def.unlockCost === 0;
    if (PAINTS.some(c => c.id === v.paint)) this.paint = v.paint;
    if (Array.isArray(v.sales)) {
      this.sales = v.sales.filter(p => p && Number.isFinite(p.x) && p.at >= 1 && p.at <= 3 && p.z > -9);
    }
    this.serial = bounded(v.serial, 1e12);
    this.shipped = bounded(v.shipped, 1e10);
    this.parts = [];
    this.stations.forEach((s, i) => {
      const old = v.states[i] || {};
      s.open = i === 0 || (this.stations[i - 1].open && !!old.open);
      for (const [k, u] of Object.entries(STATION_UP)) s[k] = bounded(old[k], u[3]);
      s.robot = !!old.robot;
      s.made = bounded(old.made, 1e10);
      s.reserve = bounded(legacyModern ? old.reserve : i < 3 ? old.stock : 0, 1e10);
      s.programTime = Number.isFinite(old.programTime) ? Math.max(0, old.programTime) : 0;
      s.lastCycle = Number.isFinite(old.lastCycle) ? Math.max(0, old.lastCycle) : 0;
      if (legacyModern && this.validProgram(i, old.program)) {
        s.program = old.program;
        s.auto = s.robot && !!old.auto;
      }
      if (!legacyModern && s.robot && old.program?.length === 3) {
        s.program = this.specs[i].ops.map((_, j) => ({
          j,
          wait: Number(old.program[Math.min(2, this.specs[i].ops[j].phase)]?.wait) || 0
        }));
        s.auto = !!old.auto;
      }
      if (!legacyModern && s.open && old.step > 0) {
        const p = this.make(i, i * SPAN);
        p.work = p.work.map((_, j) => (j < Math.min(old.step, this.specs[i].ops.length - 1) ? 1 : 0));
        p.manual = true;
      }
    });
    if (legacyModern && Array.isArray(v.parts)) {
      for (const a of v.parts) {
        if (!Number.isInteger(a.at) || a.at < 0 || a.at > 4 || !Number.isFinite(a.x)) continue;
        const p = this.make(a.at, Math.min(a.at * SPAN, Math.max(-4, a.x)));
        if (Number.isSafeInteger(a.id) && a.id > 0) {
          p.id = a.id;
          this.serial = Math.max(this.serial, a.id);
        }
        p.work = p.work.map((_, j) => Math.max(0, Math.min(1, Number(a.work?.[j]) || 0)));
        p.manual = !!a.manual;
        p.precision = Number(a.precision) || 0;
      }
    } else if (!legacyModern) {
      this.shipped = bounded(v.states[3]?.stock, 1e10);
    }
    if (!this.parts.length) this.make(0, 0);
    this.feed();
  }

  snapshot() {
    return {
      unlocked: this.unlocked,
      paint: this.paint,
      serial: this.serial,
      shipped: this.shipped,
      sales: this.sales,
      parts: this.parts,
      states: this.stations.map(({ run, idle, cycleStart, ...s }) => s)
    };
  }

  dock(i) {
    return this.parts.find(p => p.at === i && p.x >= i * SPAN - 0.001);
  }

  capacity(i) {
    const syncBonus = this.city.research.syncDrive ? 1 : 0;
    return 4 + this.stations[i].buffer + syncBonus;
  }

  outgoing(i) {
    return this.parts.filter(p => p.at === i + 1);
  }

  blocked(i) {
    return this.outgoing(i).length >= this.capacity(i);
  }

  available(i, p = this.dock(i)) {
    if (!p) return [];
    const ops = this.specs[i].ops;
    const phase = ops.find((_, j) => p.work[j] < 1)?.phase;
    return ops.map((o, j) => (o.phase === phase && p.work[j] < 1 ? j : -1)).filter(j => j >= 0);
  }

  status(i) {
    const s = this.stations[i];
    if (!s.open) return 'locked';
    if (this.record?.i === i) return 'recording';
    const p = this.dock(i);
    if (p && p.work.every(n => n >= 1) && this.blocked(i)) return 'blocked';
    if (!p) return i > 0 && !this.outgoing(i - 1).length ? 'starved' : 'waiting';
    if (s.run) return 'running';
    if (s.auto) return 'running';
    return 'idle';
  }

  estTakt(i) {
    const s = this.stations[i];
    if (s.lastCycle > 0.2) return s.lastCycle;
    const base = this.specs[i].ops.reduce((sum, o) => sum + o.seconds, 0);
    const speed = (1 + s.tool * 0.2) * (s.auto ? this.city.robotSpeedMult() : 1 + this.city.player.skill * 0.17);
    return base / Math.max(0.5, speed);
  }

  price(i, k) {
    const disc = this.city.costDiscount();
    if (PERSONAL[k]) return Math.max(10, Math.ceil(PERSONAL[k][2] * 1.8 ** this.city.player[k] * disc));
    if (k === 'open' || k === 'robot') return Math.max(10, Math.ceil(this.specs[i][k] * disc));
    return Math.max(10, Math.ceil(this.specs[i].pay * STATION_UP[k][2] * 1.6 ** this.stations[i][k] * disc));
  }

  reward(i, manual, precision = 0) {
    const s = this.stations[i];
    const cityMult = this.city.valueMultiplier(this.paint, i === 3);
    const precMult = precision > 0 ? 1 + precision * (this.city.research.laserGauge ? 0.22 : 0.12) : 1;
    return Math.round(
      this.specs[i].pay *
      (1 + s.quality * 0.30) *
      (1 + (manual ? this.city.player.bonus * 0.12 : 0)) *
      cityMult *
      precMult
    );
  }

  teach(i) {
    const s = this.stations[i];
    const p = this.dock(i);
    if (!this.unlocked || !s.robot || !p || p.work.some(Boolean) || this.record || s.run) return false;
    s.auto = false;
    this.record = { i, cues: [], last: this.city.time, start: this.city.time };
    this.city.changed++;
    return true;
  }

  begin(i, j, who = 'player') {
    const s = this.stations[i];
    const p = this.dock(i);
    if (!this.unlocked || !s.open || !p || s.run || !this.available(i, p).includes(j) || (who === 'player' && s.auto)) return false;
    const pwr = who === 'player' ? 1 : this.city.powerEfficiency();
    const whoSpeed = who === 'player'
      ? 1 + this.city.player.skill * 0.17
      : who === 'worker'
        ? (0.60 + s.staff * 0.17) * this.city.teamSpeedMult()
        : this.city.robotSpeedMult();
    const speed = (1 + s.tool * 0.2) * whoSpeed * pwr;
    if (!p.work.some(Boolean)) s.cycleStart = this.city.time;
    s.run = {
      j,
      who,
      seconds: this.specs[i].ops[j].seconds / Math.max(0.25, speed),
      drag: 0,
      wait: this.record?.i === i ? Math.max(0, this.city.time - this.record.last) : 0
    };
    return true;
  }

  testWindow() {
    return this.city.research.laserGauge ? [0.55, 0.92] : [0.61, 0.86];
  }

  release(i, fitValid = false) {
    const s = this.stations[i];
    const r = s.run;
    if (r?.who !== 'player') return { pass: false, perfect: false };
    const kind = this.specs[i].ops[r.j].kind;
    const [lo, hi] = this.testWindow();
    const mid = (lo + hi) * 0.5;
    const pass = kind === 'test' && r.reading >= lo && r.reading <= hi;
    const perfect = pass && Math.abs(r.reading - mid) <= 0.045;
    if ((fitValid && kind === 'fit') || pass) {
      if (perfect) {
        const p = this.dock(i);
        if (p) p.precision = (p.precision || 0) + 1;
        this.city.reputation += 1;
      }
      this.completeOp(i);
    } else {
      s.run = null;
    }
    return { pass, perfect };
  }

  completeOp(i) {
    const s = this.stations[i];
    const r = s.run;
    const p = this.dock(i);
    if (!r || !p) return;
    p.work[r.j] = 1;
    if (r.who === 'player') p.manual = true;
    if (this.record?.i === i) {
      this.record.cues.push({ j: r.j, wait: Math.min(2.5, r.wait) });
      this.record.last = this.city.time;
    }
    s.run = null;
    s.idle = 0;
    this.city.changed++;
  }

  sellSpare(i) {
    if (i >= 3) return false;
    const p = this.outgoing(i)
      .filter(p => p.x > (i + 1) * SPAN - 7 * GAP && p.x < (i + 1) * SPAN - 0.1)
      .sort((a, b) => b.x - a.x)[0];
    if (!p || p.work.some(Boolean) || this.sales.some(s => Math.abs(s.x - p.x) < GAP)) return false;
    this.parts = this.parts.filter(a => a !== p);
    this.sales.push({ ...p, z: 0 });
    this.city.money += Math.round(this.specs[i].pay * 0.45 * this.city.valueMultiplier(this.paint, false));
    this.city.changed++;
    return true;
  }

  automateStation(i) {
    const s = this.stations[i];
    s.open = true;
    s.robot = true;
    s.program = this.specs[i].ops.map((_, j) => ({ j, wait: 0.05 }));
    s.programTime = Number((this.specs[i].ops.reduce((a, o) => a + o.seconds, 0) * 0.65).toFixed(1));
    s.auto = true;
    s.run = null;
    s.idle = 0;
    this.city.changed++;
  }

  advance(dt, play = true) {
    const events = [];
    if (!this.unlocked) return events;
    const pwr = this.city.powerEfficiency();
    const beltBonus = 1 + this.city.buildings.presswerk * 0.15 + (this.city.research.syncDrive ? 0.30 : 0);

    this.sales.forEach(p => { p.z -= dt * 2.8; });
    this.sales = this.sales.filter(p => p.z > -8);

    this.exits.forEach(e => { e.x += dt * 11.5; });
    this.exits = this.exits.filter(e => e.x < DISPATCH + 22);

    this.parts.sort((a, b) => b.x - a.x || b.at - a.at || a.id - b.id);
    let leader = Infinity;
    for (const p of this.parts) {
      const dock = p.at * SPAN;
      const open = p.at === 4 || this.stations[p.at].open;
      const stop = Math.min(dock - (open ? 0 : GAP), leader - GAP);
      const speed = (2.65 + 1.05 * this.stations[Math.max(0, p.at - 1)].belt) * beltBonus * pwr;
      if (p.x < stop) p.x = Math.min(stop, p.x + dt * speed);
      leader = p.x;
    }

    this.parts = this.parts.filter(p => {
      if (p.at === 4 && p.x >= DISPATCH - 0.001) {
        this.shipped++;
        this.exits.push({ id: p.id, x: DISPATCH - 1.5, paint: this.paint });
        const cityBonus = this.city.onVehicleShipped(this.id, this.paint);
        events.push({ hall: this.id, type: 'shipped', i: 3, bonus: cityBonus });
        this.city.changed++;
        return false;
      }
      return true;
    });

    this.stations.forEach((s, i) => {
      if (s.reserve && i < 3 && !this.blocked(i) && !this.parts.some(p => Math.abs(p.x - (i * SPAN + GAP)) < GAP)) {
        this.make(i + 1, i * SPAN + GAP);
        s.reserve--;
        this.city.changed++;
      }
      // Automatic logistics overflow export when Logistik-Hub >= Lv 2
      if (i < 3 && this.city.buildings.logistik >= 2 && this.blocked(i) && !this.stations[i + 1].open) {
        this.sellSpare(i);
      }
      const p = this.dock(i);
      if (!s.open || !p) return;
      if (p.work.every(n => n >= 1)) {
        if (this.blocked(i)) return;
        const pay = this.reward(i, p.manual, p.precision);
        this.city.money += pay;
        s.made++;
        if (s.cycleStart > 0) {
          const cyc = Math.max(0.5, this.city.time - s.cycleStart);
          s.lastCycle = s.lastCycle ? s.lastCycle * 0.55 + cyc * 0.45 : cyc;
        }
        p.at++;
        p.work = p.at < 4 ? zeroOps(this.def, p.at) : [];
        p.manual = false;
        p.precision = 0;
        s.idle = 0;
        if (this.record?.i === i) {
          s.program = this.record.cues;
          s.programTime = Number(Math.max(0.5, this.city.time - this.record.start).toFixed(1));
          s.auto = true;
          this.record = null;
        }
        this.city.changed++;
        events.push({ hall: this.id, type: 'stage', i, pay });
        return;
      }
      if (!s.run) {
        const options = this.available(i, p);
        if (s.auto && s.program) {
          const cue = s.program.find(c => options.includes(c.j));
          if (cue && (s.idle += dt) >= cue.wait) this.begin(i, cue.j, 'robot');
        } else if (s.staff && p.manual && !this.record && (s.idle += dt) > 0.85) {
          this.begin(i, options[0], 'worker');
        }
      }
      const r = s.run;
      if (!r || (r.who === 'player' && !play)) return;
      if (r.who === 'player' && this.specs[i].ops[r.j].kind === 'fit') return;
      if (r.who === 'player' && this.specs[i].ops[r.j].kind === 'test') {
        r.elapsed = (r.elapsed || 0) + dt;
        r.reading = 1 - Math.abs((r.elapsed / (r.seconds * 1.65)) % 2 - 1);
        return;
      }
      p.work[r.j] = Math.min(1, p.work[r.j] + dt / r.seconds);
      if (p.work[r.j] >= 1) this.completeOp(i);
    });
    this.feed();
    return events;
  }
}

export class CitySim {
  constructor(saved) {
    this.money = 0;
    this.reputation = 0;
    this.time = 0;
    this.changed = 0;
    this.simSpeed = 1;
    this.activeHallId = HALLS[0].id;
    this.player = { pace: 0, skill: 0, bonus: 0 };
    this.buildings = Object.fromEntries(BUILDINGS.map(b => [b.id, 0]));
    this.research = Object.fromEntries(RESEARCH.map(r => [r.id, false]));
    this.unlockedPaints = { sage: true };
    this.contracts = [];
    this.contractsDone = 0;
    this.contractSeq = 1;
    this.cityVehicles = [];

    this.halls = HALLS.map(h => new AssemblyLine(h, this));
    this.hallMap = Object.fromEntries(this.halls.map(h => [h.id, h]));

    if (saved) this.load(saved);
    this.ensureContracts();
  }

  get activeHall() {
    return this.hallMap[this.activeHallId] || this.halls[0];
  }

  setActiveHall(id) {
    if (this.hallMap[id] && this.hallMap[id].unlocked) {
      this.activeHallId = id;
      this.changed++;
      return true;
    }
    return false;
  }

  totalShipped() {
    return this.halls.reduce((sum, h) => sum + h.shipped, 0);
  }

  population() {
    const workers = this.halls.reduce((sum, h) => sum + h.stations.reduce((a, s) => a + s.staff * 8 + (s.open ? 6 : 0), 0), 0);
    return 12 + workers + this.buildings.wohnviertel * 120;
  }

  powerCap() {
    return 5 + this.buildings.kraftwerk * 8;
  }

  powerUsed() {
    let mw = 0;
    for (const h of this.halls) {
      if (!h.unlocked) continue;
      mw += h.def.power;
      mw += h.stations.filter(s => s.robot).length * 0.5;
    }
    mw += Object.values(this.buildings).reduce((a, lv) => a + (lv > 0 ? lv * 0.5 : 0), 0) - this.buildings.kraftwerk * 0.5;
    if (this.research.smartCity) mw *= 0.75;
    return Math.round(mw * 10) / 10;
  }

  powerEfficiency() {
    const cap = this.powerCap();
    const used = this.powerUsed();
    if (used <= cap) return 1;
    return Math.max(0.5, cap / used);
  }

  costDiscount() {
    return Math.max(0.7, 1 - this.buildings.wohnviertel * 0.05);
  }

  teamSpeedMult() {
    return 1 + this.buildings.akademie * 0.15;
  }

  robotSpeedMult() {
    return 1.08 * (1 + this.buildings.akademie * 0.15) * (this.research.multiGripper ? 1.28 : 1);
  }

  valueMultiplier(paintId, isDispatch = false) {
    const paint = PAINTS.find(p => p.id === paintId) || PAINTS[0];
    const paintBonus = this.buildings.lackiererei > 0 ? paint.bonus + this.buildings.lackiererei * 0.18 : 0;
    const pressBonus = this.buildings.presswerk * 0.12;
    const battBonus = this.buildings.batteriewerk * 0.16;
    const logBonus = isDispatch ? this.buildings.logistik * 0.20 : 0;
    const repBonus = Math.min(1.5, this.reputation * 0.015);
    const railBonus = isDispatch && this.research.railLink ? 0.30 : 0;
    const smartBonus = this.research.smartCity ? 0.35 : 0;
    return 1 + paintBonus + pressBonus + battBonus + logBonus + repBonus + railBonus + smartBonus;
  }

  cityScore() {
    const hallsOpen = this.halls.filter(h => h.unlocked).length - 1;
    const bLevels = Object.values(this.buildings).reduce((a, b) => a + b, 0);
    const rCount = Object.values(this.research).filter(Boolean).length;
    const robots = this.halls.reduce((sum, h) => sum + h.stations.filter(s => s.robot).length, 0);
    return hallsOpen * 3 + bLevels + rCount * 2 + Math.floor(robots / 2);
  }

  cityTier() {
    const score = this.cityScore();
    let cur = CITY_TIERS[0];
    for (const t of CITY_TIERS) if (score >= t.minScore) cur = t;
    return cur;
  }

  buildingPrice(id) {
    const def = BUILDINGS.find(b => b.id === id);
    if (!def) return Infinity;
    const lv = this.buildings[id] || 0;
    return Math.ceil(def.baseCost * (def.mult ** lv) * this.costDiscount());
  }

  hallPrice(id) {
    const def = HALLS.find(h => h.id === id);
    if (!def) return Infinity;
    return Math.ceil(def.unlockCost * this.costDiscount());
  }

  canUnlockHall(id) {
    const h = this.hallMap[id];
    if (!h || h.unlocked) return { ok: false, reason: 'Bereits gebaut' };
    for (const req of h.def.requires) {
      if ((this.buildings[req] || 0) < 1) {
        const b = BUILDINGS.find(x => x.id === req);
        return { ok: false, reason: 'Benötigt ' + (b?.short || req) };
      }
    }
    const cost = this.hallPrice(id);
    if (this.money < cost) return { ok: false, reason: 'Zu wenig Geld' };
    return { ok: true, reason: '' };
  }

  unlockHall(id) {
    const check = this.canUnlockHall(id);
    if (!check.ok) return false;
    this.money -= this.hallPrice(id);
    this.hallMap[id].unlocked = true;
    this.hallMap[id].feed();
    this.reputation += 4;
    this.ensureContracts();
    this.changed++;
    return true;
  }

  buyBuilding(id) {
    const def = BUILDINGS.find(b => b.id === id);
    if (!def) return false;
    const lv = this.buildings[id] || 0;
    if (lv >= def.max) return false;
    const cost = this.buildingPrice(id);
    if (this.money < cost) return false;
    this.money -= cost;
    this.buildings[id] = lv + 1;
    this.reputation += 2;
    this.changed++;
    return true;
  }

  buyResearch(id) {
    const def = RESEARCH.find(r => r.id === id);
    if (!def || this.research[id]) return false;
    if (def.requires && (this.buildings[def.requires] || 0) < 1) return false;
    const cost = Math.ceil(def.cost * this.costDiscount());
    if (this.money < cost) return false;
    this.money -= cost;
    this.research[id] = true;
    this.reputation += 3;
    this.changed++;
    return true;
  }

  buyPaint(hallId, paintId) {
    if (this.buildings.lackiererei < 1) return false;
    const paint = PAINTS.find(p => p.id === paintId);
    const hall = this.hallMap[hallId];
    if (!paint || !hall) return false;
    if (!this.unlockedPaints[paintId]) {
      const cost = Math.ceil(paint.cost * this.costDiscount());
      if (this.money < cost) return false;
      this.money -= cost;
      this.unlockedPaints[paintId] = true;
    }
    hall.paint = paintId;
    this.changed++;
    return true;
  }

  buyStationOp(hallId, i, k) {
    const hall = this.hallMap[hallId];
    if (!hall || !hall.unlocked) return false;
    const s = hall.stations[i];
    if (PERSONAL[k]) {
      if (this.player[k] >= 5) return false;
      const cost = hall.price(i, k);
      if (this.money < cost) return false;
      this.money -= cost;
      this.player[k]++;
      this.changed++;
      return true;
    }
    if (k === 'open') {
      if (s.open || !hall.stations[i - 1]?.open) return false;
    } else {
      if (!s.open) return false;
      if (k === 'robot') {
        if (s.robot) return false;
      } else if (!STATION_UP[k] || s[k] >= STATION_UP[k][3]) {
        return false;
      }
    }
    const cost = hall.price(i, k);
    if (this.money < cost) return false;
    this.money -= cost;
    if (k === 'open' || k === 'robot') s[k] = true;
    else s[k]++;
    this.changed++;
    return true;
  }

  copyBlueprint(fromHallId, stationIdx, toHallId) {
    if (!this.research.blueprints) return false;
    const src = this.hallMap[fromHallId]?.stations[stationIdx];
    const dst = this.hallMap[toHallId]?.stations[stationIdx];
    if (!src?.program || !dst?.open || !dst?.robot) return false;
    dst.program = src.program.map(c => ({ j: c.j, wait: c.wait }));
    dst.programTime = src.programTime;
    dst.auto = true;
    dst.run = null;
    dst.idle = 0;
    this.changed++;
    return true;
  }

  // ---- Contracts ----
  ensureContracts() {
    const openHalls = this.halls.filter(h => h.unlocked);
    const maxContracts = 3;
    while (this.contracts.length < maxContracts) {
      const h = openHalls[Math.floor(Math.random() * openHalls.length)];
      const tier = Math.min(5, Math.floor(this.contractsDone / 3) + 1);
      const target = Math.max(2, Math.min(18, 2 + tier * 2 + Math.floor(Math.random() * 3)));
      const needPaint = this.buildings.lackiererei > 0 && Math.random() < 0.45
        ? PAINTS[Math.floor(Math.random() * Math.min(PAINTS.length, 2 + this.buildings.lackiererei))].id
        : null;
      const baseVal = h.specs[3].pay * target * (needPaint ? 2.4 : 1.75);
      const clients = ['Stadtwerke', 'Hafenlogistik', 'Autohaus Nord', 'Express-Flotte', 'Konzern-Fuhrpark', 'ÖPNV-Direktion'];
      const client = clients[(this.contractSeq + h.specs[0].pay) % clients.length];
      this.contracts.push({
        id: this.contractSeq++,
        title: client + ' · ' + h.def.short,
        hallId: h.id,
        paint: needPaint,
        target,
        progress: 0,
        reward: Math.round(baseVal * (1 + this.reputation * 0.01)),
        rep: 2 + tier
      });
    }
  }

  onVehicleShipped(hallId, paint) {
    let bonus = 0;
    // Wohnviertel passive city revenue per shipped vehicle
    if (this.buildings.wohnviertel > 0) {
      const cityTax = Math.round(this.hallMap[hallId].specs[3].pay * 0.12 * this.buildings.wohnviertel);
      this.money += cityTax;
      bonus += cityTax;
    }
    this.reputation += 0.25;
    for (let i = 0; i < this.contracts.length; i++) {
      const c = this.contracts[i];
      if (c.hallId !== hallId) continue;
      if (c.paint && c.paint !== paint) continue;
      c.progress++;
      if (c.progress >= c.target) {
        this.money += c.reward;
        this.reputation += c.rep;
        this.contractsDone++;
        bonus += c.reward;
        this.contracts.splice(i, 1);
        this.ensureContracts();
      }
      break;
    }
    return bonus;
  }

  // ---- Main Simulation Tick ----
  advance(dt, play = true) {
    const step = dt * this.simSpeed;
    this.time += play ? step : 0;
    const allEvents = [];
    for (const hall of this.halls) {
      if (!hall.unlocked) continue;
      const ev = hall.advance(step, play && hall.id === this.activeHallId);
      for (const e of ev) allEvents.push(e);
    }
    return allEvents;
  }

  // ---- Serialization (100% compatible with v1/v2 saves) ----
  load(v) {
    if (!v || typeof v !== 'object') return;
    if (v.version === 3 && v.halls) {
      this.money = bounded(v.money, 1e13);
      this.reputation = Math.max(0, Number(v.reputation) || 0);
      this.contractsDone = bounded(v.contractsDone, 1e8);
      this.contractSeq = Math.max(1, bounded(v.contractSeq, 1e8));
      this.simSpeed = [1, 2, 5, 10].includes(v.simSpeed) ? v.simSpeed : 1;
      for (const k in this.player) this.player[k] = bounded(v.player?.[k], 5);
      for (const b of BUILDINGS) this.buildings[b.id] = bounded(v.buildings?.[b.id], b.max);
      for (const r of RESEARCH) this.research[r.id] = !!v.research?.[r.id];
      if (v.unlockedPaints && typeof v.unlockedPaints === 'object') {
        this.unlockedPaints = { sage: true, ...v.unlockedPaints };
      }
      for (const hall of this.halls) {
        if (v.halls[hall.id]) hall.loadData(v.halls[hall.id], true);
      }
      if (v.activeHallId && this.hallMap[v.activeHallId]?.unlocked) {
        this.activeHallId = v.activeHallId;
      }
      if (Array.isArray(v.contracts)) {
        this.contracts = v.contracts.filter(c => c && this.hallMap[c.hallId] && c.target > 0).slice(0, 3);
      }
      return;
    }
    // Legacy v1 / v2 migration into Werk I (kompakt)
    if (Array.isArray(v.states) && v.states.length === 4) {
      this.money = bounded(v.money, 1e12);
      for (const k in this.player) this.player[k] = bounded(v.player?.[k], 5);
      const modern = v.version === 2;
      this.halls[0].loadData(v, modern);
      this.reputation = Math.floor(this.halls[0].shipped * 0.5);
    }
  }

  snapshot() {
    return {
      version: 3,
      money: Math.floor(this.money),
      reputation: Math.round(this.reputation * 10) / 10,
      simSpeed: this.simSpeed,
      activeHallId: this.activeHallId,
      player: this.player,
      buildings: this.buildings,
      research: this.research,
      unlockedPaints: this.unlockedPaints,
      contracts: this.contracts,
      contractsDone: this.contractsDone,
      contractSeq: this.contractSeq,
      halls: Object.fromEntries(this.halls.map(h => [h.id, h.snapshot()]))
    };
  }

  // ---- Admin Actions ----
  adminSetMoney(amount) {
    this.money = Math.max(0, Math.min(1e12, Math.floor(Number(amount) || 0)));
    this.changed++;
  }

  adminAddMoney(delta) {
    this.adminSetMoney(this.money + delta);
  }

  adminSetReputation(val) {
    this.reputation = Math.max(0, Math.min(1e6, Number(val) || 0));
    this.changed++;
  }

  adminUnlockAllHalls() {
    for (const h of this.halls) {
      h.unlocked = true;
      h.stations.forEach(s => { s.open = true; });
      h.feed();
    }
    this.ensureContracts();
    this.changed++;
  }

  adminBuildAllCity(maxLevel = false) {
    for (const b of BUILDINGS) {
      this.buildings[b.id] = maxLevel ? b.max : Math.max(1, this.buildings[b.id]);
    }
    for (const p of PAINTS) this.unlockedPaints[p.id] = true;
    this.changed++;
  }

  adminUnlockResearch() {
    for (const r of RESEARCH) this.research[r.id] = true;
    this.changed++;
  }

  adminMaxPlayer() {
    for (const k in this.player) this.player[k] = 5;
    this.changed++;
  }

  adminAutomateHall(hallId, upgradeAll = false) {
    const h = this.hallMap[hallId];
    if (!h) return;
    h.unlocked = true;
    h.stations.forEach((s, i) => {
      if (upgradeAll) {
        for (const [k, u] of Object.entries(STATION_UP)) s[k] = u[3];
      }
      h.automateStation(i);
    });
    h.feed();
    this.changed++;
  }

  adminSandboxFullCity() {
    this.adminAddMoney(500000);
    this.adminBuildAllCity(true);
    this.adminUnlockResearch();
    this.adminMaxPlayer();
    this.adminUnlockAllHalls();
    for (const h of this.halls) this.adminAutomateHall(h.id, true);
    this.reputation = Math.max(this.reputation, 60);
    this.changed++;
  }
}

export const Line = CitySim;
