# Nachtschicht 03:17 — Drei Nächte

Spielen: https://roiizzza.github.io/waldmeister/nachtschicht/

Ein eigenständiges Three.js-Horrorspiel in einer Tankstelle mit drei aufeinanderfolgenden Nachtschichten. Alex arbeitet, während sich die Geschichte um den vermissten Tobias und den fremden Wagen entwickelt.

## Erweiterungen

1. Wiederkehrende Kunden mit Nacht-abhängigen Gesprächen, einer Vermisstengeschichte und wechselnder Reihenfolge.
2. Zufällige Veränderungen: verschobenes Regal, umgedrehte Packungen, offene Eingangstür, verändertes Foto, blinkende Kühlung und Ware im Spind. Veränderungen erscheinen außerhalb der Blickrichtung.
3. Kunden gehen durch die Eingangstür zur Kasse, legen Waren ab und verlassen den Laden nach dem Bezahlen.
4. Artikel mit Maus oder Touch über den Scanner ziehen; alternativ antippen. Bargeld annehmen und Wechselgeld aus einzelnen Münzen/Scheinen zusammenstellen. Die Kasse rechnet ausschließlich mit ganzen Centbeträgen.
5. Begehbarer Vorplatz mit Müllcontainer und Zapfsäulen. Müll aus dem Lager entsorgen und Säule 2 in drei Schritten zurücksetzen.
6. Der Wagen ohne Kennzeichen steht in jeder Nacht näher und hat später eine offene Fahrertür.
7. Besucher anhand von Ausweis, Geschichte und Spiegelung prüfen. Der verletzte Monteur ist ein Mensch; eine freundliche Stimme kann trotzdem eine Falle sein. Entscheidungen bleiben für spätere Nächte gespeichert.
8. Ein Gegner wird in der dritten Nacht draußen körperlich gefährlich: Blickkontakt hält ihn, Wegsehen lässt ihn näher kommen. Ein kurzer Lichtkegel stoppt ihn; zu lange Beleuchtung zieht ihn an. Der Shop dient als Rückzugsort.
9. Ein klingelndes Telefon mit Anrufen zu Tagesablauf, Kameras und Entscheidungen. Gesprächsinhalte werden im Protokoll gespeichert. Dialoge werden als Untertitel/Text dargestellt, nicht mit KI-Stimmen vertont.
10. Drei Kameraansichten: Vorplatz live, Gang mit acht Sekunden verzögerten Kundenbewegungen, und eine übernatürliche Vorschau mit zwölf Sekunden Vorlauf. Die angekündigten Schläge an der Tür folgen zwölf Spielsekunden später. Die Vorschau ist eine inszenierte Vision, keine allgemeine Simulation jeder künftigen Handlung.
11. Um 03:17 stoppen Regen und Umgebungsrauschen tatsächlich. Ein zweites Ich erscheint nur im Kamerabild und dreht sich langsam zur Kamera.
12. Drei Nächte, automatische Speicherung, Hinweise, optionale Anomalie-Meldungen und drei Enden. Abgewiesene Menschen erinnern sich; Fehler können spätere Besucher beeinflussen. Frühere Spielstände der Ein-Nacht-Version werden übernommen.

## Steuerung

WASD/Pfeile: bewegen · Maus: umsehen · E/Linksklick: benutzen · F: Taschenlampe · Shift: schneller gehen · TAB: Notizen · ESC: Pause/Maus freigeben.

Touch: linker Stick zum Gehen, rechts wischen zum Umsehen, E zum Benutzen. Auf Touch-Geräten Querformat empfohlen. Die Kasse unterstützt Ziehen und Antippen.

## Lokal starten

Im Ordner `nachtschicht`:

```sh
python3 -m http.server 8080
```

http://localhost:8080 öffnen. Aktueller Browser mit WebGL 2 erforderlich. Nicht direkt über file:// starten. Three.js r170 liegt lokal bei und ist unter MIT lizenziert (vendor/THREE-LICENSE.txt). Kein Build, Konto oder CDN erforderlich.

## Prüfungen

```sh
node tests/campaign.mjs
node tests/logic.mjs
```

Die Kampagnentests prüfen 30 vollständige Durchgänge, Geldbeträge, Aufgabenreihenfolge, Folgen von Entscheidungen, alle Enden, Zufallsvariation, Speicherstände und Migration. Die Integrationstests verwenden echte Three.js-Geometrie und einen simulierten Renderer: NPC-Wege, Drag-Scanner, Kassen-UI, Außenportal und Erreichbarkeit, Sicherungen, Kamerawege, eingefrorenen Regen, Besucherdialoge, Nachtwechsel sowie Blick-/Lichtverhalten des Gegners.

Die GPU-Darstellung und Performance sind damit nicht visuell geprüft. Der Erstellungsbrowser stellt keinen WebGL-Kontext zur Verfügung. Spiegelungen und die Zukunftsaufnahme sind bewusst stilisierte, inszenierte Effekte. Fortschritt und Einstellungen bleiben ausschließlich im Browser.
