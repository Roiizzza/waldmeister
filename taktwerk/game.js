import {Line,specs,personal,stationUp,SPAN} from './line.mjs?v=2';
import {world} from './world.js?v=2';
const $=sel=>document.querySelector(sel), fmt=n=>n.toLocaleString('de-DE')+' €',pad=n=>String(n).padStart(2,'0');
const KEY='taktwerk.montage.v1';
let saved;try{saved=JSON.parse(localStorage.getItem(KEY))}catch{}
const game=new Line(saved),room=world($('#view'),specs),pointers=new Map();
let station=0,menu='',section='stations',gesture=null,noticeUntil=0,lastSave=0,savedRevision=-1;
let markersKey='',menuKey='',cardKey='',sound=true,audio;
const write=()=>{try{localStorage.setItem(KEY,JSON.stringify(game.snapshot()))}catch{}};
function beep(hz){if(!sound||audio?.state!=='running')return;const osc=audio.createOscillator(),v=audio.createGain();osc.type='triangle';osc.frequency.value=hz;v.gain.setValueAtTime(.025,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.09);osc.connect(v);v.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.1)}
document.addEventListener('pointerdown',()=>{try{audio=new AudioContext();audio.resume().catch(()=>{})}catch{}},{once:true});
function note(text){$('#notice').textContent=text;$('#notice').style.opacity=1;noticeUntil=performance.now()+2300}
function endGesture(submit=false){
 if(!gesture)return;const g=gesture;gesture=null;const s=game.stations[g.i],was=s.run?.who==='player',kind=specs[g.i].ops[g.j].kind;
 if(was){const passed=game.release(g.i,submit&&g.valid);if(kind==='test'&&submit){note(passed?'Prüfung bestanden':'Messung wiederholen · im Grünbereich loslassen');beep(passed?650:185)}else if(kind==='fit'&&submit){if(g.valid)beep(520);else note('Teil über der gestrichelten Aufnahme loslassen')}}
 write();
}
function clearInputs(){endGesture();pointers.clear();room.keys.clear();room.joystick(0,0);$('#stick').style.display='none'}
function showMenu(type,sub=section){clearInputs();menu=type;section=sub;menuKey='';$('#overlay').hidden=!menu;$('#build').classList.toggle('sel',!!menu&&menu!=='help');$('#live').classList.toggle('sel',!menu);if(menu)drawMenu()}
function visit(i){clearInputs();station=i;room.visit(i);showMenu('');markersKey=''}
function mode(s,i){if(!s.open)return 'Gesperrt';if(game.record?.i===i)return 'Aufnahme';if(s.auto)return 'Roboterbetrieb';return s.run?.who==='worker'?'Handwerker':'Handbetrieb'}
function button(i,k,txt,enabled=true,primary=false){return '<button data-i="'+i+'" data-op="'+k+'" '+(enabled?'':'disabled')+' class="'+(primary?'dark':'')+'">'+txt+'</button>'}
function purch(i,k,title,level,max){const cost=game.price(i,k);return button(i,k,title+' '+level+'/'+max+(level===max?' · Max.':' · '+fmt(cost)),level<max&&game.money>=cost)}
function scheduleText(i){const group=game.outgoing(i),arrived=group.filter(p=>Math.abs(p.x-(i+1)*SPAN)<.01||game.parts.some(a=>a!==p&&a.x>p.x&&a.x-p.x<3.66)||!game.stations[i+1]?.open&&p.x>=(i+1)*SPAN-3.66).length;return group.length+' / '+game.capacity(i)+' Plätze · '+arrived+' in Position'}
function stationCard(i){const s=game.stations[i],d=specs[i],p=game.dock(i);let h='<article class="col"><small>STATION '+pad(i+1)+' · '+mode(s,i).toUpperCase()+'</small><h3>'+d.name+'</h3>';
 if(!s.open)return h+'<p>Eingang aus '+specs[i-1].name+' · '+game.outgoing(i-1).length+' Teile auf dem Band</p>'+button(i,'open','Freischalten · '+fmt(d.open),game.stations[i-1].open&&game.money>=d.open,true)+'</article>';
 h+='<p>Auftrag ab '+fmt(game.reward(i,false))+'<br>'+scheduleText(i)+'</p>'+button(i,'visit','Zur Werkbank',true,true);
 for(const [k,u] of Object.entries(stationUp))h+=purch(i,k,u[0],s[k],u[3]);
 if(!s.robot)h+=button(i,'robot','Roboter kaufen · '+fmt(d.robot),game.money>=d.robot);
 else if(game.record?.i===i)h+=button(i,'cancel','Aufnahme abbrechen');
 else{if(s.program)h+=button(i,'toggle',s.auto?'Roboter pausieren':'Programm starten');h+=button(i,'teach',s.program?'Neu aufnehmen':'Durchlauf aufnehmen',!game.record&&p&&!p.work.some(Boolean)&&!s.run)}
 if(i<3)h+=button(i,'sell','Ein Teil als Ersatzteil verkaufen',game.outgoing(i).some(p=>p.x>(i+1)*SPAN-7*3.65&&p.x<(i+1)*SPAN-.1&&!p.work.some(Boolean)&&!game.sales.some(a=>Math.abs(a.x-p.x)<3.65)));
 return h+'</article>'
}
function drawMenu(){if(!menu)return;const sig=[menu,section,game.changed,sound,game.record?.i,...game.stations.map((s,i)=>[!!s.run,!!game.dock(i),scheduleText(i),!!game.outgoing(i).find(p=>p.x>(i+1)*SPAN-7*3.65),game.sales.length])].join('|');if(sig===menuKey)return;menuKey=sig;
 $('#title').textContent=menu==='help'?'Werkstatthandbuch':section==='line'?'Bandübersicht':section==='player'?'Charakterausbau':'Stationsausbau';
 if(menu==='help'){$('#content').innerHTML='<div class="help"><p><b>Montage</b> · Schraubenkopf oder Schweißpunkt mit der linken Maustaste oder dem Finger gedrückt halten. Eine Unterbrechung erhält den bisherigen Fortschritt. Bauteile vom orange markierten Griff auf die gestrichelte Aufnahme ziehen und dort loslassen. Bei Prüfungen halten, bis der Zeiger im grünen Fenster steht, dann loslassen.</p><p><b>Band</b> · Jede Palette fährt zur nächsten Station. Ist sie gesperrt oder belegt, stauen sich Teile davor. Bei vollem Ausgang kannst du die Folgestation abarbeiten, den Puffer erweitern oder ein Teil als Ersatzteil ausleiten.</p><p><b>Team</b> · Ein Handwerker übernimmt nach deinem ersten fertigen Arbeitspunkt. Für einen Roboter nimmst du an einem frischen Teil einen vollständigen Durchlauf auf. Beim nächsten Teil wiederholt er deine Reihenfolge und Pausen.</p><p><b>Steuerung</b> · WASD oder Pfeile zum Laufen, Umschalt zum Rennen, ziehen zum Umsehen. Auf dem Handy links laufen und rechts umsehen. Über die Bandübersicht springst du zu jeder Werkbank. Dein Spielstand wird auf diesem Gerät gespeichert.</p>'+button(0,'sound',sound?'Werkzeugton ausschalten':'Werkzeugton einschalten')+'</div>';return}
 let h='<div class="shopnav">'+[['stations','Stationen'],['player','Charakter'],['line','Bandübersicht']].map(([k,t])=>'<button data-op="tab" data-tab="'+k+'" class="'+(section===k?'on':'')+'">'+t+'</button>').join('')+'</div>';
 if(section==='stations')h+='<div class="columns">'+specs.map((_,i)=>stationCard(i)).join('')+'</div>';
 if(section==='player')h+='<div class="columns personal">'+Object.entries(personal).map(([k,u])=>'<article class="col"><small>CHARAKTER · STUFE '+game.player[k]+'</small><h3>'+u[0]+'</h3><p>'+u[1]+'. Pro Stufe '+({pace:'+0,85 m/s',skill:'+17 % Werkzeugtempo',bonus:'+12 % Handarbeitsprämie'})[k]+'.</p>'+purch(0,k,'Ausbauen',game.player[k],5)+'</article>').join('')+'</div>';
 if(section==='line'){h+=specs.map((d,i)=>'<div class="maprow"><strong>'+pad(i+1)+'</strong><div><b>'+d.name+'</b><small>Meter '+i*SPAN+' · '+mode(game.stations[i],i)+' · Ausgang '+scheduleText(i)+(game.stations[i].reserve?' · Altbestand '+game.stations[i].reserve:'')+'</small></div>'+button(i,'visit','Hingehen')+'</div>').join('');h+='<div class="maprow"><strong>▣</strong><div><b>Versandtor</b><small>Meter 112 · '+game.shipped+' Fahrzeuge ausgeliefert</small></div></div>'}
 $('#content').innerHTML=h
}
$('#content').onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const i=Number(b.dataset.i)||0,s=game.stations[i],k=b.dataset.op;if(k==='visit')return visit(i);if(k==='tab')return showMenu('build',b.dataset.tab);if(k==='sound')sound=!sound;
 else if(k==='sell'){if(game.sellSpare(i))note('Ersatzteil zur Seitenverladung unterwegs')}
 else if(k==='cancel'){game.record=null;game.changed++}
 else if(k==='toggle'){s.run=null;s.auto=!s.auto;s.idle=0;game.changed++}
 else if(k==='teach'){if(game.teach(i)){visit(i);note('Aufnahme läuft · Bearbeite alle Arbeitspunkte.')}}else if(game.buy(i,k)){beep(530);if(k==='open')note(specs[i].name+' freigeschaltet')}write();menuKey='';drawMenu()};
$('#live').onclick=()=>showMenu('');$('#build').onclick=()=>showMenu(menu==='build'?'':'build','stations');$('#line').onclick=()=>showMenu('build','line');$('#settings').onclick=()=>showMenu('help');$('#close').onclick=()=>showMenu('');$('#overlay').onclick=e=>{if(e.target===$('#overlay'))showMenu('')};
const symbols={bolt:'',weld:'✧',fit:'↗',test:'◉'};
function updateSpots(){const i=station,s=game.stations[i],p=game.dock(i);const ops=!menu&&!room.far(i)&&s.open&&!s.auto&&p?game.available(i,p):[];const token=[i,p?.id,...ops,gesture?.j,!!menu,s.run?.who].join('/');
 if(token!==markersKey){markersKey=token;$('#targets').replaceChildren();for(const j of ops){const op=specs[i].ops[j];if(gesture&&gesture.j!==j)continue;
  const make=(drop=false)=>{let b=document.createElement('button');b.type='button';b.className='spot '+op.kind+(drop?' drop':'')+(gesture?.j===j?' held':'');b.dataset.j=j;b.dataset.drop=drop?'1':'0';b.setAttribute('aria-label',(drop?'Aufnahme für ':'')+op.name);b.title=op.name;b.textContent=drop?'◎':symbols[op.kind]||String(j+1);if(drop||s.run?.who==='worker')b.classList.add('passive');$('#targets').append(b)};
  make();if(op.kind==='fit'&&gesture?.j===j)make(true);
 }}
 for(const b of $('#targets').children){const op=specs[i].ops[+b.dataset.j],pt=room.project(i,b.dataset.drop==='0'&&op.kind==='fit'?op.from:op.point);b.hidden=!pt.visible;b.style.left=pt.x+'px';b.style.top=pt.y+'px'}
}
function moveDrag(x,y){if(!gesture)return;const g=gesture,op=specs[g.i].ops[g.j];if(op.kind!=='fit')return;const src=room.project(g.i,op.from),dst=room.project(g.i,op.point),vx=dst.x-src.x,vy=dst.y-src.y;g.x=x;g.y=y;g.valid=Math.hypot(x-dst.x,y-dst.y)<(innerWidth<700?35:29);g.fraction=Math.max(0,Math.min(1,((x-src.x)*vx+(y-src.y)*vy)/Math.max(1,vx*vx+vy*vy)))}
$('#targets').addEventListener('pointerdown',e=>{const b=e.target.closest('.spot');if(!b||gesture||e.button!==0||room.far(station))return;e.preventDefault();const j=+b.dataset.j;if(game.begin(station,j)){gesture={i:station,j,id:e.pointerId,x:e.clientX,y:e.clientY,valid:false,fraction:0};$('#targets').setPointerCapture(e.pointerId);beep(260);updateSpots()}});
window.addEventListener('pointermove',e=>{if(gesture?.id===e.pointerId)moveDrag(e.clientX,e.clientY)});
window.addEventListener('pointerup',e=>{if(gesture?.id===e.pointerId){moveDrag(e.clientX,e.clientY);endGesture(true)}});window.addEventListener('pointercancel',e=>{if(gesture?.id===e.pointerId)endGesture()});
function hud(){const i=station,s=game.stations[i],d=specs[i],p=game.dock(i),options=game.available(i),far=room.far(i),r=s.run,op=r?d.ops[r.j]:d.ops[options[0]],done=p?.work.filter(n=>n>=1).length||0;
 const card=[i,s.open,s.auto,s.run?.who,game.money,game.record?.i,s.made,p?.id,done,game.outgoing(i).length,game.capacity(i),game.stations.filter(a=>a.open).length].join('/');
 if(card!==cardKey){cardKey=card;$('#station').textContent=d.name;$('#num').textContent='STATION '+pad(i+1)+' / 04';$('#mode').textContent=mode(s,i);$('#cash').textContent=fmt(game.money);$('#order').textContent=p?'Palette '+String(p.id).padStart(3,'0'):'Warteplatz';$('#count').textContent=game.stations.filter(a=>a.open).length+' / 4';
 $('#steps').innerHTML=d.phases.map((name,k)=>{const jobs=d.ops.map((o,j)=>o.phase===k?j:-1).filter(j=>j>=0),n=jobs.filter(j=>p?.work[j]>=1).length;return '<li class="'+(n===jobs.length?'done':op?.phase===k?'current':'')+'"><i>'+(n===jobs.length?'✓':pad(k+1))+'</i>'+name+' <b>'+n+'/'+jobs.length+'</b></li>'}).join('');
 $('#buffer').textContent='Ausgang '+game.outgoing(i).length+' / '+game.capacity(i);$('#output').textContent='+'+fmt(game.reward(i,true))}
 let hint='',action='';if(!s.open){hint='Diese Werkbank ist gesperrt';action='Station ausbauen'}else if(far){hint='Für Handarbeit näher an die Werkbank';action='Zur Werkbank'}else if(!p){hint='Die nächste Palette fährt ein';if(i&&!game.outgoing(i-1).length)hint='Nachschub aus '+specs[i-1].name+' benötigt'}else if(!options.length){hint='Ausgang belegt · Die Palette wartet';action='Band verwalten'}else if(s.auto||r?.who==='worker'){hint=(s.auto?'Roboter':'Handwerker')+' · '+op.name}else{hint={bolt:'Schraubenkopf gedrückt halten',weld:'Schweißpunkt gedrückt halten',test:'Halten · im grünen Bereich loslassen',fit:gesture?'Über dem Zielring loslassen':'Griff zur Aufnahme ziehen'}[op.kind]}
 const jump=$('#jump');jump.hidden=!action;jump.textContent=action;jump.onclick=()=>far&&s.open?visit(i):showMenu('build','stations');
 $('#hint').textContent=hint;$('#part').textContent=d.part.toUpperCase();const value=r?(op.kind==='test'&&r.who==='player'?r.reading||0:op.kind==='fit'&&gesture?gesture.fraction:p.work[r.j]):done/d.ops.length;
 const measured=r&&op.kind==='test'&&r.who==='player';$('.worktip').classList.toggle('testing',!!measured);
 $('#meterFill').style.width=100*value+'%';$('#needle').style.left=100*value+'%';$('#toolState').textContent=measured?Math.round(value*100)+' %':r&&op.kind==='bolt'?Math.round(value*42)+' / 42 Nm':done+' / '+d.ops.length;
}
window.addEventListener('keydown',e=>{if(e.code==='Escape')showMenu('');if(e.code==='KeyU'&&!e.repeat)showMenu(menu?'':'build','stations');if(!menu&&!gesture)room.keys.add(e.code);if(e.code.startsWith('Arrow'))e.preventDefault()});window.addEventListener('keyup',e=>room.keys.delete(e.code));
const canvas=room.canvas;
canvas.addEventListener('pointerdown',e=>{if(menu||gesture)return;canvas.setPointerCapture(e.pointerId);const move=e.pointerType!=='mouse'&&e.clientX<innerWidth*.45;const p={x:e.clientX,y:e.clientY,ox:e.clientX,oy:e.clientY,move};pointers.set(e.pointerId,p);if(move){const st=$('#stick');st.style.display='block';st.style.left=p.x+'px';st.style.top=p.y+'px';st.firstElementChild.style.transform='none'}});
canvas.addEventListener('pointermove',e=>{let p=pointers.get(e.pointerId);if(!p||gesture)return;if(p.move){const dx=e.clientX-p.ox,dy=e.clientY-p.oy,l=Math.max(34,Math.hypot(dx,dy));room.joystick(dx/l,dy/l);$('#stick i').style.transform='translate('+dx/l*23+'px,'+dy/l*23+'px)'}else room.look(e.clientX-p.x,e.clientY-p.y);p.x=e.clientX;p.y=e.clientY});
function release(e){if(pointers.get(e.pointerId)?.move){room.joystick(0,0);$('#stick').style.display='none'}pointers.delete(e.pointerId)}
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,release);
window.addEventListener('blur',clearInputs);document.addEventListener('visibilitychange',()=>{clearInputs();write()});window.addEventListener('pagehide',write);
let last=performance.now();function frame(now){const dt=document.hidden?0:Math.min(.35,(now-last)/1000);last=now;
 for(const e of game.advance(dt,!menu)){if(e.i===station){note('Palette freigegeben · +'+fmt(e.pay));beep(620)}}
 if(gesture&&!game.stations[gesture.i].run){gesture=null;beep(510)}
 room.render(dt,game,!menu&&!gesture,gesture);station=room.nearest();updateSpots();hud();if(menu)drawMenu();
 if(game.changed!==savedRevision||now-lastSave>2500){write();savedRevision=game.changed;lastSave=now}
 if(now>noticeUntil)$('#notice').style.opacity=0;requestAnimationFrame(frame)}
 requestAnimationFrame(frame);
