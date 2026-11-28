import {
  CitySim, HALLS, BUILDINGS, RESEARCH, PAINTS, PERSONAL, STATION_UP, CITY_TIERS, SPAN
} from './line.mjs';
import { world } from './world.js';
import { SoundEngine } from './audio.js';

const SAVE_KEY = 'taktwerk.montage.v1';
const AUDIO_KEY = 'taktwerk.audio.v1';
const $ = s => document.querySelector(s);
const eur = n => Math.floor(n).toLocaleString('de-DE') + ' €';
const fmtNum = n => Math.floor(n).toLocaleString('de-DE');
const fmtTakt = s => (s > 0.2 ? s.toFixed(1).replace('.', ',') + ' s/Stk' : '—');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function readSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  } catch {
    return null;
  }
}

let game = new CitySim(readSave());
const room = world($('#viewport'));
const sound = new SoundEngine();

try {
  const savedAudio = localStorage.getItem(AUDIO_KEY);
  if (savedAudio === 'off') sound.enabled = false;
} catch {}

// DOM references
const el = {
  tierLabel: $('#tierLabel'),
  navHall: $('#navHall'),
  navCity: $('#navCity'),
  buildBtn: $('#buildBtn'),
  contractBtn: $('#contractBtn'),
  contractBadge: $('#contractBadge'),
  cash: $('#cash'),
  powerBox: $('#powerBox'),
  power: $('#power'),
  adminBtn: $('#adminBtn'),
  helpBtn: $('#helpBtn'),

  hallHud: $('#hallHud'),
  hallSelect: $('#hallSelect'),
  nr: $('#nr'),
  mode: $('#mode'),
  stName: $('#stName'),
  taktRow: $('#taktRow'),
  steps: $('#steps'),
  buf: $('#buf'),
  pay: $('#pay'),
  targets: $('#targets'),
  worktip: $('#worktip'),
  tip: $('#tip'),
  fill: $('#fill'),
  zone: $('#zone'),
  needle: $('#needle'),

  cityHud: $('#cityHud'),
  citySpeedTag: $('#citySpeedTag'),
  cityTitle: $('#cityTitle'),
  citySub: $('#citySub'),
  cityPop: $('#cityPop'),
  cityShipped: $('#cityShipped'),
  cityRep: $('#cityRep'),
  plotCard: $('#plotCard'),
  camZoomIn: $('#camZoomIn'),
  camZoomOut: $('#camZoomOut'),
  camRotate: $('#camRotate'),
  camReset: $('#camReset'),

  notice: $('#notice'),
  hint: $('#hint'),
  quickModeBtn: $('#quickModeBtn'),
  lineBtn: $('#lineBtn'),
  stick: $('#stick'),
  overlay: $('#overlay'),
  sheet: $('#sheet')
};

// App UI state
let sheetOpen = null; // null | 'build' | 'contracts' | 'admin' | 'help'
let buildTab = 'stations'; // 'stations' | 'city' | 'research' | 'player' | 'line'
let buildHallId = game.activeHallId;
let selectedPlot = null; // { type: 'hall'|'building', id: string, key: string }
let confirmReset = false;
let adminFeedback = { text: '', err: false };
let drag = null;
let holdWork = null;
let targetNodes = new Map();
let noticeTimer = 0;
let savedChange = -1;
let lastHudKey = '';
let lastStationKey = '';
let lastSelectKey = '';

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game.snapshot()));
    savedChange = game.changed;
  } catch {}
}

function say(msg) {
  el.notice.textContent = msg;
  el.notice.classList.add('show');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => el.notice.classList.remove('show'), 2600);
}

function replaceSimulation(rawObj) {
  drag = null;
  holdWork = null;
  selectedPlot = null;
  room.clearCitySelection();
  game = new CitySim(rawObj);
  buildHallId = game.activeHallId;
  saveGame();
  lastHudKey = '';
  lastStationKey = '';
  lastSelectKey = '';
  if (room.getMode() === 'hall') room.visit(0);
  syncHallSelect();
  updatePlotCard();
  if (sheetOpen) renderSheet();
}

function setMode(mode) {
  sound.unlock();
  sound.click();
  drag = null;
  holdWork = null;
  room.setMode(mode);
  el.hallHud.hidden = mode !== 'hall';
  el.cityHud.hidden = mode !== 'city';
  el.navHall.classList.toggle('active', mode === 'hall');
  el.navCity.classList.toggle('active', mode === 'city');
  el.quickModeBtn.textContent = mode === 'hall' ? 'Industriestadt' : 'Zur Montage';
  el.hint.textContent = mode === 'hall'
    ? 'WASD laufen · Maus ziehen umsehen · Halten/Ziehen am Bauteil · 1–4 Stationen · M Stadtansicht'
    : 'Klick Baufeld inspizieren · Ziehen verschieben · Rechtsklick/Q/E drehen · Mausrad zoomen · Doppelklick Halle betreten';
  if (mode === 'hall') {
    room.clearCitySelection();
    selectedPlot = null;
    el.plotCard.hidden = true;
    clearTargets();
    room.visit(room.nearest());
  } else {
    clearTargets();
    el.worktip.hidden = true;
    updatePlotCard();
  }
}

function enterHall(hallId, stationIdx = 0) {
  if (!game.setActiveHall(hallId)) return;
  buildHallId = hallId;
  setMode('hall');
  room.visit(stationIdx);
  saveGame();
  say(game.activeHall.def.name + ' betreten');
}

function openSheet(kind, tab = null) {
  sound.unlock();
  sound.click();
  if (tab) buildTab = tab;
  sheetOpen = kind;
  confirmReset = false;
  adminFeedback = { text: '', err: false };
  if (!game.hallMap[buildHallId]?.unlocked) buildHallId = game.activeHallId;
  el.overlay.hidden = false;
  renderSheet();
}

function closeSheet() {
  if (!sheetOpen) return;
  sheetOpen = null;
  confirmReset = false;
  el.overlay.hidden = true;
}

function clearTargets() {
  for (const node of targetNodes.values()) node.remove();
  targetNodes.clear();
}

function syncHallSelect() {
  const unlocked = game.halls.filter(h => h.unlocked);
  const key = unlocked.map(h => h.id).join(',') + '|' + game.activeHallId;
  if (key === lastSelectKey) return;
  lastSelectKey = key;
  el.hallSelect.innerHTML = unlocked
    .map(h => `<option value="${h.id}"${h.id === game.activeHallId ? ' selected' : ''}>${esc(h.def.code + ' · ' + h.def.short)}</option>`)
    .join('');
}

function statusMeta(st) {
  switch (st) {
    case 'running': return { label: 'Läuft', cls: 'ok' };
    case 'recording': return { label: 'Aufnahme', cls: 'warn' };
    case 'blocked': return { label: 'Stau am Ausgang', cls: 'bad' };
    case 'starved': return { label: 'Wartet auf Zulauf', cls: 'warn' };
    case 'waiting': return { label: 'Teil rollt an', cls: '' };
    case 'locked': return { label: 'Gesperrt', cls: '' };
    default: return { label: 'Bereit', cls: '' };
  }
}

// =========================================================================
// CITY PLOT INSPECTOR
// =========================================================================
function updatePlotCard() {
  if (room.getMode() !== 'city' || !selectedPlot) {
    el.plotCard.hidden = true;
    return;
  }
  el.plotCard.hidden = false;
  if (selectedPlot.type === 'hall') {
    const hall = game.hallMap[selectedPlot.id];
    const def = hall.def;
    const openCount = hall.stations.filter(s => s.open).length;
    const autoCount = hall.stations.filter(s => s.auto).length;
    const paint = PAINTS.find(p => p.id === hall.paint) || PAINTS[0];
    const check = game.canUnlockHall(hall.id);
    const price = game.hallPrice(hall.id);
    const reqNames = def.requires.map(r => BUILDINGS.find(b => b.id === r)?.short || r).join(', ');

    el.plotCard.innerHTML = `
      <div class="plot-head">
        <div class="plot-title">
          <span class="st-badge">${esc(def.code)}</span>
          <h3>${esc(def.name)}</h3>
        </div>
        <button type="button" data-plot-act="close" aria-label="Schließen">×</button>
      </div>
      <p class="plot-desc">${esc(def.desc)}</p>
      <div class="plot-meta">
        <span>Status: ${hall.unlocked ? 'In Betrieb' : 'Freies Baufeld'}</span>
        <span>Strombedarf: ${def.power} MW</span>
        ${hall.unlocked
          ? `<span>Stationen: ${openCount}/4 · Roboter aktiv: ${autoCount}/4 · Ausgeliefert: ${fmtNum(hall.shipped)}</span><span>Lack: ${esc(paint.name)}</span>`
          : (reqNames ? `<span>Voraussetzung: ${esc(reqNames)}</span>` : '<span>Keine Voraussetzung</span>')
        }
      </div>
      <div class="plot-actions">
        ${hall.unlocked
          ? `<button type="button" class="primary" data-plot-act="enter" data-id="${hall.id}">Werkhalle betreten</button>
             <button type="button" data-plot-act="manageHall" data-id="${hall.id}">Stationen ausbauen</button>`
          : `<button type="button" class="primary" data-plot-act="unlockHall" data-id="${hall.id}" ${check.ok ? '' : 'disabled'}>
               Werkhalle errichten (${eur(price)})
             </button>
             ${!check.ok && check.reason ? `<span class="tag warn">${esc(check.reason)}</span>` : ''}`
        }
      </div>
    `;
    return;
  }

  const def = BUILDINGS.find(b => b.id === selectedPlot.id);
  const lv = game.buildings[def.id] || 0;
  const maxed = lv >= def.max;
  const price = game.buildingPrice(def.id);
  const canAfford = !maxed && game.money >= price;

  el.plotCard.innerHTML = `
    <div class="plot-head">
      <div class="plot-title">
        <span class="st-badge">${esc(def.category.toUpperCase())}</span>
        <h3>${esc(def.name)}</h3>
      </div>
      <button type="button" data-plot-act="close" aria-label="Schließen">×</button>
    </div>
    <p class="plot-desc">${esc(def.desc)}</p>
    <div class="plot-meta">
      <span>Stufe: ${lv} / ${def.max}</span>
      <span>${lv > 0 ? esc(def.effect(lv)) : 'Noch nicht errichtet'}</span>
      ${!maxed ? `<span>Nächste Stufe: ${esc(def.effect(lv + 1))}</span>` : '<span class="tag ok">Maximal ausgebaut</span>'}
    </div>
    <div class="plot-actions">
      ${!maxed
        ? `<button type="button" class="primary" data-plot-act="buyBuilding" data-id="${def.id}" ${canAfford ? '' : 'disabled'}>
             ${lv === 0 ? 'Errichten' : 'Ausbauen auf Stufe ' + (lv + 1)} (${eur(price)})
           </button>`
        : '<span class="tag ok">Vollständig ausgebaut</span>'
      }
      ${def.id === 'akademie' && lv > 0 ? '<button type="button" data-plot-act="openResearch">Forschung öffnen</button>' : ''}
      ${def.id === 'lackiererei' && lv > 0 ? '<button type="button" data-plot-act="openPaint">Lackierung wählen</button>' : ''}
    </div>
  `;
}

// =========================================================================
// SHEETS (AUSBAU, AUFTRÄGE, ADMIN, HANDBUCH)
// =========================================================================
function renderSheet() {
  if (!sheetOpen) return;
  if (sheetOpen === 'build') renderBuildSheet();
  else if (sheetOpen === 'contracts') renderContractsSheet();
  else if (sheetOpen === 'admin') renderAdminSheet();
  else if (sheetOpen === 'help') renderHelpSheet();
}

function renderBuildSheet() {
  const tabs = [
    ['stations', 'Stationen & Roboter'],
    ['city', 'Industriestadt'],
    ['research', 'Forschung'],
    ['player', 'Charakter'],
    ['line', 'Bandübersicht']
  ];
  let body = '';

  if (buildTab === 'stations') {
    const unlockedHalls = game.halls.filter(h => h.unlocked);
    if (!game.hallMap[buildHallId]?.unlocked) buildHallId = game.activeHallId;
    const hall = game.hallMap[buildHallId];

    // Hall selector bar
    body += `<div class="btn-row">` + unlockedHalls.map(h =>
      `<button type="button" class="${h.id === hall.id ? 'dark' : ''}" data-act="selectBuildHall" data-hall="${h.id}">${esc(h.def.code + ' · ' + h.def.short)}</button>`
    ).join('') + `</div>`;

    // Paint bar if Lackiererei built
    if (game.buildings.lackiererei > 0) {
      body += `<div class="paint-bar"><strong style="font-size:12px">Lackierung (${esc(hall.def.short)}):</strong>` +
        PAINTS.map(p => {
          const owned = !!game.unlockedPaints[p.id];
          const active = hall.paint === p.id;
          const cost = Math.ceil(p.cost * game.costDiscount());
          const disabled = !owned && game.money < cost;
          return `<button type="button" class="swatch ${active ? 'active' : ''}" data-act="paint" data-hall="${hall.id}" data-paint="${p.id}" ${disabled ? 'disabled' : ''}>
            <i style="background:${p.hex}"></i>${esc(p.name)}${owned ? (p.bonus ? ` (+${Math.round(p.bonus * 100)}%)` : '') : ` (${eur(cost)})`}
          </button>`;
        }).join('') + `</div>`;
    }

    // 4 Station cards
    body += `<div class="grid-wide">` + hall.specs.map((sp, i) => {
      const s = hall.stations[i];
      const st = statusMeta(hall.status(i));
      const canOpen = !s.open && (i === 0 || hall.stations[i - 1].open);
      const openCost = hall.price(i, 'open');
      const robCost = hall.price(i, 'robot');
      const takt = s.open ? fmtTakt(hall.estTakt(i)) : '—';

      // Check if another hall has a recorded blueprint for this station index
      const blueprintSrc = game.research.blueprints && s.open && s.robot
        ? game.halls.find(oh => oh.id !== hall.id && oh.stations[i].program)
        : null;

      let inner = '';
      if (!s.open) {
        inner = `<p class="desc">Bauteil: ${esc(sp.part)} · Grundprämie: ${eur(sp.pay)}</p>
          <div class="btn-row">
            <button type="button" class="primary" data-act="buyOp" data-hall="${hall.id}" data-i="${i}" data-k="open" ${canOpen && game.money >= openCost ? '' : 'disabled'}>
              Station freischalten (${eur(openCost)})
            </button>
          </div>`;
      } else {
        const upRows = Object.entries(STATION_UP).map(([k, [name, desc, , max]]) => {
          const lv = s[k];
          const cost = hall.price(i, k);
          return `<div class="up-row">
            <div><strong>${esc(name)} (${lv}/${max})</strong><small>${esc(desc)}</small></div>
            <button type="button" data-act="buyOp" data-hall="${hall.id}" data-i="${i}" data-k="${k}" ${lv < max && game.money >= cost ? '' : 'disabled'}>
              ${lv >= max ? 'Max' : eur(cost)}
            </button>
          </div>`;
        }).join('');

        let robRow = '';
        if (!s.robot) {
          robRow = `<div class="up-row">
            <div><strong>Industrieroboter</strong><small>Wiederholt deinen aufgenommenen Takt (+0,5 MW)</small></div>
            <button type="button" class="primary" data-act="buyOp" data-hall="${hall.id}" data-i="${i}" data-k="robot" ${game.money >= robCost ? '' : 'disabled'}>${eur(robCost)}</button>
          </div>`;
        } else {
          robRow = `<div class="up-row">
            <div><strong>Roboter ${s.auto ? '· Automatik aktiv' : s.program ? '· Pausiert' : '· Noch nicht angelernt'}</strong>
            <small>${s.programTime ? 'Aufnahme-Takt: ' + s.programTime.toFixed(1).replace('.', ',') + ' s' : 'Gehe zur Station & zeige einen Durchgang'}</small></div>
            <div style="display:flex;gap:4px">
              ${s.program ? `<button type="button" data-act="toggleAuto" data-hall="${hall.id}" data-i="${i}">${s.auto ? 'Pause' : 'Start'}</button>` : ''}
              <button type="button" data-act="teach" data-hall="${hall.id}" data-i="${i}">Anlernen</button>
              ${blueprintSrc ? `<button type="button" data-act="copyBlueprint" data-src="${blueprintSrc.id}" data-hall="${hall.id}" data-i="${i}" title="Programm von ${esc(blueprintSrc.def.code)} übernehmen">Vorlage</button>` : ''}
            </div>
          </div>`;
        }

        inner = `<div class="stat-line">Takt: ${takt} · Erlös: ${eur(hall.reward(i, false))} · Gefertigt: ${fmtNum(s.made)}</div>
          <div class="up-list">${upRows}${robRow}</div>
          <div class="btn-row">
            <button type="button" data-act="goto" data-hall="${hall.id}" data-i="${i}">Zur Station</button>
          </div>`;
      }

      return `<div class="panel-card ${s.open ? 'highlight' : 'locked'}">
        <div class="card-top">
          <h3>0${i + 1} · ${esc(sp.name)}</h3>
          <span class="tag ${st.cls}">${esc(st.label)}</span>
        </div>
        ${inner}
      </div>`;
    }).join('') + `</div>`;
  } else if (buildTab === 'city') {
    body += `<div class="section-title">Fahrzeug-Werkhallen (${game.halls.filter(h => h.unlocked).length} / ${HALLS.length})</div>`;
    body += `<div class="grid">` + game.halls.map(h => {
      const def = h.def;
      const check = game.canUnlockHall(h.id);
      const price = game.hallPrice(h.id);
      const reqs = def.requires.map(r => BUILDINGS.find(b => b.id === r)?.short || r).join(', ');
      return `<div class="panel-card ${h.unlocked ? 'done' : 'locked'}">
        <div class="card-top">
          <h3>${esc(def.code + ' · ' + def.short)}</h3>
          <span class="tag ${h.unlocked ? 'ok' : ''}">${h.unlocked ? 'Aktiv' : def.power + ' MW'}</span>
        </div>
        <p class="desc">${esc(def.desc)}</p>
        ${h.unlocked
          ? `<div class="stat-line">Ausgeliefert: ${fmtNum(h.shipped)} · Stationen: ${h.stations.filter(s => s.open).length}/4</div>
             <div class="btn-row">
               <button type="button" class="primary" data-act="goto" data-hall="${h.id}" data-i="0">Betreten</button>
               <button type="button" data-act="focusPlot" data-key="hall:${h.id}">Auf Karte</button>
             </div>`
          : `<div class="stat-line">${reqs ? 'Benötigt: ' + esc(reqs) : 'Sofort baubar'}</div>
             <div class="btn-row">
               <button type="button" class="primary" data-act="unlockHall" data-id="${h.id}" ${check.ok ? '' : 'disabled'}>Bauen (${eur(price)})</button>
               <button type="button" data-act="focusPlot" data-key="hall:${h.id}">Baufeld</button>
             </div>`
        }
      </div>`;
    }).join('') + `</div>`;

    body += `<div class="section-title">Zulieferer & Stadtinfrastruktur</div>`;
    body += `<div class="grid">` + BUILDINGS.map(b => {
      const lv = game.buildings[b.id] || 0;
      const maxed = lv >= b.max;
      const price = game.buildingPrice(b.id);
      return `<div class="panel-card ${lv > 0 ? 'highlight' : ''}">
        <div class="card-top">
          <h3>${esc(b.name)}</h3>
          <span class="tag ${lv > 0 ? 'ok' : ''}">Stufe ${lv}/${b.max}</span>
        </div>
        <p class="desc">${esc(b.desc)}</p>
        <div class="stat-line">${lv > 0 ? esc(b.effect(lv)) : 'Nächste Stufe: ' + esc(b.effect(1))}</div>
        <div class="btn-row">
          <button type="button" class="primary" data-act="buyBuilding" data-id="${b.id}" ${!maxed && game.money >= price ? '' : 'disabled'}>
            ${maxed ? 'Maximal' : (lv === 0 ? 'Bauen' : 'Ausbauen') + ' (' + eur(price) + ')'}
          </button>
          <button type="button" data-act="focusPlot" data-key="building:${b.id}">Karte</button>
        </div>
      </div>`;
    }).join('') + `</div>`;
  } else if (buildTab === 'research') {
    body += `<div class="section-title">Stadt- & Werksforschung</div>`;
    body += `<div class="grid">` + RESEARCH.map(r => {
      const owned = !!game.research[r.id];
      const reqB = r.requires ? BUILDINGS.find(b => b.id === r.requires) : null;
      const hasReq = !r.requires || (game.buildings[r.requires] || 0) >= 1;
      const cost = Math.ceil(r.cost * game.costDiscount());
      return `<div class="panel-card ${owned ? 'done' : ''}">
        <div class="card-top">
          <h3>${esc(r.name)}</h3>
          <span class="tag ${owned ? 'ok' : hasReq ? '' : 'warn'}">${owned ? 'Erforscht' : hasReq ? 'Verfügbar' : 'Benötigt ' + esc(reqB.short)}</span>
        </div>
        <p class="desc">${esc(r.desc)}</p>
        <div class="btn-row">
          <button type="button" class="primary" data-act="buyResearch" data-id="${r.id}" ${!owned && hasReq && game.money >= cost ? '' : 'disabled'}>
            ${owned ? 'Aktiv' : 'Erforschen (' + eur(cost) + ')'}
          </button>
        </div>
      </div>`;
    }).join('') + `</div>`;
  } else if (buildTab === 'player') {
    body += `<div class="section-title">Persönliche Fähigkeiten</div>`;
    body += `<div class="grid">` + Object.entries(PERSONAL).map(([k, [name, desc]]) => {
      const lv = game.player[k];
      const cost = game.activeHall.price(0, k);
      return `<div class="panel-card highlight">
        <div class="card-top">
          <h3>${esc(name)}</h3>
          <span class="tag">Stufe ${lv}/5</span>
        </div>
        <p class="desc">${esc(desc)}</p>
        <div class="btn-row">
          <button type="button" class="primary" data-act="buyOp" data-hall="${game.activeHallId}" data-i="0" data-k="${k}" ${lv < 5 && game.money >= cost ? '' : 'disabled'}>
            ${lv >= 5 ? 'Maximal' : 'Verbessern (' + eur(cost) + ')'}
          </button>
        </div>
      </div>`;
    }).join('') + `</div>`;
  } else if (buildTab === 'line') {
    const hall = game.activeHall;
    body += `<div class="section-title">Aktive Werkhalle: ${esc(hall.def.name)} · Ausgeliefert: ${fmtNum(hall.shipped)}</div>`;
    body += `<div class="grid-wide">` + hall.specs.map((sp, i) => {
      const s = hall.stations[i];
      const st = statusMeta(hall.status(i));
      const out = hall.outgoing(i).length;
      const cap = hall.capacity(i);
      const spareReady = i < 3 && hall.outgoing(i).some(p => p.x > (i + 1) * SPAN - 7 * 3.65 && p.x < (i + 1) * SPAN - 0.1 && !p.work.some(Boolean));
      return `<div class="panel-card ${s.open ? 'highlight' : 'locked'}">
        <div class="card-top">
          <h3>0${i + 1} · ${esc(sp.name)}</h3>
          <span class="tag ${st.cls}">${esc(st.label)}</span>
        </div>
        <div class="stat-line">Takt: ${s.open ? fmtTakt(hall.estTakt(i)) : '—'} · Ausgangspuffer: ${out}/${cap} · Gefertigt: ${fmtNum(s.made)}</div>
        <div class="btn-row">
          <button type="button" data-act="goto" data-hall="${hall.id}" data-i="${i}">Hingehen</button>
          ${s.open && s.robot && s.program ? `<button type="button" data-act="toggleAuto" data-hall="${hall.id}" data-i="${i}">${s.auto ? 'Roboter pausieren' : 'Roboter starten'}</button>` : ''}
          ${s.open && s.robot ? `<button type="button" data-act="teach" data-hall="${hall.id}" data-i="${i}">Anlernen</button>` : ''}
          ${i < 3 ? `<button type="button" data-act="sellSpare" data-hall="${hall.id}" data-i="${i}" ${spareReady ? '' : 'disabled'}>Ersatzteil verkaufen</button>` : ''}
        </div>
      </div>`;
    }).join('') + `</div>`;

    body += `<div class="section-title">Alle freigeschalteten Werkhallen</div>`;
    body += `<div class="grid">` + game.halls.filter(h => h.unlocked).map(h => `
      <div class="panel-card">
        <div class="card-top">
          <h3>${esc(h.def.code + ' · ' + h.def.short)}</h3>
          <span class="tag ok">${fmtNum(h.shipped)} Stk</span>
        </div>
        <div class="stat-line">Roboter aktiv: ${h.stations.filter(s => s.auto).length}/4 · Stationen: ${h.stations.filter(s => s.open).length}/4</div>
        <div class="btn-row">
          <button type="button" class="primary" data-act="goto" data-hall="${h.id}" data-i="0">Halle betreten</button>
        </div>
      </div>
    `).join('') + `</div>`;
  }

  el.sheet.innerHTML = `
    <div class="sheet-head">
      <h2>Ausbau & Industriestadt</h2>
      <button type="button" class="close-btn" data-act="close">Schließen</button>
    </div>
    <div class="tabs">
      ${tabs.map(([id, label]) => `<button type="button" class="${buildTab === id ? 'active' : ''}" data-tab="${id}">${esc(label)}</button>`).join('')}
    </div>
    <div class="sheet-body">${body}</div>
  `;
}

function renderContractsSheet() {
  const tier = game.cityTier();
  const score = game.cityScore();
  const repPct = Math.round(Math.min(1.5, game.reputation * 0.015) * 100);

  const contractCards = game.contracts.map(c => {
    const h = game.hallMap[c.hallId];
    const paint = c.paint ? PAINTS.find(p => p.id === c.paint) : null;
    const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
    const paintMismatch = paint && h.paint !== paint.id;
    return `<div class="panel-card highlight">
      <div class="card-top">
        <h3>${esc(c.title)}</h3>
        <span class="tag ok">+${eur(c.reward)}</span>
      </div>
      <p class="desc">Liefere <strong>${c.target} × ${esc(h.def.vehicle)}</strong>${paint ? ` in Lackierung <strong>${esc(paint.name)}</strong>` : ''}.</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="stat-line">Fortschritt: ${c.progress} / ${c.target} · +${c.rep} Ruf</div>
      ${paintMismatch ? `<div class="stat-line" style="color:var(--warn)">Hinweis: ${esc(h.def.code)} lackiert aktuell nicht in ${esc(paint.name)}.</div>` : ''}
      <div class="btn-row">
        <button type="button" class="primary" data-act="goto" data-hall="${h.id}" data-i="3">Zu ${esc(h.def.code)}</button>
        ${paintMismatch && game.buildings.lackiererei > 0 ? `<button type="button" data-act="openPaintFor" data-hall="${h.id}">Lack umstellen</button>` : ''}
      </div>
    </div>`;
  }).join('');

  const tiersHtml = CITY_TIERS.map(t => {
    const reached = score >= t.minScore;
    return `<div class="panel-card ${reached ? 'done' : 'locked'}">
      <div class="card-top">
        <h3>${esc(t.name)}</h3>
        <span class="tag ${reached ? 'ok' : ''}">${reached ? 'Erreicht' : 'Ab ' + t.minScore + ' Pkt'}</span>
      </div>
      <p class="desc">${esc(t.desc)}</p>
    </div>`;
  }).join('');

  el.sheet.innerHTML = `
    <div class="sheet-head">
      <h2>Flottenaufträge & Stadtrang</h2>
      <button type="button" class="close-btn" data-act="close">Schließen</button>
    </div>
    <div class="sheet-body">
      <div class="stat-line">Aktueller Rang: <strong>${esc(tier.name)}</strong> (${score} Ausbaupunkte) · Erledigte Aufträge: <strong>${fmtNum(game.contractsDone)}</strong> · Ruf: <strong>${Math.floor(game.reputation)}</strong> (+${repPct}% Wertbonus)</div>
      <div class="section-title">Laufende Lieferaufträge</div>
      <div class="grid">${contractCards}</div>
      <div class="section-title">Entwicklungsstufen zur Industriestadt</div>
      <div class="grid">${tiersHtml}</div>
    </div>
  `;
}

function renderAdminSheet() {
  const jsonText = JSON.stringify(game.snapshot(), null, 2);
  el.sheet.innerHTML = `
    <div class="sheet-head">
      <h2>Admin-Menü · Spielstand & Geld</h2>
      <button type="button" class="close-btn" data-act="close">Schließen</button>
    </div>
    <div class="sheet-body">
      <div class="admin-grid">
        <div class="admin-box">
          <h3>Geld verwalten</h3>
          <div class="stat-line">Aktuelles Guthaben: <strong>${eur(game.money)}</strong></div>
          <div class="admin-input-row">
            <input type="number" id="adminMoneyInput" min="0" max="1000000000000" step="1000" value="${Math.floor(game.money)}">
            <button type="button" class="primary" data-admin="setMoney">Setzen</button>
          </div>
          <div class="btn-row">
            <button type="button" data-admin="addMoney" data-val="1000">+1.000 €</button>
            <button type="button" data-admin="addMoney" data-val="10000">+10.000 €</button>
            <button type="button" data-admin="addMoney" data-val="100000">+100.000 €</button>
            <button type="button" data-admin="addMoney" data-val="1000000">+1 Mio €</button>
            <button type="button" data-admin="zeroMoney">0 €</button>
          </div>
        </div>

        <div class="admin-box">
          <h3>Ruf & Simulationstempo</h3>
          <div class="admin-input-row">
            <input type="number" id="adminRepInput" min="0" max="100000" step="5" value="${Math.floor(game.reputation)}">
            <button type="button" class="primary" data-admin="setRep">Ruf setzen</button>
          </div>
          <div class="stat-line">Simulationstempo (alle Werke):</div>
          <div class="btn-row">
            ${[1, 2, 5, 10].map(sp =>
              `<button type="button" class="${game.simSpeed === sp ? 'dark' : ''}" data-admin="setSpeed" data-val="${sp}">${sp}×</button>`
            ).join('')}
          </div>
        </div>
      </div>

      <div class="admin-box">
        <h3>Schnell-Aktionen für Stadt & Werke</h3>
        <div class="btn-row">
          <button type="button" data-admin="unlockHalls">Alle 5 Werkhallen & Stationen öffnen</button>
          <button type="button" data-admin="buildCity1">Alle Stadtgebäude bauen (St. 1)</button>
          <button type="button" data-admin="buildCityMax">Alle Stadtgebäude maximieren (St. 5)</button>
          <button type="button" data-admin="unlockResearch">Alle Forschungen freischalten</button>
          <button type="button" data-admin="maxPlayer">Charakter maximieren</button>
          <button type="button" data-admin="autoActive">Aktive Halle voll automatisieren</button>
          <button type="button" class="primary" data-admin="sandbox">Komplette Industriestadt (Sandbox)</button>
        </div>
      </div>

      <div class="admin-box">
        <h3>Spielstand direkt bearbeiten (JSON)</h3>
        <textarea id="adminJson" class="json-box" spellcheck="false">${esc(jsonText)}</textarea>
        <div class="btn-row">
          <button type="button" data-admin="refreshJson">Aktuellen Stand laden</button>
          <button type="button" data-admin="copyJson">JSON kopieren</button>
          <button type="button" class="primary" data-admin="applyJson">Spielstand anwenden</button>
        </div>
        ${adminFeedback.text ? `<div class="inline-msg ${adminFeedback.err ? 'err' : ''}">${esc(adminFeedback.text)}</div>` : ''}
      </div>

      <div class="admin-box">
        <h3>Spielstand zurücksetzen</h3>
        <div class="btn-row">
          ${confirmReset
            ? `<button type="button" class="danger" data-admin="resetConfirm">Wirklich komplett löschen</button>
               <button type="button" data-admin="resetCancel">Abbrechen</button>`
            : `<button type="button" class="danger" data-admin="resetAsk">Spielstand auf Anfang zurücksetzen</button>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderHelpSheet() {
  el.sheet.innerHTML = `
    <div class="sheet-head">
      <h2>Handbuch & Einstellungen</h2>
      <button type="button" class="close-btn" data-act="close">Schließen</button>
    </div>
    <div class="sheet-body">
      <div class="btn-row">
        <button type="button" class="${sound.enabled ? 'dark' : ''}" data-act="toggleSound">
          Werkstatt-Sound: ${sound.enabled ? 'Ein' : 'Aus'}
        </button>
      </div>
      <div class="help-grid">
        <div class="panel-card">
          <h3>1. Erstes Fahrzeug bauen</h3>
          <p class="desc">Du startest in Werk I beim V8-Klassiker. Halte Schrauben/Schweißpunkte gedrückt, ziehe Achsen/Karosserie in die grüne Zielzone und stoppe die Prüfung im grünen Bereich für Extra-Ruf.</p>
        </div>
        <div class="panel-card">
          <h3>2. Roboter anlernen</h3>
          <p class="desc">Kaufe einen Industrieroboter im Ausbau, starte „Anlernen“ und führe ein Werkstück einmal komplett vor. Der Roboter merkt sich deinen exakten Takt — mit Blaupausen-Forschung auch übertragbar!</p>
        </div>
        <div class="panel-card">
          <h3>3. Zur Industriestadt wachsen</h3>
          <p class="desc">Wechsle jederzeit in die 3D-Industriestadt (Taste M). Errichte Kraftwerk, Presswerk, Lackierstraße, Siedlung, Akademie, Bahnhof und Batteriewerk, um bis zu 5 Fahrzeugwerke gleichzeitig laufen zu lassen.</p>
        </div>
        <div class="panel-card">
          <h3>4. Steuerung & Admin-Menü</h3>
          <p class="desc"><strong>WASD</strong> laufen/verschieben · <strong>1–4</strong> Stationen · <strong>M</strong> Stadt/Halle wechseln · <strong>B</strong> Ausbau · <strong>C</strong> Aufträge · <strong>F9</strong> Admin-Menü für Geld & Spielstand.</p>
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// CLICK HANDLERS FOR SHEETS, PLOT INSPECTOR & HEADER
// =========================================================================
el.navHall.addEventListener('click', () => setMode('hall'));
el.navCity.addEventListener('click', () => setMode('city'));
el.buildBtn.addEventListener('click', () => openSheet('build'));
el.contractBtn.addEventListener('click', () => openSheet('contracts'));
el.adminBtn.addEventListener('click', () => openSheet('admin'));
el.helpBtn.addEventListener('click', () => openSheet('help'));
el.quickModeBtn.addEventListener('click', () => setMode(room.getMode() === 'hall' ? 'city' : 'hall'));
el.lineBtn.addEventListener('click', () => openSheet('build', 'line'));

el.hallSelect.addEventListener('change', () => {
  enterHall(el.hallSelect.value, 0);
});

el.camZoomIn.addEventListener('click', () => { sound.click(); room.zoomCity(-12); });
el.camZoomOut.addEventListener('click', () => { sound.click(); room.zoomCity(12); });
el.camRotate.addEventListener('click', () => { sound.click(); room.rotateCity(-140); });
el.camReset.addEventListener('click', () => { sound.click(); room.resetCityCamera(); });

el.plotCard.addEventListener('click', e => {
  const btn = e.target.closest('[data-plot-act]');
  if (!btn) return;
  sound.unlock();
  const act = btn.dataset.plotAct;
  const id = btn.dataset.id;
  if (act === 'close') {
    selectedPlot = null;
    room.clearCitySelection();
    updatePlotCard();
  } else if (act === 'enter') {
    enterHall(id, 0);
  } else if (act === 'manageHall') {
    buildHallId = id;
    openSheet('build', 'stations');
  } else if (act === 'unlockHall') {
    if (game.unlockHall(id)) {
      sound.build();
      saveGame();
      say(game.hallMap[id].def.name + ' errichtet!');
      updatePlotCard();
    }
  } else if (act === 'buyBuilding') {
    if (game.buyBuilding(id)) {
      sound.build();
      saveGame();
      const b = BUILDINGS.find(x => x.id === id);
      say(b.name + ' auf Stufe ' + game.buildings[id] + ' ausgebaut');
      updatePlotCard();
    }
  } else if (act === 'openResearch') {
    openSheet('build', 'research');
  } else if (act === 'openPaint') {
    openSheet('build', 'stations');
  }
});

el.overlay.addEventListener('click', e => {
  if (e.target === el.overlay) closeSheet();
});

el.sheet.addEventListener('click', e => {
  const tabBtn = e.target.closest('[data-tab]');
  if (tabBtn) {
    sound.click();
    buildTab = tabBtn.dataset.tab;
    renderSheet();
    return;
  }

  const adm = e.target.closest('[data-admin]');
  if (adm) {
    sound.unlock();
    const act = adm.dataset.admin;
    adminFeedback = { text: '', err: false };
    if (act === 'setMoney') {
      const val = Number($('#adminMoneyInput')?.value);
      game.adminSetMoney(val);
      say('Guthaben gesetzt: ' + eur(game.money));
    } else if (act === 'addMoney') {
      const val = Number(adm.dataset.val);
      game.adminAddMoney(val);
      say('+' + eur(val) + ' gutgeschrieben');
    } else if (act === 'zeroMoney') {
      game.adminSetMoney(0);
      say('Guthaben auf 0 € gesetzt');
    } else if (act === 'setRep') {
      const val = Number($('#adminRepInput')?.value);
      game.adminSetReputation(val);
      say('Ruf auf ' + Math.floor(game.reputation) + ' gesetzt');
    } else if (act === 'setSpeed') {
      game.simSpeed = Number(adm.dataset.val) || 1;
      game.changed++;
      say('Simulationstempo: ' + game.simSpeed + '×');
    } else if (act === 'unlockHalls') {
      game.adminUnlockAllHalls();
      sound.build();
      say('Alle 5 Werkhallen & Stationen geöffnet');
    } else if (act === 'buildCity1') {
      game.adminBuildAllCity(false);
      sound.build();
      say('Alle Stadtgebäude auf mindestens Stufe 1 gebaut');
    } else if (act === 'buildCityMax') {
      game.adminBuildAllCity(true);
      sound.build();
      say('Alle Stadtgebäude maximiert');
    } else if (act === 'unlockResearch') {
      game.adminUnlockResearch();
      sound.contract();
      say('Alle Forschungen freigeschaltet');
    } else if (act === 'maxPlayer') {
      game.adminMaxPlayer();
      say('Charakter-Fähigkeiten maximiert');
    } else if (act === 'autoActive') {
      game.adminAutomateHall(game.activeHallId, true);
      sound.build();
      say(game.activeHall.def.name + ' voll automatisiert');
    } else if (act === 'sandbox') {
      game.adminSandboxFullCity();
      sound.contract();
      say('Komplette Industriestadt im Sandbox-Modus aufgebaut!');
    } else if (act === 'refreshJson') {
      adminFeedback = { text: 'Aktueller Spielstand geladen.', err: false };
    } else if (act === 'copyJson') {
      const txt = $('#adminJson')?.value || '';
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(txt).then(() => {
          adminFeedback = { text: 'JSON-Spielstand in die Zwischenablage kopiert.', err: false };
          renderSheet();
        }).catch(() => {
          adminFeedback = { text: 'Kopieren nicht erlaubt — bitte Textfeld manuell kopieren.', err: true };
          renderSheet();
        });
        return;
      }
      adminFeedback = { text: 'Zwischenablage nicht verfügbar — Textfeld manuell kopieren.', err: true };
    } else if (act === 'applyJson') {
      try {
        const parsed = JSON.parse($('#adminJson')?.value || '');
        if (!parsed || typeof parsed !== 'object') throw new Error('Kein gültiges JSON-Objekt');
        replaceSimulation(parsed);
        adminFeedback = { text: 'Spielstand erfolgreich übernommen & gespeichert!', err: false };
        say('Spielstand aus JSON geladen');
      } catch (err) {
        adminFeedback = { text: 'Ungültiges JSON: ' + (err?.message || 'Fehler'), err: true };
      }
    } else if (act === 'resetAsk') {
      confirmReset = true;
    } else if (act === 'resetCancel') {
      confirmReset = false;
    } else if (act === 'resetConfirm') {
      confirmReset = false;
      localStorage.removeItem(SAVE_KEY);
      replaceSimulation(null);
      adminFeedback = { text: 'Spielstand komplett zurückgesetzt.', err: false };
      say('Neues Spiel gestartet');
    }
    saveGame();
    updatePlotCard();
    renderSheet();
    return;
  }

  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  sound.unlock();
  const act = btn.dataset.act;

  if (act === 'close') {
    closeSheet();
    return;
  }
  if (act === 'toggleSound') {
    sound.enabled = !sound.enabled;
    try { localStorage.setItem(AUDIO_KEY, sound.enabled ? 'on' : 'off'); } catch {}
    if (sound.enabled) sound.click();
    renderSheet();
    return;
  }
  if (act === 'selectBuildHall') {
    sound.click();
    buildHallId = btn.dataset.hall;
    renderSheet();
    return;
  }
  if (act === 'buyOp') {
    const hId = btn.dataset.hall;
    const i = Number(btn.dataset.i);
    const k = btn.dataset.k;
    if (game.buyStationOp(hId, i, k)) {
      sound.build();
      saveGame();
      renderSheet();
    }
    return;
  }
  if (act === 'paint') {
    if (game.buyPaint(btn.dataset.hall, btn.dataset.paint)) {
      sound.click();
      saveGame();
      renderSheet();
    }
    return;
  }
  if (act === 'unlockHall') {
    const id = btn.dataset.id;
    if (game.unlockHall(id)) {
      sound.build();
      saveGame();
      say(game.hallMap[id].def.name + ' errichtet!');
      renderSheet();
    }
    return;
  }
  if (act === 'buyBuilding') {
    const id = btn.dataset.id;
    if (game.buyBuilding(id)) {
      sound.build();
      saveGame();
      const b = BUILDINGS.find(x => x.id === id);
      say(b.name + ' auf Stufe ' + game.buildings[id] + ' ausgebaut');
      renderSheet();
    }
    return;
  }
  if (act === 'buyResearch') {
    const id = btn.dataset.id;
    if (game.buyResearch(id)) {
      sound.contract();
      saveGame();
      const r = RESEARCH.find(x => x.id === id);
      say('Forschung abgeschlossen: ' + r.name);
      renderSheet();
    }
    return;
  }
  if (act === 'focusPlot') {
    const key = btn.dataset.key;
    const [type, id] = key.split(':');
    closeSheet();
    setMode('city');
    selectedPlot = { type, id, key };
    room.focusCityPlot(key);
    updatePlotCard();
    return;
  }
  if (act === 'goto') {
    closeSheet();
    enterHall(btn.dataset.hall, Number(btn.dataset.i) || 0);
    return;
  }
  if (act === 'openPaintFor') {
    buildHallId = btn.dataset.hall;
    openSheet('build', 'stations');
    return;
  }
  if (act === 'toggleAuto') {
    const s = game.hallMap[btn.dataset.hall]?.stations[Number(btn.dataset.i)];
    if (s && s.robot && s.program) {
      s.auto = !s.auto;
      s.run = null;
      game.changed++;
      sound.click();
      saveGame();
      renderSheet();
    }
    return;
  }
  if (act === 'teach') {
    const hId = btn.dataset.hall;
    const i = Number(btn.dataset.i);
    closeSheet();
    enterHall(hId, i);
    const hall = game.activeHall;
    if (hall.teach(i)) {
      say('Roboter lernt jetzt deinen Durchgang an Station 0' + (i + 1) + '!');
    } else {
      say('Stelle sicher, dass ein frisches Werkstück an Station 0' + (i + 1) + ' liegt.');
    }
    return;
  }
  if (act === 'copyBlueprint') {
    const ok = game.copyBlueprint(btn.dataset.src, Number(btn.dataset.i), btn.dataset.hall);
    if (ok) {
      sound.contract();
      saveGame();
      say('Roboter-Vorlage erfolgreich übertragen!');
      renderSheet();
    }
    return;
  }
  if (act === 'sellSpare') {
    const hall = game.hallMap[btn.dataset.hall];
    if (hall && hall.sellSpare(Number(btn.dataset.i))) {
      sound.click();
      saveGame();
      say('Ersatzteil aus dem Puffer verkauft');
      renderSheet();
    }
  }
});

// =========================================================================
// KEYBOARD & CANVAS POINTER INTERACTION
// =========================================================================
const isTyping = t => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');

window.addEventListener('keydown', e => {
  if (e.code === 'F9') {
    e.preventDefault();
    if (sheetOpen === 'admin') closeSheet();
    else openSheet('admin');
    return;
  }
  if (e.code === 'Escape') {
    if (sheetOpen) closeSheet();
    else if (selectedPlot) {
      selectedPlot = null;
      room.clearCitySelection();
      updatePlotCard();
    }
    return;
  }
  if (isTyping(e.target)) return;
  if (sheetOpen) return;

  if (e.code === 'KeyM') {
    setMode(room.getMode() === 'hall' ? 'city' : 'hall');
    return;
  }
  if (e.code === 'KeyB') {
    openSheet('build');
    return;
  }
  if (e.code === 'KeyC') {
    openSheet('contracts');
    return;
  }
  if (room.getMode() === 'hall' && /^Digit[1-4]$/.test(e.code)) {
    room.visit(Number(e.code[5]) - 1);
    return;
  }
  room.keys.add(e.code);
});

window.addEventListener('keyup', e => {
  room.keys.delete(e.code);
});

window.addEventListener('blur', () => {
  room.keys.clear();
  releasePlayerWork();
});

// Canvas pointer (Hall look + City pan/rotate/click-plot)
let camDrag = null;
let lastCityClick = { time: 0, key: '' };

room.canvas.addEventListener('contextmenu', e => e.preventDefault());

room.canvas.addEventListener('pointerdown', e => {
  if (sheetOpen) return;
  sound.unlock();
  room.canvas.setPointerCapture(e.pointerId);
  camDrag = {
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    sx: e.clientX,
    sy: e.clientY,
    btn: e.button,
    shift: e.shiftKey,
    moved: false
  };
});

room.canvas.addEventListener('pointermove', e => {
  if (!camDrag || camDrag.id !== e.pointerId) return;
  const dx = e.clientX - camDrag.x;
  const dy = e.clientY - camDrag.y;
  camDrag.x = e.clientX;
  camDrag.y = e.clientY;
  if (Math.hypot(e.clientX - camDrag.sx, e.clientY - camDrag.sy) > 6) camDrag.moved = true;

  if (room.getMode() === 'hall') {
    room.look(dx, dy);
  } else if (camDrag.moved) {
    if (camDrag.btn === 2 || camDrag.shift) {
      room.rotateCity(dx);
    } else {
      room.panCity(dx, dy);
    }
  }
});

room.canvas.addEventListener('pointerup', e => {
  if (!camDrag || camDrag.id !== e.pointerId) return;
  const wasClick = !camDrag.moved && camDrag.btn === 0;
  camDrag = null;
  if (room.getMode() === 'city' && wasClick) {
    const hit = room.pickCityPlot(e.clientX, e.clientY);
    if (hit) {
      sound.click();
      const now = performance.now();
      if (hit.type === 'hall' && game.hallMap[hit.id].unlocked && lastCityClick.key === hit.key && now - lastCityClick.time < 420) {
        enterHall(hit.id, 0);
        lastCityClick = { time: 0, key: '' };
        return;
      }
      lastCityClick = { time: now, key: hit.key };
      selectedPlot = hit;
      room.focusCityPlot(hit.key);
      updatePlotCard();
    } else {
      selectedPlot = null;
      room.clearCitySelection();
      updatePlotCard();
    }
  }
});

room.canvas.addEventListener('pointercancel', () => { camDrag = null; });

room.canvas.addEventListener('wheel', e => {
  if (sheetOpen || room.getMode() !== 'city') return;
  e.preventDefault();
  room.zoomCity(e.deltaY * 0.045);
}, { passive: false });

// Touch Joystick
let stickDrag = null;
el.stick.addEventListener('pointerdown', e => {
  sound.unlock();
  el.stick.setPointerCapture(e.pointerId);
  stickDrag = e.pointerId;
  updateStick(e);
});
el.stick.addEventListener('pointermove', e => {
  if (stickDrag === e.pointerId) updateStick(e);
});
function endStick() {
  stickDrag = null;
  room.joystick(0, 0);
  el.stick.firstElementChild.style.transform = '';
}
el.stick.addEventListener('pointerup', endStick);
el.stick.addEventListener('pointercancel', endStick);

function updateStick(e) {
  const r = el.stick.getBoundingClientRect();
  let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
  let dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
  const len = Math.hypot(dx, dy);
  if (len > 1) { dx /= len; dy /= len; }
  room.joystick(dx, dy);
  el.stick.firstElementChild.style.transform = `translate(${dx * 26}px, ${dy * 26}px)`;
}

// =========================================================================
// WORKBENCH TARGETS (HALL MODE)
// =========================================================================
function releasePlayerWork() {
  const hall = game.activeHall;
  if (drag) {
    const i = drag.i;
    const valid = drag.fraction >= 0.86;
    const res = hall.release(i, valid);
    if (valid) sound.fit();
    else sound.testFail();
    drag = null;
    return res;
  }
  if (holdWork) {
    const { i, kind } = holdWork;
    const res = hall.release(i, false);
    if (kind === 'test') {
      if (res.pass) {
        sound.testPass(res.perfect);
        if (res.perfect) say('Präzisionstreffer! +1 Ruf & Qualitätsbonus');
      } else {
        sound.testFail();
      }
    }
    holdWork = null;
    return res;
  }
}

window.addEventListener('pointermove', e => {
  if (!drag || drag.pointerId !== e.pointerId) return;
  const hall = game.activeHall;
  const op = hall.specs[drag.i].ops[drag.j];
  const a = room.project(drag.i, op.from);
  const b = room.project(drag.i, op.point);
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const len2 = vx * vx + vy * vy || 1;
  const proj = ((e.clientX - a.x) * vx + (e.clientY - a.y) * vy) / len2;
  const distTarget = Math.hypot(e.clientX - b.x, e.clientY - b.y);
  drag.fraction = distTarget < 44 ? 1 : Math.max(0, Math.min(1, proj));
  drag.x = e.clientX;
  drag.y = e.clientY;
});

window.addEventListener('pointerup', e => {
  if (drag && drag.pointerId === e.pointerId) releasePlayerWork();
  else if (holdWork && holdWork.pointerId === e.pointerId) releasePlayerWork();
});

window.addEventListener('pointercancel', () => releasePlayerWork());

function syncTargets(hall, i) {
  const s = hall.stations[i];
  const p = hall.dock(i);
  const activeKeys = new Set();

  if (room.getMode() === 'hall' && !sheetOpen && s.open && !s.auto && !room.far(i) && p) {
    const avail = hall.available(i, p);
    for (const j of avail) {
      const op = hall.specs[i].ops[j];
      const pt = op.kind === 'fit' ? op.from : op.point;
      const pr = room.project(i, pt);
      if (!pr.visible) continue;
      const key = `${hall.id}:${i}:${j}`;
      activeKeys.add(key);
      let btn = targetNodes.get(key);
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'target ' + (op.kind === 'fit' ? 'drag' : op.kind === 'test' ? 'test' : '');
        const label = op.kind === 'fit' ? 'Ziehen: ' + op.name
          : op.kind === 'test' ? 'Prüfen: ' + op.name
          : op.kind === 'weld' ? 'Schweißen'
          : 'Schrauben';
        btn.textContent = label;
        btn.addEventListener('pointerdown', e => {
          e.stopPropagation();
          sound.unlock();
          if (!hall.begin(i, j, 'player')) return;
          if (op.kind === 'fit') {
            drag = { i, j, pointerId: e.pointerId, fraction: 0, x: e.clientX, y: e.clientY };
          } else {
            holdWork = { i, j, kind: op.kind, pointerId: e.pointerId };
          }
        });
        el.targets.append(btn);
        targetNodes.set(key, btn);
      }
      const isActive = (drag && drag.i === i && drag.j === j) || (holdWork && holdWork.i === i && holdWork.j === j);
      btn.classList.toggle('active', !!isActive);
      btn.style.left = (drag && drag.i === i && drag.j === j ? drag.x : pr.x) + 'px';
      btn.style.top = (drag && drag.i === i && drag.j === j ? drag.y : pr.y) + 'px';

      // Show drop zone while dragging a fit operation
      if (drag && drag.i === i && drag.j === j) {
        const dest = room.project(i, op.point);
        if (dest.visible) {
          const dKey = 'drop:' + key;
          activeKeys.add(dKey);
          let drop = targetNodes.get(dKey);
          if (!drop) {
            drop = document.createElement('div');
            drop.className = 'target drop';
            drop.textContent = 'Hier einsetzen';
            el.targets.append(drop);
            targetNodes.set(dKey, drop);
          }
          drop.classList.toggle('near', drag.fraction >= 0.86);
          drop.style.left = dest.x + 'px';
          drop.style.top = dest.y + 'px';
        }
      }
    }
  }

  for (const [k, node] of targetNodes) {
    if (!activeKeys.has(k)) {
      node.remove();
      targetNodes.delete(k);
    }
  }

  // Worktip progress / test timing gauge
  const run = s.run?.who === 'player' ? s.run : null;
  if (room.getMode() === 'hall' && !sheetOpen && run && p) {
    const op = hall.specs[i].ops[run.j];
    el.worktip.hidden = false;
    el.worktip.classList.toggle('test', op.kind === 'test');
    if (op.kind === 'test') {
      const [lo, hi] = hall.testWindow();
      el.tip.textContent = op.name + ' — im grünen Bereich loslassen!';
      el.zone.style.left = (lo * 100) + '%';
      el.zone.style.width = ((hi - lo) * 100) + '%';
      el.needle.style.left = ((run.reading || 0) * 100) + '%';
    } else if (op.kind === 'fit') {
      el.tip.textContent = op.name + ' — in die markierte Aufnahme ziehen';
      el.fill.style.width = Math.round((drag?.fraction || 0) * 100) + '%';
    } else {
      el.tip.textContent = op.name + ' — gedrückt halten';
      el.fill.style.width = Math.round((p.work[run.j] || 0) * 100) + '%';
    }
  } else {
    el.worktip.hidden = true;
  }
}

// =========================================================================
// MAIN HUD UPDATE & LOOP
// =========================================================================
function updateHud() {
  const used = game.powerUsed();
  const cap = game.powerCap();
  const tier = game.cityTier();
  const hudKey = `${Math.floor(game.money)}|${used}|${cap}|${game.contracts.length}|${tier.name}|${game.population()}|${game.totalShipped()}|${Math.floor(game.reputation)}|${game.simSpeed}`;

  if (hudKey !== lastHudKey) {
    lastHudKey = hudKey;
    el.cash.textContent = eur(game.money);
    el.power.textContent = `${used.toFixed(1).replace('.', ',')} / ${cap} MW`;
    el.powerBox.classList.toggle('overload', used > cap);
    el.tierLabel.textContent = tier.name;
    el.contractBadge.textContent = String(game.contracts.length);

    el.cityTitle.textContent = tier.name;
    el.citySpeedTag.textContent = game.simSpeed + '×';
    el.cityPop.textContent = fmtNum(game.population());
    el.cityShipped.textContent = fmtNum(game.totalShipped());
    el.cityRep.textContent = fmtNum(game.reputation);
  }

  syncHallSelect();

  if (room.getMode() === 'hall') {
    const hall = game.activeHall;
    const i = room.nearest();
    const s = hall.stations[i];
    const sp = hall.specs[i];
    const p = hall.dock(i);
    const st = statusMeta(hall.status(i));
    const phaseDone = p ? sp.phases.map((_, ph) => sp.ops.every((o, j) => o.phase !== ph || p.work[j] >= 1)) : [];
    const curPhase = p ? sp.ops.find((_, j) => p.work[j] < 1)?.phase : -1;
    const out = hall.outgoing(i).length;
    const capBuf = hall.capacity(i);
    const stKey = `${hall.id}|${i}|${s.open}|${s.auto}|${s.staff}|${st.label}|${curPhase}|${phaseDone.join('')}|${out}|${capBuf}|${Math.round(hall.estTakt(i) * 10)}|${hall.reward(i, true)}|${hall.record?.i}`;

    if (stKey !== lastStationKey) {
      lastStationKey = stKey;
      el.nr.textContent = '0' + (i + 1);
      el.stName.textContent = sp.name;
      el.mode.textContent = hall.record?.i === i ? 'Aufnahme'
        : !s.open ? 'Gesperrt'
        : s.auto ? 'Roboter'
        : s.staff ? 'Team + Hand'
        : 'Handarbeit';
      el.mode.className = 'mode-tag ' + st.cls;
      el.taktRow.textContent = `Takt: ${s.open ? fmtTakt(hall.estTakt(i)) : '—'} · ${st.label}`;

      el.steps.innerHTML = sp.phases.map((label, idx) => {
        const cls = phaseDone[idx] ? 'done' : idx === curPhase ? 'now' : '';
        return `<li class="${cls}">${idx + 1}. ${esc(label)}</li>`;
      }).join('');

      el.buf.textContent = i < 3 ? `Puffer: ${out}/${capBuf}` : `Ausgeliefert: ${fmtNum(hall.shipped)}`;
      el.pay.textContent = s.open ? `Prämie: ${eur(hall.reward(i, !s.auto))}` : `Freischalten: ${eur(hall.price(i, 'open'))}`;
    }

    syncTargets(hall, i);
  }
}

let lastTime = performance.now();
let saveAccum = 0;

function tick(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  const playing = !sheetOpen;
  const events = game.advance(dt, playing);

  // Continuous sound feedback during manual hold operations
  if (holdWork && playing && room.getMode() === 'hall') {
    const run = game.activeHall.stations[holdWork.i].run;
    if (run?.who === 'player') {
      if (holdWork.kind === 'bolt') sound.wrench(now);
      else if (holdWork.kind === 'weld') sound.weld(now);
    } else {
      holdWork = null;
      sound.complete();
    }
  }

  for (const ev of events) {
    if (ev.type === 'stage' && ev.hall === game.activeHallId && room.getMode() === 'hall') {
      sound.complete();
    } else if (ev.type === 'shipped') {
      if (ev.bonus > 0) {
        sound.contract();
        say(`${game.hallMap[ev.hall].def.vehicle} ausgeliefert! +${eur(ev.bonus)} Bonus`);
      }
    }
  }

  room.render(dt, game, playing, drag);
  updateHud();

  saveAccum += dt;
  if (saveAccum > 1.5 && game.changed !== savedChange) {
    saveGame();
    saveAccum = 0;
  }

  requestAnimationFrame(tick);
}

// Initial state
setMode('hall');
updateHud();
requestAnimationFrame(tick);
