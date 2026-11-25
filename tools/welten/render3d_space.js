/* ===== 3D-Darstellung: Weltraum-Gewächshaus (three.js r128) ===== */
const R3={};const ART={cust:new Array(6)};
(function(){const o=THREE.Color.prototype.setStyle;THREE.Color.prototype.setStyle=function(v){o.call(this,v);return this.convertSRGBToLinear();};})();
const SPR={};
const ICON={};
let SC_DUMMY=0;
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(1.75,window.devicePixelRatio||1));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#03040c');
const camera=new THREE.PerspectiveCamera(40,W/H,.5,900);
window.__rs3d=()=>{renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();};
window.__rs3d();

/* ---------- Grundbausteine ---------- */
const MC={},GC={};
function mat(color,o){const k=color+'|'+JSON.stringify(o||{});if(MC[k])return MC[k];return MC[k]=new THREE.MeshStandardMaterial(Object.assign({color,roughness:.5,metalness:.05,envMapIntensity:.4},o||{}));}
const glowMat=(c,ei)=>mat(c,{emissive:c,emissiveIntensity:ei===undefined?1:ei,roughness:.35});
const geo=(k,f)=>GC[k]||(GC[k]=f());
function capsuleGeo(r,len,seg){const pts=[],n=8;for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI/2;pts.push(new THREE.Vector2(Math.max(1e-4,Math.cos(a)*r),Math.sin(a)*r-len/2));}for(let i=0;i<=n;i++){const a=i/n*Math.PI/2;pts.push(new THREE.Vector2(Math.max(1e-4,Math.cos(a)*r),Math.sin(a)*r+len/2));}return new THREE.LatheGeometry(pts,seg||18);}
function rbox(w,h,d,r){r=Math.min(r,w/2-.002,h/2-.002,d/2-.002);const s=new THREE.Shape(),x=-(w/2-r),y=-(h/2-r),ww=w-2*r,hh=h-2*r;s.moveTo(x,y);s.lineTo(x+ww,y);s.lineTo(x+ww,y+hh);s.lineTo(x,y+hh);s.lineTo(x,y);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.002,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1,curveSegments:3});g.translate(0,0,-(d-2*r)/2);return g;}
const sph=(r,w,h)=>geo('s'+r+'_'+(w||20),()=>new THREE.SphereGeometry(r,w||20,h||14));
const hemi=(r)=>geo('h'+r,()=>new THREE.SphereGeometry(r,26,12,0,Math.PI*2,0,Math.PI/2));
const cyl=(a,b,h,s)=>geo('c'+[a,b,h,s],()=>new THREE.CylinderGeometry(a,b,h,s||20));
const cap=(r,l)=>geo('k'+r+'_'+l,()=>capsuleGeo(r,l));
const box=(w,h,d,r)=>geo('b'+[w,h,d,r],()=>rbox(w,h,d,r||.04));
const tor=(R,r,arc)=>geo('t'+[R,r,arc],()=>new THREE.TorusGeometry(R,r,12,40,arc||Math.PI*2));
const cone=(r,h,s)=>geo('n'+[r,h,s],()=>new THREE.ConeGeometry(r,h,s||16));
function ms(g,m,x,y,z,p,sx,sy,sz){const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);if(sx!==undefined)o.scale.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz);o.castShadow=true;o.receiveShadow=true;if(p)p.add(o);return o;}
function tube(pts,r,m,p){const c=new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(q[0],q[1],q[2])));return ms(new THREE.TubeGeometry(c,24,r,8,false),m,0,0,0,p);}
function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function ctex(c){const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
const GLOW=(()=>{const c=cnv(128,128),g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.22,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
function halo(color,size,op){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color,transparent:true,opacity:op===undefined?.8:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.set(size,size,1);return s;}
function eyeM(p,x,y,z,r,yaw){const g=new THREE.Group();g.position.set(x,y,z);if(yaw)g.rotation.y=yaw;p.add(g);ms(sph(r,18,14),mat('#ffffff',{roughness:.15}),0,0,0,g);ms(sph(r*.6,16,12),mat('#141428',{roughness:.1}),0,0,r*.5,g);ms(sph(r*.2,8,6),mat('#ffffff',{emissive:'#ffffff',emissiveIntensity:1.5}),r*.2,r*.24,r*.95,g);return g;}
function smile(p,x,y,z,r,col){const m=ms(tor(r,r*.18,Math.PI),mat(col||'#2a1430',{roughness:.4}),x,y,z,p);m.rotation.z=Math.PI;return m;}
const rnd=(()=>{let s=12345;return()=>(s=(s*16807)%2147483647)/2147483647;})();

/* ---------- Umgebungslicht (Reflexionen) ---------- */
(function(){const pm=new THREE.PMREMGenerator(renderer);const es=new THREE.Scene();
  const g=new THREE.SphereGeometry(50,32,16),pos=g.attributes.position,col=[];const top=new THREE.Color('#9fb4e0'),mid=new THREE.Color('#2c3868'),bot=new THREE.Color('#0a0818'),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)/50;if(y>0)c.copy(mid).lerp(top,y);else c.copy(mid).lerp(bot,-y);col.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));es.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  for(const[x,y,z,cc]of[[20,30,10,'#c8d4e8'],[-25,15,-20,'#5fa8c8'],[0,10,35,'#a888b8']]){const m=new THREE.Mesh(new THREE.PlaneGeometry(18,10),new THREE.MeshBasicMaterial({color:cc,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m);}
  scene.environment=pm.fromScene(es,.03).texture;pm.dispose();})();

/* ---------- Licht ---------- */
scene.add(new THREE.HemisphereLight('#9fb8ff','#2a1a4a',.42));
const sun=new THREE.DirectionalLight('#fff0dc',1.3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:1,far:70});sun.shadow.bias=-.0006;sun.shadow.normalBias=.02;
scene.add(sun);scene.add(sun.target);
const rim=new THREE.DirectionalLight('#8a7bff',.45);rim.position.set(-20,12,-25);scene.add(rim);

/* ---------- Gegenstände ---------- */
function stripeTex(c1,c2,n){const c=cnv(256,128),g=c.getContext('2d');g.fillStyle=c1;g.fillRect(0,0,256,128);g.fillStyle=c2;for(let i=0;i<n;i++){const x=i*256/n;g.beginPath();g.moveTo(x,0);for(let y=0;y<=128;y+=8)g.lineTo(x+7+Math.sin(y*.12+i)*4,y);for(let y=128;y>=0;y-=8)g.lineTo(x-7+Math.sin(y*.12+i)*4,y);g.fill();}return ctex(c);}
const MELON_T=stripeTex('#c9b8ff','#6a3ad8',8);
const MELON_M=new THREE.MeshStandardMaterial({envMapIntensity:.4,map:MELON_T,emissiveMap:MELON_T,emissive:'#7a4aff',emissiveIntensity:.3,roughness:.3});
const GLASS=new THREE.MeshStandardMaterial({envMapIntensity:.8,color:'#d8f6ff',transparent:true,opacity:.28,roughness:.04,metalness:.1,depthWrite:false,envMapIntensity:1.6});
const ITEM={};
ITEM.a=()=>{const g=new THREE.Group(),m=mat('#2aa8ff',{emissive:'#1a7aff',emissiveIntensity:.5,roughness:.22});
  [[0,0,0],[.1,-.02,.06],[-.1,-.02,.05],[.03,-.03,-.1],[-.06,.1,-.04],[.07,.1,.03],[0,.19,0]].forEach(p=>ms(sph(.08,14,10),m,p[0],p[1]+.04,p[2],g));
  const lf=mat('#62e89a',{emissive:'#1b7a48',emissiveIntensity:.3,roughness:.4});
  for(let i=0;i<3;i++){const l=ms(sph(.1,12,8),lf,Math.sin(i*2.1)*.07,.31,Math.cos(i*2.1)*.07,g,.45,.12,1.1);l.rotation.order='YXZ';l.rotation.y=i*2.1;l.rotation.x=-.5;}
  ms(cyl(.012,.012,.08,6),mat('#3f9a6a'),0,.27,0,g);return g;};
ITEM.b=()=>{const g=new THREE.Group();ms(sph(.2,24,18),MELON_M,0,.18,0,g,1,.88,1.18);
  ms(cyl(.02,.03,.08,8),mat('#4aa86a'),0,.37,0,g);const t=ms(tor(.05,.012,Math.PI*1.4),mat('#62e89a'),.05,.4,0,g);t.rotation.y=1;
  ms(sph(.05,10,8),mat('#ffffff',{emissive:'#ffffff',emissiveIntensity:.5,transparent:true,opacity:.5}),-.08,.28,.14,g,1,.6,.4);return g;};
ITEM.c=()=>{const g=new THREE.Group(),pm=mat('#ff3fb8',{emissive:'#ff1f90',emissiveIntensity:.4,roughness:.3}),pi=mat('#ff9ae0',{emissive:'#ff5ac0',emissiveIntensity:.35,roughness:.3});
  ms(cone(.08,.12,12),mat('#3fa86a'),0,.04,0,g).rotation.x=Math.PI;
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,p=ms(sph(.1,14,10),pm,Math.sin(a)*.1,.12,Math.cos(a)*.1,g,.55,.16,1.4);p.rotation.order='YXZ';p.rotation.y=a;p.rotation.x=-.75;}
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.3,p=ms(sph(.07,12,8),pi,Math.sin(a)*.05,.16,Math.cos(a)*.05,g,.6,.18,1.3);p.rotation.order='YXZ';p.rotation.y=a;p.rotation.x=-1.15;}
  ms(sph(.05,12,10),glowMat('#fff27a',1.3),0,.17,0,g);
  for(let i=0;i<5;i++){const a=i/5*6.283;ms(sph(.018,6,6),glowMat('#fffbd0',1.5),Math.sin(a)*.05,.24,Math.cos(a)*.05,g);}return g;};
function shroom(s,col){const g=new THREE.Group();ms(cyl(.045*s,.065*s,.22*s,14),mat('#eaf6f2',{roughness:.6}),0,.11*s,0,g);
  const c=ms(hemi(.16),mat(col,{emissive:col,emissiveIntensity:.32,roughness:.3}),0,.2*s,0,g,s,s*.72,s);
  ms(cyl(.155*s,.12*s,.03*s,20),mat('#1d5a5a',{emissive:'#1aa',emissiveIntensity:.3}),0,.2*s,0,g);
  for(let i=0;i<6;i++){const a=i/6*6.283+.4,th=i%2?.55:.95;ms(sph(.022*s,8,6),glowMat('#e8fffa',1.6),Math.sin(th)*Math.cos(a)*.155*s,.2*s+Math.cos(th)*.115*s,Math.sin(th)*Math.sin(a)*.155*s,g);}
  ms(sph(.03*s,8,6),glowMat('#e8fffa',1.6),0,.2*s+.115*s,0,g);return g;}
ITEM.d=()=>shroom(1.2,'#2ee6d0');
ITEM.e=()=>{const g=new THREE.Group(),met=mat('#c8d2e0',{metalness:.9,roughness:.22});
  ms(cap(.11,.2),GLASS,0,.22,0,g);const liq=ms(cap(.08,.14),glowMat('#5ae84a',.6),0,.2,0,g);liq.castShadow=false;
  ms(cyl(.1,.1,.06,20),met,0,.04,0,g);ms(cyl(.1,.1,.06,20),met,0,.41,0,g);ms(cyl(.03,.03,.05,10),glowMat('#7dff6a',1.4),0,.46,0,g);
  for(const p of[[.03,.15],[-.03,.24],[.02,.3]])ms(sph(.018,8,6),mat('#ffffff',{emissive:'#fff',emissiveIntensity:.6}),p[0],p[1],.06,g);return g;};
ITEM.cash=()=>{const g=new THREE.Group();ms(cyl(.15,.15,.05,6),mat('#53e2ff',{metalness:.75,roughness:.18,emissive:'#1688b0',emissiveIntensity:.45}),0,.025,0,g);
  ms(cyl(.09,.09,.06,6),mat('#e6fbff',{metalness:.5,roughness:.2,emissive:'#7fe8ff',emissiveIntensity:.5}),0,.03,0,g);return g;};

/* Pool für Gegenstände */
const POOL={};
function takeItem(t){const p=POOL[t]||(POOL[t]=[]);const o=p.pop()||ITEM[t]();o.visible=true;o.scale.setScalar(1);o.rotation.set(0,0,0);scene.add(o);return o;}
function giveItem(t,o){if(o.parent)o.parent.remove(o);(POOL[t]||(POOL[t]=[])).push(o);}

/* ---------- Pflanzen ---------- */
const NODE={};
const leafM=mat('#55d68a',{emissive:'#1a6a40',emissiveIntensity:.25,roughness:.45});
function leaf(p,x,y,z,yaw,tilt,s){const l=ms(sph(.12,12,8),leafM,x,y,z,p,.5*s,.1*s,1.25*s);l.rotation.order='YXZ';l.rotation.y=yaw;l.rotation.x=tilt;return l;}
NODE.a=()=>{const g=new THREE.Group();tube([[0,0,0],[.05,.18,.02],[-.03,.36,0]],.03,mat('#3f9a6a'),g);
  for(let i=0;i<4;i++){const a=i/4*6.283+.3;leaf(g,Math.sin(a)*.14,.08,Math.cos(a)*.14,a,-.35,1);}
  const f=ITEM.a();f.position.y=.38;g.add(f);return{g,f,fy:.38};};
NODE.b=()=>{const g=new THREE.Group();for(let i=0;i<3;i++){const a=i/3*6.283;leaf(g,Math.sin(a)*.22,.03,Math.cos(a)*.22,a,-.08,1.6);}
  const t=ms(tor(.16,.015,Math.PI*1.5),mat('#62e89a'),0,.05,0,g);t.rotation.x=Math.PI/2;
  const f=ITEM.b();f.position.set(.02,0,.02);g.add(f);return{g,f,fy:0};};
NODE.c=()=>{const g=new THREE.Group();ms(cyl(.022,.03,.55,8),mat('#3f9a6a'),0,.27,0,g);leaf(g,.08,.22,0,1.57,-.6,.8);leaf(g,-.08,.32,0,-1.57,-.6,.75);
  const f=ITEM.c();f.position.y=.52;f.scale.setScalar(1.25);g.add(f);return{g,f,fy:.52,fs:1.25};};
NODE.d=()=>{const g=new THREE.Group();ms(sph(.3,16,10),mat('#2f5a50',{roughness:.9}),0,0,0,g,1,.28,1);
  const f=new THREE.Group();const a=shroom(1.1,'#2ee6d0');f.add(a);const b=shroom(.75,'#7ab8ff');b.position.set(.17,0,.08);f.add(b);const c=shroom(.6,'#c48aff');c.position.set(-.15,0,.1);f.add(c);g.add(f);return{g,f,fy:.02};};

/* ---------- Figuren ---------- */
const SUIT=mat('#f3f6fb',{roughness:.42}),ORG=mat('#ff8a2a',{roughness:.45}),GRY=mat('#8e9aac',{metalness:.65,roughness:.3});
function visorGeo(r){return geo('v'+r,()=>new THREE.SphereGeometry(r,28,16,Math.PI/2-1.0,2.0,Math.PI*.27,Math.PI*.4));}
function mkAstro(){const root=new THREE.Group(),body=new THREE.Group();root.add(body);const hips=[],arms=[],jets=[];
  for(const s of[-1,1]){const h=new THREE.Group();h.position.set(s*.13,.52,0);body.add(h);ms(cap(.11,.2),SUIT,0,-.18,0,h);ms(sph(.06,10,8),ORG,0,-.17,.09,h);ms(box(.23,.14,.32,.06),GRY,0,-.43,.04,h);hips.push(h);}
  ms(cap(.27,.2),SUIT,0,.86,0,body,1,1,.86);ms(cyl(.28,.28,.09,24),ORG,0,.64,0,body,1,1,.86);
  ms(box(.28,.2,.06,.03),GRY,0,.9,.21,body);[['#ff4f6a',-.08],['#6fff8a',0],['#4fd8ff',.08]].forEach(q=>ms(sph(.026,8,6),glowMat(q[0],1.4),q[1],.9,.25,body));
  for(const s of[-1,1]){const a=new THREE.Group();a.position.set(s*.33,1.0,0);body.add(a);ms(cap(.085,.24),SUIT,0,-.17,0,a);ms(sph(.075,10,8),ORG,0,-.08,0,a);ms(sph(.1,12,10),ORG,0,-.38,0,a);a.rotation.z=s*.12;arms.push(a);}
  ms(box(.46,.52,.24,.07),SUIT,0,.94,-.3,body);ms(box(.48,.06,.26,.02),ORG,0,1.06,-.3,body);ms(box(.48,.06,.26,.02),ORG,0,.82,-.3,body);
  for(const s of[-1,1]){ms(cyl(.06,.085,.14,14),GRY,s*.12,.63,-.3,body);const j=halo('#6fe8ff',.5,.5);j.position.set(s*.12,.5,-.32);body.add(j);jets.push(j);}
  const col=ms(tor(.2,.065),ORG,0,1.1,0,body);col.rotation.x=Math.PI/2;
  ms(sph(.32,30,22),SUIT,0,1.37,0,body);
  ms(visorGeo(.325),mat('#2b6fe0',{metalness:.95,roughness:.07,envMapIntensity:1.4}),0,1.37,0,body);
  ms(sph(.05,10,8),mat('#ffffff',{emissive:'#ffffff',emissiveIntensity:1.2,transparent:true,opacity:.85}),-.1,1.46,.27,body,1.4,.6,.3).castShadow=false;
  for(const s of[-1,1])ms(cyl(.07,.07,.06,16),GRY,s*.31,1.37,0,body).rotation.z=Math.PI/2;
  ms(cyl(.012,.012,.28,6),GRY,.17,1.68,-.06,body);ms(sph(.035,10,8),glowMat('#ff4f6a',1.5),.17,1.83,-.06,body);
  return{root,body,hips,arms,jets};}

function mkDrone(){const root=new THREE.Group(),b=new THREE.Group();root.add(b);const rotors=[];
  ms(sph(.27,24,18),mat('#ff9a3a',{roughness:.3,metalness:.2}),0,0,0,b,1,.82,1);ms(hemi(.272),mat('#f4f6fa',{roughness:.3,metalness:.2}),0,0,0,b,1,.82,1);
  const band=ms(tor(.265,.03),glowMat('#2ee6ff',1.1),0,0,0,b);band.rotation.x=Math.PI/2;
  ms(sph(.2,20,14),mat('#111827',{roughness:.08,metalness:.4}),0,.03,.11,b,1,.75,.62);
  for(const s of[-1,1])ms(sph(.04,10,8),glowMat('#6ff6ff',2),s*.07,.05,.24,b,1,1.2,.5);
  for(let i=0;i<4;i++){const a=i/4*6.283+.785,x=Math.sin(a)*.36,z=Math.cos(a)*.36;const arm=ms(cyl(.018,.018,.32,6),GRY,x/2,.06,z/2,b);arm.rotation.order='YXZ';arm.rotation.y=a;arm.rotation.x=Math.PI/2;
    ms(cyl(.04,.04,.06,10),GRY,x,.08,z,b);const r=ms(cyl(.16,.16,.008,22),mat('#ffffff',{transparent:true,opacity:.32,roughness:.2}),x,.12,z,b);r.castShadow=false;rotors.push(r);}
  for(const s of[-1,1]){const c=ms(box(.04,.14,.04,.015),GRY,s*.06,-.26,0,b);c.rotation.z=s*.3;}
  const h=halo('#5fe8ff',.7,.45);h.position.y=-.3;b.add(h);return{root,b,rotors};}

function mkChefBot(){const root=new THREE.Group(),b=new THREE.Group();root.add(b);
  ms(box(.9,.22,.62,.08),mat('#2a3242',{roughness:.6}),0,.13,0,b);for(const s of[-1,1])for(const z of[-.2,0,.2])ms(cyl(.09,.09,.08,14),GRY,s*.46,.12,z,b).rotation.z=Math.PI/2;
  ms(box(.72,.66,.5,.14),mat('#ffffff',{roughness:.35,metalness:.15}),0,.6,0,b);ms(box(.74,.08,.52,.03),ORG,0,.5,0,b);
  ms(box(.3,.18,.04,.03),mat('#111827',{roughness:.1}),0,.7,.26,b);[['#6fff8a',-.07],['#ffd36a',0],['#ff4f6a',.07]].forEach(q=>ms(sph(.022,8,6),glowMat(q[0],1.6),q[1],.7,.29,b));
  const arm=ms(cap(.07,.3),SUIT,.44,.6,.08,b);arm.rotation.z=.4;arm.rotation.x=-.6;const clip=ms(box(.26,.34,.03,.02),mat('#ffd36a'),.38,.62,.36,b);clip.rotation.x=-.5;
  ms(box(.2,.24,.01,.01),mat('#ffffff'),.38,.63,.38,b).rotation.x=-.5;
  ms(cap(.07,.3),SUIT,-.44,.58,0,b).rotation.z=-.3;
  ms(cyl(.08,.1,.12,14),GRY,0,.98,0,b);
  const head=new THREE.Group();head.position.y=1.24;b.add(head);
  ms(box(.6,.44,.46,.14),mat('#ffffff',{roughness:.35,metalness:.15}),0,0,0,head);ms(box(.48,.28,.04,.06),mat('#0d1424',{roughness:.06,metalness:.3}),0,0,.22,head);
  for(const s of[-1,1]){ms(box(.08,.1,.02,.02),glowMat('#4fe8ff',2),s*.11,.02,.25,head);const br=ms(box(.12,.025,.02,.008),glowMat('#4fe8ff',2),s*.11,.1,.25,head);br.rotation.z=-s*.25;}
  smile(head,0,-.07,.245,.06,'#4fe8ff').material=glowMat('#4fe8ff',2);
  ms(cyl(.3,.32,.16,24),mat('#1e3a6a',{roughness:.4}),0,.28,0,head);ms(box(.5,.04,.2,.02),mat('#152a50'),0,.21,.24,head);ms(sph(.05,10,8),mat('#ffd36a',{metalness:.8,roughness:.2}),0,.3,.3,head);
  return{root,b,head};}

function mkWaterBot(){const root=new THREE.Group(),b=new THREE.Group();root.add(b);
  ms(cyl(.36,.3,.16,24),mat('#e8edf5',{metalness:.3,roughness:.35}),0,.32,0,b);const ring=ms(tor(.34,.03),glowMat('#4fa8ff',1.2),0,.3,0,b);ring.rotation.x=Math.PI/2;
  const h=halo('#5fb0ff',.9,.5);h.position.y=.15;b.add(h);
  ms(cyl(.22,.22,.5,24),GLASS,0,.66,0,b);const liq=ms(cyl(.19,.19,.36,20),glowMat('#3fa8ff',.7),0,.6,0,b);liq.castShadow=false;
  ms(cyl(.25,.25,.05,24),GRY,0,.42,0,b);ms(cyl(.25,.25,.05,24),GRY,0,.92,0,b);
  ms(hemi(.22),mat('#ffffff',{roughness:.3}),0,.94,0,b);eyeM(b,0,1.06,.16,.08);
  const noz=ms(cyl(.03,.03,.4,8),GRY,.3,.8,.12,b);noz.rotation.z=-.9;ms(cone(.06,.1,10),ORG,.47,.92,.12,b).rotation.z=-.9;
  return{root,b};}

/* Außerirdische Kunden (Gesicht nach +z) */
function blob(){const g=new THREE.Group(),m=mat('#5ee048',{roughness:.3,emissive:'#1a5a10',emissiveIntensity:.25});
  ms(sph(.42,28,20),m,0,.42,0,g,1,.9,1);for(const s of[-1,1])ms(sph(.1,12,8),m,s*.2,.06,.08,g,1,.5,1.3);
  eyeM(g,0,.6,.3,.17);smile(g,0,.36,.37,.08);
  for(const s of[-1,1]){const a=ms(cyl(.015,.015,.32,6),mat('#5ac04a'),s*.14,.88,0,g);a.rotation.z=-s*.35;ms(sph(.055,12,8),glowMat('#fff27a',1.5),s*.2,1.02,0,g);}
  ms(sph(.03,8,6),mat('#ff7aa0',{emissive:'#ff7aa0',emissiveIntensity:.3}),.24,.46,.32,g,1.6,1,.5);ms(sph(.03,8,6),mat('#ff7aa0',{emissive:'#ff7aa0',emissiveIntensity:.3}),-.24,.46,.32,g,1.6,1,.5);return g;}
function trio(){const g=new THREE.Group(),m=mat('#9a5af0',{roughness:.35});
  ms(cap(.3,.32),m,0,.62,0,g);for(const s of[-1,1])ms(cap(.07,.2),m,s*.33,.6,0,g).rotation.z=s*.5;
  for(const s of[-1,1])ms(sph(.1,12,8),m,s*.14,.08,0,g,1,.55,1.3);
  for(const[x,h]of[[-.16,.32],[0,.42],[.16,.32]]){const st=ms(cyl(.02,.025,h,6),m,x,1.02+h/2-.1,0,g);st.rotation.z=-x*1.2;eyeM(g,x*1.6,1.02+h-.05,.02,.1);}
  smile(g,0,.62,.29,.09);for(const p of[[.18,.45],[-.2,.8],[.12,.9]])ms(sph(.04,8,6),mat('#d0a8ff'),p[0],p[1],.27,g,1,1,.4);return g;}
function robo(){const g=new THREE.Group(),y=mat('#ffcf3d',{metalness:.35,roughness:.3}),t=mat('#2ec4b6',{metalness:.3,roughness:.35});
  const w=ms(tor(.15,.06),mat('#222831',{roughness:.7}),0,.16,0,g);w.rotation.y=Math.PI/2;ms(box(.36,.1,.2,.04),GRY,0,.28,0,g);
  ms(box(.5,.48,.38,.1),t,0,.58,0,g);ms(cyl(.06,.06,.12,10),GRY,0,.88,0,g);
  ms(box(.58,.44,.44,.12),y,0,1.12,0,g);ms(box(.46,.3,.03,.05),mat('#0d1424',{roughness:.05}),0,1.12,.22,g);
  for(const s of[-1,1])ms(box(.08,.08,.02,.03),glowMat('#6ff6ff',2),s*.1,1.15,.24,g);smile(g,0,1.06,.24,.06).material=glowMat('#6ff6ff',2);
  ms(cyl(.012,.012,.2,6),GRY,.18,1.42,0,g);ms(sph(.04,8,6),glowMat('#ff4f6a',1.5),.18,1.53,0,g);
  ms(box(.16,.12,.08,.02),mat('#1a1a22'),.0,.6,.24,g);ms(cyl(.04,.04,.05,12),mat('#66aaff',{metalness:.8,roughness:.1}),0,.6,.29,g).rotation.x=Math.PI/2;
  for(const s of[-1,1])ms(cap(.06,.22),t,s*.32,.6,0,g).rotation.z=s*.35;return g;}
function jelly(){const g=new THREE.Group();const dm=new THREE.MeshStandardMaterial({envMapIntensity:.4,color:'#ff6ac8',transparent:true,opacity:.78,roughness:.15,emissive:'#ff4fb0',emissiveIntensity:.35});
  ms(hemi(.42),dm,0,.72,0,g,1,.95,1);ms(sph(.2,14,10),glowMat('#ffd0f0',.8),0,.8,0,g).castShadow=false;
  eyeM(g,-.13,.86,.32,.09);eyeM(g,.13,.86,.32,.09);smile(g,0,.76,.38,.05);
  const tm=mat('#ff9ae0',{emissive:'#ff5fc0',emissiveIntensity:.3,roughness:.3});
  for(let i=0;i<7;i++){const a=i/7*6.283,x=Math.sin(a)*.26,z=Math.cos(a)*.26;tube([[x,.72,z],[x*1.1+.05,.5,z*1.1],[x*.9-.04,.3,z*.9],[x*1.05,.12,z*1.05]],.035,tm,g);}
  const h=halo('#ff7ad0',1.1,.35);h.position.y=.7;g.add(h);return g;}
function grey(){const g=new THREE.Group(),sk=mat('#8fd0a8',{roughness:.4}),su=mat('#c8d0e0',{metalness:.6,roughness:.25});
  ms(cap(.17,.36),su,0,.46,0,g);for(const s of[-1,1]){ms(cap(.05,.3),sk,s*.22,.5,0,g).rotation.z=s*.25;ms(cap(.06,.2),su,s*.08,.12,0,g);}
  ms(cyl(.05,.06,.12,10),sk,0,.82,0,g);ms(sph(.4,28,20),sk,0,1.18,0,g,1,1.12,.95);
  const em=mat('#0a0a14',{metalness:.6,roughness:.04,envMapIntensity:2});for(const s of[-1,1]){const e=ms(sph(.12,18,12),em,s*.15,1.14,.3,g,1.35,.75,.5);e.rotation.z=s*.45;}
  ms(sph(.012,6,6),mat('#2a3a30'),-.03,1.0,.37,g);ms(sph(.012,6,6),mat('#2a3a30'),.03,1.0,.37,g);smile(g,0,.92,.34,.04,'#3a4a40');
  ms(box(.2,.08,.04,.02),glowMat('#4fe8ff',1.5),0,.6,.17,g);return g;}
function crystal(){const g=new THREE.Group(),cm=new THREE.MeshStandardMaterial({envMapIntensity:.5,color:'#4fd8ff',transparent:true,opacity:.85,roughness:.05,metalness:.2,emissive:'#1aa8d0',emissiveIntensity:.6});
  const oc=geo('oct',()=>new THREE.OctahedronGeometry(.3,0));ms(oc,cm,0,.75,0,g,1,1.7,.9);
  for(const[x,y,s,r]of[[-.28,.45,.5,.5],[.3,.5,.55,-.5],[-.18,.25,.4,.8],[.2,.22,.45,-.7]]){const m=ms(oc,cm,x,y,.0,g,s,s*1.5,s);m.rotation.z=r;}
  eyeM(g,-.09,.85,.24,.07);eyeM(g,.09,.85,.24,.07);smile(g,0,.68,.26,.05);const h=halo('#6ff6ff',1.2,.4);h.position.y=.7;g.add(h);return g;}
const ALIENS=[blob,trio,robo,jelly,grey,crystal];

/* ---------- Welt bauen ---------- */
const deckMat=(()=>{const c=cnv(256,256),g=c.getContext('2d');g.fillStyle='#3e4a5e';g.fillRect(0,0,256,256);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=i*128,y=j*128,gr=g.createLinearGradient(x,y,x+128,y+128);gr.addColorStop(0,(i+j)%2?'#5a687e':'#56647a');gr.addColorStop(1,(i+j)%2?'#4a576c':'#4e5b70');g.fillStyle=gr;g.fillRect(x+3,y+3,122,122);
    g.fillStyle='rgba(150,170,200,.35)';for(const[a,b]of[[10,10],[118,10],[10,118],[118,118]]){g.beginPath();g.arc(x+a,y+b,3.2,0,7);g.fill();}}
  g.strokeStyle='rgba(20,28,42,.8)';g.lineWidth=4;g.strokeRect(0,0,256,256);g.beginPath();g.moveTo(128,0);g.lineTo(128,256);g.moveTo(0,128);g.lineTo(256,128);g.stroke();
  g.fillStyle='rgba(20,28,42,.35)';for(let k=0;k<6;k++)g.fillRect(150,30+k*10,60,4);
  const t=ctex(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.25,.25);return new THREE.MeshStandardMaterial({map:t,roughness:.38,metalness:.45,envMapIntensity:.6});})();
function rrShape(x0,z0,x1,z1,r){const s=new THREE.Shape();s.moveTo(x0+r,-z0);s.lineTo(x1-r,-z0);s.quadraticCurveTo(x1,-z0,x1,-z0-r);s.lineTo(x1,-z1+r);s.quadraticCurveTo(x1,-z1,x1-r,-z1);s.lineTo(x0+r,-z1);s.quadraticCurveTo(x0,-z1,x0,-z1+r);s.lineTo(x0,-z0-r);s.quadraticCurveTo(x0,-z0,x0+r,-z0);return s;}
function buildWorld(){
  const top=new THREE.ExtrudeGeometry(rrShape(BX0,BY0,BX1,BY1,2.2),{depth:1.4,bevelEnabled:true,bevelThickness:.2,bevelSize:.2,bevelSegments:2,curveSegments:10});
  const deck=new THREE.Mesh(top,[deckMat,mat('#4a5570',{metalness:.6,roughness:.4})]);deck.rotation.x=-Math.PI/2;deck.position.y=-1.6;deck.receiveShadow=true;scene.add(deck);
  const ringS=rrShape(BX0-.05,BY0-.05,BX1+.05,BY1+.05,2.3);ringS.holes.push(rrShape(BX0+.35,BY0+.35,BX1-.35,BY1-.35,1.9));
  const ring=new THREE.Mesh(new THREE.ExtrudeGeometry(ringS,{depth:.05,bevelEnabled:false,curveSegments:10}),glowMat('#2ee6ff',1.4));ring.rotation.x=-Math.PI/2;ring.position.y=.005;scene.add(ring);
  const hull=new THREE.Mesh(new THREE.CylinderGeometry(20,6,14,8,1),mat('#3a4560',{metalness:.7,roughness:.35}));hull.position.set((BX0+BX1)/2,-9,(BY0+BY1)/2);hull.rotation.y=Math.PI/8;scene.add(hull);
  for(const[x,z]of[[BX0+4,BY0+4],[BX1-4,BY0+4],[BX0+4,BY1-4],[BX1-4,BY1-4]]){const h=halo('#5fd8ff',9,.55);h.position.set(x,-6,z);scene.add(h);const e=ms(cyl(1.2,1.8,2,16),GRY,x,-3,z,scene);e.castShadow=false;}
  // Geländer
  const pm=mat('#d8e0ec',{metalness:.7,roughness:.25}),gm=new THREE.MeshStandardMaterial({color:'#9fe8ff',transparent:true,opacity:.14,roughness:.05,metalness:.1,depthWrite:false,side:THREE.DoubleSide});
  const sides=[[BX0+.5,BY0+2.4,BX0+.5,BY1-2.4],[BX1-.5,BY0+2.4,BX1-.5,BY1-2.4],[BX0+2.4,BY0+.5,BX1-2.4,BY0+.5],[BX0+2.4,BY1-.5,BX1-2.4,BY1-.5]];
  for(const[x0,z0,x1,z1]of sides){const L=Math.hypot(x1-x0,z1-z0),n=Math.round(L/3);for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;ms(cyl(.06,.08,.9,10),pm,x,.45,z,scene);ms(sph(.07,10,8),glowMat('#2ee6ff',1.5),x,.93,z,scene);}
    const rail=ms(cyl(.045,.045,L,10),pm,(x0+x1)/2,.88,(z0+z1)/2,scene);rail.rotation.order='YXZ';rail.rotation.y=Math.atan2(x1-x0,z1-z0);rail.rotation.x=Math.PI/2;
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(L,.75),gm);gl.position.set((x0+x1)/2,.46,(z0+z1)/2);gl.rotation.y=Math.atan2(z1-z0,x1-x0)*-1;scene.add(gl);}
  // Sterne
  const sp=[];for(let i=0;i<2200;i++){const u=rnd()*2-1,a=rnd()*6.283,r=220+rnd()*200,s=Math.sqrt(1-u*u);sp.push(Math.cos(a)*s*r,Math.min(u*r,60)-40,Math.sin(a)*s*r);}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:'#ffffff',size:1.6,sizeAttenuation:false,transparent:true,opacity:.9})));
  const sp2=[];for(let i=0;i<300;i++){sp2.push((rnd()-.5)*500,-60-rnd()*200,(rnd()-.5)*500);}const sg2=new THREE.BufferGeometry();sg2.setAttribute('position',new THREE.Float32BufferAttribute(sp2,3));
  scene.add(new THREE.Points(sg2,new THREE.PointsMaterial({color:'#9fd8ff',size:2.6,sizeAttenuation:false,transparent:true,opacity:.8})));
  // Planet
  const pc=cnv(512,256),pg=pc.getContext('2d');for(let y=0;y<256;y++){const t=y/256,c=Math.sin(t*22+Math.sin(t*7)*2);pg.fillStyle=`hsl(${265+c*20},${55+c*10}%,${45+c*12}%)`;pg.fillRect(0,y,512,1);}
  for(let i=0;i<60;i++){pg.fillStyle='rgba(255,220,255,.12)';pg.beginPath();pg.ellipse(rnd()*512,rnd()*256,20+rnd()*60,3+rnd()*6,0,0,7);pg.fill();}
  const planet=new THREE.Mesh(new THREE.SphereGeometry(70,48,32),new THREE.MeshStandardMaterial({map:ctex(pc),roughness:.9,emissive:'#3a1a6a',emissiveIntensity:.35}));planet.position.set(-70,-110,-150);planet.rotation.z=.35;scene.add(planet);
  const pr=new THREE.Mesh(new THREE.RingGeometry(90,130,96),new THREE.MeshBasicMaterial({color:'#e8c8ff',transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));pr.position.copy(planet.position);pr.rotation.x=-1.2;pr.rotation.y=.3;scene.add(pr);
  const moon=new THREE.Mesh(new THREE.SphereGeometry(14,32,20),mat('#c8d0e0',{roughness:.95}));moon.position.set(110,-70,-60);scene.add(moon);
  const sunG=halo('#fff2c0',90,.35);sunG.position.set(160,-40,-200);scene.add(sunG);
  // Asteroiden
  R3.rocks=[];const ag=new THREE.DodecahedronGeometry(1,0);for(let i=0;i<14;i++){const m=ms(ag,mat('#7a7088',{roughness:.95,flatShading:true}),(rnd()-.5)*90,-12-rnd()*30,(rnd()-.5)*90,scene,.6+rnd()*2.2);m.castShadow=false;R3.rocks.push(m);}
  // Kuppeln mit Alien-Bäumen
  for(const[x,z]of[[-19,-16.5],[20,-17],[19.5,19.5]]){const d=new THREE.Group();d.position.set(x,0,z);scene.add(d);
    ms(cyl(2.7,2.9,.35,32),mat('#dfe6f0',{metalness:.5,roughness:.3}),0,.17,0,d);const gr=ms(tor(2.65,.06),glowMat('#2ee6ff',1.4),0,.36,0,d);gr.rotation.x=Math.PI/2;
    ms(cyl(2.5,2.5,.06,32),mat('#2a4a3a',{roughness:.9}),0,.36,0,d);
    tube([[0,.36,0],[.3,1.4,.1],[-.2,2.3,0],[.1,3.0,0]],.16,mat('#6a4a8a',{roughness:.7}),d);
    for(let i=0;i<9;i++){const a=i/9*6.283,r=.6+(i%3)*.35;ms(sph(.38+(i%2)*.12,16,12),mat(i%2?'#5fe8b0':'#7ad0ff',{emissive:i%2?'#1a8a5a':'#1a6aa8',emissiveIntensity:.5,roughness:.35}),Math.sin(a)*r,2.6+Math.cos(a*2)*.4,Math.cos(a)*r,d);}
    ms(hemi(2.5),new THREE.MeshStandardMaterial({color:'#bfefff',transparent:true,opacity:.16,roughness:.02,metalness:.2,depthWrite:false,envMapIntensity:2}),0,.36,0,d,1,1.25,1);
    for(let i=0;i<6;i++){const rib=ms(tor(2.5,.04,Math.PI),pm,0,.36,0,d,1,1.25,1);rib.rotation.y=i/6*Math.PI;}}
  // Deko am Rand
  const block=(x,z,r)=>{if(Math.abs(x-M.x)<4&&z>-3&&z<11)return true;for(const p of PADS)if(Math.abs(x-p.x)<2.4&&Math.abs(z-p.y)<2)return true;
    for(const t of'abcd'){const c=CROPS[t],w=7*SP+1.5,h=4*SP+1.5,sz=t==='a'?8*SP+1.5:0;if(Math.abs(x-c.cx)<(sz||w)/2+r&&Math.abs(z-c.cy)<(sz||h)/2+r)return true;}
    for(const q of[[-19,-16.5],[20,-17],[19.5,19.5],[WB.x,WB.y],[TRASH.x,TRASH.y]])if(Math.hypot(x-q[0],z-q[1])<4.4)return true;return false;};
  const kinds=[crate,lamp,dish,tank,solar,fern];let k=0;
  const spots=[];for(let x=BX0+3;x<BX1-3;x+=3.4){spots.push([x,BY0+1.6]);spots.push([x+1.7,BY1-1.6]);}for(let z=BY0+3;z<BY1-3;z+=3.4){spots.push([BX0+1.6,z]);spots.push([BX1-1.6,z+1.7]);}
  for(const[x,z]of spots){if(block(x,z,1))continue;const o=kinds[k++%kinds.length]();o.position.set(x,0,z);o.rotation.y=rnd()*6.28;scene.add(o);}
}
function crate(){const g=new THREE.Group();ms(box(1,.8,.8,.06),mat('#e0e6ee',{metalness:.4,roughness:.35}),0,.4,0,g);ms(box(1.02,.12,.82,.03),ORG,0,.4,0,g);ms(box(.7,.6,.6,.06),mat('#3f6fa8',{metalness:.4,roughness:.4}),.1,1.1,0,g);ms(box(.2,.06,.02,.01),glowMat('#6fff8a',2),.1,1.2,.31,g);return g;}
function lamp(){const g=new THREE.Group();ms(cyl(.08,.14,1.8,10),GRY,0,.9,0,g);ms(sph(.16,14,10),glowMat('#bff4ff',2),0,1.9,0,g);const h=halo('#6fe8ff',2.2,.6);h.position.y=1.9;g.add(h);return g;}
function dish(){const g=new THREE.Group();ms(cyl(.1,.2,1.2,10),GRY,0,.6,0,g);const d=ms(new THREE.SphereGeometry(.8,24,10,0,Math.PI*2,0,1.0),mat('#f2f5fa',{metalness:.4,roughness:.3,side:THREE.DoubleSide}),0,1.6,0,g);d.rotation.x=Math.PI-.7;ms(cyl(.02,.02,.7,6),GRY,0,1.55,.25,g).rotation.x=.7;ms(sph(.06,8,6),glowMat('#ff4f6a',1.5),0,1.85,.48,g);return g;}
function tank(){const g=new THREE.Group();ms(cap(.4,.8),mat('#f0f3f8',{metalness:.5,roughness:.3}),0,.85,0,g);const b=ms(tor(.41,.04),glowMat('#c48aff',1.5),0,.85,0,g);b.rotation.x=Math.PI/2;ms(cyl(.5,.5,.12,20),GRY,0,.06,0,g);return g;}
function solar(){const g=new THREE.Group();ms(cyl(.06,.06,.9,8),GRY,0,.45,0,g);const pc=cnv(128,128),c=pc.getContext('2d');c.fillStyle='#16306a';c.fillRect(0,0,128,128);c.strokeStyle='#5f8ad8';c.lineWidth=3;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(i*32,0);c.lineTo(i*32,128);c.moveTo(0,i*32);c.lineTo(128,i*32);c.stroke();}
  const p=ms(box(1.6,.05,1,.02),new THREE.MeshStandardMaterial({map:ctex(pc),metalness:.7,roughness:.15}),0,.95,0,g);p.rotation.x=-.5;return g;}
function fern(){const g=new THREE.Group();ms(cyl(.35,.28,.45,16),mat('#e8edf5',{metalness:.4,roughness:.35}),0,.22,0,g);ms(tor(.35,.03),glowMat('#2ee6ff',1.2),0,.42,0,g).rotation.x=Math.PI/2;
  for(let i=0;i<7;i++){const a=i/7*6.283;leaf(g,Math.sin(a)*.2,.6,Math.cos(a)*.2,a,-1.0,1.8);}ms(sph(.09,10,8),glowMat('#ff7ad0',1.4),0,.8,0,g);return g;}

/* ---------- Texturen für Schilder und Felder ---------- */
function rrc(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function ringTex(color,fill){const c=cnv(256,256),g=c.getContext('2d');g.fillStyle=fill||'rgba(255,255,255,.14)';g.beginPath();g.arc(128,128,118,0,7);g.fill();g.setLineDash([22,16]);g.lineWidth=10;g.strokeStyle=color;g.beginPath();g.arc(128,128,118,0,7);g.stroke();return ctex(c);}
function flatPlane(w,h,tex,add){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));m.rotation.x=-Math.PI/2;return m;}
function textTex(text,w,h,size,color,stroke){const c=cnv(w,h),g=c.getContext('2d');g.font='900 '+size+'px '+T.css['--font'];g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';if(stroke){g.lineWidth=size*.2;g.strokeStyle=stroke;g.strokeText(text,w/2,h/2);}g.fillStyle=color;g.fillText(text,w/2,h/2);return ctex(c);}
function drawIcon(g,p,x,y,s){if(p.spr&&ICON[p.spr])g.drawImage(ICON[p.spr],x-s/2,y-s/2,s,s);else{g.font=(s*.8)+'px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(p.icon,x,y+s*.05);}}
function paintPad(p){const c=p.__c,g=c.getContext('2d'),W0=c.width,H0=c.height;g.clearRect(0,0,W0,H0);const act=active===p;
  rrc(g,8,8,W0-16,H0-16,46);g.fillStyle=act?'rgba(20,60,90,.72)':'rgba(10,30,55,.6)';g.fill();
  const f=1-p.rem/p.total;if(f>0){g.save();rrc(g,8,8,W0-16,H0-16,46);g.clip();g.fillStyle='rgba(255,211,106,.45)';g.fillRect(0,H0-8-(H0-16)*f,W0,(H0-16)*f);g.restore();}
  g.setLineDash([30,20]);g.lineWidth=12;g.strokeStyle=p.exit?'#7dff9a':T.css['--accent'];rrc(g,14,14,W0-28,H0-28,42);g.stroke();g.setLineDash([]);
  drawIcon(g,p,120,H0/2-6,150);
  g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  const L=(s,y,sz,col)=>{g.font='900 '+sz+'px '+T.css['--font'];g.lineWidth=sz*.22;g.strokeStyle='rgba(0,0,0,.6)';g.strokeText(s,330,y);g.fillStyle=col;g.fillText(s,330,y);};
  let sz=42;g.font='900 '+sz+'px '+T.css['--font'];while(g.measureText(p.label).width>300&&sz>22){sz-=2;g.font='900 '+sz+'px '+T.css['--font'];}
  L(p.label,82,sz,'#ffffff');L(p.tag(),140,34,'#ffeaa0');
  if(p.exit)L('✔',232,76,'#7dff9a');else{const t=fmt(p.rem);g.font='900 66px '+T.css['--font'];const tw=g.measureText(t).width;const x0=330-(tw+64)/2;g.textAlign='left';g.lineWidth=14;g.strokeStyle='rgba(0,0,0,.6)';g.strokeText(t,x0,234);g.fillStyle='#fff';g.fillText(t,x0,234);if(ICON.cash)g.drawImage(ICON.cash,x0+tw+6,234-30,60,60);}
  p.__t.needsUpdate=true;}

/* ---------- Partikel ---------- */
const PRT=[];
function fx3dBurst(x,y,color,n){for(let i=0;i<n;i++){let s=PRT.find(q=>!q.on);if(!s){if(PRT.length>160)return;s={sp:halo('#fff',.35,1),on:false};scene.add(s.sp);PRT.push(s);}
  const a=Math.random()*6.283,v=1+Math.random()*2.4;s.on=true;s.t=0;s.l=.6+Math.random()*.5;s.x=x;s.y=.6;s.z=y;s.vx=Math.cos(a)*v;s.vz=Math.sin(a)*v;s.vy=2+Math.random()*3;s.sp.material.color.set(color);s.sp.visible=true;}}

/* ---------- Szene-Objekte ---------- */
const O={};
function buildSprites(){
  // Symbolbilder der Gegenstände aus 3D-Modellen rendern
  try{const sz=128,r2=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r2.setSize(sz,sz,false);r2.outputEncoding=THREE.sRGBEncoding;r2.toneMapping=THREE.ACESFilmicToneMapping;
    const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#556',1.2));const dl=new THREE.DirectionalLight('#ffffff',1.5);dl.position.set(2,4,5);sc.add(dl);const cam=new THREE.PerspectiveCamera(30,1,.05,50);
    for(const t of[...TY,'cash']){const m=ITEM[t]();if(t==='cash')m.rotation.x=1.1;sc.add(m);const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(new THREE.Vector3()),s=bb.getSize(new THREE.Vector3()).length();
      cam.position.set(c.x,c.y+s*.45,c.z+s*1.75);cam.lookAt(c);r2.render(sc,cam);const out=cnv(sz,sz);out.getContext('2d').drawImage(r2.domElement,0,0);ICON[t]=out;sc.remove(m);}
    r2.dispose();r2.forceContextLoss&&r2.forceContextLoss();}catch(e){}
  buildWorld();
  // Kiosk-Zonen
  O.sell=flatPlane(3.6,3.6,ringTex(T.css['--accent']));O.sell.position.set(M.sell.x,.03,M.sell.y);scene.add(O.sell);
  O.sellT=flatPlane(2.6,.65,textTex(T.text.sell,512,128,74,'#ffffff','rgba(0,0,0,.55)'));O.sellT.position.set(M.sell.x,.04,M.sell.y);scene.add(O.sellT);
  O.cashZ=flatPlane(3.1,3.1,ringTex(T.css['--gold'])); O.cashZ.position.set(M.pad.x,.03,M.pad.y);scene.add(O.cashZ);
  const v=new THREE.Group();v.position.set(M.pad.x,0,M.pad.y);scene.add(v);O.vault=v;
  ms(cyl(.62,.7,.5,28),mat('#33425e',{metalness:.75,roughness:.28}),0,.25,0,v);const vr=ms(tor(.64,.05),glowMat(T.css['--gold'],1.3),0,.42,0,v);vr.rotation.x=Math.PI/2;
  ms(cyl(.5,.5,.06,28),mat('#1a2236',{metalness:.6,roughness:.3}),0,.52,0,v);O.chips=[];for(let i=0;i<12;i++){const c=ITEM.cash();c.position.set(((i%3)-1)*.3,.55+Math.floor(i/3)*.06,(i%2)*.1-.05);v.add(c);O.chips.push(c);}
  // Labor
  const lab=new THREE.Group();lab.position.set(WB.x,0,WB.y);scene.add(lab);O.lab=lab;
  ms(box(7.2,.9,1.5,.14),mat('#e8edf5',{metalness:.35,roughness:.3}),0,.45,0,lab);ms(box(7.3,.08,1.6,.03),mat('#26324a',{metalness:.6,roughness:.15}),0,.93,0,lab);ms(box(7.22,.06,1.52,.02),glowMat('#7dff6a',1.2),0,.62,0,lab);
  ms(cyl(.7,.75,.2,28),GRY,0,1.05,0,lab);O.liq=ms(sph(.5,24,16),glowMat('#7dff6a',.9),0,1.45,0,lab);O.liq.castShadow=false;ms(hemi(.72),GLASS,0,1.12,0,lab,1,1.25,1);
  const lh=halo('#7dff6a',2.8,.35);lh.position.y=1.5;lab.add(lh);O.labHalo=lh;
  const tm=mat('#bff4ff',{transparent:true,opacity:.5,roughness:.05});tube([[-2.6,1,0],[-1.6,1.8,0],[-.6,1.5,0]],.07,tm,lab);tube([[.6,1.5,0],[1.6,1.8,0],[2.6,1,0]],.07,tm,lab);
  for(const s of[-1,1]){ms(box(1,.7,.8,.1),mat('#ffffff',{metalness:.3,roughness:.3}),s*2.7,1.3,0,lab);ms(box(.6,.3,.02,.04),mat('#0d1424',{roughness:.05}),s*2.7,1.4,.41,lab);ms(box(.2,.06,.02,.01),glowMat(s<0?'#4fc8ff':'#7dff6a',2),s*2.7,1.4,.42,lab);}
  O.labC=cnv(640,280);O.labT=ctex(O.labC);const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2),new THREE.MeshBasicMaterial({map:O.labT,transparent:true,toneMapped:false}));sign.position.set(0,3.1,-.6);lab.add(sign);
  ms(cyl(.05,.05,2.3,8),GRY,-2.1,1.9,-.62,lab);ms(cyl(.05,.05,2.3,8),GRY,2.1,1.9,-.62,lab);
  O.inZ=flatPlane(3,3,ringTex(T.css['--accent']));O.inZ.position.set(WB.inZ.x,.03,WB.inZ.y);scene.add(O.inZ);
  O.outZ=flatPlane(3,3,ringTex(T.css['--gold']));O.outZ.position.set(WB.outZ.x,.03,WB.outZ.y);scene.add(O.outZ);
  O.inL=flatPlane(2.2,.5,textTex('Zutaten',512,120,70,'#fff','rgba(0,0,0,.6)'));O.inL.position.set(WB.inZ.x,.04,WB.inZ.y+1.85);scene.add(O.inL);
  O.outL=flatPlane(2.2,.5,textTex('Fertig',512,120,70,'#fff','rgba(0,0,0,.6)'));O.outL.position.set(WB.outZ.x,.04,WB.outZ.y+1.85);scene.add(O.outL);
  O.outStack=[];for(let i=0;i<6;i++){const c=ITEM.e();c.position.set(WB.outZ.x+((i%3)-1)*.42,.02,WB.outZ.y+Math.floor(i/3)*.42-.2);scene.add(c);O.outStack.push(c);}
  // Recycler
  const rc=new THREE.Group();rc.position.set(TRASH.x,0,TRASH.y);scene.add(rc);
  O.trZ=flatPlane(2.4,2.4,ringTex('#9ab4c8'));O.trZ.position.set(TRASH.x,.03,TRASH.y);scene.add(O.trZ);
  ms(cyl(.55,.65,1,24),mat('#4a5670',{metalness:.6,roughness:.35}),0,.5,0,rc);ms(cyl(.4,.4,.04,24),mat('#05070c'),0,1.01,0,rc);const rg_=ms(tor(.5,.05),glowMat('#6fff8a',1.5),0,1.0,0,rc);rg_.rotation.x=Math.PI/2;
  ms(box(.5,.22,.03,.03),mat('#0d1424'),0,.6,.6,rc).rotation.x=-.12;ms(box(.3,.06,.02,.01),glowMat('#6fff8a',2),0,.62,.62,rc);O.trRing=rg_;
  // Figuren
  O.pl=mkAstro();O.pl.root.scale.setScalar(1.3);scene.add(O.pl.root);
  O.dr=helpers.map(()=>{const d=mkDrone();d.root.scale.setScalar(1.25);scene.add(d.root);d.root.visible=false;return d;});
  O.chef=mkChefBot();O.chef.root.scale.setScalar(1.25);O.chef.root.position.set(FORE.x,0,FORE.y);O.chef.root.rotation.y=-.6;scene.add(O.chef.root);
  O.wb=mkWaterBot();O.wb.root.scale.setScalar(1.2);scene.add(O.wb.root);
  // Wegweiser
  O.tRing=ms(tor(.75,.07),mat('#ffb020',{emissive:'#ff9a00',emissiveIntensity:.7}),0,.1,0,scene);O.tRing.rotation.x=Math.PI/2;O.tRing.castShadow=false;
  const ar=new THREE.Group();const c1=ms(cone(.32,.6,4),mat('#ffb020',{emissive:'#ff9a00',emissiveIntensity:.55,roughness:.3}),0,0,.3,ar);c1.rotation.x=Math.PI/2;c1.castShadow=false;scene.add(ar);O.arrow=ar;
  O.stack=new THREE.Group();scene.add(O.stack);
}
function sigOf(a){return a.join('');}
function syncStack(holder,inv,grp,max,step,sc){const k=sigOf(inv.slice(-max));if(holder.__sk===k)return;holder.__sk=k;
  (holder.__st||[]).forEach(q=>giveItem(q.t,q.o));holder.__st=[];const list=inv.slice(-max);
  list.forEach((t,i)=>{const o=takeItem(t);grp.add(o);o.position.set(0,i*step,0);o.scale.setScalar(sc);holder.__st.push({t,o});});}

let bedSig='',cntSig='',seen=0;
const NODES3=new Set(),CUST3=new Set(),FL3=new Set();
function rebuildBeds(){if(O.beds)O.beds.forEach(b=>scene.remove(b));O.beds=[];
  for(const t of'abcd'){const c=CROPS[t];if(!c.on())continue;const[cols,rows]=c.dims(),w=cols*SP+.9,h=rows*SP+.9,it=itm(t);const g=new THREE.Group();g.position.set(c.cx,0,c.cy);
    ms(box(w,.4,h,.14),mat('#dfe6f0',{metalness:.45,roughness:.32}),0,.2,0,g);ms(box(w+.04,.06,h+.04,.03),glowMat(it.bed[2],1.3),0,.26,0,g);
    ms(box(w-.36,.08,h-.36,.03),mat(it.bed[1],{roughness:.95}),0,.37,0,g);
    for(const sx of[-1,1])for(const sz of[-1,1])ms(sph(.07,10,8),glowMat(it.bed[2],1.8),sx*(w/2-.08),.42,sz*(h/2-.08),g);
    scene.add(g);O.beds.push(g);}}
function rebuildCounter(){if(O.counter)scene.remove(O.counter);const cl=queueCap()+.6,g=new THREE.Group();g.position.set(M.x+.2,0,M.y0+cl/2);O.counter=g;scene.add(g);
  ms(box(1.3,.95,cl,.16),mat('#eef2f8',{metalness:.3,roughness:.32}),0,.475,0,g);ms(box(1.45,.08,cl+.14,.04),mat('#22304a',{metalness:.6,roughness:.14}),0,.99,0,g);ms(box(1.32,.05,cl+.02,.02),glowMat('#2ee6ff',1.4),0,.72,0,g);
  for(let z=-cl/2+.5;z<cl/2-.3;z+=.8)ms(box(.02,.3,.5,.01),glowMat('#ff5fc8',1.2),-.66,.45,z,g);
  const items=TY.filter(t=>t==='a'||(t==='b'&&S.beehive1)||(t==='c'&&S.orchard1)||(t==='d'&&S.pumpkin1)||(t==='e'&&S.workbench));
  items.forEach((t,i)=>{const o=ITEM[t]();o.position.set(-.25,1.03,-cl/2+.6+i*.85);o.scale.setScalar(1.1);g.add(o);});
  const hc=cnv(512,140),hg=hc.getContext('2d');rrc(hg,6,6,500,128,30);hg.fillStyle='rgba(20,90,140,.45)';hg.fill();hg.lineWidth=6;hg.strokeStyle='#6ff6ff';hg.stroke();hg.font='900 64px '+T.css['--font'];hg.textAlign='center';hg.textBaseline='middle';hg.fillStyle='#dffcff';hg.fillText(T.market.name.toUpperCase(),256,74);
  const holo=new THREE.Mesh(new THREE.PlaneGeometry(3,.82),new THREE.MeshBasicMaterial({map:ctex(hc),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,side:THREE.DoubleSide}));holo.position.set(0,2.15,-cl/2);g.add(holo);O.holo=holo;
  ms(cyl(.12,.18,.12,16),GRY,0,1.06,-cl/2+.1,g);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.08,.7,1.1,16,1,true),new THREE.MeshBasicMaterial({color:'#6ff6ff',transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));beam.position.set(0,1.65,-cl/2+.05);g.add(beam);}

function paintLab(){const k=[WB.a,WB.b,WB.e,S.boutiqueLevel||0].join('|');if(O.labK===k)return;O.labK=k;const g=O.labC.getContext('2d'),w=640,h=280;g.clearRect(0,0,w,h);
  rrc(g,6,6,w-12,h-12,28);g.fillStyle='rgba(8,18,34,.9)';g.fill();g.lineWidth=8;g.strokeStyle='#7dff6a';g.stroke();
  g.textAlign='center';g.textBaseline='middle';g.fillStyle='#d8ffd0';g.font='900 46px '+T.css['--font'];g.fillText(T.bench.name,w/2,52);
  const lvl=1+Math.floor((S.boutiqueLevel||0)/2),I=(t,x,y,s)=>{if(ICON[t])g.drawImage(ICON[t],x-s/2,y-s/2,s,s);};
  g.font='900 50px '+T.css['--font'];g.fillStyle='#fff';I('a',150,130,90);g.fillText('+',220,132);I('b',290,130,90);g.fillText('=',360,132);g.fillText(''+lvl,410,132);I('e',480,130,90);
  g.font='900 40px '+T.css['--font'];g.fillStyle='#bff6c9';I('a',110,222,64);g.fillText(''+WB.a,165,224);I('b',250,222,64);g.fillText(''+WB.b,305,224);g.fillStyle='#ffe9a8';g.fillText('fertig',420,224);I('e',505,222,64);g.fillStyle='#bff6c9';g.fillText(''+WB.e,560,224);
  O.labT.needsUpdate=true;}

let camT={x:P.x,z:P.y},lastT0=0;
function yawTo(o,obj,dt,k){const dx=obj.x-(o.__px===undefined?obj.x:o.__px),dz=obj.y-(o.__pz===undefined?obj.y:o.__pz);o.__px=obj.x;o.__pz=obj.y;
  if(Math.hypot(dx,dz)>.002)o.__yaw=Math.atan2(dx,dz);if(o.__yaw!==undefined){let d=o.__yaw-o.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));o.rotation.y+=d*Math.min(1,dt*(k||10));}}
const PERF={n:0,t:performance.now(),lvl:0};
function perfCheck(){PERF.n++;if(PERF.n<90)return;const fps=PERF.n*1000/(performance.now()-PERF.t);PERF.n=0;PERF.t=performance.now();
  if(fps<38&&PERF.lvl<2){PERF.lvl++;if(PERF.lvl===1){renderer.setPixelRatio(1);window.__rs3d();}else{sun.shadow.mapSize.set(1024,1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}renderer.shadowMap.type=THREE.PCFShadowMap;}}}
function draw(){
  perfCheck();
  const dt=Math.min(.05,Math.max(0,T0-lastT0));lastT0=T0;
  /* Beete und Pflanzen */
  const bs='abcd'.split('').map(t=>CROPS[t].on()?CROPS[t].dims().join('x'):'-').join('|');if(bs!==bedSig){bedSig=bs;rebuildBeds();}
  seen++;
  for(const n of nodes){if(!n.__m){const o=NODE[n.type]();o.g.position.set(n.x,.41,n.y);o.g.rotation.y=(n.ph||0)*1.3;o.h=halo(itm(n.type).glow,1.3,.4);o.h.position.y=o.fy+.25;o.g.add(o.h);o.w=halo('#5fb0ff',.9,0);o.w.position.y=.1;o.g.add(o.w);scene.add(o.g);n.__m=o;NODES3.add(n);}
    n.__seen=seen;const o=n.__m,fs=o.fs||1;
    if(n.grown){const pu=1+(n.pop>0?n.pop*1.4:0);o.f.scale.setScalar(fs*pu);o.f.position.y=o.fy+Math.sin(T0*2+n.ph)*.02;o.h.material.opacity=.22+.1*Math.sin(T0*3+n.ph);o.h.visible=true;}
    else{const f=clamp(n.t/REGROW[n.type],0,1);o.f.scale.setScalar(fs*(.12+.7*f));o.h.visible=false;}
    o.w.material.opacity=n.water>0?.55:0;}
  for(const n of NODES3)if(n.__seen!==seen){scene.remove(n.__m.g);NODES3.delete(n);}
  /* Kiosk */
  const cs=queueCap()+'|'+[S.beehive1,S.orchard1,S.pumpkin1,S.workbench].join();if(cs!==cntSig){cntSig=cs;rebuildCounter();}
  if(O.holo)O.holo.position.y=2.15+Math.sin(T0*2)*.06;
  O.sell.rotation.z=T0*.3;const sp=1+Math.sin(T0*4.5)*.035;O.sell.scale.set(sp,sp,1);O.cashZ.rotation.z=-T0*.25;
  const nc=Math.min(12,Math.ceil(M.cash/Math.max(6,value('a')*2)));O.chips.forEach((c,i)=>c.visible=i<nc);
  /* Labor */
  O.lab.visible=O.inZ.visible=O.outZ.visible=O.inL.visible=O.outL.visible=!!S.workbench;
  if(S.workbench){paintLab();const k=WB.ct>0?1:0;O.liq.scale.setScalar(1+Math.sin(T0*(k?9:2))*.05*(1+k*2));O.labHalo.material.opacity=.3+k*.3;O.inZ.rotation.z=T0*.3;O.outZ.rotation.z=-T0*.3;}
  O.outStack.forEach((c,i)=>c.visible=!!S.workbench&&i<Math.min(6,WB.e));
  O.trRing.material.emissiveIntensity=1.2+(TRASH.dwell>0?2:0);
  /* Felder */
  for(const p of PADS){if(!p.__m){p.__c=cnv(512,360);p.__t=ctex(p.__c);p.__m=flatPlane(PHW*2,PHH*2,p.__t);p.__m.position.set(p.x,.035,p.y);scene.add(p.__m);}
    const vis=padOpen(p);p.__m.visible=vis;if(!vis)continue;const k=[p.label,p.tag(),Math.round(p.rem),p.exit,active===p].join('|');if(k!==p.__k){p.__k=k;paintPad(p);}
    p.__m.material.opacity=.82+.18*Math.sin(T0*3+p.x);}
  /* Spieler */
  const pl=O.pl;pl.root.position.set(P.x,0,P.y);yawTo(pl.root,P,dt,12);
  const ws=P.moving?Math.sin(walk*10):0;pl.hips[0].rotation.x=ws*.7;pl.hips[1].rotation.x=-ws*.7;pl.arms[0].rotation.x=-ws*.6;pl.arms[1].rotation.x=ws*.6;
  pl.body.position.y=P.moving?Math.abs(Math.cos(walk*10))*.06:Math.sin(walk*2.5)*.015;pl.body.rotation.x=P.moving?.1:0;
  pl.jets.forEach(j=>{const s=P.moving?.75+Math.random()*.25:.35;j.scale.set(s,s,1);j.material.opacity=P.moving?.85:.35;});
  syncStack(P,P.inv,O.stack,14,.26,.85);O.stack.position.set(P.x-Math.sin(pl.root.rotation.y)*.7,1.6,P.y-Math.cos(pl.root.rotation.y)*.7);O.stack.rotation.y=pl.root.rotation.y;
  (P.__st||[]).forEach((q,i)=>{q.o.position.x=Math.sin(T0*3+i*.6)*.025*i*.3;q.o.rotation.y=Math.sin(T0+i)*.2;});
  /* Helfer */
  helpers.forEach((h,i)=>{const d=O.dr[i];d.root.visible=h.on;if(!h.on)return;d.root.position.set(h.x,1.15+Math.sin(T0*3+i)*.08,h.y);yawTo(d.root,h,dt,8);
    d.b.rotation.z=h.mv?Math.sin(T0*6+i)*.06:0;d.b.rotation.x=h.mv?.18:0;d.rotors.forEach((r,k)=>r.rotation.y+=dt*30*(k%2?1:-1));
    if(!h.__g){h.__g=new THREE.Group();scene.add(h.__g);}h.__g.visible=true;syncStack(h,h.inv,h.__g,10,.24,.75);h.__g.position.set(h.x,1.6,h.y);});
  O.chef.root.visible=!!S.foreman;if(S.foreman){O.chef.head.rotation.y=Math.sin(T0*.8)*.5;O.chef.b.position.y=Math.sin(T0*2)*.02;}
  O.wb.root.visible=!!S.gardener;if(S.gardener){O.wb.root.position.set(GARD.x,.05+Math.sin(T0*3)*.06,GARD.y);yawTo(O.wb.root,GARD,dt,6);}
  /* Kunden */
  for(const c of cust){if(!c.__m){const g=new THREE.Group(),a=ALIENS[c.k%ALIENS.length]();a.scale.setScalar(1.25);g.add(a);g.__a=a;scene.add(g);c.__m=g;CUST3.add(c);}
    const g=c.__m,mv=c.mv||c.leaving,w=walk*9+(c.ph||0);g.position.set(c.x,mv?Math.abs(Math.sin(w))*.16:0,c.y);
    if(c.leaving){if(!g.__beam){const b=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,8,20,1,true),new THREE.MeshBasicMaterial({color:'#9ff6ff',transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));b.position.y=4;g.add(b);g.__beam=b;}
      const k=Math.min(1,c.t/1.15);g.__a.position.y=k*2.2;g.__a.scale.setScalar(1.25*Math.max(.02,1-k));g.__a.rotation.y+=dt*8;g.__beam.material.opacity=.4*(1-k);}
    else{const sq=1+(mv?Math.sin(w*2)*.04:Math.sin(walk*2.4+(c.ph||0))*.025);g.__a.scale.set(1.25*sq,1.25/sq,1.25*sq);g.rotation.y=-Math.PI/2*.62;}
    c.__seen=seen;}
  for(const c of CUST3)if(c.__seen!==seen){scene.remove(c.__m);CUST3.delete(c);}
  /* Flugobjekte */
  for(const f of fl){if(!f.__o){const t=f.icon==='cash'?'cash':f.icon;f.__t=t;f.__o=takeItem(t);FL3.add(f);}
    const k=Math.min(1,f.t/f.d),e=k*k*(3-2*k),b=f.b,hy=f.icon==='cash'?.4:1.1;f.__o.position.set(f.a.x+(b.x-f.a.x)*e,.9+(hy-.9)*e+Math.sin(k*Math.PI)*1.5,f.a.y+(b.y-f.a.y)*e);
    f.__o.rotation.y=T0*9;f.__o.scale.setScalar(.9+Math.sin(k*Math.PI)*.3);f.__seen=seen;}
  for(const f of FL3)if(f.__seen!==seen){giveItem(f.__t,f.__o);FL3.delete(f);}
  /* Partikel */
  for(const s of PRT){if(!s.on)continue;s.t+=dt;s.vy-=9*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;if(s.y<.05){s.y=.05;s.vy*=-.3;}s.sp.position.set(s.x,s.y,s.z);s.sp.material.opacity=Math.max(0,1-s.t/s.l);if(s.t>s.l){s.on=false;s.sp.visible=false;}}
  /* Wegweiser */
  const tg=target;O.tRing.visible=O.arrow.visible=!!tg;if(tg){O.tRing.position.set(tg.x,.12,tg.y);const s=1+Math.sin(T0*5)*.12;O.tRing.scale.set(s,s,s);
    const dx=tg.x-P.x,dz=tg.y-P.y,d=Math.hypot(dx,dz);O.arrow.visible=d>2.8;O.arrow.position.set(P.x+dx/d*1.9,.35+Math.sin(T0*5)*.08,P.y+dz/d*1.9);O.arrow.rotation.y=Math.atan2(dx,dz);}
  R3.rocks.forEach((r,i)=>{r.rotation.x+=dt*.1*(1+i%3);r.rotation.y+=dt*.07;});
  /* Kamera */
  camT.x+=(P.x-camT.x)*.12;camT.z+=(P.y-camT.z)*.12;const D=(W/H<1?30:22)/zoom,el=.86;
  camera.position.set(camT.x,D*Math.sin(el),camT.z+D*Math.cos(el));camera.lookAt(camT.x,.5,camT.z);
  sun.position.set(camT.x+9,22,camT.z+7);sun.target.position.set(camT.x,0,camT.z);
  renderer.render(scene,camera);
  overlay();
  window.__r3={camera,camT,setCam:(x,z)=>{camT.x=x;camT.z=z;}};
}

/* ---------- 2D-Ebene: Blasen, Texte, Joystick ---------- */
const _v=new THREE.Vector3();
function scr(x,y,z){_v.set(x,y,z).project(camera);return{x:(_v.x*.5+.5)*W,y:(-_v.y*.5+.5)*H,ok:_v.z<1};}
function opill(img,text,x,y,fs,bg,fg){ctx.font='900 '+fs+'px '+T.css['--font'];const iw=img?fs*1.45:0,tw=ctx.measureText(text).width,w=iw+tw+fs*(img?.75:1.1),h=fs*1.75;
  rrc(ctx,x-w/2,y-h/2,w,h,h/2);ctx.fillStyle=bg;ctx.fill();if(img)ctx.drawImage(img,x-w/2+fs*.2,y-iw/2,iw,iw);ctx.fillStyle=fg;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(text,x-w/2+fs*(img?.2:.55)+iw,y+fs*.06);}
function overlay(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);const fs=Math.max(12,Math.min(16,W/30))*Math.min(1.25,Math.max(.8,zoom));
  for(const c of cust){if(c.leaving||c.need<=0)continue;const p=scr(c.x+1.05,1.5,c.y);if(p.ok)opill(ICON[c.type],''+c.need,p.x,p.y,fs*.88,'rgba(255,255,255,.95)','#1a1430');}
  if(M.cash>0){const p=scr(M.pad.x,1.6,M.pad.y);if(p.ok)opill(ICON.cash,fmt(M.cash),p.x,p.y,fs,'rgba(6,14,30,.85)','#ffe27a');}
  const full=P.inv.length>=capMax(),pp=scr(P.x,2.45+Math.min(P.inv.length,14)*.26,P.y);opill(null,full?'VOLL':P.inv.length+'/'+capMax(),pp.x,pp.y,fs*.85,full?T.css['--accent2']:'rgba(0,0,0,.65)','#fff');
  for(const q of pops){const p=scr(q.x,1.8,q.y);if(!p.ok)continue;ctx.globalAlpha=Math.min(1,(1.3-q.t)*1.5);const y=p.y-q.t*44;
    ctx.font='900 '+(fs*1.35)+'px '+T.css['--font'];ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=fs*.35;ctx.strokeStyle='rgba(0,0,0,.7)';
    if(q.coin&&ICON.cash){const tw=ctx.measureText(q.text).width;ctx.strokeText(q.text,p.x-fs*.8,y);ctx.fillStyle=q.color;ctx.fillText(q.text,p.x-fs*.8,y);ctx.drawImage(ICON.cash,p.x-fs*.8+tw/2+2,y-fs*.95,fs*1.9,fs*1.9);}
    else{ctx.strokeText(q.text,p.x,y);ctx.fillStyle=q.color;ctx.fillText(q.text,p.x,y);}ctx.globalAlpha=1;}
  if(joy.on){ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.6)';ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(joy.ox,joy.oy,JR,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(joy.x,joy.y,22,0,7);ctx.fill();}
  if(R.on){ctx.strokeStyle='rgba(120,230,255,'+(.3+.15*Math.sin(T0*10))+')';ctx.lineWidth=9;ctx.strokeRect(0,0,W,H);}
}

