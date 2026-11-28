export const SPAN = 28;
export const GAP = 3.65;
export const DISPATCH = SPAN * 4;

const op = (name, kind, point, seconds, phase, from) => ({ name, kind, point, seconds, phase, from });
const bolt = (name, x, y, z, phase, sec = 1.3) => op(name, 'bolt', [x, y, z], sec, phase);
const weld = (name, x, y, z, phase, sec = 1.1) => op(name, 'weld', [x, y, z], sec, phase);
const fit = (name, point, phase, sec = 0.75) => op(name, 'fit', point, sec, phase, [point[0] - 0.96, point[1] + 0.6, point[2] + 0.13]);
const test = (name, point, phase, sec = 1.5) => op(name, 'test', point, sec, phase);

export const PAINTS = [
  { id: 'sage', name: 'Werksgrün', hex: '#73908d', num: 0x73908d, bonus: 0, cost: 0 },
  { id: 'post', name: 'Postgelb', hex: '#e2aa3b', num: 0xe2aa3b, bonus: 0.12, cost: 650 },
  { id: 'signal', name: 'Signalrot', hex: '#c84b3c', num: 0xc84b3c, bonus: 0.18, cost: 1400 },
  { id: 'cobalt', name: 'Industrieblau', hex: '#3e6f98', num: 0x3e6f98, bonus: 0.24, cost: 2800 },
  { id: 'graphite', name: 'Graphit-Metallic', hex: '#3f484b', num: 0x3f484b, bonus: 0.32, cost: 5200 },
  { id: 'pearl', name: 'Silber-Edition', hex: '#d4dad6', num: 0xd4dad6, bonus: 0.42, cost: 9500 }
];

export const HALLS = [
  {
    id: 'kompakt',
    code: 'W1',
    name: 'Werk I · V8-Klassiker',
    vehicle: 'V8-Klassiker',
    short: 'V8-Klassiker',
    desc: 'Deine erste Werkhalle: klassischer V8-Pkw vom Motorblock bis zur Endabnahme.',
    unlockCost: 0,
    power: 1,
    requires: [],
    plotPos: [-22, 0, 14],
    plotRot: 0,
    accent: 0xe36a2c,
    defaultPaint: 'sage',
    specs: [
      {
        name: 'Motorenbau', part: 'V8-Motor', open: 0, pay: 48, robot: 460,
        phases: ['Ventildeckel verschrauben', 'Öldruck prüfen'],
        ops: [
          bolt('Schraube 1', -0.78, 2.22, 0.43, 0),
          bolt('Schraube 2', 0.78, 2.22, -0.43, 0),
          bolt('Schraube 3', 0.78, 2.22, 0.43, 0),
          bolt('Schraube 4', -0.78, 2.22, -0.43, 0),
          test('Öldruck prüfen', [0.16, 2.32, 0.05], 1)
        ]
      },
      {
        name: 'Achsenbau', part: 'Fahrmodul', open: 192, pay: 100, robot: 770,
        phases: ['Achsen in die Aufnahme ziehen', 'Lager verschrauben', 'Spur prüfen'],
        ops: [
          fit('Vorderachse einsetzen', [-0.94, 1.7, 0.15], 0),
          fit('Hinterachse einsetzen', [0.94, 1.7, 0.15], 0),
          bolt('Linkes Lager', -0.9, 1.76, 0.54, 1),
          bolt('Rechtes Lager', 0.9, 1.76, 0.54, 1),
          test('Spur prüfen', [0, 1.89, 0], 2)
        ]
      },
      {
        name: 'Karosseriebau', part: 'Rohfahrzeug', open: 780, pay: 185, robot: 1300,
        phases: ['Karosserie aufsetzen', 'Schweißpunkte setzen', 'Naht prüfen'],
        ops: [
          fit('Karosserie führen', [0.15, 1.9, 0.05], 0),
          ...[-1, -0.34, 0.34, 1].map((x, j) => weld('Schweißpunkt ' + (j + 1), x, 1.66, 0.75, 1)),
          test('Naht prüfen', [0.25, 1.86, 0.68], 2)
        ]
      },
      {
        name: 'Endmontage', part: 'V8-Klassiker', open: 2100, pay: 370, robot: 2200,
        phases: ['Radsatz einsetzen', 'Radnaben sichern', 'Abnahme durchführen'],
        ops: [
          fit('Radsatz vorn', [-0.94, 1.55, 0.82], 0),
          fit('Radsatz hinten', [0.94, 1.55, 0.82], 0),
          bolt('Nabe vorn', -0.94, 1.55, 0.93, 1),
          bolt('Nabe hinten', 0.94, 1.55, 0.93, 1),
          test('Lichttest', [-1.4, 1.68, 0.54], 2),
          test('Endabnahme', [0.3, 2.37, 0.15], 2)
        ]
      }
    ]
  },
  {
    id: 'transporter',
    code: 'W2',
    name: 'Werk II · Lieferwagen',
    vehicle: 'Lieferwagen',
    short: 'Lieferwagen',
    desc: 'Nutzfahrzeuge für Stadtlogistik und Paketdienste mit Kastenaufbau.',
    unlockCost: 4200,
    power: 2,
    requires: [],
    plotPos: [22, 0, 14],
    plotRot: 0,
    accent: 0xe2aa3b,
    defaultPaint: 'post',
    specs: [
      {
        name: 'Diesel-Antrieb', part: 'Nutz-Antrieb', open: 0, pay: 155, robot: 1450,
        phases: ['Zylinderkopf sichern', 'Kompression prüfen'],
        ops: [
          bolt('Bolzen VL', -0.78, 2.22, 0.43, 0, 1.35),
          bolt('Bolzen HR', 0.78, 2.22, -0.43, 0, 1.35),
          bolt('Bolzen VR', 0.78, 2.22, 0.43, 0, 1.35),
          bolt('Bolzen HL', -0.78, 2.22, -0.43, 0, 1.35),
          test('Kompression prüfen', [0.16, 2.32, 0.05], 1, 1.5)
        ]
      },
      {
        name: 'Leiterrahmen', part: 'Transporter-Chassis', open: 950, pay: 310, robot: 2300,
        phases: ['Schwerlastachsen setzen', 'Blattfedern verschrauben', 'Achslast prüfen'],
        ops: [
          fit('Vorderachse setzen', [-0.96, 1.7, 0.15], 0),
          fit('Hinterachse setzen', [0.96, 1.7, 0.15], 0),
          bolt('Federbock vorn', -0.9, 1.76, 0.54, 1),
          bolt('Federbock hinten', 0.9, 1.76, 0.54, 1),
          test('Achslast prüfen', [0, 1.89, 0], 2)
        ]
      },
      {
        name: 'Kastenaufbau', part: 'Kasten-Rohbau', open: 2600, pay: 560, robot: 3900,
        phases: ['Kastenaufbau führen', 'Seitenwand schweißen', 'Dichtheit prüfen'],
        ops: [
          fit('Aufbau aufsetzen', [0.15, 2.1, 0.05], 0),
          ...[-1.05, -0.35, 0.35, 1.05].map((x, j) => weld('Kastennaht ' + (j + 1), x, 1.78, 0.78, 1)),
          test('Dichtheit prüfen', [0.25, 2.05, 0.68], 2)
        ]
      },
      {
        name: 'Flotten-Abnahme', part: 'Lieferwagen', open: 6200, pay: 1120, robot: 6600,
        phases: ['Lastreifen montieren', 'Radmuttern anziehen', 'TÜV-Abnahme'],
        ops: [
          fit('Lastreifen vorn', [-0.96, 1.56, 0.84], 0),
          fit('Lastreifen hinten', [0.96, 1.56, 0.84], 0),
          bolt('Radmutter vorn', -0.96, 1.56, 0.95, 1),
          bolt('Radmutter hinten', 0.96, 1.56, 0.95, 1),
          test('Bremsentest', [-1.4, 1.72, 0.54], 2),
          test('Flotten-Abnahme', [0.3, 2.55, 0.15], 2)
        ]
      }
    ]
  },
  {
    id: 'elektro',
    code: 'W3',
    name: 'Werk III · E-Sportwagen',
    vehicle: 'E-Sportwagen',
    short: 'E-Sportwagen',
    desc: 'Hochvolt-Sportcoupé mit Unterboden-Akku und Aerodynamik-Karosserie.',
    unlockCost: 16500,
    power: 4,
    requires: ['batteriewerk'],
    plotPos: [-22, 0, -14],
    plotRot: 0,
    accent: 0x3b9ab2,
    defaultPaint: 'cobalt',
    specs: [
      {
        name: 'E-Antrieb', part: 'E-Maschine', open: 0, pay: 460, robot: 4200,
        phases: ['Inverter verschrauben', 'Hochvolt-Prüfung'],
        ops: [
          bolt('Inverter 1', -0.78, 2.22, 0.43, 0, 1.35),
          bolt('Inverter 2', 0.78, 2.22, -0.43, 0, 1.35),
          bolt('Inverter 3', 0.78, 2.22, 0.43, 0, 1.35),
          bolt('Inverter 4', -0.78, 2.22, -0.43, 0, 1.35),
          test('Isolation prüfen', [0.16, 2.32, 0.05], 1, 1.55)
        ]
      },
      {
        name: 'Akku-Chassis', part: 'Skateboard-Plattform', open: 3400, pay: 880, robot: 6900,
        phases: ['Sportachsen einsetzen', 'Akkurahmen sichern', 'Zellspannung prüfen'],
        ops: [
          fit('Frontachse setzen', [-0.96, 1.7, 0.15], 0),
          fit('Heckantrieb setzen', [0.96, 1.7, 0.15], 0),
          bolt('Akkubügel links', -0.9, 1.76, 0.54, 1),
          bolt('Akkubügel rechts', 0.9, 1.76, 0.54, 1),
          test('Zellspannung prüfen', [0, 1.89, 0], 2)
        ]
      },
      {
        name: 'Aero-Karosserie', part: 'Sport-Rohbau', open: 8400, pay: 1580, robot: 11200,
        phases: ['Alu-Karosserie aufsetzen', 'Laserschweißen', 'Spaltmaß prüfen'],
        ops: [
          fit('Alu-Hülle führen', [0.15, 1.85, 0.05], 0),
          ...[-1, -0.34, 0.34, 1].map((x, j) => weld('Lasernaht ' + (j + 1), x, 1.62, 0.74, 1)),
          test('Spaltmaß prüfen', [0.25, 1.82, 0.68], 2)
        ]
      },
      {
        name: 'Hochvolt-Abnahme', part: 'E-Sportwagen', open: 19500, pay: 3150, robot: 18500,
        phases: ['Sporträder montieren', 'Zentralverschluss', 'Prüfstand'],
        ops: [
          fit('Sportrad vorn', [-0.96, 1.54, 0.84], 0),
          fit('Sportrad hinten', [0.96, 1.54, 0.84], 0),
          bolt('Verschluss vorn', -0.96, 1.54, 0.95, 1),
          bolt('Verschluss hinten', 0.96, 1.54, 0.95, 1),
          test('LED-Kalibrierung', [-1.4, 1.66, 0.54], 2),
          test('Leistungsprüfstand', [0.3, 2.28, 0.15], 2)
        ]
      }
    ]
  },
  {
    id: 'lkw',
    code: 'W4',
    name: 'Werk IV · Schwerlast-LKW',
    vehicle: 'Schwerlast-LKW',
    short: 'Schwerlast-LKW',
    desc: 'Dreiachsige Zugmaschinen für Fernverkehr, Bau und Werkslogistik.',
    unlockCost: 58000,
    power: 7,
    requires: ['presswerk', 'logistik'],
    plotPos: [22, 0, -14],
    plotRot: 0,
    accent: 0xc84b3c,
    defaultPaint: 'signal',
    specs: [
      {
        name: 'Schwerdiesel', part: 'V12-Turbodiesel', open: 0, pay: 1350, robot: 12000,
        phases: ['Turbolader verschrauben', 'Drehmoment-Test'],
        ops: [
          bolt('Kopfbolzen 1', -0.78, 2.22, 0.43, 0, 1.4),
          bolt('Kopfbolzen 2', 0.78, 2.22, -0.43, 0, 1.4),
          bolt('Kopfbolzen 3', 0.78, 2.22, 0.43, 0, 1.4),
          bolt('Kopfbolzen 4', -0.78, 2.22, -0.43, 0, 1.4),
          test('Ladedruck prüfen', [0.16, 2.32, 0.05], 1, 1.6)
        ]
      },
      {
        name: 'Doppelachse', part: 'LKW-Fahrgestell', open: 12500, pay: 2550, robot: 19500,
        phases: ['Tandemachsen führen', 'Rahmenbolzen sichern', 'Luftfederung prüfen'],
        ops: [
          fit('Lenkachse einsetzen', [-1.02, 1.72, 0.15], 0),
          fit('Tandemachse einsetzen', [0.95, 1.72, 0.15], 0),
          bolt('Träger links', -0.95, 1.78, 0.56, 1),
          bolt('Träger rechts', 0.95, 1.78, 0.56, 1),
          test('Luftfederung prüfen', [0, 1.9, 0], 2)
        ]
      },
      {
        name: 'Fahrerhaus', part: 'Zugmaschine', open: 29000, pay: 4700, robot: 32000,
        phases: ['Kabine aufsetzen', 'Rahmen schweißen', 'Statik prüfen'],
        ops: [
          fit('Fahrerhaus führen', [-0.65, 2.2, 0.05], 0),
          ...[-1.0, -0.32, 0.36, 1.04].map((x, j) => weld('Rahmennaht ' + (j + 1), x, 1.74, 0.8, 1)),
          test('Rahmenstatik prüfen', [0.25, 2.02, 0.68], 2)
        ]
      },
      {
        name: 'Schwerlast-Abnahme', part: 'Schwerlast-LKW', open: 64000, pay: 9100, robot: 54000,
        phases: ['Schwerlastreifen setzen', 'Naben sichern', 'Brems- & Drucklufttest'],
        ops: [
          fit('Vorderrad setzen', [-1.02, 1.58, 0.88], 0),
          fit('Zwillingsrad setzen', [0.96, 1.58, 0.88], 0),
          bolt('Radnabe vorn', -1.02, 1.58, 0.99, 1),
          bolt('Radnabe hinten', 0.96, 1.58, 0.99, 1),
          test('Druckluftbremse', [-1.42, 1.82, 0.54], 2),
          test('Schwerlast-Abnahme', [0.2, 2.65, 0.15], 2)
        ]
      }
    ]
  },
  {
    id: 'stadtbus',
    code: 'W5',
    name: 'Werk V · E-Stadtbus',
    vehicle: 'E-Stadtbus',
    short: 'E-Stadtbus',
    desc: 'Großserien-Elektrobus für den Nahverkehr der wachsenden Industriestadt.',
    unlockCost: 195000,
    power: 11,
    requires: ['batteriewerk', 'logistik', 'akademie'],
    plotPos: [0, 0, -34],
    plotRot: 0,
    accent: 0x3b8c66,
    defaultPaint: 'pearl',
    specs: [
      {
        name: 'Doppel-E-Antrieb', part: 'Bus-Antriebsblock', open: 0, pay: 4100, robot: 34000,
        phases: ['Antriebsbrücke sichern', 'Thermomanagement prüfen'],
        ops: [
          bolt('Brücke 1', -0.78, 2.22, 0.43, 0, 1.45),
          bolt('Brücke 2', 0.78, 2.22, -0.43, 0, 1.45),
          bolt('Brücke 3', 0.78, 2.22, 0.43, 0, 1.45),
          bolt('Brücke 4', -0.78, 2.22, -0.43, 0, 1.45),
          test('Kühlkreis prüfen', [0.16, 2.32, 0.05], 1, 1.6)
        ]
      },
      {
        name: 'Niederflur-Chassis', part: 'Bus-Plattform', open: 42000, pay: 7600, robot: 56000,
        phases: ['Niederflurachsen setzen', 'Rahmenbolzen sichern', 'Niveauregelung prüfen'],
        ops: [
          fit('Vorderachse setzen', [-1.05, 1.72, 0.15], 0),
          fit('Portalachse setzen', [1.05, 1.72, 0.15], 0),
          bolt('Aufhängung vorn', -0.96, 1.78, 0.56, 1),
          bolt('Aufhängung hinten', 0.96, 1.78, 0.56, 1),
          test('Niveauregelung', [0, 1.9, 0], 2)
        ]
      },
      {
        name: 'Panoramakabine', part: 'Bus-Aufbau', open: 95000, pay: 14200, robot: 92000,
        phases: ['Kabinenaufbau setzen', 'Dachspriegel schweißen', 'Notausstieg prüfen'],
        ops: [
          fit('Panoramakabine', [0.05, 2.22, 0.05], 0),
          ...[-1.08, -0.36, 0.36, 1.08].map((x, j) => weld('Dachnaht ' + (j + 1), x, 1.88, 0.8, 1)),
          test('Türsensorik prüfen', [0.25, 2.1, 0.68], 2)
        ]
      },
      {
        name: 'ÖPNV-Zulassung', part: 'E-Stadtbus', open: 185000, pay: 27500, robot: 150000,
        phases: ['Radsatz montieren', 'Radnaben sichern', 'Stadtverkehr-Abnahme'],
        ops: [
          fit('Busrad vorn', [-1.05, 1.56, 0.88], 0),
          fit('Busrad hinten', [1.05, 1.56, 0.88], 0),
          bolt('Radnabe vorn', -1.05, 1.56, 0.99, 1),
          bolt('Radnabe hinten', 1.05, 1.56, 0.99, 1),
          test('Fahrgastsystem', [-1.4, 1.95, 0.54], 2),
          test('ÖPNV-Zulassung', [0.3, 2.68, 0.15], 2)
        ]
      }
    ]
  }
];

export const BUILDINGS = [
  {
    id: 'kraftwerk',
    name: 'Energie- & Solarwerk',
    short: 'Kraftwerk',
    category: 'Infrastruktur',
    desc: 'Liefert Strom (+8 MW/Stufe) für neue Werkhallen und Roboterarme. Ohne genug Strom laufen Anlagen gedrosselt.',
    baseCost: 1600,
    mult: 2.25,
    max: 5,
    plotPos: [-44, 0, -14],
    accent: 0xe4a743,
    effect: lv => '+' + (lv * 8) + ' MW Netzkapazität'
  },
  {
    id: 'presswerk',
    name: 'Presswerk & Gießerei',
    short: 'Presswerk',
    category: 'Zulieferer',
    desc: 'Presst Bleche und gießt Motorblöcke vor Ort. Beschleunigt Förderbänder (+15 %/Stufe) und erhöht den Fahrzeugwert (+12 %/Stufe).',
    baseCost: 2200,
    mult: 2.3,
    max: 5,
    plotPos: [-44, 0, 14],
    accent: 0xc85c32,
    effect: lv => '+' + (lv * 12) + ' % Wert · +' + (lv * 15) + ' % Bandtempo'
  },
  {
    id: 'lackiererei',
    name: 'Lackierstraße',
    short: 'Lackiererei',
    category: 'Veredelung',
    desc: 'Schaltet individuelle Lackfarben pro Werkhalle frei und steigert den Verkaufswert aller Fahrzeuge (+18 %/Stufe).',
    baseCost: 3400,
    mult: 2.35,
    max: 5,
    plotPos: [0, 0, 14],
    accent: 0xd97d36,
    effect: lv => '+' + (lv * 18) + ' % Lack-Erlös · Farbwahl aktiv'
  },
  {
    id: 'wohnviertel',
    name: 'Werkssiedlung',
    short: 'Siedlung',
    category: 'Stadtbau',
    desc: 'Wohnungen, Parks und Nahversorgung für deine Belegschaft. Senkt Ausbaukosten (-5 %/Stufe) und bringt Einwohner & Stadtbonus.',
    baseCost: 4800,
    mult: 2.4,
    max: 5,
    plotPos: [-44, 0, -34],
    accent: 0x6c9a7a,
    effect: lv => (lv * 120) + ' Einwohner · -' + (lv * 5) + ' % Ausbaukosten'
  },
  {
    id: 'akademie',
    name: 'Konstruktionsbüro',
    short: 'Akademie',
    category: 'Forschung',
    desc: 'Bildet Fachkräfte aus (+15 %/Stufe Handwerker- & Roboter-Tempo) und schaltet Stadt-Forschungen frei.',
    baseCost: 6200,
    mult: 2.45,
    max: 5,
    plotPos: [0, 0, -14],
    accent: 0x4b7f98,
    effect: lv => '+' + (lv * 15) + ' % Team- & Roboter-Tempo'
  },
  {
    id: 'logistik',
    name: 'Logistik- & Güterbahnhof',
    short: 'Bahnhof',
    category: 'Logistik',
    desc: 'Autotransporter und Güterzug verbinden dein Werk mit dem Fernnetz (+20 %/Stufe Versandprämie, Auto-Ersatzteilverkauf ab Stufe 2).',
    baseCost: 8500,
    mult: 2.5,
    max: 5,
    plotPos: [44, 0, -14],
    accent: 0x5c6e78,
    effect: lv => '+' + (lv * 20) + ' % Versandprämie' + (lv >= 2 ? ' · Auto-Ausleitung' : '')
  },
  {
    id: 'batteriewerk',
    name: 'Batterie- & Elektronikwerk',
    short: 'Batteriewerk',
    category: 'Zulieferer',
    desc: 'Fertigt Hochvolt-Akkus und Steuergeräte. Voraussetzung für E-Sportwagen und E-Stadtbus (+16 %/Stufe auf alle Werke).',
    baseCost: 11500,
    mult: 2.55,
    max: 5,
    plotPos: [44, 0, 14],
    accent: 0x2e88a6,
    effect: lv => '+' + (lv * 16) + ' % Hightech-Prämie'
  }
];

export const RESEARCH = [
  {
    id: 'blueprints',
    name: 'Takt-Vorlagen (Blaupausen)',
    desc: 'Übertrage ein aufgenommenes Roboter-Programm per Klick auf baugleiche Stationen in anderen Werkhallen.',
    cost: 3200,
    requires: 'akademie'
  },
  {
    id: 'laserGauge',
    name: 'Präzisions-Sensorik',
    desc: 'Verbreitert das grüne Prüffenster deutlich und verdoppelt den Präzisions-Bonus bei genauen Messungen.',
    cost: 4800,
    requires: 'akademie'
  },
  {
    id: 'multiGripper',
    name: 'Mehrfach-Greifer',
    desc: 'Alle Industrieroboter in deiner gesamten Stadt arbeiten 28 % schneller.',
    cost: 12000,
    requires: 'akademie'
  },
  {
    id: 'syncDrive',
    name: 'Synchron-Fördernetz',
    desc: 'Erhöht die Förderbandgeschwindigkeit in allen Hallen um 30 % und gibt +1 Pufferplatz überall.',
    cost: 22000,
    requires: 'presswerk'
  },
  {
    id: 'railLink',
    name: 'Schwerlast-Gleisanschluss',
    desc: 'Steigert den Verkaufserlös aller ausgelieferten Fahrzeuge um 30 %.',
    cost: 48000,
    requires: 'logistik'
  },
  {
    id: 'smartCity',
    name: 'Autonome Industriestadt',
    desc: 'Vernetzt alle Werke, reduziert den Stromverbrauch um 25 % und erhöht den Gesamtumsatz um 35 %.',
    cost: 140000,
    requires: 'batteriewerk'
  }
];

export const PERSONAL = {
  pace: ['Laufschuhe', 'Schneller durch die Werkhalle', 65],
  skill: ['Werkzeugführung', 'Mehr Tempo bei Handarbeit', 85],
  bonus: ['Meisterbrief', 'Höhere Prämie für eigene Montage', 150]
};

export const STATION_UP = {
  tool: ['Werkzeug', 'Schneller bearbeiten', 1.7, 6],
  quality: ['Qualität', 'Höhere Stückprämie', 2.2, 6],
  belt: ['Bandantrieb', 'Schneller transportieren', 1.65, 5],
  buffer: ['Staustrecke', 'Ein zusätzlicher Pufferplatz', 1.45, 3],
  staff: ['Handwerker', 'Hilft nach deinem ersten Handgriff', 3.1, 4]
};

export const CITY_TIERS = [
  { minScore: 0, name: 'Einzelwerkstatt', desc: 'Ein erstes Fahrzeug am Band' },
  { minScore: 3, name: 'Autowerk', desc: 'Mehrere Stationen & erste Zulieferer' },
  { minScore: 8, name: 'Gewerbepark', desc: 'Vernetzte Hallen & eigene Flotten' },
  { minScore: 16, name: 'Industriekomplex', desc: 'Mehrere Fahrzeugklassen & Bahnanbindung' },
  { minScore: 26, name: 'Industriestadt', desc: 'Voll ausgebaute Automobil-Metropole' }
];
