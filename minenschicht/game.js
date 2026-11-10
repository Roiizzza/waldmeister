"use strict";

const $ = id => document.getElementById(id);
const saveKey = "minenschicht-01-v1";
const cell = 2.2, halfWidth = 10, depth = 25, roof = 2.8;
const stepHeight=.65, maxLayer=7;
const upgradeCost = 18, packCost = 28;
const catalog = [
  {name:"Stein", color:0x656164, value:2, time:.48},
  {name:"Kohle", color:0x343b40, value:5, time:.62},
  {name:"Kupfer", color:0x99583e, value:9, time:.76},
  {name:"Eisen", color:0x647984, value:14, time:1.05},
  {name:"Kristall", color:0x635284, value:44, time:1.45},
  {name:"Silber", color:0x71888b, value:25, time:1.2}
];
const fresh = () => ({cash:0, bag:[0,0,0,0,0,0], floors:{}, entries:{}, tool:0, pack:0, sold:0, dug:[], x:0, z:-7, yaw:0});
let state = fresh(), storageOK = true;
try {
  const saved = JSON.parse(localStorage.getItem(saveKey));
  if (saved && Array.isArray(saved.dug) && Array.isArray(saved.bag)) {
    state={...state,...saved,bag:catalog.map((_,i)=>saved.bag[i]??0)};
  }
} catch { storageOK = false; }
// Older saves stored only the upgrade, which was equipped automatically.
state.equipped ??= state.tool ? "steel" : "hand";

function boot() {
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x78959c);
scene.fog = new THREE.FogExp2(0x78959c,.024);
const camera = new THREE.PerspectiveCamera(65,1,.08,105);
const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
const mouseMode=matchMedia("(hover: hover) and (pointer: fine)").matches;
const look=$("look");
const mouseLocked=()=>document.pointerLockElement===look;
renderer.outputColorSpace = THREE.SRGBColorSpace;
$("game").append(renderer.domElement);
const sun = new THREE.DirectionalLight(0xffd8a6,2.1);
sun.position.set(-11,18,-14);
scene.add(sun,new THREE.HemisphereLight(0xc4e6f6,0x7c5e49,1.25));
const headlamp = new THREE.PointLight(0xffd09a,19,12,1.65);
scene.add(headlamp);
const unitBox = new THREE.BoxGeometry(1,1,1);
const matte = color => new THREE.MeshLambertMaterial({color});
const materials = new Map();
function material(color) {
  if (!materials.has(color)) materials.set(color,matte(color));
  return materials.get(color);
}
function box(parent,x,y,z,w,h,d,color) {
  const mesh = new THREE.Mesh(unitBox,material(color));
  mesh.position.set(x,y,z);
  mesh.scale.set(w,h,d);
  parent.add(mesh);
  return mesh;
}
function label(title,sub,x,y,z) {
  const canvas = document.createElement("canvas");
  canvas.width=512; canvas.height=150;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#142226"; ctx.fillRect(0,0,512,150);
  ctx.strokeStyle="#eab464"; ctx.lineWidth=6; ctx.strokeRect(4,4,504,142);
  ctx.textAlign="center"; ctx.fillStyle="#f7e6c3"; ctx.font="bold 57px system-ui"; ctx.fillText(title,256,69);
  ctx.fillStyle="#eab464"; ctx.font="bold 26px system-ui"; ctx.fillText(sub,256,115);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.25,.95),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  mesh.position.set(x,y,z); mesh.rotation.y=Math.PI; scene.add(mesh);
}
const key=(x,z)=>x+","+z;
const carved = new Set(state.dug);
for(let z=0;z<3;z++) carved.add(key(0,z));
const neighbors=[[0,-1],[-1,0],[1,0],[0,1]];
const floorLimit=-stepHeight*(maxLayer+1);
function solid(x,z) { return z>=0 && !carved.has(key(x,z)); }
function tileX(x) {return Math.floor(x/cell+.5);}
function tileZ(z) {return Math.floor(z/cell);}
function layerAt(x,z) {return state.floors[key(x,z)]??0;}
function floorAt(x,z) {return -stepHeight*layerAt(x,z);}
function ceilingAt(x,z) {return z<0?Infinity:roof-stepHeight*(state.entries[key(x,z)]??0);}
function hash(x,z) {const n=Math.sin(x*38.21+z*73.47+19.76)*48379.34; return n-Math.floor(n);}
function ore(x,z,layer,isFloor=false) {
  if(!isFloor && layer===0 && x===0 && z===3) return 1;
  if(!isFloor && layer===0 && x===0 && (z===4 || z===5)) return 2;
  const chance=hash(x+layer*13,z+(isFloor?47:0));
  if(layer>=6 && (chance>.91 || (isFloor && layer===6 && x===0))) return 4;
  if(layer>=4 && (chance>.70 || (isFloor && layer===4 && x===0))) return 5;
  if(layer>=2 && (chance>.61 || (isFloor && layer===2 && x===0))) return 3;
  if(chance>.69) return 2;
  if(chance>.35) return 1;
  return 0;
}
box(scene,0,-.31,-24,81,.62,48,0x817365);
box(scene,0,-.10,-7,15,.18,14,0x77736a);
box(scene,0,4.35,27.5,48,3.1,55,0x626666);
for(let i=0;i<19;i++) {
  const x=(i-9)*2.53, h=1+hash(i,42)*3;
  box(scene,x,5.85+h/2,.7+hash(i,33)*4,2.9,h,4+hash(i,61)*7, i%2?0x646666:0x777976);
}
for(let i=0;i<23;i++) {
  const x=(i%2===0?-1:1)*(8+hash(i,60)*24), z=-17+hash(i,53)*17;
  const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.45+hash(i,9),0),material(i%2?0x6f6b62:0x9a8b71));
  stone.position.set(x,.25,z); stone.rotation.y=i; scene.add(stone);
}
for(let z=-10;z<4;z+=.7) box(scene,0,.025,z,1.38,.05,.20,0x4e4038);
for(const x of [-.48,.48]) box(scene,x,.075,-3.3,.09,.05,14,0x89969a);
for(const x of [-1.18,1.18]) {
  box(scene,x,1.46,-.12,.22,2.92,.44,0x554036);
  box(scene,x,2.32,-.37,.19,.19,.14,0xffc568);
}
box(scene,0,2.82,-.19,2.65,.28,.52,0x775742);
label("STOLLEN 01","ZUTRITT / ABBAU",0,3.48,-.32);
const base = new THREE.Vector3(3.4,0,-6.6);
box(scene,3.75,.06,-6.2,4.3,.16,3.5,0x5d5750);
box(scene,4.55,1.28,-5,2.7,2.48,.12,0x485451);
box(scene,4.55,2.65,-6.1,3.25,.22,2.55,0x3e5657);
for(const x of [3.0,6.05]) box(scene,x,1.34,-7.2,.14,2.68,.14,0x444a48);
box(scene,4.4,.58,-6.35,1.42,1.05,.94,0x895f3d);
box(scene,4.4,1.12,-6.35,1.56,.12,1.04,0xb5814b);
box(scene,4.4,.76,-6.83,.24,.20,.07,0xeabd72);
label("BASIS","VERKAUF / WERKBANK",4.52,3.12,-7.33);
const marker = new THREE.Mesh(new THREE.RingGeometry(.60,.69,40),new THREE.MeshBasicMaterial({color:0xffbc61,side:THREE.DoubleSide}));
marker.rotation.x=-Math.PI/2; marker.position.set(base.x,.153,base.z); scene.add(marker);

const faces=new THREE.Group(), targets=[];
scene.add(faces);
const palette=[0x92877f,0x171d24,0xf19554,0xaed2dc,0xcf95ff,0xd2f2e9];
function rockFlecks(x,z,y,dx,dz,type) {
  const centerX=x*cell, centerZ=(z+.5)*cell;
  for(let i=0;i<(type?4:2);i++) {
    const off=(hash(x+11*i,z+dx-dz)-.5)*1.65;
    const size=.10+hash(x+i,z+11)*.17;
    const f=box(faces,centerX+dx*cell*.5+dz*off,y+.26+hash(x+i*17,z+8)*1.13,
      centerZ+dz*cell*.5+dx*off,dx?.055:size*1.6,size,dz?.055:size*1.6,palette[type]);
    if(dz) f.rotation.z=.31*i;
    if(dx) f.rotation.x=.37*i;
  }
}
function rock(x,z,bottom,top,color,data) {
  if(top-bottom<.005) return;
  const mesh=box(faces,x*cell,(bottom+top)*.5,(z+.5)*cell,cell,top-bottom,cell,color);
  mesh.userData=data;
  mesh.updateMatrixWorld();
  targets.push(mesh);
}
function rebuild() {
  faces.clear(); targets.length=0;
  for(let z=0;z<depth;z++) for(let x=-halfWidth;x<=halfWidth;x++) {
    const id=key(x,z);
    if(carved.has(id)) {
      const floor=floorAt(x,z), layer=layerAt(x,z);
      const type=ore(x,z,layer+1,true);
      rock(x,z,floorLimit,floor,layer%2?0x625247:0x6b6056,{x,z,kind:"floor"});
      rock(x,z,ceilingAt(x,z),roof,0x565355,{kind:"ceiling"});
      if(z>=3 && layer<maxLayer && type>0) {
        for(let i=0;i<4;i++) {
          const fleck=box(faces,(x+(hash(x+i,z+31)-.5)*.76)*cell,floor+.012,
            (z+.5+(hash(x+29,z+i)-.5)*.76)*cell,.12+i*.048,.026,.14+i*.031,palette[type]);
          fleck.rotation.y=.4+i*.8;
        }
      }
      continue;
    }
    const exposed=neighbors.filter(([dx,dz])=>!solid(x+dx,z+dz));
    if(!exposed.length) continue;
    const shade=new THREE.Color(0x665f5d).multiplyScalar(.83+hash(x+5,z+2)*.31).getHex();
    rock(x,z,floorLimit,roof,shade,{x,z,kind:"wall"});
    for(const [dx,dz] of exposed) {
      const layer=layerAt(x+dx,z+dz);
      rockFlecks(x,z,-stepHeight*layer,dx,dz,ore(x,z,layer));
    }
  }
  // Limits are real rock so the ray cannot select a face beyond the mine.
  const width=(halfWidth*2+1)*cell, midY=(roof+floorLimit)*.5;
  const boundaries=[
    box(faces,0,midY,(depth+.5)*cell,width,roof-floorLimit,cell,0x4d4848),
    ...[-1,1].map(side=>box(faces,side*(halfWidth+1)*cell,midY,depth*cell*.5,cell,roof-floorLimit,depth*cell,0x4d4848))
  ];
  for(const mesh of boundaries) {mesh.userData.kind="ceiling";mesh.updateMatrixWorld();targets.push(mesh);}
}
function floorRestriction(x,z) {
  if(z<3) return "Boden am Eingang ist abgestützt";
  if(layerAt(x,z)>=maxLayer) return "Festes Grundgestein";
  const floor=floorAt(x,z), next=floor-stepHeight;
  const adjacent=neighbors.filter(([dx,dz])=>!solid(x+dx,z+dz)).map(([dx,dz])=>floorAt(x+dx,z+dz));
  const linked=adjacent.filter(height=>Math.abs(height-floor)<=stepHeight+.01);
  if(!linked.length || linked.some(height=>Math.abs(height-next)>stepHeight+.01)) return "Erst den Abstieg als Treppe weitergraben";
  return "";
}
rebuild();
const player=new THREE.Group(); scene.add(player);
const leftLeg=box(player,-.16,.36,0,.24,.69,.29,0x35454b);
const rightLeg=box(player,.16,.36,0,.24,.69,.29,0x35454b);
box(player,0,.93,0,.61,.58,.36,0xd18d42);
box(player,0,.95,-.24,.42,.48,.19,0x39494b);
box(player,0,1.39,.025,.35,.29,.32,0xb8835e);
box(player,0,1.57,.04,.48,.15,.42,0xf2bc52);
box(player,0,1.54,.23,.20,.11,.10,0xffe0a3);
box(player,-.38,.98,.015,.16,.45,.18,0xb77735);
const arm=new THREE.Group(); arm.position.set(.38,1.15,0); player.add(arm);
box(arm,0,-.18,0,.16,.43,.18,0xc88a44);
box(arm,0,-.33,.24,.08,.08,.49,0x9a6638);
const pickHead=box(arm,0,-.34,.48,.35,.095,.08,0xa2b5b9);
// The first-person pick follows the camera instead of the character model.
scene.add(camera);
const hand=new THREE.Group();
camera.add(hand);
box(hand,0,-.13,0,.12,.15,.31,0xc88a44);
const handGrip=box(hand,0,0,-.10,.055,.43,.055,0x9a6638);
handGrip.rotation.z=-.32;
const handPick=box(hand,.062,.20,-.10,.27,.075,.085,0xa2b5b9);
handPick.rotation.z=.25;
const contact=new THREE.Mesh(new THREE.RingGeometry(.10,.155,18),
  new THREE.MeshBasicMaterial({color:0xffd18a,side:THREE.DoubleSide,transparent:true,opacity:.82}));
contact.visible=false; scene.add(contact);
const faceNormal=new THREE.Vector3(), facing=new THREE.Vector3(0,0,1), normalMatrix=new THREE.Matrix3();
const chips=Array.from({length:18},()=> {
  const mesh=box(scene,0,0,0,.07,.07,.07,0xab9078);
  mesh.visible=false;
  return {mesh,velocity:new THREE.Vector3(),life:0};
});
function chipBurst(hit,type) {
  for(const chip of chips) {
    chip.mesh.position.copy(hit.point).addScaledVector(faceNormal,.065);
    chip.mesh.material=material(palette[type]);
    chip.velocity.set((Math.random()-.5)*3,Math.random()*2.3,(Math.random()-.5)*3).addScaledVector(faceNormal,1.45);
    chip.life=.24+Math.random()*.32;
    chip.mesh.visible=true;
  }
}
const pos=new THREE.Vector3(state.x,floorAt(tileX(state.x),tileZ(state.z)),state.z);
const lookAt=new THREE.Vector3(), direction=new THREE.Vector3(), camAnchor=new THREE.Vector3();
let lockAttempt=0, verticalSpeed=0, eyeHeight=1.64;
let yaw=state.yaw, pitch=-.04, paused=true, screen="start", held=false, progress=0, focus=null, toastUntil=0, swing=0;
const keys=new Set(), stick={x:0,y:0,id:null}, ray=new THREE.Raycaster();
const bagCount=()=>state.bag.reduce((total,n)=>total+n,0);
const capacity=()=>state.pack?14:8;
const bagValue=()=>state.bag.reduce((total,n,i)=>total+n*catalog[i].value,0);
const steelEquipped=()=>state.equipped==="steel" && !!state.tool;
const nearBase=()=>Math.hypot(pos.x-base.x,pos.z-base.z)<2.7;
function save() {
  state.x=pos.x; state.z=pos.z; state.yaw=yaw;
  try {localStorage.setItem(saveKey,JSON.stringify(state)); storageOK=true;}
  catch {storageOK=false;}
}
function toast(message) { $("toast").textContent=message; toastUntil=performance.now()+2600; }
function hud() {
  $("money").textContent=state.cash+" Cr";
  $("bag").textContent=bagCount()+" / "+capacity();
  $("tool").textContent=steelEquipped()?"Stahlspitzhacke":"Handspitzhacke";
  pickHead.material=handPick.material=material(steelEquipped()?0xc8d9e2:0x898984);
  const [goal,detail]=steelEquipped()?["In die Tiefe graben","Im Stollen auf den Boden zielen. Nach jeder Stufe vorne weitergraben."]:
    state.tool?["Stahlspitzhacke ausrüsten","Öffne unten das Inventar."]:
    state.cash>=upgradeCost?["Stahlspitzhacke kaufen","Werkbank in der Basis · "+upgradeCost+" Cr"]:
    bagCount()>0?["Erste Ladung verkaufen","Gelber Ring vor der Basis"]:
    ["Dem Stollen folgen",mouseMode?"Ziele auf Gestein und halte F gedrückt.":"Halte »Abbauen« an einer markierten Wand."];
  $("goal").textContent=goal; $("detail").textContent=detail;
}
function shop() {
  $("inventory").textContent=state.bag.map((n,i)=>n?n+" × "+catalog[i].name:"").filter(Boolean).join(" · ")||"Dein Rucksack ist leer.";
  $("sell").textContent="Ladung verkaufen · "+bagValue()+" Cr";
  $("sell").disabled=!bagCount();
  $("upgrade").textContent=state.tool?"Stahlspitzhacke bereits gekauft":"Stahlspitzhacke · "+upgradeCost+" Cr";
  $("upgrade").disabled=!!state.tool || state.cash<upgradeCost;
  $("pack").textContent=state.pack?"Großer Rucksack ausgerüstet":"Großer Rucksack · "+packCost+" Cr";
  $("pack").disabled=!!state.pack || state.cash<packCost;
}
function equipment() {
  for(const [id,tool,name] of [["hand-tool","hand","Handspitzhacke"],["steel-tool","steel","Stahlspitzhacke"]]) {
    const button=$(id);
    const active=state.equipped===tool;
    button.disabled=tool==="steel"&&!state.tool;
    button.setAttribute("aria-pressed",String(active));
    button.textContent=name+" · "+(active?"Ausgerüstet":button.disabled?"An der Werkbank erhältlich":"Ausrüsten");
  }
}
function equip(tool) {
  if(screen!=="equipment" || (tool==="steel"&&!state.tool)) return;
  state.equipped=tool;
  hud(); equipment(); save();
}
function clearInput() {
  keys.clear(); held=false; stick.id=null; stick.x=stick.y=0; lookID=null;
  $("stick").firstElementChild.style.transform="";
}
function panel(next) {
  clearInput();
  screen=next;
  paused=true;
  lockAttempt++;
  if(mouseLocked()) document.exitPointerLock();
  save();
  $("overlay").hidden=false;
  const isShop=next==="shop", isEquipment=next==="equipment";
  $("shop").hidden=!isShop;
  $("equipment-panel").hidden=!isEquipment;
  $("controls").hidden=isShop||isEquipment;
  $("tag").textContent=isShop?"BASIS / HANDEL":isEquipment?"AUSRÜSTUNG":"REVIER 01 / PROTOTYP";
  $("title").textContent=isShop?"Deine Basis":isEquipment?"Inventar":"Schicht pausiert";
  $("intro").textContent=isShop?"Verkaufe dein Erz und rüste dich für die nächste Ladung aus.":
    isEquipment?"Wähle die Spitzhacke für deine nächste Ladung.":
    storageOK?"Spielstand auf diesem Gerät gespeichert.":"Der Browser konnte den Spielstand nicht speichern.";
  $("start").textContent=isShop||isEquipment?"Zurück zur Mine":"Weiterspielen";
  if(isShop) shop();
  if(isEquipment) equipment();
}
function interact() {
  if(paused) return;
  if(nearBase()) panel("shop");
  else toast("Verkauf und Werkbank findest du am gelben Ring in der Basis.");
}
$("start").textContent=state.dug.length?"Schicht fortsetzen":"Schicht starten";
function requestMouse() {
  if(!mouseMode || mouseLocked()) return;
  const attempt=++lockAttempt;
  function unavailable() {
    if(attempt===lockAttempt && !paused && !mouseLocked()) toast("Mausfang nicht verfügbar. Zum Umschauen mit gedrückter Maustaste ziehen.");
  }
  if(!look.requestPointerLock) {unavailable(); return;}
  try {look.requestPointerLock()?.catch(unavailable);}
  catch {unavailable();}
}
$("start").onclick=()=>{
  paused=false; screen="play"; $("overlay").hidden=true;
  document.activeElement?.blur?.();
  requestMouse();
};
let wasLocked=false;
document.addEventListener("pointerlockchange",()=>{
  const locked=mouseLocked();
  if(locked && paused) {document.exitPointerLock(); return;}
  if(wasLocked && !locked && !paused) panel("pause");
  wasLocked=locked;
});
document.addEventListener("pointerlockerror",()=>{
  if(!paused && !mouseLocked()) toast("Mausfang nicht verfügbar. Zum Umschauen mit gedrückter Maustaste ziehen.");
});
document.addEventListener("mousemove",e=>{
  if(!paused && mouseLocked()) {
    const _g=window.GSET||{},_s=_g.sens||1,_ix=_g.invX?-1:1,_iy=_g.invY?-1:1;yaw-=e.movementX*.0025*_s*_ix;
    pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0025*_s*_iy,-1.48,1.48);
  }
});
$("use").onclick=interact;
$("equipment").onclick=()=>{if(!paused) panel("equipment");};
$("hand-tool").onclick=()=>equip("hand");
$("steel-tool").onclick=()=>equip("steel");
$("menu").onclick=()=>{if(!paused) panel("pause");};
$("sell").onclick=()=>{
  if(screen!=="shop"||!bagCount()) return;
  const value=bagValue(); state.cash+=value; state.sold+=bagCount(); state.bag.fill(0);
  shop(); hud(); save(); toast("Ladung verkauft · +"+value+" Cr");
};
$("upgrade").onclick=()=>{
  if(screen!=="shop"||state.tool||state.cash<upgradeCost) return;
  state.cash-=upgradeCost; state.tool=1; shop(); hud(); save(); toast("Stahlspitzhacke gekauft · im Inventar ausrüsten");
};
$("pack").onclick=()=>{
  if(screen!=="shop"||state.pack||state.cash<packCost) return;
  state.cash-=packCost; state.pack=1; shop(); hud(); save(); toast("Rucksack auf 14 Plätze erweitert");
};
$("mine").onpointerdown=e=>{if(paused) return; held=true; $("mine").setPointerCapture(e.pointerId);};
for(const event of ["pointerup","pointercancel","lostpointercapture"]) $("mine").addEventListener(event,()=>{held=false;});
function stickMove(e) {
  const rect=$("stick").getBoundingClientRect();
  const x=(e.clientX-rect.left-rect.width/2)/32, y=(e.clientY-rect.top-rect.height/2)/32;
  const length=Math.max(1,Math.hypot(x,y)); stick.x=x/length; stick.y=y/length;
  $("stick").firstElementChild.style.transform="translate("+stick.x*30+"px,"+stick.y*30+"px)";
}
$("stick").onpointerdown=e=>{
  if(paused||stick.id!==null) return;
  stick.id=e.pointerId; $("stick").setPointerCapture(e.pointerId); stickMove(e);
};
$("stick").onpointermove=e=>{if(e.pointerId===stick.id) stickMove(e);};
for(const event of ["pointerup","pointercancel","lostpointercapture"]) $("stick").addEventListener(event,e=>{
  if(e.pointerId!==stick.id) return;
  stick.id=null; stick.x=stick.y=0; $("stick").firstElementChild.style.transform="";
});
let lookID=null, lx=0, ly=0;
$("look").onpointerdown=e=>{
  if(paused) return;
  if(e.pointerType==="mouse" && mouseMode) {
    if(e.button===2) {interact(); return;}
    if(e.button!==0) return;
    if(mouseLocked()) return;
  }
  if(lookID!==null) return;
  lookID=e.pointerId; lx=e.clientX; ly=e.clientY; $("look").setPointerCapture(e.pointerId);
};
$("look").onpointermove=e=>{
  if(e.pointerId!==lookID) return;
  const _g=window.GSET||{},_s=_g.sens||1,_ix=_g.invX?-1:1,_iy=_g.invY?-1:1;yaw-=(e.clientX-lx)*.006*_s*_ix;
  pitch=mouseMode?THREE.MathUtils.clamp(pitch-(e.clientY-ly)*.004*_s*_iy,-1.48,1.48):
    THREE.MathUtils.clamp(pitch+(e.clientY-ly)*.006*_s*_iy,-1.45,.50);
  lx=e.clientX; ly=e.clientY;
};
for(const event of ["pointerup","pointercancel","lostpointercapture"]) $("look").addEventListener(event,e=>{if(e.pointerId===lookID) lookID=null;});
look.addEventListener("contextmenu",e=>e.preventDefault());
window.addEventListener("keydown",e=>{
  if(e.target instanceof HTMLButtonElement && (e.code==="Space"||e.code==="Enter")) return;
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
  if(e.code==="Escape") {
    if(e.repeat || screen==="start" || mouseLocked()) return;
    if(screen==="shop" || screen==="equipment") $("start").click();
    else if(!paused) panel("pause");
    return;
  }
  if(paused) {
    if(screen==="equipment" && e.code==="KeyE" && !e.repeat) $("start").click();
    return;
  }
  if(e.code==="KeyG"&&!e.repeat) interact();
  else if((e.code==="KeyE"||e.code==="KeyI")&&!e.repeat) panel("equipment");
  else {
    if(e.code==="Space" && !e.repeat && pos.y<=floorAt(tileX(pos.x),tileZ(pos.z))+.01) verticalSpeed=4.25;
    keys.add(e.code);
  }
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",clearInput);
window.addEventListener("pagehide",save);
document.addEventListener("visibilitychange",()=>{
  if(document.hidden&&screen==="play") panel("pause");
});
function resize() {
  const maxPixelRatio=Math.sqrt(4_200_000/(innerWidth*innerHeight));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.45,maxPixelRatio));
  renderer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  if(matchMedia("(pointer: coarse) and (orientation: portrait)").matches && !paused) panel("pause");
}
window.addEventListener("resize",resize); resize(); hud();
function blocked(x,z,r=.25,height=pos.y) {
  if(Math.abs(x)>22 || z< -15 || z>depth*cell-.4) return true;
  for(const dx of [-r,r]) for(const dz of [-r,r]) {
    const tx=tileX(x+dx), tz=tileZ(z+dz);
    if(solid(tx,tz) || floorAt(tx,tz)>height+stepHeight+.02 || ceilingAt(tx,tz)<height+1.64) return true;
  }
  return false;
}
function animateCamera() {
  direction.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  hand.visible=mouseMode&&!paused;
  if(mouseMode) {
    camAnchor.set(pos.x,pos.y+eyeHeight,pos.z);
    camera.position.copy(camAnchor);
    lookAt.copy(camera.position).add(direction);
    camera.lookAt(lookAt); camera.updateMatrixWorld();
    player.visible=false;
    return;
  }
  const rightX=-Math.cos(yaw), rightZ=Math.sin(yaw);
  camAnchor.set(pos.x,pos.y+1.65,pos.z);
  if(!blocked(pos.x+rightX*.38,pos.z+rightZ*.38,.13)) {
    camAnchor.x+=rightX*.38; camAnchor.z+=rightZ*.38;
  }
  let boom=0;
  const max=pitch<-.65?.28:pos.z>=0?2.05:3.75;
  for(let d=.12;d<=max;d+=.12) {
    const x=camAnchor.x-direction.x*d, z=camAnchor.z-direction.z*d, y=camAnchor.y-direction.y*d;
    const tx=tileX(x), tz=tileZ(z);
    if(solid(tx,tz) || y>ceilingAt(tx,tz)-.13 || y<floorAt(tx,tz)+.13) break;
    boom=d;
  }
  camera.position.copy(camAnchor).addScaledVector(direction,-boom);
  lookAt.copy(camera.position).add(direction);
  camera.lookAt(lookAt); camera.updateMatrixWorld();
  player.visible=boom>.55;
}
let previous=performance.now(), elapsed=0, autosave=0, warned=false;
function tick(now) {
  const dt=Math.min(.045,(now-previous)/1000); previous=now; elapsed+=dt;
  if(!paused) {
    if(keys.has("KeyQ")) yaw+=dt*1.8;
    if(keys.has("KeyR")) yaw-=dt*1.8;
    const side=stick.x+Number(keys.has("KeyD")||keys.has("ArrowRight"))-Number(keys.has("KeyA")||keys.has("ArrowLeft"));
    const forward=-stick.y+Number(keys.has("KeyW")||keys.has("ArrowUp"))-Number(keys.has("KeyS")||keys.has("ArrowDown"));
    const amount=Math.min(1,Math.hypot(side,forward));
    const sneaking=keys.has("KeyC");
    const sprinting=keys.has("ShiftLeft")||keys.has("ShiftRight");
    const speed=(sneaking?1.65:sprinting?5.5:3.6)*dt/Math.max(1,Math.hypot(side,forward));
    eyeHeight=THREE.MathUtils.lerp(eyeHeight,sneaking?1.25:1.64,Math.min(1,dt*14));
    const x=pos.x+(forward*Math.sin(yaw)-side*Math.cos(yaw))*speed;
    const z=pos.z+(forward*Math.cos(yaw)+side*Math.sin(yaw))*speed;
    if(!blocked(x,pos.z)) pos.x=x;
    if(!blocked(pos.x,z)) pos.z=z;
    const tx=tileX(pos.x), tz=tileZ(pos.z), floor=floorAt(tx,tz);
    if(verticalSpeed!==0 || pos.y>floor) {
      verticalSpeed-=13.5*dt;
      pos.y=Math.min(ceilingAt(tx,tz)-1.71,Math.max(floor,pos.y+verticalSpeed*dt));
      if(pos.y<=floor || (pos.y>=ceilingAt(tx,tz)-1.71 && verticalSpeed>0)) verticalSpeed=0;
    } else pos.y=floor;
    swing+=dt*12*amount;
    leftLeg.rotation.x=Math.sin(swing)*.55*amount;
    rightLeg.rotation.x=-leftLeg.rotation.x;
    autosave+=dt;
    if(autosave>=3) {autosave=0; save();}
  }
  player.position.copy(pos); player.rotation.y=yaw;
  animateCamera();
  sun.intensity=pos.z>=0?.39:2.1;
  headlamp.position.set(pos.x+direction.x*.31,pos.y+1.68,pos.z+direction.z*.31);
  headlamp.intensity=pos.z>=0?21:7;
  const mining=!paused&&(held||keys.has("KeyF"));
  ray.set(camera.position,direction);
  ray.far=mouseMode?3.05:7;
  const hit=paused?null:ray.intersectObjects(targets,false)[0];
  const block=hit && hit.object.userData.kind!=="ceiling" && hit.point.distanceTo(camAnchor)<3.05?hit.object:null;
  if(block!==focus||!mining) progress=0;
  focus=block;
  contact.visible=!!block;
  $("target").hidden=!block;
  $("reticle").hidden=paused;
  arm.rotation.x=mining&&block?-.7+Math.sin(elapsed*23)*.65:0;
  hand.position.set(.40,-.32+Math.abs(Math.sin(swing))*.014,-.57);
  hand.rotation.x=mining&&block?Math.sin(elapsed*23)*.55-.25:-.12;
  if(block) {
    const {x,z,kind}=block.userData, diggingDown=kind==="floor";
    const playerLayer=layerAt(tileX(pos.x),tileZ(pos.z));
    const layer=diggingDown?layerAt(x,z)+1:playerLayer;
    const type=ore(x,z,layer,diggingDown), resource=catalog[type];
    const obstruction=diggingDown?floorRestriction(x,z):"";
    const locked=type>=3&&!steelEquipped();
    const reason=obstruction || (locked?"Stahlspitzhacke nötig":"");
    faceNormal.copy(hit.face.normal).applyMatrix3(normalMatrix.getNormalMatrix(block.matrixWorld)).normalize();
    contact.position.copy(hit.point).addScaledVector(faceNormal,.022);
    contact.quaternion.setFromUnitVectors(facing,faceNormal);
    contact.material.color.setHex(reason?0xc87761:0xffd18a);
    $("target").firstElementChild.textContent=reason ||
      (mouseMode?"[F] ":"")+(diggingDown?"Boden öffnen · ":"Stollen treiben · ")+resource.name;
    if(mining && !reason && bagCount()<capacity()) {
      progress+=dt/(resource.time*(diggingDown?1.32:1)*(steelEquipped()?.60:1));
      if(progress>=1) {
        const id=key(x,z);
        if(diggingDown) state.floors[id]=layer;
        else {
          carved.add(id); state.dug.push(id);
          state.entries[id]=layer;
          state.floors[id]=layer;
        }
        state.bag[type]++;
        chipBurst(hit,type);
        rebuild(); hud(); save(); progress=0; focus=null;
        toast((diggingDown?"Abstieg auf "+(layer*stepHeight).toFixed(1).replace(".",",")+" m · ":"")+"+"+resource.name+
          (bagCount()===capacity()?" · Rucksack voll":""));
      }
    } else if(mining && !warned && (reason || bagCount()>=capacity())) {
      warned=true; toast(reason||"Rucksack voll · zur Basis zurück.");
    }
    $("target").lastElementChild.value=progress;
  }
  for(const chip of chips) if(chip.life>0) {
    chip.life-=dt;
    chip.velocity.y-=7*dt;
    chip.mesh.position.addScaledVector(chip.velocity,dt);
    if(chip.life<=0) chip.mesh.visible=false;
  }
  if(!mining) warned=false;
  $("place").textContent=pos.z<0?"ÜBER TAGE":"TIEFE "+(-floorAt(tileX(pos.x),tileZ(pos.z))).toFixed(1).replace(".",",")+" m";
  $("use-label").textContent=nearBase()?"Werkbank":"Interaktion";
  $("shop-hint").hidden=paused||!mouseMode||!nearBase();
  if(now>toastUntil && $("toast").textContent) $("toast").textContent="";
  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
}
try {boot();}
catch (error) {
  console.error(error);
  $("title").textContent="3D-Ansicht nicht verfügbar";
  $("intro").textContent="Das Spiel braucht WebGL. Öffne den Link in einem Browser mit aktivierter 3D-Beschleunigung.";
  $("start").hidden=true; $("controls").hidden=true;
}
