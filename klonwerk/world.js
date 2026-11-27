const T=window.THREE;
const C={navy:0x213e48,teal:0x357d7c,light:0x8fc4bc,cream:0xffe5aa,orange:0xf29339,blue:0x3688aa,steel:0x586d70,yellow:0xffc354};
export function makeWorld(canvas){
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene();scene.background=new T.Color(0xa6d0cd);scene.fog=new T.FogExp2(0xb5d6ce,.009);
  const camera=new T.PerspectiveCamera(41,1,.12,230);
  scene.add(new T.HemisphereLight(0xfffaf0,0x86a8ae,.73));
  const sun=new T.DirectionalLight(0xffebc5,.85);sun.position.set(-23,42,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-48,right:48,top:39,bottom:-39,far:118});sun.shadow.bias=-.0005;sun.shadow.normalBias=.045;scene.add(sun);
  const mats=new Map(),prototype=new Map(),batches=new Map(),helper=new T.Object3D();
  const material=c=>{if(!mats.has(c))mats.set(c,new T.MeshLambertMaterial({color:new T.Color(c).convertSRGBToLinear(),flatShading:true}));return mats.get(c);};
  prototype.set('box',new T.BoxGeometry(1,1,1));prototype.set('tube',new T.CylinderGeometry(.5,.5,1,12));prototype.set('ball',new T.IcosahedronGeometry(.5,1));
  const up=new T.Vector3(0,1,0);
  function shape(kind,c,x,y,z,w,h,d,parent=null,rz=0,ry=0){
    if(parent){
      const m=new T.Mesh(prototype.get(kind),material(c));m.position.set(x,y,z);m.scale.set(w,h,d);m.rotation.set(0,ry,rz);m.castShadow=true;parent.add(m);return m;
    }
    helper.position.set(x,y,z);helper.rotation.set(0,ry,rz);helper.scale.set(w,h,d);helper.updateMatrix();
    const key=kind+'-'+c;if(!batches.has(key))batches.set(key,{kind,c,ms:[]});batches.get(key).ms.push(helper.matrix.clone());
  }
  const box=(...p)=>shape('box',...p),tube=(...p)=>shape('tube',...p),ball=(...p)=>shape('ball',...p);
  function beam(a,b,width,c,p=null){
    const a1=new T.Vector3(...a),v=new T.Vector3(...b).sub(a1),mid=a1.clone().addScaledVector(v,.5);
    const m=new T.Mesh(prototype.get('box'),material(c));m.position.copy(mid);m.quaternion.setFromUnitVectors(up,v.clone().normalize());m.scale.set(width,v.length(),width);(p||scene).add(m);return m;
  }
  function group(x,y,z,parent=scene){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function sign(str,x,y,z,w,h,bg='#203f45',fg='#ffe6af',parent=scene){
    const cv=document.createElement('canvas');cv.width=768;cv.height=128;
    const ctx=cv.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,128);ctx.fillStyle=fg;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 77px Arial,sans-serif';ctx.fillText(str,384,69,717);
    const tex=new T.CanvasTexture(cv);tex.encoding=T.sRGBEncoding;tex.anisotropy=4;
    const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  function shadow(x,z,w,d){box(0x878d7e,x+.35,.019,z+.11,w,.014,d);}
  let seed=29;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  // Sea, quay slabs, stone coping and individual dock pilings.
  box(0x3d9fa7,0,-1.65,-30,400,.4,400);
  box(0x80887e,0,-.85,5,80,1.65,38);
  for(let j=0;j<5;j++)for(let i=0;i<11;i++)box([0xbdb7a2,0xc7bea7,0xc4bba3,0xc1b9a3][Math.floor(rand()*4)],-36+i*7.2,-.037,-10+j*7.3,7.17,.075,7.27);
  for(let x=-39;x<41;x+=2.6){box(0xe2d1ad,x,.12,-13.35,2.52,.24,1);if(Math.round(x*10)%2===0) tube(C.navy,x,-.7,-13.94,.5,1.65,.5);}
  for(let i=0;i<260;i++){const x=rand()*175-85,z=-15-rand()*90;box(i%3?0x68b5b5:0x96ccbf,x,-1.425,z,.5+rand()*3,.02,.06+rand()*.11);}
  for(let x=-36;x<38;x+=3.2){box(0xe5d9aa,x,.025,7.7,1.5,.02,.14);box(0xf2d37f,x,.025,10.1,3.18,.02,.09);}
  for(let i=0;i<85;i++){let x=rand()*74-36,z=rand()*32-12;box(0xb1ad98,x,.01,z,.1+rand()*.5,.013,.035);}
  function container(x,y,z,w,h,d,c,mark){
    box(c,x,y+h/2,z,w,h,d);
    for(let i=.3;i<w;i+=.52)box(c,x-w/2+i,y+h/2,z+d/2+.035,.11,h*.92,.12);
    for(const dx of [-1,1])for(const dz of [-1,1])box(C.navy,x+dx*(w/2-.1),y+h/2,z+dz*(d/2-.08),.16,h,.16);
    box(C.navy,x,y+.11,z+d/2+.08,w,.16,.14);box(c,x,y+h+.035,z,w+.1,.1,d+.1);
    if(mark)sign(mark,x+w*.12,y+h*.62,z+d/2+.13,w*.45,h*.36);
  }
  function crate(x,y,z,p=null){
    box(C.blue,x,y+.43,z,1.12,.84,.89,p);
    for(const dx of [-.37,.37]){box(0x9dc8bf,x+dx,y+.44,z+.45,.115,.82,.045,p);box(0x9dc8bf,x+dx,y+.866,z,.115,.04,.92,p);}
    box(0x244758,x,y+.13,z+.47,1.14,.11,.055,p);box(0xffdd93,x,y+.53,z+.473,.22,.17,.02,p);
  }
  function pallet(x,z,w,d){
    for(let i=0;i<6;i++)box(0xa6825e,x-w/2+(i+.5)*w/6,.16,z,w/6-.06,.16,d);
    for(const dx of [-w*.34,w*.34])box(0x6e6656,x+dx,.06,z,.26,.12,d);
  }
  function trim(x,z,w,d){
    for(const k of [-1,1]){box(0xffda75,x+k*(w/2),.035,z,.11,.035,d);box(0xffda75,x,.035,z+k*d/2,w,.035,.11);}
  }
  // Orange lattice gantry, suspended spreader and rail-mounted feet.
  const gantryX=-24;
  for(const dx of [-4.2,4.2]){
    box(C.steel,gantryX+dx,.07,-6,.25,.16,14);
    for(const z of [-11,-3.5]){
      const x=gantryX+dx;shadow(x,z,1.1,1.5);box(C.navy,x,.46,z,1.15,.78,1.7);
      box(C.orange,x,4.5,z,.63,8.1,.65);box(C.cream,x,1.82,z,.65,.55,.67);
    }
    beam([gantryX+dx,2.2,-11],[gantryX+dx,7.6,-3.5],.24,C.orange);
    beam([gantryX+dx,2.2,-3.5],[gantryX+dx,7.6,-11],.24,C.orange);
    box(C.orange,gantryX+dx,8.55,-9,.96,.91,17);
  }
  for(const z of [-16.7,-11,-3.6,-1.2])box(C.orange,gantryX,8.7,z,9,.68,.65);
  box(C.navy,gantryX,9.12,-7,8.7,.38,1.25);box(C.cream,gantryX+2.9,7.82,-3.1,1.5,1.6,1.7);
  box(0x426b72,gantryX+2.9,7.96,-2.23,1.25,.92,.04);sign('KAIWERK  •  01',gantryX,8.75,-.85,6,.57);
  for(const x of [-25.2,-22.8])beam([x,8.4,-7],[x,3.5,-7],.065,C.navy);
  box(C.yellow,-24,3.4,-7,3.6,.45,1.4);container(-24,.25,-7,3.5,2.45,1.7,C.teal,'KW');
  pallet(-21,-1.9,4,2.2);trim(-20,0,4.2,2.4);
  const dockCargo=[];for(let i=0;i<6;i++){const g=group(-22+(i%3)*1.23,.25+Math.floor(i/3)*.92,-1.9);crate(0,0,0,g);dockCargo.push(g);}
  // Warehouse with corrugated siding, clerestory, loading door and roof vents.
  shadow(-6,-6,11,7.6);box(C.teal,-6,2.35,-6,10,4.7,7);
  for(let i=0;i<23;i++)box(0x579895,-10.85+i*.44,2.35,-2.47,.08,4.58,.12);
  box(0x3b5559,-6,4.78,-6,10.7,.32,7.7);box(0x96b6a5,-6,5.25,-6,7.6,.7,2.2);
  for(let i=0;i<8;i++)box(0x537c80,-9.1+i*.89,5.27,-4.87,.69,.4,.07);
  box(C.navy,-6,1.43,-2.32,4.2,2.84,.25);
  for(let i=0;i<8;i++)box(0x768e86,-6,.25+i*.33,-2.14,3.83,.27,.08);
  sign('WARENLAGER',-6,3.75,-2.28,6.9,.88);trim(-6,-.1,4.5,2.4);
  const storedBoxes=[];pallet(-2.6,-1.5,2.6,1.25);
  for(let i=0;i<6;i++){const g=group(-3.2+(i%2)*1.18,.23+Math.floor(i/2)*.86,-1.5);crate(0,0,0,g);storedBoxes.push(g);}
  // Security fence and powered sliding gate.
  function fence(z1,z2){for(let z=z1;z<=z2+.01;z+=1.45)box(C.navy,-12,1,z,.12,2,.12);
    for(const y of [.45,1.25,1.77])box(0x607978,-12,y,(z1+z2)/2,.09,.08,z2-z1);}
  fence(-12,-2);fence(2,5.2);
  const gate=group(-12,0,0);for(let i=0;i<8;i++)box(i%2?C.yellow:C.navy,0,1.15,-1.75+i*.5,.25,.62,.5,gate);
  // Clone booth, roof beacon and glass front.
  box(C.navy,-18,.19,15.4,5.4,.38,4.2);box(C.teal,-18,1.96,15.4,4.7,3.42,3.5);
  for(const dx of [-1.88,1.88])box(C.light,-18+dx,1.94,13.55,.4,3.5,.3);
  box(0x95dbcc,-18,1.75,13.56,2.1,2.72,.14);box(C.navy,-18,1.72,13.43,.09,2.69,.12);
  box(C.navy,-18,3.79,15.4,5.35,.36,4.1);tube(C.yellow,-18,4.18,15.4,.62,.51,.62);
  const rear=sign('KLONWERK',-18,3.2,13.38,3.6,.5);rear.rotation.y=Math.PI;
  sign('KLONWERK',-18,3.25,17.2,3.6,.6);trim(-18,12.1,3.5,1.8);
  // Scrap crane and hydraulic press.
  box(C.steel,15,.32,-6,5.9,.64,4.7);tube(C.navy,15,1,-6,3,1.2,3);
  const arm=group(15,1.55,-6);box(C.orange,0,.72,0,2.8,1.52,1.96,arm);
  box(0x406977,.69,1.38,.16,1.05,1.02,1.55,arm);
  beam([-.5,1,0],[-2.15,4.05,0],.56,C.yellow,arm);beam([-2.15,4.05,0],[-4,3.35,0],.44,C.orange,arm);
  tube(C.navy,-4,2.45,0,.085,1.8,.085,arm);tube(C.steel,-4,1.52,0,1.5,.38,1.5,arm);
  for(let i=0;i<40;i++){const x=9+rand()*3.6,z=-7+rand()*3;box(i%2?0x867a64:C.steel,x,.3+rand()*.45,z,.55+rand(),.4,.7,null,rand()*.6,rand()*3);}
  box(C.navy,24,.45,-6,5.8,.9,4.7);
  for(const dx of [-2.35,2.35]){box(C.teal,24+dx,2.12,-6,.65,3.75,3.6);tube(C.steel,24+dx,4.05,-6,.35,.75,.35);}
  box(C.yellow,24,3.93,-6,5.6,.58,3.75);const head=group(24,0,-6);box(C.steel,0,2.65,0,4.15,.7,3.05,head);
  sign('PRESSE  02',24,3.95,-4.08,3.55,.39);trim(24,-2,3.9,2.5);
  const bales=[];for(let i=0;i<9;i++){let g=group(21.5+i%3*1.05,.05+Math.floor(i/3)*.76,-3.3);box(C.steel,0,.36,0,.98,.7,.87,g);box(C.cream,0,.37,0,.13,.75,.9,g);bales.push(g);}
  container(32,0,12,6,2.8,4,0xb56a44,'METALL');trim(31,8,3.5,2.1);
  // Waterfront background: a loaded coaster, distant islands, tanks and port skyline.
  const ship=group(-10,-1.14,-24);
  box(0x963f31,0,.59,0,23,1.3,5.1,ship);box(C.navy,0,1.43,0,23.8,.87,5.5,ship);box(0xc6ad7f,0,1.94,0,23.4,.22,5.25,ship);
  for(let i=0;i<4;i++)for(let k=0;k<2;k++){let x=-8+i*4.2,z=-25.3+k*2.5;container(x,.95,z,4.05,1.9,2.26,[C.teal,0xbb6850,0xac944f,C.blue][(i+k)%4]);}
  box(C.cream,9,3.2,0,3.7,2.6,4.8,ship);box(C.navy,9,4.2,2.41,3.45,.62,.05,ship);
  box(C.cream,9,4.77,0,4,.2,5,ship);tube(0xa7553d,10,5.3,-.6,.8,1.1,.8,ship);
  for(let i=0;i<13;i++){let x=-63+i*10,z=-44-rand()*12;box(0x7e9f98,x,-.7,z,10.5,1.2,11);
    if(i%3){box(i%2?0x879b90:0xb0a58d,x,1.65,z,7,4.7,5);tube(0xab9d87,x+2,5,z,.82,7,.82);}
    else{tube(0xb2b9ab,x,2.25,z,6.5,5.7,6.5);}}
  for(let i=0;i<14;i++)ball(0x819f90,-86+i*13,0,-70-rand()*16,25,11+rand()*14,18);
  container(-32,0,12,5,2.6,7.8,0xb76944);container(4,0,14,7,2.6,5,C.teal,'KW • 07');
  container(4,2.64,14,6.7,2.35,4.7,0x9f8252);
  for(const x of [-35,0,35]){tube(C.steel,x,2.85,-12,.22,5.7,.22);box(C.navy,x,5.8,-11.4,.23,.24,1.5);box(C.cream,x,5.69,-10.7,.55,.12,.46);}
  for(let i=0;i<13;i++){const x=-36+6*i;box(C.navy,x,.36,21.7,.17,.72,.17);box(C.yellow,x,.78,21.7,.19,.15,.19);}
  // Quayside fittings and a parked fork truck.
  for(const x of [-33,-18,-10,0,13,29]){
    tube(C.navy,x,.34,-12.9,.48,.65,.48);tube(C.yellow,x,.68,-12.9,.61,.16,.61);
  }
  for(const [x,z] of [[-13,5.9],[-10,4.5],[12,1.2],[27,-1],[-22,2]]){
    box(C.navy,x,.07,z,.48,.14,.48);tube(C.orange,x,.32,z,.27,.48,.27);tube(C.cream,x,.38,z,.28,.11,.28);
  }
  const truck=group(-30,.02,-1.8);truck.rotation.y=.72;
  box(C.orange,0,.67,0,1.53,.76,2.45,truck);box(C.steel,0,1.02,.13,1.16,.22,1.6,truck);
  box(C.navy,0,1.35,-.25,.75,.62,.21,truck);
  for(const x of [-.68,.68]){for(const z of [-.81,.74]){
    const wheel=tube(C.navy,x,.39,z,.7,.24,.7,truck);wheel.rotation.z=Math.PI/2;
    box(C.navy,x,1.58,z,.1,1.25,.1,truck);}
    box(C.steel,x,1.53,1.34,.14,2.9,.19,truck);box(C.steel,x,.21,1.95,.15,.14,1.35,truck);}
  box(C.yellow,0,2.22,0,1.6,.19,1.95,truck);
  // Batch static geometry by material and primitive to keep draw calls low.
  for(const {kind,c,ms} of batches.values()){const m=new T.InstancedMesh(prototype.get(kind),material(c),ms.length);ms.forEach((a,i)=>m.setMatrixAt(i,a));m.castShadow=true;m.receiveShadow=true;scene.add(m);}
  const actors=[],routeMat=new T.LineBasicMaterial({color:0xe56b32});let routeLine=null,routeRef=null,routeN=-1;
  function actor(i){
    const root=group(0,0,0),body=group(0,0,0,root),coat=[0xeb922d,0x289a96,0xb278a2][i]||C.teal;
    const shadow=new T.Mesh(new T.CircleGeometry(.66,16),new T.MeshBasicMaterial({color:0x4d655e,opacity:.28,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.047;root.add(shadow);
    box(C.navy,0,.79,0,.66,.47,.4,body);box(coat,0,1.09,0,.74,.67,.43,body);
    box(C.cream,0,1,0,.75,.085,.45,body);
    box(0xdaad88,0,1.67,0,.47,.5,.43,body);box(C.navy,0,1.7,.224,.35,.077,.035,body);
    tube(coat,0,1.95,0,.64,.22,.61,body);box(coat,0,1.86,.08,.69,.08,.63,body);
    const legs=[],arms=[];for(const d of [-1,1]){
      let g=group(d*.195,.66,0,body);box(0x2d4859,0,-.23,0,.24,.47,.31,g);box(C.navy,0,-.5,.07,.28,.19,.43,g);legs.push(g);
      g=group(d*.45,1.32,0,body);box(coat,0,-.14,0,.22,.3,.29,g);box(0xd3a37d,0,-.36,.025,.19,.21,.21,g);arms.push(g);}
    const load=group(0,.72,.57,body);crate(0,0,0,load);load.scale.setScalar(.72);
    const metal=group(0,1,.57,body);box(C.steel,0,0,0,.84,.61,.64,metal);box(C.cream,0,0,0,.13,.64,.65,metal);
    const cart=group(0,0,.98,root);box(C.yellow,0,.35,0,1.3,.14,1.25,cart);
    for(const dx of [-.52,.52]){box(C.navy,dx,.23,0,.21,.42,.43,cart);box(C.steel,dx,.73,-.52,.08,.91,.08,cart);}
    box(C.navy,0,1.17,-.52,1.12,.1,.1,cart);
    const pile=[];for(let n=0;n<3;n++){let g=group(0,.43+n*.58,0,cart);crate(0,0,0,g);g.scale.setScalar(.65);pile.push(g);}
    return {root,body,legs,arms,load,metal,cart,pile,phase:0};
  }
  const target=new T.Vector3(),focus=new T.Vector3(),offset=new T.Vector3(),tmp=new T.Vector3();
  function draw(s,dt,yaw,route,zoom){
    const party=[s.player,...s.clones];
    party.forEach((w,i)=>{
      const a=actors[i]||(actors[i]=actor(i)),p=a.root.position;
      const moving=a.init&&Math.hypot(w.x-p.x,w.z-p.z)>.004;
      a.phase+=dt*(moving?11:2);a.body.position.y=moving?Math.abs(Math.sin(a.phase))*.065:0;
      p.set(w.x,0,w.z);a.root.rotation.y=w.angle;a.init=true;
      const cart=s.up.cart&&w.qty>0&&w.cargo==='box';a.cart.visible=!!cart;
      a.load.visible=!!(w.cargo==='box'&&!cart);a.metal.visible=w.cargo==='bale';
      a.pile.forEach((g,k)=>g.visible=k<w.qty);
      a.legs.forEach((g,k)=>g.rotation.x=moving?Math.sin(a.phase+k*Math.PI)*.53:0);
      a.arms.forEach((g,k)=>g.rotation.x=w.qty?-.92:moving?-Math.sin(a.phase+k*Math.PI)*.37:0);
    });
    storedBoxes.forEach((g,i)=>g.visible=i<s.shelf);dockCargo.forEach((g,i)=>g.visible=i<s.stock);bales.forEach((g,i)=>g.visible=i<s.bales);
    gate.position.z=s.up.gate?-4.25:0;
    const phase=s.charge>0?Math.sin((4-s.charge)*Math.PI/4):0;
    arm.rotation.y=phase*2.5;head.position.y=-phase*1.45;
    if(route!==routeRef||route?.length!==routeN){if(routeLine){scene.remove(routeLine);routeLine.geometry.dispose();routeLine=null;}
      if(route?.length>1){routeLine=new T.Line(new T.BufferGeometry().setFromPoints(route.map(p=>new T.Vector3(p.x,.095,p.z))),routeMat);scene.add(routeLine);}
      routeRef=route;routeN=route?.length;}
    target.set(s.player.x,1,s.player.z);
    if(!draw.started){focus.copy(target);draw.started=true;}else focus.lerp(target,1-Math.exp(-dt*9));
    const aspect=canvas.clientWidth/canvas.clientHeight,scale=(aspect<.85?1.25:1)*zoom;
    offset.set(Math.sin(yaw)*17.8*scale,10.5*scale,Math.cos(yaw)*17.8*scale);
    camera.position.copy(focus).add(offset);target.copy(focus);target.x-=Math.sin(yaw)*3.8;target.z-=Math.cos(yaw)*3.8;target.y+=1.65;camera.lookAt(target);renderer.render(scene,camera);
  }
  function project(x,y,z){tmp.set(x,y,z).project(camera);return {left:(tmp.x+1)*canvas.clientWidth/2,top:(1-tmp.y)*canvas.clientHeight/2,visible:tmp.z<1&&tmp.z>0};}
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);return {draw,project};
}
