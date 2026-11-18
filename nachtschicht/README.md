# Nachtschicht 03:17

Atmosphärisches Three.js-Ego-Spiel: Kunden kassieren, Chips auffüllen, eine verdächtige Lieferung prüfen, den Strom wiederherstellen und Kamera-Anomalien melden. Drei Enden hängen von deinen Entscheidungen ab.

## Spielen

https://roiizzza.github.io/waldmeister/nachtschicht/

WASD/Pfeile bewegen, Maus umsehen, E/Linksklick benutzen, F Taschenlampe, TAB Notizen, ESC Pause. Auf Touch-Geräten linker Stick zum Gehen und rechts wischen zum Umsehen. Querformat empfohlen.

## Lokal starten

Im Ordner `nachtschicht` ausführen:

```sh
python3 -m http.server 8080
```

Dann http://localhost:8080 öffnen. WebGL 2 erforderlich. ES-Module funktionieren nicht direkt über file://. Three.js liegt lokal bei; keine Installation und kein CDN nötig.

## Prüfung

```sh
node tests/logic.mjs
```

Prüft die Spiellogik mit echter Three.js-Geometrie und simuliertem Renderer: Anfangsinteraktion, Aufgabenübergänge, Regalreihenfolge, Sicherungen, alle drei Enden und Erreichbarkeit der Stationen. Grafik und Performance konnten im Erstellungsbrowser wegen deaktiviertem WebGL nicht visuell geprüft werden.

Fortschritt und Einstellungen werden nur im Browser gespeichert. Ton ist prozedural; Dialoge erscheinen als Untertitel. Die Figur bleibt im Shop, der Außenbereich ist Kulisse. Three.js r170 ist unter MIT lizenziert; siehe `vendor/THREE-LICENSE.txt`.
