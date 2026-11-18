import assert from 'node:assert/strict';
import {Game,freshProgress,distance,free} from '../engine.mjs';
for(let seed=1;seed<=6;seed++){
 const g=new Game(freshProgress(),null,seed);
 for(let i=0;i<16000;i++){
  const s=g.s,p=s.player;
  if(s.mode==='upgrade'){const priority=['chain','coil','saw','repair','armor','drive','pulse','capacitor'];g.choose(priority.find(id=>s.choices.includes(id)));continue;}
  if(s.mode!=='playing')break;
  const a=s.elapsed*.21,tx=Math.cos(a)*9,tz=Math.sin(a)*9;let dx=(tx-p.x)*.35,dz=(tz-p.z)*.35;
  for(const e of s.enemies){const d=distance(e,p);if(d<4.5){dx+=(p.x-e.x)/(d||1)*(4.5-d)*2;dz+=(p.z-e.z)/(d||1)*(4.5-d)*2;}}
  for(const b of s.bullets.filter(b=>b.enemy)){const d=distance(b,p);if(d<2.5){dx+=(p.x-b.x)/(d||1)*(2.5-d)*3;dz+=(p.z-b.z)/(d||1)*(2.5-d)*3;}}
  for(const h of s.hazards){if(h.kind==='circle'&&distance(h,p)<h.r+1){dx+=(p.x-h.x)/(distance(h,p)||1)*6;dz+=(p.z-h.z)/(distance(h,p)||1)*6;}}
  let angle=Math.atan2(dz,dx),best=-Infinity,bx=0,bz=0;
  for(let n=-4;n<=4;n++){const b=angle+n*Math.PI/8,x=Math.cos(b),z=Math.sin(b);if(!free(p.x+x*.8,p.z+z*.8))continue;const score=x*dx+z*dz;if(score>best){best=score;bx=x;bz=z;}}
  g.skill('pulse');if(p.ammo>=8&&g.nearest(p,12))g.skill('volley');if(s.enemies.filter(e=>distance(e,p)<7).length>=3||s.enemies.some(e=>e.type==='boss'&&distance(e,p)<8))g.skill('emp');
  g.tick(.05,{x:bx,z:bz});g.drain();
 }
 assert.equal(g.s.mode,'won','The base mech must be able to complete seed '+seed);
 console.log('PASS: base mech cleared seed '+seed+' in '+Math.floor(g.s.elapsed)+' simulated seconds.');
}
