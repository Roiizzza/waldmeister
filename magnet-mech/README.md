# Magnet Mech

Spielen: https://roiizzza.github.io/waldmeister/magnet-mech/

Ein mobiles Three.js-Arena-Survivor-Spiel nach dem Magnet-Mech-Konzept: orangefarbener Roboter, industrieller Schrottplatz, kreisender Schrottschild, Magnetkräfte, sichtbare Orbitalsägen und ein großer Junk-Magnetron-Boss.

## Spielablauf

Acht Wellen mit zunehmend stärkeren Drohnen, schnellen Läufern, Schützen und Panzern. In der letzten Welle kommt der Junk Magnetron mit drei Angriffsmustern und Verstärkung. Rote Flächen kündigen seine Angriffe an. Zwischen den Wellen werden Schrott und Erfahrung eingesammelt und sieben HP repariert.

Schrott reduziert eingehenden Schaden und verletzt nahe Gegner. Die Schrottsalve verbraucht den gesamten Ring als Munition. Gegner hinterlassen Metall, Erfahrung und gelegentlich Reparaturteile. Bei Levelaufstieg wird die Simulation angehalten, bis eines von drei zufälligen Modulen gewählt wurde. Acht Modultypen lassen sich bis Stufe 6 kombinieren.

Nach jedem Lauf werden Chips gutgeschrieben. In der Werkstatt gibt es permanente Verbesserungen für Hülle, Spule und Antrieb. Diese gelten für neue Läufe; ein fortgesetzter Lauf bleibt unverändert. Die Belohnung eines Laufs kann nur einmal verbucht werden.

## Mobile Bedienung

- Auf der freien Spielfläche ziehen: der Joystick erscheint unter dem Daumen. Bewegung ist mit einem Finger möglich.
- Zielen und Grundangriff funktionieren automatisch. Aktive Fähigkeiten sind optional über drei große Tasten erreichbar.
- Magnetpuls: sammelt nahe Beute ein, beschädigt und betäubt Gegner.
- Schrottsalve: verschießt alle Schrottteile, mindestens drei erforderlich.
- EMP: Flächenschaden und Betäubung mit längerer Abklingzeit.
- Hochformat ist die erste Zielansicht; Querformat wird ebenfalls unterstützt.
- Beim App-Wechsel pausiert das Spiel. Läufe werden regelmäßig und bei Pause/Fähigkeiten/Upgrades gespeichert.

PC: WASD/Pfeile bewegen, Q Magnetpuls, E Salve, R EMP, ESC Pause.

## Grafik und Laufzeit

Die Geometrie, Mechs, Arena, Labels und Texturen werden prozedural erzeugt. Statische Objekte, Schrott und Geschosse nutzen Instancing. Die Anzahl von Gegnern, Beute und Partikeln ist begrenzt. Mobile Einstellungen verwenden eine begrenzte Pixeldichte und deaktivieren Echtzeitschatten. Bei längeren Bildzeiten wird die Pixeldichte zusätzlich abgesenkt. Die hohe Grafikstufe bietet Schatten.

Keine Werbung, Anmeldung, externen APIs oder CDNs. Spielstände und Einstellungen bleiben ausschließlich im Browser unter `mm-*`. Löschen von Browserdaten entfernt diese Spielstände. Three.js r170 wird lokal mitgeliefert, MIT-Lizenz unter `vendor/THREE-LICENSE.txt`.

## Lokal starten

Im Ordner `magnet-mech`:

```sh
python3 -m http.server 8080
```

Dann http://localhost:8080 öffnen. Ein aktueller Browser mit WebGL 2 ist erforderlich. Nicht direkt über file:// starten.

## Tests

```sh
node tests/engine.mjs
node tests/ui.mjs
node tests/balance.mjs
```

Geprüft werden Kollisionen, Munition, Fähigkeiten und Abklingzeiten, Schadensschutz, Erfahrung und Mehrfach-Levelaufstiege, Speicherstände, alle acht Wellen, Boss-Telegraphen, Belohnungen und Werkstatt. Die UI-Prüfung verwendet echte Three.js-Geometrie mit simuliertem Renderer und prüft Touch-Eingaben, Hoch-/Querformat, Modelle und Effekte sowie Pause und Fortsetzen. Sechs automatisierte Kampfdurchläufe schließen den Boss ohne Werkstattboni ab; das ersetzt keinen menschlichen Spieltest.

Der verfügbare Testbrowser stellt keinen WebGL-Kontext bereit. Die sichtbare GPU-Ausgabe und die Leistung auf echten Handys konnten daher nicht geprüft werden. Die Umsetzung ist eine eigenständige stilisierte Spielversion; die Referenz-Collage ist kein Screenshot dieser Version.
