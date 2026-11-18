# URWILD – Insel der Giganten
## Spielkonzept, Bildreferenzen und Bauplan für Three.js

**Stand:** 18. November 2026 · **Arbeitsname:** URWILD · **Status:** Planungs- und Referenzfassung, noch keine Spielimplementierung.

**Auftrag:** Ein eigenständiges Dino-Survival-Spiel mit dem Kern aus Erkunden, Überleben, Zähmen, Ausrüsten, Freischalten und Bauen. Schräg von oben, mit der Übersichtlichkeit einer MOBA-Kamera, im Handy-Browser im Querformat. Ein kurzes Tutorial führt direkt ins Spiel.

Die vier erzeugten Bilder sind Konzeptbilder für die spätere Umsetzung. Sie legen Gestaltung und Bedienprinzip fest. Sie sind keine Aufnahmen eines bereits spielbaren Spiels und enthalten keine fertig nutzbaren 3D-Modelle. Sichtbare Zahlen sind Beispiele; verbindlich sind die nachfolgenden Regeln und die spätere Spielabstimmung.

## 1. Das Spiel in einem Satz

Du beginnst mit leeren Händen an der Küste einer wilden Insel, baust ein Lager und zähmst Dinosaurier, mit deren Hilfe du schwerere Lasten transportierst, schneller Ressourcen gewinnst und gefährlichere Regionen erreichst.

### Zielbild

- Eine zusammenhängende, frei begehbare Insel mit dauerhaft veränderten Ressourcen und selbst gebauten Lagern.
- Ein lebendiges Ökosystem aus friedlichen, territorialen und jagenden Tieren.
- Dinosaurier als Begleiter, Reittiere und spezialisierte Helfer.
- Sichtbarer Fortschritt: vom Steinwerkzeug über die Holzhütte bis zur befestigten Basis mit Schmiede und ausgerüsteten Dinos.
- Gut lesbare, stilisierte 3D-Grafik mit Figuren, Animationen und Materialien aus einem einheitlichen Stil.
- Kurze Spielabschnitte sind sinnvoll: etwas sammeln, einen Bauabschnitt fertigstellen oder eine kleine Expedition abschließen.

### Rahmenentscheidung

Die erste Fassung ist ein **Einzelspieler-Spiel mit lokalem Weltspielstand**. Sie benötigt keinen Spielserver und passt später als eigener Ordner auf die Spielwiese. Multiplayer, Zucht, riesige Dino-Armeen, Flugtiere und Unterwasserwelten sind eigene spätere Erweiterungen. Die Kernmechaniken aus dem Auftrag gehören bereits in die erste spielbare Fassung.

## 2. Die vier Referenzbilder und ihre Rolle

### Referenz 01 – Erkundung und Handy-HUD

Die Hauptreferenz für das normale Spiel. Küste, Dschungelpfad und kleines Lager sind gleichzeitig sichtbar. Spielfigur und gezähmter Parasaur sind klar erkennbar. Rechts liegt ein kleines, glaubwürdiges Lager; links Strand und Wasser; vor dem Spieler beginnt die Wildnis.

**Davon übernehmen:** schräge Draufsicht, warme Naturfarben, abgerundete Modelle, Größenverhältnis zwischen Mensch und Dino, Sand-Gras-Fels-Übergänge, kompakte Statusanzeigen, Minikarte rechts oben, Joystick links unten, kontextbezogene Aktionen rechts unten, sechs Schnellzugriffsplätze in der unteren Mitte.

**Anpassung bei der Umsetzung:** Die Aufgabe klappt nach dem Tutorial zu einer kleinen Zeile zusammen. Der zusätzliche Bewegungsknopf aus der Illustration wird als Ausweichen verwendet; normales Laufen und Sprinten steuert der linke Stick. Spielerwerte bleiben durchgehend Balken; ein zusätzliches Herzsystem wird nicht eingeführt.

### Referenz 02 – Survival-Kreislauf als Vierer-Collage

Zeigt Sammeln, passives Zähmen, Bauen und Erkunden zu Fuß beziehungsweise auf einem Reittier. Die vier Bilder stellen unterschiedliche Spielsituationen dar; sie sind keine lückenlose Abfolge der allerersten Spielminute.

**Davon übernehmen:** sichtbare Ressourcenfunde, lesbare Vertrauensanzeige beim Zähmen, grüne Bauvorschau, der Übergang vom kleinen Lager zur Expedition mit Lasttieren und gut erkennbare Gefahren vor dem Spieler.

### Referenz 03 – Basisbau

Die Referenz für modulare Gebäude, Werkstationen, Gehege und den Baumodus.

**Davon übernehmen:** glaubwürdige Größen, Holzrahmen, helle Seile, Strohdächer, einfache Steinwerkstätten, eingerastete Bauteile, grüne gültige und rote blockierte Vorschau, Bodenraster nur im aktiven Baubereich. Rechts stehen Platzieren, Drehen und Abbrechen; die Kampfaktionen werden im Baumodus durch diese Bauaktionen ersetzt.

### Referenz 04 – Dino-Inventar und Ausrüstung

Die Referenz für die Beziehung zum gezähmten Tier. Der grünliche Parasaur „Farn“ besitzt Sattel und seitliche Taschen. Sein Inventar und die Befehle sind direkt erreichbar.

**Davon übernehmen:** rechts ein etwa 30–35 % breites Bedienpanel, deutlich dargestellte Ausrüstungsplätze, wenige verständliche Werte, große Befehle und die Verbindung zwischen Inventargegenstand und sichtbarer Ausrüstung am 3D-Modell.

**Anpassung bei der Umsetzung:** Die Vergrößerung ist ein Inspektionsmodus. Die normale Spielkamera bleibt höher und weiter entfernt. Im Einzelspieler pausiert die Simulation während vollständiger Inventar-, Forschungs- und Inspektionsmenüs.

### Verbindliche Gestaltungsmerkmale

- Figur: dunkles gebundenes Haar, beigefarbene Kleidung, petrolfarbener Stoffakzent, braune Lederteile.
- Erster Parasaur: mintgrüner Körper, heller Kamm, später brauner Sattel mit petrolfarbener Unterlage.
- Triceratops: rost-orange, helle Hörner und gut lesbarer Nackenschild.
- Wasser: türkis, mit einer schmalen hellen Uferzone; kein aufwendiger Echtzeit-Ozean als Voraussetzung.
- Gebäude: warmes Holz, Seilverbindungen, helles Stroh, später robuste Stein- und Metallteile.
- Oberfläche: dunkles Petrol, cremefarbene Schrift, bernsteinfarbene Hauptaktion, klare Symbole.
- Bäume und Büsche dürfen Sicht und Bedienung nicht verdecken. Große Dächer und störende Baumkronen werden situationsabhängig ausgeblendet.

## 3. Kamera und Spielfigur

### Kameravorschlag

Orthografische beziehungsweise nahezu orthografische schräge Draufsicht. Startwert: etwa **52° nach unten gegenüber der Horizontalen**, feste Himmelsrichtung und weiches Folgen. Das ist ein eigener Startwert für dieses Spiel, keine Behauptung über exakte Kameraeinstellungen eines anderen Spiels.

- Der Spieler steht leicht unterhalb der Bildschirmmitte. Nach vorne bleibt Platz, um Tiere und Hindernisse zu erkennen.
- Der normale Ausschnitt zeigt ungefähr 35–45 Meter in der Breite; der Wert wird am echten Handy mit dem jeweiligen Modellmaßstab abgestimmt.
- Drei Zoomstufen: normale Bewegung, größere Übersicht beim Reiten, genauere Bauansicht.
- Beim Reiten folgt die Kamera dem Tier. Sie zoomt nur so weit heraus, wie es seine Größe und Geschwindigkeit erfordern.
- Berge werden nicht durchsichtig. Dach- und Baumkronenausblendung lösen lokale Sichtprobleme.
- Eine freie Kameradrehung ist zunächst nicht vorgesehen. Die feste Orientierung macht Stick-Steuerung, Bauen und Minikarte verlässlich.

Die orthografische Projektion erhält die dargestellte Größe eines Objekts unabhängig von seiner Entfernung zur Kamera. Das ist ein technischer Ausgangspunkt für eine gut lesbare Draufsicht, kein Leistungsversprechen. Quelle: Three.js OrthographicCamera, siehe Quellen.

## 4. Steuerung im Handy-Querformat

| Bereich | Normales Spiel | Auf einem Dino | Baumodus |
|---|---|---|---|
| Links unten | Frei platzierbarer Bewegungsstick | Reittier bewegen | Spieler bewegen |
| Rechts: Hauptaktion | Werkzeug benutzen / angreifen | Dino-Angriff / passende Sammelaktion | Bauteil platzieren |
| Rechts: Interaktion | Sammeln, Trinken, Öffnen, Zähmen | Absteigen / interagieren | Drehen um 90° |
| Kleine Zusatzaktion | Ausweichen | Artabhängig, etwa Ansturm | Abbrechen |
| Unten Mitte | Sechs Schnellzugriffsplätze | Sechs Schnellzugriffsplätze | Bauteil-Auswahl |
| Rechts oben | Minikarte, Karte und Menü | Gleiches Layout | Minikarte und Baumenü |

- Der Kontextknopf erhält Symbol und kurze Beschriftung: „Trinken“, „Füttern“, „Öffnen“, „Reiten“.
- Volle Stick-Auslenkung aktiviert nach kurzer Verzögerung Sprinten; darunter wird gegangen. Sprinten verbraucht Ausdauer.
- Nahkampf richtet sich weich zum nächsten geeigneten Ziel vor der Figur aus. Die Hauptaktion kann gehalten werden.
- Ein angetipptes Ziel kann gebunden werden. Fernkampf erhält eine Zielhilfe, damit kleine Ziele auf dem Handy sinnvoll treffbar bleiben.
- Berührungsziele als Startbudget: Hauptaktion 60–68 CSS-Pixel, sekundäre Aktionen 46–54, Schnellzugriffsplätze mindestens 44. Das Layout wird zusätzlich bei 640 × 360 und 844 × 390 CSS-Pixeln geprüft.
- Display-Aussparungen und Browserleisten werden über sichere Randabstände berücksichtigt.
- Für Linkshänder kann die Daumenanordnung gespiegelt werden. Am PC bleiben WASD, Mausinteraktion und nummerierte Schnellplätze möglich.
- Beim App-Wechsel wird das Einzelspiel pausiert. Nach dem Fortsetzen werden gehaltene Eingaben zurückgesetzt.

## 5. Die Insel und ihr Aufbau

### Erste vollständige Insel: ungefähr 768 × 768 Meter

Die Insel ist durchgehend begehbar. Die Einteilung in technische Abschnitte wird beim normalen Spielen nicht als Levelwechsel sichtbar.

| Region | Ressourcen und Tiere | Gefahr | Zweck |
|---|---|---|---|
| Küste | Holz, Stein, Fasern, Beeren; Dodos und Parasaurier | Niedrig | Tutorial, erstes Lager, erstes Reittier |
| Grasland | Viele Beeren, größere Bäume; Triceratops und Stegosaurus | Mittel | Landwirtschaft, Lasttiere, größere Basis |
| Dschungel und Fluss | Dichtes Holz, Fasern, Wild, Raptoren | Mittel bis hoch | Jagd, Erkundung, Kampfbegleiter |
| Felsen und Hochland | Feuerstein, Erz, Ankylo; gefährliche Räuber | Hoch | Metall, bessere Werkzeuge, spätes Ausrüsten |

Verfallene Anlagen und Höhleneingänge liegen als besondere Orte in diesen Regionen. Sumpf, Schnee, Vulkan, Fliegen und Unterwassererkundung sind spätere Inselerweiterungen.

### Verteilung und Orientierung

- Ein sicherer Küstenbogen bietet mehrere geeignete Startplätze und Zugang zu Trinkwasser.
- Ein Fluss dient als verständliche Leitlinie ins Inselinnere.
- Felsriegel und Waldgebiete schaffen natürliche Engstellen, keine unsichtbaren Arenawände.
- Ruinen, ein großer markanter Fels und die Flussmündung sind aus der Draufsicht unterscheidbare Orientierungspunkte.
- Ressourcen stehen in nachvollziehbaren Vorkommen. Erz liegt im felsigen Gebiet, Pflanzen im passenden Lebensraum.
- Anspruchsvolle Gebiete bieten bessere Rohstoffe und stärkere Tiere. Die Beschaffung dieser Rohstoffe treibt den Fortschritt voran.

### Persistenz

Gefällte Bäume, abgebaute Felsen, Gebäude, Lager, gezähmte Tiere und deren Inventare gehören zum Weltspielstand. Ressourcen regenerieren verzögert und nicht in einer bebauten Basis. Wildtiere werden nach Lebensraum und Abstand zum Spieler nachbesetzt; sie erscheinen nicht sichtbar direkt neben ihm neu.

## 6. Der eigentliche Spielkreislauf

1. Ein kleines Ziel wählen: Wasser finden, einen Sattel bauen, Erz bergen oder ein Gehege erweitern.
2. Eine passende Ausrüstung und bei Bedarf einen Dino vorbereiten.
3. Ein Gebiet erkunden und Ressourcen sammeln.
4. Risiken abwägen: kämpfen, schleichen, zurückziehen oder ein Tier zähmen.
5. Mit Beute zum Lager zurückkehren und Gegenstände in Kisten oder Dino-Taschen umlagern.
6. Besseres Werkzeug, neue Gebäudeteile und Ausrüstung herstellen.
7. Mit den neuen Möglichkeiten weiter ins Inselinnere vordringen.

Der wichtigste Fortschritt ist ein neuer Nutzen. Ein Parasaur verändert den Transport, ein Trike die Beerenernte und ein Ankylo den Erzabbau. Größere Zahlen allein reichen als Belohnung nicht aus.

## 7. Überleben ohne ständige Unterbrechung

### Grundwerte

Leben, Ausdauer, Hunger und Durst. Gewicht begrenzt die Mitnahme. Temperatur wird zunächst nur als Warnung eingeblendet, wenn sie tatsächlich ein Problem ist.

- Hunger und Durst sinken langsam. Für erste Tests sollen Nahrung und Wasser eher alle 6–12 aktiven Minuten relevant werden, nicht alle 30 Sekunden.
- Unterwegs helfen Beeren und Trinkwasser; im Lager wird Fleisch gekocht und Wasser bevorratet.
- Nahrung verdirbt zunächst nur nach aktiver Spielzeit. Ein späterer Räucherschrank oder eine Konservierungskiste verlängert die Haltbarkeit.
- Ein Lagerfeuer dient zum Kochen und wärmt nachts.
- Bei ausreichender Versorgung und ohne aktuelle Gefahr regeneriert der Spieler langsam Leben.
- Gewicht soll einen Lastdino früh sinnvoll machen. Als Testwerte: Spieler etwa 35 kg, erster ausgerüsteter Parasaur ungefähr 120 kg. Diese Werte werden im Spiel abgestimmt.
- Geschlossenes Spiel bedeutet pausierte Welt. Es entstehen keine Hunger- oder Basisverluste durch eine Nacht außerhalb des Browsers.

### Tod und Rückkehr

Ein Bett beziehungsweise eine Lagermatte setzt den Rückkehrpunkt. Beim Tod bleibt ein deutlich markierter Beutel mit mitgeführten Gegenständen zurück. Freischaltungen, Gebäude und bereits gelagerte Gegenstände bleiben erhalten. In der ersten Version ist normaler Schwierigkeitsgrad vorgesehen; ein optionaler entspannter Modus kann Verluste reduzieren.

## 8. Ressourcen und Herstellung

### Rohstoffgruppen

- Anfang: Holz, Stroh, Stein, Fasern, Beeren, Wasser.
- Frühes Überleben: Feuerstein, Haut, Rohfleisch, gekochtes Fleisch.
- Mittlerer Fortschritt: Leder, Erz, Metallbarren, Holzkohle.

### Produktionsstufen

| Stufe | Möglichkeiten | Nächster Anreiz |
|---|---|---|
| Handarbeit | Steinaxt, Steinpicke, Speer, Fackel, Lagerfeuer, Lagermatte | Grundversorgung sichern |
| Einfache Werkbank | Bogen, Pfeile, Kleidung, Kisten, einfache Sättel und Taschen | Erkundung und Zähmen verbessern |
| Steinofen / Schmiede | Metallbarren, Metallwerkzeuge, stärkere Bauteile | Hochland und schwere Tiere erschließen |
| Fortgeschrittene Werkbank | Bessere Rüstung, stärkere Sättel, ausgewählte Fernkampf-Ausrüstung | Gefährliche Expeditionen vorbereiten |

Die Rezeptlisten zeigen immer die benötigten und vorhandenen Materialien. „Herstellen“, „5 herstellen“ und Mengenanpassung sind direkt erreichbar. Rezepte werden nach Zweck gruppiert; nicht verfügbare Rezepte erklären ihre Voraussetzungen.

### Erste Rezeptansätze für den spielbaren Abschnitt

Die Mengen sind Arbeitswerte für kurze Wege, keine bereits geprüfte Ökonomie:

| Rezept | Beispielkosten |
|---|---|
| Steinaxt | 5 Holz, 6 Stein, 3 Fasern |
| Steinpicke | 5 Holz, 8 Stein, 4 Fasern |
| Speer | 8 Holz, 3 Feuerstein, 6 Fasern |
| Lagerfeuer | 8 Stein, 6 Holz, 10 Stroh |
| Lagermatte | 8 Holz, 12 Stroh, 12 Fasern |
| Einfacher Parasaur-Sattel | 12 Holz, 20 Fasern, 12 Stroh |
| Kleine Kiste | 12 Holz, 8 Fasern |
| Holzfundament | 15 Holz, 20 Stroh, 8 Fasern |
| Holzwand | 10 Holz, 15 Stroh, 6 Fasern |

Der einfache erste Sattel ist eine geflochtene Auflage. Die späteren Leder- und Rüstungssättel benötigen zusätzliche Materialien. Dadurch blockiert die erste Reittier-Erfahrung nicht an einer unnötigen Jagdpflicht.

## 9. Freischaltungen und Forschung

Erfahrung entsteht durch Erkundung, den Abschluss kleiner Ziele, erste Herstellungs-Erfolge, Sammeln, Kämpfe und Zähmen. Bei einem Stufenaufstieg gibt es Freischaltpunkte für Rezepte.

Vorgeschlagene frühe Entwicklung:

- Stufe 1–2: Steinwerkzeuge, Feuer, Lagermatte, Kiste; einfacher Parasaur-Sattel wird durch das Tutorial erklärt.
- Stufe 3–5: Bogen, einfache Kleidung, Holzbauteile und Gehege.
- Stufe 6–10: Betäubungsausrüstung, Trike-Sattel, Dino-Taschen und Steinbau.
- Stufe 11–15: Erzverarbeitung, Metallwerkzeuge, Raptor- und Ankylo-Ausrüstung.
- Stufe 16–20: Bessere Rüstung, verstärkte Sättel und schwierige Expeditionen.

Der Baum hat verständliche Bereiche: Überleben, Bauen, Werkzeuge, Waffen und Dinosaurier. Neue Möglichkeiten bleiben sichtbar, inklusive Voraussetzungen. Wiederholtes Herstellen desselben billigen Gegenstands soll deutlich weniger Erfahrung liefern als neue Entdeckungen und echte Ziele.

## 10. Dinosaurier und ihr Nutzen

### Geplantes Artenset für die erste vollständige Insel

| Art | Verhalten | Nutzen nach dem Zähmen | Geplante Zähmung |
|---|---|---|---|
| Dodo | Friedlich, flieht | Eier, kleines Lagertier, leichter Einstieg | Passiv füttern |
| Parasaur | Friedlich, flieht bei Gefahr | Frühes Reiten, Transport, Warnruf | Passiv füttern |
| Triceratops | Territorial, verteidigt sich | Beeren sammeln, Lasten, Ansturm | Betäuben und versorgen |
| Ankylosaurus | Ruhig, wehrt sich stark | Stein und Erz effizient abbauen | Betäuben und versorgen |
| Raptor | Jagt in kleinen Gruppen | Schneller Kampfbegleiter | Betäuben und versorgen |
| Stegosaurus | Langsam, defensiv | Pflanzen sammeln, schwerer Transport | Betäuben und versorgen |
| Tyrannosaurus | Gefährlicher Einzeljäger | Spätes Kampf- und Reittier | Anspruchsvolle späte Zähmung |

Für den ersten zusammenhängenden Spielabschnitt reichen Dodo, Parasaur, Triceratops und Raptor. Ankylo, Stego und Rex erweitern anschließend die Insel und den Fortschritt. Flugtiere und Wasser-Dinos sind nicht Teil dieses ersten Artensets.

### Ausrüstung und Werte

Gezähmte Tiere besitzen einen Namen, eine Stufe, Leben, Ausdauer, Nahrung, Traglast und einen verständlichen artspezifischen Vorteil. Ein Sattel ermöglicht das Reiten, Taschen erhöhen den praktischen Transportnutzen, spätere Schutzteile verbessern die Überlebensfähigkeit.

Sattel und Taschen sind am 3D-Modell sichtbar. Inventarplätze sind echte Ausrüstungsslots, keine reine Beschriftung. Charakter und Reittier wechseln beim Auf- und Absteigen sauber zwischen ihren Animationszuständen.

### Befehle

Folgen, Warten, Zur Basis, Passiv, Verteidigen und Mein Ziel angreifen. Die drei wichtigsten Befehle sind direkt sichtbar; zusätzliche Befehle liegen in einem klaren Untermenü. Eine kleine Gruppe kann gemeinsam angesprochen werden.

Als erstes Leistungsbudget: ein gerittenes Tier plus bis zu drei aktive Begleiter. Weitere eigene Tiere können im Lager gehalten und dauerhaft gespeichert werden. Ob größere Gruppen sinnvoll laufen, wird nach Messung mit echten Modellen entschieden.

## 11. Zähmung mit zwei Verfahren

### Passives Zähmen

1. Geeignetes Futter in den Schnellzugriff legen.
2. Langsam an ein friedliches Tier herangehen.
3. Beim passenden Abstand „Füttern“ antippen.
4. Vertrauen wächst; nach kurzer Pause kann erneut gefüttert werden.
5. Nach erfolgreicher Bindung Namen vergeben und einen ersten Befehl wählen.

Bedrohliches Verhalten oder Treffer verringern Vertrauen. Die Anzeige sagt verständlich, was gerade fehlt: Abstand, Futter oder Zeit bis zur nächsten Fütterung. Der Tutorial-Parasaur benötigt ungefähr 45–60 Sekunden; normale Tiere dürfen später länger dauern.

### Betäuben und Versorgen

1. Ein passendes Tier beobachten und seine Umgebung sichern.
2. Mit freigeschalteter Betäubungsausrüstung seine Betäubung erhöhen.
3. Nach dem Zusammenbrechen geeignetes Futter in sein Inventar geben.
4. Zähmfortschritt, Nahrung und Betäubung im Blick behalten.
5. Das Tier während der Zähmung schützen und bei Bedarf nachversorgen.

Leben und Betäubung sind unterschiedliche Werte. Das Interface verhindert, dass der Spieler sie verwechselt. Zähmung ist in aktiver Spielzeit auf kurze mobile Abschnitte ausgelegt: frühe Tiere ungefähr 1–3 Minuten, anspruchsvollere Tiere zunächst 3–6 Minuten. Lange reale Wartezeiten sind kein Ziel dieser Planung.

## 12. Basisbau und Lagerwirtschaft

### Bauteile

Fundament, Boden, Wand, Türrahmen, Tür, Fensterwand, Dach, Rampe und Zaun beziehungsweise Tor. Holz ist die frühe Stufe; Stein und Metall folgen später. Werkstationen umfassen Feuer, Kiste, Lagermatte/Bett, Werkbank, Steinofen und Futtertrog. Kleine Beete bilden den Einstieg in Landwirtschaft.

### Platzierung

- Ein 3-Meter-Bauraster ist der Startwert. Die Vorschau rastet an geeigneten Nachbarteilen ein.
- Gültige Vorschau grün; blockierte Vorschau rot mit einer kurzen Begründung.
- Prüfungen: Untergrund, Hangneigung, Wasser, Abstand zum Spieler, Unterstützung und Kollision mit anderen Bauteilen.
- Platzieren, Drehen und Abbrechen sind getrennte Aktionen.
- Ressourcen werden erst bei erfolgreichem Platzieren abgezogen.
- Die letzte gerade platzierte Struktur kann kurzzeitig ohne Materialverlust zurückgenommen werden; späteres Abbauen erstattet einen festgelegten Anteil.
- Inventar und Inhalt einer Kiste dürfen beim Versetzen oder Abreißen nicht verschwinden. Gefüllte Lager werden zunächst gegen versehentliches Entfernen geschützt.

### Logistik

Spielerinventar, Kisten, Werkbänke und Dino-Taschen sind getrennte Container. Große Schaltflächen bieten „Alles einlagern“, „Passende Materialien einlagern“ und einzelne Mengen. Rohstoffe in nahen eigenen Kisten können später für Werkstationen verfügbar werden; diese Komfortfunktion wird klar angezeigt und nicht stillschweigend angenommen.

## 13. Kämpfe und Wildtierverhalten

Nahkampf beginnt mit Speer und einfachen Werkzeugen, Fernkampf mit dem Bogen. Treffer haben erkennbare Animationen, kurze Rückmeldung und passende Klänge. Ausdauer begrenzt pausenlose Angriffe und Ausweichrollen.

Wildtiere erhalten klare Zustände: Ruhen, Fressen, Wandern, Gefahr erkennen, Fliehen, Verfolgen, Angreifen, Zurückkehren, Betäubt und Gezähmt. Pflanzenfresser laufen nicht pauschal aggressiv auf den Spieler zu. Raptoren bleiben überschaubare Gruppen, keine zufälligen Gegnerwellen.

- Aggression folgt Sichtweite, Nähe, Verhalten und Art.
- Große Tiere kündigen starke Angriffe durch Körperhaltung oder Bodenmarkierung an.
- Kämpfe werden durch Umgebung beeinflusst: Felsen helfen beim Abstandhalten, Zäune schützen nur im Rahmen ihrer Stabilität.
- Begleiter finden tatsächlich einen Weg um Hindernisse. Ein Trike benötigt breitere Wege und Tore als der Mensch.
- Steckt ein Tier fest, versucht es zunächst einen neuen Weg und geht in einen sicheren Wartezustand. Ein späterer Notruf ist ein geplanter Komfortmechanismus, kein permanentes Teleportieren durch Gebäude.

## 14. Das kurze Anfangstutorial

**Ziel: ungefähr 4–6 Minuten**, jederzeit überspringbar und später im Handbuch abrufbar. Es spielt in der normalen Welt. Bereits vorab ausgeführte Handlungen werden erkannt.

| Schritt | Tätigkeit | Lernziel |
|---|---|---|
| 1 | Zum markierten Uferstück laufen, etwas Wasser trinken und lose Materialien aufheben | Bewegen und Kontextaktion |
| 2 | Steinaxt herstellen und einen kleinen Baum bearbeiten | Herstellen und Werkzeug benutzen |
| 3 | Ein Feuer setzen und mit etwas Holz entzünden | Bauvorschau und Grundversorgung |
| 4 | Einen friedlichen Parasaur mit Beeren füttern | Zähmen und Vertrauensanzeige |
| 5 | Den einfachen Sattel herstellen, ausrüsten und eine kurze Runde reiten | Dino-Ausrüstung und Reiten |
| 6 | Eine Lagermatte und eine kleine Kiste platzieren | Rückkehrpunkt, Lager und eigener Fortschritt |

Danach lautet das erste freie Ziel: „Errichte dein Küstenlager.“ Die Hinweise erklären Funktionen, sie spielen nicht die Eingaben für den Spieler ab. Der Startbereich enthält genügend Material und keine aggressiven Räuber direkt am Tutorialplatz.

## 15. Die ersten 30 Minuten als Erlebnisziel

- Minute 0–6: Tutorial, Feuer, erster Parasaur, erste kurze Reitstrecke, sicherer Rückkehrpunkt.
- Minute 6–12: Materialien mit dem Parasaur transportieren, erste Fundamente und Holzwände bauen, Nahrung einlagern.
- Minute 12–20: Werkbank und Bogen, Kleidung, kurze Expedition zum Waldrand, erste Begegnung mit Räubern.
- Minute 20–30: Zähmausrüstung vorbereiten, einen Trike oder Raptor als nächstes Ziel wählen, Basis und Gehege sinnvoll erweitern.

Diese Zeiten sind Ziele für Spieltests. Rohstoffmengen, Wege, XP und Zähmgeschwindigkeit werden daran angepasst. Der Spieler soll in der ersten halben Stunde mehrfach eine neue Möglichkeit erleben.

## 16. Three.js-Architektur

### Getrennte Systeme

Renderer/Kamera, Eingaben, Welt und Chunks, Spielfigur, Kreaturen-KI, Interaktion, Inventare, Rezepte/Forschung, Bauen, Tutorial und Speicherung werden als getrennte Module aufgebaut. Spielregeln sollen ohne Browseroberfläche prüfbar sein.

- Simulation in festen Zeitschritten, Darstellung davon getrennt.
- Inventare, Rezepte und Dino-Arten aus Datentabellen mit stabilen IDs.
- Ressourcenabbau, Zähmabschluss, Herstellen und Platzieren als eindeutige Aktionen. Mehrfaches Tippen darf Gegenstände nicht duplizieren.
- Ein gespeicherter Welt-Seed erzeugt reproduzierbare Landschaftsdetails. Wichtige Orte und Startressourcen werden gezielt gestaltet.
- Geländehöhe aus einem Heightfield; keine freie Voxel-Abbauwelt erforderlich.

### Weltabschnitte

64 × 64 Meter große Chunks. Bei der vollständigen Insel ergibt das 12 × 12 Abschnitte. Ein Bereich um den Spieler bleibt geladen; weiter entfernte Weltänderungen liegen als Daten vor. Als Startpunkt werden neun nahe Chunks geladen, während tatsächlich sichtbare Details und aktive KI enger begrenzt werden.

Statische Bäume, Steine und Pflanzen nutzen gebündelte Instanzen und Sichtbarkeitsstufen. Nahe Tiere erhalten volle Animation und KI; weiter entfernte Tiere werden seltener aktualisiert, entfernte Lebensräume ruhen als Daten. Animierte Kreaturen werden nicht pauschal wie starre Felsen instanziert.

### Bewegung und Kollision

Einfache Kapsel-/Kreis- und Quader-Kollisionen, räumliche Nachbarschaftssuche und ein lokales Weggitter für Tiere. Neu gesetzte Gebäude aktualisieren die betroffenen Wegfelder. Türen und Tore besitzen tatsächliche Zustände; die Wegfindung berücksichtigt Tiergröße und Durchgangsbreite.

## 17. 3D-Assets und Animationen

Die Bildreferenzen werden nicht als flache Figuren in die Szene gestellt. Mensch, Tiere, Sättel und Bauteile benötigen passende 3D-Geometrie.

### Vorgehen

1. Zuerst ein echter Parasaur und die Spielfigur im finalen Kamerawinkel.
2. Silhouette, Proportionen, Maßstab und Materialwirkung mit Referenz 01 vergleichen.
3. Ein kleines Küstenstück mit Wasser, Fels, Baum und Lagerfeuer ergänzen.
4. Laufen, Folgen, Fressen, Reiten und Ausrüsten mit sichtbaren Satteltaschen prüfen.
5. Erst nach dieser visuellen und technischen Abnahme den vollständigen Spielumfang ausbauen.

Geeignete eigene oder passend lizenzierte Modelle werden als GLB/glTF mit Rig und Animationen eingebunden. Three.js GLTFLoader ist der geplante Importweg. Ein Bildgenerator liefert keine sofort spielbereite animierte GLB-Figur.

### Mindestanimationen

- Mensch: Stehen, Gehen, Sprinten, Sammeln, Werkzeugschlag, Nahkampf, Bogenschuss, Treffer, Tod und Reitsitz.
- Dino: Stehen, Gehen, Laufen, Fressen, Angriff, Treffer, Zusammenbrechen und Tod; artspezifische Aktionen kommen gezielt dazu.
- Sattel und Taschen sind getrennte Anbauteile mit definierten Befestigungspunkten.
- Für kleine Hintergrundteile dürfen einfache prozedurale Modelle eingesetzt werden. Ihre Formen, Materialien und Detaildichte müssen zur Hauptfigur und den Dinos passen.

## 18. Leistungsziele für mobile Browser

Planungswerte, die auf echten Geräten bestätigt werden müssen:

- Stabile 30 FPS als Basisziel auf einem geeigneten Mittelklasse-Handy; 60 FPS als optionale Qualitätsstufe auf stärkeren Geräten.
- Adaptive Auflösung, zunächst etwa Gerätepixelfaktor 1–1,5 auf der normalen mobilen Stufe.
- Ein zentrales Sonnenlicht mit begrenztem Schattenbereich; gebackene beziehungsweise günstige Kontaktschatten für viele Details.
- Pflanzen, Erzsteine und Bauteile mit gemeinsam genutzten Materialien und Texturatlanten; keine tausenden einzeln gezeichneten Kleinteile.
- Als Startbudget ungefähr 150–250 Draw Calls einschließlich relevanter Zusatzdurchläufe und etwa 150.000–250.000 sichtbare Dreiecke. Diese Werte sind Arbeitsgrenzen für Messungen, keine Garantie.
- Aktive KI im nahen Bereich begrenzen; große entfernte Dino-Populationen nicht vollständig pro Bild simulieren.
- Startgebiet und Kernmodelle zuerst laden, weitere Biome und Arten nachladen. Ein sichtbarer Ladefortschritt erklärt größere Asset-Ladevorgänge.
- Einfache Wasserfläche mit Uferwirkung statt aufwendiger Echtzeit-Spiegelung.
- WebGL2 vor dem Start auf Verfügbarkeit prüfen; bei fehlender Unterstützung eine klare Kompatibilitätsmeldung anbieten.

InstancedMesh reduziert Zeichenaufrufe für Objekte mit gemeinsamer Geometrie und Material. Das ist eine konkrete technische Grundlage des Plans, ersetzt aber weder Messungen noch die gesonderte Behandlung animierter Tiere. Quelle: Three.js InstancedMesh.

## 19. Speichern und Schutz des Spielfortschritts

Größere Weltdaten gehören in IndexedDB, Einstellungen können klein gespeichert werden. Das Spiel erhält einen eigenen Namensraum, z. B. `urwild.save.v1`, und verändert keine Speicherstände der übrigen Spielwiese.

Gesichert werden: Welt-Seed und Zeit, Charakterwerte, Position, Inventare, Freischaltungen, Tutorialstand, Gebäude, Ressourcenänderungen und gezähmte Tiere einschließlich Ausrüstung, Zustand und Befehl.

- Automatisch alle ungefähr 30 aktiven Sekunden sowie nach wichtigen Änderungen wie Zähmabschluss, Freischaltung und Bauabschluss.
- Transaktionale Speicherung beziehungsweise generationsbasierte Sicherungen; letzter gültiger Stand bleibt als Rückfallpunkt erhalten.
- Vollständiger Export und Import des eigenen Spielstands als Datei.
- Versionsprüfung und Migration beim Laden. Fehlgeschlagene oder unvollständige Saves dürfen nicht stillschweigend den letzten gültigen Stand ersetzen.
- Beim App-Wechsel wird ein zusätzlicher Speicherwunsch ausgelöst; die vorherigen periodischen Sicherungen bleiben entscheidend, da mobile Browser Seiten beenden können.

Browserspeicher ist keine uneingeschränkt dauerhafte Sicherung: Browser können Daten unter bestimmten Bedingungen entfernen, und gemeinsamer Origin-Speicher betrifft auch mehrere Spiele unter derselben Website. Daher gehört der Export zum geplanten Funktionsumfang. Quelle: MDN Storage quotas and eviction criteria.

## 20. Umsetzungsreihenfolge und klare Abnahme

### A – Visueller und technischer Prüfstand

Küstenstück, Kamera, Figur, ein animierter Parasaur, Sattel/Taschen, Touch-Steuerung, einfache Kollision und Messung auf einem echten Handy. Vergleich mit Referenz 01 und 04. Erst danach wird der Stil für weitere Arten und Gebäude vervielfältigt.

**Abnahme:** Die Szene wirkt aus der normalen Spielperspektive zusammengehörig; die Kamera passt; Modelle laufen und reiten glaubwürdig; Hände verdecken keine wichtigen Aktionen; die gewählte Zielhardware hält das Basisziel.

### B – Zusammenhängender spielbarer Abschnitt

Etwa 256 × 256 Meter Küste und Waldrand; Dodo, Parasaur, Trike und Raptor; Grundversorgung, Inventare, Steinwerkzeuge, Bogen, Forschung, beide Zähmarten, Reiten, Sattel/Taschen, grundlegender Holzbau und vollständiges Tutorial. Speichern gehört bereits dazu.

**Abnahme:** Ohne Testkürzel vom Start bis zum selbst gebauten Lager mit gezähmtem und ausgerüstetem Reittier spielen. Eine gefährliche Expedition unternehmen, zurückkehren, neu laden und alles korrekt wiederfinden.

### C – Erste vollständige Insel

Die ungefähr 768 × 768 Meter große Insel, vier Regionen, Erzverarbeitung, zusätzliche Arten, Steinbau, bessere Ausrüstung und mehrere Entdeckungsziele. Ressourcen und Freischaltungen müssen den ganzen Fortschritt tragen.

**Abnahme:** Frühe, mittlere und spätere Expeditionen haben jeweils einen Zweck. Jedes Tier und jede Werkstation eröffnet eine nachvollziehbare neue Möglichkeit.

### D – Abstimmung und Veröffentlichung

Touch-Feinschliff, Kampfgefühl, Klang, Animation, Sichtbarkeit im Dschungel, Ladezeiten, Fehlerfälle, Wiederaufnahme und echte mobile Leistungstests. Danach als eigener Spielordner auf die Spielwiese veröffentlichen und auf der Startseite verlinken.

Die Planungsphase verändert oder veröffentlicht jetzt noch kein Spiel.

## 21. Prüfliste vor der ersten Veröffentlichung

- Kompletter Tutoriallauf ohne Entwicklerbefehle; Überspringen und spätere Wiederaufnahme funktionieren.
- Beide Zähmarten abschließen; falsches Futter, fehlende Betäubung und unterbrochene Zähmung verständlich behandeln.
- Aufsteigen, Absteigen, Tierwechsel, Satteltaschen und Containertransfer ohne Gegenstandsverlust.
- Ein Dino folgt durch eine offene Route und bleibt vor einem zu schmalen Tor stehen.
- Bauvorschau prüft Wasser, Hänge und belegte Plätze; Materialabzug nur bei Erfolg.
- Gebäude, Container und Tiere bleiben nach Neuladen sowie Export/Import erhalten.
- Rezepte können durch Mehrfachtippen weder Ressourcen noch fertige Gegenstände duplizieren.
- Browser-Unterbrechung führt zu Pause und sauberem Eingaberücksetzen.
- Räuber, Tiere und Spieler kämpfen unter denselben Reichweiten- und Kollisionsregeln; Angriffe besitzen lesbare Rückmeldung.
- Kamera und Oberfläche bei kleinen und großen Querformat-Handys prüfen, inklusive Display-Aussparungen.
- Belastungstest mit einer größeren Basis, mehreren eigenen Dinos und wilden Tieren in der Umgebung.
- Mindestens Android/Chrome und iOS/Safari auf echten Geräten prüfen. Ein Browsertest ohne GPU ersetzt diese Prüfung nicht.

## 22. Bewusste spätere Erweiterungen

Koop beziehungsweise Multiplayer mit autoritativem Server, Zucht und Eierausbrüten, fliegende Tiere, Wasserwelt, größere Tiergruppen, komplexere Landwirtschaft, Verteidigungsereignisse und zusätzliche Inseln. Dafür werden stabile IDs, getrennte Simulation und saubere Container-/Bauaktionen von Beginn an vorgesehen. Ein serverloser Einzelspieler-Prototyp wird dadurch nicht automatisch multiplayerfähig; Netzwerksynchronisation, Berechtigungen und Serverbetrieb wären ein eigener Entwicklungsschritt.

## 23. Technische Quellen

Die Spielgestaltung und Zielwerte oben sind eigene Planungsentscheidungen. Folgende Primärdokumentationen stützen die technischen Bausteine:

- Three.js OrthographicCamera: https://threejs.org/docs/pages/OrthographicCamera.html
- Three.js InstancedMesh: https://threejs.org/docs/pages/InstancedMesh.html
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- MDN WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- MDN Storage quotas and eviction criteria: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria

## 24. Nächster konkreter Bauschritt

Ein kleiner, schöner und auf dem Handy gemessener Küstenabschnitt mit echter Spielfigur und einem laufenden, folgenden, ausrüstbaren und reitbaren Parasaur. Dieser Abschnitt dient als gemeinsame Qualitätsreferenz für den anschließenden Survival-Ausbau.
