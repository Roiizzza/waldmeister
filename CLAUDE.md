# Regeln für dieses Projekt (Spielwiese)

Gilt für alle, die hier mit Claude oder von Hand arbeiten.

## Änderungsprotokoll führen (Pflicht)
Nach **jeder** Änderung an einem Spiel einen Eintrag ins Protokoll schreiben. Es erscheint auf der Startseite.

    python3 tools/log.py <spiel> <neu|besser|fix> "Kurzer Satz, was sich für Spielerinnen und Spieler ändert" [--von "Name"]

- `neu` = neue Mechanik/Funktion, `besser` = verbessert, `fix` = Fehler behoben.
- Beschreibe die Mechanik, nicht den Code. Ein Satz, ein Eintrag pro Änderung.
- Spiele: seite, waldmeister, goldwaescher, tiefenrausch, minenschicht, steinbruch, wuestensauger, meeresreiniger, hafenmeister, bohrinsel, sternenschmied.
- Der Name kommt aus `git config user.name`. Jede Person stellt vorher ihren eigenen Namen ein:
  `git config user.name "Dein Name"`. Nur so sieht man später, wer was gemacht hat.
- Die Registerkarte „Verlauf“ auf der Startseite wird beim Veröffentlichen automatisch aus dem Git-Verlauf erzeugt.

## Wüstensauger ist das Hauptspiel
- Neue Mechaniken entstehen zuerst in `wuestensauger/index.html`.
- Spieldateien sind einzelne HTML-Dateien mit three.js; Anleitung/Handbuch stehen in `guide.js` und `settings.js`.

## Commits
Kurze deutsche Commit-Nachricht, die beschreibt, was sich im Spiel geändert hat.
