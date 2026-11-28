(function(){const o=THREE.Color.prototype.setStyle;THREE.Color.prototype.setStyle=function(v){o.call(this,v);return this.convertSRGBToLinear();};})();
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

function mkPerson(o){const root=new THREE.Group(),body=new THREE.Group();root.add(body);const hips=[],arms=[];
  const SK=mat(o.skin,{roughness:.6}),SH=mat(o.shirt,{roughness:.75}),PA=mat(o.pants,{roughness:.8}),SO=mat(o.shoes||'#3a2a20',{roughness:.6}),HA=mat(o.hair||'#3a2418',{roughness:.85}),CO=mat('#f4f6f8',{roughness:.6});
  for(const s of[-1,1]){const h=new THREE.Group();h.position.set(s*.11,.56,0);body.add(h);ms(cap(.095,.3),PA,0,-.23,0,h);ms(box(.17,.11,.27,.05),SO,0,-.5,.04,h);hips.push(h);}
  ms(cap(.24,.28),o.coat?CO:SH,0,.92,0,body,1,1,.74);
  if(o.coat){ms(cap(.25,.2),CO,0,.72,0,body,1.05,1,.8);ms(box(.12,.12,.04,.02),SH,0,1.08,.17,body);for(const y of[.95,.82])ms(sph(.02,8,6),mat('#c8ccd4'),0,y,.19,body);}
  if(o.overalls){ms(box(.36,.32,.06,.03),PA,0,.86,.17,body);for(const s of[-1,1]){ms(box(.05,.32,.04,.015),PA,s*.12,1.05,.15,body);ms(sph(.025,8,6),mat('#d8c068',{metalness:.8,roughness:.3}),s*.12,.98,.2,body);}ms(box(.14,.1,.02,.01),PA,0,.9,.21,body);}
  if(o.apron)ms(box(.36,.44,.04,.03),mat(o.apron,{roughness:.8}),0,.8,.18,body);
  ms(cyl(.25,.25,.06,20),PA,0,.66,0,body,1,1,.74);
  for(const s of[-1,1]){const a=new THREE.Group();a.position.set(s*.3,1.1,0);body.add(a);ms(cap(.075,.3),o.coat?CO:SH,0,-.2,0,a);ms(sph(.08,12,10),o.gloves?mat(o.gloves,{roughness:.7}):SK,0,-.42,0,a);a.rotation.z=s*.1;arms.push(a);}
  ms(cyl(.07,.08,.12,12),SK,0,1.2,0,body);
  const head=new THREE.Group();head.position.y=1.44;body.add(head);
  ms(sph(.25,26,20),SK,0,0,0,head,1,1.04,.98);for(const s of[-1,1])ms(sph(.05,10,8),SK,s*.245,-.01,0,head,.6,1,1);
  for(const s of[-1,1]){eyeM(head,s*.085,.02,.2,.042);ms(box(.075,.018,.02,.006),HA,s*.088,.1,.226,head).rotation.z=s*-.12;}
  ms(sph(.032,10,8),SK,0,-.04,.245,head,1,.9,1);
  if(o.beard){ms(sph(.2,18,12),mat(o.beard,{roughness:.9}),0,-.13,.07,head,1.12,.72,.95);ms(box(.12,.03,.03,.01),mat(o.beard,{roughness:.9}),0,-.075,.235,head);}
  else smile(head,0,-.1,.228,.045,'#7a2a2a');
  const st=o.style||'short';
  if(st!=='bald'){ms(sph(.262,24,16),HA,0,.0,-.04,head,1,1.02,.96);const hh=ms(hemi(.268),HA,0,.03,0,head,1,.9,1);hh.rotation.x=-.32;}
  if(st==='long')ms(cap(.2,.32),HA,0,-.28,-.12,head,1.15,1,.62);
  if(st==='bun')ms(sph(.11,14,10),HA,0,.2,-.2,head);
  if(st==='curly')for(let i=0;i<16;i++){const a=i/16*6.283;ms(sph(.085,10,8),HA,Math.cos(a)*.22,.1+Math.sin(i*1.7)*.06,Math.sin(a)*.2-.05,head);}
  if(st==='bald')for(const s of[-1,1])ms(sph(.09,10,8),HA,s*.2,-.02,-.08,head,.6,1,1);
  if(o.glasses){const gm=mat('#222',{roughness:.3});for(const s of[-1,1])ms(tor(.055,.011),gm,s*.088,.02,.245,head);ms(box(.05,.012,.01,.004),gm,0,.03,.25,head);}
  if(o.hat==='straw'){const sm_=mat('#e6c66a',{roughness:.85});ms(cyl(.44,.44,.03,28),sm_,0,.15,0,head);ms(cyl(.2,.25,.2,24),sm_,0,.25,0,head);ms(cyl(.252,.252,.05,24),mat('#a83a2a'),0,.18,0,head);}
  if(o.hat==='cap'){const cm=mat(o.hatCol||'#3a8a4a',{roughness:.7});ms(hemi(.272),cm,0,.05,0,head);const b=ms(box(.24,.025,.2,.01),cm,0,.07,.25,head);b.rotation.x=.12;ms(sph(.03,8,6),cm,0,.32,0,head);}
  if(o.hat==='beanie'){const cm=mat(o.hatCol||'#e05a3a',{roughness:.9});ms(hemi(.275),cm,0,.02,0,head,1,1.15,1);const r=ms(tor(.262,.04),cm,0,.04,0,head);r.rotation.x=Math.PI/2;ms(sph(.06,10,8),cm,0,.35,0,head);}
  const P={root,body,hips,arms,jets:[],head};root.userData.p=P;return P;}
function addCan(p){const g=new THREE.Group();g.position.set(0,-.48,.08);p.arms[1].add(g);const cm=mat('#4a9a5a',{metalness:.4,roughness:.4});
  ms(cyl(.11,.13,.22,16),cm,0,-.06,0,g);const sp=ms(cyl(.02,.03,.3,8),cm,0,-.02,.2,g);sp.rotation.x=1.1;const hd=ms(tor(.08,.015,Math.PI),cm,0,.08,0,g);hd.rotation.y=Math.PI/2;}
function addClip(p){const c=ms(box(.22,.3,.02,.01),mat('#a87a4a'),0,-.44,.12,p.arms[0]);c.rotation.x=-.6;ms(box(.18,.22,.005,.004),mat('#ffffff'),0,-.44,.135,p.arms[0]).rotation.x=-.6;p.arms[0].rotation.x=-.9;}

/* ================== HANF-IMPERIUM ================== */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=n=>{n=Math.floor(n);return n.toLocaleString('de-DE');};
const fmtG=g=>g>=1000?(g/1000).toFixed(g>=10000?1:2).replace('.',',')+' kg':Math.round(g)+' g';
const W_=()=>innerWidth,H_=()=>innerHeight;

/* ---------- Renderer ---------- */
const cv=$('c');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(1.5,devicePixelRatio||1));renderer.setSize(W_(),H_(),false);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(72,W_()/H_(),.05,1600);
addEventListener('resize',()=>{renderer.setSize(W_(),H_(),false);camera.aspect=W_()/H_();camera.updateProjectionMatrix();});
const SKY_DAY=new THREE.Color('#a9d6ff'),SKY_NIGHT=new THREE.Color('#0c1428'),SKY_DUSK=new THREE.Color('#ffb27a');
scene.background=SKY_DAY.clone();scene.fog=new THREE.Fog(scene.background.getHex(),90,520);
(function(){const pm=new THREE.PMREMGenerator(renderer),es=new THREE.Scene();const g=new THREE.SphereGeometry(50,32,16),pos=g.attributes.position,col=[];
  const top=new THREE.Color('#d8ecff'),mid=new THREE.Color('#b8d0c0'),bot=new THREE.Color('#4a6a34'),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)/50;if(y>0)c.copy(mid).lerp(top,y);else c.copy(mid).lerp(bot,-y);col.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));es.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  scene.environment=pm.fromScene(es,.03).texture;pm.dispose();})();
const hemiL=new THREE.HemisphereLight('#d6ecff','#5a7a3a',.6);scene.add(hemiL);
const sun=new THREE.DirectionalLight('#fff0d4',1.7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:1,far:160});sun.shadow.bias=-.0005;sun.shadow.normalBias=.03;scene.add(sun);scene.add(sun.target);

/* ---------- Sorten ---------- */
const STRAINS=[
 {id:'lemon',name:'Lemon Haze',bud:['#a6dc4a','#8cc63a'],pist:'#ff9a2a',leaf:['#4f9e34','#5fb23e'],h:1.25,nodes:5,frost:10,time:1.0,yield:1.0,price:9,seed:25},
 {id:'north',name:'Northern Lights',bud:['#7aa85a','#5f8f4a'],pist:'#ffb46a',leaf:['#3f7a34','#4a8a3a'],h:.95,nodes:4,frost:14,time:.8,yield:.85,price:8,seed:20},
 {id:'blue',name:'Blue Dream',bud:['#7ccab8','#5aa88a'],pist:'#ffb04a',leaf:['#3f8a5a','#4f9e6a'],h:1.08,nodes:5,frost:12,time:.95,yield:1.1,price:10,seed:35},
 {id:'purple',name:'Purple Kush',bud:['#8a4ad0','#6a8a3a'],pist:'#ff8a3a',leaf:['#356a30','#4a3a6a'],h:.9,nodes:4,frost:12,time:1.1,yield:.95,price:12,seed:45},
 {id:'widow',name:'White Widow',bud:['#e4eed4','#b8cc98'],pist:'#ffd0a0',leaf:['#4a8a3a','#5a9a44'],h:1.0,nodes:4,frost:34,time:1.05,yield:1.0,price:12,seed:55},
 {id:'amnesia',name:'Amnesia Haze',bud:['#c4e070','#98c050'],pist:'#ff7a2a',leaf:['#5aa83a','#6ab84a'],h:1.45,nodes:6,frost:14,time:1.35,yield:1.35,price:12,seed:60},
 {id:'gold',name:'Gold OG',bud:['#e0cc5a','#b8b04a'],pist:'#ff7a2a',leaf:['#6a9a34','#8aa83a'],h:1.0,nodes:4,frost:22,time:1.25,yield:1.0,price:15,seed:80},
 {id:'glue',name:'Gorilla Glue',bud:['#9ab85a','#7a9a4a'],pist:'#e8682a',leaf:['#3f6a2a','#4f7a34'],h:1.15,nodes:5,frost:30,time:1.2,yield:1.2,price:16,seed:100}];
const STRAIN={};STRAINS.forEach(s=>STRAIN[s.id]=s);

/* ---------- Geometrie (zusammengeführt pro Sorte) ---------- */
const _q=new THREE.Quaternion(),_e=new THREE.Euler(),_up=new THREE.Vector3(0,1,0);
const M4=(x,y,z,rx,ry,rz,sx,sy,sz)=>{const a=sx===undefined?1:sx;return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_q.clone().setFromEuler(_e.set(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(a,sy===undefined?a:sy,sz===undefined?a:sz));};
const M4dir=(x,y,z,dx,dy,dz,s,len)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromUnitVectors(_up,new THREE.Vector3(dx,dy,dz).normalize()),new THREE.Vector3(s,len,s));
function mergeParts(parts){const pos=[],nor=[],col=[],idx=[];let off=0;const v=new THREE.Vector3(),nm=new THREE.Matrix3(),c=new THREE.Color();
  for(const p of parts){const g=p.g,P=g.attributes.position,N=g.attributes.normal,C=p.c?null:g.attributes.color;nm.getNormalMatrix(p.m);if(p.c)c.set(p.c);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(p.m);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z);if(C)col.push(C.getX(i),C.getY(i),C.getZ(i));else col.push(c.r,c.g,c.b);}
    if(g.index)for(let i=0;i<g.index.count;i++)idx.push(g.index.getX(i)+off);else for(let i=0;i<P.count;i++)idx.push(i+off);off+=P.count;}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));o.setAttribute('color',new THREE.Float32BufferAttribute(col,3));o.setIndex(idx);o.computeBoundingSphere();return o;}
const VC=mat('#ffffff',{vertexColors:true,roughness:.62,side:THREE.DoubleSide});
const VCF=mat('#ffffff',{vertexColors:true,roughness:.4});
function leafletGeo(n){const s=new THREE.Shape(),wd=.1,wf=t=>wd*Math.sin(Math.PI*Math.min(1,t*1.02))*(1-t*.2);s.moveTo(0,0);
  for(let i=1;i<=n;i++){const t=i/n;s.lineTo(wf(t)+(i%2&&n>6?.018:0),t);}s.lineTo(0,1.05);for(let i=n;i>=1;i--){const t=i/n;s.lineTo(-wf(t)-(i%2&&n>6?.018:0),t);}s.lineTo(0,0);return new THREE.ShapeGeometry(s,1);}
const LEAF_HI=leafletGeo(16),LEAF_LO=leafletGeo(4);
function fanParts(m0,c,fingers,lg){const out=[],F=fingers||7,ang=F===7?[-1.3,-.85,-.42,0,.42,.85,1.3]:[-1,-.5,0,.5,1],len=F===7?[.42,.68,.9,1,.9,.68,.42]:[.55,.85,1,.85,.55];
  for(let i=0;i<F;i++)out.push({g:lg||LEAF_HI,m:new THREE.Matrix4().multiplyMatrices(m0,M4(0,0,0,0,0,ang[i],len[i]*.8,len[i],1)),c:i%2?c[0]:c[1]});return out;}
const BUDG={};
function budGeo(id,lite){const k=id+(lite?'L':'');if(BUDG[k])return BUDG[k];const S_=STRAIN[id],P=[],sp=sph(.1,lite?6:12,lite?5:10),sm=sph(.05,lite?5:10,lite?4:8),tiny=sph(.013,4,3),hair=cyl(.006,.003,1,4);
  let r=7+id.charCodeAt(0)+id.length;const R=()=>(r=(r*16807)%2147483647)/2147483647;
  P.push({g:sp,m:M4(0,.2,0,0,0,0,1,1.9,1),c:S_.bud[1]});
  const n=lite?7:22;for(let i=0;i<n;i++){const k2=i/n,y=.04+k2*.36,a=i*2.4,rad=.105*(1-Math.abs(k2-.42)*1.2)+.02,x=Math.cos(a)*rad,z=Math.sin(a)*rad,s=(1-.45*k2)*(lite?1.4:1);
    P.push({g:sm,m:M4(x,y,z,0,a,0,s,s*1.35,s),c:i%3?S_.bud[0]:S_.bud[1]});
    if(!lite&&i%2===0)P.push({g:hair,m:M4dir(x*1.2,y+.03,z*1.2,x+(R()-.5)*.1,.6+R()*.6,z+(R()-.5)*.1,1,.07),c:S_.pist});}
  if(!lite){for(let i=0;i<5;i++){const a=i/5*6.283;P.push({g:LEAF_HI,m:M4(Math.cos(a)*.06,.02,Math.sin(a)*.06,-.6,-a+1.57,0,.09,.17,1),c:S_.leaf[0]});}
    for(let i=0;i<S_.frost;i++){const k2=R(),a=R()*6.283,rad=.11*(1-Math.abs(k2-.42)*1.2)+.04;P.push({g:tiny,m:M4(Math.cos(a)*rad,.05+k2*.36,Math.sin(a)*rad),c:'#ffffff'});}}
  return BUDG[k]=mergeParts(P);}
const PLANTG={};
function plantGeo(id,lite,nb){const k=id+(lite?'L':'')+(nb?'N':'');if(PLANTG[k])return PLANTG[k];const S_=STRAIN[id],P=[],H=S_.h,n=lite?3:S_.nodes,stem=cyl(.025,.04,1,lite?5:8),pet=cyl(.008,.01,1,4),LG=lite?LEAF_LO:LEAF_HI;
  P.push({g:stem,m:M4(0,H/2,0,0,0,0,1,H,1),c:'#5e8a34'});
  for(let j=0;j<n;j++){const y=.12+j*(H-.3)/n,sz=(.62-j*.07)*(id==='purple'?1.15:1)*(lite?1.15:1),yaw0=j*1.57+.4;
    for(const side of[0,Math.PI]){const yaw=yaw0+side,dx=-Math.sin(yaw),dz=-Math.cos(yaw),pl=.08+sz*.15;
      if(!lite)P.push({g:pet,m:M4dir(dx*pl/2,y+.02,dz*pl/2,dx,.25,dz,1,pl),c:'#6a9a3a'});
      fanParts(M4(dx*pl,y+.04,dz*pl,-Math.PI/2+.3+j*.08,yaw,0,sz),S_.leaf,lite?5:7,LG).forEach(q=>P.push(q));}}
  for(let i=0;i<(lite?2:4);i++)fanParts(M4(0,H-.08,0,-Math.PI/2+.9,i*1.57+.8,0,.28),S_.leaf,5,LG).forEach(q=>P.push(q));
  if(lite&&!nb)P.push({g:budGeo(id,true),m:M4(0,H-.15,0,0,0,0,1.6),c:null});
  return PLANTG[k]=mergeParts(P);}
// budGeo lite wird mit Farbe weiß zusammengeführt -> eigene Farben behalten
(function(){const orig=mergeParts;})();

/* ---------- Spielstand ---------- */
const KEY='hanf_imperium_v1';
const NPAR=30,PCOLS=20,PROWS=48,PN=PCOLS*PROWS,PX0=-46,PW=40,PLEN=96,PZ0=60,PSTEP=100;
function freshState(){return{money:300,day:1,time:.3,active:'lemon',
  seeds:{lemon:1},wet:{},dry:{},hash:{},rosin:{},joints:{},
  boxes:[{size:0,lamp:1,fan:false,auto:false,pots:[newPot()]}],
  rack:{cap:500,b:[]},sieve:false,press:false,
  hall:false,hallLamp:1,hallAuto:false,hallPots:Array.from({length:48},newPot),
  dryHall:0,fieldIrr:false,fieldFert:false,autoSow:true,
  parcels:Array.from({length:NPAR},()=>({own:false,strain:'lemon',st:'empty',g:0,hv:0})),
  staff:{gardener:0,worker:0,robot:0,tractor:0,harvester:0,truck:0},quad:false,
  market:Object.fromEntries(STRAINS.map(s=>[s.id,1])),sat:Object.fromEntries(STRAINS.map(s=>[s.id,0])),
  total:0,smoked:0,v:1};}
function newPot(){return{s:null,g:0,w:1,h:1};}
let S=freshState();
try{const j=JSON.parse(localStorage.getItem(KEY)||'null');if(j&&j.v===1){S=Object.assign(freshState(),j);}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
S.upgrades=Object.assign({growth:0,yield:0,drying:0,training:0,trade:0,logistics:0,boots:0},S.upgrades||{});
const BOX_SIZES=[{n:1,w:.9,h:1.8,grid:1},{n:4,w:1.4,h:2.0,grid:2},{n:9,w:1.9,h:2.1,grid:3}];
const LAMP=[0,1,1.6,2.4];
function addStock(kind,id,g,q){const o=S[kind][id]||(S[kind][id]={g:0,q:0});const t=o.g+g;o.q=t>0?(o.q*o.g+q*g)/t:q;o.g=t;}
function takeStock(kind,id,g){const o=S[kind][id];if(!o)return 0;const t=Math.min(o.g,g);o.g-=t;if(o.g<.01)delete S[kind][id];return t;}
const sumStock=kind=>Object.values(S[kind]).reduce((a,o)=>a+o.g,0);
const PRODUCT={dry:{n:'Blüten',mult:1},hash:{n:'Hasch',mult:5.5},rosin:{n:'Rosin',mult:6.5}};
function unitPrice(kind,id){const o=S[kind][id],q=o?o.q:.6;return STRAIN[id].price*(1+S.upgrades.trade*.05)*PRODUCT[kind].mult*(.5+q)*S.market[id]*Math.max(.35,1-S.sat[id]);}

/* ---------- UI: Toasts ---------- */
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;$('toasts').appendChild(e);setTimeout(()=>e.remove(),2600);while($('toasts').children.length>4)$('toasts').firstChild.remove();}

/* ---------- Kollision ---------- */
const COL=[];
function solid(x0,z0,x1,z1,grp){const c={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),grp};COL.push(c);return c;}
function collide(p,r){for(const c of COL){if(c.grp&&!c.grp.on)continue;const cx=clamp(p.x,c.x0,c.x1),cz=clamp(p.z,c.z0,c.z1),dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
  if(d2>=r*r)continue;if(d2>1e-8){const d=Math.sqrt(d2),k=(r-d)/d;p.x+=dx*k;p.z+=dz*k;}
  else{const l=p.x-c.x0,rt=c.x1-p.x,t=p.z-c.z0,b=c.z1-p.z,m=Math.min(l,rt,t,b);if(m===l)p.x=c.x0-r;else if(m===rt)p.x=c.x1+r;else if(m===t)p.z=c.z0-r;else p.z=c.z1+r;}}}

/* ---------- Interaktion ---------- */
const INTER=[];
function hitbox(w,h,d,x,y,z,parent,def){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial());m.visible=false;m.position.set(x,y,z);(parent||scene).add(m);m.userData.h=def;INTER.push(m);return m;}
const ray=new THREE.Raycaster();ray.far=3.4;

/* ---------- Materialien ---------- */
const WOOD=mat('#a8743e',{roughness:.75}),WOOD2=mat('#d0a066',{roughness:.7}),ALU=mat('#d8dde2',{metalness:.6,roughness:.3}),DARK=mat('#2a2e30',{roughness:.6}),
  CONC=mat('#9a968c',{roughness:.9}),WALL=mat('#d8d0c0',{roughness:.9}),ROOF=mat('#6a5a50',{roughness:.8}),SOIL=mat('#3a281a',{roughness:1});
function texCanvas(w,h,f,rep){const c=cnv(w,h),g=c.getContext('2d');f(g,w,h);const t=ctex(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;}
const noise=(g,w,h,n,cols)=>{for(let i=0;i<n;i++){g.fillStyle=cols[Math.floor(Math.random()*cols.length)];g.fillRect(Math.random()*w,Math.random()*h,2,2+Math.random()*3);}};
function signTex(lines,bg,fg,w,h){return texCanvas(w||512,h||200,(g,W,H)=>{g.fillStyle=bg||'#f4ecd4';g.fillRect(0,0,W,H);g.lineWidth=10;g.strokeStyle=fg||'#2f5a2a';g.strokeRect(5,5,W-10,H-10);
  g.fillStyle=fg||'#2f5a2a';g.textAlign='center';g.textBaseline='middle';lines.forEach((l,i)=>{g.font='900 '+(i?40:58)+'px Segoe UI,sans-serif';g.fillText(l,W/2,H/(lines.length+1)*(i+1));});});}
function boxM(w,h,d,m,x,y,z,p,r){const o=ms(r?box(w,h,d,r):new THREE.BoxGeometry(w,h,d),m,x,y,z,p);return o;}

/* ---------- Gelände ---------- */
const grassT=texCanvas(256,256,(g,w,h)=>{g.fillStyle='#5a9a3a';g.fillRect(0,0,w,h);noise(g,w,h,2600,['#4f8a34','#62a840','#6aa84a','#4a7a2e','#7ab854']);},[300,1100]);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(900,3400),new THREE.MeshStandardMaterial({map:grassT,roughness:.95,envMapIntensity:.4}));ground.rotation.x=-Math.PI/2;ground.position.set(0,0,1500);ground.receiveShadow=true;scene.add(ground);
const dirtT=texCanvas(128,128,(g,w,h)=>{g.fillStyle='#a88a5a';g.fillRect(0,0,w,h);noise(g,w,h,900,['#98784a','#b89a6a','#8a6a40']);},[2,600]);
const road=new THREE.Mesh(new THREE.PlaneGeometry(7,3180),new THREE.MeshStandardMaterial({map:dirtT,roughness:1,envMapIntensity:.3}));road.rotation.x=-Math.PI/2;road.position.set(0,.02,1580);road.receiveShadow=true;scene.add(road);
const yard=new THREE.Mesh(new THREE.PlaneGeometry(64,46),new THREE.MeshStandardMaterial({map:texCanvas(128,128,(g,w,h)=>{g.fillStyle='#a8a296';g.fillRect(0,0,w,h);noise(g,w,h,1200,['#9a9488','#b4aea2','#8a857a']);},[16,12]),roughness:.95,envMapIntensity:.3}));
yard.rotation.x=-Math.PI/2;yard.position.set(16,.015,6);yard.receiveShadow=true;scene.add(yard);
// Bäume (instanziert)
(function(){const N=900,trunk=new THREE.InstancedMesh(cyl(.25,.35,2.6,6),mat('#6a4a2a',{roughness:.9}),N),crown=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.6,1),mat('#3f7a2a',{roughness:.85,flatShading:true}),N);
  const m=new THREE.Matrix4();let k=0;for(let i=0;i<N;i++){let x,z;if(i<500){x=60+Math.random()*120;z=-80+Math.random()*3250;}else if(i<760){x=-70-Math.random()*90;z=-80+Math.random()*3250;}else{x=(Math.random()-.5)*240;z=-60-Math.random()*90;}
    const s=.8+Math.random()*.9;m.compose(new THREE.Vector3(x,1.3*s,z),new THREE.Quaternion(),new THREE.Vector3(s,s,s));trunk.setMatrixAt(k,m);m.compose(new THREE.Vector3(x,3.6*s,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.random()*6,0)),new THREE.Vector3(s*1.1,s*1.25,s*1.1));crown.setMatrixAt(k,m);
    const c=new THREE.Color().setHSL(.27+Math.random()*.06,.45,.25+Math.random()*.1);crown.setColorAt(k,c);k++;}
  trunk.castShadow=crown.castShadow=true;scene.add(trunk);scene.add(crown);})();

/* ---------- Gebäude-Helfer ---------- */
function building(x0,z0,x1,z1,h,doors,m,grp,roofM){const g=new THREE.Group();scene.add(g);const t=.25;
  const seg=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az);if(L<.05)return;const o=ms(new THREE.BoxGeometry(Math.abs(bx-ax)||t,h,Math.abs(bz-az)||t),m,(ax+bx)/2,h/2,(az+bz)/2,g);solid(ax-(ax===bx?t/2:0),az-(az===bz?t/2:0),bx+(ax===bx?t/2:0),bz+(az===bz?t/2:0),grp);};
  const side=(ax,az,bx,bz,ds)=>{ds=(ds||[]).slice().sort((a,b)=>a[0]-b[0]);let cur=0;const L=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/L,uz=(bz-az)/L;
    for(const[a,b]of ds){seg(ax+ux*cur,az+uz*cur,ax+ux*a,az+uz*a);const lin=ms(new THREE.BoxGeometry(ux?b-a:t,h-2.6,uz?b-a:t),m,ax+ux*(a+b)/2,2.6+(h-2.6)/2,az+uz*(a+b)/2,g);cur=b;}seg(ax+ux*cur,az+uz*cur,bx,bz);};
  side(x0,z0,x1,z0,doors.n);side(x0,z1,x1,z1,doors.s);side(x0,z0,x0,z1,doors.w);side(x1,z0,x1,z1,doors.e);
  const roof=ms(new THREE.BoxGeometry(x1-x0+.6,.2,z1-z0+.6),roofM||ROOF,(x0+x1)/2,h+.1,(z0+z1)/2,g);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),CONC);fl.rotation.x=-Math.PI/2;fl.position.set((x0+x1)/2,.03,(z0+z1)/2);fl.receiveShadow=true;g.add(fl);
  return g;}

/* ---------- Garage ---------- */
const GAR={on:true};
const GWALL=new THREE.MeshStandardMaterial({map:texCanvas(256,256,(g,w,h)=>{g.fillStyle='#cfc6b4';g.fillRect(0,0,w,h);noise(g,w,h,1500,['#c4bba8','#d8d0c0','#bdb4a0']);g.fillStyle='#8a7a66';g.fillRect(0,h-26,w,26);},[3,1]),roughness:.9});
const garage=building(-6,-5,6,5,3.2,{s:[[4.5,7.5]]},GWALL,GAR);
(function(){const t=texCanvas(256,256,(g,w,h)=>{g.fillStyle='#5a5e62';g.fillRect(0,0,w,h);noise(g,w,h,1800,['#4e5256','#666a6e','#54585c']);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=3;g.strokeRect(0,0,w,h);},[6,5]);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(12,10),new THREE.MeshStandardMaterial({map:t,roughness:.55,metalness:.1}));f.rotation.x=-Math.PI/2;f.position.set(0,.04,0);f.receiveShadow=true;scene.add(f);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.6),new THREE.MeshStandardMaterial({map:signTex(['GROW','or go home'],'#2f5a2a','#e8ffd0',300,400)}));p.position.set(-2.5,1.9,-4.86);scene.add(p);
  const p2=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.1),new THREE.MeshStandardMaterial({map:signTex(['LIZENZ','Anbau genehmigt'],'#f4ecd4','#8a5a12',400,280)}));p2.position.set(2.8,1.9,-4.86);scene.add(p2);})();
const gLight=new THREE.PointLight('#ffe8c0',.9,16,1.6);gLight.position.set(0,2.9,0);scene.add(gLight);
ms(sph(.12,10,8),mat('#fff6e0',{emissive:'#fff6e0',emissiveIntensity:2}),0,3.0,0,scene);
ms(new THREE.BoxGeometry(3,.05,.02),mat('#c8a050'),0,2.4,5.02,scene);
const gSign=new THREE.Mesh(new THREE.PlaneGeometry(3,.9),new THREE.MeshStandardMaterial({map:signTex(['GARAGE','Start-Growbox'])}));gSign.position.set(0,3.6,5.2);scene.add(gSign);
// Regale & Deko
for(const z of[0.2]){const sh=new THREE.Group();sh.position.set(-5.6,0,z);scene.add(sh);for(const y of[.4,1.2,2])boxM(.6,.05,1.6,WOOD2,0,y,0,sh);boxM(.05,2.2,.05,WOOD,0,1.1,-.78,sh);boxM(.05,2.2,.05,WOOD,0,1.1,.78,sh);
  for(let i=0;i<3;i++)ms(cyl(.12,.1,.22,12),mat('#c0683a'),0,.53,-.5+i*.5,sh);}

/* Growboxen */
const BOX_X=[0,-2.7,2.7,-5.1],BOX_Z=-3.3;
const BOXV=[];
function potMesh(parent){const g=new THREE.Group();parent.add(g);ms(cyl(.17,.14,.3,16),mat('#1e2020',{roughness:.9}),0,.15,0,g);ms(cyl(.155,.155,.02,16),SOIL,0,.29,0,g);
  ms(cyl(.185,.185,.035,20),mat('#454b48'),0,.285,0,g);ms(cyl(.19,.19,.025,20),mat('#272d2a'),0,.025,0,g);for(let i=0;i<8;i++){const a=i*Math.PI/4;ms(cyl(.007,.007,.22,5),mat('#555e57'),Math.sin(a)*.157,.155,Math.cos(a)*.157,g);}const pl=new THREE.Group();pl.position.y=.3;g.add(pl);return{g,pl,mesh:null,bud:null,sid:null};}
function updPlant(pv,pot,sc){if(!pot.s){if(pv.mesh){pv.pl.remove(pv.mesh);pv.pl.remove(pv.bud);pv.mesh=pv.bud=null;pv.sid=null;}return;}
  if(pv.sid!==pot.s){if(pv.mesh){pv.pl.remove(pv.mesh);pv.pl.remove(pv.bud);}pv.mesh=ms(plantGeo(pot.s),VC,0,0,0,pv.pl);pv.mesh.rotation.y=Math.random()*6;
    pv.bud=new THREE.Group();pv.pl.add(pv.bud);const H=STRAIN[pot.s].h;ms(budGeo(pot.s),VCF,0,H-.2,0,pv.bud,1.05);for(let i=0;i<4;i++){const a=i*1.57+.4;ms(budGeo(pot.s),VCF,-Math.sin(a)*.2,H*.55,-Math.cos(a)*.2,pv.bud,.5);}pv.sid=pot.s;}
  const g=pot.g,s=(.12+.88*Math.min(1,g/.5))*sc;pv.mesh.scale.setScalar(s);pv.bud.scale.setScalar(s*clamp((g-.5)/.5,0,1)+.0001);
  pv.mesh.rotation.x=pot.w<=0?.12:0;}
function buildBox(i){const b=S.boxes[i],sz=BOX_SIZES[b.size],g=new THREE.Group();g.position.set(BOX_X[i],0,BOX_Z);scene.add(g);
  const w=sz.w,h=sz.h,blk=mat('#151617',{roughness:.8}),sil=mat('#e8ecef',{metalness:.85,roughness:.35});
  for(const sx of[-1,1])for(const sz2 of[-1,1])ms(cyl(.015,.015,h,6),ALU,sx*w/2,h/2,sz2*w/2,g);
  boxM(w,h,.02,blk,0,h/2,-w/2,g);boxM(.02,h,w,blk,-w/2,h/2,0,g);boxM(.02,h,w,blk,w/2,h/2,0,g);boxM(w,.02,w,blk,0,h,0,g);
  boxM(w-.04,h-.02,.01,sil,0,h/2,-w/2+.02,g);boxM(.01,h-.02,w-.04,sil,-w/2+.02,h/2,0,g);boxM(.01,h-.02,w-.04,sil,w/2-.02,h/2,0,g);
  ms(cyl(.05,.05,w,10),blk,0,h-.05,w/2-.02,g).rotation.z=Math.PI/2;boxM(w,.05,w,blk,0,.025,0,g);
  const lc=['#ffd0f0','#fff0e0','#ffffff'][Math.max(0,b.lamp-1)];const lamp=boxM(w*.75,.05,w*.6,mat('#ffffff',{emissive:lc,emissiveIntensity:1.2+b.lamp*.5}),0,h-.12,0,g);
  const pl=new THREE.PointLight(lc,.6+b.lamp*.35,4,1.5);pl.position.set(0,h-.3,0);g.add(pl);
  if(b.fan){const f=new THREE.Group();f.position.set(w/2-.15,h-.35,-w/2+.15);g.add(f);ms(cyl(.12,.12,.08,16),blk,0,0,0,f).rotation.x=Math.PI/2;}
  if(b.auto)ms(cyl(.02,.02,w,6),mat('#2a5aa0'),0,.35,-w/2+.1,g).rotation.z=Math.PI/2;
  solid(BOX_X[i]-w/2,BOX_Z-w/2,BOX_X[i]+w/2,BOX_Z+w/2-.05);
  for(const x of[-w*.25,0,w*.25])boxM(.025,.012,w*.48,glowMat('#fff4ce',2),x,h-.151,0,g);boxM(.15,.22,.05,DARK,w/2+.03,h*.6,w*.2,g,.015);boxM(.09,.06,.008,glowMat('#75e4b2',.8),w/2+.03,h*.6+.04,w*.2+.03,g);
  const pots=[];const n=sz.grid;for(let r=0;r<n;r++)for(let c=0;c<n;c++){const pv=potMesh(g);pv.g.position.set((c-(n-1)/2)*(w/n),.05,(r-(n-1)/2)*(w/n));pots.push(pv);}
  while(b.pots.length<sz.n)b.pots.push(newPot());
  pots.forEach((pv,k)=>{const pot=b.pots[k];hitbox(.45,1.4,.45,pv.g.position.x,.7,pv.g.position.z,g,{pot,where:'box',box:i});});
  return{g,pots,box:i};}
function rebuildBoxes(){for(const v of BOXV){scene.remove(v.g);}BOXV.length=0;for(let i=INTER.length-1;i>=0;i--)if(INTER[i].userData.h.where==='box')INTER.splice(i,1);
  for(let i=COL.length-1;i>=0;i--)if(COL[i].box)COL.splice(i,1);const before=COL.length;
  S.boxes.forEach((b,i)=>BOXV.push(buildBox(i)));for(let i=before;i<COL.length;i++)COL[i].box=true;}

/* Trockengestell */
const RACK={x:-5.4,z:2.8};
const rackG=new THREE.Group();rackG.position.set(RACK.x,0,RACK.z);scene.add(rackG);
for(const z of[-.9,.9]){boxM(.06,2.1,.06,WOOD,-.3,1.05,z,rackG);boxM(.06,2.1,.06,WOOD,.3,1.05,z,rackG);}
for(const y of[1.3,1.65,2.0])for(const x of[-.3,.3])ms(cyl(.008,.008,1.8,4),mat('#e8e0c8'),x,y,0,rackG).rotation.x=Math.PI/2;
const rackBuds=[];for(let i=0;i<24;i++){const y=[1.3,1.65,2.0][i%3],x=i%2?.3:-.3,z=-.75+Math.floor(i/6)*.5;const b=new THREE.Group();b.position.set(x,y-.2,z);b.rotation.x=Math.PI;rackG.add(b);rackBuds.push(b);}
solid(RACK.x-.4,RACK.z-1,RACK.x+.4,RACK.z+1);
hitbox(.8,2,2,0,1,0,rackG,{rack:true});
/* Werkbank */
const BENCH={x:5.3,z:.5};const benchG=new THREE.Group();benchG.position.set(BENCH.x,0,BENCH.z);scene.add(benchG);
boxM(.9,.08,2.8,WOOD2,0,.92,0,benchG,.02);for(const z of[-1.3,1.3])for(const x of[-.35,.35])boxM(.07,.9,.07,WOOD,x,.45,z,benchG);
ms(cyl(.12,.12,.08,20),ALU,-.1,1.0,1,benchG);ms(cyl(.12,.12,.06,20),ALU,-.1,1.07,1,benchG);
const sieveG=new THREE.Group();sieveG.position.set(-.05,.96,.25);benchG.add(sieveG);boxM(.6,.12,.6,WOOD,0,.06,0,sieveG);boxM(.55,.01,.55,mat('#c8c8c8',{metalness:.7,roughness:.4}),0,.12,0,sieveG);
const pressG=new THREE.Group();pressG.position.set(-.05,.96,-.8);benchG.add(pressG);boxM(.45,.1,.4,mat('#3a3a3a',{metalness:.6}),0,.05,0,pressG);for(const x of[-.17,.17])ms(cyl(.025,.025,.6,8),ALU,x,.4,0,pressG);
boxM(.45,.08,.4,mat('#c03a2a',{metalness:.4}),0,.72,0,pressG);boxM(.3,.06,.3,ALU,0,.3,0,pressG);ms(cyl(.03,.03,.3,8),mat('#222'),.3,.75,0,pressG).rotation.z=Math.PI/2;
solid(BENCH.x-.45,BENCH.z-1.4,BENCH.x+.45,BENCH.z+1.4);
hitbox(.9,1.4,2.8,0,.7,0,benchG,{bench:true});
/* Laptop */
const desk=new THREE.Group();desk.position.set(3.6,0,3.9);scene.add(desk);boxM(1.4,.06,.7,WOOD2,0,.78,0,desk);for(const x of[-.62,.62])boxM(.06,.78,.6,WOOD,x,.39,0,desk);
boxM(.5,.02,.34,mat('#2a2a2e',{metalness:.5}),0,.82,.05,desk);const scr=boxM(.5,.32,.015,mat('#111',{emissive:'#4aa8ff',emissiveIntensity:.8}),0,.98,-.12,desk);scr.rotation.x=-.2;
ms(cyl(.18,.2,.45,14),mat('#2a2a2e'),0,.25,.6,desk);solid(2.9,3.55,4.3,4.25);
hitbox(1.4,1.4,.8,0,.7,0,desk,{laptop:true});

/* ---------- Indoor-Halle ---------- */
const HALL={on:false,x0:14,x1:44,z0:-14,z1:6};
const hallG=building(HALL.x0,HALL.z0,HALL.x1,HALL.z1,6,{s:[[13,17]]},mat('#e8ecef',{metalness:.3,roughness:.5}),HALL,mat('#c8ccd0',{metalness:.5,roughness:.4}));
const hallLights=[];for(let i=0;i<2;i++){const l=new THREE.PointLight('#ffffff',.0,30,1.4);l.position.set(22+i*14,5,-4);scene.add(l);hallLights.push(l);}
const HALLP=[];(function(){const g=new THREE.Group();hallG.add(g);for(let r=0;r<4;r++){const z=-11+r*4.2;boxM(24,.1,1.4,ALU,29,.7,z,g);for(const x of[17.5,29,40.5])boxM(.08,.7,1.2,ALU,x,.35,z,g);
    solid(17,z-.7,41,z+.7,HALL);boxM(23,.06,.4,mat('#ffffff',{emissive:'#ffd8f0',emissiveIntensity:1.6}),29,3.3,z,g);for(const x of[18,40])ms(cyl(.015,.015,2.6,4),ALU,x,4.6,z,g);
    for(let c=0;c<12;c++){const pv=potMesh(g);pv.g.position.set(18+c*2,.75,z);HALLP.push(pv);const pot=S.hallPots[r*12+c];hitbox(.6,1.4,.8,18+c*2,1.4,z,g,{pot,where:'hall'});}}})();
const hallSign=new THREE.Mesh(new THREE.PlaneGeometry(4,1.3),new THREE.MeshStandardMaterial({map:signTex(['INDOOR-HALLE','48 Pflanzplätze · 30.000 €'])}));hallSign.position.set(29,1.4,HALL.z1+1.2);scene.add(hallSign);
const hallSlab=new THREE.Mesh(new THREE.PlaneGeometry(30,20),CONC);hallSlab.rotation.x=-Math.PI/2;hallSlab.position.set(29,.025,-4);scene.add(hallSlab);
hitbox(4,2,.4,29,1.2,HALL.z1+1.2,null,{hallSign:true});
/* ---------- Trockenhalle ---------- */
const DRY={on:false,x0:14,x1:34,z0:16,z1:30};
const dryG=building(DRY.x0,DRY.z0,DRY.x1,DRY.z1,5,{w:[[5,9]]},mat('#b89a6a',{roughness:.85}),DRY,mat('#5a4a3a'));
(function(){for(let r=0;r<3;r++)for(let i=0;i<40;i++){const b=ms(budGeo(STRAINS[i%8].id,true),VCF,16+i*.42,3.6-r*.6,19+r*3.5,dryG,1.1);b.rotation.x=Math.PI;b.castShadow=false;}
  for(let r=0;r<3;r++){const l=ms(cyl(.01,.01,17,4),mat('#e8e0c8'),24,3.85-r*.6,19+r*3.5,dryG);l.rotation.z=Math.PI/2;}
  for(const z of[19,22.5,26])boxM(17,.05,.05,ALU,24,4,z,dryG);})();
const drySign=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.3),new THREE.MeshStandardMaterial({map:signTex(['TROCKENHALLE','Trocknet Feldernte · 60.000 €'])}));drySign.position.set(DRY.x0-1.4,1.4,23);drySign.rotation.y=-Math.PI/2;scene.add(drySign);
const drySlab=new THREE.Mesh(new THREE.PlaneGeometry(20,14),CONC);drySlab.rotation.x=-Math.PI/2;drySlab.position.set(24,.025,23);scene.add(drySlab);
hitbox(.4,2,3.6,DRY.x0-1.4,1.2,23,null,{drySign:true});

/* ---------- Felder ---------- */
const PAR=[];const PSRC=[];
const soilT=texCanvas(128,128,(g,w,h)=>{g.fillStyle='#6a4a2e';g.fillRect(0,0,w,h);noise(g,w,h,600,['#5a3e26','#7a5a3a','#4a3220']);g.fillStyle='rgba(40,26,14,.5)';for(let x=0;x<w;x+=64)g.fillRect(x+24,0,16,h);},[PCOLS/2,PROWS/2]);
const soilM=new THREE.MeshStandardMaterial({map:soilT,roughness:1,envMapIntensity:.3});
const fenceM=mat('#b08a58',{roughness:.8});
for(let i=0;i<NPAR;i++){const z0=PZ0+i*PSTEP,cz=z0+PLEN/2;const g=new THREE.Group();scene.add(g);
  const soil=new THREE.Mesh(new THREE.PlaneGeometry(PW+2,PLEN+2),soilM);soil.rotation.x=-Math.PI/2;soil.position.set(PX0+PW/2-1,.025,cz);soil.receiveShadow=true;g.add(soil);
  for(const z of[z0-2,z0+PLEN+2])for(let x=PX0-2;x<=PX0+PW;x+=4){const p=ms(new THREE.BoxGeometry(.14,1.1,.14),fenceM,x,.55,z,g);p.castShadow=false;}
  for(const z of[z0-2,z0+PLEN+2])for(const y of[.45,.9]){const r=ms(new THREE.BoxGeometry(PW+2,.08,.06),fenceM,PX0+PW/2-1,y,z,g);r.castShadow=false;}
  const st=new THREE.Group();st.position.set(-4.2,0,z0+6);scene.add(st);boxM(.12,2.4,.12,WOOD,0,1.2,0,st);
  const sc_=cnv(512,256),sm=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),new THREE.MeshStandardMaterial({map:ctex(sc_)}));boxM(.06,1.3,2.5,WOOD,0,2.1,0,st);sm.position.set(.04,2.1,0);sm.rotation.y=Math.PI/2;st.add(sm);
  hitbox(.6,3,2.6,-4.2,1.5,z0+6,null,{parcel:i});
  const canopy=new THREE.Mesh(new THREE.PlaneGeometry(PW,PLEN),new THREE.MeshStandardMaterial({color:'#4f8a34',roughness:1}));canopy.rotation.x=-Math.PI/2;canopy.position.set(PX0+PW/2-1,.6,cz);canopy.visible=false;scene.add(canopy);
  PAR.push({z0,cz,g,signC:sc_,signM:sm,canopy,flags:new Uint8Array(PN),key:'',im:null});}
function paintParcelSign(i){const p=S.parcels[i],P=PAR[i],g=P.signC.getContext('2d');
  const key=[p.own,p.st,p.strain,Math.round(p.g*20),p.hv].join('|');if(P.key===key)return;P.key=key;
  g.fillStyle=p.own?'#f4ecd4':'#e8e0d0';g.fillRect(0,0,512,256);g.lineWidth=12;g.strokeStyle=p.own?'#2f5a2a':'#8a6a3a';g.strokeRect(6,6,500,244);g.fillStyle='#2f3a2a';g.textAlign='center';
  g.font='900 56px Segoe UI,sans-serif';g.fillText('Feld '+(i+1),256,70);g.font='700 36px Segoe UI,sans-serif';
  if(!p.own){g.fillText('Zu verkaufen',256,135);g.fillStyle='#8a5a12';g.fillText(fmt(parcelPrice(i))+' €',256,190);}
  else{g.fillText(STRAIN[p.strain].name,256,130);g.fillText(p.st==='empty'?'leer':p.st==='grow'?'wächst '+Math.round(p.g*100)+' %':'reif · '+Math.round((1-p.hv/PN)*100)+' % übrig',256,185);}
  P.signM.material.map.needsUpdate=true;}
const parcelPrice=i=>Math.round(20000*Math.pow(1.22,i)/100)*100;
function plantMatrix(i,pi,j,s,m){const h=Math.sin(i*12.9898+j*78.233+pi*3.1)*43758.5453,f=h-Math.floor(h);m.compose(new THREE.Vector3(PX0+i*2+(f-.5)*.5,0,PAR[pi].z0+1+j*2+(f*7%1-.5)*.5),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,f*6.28,0)),new THREE.Vector3(s,s*(.9+f*.25),s));return m;}
const IMPOOL=[];
function parcelScale(p){return p.st==='empty'?0:.15+.85*Math.min(1,p.g/.55);}
function refreshParcelMesh(pi,force){const P=PAR[pi],p=S.parcels[pi];if(!P.im)return;const s=parcelScale(p),nb=p.g<.5,key=p.strain+'|'+Math.round(s*20)+'|'+p.st+nb;
  if(!force&&P.imKey===key&&!P.dirty)return;P.imKey=key;P.dirty=false;const im=P.im;const gg=plantGeo(p.strain,true,nb);if(im.geometry!==gg)im.geometry=gg;
  const m=new THREE.Matrix4();for(let j=0;j<PROWS;j++)for(let i=0;i<PCOLS;i++){const k=j*PCOLS+i;plantMatrix(i,pi,j,P.flags[k]?0:s,m);im.setMatrixAt(k,m);}im.instanceMatrix.needsUpdate=true;}
function updateParcelLOD(pz){for(let pi=0;pi<NPAR;pi++){const P=PAR[pi],p=S.parcels[pi],d=Math.abs(pz-P.cz),near=d<190&&p.own&&p.st!=='empty';
    if(near&&!P.im){const im=IMPOOL.pop()||new THREE.InstancedMesh(plantGeo(p.strain,true),VC,PN);im.castShadow=false;im.receiveShadow=true;im.frustumCulled=false;scene.add(im);P.im=im;refreshParcelMesh(pi,true);}
    else if(!near&&P.im){scene.remove(P.im);IMPOOL.push(P.im);P.im=null;P.imKey='';}
    P.canopy.visible=!near&&p.own&&p.st!=='empty';if(P.canopy.visible){P.canopy.position.y=.1+parcelScale(p)*.9;P.canopy.material.color.set(p.st==='ripe'?STRAIN[p.strain].bud[0]:'#4f8a34');}
    if(P.im)refreshParcelMesh(pi);}}
function resetFlags(pi){PAR[pi].flags.fill(0);const hv=S.parcels[pi].hv;for(let k=0;k<hv;k++)PAR[pi].flags[k]=1;PAR[pi].dirty=true;}
S.parcels.forEach((p,i)=>resetFlags(i));
function harvestPlant(pi,k){const P=PAR[pi],p=S.parcels[pi];if(p.st!=='ripe'||P.flags[k])return 0;P.flags[k]=1;p.hv++;P.dirty=true;
  const q=clamp(.45+(S.fieldIrr?.12:0)+(S.fieldFert?.1:0),0,1),g=60*(1+S.upgrades.yield*.12)*STRAIN[p.strain].yield*(S.fieldFert?1.15:1);addStock('wet',p.strain,g,q);S.total+=0;
  if(p.hv>=PN){p.st='empty';p.g=0;p.hv=0;P.flags.fill(0);P.dirty=true;toast('Feld '+(pi+1)+' komplett geerntet');}return g;}

/* ---------- Figuren & Fahrzeuge ---------- */
function walkAnim(p,mv,ph,t){const ws=mv?Math.sin(t*10+ph):0;p.hips[0].rotation.x=ws*.7;p.hips[1].rotation.x=-ws*.7;p.arms[0].rotation.x=-ws*.6;p.arms[1].rotation.x=ws*.6;p.body.position.y=mv?Math.abs(Math.cos(t*10+ph))*.05:Math.sin(t*2.5+ph)*.01;}
const WORKER_LOOKS=[{skin:'#e8b890',shirt:'#3f8a4a',pants:'#4a4030',hair:'#2a1a10',hat:'cap',hatCol:'#2f6a3a',gloves:'#d8c8a0'},{skin:'#c8865a',shirt:'#e8c84a',pants:'#3a5a3a',hair:'#1a1210',style:'curly',hat:'straw'},{skin:'#f6d2b0',shirt:'#5a8ad8',pants:'#3a3a48',hair:'#a8582a',style:'bun',hat:'cap',hatCol:'#e8c84a'},{skin:'#8a5a3a',shirt:'#d85a3a',pants:'#2a2a30',hair:'#14100c',hat:'beanie',hatCol:'#3a8a4a'}];
function mkRobot(){const g=new THREE.Group();boxM(.9,.35,1.1,mat('#f4f6f8',{metalness:.3,roughness:.35}),0,.45,0,g,.08);boxM(.92,.06,1.12,mat('#8fd65a',{emissive:'#8fd65a',emissiveIntensity:.6}),0,.45,0,g);
  for(const x of[-.5,.5])for(const z of[-.4,.4]){const w=ms(cyl(.2,.2,.14,16),mat('#222'),x,.2,z,g);w.rotation.z=Math.PI/2;}
  ms(cyl(.05,.05,.7,8),ALU,0,.95,.2,g);const arm=ms(cyl(.04,.04,.6,8),ALU,0,1.25,.45,g);arm.rotation.x=1;boxM(.15,.12,.15,mat('#ffb04a'),0,1.15,.72,g);
  boxM(.35,.2,.25,mat('#1a1e22'),0,.75,-.3,g,.04);for(const x of[-.08,.08])ms(sph(.03,8,6),mat('#8fd65a',{emissive:'#8fd65a',emissiveIntensity:1.5}),x,.78,-.17,g);return g;}
function wheel(r,w,x,y,z,p){const o=ms(cyl(r,r,w,20),mat('#1e1e1e',{roughness:.8}),x,y,z,p);o.rotation.z=Math.PI/2;ms(cyl(r*.55,r*.55,w+.02,12),mat('#c8ccd0',{metalness:.7,roughness:.3}),x,y,z,p).rotation.z=Math.PI/2;for(let i=0;i<12;i++){const a=i*Math.PI/6;const lug=ms(box(.025,.065,w+.04,.008),mat('#303332'),x,y+Math.cos(a)*r,z+Math.sin(a)*r,p);lug.rotation.x=-a;}ms(cyl(r*.15,r*.15,w+.06,8),mat('#e0b557',{metalness:.75}),x,y,z,p).rotation.z=Math.PI/2;return o;}
function mkQuad(){const g=new THREE.Group(),b=new THREE.Group();g.add(b);boxM(1.0,.35,1.7,mat('#c0392b',{metalness:.3,roughness:.35}),0,.7,0,b,.12);boxM(.5,.15,.8,mat('#1e1e1e'),0,.95,-.15,b,.06);
  boxM(1.1,.08,.5,mat('#2a2a2a'),0,.85,.7,b);boxM(1.1,.08,.5,mat('#2a2a2a'),0,.85,-.75,b);ms(cyl(.03,.03,.8,8),mat('#222'),0,1.2,.55,b).rotation.z=Math.PI/2;ms(cyl(.03,.03,.35,8),mat('#222'),0,1.05,.55,b).rotation.x=.4;
  for(const x of[-.3,.3])ms(sph(.07,10,8),mat('#ffffff',{emissive:'#fff8d0',emissiveIntensity:1.2}),x,.78,.86,b);
  const W=[];for(const x of[-.6,.6])for(const z of[-.6,.62])W.push(wheel(.32,.28,x,.32,z,g));return{g,W,r:1.3,speed:20,cam:[0,2.6,-5.2],seat:1.25};}
function mkHarvester(){const g=new THREE.Group(),G=mat('#3a8a3a',{metalness:.3,roughness:.4}),Y=mat('#e8c84a',{metalness:.3,roughness:.4});
  boxM(3,2.2,5,G,0,2.0,-.6,g,.2);boxM(2.2,1.6,1.8,G,0,3.6,-1.6,g,.2);
  boxM(1.8,1.5,1.6,new THREE.MeshStandardMaterial({color:'#bfefff',transparent:true,opacity:.4,roughness:.05,metalness:.2}),0,3.7,1.2,g,.12);boxM(1.9,.15,1.8,G,0,4.5,1.2,g);boxM(1.9,.9,1.7,G,0,2.9,1.2,g,.1);
  ms(cyl(.12,.12,1.2,10),mat('#333'),1,4.9,-2.6,g);
  const head=new THREE.Group();head.position.set(0,.9,3.2);g.add(head);boxM(6,.3,1.4,Y,0,0,0,head,.06);boxM(6,.8,.12,Y,0,.4,-.65,head);
  const reel=new THREE.Group();reel.position.set(0,.75,.3);head.add(reel);for(let i=0;i<6;i++){const bb=ms(cyl(.03,.03,5.8,6),mat('#ddd'),0,0,0,reel);bb.rotation.z=Math.PI/2;bb.position.set(0,Math.sin(i)*.45,Math.cos(i)*.45);}
  for(let i=-2.7;i<=2.7;i+=.45)ms(cone(.06,.5,4),ALU,i,.05,.75,head).rotation.x=Math.PI/2;
  const W=[wheel(.9,.6,-1.6,.9,1.2,g),wheel(.9,.6,1.6,.9,1.2,g),wheel(.55,.4,-1.4,.55,-2.6,g),wheel(.55,.4,1.4,.55,-2.6,g)];
  return{g,W,reel,r:3,speed:7,cam:[0,8,-12],seat:4.2,harvest:true};}
function mkTractor(){const g=new THREE.Group(),R=mat('#c0392b',{metalness:.3,roughness:.4});boxM(1.3,1,2.4,R,0,1.2,.6,g,.15);boxM(1.4,1.5,1.3,new THREE.MeshStandardMaterial({color:'#bfefff',transparent:true,opacity:.4}),0,2.2,-.5,g,.1);boxM(1.5,.1,1.4,R,0,3,-.5,g);
  wheel(.85,.5,-.9,.85,-.6,g);wheel(.85,.5,.9,.85,-.6,g);wheel(.5,.35,-.75,.5,1.4,g);wheel(.5,.35,.75,.5,1.4,g);boxM(3.6,.3,.6,mat('#555'),0,.5,-2.2,g);return g;}
function mkTruck(){const g=new THREE.Group();boxM(2.4,2.4,5,mat('#f4f6f8',{roughness:.4}),0,2,-1,g,.1);boxM(2.3,1.9,1.9,mat('#2f6a3a',{metalness:.3,roughness:.35}),0,1.7,2.6,g,.2);
  boxM(2,.8,.05,new THREE.MeshStandardMaterial({color:'#bfefff',transparent:true,opacity:.6}),0,2.2,3.56,g);const t=new THREE.Mesh(new THREE.PlaneGeometry(4,1.4),new THREE.MeshStandardMaterial({map:signTex(['HANF-IMPERIUM','Lieferdienst'],'#f4f6f8','#2f6a3a')}));t.position.set(1.21,2.3,-1);t.rotation.y=Math.PI/2;g.add(t);
  boxM(2.4,.16,.18,ALU,0,.8,3.6,g,.03);for(const x of[-.85,.85]){boxM(.35,.2,.05,glowMat('#fff0c2',1.3),x,1.15,3.58,g,.025);boxM(.16,.3,.05,glowMat('#ff4c39',.5),x,1,-3.53,g,.025);}for(const y of[1.3,1.7,2.1,2.5,2.9])boxM(2.3,.025,.025,ALU,0,y,-3.51,g);
  for(const z of[2.4,-2.5])for(const x of[-1.1,1.1])wheel(.5,.35,x,.5,z,g);return g;}
// Fahrzeuge des Spielers
const VEH=[];
function addVehicle(kind,x,z,yaw){const v=kind==='quad'?mkQuad():mkHarvester();v.kind=kind;v.x=x;v.z=z;v.yaw=yaw||0;v.v=0;v.g.position.set(x,0,z);v.g.rotation.y=v.yaw;scene.add(v.g);VEH.push(v);return v;}
let quadV=null,harvV=null;
function syncVehicles(){if(S.quad&&!quadV)quadV=addVehicle('quad',9,9,Math.PI);if(S.staff.harvester>0&&!harvV)harvV=addVehicle('harv',-14,30,Math.PI);}
// Personal-Figuren
const STAFFV={gardeners:[],workers:[],robots:[],harvesters:[],tractors:[],trucks:[]};
function syncStaffMeshes(){const need={gardeners:S.staff.gardener,workers:Math.min(S.staff.worker,24),robots:Math.min(S.staff.robot,16),harvesters:Math.max(0,S.staff.harvester-1),tractors:S.staff.tractor,trucks:S.staff.truck};
  for(const k in need){const arr=STAFFV[k];while(arr.length<need[k]){let o;if(k==='gardeners'||k==='workers'){const p=mkPerson(WORKER_LOOKS[arr.length%4]);o={g:p.root,p};}else if(k==='robots')o={g:mkRobot()};else if(k==='harvesters'){const h=mkHarvester();o={g:h.g,reel:h.reel};}else if(k==='tractors')o={g:mkTractor()};else o={g:mkTruck()};
      o.x=k==='trucks'?3:k==='gardeners'?arr.length:-8+arr.length;o.z=k==='trucks'?20:k==='gardeners'?2:12;o.g.position.set(o.x,0,o.z);scene.add(o.g);arr.push(o);}}}

/* ---------- Spieler ---------- */
const PL={x:0,z:.2,yaw:0,pitch:-.12,vy:0,veh:null};
const keys={};let locked=false,uiOpen=false,started=false;
addEventListener('keydown',e=>{if(!started)return;if(e.target.matches('input,select,textarea')){if(e.code==='Escape')closePanel();return;}if(e.code==='F2'){e.preventDefault();openTablet('admin');return;}keys[e.code]=true;
  if(e.code==='Tab'){e.preventDefault();}
  if(uiOpen){if(e.code==='Escape'||e.code==='KeyT'||e.code==='Tab')closePanel();return;}
  if(e.code==='KeyE')interact();if(e.code==='KeyF')toggleVehicle();if(e.code==='KeyQ')cycleSeed();if(e.code==='KeyT'||e.code==='Tab')openTablet('markt');if(e.code==='KeyJ')smokeBest();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('mousemove',e=>{if(!locked)return;PL.yaw-=e.movementX*.0022;PL.pitch=clamp(PL.pitch-e.movementY*.0022,-1.4,1.4);});
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===cv;if(!locked&&started&&!uiOpen)$('pause').classList.remove('hidden');});
function lock(){try{cv.requestPointerLock();}catch(e){}}
cv.addEventListener('click',()=>{if(started&&!uiOpen)lock();});
$('play').onclick=()=>{started=true;$('start').classList.add('hidden');$('hud').classList.remove('hidden');lock();toast('Willkommen! Geh zur Growbox und drücke E zum Pflanzen.');};
$('resume').onclick=()=>{$('pause').classList.add('hidden');lock();};
$('resetBtn').onclick=()=>{if(confirmReset()){localStorage.removeItem(KEY);location.reload();}};
let resetArm=0;function confirmReset(){if(Date.now()-resetArm<3000)return true;resetArm=Date.now();$('resetBtn').textContent='Wirklich löschen? Nochmal klicken';return false;}

function cycleSeed(){const ids=STRAINS.map(s=>s.id).filter(id=>(S.seeds[id]||0)>0);const all=ids.length?ids:STRAINS.map(s=>s.id);const i=all.indexOf(S.active);S.active=all[(i+1)%all.length];toast('Aktive Sorte: '+STRAIN[S.active].name);}

/* ---------- Interaktion ---------- */
let hover=null;
function lookTarget(){if(PL.veh)return null;ray.setFromCamera({x:0,y:0},camera);const h=ray.intersectObjects(INTER,false);for(const x of h){const d=x.object.userData.h;if(d.where==='hall'&&!S.hall)continue;if(d.where==='box'&&!BOXV.some(v=>v.g===x.object.parent))continue;return d;}return null;}
function potInfo(pot){if(!pot.s)return null;const st=pot.g<.15?'Keimling':pot.g<.5?'Wachstum':pot.g<1?'Blüte':'erntereif';return STRAIN[pot.s].name+' · '+st+(pot.g<1?' '+Math.round(pot.g*100)+' %':'')+' · Wasser '+Math.round(pot.w*100)+' %';}
function promptFor(d){if(!d)return'';
  if(d.pot){const p=d.pot;if(!p.s)return(S.seeds[S.active]||0)>0?['[E] '+STRAIN[S.active].name+' pflanzen',(S.seeds[S.active])+' Samen · [Q] Sorte wechseln']:['Keine Samen von '+STRAIN[S.active].name,'[T] im Shop kaufen · [Q] Sorte wechseln'];
    if(p.g>=1)return['[E] Ernten',potInfo(p)];return[p.w<.9?'[E] Gießen':'',potInfo(p)];}
  if(d.rack){const wet=sumStock('wet'),dr=S.rack.b.filter(b=>b.t<=0).reduce((a,b)=>a+b.g,0),hang=S.rack.b.reduce((a,b)=>a+b.g,0);
    return[dr>0?'[E] Getrocknetes abnehmen':wet>0&&hang<S.rack.cap?'[E] Nasse Blüten aufhängen':'Trockengestell','hängt '+fmtG(hang)+' / '+fmtG(S.rack.cap)+(wet>0?' · nass im Lager '+fmtG(wet):'')];}
  if(d.bench)return['[E] Werkbank: verarbeiten','Hasch sieben, Rosin pressen, Joints drehen'];
  if(d.laptop)return['[E] Laptop öffnen','Markt, Shop, Personal, Karte'];
  if(d.hallSign)return S.hall?['Indoor-Halle','48 Plätze · Eingang vorne']:['[E] Indoor-Halle kaufen','30.000 €'];
  if(d.drySign)return S.dryHall?['Trockenhalle Stufe '+S.dryHall,'trocknet automatisch · nass im Lager '+fmtG(sumStock('wet'))]:['[E] Trockenhalle kaufen','60.000 € · trocknet Feldernte automatisch'];
  if(d.parcel!==undefined){const i=d.parcel,p=S.parcels[i];if(!p.own)return['[E] Feld '+(i+1)+' kaufen: '+fmt(parcelPrice(i))+' €','40 × 96 m · '+PN+' Pflanzen'];
    if(p.st==='empty')return['[E] Aussäen: '+STRAIN[S.active].name,'Saatgut '+fmt(sowCost(S.active))+' € · [Q] Sorte wechseln'];
    if(p.st==='grow')return['Feld '+(i+1)+': '+STRAIN[p.strain].name,'wächst '+Math.round(p.g*100)+' %'];
    return['Feld '+(i+1)+' erntereif','Mit dem Mähdrescher fahren oder Personal einstellen'];}
  return'';}
const sowCost=id=>Math.round(STRAIN[id].seed*PN*.12);
function interact(){const d=hover;if(!d)return;
  if(d.pot){const p=d.pot;
    if(!p.s){if((S.seeds[S.active]||0)>0){S.seeds[S.active]--;p.s=S.active;p.g=0;p.w=1;p.h=1;toast(STRAIN[p.s].name+' gepflanzt');}else openTablet('shop');return;}
    if(p.g>=1){harvestPot(p,d.where==='hall'?hallQ():boxQ(d.box));return;}
    p.w=1;toast('Gegossen');return;}
  if(d.rack){rackUse(true);return;}
  if(d.bench){openBench();return;}
  if(d.laptop){openTablet('markt');return;}
  if(d.hallSign&&!S.hall){buy(30000,()=>{S.hall=true;applyBuildings();toast('Indoor-Halle gekauft!');});return;}
  if(d.drySign&&!S.dryHall){buy(60000,()=>{S.dryHall=1;applyBuildings();toast('Trockenhalle gekauft!');});return;}
  if(d.parcel!==undefined){const i=d.parcel,p=S.parcels[i];
    if(!p.own){buy(parcelPrice(i),()=>{p.own=true;toast('Feld '+(i+1)+' gekauft!');});return;}
    if(p.st==='empty'){buy(sowCost(S.active),()=>{p.strain=S.active;p.st='grow';p.g=0;p.hv=0;resetFlags(i);toast('Feld '+(i+1)+': '+STRAIN[p.strain].name+' ausgesät');});}}}
function buy(c,f){if(S.money<c){toast('Nicht genug Geld ('+fmt(c)+' € nötig)');return false;}S.money-=c;f();save();refreshPanel();return true;}
const boxQ=i=>{const b=S.boxes[i];return clamp(.45+b.lamp*.1+(b.fan?.12:0)+b.size*.04,0,1);};
const hallQ=()=>clamp(.55+S.hallLamp*.1+(S.hallAuto?.05:0),0,1);
function harvestPot(p,q){const qq=q*(.6+.4*p.h),g=100*(1+S.upgrades.yield*.12)*STRAIN[p.s].yield*(.6+.4*qq);addStock('wet',p.s,g,qq);toast('+'+fmtG(g)+' nasse '+STRAIN[p.s].name);p.s=null;p.g=0;p.w=1;p.h=1;}
function rackUse(manual){let done=0;S.rack.b=S.rack.b.filter(b=>{if(b.t<=0){addStock('dry',b.s,b.g*.25,b.q);done+=b.g*.25;return false;}return true;});
  let hung=0;let free=S.rack.cap-S.rack.b.reduce((a,b)=>a+b.g,0);for(const id in S.wet){if(free<=0)break;const q=S.wet[id].q,t=takeStock('wet',id,free);if(t>0){S.rack.b.push({s:id,g:t,q,t:60});free-=t;hung+=t;}}
  if(manual){if(done)toast('+'+fmtG(done)+' getrocknete Blüten');if(hung)toast(fmtG(hung)+' zum Trocknen aufgehängt');if(!done&&!hung)toast(S.rack.b.length?'Trocknet noch …':'Keine nassen Blüten im Lager');}}

/* ---------- Fahrzeuge ---------- */
function toggleVehicle(){if(PL.veh){const v=PL.veh;PL.veh=null;PL.x=v.x+Math.cos(v.yaw)*(v.r+.6);PL.z=v.z-Math.sin(v.yaw)*(v.r+.6);PL.yaw=v.yaw;toast('Ausgestiegen');return;}
  let best=null,bd=1e9;for(const v of VEH){const d=Math.hypot(v.x-PL.x,v.z-PL.z);if(d<v.r+2.2&&d<bd){bd=d;best=v;}}
  if(best){PL.veh=best;best.v=0;toast(best.kind==='quad'?'Quad: W/S Gas, A/D lenken, F aussteigen':'Mähdrescher: über reife Felder fahren erntet automatisch');}}
function driveVehicle(v,dt){const acc=(keys.KeyW?1:0)-(keys.KeyS?1:0),st=(keys.KeyA?1:0)-(keys.KeyD?1:0);
  v.v+=acc*v.speed*1.2*dt;v.v*=Math.pow(.35,dt);v.v=clamp(v.v,-v.speed*.4,v.speed);v.yaw+=st*dt*(v.kind==='quad'?2.2:.9)*clamp(v.v/4,-1,1);
  const p={x:v.x+Math.sin(v.yaw)*v.v*dt,z:v.z+Math.cos(v.yaw)*v.v*dt};collide(p,v.r*.8);v.x=clamp(p.x,-200,200);v.z=clamp(p.z,-60,3180);
  v.g.position.set(v.x,0,v.z);v.g.rotation.y=v.yaw;v.W.forEach(w=>w.rotation.x+=v.v*dt/.5);
  if(v.harvest){v.reel.rotation.x+=dt*3;harvestUnder(v);}}
function harvestUnder(v){const hx=v.x+Math.sin(v.yaw)*3.6,hz=v.z+Math.cos(v.yaw)*3.6;let got=0;
  for(let pi=0;pi<NPAR;pi++){const P=PAR[pi],p=S.parcels[pi];if(p.st!=='ripe'||Math.abs(hz-P.cz)>PLEN/2+4)continue;
    const ci=Math.round((hx-PX0)/2),cj=Math.round((hz-P.z0-1)/2);for(let i=ci-2;i<=ci+2;i++)for(let j=cj-2;j<=cj+2;j++){if(i<0||j<0||i>=PCOLS||j>=PROWS)continue;
      const px=PX0+i*2,pz=P.z0+1+j*2,dx=px-hx,dz=pz-hz,lat=Math.abs(dx*Math.cos(v.yaw)-dz*Math.sin(v.yaw)),lon=Math.abs(dx*Math.sin(v.yaw)+dz*Math.cos(v.yaw));
      if(lat<3&&lon<1.5)got+=harvestPlant(pi,j*PCOLS+i);}}
  if(got>0){v.got=(v.got||0)+got;if(v.got>3000){toast('+'+fmtG(v.got)+' nasse Ernte');v.got=0;}}}

/* ---------- Werkbank ---------- */
function openBench(){openPanel(()=>{let h=`<div class="hd"><h2>🧰 Werkbank</h2><div class="m">${fmt(S.money)} €</div></div><p class="note">Aus getrockneten Blüten werden Hasch (Siebstation), Rosin (Presse) und Joints. Verarbeitete Ware bringt mehr Geld pro Gramm Blüte.</p>`;
  const ids=Object.keys(S.dry);if(!ids.length)h+='<p>Keine getrockneten Blüten. Erst ernten und am Trockengestell trocknen.</p>';
  for(const id of ids){const o=S.dry[id],s=STRAIN[id];h+=`<div class="row"><i class="sw" style="background:${s.bud[0]}"></i><div class="tx"><b>${s.name}</b><span>${fmtG(o.g)} trocken · Qualität ${Math.round(o.q*100)} %</span></div>
    <button class="btn g" data-a="joint" data-id="${id}" ${o.g<1?'disabled':''}>Joint drehen</button>
    <button class="btn" data-a="hash" data-id="${id}" ${!S.sieve?'disabled title="Siebstation im Shop kaufen"':''}>Hasch sieben</button>
    <button class="btn" data-a="rosin" data-id="${id}" ${!S.press?'disabled title="Rosin-Presse im Shop kaufen"':''}>Rosin pressen</button></div>`;}
  if(!S.sieve||!S.press)h+=`<p class="note">${!S.sieve?'Siebstation: 400 € · ':''}${!S.press?'Rosin-Presse: 2.500 € · ':''}im Laptop unter Shop › Ausrüstung.</p>`;
  h+='<p><button class="ghost" data-a="close">Schließen</button></p>';return h;},e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,id=b.dataset.id;
    if(a==='close')return closePanel();
  const o=S.dry[id];if(!o)return;const q=o.q;
    if(a==='joint'){takeStock('dry',id,1);addStock('joints',id,1,q);toast('Joint gedreht ('+STRAIN[id].name+')');}
    if(a==='hash'){const g=takeStock('dry',id,o.g);addStock('hash',id,g*.2,clamp(q+.05,0,1));toast('+'+fmtG(g*.2)+' Hasch');}
    if(a==='rosin'){const g=takeStock('dry',id,o.g);addStock('rosin',id,g*.22,clamp(q+.1,0,1));toast('+'+fmtG(g*.22)+' Rosin');}
    save();refreshPanel();});}

/* ---------- Rauchen ---------- */
let high=0,smokeT=0;const SMOKE=[];
const smokeTex=texCanvas(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(240,240,240,.9)');r.addColorStop(1,'rgba(240,240,240,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});
const hand=new THREE.Group();camera.add(hand);scene.add(camera);hand.position.set(.2,-.2,-.42);hand.rotation.set(.2,-.5,0);
ms(cyl(.012,.016,.17,10),mat('#f4f0e6',{roughness:.8}),0,0,0,hand).rotation.z=1.2;const ember=ms(sph(.016,8,6),mat('#ff5a1a',{emissive:'#ff7a2a',emissiveIntensity:3}),-.08,.035,0,hand);
const handSkin=ms(sph(.04,12,10),mat('#f0c49a'),.075,-.03,0,hand,1.2,.8,1);hand.visible=false;
function smoke(kind,id){if(!S[kind][id]||S[kind][id].g<(kind==='joints'?1:.3))return toast('Nichts zum Rauchen da');takeStock(kind,id,kind==='joints'?1:.3);
  const add={joints:.35,hash:.55,rosin:.8}[kind];high=clamp(high+add,0,1.4);smokeT=4;S.smoked++;hand.visible=true;
  toast({joints:'🌿 Joint angezündet',hash:'🌿 Pfeife mit Hasch',rosin:'💨 Dab genommen'}[kind]+' · '+STRAIN[id].name);closePanel(true);save();}
function smokeBest(){for(const k of['joints','hash','rosin']){const ids=Object.keys(S[k]);if(ids.length)return smoke(k,ids[0]);}toast('Keine Joints. An der Werkbank drehen (E).');}
function puff(){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,opacity:.6,depthWrite:false}));const f=new THREE.Vector3();camera.getWorldDirection(f);
  s.position.copy(camera.position).addScaledVector(f,.5);s.position.y-=.1;s.scale.setScalar(.2);s.userData={t:0,v:f.multiplyScalar(.4).add(new THREE.Vector3(0,.35,0))};scene.add(s);SMOKE.push(s);}

/* ---------- Panels ---------- */
let panelRender=null,panelClick=null;
function openPanel(r,c){Object.keys(keys).forEach(k=>keys[k]=false);uiOpen=true;panelRender=r;panelClick=c;document.exitPointerLock&&document.exitPointerLock();$('panel').classList.remove('hidden');$('pause').classList.add('hidden');refreshPanel();}
function refreshPanel(){if(uiOpen&&panelRender)$('panelCard').innerHTML=panelRender();}
function closePanel(relock){uiOpen=false;$('panel').classList.add('hidden');if(relock!==false)lock();}
$('panelCard').addEventListener('click',e=>{if(panelClick)panelClick(e);});
let tab='markt';
const TABS=[['betrieb','🏡 Betrieb'],['markt','📈 Markt'],['shop','🛒 Shop'],['personal','👷 Personal'],['bau','🏗️ Ausbau'],['lager','📦 Lager'],['karte','🗺️ Karte'],['forschung','🔬 Upgrades'],['admin','⚙ Admin']];
function openTablet(t){tab=t||tab;openPanel(tabletHTML,tabletClick);}
function costBtn(c,a,extra,label){return `<button class="btn" data-a="${a}" ${extra||''} ${S.money<c?'disabled':''}>${label||fmt(c)+' €'}</button>`;}
function tabletHTML(){let h=`<div class="hd"><h2>📱 Tablet · Tag ${S.day}</h2><div class="m">${fmt(S.money)} €</div></div><div class="tabs">`+TABS.map(([k,n])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${n}</button>`).join('')+`<button data-a="close" style="margin-left:auto">✕</button></div>`;
  if(tab==='markt'){h+='<p class="note">Preise hängen von Sorte, Qualität und Nachfrage ab. Große Mengen drücken den Preis, er erholt sich mit der Zeit.</p>';let any=false;
    for(const kind of['dry','hash','rosin'])for(const id in S[kind]){any=true;const o=S[kind][id],p=unitPrice(kind,id);h+=`<div class="row"><i class="sw" style="background:${STRAIN[id].bud[0]}"></i><div class="tx"><b>${PRODUCT[kind].n}: ${STRAIN[id].name}</b><span>${fmtG(o.g)} · Q ${Math.round(o.q*100)} % · ${p.toFixed(2).replace('.',',')} €/g · Nachfrage ${Math.round(S.market[id]*Math.max(.35,1-S.sat[id])*100)} %</span></div><button class="btn" data-a="sell" data-k="${kind}" data-id="${id}" data-f=".25">25 %</button><button class="btn g" data-a="sell" data-k="${kind}" data-id="${id}" data-f="1">Alles: ${fmt(p*o.g)} €</button></div>`;}
    if(!any)h+='<p>Noch nichts zu verkaufen. Ernten, trocknen, dann hier verkaufen.</p>';}
  if(tab==='shop'){h+='<div class="sec">Samen (einzeln, für Growbox und Halle)</div>';for(const s of STRAINS)h+=`<div class="row"><i class="sw" style="background:${s.bud[0]}"></i><div class="tx"><b>${s.name}</b><span>${s.seed} € · Wuchszeit ×${s.time} · Ertrag ×${s.yield} · Grundpreis ${s.price} €/g · Bestand ${S.seeds[s.id]||0}</span></div>${costBtn(s.seed,'seed',`data-id="${s.id}" data-n="1"`,'1×')}${costBtn(s.seed*5,'seed',`data-id="${s.id}" data-n="5"`,'5× '+fmt(s.seed*5)+' €')}${costBtn(s.seed*20,'seed',`data-id="${s.id}" data-n="20"`,'20× '+fmt(s.seed*20)+' €')}</div>`;
    h+='<div class="sec">Growboxen in der Garage</div>';S.boxes.forEach((b,i)=>{const sz=BOX_SIZES[b.size];h+=`<div class="row"><div class="tx"><b>Box ${i+1}: ${['S','M','L'][b.size]} (${sz.n} Pflanzen) · LED ${b.lamp}${b.fan?' · Lüfter':''}${b.auto?' · Auto-Bewässerung':''}</b><span>Qualität ${Math.round(boxQ(i)*100)} % · Wachstum ×${LAMP[b.lamp]}</span></div>`+
      (b.size<2?costBtn([600,1800][b.size],'bsize',`data-i="${i}"`,'Größe '+['M','L'][b.size]+': '+fmt([600,1800][b.size])+' €'):'')+(b.lamp<3?costBtn([0,450,1600][b.lamp],'blamp',`data-i="${i}"`,'LED '+(b.lamp+1)+': '+fmt([0,450,1600][b.lamp])+' €'):'')+(!b.fan?costBtn(250,'bfan',`data-i="${i}"`,'Lüfter 250 €'):'')+(!b.auto?costBtn(700,'bauto',`data-i="${i}"`,'Bewässerung 700 €'):'')+'</div>';});
    if(S.boxes.length<4){const c=[0,500,1200,2500][S.boxes.length];h+=`<div class="row"><div class="tx"><b>Weitere Growbox</b><span>Platz ${S.boxes.length+1} von 4</span></div>${costBtn(c,'newbox')}</div>`;}
    h+='<div class="sec">Ausrüstung</div>';
    if(!S.sieve)h+=`<div class="row"><div class="tx"><b>Siebstation</b><span>Blüten zu Hasch sieben (Werkbank)</span></div>${costBtn(400,'sieve')}</div>`;
    if(!S.press)h+=`<div class="row"><div class="tx"><b>Rosin-Presse</b><span>Blüten zu Rosin pressen (Werkbank)</span></div>${costBtn(2500,'press')}</div>`;
    const rc=[[500,1500,900],[1500,4000,3000],[4000,10000,8000]].find(r=>r[0]===S.rack.cap);if(rc)h+=`<div class="row"><div class="tx"><b>Größeres Trockengestell</b><span>${fmtG(S.rack.cap)} → ${fmtG(rc[1])}</span></div>${costBtn(rc[2],'rack')}</div>`;
    if(!S.quad)h+=`<div class="row"><div class="tx"><b>Quad</b><span>Schnell über die Plantage fahren (F)</span></div>${costBtn(3000,'quad')}</div>`;}
  if(tab==='personal'){const P=[['gardener','Gärtner (Indoor)','gießt, erntet, pflanzt nach und hängt zum Trocknen auf',1000,150,4],['worker','Erntehelfer (Felder)','erntet 2 Pflanzen/s',500,120,40],['robot','Ernteroboter','erntet 6 Pflanzen/s',25000,20,20],['tractor','Traktor','sät leere Felder automatisch neu ein',45000,60,5],['harvester','Mähdrescher','erntet 30 Pflanzen/s; der erste ist selbst fahrbar',180000,150,6],['truck','LKW-Lieferung','verkauft automatisch getrocknete Blüten',60000,100,5]];
    h+='<p class="note">Löhne werden jeden Morgen bezahlt. Laufende Kosten: '+fmt(wages())+' € pro Tag.</p>';
    for(const[k,n,d,c,w,max]of P)h+=`<div class="row"><div class="tx"><b>${n}: ${S.staff[k]} / ${max}</b><span>${d} · ${fmt(w)} € Lohn/Tag</span></div>${S.staff[k]<max?costBtn(c,'hire',`data-k="${k}"`,'Einstellen '+fmt(c)+' €'):''}${S.staff[k]>0?`<button class="ghost" data-a="fire" data-k="${k}">Entlassen</button>`:''}</div>`;
    h+=`<div class="row"><div class="tx"><b>Automatisch neu aussäen</b><span>Traktoren säen leere Felder mit der bisherigen Sorte (Saatgut wird bezahlt)</span></div><button class="btn g" data-a="autosow">${S.autoSow?'An':'Aus'}</button></div>`;}
  if(tab==='bau'){h+='<div class="sec">Gebäude</div>';
    h+=`<div class="row"><div class="tx"><b>Indoor-Halle</b><span>48 Pflanzplätze, LED ${S.hallLamp}${S.hallAuto?', Bewässerung':''}</span></div>${!S.hall?costBtn(30000,'hall'):(S.hallLamp<3?costBtn([0,15000,40000][S.hallLamp],'hlamp','','LED '+(S.hallLamp+1)+': '+fmt([0,15000,40000][S.hallLamp])+' €'):'')+(!S.hallAuto?costBtn(12000,'hauto','','Bewässerung 12.000 €'):'')}</div>`;
    const dc=[60000,80000,200000][S.dryHall];h+=`<div class="row"><div class="tx"><b>Trockenhalle ${S.dryHall?'Stufe '+S.dryHall:''}</b><span>trocknet nasse Ernte automatisch (${[0,6,12,24][S.dryHall]} kg nass / Minute)</span></div>${S.dryHall<3?costBtn(dc,'dryhall','',(S.dryHall?'Ausbau ':'Kaufen ')+fmt(dc)+' €'):''}</div>`;
    h+='<div class="sec">Felder (je 40 × 96 m, 960 Pflanzen)</div>';
    h+=`<div class="row"><div class="tx"><b>Bewässerungsanlage Felder</b><span>+40 % Wachstum, bessere Qualität</span></div>${!S.fieldIrr?costBtn(150000,'irr'):'<b>✔</b>'}</div><div class="row"><div class="tx"><b>Dünger-Programm</b><span>+15 % Ertrag, bessere Qualität</span></div>${!S.fieldFert?costBtn(80000,'fert'):'<b>✔</b>'}</div>`;
    const own=S.parcels.filter(p=>p.own).length,next=S.parcels.findIndex(p=>!p.own);h+=`<p class="note">${own} von ${NPAR} Feldern gehören dir (${own*100} m von 3 km).</p>`;
    if(next>=0)h+=`<div class="row"><div class="tx"><b>Feld ${next+1} kaufen</b><span>bei ${(next*100+60)} m entlang der Straße</span></div>${costBtn(parcelPrice(next),'parcel',`data-i="${next}"`)}</div>`;}
  if(tab==='lager'){h+='<div class="sec">Samen</div>'+(Object.entries(S.seeds).filter(e=>e[1]>0).map(([id,n])=>`${STRAIN[id].name}: ${n}`).join(' · ')||'keine');
    for(const[k,n]of[['wet','Nasse Blüten'],['dry','Getrocknete Blüten'],['hash','Hasch'],['rosin','Rosin'],['joints','Joints']]){h+=`<div class="sec">${n}</div>`;const ids=Object.keys(S[k]);if(!ids.length)h+='<span class="note">leer</span>';
      for(const id of ids){const o=S[k][id];h+=`<div class="row"><i class="sw" style="background:${STRAIN[id].bud[0]}"></i><div class="tx"><b>${STRAIN[id].name}</b><span>${k==='joints'?Math.floor(o.g)+' Stück':fmtG(o.g)} · Q ${Math.round(o.q*100)} %</span></div>${['joints','hash','rosin'].includes(k)?`<button class="btn g" data-a="smoke" data-k="${k}" data-id="${id}">${k==='joints'?'Rauchen':k==='hash'?'Pfeife':'Dab'}</button>`:''}</div>`;}}
    h+=`<p class="note">Insgesamt verdient: ${fmt(S.total)} € · geraucht: ${S.smoked}×</p>`;}
  if(tab==='karte'){h+='<p class="note">Schnellreise zu einem Ort.</p><div class="map">';const L=[['Garage',0,2],['Indoor-Halle',29,9],['Trockenhalle',11,23],['Straße 1 km',3,1000],['Straße 2 km',3,2000],['Straße 3 km',3,3050]];
    S.parcels.forEach((p,i)=>{if(p.own)L.push(['Feld '+(i+1),-3,PZ0+i*PSTEP+6]);});h+=L.map(([n,x,z])=>`<button class="btn g" data-a="tp" data-x="${x}" data-z="${z}">${n}</button>`).join('')+'</div>';
    h+='<div class="sec">Felder</div>'+S.parcels.map((p,i)=>p.own?`<div class="row"><div class="tx"><b>Feld ${i+1}: ${STRAIN[p.strain].name}</b><span>${p.st==='empty'?'leer':p.st==='grow'?'wächst '+Math.round(p.g*100)+' %':'reif, '+Math.round((1-p.hv/PN)*100)+' % übrig'}</span></div></div>`:'').join('');}
  if(tab==='betrieb')h+=businessHTML();
  if(tab==='forschung')h+=researchHTML();
  if(tab==='admin')h+=adminHTML();
  return h;}
function wages(){const w={gardener:150,worker:120,robot:20,tractor:60,harvester:150,truck:100};return Object.entries(S.staff).reduce((a,[k,n])=>a+w[k]*n,0);}
function tabletClick(e){const t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;refreshPanel();return;}const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,d=b.dataset;
  if(a==='close')return closePanel();
  if(a==='research'){const u=UPGRADES.find(u=>u.id===d.id);if(!u||S.upgrades[u.id]>=u.max)return;return buy(upgradeCost(u),()=>{S.upgrades[u.id]++;toast(u.name+' verbessert');});}
  if(a.startsWith('admin-'))return adminAction(a,d);
  if(a==='sell'){const o=S[d.k][d.id];if(!o)return;const g=o.g*parseFloat(d.f),p=unitPrice(d.k,d.id),earn=g*p;takeStock(d.k,d.id,g);S.money+=earn;S.total+=earn;S.sat[d.id]=Math.min(.65,S.sat[d.id]+g*(d.k==='dry'?1:4)/40000);toast('+'+fmt(earn)+' € verdient');save();refreshPanel();return;}
  if(a==='seed')return buy(STRAIN[d.id].seed*+d.n,()=>{S.seeds[d.id]=(S.seeds[d.id]||0)+(+d.n);S.active=d.id;toast(d.n+'× '+STRAIN[d.id].name+' gekauft');});
  if(a==='bsize')return buy([600,1800][S.boxes[+d.i].size],()=>{S.boxes[+d.i].size++;rebuildBoxes();});
  if(a==='blamp')return buy([0,450,1600][S.boxes[+d.i].lamp],()=>{S.boxes[+d.i].lamp++;rebuildBoxes();});
  if(a==='bfan')return buy(250,()=>{S.boxes[+d.i].fan=true;rebuildBoxes();});
  if(a==='bauto')return buy(700,()=>{S.boxes[+d.i].auto=true;rebuildBoxes();});
  if(a==='newbox')return buy([0,500,1200,2500][S.boxes.length],()=>{S.boxes.push({size:0,lamp:1,fan:false,auto:false,pots:[newPot()]});rebuildBoxes();});
  if(a==='sieve')return buy(400,()=>{S.sieve=true;applyBuildings();});
  if(a==='press')return buy(2500,()=>{S.press=true;applyBuildings();});
  if(a==='rack'){const rc=[[500,1500,900],[1500,4000,3000],[4000,10000,8000]].find(r=>r[0]===S.rack.cap);return buy(rc[2],()=>{S.rack.cap=rc[1];});}
  if(a==='quad')return buy(3000,()=>{S.quad=true;syncVehicles();toast('Quad steht vor der Garage (F)');});
  if(a==='hire'){const c={gardener:1000,worker:500,robot:25000,tractor:45000,harvester:180000,truck:60000}[d.k];return buy(c,()=>{S.staff[d.k]++;syncStaffMeshes();syncVehicles();});}
  if(a==='fire'){if(S.staff[d.k]<=0)return;S.staff[d.k]--;if(d.k==='harvester'&&S.staff.harvester===0&&harvV){if(PL.veh===harvV)toggleVehicle();scene.remove(harvV.g);VEH.splice(VEH.indexOf(harvV),1);harvV=null;}const map={gardener:'gardeners',worker:'workers',robot:'robots',tractor:'tractors',truck:'trucks',harvester:'harvesters'};const arr=STAFFV[map[d.k]];while(arr.length>(d.k==='harvester'?Math.max(0,S.staff.harvester-1):S.staff[d.k])){scene.remove(arr.pop().g);}save();refreshPanel();return;}
  if(a==='autosow'){S.autoSow=!S.autoSow;save();refreshPanel();return;}
  if(a==='hall')return buy(30000,()=>{S.hall=true;applyBuildings();});
  if(a==='hlamp')return buy([0,15000,40000][S.hallLamp],()=>{S.hallLamp++;applyBuildings();});
  if(a==='hauto')return buy(12000,()=>{S.hallAuto=true;});
  if(a==='dryhall')return buy([60000,80000,200000][S.dryHall],()=>{S.dryHall++;applyBuildings();});
  if(a==='irr')return buy(150000,()=>{S.fieldIrr=true;});
  if(a==='fert')return buy(80000,()=>{S.fieldFert=true;});
  if(a==='parcel')return buy(parcelPrice(+d.i),()=>{S.parcels[+d.i].own=true;toast('Feld '+(+d.i+1)+' gekauft! Am Feldschild aussäen.');});
  if(a==='smoke')return smoke(d.k,d.id);
  if(a==='tp'){PL.veh=null;PL.x=+d.x;PL.z=+d.z;closePanel();return;}}
function applyBuildings(){HALL.on=S.hall;hallG.visible=S.hall;hallSign.material.map=signTex(S.hall?['INDOOR-HALLE','LED Stufe '+S.hallLamp]:['INDOOR-HALLE','48 Pflanzplätze · 30.000 €']);hallLights.forEach(l=>l.intensity=S.hall?.5+S.hallLamp*.25:0);
  DRY.on=S.dryHall>0;dryG.visible=DRY.on;drySign.material.map=signTex(DRY.on?['TROCKENHALLE','Stufe '+S.dryHall]:['TROCKENHALLE','Trocknet Feldernte · 60.000 €']);sieveG.visible=S.sieve;pressG.visible=S.press;}

/* ---------- Simulation ---------- */
let simT=0,gardT=0,workT=0,truckT=0,dryT=0;
function allPots(){const a=[];S.boxes.forEach((b,i)=>b.pots.slice(0,BOX_SIZES[b.size].n).forEach(p=>a.push({p,auto:b.auto,lamp:b.lamp,where:'box',i})));if(S.hall)S.hallPots.forEach(p=>a.push({p,auto:S.hallAuto,lamp:S.hallLamp,where:'hall'}));return a;}
function simulate(dt){
  // Tageszeit
  const prevDay=S.day;S.time+=dt/600;if(S.time>=1){S.time-=1;S.day++;}
  if(S.day!==prevDay){const w=wages();S.money-=w;for(const s of STRAINS){S.market[s.id]=clamp(S.market[s.id]*(.92+Math.random()*.16),.7,1.35);}toast('Tag '+S.day+(w?' · Löhne −'+fmt(w)+' €':''));save();}
  for(const id in S.sat)S.sat[id]=Math.max(0,S.sat[id]-dt*.0006);
  // Pflanzen
  for(const o of allPots()){const p=o.p;if(!p.s)continue;if(o.auto)p.w=1;
    if(p.g<1){if(p.w>0){p.g=Math.min(1,p.g+dt*(1+S.upgrades.growth*.12)*LAMP[o.lamp]/(180*STRAIN[p.s].time));p.w=Math.max(0,p.w-dt*.0055);}else p.h=Math.max(.3,p.h-dt*.004);}}
  // Trockengestell
  for(const b of S.rack.b)if(b.t>0)b.t-=dt*(1+S.upgrades.drying*.2);
  // Trockenhalle
  if(S.dryHall){dryT+=dt;if(dryT>=1){const elapsed=Math.floor(dryT);dryT-=elapsed;let cap=elapsed*[0,6000,12000,24000][S.dryHall]*(1+S.upgrades.drying*.2)/60;for(const id in S.wet){if(cap<=0)break;const q=S.wet[id].q,t=takeStock('wet',id,cap);cap-=t;addStock('dry',id,t*.25,q);}}}
  // Gärtner
  if(S.staff.gardener){gardT-=dt;if(gardT<=0){gardT=1.2/(S.staff.gardener*(1+S.upgrades.training*.15));gardenerAct();}}
  // Felder wachsen
  for(let i=0;i<NPAR;i++){const p=S.parcels[i];if(!p.own)continue;if(p.st==='grow'){p.g+=dt*(1+S.upgrades.growth*.12)*(S.fieldIrr?1.4:1)/(480*STRAIN[p.strain].time);if(p.g>=1){p.g=1;p.st='ripe';p.hv=0;resetFlags(i);toast('Feld '+(i+1)+' ist erntereif!');}}}
  // Feldarbeit
  const autoH=Math.max(0,S.staff.harvester-(PL.veh===harvV&&harvV?1:0)),rate=(S.staff.worker*2+S.staff.robot*6+autoH*30)*(1+S.upgrades.training*.15);
  workT+=dt*rate;let n=Math.floor(workT);workT-=n;FIELDWORK.pi=-1;
  if(n>0||rate>0){const pi=S.parcels.findIndex(p=>p.own&&p.st==='ripe');if(pi>=0){FIELDWORK.pi=pi;const P=PAR[pi];let k=FIELDWORK.k[pi]||0;while(n>0&&S.parcels[pi].st==='ripe'){while(k<PN&&P.flags[k])k++;if(k>=PN)break;harvestPlant(pi,k);n--;}FIELDWORK.k[pi]=S.parcels[pi].st==='ripe'?k:0;}}
  // Traktoren säen
  if(S.staff.tractor&&S.autoSow){FIELDWORK.sowT-=dt;if(FIELDWORK.sowT<=0){FIELDWORK.sowT=20/S.staff.tractor;const pi=S.parcels.findIndex(p=>p.own&&p.st==='empty');if(pi>=0){const p=S.parcels[pi],c=sowCost(p.strain);if(S.money>=c){S.money-=c;p.st='grow';p.g=0;p.hv=0;resetFlags(pi);FIELDWORK.sowPi=pi;FIELDWORK.sowAnim=0;toast('Traktor hat Feld '+(pi+1)+' ausgesät');}}}}
  // LKW verkauft
  if(S.staff.truck){truckT-=dt;if(truckT<=0){truckT=30;let cap=3000*S.staff.truck*(1+S.upgrades.logistics*.3),earn=0;for(const id of Object.keys(S.dry)){if(cap<=0)break;const p=unitPrice('dry',id)*.92,g=takeStock('dry',id,cap);cap-=g;earn+=g*p;S.sat[id]=Math.min(.65,S.sat[id]+g/40000);}
    if(earn>0){S.money+=earn;S.total+=earn;toast('🚚 LKW-Lieferung: +'+fmt(earn)+' €');TRUCKANIM.t=0;}}}
  simT+=dt;if(simT>8){simT=0;save();}}
const FIELDWORK={pi:-1,k:{},sowT:5,sowPi:-1,sowAnim:1};const TRUCKANIM={t:99};
const GARD={tx:0,tz:0};
function gardenerAct(){const pots=allPots();
  for(const o of pots){const p=o.p;if(p.s&&p.g>=1){harvestPot(p,o.where==='hall'?hallQ():boxQ(o.i));setGardTarget(o);return;}}
  for(const o of pots){const p=o.p;if(p.s&&p.w<.4){p.w=1;setGardTarget(o);return;}}
  for(const o of pots){const p=o.p;if(!p.s){const id=(S.seeds[S.active]||0)>0?S.active:Object.keys(S.seeds).find(k=>S.seeds[k]>0);if(id){S.seeds[id]--;p.s=id;p.g=0;p.w=1;p.h=1;setGardTarget(o);return;}}}
  if(sumStock('wet')>0||S.rack.b.some(b=>b.t<=0)){rackUse(false);GARD.tx=RACK.x+.8;GARD.tz=RACK.z;}}
function setGardTarget(o){if(o.where==='box'){GARD.tx=BOX_X[o.i];GARD.tz=BOX_Z+1.2;}else{const k=S.hallPots.indexOf(o.p);GARD.tx=18+(k%12)*2;GARD.tz=-11+Math.floor(k/12)*4.2+1.1;}}

/* ---------- Tag/Nacht & Effekte ---------- */
const _c=new THREE.Color();
function dayLight(){const t=S.time,a=(t-.25)*Math.PI*2,elev=Math.sin(a),day=clamp(elev*2+.25,0,1);
  sun.intensity=1.75*day;hemiL.intensity=.15+.5*day;scene.background.copy(SKY_NIGHT).lerp(SKY_DAY,day);const dusk=clamp(1-Math.abs(elev)*4,0,1)*day;scene.background.lerp(SKY_DUSK,dusk*.45);scene.fog.color.copy(scene.background);
  renderer.toneMappingExposure=.75+.25*day+(high>0?high*.15:0);gLight.intensity=1.1;
  const ax=PL.veh?PL.veh.x:PL.x,az=PL.veh?PL.veh.z:PL.z;sun.position.set(ax+Math.cos(a)*40,Math.max(8,elev*60),az+25);sun.target.position.set(ax,0,az);}

/* ---------- HUD ---------- */
let hudT=0;
function hud(dt){hudT-=dt;if(hudT>0)return;hudT=.25;
  $('money').textContent=fmt(S.money)+' €';const hh=Math.floor(S.time*24),mm=Math.floor((S.time*24-hh)*60);$('clock').textContent=(adminSpeed>1?adminSpeed+'× Tempo · ':'')+'Tag '+S.day+' · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' Uhr';
  $('seed').innerHTML='Aktive Sorte <b>'+STRAIN[S.active].name+'</b> · '+(S.seeds[S.active]||0)+' Samen <kbd>Q</kbd>';
  const st=S.staff,parts=[];if(st.gardener)parts.push('👨‍🌾 '+st.gardener);if(st.worker)parts.push('🧑‍🌾 '+st.worker);if(st.robot)parts.push('🤖 '+st.robot);if(st.tractor)parts.push('🚜 '+st.tractor);if(st.harvester)parts.push('🌾 '+st.harvester);if(st.truck)parts.push('🚚 '+st.truck);
  const own=S.parcels.filter(p=>p.own).length;$('staffBox').innerHTML=(parts.join(' · ')||'Noch kein Personal')+'<br>Felder: '+own+'/30 · '+own*100+' m Plantage';
  const jc=Object.values(S.joints).reduce((a,o)=>a+Math.floor(o.g),0);
  $('inv').innerHTML=`Nass <b>${fmtG(sumStock('wet'))}</b> · Trocken <b>${fmtG(sumStock('dry'))}</b><br>Hasch <b>${fmtG(sumStock('hash'))}</b> · Rosin <b>${fmtG(sumStock('rosin'))}</b> · Joints <b>${jc}</b><br>Trockengestell ${fmtG(S.rack.b.reduce((a,b)=>a+b.g,0))} / ${fmtG(S.rack.cap)}`+(PL.veh?'<br><b>Im Fahrzeug</b> · <kbd>F</kbd> aussteigen':'');
  $('high').classList.toggle('hidden',high<=.01);$('highBar').style.width=clamp(high/1.4*100,0,100)+'%';}

/* ---------- Hauptschleife ---------- */
let last=performance.now(),T=0;
const fw=new THREE.Vector3(),rt=new THREE.Vector3();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  if(started&&!uiOpen&&locked)simulate(dt*adminSpeed);else if(started)simulate(dt*0);
  // Bewegung
  const slow=1-clamp(high,0,1)*.3;
  if(PL.veh){if(locked&&!uiOpen)driveVehicle(PL.veh,dt);const v=PL.veh;const c=v.cam;const cx=v.x-Math.sin(v.yaw)*-c[2]*-1,cz=v.z-Math.cos(v.yaw)*-c[2]*-1;
    camera.position.set(v.x+Math.sin(v.yaw)*c[2],c[1],v.z+Math.cos(v.yaw)*c[2]);camera.lookAt(v.x+Math.sin(v.yaw)*4,1.2,v.z+Math.cos(v.yaw)*4);PL.x=v.x;PL.z=v.z;}
  else{let mx=0,mz=0;if(locked&&!uiOpen){if(keys.KeyW)mz-=1;if(keys.KeyS)mz+=1;if(keys.KeyA)mx-=1;if(keys.KeyD)mx+=1;}
    const len=Math.hypot(mx,mz);if(len>0){mx/=len;mz/=len;}const sp=(keys.ShiftLeft||keys.ShiftRight?7.5:4.2)*(1+S.upgrades.boots*.1)*slow,cs=Math.cos(PL.yaw),sn=Math.sin(PL.yaw);
    const p={x:PL.x+(mx*cs+mz*sn)*sp*dt,z:PL.z+(-mx*sn+mz*cs)*sp*dt};collide(p,.32);PL.x=clamp(p.x,-200,200);PL.z=clamp(p.z,-60,3180);
    const bob=len>0?Math.sin(T*(sp>5?13:9))*.04:0,sway=high>0?Math.sin(T*.9)*high*.06:0;camera.position.set(PL.x,1.65+bob,PL.z);
    camera.rotation.order='YXZ';camera.rotation.set(PL.pitch+Math.sin(T*.7)*high*.04,PL.yaw+sway,Math.sin(T*.6)*high*.08);}
  camera.fov=72+high*6*Math.sin(T*.8)+high*4;camera.updateProjectionMatrix();
  // Szene aktualisieren
  dayLight();
  BOXV.forEach(v=>{const b=S.boxes[v.box];v.pots.forEach((pv,k)=>updPlant(pv,b.pots[k],.95));});
  if(S.hall)HALLP.forEach((pv,k)=>updPlant(pv,S.hallPots[k],1));
  const hang=S.rack.b.reduce((a,b)=>a+b.g,0),nb=Math.ceil(clamp(hang/S.rack.cap,0,1)*24);rackBuds.forEach((b,i)=>{const show=i<nb;if(show&&!b.children.length&&S.rack.b.length){const s=S.rack.b[i%S.rack.b.length];ms(budGeo(s.s),VCF,0,0,0,b,.9);}if(!show&&b.children.length)b.clear();b.visible=show;});
  const pz=PL.veh?PL.veh.z:PL.z;updateParcelLOD(pz);
  for(let i=0;i<NPAR;i++)if(Math.abs(pz-PAR[i].cz)<300)paintParcelSign(i);
  // Personal sichtbar machen
  STAFFV.gardeners.forEach((o,i)=>{const tx=GARD.tx+i*.8,tz=GARD.tz;const dx=tx-o.x,dz=tz-o.z,d=Math.hypot(dx,dz),mv=d>.2;if(mv){const s=Math.min(d,3*dt);o.x+=dx/d*s;o.z+=dz/d*s;o.g.rotation.y=Math.atan2(dx,dz);}o.g.position.set(o.x,0,o.z);walkAnim(o.p,mv,i,T);});
  const fpi=FIELDWORK.pi;const fk=fpi>=0?(FIELDWORK.k[fpi]||0):0;
  const place=(arr,off,spd)=>arr.forEach((o,i)=>{let tx,tz,face=0;if(fpi>=0){const k=Math.min(PN-1,fk+i*off),col=k%PCOLS,row=Math.floor(k/PCOLS);tx=PX0+((col+i*3)%PCOLS)*2;tz=PAR[fpi].z0+1+row*2+(i%3);}else{tx=-10-i*1.6;tz=14+(i%4)*1.6;}
    const dx=tx-o.x,dz=tz-o.z,d=Math.hypot(dx,dz),mv=d>.3;if(mv){const s=Math.min(d,spd*dt*(d>40?8:1));o.x+=dx/d*s;o.z+=dz/d*s;o.g.rotation.y=Math.atan2(dx,dz);}o.g.position.set(o.x,0,o.z);if(o.p)walkAnim(o.p,mv,i,T);if(o.reel)o.reel.rotation.x+=dt*(fpi>=0?3:0);});
  place(STAFFV.workers,1,3.5);place(STAFFV.robots,2,4.5);place(STAFFV.harvesters,24,5);
  STAFFV.tractors.forEach((o,i)=>{let tx=-16-i*5,tz=24;if(FIELDWORK.sowPi>=0&&FIELDWORK.sowAnim<1&&i===0){FIELDWORK.sowAnim+=dt/18;const P=PAR[FIELDWORK.sowPi];tx=PX0+20+Math.sin(FIELDWORK.sowAnim*30)*18;tz=P.z0+FIELDWORK.sowAnim*PLEN;}
    const dx=tx-o.x,dz=tz-o.z,d=Math.hypot(dx,dz);if(d>.3){const s=Math.min(d,dt*(d>40?60:8));o.x+=dx/d*s;o.z+=dz/d*s;o.g.rotation.y=Math.atan2(dx,dz);}o.g.position.set(o.x,0,o.z);});
  STAFFV.trucks.forEach((o,i)=>{TRUCKANIM.t+=dt/STAFFV.trucks.length;const t=TRUCKANIM.t;let z=20;if(t<40)z=20+Math.sin(Math.min(1,t/40)*Math.PI)*1500;o.x=3.2+i*.1;o.z=z+i*12;o.g.position.set(o.x,0,o.z);o.g.rotation.y=t<20?0:Math.PI;});
  // Rauch & High
  if(smokeT>0){smokeT-=dt;if(Math.random()<dt*3)puff();ember.material.emissiveIntensity=2+Math.sin(T*8);if(smokeT<=0)hand.visible=false;}
  for(let i=SMOKE.length-1;i>=0;i--){const s=SMOKE[i],u=s.userData;u.t+=dt;s.position.addScaledVector(u.v,dt);s.scale.setScalar(.2+u.t*.9);s.material.opacity=Math.max(0,.55-u.t*.18);if(u.t>3){scene.remove(s);SMOKE.splice(i,1);}}
  if(high>0){high=Math.max(0,high-dt/110);}
  cv.style.filter=high>.01?`saturate(${1+high*.9}) hue-rotate(${Math.sin(T*.25)*high*28}deg) contrast(${1+high*.08}) blur(${Math.max(0,high-.6)*1.2}px)`:'';
  $('haze').style.opacity=clamp(high*.55,0,.7);
  // Ziel
  hover=started&&!uiOpen?lookTarget():null;const pr=promptFor(hover);
  let vt='';if(!PL.veh&&started){for(const v of VEH)if(Math.hypot(v.x-PL.x,v.z-PL.z)<v.r+2.2){vt='[F] '+(v.kind==='quad'?'Quad fahren':'Mähdrescher fahren');break;}}
  $('prompt').innerHTML=Array.isArray(pr)?(pr[0]||'')+'<small>'+(pr[1]||'')+'</small>':vt;if(!pr&&vt)$('prompt').innerHTML=vt;
  hud(dt);
  renderer.render(scene,camera);requestAnimationFrame(frame);}


/* Erweiterungen: Wirtschaft und lokaler Sandbox-Admin */
let adminSpeed=1,adminUndo=null;
function businessHTML(){const pots=allPots(),active=pots.filter(o=>o.p.s),ripe=active.filter(o=>o.p.g>=1).length,thirsty=active.filter(o=>o.p.w<.3).length,used=S.rack.b.reduce((n,b)=>n+b.g,0),done=S.rack.b.filter(b=>b.t<=0).reduce((n,b)=>n+b.g*.25,0);const tips=[];if(thirsty)tips.push(thirsty+' Pflanzen brauchen Wasser.');if(ripe)tips.push(ripe+' Indoor-Pflanzen sind erntereif.');if(done)tips.push(fmtG(done)+' trockene Blüten am Gestell abholen.');if(sumStock('wet')>0&&used>=S.rack.cap&&!S.dryHall)tips.push('Trockengestell voll: Ernte abholen oder Kapazität ausbauen.');if(S.money<wages())tips.push('Kontostand reicht nicht für die nächsten Tageslöhne.');if(!Object.values(S.seeds).some(n=>n>0))tips.push('Keine Samen mehr: Nachschub im Shop kaufen.');return `<div class=sec>Dein Betrieb</div><div class=row><div class=tx><b>Indoor: ${active.length} / ${pots.length} Plätze belegt</b><span>${ripe} erntereif · ${thirsty} brauchen Wasser</span></div></div><div class=row><div class=tx><b>Felder: ${S.parcels.filter(p=>p.own).length} / 30</b><span>${S.parcels.filter(p=>p.own&&p.st==='ripe').length} erntereif · ${S.parcels.filter(p=>p.own&&p.st==='empty').length} leer</span></div></div><div class=row><div class=tx><b>Trockengestell: ${fmtG(used)} / ${fmtG(S.rack.cap)}</b><span>${fmtG(done)} abholbereit · ${fmtG(sumStock('wet'))} nasse Ernte im Lager</span><progress max="${S.rack.cap}" value="${used}"></progress></div></div><div class=row><div class=tx><b>Laufende Kosten: ${fmt(wages())} € / Tag</b><span>Insgesamt verdient: ${fmt(S.total)} €</span></div></div><div class=sec>Nächste Schritte</div>${tips.length?tips.map(t=>'<p>'+t+'</p>').join(''):'<p>Keine akuten Engpässe. Im Upgrade-Tab kannst du deinen Betrieb weiter verbessern.</p>'}`;}

const UPGRADES=[
 {id:'growth',name:'Wachstumssteuerung',desc:'+12 % Wachstum je Stufe · Indoor und Felder',base:650,max:8},
 {id:'yield',name:'Ertragsoptimierung',desc:'+12 % Erntegewicht je Stufe',base:900,max:8},
 {id:'drying',name:'Klimatechnik',desc:'+20 % Trocknungstempo je Stufe · Gestell und Halle',base:1200,max:6},
 {id:'training',name:'Personal-Schulung',desc:'+15 % Arbeitsleistung je Stufe · Gärtner und Feldteams',base:2500,max:6},
 {id:'trade',name:'Premium-Vertrieb',desc:'+5 % Verkaufspreis je Stufe · auch für LKW',base:1800,max:6},
 {id:'logistics',name:'LKW-Logistik',desc:'+30 % Lieferkapazität je Stufe',base:8000,max:5},
 {id:'boots',name:'Arbeitsausrüstung',desc:'+10 % Lauf- und Sprinttempo je Stufe',base:400,max:4}
];
function upgradeCost(u){return Math.round(u.base*Math.pow(1.85,S.upgrades[u.id]));}
function researchHTML(){return '<p class="note">43 zusätzliche Upgrade-Stufen. Alle Verbesserungen werden mit deinem Spielstand gespeichert.</p>'+UPGRADES.map(u=>{const l=S.upgrades[u.id];return `<div class="row"><div class="tx"><b>${u.name} · ${l} / ${u.max}</b><span>${u.desc}</span><progress max="${u.max}" value="${l}"></progress></div>${l<u.max?costBtn(upgradeCost(u),'research',`data-id="${u.id}"`):'<b>MAX</b>'}</div>`;}).join('');}
function adminHTML(){return `<p class="note">Lokaler Sandboxmodus · nur dein Browser-Spielstand. Simulation pausiert im Menü. F2 öffnet diesen Bereich.</p>
<button class="ghost" data-a="admin-undo" ${adminUndo?'':'disabled'}>Letzte Adminänderung rückgängig</button><div class="sec">Geld</div><div class="row"><div class="tx"><b>Kontostand bearbeiten</b><input id="adminMoney" type="number" min="0" max="1000000000000" step="100" value="10000" aria-label="Geldbetrag"></div><button class="btn" data-a="admin-add">Hinzufügen</button><button class="ghost" data-a="admin-set">Setzen</button></div>
<div class="tabs">${[1000,10000,100000,1000000].map(n=>`<button data-a="admin-cash" data-n="${n}">+${fmt(n)} €</button>`).join('')}</div>
<div class="sec">Freischaltungen</div><div class="admin-grid">${[['buildings','Alle Gebäude & Geräte'],['boxes','4 maximale Growboxen'],['field','Nächstes Feld'],['fields','Alle 30 Felder'],['staff','Personal & Fuhrpark'],['research','Alle neuen Upgrades'],['seeds','100 Samen jeder Sorte']].map(([k,n])=>`<button class="ghost" data-a="admin-${k}">${n}</button>`).join('')}</div>
<div class="sec">Produktion testen</div><div class="admin-grid"><button class="ghost" data-a="admin-ripe">Gepflanztes erntereif</button><button class="ghost" data-a="admin-water">Alle Pflanzen versorgen</button><button class="ghost" data-a="admin-dry">Gestell fertig trocknen</button><button class="ghost" data-a="admin-stock">1 kg Blüten jeder Sorte</button><button class="ghost" data-a="admin-market">Nachfrage zurücksetzen</button><button class="ghost" data-a="admin-day">Tag / Mittag setzen</button></div>
<div class="sec">Simulation nach Schließen</div><div class="tabs">${[1,2,5,10].map(n=>`<button class="${adminSpeed===n?'on':''}" data-a="admin-speed" data-n="${n}">${n}× Tempo</button>`).join('')}</div><p class="note">Beschleunigt Wachstum, Trocknung, Lieferungen und Tageslöhne. Tempo gilt nur für diese Sitzung.</p>`;}
function adminAction(a,d){
 if(a==='admin-undo'){if(!adminUndo)return;Object.assign(S,JSON.parse(adminUndo));save();location.reload();return;}
 if(a!=='admin-speed')adminUndo=JSON.stringify(S);
 const amount=()=>{const v=Number($('adminMoney').value);return Number.isFinite(v)?clamp(v,0,1e12):0;};
 if(a==='admin-add')S.money=Math.min(1e12,S.money+amount());
 if(a==='admin-set')S.money=amount();
 if(a==='admin-cash')S.money=Math.min(1e12,S.money+Number(d.n));
 if(a==='admin-buildings'){S.hall=true;S.hallLamp=3;S.hallAuto=true;S.dryHall=3;S.sieve=S.press=S.fieldIrr=S.fieldFert=S.quad=true;S.rack.cap=10000;applyBuildings();syncVehicles();}
 if(a==='admin-boxes'){while(S.boxes.length<4)S.boxes.push({size:0,lamp:1,pots:[newPot()]});S.boxes.forEach(b=>{b.size=2;b.lamp=3;b.auto=b.fan=true;});rebuildBoxes();}
 if(a==='admin-field'){const p=S.parcels.find(p=>!p.own);if(p)p.own=true;}
 if(a==='admin-fields')S.parcels.forEach(p=>p.own=true);
 if(a==='admin-staff'){for(const [k,n] of Object.entries({gardener:4,worker:8,robot:2,tractor:1,harvester:1,truck:1}))S.staff[k]=Math.max(S.staff[k],n);syncStaffMeshes();syncVehicles();}
 if(a==='admin-research')UPGRADES.forEach(u=>S.upgrades[u.id]=u.max);
 if(a==='admin-seeds')STRAINS.forEach(s=>S.seeds[s.id]=(S.seeds[s.id]||0)+100);
 if(a==='admin-ripe'){allPots().forEach(({p})=>{if(p.s){p.g=p.w=p.h=1;}});S.parcels.forEach((p,i)=>{if(p.own&&p.st==='grow'){p.g=1;p.st='ripe';p.hv=0;resetFlags(i);}});}
 if(a==='admin-water')allPots().forEach(({p})=>p.w=p.h=1);
 if(a==='admin-dry'){S.rack.b.forEach(b=>b.t=0);rackUse(false);}
 if(a==='admin-stock')STRAINS.forEach(s=>addStock('dry',s.id,1000,1));
 if(a==='admin-market')STRAINS.forEach(s=>{S.market[s.id]=1;S.sat[s.id]=0;});
 if(a==='admin-day')S.time=.5;
 if(a==='admin-speed')adminSpeed=[1,2,5,10].includes(Number(d.n))?Number(d.n):1;
 S.parcels.forEach((p,i)=>paintParcelSign(i));save();refreshPanel();toast('Admin: Änderung angewendet');
}
$('adminBtn').onclick=()=>openTablet('admin');
addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));

/* ---------- Start ---------- */
rebuildBoxes();applyBuildings();syncVehicles();syncStaffMeshes();
camera.position.set(PL.x,1.65,PL.z);
requestAnimationFrame(frame);
addEventListener('beforeunload',save);
window.__g={S,PL,interact,simulate,openTablet,closePanel,toggleVehicle,VEH,PAR,harvestPlant,start:()=>{started=true;$('start').classList.add('hidden');$('hud').classList.remove('hidden');locked=true;},look:(y,p)=>{PL.yaw=y;PL.pitch=p;},setHigh:h=>{high=h;}};
