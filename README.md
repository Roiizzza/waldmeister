# Spielwiese

Startseite mit Auswahl: Waldmeister, Goldwäscher, Tiefenrausch (three.js, jeweils eine HTML-Datei).
Benötigt Internet für three.js (cdnjs) und Google Fonts. Spielstände liegen im localStorage des Browsers.

## Hauptspiel Wüstensauger

`wuestensauger/` ist das Hauptspiel und steht ganz oben auf der Startseite. Neue Mechaniken entstehen dort zuerst.

`goldwaescher/index.html` wird daraus erzeugt (nicht von Hand ändern): `python3 tools/port-goldwaescher.py`.
Das Skript übernimmt alle Mechaniken, ersetzt Texte und Optik durch das Gold-Thema (Fluss, Kies, Goldmine) und schreibt außerdem die Anleitung und das Handbuch in `guide.js` / `settings.js`.
Die ursprüngliche Version liegt weiter unter `goldwaescher/klassik.html` (eigener Spielstand).
