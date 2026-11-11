#!/usr/bin/env python3
"""Erzeugt verlauf.json aus dem Git-Verlauf (wer hat wann was geändert, welche Spiele betroffen).
Läuft beim Veröffentlichen automatisch (.github/workflows/pages.yml)."""
import json,subprocess,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SP={'waldmeister','goldwaescher','tiefenrausch','minenschicht','steinbruch','wuestensauger','hafenmeister','bohrinsel','sternenschmied'}
out=subprocess.check_output(['git','log','-300','--date=short','--name-only','--pretty=format:@@%an|%ad|%s'],cwd=ROOT,text=True)
res=[]
for blk in out.split('@@')[1:]:
    L=blk.strip('\n').split('\n');h=L[0].split('|',2)
    if len(h)<3: continue
    games=set()
    for f in L[1:]:
        f=f.strip()
        if not f: continue
        top=f.split('/')[0]
        if f=='goldwaescher/klassik.html': games.add('goldklassik')
        elif top in SP: games.add(top)
        else: games.add('seite')
    res.append({'von':h[0],'datum':h[1],'text':h[2],'spiele':sorted(games)})
json.dump(res,open(f'{ROOT}/verlauf.json','w',encoding='utf-8'),ensure_ascii=False)
print(len(res),'Einträge')
