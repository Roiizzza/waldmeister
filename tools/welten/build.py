#!/usr/bin/env python3
"""Baut aus engine.html + themes/<name>.json ein einzelnes Spiel: <slug>/index.html
Aufruf:  python3 tools/welten/build.py [name ...]     (ohne Namen: alle Themen)"""
import json,os,sys,glob
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(HERE))
eng=open(f'{HERE}/engine.html',encoding='utf-8').read()
names=sys.argv[1:] or [os.path.basename(f)[:-5] for f in sorted(glob.glob(f'{HERE}/themes/*.json'))]
for n in names:
    t=json.load(open(f'{HERE}/themes/{n}.json',encoding='utf-8'))
    css=':root{'+';'.join(f'{k}:{v}' for k,v in t['css'].items())+'}'
    out=eng.replace('/*CSSVARS*/',css).replace('/*TITLE*/',t['title']).replace('/*THEME_JSON*/null',json.dumps(t,ensure_ascii=False))
    d=f"{ROOT}/{t['slug']}";os.makedirs(d,exist_ok=True)
    open(f'{d}/index.html','w',encoding='utf-8').write(out)
    print('gebaut:',t['slug'],len(out),'Bytes')
