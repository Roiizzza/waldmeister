import * as T from './vendor/three.module.js';
import {TYPES} from './logic.mjs';
import {SoftwareRenderer} from './software.mjs';
const C={orange:0xd9822d,light:0xf0b65f,steel:0x33464c,dark:0x1c2d34,teal:0x6de6d3,sand:0xc6a36c,red:0xd95b44};
export class World{
 constructor(canvas,quality='medium'){
 this.canvas=canvas;try{this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch{this.renderer=new SoftwareRenderer(canvas);console.info('Kompatibilitätsgrafik aktiv: WebGL nicht verfügbar.');}this.renderer.setClearColor(0xc6ac83);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
 this.scene=new T.Scene();this.scene.fog=new T.Fog(0xcab58f,48,105);this.camera=new T.PerspectiveCamera(43,1,.1,130);this.camera.position.set(5,24,27);this.camera.lookAt(0,0,-5);
 this.scene.add(new T.HemisphereLight(0xe1f5ff,0x806a43,2.25));this.sun=new T.DirectionalLight(0xffdfaa,3.4);this.sun.position.set(-14,28,8);this.sun.castShadow=true;Object.assign(this.sun.shadow.camera,{left:-22,right:22,top:28,bottom:-25,near:1,far:80});this.sun.shadow.bias=-.0004;this.sun.shadow.normalBias=.03;this.scene.add(this.sun);this.scene.add(this.sun.target);
 this.geo={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,10),sphere:new T.IcosahedronGeometry(1,0)};this.mats=new Map();this.effects=[];this.decor=[];this.wheels=[];this.guns=[];this.recoil=[];this.scroll=0;this.shake=0;
 this.terrain();this.player=new T.Group();this.scene.add(this.player);this.body=new T.Group();this.player.add(this.body);this.makeFortress();this.moduleGroup=new T.Group();this.body.add(this.moduleGroup);this.halo=this.ring(2.25,0x6ce8d5,.045);this.halo.rotation.x=-Math.PI/2;this.halo.position.y=.07;this.player.add(this.halo);this.halo.material.opacity=.35;
 this.shieldBubble=new T.Mesh(new T.SphereGeometry(2.9,20,12),new T.MeshBasicMaterial({color:0x84e8f6,transparent:true,opacity:.07,wireframe:true,depthWrite:false}));this.shieldBubble.scale.set(1,.7,1.1);this.shieldBubble.position.y=1.4;this.player.add(this.shieldBubble);this.shieldBubble.visible=false;
 this.setQuality(quality);this.resize();window.addEventListener('resize',()=>this.resize());
 }
 mat(color,metalness=.15,roughness=.7){const key=`${color}-${metalness}-${roughness}`;if(!this.mats.has(key))this.mats.set(key,new T.MeshStandardMaterial({color,metalness,roughness,flatShading:true}));return this.mats.get(key);}
 mesh(parent,shape,color,x,y,z,sx,sy,sz){const m=new T.Mesh(this.geo[shape],this.mat(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 box(p,c,x,y,z,sx,sy,sz){return this.mesh(p,'box',c,x,y,z,sx,sy,sz);}
 cyl(p,c,x,y,z,r,h){return this.mesh(p,'cylinder',c,x,y,z,r,h,r);}
 ring(radius,color,thickness=.05){return new T.Mesh(new T.RingGeometry(radius-thickness,radius,40),new T.MeshBasicMaterial({color,transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false}));}
 terrain(){
 const ground=this.box(this.scene,0xc0a16f,0,-.25,-25,180,.4,180);ground.userData.backdrop=-2;ground.receiveShadow=true;if(this.renderer.software)ground.geometry=new T.BoxGeometry(1,1,1,18,1,30);
 const road=this.box(this.scene,0x8b806a,0,-.025,-26,13,.15,140);road.userData.backdrop=-1;road.receiveShadow=true;if(this.renderer.software)road.geometry=new T.BoxGeometry(1,1,1,2,1,60);
 for(let x of [-6.7,6.7])this.box(this.scene,0xe3bd77,x,.02,-26,.13,.04,140);
 this.stripes=[];for(let i=0;i<24;i++){const s=this.box(this.scene,0xd4bd87,0,.06,12-i*5,.13,.015,1.8);s.castShadow=false;this.stripes.push(s);}
 this.trackMarks=[];for(let i=0;i<46;i++){const z=14-i*2.6;for(const x of [-1.65,1.65]){const m=this.box(this.scene,0x716c5a,x,.06,z,.48,.01,.16);m.castShadow=false;this.trackMarks.push(m);}}
 for(let i=0;i<65;i++){const g=new T.Group();const side=i%2?1:-1;g.position.set(side*(8+Math.random()*17),0,18-Math.random()*125);this.scene.add(g);this.decor.push(g);const q=Math.random();if(q<.45){const rock=this.mesh(g,'sphere',i%3?0x9c805c:0xb69060,0,.65,0,1.5+Math.random()*2,1+Math.random()*2,1.2+Math.random()*2);rock.rotation.y=Math.random()*6;}else if(q<.65){this.box(g,0x677171,0,1.15,0,2.8,2.3,4);for(let j=-1;j<=1;j++)this.box(g,0x394b50,1.42,1.1,j,.025,2.05,.06);this.box(g,0xb98640,0,2.38,0,2.9,.14,4.1);}else if(q<.8){this.cyl(g,0x6d7956,0,1.3,0,.32,2.6);this.cyl(g,0x6d7956,.6,1.2,0,.19,1.25);this.box(g,0x6d7956,.35,.8,0,.6,.32,.32);}else{this.box(g,0x524e40,0,2.2,0,.13,4.4,.13);this.box(g,0xd9b85d,0,3.5,0,1.3,.9,.1);this.box(g,0x5a5547,0,3.5,-.07,.85,.1,.04);}}
 // Towers and mesas on the distant horizon.
 for(let i=0;i<14;i++){let x=(i-7)*6;this.mesh(this.scene,'cylinder',0x987e5c,x,1.5,-73-Math.random()*10,2+Math.random()*3,3+Math.random()*7,3);}
 this.gate=new T.Group();this.gate.position.set(0,0,-22);this.scene.add(this.gate);for(const x of [-6.1,6.1]){this.box(this.gate,0x455255,x,2,0,.65,4,.65);this.box(this.gate,0xe5a44b,x,4.15,0,.9,.35,.9);}this.gateBeam=this.box(this.gate,0xd5a64d,0,2.1,0,11.5,.42,.35);for(let i=-5;i<=5;i++)this.box(this.gate,0x283a41,i,2.1,-.2,.48,.44,.04);this.gate.visible=false;
 }
 makeFortress(){const p=this.body;
 for(let x of [-1.8,1.8]){this.box(p,C.dark,x,.55,0,.85,.85,4.5);this.box(p,0x54605d,x,.88,0,.95,.28,4.7);for(let z=-1.7;z<=1.8;z+=.67){const wheel=this.cyl(p,0x384347,x,.53,z,.34,.16);wheel.rotation.z=Math.PI/2;this.wheels.push(wheel);this.box(p,0x788079,x,.99,z,1,.08,.25);}this.box(p,C.orange,x,1.12,-1.7,1,.45,.9);this.box(p,C.orange,x,1.12,1.7,1,.45,.9);}
 this.box(p,0x48524b,0,1,0,3.35,.85,4.8);this.box(p,C.orange,0,1.43,0,3.2,.35,4.4);this.box(p,0xe3ae59,0,1.64,0,2.94,.12,4.08);
 for(let z of [-2.22,2.22]){this.box(p,C.steel,0,1.3,z,3.1,.45,.24);for(let x of [-1.2,1.2])this.box(p,0xd6ebca,x,1.4,z-.15,.4,.2,.09);}
 for(let x=-1;x<=1;x++)for(let z=0;z<4;z++){const a=this.box(p,0x98764c,x*.9,1.72,(z-1.5)*.94,.81,.045,.84);for(let dx of [-.32,.32])this.cyl(p,0x5c655c,x*.9+dx,1.76,(z-1.5)*.94-.3,.035,.03);}
 this.box(p,C.orange,0,.68,2.55,1.4,.55,.8);this.box(p,C.dark,0,1.06,2.54,1.18,.35,.64);this.box(p,C.teal,0,1.08,2.88,.81,.17,.03);
 this.cyl(p,C.dark,-1.4,1.9,1.9,.1,.7);this.cyl(p,C.steel,-1.4,2.2,1.9,.07,.15);this.box(p,C.dark,1.37,2.05,1.85,.05,.8,.05);this.box(p,C.orange,1.7,2.3,1.85,.65,.32,.025);
 }
 modules(list){this.moduleGroup.clear();this.guns=[];for(let i=0;i<list.length;i++){const m=list[i];if(!m)continue;const type=m.type,c=TYPES[type].color;const g=new T.Group();g.position.set((i%3-1)*.9,1.78,(Math.floor(i/3)-1.5)*.94);this.moduleGroup.add(g);this.box(g,C.steel,0,.12,0,.74,.2,.74);
 if(TYPES[type].damage){const pivot=new T.Group();pivot.position.y=.29;g.add(pivot);this.cyl(pivot,C.dark,0,0,0,.28,.24);this.box(pivot,c,0,.23,0,.65,.43,.58);if(type==='cannon'){const barrel=this.cyl(pivot,C.steel,0,.24,-.62,.11,.95);barrel.rotation.x=Math.PI/2;this.box(pivot,0xd5d8be,0,.24,-1.09,.27,.25,.15);}if(type==='gatling'){for(let a=0;a<3;a++){const barrel=this.cyl(pivot,C.dark,(a-1)*.12,.23,-.55,.06,.75);barrel.rotation.x=Math.PI/2;}this.box(pivot,c,.37,.13,0,.16,.28,.46);}if(type==='rocket'){for(let x of [-.17,.17])for(let y of [.12,.36]){this.box(pivot,C.dark,x,y,-.2,.2,.18,.65);this.box(pivot,0xeaa16a,x,y,-.54,.13,.1,.03);}}if(type==='tesla'){this.cyl(pivot,C.dark,0,.45,0,.09,.75);for(let y of [.25,.46,.67])this.cyl(pivot,0x81d8ee,0,y,0,.26,.06);this.mesh(pivot,'sphere',0xaeefff,0,.86,0,.17,.17,.17);}this.guns.push({index:i,pivot,type});
 }else if(type==='reactor'){this.box(g,0x344c50,0,.37,0,.6,.66,.62);for(let z of [-.22,0,.22])this.box(g,C.teal,0,.73,z,.44,.045,.08);this.cyl(g,0xe4ac4a,.33,.39,0,.07,.5);}else{this.cyl(g,C.steel,0,.21,0,.3,.22);this.cyl(g,0x70d9ee,0,.52,0,.16,.46);const r=this.ring(.35,0x8de9e7,.045);r.rotation.x=Math.PI/2;r.position.y=.6;g.add(r);}
 for(let l=1;l<m.level;l++)this.box(g,0xffd17f,-.28+(l-1)*.18,.28,.39,.11,.08,.03);
 }}
 enemy(type,x,z,elite=false){const g=new T.Group();g.position.set(x,0,z);this.scene.add(g);const c=elite?0xba8d43:type==='drone'?0x737c80:type==='tank'?0x824b3e:0x8b7766;const rig=new T.Group();g.add(rig);const boss=type==='boss';const scale=boss?2.7:type==='tank'?1.25:.85;rig.scale.setScalar(scale);
 if(type==='drone'){this.mesh(rig,'sphere',c,0,1.7,0,.7,.4,.7);for(let x of [-.95,.95]){this.box(rig,C.steel,x,1.65,0,.75,.12,.25);this.cyl(rig,C.dark,x,1.73,0,.45,.08);}this.box(rig,C.red,0,1.65,.57,.38,.16,.08);}else{this.box(rig,c,0,.6,0,1.4,.8,1.8);for(let x of [-.8,.8]){this.box(rig,C.dark,x,.3,0,.42,.5,1.9);for(let z of [-.65,0,.65]){const w=this.cyl(rig,0x4f5652,x,.35,z,.22,.17);w.rotation.z=Math.PI/2;}}this.box(rig,C.dark,0,1.05,0,1.1,.5,1.2);this.box(rig,C.red,0,1.05,.63,.7,.14,.03);const b=this.cyl(rig,C.steel,0,1.1,.95,.13,1);b.rotation.x=Math.PI/2;if(boss){this.box(rig,0xdd9d42,0,1.35,0,1.4,.1,1.4);for(let x of [-.65,.65])this.cyl(rig,C.dark,x,1.6,-.45,.13,.8);}}
 const bar=new T.Group();bar.position.y=boss?5.6:type==='drone'?2.5:2;bar.rotation.x=-Math.PI/4;g.add(bar);this.box(bar,0x26343b,0,0,0,boss?2.5:1.1,.13,.05);const hp=this.box(bar,0xeb7354,0,0,.04,boss?2.4:1,.07,.04);return {group:g,rig,bar:hp,boss};
 }
 projectile(x,y,z,color=0xffdd8f,size=.13){const m=new T.Mesh(this.geo.sphere,new T.MeshBasicMaterial({color}));m.scale.setScalar(size);m.position.set(x,y,z);this.scene.add(m);return m;}
 remove(m){if(!m)return;this.scene.remove(m);}
 burst(x,y,z,color=0xffb24e,count=10,force=4){for(let i=0;i<count&&this.effects.length<180;i++){const mesh=this.projectile(x,y,z,color,.06+Math.random()*.13);this.effects.push({mesh,v:new T.Vector3((Math.random()-.5)*force,Math.random()*force,(Math.random()-.5)*force),ttl:.4+Math.random()*.4,max:.8});}}
 lightning(a,b){const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(a.x,a.y,a.z),new T.Vector3((a.x+b.x)/2+.4,(a.y+b.y)/2+.3,(a.z+b.z)/2),new T.Vector3(b.x,b.y,b.z)]);const m=new T.Line(geo,new T.LineBasicMaterial({color:0x9defff}));this.scene.add(m);this.effects.push({mesh:m,ttl:.13,max:.13,line:true});}
 telegraph(x,z,r=2){const m=this.ring(r,0xff4e32,.11);m.rotation.x=-Math.PI/2;m.position.set(x,.09,z);this.scene.add(m);const fill=new T.Mesh(new T.CircleGeometry(r,32),new T.MeshBasicMaterial({color:0xf85c30,transparent:true,opacity:.18,depthWrite:false}));m.add(fill);return m;}
 setQuality(q){this.quality=q;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,q==='low'?1:1.75));this.renderer.shadowMap.enabled=q!=='low';this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.sun.shadow.mapSize.set(q==='high'?2048:1024,q==='high'?2048:1024);this.resize();}
 resize(){const r=this.canvas.parentElement.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();}
 update(dt,{x=0,z=4,moving=false,travel=0,shield=0,hero=false,build=false,time=0}={}){
 this.player.position.set(x,.06+Math.sin(time*5)*.025,z);this.body.rotation.z=T.MathUtils.lerp(this.body.rotation.z,moving?-.025*Math.sin(time*3):0,.1);this.shieldBubble.visible=shield>0;this.shieldBubble.rotation.y=time*.2;this.halo.rotation.z=time*.1;
 const speed=travel;this.scroll+=speed*dt;for(const s of this.stripes){s.position.z+=speed*dt;if(s.position.z>18)s.position.z-=120;}for(const s of this.trackMarks){s.position.z+=speed*dt;if(s.position.z>18)s.position.z-=119.6;}for(const g of this.decor){g.position.z+=speed*dt;if(g.position.z>24)g.position.z-=125;}
 if(moving)for(const w of this.wheels)w.rotation.x-=dt*8;
 const targetPos=hero?new T.Vector3(7,10.5,15):build?new T.Vector3(0,20,20):new T.Vector3(3,25,29);const look=hero?new T.Vector3(0,.7,4):build?new T.Vector3(0,0,8):new T.Vector3(0,0,-5);this.camera.position.lerp(targetPos,Math.min(1,dt*3));this.camera.lookAt(look);this.shake=Math.max(0,this.shake-dt*3);if(this.shake>0){this.camera.position.x+=(Math.random()-.5)*this.shake*.4;this.camera.position.y+=(Math.random()-.5)*this.shake*.3;}
 for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i];e.ttl-=dt;if(e.ttl<=0){this.remove(e.mesh);if(e.line)e.mesh.geometry.dispose();e.mesh.material.dispose();this.effects.splice(i,1);continue;}if(!e.line){e.mesh.position.addScaledVector(e.v,dt);e.v.y-=dt*9;e.mesh.scale.multiplyScalar(1-dt*.8);}}
 this.renderer.render(this.scene,this.camera);
 }
}
