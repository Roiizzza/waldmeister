# SKYTAMER – Äther-Update 0.4

Three.js-Einzelspieler-Prototyp mit sechs schwebenden Inseln. Fortschritt wird automatisch im Browser gespeichert. Alte Spielstände werden übernommen.

## Start
Auf der Spielwiese: https://roiizzza.github.io/waldmeister/skytamer/
Lokal: `START_WINDOWS.bat` (Node.js LTS oder Python 3) oder `node server.mjs` und http://localhost:3000 öffnen. Keine Paketinstallation nötig; Three.js liegt mit MIT-Lizenz in vendor/. WebGL 2 erforderlich. Nicht per Doppelklick auf index.html starten.

## Steuerung
- WASD laufen, Shift sprinten, Maus ziehen/Klick beim Einstieg für Kamera, Esc Maus lösen/Menü schließen.
- E interagieren; zum Ressourcensammeln halten. Linksklick / X angreifen. Rechte Maustaste oder B: Schildblock. V ausweichen, nach Aviator 3 auch Luftmanöver.
- I / Tab: Äther-Menü. K: Crafting. 1–8: belegbare Schnellplätze; Belegung über Itemdetails im Inventar.
- G: Gleiter. T: Enterhaken. Leertaste steigen/springen, Strg/C während des Fluges sinken, F am Boden absteigen.
- C öffnet Begleiter. R ruft den nächstgelegenen gezähmten Falken innerhalb der Rufreichweite.
- J: Widder-Kopfstoß. N: Stein-/Narkosepfeile umschalten. H: Verband. Q: Beeren essen.
- Im Baumodus: E platzieren, Z drehen, Esc abbrechen. Touchknöpfe unterstützen die wichtigsten Funktionen, Querformat empfohlen.

## Einstieg und Progression
Holz, Stein, Beeren und Flachs sammeln, Axt und Spitzhacke herstellen. Felsen liefern Feuerstein, dunkle Sträucher Narkosebeeren. Kleine Eisenadern liegen auch auf der Startinsel. Speer, Lagerfeuer und Bett sind ein guter nächster Schritt. Mit 100 Erfahrungspunkten erhältst du jeweils einen Skillpunkt. Sammeln, Handwerk, Bauen, Zähmen und besiegte Gegner geben Erfahrung.

### Zähmen und Tierrollen
Eine Betäubungskeule verursacht wenig Schaden und 38 Torpor; drei Treffer machen kleine Tiere bewusstlos. Der Bogen kann Narkosepfeile verschießen. Bei Bewusstlosigkeit öffnet sich das Tierinventar. Futter übertragen und das Menü schließen, damit Zeit und Zähmung weiterlaufen. Alle vier Sekunden wird ein Futter verbraucht; Narkosebeeren im Tierinventar verhindern frühzeitiges Aufwachen. Ohne Futter wacht ein Tier wieder auf. Der Fortschritt wird gespeichert, läuft aber nicht offline weiter.

- Stein-Widder: Beeren. J oder Kopfstoß-Befehl sammelt 8 Stein/Erz pro Treffer in sein Inventar, doppelt so viel wie eine Spitzhacke.
- Sturm-Falke: Fleisch, gebratenes Fleisch oder langsamer Beeren. Zum Reiten benötigst du Tierfreund (Tamer 1) und den Falkensattel: 6 Leder, 3 Barren, 6 Fasern an einer Werkbank. E am Tier, dann Aufsitzen.
- Klippen-Raptor: Fleisch. Wild kündigt er Sprungattacken an. Gezähmt kann er folgen, bleiben und Gegner angreifen. Landtiere bleiben auf begehbarem Boden; sie teleportieren nicht zwischen Inseln.

### Äther-Menü, Gewicht und Skills
Das Menü kombiniert 40 Rucksackplätze (5 × 8), Itemgewichte, Ausrüstung, Charaktervorschau, Baupläne und neun Skillknoten. Auf kleinen Displays schalten die Reiter zwischen den Bereichen um. Materialien stapeln bis 50, Ausrüstung belegt je einen Platz. Über 150 kg Grundtraglast wirst du langsamer, oberhalb 125 % Traglast funktioniert der Gleiter nicht. Ausrüstung und Gewicht lassen sich in Kisten auslagern.

Herstellen, ×5 und Alles starten eine Fortschrittsanzeige. Jeder fertige Gegenstand kostet seine Materialien; Abbrechen erhält fertige Gegenstände und lässt ungenutztes Material unangetastet. Werkzeuge nutzen sich ab und sind bei 0 % gesperrt. Reparaturen stehen in den Itemdetails.

- Tamer: schneller zähmen/Sattel-Bauplan, größere Rufreichweite, stärkere Raptoren.
- Aviator: sparsamere Flugausdauer, Armbrust-Bauplan und schnellerer Enterhaken, Luftmanöver.
- Survivor: mehr Leben/Traglast, Metallwand-Bauplan/Kälteresistenz, zusätzlicher Sammelertrag/weitere Traglast.

### Bauen und Lager
Fundamente, Wände, Brücken und Rampen rasten im 5-m-Raster ein; Rampen überwinden 2,5 m Höhe. Brücken können mit angrenzenden Bauteilen über den Abgrund erweitert werden. Die Flächen sind begehbar, Wände blockieren den Spieler. Werkbank, Kiste, Lagerfeuer und Bett lassen sich auf dem Boden bzw. Plattformen platzieren. E am Bett aktiviert es als Respawnpunkt. Holzkisten haben 24 Plätze, Tierinventare 16; Transfers funktionieren einzeln, in Mengen oder mit allen passenden Materialien. Kisteninhalte bleiben gespeichert.

### Sky-Survival und Kämpfe
Der Enterhaken zieht dich über eine nahe, anvisierte Inselkante auf festen Boden, auch bei leerer Ausdauer. Reichweite 60 m, kurze Abklingzeit. Höhere Inseln sind kalt; Lederweste, warme Mahlzeiten, Feuer und Skills schützen. Windböen versetzen Gleiter und Reittiere. Beim Tod erscheint die Inventar-Boje an der zuletzt überflogenen Insel; Ausrüstung bleibt beim Spieler. Bereits verlorene Materialien gehen auch bei erneutem Tod nicht verloren.

18 Gegner (Wölfe, Krabbler, Wächter und fliegende Wolkenräuber) sowie wilde Raptoren. Angriffe werden angekündigt. Ein Bogen trifft über physische Projektile, die Armbrust verursacht mehr Schaden und Torpor. Gegner hinterlassen Beute, besiegte Gegner bleiben besiegt. Die drei Zitadellen-Wächter müssen vor dem Bergen des Kerns fallen. Menüs pausieren Bewegung, Wetter, Survival und Zähmzeit; Herstellung läuft während des geöffneten Menüs weiter.

## Gestaltung und Prüfgrenzen
Die vorgelegten Bilder dienen als Stilreferenz: warmer facettierter Boden, breite Baumkronen, blaue Falken, Lederkleidung, leuchtende Aufwinde und ein blau-goldenes Fantasy-Menü. Alle Modelle sind prozedural erzeugt, keine ausgeschnittenen Konzeptbilder und keine Marketplace-Assets. Der Prototyp erreicht nicht die Detailqualität der gemalten Referenzen. Kein Multiplayer, keine Zucht und keine vollständigen Boss-/Technologiezeitalter.

Spielzustände, Herstellung, Treffer, Zähmung, Bauflächen, Rettung, Skills, Lager und Speicherstand-Neuladen wurden ohne WebGL-Renderer geprüft. Die Menüs wurden separat im Browser bedient. Die Entwicklungs-Vorschau hat WebGL deaktiviert; vollständige GPU-, Shader- und 3D-Grafikprüfung bleibt deshalb eingeschränkt.
