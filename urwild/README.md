# URWILD 0.1 – Die Insel gehört dir

Ein originales, stilisiertes Dinosaurier-Survival für den Browser. Singleplayer, Querformat auf dem Handy und zusätzlich WASD am PC. Lokale Three.js r170-Abhängigkeiten, keine Accounts, keine externen Modelle oder kostenpflichtigen Dienste.

## Spielen

`https://roiizzza.github.io/waldmeister/urwild/`

Links bewegen (freier Joystick), rechts sammeln/angreifen, interagieren und ausweichen. Ganz auslenken sprintet. Rechts oben: Rucksack, Herstellung, Bau, Forschung, Karte, Pause. Dino antippen oder in seiner Nähe interagieren. Menüs und Hochformat pausieren die Simulation.

PC: WASD/Pfeile bewegen, F/Leertaste Aktion, E Interaktion, Shift ausweichen, I Inventar, C Herstellung, B Bau, M Karte, J Gefährten, 1–6 Schnellleiste, Escape Pause. Beim Bauen in die Welt tippen, Drehen/Platzieren nutzen.

## Enthalten

- Zusammenhängende 768 × 768 m Insel mit Küste, Grünland, Dschungel, Hochland, Flussfurt und nachgeladenen 64-m-Geländestücken.
- Animierte originale GLB-Modelle für Mensch, Dodo, Parasaur, Triceratops, Raptor, Ankylosaurus, Stegosaurus und Tyrannosaurus.
- Ressourcen und nachwachsende Vorkommen, Herstellung, Stufen/Wissenspunkte, Werkzeuge, Waffen, Nahrung und Rüstung.
- Hunger, Durst, Ausdauer, Traglast, Nah-/Fernkampf, Betäubungspfeile, Ausweichen, Tod mit Beutel und Rückkehr am Bett.
- Passive Beerenzähmung und Betäubungszähmung mit Futter und Schlafbeeren. Drei aktive Begleiter, Befehle, Futtervorräte, sichtbare Sättel und Taschen, Reiten.
- Holz- und Steinbauteile mit Raster, Fundamentprüfung, Türen, Dächer, Lagerfeuer, Werkbank, Steinofen, Kiste, Bett, Gehege, Futtertrog und Beet. Bauvorschau, Drehen, Rückgängig und Abbau.
- Sechsteiliger Einstieg bis zum ersten gerittenen Parasaur und Lager, Minikarte und Wegpunkte.
- Tag-/Nachtwechsel, Partikel, sichtbare Werkzeuge und Pfeile, synthetisierte Spielklänge, sparsame Grafikoption.
- Eigenes IndexedDB-Save `urwild-world-v1`, automatische Sicherung und Backup, JSON-Export/Import. Bestehende Spielstände anderer Spiele werden nicht verändert.

## Grenzen dieser ersten Fassung

Kein Multiplayer, kein Schwimmen/Tauchen, keine Zucht, kein komplexes Stromnetz und keine ARK-Assets. Die sieben Arten haben vereinfachte KI und ein gemeinsames Grundsystem. Der Tag-/Nachtzyklus und die Landwirtschaft sind bewusst kompakt. Das geplante volle Langzeitspiel bleibt weitere Entwicklungsarbeit.

## Lokal starten und prüfen

Aus dem Repository-Root mit einem statischen HTTP-Server starten (ES-Module und GLBs nicht über `file://` öffnen). Benötigt WebGL 2. Ohne WebGL erscheint eine klare Kompatibilitätsmeldung, keine Ersatzsimulation.

```sh
node --test urwild/tests/*.mjs
```

Die zehn Tests prüfen Ressourcen-/Tutorialfortschritt, beide Zähmarten, Reiten, Baukollisionen und Fundamentstützen, atomare Herstellung/Transfers, Tod/Beutel, Importvalidierung, deterministische Welt, alle realen GLB-Dateien/Animationen und die echte Three.js-Szenengraph-Erstellung. Der Szenentest injiziert ausschließlich einen Renderer-Adapter; er prüft keine GPU und keine Bildrate.

Der Cloud-Browsertest wurde in dieser Sitzung durch das automatische Nutzungslimit blockiert. Darstellung, Touchgefühl und Leistung sind daher noch auf einem echten Handy zu prüfen; 30/60 FPS werden nicht als gemessen behauptet.

## Aufbau und Quellen

- `engine.mjs`, `terrain.mjs`, `navigation.mjs`, `state.mjs`: Simulation und Daten.
- `world.mjs`: echte Three.js-3D-Welt, Instancing, GLB-Animationen und Kamera.
- `app.mjs`, `style.css`: mobile Oberfläche/Steuerung; `storage.mjs`: isolierte Spielstände.
- `art-source/generate_creatures.py`: Originalmodelle reproduzierbar mit Blender 4.3; erzeugt auch bearbeitbare `.blend`-Dateien. `assets/creature-metadata.json` enthält Maßstab, Clips und Anker.
- `docs/Spielkonzept.md`: vollständiger ursprünglicher Bauplan; enthält auch später geplante Systeme.
- `vendor/`: gepinntes Three.js r170, GLTFLoader und BufferGeometryUtils aus dem offiziellen Three.js-Projekt, MIT-Lizenz in `THREE-LICENSE.txt`.

Die Konzeptbilder dienten als Gestaltungsvorlage. Sie werden nicht als Screenshots der laufenden Implementierung ausgegeben.
