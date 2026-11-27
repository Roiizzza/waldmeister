export const stations = {
  dock: {x:-20,z:0,name:'Laderampe',color:'#ffd261'},
  store: {x:-6,z:0,name:'Warenlager',color:'#8ce9ce'},
  magnet: {x:15,z:-2,name:'Magnetgreifer',color:'#fdb56f'},
  press: {x:24,z:-2,name:'Ballenausgabe',color:'#8ce9ce'},
  buyer: {x:31,z:8,name:'Metallhandel',color:'#ffd261'},
  booth: {x:-18,z:12,name:'Klonkabine',color:'#8ce9ce'},
  gate: {x:-12,z:0,name:'Rolltor',color:'#ffbc64'}
};
export const blocks = [
  [-26,-4,7,5],[-6,-6,10,7],[-18,15.5,5,4],[15,-6,6,5],[24,-6,6,5],[32,12,6,5],
  [-32,12,5,8],[4,14,7,5],[7,-9,4,5],[-12,-7,0.8,10],[-12,3.6,0.8,3.2]
];
export const bounds = [-36,38,-12,21];
export const prices = {cart:140, power:220,gate:90,bin:450};
const rad=.38;
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const pt=a=>({x:a.x,z:a.z});
export function blocked(x,z,s){
  if(x<bounds[0]||x>bounds[1]||z<bounds[2]||z>bounds[3])return true;
  return blocks.some(([cx,cz,w,h])=>Math.abs(x-cx)<w/2+rad&&Math.abs(z-cz)<h/2+rad)||
    (!s.up.gate&&Math.abs(x+12)<.82&&Math.abs(z)<2.42);
}
const worker=(x,z)=>({x,z,angle:Math.PI,cargo:'',qty:0});
export function newGame(){return {v:1,cash:0,sales:0,passive:0,stock:5,shelf:0,bales:0,charge:0,refill:0,ship:0,up:{},player:worker(-18,2),clones:[]};}
export function buy(s,key){
  if(key==='clone'){
    if(s.clones.length>=2)return 'Beide Klone sind bereits im Einsatz.';
    const price=s.clones.length?320:60;
    if(s.cash<price)return 'Dir fehlen '+(price-s.cash)+' Credits.';
    s.cash-=price;s.clones.push({...worker(-17+s.clones.length,12),mode:'idle',route:[],index:0,paid:0,wait:''});
    return '';
  }
  if(!(key in prices)||s.up[key])return 'Bereits freigeschaltet.';
  if(s.cash<prices[key])return 'Dir fehlen '+(prices[key]-s.cash)+' Credits.';
  s.cash-=prices[key];s.up[key]=true;return '';
}
export function tickGoods(s,dt){
  s.refill+=dt;s.ship+=dt;
  if(s.refill>=5){s.refill%=5;s.stock=Math.min(6,s.stock+1);}
  if(s.ship>=7){s.ship%=7;s.shelf=Math.max(0,s.shelf-3);}
  if(s.charge>0){s.charge=Math.max(0,s.charge-dt);if(!s.charge)s.bales++;}
}
export function job(s,a,id){
  if(dist(a,stations[id])>3.15)return 'Zu weit entfernt';
  const capacity=s.up.cart?3:1;
  if(id==='dock'){
    if(a.cargo&&a.cargo!=='box')return 'Hände belegt';
    if(a.qty>=capacity)return 'Transport voll';
    if(!s.stock)return 'Wartet auf Nachschub';
    a.cargo='box';a.qty++;s.stock--;return '';
  }
  if(id==='magnet'){
    if(!s.up.power)return 'Presse braucht Strom';
    if(s.charge>0)return 'Presse arbeitet';
    if(s.bales>=(s.up.bin?9:3))return 'Ballenausgabe voll';
    s.charge=4;return '';
  }
  if(id==='press'){
    if(a.qty)return 'Hände belegt';
    if(!s.bales)return 'Wartet auf Metallballen';
    s.bales--;a.cargo='bale';a.qty=1;return '';
  }
  if(id==='store'||id==='buyer'){
    const box=id==='store';
    if(a.cargo!==(box?'box':'bale'))return box?'Blaue Kiste benötigt':'Metallballen benötigt';
    if(box&&s.shelf+a.qty>(s.up.bin?18:6))return 'Warenlager voll';
    const amount=a.qty*(box?12:38);
    if(box)s.shelf+=a.qty;
    s.cash+=amount;s.sales+=a.qty;
    if(a!==s.player){s.passive+=amount;a.paid+=amount;}
    a.cargo='';a.qty=0;return '';
  }
  return 'Keine Arbeitsstation';
}
export function move(s,a,dx,dz){
  const ox=a.x,oz=a.z;
  if(!blocked(a.x+dx,a.z,s))a.x+=dx;
  if(!blocked(a.x,a.z+dz,s))a.z+=dz;
  if(Math.hypot(a.x-ox,a.z-oz)>.001)a.angle=Math.atan2(a.x-ox,a.z-oz);
}
function clearLine(s,a,b){
  const n=Math.ceil(dist(a,b)/.23);
  for(let i=1;i<=n;i++)if(blocked(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n,s))return false;
  return true;
}
// Connect replay endpoints using the same collision map as the player.
function connect(s,a,b){
  if(clearLine(s,a,b))return [pt(b)];
  const start={x:Math.round(a.x),z:Math.round(a.z)},key=p=>p.x+','+p.z;
  let queue=[start],prev=new Map([[key(start),null]]),end;
  for(let i=0;i<queue.length;i++){
    const p=queue[i];if(dist(p,b)<2&&clearLine(s,p,b)){end=p;break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const n={x:p.x+dx,z:p.z+dz},k=key(n);
      if(!prev.has(k)&&clearLine(s,i?p:a,n)){prev.set(k,p);queue.push(n);}
    }
  }
  if(!end)return [];
  let out=[pt(b)];while(prev.get(key(end))){out.unshift(end);end=prev.get(key(end));}
  return out;
}
export function stepClone(s,c,dt){
  if(!['trial','loop'].includes(c.mode)||!c.route.length)return;
  const goal=c.route[c.index];
  if(dist(c,goal)>.08){
    if(!c.path?.length)c.path=connect(s,c,goal);
    if(!c.path.length){c.wait='Weg blockiert';return;}
    const p=c.path[0],d=dist(c,p),f=Math.min(1,dt*3.6/(d||1));
    move(s,c,(p.x-c.x)*f,(p.z-c.z)*f);
    if(dist(c,p)<.06)c.path.shift();
    c.wait='';return;
  }
  c.path=[];
  if(goal.act){c.wait=job(s,c,goal.act);if(c.wait)return;}
  c.wait='';c.index++;
  if(c.index>=c.route.length){c.index=0;if(c.mode==='trial')c.mode='ready';}
}
export function recordPoint(route,a,act){
  if(!act&&route.length&&dist(route[route.length-1],a)<.52)return;
  route.push(act?{...pt(a),act}:pt(a));
}
export function finishRoute(s,c,route){
  if(!route.some(p=>p.act))return 'Führe erst einen Arbeitsschritt vor.';
  if(s.player.qty)return 'Liefere deine Ladung zuerst ab.';
  if(c.qty)return 'Beende zuerst den laufenden Transport.';
  c.route=route.slice();c.index=0;c.path=[];c.wait='';c.mode='trial';return '';
}
