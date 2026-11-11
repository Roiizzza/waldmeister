#!/usr/bin/env python3
"""Neuen Eintrag ins Änderungsprotokoll (changelog.json) schreiben.
Aufruf:  python3 tools/log.py <spiel> <art> "Text" [--von "Name"]
  spiel: seite | waldmeister | goldwaescher | goldklassik | tiefenrausch | minenschicht | steinbruch | wuestensauger | hafenmeister | bohrinsel | sternenschmied
  art:   neu | besser | fix        (Neue Mechanik / Verbessert / Fehler behoben)
Name ist standardmäßig `git config user.name`. Beschreibe die Mechanik, nicht den Code."""
import json,sys,os,subprocess,datetime
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=f'{ROOT}/changelog.json'
a=sys.argv[1:];von=None
if '--von' in a:
    i=a.index('--von');von=a[i+1];del a[i:i+2]
if len(a)!=3: sys.exit(__doc__)
spiel,art,text=a
d=json.load(open(P,encoding='utf-8'))
if spiel not in d['spiele']: sys.exit('Unbekanntes Spiel: '+spiel+' (erlaubt: '+', '.join(d['spiele'])+')')
if art not in('neu','besser','fix'): sys.exit('art muss neu, besser oder fix sein')
if not von:
    try: von=subprocess.check_output(['git','config','user.name'],cwd=ROOT,text=True).strip()
    except Exception: von=''
    von=von or os.environ.get('USER','unbekannt')
d['eintraege'].append({'datum':datetime.date.today().isoformat(),'zeit':datetime.datetime.now().strftime('%H:%M'),'spiel':spiel,'art':art,'text':text,'von':von})
json.dump(d,open(P,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('Eingetragen:',spiel,art,'-',text,'(von',von+')')
