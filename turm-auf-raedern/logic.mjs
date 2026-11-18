export const VERSION=1, SAVE_KEY='spielwiese.turm-raeder.v1';
export const TYPES={
 cannon:{name:'Kanone',icon:'◉',tag:'PRÄZISION',cost:30,power:2,damage:15,rate:1.05,range:23,color:0xf7ad42,desc:'Zielsichere Granaten. Stark gegen Panzerung.'},
 gatling:{name:'Gatling',icon:'≋',tag:'SCHNELLFEUER',cost:38,power:2,damage:5,rate:.19,range:21,color:0x45c9bc,desc:'Schnelle Salven gegen Drohnen und Schwärme.'},
 rocket:{name:'Raketen',icon:'↟',tag:'FLÄCHENSCHADEN',cost:55,power:3,damage:23,rate:2.2,range:28,color:0xf5774c,desc:'Explosionen treffen Gegner im Umkreis.'},
 tesla:{name:'Tesla',icon:'ϟ',tag:'KETTENBLITZ',cost:55,power:3,damage:12,rate:1.2,range:17,color:0x76b9ff,desc:'Springt auf bis zu drei nahe Gegner über.'},
 reactor:{name:'Generator',icon:'⚡',tag:'ENERGIE +3',cost:25,power:-3,color:0x59d6cc,desc:'Liefert Energie für drei zusätzliche Verbraucher.'},
 shield:{name:'Schild',icon:'◇',tag:'SCHUTZ +35',cost:40,power:2,color:0x85d8ee,desc:'Zusätzlicher Schild. Regeneriert nach einer Trefferpause.'}
};
export const UPGRADES=[
 {id:'damage',name:'Wolframgeschosse',icon:'◉',desc:'Alle Waffen verursachen 22 % mehr Schaden.'},
 {id:'rate',name:'Schnelllader',icon:'≋',desc:'Alle Waffen feuern 15 % schneller.'},
 {id:'hull',name:'Verbundpanzerung',icon:'⬡',desc:'+30 maximale Hülle und sofort 30 Hülle reparieren.'},
 {id:'range',name:'Zielcomputer',icon:'⌖',desc:'+20 % Reichweite für alle Geschütze.'},
 {id:'salvage',name:'Schrottmagnet',icon:'⚙',desc:'25 % mehr Schrott aus zerstörten Gegnern.'},
 {id:'repair',name:'Feldreparatur',icon:'✚',desc:'Nach jedem Gefecht automatisch 12 Hülle reparieren.'}
];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function newRun(meta={}){return {version:VERSION,sector:1,hp:150+(meta.armor||0)*12,maxHp:150+(meta.armor||0)*12,scrap:55,kills:0,cores:0,distance:0,route:'normal',modules:Array.from({length:12},(_,i)=>i===1?{type:'cannon',level:1}:i===10?{type:'reactor',level:1}:null),upgrades:{},phase:'build',elapsed:0};}
export function power(s){let capacity=4,used=0;for(const m of s.modules){if(!m)continue;const p=TYPES[m.type].power;if(p<0)capacity+=3+(m.level-1);else used+=p;}return {capacity,used,free:capacity-used};}
export function weaponStats(s,m){const t=TYPES[m.type];return {damage:(t.damage||0)*(1+(m.level-1)*.48)*(1+(s.upgrades.damage||0)*.22),rate:(t.rate||1)*Math.pow(.85,s.upgrades.rate||0),range:(t.range||0)*(1+(s.upgrades.range||0)*.2)};}
export function shieldMax(s){return s.modules.reduce((v,m)=>v+(m?.type==='shield'?35+(m.level-1)*18:0),0);}
export function buyModule(s,type,index){if(!TYPES[type]||!Number.isInteger(index)||index<0||index>=12||s.modules[index])return 'Wähle einen freien Bauplatz.';const t=TYPES[type];if(s.scrap<t.cost)return 'Nicht genug Schrott.';if(t.power>power(s).free)return 'Zu wenig Energie. Baue einen Generator.';s.modules[index]={type,level:1};s.scrap-=t.cost;return null;}
export function upgradeCost(m){return Math.round(TYPES[m.type].cost*(.65+m.level*.35));}
export function upgradeModule(s,i){const m=s.modules[i];if(!m)return 'Wähle ein Modul.';if(m.level>=4)return 'Maximale Stufe erreicht.';const c=upgradeCost(m);if(s.scrap<c)return 'Nicht genug Schrott.';s.scrap-=c;m.level++;return null;}
export function sellModule(s,i){const m=s.modules[i];if(!m)return 'Wähle ein Modul.';if(TYPES[m.type].damage&&s.modules.filter(x=>x&&TYPES[x.type].damage).length<=1)return 'Deine letzte Waffe bleibt an Bord.';const p=power(s);if(m.type==='reactor'&&p.free<3+(m.level-1))return 'Dieser Generator wird noch gebraucht.';s.scrap+=Math.floor(TYPES[m.type].cost*(.6+(m.level-1)*.3));s.modules[i]=null;return null;}
export function applyUpgrade(s,id){if(!UPGRADES.some(x=>x.id===id))return false;s.upgrades[id]=(s.upgrades[id]||0)+1;if(id==='hull'){s.maxHp+=30;s.hp=Math.min(s.hp+30,s.maxHp);}return true;}
export function validateRun(raw){if(!raw||raw.version!==VERSION||!Array.isArray(raw.modules)||raw.modules.length!==12)return null;const s=newRun();s.modules=raw.modules.map(m=>m&&TYPES[m.type]?{type:m.type,level:clamp(Math.floor(Number(m.level)||1),1,4)}:null);if(!s.modules.some(m=>m&&TYPES[m.type].damage))return null;if(power(s).free<0)return null;for(const k of ['sector','hp','maxHp','scrap','kills','elapsed','distance','cores']){const n=Number(raw[k]);if(!Number.isFinite(n))return null;s[k]=n;}s.maxHp=clamp(s.maxHp,150,1500);s.hp=clamp(s.hp,1,s.maxHp);s.sector=clamp(Math.floor(s.sector),1,8);s.scrap=clamp(Math.floor(s.scrap),0,99999);s.distance=0;s.phase='build';s.route=['normal','elite','repair','salvage'].includes(raw.route)?raw.route:'normal';for(const u of UPGRADES)s.upgrades[u.id]=clamp(Math.floor(Number(raw.upgrades?.[u.id])||0),0,30);return s;}
export function repair(s){const missing=s.maxHp-s.hp;if(missing<1)return 'Hülle bereits vollständig repariert.';const cost=Math.min(25,Math.ceil(missing*.5));if(s.scrap<cost)return 'Nicht genug Schrott.';s.scrap-=cost;s.hp=Math.min(s.maxHp,s.hp+50);return null;}
export function stageConfig(s){return {count:5+s.sector*2+(s.route==='elite'?4:0),hp:1+(s.sector-1)*.22+(s.route==='elite'?.35:0),reward:22+s.sector*5+(s.route==='elite'?25:0),length:65+s.sector*4};}
