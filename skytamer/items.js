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

Object.assign(ITEMS,{
 narco:{name:'Narkosebeeren',icon:'●',desc:'Dunkle Beeren aus Büschen. Für Betäubungswaffen; im Tierinventar halten sie die Betäubung aufrecht.'},
 club:{name:'Betäubungskeule',icon:'♟',desc:'3 Schaden, 38 Betäubung. Drei Treffer legen kleine Kreaturen schlafen.',damage:3,torpor:38,range:4.3,cooldown:.65,stamina:8},
 bow:{name:'Jagdbogen',icon:'🏹',desc:'Fernkampf bis 85 m. N wechselt Stein- und Narkosepfeile.',damage:23,range:85,cooldown:.75,stamina:6,ranged:true},
 arrow:{name:'Steinpfeile',icon:'➶',desc:'Munition für den Bogen. 23 Schaden.'},tranq:{name:'Narkosepfeile',icon:'➷',desc:'3 Schaden und 45 Betäubung. Bogen mit N auf Narkosepfeile umstellen.'},
 grapple:{name:'Enterhaken',icon:'⚓',desc:'T zieht dich an eine anvisierte Inselkante bis 60 m Entfernung. Keine Ausdauer nötig, 4 s Abklingzeit.',damage:1,range:60,cooldown:1,stamina:0},
 bridge:{name:'Brückensegment',icon:'═',desc:'Begehbares 5-m-Segment. Rastet an Fundamenten, Rampen und weiteren Brücken ein.'},
 ramp:{name:'Holzrampe',icon:'◩',desc:'Begehbare Rampe. Überwindet pro Segment 2,5 m Höhe. Z dreht die Baurichtung.'},
 smithy:{name:'Werkbank',icon:'⚒',desc:'Hier stellst du Sättel und Metallwaffen her.'},
 chest:{name:'Holzkiste',icon:'▣',desc:'24 Lagerplätze für Stapel mit bis zu 50 Materialien. E öffnet das Lager.'}
});
ITEMS.saddle.desc='Leder und Eisen an der Werkbank verarbeiten. Ein gezähmter Falke braucht diesen Sattel zum Reiten.';
ITEMS.cooked.desc='+35 Nahrung, +15 Gesundheit und 90 Sekunden Kälteschutz.';
ITEMS.armor.desc='30 % weniger Schaden und Schutz gegen die Kälte der höchsten Inseln.';
for(const r of RECIPES){if(r.id==='saddle'){r.cost={hide:6,ingot:3,fiber:6};r.station='smithy'}if(['sword','aetherblade'].includes(r.id))r.station='smithy'}
RECIPES.push(
 {id:'club',cat:'Waffen',cost:{wood:6,narco:4},gear:true},
 {id:'bow',cat:'Waffen',cost:{wood:8,fiber:8,hide:2},gear:true},
 {id:'arrow',cat:'Versorgung',cost:{wood:2,flint:2,fiber:1},amount:5},
 {id:'tranq',cat:'Versorgung',cost:{arrow:5,narco:5},amount:5},
 {id:'grapple',cat:'Werkzeuge',cost:{wood:5,fiber:10,ingot:2},gear:true},
 ...[{id:'bridge',cost:{wood:8,fiber:2}},{id:'ramp',cost:{wood:8,stone:2}},{id:'smithy',cost:{wood:12,stone:8,ingot:2}},{id:'chest',cost:{wood:8,fiber:3}}].map(r=>({...r,cat:'Bauen',build:true}))
);
export const STACK_SIZE=50,PLAYER_SLOTS=40,CONTAINER_SLOTS=24;
export const usedSlots=(inv,gear={})=>Object.entries(inv).reduce((n,[id,v])=>n+Math.ceil(Math.max(0,v||0)/(RECIPES.find(r=>r.id===id)?.gear?1:STACK_SIZE)),0)+Object.entries(gear).filter(([k,v])=>k!=='fists'&&v).length;
export function fits(inv,items,capacity=PLAYER_SLOTS,gear={}){const next={...inv};for(const[k,v]of Object.entries(items))next[k]=(next[k]||0)+v;return usedSlots(next,gear)<=capacity}
export function transfer(source,target,id,count,capacity=PLAYER_SLOTS,gear={}){let n=Math.min(Math.max(0,Math.floor(count)),source[id]||0);while(n>0&&!fits(target,{[id]:n},capacity,gear))n--;if(!n)return 0;source[id]-=n;target[id]=(target[id]||0)+n;return n}
export function migrateExpedition(s){s.version=3;for(const id of ['narco','arrow','tranq'])s.inv[id]=Math.max(0,s.inv[id]||0);s.creatures=s.creatures||[];s.warmth=Math.max(0,s.warmth||0);s.cold=Math.max(0,s.cold||0);s.ammoMode=s.ammoMode==='tranq'?'tranq':'arrow';s.lastSafe=s.lastSafe||{island:0,pos:[0,120,8]};s.creatureSelected=s.creatureSelected||'hawk0';return s}

Object.assign(ITEMS,{
 glider:{name:'Gleiter-Umhang',icon:'◈',desc:'Dein Startgleiter. G öffnet ihn in der Luft. Traglast und Ausdauer begrenzen den Flug.',weight:2},
 helmet:{name:'Lederkappe',icon:'⛑',desc:'Kopfschutz. Verringert eingehenden Schaden zusätzlich um 5 %.',weight:1},
 gloves:{name:'Arbeitshandschuhe',icon:'✋',desc:'Handschutz. +2 Nahkampfschaden.',weight:.5},
 pants:{name:'Gefütterte Beinkleider',icon:'◧',desc:'Zusätzliche 5 °C Kälteresistenz.',weight:1.5},
 boots:{name:'Fliegerstiefel',icon:'◒',desc:'Sprinten verbraucht 10 % weniger Ausdauer.',weight:1},
 crossbow:{name:'Äther-Armbrust',icon:'➹',desc:'40 Schaden. Stärkere Narkosebolzen (60 Betäubung). Nutzt dieselben Pfeile wie der Bogen.',damage:40,range:100,cooldown:1.1,stamina:5,ranged:true,weight:4},
 metalwall:{name:'Verstärkte Metallwand',icon:'▥',desc:'Freischaltung im Survivor-Pfad. Einrastende Wand aus Eisenbarren.',weight:0}
});
RECIPES.push({id:'helmet',cat:'Ausrüstung',cost:{hide:3,fiber:3},gear:true},{id:'gloves',cat:'Ausrüstung',cost:{hide:2,fiber:3},gear:true},{id:'pants',cat:'Ausrüstung',cost:{hide:4,fiber:5},gear:true},{id:'boots',cat:'Ausrüstung',cost:{hide:3,fiber:3},gear:true},{id:'crossbow',cat:'Waffen',cost:{ingot:6,wood:8,fiber:6},gear:true,station:'smithy',blueprint:{path:'aviator',rank:2}},{id:'metalwall',cat:'Bauen',cost:{ingot:4,stone:3},build:true,blueprint:{path:'survivor',rank:2}});
RECIPES.find(r=>r.id==='saddle').blueprint={path:'tamer',rank:1};
for(const[id,item]of Object.entries(ITEMS))item.weight??=({wood:.6,stone:.8,ore:1.2,ingot:1.5,fiber:.1,flint:.2,hide:.3,berry:.05,narco:.05,meat:.5,cooked:.4,crystal:.3,arrow:.1,tranq:.1,bandage:.2,armor:5,saddle:6,shield:3}[id]??(item.damage?2:0));
export const SKILLS={
 tamer:{name:'Tamer',title:'Zähmer',icon:'♞',nodes:[{name:'Tierfreund',desc:'Zähmung 25 % schneller. Bauplan: Falkensattel.'},{name:'Himmelsruf',desc:'Rufreichweite steigt von 70 auf 140 Meter.'},{name:'Rudelbund',desc:'Dein Raptor verursacht 50 % mehr Schaden.'}]},
 aviator:{name:'Aviator',title:'Flieger',icon:'✧',nodes:[{name:'Thermikleser',desc:'20 % weniger Flug- und 25 % weniger Gleit-Ausdauerverbrauch.'},{name:'Luftjäger',desc:'Bauplan: Äther-Armbrust. Enterhaken lädt doppelt so schnell.'},{name:'Sturmflug',desc:'V ermöglicht ein Luftmanöver. Kostet 18 Ausdauer.'}]},
 survivor:{name:'Survivor',title:'Überlebenskünstler',icon:'✚',nodes:[{name:'Robuste Konstitution',desc:'+30 maximales Leben und +25 kg Traglast.'},{name:'Himmelsbaumeister',desc:'Bauplan: Metallwand. +8 °C Kälteresistenz.'},{name:'Fährtenleser',desc:'+1 Ressource pro Ernte und weitere +50 kg Traglast.'}]}
};
export const carriedWeight=(inv,gear={})=>Object.entries(inv).reduce((n,[id,v])=>n+(ITEMS[id]?.weight||0)*v,0)+Object.entries(gear).reduce((n,[id,v])=>n+(v?ITEMS[id]?.weight||0:0),0);
