const ART=(()=>{
const K=.04,OL='#1c0f0b';
const A={size:{item:1.2,node:1.7,cust:1.9,helper:1.6,deco:1.8,coin:1},leftFacing:{},item:{},node:{}};
const crack=(g,pts,w)=>{w=w||.03;ln(g,pts,'rgba(255,90,20,.9)',w*2.4);ln(g,pts,'#ffd36a',w);};
const glow=(g,c,r)=>{g.fillStyle=rg(g,0,0,.08,r||.56,[[0,c],[1,'rgba(255,120,30,0)']]);g.beginPath();g.arc(0,0,r||.56,0,7);g.fill();};

A.coin=g=>{
  fe(g,0,0,.36,.36,rg(g,-.1,-.12,.04,.44,[[0,'#fff0a8'],[1,'#dd9a1c']]),'#7a4c0a',K);
  fe(g,0,0,.27,.27,null,'rgba(122,76,10,.55)',.03);
  ln(g,[[-.11,.12],[.1,-.1]],'#7a4c0a',.05);pl(g,[[.02,-.18],[.2,-.02],[.12,.06],[-.06,-.1]],'#7a4c0a',null);
  fe(g,-.15,-.17,.07,.035,'rgba(255,255,255,.75)',null,0,-.5);
};
const lump=(g,x,y,s,r)=>{g.save();g.translate(x,y);g.rotate(r);g.scale(s,s);
  pl(g,[[-.26,.08],[-.16,-.2],[.08,-.26],[.28,-.06],[.22,.2],[-.06,.26]],lg(g,0,-.26,0,.26,[[0,'#4e444e'],[1,'#17121a']]),'#08040a',.05);
  pl(g,[[-.16,-.2],[.08,-.26],[0,-.04],[-.2,-.02]],'rgba(255,255,255,.16)',null);
  crack(g,[[-.04,.0],[.06,.1],[.02,.2]],.03);g.restore();};
A.item.a=g=>{glow(g,'rgba(255,120,30,.45)');lump(g,-.17,.1,.8,-.2);lump(g,.2,.08,.7,.3);lump(g,0,-.1,.95,0);};
A.item.b=g=>{
  pl(g,[[-.36,.12],[-.3,-.16],[-.08,-.34],[.2,-.28],[.36,-.04],[.3,.22],[0,.32],[-.22,.28]],lg(g,-.3,-.3,.3,.3,[[0,'#b4acb4'],[.5,'#6c6472'],[1,'#3a3440']]),'#1a1420',K);
  for(const p of[[-.12,.08,.1],[.14,-.06,.08],[.1,.16,.07]])fe(g,p[0],p[1],p[2],p[2]*.8,'#c4682c');
  pl(g,[[-.3,-.16],[-.08,-.34],[.2,-.28],[0,-.08]],'rgba(255,255,255,.3)',null);
  for(const p of[[-.2,-.12],[.08,-.2],[.2,.02]])fe(g,p[0],p[1],.03,.02,'#fff');
  ln(g,[[-.2,0],[0,.06],[.18,0]],'rgba(255,255,255,.4)',.03);
};
A.item.c=g=>{
  glow(g,'rgba(255,60,80,.45)');
  const pts=[[0,-.38],[.3,-.17],[.3,.13],[0,.36],[-.3,.13],[-.3,-.17]];
  pl(g,pts,lg(g,-.3,-.3,.3,.3,[[0,'#ff9a9a'],[.5,'#e01e3a'],[1,'#7a0a22']]),'#3a0412',K);
  pl(g,[[0,-.38],[.3,-.17],[0,-.02],[-.3,-.17]],'rgba(255,210,210,.5)',null);
  ln(g,[[0,-.02],[0,.36]],'rgba(58,4,18,.5)',.025);ln(g,[[0,-.02],[.3,.13]],'rgba(58,4,18,.5)',.025);ln(g,[[0,-.02],[-.3,.13]],'rgba(58,4,18,.5)',.025);
  pl(g,[[.22,-.3],[.25,-.23],[.32,-.2],[.25,-.17],[.22,-.1],[.19,-.17],[.12,-.2],[.19,-.23]],'#fff',null);
};
A.item.d=g=>{
  glow(g,'rgba(255,150,40,.5)');
  const egg=()=>{g.beginPath();g.moveTo(0,-.42);g.bezierCurveTo(.36,-.38,.42,.16,.2,.34);g.bezierCurveTo(.08,.45,-.08,.45,-.2,.34);g.bezierCurveTo(-.42,.16,-.36,-.38,0,-.42);};
  egg();g.fillStyle=rg(g,-.1,-.15,.03,.55,[[0,'#ff9a5a'],[.6,'#d83a24'],[1,'#7a1410']]);g.fill();
  g.save();egg();g.clip();g.fillStyle='rgba(80,10,10,.5)';
  for(let r=0;r<5;r++)for(let c=-3;c<=3;c++){const x=c*.13+(r%2)*.065,y=-.3+r*.17;g.beginPath();g.arc(x,y,.08,0,Math.PI);g.fill();}
  g.restore();
  egg();g.lineWidth=K;g.strokeStyle='#3a0a08';g.stroke();
  crack(g,[[-.04,-.3],[.04,-.18],[-.04,-.08],[.05,.04]],.025);fe(g,-.16,-.22,.06,.1,'rgba(255,255,255,.5)',null,0,.3);
};
A.item.e=g=>{
  g.save();g.rotate(.75);g.scale(.95,.95);
  pl(g,[[-.075,.14],[-.075,-.38],[0,-.55],[.075,-.38],[.075,.14]],lg(g,-.075,0,.075,0,[[0,'#e8eef4'],[.5,'#b4c2d0'],[1,'#6a7a8c']]),'#232c38',.035);
  ln(g,[[0,.1],[0,-.42]],'rgba(255,255,255,.6)',.02);
  fe(g,0,.16,.2,.05,lg(g,0,.1,0,.22,[[0,'#ffe27a'],[1,'#c4901a']]),'#6a4a0a',.03);fe(g,-.2,.16,.04,.04,'#ffd36a','#6a4a0a',.02);fe(g,.2,.16,.04,.04,'#ffd36a','#6a4a0a',.02);
  g.beginPath();g.roundRect?g.roundRect(-.04,.2,.08,.22,.03):g.rect(-.04,.2,.08,.22);g.fillStyle='#7a3e1e';g.fill();g.lineWidth=.025;g.strokeStyle='#2a1208';g.stroke();
  for(let i=0;i<3;i++)ln(g,[[-.04,.25+i*.06],[.04,.25+i*.06]],'rgba(0,0,0,.35)',.02);
  fe(g,0,.46,.06,.06,rg(g,-.02,.44,.005,.08,[[0,'#fff0a8'],[1,'#c4901a']]),'#6a4a0a',.025);
  fe(g,0,-.2,.02,.12,'rgba(255,255,255,.7)',null,0,0);
  g.restore();
};
const rock=(g,col0,col1,w)=>{w=w||.5;fe(g,0,.44,w+.04,.17,'rgba(0,0,0,.28)');
  g.beginPath();g.moveTo(-w,.42);g.bezierCurveTo(-w-.04,.1,-.3,-.04,-.1,-.08);g.bezierCurveTo(.1,-.1,.3,-.02,w,.42);g.closePath();
  g.fillStyle=lg(g,0,-.08,0,.42,[[0,col0],[1,col1]]);g.fill();g.lineWidth=K;g.strokeStyle='#08040a';g.stroke();};
const sub=(g,fn,x,y,s)=>{g.save();g.translate(x,y);g.scale(s,s);fn(g);g.restore();};
A.node.a=g=>{rock(g,'#5a4e5a','#2a222c');crack(g,[[-.3,.34],[-.2,.2],[-.26,.1]],.03);crack(g,[[.28,.36],[.2,.22],[.28,.12]],.03);sub(g,A.item.a,0,-.1,.9);};
A.node.b=g=>{rock(g,'#8a828c','#4a4450');for(const p of[[-.3,.26],[.3,.28]])fe(g,p[0],p[1],.08,.06,'#c4682c');sub(g,A.item.b,0,-.06,.9);};
A.node.c=g=>{rock(g,'#4a3a46','#1e161e');crack(g,[[.3,.36],[.22,.2]],.025);sub(g,A.item.c,-.2,-.02,.62);sub(g,A.item.c,.22,.04,.5);sub(g,A.item.c,0,-.16,.78);};
A.node.d=g=>{
  fe(g,0,.44,.54,.17,'rgba(0,0,0,.28)');
  fe(g,0,.34,.5,.2,'#3a2a22','#08040a',.035);
  for(let i=0;i<14;i++){const a=i/14*6.283,x=Math.cos(a)*.44,y=.34+Math.sin(a)*.17;ln(g,[[x,y],[x*.7,.34+Math.sin(a)*.08]],i%2?'#6a4a2e':'#8a6238',.06);}
  fe(g,0,.34,.3,.1,'#2a1c16');
  sub(g,A.item.d,0,-.02,.88);
  for(const p of[[-.34,.1],[.38,.2],[.2,-.2]])fe(g,p[0],p[1],.025,.025,'#ffb040');
};

// ---- Figuren ----
const folk=(g,o)=>{
  fe(g,-.14,.62,.12,.07,'#3a2a22',OL,.03);fe(g,.14,.62,.12,.07,'#3a2a22',OL,.03);
  if(o.back)o.back(g);
  fe(g,0,.34,.3,.32,lg(g,0,.05,0,.62,[[0,o.shirt],[1,o.shirt2]]),OL,K);
  if(o.apron)pl(g,[[-.16,.14],[.16,.14],[.21,.56],[-.21,.56]],o.apron,OL,.03);
  ln(g,[[-.29,.32],[.29,.32]],'#4a2e1a',.06);fe(g,0,.32,.05,.04,'#ffd36a',OL,.02);
  fe(g,-.34,.32,.09,.17,o.skin,OL,.03,.35);fe(g,.34,.32,.09,.17,o.skin,OL,.03,-.35);
  if(o.hold)o.hold(g);
  if(o.ears)o.ears(g);
  fe(g,0,-.14,.36,.34,lg(g,0,-.5,0,.2,[[0,o.skin],[1,o.skin2||o.skin]]),OL,K);
  if(o.beard)o.beard(g);
  if(o.noEyes!==true){const lk=0;for(const s of[-1,1])eye(g,s*.14,-.16,o.eye||.07,lk);}
  if(o.brow)for(const s of[-1,1])ln(g,[[s*.06,-.26],[s*.22,-.24+(o.brow>1?s*0:0)]],o.browCol||'#3a2218',.05);
  if(o.face)o.face(g);
  fe(g,-.12,-.36,.09,.04,'rgba(255,255,255,.25)',null,0,-.4);
  if(o.hat)o.hat(g);
};
const beardShape=(col,len,col2)=>g=>{
  g.beginPath();g.moveTo(-.34,-.06);g.bezierCurveTo(-.4,.18,-.22,.28+len,0,.34+len);g.bezierCurveTo(.22,.28+len,.4,.18,.34,-.06);
  g.bezierCurveTo(.2,.02,.1,-.02,0,.0);g.bezierCurveTo(-.1,-.02,-.2,.02,-.34,-.06);g.closePath();
  g.fillStyle=lg(g,0,-.05,0,.4+len,[[0,col],[1,col2||col]]);g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();
  for(let i=-2;i<=2;i++)ln(g,[[i*.08,.08],[i*.07,.22+len*.6]],'rgba(0,0,0,.18)',.02);
  fe(g,0,-.03,.06,.045,'#e0836a',OL,.02);
};
const ironHelm=(horns)=>g=>{
  g.beginPath();g.arc(0,-.2,.37,Math.PI*1.02,Math.PI*1.98);g.closePath();g.fillStyle=lg(g,-.3,-.5,.3,-.2,[[0,'#c4ccd6'],[1,'#6a7482']]);g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();
  fe(g,0,-.2,.38,.05,'#8a94a2',OL,.03);fe(g,0,-.2,.05,.05,'#ffd36a',OL,.02);ln(g,[[0,-.57],[0,-.3]],'rgba(255,255,255,.35)',.03);
  if(horns)for(const s of[-1,1])pl(g,[[s*.3,-.42],[s*.46,-.5],[s*.54,-.72],[s*.34,-.58]],'#f2e8d0',OL,.03);
};
const miner=g=>{
  g.beginPath();g.arc(0,-.2,.37,Math.PI*1.02,Math.PI*1.98);g.closePath();g.fillStyle=lg(g,-.3,-.5,.3,-.2,[[0,'#ffe36a'],[1,'#e0a418']]);g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();
  fe(g,0,-.2,.4,.05,'#e0a418',OL,.03);fe(g,0,-.4,.1,.09,'#fff7c0',OL,.03);g.fillStyle='rgba(255,240,150,.25)';g.beginPath();g.moveTo(-.06,-.45);g.lineTo(-.4,-.8);g.lineTo(.4,-.8);g.lineTo(.06,-.45);g.fill();
};
const leatherCap=g=>{g.beginPath();g.arc(0,-.2,.36,Math.PI*1.03,Math.PI*1.97);g.closePath();g.fillStyle=lg(g,0,-.55,0,-.2,[[0,'#9a6a3a'],[1,'#6a4222']]);g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();fe(g,0,-.2,.38,.05,'#5a3a1e',OL,.03);fe(g,-.12,-.36,.07,.03,'rgba(255,255,255,.25)');};
const dwarf1=g=>folk(g,{skin:'#f2b88a',skin2:'#e09a6a',shirt:'#c0392b',shirt2:'#8a2418',apron:'#5a3a22',beard:beardShape('#d4561e',.08,'#a8380e'),brow:1,hat:ironHelm(true)});
const dwarf2=g=>folk(g,{skin:'#f6c49a',skin2:'#e8a678',shirt:'#3f7fbf',shirt2:'#285a8a',apron:'#6a4a2a',beard:beardShape('#f2d072',.18,'#d4a638'),brow:1,hat:leatherCap,back:g=>{}});
const dwarf3=g=>folk(g,{skin:'#e8b08a',skin2:'#d09068',shirt:'#6a7a58',shirt2:'#485a3a',beard:beardShape('#d8d8de',.2,'#a4a4b0'),brow:1,browCol:'#7a7a86',hat:miner});
const orc=g=>folk(g,{skin:'#7fc45c',skin2:'#5a9a3c',shirt:'#8a4a2a',shirt2:'#5a2e18',eye:.065,brow:1,
  ears:g=>{for(const s of[-1,1])pl(g,[[s*.3,-.24],[s*.5,-.34],[s*.34,-.1]],'#7fc45c',OL,.03);},
  face:g=>{g.beginPath();g.arc(0,0,.12,.2,Math.PI-.2);g.strokeStyle=OL;g.lineWidth=.035;g.stroke();for(const s of[-1,1])pl(g,[[s*.1,.0],[s*.15,-.12],[s*.05,-.02]],'#fff',OL,.02);fe(g,0,-.07,.06,.04,'#4a8a2c',OL,.02);ln(g,[[-.36,-.3],[.36,-.3]],'#c0392b',.07);}});
const goblin=g=>folk(g,{skin:'#a8de5a',skin2:'#7ab83a',shirt:'#7a5a9a',shirt2:'#4a3468',eye:.085,
  ears:g=>{for(const s of[-1,1]){pl(g,[[s*.3,-.2],[s*.7,-.4],[s*.32,.0]],'#a8de5a',OL,.03);pl(g,[[s*.34,-.17],[s*.58,-.33],[s*.34,-.05]],'#ffb3a0',null);}},
  face:g=>{g.beginPath();g.arc(0,-.02,.1,.3,Math.PI-.3);g.strokeStyle=OL;g.lineWidth=.03;g.stroke();pl(g,[[-.04,-.02],[-.02,.04],[0,-.02]],'#fff',null);pl(g,[[.04,-.02],[.02,.04],[0,-.02]],'#fff',null);fe(g,0,-.08,.04,.05,'#7ab83a',OL,.02);},
  hat:g=>{pl(g,[[-.3,-.36],[.3,-.36],[.05,-.78]],'#8a4a2a',OL,.035);fe(g,0,-.36,.34,.06,'#5a2e18',OL,.03);fe(g,.04,-.62,.04,.04,'#ffd36a');}});
const imp=g=>folk(g,{skin:'#ee5a3e',skin2:'#c0301c',shirt:'#3a2a3e',shirt2:'#1e1424',
  back:g=>{ln(g,[[.2,.5],[.5,.55],[.55,.3],[.4,.2]],'#c0301c',.06);pl(g,[[.4,.14],[.52,.22],[.44,.3],[.36,.22]],'#ee5a3e',OL,.025);for(const s of[-1,1]){g.save();g.translate(s*.34,.1);g.rotate(s*.5);pl(g,[[0,0],[s*.3,-.2],[s*.34,.1],[s*.15,.05],[s*.12,.2]],'#8a2a3a',OL,.03);g.restore();}},
  face:g=>{g.beginPath();g.arc(0,-.02,.12,.15,Math.PI-.15);g.fillStyle='#4a0a0a';g.fill();g.lineWidth=.03;g.strokeStyle=OL;g.stroke();pl(g,[[-.08,.02],[-.05,.09],[-.02,.03]],'#fff',null);pl(g,[[.08,.02],[.05,.09],[.02,.03]],'#fff',null);ln(g,[[-.24,-.26],[-.08,-.22]],OL,.05);ln(g,[[.24,-.26],[.08,-.22]],OL,.05);},
  hat:g=>{for(const s of[-1,1])pl(g,[[s*.14,-.44],[s*.34,-.42],[s*.3,-.7]],'#1e1424',OL,.03);}});
const knight=g=>folk(g,{skin:'#c4ccd6',skin2:'#7a8494',shirt:'#c4ccd6',shirt2:'#6a7482',noEyes:true,apron:'#c0392b',
  hat:g=>{fe(g,0,-.14,.38,.36,lg(g,-.3,-.5,.3,.2,[[0,'#dfe6ee'],[1,'#7a8494']]),OL,K);ln(g,[[-.26,-.16],[.26,-.16]],'#14181f',.1);for(let i=-2;i<=2;i++)ln(g,[[i*.1,-.1],[i*.1,.12]],'rgba(20,24,31,.6)',.025);
    ln(g,[[0,-.5],[0,-.22]],'rgba(0,0,0,.25)',.03);pl(g,[[-.06,-.5],[.06,-.5],[.22,-.78],[.04,-.7],[-.12,-.8]],'#d83a3a',OL,.03);fe(g,-.14,-.36,.08,.04,'rgba(255,255,255,.55)');}});
const golem=g=>{
  fe(g,-.18,.62,.13,.08,'#4a3e48',OL,.03);fe(g,.18,.62,.13,.08,'#4a3e48',OL,.03);
  fe(g,0,.34,.34,.34,lg(g,0,.0,0,.7,[[0,'#6a5c68'],[1,'#2a222c']]),OL,K);crack(g,[[-.12,.2],[-.02,.34],[-.14,.5]],.03);crack(g,[[.14,.22],[.06,.4],[.16,.52]],.03);
  fe(g,-.4,.32,.1,.18,'#5a4c58',OL,.03,.3);fe(g,.4,.32,.1,.18,'#5a4c58',OL,.03,-.3);
  g.beginPath();g.moveTo(-.34,-.42);g.lineTo(.3,-.46);g.lineTo(.38,.04);g.lineTo(.28,.2);g.lineTo(-.3,.2);g.lineTo(-.4,-.06);g.closePath();g.fillStyle=lg(g,0,-.46,0,.2,[[0,'#7a6c78'],[1,'#3a2e3a']]);g.fill();g.lineWidth=K;g.strokeStyle=OL;g.stroke();
  crack(g,[[-.3,-.3],[-.1,-.34],[-.04,-.2]],.025);crack(g,[[.3,-.1],[.18,-.02]],.025);
  for(const s of[-1,1]){fe(g,s*.14,-.14,.08,.06,'#ffe27a','#c05a10',.03);fe(g,s*.14,-.14,.04,.03,'#fff');}
  ln(g,[[-.14,.04],[.14,.04]],'#1a0e12',.05);
};
A.cust=[dwarf1,dwarf2,dwarf3,orc,goblin,imp,knight,golem];

A.helper=g=>{ // Salamander
  g.beginPath();g.moveTo(.2,.5);g.bezierCurveTo(.5,.6,.62,.3,.5,.1);g.lineWidth=.12;g.lineCap='round';g.strokeStyle='#8a3a14';g.stroke();g.lineWidth=.08;g.strokeStyle='#ff8a2a';g.stroke();
  const fl=(x,y,s)=>{g.save();g.translate(x,y);g.scale(s,s);pl(g,[[0,.14],[-.1,0],[-.04,-.1],[0,-.24],[.04,-.1],[.1,0]],lg(g,0,-.24,0,.14,[[0,'#ffe27a'],[1,'#ff5a1a']]),'#a8300a',.03);g.restore();};
  fl(.5,.0,1);
  fe(g,-.15,.62,.12,.07,'#e0701a',OL,.03);fe(g,.15,.62,.12,.07,'#e0701a',OL,.03);
  fe(g,0,.34,.28,.3,lg(g,0,.05,0,.62,[[0,'#ff9a3a'],[1,'#e0581a']]),OL,K);fe(g,0,.4,.17,.2,'#ffe6b4');
  for(const p of[[-.18,.22],[.2,.28],[-.1,.5]])fe(g,p[0],p[1],.035,.03,'rgba(138,58,20,.6)');
  fe(g,-.3,.32,.08,.15,'#ff8a2a',OL,.03,.35);fe(g,.3,.32,.08,.15,'#ff8a2a',OL,.03,-.35);
  for(const s of[-1,1])pl(g,[[s*.12,-.4],[s*.2,-.56],[s*.26,-.38]],'#ffd36a',OL,.025);pl(g,[[-.05,-.46],[0,-.62],[.05,-.46]],'#ffd36a',OL,.025);
  fe(g,0,-.12,.36,.32,lg(g,0,-.44,0,.2,[[0,'#ffa84a'],[1,'#e0581a']]),OL,K);
  fe(g,0,.02,.18,.1,'#ffd9a0',OL,.025);fe(g,-.04,-.0,.015,.02,'#8a3a14');fe(g,.04,0,.015,.02,'#8a3a14');
  for(const s of[-1,1]){fe(g,s*.16,-.2,.09,.1,'#fff6c0',OL,.03);fe(g,s*.16,-.2,.03,.075,'#2a1208');fe(g,s*.16-.02,-.23,.02,.02,'#fff');}
  g.beginPath();g.arc(0,.05,.07,.3,Math.PI-.3);g.strokeStyle=OL;g.lineWidth=.025;g.stroke();
};
A.foreman=g=>{
  folk(g,{skin:'#f2b88a',skin2:'#e09a6a',shirt:'#7a3a2a',shirt2:'#4a2018',apron:'#3a2a22',beard:beardShape('#eee8dc',.22,'#c4bcae'),brow:1,browCol:'#bdb6a8',
   hold:g=>{ln(g,[[.4,.5],[.46,-.1]],'#7a4a22',.07);pl(g,[[.3,-.2],[.62,-.2],[.62,-.02],[.3,-.02]],lg(g,0,-.2,0,0,[[0,'#c4ccd6'],[1,'#6a7482']]),OL,.03);fe(g,.4,.2,.07,.07,'#f2b88a',OL,.025);},
   hat:g=>{leatherCap(g);fe(g,-.14,-.36,.1,.08,'#8ad0ff','#2a4a6a',.03);fe(g,.14,-.36,.1,.08,'#8ad0ff','#2a4a6a',.03);ln(g,[[-.04,-.36],[.04,-.36]],'#2a4a6a',.04);}});
};
A.gardener=g=>{ // Glut-Drache
  for(const s of[-1,1]){g.save();g.translate(s*.28,-.04);g.rotate(s*.5);pl(g,[[0,.0],[s*.2,-.3],[s*.42,-.12],[s*.3,.04],[s*.38,.2],[s*.14,.14]],lg(g,0,-.3,0,.2,[[0,'#ff8a3a'],[1,'#c0301c']]),OL,.03);ln(g,[[0,0],[s*.2,-.3]],'rgba(80,10,10,.5)',.02);ln(g,[[0,0],[s*.3,.04]],'rgba(80,10,10,.5)',.02);g.restore();}
  g.beginPath();g.moveTo(.18,.5);g.bezierCurveTo(.5,.66,.64,.34,.52,.16);g.lineWidth=.14;g.lineCap='round';g.strokeStyle='#8a1a14';g.stroke();g.lineWidth=.1;g.strokeStyle='#d83a2a';g.stroke();pl(g,[[.5,.06],[.62,.22],[.46,.22]],'#ffd36a',OL,.025);
  fe(g,-.14,.62,.12,.07,'#d83a2a',OL,.03);fe(g,.14,.62,.12,.07,'#d83a2a',OL,.03);
  fe(g,0,.34,.27,.3,lg(g,0,.05,0,.62,[[0,'#ee5a3e'],[1,'#b0281c']]),OL,K);fe(g,0,.4,.16,.2,'#ffe6b4');for(let i=0;i<3;i++)ln(g,[[-.12,.3+i*.1],[.12,.3+i*.1]],'rgba(176,40,28,.35)',.025);
  fe(g,-.28,.32,.08,.14,'#ee5a3e',OL,.03,.35);fe(g,.28,.32,.08,.14,'#ee5a3e',OL,.03,-.35);
  for(const s of[-1,1])pl(g,[[s*.16,-.36],[s*.3,-.38],[s*.26,-.62]],'#f6e8c8',OL,.03);
  for(const s of[-.12,0,.12])pl(g,[[s-.04,-.46],[s,-.56],[s+.04,-.46]],'#ffd36a',OL,.02);
  fe(g,0,-.12,.36,.32,lg(g,0,-.44,0,.2,[[0,'#f06a4a'],[1,'#c0301c']]),OL,K);
  fe(g,0,.02,.2,.13,'#ffb090',OL,.03);fe(g,-.07,.0,.02,.025,'#5a1008');fe(g,.07,0,.02,.025,'#5a1008');
  for(const s of[-1,1]){fe(g,s*.16,-.2,.09,.1,'#fff6c0',OL,.03);fe(g,s*.16,-.19,.045,.07,'#2a1208');fe(g,s*.16-.02,-.23,.02,.02,'#fff');}
  g.beginPath();g.arc(0,.06,.07,.3,Math.PI-.3);g.strokeStyle=OL;g.lineWidth=.025;g.stroke();
  g.save();g.translate(.12,.14);g.scale(.5,.5);pl(g,[[0,.14],[-.1,0],[-.04,-.1],[0,-.24],[.04,-.1],[.1,0]],'#ffb040','#a8300a',.04);g.restore();
};
A.bin=g=>{
  fe(g,0,.4,.4,.12,'rgba(0,0,0,.3)');
  g.beginPath();g.moveTo(-.34,-.1);g.lineTo(-.28,.4);g.lineTo(.28,.4);g.lineTo(.34,-.1);g.closePath();g.fillStyle=lg(g,-.3,0,.3,0,[[0,'#6a6470'],[1,'#2e2a34']]);g.fill();g.lineWidth=K;g.strokeStyle=OL;g.stroke();
  for(const y of[.05,.25])ln(g,[[-.32+(y>.1?.04:0),y],[.32-(y>.1?.04:0),y]],'#14101a',.05);
  fe(g,0,-.1,.4,.1,'#8a8492',OL,.03);fe(g,0,-.1,.29,.055,'#1a0e0e');fe(g,0,-.1,.18,.03,'rgba(255,90,20,.7)');
};
// Deko
const spikes=g=>{for(const [x,h,w] of[[-.28,.7,.16],[0,1,.2],[.3,.6,.14]]){pl(g,[[x-w,.7],[x-w*.3,.7-h*.6],[x,.7-h],[x+w*.4,.7-h*.5],[x+w,.7]],lg(g,x-w,0,x+w,0,[[0,'#5a4e5a'],[1,'#2a222c']]),'#08040a',.035);}crack(g,[[0,.64],[.02,.4]],.025);};
const pool=g=>{fe(g,0,.3,.55,.3,'#2a1c1c','#08040a',.04);fe(g,0,.3,.46,.23,rg(g,0,.3,.03,.5,[[0,'#ffe27a'],[.5,'#ff8a2a'],[1,'#d8381c']]));for(const p of[[-.16,.28,.07],[.14,.34,.05],[.04,.2,.04]])fe(g,p[0],p[1],p[2],p[2],'rgba(255,240,170,.8)','#ff8a2a',.02);};
const deadTree=g=>{ln(g,[[0,.7],[0,.1],[-.1,-.2]],'#1a1214',.12);ln(g,[[0,.3],[.25,.0],[.34,-.2]],'#1a1214',.07);ln(g,[[0,.1],[-.26,-.1],[-.34,-.4]],'#1a1214',.07);ln(g,[[-.1,-.2],[-.04,-.5]],'#1a1214',.05);ln(g,[[.25,0],[.4,.05]],'#1a1214',.04);};
A.edge=[spikes,pool,deadTree,spikes];
const embRock=g=>{pl(g,[[-.28,.14],[-.2,-.14],[.06,-.24],[.28,-.04],[.22,.18],[-.04,.24]],lg(g,0,-.24,0,.24,[[0,'#5a4e5a'],[1,'#2a222c']]),'#08040a',.035);crack(g,[[-.08,-.02],[.04,.06],[0,.16]],.025);};
const skull=g=>{fe(g,0,-.04,.24,.22,'#eee6d4','#6a5a44',.03);pl(g,[[-.12,.1],[.12,.1],[.1,.24],[-.1,.24]],'#eee6d4','#6a5a44',.03);fe(g,-.09,-.04,.06,.07,'#1a1214');fe(g,.09,-.04,.06,.07,'#1a1214');pl(g,[[0,.04],[-.03,.1],[.03,.1]],'#1a1214',null);};
const coalBit=g=>lump(g,0,0,.9,.4);
const shroom=g=>{ln(g,[[0,.3],[0,0]],'#d8c8a8',.09);g.beginPath();g.ellipse(0,0,.26,.18,0,Math.PI,0);g.fillStyle='#ff7a3a';g.fill();g.lineWidth=.03;g.strokeStyle='#8a300a';g.stroke();for(const x of[-.1,.08])fe(g,x,-.08,.035,.03,'#ffe9a0');};
A.floor=[embRock,skull,coalBit,shroom];

// Spieler: Zwergen-Schmied (live)
A.player=(g,a)=>{
  const sw=Math.sin(a.walk*(a.moving?10:3)),b=Math.abs(sw)*(a.moving?.06:0)+Math.sin(a.walk*3)*.015;
  g.save();g.translate(0,-b);
  for(const s of[-1,1]){const lift=a.moving?Math.max(0,Math.sin(a.walk*10+(s>0?0:Math.PI)))*.1:0;ln(g,[[s*.12,.42],[s*.12,.54-lift]],'#4a3a2e',.12);fe(g,s*.12+.02,.62-lift,.13,.075,'#2e1e14',OL,.03);}
  fe(g,0,.22,.32,.36,lg(g,0,-.1,0,.6,[[0,'#8a4a2a'],[1,'#5a2e18']]),OL,K);
  pl(g,[[-.2,.0],[.2,.0],[.26,.5],[-.26,.5]],lg(g,0,0,0,.5,[[0,'#7a5a3a'],[1,'#4a3220']]),OL,.03);
  ln(g,[[-.3,.2],[.3,.2]],'#2a1a10',.06);fe(g,0,.2,.05,.04,'#ffd36a',OL,.02);
  for(const x of[-.12,.12])fe(g,x,.08,.025,.025,'#ffd36a');
  // linker Arm
  g.save();g.translate(-.34,.06);g.rotate(-.35-(a.moving?sw*.45:0));fe(g,0,.14,.09,.2,'#8a4a2a',OL,.03);fe(g,0,.34,.085,.085,'#f2b88a',OL,.025);g.restore();
  // rechter Arm mit Hammer
  g.save();g.translate(.34,.06);const sg=a.moving?sw*.45:Math.sin(a.walk*2)*.08;g.rotate(.4+sg);fe(g,0,.14,.09,.2,'#8a4a2a',OL,.03);
  g.save();g.translate(0,.32);g.rotate(-.5);ln(g,[[0,.1],[0,-.42]],'#7a4a22',.07);pl(g,[[-.17,-.46],[.17,-.46],[.17,-.28],[-.17,-.28]],lg(g,0,-.46,0,-.28,[[0,'#d2dae4'],[1,'#6a7482']]),OL,.03);g.restore();
  fe(g,0,.34,.085,.085,'#f2b88a',OL,.025);g.restore();
  // Kopf
  fe(g,0,-.3,.34,.32,lg(g,0,-.6,0,.05,[[0,'#f6c49a'],[1,'#e0a070']]),OL,K);
  const lk=a.face*.3;eye(g,-.12,-.3,.065,lk);eye(g,.12,-.3,.065,lk);
  ln(g,[[-.2,-.4],[-.05,-.38]],'#7a2e10',.05);ln(g,[[.2,-.4],[.05,-.38]],'#7a2e10',.05);
  // Bart
  g.beginPath();g.moveTo(-.33,-.22);g.bezierCurveTo(-.4,.0,-.22,.2,0,.28);g.bezierCurveTo(.22,.2,.4,.0,.33,-.22);g.bezierCurveTo(.2,-.14,.1,-.18,0,-.16);g.bezierCurveTo(-.1,-.18,-.2,-.14,-.33,-.22);g.closePath();
  g.fillStyle=lg(g,0,-.2,0,.3,[[0,'#e0642a'],[1,'#a8380e']]);g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();for(let i=-2;i<=2;i++)ln(g,[[i*.08,-.08],[i*.07,.14]],'rgba(0,0,0,.2)',.02);
  fe(g,0,-.2,.055,.045,'#e0836a',OL,.02);
  // Helm mit Hörnern und Brille
  g.beginPath();g.arc(0,-.4,.36,Math.PI*1.02,Math.PI*1.98);g.closePath();g.fillStyle=lg(g,-.3,-.7,.3,-.4,[[0,'#c4ccd6'],[1,'#6a7482']]);g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();
  fe(g,0,-.4,.38,.05,'#8a94a2',OL,.03);
  for(const s of[-1,1])pl(g,[[s*.3,-.6],[s*.46,-.66],[s*.54,-.9],[s*.34,-.76]],'#f2e8d0',OL,.03);
  fe(g,-.12,-.52,.09,.07,'#8ad0ff','#2a4a6a',.03);fe(g,.12,-.52,.09,.07,'#8ad0ff','#2a4a6a',.03);ln(g,[[-.03,-.52],[.03,-.52]],'#2a4a6a',.04);
  g.restore();
};
return A;})();
