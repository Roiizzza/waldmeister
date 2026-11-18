import * as T from '../vendor/three.module.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
class Element {
 constructor(id){this.id=id;this.style={};this.dataset={};this._html='';this.classList={add(){},remove(){},toggle(){}};this.firstElementChild={style:{}};}
 set innerHTML(v){this._html=v;}
 get innerHTML(){return this._html;}
 getContext(){return new Proxy({createImageData:()=>({data:new Uint8ClampedArray(640*400*4)})},{get:(o,k)=>k in o?o[k]:()=>{}})}
 addEventListener(){}
 click(){this.onclick?.({target:this});}
}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
const document={getElementById:get,createElement:()=>new Element('canvas'),addEventListener(){},contains:()=>true,querySelectorAll(selector){const attr=selector.match(/data-([^\]]+)/)[1],html=get('modalcontent').innerHTML;return [...html.matchAll(new RegExp(`data-${attr}="(\\d+)"`,'g'))].map(m=>{const e=new Element('');e.dataset[attr]=m[1];return e;});}};
const localData=new Map(),localStorage={getItem:k=>localData.get(k)||null,setItem:(k,v)=>localData.set(k,v),removeItem:k=>localData.delete(k)};
const renderer={setSize(){},setPixelRatio(){},shadowMap:{},info:{render:{calls:0}}};
Object.assign(globalThis,{matchMedia:()=>({matches:false}),innerWidth:1366,innerHeight:900,devicePixelRatio:1,requestAnimationFrame(){},location:{reload(){}},document,localStorage});
let source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8').replace("import * as T from './vendor/three.module.js';",'');
source=source.replace("new T.WebGLRenderer({canvas:$('game'),antialias:true,powerPreference:'high-performance'})",'stubRenderer');
const api=new Function('T','document','window','localStorage','stubRenderer',source+`;return {get state(){return state},advance,checkout,pickup,refill,delivery,fuseUI,radio,visitorUI,notes,canStand,scene,camera,findTarget,interactives,finish,get target(){return currentTarget},setStarted(){started=true}, reset(){state={stage:0,scanned:0,stock:0,carrying:false,mistakes:0,reports:0,elapsed:0,readNote:false,fuses:[false,false,false],fuseOrder:0,delivery:false};ended=false;started=true;sync()}};`)(T,document,{addEventListener(){}},localStorage,renderer);
// Timed subtitles/audio callbacks are irrelevant to these synchronous state checks.
api.setStarted();api.scene.updateMatrixWorld(true);api.camera.updateMatrixWorld(true);api.findTarget();assert.equal(api.target?.name,'Kasse','Starting view must be able to target checkout');
let scanButtons=[];const originalQuery=document.querySelectorAll.bind(document);document.querySelectorAll=s=>{scanButtons=originalQuery(s);return scanButtons;};api.checkout();for(let i=0;i<3;i++)scanButtons[i].click();assert.equal(api.state.scanned,3);get('receipt').click();assert.equal(api.state.stage,1);
api.pickup();assert.equal(api.state.carrying,true);api.refill(1);assert.equal(api.state.stock,0,'Wrong shelf cannot advance');for(let i=0;i<3;i++)api.refill(i);assert.equal(api.state.stage,2);assert.equal(api.state.carrying,false);
api.delivery();get('deliveryNo').click();assert.equal(api.state.stage,3);assert.equal(api.state.delivery,true);api.state.scanned=3;api.checkout();get('receipt').click();assert.equal(api.state.stage,4);
// UI helper captures buttons that fuseUI configured in its querySelectorAll call.
let lastButtons=[];const original=document.querySelectorAll.bind(document);document.querySelectorAll=s=>{lastButtons=original(s);return lastButtons;};
api.fuseUI();lastButtons[0].click();assert.equal(api.state.fuseOrder,0);assert.equal(api.state.mistakes,1);for(const i of [1,0,2])lastButtons[i].click();assert.equal(api.state.stage,5);api.radio();get('reportYes').click();assert.equal(api.state.stage,6);assert.equal(api.state.reports,1);api.visitorUI();get('doorReject').click();assert.equal(api.state.stage,7);api.radio();assert.equal(get('endtitle').textContent,'Der Morgen kommt.');
api.reset();api.advance(6);api.visitorUI();get('doorAccept').click();assert.equal(get('endtitle').textContent,'Du hast es hereingelassen.');
api.reset();api.state.mistakes=3;api.advance(7);api.radio();assert.equal(get('endtitle').textContent,'Du bist noch hier.');
// Flood-fill physical floor to check that counter, shelf and partition collisions do not trap players.
api.reset();const step=.2,queue=[[0,0]],seen=new Set(['0,0']);let qi=0;while(qi<queue.length){const [ix,iz]=queue[qi++];for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=ix+dx,nz=iz+dz,k=nx+','+nz;if(!seen.has(k)&&api.canStand(-5.3+nx*step,4.8+nz*step)){seen.add(k);queue.push([nx,nz]);}}}const floorPoints=queue.map(([ix,iz])=>[-5.3+ix*step,4.8+iz*step]);for(const [label,x,z]of [['stockroom',6.2,-6.8],['fuse box',7.9,3.3],['gang2',4.5,-2],['monitor',4.8,-4.4],['radio',-7.3,4.5],['entrance',5.5,5.5]])assert.ok(floorPoints.some(([px,pz])=>Math.hypot(x-px,z-pz)<.6),label+' must be reachable');
console.log('PASS: initial raycast, checkout progression, stock sequencing, delivery, wrong and correct fuse sequence, reporting, all three endings and floor reachability ('+seen.size+' reachable cells).');
