# SKYTAMER – Three.js-Prototyp 0.1

## Start auf Windows
ZIP vollständig entpacken. START_WINDOWS.bat doppelklicken. Benötigt Node.js (LTS) oder Python 3. Das Konsolenfenster geöffnet lassen. Falls der Browser vor dem Server startet, Seite einmal neu laden.

Alternativ im Projektordner `node server.mjs` starten und http://localhost:3000 in Chrome/Edge öffnen. Keine Paketinstallation erforderlich, Three.js und Lizenz liegen lokal in vendor/. Nicht per Doppelklick auf index.html starten (ES-Module benötigen HTTP).

## Spielen
WASD laufen, Shift sprinten, Leertaste springen. Maus ziehen zum Umschauen. Beim Start kann der Browser die Maus fangen; Esc löst sie. E interagiert mit der nächsten Ressource/Kreatur. 2 öffnet Handwerk, 3 Bauen. Beeren essen mit Q. Bauteile mit E auf dem Raster platzieren, Esc bricht ab. G öffnet den Gleiter. R ruft einen gezähmten Falken, auch als Rettung beim Fallen.

Falke: dreimal je zwei Beeren füttern, Sattel herstellen, E zum Aufsteigen. WASD fliegen, Leertaste halten zum Steigen, Strg/C sinken. F zum Absteigen dicht über einer Insel. Leuchtende grüne Aufwinde füllen die Ausdauer. Bei leerer Ausdauer sinkt der Falke kontrolliert; über Giftnebel wird der Spieler zurückgesetzt, das Tier bleibt erhalten.

Folge den acht Expeditionszielen bis zur höchsten Insel. Bei Tod wird das Inventar an der nächstgelegenen Insel als leuchtende Boje gesichert. Respawn am ersten Bett oder am Start. Automatisches Speichern im Browser alle fünf Sekunden; Hilfe enthält einen Neustartknopf. Fortschritt ist pro Browser und Serveradresse getrennt. Mobile Touch-Bedienung mit Stick, E und Steigen/Sinken; Querformat empfohlen.

## Umfang und Grenzen
Sechs schwebende Inseln, Ressourcenabbau, Steinaxt, Sattel, vier Bauteile, Hunger/Durst, Quelle, zwei zähmbare Falken, Flugausdauer, Aufwinde, Gleiter, Rettungsruf, Respawn/Boje und Abschlussartefakt. Third-Person, lokaler Einzelspieler.

Stilisierte, prozedural erzeugte Platzhaltermodelle. Keine Marketplace-Assets enthalten. Dieses erste technische Spielgerüst setzt nicht das ganze Design um: keine Zucht, Kämpfe, Bosse, Multiplayer, Enterhaken oder vier vollständigen Technologiezeitalter. Bauen nutzt ein einfaches Raster, noch keine Statik und keine betretbaren Innenräume. Alle Inseln lassen sich mit dem Starter-Falken erreichen; die späteren Kreaturen-/Höhenfreischaltungen sind noch nicht umgesetzt.

## Dateien
- game.js: Welt, Bewegung, Flug, Ressourcen, Crafting, Bauen, Speicherstand
- style.css / index.html: Oberfläche und Touchsteuerung
- vendor/three.module.js: Three.js r170, MIT-Lizenz daneben
- server.mjs: lokaler Node-Server ohne externe Pakete
- Spielkonzept.md: bereitgestelltes Originalkonzept

WebGL 2 erforderlich. Der integrierte Vorschau-Browser der Entwicklungsumgebung hat WebGL deaktiviert, daher war dort keine grafische Spielprüfung möglich. JavaScript und Spielzustandsübergänge wurden separat geprüft.
