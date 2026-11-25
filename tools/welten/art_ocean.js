const ART=(()=>{
const K=.035,OL='#0b2f45';
const A={size:{item:1.2,node:1.7,cust:1.9,helper:1.6,deco:1.8,coin:1},leftFacing:{cust:true,gardener:true},item:{},node:{}};

A.coin=g=>{
  g.beginPath();g.moveTo(0,.34);g.bezierCurveTo(-.52,.12,-.44,-.34,0,-.36);g.bezierCurveTo(.44,-.34,.52,.12,0,.34);g.closePath();
  g.fillStyle=lg(g,0,-.36,0,.34,[[0,'#ffeab0'],[1,'#e5a13a']]);g.fill();g.lineWidth=K;g.strokeStyle='#8a5a12';g.stroke();
  for(let i=-3;i<=3;i++)ln(g,[[0,.3],[i*.085,-.28]],'rgba(138,90,18,.5)',.024);
  fe(g,0,.35,.1,.05,'#e5a13a','#8a5a12',.025);fe(g,-.12,-.2,.06,.03,'rgba(255,255,255,.7)',null,0,-.5);
};
A.item.a=g=>{
  g.fillStyle=rg(g,0,0,.1,.55,[[0,'rgba(190,255,245,.55)'],[1,'rgba(190,255,245,0)']]);g.beginPath();g.arc(0,0,.55,0,7);g.fill();
  fe(g,0,.02,.3,.3,rg(g,-.1,-.1,.02,.38,[[0,'#fff'],[.5,'#eaf6ff'],[1,'#a2c0e4']]),'#6d8fb8',K);
  fe(g,-.1,-.13,.09,.055,'rgba(255,255,255,.95)',null,0,-.7);fe(g,.1,.13,.06,.03,'rgba(255,190,230,.55)',null,0,-.7);
};
A.item.b=g=>{
  const pts=[];for(let i=0;i<=6;i++){const t=i/6,u=1-t;pts.push([u*u*-.3+2*u*t*-.34+t*t*.24,u*u*-.2+2*u*t*.46+t*t*.22,.16-.075*t]);}
  ln(g,[[-.38,-.28],[-.52,-.5],[-.3,-.58]],'#e0603a',.03);ln(g,[[-.34,-.3],[-.34,-.55],[-.14,-.58]],'#e0603a',.03);
  const e=pts[6];for(const r of [-.55,0,.55]){g.save();g.translate(e[0],e[1]);g.rotate(r+.4);fe(g,.1,0,.14,.06,'#ff9a6a','#b5391c',.025);g.restore();}
  for(let i=6;i>=0;i--){const p=pts[i];ln(g,[[p[0]-.02,p[1]+p[2]*.7],[p[0]-.06,p[1]+p[2]*1.4]],'#e0603a',.025);fe(g,p[0],p[1],p[2],p[2]*.93,lg(g,0,p[1]-p[2],0,p[1]+p[2],[[0,i%2?'#ffae84':'#ffa070'],[1,'#ff6a3a']]),'#b5391c',.03);}
  eye(g,-.35,-.22,.055,-1);
};
A.item.c=g=>{
  for(const s of [-1,1]){ln(g,[[s*.14,-.02],[s*.3,-.2]],'#c1281c',.07);g.save();g.translate(s*.34,-.3);g.rotate(s*.4);fe(g,0,0,.13,.17,lg(g,0,-.17,0,.17,[[0,'#ff6a55'],[1,'#d3302a']]),'#7a1410',.03);pl(g,[[-.03,-.05],[0,-.2],[.03,-.05]],'#fbe',null);g.restore();
    for(let k=0;k<3;k++)ln(g,[[s*.14,.06+k*.08],[s*.3,.1+k*.1]],'#a8221a',.03);}
  for(const r of[.5,.2])fe(g,0,.38-r*.1,.1+r*.1,.07,'#e0392b','#7a1410',.03);
  pl(g,[[-.14,.46],[0,.62],[.14,.46]],'#ff6a55','#7a1410',.03);
  fe(g,0,.04,.2,.3,lg(g,-.2,0,.2,0,[[0,'#ff6a55'],[.6,'#e0392b'],[1,'#a8221a']]),'#7a1410',K);
  ln(g,[[-.08,-.2],[-.12,-.34]],'#a8221a',.03);ln(g,[[.08,-.2],[.12,-.34]],'#a8221a',.03);
  eye(g,-.09,-.14,.05,0);eye(g,.09,-.14,.05,0);
};
A.item.d=g=>{
  g.fillStyle=rg(g,0,0,.1,.55,[[0,'rgba(140,230,255,.5)'],[1,'rgba(140,230,255,0)']]);g.beginPath();g.arc(0,0,.55,0,7);g.fill();
  const gem=(x,y,w,h,r,c0,c1)=>{g.save();g.translate(x,y);g.rotate(r);const pts=[[-w,h*.25],[-w*.6,-h*.2],[0,-h*.55],[w*.6,-h*.2],[w,h*.25],[w*.6,h*.55],[-w*.6,h*.55]];
    pl(g,pts,lg(g,-w,-h,w,h,[[0,c0],[1,c1]]),'#24509a',.03);
    pl(g,[[-w*.6,-h*.2],[0,-h*.55],[w*.1,0],[-w*.2,h*.1]],'rgba(255,255,255,.4)',null);
    ln(g,[[0,-h*.55],[w*.1,0],[w*.6,h*.55]],'rgba(36,80,154,.5)',.02);g.restore();};
  gem(-.22,.08,.17,.45,-.35,'#9ef0ff','#4a8fe8');gem(.22,.1,.15,.38,.35,'#d6b8ff','#7a55e0');gem(0,-.02,.2,.58,0,'#c9fbff','#3fb4e8');
  g.fillStyle='#fff';pl(g,[[.28,-.32],[.31,-.25],[.38,-.22],[.31,-.19],[.28,-.12],[.25,-.19],[.18,-.22],[.25,-.25]],'#fff',null);
};
A.item.e=g=>{
  for(let i=0;i<11;i++){const a=Math.PI*.5+i/11*6.283,x=Math.cos(a)*.3,y=Math.sin(a)*.26-.02;
    fe(g,x,y,.065,.065,rg(g,x-.02,y-.02,.005,.08,[[0,'#fff'],[1,'#b5cfec']]),'#7d9cc2',.015);}
  pl(g,[[0,.3],[-.1,.4],[0,.56],[.1,.4]],lg(g,0,.3,0,.56,[[0,'#9ef0ff'],[1,'#3fa0e8']]),'#24509a',.025);
  fe(g,0,.2,.05,.05,'#ffd15c','#8a5a12',.02);
};
// Knoten (Pflanzen) mit Untergrund
const sandMound=(g,c)=>{fe(g,0,.42,.52,.18,'rgba(0,0,0,.18)');fe(g,0,.38,.46,.16,c||'#d9c48e','#a38a52',.025);};
A.node.a=g=>{
  sandMound(g);
  fe(g,0,.16,.42,.26,lg(g,0,-.1,0,.42,[[0,'#7a55b0'],[1,'#4a2d7a']]),'#2a1850',K);
  for(let i=-2;i<=2;i++)ln(g,[[i*.1,.34],[i*.14,.1]],'rgba(255,255,255,.18)',.025);
  fe(g,0,.1,.33,.17,lg(g,0,-.05,0,.25,[[0,'#ffc0e0'],[1,'#f08cc0']]),'#a8508a',.025);
  g.beginPath();g.ellipse(0,-.05,.42,.24,0,Math.PI,0);g.fillStyle=lg(g,0,-.3,0,-.05,[[0,'#a07ad8'],[1,'#6a45a0']]);g.fill();g.lineWidth=K;g.strokeStyle='#2a1850';g.stroke();
  for(let i=-2;i<=2;i++)ln(g,[[i*.1,-.06],[i*.14,-.26]],'rgba(255,255,255,.22)',.025);
  g.save();g.translate(0,-.02);g.scale(.62,.62);A.item.a(g);g.restore();
};
// Der Pearl-Knoten zeichnet die Perle kleiner: Wrapper

A.node.b=g=>{
  sandMound(g,'#d9c48e');
  const br=(x,h,c)=>{ln(g,[[x,.4],[x,.4-h*.5],[x+.08,.4-h]],c,.07);ln(g,[[x,.4-h*.5],[x-.1,.4-h*.75]],c,.05);fe(g,x+.08,.4-h,.06,.06,c);fe(g,x-.1,.4-h*.75,.05,.05,c);};
  br(-.3,.5,'#ff7aa0');br(.3,.45,'#ff9ac0');br(0,.35,'#e0608a');
  g.save();g.translate(0,.02);g.scale(.88,.88);A.item.b(g);g.restore();
};
A.node.c=g=>{
  sandMound(g,'#cdb98a');
  g.beginPath();g.ellipse(0,.3,.46,.2,0,0,7);g.fillStyle='#8a6a42';g.fill();
  g.beginPath();g.ellipse(0,.14,.44,.38,0,Math.PI,0);g.lineTo(.44,.3);g.bezierCurveTo(.3,.46,-.3,.46,-.44,.3);g.closePath();
  g.fillStyle=lg(g,0,-.3,0,.4,[[0,'#c9a25f'],[1,'#8a6a42']]);g.fill();g.lineWidth=K;g.strokeStyle='#4a3318';g.stroke();
  g.save();g.beginPath();g.ellipse(0,.14,.44,.38,0,Math.PI,0);g.lineTo(.44,.3);g.bezierCurveTo(.3,.46,-.3,.46,-.44,.3);g.closePath();g.clip();
  for(let i=-5;i<=5;i++){ln(g,[[i*.1,-.3],[i*.12,.45]],'rgba(74,51,24,.55)',.02);ln(g,[[-.5,i*.07],[.5,i*.07+.1]],'rgba(74,51,24,.4)',.02);}g.restore();
  g.save();g.translate(0,-.12);g.scale(.8,.8);A.item.c(g);g.restore();
};
A.node.d=g=>{
  fe(g,0,.42,.56,.18,'rgba(0,0,0,.2)');
  g.beginPath();g.moveTo(-.46,.42);g.bezierCurveTo(-.5,.1,-.3,-.02,0,-.04);g.bezierCurveTo(.3,-.02,.5,.1,.46,.42);g.closePath();
  g.fillStyle=lg(g,0,-.04,0,.42,[[0,'#7f93b0'],[1,'#4c5f80']]);g.fill();g.lineWidth=K;g.strokeStyle='#26324a';g.stroke();
  ln(g,[[-.2,.1],[-.1,.3]],'rgba(255,255,255,.2)',.03);ln(g,[[.2,.12],[.3,.34]],'rgba(255,255,255,.18)',.03);
  g.save();g.translate(0,-.12);g.scale(.95,.95);A.item.d(g);g.restore();
};

// ---- Figuren (nach links schauend) ----
const fish=(g,o)=>{
  pl(g,[[.36,0],[.74,-.3],[.66,0],[.74,.3]],o.fin,o.line,K);
  pl(g,[[-.12,-.28],[.02,-.52],[.32,-.26]],o.fin,o.line,K);
  fe(g,0,0,.5,.35,lg(g,0,-.35,0,.35,[[0,o.c0],[1,o.c1]]),o.line,K);
  if(o.deco)o.deco(g);
  fe(g,.02,.13,.12,.06,o.fin,o.line,.025,.5);
  eye(g,-.28,-.07,.08,-1);
  g.beginPath();g.arc(-.44,.09,.07,.2,2.1);g.strokeStyle=o.line;g.lineWidth=.028;g.stroke();
  fe(g,-.3,.1,.05,.03,'rgba(255,120,150,.45)');
};
const clown=g=>fish(g,{c0:'#ffb44e',c1:'#ff7a14',fin:'#ff8a2a',line:'#7a3200',deco:g=>{g.save();g.beginPath();g.ellipse(0,0,.5,.35,0,0,7);g.clip();for(const x of[-.14,.2]){g.fillStyle='#fff';g.fillRect(x-.05,-.4,.1,.8);ln(g,[[x-.05,-.4],[x-.05,.4]],'#222',.02);ln(g,[[x+.05,-.4],[x+.05,.4]],'#222',.02);}g.restore();}});
const tang=g=>fish(g,{c0:'#58b8ff',c1:'#1f6fd0',fin:'#ffd23a',line:'#0e2f66',deco:g=>{g.save();g.beginPath();g.ellipse(0,0,.5,.35,0,0,7);g.clip();g.beginPath();g.moveTo(-.1,-.3);g.bezierCurveTo(.1,-.3,.3,-.1,.45,-.04);g.bezierCurveTo(.2,-.02,.1,.1,-.1,.14);g.bezierCurveTo(-.2,.0,-.2,-.2,-.1,-.3);g.fillStyle='#16224a';g.fill();g.restore();}});
const puffer=g=>{
  const sp=[];for(let i=0;i<16;i++){const a=i/16*6.283;sp.push([Math.cos(a)*.43,Math.sin(a)*.4]);}
  for(const s of sp){g.save();g.translate(s[0],s[1]);g.rotate(Math.atan2(s[1],s[0])+Math.PI/2);pl(g,[[-.05,0],[0,-.1],[.05,0]],'#d9a94a','#7a5a18',.02);g.restore();}
  pl(g,[[.34,0],[.62,-.18],[.58,0],[.62,.18]],'#f5cd62','#7a5a18',K);
  fe(g,0,0,.4,.38,lg(g,0,-.38,0,.38,[[0,'#ffe58a'],[1,'#f0b43c']]),'#7a5a18',K);
  fe(g,0,.14,.3,.2,'#fff3c4');
  fe(g,.02,.0,.08,.05,'#f5cd62','#7a5a18',.02,.4);
  eye(g,-.2,-.1,.1,-1);eye(g,.04,-.12,.09,-1);
  g.beginPath();g.arc(-.3,.14,.06,.1,3);g.strokeStyle='#7a5a18';g.lineWidth=.03;g.stroke();
};
const octo=(g,hat)=>{
  const col=lg(g,0,-.4,0,.3,[[0,'#c18cff'],[1,'#8a52d8']]);
  for(let i=0;i<5;i++){const x=-.32+i*.16;g.beginPath();g.moveTo(x,.15);g.bezierCurveTo(x+(i%2?.12:-.12),.38,x+(i%2?-.1:.1),.5,x+(i%2?.14:-.14),.62);g.lineWidth=.12;g.lineCap='round';g.strokeStyle='#5a2e9a';g.stroke();g.lineWidth=.085;g.strokeStyle='#a46af0';g.stroke();}
  fe(g,0,-.08,.4,.38,col,'#4a2680',K);
  fe(g,-.14,-.24,.12,.07,'rgba(255,255,255,.45)',null,0,-.5);
  eye(g,-.17,-.04,.1,-1);eye(g,.12,-.04,.1,-1);
  g.beginPath();g.arc(-.02,.1,.07,.2,2.9);g.strokeStyle='#4a2680';g.lineWidth=.03;g.stroke();
  fe(g,-.28,.06,.05,.03,'rgba(255,120,170,.5)');fe(g,.26,.06,.05,.03,'rgba(255,120,170,.5)');
  if(hat){pl(g,[[-.32,-.32],[.32,-.32],[.26,-.5],[0,-.62],[-.26,-.5]],'#1f3a6a','#0b1a38',.03);fe(g,0,-.32,.36,.07,'#142a50','#0b1a38',.03);fe(g,0,-.5,.07,.07,'#ffd15c','#8a5a12',.02);}
};
const jelly=g=>{
  for(let i=0;i<5;i++){const x=-.28+i*.14;g.beginPath();g.moveTo(x,.1);g.bezierCurveTo(x-.1,.3,x+.1,.45,x-.04,.65);g.lineWidth=.07;g.lineCap='round';g.strokeStyle='rgba(255,150,200,.85)';g.stroke();}
  g.beginPath();g.moveTo(-.42,.12);g.bezierCurveTo(-.46,-.5,.46,-.5,.42,.12);for(let i=0;i<6;i++){const x=.42-i*.14;g.quadraticCurveTo(x-.07,.2,x-.14,.12);}g.closePath();
  g.fillStyle=lg(g,0,-.4,0,.15,[[0,'#ffc0e8'],[1,'#ff8ad0']]);g.fill();g.lineWidth=K;g.strokeStyle='#b8458f';g.stroke();
  fe(g,-.14,-.22,.14,.07,'rgba(255,255,255,.6)',null,0,-.5);
  eye(g,-.13,-.04,.07,-1);eye(g,.1,-.04,.07,-1);
  fe(g,-.25,.04,.045,.03,'rgba(255,100,150,.5)');fe(g,.22,.04,.045,.03,'rgba(255,100,150,.5)');
};
const shark=g=>fish(g,{c0:'#9fc2dc',c1:'#5d86aa',fin:'#6d94b8',line:'#1d3550',deco:g=>{g.save();g.beginPath();g.ellipse(0,0,.5,.35,0,0,7);g.clip();fe(g,-.05,.3,.55,.22,'#f2f8fc');g.restore();
  for(let i=0;i<4;i++)pl(g,[[-.47+i*.05,.1],[-.44+i*.05,.17],[-.41+i*.05,.1]],'#fff','#1d3550',.012);}});
A.cust=[clown,tang,puffer,g=>octo(g,false),jelly,shark];

A.helper=g=>{ // Krabbe
  for(const s of [-1,1]){
    for(let i=0;i<3;i++)ln(g,[[s*.2,.12+i*.07],[s*.4,.14+i*.1],[s*.5,.3+i*.1]],'#a8281c',.05);
    ln(g,[[s*.26,-.02],[s*.4,-.2]],'#c9362a',.07);
    g.save();g.translate(s*.44,-.3);g.rotate(s*.3);fe(g,0,0,.16,.2,lg(g,0,-.2,0,.2,[[0,'#ff7a66'],[1,'#d3302a']]),'#7a1410',.03);pl(g,[[-.04,-.06],[0,-.24],[.04,-.06]],'#fde',null);g.restore();
    ln(g,[[s*.1,-.12],[s*.12,-.28]],'#a8281c',.03);fe(g,s*.12,-.3,.065,.065,'#fff','#7a1410',.02);fe(g,s*.12-s*.01,-.3,.035,.04,'#111');
  }
  fe(g,0,.06,.36,.26,lg(g,0,-.2,0,.32,[[0,'#ff7a66'],[1,'#d3302a']]),'#7a1410',K);
  fe(g,-.1,-.04,.12,.06,'rgba(255,255,255,.35)',null,0,-.4);
  g.beginPath();g.arc(0,.1,.09,.2,2.9);g.strokeStyle='#7a1410';g.lineWidth=.03;g.stroke();
};
A.foreman=g=>octo(g,true);
A.gardener=g=>{ // Schildkröte, nach links
  for(const p of [[-.22,.28,.3],[.24,.28,-.3],[-.2,-.22,-.3],[.22,-.22,.3]]){g.save();g.translate(p[0],p[1]);g.rotate(p[2]);fe(g,0,0,.16,.08,'#6fd48a','#1d6a3a',.03);g.restore();}
  fe(g,-.5,.02,.17,.14,lg(g,0,-.14,0,.14,[[0,'#8fe6a0'],[1,'#52c06e']]),'#1d6a3a',K);
  eye(g,-.56,-.02,.055,-1);g.beginPath();g.arc(-.58,.07,.05,.2,2.9);g.strokeStyle='#1d6a3a';g.lineWidth=.025;g.stroke();
  pl(g,[[.36,.04],[.5,.1],[.36,.12]],'#52c06e','#1d6a3a',.025);
  fe(g,0,0,.42,.36,lg(g,0,-.36,0,.36,[[0,'#7bd88f'],[1,'#2f8a52']]),'#1d6a3a',K);
  for(const p of [[0,0],[-.2,-.12],[.2,-.12],[-.2,.14],[.2,.14]]){const q=[];for(let i=0;i<6;i++){const a=i/6*6.283+.52;q.push([p[0]+Math.cos(a)*.11,p[1]+Math.sin(a)*.1]);}pl(g,q,'rgba(255,255,255,.14)','#1d6a3a',.02);}
  fe(g,-.12,-.22,.12,.05,'rgba(255,255,255,.4)',null,0,-.4);
};
A.bin=g=>{
  fe(g,0,.4,.4,.12,'rgba(0,0,0,.2)');
  g.beginPath();g.moveTo(-.34,-.1);g.lineTo(-.28,.4);g.lineTo(.28,.4);g.lineTo(.34,-.1);g.closePath();g.fillStyle=lg(g,-.3,0,.3,0,[[0,'#6b8aa0'],[1,'#3f5a70']]);g.fill();g.lineWidth=K;g.strokeStyle=OL;g.stroke();
  for(let i=-1;i<=1;i++)ln(g,[[i*.14,-.05],[i*.12,.36]],'rgba(255,255,255,.2)',.03);
  fe(g,0,-.1,.4,.1,'#9ab6c8',OL,.03);fe(g,0,-.1,.28,.05,'#1c2b38');
  ln(g,[[-.12,.1],[0,.2],[.12,.1]],'#bff',.035);
};
// Deko
const kelp=g=>{for(const [x,h,c,w] of [[-.2,.8,'#2fbf7a',.1],[.05,.95,'#3fd68c',.12],[.28,.7,'#259a62',.09]]){g.beginPath();g.moveTo(x,.7);g.bezierCurveTo(x-.2,.7-h*.4,x+.2,.7-h*.7,x,.7-h);g.lineWidth=w;g.lineCap='round';g.strokeStyle=c;g.stroke();g.lineWidth=w*.3;g.strokeStyle='rgba(255,255,255,.3)';g.stroke();}};
const fan=g=>{g.fillStyle='#ff7a9a';for(let i=-3;i<=3;i++){ln(g,[[0,.7],[i*.14,.1],[i*.2,-.35]],i%2?'#ff7a9a':'#ff9ab4',.08);}fe(g,0,.7,.14,.06,'#c24a6a');};
const brain=g=>{fe(g,0,.4,.3,.24,lg(g,0,.1,0,.6,[[0,'#ffb27a'],[1,'#e0703a']]),'#8a3a14',K);for(const x of[-.15,0,.15])ln(g,[[x,.25],[x+.04,.5]],'rgba(138,58,20,.5)',.03);};
A.edge=[kelp,fan,kelp,brain];
const star=g=>{const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*6.283,r=i%2?.12:.3;p.push([Math.cos(a)*r,Math.sin(a)*r+.05]);}pl(g,p,lg(g,0,-.3,0,.3,[[0,'#ffb27a'],[1,'#ff7a4a']]),'#a8421a',.03);};
const shell=g=>{g.beginPath();g.moveTo(0,.3);g.bezierCurveTo(-.5,.1,-.4,-.3,0,-.3);g.bezierCurveTo(.4,-.3,.5,.1,0,.3);g.fillStyle='#f6d9e8';g.fill();g.lineWidth=.03;g.strokeStyle='#c07a9a';g.stroke();for(let i=-3;i<=3;i++)ln(g,[[0,.28],[i*.07,-.26]],'rgba(192,122,154,.6)',.02);};
const bubble=g=>{fe(g,0,0,.2,.2,'rgba(200,250,255,.35)','rgba(255,255,255,.7)',.03);fe(g,-.07,-.07,.05,.04,'rgba(255,255,255,.8)');};
A.floor=[star,shell,bubble,shell];

// Spieler: Taucher (live gezeichnet)
A.player=(g,a)=>{
  const sw=Math.sin(a.walk*(a.moving?10:3)),b=Math.sin(a.walk*6)*(a.moving?.05:.03);
  g.save();g.translate(0,b);
  ln(g,[[-.2,-.28],[-.48,-.5],[-.36,-.68]],'#1e7a6a',.05);
  g.beginPath();g.roundRect?g.roundRect(-.62,-.32,.34,.82,.14):g.rect(-.62,-.32,.34,.82);g.fillStyle=lg(g,-.62,0,-.28,0,[[0,'#2ee6c8'],[1,'#1aa890']]);g.fill();g.lineWidth=K;g.strokeStyle=OL;g.stroke();
  ln(g,[[-.62,-.1],[-.28,-.1]],'rgba(0,0,0,.25)',.03);
  const fin=(x,r)=>{g.save();g.translate(x,.62);g.rotate(r);fe(g,0,.1,.2,.075,lg(g,0,0,.3,0,[[0,'#ff9a7a'],[1,'#ff5f4a']]),OL,.03);g.restore();};
  fin(-.16,.35+sw*.5);fin(.16,-.35-sw*.5);
  ln(g,[[-.14,.36],[-.16,.6]],'#e0a418',.14);ln(g,[[.14,.36],[.16,.6]],'#e0a418',.14);
  fe(g,0,.1,.4,.5,lg(g,-.4,0,.4,0,[[0,'#ffe36a'],[.7,'#ffcf3d'],[1,'#e0a418']]),OL,K);
  ln(g,[[-.38,.22],[.38,.22]],'#c88a10',.07);ln(g,[[-.3,.02],[.3,.02]],'rgba(255,255,255,.35)',.04);
  fe(g,0,.4,.07,.07,'#fff7c0','#8a5a12',.02);
  const arm=(s)=>{g.save();g.translate(s*.38,.0);g.rotate(s*(.5+sw*.4*(s)));fe(g,0,.22,.1,.24,'#ffcf3d',OL,.03);fe(g,0,.44,.09,.09,'#fff',OL,.025);g.restore();};
  arm(-1);arm(1);
  fe(g,.02,-.46,.42,.4,lg(g,0,-.8,0,-.1,[[0,'#f4fdff'],[1,'#b5d8e4']]),OL,K);
  fe(g,.1,-.46,.31,.29,rg(g,.04,-.55,.02,.4,[[0,'#cdf8ff'],[.6,'#46a8d0'],[1,'#1f6c96']]),OL,.03);
  g.save();g.beginPath();g.ellipse(.1,-.46,.31,.29,0,0,7);g.clip();fe(g,.2,-.4,.22,.14,'rgba(255,214,170,.9)');eye(g,.14,-.4,.05,1);eye(g,.28,-.4,.05,1);g.restore();
  fe(g,-.04,-.6,.11,.06,'rgba(255,255,255,.75)',null,0,-.6);
  g.restore();
};
return A;})();
