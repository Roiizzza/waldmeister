'use strict';
/* ================= Shop: Waffen und Ausrüstung kaufen (bewusst teuer) ================= */
const SHOP_WEAPON_PRICE = [0, 12000, 30000, 60000, 120000];
const SHOP_ITEM_PRICE = [500, 3000, 15000, 70000];
let storeMsg = '';
function renderStore() {
  const el = $('storeScreen');
  const wrows = WEAPONS.map((w, i) => {
    const own = save.wfound[i], pr = SHOP_WEAPON_PRICE[i], ok = !own && save.gold >= pr;
    return `<div class="shopRow"><div class="ic" style="--rc:#${w.color.toString(16).padStart(6, '0')}">${svgIcon(w.ic)}</div><div class="tx"><b style="color:#${w.color.toString(16).padStart(6, '0')}">${w.name}</b><small>${w.desc}</small></div>` +
      (own ? `<button class="pill" disabled>Gekauft ✔</button>` : `<button class="pill gold" data-bw="${i}" ${ok ? '' : 'disabled'}>$ ${fmt(pr)}</button>`) + `</div>`;
  }).join('');
  const irows = SLOTS.map(sl => RAR.map((r, ri) => ({ sl, r, ri }))).flat().map(({ sl, r, ri }) => {
    const pr = SHOP_ITEM_PRICE[ri], ok = save.gold >= pr;
    return `<div class="shopRow"><div class="ic">${svgIcon(sl.ic, r.c)}</div><div class="tx"><b style="color:${r.c}">${r.n}e ${sl.name}</b><small>Zufällige Werte, Qualität ${r.n}</small></div><button class="pill gold" data-bi="${sl.id}|${ri}" ${ok ? '' : 'disabled'}>$ ${fmt(pr)}</button></div>`;
  }).join('');
  el.innerHTML = `<div class="card"><div class="shopHead"><div><h2>SHOP</h2><div class="note" style="margin:.3rem 0 0">Kaufe Waffen und Ausrüstung mit Gold. Teuer, dafür ohne Glück. Im Einsatz findest du sie günstiger.</div></div><div class="shopGold">$ ${fmt(save.gold)}</div></div>` +
    `<div id="storeMsg" style="min-height:2.2rem;font-weight:700;color:#6dff9a">${storeMsg}</div><div class="admH">WAFFEN</div>${wrows}<div class="admH">AUSRÜSTUNG</div>${irows}</div>`;
  el.querySelectorAll('[data-bw]').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.bw, pr = SHOP_WEAPON_PRICE[i]; if (save.wfound[i] || save.gold < pr) { sfx('deny', 0); return; }
    save.gold -= pr; save.wfound[i] = true; writeSave(); sfx('level', 0); vib(30); storeMsg = WEAPONS[i].name + ' gekauft! Wähle sie in der Ausrüstung als Startwaffe.'; renderStore(); updateNav();
  }));
  el.querySelectorAll('[data-bi]').forEach(b => b.addEventListener('click', () => {
    const [slot, ri] = b.dataset.bi.split('|'), pr = SHOP_ITEM_PRICE[+ri]; if (save.gold < pr) { sfx('deny', 0); return; }
    save.gold -= pr; const it = giveItem(genItem(0, 8, false, { slot, rar: +ri })); writeSave(); sfx('level', 0); vib(30);
    storeMsg = (it && it.name ? it.name : 'Gegenstand') + ' gekauft! Du findest ihn in der Ausrüstung.'; renderStore(); updateNav();
  }));
}

/* ================= Admin-Menü (nur zum Testen) ================= */
function openAdmin() { renderAdmin(); showScreen('adminScreen'); }
function adminDone() { hideScreen('adminScreen'); if (S.state === 'paused') { hideScreen('pauseScreen'); S.state = 'playing'; } }
function renderAdmin() {
  const el = $('adminScreen'), run = S.state === 'playing' || S.state === 'paused', a = save.adm || (save.adm = { unlock: true, god: false, nocd: false });
  const on = v => v ? 'gold' : '';
  const B = (id, txt, cls, dis) => `<button class="pill ${cls || ''}" data-a="${id}" ${dis ? 'disabled' : ''}>${txt}</button>`;
  el.innerHTML = `<div class="card"><h2>ADMIN (TEST)</h2><div class="note">Nur zum Testen. Alles ist freigeschaltet, nichts muss abgeschlossen werden.</div>` +
    `<div class="admH">RESSOURCEN</div><div class="admGrid">${B('g1', '+ $ 1.000')}${B('g2', '+ $ 100.000')}${B('g3', '+ $ 10.000.000')}${B('o', '+ 100 Erz')}${B('r', '+ 50 Runen')}${B('max', 'Alles auf Maximum')}</div>` +
    `<div class="admH">FREISCHALTEN</div><div class="admGrid">${B('wp', 'Alle Waffen')}${B('tree', 'Skillbaum komplett')}${B('gear', '10 legendäre Items')}${B('unlock', 'Alle Level: ' + (a.unlock ? 'AN' : 'AUS'), on(a.unlock))}</div>` +
    `<div class="admH">MODI</div><div class="admGrid">${B('god', 'Godmode: ' + (a.god ? 'AN' : 'AUS'), on(a.god))}${B('nocd', 'Keine Abklingzeit: ' + (a.nocd ? 'AN' : 'AUS'), on(a.nocd))}</div>` +
    `<div class="admH">IM EINSATZ ${run ? '' : '(erst ein Level starten)'}</div><div class="admGrid">${B('lv1', '+1 Level', '', !run)}${B('lv5', '+5 Level', '', !run)}${B('xp', '+ 1000 XP', '', !run)}${B('talent', 'Talentwahl öffnen', '', !run)}${B('heal', 'Voll heilen', '', !run)}${B('kill', 'Alle Gegner besiegen', '', !run)}${B('skip', 'Raum überspringen', '', !run)}${B('cd', 'Abklingzeiten zurück', '', !run)}</div>` +
    `<div style="display:flex;gap:.6rem;margin-top:.6rem"><input id="admRoom" type="number" min="1" value="${run ? Math.max(1, S.wave) : 1}" style="flex:1;font:inherit;font-size:1.6rem;padding:.5rem;border-radius:.6rem;border:.14rem solid #35475a;background:#0e141a;color:#fff">${B('room', 'Springe zu Raum', '', !run)}</div>` +
    `<div style="margin-top:1.2rem">${B('close', 'ZURÜCK', 'gold')}</div></div>`;
  el.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => adminAct(b.dataset.a)));
}
function adminAct(id) {
  const a = save.adm, kill = () => { W.queue.length = 0; enemies.forEach(e => { if (!e.dead) damageEnemy(e, 1e12, false, 0, 0); }); };
  const A = {
    g1: () => save.gold += 1000, g2: () => save.gold += 100000, g3: () => save.gold += 10000000, o: () => save.ore += 100, r: () => save.rune += 50,
    max: () => { save.gold = Math.max(save.gold, 99999999); save.ore = Math.max(save.ore, 9999); save.rune = Math.max(save.rune, 999); },
    wp: () => { save.wfound = WEAPONS.map(() => true); }, tree: () => { TREE.forEach(b => b.nodes.forEach(n => { save.meta[n.id] = n.max; })); },
    gear: () => { for (let i = 0; i < 10; i++) giveItem(genItem(0, 20, false, { rar: 3 })); },
    unlock: () => { a.unlock = !a.unlock; }, god: () => { a.god = !a.god; }, nocd: () => { a.nocd = !a.nocd; if (a.nocd) { player.skCd = player.ultCd = 0; } },
    lv1: () => { addXp(S.xpNeed); adminDone(); }, lv5: () => { for (let i = 0; i < 5; i++) addXp(S.xpNeed); adminDone(); }, xp: () => { addXp(1000); adminDone(); },
    talent: () => { S.pendingLv++; adminDone(); }, heal: () => { player.hp = player.maxHp; }, cd: () => { player.skCd = player.ultCd = 0; },
    kill: () => { kill(); adminDone(); }, skip: () => { kill(); adminDone(); },
    room: () => { const n = Math.max(1, Math.min(S.maxWave, parseInt($('admRoom').value, 10) || 1)); adminDone(); S.wave = n; startWave(n); },
    close: () => { hideScreen('adminScreen'); }
  };
  if (!A[id]) return; A[id](); writeSave(); sfx('buy', 0); if (id !== 'close' && !$('adminScreen').classList.contains('hidden')) renderAdmin(); updateNav && updateNav();
}
