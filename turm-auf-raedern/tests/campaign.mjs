import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {buyModule,upgradeModule,repair,power} from '../logic.mjs';
let seed=1729;Math.random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
const nodes=new Map();function node(id){if(!nodes.has(id))nodes.set(id,{hidden:false,innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return [];},querySelector(){return null;},getBoundingClientRect(){return {width:390,height:844,left:0,top:0};},firstElementChild:{style:{}}});return nodes.get(id);}
globalThis.document={getElementById:node,addEventListener(){},hidden:false};globalThis.window={addEventListener(){}};globalThis.localStorage={getItem(){return null;},setItem(){}};globalThis.requestAnimationFrame=()=>{};
const obj=()=>({position:{set(){},z:0},rotation:{},scale:{x:1,y:1},material:{dispose(){}},geometry:{dispose(){}},children:[]});
globalThis.TestWorld=class{constructor(){this.gate={visible:false};this.gateBeam=obj();this.guns=[];this.shake=0;}modules(){}remove(){}burst(){}lightning(){}setQuality(){}update(){}enemy(){return {group:obj(),rig:obj(),bar:obj()};}projectile(){return obj();}telegraph(){return obj();}};
let src=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8').replace("import {World} from './world.mjs';","const World=globalThis.TestWorld;").replace("from './logic.mjs'",`from '${new URL('../logic.mjs',import.meta.url)}'`);
src+='\nglobalThis.hooks={get s(){return s},get mode(){return mode},get checkpoint(){return checkpoint},get enemies(){return enemies},get bullets(){return bullets},startNew,launch,frame,applyUpgrade,build,routes,pause,completeSector,finish,showUpgrade,input,startBattle,bullet,updateBullets};';
await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
const h=globalThis.hooks;h.startNew();let now=performance.now();
const logs=[];
for(let stage=1;stage<=8;stage++){
 const s=h.s;assert.equal(s.sector,stage);if(stage>1){h.applyUpgrade(s,stage%2?'damage':'repair');if([3,5,7].includes(stage)){s.hp=s.maxHp;s.route='repair';}}
 const wants=['gatling','rocket','shield','reactor','tesla','gatling','reactor','rocket','shield','reactor'];
 for(const type of wants){const i=s.modules.findIndex(m=>!m);if(i<0)break;if(s.modules.filter(m=>m?.type===type).length>=(type==='reactor'?3:type==='shield'?1:2))continue;buyModule(s,type,i);}
 for(let i=0;i<12;i++){const m=s.modules[i];if(m?.type==='reactor'&&power(s).free<3&&s.scrap>40)upgradeModule(s,i);}
 for(let i=0;i<12;i++){const m=s.modules[i];if(m&&m.type!=='reactor'&&s.scrap>80)upgradeModule(s,i);}
 while(s.hp<s.maxHp&&s.scrap>=Math.min(25,Math.ceil((s.maxHp-s.hp)*.5)))repair(s);
 h.launch();let frames=0;while(['travel','battle','clear'].includes(h.mode)&&frames<18000){h.input.dx=Math.cos(frames/60*1.25);h.input.dy=Math.sin(frames/60*1.25)*.35;now+=1000/60;h.frame(now);frames++;}
 logs.push({stage,mode:h.mode,hp:Math.ceil(s.hp),scrap:s.scrap,kills:s.kills,seconds:Math.round(frames/60),modules:s.modules.filter(Boolean).length,power:power(s)});
 if(h.mode==='result')break;
 assert.equal(h.mode,'upgrade');
}
console.log('Kampagne:', logs.map(x=>({Sektor:x.stage,Ergebnis:x.mode,Huelle:x.hp,Module:x.modules})));assert.ok(h.s.kills>=7,'first encounter must be completable');assert.ok(h.s.hp>0,'the complete eight-sector campaign is winnable with normal progression');assert.notEqual(h.mode,'battle','combat must not stall');
// A legal, fully upgraded fortress must be able to reach and defeat the final boss.
h.startNew();h.applyUpgrade(h.s,'damage');h.applyUpgrade(h.s,'damage');h.applyUpgrade(h.s,'rate');h.applyUpgrade(h.s,'rate');const bossState=h.s;bossState.sector=8;bossState.scrap=10000;for(const type of ['reactor','reactor','shield','shield','tesla','rocket','gatling']){buyModule(bossState,type,bossState.modules.findIndex(m=>!m));}for(const m of bossState.modules)if(m)m.level=4;bossState.hp=bossState.maxHp=150;h.launch();let n=0;while(['travel','battle','clear'].includes(h.mode)&&n<36000){h.input.dx=Math.cos(n/60*1.1);h.input.dy=Math.sin(n/60*.8)*.6;now+=1000/60;h.frame(now);n++;}console.log('Boss stress test:',{mode:h.mode,hp:bossState.hp,kills:bossState.kills,seconds:Math.round(n/60)});assert.equal(h.mode,'result');assert.ok(bossState.hp>0,'upgraded fortress can defeat final boss');assert.ok(bossState.kills>=13);


h.startNew();h.launch();h.startBattle();h.s.hp=1;h.bullet(0,4,0,4,false,100);h.bullet(0,4,0,4,false,100);h.updateBullets(.016);assert.equal(h.mode,'result');console.log('Fatal simultaneous projectiles: safe result screen.');
