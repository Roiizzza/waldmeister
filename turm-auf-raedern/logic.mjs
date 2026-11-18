export const VERSION=2, SAVE_KEY='spielwiese.turm-raeder.v1';
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const TYPES={
 cannon:{name:'Kanone',icon:'cannon',tag:'PANZERBRECHEND',cost:30,power:2,damage:23,rate:1.05,range:28,color:0xf4aa49,desc:'Schwere Geschosse durchschlagen Panzerung. Verlässlich gegen einzelne starke Ziele.'},
 gatling:{name:'Gatling',icon:'gatling',tag:'SCHNELLFEUER',cost:38,power:2,damage:6,rate:.18,range:25,color:0x67d7ca,desc:'Dichte Salven. Verursacht 25 % mehr Schaden an fliegenden Drohnen.'},
 rocket:{name:'Raketen',icon:'rocket',tag:'EXPLOSIV',cost:55,power:3,damage:34,rate:1.9,range:31,color:0xf47e55,desc:'Flächenschaden im Umkreis von 3 Metern. Ideal gegen Gruppen.'},
 tesla:{name:'Tesla',icon:'tesla',tag:'KETTENBLITZ',cost:55,power:3,damage:19,rate:1.15,range:21,color:0x99b8ff,desc:'Trifft bis zu drei Ziele. Verlangsamt Gegner für eine Sekunde.'},
 reactor:{name:'Generator',icon:'reactor',tag:'VERSORGUNG',cost:25,power:-3,color:0x8fdbb5,desc:'Versorgt zusätzliche Module mit Energie. Jede Aufrüstung liefert einen weiteren Energiepunkt.'},
 shield:{name:'Schild',icon:'shield',tag:'REGENERATION',cost:40,power:2,color:0x87d9f7,desc:'Fängt Treffer ab. Regeneriert 3 Sekunden nach dem letzten Treffer.'}
};
export const UPGRADES=[
 {id:'damage',name:'Wolframmunition',icon:'cannon',desc:'22 % mehr Schaden mit allen Waffen.',color:'amber'},
 {id:'rate',name:'Schnelllader',icon:'gatling',desc:'15 % kürzere Nachladezeit für alle Geschütze.',color:'teal'},
 {id:'hull',name:'Verbundpanzerung',icon:'armor',desc:'+35 maximale Hülle und sofort +50 Hülle.',color:'amber'},
 {id:'range',name:'Zielcomputer',icon:'target',desc:'+15 % Reichweite und +10 % Waffenschaden.',color:'teal'},
 {id:'salvage',name:'Bergungsdrohne',icon:'scrap',desc:'25 % mehr Schrott und größere Anziehung der Beute.',color:'teal'},
 {id:'repair',name:'Reparaturschwarm',icon:'repair',desc:'Nach jedem Hinterhalt +10 Hülle regenerieren.',color:'teal'},
 {id:'chain',name:'Sekundärentladung',icon:'tesla',desc:'Jeder fünfte Abschuss löst einen automatischen Flächenblitz aus.',color:'violet'},
 {id:'plating',name:'Reaktive Panzerung',icon:'shield',desc:'12 % weniger eingehender Schaden. Bis zu 48 % Schutz.',color:'violet'}
];
export const LOADOUTS={
 ranger:{name:'Allrounder',text:'Kanone + Gatling',slots:{1:'cannon',3:'gatling',10:'reactor'}},
 storm:{name:'Sturmspule',text:'Tesla + Gatling',slots:{1:'tesla',3:'gatling',10:'reactor'}},
 siege:{name:'Belagerer',text:'Kanone + Raketen',slots:{1:'cannon',5:'rocket',10:'reactor'}}
};
export const REGIONS=[
 {name:'Salzstraße',zone:'DIE AUSSENBEZIRKE',theme:'desert',caption:'Räumer in Sicht. Halte den Konvoi in Bewegung.'},
 {name:'Rostpass',zone:'DIE AUSSENBEZIRKE',theme:'desert',caption:'Die Räuber haben die alte Straße besetzt.'},
 {name:'Förderwerk',zone:'INDUSTRIEGÜRTEL',theme:'factory',caption:'Zwischen Tanks und Rohrleitungen lauern schwere Geschütze.'},
 {name:'Schmelzbezirk',zone:'INDUSTRIEGÜRTEL',theme:'factory',caption:'Artillerie im Anflug. Achte auf die roten Markierungen.'},
 {name:'Kupferschlucht',zone:'DAS ROTE TAL',theme:'canyon',caption:'Rammfahrzeuge. Weiche ihren geraden Angriffen aus.'},
 {name:'Eisenklamm',zone:'DAS ROTE TAL',theme:'canyon',caption:'Der Feind hat Verstärkung in die Schlucht geschickt.'},
 {name:'Sperrzone',zone:'DIE LETZTE BASTION',theme:'night',caption:'Die Bastion liegt vor dir. Mach deine Festung bereit.'},
 {name:'Eisenbrecher',zone:'DIE LETZTE BASTION',theme:'night',caption:'Zerstöre den Eisenbrecher und öffne die Route.'}
];
export function newRun(meta={},loadout='ranger'){
 const maxHp=180+Math.floor(meta.armor||0)*15,blueprint=LOADOUTS[loadout]||LOADOUTS.ranger;
 return {version:VERSION,sector:1,hp:maxHp,maxHp,scrap:65+Math.floor(meta.supply||0)*15,kills:0,elapsed:0,distance:0,route:'normal',phase:'build',seed:Math.floor(Math.random()*2147483646)+1,modules:Array.from({length:12},(_,i)=>blueprint.slots[i]?{type:blueprint.slots[i],level:1}:null),upgrades:{},rewardOptions:[],rerolled:false,weaponBonus:Math.floor(meta.weapon||0)*.08,loadout:LOADOUTS[loadout]?loadout:'ranger'};
}
export function power(s){let capacity=4,used=0;for(const m of s.modules){if(!m)continue;const p=TYPES[m.type].power;if(p<0)capacity+=3+m.level-1;else used+=p;}return {capacity,used,free:capacity-used};}
export function weaponStats(s,m){const t=TYPES[m.type];return {damage:(t.damage||0)*(1+(m.level-1)*.45)*(1+(s.upgrades.damage||0)*.22+(s.upgrades.range||0)*.1+(s.weaponBonus||0)),rate:(t.rate||1)*Math.pow(.85,s.upgrades.rate||0),range:(t.range||0)*(1+(s.upgrades.range||0)*.15)};}
export function shieldMax(s){return s.modules.reduce((n,m)=>n+(m?.type==='shield'?45+(m.level-1)*22:0),0);}
export function synergy(s,index){const m=s.modules[index];if(!m)return null;const col=index%3,row=Math.floor(index/3),neighbors=[];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=col+dx,y=row+dy;if(x>=0&&x<3&&y>=0&&y<4)neighbors.push(s.modules[y*3+x]);}if(TYPES[m.type].damage&&neighbors.some(n=>n?.type==='reactor'))return {name:'Direktversorgung',text:'Neben einem Generator: 10 % schnelleres Feuer.',rate:.9};return null;}
export function buyModule(s,type,index){if(!TYPES[type]||!Number.isInteger(index)||index<0||index>=12||s.modules[index])return 'Wähle einen freien Bauplatz.';const t=TYPES[type];if(s.scrap<t.cost)return `Es fehlen ${t.cost-s.scrap} Schrott.`;if(t.power>power(s).free)return 'Zu wenig Energie. Baue oder verbessere einen Generator.';s.modules[index]={type,level:1};s.scrap-=t.cost;return null;}
export function upgradeCost(m){return Math.round(TYPES[m.type].cost*(.7+m.level*.3));}
export function upgradeModule(s,i){const m=s.modules[i];if(!m)return 'Wähle zuerst ein Modul.';if(m.level>=4)return 'Dieses Modul ist bereits auf Stufe 4.';const cost=upgradeCost(m);if(s.scrap<cost)return `Es fehlen ${cost-s.scrap} Schrott.`;s.scrap-=cost;m.level++;return null;}
export function sellValue(m){return Math.floor(TYPES[m.type].cost*(.6+(m.level-1)*.3));}
export function sellModule(s,i){const m=s.modules[i];if(!m)return 'Wähle zuerst ein Modul.';if(TYPES[m.type].damage&&s.modules.filter(x=>x&&TYPES[x.type].damage).length<=1)return 'Deine letzte Waffe bleibt an Bord.';if(m.type==='reactor'&&power(s).free<3+m.level-1)return 'Dieser Generator versorgt noch andere Module.';s.scrap+=sellValue(m);s.modules[i]=null;return null;}
export function moveModule(s,from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=12||to>=12||!s.modules[from])return 'Wähle ein eingebautes Modul.';[s.modules[from],s.modules[to]]=[s.modules[to],s.modules[from]];return null;}
export function repairCost(s){return Math.min(25,Math.ceil(Math.min(65,s.maxHp-s.hp)*.38));}
export function repair(s){if(s.hp>=s.maxHp)return 'Deine Hülle ist bereits vollständig repariert.';const cost=repairCost(s);if(s.scrap<cost)return `Es fehlen ${cost-s.scrap} Schrott.`;s.scrap-=cost;s.hp=Math.min(s.maxHp,s.hp+65);return null;}
export function applyUpgrade(s,id){if(!UPGRADES.some(u=>u.id===id))return false;s.upgrades[id]=(s.upgrades[id]||0)+1;if(id==='hull'){s.maxHp+=35;s.hp=Math.min(s.maxHp,s.hp+50);}return true;}
export function stageConfig(s){const i=s.sector;return {length:112,thresholds:[8,43,84],groups:[3+Math.floor(i*.7),4+Math.floor(i*.7),i===8?5:5+Math.floor(i*.8)],hp:1+(i-1)*.2+(s.route==='elite'?.3:0),reward:25+i*6+(s.route==='elite'?30:0),speed:7.8,elite:s.route==='elite'};}
export function chooseReward(s,id){if(s.sector>=8||s.phase!=='reward'||!s.rewardOptions.includes(id))return false;applyUpgrade(s,id);s.rewardOptions=[];s.rerolled=false;s.sector++;s.distance=0;s.phase=[3,5,7].includes(s.sector)?'route':'build';return true;}
export function chooseRoute(s,id){if(s.phase!=='route'||!['elite','repair','supply'].includes(id))return false;s.route=id;if(id==='repair')s.hp=s.maxHp;if(id==='supply')s.scrap+=45;s.phase='build';return true;}
export function validateRun(raw,meta={}){
 if(!raw||![1,VERSION].includes(raw.version)||!Array.isArray(raw.modules)||raw.modules.length!==12)return null;const s=newRun();
 s.modules=raw.modules.map(m=>m&&TYPES[m.type]?{type:m.type,level:clamp(Math.floor(Number(m.level)||1),1,4)}:null);
 if(!s.modules.some(m=>m&&TYPES[m.type].damage)||power(s).free<0)return null;
 for(const k of ['sector','hp','maxHp','scrap','kills','elapsed']){if(!Number.isFinite(Number(raw[k])))return null;s[k]=Number(raw[k]);}
 s.maxHp=clamp(s.maxHp,150,2000);if(s.hp<=0)return null;s.hp=clamp(s.hp,1,s.maxHp);s.sector=clamp(Math.floor(s.sector),1,8);s.scrap=clamp(Math.floor(s.scrap),0,99999);s.kills=clamp(Math.floor(s.kills),0,999999);s.elapsed=clamp(s.elapsed,0,999999);s.phase=['build','reward','route'].includes(raw.phase)?raw.phase:'build';s.route=['normal','elite','repair','supply'].includes(raw.route)?raw.route:'normal';s.weaponBonus=clamp(raw.version===1?(Number(meta.weapon)||0)*.08:Number(raw.weaponBonus)||0,0,.4);s.seed=clamp(Math.floor(Number(raw.seed)||1729),1,2147483646);s.rerolled=!!raw.rerolled;
 for(const u of UPGRADES)s.upgrades[u.id]=clamp(Math.floor(Number(raw.upgrades?.[u.id])||0),0,30);
 s.rewardOptions=Array.isArray(raw.rewardOptions)?[...new Set(raw.rewardOptions)].filter(id=>UPGRADES.some(u=>u.id===id)).slice(0,3):[];
 if(s.phase==='reward'&&(!s.rewardOptions.length||s.sector>=8))s.phase='build';return s;
}
export function moduleSummary(s){const p=power(s);const dps=s.modules.reduce((n,m,i)=>n+(m&&TYPES[m.type].damage?weaponStats(s,m).damage/(weaponStats(s,m).rate*(synergy(s,i)?.rate||1)):0),0);return {weapons:s.modules.filter(m=>m&&TYPES[m.type].damage).length,dps:Math.round(dps),shield:shieldMax(s),power:p};}
