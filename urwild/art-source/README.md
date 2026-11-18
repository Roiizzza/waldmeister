# Originale URWILD-Modelle

`generate_creatures.py` mit Blender 4.3.2 ausführen: `blender -b -t 4 -P generate_creatures.py`.
Erzeugt die acht `.glb`-Modelle, Metadaten und bearbeitbare `.blend`-Dateien. Alle Formen, Materialien und Animationen sind original in diesem Skript modelliert. Keine externen Texturen oder Figuren.

Y ist oben, Vorderseite -Z. Die interne Wurzelrotation beibehalten, nur einen äußeren Wrapper drehen. Hierarchische Knotenanimation ohne Skinning: Idle, Walk, Run, Attack, Eat, KO; Mensch zusätzlich Ride. KO und Ride einmal abspielen und letzte Pose halten.

Saddle und Bags sind bei reitbaren Arten sichtbare Ausrüstungsgruppen. Dodo hat keine Sattelausrüstung. RiderSeat ist der Sitzanker. Die Hüfte des Menschen liegt bei 0,802 m; diesen Offset bei der Reitposition abziehen. HandAnchor ist der Werkzeuganker.

~2,2 MB GLBs insgesamt, 3.376–12.272 Dreiecke je Dino, Mensch 4.880. Tatsächliche Maße und Clips in `../assets/creature-metadata.json`. Die Tests laden die ausgelieferten GLBs mit dem echten GLTFLoader und berechnen die animierten Matrizen.
