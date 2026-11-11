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
# ---- Funde und Relikte im Gold-Thema (vor der Wortersetzung) ----
rep("['Alte Münze',40,0],['Tonscherbe',60,0],['Wüstenrose',90,1],['Versteinertes Holz',110,1],['Skarabäus',120,0],['Fulgurit',150,2],['Ammonit',180,1],['Eisennugget',220,2],['Bernstein',260,1],['Pharaonen-Amulett',320,0],['Meteoritenstück',500,2],['Sternsaphir',700,2]",
"['Alte Münze',40,0],['Rostige Spitzhacke',60,0],['Bergkristall',90,1],['Versteinertes Holz',110,1],['Alte Goldpfanne',120,0],['Katzengold',150,2],['Ammonit',180,1],['Eisennugget',220,2],['Bernstein',260,1],['Goldgräber-Amulett',320,0],['Meteoritenstück',500,2],['Saphir',700,2]")
rep("['Goldener Skarabäus',6000],['Alabaster-Kanope',7500],['Bronze-Sphinx',9000],['Lapislazuli-Tafel',11000],['Silberstab des Pharaos',13500],['Maske der Wüstenkönigin',16000],['Obsidian-Spiegel',19000],['Herz des Berges',22500],['Gläserner Falke',26000],['Sonnenscheibe',30000],['Karawanen-Kompass',35000],['Wüstenkrone',41000],['Smaragd-Zepter',48000],['Sternenkarte aus Gold',56000],['Thron-Fragment',65000],['Anubis-Statue',76000],['Tränen der Isis',90000],['Horusauge',105000],['Sandmeer-Siegel',125000],['Sonnenbarke des Pharaos',250000]",
"['Goldene Pfanne',6000],['Alte Waschrinne',7500],['Bronze-Bergmann',9000],['Lapislazuli-Tafel',11000],['Silberne Spitzhacke',13500],['Maske der Minenkönigin',16000],['Obsidian-Spiegel',19000],['Herz des Berges',22500],['Gläserner Falke',26000],['Sonnenscheibe',30000],['Prospektor-Kompass',35000],['Goldgräberkrone',41000],['Smaragd-Zepter',48000],['Karte der Goldader',56000],['Thron-Fragment',65000],['Eisernes Schürfrad',76000],['Tränen der Flussgöttin',90000],['Adlerauge',105000],['Kiesmeer-Siegel',125000],['Goldbarke des Königs',250000]")
# ---- Texte ----
PAIRS=[('Staubbeutel','Kiesbeutel'),('Wüstensauger','Goldwäscher'),('WÜSTENSAUGER','GOLDWÄSCHER'),
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
def theme(x):
    for a,b in PAIRS: x=x.replace(a,b)
    x=re.sub(r'(?<![a-z])Sand',"Kies",x)
    return re.sub(r'\bGlas\b','Goldbarren',x)
s=theme(s)
s=s.replace("wuestensauger3","goldwaescher2").replace("wuestensauger","goldwaescher")
# ---- Optik ----
rep("const SKY=0xecdcb8;","const SKY=0xcfe1e8;")
rep("rgba(255,246,220,","rgba(235,246,252,")
rep("rip=Math.sin((yy+Math.sin(xx/256*TAU*2)*7)/256*TAU*14)*10","rip=0")
rep("gr=(r()-.5)*34,v=clamp(232+rip+gr,150,255)","gr=(r()-.5)*90,v=clamp(205+rip+gr,90,255)")
rep("const CLAY=[.62,.46,.33];","const CLAY=[.30,.38,.2];")
rep("rgba(60,38,22,.75)","rgba(30,40,18,.32)")
rep("TC=[0xdcbf86,0xb4573a,0xeee6d0,0x3b3b46,0xf5c542]","TC=[0x9a917f,0x84694a,0xb3a98f,0x4a4c50,0xe6bf3a]")
# Goldmine statt Pyramide
rep("i%2?0xc9a46a:0xbf9a5e","i%2?0x6f6a62:0x7b756b")
s=s.replace("0xb99a62","0x5a4a38").replace("'GRABKAMMER'","'GOLDMINE'")
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
s=s.replace("load('gfx/","load('../wuestensauger/gfx/").replace("fetch('audio/'","fetch('../wuestensauger/audio/'")
open(f'{ROOT}/goldwaescher/index.html','w',encoding='utf-8').write(s)
print('ok',len(s))

# ---- guide.js / settings.js: Anleitung, Handbuch, Steuerung ----
def lines(p): return open(p,encoding='utf-8').read().split('\n')
def put(p,L): open(p,'w',encoding='utf-8').write('\n'.join(L))
# Klassik-Seite bekommt eigenen Schlüssel
kp=f'{ROOT}/goldwaescher/klassik.html'
if os.path.exists(kp):
    k=open(kp,encoding='utf-8').read().replace('data-game="goldwaescher"','data-game="goldklassik"')
    open(kp,'w',encoding='utf-8').write(k)
# guide.js
g=lines(f'{ROOT}/guide.js')
def gi(prefix): return next(i for i,l in enumerate(g) if l.startswith(prefix))
if not any(l.startswith(' goldklassik:{keys') for l in g):
    a=gi(' goldwaescher:{keys');b=gi(' goldwaescher:{name')
    g.insert(b+1,g[b].replace(' goldwaescher:',' goldklassik:',1).replace("name:'Goldwäscher'","name:'Goldwäscher Klassik'"))
    g.insert(a+1,g[a].replace(' goldwaescher:',' goldklassik:',1))
a=gi(' goldwaescher:{keys');w=gi(' wuestensauger:{keys')
g[a]=theme(g[w]).replace(' wuestensauger:',' goldwaescher:',1)
b=gi(' goldwaescher:{name');w=gi(' wuestensauger:{name')
g[b]=theme(g[w]).replace(' wuestensauger:',' goldwaescher:',1).replace("acc:'#f2c14e'","acc:'#ffc83d'")
put(f'{ROOT}/guide.js',g)
# settings.js
st=lines(f'{ROOT}/settings.js')
def si(prefix): return next(i for i,l in enumerate(st) if l.startswith(prefix))
def block(key):
    i=si(f' {key}:[');j=i+1
    while j<len(st) and not re.match(r'^ \w+:\[$',st[j]) and not st[j].startswith('};') and not st[j].startswith('}'): j+=1
    return i,j
if not any(l.startswith(' goldklassik:[') for l in st):
    i,j=block('goldwaescher');old=st[i:j]
    old[0]=' goldklassik:[';st[i:i]=old
    c=si(' goldwaescher:{mv');st.insert(c+1,st[c].replace(' goldwaescher:',' goldklassik:',1))
    st=[l.replace("goldwaescher:'#ffc83d',","goldwaescher:'#ffc83d',goldklassik:'#ffc83d',") if l.startswith('var acc=') else l for l in st]
    st=[l.replace("goldwaescher:'Goldwäscher',","goldwaescher:'Goldwäscher',goldklassik:'Goldwäscher Klassik',") if l.startswith('var name=') else l for l in st]
i,j=block('goldwaescher');wi,wj=block('wuestensauger')
new=[theme(l) for l in st[wi:wj]];new[0]=' goldwaescher:['
st[i:j]=new
c=si(' goldwaescher:{mv');st[c]=st[si(' wuestensauger:{mv')].replace(' wuestensauger:',' goldwaescher:',1)
put(f'{ROOT}/settings.js',st)
print('guides ok')
