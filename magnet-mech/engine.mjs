export const ARENA=16;
export const OBSTACLES=[{x:-7,z:-5,w:2.2,d:1.2},{x:6,z:-6,w:1.6,d:2.1},{x:-6,z:6,w:1.6,d:1.5},{x:7,z:5,w:2,d:1.2}];
export const UPGRADES=[
 {id:'coil',icon:'◎',name:'Magnetspulen',desc:'Mehr Reichweite. Schrott fliegt schneller zu dir.',effect:'+25 % Sammelradius · +15 % Schaden',color:'gold'},
 {id:'saw',icon:'✹',name:'Orbitalsägen',desc:'Eine rotierende Säge schützt deinen Mech.',effect:'+1 Sägeblatt · Nahkampfschaden',color:'violet'},
 {id:'chain',icon:'ϟ',name:'Schockkette',desc:'Automatische Blitze springen zwischen Gegnern.',effect:'+1 Blitzsprung · +Schockschaden',color:'blue'},
 {id:'armor',icon:'⬡',name:'Verstärkte Hülle',desc:'Mehr Panzerung und eine kleine Reparatur.',effect:'+18 maximale HP · +20 Heilung',color:'gold'},
 {id:'drive',icon:'»',name:'Servoantrieb',desc:'Schneller aus Gefahrenzonen herauskommen.',effect:'+10 % Tempo · +10 % Feuerrate',color:'blue'},
 {id:'capacitor',icon:'⏣',name:'Kondensator',desc:'Ein dichter Schrottring mit mehr Durchschlag.',effect:'+3 Schrottkapazität · +20 % Salvenschaden',color:'violet'},
 {id:'repair',icon:'✚',name:'Nanoreparatur',desc:'Dein Mech repariert sich langsam selbst.',effect:'+0,6 HP/s · sofort +15 HP',color:'green'},
 {id:'pulse',icon:'◉',name:'Impulsverstärker',desc:'Stärkere Fähigkeiten mit kürzeren Ladezeiten.',effect:'−12 % Abklingzeit · +20 % Pulsschaden',color:'gold'}
];
export function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function free(x,z,r=.45){if(Math.abs(x)>ARENA-r||Math.abs(z)>ARENA-r)return false;return !OBSTACLES.some(o=>Math.abs(x-o.x)<o.w+r&&Math.abs(z-o.z)<o.d+r);}
export function move(body,dx,dz,r=.45){const oldX=body.x,oldZ=body.z;if(free(body.x+dx,body.z,r))body.x+=dx;if(free(body.x,body.z+dz,r))body.z+=dz;return Math.hypot(body.x-oldX,body.z-oldZ);}
export function lineClear(a,b){const d=distance(a,b),n=Math.ceil(d/.5);for(let i=1;i<n;i++){const t=i/n;if(!free(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,.08))return false;}return true;}
export function freshProgress(){return {version:1,wallet:0,hull:0,coil:0,drive:0,bestWave:0,bestKills:0,wins:0,claimed:[]};}
export function newRun(progress=freshProgress(),seed=Date.now()){
 const maxHp=100+progress.hull*10;
 return {version:1,id:String(seed)+'-'+Math.floor(Math.random()*1e6),seed:seed>>>0,mode:'playing',wave:1,waveTime:0,elapsed:0,spawned:0,spawnClock:1,intermission:0,bossSpawned:false,nextId:1,kills:0,earned:0,level:1,xp:0,xpNeed:28,pendingLevels:0,choices:[],upgrades:{coil:0,saw:0,chain:0,armor:0,drive:0,capacitor:0,repair:0,pulse:0},player:{x:0,z:2,hp:maxHp,maxHp,dirX:0,dirZ:-1,invuln:0,ammo:5,maxAmmo:12,fire:0,chainClock:1,pulse:0,volley:0,emp:0},meta:{damage:1+progress.coil*.08,speed:1+progress.drive*.04},enemies:[],bullets:[],loot:[],hazards:[],angle:0,combo:0,comboTime:0,bossDefeated:false};
}
export class Game {
 constructor(progress=freshProgress(),snapshot=null,seed=Date.now()){
  this.s=snapshot?.version===1?JSON.parse(JSON.stringify(snapshot)):newRun(progress,seed);this.events=[];
 }
 emit(type,data={}){this.events.push({...data,type});}
 drain(){return this.events.splice(0);}
 stats(){const s=this.s,u=s.upgrades;return {damage:9*s.meta.damage*(1+u.coil*.15),speed:5*s.meta.speed*(1+u.drive*.1),range:6.7+u.coil*.35,pickup:3*(1+u.coil*.25),cooldown:.6/Math.pow(1.1,u.drive),skill:Math.pow(.88,u.pulse),ringDamage:7+u.capacitor*2+u.coil,sawDamage:13+u.saw*5};}
 spawn(type=null){const s=this.s;if(s.enemies.length>=28)return null;let x=0,z=0;for(let i=0;i<40;i++){const side=Math.floor(random(s)*4),p=(random(s)*2-1)*14;[x,z]=side===0?[p,-14.4]:side===1?[14.4,p]:side===2?[p,14.4]:[-14.4,p];if(distance({x,z},s.player)>8&&free(x,z,.7))break;}
  if(!type){const roll=random(s);type=s.wave>=5&&roll<.2?'tank':s.wave>=3&&roll<.45?'shooter':roll>.77?'runner':'drone';}
  const cfg={drone:[24,1.7,9,.5],runner:[16,3.1,7,.4],shooter:[28,1.3,8,.5],tank:[65,1,14,.75],boss:[1200,.8,22,1.6]}[type];
  if(type==='boss'){x=0;z=-11;s.bossSpawned=true;}
  const e={id:s.nextId++,type,x,z,hp:cfg[0]*(type==='boss'?1:1+(s.wave-1)*.12),maxHp:cfg[0]*(type==='boss'?1:1+(s.wave-1)*.12),speed:cfg[1],damage:cfg[2],r:cfg[3],stun:0,attack:1+random(s),flash:0,skill:3,pattern:0};s.enemies.push(e);this.emit('spawn',{id:e.id,enemyType:type,x,z});return e;
 }
 hit(e,damage){if(e.hp<=0)return;e.hp-=damage;e.flash=.12;if(e.hp>0){this.emit('hit',{x:e.x,z:e.z,damage});return;}const s=this.s;s.kills++;s.combo=s.comboTime>0?s.combo+1:1;s.comboTime=3;s.earned+=e.type==='boss'?25:e.type==='tank'?2:1;
  const count=e.type==='boss'?12:e.type==='tank'?4:2;for(let i=0;i<count;i++){const a=random(s)*Math.PI*2,r=random(s)*.8;s.loot.push({id:s.nextId++,x:e.x+Math.cos(a)*r,z:e.z+Math.sin(a)*r,kind:'scrap',xp:e.type==='boss'?8:4,life:40});}
  if(random(s)<.11)s.loot.push({id:s.nextId++,x:e.x,z:e.z,kind:'heal',xp:0,life:40});if(e.type==='boss'){s.bossDefeated=true;this.emit('bossDown');}this.emit('kill',{x:e.x,z:e.z,enemyType:e.type});
 }
 hurt(damage){const s=this.s,p=s.player;if(p.invuln>0||s.mode!=='playing')return false;const reduction=Math.min(.3,p.ammo*.025);p.hp=Math.max(0,p.hp-damage*(1-reduction));if(p.ammo>0)p.ammo--;p.invuln=.65;s.combo=0;this.emit('hurt',{damage,x:p.x,z:p.z});if(p.hp<=0){s.mode='lost';this.emit('end',{won:false});}return true;}
 nearest(from=this.s.player,range=Infinity,exclude=[]){return this.s.enemies.filter(e=>e.hp>0&&!exclude.includes(e.id)&&distance(e,from)<range).sort((a,b)=>distance(a,from)-distance(b,from))[0]||null;}
 projectile(from,target,damage,enemy=false,speed=16){const d=distance(from,target)||1;this.s.bullets.push({id:this.s.nextId++,x:from.x,z:from.z,dx:(target.x-from.x)/d,dz:(target.z-from.z)/d,damage,enemy,speed,life:enemy?4:1.4});}
 skill(id){const s=this.s,p=s.player,stats=this.stats();if(s.mode!=='playing')return false;
  if(id==='pulse'&&p.pulse<=0){p.pulse=8*stats.skill;for(const l of s.loot){if(distance(l,p)<10+ s.upgrades.coil)this.collect(l);}s.loot=s.loot.filter(l=>l.life>0);for(const e of s.enemies){if(distance(e,p)<6){e.stun=1.4;this.hit(e,20*(1+s.upgrades.pulse*.2));const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz)||1;move(e,dx/d*.65,dz/d*.65,e.r);}}this.emit('pulse',{x:p.x,z:p.z,r:6});return true;}
  if(id==='volley'&&p.volley<=0&&p.ammo>=3){const count=p.ammo;p.ammo=0;p.volley=2;const targets=s.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(a,p)-distance(b,p));for(let i=0;i<count;i++){const target=targets[i%Math.max(targets.length,1)]||{x:p.x+Math.cos(i/count*6.28)*8,z:p.z+Math.sin(i/count*6.28)*8};this.projectile(p,target,(13+s.upgrades.capacitor*5)*s.meta.damage,false,19);}this.emit('volley',{x:p.x,z:p.z,count});return true;}
  if(id==='emp'&&p.emp<=0){p.emp=15*stats.skill;const affected=s.enemies.filter(e=>e.hp>0&&distance(e,p)<8);for(const e of affected){e.stun=2;this.hit(e,26+ s.upgrades.chain*8+s.upgrades.pulse*5);}this.emit('emp',{x:p.x,z:p.z,r:8});return true;}
  return false;
 }
 collect(l){if(l.life<=0)return;const s=this.s,p=s.player;l.life=0;if(l.kind==='heal'){p.hp=Math.min(p.maxHp,p.hp+12);this.emit('heal',{x:p.x,z:p.z});return;}p.ammo=Math.min(p.maxAmmo,p.ammo+1);s.xp+=l.xp;this.emit('collect',{x:l.x,z:l.z});while(s.xp>=s.xpNeed){s.xp-=s.xpNeed;s.level++;s.xpNeed=28+s.level*10;s.pendingLevels++;}}
 offer(){const s=this.s;if(s.pendingLevels<=0)return;s.mode='upgrade';const pool=UPGRADES.filter(u=>s.upgrades[u.id]<6);s.choices=[];while(s.choices.length<3&&pool.length){const i=Math.floor(random(s)*pool.length);s.choices.push(pool.splice(i,1)[0].id);}if(!s.choices.length){s.pendingLevels=0;s.mode='playing';}else this.emit('upgrade');}
 choose(id){const s=this.s;if(s.mode!=='upgrade'||!s.choices.includes(id))return false;s.upgrades[id]++;const p=s.player;if(id==='armor'){p.maxHp+=18;p.hp=Math.min(p.maxHp,p.hp+20);}if(id==='repair')p.hp=Math.min(p.maxHp,p.hp+15);if(id==='capacitor')p.maxAmmo+=3;s.pendingLevels--;s.choices=[];s.mode='playing';this.emit('equipped',{id});if(s.pendingLevels>0)this.offer();return true;}
 bossAttack(e){const s=this.s,p=s.player;e.pattern++;const type=e.pattern%3;this.emit('bossAttack',{pattern:type});if(type===0){for(let i=-2;i<=2;i++)s.hazards.push({id:s.nextId++,kind:'circle',x:clamp(p.x+i*2.2,-13,13),z:p.z,r:1.7,warning:1.4,life:1.8,damage:22,fired:false});}else if(type===1){const dx=p.x-e.x,dz=p.z-e.z,len=Math.hypot(dx,dz)||1;s.hazards.push({id:s.nextId++,kind:'line',x:e.x,z:e.z,dx:dx/len,dz:dz/len,length:24,r:1.3,warning:1.65,life:2.1,damage:30,fired:false});}else{this.spawn('runner');this.spawn('shooter');s.hazards.push({id:s.nextId++,kind:'circle',x:e.x,z:e.z,r:5.2,warning:1.5,life:2,damage:25,fired:false});}}
 tick(dt,input={x:0,z:0}){const s=this.s;if(s.mode!=='playing')return;dt=clamp(dt,0,.05);const p=s.player,stats=this.stats();s.elapsed+=dt;s.waveTime+=dt;s.angle+=dt*1.65;s.comboTime=Math.max(0,s.comboTime-dt);p.invuln=Math.max(0,p.invuln-dt);for(const key of ['pulse','emp','volley'])p[key]=Math.max(0,p[key]-dt);p.hp=Math.min(p.maxHp,p.hp+s.upgrades.repair*.6*dt);
  const len=Math.hypot(input.x,input.z);if(len>.06){const scale=Math.min(1,len)/len;move(p,input.x*scale*stats.speed*dt,input.z*scale*stats.speed*dt);p.dirX=input.x/len;p.dirZ=input.z/len;}
  if(s.intermission>0){s.intermission-=dt;for(const l of s.loot)this.collect(l);s.loot=[];if(s.intermission<=0){s.wave++;s.spawned=0;s.spawnClock=.8;s.waveTime=0;this.emit('wave',{wave:s.wave});}}
  else{const quota=[0,6,9,12,15,18,22,26,7][s.wave];s.spawnClock-=dt;if(s.wave===8&&!s.bossSpawned){this.spawn('boss');this.emit('boss');}if(s.spawned<quota&&s.spawnClock<=0&&s.enemies.length<26){this.spawn();s.spawned++;s.spawnClock=Math.max(.5,1.7-s.wave*.13);}if(s.spawned>=quota&&s.enemies.every(e=>e.hp<=0)&&(!s.bossSpawned||s.bossDefeated)){if(s.wave===8){s.mode='won';this.emit('end',{won:true});return;}s.intermission=2.5;p.hp=Math.min(p.maxHp,p.hp+7);this.emit('clear',{wave:s.wave});}}
  p.fire-=dt;const target=s.enemies.filter(e=>e.hp>0&&distance(e,p)<stats.range&&lineClear(p,e)).sort((a,b)=>distance(a,p)-distance(b,p))[0]||null;if(target&&p.fire<=0&&lineClear(p,target)){this.projectile(p,target,stats.damage);p.fire=stats.cooldown;this.emit('shot',{x:p.x,z:p.z,tx:target.x,tz:target.z});}
  p.chainClock-=dt;if(s.upgrades.chain&&p.chainClock<=0&&target){p.chainClock=2;let last=p,used=[];for(let i=0;i<1+s.upgrades.chain;i++){const next=this.nearest(last,i===0?9:5,used);if(!next)break;used.push(next.id);this.emit('arc',{x:last.x,z:last.z,tx:next.x,tz:next.z});this.hit(next,12+s.upgrades.chain*4);last=next;}}
  for(const e of s.enemies){if(e.hp<=0)continue;e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,e.stun-dt);if(e.stun>0)continue;const d=distance(e,p),dx=(p.x-e.x)/Math.max(d,.001),dz=(p.z-e.z)/Math.max(d,.001);const stop=e.type==='shooter'?5:e.type==='boss'?4:.9;
   if(d>stop){const moved=move(e,dx*e.speed*dt,dz*e.speed*dt,e.r);if(moved<e.speed*dt*.3){const turn=e.id%2?1:-1;move(e,-dz*e.speed*dt*turn,dx*e.speed*dt*turn,e.r);}}
   if(e.type==='shooter'){e.attack-=dt;if(e.attack<=0){e.attack=2.4;this.projectile(e,p,e.damage,true,5.2);this.emit('enemyShot',{x:e.x,z:e.z});}}
   if(e.type==='boss'){e.skill-=dt;if(e.skill<=0){e.skill=e.hp<e.maxHp*.4?3:4.3;this.bossAttack(e);}}
   if(d<e.r+.55)this.hurt(e.damage);
   const ring=s.player.ammo>0?1.65+s.upgrades.capacitor*.07+s.upgrades.coil*.035:0;if(ring&&Math.abs(d-ring)<e.r+.35)this.hit(e,stats.ringDamage*dt*Math.min(p.ammo,8)/4);
   for(let i=0;i<s.upgrades.saw;i++){const angle=s.angle*1.6+i/Math.max(1,s.upgrades.saw)*Math.PI*2;if(Math.hypot(e.x-(p.x+Math.cos(angle)*2.45),e.z-(p.z+Math.sin(angle)*2.45))<e.r+.6)this.hit(e,stats.sawDamage*dt);}
  }
  for(const b of s.bullets){if(b.life<=0)continue;const old={x:b.x,z:b.z};b.x+=b.dx*b.speed*dt;b.z+=b.dz*b.speed*dt;b.life-=dt;if(!free(b.x,b.z,.1)){b.life=0;continue;}if(b.enemy){if(distance(b,p)<.65){this.hurt(b.damage);b.life=0;}}else{for(const e of s.enemies){if(e.hp<=0)continue;const vx=b.x-old.x,vz=b.z-old.z,t=clamp(((e.x-old.x)*vx+(e.z-old.z)*vz)/(vx*vx+vz*vz||1),0,1);if(Math.hypot(e.x-old.x-vx*t,e.z-old.z-vz*t)<e.r+.2){this.hit(e,b.damage);b.life=0;break;}}}}
  for(const l of s.loot){l.life-=dt;if(l.life<=0)continue;const d=distance(l,p);if(d<stats.pickup){const step=Math.min(d,dt*(4+(stats.pickup-d)*4));l.x+=(p.x-l.x)/Math.max(d,.001)*step;l.z+=(p.z-l.z)/Math.max(d,.001)*step;if(d<.6)this.collect(l);}}
  for(const h of s.hazards){h.life-=dt;h.warning-=dt;if(h.warning<=0&&!h.fired){h.fired=true;let hit=false;if(h.kind==='circle')hit=distance(h,p)<h.r+.4;else{const dx=p.x-h.x,dz=p.z-h.z,along=dx*h.dx+dz*h.dz,side=Math.abs(dx*h.dz-dz*h.dx);hit=along>0&&along<h.length&&side<h.r+.4;}if(hit)this.hurt(h.damage);this.emit('impact',{x:h.x,z:h.z,r:h.r});}}
  s.enemies=s.enemies.filter(e=>e.hp>0);s.bullets=s.bullets.filter(b=>b.life>0);s.loot=s.loot.filter(l=>l.life>0).slice(-180);s.hazards=s.hazards.filter(h=>h.life>0);if(s.pendingLevels>0&&s.mode==='playing')this.offer();
 }
 snapshot(){return JSON.parse(JSON.stringify(this.s));}
}
export function claim(progress,run){if(!['won','lost'].includes(run.mode)||progress.claimed.includes(run.id))return false;progress.wallet+=run.earned+run.wave*2+(run.mode==='won'?25:0);progress.bestWave=Math.max(progress.bestWave,run.wave);progress.bestKills=Math.max(progress.bestKills,run.kills);if(run.mode==='won')progress.wins++;progress.claimed.push(run.id);return true;}
export function buy(progress,id){if(!['hull','coil','drive'].includes(id)||progress[id]>=5)return false;const cost=10+progress[id]*12;if(progress.wallet<cost)return false;progress.wallet-=cost;progress[id]++;return true;}
