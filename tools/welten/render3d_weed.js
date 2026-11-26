/* ===== 3D-Darstellung: Cannabis-Gewächshaus (three.js r128) ===== */
const R3={};const ART={cust:new Array(6)};
(function(){const o=THREE.Color.prototype.setStyle;THREE.Color.prototype.setStyle=function(v){o.call(this,v);return this.convertSRGBToLinear();};})();
const SPR={};
const ICON={};
let SC_DUMMY=0;
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(1.75,window.devicePixelRatio||1));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
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

/* ---------- Umgebungslicht (Tageslicht) ---------- */
scene.background=new THREE.Color('#a9d6ff');scene.fog=new THREE.Fog(scene.background.getHex(),70,190);
(function(){const pm=new THREE.PMREMGenerator(renderer);const es=new THREE.Scene();
  const g=new THREE.SphereGeometry(50,32,16),pos=g.attributes.position,col=[];const top=new THREE.Color('#d8ecff'),mid=new THREE.Color('#b8d0c0'),bot=new THREE.Color('#4a6a34'),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)/50;if(y>0)c.copy(mid).lerp(top,y);else c.copy(mid).lerp(bot,-y);col.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));es.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  const s=new THREE.Mesh(new THREE.SphereGeometry(5,16,8),new THREE.MeshBasicMaterial({color:'#fff6e0'}));s.position.set(20,30,15);es.add(s);
  scene.environment=pm.fromScene(es,.03).texture;pm.dispose();})();
/* ---------- Licht ---------- */
scene.add(new THREE.HemisphereLight('#d6ecff','#5a7a3a',.62));
const sun=new THREE.DirectionalLight('#fff0d4',1.75);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:1,far:70});sun.shadow.bias=-.0006;sun.shadow.normalBias=.02;
scene.add(sun);scene.add(sun.target);
const rim=new THREE.DirectionalLight('#ffd8a0',.3);rim.position.set(-20,12,-25);scene.add(rim);
/* ---------- Geometrie zusammenführen (eine Mesh pro Pflanze) ---------- */
const _q=new THREE.Quaternion(),_e=new THREE.Euler(),_up=new THREE.Vector3(0,1,0);
const M4=(x,y,z,rx,ry,rz,sx,sy,sz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_q.clone().setFromEuler(_e.set(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(sx===undefined?1:sx,sy===undefined?(sx===undefined?1:sx):sy,sz===undefined?(sx===undefined?1:sx):sz));
const M4dir=(x,y,z,dx,dy,dz,s,len)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromUnitVectors(_up,new THREE.Vector3(dx,dy,dz).normalize()),new THREE.Vector3(s,len,s));
function mergeParts(parts){const pos=[],nor=[],col=[],idx=[];let off=0;const v=new THREE.Vector3(),nm=new THREE.Matrix3(),c=new THREE.Color();
  for(const p of parts){const g=p.g,P=g.attributes.position,N=g.attributes.normal;nm.getNormalMatrix(p.m);c.set(p.c);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(p.m);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z);col.push(c.r,c.g,c.b);}
    if(g.index)for(let i=0;i<g.index.count;i++)idx.push(g.index.getX(i)+off);else for(let i=0;i<P.count;i++)idx.push(i+off);off+=P.count;}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));o.setAttribute('color',new THREE.Float32BufferAttribute(col,3));o.setIndex(idx);o.computeBoundingSphere();return o;}
const VC=mat('#ffffff',{vertexColors:true,roughness:.62,side:THREE.DoubleSide});
const VCF=mat('#ffffff',{vertexColors:true,roughness:.4});
/* Blättchen mit gezacktem Rand und Fächerblatt mit 7 Fingern */
const LEAFLET=(()=>{const s=new THREE.Shape(),n=16,wd=.1,wf=t=>wd*Math.sin(Math.PI*Math.min(1,t*1.02))*(1-t*.2);s.moveTo(0,0);
  for(let i=1;i<=n;i++){const t=i/n;s.lineTo(wf(t)+(i%2?.018:0),t);}s.lineTo(0,1.05);for(let i=n;i>=1;i--){const t=i/n;s.lineTo(-wf(t)-(i%2?.018:0),t);}s.lineTo(0,0);
  return new THREE.ShapeGeometry(s,1);})();
function fanParts(m0,c,fingers){const out=[],F=fingers||7,ang=F===7?[-1.3,-.85,-.42,0,.42,.85,1.3]:[-1,-.5,0,.5,1],len=F===7?[.42,.68,.9,1,.9,.68,.42]:[.55,.85,1,.85,.55];
  for(let i=0;i<F;i++){const m=new THREE.Matrix4().multiplyMatrices(m0,M4(0,0,0,0,0,ang[i],len[i]*.8,len[i],1));out.push({g:LEAFLET,m,c:(i%2?c[0]:c[1])});}return out;}
const STRAIN={
  a:{bud:['#a6dc4a','#8cc63a'],pist:'#ff9a2a',leaf:['#4f9e34','#5fb23e'],h:1.25,nodes:5,frost:10},
  b:{bud:['#8a4ad0','#6a8a3a'],pist:'#ff8a3a',leaf:['#356a30','#4a3a6a'],h:.9,nodes:4,frost:12},
  c:{bud:['#7ccab8','#5aa88a'],pist:'#ffb04a',leaf:['#3f8a5a','#4f9e6a'],h:1.08,nodes:5,frost:12},
  d:{bud:['#e0cc5a','#b8b04a'],pist:'#ff7a2a',leaf:['#6a9a34','#8aa83a'],h:1.0,nodes:4,frost:22}};
const BUDG={};
function budGeo(t){if(BUDG[t])return BUDG[t];const S_=STRAIN[t],P=[],sp=sph(.1,12,10),sm=sph(.05,10,8),tiny=sph(.013,4,3),hair=cyl(.006,.003,1,4);let r=7+t.charCodeAt(0);const R=()=>(r=(r*16807)%2147483647)/2147483647;
  P.push({g:sp,m:M4(0,.2,0,0,0,0,1,1.9,1),c:S_.bud[1]});
  for(let i=0;i<22;i++){const k=i/22,y=.04+k*.36,a=i*2.4,rad=.105*(1-Math.abs(k-.42)*1.2)+.02,x=Math.cos(a)*rad,z=Math.sin(a)*rad,s=1-.45*k;
    P.push({g:sm,m:M4(x,y,z,0,a,0,s,s*1.35,s),c:i%3?S_.bud[0]:S_.bud[1]});
    if(i%2===0){const dx=x+(R()-.5)*.1,dz=z+(R()-.5)*.1;P.push({g:hair,m:M4dir(x*1.2,y+.03,z*1.2,dx,.6+R()*.6,dz,1,.07),c:S_.pist});}}
  for(let i=0;i<5;i++){const a=i/5*6.283;P.push({g:LEAFLET,m:M4(Math.cos(a)*.06,.02,Math.sin(a)*.06,-.6,-a+1.57,0,.09,.17,1),c:S_.leaf[0]});}
  for(let i=0;i<S_.frost;i++){const k=R(),a=R()*6.283,rad=.11*(1-Math.abs(k-.42)*1.2)+.04;P.push({g:tiny,m:M4(Math.cos(a)*rad,.05+k*.36,Math.sin(a)*rad),c:'#ffffff'});}
  P.push({g:hair,m:M4dir(0,.38,0,0,1,0,1.4,.08),c:S_.pist});
  return BUDG[t]=mergeParts(P);}
const PLANTG={};
function plantGeo(t,lite){const k=t+(lite?'L':'');if(PLANTG[k])return PLANTG[k];const S_=STRAIN[t],P=[],H=S_.h,n=lite?3:S_.nodes,stem=cyl(.025,.04,1,8),pet=cyl(.008,.01,1,5);
  P.push({g:stem,m:M4(0,H/2,0,0,0,0,1,H,1),c:'#5e8a34'});
  for(let j=0;j<n;j++){const y=.12+j*(H-.3)/n,sz=(.62-j*.07)*(t==='b'?1.15:1),yaw0=j*1.57+.4;
    for(const side of[0,Math.PI]){const yaw=yaw0+side,dx=-Math.sin(yaw),dz=-Math.cos(yaw),pl=.08+sz*.15;
      P.push({g:pet,m:M4dir(dx*pl/2,y+.02,dz*pl/2,dx,.25,dz,1,pl),c:'#6a9a3a'});
      fanParts(M4(dx*pl,y+.04,dz*pl,-Math.PI/2+.3+j*.08,yaw,0,sz),S_.leaf,lite?5:7).forEach(q=>P.push(q));}}
  for(let i=0;i<4;i++)fanParts(M4(0,H-.08,0,-Math.PI/2+.9,i*1.57+.8,0,.28),S_.leaf,5).forEach(q=>P.push(q));
  return PLANTG[k]=mergeParts(P);}
const GLASS=new THREE.MeshStandardMaterial({color:'#e8fbff',transparent:true,opacity:.28,roughness:.04,metalness:.1,depthWrite:false,envMapIntensity:1});
const ITEM={};
function budItem(t){return()=>{const g=new THREE.Group();ms(budGeo(t),VCF,0,0,0,g);return g;};}
ITEM.a=budItem('a');ITEM.b=budItem('b');ITEM.c=budItem('c');ITEM.d=budItem('d');
ITEM.e=()=>{const g=new THREE.Group();ms(budGeo('a'),VCF,-.04,.03,0,g,.5);ms(budGeo('b'),VCF,.05,.04,.02,g,.48);
  ms(cyl(.15,.15,.34,24),GLASS,0,.18,0,g);ms(cyl(.16,.16,.07,24),mat('#2f6a3a',{roughness:.5}),0,.38,0,g);ms(cyl(.165,.165,.02,24),mat('#d8b468',{metalness:.7,roughness:.3}),0,.345,0,g);
  const lb=new THREE.Mesh(new THREE.CylinderGeometry(.152,.152,.1,24,1,true,-.9,1.8),mat('#f4ecd4',{roughness:.7,side:THREE.DoubleSide}));lb.position.y=.17;g.add(lb);
  ms(cyl(.15,.15,.015,24),mat('#ffffff',{transparent:true,opacity:.4}),0,.012,0,g);return g;};
ITEM.cash=()=>{const g=new THREE.Group();ms(cyl(.15,.15,.045,28),mat('#f2c84a',{metalness:.85,roughness:.22}),0,.023,0,g);
  const lf=new THREE.Mesh(mergeParts(fanParts(M4(0,0,0,-Math.PI/2,0,0,.16),['#b8902a','#b8902a'])),mat('#ffffff',{vertexColors:true,metalness:.8,roughness:.3,side:THREE.DoubleSide}));lf.position.set(0,.048,.06);g.add(lf);
  const rr_=ms(tor(.13,.012),mat('#c89a2a',{metalness:.85,roughness:.25}),0,.046,0,g);rr_.rotation.x=Math.PI/2;return g;};
/* Pool für Gegenstände */
const POOL={};
function takeItem(t){const p=POOL[t]||(POOL[t]=[]);const o=p.pop()||ITEM[t]();o.visible=true;o.scale.setScalar(1);o.rotation.set(0,0,0);scene.add(o);return o;}
function giveItem(t,o){if(o.parent)o.parent.remove(o);(POOL[t]||(POOL[t]=[])).push(o);}

/* ---------- Pflanzen ---------- */
const NODE={};
function mkNode(t){return()=>{const g=new THREE.Group(),S_=STRAIN[t];const p=ms(plantGeo(t),VC,0,0,0,g);p.rotation.y=Math.random()*6.28;
  ms(cyl(.12,.16,.08,12),mat('#3a2a1c',{roughness:.95}),0,.03,0,g);
  const f=new THREE.Group();ms(budGeo(t),VCF,0,0,0,f);f.position.y=S_.h-.12;g.add(f);return{g,f,fy:S_.h-.12,fs:1.25};};}
NODE.a=mkNode('a');NODE.b=mkNode('b');NODE.c=mkNode('c');NODE.d=mkNode('d');
/* ---------- Figuren (Menschen) ---------- */
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
const mkAstro=()=>mkPerson({skin:'#f0c49a',shirt:'#d84a3a',pants:'#3a6aa0',hair:'#6a3a1a',style:'short',hat:'straw',overalls:true,gloves:'#6aa84a',shoes:'#5a3a22'});
const mkDrone=()=>mkPerson({skin:'#e8b890',shirt:'#3f8a4a',pants:'#4a4030',hair:'#2a1a10',style:'short',hat:'cap',hatCol:'#2f6a3a',apron:'#7a5a3a',gloves:'#d8c8a0'});
const mkChefBot=()=>{const p=mkPerson({skin:'#f6d2b0',shirt:'#5a8a4a',pants:'#3a3a48',hair:'#a8582a',style:'bun',glasses:true,coat:true});addClip(p);return{root:p.root,b:p.body,head:p.head};};
const mkWaterBot=()=>{const p=mkPerson({skin:'#c8865a',shirt:'#e8c84a',pants:'#3a5a3a',hair:'#1a1210',style:'curly',hat:'cap',hatCol:'#e8c84a',gloves:'#6aa84a'});addCan(p);return p;};
const ALIENS=[
  ()=>mkPerson({skin:'#f2c8a0',shirt:'#4a7ad8',pants:'#2a3448',hair:'#3a2418',beard:'#4a2e1c',hat:'beanie',hatCol:'#e05a3a'}).root,
  ()=>mkPerson({skin:'#c8865a',shirt:'#f2a83a',pants:'#3a5a8a',hair:'#1a1210',style:'curly'}).root,
  ()=>mkPerson({skin:'#f6d2b0',shirt:'#9a5ad0',pants:'#3a3040',hair:'#d8a85a',style:'bun',glasses:true}).root,
  ()=>mkPerson({skin:'#8a5a3a',shirt:'#3aa88a',pants:'#2a2a30',hair:'#14100c',hat:'cap',hatCol:'#2a2a30'}).root,
  ()=>mkPerson({skin:'#f0c4a0',shirt:'#e86a9a',pants:'#4a4a8a',hair:'#b8322a',style:'long'}).root,
  ()=>mkPerson({skin:'#e8b890',shirt:'#6a6a72',pants:'#2a2a30',hair:'#c8c8c8',style:'bald',beard:'#d8d8d8',glasses:true}).root];
function walkAnim(p,mv,ph){const ws=mv?Math.sin(walk*10+ph):0;p.hips[0].rotation.x=ws*.7;p.hips[1].rotation.x=-ws*.7;p.arms[0].rotation.x=-ws*.6;if(!p.noArm1)p.arms[1].rotation.x=ws*.6;p.body.position.y=mv?Math.abs(Math.cos(walk*10+ph))*.05:Math.sin(walk*2.5+ph)*.01;}
/* ---------- Welt bauen ---------- */
const WOOD=mat('#a8743e',{roughness:.75}),WOOD2=mat('#d0a066',{roughness:.7}),ALU=mat('#e4e8ec',{metalness:.6,roughness:.3});
const deckMat=(()=>{const c=cnv(256,256),g=c.getContext('2d');g.fillStyle='#6a6458';g.fillRect(0,0,256,256);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=i*128,y=j*128,gr=g.createLinearGradient(x,y,x+128,y+128);gr.addColorStop(0,(i+j)%2?'#a49c8a':'#9c9482');gr.addColorStop(1,(i+j)%2?'#948c7a':'#988f7c');g.fillStyle=gr;g.fillRect(x+3,y+3,122,122);
    for(let k=0;k<70;k++){g.fillStyle=`rgba(${80+Math.random()*60|0},${70+Math.random()*50|0},50,.12)`;g.fillRect(x+3+Math.random()*120,y+3+Math.random()*120,2,2);}}
  const t=ctex(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.25,.25);return new THREE.MeshStandardMaterial({map:t,roughness:.85,metalness:0,envMapIntensity:.5});})();
function grassTex(){const c=cnv(256,256),g=c.getContext('2d');g.fillStyle='#5a9a3a';g.fillRect(0,0,256,256);for(let i=0;i<2600;i++){g.fillStyle=`hsl(${90+Math.random()*25},${45+Math.random()*20}%,${28+Math.random()*22}%)`;g.fillRect(Math.random()*256,Math.random()*256,2,3+Math.random()*4);}const t=ctex(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function rrShape(x0,z0,x1,z1,r){const s=new THREE.Shape();s.moveTo(x0+r,-z0);s.lineTo(x1-r,-z0);s.quadraticCurveTo(x1,-z0,x1,-z0-r);s.lineTo(x1,-z1+r);s.quadraticCurveTo(x1,-z1,x1-r,-z1);s.lineTo(x0+r,-z1);s.quadraticCurveTo(x0,-z1,x0,-z1+r);s.lineTo(x0,-z0-r);s.quadraticCurveTo(x0,-z0,x0+r,-z0);return s;}
function tree(x,z,s){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);ms(cyl(.25,.35,2.4,10),mat('#6a4a2a',{roughness:.9}),0,1.2,0,g);
  const fm=mat(['#3f7a2a','#4f8a34','#5a9a3a'][Math.floor(rnd()*3)],{roughness:.85});for(const[a,b,c,r]of[[0,3.2,0,1.5],[.8,2.6,.3,1.1],[-.7,2.7,-.2,1.15],[.1,4,.1,1.1]])ms(sph(r,14,10),fm,a,b,c,g);scene.add(g);return g;}
function buildWorld(){
  const top=new THREE.ExtrudeGeometry(rrShape(BX0,BY0,BX1,BY1,1.2),{depth:.3,bevelEnabled:false,curveSegments:8});
  const deck=new THREE.Mesh(top,[deckMat,mat('#8a8478',{roughness:.9})]);deck.rotation.x=-Math.PI/2;deck.position.y=-.3;deck.receiveShadow=true;scene.add(deck);
  const gt=grassTex();gt.repeat.set(120,120);const grass=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({map:gt,roughness:.95,envMapIntensity:.4}));grass.rotation.x=-Math.PI/2;grass.position.y=-.05;grass.receiveShadow=true;scene.add(grass);
  const path=new THREE.Mesh(new THREE.ExtrudeGeometry((()=>{const s=rrShape(BX0-2.5,BY0-2.5,BX1+2.5,BY1+2.5,3);s.holes.push(rrShape(BX0,BY0,BX1,BY1,1.2));return s;})(),{depth:.04,bevelEnabled:false}),mat('#c8b48a',{roughness:.95}));path.rotation.x=-Math.PI/2;path.position.y=-.04;path.receiveShadow=true;scene.add(path);
  // Glaswände des Gewächshauses
  const gm=new THREE.MeshStandardMaterial({color:'#dff4ff',transparent:true,opacity:.16,roughness:.04,metalness:.1,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.2});
  const sides=[[BX0+.3,BY0+1.2,BX0+.3,BY1-1.2,2.4],[BX1-.3,BY0+1.2,BX1-.3,BY1-1.2,2.4],[BX0+1.2,BY0+.3,BX1-1.2,BY0+.3,2.4],[BX0+1.2,BY1-.3,BX1-1.2,BY1-.3,1.1]];
  for(const[x0,z0,x1,z1,hh]of sides){const L=Math.hypot(x1-x0,z1-z0),n=Math.round(L/2.5),ang=Math.atan2(x1-x0,z1-z0);
    for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;ms(box(.12,hh,.12,.02),ALU,x,hh/2,z,scene);}
    for(const y of[hh,.35]){const r=ms(box(.1,.1,L,.02),ALU,(x0+x1)/2,y,(z0+z1)/2,scene);r.rotation.y=ang;}
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(L,hh-.1),gm);gl.position.set((x0+x1)/2,hh/2,(z0+z1)/2);gl.rotation.y=ang+Math.PI/2;scene.add(gl);}
  // Plantage draußen (instanziert)
  const field=(x0,z0,cols,rows,t,dx,dz)=>{const im=new THREE.InstancedMesh(plantGeo(t,true),VC,cols*rows);let k=0;const m=new THREE.Matrix4();
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const s=.9+rnd()*.35;m.compose(new THREE.Vector3(x0+i*dx+(rnd()-.5)*.2,0,z0+j*dz+(rnd()-.5)*.2),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,rnd()*6.28,0)),new THREE.Vector3(s,s,s));im.setMatrixAt(k++,m);}
    im.castShadow=false;im.receiveShadow=true;scene.add(im);
    const soil=new THREE.Mesh(new THREE.PlaneGeometry(cols*dx+1,rows*dz+1),mat('#6a4a2e',{roughness:1}));soil.rotation.x=-Math.PI/2;soil.position.set(x0+(cols-1)*dx/2,-.03,z0+(rows-1)*dz/2);scene.add(soil);
    for(let j=0;j<rows;j++){const r=new THREE.Mesh(new THREE.PlaneGeometry(cols*dx+.6,.5),mat('#4a3220',{roughness:1}));r.rotation.x=-Math.PI/2;r.position.set(x0+(cols-1)*dx/2,-.02,z0+j*dz);scene.add(r);}};
  field(-20,BY0-7,26,7,'a',1.6,1.7);field(BX1+6,-14,6,18,'c',1.7,1.6);field(BX0-15,-12,6,16,'b',1.7,1.6);field(-12,BY1+7,16,4,'d',1.6,1.7);
  // Zaun
  const fenceM=mat('#b08a58',{roughness:.8});for(const[x0,z0,x1,z1]of[[-26,BY0-19,32,BY0-19],[-26,BY0-19,-26,BY1+16],[32,BY0-19,32,BY1+16],[-26,BY1+16,32,BY1+16]]){const L=Math.hypot(x1-x0,z1-z0),n=Math.round(L/2.4),ang=Math.atan2(x1-x0,z1-z0);
    for(let i=0;i<=n;i++)ms(box(.14,1.1,.14,.03),fenceM,x0+(x1-x0)*i/n,.55,z0+(z1-z0)*i/n,scene).castShadow=false;for(const y of[.45,.9]){const r=ms(box(.08,.1,L,.02),fenceM,(x0+x1)/2,y,(z0+z1)/2,scene);r.rotation.y=ang;r.castShadow=false;}}
  // Bäume und Hügel
  for(let i=0;i<46;i++){const a=rnd()*6.283,r=48+rnd()*60;tree(Math.cos(a)*r+2,Math.sin(a)*r,1+rnd()*.8);}
  for(let i=0;i<10;i++){const a=i/10*6.283+.3,r=140+rnd()*40;const h=ms(sph(40+rnd()*20,24,12),mat(['#6aa84a','#5a9a3a','#7ab85a'][i%3],{roughness:1}),Math.cos(a)*r,-22,Math.sin(a)*r,scene,1,.6,1);h.castShadow=false;}
  R3.rocks=[];
  // Folientunnel mit Setzlingen
  for(const[x,z]of[[-19,-16.5],[20,-17],[19.5,19.5]]){const d=new THREE.Group();d.position.set(x,0,z);scene.add(d);
    ms(box(5.4,.25,4.2,.05),WOOD,0,.12,0,d);ms(box(5.1,.06,3.9,.03),mat('#4a3220',{roughness:1}),0,.26,0,d);
    const sg=plantGeo('c',true);for(let i=0;i<4;i++)for(let j=0;j<3;j++){const m=ms(sg,VC,-1.8+i*1.2,.28,-1.2+j*1.2,d,.45);m.castShadow=false;}
    const foil=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.1,5.2,24,1,true,0,Math.PI),new THREE.MeshStandardMaterial({color:'#f4fbff',transparent:true,opacity:.28,roughness:.3,side:THREE.DoubleSide,depthWrite:false}));foil.rotation.z=Math.PI/2;foil.rotation.y=Math.PI/2;foil.position.y=.25;foil.rotation.order='YZX';d.add(foil);
    for(let i=0;i<5;i++){const rb=ms(tor(2.1,.04,Math.PI),ALU,-2.4+i*1.2,.25,0,d);rb.rotation.y=Math.PI/2;}}
  // Deko am Rand
  const block=(x,z,r)=>{if(Math.abs(x-M.x)<4&&z>-3&&z<11)return true;for(const p of PADS)if(Math.abs(x-p.x)<2.4&&Math.abs(z-p.y)<2)return true;
    for(const t of'abcd'){const c=CROPS[t],w=7*SP+1.5,h=4*SP+1.5,sz=t==='a'?8*SP+1.5:0;if(Math.abs(x-c.cx)<(sz||w)/2+r&&Math.abs(z-c.cy)<(sz||h)/2+r)return true;}
    for(const q of[[-19,-16.5],[20,-17],[19.5,19.5],[WB.x,WB.y],[TRASH.x,TRASH.y]])if(Math.hypot(x-q[0],z-q[1])<4.4)return true;return false;};
  const kinds=[barrel,sacks,tray,shelf,barrow,pots];let k=0;
  const spots=[];for(let x=BX0+3;x<BX1-3;x+=3.4){spots.push([x,BY0+1.5]);spots.push([x+1.7,BY1-1.5]);}for(let z=BY0+3;z<BY1-3;z+=3.4){spots.push([BX0+1.5,z]);spots.push([BX1-1.5,z+1.7]);}
  for(const[x,z]of spots){if(block(x,z,1))continue;const o=kinds[k++%kinds.length]();o.position.set(x,0,z);o.rotation.y=rnd()*6.28;scene.add(o);}
}
function barrel(){const g=new THREE.Group();ms(cyl(.42,.42,1.0,20),mat('#2f6ac0',{roughness:.45}),0,.5,0,g);for(const y of[.2,.8]){const r=ms(tor(.425,.03),mat('#24509a'),0,y,0,g);r.rotation.x=Math.PI/2;}ms(cyl(.36,.36,.02,20),mat('#4a8ad8',{transparent:true,opacity:.8,roughness:.05}),0,.98,0,g);ms(cyl(.03,.03,.3,6),ALU,.42,.15,0,g).rotation.z=Math.PI/2;return g;}
function sacks(){const g=new THREE.Group(),sm=mat('#c8b48a',{roughness:.95});for(const[x,y,z,r]of[[0,.18,0,0],[.5,.18,.1,.3],[.25,.5,.05,-.2]]){const s=ms(box(.5,.3,.75,.12),sm,x,y,z,g);s.rotation.y=r;ms(box(.3,.01,.3,.005),mat('#3f8a4a'),x,y+.15,z,g).rotation.y=r;}return g;}
function tray(){const g=new THREE.Group();ms(box(1.2,.7,.7,.04),WOOD,0,.35,0,g);ms(box(1.1,.1,.6,.02),mat('#2a2a2a'),0,.75,0,g);const sg=plantGeo('a',true);for(let i=0;i<4;i++)for(let j=0;j<2;j++)ms(sg,VC,-.4+i*.27,.8,-.14+j*.28,g,.18).castShadow=false;return g;}
function shelf(){const g=new THREE.Group();for(const s of[-1,1])ms(box(.06,1.5,.5,.01),WOOD,s*.6,.75,0,g);for(const y of[.3,.8,1.3])ms(box(1.26,.05,.5,.01),WOOD2,0,y,0,g);
  for(let i=0;i<3;i++){ms(cyl(.12,.1,.2,12),mat('#c0683a',{roughness:.8}),-.35+i*.35,.42,0,g);ms(cyl(.07,.07,.1,10),mat('#2f6ac0'),-.35+i*.35,.9,0,g);}return g;}
function barrow(){const g=new THREE.Group();const b=ms(box(.8,.35,1.1,.1),mat('#3f8a4a',{metalness:.4,roughness:.4}),0,.5,0,g);ms(box(.7,.08,1,.04),mat('#4a3220'),0,.66,0,g);const w=ms(cyl(.18,.18,.1,16),mat('#2a2a2a'),0,.18,.55,g);w.rotation.z=Math.PI/2;for(const s of[-1,1])ms(cyl(.03,.03,.9,6),ALU,s*.3,.45,-.7,g).rotation.x=1.2;return g;}
function pots(){const g=new THREE.Group();const sg=plantGeo('d',true);for(const[x,z]of[[0,0],[.6,.2],[-.3,.55]]){ms(cyl(.25,.2,.4,14),mat('#c0683a',{roughness:.8}),x,.2,z,g);ms(sg,VC,x,.38,z,g,.45);}return g;}
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
  // Ausgabe-Zonen
  O.sell=flatPlane(3.6,3.6,ringTex(T.css['--accent']));O.sell.position.set(M.sell.x,.03,M.sell.y);scene.add(O.sell);
  O.sellT=flatPlane(2.6,.65,textTex(T.text.sell,512,128,74,'#ffffff','rgba(0,0,0,.55)'));O.sellT.position.set(M.sell.x,.04,M.sell.y);scene.add(O.sellT);
  O.cashZ=flatPlane(3.1,3.1,ringTex(T.css['--gold'])); O.cashZ.position.set(M.pad.x,.03,M.pad.y);scene.add(O.cashZ);
  const v=new THREE.Group();v.position.set(M.pad.x,0,M.pad.y);scene.add(v);O.vault=v;
  ms(box(1.2,.6,.9,.06),WOOD,0,.3,0,v);ms(box(1.26,.05,.96,.02),WOOD2,0,.62,0,v);
  const reg=ms(box(.6,.32,.5,.06),mat('#c89a4a',{metalness:.75,roughness:.3}),-.2,.8,-.1,v);reg.rotation.x=-.15;for(let i=0;i<3;i++)for(let j=0;j<3;j++)ms(box(.08,.03,.06,.01),mat('#f4ecd4'),-.32+i*.12,.97-j*.02,-.02+j*.08,v);
  ms(box(.5,.18,.05,.02),mat('#1a2a1a'),-.2,1.05,-.32,v);ms(box(.3,.06,.02,.01),mat('#8fd65a',{emissive:'#8fd65a',emissiveIntensity:.8}),-.2,1.06,-.29,v);
  O.chips=[];for(let i=0;i<12;i++){const c=ITEM.cash();c.position.set(.35+((i%2)-.5)*.3,.65+Math.floor(i/2)*.045,(i%3)*.12-.12);v.add(c);O.chips.push(c);}
  // Trockenraum
  const lab=new THREE.Group();lab.position.set(WB.x,0,WB.y);scene.add(lab);O.lab=lab;
  ms(box(7.2,.9,1.5,.08),WOOD,0,.45,0,lab);ms(box(7.3,.08,1.6,.03),WOOD2,0,.93,0,lab);
  for(const s of[-1,1])ms(box(.12,2.8,.12,.02),WOOD,s*3.3,1.4,-.55,lab);for(const y of[2.65,2.15]){const b=ms(cyl(.035,.035,6.6,8),ALU,0,y,-.55,lab);b.rotation.z=Math.PI/2;}
  for(let i=0;i<14;i++){const x=-3+i*.46,y=i%2?2.15:2.65,t=i%3===0?'b':i%3===1?'a':'c';ms(cyl(.006,.006,.2,4),mat('#e8e0c8'),x,y-.1,-.55,lab).castShadow=false;const b=ms(budGeo(t),VCF,x,y-.2,-.55,lab,.9);b.rotation.x=Math.PI;}
  for(let i=0;i<5;i++){const j=ITEM.e();j.position.set(-1.6+i*.8,.97,.2);j.scale.setScalar(1.1);lab.add(j);}
  const fan=new THREE.Group();fan.position.set(2.7,1.5,.1);lab.add(fan);ms(cyl(.36,.36,.08,24),mat('#e8ecef',{metalness:.5,roughness:.3}),0,0,0,fan).rotation.x=Math.PI/2;
  const bl=new THREE.Group();bl.position.z=.06;fan.add(bl);for(let i=0;i<4;i++){const b=ms(box(.12,.3,.01,.005),mat('#5a8a4a'),0,.15,0,bl);const pv=new THREE.Group();pv.rotation.z=i*1.57;bl.add(pv);pv.add(b);}
  ms(cyl(.04,.04,.6,8),ALU,2.7,1.2,.1,lab);O.liq=bl;
  const lh=halo('#ffe8a0',2.4,.2);lh.position.y=2.6;lab.add(lh);O.labHalo=lh;
  O.labC=cnv(640,280);O.labT=ctex(O.labC);const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2),new THREE.MeshBasicMaterial({map:O.labT,transparent:true,toneMapped:false}));sign.position.set(0,3.6,-.7);lab.add(sign);
  ms(box(4.8,2.2,.08,.03),WOOD,0,3.6,-.76,lab);
  O.inZ=flatPlane(3,3,ringTex(T.css['--accent']));O.inZ.position.set(WB.inZ.x,.03,WB.inZ.y);scene.add(O.inZ);
  O.outZ=flatPlane(3,3,ringTex(T.css['--gold']));O.outZ.position.set(WB.outZ.x,.03,WB.outZ.y);scene.add(O.outZ);
  O.inL=flatPlane(2.2,.5,textTex('Zutaten',512,120,70,'#fff','rgba(0,0,0,.6)'));O.inL.position.set(WB.inZ.x,.04,WB.inZ.y+1.85);scene.add(O.inL);
  O.outL=flatPlane(2.2,.5,textTex('Fertig',512,120,70,'#fff','rgba(0,0,0,.6)'));O.outL.position.set(WB.outZ.x,.04,WB.outZ.y+1.85);scene.add(O.outL);
  O.outStack=[];for(let i=0;i<6;i++){const c=ITEM.e();c.position.set(WB.outZ.x+((i%3)-1)*.42,.02,WB.outZ.y+Math.floor(i/3)*.42-.2);scene.add(c);O.outStack.push(c);}
  // Kompost
  const rc=new THREE.Group();rc.position.set(TRASH.x,0,TRASH.y);scene.add(rc);
  O.trZ=flatPlane(2.4,2.4,ringTex('#c8b48a'));O.trZ.position.set(TRASH.x,.03,TRASH.y);scene.add(O.trZ);
  for(const[x,z,w,d]of[[0,.55,1.2,.1],[0,-.55,1.2,.1],[.55,0,.1,1.2],[-.55,0,.1,1.2]])for(let i=0;i<4;i++)ms(box(w,.16,d,.02),WOOD,x,.12+i*.22,z,rc);
  ms(box(1,.1,1,.02),mat('#4a3220',{roughness:1}),0,.82,0,rc);const lt=ms(box(1.02,.02,1.02,.005),mat('#7ab84a',{emissive:'#7ab84a',emissiveIntensity:.15}),0,.88,0,rc);O.trRing=lt;
  for(let i=0;i<5;i++){const l=new THREE.Mesh(mergeParts(fanParts(M4(0,0,0,-Math.PI/2,rnd()*6,0,.35),['#7a8a3a','#9a8a3a'])),VC);l.position.set((rnd()-.5)*.6,.9,(rnd()-.5)*.6);rc.add(l);}
  // Figuren
  O.pl=mkAstro();O.pl.root.scale.setScalar(1.12);scene.add(O.pl.root);
  O.dr=helpers.map(()=>{const d=mkDrone();scene.add(d.root);d.root.visible=false;return d;});
  O.chef=mkChefBot();O.chef.root.position.set(FORE.x,0,FORE.y);O.chef.root.rotation.y=-.6;scene.add(O.chef.root);
  O.wb=mkWaterBot();O.wb.noArm1=true;O.wb.arms[1].rotation.x=-.5;scene.add(O.wb.root);
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
  for(const t of'abcd'){const c=CROPS[t];if(!c.on())continue;const[cols,rows]=c.dims(),w=cols*SP+.9,h=rows*SP+.9;const g=new THREE.Group();g.position.set(c.cx,0,c.cy);
    for(const s of[-1,1]){ms(box(w,.45,.14,.03),WOOD,0,.225,s*(h/2-.07),g);ms(box(.14,.45,h,.03),WOOD,s*(w/2-.07),.225,0,g);ms(box(w+.04,.05,.18,.02),WOOD2,0,.47,s*(h/2-.07),g);ms(box(.18,.05,h+.04,.02),WOOD2,s*(w/2-.07),.47,0,g);}
    ms(box(w-.26,.1,h-.26,.03),mat('#3a281a',{roughness:1}),0,.36,0,g);
    for(let r=0;r<rows;r++){const d=ms(cyl(.015,.015,w-.4,6),mat('#1a1a1a',{roughness:.5}),0,.42,(r-(rows-1)/2)*SP+.32,g);d.rotation.z=Math.PI/2;d.castShadow=false;}
    const sc_=cnv(320,110),sg=sc_.getContext('2d');sg.fillStyle='#f4ecd4';rrc(sg,4,4,312,102,16);sg.fill();sg.lineWidth=6;sg.strokeStyle='#3f7a3a';sg.stroke();sg.fillStyle='#2f5a2a';sg.font='900 44px '+T.css['--font'];sg.textAlign='center';sg.textBaseline='middle';sg.fillText(T.strains[t],160,58);
    ms(cyl(.03,.03,.9,6),WOOD,0,.45,h/2+.25,g);const sb=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.52),mat('#ffffff',{map:ctex(sc_),roughness:.8}));sb.material=new THREE.MeshStandardMaterial({map:ctex(sc_),roughness:.8});sb.position.set(0,.95,h/2+.29);sb.rotation.x=-.35;g.add(sb);
    scene.add(g);O.beds.push(g);}}
function rebuildCounter(){if(O.counter)scene.remove(O.counter);const cl=queueCap()+.6,g=new THREE.Group();g.position.set(M.x+.2,0,M.y0+cl/2);O.counter=g;scene.add(g);
  ms(box(1.3,.95,cl,.06),WOOD,0,.475,0,g);ms(box(1.45,.08,cl+.14,.03),WOOD2,0,.99,0,g);ms(box(.03,.6,cl-.3,.01),mat('#3f8a4a',{roughness:.6}),-.66,.5,0,g);
  for(let z=-cl/2+.7;z<cl/2-.4;z+=1.4){const l=new THREE.Mesh(mergeParts(fanParts(M4(0,0,0,0,-Math.PI/2,0,.32),['#bff08a','#bff08a'])),mat('#ffffff',{vertexColors:true,side:THREE.DoubleSide,roughness:.6}));l.position.set(-.685,.38,z);g.add(l);}
  const items=TY.filter(t=>t==='a'||(t==='b'&&S.beehive1)||(t==='c'&&S.orchard1)||(t==='d'&&S.pumpkin1)||(t==='e'&&S.workbench));
  items.forEach((t,i)=>{const o=ITEM[t]();o.position.set(-.25,1.03,-cl/2+.6+i*.85);o.scale.setScalar(1.15);g.add(o);});
  for(const s of[-1,1])ms(box(.1,2.4,.1,.02),WOOD,s*1.1,1.2,-cl/2-.1,g);
  const hc=cnv(512,140),hg=hc.getContext('2d');hg.fillStyle='#3a6a2e';rrc(hg,4,4,504,132,22);hg.fill();hg.lineWidth=8;hg.strokeStyle='#e8d8a8';hg.stroke();hg.font='900 64px '+T.css['--font'];hg.textAlign='center';hg.textBaseline='middle';hg.fillStyle='#fff6dc';hg.fillText(T.market.name.toUpperCase(),256,74);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.66),new THREE.MeshStandardMaterial({map:ctex(hc),roughness:.7}));sg.position.set(0,2.05,-cl/2-.04);g.add(sg);O.holo=null;}
function paintLab(){const k=[WB.a,WB.b,WB.e,S.boutiqueLevel||0].join('|');if(O.labK===k)return;O.labK=k;const g=O.labC.getContext('2d'),w=640,h=280;g.clearRect(0,0,w,h);
  rrc(g,6,6,w-12,h-12,28);g.fillStyle='rgba(44,30,16,.94)';g.fill();g.lineWidth=8;g.strokeStyle='#8fd65a';g.stroke();
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
  if(S.workbench){paintLab();const k=WB.ct>0?1:0;O.liq.rotation.z+=dt*(k?14:4);O.labHalo.material.opacity=.3+k*.3;O.inZ.rotation.z=T0*.3;O.outZ.rotation.z=-T0*.3;}
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
  syncStack(P,P.inv,O.stack,14,.26,.85);O.stack.position.set(P.x-Math.sin(pl.root.rotation.y)*.5,1.3,P.y-Math.cos(pl.root.rotation.y)*.7);O.stack.rotation.y=pl.root.rotation.y;
  (P.__st||[]).forEach((q,i)=>{q.o.position.x=Math.sin(T0*3+i*.6)*.025*i*.3;q.o.rotation.y=Math.sin(T0+i)*.2;});
  /* Helfer */
  helpers.forEach((h,i)=>{const d=O.dr[i];d.root.visible=h.on;if(!h.on)return;d.root.position.set(h.x,0,h.y);yawTo(d.root,h,dt,8);
    walkAnim(d,h.mv,i*1.3);
    if(!h.__g){h.__g=new THREE.Group();scene.add(h.__g);}h.__g.visible=true;syncStack(h,h.inv,h.__g,10,.24,.75);h.__g.position.set(h.x,2.05,h.y);});
  O.chef.root.visible=!!S.foreman;if(S.foreman){O.chef.head.rotation.y=Math.sin(T0*.8)*.5;O.chef.b.position.y=Math.sin(T0*2)*.02;}
  O.wb.root.visible=!!S.gardener;if(S.gardener){O.wb.root.position.set(GARD.x,0,GARD.y);walkAnim(O.wb,GARD.mv,2);yawTo(O.wb.root,GARD,dt,6);}
  /* Kunden */
  for(const c of cust){if(!c.__m){const g=new THREE.Group(),a=ALIENS[c.k%ALIENS.length]();g.add(a);g.__a=a;scene.add(g);c.__m=g;CUST3.add(c);}
    const g=c.__m,mv=c.mv||c.leaving,w=walk*9+(c.ph||0);g.position.set(c.x,mv?Math.abs(Math.sin(w))*.03:0,c.y);
    if(c.leaving){const k=Math.min(1,c.t/1.15);g.__a.scale.setScalar(Math.max(.02,1-k*k));g.rotation.y=Math.atan2(1.2,2.2);}else g.rotation.y=-Math.PI/2*.62;if(g.__a.userData.p)walkAnim(g.__a.userData.p,mv,c.ph||0);
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
  for(const c of cust){if(c.leaving||c.need<=0)continue;const p=scr(c.x+1.0,1.75,c.y);if(p.ok)opill(ICON[c.type],''+c.need,p.x,p.y,fs*.88,'rgba(255,255,255,.95)','#1a1430');}
  if(M.cash>0){const p=scr(M.pad.x,1.6,M.pad.y);if(p.ok)opill(ICON.cash,fmt(M.cash),p.x,p.y,fs,'rgba(6,14,30,.85)','#ffe27a');}
  const full=P.inv.length>=capMax(),pp=scr(P.x,2.25+Math.min(P.inv.length,14)*.26,P.y);opill(null,full?'VOLL':P.inv.length+'/'+capMax(),pp.x,pp.y,fs*.85,full?T.css['--accent2']:'rgba(0,0,0,.65)','#fff');
  for(const q of pops){const p=scr(q.x,1.8,q.y);if(!p.ok)continue;ctx.globalAlpha=Math.min(1,(1.3-q.t)*1.5);const y=p.y-q.t*44;
    ctx.font='900 '+(fs*1.35)+'px '+T.css['--font'];ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=fs*.35;ctx.strokeStyle='rgba(0,0,0,.7)';
    if(q.coin&&ICON.cash){const tw=ctx.measureText(q.text).width;ctx.strokeText(q.text,p.x-fs*.8,y);ctx.fillStyle=q.color;ctx.fillText(q.text,p.x-fs*.8,y);ctx.drawImage(ICON.cash,p.x-fs*.8+tw/2+2,y-fs*.95,fs*1.9,fs*1.9);}
    else{ctx.strokeText(q.text,p.x,y);ctx.fillStyle=q.color;ctx.fillText(q.text,p.x,y);}ctx.globalAlpha=1;}
  if(joy.on){ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.6)';ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(joy.ox,joy.oy,JR,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(joy.x,joy.y,22,0,7);ctx.fill();}
  if(R.on){ctx.strokeStyle='rgba(120,230,255,'+(.3+.15*Math.sin(T0*10))+')';ctx.lineWidth=9;ctx.strokeRect(0,0,W,H);}
}

