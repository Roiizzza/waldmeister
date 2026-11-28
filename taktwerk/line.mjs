export const SPAN = 28;
export const GAP = 3.65;
export const DISPATCH = SPAN * 4;
const op = (name, kind, point, seconds, phase, from) => ({name, kind, point, seconds, phase, from});
const bolt = (name,x,y,z,phase) => op(name,'bolt',[x,y,z],1.3,phase);
const fit = (name,point,phase) => op(name,'fit',point,.75,phase,[point[0]-.96,point[1]+.6,point[2]+.13]);
const test = (name,point,phase) => op(name,'test',point,1.5,phase);
export const specs = [
 {name:'Motorenbau',part:'V8-Motor',open:0,pay:48,robot:460,phases:['Ventildeckel verschrauben','Öldruck prüfen'],ops:[
  bolt('Schraube 1',-.78,2.22,.43,0),bolt('Schraube 2',.78,2.22,-.43,0),bolt('Schraube 3',.78,2.22,.43,0),bolt('Schraube 4',-.78,2.22,-.43,0),test('Öldruck prüfen',[.16,2.32,.05],1)]},
 {name:'Achsenbau',part:'Fahrmodul',open:192,pay:100,robot:770,phases:['Achsen in die Aufnahme ziehen','Lager verschrauben','Spur prüfen'],ops:[
  fit('Vorderachse einsetzen',[-.94,1.7,.15],0),fit('Hinterachse einsetzen',[.94,1.7,.15],0),bolt('Linkes Lager',-.9,1.76,.54,1),bolt('Rechtes Lager',.9,1.76,.54,1),test('Spur prüfen',[0,1.89,0],2)]},
 {name:'Karosseriebau',part:'Rohfahrzeug',open:780,pay:185,robot:1300,phases:['Karosserie aufsetzen','Schweißpunkte setzen','Naht prüfen'],ops:[
  fit('Karosserie führen',[.15,1.9,.05],0),...[-1,-.34,.34,1].map((x,j)=>op('Schweißpunkt '+(j+1),'weld',[x,1.66,.75],1.1,1)),test('Naht prüfen',[.25,1.86,.68],2)]},
 {name:'Endmontage',part:'Fahrzeug',open:2100,pay:370,robot:2200,phases:['Radsatz einsetzen','Radnaben sichern','Abnahme durchführen'],ops:[
  fit('Radsatz vorn',[-.94,1.55,.82],0),fit('Radsatz hinten',[.94,1.55,.82],0),bolt('Nabe vorn',-.94,1.55,.93,1),bolt('Nabe hinten',.94,1.55,.93,1),test('Lichttest',[-1.4,1.68,.54],2),test('Endabnahme',[.3,2.37,.15],2)]}
];
export const personal = {pace:['Laufschuhe','Schneller durch die Halle',65],skill:['Werkzeugführung','Mehr Tempo bei Handarbeit',85],bonus:['Meisterbrief','Höhere Prämie für eigene Montage',150]};
export const stationUp = {tool:['Werkzeug','Schneller bearbeiten',1.7,6],quality:['Qualität','Höhere Stückprämie',2.2,6],belt:['Bandantrieb','Schneller transportieren',1.65,5],buffer:['Staustrecke','Ein zusätzlicher Pufferplatz',1.45,3],staff:['Handwerker','Hilft nach deinem ersten Handgriff',3.1,4]};
const zero = i => specs[i].ops.map(()=>0);
const bounded=(x,hi)=>Math.max(0,Math.min(hi,Math.floor(Number(x))||0));
const station = i => ({open:i===0,tool:0,quality:0,belt:0,buffer:0,staff:0,robot:false,auto:false,program:null,made:0,reserve:0,run:null,idle:0});
export class Line {
 constructor(saved){this.stations=specs.map((_,i)=>station(i));this.money=0;this.player={pace:0,skill:0,bonus:0};this.sales=[];this.parts=[];this.serial=0;this.shipped=0;this.time=0;this.changed=0;this.record=null;if(saved)this.load(saved);if(!this.parts.length)this.make(0,0);this.feed();}
 make(i,x){const p={id:++this.serial,at:i,x,work:i<4?zero(i):[],manual:false};this.parts.push(p);return p}
 feed(){if(!this.parts.some(p=>p.x<GAP-.001))this.make(0,-3.8)}
 load(v){
  if(!Array.isArray(v.states)||v.states.length!==4)return;
  if(Array.isArray(v.sales))this.sales=v.sales.filter(p=>p&&Number.isFinite(p.x)&&p.at>=1&&p.at<=3&&p.z>-9);
  this.serial=bounded(v.serial,1e12);
  this.money=bounded(v.money,1e12);this.shipped=bounded(v.shipped,1e10);
  for(const k in this.player)this.player[k]=bounded(v.player?.[k],5);
  const modern=v.version===2;
  this.stations.forEach((s,i)=>{const old=v.states[i]||{};
   s.open=i===0||this.stations[i-1].open&&!!old.open;
   for(const [k,u] of Object.entries(stationUp))s[k]=bounded(old[k],u[3]);
   s.robot=!!old.robot;s.made=bounded(old.made,1e10);s.reserve=bounded(modern?old.reserve:i<3?old.stock:0,1e10);
   if(modern&&this.validProgram(i,old.program)){s.program=old.program;s.auto=s.robot&&!!old.auto}
   if(!modern&&s.robot&&old.program?.length===3){s.program=specs[i].ops.map((_,j)=>({j,wait:Number(old.program[Math.min(2,specs[i].ops[j].phase)]?.wait)||0}));s.auto=!!old.auto}
   if(!modern&&s.open&&old.step>0){const p=this.make(i,i*SPAN);p.work=p.work.map((_,j)=>j<Math.min(old.step,specs[i].ops.length-1)?1:0);p.manual=true}
  });
  if(modern&&Array.isArray(v.parts)){for(const a of v.parts){if(!Number.isInteger(a.at)||a.at<0||a.at>4||!Number.isFinite(a.x))continue;const p=this.make(a.at,Math.min(a.at*SPAN,Math.max(-4,a.x)));if(Number.isSafeInteger(a.id)&&a.id>0){p.id=a.id;this.serial=Math.max(this.serial,a.id)}p.work=p.work.map((_,j)=>Math.max(0,Math.min(1,Number(a.work?.[j])||0)));p.manual=!!a.manual}}
  else this.shipped=bounded(v.states[3]?.stock,1e10);
 }
 validProgram(i,p){return Array.isArray(p)&&p.length===specs[i].ops.length&&new Set(p.map(c=>c?.j)).size===p.length&&p.every((c,k)=>Number.isInteger(c.j)&&specs[i].ops[c.j]&&Number.isFinite(c.wait)&&c.wait>=0&&(!k||specs[i].ops[c.j].phase>=specs[i].ops[p[k-1].j].phase))}
 snapshot(){return {version:2,serial:this.serial,money:this.money,shipped:this.shipped,player:this.player,sales:this.sales,parts:this.parts,states:this.stations.map(({run,idle,...s})=>s)}}
 dock(i){return this.parts.find(p=>p.at===i&&p.x>=i*SPAN-.001)}
 capacity(i){return 4+this.stations[i].buffer}
 outgoing(i){return this.parts.filter(p=>p.at===i+1)}
 blocked(i){return this.outgoing(i).length>=this.capacity(i)}
 available(i,p=this.dock(i)){if(!p)return [];const ops=specs[i].ops;const phase=ops.find((_,j)=>p.work[j]<1)?.phase;return ops.map((o,j)=>o.phase===phase&&p.work[j]<1?j:-1).filter(j=>j>=0)}
 price(i,k){if(personal[k])return Math.ceil(personal[k][2]*1.8**this.player[k]);if(k==='open'||k==='robot')return specs[i][k];return Math.ceil(specs[i].pay*stationUp[k][2]*1.6**this.stations[i][k])}
 buy(i,k){const s=this.stations[i];if(personal[k]?this.player[k]>=5:k==='open'?s.open||!this.stations[i-1]?.open:!s.open||(k==='robot'?s.robot:!stationUp[k]||s[k]>=stationUp[k][3]))return false;const cost=this.price(i,k);if(this.money<cost)return false;this.money-=cost;if(personal[k])this.player[k]++;else if(k==='open'||k==='robot')s[k]=true;else s[k]++;this.changed++;return true}
 reward(i,manual){return Math.round(specs[i].pay*(1+this.stations[i].quality*.30)*(1+(manual?this.player.bonus*.12:0)))}
 teach(i){const s=this.stations[i],p=this.dock(i);if(!s.robot||!p||p.work.some(Boolean)||this.record||s.run)return false;s.auto=false;this.record={i,cues:[],last:this.time};this.changed++;return true}
 begin(i,j,who='player'){const s=this.stations[i],p=this.dock(i);if(!s.open||!p||s.run||!this.available(i,p).includes(j)||who==='player'&&s.auto)return false;
  const speed=(1+s.tool*.2)*(who==='player'?1+this.player.skill*.17:who==='worker'?.60+s.staff*.17:1.08);
  s.run={j,who,seconds:specs[i].ops[j].seconds/speed,drag:0,wait:this.record?.i===i?Math.max(0,this.time-this.record.last):0};
  return true
 }
 release(i,fit=false){const s=this.stations[i],r=s.run;if(r?.who!=='player')return;const kind=specs[i].ops[r.j].kind;const pass=kind==='test'&&r.reading>=.61&&r.reading<=.86;if(fit&&kind==='fit'||pass)this.completeOp(i);else s.run=null;return pass}
 completeOp(i){const s=this.stations[i],r=s.run,p=this.dock(i);if(!r||!p)return;p.work[r.j]=1;if(r.who==='player')p.manual=true;if(this.record?.i===i){this.record.cues.push({j:r.j,wait:r.wait});this.record.last=this.time} s.run=null;s.idle=0;this.changed++}
 sellSpare(i){if(i>=3)return false;const p=this.outgoing(i).filter(p=>p.x>(i+1)*SPAN-7*GAP&&p.x<(i+1)*SPAN-.1).sort((a,b)=>b.x-a.x)[0];if(!p||p.work.some(Boolean)||this.sales.some(s=>Math.abs(s.x-p.x)<GAP))return false;this.parts=this.parts.filter(a=>a!==p);this.sales.push({...p,z:0});this.money+=Math.round(specs[i].pay*.45);this.changed++;return true}
 advance(dt,play=true){this.time+=play?dt:0;const events=[];this.sales.forEach(p=>p.z-=dt*2.6);this.sales=this.sales.filter(p=>p.z>-8);this.parts.sort((a,b)=>b.x-a.x||b.at-a.at||a.id-b.id);let leader=Infinity;
  for(const p of this.parts){const dock=p.at*SPAN,open=p.at===4||this.stations[p.at].open;const stop=Math.min(dock-(open?0:GAP),leader-GAP);const speed=2.65+1.05*this.stations[Math.max(0,p.at-1)].belt;
   if(p.x<stop)p.x=Math.min(stop,p.x+dt*speed);leader=p.x}
  this.parts=this.parts.filter(p=>{if(p.at===4&&p.x>=DISPATCH-.001){this.shipped++;this.changed++;return false}return true});
  this.stations.forEach((s,i)=>{
   if(s.reserve&&i<3&&!this.blocked(i)&&!this.parts.some(p=>Math.abs(p.x-(i*SPAN+GAP))<GAP)){this.make(i+1,i*SPAN+GAP);s.reserve--;this.changed++}
   const p=this.dock(i);if(!s.open||!p)return;
   if(p.work.every(n=>n>=1)){if(this.blocked(i))return;const pay=this.reward(i,p.manual);this.money+=pay;s.made++;p.at++;p.work=p.at<4?zero(p.at):[];p.manual=false;s.idle=0;
    if(this.record?.i===i){s.program=this.record.cues;s.auto=true;this.record=null}this.changed++;events.push({i,pay});return}
   if(!s.run){const options=this.available(i,p);if(s.auto&&s.program){const cue=s.program.find(c=>options.includes(c.j));if(cue&&(s.idle+=dt)>=cue.wait)this.begin(i,cue.j,'robot')}
    else if(s.staff&&p.manual&&!this.record&&((s.idle+=dt)>.85))this.begin(i,options[0],'worker')}
   const r=s.run;if(!r||r.who==='player'&&!play)return;
   if(r.who==='player'&&specs[i].ops[r.j].kind==='fit')return;
   if(r.who==='player'&&specs[i].ops[r.j].kind==='test'){r.elapsed=(r.elapsed||0)+dt;r.reading=1-Math.abs((r.elapsed/(r.seconds*1.65))%2-1);return}
   p.work[r.j]=Math.min(1,p.work[r.j]+dt/r.seconds);if(p.work[r.j]>=1)this.completeOp(i)
  });this.feed();return events
 }
}
