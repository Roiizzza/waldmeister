export const ITEMS={
 wood:{name:'Holz',icon:'🪵',desc:'Baumstämme für Werkzeuge, Waffen und dein Lager.'},stone:{name:'Stein',icon:'🪨',desc:'Felsbrocken. Mit einer Spitzhacke besonders ergiebig.'},berry:{name:'Beeren',icon:'🫐',desc:'Essen oder Falken füttern. +18 Nahrung, +4 Wasser.'},crystal:{name:'Aetherit',icon:'💎',desc:'Leuchtende Kristalle für die stärkste Waffe.'},fiber:{name:'Fasern',icon:'🌿',desc:'Aus Flachs und Bäumen. Für Verbände und Kleidung.'},flint:{name:'Feuerstein',icon:'◆',desc:'Nebenprodukt aus Felsen und Erzadern.'},ore:{name:'Eisenerz',icon:'⛰',desc:'Rostbraune Adern auf höheren Inseln. Am Lagerfeuer schmelzen.'},ingot:{name:'Eisenbarren',icon:'▰',desc:'Geschmolzenes Erz für fortgeschrittene Ausrüstung.'},hide:{name:'Leder',icon:'◈',desc:'Beute von Klippenwölfen. Schutzkleidung und Schilde.'},meat:{name:'Rohes Fleisch',icon:'🥩',desc:'Am Lagerfeuer zu einer stärkenden Mahlzeit verarbeiten.'},cooked:{name:'Gebratenes Fleisch',icon:'🍖',desc:'+35 Nahrung und +15 Gesundheit.'},bandage:{name:'Verband',icon:'✚',desc:'Heilt 30 Gesundheit. Taste H oder im Rucksack benutzen.'},
 fists:{name:'Fäuste',icon:'✊',desc:'Besser als nichts. 7 Schaden.',damage:7,range:3,cooldown:.5,stamina:4},axe:{name:'Steinaxt',icon:'🪓',desc:'Holzernte ×2. 15 Schaden.',damage:15,range:3.8,cooldown:.65,stamina:8},pick:{name:'Steinspitzhacke',icon:'⛏',desc:'Stein, Erz und Kristalle ×2. 12 Schaden.',damage:12,range:3.8,cooldown:.7,stamina:8},spear:{name:'Jägerspeer',icon:'⚔',desc:'Große Reichweite. 24 Schaden.',damage:24,range:5.5,cooldown:.58,stamina:11},sword:{name:'Eisenschwert',icon:'⚔',desc:'Schnelle Hiebe. 36 Schaden.',damage:36,range:4.6,cooldown:.42,stamina:12},aetherblade:{name:'Ätherklinge',icon:'✦',desc:'Kristallenergie. 52 Schaden.',damage:52,range:5.2,cooldown:.46,stamina:14},armor:{name:'Lederweste',icon:'◉',desc:'Verringert erlittenen Schaden um 30 %.'},shield:{name:'Holzschild',icon:'🛡',desc:'Blocken reduziert Schaden um 70 % und kostet Ausdauer.'},saddle:{name:'Falkensattel',icon:'🦅',desc:'Erlaubt dir, gezähmte Sturm-Falken zu reiten.'},foundation:{name:'Holzfundament',icon:'▦',desc:'Das erste Bauteil deines Himmelslagers.'},wall:{name:'Holzwand',icon:'▥',desc:'Baue dein Lager im 5-Meter-Raster aus.'},fire:{name:'Lagerfeuer',icon:'🔥',desc:'Koch- und Schmelzstelle. Regeneriert Gesundheit in der Nähe.'},bed:{name:'Bett',icon:'▰',desc:'Dein Rückkehrpunkt nach einem Absturz oder verlorenen Kampf.'}
};
export const RECIPES=[
 {id:'axe',cat:'Werkzeuge',cost:{wood:5,stone:3},gear:true},
 {id:'pick',cat:'Werkzeuge',cost:{wood:5,stone:5,fiber:2},gear:true},
 {id:'spear',cat:'Waffen',cost:{wood:6,flint:2,fiber:3},gear:true},
 {id:'sword',cat:'Waffen',cost:{ingot:4,wood:4,hide:2},gear:true},
 {id:'aetherblade',cat:'Waffen',cost:{ingot:6,crystal:12,hide:4},gear:true},
 {id:'armor',cat:'Ausrüstung',cost:{hide:4,fiber:8},gear:true},
 {id:'shield',cat:'Ausrüstung',cost:{wood:10,hide:2},gear:true},
 {id:'saddle',cat:'Ausrüstung',cost:{wood:8,berry:6},gear:true},
 {id:'bandage',cat:'Versorgung',cost:{fiber:5,berry:2}},
 {id:'cooked',cat:'Versorgung',cost:{meat:1,wood:1},station:'fire'},
 {id:'ingot',cat:'Versorgung',cost:{ore:2,wood:2},station:'fire'},
 ...[{id:'foundation',cost:{wood:6,stone:3}},{id:'wall',cost:{wood:4}},{id:'fire',cost:{wood:5,stone:4}},{id:'bed',cost:{wood:8,berry:3}}].map(r=>({...r,cat:'Bauen',build:true}))
];
export const canPay=(inventory,cost)=>Object.entries(cost).every(([k,n])=>(inventory[k]||0)>=n);
export function pay(inventory,cost){if(!canPay(inventory,cost))return false;for(const[k,n]of Object.entries(cost))inventory[k]-=n;return true}
export function migrate(s){s.version=2;s.gear={fists:true,...s.gear,axe:!!(s.axe||s.gear?.axe),saddle:!!(s.saddle||s.gear?.saddle)};s.equipped=s.equipped&&s.gear[s.equipped]&&ITEMS[s.equipped]?.damage?s.equipped:s.axe?'axe':'fists';s.xp=s.xp||0;s.kills=s.kills||0;s.defeated=s.defeated||[];s.nodeHealth=s.nodeHealth||{};s.loots=s.loots||[];for(const id of ['wood','stone','berry','crystal','fiber','flint','ore','ingot','hide','meat','cooked','bandage'])s.inv[id]=Number.isFinite(s.inv[id])?Math.max(0,s.inv[id]):0;return s}
