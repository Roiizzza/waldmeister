# Turm auf Rädern – Eisenkarawane

Eigenständiges 3D-Roguelite für das Handy im Hochformat. Three.js r170 liegt lokal bei; keine CDN-Abhängigkeit, kein Build und keine Anmeldung.

## Spielen

- Finger irgendwo auf die freie Spielwelt legen und ziehen: Festung lenken. Die Strecke läuft automatisch weiter.
- Geschütze zielen und feuern automatisch. Projektilen und roten Einschlagzonen ausweichen.
- Hinterhalte vollständig räumen. Die Straßensperre öffnet sich; danach gibt es eine kostenlose Verbesserung und einen Baustopp.
- Acht Sektoren, drei Gegnertypen und der Eisenbrecher als Endboss. Nach Sektor 2, 4 und 6: gefährlicher Räuberpass oder vollständige Reparatur.
- PC zusätzlich: WASD / Pfeiltasten; P oder Escape pausiert.

## Modulare Festung

3 × 4 Plätze. Ein Modul wählen und freien Platz antippen, um es zu kaufen. Belegten Platz wählen, erneut antippen und dann den Zielplatz zum Umsetzen antippen; zwei belegte Plätze werden getauscht. Waffen und Schilde brauchen Energie. Generatoren liefern Energie; höherstufige Generatoren liefern mehr.

Kanone, Gatling, Flächenraketen, Tesla-Kettenblitz, Generator und regenerierender Schild. Module lassen sich bis Stufe 4 aufrüsten und gegen anteilige Erstattung zerlegen. Letzte Waffe und notwendige Generatoren können nicht entfernt werden.

## Fortschritt

Separate lokale Speicherung unter `spielwiese.turm-raeder.v1`. Automatischer Sicherungspunkt am Baustopp und vor der Abfahrt. Ein Neuladen wiederholt den aktuellen Sektor ab dem Baustopp. Kampferträge werden dadurch nicht dupliziert. Nach Ende der Fahrt gibt es Kerne für permanente Hüllen-, Schadens- und Startschrott-Upgrades. Andere Spiele bleiben unberührt.

Grafikstufen, Spielklänge und Vibration im Menü. Automatische Pause bei App-Wechsel. Falls WebGL fehlt, gibt es einen einfachen Canvas-Kompatibilitätsrenderer für dieselbe Three.js-Szene.

## Lokal starten / testen

Vom Repository-Stamm mit einem statischen HTTP-Server starten, z. B. `python3 -m http.server 8000`. Dann `/turm-auf-raedern/` öffnen.

`node --test turm-auf-raedern/tests/*.mjs`

Die Tests prüfen Baukosten, Energiebilanz, Schutz der letzten Waffe, Reparaturen, Aufrüstungen, Speichervalidierung, die komplette Kampagne mit normaler Ressourcenentwicklung, den Bosskampf und gleichzeitige tödliche Treffer. Der Kampagnentest verwendet einen Renderer-Ersatz und prüft die echte Spiellogik, nicht die GPU-Ausgabe. Browserprüfung der mobilen Oberfläche und Speicherung; reguläres WebGL konnte im verwendeten Testbrowser nicht aktiviert werden.

## Lizenzen

Three.js: MIT, siehe `vendor/THREE-LICENSE.txt`. Spielmodelle, Umgebung, UI und Synthesizerklänge werden direkt im Projekt erzeugt.
