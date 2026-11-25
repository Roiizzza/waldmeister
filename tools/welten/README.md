# Botanika-Welten

Eine gemeinsame Spiel-Engine (`engine.html`) mit den Regeln von Botanika. Jede Welt ist nur eine Themen-Datei in `themes/<name>.json`
(Farben, Namen der Felder, Boden-Stil) plus die Grafik-Datei `art_<stil>.js` (selbst gezeichnete Vektor-Figuren, Ernten, Deko; im Thema über `"art"` gewählt). Daraus wird mit

    python3 tools/welten/build.py            # alle Welten
    python3 tools/welten/build.py zuckerhain # nur eine

das fertige Einzel-Spiel `<slug>/index.html` erzeugt (kein three.js nötig, reines Canvas).

## Neue Welt anlegen
1. `themes/zuckerhain.json` kopieren und anpassen (slug, Items a–e, Kunden, Farben, Namen der 22 Baufelder unter `pads`).
2. `python3 tools/welten/build.py <name>`
3. Spiel in `changelog.json` unter `spiele` eintragen, Karte in `index.html` (Kategorie „Botanika-Welten“) ergänzen, `tools/log.py` ausführen.

Items: a = Basis-Ernte (Beet), b = Zweitware, c = Drittware, d = Edel-Ernte, e = in der Werkbank aus 1×a + 1×b gefertigt.
Änderungen an den Regeln gehören in `engine.html` und gelten dann für alle Welten nach dem nächsten Build.

## 3D-Welten
Ein Thema mit `"render":"3d"` nutzt dieselben Regeln, aber die Darstellung aus `render3d_<art>.js` (three.js r128 aus `wuestensauger/three.min.js`):
echte 3D-Modelle, Licht, Schatten und Spiegelungen; Texte und Blasen liegen auf einer 2D-Ebene darüber. Erstes Beispiel: `weltraum-gewaechshaus`.
Bei niedriger Bildrate senkt das Spiel automatisch Auflösung und Schattenqualität.
