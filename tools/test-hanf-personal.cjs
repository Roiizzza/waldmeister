// Regressionen der Personalabläufe ohne WebGL: node tools/test-hanf-personal.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../hanf-imperium/game.js'),'utf8');
const cut=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const stub=`
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),fmt=String,fmtG=String;
const localStorage={getItem:()=>null,setItem:()=>{}},toast=()=>{};
const COL=[],BOX_X=[0,-2.7,2.7,-5.1],BOX_Z=-3.3,RACK={x:-5.4,z:2.8};
const STAFFV={gardeners:[],workers:[],robots:[],harvesters:[],tractors:[],trucks:[]};
const PL={veh:null};let harvV=null;const T=0,started=true,uiOpen=false,locked=true;
const PAR=Array.from({length:30},(_,i)=>({z0:60+i*100,flags:new Uint8Array(960),dirty:false}));
const resetFlags=i=>{PAR[i].flags.fill(0);for(let k=0;k<S.parcels[i].hv;k++)PAR[i].flags[k]=1;};
const boxQ=()=>.8,hallQ=()=>.9,sowCost=id=>Math.round(STRAIN[id].seed*960*.12);
`;
const code=stub+cut('const STRAINS=','/* ---------- Geometrie')+cut('const KEY=','/* ---------- UI: Toasts')+cut('function harvestPot(', '/* ---------- Fahrzeuge')+cut('function harvestPlant(', '/* ---------- Figuren')+cut('function allPots()', 'function simulate')+cut('/* Personal: Aufgaben', '/* ---------- Tag/Nacht');
function fresh(){const ctx=vm.createContext({});vm.runInContext(code+`;globalThis.api={get S(){return S},STAFFV,PL,PAR,COL,updateGardeners,updateFieldStaff,updateTractors,updateTrucks,updateStaff,staffRoute,staffLineClear,invalidateStaffRoutes,setHarv:o=>harvV=o};`,ctx);return ctx.api;}
function actor(x=0,z=2){return {x,z,g:{rotation:{y:0},position:{set(){}}}};}
function run(fn,n=100){for(let i=0;i<n;i++)fn(.1);}
let a=fresh(),p=a.S.boxes[0].pots[0];p.s='lemon';p.w=.1;a.STAFFV.gardeners.push(actor());a.updateGardeners(.1);assert.equal(p.w,.1,'Gießen darf nicht vor Ankunft geschehen');run(a.updateGardeners);assert.equal(p.w,1);
a=fresh();a.S.boxes[0].size=1;a.S.boxes[0].pots=Array.from({length:4},()=>({s:null,g:0,w:1,h:1}));a.STAFFV.gardeners.push(actor(),actor(1,2));a.updateGardeners(.1);assert.notEqual(a.STAFFV.gardeners[0].job.p,a.STAFFV.gardeners[1].job.p,'Pflanzen müssen getrennt reserviert werden');run(a.updateGardeners);assert.equal(a.S.boxes[0].pots.filter(p=>p.s).length,1,'Ein Samen darf nur einmal verbraucht werden');assert.equal(a.S.seeds.lemon,0);
a=fresh();p=a.S.boxes[0].pots[0];Object.assign(p,{s:'lemon',g:1});a.STAFFV.gardeners.push(actor());a.updateGardeners(.1);p.s=null;p.g=0;a.S.seeds.lemon=0;run(a.updateGardeners);assert.equal(Object.keys(a.S.wet).length,0,'Manuelle Ernte muss reservierten Auftrag ungültig machen');
a=fresh();a.S.seeds.lemon=0;a.S.rack.b=[{s:'lemon',g:500,q:1,t:0}];a.STAFFV.gardeners.push(actor());run(a.updateGardeners);assert.equal(a.S.dry.lemon.g,125,'Gärtner muss fertiges Gestell selbständig abholen');
a=fresh();a.S.parcels[0].own=true;a.S.parcels[0].st='ripe';a.S.parcels[0].g=1;a.STAFFV.workers.push(actor(-46,61),actor(-44,61));a.updateFieldStaff(.1);assert.notEqual(a.STAFFV.workers[0].job.k,a.STAFFV.workers[1].job.k);run(a.updateFieldStaff,5);assert.equal(a.S.parcels[0].hv,2,'Zwei Helfer dürfen nicht dieselbe Pflanze ernten');
a=fresh();a.S.parcels[0].own=true;a.S.parcels[0].st='ripe';const machine=actor(-46,61);a.setHarv(machine);run(a.updateFieldStaff,5);assert.ok(a.S.parcels[0].hv>0,'Erster Mähdrescher muss automatisch arbeiten');a.PL.veh=machine;const hv=a.S.parcels[0].hv;run(a.updateFieldStaff,10);assert.equal(a.S.parcels[0].hv,hv,'Gefahrene Maschine darf nicht zusätzlich automatisch ernten');
a=fresh();a.S.money=100000;a.S.parcels[0].own=a.S.parcels[1].own=true;a.STAFFV.tractors.push(actor(-26,62),actor(-26,162));a.updateTractors(.1);assert.notEqual(a.STAFFV.tractors[0].job.pi,a.STAFFV.tractors[1].job.pi);assert.equal(a.S.money,100000,'Saatgut nicht doppelt oder vor Aussaat abbuchen');run(a.updateTractors,200);assert.equal(a.S.parcels[0].st,'grow');assert.equal(a.S.parcels[1].st,'grow');assert.equal(a.S.money,100000-2*Math.round(25*960*.12));
a=fresh();a.S.parcels[0].own=true;a.STAFFV.tractors.push(actor(-26,62));a.S.money=0;run(a.updateTractors,250);assert.equal(a.S.parcels[0].st,'empty');assert.equal(a.S.money,0,'Kein kostenloses Säen oder negatives Saatgutbudget');
a=fresh();a.S.dry={lemon:{g:4000,q:1}};a.STAFFV.trucks.push(actor(3.2,320),actor(3.2,326));a.updateTrucks(.1);assert.equal(Object.keys(a.S.dry).length,0);assert.equal(a.STAFFV.trucks[0].phase,'back');assert.equal(a.STAFFV.trucks[1].phase,'back');assert.ok(a.S.total>0);const money=a.S.money;a.updateStaff(0);assert.equal(a.S.money,money,'Pause darf keine Arbeit auslösen');
a=fresh();a.COL.push({x0:-6,x1:-6,z0:-5,z1:5},{x0:6,x1:6,z0:-5,z1:5},{x0:-6,x1:6,z0:-5,z1:-5},{x0:-6,x1:-1.5,z0:5,z1:5},{x0:1.5,x1:6,z0:5,z1:5});let from={x:0,z:0};const route=a.staffRoute(from,{x:10,z:0});assert.ok(route&&route.length>1,'Weg muss durch Garagentür führen');for(const to of route){assert.ok(a.staffLineClear(from,to),'Kein Wegsegment darf Wände schneiden');from=to;}
// Auch die Halle muss vom Garageninneren über Türen und Tischgänge erreichbar sein.
a=fresh();a.COL.push({x0:-6.125,x1:-5.875,z0:-5,z1:5},{x0:5.875,x1:6.125,z0:-5,z1:5},{x0:-6,x1:6,z0:-5.125,z1:-4.875},{x0:-6,x1:-1.5,z0:4.875,z1:5.125},{x0:1.5,x1:6,z0:4.875,z1:5.125},{x0:13.875,x1:14.125,z0:-14,z1:6},{x0:43.875,x1:44.125,z0:-14,z1:6},{x0:14,x1:44,z0:-14.125,z1:-13.875},{x0:14,x1:27,z0:5.875,z1:6.125},{x0:31,x1:44,z0:5.875,z1:6.125});for(let r=0;r<4;r++){const z=-11+r*4.2;a.COL.push({x0:17,x1:41,z0:z-.7,z1:z+.7});}for(let r=0;r<4;r++)for(let c=0;c<12;c++){let from={x:0,z:2};const route=a.staffRoute(from,{x:18+c*2,z:-11+r*4.2+1.15});assert.ok(route,'Jeder Hallenplatz braucht einen begehbaren Zugang');for(const to of route){assert.ok(a.staffLineClear(from,to));from=to;}}
console.log('PASS: Personalabläufe, Reservierungen, Budgets, Pause, Fahrzeugübernahme und 48 Hallen-Laufwege');
