import {stations,blocks,prices,dist,newGame,buy,tickGoods,job,move,recordPoint,finishRoute,stepClone} from './simulation.js';
import {makeWorld} from './world.js';
const $=id=>document.getElementById(id), key='spielwiese.klonwerk.v1';
let s=newGame();
try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.v===1&&saved.player&&Array.isArray(saved.clones))s=saved;}catch{}
let storeError=false;
function save(){try{localStorage.setItem(key,JSON.stringify(s));}catch{if(!storeError){storeError=true;toast('Der Browser konnte den Spielstand nicht speichern.');}}}
let world;try{world=makeWorld($('game'));}catch(e){$('failure').hidden=false;$('failure').textContent='Die 3D-Ansicht konnte nicht starten. Aktiviere WebGL im Browser und lade die Seite neu.';throw e;}
const shopInfo={cart:['Sackkarre','Bis zu drei Kisten pro Tour tragen.'],power:['Stromanschluss','Magnetgreifer und Ballenpresse einschalten.'],gate:['Rolltor','Öffnet den direkten Weg zum Warenlager.'],bin:['Zwischenlager','Platz für 18 Kisten und 9 Metallballen.']};
const names={dock:'Kiste nehmen',store:'Kisten abliefern',magnet:'Greifer bedienen',press:'Ballen nehmen',buyer:'Metall verkaufen',booth:'Klonkabine öffnen',gate:'Rolltor reparieren'};
const modes={idle:'Bereit zur Aufnahme',trial:'Im Probelauf',ready:'Probelauf fertig',loop:'Wiederholt die Route',pause:'Route pausiert'};
let selected=0,record=null,page='',manualTarget='',nearest='',tracked='',messageUntil=0,glowUntil=0,angle=.25,zoom=1,saveClock=0,hudClock=0,last=performance.now();
let stick=null,look=null,joyX=0,joyZ=0,magnetTime=0,magnetAccuracy=.5;
const keys=new Set(),canvas=$('game');
function toast(text){$('message').textContent=text;$('message').classList.add('on');messageUntil=performance.now()+2600;}
function open(name){page=name;keys.clear();endTouch();$('overlay').hidden=false;renderPanel();$('close').focus({preventScroll:true});}
function close(){page='';$('overlay').hidden=true;}
function progress(){
  if(s.player.cargo==='box')return ['Zum Warenlager','Liefere die Kiste im markierten Feld ab. Das geschlossene Tor lässt sich südlich umgehen.','store'];
  if(s.player.cargo==='bale')return ['Metall verkaufen','Bringe den Metallballen zum Händler.','buyer'];
  if(record)return ['Route vormachen','Führe den Job aus und tippe danach auf Testen.',record.route.some(p=>p.act)?'':'dock'];
  if(!s.clones.length)return s.cash<60?['Erste Lieferung','Hole eine blaue Kiste an der Laderampe.','dock']:['Ersten Klon holen','An der Klonkabine wartet dein erster Mitarbeiter.','booth'];
  if(s.clones.some(c=>c.mode==='ready'))return ['Probelauf fertig','Öffne dein Klonteam und starte die Wiederholung.',''];
  if(s.clones.every(c=>c.mode==='idle'))return ['Route aufnehmen','Gehe zum Startpunkt. Öffne dein Klonteam und wähle „Aufnehmen“.','dock'];
  if(!s.up.power)return ['Schrottplatz öffnen','Spare 220 CR für den Stromanschluss in der Werkstatt.',''];
  if(!s.bales&&!s.charge)return ['Metall pressen','Bediene den Magnetgreifer am Schrottplatz.','magnet'];
  return ['Metall verladen','Hole einen Ballen an der Ausgabe ab.','press'];
}
function findStation(){
  const list=Object.keys(stations).filter(id=>(id!=='gate'||!s.up.gate)&&dist(s.player,stations[id])<=3.15);
  return list.sort((a,b)=>dist(s.player,stations[a])-dist(s.player,stations[b]))[0]||'';
}
function updateHud(){
  nearest=findStation();const [title,body,goal]=progress();tracked=manualTarget||goal;
  $('cash').textContent=s.cash;$('fleetCount').textContent=s.clones.length+'/2';
  $('taskTitle').textContent=title;$('taskBody').textContent=body;
  const next=!s.clones.length?60:!s.up.power?220:s.clones.length<2?320:450;
  $('taskFoot').textContent=!s.clones.length?'Erster Klon':!s.up.power?'Stromanschluss':s.clones.length<2?'Zweiter Klon':s.up.bin?'Klonverdienst':'Zwischenlager';
  const done=s.up.bin&&s.clones.length===2; $('goalCount').textContent=done?s.passive+' CR':s.cash+' / '+next+' CR';
  $('fill').style.width=(done?100:Math.min(100,s.cash/next*100))+'%';
  $('location').lastElementChild.textContent=s.player.x>6?'Schrottplatz':'Alter Hafen';
  $('actName').textContent=nearest?names[nearest]:'Hafenplan';$('recordBar').hidden=!record;
  if(record)$('steps').textContent=record.actions+' Schritte';
  if(!nearest&&tracked)$('actName').textContent='Weg anzeigen';
}
function marker(){
  const el=$('marker');if(!tracked||page){el.hidden=true;return;}
  const t=stations[tracked],p=world.project(t.x,1.15,t.z),w=innerWidth,h=innerHeight;
  const vx=t.x-s.player.x,vz=t.z-s.player.z;
  const rx=vx*Math.cos(angle)-vz*Math.sin(angle),rz=vx*Math.sin(angle)+vz*Math.cos(angle);
  const arrow=['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(Math.atan2(rz,rx)/(Math.PI/4))+8)%8];
  const off=!p.visible||p.left<54||p.left>w-54||p.top<85||p.top>h-55;
  el.hidden=false;el.style.left=Math.min(w-80,Math.max(80,p.left))+'px';el.style.top=Math.min(h-76,Math.max(w<620?74:90,p.top))+'px';
  el.querySelector('span').textContent=(off?arrow+' ':'')+t.name+' · '+Math.round(dist(t,s.player))+' m';
}
function work(id){
  const before=s.cash;const err=job(s,s.player,id);
  if(err){toast(err);return;}
  if(record){recordPoint(record.route,s.player,id);record.actions++;}
  if(manualTarget===id)manualTarget='';
  if(s.cash>before)toast('+'+(s.cash-before)+' CR · Lieferung angenommen');
  else if(id==='dock')toast('Kiste geladen · '+s.player.qty+' / '+(s.up.cart?3:1));
  else if(id==='magnet')toast('Metall aufgenommen · Presse läuft');
  else toast('Metallballen geladen');
  updateHud();save();
}
function interact(){
  if(page==='magnet'){grab();return;}if(page)return;
  nearest=findStation();if(!nearest){open('map');return;}
  if(nearest==='booth'){open('fleet');return;}
  if(nearest==='gate'){open('shop');return;}
  if(nearest==='magnet'){
    if(!s.up.power){open('shop');return;}
    if(s.charge||s.bales>=(s.up.bin?9:3)){toast(s.charge?'Presse arbeitet':'Ballenausgabe voll');return;}
    magnetTime=0;open('magnet');return;
  }
  work(nearest);
}
function grab(){if(magnetAccuracy<.32||magnetAccuracy>.69){$('magFeedback').textContent='Knapp daneben. Versuche es nochmal.';return;}close();work('magnet');}
function begin(i){
  const c=s.clones[i];if(s.player.qty||c.qty){toast('Liefere die aktuelle Ladung zuerst ab.');return;}
  if(record){toast('Eine Aufnahme läuft bereits.');return;}
  selected=i;record={index:i,route:[],actions:0};recordPoint(record.route,s.player);manualTarget='';close();
  toast('Aufnahme läuft. Zeige deinem Klon den Job.');updateHud();
}
function finish(){if(!record)return;recordPoint(record.route,s.player);let err=finishRoute(s,s.clones[record.index],record.route);if(err){toast(err);return;}record=null;updateHud();toast('Probelauf gestartet');save();}
function discard(){record=null;updateHud();toast('Aufnahme verworfen');}
function purchase(item){let err=buy(s,item);if(err){toast(err);return;}save();updateHud();renderPanel();toast(item==='clone'?'Klon bereit. Gehe zum Startpunkt deiner Route.':shopInfo[item][0]+' freigeschaltet');}
function btn(label,action,cls='primary',disabled=false){return '<button class="'+cls+'" data-action="'+action+'" '+(disabled?'disabled':'')+'>'+label+'</button>';}
function shopRow(label,desc,item,price,owned){return '<div class="row"><div><b>'+label+'</b><small>'+desc+'</small></div>'+btn(owned?'Aktiv':price+' CR','buy-'+item,'primary',owned||s.cash<price)+'</div>';}
function renderPanel(){
  const content=$('content');
  $('panelTitle').textContent=({fleet:'Klonteam',shop:'Werkstatt',map:'Hafenplan',help:'Steuerung',magnet:'Magnetgreifer'})[page]||'';
  if(page==='fleet'){
    content.innerHTML='<p>Stelle dich an deinen Startpunkt und zeige dem Klon den Ablauf. Nach dem Probelauf kannst du die Route wiederholen lassen.</p>'+
      s.clones.map((c,i)=>'<div class="cloneCard"><b>Klon '+String(i+1).padStart(2,'0')+'</b><small>'+(c.wait||modes[c.mode])+' · '+c.paid+' CR verdient</small><div class="actions">'+
        btn(c.route.length?'Neu aufnehmen':'Aufnehmen','rec-'+i,'primary',!!record||!!c.qty)+
        (['ready','pause'].includes(c.mode)?btn(c.mode==='ready'?'Wiederholen':'Fortsetzen','run-'+i):'')+
        (['loop','trial'].includes(c.mode)?btn('Anhalten','pause-'+i,'secondary'):'')+
        (c.route.length?btn('Route zeigen','show-'+i,'secondary'):'')+'</div></div>').join('')+
      (s.clones.length<2?shopRow(s.clones.length?'Zweiter Klon':'Erster Klon','Nimmt einen eigenen Arbeitsablauf auf.','clone',s.clones.length?320:60,false):'');
  }else if(page==='shop'){
    content.innerHTML='<p>Verfügbar: <b>'+s.cash+' CR</b></p>'+['gate','cart','power','bin'].map(k=>shopRow(...shopInfo[k],k,prices[k],!!s.up[k])).join('');
  }else if(page==='map'){
    content.innerHTML='<canvas id="plan" width="660" height="330"></canvas><p>Wähle ein Ziel für die Markierung in der Spielwelt.</p><div class="mapList">'+Object.entries(stations).map(([id,t])=>btn(t.name,'target-'+id,tracked===id?'chosen':'')).join('')+'</div>';drawMap();
  }else if(page==='magnet'){
    content.innerHTML='<p>Der Greifer schwenkt über den Schrotthaufen. Löse den Magneten aus, sobald der Zeiger im grünen Bereich steht.</p><div class="gauge"><i id="needle"></i></div>'+btn('Magnet auslösen · E','grab')+'<p id="magFeedback" role="status"></p>';
  }else if(page==='help'){
    content.innerHTML='<div class="row"><b>Gehen</b><span>WASD / Pfeiltasten</span></div><div class="row"><b>Aktion</b><span>E / Aktionstaste</span></div><div class="row"><b>Kamera</b><span>Ziehen / Q und R</span></div><div class="row"><b>Zoom</b><span>Mausrad</span></div><p>Auf dem Handy links ziehen zum Laufen, rechts wischen zum Drehen. Die Aktionsfläche unten rechts zeigt, was du vor Ort tun kannst.</p><p>Beim Aufnehmen merkt sich dein Klon den Weg und deine erfolgreichen Arbeitsschritte. Fehlender Nachschub lässt ihn warten. Spielstand und Klonrouten bleiben auf diesem Gerät gespeichert.</p><a href="../">Zur Spielwiese</a>';
  }
}
function drawMap(){const c=$('plan');if(!c)return;const ctx=c.getContext('2d'),sx=v=>(v+39)*8.3,sz=v=>(v+16)*8.3;
  ctx.fillStyle='#c4bfa9';ctx.fillRect(0,0,660,330);ctx.fillStyle='#609c9e';ctx.fillRect(0,0,660,sz(-13));ctx.fillStyle='#c9a26a';ctx.fillRect(0,sz(7.3),660,20);
  ctx.fillStyle='#7e8980';for(const [x,z,w,d] of blocks)ctx.fillRect(sx(x-w/2),sz(z-d/2),w*8.3,d*8.3);
  for(const c of s.clones){ctx.fillStyle='#246d72';ctx.fillRect(sx(c.x)-4,sz(c.z)-4,8,8);}
  ctx.font='bold 12px system-ui';for(const [id,t] of Object.entries(stations)){
    const x=sx(t.x),y=sz(t.z);ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fillStyle=id===tracked?'#efb447':'#294b49';ctx.fill();ctx.fillStyle='#243f3b';
    ctx.textAlign='center';ctx.fillText(t.name,x,y+(id==='gate'?20:-10));}
  ctx.beginPath();ctx.arc(sx(s.player.x),sz(s.player.z),6,0,Math.PI*2);ctx.fillStyle='#de682a';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='white';ctx.stroke();}
$('content').onclick=e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(!a)return;const [cmd,id]=a.split('-');const i=Number(id);
 if(cmd==='buy')purchase(id);else if(cmd==='rec')begin(i);else if(cmd==='target'){manualTarget=id;close();updateHud();}
 else if(cmd==='grab')grab();else if(cmd==='show'){selected=i;glowUntil=performance.now()+12000;close();toast('Klonroute eingeblendet');}
 else if(cmd==='run'||cmd==='pause'){const c=s.clones[i];if(cmd==='pause'){c.resume=c.mode;c.mode='pause';}else{c.mode=c.mode==='pause'?c.resume||'loop':'loop';c.wait='';}save();renderPanel();}};
$('shopBtn').onclick=()=>open('shop');$('fleetBtn').onclick=()=>open('fleet');$('mapBtn').onclick=()=>open('map');$('help').onclick=()=>open('help');$('close').onclick=close;$('overlay').onclick=e=>{if(e.target===$('overlay'))close();};$('act').onclick=interact;$('finish').onclick=finish;$('discard').onclick=discard;
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
 if(!e.repeat){if(k==='escape'){close();return;}if(k==='e'){interact();return;}if(k==='m'){page==='map'?close():open('map');return;}}
 if(!page)keys.add(k);});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function endTouch(){stick=null;look=null;joyX=0;joyZ=0;$('stick').style.display='none';}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);if(e.pointerType!=='mouse'&&e.clientX<innerWidth*.53&&!stick){
 stick={id:e.pointerId,x:e.clientX,y:e.clientY};Object.assign($('stick').style,{display:'block',left:e.clientX-42+'px',top:e.clientY-42+'px'});$('stick').firstElementChild.style.transform='';}
 else if(!look)look={id:e.pointerId,x:e.clientX};});
canvas.addEventListener('pointermove',e=>{if(stick?.id===e.pointerId){const dx=e.clientX-stick.x,dy=e.clientY-stick.y,d=Math.max(35,Math.hypot(dx,dy));joyX=dx/d;joyZ=dy/d;$('stick').firstElementChild.style.transform='translate('+joyX*24+'px,'+joyZ*24+'px)';}
 else if(look?.id===e.pointerId){angle-=(e.clientX-look.x)*.008;look.x=e.clientX;}});
function release(e){if(stick?.id===e.pointerId){stick=null;joyX=joyZ=0;$('stick').style.display='none';}if(look?.id===e.pointerId)look=null;}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.min(1.55,Math.max(.7,zoom+Math.sign(e.deltaY)*.08));},{passive:false});
addEventListener('blur',()=>{keys.clear();endTouch();save();});addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();endTouch();save();}last=performance.now();});
function frame(now){
 const dt=Math.max(0,Math.min(.08,(now-last)/1000));last=now;saveClock+=dt;hudClock+=dt;tickGoods(s,dt);
 if(!page){let x=joyX+(+keys.has('d')||+keys.has('arrowright'))-(+keys.has('a')||+keys.has('arrowleft')),z=joyZ+(+keys.has('s')||+keys.has('arrowdown'))-(+keys.has('w')||+keys.has('arrowup'));
   angle+=(+keys.has('r')-+keys.has('q'))*dt*1.6;
   const speed=dt*5/(Math.max(1,Math.hypot(x,z)));move(s,s.player,(x*Math.cos(angle)+z*Math.sin(angle))*speed,(-x*Math.sin(angle)+z*Math.cos(angle))*speed);
   if(record)recordPoint(record.route,s.player);}
 for(const [i,c] of s.clones.entries()){if(record?.index===i)continue;const mode=c.mode;stepClone(s,c,dt);if(mode==='trial'&&c.mode==='ready'){toast('Probelauf fertig · Im Klonteam Wiederholen wählen');if(page==='fleet')renderPanel();save();}}
 if(page==='magnet'){magnetTime+=dt;magnetAccuracy=.5+Math.sin(magnetTime*2.7-Math.PI/2)*.49;$('needle').style.left=magnetAccuracy*100+'%';}
 world.draw(s,dt,angle,record?.route||(glowUntil>now?s.clones[selected]?.route:null),zoom);
 if(hudClock>.13){hudClock=0;updateHud();if(page==='map')drawMap();}
 marker();if(now>messageUntil)$('message').classList.remove('on');
 if(saveClock>=3){saveClock=0;save();}requestAnimationFrame(frame);}
updateHud();requestAnimationFrame(frame);
