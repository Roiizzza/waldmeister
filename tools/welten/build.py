#!/usr/bin/env python3
"""Baut aus engine.html + themes/<name>.json ein einzelnes Spiel: <slug>/index.html
2D-Welten: Grafik aus art_<art>.js.  3D-Welten ("render":"3d"): Darstellung aus render3d_<art>.js (three.js).
Aufruf:  python3 tools/welten/build.py [name ...]     (ohne Namen: alle Themen)"""
import json,os,sys,glob,re
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(HERE))
eng=open(f'{HERE}/engine.html',encoding='utf-8').read()
def sub(s,old,new):
    assert old in s,'Engine-Stelle nicht gefunden: '+old[:60]
    return s.replace(old,new,1)
def make3d(s,t):
    a=s.index('/* ===== Zeichnen ===== */');b=s.index('/* ===== HUD ===== */')
    r=open(f"{HERE}/render3d_{t['art']}.js",encoding='utf-8').read()
    s=s[:a]+r+'\n'+s[b:]
    s=sub(s,"const cv=$('c'),ctx=cv.getContext('2d');","const cv=$('c'),ov=$('ov'),ctx=ov.getContext('2d');")
    s=sub(s,"cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);}","ov.width=Math.round(W*DPR);ov.height=Math.round(H*DPR);if(window.__rs3d)window.__rs3d();}")
    s=re.sub(r"function burst\(x,y,color,n=10\)\{[^\n]*\}\n","function burst(x,y,color,n=10){fx3dBurst(x,y,color,n);}\n",s,count=1)
    s=sub(s,"  buildSprites();\n  defPads();","  defPads();\n  buildSprites();")
    s=sub(s,'<canvas id="c"></canvas>','<canvas id="c"></canvas><canvas id="ov"></canvas>')
    s=sub(s,'canvas{position:fixed;','#ov{pointer-events:none}\ncanvas{position:fixed;')
    s=sub(s,'<script>\n(()=>{','<script src="../wuestensauger/three.min.js"></script>\n<script>\n(()=>{')
    return s
names=sys.argv[1:] or [os.path.basename(f)[:-5] for f in sorted(glob.glob(f'{HERE}/themes/*.json'))]
for n in names:
    t=json.load(open(f'{HERE}/themes/{n}.json',encoding='utf-8'))
    css=':root{'+';'.join(f'{k}:{v}' for k,v in t['css'].items())+'}'
    if t.get('render')=='3d': out=make3d(eng,t)
    else: out=eng.replace('/*ART*/',open(f"{HERE}/art_{t['art']}.js",encoding='utf-8').read())
    out=out.replace('/*CSSVARS*/',css).replace('/*TITLE*/',t['title']).replace('/*THEME_JSON*/null',json.dumps(t,ensure_ascii=False))
    d=f"{ROOT}/{t['slug']}";os.makedirs(d,exist_ok=True)
    open(f'{d}/index.html','w',encoding='utf-8').write(out)
    print('gebaut:',t['slug'],len(out),'Bytes')
