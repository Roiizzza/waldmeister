/* Kurzanleitung: animierte Bildfolge + Steuerungsprobe. Einbinden: <script src="../guide.js" data-game="waldmeister"></script> */
(function(){
'use strict';
var scr=document.currentScript,GID=(scr&&scr.dataset.game)||'x',KEY='guide.'+GID+'.seen';
var fine=true;try{fine=matchMedia('(pointer:fine)').matches&&!('ontouchstart' in window&&matchMedia('(pointer:coarse)').matches)}catch(e){}

/* ---------- kleine Bildbausteine (viewBox 320 x 170) ---------- */
var g=function(x,y,s,r,inner,cls){return '<g transform="translate('+x+' '+y+') rotate('+(r||0)+') scale('+(s||1)+')"><g class="'+(cls||'')+'">'+inner+'</g></g>'};
var I={
 tree:function(x,y,s){return g(x,y,s,0,'<rect x="-4" y="-14" width="8" height="16" fill="#7a4e2a"/><path d="M-22 -10L0 -46L22 -10Z" fill="#2f7d46"/><path d="M-17 -30L0 -64L17 -30Z" fill="#3a9456"/>')},
 log:function(x,y,s,c){return g(x,y,s,0,'<rect x="-22" y="-7" width="44" height="14" rx="3" fill="'+(c||'#a8743c')+'"/><ellipse cx="22" cy="0" rx="4" ry="7" fill="#e3c08a"/><path d="M-12 -2H8" stroke="#0003" stroke-width="2"/>')},
 boards:function(x,y,s){return g(x,y,s,0,'<rect x="-24" y="-4" width="48" height="8" fill="#d9b277"/><rect x="-24" y="-13" width="48" height="8" fill="#e6c48e"/><rect x="-24" y="4" width="48" height="8" fill="#c9a064"/>')},
 axe:function(x,y,s,r,cls){return g(x,y,s,r,'<rect x="-2.5" y="-4" width="5" height="40" rx="2" fill="#8a5a30"/><path d="M-3-2L-24-9L-24 14L-3 9Z" fill="#c2c9d0"/>',cls)},
 pick:function(x,y,s,r,cls){return g(x,y,s,r,'<rect x="-2.5" y="-6" width="5" height="44" rx="2" fill="#8a5a30"/><path d="M-26 -2Q0-18 26-2L22 3Q0-8-22 3Z" fill="#aeb6be"/>',cls)},
 coin:function(x,y,s,t){return g(x,y,s,0,'<circle r="13" fill="#f2b13a" stroke="#b8760f" stroke-width="2"/><text y="5" text-anchor="middle" font-size="14" font-weight="800" fill="#7a4a06" font-family="sans-serif">'+(t||'€')+'</text>','bob')},
 arrow:function(x1,y,x2,c){c=c||'#fff';return '<path d="M'+x1+' '+y+'H'+(x2-8)+'" stroke="'+c+'" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7" class="flow"/><path d="M'+(x2-10)+' '+(y-6)+'L'+x2+' '+y+'L'+(x2-10)+' '+(y+6)+'Z" fill="'+c+'"/>'},
 hut:function(x,y,s,c){return g(x,y,s,0,'<rect x="-28" y="-30" width="56" height="30" fill="'+(c||'#c4a77a')+'"/><path d="M-34-30L0-52L34-30Z" fill="#8a3f2a"/><rect x="-6" y="-18" width="12" height="18" fill="#5a3a22"/><rect x="-24" y="-24" width="10" height="9" fill="#9fd0e8"/><rect x="14" y="-24" width="10" height="9" fill="#9fd0e8"/>')},
 mill:function(x,y,s){return g(x,y,s,0,'<rect x="-32" y="-30" width="64" height="30" fill="#7e8a96"/><rect x="-36" y="-36" width="72" height="7" fill="#3f5f7a"/><circle cx="0" cy="-12" r="11" fill="#d6dbe0" stroke="#566" stroke-width="2"/><path d="M-11-12H11M0-23V-1" stroke="#566" stroke-width="2" class="spin"/>')},
 table:function(x,y,s){return g(x,y,s,0,'<rect x="-22" y="-20" width="44" height="6" fill="#c98f52"/><rect x="-18" y="-14" width="5" height="14" fill="#8a5a30"/><rect x="13" y="-14" width="5" height="14" fill="#8a5a30"/>')},
 barrow:function(x,y,s){return g(x,y,s,0,'<path d="M-18-16H16L10-4H-12Z" fill="#3a6ea5"/><circle cx="-14" cy="0" r="6" fill="#222"/><path d="M12-8L30-18" stroke="#8a5a30" stroke-width="3"/><circle r="5" cx="0" cy="-20" fill="#8c9097"/>')},
 cart:function(x,y,s){return g(x,y,s,0,'<rect x="-24" y="-22" width="34" height="14" fill="#9a6a3a"/><circle cx="-14" cy="-4" r="7" fill="#3a2a1a"/><circle cx="2" cy="-4" r="7" fill="#3a2a1a"/><rect x="14" y="-26" width="16" height="12" rx="4" fill="#8a5a30"/><rect x="16" y="-14" width="3" height="14" fill="#6a4a2a"/><rect x="26" y="-14" width="3" height="14" fill="#6a4a2a"/><path d="M10-14H18" stroke="#6a4a2a" stroke-width="3"/>')},
 truck:function(x,y,s,c){return g(x,y,s,0,'<rect x="-34" y="-26" width="42" height="18" fill="'+(c||'#c8362b')+'"/><rect x="10" y="-22" width="22" height="14" rx="3" fill="#e8e8e8"/><rect x="22" y="-20" width="8" height="7" fill="#9fd0e8"/><circle cx="-20" cy="-6" r="7" fill="#222"/><circle cx="20" cy="-6" r="7" fill="#222"/>')},
 dumper:function(x,y,s){return g(x,y,s,0,'<path d="M-34-30L6-30L0-12H-34Z" fill="#e0a21b"/><rect x="6" y="-26" width="26" height="16" rx="3" fill="#f0b020"/><rect x="22" y="-24" width="8" height="8" fill="#9fd0e8"/><circle cx="-22" cy="-8" r="9" fill="#222"/><circle cx="18" cy="-8" r="9" fill="#222"/><circle r="4" cx="-22" cy="-8" fill="#aaa"/><circle r="4" cx="18" cy="-8" fill="#aaa"/><path d="M-30-30l5-6h8l4 6z" fill="#8c9097"/>')},
 worker:function(x,y,s,c){return g(x,y,s,0,'<rect x="-8" y="-26" width="16" height="22" rx="3" fill="'+(c||'#c8362b')+'"/><circle cy="-34" r="7" fill="#e0b090"/><path d="M-8-36a8 8 0 0 1 16 0Z" fill="#f0c020"/><rect x="-7" y="-4" width="5" height="12" fill="#2d3a4a"/><rect x="2" y="-4" width="5" height="12" fill="#2d3a4a"/>','bob')},
 pan:function(x,y,s,r,cls){return g(x,y,s,r,'<ellipse rx="26" ry="8" fill="#8f979e"/><ellipse rx="20" ry="5" cy="-1" fill="#3f454c"/><rect x="24" y="-2" width="26" height="4" rx="2" fill="#6a4a2a"/>',cls)},
 nugget:function(x,y,s){return g(x,y,s,0,'<path d="M-9 4L-6-6L3-9L10-2L7 6Z" fill="#ffc83d" stroke="#b8760f" stroke-width="1.5"/>','pop')},
 gravel:function(x,y,s){return g(x,y,s,0,'<path d="M-50 0Q-30-26 0-28Q30-26 50 0Z" fill="#9a9a96"/><circle cx="-18" cy="-10" r="4" fill="#7c7c78"/><circle cx="8" cy="-16" r="5" fill="#b4b4b0"/><circle cx="22" cy="-6" r="4" fill="#7c7c78"/><circle cx="-4" cy="-4" r="3" fill="#cfcfcb"/>')},
 bucket:function(x,y,s){return g(x,y,s,0,'<path d="M-14-24H14L10 0H-10Z" fill="#8c98a4"/><path d="M-14-24Q0-38 14-24" fill="none" stroke="#667" stroke-width="2"/>')},
 sluice:function(x,y,s){return g(x,y,s,0,'<path d="M-36-8L36-22V-10L-36 4Z" fill="#9a6a3a"/><path d="M-30-2L30-14" stroke="#5a3a1a" stroke-width="2" stroke-dasharray="3 5"/><rect x="-36" y="4" width="4" height="14" fill="#6a4a2a"/><rect x="30" y="-8" width="4" height="26" fill="#6a4a2a"/>')},
 loader:function(x,y,s){return g(x,y,s,0,'<rect x="-6" y="-28" width="30" height="18" rx="3" fill="#e0a21b"/><rect x="2" y="-24" width="10" height="9" fill="#9fd0e8"/><rect x="-26" y="-14" width="22" height="6" fill="#8c9097"/><path d="M-36-22H-24L-28-8H-36Z" fill="#666"/><circle cx="-4" cy="-6" r="9" fill="#222"/><circle cx="18" cy="-6" r="9" fill="#222"/>')},
 diver:function(x,y,s,r){return g(x,y,s,r||0,'<ellipse rx="16" ry="8" fill="#3b8fb8"/><circle cx="14" cy="-2" r="8" fill="#f0c020" stroke="#1d5f80" stroke-width="2"/><rect x="-14" y="-12" width="10" height="9" rx="3" fill="#9aa5ad"/><path d="M-16 2L-34 0L-34 8Z" fill="#1d5f80"/>','bob')},
 rock:function(x,y,s,c){return g(x,y,s,0,'<path d="M-16 0L-12-14L4-18L16-8L14 0Z" fill="'+(c||'#8c9097')+'"/><path d="M-12-14L4-18L0-8Z" fill="#fff3"/>')},
 block:function(x,y,s,c){return g(x,y,s,0,'<rect x="-18" y="-12" width="36" height="14" fill="'+c+'"/><path d="M-18-12L-12-18H24L18-12Z" fill="#fff4"/><path d="M18-12L24-18V-4L18 2Z" fill="#0003"/>')},
 column:function(x,y,s,c){return g(x,y,s,0,'<rect x="-8" y="-34" width="16" height="34" fill="'+c+'"/><rect x="-13" y="-38" width="26" height="6" fill="'+c+'"/><rect x="-13" y="-4" width="26" height="6" fill="'+c+'"/><path d="M-3-32V-2" stroke="#0002" stroke-width="2"/>')},
 dyn:function(x,y,s){return g(x,y,s,0,'<rect x="-10" y="-22" width="7" height="22" rx="2" fill="#c8362b"/><rect x="-2" y="-22" width="7" height="22" rx="2" fill="#d8453a"/><rect x="6" y="-22" width="7" height="22" rx="2" fill="#c8362b"/><path d="M0-22Q2-30 10-32" stroke="#e8d9a8" stroke-width="2" fill="none"/><circle cx="11" cy="-33" r="3" fill="#ffb02e" class="pop"/>')},
 gantry:function(x,y,s){return g(x,y,s,0,'<rect x="-30" y="-40" width="5" height="40" fill="#e0a21b"/><rect x="25" y="-40" width="5" height="40" fill="#e0a21b"/><rect x="-32" y="-44" width="64" height="6" fill="#e0a21b"/><rect x="-14" y="-38" width="28" height="9" fill="#1d2024"/><rect x="-34" y="-1" width="68" height="4" fill="#55595e"/>')},
 pack:function(x,y,s){return g(x,y,s,0,'<rect x="-14" y="-28" width="28" height="30" rx="7" fill="#c8862b"/><rect x="-10" y="-14" width="20" height="12" rx="3" fill="#a96f1f"/><path d="M-9-28Q0-38 9-28" stroke="#6a4a1a" stroke-width="3" fill="none"/>')},
 bench:function(x,y,s){return g(x,y,s,0,'<rect x="-30" y="-22" width="60" height="8" fill="#9a6a3a"/><rect x="-26" y="-14" width="6" height="16" fill="#6a4a2a"/><rect x="20" y="-14" width="6" height="16" fill="#6a4a2a"/><rect x="-10" y="-30" width="20" height="8" fill="#8c9097"/>')},
 sub:function(x,y,s){return g(x,y,s,0,'<ellipse rx="28" ry="12" fill="#f0c020"/><rect x="-5" y="-22" width="10" height="10" rx="2" fill="#d9a810"/><circle cx="10" cy="-1" r="5" fill="#9fd0e8" stroke="#8a6a10" stroke-width="2"/><path d="M-28 0L-38-8V8Z" fill="#d9a810"/>','bob')},
 crate:function(x,y,s,c){return g(x,y,s,0,'<rect x="-14" y="-22" width="28" height="22" rx="2" fill="'+(c||'#5fa8d3')+'"/><rect x="-14" y="-22" width="28" height="4" fill="#fff5"/><path d="M-14-11H14" stroke="#0003" stroke-width="2"/>')},
 ship:function(x,y,s,c){return g(x,y,s,0,'<path d="M-44-12H40L30 6H-36Z" fill="'+(c||'#2f5d7c')+'"/><rect x="-38" y="-34" width="22" height="22" fill="#eae4d4"/><rect x="-34" y="-30" width="14" height="6" fill="#2a3540"/><rect x="-30" y="-44" width="7" height="10" fill="#d9a020"/><rect x="-10" y="-22" width="12" height="10" fill="#c8362b"/><rect x="4" y="-22" width="12" height="10" fill="#5fa8d3"/>')},
 crane:function(x,y,s){return g(x,y,s,0,'<rect x="-5" y="-70" width="8" height="70" fill="#e0a21b"/><rect x="-50" y="-74" width="84" height="6" fill="#e0a21b"/><path d="M-40-68V-40" stroke="#222" stroke-width="2"/><rect x="-46" y="-40" width="12" height="9" fill="#c8362b"/>','bob2')},
 bub:function(x,y){return '<circle cx="'+x+'" cy="'+y+'" r="3" fill="none" stroke="#fff8" class="rise"/><circle cx="'+(x+8)+'" cy="'+(y+12)+'" r="2" fill="none" stroke="#fff8" class="rise2"/>'},
 em:function(x,y,t,s,cls){return '<g transform="translate('+x+' '+y+')"><g class="'+(cls||'bob')+'"><text text-anchor="middle" font-size="'+(s||26)+'">'+t+'</text></g></g>'}
};
function bg(k){
 var sky='<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8e4"/><stop offset="1" stop-color="#dcebf3"/></linearGradient><linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b8cb5"/><stop offset="1" stop-color="#0b3350"/></linearGradient></defs>';
 if(k==='sky')return sky+'<rect width="320" height="170" fill="url(#sk)"/><path d="M0 120Q60 90 120 118T240 112T320 120V170H0Z" fill="#a8bdb0"/><rect y="134" width="320" height="36" fill="#6f9a4e"/>';
 if(k==='yard')return sky+'<rect width="320" height="170" fill="url(#sk)"/><path d="M0 110Q70 70 130 108T250 100T320 112V170H0Z" fill="#8fa49a"/><rect y="134" width="320" height="36" fill="#8a8576"/>';
 if(k==='river')return sky+'<rect width="320" height="170" fill="url(#sk)"/><path d="M0 100Q80 70 150 98T320 92V170H0Z" fill="#7aa188"/><rect y="118" width="320" height="52" fill="#d9c48a"/><path d="M0 146Q40 132 80 146T160 146T240 146T320 146V170H0Z" fill="#4ab0d8" class="wave"/>';
 if(k==='water')return sky+'<rect width="320" height="170" fill="url(#wt)"/><path d="M0 14Q40 6 80 14T160 14T240 14T320 14" stroke="#fff6" stroke-width="2" fill="none" class="wave"/>';
 if(k==='harbor')return sky+'<rect width="320" height="170" fill="url(#sk)"/><path d="M0 96Q60 80 120 96T240 92T320 98V170H0Z" fill="#9db4c0"/><rect y="96" width="320" height="40" fill="#2e7ea3"/><path d="M0 108Q40 102 80 108T160 108T240 108T320 108" stroke="#fff5" stroke-width="2" fill="none" class="wave"/><rect y="134" width="320" height="36" fill="#9a9a94"/><rect y="134" width="320" height="4" fill="#e0a21b"/>';
 if(k==='mine')return '<rect width="320" height="170" fill="#232a30"/><rect y="132" width="320" height="38" fill="#3a3530"/>';
 return '<rect width="320" height="170" fill="#222"/>'}
var ART={
 /* Hafenmeister */
 h1:function(){return bg('harbor')+I.ship(150,118,1.7)+I.crate(130,92,1,'#5fa8d3')+I.crate(152,92,1,'#b98a52')+I.crate(174,92,1,'#8a3b2e')+'<path d="M44 134L98 120" stroke="#8a5a30" stroke-width="5"/>'+I.worker(34,150,1.1,'#2b8aa3')},
 h2:function(){return bg('harbor')+I.crate(60,150,1.2,'#5fa8d3')+I.arrow(90,128,128)+'<ellipse cx="170" cy="150" rx="46" ry="10" fill="#ffc93d" opacity=".4"/>'+I.crate(170,150,1.1,'#b98a52')+I.arrow(214,128,246)+I.hut(280,148,1.1)},
 h3:function(){return bg('harbor')+I.hut(60,148,1.2)+I.arrow(100,122,140)+I.coin(170,112,1.2)+I.coin(200,128,.8)+I.crate(262,148,1.1,'#8a3b2e')+'<text x="170" y="84" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="sans-serif">▲ 7 € ▼</text>'},
 h4:function(){return bg('harbor')+I.crane(70,148,1.1)+I.arrow(104,128,134)+I.worker(160,148,1.2,'#2b8aa3')+I.arrow(184,128,208)+I.ship(260,126,.8,'#2e3b46')+I.coin(160,74,.8)},
 /* Waldmeister */
 w1:function(){return bg('sky')+I.tree(210,142,1.7)+I.axe(140,104,1.2,-20,'swing')+I.log(80,150,1)+I.log(100,146,.9)},
 w2:function(){return bg('sky')+I.log(40,146,1)+I.log(62,146,1)+I.log(51,134,1)+I.arrow(88,120,150)+I.hut(190,146,1.25)+I.arrow(228,120,262)+I.coin(285,112,1.1)},
 w3:function(){return bg('sky')+I.log(34,140,.8)+I.arrow(58,118,84)+I.mill(120,146,1)+I.arrow(160,118,184)+I.boards(208,146,.9)+I.arrow(236,118,254)+I.table(280,146,.9)+I.coin(280,84,.8)+I.coin(208,100,.65)},
 w4:function(){return bg('sky')+I.barrow(44,148,1.2)+I.arrow(80,128,100)+I.cart(130,150,1.2)+I.arrow(172,128,192)+I.truck(230,150,1.2)+I.worker(286,148,1.2)+I.axe(50,60,.8,-25,'swing')+I.arrow(78,58,100)+I.axe(130,60,1.1,-25,'swing')},
 /* Goldwäscher */
 g1:function(){return bg('river')+I.gravel(100,128,1.3)+I.pan(168,110,1.2,-10,'swingS')+I.bucket(260,140,1)},
 g2:function(){return bg('river')+I.pan(160,118,1.5,0,'dip')+'<g class="spark"><circle cx="140" cy="100" r="3" fill="#fff"/><circle cx="188" cy="96" r="2.5" fill="#fff"/><circle cx="168" cy="86" r="2" fill="#fff"/></g>'+I.nugget(168,112,1.4)},
 g3:function(){return bg('river')+I.nugget(46,130,1.8)+I.arrow(80,116,130)+I.hut(176,146,1.2)+I.arrow(212,116,250)+I.coin(278,108,1.1)},
 g4:function(){return bg('river')+I.pan(40,126,.9,0)+I.arrow(72,114,92)+I.bucket(118,146,1.1)+I.arrow(144,114,164)+I.sluice(200,146,1.1)+I.arrow(240,114,258)+I.loader(290,150,.95)},
 /* Tiefenrausch */
 t1:function(){var r='';for(var i=0;i<5;i++)r+='<path d="M20 '+(24+i*30)+'H40" stroke="#fff9" stroke-width="2"/><text x="46" y="'+(28+i*30)+'" font-size="11" fill="#fffc" font-family="sans-serif">'+(i*10)+' m</text>';return bg('water')+r+'<path d="M20 20V160" stroke="#fff9" stroke-width="2"/>'+I.diver(180,70,1.6,70)+I.bub(214,50)+'<path d="M258 60V120" stroke="#fff" stroke-width="3" stroke-dasharray="2 7" class="flow"/><path d="M251 114L258 128L265 114Z" fill="#fff"/>'},
 t2:function(){return bg('water')+I.diver(160,92,1.5,0)+I.em(70,60,'🐚',28)+I.em(246,52,'💎',28,'bob2')+I.em(90,132,'⚓',26,'bob2')+I.em(252,128,'🐠',28)+I.em(160,40,'🪙',24,'bob2')+I.bub(190,70)},
 t3:function(){return bg('water')+'<rect y="0" width="320" height="52" fill="#9cc8e4"/><path d="M0 52Q40 44 80 52T160 52T240 52T320 52V60H0Z" fill="#2b8cb5"/>'+I.hut(236,52,1.1)+I.em(52,120,'🧺',34)+'<text x="52" y="152" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="sans-serif">8 / 8</text><path d="M84 112H130V70" stroke="#fff" stroke-width="3" stroke-dasharray="2 7" fill="none" class="flow"/><path d="M122 76L130 62L138 76Z" fill="#fff"/>'+I.coin(168,34,1.1)+I.arrow(184,34,206,'#fff')},
 t4:function(){return bg('water')+I.em(54,92,'🤿',34)+I.arrow(84,86,108)+I.sub(150,96,1.1)+I.arrow(194,86,216)+I.em(250,82,'🦪',30)+I.em(60,142,'📖',24,'bob2')+I.coin(160,142,.8)+I.coin(250,142,.8)},
 /* Minenschicht */
 m1:function(){var r='';for(var i=0;i<7;i++){var y=170-i*i*1.3-6,w=130-i*14;r+='<path d="M'+(160-w)+' '+y+'H'+(160+w)+'" stroke="#6b4a2a" stroke-width="3"/>'}return '<rect width="320" height="170" fill="#232a30"/><path d="M96 170L142 62M224 170L178 62" stroke="#9aa1a8" stroke-width="4"/>'+r+'<rect x="120" y="44" width="80" height="62" fill="#0b0e11"/><rect x="112" y="38" width="96" height="8" fill="#6b4a2a"/><rect x="112" y="38" width="8" height="70" fill="#6b4a2a"/><rect x="200" y="38" width="8" height="70" fill="#6b4a2a"/>'+I.pick(262,110,1.2,-25,'swing')+'<text x="160" y="28" text-anchor="middle" font-size="13" font-weight="800" fill="#ffb02e" font-family="sans-serif">STOLLEN 01</text>'},
 m2:function(){return bg('mine')+'<rect x="150" y="20" width="170" height="112" fill="#6a5a4a"/><circle cx="196" cy="60" r="7" fill="#ff9a2e"/><circle cx="238" cy="92" r="6" fill="#ff9a2e"/><circle cx="276" cy="50" r="8" fill="#ff9a2e"/><circle cx="214" cy="106" r="5" fill="#222"/>'+I.pick(112,112,1.5,-30,'swing')+I.rock(170,142,.8,'#ff9a2e')+I.arrow(190,126,220)+I.pack(262,160,1.1)},
 m3:function(){return bg('mine')+I.pack(54,150,1.4)+I.arrow(86,124,132)+I.bench(184,150,1.3)+I.arrow(228,124,258)+I.coin(284,116,1.1)+'<path d="M160 62V46M152 54L160 46L168 54" stroke="#ffb02e" stroke-width="3" fill="none"/>'},
 /* Steinbruch */
 s1:function(){var c=['#6f7d43','#dcd2b4','#c47f4f','#8c9097','#e9edf2'],y=40,r='';for(var i=0;i<5;i++){r+='<rect x="30" y="'+y+'" width="190" height="'+(i===0?16:24)+'" fill="'+c[i]+'"/>';y+=(i===0?16:24)}
  return bg('yard')+r+'<rect x="30" y="40" width="190" height="104" fill="none" stroke="#0004"/>'+I.pick(110,40,1.2,-25,'swing')+I.coin(250,56,.55)+I.coin(250,80,.7)+I.coin(250,106,.85)+I.coin(250,128,1)+'<path d="M232 50V138" stroke="#fff8" stroke-width="2"/>'},
 s2:function(){return bg('yard')+I.rock(36,146,1.1,'#dcd2b4')+I.rock(62,150,1,'#c47f4f')+I.arrow(86,122,126)+I.gantry(160,146,1)+I.arrow(196,122,226)+I.hut(266,148,1)+I.coin(266,64,.9)},
 s3:function(){var h=[6,5,4,3,2,1,1],r='';for(var i=0;i<7;i++){r+='<rect x="'+(24+i*30)+'" y="'+(140-h[i]*16)+'" width="30" height="'+(h[i]*16)+'" fill="'+(i%2?'#8fa04a':'#6f7d43')+'" stroke="#0003"/>'}
  return bg('yard')+r+I.pick(64,48,1,-25,'swing')+'<path d="M232 120H300V140H232Z" fill="#0b0e11"/><path d="M236 124L296 136M296 124L236 136" stroke="#ff5a3c" stroke-width="3"/><text x="266" y="112" text-anchor="middle" font-size="11" font-weight="800" fill="#ff5a3c" font-family="sans-serif">zu tief</text>'},
 s4:function(){return bg('yard')+I.rock(34,146,1,'#8c9097')+I.arrow(60,120,86)+I.block(116,146,1,'#8c9097')+I.arrow(144,120,166)+I.column(192,148,1,'#e9edf2')+I.coin(30,100,.6)+I.coin(116,92,.85)+I.coin(192,76,1.1)+I.dyn(246,148,1)+I.dumper(294,150,.8)}
};
/* ---------- Inhalte ---------- */
var CTRL={
 waldmeister:{keys:[['KeyE','E','Händler, Fahrzeuge'],['Space','Space','Fällen, Sägen (halten)'],['ShiftLeft','Shift','Rennen']],mouse:'Fällen halten',touch:'Links laufen · rechts wischen · „Aktion“ halten'},
 goldwaescher:{keys:[['KeyE','E','Händler, Geräte'],['Space','Space','Schaufeln, Waschen (halten)'],['ShiftLeft','Shift','Rennen']],mouse:'Schaufeln halten',touch:'Links laufen · rechts wischen · „Aktion“ halten'},
 minenschicht:{keys:[['KeyF','F','Abbauen (halten)'],['KeyG','G','Werkbank'],['Space','Space','Springen'],['ShiftLeft','Shift','Sprinten'],['KeyE','E','Inventar']],mouse:'Rechtsklick: Werkbank',touch:'Stick links · wischen zum Umsehen · A abbauen · B nutzen'},
 hafenmeister:{keys:[['KeyF','F','Kiste aufnehmen (halten)'],['KeyE','E','Kontor, aufnehmen'],['ShiftLeft','Shift','Rennen']],mouse:'Aufnehmen halten',touch:'Links laufen · rechts wischen · „Aufnehmen“ halten'},
 steinbruch:{keys:[['KeyF','F','Abbauen (halten)'],['Space','Space','Springen'],['KeyE','E','Händler, Dumper'],['ShiftLeft','Shift','Rennen']],mouse:'Abbauen halten',touch:'Links laufen · rechts wischen · „Aktion“ halten'}
};
var GAMES={
 waldmeister:{name:'Waldmeister',acc:'#f2b13a',slides:[['w1','Bäume fällen','Axt auf den Baum richten, Aktion halten. Der Stamm fällt und wird zu Rundholz.'],['w2','Holz verkaufen','Rundholz aufheben, zum Lager tragen und beim Händler zu Geld machen.'],['w3','Mehr daraus machen','Sägewerk macht Bretter, die Schreinerei Möbel. Beides bringt viel mehr als Holz.'],['w4','Ausbauen','Bessere Axt und Säge, Schubkarre, Pferd, Traktor, LKW und Helfer: alles im Shop.'],['ctl','Steuerung','Probier es gleich aus.']]},
 goldwaescher:{name:'Goldwäscher',acc:'#ffc83d',slides:[['g1','Kies schaufeln','Suche die grauen Kiesbänke am Ufer und fülle deine Pfanne.'],['g2','Im Fluss waschen','Pfanne ins Wasser halten und waschen. Der Kies spült weg, das Gold bleibt.'],['g3','Gold verkaufen','Beim Händler gibt es Geld. Der Goldkurs schwankt.'],['g4','Ausrüsten','Eimer, Waschrinne und Radlader holen immer mehr Gold aus dem Fluss.'],['ctl','Steuerung','Probier es gleich aus.']]},
 tiefenrausch:{name:'Tiefenrausch',acc:'#5fe0c0',slides:[['t1','Abtauchen','Starte einen Tauchgang. Je tiefer du kommst, desto seltener und wertvoller sind die Funde.'],['t2','Funde sammeln','Muscheln, Schätze und Wracks landen im Netz. Es hat nur begrenzt Platz.'],['t3','Auftauchen und verkaufen','Ist das Netz voll, geht es an die Oberfläche zum Händler. Wer viel desselben verkauft, drückt den Preis.'],['t4','Besser werden','Neue Ausrüstung, ein U-Boot, das Album und Leviathan-Perlen bringen dich tiefer und machen mehr Gewinn.']]},
 minenschicht:{name:'Minenschicht',acc:'#ffb02e',slides:[['m1','Folge den Schienen','Im Stollen wartet das Gestein. Immer den Schienen nach.'],['m2','Abbauen','Auf das Gestein zielen und abbauen. Brocken füllen den Rucksack, er hat nur acht Plätze.'],['m3','Werkbank','Zurück an der Basis: Brocken verkaufen und vom Geld besseres Werkzeug kaufen.'],['ctl','Steuerung','Probier es gleich aus.']]},
 hafenmeister:{name:'Hafenmeister',acc:'#4fc3d9',slides:[['h1','Schiffe entladen','Ein Schiff legt an. Über die Gangway aufs Deck, Kiste anschauen und halten zum Aufnehmen.'],['h2','Ins Lager bringen','Trag die Kisten in die gelbe Zone vor dem Lager. Dort laden sie sich von allein ab.'],['h3','Im Kontor verkaufen','Mit E im Kontor zum Tagespreis verkaufen. Frachtbriefe und pünktliches Entladen bringen Bonus.'],['h4','Ausbauen','Handkarre, Kran, Hafenarbeiter, mehr Liegeplätze und größere Schiffe: alles im Kontor.'],['ctl','Steuerung','Probier es gleich aus.']]},
 steinbruch:{name:'Steinbruch-Baron',acc:'#ffa530',slides:[['s1','Den Berg abtragen','Hacke auf den Fels, Aktion halten: die oberste Schicht geht ab. Je tiefer, desto wertvoller.'],['s2','Brocken verkaufen','Brocken laufen in deine Hände. Zur Rampe tragen, beim Händler verkaufen.'],['s3','Terrassen statt Löcher','Eine Säule geht nur ab, wenn kein Nachbar mehr als eine Schicht tiefer liegt. So entstehen Stufen.'],['s4','Veredeln und ausbauen','Steinmetz macht Quader, die Werkstatt Bauteile. Dynamit und Dumper beschleunigen alles.'],['ctl','Steuerung','Probier es gleich aus.']]}
};
var G=GAMES[GID];if(!G)return;
var POS={tiefenrausch:'top:12px;right:132px',minenschicht:'top:10px;left:50%;margin-left:-15px'};
var pos=POS[GID]||'top:10px;left:50%;margin-left:-15px';

/* ---------- Oberfläche (Shadow DOM) ---------- */
var host=document.createElement('div');host.style.cssText='position:fixed;z-index:2147483000;left:0;top:0;width:0;height:0';document.body.appendChild(host);
var sh=host.attachShadow({mode:'open'});
sh.innerHTML='<style>'+
'*{box-sizing:border-box}'+
'.q{position:fixed;'+pos+';width:30px;height:30px;border-radius:50%;border:1px solid #fff5;background:#000a;color:#fff;font:800 15px system-ui,sans-serif;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}'+
'.ov{position:fixed;left:0;top:0;width:100vw;height:100vh;height:100dvh;display:none;align-items:center;justify-content:center;background:rgba(5,8,10,.78);padding:10px;font-family:"Alegreya Sans","Figtree",system-ui,sans-serif;color:#f4efe2}'+
'.ov.on{display:flex}'+
'.c{width:min(560px,100%);max-height:100%;overflow:auto;background:#181b1e;border:1px solid '+G.acc+'55;border-radius:18px;box-shadow:0 20px 60px #000a;display:flex;flex-direction:column}'+
'.art{width:100%;aspect-ratio:320/170;max-height:46vh;background:#000;border-radius:17px 17px 0 0;overflow:hidden;display:block}'+
'.art svg{width:100%;height:100%;display:block}'+
'.b{padding:12px 16px 14px;display:flex;flex-direction:column;gap:6px}'+
'.k{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:'+G.acc+';font-weight:700}'+
'h2{margin:0;font:400 26px/1.1 Bevan,Rye,"Bricolage Grotesque",Georgia,serif;color:#fff}'+
'p{margin:0;font-size:17px;line-height:1.35;color:#cfc8b8}'+
'.f{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 16px 14px}'+
'.dots{display:flex;gap:6px}.dots i{width:8px;height:8px;border-radius:50%;background:#fff3}.dots i.on{background:'+G.acc+'}'+
'button.n,button.p,button.s{font:inherit;font-weight:800;border-radius:12px;padding:9px 16px;cursor:pointer;border:0}'+
'button.n{background:'+G.acc+';color:#1d1405}button.p,button.s{background:#ffffff14;color:#f4efe2;border:1px solid #fff3}'+
'.keys{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:center;background:#10161a;padding:14px 10px;min-height:170px;touch-action:none}'+
'.kc{display:flex;align-items:center;gap:8px;font-size:15px;color:#cfc8b8}'+
'.cap{min-width:38px;height:38px;padding:0 8px;border-radius:9px;border:2px solid #fff4;border-bottom-width:4px;background:#222a30;color:#fff;font:800 16px system-ui,sans-serif;display:flex;align-items:center;justify-content:center;transition:.08s}'+
'.cap.on{background:'+G.acc+';color:#1d1405;border-color:'+G.acc+';transform:translateY(2px)}'+
'.wasd{display:grid;grid-template-columns:repeat(3,40px);gap:4px;justify-items:center}.wasd .cap{width:38px;padding:0}'+
'.joy{width:110px;height:110px;border-radius:50%;border:2px solid #fff5;position:relative;touch-action:none}.joy i{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#ffffffa0}'+
'.ab{width:84px;height:84px;border-radius:50%;border:2px solid #fff6;background:#ffffff14;color:#fff;font:800 15px system-ui,sans-serif;touch-action:none}.ab.on{background:'+G.acc+';color:#1d1405}'+
'.ok{color:'+G.acc+';font-weight:800;font-size:15px;width:100%;text-align:center;min-height:20px}'+
'.bob{animation:bob 1.6s ease-in-out infinite}.bob2{animation:bob 2.1s ease-in-out infinite reverse}@keyframes bob{50%{transform:translateY(-6px)}}'+
'.swing{transform-box:fill-box;transform-origin:50% 100%;animation:sw 1.1s ease-in-out infinite}@keyframes sw{0%,100%{transform:rotate(-24deg)}50%{transform:rotate(26deg)}}'+
'.swingS{transform-box:fill-box;transform-origin:50% 50%;animation:sw2 1.8s ease-in-out infinite}@keyframes sw2{50%{transform:rotate(14deg) translateY(6px)}}'+
'.dip{transform-box:fill-box;transform-origin:50% 50%;animation:dip 2s ease-in-out infinite}@keyframes dip{0%,100%{transform:translateY(-6px) rotate(-6deg)}50%{transform:translateY(8px) rotate(6deg)}}'+
'.flow{animation:fl 1s linear infinite}@keyframes fl{to{stroke-dashoffset:-16}}'+
'.spin{transform-box:fill-box;transform-origin:50% 50%;animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}'+
'.pop{transform-box:fill-box;transform-origin:50% 50%;animation:po 1.6s ease-in-out infinite}@keyframes po{50%{transform:scale(1.25)}}'+
'.spark{animation:sk 1.4s ease-in-out infinite}@keyframes sk{50%{opacity:.2}}'+
'.wave{animation:wv 3s ease-in-out infinite alternate}@keyframes wv{to{transform:translateX(-14px)}}'+
'.rise{animation:ri 2.4s linear infinite}.rise2{animation:ri 3s linear infinite .8s}@keyframes ri{from{transform:translateY(0);opacity:1}to{transform:translateY(-34px);opacity:0}}'+
'@media (max-height:520px){.art{max-height:36vh}h2{font-size:21px}p{font-size:15px}.b{padding:8px 14px}.f{padding:0 14px 10px}.keys{min-height:120px;padding:8px}}'+
'@media (prefers-reduced-motion:reduce){*{animation:none!important}}'+
'</style><button class="q" type="button" aria-label="Kurzanleitung">?</button><div class="ov" role="dialog" aria-label="Kurzanleitung"><div class="c"><div class="art"></div><div class="b"><div class="k"></div><h2></h2><p></p></div><div class="f"><button class="s" type="button">Zurück</button><div class="dots"></div><button class="n" type="button">Weiter</button></div></div></div>';
var $=function(s){return sh.querySelector(s)},ov=$('.ov'),art=$('.art'),idx=0,S=G.slides;
var dots=$('.dots');S.forEach(function(){dots.appendChild(document.createElement('i'))});
function keysHtml(){var C=CTRL[GID];if(!C)return '';
 if(!fine)return '<div class="keys"><div class="joy" id="jy"><i></i></div><button class="ab" id="ab" type="button">Aktion</button><div class="ok" id="ok">'+C.touch+'. Zieh den Stick und tipp den Knopf.</div></div>';
 var h='<div class="keys"><div class="wasd"><span></span><span class="cap" data-c="KeyW">W</span><span></span><span class="cap" data-c="KeyA">A</span><span class="cap" data-c="KeyS">S</span><span class="cap" data-c="KeyD">D</span></div><div style="display:flex;flex-direction:column;gap:8px">';
 C.keys.forEach(function(k){h+='<div class="kc"><span class="cap" data-c="'+k[0]+'">'+k[1]+'</span>'+k[2]+'</div>'});
 return h+'<div class="kc"><span class="cap" data-c="Mouse">Maus</span>'+C.mouse+' · Maus bewegt die Sicht</div></div><div class="ok" id="ok">Drück die Tasten. Sie leuchten, wenn sie ankommen.</div></div>'}
function show(i){idx=Math.max(0,Math.min(S.length-1,i));var s=S[idx];
 if(s[0]==='ctl'){art.innerHTML=keysHtml();art.style.aspectRatio='auto';art.style.maxHeight='none';art.style.background='#10161a';bindCtl()}
 else{art.style.aspectRatio='';art.style.maxHeight='';art.style.background='#000';art.innerHTML='<svg viewBox="0 0 320 170" preserveAspectRatio="xMidYMid slice">'+ART[s[0]]()+'</svg>'}
 $('.k').textContent=G.name+' · '+(idx+1)+' von '+S.length;$('h2').textContent=s[1];$('p').textContent=s[2];
 [].forEach.call(dots.children,function(d,j){d.className=j===idx?'on':''});
 $('.s').style.visibility=idx?'visible':'hidden';$('.n').textContent=idx===S.length-1?'Los geht’s':'Weiter'}
function bindCtl(){
 if(!fine){var J=art.querySelector('#jy'),K=J.firstChild,A=art.querySelector('#ab'),ok=art.querySelector('#ok'),pid=-1;
  var mv=function(e){var r=J.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),l=Math.hypot(dx,dy),m=40;if(l>m){dx*=m/l;dy*=m/l}K.style.transform='translate('+dx+'px,'+dy+'px)'};
  J.addEventListener('pointerdown',function(e){e.preventDefault();pid=e.pointerId;J.setPointerCapture(pid);mv(e)});J.addEventListener('pointermove',function(e){if(e.pointerId===pid)mv(e)});
  var up=function(){pid=-1;K.style.transform='';};J.addEventListener('pointerup',up);J.addEventListener('pointercancel',up);
  A.addEventListener('pointerdown',function(e){e.preventDefault();A.classList.add('on');ok.textContent='Gut! So hältst du „Aktion“ gedrückt.'});A.addEventListener('pointerup',function(){A.classList.remove('on')});A.addEventListener('pointercancel',function(){A.classList.remove('on')});return}
 art.addEventListener('mousedown',function(e){if(e.target.closest('button'))return;lite('Mouse')});}
var litT={};function lite(c){var el=art.querySelector('[data-c="'+c+'"]');if(!el)return;el.classList.add('on');clearTimeout(litT[c]);litT[c]=setTimeout(function(){el.classList.remove('on')},220);var ok=art.querySelector('#ok');if(ok)ok.textContent='Angekommen: '+(el.textContent)}
function open(i){ov.classList.add('on');show(i||0)}
function close(){ov.classList.remove('on');try{localStorage.setItem(KEY,'1')}catch(e){}}
$('.n').addEventListener('click',next);
$('.s').addEventListener('click',function(){show(idx-1)});
$('.q').addEventListener('click',function(e){e.stopPropagation();open(0)});
ov.addEventListener('pointerdown',function(e){e.stopPropagation()});ov.addEventListener('click',function(e){if(e.target===ov)close()});
function next(){if(idx>=S.length-1)close();else show(idx+1)}
addEventListener('keydown',function(e){if(!ov.classList.contains('on'))return;e.stopImmediatePropagation();e.preventDefault();
 if(e.code==='Escape'){close();return}
 if(S[idx][0]==='ctl'&&fine){lite(e.code);if(e.code==='Enter')next();return}
 if(e.code==='ArrowRight'||e.code==='Enter')next();else if(e.code==='ArrowLeft')show(idx-1)},true);
addEventListener('keyup',function(e){if(ov.classList.contains('on')){e.stopImmediatePropagation()}},true);
var seen=false;try{seen=localStorage.getItem(KEY)==='1'}catch(e){}
if(!seen)setTimeout(function(){open(0)},500);
window.__guide={open:open,close:close}; window.__guideOpen=function(){return ov.classList.contains("on")};
})();
