const ART=(()=>{
const K=.04,OL='#7a2a55';
const A={size:{item:1.2,node:1.7,cust:1.9,helper:1.6,deco:1.8,coin:1},leftFacing:{},item:{},node:{}};
const SPR_COL=['#ff5fa2','#ffcf3d','#5fd0ff','#7de39a','#b58cff'];
const sprinkles=(g,cx,cy,rx,ry,n,seed)=>{let s=seed||5;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<n;i++){const a=r()*6.283,d=Math.sqrt(r());const x=cx+Math.cos(a)*rx*d,y=cy+Math.sin(a)*ry*d;g.save();g.translate(x,y);g.rotate(r()*3);ln(g,[[-.03,0],[.03,0]],SPR_COL[i%5],.035);g.restore();}};

A.coin=g=>{ // Keks
  fe(g,0,0,.36,.34,rg(g,-.1,-.1,.05,.42,[[0,'#f0c27a'],[1,'#c98a3e']]),'#7a4a1a',K);
  for(const p of[[-.12,-.1],[.14,-.14],[.02,.08],[-.16,.16],[.18,.12]]){fe(g,p[0],p[1],.06,.05,'#5a3318');fe(g,p[0]-.015,p[1]-.015,.02,.015,'rgba(255,255,255,.4)');}
  fe(g,-.15,-.22,.08,.04,'rgba(255,255,255,.55)',null,0,-.5);
};
A.item.a=g=>{ // Lolli
  ln(g,[[0,.0],[0,.52]],'#8a4a2a',.1);ln(g,[[0,.0],[0,.52]],'#fff',.07);ln(g,[[-.01,.05],[-.01,.5]],'rgba(255,95,162,.35)',.02);
  fe(g,0,-.16,.36,.36,rg(g,-.1,-.26,.02,.44,[[0,'#ff9ac8'],[1,'#ff4f9a']]),OL,K);
  g.save();g.beginPath();g.arc(0,-.16,.34,0,7);g.clip();g.beginPath();for(let t=0;t<=1;t+=.02){const a=t*14,r=t*.34;const x=Math.cos(a)*r,y=-.16+Math.sin(a)*r;t?g.lineTo(x,y):g.moveTo(x,y);}g.lineWidth=.07;g.strokeStyle='#fff';g.lineCap='round';g.stroke();g.restore();
  fe(g,-.14,-.3,.09,.05,'rgba(255,255,255,.75)',null,0,-.7);
  pl(g,[[0,.1],[-.2,.0],[-.2,.2]],'#7de3c8','#2a8a6a',.03);pl(g,[[0,.1],[.2,.0],[.2,.2]],'#7de3c8','#2a8a6a',.03);fe(g,0,.1,.05,.05,'#4fc9a8','#2a8a6a',.02);
};
A.item.b=g=>{ // Bonbon
  for(const s of[-1,1]){pl(g,[[s*.2,0],[s*.52,-.2],[s*.46,0],[s*.52,.2]],lg(g,0,-.2,0,.2,[[0,'#7de3c8'],[1,'#3fb98a']]),'#1f7a5a',.03);for(let i=-1;i<=1;i++)ln(g,[[s*.26,i*.05],[s*.46,i*.09]],'rgba(255,255,255,.6)',.02);}
  fe(g,0,0,.27,.22,lg(g,0,-.22,0,.22,[[0,'#ffe27a'],[1,'#ffb52e']]),'#a8681a',K);
  g.save();g.beginPath();g.ellipse(0,0,.27,.22,0,0,7);g.clip();for(let i=-2;i<=2;i++)ln(g,[[i*.1-.1,-.25],[i*.1+.1,.25]],'#ff5fa2',.05);g.restore();
  fe(g,-.1,-.1,.08,.04,'rgba(255,255,255,.8)',null,0,-.6);
};
A.item.c=g=>{ // Cupcake
  pl(g,[[-.26,.04],[.26,.04],[.19,.46],[-.19,.46]],lg(g,-.26,0,.26,0,[[0,'#b79cff'],[1,'#8a6be0']]),'#4a2e9a',K);
  for(let i=-3;i<=3;i++)ln(g,[[i*.07,.06],[i*.05,.44]],'rgba(255,255,255,.35)',.025);
  const f=(y,r,c0,c1)=>fe(g,0,y,r,r*.62,lg(g,0,y-r,0,y+r,[[0,c0],[1,c1]]),OL,.03);
  f(.0,.3,'#ffc0dc','#ff8fc0');f(-.14,.23,'#ffc0dc','#ff7ab4');f(-.27,.15,'#ffd0e6','#ff8fc0');
  fe(g,0,-.4,.07,.07,rg(g,-.02,-.42,.005,.09,[[0,'#ff8a8a'],[1,'#d01f3a']]),'#7a0a1a',.025);ln(g,[[0,-.46],[.04,-.56]],'#4a8a3a',.03);
  sprinkles(g,0,-.08,.24,.1,8,3);fe(g,-.12,-.14,.06,.03,'rgba(255,255,255,.7)',null,0,-.5);
};
A.item.d=g=>{ // Donut
  fe(g,0,.02,.44,.34,lg(g,0,-.34,0,.38,[[0,'#f3b868'],[1,'#c98a3e']]),'#6a3a14',K);
  g.beginPath();g.moveTo(-.4,0);for(let i=0;i<=16;i++){const a=Math.PI+i/16*Math.PI*2,r=.38+Math.sin(i*2.1)*.02;g.lineTo(Math.cos(a)*r,-.02+Math.sin(a)*(.28+Math.sin(i*3)*.02));}g.closePath();g.fillStyle=lg(g,0,-.3,0,.3,[[0,'#ffb0d6'],[1,'#ff6fae']]);g.fill();g.lineWidth=.03;g.strokeStyle='#b8316f';g.stroke();
  sprinkles(g,0,-.02,.33,.22,14,9);
  g.save();g.globalCompositeOperation='destination-out';fe(g,0,-.01,.13,.09,'#000');g.restore();fe(g,0,-.01,.13,.09,null,'#6a3a14',.03);
  fe(g,-.22,-.15,.1,.04,'rgba(255,255,255,.7)',null,0,-.5);
};
A.item.e=g=>{ // Torte
  const layer=(y,w,h,c0,c1)=>{g.beginPath();g.roundRect?g.roundRect(-w,y,w*2,h,.08):g.rect(-w,y,w*2,h);g.fillStyle=lg(g,0,y,0,y+h,[[0,c0],[1,c1]]);g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();};
  layer(.12,.44,.34,'#ffd9a6','#f0b068');layer(-.14,.34,.28,'#ffc0dc','#ff8fc0');
  g.beginPath();g.moveTo(-.34,-.14);for(let i=0;i<5;i++)g.quadraticCurveTo(-.34+i*.136+.034,-.02+(i%2)*.08,-.34+(i+1)*.136,-.14);g.closePath();g.fillStyle='#fff';g.fill();g.lineWidth=.03;g.strokeStyle='#d8a6c4';g.stroke();
  g.beginPath();g.moveTo(-.44,.12);for(let i=0;i<6;i++)g.quadraticCurveTo(-.44+i*.147+.037,.24+(i%2)*.06,-.44+(i+1)*.147,.12);g.closePath();g.fillStyle='#fff';g.fill();g.lineWidth=.03;g.strokeStyle='#d8a6c4';g.stroke();
  fe(g,-.2,-.2,.06,.06,rg(g,-.22,-.22,.005,.08,[[0,'#ff8a8a'],[1,'#d01f3a']]),'#7a0a1a',.02);fe(g,.2,-.2,.06,.06,rg(g,.18,-.22,.005,.08,[[0,'#ff8a8a'],[1,'#d01f3a']]),'#7a0a1a',.02);
  ln(g,[[0,-.18],[0,-.4]],'#5fd0ff',.07);fe(g,0,-.46,.045,.07,'#ffd23a','#e0801a',.02);
  sprinkles(g,0,.3,.38,.04,6,4);
};
const mound=(g)=>{fe(g,0,.44,.5,.17,'rgba(0,0,0,.14)');fe(g,0,.4,.44,.15,'#fff3e0','#d9b48a',.03);sprinkles(g,0,.4,.38,.1,9,2);};
const sub=(g,fn,y,s)=>{g.save();g.translate(0,y);g.scale(s,s);fn(g);g.restore();};
A.node.a=g=>{mound(g);sub(g,A.item.a,-.04,.92);};
A.node.b=g=>{
  fe(g,0,.44,.55,.17,'rgba(0,0,0,.14)');
  for(const p of[[-.26,.24,.3],[.26,.26,.28],[0,.12,.36],[-.1,.34,.26],[.14,.36,.24]])fe(g,p[0],p[1],p[2],p[2]*.9,lg(g,0,p[1]-p[2],0,p[1]+p[2],[[0,'#a6f0c4'],[1,'#4fc98a']]),'#1f7a5a',.035);
  sub(g,A.item.b,-.02,.55);g.save();g.translate(-.3,.2);g.scale(.42,.42);A.item.b(g);g.restore();g.save();g.translate(.3,.24);g.scale(.42,.42);A.item.b(g);g.restore();
};
A.node.c=g=>{
  fe(g,0,.44,.5,.17,'rgba(0,0,0,.14)');
  fe(g,0,.4,.44,.14,'#fff','#d8a6c4',.03);fe(g,0,.38,.34,.09,'#ffd9ea');
  sub(g,A.item.c,-.02,.95);
};
A.node.d=g=>{
  fe(g,0,.44,.52,.17,'rgba(0,0,0,.14)');
  ln(g,[[0,.5],[0,.18]],'#c9a06a',.1);fe(g,0,.46,.2,.07,'#c9a06a','#7a5a2a',.03);
  sub(g,A.item.d,-.05,.92);
};
const outline='#6a3a14';

// ---- Tier-Figuren (frontal) ----
const critter=(g,o)=>{
  // Schwanz/Ruecken
  if(o.back)o.back(g);
  // Füße
  fe(g,-.15,.62,.12,.07,o.fur2||o.fur,OL,.03);fe(g,.15,.62,.12,.07,o.fur2||o.fur,OL,.03);
  // Körper
  fe(g,0,.34,.3,.32,lg(g,0,.05,0,.62,[[0,o.shirt||'#fff'],[1,o.shirt2||'#ffd9ea']]),OL,K);
  if(o.belly)fe(g,0,.4,.17,.2,o.belly);
  // Arme
  fe(g,-.33,.32,.09,.17,o.fur2||o.fur,OL,.03,.35);fe(g,.33,.32,.09,.17,o.fur2||o.fur,OL,.03,-.35);
  // Schleife
  if(o.bow){pl(g,[[0,.12],[-.14,.04],[-.14,.2]],o.bow,OL,.025);pl(g,[[0,.12],[.14,.04],[.14,.2]],o.bow,OL,.025);fe(g,0,.12,.04,.04,o.bow,OL,.02);}
  if(o.ears)o.ears(g);
  fe(g,0,-.14,.4,.37,lg(g,0,-.5,0,.22,[[0,o.fur],[1,o.fur2||o.fur]]),OL,K);
  if(o.face)o.face(g);
  // Augen
  for(const s of[-1,1])eye(g,s*.15,-.16,.07,0);
  fe(g,-.27,-.04,.06,.04,'rgba(255,110,150,.5)');fe(g,.27,-.04,.06,.04,'rgba(255,110,150,.5)');
  if(o.nose!==false)g.beginPath(),g.arc(0,-.04,.05,.3,Math.PI-.3),g.strokeStyle=OL,g.lineWidth=.03,g.stroke();
  fe(g,-.12,-.36,.09,.04,'rgba(255,255,255,.35)',null,0,-.4);
};
const round=(x,y,r,c,ci)=>g=>{fe(g,x,y,r,r,c,OL,.035);fe(g,x,y+.01,r*.55,r*.55,ci);};
const bear=g=>critter(g,{fur:'#c98a58',fur2:'#a8683a',shirt:'#7fd3ff',shirt2:'#4fb0e8',bow:'#ff5f8a',
  ears:g=>{round(-.3,-.42,.13,'#b97a48','#e8b888')(g);round(.3,-.42,.13,'#b97a48','#e8b888')(g);},
  face:g=>{fe(g,0,-.03,.17,.12,'#f3dcb8',OL,.03);fe(g,0,-.08,.05,.035,'#3a2218');}});
const bunny=g=>critter(g,{fur:'#fff',fur2:'#f3e4ee',shirt:'#ffd45f',shirt2:'#ffb52e',bow:'#b58cff',
  ears:g=>{for(const s of[-1,1]){g.save();g.translate(s*.16,-.64);g.rotate(s*.12);fe(g,0,0,.1,.3,'#fff',OL,.035);fe(g,0,.02,.05,.22,'#ffb3cf');g.restore();}},
  face:g=>{fe(g,0,-.07,.045,.032,'#ff8aaa');for(const s of[-1,1])ln(g,[[s*.1,-.02],[s*.3,-.05]],'rgba(122,42,85,.5)',.02);}});
const fox=g=>critter(g,{fur:'#ff9b3d',fur2:'#e8741a',shirt:'#b6f0a0',shirt2:'#7fd36a',bow:'#ff5f8a',
  back:g=>{g.save();g.translate(.36,.5);g.rotate(-.7);fe(g,0,0,.2,.34,lg(g,0,-.3,0,.3,[[0,'#ff9b3d'],[1,'#e8741a']]),OL,.035);fe(g,0,-.26,.14,.12,'#fff');g.restore();},
  ears:g=>{for(const s of[-1,1]){pl(g,[[s*.14,-.4],[s*.4,-.4],[s*.34,-.74]],'#ff9b3d',OL,.035);pl(g,[[s*.2,-.44],[s*.34,-.44],[s*.32,-.62]],'#3a2218',null);}},
  face:g=>{pl(g,[[-.4,-.04],[0,.1],[.4,-.04],[.3,.12],[0,.2],[-.3,.12]],'#fff',null);fe(g,0,-.05,.045,.035,'#2a1810');}});
const panda=g=>critter(g,{fur:'#fff',fur2:'#eef0f2',shirt:'#fff',shirt2:'#ffd9ea',bow:'#7de39a',
  ears:g=>{round(-.3,-.42,.13,'#2a2a30','#4a4a52')(g);round(.3,-.42,.13,'#2a2a30','#4a4a52')(g);},
  face:g=>{for(const s of[-1,1]){g.save();g.translate(s*.15,-.15);g.rotate(s*.5);fe(g,0,0,.1,.13,'#2a2a30');g.restore();}fe(g,0,-.05,.045,.035,'#2a2a30');}});
const cat=g=>critter(g,{fur:'#a6b4c8',fur2:'#8496b0',shirt:'#ff9ac0',shirt2:'#ff6fa2',bow:'#ffd23a',
  ears:g=>{for(const s of[-1,1]){pl(g,[[s*.12,-.4],[s*.4,-.36],[s*.34,-.72]],'#a6b4c8',OL,.035);pl(g,[[s*.2,-.43],[s*.34,-.42],[s*.32,-.6]],'#ffb3cf',null);}},
  face:g=>{for(const s of[-1,1]){for(const k of[-.02,.04])ln(g,[[s*.14,k],[s*.42,k+(k>0?.03:-.03)]],'rgba(60,40,70,.6)',.02);}for(const x of[-.08,0,.08])ln(g,[[x,-.5],[x,-.4]],'#8496b0',.04);fe(g,0,-.06,.04,.03,'#ff8aaa');}});
const pig=g=>critter(g,{fur:'#ffb3c7',fur2:'#ff90ae',shirt:'#9ee6ff',shirt2:'#5fc4f0',bow:'#ffd23a',
  ears:g=>{for(const s of[-1,1]){pl(g,[[s*.14,-.42],[s*.42,-.4],[s*.36,-.2]],'#ff90ae',OL,.035);}},
  face:g=>{fe(g,0,-.03,.15,.1,'#ff8aaa',OL,.03);fe(g,-.05,-.03,.025,.04,'#a8325a');fe(g,.05,-.03,.025,.04,'#a8325a');},nose:false});
A.cust=[bear,bunny,fox,panda,cat,pig];

A.helper=g=>{ // Eichhörnchen
  g.save();g.translate(.34,.2);g.rotate(.4);fe(g,0,-.2,.24,.44,lg(g,-.2,0,.2,0,[[0,'#d98a4a'],[1,'#a8602a']]),OL,K);fe(g,0,-.3,.14,.28,'rgba(255,220,170,.5)');g.restore();
  fe(g,-.14,.6,.11,.06,'#a8602a',OL,.03);fe(g,.14,.6,.11,.06,'#a8602a',OL,.03);
  fe(g,0,.32,.26,.3,lg(g,0,.05,0,.6,[[0,'#d98a4a'],[1,'#b8682c']]),OL,K);fe(g,0,.38,.16,.18,'#ffe6c4');
  fe(g,-.29,.3,.08,.15,'#d98a4a',OL,.03,.3);fe(g,.29,.3,.08,.15,'#d98a4a',OL,.03,-.3);
  // Eichel
  fe(g,.0,.36,.07,.06,'#c9a06a',OL,.02);
  for(const s of[-1,1]){pl(g,[[s*.14,-.34],[s*.36,-.36],[s*.3,-.62]],'#d98a4a',OL,.035);pl(g,[[s*.2,-.38],[s*.32,-.4],[s*.3,-.54]],'#ffb3cf',null);}
  fe(g,0,-.12,.36,.33,lg(g,0,-.45,0,.2,[[0,'#e69a58'],[1,'#c0702e']]),OL,K);
  fe(g,0,-.0,.2,.14,'#ffe6c4');
  for(const s of[-1,1])eye(g,s*.14,-.15,.07,0);
  fe(g,0,-.06,.045,.035,'#3a2218');
  g.beginPath();g.arc(0,-.01,.06,.3,Math.PI-.3);g.strokeStyle=OL;g.lineWidth=.025;g.stroke();
  for(const s of[-1,1])fe(g,s*.07,.06,.035,.06,'#fff',OL,.02);
};
A.foreman=g=>{ // Eisbär-Bäckermeister
  critter(g,{fur:'#fff',fur2:'#e8f0f6',shirt:'#fff',shirt2:'#e0ecf4',bow:'#ff4f6a',
   ears:g=>{round(-.3,-.4,.12,'#fff','#ffd0e0')(g);round(.3,-.4,.12,'#fff','#ffd0e0')(g);},
   face:g=>{fe(g,0,-.03,.15,.11,'#fff',OL,.02);fe(g,0,-.07,.045,.032,'#2a2a30');}});
  // Kochmütze
  g.beginPath();g.roundRect?g.roundRect(-.26,-.5,.52,.16,.05):g.rect(-.26,-.5,.52,.16);g.fillStyle='#fff';g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();
  for(const p of[[-.2,-.62,.17],[0,-.7,.2],[.2,-.62,.17]])fe(g,p[0],p[1],p[2],p[2],'#fff',OL,.035);
  fe(g,-.04,-.72,.07,.04,'rgba(200,210,230,.5)');
};
A.gardener=g=>{ // Zuckerfee
  g.save();g.globalAlpha=.8;for(const s of[-1,1]){g.save();g.translate(s*.3,-.05);g.rotate(s*.5);fe(g,0,0,.2,.34,lg(g,0,-.3,0,.3,[[0,'rgba(255,255,255,.95)'],[1,'rgba(190,170,255,.7)']]),'rgba(160,130,230,.9)',.03);g.restore();g.save();g.translate(s*.26,.2);g.rotate(-s*.4);fe(g,0,0,.12,.2,'rgba(255,220,250,.85)','rgba(220,160,230,.9)',.025);g.restore();}g.restore();
  fe(g,-.07,.62,.05,.07,'#ffd9c0',OL,.02);fe(g,.07,.62,.05,.07,'#ffd9c0',OL,.02);ln(g,[[-.07,.45],[-.07,.58]],'#ffd9c0',.06);ln(g,[[.07,.45],[.07,.58]],'#ffd9c0',.06);
  pl(g,[[-.12,.0],[.12,.0],[.3,.46],[-.3,.46]],lg(g,0,0,0,.46,[[0,'#ff9ad0'],[1,'#ff5fa2']]),OL,K);
  for(let i=-2;i<=2;i++)fe(g,i*.1,.44,.05,.05,'#fff',null);
  fe(g,0,-.16,.3,.28,'#ffe0c8',OL,K);
  for(const s of[-1,1]){fe(g,s*.27,-.38,.13,.13,'#ff9ad0',OL,.03);}
  g.beginPath();g.arc(0,-.3,.3,Math.PI*1.05,Math.PI*1.95);g.fillStyle='#ff9ad0';g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();
  for(const s of[-1,1])eye(g,s*.12,-.14,.06,0);
  fe(g,-.2,-.05,.05,.03,'rgba(255,110,150,.5)');fe(g,.2,-.05,.05,.03,'rgba(255,110,150,.5)');
  g.beginPath();g.arc(0,-.04,.05,.3,Math.PI-.3);g.strokeStyle=OL;g.lineWidth=.025;g.stroke();
  // Zauberstab
  ln(g,[[.3,.18],[.5,-.1]],'#fff',.05);const st=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*6.283,r=i%2?.05:.12;st.push([.52+Math.cos(a)*r,-.16+Math.sin(a)*r]);}pl(g,st,'#ffd23a','#c98a1a',.02);
};
A.bin=g=>{
  fe(g,0,.4,.4,.12,'rgba(0,0,0,.18)');
  g.beginPath();g.moveTo(-.34,-.1);g.lineTo(-.26,.4);g.lineTo(.26,.4);g.lineTo(.34,-.1);g.closePath();g.fillStyle=lg(g,-.3,0,.3,0,[[0,'#ffb3d4'],[1,'#ff7ab4']]);g.fill();g.lineWidth=K;g.strokeStyle=OL;g.stroke();
  for(let i=-1;i<=1;i++)ln(g,[[i*.13,-.05],[i*.1,.36]],'rgba(255,255,255,.55)',.045);
  fe(g,0,-.1,.4,.1,'#fff',OL,.035);fe(g,0,-.1,.28,.05,'#8a3a62');
  ln(g,[[-.1,.0],[0,.1],[.1,.0]],'#fff',.04);
};
// Deko: Zuckerstange, Wirbellolli, Bonbon
const cane=g=>{g.beginPath();g.moveTo(-.2,.7);g.lineTo(-.2,-.2);g.bezierCurveTo(-.2,-.6,.25,-.6,.25,-.2);g.lineWidth=.22;g.lineCap='round';g.strokeStyle='#7a2a55';g.stroke();g.lineWidth=.16;g.strokeStyle='#fff';g.stroke();g.setLineDash([.12,.16]);g.strokeStyle='#ff4f8a';g.stroke();g.setLineDash([]);};
const swirl=g=>{ln(g,[[0,.1],[0,.75]],'#fff',.1);fe(g,0,-.25,.4,.4,rg(g,-.1,-.35,.02,.5,[[0,'#ffd0a0'],[1,'#ffa050']]),OL,K);g.save();g.beginPath();g.arc(0,-.25,.37,0,7);g.clip();g.beginPath();for(let t=0;t<=1;t+=.02){const a=t*14,r=t*.37;const x=Math.cos(a)*r,y=-.25+Math.sin(a)*r;t?g.lineTo(x,y):g.moveTo(x,y);}g.lineWidth=.08;g.strokeStyle='#fff';g.lineCap='round';g.stroke();g.restore();};
const gummy=g=>{fe(g,0,.4,.28,.14,'#7de39a',OL,.035);fe(g,0,.1,.24,.34,lg(g,0,-.2,0,.5,[[0,'#9af0b4'],[1,'#4fc98a']]),OL,K);fe(g,-.07,-.05,.05,.1,'rgba(255,255,255,.5)',null,0,.2);};
const donutDeco=g=>{A.item.d(g);};
A.edge=[cane,swirl,gummy,cane,swirl,donutDeco];
const cookie=g=>{A.coin(g);};
const star=g=>{const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*6.283,r=i%2?.12:.3;p.push([Math.cos(a)*r,Math.sin(a)*r+.03]);}pl(g,p,'#ffe27a','#c98a1a',.03);};
const dot=g=>{fe(g,0,0,.16,.16,rg(g,-.05,-.05,.01,.2,[[0,'#fff'],[1,'#ffb3d4']]),'#e07aa8',.03);};
const choc=g=>{pl(g,[[-.26,-.2],[.26,-.2],[.26,.2],[-.26,.2]],'#7a4a2a','#3a2010',.03);for(const x of[-.09,.09])for(const y of[-.0])ln(g,[[x,-.2],[x,.2]],'rgba(0,0,0,.3)',.025);ln(g,[[-.26,0],[.26,0]],'rgba(0,0,0,.3)',.025);};
A.floor=[cookie,star,dot,choc];

// Spieler: Bäckerin (live)
A.player=(g,a)=>{
  const sw=Math.sin(a.walk*(a.moving?10:3)),b=Math.abs(Math.sin(a.walk*(a.moving?10:3)))*(a.moving?.07:0)+Math.sin(a.walk*3)*.02;
  g.save();g.translate(0,-b);
  // Beine/Schuhe
  for(const s of[-1,1]){const lift=a.moving?Math.max(0,Math.sin(a.walk*10+(s>0?0:Math.PI)))*.1:0;ln(g,[[s*.12,.42],[s*.12,.56-lift]],'#fff',.1);fe(g,s*.12+.03,.62-lift,.12,.07,'#c0508a',OL,.03);}
  // Körper
  fe(g,0,.22,.3,.36,lg(g,0,-.1,0,.6,[[0,'#ffffff'],[1,'#ece4f4']]),OL,K);
  pl(g,[[-.18,.0],[.18,.0],[.22,.46],[-.22,.46]],lg(g,0,0,0,.46,[[0,'#ff8cc0'],[1,'#ff5fa2']]),OL,.03);
  fe(g,0,.14,.07,.06,'#fff',OL,.02);
  // Arme
  for(const s of[-1,1]){g.save();g.translate(s*.32,.06);g.rotate(s*(.35+(a.moving?sw*.5*s:0)));fe(g,0,.14,.09,.2,'#fff',OL,.03);fe(g,0,.34,.085,.085,'#ffd9c0',OL,.025);g.restore();}
  // Kopf
  fe(g,0,-.3,.34,.32,lg(g,0,-.6,0,.05,[[0,'#ffe9d6'],[1,'#ffd0b0']]),OL,K);
  g.beginPath();g.arc(0,-.38,.33,Math.PI*1.02,Math.PI*1.98);g.fillStyle='#8a4a2a';g.fill();g.lineWidth=.03;g.strokeStyle=OL;g.stroke();
  fe(g,-.3,-.18,.1,.12,'#8a4a2a',OL,.03);fe(g,.3,-.18,.1,.12,'#8a4a2a',OL,.03);
  const lk=a.face*.3;eye(g,-.12,-.28,.065,lk);eye(g,.12,-.28,.065,lk);
  fe(g,-.2,-.16,.06,.035,'rgba(255,110,150,.55)');fe(g,.2,-.16,.06,.035,'rgba(255,110,150,.55)');
  g.beginPath();g.arc(0,-.17,.06,.2,Math.PI-.2);g.strokeStyle=OL;g.lineWidth=.03;g.stroke();
  // Kochmütze
  g.beginPath();g.roundRect?g.roundRect(-.27,-.62,.54,.15,.05):g.rect(-.27,-.62,.54,.15);g.fillStyle='#fff';g.fill();g.lineWidth=.035;g.strokeStyle=OL;g.stroke();
  for(const p of[[-.2,-.74,.17],[0,-.84,.2],[.2,-.74,.17]])fe(g,p[0],p[1],p[2],p[2],lg(g,0,p[1]-p[2],0,p[1]+p[2],[[0,'#fff'],[1,'#e8e4f4']]),OL,.035);
  fe(g,-.05,-.9,.07,.04,'rgba(255,255,255,.9)');
  g.restore();
};
return A;})();
