import * as T from './vendor/three.js';
import {raster} from './raster.js';
import {SPAN,DISPATCH} from './line.mjs?v=2';
const clamp=T.MathUtils.clamp;
export function world(container,defs){
 const scene=new T.Scene();scene.background=new T.Color(0xcbd6ca);scene.fog=new T.FogExp2(0xd4d8ce,.019);
 let renderer;try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch{renderer=raster()}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.append(renderer.domElement);
 const cam=new T.PerspectiveCamera(57,1,.045,100);cam.rotation.order='YXZ';const sun=new T.DirectionalLight(0xfff0d8,2.65);sun.position.set(-7,17,2);sun.target.position.set(4,0,0);scene.add(sun,sun.target,new T.HemisphereLight(0xf4fffa,0x9e9179,2.1));sun.castShadow=true;Object.assign(sun.shadow.camera,{left:-24,right:24,top:16,bottom:-16,near:.1,far:60});sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.013;sun.shadow.bias=-.00015;
 const coal=0x2b3534,steel=0x566765,al=0xa3b0a8,silver=0xc4ccc1,orange=0xe36a2c,yellow=0xe4a743,green=0x83998f,wall=0xd8d8c9;const geos={box:new T.BoxGeometry(),cyl:new T.CylinderGeometry(.5,.5,1,20),bolt:new T.CylinderGeometry(.5,.5,1,6)},mats=new Map(),batches=new Map();
 function grp(p=scene,x=0,y=0,z=0){let g=new T.Group();p.add(g);g.position.set(x,y,z);return g}
 function shape(p,type,color,x,y,z,w,h,d,rx=0,ry=0,rz=0,metal=0){let mk=color+'/'+metal,m=mats.get(mk);if(!m){m=new T.MeshStandardMaterial({color,metalness:metal,roughness:metal?.43:.76});mats.set(mk,m)}const key=p.id+'/'+type+'/'+mk;let set=batches.get(key);if(!set){set={p,g:geos[type],m,ls:[]};batches.set(key,set)}const o=new T.Object3D();o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.set(rx,ry,rz);o.updateMatrix();set.ls.push(o.matrix)}
 const box=(p,c,x,y,z,w,h,d,rx=0,ry=0,rz=0,m=0)=>shape(p,'box',c,x,y,z,w,h,d,rx,ry,rz,m);
 const cyl=(p,c,x,y,z,d,h,rx=0,rz=0,m=.27,type='cyl')=>shape(p,type,c,x,y,z,d,h,d,rx,0,rz,m);
 function rod(p,c,a,b,d){const A=new T.Vector3(...a),v=new T.Vector3(...b).sub(A),mid=A.addScaledVector(v,.5),rot=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()));shape(p,'cyl',c,mid.x,mid.y,mid.z,d,v.length(),d,rot.x,rot.y,rot.z,.28)}
 function sign(p,txt,sub,x,y,z,w,h,bg='#2b3835',fg='#fff4de'){const c=document.createElement('canvas');c.width=640;c.height=Math.max(100,Math.round(640*h/w));let a=c.getContext('2d');a.fillStyle=bg;a.fillRect(0,0,c.width,c.height);a.fillStyle=fg;a.textBaseline='middle';a.font='bold '+Math.round(c.height*(sub?.52:.66))+'px Arial';a.fillText(txt,29,c.height*(sub?.4:.52),580);if(sub){a.font='bold '+Math.round(c.height*.15)+'px monospace';a.fillText(sub,31,c.height*.81,570)}const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map}));mesh.position.set(x,y,z);p.add(mesh)}
 const hall=grp();box(hall,0x96a095,52,-.12,0,148,.24,24);for(let x=-20;x<128;x+=4){box(hall,0x80887e,x,.003,0,.018,.004,24);for(const z of [-8,-4,4,8])box(hall,0x818c81,x+2,.003,z,3.99,.006,.018)}
 for(const z of [-2.3,2.05,4.92])box(hall,z>4?wall:yellow,52,.009,z,144,.009,.08);for(let x=-20;x<126;x+=.53)box(hall,0xd4a347,x,.01,2.24,.16,.012,.37,0,-.45);
 box(hall,wall,52,3.55,-7.7,148,7.1,.25);box(hall,0x8da499,52,1,-7.49,148,2,.18);box(hall,0xbfc5ba,52,7.6,0,148,.15,22);
 for(let x=-20;x<129;x+=4){box(hall,steel,x+1.92,4.53,-7.43,3.8,3.32,.16);for(const q of [.96,2.87])for(const h of [3.8,5.27])box(hall,h>4?0xe1ece2:0xbcd4c9,x+q,h,-7.29,1.78,1.36,.05);for(const z of [-6.85,7.5]){box(hall,steel,x,3.75,z,.24,7.5,.31);box(hall,coal,x,3.75,z+.16,.34,7.5,.05);box(hall,yellow,x,.63,z,.41,1.26,.42);box(hall,coal,x,.22,z,.43,.15,.43)}box(hall,steel,x,6.93,.4,.18,.18,14.6);box(hall,steel,x,7.47,.4,.15,.12,14.6);for(let z=-6.6;z<7;z+=1.5)rod(hall,green,[x,6.95,z],[x,7.45,z+.85],.08);for(const z of [-3.6,3.6]){box(hall,steel,x+1.7,6.6,z,2.8,.14,.35);box(hall,0xfffbe2,x+1.7,6.51,z,2.69,.045,.29)}}
 for(const z of [-5.9,-5.64,-5.37])rod(hall,z<-5.8?0xa5754f:al,[-22,5.85,z],[123,5.85,z],.14);
 for(let x=-16;x<129;x+=9){box(hall,orange,x,5.8,0,.42,.45,13);box(hall,yellow,x+.22,5.61,0,.06,.12,12.9);box(hall,coal,x,5.42,-.4,.78,.33,.84);for(const q of [-.13,.13])rod(hall,coal,[x+q,5.4,-.4],[x+q,4.9,-.4],.035);box(hall,yellow,x,4.86,-.4,.42,.16,.18)}
 for(let x=-19;x<125;x+=8){for(let j=0;j<3;j++){const xx=x+j*.92;box(hall,j?0xa4b1a6:green,xx,1.05,-6.7,.88,2.08,.78);box(hall,coal,xx+.29,.98,-6.29,.035,.23,.035);for(let k=0;k<4;k++)box(hall,steel,xx,1.68+k*.068,-6.295,.43,.018,.015)}
 for(const y of [.22,.86,1.5]){box(hall,orange,x+4.4,y,-5.7,2.95,.1,1.04);for(let j=-1;j<=1;j++){box(hall,j===0?green:0x708983,x+4.4+j*.86,y+.24,-5.7,.75,.39,.79);box(hall,wall,x+4.4+j*.86,y+.25,-5.294,.28,.1,.014)}}for(const q of [-1.5,1.5])for(const z of [-6.24,-5.16])box(hall,steel,x+4.4+q,1,z,.08,2,.08);
 for(const q of [0,3.3])cyl(hall,yellow,x+q,.48,-3.33,.13,.97);for(const y of [.48,.9])rod(hall,yellow,[x,y,-3.33],[x+3.3,y,-3.33],.075)}
 sign(hall,'TAKTWERK','',-.5,2.1,-7.3,4.8,.74);
 box(hall,coal,52,.70,0,136,.19,2.5);for(let x=-21;x<125;x+=.29)cyl(hall,Math.round(x*10)%3?al:0x94a49d,x,.858,0,.18,2.45,Math.PI/2);for(const z of [-1.26,1.26]){box(hall,coal,52,.74,z,136,.33,.14);box(hall,al,52,.921,z,136,.045,.16);box(hall,orange,52,.74,z+Math.sign(z)*.081,136,.10,.025)}
 for(let x=-20;x<125;x+=2.2){for(const z of [-1,1]){box(hall,steel,x,.38,z,.17,.73,.21);box(hall,coal,x,.055,z,.4,.11,.39);cyl(hall,silver,x,.8,z*1.35,.065,.027,Math.PI/2,0,.4,'bolt')}box(hall,steel,x,.28,0,.12,.12,2.14)}
 function bolt(p,x,y,z){cyl(p,silver,x,y,z,.074,.047,0,0,.46,'bolt')}
 function motor(p,layers){box(p,coal,0,.16,0,1.8,.22,.74);box(p,steel,0,.4,0,1.94,.4,.83);for(const s of [-1,1]){const bank=grp(p,0,.36,s*.26);bank.rotation.x=s*.54;box(bank,0x84948e,0,.24,0,2.02,.44,.43,0,0,0,.32);for(let j=0;j<5;j++)box(bank,al,0,.13+j*.067,0,2.06,.031,.48,0,0,0,.4);box(bank,coal,0,.48,0,2.07,.13,.49);box(bank,0x627674,0,.59,0,2,.16,.44,0,0,0,.36);for(const z of [-.15,-.05,.05,.15])box(bank,silver,0,.681,z,1.8,.023,.024,0,0,0,.45);for(const x of [-.87,-.43,0,.43,.87])for(const z of [-.2,.2])bolt(bank,x,.55,z);
 for(let j=0;j<4;j++){let x=-.74+j*.49;rod(p,al,[x,.65,s*.57],[x-.09,.48,s*.77],.13);rod(p,al,[x-.09,.48,s*.77],[x-.29,.26,s*.66],.13)}rod(p,steel,[-1.02,.26,s*.66],[.79,.26,s*.66],.17)}
 for(const [y,z,d] of [[.34,0,.48],[.65,.36,.32],[.65,-.36,.32],[.84,0,.25]]){cyl(p,coal,-1.09,y,z,d,.17,0,Math.PI/2);cyl(p,al,-1.19,y,z,d*.68,.042,0,Math.PI/2);cyl(p,coal,-1.23,y,z,d*.23,.06,0,Math.PI/2,.3,'bolt')}
 cyl(p,orange,.59,1,.51,.16,.09);for(let j=0;j<4;j++)for(const s of [-1,1])rod(layers[0],silver,[-.69+j*.46,.8,s*.4],[-.6+j*.46,1.03,s*.11],.15);
 box(layers[0],steel,0,1.04,0,1.69,.17,.36);box(layers[1],al,0,1.155,0,1.6,.06,.33);for(const x of [-.66,-.22,.22,.66])for(const z of [-.13,.13])bolt(layers[1],x,1.2,z)}
 function wheel(p,x,z,r=.37){cyl(p,coal,x,r,z,2*r,.26,Math.PI/2);cyl(p,steel,x,r,z+Math.sign(z)*.145,1.48*r,.035,Math.PI/2);cyl(p,al,x,r,z+Math.sign(z)*.17,.59*r,.045,Math.PI/2);for(let j=0;j<6;j++){let a=j*Math.PI/3;box(p,al,x+Math.sin(a)*r*.43,r+Math.cos(a)*r*.43,z+Math.sign(z)*.171,.06,r*.54,.05,0,0,-a)}}
 function body(p,c){box(p,c,0,.36,0,2.88,.45,1.46);box(p,c,.24,.68,0,1.66,.25,1.4);box(p,0x506969,.21,.94,0,1.37,.41,1.23);box(p,c,.22,1.18,0,1.49,.1,1.34);for(const s of [-1,1]){box(p,c,-.55,.94,s*.6,.085,.5,.07,0,0,-.32);box(p,c,.18,.94,s*.632,.08,.44,.05);box(p,silver,-1.45,.43,s*.48,.04,.16,.31)}}
 const rigs=[],arms=[];for(let i=0;i<4;i++){const x=i*SPAN,p=grp(hall,x);box(p,steel,1.7,1.95,-2.24,.13,3.9,.14);box(p,coal,.96,3.76,-2.24,1.56,.10,.14);sign(p,'0'+(i+1),defs[i].name.toUpperCase(),.95,3.26,-2.14,1.66,.88);box(p,orange,.16,3.26,-2.1,.07,.88,.04);box(p,green,-2,.61,-1.94,.66,1.18,.56);box(p,coal,-2,1.42,-1.9,.77,.52,.23);sign(p,'TW / 0'+(i+1),'',-2,1.43,-1.77,.6,.27,'#243b36','#a1d5a7');for(let j=0;j<3;j++)cyl(p,[0x48a462,yellow,0xc5593e][j],-2.23,1.78+j*.09,-1.89,.09,.085);
 const pallet=grp(scene,x,.96);box(pallet,0x726d5d,0,.045,0,3,.09,1.96);box(pallet,al,0,.111,0,2.91,.045,1.88);for(const z of [-.74,.74]){box(pallet,coal,0,.17,z,2.62,.1,.14);for(const xx of [-1.24,1.24])bolt(pallet,xx,.23,z)}
 const piece=grp(pallet,0,.22),layers=[grp(piece),grp(piece)];
 if(!i)motor(piece,layers);
 else {
  box(piece,steel,0,.25,0,2.45,.2,.64);
  for(const offset of [-.48,.48])box(piece,coal,0,.29,offset,2.63,.14,.12);
  for(const xx of [-.94,.94]){
   const axle=i===1?layers[xx<0?0:1]:piece;
   rod(axle,al,[xx,.36,-.78],[xx,.36,.78],.15);
   for(const side of [-1,1]){
    cyl(axle,al,xx,.36,side*.68,.43,.095,Math.PI/2);
    cyl(axle,coal,xx,.36,side*.74,.21,.08,Math.PI/2);
    if(i===3)wheel(layers[xx<0?0:1],xx,side*.77);
   }
  }
  if(i>=2)body(i===2?layers[0]:piece,0x73908d);
 }
 rigs.push({pallet,piece,layers});const arm=grp(scene,x+1.17,0,-2.03);box(arm,coal,0,.09,0,1.08,.18,1.04);cyl(arm,orange,0,.43,0,.68,.64);const swivel=grp(arm,0,.8);cyl(swivel,coal,0,.02,0,.61,.14);const shoulder=grp(swivel,0,.11),elbow=grp(shoulder,0,1.74);for(const [g,len,w] of [[shoulder,1.74,.29],[elbow,1.64,.22]]){box(g,orange,0,len*.5,0,w,len,w);rod(g,al,[w*.62,.1,0],[w*.62,len-.1,0],.055);cyl(g,coal,0,0,0,.42,.4,0,Math.PI/2);cyl(g,al,-.22,0,0,.24,.04,0,Math.PI/2)}cyl(elbow,coal,0,1.64,0,.23,.16);for(const s of [-1,1])box(elbow,steel,s*.085,1.78,0,.055,.21,.065);arms.push({arm,swivel,shoulder,elbow});arm.visible=false}
 // Dispatch door and side-loading bays make the logistics destinations visible.
 for(const z of [-6,6])box(hall,wall,DISPATCH-3,3.5,z,.3,7,8);box(hall,wall,DISPATCH-3,5.45,0,.3,3.1,4.1);box(hall,coal,DISPATCH+2.3,2.1,0,.14,4.2,4.1);
 for(const z of [-1.85,1.85])box(hall,steel,DISPATCH-.5,2.53,z,5,.10+3.1,.13);box(hall,steel,DISPATCH-.5,4.06,0,5,.15,3.8);
 for(let y=.22;y<4.4;y+=.24)box(hall,steel,DISPATCH+2.18,y,0,.09,.17,3.95);
 sign(hall,'VERSAND','FAHRZEUGABNAHME',DISPATCH-2,3.0,-2.4,3.4,.85);
 for(let i=1;i<4;i++){const xx=i*SPAN-6;sign(hall,'PUFFER 0'+i,'ERSATZTEILVERLADUNG',xx,2.6,-4.4,3.1,.68);for(const side of [-1,1])box(hall,yellow,xx+side*1.27,.03,-4.5,.09,.035,6.4)}
 const workers=defs.map((_,i)=>{const g=grp(scene,i*SPAN-.38,0,-1.68);
  for(const x of [-.16,.16]){box(g,coal,x,.42,0,.23,.75,.26);box(g,steel,x,.10,.06,.26,.2,.37)}
  box(g,0x335859,0,1.05,0,.62,.68,.34);box(g,yellow,0,1.05,.18,.6,.09,.04);
  cyl(g,0xb98261,0,1.59,0,.34,.34);cyl(g,yellow,0,1.79,0,.42,.16);box(g,yellow,0,1.74,.12,.45,.055,.32);
  const hand=grp(g,-.26,1.32,.05);rod(hand,0x335859,[0,0,0],[-.15,-.19,.23],.19);rod(hand,0xb98261,[-.15,-.19,.23],[0,-.14,.48],.14);
  rod(g,0x335859,[.27,1.33,0],[.44,.97,.15],.19);return {g,hand}});
 const targets=defs.map((d,i)=>d.ops.map(o=>{const g=grp(scene,i*SPAN+o.point[0],o.point[1],o.point[2]);if(o.kind==='bolt'){
  cyl(g,coal,0,-.038,0,.23,.06);cyl(g,0xcf9d51,0,.035,0,.195,.114,0,0,.45,'bolt');box(g,coal,0,.094,0,.106,.008,.026)
 }else if(o.kind==='weld')cyl(g,0xd58552,0,0,0,.12,.07,Math.PI/2);g.visible=false;return g}));
 const dragModels=defs.map((d,i)=>{const g=grp();if(i===1){rod(g,al,[0,0,-.8],[0,0,.8],.14);for(const z of [-.65,.65])cyl(g,steel,0,0,z,.4,.16,Math.PI/2)}else if(i===2)body(g,0x73908d);else wheel(g,0,.01);g.visible=false;return g});
 const arc=grp();for(let k=0;k<7;k++){const a=k*.897;rod(arc,k%2?0xffae43:0xfff5be,[0,0,0],[Math.cos(a)*.145,.085+(k%3)*.065,Math.sin(a)*.12],.017)}arc.visible=false;
 const tool=grp();cyl(tool,silver,0,.09,0,.067,.18);cyl(tool,coal,0,.22,0,.14,.13);box(tool,orange,0,.39,0,.2,.29,.26);box(tool,coal,0,.39,.19,.14,.15,.21);box(tool,steel,0,.39,.31,.2,.2,.1);tool.visible=false;
 for(const {p,g,m,ls} of batches.values()){const mesh=new T.InstancedMesh(g,m,ls.length);ls.forEach((v,j)=>mesh.setMatrixAt(j,v));mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();p.add(mesh)}
 const templates=rigs.map(r=>r.pallet);
 function retire(g){scene.remove(g);g.traverse(o=>{if(o.isInstancedMesh)o.dispose()})}
 const cache=new Map();
 function displayPart(p,game,sale=false){
  const stage=Math.min(p.at,3), prev=Math.max(0,p.at-1);
  const atDock=!sale&&p.at<4&&Math.abs(p.x-p.at*SPAN)<.01;
  // The preceding assembly stays on the pallet while the next fixture is loaded.
  const buildHere=atDock&&(stage===0||p.work.some(Boolean)||game.stations[stage].run);
  const model=buildHere?stage:prev, final=p.at===4||(!buildHere&&p.at>0);
  const key=(sale?'S':'P')+p.id;
  let obj=cache.get(key);
  if(!obj||obj.model!==model){if(obj)retire(obj.g);const g=templates[model].clone(true);g.visible=true;scene.add(g);obj={g,model,piece:g.children[0],seen:true};cache.set(key,obj)}
  obj.seen=true;obj.g.position.set(p.x,.96,sale?p.z:0);
  const layers=obj.piece.children.slice(0,2);
  const count=p.work.filter(v=>v>=1).length;
  layers.forEach((l,j)=>l.visible=final||(model===0?j===0||count>=4:model===2?p.work[0]>=1:p.work[j]>=1));
  // Carry the V8 into the axle jig rather than swapping it out for an empty chassis.
  if(model>=1&&!obj.engine){obj.engine=rigs[0].piece.clone(true);obj.engine.scale.setScalar(.48);obj.engine.position.set(-.36,.5,0);obj.piece.add(obj.engine)}
 }
 for(const r of rigs)r.pallet.visible=false;
 let yaw=0,pitch=0,joy=[0,0],previous='';const keys=new Set();
 function visit(i){const narrow=innerWidth/innerHeight<1;cam.position.set(i*SPAN-(narrow?.65:1.65),narrow?4.42:3.65,narrow?4.5:3.65);
  const d=new T.Vector3(i*SPAN,1.85,0).sub(cam.position);yaw=Math.atan2(-d.x,-d.z);pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));cam.rotation.set(pitch,yaw,0,'YXZ')}
 function resize(){renderer.setSize(container.clientWidth,container.clientHeight);cam.aspect=container.clientWidth/container.clientHeight;cam.updateProjectionMatrix();previous=''}resize();window.addEventListener('resize',resize);visit(0);
 function render(dt,game,playing,drag){
  const f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'))-joy[1],r=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+joy[0];
  const k=playing?Math.min(dt,.09)*(4.6+game.player.pace*.85)*(keys.has('ShiftLeft')?1.55:1)/Math.max(1,Math.hypot(f,r)):0;
  cam.position.x=clamp(cam.position.x+(-Math.sin(yaw)*f+Math.cos(yaw)*r)*k,-8,DISPATCH+1);cam.position.z=clamp(cam.position.z+(-Math.cos(yaw)*f-Math.sin(yaw)*r)*k,1.72,9.9);
  cam.rotation.set(pitch,yaw,0,'YXZ');cam.updateMatrixWorld();
  const sig=[cam.position.x,cam.position.y,cam.position.z,pitch,yaw,game.changed,...game.parts.flatMap(p=>[p.id,p.x,...p.work]),...game.sales.map(p=>p.z),...game.stations.map(s=>s.run?.j),drag?.x,drag?.y].join('/');
  if(previous===sig)return;
  for(const o of cache.values())o.seen=false;
  for(const p of game.parts)displayPart(p,game);for(const p of game.sales)displayPart(p,game,true);
  for(const [id,o] of cache)if(!o.seen){retire(o.g);cache.delete(id)}
  tool.visible=false;arc.visible=false;
  game.stations.forEach((s,i)=>{
   const p=game.dock(i),r=s.run,arm=arms[i],worker=workers[i],op=r&&defs[i].ops[r.j],progress=r?p.work[r.j]:0;
   const reach=r?Math.min(1,Math.sin(Math.PI*progress)*4):0;
   arm.arm.visible=s.robot;worker.g.visible=!!s.staff;worker.hand.rotation.x=r?.who==='worker'?-.55+.28*Math.sin(progress*12):0;
   if(s.robot){let t=r?.who==='robot'?reach:0,pt=op?.point||[0,2,0],tx=T.MathUtils.lerp(-.36,pt[0]-1.17,t),tz=T.MathUtils.lerp(.62,pt[2]+2.03,t),ty=T.MathUtils.lerp(1.72,pt[1]-.8,t),h=Math.hypot(tx,tz),L=clamp(Math.hypot(h,ty),.12,3.379);
    arm.swivel.rotation.y=Math.atan2(tx,tz);arm.shoulder.rotation.x=Math.atan2(h,ty)-Math.acos(clamp((L*L+1.74**2-1.64**2)/(2*L*1.74),-1,1));arm.elbow.rotation.x=Math.PI-Math.acos(clamp((1.74**2+1.64**2-L*L)/(2*1.74*1.64),-1,1))}
   targets[i].forEach((g,j)=>{const o=defs[i].ops[j];g.visible=!!p&&(o.kind==='bolt'||o.kind==='weld')&&(game.available(i,p).includes(j)||p.work[j]>0);if(g.visible){g.position.y=o.point[1]-.065*p.work[j];g.rotation.y=p.work[j]*Math.PI*5}});
   if(r&&r.who!=='robot'&&op.kind!=='fit'){tool.visible=true;tool.position.set(i*SPAN+op.point[0],op.point[1]+.10-.06*progress,op.point[2]);tool.rotation.set(.21,Math.sin(progress*36)*.05,-.3)}
   if(r&&op.kind==='weld'){arc.visible=true;arc.position.set(i*SPAN+op.point[0],op.point[1],op.point[2]);arc.rotation.y=progress*32;arc.scale.setScalar(.6+.5*Math.abs(Math.sin(progress*29)))}
   const obj=dragModels[i];obj.visible=op?.kind==='fit';if(obj.visible){const a=op.from,b=op.point;let t=progress;if(r.who==='player'&&drag)t=drag.fraction||0;obj.position.set(i*SPAN+a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t)}
  });
  if(renderer.render(scene,cam)!==false)previous=sig;
 }
 const v=new T.Vector3();
 function project(i,point){v.set(i*SPAN+point[0],point[1],point[2]).project(cam);return {x:(v.x+1)*container.clientWidth/2,y:(1-v.y)*container.clientHeight/2,visible:v.z>0&&v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1}}
 return {canvas:renderer.domElement,keys,visit,render,project,look(dx,dy){yaw-=dx*.004;pitch=clamp(pitch-dy*.0032,-1.25,1.04)},joystick(x,y){joy=[x,y]},nearest:()=>clamp(Math.round(cam.position.x/SPAN),0,3),far:i=>Math.hypot(cam.position.x-i*SPAN,cam.position.z)>6.3}
}
