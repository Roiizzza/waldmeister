# Spielwiese

Startseite mit Auswahl: Waldmeister, Goldwäscher, Tiefenrausch (three.js, jeweils eine HTML-Datei).
Benötigt Internet für three.js (cdnjs) und Google Fonts. Spielstände liegen im localStorage des Browsers.

## Hauptspiel Wüstensauger

`wuestensauger/` ist das Hauptspiel und steht ganz oben auf der Startseite. Neue Mechaniken entstehen dort zuerst.

## Zusammenarbeit und Änderungsprotokoll

Alle Regeln stehen in `CLAUDE.md` (auch für Claude-Sitzungen verbindlich).
Kurz: Vor dem Arbeiten `git pull` und `git config user.name "Dein Name"`. Nach jeder Änderung
`python3 tools/log.py <spiel> <neu|besser|fix> "Text"` ausführen, dann committen und pushen.
Die Startseite zeigt das Protokoll (filterbar nach Spiel, Art und Person) und den automatisch erzeugten Verlauf aller Commits.
