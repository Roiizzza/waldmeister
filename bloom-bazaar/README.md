# Bloom Bazaar — 3D-Blumenmarkt

Spielbarer, eigenständig gestalteter Three.js-Prototyp eines Arcade-Idle-Tycoons.

## Spielstart
- `index.html` über einen lokalen Webserver öffnen (z.B. `python -m http.server 8000`).
- Im Browser `http://localhost:8000` öffnen.
- Internetzugang ist beim ersten Aufruf nötig, weil Three.js über jsDelivr geladen wird.

## Steuerung
- **Smartphone:** Auf freie Spielfläche tippen oder gedrückt halten; der Charakter läuft direkt zum Zielpunkt.
- **PC:** WASD / Pfeiltasten.
- **Zoom:** `+` / `−`; Kamera setzt nach kurzer Zeit zurück.

## Gameplay
1. Blumen wachsen in Beeten und können durch Annäherung geerntet werden.
2. Blumen in einem Korb zur Kasse bringen; Kundenbestellungen werden automatisch erfüllt.
3. Bei vollständigen Bestellungen gibt es einen Bonus.
4. Geld für neue Beete, zusätzliche Kassen, größere Taschen und Helfer ausgeben – auf Leuchtfeldern im Spiel, nicht in Menüs.
5. Arbeiter ernten automatisch und bringen Blumen ins Lager; im Lager wird der leere Korb wieder aufgefüllt.

## Technik
- Ein HTML-Dokument mit Three.js ES-Modul über CDN.
- Prozedural erzeugte 3D-Modelle, keine fremden Spielassets.
- Touch- und Desktopsteuerung.

## Anmerkungen
Dies ist ein spielbarer Prototyp, keine exakte Rekonstruktion von Gardenscapes. Charaktere, Umgebungen und UI wurden eigenständig gestaltet. Für ein veröffentlichtes Produkt wären weitere Animationen, Sounds, Balancing, Speichersystem und Qualitätssicherung sinnvoll.


## Überarbeitete Version
- Deutlich verbesserte Touch-Steuerung über Zielpunkte statt virtuellem Joystick.
- Kontraststärkeres HUD mit besser lesbarer Schrift.
- Flüssigere Bewegungen und weichere Kameraführung.
- Überarbeitete stilisierte Figuren, Kassen und Beete.