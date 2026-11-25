/* The trial shares the player's camera, movement, vacuum, save slot and pyramid gate. */
function createPyramidTrial() {
  const roomNames = ['Eingangshalle', 'Säulenhalle', 'Grabkammer'];
  const workshop = {
    tank: ['Sandtank', '+4 Schuss pro Füllung'],
    intake: ['Saugmotor', '+2 Schuss pro Sekunde beim Nachladen'],
    armor: ['Panzerplatte', '+1 Trefferpunkt pro Versuch']
  };
  const offers = [
    [['Breitdüse', 'Breitere Trefferfläche'], ['Zwillingsdüse', 'Zwei Sandstöße pro Schuss', 'Wächter erzeugt eine zweite Sandwelle']],
    [['Schnellventil', 'Schneller schießen'], ['Druckkammer', 'Doppelter Schussschaden', 'Wächter stürmt schneller']],
    [['Reparatur', 'Zwei Trefferpunkte zurück'], ['Vollreparatur', 'Alle Trefferpunkte zurück', 'Zwei Käfer begleiten den Wächter']]
  ];
  let hudClock=0;
  const originX = 5000, floorY = INT.y;
  const rooms = [], enemies = [], rings = [], traces = [];
  const ray = new THREE.Raycaster(), direction = new THREE.Vector3(), point = new THREE.Vector3();
  const tracerGeo = new THREE.CylinderGeometry(.035,.07,1,5);
  const tracerMat = new THREE.MeshBasicMaterial({color:0xffdb80});
  const waveGeo = new THREE.RingGeometry(.96,1,64);
  const waveMat = new THREE.MeshBasicMaterial({color:0xff883a,side:THREE.DoubleSide});
  let run = null, room, panel = '', outsideLatch = false, message='', menuNote='', elapsed=0;
  const elements = document.createElement('div');
  elements.innerHTML = '<section id="trialMenu" hidden role="dialog" aria-modal="true" aria-labelledby="trialTitle"><article class="trialCard"><h2 id="trialTitle"></h2><p id="trialInfo"></p><div class="trialActions" id="trialActions"></div></article></section><div id="trialBar" hidden><strong id="trialRound"></strong><div id="trialStats"></div><progress id="trialBoss" aria-label="Lebensenergie des Wächters" hidden></progress></div><div id="trialMsg" hidden></div><button type="button" id="trialPause" hidden>Pause</button>';
  document.body.appendChild(elements);
  const meta = () => S.pyramidTrial || (S.pyramidTrial = {shards:0,best:0,wins:0,tank:0,intake:0,armor:0});
  const capacity = () => 10 + 4*meta().tank;
  const maxHp = () => 4 + meta().armor;
  const lock = () => {if(!isTouch && canvas.requestPointerLock){try{canvas.requestPointerLock()?.catch?.(()=>{})}catch(e){}}};
  function clearInput(){
    for(const key in K) K[key]=false;
    hold.m=hold.k=hold.t=false; jx=jy=0; jumpReq=jumpHold=false; hum(0);
    $('joyK').style.transform='';
  }
  function setPanel(name,title,info,actions){
    panel=name; mode='trialMenu'; clearInput();
    if(document.pointerLockElement) document.exitPointerLock();
    document.body.classList.add('trialModal');
    $('trialMenu').hidden=false; $('trialPause').hidden=true;
    $('trialTitle').textContent=title; $('trialInfo').textContent=info;
    const list=$('trialActions'); list.replaceChildren();
    actions.forEach(([label,action,detail,disabled],i)=>{
      const b=document.createElement('button'); b.type='button'; b.textContent=label;
      b.disabled=!!disabled; if(i===0)b.className='primary';
      if(detail){const small=document.createElement('small');small.textContent=detail;b.appendChild(small)}
      b.onclick=action; list.appendChild(b);
    });
    list.querySelector('button:not(:disabled)')?.focus();
  }
  function resume(){
    panel=''; mode='play'; $('trialMenu').hidden=true;
    document.body.classList.remove('trialModal'); $('trialPause').hidden=!run;
    clearInput();lock();
  }
  function entrance(note=''){
    outsideLatch=true;menuNote=note;
    const m=meta();
    setPanel('gate','Die Pyramide', [note,'Beste abgeschlossene Runde '+m.best+'/10 · '+m.shards+' Splitter'].filter(Boolean).join(' · '),[
      ['Prüfung starten',start,'10 Runden · Sand schießen und an Sandhaufen nachladen'],
      ['Ausrüstung verbessern',shop,'Splitter für dauerhafte Upgrades ausgeben'],
      ['Relikt suchen',()=>{resume();enterPyr()},'Das verschüttete Labyrinth erkunden'],
      ['Zur Wüste',resume]
    ]);
  }
  function shop(){
    const m=meta(), actions=Object.entries(workshop).map(([key,[label,detail]])=>{
      const level=m[key],price=3+4*level;
      return [label+' '+level+'/3',()=>{
        if(m[key]!==level||level>=3||m.shards<price)return;
        m.shards-=price; m[key]++;save();sfx('coin');shop();
      },level===3?'Voll ausgebaut':detail+' · '+price+' Splitter',level>=3||m.shards<price];
    });
    actions.push(['Zum Eingang',()=>entrance(menuNote)]);
    setPanel('shop','Ausrüstung',m.shards+' Splitter verfügbar · Gilt für jeden Versuch.',actions);
  }
  function label(parent,text,x,y,z,w,h,bg,fg){
    const mesh=sign(text,w,h,bg,fg);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  function beetle(){
    const g=new THREE.Group();
    const shell=cy(g,.50,.62,.55,0x397470,0,.55,0,8);
    shell.scale.z=1.35;bx(g,.34,.27,.4,0xc9a456,0,.46,.7);
    for(const side of [-1,1]){
      bx(g,.11,.10,.12,0x9cfff2,.18*side,.56,.88);
      for(const z of [-.38,0,.38])bx(g,.47,.12,.13,0x443b2e,.56*side,.19,z).rotation.z=side*.3;
    }
    return g;
  }
  function guardian(boss){
    const g=new THREE.Group(), stone=boss?0x485365:0x776654, gold=0xca9551;
    for(const side of [-1,1]){
      bx(g,.43,.64,.54,stone,.29*side,.32,0);
      bx(g,.40,.87,.48,stone,.72*side,1.02,0);
      bx(g,.52,.26,.60,gold,.72*side,1.52,0);
    }
    bx(g,1.06,.87,.65,stone,0,1.13,0);
    bx(g,.66,.53,.6,stone,0,1.92,0);bx(g,.55,.095,.04,0xffae55,0,1.96,.32);
    const crest=bx(g,.31,.31,.06,gold,0,1.27,.35);crest.rotation.z=Math.PI/4;
    if(boss){cy(g,0,.49,.49,gold,0,2.41,0,4);g.scale.setScalar(1.65)}
    return g;
  }
  function buildRoom(i){
    const root=new THREE.Group();root.position.set(originX+i*50,floorY,0);scene.add(root);
    const walls=[],columns=[],depots=[],plates=[], sand=0xc79c60, basalt=[0x8b6647,0x706251,0x535361][i];
    bx(root,23,.6,27,0x9b7954,0,-.3,0);
    for(const [x,z,w,d] of [[-11.5,0,1,28],[11.5,0,1,28],[0,-13.5,24,1],[0,13.5,24,1]]){
      walls.push(bx(root,w,6.5,d,basalt,x,3.25,z));
      bx(root,w+.16,.27,d+.16,0xc0985e,x,1.15,z);bx(root,w+.2,.34,d+.2,0xb49160,x,5.6,z);
    }
    bx(root,24,.4,28,0x665442,0,6.7,0);
    for(const side of [-1,1])for(const z of [-8,0,8]){
      const x=side*(i===0?10.3:i===1?6.8:8.3);
      const pillar=bx(root,1.35,6.4,1.35,basalt,x,3.2,z);
      bx(root,1.7,.39,1.7,sand,x,.19,z);bx(root,1.7,.48,1.7,sand,x,5.85,z);
      bx(root,.13,2.7,.09,0xe0b976,x,3.3,z+.71);
      columns.push({x:x+root.position.x,z,hx:.86,hz:.86});walls.push(pillar);
    }
    for(const side of [-1,1]){
      const g=new THREE.Group();g.position.set(side*4,0,6);root.add(g);
      const heap=cy(g,.25,1.8,.72,sand,0,.36,0,8);
      cy(g,2,2,.08,0x73563d,0,.04,0,12);
      depots.push({x:g.position.x,z:6,heap,amount:12});
    }
    const rubble=cy(root,.25,1.35,.7,sand,0,.35,0,7);
    rubble.visible=false;depots.push({x:0,z:0,heap:rubble,amount:0,fallen:true});
    // Brass floor inlays lead from the doorway to the choice wall.
    for(const side of [-1,1]){
      bx(root,.10,.025,24,0xc69d5d,side*2,.016,0);
      for(const z of [-9,-3,3,9]){
        const lamp=bx(root,.12,.8,.35,0xf3ae52,side*10.91,2.7,z);
        lamp.material=MT(0xffd78b,{emissive:0xd88030,emissiveIntensity:.75});
      }
    }
    const front=bx(root,10,4.3,.45,0x3b332b,0,2.15,-12.75);
    label(root,roomNames[i].toUpperCase(),0,4.95,-12.6,6,.92,'#261e17','#ffdb93');
    for(let n=0;n<2;n++){
      const g=new THREE.Group();g.position.set(n===0?-2.65:2.65,2.25,-12.36);root.add(g);
      const surface=bx(g,4.65,2.85,.16,n===0?0x376c70:0x924c34,0,0,0);
      const fg=n===0?'#a4fff0':'#ffcab2', bg=n===0?'#183d40':'#522b23';
      label(g,n===0?'I  ·  SICHER':'II  ·  RISIKO',0,.58,.1,4.35,.62,bg,fg);
      label(g,offers[i][n][0],0,-.1,.1,4.35,.68,bg,'#fff2d9');
      const icon=bx(g,.31,.31,.09,n===0?0x98e5d6:0xff9563,0,-.87,.14);icon.rotation.z=Math.PI/4;
      plates.push({g,surface});g.visible=false;
    }
    let statue=null;
    if(i===2){statue=guardian(true);statue.position.set(0,.2,-8.5);root.add(statue)}
    const light=new THREE.PointLight(0xffd39c,1.55,40,1);light.position.set(0,4.8,1);root.add(light);
    root.visible=false;
    return {root,walls,columns,depots,plates,statue,front};
  }
  function setRoom(i){
    if(room)room.root.visible=false;
    room=rooms[i]||(rooms[i]=buildRoom(i));room.root.visible=true;
    room.plates.forEach(p=>p.g.visible=false);
    if(room.statue)room.statue.visible=true;
    room.depots.forEach(d=>{d.amount=d.fallen?0:12;d.heap.visible=!d.fallen;d.heap.scale.y=1});
    P.x=room.root.position.x;P.y=floorY;P.z=8;P.vy=0;P.yaw=0;P.pitch=-.08;camY=floorY+1.65;
    cam.position.set(P.x,camY,P.z);cam.rotation.set(P.pitch,P.yaw,0,'YXZ');
    room.root.updateMatrixWorld(true);
  }
  function start(){
    run={round:0,hp:maxHp(),ammo:capacity(),earned:0,stage:'rest',wait:1.5,fire:0,invuln:0,
      reloadTouch:false,wide:false,twin:false,rapid:false,power:false,echo:false,charge:false,guards:false,release:false};
    P.inP=true;setRoom(0);elapsed=0;P.shake=0;T.pt=null;T.sand=false;
    scene.background.setHex(0x251f1a);scene.fog.color.setHex(0x473829);scene.fog.near=12;scene.fog.far=45;
    document.body.classList.add('trialPlaying');$('adm').hidden=true;
    $('trialBar').hidden=$('trialMsg').hidden=false;
    message=isTouch?'Schuss halten · bei Sandhaufen Saugen halten':'Maus/F schießt · E am Sandhaufen zum Nachladen halten';
    resume();sfx('open');drawHud();
  }
  function removeAll(list){
    for(const obj of list)obj.mesh.parent.remove(obj.mesh);list.length=0;
  }
  function finish(won,abandoned=false){
    if(!run)return;
    const m=meta(),first=won&&!m.wins;
    const note=(won?'Wächter besiegt.':abandoned?'Prüfung verlassen.':'Anzug ausgefallen in Runde '+run.round+'.')+
      ' '+run.earned+' Splitter gesichert.'+(first?' Zwillingsdüse freigeschaltet: draußen 25 % mehr Saugbreite.':'');
    if(won)m.wins++;
    removeAll(enemies);removeAll(rings);removeAll(traces);room.root.visible=false;run=null;
    document.body.classList.remove('trialPlaying','trialHit');
    $('trialBar').hidden=$('trialMsg').hidden=$('trialPause').hidden=true;
    $('bUse').textContent='Nutzen';$('bAct').textContent='Saugen';
    exitPyr();if(first)showVac();save();entrance(note);
  }
  function pause(){
    if(!run||panel)return;
    run.reloadTouch=false;setPanel('pause','Prüfung pausiert','Runde '+Math.max(1,run.round)+'/10 · Bisher verdiente Splitter bleiben dir.',[
      ['Weiterspielen',resume],['Zum Pyramideneingang',()=>finish(false,true)]
    ]);
  }
  function spawn(kind,x,z){
    const boss=kind==='boss',bug=kind==='bug',mesh=bug?beetle():guardian(boss);
    mesh.position.set(x,0,z);room.root.add(mesh);
    const hp=boss?30:bug?(run.round<4?2:3):6;
    enemies.push({kind,mesh,hp,max:hp,state:'walk',timer:.6+Math.random(),dx:0,dz:0,flash:0,stomp:4});
  }
  function newWave(){
    run.round++;run.stage='fight';const w=run.round;
    message=w===1?'Ziele auf die Käfer. Sandhaufen liegen links und rechts vom Eingang.':'';
    if(w===10){room.statue.visible=false;spawn('boss',0,-8.5);if(run.guards){spawn('bug',-4,-7);spawn('bug',4,-7)}}
    else{
      const count=[0,2,3,4,3,4,5,5,6,6][w];
      for(let n=0;n<count;n++){
        const stone=w>=4 && (n===0 || (w>=7&&n===3));
        spawn(stone?'stone':'bug',(n%3-1)*3.6+(Math.random()-.5),-9+Math.floor(n/3)*3);
      }
    }
    sfx('open');
  }
  function clearWave(){
    const m=meta(),w=run.round,amount=w===10?6:w>6?2:1;
    run.earned+=amount;m.shards+=amount;m.best=Math.max(m.best,w);save();
    if(w===10){finish(true);return}
    if(w%3===0){
      run.stage='choice';run.release=true;run.ammo=Math.max(1,run.ammo);
      room.plates.forEach(p=>p.g.visible=true);
      message='Zwei Tafeln an der Stirnwand. Anvisieren zeigt den Effekt. Ein Schuss wählt.';
    }else{run.stage='rest';run.wait=2.6;message='Runde geschafft · +'+amount+' Splitter · Zeit zum Nachtanken'}
  }
  function choose(index){
    const stage=run.round/3-1, red=index===1;
    if(stage===0){run.wide=!red;run.twin=run.echo=red}
    if(stage===1){run.rapid=!red;run.power=run.charge=red}
    if(stage===2){run.hp=red?maxHp():Math.min(maxHp(),run.hp+2);run.guards=red}
    room.plates.forEach(p=>p.g.visible=false);if(stage<2){removeAll(traces);setRoom(stage+1)}
    message=offers[stage][index][0]+' aktiviert';run.wait=2;run.stage='rest';run.release=true;sfx('coin');
  }
  function hitPlayer(damage){
    if(run.invuln>0)return;
    run.hp=Math.max(0,run.hp-damage);run.invuln=1.15;P.shake=.19;sfx('deny');
  }
  function ringAt(x,z,delay=0){
    const mesh=new THREE.Mesh(waveGeo,waveMat);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.13,z);
    mesh.visible=false;room.root.add(mesh);rings.push({mesh,age:-delay,hit:false});
  }
  function moveEnemy(e,dx,dz,step){
    const p=e.mesh.position;
    p.x+=dx*step;p.z+=dz*step;
    const body={x:p.x+room.root.position.x,z:p.z};
    solidPush(body,e.kind==='boss'?1:e.kind==='stone'?.59:.48,room.columns);
    const hit=Math.abs(body.x-room.root.position.x-p.x)+Math.abs(body.z-p.z)>.01||Math.abs(p.x)>10.2||Math.abs(p.z)>12;
    p.x=clamp(body.x-room.root.position.x,-10.2,10.2);p.z=clamp(body.z,-12,12);
    return hit;
  }
  function tickEnemy(e,dt){
    const p=e.mesh.position,dx=P.x-room.root.position.x-p.x,dz=P.z-p.z,dist=Math.hypot(dx,dz)||.01;
    const boss=e.kind==='boss',bug=e.kind==='bug';e.timer-=dt;e.flash=Math.max(0,e.flash-dt);
    e.mesh.rotation.z=e.flash>0?.09:0;
    if(e.state==='stun'){
      e.mesh.rotation.x=.22;if(e.timer<=0){e.state='walk';e.timer=1.9;e.mesh.rotation.x=0}return;
    }
    if(e.state==='windup'){
      e.mesh.rotation.x=-.20;
      if(e.timer<=0){e.state='rush';e.timer=.85;e.mesh.rotation.x=0}return;
    }
    if(e.state==='rush'){
      const collided=moveEnemy(e,e.dx,e.dz,(boss&&run.charge?15:10)*dt);
      if(dist<(boss?1.9:1.25))hitPlayer(boss?2:1);
      if(collided||e.timer<=0){e.state='stun';e.timer=collided?2.2:.8;
        if(collided){const rubble=room.depots.find(d=>d.fallen);
          rubble.x=clamp(p.x-e.dx*1.7,-10,10);rubble.z=clamp(p.z-e.dz*1.7,-12,12);rubble.amount=8;
          rubble.heap.position.set(rubble.x,.35,rubble.z);rubble.heap.visible=true;
          burst(p.x+room.root.position.x,floorY+1,p.z,8,0xe8b55a,3,2);message='Aufprall! Am Einschlag liegt frischer Sand.'}}
      return;
    }
    e.mesh.rotation.y=Math.atan2(dx,dz);
    if(!bug&&e.timer<=0&&dist<12){
      e.state='windup';e.timer=.9;e.dx=dx/dist;e.dz=dz/dist;return;
    }
    if(boss){e.stomp-=dt;if(e.stomp<=0){ringAt(p.x,p.z);if(run.echo)ringAt(p.x,p.z,.85);e.stomp=5.2}}
    if(dist>.8)moveEnemy(e,dx/dist,dz/dist,dt*(bug?(1.35+.10*run.round):1.12));
    if(bug){p.y=.07*Math.abs(Math.sin(elapsed*9+p.x));if(dist<1.05&&P.y-floorY<1.15)hitPlayer(1)}
  }
  function nearestDepot(x,z){
    let nearest=room.depots[0],distance=Infinity;
    for(const d of room.depots){
      if(!d.heap.visible)continue;
      const dist=Math.hypot(x-d.x,z-d.z);if(dist<distance){nearest=d;distance=dist}
    }
    return nearest;
  }
  function shotTarget(yawOffset=0){
    const cp=Math.cos(P.pitch);
    direction.set(-Math.sin(P.yaw+yawOffset)*cp,Math.sin(P.pitch),-Math.cos(P.yaw+yawOffset)*cp);
    point.set(P.x,P.y+1.65,P.z);ray.set(point,direction);ray.far=34;
    room.root.updateMatrixWorld(true);
    let best=ray.intersectObjects(room.walls,false)[0]?.distance??34,enemy=null,plate=-1;
    if(run.stage==='choice')room.plates.forEach(({surface},i)=>{
      const h=ray.intersectObject(surface,false)[0];if(h&&h.distance<best){best=h.distance;plate=i}
    });
    for(const e of enemies){
      const boss=e.kind==='boss', height=boss?3.8:e.kind==='bug'?1.25:2.23;
      const center=e.mesh.position;
      // Aim assistance follows the creature's silhouette. Walls still intercept each shot.
      const sphere=new THREE.Sphere(new THREE.Vector3(),(boss?.96:e.kind==='bug'?.68:.64)+(run.wide?.48:.05));
      for(const y of [.42,height*.55,height-.28]){
        sphere.center.set(center.x+room.root.position.x,floorY+y,center.z);
        const q=ray.ray.intersectSphere(sphere,new THREE.Vector3());
        if(q){const distance=q.distanceTo(point);if(distance<best){best=distance;enemy=e;plate=-1}}
      }
    }
    return {enemy,plate,distance:best};
  }
  function trace(distance){
    const mesh=new THREE.Mesh(tracerGeo,tracerMat),len=Math.max(.2,distance-.45);
    mesh.position.copy(point).addScaledVector(direction,.45+len/2);mesh.scale.y=len;
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);scene.add(mesh);traces.push({mesh,age:.075});
  }
  function shoot(){
    if(run.ammo<1){message='Tank leer · am Sandhaufen Saugen halten';run.fire=.23;return}
    const count=run.twin&&run.stage==='fight'?2:1;
    run.ammo-=1;run.fire=run.rapid?.21:.34;tone(170,.09,'triangle',.052,65);
    for(let n=0;n<count;n++){
      const h=shotTarget(n===1?.025:0);trace(h.distance);
      if(h.plate>=0){choose(h.plate);return}
      if(h.enemy){
        const e=h.enemy;e.hp-=run.power?2:1;e.flash=.14;
        burst(e.mesh.position.x+room.root.position.x,floorY+.8,e.mesh.position.z,3,0xf5cb86,2,1.2);
        if(e.hp<=0){e.mesh.parent.remove(e.mesh);enemies.splice(enemies.indexOf(e),1);sfx('click')}
      }
    }
  }
  function drawHud(){
    $('trialRound').textContent=roomNames[rooms.indexOf(room)]+' · Runde '+Math.max(1,run.round)+'/10';
    $('trialStats').textContent='Anzug '+run.hp+'/'+maxHp()+'   ·   Sand '+Math.floor(run.ammo)+'/'+capacity()+'   ·   Splitter +'+run.earned+
      ((run.echo||run.charge||run.guards)?'   ·   Bossrisiko '+[run.echo,run.charge,run.guards].filter(Boolean).length+'/3':'');
    const boss=enemies.find(e=>e.kind==='boss'),bar=$('trialBoss');bar.hidden=!boss;
    if(boss){bar.max=boss.max;bar.value=boss.hp}
    $('trialMsg').textContent=message|| (run.stage==='fight'?'Gegner übrig · '+enemies.length:'');
    $('trialMsg').hidden=!$('trialMsg').textContent;
  }
  function tick(dt){
    if(!run||mode!=='play')return;
    elapsed+=dt;run.fire-=dt;run.invuln=Math.max(0,run.invuln-dt);
    const x=P.x-room.root.position.x, depot=nearestDepot(x,P.z), range=Math.hypot(x-depot.x,P.z-depot.z)<3.8;
    const suction=K.KeyE||run.reloadTouch;
    for(const d of room.depots){
      if(!d.fallen)d.amount=Math.min(12,d.amount+dt*1.8);
      else if(d.amount<.01)d.heap.visible=false;
      d.heap.scale.y=.20+.8*d.amount/12;
    }
    if(suction){
      if(range){const qty=Math.min(dt*(3+meta().intake*2),depot.amount,capacity()-run.ammo);
        run.ammo+=qty;depot.amount-=qty;hum(qty>0?.6:0);message='Saugen · '+Math.floor(run.ammo)+'/'+capacity();
        if(qty>0&&Math.random()<dt*18)stream(room.root.position.x+depot.x,floorY+.4,depot.z,0,HEND,1);
      }else{hum(0);message='Zum goldenen Sandhaufen am Eingang gehen'}
    }else hum(0);
    const trigger=hold.m||hold.k||hold.t;
    if(!trigger)run.release=false;
    if(run.stage==='choice'&&hudClock<=dt){
      const hit=shotTarget();
      const options=offers[run.round/3-1],offer=options[hit.plate];
      message=offer?offer.join(' · ')+' · Schießen zum Wählen':'Tafel wählen · links '+options[0][0]+' · rechts '+options[1][0]+' / '+options[1][2];
      
    }
    if(run.stage==='choice')run.ammo=Math.max(1,run.ammo);
    if(trigger&&!run.release&&!suction&&run.fire<=0&&run.stage!=='rest')shoot();
    for(const e of enemies)tickEnemy(e,dt);
    for(let i=rings.length-1;i>=0;i--){
      const r=rings[i];r.age+=dt;if(r.age<=0)continue;
      const radius=1+r.age*5;r.mesh.visible=true;r.mesh.scale.setScalar(radius);
      if(!r.hit&&Math.abs(Math.hypot(x-r.mesh.position.x,P.z-r.mesh.position.z)-radius)<.44&&P.y-floorY<.45){hitPlayer(1);r.hit=true}
      if(radius>29){r.mesh.parent.remove(r.mesh);rings.splice(i,1)}
    }
    for(let i=traces.length-1;i>=0;i--){if((traces[i].age-=dt)<=0){traces[i].mesh.parent.remove(traces[i].mesh);traces.splice(i,1)}}
    document.body.classList.toggle('trialHit',run.invuln>.9);
    if(run.hp<=0){finish(false);return}
    if(run.stage==='fight'&&!enemies.length){removeAll(rings);clearWave()}
    else if(run.stage==='rest'&&(run.wait-=dt)<=0)newWave();
    if(run&&(hudClock-=dt)<=0){drawHud();hudClock=.10}
  }
  function constrain(){
    P.x=clamp(P.x,room.root.position.x-10.6,room.root.position.x+10.6);P.z=clamp(P.z,-12.25,12.4);
    solidPush(P,.45,room.columns);
  }
  function gateStep(distance){
    if(distance>4)outsideLatch=false;
    if(mode==='play'&&!outsideLatch&&distance<3)entrance();
  }
  $('trialPause').onclick=pause;
  $('bUse').addEventListener('pointerdown',e=>{if(run&&mode==='play'){e.preventDefault();e.stopImmediatePropagation();$('bUse').setPointerCapture(e.pointerId);run.reloadTouch=true}},true);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])$('bUse').addEventListener(event,()=>{if(run)run.reloadTouch=false});
  addEventListener('blur',()=>{if(run&&!panel)pause()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&run&&!panel)pause()});
  document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&run&&!isTouch&&!panel)pause()});
  function key(e){
    if(panel){if(e.code==='Escape'&&!e.repeat){if(panel==='pause'||panel==='gate')resume();else entrance(menuNote)}return true}
    if(!run)return false;
    if(e.code==='Escape'||e.code==='KeyP'){if(!e.repeat)pause();return true}
    return !['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyF','KeyE'].includes(e.code);
  }
  return {get active(){return !!run},key,tick,constrain,gateStep,entrance};
}
