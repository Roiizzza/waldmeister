/* Pausenmenü für alle Spiele: Pause, Steuerung, Ton & Bild, Handbuch.
   Einbinden: <script src="../settings.js" data-game="waldmeister"></script>
   Die Spiele lesen window.GSET (sens, invX, invY, gfx) und window.__gfx(q). Rest erledigt dieses Skript. */
(function(){
'use strict';
var scr=document.currentScript,GID=(scr&&scr.dataset.game)||'x',KEY='gset.v2';
var DEF={sens:1,invX:false,invY:false,ui:1,swap:false,lift:0,vol:.8,gfx:1,fps:false,wake:true};
var S=Object.assign({},DEF);
try{var r=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('gset.v1')||'null');if(r)Object.keys(DEF).forEach(function(k){if(r[k]!==undefined&&typeof r[k]===typeof DEF[k])S[k]=r[k]})}catch(e){}
window.GSET=S;
var ERRS=[];function pushErr(m){ERRS.push(new Date().toISOString().slice(11,19)+' '+String(m).slice(0,300));if(ERRS.length>12)ERRS.shift()}
addEventListener('error',function(e){pushErr((e.message||'Fehler')+' @'+(e.filename||'').split('/').pop()+':'+(e.lineno||''))});addEventListener('unhandledrejection',function(e){pushErr('Promise: '+(e.reason&&e.reason.message||e.reason))});
var ce=console.error;console.error=function(){try{pushErr([].map.call(arguments,String).join(' '))}catch(x){}return ce.apply(console,arguments)};
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
var acc={waldmeister:'#f2b13a',goldwaescher:'#ffc83d',tiefenrausch:'#5fe0c0',minenschicht:'#ffb02e',steinbruch:'#ffa530',wuestensauger:'#f2c14e',hafenmeister:'#4fc3d9',bohrinsel:'#ff8a3d',sternenschmied:'#a78bfa'}[GID]||'#f2b13a';
var CFG={
 waldmeister:{mv:['#joy'],ac:['#bAct','#bUse'],lk:['#look']},
 goldwaescher:{mv:['#joy'],ac:['#bAct','#bUse'],lk:['#look']},
 wuestensauger:{mv:['#joy'],ac:['#bAct','#bUse','#bJump'],lk:['#look']},
 steinbruch:{mv:['#joy'],ac:['#bAct','#bUse','#bJump'],lk:['#look']},
 hafenmeister:{mv:['#joy'],ac:['#bAct','#bUse'],lk:['#look']},
 bohrinsel:{mv:['#joy'],ac:['#bAct','#bUse'],lk:['#look']},
 sternenschmied:{mv:['#joy'],ac:['#bAct','#bUse','#bDodge','#bS1','#bS2','#bS3','#bPot'],lk:['#look']},
 minenschicht:{mv:['#stick'],ac:['.actions'],lk:['#look']},
 tiefenrausch:{mv:['#joy'],ac:['.vbtns'],lk:[]}
}[GID]||{mv:[],ac:[],lk:[]};

/* ---------- Pause: Bildschleife anhalten ---------- */
var raf=window.requestAnimationFrame.bind(window),held=[],paused=false;
window.requestAnimationFrame=function(cb){return raf(function(t){if(paused)held.push(cb);else cb(t)})};
function setPaused(p){paused=p;if(!p){var h=held;held=[];h.forEach(function(cb){raf(cb)})}}

/* ---------- Lautstärke: alles, was zum Lautsprecher geht, läuft über einen Regler ---------- */
var masters=[],oc=AudioNode.prototype.connect;
function masterFor(ctx){if(!ctx.__gm){var g=ctx.createGain();g.gain.value=S.vol;oc.call(g,ctx.destination);ctx.__gm=g;masters.push(g)}return ctx.__gm}
AudioNode.prototype.connect=function(d){if(window.AudioDestinationNode&&d instanceof AudioDestinationNode&&this!==d.context.__gm){return oc.call(this,masterFor(d.context))}return oc.apply(this,arguments)};
function applyVol(){masters.forEach(function(g){try{g.gain.value=S.vol}catch(e){}})}

/* ---------- Grafik ---------- */
function applyGfx(){if(typeof window.__gfx==='function')window.__gfx(S.gfx);else dispatchEvent(new Event('resize'))}

/* ---------- FPS-Anzeige ---------- */
var fpsEl=document.createElement('div');fpsEl.style.cssText='position:fixed;left:50%;bottom:2px;transform:translateX(-50%);z-index:2147483001;font:700 11px ui-monospace,monospace;color:#fff;background:#0008;padding:1px 6px;border-radius:6px;pointer-events:none;display:none';document.body.appendChild(fpsEl);
var fc=0,ft=performance.now(),lastFps=0;
(function loop(){raf(function(t){fc++;if(t-ft>=500){lastFps=Math.round(fc*1000/(t-ft));fpsEl.textContent=lastFps+' FPS';fc=0;ft=t}loop()})})();
function applyFps(){fpsEl.style.display=S.fps?'block':'none'}

/* ---------- Bildschirm anlassen ---------- */
var wl=null;
function wake(){if(!S.wake||!navigator.wakeLock||wl)return;try{navigator.wakeLock.request('screen').then(function(l){wl=l;l.addEventListener('release',function(){wl=null})}).catch(function(){})}catch(e){}}
addEventListener('pointerdown',wake);addEventListener('keydown',wake);document.addEventListener('visibilitychange',function(){if(!document.hidden)wake()});

/* ---------- Touch-Bedienung anordnen ---------- */
function refBox(e){var p=e.offsetParent;if(p){var b=p.getBoundingClientRect();return{l:b.left,r:b.right,b:b.bottom,w:b.width}}return{l:0,r:innerWidth,b:innerHeight,w:innerWidth}}
function els(list){var o=[];list.forEach(function(s){var n=document.querySelectorAll(s);for(var i=0;i<n.length;i++)o.push(n[i])});return o}
var PR=['left','right','bottom','top','transform','transformOrigin'];
function layout(){
 var all=els(CFG.mv.concat(CFG.ac)),lk=els(CFG.lk),items=[];
 all.concat(lk).forEach(function(e){if(!e.__g0){e.__g0={};PR.forEach(function(k){e.__g0[k]=e.style[k]})}PR.forEach(function(k){e.style[k]=e.__g0[k]})});
 if(S.ui===1&&!S.swap&&!S.lift)return;
 all.forEach(function(e){var r=e.getBoundingClientRect();if(r.width<2)return;items.push({e:e,r:r,f:refBox(e),scale:true})});
 lk.forEach(function(e){var r=e.getBoundingClientRect();if(r.width<2)return;items.push({e:e,r:r,f:refBox(e),scale:false})});
 items.forEach(function(it){var r=it.r,f=it.f,e=it.e,left=r.left-f.l,wasLeft=(r.left+r.right)/2-f.l<f.w/2,onLeft=S.swap?!wasLeft:wasLeft;
  if(S.swap)left=f.w-(r.right-f.l);
  e.style.right='auto';e.style.left=left+'px';
  if(it.scale){e.style.top='auto';e.style.bottom=(f.b-r.bottom+S.lift)+'px';e.style.transformOrigin=onLeft?'bottom left':'bottom right';if(S.ui!==1)e.style.transform='scale('+S.ui+')'}})}
var lt=0;function relayout(){clearTimeout(lt);lt=setTimeout(layout,30)}
addEventListener('resize',relayout);addEventListener('orientationchange',relayout);setInterval(layout,900);

/* ---------- Handbuch ---------- */
var PCW='WASD laufen, Maus umsehen (nach dem ersten Klick), Umschalt rennen.';
var TCH='Am Handy: Stick links zum Laufen, rechts wischen zum Umsehen, „Aktion“ gedrückt halten, „Nutzen“ für E.';
var MAN={
 waldmeister:[
  ['Ziel','Aus einer Hütte im dichten Wald zum Holzbaron werden: Bäume fällen, Holz verkaufen, Sägewerk und Fuhrpark aufbauen.'],
  ['Steuerung',PCW+' Aktion: Maus oder Leertaste halten. E: aufheben, Händler, Fahrzeuge. 1 2 3 oder Mausrad: Axt, Säge, Gebäude bauen. M: Ton. '+TCH],
  ['Fällen und sägen','Axt auf den Baum richten, Aktion halten. Der Stamm kracht um und liegt als Rundholz da. Große Stämme zersägen: mit der Axt geht es langsam, mit der Säge schnell.'],
  ['Tragen','Rundholz mit E aufheben. Von Hand passen drei Stück in die Arme, mit der Schubkarre acht. Beim Lager am Hof lädt sich alles von selbst ab.'],
  ['Händler','Mit E verkaufst du, kaufst Werkzeug, Bauplan und Fahrzeuge und lieferst Aufträge. Der Preis schwankt, der aktuelle Kurs steht links oben.'],
  ['Gebäude','Bauplan beim Händler kaufen, dann an einer Baufläche alle Bäume im Ring fällen, Taste 3 wählen und Aktion drücken. Das Sägewerk macht aus Holz Bretter, die Schreinerei aus Brettern Möbel. Beides bringt viel mehr Geld.'],
  ['Fahrzeuge','Pferd mit Karren (braucht den Stall), später Traktor und LKW. Mit E einsteigen, Aktion halten lädt Holz auf, am Lager wird abgeladen.'],
  ['Helfer','Karl und Anna fällen auch dann Bäume, wenn du nicht in der Nähe bist. Bessere Stufen arbeiten schneller.'],
  ['Neu pflanzen','Ganz am Ende kannst du den Wald neu pflanzen (Reiter Erfolge im Shop). Du fängst klein an, verdienst aber dauerhaft mehr.']],
 goldwaescher:[
  ['Ziel','Der Fluss gehört dir. Schaufle Kies, wasche ihn aus, verkaufe das Gold und rüste dich bis zur Waschrinne und zum Radlader auf.'],
  ['Steuerung',PCW+' Aktion: Maus oder Leertaste halten. E: Händler, Geräte, Radlader. 1 2 3 oder Mausrad: Pfanne, Eimer, Geräte, R wechselt das Gerät. M: Ton. Pfeiltasten drehen die Sicht. '+TCH],
  ['Kies und Gold','Suche die grauen Kiesbänke am Ufer und fülle deine Pfanne. Im Wasser halten und waschen: der Kies spült weg, das Gold bleibt.'],
  ['Eimer und Geräte','Der Eimer transportiert mehr Kies. Geräte wie die Waschrinne stellst du am Ufer auf und füllst sie.'],
  ['Händler','Mit E verkaufst du dein Gold und kaufst bessere Ausrüstung. Der Goldkurs in € pro Gramm schwankt, er steht links oben.'],
  ['Radlader','Mit dem Radlader (E zum Einsteigen) bewegst du große Mengen Kies.']],
 tiefenrausch:[
  ['Ziel','Taucher in immer größere Tiefen schicken, Funde sammeln, verkaufen und die Ausrüstung verbessern.'],
  ['Tauchgang','„Tauchgang starten“ drücken. Der Autopilot bringt dich zur eingestellten Zieltiefe. Wenn du ihn ausschaltest, steuerst du selbst: rechts der Joystick, links die Tasten für Auf und Ab, mit dem Finger auf dem Bild drehst du die Kamera. Am PC: WASD, R und F für Auf und Ab, Q und E drehen.'],
  ['Funde und Netz','Schwimm in die Funde hinein, um sie einzusammeln. Das Netz hat nur begrenzt Plätze. Ist es voll, geht es nach oben zum Händler.'],
  ['Händler','Im Tab Händler verkaufst du den Fang. Wer viel vom Selben verkauft, drückt den Preis, er erholt sich mit der Zeit. Gesuchte Funde zahlen doppelt.'],
  ['Upgrades und U-Boot','Mit dem Geld kaufst du Upgrades, die du am Taucher und am U-Boot siehst. Tiefer als 400 m geht es nur mit dem U-Boot (Werft im Tab Händler). Verbessern geht nur an der Luft.'],
  ['Album und Aufträge','Jede vollständige Zone im Album erhöht den Verkaufspreis um 10 %, das ganze Album bringt zusätzlich ×1,25. Aufträge steigen in Stufen, höhere zahlen mehr.'],
  ['Einhand-Modus','In der Tauchansicht oder in den Einstellungen (⚙) einschalten. Dann läuft die Tiefe automatisch bis zur Zieltiefe und der Greifarm arbeitet immer. Finger irgendwo aufs Bild legen und ziehen: seitlich lenkt, nach oben schneller, nach unten bremsen. Loslassen heißt treiben. „Auftauchen“ bleibt unten in der Mitte.'],
  ['Aufstieg','Beim Aufstieg werden Münzen, Ausrüstung und Tiefenrekord zurückgesetzt, das Album bleibt. Jede Leviathan-Perle erhöht alle Einnahmen dauerhaft um 10 %. Tauchdrohnen arbeiten auch, wenn du nicht spielst.']],
 minenschicht:[
  ['Ziel','Den Stollen vorantreiben oder ab der ersten Ader nach unten graben, Gestein abbauen, an der Basis verkaufen und das Werkzeug verbessern.'],
  ['Steuerung am PC','WASD laufen, Maus zielen, Umschalt sprinten, C schleichen, Leertaste springen. F halten zum Abbauen. Rechtsklick oder G an der Basis für die Werkbank. E öffnet das Inventar, Esc pausiert und gibt die Maus frei.'],
  ['Steuerung am Handy','Querformat. Stick links zum Laufen, über die freie Fläche wischen zum Umsehen, A halten zum Abbauen, B für Werkbank und Interaktion.'],
  ['Abbau und Rucksack','Ziele auf die Stollenwand oder hinter dem Eingangsbereich auf den Boden. Die Brocken füllen den Rucksack. Er hat acht Plätze.'],
  ['Werkbank','An der Basis verkaufst du den Rucksack und kaufst besseres Werkzeug. Das Inventar (E) zeigt, was du in der Hand hältst.']],
 sternenschmied:[
  ['Ziel','Die Sterne sind zerbrochen. Sammle Splitter, verschmelze sie zu neuen Kräften, schmiede deine Ausrüstung und besiege die Wächter der fünf Himmelsinseln.'],
  ['Steuerung',PCW+' Angriff: Klick oder F, bis zu drei Schläge als Kombo. Leertaste oder Rechtsklick: Ausweichrolle. 1 2 3: Fähigkeiten. E: Nutzen. H: Heiltrank. I: Menü. Am Handy: Stick links, rechts wischen für die Kamera, rechts unten Angriff, Rolle und drei Fähigkeiten.'],
  ['Kämpfen','Rote Flächen am Boden zeigen, wohin ein Gegner gleich trifft. Aus dem Rot herauslaufen oder durchrollen, die Rolle macht kurz unverwundbar. Der dritte Schlag trifft alle um dich herum.'],
  ['Splitter und Fähigkeiten','Sechs Grundsplitter: Licht, Wind, Blitz, Feuer, Eis, Schatten. Im Menü unter „Fähigkeiten“ legst du drei in die Slots. Jede Fähigkeit kostet Energie und braucht Abklingzeit. Mehr Sterne auf dem Splitter heißt mehr Schaden und kürzere Wartezeit.'],
  ['Verschmelzen','Am Altar in der Himmelsschmiede: zwei gleiche Splitter ergeben einen mit einem Stern mehr. Blitz+Feuer ist Plasma, Eis+Wind ist Schneesturm, Licht+Schatten ist Dämmerung, Feuer+Wind ist Feuersturm.'],
  ['Level und Werte','Jedes Level gibt drei Punkte. Stärke erhöht den Angriff, Vitalität Leben und Rüstung, Geist Zauberkraft und Energie, Tempo Laufgeschwindigkeit und Krit. Du kannst alles gegen Gold neu verteilen.'],
  ['Schmiede und Händler','Die Schmiede veredelt Waffe und Rüstung bis +10 und bietet neue Stufen für Gold und Sternenerz. Der Händler verkauft Heiltränke und kauft überzählige Splitter.'],
  ['Inseln und Wächter','Das Luftschiff am Steg fliegt zu jeder freigeschalteten Insel. In der Inselmitte weckst du den Wächter. Ist er besiegt, öffnet sich die nächste Insel. Wächter lassen sich wiederholen. Stirbst du, wachst du in der Himmelsschmiede auf und verlierst 10 % Gold.'],
  ['Aufträge','Die Tafel in der Himmelsschmiede bietet fünf Aufträge. Fortschritt zählt von selbst, abgeholt wird an der Tafel.']],
 bohrinsel:[
  ['Ziel','Eine Ölplattform im Meer zum Imperium ausbauen: Bohrstellen wählen, fördern, Tanks füllen, Öl verkaufen, Personal einstellen und die Plattform erweitern.'],
  ['Steuerung',PCW+' Bedienen: Maus oder F halten. E: Leitstand öffnen. M: Ton. Am Handy: Stick links, rechts wischen zum Umsehen, „Bedienen“ gedrückt halten, „Nutzen“ für E.'],
  ['Leitstand','Mit E am Leitstand (großes Gebäude vor dir) öffnest du die Verwaltung. Dort gibt es vier Reiter: Betrieb, Bohrstellen, Personal, Ausrüstung.'],
  ['Bohren','Unter „Bohrstellen“ suchst du einen Standort aus (Tiefe, Sterne, Ölmenge, Kosten). Mehr Sterne heißt höhere Förderung. Ein freier Bohrturm bohrt allein. Stell dich an die Konsole vor dem Turm und halte die Aktionstaste, dann bohrst du mit.'],
  ['Fördern und verkaufen','Fertige Bohrlöcher füllen die Tanks. Die Pumpen begrenzen, wie viel pro Sekunde fließt. Tanker legen an und laden das Öl ab, du bekommst den Tagespreis. Wer am Verladearm die Aktionstaste hält, lädt doppelt so schnell.'],
  ['Störungen','Lecks erscheinen als roter Punkt, die Förderung sinkt. Lauf hin und halte die Aktionstaste, oder Techniker kümmern sich. Stürme verspäten die Tanker. Werden die Löhne nicht bezahlt, läuft die Förderung schlechter.'],
  ['Personal','Acht Abteilungen: Bohrmannschaft, Geologen, Techniker, Sicherheit, Logistik, Küche, Ingenieure, Ölhändler. Jeder Kopf kostet Lohn pro Minute. Neue Leute kommen mit dem Hubschrauber. Die Quartiere begrenzen die Zahl.'],
  ['Ausrüstung','Bohrkopf, Bohrsteuerung, Bohrturm (Tiefe), Pumpen, Tanks, Verladearm, Quartiere, Sicherheit, Seismik-Labor und Gasnutzung. Ingenieure machen alles günstiger.'],
  ['Plattform erweitern','Nordflügel: Platz für Bohrtürme 4 bis 6 und Tank 5. Ostflügel: Gasaufbereitung, +8 % Ölpreis. Westflügel: Forschungslabor, +15 % Förderung. Bohrtürme ab Nummer 4 und der fünfte Tank brauchen den Nordflügel.']],
 hafenmeister:[
  ['Ziel','Einen kleinen Hafen zum Umschlagplatz ausbauen: Schiffe entladen, Ware lagern, im Kontor verkaufen, Kran und Hafenarbeiter anschaffen.'],
  ['Steuerung',PCW+' Kiste aufnehmen: Maus oder F halten. E: Kontor öffnen oder Kiste aufnehmen. M: Ton. Am Handy: Stick links, rechts wischen zum Umsehen, „Aufnehmen“ gedrückt halten, „Nutzen“ für E.'],
  ['Schiffe','Ein Schiff legt an und bleibt für eine begrenzte Zeit. Die Liste rechts oben zeigt Liegeplatz, Restladung und Restzeit. Läuft die Zeit ab, fährt es mit der Restladung weiter.'],
  ['Kisten tragen','Über die Gangway aufs Deck gehen, Kiste anschauen und halten. Du trägst zuerst nur 2 Einheiten. Container zählen 3 und brauchen mindestens die Handkarre. Zum Abladen in die gelbe Zone vor dem Lager laufen, es lädt sich von allein ab.'],
  ['Kontor','Mit E im Kontor verkaufst du das Lager zum Tagespreis. Die Preise schwanken, ▲ heißt gut. Frachtbriefe zahlen etwa 70 % mehr, wenn du die verlangte Menge im Lager hast.'],
  ['Pünktlich entladen','Ist ein Schiff leer, bevor die Zeit abläuft, gibt es einen Pünktlichkeitsbonus von 30 % des Warenwerts.'],
  ['Ausbau','Handkarre, Elektrokarren und Gabelstapler erhöhen die Tragkraft. Die Lagerhalle fasst mehr. Der Kran entlädt allein, Hafenarbeiter tragen allein. Weitere Liegeplätze, der Tiefwasserkai (Frachter mit Fässern) und das Containerterminal bringen größere Schiffe.'],
  ['Ansehen','Je mehr Ware du umschlägst, desto höher dein Ansehen. Es erhöht alle Preise und Boni bis auf ×2,5.']],
 wuestensauger:[
  ['Ziel','Die Wüste ist verstaubt. Sauge Sand, verkaufe ihn und kaufe bessere Geräte, Fahrzeuge und Roboter, bis die Wüste sauber ist.'],
  ['Steuerung',PCW+' Leertaste springt. Saugen: Maus oder F halten. E: Händler, Fahrzeug ein- und aussteigen. M: Ton. '+TCH+' Der Knopf „Saugen“ saugt.'],
  ['Saugen','Düse auf den Sand halten. Der Beutel hat nur begrenzt Platz. Am Silo entleert er sich automatisch.'],
  ['Sandsorten','Dünensand ist wenig wert, Roter Sand, Quarzsand, Vulkansand und Goldsand immer mehr. Wertvolle Sorten liegen oft weiter weg.'],
  ['Händler','Mit E verkaufst du den Sand aus dem Silo und kaufst Geräte, Fahrzeuge, Roboter und Anlagen. Aufträge zahlen mehr.'],
  ['Fahrzeuge','Kehrmaschine, Reinigungswagen und Mega-Saugwagen saugen beim Fahren und leeren sich am Silo selbst.'],
  ['Roboter','Saugroboter und Wüstenwalzen suchen allein Sand und bringen ihn zum Silo.'],
  ['Veredeln','Die Wäscherei macht Sand wertvoller (etwa ×1,8), die Glashütte noch mehr (etwa ×4,2).'],
  ['Sandsturm','Gelegentlich weht ein Sturm neuen Sand heran. Saubere Stellen können Funde freigeben.'],
  ['Neue Wüste','Ist die Wüste zu 90 % sauber, kannst du eine neue erschließen. Dein Besitz bleibt, alle Preise steigen um 25 %.']],
 steinbruch:[
  ['Ziel','Dir gehört ein Berg. Trag ihn Schicht für Schicht ab, verkaufe den Stein, veredle ihn und baue Maschinen und ein Team auf.'],
  ['Steuerung',PCW+' Leertaste springt. Aktion: Maus oder F halten. E: Händler, Dumper, Fahrstuhl. 1 2 3 4 oder Mausrad: Spitzhacke, Presslufthammer, Dynamit, Gleise. M: Ton. '+TCH+' Der Knopf „Sprung“ springt.'],
  ['Abbauen','Hacke auf den Fels, Aktion halten: Die oberste Schicht der Säule geht ab, ein Brocken fällt heraus. Je tiefer, desto härter und wertvoller: Abraum (wertlos), Kalkstein, Sandstein, Granit, Marmor.'],
  ['Terrassenregel','Eine Säule geht nur ab, wenn kein Nachbar mehr als eine Schicht tiefer liegt. So entstehen Stufen statt Löcher. Steht da „Zu tief“, erst die Nachbarsäulen abtragen.'],
  ['Brocken tragen','Brocken laufen von selbst in deine Hände (von Hand zwei, mit Schubkarre sechs, mit Doppelkarre zwölf). Vor der Rampe laden sie sich ab. Das Lager hat nur begrenzt Platz.'],
  ['Händler','Mit E verkaufst du Rohstein, Quader und Bauteile, kaufst Ausrüstung und lieferst Aufträge. Der Marktpreis schwankt.'],
  ['Veredeln','Der Steinmetz macht aus Rohstein Quader (etwa ×2,2), die Bildhauerwerkstatt aus Quadern Bauteile (etwa ×5,7). Gebaut wird automatisch beim Kauf, Stufen machen schneller.'],
  ['Dynamit und Hammer','Dynamit (Taste 3) sprengt nach kurzer Zündschnur mehrere Säulen auf einmal, bis zu 7×7. Der Presslufthammer (Taste 2) baut schneller ab.'],
  ['Dumper und Helfer','Dumper laden Brocken im Vorbeifahren auf (E zum Einsteigen, WASD fahren). Karl baut allein ab, Anna trägt allein zur Rampe. Du kannst mehrere Schürfer und Trägerinnen anstellen, dazu Bagger, Radlader und Sprengmeister Bruno.'],
  ['Tiefbau','Am Förderturm links vom Hof fährt der Fahrstuhl (E) in bis zu drei tiefere Sohlen, jede mit härterem und wertvollerem Fels. Sitzt du im Fahrzeug oder steht es auf dem Fahrstuhl, fährt es mit. Die Sohlen kaufst du beim Händler im Reiter Tiefbau.'],
  ['Schätze','Im Fels stecken Funde (Fossilien, Edelsteine, Relikte). Der Detektor zeigt sie als Funkeln, Emil gräbt gezielt danach. Im Reiter Funde siehst du dein Fundbuch. Jeder neue Fund erhöht alle Preise um 2 %.'],
  ['Gleise und Loren','Mit dem Gleisbau (Taste 4) legst du ab dem Hof Gleise. Aktion legt ein Stück, E nimmt das letzte zurück. Die Lore lädt am Gleisende Brocken und bringt sie allein zum Lager. Der Händlervertrag verkauft das volle Lager automatisch.'],
  ['Neuer Berg','Ist der Berg zu 90 % abgetragen, erschließt du im Shop (Reiter Berg) einen neuen. Dein Besitz bleibt, alle Preise steigen um 25 %.']]
};

/* ---------- Oberfläche ---------- */
var host=document.createElement('div');host.style.cssText='position:fixed;z-index:2147483001;left:0;top:0;width:0;height:0';document.body.appendChild(host);
var sh=host.attachShadow({mode:'open'});
var pos=GID==='tiefenrausch'?'top:12px;right:168px':'top:10px;left:50%;margin-left:21px';
var name={waldmeister:'Waldmeister',goldwaescher:'Goldwäscher',tiefenrausch:'Tiefenrausch',minenschicht:'Minenschicht',steinbruch:'Steinbruch-Baron',wuestensauger:'Wüstensauger',hafenmeister:'Hafenmeister',bohrinsel:'Bohrinsel',sternenschmied:'Sternenschmied'}[GID]||'Spiel';
function sw(id,label,small){return '<div class="r"><span>'+label+'</span><button class="sw" id="'+id+'" type="button" role="switch"></button>'+(small?'<small>'+small+'</small>':'')+'</div>'}
function man(){return (MAN[GID]||[]).map(function(m,i){return '<details'+(i===0?' open':'')+'><summary>'+m[0]+'</summary><p>'+m[1]+'</p></details>'}).join('')}
sh.innerHTML='<style>*{box-sizing:border-box}'+
'.q{position:fixed;'+pos+';width:30px;height:30px;border-radius:50%;border:1px solid #fff5;background:#000a;color:#fff;font:700 15px system-ui,sans-serif;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}'+
'.ov{position:fixed;left:0;top:0;width:100vw;height:100vh;height:100dvh;display:none;align-items:center;justify-content:center;background:rgba(5,8,10,.78);padding:10px;font-family:"Alegreya Sans","Figtree",system-ui,sans-serif;color:#f4efe2}.ov.on{display:flex}'+
'.c{width:min(500px,100%);max-height:100%;background:#181b1e;border:1px solid '+acc+'55;border-radius:18px;box-shadow:0 20px 60px #000a;display:flex;flex-direction:column;overflow:hidden}'+
'.hd{padding:12px 16px 0;display:flex;align-items:baseline;justify-content:space-between;gap:8px}'+
'h2{margin:0;font:400 22px/1.1 Bevan,Rye,"Bricolage Grotesque",Georgia,serif;color:#fff}.pz{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:'+acc+';font-weight:700}'+
'.tabs{display:flex;gap:4px;padding:10px 12px 0;overflow-x:auto;flex-shrink:0}.hd{flex-shrink:0}.body{min-height:0}.tabs button{font:inherit;font-weight:700;font-size:14px;padding:7px 11px;border-radius:10px 10px 0 0;border:0;background:#ffffff10;color:#cfc8b8;cursor:pointer;white-space:nowrap}.tabs button.on{background:'+acc+';color:#1d1405}'+
'.body{padding:12px 16px 16px;overflow:auto;display:flex;flex-direction:column;gap:10px;border-top:2px solid '+acc+'}'+
'.tp{display:none;flex-direction:column;gap:10px}.tp.on{display:flex}'+
'h3{margin:6px 0 0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:'+acc+'}'+
'.r{display:grid;grid-template-columns:1fr auto;gap:2px 12px;align-items:center;font-size:17px}.r small{grid-column:1/3;color:#a9a393;font-size:13px;line-height:1.25}'+
'.r output{font-weight:800;color:'+acc+';min-width:54px;text-align:right}'+
'input[type=range]{grid-column:1/3;width:100%;accent-color:'+acc+';height:28px}'+
'.sw{position:relative;width:48px;height:28px;border-radius:14px;background:#ffffff22;border:0;cursor:pointer;padding:0}.sw::after{content:"";position:absolute;left:3px;top:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.15s}.sw.on{background:'+acc+'}.sw.on::after{left:23px;background:#1d1405}'+
'.seg{display:flex;gap:6px;grid-column:1/3}.seg button{flex:1;font:inherit;font-weight:700;padding:8px 4px;border-radius:10px;border:1px solid #fff3;background:#ffffff10;color:#f4efe2;cursor:pointer}.seg button.on{background:'+acc+';color:#1d1405;border-color:'+acc+'}'+
'button.b{font:inherit;font-weight:800;border-radius:12px;padding:11px 16px;cursor:pointer;border:1px solid #fff3;background:#ffffff14;color:#f4efe2;text-align:center;text-decoration:none;display:block}button.b.p{background:'+acc+';color:#1d1405;border:0;font-size:18px}'+
'a.b{font:inherit;font-weight:800;border-radius:12px;padding:11px 16px;border:1px solid #fff3;background:#ffffff14;color:#f4efe2;text-align:center;text-decoration:none;display:block}'+
'details{background:#ffffff0c;border-radius:12px;padding:8px 12px}summary{cursor:pointer;font-weight:800;font-size:17px;color:#fff}details p{margin:6px 0 2px;font-size:16px;line-height:1.4;color:#cfc8b8}'+
'textarea{width:100%;font:inherit;font-size:16px;padding:8px 10px;border-radius:10px;border:1px solid #fff3;background:#0006;color:#f4efe2;resize:vertical}'+
'.note{font-size:14px;color:#a9a393;line-height:1.35}'+
'@media (max-height:480px){.hd{padding-top:8px}h2{font-size:18px}.body{padding:8px 14px 12px}}'+
'</style><button class="q" type="button" aria-label="Menü">☰</button>'+
'<div class="ov" role="dialog" aria-label="Pausenmenü"><div class="c"><div class="hd"><h2>'+name+'</h2><span class="pz">Pausiert</span></div>'+
'<div class="tabs"><button data-t="0" class="on" type="button">Pause</button><button data-t="1" type="button">Steuerung</button><button data-t="2" type="button">Ton &amp; Bild</button><button data-t="3" type="button">Handbuch</button><button data-t="4" type="button">Fehler melden</button></div>'+
'<div class="body">'+
'<div class="tp on" data-p="0"><button class="b p" id="go" type="button">Weiter spielen</button><button class="b" id="tut" type="button">Kurzanleitung ansehen</button><button class="b" id="man" type="button">Handbuch öffnen</button><button class="b" id="fs" type="button">Vollbild</button><a class="b" id="home" href="../">Zurück zur Spielauswahl</a><p class="note">Das Spiel steht still, solange das Menü offen ist. Esc oder P öffnet und schließt es. Der Spielstand wird im Browser gespeichert.</p></div>'+
'<div class="tp" data-p="1"><h3>Blick</h3>'+
'<div class="r"><span>Empfindlichkeit</span><output id="oS"></output><input id="iS" type="range" min="0.3" max="3" step="0.05"><small>Wie schnell sich die Sicht mit Maus oder Finger dreht.</small></div>'+
sw('bY','Oben und unten umkehren')+sw('bX','Links und rechts umkehren')+
'<h3>Touch-Bedienung</h3>'+
'<div class="r"><span>Größe</span><output id="oU"></output><input id="iU" type="range" min="0.6" max="1.6" step="0.05"></div>'+
sw('bW','Seiten tauschen','Stick und Knöpfe wechseln die Seite, die Blickfläche auch.')+
'<div class="r"><span>Höhe vom unteren Rand</span><output id="oL"></output><input id="iL" type="range" min="0" max="160" step="5"></div></div>'+
'<div class="tp" data-p="2"><h3>Ton</h3><div class="r"><span>Lautstärke</span><output id="oV"></output><input id="iV" type="range" min="0" max="1" step="0.05"></div>'+
'<h3>Bild</h3><div class="r"><span>Grafikqualität</span><div class="seg" id="gq"><button data-g="0.55" type="button">Niedrig</button><button data-g="0.8" type="button">Mittel</button><button data-g="1" type="button">Hoch</button></div><small>Niedrig läuft auf schwachen Handys flüssiger, das Bild wird dafür weicher.</small></div>'+
sw('bF','FPS anzeigen')+sw('bK','Bildschirm anlassen','Verhindert, dass das Handy beim Spielen dunkel wird.')+
'<button class="b" id="rs" type="button">Alle Einstellungen zurücksetzen</button></div>'+
'<div class="tp" data-p="3">'+man()+'</div>'+
'<div class="tp" data-p="4"><p class="note">Beschreibe kurz, was nicht stimmt. Technische Angaben (Spiel, Gerät, Einstellungen, letzte Fehlermeldungen) werden automatisch angehängt.</p><textarea id="bt" rows="4" placeholder="Was ist passiert? Was hast du erwartet?"></textarea>'+
'<button class="b p" id="bs" type="button">Bericht speichern</button><a class="b" id="bg" href="#" target="_blank" rel="noopener">Als GitHub-Meldung senden</a><button class="b" id="bc" type="button">Bericht kopieren</button><p class="note" id="bn"></p><button class="b" id="bd" type="button">Gespeicherte Berichte löschen</button></div>'+
'</div></div></div>';
var $=function(s){return sh.querySelector(s)},ov=$('.ov'),tabs=sh.querySelectorAll('.tabs button'),tps=sh.querySelectorAll('.tp');
function tab(i){[].forEach.call(tabs,function(b,k){b.classList.toggle('on',k===i)});[].forEach.call(tps,function(p,k){p.classList.toggle('on',k===i)});$('.body').scrollTop=0}
[].forEach.call(tabs,function(b){b.addEventListener('click',function(){tab(+b.dataset.t)})});
function sync(){$('#iS').value=S.sens;$('#oS').textContent='×'+S.sens.toFixed(2).replace('.',',');$('#iU').value=S.ui;$('#oU').textContent=Math.round(S.ui*100)+' %';$('#iL').value=S.lift;$('#oL').textContent=S.lift+' px';
 $('#iV').value=S.vol;$('#oV').textContent=Math.round(S.vol*100)+' %';
 [].forEach.call(sh.querySelectorAll('#gq button'),function(b){b.classList.toggle('on',+b.dataset.g===S.gfx)});
 var m={bY:S.invY,bX:S.invX,bW:S.swap,bF:S.fps,bK:S.wake};Object.keys(m).forEach(function(k){var e=$('#'+k);e.classList.toggle('on',m[k]);e.setAttribute('aria-checked',m[k])})}
function chg(){save();sync();layout()}
$('#iS').addEventListener('input',function(e){S.sens=+e.target.value;chg()});
$('#iU').addEventListener('input',function(e){S.ui=+e.target.value;chg()});
$('#iL').addEventListener('input',function(e){S.lift=+e.target.value;chg()});
$('#iV').addEventListener('input',function(e){S.vol=+e.target.value;applyVol();chg()});
$('#bY').addEventListener('click',function(){S.invY=!S.invY;chg()});$('#bX').addEventListener('click',function(){S.invX=!S.invX;chg()});$('#bW').addEventListener('click',function(){S.swap=!S.swap;chg()});
$('#bF').addEventListener('click',function(){S.fps=!S.fps;applyFps();chg()});
$('#bK').addEventListener('click',function(){S.wake=!S.wake;if(S.wake)wake();else if(wl){try{wl.release()}catch(e){}wl=null}chg()});
[].forEach.call(sh.querySelectorAll('#gq button'),function(b){b.addEventListener('click',function(){S.gfx=+b.dataset.g;applyGfx();chg()})});
$('#rs').addEventListener('click',function(){Object.assign(S,DEF);applyVol();applyGfx();applyFps();chg()});
var BK='gbugs.v1';
function bugs(){try{return JSON.parse(localStorage.getItem(BK)||'[]')}catch(e){return[]}}
function report(){var d={spiel:name,id:GID,zeit:new Date().toISOString(),seite:location.pathname,text:($('#bt').value||'').trim(),fenster:innerWidth+'x'+innerHeight+' @'+(window.devicePixelRatio||1),touch:('ontouchstart' in window),browser:navigator.userAgent,fps:lastFps,einstellungen:S,fehler:ERRS.slice()};return d}
function reportText(d){return 'Spiel: '+d.spiel+' ('+d.id+')\nZeit: '+d.zeit+'\nFenster: '+d.fenster+(d.touch?' · Touch':'')+' · FPS '+d.fps+'\nBrowser: '+d.browser+'\nEinstellungen: '+JSON.stringify(d.einstellungen)+'\nLetzte Fehler:\n'+(d.fehler.length?d.fehler.join('\n'):'keine')+'\n\nBeschreibung:\n'+(d.text||'(leer)')}
function bnote(){var n=bugs().length;$('#bn').textContent=n?n+' Bericht'+(n>1?'e':'')+' auf diesem Gerät gespeichert.':'Noch kein Bericht gespeichert.'}
function updGh(){var d=report(),t=reportText(d),title='['+d.spiel+'] '+(d.text||'Fehlerbericht').split('\n')[0].slice(0,70);$('#bg').href='https://github.com/Roiizzza/waldmeister/issues/new?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(t.slice(0,5500))}
$('#bt').addEventListener('input',updGh);$('#bg').addEventListener('click',function(){updGh();var d=report();if(!d.text){}});
$('#bs').addEventListener('click',function(){var d=report();if(!d.text){$('#bn').textContent='Bitte zuerst kurz beschreiben, was nicht stimmt.';return}var a=bugs();a.push(d);if(a.length>30)a.shift();try{localStorage.setItem(BK,JSON.stringify(a))}catch(e){}$('#bt').value='';bnote();$('#bn').textContent='Gespeichert. '+$('#bn').textContent+' Zum Auswerten „Als GitHub-Meldung senden“ nutzen.';updGh()});
$('#bc').addEventListener('click',function(){var t=reportText(report());try{navigator.clipboard.writeText(t).then(function(){$('#bn').textContent='Kopiert.'},function(){$('#bn').textContent='Kopieren nicht möglich.'})}catch(e){$('#bn').textContent='Kopieren nicht möglich.'}});
$('#bd').addEventListener('click',function(){try{localStorage.removeItem(BK)}catch(e){}bnote()});
function open(t){try{if(document.pointerLockElement)document.exitPointerLock()}catch(e){}ov.classList.add('on');setPaused(true);sync();tab(t||0);bnote();updGh()}
function close(){ov.classList.remove('on');setPaused(false);save()}
function isOpen(){return ov.classList.contains('on')}
$('.q').addEventListener('click',function(e){e.stopPropagation();isOpen()?close():open(0)});
$('#go').addEventListener('click',close);
$('#tut').addEventListener('click',function(){close();if(window.__guide)window.__guide.open(0)});
$('#man').addEventListener('click',function(){tab(3)});
$('#fs').addEventListener('click',function(){try{var d=document,e=d.documentElement;if(d.fullscreenElement)d.exitFullscreen();else if(e.requestFullscreen)e.requestFullscreen()}catch(x){}});
ov.addEventListener('pointerdown',function(e){e.stopPropagation()});ov.addEventListener('click',function(e){if(e.target===ov)close()});
addEventListener('keydown',function(e){
 if(isOpen()){var tg=e.composedPath&&e.composedPath()[0],typing=tg&&/TEXTAREA|INPUT/.test(tg.tagName);if(typing&&e.code!=='Escape'){e.stopImmediatePropagation();return}if(e.code==='Escape'||e.code==='KeyP'){e.stopImmediatePropagation();e.preventDefault();close();return}if(e.code==='Tab')return;e.stopImmediatePropagation();return}
 if(e.code==='KeyP'&&!e.repeat&&!(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))&&!(window.__guideOpen&&window.__guideOpen())){e.stopImmediatePropagation();open(0)}},true);
addEventListener('keyup',function(e){if(isOpen())e.stopImmediatePropagation()},true);
window.__gset={open:open,close:close,layout:layout,S:S,isOpen:isOpen,paused:function(){return paused}};
applyFps();if(S.gfx!==1)setTimeout(applyGfx,50);
layout();
})();
