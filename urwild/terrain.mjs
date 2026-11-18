import {START} from './data.mjs';
export const SIZE=768, CHUNK=64, WATER=0;
export function hash(a,b=0,c=0){let n=Math.imul(a|0,374761393)^Math.imul(b|0,668265263)^Math.imul(c|0,2147483647);n=(n^(n>>>13))*1274126177;return (n^(n>>>16))>>>0;}
export function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const smooth=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
function noise(x,z,seed){const xi=Math.floor(x),zi=Math.floor(z),fx=smooth(0,1,x-xi),fz=smooth(0,1,z-zi),v=(a,b)=>hash(a,b,seed)/4294967296;return (v(xi,zi)*(1-fx)+v(xi+1,zi)*fx)*(1-fz)+(v(xi,zi+1)*(1-fx)+v(xi+1,zi+1)*fx)*fz;}
export function coastRadius(a){return 329+12*Math.sin(a*3+.5)+8*Math.sin(a*7-1);}
export function shoreDistance(x,z){return coastRadius(Math.atan2(z,x))-Math.hypot(x,z);}
export function riverX(z){return 15+42*Math.sin(z/87);}
export function heightAt(x,z,seed=8137){const d=shoreDistance(x,z);if(d<0)return Math.max(-12,d*.13);const inland=smooth(0,40,d),h=noise(x/48,z/48,seed),fine=noise(x/17,z/17,seed+3);let y=smooth(0,32,d)*1.9+(h-.45)*4*inland+(fine-.5)*.85*inland;
 const mountain=smooth(40,220,-z)*smooth(-120,80,x)*inland;y+=mountain*(7+noise(x/70,z/70,seed+9)*15);
 if(d>33&&z> -210&&z<240){const rd=Math.abs(x-riverX(z)),channel=smooth(1,8,rd);const depth=Math.abs(z-46)<11?.05:-.65;y=(-.65+(y+.65)*channel);if(rd<4&&depth>.01)y=Math.max(.03,y);}
 return y;
}
export function biomeAt(x,z){const shore=shoreDistance(x,z);if(shore<34)return 'coast';if(z< -95||x>175)return 'highland';if(x> -70&&z<180)return 'jungle';return 'grass';}
export const BIOMES={coast:{name:'Bernsteinküste',grass:'#b7bb73',sand:'#dcc38c',rock:'#bca27a'},grass:{name:'Sonnenweiden',grass:'#86a760',sand:'#c9b581',rock:'#b2a383'},jungle:{name:'Smaragdforst',grass:'#668d51',sand:'#b4a978',rock:'#a19c7d'},highland:{name:'Steinkrone',grass:'#8d9a72',sand:'#b9ab8b',rock:'#969787'}};
export function chunkKey(x,z){return Math.floor(x/CHUNK)+','+Math.floor(z/CHUNK);}
export const START_NODES=[
 {id:'start-wood-1',kind:'branch',x:-268,z:160,amount:12},{id:'start-wood-2',kind:'branch',x:-274,z:153,amount:12},{id:'start-wood-3',kind:'branch',x:-264,z:155,amount:14},
 {id:'start-stone-1',kind:'loose',x:-273,z:163,amount:12},{id:'start-stone-2',kind:'loose',x:-266,z:163,amount:12},
 {id:'start-fiber-1',kind:'fiber',x:-267,z:157,amount:32},{id:'start-fiber-2',kind:'fiber',x:-275,z:157,amount:32},
 {id:'start-berries-1',kind:'bush',x:-263,z:153,amount:36},{id:'start-berries-2',kind:'bush',x:-266,z:148,amount:36},
 {id:'start-tree-1',kind:'tree',x:-258,z:157,amount:80},{id:'start-tree-2',kind:'palm',x:-276,z:150,amount:65},{id:'start-tree-3',kind:'tree',x:-257,z:148,amount:80},{id:'start-rock-1',kind:'rock',x:-263,z:166,amount:65}
];
export const START_DINOS=[
 {id:'farn',kind:'parasaur',name:'Farn',x:-281,z:151,level:2,starter:true},
 {id:'dodo-a',kind:'dodo',x:-275,z:146,level:1},{id:'dodo-b',kind:'dodo',x:-268,z:144,level:1},
 {id:'coast-para',kind:'parasaur',x:-238,z:170,level:3},
 {id:'first-trike',kind:'trike',x:-235,z:105,level:4}
];
export function nodesInChunk(cx,cz,seed){const rng=random(hash(cx,cz,seed)),nodes=[];for(let i=0;i<68;i++){const x=cx*CHUNK+rng()*CHUNK,z=cz*CHUNK+rng()*CHUNK;if(shoreDistance(x,z)<4||heightAt(x,z,seed)<.1||Math.hypot(x-START.x,z-START.z)<24)continue;const biome=biomeAt(x,z),q=rng();let kind=q<.32?(biome==='coast'?'palm':'tree'):q<.45?'bush':q<.63?'fiber':q<.76?'loose':q<.86?'branch':biome==='highland'&&q>.92?'ore':'rock';if(biome==='coast'&&kind==='tree')kind='palm';nodes.push({id:`n:${cx}:${cz}:${i}`,kind,x,z,amount:['tree','palm'].includes(kind)?70:kind==='rock'||kind==='ore'?60:kind==='bush'?30:18,scale:.8+rng()*.6,seed:Math.floor(rng()*9999)});}
 for(const n of START_NODES)if(Math.floor(n.x/CHUNK)===cx&&Math.floor(n.z/CHUNK)===cz)nodes.push({...n,scale:1,seed:123});return nodes;
}
export function wildInChunk(cx,cz,seed){const rng=random(hash(cx+100,cz-50,seed)),out=[];for(let i=0;i<3;i++){const x=cx*CHUNK+8+rng()*48,z=cz*CHUNK+8+rng()*48;if(shoreDistance(x,z)<8||heightAt(x,z,seed)<.1||Math.hypot(x-START.x,z-START.z)<58)continue;const biome=biomeAt(x,z),pool=biome==='coast'?['dodo','parasaur','parasaur']:biome==='grass'?['parasaur','trike','stego']:biome==='jungle'?['raptor','raptor','parasaur']:['anky','trike','rex'];const kind=pool[Math.floor(rng()*pool.length)];out.push({id:`w:${cx}:${cz}:${i}`,kind,x,z,level:(biome==='highland'?7:biome==='jungle'?3:1)+Math.floor(rng()*4)});}
 for(const d of START_DINOS)if(Math.floor(d.x/CHUNK)===cx&&Math.floor(d.z/CHUNK)===cz)out.push({...d});return out;
}
export const LANDMARKS=[{id:'camp',name:'Bernsteinbucht',x:START.x,z:START.z,desc:'Ein geschützter Küstenbogen für dein erstes Lager.'},{id:'ford',name:'Die Flussfurt',x:riverX(46),z:46,desc:'Flaches Wasser verbindet die Ufer des Smaragdforsts.'},{id:'ruins',name:'Vergessene Säulen',x:-72,z:17,desc:'Moos überwuchert die Reste einer alten Anlage.'},{id:'ore',name:'Die Steinkrone',x:180,z:-175,desc:'Reiche Erzadern und große Tiere im Hochland.'},{id:'meadow',name:'Sonnenweiden',x:-125,z:130,desc:'Offene Wiesen, Beeren und schwere Pflanzenfresser.'}];
