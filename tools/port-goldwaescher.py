#!/usr/bin/env python3
"""Erzeugt goldwaescher/index.html aus wuestensauger/index.html (Hauptspiel) mit Gold-Thema.
Aufruf: python3 tools/port-goldwaescher.py   (aus dem Repo-Root)
Alles Thematische steht hier; Mechaniken kommen unverändert aus dem Wüstensauger."""
import re,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=open(f'{ROOT}/wuestensauger/index.html',encoding='utf-8').read()
s=src
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n: print('WARN',c,'x',a[:70]);
    s=s.replace(a,b)
# ---- Texte ----
PAIRS=[('Wüstensauger','Goldwäscher'),('WÜSTENSAUGER','GOLDWÄSCHER'),
('Handstaubsauger','Hand-Saugbagger'),('Wüstenzyklon','Flusszyklon'),('Wüstenstiefel','Watstiefel'),('Sandschuhe','Gummistiefel'),
('Wüsten-Motorrad','Gelände-Motorrad'),('Wüstenwalze','Kieswalze'),('Dünenraupe','Baggerraupe'),('Kehrmaschine','Kiesschlitten'),
('Reinigungswagen','Waschwagen'),('Mega-Saugwagen','Mega-Saugbagger'),('Saugroboter','Schürfroboter'),('Saugdrohne','Kiesdrohne'),
('Sandwäscherei','Goldwäscherei'),('Glashütte','Schmelzhütte'),
('Dünensand','Flusskies'),('Roter Sand','Brauner Kies'),('Quarzsand','Quarzkies'),('Vulkansand','Schwarzkies'),('Goldsand','Goldkies'),
('Wertsand','Goldkies'),('Tiefsand','Tiefenkies'),('Sandgold','Kiesgold'),('Rohsand','Rohkies'),('Sandhandel','Goldhandel'),
('Sandmeer','Kiesmeer'),('Sandstürme','Hochwasser'),('Sandhaufen','Kieshaufen'),('Sandsäcke','Kiessäcke'),
("['Nordwest-Dünen','Nordfeld','Knochental','Wrackebene','Heimatbecken','Oasenland','Rote Senke','Ruinenfeld','Goldküste']","['Nordwest-Bänke','Nordfeld','Nuggettal','Schwemmebene','Heimatbecken','Quellland','Rote Senke','Stollenfeld','Goldküste']"),
('Dünen','Kiesbänke'),('Düne','Kiesbank'),('Pyramideneingang','Mineneingang'),('Pyramide','Goldmine'),('Oase','Quelle'),('Wüsten','Auen'),('Wüste','Aue')]
for a,b in PAIRS: s=s.replace(a,b)
s=re.sub(r'(?<![a-z])Sand',"Kies",s)
s=re.sub(r'\bGlas\b','Goldbarren',s)
s=s.replace("wuestensauger3","goldwaescher2").replace("wuestensauger","goldwaescher")
# ---- Optik ----
rep("const SKY=0xecdcb8;","const SKY=0xcfe1e8;")
rep("rgba(255,246,220,","rgba(235,246,252,")
rep("rip=Math.sin((yy+Math.sin(xx/256*TAU*2)*7)/256*TAU*14)*10","rip=0")
rep("gr=(r()-.5)*34,v=clamp(232+rip+gr,150,255)","gr=(r()-.5)*90,v=clamp(205+rip+gr,90,255)")
rep("const CLAY=[.62,.46,.33];","const CLAY=[.30,.38,.2];")
rep("rgba(60,38,22,.75)","rgba(30,40,18,.32)")
rep("TC=[0xdcbf86,0xb4573a,0xeee6d0,0x3b3b46,0xf5c542]","TC=[0x9a917f,0x84694a,0xb3a98f,0x4a4c50,0xe6bf3a]")
# Fluss
rep("const FLATS=","const WL=-1.15,riverX=z=>-210+38*Math.sin(z/95)+14*Math.sin(z/37+1);\nconst FLATS=")
rep("Math.abs(z)))/14,0,1)*fl;\n","Math.abs(z)))/14,0,1)*fl;\n    {const rd=Math.abs(x-riverX(z));BH[k]-=3.6*Math.exp(-rd*rd/80)*clamp(1-fl*.5,0,1)}\n")
rep("cap*=clamp((d-52)/10,0,1)*","cap*=clamp((Math.abs(x-riverX(z))-5)/8,0,1)*clamp((d-52)/10,0,1)*")
rep("buildPyramid();buildInterior();","buildRiver();buildPyramid();buildInterior();")
rep("function enterPyr(){","""function buildRiver(){const pos=[],uv=[],idx=[],n=Math.round(2*HALF/14);
  for(let i=0;i<=n;i++){const z=-HALF+i*14,c=riverX(z);pos.push(c-11,WL,z,c+11,WL,z);uv.push(0,z/9,1.6,z/9);if(i<n){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const wt=cvTex(128,256,(x,w,h)=>{x.fillStyle='#3d93ae';x.fillRect(0,0,w,h);for(let i=0;i<70;i++){x.strokeStyle='rgba(255,255,255,'+(.05+Math.random()*.16)+')';x.lineWidth=1+Math.random()*2;const px=Math.random()*w,py=Math.random()*h;x.beginPath();x.moveTo(px,py);x.lineTo(px+(Math.random()-.5)*5,py+14+Math.random()*40);x.stroke()}},true);
  const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({map:wt,color:0xbfe4f0,transparent:true,opacity:.8,shininess:90,specular:0xffffff}));m.frustumCulled=false;scene.add(m);RIVW=wt}
let RIVW=null;
function enterPyr(){""")
rep("beltTex.offset.y-=dt*.9;","beltTex.offset.y-=dt*.9;if(RIVW)RIVW.offset.y-=dt*.05;")
open(f'{ROOT}/goldwaescher/index.html','w',encoding='utf-8').write(s)
print('ok',len(s))
